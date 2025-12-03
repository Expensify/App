import React, {useMemo} from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';

function MerchantOrDescriptionCell({
    merchantOrDescription,
    shouldShowTooltip,
    shouldUseNarrowLayout,
    isDescription,
}: {
    merchantOrDescription: string;
    shouldUseNarrowLayout?: boolean;
    shouldShowTooltip: boolean;
    isDescription?: boolean;
}) {
    const styles = useThemeStyles();

    const text = useMemo(() => {
        if (!isDescription) {
            return merchantOrDescription;
        }
        return Parser.htmlToText(merchantOrDescription).replaceAll('\n', ' ');
    }, [merchantOrDescription, isDescription]);

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={text}
            style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1]}
        />
    );
}

MerchantOrDescriptionCell.displayName = 'MerchantOrDescriptionCell';
export default MerchantOrDescriptionCell;
