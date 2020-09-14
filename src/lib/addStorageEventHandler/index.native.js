/**
 * Native clients don't have storage events and that's OK because
 * you can't have multiple native clients open at the same time on the same
 * device
 */
function addStorageEventHandler() {}

export default addStorageEventHandler;
