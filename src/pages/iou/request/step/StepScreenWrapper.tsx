import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {ScreenWrapperChildrenProps} from '@components/ScreenWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
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

    /** Whether to opt into edge-to-edge bottom safe area handling, so the inner content (e.g. a SelectionList footer) owns the bottom inset instead of the screen container */
    enableEdgeToEdgeBottomSafeAreaPadding?: boolean;

    /** Whether to disable the safe area padding that offsets the offline indicator in nested scrollable content (e.g. a SelectionList). Useful when the screen does not render the sticky offline indicator and the inner content owns the bottom padding. */
    disableOfflineIndicatorSafeAreaPadding?: boolean;

    /** Returns a function as a child to pass insets to or a node to render without insets */
    children: ReactNode | ((props: ScreenWrapperChildrenProps) => ReactNode);

    /** Flag to indicate if the keyboard avoiding view should be enabled */
    shouldEnableKeyboardAvoidingView?: boolean;

    /** Menu items to display in the header three-dots / action button */
    threeDotsMenuItems?: PopoverMenuItem[];

    /** When true and there is a single menu item, renders it as a direct icon button instead of a three-dots menu */
    shouldMinimizeMenuButton?: boolean;
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
    enableEdgeToEdgeBottomSafeAreaPadding,
    disableOfflineIndicatorSafeAreaPadding,
    shouldShowOfflineIndicator = true,
    shouldEnableKeyboardAvoidingView = true,
    threeDotsMenuItems,
    shouldMinimizeMenuButton,
}: StepScreenWrapperProps) {
    const styles = useThemeStyles();

    if (!shouldShowWrapper) {
        return <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>{children as ReactNode}</FullPageNotFoundView>;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={includeSafeAreaPaddingBottom}
            enableEdgeToEdgeBottomSafeAreaPadding={enableEdgeToEdgeBottomSafeAreaPadding}
            disableOfflineIndicatorSafeAreaPadding={disableOfflineIndicatorSafeAreaPadding}
            onEntryTransitionEnd={onEntryTransitionEnd}
            testID={testID}
            shouldEnableMaxHeight={canUseTouchScreen()}
            shouldShowOfflineIndicator={shouldShowOfflineIndicator}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
        >
            {({insets, safeAreaPaddingBottomStyle, didScreenTransitionEnd}) => (
                <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>
                    <View style={[styles.flex1]}>
                        <HeaderWithBackButton
                            title={headerTitle}
                            onBackButtonPress={onBackButtonPress}
                            shouldShowThreeDotsButton={!!threeDotsMenuItems?.length}
                            threeDotsMenuItems={threeDotsMenuItems}
                            shouldMinimizeMenuButton={shouldMinimizeMenuButton}
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
