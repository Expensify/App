import CONST from "@src/CONST";
import type {ValueOf} from "type-fest";
import type {TranslationPaths} from '@src/languages/types';


type SearchDataTypes = typeof CONST.SEARCH.FILTERS.VALUES.EXPENSE | typeof CONST.SEARCH.FILTERS.VALUES.CHAT;
type SearchFilterModifiers = typeof CONST.SEARCH.FILTERS.MODIFIERS.ON | typeof CONST.SEARCH.FILTERS.MODIFIERS.AFTER | typeof CONST.SEARCH.FILTERS.MODIFIERS.BEFORE;

type FilterConfig = {
    key: ValueOf<typeof CONST.SEARCH.FILTERS.KEYS>;
    displayText: TranslationPaths;
    component: React.ComponentType<any>;
    dataTypes: SearchDataTypes[]; // Which data types this filter applies to
    validate?: (values) => boolean;
    getOptions?: (values) => SelectItem[];
    modifiers: SearchFilterModifiers[];
    routeKey: string;
    isExposed?: (context: SearchDataTypes) => boolean;
}

const filterConfig: FilterConfig[] = [
    {
        key: CONST.SEARCH.FILTERS.KEYS.TYPE,
        displayText: 'common.type',
        component: RadioButtons,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE, CONST.SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [CONST.SEARCH.FILTERS.VALUES.EXPENSE, CONST.SEARCH.FILTERS.VALUES.CHAT],
        modifiers: [],
        routeKey: CONST.SEARCH.FILTERS.KEYS.TYPE,
        isExposed: (context) => true,
    },
    {
        key: CONST.SEARCH.FILTERS.KEYS.STATUS,
        displayText: 'common.status',
        component: CheckboxList,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [CONST.SEARCH.FILTERS.VALUES.ALL, CONST.SEARCH.FILTERS.VALUES.DRAFTS],
        modifiers: [],
        routeKey: CONST.SEARCH.FILTERS.KEYS.STATUS,
        isExposed: (context) => true,
    },
    {
        key: CONST.SEARCH.FILTERS.KEYS.DATE,
        displayText: 'common.date',
        component: DatePicker,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE, CONST.SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [CONST.SEARCH.FILTERS.VALUES.LAST_MONTH, CONST.SEARCH.FILTERS.VALUES.THIS_MONTH],
        modifiers: [CONST.SEARCH.FILTERS.MODIFIERS.ON, CONST.SEARCH.FILTERS.MODIFIERS.AFTER, CONST.SEARCH.FILTERS.MODIFIERS.BEFORE],
        routeKey: CONST.SEARCH.FILTERS.KEYS.DATE,
        isExposed: (context) => true,
    },
    {
        key: CONST.SEARCH.FILTERS.KEYS.KEYWORD,
        displayText: 'common.keyword',
        component: TextInput,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE, CONST.SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [],
        modifiers: [],
        routeKey: CONST.SEARCH.FILTERS.KEYS.KEYWORD,
        isExposed: (context) => false,
    },
    {
        key: CONST.SEARCH.FILTERS.KEYS.AMOUNT,
        displayText: 'common.amount',
        component: TextInput,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE],
        validate: () => true,
        getOptions: () => [],
        modifiers: [],
        routeKey: CONST.SEARCH.FILTERS.KEYS.AMOUNT,
        isExposed: (context) => false,
    },
    {
        key: CONST.SEARCH.FILTERS.KEYS.REIMBURSABLE,
        displayText: 'common.reimbursable',
        component: RadioButtons,
        dataTypes: [CONST.SEARCH.FILTERS.VALUES.EXPENSE],
        validate: () => true,
        getOptions: () => [CONST.SEARCH.FILTERS.VALUES.YES, CONST.SEARCH.FILTERS.VALUES.NO],
        modifiers: [],
        routeKey: CONST.SEARCH.FILTERS.KEYS.REIMBURSABLE,
        isExposed: (context) => false,
    },
]
