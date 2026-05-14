import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

type CardDetailsActionButtonsProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

type ActionButtonElementProps = {
    innerStyles?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
};

function CardDetailsActionButtons({children, style}: CardDetailsActionButtonsProps) {
    const styles = useThemeStyles();
    const actionButtons = React.Children.toArray(children).filter((child): child is React.ReactElement<ActionButtonElementProps> => React.isValidElement<ActionButtonElementProps>(child));
    const shouldUseEqualButtonWidths = actionButtons.length > 1;

    return (
        <View
            style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph5, styles.pt2, styles.mb6, styles.gap2, styles.alignSelfStretch, style]}
        >
            {actionButtons.map((button) =>
                shouldUseEqualButtonWidths
                    ? React.cloneElement(button, {
                          innerStyles: [styles.ph2, button.props.innerStyles],
                          style: [button.props.style, styles.flexGrow1, styles.flexShrink1, styles.flexBasis0, {minWidth: variables.cardDetailsActionButtonMinWidth}],
                      })
                    : button,
            )}
        </View>
    );
}

export default CardDetailsActionButtons;
