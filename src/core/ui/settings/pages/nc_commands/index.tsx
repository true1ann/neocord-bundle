import { View, Text } from "react-native";

function UnimplementedPage() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text variant="heading-lg/bold">Unimplemented</Text>
        </View>
    );
}

export default function Unimplemented() {
	return <UnimplementedPage />;
}
