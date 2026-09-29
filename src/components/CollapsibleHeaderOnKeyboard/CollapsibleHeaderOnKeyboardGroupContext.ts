import type {SharedValue} from 'react-native-reanimated';

import {createContext, useContext} from 'react';

type CollapsibleHeaderOnKeyboardGroupContextValue = {
    /** True while every member of the group has to be collapsed. */
    shouldCollapse: SharedValue<boolean>;

    /** Reports a member's natural (expanded) height, so the group can decide from the combined total of its members. */
    setMemberNaturalHeight: (memberID: string, height: number) => void;

    /** Drops a member's contribution to the total when it unmounts. */
    unregisterMember: (memberID: string) => void;
};

const CollapsibleHeaderOnKeyboardGroupContext = createContext<CollapsibleHeaderOnKeyboardGroupContextValue | undefined>(undefined);

function useCollapsibleHeaderOnKeyboardGroup() {
    return useContext(CollapsibleHeaderOnKeyboardGroupContext);
}

export default CollapsibleHeaderOnKeyboardGroupContext;
export {useCollapsibleHeaderOnKeyboardGroup};
export type {CollapsibleHeaderOnKeyboardGroupContextValue};
