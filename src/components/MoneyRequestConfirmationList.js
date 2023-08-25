import React, {useCallback, useMemo, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {format} from 'date-fns';
import _ from 'underscore';
import {View} from 'react-native';
import styles from '../styles/styles';
import * as ReportUtils from '../libs/ReportUtils';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import OptionsSelector from './OptionsSelector';
import ONYXKEYS from '../ONYXKEYS';
import compose from '../libs/compose';
import CONST from '../CONST';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import Log from '../libs/Log';
import SettlementButton from './SettlementButton';
import ROUTES from '../ROUTES';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from './withCurrentUserPersonalDetails';
import * as IOUUtils from '../libs/IOUUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Navigation from '../libs/Navigation/Navigation';
import optionPropTypes from './optionPropTypes';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';
import Image from './Image';
import useLocalize from '../hooks/useLocalize';
import * as ReceiptUtils from '../libs/ReceiptUtils';
import categoryPropTypes from './categoryPropTypes';

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

    /** File source of the receipt */
    receiptSource: PropTypes.string,

    /* Onyx Props */
    /** Collection of categories attached to a policy */
    policyCategories: PropTypes.objectOf(categoryPropTypes),
};

const defaultProps = {
    onConfirm: () => {},
    onSendMoney: () => {},
    onSelectParticipant: () => {},
    iouType: CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
    iouCategory: '',
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
    receiptSource: '',
    policyCategories: {},
};

