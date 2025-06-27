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
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
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

        // Build workflow chain for the report submitter
        const workflow = [{...submitter, id: Math.random().toString(36).slice(2, 8), skipped: false}];
        let level = 0;
        let next = getNode(submitter, level);

        while (next && workflow.length < 10) {
            const isDup = workflow.some((e) => e.email === next?.email);
            workflow.push({...next, skipped: isDup});
            level++;
            next = getNode(next, level);
        }

        let chart = `graph TD\nclassDef rounded stroke:transparent\nclassDef skipped fill:${colors.white},color:${colors.green},stroke:${colors.green},stroke-width:2px,stroke-dasharray:5\nclassDef currentUser stroke:${colors.orange},stroke-width:3px`;

        for (let j = 0; j < workflow.length - 1; j++) {
            const from = workflow[j];
            const to = workflow[j + 1];

            if (!to) continue;

            const fromInfo = getUserInfo(from.email ?? '');
            const toInfo = getUserInfo(to?.email ?? '');

            const action = j === 0 ? 'submits to' : 'forwards to';
            
            // Check if users are the current user
            const isCurrentUser = fromInfo.accountID === session?.accountID;
            const isToCurrentUser = toInfo.accountID === session?.accountID;
            
            const className = from.skipped ? 'skipped' : (isCurrentUser ? 'currentUser' : 'rounded');

            // Sanitize display names to prevent Mermaid markdown parsing issues
            const sanitizeText = (text: string) => {
                return text
                    .replace(/@/g, '(at)') // Replace @ with 'at'
                    .trim()
                    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
            };
            
            const fromDisplayName = isCurrentUser 
                ? `${sanitizeText(fromInfo.displayName) || 'User'} (you${from.skipped ? ' - skipped' : ''})`
                : (sanitizeText(fromInfo.displayName) || 'User');
            const toDisplayName = isToCurrentUser 
                ? `${sanitizeText(toInfo.displayName) || 'User'} (you${to.skipped ? ' - skipped' : ''})`
                : (sanitizeText(toInfo.displayName) || 'User');
            const skippedText = (from.skipped && !isCurrentUser) ? ' (skipped)' : '';
            const toSkippedText = (to.skipped && !isToCurrentUser) ? ' (skipped)' : '';
            
            const toClassName = to.skipped ? 'skipped' : (isToCurrentUser ? 'currentUser' : 'rounded');
            
            chart += `\n${from.id}("${fromDisplayName}${skippedText}"):::${className} -->|"${action}"| ${to.id}("${toDisplayName}${toSkippedText}"):::${toClassName}`;
        }

        return chart;
    }, [policy?.employeeList, report?.ownerAccountID, personalDetails, session?.accountID]);

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
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, {position: 'relative'}]}>
                <HeaderWithBackButton
                    title={translate('iou.viewApprovalWorkflow')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                    style={{zIndex: 50}}
                />

                {Platform.OS === 'web' && <ApprovalChartWeb chart={chart} styles={styles} />}
                {Platform.OS !== 'web' && <ApprovalChartMobile chart={chart} />}
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
                },
                flowchart: {
                    padding: 20,
                    useMaxWidth: true,
                    nodeSpacing: 50,
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
        <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0, position: 'relative'}}>
            <TransformWrapper
                ref={workflowRef}
                minScale={0.1}
                maxScale={5}
                centerOnInit
            >
                <TransformComponent>
                    <div
                        style={{
                            width: 20000,
                            height: 20000,
                            backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
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
                },
                flowchart: {
                    padding: 20,
                    useMaxWidth: true,
                    nodeSpacing: 50,
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