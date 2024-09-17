import AssetDisplay from "@core/ui/settings/pages/Developer/AssetDisplay";
import { assetsMap } from "@lib/api/assets";
import { ErrorBoundary, Search } from "@ui/components";
import { FlatList, View } from "react-native";

export default function AssetBrowser() {
    const [search, setSearch] = React.useState("");

    return (
        <ErrorBoundary>
            <View style={{ flex: 1 }}>
                <Search
                    style={{ margin: 10 }}
                    onChangeText={(v: string) => setSearch(v)}
                />
                <View style={{ flex: 1, borderRadius: 16, paddingHorizontal: 12, overflow: 'hidden', backgroundColor: 'transparent' }}>
                    <FlatList
                        data={Object.values(assetsMap).filter(a => a.name.includes(search) || a.id.toString() === search)}
                        renderItem={({ item }: any) => <AssetDisplay asset={item} />}
                        contentContainerStyle={{ overflow: 'hidden', backgroundColor: 'transparent', borderRadius: 16 }}
                    />
                </View>
            </View>
        </ErrorBoundary>
    );
}
