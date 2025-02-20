import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type ListItemRightCaretWithLabelProps = {
    labelText?: string;
    shouldShowCaret?: boolean;
};

function ListItemRightCaretWithLabel({labelText, shouldShowCaret = false}: ListItemRightCaretWithLabelProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    return (
        <View style={styles.flexRow}>
            <View style={[StyleUtils.getMinimumWidth(60)]}>{!!labelText && <Text style={[styles.textAlignCenter, styles.textSupporting, styles.label]}>{labelText}</Text>}</View>
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
