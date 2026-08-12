import Button from '@components/Button';
import type {ButtonProps} from '@components/Button';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type CardDetailsActionButtonsProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

const CardDetailsActionButtonsContext = React.createContext(false);

function CardDetailsActionButtons({children, style}: CardDetailsActionButtonsProps) {
    const styles = useThemeStyles();
    const actionButtons = React.Children.toArray(children);
    const shouldUseEqualButtonWidths = actionButtons.length > 1;

    return (
        <CardDetailsActionButtonsContext.Provider value={shouldUseEqualButtonWidths}>
            <View
                style={[
                    styles.flexRow,
                    styles.flexWrap,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                    styles.ph5,
                    styles.pt2,
                    styles.mb6,
                    styles.gap2,
                    styles.alignSelfStretch,
                    style,
                ]}
            >
                {shouldUseEqualButtonWidths
                    ? actionButtons.map((button, index) => (
                          <View
                              // eslint-disable-next-line react/no-array-index-key
                              key={index}
                              style={[styles.flexGrow1, styles.flexShrink1, styles.flexBasis0, {minWidth: variables.cardDetailsActionButtonMinWidth}]}
                          >
                              {button}
                          </View>
                      ))
                    : children}
            </View>
        </CardDetailsActionButtonsContext.Provider>
    );
}

function CardDetailsActionButton({innerStyles, style, ...props}: ButtonProps) {
    const styles = useThemeStyles();
    const shouldUseEqualButtonWidths = React.useContext(CardDetailsActionButtonsContext);

    return (
        <Button
            {...props}
            innerStyles={[shouldUseEqualButtonWidths && styles.ph2, innerStyles]}
            style={[shouldUseEqualButtonWidths && styles.w100, style]}
        />
    );
}

export default CardDetailsActionButtons;
export {CardDetailsActionButton};
