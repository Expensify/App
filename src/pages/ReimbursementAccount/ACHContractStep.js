import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import * as store from '../../libs/actions/ReimbursementAccount/store';
import Text from '../../components/Text';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import IdentityForm from './IdentityForm';
import withLocalize from '../../components/withLocalize';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import ONYXKEYS from '../../ONYXKEYS';
import Form from '../../components/Form';
import * as FormActions from '../../libs/actions/FormActions';
import ScreenWrapper from '../../components/ScreenWrapper';
import StepPropTypes from './StepPropTypes';

const propTypes = {
    ...StepPropTypes,

    /** Name of the company */
    companyName: PropTypes.string.isRequired,
};

class ACHContractStep extends React.Component {
    constructor(props) {
        super(props);
        this.validate = this.validate.bind(this);

        this.addBeneficialOwner = this.addBeneficialOwner.bind(this);
        this.submit = this.submit.bind(this);

        this.state = {

            // Array of strings containing the keys to render associated Identity Forms
            beneficialOwners: props.getDefaultStateForField('beneficialOwners', []),
        };
    }

    /**
     * @param {Object} values - input values passed by the Form component
     * @returns {Object}
     */
    validate(values) {
        const errors = {};

        const errorKeys = {
            street: 'address',
            city: 'addressCity',
            state: 'addressState',
        };
        const requiredFields = ['firstName', 'lastName', 'dob', 'ssnLast4', 'street', 'city', 'zipCode', 'state'];
        if (values.hasOtherBeneficialOwners) {
            _.each(this.state.beneficialOwners, (ownerKey) => {
                // eslint-disable-next-line rulesdir/prefer-early-return
                _.each(requiredFields, (inputKey) => {
                    if (!ValidationUtils.isRequiredFulfilled(values[`beneficialOwner_${ownerKey}_${inputKey}`])) {
                        const errorKey = errorKeys[inputKey] || inputKey;
                        errors[`beneficialOwner_${ownerKey}_${inputKey}`] = this.props.translate(`bankAccount.error.${errorKey}`);
                    }
                });

                if (values[`beneficialOwner_${ownerKey}_dob`] && !ValidationUtils.meetsAgeRequirements(values[`beneficialOwner_${ownerKey}_dob`])) {
                    errors[`beneficialOwner_${ownerKey}_dob`] = this.props.translate('bankAccount.error.age');
                }

                if (values[`beneficialOwner_${ownerKey}_ssnLast4`] && !ValidationUtils.isValidSSNLastFour(values[`beneficialOwner_${ownerKey}_ssnLast4`])) {
                    errors[`beneficialOwner_${ownerKey}_ssnLast4`] = this.props.translate('bankAccount.error.ssnLast4');
                }

                if (values[`beneficialOwner_${ownerKey}_street`] && !ValidationUtils.isValidAddress(values[`beneficialOwner_${ownerKey}_street`])) {
                    errors[`beneficialOwner_${ownerKey}_street`] = this.props.translate('bankAccount.error.addressStreet');
                }

                if (values[`beneficialOwner_${ownerKey}_zipCode`] && !ValidationUtils.isValidZipCode(values[`beneficialOwner_${ownerKey}_zipCode`])) {
                    errors[`beneficialOwner_${ownerKey}_zipCode`] = this.props.translate('bankAccount.error.zipCode');
                }
            });
        }

        if (!ValidationUtils.isRequiredFulfilled(values.acceptTermsAndConditions)) {
            errors.acceptTermsAndConditions = this.props.translate('common.error.acceptedTerms');
        }

        if (!ValidationUtils.isRequiredFulfilled(values.certifyTrueInformation)) {
            errors.certifyTrueInformation = this.props.translate('beneficialOwnersStep.error.certify');
        }

        return errors;
    }

    /**
     * @param {Number} ownerKey - ID connected to the beneficial owner identity form
     */
    removeBeneficialOwner(ownerKey) {
        this.setState((prevState) => {
            const beneficialOwners = _.without(prevState.beneficialOwners, ownerKey);

            FormActions.setDraftValues(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {beneficialOwners});

            return {beneficialOwners};
        });
    }

    addBeneficialOwner() {
        this.setState((prevState) => {
            // Each beneficial owner is assigned a unique key that will connect it to an Identity Form.
            // That way we can dynamically render each Identity Form based on which keys are present in the beneficial owners array.
            const beneficialOwners = [...prevState.beneficialOwners, Str.guid()];

            FormActions.setDraftValues(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {beneficialOwners});
            return {beneficialOwners};
        });
    }

