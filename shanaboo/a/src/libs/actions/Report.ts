import {escape} from 'lodash';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
                        reportAction: {
                            actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
                            actorAccountID: conciergeAccountID,
                            message: [{type: CONST.REPORT.ACTIONS.MESSAGE.TYPE.TEXT, text: onboardingValues?.onboardingPolicyID ? escape(taskMessage) : ''}],
                            originalMessage: {
                                html: taskMessage,
                            },