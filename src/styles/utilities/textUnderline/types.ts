import {CSSProperties} from 'react';

type TextUnderlineStyles = Record<'textUnderlinePositionUnder' | 'textDecorationSkipInkNone', Partial<Pick<CSSProperties, 'textUnderlinePosition' | 'textDecorationSkipInk'>>>;

export default TextUnderlineStyles;
