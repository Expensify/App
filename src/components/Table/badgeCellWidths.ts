/**
 * Widths of a badge rendered after a cell's text, for columns sized from their content. A badge never truncates, so a
 * column holding one has to keep room for all of it.
 */
import measureMicroStrongTextWidth from '@libs/measureTextWidth/measureMicroStrongTextWidth';

import type {ThemeStyles} from '@styles/index';

/**
 * How wide a badge renders after a cell's text, including the gap before it. 0 when the platform can't measure text,
 * since no column is sized from its content there.
 */
function getBadgeWidth(styles: ThemeStyles, label: string, iconWidth = 0): number {
    const labelWidth = measureMicroStrongTextWidth(label);

    if (labelWidth === null) {
        return 0;
    }

    return styles.gap2.gap + styles.defaultBadge.paddingHorizontal * 2 + styles.defaultBadge.borderWidth * 2 + iconWidth + labelWidth;
}

/**
 * The narrowest a drag may make a column whose text ends in a badge: everything before the text, plus the widest badge
 * any row shows, since only the text truncates. `undefined` when no row shows a badge, so the usual drag bound applies.
 */
function getBadgeColumnDragMinWidth(shownBadgeWidths: number[], leadingWidth = 0): number | undefined {
    if (shownBadgeWidths.length === 0) {
        return undefined;
    }

    return Math.ceil(leadingWidth + Math.max(...shownBadgeWidths));
}

export {getBadgeColumnDragMinWidth, getBadgeWidth};
