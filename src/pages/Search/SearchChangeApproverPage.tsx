import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {assignReportToMe} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, isAllowedToApproveExpenseReport} from '@libs/ReportUtils';
import {APPROVER_TYPE} from '@pages/ReportChangeApproverPage';
import type {ApproverType} from '@pages/ReportChangeApproverPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

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
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const {selectedReports} = useSearchContext();

    const selectedPolicies = useMemo(() => {
        const policies = new Map<string, Policy>();
        selectedReports.forEach((selectedReport) => {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            if (policy?.id) {
                policies.set(policy.id, policy);
            }
        });
        return Array.from(policies.values());
    }, [selectedReports, allPolicies]);

    const changeApprover = useCallback(() => {
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
                    ROUTES.WORKSPACE_UPGRADE.getRoute(policiesToUpgrade[0].id, CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.alias, ROUTES.CHANGE_APPROVER_SEARCH_RHP),
                );
                return;
            }

            Navigation.navigate(ROUTES.CHANGE_APPROVER_ADD_APPROVER_SEARCH_RHP);
            return;
        }

        selectedReports.forEach((selectedReport) => {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];

            if (!report || !policy) {
                return;
            }

            if (report.managerID !== currentUserDetails.accountID) {
                const hasViolations = hasViolationsReportUtils(report.reportID, transactionViolations);
                assignReportToMe(report, currentUserDetails.accountID, currentUserDetails.email ?? '', policy, hasViolations, isASAPSubmitBetaEnabled);
            }
        });

        Navigation.closeRHPFlow();
    }, [
        selectedApproverType,
        selectedPolicies,
        selectedReports,
        allPolicies,
        allReports,
        currentUserDetails.accountID,
        currentUserDetails.email,
        transactionViolations,
        isASAPSubmitBetaEnabled,
    ]);

    const sections = useMemo(() => {
        const data: Array<ListItem<ApproverType>> = [
            {
                text: translate('iou.changeApprover.actions.addApprover'),
                keyForList: APPROVER_TYPE.ADD_APPROVER,
                alternateText: translate('iou.changeApprover.actions.addApproverSubtitle'),
                isSelected: selectedApproverType === APPROVER_TYPE.ADD_APPROVER,
            },
        ];

        const shouldShowBypassApproversOption = selectedReports.some((selectedReport) => {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];

            if (!report || !policy) {
                return false;
            }

            const isCurrentUserManager = report.managerID === currentUserDetails.accountID;
            return !isCurrentUserManager && isAllowedToApproveExpenseReport(report, currentUserDetails.accountID, policy);
        });

        if (shouldShowBypassApproversOption) {
            data.push({
                text: translate('iou.changeApprover.actions.bypassApprovers'),
                keyForList: APPROVER_TYPE.BYPASS_APPROVER,
                alternateText: translate('iou.changeApprover.actions.bypassApproversSubtitle'),
                isSelected: selectedApproverType === APPROVER_TYPE.BYPASS_APPROVER,
            });
        }

        return [{data}];
    }, [selectedReports, allPolicies, allReports, currentUserDetails.accountID, selectedApproverType, translate]);

    useEffect(() => {
        if (selectedReports.length === 0 || sections[0].data.length === 0) {
            Navigation.closeRHPFlow();
        }
    }, [selectedReports, sections]);

    return (
        <ScreenWrapper
            testID={SearchChangeApproverPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                ListItem={RadioListItem}
                sections={sections}
                isAlternateTextMultilineSupported
                onSelectRow={(option) => {
                    if (!option.keyForList) {
                        return;
                    }
                    setSelectedApproverType(option.keyForList);
                    setHasError(false);
                }}
                showConfirmButton
                confirmButtonText={translate('iou.changeApprover.title')}
                onConfirm={changeApprover}
                shouldUpdateFocusedIndex
                customListHeader={
                    <>
                        <Text style={[styles.ph5, styles.mb5]}>{translate(selectedReports.length === 1 ? 'iou.changeApprover.subtitle' : 'iou.changeApprover.bulkSubtitle')}</Text>
                        {selectedPolicies.length === 1 && (
                            <View style={[styles.ph5, styles.mb5, styles.renderHTML, styles.flexRow]}>
                                <RenderHTML
                                    html={translate('iou.changeApprover.description', {
                                        workflowSettingLink: `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(selectedPolicies[0].id)}`,
                                    })}
                                />
                            </View>
                        )}
                    </>
                }
            >
                {hasError && (
                    <FormHelpMessage
                        isError
                        style={[styles.ph5, styles.mb3]}
                        message={translate('common.error.pleaseSelectOne')}
                    />
                )}
            </SelectionList>
        </ScreenWrapper>
    );
}

SearchChangeApproverPage.displayName = 'SearchChangeApproverPage';

export default SearchChangeApproverPage;
