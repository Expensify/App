import {hasOnceLoadedReportActionsSelector, isActionLoadingSelector, pendingChatMembersSelector} from '@selectors/ReportMetaData';
import type {OnyxEntry} from 'react-native-onyx';
import type {ReportMetadata} from '@src/types/onyx';

describe('isActionLoadingSelector', () => {
    it('returns true when isActionLoading is true', () => {
        const reportMetadata: OnyxEntry<ReportMetadata> = {isActionLoading: true};
        expect(isActionLoadingSelector(reportMetadata)).toBe(true);
    });

    it('returns false when isActionLoading is false', () => {
        const reportMetadata: OnyxEntry<ReportMetadata> = {isActionLoading: false};
        expect(isActionLoadingSelector(reportMetadata)).toBe(false);
    });

    it('returns false when isActionLoading is not set', () => {
        const reportMetadata: OnyxEntry<ReportMetadata> = {};
        expect(isActionLoadingSelector(reportMetadata)).toBe(false);
    });

    it('returns false when reportMetadata is undefined', () => {
        expect(isActionLoadingSelector(undefined)).toBe(false);
    });
});

describe('hasOnceLoadedReportActionsSelector', () => {
    it('returns true when hasOnceLoadedReportActions is true', () => {
        const reportMetadata: OnyxEntry<ReportMetadata> = {hasOnceLoadedReportActions: true};
        expect(hasOnceLoadedReportActionsSelector(reportMetadata)).toBe(true);
    });

    it('returns false when hasOnceLoadedReportActions is false', () => {
        const reportMetadata: OnyxEntry<ReportMetadata> = {hasOnceLoadedReportActions: false};
        expect(hasOnceLoadedReportActionsSelector(reportMetadata)).toBe(false);
    });

    it('returns undefined when hasOnceLoadedReportActions is not set', () => {
        const reportMetadata: OnyxEntry<ReportMetadata> = {};
        expect(hasOnceLoadedReportActionsSelector(reportMetadata)).toBeUndefined();
    });

    it('returns undefined when reportMetadata is undefined', () => {
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
