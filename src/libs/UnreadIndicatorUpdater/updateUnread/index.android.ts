import type UpdateUnread from './types';

// Android does not yet implement this
const updateUnread: UpdateUnread = () => {};

// No-op on native — document title is a web-only concept
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setPageTitle(_title: string) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setShouldShowBranchNameInTitle(_value: boolean) {}

export default updateUnread;
export {setPageTitle, setShouldShowBranchNameInTitle};
