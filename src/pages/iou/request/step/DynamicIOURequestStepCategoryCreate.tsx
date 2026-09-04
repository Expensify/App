import type {FormOnyxValues} from '@components/Form/types';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useStoredTransactionViolations from '@hooks/useStoredTransactionViolations';

import {getIOURequestPolicyID, setMoneyRequestCategory} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestCategory} from '@libs/actions/IOU/UpdateMoneyRequest';
import {createPolicyCategory} from '@libs/actions/Policy/Category';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getSelectedWorkspacePolicyID, pickReportForPolicy} from '@libs/IOUUtils';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import Navigation from '@libs/Navigation/Navigation';
import {hasTags} from '@libs/PolicyUtils';
import {isSelfDM} from '@libs/ReportUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CategoryForm from '@pages/workspace/categories/CategoryForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepCategoryCreateProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_CATEGORY_CREATE> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_CATEGORY_CREATE>;

function DynamicIOURequestStepCategoryCreate({
    report: reportReal,
    reportDraft,
    route: {
        params: {transactionID, action, iouType, reportID},
    },
    transaction,
}: DynamicIOURequestStepCategoryCreateProps) {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {currentSearchHash} = useSearchQueryContext();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY_CREATE.path);
    const categorySuffixMatch = findAllMatchingDynamicSuffixes(backPath).find((match) => match.pattern === DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.path);
    const basePath = categorySuffixMatch ? getPathWithoutDynamicSuffix(categorySuffixMatch.pathUsedForMatching, categorySuffixMatch.actualSuffix, categorySuffixMatch.pattern) : backPath;

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;

    const [participantReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.participants?.at(0)?.reportID)}`);
    const policyIdReal = getSelectedWorkspacePolicyID(transaction, action) ?? getIOURequestPolicyID(transaction, pickReportForPolicy(reportReal, participantReport));
    const policyIdDraft = getIOURequestPolicyID(transaction, reportDraft);
    const {policy: policyFromTransaction} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyIdReal ?? policyIdDraft,
        action,
        iouType,
        isPerDiemRequest: false,
    });
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    const report = reportReal ?? reportDraft;

    // Mirror DynamicIOURequestStepCategory: for self-DM split edits the draft's reportID points to the
    // self-DM (not UNREPORTED_REPORT_ID), so usePolicyForTransaction can't resolve a policy. Fall
    // back to policyForMovingExpenses so AccessOrNotFoundWrapper below has a real policyID instead
    // of rendering the "not here" page when the user taps "Add category" on a self-DM split.
    const policy = policyFromTransaction ?? (isEditingSplit && isSelfDM(report) ? policyForMovingExpenses : undefined);
    const policyID = policy?.id;

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const storedTransactionViolations = useStoredTransactionViolations(transaction?.transactionID ?? transactionID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportReal?.parentReportID ?? reportDraft?.parentReportID)}`);
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(parentReport?.ownerAccountID)});
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    useRestartOnReceiptFailure(transaction, reportID, iouType, action);

    const policyHasTags = hasTags(policyTags);

    const {
        taskReport: setupCategoryTaskReport,
        taskParentReport: setupCategoryTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
        hasOutstandingChildTask,
        parentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES);

    const {
        taskReport: setupCategoriesAndTagsTaskReport,
        taskParentReport: setupCategoriesAndTagsTaskParentReport,
        isOnboardingTaskParentReportArchived: isSetupCategoriesAndTagsTaskParentReportArchived,
        hasOutstandingChildTask: setupCategoriesAndTagsHasOutstandingChildTask,
        parentReportAction: setupCategoriesAndTagsParentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES_AND_TAGS);

    const createCategory = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
        const categoryName = values.categoryName.trim();

        if (!policyID) {
            return;
        }

        // 1. Create the category in the workspace (optimistic update, queued API call).
        createPolicyCategory({
            policyID,
            categoryName,
            isSetupCategoriesTaskParentReportArchived: isSetupCategoryTaskParentReportArchived,
            setupCategoryTaskReport,
            setupCategoryTaskParentReport,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            hasOutstandingChildTask,
            parentReportAction,
            setupCategoriesAndTagsTaskReport,
            setupCategoriesAndTagsTaskParentReport,
            isSetupCategoriesAndTagsTaskParentReportArchived,
            setupCategoriesAndTagsHasOutstandingChildTask,
            setupCategoriesAndTagsParentReportAction,
            policyHasTags,
        });

        // 2. Apply the newly created category to the transaction.
        const policyCategoriesWithNewCategory = {
            ...policyCategories,
            [categoryName]: {
                name: categoryName,
                enabled: true,
                errors: null,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        };

        if (isEditingSplit && transaction) {
            setDraftSplitTransaction(transaction.transactionID, splitDraftTransaction, {category: categoryName}, getCurrencyDecimals, getCurrencySymbol, policy);
        } else if (isEditing && report) {
            updateMoneyRequestCategory({
                transactionID: transaction?.transactionID ?? transactionID,
                transactionThreadReport: report,
                parentReport,
                iouReportOwnerLogin,
                category: categoryName,
                policy,
                policyTagList: policyTags,
                policyCategories: policyCategoriesWithNewCategory,
                policyRecentlyUsedCategories,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                isASAPSubmitBetaEnabled,
                hash: currentSearchHash,
                delegateAccountID,
                reportPolicyTags,
                isTrackIntentUser,
                violations: storedTransactionViolations,
                getCurrencyDecimals,
                getCurrencySymbol,
            });
        } else {
            setMoneyRequestCategory(transactionID, categoryName, policy, getCurrencyDecimals);
        }

        Navigation.goBack(basePath);
    };

    const navigateBackToCategoryList = () => Navigation.goBack(backPath);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
            // Without this override the wrapper's not-here fallback runs goBackFromWorkspaceSettingPages
            // when policyID can't be resolved, which closes the whole RHP. Send the user back to the
            // category list (the step they came from) instead — same destination as the regular header
            // back button below.
            fullPageNotFoundViewProps={{onBackButtonPress: navigateBackToCategoryList}}
        >
            <StepScreenWrapper
                headerTitle={translate('workspace.categories.addCategory')}
                onBackButtonPress={navigateBackToCategoryList}
                shouldShowWrapper
                testID="DynamicIOURequestStepCategoryCreate"
            >
                <CategoryForm
                    onSubmit={createCategory}
                    policyCategories={policyCategories}
                    addBottomSafeAreaPadding={false}
                />
            </StepScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

const DynamicIOURequestStepCategoryCreateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepCategoryCreate);
const DynamicIOURequestStepCategoryCreateWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepCategoryCreateWithFullTransactionOrNotFound);
export default DynamicIOURequestStepCategoryCreateWithWritableReportOrNotFound;
