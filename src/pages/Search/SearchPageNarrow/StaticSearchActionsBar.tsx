// Static twin of SearchActionsBarNarrow - used for fast perceived performance.
// Keep hooks and Onyx subscriptions to an absolute minimum; add new ones only
// when strictly necessary. UI must stay visually identical to the interactive version.
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function StaticSearchActionsBar() {
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter', 'Bookmark', 'Gear']);
    const theme = useTheme();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr5, styles.mb4]}>
            <Icon
                additionalStyles={[styles.touchableButtonImage]}
                src={expensifyIcons.Filter}
                fill={theme.icon}
                small
            />
            <Icon
                additionalStyles={[styles.touchableButtonImage]}
                src={expensifyIcons.Bookmark}
                fill={theme.icon}
                small
            />
            <Icon
                additionalStyles={[styles.touchableButtonImage]}
                src={expensifyIcons.Gear}
                fill={theme.icon}
                small
            />
        </View>
    );
}

export default StaticSearchActionsBar;
