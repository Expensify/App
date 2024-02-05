import type {Add, ClearAll, ClearByKey} from './types';

const add: Add = () => Promise.resolve();

const clearByKey: ClearByKey = () => {};

const clearAll: ClearAll = () => {};

export {add, clearByKey, clearAll};