function MoneyRequestConfirmationList(props) {
    // Destructure functions from props to pass it as a dependecy to useCallback/useMemo hooks.
    // Prop functions pass props itself as a "this" value to the function which means they change every time props change.
    const {onSendMoney, onConfirm, onSelectParticipant} = props;
    const {translate} = useLocalize();

    // A flag and a toggler for showing the rest of the form fields
    const [showAllFields, toggleShowAllFields] = useReducer((state) => !state, false);
    const isTypeRequest = props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.REQUEST;

    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    const getParticipantsWithAmount = useCallback(
        (participantsList) => {
            const iouAmount = IOUUtils.calculateAmount(participantsList.length, props.iouAmount, props.iouCurrencyCode);
            return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(participantsList, CurrencyUtils.convertToDisplayString(iouAmount, props.iouCurrencyCode));
        },
        [props.iouAmount, props.iouCurrencyCode],
    );

    const [didConfirm, setDidConfirm] = useState(false);

    const splitOrRequestOptions = useMemo(() => {
        let text;
        if (props.receiptPath) {
            text = translate('iou.request');
        } else {
            const translationKey = props.hasMultipleParticipants ? 'iou.splitAmount' : 'iou.requestAmount';
            text = translate(translationKey, {amount: CurrencyUtils.convertToDisplayString(props.iouAmount, props.iouCurrencyCode)});
        }
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: props.hasMultipleParticipants ? CONST.IOU.MONEY_REQUEST_TYPE.SPLIT : CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
            },
        ];
    }, [props.hasMultipleParticipants, props.iouAmount, props.receiptPath, props.iouCurrencyCode, translate]);

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
                CurrencyUtils.convertToDisplayString(myIOUAmount, props.iouCurrencyCode),
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
            const activeRoute = Navigation.getActiveRoute().replace(/\?.*/, '');

            Navigation.navigate(ROUTES.getProfileRoute(option.accountID, activeRoute));
        } else if (option.reportID) {
            Navigation.navigate(ROUTES.getReportDetailsRoute(option.reportID));
        }
    };

    /**
     * @param {String} paymentMethod
     */
    const confirm = useCallback(
        (paymentMethod) => {
            setDidConfirm(true);

            if (_.isEmpty(selectedParticipants)) {
                return;
            }

            if (props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND) {
                if (!paymentMethod) {
                    return;
                }

                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                onSendMoney(paymentMethod);
            } else {
                onConfirm(selectedParticipants);
            }
        },
        [selectedParticipants, onSendMoney, onConfirm, props.iouType],
    );

    const formattedAmount = CurrencyUtils.convertToDisplayString(props.iouAmount, props.iouCurrencyCode);

    const footerContent = useMemo(() => {
        if (props.isReadOnly) {
            return;
        }

        const shouldShowSettlementButton = props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND;
        const shouldDisableButton = selectedParticipants.length === 0;
        const recipient = props.selectedParticipants[0] || {};

        return shouldShowSettlementButton ? (
            <SettlementButton
                isDisabled={shouldDisableButton}
                onPress={confirm}
                shouldShowPaypal={Boolean(recipient && recipient.payPalMeAddress)}
                enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                addBankAccountRoute={props.bankAccountRoute}
                addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                currency={props.iouCurrencyCode}
                policyID={props.policyID}
                shouldShowPaymentOptions
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
            />
        ) : (
            <ButtonWithDropdownMenu
                isDisabled={shouldDisableButton}
                onPress={(_event, value) => confirm(value)}
                options={splitOrRequestOptions}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.LARGE}
            />
        );
    }, [confirm, props.selectedParticipants, props.bankAccountRoute, props.iouCurrencyCode, props.iouType, props.isReadOnly, props.policyID, selectedParticipants, splitOrRequestOptions]);

    return (
        <OptionsSelector
            sections={optionSelectorSections}
            value=""
            onSelectRow={canModifyParticipants ? selectParticipant : navigateToReportOrUserDetail}
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
            footerContent={footerContent}
        >
            {!_.isEmpty(props.receiptPath) ? (
                <Image
                    style={styles.moneyRequestImage}
                    source={{uri: ReceiptUtils.getThumbnailAndImageURIs(props.receiptPath, props.receiptSource).image}}
                />
            ) : (
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!props.isReadOnly}
                    title={formattedAmount}
                    description={translate('iou.amount')}
                    onPress={() => Navigation.navigate(ROUTES.getMoneyRequestAmountRoute(props.iouType, props.reportID))}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm || props.isReadOnly}
                />
            )}
            <MenuItemWithTopDescription
                shouldShowRightIcon={!props.isReadOnly}
                title={props.iouComment}
                description={translate('common.description')}
                onPress={() => Navigation.navigate(ROUTES.getMoneyRequestDescriptionRoute(props.iouType, props.reportID))}
                style={[styles.moneyRequestMenuItem, styles.mb2]}
                titleStyle={styles.flex1}
                disabled={didConfirm || props.isReadOnly}
            />
            {!showAllFields && (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.mh3, styles.alignItemsCenter]}>
                    <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.mr0]} />
                    <Button
                        small
                        onPress={toggleShowAllFields}
                        text={translate('common.showMore')}
                        shouldShowRightIcon
                        iconRight={Expensicons.DownArrow}
                        iconFill={themeColors.icon}
                        style={styles.mh0}
                    />
                    <View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.ml0]} />
                </View>
            )}
            {showAllFields && (
                <>
                    <MenuItemWithTopDescription
                        shouldShowRightIcon={!props.isReadOnly && isTypeRequest}
                        title={props.iouCreated || format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                        description={translate('common.date')}
                        style={[styles.moneyRequestMenuItem, styles.mb2]}
                        titleStyle={styles.flex1}
                        onPress={() => Navigation.navigate(ROUTES.getMoneyRequestCreatedRoute(props.iouType, props.reportID))}
                        disabled={didConfirm || props.isReadOnly || !isTypeRequest}
                    />
                    <MenuItemWithTopDescription
                        shouldShowRightIcon={!props.isReadOnly && isTypeRequest}
                        title={props.iouMerchant}
                        description={translate('common.merchant')}
                        style={[styles.moneyRequestMenuItem, styles.mb2]}
                        titleStyle={styles.flex1}
                        onPress={() => Navigation.navigate(ROUTES.getMoneyRequestMerchantRoute(props.iouType, props.reportID))}
                        disabled={didConfirm || props.isReadOnly || !isTypeRequest}
                    />
                    {!_.isEmpty(props.policyCategories) && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon={!props.isReadOnly}
                            title={props.iouCategory}
                            description={translate('common.category')}
                            onPress={() => Navigation.navigate(ROUTES.getMoneyRequestCategoryRoute(props.iouType, props.reportID))}
                            style={[styles.moneyRequestMenuItem, styles.mb2]}
                            disabled={didConfirm || props.isReadOnly}
                        />
                    )}
                </>
            )}
        </OptionsSelector>
    );
}

MoneyRequestConfirmationList.propTypes = propTypes;
MoneyRequestConfirmationList.defaultProps = defaultProps;

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        policyCategories: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
        },
    }),
)(MoneyRequestConfirmationList);
