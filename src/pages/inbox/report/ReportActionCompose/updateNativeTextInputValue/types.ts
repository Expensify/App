import type {ComposerRef} from '@components/Composer/types';

import type {RefObject} from 'react';

type UpdateNativeTextInputValueProps = {
    text: string;
    shouldForceNativeValueUpdate: boolean;
    composerRef: RefObject<ComposerRef | null>;
};

type UpdateNativeTextInputValue = (props: UpdateNativeTextInputValueProps) => void;

export default UpdateNativeTextInputValue;
