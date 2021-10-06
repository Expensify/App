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

    children: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    children: () => {},
};

class WorkspacePageWithSections extends React.Component {
    componentDidMount() {
        fetchFreePlanVerifiedBankAccount();
    }

    render() {
        const achState = _.get(this.props.reimbursementAccount, ['achData', 'state'], '');
        const hasVBA = achState === BankAccount.STATE.OPEN;
        const policyID = _.get(this.props.route, ['params', 'policyID']);

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.headerText}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID))}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <ScrollView style={[styles.settingsPageBackground]}>
                    <View style={styles.w100}>

                        {this.props.children(hasVBA, policyID)}

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
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspacePageWithSections);
