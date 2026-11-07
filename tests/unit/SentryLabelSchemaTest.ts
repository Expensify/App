import CONST from '@src/CONST';

/** `<Area>-<Action>` or `<Area>-<Action>-<Detail>`, each part in PascalCase. */
const LABEL_PATTERN = /^[A-Z][A-Za-z0-9]*(-[A-Z][A-Za-z0-9]*){1,2}$/;

function collectLabels(value: unknown): string[] {
    if (typeof value === 'string') {
        return [value];
    }
    if (typeof value === 'object' && value !== null) {
        return Object.values(value).flatMap(collectLabels);
    }
    return [];
}

describe('CONST.SENTRY_LABEL', () => {
    const labels = collectLabels(CONST.SENTRY_LABEL);

    it('has two or three PascalCase parts in every label', () => {
        // Given every label in CONST.SENTRY_LABEL
        // When each one is matched against the <Area>-<Action>-<Detail> schema
        const invalidLabels = labels.filter((label) => !LABEL_PATTERN.test(label));

        // Then all of them match, because a label with any other number of parts gets no inp.category, and lowercase or dotted parts break the naming that the Sentry and FullStory queries rely on
        expect(invalidLabels).toEqual([]);
    });

    it('has at least two variants in every inp.category', () => {
        // Given the distinct three-part labels, grouped by the <Area>-<Action> that becomes the inp.category of their INP spans
        const labelsByCategory = new Map<string, Set<string>>();
        for (const label of labels) {
            const [area, action, detail] = label.split('-');
            if (!detail) {
                continue;
            }
            const category = `${area}-${action}`;
            labelsByCategory.set(category, (labelsByCategory.get(category) ?? new Set<string>()).add(label));
        }

        // When looking for categories with a single variant
        const singleVariantLabels = [...labelsByCategory.values()].filter((categoryLabels) => categoryLabels.size === 1).flatMap((categoryLabels) => [...categoryLabels]);

        // Then there are none, because a <Detail> only tells variants of one element apart, so an element with one variant gets a two-part label
        expect(singleVariantLabels).toEqual([]);
    });
});
