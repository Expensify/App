import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ScreenWrapperChildrenProps} from '@components/ScreenWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import callOrReturn from '@src/types/utils/callOrReturn';

type StepScreenWrapperProps = {
    /** The title to show in the header (should be translated already) */
    headerTitle: string;

    /** A function triggered when the back button is pressed */
    onBackButtonPress: () => void;

    /** A function triggered when the entry transition is ended. Useful for auto-focusing elements. */
    onEntryTransitionEnd?: () => void;

    /** Whether or not the wrapper should be shown (sometimes screens can be embedded inside another screen that already is using a wrapper) */
    shouldShowWrapper: boolean;

    /** Whether or not to display not found page */
    shouldShowNotFoundPage?: boolean;

    /** Whether to show offline indicator */
    shouldShowOfflineIndicator?: boolean;

    /** An ID used for unit testing */
    testID: string;

    /** Whether or not to include safe area padding */
    includeSafeAreaPaddingBottom?: boolean;

    /** Returns a function as a child to pass insets to or a node to render without insets */
    children: ReactNode | React.FC<ScreenWrapperChildrenProps>;
};

function StepScreenWrapper({
    testID,
    headerTitle,
    onBackButtonPress,
    onEntryTransitionEnd,
    children,
    shouldShowWrapper,
    shouldShowNotFoundPage,
    includeSafeAreaPaddingBottom,
    shouldShowOfflineIndicator = true,
}: StepScreenWrapperProps) {
    const styles = useThemeStyles();

    if (!shouldShowWrapper) {
        return <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>{children as ReactNode}</FullPageNotFoundView>;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={includeSafeAreaPaddingBottom}
            onEntryTransitionEnd={onEntryTransitionEnd}
            testID={testID}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
            shouldShowOfflineIndicator={shouldShowOfflineIndicator}
        >
            {({insets, safeAreaPaddingBottomStyle, didScreenTransitionEnd}) => (
                <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>
                    <View style={[styles.flex1]}>
                        <HeaderWithBackButton
                            title={headerTitle}
                            onBackButtonPress={onBackButtonPress}
                        />
                        {
                            // If props.children is a function, call it to provide the insets to the children
                            callOrReturn(children, {insets, safeAreaPaddingBottomStyle, didScreenTransitionEnd})
                        }
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

export default StepScreenWrapper;
