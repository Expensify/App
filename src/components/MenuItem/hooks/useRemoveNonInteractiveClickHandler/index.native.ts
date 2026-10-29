import type UseRemoveNonInteractiveClickHandler from './types';

// This is a web-only workaround for how react-native-web and React DOM set up `onclick`, so there is nothing to do on native.
const useRemoveNonInteractiveClickHandler: UseRemoveNonInteractiveClickHandler = () => {};

export default useRemoveNonInteractiveClickHandler;
