import type {StyleProp, TextStyle} from 'react-native';

type EmojiWithTooltipProps = {
    emojiCode: string;
    style?: StyleProp<TextStyle>;
    isMedium?: boolean;
    isOnSeparateLine?: boolean;
};

export default EmojiWithTooltipProps;
