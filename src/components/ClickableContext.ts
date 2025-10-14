import {createContext} from 'react';

type ClickableContextType = Record<string, () => void>;
const ClickableContext = createContext<ClickableContextType>({});

export default ClickableContext;
