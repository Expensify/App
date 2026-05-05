import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {MouseProvider} from '@hooks/useMouseContext';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {isCategoryDescriptionRequired} from '@libs/CategoryUtils';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {isTaxTrackingEnabled} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {
    getAttendees,
    getCategory,
    getCurrency,
    getMerchant,
    getRateID,
    hasValidModifiedAmount,
    isDistanceRequest as isDistanceRequestUtil,
    isGPSDistanceRequest as isGPSDistanceRequestUtil,
    isManualDistanceRequest as isManualDistanceRequestUtil,
} from '@libs/TransactionUtils';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import buildConfirmAction from './MoneyRequestConfirmationList/confirmAction';
import ConfirmationFooterContent from './MoneyRequestConfirmationList/ConfirmationFooterContent';
import ConfirmationTelemetry from './MoneyRequestConfirmationList/ConfirmationTelemetry';
import DistanceRequestController from './MoneyRequestConfirmationList/DistanceRequestController';
import FieldAutoSelector from './MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationAmount from './MoneyRequestConfirmationList/hooks/useConfirmationAmount';
import useConfirmationCtaText from './MoneyRequestConfirmationList/hooks/useConfirmationCtaText';
import useConfirmationSections from './MoneyRequestConfirmationList/hooks/useConfirmationSections';
import useConfirmationValidation from './MoneyRequestConfirmationList/hooks/useConfirmationValidation';
import useDistanceRequestState from './MoneyRequestConfirmationList/hooks/useDistanceRequestState';
import useFormErrorManagement from './MoneyRequestConfirmationList/hooks/useFormErrorManagement';
import usePolicyCategoriesForConfirmation from './MoneyRequestConfirmationList/hooks/usePolicyCategoriesForConfirmation';
import usePolicyTagsForConfirmation from './MoneyRequestConfirmationList/hooks/usePolicyTagsForConfirmation';
import useReceiptTraining from './MoneyRequestConfirmationList/hooks/useReceiptTraining';
import useSplitParticipants from './MoneyRequestConfirmationList/hooks/useSplitParticipants';
import useTaxAmount from './MoneyRequestConfirmationList/hooks/useTaxAmount';
import useTransactionReportForConfirmation from './MoneyRequestConfirmationList/hooks/useTransactionReportForConfirmation';
import SplitBillController from './MoneyRequestConfirmationList/SplitBillController';
import TaxController from './MoneyRequestConfirmationList/TaxController';
import MoneyRequestConfirmationListFooter from './MoneyRequestConfirmationListFooter';
import UserListItem from './SelectionList/ListItem/UserListItem';
import SelectionListWithSections from './SelectionList/SelectionListWithSections';

type MoneyRequestConfirmationListProps = {
    /** Callback to inform parent modal of success */
    onConfirm?: (selectedParticipants: Participant[]) => void;

    /** Callback to parent modal to pay someone */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;

    /** IOU type */
    iouType?: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Callback to toggle the billable state */
    onToggleBillable?: (isOn: boolean) => void;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipants: Participant[];

    /** Payee of the expense with login */
    payeePersonalDetails?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** Should the list be read only, and not editable? */
    isReadOnly?: boolean;

    /** Number of expenses to be created */
    expensesNumber?: number;

    /** The policyID of the request */
    policyID?: string;

    /** The reportID of the request */
    reportID?: string;

    /** File path of the receipt */
    receiptPath?: string | number;

    /** File name of the receipt */
    receiptFilename?: string;

    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the expense is an odometer distance expense */
    isOdometerDistanceRequest?: boolean;

    /** Whether the odometer receipt is currently being stitched */
    isLoadingReceipt?: boolean;

    /** Whether the expense is a per diem expense */
    isPerDiemRequest?: boolean;

    /** Whether the expense is a time expense */
    isTimeRequest?: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

    /** Whether we can navigate to receipt page */
    shouldDisplayReceipt?: boolean;

    /** Whether we should show the amount, date, and merchant fields. */
    shouldShowSmartScanFields?: boolean;

    /** A flag for verifying that the current report is a sub-report of a expense chat */
    isPolicyExpenseChat?: boolean;

    /** Whether smart scan failed */
    hasSmartScanFailed?: boolean;

    /** The ID of the report action */
    reportActionID?: string;

    /** The action to take */
    action?: IOUAction;

    /** Whether the expense is confirmed or not */
    isConfirmed?: boolean;

    /** Whether the expense is in the process of being confirmed */
    isConfirming?: boolean;

    /** Whether the receipt can be replaced */
    isReceiptEditable?: boolean;

    /** The PDF load error callback */
    onPDFLoadError?: () => void;

    /** The PDF password callback */
    onPDFPassword?: () => void;

    /** Function to toggle reimbursable */
    onToggleReimbursable?: (isOn: boolean) => void;

    /** Show remove expense confirmation modal */
    showRemoveExpenseConfirmModal?: () => void;

    /** When true, hide the "To:" section (e.g. when adding an expense directly to the current report) */
    shouldHideToSection?: boolean;
};

