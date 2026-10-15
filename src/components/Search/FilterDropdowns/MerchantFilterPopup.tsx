/**
 * Edits the Merchant filter value and match type from its search filter chip.
 */
import ScrollView from '@components/ScrollView';
import MerchantMatchTypeSelector from '@components/Search/FilterComponents/MerchantMatchTypeSelector';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import TextInput from '@components/TextInput';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getMerchantFilterFormValues} from '@libs/SearchQueryUtils';
import {getFilterNegatableValue} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {MerchantMatchType, SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {PopoverComponentProps} from './FilterPopupButton';

import BasePopup from './BasePopup';

type MerchantFilterPopupProps = {
    /** The Merchant filter key. */
    baseFilterKey: typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT;
    /** The current search filter form values. */
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    /** The translated filter label. */
    label: string;
    /** Closes the filter popup. */
    closeOverlay: PopoverComponentProps['closeOverlay'];
    /** Applies the updated Merchant filter values. */
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

// The controls are rendered directly in BasePopup, like TextFilterPopup, because the popover sizes to its content.
// The advanced filters page content uses a flex ScrollView, which collapses to zero height in a content-sized popover on native.
// A content-sized ScrollView under a max height keeps the controls reachable when they don't fit, for example in landscape.
function MerchantFilterPopup({baseFilterKey, values, label, updateFilterForm, closeOverlay}: MerchantFilterPopupProps) {
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const isInLandscapeMode = useIsInLandscapeMode();

    const {isNegated: initialIsNegated, value: initialValue} = getFilterNegatableValue(baseFilterKey, values);
    const [isNegated, setIsNegated] = useState(initialIsNegated);
    const [value, setValue] = useState(initialValue);
    const [merchantOperator, setMerchantOperator] = useState<MerchantMatchType>(values?.[FILTER_KEYS.MERCHANT_OPERATOR] ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);

    const error = useTextFilterValidation(baseFilterKey, value);

    const applyChanges = () => {
        if (error) {
            return;
        }
        updateFilterForm(getMerchantFilterFormValues(value, isNegated, merchantOperator));
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            applySentryLabel={`Search-FilterPopupApply-${baseFilterKey}`}
            style={[styles.getPopoverMaxHeight(windowHeight, isInLandscapeMode)]}
            shouldSubmitOnEnter
        >
            <ScrollView keyboardShouldPersistTaps="handled">
                <NegatableFilter
                    baseFilterKey={baseFilterKey}
                    isNegated={isNegated}
                    onNegationChange={setIsNegated}
                >
                    <TextInput
                        placeholder={label}
                        value={value}
                        errorText={error}
                        hasError={!!error}
                        onChangeText={setValue}
                        accessibilityLabel={label}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.ph5]}
                    />
                </NegatableFilter>
                {/* A negated Merchant filter always uses the not-equal operator, so the match type is hidden. */}
                {!isNegated && (
                    <View style={styles.mt5}>
                        <MerchantMatchTypeSelector
                            value={merchantOperator}
                            onChange={setMerchantOperator}
                        />
                    </View>
                )}
            </ScrollView>
        </BasePopup>
    );
}

export default MerchantFilterPopup;
