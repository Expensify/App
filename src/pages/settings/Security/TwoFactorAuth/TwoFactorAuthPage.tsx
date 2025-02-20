import React from 'react';
import {useOnyx} from 'react-native-onyx';
import AnimatedStepProvider from '@components/AnimatedStep/AnimatedStepProvider';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import ScreenWrapper from '@components/ScreenWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import TwoFactorAuthSteps from './TwoFactorAuthSteps';

function TwoFactorAuthPage() {
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => !!account?.delegatedAccess?.delegate});
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
        <AnimatedStepProvider>
            <TwoFactorAuthSteps />
        </AnimatedStepProvider>
    );
}

TwoFactorAuthPage.displayName = 'TwoFactorAuthPage';

export default TwoFactorAuthPage;
