/**
 * @throws {Error} If the "parameters" object has a null or undefined value for any of the given parameterNames
 *
 * @param parameterNames Array of the required parameter names
 * @param parameters A map from available parameter names to their values
 * @param commandName The name of the API command
 */
export default function requireParameters(parameterNames: string[], parameters: Record<string, unknown>, commandName: string): void {
    for (const parameterName of parameterNames) {
        if (parameterName in parameters && parameters[parameterName] !== null && parameters[parameterName] !== undefined) {
            continue;
        }

        const propertiesToRedact = new Set(['authToken', 'password', 'partnerUserSecret', 'twoFactorAuthCode']);
        const parametersCopy = {...parameters};
        for (const key of Object.keys(parametersCopy)) {
            if (!propertiesToRedact.has(key.toString())) {
                continue;
            }

            parametersCopy[key] = '<redacted>';
        }

        const keys = Object.keys(parametersCopy).join(', ') || 'none';

        let error = `Parameter ${parameterName} is required for "${commandName}". `;
        error += `Supplied parameters: ${keys}`;
        throw new Error(error);
    }
}
