import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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
import ReimbursementAccountForm from './ReimbursementAccountForm';

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

        this.addBeneficialOwner = this.addBeneficialOwner.bind(this);
        this.submit = this.submit.bind(this);

        this.state = {
            ownsMoreThan25Percent: ReimbursementAccountUtils.getDefaultStateForField(props, 'ownsMoreThan25Percent', false),
            hasOtherBeneficialOwners: ReimbursementAccountUtils.getDefaultStateForField(props, 'hasOtherBeneficialOwners', false),
            acceptTermsAndConditions: ReimbursementAccountUtils.getDefaultStateForField(props, 'acceptTermsAndConditions', false),
            certifyTrueInformation: ReimbursementAccountUtils.getDefaultStateForField(props, 'certifyTrueInformation', false),
            beneficialOwners: ReimbursementAccountUtils.getDefaultStateForField(props, 'beneficialOwners', []),
        };

        // These fields need to be filled out in order to submit the form (doesn't include IdentityForm fields)
        this.requiredFields = [
            'acceptTermsAndConditions',
            'certifyTrueInformation',
        ];

        // Map a field to the key of the error's translation
        this.errorTranslationKeys = {
            acceptTermsAndConditions: 'beneficialOwnersStep.error.termsAndConditions',
            certifyTrueInformation: 'beneficialOwnersStep.error.certify',
        };

        this.getErrors = () => ReimbursementAccountUtils.getErrors(this.props);
        this.clearError = inputKey => ReimbursementAccountUtils.clearError(this.props, inputKey);
        this.clearErrors = inputKeys => ReimbursementAccountUtils.clearErrors(this.props, inputKeys);
        this.getErrorText = inputKey => ReimbursementAccountUtils.getErrorText(this.props, this.errorTranslationKeys, inputKey);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        let beneficialOwnersErrors = [];
        if (this.state.hasOtherBeneficialOwners) {
            beneficialOwnersErrors = _.map(this.state.beneficialOwners, ValidationUtils.validateIdentity);
        }

        const errors = {};
        _.each(this.requiredFields, (inputKey) => {
            if (ValidationUtils.isRequiredFulfilled(this.state[inputKey])) {
                return;
            }

            errors[inputKey] = true;
        });
        BankAccounts.setBankAccountFormValidationErrors({...errors, beneficialOwnersErrors});
        return _.every(beneficialOwnersErrors, _.isEmpty) && _.isEmpty(errors);
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

        // If they did not select that there are other beneficial owners, then we need to clear out the array here. The
        // reason we do it here is that if they filled out several beneficial owners, but then toggled the checkbox, we
        // want the data to remain in the form so we don't lose the user input until they submit the form. This will
        // prevent the data from being sent to the API
        this.setState(prevState => ({
            beneficialOwners: !prevState.hasOtherBeneficialOwners ? [] : prevState.beneficialOwners,
        }),
        () => BankAccounts.setupWithdrawalAccount({...this.state}));
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
        this.clearError(fieldName);
    }

    render() {
        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('beneficialOwnersStep.additionalInformation')}
                    stepCounter={{step: 4, total: 5}}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={() => BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR)}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                />
                <ReimbursementAccountForm
                    onSubmit={this.submit}
                >
                    <Text style={[styles.mb5]}>
                        <Text>{this.props.translate('beneficialOwnersStep.checkAllThatApply')}</Text>
                    </Text>
                    <CheckboxWithLabel
                        style={[styles.mb2]}
                        isChecked={this.state.ownsMoreThan25Percent}
                        onPress={() => this.toggleCheckbox('ownsMoreThan25Percent')}
                        LabelComponent={() => (
                            <Text>
                                {this.props.translate('beneficialOwnersStep.iOwnMoreThan25Percent')}
                                <Text style={[styles.textStrong]}>{this.props.companyName}</Text>
                            </Text>
                        )}
                    />
                    <CheckboxWithLabel
                        style={[styles.mb2]}
                        isChecked={this.state.hasOtherBeneficialOwners}
                        onPress={() => {
                            this.setState((prevState) => {
                                const hasOtherBeneficialOwners = !prevState.hasOtherBeneficialOwners;
                                const newState = {
                                    hasOtherBeneficialOwners,
                                    beneficialOwners: hasOtherBeneficialOwners && _.isEmpty(prevState.beneficialOwners)
                                        ? [{}]
                                        : prevState.beneficialOwners,
                                };
                                BankAccounts.updateReimbursementAccountDraft(newState);
                                return newState;
                            });
                        }}
                        LabelComponent={() => (
                            <Text>
                                {this.props.translate('beneficialOwnersStep.someoneOwnsMoreThan25Percent')}
                                <Text style={[styles.textStrong]}>{this.props.companyName}</Text>
                            </Text>
                        )}
                    />
                    {this.state.hasOtherBeneficialOwners && (
                        <View style={[styles.mb2]}>
                            {_.map(this.state.beneficialOwners, (owner, index) => (
                                <View key={index} style={[styles.p5, styles.border, styles.mb2]}>
                                    <Text style={[styles.textStrong, styles.mb2]}>
                                        {this.props.translate('beneficialOwnersStep.additionalOwner')}
                                    </Text>
                                    <IdentityForm
                                        style={[styles.mb2]}
                                        onFieldChange={values => this.clearErrorAndSetBeneficialOwnerValues(index, values)}
                                        values={{
                                            firstName: owner.firstName || '',
                                            lastName: owner.lastName || '',
                                            street: owner.street || '',
                                            city: owner.city || '',
                                            state: owner.state || '',
                                            zipCode: owner.zipCode || '',
                                            dob: owner.dob || '',
                                            ssnLast4: owner.ssnLast4 || '',
                                        }}
                                        errors={lodashGet(this.getErrors(), `beneficialOwnersErrors[${index}]`, {})}
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
                        style={[styles.mt4]}
                        isChecked={this.state.acceptTermsAndConditions}
                        onPress={() => this.toggleCheckbox('acceptTermsAndConditions')}
                        LabelComponent={() => (
                            <View style={[styles.flexRow]}>
                                <Text>{this.props.translate('common.iAcceptThe')}</Text>
                                <TextLink href="https://use.expensify.com/achterms">
                                    {`${this.props.translate('beneficialOwnersStep.termsAndConditions')}`}
                                </TextLink>
                            </View>
                        )}
                        errorText={this.getErrorText('acceptTermsAndConditions')}
                        hasError={this.getErrors().acceptTermsAndConditions}
                    />
                    <CheckboxWithLabel
                        style={[styles.mt4]}
                        isChecked={this.state.certifyTrueInformation}
                        onPress={() => this.toggleCheckbox('certifyTrueInformation')}
                        LabelComponent={() => (
                            <Text>{this.props.translate('beneficialOwnersStep.certifyTrueAndAccurate')}</Text>
                        )}
                        errorText={this.getErrorText('certifyTrueInformation')}
                    />
                </ReimbursementAccountForm>
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
