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
    shouldFillAvailableWidth?: boolean;
};

function CardDetailsActionButtons({actions, style, shouldFillAvailableWidth = false}: CardDetailsActionButtonsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    if (actions.length === 0) {
        return null;
    }

    return (
        <View
            style={[
                styles.flexRow,
                styles.flexWrap,
                styles.alignItemsCenter,
                styles.justifyContentCenter,
                shouldFillAvailableWidth ? styles.ph10 : styles.ph5,
                styles.pt2,
                styles.mb6,
                styles.gap2,
                styles.alignSelfStretch,
                style,
            ]}
        >
            {actions.map((action) =>
                shouldFillAvailableWidth ? (
                    <View
                        key={action.key}
                        style={styles.flex1}
                    >
                        <Button
                            text={action.text}
                            icon={action.icon}
                            iconFill={theme.icon}
                            onPress={action.onPress}
                            isDisabled={action.isDisabled}
                            isLoading={action.isLoading}
                            style={styles.w100}
                        />
                    </View>
                ) : (
                    <Button
                        key={action.key}
                        text={action.text}
                        icon={action.icon}
                        iconFill={theme.icon}
                        onPress={action.onPress}
                        isDisabled={action.isDisabled}
                        isLoading={action.isLoading}
                        style={styles.flexShrink0}
                    />
                ),
            )}
        </View>
    );
}

export default CardDetailsActionButtons;
export type {CardDetailsAction};
