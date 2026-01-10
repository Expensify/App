import {useRoute} from '@react-navigation/native';
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
import {clearXeroErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getXeroBankAccounts, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {updateXeroExportNonReimbursableAccount} from '@userActions/connections/Xero';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function XeroBankAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id;
    const {config} = policy?.connections?.xero ?? {};
    const {bankAccounts} = policy?.connections?.xero?.data ?? {};
    const xeroSelectorOptions = useMemo<SelectorType[]>(
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        () => getXeroBankAccounts(policy ?? undefined, config?.export?.nonReimbursableAccount || bankAccounts?.[0]?.id),
        [config?.export?.nonReimbursableAccount, policy, bankAccounts],
    );
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR>>();
    const backTo = route.params?.backTo;

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.xeroBankAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const initiallyFocusedOptionKey = useMemo(() => xeroSelectorOptions?.find((mode) => mode.isSelected)?.keyForList, [xeroSelectorOptions]);

    const updateBankAccount = useCallback(
        ({value}: SelectorType) => {
            if (initiallyFocusedOptionKey !== value && policyID) {
                updateXeroExportNonReimbursableAccount(policyID, value, config?.export?.nonReimbursableAccount);
            }
            goBack();
        },
        [initiallyFocusedOptionKey, policyID, config?.export?.nonReimbursableAccount, goBack],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.xero.noAccountsFound')}
                subtitle={translate('workspace.xero.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10, illustrations.Telescope],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="XeroBankAccountSelectPage"
            data={xeroSelectorOptions}
            listItem={RadioListItem}
            onSelectRow={updateBankAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            headerContent={listHeaderComponent}
            onBackButtonPress={goBack}
            title="workspace.xero.xeroBankAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(XeroBankAccountSelectPage);
