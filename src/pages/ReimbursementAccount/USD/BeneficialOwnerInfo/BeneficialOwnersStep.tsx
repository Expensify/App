import {Str} from 'expensify-common';
import React, {useState} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateBeneficialOwnersForBankAccount} from '@userActions/BankAccounts';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SafeString from '@src/utils/SafeString';
import AddressUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/AddressUBO';
import ConfirmationUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/ConfirmationUBO';
import DateOfBirthUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/DateOfBirthUBO';
import LegalNameUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/LegalNameUBO';
import SocialSecurityNumberUBO from './subSteps/BeneficialOwnerDetailsFormSubSteps/SocialSecurityNumberUBO';
import CompanyOwnersListUBO from './subSteps/CompanyOwnersListUBO';

type BeneficialOwnersStepProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

type BeneficialOwnerSubStepProps = SubStepProps & {beneficialOwnerBeingModifiedID: string; setBeneficialOwnerBeingModifiedID?: (id: string) => void};

const SUBSTEP = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.SUBSTEP;
const MAX_NUMBER_OF_UBOS = 4;
const bodyContent: Array<React.ComponentType<BeneficialOwnerSubStepProps>> = [LegalNameUBO, DateOfBirthUBO, SocialSecurityNumberUBO, AddressUBO, ConfirmationUBO];

