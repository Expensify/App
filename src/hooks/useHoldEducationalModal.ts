import {shouldFailAllRequestsSelector} from '@selectors/Network';
import type {OnyxEntry} from 'react-native-onyx';
import HoldOrRejectEducationalModalWrapper from '@components/Modal/Global/HoldOrRejectEducationalModalWrapper';
import HoldSubmitterEducationalModalWrapper from '@components/Modal/Global/HoldSubmitterEducationalModalWrapper';
import {ModalActions, useModal} from '@components/Modal/Global/ModalContext';
import {setNameValuePair} from '@libs/actions/User';
import {isCurrentUserSubmitter, isDM} from '@libs/ReportUtils';
import {dismissRejectUseExplanation} from '@userActions/IOU/RejectMoneyRequest';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

type UseHoldEducationalModalParams = {
    moneyRequestReport: OnyxEntry<Report>;
    originalReport: OnyxEntry<Report>;
};

const useHoldEducationalModal = ({moneyRequestReport, originalReport}: UseHoldEducationalModalParams) => {
    const modal = useModal();
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION);
    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [shouldFailAllRequests] = useOnyx(ONYXKEYS.NETWORK, {selector: shouldFailAllRequestsSelector});

    const holdWithEducation = (holdAction: () => void) => {
        const isSubmitter = isCurrentUserSubmitter(moneyRequestReport);
        const isChatDM = isDM(originalReport);
        const isAlreadyDismissed = isSubmitter ? dismissedHoldUseExplanation : dismissedRejectUseExplanation;

        if (isAlreadyDismissed || isChatDM) {
            holdAction();
            return;
        }

        if (isSubmitter) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            modal.showModal({component: HoldSubmitterEducationalModalWrapper}).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !shouldFailAllRequests);
                holdAction();
            });
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        modal.showModal({component: HoldOrRejectEducationalModalWrapper}).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            dismissRejectUseExplanation();
            holdAction();
        });
    };

    return {holdWithEducation};
};

export default useHoldEducationalModal;
