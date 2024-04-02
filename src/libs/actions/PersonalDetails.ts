import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    CompleteEngagementModalParams,
    CompleteGuidedSetupParams,
    UpdateAutomaticTimezoneParams,
    UpdateDateOfBirthParams,
    UpdateDisplayNameParams,
    UpdateHomeAddressParams,
    UpdateLegalNameParams,
    UpdatePronounsParams,
    UpdateSelectedTimezoneParams,
    UpdateUserAvatarParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as UserUtils from '@libs/UserUtils';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {DateOfBirthForm} from '@src/types/form';
import type {PersonalDetails, PersonalDetailsList, PrivatePersonalDetails, ReportAction} from '@src/types/onyx';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import * as Session from './Session';
import * as ReportUtils from '@libs/ReportUtils';
import type {OptimisticAddCommentReportAction} from '@libs/ReportUtils';
import * as NumberUtils from '@libs/NumberUtils';
import type * as OnyxTypes from '@src/types/onyx';

let currentUserEmail = '';
let currentUserAccountID = -1;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? '';
        currentUserAccountID = val?.accountID ?? -1;
    },
});

let allPersonalDetails: OnyxEntry<PersonalDetailsList> = null;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = val),
});

let privatePersonalDetails: OnyxEntry<PrivatePersonalDetails> = null;
Onyx.connect({
    key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    callback: (val) => (privatePersonalDetails = val),
});

function updatePronouns(pronouns: string) {
    if (currentUserAccountID) {
        const parameters: UpdatePronounsParams = {pronouns};

        API.write(WRITE_COMMANDS.UPDATE_PRONOUNS, parameters, {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            pronouns,
                        },
                    },
                },
            ],
        });
    }

    Navigation.goBack();
}

function updateDisplayName(firstName: string, lastName: string) {
    if (currentUserAccountID) {
        const parameters: UpdateDisplayNameParams = {firstName, lastName};

        API.write(WRITE_COMMANDS.UPDATE_DISPLAY_NAME, parameters, {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            firstName,
                            lastName,
                            displayName: PersonalDetailsUtils.createDisplayName(currentUserEmail ?? '', {
                                firstName,
                                lastName,
                            }),
                        },
                    },
                },
            ],
        });
    }

    Navigation.goBack();
}

function updateLegalName(legalFirstName: string, legalLastName: string) {
    const parameters: UpdateLegalNameParams = {legalFirstName, legalLastName};

    API.write(WRITE_COMMANDS.UPDATE_LEGAL_NAME, parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                value: {
                    legalFirstName,
                    legalLastName,
                },
            },
        ],
    });

    Navigation.goBack();
}

/**
 * @param dob - date of birth
 */
function updateDateOfBirth({dob}: DateOfBirthForm) {
    const parameters: UpdateDateOfBirthParams = {dob};

    API.write(WRITE_COMMANDS.UPDATE_DATE_OF_BIRTH, parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                value: {
                    dob,
                },
            },
        ],
    });

    Navigation.goBack();
}

function updateAddress(street: string, street2: string, city: string, state: string, zip: string, country: Country | '') {
    const parameters: UpdateHomeAddressParams = {
        homeAddressStreet: street,
        addressStreet2: street2,
        homeAddressCity: city,
        addressState: state,
        addressZipCode: zip,
        addressCountry: country,
    };

    // State names for the United States are in the form of two-letter ISO codes
    // State names for other countries except US have full names, so we provide two different params to be handled by server
    if (country !== CONST.COUNTRY.US) {
        parameters.addressStateLong = state;
    }

    API.write(WRITE_COMMANDS.UPDATE_HOME_ADDRESS, parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                value: {
                    address: {
                        street: PersonalDetailsUtils.getFormattedStreet(street, street2),
                        city,
                        state,
                        zip,
                        country,
                    },
                },
            },
        ],
    });

    Navigation.goBack();
}

