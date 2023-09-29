import _ from 'underscore';
import Onyx from 'react-native-onyx';
import {InteractionManager} from 'react-native';
import ONYXKEYS from '../../ONYXKEYS';
import updateUnread from './updateUnread/index';
import * as ReportUtils from '../ReportUtils';

let previousUnreadCount = 0;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reportsFromOnyx) => {
        if (!reportsFromOnyx) {
            return;
        }

        InteractionManager.runAfterInteractions(() => {
            const unreadReportsCount = _.filter(reportsFromOnyx, ReportUtils.isUnread).length || 0;
            if (previousUnreadCount !== unreadReportsCount) {
                previousUnreadCount = unreadReportsCount;
                updateUnread(unreadReportsCount);
            }
        });
    },
});
