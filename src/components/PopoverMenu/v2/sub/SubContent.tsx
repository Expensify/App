import type {ReactNode} from 'react';
import {useContentNavigation} from '@components/PopoverMenu/v2/content/ContentContext';
import {useSubContext} from './SubContext';

type SubContentProps = {
    children: ReactNode;
};

/** Stays mounted at ancestor levels so nested `<Sub>` instances live across drill-downs. */
function SubContent({children}: SubContentProps): ReactNode {
    // Resolve Sub first — closer-neighbor error wins over the also-true "outside <Content>".
    const subContext = useSubContext(SubContent.displayName);
    const {currentSubID, isAncestorOfCurrent} = useContentNavigation(SubContent.displayName);

    if (currentSubID !== subContext.subID && !isAncestorOfCurrent(subContext.subID)) {
        return null;
    }

    return children;
}

SubContent.displayName = 'PopoverMenu.Sub.Content';

export default SubContent;
export type {SubContentProps};
