import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';

function useReceiptPreviewsSizes(isInLandscapeMode: boolean) {
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();

    if (isInLandscapeMode) {
        const previewItemSize = styles.receiptPlaceholderLandscape.height + styles.receiptPlaceholderLandscape.marginBottom;

        const submitButtonHeight = styles.singleAvatarMedium.height;
        const tabSelectorButtonHeight = variables.tabSelectorButtonHeight + styles.pb4.paddingBottom;
        const contentHeaderHeight = variables.contentHeaderHeight;
        const initialReceiptsAmount = (windowHeight - submitButtonHeight - tabSelectorButtonHeight - contentHeaderHeight) / previewItemSize;

        return {
            previewsSize: styles.receiptPlaceholderLandscape.width + styles.ph6.paddingHorizontal * 2,
            previewItemSize,
            initialReceiptsAmount,
        };
    }

    const previewItemSize = styles.receiptPlaceholder.width + styles.receiptPlaceholder.marginRight;
    const initialReceiptsAmount = (windowWidth - styles.ph4.paddingHorizontal * 2 - styles.singleAvatarMedium.width) / previewItemSize;

    return {
        previewsSize: styles.receiptPlaceholder.height + styles.pv2.paddingVertical * 2,
        previewItemSize,
        initialReceiptsAmount,
    };
}

export default useReceiptPreviewsSizes;
