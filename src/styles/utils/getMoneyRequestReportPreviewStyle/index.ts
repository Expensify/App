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
const CAROUSEL_MAX_WIDTH_WIDE = 680;
const TRANSACTION_WIDTH_WIDE = CONST.REPORT.TRANSACTION_PREVIEW_WIDTH_WIDE;
const CAROUSEL_ONE_SIDE_PADDING = componentsSpacing.wrapperStyle.padding;
const CAROUSEL_GAP = spacing.gap2.gap;

const getPeek = (isSingleTransaction?: boolean) => {
    return isSingleTransaction ? CAROUSEL_ONE_SIDE_PADDING : NEXT_TRANSACTION_PEEK;
};

const mobileStyle = (currentWidth: number, isSingleTransaction?: boolean) => {
    const transactionPreviewWidth = currentWidth - CAROUSEL_ONE_SIDE_PADDING - getPeek(isSingleTransaction);
    return {
        transactionPreviewStyle: {width: transactionPreviewWidth, maxWidth: transactionPreviewWidth},
        componentStyle: [sizing.mw100, {width: '100%'}],
        expenseCountVisible: false,
    };
};

const desktopStyle = (currentWrapperWidth: number, isSingleTransaction?: boolean, transactionsCount?: number) => {
    const minimalWrapperWidth = TRANSACTION_WIDTH_WIDE + CAROUSEL_ONE_SIDE_PADDING + getPeek(isSingleTransaction);
    const transactionPreviewWidth = currentWrapperWidth - CAROUSEL_ONE_SIDE_PADDING - getPeek(isSingleTransaction);
    const spaceForTransactions = Math.max(transactionsCount ?? 1, 1);
    const carouselExactMaxWidth = Math.min(minimalWrapperWidth + (TRANSACTION_WIDTH_WIDE + CAROUSEL_GAP) * (spaceForTransactions - 1), CAROUSEL_MAX_WIDTH_WIDE);
    return {
        transactionPreviewStyle: {width: currentWrapperWidth > minimalWrapperWidth ? TRANSACTION_WIDTH_WIDE : transactionPreviewWidth},
        componentStyle: [{maxWidth: `min(${carouselExactMaxWidth}px, 100%)`}, {width: currentWrapperWidth > minimalWrapperWidth ? 'min-content' : '100%'}],
        expenseCountVisible: transactionPreviewWidth >= TRANSACTION_WIDTH_WIDE,
    };
};

const getMoneyRequestReportPreviewStyle = (
    shouldUseNarrowLayout: boolean,
    currentWidth?: number,
    currentWrapperWidth?: number,
    transactionsCount?: number,
): MoneyRequestReportPreviewStyleType => ({
    ...componentsSpacing,
    ...(shouldUseNarrowLayout ? mobileStyle(currentWidth ?? 256, transactionsCount === 1) : desktopStyle(currentWrapperWidth ?? 1000, transactionsCount === 1, transactionsCount)),
});

export default getMoneyRequestReportPreviewStyle;
