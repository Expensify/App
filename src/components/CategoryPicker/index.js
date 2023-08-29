import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import {propTypes, defaultProps} from './categoryPickerPropTypes';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as IOU from '../../libs/actions/IOU';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import OptionsSelector from '../OptionsSelector';
import useLocalize from '../../hooks/useLocalize';

function CategoryPicker({policyCategories, reportID, policyID, iouType, iou, recentlyUsedPolicyCategories}) {
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const selectedOptions = useMemo(() => {
        if (!iou.category) {
            return [];
        }

        return [
            {
                name: iou.category,
                enabled: true,
                accountID: null,
            },
        ];
    }, [iou.category]);

    const sections = OptionsListUtils.getNewChatOptions(
        {},
        {},
        [],
        searchValue,
        selectedOptions,
        [],
        false,
        false,
        true,
        policyCategories,
        recentlyUsedPolicyCategories,
        false,
    ).categoryOptions;

    const headerMessage = OptionsListUtils.getHeaderMessage(lodashGet(sections, '[0].data.length', 0) > 0, false, searchValue);

    const navigateBack = () => {
        Navigation.goBack(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
    };

    const updateCategory = (category) => {
        if (category.searchText === iou.category) {
            IOU.resetMoneyRequestCategory();
        } else {
            IOU.setMoneyRequestCategory(
                {
                    name: category.searchText,
                    enabled: true,
                },
                policyID,
                recentlyUsedPolicyCategories,
            );
        }

        navigateBack();
    };

    return (
        <OptionsSelector
            optionHoveredStyle={styles.hoveredComponentBG}
            sections={sections}
            selectedOptions={selectedOptions}
            value={searchValue}
            headerMessage={headerMessage}
            textInputLabel={translate('common.search')}
            boldStyle
            highlightSelectedOptions
            onChangeText={setSearchValue}
            onSelectRow={updateCategory}
        />
    );
}

CategoryPicker.displayName = 'CategoryPicker';
CategoryPicker.propTypes = propTypes;
CategoryPicker.defaultProps = defaultProps;

export default withOnyx({
    policyCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
    },
    recentlyUsedPolicyCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.RECENTLY_USED_POLICY_CATEGORIES}${policyID}`,
    },
    iou: {
        key: ONYXKEYS.IOU,
    },
})(CategoryPicker);