    /**
     * @param {Boolean} ownsMoreThan25Percent
     * @returns {Boolean}
     */
    canAddMoreBeneficialOwners(ownsMoreThan25Percent) {
        return _.size(this.state.beneficialOwners) < 3
            || (_.size(this.state.beneficialOwners) === 3 && !ownsMoreThan25Percent);
    }

    /**
     * @param {Object} values - object containing form input values
     */
    submit(values) {
        const bankAccountID = lodashGet(this.props.reimbursementAccount, 'achData.bankAccountID') || 0;

        const beneficialOwners = !values.hasOtherBeneficialOwners ? []
            : _.map(this.state.beneficialOwners, ownerKey => ({
                firstName: lodashGet(values, `beneficialOwner_${ownerKey}_firstName`),
                lastName: lodashGet(values, `beneficialOwner_${ownerKey}_lastName`),
                dob: lodashGet(values, `beneficialOwner_${ownerKey}_dob`),
                ssnLast4: lodashGet(values, `beneficialOwner_${ownerKey}_ssnLast4`),
                street: lodashGet(values, `beneficialOwner_${ownerKey}_street`),
                city: lodashGet(values, `beneficialOwner_${ownerKey}_city`),
                state: lodashGet(values, `beneficialOwner_${ownerKey}_state`),
                zipCode: lodashGet(values, `beneficialOwner_${ownerKey}_zipCode`),
            }));

        BankAccounts.updateBeneficialOwnersForBankAccount({
            ownsMoreThan25Percent: values.ownsMoreThan25Percent,
            hasOtherBeneficialOwners: values.hasOtherBeneficialOwners,
            acceptTermsAndConditions: values.acceptTermsAndConditions,
            certifyTrueInformation: values.certifyTrueInformation,
            beneficialOwners: JSON.stringify(beneficialOwners),
            bankAccountID,
        });
    }

