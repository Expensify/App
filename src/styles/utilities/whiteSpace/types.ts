import {CSSProperties} from 'react';

type WhiteSpaceStyles = Record<'noWrap' | 'preWrap' | 'pre', Partial<Pick<CSSProperties, 'whiteSpace'>>>;

export default WhiteSpaceStyles;
