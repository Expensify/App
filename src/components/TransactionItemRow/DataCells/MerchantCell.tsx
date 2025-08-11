import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

function MerchantOrDescriptionCell({
    merchantOrDescription,
    shouldShowTooltip,
    shouldUseNarrowLayout,
}: {
    merchantOrDescription: string;
    shouldUseNarrowLayout?: boolean | undefined;
    shouldShowTooltip: boolean;
}) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={merchantOrDescription}
            style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1]}
        />
    );
}

MerchantOrDescriptionCell.displayName = 'MerchantOrDescriptionCell';
export default MerchantOrDescriptionCell;
