import {CSSProperties} from 'react';

type TextUnderlineStyles = Partial<Record<'textUnderlinePositionUnder' | 'textDecorationSkipInkNone', Partial<Pick<CSSProperties, 'textUnderlinePosition' | 'textDecorationSkipInk'>>>>;

export default TextUnderlineStyles;
