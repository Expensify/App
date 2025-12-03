import lodashIsEmpty from 'lodash/isEmpty';
import React, {useEffect} from 'react';
import {InteractionManager, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import CategoryPicker from '@components/CategoryPicker';
import FixedFooter from '@components/FixedFooter';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOURequestPolicyID, setDraftSplitTransaction, setMoneyRequestCategory, updateMoneyRequestCategory} from '@libs/actions/IOU';
import {enablePolicyCategories, getPolicyCategories} from '@libs/actions/Policy/Category';
import {isCategoryMissing} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getTransactionDetails, isGroupPolicy, isReportInGroupPolicy} from '@libs/ReportUtils';
import {isExpenseUnreported} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import StepScreenWrapper from './StepScreenWrapper';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepCategoryProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CATEGORY> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CATEGORY>;

function IOURequestStepCategory({
    report: reportReal,
    reportDraft,
    route: {
        params: {transactionID, backTo, action, iouType, reportActionID, reportID: routeReportID},
    },
    transaction,
}: IOURequestStepCategoryProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['EmptyStateExpenses'] as const);

    const isUnreportedExpense = isExpenseUnreported(transaction);
    const {policyForMovingExpenses, policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const policyIdReal = getIOURequestPolicyID(transaction, reportReal);
    const policyIdDraft = getIOURequestPolicyID(transaction, reportDraft);
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyIdReal}`, {canBeMissing: true});
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyIdDraft}`, {canBeMissing: true});
    const policy = isUnreportedExpense || isCreatingTrackExpense ? policyForMovingExpenses : (policyReal ?? policyDraft);
    const policyID = isUnreportedExpense || isCreatingTrackExpense ? policyForMovingExpensesID : policy?.id;

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyIdDraft}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`, {canBeMissing: true});

    const report = reportReal ?? reportDraft;
    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;
    const policyData = usePolicyData(policy?.id);
    const {currentSearchHash} = useSearchContext();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const currentTransaction = isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionCategory = getTransactionDetails(currentTransaction)?.category ?? '';
    useRestartOnReceiptFailure(transaction, routeReportID, iouType, action);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const categoryForDisplay = isCategoryMissing(transactionCategory) ? '' : transactionCategory;

    const shouldShowCategory =
        (isReportInGroupPolicy(report) || isGroupPolicy(policy?.type ?? '')) &&
        // The transactionCategory can be an empty string, so to maintain the logic we'd like to keep it in this shape until utils refactor
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (!!categoryForDisplay || hasEnabledOptions(Object.values(policyCategories ?? {})));

    // eslint-disable-next-line rulesdir/no-negated-variables
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const updateCategory = (category: ListItem) => {
        const categorySearchText = category.searchText ?? '';
        const isSelectedCategory = categorySearchText === categoryForDisplay;
        const updatedCategory = isSelectedCategory ? '' : categorySearchText;

        if (transaction) {
            // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
            if (isEditingSplit) {
                setDraftSplitTransaction(transaction.transactionID, splitDraftTransaction, {category: updatedCategory}, policy);
                navigateBack();
                return;
            }

            if (isEditing && report) {
                updateMoneyRequestCategory({
                    transactionID: transaction.transactionID,
                    transactionThreadReportID: report.reportID,
                    category: updatedCategory,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    policyRecentlyUsedCategories,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    isASAPSubmitBetaEnabled,
                    hash: currentSearchHash,
                });
                navigateBack();
                return;
            }
        }

        setMoneyRequestCategory(transactionID, updatedCategory, policyID);

        if (action === CONST.IOU.ACTION.CATEGORIZE && !backTo) {
            if (report?.reportID) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, report.reportID));
            }
            return;
        }

        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.category')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            shouldShowOfflineIndicator={policyCategories !== undefined}
            testID={IOURequestStepCategory.displayName}
            shouldEnableKeyboardAvoidingView={false}
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
                    {isPolicyAdmin(policy) && (
                        <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                            <Button
                                large
                                success
                                style={[styles.w100]}
                                onPress={() => {
                                    if (!policyID || !report?.reportID) {
                                        return;
                                    }

                                    if (!policy?.areCategoriesEnabled) {
                                        enablePolicyCategories({...policyData, categories: policyCategories}, true, false);
                                    }
                                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                                    InteractionManager.runAfterInteractions(() => {
                                        Navigation.navigate(
                                            ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(
                                                policyID,
                                                ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, report.reportID, backTo, reportActionID),
                                            ),
                                        );
                                    });
                                }}
                                text={translate('workspace.categories.editCategories')}
                                pressOnEnter
                            />
                        </FixedFooter>
                    )}
                </View>
            )}
            {!shouldShowEmptyState && !isLoading && !shouldShowOfflineView && (
                <>
                    <Text style={[styles.ph5, styles.pv3]}>{translate('iou.categorySelection')}</Text>
                    <CategoryPicker
                        selectedCategory={categoryForDisplay}
                        policyID={policyID ?? report?.policyID}
                        onSubmit={updateCategory}
                    />
                </>
            )}
        </StepScreenWrapper>
    );
}

IOURequestStepCategory.displayName = 'IOURequestStepCategory';

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepCategoryWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepCategory);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepCategoryWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepCategoryWithFullTransactionOrNotFound);
export default IOURequestStepCategoryWithWritableReportOrNotFound;
