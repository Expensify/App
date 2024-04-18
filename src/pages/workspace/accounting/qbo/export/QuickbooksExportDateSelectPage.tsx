import React, {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_DATE>;
};
function QuickbooksExportDateSelectPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {exportDate} = policy?.connections?.quickbooksOnline?.config ?? {};
    const data: CardListItem[] = Object.values(CONST.QUICKBOOKS_EXPORT_DATE).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.qbo.${dateType}.label`),
        alternateText: translate(`workspace.qbo.${dateType}.description`),
        keyForList: dateType,
        isSelected: exportDate === dateType,
    }));

    const onSelectRow = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportDate) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.EXPORT_DATE, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT.getRoute(policyID));
        },
        [exportDate, policyID],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={QuickbooksExportDateSelectPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.exportDate')} />
            <ScrollView contentContainerStyle={styles.pb2}>
                <SelectionList
                    headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportDateDescription')}</Text>}
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={onSelectRow}
                    initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksExportDateSelectPage.displayName = 'QuickbooksExportDateSelectPage';

export default withPolicy(QuickbooksExportDateSelectPage);
