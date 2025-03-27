// eslint-disable-next-line no-restricted-imports
import sizing from '@styles/utils/sizing';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';

const componentsSpacing = {
    flatListStyle: [spacing.mhn4, spacing.ph4],
    wrapperStyle: spacing.p4,
    contentContainerStyle: spacing.gap4,
};

const mobileStyle = {
    transactionPreviewStyle: {width: 256},
    componentStyle: [sizing.mw100, {width: 'min-content'}],
};

const desktopStyle = {
    transactionPreviewStyle: {width: 303},
    componentStyle: [{maxWidth: 'min(680px, 100%)'}, {width: 'min-content'}],
};

const getMoneyRequestReportPreviewStyle = (shouldUseNarrowLayout: boolean) => ({...componentsSpacing, ...(shouldUseNarrowLayout ? mobileStyle : desktopStyle)});

export default getMoneyRequestReportPreviewStyle;
