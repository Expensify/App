/**
 * Lists the reports that failed to export before the accounting connection worked again, and exports the ones the admin keeps selected.
 */
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import type {ValuePickerItem} from '@components/ValuePicker/types';
import ValueSelectorModal from '@components/ValuePicker/ValueSelectorModal';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useFailedExportsToRetry from '@hooks/useFailedExportsToRetry';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {exportToIntegrationOnSearch} from '@libs/actions/Search';
import {getExportFailureMessages} from '@libs/FailedExportRetryUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import {format} from 'date-fns';
import React, {useState} from 'react';
import {View} from 'react-native';

type RetryFailedExportsPageProps = WithPolicyConnectionsProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.RETRY_FAILED_EXPORTS>;

function RetryFailedExportsPage({policy, route}: RetryFailedExportsPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const [lookbackDays, setLookbackDays] = useState<number>(CONST.POLICY.CONNECTIONS.FAILED_EXPORT_RETRY_DEFAULT_LOOKBACK_DAYS);
    const [isLookbackPickerVisible, setIsLookbackPickerVisible] = useState(false);

    // Store the reports the admin cleared, so that every report starts selected, also after the lookback period changes.
    const [deselectedReportIDs, setDeselectedReportIDs] = useState<string[]>([]);

    const {connectionName, integrationName = '', reports} = useFailedExportsToRetry(policy, lookbackDays);
    const reportIDs = reports.map((report) => report.reportID);
    const [failureMessages] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: (allReportActions) => getExportFailureMessages(allReportActions, reportIDs)});
    const selectedReportIDs = reportIDs.filter((reportID) => !deselectedReportIDs.includes(reportID));

    const lookbackItems: ValuePickerItem[] = CONST.POLICY.CONNECTIONS.FAILED_EXPORT_RETRY_LOOKBACK_DAYS_OPTIONS.map((days) => ({
        value: String(days),
        label: translate('common.durationDays', {count: days}),
    }));

    const getErrorMessage = (reportID: string) => {
        const message = failureMessages?.[reportID];
        if (message?.includes(CONST.ERROR.INTEGRATION_MESSAGE_INVALID_CREDENTIALS)) {
            return translate('report.actions.error.invalidCredentials');
        }
        return message;
    };

    const listItems: ListItem[] = reports.map((report) => ({
        keyForList: report.reportID,
        text: report.reportName,
        alternateText: translate('workspace.accounting.failedExportsToRetry.reportDetails', {
            date: format(report.failedTime, CONST.DATE.MONTH_DAY_ABBR_FORMAT, {locale: dateFnsLocale}),
            errorMessage: getErrorMessage(report.reportID),
        }),
        rightElement: <Text style={[styles.textLabel, styles.ml3]}>{convertToDisplayString(report.total, report.currency)}</Text>,
        isSelected: selectedReportIDs.includes(report.reportID),
    }));

    const toggleReport = (item: ListItem) => {
        const reportID = item.keyForList;
        if (!reportID) {
            return;
        }
        setDeselectedReportIDs((current) => (current.includes(reportID) ? current.filter((id) => id !== reportID) : [...current, reportID]));
    };

    const toggleAllReports = () => {
        setDeselectedReportIDs(selectedReportIDs.length === reportIDs.length ? reportIDs : []);
    };

    const selectLookback = (item: Pick<ValuePickerItem, 'value'>) => {
        setLookbackDays(Number(item.value));
        setIsLookbackPickerVisible(false);
    };

    const exportSelectedReports = () => {
        if (!connectionName || selectedReportIDs.length === 0) {
            return;
        }
        // The hash only identifies a Search snapshot, and this page has none.
        exportToIntegrationOnSearch(CONST.DEFAULT_NUMBER_ID, selectedReportIDs, connectionName, policy);
        Navigation.goBack();
    };

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = {
        showButton: true,
        text: translate('workspace.accounting.failedExportsToRetry.exportReports', {count: selectedReportIDs.length}),
        onConfirm: exportSelectedReports,
        isDisabled: !connectionName || selectedReportIDs.length === 0,
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.ACCOUNTING}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="RetryFailedExportsPage"
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.accounting.failedExportsToRetry.title')}
                    onBackButtonPress={Navigation.goBack}
                />
                {!!integrationName && (
                    <View style={[styles.ph5, styles.pb3]}>
                        <Text style={styles.textSupporting}>{translate('workspace.accounting.failedExportsToRetry.description', {integrationName})}</Text>
                    </View>
                )}
                <MenuItemField
                    name={translate('workspace.accounting.failedExportsToRetry.lookbackLabel')}
                    value={translate('common.durationDays', {count: lookbackDays})}
                    onPress={() => setIsLookbackPickerVisible(true)}
                />
                <View style={[styles.flex1, styles.mt3]}>
                    <SelectionList
                        data={listItems}
                        ListItem={MultiSelectListItem}
                        canSelectMultiple
                        onSelectRow={toggleReport}
                        onSelectAll={reports.length > 0 ? toggleAllReports : undefined}
                        selectionButtonPosition={CONST.SELECTION_BUTTON_POSITION.RIGHT}
                        shouldHeaderBeInsideList
                        shouldSingleExecuteRowSelect
                        addBottomSafeAreaPadding
                        alternateNumberOfSupportedLines={2}
                        confirmButtonOptions={confirmButtonOptions}
                        listEmptyContent={<Text style={[styles.textSupporting, styles.ph5, styles.pv3]}>{translate('workspace.accounting.failedExportsToRetry.emptyState')}</Text>}
                    />
                </View>
                <ValueSelectorModal
                    isVisible={isLookbackPickerVisible}
                    label={translate('workspace.accounting.failedExportsToRetry.lookbackLabel')}
                    items={lookbackItems}
                    selectedItem={lookbackItems.find((item) => item.value === String(lookbackDays))}
                    onItemSelected={selectLookback}
                    onClose={() => setIsLookbackPickerVisible(false)}
                    onBackdropPress={() => setIsLookbackPickerVisible(false)}
                    shouldEnableKeyboardAvoidingView={false}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyConnections(RetryFailedExportsPage);
