import {CSSProperties} from 'react';

type WordBreakStyles = Record<'breakWord' | 'breakAll', Partial<Pick<CSSProperties, 'wordBreak' | 'alignmentBaseline'>>>;

export default WordBreakStyles;
