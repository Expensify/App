import type {ForwardedRef} from 'react';
import type {Emoji} from '@assets/emojis/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

type EmojiPickerMenuProps = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: (emoji: string, emojiObject: Emoji, preferredSkinTone: number) => void;

    activeEmoji?: string;

    /** Reference to the outer element */
    ref?: ForwardedRef<BaseTextInputRef>;
};

export default EmojiPickerMenuProps;
