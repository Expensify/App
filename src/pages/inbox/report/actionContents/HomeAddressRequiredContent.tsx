import Button from '@components/ButtonComposed';
import {useEnvironmentActions} from '@components/EnvironmentContextProvider';
import RenderHTML from '@components/RenderHTML';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import openPrivatePersonalDetailsPage from '@libs/Navigation/helpers/openPrivatePersonalDetailsPage';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, getReportActionHtml, getReportActionText} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {PrivatePersonalDetails, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {DomUtils, parseDocument} from 'htmlparser2';

type HomeAddressRequiredContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED>;
};

const hasHomeAddressSelector = (privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) => !!getCurrentAddress(privatePersonalDetails)?.street?.trim();

const PRIVATE_PERSONAL_DETAILS_ROUTE = ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.route;
const PRIVATE_PERSONAL_DETAILS_ROUTE_WITH_FOCUS = ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1);

/**
 * The home address link in the action HTML points at the private personal details page without a `fieldToFocus` param,
 * so Address line 1 isn't focused when the page is opened that way. Point those anchors at the exact route the
 * "Add address" button below navigates to, so both entry points behave identically.
 */
function focusAddressLineOnPrivatePersonalDetailsLinks(html: string): string {
    if (!html) {
        return html;
    }

    try {
        const dom = parseDocument(html);
        const anchorTags = DomUtils.findAll((el) => el.name?.toLowerCase() === 'a', dom);

        let adjustedHtml = html;

        for (const anchorTag of anchorTags) {
            const href = anchorTag.attribs?.href;
            const [path] = href?.split('?') ?? [];

            if (href && path?.endsWith(PRIVATE_PERSONAL_DETAILS_ROUTE)) {
                const newHref = `${path.slice(0, -PRIVATE_PERSONAL_DETAILS_ROUTE.length)}${PRIVATE_PERSONAL_DETAILS_ROUTE_WITH_FOCUS}`;

                adjustedHtml = adjustedHtml.replace(`href="${href}"`, `href="${newHref}"`);
            }
        }

        return adjustedHtml;
    } catch {
        return html;
    }
}

function HomeAddressRequiredContent({action}: HomeAddressRequiredContentProps) {
    const {translate} = useLocalize();
    const {adjustExpensifyLinksForEnv} = useEnvironmentActions();
    const [hasHomeAddress] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {selector: hasHomeAddressSelector});

    // The prompt is resolved once the member saves a home address. Keep the CTA in sync with the local
    // address state so it disappears immediately after the optimistic save, even before the server
    // stamps the action as resolved.
    const isResolved = !!getOriginalMessage(action)?.resolution || !!hasHomeAddress;

    const messageHtml = focusAddressLineOnPrivatePersonalDetailsLinks(adjustExpensifyLinksForEnv(getReportActionHtml(action) || getReportActionText(action)));

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
