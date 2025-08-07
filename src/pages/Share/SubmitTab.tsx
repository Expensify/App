import React from 'react';
import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';
import ROUTES from '@src/ROUTES';

type InputFocusRef = {
    focus?: () => void;
};

type SubmitTabComponentProps = {
    ref?: React.Ref<InputFocusRef>;
};

function SubmitTabComponent({ref}: SubmitTabComponentProps) {
    return (
        <ShareTabParticipantsSelector
            ref={ref}
            detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS}
        />
    );
}

const SubmitTab = SubmitTabComponent;
export default SubmitTab;
