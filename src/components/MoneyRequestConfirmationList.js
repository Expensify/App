import {useIsFocused} from '@react-navigation/native';
import {format} from 'date-fns';
import {isEmpty} from 'lodash';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useReducer, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
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
import {iouDefaultProps, iouPropTypes} from '@pages/iou/propTypes';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import categoryPropTypes from './categoryPropTypes';
import ConfirmedRoute from './ConfirmedRoute';
import FormHelpMessage from './FormHelpMessage';
import Image from './Image';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import optionPropTypes from './optionPropTypes';
import OptionsSelector from './OptionsSelector';
import SettlementButton from './SettlementButton';
import ShowMoreButton from './ShowMoreButton';
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

    /** IOU Category */
    iouCategory: PropTypes.string,

    /** IOU Tag */
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

    /** Transaction that represents the money request */
    transaction: transactionPropTypes,

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

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,
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
    isScanRequest: false,
    shouldShowSmartScanFields: true,
    isPolicyExpenseChat: false,
    iou: iouDefaultProps,
};

function MoneyRequestConfirmationList(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    // Destructure functions from props to pass it as a dependecy to useCallback/useMemo hooks.
    // Prop functions pass props itself as a "this" value to the function which means they change every time props change.
    const {onSendMoney, onConfirm, onSelectParticipant} = props;
    const {translate, toLocaleDigit} = useLocalize();
    const transaction = props.isEditingSplitBill ? props.draftTransaction || props.transaction : props.transaction;
    const {canUseViolations} = usePermissions();

    const isTypeRequest = props.iouType === CONST.IOU.TYPE.REQUEST;
    const isSplitBill = props.iouType === CONST.IOU.TYPE.SPLIT;
    const isTypeSend = props.iouType === CONST.IOU.TYPE.SEND;

    const isSplitWithScan = isSplitBill && props.isScanRequest;

    const {unit, rate, currency} = props.mileageRate;
    const distance = lodashGet(transaction, 'routes.route0.distance', 0);
    const shouldCalculateDistanceAmount = props.isDistanceRequest && props.iouAmount === 0;

    // A flag for showing the categories field
    const shouldShowCategories = props.isPolicyExpenseChat && (props.iouCategory || OptionsListUtils.hasEnabledOptions(_.values(props.policyCategories)));
    // A flag and a toggler for showing the rest of the form fields
    const [shouldExpandFields, toggleShouldExpandFields] = useReducer((state) => !state, false);

    // Do not hide fields in case of send money request
    const shouldShowAllFields = props.isDistanceRequest || shouldExpandFields || !props.shouldShowSmartScanFields || isTypeSend || props.isEditingSplitBill;

    // In Send Money and Split Bill with Scan flow, we don't allow the Merchant or Date to be edited. For distance requests, don't show the merchant as there's already another "Distance" menu item
    const shouldShowDate = shouldShowAllFields && !isTypeSend && !isSplitWithScan;
    const shouldShowMerchant = shouldShowAllFields && !isTypeSend && !props.isDistanceRequest && !isSplitWithScan;

    // Fetches the first tag list of the policy
    const policyTag = PolicyUtils.getTag(props.policyTags);
    const policyTagList = lodashGet(policyTag, 'tags', {});
    const policyTagListName = lodashGet(policyTag, 'name', translate('common.tag'));
    // A flag for showing the tags field
    const shouldShowTags = props.isPolicyExpenseChat && OptionsListUtils.hasEnabledOptions(_.values(policyTagList));

    // A flag for showing the billable field
    const shouldShowBillable = !lodashGet(props.policy, 'disabledFields.defaultBillable', true);

    const hasRoute = TransactionUtils.hasRoute(transaction);
    const isDistanceRequestWithoutRoute = props.isDistanceRequest && !hasRoute;
    const formattedAmount = isDistanceRequestWithoutRoute
        ? translate('common.tbd')
        : CurrencyUtils.convertToDisplayString(
              shouldCalculateDistanceAmount ? DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate) : props.iouAmount,
              props.isDistanceRequest ? currency : props.iouCurrencyCode,
          );

    const isFocused = useIsFocused();
    const [formError, setFormError] = useState('');

    const [didConfirm, setDidConfirm] = useState(false);
    const [didConfirmSplit, setDidConfirmSplit] = useState(false);

    const shouldDisplayFieldError = useMemo(() => {
        if (!props.isEditingSplitBill) {
            return false;
        }

        return (props.hasSmartScanFailed && TransactionUtils.hasMissingSmartscanFields(transaction)) || (didConfirmSplit && TransactionUtils.areRequiredFieldsEmpty(transaction));
    }, [props.isEditingSplitBill, props.hasSmartScanFailed, transaction, didConfirmSplit]);

    useEffect(() => {
        if (shouldDisplayFieldError && props.hasSmartScanFailed) {
            setFormError('iou.receiptScanningFailed');
            return;
        }
        if (shouldDisplayFieldError && didConfirmSplit) {
            setFormError('iou.error.genericSmartscanFailureMessage');
            return;
        }
        // reset the form error whenever the screen gains or loses focus
        setFormError('');
    }, [isFocused, transaction, shouldDisplayFieldError, props.hasSmartScanFailed, didConfirmSplit]);

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
            const iouAmount = IOUUtils.calculateAmount(participantsList.length, props.iouAmount, props.iouCurrencyCode);
            return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(
                participantsList,
                props.iouAmount > 0 ? CurrencyUtils.convertToDisplayString(iouAmount, props.iouCurrencyCode) : '',
            );
        },
        [props.iouAmount, props.iouCurrencyCode],
    );

    // If completing a split bill fails, set didConfirm to false to allow the user to edit the fields again
    if (props.isEditingSplitBill && didConfirm) {
        setDidConfirm(false);
    }

    const splitOrRequestOptions = useMemo(() => {
        let text;
        if (isSplitBill && props.iouAmount === 0) {
            text = translate('iou.split');
        } else if ((props.receiptPath && isTypeRequest) || isDistanceRequestWithoutRoute) {
            text = translate('iou.request');
            if (props.iouAmount !== 0) {
                text = translate('iou.requestAmount', {amount: formattedAmount});
            }
        } else {
            const translationKey = isSplitBill ? 'iou.splitAmount' : 'iou.requestAmount';
            text = translate(translationKey, {amount: formattedAmount});
        }
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: props.iouType,
            },
        ];
    }, [isSplitBill, isTypeRequest, props.iouType, props.iouAmount, props.receiptPath, formattedAmount, isDistanceRequestWithoutRoute, translate]);

    const selectedParticipants = useMemo(() => _.filter(props.selectedParticipants, (participant) => participant.selected), [props.selectedParticipants]);
    const payeePersonalDetails = useMemo(() => props.payeePersonalDetails || props.currentUserPersonalDetails, [props.payeePersonalDetails, props.currentUserPersonalDetails]);
    const canModifyParticipants = !props.isReadOnly && props.canModifyParticipants && props.hasMultipleParticipants;
    const shouldDisablePaidBySection = canModifyParticipants;

    const optionSelectorSections = useMemo(() => {
        const sections = [];
        const unselectedParticipants = _.filter(props.selectedParticipants, (participant) => !participant.selected);
        if (props.hasMultipleParticipants) {
            const formattedSelectedParticipants = getParticipantsWithAmount(selectedParticipants);
            let formattedParticipantsList = _.union(formattedSelectedParticipants, unselectedParticipants);

            if (!canModifyParticipants) {
                formattedParticipantsList = _.map(formattedParticipantsList, (participant) => ({
                    ...participant,
                    isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID),
                }));
            }

            const myIOUAmount = IOUUtils.calculateAmount(selectedParticipants.length, props.iouAmount, props.iouCurrencyCode, true);
            const formattedPayeeOption = OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(
                payeePersonalDetails,
                props.iouAmount > 0 ? CurrencyUtils.convertToDisplayString(myIOUAmount, props.iouCurrencyCode) : '',
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
            const formattedSelectedParticipants = _.map(props.selectedParticipants, (participant) => ({
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
        props.selectedParticipants,
        props.hasMultipleParticipants,
        props.iouAmount,
        props.iouCurrencyCode,
        getParticipantsWithAmount,
        selectedParticipants,
        payeePersonalDetails,
        translate,
        shouldDisablePaidBySection,
        canModifyParticipants,
    ]);

    const selectedOptions = useMemo(() => {
        if (!props.hasMultipleParticipants) {
            return [];
        }
        return [...selectedParticipants, OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails)];
    }, [selectedParticipants, props.hasMultipleParticipants, payeePersonalDetails]);

    useEffect(() => {
        if (!props.isDistanceRequest) {
            return;
        }
        const distanceMerchant = DistanceRequestUtils.getDistanceMerchant(hasRoute, distance, unit, rate, currency, translate, toLocaleDigit);
        IOU.setMoneyRequestMerchant(distanceMerchant);
    }, [hasRoute, distance, unit, rate, currency, translate, toLocaleDigit, props.isDistanceRequest]);

    /**
     * @param {Object} option
     */
    const selectParticipant = useCallback(
        (option) => {
            // Return early if selected option is currently logged in user.
            if (option.accountID === props.session.accountID) {
                return;
            }
            onSelectParticipant(option);
        },
        [props.session.accountID, onSelectParticipant],
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

            if (props.iouType === CONST.IOU.TYPE.SEND) {
                if (!paymentMethod) {
                    return;
                }

                setDidConfirm(true);

                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                onSendMoney(paymentMethod);
            } else {
                // validate the amount for distance requests
                const decimals = CurrencyUtils.getCurrencyDecimals(props.iouCurrencyCode);
                if (props.isDistanceRequest && !isDistanceRequestWithoutRoute && !MoneyRequestUtils.validateAmount(String(props.iouAmount), decimals)) {
                    setFormError('common.error.invalidAmount');
                    return;
                }

                if (props.isEditingSplitBill && TransactionUtils.areRequiredFieldsEmpty(transaction)) {
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
            onSendMoney,
            onConfirm,
            props.isEditingSplitBill,
            props.iouType,
            props.isDistanceRequest,
            isDistanceRequestWithoutRoute,
            props.iouCurrencyCode,
            props.iouAmount,
            transaction,
        ],
    );

    const footerContent = useMemo(() => {
        if (props.isReadOnly) {
            return;
        }

        const shouldShowSettlementButton = props.iouType === CONST.IOU.TYPE.SEND;
        const shouldDisableButton = selectedParticipants.length === 0;

        const button = shouldShowSettlementButton ? (
            <SettlementButton
                pressOnEnter
                isDisabled={shouldDisableButton}
                onPress={confirm}
                enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                addBankAccountRoute={props.bankAccountRoute}
                addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                currency={props.iouCurrencyCode}
                policyID={props.policyID}
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
    }, [
        props.isReadOnly,
        props.iouType,
        props.bankAccountRoute,
        props.iouCurrencyCode,
        props.policyID,
        selectedParticipants.length,
        confirm,
        splitOrRequestOptions,
        formError,
        styles.ph1,
        styles.mb2,
        translate,
    ]);

    const {image: receiptImage, thumbnail: receiptThumbnail} =
        props.receiptPath && props.receiptFilename ? ReceiptUtils.getThumbnailAndImageURIs(transaction, props.receiptPath, props.receiptFilename) : {};
    return (
        <OptionsSelector
            sections={optionSelectorSections}
            value=""
            onSelectRow={canModifyParticipants ? selectParticipant : navigateToReportOrUserDetail}
            onAddToSelection={selectParticipant}
            onConfirmSelection={confirm}
            selectedOptions={selectedOptions}
            canSelectMultipleOptions={canModifyParticipants}
            disableArrowKeysActions={!canModifyParticipants}
            boldStyle
            showTitleTooltip
            shouldTextInputAppearBelowOptions
            shouldShowTextInput={false}
            shouldUseStyleForChildren={false}
            optionHoveredStyle={canModifyParticipants ? styles.hoveredComponentBG : {}}
            footerContent={(!isEmpty(props.iou.id) || props.isEditingSplitBill) && footerContent}
            listStyles={props.listStyles}
            shouldAllowScrollingChildren
        >
            {props.isDistanceRequest && (
                <View style={styles.confirmationListMapItem}>
                    <ConfirmedRoute transactionID={props.transactionID} />
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
            {props.shouldShowSmartScanFields && (
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!props.isReadOnly && !props.isDistanceRequest}
                    title={formattedAmount}
                    description={translate('iou.amount')}
                    interactive={!props.isReadOnly}
                    onPress={() => {
                        if (props.isDistanceRequest) {
                            return;
                        }
                        if (props.isEditingSplitBill) {
                            Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(props.reportID, props.reportActionID, CONST.EDIT_REQUEST_FIELD.AMOUNT));
                            return;
                        }
                        Navigation.navigate(ROUTES.MONEY_REQUEST_AMOUNT.getRoute(props.iouType, props.reportID));
                    }}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm}
                    brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                    error={shouldDisplayFieldError && TransactionUtils.isAmountMissing(transaction) ? translate('common.error.enterAmount') : ''}
                />
            )}
            <MenuItemWithTopDescription
                shouldShowRightIcon={!props.isReadOnly}
                shouldParseTitle
                title={props.iouComment}
                description={translate('common.description')}
                onPress={() => {
                    if (props.isEditingSplitBill) {
                        Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(props.reportID, props.reportActionID, CONST.EDIT_REQUEST_FIELD.DESCRIPTION));
                        return;
                    }
                    Navigation.navigate(ROUTES.MONEY_REQUEST_DESCRIPTION.getRoute(props.iouType, props.reportID));
                }}
                style={[styles.moneyRequestMenuItem]}
                titleStyle={styles.flex1}
                disabled={didConfirm}
                interactive={!props.isReadOnly}
                numberOfLinesTitle={2}
            />
            {!shouldShowAllFields && (
                <ShowMoreButton
                    containerStyle={styles.mt1}
                    onPress={toggleShouldExpandFields}
                />
            )}
            {shouldShowAllFields && (
                <>
                    {shouldShowDate && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!props.isReadOnly}
                            title={props.iouCreated || format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                            description={translate('common.date')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (props.isEditingSplitBill) {
                                    Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(props.reportID, props.reportActionID, CONST.EDIT_REQUEST_FIELD.DATE));
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_DATE.getRoute(props.iouType, props.reportID));
                            }}
                            disabled={didConfirm}
                            interactive={!props.isReadOnly}
                            brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                            error={shouldDisplayFieldError && TransactionUtils.isCreatedMissing(transaction) ? translate('common.error.enterDate') : ''}
                        />
                    )}
                    {props.isDistanceRequest && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!props.isReadOnly && isTypeRequest}
                            title={props.iouMerchant}
                            description={translate('common.distance')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_DISTANCE.getRoute(props.iouType, props.reportID))}
                            disabled={didConfirm || !isTypeRequest}
                            interactive={!props.isReadOnly}
                        />
                    )}
                    {shouldShowMerchant && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!props.isReadOnly}
                            title={props.iouMerchant}
                            description={translate('common.merchant')}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            onPress={() => {
                                if (props.isEditingSplitBill) {
                                    Navigation.navigate(ROUTES.EDIT_SPLIT_BILL.getRoute(props.reportID, props.reportActionID, CONST.EDIT_REQUEST_FIELD.MERCHANT));
                                    return;
                                }
                                Navigation.navigate(ROUTES.MONEY_REQUEST_MERCHANT.getRoute(props.iouType, props.reportID));
                            }}
                            disabled={didConfirm}
                            interactive={!props.isReadOnly}
                            brickRoadIndicator={shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                            error={shouldDisplayFieldError && TransactionUtils.isMerchantMissing(transaction) ? translate('common.error.enterMerchant') : ''}
                        />
                    )}
                    {shouldShowCategories && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!props.isReadOnly}
                            title={props.iouCategory}
                            description={translate('common.category')}
                            numberOfLinesTitle={2}
                            onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_CATEGORY.getRoute(props.iouType, props.reportID))}
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            disabled={didConfirm}
                            interactive={!props.isReadOnly}
                            rightLabel={canUseViolations && Boolean(props.policy.requiresCategory) ? translate('common.required') : ''}
                        />
                    )}
                    {shouldShowTags && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!props.isReadOnly}
                            title={props.iouTag}
                            description={policyTagListName}
                            numberOfLinesTitle={2}
                            onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_TAG.getRoute(props.iouType, props.reportID))}
                            style={[styles.moneyRequestMenuItem]}
                            disabled={didConfirm}
                            interactive={!props.isReadOnly}
                            rightLabel={canUseViolations && Boolean(props.policy.requiresTag) ? translate('common.required') : ''}
                        />
                    )}

                    {shouldShowBillable && (
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.ml5, styles.mr8, styles.optionRow]}>
                            <Text color={!props.iouIsBillable ? theme.textSupporting : undefined}>{translate('common.billable')}</Text>
                            <Switch
                                accessibilityLabel={translate('common.billable')}
                                isOn={props.iouIsBillable}
                                onToggle={props.onToggleBillable}
                            />
                        </View>
                    )}
                </>
            )}
        </OptionsSelector>
    );
}

MoneyRequestConfirmationList.propTypes = propTypes;
MoneyRequestConfirmationList.defaultProps = defaultProps;
MoneyRequestConfirmationList.displayName = 'MoneyRequestConfirmationList';

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
        draftTransaction: {
            key: ({transactionID}) => `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`,
        },
        transaction: {
            key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        },
        policy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        },
        iou: {
            key: ONYXKEYS.IOU,
        },
    }),
)(MoneyRequestConfirmationList);
