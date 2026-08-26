import type {PropsWithChildren} from 'react';

import React, {createContext, useContext} from 'react';

const AvatarTooltipsContext = createContext(true);

type AvatarTooltipsProviderProps = PropsWithChildren<{
    /** Whether the tooltips are shown. Lets a caller keep the provider in place while deciding per render */
    isEnabled?: boolean;
}>;

/** Enables or suppresses `AvatarTooltip` and `AvatarNamesTooltip` for every avatar rendered inside.
 * Mounted once at the app root with tooltips enabled, and nested by any subtree that needs to override that.
 */
function AvatarTooltipsProvider({isEnabled = true, children}: AvatarTooltipsProviderProps) {
    return <AvatarTooltipsContext.Provider value={isEnabled}>{children}</AvatarTooltipsContext.Provider>;
}

function useAreAvatarTooltipsEnabled(): boolean {
    return useContext(AvatarTooltipsContext);
}

export {AvatarTooltipsProvider, useAreAvatarTooltipsEnabled};
