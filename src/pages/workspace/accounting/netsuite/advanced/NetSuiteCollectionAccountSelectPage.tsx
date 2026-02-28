import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCollectionAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteCollectionAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteCollectionAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id;
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const config = policy?.connections?.netsuite?.options.config;
    const netsuiteCollectionAccountOptions = useMemo<SelectorType[]>(
        () => getNetSuiteCollectionAccountOptions(policy ?? undefined, config?.collectionAccount),
        [config?.collectionAccount, policy],
    );

    const initiallyFocusedOptionKey = useMemo(() => netsuiteCollectionAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteCollectionAccountOptions]);

    const updateCollectionAccount = useCallback(
        ({value}: SelectorType) => {
            if (config?.collectionAccount !== value && policyID) {
                updateNetSuiteCollectionAccount(policyID, value, config?.collectionAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
        },
        [policyID, config?.collectionAccount],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noAccountsFound')}
                subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [illustrations.Telescope, translate, styles.pb10],
    );

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.collectionsAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteCollectionAccountSelectPage"
            headerContent={headerContent}
            data={netsuiteCollectionAccountOptions}
            listItem={RadioListItem}
            onSelectRow={updateCollectionAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            title="workspace.netsuite.advancedConfig.collectionsAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={config?.reimbursableExpensesExportDestination === CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.COLLECTION_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.COLLECTION_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.COLLECTION_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(NetSuiteCollectionAccountSelectPage);