/**
 * Updates timezone's 'automatic' setting, and updates
 * selected timezone if set to automatically update.
 */
function updateAutomaticTimezone(timezone: Timezone) {
    if (Session.isAnonymousUser()) {
        return;
    }

    if (!currentUserAccountID) {
        return;
    }

    const formatedTimezone = DateUtils.formatToSupportedTimezone(timezone);
    const parameters: UpdateAutomaticTimezoneParams = {
        timezone: JSON.stringify(formatedTimezone),
    };

    API.write(WRITE_COMMANDS.UPDATE_AUTOMATIC_TIMEZONE, parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: {
                    [currentUserAccountID]: {
                        timezone: formatedTimezone,
                    },
                },
            },
        ],
    });
}

/**
 * Updates user's 'selected' timezone, then navigates to the
 * initial Timezone page.
 */
function updateSelectedTimezone(selectedTimezone: SelectedTimezone) {
    const timezone: Timezone = {
        selected: selectedTimezone,
    };

    const parameters: UpdateSelectedTimezoneParams = {
        timezone: JSON.stringify(timezone),
    };

    if (currentUserAccountID) {
        API.write(WRITE_COMMANDS.UPDATE_SELECTED_TIMEZONE, parameters, {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            timezone,
                        },
                    },
                },
            ],
        });
    }

    Navigation.goBack(ROUTES.SETTINGS_TIMEZONE);
}

/**
 * Fetches additional personal data like legal name, date of birth, address
 */
function openPersonalDetails() {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    API.read(READ_COMMANDS.OPEN_PERSONAL_DETAILS, {}, {optimisticData, successData, failureData});
}

/**
 * Fetches public profile info about a given user.
 * The API will only return the accountID, displayName, and avatar for the user
 * but the profile page will use other info (e.g. contact methods and pronouns) if they are already available in Onyx
 */
