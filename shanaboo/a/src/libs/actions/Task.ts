import Onyx from 'react-native-onyx';
import {Str} from 'expensify-common';
import * as API from '@libs/API';
import type {EditTaskParams, ReopenTaskParams, UpdateTaskAssigneeParams, UpdateTaskTitleParams} from '@libs/API/parameters';
import type {UpdateTaskParams} from '@libs/API/parameters/UpdateTaskParams';
        key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
        value: {
            ...(title !== undefined && {reportName: title}),
            ...(description !== undefined && {description: Str.htmlEncode(description)}),
            pendingFields: {
                ...(title !== undefined && {reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                ...(description !== undefined && {description: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),