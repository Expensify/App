import type {RefObject} from 'react';
import type {ComposerRef} from '@components/Composer/types';

type UpdateNativeTextInputValueProps = {
    /** The text to update */
    text: string;
    /** Whether to force a native value update */
    shouldForceNativeValueUpdate: boolean;
    /** The ref to the composer */
    composerRef: RefObject<ComposerRef | null>;
};

type UpdateNativeTextInputValue = (props: UpdateNativeTextInputValueProps) => void;

export default UpdateNativeTextInputValue;
