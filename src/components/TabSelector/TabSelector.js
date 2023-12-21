import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import tabNavigatorAnimationEnabled from '@libs/Navigation/tabNavigatorAnimationEnabled';
import CONST from '@src/CONST';
import TabSelectorItem from './TabSelectorItem';

const propTypes = {
    /* Navigation state provided by React Navigation */
    // eslint-disable-next-line react/forbid-prop-types
    state: PropTypes.object.isRequired,

    /* Navigation functions provided by React Navigation */
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        emit: PropTypes.func.isRequired,
    }).isRequired,

    /* Callback fired when tab is pressed */
    onTabPress: PropTypes.func,
};

const defaultProps = {
    onTabPress: () => {},
};

const getIconAndTitle = (route, translate) => {
    switch (route) {
        case CONST.TAB_REQUEST.MANUAL:
            return {icon: Expensicons.Pencil, title: translate('tabSelector.manual')};
        case CONST.TAB_REQUEST.SCAN:
            return {icon: Expensicons.Receipt, title: translate('tabSelector.scan')};
        case CONST.TAB.NEW_CHAT:
            return {icon: Expensicons.User, title: translate('tabSelector.chat')};
        case CONST.TAB.NEW_ROOM:
            return {icon: Expensicons.Hashtag, title: translate('tabSelector.room')};
        case CONST.TAB_REQUEST.DISTANCE:
            return {icon: Expensicons.Car, title: translate('common.distance')};
        default:
            throw new Error(`Route ${route} has no icon nor title set.`);
    }
};

function TabSelector({state, navigation, onTabPress}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const tabs = useMemo(
        () =>
            _.map(state.routes, (route, index) => {
                const isFocused = index === state.index;
                const {icon, title} = getIconAndTitle(route.name, translate);

                const onPress = () => {
                    if (isFocused) {
                        return;
                    }

                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!event.defaultPrevented) {
                        // The `merge: true` option makes sure that the params inside the tab screen are preserved
                        navigation.navigate({name: route.name, merge: true});
                    }

                    onTabPress(route.name);
                };

                return (
                    <TabSelectorItem
                        key={route.name}
                        icon={icon}
                        title={title}
                        onPress={onPress}
                        isFocused={isFocused}
                        animationEnabled={tabNavigatorAnimationEnabled}
                    />
                );
            }),
        [navigation, onTabPress, state.index, state.routes, translate],
    );

    return <View style={styles.tabSelector}>{tabs}</View>;
}

TabSelector.propTypes = propTypes;
TabSelector.defaultProps = defaultProps;
TabSelector.displayName = 'TabSelector';

export default TabSelector;
