import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ButtonTextProps} from './ButtonText';
import ButtonText from './ButtonText';

function ButtonTextAlignedLeft({children, numberOfLines = 1, style, hoverStyle}: ButtonTextProps) {
    const styles = useThemeStyles();

    return (
        <ButtonText
            {...{numberOfLines, hoverStyle}}
            style={[style, styles.textAlignLeft]}
        >
            {children}
        </ButtonText>
    );
}

export default ButtonTextAlignedLeft;
export type {ButtonTextProps};
