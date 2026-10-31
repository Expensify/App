/**
 * Adds client context to every log message, e.g. which browser tab wrote it.
 */
import type AddLogContext from './types';

type ActiveTab = {clientID: string; isLeader: boolean};

let activeTab: ActiveTab | undefined;

function setActiveTab(tab: ActiveTab) {
    activeTab = tab;
}

const addLogContext: AddLogContext = (message) => (activeTab ? `${message} [tab ${activeTab.clientID} leader:${activeTab.isLeader}]` : message);

export {addLogContext, setActiveTab};
