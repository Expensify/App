import React from "react";
import {View} from 'react-native';
import OAuthLink from "../../components/PlaidOAuth/oauth";
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from "../../ONYXKEYS";
import {withOnyx} from "react-native-onyx";
import ReimbursementAccountForm from "./ReimbursementAccountForm";
import _ from "underscore";
import Text from "../../components/Text";
import styles from "../../styles/styles";
import Icon from "../../components/Icon";
import ExpensiPicker from "../../components/ExpensiPicker";
import lodashGet from "lodash/get";
import getBankIcon from "../../components/Icon/BankIcons";
import GenericBank from '../../../assets/images/bankicons/generic-bank-account.svg';
import variables from "../../styles/variables";

const PlaidOAuthPage = (props) => {
    const receivedRedirectSearchParams = (new URL(window.location.href)).searchParams;
    const oauth_state_id = receivedRedirectSearchParams.get('oauth_state_id');
    console.log("in PlaidOAuthPage", oauth_state_id);
    const bankAccounts = lodashGet(this.props.plaidBankAccounts, 'accounts', []);
    const linkToken = props.plaidLinkToken;
    const icon = GenericBank;
    const iconSize = variables.iconSizeExtraLarge;
    // const {icon, iconSize} = getBankIcon(this.state.institution.name);

    return (
        <View>
            <OAuthLink
                plaidLinkToken={linkToken}
                receivedRedirectUri={window.location.href}
            />
            {bankAccounts.length > 0 && (
                <ReimbursementAccountForm
                    onSubmit={this.selectAccount}
                >
                    {!_.isEmpty(this.props.text) && (
                        <Text style={[styles.mb5]}>{this.props.text}</Text>
                    )}
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                        <Icon
                            src={icon}
                            height={iconSize}
                            width={iconSize}
                        />
                        <Text style={[styles.ml3, styles.textStrong]}>{this.state.institution.name}</Text>
                    </View>
                    <View style={[styles.mb5]}>
                        <ExpensiPicker
                            label={this.props.translate('addPersonalBankAccountPage.chooseAccountLabel')}
                            onChange={(index) => {
                                this.setState({selectedIndex: Number(index)});
                                this.clearError('selectedBank');
                            }}
                            items={options}
                            placeholder={_.isUndefined(this.state.selectedIndex) ? {
                                value: '',
                                label: this.props.translate('bankAccount.chooseAnAccount'),
                            } : {}}
                            value={this.state.selectedIndex}
                            hasError={this.getErrors().selectedBank}
                        />
                    </View>
                </ReimbursementAccountForm>
            )}
        </View>
    );
}

PlaidOAuthPage.displayName = 'PlaidOAuthPage';
export default compose(
    withLocalize,
    withOnyx({
        plaidLinkToken: {
            // If we hit here we've been redirected to reinitialize the PlaidLink
            key: ONYXKEYS.PLAID_LINK_TOKEN,
        },
        plaidBankAccounts: {
            key: ONYXKEYS.PLAID_BANK_ACCOUNTS,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(PlaidOAuthPage);
