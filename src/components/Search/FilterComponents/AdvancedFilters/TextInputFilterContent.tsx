import Button from '@components/Button';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {MerchantMatchType} from '@src/types/form/SearchAdvancedFiltersForm';

import type {TextInput as RNTextInput, StyleProp, ViewStyle} from 'react-native';

import React, {Fragment, useState} from 'react';
import {View} from 'react-native';

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

function isTextInput(element: BaseTextInputRef | RNTextInput | null): element is RNTextInput {
    return !!element && 'isFocused' in element;
}

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

    const label = translate(FILTER_VIEW_MAP[filterKey].labelKey);
    const {inputCallbackRef} = useAutoFocusInput();
    const error = useTextFilterValidation(filterKey, value);

    const filterInput = (
        <TextInput
            ref={(ref) => {
                if (!autoFocus || !isTextInput(ref)) {
                    return;
                }
                inputCallbackRef(ref);
            }}
            placeholder={label}
            value={value}
            errorText={error}
            hasError={!!error}
            onChangeText={setValue}
            accessibilityLabel={label}
            role={CONST.ROLE.PRESENTATION}
            containerStyles={shouldShowMerchantMatchType ? [styles.ph4, styles.mv2] : [styles.ph5]}
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
                onPress={() => {
                    if (error) {
                        return;
                    }
                    onChange(value, shouldShowMerchantMatchType ? merchantOperator : undefined);
                }}
            />
        </View>
    );
}

export default TextInputFilterContent;
export type {TextInputFilterContentProps};
