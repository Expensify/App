import type {ListItem} from '@components/SelectionList/types';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

type TagListItem = ListItem & {
    value: string;
    enabled: boolean;
    orderWeight?: number;
    rules?: {
        parentTagsFilter?: string;
    };
    required?: boolean;
};

type PolicyTag = {
    name: string;
    enabled: boolean;
    previousTagName?: string;
    /** "General Ledger code" that corresponds to this tag in an accounting system. Similar to an ID. */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'GL Code'?: string;
    errors?: Errors | null;
    rules?: {
        parentTagsFilter?: string;
    };
    parentTagsFilter?: string;
    pendingAction?: PendingAction | null;
};

type PolicyTags = Record<string, PolicyTag>;

type PolicyTagList = {
    name: string;
    orderWeight: number;
    required: boolean;
    tags: PolicyTags;
    pendingAction?: PendingAction | null;
};

// eslint-disable-next-line import/prefer-default-export
export type {TagListItem, PolicyTag, PolicyTagList};
