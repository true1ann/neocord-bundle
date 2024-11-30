import { logger } from "@lib/utils/logger";
import { FluxDispatcher, i18n } from "@metro/common";
import { findByNameLazy } from "@metro/wrappers";
import { PrimitiveType } from "intl-messageformat";

import langDefault from "./default.json";

const IntlMessageFormat = findByNameLazy("MessageFormat") as typeof import("intl-messageformat").default;

type I18nKey = keyof typeof langDefault;

let _currentLocale: string | null = null;
let _loadedStrings = {} as Record<string, typeof langDefault>;

export const Strings = new Proxy({}, {
    get: (_t, prop: keyof typeof langDefault) => {
        return _loadedStrings[_currentLocale]?.[prop] || langDefault[prop];
    }
}) as Record<I18nKey, string>;

export function initFetchI18nStrings() {
    const cb = async () => {
        const discordLocale = i18n.getLocales(); // Nexx, thank you
        console.log(`Loading locale strings for: ${discordLocale}`);

        // Load default strings
        _loadedStrings[discordLocale] = { ...langDefault };

        try {
            // Attempt to load the locale for User's language
            const localFileResponse = await fetch(`./${discordLocale}.json`);
            if (localFileResponse.ok) {
                const strings = await localFileResponse.json();
                // Overwrite default strings with found locale
                _loadedStrings[discordLocale] = { ..._loadedStrings[discordLocale], ...strings };
                _currentLocale = discordLocale;
            } else {
		// TODO: Remote fetching the locale (just as Bunny did)
                console.log(`Locale file not found for ${discordLocale}, using default strings.`);
            }
        } catch (e) {
            console.error(`Error fetching local file for ${discordLocale}: ${e}`);
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
