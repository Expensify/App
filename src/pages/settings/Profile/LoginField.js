import React, {Component} from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import colors from '../../../styles/colors';
import {Plus, Checkmark} from '../../../components/Icon/Expensicons';
import Icon from '../../../components/Icon';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import {resendValidateCode} from '../../../libs/actions/User';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Button from '../../../components/Button';

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
    }

    /**
     * Resend validation code and show the checkmark icon
     */
    onResendClicked() {
        resendValidateCode(this.props.login.partnerUserID);
        this.setState({showCheckmarkIcon: true});

        // Revert checkmark back to "Resend" after 5 seconds
        if (!this.timeout) {
            this.timeout = setTimeout(() => {
                if (this.timeout) {
                    this.setState({showCheckmarkIcon: false});
                    this.timeout = null;
                }
            }, 5000);
        }
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
                <Text style={styles.formLabel}>{this.props.label}</Text>
                {!this.props.login.partnerUserID ? (
                    <Pressable
                        style={[styles.createMenuItem, styles.ph0]}
                        onPress={() => Navigation.navigate(ROUTES.getSettingsAddLoginRoute(this.props.type))}
                    >
                        <View style={styles.flexRow}>
                            <View style={styles.createMenuIcon}>
                                <Icon src={Plus} />
                            </View>
                            <View style={styles.justifyContentCenter}>
                                <Text style={[styles.createMenuText, styles.ml3]}>
                                    {`${this.props.translate('common.add')} ${this.props.label}`}
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                ) : (
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Text style={[styles.textP]} numberOfLines={1}>
                            {this.props.type === CONST.LOGIN_TYPE.PHONE
                                ? this.props.toLocalPhone(this.props.login.partnerUserID)
                                : this.props.login.partnerUserID}
                        </Text>
                        {!this.props.login.validatedDate && (
                            <Button
                                style={[styles.mb2]}
                                onPress={this.onResendClicked}
                                ContentComponent={() => (this.state.showCheckmarkIcon ? (
                                    <Icon fill={colors.black} src={Checkmark} />
                                ) : (
                                    <Text style={styles.createMenuText}>
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
LoginField.displayName = 'LoginField';

export default withLocalize(LoginField);
