import React from 'react';
import {View} from 'react-native';
import TextInput from '@components/TextInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';

function TableSearchBar() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass'] as const);
    const {searchString, updateSearchString: setSearchString} = useTableContext();

    const handleChangeText = (text: string) => {
        setSearchString(text);
    };

    const handleClearInput = () => {
        setSearchString('');
    };

    return (
        <View style={styles.flex1}>
            <TextInput
                label={translate('common.search')}
                accessibilityLabel={translate('common.search')}
                value={searchString}
                onChangeText={handleChangeText}
                icon={searchString.length === 0 ? expensifyIcons.MagnifyingGlass : undefined}
                shouldShowClearButton
                shouldHideClearButton={searchString.length === 0}
                onClearInput={handleClearInput}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
            />
        </View>
    );
}
export default TableSearchBar;
