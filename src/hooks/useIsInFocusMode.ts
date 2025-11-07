import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useIsInFocusMode() {
    const [priorityMode = CONST.PRIORITY_MODE.DEFAULT] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {canBeMissing: true});

    return priorityMode !== CONST.PRIORITY_MODE.DEFAULT;
}

export default useIsInFocusMode;
