import type {ComponentType} from 'react';
import React from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AverageReimbursement from './subSteps/AverageReimbursement';
import BusinessType from './subSteps/BusinessType';
import Confirmation from './subSteps/Confirmation';
import PaymentVolume from './subSteps/PaymentVolume';
import RegistrationNumber from './subSteps/RegistrationNumber';

type BusinessInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Currency of bank account */
    currency: string;

    /** Country of bank account */
    country: Country | '';
};

type BusinessInfoSubStepProps = SubStepProps & {currency: string; country: Country | ''};

const bodyContent: Array<ComponentType<BusinessInfoSubStepProps>> = [RegistrationNumber, BusinessType, PaymentVolume, AverageReimbursement, Confirmation];

function BusinessInfo({onBackButtonPress, onSubmit, currency, country}: BusinessInfoProps) {
    const {translate} = useLocalize();

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<BusinessInfoSubStepProps>({bodyContent, startFrom: 0, onFinished: onSubmit});

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
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
            wrapperID="BusinessInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('businessInfoStep.businessInfoTitle')}
            stepNames={CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP_NAMES}
            startStepIndex={0}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                screenIndex={screenIndex}
                country={country}
                currency={currency}
            />
        </InteractiveStepWrapper>
    );
}

export default BusinessInfo;
