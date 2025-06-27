import mermaid from 'mermaid';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Platform, View} from 'react-native';
import {OnyxEntry, useOnyx} from 'react-native-onyx';
import WebView from 'react-native-webview';
import {ReactZoomPanPinchContentRef, TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import {F1Car, Minus, Plus} from '@components/Icon/Expensicons';
import {useSession} from '@components/OnyxProvider';
import * as CategoryUtils from '@libs/CategoryUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Policy, PolicyEmployee} from '@src/types/onyx';
import Racecar from './Racecar';

type ChartedEmployee = PolicyEmployee & {
    id?: string;
    skipped?: boolean;
    isCategoryApprover?: boolean;
};

interface ApprovalChartProps {
    policy: OnyxEntry<Policy>;
    goBack: () => void;
}

function ApprovalChart({policy, goBack}: ApprovalChartProps) {
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id || ''}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id || ''}`);
    const session = useSession();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState<boolean>(false);
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [isTagModalVisible, setIsTagModalVisible] = useState<boolean>(false);

    const chart = useMemo(() => {
        const employeeList = policy?.employeeList ?? {};
        const employees = Object.values(employeeList);

        // Get category approver if a category is selected
        const categoryApprover = selectedCategory ? 
            CategoryUtils.getCategoryApproverRule(policy?.rules?.approvalRules ?? [], selectedCategory)?.approver : 
            null;

        // Get tag approver if a tag is selected
        const tagApprover = selectedTag ? 
            PolicyUtils.getTagApproverRule(policy, selectedTag)?.approver : 
            null;

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

        let chart = `graph TD\nclassDef rounded stroke:transparent\nclassDef skipped fill:${colors.white},color:${colors.green},stroke:${colors.green},stroke-width:2px,stroke-dasharray:5\nclassDef currentUser stroke:#FF7F00,stroke-width:3px`;

        for (let i = 0; i < workflows.length; i++) {
            const workflow = workflows[i];

            for (let j = 0; j < workflow.length - 1; j++) {
                const from = workflow[j];
                let to = workflow[j + 1];

                // If category approver or tag approver exists and this is the first connection (submitter to first approver),
                // insert them as intermediate steps (but skip if they're already in the workflow)
                if (j === 0 && (categoryApprover || tagApprover)) {
                    const fromInfo = getUserInfo(from.email ?? '');
                    const toInfo = getUserInfo(to?.email ?? '');

                    // Check if category/tag approvers exist EARLIER in the chain (should be skipped)
                    // L1: Submitter, L2: Category, L3: Tag, L4+: Standard flow
                    
                    const submitter = workflow[0]; // L1
                    
                    // Category approver (L2) should be skipped if they are the submitter (L1)
                    const isCategoryApproverSubmitter = categoryApprover && submitter?.email === categoryApprover;
                    
                    // Tag approver (L3) should be skipped if they are:
                    // - The submitter (L1), OR
                    // - The same person as category approver (already doing L2)
                    const isTagApproverSubmitter = tagApprover && submitter?.email === tagApprover;
                    const isSamePersonForBoth = categoryApprover && tagApprover && categoryApprover === tagApprover;

                    // Sanitize display names
                    const sanitizeDisplayName = (text: string) => {
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
                    
                    const fromDisplayName = sanitizeDisplayName(fromInfo.displayName) || 'User';
                    const toDisplayName = sanitizeDisplayName(toInfo.displayName) || 'User';

                    let currentNodeId = from.id;
                    let currentDisplayName = fromDisplayName;

                    // Add category approver if selected
                    if (categoryApprover) {
                        const workflowCategoryNodeId = `catApprover_${i}_${Math.random().toString(36).slice(2, 8)}`;
                        const categorySubgraphId = `categoryApprover_${i}`;
                        
                        // Get category approver info for this specific workflow
                        const categoryInfo = getUserInfo(categoryApprover);
                        const categoryDisplayName = sanitizeDisplayName(categoryInfo.displayName) || 'User';
                        const categoryClassName = isCategoryApproverSubmitter ? 'skipped' : 'rounded';
                        const categorySkippedText = isCategoryApproverSubmitter ? ' (skipped)' : '';
                        
                        chart += `\nsubgraph ${categorySubgraphId} ["Category Approver"]\n    ${workflowCategoryNodeId}("${categoryDisplayName}${categorySkippedText}"):::${categoryClassName}\nend`;

                        // Create connection from current node to category approver
                        chart += `\n${currentNodeId}("${currentDisplayName}"):::rounded -->|"submits to"| ${workflowCategoryNodeId}`;
                        
                        // Update current node for next connection
                        currentNodeId = workflowCategoryNodeId;
                        currentDisplayName = `${categoryDisplayName}${categorySkippedText}`;
                    }

                    // Add tag approver if selected (excluding if same as category approver)
                    if (tagApprover && !isSamePersonForBoth) {
                        const workflowTagNodeId = `tagApprover_${i}_${Math.random().toString(36).slice(2, 8)}`;
                        const tagSubgraphId = `tagApprover_${i}`;
                        
                        // Get tag approver info for this specific workflow
                        const tagInfo = getUserInfo(tagApprover);
                        const tagDisplayName = sanitizeDisplayName(tagInfo.displayName) || 'User';
                        const tagClassName = (isTagApproverSubmitter || isSamePersonForBoth) ? 'skipped' : 'rounded';
                        const tagSkippedText = (isTagApproverSubmitter || isSamePersonForBoth) ? ' (skipped)' : '';
                        
                        chart += `\nsubgraph ${tagSubgraphId} ["Tag Approver"]\n    ${workflowTagNodeId}("${tagDisplayName}${tagSkippedText}"):::${tagClassName}\nend`;

                        // Create connection from current node to tag approver
                        const connectionType = categoryApprover ? "forwards to" : "submits to";
                        chart += `\n${currentNodeId} -->|"${connectionType}"| ${workflowTagNodeId}`;
                        
                        // Update current node for next connection
                        currentNodeId = workflowTagNodeId;
                        currentDisplayName = `${tagDisplayName}${tagSkippedText}`;
                    }

                    // Create final connection to next approver (if we added any intermediate approvers)
                    if (categoryApprover || (tagApprover && !isSamePersonForBoth)) {
                        const finalConnectionType = "forwards to";
                        chart += `\n${currentNodeId} -->|"${finalConnectionType}"| ${to?.id}("${toDisplayName}"):::rounded`;
                        continue; // Skip the normal processing for this connection
                    }
                }

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
    }, [policy?.employeeList, personalDetails, session?.accountID, selectedCategory, selectedTag, policy?.rules?.approvalRules, policyTags]);

    // Create category options for dropdown
    const categoryOptions = useMemo(() => {
        const options = [{
            text: '(None)',
            keyForList: '',
            isSelected: selectedCategory === '',
        }];

        if (policyCategories) {
            Object.keys(policyCategories).forEach(categoryName => {
                if (policyCategories[categoryName].enabled) {
                    options.push({
                        text: categoryName,
                        keyForList: categoryName,
                        isSelected: selectedCategory === categoryName,
                    });
                }
            });
        }

        return options;
    }, [policyCategories, selectedCategory, translate]);

    const onSelectCategory = (option: {keyForList: string}) => {
        setSelectedCategory(option.keyForList);
        setIsCategoryModalVisible(false);
    };

    const selectedCategoryText = selectedCategory || '(None)';

    // Create tag options for dropdown
    const tagOptions = useMemo(() => {
        const options = [{
            text: '(None)',
            keyForList: '',
            isSelected: selectedTag === '',
        }];

        if (policyTags) {
            const tagLists = PolicyUtils.getTagLists(policyTags);
            tagLists.forEach(tagList => {
                Object.values(tagList.tags ?? {}).forEach(tag => {
                    if (tag.enabled) {
                        options.push({
                            text: tag.name,
                            keyForList: tag.name,
                            isSelected: selectedTag === tag.name,
                        });
                    }
                });
            });
        }

        return options;
    }, [policyTags, selectedTag, translate]);

    const onSelectTag = (option: {keyForList: string}) => {
        setSelectedTag(option.keyForList);
        setIsTagModalVisible(false);
    };

    const selectedTagText = selectedTag || '(None)';

    return (
        <ScreenWrapper testID="ApprovalChart">
            <HeaderWithBackButton
                title="Workflows"
                onBackButtonPress={goBack}
            />

            <View style={[styles.ph5, styles.pv3, styles.gap2]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={selectedCategoryText}
                    description="Category"
                    onPress={() => setIsCategoryModalVisible(true)}
                />
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={selectedTagText}
                    description="Tag"
                    onPress={() => setIsTagModalVisible(true)}
                />
            </View>

            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                {Platform.OS === 'web' && <ApprovalChartWeb chart={chart} />}
                {Platform.OS !== 'web' && <ApprovalChartMobile chart={chart} />}
            </View>

            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                isVisible={isCategoryModalVisible}
                onClose={() => setIsCategoryModalVisible(false)}
                onModalHide={() => setIsCategoryModalVisible(false)}
                hideModalContentWhileAnimating
                useNativeDriver
            >
                <HeaderWithBackButton
                    title="Category"
                    onBackButtonPress={() => setIsCategoryModalVisible(false)}
                />
                <SelectionList
                    sections={[{data: categoryOptions}]}
                    onSelectRow={onSelectCategory}
                    ListItem={RadioListItem}
                    shouldSingleExecuteRowSelect
                    shouldUpdateFocusedIndex
                    initiallyFocusedOptionKey={selectedCategory}
                />
            </Modal>

            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                isVisible={isTagModalVisible}
                onClose={() => setIsTagModalVisible(false)}
                onModalHide={() => setIsTagModalVisible(false)}
                hideModalContentWhileAnimating
                useNativeDriver
            >
                <HeaderWithBackButton
                    title="Tag"
                    onBackButtonPress={() => setIsTagModalVisible(false)}
                />
                <SelectionList
                    sections={[{data: tagOptions}]}
                    onSelectRow={onSelectTag}
                    ListItem={RadioListItem}
                    shouldSingleExecuteRowSelect
                    shouldUpdateFocusedIndex
                    initiallyFocusedOptionKey={selectedTag}
                />
            </Modal>
        </ScreenWrapper>
    );
}

interface ChartViewProps {
    chart: string;
}

function ApprovalChartWeb({chart}: ChartViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const workflowRef = useRef<ReactZoomPanPinchContentRef>(null);

    useEffect(() => {
        const renderChart = async () => {
            if (containerRef.current) {
                // Clear previous content
                containerRef.current.innerHTML = '';
                
                // Reinitialize mermaid with fresh config
                mermaid.initialize({
                    startOnLoad: false,
                    themeVariables: {
                        mainBkg: colors.green,
                        textColor: colors.white,
                        edgeLabelBackground: colors.green700,
                        lineColor: colors.green700,
                        fontWeight: 'bold',
                        // Subgraph styling
                        clusterBkg: 'transparent',
                        clusterBorder: '#666666',
                        altBackground: 'transparent',
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

                try {
                    // Generate unique ID for this render
                    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const {svg} = await mermaid.render(id, chart);
                    containerRef.current.innerHTML = svg;
                } catch (error) {
                    console.error('Mermaid rendering error:', error);
                    // Fallback to old method if render fails
                    containerRef.current.innerHTML = chart;
                    mermaid.run({nodes: [containerRef.current]});
                }
            }
        };

        renderChart();
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
        <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden'}}>
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
                            minWidth: '1200px',
                            minHeight: '800px',
                            backgroundImage: 'radial-gradient(rgba(204, 204, 204, 0.3) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '40px',
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
                    clusterBkg: 'transparent',
                    clusterBorder: '#666666',
                    altBackground: 'transparent'
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

ApprovalChart.displayName = 'ApprovalChart';

export default ApprovalChart;
