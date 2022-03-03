import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import colors from '../../../styles/colors';
import * as Expensicons from '../../../components/Icon/Expensicons';
import Icon from '../../../components/Icon';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import * as User from '../../../libs/actions/User';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Button from '../../../components/Button';
import MenuItem from '../../../components/MenuItem';

const propTypes = {
    /** Label to display on login form */
    label: PropTypes.string.isRequired,

    /** Type associated with the login */
    type: PropTypes.oneOf([CONST.LOGIN_TYPE.EMAIL, CONST.LOGIN_TYPE.PHONE]).isRequired,

    /** Login associated with the user */
    login: PropTypes.shape({
        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** Date of when login was validated */
        validatedDate: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

class LoginField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showCheckmarkIcon: false,
        };
        this.timeout = null;
        this.onResendClicked = this.onResendClicked.bind(this);
        this.getLabelMargin = this.getLabelMargin.bind(this);
    }

    /**
     * Resend validation code and show the checkmark icon
     */
    onResendClicked() {
        User.resendValidateCode(this.props.login.partnerUserID);
        this.setState({showCheckmarkIcon: true});

        // Revert checkmark back to "Resend" after 5 seconds
        if (!this.timeout) {
            this.timeout = setTimeout(() => {
                if (!this.timeout) {
                    return;
                }

                this.setState({showCheckmarkIcon: false});
                this.timeout = null;
            }, 5000);
        }
    }

    /**
    * Bottom margin is not needed for phone/email label when unverified.
    * When phone/email is not verified, the resend button increases the gap between the label and text,
    * so the bottom margin is not required.
    * @returns {Object}
    */
    getLabelMargin() {
        return this.props.login.partnerUserID && !this.props.login.validatedDate ? styles.mb0 : {};
    }

    render() {
        let note;
        if (this.props.type === CONST.LOGIN_TYPE.PHONE) {
            // No phone number
            if (!this.props.login.partnerUserID) {
                note = this.props.translate('loginField.addYourPhoneToSettleViaVenmo');

            // Has unvalidated phone number
            } else if (!this.props.login.validatedDate) {
                note = this.props.translate('loginField.numberHasNotBeenValidated');

            // Has verified phone number
            } else {
                note = this.props.translate('loginField.useYourPhoneToSettleViaVenmo');
            }

        // Has unvalidated email
        } else if (this.props.login.partnerUserID && !this.props.login.validatedDate) {
            note = this.props.translate('loginField.emailHasNotBeenValidated');
        }

        return (
            <View style={styles.mb6}>
                <Text style={[styles.formLabel, this.getLabelMargin()]}>{this.props.label}</Text>
                {!this.props.login.partnerUserID ? (
                    <View style={[styles.mln5, styles.mrn5]}>
                        <MenuItem
                            key={`common.add.${this.props.type}`}
                            title={`${this.props.translate('common.add')} ${this.props.label}`}
                            icon={Expensicons.Plus}
                            onPress={() => Navigation.navigate(ROUTES.getSettingsAddLoginRoute(this.props.type))}
                        />
                    </View>
                ) : (
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Text numberOfLines={1}>
                            {this.props.type === CONST.LOGIN_TYPE.PHONE
                                ? this.props.toLocalPhone(this.props.login.partnerUserID)
                                : this.props.login.partnerUserID}
                        </Text>
                        {!this.props.login.validatedDate && (
                            <Button
                                small
                                style={[styles.mb2]}
                                onPress={this.onResendClicked}
                                ContentComponent={() => (this.state.showCheckmarkIcon ? (
                                    <Icon fill={colors.black} src={Expensicons.Checkmark} />
                                ) : (
                                    <Text style={styles.buttonSmallText}>
                                        {this.props.translate('common.resend')}
                                    </Text>
                                ))}
                            />
                        )}
                    </View>
                )}
                {note && (
                    <Text style={[styles.textLabel, styles.colorMuted]}>
                        {note}
                    </Text>
                )}
            </View>
        );
    }
}

LoginField.propTypes = propTypes;

export default withLocalize(LoginField);
