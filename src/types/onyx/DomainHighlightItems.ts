/** Domain list type pending a scroll-and-highlight after an add flow */
type DomainHighlightItemType = 'admins' | 'members' | 'groups';

/**
 * Pending domain item identifier for scroll-and-highlight after an add flow
 */
type DomainHighlightItems = {
    /** Domain list type for the pending highlight */
    type?: DomainHighlightItemType | null;

    /** Item identifier pending highlight (accountID or groupID) */
    id?: string | null;
};

export default DomainHighlightItems;
