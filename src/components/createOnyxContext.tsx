import {Str} from 'expensify-common';
import type {ComponentType, ForwardedRef, ForwardRefExoticComponent, PropsWithoutRef, ReactNode, RefAttributes} from 'react';
import React, {createContext, forwardRef, useContext} from 'react';
import type {OnyxValue} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {OnyxKey} from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

// Provider types
type ProviderOnyxProps<TOnyxKey extends OnyxKey> = Record<TOnyxKey, OnyxValue<TOnyxKey>>;

type ProviderPropsWithOnyx<TOnyxKey extends OnyxKey> = ChildrenProps & ProviderOnyxProps<TOnyxKey>;

// withOnyxKey types
type WithOnyxKeyProps<TOnyxKey extends OnyxKey, TNewOnyxKey extends string, TTransformedValue> = {
    propName?: TOnyxKey | TNewOnyxKey;
    // It's not possible to infer the type of props of the wrapped component, so we have to use `any` here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformValue?: (value: OnyxValue<TOnyxKey>, props: any) => TTransformedValue;
};

type WrapComponentWithConsumer<TNewOnyxKey extends string, TTransformedValue> = <TProps extends Record<TNewOnyxKey, TTransformedValue>, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
) => ForwardRefExoticComponent<PropsWithoutRef<Omit<TProps, TNewOnyxKey>> & RefAttributes<TRef>>;

type WithOnyxKey<TOnyxKey extends OnyxKey> = <TNewOnyxKey extends string = TOnyxKey, TTransformedValue = OnyxValue<TOnyxKey>>(
    props?: WithOnyxKeyProps<TOnyxKey, TNewOnyxKey, TTransformedValue>,
) => WrapComponentWithConsumer<TNewOnyxKey, TTransformedValue>;

// createOnyxContext return type
type CreateOnyxContext<TOnyxKey extends OnyxKey> = [
    WithOnyxKey<TOnyxKey>,
    ComponentType<Omit<ProviderPropsWithOnyx<TOnyxKey>, TOnyxKey>>,
    React.Context<OnyxValue<TOnyxKey>>,
    () => OnyxValue<TOnyxKey>,
];

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

    function withOnyxKey<TNewOnyxKey extends string = TOnyxKey, TTransformedValue = OnyxValue<TOnyxKey>>({
        propName,
        transformValue,
    }: WithOnyxKeyProps<TOnyxKey, TNewOnyxKey, TTransformedValue> = {}) {
        return <TProps extends Record<TNewOnyxKey, TTransformedValue>, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) => {
            function Consumer(props: Omit<TProps, TNewOnyxKey>, ref: ForwardedRef<TRef>): ReactNode {
                return (
                    <Context.Consumer>
                        {(value) => {
                            const propsToPass = {
                                ...props,
                                [propName ?? onyxKeyName]: transformValue ? transformValue(value, props) : value,
                            } as TProps;

                            return (
                                <WrappedComponent
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    {...propsToPass}
                                    ref={ref}
                                />
                            );
                        }}
                    </Context.Consumer>
                );
            }

            Consumer.displayName = `with${Str.UCFirst(onyxKeyName)}(${getComponentDisplayName(WrappedComponent)})`;
            return forwardRef(Consumer);
        };
    }

    const useOnyxContext = () => {
        const value = useContext(Context);
        if (value === null) {
            throw new Error(`useOnyxContext must be used within a OnyxProvider [key: ${onyxKeyName}]`);
        }
        return value as OnyxValue<TOnyxKey>;
    };

    return [withOnyxKey, ProviderWithOnyx, Context, useOnyxContext];
};
