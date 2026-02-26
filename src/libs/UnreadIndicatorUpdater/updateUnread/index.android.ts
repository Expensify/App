import type UpdateUnread from './types';

// Android does not yet implement this
const updateUnread: UpdateUnread = () => {};

// Page title management is not applicable on native platforms
const setPageTitle = () => {};

export default updateUnread;
export {setPageTitle};
