import type {ComponentType} from 'react';
import React from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {clearErrors} from '@userActions/FormActions';
import ONYXKEYS from '@src/ONYXKEYS';
import Confirmation from './subSteps/Confirmation';

type CountryFullStepProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Array of step names */
    stepNames: readonly string[];

    /** Handles submit button press */
    onSubmit: () => void;

    /** ID of current policy */
    policyID: string | undefined;

    /** Whether the user is coming from the expensify card */
    isComingFromExpensifyCard?: boolean;
};

type CountrySubStepProps = {
    /** ID of current policy */
    policyID: string | undefined;
} & SubStepProps;

const bodyContent: Array<ComponentType<CountrySubStepProps>> = [Confirmation];

function CountryFullStep({onBackButtonPress, stepNames, onSubmit, policyID, isComingFromExpensifyCard}: CountryFullStepProps) {
    const {translate} = useLocalize();

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<CountrySubStepProps>({bodyContent, startFrom: 0, onFinished: onSubmit});

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
            wrapperID="CountryFullStep"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('countryStep.confirmCurrency')}
            stepNames={stepNames}
            startStepIndex={0}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                isComingFromExpensifyCard={isComingFromExpensifyCard}
                policyID={policyID}
            />
        </InteractiveStepWrapper>
    );
}

export default CountryFullStep;
