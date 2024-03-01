import type {Emoji} from "@assets/emojis/types";
import type IconAsset from "@src/types/utils/IconAsset";

type EmojiPickerMenuProps = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: (emoji: string, emojiObject: Emoji) => void,

    activeEmoji?: string,
};

type RenderItemProps = {

    item: Emoji & {
        spacer?: boolean,

        header?: boolean,
    }

    target: string,

    index?: number
}

type EmojiPropTypes ={code: string; index: number; icon: IconAsset};

export type {EmojiPickerMenuProps, RenderItemProps, EmojiPropTypes};
