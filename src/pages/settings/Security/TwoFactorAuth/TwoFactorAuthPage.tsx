import type {ReactNode} from 'react';
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
    const initialStep = account?.requiresTwoFactorAuth ? CONST.TWO_FACTOR_AUTH_STEPS.ENABLED : CONST.TWO_FACTOR_AUTH_STEPS.CODES;

    const backTo = route.params?.backTo ?? '';
    const forwardTo = route.params?.forwardTo ?? '';

    const steps: Record<string, ReactNode> = useMemo(
        () => ({
            [CONST.TWO_FACTOR_AUTH_STEPS.CODES]: (
                <CodesStep
                    backTo={backTo}
                    key={CONST.TWO_FACTOR_AUTH_STEPS.CODES}
                />
            ),
            [CONST.TWO_FACTOR_AUTH_STEPS.VERIFY]: <VerifyStep key={CONST.TWO_FACTOR_AUTH_STEPS.VERIFY} />,
            [CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS]: (
                <SuccessStep
                    backTo={backTo}
                    forwardTo={forwardTo}
                    key={CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS}
                />
            ),
            [CONST.TWO_FACTOR_AUTH_STEPS.ENABLED]: <EnabledStep key={CONST.TWO_FACTOR_AUTH_STEPS.ENABLED} />,
            [CONST.TWO_FACTOR_AUTH_STEPS.DISABLED]: <DisabledStep key={CONST.TWO_FACTOR_AUTH_STEPS.DISABLED} />,
            [CONST.TWO_FACTOR_AUTH_STEPS.GETCODE]: <GetCodeStep key={CONST.TWO_FACTOR_AUTH_STEPS.GETCODE} />,
        }),
        [backTo, forwardTo],
    );

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
            steps={steps}
        >
            <TwoFactorAuthSteps />
        </AnimatedStepProvider>
    );
}

TwoFactorAuthPage.displayName = 'TwoFactorAuthPage';

export default TwoFactorAuthPage;
