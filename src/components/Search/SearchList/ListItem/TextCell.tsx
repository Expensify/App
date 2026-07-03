import TextWithTooltip from '@components/TextWithTooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

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
            numberOfLines={isLargeScreenWidth ? 1 : 2}
            style={[isLargeScreenWidth ? styles.lineHeightLarge : styles.lh20, !isLargeScreenWidth && styles.preWrap, styles.justifyContentCenter]}
        />
    );
}

export default TextCell;
