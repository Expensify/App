import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import CategoryPicker from '@components/CategoryPicker';
import FixedFooter from '@components/FixedFooter';
import type {ListItem} from '@components/SelectionList/types';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionCategory from '@hooks/useUpdateTransactionCategory';

import {getIOURequestPolicyID} from '@libs/actions/IOU/MoneyRequest';
import {enablePolicyCategories, getPolicyCategories} from '@libs/actions/Policy/Category';
import {isCategoryMissing} from '@libs/CategoryUtils';
import {getSelectedWorkspacePolicyID, pickReportForPolicy} from '@libs/IOUUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {canCreateCategoryInSitu, canEditWorkspaceSettings, isGroupPolicy} from '@libs/PolicyUtils';
import {getTransactionDetails, isSelfDM} from '@libs/ReportUtils';
import {getRequestType} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import lodashIsEmpty from 'lodash/isEmpty';
import React, {useEffect} from 'react';
import {View} from 'react-native';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepCategoryProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_CATEGORY> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_CATEGORY>;

function DynamicIOURequestStepCategory({
    report: reportReal,
    reportDraft,
    route: {
        params: {transactionID, action, iouType, reportActionID, reportID: routeReportID},
    },
    transaction,
}: DynamicIOURequestStepCategoryProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['EmptyStateExpenses']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const requestType = getRequestType(transaction);
    const isPerDiemRequest = requestType === CONST.IOU.REQUEST_TYPE.PER_DIEM;
    const transactionReport = useReportOrReportDraft(transaction?.reportID);
    const participantReport = useReportOrReportDraft(transaction?.participants?.at(0)?.reportID);
    const report = reportReal ?? reportDraft ?? transactionReport ?? participantReport;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY.path);
    const policyIdReal = getSelectedWorkspacePolicyID(transaction, action) ?? getIOURequestPolicyID(transaction, pickReportForPolicy(reportReal, transactionReport, participantReport));
    const policyIdDraft = getIOURequestPolicyID(transaction, reportDraft);
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const {policy: policyFromTransaction} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyIdReal ?? policyIdDraft,
        action,
        iouType,
        isPerDiemRequest,
    });
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const policy = policyFromTransaction ?? (isEditingSplit && isSelfDM(report) ? policyForMovingExpenses : undefined);
    const policyID = policy?.id;

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyIdDraft}`);

    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;
    const policyData = usePolicyData(policy?.id);
    const currentTransaction = isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionCategory = getTransactionDetails(currentTransaction)?.category ?? '';
    useRestartOnReceiptFailure(transaction, routeReportID, iouType, action);
    const currentUserEmailParam = useCurrentUserPersonalDetails().login ?? '';
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);

    const categoryForDisplay = isCategoryMissing(transactionCategory) ? '' : transactionCategory;

    const createCategoryMenuItems = canCreateCategoryInSitu(policy, currentUserEmailParam)
        ? [
              {
                  icon: expensifyIcons.Plus,
                  text: translate('workspace.categories.addCategory'),
                  onSelected: () => {
                      const reportID = report?.reportID ?? routeReportID;
                      if (!policyID || !reportID) {
                          return;
                      }
                      Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_CATEGORY_CREATE.path));
                  },
              },
          ]
        : undefined;

    const shouldShowCategory =
        isGroupPolicy(policy) &&
        // The transactionCategory can be an empty string, so to maintain the logic we'd like to keep it in this shape until utils refactor

        (!!categoryForDisplay || hasEnabledOptions(Object.values(policyCategories ?? {})));

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const fetchData = () => {
        if ((!!policy && !!policyCategories) || !policyID) {
            return;
        }

        getPolicyCategories(policyID);
    };
    const {isOffline} = useNetwork({onReconnect: fetchData});
    const isLoading = !isOffline && policyCategories === undefined;
    const shouldShowEmptyState = policyCategories !== undefined && !shouldShowCategory;
    const shouldShowOfflineView = policyCategories === undefined && isOffline;

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policyID]);

    const {updateCategory: updateTransactionCategory, isDraftUpdate} = useUpdateTransactionCategory({
        transactionID,
        transaction,
        report,
        policy,
        policyCategories,
        isEditing,
        isEditingSplit,
    });

    const navigateBack = () => {
        Navigation.goBack(backPath);
    };

    const saveAndNavigateBack = () => {
        Navigation.goBack(backPath, {shouldSkipFocusRestore: true});
    };

    const updateCategory = (category: ListItem) => {
        const categorySearchText = category.searchText ?? '';
        const isSelectedCategory = categorySearchText === categoryForDisplay;
        const updatedCategory = isSelectedCategory ? '' : categorySearchText;

        updateTransactionCategory(updatedCategory);

        // `action === CATEGORIZE` only occurs when categorizing a fresh tracked expense from a report, never from
        // an existing Confirmation screen, so continue forward into Confirmation here.
        if (isDraftUpdate && action === CONST.IOU.ACTION.CATEGORIZE && !backPath.includes('/confirmation/')) {
            if (report?.reportID) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, report.reportID));
            }
            return;
        }

        saveAndNavigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.category')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            shouldShowOfflineIndicator={policyCategories !== undefined}
            testID="DynamicIOURequestStepCategory"
            shouldEnableKeyboardAvoidingView={false}
            threeDotsMenuItems={createCategoryMenuItems}
            shouldMinimizeMenuButton
        >
            {isLoading && (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={[styles.flex1]}
                />
            )}
            {shouldShowOfflineView && <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>}
            {shouldShowEmptyState && (
                <View style={[styles.flex1]}>
                    <WorkspaceEmptyStateSection
                        shouldStyleAsCard={false}
                        icon={illustrations.EmptyStateExpenses}
                        title={translate('workspace.categories.emptyCategories.title')}
                        subtitle={translate('workspace.categories.emptyCategories.subtitle')}
                        containerStyle={[styles.flex1, styles.justifyContentCenter]}
                    />
                    {canEditWorkspaceSettings(policy, currentUserEmailParam) && (
                        <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                            <Button
                                size={CONST.BUTTON_SIZE.LARGE}
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                style={[styles.w100]}
                                onPress={() => {
                                    if (!policyID || !report?.reportID) {
                                        return;
                                    }

                                    if (!policy?.areCategoriesEnabled) {
                                        enablePolicyCategories({...policyData, categories: policyCategories}, true, isVendorMatchingBetaEnabled, false);
                                    }
                                    requestAnimationFrame(() => {
                                        Navigation.navigate(ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, Navigation.getActiveRoute()));
                                    });
                                }}
                                sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.EDIT_CATEGORIES_BUTTON}
                            >
                                <Button.KeyboardShortcut />
                                <Button.Text>{translate('workspace.categories.editCategories')}</Button.Text>
                            </Button>
                        </FixedFooter>
                    )}
                </View>
            )}
            {!shouldShowEmptyState && !isLoading && !shouldShowOfflineView && (
                <CategoryPicker
                    selectedCategory={categoryForDisplay}
                    policyID={policyID ?? report?.policyID}
                    onSubmit={updateCategory}
                />
            )}
        </StepScreenWrapper>
    );
}

const DynamicIOURequestStepCategoryWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepCategory);

const DynamicIOURequestStepCategoryWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepCategoryWithFullTransactionOrNotFound);
export default DynamicIOURequestStepCategoryWithWritableReportOrNotFound;
