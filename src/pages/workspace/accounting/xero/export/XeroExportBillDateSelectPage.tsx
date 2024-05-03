import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: ValueOf<typeof CONST.XERO_EXPORT_DATE>;
};
function XeroExportBillDateSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {billDate} = policy?.connections?.xero?.config?.export ?? {};
    const data: CardListItem[] = Object.values(CONST.XERO_EXPORT_DATE).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.xero.exportDate.values.${dateType}.label`),
        alternateText: translate(`workspace.xero.exportDate.values.${dateType}.description`),
        keyForList: dateType,
        isSelected: billDate === dateType,
    }));

    const selectExportDate = useCallback(
        (row: CardListItem) => {
            if (row.value !== billDate) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.EXPORT, {billDate: row.value});
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT_BILL_DATE_SELECT.getRoute(policyID));
        },
        [billDate, policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={XeroExportBillDateSelectPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.xero.exportDate.label')} />
                <SelectionList
                    headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.exportDate.description')}</Text>}
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={selectExportDate}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

XeroExportBillDateSelectPage.displayName = 'XeroExportBillDateSelectPage';

export default withPolicyConnections(XeroExportBillDateSelectPage);
