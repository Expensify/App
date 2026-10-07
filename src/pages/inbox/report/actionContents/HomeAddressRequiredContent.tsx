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
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {Policy, PrivatePersonalDetails, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type HomeAddressRequiredContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED>;
};

const hasHomeAddressSelector = (privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) => !!getCurrentAddress(privatePersonalDetails)?.street?.trim();

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

    // The backend links to the private personal details page without a field to focus, so point the link at
    // Address line 1
    const messageHtml = (getReportActionHtml(action) || getReportActionText(action)).replaceAll(
        ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.route,
        ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1),
    );

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={`<comment><muted-text>${messageHtml}</muted-text></comment>`} />
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
