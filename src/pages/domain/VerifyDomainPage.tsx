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
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDomainValidationCode, validateDomain} from '@libs/actions/Domain';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainModalNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type VerifyDomainPageProps = PlatformStackScreenProps<DomainModalNavigatorParamList, typeof SCREENS.DOMAIN.VERIFY_DOMAIN>;

function OrderedListRow({index, children}: {index: number; children: React.ReactNode}) {
    const styles = useThemeStyles();
    return (
        <View style={styles.flexRow}>
            <Text>{index}. </Text>
            <View style={styles.flex1}>{children}</View>
        </View>
    );
}

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
        Navigation.navigate(ROUTES.DOMAIN_DOMAIN_VERIFIED.getRoute(accountID), {forceReplace: true});
    }, [accountID, domain]);

    useEffect(() => {
        if (!accountID) {
            return;
        }
        getDomainValidationCode(accountID);
    });

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

                        <Text style={styles.webViewStyles.baseFontStyle}>
                            {translate('domain.verifyDomain.youMayNeedToConsult')}{' '}
                            <TextLink
                                style={styles.link}
                                href={CONST.DOMAIN_VERIFICATION_HELP_URL}
                            >
                                {translate('common.learnMore')}
                            </TextLink>
                            .
                        </Text>

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

VerifyDomainPage.displayName = 'VerifyDomainPage';
export default VerifyDomainPage;
