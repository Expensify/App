import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

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
    textStyles?: StyleProp<TextStyle>;
    buttonStyles?: StyleProp<ViewStyle>;
    containerStyles?: StyleProp<ViewStyle>;
};

function ActionableItemButtons(props: ActionableItemButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.gap2, styles.mt2, props.layout === 'horizontal' ? styles.flexRow : [styles.flexColumn, styles.alignItemsStart, props.containerStyles]]}>
            {props.items?.map((item) => (
                <Button
                    key={item.key}
                    onPress={item.onPress}
                    text={props.shouldUseLocalization ? translate(item.text as TranslationPaths) : item.text}
                    medium
                    success={item.isPrimary}
                    innerStyles={props.buttonStyles}
                    primaryTextNumberOfLines={props.primaryTextNumberOfLines}
                    textStyles={props.textStyles}
                />
            ))}
        </View>
    );
}

export default ActionableItemButtons;
export type {ActionableItem};
