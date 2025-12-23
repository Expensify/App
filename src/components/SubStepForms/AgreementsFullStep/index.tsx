import type {ComponentType} from 'react';
import React from 'react';
import type {FormOnyxKeys} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {clearErrors} from '@userActions/FormActions';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import Confirmation from './subSteps/Confirmation';

type AgreementsFullStepProps<TFormID extends keyof OnyxFormValuesMapping> = {
    /** Default values for inputs */
    defaultValues: Partial<Record<FormOnyxKeys<TFormID>, boolean>>;

    /** The ID of the form */
    formID: TFormID;

    /** Input IDs for field in the form */
    inputIDs: {
        provideTruthfulInformation: FormOnyxKeys<TFormID>;
        agreeToTermsAndConditions: FormOnyxKeys<TFormID>;
        consentToPrivacyNotice: FormOnyxKeys<TFormID>;
        authorizedToBindClientToAgreement: FormOnyxKeys<TFormID>;
    };

    /** Indicates that action is being processed */
    isLoading: boolean;

    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Currency of related account */
    currency: string;

    /** Array of step names */
    stepNames?: readonly string[];

    /** Index of currently active step in header */
    startStepIndex: number;
};

type AgreementsFullStepSubStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    /** Default values for inputs */
    defaultValues: AgreementsFullStepProps<TFormID>['defaultValues'];

    /** The ID of the form */
    formID: TFormID;

    /** Input IDs for field in the form */
    inputIDs: AgreementsFullStepProps<TFormID>['inputIDs'];

    /** Indicates that action is being processed */
    isLoading: boolean;

    /** Currency of related account */
    currency: string;
};

function AgreementsFullStep<TFormID extends keyof OnyxFormValuesMapping>({
    defaultValues,
    formID,
    inputIDs,
    isLoading,
    onBackButtonPress,
    onSubmit,
    currency,
    stepNames,
    startStepIndex,
}: AgreementsFullStepProps<TFormID>) {
    const {translate} = useLocalize();

    const bodyContent: Array<ComponentType<AgreementsFullStepSubStepProps<TFormID>>> = [Confirmation];

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<AgreementsFullStepSubStepProps<TFormID>>({bodyContent, startFrom: 0, onFinished: onSubmit});

    const handleBackButtonPress = () => {
        clearErrors(formID);
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
            wrapperID="AgreementsFullStep"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('agreementsStep.agreements')}
            stepNames={stepNames}
            startStepIndex={startStepIndex}
        >
            <SubStep
                defaultValues={defaultValues}
                formID={formID}
                inputIDs={inputIDs}
                isEditing={isEditing}
                isLoading={isLoading}
                onMove={moveTo}
                onNext={nextScreen}
                currency={currency}
            />
        </InteractiveStepWrapper>
    );
}

export default AgreementsFullStep;
