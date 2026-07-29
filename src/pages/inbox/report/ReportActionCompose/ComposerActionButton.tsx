import React from 'react';

import ComposerActionMenu from './ComposerActionMenu';
import {useComposerEditState} from './ComposerContext';
import ComposerEditingButtons from './ComposerEditingButtons';

function ComposerActionButton() {
    const {isEditingInComposer} = useComposerEditState();

    if (isEditingInComposer) {
        return <ComposerEditingButtons />;
    }
    return <ComposerActionMenu />;
}

export default ComposerActionButton;
