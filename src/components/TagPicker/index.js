import lodashGet from 'lodash/get';
import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import OptionsSelector from '@components/OptionsSelector';
import useLocalize from '@hooks/useLocalize';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, propTypes} from './tagPickerPropTypes';

function TagPicker({selectedTag, tag, policyTags, policyRecentlyUsedTags, shouldShowDisabledAndSelectedOption, insets, onSubmit}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyRecentlyUsedTagsList = lodashGet(policyRecentlyUsedTags, tag, []);
    const policyTagList = PolicyUtils.getTagList(policyTags, tag);
    const policyTagsCount = _.size(_.filter(policyTagList, (policyTag) => policyTag.enabled));
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
            return policyTagList;
        }
        const selectedNames = _.map(selectedOptions, (s) => s.name);
        const tags = [...selectedOptions, ..._.filter(policyTagList, (policyTag) => policyTag.enabled && !selectedNames.includes(policyTag.name))];
        return tags;
    }, [selectedOptions, policyTagList, shouldShowDisabledAndSelectedOption]);

    const sections = useMemo(
        () => OptionsListUtils.getFilteredOptions({}, {}, [], searchValue, selectedOptions, [], false, false, false, {}, [], true, enabledTags, policyRecentlyUsedTagsList, false).tagOptions,
        [searchValue, enabledTags, selectedOptions, policyRecentlyUsedTagsList],
    );

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList(lodashGet(sections, '[0].data.length', 0) > 0, searchValue);

    const selectedOptionKey = lodashGet(_.filter(lodashGet(sections, '[0].data', []), (policyTag) => policyTag.searchText === selectedTag)[0], 'keyForList');

    return (
        <OptionsSelector
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
            value={searchValue}
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
