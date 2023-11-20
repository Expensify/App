import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import LongTermsForm from './TermsPage/LongTermsForm';
import ShortTermsForm from './TermsPage/ShortTermsForm';
import userWalletPropTypes from './userWalletPropTypes';
import walletTermsPropTypes from './walletTermsPropTypes';

const propTypes = {
    /** The user's wallet */
    userWallet: userWalletPropTypes,

    /** Comes from Onyx. Information about the terms for the wallet */
    walletTerms: walletTermsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    userWallet: {},
    walletTerms: {},
};

function TermsStep(props) {
    const styles = useThemeStyles();
    const [hasAcceptedDisclosure, setHasAcceptedDisclosure] = useState(false);
    const [hasAcceptedPrivacyPolicyAndWalletAgreement, setHasAcceptedPrivacyPolicyAndWalletAgreement] = useState(false);
    const [error, setError] = useState(false);

    const errorMessage = error ? 'common.error.acceptTerms' : ErrorUtils.getLatestErrorMessage(props.walletTerms) || '';

    const toggleDisclosure = () => {
        setHasAcceptedDisclosure(!hasAcceptedDisclosure);
    };

    const togglePrivacyPolicy = () => {
        setHasAcceptedPrivacyPolicyAndWalletAgreement(!hasAcceptedPrivacyPolicyAndWalletAgreement);
    };

    /** clear error */
    useEffect(() => {
        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
            return;
        }

        setError(false);
    }, [hasAcceptedDisclosure, hasAcceptedPrivacyPolicyAndWalletAgreement]);

    return (
        <>
            <HeaderWithBackButton title={props.translate('termsStep.headerTitle')} />

            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.ph5}
            >
                <ShortTermsForm userWallet={props.userWallet} />
                <LongTermsForm />
                <CheckboxWithLabel
                    accessibilityLabel={props.translate('termsStep.haveReadAndAgree')}
                    style={[styles.mb4, styles.mt4]}
                    onInputChange={toggleDisclosure}
                    LabelComponent={() => (
                        <Text>
                            {`${props.translate('termsStep.haveReadAndAgree')}`}
                            <TextLink href="https://use.expensify.com/esignagreement">{`${props.translate('termsStep.electronicDisclosures')}.`}</TextLink>
                        </Text>
                    )}
                />
                <CheckboxWithLabel
                    accessibilityLabel={props.translate('termsStep.agreeToThe')}
                    onInputChange={togglePrivacyPolicy}
                    LabelComponent={() => (
                        <Text>
                            {`${props.translate('termsStep.agreeToThe')} `}

                            <TextLink href="https://use.expensify.com/privacy">{`${props.translate('common.privacy')} `}</TextLink>

                            {`${props.translate('common.and')} `}

                            <TextLink href="https://use.expensify.com/walletagreement">{`${props.translate('termsStep.walletAgreement')}.`}</TextLink>
                        </Text>
                    )}
                />
                <FormAlertWithSubmitButton
                    buttonText={props.translate('termsStep.enablePayments')}
                    onSubmit={() => {
                        if (!hasAcceptedDisclosure || !hasAcceptedPrivacyPolicyAndWalletAgreement) {
                            setError(true);
                            return;
                        }

                        setError(false);
                        BankAccounts.acceptWalletTerms({
                            hasAcceptedTerms: hasAcceptedDisclosure && hasAcceptedPrivacyPolicyAndWalletAgreement,
                            chatReportID: props.walletTerms.chatReportID,
                        });
                    }}
                    message={errorMessage}
                    isAlertVisible={error || Boolean(errorMessage)}
                    isLoading={!!props.walletTerms.isLoading}
                    containerStyles={[styles.mh0, styles.mv4]}
                />
            </ScrollView>
        </>
    );
}

TermsStep.displayName = 'TermsPage';
TermsStep.propTypes = propTypes;
TermsStep.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        walletTerms: {
            key: ONYXKEYS.WALLET_TERMS,
        },
    }),
)(TermsStep);
