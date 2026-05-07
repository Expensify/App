import type {StyleProp, TextStyle} from 'react-native';

type TextWithEmojiFragmentProps = {
    /** The message to be displayed */
    message?: string;

    /** Any additional styles to apply */
    style?: StyleProp<TextStyle>;

    /** Whether the text is alternate text */
    alignCustomEmoji?: boolean;
};

export default TextWithEmojiFragmentProps;