function openPublicProfilePage(accountID: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_METADATA,
            value: {
                [accountID]: {
                    isLoading: true,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_METADATA,
            value: {
                [accountID]: {
                    isLoading: false,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_METADATA,
            value: {
                [accountID]: {
                    isLoading: false,
                },
            },
        },
    ];

    /** ****************************************************************************************************************
     * POC for generating optimistic data and passing it to `CompleteGuidedSetup`, for testing only.
     * Here we create, in order:
     * - Two messages in the Concierge chat
     * - One task in the Concierge chat
     * - One message inside the task
     * - A second task in the Concierge chat
     * - One message inside the second task
     * ****************************************************************************************************************/

    // -- Message 1 (video)
    const reportComment = ReportUtils.buildOptimisticAddCommentReportAction(CONST.ATTACHMENT_MESSAGE_TEXT, undefined);
    const reportCommentAction: OptimisticAddCommentReportAction = reportComment.reportAction;
    const reportCommentText = reportComment.commentText;

    // -- Message 2
    const reportComment2 = ReportUtils.buildOptimisticAddCommentReportAction('Second 👍 message', undefined);
    const reportCommentAction2: OptimisticAddCommentReportAction = reportComment2.reportAction;
    const reportCommentText2 = reportComment2.commentText;

    // -- Task 1
    const title = `Task 1 Hello World - #${Math.round(Math.random() * 100000)}`;
    const parentReportID = ReportUtils.getChatByParticipants(PersonalDetailsUtils.getAccountIDsByLogins(['concierge@expensify.com']))?.reportID ?? '';

    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserAccountID, 0, parentReportID, title);

    const assigneeChatReportID = ''; // Tasks should not be assigned to anyone
    const taskReportID = optimisticTaskReport.reportID;

    // Parent ReportAction indicating that a task has been created
    const optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
    const optimisticAddCommentReport = ReportUtils.buildOptimisticTaskCommentReportAction(taskReportID, title, 0, `task for ${title}`, parentReportID);
    optimisticTaskReport.parentReportActionID = optimisticAddCommentReport.reportAction.reportActionID;

    // -- Message inside task 1
    const reportComment3 = ReportUtils.buildOptimisticAddCommentReportAction('Message inside the task', undefined);
    const reportCommentAction3: OptimisticAddCommentReportAction = reportComment3.reportAction;
    const reportCommentText3 = reportComment3.commentText;

    // --- Task 2
    const title2 = `This CreateWorkspace task should auto-complete – #${Math.round(Math.random() * 100000)}`;
    const optimisticTaskReport2 = ReportUtils.buildOptimisticTaskReport(currentUserAccountID, 0, parentReportID, title2);

    const taskReportID2 = optimisticTaskReport2.reportID;

    const optimisticTaskCreatedAction2 = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
    const optimisticAddCommentReport2 = ReportUtils.buildOptimisticTaskCommentReportAction(taskReportID2, title2, 0, `task for ${title2}`, parentReportID);
    optimisticTaskReport2.parentReportActionID = optimisticAddCommentReport2.reportAction.reportActionID;

    // -- Message inside task 2
    const reportComment4 = ReportUtils.buildOptimisticAddCommentReportAction('Message inside the second task', undefined);
    const reportCommentAction4: OptimisticAddCommentReportAction = reportComment4.reportAction;
    const reportCommentText4 = reportComment4.commentText;

    /*
     * Each element in the `data` array represents either a message or a task, with a `type` that is either `message`, `task` or `video`.
     * The other attributes are based on `AddCommentOrAttachementParams` and `CreateTaskParams` respectively.
     *
     * Each task must also have a `task` attribute, whose value can be one of:
     *  'addExpenseApprovals'
     *  'createWorkspace'
     *  'enableWallet'
     *  'inviteTeam'
     *  'meetGuide'
     *  'requestMoney'
     *  'setupCategories'
     *  'startChat'
     *  'submitExpense'
     *  'trackExpense'
     *
     * The `createWorkspace` task also needs the optimistic ID of a report action to complete the task, because that task
     * gets immediately completed in the backend after we create it.
     */
    const parameters2: CompleteGuidedSetupParams = {
        firstName: 'Jane',
        lastName: 'Smith',
        data: JSON.stringify([{
            reportID: parentReportID,
            reportActionID: reportCommentAction.reportActionID,
            reportComment: reportCommentText,
            url: `${CONST.CLOUDFRONT_URL}/videos/intro-1280.mp4`,
            duration: 55,
            width: 1280,
            height: 960,
            thumbnailUrl: `${CONST.CLOUDFRONT_URL}/images/expensify__favicon.png`,
            type: 'video',
        }, {
            reportID: parentReportID,
            reportActionID: reportCommentAction2.reportActionID,
            reportComment: reportCommentText2,
            type: 'message',
        }, {
            parentReportActionID: optimisticAddCommentReport.reportAction.reportActionID,
            parentReportID,
            taskReportID: optimisticTaskReport.reportID,
            createdTaskReportActionID: optimisticTaskCreatedAction.reportActionID,
            title: optimisticTaskReport.reportName,
            description: optimisticTaskReport.description,
            assigneeChatReportID,
            type: 'task',
            task: 'trackExpense',
        }, {
            reportID: optimisticTaskReport.reportID,
            reportActionID: reportCommentAction3.reportActionID,
            reportComment: reportCommentText3,
            type: 'message',
        }, {
            parentReportActionID: optimisticAddCommentReport2.reportAction.reportActionID,
            parentReportID,
            taskReportID: optimisticTaskReport2.reportID,
            createdTaskReportActionID: optimisticTaskCreatedAction2.reportActionID,
            title: optimisticTaskReport2.reportName,
            description: optimisticTaskReport2.description,
            assigneeChatReportID,
            // The `createWorkspace` tasks needs an action ID because we'll immediately complete it in the backend.
            completedTaskReportActionID: NumberUtils.rand64(), // TODO: Use the ID of a proper optimistic action ID instead, see `Task.completeTask`
            type: 'task',
            task: 'createWorkspace',
        }, {
            reportID: optimisticTaskReport2.reportID,
            reportActionID: reportCommentAction4.reportActionID,
            reportComment: reportCommentText4,
            type: 'message',
        }]),
        engagementChoice: 'newDotValue',
    };

    const optimisticData2: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {
                // Message 1 (video)
                [reportCommentAction.reportActionID ?? '']: reportCommentAction as ReportAction,
                // Message 2 (plain text)
                [reportCommentAction2.reportActionID ?? '']: reportCommentAction2 as ReportAction,
            },
        }, {
            // This doesn't seem to work, not sure why
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: {
                ...optimisticTaskReport,
                isOptimisticReport: true,
            },
        }, {
            // This doesn't seem to work either, not sure why
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: optimisticTaskCreatedAction as OnyxTypes.ReportAction},
        }
    ];

    API.write(WRITE_COMMANDS.COMPLETE_GUIDED_SETUP, parameters2, {
        // TODO: fill out other optimistic values (tasks and messages inside tasks)
        optimisticData: optimisticData2
    });

    // API.read(READ_COMMANDS.OPEN_PUBLIC_PROFILE_PAGE, parameters, {optimisticData, successData, failureData});
}

