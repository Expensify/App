import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import compose from '../../libs/compose';
import ROUTES from '../../ROUTES';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import {fetchFreePlanVerifiedBankAccount} from '../../libs/actions/BankAccounts';
import BankAccount from '../../libs/models/BankAccount';
import reimbursementAccountPropTypes from '../ReimbursementAccount/reimbursementAccountPropTypes';
import userPropTypes from '../settings/userPropTypes';

const propTypes = {
    /** The text to display in the header */
    headerText: PropTypes.string.isRequired,

    /** The route object passed to this page from the navigator */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** The policyID that is being configured */
            policyID: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,

    /** From Onyx */
    reimbursementAccount: reimbursementAccountPropTypes,
    user: userPropTypes,

    children: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    children: () => {},
    user: {},
    reimbursementAccount: {},
};

class WorkspacePageWithSections extends React.Component {
    componentDidMount() {
        fetchFreePlanVerifiedBankAccount();
    }

    render() {
        const achState = _.get(this.props.reimbursementAccount, ['achData', 'state'], '');
        const hasVBA = achState === BankAccount.STATE.OPEN;
        const isUsingECard = _.get(this.props.user, 'isUsingExpensifyCard');
        const policyID = _.get(this.props.route, ['params', 'policyID']);

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.headerText}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID))}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <ScrollView
                    style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                    contentContainerStyle={[styles.flex1]}
                >
                    <View style={[styles.w100, styles.flex1]}>

                        {this.props.children(hasVBA, policyID, isUsingECard)}

                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

WorkspacePageWithSections.propTypes = propTypes;
WorkspacePageWithSections.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspacePageWithSections);
