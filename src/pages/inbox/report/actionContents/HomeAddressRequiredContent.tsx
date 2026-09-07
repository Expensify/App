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

type HomeAddressRequiredContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED>;
};

const hasHomeAddressSelector = (privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>) => !!getCurrentAddress(privatePersonalDetails)?.street?.trim();

const PRIVATE_PERSONAL_DETAILS_ROUTE = ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.route;
const PRIVATE_PERSONAL_DETAILS_ROUTE_WITH_FOCUS = ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1);

/** Matches an opening anchor tag. Closing tags and every other element are left untouched. */
const ANCHOR_START_TAG_REGEX = /<a\b[^>]*>/gi;

/**
 * Matches an href attribute inside an opening anchor tag, in all three HTML quoting styles.
 * The leading \s is required so that ExpensiMark's `data-raw-href="…"` is not matched.
 */
const HREF_ATTRIBUTE_REGEX = /(\shref\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/i;

/**
 * This deliberately edits the raw HTML string rather than parsing and re-serializing it: a round trip through an
 * HTML serializer rewrites the App's custom tags (it turns `<mention-user accountID="…"/>` into a wrapper that
 * swallows the rest of the message, lowercases the `accountID` attribute that MentionUserRenderer reads, and
 * converts emoji to numeric character references).
 */
function focusAddressLineOnPrivatePersonalDetailsLinks(html: string): string {
    if (!html || !html.includes(PRIVATE_PERSONAL_DETAILS_ROUTE)) {
        return html;
    }

    return html.replaceAll(ANCHOR_START_TAG_REGEX, (anchorStartTag) =>
        anchorStartTag.replace(HREF_ATTRIBUTE_REGEX, (hrefAttribute, attributeNameAndEquals: string, doubleQuoted?: string, singleQuoted?: string, unquoted?: string) => {
            const href = doubleQuoted ?? singleQuoted ?? unquoted ?? '';
            const [path] = href.split('?');

            if (!path.endsWith(PRIVATE_PERSONAL_DETAILS_ROUTE)) {
                return hrefAttribute;
            }

            const newHref = `${path.slice(0, -PRIVATE_PERSONAL_DETAILS_ROUTE.length)}${PRIVATE_PERSONAL_DETAILS_ROUTE_WITH_FOCUS}`;

            if (doubleQuoted !== undefined) {
                return `${attributeNameAndEquals}"${newHref}"`;
            }
            if (singleQuoted !== undefined) {
                return `${attributeNameAndEquals}'${newHref}'`;
            }
            return `${attributeNameAndEquals}${newHref}`;
        }),
    );
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
