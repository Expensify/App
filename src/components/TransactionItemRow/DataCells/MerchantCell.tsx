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
            numberOfLines={2}
            style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.preWrap, styles.justifyContentCenter, styles.flex1]}
        />
    );
}

export default MerchantOrDescriptionCell;
