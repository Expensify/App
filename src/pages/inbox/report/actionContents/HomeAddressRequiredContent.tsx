import Button from '@components/Button';
import AnchorPressOverrideContext from '@components/HTMLEngineProvider/HTMLRenderers/AnchorPressOverrideContext';
import RenderHTML from '@components/RenderHTML';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getInternalNewExpensifyPath} from '@libs/actions/Link';
import openHomeAddressPage, {openHomeAddressPageWithFocus} from '@libs/Navigation/helpers/openHomeAddressPage';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';
import {getEffectiveWorkArrangement} from '@libs/WorkArrangementUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

function getHomeAddressPressOverride(href: string) {
    const path = getInternalNewExpensifyPath(href).split(/[?#]/).at(0);
    if (path !== ROUTES.SETTINGS_HOME_ADDRESS.route && path !== ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.route) {
        return undefined;
    }
    return openHomeAddressPageWithFocus;
}

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
            <AnchorPressOverrideContext.Provider value={getHomeAddressPressOverride}>
                <RenderHTML html={`<comment><muted-text>${getReportActionHtml(action) || getReportActionText(action)}</muted-text></comment>`} />
            </AnchorPressOverrideContext.Provider>
            {!isResolved && (
                <ActionableItemButtons layout="horizontal">
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        onPress={openHomeAddressPage}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_ADD_HOME_ADDRESS}
                    >
                        <Button.Text>{translate('homePage.timeSensitiveSection.addHomeAddress.cta')}</Button.Text>
                    </Button>
                </ActionableItemButtons>
            )}
        </ReportActionItemBasicMessage>
    );
}

export default HomeAddressRequiredContent;
