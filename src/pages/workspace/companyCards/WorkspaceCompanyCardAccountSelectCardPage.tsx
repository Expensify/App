import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import RenderHTML from '@components/RenderHTML';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {setCompanyCardExportAccount} from '@libs/actions/CompanyCards';
import {getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getConnectedIntegration, getCurrentConnectionName} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {getExportMenuItem} from './utils';

type WorkspaceCompanyCardAccountSelectCardProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_EXPORT>;

function WorkspaceCompanyCardAccountSelectCardPage({route}: WorkspaceCompanyCardAccountSelectCardProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const {policyID, cardID, backTo} = route.params;
    const feed = route.params.feed;
    const policy = usePolicy(policyID);
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [searchText, setSearchText] = useState('');

    const [allBankCards] = useCardsList(feed);
    const card = allBankCards?.[cardID];
    const connectedIntegration = getConnectedIntegration(policy) ?? CONST.POLICY.CONNECTIONS.NAME.QBO;
    // We need to have an unchanged active route for getExportMenuItem so the export page link is not updated incorrectly when user is in other pages
    // See https://github.com/Expensify/App/issues/72352 for more details.
    const activeRoute = useMemo(() => Navigation.getActiveRoute(), []);
    const exportMenuItem = getExportMenuItem(connectedIntegration, policyID, translate, policy, card, activeRoute);
    const currentConnectionName = getCurrentConnectionName(policy);
    const shouldShowTextInput = (exportMenuItem?.data?.length ?? 0) >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const defaultCard = translate('workspace.moreFeatures.companyCards.defaultCard');
    const defaultVendor = translate('workspace.accounting.defaultVendor');
    const isXeroConnection = connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.XERO;
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feed]);

    const searchedListOptions = useMemo(() => {
        return tokenizedSearch(exportMenuItem?.data ?? [], searchText, (option) => [option.value]);
    }, [exportMenuItem?.data, searchText]);

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.moreFeatures.companyCards.noAccountsFound')}
            subtitle={currentConnectionName ? translate('workspace.moreFeatures.companyCards.noAccountsFoundDescription', currentConnectionName) : undefined}
            containerStyle={styles.pb10}
        />
    );

    const updateExportAccount = ({value}: SelectorType) => {
        if (!exportMenuItem?.exportType) {
            return;
        }
        const isDefaultSelected = value === defaultCard || value === defaultVendor;
        const exportValue = isDefaultSelected ? CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE : value;
        setCompanyCardExportAccount(policyID, domainOrWorkspaceAccountID, cardID, exportMenuItem.exportType, exportValue, getCompanyCardFeed(feed));

        Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, feed, cardID, backTo));
    };

    return (
        <SelectionScreen
            policyID={policyID}
            headerContent={
                <View style={[styles.mh5, styles.mb3]}>
                    {!!exportMenuItem?.description && (
                        <View style={[styles.renderHTML, styles.flexRow]}>
                            <RenderHTML
                                html={
                                    isXeroConnection
                                        ? translate('workspace.moreFeatures.companyCards.integrationExportTitleXero', {integration: exportMenuItem.description})
                                        : translate('workspace.moreFeatures.companyCards.integrationExportTitle', {
                                              integration: exportMenuItem.description,
                                              exportPageLink: `${environmentURL}/${exportMenuItem.exportPageLink}`,
                                          })
                                }
                            />
                        </View>
                    )}
                </View>
            }
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            displayName="WorkspaceCompanyCardAccountSelectCardPage"
            data={searchedListOptions ?? []}
            listItem={RadioListItem}
            textInputOptions={{
                label: translate('common.search'),
                value: searchText,
                onChangeText: setSearchText,
            }}
            onSelectRow={updateExportAccount}
            initiallyFocusedOptionKey={exportMenuItem?.data?.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, feed, cardID, backTo))}
            headerTitleAlreadyTranslated={exportMenuItem?.description}
            listEmptyContent={listEmptyContent}
            connectionName={connectedIntegration}
            shouldShowTextInput={shouldShowTextInput}
        />
    );
}

export default WorkspaceCompanyCardAccountSelectCardPage;
