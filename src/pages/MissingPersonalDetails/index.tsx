/* eslint-disable no-case-declarations */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import Navigation from '@libs/Navigation/Navigation';
import * as FormActions from '@userActions/FormActions';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import Address from './substeps/Address';
import DateOfBirth from './substeps/DateOfBirth';
import LegalName from './substeps/LegalName';
import PhoneNumber from './substeps/PhoneNumber';
import type {CustomSubStepProps} from './types';
import getFormValues from './utils/getFormValues';
import getInitialStepForPersonalInfo from './utils/getInitialStepForPersonalInfo';

const formSteps = [LegalName, DateOfBirth, Address, PhoneNumber];

function MissingPersonalDetails() {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [personalDetailsForm] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
    const [personalDetailsFormDraft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [currentStep, setCurrentStep] = useState(getInitialStepForPersonalInfo(personalDetailsFormDraft));

    useEffect(() => {
        setCurrentStep(getInitialStepForPersonalInfo(personalDetailsFormDraft));
    }, [personalDetailsFormDraft]);

    const firstUnissuedCard = useMemo(() => Object.values(cardList ?? {}).find((card) => card.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED), [cardList]);
    const values = useMemo(() => getFormValues(INPUT_IDS, personalDetailsFormDraft, personalDetailsForm), [personalDetailsForm, personalDetailsFormDraft]);

    const handleFinishStep = useCallback(() => {
        PersonalDetails.updatePersonalDetailsAndShipExpensifyCard(values, firstUnissuedCard?.cardID ?? 0);
        FormActions.clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
        Navigation.goBack();
    }, [firstUnissuedCard?.cardID, values]);

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
        goToTheLastStep,
    } = useSubStep<CustomSubStepProps>({
        bodyContent: formSteps,
        startFrom: currentStep,
        onFinished: handleFinishStep,
        onNextSubStep: () => setCurrentStep(currentStep + 1),
    });

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        // Clicking back on the first screen should dismiss the modal
        if (screenIndex === CONST.MISSING_PERSONAL_DETAILS_INDEXES.MAPPING.LEGAL_NAME) {
            Navigation.goBack();
            return;
        }
        setCurrentStep(currentStep - 1);
        prevScreen();
    };

    return (
        <InteractiveStepWrapper
            wrapperID={MissingPersonalDetails.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.expensifyCard.addShippingDetails')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={currentStep}
            stepNames={CONST.MISSING_PERSONAL_DETAILS_INDEXES.INDEX_LIST}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                screenIndex={screenIndex}
                privatePersonalDetails={privatePersonalDetails}
            />
        </InteractiveStepWrapper>
    );
}

MissingPersonalDetails.displayName = 'MissingPersonalDetails';

export default MissingPersonalDetails;
