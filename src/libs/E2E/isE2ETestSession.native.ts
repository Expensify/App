import CONFIG from '@src/CONFIG';
import type {IsE2ETestSession} from './types';

const isE2ETestSession: IsE2ETestSession = () => CONFIG.E2E_TESTING;

export default isE2ETestSession;
