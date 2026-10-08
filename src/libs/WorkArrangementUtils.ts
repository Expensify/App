import type {LocalizedTranslate} from '@components/LocaleContextProvider';

/**
 * Whether a member commutes to an office
 */
function getEffectiveWorkArrangement(memberArrangement: boolean | undefined, workspaceArrangement: boolean | undefined): boolean {
    return memberArrangement ?? workspaceArrangement ?? true;
}

function getWorkArrangementLabel(translate: LocalizedTranslate, isOfficeBased: boolean): string {
    return translate(isOfficeBased ? 'workspace.people.officeBased' : 'workspace.people.noRegularWorkspace');
}

export {getEffectiveWorkArrangement, getWorkArrangementLabel};
