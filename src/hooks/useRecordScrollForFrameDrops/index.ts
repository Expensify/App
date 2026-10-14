const NOOP = () => {};

/** Frame drops are only measured on native, so on web this is a no-op. */
function useRecordScrollForFrameDrops() {
    return NOOP;
}

export default useRecordScrollForFrameDrops;
