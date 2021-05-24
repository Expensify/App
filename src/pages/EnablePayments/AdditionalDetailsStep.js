import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {
    View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import {activateWallet} from '../../libs/actions/BankAccounts';
import CONST from '../../CONST';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import TextLink from '../../components/TextLink';

const propTypes = {
    ...withLocalizePropTypes,

    // Stores additional information about the additional details step e.g. loading state and errors with fields
    walletAdditionalDetails: PropTypes.shape({
        // Are we waiting for a response?
        loading: PropTypes.bool,

        // Which field needs attention?
        errorFields: PropTypes.arrayOf(PropTypes.string),

        // Any additional error message to show
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

        this.requiredText = props.translate('additionalDetailsStep.isRequiredField');
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
                label: props.translate('additionalDetailsStep.addressLabel'),
                fieldName: 'addressStreet',
            },
            {
                label: props.translate('additionalDetailsStep.cityLabel'),
                fieldName: 'addressCity',
            },
            {
                label: props.translate('additionalDetailsStep.stateLabel'),
                fieldName: 'addressState',
            },
            {
                label: props.translate('additionalDetailsStep.zipCodeLabel'),
                fieldName: 'addressZip',
            },
            {
                label: props.translate('additionalDetailsStep.phoneNumberLabel'),
                fieldName: 'phoneNumber',
            },
            {
                label: props.translate('additionalDetailsStep.dobLabel'),
                fieldName: 'dob',
            },
            {
                label: props.translate('additionalDetailsStep.ssnLabel'),
                fieldName: 'ssn',
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
                        <View style={styles.ph5}>
                            <Text style={styles.mb3}>{this.props.translate('additionalDetailsStep.helpText')}</Text>
                            <TextLink
                                style={styles.mb3}
                                // @TODO Open link to help doc
                                href=""
                            >
                                {this.props.translate('additionalDetailsStep.helpLink')}
                            </TextLink>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            contentContainerStyle={styles.p5}
                        >
                            {_.map(this.fields, field => (
                                <TextInputWithLabel
                                    key={field.label}
                                    label={field.label}
                                    onChangeText={val => this.setState({[field.fieldName]: val})}
                                    value={this.state[field.fieldName]}
                                    hasError={errorFields.includes(field.fieldName)}
                                    errorText={`${field.label} ${this.requiredText}`}
                                />
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
                                text={this.props.translate('additionalDetailsStep.continueButtonText')}
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
