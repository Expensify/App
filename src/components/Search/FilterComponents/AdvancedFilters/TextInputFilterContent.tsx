import React, {useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import RadioButtonWithLabel from '@components/RadioButtonWithLabel';
import Text from '@components/Text';
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
    const merchantMatchTypeItems: Array<{value: MerchantMatchType; label: string}> = [
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            label: translate('search.filters.merchant.equalTo'),
        },
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            label: translate('search.filters.merchant.contains'),
        },
    ];

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
            <View>
                <FilterComponents
                    value={value}
                    policyIDs={undefined}
                    filterKey={filterKey}
                    policyIDQuery={undefined}
                    autoFocus={autoFocus}
                    onChange={(v) => setValue(typeof v === 'string' ? v : undefined)}
                />
                {shouldShowMerchantMatchType && (
                    <View style={[styles.mt4, styles.ph5]}>
                        <Text style={[styles.textLabelSupporting, styles.mb2]}>{translate('search.filters.merchant.matchType')}</Text>
                        {merchantMatchTypeItems.map((item) => (
                            <RadioButtonWithLabel
                                key={item.value}
                                isChecked={item.value === merchantOperator}
                                style={styles.optionRowCompact}
                                onPress={() => setMerchantOperator(item.value)}
                                label={item.label}
                            />
                        ))}
                    </View>
                )}
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
