import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

const actionTranslationsMap: Record<SearchTransactionAction, TranslationPaths> = {
    [CONST.SEARCH.ACTION_TYPES.VIEW]: 'common.view',
    [CONST.SEARCH.ACTION_TYPES.SUBMIT]: 'common.submit',
    [CONST.SEARCH.ACTION_TYPES.APPROVE]: 'iou.approve',
    [CONST.SEARCH.ACTION_TYPES.PAY]: 'iou.pay',
    [CONST.SEARCH.ACTION_TYPES.EXPORT_TO_ACCOUNTING]: 'common.export',
    [CONST.SEARCH.ACTION_TYPES.DONE]: 'common.done',
    [CONST.SEARCH.ACTION_TYPES.PAID]: 'iou.settledExpensify',
};

export default actionTranslationsMap;
