import React, {useState} from 'react';
import BaseTextInput from '@components/TextInput/BaseTextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    text: string;
    setText: (searchTerm: string) => void;
    updateSearch: (searchTerm: string) => void;
    onSubmit: () => void;
};

function SearchRouterInput({text, setText, updateSearch, onSubmit}: SearchRouterInputProps) {
    const styles = useThemeStyles();

    const onChangeText = (text: string) => {
        setText(text);
        updateSearch(text);
    };

    return (
        <BaseTextInput
            value={text}
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
