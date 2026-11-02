import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {LoginList, Logins, NewLogin, PrivatePersonalDetails, VacationDelegate} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import hashCode from './hashCode';
import {formatPhoneNumber} from './LocalePhoneNumber';
import type {AvatarSource} from './UserAvatarUtils';

type LoginListIndicator = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

/**
 * Searches through given loginList for any contact method / login with an error.
 *
 * Example that should return false:
 * {{
 *      test@test.com: {
 *          errorFields: {
 *              validateCodeSent: null
 *          }
 *      }
 * }}
 *
 * Example that should return true:
 * {{
 *      test@test.com: {
 *          errorFields: {
 *              validateCodeSent: { 18092081290: 'An error' }
 *          }
 *      }
 * }}
 */
function hasLoginListError(loginList: OnyxEntry<LoginList>): boolean {
    return Object.values(loginList ?? {}).some((loginData) => Object.values(loginData.errorFields ?? {}).some((field) => Object.keys(field ?? {}).length > 0));
}

/**
 * Searches through given loginList for any contact method / login that requires
 * an Info brick road status indicator. Currently this only applies if the user
 * has an unvalidated contact method.
 */
function hasLoginListInfo(loginList: OnyxEntry<LoginList>, email: string | undefined): boolean {
    return Object.values(loginList ?? {}).some((login) => login.partnerUserID && email !== login.partnerUserID && !login.validatedDate);
}

function getLoginKey(login: NewLogin) {
    return `${login.partnerID}_${login.partnerUserID}`;
}

function getLastLogin(login: NewLogin) {
    // If we have not re-authenticated, then lastLogin will still be the default 2008-01-01 value. So the created time stamp will be more accurate in that case.
    return login.lastLogin > login.created ? login.lastLogin : login.created;
}

/**
 * Selector that filters the new `logins` Onyx key to only Expensify logins (partnerID === 1)
 * and re-keys them by partnerUserID, returning a LoginList-compatible shape.
 */
function expensifyLoginsSelector(logins: OnyxEntry<Logins>): LoginList | undefined {
    if (!logins) {
        return undefined;
    }

    const result: LoginList = {};
    const policyDomainRegex = CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME;
    for (const login of Object.values(logins)) {
        if (login.partnerID !== CONST.PARTNER_ID.EXPENSIFY) {
            continue;
        }
        // Exclude synthetic Expensify Card domain logins (e.g. ...@expensify-policy<policyID>.exfy) auto-created for workspaces.
        // These are not real contact methods and should never surface in the contact methods list or participant selectors.
        if (policyDomainRegex.test(login.partnerUserID)) {
            continue;
        }
        result[login.partnerUserID] = {
            partnerUserID: login.partnerUserID,
            validatedDate: login.validatedDate ?? undefined,
            validateCodeSent: login.validateCodeSent,
            errorFields: login.errorFields,
            pendingFields: login.pendingFields,
            pendingAction: login.pendingAction,
        };
    }
    return result;
}

const DEVICE_PARTNER_IDS = new Set<number>([CONST.PARTNER_ID.IPHONE, CONST.PARTNER_ID.ANDROID, CONST.PARTNER_ID.NEWDOT, CONST.PARTNER_ID.OAUTH]);

function isDeviceLogin(login: NewLogin) {
    return DEVICE_PARTNER_IDS.has(login.partnerID) && (!login.additionalData?.infiniteLoginRoot || login.additionalData.infiniteLoginRoot === login.partnerUserID);
}

function getDeviceLogins(logins: OnyxEntry<Logins>) {
    return Object.values(logins ?? {})?.filter(isDeviceLogin);
}

function hasDeviceManagementError(logins: OnyxEntry<Logins>) {
    return Object.values(logins ?? {})?.some((login) => isDeviceLogin(login) && !!login.errorFields?.revoke);
}

const MCP_PLATFORM_DISPLAY_NAMES: Record<string, string> = {
    cursor: 'Cursor',
    claude: 'Claude',
    claudedesktop: 'Claude Desktop',
    claudecodeex: 'Claude Code',
    chatgpt: 'ChatGPT',
    openai: 'OpenAI',
};

const MCP_PARTNER_USER_ID_PATTERN = /^mcp-([a-z0-9]+)-/;

/**
 * Returns a human-readable display name for a device login.
 *
 * MCP OAuth logins have a partnerUserID of the form "mcp-<slug>-<hex>". For
 * those, the platform slug (stored raw in additionalData.deviceName, or parsed
 * from partnerUserID as a fallback for older logins) is mapped to a friendly
 * label. Regular device logins show their deviceName + OS string as before.
 */
