import {Str} from 'expensify-common';
import React, {memo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useLocalReceiptThumbnail from '@hooks/useLocalReceiptThumbnail';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {shouldShowReceiptEmptyState} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import type {ThumbnailAndImageURI} from '@libs/ReceiptUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getTagVisibility, hasEnabledTags} from '@libs/TagsOptionsListUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import {getCurrency, isFetchingWaypointsFromServer, isManagedCardTransaction, isScanRequest, shouldShowAttendees as shouldShowAttendeesTransactionUtils} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import ConfirmedRoute from './ConfirmedRoute';
import Icon from './Icon';
import AmountField from './MoneyRequestConfirmationList/sections/AmountField';
import AttendeeField from './MoneyRequestConfirmationList/sections/AttendeeField';
import CategoryField from './MoneyRequestConfirmationList/sections/CategoryField';
import DateField from './MoneyRequestConfirmationList/sections/DateField';
import DescriptionField from './MoneyRequestConfirmationList/sections/DescriptionField';
import DistanceField from './MoneyRequestConfirmationList/sections/DistanceField';
import InvoiceSenderField from './MoneyRequestConfirmationList/sections/InvoiceSenderField';
import MerchantField from './MoneyRequestConfirmationList/sections/MerchantField';
import PerDiemFields from './MoneyRequestConfirmationList/sections/PerDiemFields';
import RateField from './MoneyRequestConfirmationList/sections/RateField';
import ReportField from './MoneyRequestConfirmationList/sections/ReportField';
import TagFields from './MoneyRequestConfirmationList/sections/TagFields';
import TaxFields from './MoneyRequestConfirmationList/sections/TaxFields';
import TimeFields from './MoneyRequestConfirmationList/sections/TimeFields';
import ToggleFields from './MoneyRequestConfirmationList/sections/ToggleFields';
import getCompactReceiptDimensions from './MoneyRequestConfirmationListFooter/getCompactReceiptDimensions';
import getImageCompactModeStyle from './MoneyRequestConfirmationListFooter/getImageCompactModeStyle';
import getReceiptContainerCompactModeStyle from './MoneyRequestConfirmationListFooter/getReceiptContainerCompactModeStyle';
import PDFThumbnail from './PDFThumbnail';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import ReceiptEmptyState from './ReceiptEmptyState';
import ReceiptImage from './ReceiptImage';
import Text from './Text';

type MoneyRequestConfirmationListFooterProps = {
    /** The action to perform */
    action: IOUAction;

    /** The currency of the transaction */
    distanceRateCurrency: string;

    /** Flag indicating if the confirmation is done */
    didConfirm: boolean;

    /** The distance of the transaction */
    distance: number;

    /** The amount of the transaction */
    amount: number;

    /** The formatted amount of the transaction */
    formattedAmount: string;

    /** The formatted amount of the transaction per 1 attendee */
    formattedAmountPerAttendee: string;

    /** The error message for the form */
    formError: string;

    /** Flag indicating if there is a route */
    hasRoute: boolean;

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

    /** Whether the receipt is currently being stitched */
    isLoadingReceipt?: boolean;

    /** Flag indicating if it is a GPS distance request */
    isGPSDistanceRequest: boolean;

    /** Flag indicating if it is a per diem request */
    isPerDiemRequest: boolean;

    /** Flag indicating if it is a time request */
    isTimeRequest: boolean;

    /** Flag indicating if the merchant is required */
    isMerchantRequired: boolean | undefined;

    /** Flag indicating if it is a policy expense chat */
    isPolicyExpenseChat: boolean;

    /** Flag indicating if it is read-only */
    isReadOnly: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

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

    /** The name of the distance rate */
    distanceRateName: string | undefined;

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
    distanceRateCurrency,
    didConfirm,
    distance,
    amount,
    formattedAmount,
    formattedAmountPerAttendee,
    formError,
    hasRoute,
    iouType,
    isCategoryRequired,
    isDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest = false,
    isLoadingReceipt = false,
    isGPSDistanceRequest,
    isPerDiemRequest,
    isTimeRequest,
    isMerchantRequired,
    isPolicyExpenseChat,
    isReadOnly,
    isEditingSplitBill = false,
    isTypeInvoice,
    onToggleBillable,
    policy,
    policyTags,
    policyTagLists,
    rate,
    distanceRateName,
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
    onToggleReimbursable,
    isReceiptEditable = false,
    isDescriptionRequired = false,
    showMoreFields = false,
    setShowMoreFields = () => {},
}: MoneyRequestConfirmationListFooterProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles', 'DownArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const isInLandscapeMode = useIsInLandscapeMode();

    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);

    // Self-derived iou* values from transaction
    const iouCurrencyCode = getCurrency(transaction);
    const isScan = isScanRequest(transaction);

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;
    const shouldShowTags = (isPolicyExpenseChat || isUnreported || isCreatingTrackExpense) && hasEnabledTags(policyTagLists);
    const shouldShowAttendees = shouldShowAttendeesTransactionUtils(iouType, policy);

    const hasPendingWaypoints = transaction && isFetchingWaypointsFromServer(transaction);
    const hasErrors = !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields?.route) || !isEmptyObject(transaction?.errorFields?.waypoints);
    const shouldShowMap =
        isDistanceRequest && !isManualDistanceRequest && !isOdometerDistanceRequest && [hasErrors, hasPendingWaypoints, iouType !== CONST.IOU.TYPE.SPLIT, !isReadOnly].some(Boolean);
    const {policyForMovingExpensesID, policyForMovingExpenses, shouldSelectPolicy} = usePolicyForMovingExpenses();
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

    const shouldNavigateToUpgradePath = !policyForMovingExpensesID && !shouldSelectPolicy;
    const shouldShowTimeRequestFields = isTimeRequest && action === CONST.IOU.ACTION.CREATE;
    const tagVisibility = getTagVisibility({
        shouldShowTags,
        policy,
        policyTags,
        transaction,
    });

    const previousTagsVisibility = usePrevious(tagVisibility.map((v) => v.shouldShow)) ?? [];

    const showReceiptEmptyState = shouldShowReceiptEmptyState(iouType, action, policy, isPerDiemRequest);
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

    const {thumbnailUri} = useLocalReceiptThumbnail(resolvedReceiptImage as string, !!isLocalFile);

    // Capture the thumbnail source on first render (or when the underlying image changes) to
    // avoid a visible source swap (flash) when the thumbnail arrives late for local files.
    // We use the React-recommended "store information from previous renders" pattern (useState +
    // conditional setState during render) because React Compiler forbids reading refs during render
    // (react-hooks/refs). React handles this synchronously before painting, so there is no visible
    // double-render or layout thrash.
    const resolvedReceiptImageStr = resolvedReceiptImage != null ? String(resolvedReceiptImage) : undefined;
    const [initialLocalSource, setInitialLocalSource] = useState<{source: string | undefined; resolvedImage: string | undefined}>({source: undefined, resolvedImage: undefined});
    if (isLocalFile && (initialLocalSource.source === undefined || initialLocalSource.resolvedImage !== resolvedReceiptImageStr)) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        setInitialLocalSource({source: thumbnailUri || resolvedReceiptImageStr || '', resolvedImage: resolvedReceiptImageStr});
    }
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const effectiveReceiptSource = isLocalFile ? initialLocalSource.source || '' : resolvedThumbnail || resolvedReceiptImage || '';

    // Build the fields array using section components
    const fields: ConfirmationField[] = [
        {
            item: (
                <AmountField
                    key="amount"
                    action={action}
                    amount={amount}
                    formattedAmount={formattedAmount}
                    distanceRateCurrency={distanceRateCurrency}
                    iouCurrencyCode={iouCurrencyCode}
                    isDistanceRequest={isDistanceRequest}
                    isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    shouldShowTimeRequestFields={shouldShowTimeRequestFields}
                    shouldDisplayFieldError={shouldDisplayFieldError}
                    formError={formError}
                    transaction={transaction}
                    transactionID={transactionID}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    isEditingSplitBill={isEditingSplitBill}
                    policy={policy}
                />
            ),
            shouldShow: shouldShowSmartScanFields && shouldShowAmountField,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <DescriptionField
                    key="description"
                    isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    isDescriptionRequired={isDescriptionRequired}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    policy={policy}
                    transaction={transaction}
                    isEditingSplitBill={isEditingSplitBill}
                />
            ),
            shouldShow: true,
            shouldShowAboveShowMore: true,
        },
        {
            item: (
                <DistanceField
                    key="distance"
                    hasRoute={hasRoute}
                    distance={distance}
                    unit={unit}
                    rate={rate}
                    isManualDistanceRequest={isManualDistanceRequest}
                    isOdometerDistanceRequest={isOdometerDistanceRequest}
                    isGPSDistanceRequest={isGPSDistanceRequest}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                />
            ),
            shouldShow: isDistanceRequest,
            shouldShowAboveShowMore: true,
        },
        {
            item: (
                <RateField
                    key="rate"
                    distanceRateName={distanceRateName}
                    distanceRateCurrency={distanceRateCurrency}
                    unit={unit}
                    rate={rate}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    isPolicyExpenseChat={isPolicyExpenseChat}
                    policy={policy}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    formError={formError}
                    shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                    shouldSelectPolicy={shouldSelectPolicy}
                />
            ),
            shouldShow: isDistanceRequest,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <MerchantField
                    key="merchant"
                    isMerchantRequired={isMerchantRequired}
                    isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    shouldDisplayFieldError={shouldDisplayFieldError}
                    formError={formError}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    transaction={transaction}
                    isEditingSplitBill={isEditingSplitBill}
                />
            ),
            shouldShow: shouldShowMerchant,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <TimeFields
                    key="time"
                    transaction={transaction}
                    isReadOnly={isReadOnly}
                    didConfirm={didConfirm}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                />
            ),
            shouldShow: shouldShowTimeRequestFields,
        },
        {
            item: (
                <CategoryField
                    key="category"
                    isCategoryRequired={isCategoryRequired}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    policy={policy}
                    transaction={transaction}
                    formError={formError}
                    shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                    shouldSelectPolicy={shouldSelectPolicy}
                />
            ),
            shouldShow: shouldShowCategories,
            shouldShowAboveShowMore: isCategoryRequired,
        },
        {
            item: (
                <DateField
                    key="date"
                    shouldDisplayFieldError={shouldDisplayFieldError}
                    didConfirm={didConfirm}
                    isReadOnly={isReadOnly}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    transaction={transaction}
                />
            ),
            shouldShow: shouldShowDate,
            shouldShowAboveShowMore: false,
        },
        ...policyTagLists.map(({name}, index) => {
            const tagVisibilityItem = tagVisibility.at(index);
            const isTagRequired = tagVisibilityItem?.isTagRequired ?? false;
            const shouldShow = tagVisibilityItem?.shouldShow ?? false;
            return {
                item: (
                    <TagFields
                        key={`tag_${name}`}
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- index is guaranteed valid from the parent .map() iteration
                        policyTagList={policyTagLists.at(index)!}
                        isTagRequired={isTagRequired}
                        previousShouldShow={previousTagsVisibility.at(index) ?? false}
                        tagIndex={index}
                        transaction={transaction}
                        didConfirm={didConfirm}
                        isReadOnly={isReadOnly}
                        transactionID={transactionID}
                        action={action}
                        iouType={iouType}
                        reportID={reportID}
                        reportActionID={reportActionID}
                        formError={formError}
                    />
                ),
                shouldShow,
                shouldShowAboveShowMore: isTagRequired,
            };
        }),
        {
            item: (
                <TaxFields
                    key="tax"
                    policy={policy}
                    policyForMovingExpenses={policyForMovingExpenses}
                    transaction={transaction}
                    iouCurrencyCode={iouCurrencyCode}
                    canModifyTaxFields={canModifyTaxFields}
                    didConfirm={didConfirm}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    formError={formError}
                />
            ),
            shouldShow: shouldShowTax,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <AttendeeField
                    key="attendees"
                    formattedAmountPerAttendee={formattedAmountPerAttendee}
                    isReadOnly={isReadOnly}
                    transactionID={transactionID}
                    action={action}
                    iouType={iouType}
                    reportID={reportID}
                    formError={formError}
                    transaction={transaction}
                />
            ),
            shouldShow: shouldShowAttendees,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <ToggleFields
                    key="toggles"
                    isReadOnly={isReadOnly}
                    shouldShowReimbursable={shouldShowReimbursable}
                    shouldShowBillable={shouldShowBillable}
                    onToggleReimbursable={onToggleReimbursable}
                    onToggleBillable={onToggleBillable}
                    transaction={transaction}
                />
            ),
            shouldShow: shouldShowReimbursable || shouldShowBillable,
            isSupplementary: true,
            shouldShowAboveShowMore: false,
        },
        {
            item: (
                <ReportField
                    key="report"
                    selectedParticipants={selectedParticipants}
                    isPolicyExpenseChat={isPolicyExpenseChat}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    action={action}
                    transactionID={transactionID}
                    transaction={transaction}
                    isPerDiemRequest={isPerDiemRequest}
                />
            ),
            shouldShow: isPolicyExpenseChat,
            shouldShowAboveShowMore: false,
        },
    ];

    // Compact mode / receipt logic
    const isCompactMode = !showMoreFields && isScan && !isInLandscapeMode;
    const [receiptAspectRatio, setReceiptAspectRatio] = useState<number | null>(null);
    const [compactReceiptContainerWidth, setCompactReceiptContainerWidth] = useState(0);
    const hasEndedReceiptLoadSpan = useRef(false);
    const handleReceiptLoad = (event?: {nativeEvent: {width: number; height: number}}) => {
        if (!hasEndedReceiptLoadSpan.current) {
            hasEndedReceiptLoadSpan.current = true;
            endSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD);
        }
        const width = event?.nativeEvent.width ?? 0;
        const height = event?.nativeEvent.height ?? 0;
        if (!width || !height) {
            return;
        }

        const ratio = width / height;
        setReceiptAspectRatio((previousRatio) => (previousRatio === ratio ? previousRatio : ratio));
    };
    const handleCompactReceiptContainerLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        if (!width) {
            return;
        }
        setCompactReceiptContainerWidth((previousWidth) => (previousWidth === width ? previousWidth : width));
    };

    const hasReceiptImageOrThumbnail = !!(receiptImage ?? receiptThumbnail);
    const horizontalMargin = typeof styles.moneyRequestImage.marginHorizontal === 'number' ? styles.moneyRequestImage.marginHorizontal : 0;
    const {compactReceiptMaxWidth, compactReceiptMaxHeight} = getCompactReceiptDimensions({
        windowWidth,
        horizontalMargin,
        containerWidth: compactReceiptContainerWidth,
        aspectRatio: receiptAspectRatio,
    });

    const compactReceiptStyle = (() => {
        if (!isCompactMode) {
            return undefined;
        }

        const baseStyle = getImageCompactModeStyle(compactReceiptMaxWidth);

        return {
            ...baseStyle,
            maxHeight: compactReceiptMaxHeight,
        };
    })();
    const compactReceiptContainerStyle = (() => {
        if (!isCompactMode) {
            return undefined;
        }

        return getReceiptContainerCompactModeStyle(compactReceiptMaxWidth, compactReceiptMaxHeight);
    })();

    const receiptThumbnailContent = (() => {
        const receiptContainerStyle = isCompactMode && compactReceiptContainerStyle ? compactReceiptContainerStyle : styles.expenseViewImageSmall;
        const receiptThumbnailStyle = [styles.h100, styles.flex1];

        return (
            <View
                style={[styles.moneyRequestImage, receiptContainerStyle, isLoadingReceipt && [styles.justifyContentCenter, styles.alignItemsCenter]]}
                onLayout={isCompactMode ? handleCompactReceiptContainerLayout : undefined}
            >
                {isLoadingReceipt && <ActivityIndicator reasonAttributes={{context: 'MoneyRequestConfirmationListFooter.receiptThumbnail'}} />}
                {!isLoadingReceipt &&
                    (isLocalFile && Str.isPDF(receiptFilename) ? (
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
                                source={effectiveReceiptSource}
                                isAuthTokenRequired={!!receiptThumbnail && !isLocalFile}
                                fileExtension={fileExtension}
                                shouldUseThumbnailImage
                                shouldUseInitialObjectPosition={isDistanceRequest}
                                shouldUseFullHeight={isCompactMode}
                                onLoad={handleReceiptLoad}
                                resizeMode={isOdometerDistanceRequest ? 'contain' : undefined}
                            />
                        </PressableWithoutFocus>
                    ))}
            </View>
        );
    })();

    const visibleFields = fields.filter((field) => field.shouldShow);
    const fieldsAboveShowMore = visibleFields.filter((field) => field.shouldShowAboveShowMore ?? false);
    const fieldsBelowShowMore = visibleFields.filter((field) => !(field.shouldShowAboveShowMore ?? false));

    return (
        <View style={isCompactMode ? styles.flex1 : undefined}>
            <View>
                {isTypeInvoice && (
                    <InvoiceSenderField
                        selectedParticipants={selectedParticipants}
                        isReadOnly={isReadOnly}
                        didConfirm={didConfirm}
                        iouType={iouType}
                        reportID={reportID}
                        transaction={transaction}
                    />
                )}
                {shouldShowMap && (
                    <View style={styles.confirmationListMapItem}>
                        <ConfirmedRoute transaction={transaction ?? ({} as OnyxTypes.Transaction)} />
                    </View>
                )}
                {isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT && (
                    <PerDiemFields
                        perDiemCustomUnit={perDiemCustomUnit}
                        transaction={transaction}
                        isReadOnly={isReadOnly}
                        didConfirm={didConfirm}
                        transactionID={transactionID}
                        action={action}
                        iouType={iouType}
                        reportID={reportID}
                        shouldDisplayFieldError={shouldDisplayFieldError}
                        formError={formError}
                    />
                )}
            </View>
            {(!shouldShowMap || isManualDistanceRequest || isOdometerDistanceRequest) &&
                (hasReceiptImageOrThumbnail || isLoadingReceipt
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

export default memo(MoneyRequestConfirmationListFooter);
