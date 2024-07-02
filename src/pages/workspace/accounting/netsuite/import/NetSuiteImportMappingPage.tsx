import {ExpensiMark} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import RenderHTML from '@components/RenderHTML';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteImportMapping} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

const parser = new ExpensiMark();

type NetSuiteImportMappingPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            importField: string;
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

    const importMappings = policy?.connections?.netsuite?.options?.config?.syncOptions?.mapping;

    const importValue = importMappings?.[importField as keyof typeof importMappings] ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;

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
                <RenderHTML
                    html={`<comment><muted-text>${parser.replace(translate(`workspace.netsuite.import.importFields.${importField}.subtitle` as TranslationPaths))}</muted-text></comment>`}
                />
            </View>
        ),
        [styles.ph5, styles.mt2, styles.mb4, translate, importField],
    );

    const inputOptions = [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT, CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];

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
            if (!value || value === importValue) {
                return;
            }

            updateNetSuiteImportMapping(policyID, importField as keyof typeof importMappings, value, importValue);
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
