import type {TextStyle} from 'react-native';

type TextUnderlineStyles = {
    textUnderlinePositionUnder: Pick<TextStyle, 'textUnderlinePosition'>;
    textDecorationSkipInkNone: Pick<TextStyle, 'textDecorationSkipInk'>;
};

export default TextUnderlineStyles;
