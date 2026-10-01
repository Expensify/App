import type {LocalizedTranslate} from '@components/LocaleContextProvider';

/**
 * Whether a member commutes to an office, which is what gives them an ordinary commute to measure against their
 * home address. Their own arrangement wins over the workspace default.
 *
 * Workspaces that turned the home and office method on before this setting existed have neither stored and
 * measured every member's commute, so a missing value reads as office-based, the way the server reads it.
 */
function getEffectiveWorkArrangement(memberArrangement: boolean | undefined, workspaceArrangement: boolean | undefined): boolean {
    return memberArrangement ?? workspaceArrangement ?? true;
}

function getWorkArrangementLabel(translate: LocalizedTranslate, isOfficeBased: boolean): string {
    return translate(isOfficeBased ? 'workspace.people.officeBased' : 'workspace.people.noRegularWorkspace');
}

export {getEffectiveWorkArrangement, getWorkArrangementLabel};
