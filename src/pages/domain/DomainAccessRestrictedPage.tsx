import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {Checkmark} from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Domain} from '@src/types/onyx';

type DomainAccessRestrictedPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED>;

const domainNameSelector = (domain: OnyxEntry<Domain>) => (domain?.email ? Str.extractEmailDomain(domain.email) : undefined);

const FEATURES: TranslationPaths[] = [
    'domain.accessRestricted.companyCardManagement',
    'domain.accessRestricted.accountCreationAndDeletion',
    'domain.accessRestricted.workspaceCreation',
    'domain.accessRestricted.samlSSO',
];

function DomainAccessRestrictedPage({route}: DomainAccessRestrictedPageProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const accountID = route.params.accountID;
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: false, selector: domainNameSelector});

    if (!domainName) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID={DomainAccessRestrictedPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('domain.accessRestricted.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="always"
            >
                <View style={[styles.pt3, styles.ph5, styles.gap5]}>
                    <Text style={[styles.webViewStyles.baseFontStyle]}>
                        <RenderHTML html={translate('domain.accessRestricted.subtitle', {domainName})} />
                    </Text>

                    <View style={styles.gap2}>
                        {FEATURES.map((featureTranslationPath) => (
                            <Text
                                style={[styles.dFlex, styles.alignItemsCenter]}
                                key={featureTranslationPath}
                            >
                                <Icon
                                    src={Checkmark}
                                    additionalStyles={[styles.mr3]}
                                    fill={theme.iconSuccessFill}
                                />
                                {translate(featureTranslationPath)}
                            </Text>
                        ))}
                    </View>
                </View>
            </ScrollView>
            <FixedFooter>
                <Button
                    large
                    success
                    text={translate('common.verify')}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(accountID))}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

DomainAccessRestrictedPage.displayName = 'DomainAccessRestrictedPage';
export default DomainAccessRestrictedPage;
