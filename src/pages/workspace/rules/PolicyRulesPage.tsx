import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Illustrations from '@src/components/Icon/Illustrations';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type PolicyRulesPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.RULES>;

function PolicyRulesPage({route}: PolicyRulesPageProps) {
    const {translate} = useLocalize();
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {canUseWorkspaceRules} = usePermissions();

    const handleOnPressCategoriesLink = () => {
        if (policy?.areCategoriesEnabled) {
            Navigation.navigate(ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID));
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };

    const handleOnPressTagsLink = () => {
        if (policy?.areTagsEnabled) {
            Navigation.navigate(ROUTES.WORKSPACE_TAGS.getRoute(policyID));
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <WorkspacePageWithSections
                testID={PolicyRulesPage.displayName}
                shouldUseScrollView
                headerText={translate('workspace.common.rules')}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_RULES}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                icon={Illustrations.Rules}
                shouldShowNotFoundPage={!canUseWorkspaceRules}
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        isCentralPane
                        title={translate('workspace.rules.individualExpenseRules.title')}
                        renderSubtitle={() => (
                            <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.subtitle')}</Text>{' '}
                                <TextLink
                                    style={styles.link}
                                    onPress={handleOnPressCategoriesLink}
                                >
                                    {translate('workspace.common.categories').toLowerCase()}
                                </TextLink>{' '}
                                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('common.and')}</Text>{' '}
                                <TextLink
                                    style={styles.link}
                                    onPress={handleOnPressTagsLink}
                                >
                                    {translate('workspace.common.tags').toLowerCase()}
                                </TextLink>
                                .
                            </Text>
                        )}
                        subtitle={translate('workspace.rules.individualExpenseRules.subtitle')}
                        titleStyles={styles.accountSettingsSectionTitle}
                    />
                    <Section
                        isCentralPane
                        title={translate('workspace.rules.expenseReportRules.title')}
                        subtitle={translate('workspace.rules.expenseReportRules.subtitle')}
                        titleStyles={styles.accountSettingsSectionTitle}
                        subtitleMuted
                    />
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

PolicyRulesPage.displayName = 'PolicyRulesPage';

export default PolicyRulesPage;