function getDeviceDisplayName(
    login: NewLogin,
    deviceName: string | undefined,
    deviceVersion: string | undefined,
    os: string | undefined,
    osVersion: string | undefined,
    unknownDeviceLabel: string,
): string {
    const mcpMatch = login.partnerUserID ? MCP_PARTNER_USER_ID_PATTERN.exec(login.partnerUserID) : null;
    if (mcpMatch) {
        const slug = deviceName ?? mcpMatch[1];
        const platformName = MCP_PLATFORM_DISPLAY_NAMES[slug];
        return platformName ? `OAuth - MCP (${platformName})` : 'OAuth - MCP';
    }

    if (deviceName && os) {
        return `${deviceName} ${deviceVersion ? `${deviceVersion} ` : ''}(${os} ${osVersion})`;
    }

    return unknownDeviceLabel;
}

/**
 * Checks if the current user has a validated the primary contact method
 */
function isCurrentUserValidated(loginList: OnyxEntry<LoginList>, email: string | undefined): boolean {
    if (!loginList || !email) {
        return false;
    }

    return !!loginList?.[email]?.validatedDate;
}

/**
 * Gets the appropriate brick road indicator status for a given loginList.
 * Error status is higher priority, so we check for that first.
 */
function getLoginListBrickRoadIndicator(loginList: OnyxEntry<LoginList>, email: string | undefined): LoginListIndicator {
    if (hasLoginListError(loginList)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    if (hasLoginListInfo(loginList, email)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    return undefined;
}

/**
 * Gets the appropriate brick road indicator status for the Profile section.
 * Error status is higher priority, so we check for that first.
 */
function getProfilePageBrickRoadIndicator(
    loginList: OnyxEntry<LoginList>,
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>,
    vacationDelegate: OnyxEntry<VacationDelegate>,
    email: string | undefined,
): LoginListIndicator {
    const hasPhoneNumberError = !!privatePersonalDetails?.errorFields?.phoneNumber;
    if (hasLoginListError(loginList) || hasPhoneNumberError || !isEmptyObject(vacationDelegate?.errors)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    if (hasLoginListInfo(loginList, email)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    return undefined;
}

/**
 * Hashes provided string and returns a value between [0, range)
 */
function hashText(text: string, range: number): number {
    return Math.abs(hashCode(text.toLowerCase())) % range;
}

/**
 * Generate a random accountID base on searchValue.
 */
function generateAccountID(searchValue: string): number {
    return hashText(searchValue, 2 ** 32);
}

/**
 * Gets the contact method
 */
function getContactMethod(primaryLogin: string | undefined, email: string | undefined): string {
    return primaryLogin ?? email ?? '';
}

/**
 * Gets details about contact methods to be displayed as MenuItems
 */
function getContactMethodsOptions(translate: LocalizedTranslate, loginList?: LoginList, defaultEmail?: string) {
    if (!loginList) {
        return [];
    }

    // Sort the login list by placing the one corresponding to the default contact method as the first item.
    // The default contact method is determined by checking against the session email (the current login).
    const sortedLoginList = Object.entries(loginList).sort(([, loginData]) => (loginData.partnerUserID === defaultEmail ? -1 : 1));

    return sortedLoginList.map(([, login]) => {
        const isDefaultContactMethod = defaultEmail === login?.partnerUserID;
        const pendingAction = login?.pendingFields?.deletedLogin ?? login?.pendingFields?.addedLogin ?? undefined;
        if (!login?.partnerUserID && !pendingAction) {
            return null;
        }

        let description = '';
        if (defaultEmail === login?.partnerUserID) {
            description = translate('contacts.getInTouch');
        } else if (login?.errorFields?.addedLogin) {
            description = translate('contacts.failedNewContact');
        } else if (!login?.validatedDate) {
            description = translate('contacts.pleaseVerify');
        }
        let indicator;
        if (Object.values(login?.errorFields ?? {}).some((errorField) => !isEmptyObject(errorField))) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        } else if (!login?.validatedDate && !isDefaultContactMethod) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
        } else if (!login?.validatedDate && isDefaultContactMethod && sortedLoginList.length > 1) {
            indicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
        }

        const partnerUserID = login?.partnerUserID ? login.partnerUserID : '';
        const menuItemTitle = Str.isSMSLogin(partnerUserID) ? formatPhoneNumber(partnerUserID) : partnerUserID;

        return {
            partnerUserID,
            menuItemTitle,
            description,
            indicator,
            pendingAction,
        };
    });
}

export {
    generateAccountID,
    getLoginListBrickRoadIndicator,
    getProfilePageBrickRoadIndicator,
    hasLoginListError,
    hasLoginListInfo,
    hashText,
    getContactMethod,
    isCurrentUserValidated,
    getContactMethodsOptions,
    getLoginKey,
    getLastLogin,
    getDeviceLogins,
    getDeviceDisplayName,
    hasDeviceManagementError,
    expensifyLoginsSelector,
};
export type {AvatarSource};
