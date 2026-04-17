import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchStateContext} from '@components/Search/SearchContext';
import useAllTransactions from '@hooks/useAllTransactions';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePrevious from '@hooks/usePrevious';
import useReportAttributes from '@hooks/useReportAttributes';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ViolationField} from '@hooks/useViolations';
import {getIOURequestPolicyID} from '@libs/actions/IOU';
import {initDraftSplitExpenseDataForEdit, removeSplitExpenseField, updateSplitExpenseField} from '@libs/actions/IOU/Split';
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
import {getReportName} from '@libs/ReportNameUtils';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {getParsedComment, getReportOrDraftReport, getTransactionDetails} from '@libs/ReportUtils';
import {getTagVisibility, hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {getDistanceInMeters, getRateID, getTag, getTagForDisplay, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest} from '@libs/TransactionUtils';
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
    const {getCurrencySymbol} = useCurrencyListActions();
    const {currentSearchResults} = useSearchStateContext();

    const {reportID, transactionID, splitExpenseTransactionID = '', backTo} = route.params;

    const [splitExpenseDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);
    const [originalTransactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${splitExpenseDraftTransaction?.comment?.originalTransactionID}`, undefined, [
        splitExpenseDraftTransaction?.comment?.originalTransactionID,
    ]);

    const splitExpenseDraftTransactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(splitExpenseDraftTransaction) ?? {}, [splitExpenseDraftTransaction]);
    const allTransactions = useAllTransactions();

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`];
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`];
    const splitTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(splitExpenseTransactionID)}`];

    const report = getReportOrDraftReport(reportID);
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    const currentReport = report ?? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`];

    const policy = usePolicy(currentReport?.policyID);
    const currentPolicy = Object.keys(policy?.employeeList ?? {}).length
        ? policy
        : currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(currentReport?.policyID)}`];

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // When currentPolicy is undefined (e.g. viewing from self-DM), find the correct policy
    // by searching all policies for one that contains the transaction's customUnitID.
    // Fall back to the original transaction's customUnitID when the edit draft's customUnit
    // was built without it (e.g. optimistic transaction before server response).
    // If customUnitID is still not available, fall back to searching by customUnitRateID.
    // Skip both lookups when the rate is P2P — the expense has no workspace policy to resolve.
    const distanceCustomUnitID = splitExpenseDraftTransaction?.comment?.customUnit?.customUnitID ?? transaction?.comment?.customUnit?.customUnitID;
    const distanceCustomUnitRateID = splitExpenseDraftTransaction?.comment?.customUnit?.customUnitRateID;
    const isP2PRate = distanceCustomUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;
    const policyByCustomUnitID = !isP2PRate && distanceCustomUnitID ? (Object.values(allPolicies ?? {}).find((p) => p?.customUnits?.[distanceCustomUnitID]) ?? undefined) : undefined;
    const policyByCustomUnitRateID =
        !policyByCustomUnitID && distanceCustomUnitRateID && distanceCustomUnitRateID !== CONST.CUSTOM_UNITS.FAKE_P2P_ID
            ? (Object.values(allPolicies ?? {}).find((p) => Object.values(p?.customUnits ?? {}).some((unit) => !!unit.rates?.[distanceCustomUnitRateID])) ?? undefined)
            : undefined;
    const effectivePolicy = currentPolicy ?? policyByCustomUnitID ?? policyByCustomUnitRateID;

    const reportPolicyID = getIOURequestPolicyID(splitTransaction, currentReport);
    const {policy: categoryPolicy} = usePolicyForTransaction({
        transaction: splitTransaction,
        reportPolicyID,
        action: CONST.IOU.ACTION.EDIT,
        iouType: CONST.IOU.TYPE.SPLIT_EXPENSE,
    });
    const categoryPolicyID = categoryPolicy?.id;

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${categoryPolicyID}`);

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${categoryPolicyID}`);
    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const fetchData = useCallback(() => {
        if (!policyCategories) {
            openPolicyCategoriesPage(categoryPolicyID ?? String(CONST.DEFAULT_NUMBER_ID));
        }
        if (!policyTags) {
            openPolicyTagsPage(categoryPolicyID ?? String(CONST.DEFAULT_NUMBER_ID));
        }
    }, [categoryPolicyID, policyCategories, policyTags]);

    // Fetch categories and tags on mount to ensure the screen has the latest data,
    // especially when the edit-split flow is opened from the search screen where these
    // values are not fetched initially.
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [draftTransactionWithSplitExpenses] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const splitExpensesList = draftTransactionWithSplitExpenses?.comment?.splitExpenses;

    const splitExpenseItem = splitExpensesList?.find((item) => item.transactionID === splitExpenseTransactionID);
    const originalSign = (splitExpenseItem?.amount ?? 0) < 0 ? -1 : 1;
    const currentDescription = getParsedComment(Parser.htmlToMarkdown(splitExpenseDraftTransactionDetails?.comment ?? ''));

    const shouldShowCategory = !!categoryPolicy?.areCategoriesEnabled && !!policyCategories;

    const transactionTag = getTag(splitExpenseDraftTransaction);
    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const isSplitAvailable = report && transaction && isSplitAction(currentReport, [transaction], originalTransaction, login ?? '', currentUserAccountID, currentPolicy, parentReport);

    // For selfDM splits (no workspace policy), don't mark the rate as out-of-policy.
    // getRate already resolves the P2P rate via defaultP2PRate for selfDM transactions.
    const isSelfDMSplit = !effectivePolicy;

    const isCategoryRequired = !!categoryPolicy?.requiresCategory && !isSelfDMSplit;
    const reportAttributes = useReportAttributes();
    const reportName = getReportName(currentReport, reportAttributes) || parentReport?.reportName;
    const isDescriptionRequired = isCategoryDescriptionRequired(policyCategories, splitExpenseDraftTransactionDetails?.category, categoryPolicy?.areRulesEnabled);

    const shouldShowTags = !!categoryPolicy?.areTagsEnabled && !!(transactionTag || hasEnabledTags(policyTagLists));
    const tagVisibility = useMemo(
        () =>
            getTagVisibility({
                shouldShowTags,
                policy: categoryPolicy,
                policyTags,
                transaction: splitExpenseDraftTransaction,
            }),
        [shouldShowTags, categoryPolicy, policyTags, splitExpenseDraftTransaction],
    );

    const previousTagsVisibility = usePrevious(tagVisibility.map((v) => v.shouldShow)) ?? [];

    const isDistance = isDistanceRequest(splitExpenseDraftTransaction);
    const isManualDistance = isManualDistanceRequest(splitExpenseDraftTransaction);
    const isOdometerDistance = isOdometerDistanceRequest(splitExpenseDraftTransaction);
    const {unit, rate, name: rateName} = DistanceRequestUtils.getRate({transaction: splitExpenseDraftTransaction, policy: effectivePolicy});
    const distance = getDistanceInMeters(splitExpenseDraftTransaction, unit);
    const currentAmount = useMemo(() => {
        if (isDistance && distance && rate) {
            return DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate) * originalSign;
        }
        return Math.abs(Number(splitExpenseDraftTransaction?.amount)) * originalSign;
    }, [isDistance, distance, rate, unit, originalSign, splitExpenseDraftTransaction?.amount]);
    const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(true, distance, unit, rate, translate, false, isManualDistance);
    const currentRateID = getRateID(splitExpenseDraftTransaction);
    const rates = DistanceRequestUtils.getMileageRates(effectivePolicy, false, currentRateID);

    const currency = splitExpenseDraftTransactionDetails.currency ?? CONST.CURRENCY.USD;

    // Compute the header merchant from current distance and rate when available,
    // so that a stale stored merchant (e.g. "Pending..." set before the MAP route was calculated)
    // does not appear in the title. Falls back to the stored merchant otherwise.
    const merchantToDisplay = useMemo(() => {
        if (isDistance && distance && rate && unit) {
            return DistanceRequestUtils.getDistanceMerchant(true, distance, unit, rate, currency, translate, toLocaleDigit, getCurrencySymbol, true);
        }
        return splitExpenseDraftTransactionDetails?.merchant ?? '';
    }, [isDistance, distance, rate, unit, currency, translate, toLocaleDigit, getCurrencySymbol, splitExpenseDraftTransactionDetails?.merchant]);

    const isCustomUnitOutOfPolicy = !isSelfDMSplit && (!rates[currentRateID] || (isDistance && !rate));
    const rateToDisplay = DistanceRequestUtils.getRateForExpenseDisplay(rateName, isCustomUnitOutOfPolicy, unit, rate, currency, translate, toLocaleDigit, getCurrencySymbol, isOffline);

    const getErrorForField = (field: ViolationField) => {
        if (isCustomUnitOutOfPolicy && field === 'customUnitRateID') {
            return translate('violations.customUnitOutOfPolicy');
        }

        return '';
    };

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
                interactive={!isSelfDMSplit}
                shouldShowRightIcon={!isSelfDMSplit}
                titleStyle={styles.flex1}
                brickRoadIndicator={getErrorForField('customUnitRateID') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={getErrorForField('customUnitRateID')}
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
                        title={translate('iou.splitExpenseEditTitle', convertToDisplayString(currentAmount, splitExpenseDraftTransactionDetails?.currency), merchantToDisplay)}
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
                                sentryLabel={CONST.SENTRY_LABEL.SPLIT_EXPENSE.REMOVE_SPLIT_BUTTON}
                            />
                        )}
                        <Button
                            success
                            large
                            style={[styles.w100]}
                            text={translate('common.save')}
                            onPress={() => {
                                updateSplitExpenseField(splitExpenseDraftTransaction, originalTransactionDraft, splitExpenseTransactionID, transaction, effectivePolicy);
                                Navigation.goBack(backTo);
                            }}
                            pressOnEnter
                            enterKeyEventListenerPriority={1}
                            sentryLabel={CONST.SENTRY_LABEL.SPLIT_EXPENSE.EDIT_SAVE_BUTTON}
                        />
                    </FixedFooter>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default SplitExpenseEditPage;
