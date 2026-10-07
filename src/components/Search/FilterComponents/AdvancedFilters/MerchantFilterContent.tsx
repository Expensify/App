/**
 * Renders the advanced Merchant filter input, match type, and negation controls.
 */
import MerchantMatchTypeSelector from '@components/Search/FilterComponents/MerchantMatchTypeSelector';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {MerchantMatchType, SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';
import {View} from 'react-native';

import TextInputFilterContent from './TextInputFilterContent';

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

    /** The label used when the filter applies immediately. */
    buttonText?: string;

    /** The Sentry label for the confirmation button. */
    sentryLabel?: string;

    /** Whether the input should receive focus automatically. */
    autoFocus?: boolean;

    /** Additional styles for the filter content. */
    style?: StyleProp<ViewStyle>;

    /** Additional styles for the confirmation button. */
    buttonStyles?: StyleProp<ViewStyle>;

    /** Called with the updated Merchant filter form values. */
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function MerchantFilterContent({
    baseFilterKey,
    value,
    isNegated,
    merchantOperator: initialMerchantOperator,
    buttonSize,
    buttonText,
    sentryLabel,
    autoFocus,
    style,
    buttonStyles,
    onChange,
}: MerchantFilterContentProps) {
    const styles = useThemeStyles();
    const [merchantOperator, setMerchantOperator] = useState<MerchantMatchType>(initialMerchantOperator ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);

    const updateMerchantFilter = (newValue: string | undefined, newIsNegated: boolean) => {
        onChange({
            [FILTER_KEYS.MERCHANT]: newIsNegated ? undefined : newValue,
            [FILTER_KEYS.MERCHANT_NOT]: newIsNegated ? newValue : undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: newIsNegated ? undefined : merchantOperator,
        });
    };

    // A negated Merchant filter always uses the not-equal operator, so the match type is hidden.
    const renderMatchTypeSelector = (isFilterNegated: boolean) =>
        isFilterNegated ? null : (
            <View style={[styles.flex1, styles.mt2]}>
                <MerchantMatchTypeSelector
                    value={merchantOperator}
                    onChange={setMerchantOperator}
                />
            </View>
        );

    return (
        <TextInputFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            isNegated={isNegated}
            size={buttonSize}
            autoFocus={autoFocus}
            style={style}
            buttonText={buttonText}
            buttonStyles={buttonStyles}
            sentryLabel={sentryLabel}
            renderBelowInput={renderMatchTypeSelector}
            onChange={updateMerchantFilter}
        />
    );
}

export default MerchantFilterContent;
export type {MerchantFilterContentProps};
