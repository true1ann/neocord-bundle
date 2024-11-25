import patchErrorBoundary from "@core/debug/patches/patchErrorBoundary";
import wrapSafeAreaProvider from "@core/patches/wrapSafeAreaProvider";
import initFixes from "@core/fixes";
import { initFetchI18nStrings } from "@core/i18n";
import initSettings from "@core/ui/settings";
import { initVendettaObject } from "@core/vendetta/api";
import { VdPluginManager } from "@core/vendetta/plugins";
import { updateFonts } from "@lib/addons/fonts";
import { initPlugins, updatePlugins } from "@lib/addons/plugins";
import { initThemes, patchChatBackground } from "@lib/addons/themes";
import { patchCommands } from "@lib/api/commands";
import { patchLogHook } from "@lib/api/debug";
import { injectFluxInterceptor } from "@lib/api/flux";
import { writeFile } from "@lib/api/native/fs";
import { isPyonLoader, isThemeSupported } from "@lib/api/native/loader";
import { patchJsx } from "@lib/api/react/jsx";
import { logger } from "@lib/utils/logger";
import { patchSettings } from "@ui/settings";
import { settings } from "@lib/api/settings";

import * as lib from "./lib";

async function maybeLoadThemes() {
    if (!isThemeSupported()) return;

    try {
        if (isPyonLoader()) {
            await writeFile("../vendetta_theme.json", "null");
        }
        await initThemes();
    } catch (e) {
        console.error("Failed to initialize themes", e);
    }
}

async function waitForSetting(setting: string, maxAttempts: number, delay: number): Promise<any> {
    let attempts = 0;
    while (settings[setting] === undefined && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return settings[setting];
}

export default async () => {
    await maybeLoadThemes();

    // Load everything in parallel
    await Promise.all([
        wrapSafeAreaProvider(),
        injectFluxInterceptor(),
        patchSettings(),
        patchLogHook(),
        patchCommands(),
        patchChatBackground(),
        patchJsx(),
        initVendettaObject(),
        initFetchI18nStrings(),
        initFixes(),
        initSettings(),
        updatePlugins()
    ]).then(
        // Push them all to unloader
        u => u.forEach(f => f && lib.unload.push(f))
    );

    // Assign window object
    window.bunny = lib;

    // Once done, load Vendetta plugins
    try {
        const vendettaPlugins = await VdPluginManager.initPlugins();
        lib.unload.push(vendettaPlugins);
    } catch {
        alert("Failed to initialize Vendetta plugins");
    }

    // Load Bunny plugins
    initPlugins();

    // Update the fonts
    updateFonts();

    // Wait for the setting to be defined
    const ncinit_doPatchErrorBoundary = await waitForSetting('doPatchErrorBoundary', 100, 100);

    if (ncinit_doPatchErrorBoundary === undefined) {
        logger.log("Reached maximum attempts, trying to get with eval()");
        const evalResult = eval(vendetta.settings.doPatchErrorBoundary);
        if (evalResult) {
            const u = await patchErrorBoundary();
            u && lib.unload.push(u);
        }
    } else {
        logger.log("Reached maximum attempts, but value is valid.");
        if (ncinit_doPatchErrorBoundary) {
            const u = await patchErrorBoundary();
            u && lib.unload.push(u);
        } else {
            logger.log("errorBoundary is NOT patched. You can change this behaviour in Developer settings.");
        }
    }

    // We good :)
    logger.log("NeoCord is ready!");
};
