import React from 'react';
import {useInitial} from './useInitial';

const ComponentPreviews = React.lazy(() => import('./previews'));

export {
    ComponentPreviews,
    useInitial,
};
