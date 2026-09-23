/**
 * Sizing constraints for a single dynamically sized column.
 */
type DynamicColumnConstraints = {
    /** Width the column needs to render its widest content and its header label in full, including non-text extras. */
    contentWidth: number;

    /** Smallest width the column may be squeezed to. A column that must never truncate sets this to its content width. */
    minWidth: number;

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
 * the row. When every column is already at its maximum, the remainder is left unclaimed, since a column's maximum
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
 * Splits the available width between the columns, keeping them equal wherever it can.
 *
 * A column whose content doesn't fit an equal share takes exactly the width its content needs, and a column capped
 * below an equal share takes exactly its maximum. Whatever is left is then split equally between the remaining columns.
 * Settling one column shrinks the share for the rest, which can leave another column unable to fit, so this repeats
 * until every column fits its share. Each pass settles at least one column, so the column count bounds the passes.
 *
 * Splitting the leftover equally rather than in proportion to what each column asked for is what keeps an already-wide
 * column from also taking the largest share of the slack. A caller that cannot use this split because the columns came
 * back wider than the row falls back to the proportional one.
 */
function distributeAvailableWidth(desiredWidths: number[], maxWidths: number[], availableWidth: number): number[] {
    const widths = desiredWidths.map(() => 0);
    const isSettled = desiredWidths.map(() => false);

    for (let pass = 0; pass <= desiredWidths.length; pass++) {
        const settledWidth = sum(widths.filter((width, index) => isSettled.at(index)));
        const unsettledIndexes = isSettled.map((settled, index) => (settled ? -1 : index)).filter((index) => index !== -1);

        if (unsettledIndexes.length === 0) {
            break;
        }

        const equalShare = (availableWidth - settledWidth) / unsettledIndexes.length;
        let hasSettledAnyColumn = false;

        for (const index of unsettledIndexes) {
            const desiredWidth = desiredWidths.at(index) ?? 0;
            const maxWidth = maxWidths.at(index) ?? 0;

            if (desiredWidth > equalShare) {
                widths[index] = desiredWidth;
            } else if (maxWidth < equalShare) {
                widths[index] = maxWidth;
            } else {
                continue;
            }

            isSettled[index] = true;
            hasSettledAnyColumn = true;
        }

        // Every remaining column fits an equal share, so they all take one.
        if (!hasSettledAnyColumn) {
            for (const index of unsettledIndexes) {
                widths[index] = equalShare;
            }
            break;
        }
    }

    return widths;
}

/**
 * Resolves the widths of a table's dynamically sized columns from what their content needs and how much room the table
 * has, implementing the three behaviors from https://github.com/Expensify/App/issues/96510:
 *
 * 1. Every column's content fits inside an equal share of the available width, so the columns stay equal (`1fr`).
 * 2. The content fits overall but unevenly, so a column whose content can't fit an equal share takes exactly the width
 *    it needs, and the remaining columns split what's left equally. A column with long content grows only as far as its
 *    content, rather than also claiming the largest share of the slack. This holds unless the columns resolve wider
 *    than the row, which hands the table to behavior 3 and its proportional split instead.
 * 3. The columns need more room than the row has, so they are squeezed toward their minimum widths, in proportion to
 *    how much room each has to give up. Free-text columns truncate as they shrink. A column holding a known, short set
 *    of values has its content width as its minimum, so it keeps every value in full. A table whose content fits but
 *    whose capped columns claim more than the row holds is resolved here too.
 * 4. Even the minimum widths don't fit, so the columns stop there and the table scrolls horizontally. Scrolling is
 *    reserved for a table with genuinely too many columns rather than one long value.
 *
 * @param constraints - Sizing constraints per column, in column order.
 * @param availableWidth - Width the dynamic columns share, i.e. the row's width minus padding, gaps, and any
 * fixed-width columns.
 */
function calculateDynamicColumnWidths(constraints: DynamicColumnConstraints[], availableWidth: number): CalculatedDynamicColumnWidths {
    if (constraints.length === 0) {
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

    // 2. Everything fits, so a column that can't fit an equal share takes exactly what its content needs and the rest of
    // the columns split what's left equally.
    //
    // Growing a capped column to its maximum can claim room a later column still needs, which leaves the columns wider
    // than the row even though their content fits inside it. That is a table whose content does not fit after all, so it
    // falls through to the squeeze below rather than overflowing.
    const totalDesiredWidth = sum(desiredWidths);
    if (totalDesiredWidth <= availableWidth) {
        // Rounded before the check, because the split leaves fractions that can add up to a hair over the row and a
        // whole table would fall through over a rounding error.
        const distributedWidths = roundWidths(distributeAvailableWidth(desiredWidths, maxWidths, availableWidth), availableWidth, maxWidths);

        if (sum(distributedWidths) <= availableWidth) {
            return {widths: distributedWidths, shouldScrollHorizontally: false};
        }
    }

    // 4. Even at their minimums the columns need more room than the row has, so they stop there and it scrolls. Rounding up
    // rather than down, since a column a fraction of a px short would clip a character it is meant to show.
    //
    // A table whose fixed columns already need more room than it has lands here too, with a budget of zero or less for
    // the dynamic ones to share. Sizing them to their own content is what keeps an empty column narrow in that case,
    // rather than leaving every column an equal share of room the table never had. Whether the table has been measured
    // at all is the caller's question, answered before it works out a budget.
    // Never wider than what the column asked for, so that the room it has to give up can't come out negative and the
    // shares below stay the right way up.
    const minWidths = constraints.map((constraint, index) => Math.min(constraint.minWidth, desiredWidths.at(index) ?? 0));
    const totalMinWidth = sum(minWidths);
    if (totalMinWidth >= availableWidth) {
        return {
            widths: minWidths.map((minWidth) => Math.ceil(minWidth)),
            shouldScrollHorizontally: totalMinWidth > availableWidth,
        };
    }

    // 3. The columns need more room than the row has, so every one of them gives up space in proportion to how much it
    // has to give. A column whose minimum is its content width has nothing to give and keeps its content in full.
    const totalSqueezableWidth = totalDesiredWidth - totalMinWidth;

    // No column has anything to give, which a table can only reach by falling through the branch above. The columns
    // take their minimums and the row keeps whatever is left over, since there is no ratio to work out.
    if (totalSqueezableWidth <= 0) {
        return {
            widths: minWidths.map((minWidth) => Math.ceil(minWidth)),
            shouldScrollHorizontally: false,
        };
    }

    const squeezeRatio = (availableWidth - totalMinWidth) / totalSqueezableWidth;

    return {
        widths: roundWidths(
            desiredWidths.map((desiredWidth, index) => {
                const minWidth = minWidths.at(index) ?? 0;
                // Clamped because a table that reached here with room to spare shares out more than each column asked
                // for, which would otherwise push a capped column past its maximum.
                return Math.min(minWidth + (desiredWidth - minWidth) * squeezeRatio, maxWidths.at(index) ?? 0);
            }),
            availableWidth,
            maxWidths,
        ),
        shouldScrollHorizontally: false,
    };
}

export default calculateDynamicColumnWidths;
export type {DynamicColumnConstraints};
