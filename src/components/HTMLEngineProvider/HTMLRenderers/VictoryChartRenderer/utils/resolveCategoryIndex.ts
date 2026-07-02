const TRUNCATION_SUFFIXES = ['…', '...'];

/**
 * When a chart category label is truncated with an ellipsis, the bar data `x` value
 * still uses the full label. Match truncated display labels to their full data values.
 */
function stripTruncationSuffix(category: string): string {
    for (const suffix of TRUNCATION_SUFFIXES) {
        if (category.endsWith(suffix)) {
            return category.slice(0, -suffix.length);
        }
    }
    return category;
}

function resolveCategoryIndex(categories: string[] | undefined, dataLabel: string): number {
    return (
        categories?.findIndex((category) => {
            if (category === dataLabel) {
                return true;
            }
            const prefix = stripTruncationSuffix(category);
            return prefix !== category && dataLabel.startsWith(prefix);
        }) ?? -1
    );
}

export default resolveCategoryIndex;
