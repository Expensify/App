import useOnyx from '@hooks/useOnyx';

import type {OnyxKey} from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ComponentType, Context, ReactNode} from 'react';
import type {OnyxValue} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React, {createContext, useContext} from 'react';

// createOnyxContext return type
type CreateOnyxContext<TOnyxKey extends OnyxKey> = [ComponentType<ChildrenProps>, React.Context<OnyxValue<TOnyxKey>>, () => OnyxValue<TOnyxKey>];

type OnyxContextProviderImplProps<TOnyxKey extends OnyxKey> = ChildrenProps & {
    onyxKeyName: TOnyxKey;
    Context: Context<OnyxValue<TOnyxKey>>;
};

function OnyxContextProviderImpl<TOnyxKey extends OnyxKey>({onyxKeyName, Context: OnyxContext, children}: OnyxContextProviderImplProps<TOnyxKey>): ReactNode {
    const [value] = useOnyx(onyxKeyName);
    return <OnyxContext.Provider value={value as OnyxValue<TOnyxKey>}>{children}</OnyxContext.Provider>;
}

export default <TOnyxKey extends OnyxKey>(onyxKeyName: TOnyxKey): CreateOnyxContext<TOnyxKey> => {
    const Context = createContext<OnyxValue<TOnyxKey>>(null as OnyxValue<TOnyxKey>);
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
        return value as OnyxValue<TOnyxKey>;
    };

    return [Provider, Context, useOnyxContext];
};
