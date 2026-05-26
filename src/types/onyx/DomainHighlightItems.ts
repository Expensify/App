type DomainHighlightItems = {
    admins?: string[] | null;
    members?: string[] | null;
    groups?: string[] | null;
};

export type DomainHighlightItemType = keyof DomainHighlightItems;

export default DomainHighlightItems;
