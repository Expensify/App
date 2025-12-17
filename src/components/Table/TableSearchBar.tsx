import React from 'react';
import {View} from 'react-native';
import TextInput from '@components/TextInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useTableContext} from '.';

function TableSearchBar() {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass'] as const);
    const {activeSearchString, updateSearchString} = useTableContext();

    return (
        <View>
            <TextInput
                label={translate('workspace.companyCards.findCard')}
                accessibilityLabel={translate('workspace.companyCards.findCard')}
                value={activeSearchString}
                onChangeText={(text) => updateSearchString(text)}
                icon={activeSearchString.length === 0 ? expensifyIcons.MagnifyingGlass : undefined}
                includeIconPadding={false}
                shouldShowClearButton
                shouldHideClearButton={activeSearchString.length === 0}
                onClearInput={() => updateSearchString('')}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
            />
        </View>
    );
}
export default TableSearchBar;
