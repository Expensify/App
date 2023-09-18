import React, {useMemo, useState} from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import * as IOU from '../../libs/actions/IOU';
import useLocalize from '../../hooks/useLocalize';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import OptionsSelector from '../OptionsSelector';
import {propTypes, defaultProps} from './tagPickerPropTypes';

function TagPicker({reportID, tag, iouType, policyTags, policyRecentlyUsedTags, iou}) {
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyRecentlyUsedTagsList = lodashGet(policyRecentlyUsedTags, tag, []);
    const policyTagList = lodashGet(policyTags, [tag, 'tags'], []);
    const policyTagsCount = _.size(policyTagList);
    const isTagsCountBelowThreshold = policyTagsCount < CONST.TAG_LIST_THRESHOLD;

    const shouldShowTextInput = !isTagsCountBelowThreshold;

    const selectedOptions = useMemo(() => {
        if (!iou.tag) {
            return [];
        }

        return [
            {
                name: iou.tag,
                enabled: true,
                accountID: null,
            },
        ];
    }, [iou.tag]);

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
            OptionsListUtils.getNewChatOptions({}, {}, [], searchValue, selectedOptions, [], false, false, false, {}, [], true, policyTagList, policyRecentlyUsedTagsList, false).tagOptions,
        [searchValue, selectedOptions, policyTagList, policyRecentlyUsedTagsList],
    );

    const headerMessage = OptionsListUtils.getHeaderMessage(lodashGet(sections, '[0].data.length', 0) > 0, false, '');

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    };

    const updateTag = (selectedTag) => {
        if (selectedTag.searchText === iou.tag) {
            IOU.resetMoneyRequestTag();
        } else {
            IOU.setMoneyRequestTag(selectedTag.searchText);
        }
        navigateBack();
    };

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
            onSelectRow={updateTag}
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
    iou: {
        key: ONYXKEYS.IOU,
    },
})(TagPicker);
