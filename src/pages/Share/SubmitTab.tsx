import React from 'react';
import type {Ref} from 'react';
import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';
import ROUTES from '@src/ROUTES';

type InputFocusRef = {
    focus?: () => void;
};

type SubmitTabProps = {
    /** Reference to the outer element */
    ref?: Ref<InputFocusRef>;
};

function SubmitTabComponent({ref}: SubmitTabProps) {
    return (
        <ShareTabParticipantsSelector
            ref={ref}
            detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS}
        />
    );
}

const SubmitTab = SubmitTabComponent;
export default SubmitTab;
