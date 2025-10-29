import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {Exclamation} from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDomainValidationCode, validateDomain} from '@libs/actions/Domain';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function OrderedListRow({index, children}: {index: number; children: React.ReactNode}) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flexRow, styles.pl1]}>
            <Text>{index}. </Text>
            <View style={styles.flex1}>{children}</View>
        </View>
    );
}

type VerifyDomainPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_VERIFY_DOMAIN>;

function VerifyDomainPage({route}: VerifyDomainPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const accountID = route.params?.accountID;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const domainName = domain ? Str.extractEmailDomain(domain.email) : '';

    useEffect(() => {
        if (!domain?.validated) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_VERIFIED.getRoute(accountID), {forceReplace: true});
    }, [accountID, domain]);

    useEffect(() => {
        if (!accountID) {
            return;
        }
        getDomainValidationCode(accountID, domainName);
    }, [accountID, domainName]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            testID={VerifyDomainPage.displayName}
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
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
                                <Text style={[styles.webViewStyles.baseFontStyle, styles.pb3]}>{translate('domain.verifyDomain.addTXTRecord')}</Text>

                                {domain?.validateCodeLoadingStatus !== 'error' && (
                                    <CopyableTextField
                                        value={domain?.validateCode}
                                        isLoading={domain?.validateCodeLoadingStatus === 'loading'}
                                    />
                                )}
                            </OrderedListRow>

                            {domain?.validateCodeLoadingStatus === 'error' && (
                                <View style={[styles.flexRow, styles.justifyContentBetween, styles.gap3]}>
                                    <FormHelpMessage
                                        message={translate('domain.verifyDomain.codeFetchError')}
                                        style={[styles.mt0, styles.mb0]}
                                    />
                                    <Button
                                        small
                                        text={translate('domain.retry')}
                                        onPress={() => getDomainValidationCode(accountID, domainName)}
                                    />
                                </View>
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
                    message={domain?.domainValidationError ? getLatestErrorMessage({errors: domain?.domainValidationError}) : translate('domain.verifyDomain.genericError')}
                    isAlertVisible={!!domain?.domainValidationError || domain?.validationPendingStatus === 'error'}
                    containerStyles={styles.mb5}
                    isLoading={domain?.validationPendingStatus === 'pending'}
                />
            </View>
        </ScreenWrapper>
    );
}

VerifyDomainPage.displayName = 'VerifyDomainPage';
export default VerifyDomainPage;
