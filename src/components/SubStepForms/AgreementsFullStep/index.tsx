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
    /** The ID of the form */
    formID: TFormID;

    /** Input IDs for field in the form */
    inputIDs: {
        provideTruthfulInformation: FormOnyxKeys<TFormID>;
        agreeToTermsAndConditions: FormOnyxKeys<TFormID>;
        consentToPrivacyNotice: FormOnyxKeys<TFormID>;
        authorizedToBindClientToAgreement: FormOnyxKeys<TFormID>;
    };

    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Array of step names */
    stepNames?: readonly string[];

    /** Index of currently active step in header */
    startStepIndex: number;

    /** Currency of the policy */
    policyCurrency: string | undefined;
};

type AgreementsFullStepSubStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    policyCurrency: string | undefined;

    /** The ID of the form */
    formID: TFormID;

    /** Input IDs for field in the form */
    inputIDs: AgreementsFullStepProps<TFormID>['inputIDs'];
};

function AgreementsFullStep<TFormID extends keyof OnyxFormValuesMapping>({
    formID,
    inputIDs,
    onBackButtonPress,
    onSubmit,
    stepNames,
    startStepIndex,
    policyCurrency,
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
            wrapperID={AgreementsFullStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('agreementsStep.agreements')}
            stepNames={stepNames}
            startStepIndex={startStepIndex}
        >
            <SubStep
                formID={formID}
                inputIDs={inputIDs}
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                policyCurrency={policyCurrency}
            />
        </InteractiveStepWrapper>
    );
}

AgreementsFullStep.displayName = 'AgreementsFullStep';

export default AgreementsFullStep;
