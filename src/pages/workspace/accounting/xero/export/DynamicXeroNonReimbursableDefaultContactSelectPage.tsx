import React, {useCallback, useMemo, useState} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateManyPolicyConnectionConfigs} from '@libs/actions/connections';
import {clearXeroErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getXeroSuppliers, isXeroVendorMatchingActive, settingsPendingAction} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

// Sentinel value persisted to defaultContact when the admin wants to disable the fallback
// supplier altogether — gives them a way out when a previously chosen Xero contact was deleted
// or the workspace no longer wants any default applied to card transactions on export.
const CLEAR_DEFAULT_CONTACT_VALUE = '';

function DynamicXeroNonReimbursableDefaultContactSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id;
    const xeroConfig = policy?.connections?.xero?.config;
    const currentContactID = xeroConfig?.defaultContact;
    // Match the parent page's gate so direct deep-links (or stale-open tabs after the beta is
    // revoked) cannot reach the supplier updater. The parent page hides the row when the feature
    // is off, but the route remains addressable on its own. Gated on Xero specifically being
    // configured — not the global hasVendorFeature predicate — so dual-connected workspaces mid
    // Xero tenant switch (config.isConfigured=false with stale data.contacts) cannot persist a
    // defaultContact from the prior tenant.
    const isFeatureAvailable = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING) && isXeroVendorMatchingActive(policy);

    const suppliers = useMemo(() => getXeroSuppliers(policy), [policy]);
    const [searchText, setSearchText] = useState('');

    // Prepend a "None" row so an admin can persist an empty default — without it the picker has
    // no way to remove a stale or deleted supplier and the optional setting becomes sticky.
    const clearOption: SelectorType = useMemo(
        () => ({
            value: CLEAR_DEFAULT_CONTACT_VALUE,
            text: translate('common.none'),
            keyForList: CLEAR_DEFAULT_CONTACT_VALUE,
            isSelected: !currentContactID,
        }),
        [translate, currentContactID],
    );

    const supplierOptions: SelectorType[] = useMemo(
        () =>
            suppliers.map((supplier) => ({
                value: supplier.id,
                text: supplier.name,
                keyForList: supplier.id,
                isSelected: supplier.id === currentContactID,
            })),
        [suppliers, currentContactID],
    );

    // Match the threshold the Company Cards export picker uses for its search input — Xero
    // tenants with hundreds or thousands of contacts need filtering, but the search row would
    // be wasted chrome on a 5-supplier workspace.
    const shouldShowTextInput = supplierOptions.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const filteredSupplierOptions = useMemo(
        () => (shouldShowTextInput ? tokenizedSearch(supplierOptions, searchText, (option) => [option.text ?? '']) : supplierOptions),
        [shouldShowTextInput, supplierOptions, searchText],
    );

    // Only prepend the clear row when there's a default to clear or there are suppliers to choose
    // between. Without this guard, an unsynced workspace with no defaultContact set would render
    // `[None]` and never show the noSuppliersFound BlockingView (SelectionScreen only renders
    // listEmptyContent when data is empty). The clear row stays visible regardless of the search
    // term so it's always reachable for clearing an existing default.
    const shouldShowClearOption = !!currentContactID || supplierOptions.length > 0;
    const data: SelectorType[] = useMemo(
        () => (shouldShowClearOption ? [clearOption, ...filteredSupplierOptions] : filteredSupplierOptions),
        [shouldShowClearOption, clearOption, filteredSupplierOptions],
    );

    const goBack = useCallback(() => {
        Navigation.goBack(policyID ? createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.path, ROUTES.POLICY_ACCOUNTING.getRoute(policyID)) : undefined);
    }, [policyID]);

    const selectSupplier = useCallback(
        ({value}: SelectorType) => {
            // Defense-in-depth: if the screen render race-ended with isFeatureAvailable still
            // truthy and the user managed to tap, refuse to persist the update.
            if (!isFeatureAvailable) {
                goBack();
                return;
            }
            // Treat the clear row and an already-empty default as the same state so picking
            // "None" on a workspace that never had a default doesn't fire a no-op write.
            const isAlreadySelected = value === currentContactID || (!value && !currentContactID);
            if (!isAlreadySelected && policyID) {
                updateManyPolicyConnectionConfigs(
                    policyID,
                    CONST.POLICY.CONNECTIONS.NAME.XERO,
                    {[CONST.XERO_CONFIG.DEFAULT_CONTACT]: value},
                    {[CONST.XERO_CONFIG.DEFAULT_CONTACT]: currentContactID},
                );
            }
            goBack();
        },
        [currentContactID, policyID, isFeatureAvailable, goBack],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.xero.noSuppliersFound')}
                subtitle={translate('workspace.xero.noSuppliersFoundDescription')}
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
            shouldBeBlocked={!isFeatureAvailable}
            displayName="DynamicXeroNonReimbursableDefaultContactSelectPage"
            title="workspace.xero.defaultSupplier"
            data={data}
            onSelectRow={selectSupplier}
            shouldSingleExecuteRowSelect
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={{
                label: translate('common.search'),
                value: searchText,
                onChangeText: setSearchText,
            }}
            initiallyFocusedOptionKey={data.find((item) => item.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            onBackButtonPress={goBack}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.DEFAULT_CONTACT], xeroConfig?.pendingFields)}
            errors={getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.DEFAULT_CONTACT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearXeroErrorField(policyID, CONST.XERO_CONFIG.DEFAULT_CONTACT)}
        />
    );
}

export default withPolicyConnections(DynamicXeroNonReimbursableDefaultContactSelectPage);
