/**
 * Renders the advanced Merchant filter input, match type, and negation controls.
 */
import Button from '@components/Button';
import MerchantMatchTypeSelector from '@components/Search/FilterComponents/MerchantMatchTypeSelector';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {MerchantMatchType, SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import type {TextInput as RNTextInput, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';
import {View} from 'react-native';

type MerchantFilterContentProps = {
    /** The Merchant filter key. */
    baseFilterKey: typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT;

    /** The current Merchant value. */
    value: string | undefined;

    /** Whether the filter currently uses the negated value. */
    isNegated: boolean;

    /** The current Merchant match type. */
    merchantOperator?: MerchantMatchType;

    /** The button size used for confirmation. */
    buttonSize?: Exclude<ValueOf<typeof CONST.BUTTON_SIZE>, typeof CONST.BUTTON_SIZE.SMALL>;

    /** Whether the input should receive focus automatically. */
    autoFocus?: boolean;

    /** Additional styles for the filter content. */
    style?: StyleProp<ViewStyle>;

    /** Called with the updated Merchant filter form values. */
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function isTextInput(element: BaseTextInputRef | RNTextInput | null): element is RNTextInput {
    return !!element && 'isFocused' in element;
}

function MerchantFilterContent({
    baseFilterKey,
    value: initialValue,
    isNegated: initialIsNegated,
    merchantOperator: initialMerchantOperator,
    buttonSize,
    autoFocus,
    style,
    onChange,
}: MerchantFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);
    const [isNegated, setIsNegated] = useState(initialIsNegated);
    const [merchantOperator, setMerchantOperator] = useState<MerchantMatchType>(initialMerchantOperator ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);
    const shouldShowMerchantMatchType = !isNegated;
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

    const updateMerchantFilter = () => {
        if (error) {
            return;
        }

        onChange({
            [FILTER_KEYS.MERCHANT]: isNegated ? undefined : value,
            [FILTER_KEYS.MERCHANT_NOT]: isNegated ? value : undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: isNegated ? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO : merchantOperator,
        });
    };

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
                size={buttonSize}
                onPress={updateMerchantFilter}
            >
                <Button.KeyboardShortcut />
                <Button.Text>{translate('common.confirm')}</Button.Text>
            </Button>
        </View>
    );
}

export default MerchantFilterContent;
export type {MerchantFilterContentProps};
