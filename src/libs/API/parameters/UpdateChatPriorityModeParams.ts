import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type UpdateChatPriorityModeParams = {
    value: ValueOf<typeof CONST.PRIORITY_MODE>;
    automatic: boolean;
};

export default UpdateChatPriorityModeParams;
