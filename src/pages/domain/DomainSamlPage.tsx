import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {LaptopOnDeskWithCoffeeAndKey, LockClosed, OpenSafe, ShieldYellow} from '@components/Icon/Illustrations';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
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

type DomainSamlPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.SAML>;

const samlFeatures: FeatureListItem[] = [
    {
        icon: OpenSafe,
        translationKey: 'domain.featureList.fasterAndEasierLogin',
    },
    {
        icon: ShieldYellow,
        translationKey: 'domain.featureList.moreSecurityAndControl',
    },
    {
        icon: LockClosed,
        translationKey: 'domain.featureList.onePasswordForAnything',
    },
];

function DomainSamlPage({route}: DomainSamlPageProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();

    const accountID = route.params.accountID;
    const [domain, domainResults] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const domainName = domain ? Str.extractEmailDomain(domain.email) : undefined;

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            testID={DomainSamlPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.route)}
                shouldShow={domainResults.status === 'loaded' && !domain}
                shouldForceFullScreen
                shouldDisplaySearchRouter
            >
                <HeaderWithBackButton
                    title={translate('domain.saml')}
                    onBackButtonPress={Navigation.popToSidebar}
                    icon={LockClosed}
                    shouldShowBackButton={shouldUseNarrowLayout}
                />

                <ScrollViewWithContext
                    keyboardShouldPersistTaps="handled"
                    style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                >
                    <View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
                        <FeatureList
                            menuItems={samlFeatures}
                            title={translate('domain.featureList.title')}
                            renderSubtitle={() => (
                                <View style={styles.pt3}>
                                    <RenderHTML html={translate('domain.featureList.subtitle', {domainName: domainName ?? ''})} />
                                </View>
                            )}
                            ctaText={translate('domain.verifyDomain.title')}
                            ctaAccessibilityLabel={translate('domain.verifyDomain.title')}
                            onCtaPress={() => {
                                Navigation.navigate(ROUTES.DOMAIN_VERIFY.getRoute(accountID));
                            }}
                            illustrationBackgroundColor={colors.blue700}
                            illustration={LaptopOnDeskWithCoffeeAndKey}
                            illustrationStyle={{width: 216, height: 186}}
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
