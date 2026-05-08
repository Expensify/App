import React from 'react';
import type {ReactNode} from 'react';
import {useContentNavigation} from '@components/PopoverMenu/v2/content/ContentContext';
import SubBackButton from './SubBackButton';
import {useSubContext} from './SubContext';

type SubContentProps = {
    children: ReactNode;
    /** Auto-rendered back-button text. Ignored when an explicit `<Sub.BackButton>` is among children. */
    backButtonText?: string;
};

/** Stays mounted at ancestor levels so nested `<Sub>` instances live across drill-downs. */
function SubContent({children, backButtonText}: SubContentProps): React.ReactElement | null {
    // Resolve Sub first — closer-neighbor error wins over the also-true "outside <Content>".
    const subContext = useSubContext(SubContent.displayName);
    const {currentSubID, isAncestorOfCurrent} = useContentNavigation(SubContent.displayName);

    const isActiveLevel = currentSubID === subContext.subID;
    const isAncestorOfActive = isAncestorOfCurrent(subContext.subID);

    if (!isActiveLevel && !isAncestorOfActive) {
        return null;
    }

    const hasExplicitBackButton = React.Children.toArray(children).some((child) => React.isValidElement(child) && child.type === SubBackButton);

    return (
        <>
            {isActiveLevel && !hasExplicitBackButton && <SubBackButton text={backButtonText} />}
            {children}
        </>
    );
}

SubContent.displayName = 'PopoverMenu.SubContent';

export default SubContent;
export type {SubContentProps};
