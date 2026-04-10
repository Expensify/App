import React from 'react';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import useLocalize from '@hooks/useLocalize';
import type {TranslationPaths} from '@src/languages/types';

type MultiSelectFilterPopupProps<T extends string> = {
    loading?: boolean;
    translationKey: TranslationPaths;
    items: Array<MultiSelectItem<T>>;
    value: Array<MultiSelectItem<T>>;
    onChangeCallback: (selectedItems: Array<MultiSelectItem<T>>) => void;
    closeOverlay: () => void;
    isSearchable?: boolean;
};

function MultiSelectFilterPopup<T extends string>({closeOverlay, loading, translationKey, items, value, onChangeCallback, isSearchable}: MultiSelectFilterPopupProps<T>) {
    const {translate} = useLocalize();
    return (
        <MultiSelectPopup
            label={translate(translationKey)}
            items={items}
            value={value}
            loading={loading}
            closeOverlay={closeOverlay}
            onChange={onChangeCallback}
            isSearchable={isSearchable}
        />
    );
}

export default MultiSelectFilterPopup;
export type {MultiSelectFilterPopupProps};
