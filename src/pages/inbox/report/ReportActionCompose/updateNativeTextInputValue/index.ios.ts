import type UpdateNativeTextInputValue from './types';

// We need to manually update the native text prop on iOS platforms,
// in order to force a re-calculation of the composer height and layout,
// when the composer changes in or out of edit mode.
const updateNativeTextInputValue: UpdateNativeTextInputValue = ({text, shouldForceNativeValueUpdate, composerRef}) => {
    if (!shouldForceNativeValueUpdate) {
        return;
    }

    composerRef.current?.setNativeProps({text});
};

export default updateNativeTextInputValue;
