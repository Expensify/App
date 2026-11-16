import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {buildPersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';
import {waitForWrites} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import {translateLocal} from '@libs/Localize';
import {formatPhoneNumberWithCountryCode} from '@libs/LocalePhoneNumber';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import navigationRef from '@libs/Navigation/navigationRef';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {canMemberAssignRole, getMemberAccountIDsForWorkspace, isPolicyAdmin, isSubmitPolicy} from '@libs/PolicyUtils';
import {getAllPersonalDetails, getPersonalDetail} from '@libs/PersonalDetailsStore';
import {getAccountIDsByLogins, getNewAccountIDsAndLogins, getPersonalDetailsOnyxDataForOptimisticUsers} from '@libs/PersonalDetailsUtils';

import {addMembersToWorkspace} from '@userActions/Policy/Member';
import {createWorkspace} from '@userActions/Policy/Policy';
import {generateDefaultWorkspaceName, generatePolicyID} from '@userActions/Policy/PolicyDraft';
import {completeOnboarding} from '@userActions/Report';
import {beginSignIn, isAnonymousUser, signUpUser} from '@userActions/Session';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import NAVIGATORS from '@src/NAVIGATORS';
import type {InvitedEmailsToAccountIDs, Policy, PolicyEmployeeList} from '@src/types/onyx';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {hasActiveAdminPoliciesSelector, lastWorkspaceNumberSelector, ownerPoliciesSelector} from '@selectors/Policy';

import {Str} from 'expensify-common';

import {getCurrentAccountID, getOnboardingCompletedFlag, getPolicy, getSessionLogin, isRequestPending, isSignedIn, markSignInAttemptLoading, state} from './appductState';

type ToolResult = {
    ok: boolean;
    already?: boolean;
    state?: Record<string, unknown>;
    reason?: string;
};

type AppductTool = {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    outputSchema: Record<string, unknown>;
    timeoutMs: number;
    handler: (input: Record<string, unknown>) => Promise<ToolResult>;
};

const OUTPUT_SCHEMA = {
    type: 'object',
    properties: {
        ok: {type: 'boolean'},
        already: {type: 'boolean'},
        state: {type: 'object'},
        reason: {type: 'string'},
    },
    required: ['ok'],
};

const SIGN_IN_BUDGET_MS = 45_000;
const ONBOARDING_BUDGET_MS = 60_000;
const MODAL_CLOSE_BUDGET_MS = 5_000;
const POLICY_BUDGET_MS = 60_000;
const QUEUE_SETTLE_BUDGET_MS = 2_000;
const MAX_INVITEES = 20;

const stringInputSchema = (...fields: string[]) => ({
    type: 'object',
    properties: Object.fromEntries(fields.map((field) => [field, {type: 'string'}])),
    required: fields,
});

const fail = (reason: string): ToolResult => ({ok: false, reason});

// The input schema is not enforced at call time.
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const textList = (value: unknown) => (Array.isArray(value) ? value.map(text).filter(Boolean) : []);

// translateLocal reads the locale IntlStore already loaded, which is the same one the render path uses.
const localeTranslate: LocalizedTranslate = (path, ...parameters) => translateLocal(path, ...parameters);

const formatPhoneNumber = (phoneNumber: string) => formatPhoneNumberWithCountryCode(phoneNumber, state.countryCode ?? CONST.DEFAULT_COUNTRY_CODE);

function getErrorMessages(source: {errors?: OnyxCommon.Errors; errorFields?: OnyxCommon.ErrorFields} | undefined): string {
    if (!source) {
        return '';
    }
    const messages = Object.values(source.errors ?? {}).filter((message): message is string => !!message);
    for (const fieldErrors of Object.values(source.errorFields ?? {})) {
        messages.push(...Object.values(fieldErrors ?? {}).filter((message): message is string => !!message));
    }
    return messages.join('; ');
}

function waitFor(check: () => boolean, timeoutMs: number): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolve) => {
        const poll = () => {
            if (check()) {
                resolve(true);
            } else if (Date.now() >= deadline) {
                resolve(false);
            } else {
                setTimeout(poll, 100);
            }
        };
        poll();
    });
}

