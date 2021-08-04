import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import {withSafeAreaInsets} from 'react-native-safe-area-context';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import styles from '../styles/styles';
import Text from './Text';
import themeColors from '../styles/themes/default';
import {
    getIOUConfirmationOptionsFromMyPersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
} from '../libs/OptionsListUtils';
import OptionsList from './OptionsList';
import ONYXKEYS from '../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import SafeAreaInsetPropTypes from '../pages/SafeAreaInsetPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import FixedFooter from './FixedFooter';
import CONST from '../CONST';
import ButtonWithMenu from './ButtonWithMenu';
import {
    Cash, Wallet, Venmo, PayPal,
} from './Icon/Expensicons';
import Permissions from '../libs/Permissions';
import isAppInstalled from '../libs/isAppInstalled/index.native';
import Button from './Button';

const propTypes = {
    /** Callback to inform parent modal of success */
    onConfirm: PropTypes.func.isRequired,

    // Callback to update comment from IOUModal
    onUpdateComment: PropTypes.func,

    /** Comment value from IOUModal */
    comment: PropTypes.string,

    /** Should we request a single or multiple participant selection from user */
    hasMultipleParticipants: PropTypes.bool.isRequired,

    /** Safe area insets required for mobile devices margins */
    insets: SafeAreaInsetPropTypes.isRequired,

    /** IOU amount */
    iouAmount: PropTypes.string.isRequired,

    /** IOU type */
    iouType: PropTypes.string,

    // Selected participants from IOUModal with login
    participants: PropTypes.arrayOf(PropTypes.shape({
        login: PropTypes.string.isRequired,
        alternateText: PropTypes.string,
        hasDraftComment: PropTypes.bool,
        icons: PropTypes.arrayOf(PropTypes.string),
        searchText: PropTypes.string,
        text: PropTypes.string,
        keyForList: PropTypes.string,
        isPinned: PropTypes.bool,
        isUnread: PropTypes.bool,
        reportID: PropTypes.number,
        participantsList: PropTypes.arrayOf(PropTypes.object),
    })).isRequired,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    /* Onyx Props */

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape({

        /** Display name of the current user from their personal details */
        displayName: PropTypes.string,

        /** Avatar URL of the current user from their personal details */
        avatar: PropTypes.string,

        /** Primary login of the user */
        login: PropTypes.string,
    }),

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({

        /** Whether or not the IOU step is loading (creating the IOU Report) */
        loading: PropTypes.bool,

        // Selected Currency Code of the current IOU
        selectedCurrencyCode: PropTypes.string,
    }),

    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** Whether or not the user is subscribed to news updates */
        loginList: PropTypes.arrayOf(PropTypes.shape({

            /** Phone/Email associated with user */
            partnerUserID: PropTypes.string,
        })),
    }),

    /** User's paypal.me username if they have one */
    payPalMeUsername: PropTypes.string,

    /** Current user session */
    session: PropTypes.shape({
        email: PropTypes.string.isRequired,
    }).isRequired,
};

const defaultProps = {
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
    onUpdateComment: null,
    comment: '',
    network: {},
    myPersonalDetails: {},
    user: {},
    iouType: 'request',
    payPalMeUsername: '',
};

// Gives minimum height to offset the height of
// button and comment box
const MINIMUM_BOTTOM_OFFSET = 240;

class IOUConfirmationList extends Component {
    constructor(props) {
        super(props);
        this.isComponentMounted = false;
        this.userPhoneNumber = this.getPhoneNumber(props.user.loginList) ?? '';
        const formattedParticipants = _.map(this.getParticipantsWithAmount(this.props.participants), participant => ({
            ...participant, selected: true,
        }));

        // If it's a send money request, then add the manual settlement option
        const defaultText = props.iouType === 'send' ? {text: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, icon: Cash} : {
            text: this.props.translate(this.props.hasMultipleParticipants ? 'iou.split' : 'iou.request', {
                amount: this.props.numberFormat(
                    this.props.iouAmount,
                    {style: 'currency', currency: this.props.iou.selectedCurrencyCode},
                ),
            }),
        };
        this.state = {
            paymentOptions: [defaultText],
            participants: formattedParticipants,
        };

        this.toggleOption = this.toggleOption.bind(this);
        this.onPress = this.onPress.bind(this);
    }

    componentDidMount() {
        this.isComponentMounted = true;
        this.setConfirmationButtonOptions();
    }

    onPress() {
        if (this.props.iouType === 'send') {
            this.props.onConfirm();
        } else {
            this.props.onConfirm(this.getSplits());
        }
    }

    /**
     * Get selected participants
     * @returns {Array}
     */
    getSelectedParticipants() {
        return _.filter(this.state.participants, participant => participant.selected);
    }

    /**
     * Get unselected participants
     * @returns {Array}
     */
    getUnselectedParticipants() {
        return _.filter(this.state.participants, participant => !participant.selected);
    }

