import type {LayoutChangeEvent} from 'react-native';

type StableListWidthResult = {
    /** A fixed, scrollbar-independent content width (in px) to pin a list's content container to. `undefined` when not applicable (e.g. native). */
    stableListWidth: number | undefined;

    /** Captures the list's stable border-box width from its `onLayout` event. */
    onStableListLayout: (event: LayoutChangeEvent) => void;
};

export default StableListWidthResult;
