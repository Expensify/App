import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import CopyableTextField from '@components/Domain/CopyableTextField';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
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
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function OrderedListRow({index, children}: {index: number; children: React.ReactNode}) {
    const styles = useThemeStyles();
    return (
        <View style={styles.flexRow}>
            <Text>{index}. </Text>
            <View style={styles.flex1}>{children}</View>
        </View>
    );
}

function BaseVerifyDomainPage({accountID, forwardTo}: {accountID: number; forwardTo: 'WORKSPACES_DOMAIN_VERIFIED' | 'DOMAIN_VERIFIED'}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const domainName = domain ? Str.extractEmailDomain(domain.email) : '';

    useEffect(() => {
        if (!domain?.validated) {
            return;
        }
        Navigation.navigate(ROUTES[forwardTo].getRoute(accountID), {forceReplace: true});
    }, [accountID, domain, forwardTo]);

    useEffect(() => {
        if (!accountID) {
            return;
        }
        getDomainValidationCode(accountID);
    }, [accountID]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            testID={BaseVerifyDomainPage.displayName}
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

                        <OrderedListRow index={2}>
                            <View>
                                <Text style={[styles.webViewStyles.baseFontStyle, styles.pb3]}>{translate('domain.verifyDomain.addTXTRecord')}</Text>

                                <CopyableTextField
                                    value={domain?.validateCode}
                                    isLoading={domain?.isValidateCodeLoading}
                                />
                            </View>
                        </OrderedListRow>

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
                    onSubmit={() => validateDomain(accountID)}
                    message={domain?.validationError}
                    isAlertVisible={!!domain?.validationError}
                    containerStyles={styles.mb5}
                    isLoading={domain?.isValidationPending}
                />
            </View>
        </ScreenWrapper>
    );
}

BaseVerifyDomainPage.displayName = 'VerifyDomainPage';
export default BaseVerifyDomainPage;
