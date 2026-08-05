/**
 * Sizing constraints for a single dynamically sized column.
 */
type DynamicColumnConstraints = {
    /** Width the column's widest content needs in order to render untruncated, including non-text extras like avatars. */
    contentWidth: number;

    /** Smallest width the column may shrink to. Below the sum of these, the table has to scroll horizontally. */
    minWidth: number;

    /** Largest width the column may claim, so a single very long value can't starve its siblings. */
    maxWidth: number;
};

/**
 * The layout the dynamic columns resolved to.
 */
type CalculatedDynamicColumnWidths = {
    /**
     * Resolved px width per column, in input order. Empty when the columns should keep equal `1fr` tracks, which is the
     * case when every column's content fits inside an equal share of the available width.
     */
    widths: number[];

    /**
     * Whether the columns had to be pinned to their minimum widths because they cannot all fit, meaning the caller has
     * to let the table scroll horizontally.
     */
    shouldScrollHorizontally: boolean;
};

const EQUAL_WIDTHS: CalculatedDynamicColumnWidths = {widths: [], shouldScrollHorizontally: false};

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function sum(values: number[]): number {
    return values.reduce((total, value) => total + value, 0);
}

/**
 * Rounds widths down to whole px and hands the rounding remainder to the widest column, so the columns add up to
 * exactly `availableWidth` and no sub-pixel gap is left at the end of the row.
 */
function roundWidths(widths: number[], availableWidth: number): number[] {
    const roundedWidths = widths.map((width) => Math.floor(width));
    const remainder = availableWidth - sum(roundedWidths);

    if (remainder <= 0) {
        return roundedWidths;
    }

    const widestColumnIndex = roundedWidths.indexOf(Math.max(...roundedWidths));
    roundedWidths[widestColumnIndex] += remainder;

    return roundedWidths;
}

/**
 * Resolves the widths of a table's dynamically sized columns from what their content needs and how much room the table
 * has, implementing three behaviors in order:
 *
 * 1. Every column's content fits inside an equal share of the available width, so the columns stay equal (`1fr`).
 * 2. The content fits overall but unevenly, so each column takes what it needs and the leftover space is shared out in
 *    proportion to what each column asked for. A column with long content grows and its short-content siblings shrink.
 *    Sharing the leftover equally instead would pad a short column with space it has nothing to put in.
 * 3. The content does not fit, so every column shrinks toward its minimum width in proportion to how much slack it has.
 *    Once even the minimum widths don't fit, the columns are pinned to those minimums and the table scrolls.
 *
 * @param constraints - Sizing constraints per column, in column order.
 * @param availableWidth - Width the dynamic columns share, i.e. the row's width minus padding, gaps, and any
 * fixed-width columns.
 */
function calculateDynamicColumnWidths(constraints: DynamicColumnConstraints[], availableWidth: number): CalculatedDynamicColumnWidths {
    if (constraints.length === 0 || availableWidth <= 0) {
        return EQUAL_WIDTHS;
    }

    const minWidths = constraints.map((constraint) => constraint.minWidth);
    const desiredWidths = constraints.map((constraint, index) => clamp(constraint.contentWidth, minWidths.at(index) ?? 0, Math.max(constraint.maxWidth, minWidths.at(index) ?? 0)));

    // 1. Equal columns already give every column enough room, so nothing needs resizing.
    const equalShare = availableWidth / constraints.length;
    if (desiredWidths.every((desiredWidth) => desiredWidth <= equalShare)) {
        return EQUAL_WIDTHS;
    }

    // 2. Everything fits, so each column takes what it needs and the leftover space is shared out in proportion to what
    // each column asked for, which keeps a short column from being padded with space it can't use.
    const totalDesiredWidth = sum(desiredWidths);
    if (totalDesiredWidth <= availableWidth) {
        const leftoverWidth = availableWidth - totalDesiredWidth;
        return {
            widths: roundWidths(
                desiredWidths.map((desiredWidth) => desiredWidth + (leftoverWidth * desiredWidth) / totalDesiredWidth),
                availableWidth,
            ),
            shouldScrollHorizontally: false,
        };
    }

    // 3. Nothing fits. Columns shrink toward their minimum width proportionally to their slack, and once even the
    // minimum widths overflow, they're pinned there and the table scrolls horizontally instead of truncating further.
    const totalMinWidth = sum(minWidths);
    if (totalMinWidth >= availableWidth) {
        return {widths: minWidths, shouldScrollHorizontally: totalMinWidth > availableWidth};
    }

    const totalSlack = totalDesiredWidth - totalMinWidth;
    const slackRatio = (availableWidth - totalMinWidth) / totalSlack;

    return {
        widths: roundWidths(
            desiredWidths.map((desiredWidth, index) => {
                const minWidth = minWidths.at(index) ?? 0;
                return minWidth + (desiredWidth - minWidth) * slackRatio;
            }),
            availableWidth,
        ),
        shouldScrollHorizontally: false,
    };
}

export default calculateDynamicColumnWidths;
export type {DynamicColumnConstraints};
