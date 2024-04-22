import React, {useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTag, PolicyTagList, PolicyTags, RecentlyUsedTags} from '@src/types/onyx';

type SelectedTagOption = {
    name: string;
    enabled: boolean;
    accountID: number | undefined;
};

type TagPickerOnyxProps = {
    /** Collection of tag list on a policy */
    policyTags: OnyxEntry<PolicyTagList>;

    /** List of recently used tags */
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
};

type TagPickerProps = TagPickerOnyxProps & {
    /** The policyID we are getting tags for */
    // It's used in withOnyx HOC.
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string;

    /** The selected tag of the expense */
    selectedTag: string;

    /** The name of tag list we are getting tags for */
    tagListName: string;

    /** Callback to submit the selected tag */
    onSubmit: (selectedTag: Partial<ReportUtils.OptionData>) => void;

    /** Should show the selected option that is disabled? */
    shouldShowDisabledAndSelectedOption?: boolean;

    /** Indicates which tag list index was selected */
    tagListIndex: number;
};

function TagPicker({selectedTag, tagListName, policyTags, tagListIndex, policyRecentlyUsedTags, shouldShowDisabledAndSelectedOption = false, onSubmit}: TagPickerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyRecentlyUsedTagsList = useMemo(() => policyRecentlyUsedTags?.[tagListName] ?? [], [policyRecentlyUsedTags, tagListName]);
    const policyTagList = PolicyUtils.getTagList(policyTags, tagListIndex);
    const policyTagsCount = PolicyUtils.getCountOfEnabledTagsOfList(policyTagList.tags);
    const isTagsCountBelowThreshold = policyTagsCount < CONST.TAG_LIST_THRESHOLD;

    const shouldShowTextInput = !isTagsCountBelowThreshold;

    const selectedOptions: SelectedTagOption[] = useMemo(() => {
        if (!selectedTag) {
            return [];
        }

        return [
            {
                name: selectedTag,
                enabled: true,
                accountID: undefined,
            },
        ];
    }, [selectedTag]);

    const enabledTags: PolicyTags | Array<PolicyTag | SelectedTagOption> = useMemo(() => {
        if (!shouldShowDisabledAndSelectedOption) {
            return policyTagList.tags;
        }
        const selectedNames = selectedOptions.map((s) => s.name);

        return [...selectedOptions, ...Object.values(policyTagList.tags).filter((policyTag) => policyTag.enabled && !selectedNames.includes(policyTag.name))];
    }, [selectedOptions, policyTagList, shouldShowDisabledAndSelectedOption]);

    const sections = useMemo(
        () => OptionsListUtils.getFilteredOptions([], [], [], searchValue, selectedOptions, [], false, false, false, {}, [], true, enabledTags, policyRecentlyUsedTagsList, false).tagOptions,
        [searchValue, enabledTags, selectedOptions, policyRecentlyUsedTagsList],
    );

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList((sections?.[0]?.data?.length ?? 0) > 0, searchValue);

    const selectedOptionKey = sections[0]?.data?.filter((policyTag) => policyTag.searchText === selectedTag)?.[0]?.keyForList;

    return (
        <SelectionList
            ListItem={RadioListItem}
            sectionTitleStyles={styles.mt5}
            sections={sections}
            textInputValue={searchValue}
            headerMessage={headerMessage}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            isRowMultilineSupported
            initiallyFocusedOptionKey={selectedOptionKey}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
        />
    );
}

TagPicker.displayName = 'TagPicker';

export default withOnyx<TagPickerProps, TagPickerOnyxProps>({
    policyTags: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
    },
    policyRecentlyUsedTags: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`,
    },
})(TagPicker);

export type {SelectedTagOption};
