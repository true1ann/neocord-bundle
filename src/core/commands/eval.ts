import { Strings } from "@core/i18n";
import { ApplicationCommand, ApplicationCommandOptionType } from "@lib/api/commands/types";
import { settings } from "@lib/api/settings";
import { messageUtil } from "@metro/common";
import { findByPropsLazy } from "@metro/wrappers";

const util = findByPropsLazy("inspect");
const AsyncFunction = (async () => void 0).constructor;

const ZERO_WIDTH_SPACE_CHARACTER = "\u200B";

function wrapInJSCodeblock(resString: string) {
    return "```js\n" + resString.replaceAll("`", "`" + ZERO_WIDTH_SPACE_CHARACTER) + "\n```";
}

export default () => <ApplicationCommand>{
    name: "eval",
    description: Strings.COMMAND_EVAL_DESC,
    shouldHide: () => settings.enableEvalCommand === true,
    options: [
        {
            name: "code",
            type: ApplicationCommandOptionType.STRING,
            description: Strings.COMMAND_EVAL_OPT_CODE,
            required: true
        },
        {
            name: "async",
            type: ApplicationCommandOptionType.BOOLEAN,
            description: Strings.COMMAND_EVAL_OPT_ASYNC,
        },
        {
            name: "ephemeral",
            type: ApplicationCommandOptionType.BOOLEAN,
            description: Strings.COMMAND_DEBUG_OPT_EPHEMERALLY,
        }
    ],
    async execute([code, async, ephemeral], ctx) {
        try {
            const res = util.inspect(async?.value ? await AsyncFunction(code.value)() : eval?.(code.value));
            const trimmedRes = res.length > 2000 ? res.slice(0, 2000) + "..." : res;

            if (ephemeral?.value) {
                messageUtil.sendBotMessage(ctx.channel.id, wrapInJSCodeblock(trimmedRes));
            } else {
                messageUtil.sendMessage(ctx.channel.id, { content: wrapInJSCodeblock(trimmedRes) });
            }
        } catch (err: any) {
            messageUtil.sendBotMessage(ctx.channel.id, wrapInJSCodeblock(err?.stack ?? err));
        }
    }
};
