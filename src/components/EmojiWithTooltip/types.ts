import type {StyleProp, TextStyle} from 'react-native';

type EmojiWithTooltipProps = {
    emojiCode: string;
    style?: StyleProp<TextStyle>;
    isMedium?: boolean;
    oneLine?: boolean;
};

export default EmojiWithTooltipProps;
