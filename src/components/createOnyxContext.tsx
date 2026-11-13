import useOnyx from '@hooks/useOnyx';

import type {OnyxKey} from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ComponentType, Context, ReactNode} from 'react';
import type {OnyxValue, UseOnyxResult} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React, {createContext, useContext} from 'react';

type OnyxContextValue<TOnyxKey extends OnyxKey> = UseOnyxResult<OnyxValue<TOnyxKey>>[0];

// createOnyxContext return type
type CreateOnyxContext<TOnyxKey extends OnyxKey> = [ComponentType<ChildrenProps>, Context<OnyxContextValue<TOnyxKey> | null>, () => OnyxContextValue<TOnyxKey>];

type OnyxContextProviderImplProps<TOnyxKey extends OnyxKey> = ChildrenProps & {
    onyxKeyName: TOnyxKey;
    Context: Context<OnyxContextValue<TOnyxKey> | null>;
};

function OnyxContextProviderImpl<TOnyxKey extends OnyxKey>({onyxKeyName, Context: OnyxContext, children}: OnyxContextProviderImplProps<TOnyxKey>): ReactNode {
    const [value] = useOnyx(onyxKeyName);
    return <OnyxContext.Provider value={value}>{children}</OnyxContext.Provider>;
}

export default <TOnyxKey extends OnyxKey>(onyxKeyName: TOnyxKey): CreateOnyxContext<TOnyxKey> => {
    const Context = createContext<OnyxContextValue<TOnyxKey> | null>(null);
    function Provider(props: ChildrenProps): ReactNode {
        return (
            <OnyxContextProviderImpl
                onyxKeyName={onyxKeyName}
                Context={Context}
                {...props}
            />
        );
    }

    Provider.displayName = `${Str.UCFirst(onyxKeyName)}Provider`;

    const useOnyxContext = () => {
        const value = useContext(Context);
        if (value === null) {
            throw new Error(`useOnyxContext must be used within a OnyxListItemProvider [key: ${onyxKeyName}]`);
        }
        return value;
    };

    return [Provider, Context, useOnyxContext];
};
