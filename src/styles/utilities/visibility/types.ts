import {CSSProperties} from 'react';

type VisibilityStyles = Record<'visible' | 'hidden', Partial<Pick<CSSProperties, 'visibility'>>>;

export default VisibilityStyles;
