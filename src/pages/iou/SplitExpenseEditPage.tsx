import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import useAllTransactions from '@hooks/useAllTransactions';
import useCurrencyList from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {initDraftSplitExpenseDataForEdit, removeSplitExpenseField, updateSplitExpenseField} from '@libs/actions/IOU';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import {getDecodedCategoryName, isCategoryDescriptionRequired} from '@libs/CategoryUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitExpenseParamList} from '@libs/Navigation/types';
import Parser from '@libs/Parser';
import {getTagLists} from '@libs/PolicyUtils';
import {computeReportName} from '@libs/ReportNameUtils';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {getParsedComment, getReportOrDraftReport, getTransactionDetails} from '@libs/ReportUtils';
import {getTagVisibility, hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {getDistanceInMeters, getTag, getTagForDisplay, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SplitExpensePageProps = PlatformStackScreenProps<SplitExpenseParamList, typeof SCREENS.MONEY_REQUEST.SPLIT_EXPENSE>;

function SplitExpenseEditPage({route}: SplitExpensePageProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate, toLocaleDigit} = useLocalize();
    const {getCurrencySymbol} = useCurrencyList();
    const {currentSearchResults} = useSearchContext();

    const {reportID, transactionID, splitExpenseTransactionID = '', backTo} = route.params;

    const [splitExpenseDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {canBeMissing: false});
    const [originalTransactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${splitExpenseDraftTransaction?.comment?.originalTransactionID}`, {canBeMissing: false}, [
        splitExpenseDraftTransaction?.comment?.originalTransactionID,
    ]);

    const splitExpenseDraftTransactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(splitExpenseDraftTransaction) ?? {}, [splitExpenseDraftTransaction]);
    const allTransactions = useAllTransactions();

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`];
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`];

    const report = getReportOrDraftReport(reportID);
    const currentReport = report ?? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`];

    const policy = usePolicy(currentReport?.policyID);
    const currentPolicy = Object.keys(policy?.employeeList ?? {}).length
        ? policy
        : currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(currentReport?.policyID)}`];

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${currentReport?.policyID}`, {canBeMissing: false});

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${currentReport?.policyID}`, {canBeMissing: false});
    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const fetchData = useCallback(() => {
        if (!policyCategories) {
            openPolicyCategoriesPage(currentReport?.policyID ?? String(CONST.DEFAULT_NUMBER_ID));
        }
        if (!policyTags) {
            openPolicyTagsPage(currentReport?.policyID ?? String(CONST.DEFAULT_NUMBER_ID));
        }
    }, [currentReport?.policyID, policyCategories, policyTags]);

    // Fetch categories and tags on mount to ensure the screen has the latest data,
    // especially when the edit-split flow is opened from the search screen where these
    // values are not fetched initially.
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const transactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(transaction) ?? {}, [transaction]);
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;

    const [draftTransactionWithSplitExpenses] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: false});
    const splitExpensesList = draftTransactionWithSplitExpenses?.comment?.splitExpenses;

    const currentAmount = transactionDetailsAmount >= 0 ? Math.abs(Number(splitExpenseDraftTransactionDetails?.amount)) : Number(splitExpenseDraftTransactionDetails?.amount);
    const currentDescription = getParsedComment(Parser.htmlToMarkdown(splitExpenseDraftTransactionDetails?.comment ?? ''));

    const shouldShowCategory = !!currentPolicy?.areCategoriesEnabled && !!policyCategories;

    const transactionTag = getTag(splitExpenseDraftTransaction);
    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const isSplitAvailable = report && transaction && isSplitAction(currentReport, [transaction], originalTransaction, login ?? '', currentUserAccountID, currentPolicy);

    const isCategoryRequired = !!currentPolicy?.requiresCategory;
    const reportName = computeReportName(currentReport, undefined, undefined, undefined, undefined, undefined, undefined, currentUserAccountID);
    const isDescriptionRequired = isCategoryDescriptionRequired(policyCategories, splitExpenseDraftTransactionDetails?.category, currentPolicy?.areRulesEnabled);

    const shouldShowTags = !!currentPolicy?.areTagsEnabled && !!(transactionTag || hasEnabledTags(policyTagLists));
    const tagVisibility = useMemo(
        () =>
            getTagVisibility({
                shouldShowTags,
                policy: currentPolicy,
                policyTags,
                transaction: splitExpenseDraftTransaction,
            }),
        [shouldShowTags, currentPolicy, policyTags, splitExpenseDraftTransaction],
    );

    const previousTagsVisibility = usePrevious(tagVisibility.map((v) => v.shouldShow)) ?? [];

    const isDistance = isDistanceRequest(splitExpenseDraftTransaction);
    const isManualDistance = isManualDistanceRequest(splitExpenseDraftTransaction);
    const isOdometerDistance = isOdometerDistanceRequest(splitExpenseDraftTransaction);
    const {unit, rate} = DistanceRequestUtils.getRate({transaction: splitExpenseDraftTransaction, policy: currentPolicy});
    const distance = getDistanceInMeters(splitExpenseDraftTransaction, unit);
    const currency = splitExpenseDraftTransactionDetails.currency ?? CONST.CURRENCY.USD;
    const rateToDisplay = DistanceRequestUtils.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, getCurrencySymbol, isOffline);
    const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(true, distance, unit, rate, translate);

    const distanceRequestFields = isDistance ? (
        <>
            <MenuItemWithTopDescription
                description={translate('common.distance')}
                title={distanceToDisplay}
                interactive
                shouldShowRightIcon
                titleStyle={styles.flex1}
                style={[styles.moneyRequestMenuItem]}
                onPress={() => {
                    if (isOdometerDistance) {
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(CONST.IOU.ACTION.EDIT, CONST.IOU.TYPE.SPLIT_EXPENSE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID),
                        );
                        return;
                    }

                    if (isManualDistance) {
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.getRoute(
                                CONST.IOU.ACTION.EDIT,
                                CONST.IOU.TYPE.SPLIT_EXPENSE,
                                CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                reportID,
                                Navigation.getActiveRoute(),
                            ),
                        );
                        return;
                    }

                    initDraftSplitExpenseDataForEdit(originalTransactionDraft, splitExpenseTransactionID, reportID, CONST.IOU.OPTIMISTIC_DISTANCE_SPLIT_TRANSACTION_ID);
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(
                            CONST.IOU.ACTION.EDIT,
                            CONST.IOU.TYPE.SPLIT_EXPENSE,
                            CONST.IOU.OPTIMISTIC_DISTANCE_SPLIT_TRANSACTION_ID,
                            reportID,
                            Navigation.getActiveRoute(),
                        ),
                    );
                }}
            />
            <MenuItemWithTopDescription
                description={translate('common.rate')}
                title={rateToDisplay}
                interactive
                shouldShowRightIcon
                titleStyle={styles.flex1}
                style={[styles.moneyRequestMenuItem]}
                onPress={() => {
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(
                            CONST.IOU.ACTION.EDIT,
                            CONST.IOU.TYPE.SPLIT_EXPENSE,
                            CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                            reportID,
                            Navigation.getActiveRoute(),
                        ),
                    );
                }}
            />
        </>
    ) : null;

    return (
        <ScreenWrapper testID="SplitExpenseEditPage">
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(splitExpenseDraftTransaction) || !isSplitAvailable}>
                <View style={[styles.flex1]}>
                    <HeaderWithBackButton
                        title={translate('iou.splitExpenseEditTitle', {
                            amount: convertToDisplayString(currentAmount, splitExpenseDraftTransactionDetails?.currency),
                            merchant: splitExpenseDraftTransaction?.merchant ?? '',
                        })}
                        onBackButtonPress={() => Navigation.goBack(backTo)}
                    />
                    <ScrollView>
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            shouldRenderAsHTML
                            key={translate('common.description')}
                            description={translate('common.description')}
                            title={currentDescription}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        CONST.IOU.TYPE.SPLIT_EXPENSE,
                                        CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                        reportID,
                                        Navigation.getActiveRoute(),
                                    ),
                                );
                            }}
                            style={[styles.moneyRequestMenuItem]}
                            titleWrapperStyle={styles.flex1}
                            numberOfLinesTitle={2}
                            rightLabel={isDescriptionRequired ? translate('common.required') : ''}
                        />
                        {distanceRequestFields}
                        {shouldShowCategory && (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                key={translate('common.category')}
                                description={translate('common.category')}
                                title={getDecodedCategoryName(splitExpenseDraftTransactionDetails?.category ?? '')}
                                numberOfLinesTitle={2}
                                rightLabel={isCategoryRequired ? translate('common.required') : ''}
                                onPress={() => {
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(
                                            CONST.IOU.ACTION.EDIT,
                                            CONST.IOU.TYPE.SPLIT_EXPENSE,
                                            CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                            reportID,
                                            Navigation.getActiveRoute(),
                                        ),
                                    );
                                }}
                                style={[styles.moneyRequestMenuItem]}
                                titleStyle={styles.flex1}
                            />
                        )}
                        {shouldShowTags &&
                            policyTagLists.map(({name}, index) => {
                                const tagVisibilityItem = tagVisibility.at(index);
                                const shouldShow = tagVisibilityItem?.shouldShow ?? false;
                                const isTagRequired = tagVisibilityItem?.isTagRequired ?? false;
                                const prevShouldShow = previousTagsVisibility.at(index) ?? false;

                                if (!shouldShow) {
                                    return null;
                                }

                                return (
                                    <MenuItemWithTopDescription
                                        shouldShowRightIcon
                                        key={name}
                                        highlighted={!getTagForDisplay(splitExpenseDraftTransaction, index) && !prevShouldShow}
                                        title={getTagForDisplay(splitExpenseDraftTransaction, index)}
                                        description={name}
                                        shouldShowBasicTitle
                                        shouldShowDescriptionOnTop
                                        numberOfLinesTitle={2}
                                        rightLabel={isTagRequired ? translate('common.required') : ''}
                                        onPress={() => {
                                            Navigation.navigate(
                                                ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(
                                                    CONST.IOU.ACTION.EDIT,
                                                    CONST.IOU.TYPE.SPLIT_EXPENSE,
                                                    index,
                                                    CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                                    reportID,
                                                    Navigation.getActiveRoute(),
                                                ),
                                            );
                                        }}
                                        style={[styles.moneyRequestMenuItem]}
                                        titleStyle={styles.flex1}
                                    />
                                );
                            })}
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            key={translate('common.date')}
                            description={translate('common.date')}
                            title={splitExpenseDraftTransactionDetails?.created}
                            numberOfLinesTitle={2}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        CONST.IOU.TYPE.SPLIT_EXPENSE,
                                        CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                        reportID,
                                        Navigation.getActiveRoute(),
                                    ),
                                );
                            }}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                        />
                        <MenuItemWithTopDescription
                            key={translate('common.report')}
                            description={translate('common.report')}
                            title={reportName}
                            numberOfLinesTitle={2}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            interactive={false}
                        />
                    </ScrollView>
                    <FixedFooter style={styles.mtAuto}>
                        {Number(splitExpensesList?.length) > 1 && (
                            <Button
                                danger
                                large
                                style={[styles.w100, styles.mb4]}
                                text={translate('iou.removeSplit')}
                                onPress={() => {
                                    removeSplitExpenseField(draftTransactionWithSplitExpenses, splitExpenseTransactionID);
                                    Navigation.goBack(backTo);
                                }}
                                pressOnEnter
                                enterKeyEventListenerPriority={1}
                            />
                        )}
                        <Button
                            success
                            large
                            style={[styles.w100]}
                            text={translate('common.save')}
                            onPress={() => {
                                updateSplitExpenseField(splitExpenseDraftTransaction, originalTransactionDraft, splitExpenseTransactionID, transaction, currentPolicy);
                                Navigation.goBack(backTo);
                            }}
                            pressOnEnter
                            enterKeyEventListenerPriority={1}
                        />
                    </FixedFooter>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default SplitExpenseEditPage;
