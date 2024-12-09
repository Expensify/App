import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import ConnectionLayout from '@components/ConnectionLayout';
import FixedFooter from '@components/FixedFooter';
import * as Illustrations from '@components/Icon/Illustrations';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type ImportCustomFieldsKeys = ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

type NetSuiteImportCustomFieldPageProps = WithPolicyConnectionsProps & {
    route: {
        params: {
            /** Whether the record is of type custom segment or list */
            importCustomField: ImportCustomFieldsKeys;
        };
    };
};

type HelpLinkComponentProps = {
    /** Whether the record is of type custom segment or list */
    importCustomField: ImportCustomFieldsKeys;

    /** Callback to localize content */
    translate: LocaleContextProps['translate'];

    /** Theme styles to apply to the component */
    styles: ThemeStyles;

    /** Text alignment style for the Text component   */
    alignmentStyle: StyleProp<TextStyle>;
};

function HelpLinkComponent({importCustomField, styles, translate, alignmentStyle}: HelpLinkComponentProps) {
    return (
        <Text style={[styles.mb3, styles.flex1, alignmentStyle]}>
            <TextLink
                href={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.helpLink`)}
                style={[styles.link, alignmentStyle]}
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
                shouldStyleAsCard={false}
                title={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.emptyTitle`)}
                icon={Illustrations.FolderWithPapers}
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
            <View style={[styles.ph5, styles.flexRow]}>
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
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldIncludeSafeAreaPaddingBottom
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID))}
        >
            {data.length === 0 ? listEmptyComponent : listHeaderComponent}
            {data.map((record, index) => (
                <OfflineWithFeedback
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${record.internalID}-${index}`}
                    pendingAction={settingsPendingAction([`${importCustomField}_${index}`], config?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        description={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.recordTitle`)}
                        shouldShowRightIcon
                        title={'listName' in record ? record.listName : record.segmentName}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW.getRoute(policyID, importCustomField, index))}
                        brickRoadIndicator={areSettingsInErrorFields([`${importCustomField}_${index}`], config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}

            <FixedFooter style={[styles.mtAuto, styles.pt3]}>
                <Button
                    success
                    large
                    isDisabled={!!config?.pendingFields?.[importCustomField]}
                    onPress={() => {
                        if (importCustomField === CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS) {
                            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD.getRoute(policyID));
                        } else {
                            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD.getRoute(policyID));
                        }
                    }}
                    text={translate(`workspace.netsuite.import.importCustomFields.${importCustomField}.addText`)}
                />
            </FixedFooter>
        </ConnectionLayout>
    );
}

NetSuiteImportCustomFieldPage.displayName = 'NetSuiteImportCustomFieldPage';
export default withPolicyConnections(NetSuiteImportCustomFieldPage);
