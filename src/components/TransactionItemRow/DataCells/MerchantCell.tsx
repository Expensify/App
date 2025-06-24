import React, {memo, useMemo} from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

const MerchantOrDescriptionCell = memo(function MerchantOrDescriptionCell({
    merchantOrDescription,
    shouldShowTooltip,
    shouldUseNarrowLayout,
}: {
    merchantOrDescription: string;
    shouldUseNarrowLayout?: boolean | undefined;
    shouldShowTooltip: boolean;
}) {
    const styles = useThemeStyles();

    // Memoize style array to prevent recreation on every render
    const textStyles = useMemo(
        () => [!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1],
        [shouldUseNarrowLayout, styles.lineHeightLarge, styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1],
    );

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={merchantOrDescription}
            style={textStyles}
        />
    );
});

MerchantOrDescriptionCell.displayName = 'MerchantOrDescriptionCell';
export default MerchantOrDescriptionCell;
