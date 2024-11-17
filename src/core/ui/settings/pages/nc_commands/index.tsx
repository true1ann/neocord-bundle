import React from 'react';
import { View } from 'react-native';
import { Card, Button, Text } from '@metro/common/components';
import { lazyDestructure } from "@lib/utils/lazy";

const { openAlert } = lazyDestructure(() => findByProps("openAlert", "dismissAlert"));
const { AlertModal, AlertActions, AlertActionButton } = lazyDestructure(() => findByProps("AlertModal", "AlertActions"));

export default function main() {
    const showAlert = () => {
        openAlert("test-alert", (
            <AlertModal
                title="Test"
                content="This is a test popup."
                actions={
                    <AlertActions>
                        <AlertActionButton text="Dismiss" variant="primary" onPress={() => { /* Dismiss action */ }} />
                    </AlertActions>
                }
            />
        ));
    };

    return (
        <View style={{ padding: 16 }}>
            <Card>
                <View style={{ padding: 16 }}>
                    <Text variant="heading-md/semibold">Sample Card</Text>
                    <Text variant="text-md/medium">This is a sample card with a button.</Text>
                    <Button
                        size="lg"
                        text="Open Popup"
                        onPress={showAlert}
                        variant="primary"
                    />
                </View>
            </Card>
        </View>
    );
}
