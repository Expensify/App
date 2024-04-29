import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {SectionListData} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem, Section} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import Navigation from '@navigation/Navigation';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: ValueOf<typeof CONST.QUICKBOOKS_EXPORT_ENTITY>;
    isShown: boolean;
};
type CardsSection = SectionListData<CardListItem, Section<CardListItem>>;

function QuickbooksOutOfPocketExpenseEntitySelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {exportEntity, syncTaxes, syncLocations} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationsEnabled = Boolean(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = Boolean(syncTaxes && syncTaxes !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxError = isTaxesEnabled && exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY;
    const isLocationError = isLocationsEnabled && exportEntity !== CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY;
    const policyID = policy?.id ?? '';

    useEffect(() => {
        if (!isTaxError && !isLocationError) {
            return;
        }
        Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.EXPORT_ENTITY);
    }, [policyID, isTaxError, isLocationError]);

    const data: CardListItem[] = useMemo(
        () => [
            {
                value: CONST.QUICKBOOKS_EXPORT_ENTITY.CHECK,
                text: translate(`workspace.qbo.check`),
                keyForList: CONST.QUICKBOOKS_EXPORT_ENTITY.CHECK,
                isSelected: exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.CHECK,
                isShown: !isLocationsEnabled,
            },
            {
                value: CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY,
                text: translate(`workspace.qbo.journalEntry`),
                keyForList: CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY,
                isSelected: exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.JOURNAL_ENTRY,
                isShown: !isTaxesEnabled || isLocationsEnabled,
            },
            {
                value: CONST.QUICKBOOKS_EXPORT_ENTITY.VENDOR_BILL,
                text: translate(`workspace.qbo.vendorBill`),
                keyForList: CONST.QUICKBOOKS_EXPORT_ENTITY.VENDOR_BILL,
                isSelected: exportEntity === CONST.QUICKBOOKS_EXPORT_ENTITY.VENDOR_BILL,
                isShown: !isLocationsEnabled,
            },
        ],
        [exportEntity, isTaxesEnabled, translate, isLocationsEnabled],
    );

    const sections: CardsSection[] = useMemo(() => [{data: data.filter((item) => item.isShown)}], [data]);

    const selectExportEntity = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportEntity) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.EXPORT_ENTITY, row.value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID));
        },
        [exportEntity, policyID],
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <FeatureEnabledAccessOrNotFoundWrapper
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            >
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    testID={QuickbooksOutOfPocketExpenseEntitySelectPage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.qbo.exportAs')} />
                    <View style={styles.flex1}>
                        <SelectionList
                            containerStyle={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                            headerContent={<Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.optionBelow')}</Text>}
                            sections={sections}
                            ListItem={RadioListItem}
                            onSelectRow={selectExportEntity}
                            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
                            footerContent={isTaxesEnabled && <Text style={[styles.mutedNormalTextLabel, styles.pt2]}>{translate('workspace.qbo.outOfPocketTaxEnabledDescription')}</Text>}
                        />
                    </View>
                </ScreenWrapper>
            </FeatureEnabledAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksOutOfPocketExpenseEntitySelectPage.displayName = 'QuickbooksOutOfPocketExpenseEntitySelectPage';

export default withPolicyConnections(QuickbooksOutOfPocketExpenseEntitySelectPage);
