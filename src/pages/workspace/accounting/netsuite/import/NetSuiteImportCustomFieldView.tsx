import React, {useCallback, useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import ConfirmModal from '@components/ConfirmModal';
import ConnectionLayout from '@components/ConnectionLayout';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCustomLists, updateNetSuiteCustomSegments} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {NetSuiteCustomList, NetSuiteCustomSegment} from '@src/types/onyx/Policy';

type CustomRecord = NetSuiteCustomList | NetSuiteCustomSegment;
type ImportCustomFieldsKeys = ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

type NetSuiteImportCustomFieldViewProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            importCustomField: ImportCustomFieldsKeys;
            valueIndex: number;
        };
    };
};

function NetSuiteImportCustomFieldView({
    policy,
    route: {
        params: {importCustomField, valueIndex},
    },
}: NetSuiteImportCustomFieldViewProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false);

    const config = policy?.connections?.netsuite?.options?.config;
    const allRecords = useMemo(() => config?.syncOptions?.[importCustomField] ?? [], [config?.syncOptions, importCustomField]);

    const customRecord: CustomRecord | undefined = allRecords[valueIndex];
    const fieldList = customRecord && PolicyUtils.isNetSuiteCustomSegmentRecord(customRecord) ? CONST.NETSUITE_CONFIG.CUSTOM_SEGMENT_FIELDS : CONST.NETSUITE_CONFIG.CUSTOM_LIST_FIELDS;

    const removeRecord = useCallback(() => {
        if (customRecord) {
            const filteredRecords = allRecords.filter((record) => record.internalID !== customRecord?.internalID);
            if (PolicyUtils.isNetSuiteCustomSegmentRecord(customRecord)) {
                updateNetSuiteCustomSegments(policyID, filteredRecords as NetSuiteCustomSegment[], allRecords as NetSuiteCustomSegment[]);
            } else {
                updateNetSuiteCustomLists(policyID, filteredRecords as NetSuiteCustomList[], allRecords as NetSuiteCustomList[]);
            }
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, importCustomField));
    }, [allRecords, customRecord, importCustomField, policyID]);

    return (
        <ConnectionLayout
            displayName={NetSuiteImportCustomFieldView.displayName}
            headerTitleAlreadyTranslated={customRecord ? PolicyUtils.getNameFromNetSuiteCustomSegmentRecord(customRecord) : ''}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={!customRecord}
        >
            {customRecord && (
                <>
                    {fieldList.map((fieldName) => {
                        const isEditable = PolicyUtils.isFieldAllowedToEditNetSuiteCustomRecord(customRecord, fieldName);
                        return (
                            <MenuItemWithTopDescription
                                key={fieldName}
                                description={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.fields.${fieldName}` as TranslationPaths)}
                                shouldShowRightIcon={isEditable}
                                title={
                                    fieldName === 'mapping'
                                        ? translate(`workspace.netsuite.import.importTypes.${customRecord[fieldName as keyof CustomRecord].toUpperCase()}.label` as TranslationPaths)
                                        : customRecord[fieldName as keyof CustomRecord]
                                }
                                onPress={
                                    isEditable
                                        ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_EDIT.getRoute(policyID, importCustomField, valueIndex, fieldName))
                                        : undefined
                                }
                            />
                        );
                    })}
                    <MenuItem
                        icon={Expensicons.Trashcan}
                        title={translate('common.remove')}
                        onPress={() => setIsRemoveModalOpen(true)}
                    />
                </>
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
