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
    isBackgroundHovered?: boolean;
    styles?: {
        text?: StyleProp<TextStyle>;
        container?: StyleProp<ViewStyle>;
    };
};

function ActionableItemButtons(props: ActionableItemButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.gap2, styles.mt2, props.layout === 'horizontal' ? styles.flexRow : [styles.flexColumn, styles.alignItemsStart, props.styles?.container]]}>
            {props.items?.map((item) => (
                <Button
                    key={item.key}
                    onPress={item.onPress}
                    text={props.shouldUseLocalization ? translate(item.text as TranslationPaths) : item.text}
                    medium
                    success={item.isPrimary}
                    innerStyles={!item.isPrimary && [styles.actionableItemButton, props.isBackgroundHovered && styles.actionableItemButtonBackgroundHovered]}
                    primaryTextNumberOfLines={props.primaryTextNumberOfLines}
                    textStyles={props.styles?.text}
                />
            ))}
        </View>
    );
}

export default ActionableItemButtons;
export type {ActionableItem};
