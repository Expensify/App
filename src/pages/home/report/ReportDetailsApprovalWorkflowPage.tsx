import mermaid from 'mermaid';
import React, {useEffect, useMemo, useRef} from 'react';
import {Platform, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
import {ReactZoomPanPinchContentRef, TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Minus, Plus} from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
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

        const getNameByEmail = (email: string) => {
            const name = email.split('@')[0].split('.');

            let firstName = name[0] ?? '';
            let lastName = name[1] ?? '';

            firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

            return {firstName, lastName};
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

        let chart = `graph TD\nclassDef rounded rx:27,stroke:transparent\nclassDef skipped fill:${colors.white},color:${colors.green},stroke:${colors.green},stroke-width:1px`;

        for (let j = 0; j < workflow.length - 1; j++) {
            const from = workflow[j];
            const to = workflow[j + 1];

            if (!to) continue;

            const fromName = getNameByEmail(from.email ?? '');
            const toName = getNameByEmail(to?.email ?? '');

            const action = j === 0 ? 'submits to' : 'forwards to';
            const skipped = from.skipped ? '(skipped)' : '';
            const className = from.skipped ? 'skipped' : 'rounded';

            chart += `\n${from.id}["${fromName.firstName} ${fromName.lastName} ${skipped}"]:::${className} -->|"${action}"| ${to.id}["${toName.firstName} ${toName.lastName}"]:::rounded`;
        }

        return chart;
    }, [policy?.employeeList, report?.ownerAccountID, personalDetails]);

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
                },
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
            mermaid.initialize({ startOnLoad: true });
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