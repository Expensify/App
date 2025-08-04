import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';

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
    const html = Parser.replace(merchantOrDescription, {shouldEscapeText: false});

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={merchantOrDescription}
            style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1]}
            shouldRenderAsHTML
        />
    );
}

MerchantOrDescriptionCell.displayName = 'MerchantOrDescriptionCell';
export default MerchantOrDescriptionCell;
