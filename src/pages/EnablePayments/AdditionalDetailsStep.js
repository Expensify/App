import _ from 'underscore';
import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {
    View, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import {activateWallet} from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import TextLink from '../../components/TextLink';
import ExpensiTextInput from '../../components/ExpensiTextInput';

const propTypes = {
    ...withLocalizePropTypes,

    /** Stores additional information about the additional details step e.g. loading state and errors with fields */
    walletAdditionalDetails: PropTypes.shape({
        /** Are we waiting for a response? */
        loading: PropTypes.bool,

        /** Which field needs attention? */
        errorFields: PropTypes.arrayOf(PropTypes.string),

        /** Any additional error message to show */
        additionalErrorMessage: PropTypes.string,
    }),
};

const defaultProps = {
    walletAdditionalDetails: {
        errorFields: [],
        loading: false,
        additionalErrorMessage: '',
    },
};

class AdditionalDetailsStep extends React.Component {
    constructor(props) {
        super(props);

        this.requiredText = `${props.translate('common.isRequiredField')}.`;
        this.fields = [
            {
                label: props.translate('additionalDetailsStep.legalFirstNameLabel'),
                fieldName: 'legalFirstName',
            },
            {
                label: props.translate('additionalDetailsStep.legalMiddleNameLabel'),
                fieldName: 'legalMiddleName',
            },
            {
                label: props.translate('additionalDetailsStep.legalLastNameLabel'),
                fieldName: 'legalLastName',
            },
            {
                label: props.translate('common.personalAddress'),
                fieldName: 'addressStreet',
            },
            {
                label: props.translate('common.city'),
                fieldName: 'addressCity',
            },
            {
                label: props.translate('common.state'),
                fieldName: 'addressState',
            },
            {
                label: props.translate('common.zip'),
                fieldName: 'addressZip',
            },
            {
                label: props.translate('common.phoneNumber'),
                fieldName: 'phoneNumber',
            },
            {
                label: props.translate('common.dob'),
                fieldName: 'dob',
            },
            {
                label: props.translate('common.ssnLast4'),
                fieldName: 'ssn',
                maxLength: 4,
                keyboardType: 'number-pad',
            },
        ];

        this.state = {
            firstName: '',
            legalMiddleName: '',
            legalLastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            phoneNumber: '',
            dob: '',
            ssn: '',
        };
    }

    render() {
        const errorFields = this.props.walletAdditionalDetails.errorFields || [];
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView style={[styles.flex1]} behavior="height">
                    <HeaderWithCloseButton
                        title={this.props.translate('additionalDetailsStep.headerTitle')}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <View style={[styles.flex1]}>
                        <View style={[styles.ph5]}>
                            <Text style={styles.mb3}>{this.props.translate('additionalDetailsStep.helpText')}</Text>
                            <TextLink
                                style={styles.mb3}
                                href="https://use.expensify.com/usa-patriot-act"
                            >
                                {this.props.translate('additionalDetailsStep.helpLink')}
                            </TextLink>
                        </View>
                        <ScrollView contentContainerStyle={styles.p5}>
                            {_.map(this.fields, field => (
                                <>
                                    <ExpensiTextInput
                                        key={field.label}
                                        label={field.label}
                                        onChangeText={val => this.setState({[field.fieldName]: val})}
                                        value={this.state[field.fieldName]}
                                        errorText={errorFields.includes(field.fieldName)
                                            ? `${field.label} ${this.requiredText}`
                                            : ''}
                                        // eslint-disable-next-line react/jsx-props-no-spreading
                                        {..._.omit(field, ['label', 'fieldName'])}
                                    />
                                    {field.fieldName === 'addressStreet' && <Text>{this.props.translate('common.noPO')}</Text>}
                                </>
                            ))}
                        </ScrollView>
                        <View style={[styles.m5]}>
                            {this.props.walletAdditionalDetails.additionalErrorMessage.length > 0 && (
                                <Text style={[styles.formError, styles.mb2]}>
                                    {this.props.walletAdditionalDetails.additionalErrorMessage}
                                </Text>
                            )}
                            <Button
                                success
                                text={this.props.translate('common.saveAndContinue')}
                                isLoading={this.props.walletAdditionalDetails.loading}
                                onPress={() => {
                                    activateWallet(CONST.WALLET.STEP.ADDITIONAL_DETAILS, {
                                        personalDetails: this.state,
                                    });
                                }}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

AdditionalDetailsStep.propTypes = propTypes;
AdditionalDetailsStep.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        walletAdditionalDetails: {
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
            initWithStoredValues: false,
        },
    }),
)(AdditionalDetailsStep);
