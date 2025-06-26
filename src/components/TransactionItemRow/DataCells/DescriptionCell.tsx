import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

function DescriptionCell({
    description,
    shouldShowTooltip,
    shouldUseNarrowLayout,
}: {
    description: string;
    shouldUseNarrowLayout?: boolean | undefined;
    shouldShowTooltip: boolean;
}) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={description}
            style={[!shouldUseNarrowLayout ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter, styles.flex1]}
        />
    );
}

DescriptionCell.displayName = 'DescriptionCell';
export default DescriptionCell;
