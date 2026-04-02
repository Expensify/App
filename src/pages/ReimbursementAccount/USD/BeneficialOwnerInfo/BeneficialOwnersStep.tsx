import {Str} from 'expensify-common';
import React, {useCallback, useEffect} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountSubmit from '@hooks/useReimbursementAccountSubmit';
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

    /** Back to URL for preserving navigation context */
    backTo?: string;
};

const PAGE_NAMES = CONST.BANK_ACCOUNT.PAGE_NAMES;
const SUB_PAGE_NAMES = CONST.BANK_ACCOUNT.BENEFICIAL_OWNERS_STEP.SUB_PAGE_NAMES;
const MAX_NUMBER_OF_UBOS = 4;

const OUTER_SUB_PAGES = new Set<string>([SUB_PAGE_NAMES.IS_USER_UBO, SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO, SUB_PAGE_NAMES.ARE_THERE_MORE_UBOS, SUB_PAGE_NAMES.UBOS_LIST]);

function BeneficialOwnersStep({onBackButtonPress, onSubmit, currentSubPage, policyID, backTo}: BeneficialOwnersStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const companyName = reimbursementAccount?.achData?.companyName ?? '';
    const markSubmitting = useReimbursementAccountSubmit(onSubmit);

    // Read state from Onyx draft so it survives URL-based navigation (component remounts)
    const isUserUBO = reimbursementAccountDraft?.ownsMoreThan25Percent ?? reimbursementAccount?.achData?.ownsMoreThan25Percent ?? false;
    const beneficialOwners = reimbursementAccount?.achData?.beneficialOwners;
    const isAnyoneElseUBO = beneficialOwners?.length ? true : (reimbursementAccountDraft?.hasOtherBeneficialOwners ?? false);
    const beneficialOwnerKeys: string[] = reimbursementAccountDraft?.beneficialOwnerKeys ?? reimbursementAccount?.achData?.beneficialOwnerKeys ?? [];
    // eslint-disable-next-line rulesdir/no-default-id-values
    const beneficialOwnerBeingModifiedID = reimbursementAccountDraft?.ownerBeingModifiedID ?? '';
    const isEditingCreatedBeneficialOwner = reimbursementAccountDraft?.isEditingCreatedOwner ?? false;
    const canAddMoreUBOS = beneficialOwnerKeys.length < (isUserUBO ? MAX_NUMBER_OF_UBOS - 1 : MAX_NUMBER_OF_UBOS);

    const hasCompletedBeneficialOwnersStep = reimbursementAccount?.achData?.ownsMoreThan25Percent !== undefined;

    // Redirect to the correct sub-page if no subPage is in the URL
    useEffect(() => {
        if (currentSubPage) {
            return;
        }

        let subPage: string = SUB_PAGE_NAMES.IS_USER_UBO;
        if (isUserUBO || (isAnyoneElseUBO && beneficialOwnerKeys.length > 0)) {
            subPage = SUB_PAGE_NAMES.UBOS_LIST;
        } else if (hasCompletedBeneficialOwnersStep) {
            subPage = SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO;
        }

        Navigation.setParams({subPage} as Record<string, unknown>);
    }, [currentSubPage, policyID, backTo, isAnyoneElseUBO, beneficialOwnerKeys.length, isUserUBO, hasCompletedBeneficialOwnersStep]);

    const navigateToSubPage = useCallback(
        (subPage: string) => {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: PAGE_NAMES.BENEFICIAL_OWNERS, subPage, backTo}));
        },
        [policyID, backTo],
    );

    const navigateBackToSubPage = useCallback(
        (subPage: string) => {
            Navigation.goBack(ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: PAGE_NAMES.BENEFICIAL_OWNERS, subPage, backTo}));
        },
        [policyID, backTo],
    );

    const submit = () => {
        const beneficialOwnerFields = ['firstName', 'lastName', 'dob', 'ssnLast4', 'street', 'city', 'state', 'zipCode'];
        const beneficialOwnersData = beneficialOwnerKeys.map((ownerKey) =>
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
                beneficialOwners: JSON.stringify(beneficialOwnersData),
                beneficialOwnerKeys,
            },
            policyID,
        );
        markSubmitting();
    };

    const addBeneficialOwner = (beneficialOwnerID: string) => {
        const newBeneficialOwners = [...beneficialOwnerKeys, beneficialOwnerID];
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwnerKeys: newBeneficialOwners, beneficialOwners: JSON.stringify(newBeneficialOwners)});
    };

    const handleBeneficialOwnerDetailsFormSubmit = () => {
        const shouldAddBeneficialOwner = !beneficialOwnerKeys.find((beneficialOwnerID) => beneficialOwnerID === beneficialOwnerBeingModifiedID) && canAddMoreUBOS;

        if (shouldAddBeneficialOwner && beneficialOwnerBeingModifiedID) {
            addBeneficialOwner(beneficialOwnerBeingModifiedID);
        }

        const isLastUBOThatCanBeAdded = beneficialOwnerKeys.length === (isUserUBO ? MAX_NUMBER_OF_UBOS - 2 : MAX_NUMBER_OF_UBOS - 1);
        const nextSubPage = isEditingCreatedBeneficialOwner || isLastUBOThatCanBeAdded ? SUB_PAGE_NAMES.UBOS_LIST : SUB_PAGE_NAMES.ARE_THERE_MORE_UBOS;
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {isEditingCreatedOwner: false});
        navigateToSubPage(nextSubPage);
    };

    const prepareBeneficialOwnerDetailsForm = () => {
        const beneficialOwnerID = Str.guid();
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {ownerBeingModifiedID: beneficialOwnerID});
        navigateToSubPage(SUB_PAGE_NAMES.LEGAL_NAME);
    };

    const handleNextUBOSubstep = (value: boolean) => {
        if (currentSubPage === SUB_PAGE_NAMES.IS_USER_UBO) {
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {ownsMoreThan25Percent: value});

            if (value && beneficialOwnerKeys.length === 4) {
                setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwnerKeys: beneficialOwnerKeys.slice(0, 3)});
            }

            navigateToSubPage(SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO);
            return;
        }

        if (currentSubPage === SUB_PAGE_NAMES.IS_ANYONE_ELSE_UBO) {
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {hasOtherBeneficialOwners: value});

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
        setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {ownerBeingModifiedID: beneficialOwnerID, isEditingCreatedOwner: true});
        navigateToSubPage(SUB_PAGE_NAMES.LEGAL_NAME);
    };

    // If the current sub page is not an outer page, render the details form
    if (currentSubPage && !OUTER_SUB_PAGES.has(currentSubPage)) {
        return (
            <BeneficialOwnerDetailsFormPages
                policyID={policyID}
                beneficialOwnerBeingModifiedID={beneficialOwnerBeingModifiedID}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                setBeneficialOwnerBeingModifiedID={(id: string) => setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {ownerBeingModifiedID: id})}
                isEditingCreatedBeneficialOwner={isEditingCreatedBeneficialOwner}
                onFinished={handleBeneficialOwnerDetailsFormSubmit}
                backTo={backTo}
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
