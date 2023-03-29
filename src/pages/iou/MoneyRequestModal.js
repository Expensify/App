import _ from 'underscore';
import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import IOUAmountPage from './steps/IOUAmountPage';
import IOUParticipantsPage from './steps/IOUParticipantsPage/IOUParticipantsPage';
import IOUConfirmPage from './steps/IOUConfirmPage';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import Icon from '../../components/Icon';
import * as IOU from '../../libs/actions/IOU';
import * as Expensicons from '../../components/Icon/Expensicons';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import AnimatedStep from '../../components/AnimatedStep';
import ScreenWrapper from '../../components/ScreenWrapper';
import Tooltip from '../../components/Tooltip';
import CONST from '../../CONST';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import withCurrentUserPersonalDetails from '../../components/withCurrentUserPersonalDetails';
import networkPropTypes from '../../components/networkPropTypes';
import {withNetwork} from '../../components/OnyxProvider';
import reportPropTypes from '../reportPropTypes';
import * as ReportUtils from '../../libs/ReportUtils';
import * as ReportScrollManager from '../../libs/ReportScrollManager';

/**
 * IOU modal for requesting money and splitting bills.
 */
const propTypes = {
    /** Whether the IOU is for a single request or a group bill split */
    hasMultipleParticipants: PropTypes.bool,

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string,

    /** The report passed via the route */
    // eslint-disable-next-line react/no-unused-prop-types
    report: reportPropTypes,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({
        /** Whether or not transaction creation has started */
        creatingIOUTransaction: PropTypes.bool,

        /** Whether or not transaction creation has resulted to error */
        error: PropTypes.bool,

        // Selected Currency Code of the current IOU
        selectedCurrencyCode: PropTypes.string,
    }),

    /** Personal details of all the users */
    personalDetails: PropTypes.shape({
        /** Primary login of participant */
        login: PropTypes.string,

        /** Display Name of participant */
        displayName: PropTypes.string,

        /** Avatar url of participant */
        avatar: PropTypes.string,
    }),

    /** Personal details of the current user */
    currentUserPersonalDetails: PropTypes.shape({
        // Local Currency Code of the current user
        localCurrencyCode: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    hasMultipleParticipants: false,
    report: {
        participants: [],
    },
    iouType: CONST.IOU.IOU_TYPE.REQUEST,
    currentUserPersonalDetails: {
        localCurrencyCode: CONST.CURRENCY.USD,
    },
    personalDetails: {},
    iou: {
        creatingIOUTransaction: false,
        error: false,
        selectedCurrencyCode: null,
    },
};

// Determines type of step to display within Modal, value provides the title for that page.
const Steps = {
    IOUAmount: 'iou.amount',
    IOUParticipants: 'iou.participants',
    IOUConfirm: 'iou.confirm',
};

const MoneyRequestModal = (props) => {
    const [previousStepIndex, setPreviousStepIndex] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const reportParticipants = lodashGet(props, 'report.participants', []);
    const participantsWithDetails = _.map(OptionsListUtils.getPersonalDetailsForLogins(reportParticipants, props.personalDetails), personalDetails => ({
        login: personalDetails.login,
        text: personalDetails.displayName,
        firstName: lodashGet(personalDetails, 'firstName', ''),
        lastName: lodashGet(personalDetails, 'lastName', ''),
        alternateText: Str.isSMSLogin(personalDetails.login) ? Str.removeSMSDomain(personalDetails.login) : personalDetails.login,
        icons: [{
            source: ReportUtils.getAvatar(personalDetails.avatar, personalDetails.login),
            name: personalDetails.login,
            type: CONST.ICON_TYPE_AVATAR,
        }],
        keyForList: personalDetails.login,
        payPalMeAddress: lodashGet(personalDetails, 'payPalMeAddress', ''),
        phoneNumber: lodashGet(personalDetails, 'phoneNumber', ''),
    }));
    const [participants, setParticipants] = useState(participantsWithDetails);
    const [amount, setAmount] = useState('');
    const [comment, setComment] = useState('');

    useEffect(() => {
        PersonalDetails.openIOUModalPage();
        IOU.setIOUSelectedCurrency(props.currentUserPersonalDetails.localCurrencyCode);
    }, []);

    useEffect(() => {

    });

    /**
     * Decides our animation type based on whether we're increasing or decreasing
     * our step index.
     * @returns {String}
    */
    function getDirection() {
        if (previousStepIndex < currentStepIndex) {
            return 'in';
        }
        if (previousStepIndex > currentStepIndex) {
            return 'out';
        }

        // Doesn't animate the step when first opening the modal
        if (previousStepIndex === currentStepIndex) {
            return null;
        }
    }

    /**
     * Retrieve title for current step, based upon current step and type of IOU
     *
     * @returns {String}
     */
    function getTitleForStep() {
        const currentStepIndex = currentStepIndex;
        const isSendingMoney = props.iouType === CONST.IOU.IOU_TYPE.SEND;
        if (currentStepIndex === 1 || currentStepIndex === 2) {
            const formattedAmount = props.numberFormat(
                amount, {
                    style: 'currency',
                    currency: props.iou.selectedCurrencyCode,
                },
            );
            if (isSendingMoney) {
                return props.translate('iou.send', {
                    amount: formattedAmount,
                });
            }
            return props.translate(
                props.hasMultipleParticipants ? 'iou.split' : 'iou.request', {
                    amount: formattedAmount,
                },
            );
        }
        if (currentStepIndex === 0) {
            if (isSendingMoney) {
                return props.translate('iou.sendMoney');
            }
            return props.translate(props.hasMultipleParticipants ? 'iou.splitBill' : 'iou.requestMoney');
        }

        return props.translate(this.steps[currentStepIndex]) || '';
    }

    /**
     * Navigate to the next IOU step if possible
     */
    function navigateToPreviousStep() {
        if (currentStepIndex <= 0) {
            return;
        }

        setPreviousStepIndex(currentStepIndex);
        setCurrentStepIndex(currentStepIndex - 1);
    }

    /**
     * Navigate to the previous IOU step if possible
     */
    function navigateToNextStep() {
        if (currentStepIndex >= this.steps.length - 1) {
            return;
        }

        setPreviousStepIndex(currentStepIndex);
        setCurrentStepIndex(currentStepIndex + 1);
    }

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     *
     * @param {String} paymentMethodType
     */
    function sendMoney(paymentMethodType) {
        const formattedAmount = Math.round(amount * 100);
        const currency = props.iou.selectedCurrencyCode;
        const trimmedComment = comment.trim();
        const participant = participants[0];

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            IOU.sendMoneyElsewhere(
                props.report,
                formattedAmount,
                currency,
                trimmedComment,
                props.currentUserPersonalDetails.login,
                participant,
            );
            return;
        }

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
            IOU.sendMoneyViaPaypal(
                props.report,
                formattedAmount,
                currency,
                trimmedComment,
                props.currentUserPersonalDetails.login,
                participant,
            );
            return;
        }

        if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            IOU.sendMoneyWithWallet(
                props.report,
                formattedAmount,
                currency,
                trimmedComment,
                props.currentUserPersonalDetails.login,
                participant,
            );
        }
    }

    /**
     * @param {Array} selectedParticipants
     */
    function createTransaction(selectedParticipants) {
        const reportID = lodashGet(props, 'route.params.reportID', '');
        const trimmedComment = comment.trim();

        // IOUs created from a group report will have a reportID param in the route.
        // Since the user is already viewing the report, we don't need to navigate them to the report
        if (props.hasMultipleParticipants && CONST.REGEX.NUMBER.test(reportID)) {
            IOU.splitBill(
                selectedParticipants,
                props.currentUserPersonalDetails.login,
                amount,
                trimmedComment,
                props.iou.selectedCurrencyCode,
                props.preferredLocale,
                reportID,
            );
            return;
        }

        // If the IOU is created from the global create menu, we also navigate the user to the group report
        if (props.hasMultipleParticipants) {
            IOU.splitBillAndOpenReport(
                selectedParticipants,
                props.currentUserPersonalDetails.login,
                amount,
                trimmedComment,
                props.iou.selectedCurrencyCode,
                props.preferredLocale,
            );
            return;
        }
        IOU.requestMoney(
            props.report,
            Math.round(amount * 100),
            props.iou.selectedCurrencyCode,
            props.currentUserPersonalDetails.login,
            selectedParticipants[0],
            trimmedComment,
        );
    }

    return (
        <div>
            <h1>Money Request Modal</h1>
        </div>
    );
};

MoneyRequestModal.displayName = 'MoneyRequestModal';
MoneyRequestModal.propTypes = propTypes;
MoneyRequestModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withCurrentUserPersonalDetails,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '')}`,
        },
        iou: {
            key: ONYXKEYS.IOU,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(MoneyRequestModal);
