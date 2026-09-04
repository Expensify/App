import Button from '@components/ButtonComposed';
import MerchantMatchTypeSelector from '@components/Search/FilterComponents/MerchantMatchTypeSelector';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {ReportFieldTextKey, SearchTextFilterKeys} from '@components/Search/types';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {MerchantMatchType} from '@src/types/form/SearchAdvancedFiltersForm';

import type {TextInput as RNTextInput, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';
import {View} from 'react-native';

type TextInputFilterContentProps = {
    baseFilterKey: Exclude<SearchTextFilterKeys, typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT | ReportFieldTextKey>;
    value: string | undefined;
    isNegated: boolean;
    size?: Exclude<ValueOf<typeof CONST.BUTTON_SIZE>, typeof CONST.BUTTON_SIZE.SMALL>;
    autoFocus?: boolean;
    style?: StyleProp<ViewStyle>;
    merchantOperator?: MerchantMatchType;
    onChange: (value: string | undefined, isNegated: boolean, merchantOperator?: MerchantMatchType) => void;
};

function isTextInput(element: BaseTextInputRef | RNTextInput | null): element is RNTextInput {
    return !!element && 'isFocused' in element;
}

function TextInputFilterContent({
    baseFilterKey,
    value: initialValue,
    isNegated: initialIsNegated,
    autoFocus,
    size,
    style,
    merchantOperator: initialMerchantOperator,
    onChange,
}: TextInputFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);
    const [isNegated, setIsNegated] = useState(initialIsNegated);
    const shouldShowMerchantMatchType = baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT && !isNegated;
    const [merchantOperator, setMerchantOperator] = useState<MerchantMatchType>(initialMerchantOperator ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);
    const label = translate(FILTER_VIEW_MAP[baseFilterKey].labelKey);
    const {inputCallbackRef} = useAutoFocusInput();
    const error = useTextFilterValidation(baseFilterKey, value);

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
            containerStyles={shouldShowMerchantMatchType ? [styles.ph5, styles.mb5] : [styles.ph5]}
        />
    );

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
            <NegatableFilter
                baseFilterKey={baseFilterKey}
                isNegated={isNegated}
                onNegationChange={setIsNegated}
                style={shouldShowMerchantMatchType ? styles.flex1 : undefined}
            >
                <View style={shouldShowMerchantMatchType ? styles.flex1 : undefined}>
                    {filterInput}
                    {shouldShowMerchantMatchType && (
                        <MerchantMatchTypeSelector
                            value={merchantOperator}
                            onChange={setMerchantOperator}
                        />
                    )}
                </View>
            </NegatableFilter>
            <Button
                style={[styles.ph5, styles.pb5]}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={size}
                onPress={() => {
                    if (error) {
                        return;
                    }
                    onChange(value, isNegated, shouldShowMerchantMatchType ? merchantOperator : undefined);
                }}
            >
                <Button.KeyboardShortcut />
                <Button.Text>{translate('common.confirm')}</Button.Text>
            </Button>
        </View>
    );
}

export default TextInputFilterContent;
export type {TextInputFilterContentProps};
