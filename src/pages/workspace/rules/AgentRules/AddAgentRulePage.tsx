import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {BotAvatarBlue} from '@components/Icon/DefaultBotAvatars';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import TabSelectorContextProvider from '@components/TabSelector/TabSelectorContext';
import type {TabSelectorBaseItem} from '@components/TabSelector/types';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftValues, setDraftValues} from '@libs/actions/FormActions';
import Tab from '@libs/actions/Tab';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import {addPolicyAgentRule, getAgentRuleSuggestions} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAgentRuleForm';
import type SuggestedAgentRule from '@src/types/onyx/SuggestedAgentRule';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {ValueOf} from 'type-fest';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import type {AddAgentRuleFormID} from './AddAgentRuleWriteTab';

import AddAgentRuleSuggestionsTab from './AddAgentRuleSuggestionsTab';
import AddAgentRuleWriteTab from './AddAgentRuleWriteTab';

type AddAgentRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AGENT_NEW>;
type AgentRuleTab = ValueOf<typeof CONST.TAB.AGENT_RULE>;

const AGENT_RULE_TAB_VALUES = new Set<string>(Object.values(CONST.TAB.AGENT_RULE));

function isAgentRuleTab(key: string): key is AgentRuleTab {
    return AGENT_RULE_TAB_VALUES.has(key);
}

function AddAgentRulePage({
    route: {
        params: {policyID},
    },
}: AddAgentRulePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const policy = usePolicy(policyID);
    const linkPressedRef = useRef(false);
    const {showConfirmModal, closeModal} = useConfirmModal();
    const [lastSelectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.AGENT_RULE_TAB_TYPE}`);
    const activeTab: AgentRuleTab = lastSelectedTab && isAgentRuleTab(lastSelectedTab) ? lastSelectedTab : CONST.TAB.AGENT_RULE.SUGGESTIONS;
    const tabIcons = useMemoizedLazyExpensifyIcons(['Feed', 'Pencil']);

    useEffect(() => {
        Tab.setSelectedTab(CONST.TAB.AGENT_RULE_TAB_TYPE, CONST.TAB.AGENT_RULE.SUGGESTIONS);
        if (!isOffline) {
            getAgentRuleSuggestions(policyID);
        }
        return () => clearDraftValues(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM);
    }, [policyID, isOffline]);

    const tabs: TabSelectorBaseItem[] = [
        {
            key: CONST.TAB.AGENT_RULE.SUGGESTIONS,
            title: translate('workspace.rules.agentRules.suggestionsTab'),
            icon: tabIcons.Feed,
        },
        {
            key: CONST.TAB.AGENT_RULE.WRITE,
            title: translate('workspace.rules.agentRules.writeTab'),
            icon: tabIcons.Pencil,
        },
    ];

    const selectSuggestion = (suggestion: SuggestedAgentRule) => {
        setDraftValues(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM, {[INPUT_IDS.PROMPT]: suggestion.prompt});
        Tab.setSelectedTab(CONST.TAB.AGENT_RULE_TAB_TYPE, CONST.TAB.AGENT_RULE.WRITE);
    };

    const saveRule = (values: FormOnyxValues<AddAgentRuleFormID>): void => {
        // When the workspace has no agent rules yet, the backend creates the "RuleBot" agent and adds it as
        // an admin. Surface a one-time modal explaining this side effect before navigating back.
        const isFirstRule = isEmptyObject(policy?.rules?.agentRules);
        addPolicyAgentRule(policyID, rand64(), values[INPUT_IDS.PROMPT]);
        clearDraftValues(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM);
        if (!isFirstRule) {
            Navigation.goBack();
            return;
        }
        linkPressedRef.current = false;
        const handleAgentsLinkPress = () => {
            linkPressedRef.current = true;
            closeModal();
        };
        Navigation.dismissModal({
            afterTransition: () => {
                showConfirmModal({
                    title: translate('workspace.rules.agentRules.agentCreatedTitle'),
                    titleStyles: styles.textHeadlineH1,
                    prompt: (
                        <View style={[styles.renderHTML, styles.w100, styles.flexRow]}>
                            <RenderHTML
                                html={translate('workspace.rules.agentRules.agentCreatedDescription', ROUTES.SETTINGS_AGENTS)}
                                onLinkPress={handleAgentsLinkPress}
                            />
                        </View>
                    ),
                    confirmText: translate('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                    shouldUseSuccessStyleForConfirm: true,
                    iconSource: BotAvatarBlue,
                    iconFill: false,
                    shouldCenterIcon: true,
                    iconWidth: variables.iconSizeUltraLarge,
                    iconHeight: variables.iconSizeUltraLarge,
                    iconAdditionalStyles: {borderRadius: variables.iconSizeUltraLarge / 2, overflow: 'hidden', marginTop: 12},
                }).then(() => {
                    if (!linkPressedRef.current) {
                        return;
                    }
                    Navigation.navigate(ROUTES.SETTINGS_AGENTS);
                });
            },
        });
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            shouldBeBlocked={!isCustomAgentEnabled}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="AddAgentRulePage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('workspace.rules.agentRules.newRuleTitle')} />
                <View style={[styles.flexShrink0, styles.w100]}>
                    <TabSelectorContextProvider activeTabKey={activeTab}>
                        <TabSelectorBase
                            tabs={tabs}
                            activeTabKey={activeTab}
                            onTabPress={(key) => {
                                if (!isAgentRuleTab(key)) {
                                    return;
                                }
                                Tab.setSelectedTab(CONST.TAB.AGENT_RULE_TAB_TYPE, key);
                            }}
                            equalWidth
                        />
                    </TabSelectorContextProvider>
                </View>
                <View style={styles.flex1}>
                    {activeTab === CONST.TAB.AGENT_RULE.SUGGESTIONS ? <AddAgentRuleSuggestionsTab onSelectSuggestion={selectSuggestion} /> : <AddAgentRuleWriteTab onSave={saveRule} />}
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default AddAgentRulePage;
