import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type BeneficialOwnerInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

function BeneficialOwnerInfo({onBackButtonPress, onSubmit}: BeneficialOwnerInfoProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <InteractiveStepWrapper
            wrapperID={BeneficialOwnerInfo.displayName}
            handleBackButtonPress={onBackButtonPress}
            headerTitle={translate('beneficialOwnerInfoStep.companyOwner')}
            stepNames={CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES}
            startStepIndex={3}
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

BeneficialOwnerInfo.displayName = 'BeneficialOwnerInfo';

export default BeneficialOwnerInfo;
