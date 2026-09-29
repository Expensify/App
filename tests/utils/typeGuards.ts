import type {GuidedSetupTask} from '@libs/actions/Report';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

type UnknownRecord = Record<string, unknown>;
type ReportMergeUpdate = Extract<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>, {onyxMethod: typeof Onyx.METHOD.MERGE}>;
type ReportObjectMergeUpdate = Omit<ReportMergeUpdate, 'value'> & {value: Record<string, unknown>};
type ReportStateMergeValue = Required<Pick<NonNullable<ReportMergeUpdate['value']>, 'stateNum' | 'statusNum'>>;
type ReportStateMergeUpdate = Omit<ReportMergeUpdate, 'value'> & {value: ReportStateMergeValue};

function isReportStateNum(value: unknown): value is ValueOf<typeof CONST.REPORT.STATE_NUM> {
    return typeof value === 'number' && Object.values(CONST.REPORT.STATE_NUM).some((stateNum) => stateNum === value);
}

function isReportStatusNum(value: unknown): value is ValueOf<typeof CONST.REPORT.STATUS_NUM> {
    return typeof value === 'number' && Object.values(CONST.REPORT.STATUS_NUM).some((statusNum) => statusNum === value);
}

function isReportMergeUpdate(value: unknown, reportKey: ReportMergeUpdate['key']): value is ReportObjectMergeUpdate {
    return isRecord(value) && value.key === reportKey && value.onyxMethod === Onyx.METHOD.MERGE && isRecord(value.value);
}

function isReportStateMergeUpdate(value: unknown, reportKey: ReportMergeUpdate['key']): value is ReportStateMergeUpdate {
    if (!isReportMergeUpdate(value, reportKey)) {
        return false;
    }

    const {stateNum, statusNum} = value.value;
    return isReportStateNum(stateNum) && isReportStatusNum(statusNum);
}

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
    return value !== null && typeof value === 'object';
}

function hasDefinedProperty(value: unknown, property: PropertyKey): boolean {
    return isObject(value) && property in value && value[property] !== undefined;
}

function requireRecord(value: unknown, label = 'value'): UnknownRecord {
    if (!isRecord(value)) {
        throw new Error(`Expected ${label} to be an object`);
    }
    return value;
}

function readProperty(value: unknown, key: string): unknown {
    return requireRecord(value, `container for ${key}`)[key];
}

function requireStringProperty(value: unknown, key: string): string {
    const property = readProperty(value, key);
    if (typeof property !== 'string') {
        throw new Error(`Expected ${key} to be a string`);
    }
    return property;
}

function getOptionalNumberProperty(value: unknown, key: string): number | undefined {
    const property = readProperty(value, key);
    if (property !== undefined && typeof property !== 'number') {
        throw new Error(`Expected ${key} to be a number when present`);
    }
    return property;
}

function parseJSONValue(value: unknown, label: string): unknown {
    if (typeof value !== 'string') {
        throw new Error(`Expected ${label} to be a string`);
    }
    const parsed: unknown = JSON.parse(value);
    return parsed;
}

function parseJSONRecord(value: unknown, label = 'JSON payload'): UnknownRecord {
    return requireRecord(parseJSONValue(value, label), label);
}

function parseJSONArray(value: unknown, label = 'JSON payload'): unknown[] {
    const parsed = parseJSONValue(value, label);
    if (!Array.isArray(parsed)) {
        throw new Error(`Expected ${label} to be an array`);
    }
    return parsed;
}

function isGuidedSetupTask(value: unknown): value is GuidedSetupTask {
    return (
        isRecord(value) &&
        value.type === 'task' &&
        typeof value.task === 'string' &&
        typeof value.taskReportID === 'string' &&
        typeof value.parentReportID === 'string' &&
        typeof value.parentReportActionID === 'string' &&
        (value.assigneeChatReportID === undefined || typeof value.assigneeChatReportID === 'string') &&
        typeof value.createdTaskReportActionID === 'string' &&
        (value.completedTaskReportActionID === undefined || typeof value.completedTaskReportActionID === 'string') &&
        typeof value.title === 'string' &&
        typeof value.description === 'string'
    );
}

function requireRecordArrayProperty(value: unknown, key: string): UnknownRecord[] {
    const property = readProperty(value, key);
    if (!Array.isArray(property) || !property.every(isRecord)) {
        throw new Error(`Expected ${key} to be an array of objects`);
    }
    return property;
}

export {
    getOptionalNumberProperty,
    hasDefinedProperty,
    isGuidedSetupTask,
    isObject,
    isReportMergeUpdate,
    isReportStateMergeUpdate,
    parseJSONArray,
    parseJSONRecord,
    readProperty,
    requireRecord,
    requireRecordArrayProperty,
    requireStringProperty,
};

export type {ReportMergeUpdate};
