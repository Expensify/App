import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SignerInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

function SignerInfo({onBackButtonPress, onSubmit}: SignerInfoProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <InteractiveStepWrapper
            wrapperID={SignerInfo.displayName}
            handleBackButtonPress={onBackButtonPress}
            headerTitle={translate('signerInfoStep.signerInfo')}
            stepNames={CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES}
            startStepIndex={4}
        >
            <View style={styles.mtAuto}>
                <Button
                    success
                    large
                    style={[styles.w100, styles.mt2, styles.pb5, styles.ph5]}
                    onPress={onSubmit}
                    text={translate('common.confirm')}
                />
            </View>
        </InteractiveStepWrapper>
    );
}

SignerInfo.displayName = 'SignerInfo';

export default SignerInfo;
