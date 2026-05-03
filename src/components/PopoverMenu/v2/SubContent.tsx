import React from 'react';
import type {ReactNode} from 'react';
import {useContentNavigation} from './ContentContext';
import SubBackButton from './SubBackButton';
import {getParentSubID, useSubContext} from './SubContext';

type SubContentProps = {
    children: ReactNode;
    backButtonText?: string;
};

/** Renders the back button at active level; keeps children mounted at ancestor levels so nested `<Sub>` stays alive. */
function SubContent({children, backButtonText}: SubContentProps): React.ReactElement | null {
    // Resolved first so a "<Sub.Content> outside <Sub>" failure beats the also-true "outside <Content>" message
    // — Sub is the closer hierarchical neighbor and the more actionable hint.
    const subContext = useSubContext(SubContent.displayName);
    const {currentSubID, currentSubAncestorChain} = useContentNavigation(SubContent.displayName);

    const isActiveLevel = currentSubID === subContext.subID;
    const isAncestorOfActive = currentSubAncestorChain.includes(subContext.subID);

    if (!isActiveLevel && !isAncestorOfActive) {
        return null;
    }

    return (
        <>
            {isActiveLevel && (
                <SubBackButton
                    backButtonText={backButtonText}
                    parentSubID={getParentSubID(subContext)}
                />
            )}
            {children}
        </>
    );
}

SubContent.displayName = 'PopoverMenu.Sub.Content';

export default SubContent;
export type {SubContentProps};
