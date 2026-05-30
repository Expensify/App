import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** The active Inbox tab filter (All, To-do, or Unread) */
type InboxTab = ValueOf<typeof CONST.INBOX_TAB>;

export default InboxTab;
