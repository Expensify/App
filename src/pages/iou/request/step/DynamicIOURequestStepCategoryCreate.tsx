import type {FormOnyxValues} from '@components/Form/types';

import useCreateAndApplyCategory from '@hooks/useCreateAndApplyCategory';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import {getIOURequestPolicyID} from '@libs/actions/IOU/MoneyRequest';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getSelectedWorkspacePolicyID, pickReportForPolicy} from '@libs/IOUUtils';
import findAllMatchingDynamicSuffixes from '@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import Navigation from '@libs/Navigation/Navigation';
import {isSelfDM} from '@libs/ReportUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CategoryForm from '@pages/workspace/categories/CategoryForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

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
    const {translate} = useLocalize();
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

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    useRestartOnReceiptFailure(transaction, reportID, iouType, action);

    const {updateCategory} = useUpdateTransactionCategory({
        transactionID,
        transaction,
        report,
        policy,
        policyCategories,
        isEditing,
        isEditingSplit,
    });
    const createAndApplyCategory = useCreateAndApplyCategory({policyID, updateCategory});

    const createCategory = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_CATEGORY_FORM>) => {
        if (!policyID) {
            return;
        }

        createAndApplyCategory(values.categoryName);
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
