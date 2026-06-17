import React, {useEffect} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import SearchBar from '@components/SearchBar';
import TextInput from '@components/TextInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {useTableContext} from './TableContext';

/**
 * Renders a search input that filters table data.
 */
type TableSearchBarProps = {
    /** Label and accessibility label for the search input. */
    label: string;

    /** Optional style for the search bar container. */
    style?: StyleProp<ViewStyle>;
};

function TableSearchBar({label, style}: TableSearchBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);
    const {
        activeSearchString,
        tableMethods: {updateSearchString},
    } = useTableContext();

    useEffect(() => {
        return () => updateSearchString('');
        // We only want the cleanup to run on unmount to reset the search state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <TextInput
            hideFocusedState
            multiline={false}
            spellCheck={false}
            autoCorrect={false}
            placeholder={label}
            role={CONST.ROLE.SEARCHBOX}
            inputMode={CONST.INPUT_MODE.TEXT}
            placeholderTextColor={theme.textSupporting}
            // inputStyle={[styles.textLabel, styles.h7]}
            shouldShowClearButton={activeSearchString.length > 0}
            onChangeText={(text) => updateSearchString(text)}
            textInputContainerStyles={{
                height: 61,
                borderRadius: variables.componentBorderRadiusLarge,
                borderColor: theme.border,
                backgroundColor: theme.appBG,
                paddingHorizontal: 15,
                paddingVertical: 0,
            }}
            inputStyle={{
                fontSize: 24,
                lineHeight: 30,
                paddingTop: 0,
                paddingBottom: 0,
                color: theme.text,
            }}
        />
    );

    return (
        <SearchBar
            label={label}
            style={style}
            inputValue={activeSearchString}
            icon={activeSearchString.length === 0 ? expensifyIcons.MagnifyingGlass : undefined}
            onChangeText={(text) => updateSearchString(text)}
        />
    );
}

export default TableSearchBar;
