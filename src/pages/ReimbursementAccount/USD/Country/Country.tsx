import type {ComponentType} from 'react';
import React from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CountryConfirmationSubStep from '@pages/ReimbursementAccount/CountryConfirmationSubStep';
import {clearErrors} from '@userActions/FormActions';
import {goToWithdrawalAccountSetupStep} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CountryProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** ID of current policy */
    policyID: string | undefined;

    /** Array of step names */
    stepNames?: readonly string[];
};

type CountryStepProps = {
    /** ID of current policy */
    policyID: string | undefined;
} & SubStepProps;

const bodyContent: Array<ComponentType<CountryStepProps>> = [CountryConfirmationSubStep];

function Country({onBackButtonPress, policyID, stepNames}: CountryProps) {
    const {translate} = useLocalize();

    const submit = () => {
        goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
    };

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<CountryStepProps>({bodyContent, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
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
            wrapperID={Country.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('countryStep.confirmCurrency')}
            stepNames={stepNames}
            startStepIndex={0}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                policyID={policyID}
            />
        </InteractiveStepWrapper>
    );
}

Country.displayName = 'Country';

export default Country;
