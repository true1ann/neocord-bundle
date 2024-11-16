import { ComponentProps } from "react";
import { View } from "react-native";
import { Card, FlashList, IconButton, Text } from "@metro/common/components";
const { openAlert } = lazyDestructure(() => findByProps("openAlert", "dismissAlert"));
const { AlertModal, AlertActions, AlertActionButton } = lazyDestructure(() => findByProps("AlertModal", "AlertActions"));

export default function main() {
    return (
        openAlert("nc-test", 
            <AlertModal
                title="Hold On!"
                content="Test"
                extraContent={
                    <Card>
                        <Text variant="text-md/bold">Extra text</Text>
                    </Card>
                }
                actions={
                    <AlertActions>
                        <AlertActionButton text="Close" variant="primary" />
                    </AlertActions>
                }
            />
        )
    );
}
