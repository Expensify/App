import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {Bank} from '../../components/Icon/Expensicons';
import {BankArrowPink} from '../../components/Icon/Illustrations';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import BankAccount from '../../libs/models/BankAccount';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import reimbursementAccountPropTypes from '../ReimbursementAccount/reimbursementAccountPropTypes';
import WorkspaceSection from './WorkspaceSection';

const propTypes = {
    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {
        loading: true,
    },
};

/**
 * We need to pop this page before we redirect or else when we goBack() we'll get a white screen
 */
function popAndNavigateToBankAccountRoute() {
    Navigation.pop();
    Navigation.navigate(ROUTES.getBankAccountRoute());
}

const WorkspaceBankAccountPage = (props) => {
    // If we have an open bank account or no bank account at all then we will immediately redirect the user to /bank-account to display the next step
    const state = lodashGet(props.reimbursementAccount, 'achData.state');
    if (!lodashGet(props.reimbursementAccount, 'achData.bankAccountID') || state === BankAccount.STATE.OPEN) {
        popAndNavigateToBankAccountRoute();
        return null;
    }

    // Otherwise we should an interstitial page that let's them continue progress
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('workspace.common.bankAccount')}
                onCloseButtonPress={Navigation.dismissModal}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton
            />
            <WorkspaceSection
                title={props.translate('workspace.bankAccount.almostDone')}
                icon={BankArrowPink}
                menuItems={[{
                    title: props.translate('workspace.bankAccount.continueWithSetup'),
                    icon: Bank,
                    onPress: popAndNavigateToBankAccountRoute,
                    shouldShowRightIcon: true,
                }]}
            >
                <Text>
                    {props.translate('workspace.bankAccount.youreAlmostDone')}
                </Text>
            </WorkspaceSection>
        </ScreenWrapper>
    );
};

WorkspaceBankAccountPage.propTypes = propTypes;
WorkspaceBankAccountPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspaceBankAccountPage);
