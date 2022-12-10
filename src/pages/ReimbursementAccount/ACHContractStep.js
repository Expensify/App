import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import * as store from '../../libs/actions/ReimbursementAccount/store';
import Text from '../../components/Text';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import IdentityForm from './IdentityForm';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';
import reimbursementAccountPropTypes from './reimbursementAccountPropTypes';
import Form from '../../components/Form';

const propTypes = {
    /** Name of the company */
    companyName: PropTypes.string.isRequired,

    ...withLocalizePropTypes,

    /** Bank account currently in setup */
    // eslint-disable-next-line react/no-unused-prop-types
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,
};

class ACHContractStep extends React.Component {
    constructor(props) {
        super(props);
        this.validate = this.validate.bind(this);

        this.addBeneficialOwner = this.addBeneficialOwner.bind(this);
        this.submit = this.submit.bind(this);

        this.state = {
            ownsMoreThan25Percent: ReimbursementAccountUtils.getDefaultStateForField(props, 'ownsMoreThan25Percent', false),
            hasOtherBeneficialOwners: ReimbursementAccountUtils.getDefaultStateForField(props, 'hasOtherBeneficialOwners', false),
            beneficialOwners: ReimbursementAccountUtils.getDefaultStateForField(props, 'beneficialOwners', []),
        };
    }

    /**
     * Get default value from reimbursementAccount or achData
     * @param {String} fieldName
     * @param {*} defaultValue
     * @returns {String}
     */
    getDefaultStateForField(fieldName, defaultValue) {
        return lodashGet(this.props, ['reimbursementAccount', 'achData', fieldName], defaultValue);
    }

