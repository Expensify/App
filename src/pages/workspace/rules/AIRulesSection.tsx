import React, {useEffect} from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SearchBar from '@components/SearchBar';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import tokenizedSearch from '@libs/tokenizedSearch';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {AIRule} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AIRulesSectionProps = {
    policyID: string;
};

function AIRulesSection({policyID}: AIRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {isBetaEnabled} = usePermissions();
    const aiRules = policy?.rules?.aiRules;
    const hasRules = !isEmptyObject(aiRules);
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);

    const sortedRules = Object.entries(aiRules ?? {})
        .filter(([, rule]) => !!rule)
        .map(([ruleID, rule]) => ({...rule, ruleID}))
        .sort((a, b) => {
            if (a.created && b.created) {
                return a.created < b.created ? 1 : -1;
            }
            return 0;
        });

    // Exclude pending-delete rules when online because OfflineWithFeedback hides them visually.
    // When offline, keep them so OfflineWithFeedback can show strikethrough styling.
    const visibleRules = sortedRules.filter((rule) => isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const filterRule = (rule: AIRule, searchInput: string) => tokenizedSearch([rule], searchInput, () => [rule.prompt]).length > 0;
    const [ruleSearchInput, setRuleSearchInput, filteredRules] = useSearchResults(visibleRules, filterRule);

    useEffect(() => {
        if (visibleRules.length > CONST.SEARCH_BAR_THRESHOLD) {
            return;
        }
        setRuleSearchInput('');
    }, [visibleRules.length, setRuleSearchInput]);

    const renderTitle = () => (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, {color: theme.text}]}>{translate('workspace.rules.aiRules.title')}</Text>
            <Badge
                text={translate('common.newFeature')}
                isCondensed
                success
            />
        </View>
    );

    if (!isCustomAgentEnabled) {
        return null;
    }

    return (
        <Section
            isCentralPane
            renderTitle={renderTitle}
            subtitle={translate('workspace.rules.aiRules.subtitle')}
            subtitleMuted
            childrenStyles={[styles.gap3]}
        >
            {hasRules && (
                <View style={[styles.mt3, styles.gap2]}>
                    {visibleRules.length > CONST.SEARCH_BAR_THRESHOLD && (
                        <SearchBar
                            label={translate('workspace.rules.aiRules.findRule')}
                            inputValue={ruleSearchInput}
                            onChangeText={setRuleSearchInput}
                            style={[styles.mt3, styles.mh0]}
                            shouldShowEmptyState={filteredRules.length === 0}
                            emptyStateContainerStyle={styles.ph0}
                        />
                    )}
                    {filteredRules.map((rule) => {
                        return (
                            <View key={rule.ruleID}>
                                <OfflineWithFeedback
                                    pendingAction={rule.pendingAction}
                                    errors={rule.errors}
                                >
                                    <MenuItemWithTopDescription
                                        title={rule.prompt}
                                        wrapperStyle={[styles.borderedContentCard, styles.ph4, styles.pv4]}
                                        shouldShowRightIcon
                                        onPress={() => Navigation.navigate(ROUTES.RULES_AI_EDIT.getRoute(policyID, rule.ruleID))}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.AI_RULE_ITEM}
                                        disabled={rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                                    />
                                </OfflineWithFeedback>
                            </View>
                        );
                    })}
                </View>
            )}
            <MenuItem
                title={translate('workspace.rules.aiRules.addRule')}
                titleStyle={styles.textStrong}
                icon={expensifyIcons.Plus}
                iconHeight={20}
                iconWidth={20}
                style={[styles.sectionMenuItemTopDescription, !hasRules && styles.mt6, styles.mbn3]}
                onPress={() => Navigation.navigate(ROUTES.RULES_AI_NEW.getRoute(policyID))}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.ADD_AI_RULE}
            />
        </Section>
    );
}

export default AIRulesSection;
