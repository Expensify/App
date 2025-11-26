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
    accountID: number;

    /** Route to navigate to after successful verification */
    forwardTo: Route;
};

function BaseVerifyDomainPage({accountID, forwardTo}: BaseVerifyDomainPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const domainName = domain ? Str.extractEmailDomain(domain.email) : '';
    const [isAdmin, isAdminMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${accountID}`, {canBeMissing: false});
    const doesDomainExist = !!domain;

    const {asset: Exclamation} = useMemoizedLazyAsset(() => loadExpensifyIcon('Exclamation'));

    useEffect(() => {
        if (!domain?.validated) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(forwardTo, {forceReplace: true}));
    }, [accountID, domain?.validated, forwardTo]);

    useEffect(() => {
        if (!doesDomainExist) {
            return;
        }
        getDomainValidationCode(accountID, domainName);
    }, [accountID, domainName, doesDomainExist]);

    useEffect(() => {
        if (!doesDomainExist) {
            return;
        }
        resetDomainValidationError(accountID);
    }, [accountID, doesDomainExist]);

    if (isLoadingOnyxValue(domainMetadata, isAdminMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    if (!domain || !isAdmin) {
        return <NotFoundPage onLinkPress={() => Navigation.dismissModal()} />;
    }

    return (
        <ScreenWrapper
            testID={BaseVerifyDomainPage.displayName}
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
                        <Text style={styles.webViewStyles.baseFontStyle}>
                            <RenderHTML html={translate('domain.verifyDomain.beforeProceeding', {domainName})} />
                        </Text>

                        <Text style={styles.webViewStyles.baseFontStyle}>
                            <OrderedListRow index={1}>
                                <RenderHTML html={translate('domain.verifyDomain.accessYourDNS', {domainName})} />
                            </OrderedListRow>
                        </Text>

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
                                    onRetry={() => getDomainValidationCode(accountID, domainName)}
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
                            <Text style={styles.mutedNormalTextLabel}>{translate('domain.verifyDomain.warning')}</Text>
                        </View>
                    </View>
                </ScrollView>

                <FormAlertWithSubmitButton
                    buttonText={translate('domain.verifyDomain.title')}
                    onSubmit={() => validateDomain(accountID, domainName)}
                    message={getLatestErrorMessage({errors: domain.domainValidationError})}
                    isAlertVisible={!!domain.domainValidationError}
                    containerStyles={styles.mb5}
                    isLoading={domain.isValidationPending}
                />
            </View>
        </ScreenWrapper>
    );
}

BaseVerifyDomainPage.displayName = 'BaseVerifyDomainPage';
export default BaseVerifyDomainPage;
