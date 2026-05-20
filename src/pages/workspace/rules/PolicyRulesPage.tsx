import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {openPolicyRulesPage} from '@libs/actions/Policy/Rules';
import {dismissProductTraining} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DismissedProductTraining from '@src/types/onyx/DismissedProductTraining';
import IndividualExpenseRulesSection from './IndividualExpenseRulesSection';
import MerchantRulesSection from './MerchantRulesSection';
import SpendRulesSection from './SpendRules/SpendRulesSection';

type PolicyRulesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RULES>;

const agentsRulesBannerDismissedSelector = (value: OnyxEntry<DismissedProductTraining>): boolean => !!value?.[CONST.AGENTS_RULES_BANNER];

function PolicyRulesPage({route}: PolicyRulesPageProps) {
    const {translate} = useLocalize();
    const {policyID} = route.params;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rules');
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['Rules', 'AiBot']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const [isAgentsRulesBannerDismissed = false] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: agentsRulesBannerDismissedSelector});

    const fetchRules = useCallback(() => {
        openPolicyRulesPage(policyID);
    }, [policyID]);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <WorkspacePageWithSections
                testID="PolicyRulesPage"
                shouldUseScrollView
                headerText={translate('workspace.common.rules')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                icon={illustrations.Rules}
                shouldShowNotFoundPage={false}
                shouldShowLoading={false}
                addBottomSafeAreaPadding
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {isCustomAgentBetaEnabled && !isAgentsRulesBannerDismissed && (
                        <View
                            style={[
                                styles.flexRow,
                                styles.alignItemsCenter,
                                styles.gap4,
                                styles.ph5,
                                styles.pv4,
                                styles.borderRadiusComponentLarge,
                                styles.mh5,
                                styles.mb5,
                                styles.agentsPromoBannerBackgroundColor,
                            ]}
                        >
                            <Icon
                                src={illustrations.AiBot}
                                width={variables.iconSizeExtraLarge + 8}
                                height={variables.iconSizeExtraLarge + 8}
                            />
                            <View style={[styles.flex1, styles.gap1]}>
                                <Text style={[styles.textStrong, styles.agentsPromoBannerText]}>{translate('workspace.rules.agentsPromoBanner.title')}</Text>
                                <Text style={[styles.textLabel, styles.agentsPromoBannerText]}>{translate('workspace.rules.agentsPromoBanner.subtitle')}</Text>
                            </View>
                            <Button
                                success
                                small
                                text={translate('workspace.rules.agentsPromoBanner.cta')}
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID))}
                            />
                            <PressableWithoutFeedback
                                onPress={() => dismissProductTraining(CONST.AGENTS_RULES_BANNER, true)}
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('common.dismiss')}
                                sentryLabel="AgentsRulesBanner-Dismiss"
                            >
                                <Icon
                                    src={expensifyIcons.Close}
                                    fill={theme.iconColorfulBackground}
                                />
                            </PressableWithoutFeedback>
                        </View>
                    )}
                    <IndividualExpenseRulesSection policyID={policyID} />
                    <MerchantRulesSection policyID={policyID} />
                    {!!policy?.areExpensifyCardsEnabled && <SpendRulesSection policyID={policyID} />}
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyRulesPage;
