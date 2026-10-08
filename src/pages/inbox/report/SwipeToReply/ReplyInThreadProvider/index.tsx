import type ReplyInThreadProviderProps from './types';

/** Swipe-to-reply is native only, so web needs none of its data. */
function ReplyInThreadProvider({children}: ReplyInThreadProviderProps) {
    return children;
}

export default ReplyInThreadProvider;
