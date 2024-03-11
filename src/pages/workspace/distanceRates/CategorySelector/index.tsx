import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useThemeStyles from '@hooks/useThemeStyles';
import type * as OnyxTypes from '@src/types/onyx';
import CategorySelectorModal from './CategorySelectorModal';
import type CategoryItemType from './types';

type CategorySelectorProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Function to call when the user selects a category */
    setNewCategory: (value: CategoryItemType) => void;

    /** Currently selected category */
    defaultValue?: string;

    /** Label to display on field */
    label: string;

    /** Any additional styles to apply */
    wrapperStyle: StyleProp<ViewStyle>;
};

function CategorySelector({policyCategories, defaultValue = '', wrapperStyle, label, setNewCategory}: CategorySelectorProps) {
    const styles = useThemeStyles();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateCategoryInput = (categoryItem: CategoryItemType) => {
        setNewCategory(categoryItem);
        hidePickerModal();
    };

    const title = defaultValue;
    const descStyle = title.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={title}
                description={label}
                descriptionTextStyle={descStyle}
                onPress={showPickerModal}
                wrapperStyle={wrapperStyle}
            />
            <CategorySelectorModal
                policyCategories={policyCategories}
                isVisible={isPickerVisible}
                currentCategory={defaultValue}
                onClose={hidePickerModal}
                onCategorySelected={updateCategoryInput}
                label={label}
            />
        </View>
    );
}

CategorySelector.displayName = 'CategorySelector';

export default CategorySelector;
