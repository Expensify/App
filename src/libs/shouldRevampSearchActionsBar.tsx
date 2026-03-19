import {isDevelopment, isStaging} from './Environment/Environment';

export default () => isStaging() || isDevelopment();
