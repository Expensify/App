type MergeSyncSkippedEmployee = {
    /** Full name of the employee */
    name: string;

    /** Unique identifier of the employee */
    id: string;

    /** Human-readable explanation of why the employee was skipped */
    reason: string;
};

type MergeSyncResult = {
    /** Number of employees added during the sync */
    addedEmployeesCount?: number;

    /** Number of employees removed during the sync */
    removedEmployeesCount?: number;

    /** Employees that were skipped during the sync */
    skippedEmployees?: MergeSyncSkippedEmployee[];
};

export default MergeSyncResult;
