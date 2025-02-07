import React, { useState } from "react";
import { ScrollView, View, Switch, Text } from "react-native";
import { TextInput, Button } from "@metro/common/components";
import { findByPropsLazy, findByProps } from "@metro/wrappers";
import { clipboard } from "@metro/common";
import { lazyDestructure } from "@lib/utils/lazy";
import { findAssetId } from "@lib/api/assets";

const util = findByPropsLazy("inspect");
const AsyncFunction = (async () => void 0).constructor;

const { AlertModal, AlertActionButton } = lazyDestructure(() => findByProps("AlertModal", "AlertActions"));

const ZERO_WIDTH_SPACE_CHARACTER = "\u200B";

function wrapInJSCodeblock(resString: string) {
  return "```js\n" + resString.replaceAll("`", "`" + ZERO_WIDTH_SPACE_CHARACTER) + "\n```";
}

export default function EvalMenu() {
  const [code, setCode] = useState("");
  const [isAsync, setIsAsync] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [evalResult, setEvalResult] = useState("");

  const handleEval = async () => {
    try {
      const res = util.inspect(isAsync ? await AsyncFunction(code)() : eval?.(code));
      const trimmedRes = res.length > 2000 ? res.slice(0, 2000) + "..." : res;
      setEvalResult(trimmedRes);
      setModalVisible(true);
    } catch (err: any) {
      setEvalResult(err?.stack ?? err);
      setModalVisible(true);
    }
  };

  const handleCopy = () => {
    clipboard.setString(evalResult);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <TextInput
        multiline
        placeholder="Enter your code here"
        value={code}
        onChange={setCode}
        grow={true}
        isClearable={true}
        size="lg"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Switch
          value={isAsync}
          onValueChange={setIsAsync}
        />
      </View>
      <Button
        size="sm"
        variant="primary"
        text="Eval"
        icon={findAssetId("ic_application_icon_24px")}
        onPress={handleEval}
      />
      {modalVisible && (
        <AlertModal
          title="Eval Result"
          body={wrapInJSCodeblock(evalResult)}
          buttons={[
            {
              text: "Copy",
              onPress: handleCopy,
            },
            {
              text: "Close",
              onPress: () => setModalVisible(false),
            },
          ]}
        />
      )}
    </ScrollView>
  );
}