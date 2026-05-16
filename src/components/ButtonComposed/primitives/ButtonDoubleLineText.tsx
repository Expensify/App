import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import {useButtonContext} from '@components/ButtonComposed/context';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import ButtonText from './ButtonText';

type ButtonDoubleLineTextProps = {
    /** The main (first line) text */
    primaryText: string;

    /** The number of lines to display */
    primaryTextNumberOfLines?: number;

    /** Additional text styles */
    textStyle?: StyleProp<TextStyle>;

    /** Additional text styles to apply when the button is hovered. */
    hoverStyle?: StyleProp<TextStyle>;

    /** The secondary (second line) text displayed below the main text */
    secondLineText: string;
};

function ButtonDoubleLineText({primaryText, secondLineText, textStyle, primaryTextNumberOfLines, hoverStyle}: ButtonDoubleLineTextProps) {
    const styles = useThemeStyles();
    const {isLoading} = useButtonContext();
    return (
        <View style={[styles.alignItemsCenter, styles.flexColumn, styles.flexShrink1, styles.mw100]}>
            <ButtonText
                style={[textStyle, styles.noPaddingBottom]}
                numberOfLines={primaryTextNumberOfLines}
                hoverStyle={hoverStyle}
            >
                {primaryText}
            </ButtonText>
            <Text
                style={[
                    isLoading && styles.opacity0,
                    styles.pointerEventsNone,
                    styles.fontWeightNormal,
                    styles.textDoubleDecker,
                    styles.textExtraSmallSupporting,
                    styles.textWhite,
                    styles.textBold,
                ]}
                numberOfLines={1}
            >
                {secondLineText}
            </Text>
        </View>
    );
}

export default ButtonDoubleLineText;
export type {ButtonDoubleLineTextProps};
