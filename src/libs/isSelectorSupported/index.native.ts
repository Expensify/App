import IsSelectorSupported from './types';

// Native platforms do not support the selector
const isSelectorSupported: IsSelectorSupported = () => false;

export default isSelectorSupported;
