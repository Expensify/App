import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import Log from '@libs/Log';
import {DialogActions} from './actions';
import type {DialogKind, DialogResponse} from './actions';

type CallEnder = {end: (response: DialogResponse) => void};

const renderNullFallback = () => null;

type DialogErrorBoundaryProps = {
    call: CallEnder;
    kind: DialogKind;
    children: React.ReactNode;
};

function DialogErrorBoundary({call, kind, children}: DialogErrorBoundaryProps) {
    return (
        <ErrorBoundary
            fallbackRender={renderNullFallback}
            onError={(error, info) => {
                Log.alert(`[Dialog/${kind}] threw during render`, {error: String(error), componentStack: info.componentStack ?? ''});
                call.end({action: DialogActions.ERROR});
            }}
        >
            {children}
        </ErrorBoundary>
    );
}

export default DialogErrorBoundary;
