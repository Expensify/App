import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen, {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteQuickStartExporter} from '@libs/actions/connections/NetSuiteQuickStart';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteQuickStartPreferredExporterPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const exporter = nsqsConfig?.exporter ?? '';

    // s77rt: need list of exporters
    const sectionData: SelectorType[] = ['s77rt@s77rt.com'].map((option) => ({
        keyForList: option,
        text: option,
        isSelected: option === exporter,
        value: option,
    }));

    const updateExporter = useCallback(
        ({value: email}: SelectorType) => {
            if (email !== exporter) {
                updateNetSuiteQuickStartExporter(policyID, email, exporter);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT.getRoute(policyID));
        },
        [policyID, exporter],
    );

    const headerContent = useMemo(
        () => (
            <>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.accounting.exportPreferredExporterNote')}</Text>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.accounting.exportPreferredExporterSubNote')}</Text>
            </>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteQuickStartPreferredExporterPage.displayName}
            headerContent={headerContent}
            sections={[{data: sectionData}]}
            listItem={RadioListItem}
            listItemWrapperStyle={styles.mnh13}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onSelectRow={updateExporter}
            initiallyFocusedOptionKey={sectionData.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT.getRoute(policyID))}
            title={`workspace.accounting.preferredExporter`}
            pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.EXPORTER], nsqsConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.EXPORTER)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.EXPORTER)}
        />
    );
}

NetSuiteQuickStartPreferredExporterPage.displayName = 'NetSuiteQuickStartPreferredExporterPage';

export default withPolicyConnections(NetSuiteQuickStartPreferredExporterPage);
