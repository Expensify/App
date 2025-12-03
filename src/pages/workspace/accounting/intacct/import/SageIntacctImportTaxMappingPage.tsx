import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {UpdateSageIntacctTaxSolutionID} from '@libs/actions/connections/SageIntacct';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import {clearSageIntacctErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SageIntacctMappingsTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE>;

function SageIntacctImportTaxMappingPage({route}: SageIntacctMappingsTypePageProps) {
    const styles = useThemeStyles();

    const policy = usePolicy(route.params.policyID);
    const policyID = policy?.id;

    const {config} = policy?.connections?.intacct ?? {};
    const {pendingFields} = config ?? {};
    const sageIntacctConfig = policy?.connections?.intacct?.config;
    const sageIntacctConfigTaxSolutionID = sageIntacctConfig?.tax?.taxSolutionID;
    const sageIntacctData = policy?.connections?.intacct?.data;

    const selectionOptions = useMemo<SelectorType[]>(() => {
        const mappingOptions: SelectorType[] = [];
        const sageIntacctTaxSolutionIDs = sageIntacctData?.taxSolutionIDs ?? [];
        for (const taxSolutionID of sageIntacctTaxSolutionIDs) {
            mappingOptions.push({
                value: taxSolutionID,
                text: taxSolutionID,
                keyForList: taxSolutionID,
                isSelected: sageIntacctConfigTaxSolutionID === taxSolutionID,
            });
        }

        return mappingOptions;
    }, [sageIntacctConfigTaxSolutionID, sageIntacctData?.taxSolutionIDs]);

    const updateMapping = useCallback(
        ({value}: SelectorType) => {
            UpdateSageIntacctTaxSolutionID(policyID, value);
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX.getRoute(policyID));
        },
        [policyID],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={SageIntacctImportTaxMappingPage.displayName}
            sections={[{data: selectionOptions}]}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onSelectRow={updateMapping}
            initiallyFocusedOptionKey={selectionOptions.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX.getRoute(policyID))}
            title="workspace.sageIntacct.taxSolution"
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.TAX, CONST.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID)}
        />
    );
}

SageIntacctImportTaxMappingPage.displayName = 'SageIntacctImportTaxMappingPage';

export default SageIntacctImportTaxMappingPage;
