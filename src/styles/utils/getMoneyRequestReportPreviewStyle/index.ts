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
const CAROUSEL_MAX_WIDTH_WIDE = CONST.REPORT.CAROUSEL_MAX_WIDTH_WIDE;
const TRANSACTION_WIDTH_WIDE = CONST.REPORT.TRANSACTION_PREVIEW.CAROUSEL.WIDE_WIDTH;
const CAROUSEL_ONE_SIDE_PADDING = componentsSpacing.wrapperStyle.padding;
const CAROUSEL_GAP = spacing.gap2.gap;

const getPeek = (isSingleTransaction: boolean) => {
    return isSingleTransaction ? CAROUSEL_ONE_SIDE_PADDING : NEXT_TRANSACTION_PEEK;
};

const mobileStyle = (currentWidth: number, transactionsCount: number) => {
    const transactionPreviewWidth = currentWidth - CAROUSEL_ONE_SIDE_PADDING - getPeek(transactionsCount === 1);
    return {
        transactionPreviewStyle: {width: transactionPreviewWidth, maxWidth: transactionPreviewWidth},
        componentStyle: [sizing.mw100, {width: '100%'}],
        expenseCountVisible: false,
    };
};

const desktopStyle = (currentWrapperWidth: number, transactionsCount: number) => {
    const minimalWrapperWidth = TRANSACTION_WIDTH_WIDE + CAROUSEL_ONE_SIDE_PADDING + getPeek(transactionsCount < 2);
    const transactionPreviewWidth = currentWrapperWidth - CAROUSEL_ONE_SIDE_PADDING - getPeek(transactionsCount < 2);
    const spaceForTransactions = Math.max(transactionsCount, 1);
    const carouselExactMaxWidth = Math.min(minimalWrapperWidth + (TRANSACTION_WIDTH_WIDE + CAROUSEL_GAP) * (spaceForTransactions - 1), CAROUSEL_MAX_WIDTH_WIDE);
    return {
        transactionPreviewStyle: {width: currentWrapperWidth > minimalWrapperWidth || currentWrapperWidth === 0 ? TRANSACTION_WIDTH_WIDE : transactionPreviewWidth},
        componentStyle: [{maxWidth: `min(${carouselExactMaxWidth}px, 100%)`}, {width: currentWrapperWidth > minimalWrapperWidth ? 'min-content' : '100%'}],
        expenseCountVisible: transactionPreviewWidth >= TRANSACTION_WIDTH_WIDE,
    };
};

const getMoneyRequestReportPreviewStyle = (
    shouldUseNarrowLayout: boolean,
    transactionsCount: number,
    currentWidth?: number,
    currentWrapperWidth?: number,
): MoneyRequestReportPreviewStyleType => ({
    ...componentsSpacing,
    ...(shouldUseNarrowLayout ? mobileStyle(currentWidth ?? 256, transactionsCount) : desktopStyle(currentWrapperWidth ?? 1000, transactionsCount)),
});

export default getMoneyRequestReportPreviewStyle;
