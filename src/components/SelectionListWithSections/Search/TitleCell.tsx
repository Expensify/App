import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

type TitleCellProps = {
    text: string;
    isLargeScreenWidth: boolean;
};

function TitleCell({text, isLargeScreenWidth}: TitleCellProps) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            text={text}
            shouldShowTooltip
            style={[isLargeScreenWidth ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter]}
        />
    );
}

export default TitleCell;
