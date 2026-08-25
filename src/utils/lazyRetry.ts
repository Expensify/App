import type {ComponentType} from 'react';

import retryDynamicImport from './retryDynamicImport';

type Import<T> = Promise<{default: T}>;
type ComponentImport<T> = () => Import<T>;

/**
 * Attempts to lazily import a React component with a graduated retry strategy — see
 * `retryDynamicImport`, which owns the recovery ladder. A rejection here propagates out of the
 * `React.lazy` factory, which React converts into a render-phase throw caught by `BaseErrorBoundary`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ComponentType requires any for the generic constraint to accept all component shapes
const lazyRetry = function <T extends ComponentType<any>>(componentImport: ComponentImport<T>, retryKey: string): Import<T> {
    return retryDynamicImport(componentImport, retryKey);
};

export default lazyRetry;
