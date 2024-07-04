import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import ConfirmModal from '@components/ConfirmModal';
import ConnectionLayout from '@components/ConnectionLayout';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCustomLists, updateNetSuiteCustomSegments} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {NetSuiteCustomList, NetSuiteCustomSegment} from '@src/types/onyx/Policy';

type CustomRecord = NetSuiteCustomList | NetSuiteCustomSegment;
type ImportCustomFieldsKeys = TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

type NetSuiteImportCustomFieldViewProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            importCustomField: ImportCustomFieldsKeys;
            internalID: string;
        };
    };
};

function NetSuiteImportCustomFieldView({
    policy,
    route: {
        params: {importCustomField, internalID},
    },
}: NetSuiteImportCustomFieldViewProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false);

    const config = policy?.connections?.netsuite?.options?.config;
    const allRecords = useMemo(() => config?.syncOptions?.[importCustomField] ?? [], [config?.syncOptions, importCustomField]);

    const customRecord: CustomRecord | undefined = allRecords.find((record) => record.internalID === internalID);
    const fieldList = customRecord && 'segmentName' in customRecord ? CONST.NETSUITE_CONFIG.CUSTOM_SEGMENT_FIELDS : CONST.NETSUITE_CONFIG.CUSTOM_LIST_FIELDS;

    const removeRecord = useCallback(() => {
        if (customRecord) {
            const filteredRecords = allRecords.filter((record) => record.internalID !== internalID);
            if ('segmentName' in customRecord) {
                updateNetSuiteCustomSegments(policyID, filteredRecords as NetSuiteCustomSegment[], allRecords as NetSuiteCustomSegment[]);
            } else {
                updateNetSuiteCustomLists(policyID, filteredRecords as NetSuiteCustomList[], allRecords as NetSuiteCustomList[]);
            }
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, importCustomField));
    }, [allRecords, customRecord, importCustomField, internalID, policyID]);

    return (
        <ConnectionLayout
            displayName={NetSuiteImportCustomFieldView.displayName}
            headerTitleAlreadyTranslated={customRecord && 'segmentName' in customRecord ? customRecord.segmentName : customRecord?.listName ?? ''}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={!customRecord}
        >
            {customRecord && (
                <View style={styles.flex1}>
                    <View style={styles.mb4}>
                        {fieldList.map((fieldName) => (
                            <MenuItemWithTopDescription
                                key={fieldName}
                                description={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.fields.${fieldName}` as TranslationPaths)}
                                shouldShowRightIcon
                                title={ fieldName === 'mapping' ?  translate(`workspace.netsuite.import.importTypes.${customRecord[fieldName as keyof CustomRecord]}.label` as TranslationPaths):customRecord[fieldName as keyof CustomRecord]}
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_EDIT.getRoute(policyID, importCustomField, internalID, fieldName))}
                            />
                        ))}
                    </View>
                    <View style={styles.flex1}>
                        <MenuItem
                            icon={Expensicons.Trashcan}
                            title={translate('common.remove')}
                            onPress={() => setIsRemoveModalOpen(true)}
                        />
                    </View>
                </View>
            )}

            <ConfirmModal
                title={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.removeTitle`)}
                isVisible={isRemoveModalOpen}
                onConfirm={removeRecord}
                onCancel={() => setIsRemoveModalOpen(false)}
                prompt={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.removePrompt`)}
                confirmText={translate('common.remove')}
                cancelText={translate('common.cancel')}
                danger
            />
        </ConnectionLayout>
    );
}

NetSuiteImportCustomFieldView.displayName = 'NetSuiteImportCustomFieldView';
export default withPolicyConnections(NetSuiteImportCustomFieldView);
