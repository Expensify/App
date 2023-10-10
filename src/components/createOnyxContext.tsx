import React, {ComponentType, ForwardRefExoticComponent, ForwardedRef, ReactNode, RefAttributes, createContext, forwardRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import {OnyxCollectionKey, OnyxKey, OnyxKeyValue, OnyxValues} from '../ONYXKEYS';

type OnyxKeys = (OnyxKey | OnyxCollectionKey) & keyof OnyxValues;

// Provider types
type ProviderOnyxProps<TOnyxKey extends OnyxKeys> = Record<TOnyxKey, OnyxKeyValue<TOnyxKey>>;

type ProviderProps = {
    /** Rendered child component */
    children: ReactNode;
};

type ProviderPropsWithOnyx<TOnyxKey extends OnyxKeys> = ProviderProps & ProviderOnyxProps<TOnyxKey>;

// withOnyxKey types
type WrappedComponentProps<TOnyxKey extends OnyxKeys, TNewOnyxKey extends string = TOnyxKey, TTransformedValue = OnyxKeyValue<TOnyxKey>> = Omit<ProviderPropsWithOnyx<TOnyxKey>, TOnyxKey> &
    Record<TNewOnyxKey, TTransformedValue>;

type WithOnyxKeyProps<TOnyxKey extends OnyxKeys, TNewOnyxKey extends string = TOnyxKey, TTransformedValue = OnyxKeyValue<TOnyxKey>> = {
    propName?: TOnyxKey | TNewOnyxKey;
    transformValue?: (value: OnyxKeyValue<TOnyxKey>, props: ProviderProps) => TTransformedValue;
};

type WithOnyxKey<TOnyxKey extends OnyxKeys> = <TNewOnyxKey extends string = TOnyxKey, TTransformedValue = OnyxKeyValue<TOnyxKey>>(
    props?: WithOnyxKeyProps<TOnyxKey, TNewOnyxKey, TTransformedValue>,
) => (
    WrappedComponent: ComponentType<WrappedComponentProps<TOnyxKey, TNewOnyxKey, TTransformedValue>>,
) => ForwardRefExoticComponent<ProviderProps & RefAttributes<ComponentType<WrappedComponentProps<TOnyxKey, TNewOnyxKey, TTransformedValue>>>>;

// createOnyxContext return type
type CreateOnyxContext<TOnyxKey extends OnyxKeys> = [WithOnyxKey<TOnyxKey>, ComponentType<Omit<ProviderPropsWithOnyx<TOnyxKey>, TOnyxKey>>, React.Context<OnyxKeyValue<TOnyxKey>>];

export default <TOnyxKey extends OnyxKeys>(onyxKeyName: TOnyxKey, defaultValue: OnyxKeyValue<TOnyxKey> = null): CreateOnyxContext<TOnyxKey> => {
    const Context = createContext(defaultValue);
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
        return (WrappedComponent: ComponentType<WrappedComponentProps<TOnyxKey, TNewOnyxKey, TTransformedValue>>) => {
            function Consumer(props: ProviderProps, ref: ForwardedRef<ComponentType<WrappedComponentProps<TOnyxKey, TNewOnyxKey, TTransformedValue>>>): ReactNode {
                return (
                    <Context.Consumer>
                        {(value) => {
                            const propsToPass = {
                                ...props,
                                [propName ?? onyxKeyName]: (transformValue ? transformValue(value, props) : value) ?? defaultValue,
                            };

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

    return [withOnyxKey, ProviderWithOnyx, Context];
};
