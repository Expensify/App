const TRUNCATION_SUFFIXES = ['…', '...'];

/**
 * When a chart category label is truncated with an ellipsis, the bar data `x` value
 * still uses the full label. Match truncated display labels to their full data values.
 */
function stripTruncationSuffix(category: string): string | undefined {
    for (const suffix of TRUNCATION_SUFFIXES) {
        if (category.endsWith(suffix)) {
            return category.slice(0, -suffix.length);
        }
    }
    return undefined;
}

function resolveCategoryIndex(categories: string[] | undefined, dataLabel: string): number {
    if (!categories?.length) {
        return -1;
    }

    const exactIndex = categories.indexOf(dataLabel);
    if (exactIndex !== -1) {
        return exactIndex;
    }

    for (let index = 0; index < categories.length; index++) {
        const truncatedPrefix = stripTruncationSuffix(categories[index]);
        if (truncatedPrefix && dataLabel.startsWith(truncatedPrefix)) {
            return index;
        }
    }

    return -1;
}

export default resolveCategoryIndex;
