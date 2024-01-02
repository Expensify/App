import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import withLocalize, {WithLocalizeProps} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {TranslationPaths} from '@src/languages/types';

type ActionableItem = {
    isPrimary?: boolean;
    key: string;
    onPress: () => void;
    text: TranslationPaths;
};

type ActionableItemButtonsProps = WithLocalizeProps & {
    items: ActionableItem[];
};

function ActionableItemButtons(props: ActionableItemButtonsProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.gap4]}>
            {props.items?.map((item) => (
                <Button
                    key={item.key}
                    style={[styles.mt2]}
                    onPress={item.onPress}
                    text={props.translate(item.text)}
                    small
                    success={item.isPrimary}
                />
            ))}
        </View>
    );
}

ActionableItemButtons.displayName = 'ActionableItemButtton';

export default withLocalize(ActionableItemButtons);
export type {ActionableItem};
