import type {ListItem} from '@components/SelectionList/types';

type TagListItem = ListItem & {
    value: string;
    enabled: boolean;
    orderWeight?: number;
};

// eslint-disable-next-line import/prefer-default-export
export type {TagListItem};
