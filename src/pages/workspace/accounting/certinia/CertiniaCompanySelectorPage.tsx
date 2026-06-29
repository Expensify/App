import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearFinancialForceErrorField, updateFinancialForceCompany} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {isCertiniaSRPConnection} from './utils';

type CompanyListItem = ListItem & {
    value: string;
};

function CertiniaCompanySelectorPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const {config, data} = policy?.connections?.financialforce ?? {};
    const companyID = config?.credentials?.companyID;
    const companies = data?.companies ?? [];
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const dataOptions: CompanyListItem[] = companies.map((company) => ({
        value: company.id,
        text: company.name,
        keyForList: company.id,
        isSelected: companyID === company.id,
    }));
    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.certinia.noCompaniesFound')}
            subtitle={translate('workspace.certinia.noCompaniesFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const selectCompany = (row: CompanyListItem) => {
        if (row.value !== companyID && policyID) {
            updateFinancialForceCompany(policyID, row.value, companyID ?? null);
        }
        Navigation.goBack(policyID ? ROUTES.POLICY_ACCOUNTING.getRoute(policyID) : undefined);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CertiniaCompanySelectorPage"
            shouldBeBlocked={!isCertiniaSRPConnection(config)}
            data={dataOptions}
            onSelectRow={selectCompany}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={companyID}
            onBackButtonPress={() => Navigation.goBack(policyID ? ROUTES.POLICY_ACCOUNTING.getRoute(policyID) : undefined)}
            title="workspace.certinia.company"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.COMPANY_ID], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.CERTINIA_CONFIG.COMPANY_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.COMPANY_ID)}
        />
    );
}

CertiniaCompanySelectorPage.displayName = 'CertiniaCompanySelectorPage';

export default withPolicyConnections(CertiniaCompanySelectorPage);
