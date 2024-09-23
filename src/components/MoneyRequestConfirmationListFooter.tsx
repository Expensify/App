import {format} from 'date-fns';
import {Str} from 'expensify-common';
import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useMemo, useReducer} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import ConfirmedRoute from './ConfirmedRoute';
import MentionReportContext from './HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import MenuItem from './MenuItem';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import PDFThumbnail from './PDFThumbnail';
import PressableWithoutFocus from './Pressable/PressableWithoutFocus';
import ReceiptEmptyState from './ReceiptEmptyState';
import ReceiptImage from './ReceiptImage';
import ShowMoreButton from './ShowMoreButton';

type MoneyRequestConfirmationListFooterProps = {
    /** The action to perform */
    action: IOUAction;

    /** Flag indicating if P2P distance requests can be used */
    canUseP2PDistanceRequests: boolean | undefined;

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

    /** The type of the IOU */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Flag indicating if the category is required */
    isCategoryRequired: boolean;

    /** Flag indicating if it is a distance request */
    isDistanceRequest: boolean;

    /** Flag indicating if it is editing a split bill */
    isEditingSplitBill: boolean | undefined;

    /** Flag indicating if the merchant is empty */
    isMerchantEmpty: boolean;

    /** Flag indicating if the merchant is required */
    isMerchantRequired: boolean | undefined;

    /** Flag indicating if the transaction is moved from track expense */
    isMovingTransactionFromTrackExpense: boolean;

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
    receiptPath: string;

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

    /** Flag indicating if the tax should be shown */
    shouldShowTax: boolean;

    /** The transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The transaction ID */
    transactionID: string;

    /** The unit */
    unit: Unit | undefined;
};

