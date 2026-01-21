import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    return (
        <View style={styles.flexRow}>
            <View style={[StyleUtils.getMinimumWidth(60)]}>{!!labelText && <Text style={[styles.textAlignCenter, styles.textSupporting, styles.label]}>{labelText}</Text>}</View>
            {shouldShowCaret && (
                <View style={[styles.pl2]}>
                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                    />
                </View>
            )}
        </View>
    );
}

export default ListItemRightCaretWithLabel;
