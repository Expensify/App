import type React from 'react';
import type {Freeze as FreezeComponent} from 'react-freeze';

const Freeze: typeof FreezeComponent = (props) => props.children as React.JSX.Element;

export {
    // eslint-disable-next-line import/prefer-default-export
    Freeze,
};
