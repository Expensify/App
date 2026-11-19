import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useOnyx from '@hooks/useOnyx';

import {quitAndNavigateBack} from '@libs/actions/TwoFactorAuthActions';

import CONST from '@src/CONST';
import type {StepCounterParams} from '@src/languages/params';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ValueOf} from 'type-fest';

import {useRoute} from '@react-navigation/native';
import React from 'react';

type TwoFactorAuthWrapperProps = ChildrenProps & {
    stepName: ValueOf<typeof CONST.TWO_FACTOR_AUTH_STEPS>;

    /** Title of the Header */
    title: string;

    /** Data to display a step counter in the header */
    stepCounter?: StepCounterParams;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    shouldEnableKeyboardAvoidingView?: boolean;
    shouldEnableMaxHeight?: boolean;
};

function TwoFactorAuthWrapper({stepName, title, stepCounter, onBackButtonPress, shouldEnableKeyboardAvoidingView = true, shouldEnableMaxHeight = true, children}: TwoFactorAuthWrapperProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    let shouldShowNotFound;
    if (!account) {
        shouldShowNotFound = true;
    } else {
        const is2FAEnabled = !!account.requiresTwoFactorAuth;
        switch (stepName) {
            case CONST.TWO_FACTOR_AUTH_STEPS.COPY_CODES:
            case CONST.TWO_FACTOR_AUTH_STEPS.ENABLED:
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLE:
            case CONST.TWO_FACTOR_AUTH_STEPS.REPLACE_VERIFY_NEW:
            case CONST.TWO_FACTOR_AUTH_STEPS.REPLACE_VERIFY_OLD:
                shouldShowNotFound = false;
                break;
            case CONST.TWO_FACTOR_AUTH_STEPS.VERIFY:
                shouldShowNotFound = !account.codesAreCopied;
                break;
            case CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS:
                shouldShowNotFound = !is2FAEnabled;
                break;
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLED:
                shouldShowNotFound = is2FAEnabled;
                break;
            default:
                shouldShowNotFound = false;
                break;
        }
    }

    const route = useRoute();
    const backTo = (route.params as {backTo?: Route} | undefined)?.backTo;
    const defaultGoBack = () => quitAndNavigateBack(!!account?.requiresTwoFactorAuth, backTo ?? ROUTES.SETTINGS_SECURITY.getRoute());

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            shouldEnableMaxHeight={shouldEnableMaxHeight}
            testID={stepName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFound}
                    linkTranslationKey="securityPage.goToSecurity"
                    onLinkPress={defaultGoBack}
                >
                    <HeaderWithBackButton
                        title={title}
                        stepCounter={stepCounter}
                        onBackButtonPress={onBackButtonPress ?? defaultGoBack}
                    />
                    <FullPageOfflineBlockingView>{children}</FullPageOfflineBlockingView>
                </FullPageNotFoundView>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default TwoFactorAuthWrapper;
