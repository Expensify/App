import {Str} from 'expensify-common';
import type {ComponentType, ReactNode} from 'react';
import React, {createContext, useContext} from 'react';
import type {OnyxValue} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {OnyxKey} from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

// Provider types
type ProviderOnyxProps<TOnyxKey extends OnyxKey> = Record<TOnyxKey, OnyxValue<TOnyxKey>>;

type ProviderPropsWithOnyx<TOnyxKey extends OnyxKey> = ChildrenProps & ProviderOnyxProps<TOnyxKey>;

// createOnyxContext return type
type CreateOnyxContext<TOnyxKey extends OnyxKey> = [ComponentType<Omit<ProviderPropsWithOnyx<TOnyxKey>, TOnyxKey>>, React.Context<OnyxValue<TOnyxKey>>, () => OnyxValue<TOnyxKey>];

export default <TOnyxKey extends OnyxKey>(onyxKeyName: TOnyxKey): CreateOnyxContext<TOnyxKey> => {
    const Context = createContext<OnyxValue<TOnyxKey>>(null as OnyxValue<TOnyxKey>);
    function Provider(props: ProviderPropsWithOnyx<TOnyxKey>): ReactNode {
        return <Context.Provider value={props[onyxKeyName]}>{props.children}</Context.Provider>;
    }

    Provider.displayName = `${Str.UCFirst(onyxKeyName)}Provider`;
    // eslint-disable-next-line
    const ProviderWithOnyx = withOnyx<ProviderPropsWithOnyx<TOnyxKey>, ProviderOnyxProps<TOnyxKey>>({
        [onyxKeyName]: {
            key: onyxKeyName,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as Record<TOnyxKey, any>)(Provider);

    const useOnyxContext = () => {
        const value = useContext(Context);
        if (value === null) {
            throw new Error(`useOnyxContext must be used within a OnyxProvider [key: ${onyxKeyName}]`);
        }
        return value as OnyxValue<TOnyxKey>;
    };

    return [ProviderWithOnyx, Context, useOnyxContext];
};