    /**
     * Returns the participants with amount
     * @param {Array} participants
     * @returns {Array}
     */
    getParticipantsWithAmount(participants) {
        return getIOUConfirmationOptionsFromParticipants(
            participants,
            this.props.numberFormat(this.calculateAmount(participants) / 100, {
                style: 'currency',
                currency: this.props.iou.selectedCurrencyCode,
            }),
        );
    }

    /**
     * Returns the participants without amount
     * @param {Array} participants
     * @returns {Array}
     */
    getParticipantsWithoutAmount(participants) {
        return _.map(participants, option => _.omit(option, 'descriptiveText'));
    }

    /**
     * Returns the sections needed for the OptionsSelector
     * @param {Boolean} maxParticipantsReached
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        if (this.props.hasMultipleParticipants) {
            const selectedParticipants = this.getSelectedParticipants();
            const unselectedParticipants = this.getUnselectedParticipants();

            const formattedSelectedParticipants = this.getParticipantsWithAmount(selectedParticipants);
            const formattedUnselectedParticipants = this.getParticipantsWithoutAmount(unselectedParticipants);

            const formattedMyPersonalDetails = getIOUConfirmationOptionsFromMyPersonalDetail(
                this.props.myPersonalDetails,
                this.props.numberFormat(this.calculateAmount(selectedParticipants, true) / 100, {
                    style: 'currency',
                    currency: this.props.iou.selectedCurrencyCode,
                }),
            );

            sections.push({
                title: this.props.translate('iOUConfirmationList.whoPaid'),
                data: [formattedMyPersonalDetails],
                shouldShow: true,
                indexOffset: 0,
            }, {
                title: this.props.translate('iOUConfirmationList.whoWasThere'),
                data: formattedSelectedParticipants,
                shouldShow: true,
                indexOffset: 0,
            }, {
                title: undefined,
                data: formattedUnselectedParticipants,
                shouldShow: !_.isEmpty(formattedUnselectedParticipants),
                indexOffset: 0,
            });
        } else {
            const formattedParticipants = getIOUConfirmationOptionsFromParticipants(this.props.participants,
                this.props.numberFormat(this.props.iouAmount, {
                    style: 'currency',
                    currency: this.props.iou.selectedCurrencyCode,
                }));

            sections.push({
                title: this.props.translate('common.to').toUpperCase(),
                data: formattedParticipants,
                shouldShow: true,
                indexOffset: 0,
            });
        }
        return sections;
    }

    /**
     * Gets splits for the transaction
     * @returns {Array|null}
     */
    getSplits() {
        // There can only be splits when there are multiple participants, so return early when there are not
        // multiple participants
        if (!this.props.hasMultipleParticipants) {
            return null;
        }
        const selectedParticipants = this.getSelectedParticipants();
        const splits = _.map(selectedParticipants, participant => ({
            email: participant.login,

            // We should send in cents to API
            // Cents is temporary and there must be support for other currencies in the future
            amount: this.calculateAmount(selectedParticipants),
        }));

        splits.push({
            email: this.props.myPersonalDetails.login,

            // The user is default and we should send in cents to API
            // USD is temporary and there must be support for other currencies in the future
            amount: this.calculateAmount(selectedParticipants, true),
        });
        return splits;
    }

    /**
     * Returns selected options -- there is checkmark for every row in List for split flow
     * @returns {Array}
     */
    getSelectedOptions() {
        if (!this.props.hasMultipleParticipants) {
            return [];
        }
        const selectedParticipants = this.getSelectedParticipants();
        return [
            ...selectedParticipants,
            getIOUConfirmationOptionsFromMyPersonalDetail(this.props.myPersonalDetails),
        ];
    }


    /**
     * Sets the payment confirmation button options
     */
    setConfirmationButtonOptions() {
        if (this.props.iouType !== 'send') {
            return;
        }

        // Add the Expensify Wallet option if available and make it the first option
        if (this.props.localCurrencyCode === CONST.CURRENCY.USD || Permissions.canUsePayWithExpensify(this.props.betas)) {
            this.setState(prevState => ({
                paymentOptions: [{text: CONST.IOU.PAYMENT_TYPE.EXPENSIFY, icon: Wallet}, ...prevState.paymentOptions],
            }));
        }

        // Add PayPal option
        if (this.props.payPalMeUsername) {
            this.setState(prevState => ({
                paymentOptions: [...prevState.paymentOptions, {text: CONST.IOU.PAYMENT_TYPE.PAYPAL_ME, icon: PayPal}],
            }));
        }

        // Add Venmo option
        if (this.props.localCurrencyCode === CONST.CURRENCY.USD && this.isValidUSPhone(this.userPhoneNumber)) {
            isAppInstalled('venmo')
                .then((isVenmoInstalled) => {
                    // We will return early if the component has unmounted before the async call resolves. This prevents
                    // setting state on unmounted components which prints noisy warnings in the console.
                    if (!isVenmoInstalled || !this.isComponentMounted) {
                        return;
                    }

                    this.setState(prevState => ({
                        paymentOptions:
                            [...prevState.paymentOptions, {text: CONST.IOU.PAYMENT_TYPE.VENMO, icon: Venmo}],
                    }));
                });
        }
    }

