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
    styles?: {
        text?: StyleProp<TextStyle>;
        button?: StyleProp<ViewStyle>;
    };
};

function ActionableItemButtons(props: ActionableItemButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isHorizontal = props.layout === 'horizontal';

    return (
        <View style={[styles.gap2, styles.mt2, isHorizontal ? [styles.flexRow, styles.flexWrap] : [styles.flexColumn, styles.alignItemsStart]]}>
            {props.items?.map((item) => (
                <Button
                    key={item.key}
                    onPress={item.onPress}
                    text={props.shouldUseLocalization ? translate(item.text as TranslationPaths) : item.text}
                    medium
                    success={item.isPrimary}
                    // Let a button that is wider than the viewport shrink to fit and wrap its text to multiple lines instead of overflowing horizontally
                    style={isHorizontal ? [styles.flexShrink1, styles.mw100] : undefined}
                    innerStyles={props.styles?.button}
                    primaryTextNumberOfLines={props.primaryTextNumberOfLines}
                    textStyles={props.styles?.text}
                />
            ))}
        </View>
    );
}

export default ActionableItemButtons;
export type {ActionableItem};
