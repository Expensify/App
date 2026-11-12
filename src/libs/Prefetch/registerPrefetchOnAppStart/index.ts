import type RegisterPrefetchOnAppStart from './types';

const NOOP: RegisterPrefetchOnAppStart = () => {};

const registerPrefetchOnAppStart: RegisterPrefetchOnAppStart = NOOP;

export default registerPrefetchOnAppStart;
