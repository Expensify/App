import type CONST from '@src/CONST';

/** The Home to-do rows whose `Begin` button pages through reports */
type HomeTodoSearchKey = typeof CONST.SEARCH.SEARCH_KEYS.SUBMIT | typeof CONST.SEARCH.SEARCH_KEYS.APPROVE | typeof CONST.SEARCH.SEARCH_KEYS.PAY | typeof CONST.SEARCH.SEARCH_KEYS.EXPORT;

/** The reports a Home to-do row handed to the report screen when the user pressed `Begin` */
type HomeTodoReview = {
    /** The to-do row the reports came from, which decides the action that moves the user to the next report */
    searchKey: HomeTodoSearchKey;

    /** The row's reports in the order of its Spend search, fixed when `Begin` was pressed */
    reportIDs: string[];
};

export default HomeTodoReview;
export type {HomeTodoSearchKey};
