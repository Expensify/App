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
    value: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_DATE>;
};
function QuickbooksExportDateSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {exportDate} = policy?.connections?.quickbooksOnline?.config ?? {};
    const data: CardListItem[] = Object.values(CONST.QUICKBOOKS_EXPORT_DATE).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.qbo.exportDate.values.${dateType}.label`),
        alternateText: translate(`workspace.qbo.exportDate.values.${dateType}.description`),
        keyForList: dateType,
        isSelected: exportDate === dateType,
    }));

    const selectExportDate = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportDate) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.EXPORT_DATE, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT.getRoute(policyID));
        },
        [exportDate, policyID],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={QuickbooksExportDateSelectPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.qbo.exportDate.label')} />
                <SelectionList
                    headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportDate.description')}</Text>}
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={selectExportDate}
                    shouldDebounceRowSelect
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksExportDateSelectPage.displayName = 'QuickbooksExportDateSelectPage';

export default withPolicyConnections(QuickbooksExportDateSelectPage);
