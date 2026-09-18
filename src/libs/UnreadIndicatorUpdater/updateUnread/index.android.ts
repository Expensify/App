import type UpdateUnread from './types';

// Android does not yet implement this
const updateUnread: UpdateUnread = () => {};

// No-op on native — document title is a web-only concept
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setPageTitle(_title: string) {}

// Native badges only update when the ordinary unread count changes.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setUnreadUpdateCallback(_callback: () => void) {}

export default updateUnread;
export {setPageTitle, setUnreadUpdateCallback};
