import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {PropsWithChildren} from 'react';

import React, {createContext, useContext} from 'react';

type AvatarPress = {
    /** Called with the pressed avatar's icon */
    onAvatarPress: (avatar: Icon) => void;

    /** Sentry label for every press target */
    sentryLabel: string;
};

const AvatarPressContext = createContext<AvatarPress | undefined>(undefined);

type AvatarPressProviderProps = PropsWithChildren<AvatarPress>;

/**
 * Makes each avatar of `SingleAvatar`, `SubscriptAvatar` and `DiagonalAvatars` below it a press target.
 * Wrap only the avatar: it reaches the whole subtree, list rows included.
 */
function AvatarPressProvider({onAvatarPress, sentryLabel, children}: AvatarPressProviderProps) {
    return <AvatarPressContext.Provider value={{onAvatarPress, sentryLabel}}>{children}</AvatarPressContext.Provider>;
}

function useAvatarPress(): AvatarPress | undefined {
    return useContext(AvatarPressContext);
}

export {AvatarPressProvider, useAvatarPress};
