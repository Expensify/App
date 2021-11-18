import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';

import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import CONST from '../../CONST';

const propTypes = {
    /** ACH data for the withdrawal account actively being set up */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Called when the form is submitted */
    onSubmit: PropTypes.func.isRequired,

    /** Object containing various errors */
    // eslint-disable-next-line react/no-unused-prop-types
    formErrors: PropTypes.objectOf(PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.arrayOf(PropTypes.objectOf(PropTypes.bool)),
    ])),

    ...withLocalizePropTypes,
};

const defaultProps = {
    reimbursementAccount: {},
    formErrors: {},
};

class ReimbursementAccountForm extends React.Component {
    /**
     * Checks if we have errors or not
     *
     * @returns {Boolean}
     */
    isErrorVisible() {
        if (lodashGet(this.props, 'reimbursementAccount.errorModalMessage', '').length > 0

            // @TODO once all validation errors show in multiples we can remove this check
            || lodashGet(this.props, 'reimbursementAccount.error', '').length > 0) {
            return true;
        }

        // Check considering that a key may have an array of objects (i.e. beneficial owners)
        const formErrors = lodashGet(this.props, 'formErrors', {});
        return _.any(formErrors, value => value === true || (_.isArray(value) && _.any(value, _.size)));
    }

    render() {
        const currentStep = lodashGet(
            this.props,
            'reimbursementAccount.achData.currentStep',
            CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
        );
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
                    isAlertVisible={this.isErrorVisible()}
                    buttonText={currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION ? this.props.translate('validationStep.buttonText') : this.props.translate('common.saveAndContinue')}
                    onSubmit={this.props.onSubmit}
                    onFixTheErrorsLinkPressed={() => {
                        this.form.scrollTo({y: 0, animated: true});
                    }}
                    message={this.props.reimbursementAccount.errorModalMessage}
                    isMessageHtml={this.props.reimbursementAccount.isErrorModalMessageHtml}
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
