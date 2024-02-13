import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {FlatList, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import Text from '@components/Text';
import Section from '@components/Section';
import * as Illustrations from '@components/Icon/Illustrations';
import ToggleSettingOptionRow, { OptionType } from './ToggleSettingsOptionRow';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

type WorkspaceWorkflowsPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

const WorkspaceWorkflowsPage: React.FC<WorkspaceWorkflowsPageProps> = ({route}) => {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    const items: OptionType[] = [
        {
          Illustration: Illustrations.ReceiptEnvelope, // Replace with actual component
          title: translate('workflowsPage.delaySubmissionTitle'),
          subtitle: translate('workflowsPage.delaySubmissionDescription'),
          onToggle: (isEnabled: boolean) => {
            // TODO
          },
          subMenuItems: (
            <MenuItemWithTopDescription
              title={translate('workflowsPage.delaySubmissionTitle')}
              onPress={() => {}}
              shouldShowRightIcon={true}
            />
          ),
        },
        {
            Illustration: Illustrations.Approval,
            title: translate('workflowsPage.addApprovalsTitle'),
            subtitle: translate('workflowsPage.addApprovalsDescription'),
            onToggle: (isEnabled: boolean) => {
              // TODO
            },
            subMenuItems: (
              <MenuItemWithTopDescription
                title={translate('workflowsPage.addApprovalsTitle')}
                onPress={() => {}}
                shouldShowRightIcon={true}
              />
            ),
          },
          {
            Illustration: Illustrations.WalletAlt,
            title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
            subtitle: translate('workflowsPage.makeOrTrackPaymentsDescription'),
            onToggle: (isEnabled: boolean) => {
              // TODO
            },
            subMenuItems: (
              <MenuItemWithTopDescription
                title={translate('workflowsPage.makeOrTrackPaymentsTitle')}
                onPress={() => {}}
                shouldShowRightIcon={true}
              />
            ),
          },
    ];

    const renderItem = ({ item }: { item: OptionType }) => (
        <View style={styles.mt7}>
             <ToggleSettingOptionRow
                Illustration={item.Illustration}
                title={item.title}
                subtitle={item.subtitle}                    
                onToggle={item.onToggle}
                subMenuItems={item.subMenuItems}
            />
        </View>
    );

    return (
        <WorkspacePageWithSections
            shouldUseScrollView
            headerText={translate('workspace.common.workflows')}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_WORKFLOWS}
            shouldShowOfflineIndicatorInWideScreen
        >
            {(_, policyID: string) => (
                <View style={[styles.mt3, styles.textStrong, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section title={translate('workflowsPage.workflowTitle')} titleStyles={styles.textStrong} containerStyles={styles.p8}>
                        <View>
                            <Text style={[styles.mt3, styles.textSupporting]}>{translate('workflowsPage.workflowDescription')}</Text>
                            <FlatList
                                data={items}
                                renderItem={renderItem}
                                keyExtractor={(item: OptionType) => item.title}
                            />                            
                        </View>
                    </Section>
                </View>
            )}
        </WorkspacePageWithSections>
    );
}

WorkspaceWorkflowsPage.displayName = 'WorkspaceWorkflowsPage';

export default WorkspaceWorkflowsPage;
