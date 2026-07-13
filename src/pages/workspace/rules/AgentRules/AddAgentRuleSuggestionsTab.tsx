/**
 * Suggestions tab for the add-agent-rule flow. Lists backend-served ready-made rules as
 * selectable cards; Next prefills the Edit tab prompt via the parent callback.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSuggestedAgentRules from '@hooks/useSuggestedAgentRules';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getSuggestedAgentRuleIcon, SUGGESTED_AGENT_RULE_ICON_NAMES} from '@libs/PolicyRulesUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';

import React, {useState} from 'react';
import {View} from 'react-native';

type AddAgentRuleSuggestionsTabProps = {
    /** Called with the chosen suggestion when the user presses Next */
    onSelectSuggestion: (suggestion: SuggestedAgentRule) => void;
};

function AddAgentRuleSuggestionsTab({onSelectSuggestion}: AddAgentRuleSuggestionsTabProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {data, isLoading} = useSuggestedAgentRules();
    const illustrations = useMemoizedLazyIllustrations(['Lightbulb']);
    const icons = useMemoizedLazyExpensifyIcons([...SUGGESTED_AGENT_RULE_ICON_NAMES]);
    const [searchValue, setSearchValue] = useState('');
    const [selectedSuggestionID, setSelectedSuggestionID] = useState<string | undefined>();

    const trimmedSearch = searchValue.trim().toLowerCase();
    const filteredSuggestions = !trimmedSearch
        ? data
        : data.filter((suggestion) => suggestion.title?.toLowerCase().includes(trimmedSearch) || suggestion.prompt?.toLowerCase().includes(trimmedSearch));

    const selectedSuggestion = filteredSuggestions.find((suggestion) => suggestion.id === selectedSuggestionID);
    const hasNoSuggestions = data.length === 0;
    const shouldShowLoadingIndicator = isLoading && hasNoSuggestions;
    const shouldShowEmptyState = !isLoading && hasNoSuggestions;

    const goToConcierge = () => {
        Navigation.navigate(ROUTES.CONCIERGE);
    };

    const goToEditWithSelection = () => {
        if (!selectedSuggestion) {
            return;
        }
        onSelectSuggestion(selectedSuggestion);
    };

    if (shouldShowLoadingIndicator) {
        return (
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    reasonAttributes={{context: 'AddAgentRuleSuggestionsTab'}}
                />
            </View>
        );
    }

    if (shouldShowEmptyState) {
        return (
            <BlockingView
                icon={illustrations.Lightbulb}
                title={translate('workspace.rules.agentRules.emptySuggestionsTitle')}
                subtitle={isOffline ? translate('common.youAppearToBeOffline') : translate('workspace.rules.agentRules.emptySuggestionsSubtitle')}
                containerStyle={styles.flex1}
            />
        );
    }

    return (
        <View style={styles.flex1}>
            <View style={[styles.ph5, styles.pb3, styles.pt1]}>
                <TextInput
                    label={translate('workspace.rules.agentRules.findSuggestion')}
                    accessibilityLabel={translate('workspace.rules.agentRules.findSuggestion')}
                    value={searchValue}
                    onChangeText={setSearchValue}
                    autoGrowHeight={false}
                    role={CONST.ROLE.SEARCHBOX}
                />
            </View>
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={[styles.pb3, styles.gap2]}
                keyboardShouldPersistTaps="handled"
            >
                {filteredSuggestions.length === 0 ? (
                    <BlockingView
                        icon={illustrations.Lightbulb}
                        title={translate('common.noResultsFound')}
                        subtitle={translate('common.noResultsFoundSubtitle')}
                        containerStyle={styles.flex1}
                    />
                ) : (
                    filteredSuggestions.map((suggestion) => {
                        const iconName = getSuggestedAgentRuleIcon(suggestion);
                        const isSelected = suggestion.id === selectedSuggestionID;
                        return (
                            <PressableWithFeedback
                                key={suggestion.id}
                                accessibilityLabel={suggestion.title}
                                accessibilityRole={CONST.ROLE.BUTTON}
                                accessibilityState={{selected: isSelected}}
                                onPress={() => setSelectedSuggestionID(suggestion.id)}
                                wrapperStyle={[styles.mh5]}
                                style={[
                                    styles.flexRow,
                                    styles.alignItemsCenter,
                                    styles.ph5,
                                    styles.pv5,
                                    styles.highlightBG,
                                    styles.borderRadiusComponentNormal,
                                    isSelected && styles.activeComponentBG,
                                ]}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SUGGESTED_AGENT_RULE}
                            >
                                <Icon
                                    src={icons[iconName]}
                                    width={variables.iconSizeLarge}
                                    height={variables.iconSizeLarge}
                                    fill={theme.icon}
                                    additionalStyles={[styles.mr4]}
                                />
                                <Text style={[styles.flex1, styles.textNormal, styles.lh20]}>{suggestion.title}</Text>
                            </PressableWithFeedback>
                        );
                    })
                )}
            </ScrollView>
            <FixedFooter>
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={goToConcierge}
                    style={[styles.mb3]}
                >
                    <Button.Text>{translate('workspace.rules.agentRules.getHelpFromConcierge')}</Button.Text>
                </Button>
                <Button
                    variant="success"
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={goToEditWithSelection}
                    isDisabled={!selectedSuggestion}
                >
                    <Button.Text>{translate('common.next')}</Button.Text>
                </Button>
            </FixedFooter>
        </View>
    );
}

AddAgentRuleSuggestionsTab.displayName = 'AddAgentRuleSuggestionsTab';

export default AddAgentRuleSuggestionsTab;
