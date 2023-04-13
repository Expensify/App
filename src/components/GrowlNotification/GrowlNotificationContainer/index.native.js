import React from 'react';
import {Animated} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import growlNotificationContainerPropTypes from './growlNotificationContainerPropTypes';

const propTypes = {
    ...growlNotificationContainerPropTypes,
};

const GrowlNotificationContainer = (props) => (
    <SafeAreaInsetsContext.Consumer>
        {(insets) => (
            <Animated.View style={[StyleUtils.getSafeAreaPadding(insets), styles.growlNotificationContainer, styles.growlNotificationTranslateY(props.translateY)]}>
                {props.children}
            </Animated.View>
        )}
    </SafeAreaInsetsContext.Consumer>
);

GrowlNotificationContainer.propTypes = propTypes;
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
