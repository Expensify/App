import _ from 'underscore';
import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import MoneyRequestAmountPage from './steps/MoneyRequestAmountPage';
import MoneyRequestParticipantsPage from './steps/MoneyRequstParticipantsPage/MoneyRequestParticipantsPage';
import MoneyRequestConfirmPage from './steps/MoneyRequestConfirmPage';
import ModalHeader from './ModalHeader';
import styles from '../../styles/styles';
import * as IOU from '../../libs/actions/IOU';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import AnimatedStep from '../../components/AnimatedStep';
import ScreenWrapper from '../../components/ScreenWrapper';
import CONST from '../../CONST';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import withCurrentUserPersonalDetails from '../../components/withCurrentUserPersonalDetails';
import reportPropTypes from '../reportPropTypes';
import * as ReportUtils from '../../libs/ReportUtils';
import * as ReportScrollManager from '../../libs/ReportScrollManager';
import useOnNetworkReconnect from '../../components/hooks/useOnNetworkReconnect';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import * as CurrencyUtils from '../../libs/CurrencyUtils';

/**
 * A modal used for requesting money, splitting bills or sending money.
 */
const propTypes = {
    /** Whether the request is for a single request or a group bill split */
    hasMultipleParticipants: PropTypes.bool,

    /** The type of IOU report, i.e. bill, request, send */
    iouType: PropTypes.string,

    /** The report passed via the route */
    // eslint-disable-next-line react/no-unused-prop-types
    report: reportPropTypes,

    // Holds data related to request view state, rather than the underlying request data.
    iou: PropTypes.shape({
        /** Whether or not transaction creation has started */
        creatingIOUTransaction: PropTypes.bool,

        /** Whether or not transaction creation has resulted to error */
        error: PropTypes.bool,

        // Selected Currency Code of the current request
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
    iouType: CONST.IOU.MONEY_REQUEST_TYPE.REQUEST,
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
    MoneyRequestAmount: 'moneyRequest.amount',
    MoneyRequestParticipants: 'moneyRequest.participants',
    MoneyRequestConfirm: 'moneyRequest.confirm',
};

const MoneyRequestModal = (props) => {
    // Skip MoneyRequestParticipants step if participants are passed in
    const reportParticipants = lodashGet(props, 'report.participants', []);
    const steps = useMemo(
        () => (reportParticipants.length ? [Steps.MoneyRequestAmount, Steps.MoneyRequestConfirm] : [Steps.MoneyRequestAmount, Steps.MoneyRequestParticipants, Steps.MoneyRequestConfirm]),
        [reportParticipants.length],
    );
    const prevCreatingIOUTransactionStatusRef = useRef(lodashGet(props.iou, 'creatingIOUTransaction'));

    const [previousStepIndex, setPreviousStepIndex] = useState(-1);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState(
        ReportUtils.isPolicyExpenseChat(props.report)
            ? OptionsListUtils.getPolicyExpenseReportOptions(props.report)
            : OptionsListUtils.getParticipantsOptions(props.report, props.personalDetails),
    );
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        PersonalDetails.openMoneyRequestModalPage();
        IOU.setIOUSelectedCurrency(props.currentUserPersonalDetails.localCurrencyCode);
        IOU.setMoneyRequestDescription('');
        // eslint-disable-next-line react-hooks/exhaustive-deps -- props.currentUserPersonalDetails will always exist from Onyx and we don't want this effect to run again
    }, []);

    useEffect(() => {
        // We only want to check if we just finished creating an IOU transaction
        // We check it within this effect because we're sending the request optimistically but if an error occurs from the API, we will update the iou state with the error later
        if (!prevCreatingIOUTransactionStatusRef.current || lodashGet(props.iou, 'creatingIOUTransaction')) {
            return;
        }

        if (lodashGet(props.iou, 'error') === true) {
            setCurrentStepIndex(0);
        } else {
            Navigation.dismissModal();
        }
    }, [props.iou]);

    // User came back online, so let's refetch the currency details based on location
    useOnNetworkReconnect(PersonalDetails.openMoneyRequestModalPage);

    useEffect(() => {
        // Used to store previous prop values to compare on next render
        prevCreatingIOUTransactionStatusRef.current = lodashGet(props.iou, 'creatingIOUTransaction');
    });

    /**
     * Decides our animation type based on whether we're increasing or decreasing
     * our step index.
     * @returns {String|null}
     */
    const direction = useMemo(() => {
        // If we're going to the "amount" step from the "confirm" step, push it in and pop it out like we're moving
        // forward instead of backwards.
        const amountIndex = _.indexOf(steps, Steps.MoneyRequestAmount);
        const confirmIndex = _.indexOf(steps, Steps.MoneyRequestConfirm);
        if (previousStepIndex === confirmIndex && currentStepIndex === amountIndex) {
            return 'in';
        }
        if (previousStepIndex === amountIndex && currentStepIndex === confirmIndex) {
            return 'out';
        }

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
    }, [previousStepIndex, currentStepIndex, steps]);

    /**
     * Retrieve title for current step, based upon current step and type of request
     *
     * @returns {String}
     */
    const titleForStep = useMemo(() => {
        if (currentStepIndex === 0) {
            const confirmIndex = _.indexOf(steps, Steps.MoneyRequestConfirm);
            if (previousStepIndex === confirmIndex) {
                return props.translate('iou.amount');
            }
            if (props.iouType === CONST.IOU.MONEY_REQUEST_TYPE.SEND) {
                return props.translate('iou.sendMoney');
            }
            return props.translate(props.hasMultipleParticipants ? 'iou.splitBill' : 'iou.requestMoney');
        }
        return props.translate('iou.cash');
        // eslint-disable-next-line react-hooks/exhaustive-deps -- props does not need to be a dependency as it will always exist
    }, [currentStepIndex, props.translate, steps]);

    /**
     * Navigate to a provided step.
     *
     * @param {Number} stepIndex
     * @type {(function(*): void)|*}
     */
    const navigateToStep = useCallback(
        (stepIndex) => {
            if (stepIndex < 0 || stepIndex > steps.length) {
                return;
            }

            if (currentStepIndex === stepIndex) {
                return;
            }

            setPreviousStepIndex(currentStepIndex);
            setCurrentStepIndex(stepIndex);
        },
        [currentStepIndex, steps.length],
    );

    /**
     * Navigate to the previous request step if possible
     */
    const navigateToPreviousStep = useCallback(() => {
        if (currentStepIndex <= 0 && previousStepIndex < 0) {
            return;
        }

        setPreviousStepIndex(currentStepIndex);
        setCurrentStepIndex(currentStepIndex - 1);
    }, [currentStepIndex, previousStepIndex]);

    /**
     * Navigate to the next request step if possible
     */
    const navigateToNextStep = useCallback(() => {
        if (currentStepIndex >= steps.length - 1) {
            return;
        }

        // If we're coming from the confirm step, it means we were editing something so go back to the confirm step.
        const confirmIndex = _.indexOf(steps, Steps.MoneyRequestConfirm);
        if (previousStepIndex === confirmIndex) {
            navigateToStep(confirmIndex);
            return;
        }

        setPreviousStepIndex(currentStepIndex);
        setCurrentStepIndex(currentStepIndex + 1);
    }, [currentStepIndex, previousStepIndex, navigateToStep, steps]);

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     *
     * @param {String} paymentMethodType
     */
    const sendMoney = useCallback(
        (paymentMethodType) => {
            const currency = props.iou.selectedCurrencyCode;
            const trimmedComment = props.iou.comment.trim();
            const participant = selectedOptions[0];

            if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                IOU.sendMoneyElsewhere(props.report, amount, currency, trimmedComment, props.currentUserPersonalDetails.login, participant);
                return;
            }

            if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
                IOU.sendMoneyViaPaypal(props.report, amount, currency, trimmedComment, props.currentUserPersonalDetails.login, participant);
                return;
            }

            if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                IOU.sendMoneyWithWallet(props.report, amount, currency, trimmedComment, props.currentUserPersonalDetails.login, participant);
            }
        },
        [amount, props.iou.comment, selectedOptions, props.currentUserPersonalDetails.login, props.iou.selectedCurrencyCode, props.report],
    );

    /**
     * @param {Array} selectedParticipants
     */
    const createTransaction = useCallback(
        (selectedParticipants) => {
            const reportID = lodashGet(props.route, 'params.reportID', '');
            const trimmedComment = props.iou.comment.trim();

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (props.hasMultipleParticipants && CONST.REGEX.NUMBER.test(reportID)) {
                IOU.splitBill(selectedParticipants, props.currentUserPersonalDetails.login, amount, trimmedComment, props.iou.selectedCurrencyCode, reportID);
                return;
            }

            // If the request is created from the global create menu, we also navigate the user to the group report
            if (props.hasMultipleParticipants) {
                IOU.splitBillAndOpenReport(selectedParticipants, props.currentUserPersonalDetails.login, amount, trimmedComment, props.iou.selectedCurrencyCode);
                return;
            }
            if (!selectedParticipants[0].login) {
                // TODO - request to the policy expense chat. Not implemented yet!
                // Will be implemented here: https://github.com/Expensify/Expensify/issues/270581
                return;
            }
            IOU.requestMoney(props.report, amount, props.iou.selectedCurrencyCode, props.currentUserPersonalDetails.login, selectedParticipants[0], trimmedComment);
        },
        [amount, props.iou.comment, props.currentUserPersonalDetails.login, props.hasMultipleParticipants, props.iou.selectedCurrencyCode, props.report, props.route],
    );

    const currentStep = steps[currentStepIndex];
    const moneyRequestStepIndex = _.indexOf(steps, Steps.MoneyRequestConfirm);
    const isEditingAmountAfterConfirm = currentStepIndex === 0 && previousStepIndex === _.indexOf(steps, Steps.MoneyRequestConfirm);
    const reportID = lodashGet(props, 'route.params.reportID', '');
    const shouldShowBackButton = currentStepIndex > 0 || isEditingAmountAfterConfirm;
    const modalHeader = (
        <ModalHeader
            title={titleForStep}
            shouldShowBackButton={shouldShowBackButton}
            onBackButtonPress={isEditingAmountAfterConfirm ? () => navigateToStep(moneyRequestStepIndex) : navigateToPreviousStep}
        />
    );
    const amountButtonText = isEditingAmountAfterConfirm ? props.translate('common.save') : props.translate('common.next');
    const enableMaxHeight = DeviceCapabilities.canUseTouchScreen() && currentStep === Steps.MoneyRequestParticipants;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={enableMaxHeight}
        >
            {({didScreenTransitionEnd, safeAreaPaddingBottomStyle}) => (
                <>
                    <View style={[styles.pRelative, styles.flex1]}>
                        {!didScreenTransitionEnd && <FullScreenLoadingIndicator />}
                        {didScreenTransitionEnd && (
                            <>
                                {currentStep === Steps.MoneyRequestAmount && (
                                    <AnimatedStep
                                        direction={direction}
                                        style={[styles.flex1, safeAreaPaddingBottomStyle]}
                                    >
                                        {modalHeader}
                                        <MoneyRequestAmountPage
                                            onStepComplete={(value) => {
                                                const amountInSmallestCurrencyUnits = CurrencyUtils.convertToSmallestUnit(props.iou.selectedCurrencyCode, Number.parseFloat(value));
                                                setAmount(amountInSmallestCurrencyUnits);
                                                navigateToNextStep();
                                            }}
                                            reportID={reportID}
                                            hasMultipleParticipants={props.hasMultipleParticipants}
                                            selectedAmount={CurrencyUtils.convertToWholeUnit(props.iou.selectedCurrencyCode, amount)}
                                            navigation={props.navigation}
                                            iouType={props.iouType}
                                            buttonText={amountButtonText}
                                        />
                                    </AnimatedStep>
                                )}
                                {currentStep === Steps.MoneyRequestParticipants && (
                                    <AnimatedStep
                                        style={[styles.flex1]}
                                        direction={direction}
                                    >
                                        {modalHeader}
                                        <MoneyRequestParticipantsPage
                                            participants={selectedOptions}
                                            hasMultipleParticipants={props.hasMultipleParticipants}
                                            onAddParticipants={setSelectedOptions}
                                            onStepComplete={navigateToNextStep}
                                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                                            iouType={props.iouType}
                                        />
                                    </AnimatedStep>
                                )}
                                {currentStep === Steps.MoneyRequestConfirm && (
                                    <AnimatedStep
                                        style={[styles.flex1, safeAreaPaddingBottomStyle]}
                                        direction={direction}
                                    >
                                        {modalHeader}
                                        <MoneyRequestConfirmPage
                                            onConfirm={(selectedParticipants) => {
                                                // TODO: ADD HANDLING TO DISABLE BUTTON FUNCTIONALITY WHILE REQUEST IS IN FLIGHT
                                                createTransaction(selectedParticipants);
                                                ReportScrollManager.scrollToBottom();
                                            }}
                                            onSendMoney={(paymentMethodType) => {
                                                // TODO: ADD HANDLING TO DISABLE BUTTON FUNCTIONALITY WHILE REQUEST IS IN FLIGHT
                                                sendMoney(paymentMethodType);
                                                ReportScrollManager.scrollToBottom();
                                            }}
                                            hasMultipleParticipants={props.hasMultipleParticipants}
                                            participants={_.filter(selectedOptions, (email) => props.currentUserPersonalDetails.login !== email.login)}
                                            iouAmount={amount}
                                            iouType={props.iouType}
                                            // The participants can only be modified when the action is initiated from directly within a group chat and not the floating-action-button.
                                            // This is because when there is a group of people, say they are on a trip, and you have some shared expenses with some of the people,
                                            // but not all of them (maybe someone skipped out on dinner). Then it's nice to be able to select/deselect people from the group chat bill
                                            // split rather than forcing the user to create a new group, just for that expense. The reportID is empty, when the action was initiated from
                                            // the floating-action-button (since it is something that exists outside the context of a report).
                                            canModifyParticipants={!_.isEmpty(reportID)}
                                            navigateToStep={navigateToStep}
                                        />
                                    </AnimatedStep>
                                )}
                            </>
                        )}
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
};

MoneyRequestModal.displayName = 'MoneyRequestModal';
MoneyRequestModal.propTypes = propTypes;
MoneyRequestModal.defaultProps = defaultProps;

export default compose(
    withLocalize,
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
