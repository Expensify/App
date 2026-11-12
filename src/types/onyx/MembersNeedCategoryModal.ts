/** Signal to show the modal blocking a category disable, set when the backend rejects one the App's own check missed */
type MembersNeedCategoryModal = {
    /** The workspace whose categories couldn't be disabled, used to look up the members' emails */
    policyID: string;

    /** The members who would have been left without a category they can use */
    accountIDs: number[];

    /** The categories the rejected request tried to disable, so a single one can be named in the title */
    categoryNames: string[];
};

export default MembersNeedCategoryModal;
