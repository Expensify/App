import React from 'react';
import {Animated} from 'react-native';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@styles/useThemeStyles';
import StyleUtils from '@styles/utils/StyleUtils';
import growlNotificationContainerPropTypes from './growlNotificationContainerPropTypes';

const propTypes = {
    ...growlNotificationContainerPropTypes,
};

function GrowlNotificationContainer(props) {
    const styles = useThemeStyles();
    const insets = useSafeAreaInsets;

    return (
        <Animated.View style={[StyleUtils.getSafeAreaPadding(insets), styles.growlNotificationContainer, styles.growlNotificationTranslateY(props.translateY)]}>
            {props.children}
        </Animated.View>
    );
}

GrowlNotificationContainer.propTypes = propTypes;
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
