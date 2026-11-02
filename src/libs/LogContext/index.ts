/**
 * Adds client context to every log message, e.g. which browser tab wrote it.
 */
import type AddLogContext from './types';
import type {ActiveTab, SetActiveTab} from './types';

let activeTab: ActiveTab | undefined;

const setActiveTab: SetActiveTab = (tab) => {
    activeTab = tab;
};

const addLogContext: AddLogContext = (message) => (activeTab ? `${message} [tab ${activeTab.clientID} leader:${activeTab.isLeader}]` : message);

export {addLogContext, setActiveTab};
