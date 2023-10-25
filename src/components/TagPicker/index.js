import React, {useMemo, useState} from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import useLocalize from '../../hooks/useLocalize';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import * as PolicyUtils from '../../libs/PolicyUtils';
import OptionsSelector from '../OptionsSelector';
import {propTypes, defaultProps} from './tagPickerPropTypes';

function TagPicker({selectedTag, tag, policyTags, policyRecentlyUsedTags, onSubmit}) {
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

    const initialFocusedIndex = useMemo(() => {
        if (isTagsCountBelowThreshold && selectedOptions.length > 0) {
            return _.chain(policyTagList)
                .values()
                .findIndex((policyTag) => policyTag.name === selectedOptions[0].name, true)
                .value();
        }

        return 0;
    }, [policyTagList, selectedOptions, isTagsCountBelowThreshold]);

    const sections = useMemo(
        () =>
            OptionsListUtils.getFilteredOptions({}, {}, [], searchValue, selectedOptions, [], false, false, false, {}, [], true, policyTagList, policyRecentlyUsedTagsList, false).tagOptions,
        [searchValue, selectedOptions, policyTagList, policyRecentlyUsedTagsList],
    );

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList(lodashGet(sections, '[0].data.length', 0) > 0, '');

    return (
        <OptionsSelector
            optionHoveredStyle={styles.hoveredComponentBG}
            sections={sections}
            selectedOptions={selectedOptions}
            headerMessage={headerMessage}
            textInputLabel={translate('common.search')}
            boldStyle
            highlightSelectedOptions
            isRowMultilineSupported
            shouldShowTextInput={shouldShowTextInput}
            value={searchValue}
            initialFocusedIndex={initialFocusedIndex}
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