const getState: AppductTool = {
    name: 'get_state',
    description:
        'Report the app state of the current identity without acting: booted, signedIn, anonymous, login, accountID, onboardingCompleted, isLoadingApp. ' +
        'onboardingCompleted is the raw stored flag; null means it has not loaded yet.',
    inputSchema: {type: 'object', properties: {}},
    outputSchema: OUTPUT_SCHEMA,
    timeoutMs: 5_000,
    handler: async () => ({
        ok: true,
        state: {
            booted: !!state.session,
            signedIn: isSignedIn(),
            anonymous: isAnonymousUser(state.session),
            login: getPersonalDetail(getCurrentAccountID())?.login ?? getSessionLogin() ?? null,
            accountID: getCurrentAccountID() ?? null,
            onboardingCompleted: getOnboardingCompletedFlag(),
            isLoadingApp: state.isLoadingApp ?? null,
        },
    }),
};

const signIn: AppductTool = {
    name: 'sign_in',
    description:
        'Sign up and sign in a brand-new test account through the same actions the sign-in form performs (BeginSignIn, then SignUpUser). ' +
        'Only works for an email with no account yet: an existing account needs the emailed magic code, which this tool cannot read, so it returns ok:false. ' +
        'Guarantees a non-anonymous session whose login is the given email, checked before returning. Returns ok:false with a reason instead of throwing.',
    inputSchema: stringInputSchema('email'),
    outputSchema: OUTPUT_SCHEMA,
    timeoutMs: 120_000,
    handler: async (input) => {
        const email = text(input.email);
        if (!email) {
            return fail('email is required and must be a string');
        }
        const deadline = Date.now() + SIGN_IN_BUDGET_MS;
        const until = (check: () => boolean) => waitFor(check, deadline - Date.now());
        const identity = () => ({signedIn: true, accountID: getCurrentAccountID() ?? null, login: getSessionLogin() ?? null});

        if (!(await until(() => !!state.session))) {
            return fail('session Onyx key never populated (app not booted yet?)');
        }

        if (isSignedIn()) {
            return (getSessionLogin() ?? '').toLowerCase() === email.toLowerCase()
                ? {ok: true, already: true, state: identity()}
                : fail(`already signed in as ${getSessionLogin() ?? 'an unknown login'}, not ${email}`);
        }

        await markSignInAttemptLoading();
        beginSignIn(email);
        if (!(await until(() => state.account?.isLoading === false))) {
            return fail(`BeginSignIn got no response within ${SIGN_IN_BUDGET_MS}ms`);
        }

        if (!isSignedIn()) {
            if (state.account?.accountExists) {
                return fail('account already exists and needs the emailed magic code to sign in');
            }
            if (state.account?.errors && Object.keys(state.account.errors).length > 0) {
                return fail(`beginSignIn failed: ${JSON.stringify(state.account.errors)}`);
            }
            signUpUser(email, IntlStore.getCurrentLocale(), undefined, undefined, state.session);
            if (!(await until(isSignedIn))) {
                return {
                    ...fail(`no session token within ${SIGN_IN_BUDGET_MS}ms`),
                    state: {isLoading: state.account?.isLoading ?? null, accountExists: state.account?.accountExists ?? null, errors: state.account?.errors ?? null},
                };
            }
        }
        return {ok: true, state: identity()};
    },
};