    /**
     * @param {Object} values
     * @returns {Object}
     */
    validate(values) {
        const errors = {};

        // let beneficialOwnersErrors = [];
        if (values.hasOtherBeneficialOwners) {
            //  beneficialOwnersErrors = _.map(this.state.beneficialOwners, ValidationUtils.validateIdentity);

            _.each(values.beneficialOwners, (beneficialOwner, index) => {
                if (!ValidationUtils.isRequiredFulfilled(beneficialOwner.firstName)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.firstName');
                }

                if (!ValidationUtils.isRequiredFulfilled(beneficialOwner.lastName)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.lastName');
                }

                if (!ValidationUtils.isRequiredFulfilled(beneficialOwner.dob)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.dob');
                }

                if (values.dob && !ValidationUtils.meetsAgeRequirements(values.dob)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.age');
                }

                if (!ValidationUtils.isRequiredFulfilled(values.ssnLast4) || !ValidationUtils.isValidSSNLastFour(values.ssnLast4)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.ssnLast4');
                }

                if (!ValidationUtils.isRequiredFulfilled(beneficialOwner.beneficialOwnerAddressStreet)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.address');
                }

                if (values.beneficialOwnerAddressStreet && !ValidationUtils.isValidAddress(beneficialOwner.beneficialOwnerAddressStreet)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.addressStreet');
                }

                if (!ValidationUtils.isRequiredFulfilled(beneficialOwner.beneficialOwnerAddressCity)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.addressCity');
                }

                if (!ValidationUtils.isRequiredFulfilled(beneficialOwner.beneficialOwnerAddressState)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.addressState');
                }

                if (!ValidationUtils.isRequiredFulfilled(beneficialOwner.beneficialOwnerAddressZipCode) || !ValidationUtils.isValidZipCode(values.beneficialOwnerAddressZipCode)) {
                    errors[`beneficialOwner${index}`] = this.props.translate('bankAccount.error.zipCode');
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

    removeBeneficialOwner(beneficialOwner) {
        this.setState((prevState) => {
            const beneficialOwners = _.without(prevState.beneficialOwners, beneficialOwner);

            // We set 'beneficialOwners' to null first because we don't have a way yet to replace a specific property without merging it.
            // We don't use the debounced function because we want to make both function calls.
            BankAccounts.updateReimbursementAccountDraft({beneficialOwners: null});
            BankAccounts.updateReimbursementAccountDraft({beneficialOwners});

            // Clear errors
            BankAccounts.setBankAccountFormValidationErrors({});
            return {beneficialOwners};
        });
    }

    addBeneficialOwner() {
        this.setState(prevState => ({beneficialOwners: [...prevState.beneficialOwners, {}]}));
    }

    /**
     * @returns {Boolean}
     */
    canAddMoreBeneficialOwners() {
        return _.size(this.state.beneficialOwners) < 3
            || (_.size(this.state.beneficialOwners) === 3 && !this.state.ownsMoreThan25Percent);
    }

    /**
     * Clear the error associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {Integer} ownerIndex
     * @param {Object} values
     */
    clearErrorAndSetBeneficialOwnerValues(ownerIndex, values) {
        this.setState((prevState) => {
            const beneficialOwners = [...prevState.beneficialOwners];
            beneficialOwners[ownerIndex] = {...beneficialOwners[ownerIndex], ...values};
            BankAccounts.updateReimbursementAccountDraft({beneficialOwners});
            return {beneficialOwners};
        });

        // Prepare inputKeys for clearing errors
        const inputKeys = _.keys(values);

        // dob field has multiple validations/errors, we are handling it temporarily like this.
        if (_.contains(inputKeys, 'dob')) {
            inputKeys.push('dobAge');
        }
        this.clearErrors(_.map(inputKeys, inputKey => `beneficialOwnersErrors.${ownerIndex}.${inputKey}`));
    }

    submit() {
        if (!this.validate()) {
            return;
        }

        const bankAccountID = lodashGet(store.getReimbursementAccountInSetup(), 'bankAccountID');

        // If they did not select that there are other beneficial owners, then we need to clear out the array here. The
        // reason we do it here is that if they filled out several beneficial owners, but then toggled the checkbox, we
        // want the data to remain in the form so we don't lose the user input until they submit the form. This will
        // prevent the data from being sent to the API
        this.setState(prevState => ({
            beneficialOwners: !prevState.hasOtherBeneficialOwners ? [] : prevState.beneficialOwners,
        }),
        () => BankAccounts.updateBeneficialOwnersForBankAccount({...this.state, beneficialOwners: JSON.stringify(this.state.beneficialOwners), bankAccountID}));
    }

    /**
    * @param {Object} fieldName
    */
    toggleCheckbox(fieldName) {
        this.setState((prevState) => {
            const newState = {[fieldName]: !prevState[fieldName]};
            BankAccounts.updateReimbursementAccountDraft(newState);
            return newState;
        });
    }

    render() {
        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('beneficialOwnersStep.additionalInformation')}
                    stepCounter={{step: 4, total: 5}}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={() => {
                        BankAccounts.clearOnfidoToken();
                        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.beneficialOwner);
                    }}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                />
                <Form
                    formID={ONYXKEYS.FORMS.ACH_CONTRACT_FORM}
                    validate={this.validate}
                    onSubmit={() => {}}
                    submitButtonText={this.props.translate('common.save')}
                    style={[styles.mh5, styles.flexGrow1]}
                >
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
                        shouldSaveDraft
                    />
                    {this.state.hasOtherBeneficialOwners && (
                        <View style={[styles.mb2]}>
                            {_.map(this.state.beneficialOwners, (owner, index) => (
                                <View key={index} style={[styles.p5, styles.border, styles.mb2]}>
                                    <Text style={[styles.textStrong, styles.mb2]}>
                                        {this.props.translate('beneficialOwnersStep.additionalOwner')}
                                    </Text>
                                    <IdentityForm
                                        translate={this.props.translate}
                                        style={[styles.mb2]}
                                        defaultValues={{
                                            firstName: this.getDefaultStateForField('firstName'),
                                            lastName: this.getDefaultStateForField('lastName'),
                                            street: this.getDefaultStateForField('beneficialOwnerAddressStreet'),
                                            city: this.getDefaultStateForField('beneficialOwnerAddressCity'),
                                            state: this.getDefaultStateForField('beneficialOwnerAddressState'),
                                            zipCode: this.getDefaultStateForField('beneficialOwnerAddressZipCode'),
                                            dob: this.getDefaultStateForField('dob'),
                                            ssnLast4: this.getDefaultStateForField('ssnLast4'),
                                        }}
                                        inputKeys={{
                                            firstName: 'firstName',
                                            lastName: 'lastName',
                                            dob: 'dob',
                                            ssnLast4: 'ssnLast4',
                                            street: 'beneficialOwnerAddressStreet',
                                            city: 'beneficialOwnerAddressCity',
                                            state: 'beneficialOwnerAddressState',
                                            zipCode: 'beneficialOwnerAddressZipCode',
                                        }}
                                        shouldSaveDraft
                                    />
                                    {this.state.beneficialOwners.length > 1 && (
                                        <TextLink onPress={() => this.removeBeneficialOwner(owner)}>
                                            {this.props.translate('beneficialOwnersStep.removeOwner')}
                                        </TextLink>
                                    )}
                                </View>
                            ))}
                            {this.canAddMoreBeneficialOwners() && (
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
                            <View style={[styles.flexRow]}>
                                <Text>{this.props.translate('common.iAcceptThe')}</Text>
                                <TextLink href="https://use.expensify.com/achterms">
                                    {`${this.props.translate('beneficialOwnersStep.termsAndConditions')}`}
                                </TextLink>
                            </View>
                        )}
                        shouldSaveDraft
                    />
                    <CheckboxWithLabel
                        inputID="certifyTrueInformation"
                        style={[styles.mt4]}
                        LabelComponent={() => (
                            <Text>{this.props.translate('beneficialOwnersStep.certifyTrueAndAccurate')}</Text>
                        )}
                        shouldSaveDraft
                    />
                </Form>
            </>
        );
    }
}

ACHContractStep.propTypes = propTypes;
export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
    }),
)(ACHContractStep);
