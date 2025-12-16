import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

type TextCellProps = {
    text?: string;
};

function TextCell({text = ''}: TextCellProps) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            text={text}
            shouldShowTooltip
            style={[styles.lh20, styles.pre, styles.justifyContentCenter]}
        />
    );
}

export default TextCell;
