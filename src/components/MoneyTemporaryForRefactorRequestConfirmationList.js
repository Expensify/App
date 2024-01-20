import {useIsFocused} from '@react-navigation/native';
import {format} from 'date-fns';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Log from '@libs/Log';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import categoryPropTypes from './categoryPropTypes';
import ConfirmedRoute from './ConfirmedRoute';
import FormHelpMessage from './FormHelpMessage';
import * as Expensicons from './Icon/Expensicons';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import optionPropTypes from './optionPropTypes';
import OptionsSelector from './OptionsSelector';
import ReceiptImage from './ReceiptImage';
import SettlementButton from './SettlementButton';
import Switch from './Switch';
import tagPropTypes from './tagPropTypes';
import taxPropTypes from './taxPropTypes';
import Text from './Text';
import transactionPropTypes from './transactionPropTypes';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from './withCurrentUserPersonalDetails';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func,

    /** Callback to parent modal to send money */
    onSendMoney: PropTypes.func,

    /** Callback to inform a participant is selected */
    onSelectParticipant: PropTypes.func,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.number.isRequired,

    /** IOU comment */
    iouComment: PropTypes.string,

    /** IOU currency */
    iouCurrencyCode: PropTypes.string,

    /** IOU type */
    iouType: PropTypes.string,

    /** IOU date */
    iouCreated: PropTypes.string,

    /** IOU merchant */
    iouMerchant: PropTypes.string,

    /** IOU category */
    iouCategory: PropTypes.string,

    /** IOU tag */
    iouTag: PropTypes.string,

    /** IOU isBillable */
    iouIsBillable: PropTypes.bool,

    /** Callback to toggle the billable state */
    onToggleBillable: PropTypes.func,

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipants: PropTypes.arrayOf(optionPropTypes).isRequired,

    /** Payee of the money request with login */
    payeePersonalDetails: optionPropTypes,

    /** Can the participants be modified or not */
    canModifyParticipants: PropTypes.bool,

    /** Should the list be read only, and not editable? */
    isReadOnly: PropTypes.bool,

    /** Whether the money request is a scan request */
    isScanRequest: PropTypes.bool,

    /** Depending on expense report or personal IOU report, respective bank account route */
    bankAccountRoute: PropTypes.string,

    ...withCurrentUserPersonalDetailsPropTypes,

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** The policyID of the request */
    policyID: PropTypes.string,

    /** The reportID of the request */
    reportID: PropTypes.string,

    /** File path of the receipt */
    receiptPath: PropTypes.string,

    /** File name of the receipt */
    receiptFilename: PropTypes.string,

    /** List styles for OptionsSelector */
    listStyles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** ID of the transaction that represents the money request */
    transactionID: PropTypes.string,

    /** Unit and rate used for if the money request is a distance request */
    mileageRate: PropTypes.shape({
        /** Unit used to represent distance */
        unit: PropTypes.oneOf([CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]),

        /** Rate used to calculate the distance request amount */
        rate: PropTypes.number,

        /** The currency of the rate */
        currency: PropTypes.string,
    }),

    /** Whether the money request is a distance request */
    isDistanceRequest: PropTypes.bool,

    /** Whether we're editing a split bill */
    isEditingSplitBill: PropTypes.bool,

    /** Whether we should show the amount, date, and merchant fields. */
    shouldShowSmartScanFields: PropTypes.bool,

    /** A flag for verifying that the current report is a sub-report of a workspace chat */
    isPolicyExpenseChat: PropTypes.bool,

    /* Onyx Props */
    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),

    /** Collection of tags attached to a policy */
    policyTags: tagPropTypes,

    /* Onyx Props */
    /** Collection of tax rates attached to a policy */
    policyTaxRates: taxPropTypes,

    /** Transaction that represents the money request */
    transaction: transactionPropTypes,
};

