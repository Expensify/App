import CONST from '@src/CONST';

import {useChatTabBrickRoad} from './useSidebarOrderedReports';
import useTheme from './useTheme';

type InboxTabIndicatorStatusResult = {
    /** The chat tab's brick road status, or undefined when no chat needs attention. */
    status: ReturnType<typeof useChatTabBrickRoad>;

    /** The indicator dot color: success for an info status, danger for anything else, none without a status. */
    indicatorColor: string | undefined;
};

function useInboxTabIndicatorStatus(): InboxTabIndicatorStatusResult {
    const theme = useTheme();
    const status = useChatTabBrickRoad();

    let indicatorColor: string | undefined;
    if (status) {
        indicatorColor = status === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger;
    }

    return {status, indicatorColor};
}

export default useInboxTabIndicatorStatus;
