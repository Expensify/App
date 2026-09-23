import type {StyleProp, TextStyle} from 'react-native';

type TextWithEmojiFragmentProps = {
    message?: string;
    style?: StyleProp<TextStyle>;

    /** Whether the text is alternate text */
    alignCustomEmoji?: boolean;
};

export default TextWithEmojiFragmentProps;
