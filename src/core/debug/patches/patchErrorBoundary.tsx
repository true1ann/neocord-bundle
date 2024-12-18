import ErrorBoundaryScreen from "@core/ui/reporter/components/ErrorBoundaryScreen";
import { after } from "@lib/api/patcher";
import { _lazyContextSymbol } from "@metro/lazy";
import { LazyModuleContext } from "@metro/types";
import { findByNameLazy } from "@metro/wrappers";
import { useProxy } from "@core/vendetta/storage";
import { settings } from "@lib/api/settings";
import { logger } from "@lib/utils/logger";

function getErrorBoundaryContext() {
    const ctxt: LazyModuleContext = findByNameLazy("ErrorBoundary")[_lazyContextSymbol];
    return new Promise(resolve => ctxt.getExports(exp => resolve(exp.prototype)));
}

export default function patchErrorBoundary() {
    return after.await("render", getErrorBoundaryContext(), function (this: any, ret: any) {
        if (!this.state.error) return;

        return <ErrorBoundaryScreen
                error={this.state.error}
                rerender={() => this.setState({ info: null, error: null })}
            />;
    });
}
