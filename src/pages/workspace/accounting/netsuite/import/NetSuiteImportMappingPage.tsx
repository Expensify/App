import {ExpensiMark} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {TupleToUnion, ValueOf} from 'type-fest';
import RenderHTML from '@components/RenderHTML';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCrossSubsidiaryCustomersConfiguration, updateNetSuiteImportMapping} from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

const parser = new ExpensiMark();

type ImportFieldsKeys = TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_FIELDS>;

type NetSuiteImportMappingPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            importField: ImportFieldsKeys;
        };
    };
};

type ImportListItem = SelectorType & {
    value: ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>;
};

function NetSuiteImportMappingPage({
    policy,
    route: {
        params: {importField},
    },
}: NetSuiteImportMappingPageProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const netsuiteConfig = policy?.connections?.netsuite?.options?.config;
    const importMappings = netsuiteConfig?.syncOptions?.mapping;

    const importValue = importMappings?.[importField] ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;

    const listFooterContent = useMemo(
        () => (
            <View style={[styles.ph5, styles.mt2, styles.mb4]}>
                <Text>{translate(`workspace.netsuite.import.importTypes.${importValue}.footerContent`, importField)}</Text>
            </View>
        ),
        [importField, importValue, styles.mb4, styles.mt2, styles.ph5, translate],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.ph5, styles.mt2, styles.mb4]}>
                {importField === 'jobs' && (
                    <View style={[styles.mb4]}>
                        <ToggleSettingOptionRow
                            title={translate('workspace.netsuite.import.crossSubsidiaryCustomers')}
                            isActive={netsuiteConfig?.syncOptions?.crossSubsidiaryCustomers ?? false}
                            switchAccessibilityLabel={translate('workspace.netsuite.import.crossSubsidiaryCustomers')}
                            onToggle={(isEnabled: boolean) => {
                                updateNetSuiteCrossSubsidiaryCustomersConfiguration(policyID, isEnabled);
                            }}
                            pendingAction={netsuiteConfig?.syncOptions?.pendingFields?.crossSubsidiaryCustomers}
                            errors={ErrorUtils.getLatestErrorField(netsuiteConfig ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                            onCloseError={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS)}
                        />
                    </View>
                )}

                <View style={[styles.flexRow]}>
                    <RenderHTML
                        html={`<comment><muted-text>${parser.replace(
                            translate(`workspace.netsuite.import.importFields.${importField}.subtitle` as TranslationPaths),
                        )}</muted-text></comment>`}
                    />
                </View>
            </View>
        ),
        [styles.ph5, styles.mt2, styles.mb4, styles.flexRow, importField, translate, netsuiteConfig, policyID],
    );

    const inputOptions = useMemo(() => {
        switch (importField) {
            case 'departments':
            case 'classes':
            case 'locations':
                return [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT, CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];

            default:
                return [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];
        }
    }, [importField]);

    const inputSectionData: ImportListItem[] =
        inputOptions.map((inputOption) => ({
            text: translate(`workspace.netsuite.import.importTypes.${inputOption}.label`),
            keyForList: inputOption,
            isSelected: importValue === inputOption,
            value: inputOption,
            alternateText: translate(`workspace.netsuite.import.importTypes.${inputOption}.description`),
        })) ?? [];

    const titleKey = `workspace.netsuite.import.importFields.${importField}.title` as TranslationPaths;

    const updateImportMapping = useCallback(
        ({value}: ImportListItem) => {
            if (value !== importValue) {
                updateNetSuiteImportMapping(policyID, importField as keyof typeof importMappings, value, importValue);
            }

            Navigation.goBack();
        },
        [importField, importValue, policyID],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteImportMappingPage.displayName}
            sections={inputSectionData.length > 0 ? [{data: inputSectionData}] : []}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onSelectRow={(selection: SelectorType) => updateImportMapping(selection as ImportListItem)}
            initiallyFocusedOptionKey={inputSectionData.find((inputOption) => inputOption.isSelected)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title={titleKey}
            listFooterContent={listFooterContent}
        />
    );
}

NetSuiteImportMappingPage.displayName = 'NetSuiteImportMappingPage';

export default withPolicyConnections(NetSuiteImportMappingPage);
