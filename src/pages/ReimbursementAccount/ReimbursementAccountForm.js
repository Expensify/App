import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import FormScrollView from '../../components/FormScrollView';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import * as ErrorUtils from '../../libs/ErrorUtils';

const propTypes = {
    /** Data for the bank account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Called when the form is submitted */
    onSubmit: PropTypes.func.isRequired,
    buttonText: PropTypes.string,
    hideSubmitButton: PropTypes.bool,
    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {
        isLoading: false,
        errors: {},
        errorFields: {},
    },
    buttonText: '',
    hideSubmitButton: false,
};

class ReimbursementAccountForm extends React.Component {
    componentWillUnmount() {
        BankAccounts.resetReimbursementAccount();
    }

    render() {
        const hasErrorFields = _.size(this.props.reimbursementAccount.errorFields) > 0;
        const error = this.props.reimbursementAccount.error || ErrorUtils.getLatestErrorMessage(this.props.reimbursementAccount) || '';
        const isErrorVisible = hasErrorFields || Boolean(error);
        const viewStyles = [styles.mh5, styles.mb5];
        if (lodashGet(this.props, 'children.props.plaidLinkOAuthToken') === '') {
            viewStyles.push(styles.flex1);
        }

        return (
            <FormScrollView
                ref={el => this.form = el}
            >
                {/* Form elements */}
                <View style={viewStyles}>
                    {this.props.children}
                </View>
                {!this.props.hideSubmitButton && (
                    <FormAlertWithSubmitButton
                        isAlertVisible={isErrorVisible}
                        buttonText={this.props.buttonText || this.props.translate('common.saveAndContinue')}
                        onSubmit={this.props.onSubmit}
                        onFixTheErrorsLinkPressed={() => {
                            this.form.scrollTo({y: 0, animated: true});
                        }}
                        message={error}
                        isMessageHtml={this.props.reimbursementAccount.isErrorHtml}
                        isLoading={this.props.reimbursementAccount.isLoading}
                    />
                )}
            </FormScrollView>
        );
    }
}

ReimbursementAccountForm.propTypes = propTypes;
ReimbursementAccountForm.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(ReimbursementAccountForm);
