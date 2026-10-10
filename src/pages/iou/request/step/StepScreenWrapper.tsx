import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Header from '@components/Header';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {ScreenWrapperChildrenProps} from '@components/ScreenWrapper';
import ScreenWrapper from '@components/ScreenWrapper';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import callOrReturn from '@src/types/utils/callOrReturn';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type StepScreenWrapperMenuItem = Pick<PopoverMenuItem, 'text' | 'onSelected' | 'sentryLabel' | 'shouldCallAfterModalHide'> & {
    icon: IconAsset;
};

type StepScreenWrapperProps = {
    /** The title to show in the header (should be translated already) */
    headerTitle: string;

    onBackButtonPress: () => void;

    /** A function triggered when the entry transition is ended. Useful for auto-focusing elements. */
    onEntryTransitionEnd?: () => void;

    /** Whether or not the wrapper should be shown (sometimes screens can be embedded inside another screen that already is using a wrapper) */
    shouldShowWrapper: boolean;

    shouldShowNotFoundPage?: boolean;
    shouldShowOfflineIndicator?: boolean;

    /** An ID used for unit testing */
    testID: string;

    includeSafeAreaPaddingBottom?: boolean;

    /** Returns a function as a child to pass insets to or a node to render without insets */
    children: ReactNode | ((props: ScreenWrapperChildrenProps) => ReactNode);

    shouldEnableKeyboardAvoidingView?: boolean;

    /** Menu items to display in the header three-dots / action button */
    threeDotsMenuItems?: StepScreenWrapperMenuItem[];

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
    shouldShowOfflineIndicator = true,
    shouldEnableKeyboardAvoidingView = true,
    threeDotsMenuItems,
    shouldMinimizeMenuButton,
}: StepScreenWrapperProps) {
    const styles = useThemeStyles();

    if (!shouldShowWrapper) {
        return <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>{children as ReactNode}</FullPageNotFoundView>;
    }

    const singleThreeDotsMenuItem = threeDotsMenuItems?.length === 1 && shouldMinimizeMenuButton ? threeDotsMenuItems.at(0) : undefined;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={includeSafeAreaPaddingBottom}
            onEntryTransitionEnd={onEntryTransitionEnd}
            testID={testID}
            shouldEnableMaxHeight={canUseTouchScreen()}
            shouldShowOfflineIndicator={shouldShowOfflineIndicator}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
        >
            {({insets, safeAreaPaddingBottomStyle, didScreenTransitionEnd}) => (
                <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>
                    <View style={[styles.flex1]}>
                        <HeaderWithBackButtonAndTitle
                            title={headerTitle}
                            onBackButtonPress={onBackButtonPress}
                        >
                            {singleThreeDotsMenuItem ? (
                                <Header.IconButton
                                    tooltipText={singleThreeDotsMenuItem.text ?? ''}
                                    onPress={singleThreeDotsMenuItem.onSelected}
                                    iconSrc={singleThreeDotsMenuItem.icon}
                                    sentryLabel={singleThreeDotsMenuItem.sentryLabel}
                                />
                            ) : (
                                !!threeDotsMenuItems?.length && <Header.ThreeDotsMenu items={threeDotsMenuItems} />
                            )}
                        </HeaderWithBackButtonAndTitle>{' '}
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
