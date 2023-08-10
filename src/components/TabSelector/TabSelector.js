import {View} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import * as Expensicons from '../Icon/Expensicons';
import TabSelectorItem from './TabSelectorItem';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import styles from '../../styles/styles';

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

function TabSelector({state, navigation, onTabPress}) {
    const {translate} = useLocalize();
    return (
        <View style={styles.tabSelector}>
            {_.map(state.routes, (route, index) => {
                const isFocused = state.index === index;

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
                        isSelected={isFocused}
                        key={route.name}
                        title={translate(`tabSelector.${route.name}`)}
                        icon={getIcon(route.name)}
                        onPress={onPress}
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
