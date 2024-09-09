import React, {useState} from 'react';
import {View} from 'react-native';
import TextInput from '@components/TextInput';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SearchRouterInputProps = {
    onSearch: (searchTerm: string) => void;
};

function SearchRouterInput({onSearch}: SearchRouterInputProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const [value, setValue] = useState('');

    const onChangeText = (text: string) => {
        setValue(text);
        onSearch(text);
    };

    return (
        <View style={[]}>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                textInputContainerStyles={[{borderWidth: 0}]}
                containerStyles={[]}
                hideFocusedState
                inputStyle={[
                    styles.w80,
                    styles.h13,
                    styles.ph4,
                    {
                        width: 400,
                        borderRadius: 8,
                        borderWidth: 4,
                        borderColor: theme.borderFocus,
                    },
                ]}
                role={CONST.ROLE.PRESENTATION}
            />
        </View>
    );
}

SearchRouterInput.displayName = 'SearchRouterInput';

export default SearchRouterInput;
