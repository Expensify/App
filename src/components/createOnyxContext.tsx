import useOnyx from '@hooks/useOnyx';

import type {OnyxKey} from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ComponentType, ReactNode} from 'react';
import type {OnyxValue} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React, {createContext, useContext} from 'react';

// createOnyxContext return type
type CreateOnyxContext<TOnyxKey extends OnyxKey> = [ComponentType<ChildrenProps>, React.Context<OnyxValue<TOnyxKey>>, () => OnyxValue<TOnyxKey>];

export default <TOnyxKey extends OnyxKey>(onyxKeyName: TOnyxKey): CreateOnyxContext<TOnyxKey> => {
    const Context = createContext<OnyxValue<TOnyxKey>>(null as OnyxValue<TOnyxKey>);
    function Provider(props: ChildrenProps): ReactNode {
        const [value] = useOnyx(onyxKeyName);
        return <Context.Provider value={value as OnyxValue<TOnyxKey>}>{props.children}</Context.Provider>;
    }

    Provider.displayName = `${Str.UCFirst(onyxKeyName)}Provider`;

    // OXC's React Compiler does not memoize this generated Provider on web; memoize it explicitly.
    const MemoizedProvider = React.memo(Provider);

    const useOnyxContext = () => {
        const value = useContext(Context);
        if (value === null) {
            throw new Error(`useOnyxContext must be used within a OnyxListItemProvider [key: ${onyxKeyName}]`);
        }
        return value as OnyxValue<TOnyxKey>;
    };

    return [MemoizedProvider, Context, useOnyxContext];
};
