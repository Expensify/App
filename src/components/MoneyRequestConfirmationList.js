import React, {useState, useCallback, useMemo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import styles from '../styles/styles';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import OptionsSelector from './OptionsSelector';
import ONYXKEYS from '../ONYXKEYS';
import compose from '../libs/compose';
import CONST from '../CONST';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import Log from '../libs/Log';
import SettlementButton from './SettlementButton';
import ROUTES from '../ROUTES';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from './withCurrentUserPersonalDetails';
import * as IOUUtils from '../libs/IOUUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Navigation from '../libs/Navigation/Navigation';
import optionPropTypes from './optionPropTypes';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import Image from './Image';
import ReceiptHTML from '../../assets/images/receipt-html.png';
import ReceiptDoc from '../../assets/images/receipt-doc.png';
import ReceiptGeneric from '../../assets/images/receipt-generic.png';
import ReceiptSVG from '../../assets/images/receipt-svg.png';
import * as FileUtils from '../libs/fileDownload/FileUtils';
import useLocalize from '../hooks/useLocalize';

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

    /* Onyx Props */

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }),

    /** The policyID of the request */
    policyID: PropTypes.string,

    /** The reportID of the request */
    reportID: PropTypes.string,
};

const defaultProps = {
    onConfirm: () => {},
    onSendMoney: () => {},
    onSelectParticipant: () => {},
    iouType: CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
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
};