const defaultProps = {
    onConfirm: () => {},
    onSendMoney: () => {},
    onSelectParticipant: () => {},
    iouType: CONST.IOU.TYPE.REQUEST,
    iouCategory: '',
    iouTag: '',
    iouIsBillable: false,
    onToggleBillable: () => {},
    payeePersonalDetails: null,
    canModifyParticipants: false,
    isReadOnly: false,
    bankAccountRoute: '',
    session: {
        email: null,
    },
    policyID: '',
    reportID: '',
    ...withCurrentUserPersonalDetailsDefaultProps,
    receiptPath: '',
    receiptFilename: '',
    listStyles: [],
    policyCategories: {},
    policyTags: {},
    transactionID: '',
    transaction: {},
    mileageRate: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rate: 0, currency: 'USD'},
    isDistanceRequest: false,
    shouldShowSmartScanFields: true,
    isPolicyExpenseChat: false,
    policyTaxRates: {},
};

function MoneyTemporaryForRefactorRequestConfirmationList({
    bankAccountRoute,
    canModifyParticipants,
    currentUserPersonalDetails,
    hasMultipleParticipants,
    hasSmartScanFailed,
    iouAmount,
    iouCategory,
    iouComment,
    iouCreated,
    iouCurrencyCode,
    iouIsBillable,
    iouMerchant,
    iouTag,
    iouType,
    isDistanceRequest,
    isEditingSplitBill,
    isPolicyExpenseChat,
    isReadOnly,
    isScanRequest,
    listStyles,
    mileageRate,
    onConfirm,
    onSelectParticipant,
    onSendMoney,
    onToggleBillable,
    payeePersonalDetails,
    policy,
    policyCategories,
    policyID,
    policyTags,
    receiptFilename,
    receiptPath,
    reportActionID,
    reportID,
    selectedParticipants: pickedParticipants,
    session: {accountID},
    shouldShowSmartScanFields,
    transaction,
    policyTaxRates,
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const {canUseViolations} = usePermissions();

    const isTypeRequest = iouType === CONST.IOU.TYPE.REQUEST;
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.SEND;

    const {unit, rate, currency} = mileageRate;
    const distance = lodashGet(transaction, 'routes.route0.distance', 0);
    const shouldCalculateDistanceAmount = isDistanceRequest && iouAmount === 0;

    // A flag for showing the categories field
    const shouldShowCategories = isPolicyExpenseChat && (iouCategory || OptionsListUtils.hasEnabledOptions(_.values(policyCategories)));

    // A flag and a toggler for showing the rest of the form fields
    const [shouldExpandFields, toggleShouldExpandFields] = useReducer((state) => !state, false);

    // Do not hide fields in case of send money request
    const shouldShowAllFields = isDistanceRequest || shouldExpandFields || !shouldShowSmartScanFields || isTypeSend || isEditingSplitBill;

    const shouldShowDate = shouldShowSmartScanFields || isDistanceRequest;
    const shouldShowMerchant = shouldShowSmartScanFields && !isDistanceRequest;

    // Fetches the first tag list of the policy
    const policyTag = PolicyUtils.getTag(policyTags);
    const policyTagList = lodashGet(policyTag, 'tags', {});
    const policyTagListName = lodashGet(policyTag, 'name', translate('common.tag'));

    // A flag for showing the tags field
    const shouldShowTags = isPolicyExpenseChat && OptionsListUtils.hasEnabledOptions(_.values(policyTagList));

    // A flag for showing tax rate
    const shouldShowTax = isPolicyExpenseChat && policy && policy.isTaxTrackingEnabled;

    // A flag for showing the billable field
    const shouldShowBillable = !lodashGet(policy, 'disabledFields.defaultBillable', true);

    const hasRoute = TransactionUtils.hasRoute(transaction);
    const isDistanceRequestWithoutRoute = isDistanceRequest && !hasRoute;
    const formattedAmount = isDistanceRequestWithoutRoute
        ? translate('common.tbd')
        : CurrencyUtils.convertToDisplayString(
              shouldCalculateDistanceAmount ? DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate) : iouAmount,
              isDistanceRequest ? currency : iouCurrencyCode,
          );
    const formattedTaxAmount = CurrencyUtils.convertToDisplayString(transaction.taxAmount, iouCurrencyCode);

    const defaultTaxKey = policyTaxRates.defaultExternalID;
    const defaultTaxName = (defaultTaxKey && `${policyTaxRates.taxes[defaultTaxKey].name} (${policyTaxRates.taxes[defaultTaxKey].value}) • ${translate('common.default')}`) || '';
    const taxRateTitle = (transaction.taxRate && transaction.taxRate.text) || defaultTaxName;

    const isFocused = useIsFocused();
    const [formError, setFormError] = useState('');

    const [didConfirm, setDidConfirm] = useState(false);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);

    const [merchantError, setMerchantError] = useState(false);

    const shouldDisplayFieldError = useMemo(() => {
        if (!isEditingSplitBill) {
            return false;
        }

        return (hasSmartScanFailed && TransactionUtils.hasMissingSmartscanFields(transaction)) || (didConfirmSplit && TransactionUtils.areRequiredFieldsEmpty(transaction));
    }, [isEditingSplitBill, hasSmartScanFailed, transaction, didConfirmSplit]);

    const isMerchantEmpty = !iouMerchant || iouMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    const isMerchantRequired = isPolicyExpenseChat && !isScanRequest && shouldShowMerchant;

    useEffect(() => {
        if ((!isMerchantRequired && isMerchantEmpty) || !merchantError) {
            return;
        }
        if (!isMerchantEmpty && merchantError) {
            setMerchantError(false);
            if (formError === 'iou.error.invalidMerchant') {
                setFormError('');
            }
        }
    }, [formError, isMerchantEmpty, merchantError, isMerchantRequired]);

    useEffect(() => {
        if (shouldDisplayFieldError && hasSmartScanFailed) {
            setFormError('iou.receiptScanningFailed');
            return;
        }
        if (shouldDisplayFieldError && didConfirmSplit) {
            setFormError('iou.error.genericSmartscanFailureMessage');
            return;
        }
        if (merchantError) {
            setFormError('iou.error.invalidMerchant');
            return;
        }
        // reset the form error whenever the screen gains or loses focus
        setFormError('');
    }, [isFocused, transaction, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit, isMerchantRequired, merchantError]);

    useEffect(() => {
        if (!shouldCalculateDistanceAmount) {
            return;
        }

        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate);
        IOU.setMoneyRequestAmount_temporaryForRefactor(transaction.transactionID, amount, currency);
    }, [shouldCalculateDistanceAmount, distance, rate, unit, transaction, currency]);

    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    const getParticipantsWithAmount = useCallback(
        (participantsList) => {
            const amount = IOUUtils.calculateAmount(participantsList.length, iouAmount, iouCurrencyCode);
            return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(participantsList, amount > 0 ? CurrencyUtils.convertToDisplayString(amount, iouCurrencyCode) : '');
        },
        [iouAmount, iouCurrencyCode],
    );

    // If completing a split bill fails, set didConfirm to false to allow the user to edit the fields again
    if (isEditingSplitBill && didConfirm) {
        setDidConfirm(false);
    }

    const splitOrRequestOptions = useMemo(() => {
        let text;
        if (isTypeSplit && iouAmount === 0) {
            text = translate('iou.split');
        } else if ((receiptPath && isTypeRequest) || isDistanceRequestWithoutRoute) {
            text = translate('iou.request');
            if (iouAmount !== 0) {
                text = translate('iou.requestAmount', {amount: formattedAmount});
            }
        } else {
            const translationKey = isTypeSplit ? 'iou.splitAmount' : 'iou.requestAmount';
            text = translate(translationKey, {amount: formattedAmount});
        }
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: iouType,
            },
        ];
    }, [isTypeSplit, isTypeRequest, iouType, iouAmount, receiptPath, formattedAmount, isDistanceRequestWithoutRoute, translate]);

    const selectedParticipants = useMemo(() => _.filter(pickedParticipants, (participant) => participant.selected), [pickedParticipants]);
    const personalDetailsOfPayee = useMemo(() => payeePersonalDetails || currentUserPersonalDetails, [payeePersonalDetails, currentUserPersonalDetails]);
    const userCanModifyParticipants = useRef(!isReadOnly && canModifyParticipants && hasMultipleParticipants);
    useEffect(() => {
        userCanModifyParticipants.current = !isReadOnly && canModifyParticipants && hasMultipleParticipants;
    }, [isReadOnly, canModifyParticipants, hasMultipleParticipants]);
    const shouldDisablePaidBySection = userCanModifyParticipants.current;

    const optionSelectorSections = useMemo(() => {
        const sections = [];
        const unselectedParticipants = _.filter(pickedParticipants, (participant) => !participant.selected);
        if (hasMultipleParticipants) {
            const formattedSelectedParticipants = getParticipantsWithAmount(selectedParticipants);
            let formattedParticipantsList = _.union(formattedSelectedParticipants, unselectedParticipants);

            if (!userCanModifyParticipants.current) {
                formattedParticipantsList = _.map(formattedParticipantsList, (participant) => ({
                    ...participant,
                    isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID),
                }));
            }

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipants.length, iouAmount, iouCurrencyCode, true);
            const formattedPayeeOption = OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(
                personalDetailsOfPayee,
                iouAmount > 0 ? CurrencyUtils.convertToDisplayString(myIOUAmount, iouCurrencyCode) : '',
            );

            sections.push(
                {
                    title: translate('moneyRequestConfirmationList.paidBy'),
                    data: [formattedPayeeOption],
                    shouldShow: true,
                    indexOffset: 0,
                    isDisabled: shouldDisablePaidBySection,
                },
                {
                    title: translate('moneyRequestConfirmationList.splitWith'),
                    data: formattedParticipantsList,
                    shouldShow: true,
                    indexOffset: 1,
                },
            );
        } else {
            const formattedSelectedParticipants = _.map(selectedParticipants, (participant) => ({
                ...participant,
                isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID),
            }));
            sections.push({
                title: translate('common.to'),
                data: formattedSelectedParticipants,
                shouldShow: true,
                indexOffset: 0,
            });
        }
        return sections;
    }, [
        selectedParticipants,
        pickedParticipants,
        hasMultipleParticipants,
        iouAmount,
        iouCurrencyCode,
        getParticipantsWithAmount,
        personalDetailsOfPayee,
        translate,
        shouldDisablePaidBySection,
        userCanModifyParticipants,
    ]);

    const selectedOptions = useMemo(() => {
        if (!hasMultipleParticipants) {
            return [];
        }
        return [...selectedParticipants, OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetailsOfPayee)];
    }, [selectedParticipants, hasMultipleParticipants, personalDetailsOfPayee]);

    useEffect(() => {
        if (!isDistanceRequest) {
            return;
        }
        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(hasRoute, distance, unit, rate, currency, translate, toLocaleDigit);
        IOU.setMoneyRequestMerchant_temporaryForRefactor(transaction.transactionID, distanceMerchant);
    }, [hasRoute, distance, unit, rate, currency, translate, toLocaleDigit, isDistanceRequest, transaction]);

    /**
     * @param {Object} option
     */
    const selectParticipant = useCallback(
        (option) => {
            // Return early if selected option is currently logged in user.
            if (option.accountID === accountID) {
                return;
            }
            onSelectParticipant(option);
        },
        [accountID, onSelectParticipant],
    );

    /**
     * Navigate to report details or profile of selected user
     * @param {Object} option
     */
    const navigateToReportOrUserDetail = (option) => {
        if (option.accountID) {
            const activeRoute = Navigation.getActiveRouteWithoutParams();

            Navigation.navigate(ROUTES.PROFILE.getRoute(option.accountID, activeRoute));
        } else if (option.reportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(option.reportID));
        }
    };

    /**
     * @param {String} paymentMethod
     */
    const confirm = useCallback(
        (paymentMethod) => {
            if (_.isEmpty(selectedParticipants)) {
                return;
            }
            if ((isMerchantRequired && isMerchantEmpty) || (shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction))) {
                setMerchantError(true);
                return;
            }

            if (iouType === CONST.IOU.TYPE.SEND) {
                if (!paymentMethod) {
                    return;
                }

                setDidConfirm(true);

                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                onSendMoney(paymentMethod);
            } else {
                // validate the amount for distance requests
                const decimals = CurrencyUtils.getCurrencyDecimals(iouCurrencyCode);
                if (isDistanceRequest && !isDistanceRequestWithoutRoute && !MoneyRequestUtils.validateAmount(String(iouAmount), decimals)) {
                    setFormError('common.error.invalidAmount');
                    return;
                }

                if (isEditingSplitBill && TransactionUtils.areRequiredFieldsEmpty(transaction)) {
                    setDidConfirmSplit(true);
                    setFormError('iou.error.genericSmartscanFailureMessage');
                    return;
                }

                setDidConfirm(true);
                onConfirm(selectedParticipants);
            }
        },
        [
            selectedParticipants,
            isMerchantRequired,
            isMerchantEmpty,
            shouldDisplayFieldError,
            transaction,
            iouType,
            onSendMoney,
            iouCurrencyCode,
            isDistanceRequest,
            isDistanceRequestWithoutRoute,
            iouAmount,
            isEditingSplitBill,
            onConfirm,
        ],
    );

    const footerContent = useMemo(() => {
        if (isReadOnly) {
            return;
        }

        const shouldShowSettlementButton = iouType === CONST.IOU.TYPE.SEND;
        const shouldDisableButton = selectedParticipants.length === 0;

        const button = shouldShowSettlementButton ? (
            <SettlementButton
                pressOnEnter
                isDisabled={shouldDisableButton}
                onPress={confirm}
                enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                addBankAccountRoute={bankAccountRoute}
                addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                currency={iouCurrencyCode}
                policyID={policyID}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                kycWallAnchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                paymentMethodDropdownAnchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
            />
        ) : (
            <ButtonWithDropdownMenu
                pressOnEnter
                isDisabled={shouldDisableButton}
                onPress={(_event, value) => confirm(value)}
                options={splitOrRequestOptions}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
            />
        );

        return (
            <>
                {!_.isEmpty(formError) && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message={translate(formError)}
                    />
                )}
                {button}
            </>
        );
    }, [isReadOnly, iouType, selectedParticipants.length, confirm, bankAccountRoute, iouCurrencyCode, policyID, splitOrRequestOptions, formError, styles.ph1, styles.mb2, translate]);

    const {
        image: receiptImage,
        thumbnail: receiptThumbnail,
        isThumbnail,
    } = receiptPath && receiptFilename ? ReceiptUtils.getThumbnailAndImageURIs(transaction, receiptPath, receiptFilename) : {};
    return (
        <OptionsSelector
            sections={optionSelectorSections}
            onSelectRow={userCanModifyParticipants.current ? selectParticipant : navigateToReportOrUserDetail}
            onAddToSelection={selectParticipant}
            onConfirmSelection={confirm}
            selectedOptions={selectedOptions}
            canSelectMultipleOptions={userCanModifyParticipants.current}
            disableArrowKeysActions={!userCanModifyParticipants.current}
            boldStyle
            showTitleTooltip
            shouldTextInputAppearBelowOptions
            shouldShowTextInput={false}
            shouldUseStyleForChildren={false}
            optionHoveredStyle={userCanModifyParticipants.current ? styles.hoveredComponentBG : {}}
            footerContent={!isEditingSplitBill && footerContent}
            listStyles={listStyles}
            shouldAllowScrollingChildren
        >
            {isDistanceRequest && (
                <View style={styles.confirmationListMapItem}>
                    <ConfirmedRoute transaction={transaction} />
                </View>
            )}
            {(receiptImage || receiptThumbnail) && (
                <ReceiptImage
                    style={styles.moneyRequestImage}
                    isThumbnail={isThumbnail}
                    source={receiptThumbnail || receiptImage}
                    // AuthToken is required when retrieving the image from the server
                    // but we don't need it to load the blob:// or file:// image when starting a money request / split bill
                    // So if we have a thumbnail, it means we're retrieving the image from the server
                    isAuthTokenRequired={!_.isEmpty(receiptThumbnail)}
                />
            )}
            {shouldShowSmartScanFields && (
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!isReadOnly && !isDistanceRequest}
                    title={formattedAmount}
                    description={translate('iou.amount')}
                    interactive={!isReadOnly}
                    onPress={() => {
                        if (isDistanceRequest) {
                            return;
                        }
                        if (isEditingSplitBill) {
                            Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(reportID, reportActionID, CONST.EDIT_REQUEST_FIELD.AMOUNT));
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                    }}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm}
                    brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                    error={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction) ? translate('common.error.enterAmount') : ''}
                />
            )}
            <MenuItemWithTopDescription
                shouldShowRightIcon={!isReadOnly}
                shouldParseTitle
                title={iouComment}
                description={translate('common.description')}
                onPress={() => {
                    if (isEditingSplitBill) {
                        Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(reportID, reportActionID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION));
                        return;
                    }
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                }}
                style={[styles.moneyRequestMenuItem]}
                titleStyle={styles.flex1}
                disabled={didConfirm}
                interactive={!isReadOnly}
                numberOfLinesTitle={2}
            />
            {isMerchantRequired && (
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!isReadOnly}
                    title={isMerchantEmpty ? '' : iouMerchant}
                    description={translate('common.merchant')}
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    onPress={() => {
                        if (isEditingSplitBill) {
                            Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(reportID, reportActionID, CONST.EDIT_REQUEST_FIELD.MERCHANT));
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                    }}
                    disabled={didConfirm}
                    interactive={!isReadOnly}
                    brickRoadIndicator={merchantError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                    error={merchantError ? translate('common.error.fieldRequired') : ''}
                />
            )}
            {!shouldShowAllFields && (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.mh3, styles.alignItemsCenter, styles.mb2, styles.mt1]}>
                    <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.mr0]} />
                    <Button
                        small
                        onPress={toggleShouldExpandFields}
                        text={translate('common.showMore')}
                        shouldShowRightIcon
                        iconRight={Expensicons.DownArrow}
                        iconFill={theme.icon}
                        style={styles.mh0}
                    />
                    <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.ml0]} />
                </View>
            )}
            {shouldShowAllFields && (
                <>
                    {isDistanceRequest && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly && isTypeRequest}
                            title={iouMerchant}
                            description={translate('common.distance')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()))
                            }
                            disabled={didConfirm || !isTypeRequest}
                            interactive={!isReadOnly}
                        />
                    )}
                    {!isMerchantRequired && shouldShowMerchant && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={isMerchantEmpty ? '' : iouMerchant}
                            description={translate('common.merchant')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (isEditingSplitBill) {
                                    Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(reportID, reportActionID, CONST.EDIT_REQUEST_FIELD.MERCHANT));
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                            }}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            brickRoadIndicator={merchantError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                            error={merchantError ? translate('common.error.fieldRequired') : ''}
                        />
                    )}
                    {shouldShowDate && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={iouCreated || format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                            description={translate('common.date')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (isEditingSplitBill) {
                                    Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(reportID, reportActionID, CONST.EDIT_REQUEST_FIELD.DATE));
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                            }}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                            error={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction) ? translate('common.error.enterDate') : ''}
                        />
                    )}
                    {shouldShowCategories && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={iouCategory}
                            description={translate('common.category')}
                            numberOfLinesTitle={2}
                            onPress={() =>
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()))
                            }
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            rightLabel={canUseViolations && Boolean(policy.requiresCategory) ? translate('common.required') : ''}
                        />
                    )}
                    {shouldShowTags && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={iouTag}
                            description={policyTagListName}
                            numberOfLinesTitle={2}
                            onPress={() =>
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()))
                            }
                            style={[styles.moneyRequestMenuItem]}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            rightLabel={canUseViolations && Boolean(policy.requiresTag) ? translate('common.required') : ''}
                        />
                    )}
                    {shouldShowTax && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={taxRateTitle}
                            description={policyTaxRates.name}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()))
                            }
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                        />
                    )}

                    {shouldShowTax && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={formattedTaxAmount}
                            description={policyTaxRates.name}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() =>
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRouteWithoutParams()))
                            }
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                        />
                    )}
                    {shouldShowBillable && (
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}>
                            <Text color={!iouIsBillable ? theme.textSupporting : undefined}>{translate('common.billable')}</Text>
                            <Switch
                                accessibilityLabel={translate('common.billable')}
                                isOn={iouIsBillable}
                                onToggle={onToggleBillable}
                            />
                        </View>
                    )}
                </>
            )}
        </OptionsSelector>
    );
}

MoneyTemporaryForRefactorRequestConfirmationList.propTypes = propTypes;
MoneyTemporaryForRefactorRequestConfirmationList.defaultProps = defaultProps;
MoneyTemporaryForRefactorRequestConfirmationList.displayName = 'MoneyTemporaryForRefactorRequestConfirmationList';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        policyCategories: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
        },
        policyTags: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
        },
        mileageRate: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            selector: DistanceRequestUtils.getDefaultMileageRate,
        },
        policy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        },
        policyTaxRates: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_TAX_RATE}${policyID}`,
        },
    }),
)(MoneyTemporaryForRefactorRequestConfirmationList);
