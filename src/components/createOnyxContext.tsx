import React, {ComponentType, ForwardRefExoticComponent, ForwardedRef, PropsWithoutRef, ReactNode, RefAttributes, createContext, forwardRef, useContext} from 'react';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import {OnyxCollectionKey, OnyxKey, OnyxKeyValue, OnyxValues} from '../ONYXKEYS';
import ChildrenProps from '../types/utils/ChildrenProps';

type OnyxKeys = (OnyxKey | OnyxCollectionKey) & keyof OnyxValues;

// Provider types
type ProviderOnyxProps<TOnyxKey extends OnyxKeys> = Record<TOnyxKey, OnyxKeyValue<TOnyxKey>>;

type ProviderPropsWithOnyx<TOnyxKey extends OnyxKeys> = ChildrenProps & ProviderOnyxProps<TOnyxKey>;

// withOnyxKey types
type WithOnyxKeyProps<TOnyxKey extends OnyxKeys, TNewOnyxKey extends string, TTransformedValue> = {
    propName?: TOnyxKey | TNewOnyxKey;
    // It's not possible to infer the type of props of the wrapped component, so we have to use `any` here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformValue?: (value: OnyxKeyValue<TOnyxKey>, props: any) => TTransformedValue;
};

type WrapComponentWithConsumer<TNewOnyxKey extends string, TTransformedValue> = <TProps extends Record<TNewOnyxKey, TTransformedValue>, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
) => ForwardRefExoticComponent<PropsWithoutRef<Omit<TProps, TNewOnyxKey>> & RefAttributes<TRef>>;

type WithOnyxKey<TOnyxKey extends OnyxKeys> = <TNewOnyxKey extends string = TOnyxKey, TTransformedValue = OnyxKeyValue<TOnyxKey>>(
    props?: WithOnyxKeyProps<TOnyxKey, TNewOnyxKey, TTransformedValue>,
) => WrapComponentWithConsumer<TNewOnyxKey, TTransformedValue>;

// createOnyxContext return type
type CreateOnyxContext<TOnyxKey extends OnyxKeys> = [
    WithOnyxKey<TOnyxKey>,
    ComponentType<Omit<ProviderPropsWithOnyx<TOnyxKey>, TOnyxKey>>,
    React.Context<OnyxKeyValue<TOnyxKey>>,
    () => OnyxValues[TOnyxKey],
];

export default <TOnyxKey extends OnyxKeys>(onyxKeyName: TOnyxKey): CreateOnyxContext<TOnyxKey> => {
    const Context = createContext<OnyxKeyValue<TOnyxKey>>(null);
    function Provider(props: ProviderPropsWithOnyx<TOnyxKey>): ReactNode {
        return <Context.Provider value={props[onyxKeyName]}>{props.children}</Context.Provider>;
    }

    Provider.displayName = `${Str.UCFirst(onyxKeyName)}Provider`;

    const ProviderWithOnyx = withOnyx<ProviderPropsWithOnyx<TOnyxKey>, ProviderOnyxProps<TOnyxKey>>({
        [onyxKeyName]: {
            key: onyxKeyName,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as Record<TOnyxKey, any>)(Provider);

    function withOnyxKey<TNewOnyxKey extends string = TOnyxKey, TTransformedValue = OnyxKeyValue<TOnyxKey>>({
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
        return value;
    };

    return [withOnyxKey, ProviderWithOnyx, Context, useOnyxContext];
};
