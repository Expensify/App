import ActivityIndicator from '@components/ActivityIndicator';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLoadPolicyTags from '@hooks/useLoadPolicyTags';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCleanedTagName, getTagLists} from '@libs/PolicyUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyTagLists} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import useMerchantRuleRoute from './useMerchantRuleRoute';
import useRuleConditionSelection from './useRuleConditionSelection';

type AddTagToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_TAG_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_TAG_TO_MATCH>;

type TagListItem = ListItem & {
    value: string;
};

function AddTagToMatchPage({route}: AddTagToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_TAG_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    // Tags are lazy loaded, so a picker that only reads Onyx shows an empty list on an account that has never
    // opened the tags page.
    const {isLoadingPolicyTags} = useLoadPolicyTags(policyID);
    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const [policyTagLists = getEmptyArray<ValueOf<PolicyTagLists>>()] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {selector: getTagLists});

    const {selectedValues: selectedTags, initialSelectedValues: initialSelectedTags, toggleValue: toggleTagValue, toggleAll} = useRuleConditionSelection(form?.tagsToMatch ?? []);

    // The rule matches any one of the tags it carries, so the levels are offered as one flat list rather than a row
    // per level. A name shared by two levels is one option, since the rule stores the name and not the level.
    const tagItems: TagListItem[] = [];
    const seenTagNames = new Set<string>();
    for (const tagList of policyTagLists) {
        for (const tag of Object.values(tagList.tags)) {
            if (seenTagNames.has(tag.name)) {
                continue;
            }
            // A rule keeps a tag it already matches on even once the tag is disabled or on its way out, so it stays
            // removable.
            const isTagMatched = selectedTags.includes(tag.name);
            if ((!tag.enabled || tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) && !isTagMatched) {
                continue;
            }
            seenTagNames.add(tag.name);
            tagItems.push({
                keyForList: tag.name,
                text: getCleanedTagName(tag.name),
                value: tag.name,
                isSelected: isTagMatched,
            });
        }
    }

    // A rule keeps matching on a tag the workspace has since deleted. Listing it is the only way to see what the rule
    // matches on and the only way to take it off, so it is added back rather than left out of the picker.
    for (const tagName of selectedTags) {
        if (seenTagNames.has(tagName)) {
            continue;
        }
        seenTagNames.add(tagName);
        tagItems.push({keyForList: tagName, text: getCleanedTagName(tagName), value: tagName, isSelected: true});
    }

    const filterTag = (item: TagListItem, searchInput: string) => tokenizedSearch([item], searchInput, (tag) => [tag.text ?? '']).length > 0;

    // Pin the initially selected tags to the top of the full sorted list, so they stay at the top while searching.
    const sortedTagItems = moveInitialSelectionToTop(
        [...tagItems].sort((first, second) => localeCompare(first.text ?? '', second.text ?? '')),
        initialSelectedTags,
    );

    const [inputValue, setInputValue, filteredTagItems] = useSearchResults(sortedTagItems, filterTag);

    const toggleTag = (item: TagListItem) => toggleTagValue(item.value);
    const toggleSelectAll = () => toggleAll(filteredTagItems.map((item) => item.value));

    const goBackToRule = () => Navigation.goBack(backToRoute);

    const handleSave = () => {
        updateDraftMerchantRule({tagsToMatch: selectedTags});
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID="AddTagToMatchPage"
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButtonAndTitle
                title={translate('common.tag')}
                onBackButtonPress={goBackToRule}
            />
            {isLoadingPolicyTags ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            ) : (
                <SelectionList
                    canSelectMultiple
                    shouldUpdateFocusedIndex
                    ListItem={MultiSelectListItem}
                    data={filteredTagItems}
                    selectedItems={selectedTags}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    onSelectRow={toggleTag}
                    onSelectionButtonPress={toggleTag}
                    onSelectAll={filteredTagItems.length > 0 ? toggleSelectAll : undefined}
                    textInputOptions={{
                        value: inputValue,
                        label: translate('common.search'),
                        onChangeText: setInputValue,
                    }}
                    style={{
                        listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                        listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
                    }}
                    listEmptyContent={
                        <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                            <BlockingView
                                icon={illustrations.Telescope}
                                iconWidth={variables.emptyListIconWidth}
                                iconHeight={variables.emptyListIconHeight}
                                title={translate('common.noResultsFound')}
                            />
                        </ScrollView>
                    }
                    footerContent={
                        <FormAlertWithSubmitButton
                            buttonText={translate('common.save')}
                            isAlertVisible={false}
                            onSubmit={handleSave}
                            enabledWhenOffline
                            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                        />
                    }
                />
            )}
        </ScreenWrapper>
    );
}

export default AddTagToMatchPage;
