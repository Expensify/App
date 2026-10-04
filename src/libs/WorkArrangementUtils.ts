import type {LocalizedTranslate} from '@components/LocaleContextProvider';

function getEffectiveWorkArrangement(memberArrangement: boolean | undefined, workspaceArrangement: boolean | undefined): boolean {
    return memberArrangement ?? workspaceArrangement ?? false;
}

function getWorkArrangementLabel(translate: LocalizedTranslate, isOfficeBased: boolean): string {
    return translate(isOfficeBased ? 'workspace.people.officeBased' : 'workspace.people.noRegularWorkspace');
}

export {getEffectiveWorkArrangement, getWorkArrangementLabel};
