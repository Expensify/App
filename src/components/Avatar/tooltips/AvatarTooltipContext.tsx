import type {PropsWithChildren} from 'react';

import React, {createContext, useContext} from 'react';

const AvatarTooltipsDisabledContext = createContext(false);

type AvatarTooltipsDisabledProps = PropsWithChildren<{
    /** Whether to suppress the tooltips. Lets a caller keep the wrapper in place while deciding per render */
    isDisabled?: boolean;
}>;

/** Suppresses `AvatarTooltip` and `AvatarNamesTooltip` for every avatar rendered inside. */
function AvatarTooltipsDisabled({isDisabled = true, children}: AvatarTooltipsDisabledProps) {
    return <AvatarTooltipsDisabledContext.Provider value={isDisabled}>{children}</AvatarTooltipsDisabledContext.Provider>;
}

function useAreAvatarTooltipsDisabled(): boolean {
    return useContext(AvatarTooltipsDisabledContext);
}

export {AvatarTooltipsDisabled, useAreAvatarTooltipsDisabled};
