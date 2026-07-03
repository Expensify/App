import type {HeadingState} from '@components/Overlay/createHeadingSystem';

import {useId, useState} from 'react';

function useHeadingState(): HeadingState {
    const titleId = useId();
    const descriptionId = useId();
    const contentId = useId();
    const [titleCount, setTitleCount] = useState(0);
    const [descriptionCount, setDescriptionCount] = useState(0);

    const registerTitle = () => {
        setTitleCount((count) => count + 1);
        return () => setTitleCount((count) => count - 1);
    };
    const registerDescription = () => {
        setDescriptionCount((count) => count + 1);
        return () => setDescriptionCount((count) => count - 1);
    };

    return {
        titleId,
        descriptionId,
        contentId,
        hasTitle: titleCount > 0,
        hasDescription: descriptionCount > 0,
        registerTitle,
        registerDescription,
    };
}

export default useHeadingState;
