import type {ReportAction} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SwipeToReplyProps = ChildrenProps & {
    /** The swiped message, used as the thread's parent action */
    action: ReportAction;

    /** Whether the message is a thread's parent action viewed from within the thread */
    isThreadReportParentAction: boolean;

    /** Turns the gesture off while the message can't be replied to (an open edit, errors, Search…) */
    isDisabled: boolean;
};

export default SwipeToReplyProps;
