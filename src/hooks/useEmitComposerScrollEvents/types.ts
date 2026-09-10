type UseEmitComposerScrollEventsOptions = {
    enabled?: boolean;
    inverted: boolean | null | undefined;
};

type UseEmitComposerScrollEvents = (options?: UseEmitComposerScrollEventsOptions) => () => void;

export default UseEmitComposerScrollEvents;
export type {UseEmitComposerScrollEventsOptions};
