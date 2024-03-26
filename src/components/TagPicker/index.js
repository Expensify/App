import lodashGet from 'lodash/get';
import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, propTypes} from './tagPickerPropTypes';

function TagPicker({selectedTag, tag, tagIndex, policyTags, policyRecentlyUsedTags, shouldShowDisabledAndSelectedOption, insets, onSubmit}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyRecentlyUsedTagsList = lodashGet(policyRecentlyUsedTags, tag, []);
    const policyTagList = PolicyUtils.getTagList(policyTags, tagIndex);
    const policyTagsCount = PolicyUtils.getCountOfEnabledTagsOfList(policyTagList.tags);
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
            return policyTagList.tags;
        }
        const selectedNames = _.map(selectedOptions, (s) => s.name);
        const tags = [...selectedOptions, ..._.filter(policyTagList.tags, (policyTag) => policyTag.enabled && !selectedNames.includes(policyTag.name))];
        return tags;
    }, [selectedOptions, policyTagList, shouldShowDisabledAndSelectedOption]);

    const sections = useMemo(
        () => OptionsListUtils.getFilteredOptions({}, {}, [], searchValue, selectedOptions, [], false, false, false, {}, [], true, enabledTags, policyRecentlyUsedTagsList, false).tagOptions,
        [searchValue, enabledTags, selectedOptions, policyRecentlyUsedTagsList],
    );

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList(lodashGet(sections, '[0].data.length', 0) > 0, searchValue);

    const selectedOptionKey = lodashGet(_.filter(lodashGet(sections, '[0].data', []), (policyTag) => policyTag.searchText === selectedTag)[0], 'keyForList');

    return (
        <SelectionList
            ListItem={RadioListItem}
            containerStyle={{paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}}
            sectionTitleStyles={styles.mt5}
            sections={sections}
            textInputValue={searchValue}
            headerMessage={headerMessage}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            isRowMultilineSupported
            shouldShowTextInput={shouldShowTextInput}
            // Focus the selected option on first load
            initiallyFocusedOptionKey={selectedOptionKey}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
        />
    );
}

TagPicker.displayName = 'TagPicker';
TagPicker.propTypes = propTypes;
TagPicker.defaultProps = defaultProps;

export default withOnyx({
    policyTags: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`,
    },
    policyRecentlyUsedTags: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`,
    },
})(TagPicker);
