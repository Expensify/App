import {View} from 'react-native';
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import * as Expensicons from '../Icon/Expensicons';
import TabSelectorItem from './TabSelectorItem';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import styles from '../../styles/styles';
import {Animated} from 'react-native';

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

let animationProgressRef;
export const getProgressAnimationRef = () => animationProgressRef;

function TabSelector({state, navigation, onTabPress, position}) {
    const {translate} = useLocalize();

    useEffect(() => {
        animationProgressRef = position;
    }, [position]);

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
                        title={getTitle(route.name, translate)}
                        icon={getIcon(route.name)}
                        onPress={onPress}
                    />
                );
            })}

            {/* Note: this view doesn't render anything but binds the animation value so adding a listener works */}
            <Animated.View
                style={{
                    height: 0,
                    width: 0,
                    transform: [
                        {
                            translateX: position,
                        },
                    ],
                }}
            />
        </View>
    );
}

TabSelector.propTypes = propTypes;
TabSelector.defaultProps = defaultProps;
TabSelector.displayName = 'TabSelector';

export default TabSelector;
