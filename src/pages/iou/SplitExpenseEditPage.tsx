import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchResultsContext} from '@components/Search/SearchContext';
import Switch from '@components/Switch';
import Text from '@components/Text';

import useAllTransactions from '@hooks/useAllTransactions';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrevious from '@hooks/usePrevious';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useSplitEffectivePolicy from '@hooks/useSplitEffectivePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ViolationField} from '@hooks/useViolations';

import {initDraftSplitExpenseDataForEdit, removeSplitExpenseField, updateSplitExpenseDraftField, updateSplitExpenseField} from '@libs/actions/IOU/SplitExpenseItems';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {openPolicyTagsPage} from '@libs/actions/Policy/Tag';
import {getDecodedLeafCategoryName, isCategoryDescriptionRequired, isCategoryMissing} from '@libs/CategoryUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isBillableEnabledOnPolicy} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitExpenseParamList} from '@libs/Navigation/types';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {arePolicyRulesEnabled, getDistanceRateCustomUnitRate, getTagLists, hasAnyPaidPolicy, isGroupPolicyByType, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import type {TransactionDetails} from '@libs/ReportUtils';
import {getParsedComment, getReportOrDraftReport, getTransactionDetails, isSelfDM} from '@libs/ReportUtils';
import {getTagVisibility, hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {getDistanceInMeters, getRateID, getTag, getTagForDisplay, getTaxName, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {policyTypeSelector} from '@selectors/Policy';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';

type SplitExpensePageProps = PlatformStackScreenProps<SplitExpenseParamList, typeof SCREENS.MONEY_REQUEST.SPLIT_EXPENSE>;

function SplitExpenseEditPage({route}: SplitExpensePageProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate, toLocaleDigit} = useLocalize();
    const {convertToDisplayString, getCurrencySymbol} = useCurrencyListActions();
    const {currentSearchResults} = useSearchResultsContext();

    const {reportID, transactionID, splitExpenseTransactionID = '', backTo} = route.params;

    const [splitExpenseDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);
    const [originalTransactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${splitExpenseDraftTransaction?.comment?.originalTransactionID}`, undefined, [
        splitExpenseDraftTransaction?.comment?.originalTransactionID,
    ]);
    console.log('>>>>>>>>>>>>>>>>>>', splitExpenseDraftTransaction);
    const splitExpenseDraftTransactionDetails = useMemo<Partial<TransactionDetails>>(() => getTransactionDetails(splitExpenseDraftTransaction) ?? {}, [splitExpenseDraftTransaction]);
    const allTransactions = useAllTransactions();

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`];
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`];

    const report = useReportOrReportDraft(reportID);
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    const currentReport = report ?? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`];

    const personalPolicy = usePersonalPolicy();
    const effectivePolicy = useSplitEffectivePolicy(currentReport, splitExpenseDraftTransaction, transaction);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // Detect selfDM splits whose source workspace is gone: nothing for the Rate step to render.
    const hasAnyPaidWorkspace = hasAnyPaidPolicy(allPolicies ?? {});
    const {shouldSelectPolicy, shouldNavigateToUpgradePath} = usePolicyForMovingExpenses();

    const effectivePolicyID = effectivePolicy?.id;

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${effectivePolicyID}`);

    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${effectivePolicyID}`);
    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const fetchData = useCallback(() => {
        if (!policyCategories) {
            openPolicyCategoriesPage(effectivePolicyID ?? String(CONST.DEFAULT_NUMBER_ID));
        }
        if (!policyTags) {
            openPolicyTagsPage(effectivePolicyID ?? String(CONST.DEFAULT_NUMBER_ID));
        }
    }, [effectivePolicyID, policyCategories, policyTags]);

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

    const draftTransactionReport = getReportOrDraftReport(splitExpenseDraftTransaction?.reportID);
    const isSelfDMSplit = isSelfDM(draftTransactionReport);
    const isExpenseUnreported = isSelfDMSplit;
    const [draftTransactionPolicyType] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${draftTransactionReport?.policyID}`, {
        selector: policyTypeSelector,
    });
    const isPolicyExpenseChat = isGroupPolicyByType(draftTransactionPolicyType);

    const originalTransactionCategory = transaction?.category ?? '';
    const originalTransactionTag = transaction?.tag ?? '';

    const transactionCategory = splitExpenseDraftTransactionDetails?.category ?? '';
    const categoryForDisplay = isCategoryMissing(transactionCategory) ? '' : transactionCategory;
    const hasOriginalCategory = !!originalTransactionCategory && !isCategoryMissing(originalTransactionCategory);
    const shouldShowCategory =
        hasOriginalCategory ||
        (isPolicyExpenseChat && (!!categoryForDisplay || hasEnabledOptions(policyCategories ?? {}))) ||
        (isExpenseUnreported && (!effectivePolicy || hasEnabledOptions(policyCategories ?? {})));

    const transactionTag = getTag(splitExpenseDraftTransaction);
    const policyTagLists = useMemo(() => getTagLists(policyTags), [policyTags]);

    const {isProduction} = useEnvironment();
    const isSplitAvailable =
        report && transaction && isSplitAction(currentReport, [transaction], originalTransaction, login ?? '', currentUserAccountID, effectivePolicy, parentReport, isProduction);

    const isCategoryRequired = !!effectivePolicy?.requiresCategory && !isSelfDMSplit;
    const reportAttributes = useReportAttributes();
    const reportName = getReportName(currentReport, reportAttributes) || parentReport?.reportName;
    const isDescriptionRequired = isCategoryDescriptionRequired(policyCategories, splitExpenseDraftTransactionDetails?.category, arePolicyRulesEnabled(effectivePolicy, policyCategories));

    // Mirror MoneyRequestView's `shouldShowTag`, plus always surface the row when the original
    // (parent) transaction carried a tag — same rationale as `shouldShowCategory` above: workspace
    // deletion leaves the gate flags false, but the preserved tag should still be re-selectable.
    const shouldShowTags = !!originalTransactionTag || ((isPolicyExpenseChat || isExpenseUnreported) && !!(transactionTag || hasEnabledTags(policyTagLists)));
    const tagVisibility = useMemo(
        () =>
            getTagVisibility({
                shouldShowTags,
                policy: effectivePolicy,
                policyTags,
                transaction: splitExpenseDraftTransaction,
            }),
        [shouldShowTags, effectivePolicy, policyTags, splitExpenseDraftTransaction],
    );

    const previousTagsVisibility = usePrevious(tagVisibility.map((v) => v.shouldShow)) ?? [];

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat || isExpenseUnreported, effectivePolicy, isDistanceRequest(splitExpenseDraftTransaction), false, false);
    const taxRatesDescription = effectivePolicy?.taxRates?.name;
    const taxRateTitle = getTaxName(effectivePolicy, splitExpenseDraftTransaction);

    const shouldShowBillable = (isPolicyExpenseChat || isExpenseUnreported) && (!!splitExpenseDraftTransactionDetails?.billable || isBillableEnabledOnPolicy(effectivePolicy));
    const shouldShowReimbursable = (isPolicyExpenseChat || (isExpenseUnreported && !!effectivePolicy)) && effectivePolicy?.disabledFields?.reimbursable !== true;

    const isDistance = isDistanceRequest(splitExpenseDraftTransaction);
    const isManualDistance = isManualDistanceRequest(splitExpenseDraftTransaction);
    const isOdometerDistance = isOdometerDistanceRequest(splitExpenseDraftTransaction);
    const {
        unit,
        rate,
        name: rateName,
    } = DistanceRequestUtils.getRate({
        transaction: splitExpenseDraftTransaction,
        policy: effectivePolicy,
        personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
    });
    const distance = getDistanceInMeters(splitExpenseDraftTransaction, unit);
    const currentAmount =
        isDistance && distance && rate
            ? DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate) * originalSign
            : Math.abs(Number(splitExpenseDraftTransaction?.amount)) * originalSign;
    const distanceToDisplay = DistanceRequestUtils.getDistanceForDisplay(true, distance, unit, rate, translate, false, isManualDistance);
    const currentRateID = getRateID(splitExpenseDraftTransaction);
    const rates = DistanceRequestUtils.getMileageRates(effectivePolicy, false, currentRateID);

    const currency = splitExpenseDraftTransactionDetails.currency ?? CONST.CURRENCY.USD;

    // Compute the header merchant from current distance and rate when available,
    // so that a stale stored merchant (e.g. "Pending..." set before the MAP route was calculated)
    // does not appear in the title. Falls back to the stored merchant otherwise.
    const merchantToDisplay =
        isDistance && distance && rate && unit
            ? DistanceRequestUtils.getDistanceMerchant(true, distance, unit, rate, currency, translate, toLocaleDigit, getCurrencySymbol, true)
            : (splitExpenseDraftTransactionDetails?.merchant ?? '');

    const isP2PRate = currentRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;
    const rawPolicyRate = !isP2PRate && currentRateID && effectivePolicy ? getDistanceRateCustomUnitRate(effectivePolicy, currentRateID) : undefined;
    const isRateBroken =
        isDistance && !isP2PRate && (!rates[currentRateID] || !rate || rawPolicyRate?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || rawPolicyRate?.enabled === false);
    const hasAvailableEnabledRates = Object.keys(DistanceRequestUtils.getMileageRates(effectivePolicy)).length > 0;
    const isCustomUnitOutOfPolicy = isSelfDMSplit ? isRateBroken : !rates[currentRateID] || (isDistance && !rate);
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
                interactive={!isSelfDMSplit || isRateBroken || hasAvailableEnabledRates || !hasAnyPaidWorkspace}
                shouldShowRightIcon={!isSelfDMSplit || isRateBroken || hasAvailableEnabledRates || !hasAnyPaidWorkspace}
                titleStyle={styles.flex1}
                brickRoadIndicator={getErrorForField('customUnitRateID') ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={getErrorForField('customUnitRateID')}
                style={[styles.moneyRequestMenuItem]}
                onPress={() => {
                    // SelfDM split whose source workspace is gone and user has no other paid workspace:
                    // mirror the selfDM track-expense Rate flow (MoneyRequestView) and route through the
                    // IOU-level upgrade screen so the user can create a workspace, then a distance rate.
                    // Use OPTIMISTIC_TRANSACTION_ID so the post-upgrade hop back into the rate step picks
                    // up the same SPLIT_TRANSACTION_DRAFT this screen reads from (see line 57 above).
                    if (isSelfDMSplit && !effectivePolicy && !hasAnyPaidWorkspace && reportID) {
                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                                action: CONST.IOU.ACTION.EDIT,
                                iouType: CONST.IOU.TYPE.SPLIT_EXPENSE,
                                transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                reportID,
                                upgradePath: CONST.UPGRADE_PATHS.DISTANCE_RATES,
                            }),
                        );
                        return;
                    }
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
                                title={getDecodedLeafCategoryName(splitExpenseDraftTransactionDetails?.category ?? '')}
                                numberOfLinesTitle={2}
                                rightLabel={isCategoryRequired ? translate('common.required') : ''}
                                onPress={() => {
                                    const categoryRoute = ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(
                                        CONST.IOU.ACTION.EDIT,
                                        CONST.IOU.TYPE.SPLIT_EXPENSE,
                                        CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                        reportID,
                                        Navigation.getActiveRoute(),
                                    );
                                    if (shouldNavigateToUpgradePath) {
                                        Navigation.navigate(
                                            ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                                                action: CONST.IOU.ACTION.EDIT,
                                                iouType: CONST.IOU.TYPE.SPLIT_EXPENSE,
                                                transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                                reportID,
                                                upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                                                backTo: categoryRoute,
                                            }),
                                        );
                                        return;
                                    }
                                    if (!effectivePolicy && shouldSelectPolicy) {
                                        Navigation.navigate(ROUTES.SET_DEFAULT_WORKSPACE.getRoute(categoryRoute));
                                        return;
                                    }
                                    Navigation.navigate(categoryRoute);
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
                        {shouldShowTax && (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                key={translate('common.tax')}
                                description={taxRatesDescription ?? translate('common.tax')}
                                title={taxRateTitle}
                                numberOfLinesTitle={2}
                                onPress={() => {
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(
                                            CONST.IOU.ACTION.EDIT,
                                            CONST.IOU.TYPE.SPLIT,
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
                        {shouldShowTax && (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                key={translate('iou.taxAmount')}
                                description={translate('iou.taxAmount')}
                                title={convertToDisplayString(Math.abs(splitExpenseDraftTransaction?.taxAmount ?? 0), currency)}
                                numberOfLinesTitle={2}
                                onPress={() => {
                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(
                                            CONST.IOU.ACTION.EDIT,
                                            CONST.IOU.TYPE.SPLIT,
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
                        {shouldShowReimbursable && (
                            <View style={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mh5]}>
                                <Text>{translate('common.reimbursable')}</Text>
                                <Switch
                                    accessibilityLabel={translate('common.reimbursable')}
                                    isOn={splitExpenseDraftTransaction?.reimbursable ?? true}
                                    onToggle={(value) => {
                                        updateSplitExpenseDraftField({reimbursable: value});
                                    }}
                                />
                            </View>
                        )}
                        {shouldShowBillable && (
                            <View style={[styles.flexRow, styles.optionRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.mh5]}>
                                <Text>{translate('common.billable')}</Text>
                                <Switch
                                    accessibilityLabel={translate('common.billable')}
                                    isOn={splitExpenseDraftTransaction?.billable ?? false}
                                    onToggle={(value) => {
                                        updateSplitExpenseDraftField({billable: value});
                                    }}
                                />
                            </View>
                        )}
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
                                updateSplitExpenseField(
                                    splitExpenseDraftTransaction,
                                    originalTransactionDraft,
                                    splitExpenseTransactionID,
                                    transaction,
                                    effectivePolicy,
                                    isSelfDMSplit,
                                    personalPolicy?.outputCurrency,
                                );
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
