import type UpdateUnread from './types';

// Android does not yet implement this
const updateUnread: UpdateUnread = () => {};

// Page title management is not applicable on native platforms
const setPageTitle = () => {};
const getPageTitle = () => '';

export default updateUnread;
export {setPageTitle, getPageTitle};
