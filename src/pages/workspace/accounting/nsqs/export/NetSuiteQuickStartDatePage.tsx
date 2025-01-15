import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen, {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteQuickStartExportDate} from '@libs/actions/connections/NetSuiteQuickStart';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const Options = Object.values(CONST.NSQS_EXPORT_DATE);
type Option = (typeof Options)[number];

function NetSuiteQuickStartDatePage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const exportDate = nsqsConfig?.exportDate ?? CONST.NSQS_EXPORT_DATE.LAST_EXPENSE;

    const sectionData: SelectorType<Option>[] = Options.map((option) => ({
        keyForList: option,
        text: translate(`workspace.nsqs.export.exportDate.values.${option}.label`),
        alternateText: translate(`workspace.nsqs.export.exportDate.values.${option}.description`),
        isSelected: option === exportDate,
        value: option,
    }));

    const updateExportDate = useCallback(
        ({value}: SelectorType<Option>) => {
            if (value !== exportDate) {
                updateNetSuiteQuickStartExportDate(policyID, value, exportDate);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT.getRoute(policyID));
        },
        [policyID, exportDate],
    );

    const headerContent = useMemo(() => <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.nsqs.export.exportDate.description')}</Text>, [translate, styles.pb5, styles.ph5]);

    return (
        <SelectionScreen<Option>
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteQuickStartDatePage.displayName}
            headerContent={headerContent}
            sections={[{data: sectionData}]}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onSelectRow={updateExportDate}
            initiallyFocusedOptionKey={sectionData.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT.getRoute(policyID))}
            title={`common.date`}
            pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.EXPORT_DATE], nsqsConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.EXPORT_DATE)}
        />
    );
}

NetSuiteQuickStartDatePage.displayName = 'NetSuiteQuickStartDatePage';

export default withPolicyConnections(NetSuiteQuickStartDatePage);
