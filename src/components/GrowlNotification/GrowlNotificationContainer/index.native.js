import React from 'react';
import {Animated} from 'react-native';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import growlNotificationContainerPropTypes from './growlNotificationContainerPropTypes';

const propTypes = {
    ...growlNotificationContainerPropTypes,
};

function GrowlNotificationContainer(props) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
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
