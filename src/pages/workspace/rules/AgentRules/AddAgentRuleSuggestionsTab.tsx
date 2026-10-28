/**
 * Suggestions tab for the add-agent-rule flow. Lists backend-served ready-made rules as
 * selectable cards; Next prefills the Edit tab prompt via the parent callback.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSuggestedAgentRules from '@hooks/useSuggestedAgentRules';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {groupSuggestedAgentRulesByCategory} from '@libs/AgentRulesUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';

import React, {useState} from 'react';
import {View} from 'react-native';

type AddAgentRuleSuggestionsTabProps = {
    /** Called with the chosen suggestion when the user presses Next */
    onSelectSuggestion: (suggestion: SuggestedAgentRule) => void;
};

function AddAgentRuleSuggestionsTab({onSelectSuggestion}: AddAgentRuleSuggestionsTabProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isKeyboardActive} = useKeyboardState();
    const shouldMoveFooterToScrollView = isInLandscapeMode && isKeyboardActive;

    const {data, isLoading} = useSuggestedAgentRules();
    const illustrations = useMemoizedLazyIllustrations(['Lightbulb']);
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);
    const [searchValue, setSearchValue] = useState('');
    const [selectedSuggestionID, setSelectedSuggestionID] = useState<string | undefined>();
    const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);

    const updateSearchValue = (value: string) => {
        setSearchValue(value);

        // Expand all sections when the search changes. A collapsed section would otherwise hide the rules that match.
        setCollapsedCategories([]);
    };

    const toggleCategory = (category: string) => {
        setCollapsedCategories((currentCategories) =>
            currentCategories.includes(category) ? currentCategories.filter((collapsedCategory) => collapsedCategory !== category) : [...currentCategories, category],
        );
    };

    const trimmedSearch = searchValue.trim().toLowerCase();
    const filteredSuggestions = !trimmedSearch
        ? data
        : data.filter(
              (suggestion) =>
                  suggestion.title?.toLowerCase().includes(trimmedSearch) ||
                  suggestion.prompt?.toLowerCase().includes(trimmedSearch) ||
                  !!suggestion.category?.toLowerCase().includes(trimmedSearch),
          );

    const selectedSuggestion = filteredSuggestions.find((suggestion) => suggestion.id === selectedSuggestionID);
    const hasNoSuggestions = data.length === 0;
    const shouldShowLoadingIndicator = isLoading && hasNoSuggestions && !isOffline;
    const shouldShowEmptyState = hasNoSuggestions && (!isLoading || isOffline);

    const goToEditWithSelection = () => {
        if (!selectedSuggestion) {
            return;
        }
        onSelectSuggestion(selectedSuggestion);
    };

    if (shouldShowLoadingIndicator) {
        return (
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
            </View>
        );
    }

    if (shouldShowEmptyState) {
        return (
            <View style={styles.flex1}>
                <BlockingView
                    icon={illustrations.Lightbulb}
                    title={translate('workspace.rules.agentRules.emptySuggestionsTitle')}
                    subtitle={isOffline ? translate('common.youAppearToBeOffline') : translate('workspace.rules.agentRules.emptySuggestionsSubtitle')}
                    subtitleStyle={[styles.textSupporting, styles.textNormal]}
                    containerStyle={styles.pb10}
                />
            </View>
        );
    }

    const hasNoFilteredSuggestions = filteredSuggestions.length === 0;
    const suggestionSections = groupSuggestedAgentRulesByCategory(filteredSuggestions, localeCompare);

    const button = (
        <Button
            variant="success"
            size={CONST.BUTTON_SIZE.LARGE}
            onPress={goToEditWithSelection}
            isDisabled={!selectedSuggestion}
        >
            <Button.Text>{translate('common.next')}</Button.Text>
        </Button>
    );

    return (
        <View style={styles.flex1}>
            <View style={[styles.ph5, styles.pb3, styles.pt1]}>
                <TextInput
                    label={translate('workspace.rules.agentRules.findSuggestion')}
                    accessibilityLabel={translate('workspace.rules.agentRules.findSuggestion')}
                    value={searchValue}
                    onChangeText={updateSearchValue}
                    shouldHideClearButton={false}
                    autoGrowHeight={false}
                    role={CONST.ROLE.SEARCHBOX}
                />
            </View>
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={[styles.pb5, styles.gap3]}
                keyboardShouldPersistTaps="handled"
            >
                {hasNoFilteredSuggestions ? (
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{translate('common.noResultsFound')}</Text>
                    </View>
                ) : (
                    suggestionSections.map((section) => {
                        const isCollapsed = collapsedCategories.includes(section.category);
                        return (
                            <View
                                key={section.category}
                                style={styles.gap2}
                            >
                                {!!section.category && (
                                    <PressableWithFeedback
                                        onPress={() => toggleCategory(section.category)}
                                        style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pv2]}
                                        role={CONST.ROLE.BUTTON}
                                        accessibilityLabel={section.category}
                                        accessibilityState={{expanded: !isCollapsed}}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SUGGESTED_AGENT_RULE_CATEGORY}
                                        hoverDimmingValue={1}
                                        pressDimmingValue={0.2}
                                    >
                                        <Text
                                            role={CONST.ROLE.HEADING}
                                            style={[styles.flex1, styles.textLabelSupporting]}
                                        >
                                            {section.category}
                                        </Text>
                                        <Icon
                                            src={isCollapsed ? icons.DownArrow : icons.UpArrow}
                                            fill={theme.icon}
                                            width={variables.iconSizeSmall}
                                            height={variables.iconSizeSmall}
                                        />
                                    </PressableWithFeedback>
                                )}
                                {!isCollapsed &&
                                    section.suggestions.map((suggestion) => {
                                        const isSelected = suggestion.id === selectedSuggestionID;
                                        return (
                                            <PressableWithFeedback
                                                key={suggestion.id}
                                                accessibilityLabel={`${suggestion.title}, ${suggestion.prompt}`}
                                                accessibilityRole={CONST.ROLE.BUTTON}
                                                accessibilityState={{selected: isSelected}}
                                                onPress={() => setSelectedSuggestionID(suggestion.id)}
                                                wrapperStyle={[styles.mh5]}
                                                style={[styles.gap1, styles.ph5, styles.pv5, styles.highlightBG, styles.borderRadiusComponentNormal, isSelected && styles.activeComponentBG]}
                                                hoverStyle={!isSelected ? styles.hoveredComponentBG : undefined}
                                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SUGGESTED_AGENT_RULE}
                                            >
                                                <Text style={[styles.textStrong, styles.lh20]}>{suggestion.title}</Text>
                                                <Text style={[styles.textSupporting, styles.lh20]}>{suggestion.prompt}</Text>
                                            </PressableWithFeedback>
                                        );
                                    })}
                            </View>
                        );
                    })
                )}

                {shouldMoveFooterToScrollView && button}
            </ScrollView>

            {!shouldMoveFooterToScrollView && <FixedFooter style={styles.pt5}>{button}</FixedFooter>}
        </View>
    );
}

AddAgentRuleSuggestionsTab.displayName = 'AddAgentRuleSuggestionsTab';

export default AddAgentRuleSuggestionsTab;
