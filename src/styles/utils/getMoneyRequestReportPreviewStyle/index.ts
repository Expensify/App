import type {MoneyRequestReportPreviewStyleType} from '@components/ReportActionItem/MoneyRequestReportPreview/types';
// eslint-disable-next-line no-restricted-imports
import sizing from '@styles/utils/sizing';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import CONST from '@src/CONST';

const componentsSpacing = {
    flatListStyle: [spacing.mhn4],
    wrapperStyle: spacing.p4,
    contentContainerStyle: spacing.gap4,
};

const NEXT_TRANSACTION_PEEK = 32;
const TRANSACTION_WIDTH_WIDE = CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.WIDTH_WIDE;

const mobileStyle = (currentWidth: number, isSingleTransaction?: boolean) => {
    const peek = isSingleTransaction ? spacing.p4.padding : NEXT_TRANSACTION_PEEK;
    const transactionPreviewWidth = currentWidth - spacing.p4.padding - peek;
    return {
        transactionPreviewStyle: {width: transactionPreviewWidth, maxWidth: transactionPreviewWidth},
        componentStyle: [sizing.mw100, {width: '100%'}],
        expenseCountVisible: false,
    };
};

const desktopStyle = (currentWrapperWidth: number, isSingleTransaction?: boolean) => {
    const peek = isSingleTransaction ? spacing.p4.padding : NEXT_TRANSACTION_PEEK;
    const transactionPreviewWidth = currentWrapperWidth - spacing.p4.padding - peek;
    const minimalWrapperWidth = TRANSACTION_WIDTH_WIDE + spacing.p4.padding + peek;
    return {
        transactionPreviewStyle: {width: currentWrapperWidth > minimalWrapperWidth ? TRANSACTION_WIDTH_WIDE : transactionPreviewWidth},
        componentStyle: [{maxWidth: 'min(680px, 100%)'}, {width: 'min-content'}],
        expenseCountVisible: transactionPreviewWidth >= TRANSACTION_WIDTH_WIDE,
    };
};

const getMoneyRequestReportPreviewStyle = (
    shouldUseNarrowLayout: boolean,
    currentWidth?: number,
    currentWrapperWidth?: number,
    isSingleTransaction?: boolean,
): MoneyRequestReportPreviewStyleType => ({
    ...componentsSpacing,
    ...(shouldUseNarrowLayout ? mobileStyle(currentWidth ?? 256, isSingleTransaction) : desktopStyle(currentWrapperWidth ?? 1000, isSingleTransaction)),
});

export default getMoneyRequestReportPreviewStyle;
