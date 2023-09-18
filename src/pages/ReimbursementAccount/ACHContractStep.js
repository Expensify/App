import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import Text from '../../components/Text';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import styles from '../../styles/styles';
import CheckboxWithLabel from '../../components/CheckboxWithLabel';
import TextLink from '../../components/TextLink';
import IdentityForm from './IdentityForm';
import withLocalize from '../../components/withLocalize';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';
import * as ValidationUtils from '../../libs/ValidationUtils';
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

function ACHContractStep(props) {
    const [beneficialOwners, setBeneficialOwners] = useState(
        lodashGet(props.reimbursementAccountDraft, 'beneficialOwners', lodashGet(props.reimbursementAccount, 'achData.beneficialOwners', [])),
    );

    /**
     * @param {Object} values - input values passed by the Form component
     * @returns {Object}
     */
    const validate = (values) => {
        const errors = {};

        const errorKeys = {
            street: 'address',
            city: 'addressCity',
            state: 'addressState',
        };
        const requiredFields = ['firstName', 'lastName', 'dob', 'ssnLast4', 'street', 'city', 'zipCode', 'state'];
        if (values.hasOtherBeneficialOwners) {
            _.each(beneficialOwners, (ownerKey) => {
                // eslint-disable-next-line rulesdir/prefer-early-return
                _.each(requiredFields, (inputKey) => {
                    if (!ValidationUtils.isRequiredFulfilled(values[`beneficialOwner_${ownerKey}_${inputKey}`])) {
                        const errorKey = errorKeys[inputKey] || inputKey;
                        errors[`beneficialOwner_${ownerKey}_${inputKey}`] = `bankAccount.error.${errorKey}`;
                    }
                });

                if (values[`beneficialOwner_${ownerKey}_dob`]) {
                    if (!ValidationUtils.meetsMinimumAgeRequirement(values[`beneficialOwner_${ownerKey}_dob`])) {
                        errors[`beneficialOwner_${ownerKey}_dob`] = 'bankAccount.error.age';
                    } else if (!ValidationUtils.meetsMaximumAgeRequirement(values[`beneficialOwner_${ownerKey}_dob`])) {
                        errors[`beneficialOwner_${ownerKey}_dob`] = 'bankAccount.error.dob';
                    }
                }

                if (values[`beneficialOwner_${ownerKey}_ssnLast4`] && !ValidationUtils.isValidSSNLastFour(values[`beneficialOwner_${ownerKey}_ssnLast4`])) {
                    errors[`beneficialOwner_${ownerKey}_ssnLast4`] = 'bankAccount.error.ssnLast4';
                }

                if (values[`beneficialOwner_${ownerKey}_street`] && !ValidationUtils.isValidAddress(values[`beneficialOwner_${ownerKey}_street`])) {
                    errors[`beneficialOwner_${ownerKey}_street`] = 'bankAccount.error.addressStreet';
                }

                if (values[`beneficialOwner_${ownerKey}_zipCode`] && !ValidationUtils.isValidZipCode(values[`beneficialOwner_${ownerKey}_zipCode`])) {
                    errors[`beneficialOwner_${ownerKey}_zipCode`] = 'bankAccount.error.zipCode';
                }
            });
        }

        if (!ValidationUtils.isRequiredFulfilled(values.acceptTermsAndConditions)) {
            errors.acceptTermsAndConditions = 'common.error.acceptTerms';
        }

        if (!ValidationUtils.isRequiredFulfilled(values.certifyTrueInformation)) {
            errors.certifyTrueInformation = 'beneficialOwnersStep.error.certify';
        }

        return errors;
    };

    /**
     * @param {Number} ownerKey - ID connected to the beneficial owner identity form
     */
    const removeBeneficialOwner = (ownerKey) => {
        setBeneficialOwners((previousBeneficialOwners) => {
            const newBeneficialOwners = _.without(previousBeneficialOwners, ownerKey);
            FormActions.setDraftValues(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {beneficialOwners: newBeneficialOwners});
            return newBeneficialOwners;
        });
    };

    const addBeneficialOwner = () => {
        // Each beneficial owner is assigned a unique key that will connect it to an Identity Form.
        // That way we can dynamically render each Identity Form based on which keys are present in the beneficial owners array.
        setBeneficialOwners((previousBeneficialOwners) => {
            const newBeneficialOwners = [...previousBeneficialOwners, Str.guid()];
            FormActions.setDraftValues(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {beneficialOwners: newBeneficialOwners});
            return newBeneficialOwners;
        });
    };

    /**
     * @param {Boolean} ownsMoreThan25Percent
     * @returns {Boolean}
     */
    const canAddMoreBeneficialOwners = (ownsMoreThan25Percent) => _.size(beneficialOwners) < 3 || (_.size(beneficialOwners) === 3 && !ownsMoreThan25Percent);

    /**
     * @param {Object} values - object containing form input values
     */
    const submit = (values) => {
        const bankAccountID = lodashGet(props.reimbursementAccount, 'achData.bankAccountID') || 0;

        const updatedBeneficialOwners = !values.hasOtherBeneficialOwners
            ? []
            : _.map(beneficialOwners, (ownerKey) => ({
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
            beneficialOwners: JSON.stringify(updatedBeneficialOwners),
            bankAccountID,
        });
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('beneficialOwnersStep.additionalInformation')}
                stepCounter={{step: 4, total: 5}}
                onBackButtonPress={props.onBackButtonPress}
                shouldShowGetAssistanceButton
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
            />
            <Form
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                validate={validate}
                onSubmit={submit}
                submitButtonText={props.translate('common.saveAndContinue')}
                style={[styles.mh5, styles.flexGrow1]}
            >
                {({inputValues}) => (
                    <>
                        <Text style={[styles.mb5]}>
                            <Text>{props.translate('beneficialOwnersStep.checkAllThatApply')}</Text>
                        </Text>
                        <CheckboxWithLabel
                            accessibilityLabel={props.translate('beneficialOwnersStep.iOwnMoreThan25Percent')}
                            inputID="ownsMoreThan25Percent"
                            style={[styles.mb2]}
                            LabelComponent={() => (
                                <Text>
                                    {props.translate('beneficialOwnersStep.iOwnMoreThan25Percent')}
                                    <Text style={[styles.textStrong]}>{props.companyName}</Text>
                                </Text>
                            )}
                            // eslint-disable-next-line rulesdir/prefer-early-return
                            onValueChange={(ownsMoreThan25Percent) => {
                                if (ownsMoreThan25Percent && beneficialOwners.length > 3) {
                                    // If the user owns more than 25% of the company, then there can only be a maximum of 3 other beneficial owners who owns more than 25%.
                                    // We have to remove the 4th beneficial owner if the checkbox is checked.
                                    setBeneficialOwners((previousBeneficialOwners) => previousBeneficialOwners.slice(0, -1));
                                }
                            }}
                            defaultValue={props.getDefaultStateForField('ownsMoreThan25Percent', false)}
                            shouldSaveDraft
                        />
                        <CheckboxWithLabel
                            accessibilityLabel={props.translate('beneficialOwnersStep.someoneOwnsMoreThan25Percent')}
                            inputID="hasOtherBeneficialOwners"
                            style={[styles.mb2]}
                            LabelComponent={() => (
                                <Text>
                                    {props.translate('beneficialOwnersStep.someoneOwnsMoreThan25Percent')}
                                    <Text style={[styles.textStrong]}>{props.companyName}</Text>
                                </Text>
                            )}
                            // eslint-disable-next-line rulesdir/prefer-early-return
                            onValueChange={(hasOtherBeneficialOwners) => {
                                if (hasOtherBeneficialOwners && beneficialOwners.length === 0) {
                                    addBeneficialOwner();
                                }
                            }}
                            defaultValue={props.getDefaultStateForField('hasOtherBeneficialOwners', false)}
                            shouldSaveDraft
                        />
                        {Boolean(inputValues.hasOtherBeneficialOwners) && (
                            <View style={[styles.mb2]}>
                                {_.map(beneficialOwners, (ownerKey, index) => (
                                    <View
                                        key={index}
                                        style={[styles.p5, styles.border, styles.mb2]}
                                    >
                                        <Text style={[styles.textStrong, styles.mb2, styles.textWhite]}>{props.translate('beneficialOwnersStep.additionalOwner')}</Text>
                                        <IdentityForm
                                            translate={props.translate}
                                            style={[styles.mb2]}
                                            defaultValues={{
                                                firstName: props.getDefaultStateForField(`beneficialOwner_${ownerKey}_firstName`, ''),
                                                lastName: props.getDefaultStateForField(`beneficialOwner_${ownerKey}_lastName`, ''),
                                                street: props.getDefaultStateForField(`beneficialOwner_${ownerKey}_street`, ''),
                                                city: props.getDefaultStateForField(`beneficialOwner_${ownerKey}_city`, ''),
                                                state: props.getDefaultStateForField(`beneficialOwner_${ownerKey}_state`, ''),
                                                zipCode: props.getDefaultStateForField(`beneficialOwner_${ownerKey}_zipCode`, ''),
                                                dob: props.getDefaultStateForField(`beneficialOwner_${ownerKey}_dob`, ''),
                                                ssnLast4: props.getDefaultStateForField(`beneficialOwner_${ownerKey}_ssnLast4`, ''),
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
                                        {beneficialOwners.length > 1 && (
                                            <TextLink onPress={() => removeBeneficialOwner(ownerKey)}>{props.translate('beneficialOwnersStep.removeOwner')}</TextLink>
                                        )}
                                    </View>
                                ))}
                                {canAddMoreBeneficialOwners(inputValues.ownsMoreThan25Percent) && (
                                    <TextLink onPress={addBeneficialOwner}>
                                        {props.translate('beneficialOwnersStep.addAnotherIndividual')}
                                        <Text style={[styles.textStrong, styles.link]}>{props.companyName}</Text>
                                    </TextLink>
                                )}
                            </View>
                        )}
                        <Text style={[styles.mv5]}>{props.translate('beneficialOwnersStep.agreement')}</Text>
                        <CheckboxWithLabel
                            accessibilityLabel={`${props.translate('common.iAcceptThe')} ${props.translate('beneficialOwnersStep.termsAndConditions')}`}
                            inputID="acceptTermsAndConditions"
                            style={[styles.mt4]}
                            LabelComponent={() => (
                                <Text>
                                    {props.translate('common.iAcceptThe')}
                                    <TextLink href="https://use.expensify.com/achterms">{`${props.translate('beneficialOwnersStep.termsAndConditions')}`}</TextLink>
                                </Text>
                            )}
                            defaultValue={props.getDefaultStateForField('acceptTermsAndConditions', false)}
                            shouldSaveDraft
                        />
                        <CheckboxWithLabel
                            accessibilityLabel={props.translate('beneficialOwnersStep.certifyTrueAndAccurate')}
                            inputID="certifyTrueInformation"
                            style={[styles.mt4]}
                            LabelComponent={() => <Text>{props.translate('beneficialOwnersStep.certifyTrueAndAccurate')}</Text>}
                            defaultValue={props.getDefaultStateForField('certifyTrueInformation', false)}
                            shouldSaveDraft
                        />
                    </>
                )}
            </Form>
        </ScreenWrapper>
    );
}

ACHContractStep.propTypes = propTypes;
ACHContractStep.displayName = 'ACHContractStep';
export default withLocalize(ACHContractStep);
