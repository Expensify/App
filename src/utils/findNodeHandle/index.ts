import type {Component, ComponentClass} from 'react';
import type {NodeHandle} from 'react-native/Libraries/ReactNative/RendererProxy';

/** Don't add new `findNodeHandle` usages, this is only a temporary solution. We're going to remove the function in the future */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
function findNodeHandle(componentOrHandle: null | number | Component<any, any> | ComponentClass<any>): null | NodeHandle {
    // eslint-disable-next-line no-console
    console.warn('findNodeHandle is not supported on web. Use the ref property of the component instead.');
    return null;
}

export default findNodeHandle;
