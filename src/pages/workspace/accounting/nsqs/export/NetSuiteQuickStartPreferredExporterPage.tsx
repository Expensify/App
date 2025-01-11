import noop from 'lodash/noop';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen, {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const Options = [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] as const;
type Option = (typeof Options)[number];

function NetSuiteQuickStartPreferredExporterPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config; // s77rt
    const s77rt1 = CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG; // s77rt

    const importValue = CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG; // s77rt

    const inputSectionData: SelectorType<Option>[] = Options.map((inputOption) => ({
        text: translate(`workspace.nsqs.import.importTypes.${inputOption}.label`),
        keyForList: inputOption,
        isSelected: importValue === inputOption,
        value: inputOption,
    }));

    const updateImportMapping = useCallback(
        ({value}: SelectorType) => {
            if (value !== importValue) {
                // updateNetSuiteImportMapping(policyID, importField as keyof typeof importMappings, value, importValue);  // s77rt
            }

            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT.getRoute(policyID));
        },
        [importValue, policyID],
    );

    const headerContent = useMemo(
        () => (
            <>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.accounting.exportPreferredExporterNote')}</Text>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.accounting.exportPreferredExporterSubNote')}</Text>
            </>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    return (
        <SelectionScreen<Option>
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteQuickStartPreferredExporterPage.displayName}
            headerContent={headerContent}
            sections={[{data: inputSectionData}]}
            listItem={RadioListItem}
            listItemWrapperStyle={styles.mnh13}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onSelectRow={(selection: SelectorType) => updateImportMapping(selection)}
            initiallyFocusedOptionKey={inputSectionData.find((inputOption) => inputOption.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT.getRoute(policyID))}
            title={`workspace.accounting.preferredExporter`}
            // pendingAction={settingsPendingAction([importField], netsuiteConfig?.pendingFields)} s77rt
            // errors={ErrorUtils.getLatestErrorField(netsuiteConfig ?? {}, importField)} s77rt
            // errorRowStyles={[styles.ph5, styles.pv3]} s77rt
            // onClose={() => Policy.clearNetSuiteErrorField(policyID, importField)} s77rt
        />
    );
}

NetSuiteQuickStartPreferredExporterPage.displayName = 'NetSuiteQuickStartPreferredExporterPage';

export default withPolicyConnections(NetSuiteQuickStartPreferredExporterPage);
