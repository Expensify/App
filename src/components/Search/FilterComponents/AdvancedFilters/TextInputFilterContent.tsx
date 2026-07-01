import React, {Fragment, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {MerchantMatchType} from '@src/types/form/SearchAdvancedFiltersForm';
import FilterComponents from '..';

type TextInputFilterContentProps = {
    filterKey:
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE
        | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID;
    value: string | undefined;
    largeButton?: boolean;
    autoFocus?: boolean;
    style?: StyleProp<ViewStyle>;
    merchantOperator?: MerchantMatchType;
    onChange: (value: string | undefined, merchantOperator?: MerchantMatchType) => void;
};

function TextInputFilterContent({filterKey, value: initialValue, autoFocus, largeButton, style, merchantOperator: initialMerchantOperator, onChange}: TextInputFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);
    const shouldShowMerchantMatchType = filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT;
    const [merchantOperator, setMerchantOperator] = useState<MerchantMatchType>(initialMerchantOperator ?? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO);
    const merchantMatchTypeItems: Array<ListItem<MerchantMatchType>> = [
        {
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            text: translate('search.filters.merchant.equalTo'),
            isSelected: merchantOperator === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        },
        {
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            text: translate('search.filters.merchant.contains'),
            isSelected: merchantOperator === CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        },
    ];

    const filterInput = (
        <FilterComponents
            value={value}
            policyIDs={undefined}
            filterKey={filterKey}
            policyIDQuery={undefined}
            autoFocus={autoFocus}
            textInputContainerStyle={shouldShowMerchantMatchType ? [styles.ph4, styles.mv2] : undefined}
            onChange={(v) => setValue(typeof v === 'string' ? v : undefined)}
        />
    );

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
            <View>
                {shouldShowMerchantMatchType
                    ? merchantMatchTypeItems.map((item) => (
                          <Fragment key={item.keyForList}>
                              <SingleSelectListItem
                                  item={item}
                                  showTooltip={false}
                                  keyForList={item.keyForList}
                                  onSelectRow={() => setMerchantOperator(item.keyForList)}
                              />
                              {item.isSelected && filterInput}
                          </Fragment>
                      ))
                    : filterInput}
            </View>
            <Button
                style={[styles.ph5, styles.pb5]}
                success
                large={largeButton}
                text={translate('common.confirm')}
                pressOnEnter
                onPress={() => onChange(value, shouldShowMerchantMatchType ? merchantOperator : undefined)}
            />
        </View>
    );
}

export default TextInputFilterContent;
export type {TextInputFilterContentProps};
