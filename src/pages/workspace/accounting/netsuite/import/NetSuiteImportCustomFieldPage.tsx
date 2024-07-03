import {ExpensiMark} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import Button from '@components/Button';
import ConnectionLayout from '@components/ConnectionLayout';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const parser = new ExpensiMark();

type ImportCustomFieldsKeys = TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

type NetSuiteImportCustomFieldPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            importCustomField: ImportCustomFieldsKeys;
        };
    };
};

function NetSuiteImportCustomFieldPage({
    policy,
    route: {
        params: {importCustomField},
    },
}: NetSuiteImportCustomFieldPageProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const config = policy?.connections?.netsuite?.options?.config;
    const data = config?.syncOptions?.[importCustomField] ?? [];

    const listEmptyComponent = useMemo(
        () => (
            <WorkspaceEmptyStateSection
                title={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.emptyTitle`)}
                icon={Illustrations.EmptyStateRecords}
                subtitle={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.helpLink`)}
                shouldParseSubtitle
                containerStyle={[styles.flex1, styles.justifyContentCenter]}
            />
        ),
        [importCustomField, styles.flex1, styles.justifyContentCenter, translate],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.ph5, styles.dFlex, styles.mt2, styles.mb4, styles.w100]}>
                <RenderHTML html={`<comment><muted-text>${parser.replace(translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.helpLink`))}</muted-text></comment>`} />
            </View>
        ),
        [styles.ph5, styles.dFlex, styles.mt2, styles.mb4, styles.w100, translate, importCustomField],
    );

    return (
        <ConnectionLayout
            displayName={NetSuiteImportCustomFieldPage.displayName}
            headerTitle={`workspace.netsuite.import.importCustomFields.${importCustomField}.title`}
            headerSubtitle={config?.subsidiary ?? ''}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        >
            {data.length === 0 && listEmptyComponent}
            {data.length > 0 && listHeaderComponent}

            <View>
                {data.map((record) => (
                    <MenuItemWithTopDescription
                        key={record.internalID}
                        description={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.recordTitle`)}
                        shouldShowRightIcon
                        title={'listName' in record ? record.listName : record.segmentName}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW.getRoute(policyID, importCustomField, record.internalID))}
                    />
                ))}
            </View>

            <FixedFooter style={[styles.mtAuto]}>
                <Button
                    success
                    large
                    text={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.addButtonText`)}
                />
            </FixedFooter>
        </ConnectionLayout>
    );
}

NetSuiteImportCustomFieldPage.displayName = 'NetSuiteImportCustomFieldPage';
export default withPolicyConnections(NetSuiteImportCustomFieldPage);
