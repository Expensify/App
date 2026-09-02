import Button from '@components/ButtonComposed';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import openPrivatePersonalDetailsPage from '@libs/Navigation/helpers/openPrivatePersonalDetailsPage';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, getReportActionText} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {Policy, PrivatePersonalDetails, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type HomeAddressRequiredContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED>;
};

const hasHomeAddressSelector = (privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) => !!getCurrentAddress(privatePersonalDetails)?.street?.trim();

const isRequestingHomeAddressSelector = (policy: OnyxEntry<Policy>) =>
    policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

function HomeAddressRequiredContent({action}: HomeAddressRequiredContentProps) {
    const {translate} = useLocalize();
    const originalMessage = getOriginalMessage(action);
    const [hasHomeAddress] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {selector: hasHomeAddressSelector});
    const [isPolicyRequestingHomeAddress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${originalMessage?.policyID}`, {selector: isRequestingHomeAddressSelector});

    // The prompt is resolved once the member saves a home address. Keep the CTA in sync with the local
    // address state so it disappears immediately after the optimistic save, even before the server
    // stamps the action as resolved.
    const isResolved = !!originalMessage?.resolution || !!hasHomeAddress;

    // Only the workspace that asked for the address can use it, so the CTA is dropped as soon as that
    // workspace stops asking: the policy leaves Onyx when the member is removed from it or it is
    // deleted, and its method changes when an admin turns exclude commutes off.
    const shouldShowCTA = !isResolved && !!isPolicyRequestingHomeAddress;

    return (
        <ReportActionItemBasicMessage message={getReportActionText(action)}>
            {shouldShowCTA && (
                <ActionableItemButtons layout="horizontal">
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={() => openPrivatePersonalDetailsPage(INPUT_IDS.ADDRESS_LINE_1)}
                    >
                        <Button.Text>{translate('homePage.timeSensitiveSection.addHomeAddress.cta')}</Button.Text>
                    </Button>
                </ActionableItemButtons>
            )}
        </ReportActionItemBasicMessage>
    );
}

export default HomeAddressRequiredContent;
