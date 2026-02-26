import {emailSelector} from '@selectors/Session';
import {format} from 'date-fns';
import {Str} from 'expensify-common';
import {deepEqual} from 'fast-equals';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOutstandingReports from '@hooks/useOutstandingReports';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrevious from '@hooks/usePrevious';
import useReportAttributes from '@hooks/useReportAttributes';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {isMovingTransactionFromTrackExpense, shouldShowReceiptEmptyState} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDestinationForDisplay, getSubratesFields, getSubratesForDisplay, getTimeDifferenceIntervals, getTimeForDisplay} from '@libs/PerDiemRequestUtils';
import {canSendInvoice, getPerDiemCustomUnit} from '@libs/PolicyUtils';
import type {ThumbnailAndImageURI} from '@libs/ReceiptUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {generateReportID, getDefaultWorkspaceAvatar, getOutstandingReportsForUser, isMoneyRequestReport, isReportOutstanding} from '@libs/ReportUtils';
import {getTagVisibility, hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {
    getTagForDisplay,
    getTaxAmount,
    getTaxRateTitle,
    isAmountMissing,
    isCreatedMissing,
    isFetchingWaypointsFromServer,
    isManagedCardTransaction,
    isScanRequest,
    shouldShowAttendees as shouldShowAttendeesTransactionUtils,
    willFieldBeAutomaticallyFilled,
} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Badge from './Badge';
import Button from './Button';
import ConfirmedRoute from './ConfirmedRoute';
import MentionReportContext from './HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import Icon from './Icon';
import MenuItem from './MenuItem';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import getCompactReceiptDimensions from './MoneyRequestConfirmationListFooter/getCompactReceiptDimensions';
import getImageCompactModeStyle from './MoneyRequestConfirmationListFooter/getImageCompactModeStyle';
import getReceiptContainerCompactModeStyle from './MoneyRequestConfirmationListFooter/getReceiptContainerCompactModeStyle';
import PDFThumbnail from './PDFThumbnail';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import ReceiptEmptyState from './ReceiptEmptyState';
import ReceiptImage from './ReceiptImage';
import {ShowContextMenuContext} from './ShowContextMenuContext';
import Text from './Text';

type MoneyRequestConfirmationListFooterProps = {
    /** The action to perform */
    action: IOUAction;

    /** The currency of the transaction */
    currency: string;

    /** Flag indicating if the confirmation is done */
    didConfirm: boolean;

    /** The distance of the transaction */
    distance: number;

    /** The formatted amount of the transaction */
    formattedAmount: string;

    /** The formatted amount of the transaction per 1 attendee */
    formattedAmountPerAttendee: string;

    /** The error message for the form */
    formError: string;

    /** Flag indicating if there is a route */
    hasRoute: boolean;

    /** The category of the IOU */
    iouCategory: string;

    /** The list of attendees */
    iouAttendees: Attendee[] | undefined;

    /** The comment of the IOU */
    iouComment: string | undefined;

    /** The creation date of the IOU */
    iouCreated: string | undefined;

    /** The currency code of the IOU */
    iouCurrencyCode: string | undefined;

    /** Flag indicating if the IOU is billable */
    iouIsBillable: boolean;

    /** The merchant of the IOU */
    iouMerchant: string | undefined;

    /** The hours count of the time request */
    iouTimeCount: number | undefined;

    /** The hourly rate of the time request */
    iouTimeRate: number | undefined;

    /** The type of the IOU */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Flag indicating if the category is required */
    isCategoryRequired: boolean;

    /** Flag indicating if it is a distance request */
    isDistanceRequest: boolean;

    /** Flag indicating if it is a manual distance request */
    isManualDistanceRequest: boolean;

    /** Flag indicating if it is an odometer distance request */
    isOdometerDistanceRequest?: boolean;

    /** Flag indicating if it is a GPS distance request */
    isGPSDistanceRequest: boolean;

    /** Flag indicating if it is a per diem request */
    isPerDiemRequest: boolean;

    /** Flag indicating if it is a time request */
    isTimeRequest: boolean;

    /** Flag indicating if the merchant is empty */
    isMerchantEmpty: boolean;

    /** Flag indicating if the merchant is required */
    isMerchantRequired: boolean | undefined;

    /** Flag indicating if it is a policy expense chat */
    isPolicyExpenseChat: boolean;

    /** Flag indicating if it is read-only */
    isReadOnly: boolean;

    /** Flag indicating if it is an invoice type */
    isTypeInvoice: boolean;

    /** Function to toggle billable */
    onToggleBillable?: (isOn: boolean) => void;

    /** The policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The policy tag lists */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** The policy tag lists */
    policyTagLists: Array<ValueOf<OnyxTypes.PolicyTagLists>>;

    /** The rate of the transaction */
    rate: number | undefined;

    /** The filename of the receipt */
    receiptFilename: string;

    /** The path of the receipt */
    receiptPath: string | number;

    /** The report action ID */
    reportActionID: string | undefined;

    /** The report ID */
    reportID: string;

    /** The selected participants */
    selectedParticipants: Participant[];

    /** Flag indicating if the field error should be displayed */
    shouldDisplayFieldError: boolean;

    /** Flag indicating if the receipt should be displayed */
    shouldDisplayReceipt: boolean;

    /** Flag indicating if the categories should be shown */
    shouldShowCategories: boolean;

    /** Flag indicating if the merchant should be shown */
    shouldShowMerchant: boolean;

    /** Flag indicating if the smart scan fields should be shown */
    shouldShowSmartScanFields: boolean;

    /** Flag indicating if the amount field should be shown */
    shouldShowAmountField?: boolean;

    /** Flag indicating if the tax should be shown */
    shouldShowTax: boolean;

    /** The transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The transaction ID */
    transactionID: string | undefined;

    /** Whether the receipt can be replaced */
    isReceiptEditable?: boolean;

    /** The unit */
    unit: Unit | undefined;

    /** The PDF load error callback */
    onPDFLoadError?: () => void;

    /** The PDF password callback */
    onPDFPassword?: () => void;

    /** Function to toggle reimbursable */
    onToggleReimbursable?: (isOn: boolean) => void;

    /** Flag indicating if the IOU is reimbursable */
    iouIsReimbursable: boolean;

    /** Flag indicating if the description is required */
    isDescriptionRequired: boolean;

    /** Whether to show all optional fields */
    showMoreFields?: boolean;

    /** Toggles compact mode by showing all fields */
    setShowMoreFields?: (showMoreFields: boolean) => void;
};

type ConfirmationField = {
    item: React.JSX.Element;
    shouldShow: boolean;
    shouldShowAboveShowMore?: boolean;
    isSupplementary?: boolean;
};

function MoneyRequestConfirmationListFooter({
    action,
    currency,
    didConfirm,
    distance,
    formattedAmount,
    formattedAmountPerAttendee,
    formError,
    hasRoute,
    iouAttendees,
    iouCategory,
    iouComment,
    iouCreated,
    iouCurrencyCode,
    iouIsBillable,
    iouMerchant,
    iouType,
    iouTimeCount,
    iouTimeRate,
    isCategoryRequired,
    isDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest = false,
    isGPSDistanceRequest,
    isPerDiemRequest,
    isTimeRequest,
    isMerchantEmpty,
    isMerchantRequired,
    isPolicyExpenseChat,
    isReadOnly,
    isTypeInvoice,
    onToggleBillable,
    policy,
    policyTags,
    policyTagLists,
    rate,
    receiptFilename,
    receiptPath,
    reportActionID,
    reportID,
    selectedParticipants,
    shouldDisplayFieldError,
    shouldDisplayReceipt,
    shouldShowCategories,
    shouldShowMerchant,
    shouldShowSmartScanFields,
    shouldShowAmountField = true,
    shouldShowTax,
    transaction,
    transactionID,
    unit,
    onPDFLoadError,
    onPDFPassword,
    iouIsReimbursable,
    onToggleReimbursable,
    isReceiptEditable = false,
    isDescriptionRequired = false,
    showMoreFields = false,
    setShowMoreFields = () => {},
}: MoneyRequestConfirmationListFooterProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch', 'CalendarSolid', 'Sparkles', 'DownArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, toLocaleDigit, localeCompare} = useLocalize();
    const {getCurrencySymbol} = useCurrencyListActions();
    const {isOffline} = useNetwork();
    const {windowWidth} = useWindowDimensions();

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const reportAttributes = useReportAttributes();
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const {policyForMovingExpensesID, policyForMovingExpenses, shouldSelectPolicy} = usePolicyForMovingExpenses();

    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const decodedCategoryName = useMemo(() => getDecodedCategoryName(iouCategory), [iouCategory]);
    const isScan = isScanRequest(transaction);

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const shouldShowTags = useMemo(
        () => (isPolicyExpenseChat || isUnreported || isCreatingTrackExpense) && hasEnabledTags(policyTagLists),
        [isCreatingTrackExpense, isPolicyExpenseChat, isUnreported, policyTagLists],
    );
    const shouldShowAttendees = useMemo(() => shouldShowAttendeesTransactionUtils(iouType, policy), [iouType, policy]);

    const hasPendingWaypoints = transaction && isFetchingWaypointsFromServer(transaction);
    const hasErrors = !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields?.route) || !isEmptyObject(transaction?.errorFields?.waypoints);
    const shouldShowMap =
        isDistanceRequest && !isManualDistanceRequest && !isOdometerDistanceRequest && [hasErrors, hasPendingWaypoints, iouType !== CONST.IOU.TYPE.SPLIT, !isReadOnly].some(Boolean);
    const isFromGlobalCreate = !!transaction?.isFromGlobalCreate;

    const senderWorkspace = useMemo(() => {
        const senderWorkspaceParticipant = selectedParticipants.find((participant) => participant.isSender);
        return allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${senderWorkspaceParticipant?.policyID}`];
    }, [allPolicies, selectedParticipants]);

    const canUpdateSenderWorkspace = useMemo(() => {
        const isInvoiceRoomParticipant = selectedParticipants.some((participant) => participant.isInvoiceRoom);

        return canSendInvoice(allPolicies, currentUserLogin) && isFromGlobalCreate && !isInvoiceRoomParticipant;
    }, [allPolicies, currentUserLogin, selectedParticipants, isFromGlobalCreate]);

    /**
     * We need to check if the transaction report exists first in order to prevent the outstanding reports from being used.
     * Also we need to check if transaction report exists in outstanding reports in order to show a correct report name.
     */
    const transactionReport = transaction?.reportID ? Object.values(allReports ?? {}).find((report) => report?.reportID === transaction.reportID) : undefined;
    const policyID = selectedParticipants?.at(0)?.policyID;
    const shouldUseTransactionReport = (!!transactionReport && isReportOutstanding(transactionReport, policyID, undefined, false)) || isUnreported;

    const ownerAccountID = selectedParticipants?.at(0)?.ownerAccountID;

    const availableOutstandingReports = useMemo(() => {
        return getOutstandingReportsForUser(policyID, ownerAccountID, outstandingReportsByPolicyID?.[policyID ?? CONST.DEFAULT_NUMBER_ID] ?? {}, reportNameValuePairs, false).sort((a, b) =>
            localeCompare(a?.reportName?.toLowerCase() ?? '', b?.reportName?.toLowerCase() ?? ''),
        );
    }, [policyID, ownerAccountID, outstandingReportsByPolicyID, reportNameValuePairs, localeCompare]);

    const iouReportID = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.iouReportID;
    const outstandingReportID = isPolicyExpenseChat ? (iouReportID ?? availableOutstandingReports.at(0)?.reportID) : reportID;
    const [selectedReportID, selectedReport] = useMemo(() => {
        const reportIDToUse = shouldUseTransactionReport ? transaction?.reportID : outstandingReportID;
        if (!reportIDToUse) {
            // Even if we have no report to use we still need a report id for proper navigation
            return [generateReportID(), undefined];
        }

        const reportToUse = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDToUse}`];
        return [reportIDToUse, reportToUse];
    }, [allReports, shouldUseTransactionReport, transaction?.reportID, outstandingReportID]);

    const reportName = useMemo(() => {
        const name = getReportName(selectedReport, reportAttributes);
        if (!name) {
            return isUnreported ? translate('common.none') : translate('iou.newReport');
        }
        return name;
    }, [isUnreported, selectedReport, reportAttributes, translate]);

    const outstandingReports = useOutstandingReports(undefined, isFromGlobalCreate && !isPerDiemRequest ? undefined : policyID, ownerAccountID, false);
    // When creating an expense in an individual report, the report field becomes read-only
    // since the destination is already determined and there's no need to show a selectable list.
    const shouldReportBeEditable = (isUnreported ? outstandingReports.length >= 1 : outstandingReports.length > 1) && !isMoneyRequestReport(reportID, allReports);

    const isMovingCurrentTransactionFromTrackExpense = isMovingTransactionFromTrackExpense(action);
    const taxRates = policy?.taxRates ?? (isMovingCurrentTransactionFromTrackExpense ? policyForMovingExpenses?.taxRates : null);
    // In Send Money and Split Bill with Scan flow, we don't allow the Merchant or Date to be edited. For distance requests, don't show the merchant as there's already another "Distance" menu item
    const shouldShowDate = shouldShowSmartScanFields || isDistanceRequest;
    // Determines whether the tax fields can be modified.
    // The tax fields can only be modified if the component is not in read-only mode
    // and it is not a distance request.
    const canModifyTaxFields = !isReadOnly && !isDistanceRequest && !isPerDiemRequest;
    // A flag for showing the billable field
    const shouldShowBillable = policy?.disabledFields?.defaultBillable === false;
    const shouldShowReimbursable =
        (isPolicyExpenseChat || isTrackExpense) && !!policy && policy?.disabledFields?.reimbursable !== true && !isManagedCardTransaction(transaction) && !isTypeInvoice;
    // Calculate the formatted tax amount based on the transaction's tax amount and the IOU currency code
    const taxAmount = getTaxAmount(transaction, false);
    const formattedTaxAmount = convertToDisplayString(taxAmount, iouCurrencyCode);
    // Get the tax rate title based on the policy and transaction
    const taxRateTitle = getTaxRateTitle(policy, transaction, isMovingCurrentTransactionFromTrackExpense, policyForMovingExpenses);

    // Determine if the merchant error should be displayed
    const shouldDisplayMerchantError = isMerchantRequired && (shouldDisplayFieldError || formError === 'iou.error.invalidMerchant') && isMerchantEmpty;
    const shouldDisplayDistanceRateError = formError === 'iou.error.invalidRate';
    const shouldDisplayTagError = formError === 'violations.tagOutOfPolicy';
    const shouldDisplayTaxRateError = formError === 'violations.taxOutOfPolicy';
    const shouldDisplayCategoryError = formError === 'violations.categoryOutOfPolicy';
    const shouldDisplayAttendeesError = formError === 'violations.missingAttendees';

    const showReceiptEmptyState = shouldShowReceiptEmptyState(iouType, action, policy, isPerDiemRequest);
    // The per diem custom unit
    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    const {
        image: receiptImage,
        thumbnail: receiptThumbnail,
        isThumbnail,
        fileExtension,
        isLocalFile,
    } = receiptPath && receiptFilename ? getThumbnailAndImageURIs(transaction, receiptPath, receiptFilename) : ({} as ThumbnailAndImageURI);
    const resolvedThumbnail = isLocalFile ? receiptThumbnail : tryResolveUrlFromApiRoot(receiptThumbnail ?? '');
    const resolvedReceiptImage = isLocalFile ? receiptImage : tryResolveUrlFromApiRoot(receiptImage ?? '');

    const shouldNavigateToUpgradePath = !policyForMovingExpensesID && !shouldSelectPolicy;
    // Time requests appear as regular expenses after they're created, with editable amount and merchant, not hours and rate
    const shouldShowTimeRequestFields = isTimeRequest && action === CONST.IOU.ACTION.CREATE;

    const contextMenuContextValue = useMemo(
        () => ({
            anchor: null,
            report: undefined,
            isReportArchived: false,
            action: undefined,
            checkIfContextMenuActive: () => {},
            onShowContextMenu: () => {},
            isDisabled: true,
            shouldDisplayContextMenu: false,
        }),
        [],
    );

    const tagVisibility = useMemo(
        () =>
            getTagVisibility({
                shouldShowTags,
                policy,
                policyTags,
                transaction,
            }),
        [shouldShowTags, policy, policyTags, transaction],
    );

    const previousTagsVisibility = usePrevious(tagVisibility.map((v) => v.shouldShow)) ?? [];

    const mentionReportContextValue = useMemo(() => ({currentReportID: reportID, exactlyMatch: true}), [reportID]);

    const getCategoryRightLabelIcon = useCallback(() => (willFieldBeAutomaticallyFilled(transaction, 'category') ? icons.Sparkles : undefined), [transaction, icons.Sparkles]);
    const getCategoryRightLabel = useCallback(() => {
        if (willFieldBeAutomaticallyFilled(transaction, 'category')) {
            return translate('common.automatic');
        }
        if (isCategoryRequired) {
            return translate('common.required');
        }
        return '';
    }, [transaction, translate, isCategoryRequired]);

    const fields: ConfirmationField[] = [
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('iou.amount')}
                    shouldShowRightIcon={!isReadOnly && !isDistanceRequest && !shouldShowTimeRequestFields}
                    title={formattedAmount}
                    description={translate('iou.amount')}
                    interactive={!isReadOnly && !shouldShowTimeRequestFields}
                    onPress={() => {
                        if (isDistanceRequest || shouldShowTimeRequestFields || !transactionID) {
                            return;
                        }

                        Navigation.navigate(
                            ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(action, iouType, transactionID, reportID, reportActionID, CONST.IOU.PAGE_INDEX.CONFIRM, Navigation.getActiveRoute()),
                        );
                    }}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm}
                    brickRoadIndicator={shouldDisplayFieldError && isAmountMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayFieldError && isAmountMissing(transaction) ? translate('common.error.enterAmount') : ''}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.AMOUNT_FIELD}
                />
            ),
            shouldShow: shouldShowSmartScanFields && shouldShowAmountField,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <View key={translate('common.description')}>
                    <ShowContextMenuContext.Provider value={contextMenuContextValue}>
                        <MentionReportContext.Provider value={mentionReportContextValue}>
                            <MenuItemWithTopDescription
                                shouldShowRightIcon={!isReadOnly}
                                shouldParseTitle
                                excludedMarkdownRules={!policy ? ['reportMentions'] : []}
                                title={iouComment}
                                description={translate('common.description')}
                                onPress={() => {
                                    if (!transactionID) {
                                        return;
                                    }

                                    Navigation.navigate(
                                        ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID),
                                    );
                                }}
                                style={[styles.moneyRequestMenuItem]}
                                titleStyle={styles.flex1}
                                disabled={didConfirm}
                                interactive={!isReadOnly}
                                numberOfLinesTitle={2}
                                rightLabel={isDescriptionRequired ? translate('common.required') : ''}
                                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DESCRIPTION_FIELD}
                            />
                        </MentionReportContext.Provider>
                    </ShowContextMenuContext.Provider>
                </View>
            ),
            shouldShow: true,
            shouldShowAboveShowMore: true,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.distance')}
                    shouldShowRightIcon={!isReadOnly && !isGPSDistanceRequest}
                    title={DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate, undefined, isManualDistanceRequest)}
                    description={translate('common.distance')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }

                        if (isManualDistanceRequest) {
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                            return;
                        }

                        if (isOdometerDistanceRequest) {
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(action, iouType, transactionID, reportID));
                            return;
                        }

                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly && !isGPSDistanceRequest}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DISTANCE_FIELD}
                />
            ),
            shouldShow: isDistanceRequest,
            shouldShowAboveShowMore: true,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.rate')}
                    shouldShowRightIcon={!!rate && !isReadOnly && iouType !== CONST.IOU.TYPE.SPLIT && !isUnreported}
                    title={DistanceRequestUtils.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, getCurrencySymbol, isOffline)}
                    description={translate('common.rate')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }

                        if (!isPolicyExpenseChat) {
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                                    action,
                                    iouType,
                                    transactionID,
                                    reportID,
                                    upgradePath: CONST.UPGRADE_PATHS.DISTANCE_RATES,
                                    backTo: Navigation.getActiveRoute(),
                                    shouldSubmitExpense: true,
                                }),
                            );
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                    }}
                    brickRoadIndicator={shouldDisplayDistanceRateError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    disabled={didConfirm}
                    interactive={!!rate && !isReadOnly && iouType !== CONST.IOU.TYPE.SPLIT && !isUnreported}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.RATE_FIELD}
                />
            ),
            shouldShow: isDistanceRequest,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.merchant')}
                    shouldShowRightIcon={!isReadOnly}
                    title={isMerchantEmpty ? '' : iouMerchant}
                    description={translate('common.merchant')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }

                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    brickRoadIndicator={shouldDisplayMerchantError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayMerchantError ? translate('common.error.fieldRequired') : ''}
                    rightLabel={isMerchantRequired && !shouldDisplayMerchantError ? translate('common.required') : ''}
                    numberOfLinesTitle={2}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.MERCHANT_FIELD}
                />
            ),
            shouldShow: shouldShowMerchant,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('iou.timeTracking.hours')}
                    shouldShowRightIcon={!isReadOnly}
                    title={`${iouTimeCount}`}
                    description={translate('iou.timeTracking.hours')}
                    style={styles.moneyRequestMenuItem}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_HOURS_EDIT.getRoute(action, iouType, transactionID, reportID, reportActionID));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.HOURS_FIELD}
                />
            ),
            shouldShow: shouldShowTimeRequestFields,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={`time_${translate('common.rate')}`}
                    shouldShowRightIcon={!isReadOnly}
                    title={translate('iou.timeTracking.ratePreview', convertToDisplayString(iouTimeRate, iouCurrencyCode))}
                    description={translate('common.rate')}
                    style={styles.moneyRequestMenuItem}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TIME_RATE.getRoute(action, iouType, transactionID, reportID, reportActionID));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TIME_RATE_FIELD}
                />
            ),
            shouldShow: shouldShowTimeRequestFields,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.category')}
                    shouldShowRightIcon={!isReadOnly}
                    title={decodedCategoryName}
                    description={translate('common.category')}
                    numberOfLinesTitle={2}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }

                        if (shouldNavigateToUpgradePath) {
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                                    action,
                                    iouType,
                                    transactionID,
                                    reportID,
                                    backTo: ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID),
                                    upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                                }),
                            );
                        } else if (!policy && shouldSelectPolicy) {
                            Navigation.navigate(
                                ROUTES.SET_DEFAULT_WORKSPACE.getRoute(
                                    ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID),
                                ),
                            );
                        } else {
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                        }
                    }}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    rightLabel={getCategoryRightLabel()}
                    rightLabelIcon={getCategoryRightLabelIcon()}
                    brickRoadIndicator={shouldDisplayCategoryError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayCategoryError ? translate(formError) : ''}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.CATEGORY_FIELD}
                />
            ),
            shouldShow: shouldShowCategories,
            shouldShowAboveShowMore: isCategoryRequired,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.date')}
                    shouldShowRightIcon={!isReadOnly}
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    title={iouCreated || format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                    description={translate('common.date')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }

                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    brickRoadIndicator={shouldDisplayFieldError && isCreatedMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayFieldError && isCreatedMissing(transaction) ? translate('common.error.enterDate') : ''}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DATE_FIELD}
                />
            ),
            shouldShow: shouldShowDate,
            shouldShowAboveShowMore: false,
        },
        ...policyTagLists.map(({name}, index) => {
            const tagVisibilityItem = tagVisibility.at(index);
            const isTagRequired = tagVisibilityItem?.isTagRequired ?? false;
            const shouldShow = tagVisibilityItem?.shouldShow ?? false;
            const prevShouldShow = previousTagsVisibility.at(index) ?? false;
            return {
                item: (
                    <MenuItemWithTopDescription
                        highlighted={shouldShow && !getTagForDisplay(transaction, index) && !prevShouldShow}
                        key={name}
                        shouldShowRightIcon={!isReadOnly}
                        title={getTagForDisplay(transaction, index)}
                        description={name}
                        shouldShowBasicTitle
                        shouldShowDescriptionOnTop
                        numberOfLinesTitle={2}
                        onPress={() => {
                            if (!transactionID) {
                                return;
                            }

                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(action, iouType, index, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                        }}
                        style={[styles.moneyRequestMenuItem]}
                        brickRoadIndicator={shouldDisplayTagError && !!getTagForDisplay(transaction, index) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={shouldDisplayTagError && !!getTagForDisplay(transaction, index) ? translate(formError) : ''}
                        disabled={didConfirm}
                        interactive={!isReadOnly}
                        rightLabel={isTagRequired ? translate('common.required') : ''}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAG_FIELD}
                    />
                ),
                shouldShow,
                shouldShowAboveShowMore: isTagRequired,
            };
        }),
        {
            item: (
                <MenuItemWithTopDescription
                    key={`${taxRates?.name}${taxRateTitle}`}
                    shouldShowRightIcon={canModifyTaxFields}
                    title={taxRateTitle}
                    description={taxRates?.name}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }

                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute()));
                    }}
                    disabled={didConfirm}
                    interactive={canModifyTaxFields}
                    brickRoadIndicator={shouldDisplayTaxRateError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayTaxRateError ? translate(formError) : ''}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAX_RATE_FIELD}
                />
            ),
            shouldShow: shouldShowTax,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={`${taxRates?.name}${formattedTaxAmount}`}
                    shouldShowRightIcon={canModifyTaxFields}
                    title={formattedTaxAmount}
                    description={translate('iou.taxAmount')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }

                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute()));
                    }}
                    disabled={didConfirm}
                    interactive={canModifyTaxFields}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAX_AMOUNT_FIELD}
                />
            ),
            shouldShow: shouldShowTax,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key="attendees"
                    shouldShowRightIcon={!isReadOnly}
                    title={iouAttendees?.map((item) => item?.displayName ?? item?.login).join(', ')}
                    description={`${translate('iou.attendees')} ${
                        iouAttendees?.length && iouAttendees.length > 1 && formattedAmountPerAttendee ? `\u00B7 ${formattedAmountPerAttendee} ${translate('common.perPerson')}` : ''
                    }`}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID) {
                            return;
                        }

                        Navigation.navigate(ROUTES.MONEY_REQUEST_ATTENDEE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute()));
                    }}
                    interactive={!isReadOnly}
                    shouldRenderAsHTML
                    brickRoadIndicator={shouldDisplayAttendeesError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayAttendeesError ? translate(formError) : ''}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.ATTENDEES_FIELD}
                />
            ),
            shouldShow: shouldShowAttendees,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <View
                    key={Str.UCFirst(translate('iou.reimbursable'))}
                    style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}
                >
                    <ToggleSettingOptionRow
                        switchAccessibilityLabel={Str.UCFirst(translate('iou.reimbursable'))}
                        title={Str.UCFirst(translate('iou.reimbursable'))}
                        onToggle={(isOn) => onToggleReimbursable?.(isOn)}
                        isActive={iouIsReimbursable}
                        disabled={isReadOnly}
                        wrapperStyle={styles.flex1}
                    />
                </View>
            ),
            shouldShow: shouldShowReimbursable,
            isSupplementary: true,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <View
                    key={translate('common.billable')}
                    style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}
                >
                    <ToggleSettingOptionRow
                        switchAccessibilityLabel={translate('common.billable')}
                        title={translate('common.billable')}
                        onToggle={(isOn) => onToggleBillable?.(isOn)}
                        isActive={iouIsBillable}
                        disabled={isReadOnly}
                        wrapperStyle={styles.flex1}
                    />
                </View>
            ),
            shouldShow: shouldShowBillable,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.report')}
                    shouldShowRightIcon={shouldReportBeEditable}
                    title={reportName}
                    description={translate('common.report')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (!transactionID || !selectedReportID) {
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_REPORT.getRoute(action, iouType, transactionID, selectedReportID, Navigation.getActiveRoute(), reportActionID));
                    }}
                    interactive={shouldReportBeEditable}
                    shouldRenderAsHTML
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.REPORT_FIELD}
                />
            ),
            shouldShow: isPolicyExpenseChat,
            shouldShowAboveShowMore: false,
        },
    ];

    const subRates = getSubratesFields(perDiemCustomUnit, transaction);
    const shouldDisplaySubrateError =
        isPerDiemRequest && (shouldDisplayFieldError || formError === 'iou.error.invalidSubrateLength') && (subRates.length === 0 || (subRates.length === 1 && !subRates.at(0)));

    const subRateFields = subRates.map((field, index) => (
        <MenuItemWithTopDescription
            key={`${translate('common.subrate')}${field?.key ?? index}`}
            shouldShowRightIcon={!isReadOnly}
            title={getSubratesForDisplay(field, translate('iou.qty'))}
            description={translate('common.subrate')}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SUBRATE_EDIT.getRoute(action, iouType, transactionID, reportID, index, Navigation.getActiveRoute()));
            }}
            disabled={didConfirm}
            interactive={!isReadOnly}
            brickRoadIndicator={index === 0 && shouldDisplaySubrateError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={index === 0 && shouldDisplaySubrateError ? translate('common.error.fieldRequired') : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.SUBRATE_FIELD}
        />
    ));

    const {firstDay, tripDays, lastDay} = getTimeDifferenceIntervals(transaction);

    const badgeElements = useMemo(() => {
        const badges: React.JSX.Element[] = [];
        if (firstDay) {
            badges.push(
                <Badge
                    key="firstDay"
                    icon={icons.Stopwatch}
                    text={translate('iou.firstDayText', {count: firstDay})}
                />,
            );
        }
        if (tripDays) {
            badges.push(
                <Badge
                    key="tripDays"
                    icon={icons.CalendarSolid}
                    text={translate('iou.tripLengthText', {count: tripDays})}
                />,
            );
        }
        if (lastDay) {
            badges.push(
                <Badge
                    key="lastDay"
                    icon={icons.Stopwatch}
                    text={translate('iou.lastDayText', {count: lastDay})}
                />,
            );
        }
        return badges;
    }, [firstDay, lastDay, translate, tripDays, icons]);

    const isCompactMode = useMemo(() => !showMoreFields && isScan, [isScan, showMoreFields]);
    const [receiptAspectRatio, setReceiptAspectRatio] = useState<number | null>(null);
    const [compactReceiptContainerWidth, setCompactReceiptContainerWidth] = useState(0);
    const handleReceiptLoad = useCallback((event?: {nativeEvent: {width: number; height: number}}) => {
        const width = event?.nativeEvent.width ?? 0;
        const height = event?.nativeEvent.height ?? 0;
        if (!width || !height) {
            return;
        }

        const ratio = width / height;
        setReceiptAspectRatio((previousRatio) => (previousRatio === ratio ? previousRatio : ratio));
    }, []);
    const handleCompactReceiptContainerLayout = useCallback((event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        if (!width) {
            return;
        }
        setCompactReceiptContainerWidth((previousWidth) => (previousWidth === width ? previousWidth : width));
    }, []);

    const hasReceiptImageOrThumbnail = !!(receiptImage ?? receiptThumbnail);
    const horizontalMargin = typeof styles.moneyRequestImage.marginHorizontal === 'number' ? styles.moneyRequestImage.marginHorizontal : 0;
    const {compactReceiptMaxWidth, compactReceiptMaxHeight} = useMemo(
        () =>
            getCompactReceiptDimensions({
                windowWidth,
                horizontalMargin,
                containerWidth: compactReceiptContainerWidth,
                aspectRatio: receiptAspectRatio,
            }),
        [windowWidth, horizontalMargin, compactReceiptContainerWidth, receiptAspectRatio],
    );

    const compactReceiptStyle = useMemo(() => {
        if (!isCompactMode) {
            return undefined;
        }

        const baseStyle = getImageCompactModeStyle(compactReceiptMaxWidth);

        return {
            ...baseStyle,
            maxHeight: compactReceiptMaxHeight,
        };
    }, [isCompactMode, compactReceiptMaxWidth, compactReceiptMaxHeight]);
    const compactReceiptContainerStyle = useMemo(() => {
        if (!isCompactMode) {
            return undefined;
        }

        return getReceiptContainerCompactModeStyle(compactReceiptMaxWidth, compactReceiptMaxHeight);
    }, [isCompactMode, compactReceiptMaxWidth, compactReceiptMaxHeight]);

    const receiptThumbnailContent = useMemo(() => {
        const receiptContainerStyle = isCompactMode && compactReceiptContainerStyle ? compactReceiptContainerStyle : styles.expenseViewImageSmall;
        const receiptThumbnailStyle = [styles.h100, styles.flex1];

        return (
            <View
                style={[styles.moneyRequestImage, receiptContainerStyle]}
                onLayout={isCompactMode ? handleCompactReceiptContainerLayout : undefined}
            >
                {isLocalFile && Str.isPDF(receiptFilename) ? (
                    <PressableWithoutFocus
                        onPress={() => {
                            if (!transactionID) {
                                return;
                            }

                            Navigation.navigate(
                                isReceiptEditable
                                    ? ROUTES.MONEY_REQUEST_RECEIPT_PREVIEW.getRoute(reportID, transactionID, action, iouType)
                                    : ROUTES.TRANSACTION_RECEIPT.getRoute(reportID, transactionID),
                            );
                        }}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.PDF_RECEIPT_THUMBNAIL}
                        disabled={!shouldDisplayReceipt}
                        disabledStyle={styles.cursorDefault}
                        style={styles.h100}
                    >
                        <PDFThumbnail
                            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                            previewSourceURL={resolvedReceiptImage as string}
                            style={styles.h100}
                            onLoadError={onPDFLoadError}
                            onPassword={onPDFPassword}
                        />
                    </PressableWithoutFocus>
                ) : (
                    <PressableWithoutFocus
                        onPress={() => {
                            if (!transactionID) {
                                return;
                            }

                            Navigation.navigate(
                                isReceiptEditable
                                    ? ROUTES.MONEY_REQUEST_RECEIPT_PREVIEW.getRoute(reportID, transactionID, action, iouType)
                                    : ROUTES.TRANSACTION_RECEIPT.getRoute(reportID, transactionID),
                            );
                        }}
                        disabled={!shouldDisplayReceipt || isThumbnail}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.RECEIPT_THUMBNAIL}
                        disabledStyle={styles.cursorDefault}
                        style={receiptThumbnailStyle}
                    >
                        <ReceiptImage
                            isThumbnail={isThumbnail}
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            source={resolvedThumbnail || resolvedReceiptImage || ''}
                            // AuthToken is required when retrieving the image from the server
                            // but we don't need it to load the blob:// or file:// image when starting an expense/split
                            // So if we have a thumbnail, it means we're retrieving the image from the server
                            isAuthTokenRequired={!!receiptThumbnail && !isLocalFile}
                            fileExtension={fileExtension}
                            shouldUseThumbnailImage
                            shouldUseInitialObjectPosition={isDistanceRequest}
                            shouldUseFullHeight={isCompactMode}
                            onLoad={handleReceiptLoad}
                        />
                    </PressableWithoutFocus>
                )}
            </View>
        );
    }, [
        isCompactMode,
        compactReceiptContainerStyle,
        styles.expenseViewImageSmall,
        styles.moneyRequestImage,
        styles.flex1,
        styles.h100,
        styles.cursorDefault,
        isLocalFile,
        receiptFilename,
        transactionID,
        isReceiptEditable,
        reportID,
        action,
        iouType,
        translate,
        shouldDisplayReceipt,
        resolvedReceiptImage,
        onPDFLoadError,
        onPDFPassword,
        isThumbnail,
        resolvedThumbnail,
        receiptThumbnail,
        fileExtension,
        isDistanceRequest,
        handleReceiptLoad,
        handleCompactReceiptContainerLayout,
    ]);

    const visibleFields = fields.filter((field) => field.shouldShow);
    const fieldsAboveShowMore = visibleFields.filter((field) => field.shouldShowAboveShowMore ?? false);
    const fieldsBelowShowMore = visibleFields.filter((field) => !(field.shouldShowAboveShowMore ?? false));

    return (
        <View style={isCompactMode ? styles.flex1 : undefined}>
            <View>
                {isTypeInvoice && (
                    <MenuItem
                        key={translate('workspace.invoices.sendFrom')}
                        avatarID={senderWorkspace?.id}
                        shouldShowRightIcon={!isReadOnly && canUpdateSenderWorkspace}
                        title={senderWorkspace?.name}
                        icon={senderWorkspace?.avatarURL ? senderWorkspace?.avatarURL : getDefaultWorkspaceAvatar(senderWorkspace?.name)}
                        iconType={CONST.ICON_TYPE_WORKSPACE}
                        description={translate('workspace.common.workspace')}
                        label={translate('workspace.invoices.sendFrom')}
                        isLabelHoverable={false}
                        interactive={!isReadOnly && canUpdateSenderWorkspace}
                        onPress={() => {
                            if (!transaction?.transactionID) {
                                return;
                            }
                            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SEND_FROM.getRoute(iouType, transaction?.transactionID, reportID, Navigation.getActiveRoute()));
                        }}
                        style={styles.moneyRequestMenuItem}
                        labelStyle={styles.mt2}
                        titleStyle={styles.flex1}
                        disabled={didConfirm}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.SEND_FROM_FIELD}
                    />
                )}
                {shouldShowMap && (
                    <View style={styles.confirmationListMapItem}>
                        <ConfirmedRoute transaction={transaction ?? ({} as OnyxTypes.Transaction)} />
                    </View>
                )}
                {isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT && (
                    <>
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={getDestinationForDisplay(perDiemCustomUnit, transaction)}
                            description={translate('common.destination')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!transactionID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DESTINATION_EDIT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute()));
                            }}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DESTINATION_FIELD}
                        />
                        <View style={styles.dividerLine} />
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={getTimeForDisplay(transaction)}
                            description={translate('iou.time')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (!transactionID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TIME_EDIT.getRoute(action, iouType, transactionID, reportID));
                            }}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            numberOfLinesTitle={2}
                            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TIME_FIELD}
                        />
                        <View style={[styles.flexRow, styles.gap1, styles.justifyContentStart, styles.mh3, styles.flexWrap, styles.pt1]}>{badgeElements}</View>
                        <View style={styles.dividerLine} />
                        {subRateFields}
                        <View style={styles.dividerLine} />
                    </>
                )}
            </View>
            {(!shouldShowMap || isManualDistanceRequest || isOdometerDistanceRequest) &&
                (hasReceiptImageOrThumbnail
                    ? receiptThumbnailContent
                    : showReceiptEmptyState && (
                          <ReceiptEmptyState
                              onPress={() => {
                                  if (!transactionID) {
                                      return;
                                  }

                                  Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation.getActiveRoute()));
                              }}
                              style={[isCompactMode ? undefined : styles.mv3, isCompactMode && compactReceiptStyle ? compactReceiptStyle : styles.moneyRequestViewImage]}
                          />
                      ))}
            <View style={[styles.mb5, styles.mt2]}>
                {isCompactMode && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.pl5, styles.gap2, styles.mb2, styles.pr10]}>
                        <Icon
                            src={icons.Sparkles}
                            fill={theme.icon}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                        <Text style={styles.rightLabelMenuItem}>{translate('iou.automaticallyEnterExpenseDetails')}</Text>
                    </View>
                )}

                {isCompactMode ? fieldsAboveShowMore.map((field) => field.item) : visibleFields.map((field) => field.item)}

                {isCompactMode && fieldsBelowShowMore.length > 0 && (
                    <View style={[styles.mt3, styles.alignItemsCenter, styles.pRelative, styles.mh5]}>
                        <View style={[styles.dividerLine, styles.pAbsolute, styles.w100, styles.justifyContentCenter, {transform: [{translateY: -0.5}]}]} />
                        <Button
                            text={translate('common.showMore')}
                            onPress={() => setShowMoreFields(true)}
                            small
                            shouldShowRightIcon
                            iconRight={icons.DownArrow}
                            innerStyles={[styles.hoveredComponentBG, styles.ph4, styles.pv2]}
                            textStyles={styles.buttonSmallText}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

export default memo(
    MoneyRequestConfirmationListFooter,
    (prevProps, nextProps) =>
        prevProps.action === nextProps.action &&
        prevProps.currency === nextProps.currency &&
        prevProps.didConfirm === nextProps.didConfirm &&
        prevProps.distance === nextProps.distance &&
        prevProps.formattedAmount === nextProps.formattedAmount &&
        prevProps.formError === nextProps.formError &&
        prevProps.hasRoute === nextProps.hasRoute &&
        prevProps.iouCategory === nextProps.iouCategory &&
        prevProps.iouComment === nextProps.iouComment &&
        prevProps.iouCreated === nextProps.iouCreated &&
        prevProps.iouCurrencyCode === nextProps.iouCurrencyCode &&
        prevProps.iouIsBillable === nextProps.iouIsBillable &&
        prevProps.iouMerchant === nextProps.iouMerchant &&
        prevProps.iouType === nextProps.iouType &&
        prevProps.isCategoryRequired === nextProps.isCategoryRequired &&
        prevProps.isDistanceRequest === nextProps.isDistanceRequest &&
        prevProps.isMerchantEmpty === nextProps.isMerchantEmpty &&
        prevProps.isMerchantRequired === nextProps.isMerchantRequired &&
        prevProps.isPolicyExpenseChat === nextProps.isPolicyExpenseChat &&
        prevProps.isReadOnly === nextProps.isReadOnly &&
        prevProps.isTypeInvoice === nextProps.isTypeInvoice &&
        prevProps.onToggleBillable === nextProps.onToggleBillable &&
        prevProps.policy === nextProps.policy &&
        prevProps.policyTagLists === nextProps.policyTagLists &&
        prevProps.rate === nextProps.rate &&
        prevProps.receiptFilename === nextProps.receiptFilename &&
        prevProps.receiptPath === nextProps.receiptPath &&
        prevProps.reportActionID === nextProps.reportActionID &&
        prevProps.reportID === nextProps.reportID &&
        // eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- selectedParticipants is derived with .map() which creates new array references
        deepEqual(prevProps.selectedParticipants, nextProps.selectedParticipants) &&
        prevProps.shouldDisplayFieldError === nextProps.shouldDisplayFieldError &&
        prevProps.shouldDisplayReceipt === nextProps.shouldDisplayReceipt &&
        prevProps.shouldShowCategories === nextProps.shouldShowCategories &&
        prevProps.shouldShowMerchant === nextProps.shouldShowMerchant &&
        prevProps.shouldShowSmartScanFields === nextProps.shouldShowSmartScanFields &&
        prevProps.shouldShowTax === nextProps.shouldShowTax &&
        prevProps.transaction === nextProps.transaction &&
        prevProps.transactionID === nextProps.transactionID &&
        prevProps.unit === nextProps.unit &&
        prevProps.showMoreFields === nextProps.showMoreFields &&
        prevProps.isTimeRequest === nextProps.isTimeRequest &&
        prevProps.iouTimeCount === nextProps.iouTimeCount &&
        prevProps.iouTimeRate === nextProps.iouTimeRate,
);
