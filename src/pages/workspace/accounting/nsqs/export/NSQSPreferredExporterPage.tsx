import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNSQSExporter} from '@libs/actions/connections/NSQS';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getAdminEmployees, settingsPendingAction} from '@libs/PolicyUtils';
import {isExpensifyTeam} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearNSQSErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NSQSPreferredExporterPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const policyOwner = policy?.owner ?? '';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const exporter = nsqsConfig?.exporter ?? policyOwner;
    const exporters = getAdminEmployees(policy);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    const sectionData: SelectorType[] = useMemo(
        () =>
            exporters.reduce<SelectorType[]>((options, option) => {
                if (!option.email) {
                    return options;
                }

                // Don't show guides if the current user is not a guide themselves or an Expensify employee
                if (isExpensifyTeam(option.email) && !isExpensifyTeam(policyOwner) && !isExpensifyTeam(currentUserLogin)) {
                    return options;
                }

                options.push({
                    keyForList: option.email,
                    text: option.email,
                    isSelected: option.email === exporter,
                    value: option.email,
                });

                return options;
            }, []),
        [exporter, exporters, policyOwner, currentUserLogin],
    );

    const updateExporter = useCallback(
        ({value: email}: SelectorType) => {
            if (email !== exporter) {
                updateNSQSExporter(policyID, email, exporter);
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
            displayName={NSQSPreferredExporterPage.displayName}
            headerContent={headerContent}
            sections={[{data: sectionData}]}
            listItem={RadioListItem}
            listItemWrapperStyle={styles.mnh13}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onSelectRow={updateExporter}
            initiallyFocusedOptionKey={sectionData.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT.getRoute(policyID))}
            title="workspace.accounting.preferredExporter"
            pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.EXPORTER], nsqsConfig?.pendingFields)}
            errors={getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.EXPORTER)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.EXPORTER)}
        />
    );
}

NSQSPreferredExporterPage.displayName = 'NSQSPreferredExporterPage';

export default withPolicyConnections(NSQSPreferredExporterPage);
