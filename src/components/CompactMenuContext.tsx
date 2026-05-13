import {createContext, useContext} from 'react';

const CompactMenuContext = createContext(false);

function useIsCompactMenu() {
    return useContext(CompactMenuContext);
}

export default CompactMenuContext;
export {useIsCompactMenu};
