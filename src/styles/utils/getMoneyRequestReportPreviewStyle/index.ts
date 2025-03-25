// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';

const emptyStyle = {
    transaction: {
        width: 0,
    },
    preview: {
        maxWidth: 0,
    },
    reportName: {
        maxWidth: 0,
    },
};

function getPreviewSpacing(suffix: 3 | 4) {
    return {
        gap: spacing[`gap${suffix}`],
        p: spacing[`p${suffix}`],
        mhn: spacing[`mhn${suffix}`],
        ph: spacing[`ph${suffix}`],
    };
}

/*
 *    it is implemented as a style utility to avoid adding many variables in the variables.ts file, as there are many cases where its width would change:
 *    - if it has only one transaction
 *    - if it's a narrow layout
 *    - when it reaches its max width (more than 2 transactions)
 *    - combinations of these conditions
 */
function getMoneyRequestReportPreviewStyle(transactionsLength: number, shouldUseNarrowLayout: boolean) {
    const previewSpacing = getPreviewSpacing(shouldUseNarrowLayout ? 3 : 4);
    const style = {
        ...previewSpacing,
        ...emptyStyle,
    };

    const padding = 2 * previewSpacing.p.padding;
    const gap = (transactionsLength - 1) * spacing.gap2.gap;

    if (shouldUseNarrowLayout) {
        style.transaction.width = transactionsLength === 1 ? 274 : 256;
        style.preview.maxWidth = 298;
    } else {
        style.transaction.width = 303;
        style.preview.maxWidth = transactionsLength >= 3 ? 680 : transactionsLength * 303 + padding + gap;
    }

    return style;
}

export default getMoneyRequestReportPreviewStyle;
