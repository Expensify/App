import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';
import ExpenseLimitTypeSelectorModal from './ExpenseLimitTypeSelectorModal';

type ExpenseLimitTypeSelectorProps = {
    /** Function to call when the user selects an expense limit type */
    setNewExpenseLimitType: (value: PolicyCategoryExpenseLimitType) => void;

    /** Currently selected expense limit type */
    defaultValue: PolicyCategoryExpenseLimitType;

    /** Label to display on field */
    label: string;

    /** Any additional styles to apply */
    wrapperStyle: StyleProp<ViewStyle>;
};

function ExpenseLimitTypeSelector({defaultValue, wrapperStyle, label, setNewExpenseLimitType}: ExpenseLimitTypeSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateExpenseLimitTypeInput = (expenseLimitType: PolicyCategoryExpenseLimitType) => {
        setNewExpenseLimitType(expenseLimitType);
        hidePickerModal();
    };

    const title = translate(`workspace.rules.categoryRules.expenseLimitTypes.${defaultValue}`);
    const descStyle = !title ? styles.textNormal : null;

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
            <ExpenseLimitTypeSelectorModal
                isVisible={isPickerVisible}
                currentExpenseLimitType={defaultValue}
                onClose={hidePickerModal}
                onExpenseLimitTypeSelected={updateExpenseLimitTypeInput}
                label={label}
            />
        </View>
    );
}

ExpenseLimitTypeSelector.displayName = 'ExpenseLimitTypeSelector';

export default ExpenseLimitTypeSelector;
