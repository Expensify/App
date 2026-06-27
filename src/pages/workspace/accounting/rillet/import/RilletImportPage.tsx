import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearRilletErrorField} from '@libs/actions/connections/Rillet';
import {clearSageIntacctErrorField, updateSageIntacctBillable} from '@libs/actions/connections/SageIntacct';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, getCurrentSageIntacctEntityName, settingsPendingAction} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {SageIntacctConnectionsConfig, SageIntacctMappingValue} from '@src/types/onyx/Policy';

function RilletImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const rilletConfig = policy?.connections?.rillet?.config;

    return (
        <ConnectionLayout
            displayName="RilletImportPage"
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.RILLET}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.accounts')}
                subtitle={translate('workspace.rillet.accountTypesDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                title={translate('workspace.rillet.enableNewAccountsTitle')}
                subtitle={translate('workspace.rillet.enableNewAccountsDescription')}
                switchAccessibilityLabel={translate('workspace.rillet.enableNewAccountsTitle')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={rilletConfig?.enableNewCategories ?? false}
                onToggle={() => null}
                pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES], rilletConfig?.pendingFields)}
                errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <View style={[styles.mv3, styles.mh5]}>
                <Text>{translate('workspace.rillet.dimensionsImport')}</Text>
            </View>
            <ToggleSettingOptionRow
                title={translate('workspace.rillet.fieldMappings.departments')}
                switchAccessibilityLabel={translate('workspace.rillet.fieldMappings.departments')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={rilletConfig?.coding.fieldMappings.departments !== CONST.RILLET_MAPPING_VALUE.NONE}
                onToggle={() => null}
                pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.FIELD_MAPPINGS.DEPARTMENTS], rilletConfig?.pendingFields)}
                errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.FIELD_MAPPINGS.DEPARTMENTS)}
                onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.FIELD_MAPPINGS.DEPARTMENTS)}
            />
            <ToggleSettingOptionRow
                title={translate('workspace.rillet.fieldMappings.projects')}
                switchAccessibilityLabel={translate('workspace.rillet.fieldMappings.projects')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={rilletConfig?.coding.fieldMappings.projects !== CONST.RILLET_MAPPING_VALUE.NONE}
                onToggle={() => null}
                pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.FIELD_MAPPINGS.PROJECTS], rilletConfig?.pendingFields)}
                errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.FIELD_MAPPINGS.PROJECTS)}
                onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.FIELD_MAPPINGS.PROJECTS)}
            />
            <ToggleSettingOptionRow
                title={translate('workspace.rillet.fieldMappings.classes')}
                switchAccessibilityLabel={translate('workspace.rillet.fieldMappings.classes')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={rilletConfig?.coding.fieldMappings.classes !== CONST.RILLET_MAPPING_VALUE.NONE}
                onToggle={() => null}
                pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.FIELD_MAPPINGS.CLASSES], rilletConfig?.pendingFields)}
                errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.FIELD_MAPPINGS.CLASSES)}
                onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.FIELD_MAPPINGS.CLASSES)}
            />
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <ToggleSettingOptionRow
                title={translate('workspace.taxes.taxRates')}
                switchAccessibilityLabel={translate('workspace.taxes.taxRates')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={rilletConfig?.coding.syncTaxRates ?? false}
                onToggle={() => null}
                pendingAction={settingsPendingAction([CONST.RILLET_CONFIG.SYNC_TAX_RATES], rilletConfig?.pendingFields)}
                errors={getLatestErrorField(rilletConfig ?? {}, CONST.RILLET_CONFIG.SYNC_TAX_RATES)}
                onCloseError={() => policyID && clearRilletErrorField(policyID, CONST.RILLET_CONFIG.SYNC_TAX_RATES)}
            />
        </ConnectionLayout>
    );
}

export default withPolicy(RilletImportPage);
