import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {LaptopOnDeskWithCoffeeAndKey, OpenSafe} from '@components/Icon/Illustrations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
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
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainSamlPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.SAML>;

function DomainSamlPage({route}: DomainSamlPageProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['LockClosed', 'ShieldYellow'] as const);

    const samlFeatures: FeatureListItem[] = useMemo(
        () => [
            {
                icon: OpenSafe,
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
        [illustrations.LockClosed, illustrations.ShieldYellow],
    );

    const accountID = route.params.accountID;
    const [domain, domainResults] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const [isAdmin, isAdminResults] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${accountID}`, {canBeMissing: false});
    const domainName = domain ? Str.extractEmailDomain(domain.email) : undefined;
    const doesDomainExist = !!domain;

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
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
                            illustration={LaptopOnDeskWithCoffeeAndKey}
                            illustrationStyle={styles.emptyStateSamlIllustration}
                            illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter]}
                            titleStyles={styles.textHeadlineH1}
                        />
                    </View>
                </ScrollViewWithContext>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DomainSamlPage.displayName = 'DomainSamlPage';

export default DomainSamlPage;
