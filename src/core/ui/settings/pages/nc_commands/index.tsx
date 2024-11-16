import { ComponentProps } from "react";
import { View, Text } from "react-native";

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
