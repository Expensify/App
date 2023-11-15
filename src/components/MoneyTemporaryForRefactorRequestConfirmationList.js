import {useIsFocused} from '@react-navigation/native';
import {format} from 'date-fns';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Log from '@libs/Log';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
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
import Image from './Image';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import optionPropTypes from './optionPropTypes';
import OptionsSelector from './OptionsSelector';
import SettlementButton from './SettlementButton';
import Switch from './Switch';
import tagPropTypes from './tagPropTypes';
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

    /** Depending on expense report or personal IOU report, respective bank account route */
    bankAccountRoute: PropTypes.string,

    ...withCurrentUserPersonalDetailsPropTypes,

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

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

    /** Whether the money request is a scan request */
    isScanRequest: PropTypes.bool,

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
    betas: [],
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
    isScanRequest: false,
    shouldShowSmartScanFields: true,
    isPolicyExpenseChat: false,
};

function MoneyTemporaryForRefactorRequestConfirmationList({
    bankAccountRoute,
    betas,
    canModifyParticipants,
    currentUserPersonalDetails,
    draftTransaction,
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
    selectedParticipants,
    session: {accountID},
    shouldShowSmartScanFields,
    transaction,
    transactionID,
}) {
    const {translate, toLocaleDigit} = useLocalize();
    const transactionData = isEditingSplitBill ? draftTransaction || transaction : transaction;

    const isTypeRequest = iouType === CONST.IOU.TYPE.REQUEST;
    const isTypeSplit = iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = iouType === CONST.IOU.TYPE.SEND;

    const isSplitWithScan = isTypeSplit && isScanRequest;

    const {unit, rate, currency} = mileageRate;
    const distance = lodashGet(transactionData, 'routes.route0.distance', 0);
    const shouldCalculateDistanceAmount = isDistanceRequest && iouAmount === 0;

    // A flag for showing the categories field
    const shouldShowCategories = isPolicyExpenseChat && (iouCategory || OptionsListUtils.hasEnabledOptions(_.values(policyCategories)));

    // A flag and a toggler for showing the rest of the form fields
    const [shouldExpandFields, toggleShouldExpandFields] = useReducer((state) => !state, false);

    // Do not hide fields in case of send money request
    const shouldShowAllFields = isDistanceRequest || shouldExpandFields || !shouldShowSmartScanFields || isTypeSend || isEditingSplitBill;

    // In Send Money flow, we don't allow the Merchant or Date to be edited. For distance requests, don't show the merchant as there's already another "Distance" menu item
    const shouldShowDate = shouldShowAllFields && !isTypeSend && !isSplitWithScan;
    const shouldShowMerchant = shouldShowAllFields && !isTypeSend && !isDistanceRequest && !isSplitWithScan;

    // Fetches the first tag list of the policy
    const policyTag = PolicyUtils.getTag(policyTags);
    const policyTagList = lodashGet(policyTag, 'tags', {});
    const policyTagListName = lodashGet(policyTag, 'name', translate('common.tag'));
    const canUseTags = Permissions.canUseTags(betas);

    // The tags should be shown when the report is a policy expense chat, and the user can use tags, and there are enabled tags
    const shouldShowTags = isPolicyExpenseChat && canUseTags && OptionsListUtils.hasEnabledOptions(_.values(policyTagList));

    // A flag for showing the billable field
    const shouldShowBillable = canUseTags && !lodashGet(policy, 'disabledFields.defaultBillable', true);

    const hasRoute = TransactionUtils.hasRoute(transactionData);
    const isDistanceRequestWithoutRoute = isDistanceRequest && !hasRoute;
    const formattedAmount = isDistanceRequestWithoutRoute
        ? translate('common.tbd')
        : CurrencyUtils.convertToDisplayString(
              shouldCalculateDistanceAmount ? DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate) : iouAmount,
              isDistanceRequest ? currency : iouCurrencyCode,
          );

    const isFocused = useIsFocused();
    const [formError, setFormError] = useState('');

    const [didConfirm, setDidConfirm] = useState(false);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);

    const shouldDisplayFieldError = useMemo(() => {
        if (!isEditingSplitBill) {
            return false;
        }

        return (hasSmartScanFailed && TransactionUtils.hasMissingSmartscanFields(transactionData)) || (didConfirmSplit && TransactionUtils.areRequiredFieldsEmpty(transactionData));
    }, [isEditingSplitBill, hasSmartScanFailed, transactionData, didConfirmSplit]);

    useEffect(() => {
        if (shouldDisplayFieldError && hasSmartScanFailed) {
            setFormError('iou.receiptScanningFailed');
            return;
        }
        if (shouldDisplayFieldError && didConfirmSplit) {
            setFormError('iou.error.genericSmartscanFailureMessage');
            return;
        }
        // reset the form error whenever the screen gains or loses focus
        setFormError('');
    }, [isFocused, transactionData, shouldDisplayFieldError, hasSmartScanFailed, didConfirmSplit]);

    useEffect(() => {
        if (!shouldCalculateDistanceAmount) {
            return;
        }

        const amount = DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate);
        IOU.setMoneyRequestAmount(amount);
    }, [shouldCalculateDistanceAmount, distance, rate, unit]);

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

    const selectedParticipantsFiltered = useMemo(() => _.filter(selectedParticipants, (participant) => participant.selected), [selectedParticipants]);
    const personalDetailsOfPayee = useMemo(() => payeePersonalDetails || currentUserPersonalDetails, [payeePersonalDetails, currentUserPersonalDetails]);
    const userCanModifyParticipants = useRef(!isReadOnly && canModifyParticipants && hasMultipleParticipants);
    useEffect(() => {
        userCanModifyParticipants.current = !isReadOnly && canModifyParticipants && hasMultipleParticipants;
    }, [isReadOnly, canModifyParticipants, hasMultipleParticipants]);
    const shouldDisablePaidBySection = userCanModifyParticipants.current;

    const optionSelectorSections = useMemo(() => {
        const sections = [];
        const unselectedParticipants = _.filter(selectedParticipantsFiltered, (participant) => !participant.selected);
        if (hasMultipleParticipants) {
            const formattedSelectedParticipants = getParticipantsWithAmount(selectedParticipantsFiltered);
            let formattedParticipantsList = _.union(formattedSelectedParticipants, unselectedParticipants);

            if (!userCanModifyParticipants.current) {
                formattedParticipantsList = _.map(formattedParticipantsList, (participant) => ({
                    ...participant,
                    isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID),
                }));
            }

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipantsFiltered.length, iouAmount, iouCurrencyCode, true);
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
            const formattedSelectedParticipants = _.map(selectedParticipantsFiltered, (participant) => ({
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
        selectedParticipantsFiltered,
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
        return [...selectedParticipantsFiltered, OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetailsOfPayee)];
    }, [selectedParticipantsFiltered, hasMultipleParticipants, personalDetailsOfPayee]);

    useEffect(() => {
        if (!isDistanceRequest) {
            return;
        }
        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(hasRoute, distance, unit, rate, currency, translate, toLocaleDigit);
        IOU.setMoneyRequestMerchant_temporaryForRefactor(transactionID, distanceMerchant);
    }, [hasRoute, distance, unit, rate, currency, translate, toLocaleDigit, isDistanceRequest, transactionID]);

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
            const activeRoute = Navigation.getActiveRoute().replace(/\?.*/, '');

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
            if (_.isEmpty(selectedParticipantsFiltered)) {
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

                if (isEditingSplitBill && TransactionUtils.areRequiredFieldsEmpty(transactionData)) {
                    setDidConfirmSplit(true);
                    setFormError('iou.error.genericSmartscanFailureMessage');
                    return;
                }

                setDidConfirm(true);
                onConfirm(selectedParticipantsFiltered);
            }
        },
        [selectedParticipantsFiltered, onSendMoney, onConfirm, isEditingSplitBill, iouType, isDistanceRequest, isDistanceRequestWithoutRoute, iouCurrencyCode, iouAmount, transactionData],
    );

    const footerContent = useMemo(() => {
        if (isReadOnly) {
            return;
        }

        const shouldShowSettlementButton = iouType === CONST.IOU.TYPE.SEND;
        const shouldDisableButton = selectedParticipantsFiltered.length === 0;

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
                shouldShowPaymentOptions
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
                style={[styles.mt2]}
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
    }, [confirm, bankAccountRoute, iouCurrencyCode, iouType, isReadOnly, policyID, selectedParticipantsFiltered, splitOrRequestOptions, translate, formError]);

    const {image: receiptImage, thumbnail: receiptThumbnail} = receiptPath && receiptFilename ? ReceiptUtils.getThumbnailAndImageURIs(transactionData, receiptPath, receiptFilename) : {};
    return (
        <OptionsSelector
            sections={optionSelectorSections}
            value=""
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
                    <ConfirmedRoute transactionID={transactionID} />
                </View>
            )}
            {(receiptImage || receiptThumbnail) && (
                <Image
                    style={styles.moneyRequestImage}
                    source={{uri: receiptThumbnail || receiptImage}}
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
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_AMOUNT.getRoute(iouType, transactionID, reportID, Navigation.getCurrentPath()));
                    }}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm}
                    brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transactionData) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                    error={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transactionData) ? translate('common.error.enterAmount') : ''}
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
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(iouType, transactionID, reportID, Navigation.getCurrentPath()));
                }}
                style={[styles.moneyRequestMenuItem]}
                titleStyle={styles.flex1}
                disabled={didConfirm}
                interactive={!isReadOnly}
                numberOfLinesTitle={2}
            />
            {!shouldShowAllFields && (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.mh3, styles.alignItemsCenter, styles.mb2]}>
                    <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.mr0]} />
                    <Button
                        small
                        onPress={toggleShouldExpandFields}
                        text={translate('common.showMore')}
                        shouldShowRightIcon
                        iconRight={Expensicons.DownArrow}
                        iconFill={themeColors.icon}
                        style={styles.mh0}
                    />
                    <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.ml0]} />
                </View>
            )}
            {shouldShowAllFields && (
                <>
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
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(iouType, transactionID, reportID, Navigation.getCurrentPath()));
                            }}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transactionData) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                            error={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transactionData) ? translate('common.error.enterDate') : ''}
                        />
                    )}
                    {isDistanceRequest && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly && isTypeRequest}
                            title={iouMerchant}
                            description={translate('common.distance')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(iouType, transactionID, reportID, Navigation.getCurrentPath()))}
                            disabled={didConfirm || !isTypeRequest}
                            interactive={!isReadOnly}
                        />
                    )}
                    {shouldShowMerchant && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={iouMerchant}
                            description={translate('common.merchant')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (isEditingSplitBill) {
                                    Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(reportID, reportActionID, CONST.EDIT_REQUEST_FIELD.MERCHANT));
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(iouType, transactionID, reportID, Navigation.getCurrentPath()));
                            }}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                            brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transactionData) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                            error={shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transactionData) ? translate('common.error.enterMerchant') : ''}
                        />
                    )}
                    {shouldShowCategories && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={iouCategory}
                            description={translate('common.category')}
                            numberOfLinesTitle={2}
                            onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(iouType, transactionID, reportID, Navigation.getCurrentPath()))}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                        />
                    )}
                    {shouldShowTags && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!isReadOnly}
                            title={iouTag}
                            description={policyTagListName}
                            numberOfLinesTitle={2}
                            onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAG.getRoute(iouType, transactionID, reportID, Navigation.getCurrentPath()))}
                            style={[styles.moneyRequestMenuItem]}
                            disabled={didConfirm}
                            interactive={!isReadOnly}
                        />
                    )}
                    {shouldShowBillable && (
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}>
                            <Text color={!iouIsBillable ? themeColors.textSupporting : undefined}>{translate('common.billable')}</Text>
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

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        betas: {
            key: ONYXKEYS.BETAS,
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
        draftTransaction: {
            key: ({transactionID}) => `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`,
        },
        transaction: {
            key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        },
        policy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        },
    }),
)(MoneyTemporaryForRefactorRequestConfirmationList);
