import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import tokenizedSearch from '@libs/tokenizedSearch';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddAIRuleForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import IconAsset from '@src/types/utils/IconAsset';

type AddAIRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_AI_NEW>;

type TabKey = ValueOf<typeof CONST.AI_RULES.TAB_SELECTOR>;
type Suggestion = {
    prompt: string;
    icon: IconAsset;
};

function AddAIRulePage({route}: AddAIRulePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const policyID = route.params.policyID;
    const [activeTabKey, setActiveTabKey] = useState<TabKey>(CONST.AI_RULES.TAB_SELECTOR.SUGGESTED);
    const icons = useMemoizedLazyExpensifyIcons(['Feed', 'Pencil']);
    const tabs = [
        {
            key: CONST.AI_RULES.TAB_SELECTOR.SUGGESTED,
            title: translate('common.suggestted'),
            icon: icons.Feed,
        },
        {
            key: CONST.AI_RULES.TAB_SELECTOR.EDIT,
            title: translate('common.edit'),
            icon: icons.Pencil,
        },
    ];
    const changeTab = (key: string) => setActiveTabKey(key as TabKey);
    const [prompt, setPrompt] = useState('');

    const suggestions: Suggestion[] = [
        {prompt: 'Approve 1bla bla', icon: icons.Feed},
        {prompt: 'Approve b1la bla', icon: icons.Feed},
        {prompt: 'Approve1 bla bla', icon: icons.Feed},
        {prompt: 'Appro4ve bl1a bla', icon: icons.Feed},
        {prompt: 'Approave b4la bla', icon: icons.Feed},
        {prompt: 'Approave aaaaa', icon: icons.Feed},
        {prompt: 'Approafzve b4la bla', icon: icons.Feed},
        {prompt: 'Approvfeze b4la bla', icon: icons.Feed},
        {prompt: 'Approve b4fela bla', icon: icons.Feed},
        {prompt: 'Approve azea bla', icon: icons.Feed},
        {prompt: 'Approve aeaz', icon: icons.Feed},
        {prompt: 'Approve ezaeazeze', icon: icons.Feed},
        {prompt: 'Approve gg', icon: icons.Feed},
    ];
    const filterSuggestions = (suggestion: Suggestion, searchInput: string) => tokenizedSearch([suggestion], searchInput, () => [suggestion.prompt]).length > 0;
    const [suggestionSearchInput, setSuggestionSearchInput, filteredSuggestions] = useSearchResults(suggestions, filterSuggestions);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_AI_RULE_FORM>): Errors => {
        const errors: Errors = {};
        if (!values[INPUT_IDS.PROMPT].trim()) {
            errors[INPUT_IDS.PROMPT] = translate('common.error.fieldRequired');
        }
        return errors;
    };
    const saveRule = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_AI_RULE_FORM>): void => {
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            shouldBeBlocked={!isCustomAgentEnabled}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="AddAIRulePage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate('workspace.rules.aiRules.addRuleTitle')} />
                <TabSelectorBase
                    equalWidth
                    tabs={tabs}
                    activeTabKey={activeTabKey}
                    onTabPress={changeTab}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.ADD_AI_RULE_FORM}
                    validate={validate}
                    onSubmit={saveRule}
                    submitButtonText={translate('common.save')}
                    style={[styles.flex1, styles.ph5]}
                    shouldUseScrollView={false}
                    submitFlexEnabled={false}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    shouldValidateOnChange
                    shouldValidateOnBlur
                    keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
                >
                    <View style={styles.flex1}>
                        {activeTabKey === CONST.AI_RULES.TAB_SELECTOR.SUGGESTED && (
                            <>
                                <SearchBar
                                    label={translate('workspace.rules.aiRules.findRule')}
                                    inputValue={suggestionSearchInput}
                                    onChangeText={setSuggestionSearchInput}
                                    style={[styles.mh0, styles.mv4]}
                                    shouldShowEmptyState={filteredSuggestions.length === 0}
                                    emptyStateContainerStyle={styles.ph0}
                                />
                                <ScrollView contentContainerStyle={styles.gap2}>
                                    {filteredSuggestions.map((suggestion) => (
                                        <MenuItemWithTopDescription
                                            key={suggestion.prompt}
                                            title={suggestion.prompt}
                                            wrapperStyle={[styles.borderRadiusComponentNormal, styles.highlightBG, styles.ph4, styles.pv4]}
                                            onPress={() => {
                                                setPrompt(suggestion.prompt);
                                                setActiveTabKey(CONST.AI_RULES.TAB_SELECTOR.EDIT);
                                            }}
                                        />
                                    ))}
                                </ScrollView>
                            </>
                        )}
                        {activeTabKey === CONST.AI_RULES.TAB_SELECTOR.EDIT && (
                            <>
                                <View style={[styles.gap2, styles.mv4]}>
                                    <Text style={[styles.textHeadlineH2]}>{translate('workspace.rules.aiRules.describeRuleTitle')}</Text>
                                    <Text style={[styles.textSupporting]}>{translate('workspace.rules.aiRules.describeRuleSubtitle')}</Text>
                                </View>
                                <InputWrapper
                                    InputComponent={TextInput}
                                    inputID={INPUT_IDS.PROMPT}
                                    label={translate('workspace.rules.aiRules.describeRuleTitle')}
                                    accessibilityLabel={translate('workspace.rules.aiRules.describeRuleTitle')}
                                    role={CONST.ROLE.PRESENTATION}
                                    value={prompt}
                                    onChangeText={setPrompt}
                                    multiline
                                    containerStyles={[styles.flex1]}
                                    touchableInputWrapperStyle={[styles.flex1]}
                                    textInputContainerStyles={[styles.flex1]}
                                    inputStyle={[styles.flex1, styles.textAlignVerticalTop]}
                                />
                            </>
                        )}
                    </View>
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default AddAIRulePage;
