import React, {Children, isValidElement} from 'react';
import type {ReactNode} from 'react';
import {PositionContext} from './PositionContext';

type PositionedChildrenProps = {
    children: ReactNode;
};

// Captures each child's JSX index so descriptors register in source order regardless of mount timing.
function PositionedChildren({children}: PositionedChildrenProps): React.ReactElement {
    const childArray = Children.toArray(children);
    return (
        <>
            {childArray.map((child, index) => {
                if (!isValidElement(child)) {
                    return child;
                }
                const positionKey = child.key ?? `__position_${index}`;
                return (
                    <PositionContext.Provider
                        key={positionKey}
                        value={index}
                    >
                        {child}
                    </PositionContext.Provider>
                );
            })}
        </>
    );
}

export default PositionedChildren;