    render() {
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('beneficialOwnersStep.additionalInformation')}
                    stepCounter={{step: 4, total: 5}}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={this.props.onBackButtonPress}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                />
                <Form
                    formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
                    validate={this.validate}
                    onSubmit={this.submit}
                    submitButtonText={this.props.translate('common.saveAndContinue')}
                    style={[styles.mh5, styles.flexGrow1]}
                >
                    {({inputValues}) => (
                        <>
                            <Text style={[styles.mb5]}>
                                <Text>{this.props.translate('beneficialOwnersStep.checkAllThatApply')}</Text>
                            </Text>
                            <CheckboxWithLabel
                                inputID="ownsMoreThan25Percent"
                                style={[styles.mb2]}
                                LabelComponent={() => (
                                    <Text>
                                        {this.props.translate('beneficialOwnersStep.iOwnMoreThan25Percent')}
                                        <Text style={[styles.textStrong]}>{this.props.companyName}</Text>
                                    </Text>
                                )}
                                // eslint-disable-next-line rulesdir/prefer-early-return
                                onValueChange={(ownsMoreThan25Percent) => {
                                    if (ownsMoreThan25Percent && this.state.beneficialOwners.length > 3) {
                                        // If the user owns more than 25% of the company, then there can only be a maximum of 3 other beneficial owners who owns more than 25%.
                                        // We have to remove the 4th beneficial owner if the checkbox is checked.
                                        this.setState(prevState => ({beneficialOwners: prevState.beneficialOwners.slice(0, -1)}));
                                    }
                                }}
                                defaultValue={this.props.getDefaultStateForField('ownsMoreThan25Percent', false)}
                                shouldSaveDraft
                            />
                            <CheckboxWithLabel
                                inputID="hasOtherBeneficialOwners"
                                style={[styles.mb2]}
                                LabelComponent={() => (
                                    <Text>
                                        {this.props.translate('beneficialOwnersStep.someoneOwnsMoreThan25Percent')}
                                        <Text style={[styles.textStrong]}>{this.props.companyName}</Text>
                                    </Text>
                                )}
                                // eslint-disable-next-line rulesdir/prefer-early-return
                                onValueChange={(hasOtherBeneficialOwners) => {
                                    if (hasOtherBeneficialOwners && this.state.beneficialOwners.length === 0) {
                                        this.addBeneficialOwner();
                                    }
                                }}
                                defaultValue={this.props.getDefaultStateForField('hasOtherBeneficialOwners', false)}
                                shouldSaveDraft
                            />
                            {inputValues.hasOtherBeneficialOwners && (
                                <View style={[styles.mb2]}>
                                    {_.map(this.state.beneficialOwners, (ownerKey, index) => (
                                        <View key={index} style={[styles.p5, styles.border, styles.mb2]}>
                                            <Text style={[styles.textStrong, styles.mb2, styles.textWhite]}>
                                                {this.props.translate('beneficialOwnersStep.additionalOwner')}
                                            </Text>
                                            <IdentityForm
                                                translate={this.props.translate}
                                                style={[styles.mb2]}
                                                defaultValues={{
                                                    firstName: this.props.getDefaultStateForField(`beneficialOwner_${ownerKey}_firstName`, ''),
                                                    lastName: this.props.getDefaultStateForField(`beneficialOwner_${ownerKey}_lastName`, ''),
                                                    street: this.props.getDefaultStateForField(`beneficialOwner_${ownerKey}_street`, ''),
                                                    city: this.props.getDefaultStateForField(`beneficialOwner_${ownerKey}_city`, ''),
                                                    state: this.props.getDefaultStateForField(`beneficialOwner_${ownerKey}_state`, ''),
                                                    zipCode: this.props.getDefaultStateForField(`beneficialOwner_${ownerKey}_zipCode`, ''),
                                                    dob: this.props.getDefaultStateForField(`beneficialOwner_${ownerKey}_dob`, ''),
                                                    ssnLast4: this.props.getDefaultStateForField(`beneficialOwner_${ownerKey}_ssnLast4`, ''),
                                                }}
                                                inputKeys={{
                                                    firstName: `beneficialOwner_${ownerKey}_firstName`,
                                                    lastName: `beneficialOwner_${ownerKey}_lastName`,
                                                    dob: `beneficialOwner_${ownerKey}_dob`,
                                                    ssnLast4: `beneficialOwner_${ownerKey}_ssnLast4`,
                                                    street: `beneficialOwner_${ownerKey}_street`,
                                                    city: `beneficialOwner_${ownerKey}_city`,
                                                    state: `beneficialOwner_${ownerKey}_state`,
                                                    zipCode: `beneficialOwner_${ownerKey}_zipCode`,
                                                }}
                                                shouldSaveDraft
                                            />
                                            {this.state.beneficialOwners.length > 1 && (
                                                <TextLink onPress={() => this.removeBeneficialOwner(ownerKey)}>
                                                    {this.props.translate('beneficialOwnersStep.removeOwner')}
                                                </TextLink>
                                            )}
                                        </View>
                                    ))}
                                    {this.canAddMoreBeneficialOwners(inputValues.ownsMoreThan25Percent) && (
                                        <TextLink onPress={this.addBeneficialOwner}>
                                            {this.props.translate('beneficialOwnersStep.addAnotherIndividual')}
                                            <Text style={[styles.textStrong, styles.link]}>{this.props.companyName}</Text>
                                        </TextLink>
                                    )}
                                </View>
                            )}
                            <Text style={[styles.mv5]}>
                                {this.props.translate('beneficialOwnersStep.agreement')}
                            </Text>
                            <CheckboxWithLabel
                                inputID="acceptTermsAndConditions"
                                style={[styles.mt4]}
                                LabelComponent={() => (
                                    <Text>
                                        {this.props.translate('common.iAcceptThe')}
                                        <TextLink href="https://use.expensify.com/achterms">
                                            {`${this.props.translate('beneficialOwnersStep.termsAndConditions')}`}
                                        </TextLink>
                                    </Text>
                                )}
                                defaultValue={this.props.getDefaultStateForField('acceptTermsAndConditions', false)}
                                shouldSaveDraft
                            />
                            <CheckboxWithLabel
                                inputID="certifyTrueInformation"
                                style={[styles.mt4]}
                                LabelComponent={() => (
                                    <Text>{this.props.translate('beneficialOwnersStep.certifyTrueAndAccurate')}</Text>
                                )}
                                defaultValue={this.props.getDefaultStateForField('certifyTrueInformation', false)}
                                shouldSaveDraft
                            />
                        </>
                    )}
                </Form>
            </ScreenWrapper>
        );
    }
}

ACHContractStep.propTypes = propTypes;
export default withLocalize(ACHContractStep);
