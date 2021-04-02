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

const propTypes = {
    // Label to display on login form
    label: PropTypes.string.isRequired,

    // Type associated with the login
    type: PropTypes.oneOf([CONST.LOGIN_TYPE.EMAIL, CONST.LOGIN_TYPE.PHONE]).isRequired,

    // Login associated with the user
    login: PropTypes.shape({
        partnerUserID: PropTypes.string,
        validatedDate: PropTypes.string,
    }).isRequired,
};

export class LoginField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showCheckmarkIcon: false,
        };
        this.timeout = null;
        this.onResendClicked = this.onResendClicked.bind(this);
    }

    onResendClicked() {
        resendValidateCode(this.props.login.partnerUserID);
        this.setState({showCheckmarkIcon: true});

        // Revert checkmark back to "Resend" after 5seconds
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
                note = 'Add your phone number to settle up via Venmo.';

                // Has unvalidated phone number
            } else if (!this.props.login.validatedDate) {
                // eslint-disable-next-line max-len
                note = 'The number has not yet been validated. Click the button to resend the validation link via text.';

                // Has verified phone number
            } else {
                note = 'Use your phone number to settle up via Venmo.';
            }

            // Has unvalidated email
        } else if (this.props.login.partnerUserID && !this.props.login.validatedDate) {
            note = 'The email has not yet been validated. Click the button to resend the validation link via text.';
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
                                    {`Add ${this.props.label}`}
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                ) : (
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Text style={[styles.textP]} numberOfLines={1}>
                            {this.props.login.partnerUserID}
                        </Text>
                        {!this.props.login.validatedDate && (
                            <Pressable
                                style={[styles.button, styles.mb2]}
                                onPress={this.onResendClicked}
                            >
                                {this.state.showCheckmarkIcon ? (
                                    <Icon fill={colors.black} src={Checkmark} />
                                ) : (
                                    <Text style={styles.createMenuText}>
                                        Resend
                                    </Text>
                                )}
                            </Pressable>
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

export default LoginField;
