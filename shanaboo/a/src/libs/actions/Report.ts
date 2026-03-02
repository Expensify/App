import {isEmpty} from 'lodash';
import Onyx from 'react-native-onyx';
import {Str} from 'expensify-common';
import * as API from '@libs/API';
import type {AddCommentOrAttachementParams, OpenReportParams, UpdateReportParams} from '@libs/API/parameters';
import type {ConnectPolicyParams} from '@libs/API/parameters/ConnectPolicyParams';
        reportID: taskReportID,
        reportName: title,
        type: CONST.REPORT.TYPE.TASK,
        description: Str.htmlEncode(description),
        ownerAccountID: currentUserAccountID,
        managerID: assigneeAccountID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,