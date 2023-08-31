import {CSSProperties} from 'react';

type TextUnderlineStyles = {
    textUnderlinePositionUnder: Pick<CSSProperties, 'textUnderlinePosition'>;
    textDecorationSkipInkNone: Pick<CSSProperties, 'textDecorationSkipInk'>;
};

export default TextUnderlineStyles;
