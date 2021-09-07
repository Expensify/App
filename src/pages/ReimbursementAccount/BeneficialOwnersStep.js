import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Text from '../../components/Text';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import Button from '../../components/Button';
import IdentityForm from './IdentityForm';
import FixedFooter from '../../components/FixedFooter';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {
    goToWithdrawalAccountSetupStep,
    setupWithdrawalAccount,
    showBankAccountErrorModal,
    updateReimbursementAccountDraft,
} from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import {isValidIdentity} from '../../libs/ValidationUtils';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';

const propTypes = {
    /** Name of the company */
    companyName: PropTypes.string.isRequired,

    ...withLocalizePropTypes,

    /** Bank account currently in setup */
    reimbursementAccount: PropTypes.shape({
        /** Error set when handling the API response */
        error: PropTypes.string,
    }).isRequired,
};

class BeneficialOwnersStep extends React.Component {
    constructor(props) {
        super(props);

        this.addBeneficialOwner = this.addBeneficialOwner.bind(this);
        this.submit = this.submit.bind(this);
        this.debouncedUpdateReimbursementAccountDraft = _.debounce(this.debouncedUpdateReimbursementAccountDraft.bind(this), 100, false);

        this.state = {
            ownsMoreThan25Percent: lodashGet(props, ['reimbursementAccountDraft', 'ownsMoreThan25Percent'], false),
            hasOtherBeneficialOwners: lodashGet(props, ['reimbursementAccountDraft', 'hasOtherBeneficialOwners'], false),
            acceptTermsAndConditions: lodashGet(props, ['reimbursementAccountDraft', 'acceptTermsAndConditions'], false),
            certifyTrueInformation: lodashGet(props, ['reimbursementAccountDraft', 'certifyTrueInformation'], false),
            beneficialOwners: lodashGet(props, ['reimbursementAccountDraft', 'beneficialOwners'], []),
        };
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        if (this.state.hasOtherBeneficialOwners) {
            const invalidBeneficifialOwner = _.find(this.state.beneficialOwners, owner => (
                !isValidIdentity(owner)
            ));

            if (invalidBeneficifialOwner) {
                return false;
            }
        }

        if (!this.state.acceptTermsAndConditions) {
            showBankAccountErrorModal(this.props.translate('beneficialOwnersStep.error.termsAndConditions'));
            return false;
        }

        if (!this.state.certifyTrueInformation) {
            showBankAccountErrorModal(this.props.translate('beneficialOwnersStep.error.certify'));
            return false;
        }

        return true;
    }

    removeBeneficialOwner(beneficialOwner) {
        this.setState((prevState) => {
            const beneficialOwners = _.without(prevState.beneficialOwners, beneficialOwner);

            // We set 'beneficialOwners' to null first because we don't have a way yet to replace a specific property without merging it.
            // We don't use the debounced function because we want to make both function calls.
            updateReimbursementAccountDraft({beneficialOwners: null});
            updateReimbursementAccountDraft({beneficialOwners});
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
        () => setupWithdrawalAccount({...this.state}));
    }

    /**
    * Save the input value in Onyx. We debounce this method in the constructor so that it's not called too often
    * to update Onyx and re-render this component.
    *
    * @param {Object} value
    */
    debouncedUpdateReimbursementAccountDraft(value) {
        updateReimbursementAccountDraft(value);
    }

    /**
    * @param {Object} fieldName
    */
    toggleCheckbox(fieldName) {
        this.setState((prevState) => {
            const newState = {[fieldName]: !prevState[fieldName]};
            this.debouncedUpdateReimbursementAccountDraft(newState);
            return newState;
        });
    }

    render() {
        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('beneficialOwnersStep.beneficialOwners')}
                    onCloseButtonPress={Navigation.dismissModal}
                    onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR)}
                    shouldShowBackButton
                />
                <ScrollView style={[styles.flex1, styles.w100, styles.ph5]}>
                    <Text style={[styles.mb5]}>
                        <Text style={[styles.textStrong]}>
                            {`${this.props.translate('beneficialOwnersStep.additionalInformation')}: `}
                        </Text>
                        <Text>{this.props.translate('beneficialOwnersStep.checkAllThatApply')}</Text>
                    </Text>
                    <CheckboxWithLabel
                        style={[styles.mb2, styles.mr2]}
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
                        style={[styles.mb2, styles.mr2]}
                        isChecked={this.state.hasOtherBeneficialOwners}
                        onPress={() => {
                            this.setState((prevState) => {
                                const hasOtherBeneficialOwners = !prevState.hasOtherBeneficialOwners;
                                this.debouncedUpdateReimbursementAccountDraft({
                                    hasOtherBeneficialOwners: !prevState.hasOtherBeneficialOwners,
                                    beneficialOwners: hasOtherBeneficialOwners && _.isEmpty(prevState.beneficialOwners)
                                        ? [{}]
                                        : prevState.beneficialOwners,
                                });
                                return {
                                    hasOtherBeneficialOwners,
                                    beneficialOwners: hasOtherBeneficialOwners && _.isEmpty(prevState.beneficialOwners)
                                        ? [{}]
                                        : prevState.beneficialOwners,
                                };
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
                                        onFieldChange={(fieldName, value) => this.setState((prevState) => {
                                            const beneficialOwners = [...prevState.beneficialOwners];
                                            beneficialOwners[index][fieldName] = value;
                                            this.debouncedUpdateReimbursementAccountDraft({beneficialOwners});
                                            return {beneficialOwners};
                                        })}
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
                                        error={this.props.reimbursementAccount.error}
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
                    <Text style={[styles.textStrong, styles.mb5]}>
                        {this.props.translate('beneficialOwnersStep.agreement')}
                    </Text>
                    <CheckboxWithLabel
                        style={[styles.mb2]}
                        isChecked={this.state.acceptTermsAndConditions}
                        onPress={() => this.toggleCheckbox('acceptTermsAndConditions')}
                        LabelComponent={() => (
                            <View style={[styles.flexRow]}>
                                <Text>{this.props.translate('common.iAcceptThe')}</Text>
                                <TextLink href="https://use.expensify.com/achterms">
                                    {`${this.props.translate('beneficialOwnersStep.termsAndConditions')}.`}
                                </TextLink>
                            </View>
                        )}
                    />
                    <CheckboxWithLabel
                        style={[styles.mb2]}
                        isChecked={this.state.certifyTrueInformation}
                        onPress={() => this.toggleCheckbox('certifyTrueInformation')}
                        LabelComponent={() => (
                            <Text>{this.props.translate('beneficialOwnersStep.certifyTrueAndAccurate')}</Text>
                        )}
                    />
                </ScrollView>
                <FixedFooter>
                    <Button
                        success
                        text={this.props.translate('common.saveAndContinue')}
                        onPress={this.submit}
                        isDisabled={!this.state.acceptTermsAndConditions || !this.state.certifyTrueInformation}
                    />
                </FixedFooter>
            </>
        );
    }
}

BeneficialOwnersStep.propTypes = propTypes;
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
)(BeneficialOwnersStep);
