import type {ComponentType} from 'react';
import React from 'react';
import type {FormOnyxKeys} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {clearErrors} from '@userActions/FormActions';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';
import UploadPowerform from './subSteps/UploadPowerform';

type DocusignFullStepProps<TFormID extends keyof OnyxFormValuesMapping> = {
    /** Default value for file upload input */
    defaultValue: FileObject[];

    /** The ID of the form */
    formID: TFormID;

    /** ID of the input in the form */
    inputID: FormOnyxKeys<TFormID>;

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

type DocusignFullStepStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    defaultValue: FileObject[];

    /** The ID of the form */
    formID: TFormID;

    /** ID of the input in the form */
    inputID: FormOnyxKeys<TFormID>;

    /** Indicates that action is being processed */
    isLoading: boolean;

    /** Currency of related account */
    currency: string;
};

function DocusignFullStep<TFormID extends keyof OnyxFormValuesMapping>({
    defaultValue,
    formID,
    inputID,
    isLoading,
    onBackButtonPress,
    onSubmit,
    currency,
    startStepIndex,
    stepNames,
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
            wrapperID="DocusignFullStep"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('docusignStep.subheader')}
            stepNames={stepNames}
            startStepIndex={startStepIndex}
        >
            <SubStep
                defaultValue={defaultValue}
                formID={formID}
                inputID={inputID}
                isLoading={isLoading}
                isEditing={isEditing}
                onMove={moveTo}
                onNext={nextScreen}
                currency={currency}
            />
        </InteractiveStepWrapper>
    );
}

export default DocusignFullStep;
