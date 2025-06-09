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
        transactionPreviewCarouselStyle: {width: transactionPreviewWidth, maxWidth: transactionPreviewWidth},
        transactionPreviewStandaloneStyle: {width: '100%', maxWidth: '100%'},
        componentStyle: [sizing.mw100, sizing.w100],
        expenseCountVisible: false,
        transactionWidth: transactionPreviewWidth,
    };
};

const desktopStyle = (currentWrapperWidth: number, transactionsCount: number) => {
    const minimalWrapperWidth = TRANSACTION_WIDTH_WIDE + CAROUSEL_ONE_SIDE_PADDING + getPeek(transactionsCount < 2);
    const transactionPreviewWidth = currentWrapperWidth - CAROUSEL_ONE_SIDE_PADDING - getPeek(transactionsCount < 2);
    const spaceForTransactions = Math.max(transactionsCount, 1);
    const carouselExactMaxWidth = Math.min(minimalWrapperWidth + (TRANSACTION_WIDTH_WIDE + CAROUSEL_GAP) * (spaceForTransactions - 1), CAROUSEL_MAX_WIDTH_WIDE);
    return {
        transactionPreviewCarouselStyle: {width: currentWrapperWidth > minimalWrapperWidth || currentWrapperWidth === 0 ? TRANSACTION_WIDTH_WIDE : transactionPreviewWidth},
        transactionPreviewStandaloneStyle: {width: `min(100%, ${TRANSACTION_WIDTH_WIDE}px)`, maxWidth: `min(100%, ${TRANSACTION_WIDTH_WIDE}px)`},
        componentStyle: [{maxWidth: `min(${carouselExactMaxWidth}px, 100%)`}, {width: currentWrapperWidth > minimalWrapperWidth ? 'min-content' : '100%'}],
        // const desktopStyle = (currentWrapperWidth: number, isSingleTransaction?: boolean, transactionsLength?: number) => {
        //     const peek = isSingleTransaction ? spacing.p4.padding : NEXT_TRANSACTION_PEEK;
        //     const transactionPreviewWidth = currentWrapperWidth - spacing.p4.padding - peek;
        //     const minimalWrapperWidth = TRANSACTION_WIDTH_WIDE + spacing.p4.padding + peek;
        //     const exactCarouselWidth = transactionsLength ? Math.min(minimalWrapperWidth + (transactionsLength - 1) * (TRANSACTION_WIDTH_WIDE + 8), 680) : 680;
        //     return {
        //         transactionPreviewCarouselStyle: {width: `min(calc(100% - ${0}px), 303)`},
        //         componentStyle: [{maxWidth: `min(${exactCarouselWidth}px, 100%)`}, {width: '100%'}],
        expenseCountVisible: transactionPreviewWidth >= TRANSACTION_WIDTH_WIDE,
        transactionWidth: currentWrapperWidth > minimalWrapperWidth ? TRANSACTION_WIDTH_WIDE : transactionPreviewWidth,
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
