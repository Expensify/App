import _ from 'underscore';
import React from 'react';
import {Animated} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import styles, {getSafeAreaPadding} from '../../../styles/styles';
import {windowDimensionsPropTypes} from '../../withWindowDimensions';
import GrowlNotificationContainerPropTypes from './GrowlNotificationContainerPropTypes';

const propTypes = {
    ..._.omit(GrowlNotificationContainerPropTypes, _.keys(windowDimensionsPropTypes)),
};

const GrowlNotificationContainer = ({children, translateY}) => (
    <SafeAreaInsetsContext.Consumer>
        {insets => (
            <Animated.View
                style={[
                    styles.growlNotificationContainer,
                    getSafeAreaPadding(insets),
                    styles.growlNotificationTranslateY(translateY),
                ]}
            >
                {children}
            </Animated.View>
        )}
    </SafeAreaInsetsContext.Consumer>
);

GrowlNotificationContainer.propTypes = propTypes;
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
