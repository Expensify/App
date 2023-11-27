import React from 'react';
import {Animated} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import growlNotificationContainerPropTypes from './growlNotificationContainerPropTypes';

const propTypes = {
    ...growlNotificationContainerPropTypes,
};

function GrowlNotificationContainer(props) {
    const styles = useThemeStyles();
    return (
        <SafeAreaInsetsContext.Consumer>
            {(insets) => (
                <Animated.View style={[StyleUtils.getSafeAreaPadding(insets), styles.growlNotificationContainer, styles.growlNotificationTranslateY(props.translateY)]}>
                    {props.children}
                </Animated.View>
            )}
        </SafeAreaInsetsContext.Consumer>
    );
}

GrowlNotificationContainer.propTypes = propTypes;
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
