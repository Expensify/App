import React, {useCallback, useMemo} from 'react';
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
import {getXeroSuppliers, hasVendorFeature, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

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
    // is off, but the route remains addressable on its own.
    const isFeatureAvailable = hasVendorFeature(policy, isBetaEnabled(CONST.BETAS.VENDOR_MATCHING));

    const suppliers = useMemo(() => getXeroSuppliers(policy), [policy]);
    const data: SelectorType[] = useMemo(
        () =>
            suppliers.map((supplier) => ({
                value: supplier.id,
                text: supplier.name,
                keyForList: supplier.id,
                isSelected: supplier.id === currentContactID,
            })),
        [suppliers, currentContactID],
    );

    const goBack = useCallback(() => {
        Navigation.goBack(policyID ? createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.path, ROUTES.POLICY_ACCOUNTING.getRoute(policyID)) : undefined);
    }, [policyID]);

    const selectSupplier = useCallback(
        ({value}: SelectorType) => {
            // Defence-in-depth: if the screen render race-ended with isFeatureAvailable still
            // truthy and the user managed to tap, refuse to persist the update.
            if (!isFeatureAvailable) {
                goBack();
                return;
            }
            if (value !== currentContactID && policyID) {
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
