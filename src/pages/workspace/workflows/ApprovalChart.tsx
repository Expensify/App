import mermaid from 'mermaid';
import React, {useEffect, useMemo, useRef} from 'react';
import {Platform, View} from 'react-native';
import {OnyxEntry, useOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
import {ReactZoomPanPinchContentRef, TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {F1Car, Minus, Plus} from '@components/Icon/Expensicons';
import {useSession} from '@components/OnyxProvider';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import colors from '@styles/theme/colors';
import ONYXKEYS from '@src/ONYXKEYS';
import {Policy, PolicyEmployee} from '@src/types/onyx';
import Racecar from './Racecar';

type ChartedEmployee = PolicyEmployee & {
    id?: string;
    skipped?: boolean;
};

interface ApprovalChartProps {
    policy: OnyxEntry<Policy>;
    goBack: () => void;
}

export default function ApprovalChart({policy, goBack}: ApprovalChartProps) {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const session = useSession();

    const chart = useMemo(() => {
        const employeeList = policy?.employeeList ?? {};
        const employees = Object.values(employeeList);

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

        let workflows: ChartedEmployee[][] = [];

        for (const employee of employees) {
            // Skip workflows where user submits to themselves
            if (employee.submitsTo === employee.email) {
                continue;
            }

            const workflow = [{...employee, id: Math.random().toString(36).slice(2, 8), skipped: false}];
            let level = 0;
            let next = getNode(employee, level);

            while (next && workflow.length < 10) {
                const isDup = workflow.some((e) => e.email === next?.email);
                workflow.push({...next, skipped: isDup});
                level++;
                next = getNode(next, level);
            }

            workflows.push(workflow);
        }

        // Sort workflows by the last name of the first employee (ascending)
        workflows.sort((a, b) => {
            const getLastName = (email: string) => {
                const name = email.split('@')[0].split('.');
                let lastName = name[1] ?? name[0] ?? '';
                return lastName.toLowerCase();
            };

            const lastNameA = getLastName(a[0]?.email ?? '');
            const lastNameB = getLastName(b[0]?.email ?? '');
            
            return lastNameA.localeCompare(lastNameB);
        });

        let chart = `graph TD\nclassDef rounded stroke:transparent\nclassDef skipped fill:${colors.white},color:${colors.green},stroke:${colors.green},stroke-width:2px,stroke-dasharray:5\nclassDef currentUser stroke:${colors.orange},stroke-width:3px`;

        for (let i = 0; i < workflows.length; i++) {
            const workflow = workflows[i];

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
                const toClassName = to.skipped ? 'skipped' : (isToCurrentUser ? 'currentUser' : 'rounded');

                // Sanitize display names to prevent Mermaid markdown parsing issues
                const sanitizeText = (text: string) => {
                    return text
                        .replace(/[[\](){}]/g, '') // Remove brackets and braces
                        .replace(/[<>]/g, '') // Remove angle brackets
                        .replace(/@/g, ' at ') // Replace @ with 'at'
                        .replace(/\./g, ' ') // Replace dots with spaces
                        .replace(/[#*_~`]/g, '') // Remove markdown formatting characters
                        .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
                        .replace(/www\.[^\s]+/g, '') // Remove www links
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
                
                chart += `\n${from.id}("${fromDisplayName}${skippedText}"):::${className} -->|"${action}"| ${to.id}("${toDisplayName}${toSkippedText}"):::${toClassName}`;
            }
        }

        return chart;
    }, [policy?.employeeList, personalDetails, session?.accountID]);

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
            <HeaderWithBackButton
                title="Workflows"
                onBackButtonPress={goBack}
                style={{zIndex: 50}}
            />

            {Platform.OS === 'web' && <ApprovalChartWeb chart={chart} />}
            {Platform.OS !== 'web' && <ApprovalChartMobile chart={chart} />}
        </View>
    );
}

interface ChartViewProps {
    chart: string;
}

function ApprovalChartWeb({chart}: ChartViewProps) {
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
                    rankSpacing: 50,
                },
                fontFamily: 'Expensify Neue',
                fontSize: 16,
                htmlLabels: true,
                // @ts-ignore - entityPadding is valid but not in types
                entityPadding: 20,
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
                    lineColor: '${colors.green700}'
                },
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

function LoadingState() {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Racecar />
        </View>
    );
}
