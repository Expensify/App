import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {TodosDerivedValue} from '@src/types/onyx';

const todosReportCountsSelector = (todos: OnyxEntry<TodosDerivedValue>) => {
    if (!todos) {
        return CONST.EMPTY_TODOS_REPORT_COUNTS;
    }

    return {
        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: todos.reportsToSubmit?.length ?? 0,
        [CONST.SEARCH.SEARCH_KEYS.APPROVE]: todos.reportsToApprove?.length ?? 0,
        [CONST.SEARCH.SEARCH_KEYS.PAY]: todos.reportsToPay?.length ?? 0,
        [CONST.SEARCH.SEARCH_KEYS.EXPORT]: todos.reportsToExport?.length ?? 0,
    };
};

export default todosReportCountsSelector;
