import noop from 'lodash/noop';
import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteQuickStartProjectsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config; // s77rt
    const s77rt1 = CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG; // s77rt

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NetSuiteQuickStartProjectsPage.displayName}
            headerTitle="workspace.nsqs.import.importFields.projects.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5, styles.gap6]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT.getRoute(policyID))}
        >
            <RenderHTML html={`<comment>${Parser.replace(translate(`workspace.nsqs.import.importFields.projects.subtitle`))}</comment>`} />
            <View>
                <ToggleSettingOptionRow
                    title={translate('workspace.accounting.import')}
                    switchAccessibilityLabel={translate('workspace.accounting.import')}
                    isActive // s77rt
                    onToggle={noop} // s77rt
                />
                <MenuItemWithTopDescription
                    title={translate(`workspace.nsqs.import.importTypes.${s77rt1}.label`)}
                    description={translate(`workspace.common.displayedAs`)}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT_PROJECTS_DISPLAYED_AS.getRoute(policyID))}
                />
            </View>
        </ConnectionLayout>
    );
}

NetSuiteQuickStartProjectsPage.displayName = 'NetSuiteQuickStartProjectsPage';

export default withPolicyConnections(NetSuiteQuickStartProjectsPage);
