import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {quitAndNavigateBack} from '@libs/actions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import type {StepCounterParams} from '@src/languages/params';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type TwoFactorAuthWrapperProps = ChildrenProps & {
    /** Name of the step */
    stepName: ValueOf<typeof CONST.TWO_FACTOR_AUTH_STEPS>;

    /** Title of the Header */
    title: string;

    /** Data to display a step counter in the header */
    stepCounter?: StepCounterParams;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    /** Flag to indicate if the keyboard avoiding view should be enabled */
    shouldEnableKeyboardAvoidingView?: boolean;
};

function TwoFactorAuthWrapper({stepName, title, stepCounter, onBackButtonPress, shouldEnableKeyboardAvoidingView = true, children}: TwoFactorAuthWrapperProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const isActingAsDelegate = !!account?.delegatedAccess?.delegate;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFound = useMemo(() => {
        if (!account) {
            return true;
        }

        const is2FAEnabled = !!account.requiresTwoFactorAuth;

        switch (stepName) {
            case CONST.TWO_FACTOR_AUTH_STEPS.COPY_CODES:
            case CONST.TWO_FACTOR_AUTH_STEPS.ENABLED:
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLE:
                return false;
            case CONST.TWO_FACTOR_AUTH_STEPS.VERIFY:
                return !account.codesAreCopied;
            case CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS:
                return !is2FAEnabled;
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLED:
                return is2FAEnabled;
            default:
                return false;
        }
    }, [account, stepName]);

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={TwoFactorAuthWrapper.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

    const defaultGoBack = () => quitAndNavigateBack(ROUTES.SETTINGS_SECURITY);

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            shouldEnableMaxHeight
            testID={stepName}
        >
            <FullPageNotFoundView
                shouldShow={shouldShowNotFound}
                linkKey="securityPage.goToSecurity"
                onLinkPress={defaultGoBack}
            >
                <HeaderWithBackButton
                    title={title}
                    stepCounter={stepCounter}
                    onBackButtonPress={onBackButtonPress ?? defaultGoBack}
                />
                <FullPageOfflineBlockingView>{children}</FullPageOfflineBlockingView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

TwoFactorAuthWrapper.displayName = 'TwoFactorAuthWrapper';

export default TwoFactorAuthWrapper;
