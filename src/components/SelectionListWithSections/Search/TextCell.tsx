import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

type TextCellProps = {
    text?: string;
    isLargeScreenWidth?: boolean;
};

function TextCell({text = '', isLargeScreenWidth = true}: TextCellProps) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            text={text}
            shouldShowTooltip
            numberOfLines={1}
            style={[isLargeScreenWidth ? styles.lineHeightLarge : styles.lh20, styles.pre, styles.justifyContentCenter]}
        />
    );
}

export default TextCell;
