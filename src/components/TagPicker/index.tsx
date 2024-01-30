import {useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTags, RecentlyUsedTags} from '@src/types/onyx';
import OptionsSelector from '@components/OptionsSelector';

type TagPickerOnyxProps = {
    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<PolicyTags>;

    /** List of recently used tags */
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
};

type TagPickerProps = TagPickerOnyxProps & {
    /** The policyID we are getting tags for */
    // It's used in withOnyx HOC.
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string;

    /** The selected tag of the money request */
    selectedTag: string;

    /** The name of tag list we are getting tags for */
    tag: string;

    /** Callback to submit the selected tag */
    onSubmit: () => void;

    /**
     * Safe area insets required for reflecting the portion of the view,
     * that is not covered by navigation bars, tab bars, toolbars, and other ancestor views.
     */
    insets: EdgeInsets;

    /** Should show the selected option that is disabled? */
    shouldShowDisabledAndSelectedOption?: boolean;
};

function TagPicker({selectedTag, tag, policyTags, policyRecentlyUsedTags, shouldShowDisabledAndSelectedOption = false, insets, onSubmit}: TagPickerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyTagList = policyTags?.[tag]?.tags;
    const policyTagsCount = Object.values(policyTagList ?? {}).filter((policyTag) => policyTag.enabled).length;
    const isTagsCountBelowThreshold = policyTagsCount < CONST.TAG_LIST_THRESHOLD;

    const shouldShowTextInput = !isTagsCountBelowThreshold;

    const selectedOptions = useMemo(() => {
        if (!selectedTag) {
            return [];
        }

        return [
            {
                name: selectedTag,
                enabled: true,
                accountID: null,
            },
        ];
    }, [selectedTag]);

    const enabledTags = useMemo(() => {
        if (!shouldShowDisabledAndSelectedOption) {
            return Object.values(policyTagList ?? {});
        }
        const selectedNames = selectedOptions.map((s) => s.name);

        return [...selectedOptions, ...Object.values(policyTagList ?? {}).filter((policyTag) => policyTag.enabled && !selectedNames.includes(policyTag.name))];
    }, [selectedOptions, policyTagList, shouldShowDisabledAndSelectedOption]);

    //
    const sections = useMemo(() => {
        const policyRecentlyUsedTagsList = policyRecentlyUsedTags?.tag ?? [];

        // TODO: Remove this and one line under once OptionsListUtils (https://github.com/Expensify/App/issues/24921) is migrated to TypeScript.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (
            // @ts-expect-error TODO: Remove this once OptionsListUtils (https://github.com/Expensify/App/issues/24921) is migrated to TypeScript.
            OptionsListUtils.getFilteredOptions({}, {}, [], searchValue, selectedOptions, [], false, false, false, {}, [], true, enabledTags, policyRecentlyUsedTagsList, false).tagOptions
        );
    }, [searchValue, enabledTags, selectedOptions, policyRecentlyUsedTags?.tag]);

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList((sections?.[0]?.data?.length ?? 0) > 0, searchValue);

    const selectedOptionKey = sections[0]?.data?.filter((policyTag) => policyTag.searchText === selectedTag)?.[0]?.keyForList;

    return (
        <OptionsSelector
            // @ts-expect-error TODO: Remove this once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TypeScript.
            contentContainerStyles={[{paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}]}
            optionHoveredStyle={styles.hoveredComponentBG}
            sectionHeaderStyle={styles.mt5}
            sections={sections}
            selectedOptions={selectedOptions}
            headerMessage={headerMessage}
            textInputLabel={translate('common.search')}
            boldStyle
            highlightSelectedOptions
            isRowMultilineSupported
            shouldShowTextInput={shouldShowTextInput}
            // Focus the first option when searching
            focusedIndex={0}
            // Focus the selected option on first load
            initiallyFocusedOptionKey={selectedOptionKey}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
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
