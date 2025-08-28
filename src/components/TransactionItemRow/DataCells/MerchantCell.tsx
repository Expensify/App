import React, {useMemo} from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';

function MerchantOrDescriptionCell({
    merchantOrDescription,
    shouldShowTooltip,
    shouldUseNarrowLayout,
    shouldRenderAsHTML,
}: {
    merchantOrDescription: string;
    shouldUseNarrowLayout?: boolean;
    shouldShowTooltip: boolean;
    shouldRenderAsHTML?: boolean;
}) {
    const styles = useThemeStyles();

    const html = useMemo(() => {
        if (!shouldRenderAsHTML) {
            return merchantOrDescription;
        }
        return Parser.replace(merchantOrDescription, {shouldEscapeText: false});
    }, [merchantOrDescription, shouldRenderAsHTML]);

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={html}
            style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1]}
            shouldRenderAsHTML={shouldRenderAsHTML}
        />
    );
}

MerchantOrDescriptionCell.displayName = 'MerchantOrDescriptionCell';
export default MerchantOrDescriptionCell;
