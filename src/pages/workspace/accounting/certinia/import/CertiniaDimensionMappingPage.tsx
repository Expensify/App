import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearFinancialForceErrorField} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {CertiniaDimensionParam, CertiniaMappingValue} from '@pages/workspace/accounting/certinia/utils';
import {dimensionParamToNumber, isCertiniaDimensionParam, updateFinancialForceDimensionMapping} from '@pages/workspace/accounting/certinia/utils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type CertiniaDimensionMappingPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.CERTINIA_DIMENSION_MAPPING>;

type MappingListItem = SelectorType & {
    value: CertiniaMappingValue;
};

const MAPPING_OPTIONS: CertiniaMappingValue[] = [CONST.CERTINIA_MAPPING_VALUE.DEFAULT, CONST.CERTINIA_MAPPING_VALUE.TAG, CONST.CERTINIA_MAPPING_VALUE.REPORT_FIELD];

const MAPPING_OPTION_LABELS: Record<CertiniaMappingValue, {title: TranslationPaths; subtitle: TranslationPaths}> = {
    [CONST.CERTINIA_MAPPING_VALUE.DEFAULT]: {
        title: 'workspace.certinia.import.doNotMap',
        subtitle: 'workspace.certinia.import.doNotMapSubtitle',
    },
    [CONST.CERTINIA_MAPPING_VALUE.TAG]: {
        title: 'workspace.common.tags',
        subtitle: 'workspace.common.lineItemLevel',
    },
    [CONST.CERTINIA_MAPPING_VALUE.REPORT_FIELD]: {
        title: 'workspace.common.reportFields',
        subtitle: 'workspace.common.reportLevel',
    },
};

function CertiniaDimensionMappingPage({
    policy,
    route: {
        params: {dimension},
    },
}: CertiniaDimensionMappingPageProps) {
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const config = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA]?.config;
    const coding = config?.coding;

    const dimensionKey: CertiniaDimensionParam | undefined = isCertiniaDimensionParam(dimension) ? dimension : undefined;
    const currentValue = dimensionKey ? coding?.[dimensionKey] : undefined;
    const selectedValue = currentValue ?? CONST.CERTINIA_MAPPING_VALUE.DEFAULT;

    const inputSectionData: MappingListItem[] = MAPPING_OPTIONS.map((mappingValue) => {
        const {title, subtitle} = MAPPING_OPTION_LABELS[mappingValue];
        return {
            text: translate(title),
            alternateText: translate(subtitle),
            keyForList: mappingValue,
            isSelected: selectedValue === mappingValue,
            value: mappingValue,
        };
    });

    const updateMapping = ({value}: MappingListItem) => {
        if (!policyID || !dimensionKey || value === selectedValue) {
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_CERTINIA_IMPORT.getRoute(policyID));
            return;
        }

        updateFinancialForceDimensionMapping(policyID, dimensionKey, value, currentValue ?? null);
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_CERTINIA_IMPORT.getRoute(policyID));
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CertiniaDimensionMappingPage"
            data={inputSectionData}
            shouldBeBlocked={!!config?.hasPSA}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            onSelectRow={(selection: SelectorType) => updateMapping(selection as MappingListItem)}
            initiallyFocusedOptionKey={inputSectionData.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_CERTINIA_IMPORT.getRoute(policyID))}
            headerTitleAlreadyTranslated={translate('workspace.certinia.import.dimensionMapping', {n: dimensionParamToNumber(dimension)})}
            pendingAction={dimensionKey ? settingsPendingAction([dimensionKey], config?.pendingFields) : undefined}
            errors={dimensionKey ? getLatestErrorField(config ?? {}, dimensionKey) : undefined}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => {
                if (!dimensionKey) {
                    return;
                }

                clearFinancialForceErrorField(policyID, dimensionKey);
            }}
        />
    );
}

export default withPolicyConnections(CertiniaDimensionMappingPage);
