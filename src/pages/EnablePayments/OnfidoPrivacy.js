import React, {useRef} from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../ONYXKEYS';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import styles from '../../styles/styles';
import TextLink from '../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import Text from '../../components/Text';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import FormScrollView from '../../components/FormScrollView';
import walletOnfidoDataPropTypes from './walletOnfidoDataPropTypes';
import * as ErrorUtils from '../../libs/ErrorUtils';
import FixedFooter from '../../components/FixedFooter';

const propTypes = {
    /** Stores various information used to build the UI and call any APIs */
    walletOnfidoData: walletOnfidoDataPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletOnfidoData: {
        applicantID: '',
        sdkToken: '',
        loading: false,
        errors: {},
        fixableErrors: [],
        hasAcceptedPrivacyPolicy: false,
    },
};

function OnfidoPrivacy({walletOnfidoData, translate, form}) {
    const {isLoading = false, hasAcceptedPrivacyPolicy} = walletOnfidoData;

    const formRef = useRef(null);

    const openOnfidoFlow = () => {
        BankAccounts.openOnfidoFlow();
    };

    let onfidoError = ErrorUtils.getLatestErrorMessage(walletOnfidoData) || '';
    const onfidoFixableErrors = lodashGet(walletOnfidoData, 'fixableErrors', []);
    onfidoError += !_.isEmpty(onfidoFixableErrors) ? `\n${onfidoFixableErrors.join('\n')}` : '';

    return (
        <View style={[styles.flex1, styles.justifyContentBetween]}>
            {!hasAcceptedPrivacyPolicy ? (
                <>
                    <FormScrollView ref={formRef}>
                        <View style={[styles.mh5, styles.justifyContentCenter]}>
                            <Text style={[styles.mb5]}>
                                {translate('onfidoStep.acceptTerms')}
                                <TextLink href="https://onfido.com/facial-scan-policy-and-release/">{translate('onfidoStep.facialScan')}</TextLink>
                                {', '}
                                <TextLink href="https://onfido.com/privacy/">{translate('common.privacy')}</TextLink>
                                {` ${translate('common.and')} `}
                                <TextLink href="https://onfido.com/terms-of-service/">{translate('common.termsOfService')}</TextLink>.
                            </Text>
                        </View>
                    </FormScrollView>
                    <FixedFooter>
                        <FormAlertWithSubmitButton
                            isAlertVisible={Boolean(onfidoError)}
                            onSubmit={openOnfidoFlow}
                            onFixTheErrorsLinkPressed={() => {
                                form.scrollTo({y: 0, animated: true});
                            }}
                            message={onfidoError}
                            isLoading={isLoading}
                            buttonText={onfidoError ? translate('onfidoStep.tryAgain') : translate('common.continue')}
                            containerStyles={[styles.mh0, styles.mv0, styles.mb0]}
                        />
                    </FixedFooter>
                </>
            ) : null}
            {hasAcceptedPrivacyPolicy && isLoading ? <FullscreenLoadingIndicator /> : null}
        </View>
    );
}

OnfidoPrivacy.propTypes = propTypes;
OnfidoPrivacy.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        walletOnfidoData: {
            key: ONYXKEYS.WALLET_ONFIDO,

            // Let's get a new onfido token each time the user hits this flow (as it should only be once)
            initWithStoredValues: false,
        },
    }),
)(OnfidoPrivacy);
