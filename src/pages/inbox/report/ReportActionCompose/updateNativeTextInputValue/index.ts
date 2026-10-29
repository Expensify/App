import type UpdateNativeTextInputValue from './types';

const noop = () => undefined;

// We don't need to manually update the native text prop on non-iOS platforms
const updateNativeTextInputValue: UpdateNativeTextInputValue = noop;

export default updateNativeTextInputValue;
