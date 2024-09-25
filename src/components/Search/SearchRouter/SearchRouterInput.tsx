import React from 'react';
import BaseTextInput from '@components/TextInput/BaseTextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    value: string;
    setValue: (searchTerm: string) => void;
    updateSearch: (searchTerm: string) => void;
    onSubmit: () => void;
};

function SearchRouterInput({value, setValue, updateSearch, onSubmit}: SearchRouterInputProps) {
    const styles = useThemeStyles();

    const onChangeText = (text: string) => {
        setValue(text);
        updateSearch(text);
    };

    return (
        <BaseTextInput
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            autoFocus
            textInputContainerStyles={[{borderBottomWidth: 0}, styles.w100]}
            inputStyle={[styles.searchInputStyle, styles.searchRouterInputStyle, styles.ph2]}
            role={CONST.ROLE.PRESENTATION}
            autoCapitalize="none"
        />
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
