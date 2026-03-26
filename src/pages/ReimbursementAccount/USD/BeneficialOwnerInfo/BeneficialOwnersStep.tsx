import {Str} from 'expensify-common';
import React, {useCallback, useState} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getBankAccountIDAsNumber} from '@libs/ReimbursementAccountUtils';
import {updateBeneficialOwnersForBankAccount} from '@userActions/BankAccounts';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SafeString from '@src/utils/SafeString';
import BeneficialOwnerDetailsFormPages from './BeneficialOwnerDetailsFormPages';
import CompanyOwnersListUBO from './subSteps/CompanyOwnersListUBO';

type BeneficialOwnersStepProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Handles submit button press (URL-based navigation) */
    onSubmit?: () => void;

    /** Name of the current sub page */
    currentSubPage?: string;

    /** ID of current policy */
    policyID?: string;
};

const PAGE_NAMES = CONST.BANK_ACCOUNT.PAGE_NAMES;
const SUB_PAGE_NAMES = CONST.BANK_ACCOUNT.BENEFICIAL_OWNERS_STEP.SUB_PAGE_NAMES;
const MAX_NUMBER_OF_UBOS = 4;

const OUTER_SUB_PAGES = new Set<string>([SUB_PAGE_NAMES.IS_USER_UBO, SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO, SUB_PAGE_NAMES.ARE_THERE_MORE_UBOS, SUB_PAGE_NAMES.UBOS_LIST]);

