import {ExpensiMark} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
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

    const inputSectionData =
        inputOptions.map((inputOption) => ({
            text: translate(`workspace.netsuite.import.importTypes.${inputOption}.label`),
            keyForList: inputOption,
            isSelected: importValue === inputOption,
            value: importValue,
            alternateText: translate(`workspace.netsuite.import.importTypes.${inputOption}.description`),
        })) ?? [];

    const titleKey = `workspace.netsuite.import.importFields.${importField}.title` as TranslationPaths;

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteImportMappingPage.displayName}
            sections={inputSectionData.length > 0 ? [{data: inputSectionData}] : []}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onSelectRow={() => {}}
            initiallyFocusedOptionKey={inputSectionData.find((inputOption) => inputOption.isSelected)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack()}
            title={titleKey}
        />
    );
}

NetSuiteImportMappingPage.displayName = 'NetSuiteImportMappingPage';

export default withPolicyConnections(NetSuiteImportMappingPage);
