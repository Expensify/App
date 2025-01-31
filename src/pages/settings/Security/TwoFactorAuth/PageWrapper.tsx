import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import CONST from '@src/CONST';
import type {StepCounterParams} from '@src/languages/params';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type PageWrapperProps = ChildrenProps & {
    /** Name of the step */
    stepName: string;

    /** Title of the Header */
    title: string;

    /** Data to display a step counter in the header */
    stepCounter?: StepCounterParams;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    /** Flag to indicate if the keyboard avoiding view should be enabled */
    shouldEnableKeyboardAvoidingView?: boolean;
};

function PageWrapper({stepName, title, stepCounter, onBackButtonPress, shouldEnableKeyboardAvoidingView = true, children}: PageWrapperProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={PageWrapper.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            shouldEnableMaxHeight
            testID={stepName}
        >
            <HeaderWithBackButton
                title={title}
                stepCounter={stepCounter}
                onBackButtonPress={onBackButtonPress}
            />
            <FullPageOfflineBlockingView>{children}</FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

PageWrapper.displayName = 'VerifyStepPage';

export default PageWrapper;
