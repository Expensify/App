import type CanPersistRequest from './types';

// A receipt on native points to a file in the app's own folder, and prepareRequestPayload rebuilds the upload from
// its path, so a stored request still uploads after a restart. Skipping it would lose a receipt the app was sending.
const canPersistRequest: CanPersistRequest = () => true;

export default canPersistRequest;
