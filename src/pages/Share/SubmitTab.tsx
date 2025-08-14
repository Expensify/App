import React, {forwardRef} from 'react';
import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';
import ROUTES from '@src/ROUTES';

type InputFocusRef = {
    focus?: () => void;
};

function SubmitTabComponent(_props: unknown, ref: React.Ref<InputFocusRef>) {
    return (
        <ShareTabParticipantsSelector
            ref={ref}
            detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS}
        />
    );
}

const SubmitTab = forwardRef(SubmitTabComponent);
export default SubmitTab;
