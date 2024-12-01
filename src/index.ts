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
import { connectToDebugger } from "@lib/api/debug";
import { getReactDevToolsProp, isReactDevToolsPreloaded } from "@lib/api/native/loader";
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

async function ncinit_settings(maxAttempts: number, delay: number): Promise<any> {
    let attempts = 0;
    while (Object.values(settings).some(value => value === undefined) && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    logger.log('Settings are initialized.')
    return settings;
}

export default async () => {
    await maybeLoadThemes();
    const ncvar_settings = await ncinit_settings(100, 100); // may migrate to using settings directly later.

    // Check and connect to Debug WebSocket if enabled
    if (ncvar_settings.autoConnectToDebugWS) {
        connectToDebugger(ncvar_settings.debuggerUrl);
    }

    // Check and connect to RN DevTools if preloaded and enabled
    if (isReactDevToolsPreloaded() && ncvar_settings.autoConnectToRNDevTools) {
        window[getReactDevToolsProp() || "__vendetta_rdc"]?.connectToDevTools({
            host: ncvar_settings.debuggerUrl.split(":")?.[0],
            resolveRNStyle: StyleSheet.flatten,
        });
    }
    // Please report any bugs related to this, i never used RN DevTools

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
        updatePlugins(),
    ]).then(
        // Push them all to unloader
        u => u.forEach(f => f && lib.unload.push(f))
    );

    // Patch errorBoundary
    if (ncvar_settings.doPatchErrorBoundary) {
        const u = await patchErrorBoundary();
        u && lib.unload.push(u);
    } else {
        logger.log("errorBoundary is NOT patched. You can change this behaviour in Developer settings.");
    }

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

    // We good :)
    logger.log("NeoCord is ready!");
    console.log("NeoCord is ready!");
};
