import {createContext} from 'react';

type PortalContextValue = {
    register: (node: Element) => () => void;
};

const PortalContext = createContext<PortalContextValue | null>(null);

export {PortalContext};
export type {PortalContextValue};
