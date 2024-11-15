import type {ComponentType} from 'react';
import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Address from './substeps/Address';
import BusinessType from './substeps/BusinessType';
import Confirmation from './substeps/Confirmation';
import ContactInformation from './substeps/ContactInformation';
import IncorporationLocation from './substeps/IncorporationLocation';
import Name from './substeps/Name';
import PaymentVolume from './substeps/PaymentVolume';
import RegistrationNumber from './substeps/RegistrationNumber';

type BusinessInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

const bodyContent: Array<ComponentType<SubStepProps>> = [Name, Address, ContactInformation, RegistrationNumber, IncorporationLocation, BusinessType, PaymentVolume, Confirmation];

function BusinessInfo({onBackButtonPress, onSubmit}: BusinessInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const country = reimbursementAccount?.achData?.additionalData?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';

    useEffect(() => {
        BankAccounts.getCorpayOnboardingFields(country);
    }, [country]);

    const submit = () => {
        onSubmit();
    };

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo, goToTheLastStep} = useSubStep({bodyContent, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (screenIndex === 0) {
            onBackButtonPress();
        } else {
            prevScreen();
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID={BusinessInfo.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('businessInfoStep.businessInfoTitle')}
            stepNames={CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES}
            startStepIndex={2}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

BusinessInfo.displayName = 'BusinessInfo';

export default BusinessInfo;