function MoneyRequestConfirmationList({
    onConfirm,
    onSendMoney,
    onSelectParticipant,
    hasMultipleParticipants,
    iouAmount,
    iouComment,
    iouCurrencyCode,
    iouType,
    selectedParticipants,
    canModifyParticipants,
    isReadOnly,
    bankAccountRoute,
    policyID,
    reportID,
    session,
    currentUserPersonalDetails,
    payeePersonalDetails,
    receiptPath,
    receiptSource,
}) {
    const {translate} = useLocalize();

    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    const getParticipantsWithAmount = useCallback(
        (participantsList) => {
            const ammount = IOUUtils.calculateAmount(participantsList.length, iouAmount);
            return OptionsListUtils.getIOUConfirmationOptionsFromParticipants(participantsList, CurrencyUtils.convertToDisplayString(ammount, iouCurrencyCode));
        },
        [iouAmount, iouCurrencyCode],
    );

    const [didConfirm, setDidConfirm] = useState(false);

    const splitOrRequestOptions = useMemo(() => {
        const text = receiptPath
            ? translate('iou.request')
            : translate(hasMultipleParticipants ? 'iou.splitAmount' : 'iou.requestAmount', {
                  amount: CurrencyUtils.convertToDisplayString(iouAmount, iouCurrencyCode),
              });
        return [
            {
                text: text[0].toUpperCase() + text.slice(1),
                value: hasMultipleParticipants ? CONST.IOU.MONEY_REQUEST_TYPE.SPLIT : CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
            },
        ];
    }, [hasMultipleParticipants, iouAmount, receiptPath, iouCurrencyCode, translate]);

    const memoSelectedParticipants = useMemo(() => _.filter(selectedParticipants, (participant) => participant.selected), [selectedParticipants]);
    const memoPayeePersonalDetails = useMemo(() => payeePersonalDetails || currentUserPersonalDetails, [payeePersonalDetails, currentUserPersonalDetails]);
    const shouldDisablePaidBySection = canModifyParticipants;

    const optionSelectorSections = useMemo(() => {
        const sections = [];
        const unselectedParticipants = _.filter(memoSelectedParticipants, (participant) => !participant.selected);
        if (hasMultipleParticipants) {
            const formattedSelectedParticipants = getParticipantsWithAmount(memoSelectedParticipants);
            const formattedParticipantsList = _.union(formattedSelectedParticipants, unselectedParticipants);

            const myIOUAmount = IOUUtils.calculateAmount(memoSelectedParticipants.length, iouAmount, true);
            const formattedPayeeOption = OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(
                memoPayeePersonalDetails,
                CurrencyUtils.convertToDisplayString(myIOUAmount, iouCurrencyCode),
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
            sections.push({
                title: translate('common.to'),
                data: memoSelectedParticipants,
                shouldShow: true,
                indexOffset: 0,
            });
        }
        return sections;
    }, [memoSelectedParticipants, hasMultipleParticipants, iouAmount, iouCurrencyCode, getParticipantsWithAmount, memoPayeePersonalDetails, translate, shouldDisablePaidBySection]);

    const selectedOptions = useMemo(() => {
        if (!hasMultipleParticipants) {
            return [];
        }
        return [...memoSelectedParticipants, OptionsListUtils.getIOUConfirmationOptionsFromPayeePersonalDetail(payeePersonalDetails)];
    }, [memoSelectedParticipants, hasMultipleParticipants, memoPayeePersonalDetails]);

    /**
     * @param {Object} option
     */
    const selectParticipant = useCallback(
        (option) => {
            // Return early if selected option is currently logged in user.
            if (option.accountID === session.accountID) {
                return;
            }
            onSelectParticipant(option);
        },
        [session.accountID, onSelectParticipant],
    );

    /**
     * Navigate to profile of selected user
     * @param {Object} option
     */
    const navigateToUserDetail = (option) => {
        if (!option.accountID) {
            return;
        }
        Navigation.navigate(ROUTES.getProfileRoute(option.accountID));
    };

    /**
     * @param {String} paymentMethod
     */
    const confirm = useCallback(
        (paymentMethod) => {
            setDidConfirm(true);

            if (_.isEmpty(memoSelectedParticipants)) {
                return;
            }

            if (iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND) {
                if (!paymentMethod) {
                    return;
                }

                Log.info(`[IOU] Sending money via: ${paymentMethod}`);
                onSendMoney(paymentMethod);
            } else {
                onConfirm(memoSelectedParticipants);
            }
        },
        [memoSelectedParticipants, onSendMoney, onConfirm, iouType],
    );

    const formattedAmount = CurrencyUtils.convertToDisplayString(iouAmount, iouCurrencyCode);

    const footerContent = useMemo(() => {
        if (isReadOnly) {
            return;
        }

        const shouldShowSettlementButton = iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND;
        const shouldDisableButton = memoSelectedParticipants.length === 0;
        const recipient = memoSelectedParticipants[0] || {};

        return shouldShowSettlementButton ? (
            <SettlementButton
                isDisabled={shouldDisableButton}
                onPress={confirm}
                shouldShowPaypal={Boolean(recipient && recipient.payPalMeAddress)}
                enablePaymentsRoute={ROUTES.IOU_SEND_ENABLE_PAYMENTS}
                addBankAccountRoute={bankAccountRoute}
                addDebitCardRoute={ROUTES.IOU_SEND_ADD_DEBIT_CARD}
                currency={iouCurrencyCode}
                policyID={policyID}
                shouldShowPaymentOptions
            />
        ) : (
            <ButtonWithDropdownMenu
                isDisabled={shouldDisableButton}
                onPress={(_event, value) => confirm(value)}
                options={splitOrRequestOptions}
            />
        );
    }, [confirm, memoSelectedParticipants, bankAccountRoute, iouCurrencyCode, iouType, isReadOnly, policyID, splitOrRequestOptions]);

    /**
     * Grab the appropriate image URI based on file type
     *
     * @param {String} receiptPath
     * @param {String} receiptSource
     * @returns {*}
     */
    const getImageURI = () => {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(receiptSource);
        const isReceiptImage = Str.isImage(receiptSource);

        if (isReceiptImage) {
            return receiptPath;
        }

        if (fileExtension === 'html') {
            return ReceiptHTML;
        }

        if (fileExtension === 'doc' || fileExtension === 'docx') {
            return ReceiptDoc;
        }

        if (fileExtension === 'svg') {
            return ReceiptSVG;
        }

        return ReceiptGeneric;
    };

    return (
        <OptionsSelector
            sections={optionSelectorSections}
            value=""
            onSelectRow={canModifyParticipants ? selectParticipant : navigateToUserDetail}
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
            {receiptPath && (
                <Image
                    style={styles.moneyRequestImage}
                    source={{uri: getImageURI()}}
                />
            )}
            {!receiptPath && (
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!isReadOnly}
                    title={formattedAmount}
                    description={translate('iou.amount')}
                    onPress={() => Navigation.navigate(ROUTES.getMoneyRequestAmountRoute(iouType, reportID))}
                    style={[styles.moneyRequestMenuItem, styles.mt2]}
                    titleStyle={styles.moneyRequestConfirmationAmount}
                    disabled={didConfirm || isReadOnly}
                />
            )}
            <MenuItemWithTopDescription
                shouldShowRightIcon={!isReadOnly}
                title={iouComment}
                description={translate('common.description')}
                onPress={() => Navigation.navigate(ROUTES.getMoneyRequestDescriptionRoute(iouType, reportID))}
                style={[styles.moneyRequestMenuItem, styles.mb2]}
                disabled={didConfirm || isReadOnly}
            />
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
    }),
)(MoneyRequestConfirmationList);
