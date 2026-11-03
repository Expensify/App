import Log from '@libs/Log';

/** A schema problem repeats on every render and validation, so each one is logged once per session */
const loggedProblems = new Set<string>();

function logSchemaProblem(message: string, parameters: Record<string, string>) {
    const problemID = `${message}:${JSON.stringify(parameters)}`;
    if (loggedProblems.has(problemID)) {
        return;
    }
    loggedProblems.add(problemID);
    Log.warn(`[DynamicForm] ${message}`, parameters);
}

export default logSchemaProblem;
