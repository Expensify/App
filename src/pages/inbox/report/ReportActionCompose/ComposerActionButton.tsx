import ComposerActionMenu from './ComposerActionMenu';
import {useComposerEditState} from './ComposerContext';
import ComposerEditingButtons from './ComposerEditingButtons';

function ReportActionComposeActionButton({reportID}: {reportID: string}) {
    const {isEditingInComposer} = useComposerEditState();

    if (isEditingInComposer) {
        return <ComposerEditingButtons reportID={reportID} />;
    }
    return <ComposerActionMenu reportID={reportID} />;
}

export default ReportActionComposeActionButton;
