import React from 'react';
import {createCallable} from 'react-call';
import type {Callable, CallContext, PropsWithCall} from 'react-call';
import type {DialogKind, DialogResponse} from './actions';
import {EXIT_ANIMATION_DELAY_MS} from './constants';
import DialogErrorBoundary from './DialogErrorBoundary';

type DialogCall<Props> = CallContext<Props, DialogResponse, Record<string, never>>;

type DialogInner<Props> = React.ComponentType<Props & {call: DialogCall<Props>}>;

function createDialogCallable<Props>(kind: DialogKind, Inner: DialogInner<Props>): Callable<Props, DialogResponse, Record<string, never>> {
    function CallableBody({call, ...rest}: PropsWithCall<Props, DialogResponse, Record<string, never>>) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `PropsWithCall<P>` is `P & {call}`; removing `call` leaves exactly `P`.
        const innerProps = rest as Props;
        return (
            <DialogErrorBoundary
                call={call}
                kind={kind}
            >
                <Inner
                    call={call}
                    {...innerProps}
                />
            </DialogErrorBoundary>
        );
    }
    const Callable = createCallable<Props, DialogResponse>(CallableBody, EXIT_ANIMATION_DELAY_MS);
    Callable.displayName = kind;
    return Callable;
}

export default createDialogCallable;
