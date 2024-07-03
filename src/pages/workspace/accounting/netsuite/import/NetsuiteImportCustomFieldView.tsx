import React from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Expensicons from '@components/Icon/Expensicons';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {NetSuiteCustomList, NetSuiteCustomSegment} from '@src/types/onyx/Policy';
import MenuItem from '@components/MenuItem';

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

    const config = policy?.connections?.netsuite?.options?.config;
    const data = config?.syncOptions?.[importCustomField] ?? [];

    const customRecord: CustomRecord | undefined = data.find((record) => record.internalID === internalID);
    const fieldList = customRecord && 'segmentName' in customRecord ? CONST.NETSUITE_CONFIG.CUSTOM_SEGMENT_FIELDS : CONST.NETSUITE_CONFIG.CUSTOM_LIST_FIELDS;

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
                                title={customRecord[fieldName as keyof CustomRecord]}
                            />
                        ))}
                    </View>
                    <View style={styles.flex1}>
                        <MenuItem
                            icon={Expensicons.Trashcan}
                            title={translate('common.remove')}
                            onPress={() => alert(internalID)}
                        />
                    </View>
                </View>
            )}
        </ConnectionLayout>
    );
}

NetSuiteImportCustomFieldView.displayName = 'NetSuiteImportCustomFieldView';
export default withPolicyConnections(NetSuiteImportCustomFieldView);
