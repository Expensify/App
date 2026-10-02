import {createContext, useContext} from 'react';

// True while the screen is a wide submit pre-mount still hidden under the current screen. It may load its data,
// but work that assumes the user is looking, such as marking the report read, waits for the reveal.
const IsHiddenWideTabPreMountContext = createContext(false);

function useIsHiddenWideTabPreMount(): boolean {
    return useContext(IsHiddenWideTabPreMountContext);
}

export default useIsHiddenWideTabPreMount;
export {IsHiddenWideTabPreMountContext};
