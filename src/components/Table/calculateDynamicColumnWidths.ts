/**
 * Sizing constraints for a single dynamically sized column.
 */
type DynamicColumnConstraints = {
    /** Width the column needs to render its widest content and its header label in full, including non-text extras. */
    contentWidth: number;

    /** Largest width the column may claim. Content past it truncates instead of widening the column any further. */
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

    /** Whether the columns need more room than the table has, so the caller has to scroll them horizontally. */
    shouldScrollHorizontally: boolean;
};

const EQUAL_WIDTHS: CalculatedDynamicColumnWidths = {widths: [], shouldScrollHorizontally: false};

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
 * has, implementing the three behaviors from https://github.com/Expensify/App/issues/96510:
 *
 * 1. Every column's content fits inside an equal share of the available width, so the columns stay equal (`1fr`).
 * 2. The content fits overall but unevenly, so each column takes what it needs and the leftover space is shared out
 *    among the columns that can still grow, in proportion to what each asked for. A column with long content grows and
 *    its short-content siblings shrink. Sharing the leftover equally instead would pad a short column with space it has
 *    nothing to put in.
 * 3. The content does not fit, so each column keeps the width its content needs and the table scrolls horizontally
 *    rather than truncating. A column only truncates when it has been given an explicit `maxWidth`, which is the one
 *    way a caller can choose truncation over an even wider scroll.
 *
 * @param constraints - Sizing constraints per column, in column order.
 * @param availableWidth - Width the dynamic columns share, i.e. the row's width minus padding, gaps, and any
 * fixed-width columns.
 */
function calculateDynamicColumnWidths(constraints: DynamicColumnConstraints[], availableWidth: number): CalculatedDynamicColumnWidths {
    if (constraints.length === 0 || availableWidth <= 0) {
        return EQUAL_WIDTHS;
    }

    const maxWidths = constraints.map((constraint) => constraint.maxWidth);
    const desiredWidths = constraints.map((constraint, index) => Math.min(constraint.contentWidth, maxWidths.at(index) ?? 0));

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

    // 3. The content doesn't fit. Every column keeps the width its content needs and the table scrolls, so nothing is
    // truncated that a caller hasn't capped. Rounding up rather than down, since a column a fraction of a px short would
    // clip the last character it is meant to show.
    return {
        widths: desiredWidths.map((desiredWidth) => Math.ceil(desiredWidth)),
        shouldScrollHorizontally: true,
    };
}

export default calculateDynamicColumnWidths;
export type {DynamicColumnConstraints};
