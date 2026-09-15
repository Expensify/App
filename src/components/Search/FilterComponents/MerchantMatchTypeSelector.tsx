/**
 * Shared Merchant match type selector for search filter surfaces.
 */
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {MerchantMatchType} from '@src/types/form/SearchAdvancedFiltersForm';

import React from 'react';
import {View} from 'react-native';

type MerchantMatchTypeSelectorProps = {
    /** Currently selected Merchant match type. */
    value: MerchantMatchType;

    /** Updates the selected Merchant match type. */
    onChange: (value: MerchantMatchType) => void;
};

function MerchantMatchTypeSelector({value, onChange}: MerchantMatchTypeSelectorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const items: Array<ListItem<MerchantMatchType>> = [
        {
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            text: translate('search.filters.merchant.contains'),
            isSelected: value === CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        },
        {
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            text: translate('search.filters.merchant.exactMatch'),
            isSelected: value === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        },
    ];

    return (
        <>
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.textLabelSupporting]}>{translate('search.filters.merchant.matchType')}</Text>
            </View>
            <SelectionList
                data={items}
                ListItem={SingleSelectListItem}
                onSelectRow={(item) => onChange(item.keyForList)}
                shouldSingleExecuteRowSelect
            />
        </>
    );
}

export default MerchantMatchTypeSelector;
