import { ApplicationCommand, ApplicationCommandOptionType } from "@lib/api/commands/types";
import { messageUtil } from "@metro/common";

export default () => <ApplicationCommand>{
    name: "aboutnc",
    description: "Tell people NCs About and send a download link",
    options: [],
    execute([], ctx) {
        const content = [
            "**What is NeoCord?**",
            "NeoCord is a fork of Revenge, with additional and experimental features.",
            "Some of 'Experimental features':",
            "- Permissions",
            "- Loaders",
            "More will come over time.",
            "You can read more and download it [here](https://github.com/true1ann/neocord-bundle) (GitHub)."
        ].join("\n");

        messageUtil.sendMessage(ctx.channel.id, { content });
    }
};