function MoneyRequestConfirmationListFooter({
    action,
    canUseP2PDistanceRequests,
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
    isCategoryRequired,
    isDistanceRequest,
    isEditingSplitBill,
    isMerchantEmpty,
    isMerchantRequired,
    isMovingTransactionFromTrackExpense,
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
    shouldShowTax,
    transaction,
    transactionID,
    unit,
}: MoneyRequestConfirmationListFooterProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, toLocaleDigit} = useLocalize();
    const {isOffline} = useNetwork();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});

    // A flag and a toggler for showing the rest of the form fields
    const [shouldExpandFields, toggleShouldExpandFields] = useReducer((state) => !state, false);

    const shouldShowTags = useMemo(() => isPolicyExpenseChat && OptionsListUtils.hasEnabledTags(policyTagLists), [isPolicyExpenseChat, policyTagLists]);
    const isMultilevelTags = useMemo(() => PolicyUtils.isMultiLevelTags(policyTags), [policyTags]);
    const shouldShowAttendees = useMemo(() => TransactionUtils.shouldShowAttendees(iouType, policy), [iouType, policy]);

    const senderWorkspace = useMemo(() => {
        const senderWorkspaceParticipant = selectedParticipants.find((participant) => participant.isSender);
        return allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${senderWorkspaceParticipant?.policyID}`];
    }, [allPolicies, selectedParticipants]);

    const canUpdateSenderWorkspace = useMemo(() => {
        const isInvoiceRoomParticipant = selectedParticipants.some((participant) => participant.isInvoiceRoom);

        return PolicyUtils.canSendInvoice(allPolicies, currentUserLogin) && !!transaction?.isFromGlobalCreate && !isInvoiceRoomParticipant;
    }, [allPolicies, currentUserLogin, selectedParticipants, transaction?.isFromGlobalCreate]);

    const isTypeSend = iouType === CONST.IOU.TYPE.PAY;
    const taxRates = policy?.taxRates ?? null;
    // In Send Money and Split Bill with Scan flow, we don't allow the Merchant or Date to be edited. For distance requests, don't show the merchant as there's already another "Distance" menu item
    const shouldShowDate = (shouldShowSmartScanFields || isDistanceRequest) && !isTypeSend;
    // Determines whether the tax fields can be modified.
    // The tax fields can only be modified if the component is not in read-only mode
    // and it is not a distance request.
    const canModifyTaxFields = !isReadOnly && !isDistanceRequest;
    // A flag for showing the billable field
    const shouldShowBillable = policy?.disabledFields?.defaultBillable === false;
    // Do not hide fields in case of paying someone
    const shouldShowAllFields = !!isDistanceRequest || shouldExpandFields || !shouldShowSmartScanFields || isTypeSend || !!isEditingSplitBill;
    // Calculate the formatted tax amount based on the transaction's tax amount and the IOU currency code
    const taxAmount = TransactionUtils.getTaxAmount(transaction, false);
    const formattedTaxAmount = CurrencyUtils.convertToDisplayString(taxAmount, iouCurrencyCode);
    // Get the tax rate title based on the policy and transaction
    const taxRateTitle = TransactionUtils.getTaxName(policy, transaction);
    // Determine if the merchant error should be displayed
    const shouldDisplayMerchantError = isMerchantRequired && (shouldDisplayFieldError || formError === 'iou.error.invalidMerchant') && isMerchantEmpty;
    // The empty receipt component should only show for IOU Requests of a paid policy ("Team" or "Corporate")
    const shouldShowReceiptEmptyState = iouType === CONST.IOU.TYPE.SUBMIT && PolicyUtils.isPaidGroupPolicy(policy);
    const {
        image: receiptImage,
        thumbnail: receiptThumbnail,
        isThumbnail,
        fileExtension,
        isLocalFile,
    } = receiptPath && receiptFilename ? ReceiptUtils.getThumbnailAndImageURIs(transaction, receiptPath, receiptFilename) : ({} as ReceiptUtils.ThumbnailAndImageURI);
    const resolvedThumbnail = isLocalFile ? receiptThumbnail : tryResolveUrlFromApiRoot(receiptThumbnail ?? '');
    const resolvedReceiptImage = isLocalFile ? receiptImage : tryResolveUrlFromApiRoot(receiptImage ?? '');

    const mentionReportContextValue = useMemo(() => ({currentReportID: reportID}), [reportID]);

    // An intermediate structure that helps us classify the fields as "primary" and "supplementary".
    // The primary fields are always shown to the user, while an extra action is needed to reveal the supplementary ones.
    const classifiedFields = [
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('iou.amount')}
                    shouldShowRightIcon={!isReadOnly && !isDistanceRequest}
                    title={formattedAmount}
                    description={translate('iou.amount')}
                    interactive={!isReadOnly}
                    onPress={() => {
                        if (isDistanceRequest) {
                            return;
                        }

                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                    }}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm}
                    brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction) ? translate('common.error.enterAmount') : ''}
                />
            ),
            shouldShow: shouldShowSmartScanFields,
            isSupplementary: false,
        },
        {
            item: (
                <MentionReportContext.Provider
                    key={translate('common.description')}
                    value={mentionReportContextValue}
                >
                    <MenuItemWithTopDescription
                        key={translate('common.description')}
                        shouldShowRightIcon={!isReadOnly}
                        shouldParseTitle
                        excludedMarkdownRules={!policy ? ['reportMentions'] : []}
                        title={iouComment}
                        description={translate('common.description')}
                        onPress={() => {
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams(), reportActionID),
                            );
                        }}
                        style={[styles.moneyRequestMenuItem]}
                        titleStyle={styles.flex1}
                        disabled={didConfirm}
                        interactive={!isReadOnly}
                        numberOfLinesTitle={2}
                    />
                </MentionReportContext.Provider>
            ),
            shouldShow: true,
            isSupplementary: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.distance')}
                    shouldShowRightIcon={!isReadOnly && !isMovingTransactionFromTrackExpense}
                    title={isMerchantEmpty ? '' : iouMerchant}
                    description={translate('common.distance')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    // todo: handle edit for transaction while moving from track expense
                    interactive={!isReadOnly && !isMovingTransactionFromTrackExpense}
                />
            ),
            shouldShow: isDistanceRequest && !canUseP2PDistanceRequests,
            isSupplementary: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.distance')}
                    shouldShowRightIcon={!isReadOnly}
                    title={DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate)}
                    description={translate('common.distance')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                />
            ),
            shouldShow: isDistanceRequest && canUseP2PDistanceRequests,
            isSupplementary: false,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.rate')}
                    shouldShowRightIcon={!!rate && !isReadOnly && isPolicyExpenseChat}
                    title={DistanceRequestUtils.getRateForDisplay(unit, rate, currency, translate, toLocaleDigit, isOffline)}
                    description={translate('common.rate')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    interactive={!!rate && !isReadOnly && isPolicyExpenseChat}
                />
            ),
            shouldShow: isDistanceRequest && canUseP2PDistanceRequests,
            isSupplementary: false,
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
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    brickRoadIndicator={shouldDisplayMerchantError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayMerchantError ? translate('common.error.fieldRequired') : ''}
                    rightLabel={isMerchantRequired && !shouldDisplayMerchantError ? translate('common.required') : ''}
                    numberOfLinesTitle={2}
                />
            ),
            shouldShow: shouldShowMerchant,
            isSupplementary: !isMerchantRequired,
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
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams(), reportActionID));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    errorText={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction) ? translate('common.error.enterDate') : ''}
                />
            ),
            shouldShow: shouldShowDate,
            isSupplementary: true,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key={translate('common.category')}
                    shouldShowRightIcon={!isReadOnly}
                    title={iouCategory}
                    description={translate('common.category')}
                    numberOfLinesTitle={2}
                    onPress={() =>
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams(), reportActionID))
                    }
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    rightLabel={isCategoryRequired ? translate('common.required') : ''}
                />
            ),
            shouldShow: shouldShowCategories,
            isSupplementary: action === CONST.IOU.ACTION.CATEGORIZE ? false : !isCategoryRequired,
        },
        ...policyTagLists.map(({name, required, tags}, index) => {
            const isTagRequired = required ?? false;
            const shouldShow = shouldShowTags && (!isMultilevelTags || OptionsListUtils.hasEnabledOptions(tags));
            return {
                item: (
                    <MenuItemWithTopDescription
                        key={name}
                        shouldShowRightIcon={!isReadOnly}
                        title={TransactionUtils.getTagForDisplay(transaction, index)}
                        description={name}
                        numberOfLinesTitle={2}
                        onPress={() =>
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(action, iouType, index, transactionID, reportID, Navigation.getActiveRouteWithoutParams(), reportActionID),
                            )
                        }
                        style={[styles.moneyRequestMenuItem]}
                        disabled={didConfirm}
                        interactive={!isReadOnly}
                        rightLabel={isTagRequired ? translate('common.required') : ''}
                    />
                ),
                shouldShow,
                isSupplementary: !isTagRequired,
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
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    interactive={canModifyTaxFields}
                />
            ),
            shouldShow: shouldShowTax,
            isSupplementary: true,
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
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    disabled={didConfirm}
                    interactive={canModifyTaxFields}
                />
            ),
            shouldShow: shouldShowTax,
            isSupplementary: true,
        },
        {
            item: (
                <MenuItemWithTopDescription
                    key="attendees"
                    shouldShowRightIcon
                    title={iouAttendees?.map((item) => item?.displayName ?? item?.login).join(', ')}
                    description={`${translate('iou.attendees')} ${
                        iouAttendees?.length && iouAttendees.length > 1 ? `\u00B7 ${formattedAmountPerAttendee} ${translate('common.perPerson')}` : ''
                    }`}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_ATTENDEE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()))}
                    interactive
                    shouldRenderAsHTML
                />
            ),
            shouldShow: shouldShowAttendees,
            isSupplementary: true,
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
                        titleStyle={!iouIsBillable && {color: theme.textSupporting}}
                        wrapperStyle={styles.flex1}
                    />
                </View>
            ),
            shouldShow: shouldShowBillable,
            isSupplementary: true,
        },
    ];

    const primaryFields: React.JSX.Element[] = [];
    const supplementaryFields: React.JSX.Element[] = [];

    classifiedFields.forEach((field) => {
        if (field.shouldShow && !field.isSupplementary) {
            primaryFields.push(field.item);
        } else if (field.shouldShow && field.isSupplementary) {
            supplementaryFields.push(field.item);
        }
    });

    const receiptThumbnailContent = useMemo(
        () => (
            <View style={styles.moneyRequestImage}>
                {isLocalFile && Str.isPDF(receiptFilename) ? (
                    <PressableWithoutFocus
                        onPress={() => Navigation.navigate(ROUTES.TRANSACTION_RECEIPT.getRoute(reportID ?? '', transactionID ?? ''))}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        disabled={!shouldDisplayReceipt}
                        disabledStyle={styles.cursorDefault}
                    >
                        <PDFThumbnail
                            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                            previewSourceURL={resolvedReceiptImage as string}
                        />
                    </PressableWithoutFocus>
                ) : (
                    <PressableWithoutFocus
                        onPress={() => Navigation.navigate(ROUTES.TRANSACTION_RECEIPT.getRoute(reportID ?? '', transactionID ?? ''))}
                        disabled={!shouldDisplayReceipt || isThumbnail}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        disabledStyle={styles.cursorDefault}
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
                        />
                    </PressableWithoutFocus>
                )}
            </View>
        ),
        [
            styles.moneyRequestImage,
            styles.cursorDefault,
            isLocalFile,
            receiptFilename,
            translate,
            shouldDisplayReceipt,
            resolvedReceiptImage,
            isThumbnail,
            resolvedThumbnail,
            receiptThumbnail,
            fileExtension,
            isDistanceRequest,
            reportID,
            transactionID,
        ],
    );

    return (
        <>
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
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SEND_FROM.getRoute(iouType, transaction?.transactionID ?? '-1', reportID, Navigation.getActiveRouteWithoutParams()));
                    }}
                    style={styles.moneyRequestMenuItem}
                    labelStyle={styles.mt2}
                    titleStyle={styles.flex1}
                    disabled={didConfirm}
                />
            )}
            {isDistanceRequest && (
                <View style={styles.confirmationListMapItem}>
                    <ConfirmedRoute transaction={transaction ?? ({} as OnyxTypes.Transaction)} />
                </View>
            )}
            {!isDistanceRequest &&
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (receiptImage || receiptThumbnail
                    ? receiptThumbnailContent
                    : shouldShowReceiptEmptyState && (
                          <ReceiptEmptyState
                              onPress={() =>
                                  Navigation.navigate(
                                      ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()),
                                  )
                              }
                          />
                      ))}
            {primaryFields}
            {!shouldShowAllFields && (
                <ShowMoreButton
                    containerStyle={[styles.mt1, styles.mb2]}
                    onPress={toggleShouldExpandFields}
                />
            )}
            <View style={[styles.mb5]}>{shouldShowAllFields && supplementaryFields}</View>
        </>
    );
}

MoneyRequestConfirmationListFooter.displayName = 'MoneyRequestConfirmationListFooter';

export default memo(
    MoneyRequestConfirmationListFooter,
    (prevProps, nextProps) =>
        lodashIsEqual(prevProps.action, nextProps.action) &&
        prevProps.canUseP2PDistanceRequests === nextProps.canUseP2PDistanceRequests &&
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
        prevProps.isEditingSplitBill === nextProps.isEditingSplitBill &&
        prevProps.isMerchantEmpty === nextProps.isMerchantEmpty &&
        prevProps.isMerchantRequired === nextProps.isMerchantRequired &&
        prevProps.isMovingTransactionFromTrackExpense === nextProps.isMovingTransactionFromTrackExpense &&
        prevProps.isPolicyExpenseChat === nextProps.isPolicyExpenseChat &&
        prevProps.isReadOnly === nextProps.isReadOnly &&
        prevProps.isTypeInvoice === nextProps.isTypeInvoice &&
        prevProps.onToggleBillable === nextProps.onToggleBillable &&
        lodashIsEqual(prevProps.policy, nextProps.policy) &&
        lodashIsEqual(prevProps.policyTagLists, nextProps.policyTagLists) &&
        prevProps.rate === nextProps.rate &&
        prevProps.receiptFilename === nextProps.receiptFilename &&
        prevProps.receiptPath === nextProps.receiptPath &&
        prevProps.reportActionID === nextProps.reportActionID &&
        prevProps.reportID === nextProps.reportID &&
        lodashIsEqual(prevProps.selectedParticipants, nextProps.selectedParticipants) &&
        prevProps.shouldDisplayFieldError === nextProps.shouldDisplayFieldError &&
        prevProps.shouldDisplayReceipt === nextProps.shouldDisplayReceipt &&
        prevProps.shouldShowCategories === nextProps.shouldShowCategories &&
        prevProps.shouldShowMerchant === nextProps.shouldShowMerchant &&
        prevProps.shouldShowSmartScanFields === nextProps.shouldShowSmartScanFields &&
        prevProps.shouldShowTax === nextProps.shouldShowTax &&
        lodashIsEqual(prevProps.transaction, nextProps.transaction) &&
        prevProps.transactionID === nextProps.transactionID &&
        prevProps.unit === nextProps.unit,
);
