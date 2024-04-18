import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

type ActionableItem = {
    isPrimary?: boolean;
    key: string;
    onPress: () => void;
    text: TranslationPaths;
    isMediumSized?: boolean;
};

type ActionableItemButtonsProps = {
    items: ActionableItem[];
    layout?: 'horizontal' | 'vertical';
};

function ActionableItemButtons(props: ActionableItemButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[props.layout === 'horizontal' ? styles.flexRow : [styles.flexColumn, styles.alignItemsStart], styles.gap2, styles.mt2]}>
            {props.items?.map((item) => (
                <Button
                    key={item.key}
                    onPress={item.onPress}
                    text={translate(item.text)}
                    small={!item.isMediumSized}
                    medium={item.isMediumSized}
                    success={item.isPrimary}
                />
            ))}
        </View>
    );
}

ActionableItemButtons.displayName = 'ActionableItemButtton';

export default ActionableItemButtons;
export type {ActionableItem};
