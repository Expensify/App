import type {OnyxEntry} from 'react-native-onyx';
import type {Report} from '@src/types/onyx';

type SilentCommentUpdaterOnyxProps = {
    /** The comment of the report */
    comment: OnyxEntry<string>;
};

type SilentCommentUpdaterProps = {
    /** Updates the comment */
    updateComment: (comment: OnyxEntry<string>) => void;

    /** The ID of the report associated with the comment */
    reportID: string;

    /** The report associated with the comment */
    report: OnyxEntry<Report>;

    /** The value of the comment */
    value: string;

    /** The ref of the comment */
    commentRef: React.RefObject<string>;
} & SilentCommentUpdaterOnyxProps;

export type {SilentCommentUpdaterProps, SilentCommentUpdaterOnyxProps};
