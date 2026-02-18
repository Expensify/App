import React from 'react';
import EmptyStateComponent from '.';
import type {EmptyStateComponentProps, GenericEmptyStateComponentProps} from './types';

// Only use this component when you need to pass/spread the props in a generic way, as
// EmptyStateComponent component wouldn't allow it in some cases.
function GenericEmptyStateComponent(props: GenericEmptyStateComponentProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <EmptyStateComponent {...(props as EmptyStateComponentProps)} />;
}

export default GenericEmptyStateComponent;
