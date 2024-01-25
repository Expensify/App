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
};

type ActionableItemButtonsProps = {
    items: ActionableItem[];
};

function ActionableItemButtons(props: ActionableItemButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            {props.items?.map((item) => (
                <Button
                    key={item.key}
                    style={[styles.mt2]}
                    onPress={item.onPress}
                    text={translate(item.text)}
                    small
                    success={item.isPrimary}
                />
            ))}
        </View>
    );
}

ActionableItemButtons.displayName = 'ActionableItemButtton';

export default ActionableItemButtons;
export type {ActionableItem};