function BeneficialOwnersStep({onBackButtonPress}: BeneficialOwnersStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});

    const companyName = reimbursementAccount?.achData?.companyName ?? '';
    const policyID = reimbursementAccount?.achData?.policyID;
    const defaultValues = {
        ownsMoreThan25Percent: reimbursementAccount?.achData?.ownsMoreThan25Percent ?? reimbursementAccountDraft?.ownsMoreThan25Percent ?? false,
        hasOtherBeneficialOwners: reimbursementAccount?.achData?.hasOtherBeneficialOwners ?? reimbursementAccountDraft?.hasOtherBeneficialOwners ?? false,
        beneficialOwnerKeys: reimbursementAccount?.achData?.beneficialOwnerKeys ?? reimbursementAccountDraft?.beneficialOwnerKeys ?? [],
    };

    // We're only reading beneficialOwnerKeys from draft values because there is not option to remove UBO
    // if we were to set them based on values saved in BE then there would be no option to enter different UBOs
    // user would always see the same UBOs that was saved in BE when returning to this step and trying to change something
    const [beneficialOwnerKeys, setBeneficialOwnerKeys] = useState<string[]>(defaultValues.beneficialOwnerKeys);
    const [beneficialOwnerBeingModifiedID, setBeneficialOwnerBeingModifiedID] = useState('');
    const [isEditingCreatedBeneficialOwner, setIsEditingCreatedBeneficialOwner] = useState(false);
    const [isUserUBO, setIsUserUBO] = useState(defaultValues.ownsMoreThan25Percent);
    const [isAnyoneElseUBO, setIsAnyoneElseUBO] = useState(defaultValues.hasOtherBeneficialOwners);
    const [currentUBOSubStep, setCurrentUBOSubStep] = useState(1);
    const canAddMoreUBOS = beneficialOwnerKeys.length < (isUserUBO ? MAX_NUMBER_OF_UBOS - 1 : MAX_NUMBER_OF_UBOS);

    const submit = () => {
        const beneficialOwnerFields = ['firstName', 'lastName', 'dob', 'ssnLast4', 'street', 'city', 'state', 'zipCode'];
        const beneficialOwners = beneficialOwnerKeys.map((ownerKey) =>
            beneficialOwnerFields.reduce(
                (acc, fieldName) => {
                    acc[fieldName] = reimbursementAccountDraft ? SafeString(reimbursementAccountDraft[`beneficialOwner_${ownerKey}_${fieldName}`]) : undefined;
                    return acc;
                },
                {} as Record<string, string | undefined>,
            ),
        );

        updateBeneficialOwnersForBankAccount(
            Number(reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID),
            {
                ownsMoreThan25Percent: isUserUBO,
                beneficialOwners: JSON.stringify(beneficialOwners),
                beneficialOwnerKeys,
            },
            policyID,
        );
    };

    const addBeneficialOwner = (beneficialOwnerID: string) => {
        // Each beneficial owner is assigned a unique key that will connect it to values in saved ONYX.
        // That way we can dynamically render each Identity Form based on which keys are present in the beneficial owners array.
        const newBeneficialOwners = [...beneficialOwnerKeys, beneficialOwnerID];

        setBeneficialOwnerKeys(newBeneficialOwners);
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwners: JSON.stringify(newBeneficialOwners)});
    };
    const handleBeneficialOwnerDetailsFormSubmit = () => {
        const shouldAddBeneficialOwner = !beneficialOwnerKeys.find((beneficialOwnerID) => beneficialOwnerID === beneficialOwnerBeingModifiedID) && canAddMoreUBOS;

        if (shouldAddBeneficialOwner) {
            addBeneficialOwner(beneficialOwnerBeingModifiedID);
        }

        // Because beneficialOwnerKeys array is not yet updated at this point we need to check against lower MAX_NUMBER_OF_UBOS (account for the one that is being added)
        const isLastUBOThatCanBeAdded = beneficialOwnerKeys.length === (isUserUBO ? MAX_NUMBER_OF_UBOS - 2 : MAX_NUMBER_OF_UBOS - 1);
        setCurrentUBOSubStep(isEditingCreatedBeneficialOwner || isLastUBOThatCanBeAdded ? SUBSTEP.UBOS_LIST : SUBSTEP.ARE_THERE_MORE_UBOS);
        setIsEditingCreatedBeneficialOwner(false);
    };

    const {
        componentToRender: BeneficialOwnerDetailsForm,
        isEditing,
        screenIndex,
        nextScreen,
        prevScreen,
        moveTo,
        resetScreenIndex,
        goToTheLastStep,
    } = useSubStep<BeneficialOwnerSubStepProps>({
        bodyContent,
        startFrom: 0,
        onFinished: handleBeneficialOwnerDetailsFormSubmit,
    });

    const prepareBeneficialOwnerDetailsForm = () => {
        const beneficialOwnerID = Str.guid();
        setBeneficialOwnerBeingModifiedID(beneficialOwnerID);
        // Reset Beneficial Owner Details Form to first subStep
        resetScreenIndex();
        setCurrentUBOSubStep(SUBSTEP.UBO_DETAILS_FORM);
    };

    const handleNextUBOSubstep = (value: boolean) => {
        if (currentUBOSubStep === SUBSTEP.IS_USER_UBO) {
            setIsUserUBO(value);

            // User is an owner but there are 4 other owners already added, so we remove last one
            if (value && beneficialOwnerKeys.length === 4) {
                setBeneficialOwnerKeys((previousBeneficialOwners) => previousBeneficialOwners.slice(0, 3));
            }

            setCurrentUBOSubStep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            return;
        }

        if (currentUBOSubStep === SUBSTEP.IS_ANYONE_ELSE_UBO) {
            setIsAnyoneElseUBO(value);

            if (!canAddMoreUBOS && value) {
                setCurrentUBOSubStep(SUBSTEP.UBOS_LIST);
                return;
            }

            if (canAddMoreUBOS && value) {
                prepareBeneficialOwnerDetailsForm();
                return;
            }

            // User is not an owner and no one else is an owner
            if (!isUserUBO && !value) {
                submit();
                return;
            }

            // User is an owner and no one else is an owner
            if (isUserUBO && !value) {
                setCurrentUBOSubStep(SUBSTEP.UBOS_LIST);
                return;
            }
        }

        // Are there more UBOs
        if (currentUBOSubStep === SUBSTEP.ARE_THERE_MORE_UBOS) {
            if (value) {
                prepareBeneficialOwnerDetailsForm();
                return;
            }
            setCurrentUBOSubStep(SUBSTEP.UBOS_LIST);
            return;
        }

        // User reached the limit of UBOs
        if (currentUBOSubStep === SUBSTEP.UBO_DETAILS_FORM && !canAddMoreUBOS) {
            setCurrentUBOSubStep(SUBSTEP.UBOS_LIST);
        }
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        // User goes back to previous step
        if (currentUBOSubStep === SUBSTEP.IS_USER_UBO) {
            onBackButtonPress();
            // User reached limit of UBOs and goes back to initial question about additional UBOs
        } else if (currentUBOSubStep === SUBSTEP.UBOS_LIST && !canAddMoreUBOS) {
            setCurrentUBOSubStep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            // User goes back to last radio button
        } else if (currentUBOSubStep === SUBSTEP.UBOS_LIST && isAnyoneElseUBO) {
            setCurrentUBOSubStep(SUBSTEP.ARE_THERE_MORE_UBOS);
        } else if (currentUBOSubStep === SUBSTEP.UBOS_LIST && isUserUBO && !isAnyoneElseUBO) {
            setCurrentUBOSubStep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            // User moves between subSteps of beneficial owner details form
        } else if (currentUBOSubStep === SUBSTEP.UBO_DETAILS_FORM && screenIndex > 0) {
            prevScreen();
        } else {
            setCurrentUBOSubStep((currentSubstep) => currentSubstep - 1);
        }
    };

    const handleUBOEdit = (beneficialOwnerID: string) => {
        setBeneficialOwnerBeingModifiedID(beneficialOwnerID);
        setIsEditingCreatedBeneficialOwner(true);
        setCurrentUBOSubStep(SUBSTEP.UBO_DETAILS_FORM);
    };

    return (
        <InteractiveStepWrapper
            wrapperID="BeneficialOwnersStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('beneficialOwnerInfoStep.companyOwner')}
            handleBackButtonPress={handleBackButtonPress}
            shouldShowOfflineIndicatorInWideScreen={currentUBOSubStep === SUBSTEP.UBOS_LIST}
            startStepIndex={5}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            {currentUBOSubStep === SUBSTEP.IS_USER_UBO && (
                <YesNoStep
                    title={translate('beneficialOwnerInfoStep.doYouOwn25percent', companyName)}
                    description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}
                    submitButtonStyles={[styles.mb0]}
                    defaultValue={isUserUBO}
                    onSelectedValue={handleNextUBOSubstep}
                />
            )}

            {currentUBOSubStep === SUBSTEP.IS_ANYONE_ELSE_UBO && (
                <YesNoStep
                    title={translate('beneficialOwnerInfoStep.doAnyIndividualOwn25percent', companyName)}
                    description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}
                    submitButtonStyles={[styles.mb0]}
                    defaultValue={isAnyoneElseUBO}
                    onSelectedValue={handleNextUBOSubstep}
                />
            )}

            {currentUBOSubStep === SUBSTEP.UBO_DETAILS_FORM && (
                <BeneficialOwnerDetailsForm
                    isEditing={isEditing}
                    beneficialOwnerBeingModifiedID={beneficialOwnerBeingModifiedID}
                    setBeneficialOwnerBeingModifiedID={setBeneficialOwnerBeingModifiedID}
                    onNext={nextScreen}
                    onMove={moveTo}
                />
            )}

            {currentUBOSubStep === SUBSTEP.ARE_THERE_MORE_UBOS && (
                <YesNoStep
                    title={translate('beneficialOwnerInfoStep.areThereMoreIndividualsWhoOwn25percent', companyName)}
                    description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}
                    submitButtonStyles={[styles.mb0]}
                    onSelectedValue={handleNextUBOSubstep}
                    defaultValue={false}
                />
            )}

            {currentUBOSubStep === SUBSTEP.UBOS_LIST && (
                <CompanyOwnersListUBO
                    beneficialOwnerKeys={beneficialOwnerKeys}
                    handleUBOsConfirmation={submit}
                    handleUBOEdit={handleUBOEdit}
                    isUserUBO={isUserUBO}
                    isAnyoneElseUBO={isAnyoneElseUBO}
                />
            )}
        </InteractiveStepWrapper>
    );
}

export default BeneficialOwnersStep;
