import type AddLogContext from './types';
import type {SetActiveTab} from './types';

const addLogContext: AddLogContext = (message) => message;

const setActiveTab: SetActiveTab = () => {};

export {addLogContext, setActiveTab};
export type {AddLogContext};
