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
import {updateNetSuiteImportMapping} from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {settingsPendingAction} from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

type ImportFieldsKeys = TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_FIELDS>;

type NetSuiteImportMappingPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            /** Whether the record is custom segment or custom list */
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
            <View style={[styles.ph5, styles.mt3, styles.mb4]}>
                <Text>{translate(`workspace.netsuite.import.importTypes.${importValue}.footerContent`, {importField})}</Text>
            </View>
        ),
        [importField, importValue, styles.mb4, styles.mt3, styles.ph5, translate],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.ph5, styles.pb5]}>
                <View style={[styles.flexRow]}>
                    <RenderHTML html={`<comment>${Parser.replace(translate(`workspace.netsuite.import.importFields.${importField}.subtitle` as TranslationPaths))}</comment>`} />
                </View>
            </View>
        ),
        [styles.ph5, styles.pb5, styles.flexRow, translate, importField],
    );

    const inputOptions = [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT, CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];

    const inputSectionData: ImportListItem[] = inputOptions.map((inputOption) => ({
        text: translate(`workspace.netsuite.import.importTypes.${inputOption}.label`),
        keyForList: inputOption,
        isSelected: importValue === inputOption,
        value: inputOption,
        alternateText: translate(`workspace.netsuite.import.importTypes.${inputOption}.description`),
    }));

    const titleKey = `workspace.netsuite.import.importFields.${importField}.title` as TranslationPaths;

    const updateImportMapping = useCallback(
        ({value}: ImportListItem) => {
            if (value !== importValue) {
                updateNetSuiteImportMapping(policyID, importField as keyof typeof importMappings, value, importValue);
            }

            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID));
        },
        [importField, importValue, policyID],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteImportMappingPage.displayName}
            sections={[{data: inputSectionData}]}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onSelectRow={(selection: SelectorType) => updateImportMapping(selection as ImportListItem)}
            initiallyFocusedOptionKey={inputSectionData.find((inputOption) => inputOption.isSelected)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID))}
            title={titleKey}
            listFooterContent={listFooterContent}
            pendingAction={settingsPendingAction([importField], netsuiteConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(netsuiteConfig ?? {}, importField)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearNetSuiteErrorField(policyID, importField)}
        />
    );
}

NetSuiteImportMappingPage.displayName = 'NetSuiteImportMappingPage';

export default withPolicyConnections(NetSuiteImportMappingPage);
