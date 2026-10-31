import {createContext, useContext} from 'react';

// True while the screen is a wide submit pre-mount still hidden under the current screen. It may load its data,
// but effects the user would notice, such as marking the report as read, wait until it is revealed.
const IsHiddenWideTabPreMountContext = createContext(false);

function useIsHiddenWideTabPreMount(): boolean {
    return useContext(IsHiddenWideTabPreMountContext);
}

export default useIsHiddenWideTabPreMount;
export {IsHiddenWideTabPreMountContext};
