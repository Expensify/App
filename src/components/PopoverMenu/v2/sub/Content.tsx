import type {ReactNode} from 'react';
import {useContent} from '@components/PopoverMenu/v2/content/ContentContext';
import {useSubContext} from './context';

type SubContentProps = {
    children: ReactNode;
};

function SubContent({children}: SubContentProps): ReactNode {
    const subContext = useSubContext(SubContent.displayName);
    const {currentSubID, isAncestorOfCurrent} = useContent(SubContent.displayName).state;

    if (currentSubID !== subContext.subID && !isAncestorOfCurrent(subContext.subID)) {
        return null;
    }

    return children;
}

SubContent.displayName = 'PopoverMenu.Sub.Content';

export default SubContent;
export type {SubContentProps};
