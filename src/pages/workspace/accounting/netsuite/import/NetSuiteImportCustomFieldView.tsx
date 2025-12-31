import React, {useCallback, useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import ConfirmModal from '@components/ConfirmModal';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCustomLists, updateNetSuiteCustomSegments} from '@libs/actions/connections/NetSuiteCommands';
import {clearNetSuiteErrorField, clearNetSuitePendingField, removeNetSuiteCustomFieldByIndex} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNameFromNetSuiteCustomField, isNetSuiteCustomFieldPropertyEditable, isNetSuiteCustomSegmentRecord, settingsPendingAction} from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import type {NetSuiteCustomList, NetSuiteCustomSegment} from '@src/types/onyx/Policy';

type CustomField = NetSuiteCustomList | NetSuiteCustomSegment;
type ImportCustomFieldsKeys = ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

type NetSuiteImportCustomFieldViewProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            /** Whether the record is of type custom segment or list */
            importCustomField: ImportCustomFieldsKeys;

            /** Index of the current record */
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
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false);

    const config = policy?.connections?.netsuite?.options?.config;
    const allRecords = useMemo(() => config?.syncOptions?.[importCustomField] ?? [], [config?.syncOptions, importCustomField]);

    const customField: CustomField | undefined = allRecords[valueIndex];
    const fieldList =
        customField && isNetSuiteCustomSegmentRecord(customField) ? CONST.NETSUITE_CONFIG.CUSTOM_SEGMENT_FIELDS : [INPUT_IDS.LIST_NAME, INPUT_IDS.TRANSACTION_FIELD_ID, INPUT_IDS.MAPPING];

    const removeRecord = useCallback(() => {
        if (!policyID) {
            return;
        }
        if (customField) {
            // We allow multiple custom list records with the same internalID. Hence it is safe to remove by index.
            const filteredRecords = allRecords.filter((_, index) => index !== Number(valueIndex));

            if (isNetSuiteCustomSegmentRecord(customField)) {
                updateNetSuiteCustomSegments(
                    policyID,
                    filteredRecords as NetSuiteCustomSegment[],
                    allRecords as NetSuiteCustomSegment[],
                    `${importCustomField}_${valueIndex}`,
                    CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                );
            } else {
                updateNetSuiteCustomLists(
                    policyID,
                    filteredRecords as NetSuiteCustomList[],
                    allRecords as NetSuiteCustomList[],
                    `${importCustomField}_${valueIndex}`,
                    CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                );
            }
        }
        setIsRemoveModalOpen(false);
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, importCustomField));
    }, [allRecords, customField, importCustomField, policyID, valueIndex]);

    return (
        <ConnectionLayout
            displayName="NetSuiteImportCustomFieldView"
            headerTitleAlreadyTranslated={customField ? getNameFromNetSuiteCustomField(customField) : ''}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={!customField}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING.getRoute(policyID, importCustomField))}
        >
            {!!customField && (
                <OfflineWithFeedback
                    errors={getLatestErrorField(config ?? {}, `${importCustomField}_${valueIndex}`)}
                    errorRowStyles={[styles.ph5, styles.pv3]}
                    pendingAction={settingsPendingAction([`${importCustomField}_${valueIndex}`], config?.pendingFields)}
                    onClose={() => {
                        if (!policyID) {
                            return;
                        }
                        clearNetSuiteErrorField(policyID, `${importCustomField}_${valueIndex}`);
                        const pendingAction = settingsPendingAction([`${importCustomField}_${valueIndex}`], config?.pendingFields);
                        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                            removeNetSuiteCustomFieldByIndex(allRecords, policyID, importCustomField, valueIndex);
                            Navigation.goBack();
                        }
                        clearNetSuitePendingField(policyID, `${importCustomField}_${valueIndex}`);
                    }}
                >
                    {fieldList.map((fieldName) => {
                        const isEditable = !config?.pendingFields?.[importCustomField] && isNetSuiteCustomFieldPropertyEditable(customField, fieldName);
                        return (
                            <MenuItemWithTopDescription
                                key={fieldName}
                                description={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.fields.${fieldName}` as TranslationPaths)}
                                shouldShowRightIcon={isEditable}
                                title={
                                    fieldName === 'mapping'
                                        ? translate(`workspace.netsuite.import.importTypes.${customField[fieldName as keyof CustomField].toUpperCase()}.label` as TranslationPaths)
                                        : customField[fieldName as keyof CustomField]
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
                        icon={icons.Trashcan}
                        title={translate('common.remove')}
                        disabled={!!config?.pendingFields?.[importCustomField]}
                        onPress={() => setIsRemoveModalOpen(true)}
                    />
                </OfflineWithFeedback>
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

export default withPolicyConnections(NetSuiteImportCustomFieldView);