function BeneficialOwnersStep({onBackButtonPress, onSubmit, currentSubPage, policyID}: BeneficialOwnersStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const companyName = reimbursementAccount?.achData?.companyName ?? '';
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
    const canAddMoreUBOS = beneficialOwnerKeys.length < (isUserUBO ? MAX_NUMBER_OF_UBOS - 1 : MAX_NUMBER_OF_UBOS);

    const navigateToSubPage = useCallback(
        (subPage: string) => {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, step: PAGE_NAMES.BENEFICIAL_OWNERS, subPage}));
        },
        [policyID],
    );

    const navigateBackToSubPage = useCallback(
        (subPage: string) => {
            Navigation.goBack(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, step: PAGE_NAMES.BENEFICIAL_OWNERS, subPage}));
        },
        [policyID],
    );

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
            getBankAccountIDAsNumber(reimbursementAccount?.achData),
            {
                ownsMoreThan25Percent: isUserUBO,
                beneficialOwners: JSON.stringify(beneficialOwners),
                beneficialOwnerKeys,
            },
            policyID,
        );
        onSubmit?.();
    };

    const addBeneficialOwner = (beneficialOwnerID: string) => {
        const newBeneficialOwners = [...beneficialOwnerKeys, beneficialOwnerID];
        setBeneficialOwnerKeys(newBeneficialOwners);
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwners: JSON.stringify(newBeneficialOwners)});
    };

    const handleBeneficialOwnerDetailsFormSubmit = () => {
        const shouldAddBeneficialOwner = !beneficialOwnerKeys.find((beneficialOwnerID) => beneficialOwnerID === beneficialOwnerBeingModifiedID) && canAddMoreUBOS;

        if (shouldAddBeneficialOwner) {
            addBeneficialOwner(beneficialOwnerBeingModifiedID);
        }

        const isLastUBOThatCanBeAdded = beneficialOwnerKeys.length === (isUserUBO ? MAX_NUMBER_OF_UBOS - 2 : MAX_NUMBER_OF_UBOS - 1);
        const nextSubPage = isEditingCreatedBeneficialOwner || isLastUBOThatCanBeAdded ? SUB_PAGE_NAMES.UBOS_LIST : SUB_PAGE_NAMES.ARE_THERE_MORE_UBOS;
        setIsEditingCreatedBeneficialOwner(false);
        navigateToSubPage(nextSubPage);
    };

    const prepareBeneficialOwnerDetailsForm = () => {
        const beneficialOwnerID = Str.guid();
        setBeneficialOwnerBeingModifiedID(beneficialOwnerID);
        navigateToSubPage(SUB_PAGE_NAMES.LEGAL_NAME);
    };

    const handleNextUBOSubstep = (value: boolean) => {
        if (currentSubPage === SUB_PAGE_NAMES.IS_USER_UBO) {
            setIsUserUBO(value);

            if (value && beneficialOwnerKeys.length === 4) {
                setBeneficialOwnerKeys((previousBeneficialOwners) => previousBeneficialOwners.slice(0, 3));
            }

            navigateToSubPage(SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO);
            return;
        }

        if (currentSubPage === SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO) {
            setIsAnyoneElseUBO(value);

            if (!canAddMoreUBOS && value) {
                navigateToSubPage(SUB_PAGE_NAMES.UBOS_LIST);
                return;
            }

            if (canAddMoreUBOS && value) {
                prepareBeneficialOwnerDetailsForm();
                return;
            }

            if (!isUserUBO && !value) {
                submit();
                return;
            }

            if (isUserUBO && !value) {
                navigateToSubPage(SUB_PAGE_NAMES.UBOS_LIST);
                return;
            }
        }

        if (currentSubPage === SUB_PAGE_NAMES.ARE_THERE_MORE_UBOS) {
            if (value) {
                prepareBeneficialOwnerDetailsForm();
                return;
            }
            navigateToSubPage(SUB_PAGE_NAMES.UBOS_LIST);
        }
    };

    const handleBackButtonPress = () => {
        if (currentSubPage === SUB_PAGE_NAMES.IS_USER_UBO) {
            onBackButtonPress();
        } else if (currentSubPage === SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO) {
            navigateBackToSubPage(SUB_PAGE_NAMES.IS_USER_UBO);
        } else if (currentSubPage === SUB_PAGE_NAMES.UBOS_LIST && !canAddMoreUBOS) {
            navigateBackToSubPage(SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO);
        } else if (currentSubPage === SUB_PAGE_NAMES.UBOS_LIST && isAnyoneElseUBO) {
            navigateBackToSubPage(SUB_PAGE_NAMES.ARE_THERE_MORE_UBOS);
        } else if (currentSubPage === SUB_PAGE_NAMES.UBOS_LIST && isUserUBO && !isAnyoneElseUBO) {
            navigateBackToSubPage(SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO);
        } else {
            Navigation.goBack();
        }
    };

    const handleUBOEdit = (beneficialOwnerID: string) => {
        setBeneficialOwnerBeingModifiedID(beneficialOwnerID);
        setIsEditingCreatedBeneficialOwner(true);
        navigateToSubPage(SUB_PAGE_NAMES.LEGAL_NAME);
    };

    // If the current sub page is not an outer page, render the details form
    if (currentSubPage && !OUTER_SUB_PAGES.has(currentSubPage)) {
        return (
            <BeneficialOwnerDetailsFormPages
                policyID={policyID}
                beneficialOwnerBeingModifiedID={beneficialOwnerBeingModifiedID}
                setBeneficialOwnerBeingModifiedID={setBeneficialOwnerBeingModifiedID}
                isEditingCreatedBeneficialOwner={isEditingCreatedBeneficialOwner}
                onFinished={handleBeneficialOwnerDetailsFormSubmit}
            />
        );
    }

    return (
        <InteractiveStepWrapper
            wrapperID="BeneficialOwnersStep"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('beneficialOwnerInfoStep.companyOwner')}
            handleBackButtonPress={handleBackButtonPress}
            shouldShowOfflineIndicatorInWideScreen={currentSubPage === SUB_PAGE_NAMES.UBOS_LIST}
            startStepIndex={5}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            {currentSubPage === SUB_PAGE_NAMES.IS_USER_UBO && (
                <YesNoStep
                    title={translate('beneficialOwnerInfoStep.doYouOwn25percent', companyName)}
                    description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}
                    submitButtonStyles={[styles.mb0]}
                    defaultValue={isUserUBO}
                    onSelectedValue={handleNextUBOSubstep}
                />
            )}

            {currentSubPage === SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO && (
                <YesNoStep
                    title={translate('beneficialOwnerInfoStep.doAnyIndividualOwn25percent', companyName)}
                    description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}
                    submitButtonStyles={[styles.mb0]}
                    defaultValue={isAnyoneElseUBO}
                    onSelectedValue={handleNextUBOSubstep}
                />
            )}

            {currentSubPage === SUB_PAGE_NAMES.ARE_THERE_MORE_UBOS && (
                <YesNoStep
                    title={translate('beneficialOwnerInfoStep.areThereMoreIndividualsWhoOwn25percent', companyName)}
                    description={translate('beneficialOwnerInfoStep.regulationRequiresUsToVerifyTheIdentity')}
                    submitButtonStyles={[styles.mb0]}
                    onSelectedValue={handleNextUBOSubstep}
                    defaultValue={false}
                />
            )}

            {currentSubPage === SUB_PAGE_NAMES.UBOS_LIST && (
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
