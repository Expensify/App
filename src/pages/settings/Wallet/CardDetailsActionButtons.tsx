import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

type CardDetailsAction = {
    key: string;
    text: string;
    icon: IconAsset;
    onPress: () => void;
    isDisabled?: boolean;
    isLoading?: boolean;
};

type CardDetailsActionButtonsProps = {
    actions: CardDetailsAction[];
    style?: StyleProp<ViewStyle>;
};

function CardDetailsActionButtons({actions, style}: CardDetailsActionButtonsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    if (actions.length === 0) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.ph5, styles.mb3, styles.gap2, styles.w100, style]}>
            {actions.map((action) => (
                <View
                    key={action.key}
                    style={[styles.flex1, styles.mw50]}
                >
                    <Button
                        text={action.text}
                        icon={action.icon}
                        iconFill={theme.icon}
                        onPress={action.onPress}
                        isDisabled={action.isDisabled}
                        isLoading={action.isLoading}
                    />
                </View>
            ))}
        </View>
    );
}

export default CardDetailsActionButtons;
export type {CardDetailsAction};
