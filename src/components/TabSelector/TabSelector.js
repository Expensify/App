import {View} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import * as Expensicons from '../Icon/Expensicons';
import TabSelectorItem from './TabSelectorItem';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';

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

    /* AnimatedValue for the position of the screen while swiping */
    position: PropTypes.shape({
        interpolate: PropTypes.func.isRequired,
    }),
};

const defaultProps = {
    onTabPress: () => {},
    position: {
        interpolate: () => {},
    },
};

const getIcon = (route) => {
    switch (route) {
        case CONST.TAB.SCAN:
            return Expensicons.Receipt;
        case CONST.TAB.DISTANCE:
            return Expensicons.Car;
        default:
            return Expensicons.Pencil;
    }
};

const getTitle = (route, translate) => {
    switch (route) {
        case CONST.TAB.SCAN:
            return translate('tabSelector.scan');
        case CONST.TAB.DISTANCE:
            return translate('common.distance');
        default:
            return translate('tabSelector.manual');
    }
};

const getOpacity = (position, routesLength, tabIndex, active) => {
    const activeValue = active ? 1 : 0;
    const inactiveValue = active ? 0 : 1;

    if (routesLength > 1) {
        const inputRange = Array.from({length: routesLength}, (v, i) => i);

        return position.interpolate({
            inputRange,
            outputRange: _.map(inputRange, (i) => (i === tabIndex ? activeValue : inactiveValue)),
        });
    }
    return activeValue;
};

const getBackgroundColor = (position, routesLength, tabIndex) => {
    if (routesLength > 1) {
        const inputRange = Array.from({length: routesLength}, (v, i) => i);

        return position.interpolate({
            inputRange,
            outputRange: _.map(inputRange, (i) => (i === tabIndex ? themeColors.midtone : themeColors.appBG)),
        });
    }
    return themeColors.midtone;
};

function TabSelector({state, navigation, onTabPress, position}) {
    const {translate} = useLocalize();

    return (
        <View style={styles.tabSelector}>
            {_.map(state.routes, (route, index) => {
                const activeOpacity = getOpacity(position, state.routes.length, index, true);
                const inactiveOpacity = getOpacity(position, state.routes.length, index, false);
                const backgroundColor = getBackgroundColor(position, state.routes.length, index);

                const isFocused = index === state.index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        // The `merge: true` option makes sure that the params inside the tab screen are preserved
                        navigation.navigate({name: route.name, merge: true});
                    }

                    onTabPress(route.name);
                };

                return (
                    <TabSelectorItem
                        key={route.name}
                        title={getTitle(route.name, translate)}
                        icon={getIcon(route.name)}
                        onPress={onPress}
                        activeOpacity={activeOpacity}
                        inactiveOpacity={inactiveOpacity}
                        backgroundColor={backgroundColor}
                    />
                );
            })}
        </View>
    );
}

TabSelector.propTypes = propTypes;
TabSelector.defaultProps = defaultProps;
TabSelector.displayName = 'TabSelector';

export default TabSelector;
