import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSageIntacctMappingValue} from '@libs/actions/connections/SageIntacct';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SageIntacctMappingName, SageIntacctMappingValue} from '@src/types/onyx/Policy';

type SageIntacctMappingsTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE>;

function SageIntacctMappingsTypePage({route}: SageIntacctMappingsTypePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const mappingName: SageIntacctMappingName = route.params.mapping;
    const policy = usePolicy(route.params.policyID);
    const policyID = policy?.id ?? '-1';

    const {config} = policy?.connections?.intacct ?? {};
    const {mappings, pendingFields, export: exportConfig} = config ?? {};

    const selectionOptions = useMemo<SelectorType[]>(() => {
        const mappingOptions: SelectorType[] = [];
        if (
            !([CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS, CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS] as string[]).includes(mappingName) &&
            exportConfig?.reimbursable !== CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
        ) {
            mappingOptions.push({
                value: CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT,
                text: translate('workspace.intacct.employeeDefault'),
                alternateText: translate('workspace.common.appliedOnExport'),
                keyForList: CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT,
                isSelected: mappings?.[mappingName] === CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT,
            });
        }
        mappingOptions.push(
            ...[
                {
                    value: CONST.SAGE_INTACCT_MAPPING_VALUE.TAG,
                    text: translate('workspace.common.tags'),
                    alternateText: translate('workspace.common.lineItemLevel'),
                    keyForList: CONST.SAGE_INTACCT_MAPPING_VALUE.TAG,
                    isSelected: mappings?.[mappingName] === CONST.SAGE_INTACCT_MAPPING_VALUE.TAG,
                },
                {
                    value: CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
                    text: translate('workspace.common.reportFields'),
                    alternateText: translate('workspace.common.reportLevel'),
                    keyForList: CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
                    isSelected: mappings?.[mappingName] === CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD,
                },
            ],
        );

        return mappingOptions;
    }, [exportConfig?.reimbursable, mappingName, mappings, translate]);

    const updateMapping = useCallback(
        ({value}: SelectorType) => {
            updateSageIntacctMappingValue(policyID, mappingName, value as SageIntacctMappingValue, mappings?.[mappingName]);
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mappingName));
        },
        [mappingName, policyID, mappings],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={SageIntacctMappingsTypePage.displayName}
            sections={[{data: selectionOptions}]}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onSelectRow={updateMapping}
            initiallyFocusedOptionKey={mappings?.[mappingName]}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mappingName))}
            title="workspace.common.displayedAs"
            pendingAction={settingsPendingAction([mappingName], pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config ?? {}, mappingName)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearSageIntacctErrorField(policyID, mappingName)}
        />
    );
}

SageIntacctMappingsTypePage.displayName = 'SageIntacctMappingsTypePage';

export default SageIntacctMappingsTypePage;
