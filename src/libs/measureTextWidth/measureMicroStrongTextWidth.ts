import {textVariants} from '@styles/typography';

import measureTextWidth from './index';

/**
 * Measures how wide `text` renders in the bold micro font that table headings and badges use, or `null` when the
 * platform can't measure text.
 */
function measureMicroStrongTextWidth(text: string): number | null {
    return measureTextWidth(text, {fontSize: textVariants.microStrong.fontSize, fontWeight: '700'});
}

export default measureMicroStrongTextWidth;
