import type PreparePrefetchRequest from './types';

const NOOP: PreparePrefetchRequest = () => ({});

const preparePrefetchRequest = NOOP;

export default preparePrefetchRequest;
