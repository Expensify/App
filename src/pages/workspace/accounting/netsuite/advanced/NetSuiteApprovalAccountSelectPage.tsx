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
import {updateNetSuiteApprovalAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteApprovalAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteApprovalAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id;

    const config = policy?.connections?.netsuite?.options.config;
    const netsuiteApprovalAccountOptions = useMemo<SelectorType[]>(
        () => getNetSuiteApprovalAccountOptions(policy ?? undefined, config?.approvalAccount, translate),
        // The default option will be language dependent, so we need to recompute the options when the language changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [config?.approvalAccount, policy, translate],
    );

    const initiallyFocusedOptionKey = useMemo(() => netsuiteApprovalAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteApprovalAccountOptions]);

    const updateCollectionAccount = useCallback(
        ({value}: SelectorType) => {
            if (config?.approvalAccount !== value && policyID) {
                updateNetSuiteApprovalAccount(policyID, value, config?.approvalAccount ?? CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
        },
        [policyID, config?.approvalAccount],
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
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.approvalAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteApprovalAccountSelectPage"
            headerContent={headerContent}
            data={netsuiteApprovalAccountOptions}
            listItem={RadioListItem}
            onSelectRow={updateCollectionAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            title="workspace.netsuite.advancedConfig.approvalAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(NetSuiteApprovalAccountSelectPage);
