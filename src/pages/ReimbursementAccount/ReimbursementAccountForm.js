import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';

import Text from '../../components/Text';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import FixTheErrorsText from '../../components/FixTheErrorsText';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';

const propTypes = {
    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Called when the form is submitted */
    onSubmit: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {},
};

class ReimbursementAccountForm extends React.Component {
    /**
     * @returns {React.Component}
     */
    getAlertPrompt() {
        let error = '';

        if (!_.isEmpty(this.props.reimbursementAccount.errorModalMessage)) {
            error = (
                <Text style={styles.mutedTextLabel}>{this.props.reimbursementAccount.errorModalMessage}</Text>
            );
        } else {
            error = (
                <FixTheErrorsText
                    onLinkPress={() => {
                        this.form.scrollTo({y: 0, animated: true});
                    }}
                />
            );
        }

        return (
            <View style={[styles.flexRow, styles.ml2, styles.flexWrap, styles.flex1]}>
                {error}
            </View>
        );
    }

    render() {
        const isErrorVisible = _.size(lodashGet(this.props, 'reimbursementAccount.errors', {})) > 0
            || lodashGet(this.props, 'reimbursementAccount.errorModalMessage', '').length > 0

            // @TODO once all validation errors show in multiples we can remove this check
            || lodashGet(this.props, 'reimbursementAccount.error', '').length > 0;

        return (
            <ScrollView
                style={[styles.w100, styles.flex1]}
                ref={el => this.form = el}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                {/* Form elements */}
                <View style={[styles.mh5, styles.mb5]}>
                    {this.props.children}
                </View>
                <FormAlertWithSubmitButton
                    isAlertVisible={isErrorVisible}
                    AlertComponent={() => this.getAlertPrompt()}
                    buttonText={this.props.translate('common.saveAndContinue')}
                    onPress={this.props.onSubmit}
                />
            </ScrollView>
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
