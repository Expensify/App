import React, {useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import TwoFactorAuthForm from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthForm/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function GetCode() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const formRef = useRef<BaseTwoFactorAuthFormRef>(null);

    const {setStep} = useTwoFactorAuthContext();

    return (
        <StepWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.GETCODE}
            title={translate('twoFactorAuth.disableTwoFactorAuth')}
            onBackButtonPress={() => setStep(CONST.TWO_FACTOR_AUTH_STEPS.ENABLED, CONST.ANIMATION_DIRECTION.OUT)}
            onEntryTransitionEnd={() => formRef.current && formRef.current.focus()}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <View style={[styles.ph5, styles.mt3]}>
                    <Text>{translate('twoFactorAuth.explainProcessToRemove')}</Text>
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mt2, styles.pt2]}>
                <View style={[styles.mh5, styles.mb4]}>
                    <TwoFactorAuthForm
                        innerRef={formRef}
                        validateInsteadOfDisable={false}
                    />
                </View>
                <Button
                    success
                    large
                    text={translate('twoFactorAuth.disable')}
                    isLoading={account?.isLoading}
                    onPress={() => {
                        if (!formRef.current) {
                            return;
                        }
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                        formRef.current.validateAndSubmitForm();
                    }}
                />
            </FixedFooter>
        </StepWrapper>
    );
}

GetCode.displayName = 'GetCode';

export default GetCode;
