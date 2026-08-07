import Button from '@components/ButtonComposed';
import type {ButtonTextProps} from '@components/ButtonComposed/primitives/ButtonText';
import type {ButtonStyleProps} from '@components/ButtonComposed/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ActionableItem = {
    isPrimary?: boolean;
    key: string;
    onPress: () => void;
} & ({translationKey: TranslationPaths; text?: never} | {text: string; translationKey?: never});

type ActionableItemButtonsProps = {
    items: ActionableItem[];
    layout?: 'horizontal' | 'vertical';

    /** Props forwarded to the `Button` rendered for each item */
    buttonProps?: Pick<ButtonStyleProps, 'innerStyles'>;

    /** Props forwarded to the `Button.Text` rendered for each item */
    textProps?: Pick<ButtonTextProps, 'numberOfLines' | 'style'>;

    wrapperStyle?: StyleProp<ViewStyle>;
};

function ActionableItemButtons(props: ActionableItemButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.gap2, styles.mt2, props.layout === 'horizontal' ? styles.flexRow : [styles.flexColumn, styles.alignItemsStart], props.wrapperStyle]}>
            {props.items?.map((item) => (
                <Button
                    key={item.key}
                    onPress={item.onPress}
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    variant={item.isPrimary ? CONST.BUTTON_VARIANT.SUCCESS : undefined}
                    {...props.buttonProps}
                >
                    <Button.Text {...props.textProps}>{item.translationKey ? translate(item.translationKey) : item.text}</Button.Text>
                </Button>
            ))}
        </View>
    );
}

export default ActionableItemButtons;
export type {ActionableItem};
