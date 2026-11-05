import {createContext} from 'react';

/** Elements mounted outside the screens below, which their focus traps must still let Tab reach, e.g. the RHP resize handle beside the RHP's cards. */
const FocusTrapExtraContainersContext = createContext<HTMLElement[]>([]);

export default FocusTrapExtraContainersContext;
