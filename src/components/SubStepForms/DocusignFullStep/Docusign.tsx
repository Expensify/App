import type {ComponentType} from 'react';
import React from 'react';
import type {FormOnyxKeys} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {clearErrors} from '@userActions/FormActions';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import UploadPowerform from './subSteps/UploadPowerform';

type DocusignFullStepProps<TFormID extends keyof OnyxFormValuesMapping> = {
    /** The ID of the form */
    formID: TFormID;

    /** ID of the input in the form */
    inputID: FormOnyxKeys<TFormID>;

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

type DocusignFullStepStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    policyCurrency: string | undefined;

    /** The ID of the form */
    formID: TFormID;

    /** ID of the input in the form */
    inputID: FormOnyxKeys<TFormID>;
};

function DocusignFullStep<TFormID extends keyof OnyxFormValuesMapping>({
    onBackButtonPress,
    onSubmit,
    stepNames,
    formID,
    startStepIndex,
    policyCurrency,
    inputID,
}: DocusignFullStepProps<TFormID>) {
    const {translate} = useLocalize();

    const bodyContent: Array<ComponentType<DocusignFullStepStepProps<TFormID>>> = [UploadPowerform];

    const {
        componentToRender: SubStep,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        goToTheLastStep,
    } = useSubStep<DocusignFullStepStepProps<TFormID>>({bodyContent, startFrom: 0, onFinished: onSubmit});

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
            wrapperID={DocusignFullStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('docusignStep.subheader')}
            stepNames={stepNames}
            startStepIndex={startStepIndex}
        >
            <SubStep
                formID={formID}
                inputID={inputID}
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                policyCurrency={policyCurrency}
            />
        </InteractiveStepWrapper>
    );
}

DocusignFullStep.displayName = 'DocusignFullStep';

export default DocusignFullStep;
