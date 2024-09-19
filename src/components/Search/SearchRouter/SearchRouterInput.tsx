import React, {useState} from 'react';
import BaseTextInput from '@components/TextInput/BaseTextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    isFullWidth: boolean;
    onChange: (searchTerm: string) => void;
    onSubmit: () => void;
};

function SearchRouterInput({isFullWidth, onChange, onSubmit}: SearchRouterInputProps) {
    const styles = useThemeStyles();

    const [value, setValue] = useState('');

    const onChangeText = (text: string) => {
        setValue(text);
        onChange(text);
    };

    const modalWidth = isFullWidth ? styles.w100 : {width: variables.popoverWidth};

    return (
        <BaseTextInput
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            autoFocus
            textInputContainerStyles={[{borderBottomWidth: 0}, modalWidth]}
            inputStyle={[styles.searchInputStyle, styles.searchRouterInputStyle, styles.ph2]}
            role={CONST.ROLE.PRESENTATION}
            autoCapitalize="none"
        />
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
