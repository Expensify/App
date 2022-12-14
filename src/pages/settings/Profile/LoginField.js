import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';
import Icon from '../../../components/Icon';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import Navigation from '../../../libs/Navigation/Navigation';
import * as User from '../../../libs/actions/User';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Button from '../../../components/Button';
import MenuItem from '../../../components/MenuItem';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';

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

    render() {
        let note;
        if (this.props.type === CONST.LOGIN_TYPE.PHONE) {
            // Has unvalidated phone number
            if (this.props.login.partnerUserID && !this.props.login.validatedDate) {
                note = this.props.translate('loginField.numberHasNotBeenValidated');
            }

            // Has unvalidated email
        } else if (this.props.login.partnerUserID && !this.props.login.validatedDate) {
            note = this.props.translate('loginField.emailHasNotBeenValidated');
        }

        return (
            <View style={[styles.ph8]}>
                <View>
                    {!this.props.login.partnerUserID || this.props.login.validatedDate ? (
                        <View style={[styles.mln8, styles.mrn8]}>
                            <MenuItemWithTopDescription
                                title={this.props.type === CONST.LOGIN_TYPE.PHONE
                                    ? this.props.toLocalPhone(this.props.login.partnerUserID)
                                    : this.props.login.partnerUserID}
                                description={this.props.label}
                                interactive={Boolean(!this.props.login.partnerUserID)}
                                onPress={this.props.login.partnerUserID ? () => { } : () => Navigation.navigate(ROUTES.getSettingsAddLoginRoute(this.props.type))}
                                shouldShowRightIcon={Boolean(!this.props.login.partnerUserID)}
                            />
                        </View>
                    ) : (
                        <View style={[styles.mt2]}>
                            <Text style={[styles.textLabelSupporting]}>{this.props.label}</Text>
                            <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.pt]}>
                                <Text numberOfLines={1}>
                                    {this.props.type === CONST.LOGIN_TYPE.PHONE
                                        ? this.props.toLocalPhone(this.props.login.partnerUserID)
                                        : this.props.login.partnerUserID}
                                </Text>
                                <Button
                                    small
                                    style={[styles.mb2]}
                                    onPress={this.onResendClicked}
                                    ContentComponent={() => (this.state.showCheckmarkIcon ? (
                                        <Icon fill={themeColors.inverse} src={Expensicons.Checkmark} />
                                    ) : (
                                        <Text style={styles.buttonSmallText}>
                                            {this.props.translate('common.resend')}
                                        </Text>
                                    ))}
                                />
                            </View>
                        </View>
                    )}
                </View>
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
