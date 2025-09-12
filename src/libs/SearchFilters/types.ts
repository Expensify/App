import type {ComponentType} from 'react';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchFilterKey} from '@components/Search/types';

type FilterType = 'datePreset' | 'amount' | 'text' | 'multiSelect' | 'boolean' | 'custom';

interface SelectionItem {
    name: string;
    value: string;
}

interface BaseFilterConfig {
    key: SearchFilterKey;
    titleKey: TranslationPaths;
    type: FilterType;
    testID?: string;
}

interface DatePresetFilterConfig extends BaseFilterConfig {
    type: 'datePreset';
    dateKey: string;
}

interface AmountFilterConfig extends BaseFilterConfig {
    type: 'amount';
    filterKey: string;
}

interface TextFilterConfig extends BaseFilterConfig {
    type: 'text';
    filterKey: string;
    characterLimit?: number;
}

interface MultiSelectFilterConfig extends BaseFilterConfig {
    type: 'multiSelect';
    getItems: () => SelectionItem[];
    onSaveSelection: (values: string[]) => void;
    getSelectedItems: () => SelectionItem[];
}

interface BooleanFilterConfig extends BaseFilterConfig {
    type: 'boolean';
    filterKey: string;
}

interface CustomFilterConfig extends BaseFilterConfig {
    type: 'custom';
    component: ComponentType;
}

type FilterConfig = 
    | DatePresetFilterConfig 
    | AmountFilterConfig 
    | TextFilterConfig 
    | MultiSelectFilterConfig 
    | BooleanFilterConfig 
    | CustomFilterConfig;

export type {
    FilterType,
    SelectionItem,
    BaseFilterConfig,
    DatePresetFilterConfig,
    AmountFilterConfig,
    TextFilterConfig,
    MultiSelectFilterConfig,
    BooleanFilterConfig,
    CustomFilterConfig,
    FilterConfig,
};