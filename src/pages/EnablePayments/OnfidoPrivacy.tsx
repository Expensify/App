import React, {useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FixedFooter from '@components/FixedFooter';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormScrollView from '@components/FormScrollView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WalletOnfido} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const DEFAULT_WALLET_ONFIDO_DATA = {
    applicantID: '',
    sdkToken: '',
    loading: false,
    errors: {},
    fixableErrors: [],
    hasAcceptedPrivacyPolicy: false,
};

type OnfidoPrivacyOnyxProps = {
    /** Stores various information used to build the UI and call any APIs */
    walletOnfidoData: OnyxEntry<WalletOnfido>;
};

type OnfidoPrivacyProps = OnfidoPrivacyOnyxProps;

function OnfidoPrivacy({walletOnfidoData = DEFAULT_WALLET_ONFIDO_DATA}: OnfidoPrivacyProps) {
    const {translate} = useLocalize();
    const formRef = useRef<ScrollView>(null);
    const styles = useThemeStyles();
    if (!walletOnfidoData) {
        return;
    }
    const {isLoading = false, hasAcceptedPrivacyPolicy} = walletOnfidoData;

    const openOnfidoFlow = () => {
        BankAccounts.openOnfidoFlow();
    };

    const onfidoError = ErrorUtils.getLatestErrorMessage(walletOnfidoData) ?? '';
    const onfidoFixableErrors = walletOnfidoData?.fixableErrors ?? [];
    if (Array.isArray(onfidoError)) {
        onfidoError[0] += !isEmptyObject(onfidoFixableErrors) ? `\n${onfidoFixableErrors.join('\n')}` : '';
    }

    return (
        <View style={[styles.flex1, styles.justifyContentBetween]}>
            {!hasAcceptedPrivacyPolicy ? (
                <>
                    <FormScrollView ref={formRef}>
                        <View style={[styles.mh5, styles.justifyContentCenter]}>
                            <Text style={[styles.mb5]}>
                                {translate('onfidoStep.acceptTerms')}
                                <TextLink href={CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}>{translate('onfidoStep.facialScan')}</TextLink>
                                {', '}
                                <TextLink href={CONST.ONFIDO_PRIVACY_POLICY_URL}>{translate('common.privacy')}</TextLink>
                                {` ${translate('common.and')} `}
                                <TextLink href={CONST.ONFIDO_TERMS_OF_SERVICE_URL}>{translate('common.termsOfService')}</TextLink>.
                            </Text>
                        </View>
                    </FormScrollView>
                    <FixedFooter>
                        <FormAlertWithSubmitButton
                            isAlertVisible={Boolean(onfidoError)}
                            onSubmit={openOnfidoFlow}
                            onFixTheErrorsLinkPressed={() => {
                                formRef.current?.scrollTo({y: 0, animated: true});
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

OnfidoPrivacy.displayName = 'OnfidoPrivacy';

export default withOnyx<OnfidoPrivacyProps, OnfidoPrivacyOnyxProps>({
    walletOnfidoData: {
        key: ONYXKEYS.WALLET_ONFIDO,

        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(OnfidoPrivacy);
