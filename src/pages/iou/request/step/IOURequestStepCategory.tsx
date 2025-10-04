import {activePolicySelector} from '@selectors/Policy';
import lodashIsEmpty from 'lodash/isEmpty';
import React, {useEffect} from 'react';
import {InteractionManager, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import CategoryPicker from '@components/CategoryPicker';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOURequestPolicyID, setDraftSplitTransaction, setMoneyRequestCategory, updateMoneyRequestCategory} from '@libs/actions/IOU';
import {enablePolicyCategories, getPolicyCategories} from '@libs/actions/Policy/Category';
import {isCategoryMissing} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getTransactionDetails, isGroupPolicy, isReportInGroupPolicy} from '@libs/ReportUtils';
import {isExpenseUnreported as isExpenseUnreportedTransactionUtils} from '@libs/TransactionUtils';
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
        params: {transactionID, backTo, action, iouType, reportActionID},
    },
    transaction,
}: IOURequestStepCategoryProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyIdReal = getIOURequestPolicyID(transaction, reportReal);
    const policyIdDraft = getIOURequestPolicyID(transaction, reportDraft);
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyIdReal}`, {canBeMissing: true});
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyIdDraft}`, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {
        canBeMissing: true,
        selector: activePolicySelector,
    });
    const isExpenseUnreported = isExpenseUnreportedTransactionUtils(transaction);
    const policy = isExpenseUnreported ? activePolicy : (policyReal ?? policyDraft);

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: true});
    const [policyCategoriesReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`, {canBeMissing: true});
    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyIdDraft}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`, {canBeMissing: true});

    const report = reportReal ?? reportDraft;
    const policyCategories = policyCategoriesReal ?? policyCategoriesDraft;
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [policyTagLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`, {canBeMissing: true});
    const {currentSearchHash} = useSearchContext();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const currentTransaction = isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const transactionCategory = getTransactionDetails(currentTransaction)?.category ?? '';

    const categoryForDisplay = isCategoryMissing(transactionCategory) ? '' : transactionCategory;

    const shouldShowCategory =
        (isExpenseUnreported || isReportInGroupPolicy(report) || isGroupPolicy(policy?.type ?? '')) &&
        // The transactionCategory can be an empty string, so to maintain the logic we'd like to keep it in this shape until utils refactor
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (!!categoryForDisplay || hasEnabledOptions(Object.values(policyCategories ?? {})));

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const fetchData = () => {
        if ((!!policy && !!policyCategories) || !report?.policyID) {
            return;
        }

        getPolicyCategories(report?.policyID);
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
                setDraftSplitTransaction(transaction.transactionID, {category: updatedCategory}, policy);
                navigateBack();
                return;
            }

            if (isEditing && report) {
                updateMoneyRequestCategory(transaction.transactionID, report.reportID, updatedCategory, policy, policyTags, policyCategories, currentSearchHash);
                navigateBack();
                return;
            }
        }

        setMoneyRequestCategory(transactionID, updatedCategory, policy?.id);

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
                        icon={Illustrations.EmptyStateExpenses}
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
                                    if (!policy?.id || !report?.reportID) {
                                        return;
                                    }

                                    if (!policy.areCategoriesEnabled) {
                                        enablePolicyCategories(policy.id, true, policyTagLists, policyCategories, allTransactionViolations, false);
                                    }
                                    // eslint-disable-next-line deprecation/deprecation
                                    InteractionManager.runAfterInteractions(() => {
                                        Navigation.navigate(
                                            ROUTES.SETTINGS_CATEGORIES_ROOT.getRoute(
                                                policy.id,
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
                        policyID={policy?.id ?? report?.policyID}
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
