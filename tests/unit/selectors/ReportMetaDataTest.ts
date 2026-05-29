import {hasOnceLoadedReportActionsSelector, isActionLoadingSelector, pendingChatMembersSelector} from '@selectors/ReportMetaData';
import type {OnyxEntry} from 'react-native-onyx';
import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';

describe('isActionLoadingSelector', () => {
    it('returns true when isActionLoading is true', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {isActionLoading: true};
        expect(isActionLoadingSelector(loadingState)).toBe(true);
    });

    it('returns false when isActionLoading is false', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {isActionLoading: false};
        expect(isActionLoadingSelector(loadingState)).toBe(false);
    });

    it('returns false when isActionLoading is not set', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {};
        expect(isActionLoadingSelector(loadingState)).toBe(false);
    });

    it('returns false when loadingState is undefined', () => {
        expect(isActionLoadingSelector(undefined)).toBe(false);
    });
});

describe('hasOnceLoadedReportActionsSelector', () => {
    it('returns true when hasOnceLoadedReportActions is true', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {hasOnceLoadedReportActions: true};
        expect(hasOnceLoadedReportActionsSelector(loadingState)).toBe(true);
    });

    it('returns false when hasOnceLoadedReportActions is false', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {hasOnceLoadedReportActions: false};
        expect(hasOnceLoadedReportActionsSelector(loadingState)).toBe(false);
    });

    it('returns undefined when hasOnceLoadedReportActions is not set', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {};
        expect(hasOnceLoadedReportActionsSelector(loadingState)).toBeUndefined();
    });

    it('returns undefined when loadingState is undefined', () => {
        expect(hasOnceLoadedReportActionsSelector(undefined)).toBeUndefined();
    });
});

describe('pendingChatMembersSelector', () => {
    it('returns object with pendingChatMembers when present', () => {
        const pendingChatMembers = [{accountID: '12345', pendingAction: 'add' as const}];
        const reportMetadata: OnyxEntry<ReportMetadata> = {pendingChatMembers};
        expect(pendingChatMembersSelector(reportMetadata)).toEqual({pendingChatMembers});
    });

    it('returns object with undefined pendingChatMembers when field is not set', () => {
        const reportMetadata: OnyxEntry<ReportMetadata> = {};
        expect(pendingChatMembersSelector(reportMetadata)).toEqual({pendingChatMembers: undefined});
    });

    it('returns undefined when reportMetadata is undefined', () => {
        expect(pendingChatMembersSelector(undefined)).toBeUndefined();
    });
});
