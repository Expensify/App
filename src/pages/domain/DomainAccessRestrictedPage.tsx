import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
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
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {domainNameSelector} from '@src/selectors/Domain';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainAccessRestrictedPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED>;

const FEATURES: TranslationPaths[] = [
    'domain.accessRestricted.companyCardManagement',
    'domain.accessRestricted.accountCreationAndDeletion',
    'domain.accessRestricted.workspaceCreation',
    'domain.accessRestricted.samlSSO',
];

function DomainAccessRestrictedPage({route}: DomainAccessRestrictedPageProps) {
    const {asset: Checkmark} = useMemoizedLazyAsset(() => loadExpensifyIcon('Checkmark'));
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const {domainAccountID} = route.params;
    const [domainName, domainNameResults] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: false, selector: domainNameSelector});

    if (isLoadingOnyxValue(domainNameResults)) {
        return <FullScreenLoadingIndicator />;
    }

    if (!domainName) {
        return <NotFoundPage onLinkPress={() => Navigation.dismissModal()} />;
    }

    return (
        <ScreenWrapper testID="DomainAccessRestrictedPage">
            <HeaderWithBackButton
                title={translate('domain.accessRestricted.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView
                contentContainerStyle={[styles.flexGrow1, styles.pt3, styles.ph5, styles.gap5]}
                keyboardShouldPersistTaps="always"
            >
                <View style={styles.flexRow}>
                    <RenderHTML html={translate('domain.accessRestricted.subtitle', domainName)} />
                </View>

                <View style={styles.gap2}>
                    {FEATURES.map((featureTranslationPath) => (
                        <View
                            style={[styles.alignItemsCenter, styles.flexRow]}
                            key={featureTranslationPath}
                        >
                            <Icon
                                src={Checkmark}
                                additionalStyles={styles.mr2}
                                fill={theme.iconSuccessFill}
                            />
                            <Text>{translate(featureTranslationPath)}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
            <FixedFooter>
                <Button
                    large
                    success
                    text={translate('common.verify')}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(domainAccountID))}
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default DomainAccessRestrictedPage;
