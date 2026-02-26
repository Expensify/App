import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {VirtualEmployee, VirtualEmployeeCapability, VirtualEmployeeEventSubscription} from '@src/types/onyx/VirtualEmployee';

function createVirtualEmployee(policyID: string, displayName: string, systemPrompt: string, capabilities: VirtualEmployeeCapability[], eventSubs: VirtualEmployeeEventSubscription[]): void {
    const optimisticID = `pending_${Date.now()}`;
    const optimisticEmployee: VirtualEmployee = {
        id: optimisticID,
        policyID,
        accountID: 0,
        email: '',
        displayName,
        systemPrompt,
        capabilities,
        eventSubs,
        status: 'active',
        createdBy: 0,
        pendingAction: 'add',
    };

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`,
            value: {[optimisticID]: optimisticEmployee},
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`,
            value: {[optimisticID]: null},
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`,
            value: {[optimisticID]: {pendingAction: null, errors: {create: 'Failed to create virtual employee'}}},
        },
    ];

    API.write(
        WRITE_COMMANDS.CREATE_VIRTUAL_EMPLOYEE,
        {policyID, displayName, systemPrompt, capabilities: JSON.stringify(capabilities), eventSubs: JSON.stringify(eventSubs)},
        {optimisticData, successData, failureData},
    );
}

function updateVirtualEmployee(policyID: string, virtualEmployeeID: string, updates: Partial<Pick<VirtualEmployee, 'displayName' | 'systemPrompt' | 'capabilities' | 'eventSubs'>>): void {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`,
            value: {[virtualEmployeeID]: {...updates, pendingAction: 'update'}},
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`,
            value: {[virtualEmployeeID]: {pendingAction: null}},
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`,
            value: {[virtualEmployeeID]: {pendingAction: null, errors: {update: 'Failed to update'}}},
        },
    ];

    API.write(
        WRITE_COMMANDS.UPDATE_VIRTUAL_EMPLOYEE,
        {
            policyID,
            vaAccountID: Number(virtualEmployeeID),
            displayName: updates.displayName ?? '',
            systemPrompt: updates.systemPrompt ?? '',
            capabilities: JSON.stringify(updates.capabilities),
            eventSubs: JSON.stringify(updates.eventSubs),
        },
        {optimisticData, successData, failureData},
    );
}

function deleteVirtualEmployee(policyID: string, virtualEmployeeID: string): void {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`,
            value: {[virtualEmployeeID]: {pendingAction: 'delete'}},
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`,
            value: {[virtualEmployeeID]: null},
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`,
            value: {[virtualEmployeeID]: {pendingAction: null, errors: {delete: 'Failed to delete'}}},
        },
    ];

    API.write(WRITE_COMMANDS.DELETE_VIRTUAL_EMPLOYEE, {policyID, vaAccountID: Number(virtualEmployeeID)}, {optimisticData, successData, failureData});
}

function openWorkspaceVirtualEmployeesPage(policyID: string): void {
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.OPEN_WORKSPACE_VIRTUAL_EMPLOYEES_PAGE, {policyID}, {});
}

export {createVirtualEmployee, updateVirtualEmployee, deleteVirtualEmployee, openWorkspaceVirtualEmployeesPage};
