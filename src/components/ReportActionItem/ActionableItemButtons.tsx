import Button from '@components/ButtonComposed';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ActionableItem = {
    isPrimary?: boolean;
    key: string;
    onPress: () => void;
    text: string;
    shouldUseLocalization?: boolean;
};

type ActionableItemButtonsProps = {
    items: ActionableItem[];
    layout?: 'horizontal' | 'vertical';
    shouldUseLocalization?: boolean;
    primaryTextNumberOfLines?: number;
    styles?: {
        text?: StyleProp<TextStyle>;
        button?: StyleProp<ViewStyle>;
    };
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
                    innerStyles={props.styles?.button}
                >
                    <Button.Text
                        numberOfLines={props.primaryTextNumberOfLines}
                        style={props.styles?.text}
                    >
                        {props.shouldUseLocalization ? translate(item.text as TranslationPaths) : item.text}
                    </Button.Text>
                </Button>
            ))}
        </View>
    );
}

export default ActionableItemButtons;
export type {ActionableItem};
