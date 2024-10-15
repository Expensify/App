import {Str} from 'expensify-common';
import React, {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import * as BankAccounts from '@userActions/BankAccounts';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import type {ReimbursementAccount} from '@src/types/onyx';
import BeneficialOwnerCheckUBO from './BeneficialOwnerInfo/substeps/BeneficialOwnerCheckUBO';
import AddressUBO from './BeneficialOwnerInfo/substeps/BeneficialOwnerDetailsFormSubsteps/AddressUBO';
import ConfirmationUBO from './BeneficialOwnerInfo/substeps/BeneficialOwnerDetailsFormSubsteps/ConfirmationUBO';
import DateOfBirthUBO from './BeneficialOwnerInfo/substeps/BeneficialOwnerDetailsFormSubsteps/DateOfBirthUBO';
import LegalNameUBO from './BeneficialOwnerInfo/substeps/BeneficialOwnerDetailsFormSubsteps/LegalNameUBO';
import SocialSecurityNumberUBO from './BeneficialOwnerInfo/substeps/BeneficialOwnerDetailsFormSubsteps/SocialSecurityNumberUBO';
import CompanyOwnersListUBO from './BeneficialOwnerInfo/substeps/CompanyOwnersListUBO';

type BeneficialOwnerInfoOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};

type BeneficialOwnersStepProps = BeneficialOwnerInfoOnyxProps & {
    /** Goes to the previous step */
    onBackButtonPress: () => void;
};

type BeneficialOwnerSubStepProps = SubStepProps & {beneficialOwnerBeingModifiedID: string; setBeneficialOwnerBeingModifiedID?: (id: string) => void};

const SUBSTEP = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.SUBSTEP;
const MAX_NUMBER_OF_UBOS = 4;
const bodyContent: Array<React.ComponentType<BeneficialOwnerSubStepProps>> = [LegalNameUBO, DateOfBirthUBO, SocialSecurityNumberUBO, AddressUBO, ConfirmationUBO];

