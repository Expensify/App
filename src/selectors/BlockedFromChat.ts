import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const isBlockedFromChatSelector = (dateString?: string): boolean => {
    if (!dateString) {
        return false;
    }
    try {
        return new Date(dateString) >= new Date();
    } catch (error) {
        // If the NVP is malformed, we'll assume the user is not blocked from chat. This is not expected, so if it happens we'll log an alert.
        Log.alert(`[${CONST.ERROR.ENSURE_BUG_BOT}] Found malformed ${ONYXKEYS.NVP_BLOCKED_FROM_CHAT} nvp`, dateString);
        return false;
    }
};

// eslint-disable-next-line import/prefer-default-export
export {isBlockedFromChatSelector};
