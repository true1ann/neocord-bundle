import { after } from "@lib/api/patcher";
import { _lazyContextSymbol } from "@metro/lazy";
import { findByNameLazy, findByPropsLazy } from "@metro/wrappers";

export default function wrapSafeAreaProvider() {
    const { SafeAreaProvider } = findByPropsLazy('useSafeAreaInsets');

    return after("default", findByNameLazy('App', false), function (_, ret) {
        return (
            <SafeAreaProvider>
                {ret}
            </SafeAreaProvider>
        )
    });
}
