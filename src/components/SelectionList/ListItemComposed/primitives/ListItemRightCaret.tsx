import Icon from '@components/Icon';
import {useListItemHovered} from '@components/SelectionList/ListItemContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

/** Right caret icon, semi-transparent until the row is hovered. */
function ListItemRightCaret() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const isHovered = useListItemHovered();

    return (
        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.ml2]}>
            <Icon
                src={icons.ArrowRight}
                fill={theme.icon}
                additionalStyles={[styles.alignSelfCenter, !isHovered && styles.opacitySemiTransparent]}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </View>
    );
}

export default ListItemRightCaret;
