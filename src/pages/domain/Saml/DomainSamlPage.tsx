import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSamlSettings} from '@libs/actions/Domain';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@libs/Navigation/types';
import colors from '@styles/theme/colors';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {DomainSettings} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SamlConfigurationDetailsSection from './SamlConfigurationDetailsSection';
import SamlLoginSection from './SamlLoginSection';

type DomainSamlPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.SAML>;

const domainSamlSettingsSelector = (domainSettings: OnyxEntry<DomainSettings>) => ({
    isSamlEnabled: domainSettings?.settings.samlEnabled,
    isSamlRequired: domainSettings?.settings.samlRequired,
    oktaSCIM: domainSettings?.settings.oktaSCIM,
});

function DomainSamlPage({route}: DomainSamlPageProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['LaptopOnDeskWithCoffeeAndKey', 'LockClosed', 'OpenSafe', 'ShieldYellow'] as const);

    const accountID = route.params.accountID;
    const [domain, domainResults] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const [isAdmin, isAdminResults] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${accountID}`, {canBeMissing: false});

    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${accountID}`, {
        canBeMissing: false,
        selector: domainSamlSettingsSelector,
    });
    const isSamlEnabled = !!domainSettings?.isSamlEnabled;
    const isSamlRequired = !!domainSettings?.isSamlRequired;

    const domainName = domain ? Str.extractEmailDomain(domain.email) : undefined;
    const doesDomainExist = !!domain;

    const samlFeatures: FeatureListItem[] = [
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
    ];

    useEffect(() => {
        if (!domainName) {
            return;
        }
        getSamlSettings(accountID, domainName);
    }, [accountID, domainName]);

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            testID={DomainSamlPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.route)}
                shouldShow={!isLoadingOnyxValue(domainResults, isAdminResults) && (!doesDomainExist || !isAdmin)}
                shouldForceFullScreen
                shouldDisplaySearchRouter
            >
                <HeaderWithBackButton
                    title={translate('domain.saml')}
                    onBackButtonPress={Navigation.popToSidebar}
                    icon={illustrations.LockClosed}
                    shouldShowBackButton={shouldUseNarrowLayout}
                />

                <ScrollViewWithContext
                    keyboardShouldPersistTaps="handled"
                    style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                >
                    <View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
                        {domain?.validated ? (
                            <>
                                <SamlLoginSection
                                    accountID={accountID}
                                    domainName={domainName ?? ''}
                                    isSamlEnabled={isSamlEnabled}
                                    isSamlRequired={isSamlRequired}
                                />

                                {isSamlEnabled && (
                                    <SamlConfigurationDetailsSection
                                        accountID={accountID}
                                        domainName={domainName ?? ''}
                                        shouldShowOktaScim={isSamlRequired && !!domainSettings.oktaSCIM}
                                    />
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
                                    Navigation.navigate(ROUTES.DOMAIN_VERIFY.getRoute(accountID));
                                }}
                                illustrationBackgroundColor={colors.blue700}
                                illustration={illustrations.LaptopOnDeskWithCoffeeAndKey}
                                illustrationStyle={styles.emptyStateSamlIllustration}
                                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
                                titleStyles={styles.textHeadlineH1}
                            />
                        )}
                    </View>
                </ScrollViewWithContext>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DomainSamlPage.displayName = 'DomainSamlPage';

export default DomainSamlPage;
