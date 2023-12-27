import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import useThemeStyles from '@hooks/useThemeStyles';

type ActionItem = {
    isPrimary: boolean;
    key: string;
    onPress: () => void;
    text: string;
};

type ActionItemButttonsProps = {
    items: ActionItem[];
};

function ActionItemButttons(props: ActionItemButttonsProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.gap4]}>
            {props.items?.map((item) => (
                <Button
                    key={item.key}
                    style={[styles.mt2]}
                    onPress={item.onPress}
                    text={item.text}
                    small
                    success={item.isPrimary}
                />
            ))}
        </View>
    );
}

ActionItemButttons.displayName = 'ActionItemButtton';

export default ActionItemButttons;
