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
 * Rounds widths down to whole px and hands the rounding remainder to the widest column that can still take it without
 * exceeding its maximum, so the columns add up to exactly `availableWidth` and no sub-pixel gap is left at the end of
 * the row. When every column is already at its maximum the remainder is left unclaimed, since a column's maximum
 * outranks filling the row.
 */
function roundWidths(widths: number[], availableWidth: number, maxWidths: number[]): number[] {
    const roundedWidths = widths.map((width) => Math.floor(width));
    const remainder = availableWidth - sum(roundedWidths);

    if (remainder <= 0) {
        return roundedWidths;
    }

    let widestGrowableIndex = -1;
    for (const [index, roundedWidth] of roundedWidths.entries()) {
        if (roundedWidth + remainder > (maxWidths.at(index) ?? 0) || (widestGrowableIndex !== -1 && roundedWidth <= (roundedWidths.at(widestGrowableIndex) ?? 0))) {
            continue;
        }

        widestGrowableIndex = index;
    }

    if (widestGrowableIndex === -1) {
        return roundedWidths;
    }

    roundedWidths[widestGrowableIndex] += remainder;

    return roundedWidths;
}

/**
 * Shares the space left over once every column has what its content needs, in proportion to what each column asked for.
 * A column that reaches its maximum width drops out and what it declines is re-offered to the columns that can still
 * use it, which is what keeps `maxWidth` from being handed back the space it just refused.
 */
function distributeLeftoverWidth(desiredWidths: number[], maxWidths: number[], availableWidth: number): number[] {
    const widths = [...desiredWidths];
    let leftoverWidth = availableWidth - sum(widths);

    // Every pass either hands out all of the leftover or pins at least one more column to its maximum, so the column
    // count bounds how many passes are needed.
    for (let pass = 0; pass < widths.length && leftoverWidth > 0; pass++) {
        const growableIndexes = widths.map((width, index) => (width < (maxWidths.at(index) ?? 0) ? index : -1)).filter((index) => index !== -1);

        if (growableIndexes.length === 0) {
            break;
        }

        // Columns are grown in proportion to their current width, unless they're all empty, in which case there's no
        // proportion to go by and the leftover is split evenly.
        const totalGrowableWidth = sum(growableIndexes.map((index) => widths.at(index) ?? 0));
        let distributedWidth = 0;

        for (const index of growableIndexes) {
            const width = widths.at(index) ?? 0;
            const share = totalGrowableWidth > 0 ? (leftoverWidth * width) / totalGrowableWidth : leftoverWidth / growableIndexes.length;
            const grownWidth = Math.min(width + share, maxWidths.at(index) ?? 0);

            distributedWidth += grownWidth - width;
            widths[index] = grownWidth;
        }

        if (distributedWidth <= 0) {
            break;
        }

        leftoverWidth -= distributedWidth;
    }

    return widths;
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
    // A minimum outranks a maximum, so a column whose maximum sits below its minimum is sized by the minimum.
    const maxWidths = constraints.map((constraint, index) => Math.max(constraint.maxWidth, minWidths.at(index) ?? 0));
    const desiredWidths = constraints.map((constraint, index) => clamp(constraint.contentWidth, minWidths.at(index) ?? 0, maxWidths.at(index) ?? 0));

    // 1. Equal columns already give every column enough room, so nothing needs resizing. A column whose maximum is
    // narrower than an equal share is excluded, because equal tracks would stretch it past that maximum.
    const equalShare = availableWidth / constraints.length;
    const doEqualColumnsFit = desiredWidths.every((desiredWidth) => desiredWidth <= equalShare) && maxWidths.every((maxWidth) => maxWidth >= equalShare);
    if (doEqualColumnsFit) {
        return EQUAL_WIDTHS;
    }

    // 2. Everything fits, so each column takes what it needs and the leftover space is shared out among the columns that
    // can still grow, which keeps a short column from being padded with space it can't use.
    const totalDesiredWidth = sum(desiredWidths);
    if (totalDesiredWidth <= availableWidth) {
        return {
            widths: roundWidths(distributeLeftoverWidth(desiredWidths, maxWidths, availableWidth), availableWidth, maxWidths),
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
            maxWidths,
        ),
        shouldScrollHorizontally: false,
    };
}

export default calculateDynamicColumnWidths;
export type {DynamicColumnConstraints};
