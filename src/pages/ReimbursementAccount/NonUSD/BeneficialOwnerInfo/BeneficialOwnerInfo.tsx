import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import YesNoStep from '@components/SubStepForms/YesNoStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import getOwnerDetailsAndOwnerFilesForBeneficialOwners from '@pages/ReimbursementAccount/NonUSD/utils/getOwnerDetailsAndOwnerFilesForBeneficialOwners';
import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';
import {clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners, saveCorpayOnboardingBeneficialOwners} from '@userActions/BankAccounts';
import {clearErrors, setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import SafeString from '@src/utils/SafeString';
import BeneficialOwnerDetailsFormPages from './BeneficialOwnerDetailsFormPages';
import BeneficialOwnersList from './BeneficialOwnersList';

const {PAGE_NAME, BENEFICIAL_OWNER_INFO_STEP} = CONST.NON_USD_BANK_ACCOUNT;
const SUB_PAGE_NAMES = BENEFICIAL_OWNER_INFO_STEP.SUB_PAGE_NAMES;
const {OWNERSHIP_PERCENTAGE, PREFIX} = BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const {OWNS_MORE_THAN_25_PERCENT, ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE, BENEFICIAL_OWNERS, COMPANY_NAME} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const OUTER_SUB_PAGES = new Set<string>([
    SUB_PAGE_NAMES.IS_USER_BENEFICIAL_OWNER,
    SUB_PAGE_NAMES.IS_ANYONE_ELSE_BENEFICIAL_OWNER,
    SUB_PAGE_NAMES.ARE_THERE_MORE_BENEFICIAL_OWNERS,
    SUB_PAGE_NAMES.BENEFICIAL_OWNERS_LIST,
]);

function BeneficialOwnerInfo({onBackButtonPress, onSubmit, stepNames, currentSubPage}: NonUSDPageProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const companyName = reimbursementAccount?.achData?.corpay?.[COMPANY_NAME] ?? reimbursementAccountDraft?.[COMPANY_NAME] ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const policyID = reimbursementAccount?.achData?.policyID;

    const isUserOwner = reimbursementAccount?.achData?.corpay?.[OWNS_MORE_THAN_25_PERCENT] ?? reimbursementAccountDraft?.[OWNS_MORE_THAN_25_PERCENT] ?? false;
    const isAnyoneElseOwner = reimbursementAccount?.achData?.corpay?.[ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE] ?? reimbursementAccountDraft?.[ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE] ?? false;
    const ownerKeys = reimbursementAccountDraft?.beneficialOwnerKeys ?? [];

    const totalOwnedPercentageSum = ownerKeys.reduce((acc, key) => {
        const percentageKey = `${PREFIX}_${key}_${OWNERSHIP_PERCENTAGE}` as const;
        return acc + (Number(SafeString(reimbursementAccountDraft?.[percentageKey])) || 0);
    }, 0);
    const canAddMoreOwners = totalOwnedPercentageSum <= 75;

    const isSubmittingRef = useRef(false);

    const shouldRedirect = !currentSubPage;

    useEffect(() => {
        if (!shouldRedirect) {
            return;
        }
        Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.IS_USER_BENEFICIAL_OWNER}), {
            forceReplace: true,
        });
    }, [shouldRedirect, policyID]);

    const submit = useCallback(
        ({anyIndividualOwn25PercentOrMore}: {anyIndividualOwn25PercentOrMore?: boolean} = {}) => {
            const currentOwnerKeys = reimbursementAccountDraft?.beneficialOwnerKeys ?? [];
            const {ownerDetails, ownerFiles} = getOwnerDetailsAndOwnerFilesForBeneficialOwners(currentOwnerKeys, reimbursementAccountDraft);

            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {
                [OWNS_MORE_THAN_25_PERCENT]: isUserOwner,
                [ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE]: isAnyoneElseOwner,
                [BENEFICIAL_OWNERS]: JSON.stringify(ownerDetails),
            });

            isSubmittingRef.current = true;
            saveCorpayOnboardingBeneficialOwners({
                inputs: JSON.stringify({...ownerDetails, anyIndividualOwn25PercentOrMore}),
                ...ownerFiles,
                beneficialOwnerIDs: currentOwnerKeys.length > 0 ? currentOwnerKeys.join(',') : undefined,
                bankAccountID,
            });
        },
        [bankAccountID, isAnyoneElseOwner, isUserOwner, reimbursementAccountDraft],
    );

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields || !reimbursementAccount?.isSuccess) {
            return;
        }

        // We need to check value of local isSubmittingRef because on initial render reimbursementAccount?.isSuccess is still true after submitting the previous step
        if (reimbursementAccount?.isSuccess && isSubmittingRef.current) {
            isSubmittingRef.current = false;
            onSubmit();
            clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners();
        }

        return () => {
            clearReimbursementAccountSaveCorpayOnboardingBeneficialOwners();
        };
    }, [reimbursementAccount?.errors, reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields, reimbursementAccount?.isSuccess, onSubmit]);

    const prepareOwnerDetailsForm = useCallback(
        (ownerID: string) => {
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {ownerBeingModifiedID: ownerID});
            Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.NAME}));
        },
        [policyID],
    );

    const handleOwnerDetailsFormFinished = useCallback(() => {
        const ownerBeingModifiedID = reimbursementAccountDraft?.ownerBeingModifiedID ?? CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY;
        const currentOwnerKeys = reimbursementAccountDraft?.beneficialOwnerKeys ?? [];
        const isFreshOwner = !currentOwnerKeys.includes(ownerBeingModifiedID);
        const isEditingCreatedOwner = reimbursementAccountDraft?.isEditingCreatedOwner ?? false;
        const isUserEnteringHisOwnData = ownerBeingModifiedID === CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY;

        let updatedOwnerKeys = currentOwnerKeys;
        if (isFreshOwner) {
            updatedOwnerKeys = [...currentOwnerKeys, ownerBeingModifiedID];
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwnerKeys: updatedOwnerKeys});
        }

        const updatedTotalSum = updatedOwnerKeys.reduce((acc, key) => {
            const percentageKey = `${PREFIX}_${key}_${OWNERSHIP_PERCENTAGE}` as const;
            return acc + (Number(SafeString(reimbursementAccountDraft?.[percentageKey])) || 0);
        }, 0);
        const canAddMore = updatedTotalSum <= 75;

        if (isEditingCreatedOwner || !canAddMore) {
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {isEditingCreatedOwner: false});
            Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.BENEFICIAL_OWNERS_LIST}));
        } else if (isUserEnteringHisOwnData) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.IS_ANYONE_ELSE_BENEFICIAL_OWNER}));
        } else {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.ARE_THERE_MORE_BENEFICIAL_OWNERS}));
        }
    }, [policyID, reimbursementAccountDraft]);

    const handleOwnerEdit = useCallback(
        (ownerID: string) => {
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {ownerBeingModifiedID: ownerID, isEditingCreatedOwner: true});
            Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.NAME}));
        },
        [policyID],
    );

    const handleIsUserOwnerSelected = useCallback(
        (value: boolean) => {
            const currentOwnerKeys = reimbursementAccountDraft?.beneficialOwnerKeys ?? [];
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[OWNS_MORE_THAN_25_PERCENT]: value});

            if (value) {
                if (currentOwnerKeys.length >= 4) {
                    setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwnerKeys: currentOwnerKeys.slice(0, 3)});
                }
                setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {ownerBeingModifiedID: CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY});
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.NAME}));
            } else {
                const filteredKeys = currentOwnerKeys.filter((key) => key !== CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY);
                setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwnerKeys: filteredKeys});
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.IS_ANYONE_ELSE_BENEFICIAL_OWNER}));
            }
        },
        [policyID, reimbursementAccountDraft?.beneficialOwnerKeys],
    );

    const handleIsAnyoneElseOwnerSelected = useCallback(
        (value: boolean) => {
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE]: value});

            if (!value && !isUserOwner) {
                setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwnerKeys: []});
                submit({anyIndividualOwn25PercentOrMore: false});
                return;
            }

            if (!value && isUserOwner) {
                setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {beneficialOwnerKeys: [CONST.NON_USD_BANK_ACCOUNT.CURRENT_USER_KEY]});
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.BENEFICIAL_OWNERS_LIST}));
                return;
            }

            if (!canAddMoreOwners) {
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.BENEFICIAL_OWNERS_LIST}));
                return;
            }

            prepareOwnerDetailsForm(Str.guid());
        },
        [canAddMoreOwners, isUserOwner, policyID, prepareOwnerDetailsForm, submit],
    );

    const handleAreThereMoreSelected = useCallback(
        (value: boolean) => {
            if (!value || !canAddMoreOwners) {
                Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BENEFICIAL_OWNER_INFO, subPage: SUB_PAGE_NAMES.BENEFICIAL_OWNERS_LIST}));
                return;
            }

            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[ANY_INDIVIDUAL_OWN_25_PERCENT_OR_MORE]: true});
            prepareOwnerDetailsForm(Str.guid());
        },
        [canAddMoreOwners, policyID, prepareOwnerDetailsForm],
    );

    const handleBackButtonPress = useCallback(() => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        if (currentSubPage === SUB_PAGE_NAMES.IS_USER_BENEFICIAL_OWNER) {
            onBackButtonPress();
        } else {
            Navigation.goBack();
        }
    }, [currentSubPage, onBackButtonPress]);

    if (shouldRedirect) {
        return <FullScreenLoadingIndicator />;
    }

    if (currentSubPage && !OUTER_SUB_PAGES.has(currentSubPage)) {
        return (
            <BeneficialOwnerDetailsFormPages
                stepNames={stepNames}
                policyID={policyID}
                onFinished={handleOwnerDetailsFormFinished}
            />
        );
    }

    return (
        <InteractiveStepWrapper
            wrapperID="BeneficialOwnerInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('ownershipInfoStep.ownerInfo')}
            stepNames={stepNames}
            shouldShowOfflineIndicatorInWideScreen={currentSubPage === SUB_PAGE_NAMES.BENEFICIAL_OWNERS_LIST}
            startStepIndex={3}
        >
            {currentSubPage === SUB_PAGE_NAMES.IS_USER_BENEFICIAL_OWNER && (
                <YesNoStep
                    title={translate('ownershipInfoStep.doYouOwn', companyName)}
                    description={translate('ownershipInfoStep.regulationsRequire')}
                    defaultValue={isUserOwner}
                    onSelectedValue={handleIsUserOwnerSelected}
                    isLoading={reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields}
                />
            )}
            {currentSubPage === SUB_PAGE_NAMES.IS_ANYONE_ELSE_BENEFICIAL_OWNER && (
                <YesNoStep
                    title={translate('ownershipInfoStep.doesAnyoneOwn', companyName)}
                    description={translate('ownershipInfoStep.regulationsRequire')}
                    defaultValue={isAnyoneElseOwner}
                    onSelectedValue={handleIsAnyoneElseOwnerSelected}
                    isLoading={reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields}
                />
            )}
            {currentSubPage === SUB_PAGE_NAMES.ARE_THERE_MORE_BENEFICIAL_OWNERS && (
                <YesNoStep
                    title={translate('ownershipInfoStep.areThereOther', companyName)}
                    description={translate('ownershipInfoStep.regulationsRequire')}
                    defaultValue={false}
                    onSelectedValue={handleAreThereMoreSelected}
                    isLoading={reimbursementAccount?.isSavingCorpayOnboardingBeneficialOwnersFields}
                />
            )}
            {currentSubPage === SUB_PAGE_NAMES.BENEFICIAL_OWNERS_LIST && (
                <BeneficialOwnersList
                    handleConfirmation={submit}
                    handleOwnerEdit={handleOwnerEdit}
                    ownerKeys={ownerKeys}
                />
            )}
        </InteractiveStepWrapper>
    );
}

export default BeneficialOwnerInfo;
