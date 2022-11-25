import _ from 'underscore';
import updateUnread from './updateUnread';

/**
 * Updates the title and favicon of the current browser tab and Mac OS or iOS dock icon with an unread indicator.
 * Note: We are throttling this since listening for report changes can trigger many updates depending on how many reports
 * a user has and how often they are updated.
 */
const throttledUpdatePageTitleAndUnreadCount = _.throttle(updateUnread, 100, {leading: false});

export default {
    throttledUpdatePageTitleAndUnreadCount,
};
