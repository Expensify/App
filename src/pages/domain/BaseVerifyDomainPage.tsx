import {Str} from 'expensify-common';
import type {PropsWithChildren} from 'react';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormHelpMessageRowWithRetryButton from '@components/Domain/FormHelpMessageRowWithRetryButton';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {loadExpensifyIcon} from '@components/Icon/ExpensifyIconLoader';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDomainValidationCode, resetDomainValidationError, validateDomain} from '@libs/actions/Domain';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function OrderedListRow({index, children}: PropsWithChildren<{index: number}>) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flexRow, styles.flex1]}>
            <Text style={styles.pr1}>{index}.</Text>
            {children}
        </View>
    );
}

type BaseVerifyDomainPageProps = {
    /** The accountID of the domain */
    domainAccountID: number;

    /** Route to navigate to after successful verification */
    forwardTo: Route;
};

function BaseVerifyDomainPage({domainAccountID, forwardTo}: BaseVerifyDomainPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});
    const domainName = domain ? Str.extractEmailDomain(domain.email) : '';
    const doesDomainExist = !!domain;

    const {asset: Exclamation} = useMemoizedLazyAsset(() => loadExpensifyIcon('Exclamation'));

    useEffect(() => {
        if (!domain?.hasValidationSucceeded) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(forwardTo, {forceReplace: true}));
    }, [domainAccountID, domain?.hasValidationSucceeded, forwardTo]);

    useEffect(() => {
        if (!doesDomainExist) {
            return;
        }
        getDomainValidationCode(domainAccountID, domainName);
    }, [domainAccountID, domainName, doesDomainExist]);

    useEffect(() => {
        if (!doesDomainExist) {
            return;
        }
        resetDomainValidationError(domainAccountID);
    }, [domainAccountID, doesDomainExist]);

    if (isLoadingOnyxValue(domainMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    if (!domain) {
        return <NotFoundPage onLinkPress={() => Navigation.dismissModal()} />;
    }

    return (
        <ScreenWrapper
            testID="BaseVerifyDomainPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('domain.verifyDomain.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.ph5, styles.flex1]}>
                <ScrollView
                    contentContainerStyle={styles.flexGrow1}
                    keyboardShouldPersistTaps="always"
                >
                    <View style={[styles.pt3, styles.gap5]}>
                        <View style={[styles.renderHTML, styles.webViewStyles.baseFontStyle]}>
                            <RenderHTML html={translate('domain.verifyDomain.beforeProceeding', {domainName})} />
                        </View>

                        <View style={[styles.renderHTML, styles.webViewStyles.baseFontStyle]}>
                            <OrderedListRow index={1}>
                                <RenderHTML html={translate('domain.verifyDomain.accessYourDNS', {domainName})} />
                            </OrderedListRow>
                        </View>

                        <View>
                            <OrderedListRow index={2}>
                                <View style={styles.flex1}>
                                    <Text style={[styles.webViewStyles.baseFontStyle, styles.pb3]}>{translate('domain.verifyDomain.addTXTRecord')}</Text>

                                    {!domain.validateCodeError && (
                                        <CopyableTextField
                                            value={domain.validateCode}
                                            isLoading={domain.isValidateCodeLoading}
                                        />
                                    )}
                                </View>
                            </OrderedListRow>

                            {!!domain.validateCodeError && (
                                <FormHelpMessageRowWithRetryButton
                                    message={getLatestErrorMessage({errors: domain.validateCodeError})}
                                    onRetry={() => getDomainValidationCode(domainAccountID, domainName)}
                                    isButtonSmall
                                />
                            )}
                        </View>

                        <OrderedListRow index={3}>
                            <Text style={styles.webViewStyles.baseFontStyle}>{translate('domain.verifyDomain.saveChanges')}</Text>
                        </OrderedListRow>

                        <RenderHTML html={translate('domain.verifyDomain.youMayNeedToConsult')} />

                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                            <Icon
                                src={Exclamation}
                                fill={theme.icon}
                                medium
                            />

                            <View style={styles.flex1}>
                                <Text style={styles.mutedNormalTextLabel}>{translate('domain.verifyDomain.warning')}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <FormAlertWithSubmitButton
                    buttonText={translate('domain.verifyDomain.title')}
                    onSubmit={() => validateDomain(domainAccountID, domainName)}
                    message={getLatestErrorMessage({errors: domain.domainValidationError})}
                    isAlertVisible={!!domain.domainValidationError}
                    containerStyles={styles.mb5}
                    isLoading={domain.isValidationPending}
                />
            </View>
        </ScreenWrapper>
    );
}

export default BaseVerifyDomainPage;
