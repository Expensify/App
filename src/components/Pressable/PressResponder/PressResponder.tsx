import React from 'react';
import type {ReactNode} from 'react';
import PressResponderContext from './PressResponderContext';
import type {PressResponderContextValue} from './PressResponderContext';

type PressResponderProps = PressResponderContextValue & {
    children: ReactNode;
};

function PressResponder({children, ...value}: PressResponderProps): React.ReactElement {
    return <PressResponderContext.Provider value={value}>{children}</PressResponderContext.Provider>;
}

export default PressResponder;
export type {PressResponderProps};
