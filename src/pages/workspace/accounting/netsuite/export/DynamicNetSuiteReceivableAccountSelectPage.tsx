import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteReceivableAccount} from '@libs/actions/connections/NetSuiteCommands';
import {clearNetSuiteErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteReceivableAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function DynamicNetSuiteReceivableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id;
    const config = policy?.connections?.netsuite?.options.config;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_RECEIVABLE_ACCOUNT_SELECT.path);
    const netsuiteReceivableAccountOptions = useMemo<SelectorType[]>(
        () => getNetSuiteReceivableAccountOptions(policy ?? undefined, config?.receivableAccount),
        [config?.receivableAccount, policy],
    );

    const initiallyFocusedOptionKey = useMemo(() => netsuiteReceivableAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteReceivableAccountOptions]);

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const updateReceivableAccount = useCallback(
        ({value}: SelectorType) => {
            if (config?.receivableAccount !== value && policyID) {
                updateNetSuiteReceivableAccount(policyID, value, config?.receivableAccount);
            }
            goBack();
        },
        [policyID, config?.receivableAccount, goBack],
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
        [translate, styles.pb10, illustrations.Telescope],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteReceivableAccountSelectPage"
            data={netsuiteReceivableAccountOptions}
            listItem={RadioListItem}
            onSelectRow={updateReceivableAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={goBack}
            title="workspace.netsuite.exportInvoices"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(DynamicNetSuiteReceivableAccountSelectPage);
