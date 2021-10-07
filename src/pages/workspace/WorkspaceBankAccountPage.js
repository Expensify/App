import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Icon from '../../components/Icon';
import {Bank} from '../../components/Icon/Expensicons';
import MenuItem from '../../components/MenuItem';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import BankAccount from '../../libs/models/BankAccount';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import variables from '../../styles/variables';
import reimbursementAccountPropTypes from '../ReimbursementAccount/reimbursementAccountPropTypes';

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
    if (!lodashGet(props.reimbursementAccount, 'achData.bankAccountID') || lodashGet(props.reimbursementAccount, 'achData.state') === BankAccount.STATE.OPEN) {
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
            <View style={[styles.mh5, styles.mb5, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <Text style={[styles.textLarge, styles.textStrong]}>{props.translate('workspace.bankAccount.almostDone')}</Text>
                <Icon src={Bank} fill={colors.green} height={variables.componentSizeNormal} width={variables.componentSizeNormal} />
            </View>
            <Text style={[styles.mh5, styles.mb5]}>
                {props.translate('workspace.bankAccount.youreAlmostDone')}
            </Text>
            <MenuItem
                title={props.translate('workspace.bankAccount.continueWithSetup')}
                icon={Bank}
                onPress={popAndNavigateToBankAccountRoute}
                shouldShowRightIcon
            />
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