/**
 * Updates the user's avatar image
 */
function updateAvatar(file: File | CustomRNImageManipulatorResult) {
    if (!currentUserAccountID) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: file.uri,
                    avatarThumbnail: file.uri,
                    originalFileName: file.name,
                    errorFields: {
                        avatar: null,
                    },
                    pendingFields: {
                        avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        originalFileName: null,
                    },
                    fallbackIcon: file.uri,
                },
            },
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    pendingFields: {
                        avatar: null,
                    },
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: allPersonalDetails?.[currentUserAccountID]?.avatar,
                    avatarThumbnail: allPersonalDetails?.[currentUserAccountID]?.avatarThumbnail ?? allPersonalDetails?.[currentUserAccountID]?.avatar,
                    pendingFields: {
                        avatar: null,
                    },
                } as OnyxEntry<Partial<PersonalDetails>>,
            },
        },
    ];

    const parameters: UpdateUserAvatarParams = {file};

    API.write(WRITE_COMMANDS.UPDATE_USER_AVATAR, parameters, {optimisticData, successData, failureData});
}

/**
 * Replaces the user's avatar image with a default avatar
 */
function deleteAvatar() {
    if (!currentUserAccountID) {
        return;
    }

    // We want to use the old dot avatar here as this affects both platforms.
    const defaultAvatar = UserUtils.getDefaultAvatarURL(currentUserAccountID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: defaultAvatar,
                    fallbackIcon: null,
                },
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: allPersonalDetails?.[currentUserAccountID]?.avatar,
                    fallbackIcon: allPersonalDetails?.[currentUserAccountID]?.fallbackIcon,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.DELETE_USER_AVATAR, {}, {optimisticData, failureData});
}

/**
 * Clear error and pending fields for the current user's avatar
 */
function clearAvatarErrors() {
    if (!currentUserAccountID) {
        return;
    }

    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [currentUserAccountID]: {
            errorFields: {
                avatar: null,
            },
            pendingFields: {
                avatar: null,
            },
        },
    });
}

/**
 * Get private personal details value
 */
function getPrivatePersonalDetails(): OnyxEntry<PrivatePersonalDetails> {
    return privatePersonalDetails;
}

export {
    clearAvatarErrors,
    deleteAvatar,
    getPrivatePersonalDetails,
    openPersonalDetails,
    openPublicProfilePage,
    updateAddress,
    updateAutomaticTimezone,
    updateAvatar,
    updateDateOfBirth,
    updateDisplayName,
    updateLegalName,
    updatePronouns,
    updateSelectedTimezone,
};
