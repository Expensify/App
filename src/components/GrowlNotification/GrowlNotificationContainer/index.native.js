import React from 'react';
import {Animated} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import styles, {getSafeAreaPadding} from '../../../styles/styles';
import growlNotificationContainerPropTypes from './growlNotificationContainerPropTypes';

const propTypes = {
    ...growlNotificationContainerPropTypes,
};

const GrowlNotificationContainer = props => (
    <SafeAreaInsetsContext.Consumer>
        {insets => (
            <Animated.View
                style={[
                    styles.growlNotificationContainer,
                    getSafeAreaPadding(insets),
                    styles.growlNotificationTranslateY(props.translateY),
                ]}
            >
                {props.children}
            </Animated.View>
        )}
    </SafeAreaInsetsContext.Consumer>
);

GrowlNotificationContainer.propTypes = propTypes;
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
