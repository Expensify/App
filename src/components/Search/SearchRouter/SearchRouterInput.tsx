import React from 'react';
import type {RefObject} from 'react';
import type {SelectionListHandle} from '@components/SelectionList/types';
import BaseTextInput from '@components/TextInput/BaseTextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    value: string;
    setValue: (searchTerm: string) => void;
    updateSearch: (searchTerm: string) => void;
    onSubmit: () => void;
    routerListRef: RefObject<SelectionListHandle>;
};

function SearchRouterInput({value, setValue, updateSearch, onSubmit, routerListRef}: SearchRouterInputProps) {
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
            containerStyles={[styles.pv3, styles.ph5]}
            textInputContainerStyles={[{borderBottomWidth: 0}, styles.w100]}
            inputStyle={[styles.searchInputStyle, styles.searchRouterInputStyle, styles.ph2]}
            role={CONST.ROLE.PRESENTATION}
            autoCapitalize="none"
            onFocus={() => {
                routerListRef?.current?.updateExternalTextInputFocus(true);
            }}
            onBlur={() => {
                routerListRef?.current?.updateExternalTextInputFocus(false);
            }}
        />
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
