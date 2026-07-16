import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type UpdateChatPriorityModeParams = {
    value: ValueOf<typeof CONST.PRIORITY_MODE>;
    automatic: boolean;
};

export default UpdateChatPriorityModeParams;
