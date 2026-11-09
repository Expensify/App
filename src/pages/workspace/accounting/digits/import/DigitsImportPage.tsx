/**
 * The Digits Import page, where an admin chooses which Digits data imports into the workspace: the chart of accounts as
 * categories, and departments as tags.
 */
import ConnectionLayout from '@components/ConnectionLayout';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDigitsErrorField, updateDigitsEnableNewCategories, updateDigitsFieldMapping} from '@libs/actions/connections/Digits';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

const DEPARTMENTS_FIELD_MAPPING_KEY = `${CONST.DIGITS_CONFIG.FIELD_MAPPING_PREFIX}${CONST.DIGITS_FIELD.DEPARTMENTS}` as const;

function DigitsImportPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const digitsConfig = policy?.connections?.digits?.config;
    const enableNewCategories = digitsConfig?.enableNewCategories ?? false;
    const departmentsMapping = digitsConfig?.coding?.fieldMappings?.[CONST.DIGITS_FIELD.DEPARTMENTS];
    const areDepartmentsImported = departmentsMapping === CONST.DIGITS_MAPPING_VALUE.TAG;

    return (
        <ConnectionLayout
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS_ACCOUNTING.getRoute(policyID))}
            displayName="DigitsImportPage"
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.DIGITS}
            shouldBeBlocked
        >
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.digits.importDescription')}</Text>
            </View>
            {/* The chart of accounts always imports as the workspace's categories, so this row only shows that it's on */}
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.accounts')}
                subtitle={translate('workspace.digits.accountTypesDescription')}
                switchAccessibilityLabel={translate('workspace.accounting.accounts')}
                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.ACCOUNTS_SWITCH}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                title={translate('workspace.digits.enableNewAccountsTitle')}
                subtitle={translate('workspace.digits.enableNewAccountsDescription')}
                switchAccessibilityLabel={translate('workspace.digits.enableNewAccountsTitle')}
                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.ENABLE_NEW_ACCOUNTS_SWITCH}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={enableNewCategories}
                onToggle={() => policyID && updateDigitsEnableNewCategories(policyID, !enableNewCategories, enableNewCategories)}
                pendingAction={settingsPendingAction([CONST.DIGITS_CONFIG.ENABLE_NEW_CATEGORIES], digitsConfig?.pendingFields)}
                errors={getLatestErrorField(digitsConfig ?? {}, CONST.DIGITS_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => policyID && clearDigitsErrorField(policyID, CONST.DIGITS_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
            <View style={[styles.mv3, styles.mh5, styles.borderTop]} />
            <View style={[styles.mv3, styles.mh5]}>
                <Text>{translate('workspace.digits.dimensionsImport')}</Text>
            </View>
            {/* Digits only exposes departments as a dimension so far, and the sync doesn't store the list, so the toggle always shows */}
            <ToggleSettingOptionRow
                title={translate('workspace.digits.departments')}
                switchAccessibilityLabel={translate('workspace.digits.departments')}
                switchSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.DIGITS.DEPARTMENTS_SWITCH}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={areDepartmentsImported}
                onToggle={() =>
                    policyID &&
                    updateDigitsFieldMapping(
                        policyID,
                        CONST.DIGITS_FIELD.DEPARTMENTS,
                        areDepartmentsImported ? CONST.DIGITS_MAPPING_VALUE.NONE : CONST.DIGITS_MAPPING_VALUE.TAG,
                        departmentsMapping,
                    )
                }
                pendingAction={settingsPendingAction([DEPARTMENTS_FIELD_MAPPING_KEY], digitsConfig?.pendingFields)}
                errors={getLatestErrorField(digitsConfig ?? {}, DEPARTMENTS_FIELD_MAPPING_KEY)}
                onCloseError={() => policyID && clearDigitsErrorField(policyID, DEPARTMENTS_FIELD_MAPPING_KEY)}
            />
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DigitsImportPage);
