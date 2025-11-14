import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import CopyableTextField from '@components/Domain/CopyableTextField';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {LaptopOnDeskWithCoffeeAndKey, LockClosed, OpenSafe, ShieldYellow} from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import Section from '@components/Section';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextPicker from '@components/TextPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSamlSettings, getScimToken, setSamlEnabled, setSamlMetadata, setSamlRequired} from '@libs/actions/Domain';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@libs/Navigation/types';
import colors from '@styles/theme/colors';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {DomainSettings} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainSamlPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.SAML>;

const samlFeatures: FeatureListItem[] = [
    {
        icon: OpenSafe,
        translationKey: 'domain.samlFeatureList.fasterAndEasierLogin',
    },
    {
        icon: ShieldYellow,
        translationKey: 'domain.samlFeatureList.moreSecurityAndControl',
    },
    {
        icon: LockClosed,
        translationKey: 'domain.samlFeatureList.onePasswordForAnything',
    },
];

const domainSamlSettingsSelector = (domainSettings: OnyxEntry<DomainSettings>) => ({
    isSamlEnabled: domainSettings?.settings.samlEnabled,
    isSamlRequired: domainSettings?.settings.samlRequired,
});

function SamlLoginSection({accountID, domainName, isSamlEnabled, isSamlRequired}: {accountID: number; domainName: string; isSamlEnabled: boolean; isSamlRequired: boolean}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <Section
            title={translate('domain.samlLogin.title')}
            renderSubtitle={() => <RenderHTML html={translate('domain.samlLogin.subtitle')} />}
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={[styles.gap6, styles.pt6]}
        >
            <View style={styles.sectionMenuItemTopDescription}>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3, styles.pv1]}>
                    <Text>{translate('domain.samlLogin.enableSamlLogin')}</Text>

                    <Switch
                        accessibilityLabel={translate('domain.samlLogin.enableSamlLogin')}
                        isOn={isSamlEnabled}
                        onToggle={() => setSamlEnabled(!isSamlEnabled, accountID, domainName ?? '')}
                    />
                </View>

                <Text style={[styles.formHelp, styles.pr15]}>{translate('domain.samlLogin.allowMembers')}</Text>
            </View>

            {isSamlEnabled && (
                <View style={styles.sectionMenuItemTopDescription}>
                    <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3, styles.pv1]}>
                        <Text>{translate('domain.samlLogin.requireSamlLogin')}</Text>
                        <Switch
                            accessibilityLabel={translate('domain.samlLogin.requireSamlLogin')}
                            isOn={isSamlRequired}
                            onToggle={() => setSamlRequired(!isSamlRequired, accountID, domainName ?? '')}
                        />
                    </View>

                    <Text style={[styles.formHelp, styles.pr15]}>{translate('domain.samlLogin.anyMemberWillBeRequired')}</Text>
                </View>
            )}
        </Section>
    );
}

function SamlConfigurationDetailsSection({accountID, domainName}: {accountID: number; domainName: string}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const [samlMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_SAML_METADATA}${accountID}`, {canBeMissing: false});

    return (
        <Section
            title={translate('domain.samlConfigurationDetails.title')}
            subtitle={translate('domain.samlConfigurationDetails.subtitle')}
            subtitleMuted
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
            childrenStyles={styles.pt3}
        >
            <TextPicker
                value={samlMetadata?.metaIdentity}
                inputID="identityProviderMetadata"
                description={translate('domain.samlConfigurationDetails.identityProviderMetaData')}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                numberOfLinesTitle={2}
                titleStyle={[styles.fontSizeLabel, styles.textMono]}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb1]}
                numberOfLines={4}
                multiline
                onValueCommitted={(value) => {
                    setSamlMetadata(accountID, domainName ?? '', {metaIdentity: value});
                }}
                errorText={getLatestErrorMessage({errors: domain?.samlMetadataError})}
                maxLength={Infinity}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.entityID}
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.entityID')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={styles.sectionMenuItemTopDescription}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.nameFormat}
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.nameIDFormat')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={styles.sectionMenuItemTopDescription}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.urlLogin}
                        style={styles.mb2}
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.loginUrl')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                hintText={translate('domain.samlConfigurationDetails.acsUrl')}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.urlLogout}
                        style={styles.mb2}
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.logoutUrl')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={styles.sectionMenuItemTopDescription}
                hintText={translate('domain.samlConfigurationDetails.sloUrl')}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <CopyableTextField
                        value={samlMetadata?.metaService}
                        shouldDisplayShowMoreButton
                        textStyle={styles.fontSizeLabel}
                    />
                }
                description={translate('domain.samlConfigurationDetails.serviceProviderMetaData')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={styles.sectionMenuItemTopDescription}
            />

            <MenuItemWithTopDescription
                titleComponent={
                    <Button
                        text={translate('domain.samlConfigurationDetails.revealToken')}
                        style={styles.wFitContent}
                        onPress={() => {
                            getScimToken(accountID, domainName ?? '');
                        }}
                    />
                }
                description={translate('domain.samlConfigurationDetails.oktaScimToken')}
                descriptionTextStyle={[styles.fontSizeLabel, styles.pb2]}
                interactive={false}
                wrapperStyle={styles.sectionMenuItemTopDescription}
            />
        </Section>
    );
}

function DomainSamlPage({route}: DomainSamlPageProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();

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
                    icon={LockClosed}
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
                                illustration={LaptopOnDeskWithCoffeeAndKey}
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
