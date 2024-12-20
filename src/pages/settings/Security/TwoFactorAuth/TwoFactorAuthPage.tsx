import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import AnimatedStepProvider from '@components/AnimatedStep/AnimatedStepProvider';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import CodesStep from './Steps/CodesStep';
import DisabledStep from './Steps/DisabledStep';
import EnabledStep from './Steps/EnabledStep';
import GetCodeStep from './Steps/GetCode';
import SuccessStep from './Steps/SuccessStep';
import VerifyStep from './Steps/VerifyStep';
import TwoFactorAuthSteps from './TwoFactorAuthSteps';

type TwoFactorAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.TWO_FACTOR_AUTH>;

function TwoFactorAuthPage({route}: TwoFactorAuthPageProps) {
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const initialStep = useMemo(() => {
        if (account?.twoFactorAuthStep) {
            return account.twoFactorAuthStep;
        }
        return account?.requiresTwoFactorAuth ? CONST.TWO_FACTOR_AUTH_STEPS.ENABLED : CONST.TWO_FACTOR_AUTH_STEPS.CODES;
    }, [account?.requiresTwoFactorAuth, account?.twoFactorAuthStep]);

    const backTo = route.params?.backTo ?? '';
    const forwardTo = route.params?.forwardTo ?? '';

    const renderStep = (name: string) => {
        switch (name) {
            case CONST.TWO_FACTOR_AUTH_STEPS.CODES:
                return <CodesStep backTo={backTo} />;
            case CONST.TWO_FACTOR_AUTH_STEPS.VERIFY:
                return <VerifyStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS:
                return (
                    <SuccessStep
                        backTo={backTo}
                        forwardTo={forwardTo}
                    />
                );
            case CONST.TWO_FACTOR_AUTH_STEPS.ENABLED:
                return <EnabledStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.DISABLED:
                return <DisabledStep />;
            case CONST.TWO_FACTOR_AUTH_STEPS.GETCODE:
                return <GetCodeStep />;
            default:
                return <CodesStep backTo={backTo} />;
        }
    };

    if (isActingAsDelegate) {
        return (
            <ScreenWrapper
                testID={TwoFactorAuthPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]} />
            </ScreenWrapper>
        );
    }

    return (
        <AnimatedStepProvider
            initialStep={initialStep}
            renderStep={renderStep}
        >
            <TwoFactorAuthSteps />
        </AnimatedStepProvider>
    );
}

TwoFactorAuthPage.displayName = 'TwoFactorAuthPage';

export default TwoFactorAuthPage;