    /**
     * Gets the user's phone number from their secondary login.
     * Returns null if it doesn't exist.
     * @param {Array<Object>} loginList
     *
     * @returns {String|null}
     */
    getPhoneNumber(loginList) {
        const secondaryLogin = _.find(loginList, login => Str.isSMSLogin(login.partnerUserID));
        return secondaryLogin ? Str.removeSMSDomain(secondaryLogin.partnerUserID) : null;
    }

    /**
     * @param {String} phoneNumber
     * @returns {Boolean}
     */
    isValidUSPhone(phoneNumber) {
        // Remove alphanumeric characters and validate that this is in fact a phone number
        return CONST.REGEX.PHONE_E164_PLUS.test(phoneNumber.replace(CONST.REGEX.NON_ALPHA_NUMERIC, ''))

            // Next make sure it's a US phone number
            && CONST.REGEX.US_PHONE.test(phoneNumber);
    }

    /**
     * Calculates the amount per user given a list of participants
     * @param {Array} participants
     * @param {Boolean} isDefaultUser
     * @returns {Number}
     */
    calculateAmount(participants, isDefaultUser = false) {
        // Convert to cents before working with iouAmount to avoid
        // javascript subtraction with decimal problem -- when dealing with decimals,
        // because they are encoded as IEEE 754 floating point numbers, some of the decimal
        // numbers cannot be represented with perfect accuracy.
        // Cents is temporary and there must be support for other currencies in the future
        const iouAmount = Math.round(parseFloat(this.props.iouAmount * 100));
        const totalParticipants = participants.length + 1;
        const amountPerPerson = Math.round(iouAmount / totalParticipants);

        if (!isDefaultUser) { return amountPerPerson; }

        const sumAmount = amountPerPerson * totalParticipants;
        const difference = iouAmount - sumAmount;

        return iouAmount !== sumAmount ? (amountPerPerson + difference) : amountPerPerson;
    }

    /**
    * Toggle selected option's selected prop.
    * @param {Object} option
    */
    toggleOption(option) {
        // Return early if selected option is currently logged in user.
        if (option.login === this.props.session.email) {
            return;
        }

        this.setState((prevState) => {
            const newParticipants = _.reject(prevState.participants, participant => (
                participant.login === option.login
            ));

            newParticipants.push({
                ...option,
                selected: !option.selected,
            });
            return {participants: newParticipants};
        });
    }

    render() {
        const hoverStyle = this.props.hasMultipleParticipants ? styles.hoveredComponentBG : {};
        const toggleOption = this.props.hasMultipleParticipants ? this.toggleOption : undefined;
        const selectedParticipants = this.getSelectedParticipants();
        return (
            <>
                <ScrollView style={[styles.flex1, styles.w100]}>
                    <OptionsList
                        listContainerStyles={[{
                            // Give max height to the list container so that it does not extend
                            // beyond the comment view as well as button
                            maxHeight: this.props.windowHeight - MINIMUM_BOTTOM_OFFSET
                                - this.props.insets.top - this.props.insets.bottom,
                        }]}
                        sections={this.getSections()}
                        disableArrowKeysActions
                        disableFocusOptions
                        hideAdditionalOptionStates
                        forceTextUnreadStyle
                        canSelectMultipleOptions={this.props.hasMultipleParticipants}
                        selectedOptions={this.getSelectedOptions()}
                        onSelectRow={toggleOption}
                        disableRowInteractivity={!this.props.hasMultipleParticipants}
                        optionHoveredStyle={hoverStyle}
                    />
                    <Text style={[styles.p5, styles.textMicroBold, styles.colorHeading]}>
                        {this.props.translate('iOUConfirmationList.whatsItFor')}
                    </Text>
                    <View style={[styles.ph5, styles.pb5]}>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.props.comment}
                            onChangeText={this.props.onUpdateComment}
                            placeholder={this.props.translate('common.optional')}
                            placeholderTextColor={themeColors.placeholderText}
                            autoFocus
                        />
                    </View>
                </ScrollView>
                <FixedFooter>
                    {this.props.network.isOffline && (
                        <Text style={[styles.formError, styles.pb2]}>
                            {this.props.translate('session.offlineMessage')}
                        </Text>
                    )}
                    <ButtonWithMenu
                        options={this.state.paymentOptions}
                        isDisabled={selectedParticipants.length === 0 || this.props.network.isOffline}
                        isLoading={this.props.iou.loading && !this.props.network.isOffline}
                        onPress={this.onPress}
                    />
                </FixedFooter>
            </>
        );
    }
}

IOUConfirmationList.displayName = 'IOUConfirmPage';
IOUConfirmationList.propTypes = propTypes;
IOUConfirmationList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withSafeAreaInsets,
    withWindowDimensions,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
        network: {
            key: ONYXKEYS.NETWORK,
        },
        user: {
            key: ONYXKEYS.USER,
        },
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(IOUConfirmationList);
