type HrSyncSkippedEmployee = {
    /** Full name of the employee */
    name: string;

    /** Unique identifier of the employee */
    id: string;

    /** Human-readable explanation of why the employee was skipped */
    reason: string;
};

type HrSyncResult = {
    /** Number of employees added during the sync */
    addedEmployeesCount?: number;

    /** Number of employees removed during the sync */
    removedEmployeesCount?: number;

    /** Employees that were skipped during the sync */
    skippedEmployees?: HrSyncSkippedEmployee[];
};

export type {HrSyncResult, HrSyncSkippedEmployee};
