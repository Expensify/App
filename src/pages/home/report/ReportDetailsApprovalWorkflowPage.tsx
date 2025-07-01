import mermaid from 'mermaid';
import React, {useEffect, useMemo, useRef} from 'react';
import {Platform, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
import {ReactZoomPanPinchContentRef, TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Minus, Plus} from '@components/Icon/Expensicons';
import {useSession} from '@components/OnyxProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CategoryUtils from '@libs/CategoryUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as UserUtils from '@libs/UserUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import colors from '@styles/theme/colors';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PolicyEmployee} from '@src/types/onyx';

type ChartedEmployee = PolicyEmployee & {
    id?: string;
    skipped?: boolean;
    isCategoryApprover?: boolean;
    isTagApprover?: boolean;
};

type ReportDetailsApprovalWorkflowPageProps = PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.APPROVAL_WORKFLOW>;

function ReportDetailsApprovalWorkflowPage({route}: ReportDetailsApprovalWorkflowPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {reportID, backTo} = route.params;
    const session = useSession();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID || ''}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${report?.reportID ? TransactionUtils.getTransactionID(report.reportID) || '' : ''}`);

    // Extract category and tag from the transaction
    // Find the specific transaction for this report
    const reportTransaction = transaction && typeof transaction === 'object' ?
        Object.values(transaction).find((t: any) => t?.reportID === reportID) :
        transaction;

    const reportCategory = (reportTransaction as any)?.category;
    const reportTag = (reportTransaction as any)?.tag;

    // Get category and tag approvers if they exist
    const categoryApprover = reportCategory ?
        CategoryUtils.getCategoryApproverRule(policy?.rules?.approvalRules ?? [], reportCategory)?.approver :
        null;
    const tagApprover = reportTag ?
        PolicyUtils.getTagApproverRule(policy, reportTag)?.approver :
        null;

    // Get the next approver using our own workflow logic
    const nextApproverAccountID = useMemo(() => {
        if (!report || !policy?.employeeList || !personalDetails) return null;

        const employeeList = policy.employeeList;
        const employees = Object.values(employeeList);

        // Build the workflow chain starting from the report submitter
        if (!report.ownerAccountID) return null;

        const submitterPersonalDetails = personalDetails[report.ownerAccountID];
        const submitterEmail = submitterPersonalDetails?.login || '';
        const submitter = employees.find((employee) => employee.email === submitterEmail);

        if (!submitter) return null;

        // Handle self-submission case
        if (submitter.submitsTo === submitter.email) {
            return null;
        }

        const getNode = (employee: PolicyEmployee, nodeLevel: number) => {
            const targetEmail = nodeLevel === 0 ? employee?.submitsTo : employee?.forwardsTo;
            const target = employees.find((e) => e.email === targetEmail);
            return target ? {...target, id: Math.random().toString(36).slice(2, 8)} : null;
        };

        // Build complete workflow chain including category and tag approvers
        const workflow = [{...submitter, id: Math.random().toString(36).slice(2, 8), skipped: false}];

        // First, build the standard workflow chain (L4+) to check for duplicates
        const standardWorkflow = [];
        let level = 0;
        let next = getNode(submitter, level);

        while (next && standardWorkflow.length < 10) {
            standardWorkflow.push(next);
            level++;
            next = getNode(next, level);
        }

        // Check if category/tag approvers should be skipped based on CORRECT business rules
        const isCategoryApproverSubmitter = categoryApprover && submitter.email === categoryApprover;
        const isTagApproverSubmitter = tagApprover && submitter.email === tagApprover;
        const isSamePersonForBoth = categoryApprover && tagApprover && categoryApprover === tagApprover;

        // Add category approver (L2) if exists - ONLY skip if they're the submitter
        if (categoryApprover) {
            const categoryNode = {
                email: categoryApprover,
                id: Math.random().toString(36).slice(2, 8),
                skipped: !!isCategoryApproverSubmitter
            };
            workflow.push(categoryNode);
        }

        // Add tag approver (L3) if exists and not same as category - ONLY skip if they're submitter or same as category
        if (tagApprover && !isSamePersonForBoth) {
            const tagNode = {
                email: tagApprover,
                id: Math.random().toString(36).slice(2, 8),
                skipped: !!(isTagApproverSubmitter || isSamePersonForBoth)
            };
            workflow.push(tagNode);
        }

        // Add standard workflow chain (L4+) - mark as skipped if they already appear in the complete workflow
        for (const standardNode of standardWorkflow) {
            const isDup = workflow.some((e) => e.email === standardNode.email);
            workflow.push({...standardNode, skipped: isDup});
        }

        function getUserInfo(email: string) {
            // First try to get personal details by email
            const personalDetail = PersonalDetailsUtils.getPersonalDetailByEmail(email);

            if (personalDetail && personalDetail.displayName) {
                return {
                    firstName: personalDetail.firstName || '',
                    lastName: personalDetail.lastName || '',
                    displayName: PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail) || email,
                    avatar: personalDetail.avatar || UserUtils.getDefaultAvatarURL(personalDetail.accountID),
                    accountID: personalDetail.accountID
                };
            }

            // Try to find by searching through all personal details
            const allPersonalDetailsArray = Object.values(personalDetails || {});
            const foundDetail = allPersonalDetailsArray.find(detail => detail?.login?.toLowerCase() === email.toLowerCase());

            if (foundDetail && foundDetail.displayName) {
                return {
                    firstName: foundDetail.firstName || '',
                    lastName: foundDetail.lastName || '',
                    displayName: PersonalDetailsUtils.getDisplayNameOrDefault(foundDetail) || email,
                    avatar: foundDetail.avatar || UserUtils.getDefaultAvatarURL(foundDetail.accountID),
                    accountID: foundDetail.accountID
                };
            }

            // Fallback to email parsing if no personal details found
            const name = email.split('@')[0].split('.');
            let firstName = name[0] ?? '';
            let lastName = name[1] ?? '';
            firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

            const displayName = `${firstName} ${lastName}`.trim();
            return {
                firstName,
                lastName,
                displayName: displayName || email,
                avatar: UserUtils.getDefaultAvatarURL(-1),
                accountID: -1
            };
        }

        // Find who has already acted by looking at report actions
        let lastActorIndex = 0; // Start with submitter (position 0)

        if (reportActions) {
            const sortedReportActions = ReportActionsUtils.getSortedReportActions(Object.values(reportActions));

            // Look through report actions to find the last person in our workflow who acted
            for (let i = sortedReportActions.length - 1; i >= 0; i--) {
                const action = sortedReportActions[i];
                if (action && action.actorAccountID) {
                    // Check for various approval/submission action types
                    const isRelevantAction = ReportActionsUtils.isApprovedOrSubmittedReportAction(action) ||
                                           action.actionName === 'APPROVED' ||
                                           action.actionName === 'SUBMITTED' ||
                                           action.actionName === 'FORWARDED';

                    if (isRelevantAction) {
                        // Find this actor in our workflow
                        for (let j = 0; j < workflow.length; j++) {
                            const workflowNode = workflow[j];
                            if (workflowNode.email) {
                                const userInfo = getUserInfo(workflowNode.email);
                                if (userInfo.accountID === action.actorAccountID) {
                                    lastActorIndex = j;
                                    break;
                                }
                            }
                        }
                        break; // We found the most recent actor, stop looking
                    }
                }
            }
        }

        // Find the next non-skipped person after the last actor
        for (let i = lastActorIndex + 1; i < workflow.length; i++) {
            const workflowNode = workflow[i];
            if (!workflowNode.skipped && workflowNode.email) {
                const userInfo = getUserInfo(workflowNode.email);
                return userInfo.accountID;
            }
        }

        return -1; // No next approver found
    }, [report, policy?.employeeList, personalDetails, reportActions, categoryApprover, tagApprover]);

    const chart = useMemo(() => {
        if (!policy?.employeeList || !report?.ownerAccountID || !personalDetails) {
            return '';
        }

        const employeeList = policy.employeeList;
        const employees = Object.values(employeeList);

        // Find the report submitter
        const submitterPersonalDetails = personalDetails[report.ownerAccountID];
        const submitterEmail = submitterPersonalDetails?.login || '';
        const submitter = employees.find((employee) => employee.email === submitterEmail);

        if (!submitter) {
            return '';
        }

        // Handle self-submission case
        if (submitter.submitsTo === submitter.email) {
            return 'SELF_SUBMISSION';
        }

        const getNode = (employee: ChartedEmployee, nodeLevel: number) => {
            const targetEmail = nodeLevel === 0 ? employee?.submitsTo : employee?.forwardsTo;
            const target = employees.find((e) => e.email === targetEmail);
            return target ? {...target, id: Math.random().toString(36).slice(2, 8)} : null;
        };

        const getUserInfo = (email: string) => {
            // First try to get personal details by email
            const personalDetail = PersonalDetailsUtils.getPersonalDetailByEmail(email);

            if (personalDetail && personalDetail.displayName) {
                return {
                    firstName: personalDetail.firstName || '',
                    lastName: personalDetail.lastName || '',
                    displayName: PersonalDetailsUtils.getDisplayNameOrDefault(personalDetail) || email,
                    avatar: personalDetail.avatar || UserUtils.getDefaultAvatarURL(personalDetail.accountID),
                    accountID: personalDetail.accountID
                };
            }

            // Try to find by searching through all personal details
            const allPersonalDetailsArray = Object.values(personalDetails || {});
            const foundDetail = allPersonalDetailsArray.find(detail => detail?.login?.toLowerCase() === email.toLowerCase());

            if (foundDetail && foundDetail.displayName) {
                return {
                    firstName: foundDetail.firstName || '',
                    lastName: foundDetail.lastName || '',
                    displayName: PersonalDetailsUtils.getDisplayNameOrDefault(foundDetail) || email,
                    avatar: foundDetail.avatar || UserUtils.getDefaultAvatarURL(foundDetail.accountID),
                    accountID: foundDetail.accountID
                };
            }

            // Fallback to email parsing if no personal details found
            const name = email.split('@')[0].split('.');
            let firstName = name[0] ?? '';
            let lastName = name[1] ?? '';
            firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

            const displayName = `${firstName} ${lastName}`.trim();
            return {
                firstName,
                lastName,
                displayName: displayName || email,
                avatar: UserUtils.getDefaultAvatarURL(-1),
                accountID: -1
            };
        };

        // Build the SAME complete workflow structure as used in nextApproverAccountID calculation
        const workflow: ChartedEmployee[] = [{...submitter, id: Math.random().toString(36).slice(2, 8), skipped: false}];

        // First, build the standard workflow chain (L4+) to check for duplicates
        const standardWorkflow: ChartedEmployee[] = [];
        let level = 0;
        let next = getNode(submitter, level);

        while (next && standardWorkflow.length < 10) {
            standardWorkflow.push({...next, id: Math.random().toString(36).slice(2, 8)});
            level++;
            next = getNode(next, level);
        }

        // Check if category/tag approvers should be skipped based on CORRECT business rules
        const isCategoryAppreverSubmitter = categoryApprover && submitter.email === categoryApprover;
        const isTagApproverSubmitter = tagApprover && submitter.email === tagApprover;
        const isSamePersonForBoth = categoryApprover && tagApprover && categoryApprover === tagApprover;

        // Add category approver (L2) if exists - ONLY skip if they're the submitter
        if (categoryApprover) {
            const categoryNode: ChartedEmployee = {
                email: categoryApprover,
                id: Math.random().toString(36).slice(2, 8),
                skipped: !!isCategoryAppreverSubmitter,
                isCategoryApprover: true
            };
            workflow.push(categoryNode);
        }

        // Add tag approver (L3) if exists and not same as category - ONLY skip if they're submitter or same as category
        if (tagApprover && !isSamePersonForBoth) {
            const tagNode: ChartedEmployee = {
                email: tagApprover,
                id: Math.random().toString(36).slice(2, 8),
                skipped: !!(isTagApproverSubmitter || isSamePersonForBoth),
                isTagApprover: true
            };
            workflow.push(tagNode);
        }

        // Add standard workflow chain (L4+) - mark as skipped if they already appear in the complete workflow
        for (const standardNode of standardWorkflow) {
            const isDup = workflow.some((e) => e.email === standardNode.email);
            workflow.push({...standardNode, skipped: isDup});
        }

        let chart = `graph TD\nclassDef rounded stroke:transparent\nclassDef skipped fill:${colors.white},color:${colors.green},stroke:${colors.green},stroke-width:2px,stroke-dasharray:5\nclassDef nextApprover stroke:${colors.orange},stroke-width:3px`;

        for (let j = 0; j < workflow.length - 1; j++) {
            const from = workflow[j];
            const to = workflow[j + 1];

            if (!to) continue;

            const fromInfo = getUserInfo(from.email ?? '');
            const toInfo = getUserInfo(to?.email ?? '');

            const action = j === 0 ? 'submits to' : 'forwards to';

            // Check if users are the current user or the next approver
            const isCurrentUser = fromInfo.accountID === session?.accountID;
            const isToCurrentUser = toInfo.accountID === session?.accountID;
            const isNextApprover = fromInfo.accountID === nextApproverAccountID;
            const isToNextApprover = toInfo.accountID === nextApproverAccountID;

            const className = from.skipped ? 'skipped' : (isNextApprover ? 'nextApprover' : 'rounded');

            // Sanitize display names to prevent Mermaid markdown parsing issues
            const sanitizeText = (text: string) => {
                return text
                    .replace(/@/g, '(at)') // Replace @ with 'at'
                    .trim()
                    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
            };

            const fromDisplayName = isCurrentUser
                ? `${sanitizeText(fromInfo.displayName) || 'User'} (you${from.skipped ? ' - skipped' : ''})`
                : isNextApprover
                ? `${sanitizeText(fromInfo.displayName) || 'User'} (awaiting approval${from.skipped ? ' - skipped' : ''})`
                : (sanitizeText(fromInfo.displayName) || 'User');
            const toDisplayName = isToCurrentUser
                ? `${sanitizeText(toInfo.displayName) || 'User'} (you${to.skipped ? ' - skipped' : ''})`
                : isToNextApprover
                ? `${sanitizeText(toInfo.displayName) || 'User'} (awaiting approval${to.skipped ? ' - skipped' : ''})`
                : (sanitizeText(toInfo.displayName) || 'User');
            const skippedText = (from.skipped && !isCurrentUser && !isNextApprover) ? ' (skipped)' : '';
            const toSkippedText = (to.skipped && !isToCurrentUser && !isToNextApprover) ? ' (skipped)' : '';

            const toClassName = to.skipped ? 'skipped' : (isToNextApprover ? 'nextApprover' : 'rounded');

            // Determine if we should use subgraphs for category/tag approvers
            if (from.isCategoryApprover === true) {
                const categorySubgraphId = `categoryApprover`;
                chart += `\nsubgraph ${categorySubgraphId} ["Category Approver"]\n    ${from.id}("${fromDisplayName}${skippedText}"):::${className}\nend`;
            }

            if (from.isTagApprover === true) {
                const tagSubgraphId = `tagApprover`;
                chart += `\nsubgraph ${tagSubgraphId} ["Tag Approver"]\n    ${from.id}("${fromDisplayName}${skippedText}"):::${className}\nend`;
            }

            if (to.isCategoryApprover === true) {
                const categorySubgraphId = `categoryApprover`;
                chart += `\nsubgraph ${categorySubgraphId} ["Category Approver"]\n    ${to.id}("${toDisplayName}${toSkippedText}"):::${toClassName}\nend`;
            }

            if (to.isTagApprover === true) {
                const tagSubgraphId = `tagApprover`;
                chart += `\nsubgraph ${tagSubgraphId} ["Tag Approver"]\n    ${to.id}("${toDisplayName}${toSkippedText}"):::${toClassName}\nend`;
            }

            // Add the regular nodes if they're not category/tag approvers
            if (from.isCategoryApprover !== true && from.isTagApprover !== true) {
                chart += `\n${from.id}("${fromDisplayName}${skippedText}"):::${className}`;
            }
            if (to.isCategoryApprover !== true && to.isTagApprover !== true) {
                chart += `\n${to.id}("${toDisplayName}${toSkippedText}"):::${toClassName}`;
            }

            chart += `\n${from.id} -->|"${action}"| ${to.id}`;
        }

        return chart;
    }, [policy?.employeeList, report?.ownerAccountID, personalDetails, session?.accountID, nextApproverAccountID, categoryApprover, tagApprover]);

    console.log(chart);

    if (!report || !policy) {
        return (
            <ScreenWrapper testID={ReportDetailsApprovalWorkflowPage.displayName}>
                <HeaderWithBackButton
                    title={translate('iou.viewApprovalWorkflow')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <View style={[styles.flex1, styles.p5]}>
                    <Text style={styles.textSupporting}>Loading...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (!chart) {
        return (
            <ScreenWrapper testID={ReportDetailsApprovalWorkflowPage.displayName}>
                <HeaderWithBackButton
                    title={translate('iou.viewApprovalWorkflow')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <View style={[styles.flex1, styles.p5]}>
                    <Text style={styles.textHeadline}>Approval Workflow</Text>
                    <Text style={[styles.mt3, styles.textSupporting]}>
                        No approval workflow found for this report.
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    if (chart === 'SELF_SUBMISSION') {
        return (
            <ScreenWrapper testID={ReportDetailsApprovalWorkflowPage.displayName}>
                <HeaderWithBackButton
                    title={translate('iou.viewApprovalWorkflow')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <View style={[styles.flex1, styles.p5]}>
                    <Text style={styles.textHeadline}>Approval Workflow</Text>
                    <Text style={[styles.mt3, styles.textSupporting]}>
                        This report requires no approval as the submitter is their own approver.
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper testID={ReportDetailsApprovalWorkflowPage.displayName}>
            <View style={[styles.flex1, {position: 'relative'}]}>
                <HeaderWithBackButton
                    title={translate('iou.viewApprovalWorkflow')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                    style={{zIndex: 50}}
                />

                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    {Platform.OS === 'web' && <ApprovalChartWeb chart={chart} styles={styles} />}
                    {Platform.OS !== 'web' && <ApprovalChartMobile chart={chart} />}
                </View>
            </View>
        </ScreenWrapper>
    );
}

interface ChartViewProps {
    chart: string;
    styles?: any;
}

function ApprovalChartWeb({chart, styles}: ChartViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const workflowRef = useRef<ReactZoomPanPinchContentRef>(null);

    useEffect(() => {
        if (containerRef.current) {
            mermaid.initialize({
                themeVariables: {
                    mainBkg: colors.green,
                    textColor: colors.white,
                    edgeLabelBackground: colors.green700,
                    lineColor: colors.green700,
                    fontWeight: 'bold',
                    // Subgraph styling
                    clusterBkg: 'transparent',
                    clusterBorder: '#666666',
                    titleColor: colors.green700,
                    primaryTextColor: colors.green700,
                    altBackground: 'transparent',
                },
                flowchart: {
                    padding: 20,
                    useMaxWidth: true,
                    nodeSpacing: 50,
                    // @ts-ignore
                    entityPadding: 20,
                },
                fontFamily: 'Expensify Neue',
                fontSize: 16,
                htmlLabels: true,
            });
            containerRef.current.innerHTML = chart;
            mermaid.run({nodes: [containerRef.current]});
        }
    }, [chart]);

    const onZoom = () => {
        if (workflowRef.current) {
            workflowRef.current.zoomIn(0.5);
        }
    };

    const onUnZoom = () => {
        if (workflowRef.current) {
            workflowRef.current.zoomOut(0.5);
        }
    };

    return (
        <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', overflow: 'hidden'}}>
            <TransformWrapper
                ref={workflowRef}
                minScale={0.1}
                maxScale={5}
                centerOnInit
                limitToBounds={false}
            >
                <TransformComponent>
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            minWidth: '800px',
                            minHeight: '600px',
                        }}
                    >
                        <div
                            ref={containerRef}
                            className="mermaid"
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </div>
                </TransformComponent>
            </TransformWrapper>

            <View style={{position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 4}}>
                <Button
                    success
                    icon={Plus}
                    onPress={onZoom}
                />
                <Button
                    success
                    icon={Minus}
                    onPress={onUnZoom}
                />
            </View>
        </div>
    );
}

function ApprovalChartMobile({chart}: ChartViewProps) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <style>
            body { margin: 0; padding: 0; }
        </style>
        </head>
        <body>
        <div class="mermaid">${chart}</div>
        <script>
            mermaid.initialize({ 
                startOnLoad: true,
                themeVariables: {
                    mainBkg: '${colors.green}',
                    textColor: 'white',
                    edgeLabelBackground: '${colors.green700}',
                    lineColor: '${colors.green700}',
                    fontWeight: 'bold',
                    clusterBkg: 'transparent',
                    clusterBorder: '#666666',
                    titleColor: '${colors.green700}',
                    primaryTextColor: '${colors.green700}',
                    altBackground: 'transparent',
                },
                flowchart: {
                    padding: 20,
                    useMaxWidth: true,
                    nodeSpacing: 50,
                    entityPadding: 20,
                },
                fontFamily: 'Expensify Neue',
                fontSize: 16,
                htmlLabels: true,
            });
        </script>
        </body>
        </html>
  `;

    return (
        <WebView
            originWhitelist={['*']}
            source={{html: htmlContent}}
            style={{flex: 1}}
        />
    );
}

ReportDetailsApprovalWorkflowPage.displayName = 'ReportDetailsApprovalWorkflowPage';

export default ReportDetailsApprovalWorkflowPage;
