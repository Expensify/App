import type {StyleProp, TextStyle} from 'react-native';

type TextWithEmojiFragmentProps = {
    /** The message to be displayed */
    message?: string;

    /** Any additional styles to apply */
    style: StyleProp<TextStyle>;
};

export default TextWithEmojiFragmentProps;
