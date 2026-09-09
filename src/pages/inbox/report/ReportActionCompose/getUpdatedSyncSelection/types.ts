type GetUpdatedSyncSelectionProps = {
    commentWithSpaceInserted: string;
    newComment: string;
    /** The position of the comment */
    position: number;
};

type GetUpdatedSyncSelection = (props: GetUpdatedSyncSelectionProps) => {position: number; value: string} | undefined;

export default GetUpdatedSyncSelection;
