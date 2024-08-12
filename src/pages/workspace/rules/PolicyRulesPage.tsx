import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Illustrations from '@src/components/Icon/Illustrations';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import ExpenseReportRulesSection from './ExpenseReportRulesSection';

type PolicyRulesPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.RULES>;

function PolicyRulesPage({route}: PolicyRulesPageProps) {
    const {translate} = useLocalize();
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    console.log('POLICY RULES PAGE');
    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <WorkspacePageWithSections
                testID={PolicyRulesPage.displayName}
                shouldUseScrollView
                headerText={translate('workspace.common.rules')}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_INVOICES}
                shouldShowOfflineIndicatorInWideScreen
                shouldSkipVBBACall={false}
                route={route}
                icon={Illustrations.Rules}
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        isCentralPane
                        title={translate('workspace.rules.individualExpenseRules.title')}
                        subtitle={translate('workspace.rules.individualExpenseRules.subtitle')}
                        titleStyles={styles.accountSettingsSectionTitle}
                        subtitleMuted
                    />
                    <ExpenseReportRulesSection policyID={policyID} />
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

PolicyRulesPage.displayName = 'PolicyRulesPage';

export default PolicyRulesPage;
