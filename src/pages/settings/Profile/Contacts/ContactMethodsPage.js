import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../../../components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import CONST from '../../../../CONST';
import compose from '../../../../libs/compose';
import Navigation from '../../../../libs/Navigation/Navigation';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import LoginField from './LoginField';

const propTypes = {
    /* Onyx Props */

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Value of partner name */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** Date of when login was validated */
        validatedDate: PropTypes.string,
    }),

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    loginList: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class ContactMethodsPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            logins: this.getLogins(),
        };

        this.getLogins = this.getLogins.bind(this);
    }

    componentDidUpdate(prevProps) {
        let stateToUpdate = {};

        // Recalculate logins if loginList has changed
        if (_.keys(this.props.loginList).length !== _.keys(prevProps.loginList).length) {
            stateToUpdate = {...stateToUpdate, logins: this.getLogins()};
        }

        if (_.isEmpty(stateToUpdate)) {
            return;
        }

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState(stateToUpdate);
    }

    /**
     * Get the most validated login of each type
     *
     * @returns {Object}
     */
    getLogins() {
        return _.reduce(_.values(this.props.loginList), (logins, currentLogin) => {
            const type = Str.isSMSLogin(currentLogin.partnerUserID) ? CONST.LOGIN_TYPE.PHONE : CONST.LOGIN_TYPE.EMAIL;
            const login = Str.removeSMSDomain(currentLogin.partnerUserID);

            // If there's already a login type that's validated and/or currentLogin isn't valid then return early
            if ((login !== lodashGet(this.props.currentUserPersonalDetails, 'login')) && !_.isEmpty(logins[type])
                && (logins[type].validatedDate || !currentLogin.validatedDate)) {
                return logins;
            }
            return {
                ...logins,
                [type]: {
                    ...currentLogin,
                    type,
                    partnerUserID: Str.removeSMSDomain(currentLogin.partnerUserID),
                },
            };
        }, {
            phone: {},
            email: {},
        });
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('contacts.contactMethods')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <ScrollView>
                    <LoginField
                        label={this.props.translate('profilePage.emailAddress')}
                        type="email"
                        login={this.state.logins.email}
                        defaultValue={this.state.logins.email}
                    />
                    <LoginField
                        label={this.props.translate('common.phoneNumber')}
                        type="phone"
                        login={this.state.logins.phone}
                        defaultValue={this.state.logins.phone}
                    />
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

ContactMethodsPage.propTypes = propTypes;
ContactMethodsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        loginList: {
            key: ONYXKEYS.LOGIN_LIST,
        },
    }),
)(ContactMethodsPage);
