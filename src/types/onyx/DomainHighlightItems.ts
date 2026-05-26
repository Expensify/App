/**
 * Pending domain item identifiers for scroll-and-highlight after add flows
 */
type DomainHighlightItems = {
    /** Account IDs of newly added admins pending highlight */
    admins?: string[] | null;

    /** Account IDs of newly added members pending highlight */
    members?: string[] | null;

    /** Group IDs of newly added groups pending highlight */
    groups?: string[] | null;
};

/** Keys of {@link DomainHighlightItems} used when setting or clearing highlight state */
type DomainHighlightItemType = keyof DomainHighlightItems;

export type {DomainHighlightItemType};
export default DomainHighlightItems;
