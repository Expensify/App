import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type ListItemRightCaretWithLabelProps = {
    labelText?: string;
    shouldShowCaret?: boolean;
};

function ListItemRightCaretWithLabel({labelText, shouldShowCaret = false}: ListItemRightCaretWithLabelProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={styles.flexRow}>
            {!!labelText && <Text style={[styles.alignSelfCenter, styles.textSupporting, styles.pl2, styles.label]}>{labelText}</Text>}
            {shouldShowCaret && (
                <View style={[styles.pl2]}>
                    <Icon
                        src={Expensicons.ArrowRight}
                        fill={theme.icon}
                    />
                </View>
            )}
        </View>
    );
}

ListItemRightCaretWithLabel.displayName = 'ListItemRightCaretWithLabel';

export default ListItemRightCaretWithLabel;
