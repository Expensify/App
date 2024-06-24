import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import * as SageIntacctConnection from '@libs/actions/connections/SageIntacct';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SageIntacctMappingValue} from '@src/types/onyx/Policy';

type SageIntacctMappingsTypePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE>;

function SageIntacctMappingsTypePage({route}: SageIntacctMappingsTypePageProps) {
    const {translate} = useLocalize();

    const mapping = route.params.mapping;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID ?? '-1'}`);
    const policyID = policy?.id ?? '-1';
    const mappings = policy?.connections?.intacct?.config?.mappings;
    const updateFunction = SageIntacctConnection.getUpdateFunctionForMapping(mapping);

    const selectionOptions = useMemo<SelectorType[]>(
        () => [
            {
                value: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.DEFAULT,
                text: translate('workspace.intacct.employeeDefault'),
                alternateText: translate('workspace.common.appliedOnExport'),
                keyForList: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.DEFAULT,
                isSelected: mappings?.[mapping] === CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.DEFAULT,
            },
            {
                value: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG,
                text: translate('workspace.common.tags'),
                alternateText: translate('workspace.common.lineItemLevel'),
                keyForList: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG,
                isSelected: mappings?.[mapping] === CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG,
            },
            {
                value: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD,
                text: translate('workspace.common.reportFields'),
                alternateText: translate('workspace.common.reportLevel'),
                keyForList: CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD,
                isSelected: mappings?.[mapping] === CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD,
            },
        ],
        [mapping, mappings, translate],
    );

    const updateMapping = useCallback(
        ({value}: SelectorType) => {
            if (updateFunction) {
                updateFunction(policyID, value as SageIntacctMappingValue);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mapping));
        },
        [mapping, policyID, updateFunction],
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
            initiallyFocusedOptionKey={mappings?.[mapping]}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mapping))}
            title="workspace.common.displayedAs"
        />
    );
}

SageIntacctMappingsTypePage.displayName = 'SageIntacctMappingsTypePage';

export default SageIntacctMappingsTypePage;
