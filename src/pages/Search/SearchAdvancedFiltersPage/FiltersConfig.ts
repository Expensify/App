import CONST from "@src/CONST";
import type {ValueOf} from "type-fest";
import type {TranslationPaths} from '@src/languages/types';


type SearchDataTypes = typeof CONST.NEW_SEARCH.FILTERS.VALUES.EXPENSE | typeof CONST.NEW_SEARCH.FILTERS.VALUES.CHAT;
type SearchFilterModifiers = typeof CONST.NEW_SEARCH.FILTERS.MODIFIERS.ON | typeof CONST.NEW_SEARCH.FILTERS.MODIFIERS.AFTER | typeof CONST.NEW_SEARCH.FILTERS.MODIFIERS.BEFORE;

type FilterConfig = {
    key: ValueOf<typeof CONST.NEW_SEARCH.FILTERS.KEYS>;
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
        key: CONST.NEW_SEARCH.FILTERS.KEYS.TYPE,
        displayText: 'common.type',
        component: RadioButtons,
        dataTypes: [CONST.NEW_SEARCH.FILTERS.VALUES.EXPENSE, CONST.NEW_SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [CONST.NEW_SEARCH.FILTERS.VALUES.EXPENSE, CONST.NEW_SEARCH.FILTERS.VALUES.CHAT],
        modifiers: [],
        routeKey: CONST.NEW_SEARCH.FILTERS.KEYS.TYPE,
        isExposed: (context) => true,
    },
    {
        key: CONST.NEW_SEARCH.FILTERS.KEYS.STATUS,
        displayText: 'common.status',
        component: CheckboxList,
        dataTypes: [CONST.NEW_SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [CONST.NEW_SEARCH.FILTERS.VALUES.ALL, CONST.NEW_SEARCH.FILTERS.VALUES.DRAFTS],
        modifiers: [],
        routeKey: CONST.NEW_SEARCH.FILTERS.KEYS.STATUS,
        isExposed: (context) => true,
    },
    {
        key: CONST.NEW_SEARCH.FILTERS.KEYS.DATE,
        displayText: 'common.date',
        component: DatePicker,
        dataTypes: [CONST.NEW_SEARCH.FILTERS.VALUES.EXPENSE, CONST.NEW_SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [CONST.NEW_SEARCH.FILTERS.VALUES.LAST_MONTH, CONST.NEW_SEARCH.FILTERS.VALUES.THIS_MONTH],
        modifiers: [CONST.NEW_SEARCH.FILTERS.MODIFIERS.ON, CONST.NEW_SEARCH.FILTERS.MODIFIERS.AFTER, CONST.NEW_SEARCH.FILTERS.MODIFIERS.BEFORE],
        routeKey: CONST.NEW_SEARCH.FILTERS.KEYS.DATE,
        isExposed: (context) => true,
    },
    {
        key: CONST.NEW_SEARCH.FILTERS.KEYS.KEYWORD,
        displayText: 'common.keyword',
        component: TextInput,
        dataTypes: [CONST.NEW_SEARCH.FILTERS.VALUES.EXPENSE, CONST.NEW_SEARCH.FILTERS.VALUES.CHAT],
        validate: () => true,
        getOptions: () => [],
        modifiers: [],
        routeKey: CONST.NEW_SEARCH.FILTERS.KEYS.KEYWORD,
        isExposed: (context) => false,
    },
    {
        key: CONST.NEW_SEARCH.FILTERS.KEYS.AMOUNT,
        displayText: 'common.amount',
        component: TextInput,
        dataTypes: [CONST.NEW_SEARCH.FILTERS.VALUES.EXPENSE],
        validate: () => true,
        getOptions: () => [],
        modifiers: [],
        routeKey: CONST.NEW_SEARCH.FILTERS.KEYS.AMOUNT,
        isExposed: (context) => false,
    },
    {
        key: CONST.NEW_SEARCH.FILTERS.KEYS.REIMBURSABLE,
        displayText: 'common.reimbursable',
        component: RadioButtons,
        dataTypes: [CONST.NEW_SEARCH.FILTERS.VALUES.EXPENSE],
        validate: () => true,
        getOptions: () => [CONST.NEW_SEARCH.FILTERS.VALUES.YES, CONST.NEW_SEARCH.FILTERS.VALUES.NO],
        modifiers: [],
        routeKey: CONST.NEW_SEARCH.FILTERS.KEYS.REIMBURSABLE,
        isExposed: (context) => false,
    },
]
