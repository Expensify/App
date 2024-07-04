import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import Button from '@components/Button';
import ConnectionLayout from '@components/ConnectionLayout';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type ImportCustomFieldsKeys = TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

type NetSuiteImportCustomFieldPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            importCustomField: ImportCustomFieldsKeys;
        };
    };
};

type HelpLinkComponentProps = {
    importCustomField: ImportCustomFieldsKeys;
    translate: LocaleContextProps['translate'];
    styles: ThemeStyles;
    alignmentStyle: StyleProp<TextStyle>;
};

function HelpLinkComponent({importCustomField, styles, translate, alignmentStyle}: HelpLinkComponentProps) {
    return (
        <Text style={[styles.mb3, alignmentStyle]}>
            <TextLink
                href={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.helpLink`)}
                style={[styles.link]}
            >
                {translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.helpLinkText`)}
            </TextLink>
            {translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.helpText`)}
        </Text>
    );
}

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
                subtitleComponent={
                    <HelpLinkComponent
                        importCustomField={importCustomField}
                        styles={styles}
                        translate={translate}
                        alignmentStyle={styles.textAlignCenter}
                    />
                }
                containerStyle={[styles.flex1, styles.justifyContentCenter]}
            />
        ),
        [importCustomField, styles, translate],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.ph5]}>
                <HelpLinkComponent
                    importCustomField={importCustomField}
                    styles={styles}
                    translate={translate}
                    alignmentStyle={styles.textAlignLeft}
                />
            </View>
        ),
        [styles, importCustomField, translate],
    );

    return (
        <ConnectionLayout
            displayName={NetSuiteImportCustomFieldPage.displayName}
            headerTitle={`workspace.netsuite.import.importCustomFields.${importCustomField}.title`}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        >
            {data.length === 0 ? listEmptyComponent : listHeaderComponent}

            {data.map((record) => (
                <MenuItemWithTopDescription
                    key={record.internalID}
                    description={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.recordTitle`)}
                    shouldShowRightIcon
                    title={'listName' in record ? record.listName : record.segmentName}
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW.getRoute(policyID, importCustomField, record.internalID))}
                />
            ))}

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
