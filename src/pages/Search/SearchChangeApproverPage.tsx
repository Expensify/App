import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {assignReportToMe} from '@libs/actions/IOU';
import {openReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, isAllowedToApproveExpenseReport} from '@libs/ReportUtils';
import {APPROVER_TYPE} from '@pages/ReportChangeApproverPage';
import type {ApproverType} from '@pages/ReportChangeApproverPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

function SearchChangeApproverPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [selectedApproverType, setSelectedApproverType] = useState<ApproverType>();
    const [hasError, setHasError] = useState(false);
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP, {canBeMissing: true});
    const {clearSelectedTransactions, selectedReports} = useSearchContext();
    const [hasLoadedApp] = useOnyx(ONYXKEYS.HAS_LOADED_APP, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const [isSaving, setIsSaving] = useState(false);

    const getOnyxReports = (allReports: OnyxCollection<Report>) => {
        const reports = new Map<string, Report>();
        for (const selectedReport of selectedReports) {
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];
            if (!report?.reportID) {
                continue;
            }
            reports.set(selectedReport.reportID, report);
        }
        return reports;
    };

    // React Compiler automatically memoizes the selector, so we can suppress the ESLint rule
    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [onyxReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: getOnyxReports, canBeMissing: true});
    const isLoadingOnyxReports = useRef(false);

    useEffect(() => {
        if (!hasLoadedApp || !selectedReports.length) {
            return;
        }

        if (onyxReports?.size === selectedReports.length) {
            isLoadingOnyxReports.current = false;
            return;
        }

        if (isLoadingOnyxReports.current) {
            return;
        }

        isLoadingOnyxReports.current = true;
        for (const selectedReport of selectedReports) {
            if (onyxReports?.has(selectedReport.reportID)) {
                continue;
            }

            // Load the report into Onyx, because data from SearchContext contains only a subset of report properties.
            // Alternatively, remove this and make sure the backend returns all required properties and SearchContext keeps all of them.
            openReport(selectedReport.reportID);
        }
    }, [hasLoadedApp, onyxReports, selectedReports]);

    const getSelectedPolicies = () => {
        const policies = new Map<string, Policy>();
        for (const selectedReport of selectedReports) {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            if (policy?.id) {
                policies.set(policy.id, policy);
            }
        }
        return Array.from(policies.values());
    };
    const selectedPolicies = getSelectedPolicies();

    const changeApprover = () => {
        if (!selectedApproverType) {
            setHasError(true);
            return;
        }

        if (selectedApproverType === APPROVER_TYPE.ADD_APPROVER) {
            const policiesToUpgrade = selectedPolicies.filter((policy) => !isControlPolicy(policy));
            if (policiesToUpgrade.length > 1) {
                // Bulk upgrade is not supported, so show a general page to guide the user to upgrade manually
                Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(undefined, undefined, ROUTES.CHANGE_APPROVER_SEARCH_RHP));
                return;
            }
            if (policiesToUpgrade.length === 1) {
                Navigation.navigate(
                    ROUTES.WORKSPACE_UPGRADE.getRoute(policiesToUpgrade.at(0)?.id, CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.alias, ROUTES.CHANGE_APPROVER_SEARCH_RHP),
                );
                return;
            }

            Navigation.navigate(ROUTES.CHANGE_APPROVER_ADD_APPROVER_SEARCH_RHP);
            return;
        }

        setIsSaving(true);
        for (const selectedReport of selectedReports) {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = onyxReports?.get(selectedReport.reportID);
            if (!policy || !report) {
                continue;
            }

            if (report.managerID !== currentUserDetails.accountID) {
                const hasViolations = hasViolationsReportUtils(report.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.email ?? '');
                const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${selectedReport.reportID}`];
                assignReportToMe(report, currentUserDetails.accountID, currentUserDetails.email ?? '', policy, hasViolations, isASAPSubmitBetaEnabled, reportNextStep);
            }
        }

        // This actually clears selected reports as well
        clearSelectedTransactions();
    };

    const getApproverTypes = () => {
        const data: Array<ListItem<ApproverType>> = [
            {
                text: translate('iou.changeApprover.actions.addApprover'),
                keyForList: APPROVER_TYPE.ADD_APPROVER,
                alternateText: translate('iou.changeApprover.actions.addApproverSubtitle'),
                isSelected: selectedApproverType === APPROVER_TYPE.ADD_APPROVER,
            },
        ];

        const hasPermission = selectedReports.every((selectedReport) => {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = onyxReports?.get(selectedReport.reportID);

            if (!policy || !report) {
                return false;
            }

            return isPolicyAdmin(policy) && isAllowedToApproveExpenseReport(report, currentUserDetails.accountID, policy);
        });

        const shouldShowBypassApproversOption =
            hasPermission &&
            selectedReports.some((selectedReport) => {
                const report = onyxReports?.get(selectedReport.reportID);

                if (!report) {
                    return false;
                }

                return report.managerID !== currentUserDetails.accountID;
            });

        if (shouldShowBypassApproversOption) {
            data.push({
                text: translate('iou.changeApprover.actions.bypassApprovers'),
                keyForList: APPROVER_TYPE.BYPASS_APPROVER,
                alternateText: translate('iou.changeApprover.actions.bypassApproversSubtitle'),
                isSelected: selectedApproverType === APPROVER_TYPE.BYPASS_APPROVER,
            });
        }

        return data;
    };
    const approverTypes = getApproverTypes();

    useEffect(() => {
        if (selectedReports.length && approverTypes.at(0)) {
            return;
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.closeRHPFlow();
        });
    }, [approverTypes, selectedReports.length]);

    const confirmButtonOptions = {
        showButton: true,
        text: translate('iou.changeApprover.title'),
        onConfirm: changeApprover,
    };

    const listHeader = (
        <>
            <Text style={[styles.ph5, styles.mb5]}>{translate(selectedReports.length === 1 ? 'iou.changeApprover.subtitle' : 'iou.changeApprover.bulkSubtitle')}</Text>
            {selectedPolicies.length === 1 && (
                <View style={[styles.ph5, styles.mb5, styles.renderHTML, styles.flexRow]}>
                    <RenderHTML
                        html={translate('iou.changeApprover.description', {
                            workflowSettingLink: `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(selectedPolicies.at(0)?.id)}`,
                        })}
                    />
                </View>
            )}
        </>
    );

    if ((!isOffline && onyxReports?.size !== selectedReports.length) || isSaving) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <ScreenWrapper
            testID={SearchChangeApproverPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            // Show the non-blocking offline indicator if reports are available in Onyx, otherwise show the blocking offline view because this page requires the Onyx data
            shouldShowOfflineIndicator={onyxReports?.size === selectedReports.length}
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.title')}
                onBackButtonPress={Navigation.goBack}
            />
            {onyxReports?.size !== selectedReports.length && !!isOffline ? (
                <FullPageOfflineBlockingView>
                    <View />
                </FullPageOfflineBlockingView>
            ) : (
                <SelectionList
                    data={approverTypes}
                    ListItem={RadioListItem}
                    alternateNumberOfSupportedLines={2}
                    onSelectRow={(option) => {
                        if (!option.keyForList) {
                            return;
                        }
                        setSelectedApproverType(option.keyForList);
                        setHasError(false);
                    }}
                    confirmButtonOptions={confirmButtonOptions}
                    shouldUpdateFocusedIndex
                    customListHeader={listHeader}
                >
                    {hasError && (
                        <FormHelpMessage
                            isError
                            style={[styles.ph5, styles.mb3]}
                            message={translate('common.error.pleaseSelectOne')}
                        />
                    )}
                </SelectionList>
            )}
        </ScreenWrapper>
    );
}

SearchChangeApproverPage.displayName = 'SearchChangeApproverPage';

export default SearchChangeApproverPage;
