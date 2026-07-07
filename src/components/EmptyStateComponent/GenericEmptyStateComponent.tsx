import React from 'react';

import type {GenericEmptyStateComponentProps} from './types';

import EmptyStateComponent from '.';

// Only use this component when you need to pass/spread the props in a generic way, as
// EmptyStateComponent component wouldn't allow it in some cases.
function GenericEmptyStateComponent(props: GenericEmptyStateComponentProps) {
    return <EmptyStateComponent {...props} />;
}

export default GenericEmptyStateComponent;
