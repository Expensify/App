import React, {useState} from 'react';
import BaseTextInput from '@components/TextInput/BaseTextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    isFullWidth: boolean;
    onSearch: (searchTerm: string) => void;
};

function SearchRouterInput({isFullWidth, onSearch}: SearchRouterInputProps) {
    const styles = useThemeStyles();

    const [value, setValue] = useState('');

    const onChangeText = (text: string) => {
        setValue(text);
        onSearch(text);
    };

    const modalWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    return (
        <BaseTextInput
            value={value}
            onChangeText={onChangeText}
            autoFocus
            textInputContainerStyles={[{borderBottomWidth: 0}, modalWidth]}
            inputStyle={[styles.searchInputStyle, styles.searchRouterInputStyle, styles.ph2]}
            role={CONST.ROLE.PRESENTATION}
        />
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
