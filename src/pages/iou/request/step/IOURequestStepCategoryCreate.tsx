import React from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import {getIOURequestPolicyID, setMoneyRequestCategory} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestCategory} from '@libs/actions/IOU/UpdateMoneyRequest';
import {createPolicyCategory} from '@libs/actions/Policy/Category';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {hasTags} from '@libs/PolicyUtils';
import {isSelfDM} from '@libs/ReportUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CategoryForm from '@pages/workspace/categories/CategoryForm';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepCategoryCreateProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CATEGORY_CREATE> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CATEGORY_CREATE>;

function IOURequestStepCategoryCreate({
    report: reportReal,
    reportDraft,
    route: {
        params: {transactionID, action, iouType, reportID, reportActionID, backTo},
    },
    transaction,
}: IOURequestStepCategoryCreateProps) {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {currentSearchHash} = useSearchQueryContext();

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;

    const policyIdReal = getIOURequestPolicyID(transaction, reportReal);
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
    // Mirror IOURequestStepCategory: for self-DM split edits the draft's reportID points to the
    // self-DM (not UNREPORTED_REPORT_ID), so usePolicyForTransaction can't resolve a policy. Fall
    // back to policyForMovingExpenses so AccessOrNotFoundWrapper below has a real policyID instead
    // of rendering the "not here" page when the user taps "Add category" on a self-DM split.
    const policy = policyFromTransaction ?? (isEditingSplit && isSelfDM(report) ? policyForMovingExpenses : undefined);
    const policyID = policy?.id;

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportReal?.parentReportID ?? reportDraft?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(reportReal?.parentReportID ?? reportDraft?.parentReportID)}`);

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
            setDraftSplitTransaction(transaction.transactionID, splitDraftTransaction, {category: categoryName}, policy);
        } else if (isEditing && report) {
            updateMoneyRequestCategory({
                transactionID: transaction?.transactionID ?? transactionID,
                transactionThreadReport: report,
                parentReport,
                parentReportNextStep,
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
            });
        } else {
            setMoneyRequestCategory(transactionID, categoryName, policy);
        }

        if (!isEditing && action === CONST.IOU.ACTION.CATEGORIZE && !backTo) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, report?.reportID ?? reportID));
            return;
        }
        Navigation.goBack(backTo);
    };

    const navigateBackToCategoryList = () => Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, backTo, reportActionID));

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
                testID="IOURequestStepCategoryCreate"
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

const IOURequestStepCategoryCreateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepCategoryCreate);
const IOURequestStepCategoryCreateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepCategoryCreateWithFullTransactionOrNotFound);
export default IOURequestStepCategoryCreateWithWritableReportOrNotFound;
