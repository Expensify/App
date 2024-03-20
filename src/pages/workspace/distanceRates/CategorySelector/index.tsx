import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {ListItem} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CategorySelectorModal from './CategorySelectorModal';

type CategorySelectorProps = {
    /** The ID of the associated policy */
    policyID: string;

    /** Function to call when the user selects a category */
    setNewCategory: (value: ListItem) => void;

    /** Currently selected category */
    defaultValue?: string;

    /** Label to display on field */
    label: string;

    /** Any additional styles to apply */
    wrapperStyle: StyleProp<ViewStyle>;
};

function CategorySelector({defaultValue = '', wrapperStyle, label, setNewCategory, policyID}: CategorySelectorProps) {
    const styles = useThemeStyles();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateCategoryInput = (categoryItem: ListItem) => {
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
                policyID={policyID}
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
