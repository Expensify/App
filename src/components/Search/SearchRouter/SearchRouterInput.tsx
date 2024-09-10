import React, {useState} from 'react';
import {View} from 'react-native';
import BaseTextInput from '@components/TextInput/BaseTextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    onSearch: (searchTerm: string) => void;
};

function SearchRouterInput({onSearch}: SearchRouterInputProps) {
    const styles = useThemeStyles();

    const [value, setValue] = useState('');

    const onChangeText = (text: string) => {
        setValue(text);
        onSearch(text);
    };

    return (
        <View style={[]}>
            <BaseTextInput
                value={value}
                onChangeText={onChangeText}
                hideFocusedState
                textInputContainerStyles={[{borderBottomWidth: 0, width: variables.popoverWidth}]}
                inputStyle={[styles.searchInputStyle, styles.searchRouterInputStyle, styles.ph2]}
                role={CONST.ROLE.PRESENTATION}
            />
        </View>
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
