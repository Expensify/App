import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';

const propTypes = {
    /** The things to display inside the screenwrapper */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

    /** The title to show in the header (should be translated already) */
    headerTitle: PropTypes.string.isRequired,

    /** A function triggered when the back button is pressed */
    onBackButtonPress: PropTypes.func.isRequired,

    /** A function triggered when the entry transition is ended. Useful for auto-focusing elements. */
    onEntryTransitionEnd: PropTypes.func,

    /** Whether or not the wrapper should be shown (sometimes screens can be embedded inside another screen that already is using a wrapper) */
    shouldShowWrapper: PropTypes.bool.isRequired,

    /** Whether or not to display not found page */
    shouldShowNotFoundPage: PropTypes.bool,

    /** An ID used for unit testing */
    testID: PropTypes.string.isRequired,

    /** Whether or not to include safe area padding */
    includeSafeAreaPaddingBottom: PropTypes.bool,
};

const defaultProps = {
    onEntryTransitionEnd: () => {},
    includeSafeAreaPaddingBottom: false,
    shouldShowNotFoundPage: false,
};

function StepScreenWrapper({testID, headerTitle, onBackButtonPress, onEntryTransitionEnd, children, shouldShowWrapper, shouldShowNotFoundPage, includeSafeAreaPaddingBottom}) {
    const styles = useThemeStyles();

    if (!shouldShowWrapper) {
        return <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>{children}</FullPageNotFoundView>;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={includeSafeAreaPaddingBottom}
            onEntryTransitionEnd={onEntryTransitionEnd}
            testID={testID}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
        >
            {({insets, safeAreaPaddingBottomStyle, didScreenTransitionEnd}) => (
                <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>
                    <View style={[styles.flex1]}>
                        <HeaderWithBackButton
                            title={headerTitle}
                            onBackButtonPress={onBackButtonPress}
                        />
                        {
                            // If props.children is a function, call it to provide the insets to the children.
                            _.isFunction(children)
                                ? children({
                                      insets,
                                      safeAreaPaddingBottomStyle,
                                      didScreenTransitionEnd,
                                  })
                                : children
                        }
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

StepScreenWrapper.displayName = 'StepScreenWrapper';
StepScreenWrapper.propTypes = propTypes;
StepScreenWrapper.defaultProps = defaultProps;

export default StepScreenWrapper;
