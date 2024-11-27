import { Strings } from "@core/i18n";
import { hasStack, isComponentStack } from "@core/ui/reporter/utils/isStack";
import { getDebugInfo, toggleSafeMode } from "@lib/api/debug";
import { BundleUpdaterManager } from "@lib/api/native/modules";
import { settings } from "@lib/api/settings";
import { Codeblock, ErrorBoundary } from "@lib/ui/components";
import { createStyles } from "@lib/ui/styles";
import { tokens } from "@metro/common";
import { Button, Card, SafeAreaView, Text } from "@metro/common/components";
import { ScrollView, View } from "react-native";
import { clipboard } from "@metro/common";

import ErrorComponentStackCard from "./ErrorComponentStackCard";
import ErrorStackCard from "./ErrorStackCard";

const useStyles = createStyles({
    container: {
        flex: 1,
        backgroundColor: tokens.colors.BG_BASE_SECONDARY,
        paddingHorizontal: 16,
        height: "100%",
        gap: 12
    }
});

export default function ErrorBoundaryScreen(props: {
    error: Error;
    rerender: () => void;
}) {
    const styles = useStyles();
    const debugInfo = getDebugInfo();

    return <ErrorBoundary>
        <SafeAreaView style={styles.container}>
            <View style={{ gap: 4 }}>
                <Text variant="display-lg">{Strings.UH_OH}</Text>
                <Text variant="text-md/normal">{Strings.CRASH_HEADER}</Text>
                <Text variant="text-sm/normal" color="text-muted">{debugInfo.os.name}; {debugInfo.discord.build} ({debugInfo.discord.version}); {debugInfo.bunny.version}</Text>
            </View>
            <ScrollView fadingEdgeLength={64} contentContainerStyle={{ gap: 12 }}>
                <Codeblock selectable={true}>{props.error.message}</Codeblock>
                {hasStack(props.error) && <ErrorStackCard error={props.error} />}
                {isComponentStack(props.error) ? <ErrorComponentStackCard componentStack={props.error.componentStack} /> : null}
            </ScrollView>
            <Card style={{ gap: 6 }}>
                <Button variant="primary" text={Strings.RETRY_RENDER} onPress={() => props.rerender()} />
                {!settings.safeMode?.enabled && <Button variant="secondary" text={Strings.RELOAD_IN_SAFE_MODE} onPress={() => toggleSafeMode()} />}
                <Button variant="destructive" text={Strings.RELOAD_DISCORD} onPress={() => BundleUpdaterManager.reload()} />
            </Card>
        </SafeAreaView>
    </ErrorBoundary>;
}
