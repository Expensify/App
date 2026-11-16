import TextWithTooltip from '@components/TextWithTooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type TextCellProps = {
    text?: string | number;
    isLargeScreenWidth?: boolean;
};

function TextCell({text = '', isLargeScreenWidth = true}: TextCellProps) {
    const styles = useThemeStyles();
    const displayText = String(text);

    return (
        <TextWithTooltip
            text={displayText}
            shouldShowTooltip
            numberOfLines={isLargeScreenWidth ? 1 : 2}
            style={[isLargeScreenWidth ? styles.lineHeightLarge : styles.lh20, !isLargeScreenWidth && styles.preWrap, styles.justifyContentCenter]}
            isSelectable
        />
    );
}

export default TextCell;
