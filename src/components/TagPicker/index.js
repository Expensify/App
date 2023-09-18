import React, {useMemo} from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import useLocalize from '../../hooks/useLocalize';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import OptionsSelector from '../OptionsSelector';
import {propTypes, defaultProps} from './tagPickerPropTypes';

function TagPicker({policyTags, reportID, tag, iouType, iou}) {
    const {translate} = useLocalize();

    const selectedOptions = useMemo(() => {
        if (!iou.tag) {
            return [];
        }

        return [
            {
                name: iou.tag,
                enabled: true,
            },
        ];
    }, [iou.tag]);

    // Only shows one section, which will be the default behavior if there are
    // less than 8 policy tags
    // TODO: support sections with search
    const sections = useMemo(() => {
        const tagList = _.chain(lodashGet(policyTags, [tag, 'tags'], {}))
            .values()
            .map((t) => ({
                text: t.name,
                keyForList: t.name,
                tooltipText: t.name,
            }))
            .value();

        return [
            {
                data: tagList,
            },
        ];
    }, [policyTags, tag]);

    const headerMessage = OptionsListUtils.getHeaderMessage(lodashGet(sections, '[0].data.length', 0) > 0, false, '');

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    };

    const updateTag = () => {
        // TODO: add logic to save the selected tag
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
            value=""
            onSelectRow={updateTag}
            shouldShowTextInput={false}
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