function BeneficialOwnersStep({reimbursementAccount, reimbursementAccountDraft, onBackButtonPress}: BeneficialOwnersStepProps) {
    const {translate} = useLocalize();
    const companyName = reimbursementAccount?.achData?.companyName ?? '';
    const policyID = reimbursementAccount?.achData?.policyID ?? '-1';
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
    const [currentUBOSubstep, setCurrentUBOSubstep] = useState(1);
    const canAddMoreUBOS = beneficialOwnerKeys.length < (isUserUBO ? MAX_NUMBER_OF_UBOS - 1 : MAX_NUMBER_OF_UBOS);

    const submit = () => {
        const beneficialOwnerFields = ['firstName', 'lastName', 'dob', 'ssnLast4', 'street', 'city', 'state', 'zipCode'];
        const beneficialOwners = beneficialOwnerKeys.map((ownerKey) =>
            beneficialOwnerFields.reduce((acc, fieldName) => {
                acc[fieldName] = reimbursementAccountDraft ? reimbursementAccountDraft[`beneficialOwner_${ownerKey}_${fieldName}`] : undefined;
                return acc;
            }, {} as Record<string, string | undefined>),
        );

        BankAccounts.updateBeneficialOwnersForBankAccount(
            Number(reimbursementAccount?.achData?.bankAccountID ?? '-1'),
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
        FormActions.setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwners: JSON.stringify(newBeneficialOwners)});
    };
    const handleBeneficialOwnerDetailsFormSubmit = () => {
        const shouldAddBeneficialOwner = !beneficialOwnerKeys.find((beneficialOwnerID) => beneficialOwnerID === beneficialOwnerBeingModifiedID) && canAddMoreUBOS;

        if (shouldAddBeneficialOwner) {
            addBeneficialOwner(beneficialOwnerBeingModifiedID);
        }

        // Because beneficialOwnerKeys array is not yet updated at this point we need to check against lower MAX_NUMBER_OF_UBOS (account for the one that is being added)
        const isLastUBOThatCanBeAdded = beneficialOwnerKeys.length === (isUserUBO ? MAX_NUMBER_OF_UBOS - 2 : MAX_NUMBER_OF_UBOS - 1);
        setCurrentUBOSubstep(isEditingCreatedBeneficialOwner || isLastUBOThatCanBeAdded ? SUBSTEP.UBOS_LIST : SUBSTEP.ARE_THERE_MORE_UBOS);
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
        // Reset Beneficial Owner Details Form to first substep
        resetScreenIndex();
        setCurrentUBOSubstep(SUBSTEP.UBO_DETAILS_FORM);
    };

    const handleNextUBOSubstep = (value: boolean) => {
        if (currentUBOSubstep === SUBSTEP.IS_USER_UBO) {
            setIsUserUBO(value);

            // User is an owner but there are 4 other owners already added, so we remove last one
            if (value && beneficialOwnerKeys.length === 4) {
                setBeneficialOwnerKeys((previousBeneficialOwners) => previousBeneficialOwners.slice(0, 3));
            }

            setCurrentUBOSubstep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            return;
        }

        if (currentUBOSubstep === SUBSTEP.IS_ANYONE_ELSE_UBO) {
            setIsAnyoneElseUBO(value);

            if (!canAddMoreUBOS && value) {
                setCurrentUBOSubstep(SUBSTEP.UBOS_LIST);
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
                setCurrentUBOSubstep(SUBSTEP.UBOS_LIST);
                return;
            }
        }

        // Are there more UBOs
        if (currentUBOSubstep === SUBSTEP.ARE_THERE_MORE_UBOS) {
            if (value) {
                prepareBeneficialOwnerDetailsForm();
                return;
            }
            setCurrentUBOSubstep(SUBSTEP.UBOS_LIST);
            return;
        }

        // User reached the limit of UBOs
        if (currentUBOSubstep === SUBSTEP.UBO_DETAILS_FORM && !canAddMoreUBOS) {
            setCurrentUBOSubstep(SUBSTEP.UBOS_LIST);
        }
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        // User goes back to previous step
        if (currentUBOSubstep === SUBSTEP.IS_USER_UBO) {
            onBackButtonPress();
            // User reached limit of UBOs and goes back to initial question about additional UBOs
        } else if (currentUBOSubstep === SUBSTEP.UBOS_LIST && !canAddMoreUBOS) {
            setCurrentUBOSubstep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            // User goes back to last radio button
        } else if (currentUBOSubstep === SUBSTEP.UBOS_LIST && isAnyoneElseUBO) {
            setCurrentUBOSubstep(SUBSTEP.ARE_THERE_MORE_UBOS);
        } else if (currentUBOSubstep === SUBSTEP.UBOS_LIST && isUserUBO && !isAnyoneElseUBO) {
            setCurrentUBOSubstep(SUBSTEP.IS_ANYONE_ELSE_UBO);
            // User moves between substeps of beneficial owner details form
        } else if (currentUBOSubstep === SUBSTEP.UBO_DETAILS_FORM && screenIndex > 0) {
            prevScreen();
        } else {
            setCurrentUBOSubstep((currentSubstep) => currentSubstep - 1);
        }
    };

    const handleUBOEdit = (beneficialOwnerID: string) => {
        setBeneficialOwnerBeingModifiedID(beneficialOwnerID);
        setIsEditingCreatedBeneficialOwner(true);
        setCurrentUBOSubstep(SUBSTEP.UBO_DETAILS_FORM);
    };

    return (
        <InteractiveStepWrapper
            wrapperID={BeneficialOwnersStep.displayName}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('beneficialOwnerInfoStep.companyOwner')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={4}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            {currentUBOSubstep === SUBSTEP.IS_USER_UBO && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.doYouOwn25percent')} ${companyName}?`}
                    defaultValue={isUserUBO}
                    onSelectedValue={handleNextUBOSubstep}
                />
            )}

            {currentUBOSubstep === SUBSTEP.IS_ANYONE_ELSE_UBO && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.doAnyIndividualOwn25percent')} ${companyName}?`}
                    defaultValue={isAnyoneElseUBO}
                    onSelectedValue={handleNextUBOSubstep}
                />
            )}

            {currentUBOSubstep === SUBSTEP.UBO_DETAILS_FORM && (
                <BeneficialOwnerDetailsForm
                    isEditing={isEditing}
                    beneficialOwnerBeingModifiedID={beneficialOwnerBeingModifiedID}
                    setBeneficialOwnerBeingModifiedID={setBeneficialOwnerBeingModifiedID}
                    onNext={nextScreen}
                    onMove={moveTo}
                />
            )}

            {currentUBOSubstep === SUBSTEP.ARE_THERE_MORE_UBOS && (
                <BeneficialOwnerCheckUBO
                    title={`${translate('beneficialOwnerInfoStep.areThereMoreIndividualsWhoOwn25percent')} ${companyName}?`}
                    onSelectedValue={handleNextUBOSubstep}
                    defaultValue={false}
                />
            )}

            {currentUBOSubstep === SUBSTEP.UBOS_LIST && (
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

BeneficialOwnersStep.displayName = 'BeneficialOwnersStep';

export default withOnyx<BeneficialOwnersStepProps, BeneficialOwnerInfoOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(BeneficialOwnersStep);
