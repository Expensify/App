import React, {useCallback} from 'react';
import type {FormOnyxValues} from '@components/Form/types';
import {useSearchStateContext} from '@components/Search/SearchContext';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import {getIOURequestPolicyID, setMoneyRequestCategory} from '@libs/actions/IOU';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestCategory} from '@libs/actions/IOU/UpdateMoneyRequest';
import {createPolicyCategory} from '@libs/actions/Policy/Category';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {hasTags} from '@libs/PolicyUtils';
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
        params: {transactionID, action, iouType, reportID, backTo},
    },
    transaction,
}: IOURequestStepCategoryCreateProps) {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {currentSearchHash} = useSearchStateContext();

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;

    const policyIdReal = getIOURequestPolicyID(transaction, reportReal);
    const policyIdDraft = getIOURequestPolicyID(transaction, reportDraft);
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyIdReal ?? policyIdDraft,
        action,
        iouType,
        isPerDiemRequest: false,
    });
    const policyID = policy?.id;

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportReal?.parentReportID ?? reportDraft?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(reportReal?.parentReportID ?? reportDraft?.parentReportID)}`);

    const report = reportReal ?? reportDraft;

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

    const createCategory = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
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
                });
            } else {
                setMoneyRequestCategory(transactionID, categoryName, policy);
            }

            if (isEditing) {
                Navigation.goBack(backTo);
            } else {
                Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID));
            }
        },
        [
            action,
            backTo,
            currentSearchHash,
            currentUserPersonalDetails.accountID,
            currentUserPersonalDetails.login,
            hasOutstandingChildTask,
            isASAPSubmitBetaEnabled,
            isEditing,
            isEditingSplit,
            isSetupCategoriesAndTagsTaskParentReportArchived,
            isSetupCategoryTaskParentReportArchived,
            iouType,
            parentReport,
            parentReportAction,
            parentReportNextStep,
            policy,
            policyCategories,
            policyHasTags,
            policyID,
            policyRecentlyUsedCategories,
            policyTags,
            report,
            reportID,
            setupCategoriesAndTagsHasOutstandingChildTask,
            setupCategoriesAndTagsParentReportAction,
            setupCategoriesAndTagsTaskParentReport,
            setupCategoriesAndTagsTaskReport,
            setupCategoryTaskParentReport,
            setupCategoryTaskReport,
            splitDraftTransaction,
            transaction,
            transactionID,
        ],
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <StepScreenWrapper
                headerTitle={translate('workspace.categories.addCategory')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowWrapper
                testID="IOURequestStepCategoryCreate"
            >
                <CategoryForm
                    onSubmit={createCategory}
                    policyCategories={policyCategories}
                />
            </StepScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

const IOURequestStepCategoryCreateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepCategoryCreate);
const IOURequestStepCategoryCreateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepCategoryCreateWithFullTransactionOrNotFound);
export default IOURequestStepCategoryCreateWithWritableReportOrNotFound;
