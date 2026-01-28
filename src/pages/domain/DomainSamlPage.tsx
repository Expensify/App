import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@libs/Navigation/types';
import colors from '@styles/theme/colors';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {domainMemberSamlSettingsSelector} from '@src/selectors/Domain';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SamlConfigurationDetailsSectionContent from './Saml/SamlConfigurationDetailsSectionContent';
import SamlLoginSectionContent from './Saml/SamlLoginSectionContent';

type DomainSamlPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.SAML>;

function DomainSamlPage({route}: DomainSamlPageProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['LaptopOnDeskWithCoffeeAndKey', 'LockClosed', 'OpenSafe', 'ShieldYellow']);

    const domainAccountID = route.params?.domainAccountID;
    const [domain, domainResults] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});
    const [isAdmin, isAdminResults] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${domainAccountID}`, {canBeMissing: false});
    const [domainSettings, domainSettingsResults] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: domainMemberSamlSettingsSelector,
    });

    const isSamlEnabled = !!domainSettings?.samlEnabled;
    const isSamlRequired = !!domainSettings?.samlRequired;
    const domainName = domain ? Str.extractEmailDomain(domain.email) : undefined;
    const doesDomainExist = !!domain;

    const samlFeatures: FeatureListItem[] = useMemo(
        () => [
            {
                icon: illustrations.OpenSafe,
                translationKey: 'domain.samlFeatureList.fasterAndEasierLogin',
            },
            {
                icon: illustrations.ShieldYellow,
                translationKey: 'domain.samlFeatureList.moreSecurityAndControl',
            },
            {
                icon: illustrations.LockClosed,
                translationKey: 'domain.samlFeatureList.onePasswordForAnything',
            },
        ],
        [illustrations.OpenSafe, illustrations.ShieldYellow, illustrations.LockClosed],
    );

    if (isLoadingOnyxValue(domainResults, isAdminResults, domainSettingsResults)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            testID="DomainSamlPage"
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.route)}
                shouldShow={!doesDomainExist || !isAdmin}
                shouldForceFullScreen
                shouldDisplaySearchRouter
            >
                <HeaderWithBackButton
                    title={translate('domain.saml')}
                    onBackButtonPress={Navigation.popToSidebar}
                    icon={illustrations.LockClosed}
                    shouldShowBackButton={shouldUseNarrowLayout}
                />

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    addBottomSafeAreaPadding
                    style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                >
                    <View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
                        {domain?.validated && domainName ? (
                            <>
                                <Section
                                    title={translate('domain.samlLogin.title')}
                                    renderSubtitle={() => <RenderHTML html={translate('domain.samlLogin.subtitle')} />}
                                    isCentralPane
                                    titleStyles={styles.accountSettingsSectionTitle}
                                    childrenStyles={[styles.gap6, styles.pt6]}
                                >
                                    <SamlLoginSectionContent
                                        accountID={domainAccountID}
                                        domainName={domainName}
                                        isSamlEnabled={isSamlEnabled}
                                        isSamlRequired={isSamlRequired}
                                        isOktaScimEnabled={!!domainSettings?.oktaSCIM}
                                    />
                                </Section>

                                {isSamlEnabled && (
                                    <Section
                                        title={translate('domain.samlConfigurationDetails.title')}
                                        subtitle={translate('domain.samlConfigurationDetails.subtitle')}
                                        subtitleMuted
                                        isCentralPane
                                        titleStyles={styles.accountSettingsSectionTitle}
                                        childrenStyles={[styles.gap6, styles.pt6]}
                                    >
                                        <SamlConfigurationDetailsSectionContent
                                            accountID={domainAccountID}
                                            domainName={domainName}
                                            shouldShowScimToken={isSamlRequired && !!domainSettings.oktaSCIM}
                                        />
                                    </Section>
                                )}
                            </>
                        ) : (
                            <FeatureList
                                menuItems={samlFeatures}
                                title={translate('domain.samlFeatureList.title')}
                                renderSubtitle={() => (
                                    <View style={styles.pt3}>
                                        <RenderHTML html={translate('domain.samlFeatureList.subtitle', {domainName: `@${domainName ?? ''}`})} />
                                    </View>
                                )}
                                ctaText={translate('domain.verifyDomain.title')}
                                ctaAccessibilityLabel={translate('domain.verifyDomain.title')}
                                onCtaPress={() => {
                                    Navigation.navigate(ROUTES.DOMAIN_VERIFY.getRoute(domainAccountID));
                                }}
                                illustrationBackgroundColor={colors.blue700}
                                illustration={illustrations.LaptopOnDeskWithCoffeeAndKey}
                                illustrationStyle={styles.emptyStateSamlIllustration}
                                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
                                titleStyles={styles.textHeadlineH1}
                            />
                        )}
                    </View>
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DomainSamlPage;
