import Button from '@components/Button';
import RenderHTML from '@components/RenderHTML';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import openPrivatePersonalDetailsPage from '@libs/Navigation/helpers/openPrivatePersonalDetailsPage';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';
import {getEffectiveWorkArrangement} from '@libs/WorkArrangementUtils';

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

// A commute is only measured from a member's home when the workspace excludes commutes by home and office and
// the member is office-based, which their own arrangement decides before the workspace default does. A
// workspace that has not loaded yet counts as still measuring, so a slow read never hides a prompt the member
// does need to act on.
const createIsCommuteStillMeasuredSelector = (currentUserEmail: string | undefined) => (policy: OnyxEntry<Policy>) =>
    !policy ||
    (policy.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE &&
        getEffectiveWorkArrangement(currentUserEmail ? policy.employeeList?.[currentUserEmail]?.hasOfficeWorkArrangement : undefined, policy.commuterExclusions.isOfficeWorkArrangement));

function HomeAddressRequiredContent({action}: HomeAddressRequiredContentProps) {
    const {translate} = useLocalize();
    const [hasHomeAddress] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {selector: hasHomeAddressSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [isCommuteStillMeasured] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getOriginalMessage(action)?.policyID}`, {
        selector: createIsCommuteStillMeasuredSelector(session?.email),
    });

    // The prompt is resolved once the member saves a home address.
    const isResolved = !!getOriginalMessage(action)?.resolution || !!hasHomeAddress || !isCommuteStillMeasured;

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={`<comment><muted-text>${getReportActionHtml(action) || getReportActionText(action)}</muted-text></comment>`} />
            {!isResolved && (
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