type MoneyRequestConfirmationListItem = (Participant & {keyForList: string}) | OptionData;

function MoneyRequestConfirmationList({
    transaction,
    onSendMoney,
    onConfirm,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isOdometerDistanceRequest = false,
    isLoadingReceipt = false,
    isPerDiemRequest = false,
    isPolicyExpenseChat = false,
    shouldShowSmartScanFields = true,
    isEditingSplitBill,
    isReceiptEditable,
    selectedParticipants: selectedParticipantsProp,
    payeePersonalDetails: payeePersonalDetailsProp,
    isReadOnly = false,
    policyID,
    reportID = '',
    receiptPath = '',
    receiptFilename = '',
    onToggleBillable,
    hasSmartScanFailed,
    reportActionID,
    action = CONST.IOU.ACTION.CREATE,
    shouldDisplayReceipt = false,
    expensesNumber = 0,
    isConfirmed,
    isConfirming,
    onPDFLoadError,
    onPDFPassword,
    onToggleReimbursable,
    showRemoveExpenseConfirmModal,
    isTimeRequest = false,
    shouldHideToSection = false,
}: MoneyRequestConfirmationListProps) {
    const policyCategories = usePolicyCategoriesForConfirmation(policyID);
    const {policyTags, policyTagLists} = usePolicyTagsForConfirmation(policyID);
    const transactionReport = useTransactionReportForConfirmation(transaction?.reportID);
    const {policyForMovingExpenses, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const isInLandscapeMode = useIsInLandscapeMode();

    const {isTestReceipt, shouldShowProductTrainingTooltip, renderProductTrainingTooltip} = useReceiptTraining({
        transaction,
    });

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const {policy} = usePolicyForTransaction({
        transaction,
        reportPolicyID: policyID,
        action,
        iouType,
        isPerDiemRequest,
    });

    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    const isDistanceRequest = isDistanceRequestUtil(transaction);
    const isManualDistanceRequest = isManualDistanceRequestUtil(transaction);
    const isGPSDistanceRequest = isGPSDistanceRequestUtil(transaction);

    const iouAmount = hasValidModifiedAmount(transaction) ? Number(transaction?.modifiedAmount) : (transaction?.amount ?? 0);
    const iouCurrencyCode = getCurrency(transaction);
    const iouMerchant = getMerchant(transaction);
    const iouCategory = getCategory(transaction);
    const iouAttendees = getAttendees(transaction, currentUserPersonalDetails);

    const isTypeRequest = iouType === CONST.IOU.TYPE.SUBMIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.PAY;
    const isTypeTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isTypeInvoice = iouType === CONST.IOU.TYPE.INVOICE;
    const isFromGlobalCreateAndCanEditParticipant = !!transaction?.isFromGlobalCreate && !isPerDiemRequest && !isTimeRequest;

    const transactionID = transaction?.transactionID;
    const previousTransactionCurrency = usePrevious(transaction?.currency);
    const customUnitRateID = getRateID(transaction);

    const subRates = transaction?.comment?.customUnit?.subRates ?? [];
    const prevSubRates = usePrevious(subRates);

    const {defaultRate, mileageRate, unit, rate, currency, prevCurrency, distance, shouldCalculateDistanceAmount, hasRoute, isDistanceRequestWithPendingRoute, distanceRequestAmount} =
        useDistanceRequestState({
            transaction,
            policy,
            policyID,
            policyForMovingExpenses,
            isMovingTransactionFromTrackExpense,
            isDistanceRequest,
            iouAmount,
            iouCurrencyCode,
        });

    // A flag for showing the categories field
    const shouldShowCategories = isTrackExpense
        ? !policy || shouldSelectPolicy || !!iouCategory || hasEnabledOptions(Object.values(policyCategories ?? {}))
        : (isPolicyExpenseChat || isTypeInvoice) && (!!iouCategory || hasEnabledOptions(Object.values(policyCategories ?? {})));

    const shouldShowMerchant = (shouldShowSmartScanFields || isTypeSend) && !isDistanceRequest && !isPerDiemRequest && (!isTimeRequest || action !== CONST.IOU.ACTION.CREATE);

    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat || isTrackExpense, policy, isDistanceRequest, isPerDiemRequest, isTimeRequest);

    const {defaultTaxCode, defaultTaxValue, shouldKeepCurrentTaxSelection, taxAmountInSmallestCurrencyUnits} = useTaxAmount({
        transaction,
        policy,
        policyForMovingExpenses,
        isDistanceRequest,
        isMovingTransactionFromTrackExpense,
        customUnitRateID,
        distance,
        previousTransactionCurrency,
    });

    const {amountToBeUsed, formattedAmount, formattedAmountPerAttendee, isScanRequest} = useConfirmationAmount({
        transaction,
        iouAmount,
        iouCurrencyCode,
        iouAttendees,
        isDistanceRequest,
        isDistanceRequestWithPendingRoute,
        shouldCalculateDistanceAmount,
        distanceRequestAmount,
        distanceCurrency: currency,
        isPerDiemRequest,
        prevCurrency,
        currency,
        prevSubRates,
    });

    const isFocused = useIsFocused();

    const [didConfirm, setDidConfirm] = useState(isConfirmed);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);
    const [showMoreFields, setShowMoreFields] = useState(false);

    useEffect(() => {
        setShowMoreFields(false);
    }, [transactionID]);

    const routeError = Object.values(transaction?.errorFields?.route ?? {}).at(0);
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const shouldShowReadOnlySplits = isPolicyExpenseChat || isReadOnly || isScanRequest;

    const {formError, setFormError, clearFormErrors, shouldDisplayFieldError, isMerchantEmpty, isMerchantRequired, errorMessage} = useFormErrorManagement({
        transaction,
        transactionReport,
        iouMerchant,
        iouCategory,
        iouAttendees,
        policy,
        policyTags,
        policyCategories,
        currentUserPersonalDetails,
        isEditingSplitBill,
        isPolicyExpenseChat,
        isScanRequest,
        shouldShowMerchant,
        hasSmartScanFailed,
        didConfirmSplit,
        routeError,
        isTypeSplit,
        shouldShowReadOnlySplits,
    });

    const isCategoryRequired = !!policy?.requiresCategory && !isTypeInvoice;

    const isDescriptionRequired = isCategoryDescriptionRequired(policyCategories, iouCategory, policy?.areRulesEnabled);

    // If completing a split expense fails, set didConfirm to false to allow the user to edit the fields again
    if (isEditingSplitBill && didConfirm) {
        setDidConfirm(false);
    }

    useEffect(() => {
        setDidConfirm(isConfirmed);
    }, [isConfirmed]);

    const splitOrRequestOptions = useConfirmationCtaText({
        expensesNumber,
        isTypeInvoice,
        isTypeTrackExpense,
        isTypeSplit,
        isTypeRequest,
        iouAmount,
        iouType,
        policy,
        formattedAmount,
        receiptPath,
        isDistanceRequestWithPendingRoute,
        isPerDiemRequest,
        isNewManualExpenseFlowEnabled,
    });

    const selectedParticipants = selectedParticipantsProp.filter((participant) => participant.selected);
    const payeePersonalDetails = payeePersonalDetailsProp ?? currentUserPersonalDetails;

    const {splitParticipants, getSplitSectionHeader} = useSplitParticipants({
        isTypeSplit,
        shouldShowReadOnlySplits,
        payeePersonalDetails,
        selectedParticipants,
        transaction,
        iouAmount,
        iouCurrencyCode,
    });

    const canEditParticipant = isFromGlobalCreateAndCanEditParticipant && !isTestReceipt && (!isRestrictedToPreferredPolicy || isTypeInvoice);

    const sections = useConfirmationSections({
        isTypeSplit,
        shouldHideToSection,
        canEditParticipant,
        payeePersonalDetails,
        splitParticipants,
        selectedParticipants,
        getSplitSectionHeader,
    });

    /**
     * Navigate to the participant step
     */
    const navigateToParticipantPage = () => {
        if (!canEditParticipant) {
            return;
        }

        const newIOUType = iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK ? CONST.IOU.TYPE.CREATE : iouType;
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(newIOUType, transactionID, transaction.reportID, Navigation.getActiveRoute(), action));
    };

    const {validate} = useConfirmationValidation({
        transaction,
        transactionReport,
        transactionID,
        iouType,
        iouAmount,
        iouMerchant,
        iouCategory,
        iouCurrencyCode,
        iouAttendees,
        policy,
        policyTags,
        policyTagLists,
        policyCategories,
        selectedParticipants,
        currentUserPersonalDetails,
        isEditingSplitBill,
        isMerchantRequired,
        isMerchantEmpty,
        shouldDisplayFieldError,
        shouldShowTax,
        isDistanceRequest,
        isDistanceRequestWithPendingRoute,
        isPerDiemRequest,
        isTimeRequest,
        isNewManualExpenseFlowEnabled,
        routeError,
    });

    const confirm = buildConfirmAction({
        iouType,
        policy,
        transactionID,
        reportID,
        routeError,
        formError,
        selectedParticipants,
        isDelegateAccessRestricted,
        validate,
        setFormError,
        setDidConfirmSplit,
        showDelegateNoAccessModal,
        onConfirm,
        onSendMoney,
    });

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => {
                    blurActiveElement();
                });
            }, CONST.ANIMATED_TRANSITION);
            return () => focusTimeoutRef.current && clearTimeout(focusTimeoutRef.current);
        }, []),
    );

    const isCompactMode = !showMoreFields && isScanRequest && !isInLandscapeMode;
    const selectionListStyle = {
        containerStyle: [styles.flexBasisAuto],
        contentContainerStyle: isCompactMode ? [styles.flexGrow1] : undefined,
        listFooterContentStyle: isCompactMode ? [styles.flex1, styles.mv3] : [styles.mv3],
    };

    const footerContent = isReadOnly ? undefined : (
        <ConfirmationFooterContent
            iouType={iouType}
            confirm={confirm}
            iouCurrencyCode={iouCurrencyCode}
            policyID={policyID}
            reportID={reportID}
            isConfirmed={isConfirmed}
            isConfirming={isConfirming}
            isLoadingReceipt={isLoadingReceipt}
            splitOrRequestOptions={splitOrRequestOptions}
            errorMessage={errorMessage}
            expensesNumber={expensesNumber}
            showRemoveExpenseConfirmModal={showRemoveExpenseConfirmModal}
            shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip}
            renderProductTrainingTooltip={renderProductTrainingTooltip}
        />
    );

    const listFooterContent = (
        <View style={isCompactMode ? styles.flex1 : undefined}>
            <MoneyRequestConfirmationListFooter
                action={action}
                distanceRateCurrency={currency}
                didConfirm={!!didConfirm}
                distance={distance}
                amount={amountToBeUsed}
                formattedAmount={formattedAmount}
                formattedAmountPerAttendee={formattedAmountPerAttendee}
                formError={formError}
                hasRoute={hasRoute}
                iouType={iouType}
                isCategoryRequired={isCategoryRequired}
                isDistanceRequest={isDistanceRequest}
                isManualDistanceRequest={isManualDistanceRequest}
                isOdometerDistanceRequest={isOdometerDistanceRequest}
                isLoadingReceipt={isLoadingReceipt}
                isGPSDistanceRequest={isGPSDistanceRequest}
                isPerDiemRequest={isPerDiemRequest}
                isTimeRequest={isTimeRequest}
                isMerchantRequired={isMerchantRequired}
                isPolicyExpenseChat={isPolicyExpenseChat}
                isReadOnly={isReadOnly}
                isEditingSplitBill={isEditingSplitBill}
                isTypeInvoice={isTypeInvoice}
                onToggleBillable={onToggleBillable}
                policy={policy}
                policyTags={policyTags}
                policyTagLists={policyTagLists}
                rate={rate}
                distanceRateName={mileageRate.name}
                receiptFilename={receiptFilename}
                receiptPath={receiptPath}
                reportActionID={reportActionID}
                reportID={reportID}
                selectedParticipants={selectedParticipantsProp}
                shouldDisplayFieldError={shouldDisplayFieldError}
                shouldDisplayReceipt={shouldDisplayReceipt}
                shouldShowCategories={shouldShowCategories}
                shouldShowMerchant={shouldShowMerchant}
                shouldShowSmartScanFields={shouldShowSmartScanFields}
                shouldShowAmountField={!isPerDiemRequest}
                shouldShowTax={shouldShowTax}
                transaction={transaction}
                transactionID={transactionID}
                unit={unit}
                onPDFLoadError={onPDFLoadError}
                onPDFPassword={onPDFPassword}
                onToggleReimbursable={onToggleReimbursable}
                isReceiptEditable={isReceiptEditable}
                isDescriptionRequired={isDescriptionRequired}
                showMoreFields={showMoreFields}
                setShowMoreFields={setShowMoreFields}
            />
        </View>
    );

    return (
        <>
            <ConfirmationTelemetry transactionID={transactionID} />
            <TaxController
                transactionID={transactionID}
                policyID={policyID}
                isReadOnly={isReadOnly}
                shouldShowTax={shouldShowTax}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                defaultTaxCode={defaultTaxCode}
                defaultTaxValue={defaultTaxValue}
                shouldKeepCurrentTaxSelection={shouldKeepCurrentTaxSelection}
                taxAmountInSmallestCurrencyUnits={taxAmountInSmallestCurrencyUnits}
                transactionTaxAmount={transaction?.taxAmount}
            />
            <DistanceRequestController
                transactionID={transactionID}
                transaction={transaction}
                isDistanceRequest={isDistanceRequest}
                isManualDistanceRequest={isManualDistanceRequest}
                isPolicyExpenseChat={isPolicyExpenseChat}
                customUnitRateID={customUnitRateID}
                mileageRate={mileageRate}
                distance={distance}
                unit={unit}
                rate={rate}
                currency={currency}
                policy={policy}
                isReadOnly={isReadOnly}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                isTypeSplit={isTypeSplit}
                selectedParticipants={selectedParticipants}
                selectedParticipantsProp={selectedParticipantsProp}
                defaultMileageRateCustomUnitRateID={defaultRate}
                hasRoute={hasRoute}
                isDistanceRequestWithPendingRoute={isDistanceRequestWithPendingRoute}
                shouldCalculateDistanceAmount={shouldCalculateDistanceAmount}
                distanceRequestAmount={distanceRequestAmount}
                setFormError={setFormError}
                clearFormErrors={clearFormErrors}
            />
            <SplitBillController
                transaction={transaction}
                isTypeSplit={isTypeSplit}
                iouAmount={iouAmount}
                iouCurrencyCode={iouCurrencyCode}
                currentUserAccountID={currentUserPersonalDetails.accountID}
                isFocused={isFocused}
                onFormError={setFormError}
            />
            <FieldAutoSelector
                transactionID={transactionID}
                transaction={transaction}
                policyCategories={policyCategories}
                policyTagLists={policyTagLists}
                policyTags={policyTags}
                policy={policy}
                shouldShowCategories={shouldShowCategories}
                isCategoryRequired={isCategoryRequired}
                iouCategory={iouCategory}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
            />
            <MouseProvider>
                <SelectionListWithSections<MoneyRequestConfirmationListItem>
                    sections={sections}
                    ListItem={UserListItem}
                    onSelectRow={navigateToParticipantPage}
                    shouldSingleExecuteRowSelect
                    shouldPreventDefaultFocusOnSelectRow
                    shouldShowListEmptyContent={false}
                    footerContent={footerContent}
                    listFooterContent={listFooterContent}
                    style={selectionListStyle}
                    disableKeyboardShortcuts
                />
            </MouseProvider>
        </>
    );
}

export default MoneyRequestConfirmationList;