function isOnboardingModalClosed(): boolean {
    return !navigationRef.isReady() || !navigationRef.getRootState()?.routes.some((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
}

const completeOnboardingTool: AppductTool = {
    name: 'complete_onboarding',
    description:
        'Complete first-run onboarding with the "looking around" engagement choice and the given name, through the same action the onboarding form performs. ' +
        'Waits for the stored onboarding-complete flag after the write queue drains, then closes the onboarding modal and lands on the home screen. ' +
        'Returns ok:false with a reason instead of throwing.',
    inputSchema: stringInputSchema('firstName', 'lastName'),
    outputSchema: OUTPUT_SCHEMA,
    timeoutMs: 180_000,
    handler: async (input) => {
        const firstName = text(input.firstName);
        const lastName = text(input.lastName);
        if (!firstName || !lastName) {
            return fail('firstName and lastName are required strings');
        }

        if (!(await waitFor(() => isSignedIn() && state.isLoadingApp === false && getOnboardingCompletedFlag() !== null, ONBOARDING_BUDGET_MS))) {
            return fail(
                `onboarding preconditions never held within ${ONBOARDING_BUDGET_MS}ms: ` +
                    `signedIn=${isSignedIn()}, isLoadingApp=${String(state.isLoadingApp)}, onboardingLoaded=${getOnboardingCompletedFlag() !== null}`,
            );
        }

        let already = false;
        if (isGuidedSetupPending()) {
            if (!(await waitFor(() => !isGuidedSetupPending() && getOnboardingCompletedFlag() === true, ONBOARDING_BUDGET_MS))) {
                return fail('a CompleteGuidedSetup request stayed queued past the timeout, or its response reverted the flag');
            }
        } else if (getOnboardingCompletedFlag() === true) {
            already = true;
        } else {
            // Without the Concierge chat as its target, completeOnboarding silently does nothing.
            if (!(await waitFor(() => !!state.conciergeReportID && !!state.conciergeChat?.reportID, ONBOARDING_BUDGET_MS))) {
                return fail(`concierge report never loaded (conciergeReportID=${String(state.conciergeReportID)})`);
            }

            const {onboardingMessages} = getOnboardingMessages(IntlStore.getCurrentLocale());
            await completeOnboarding({
                engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
                onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.LOOKING_AROUND],
                firstName,
                lastName,
                adminsChatReportID: state.onboardingAdminsChatReportID,
                onboardingPolicyID: state.onboardingPolicyID,
                introSelected: state.introSelected,
                isSelfTourViewed: hasSeenTourSelector(state.onboarding),
                conciergeChat: state.conciergeChat,
                currentUserAccountID: getCurrentAccountID() ?? CONST.DEFAULT_NUMBER_ID,
                delegateAccountID: undefined,
            });

            // waitForWrites also resolves offline, so check the queue too.
            await waitForWrites(WRITE_COMMANDS.COMPLETE_GUIDED_SETUP);
            if (!(await waitFor(() => !isRequestPending(WRITE_COMMANDS.COMPLETE_GUIDED_SETUP), QUEUE_SETTLE_BUDGET_MS))) {
                return fail('CompleteGuidedSetup never left the queue (offline? the server never saw it)');
            }
            if (getOnboardingCompletedFlag() !== true) {
                return fail('server rejected CompleteGuidedSetup: the onboarding flag reverted to false');
            }
        }

        // A fresh signed-in CI account: canUseDefaultRooms and isAnonymousUser are both false.
        navigateAfterOnboardingWithMicrotaskQueue(getIsSmallScreenWidth(), false, state.conciergeReportID, undefined, false, state.onboardingPolicyID, undefined, false);
        if (!(await waitFor(isOnboardingModalClosed, MODAL_CLOSE_BUDGET_MS))) {
            return fail(`the onboarding modal stayed open after navigateAfterOnboarding (${MODAL_CLOSE_BUDGET_MS}ms)`);
        }

        const result = {ok: true, state: {onboardingCompleted: true, onboardingModalClosed: true}};
        return already ? {...result, already: true} : result;
    },
};

type PolicyReadBack = {ok: true; policy: Policy} | {ok: false; reason: string};

/**
 * A policy whose add pendingAction is still set never reached the server: CreateWorkspace clears it on success and its
 * failure data leaves it in place, so a stuck one is a failed create rather than a slow one.
 */
async function readBackPolicy(policyID: string): Promise<PolicyReadBack> {
    const settled = await waitFor(() => {
        const policy = getPolicy(policyID);
        return !!policy && policy.pendingAction == null;
    }, POLICY_BUDGET_MS);

    const policy = getPolicy(policyID);
    if (!policy) {
        return {ok: false, reason: `policy ${policyID} never appeared in Onyx`};
    }
    if (!settled) {
        return {ok: false, reason: `policy ${policyID} kept its add pendingAction, so CreateWorkspace did not succeed`};
    }
    const errors = getErrorMessages(policy);
    if (errors) {
        return {ok: false, reason: `workspace holds errors: ${errors}`};
    }
    return {ok: true, policy};
}

const createWorkspaceTool: AppductTool = {
    name: 'create_workspace',
    description:
        'Create a workspace owned and administered by the signed-in user through the same action the new-workspace flow performs (CreateWorkspace). ' +
        'Returns the policyID to pass to invite_members. Waits for the write to reach the server and reads the policy back, so ok:true means the ' +
        'workspace exists and this user administers it. With a name, a repeated call reports already:true and the existing policyID instead of ' +
        'creating a second workspace; without one, every call creates another. It also makes the new workspace the active one. Returns ok:false with a reason instead of throwing.',
    inputSchema: {type: 'object', properties: {name: {type: 'string'}, currency: {type: 'string'}}},
    outputSchema: OUTPUT_SCHEMA,
    timeoutMs: 180_000,
    handler: async (input) => {
        if (!(await waitFor(() => isSignedIn() && state.isLoadingApp === false, POLICY_BUDGET_MS))) {
            return fail(
                `workspace preconditions never held within ${POLICY_BUDGET_MS}ms: signedIn=${isSignedIn()}, isLoadingApp=${String(state.isLoadingApp)}`,
            );
        }

        const accountID = getCurrentAccountID() ?? CONST.DEFAULT_NUMBER_ID;
        const personalDetail = getPersonalDetail(accountID);
        const login = personalDetail?.login ?? getSessionLogin() ?? '';

        // A CreateWorkspace from an earlier call may still be in flight. Its optimistic policy carries the add
        // pendingAction, so neither the name match below nor the default-name counter can be trusted until it settles.
        if (isRequestPending(WRITE_COMMANDS.CREATE_WORKSPACE) && !(await waitFor(() => !isRequestPending(WRITE_COMMANDS.CREATE_WORKSPACE), POLICY_BUDGET_MS))) {
            return fail(`a previous CreateWorkspace was still queued after ${POLICY_BUDGET_MS}ms (offline? the server never saw it)`);
        }

        const requestedName = text(input.name);
        const policyName =
            requestedName ||
            generateDefaultWorkspaceName(login, personalDetail?.displayName, lastWorkspaceNumberSelector(state.policies, login, personalDetail?.displayName, localeTranslate), localeTranslate);
        if (!policyName) {
            return fail(`could not name the workspace from login "${login}"; pass name`);
        }

        if (requestedName) {
            const matches = Object.values(state.policies ?? {}).filter(
                (policy) => policy?.name === requestedName && policy.pendingAction == null && !getErrorMessages(policy) && isPolicyAdmin(policy, login),
            );
            if (matches.length === 1) {
                const [existing] = matches;
                return {
                    ok: true,
                    already: true,
                    state: {policyID: existing?.id ?? null, name: existing?.name ?? null, role: existing?.role ?? null, owner: existing?.owner ?? null},
                };
            }
        }

        const policyID = generatePolicyID();
        createWorkspace({
            policyOwner: undefined,
            makeMeAdmin: false,
            policyName,
            policyID,
            engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
            currency: text(input.currency) || personalDetail?.localCurrencyCode || '',
            file: undefined,
            // A seeded test workspace gets no Concierge onboarding tasks and no welcome message, so a run that creates
            // several workspaces is not followed by a task in each #admins room.
            shouldAddOnboardingTasks: false,
            shouldAddGuideWelcomeMessage: false,
            introSelected: state.introSelected,
            activePolicy: getPolicy(state.activePolicyID ?? ''),
            conciergeChat: state.conciergeChat,
            currentUserAccountIDParam: accountID,
            currentUserEmailParam: login,
            isSelfTourViewed: hasSeenTourSelector(state.onboarding),
            hasActiveAdminPolicies: hasActiveAdminPoliciesSelector(state.policies, login),
            hasOwnedPaidPolicy: ownerPoliciesSelector(state.policies, accountID).length > 0,
            delegateAccountID: undefined,
        });

        await waitForWrites(WRITE_COMMANDS.CREATE_WORKSPACE);
        if (!(await waitFor(() => !isRequestPending(WRITE_COMMANDS.CREATE_WORKSPACE), QUEUE_SETTLE_BUDGET_MS))) {
            return fail('CreateWorkspace never left the queue (offline? the server never saw it)');
        }

        const readBack = await readBackPolicy(policyID);
        if (!readBack.ok) {
            return fail(readBack.reason);
        }
        if (readBack.policy.role !== CONST.POLICY.ROLE.ADMIN) {
            return fail(`workspace ${policyID} was created with role ${String(readBack.policy.role)}, not ${CONST.POLICY.ROLE.ADMIN}`);
        }

        return {ok: true, state: {policyID, name: readBack.policy.name, role: readBack.policy.role, owner: readBack.policy.owner ?? null}};
    },
};

type InviteOutcome = {
    email: string;
    accountID: number;
    status: 'invited' | 'already' | 'failed' | 'not added';
    role?: string;
    detail?: string;
};

function findEmployee(employeeList: PolicyEmployeeList | undefined, email: string): PolicyEmployee | undefined {
    return employeeList?.[email] ?? Object.entries(employeeList ?? {}).find(([login]) => login.toLowerCase() === email)?.[1];
}

const inviteMembers: AppductTool = {
    name: 'invite_members',
    description:
        'Invite email addresses to a workspace the signed-in user administers, through the same action the invite flow performs (AddMembersToWorkspace). ' +
        'An address with no Expensify account gets one, and sign_in can no longer sign that account in afterwards because it only creates brand-new ones. ' +
        'The invite sends the invited user an email and an in-app mention, so invite addresses the run owns. Waits for the write to reach the server and ' +
        'reads each member back from the policy, reporting one result per address with the role Onyx holds (a Submit workspace forces editor for everyone). ' +
        'ok:true only when every address ended up a member; already:true when they all already were. Returns ok:false with a reason instead of throwing.',
    inputSchema: {
        type: 'object',
        properties: {policyID: {type: 'string'}, emails: {type: 'array', items: {type: 'string'}}, role: {type: 'string'}},
        required: ['policyID', 'emails'],
    },
    outputSchema: OUTPUT_SCHEMA,
    timeoutMs: 180_000,
    handler: async (input) => {
        const policyID = text(input.policyID);
        if (!policyID) {
            return fail('policyID is required and must be a string');
        }
        const emails = textList(input.emails);
        if (emails.length === 0) {
            return fail('emails is required and must be a non-empty array of email strings');
        }
        if (emails.length > MAX_INVITEES) {
            return fail(`emails holds ${emails.length} addresses; the limit is ${MAX_INVITEES}`);
        }

        if (!(await waitFor(() => isSignedIn() && state.isLoadingApp === false, POLICY_BUDGET_MS))) {
            return fail(
                `invite preconditions never held within ${POLICY_BUDGET_MS}ms: signedIn=${isSignedIn()}, isLoadingApp=${String(state.isLoadingApp)}`,
            );
        }

        const accountID = getCurrentAccountID() ?? CONST.DEFAULT_NUMBER_ID;
        const currentUserDetail = getPersonalDetail(accountID);
        const login = currentUserDetail?.login ?? getSessionLogin() ?? '';

        if (!(await waitFor(() => getPolicy(policyID)?.pendingAction == null, POLICY_BUDGET_MS))) {
            const policy = getPolicy(policyID);
            return fail(policy ? `workspace ${policyID} is still being created (pendingAction=${String(policy.pendingAction)})` : `policy ${policyID} not found in Onyx`);
        }
        const policy = getPolicy(policyID);
        if (!policy) {
            return fail(`policy ${policyID} not found in Onyx`);
        }
        if (!isPolicyAdmin(policy, login)) {
            return fail(`the signed-in user is not an admin of ${policyID} (role=${String(policy.role)})`);
        }

        const requestedRole = text(input.role) || CONST.POLICY.ROLE.USER;
        const role = isSubmitPolicy(policy) ? CONST.POLICY.ROLE.EDITOR : requestedRole;
        if (!isSubmitPolicy(policy) && !canMemberAssignRole(policy, login, role)) {
            return fail(`the signed-in user cannot assign the "${role}" role on ${policyID}`);
        }

        const rejected: string[] = [];
        const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {};
        const outcomes: InviteOutcome[] = [];
        const seen = new Set<string>();
        for (const rawEmail of emails) {
            const email = rawEmail.toLowerCase();
            if (seen.has(email)) {
                continue;
            }
            seen.add(email);
            if (!Str.isValidEmail(email)) {
                rejected.push(`${rawEmail} is not a valid email address`);
                continue;
            }
            if (email === login.toLowerCase()) {
                rejected.push(`${email} is the signed-in user, who is already a member`);
                continue;
            }
            if (CONST.EXPENSIFY_EMAILS_OBJECT[email]) {
                rejected.push(`${email} is an Expensify system address, which the invite flow excludes`);
                continue;
            }

            const invitedAccountID = getAccountIDsByLogins([email]).at(0) ?? CONST.DEFAULT_NUMBER_ID;
            const existing = findEmployee(policy.employeeList, email);
            // A member entry with an add pendingAction is an invite already on its way, so a second one would race it.
            if (existing && existing.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !getErrorMessages(existing)) {
                outcomes.push({email, accountID: invitedAccountID, status: 'already', role: existing.role ?? role});
                continue;
            }
            outcomes.push({email, accountID: invitedAccountID, status: 'invited'});
            invitedEmailsToAccountIDs[addSMSDomainIfPhoneNumber(email)] = invitedAccountID;
        }

        if (rejected.length > 0) {
            return fail(rejected.join('; '));
        }

        if (Object.keys(invitedEmailsToAccountIDs).length > 0) {
            const {newAccountIDs, newLogins} = getNewAccountIDsAndLogins(invitedEmailsToAccountIDs, getAllPersonalDetails());
            addMembersToWorkspace(
                invitedEmailsToAccountIDs,
                getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs, formatPhoneNumber),
                `${translateLocal('workspace.common.invitedYouToWorkspace', currentUserDetail?.displayName ?? '', policy.name)}\n\n${translateLocal('workspace.common.welcomeNote')}`,
                policy,
                Object.values(getMemberAccountIDsForWorkspace(policy.employeeList, buildPersonalDetailsByLogin(getAllPersonalDetails()), false, false)),
                role,
                {accountID, displayName: currentUserDetail?.displayName, email: login, avatar: currentUserDetail?.avatar},
                // The list only un-archives the expense-chat reports of members who already had one, which a fresh test
                // workspace has none of, and the server sends the real report state either way.
                {},
            );

            await waitForWrites(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE);
            if (!(await waitFor(() => !isRequestPending(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE), QUEUE_SETTLE_BUDGET_MS))) {
                return fail('AddMembersToWorkspace never left the queue (offline? the server never saw it)');
            }

            const employeeList = getPolicy(policyID)?.employeeList;
            for (const outcome of outcomes) {
                if (outcome.status !== 'invited') {
                    continue;
                }
                const member = findEmployee(employeeList, outcome.email);
                if (!member) {
                    outcome.status = 'not added';
                    continue;
                }
                const errors = getErrorMessages(member);
                if (errors) {
                    outcome.status = 'failed';
                    outcome.detail = errors;
                    continue;
                }
                outcome.role = member.role ?? role;
            }
        }

        const failures = outcomes.filter((outcome) => outcome.status !== 'invited' && outcome.status !== 'already');
        const result: ToolResult = {
            ok: failures.length === 0,
            state: {policyID, role, members: outcomes},
        };
        if (failures.length > 0) {
            return {
                ...result,
                ok: false,
                reason: `members not invited: ${failures.map((outcome) => `${outcome.email} (${outcome.status}${outcome.detail ? `: ${outcome.detail}` : ''})`).join(', ')}`,
            };
        }
        return Object.keys(invitedEmailsToAccountIDs).length === 0 ? {...result, already: true} : result;
    },
};

const tools: AppductTool[] = [getState, signIn, completeOnboardingTool, createWorkspaceTool, inviteMembers];

export default tools;
