import type {HostInstance} from 'react-native';
import type {NodeHandle} from 'react-native/Libraries/ReactNative/RendererProxy';

/** Don't add new `findNodeHandle` usages, this is only a temporary solution. We're going to remove the function in the future */
// The web stub keeps the native signature so callers typecheck the same way, but it never reads the argument
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findNodeHandle(componentOrHandle: null | number | HostInstance): null | NodeHandle {
    // eslint-disable-next-line no-console
    console.warn('findNodeHandle is not supported on web. Use the ref property of the component instead.');
    return null;
}

export default findNodeHandle;
