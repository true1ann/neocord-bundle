import { logger } from "@lib/utils/logger";
import { FluxDispatcher } from "@metro/common";
import { findByNameLazy } from "@metro/wrappers";
import { PrimitiveType } from "intl-messageformat";

import langDefault from "./default.json";

const IntlMessageFormat = findByNameLazy("MessageFormat") as typeof import("intl-messageformat").default;

type I18nKey = keyof typeof langDefault;

let _currentLocale: string | null = null;
let _lastSetLocale: string | null = null;

const _loadedLocale = new Set<string>();
const _loadedStrings = {} as Record<string, typeof langDefault>;

export const Strings = new Proxy({}, {
    get: (_t, prop: keyof typeof langDefault) => {
        if (_currentLocale && _loadedStrings[_currentLocale]?.[prop]) {
            return _loadedStrings[_currentLocale]?.[prop];
        }
        return langDefault[prop];
    }
}) as Record<I18nKey, string>;

export function initFetchI18nStrings() {
    const cb = async ({ locale }: { locale: string; }) => {
        const languageMap = {
            "es-ES": "es",
            "es-419": "es_419",
            "zh-TW": "zh-Hant",
            "zh-CN": "zh-Hans",
            "pt-PT": "pt",
            "pt-BR": "pt_BR",
            "sv-SE": "sv",
            "ru-ru": "ru"
        } as Record<string, string>;

        const resolvedLocale = _lastSetLocale = languageMap[locale] ?? locale;

		logger.log(`LOCALES: ${resolvedLocale} | ${_currentLocale}`)

        if (resolvedLocale.startsWith("en-")) {
            _currentLocale = null;
            return;
        }

        if (!_loadedLocale.has(resolvedLocale)) {
            _loadedLocale.add(resolvedLocale);
            
            try {
                const localFileResponse = await fetch(`./${resolvedLocale}.json`);
                if (localFileResponse.ok) {
                    const strings = await localFileResponse.json();
                    _loadedStrings[resolvedLocale] = strings;
                    _currentLocale = resolvedLocale;
                    return;
                }
            } catch (e) {
                console.error(`Error fetching local file for ${resolvedLocale}: ${e}`);
            }
            
            fetch(`https://raw.githubusercontent.com/pyoncord/i18n/main/resources/${resolvedLocale}/bunny.json`)
                .then(r => r.json())
                .then(strings => {
                    _loadedStrings[resolvedLocale] = strings;
                    if (resolvedLocale === _lastSetLocale) {
                        _currentLocale = resolvedLocale;
                    }
                })
                .catch(e => console.error(`An error occurred while fetching strings for ${resolvedLocale}: ${e}`));
        } else {
            _currentLocale = resolvedLocale;
        }
    };

    FluxDispatcher.subscribe("I18N_LOAD_SUCCESS", cb);
    return () => FluxDispatcher.unsubscribe("I18N_LOAD_SUCCESS", cb);
}

type FormatStringRet<T> = T extends PrimitiveType ? string : string | T | (string | T)[];

export function formatString<T = void>(key: I18nKey, val: Record<string, T>): FormatStringRet<T> {
    const str = Strings[key];
    // @ts-ignore
    return new IntlMessageFormat(str).format(val);
}
