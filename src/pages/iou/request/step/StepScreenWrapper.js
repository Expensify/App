import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** The things to display inside the screenwrapper */
    children: PropTypes.node.isRequired,

    /** The title to show in the header (should be translated already) */
    headerTitle: PropTypes.string.isRequired,

    /** A function triggered when the back button is pressed */
    onBackButtonPress: PropTypes.func.isRequired,

    /** A function triggered when the entry transition is ended. Useful for auto-focusing elements. */
    onEntryTransitionEnd: PropTypes.func,

    /** Whether or not the wrapper should be shown (sometimes screens can be embedded inside another screen that already is using a wrapper) */
    shouldShowWrapper: PropTypes.bool.isRequired,

    /** An ID used for unit testing */
    testID: PropTypes.string.isRequired,
};

const defaultProps = {
    onEntryTransitionEnd: () => {},
};

function StepScreenWrapper({testID, headerTitle, onBackButtonPress, onEntryTransitionEnd, children, shouldShowWrapper}) {
    const styles = useThemeStyles();

    if (!shouldShowWrapper) {
        return children;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            onEntryTransitionEnd={onEntryTransitionEnd}
            testID={testID}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        onBackButtonPress={onBackButtonPress}
                    />
                    {children}
                </View>
            )}
        </ScreenWrapper>
    );
}

StepScreenWrapper.displayName = 'StepScreenWrapper';
StepScreenWrapper.propTypes = propTypes;
StepScreenWrapper.defaultProps = defaultProps;

export default StepScreenWrapper;
