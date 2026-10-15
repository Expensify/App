/**
 * Edits the Merchant filter value and match type from its search filter chip.
 */
import MerchantFilterContent from '@components/Search/FilterComponents/AdvancedFilters/MerchantFilterContent';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFilterNegatableValue} from '@libs/SearchUIUtils';

import type CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import React from 'react';

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

function MerchantFilterPopup({baseFilterKey, values, label, updateFilterForm, closeOverlay}: MerchantFilterPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isNegated, value} = getFilterNegatableValue(baseFilterKey, values);
    const applySentryLabel = `Search-FilterPopupApply-${baseFilterKey}`;

    const applyChanges = (newValues: Partial<SearchAdvancedFiltersForm>) => {
        updateFilterForm(newValues);
        closeOverlay();
    };

    // The content renders its own padded Apply button, so the popup only provides the label and the spacing ActionButtons would add.
    return (
        <BasePopup
            label={label}
            shouldShowActionButtons={false}
            style={styles.pb0}
            onApply={closeOverlay}
            applySentryLabel={applySentryLabel}
        >
            <MerchantFilterContent
                baseFilterKey={baseFilterKey}
                value={value}
                isNegated={isNegated}
                merchantOperator={values?.[FILTER_KEYS.MERCHANT_OPERATOR]}
                buttonText={translate('common.apply')}
                sentryLabel={applySentryLabel}
                buttonStyles={styles.mt2}
                onChange={applyChanges}
            />
        </BasePopup>
    );
}

export default MerchantFilterPopup;
