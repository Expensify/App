import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {getExportMenuItem} from './utils';

type WorkspaceCompanyCardAccountSelectCardProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_EXPORT>;

function WorkspaceCompanyCardAccountSelectCardPage({route}: WorkspaceCompanyCardAccountSelectCardProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {policyID, cardID, bank} = route.params;
    const policy = usePolicy(policyID);
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const [searchText, setSearchText] = useState('');

    const [allBankCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bank}`);
    const card = allBankCards?.[cardID];
    const connectedIntegration = PolicyUtils.getConnectedIntegration(policy) ?? CONST.POLICY.CONNECTIONS.NAME.QBO;
    const exportMenuItem = getExportMenuItem(connectedIntegration, policyID, translate, policy, card);
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy);
    const shouldShowTextInput = (exportMenuItem?.data?.length ?? 0) >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const defaultCard = translate('workspace.moreFeatures.companyCards.defaultCard');
    const isXeroConnection = connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.XERO;

    const searchedListOptions = useMemo(() => {
        return exportMenuItem?.data.filter((option) => option.value.toLowerCase().includes(searchText));
    }, [exportMenuItem?.data, searchText]);

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.moreFeatures.companyCards.noAccountsFound')}
                subtitle={currentConnectionName ? translate('workspace.moreFeatures.companyCards.noAccountsFoundDescription', {connection: currentConnectionName}) : undefined}
                containerStyle={styles.pb10}
            />
        ),
        [translate, currentConnectionName, styles],
    );

    const updateExportAccount = useCallback(
        ({value}: SelectorType) => {
            if (!exportMenuItem?.exportType) {
                return;
            }
            const isDefaultCardSelected = value === defaultCard;
            const exportValue = isDefaultCardSelected ? CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE : value;
            CompanyCards.setCompanyCardExportAccount(policyID, workspaceAccountID, cardID, exportMenuItem.exportType, exportValue, bank);

            Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, bank));
        },
        [exportMenuItem?.exportType, workspaceAccountID, cardID, policyID, bank, defaultCard],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            headerContent={
                <View style={[styles.mh5, styles.mb3]}>
                    {!!exportMenuItem?.description && (
                        <Text style={[styles.textNormal]}>
                            {translate('workspace.moreFeatures.companyCards.integrationExportTitleFirstPart', {integration: exportMenuItem.description})}{' '}
                            {!!exportMenuItem && !isXeroConnection && (
                                <>
                                    {translate('workspace.moreFeatures.companyCards.integrationExportTitlePart')}{' '}
                                    <TextLink
                                        style={styles.link}
                                        onPress={exportMenuItem.onExportPagePress}
                                    >
                                        {translate('workspace.moreFeatures.companyCards.integrationExportTitleLinkPart')}{' '}
                                    </TextLink>
                                    {translate('workspace.moreFeatures.companyCards.integrationExportTitleSecondPart')}
                                </>
                            )}
                        </Text>
                    )}
                </View>
            }
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            displayName={WorkspaceCompanyCardAccountSelectCardPage.displayName}
            sections={[{data: searchedListOptions ?? []}]}
            listItem={RadioListItem}
            textInputLabel={translate('common.search')}
            textInputValue={searchText}
            onChangeText={setSearchText}
            onSelectRow={updateExportAccount}
            initiallyFocusedOptionKey={exportMenuItem?.data?.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, bank))}
            headerTitleAlreadyTranslated={exportMenuItem?.description}
            listEmptyContent={listEmptyContent}
            connectionName={connectedIntegration}
            shouldShowTextInput={shouldShowTextInput}
        />
    );
}

WorkspaceCompanyCardAccountSelectCardPage.displayName = 'WorkspaceCompanyCardAccountSelectCardPage';

export default WorkspaceCompanyCardAccountSelectCardPage;
