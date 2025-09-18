import { CONST } from "expensify-common";
import { TextInput } from "react-native";
import { ValueOf } from "type-fest";


type SearchDataTypes = ValueOf<typeof [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.CHAT]>;

type FilterConfig = {
    value: string;
    displayValue: TranslationPath;
    component: React.ComponentType<any>;
    dataTypes: SearchDataTypes[]; // Which data types this filter applies to
    formKey?: SearchAdvancedFiltersKey; // Form field key
    validate?: (value: any) => boolean;
    getOptions?: (data: any) => SelectItem[];
    routeKey: string;
    isExposed?: (context: SearchDataTypes) => boolean;
}

const FilterConfig: FilterConfig[] = [
    {
        key: CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.TYPE,
        displayText: 'common.type' as TranslationPath,
        component: RadioButtons,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE, CONST.SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.EXPENSE, CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.CHAT],
        routeKey: CONST.SEARCH.NEW_SEARCH.FILTERS.KEYS.TYPE,
        isExposed: (context) => true,
    },
    {
        key: CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.STATUS,
        displayText: 'common.status' as TranslationPath,
        component: CheckboxList,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.ALL, CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.DRAFTS],
        routeKey: CONST.SEARCH.NEW_SEARCH.FILTERS.KEYS.STATUS,
        isExposed: (context) => true,
    },
    {
        key: CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.DATE,
        displayText: 'common.date' as TranslationPath,
        component: DatePicker,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE, CONST.SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.LAST_MONTH, CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.THIS_MONTH],
        modifiers: [CONST.SEARCH.NEW_SEARCH.FILTERS.MODIFIERS.ON, CONST.SEARCH.NEW_SEARCH.FILTERS.MODIFIERS.AFTER, CONST.SEARCH.NEW_SEARCH.FILTERS.MODIFIERS.BEFORE],
        routeKey: CONST.SEARCH.NEW_SEARCH.FILTERS.KEYS.DATE,
        isExposed: (context) => true,
    },
    {
        key: CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.KEYWORD,
        displayText: 'common.keyword' as TranslationPath,
        component: TextInput,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE, CONST.SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [],
        routeKey: CONST.SEARCH.NEW_SEARCH.FILTERS.KEYS.KEYWORD,
        isExposed: (context) => false,
    },
    {
        key: CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.AMOUNT,
        displayText: 'common.amount' as TranslationPath,
        component: TextInput,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE],
        validate: () => true,
        getOptions: () => [],
        routeKey: CONST.SEARCH.NEW_SEARCH.FILTERS.KEYS.AMOUNT,
        isExposed: (context) => false,
    },
    {
        key: CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.REIMBURSABLE,
        displayText: 'common.reimbursable' as TranslationPath,
        component: RadioButtons,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE],
        validate: () => true,
        getOptions: () => [CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.YES, CONST.SEARCH.NEW_SEARCH.FILTERS.VALUES.NO],
        routeKey: CONST.SEARCH.NEW_SEARCH.FILTERS.KEYS.REIMBURSABLE,
        isExposed: (context) => false,
    },
]