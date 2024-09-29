import React, {useCallback, useMemo} from 'react';
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
import * as Policy from '@libs/actions/Policy/Policy';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
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

    const [allBankCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bank}`);
    const card = allBankCards?.[cardID];
    const connectedIntegration = PolicyUtils.getConnectedIntegration(policy) ?? CONST.POLICY.CONNECTIONS.NAME.QBO;
    const exportMenuItem = getExportMenuItem(connectedIntegration, policyID, translate, policy, card);
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy);

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
            Policy.setCompanyCardExportAccount(workspaceAccountID, cardID, exportMenuItem.exportType, value, bank);

            Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, bank));
        },
        [exportMenuItem?.exportType, workspaceAccountID, cardID, policyID, bank],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            headerContent={
                <View style={[styles.mh5, styles.mb3]}>
                    {exportMenuItem?.description && (
                        <Text style={[styles.textNormal]}>
                            {translate('workspace.moreFeatures.companyCards.integrationExportTitleFirstPart', {integration: exportMenuItem.description})}{' '}
                            {exportMenuItem && (
                                <TextLink
                                    style={styles.link}
                                    onPress={exportMenuItem.onExportPagePress}
                                >
                                    {translate('workspace.moreFeatures.companyCards.integrationExportTitleLinkPart')}{' '}
                                </TextLink>
                            )}
                            {translate('workspace.moreFeatures.companyCards.integrationExportTitleSecondPart')}
                        </Text>
                    )}
                </View>
            }
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            displayName={WorkspaceCompanyCardAccountSelectCardPage.displayName}
            sections={[{data: exportMenuItem?.data ?? []}]}
            listItem={RadioListItem}
            onSelectRow={updateExportAccount}
            initiallyFocusedOptionKey={exportMenuItem?.data?.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, bank))}
            headerTitleAlreadyTranslated={exportMenuItem?.description}
            listEmptyContent={listEmptyContent}
            connectionName={connectedIntegration}
        />
    );
}

WorkspaceCompanyCardAccountSelectCardPage.displayName = 'WorkspaceCompanyCardAccountSelectCardPage';

export default WorkspaceCompanyCardAccountSelectCardPage;
