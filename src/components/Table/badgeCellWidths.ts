/**
 * Widths of a badge rendered after a cell's text, for columns sized from their content. A badge never truncates, so a
 * column holding one has to keep room for all of it.
 */
import measureTextWidth from '@libs/measureTextWidth';

import type {ThemeStyles} from '@styles/index';
import {fontScale} from '@styles/typography';

/** What a badge adds around its label: the gap2 before it, plus its padding and border on both sides. */
function getBadgeChromeWidth(styles: ThemeStyles): number {
    return styles.gap2.gap + styles.defaultBadge.paddingHorizontal * 2 + styles.defaultBadge.borderWidth * 2;
}

/** How wide a badge label renders in the bold small font badges use, or 0 when the platform can't measure text. */
function measureBadgeLabelWidth(label: string): number {
    return measureTextWidth(label, {fontSize: fontScale.micro, fontWeight: '700'}) ?? 0;
}

/**
 * The narrowest a drag may make a column whose name ends in a badge: everything before the name, plus the badge's chrome
 * and its widest variant in full, since only the name truncates. `undefined` when no row shows a badge, so the usual drag
 * bound applies.
 */
function getBadgeColumnDragMinWidth(styles: ThemeStyles, leadingWidth: number, shownBadgeWidths: number[]): number | undefined {
    if (shownBadgeWidths.length === 0) {
        return undefined;
    }

    return Math.ceil(leadingWidth + getBadgeChromeWidth(styles) + Math.max(...shownBadgeWidths));
}

export {getBadgeChromeWidth, getBadgeColumnDragMinWidth, measureBadgeLabelWidth};
