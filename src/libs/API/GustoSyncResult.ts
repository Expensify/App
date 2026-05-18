type GustoSyncSkippedEmployee = {
    name: string;
    id: string;
    reason: string;
};

type GustoSyncResult = {
    addedEmployeesCount?: number;
    removedEmployeesCount?: number;
    skippedEmployees?: GustoSyncSkippedEmployee[];
};

export type {GustoSyncResult, GustoSyncSkippedEmployee};
