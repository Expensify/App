/**
 *   _____                      __         __
 *  / ___/__ ___  ___ _______ _/ /____ ___/ /
 * / (_ / -_) _ \/ -_) __/ _ \`/ __/ -_) _  /
 * \___/\__/_//_/\__/_/  \_,_/\__/\__/\_,_/
 *
 * This file was automatically generated. Please consider these alternatives before manually editing it:
 *
 * - Improve the prompts in prompts/translation, or
 * - Improve context annotations in src/languages/en.ts
 */
import {CONST as COMMON_CONST} from 'expensify-common';
import startCase from 'lodash/startCase';
import type {ValueOf} from 'type-fest';
import type {OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
import StringUtils from '@libs/StringUtils';
import dedent from '@libs/StringUtils/dedent';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type {OriginalMessageSettlementAccountLocked, PersonalRulesModifiedFields, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
import type en from './en';
import type {
    ChangeFieldParams,
    ConciergeBrokenCardConnectionParams,
    ConnectionNameParams,
    DelegateRoleParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    ExportAgainModalDescriptionParams,
    ExportIntegrationSelectedParams,
    IntacctMappingTitleParams,
    InvalidPropertyParams,
    InvalidValueParams,
    MarkReimbursedFromIntegrationParams,
    MissingPropertyParams,
    MovedFromPersonalSpaceParams,
    NotAllowedExtensionParams,
    OptionalParam,
    PaidElsewhereParams,
    ParentNavigationSummaryParams,
    RemovedFromApprovalWorkflowParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ResolutionConstraintsParams,
    ShareParams,
    SizeExceededParams,
    StepCounterParams,
    SyncStageNameConnectionsParams,
    UnshareParams,
    UnsupportedFormulaValueErrorParams,
    UpdateRoleParams,
    ViolationsIncreasedDistanceParams,
    ViolationsModifiedAmountParams,
    WorkspaceLockedPlanTypeParams,
    YourPlanPriceParams,
} from './params';
import type {TranslationDeepObject} from './types';

type StateValue = {
    stateISO: string;
    stateName: string;
};
type States = Record<keyof typeof COMMON_CONST.STATES, StateValue>;
type AllCountries = Record<Country, string>;
const translations: TranslationDeepObject<typeof en> = {
    common: {
        count: '[es][ctx: Used as a noun meaning a numerical total or quantity, not the verb “to count.”] Count',
        cancel: '[es] Cancel',
        dismiss: '[es][ctx: Refers to closing or hiding a notification or message, not rejecting or ignoring something.] Dismiss',
        proceed: '[es][ctx: Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”] Proceed',
        unshare: '[es] Unshare',
        yes: '[es] Yes',
        no: '[es] No',
        ok: '[es][ctx: Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.] OK',
        notNow: '[es] Not now',
        noThanks: '[es] No thanks',
        learnMore: '[es] Learn more',
        buttonConfirm: '[es] Got it',
        name: '[es] Name',
        attachment: '[es] Attachment',
        attachments: '[es] Attachments',
        center: '[es] Center',
        from: '[es] From',
        to: '[es] To',
        in: '[es] In',
        optional: '[es] Optional',
        new: '[es] New',
        newFeature: '[es] New feature',
        beta: '[es] Beta',
        search: '[es] Search',
        reports: '[es] Reports',
        spend: '[es] Spend',
        find: '[es] Find',
        searchWithThreeDots: '[es] Search...',
        next: '[es] Next',
        previous: '[es] Previous',
        previousMonth: '[es] Previous month',
        nextMonth: '[es] Next month',
        previousYear: '[es] Previous year',
        nextYear: '[es] Next year',
        goBack: '[es][ctx: Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.] Go back',
        create: '[es] Create',
        add: '[es] Add',
        resend: '[es] Resend',
        save: '[es] Save',
        select: '[es] Select',
        deselect: '[es] Deselect',
        selectMultiple: '[es][ctx: Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.] Select multiple',
        saveChanges: '[es] Save changes',
        submit: '[es] Submit',
        submitted: '[es][ctx: Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”] Submitted',
        rotate: '[es] Rotate',
        zoom: '[es] Zoom',
        password: '[es] Password',
        magicCode: '[es] Magic code',
        digits: '[es] digits',
        twoFactorCode: '[es] Two-factor code',
        workspaces: '[es] Workspaces',
        home: '[es] Home',
        inbox: '[es] Inbox',
        yourReviewIsRequired: '[es] Your review is required',
        actionBadge: {
            submit: '[es] Submit',
            approve: '[es] Approve',
            pay: '[es] Pay',
            fix: '[es] Fix',
            task: '[es] Task',
        },
        success: '[es][ctx: Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”] Success',
        group: '[es] Group',
        profile: '[es] Profile',
        referral: '[es] Referral',
        payments: '[es] Payments',
        approvals: '[es] Approvals',
        wallet: '[es] Wallet',
        preferences: '[es] Preferences',
        view: '[es] View',
        review: (amount?: string) => `[es] Review${amount ? ` ${amount}` : ''}`,
        not: '[es] Not',
        signIn: '[es] Sign in',
        signInWithGoogle: '[es] Sign in with Google',
        signInWithApple: '[es] Sign in with Apple',
        signInWith: '[es] Sign in with',
        continue: '[es] Continue',
        firstName: '[es] First name',
        lastName: '[es] Last name',
        scanning: '[es] Scanning',
        analyzing: '[es] Analyzing...',
        thinking: '[es] Concierge is thinking...',
        addCardTermsOfService: '[es] Expensify Terms of Service',
        perPerson: '[es] per person',
        phone: '[es] Phone',
        phoneNumber: '[es] Phone number',
        phoneNumberPlaceholder: '[es] (xxx) xxx-xxxx',
        email: '[es] Email',
        and: '[es] and',
        or: '[es] or',
        details: '[es] Details',
        privacy: '[es] Privacy',
        privacyPolicy: '[es] Privacy Policy',
        hidden: '[es] Hidden',
        visible: '[es] Visible',
        delete: '[es] Delete',
        archived: '[es][ctx: UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.] archived',
        contacts: '[es] Contacts',
        recents: '[es] Recents',
        close: '[es] Close',
        comment: '[es] Comment',
        download: '[es] Download',
        downloading: '[es] Downloading',
        uploading: '[es][ctx: Indicates that a file is currently being uploaded (sent to the server), not downloaded.] Uploading',
        pin: '[es][ctx: as a verb, not a noun] Pin',
        unPin: '[es] Unpin',
        back: '[es] Back',
        saveAndContinue: '[es] Save & continue',
        settings: '[es] Settings',
        termsOfService: '[es] Terms of Service',
        members: '[es] Members',
        invite: '[es] Invite',
        here: '[es] here',
        avatar: '[es] Avatar',
        date: '[es] Date',
        dob: '[es] Date of birth',
        currentYear: '[es] Current year',
        currentMonth: '[es] Current month',
        ssnLast4: '[es] Last 4 digits of SSN',
        ssnFull9: '[es] Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `[es] Address line ${lineNumber}`,
        personalAddress: '[es] Personal address',
        companyAddress: '[es] Company address',
        noPO: '[es] No PO boxes or mail-drop addresses, please.',
        city: '[es] City',
        state: '[es] State',
        streetAddress: '[es] Street address',
        stateOrProvince: '[es] State / Province',
        country: '[es] Country',
        zip: '[es] Zip code',
        zipPostCode: '[es] Zip / Postcode',
        whatThis: "[es] What's this?",
        iAcceptThe: '[es] I accept the ',
        acceptTermsAndPrivacy: `[es] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `[es] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `[es] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: "[es] You can't export an empty report.",
            other: () => `[es] You can't export empty reports.`,
        }),
        remove: '[es] Remove',
        admin: '[es] Admin',
        owner: '[es] Owner',
        dateFormat: '[es] YYYY-MM-DD',
        calendarOpened: '[es] calendar opened',
        send: '[es] Send',
        na: '[es] N/A',
        noResultsFound: '[es] No results found',
        noResultsFoundMatching: (searchString: string) => `[es] No results found matching "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `[es] Suggestions available for "${searchString}".` : '[es] Suggestions available.'),
        recentDestinations: '[es] Recent destinations',
        timePrefix: "[es] It's",
        conjunctionFor: '[es] for',
        todayAt: '[es] Today at',
        tomorrowAt: '[es] Tomorrow at',
        yesterdayAt: '[es] Yesterday at',
        conjunctionAt: '[es] at',
        conjunctionTo: '[es] to',
        genericErrorMessage: '[es] Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: '[es] Percentage',
        progressBarLabel: '[es] Onboarding progress',
        converted: '[es] Converted',
        error: {
            invalidAmount: '[es] Invalid amount',
            acceptTerms: '[es] You must accept the Terms of Service to continue',
            phoneNumber: `[es] Please enter a complete phone number
(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '[es] This field is required',
            requestModified: '[es] This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `[es] Character limit exceeded (${length}/${limit})`,
            dateInvalid: '[es] Please select a valid date',
            invalidDateShouldBeFuture: '[es] Please choose today or a future date',
            invalidTimeShouldBeFuture: '[es] Please choose a time at least one minute ahead',
            invalidCharacter: '[es] Invalid character',
            enterMerchant: '[es] Enter a merchant name',
            enterAmount: '[es] Enter an amount',
            missingMerchantName: '[es] Missing merchant name',
            missingAmount: '[es] Missing amount',
            missingDate: '[es] Missing date',
            enterDate: '[es] Enter a date',
            invalidTimeRange: '[es] Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: '[es] Please complete the form above to continue',
            pleaseSelectOne: '[es] Please select an option above',
            invalidRateError: '[es] Please enter a valid rate',
            lowRateError: '[es] Rate must be greater than 0',
            email: '[es] Please enter a valid email address',
            login: '[es] An error occurred while logging in. Please try again.',
        },
        comma: '[es] comma',
        semicolon: '[es] semicolon',
        please: '[es] Please',
        contactUs: '[es][ctx: Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.] contact us',
        pleaseEnterEmailOrPhoneNumber: '[es] Please enter an email or phone number',
        fixTheErrors: '[es][ctx: Instruction prompting the user to correct multiple issues. Should use imperative form when translated.] fix the errors',
        inTheFormBeforeContinuing: '[es] in the form before continuing',
        confirm: '[es] Confirm',
        reset: '[es] Reset',
        done: '[es][ctx: Status or button indicating that an action or process has been completed. Should reflect completion.] Done',
        more: '[es] More',
        other: '[es] Other',
        debitCard: '[es] Debit card',
        bankAccount: '[es] Bank account',
        personalBankAccount: '[es] Personal bank account',
        businessBankAccount: '[es] Business bank account',
        join: '[es] Join',
        leave: '[es] Leave',
        decline: '[es] Decline',
        reject: '[es] Reject',
        transferBalance: '[es] Transfer balance',
        enterManually: '[es][ctx: Instruction telling the user to input data manually. Refers to entering text or values in a field.] Enter it manually',
        message: '[es] Message',
        leaveThread: '[es] Leave thread',
        you: '[es] You',
        me: '[es][ctx: Refers to the current user in the UI. Should follow capitalization rules for labels] me',
        youAfterPreposition: '[es] you',
        your: '[es] your',
        conciergeHelp: '[es] Please reach out to Concierge for help.',
        youAppearToBeOffline: '[es] You appear to be offline.',
        thisFeatureRequiresInternet: '[es] This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: '[es] Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: '[es] An error occurred while trying to play this video.',
        areYouSure: '[es] Are you sure?',
        verify: '[es] Verify',
        yesContinue: '[es] Yes, continue',
        websiteExample: '[es][ctx: Provides an example format for a website URL.] e.g. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `[es][ctx: Provides an example format for a ZIP] e.g. ${zipSampleFormat}` : ''),
        description: '[es] Description',
        title: '[es] Title',
        assignee: '[es] Assignee',
        createdBy: '[es] Created by',
        with: '[es] with',
        shareCode: '[es] Share code',
        share: '[es] Share',
        per: '[es] per',
        mi: '[es][ctx: Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.] mile',
        km: '[es] kilometer',
        milesAbbreviated: '[es] mi',
        kilometersAbbreviated: '[es] km',
        copied: '[es] Copied!',
        someone: '[es] Someone',
        total: '[es] Total',
        edit: '[es] Edit',
        letsDoThis: `[es] Let's do this!`,
        letsStart: `[es] Let's start`,
        showMore: '[es] Show more',
        showLess: '[es] Show less',
        plusMore: ({count}: {count: number}) => `[es] +${count} more`,
        merchant: '[es] Merchant',
        change: '[es] Change',
        category: '[es] Category',
        report: '[es] Report',
        billable: '[es] Billable',
        nonBillable: '[es] Non-billable',
        tag: '[es] Tag',
        receipt: '[es] Receipt',
        verified: '[es] Verified',
        replace: '[es] Replace',
        distance: '[es] Distance',
        mile: '[es] mile',
        miles: '[es][ctx: Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.] miles',
        kilometer: '[es] kilometer',
        kilometers: '[es] kilometers',
        recent: '[es] Recent',
        all: '[es] All',
        am: '[es] AM',
        pm: '[es] PM',
        tbd: "[es][ctx: Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.] TBD",
        selectCurrency: '[es] Select a currency',
        selectSymbolOrCurrency: '[es] Select a symbol or currency',
        card: '[es] Card',
        whyDoWeAskForThis: '[es] Why do we ask for this?',
        required: '[es] Required',
        automatic: '[es] Automatic',
        showing: '[es] Showing',
        of: '[es] of',
        default: '[es] Default',
        update: '[es] Update',
        member: '[es] Member',
        auditor: '[es] Auditor',
        role: '[es] Role',
        roleCannotBeChanged: (workflowsLinkPage: string) => `[es] Role can't be changed because this member is a <a href="${workflowsLinkPage}">payer</a> on this workspace.`,
        currency: '[es] Currency',
        groupCurrency: '[es] Group currency',
        rate: '[es] Rate',
        emptyLHN: {
            title: '[es] Woohoo! All caught up.',
            subtitleText1: '[es] Find a chat using the',
            subtitleText2: '[es] button above, or create something using the',
            subtitleText3: '[es] button below.',
        },
        businessName: '[es] Business name',
        clear: '[es] Clear',
        type: '[es] Type',
        reportName: '[es] Report name',
        action: '[es] Action',
        expenses: '[es] Expenses',
        totalSpend: '[es] Total spend',
        tax: '[es] Tax',
        shared: '[es] Shared',
        drafts: '[es] Drafts',
        draft: '[es][ctx: as a noun, not a verb] Draft',
        finished: '[es] Finished',
        upgrade: '[es] Upgrade',
        downgradeWorkspace: '[es] Downgrade workspace',
        companyID: '[es] Company ID',
        userID: '[es] User ID',
        disable: '[es] Disable',
        export: '[es] Export',
        initialValue: '[es] Initial value',
        currentDate: '[es][ctx: UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.] Current date',
        value: '[es] Value',
        downloadFailedTitle: '[es] Download failed',
        downloadFailedDescription: "[es] Your download couldn't be completed. Please try again later.",
        filterLogs: '[es] Filter Logs',
        network: '[es] Network',
        reportID: '[es] Report ID',
        longReportID: '[es] Long Report ID',
        withdrawalID: '[es] Withdrawal ID',
        withdrawalStatus: '[es] Withdrawal status',
        bankAccounts: '[es] Bank accounts',
        chooseFile: '[es] Choose file',
        chooseFiles: '[es] Choose files',
        dropTitle: '[es][ctx: Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.] Let it go',
        dropMessage: '[es][ctx: Instruction for dropping one or more files into an upload area.] Drop your file here',
        ignore: '[es] Ignore',
        enabled: '[es] Enabled',
        disabled: '[es] Disabled',
        import: '[es][ctx: Action button for importing a file or data. Should use the verb form, not the noun form.] Import',
        offlinePrompt: "[es] You can't take this action right now.",
        outstanding: '[es][ctx: meaning "remaining to be paid, done, or dealt with", not "exceptionally good"] Outstanding',
        chats: '[es] Chats',
        tasks: '[es] Tasks',
        unread: '[es] Unread',
        sent: '[es] Sent',
        links: '[es] Links',
        day: '[es][ctx: Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).] day',
        days: '[es] days',
        rename: '[es] Rename',
        address: '[es] Address',
        hourAbbreviation: '[es] h',
        minuteAbbreviation: '[es] m',
        secondAbbreviation: '[es] s',
        skip: '[es] Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `[es] Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: '[es] Chat now',
        workEmail: '[es] Work email',
        destination: '[es] Destination',
        subrate: '[es][ctx: Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.] Subrate',
        perDiem: '[es] Per diem',
        validate: '[es] Validate',
        downloadAsPDF: '[es] Download as PDF',
        downloadAsCSV: '[es] Download as CSV',
        print: '[es] Print',
        help: '[es] Help',
        collapsed: '[es] Collapsed',
        expanded: '[es] Expanded',
        expenseReport: '[es] Expense Report',
        rateOutOfPolicy: '[es][ctx: Rate as a noun, not a verb] Rate out of policy',
        leaveWorkspace: '[es] Leave workspace',
        leaveWorkspaceConfirmation: "[es] If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "[es] If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "[es] If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `[es] If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `[es] If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `[es] If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "[es] You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: '[es] Reimbursable',
        editYourProfile: '[es] Edit your profile',
        comments: '[es] Comments',
        sharedIn: '[es] Shared in',
        unreported: '[es] Unreported',
        invoice: '[es] Invoice',
        expense: '[es] Expense',
        chat: '[es] Chat',
        task: '[es] Task',
        trip: '[es] Trip',
        apply: '[es] Apply',
        status: '[es] Status',
        on: '[es] On',
        before: '[es] Before',
        after: '[es] After',
        range: '[es] Range',
        reschedule: '[es] Reschedule',
        general: '[es] General',
        workspacesTabTitle: '[es] Workspaces',
        headsUp: '[es] Heads up!',
        submitTo: '[es] Submit to',
        forwardTo: '[es] Forward to',
        approvalLimit: '[es] Approval limit',
        overLimitForwardTo: '[es] Over limit forward to',
        merge: '[es] Merge',
        none: '[es] None',
        unstableInternetConnection: '[es] Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: '[es] Enable Global Reimbursements',
        purchaseAmount: '[es] Purchase amount',
        originalAmount: '[es] Original amount',
        frequency: '[es] Frequency',
        link: '[es] Link',
        pinned: '[es] Pinned',
        read: '[es] Read',
        copyToClipboard: '[es] Copy to clipboard',
        thisIsTakingLongerThanExpected: '[es] This is taking longer than expected...',
        domains: '[es] Domains',
        actionRequired: '[es] Action required',
        duplicate: '[es] Duplicate',
        duplicated: '[es] Duplicated',
        duplicateExpense: '[es] Duplicate expense',
        duplicateReport: '[es] Duplicate report',
        copyOfReportName: (reportName: string) => `[es] Copy of ${reportName}`,
        exchangeRate: '[es] Exchange rate',
        reimbursableTotal: '[es] Reimbursable total',
        nonReimbursableTotal: '[es] Non-reimbursable total',
        opensInNewTab: '[es] Opens in a new tab',
        locked: '[es] Locked',
        month: '[es] Month',
        week: '[es] Week',
        year: '[es] Year',
        quarter: '[es] Quarter',
        concierge: {
            sidePanelGreeting: '[es] Hi there, how can I help?',
            showHistory: '[es] Show history',
        },
        vacationDelegate: '[es] Vacation delegate',
        expensifyLogo: '[es] Expensify logo',
        approver: '[es] Approver',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `[es] enter digit ${digitIndex} of ${totalDigits}`,
    },
    socials: {
        podcast: '[es] Follow us on Podcast',
        twitter: '[es] Follow us on Twitter',
        instagram: '[es] Follow us on Instagram',
        facebook: '[es] Follow us on Facebook',
        linkedin: '[es] Follow us on LinkedIn',
    },
    concierge: {
        collapseReasoning: '[es] Collapse reasoning',
        expandReasoning: '[es] Expand reasoning',
    },
    supportalNoAccess: {
        title: '[es] Not so fast',
        descriptionWithCommand: (command?: string) =>
            `[es] You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: '[es] Locked Account',
        description: "[es] You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: '[es] Use current location',
        notFound: '[es] We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "[es] It looks like you've denied access to your location.",
        please: '[es] Please',
        allowPermission: '[es] allow location access in settings',
        tryAgain: '[es] and try again.',
    },
    contact: {
        importContacts: '[es] Import contacts',
        importContactsTitle: '[es] Import your contacts',
        importContactsText: '[es] Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: '[es] so your favorite people are always a tap away.',
        importContactsNativeText: '[es] Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: '[es] Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '[es] Camera access',
        expensifyDoesNotHaveAccessToCamera: "[es] Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: '[es] Attachment error',
        errorWhileSelectingAttachment: '[es] An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: '[es] An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: '[es] Take photo',
        chooseFromGallery: '[es] Choose from gallery',
        chooseDocument: '[es] Choose file',
        attachmentTooLarge: '[es] Attachment is too large',
        sizeExceeded: '[es] Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `[es] Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: '[es] Attachment is too small',
        sizeNotMet: '[es] Attachment size must be greater than 240 bytes',
        wrongFileType: '[es] Invalid file type',
        notAllowedExtension: '[es] This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: '[es] Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: '[es] Password-protected PDF is not supported',
        attachmentImageResized: '[es] This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: '[es] This image is too large to preview before uploading.',
        imageDimensionsTooLarge: '[es] Image dimensions are too large to process. Please use a smaller image.',
        tooManyFiles: (fileLimit: number) => `[es] You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `[es] Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "[es] Some files can't be uploaded",
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `[es] Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "[es] You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `[es] ${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: '[es] Learn more about supported formats.',
        passwordProtected: "[es] Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: '[es] Add attachments',
        addReceipt: '[es] Add receipt',
        scanReceipts: '[es] Scan receipts',
        replaceReceipt: '[es] Replace receipt',
    },
    filePicker: {
        fileError: '[es] File error',
        errorWhileSelectingFile: '[es] An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: '[es] Connection complete',
        supportingText: '[es] You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: '[es] Edit photo',
        description: '[es] Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: '[es] No extension found for mime type',
        problemGettingImageYouPasted: '[es] There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `[es] The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `[es] The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: '[es] Update app',
        updatePrompt: '[es] A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: '[es] Launching Expensify',
        expired: '[es] Your session has expired.',
        signIn: '[es] Please sign in again.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: '[es] Review transaction',
            pleaseReview: '[es] Please review this transaction',
            requiresYourReview: '[es] An Expensify Card transaction requires your review.',
            transactionDetails: '[es] Transaction details',
            attemptedTransaction: '[es] Attempted transaction',
            deny: '[es] Deny',
            approve: '[es] Approve',
            denyTransaction: '[es] Deny transaction',
            transactionDenied: '[es] Transaction denied',
            transactionApproved: '[es] Transaction approved!',
            areYouSureToDeny: '[es] Are you sure? The transaction will be denied if you close this screen.',
            youCanTryAgainAtMerchantOrReachOut:
                "[es] You can try again at the merchant. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            youNeedToTryAgainAtMerchant: "[es] This transaction was not verified, so we denied it. You'll need to try again at the merchant.",
            goBackToTheMerchant: '[es] Return to the merchant site to continue the transaction.',
            transactionFailed: '[es] Transaction failed',
            transactionCouldNotBeCompleted: '[es] Your transaction could not be completed. Please try again at the merchant.',
            transactionCouldNotBeCompletedReachOut:
                "[es] Your transaction could not be completed. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            reviewFailed: '[es] Review failed',
            alreadyReviewedSubtitle:
                '[es] You already reviewed this transaction. Please check your <transaction-history-link>transaction history</transaction-history-link> or contact <concierge-link>Concierge</concierge-link> to report any issues.',
        },
        unsupportedDevice: {
            unsupportedDevice: '[es] Unsupported device',
            pleaseDownloadMobileApp: `[es] This action is not supported on your device. Please download the Expensify app from the <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> or <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> and try again.`,
            pleaseUseWebApp: `[es] This action is not supported on your device. Please use the <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify web app</a> and try again.`,
        },
        biometricsTest: {
            biometricsTest: '[es] Biometrics test',
            authenticationSuccessful: '[es] Authentication successful',
            successfullyAuthenticatedUsing: (authType?: string) => `[es] You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `[es] Biometrics (${status})`,
            statusNeverRegistered: '[es] Never registered',
            statusNotRegistered: '[es] Not registered',
            statusRegisteredOtherDevice: () => ({one: '[es] Another device registered', other: '[es] Other devices registered'}),
            statusRegisteredThisDevice: '[es] Registered',
            yourAttemptWasUnsuccessful: '[es] Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: '[es] You couldn’t be authenticated',
            areYouSureToReject: '[es] Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: '[es] Reject authentication',
            test: '[es] Test',
            biometricsAuthentication: '[es] Biometric authentication',
            authType: {
                unknown: '[es] Unknown',
                none: '[es] None',
                credentials: '[es] Credentials',
                biometrics: '[es] Biometrics',
                faceId: '[es] Face ID',
                touchId: '[es] Touch ID',
                opticId: '[es] Optic ID',
                passkey: '[es] Passkey',
            },
        },
        pleaseEnableInSystemSettings: {
            start: '[es] Please enable face/fingerprint verification or set a device passcode in your ',
            link: '[es] system settings',
            end: '.',
        },
        oops: '[es] Oops, something went wrong',
        verificationFailed: '[es] Verification failed',
        looksLikeYouRanOutOfTime: '[es] Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: '[es] You ran out of time',
        letsVerifyItsYou: '[es] Let’s verify it’s you',
        nowLetsAuthenticateYou: "[es] Now, let's authenticate you...",
        letsAuthenticateYou: "[es] Let's authenticate you...",
        verifyYourself: {
            biometrics: '[es] Verify yourself with your face or fingerprint',
            passkeys: '[es] Verify yourself with a passkey',
        },
        enableQuickVerification: {
            biometrics: '[es] Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
            passkeys: '[es] Enable quick, secure verification using a passkey. No passwords or codes required.',
        },
        revoke: {
            revoke: '[es] Revoke',
            title: '[es] Face/fingerprint & passkeys',
            explanation:
                '[es] Face/fingerprint or passkey verification are enabled on one or more devices. Revoking access will require a magic code for the next verification on that device.',
            confirmationPrompt: "[es] Are you sure? You'll need a magic code for the next verification on that device.",
            confirmationPromptThisDevice: "[es] Are you sure? You'll need a magic code for the next verification on this device.",
            confirmationPromptMultiple: "[es] Are you sure? You'll need a magic code for the next verification on those devices.",
            confirmationPromptAll: "[es] Are you sure? You'll need a magic code for the next verification on any device.",
            cta: '[es] Revoke access',
            ctaAll: '[es] Revoke all',
            noDevices: "[es] You don't have any devices registered for face/fingerprint or passkey verification. If you register any, you will be able to revoke that access here.",
            dismiss: '[es] Got it',
            error: '[es] Request failed. Try again later.',
            thisDevice: '[es] This device',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['[es] One', '[es] Two', '[es] Three', '[es] Four', '[es] Five', '[es] Six', '[es] Seven', '[es] Eight', '[es] Nine'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `[es] ${displayCount} other ${otherDeviceCount === 1 ? '[es] device' : '[es] devices'}`;
            },
        },
        setPin: {
            didNotShipCard: "[es] We didn't ship your card. Please try again.",
        },
        revealPin: {
            couldNotReveal: "[es] We couldn't reveal your PIN. Please try again.",
        },
        changePin: {
            didNotChange: "[es] We didn't change your PIN. Please try again.",
        },
        revealCardDetail: {
            couldNotReveal: "[es] We couldn't reveal your card details. Please try again.",
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            [es] Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: '[es] Head back to your original tab to continue.',
        title: "[es] Here's your magic code",
        description: dedent(`
            [es] Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            [es] Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: '[es] , or',
        signInHere: '[es] just sign in here',
        expiredCodeTitle: '[es] Magic code expired',
        expiredCodeDescription: '[es] Go back to the original device and request a new code',
        successfulNewCodeRequest: '[es] Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            [es] Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            [es] Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: '[es] request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: '[es] Paid by',
        whatsItFor: "[es] What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: '[es] Name, email, or phone number',
        findMember: '[es] Find a member',
        searchForSomeone: '[es] Search for someone',
        userSelected: (username: string) => `[es] ${username} selected`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '[es] Submit an expense, refer your team',
            subtitleText: "[es] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '[es] Book a call',
    },
    hello: '[es] Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '[es] Get started below.',
        anotherLoginPageIsOpen: '[es] Another login page is open.',
        anotherLoginPageIsOpenExplanation: "[es] You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: '[es] Welcome!',
        welcomeWithoutExclamation: '[es] Welcome',
        phrase2: "[es] Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: '[es] Your payments get to you as fast as you can get your point across.',
        enterPassword: '[es] Please enter your password',
        welcomeNewFace: (login: string) => `[es] ${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: (login: string) => `[es] Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '[es] Travel and expense, at the speed of chat',
            body: '[es] Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '[es] Continue logging in with single sign-on:',
        orContinueWithMagicCode: '[es] You can also sign in with a magic code',
        useSingleSignOn: '[es] Use single sign-on',
        useMagicCode: '[es] Use magic code',
        launching: '[es] Launching...',
        oneMoment: "[es] One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: '[es] Drop to upload',
        sendAttachment: '[es] Send attachment',
        addAttachment: '[es] Add attachment',
        writeSomething: '[es] Write something...',
        blockedFromConcierge: '[es] Communication is barred',
        askConciergeToUpdate: '[es] Try "Update an expense"...',
        askConciergeToCorrect: '[es] Try "Correct an expense"...',
        askConciergeForHelp: '[es] Ask Concierge AI for help...',
        fileUploadFailed: '[es] Upload failed. File is not supported.',
        localTime: (user: string, time: string) => `[es] It's ${time} for ${user}`,
        edited: '[es] (edited)',
        emoji: '[es] Emoji',
        collapse: '[es] Collapse',
        expand: '[es] Expand',
    },
    reportActionContextMenu: {
        copyMessage: '[es] Copy message',
        copied: '[es] Copied!',
        copyLink: '[es] Copy link',
        copyURLToClipboard: '[es] Copy URL to clipboard',
        copyEmailToClipboard: '[es] Copy email to clipboard',
        markAsUnread: '[es] Mark as unread',
        markAsRead: '[es] Mark as read',
        editAction: ({action}: EditActionParams) => `[es] Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '[es] expense' : '[es] comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '[es] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[es] Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '[es] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[es] Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: '[es] Only visible to',
        explain: '[es] Explain',
        explainMessage: '[es] Please explain this to me.',
        replyInThread: '[es] Reply in thread',
        joinThread: '[es] Join thread',
        leaveThread: '[es] Leave thread',
        copyOnyxData: '[es] Copy Onyx data',
        flagAsOffensive: '[es] Flag as offensive',
        menu: '[es] Menu',
    },
    emojiReactions: {
        addReactionTooltip: '[es] Add reaction',
        reactedWith: '[es] reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `[es] You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `[es] This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `[es] This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `[es] This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `[es] This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `[es] This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `[es] This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `[es] This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: '[es] This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "[es] Welcome! Let's get you set up.",
        chatWithAccountManager: '[es] Chat with your account manager here',
        askMeAnything: '[es] Ask me anything!',
        sayHello: '[es] Say hello!',
        yourSpace: '[es] Your space',
        welcomeToRoom: (roomName: string) => `[es] Welcome to ${roomName}!`,
        usePlusButton: (additionalText: string) => `[es]  Use the + button to ${additionalText} an expense.`,
        askConcierge: '[es] This is your chat with Concierge, your personal AI agent. I can do almost anything, try me!',
        conciergeSupport: '[es] Your personal AI agent',
        create: '[es] create',
        iouTypes: {
            pay: '[es] pay',
            split: '[es] split',
            submit: '[es] submit',
            track: '[es] track',
            invoice: '[es] invoice',
        },
    },
    adminOnlyCanPost: '[es] Only admins can send messages in this room.',
    readOnlyConversation: '[es] This conversation is read-only.',
    reportAction: {
        asCopilot: '[es] as copilot for',
        assistedBy: (agentName: string) => `[es] assisted by ${agentName}`,
        humanSupportAgent: '[es] a human support agent',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `[es] created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: (reportUrl: string, reportName: string, reportID: string, isReportDeleted: boolean) =>
            isReportDeleted
                ? `[es] created this report for any held expenses from deleted report #${reportID}`
                : `[es] created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: '[es] Notify everyone in this conversation',
    },
    newMessages: '[es] New messages',
    latestMessages: '[es] Latest messages',
    youHaveBeenBanned: "[es] Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: '[es] is typing...',
        areTyping: '[es] are typing...',
        multipleMembers: '[es] Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '[es] This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `[es] This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `[es] This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `[es] This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `[es] This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[es] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[es] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '[es] This booking is archived.',
    },
    writeCapabilityPage: {
        label: '[es] Who can post',
        writeCapability: {
            all: '[es] All members',
            admins: '[es] Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: '[es] Find something...',
        buttonMySettings: '[es] My settings',
        fabNewChat: '[es] Start chat',
        fabScanReceiptExplained: '[es] Scan receipt',
        chatPinned: '[es] Chat pinned',
        draftedMessage: '[es] Drafted message',
        listOfChatMessages: '[es] List of chat messages',
        listOfChats: '[es] List of chats',
        saveTheWorld: '[es] Save the world',
        tooltip: '[es] Get started here!',
    },
    homePage: {
        forYou: '[es] For you',
        timeSensitiveSection: {
            title: '[es] Time sensitive',
            ctaFix: '[es] Fix',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `[es] Fix ${feedName} company card connection` : '[es] Fix company card connection'),
                defaultSubtitle: '[es] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `[es] Fix ${cardName} personal card connection` : '[es] Fix personal card connection'),
                subtitle: '[es] Wallet',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `[es] Fix ${integrationName} connection`,
                defaultSubtitle: '[es] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: '[es] We need your shipping address',
                subtitle: '[es] Provide an address to receive your Expensify Card.',
                cta: '[es] Add address',
            },
            addPaymentCard: {
                title: '[es] Add a payment card to keep using Expensify',
                subtitle: '[es] Account > Subscription',
                cta: '[es] Add',
            },
            activateCard: {
                title: '[es] Activate your Expensify Card',
                subtitle: '[es] Validate your card and start spending.',
                cta: '[es] Activate',
            },
            reviewCardFraud: {
                title: '[es] Review potential fraud on your Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `[es] Review ${amount} in potential fraud at ${merchant}`,
                subtitle: '[es] Expensify Card',
                cta: '[es] Review',
            },
            validateAccount: {
                title: '[es] Validate your account to continue using Expensify',
                subtitle: '[es] Account',
                cta: '[es] Validate',
            },
            fixFailedBilling: {
                title: "[es] We couldn't bill your card on file",
                subtitle: '[es] Subscription',
            },
            unlockBankAccount: {
                workspaceTitle: '[es] Your business bank account has been locked',
                personalTitle: '[es] Your bank account has been locked',
                workspaceSubtitle: ({policyName}: {policyName: string}) => policyName,
                personalSubtitle: '[es] Wallet',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `[es] Free trial: ${days} ${days === 1 ? '[es] day' : '[es] days'} left!`,
            offer50Body: '[es] Get 50% off your first year',
            offer25Body: '[es] Get 25% off your first year',
            addCardBody: "[es] Don't wait! Add your payment card now.",
            ctaClaim: '[es] Claim',
            ctaAdd: '[es] Add card',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `[es] Time remaining: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: '[es] Time remaining: 1 day',
                other: (pluralCount: number) => `[es] Time remaining: ${pluralCount} days`,
            }),
        },
        yourSpend: {
            title: '[es] Your spend',
            awaitingApproval: '[es] Awaiting approval',
            repaidLast30Days: '[es] Repaid in the last 30 days',
            recentTransactions: ({lastFour}: {lastFour: string}) => `[es] Recent transactions • ${lastFour}`,
        },
        seeMore: ({count}: {count: number}) => `[es] See ${count} more`,
        announcements: '[es] Announcements',
        discoverSection: {
            title: '[es] Discover',
            menuItemTitleNonAdmin: '[es] Learn how to create expenses and submit reports.',
            menuItemTitleAdmin: '[es] Learn how to invite members, edit approval workflows, and reconcile company cards.',
            menuItemDescription: '[es] See what Expensify can do in 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `[es] Submit ${count} ${count === 1 ? '[es] report' : '[es] reports'}`,
            approve: ({count}: {count: number}) => `[es] Approve ${count} ${count === 1 ? '[es] report' : '[es] reports'}`,
            pay: ({count}: {count: number}) => `[es] Pay ${count} ${count === 1 ? '[es] report' : '[es] reports'}`,
            export: ({count}: {count: number}) => `[es] Export ${count} ${count === 1 ? '[es] report' : '[es] reports'}`,
            begin: '[es] Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: "[es] You're done!",
                thumbsUpStarsDescription: '[es] Thumbs up to you, stay tuned for more tasks.',
                smallRocketTitle: '[es] All caught up',
                smallRocketDescription: '[es] Upcoming to-dos will launch here.',
                cowboyHatTitle: "[es] You're done!",
                cowboyHatDescription: '[es] All tasks are wrangled, keep an eye out for more.',
                trophy1Title: '[es] Nothing to show',
                trophy1Description: '[es] You did it! Keep an eye out for more to-dos.',
                palmTreeTitle: '[es] All caught up',
                palmTreeDescription: '[es] Time to relax but stay tuned for future tasks.',
                fishbowlBlueTitle: "[es] You're done!",
                fishbowlBlueDescription: "[es] We'll bubble up future tasks here.",
                targetTitle: '[es] All caught up',
                targetDescription: '[es] Way to stay on target. Check back for more tasks!',
                chairTitle: '[es] Nothing to show',
                chairDescription: "[es] Go relax, we'll list upcoming to-dos here.",
                broomTitle: "[es] You're done!",
                broomDescription: '[es] Tasks are clean, though stay tuned for more to-dos.',
                houseTitle: '[es] All caught up',
                houseDescription: '[es] This is your home base for upcoming to-dos.',
                conciergeBotTitle: '[es] Nothing to show',
                conciergeBotDescription: '[es] Beep boop beep boop, check back for more tasks!',
                checkboxTextTitle: '[es] All caught up',
                checkboxTextDescription: '[es] Check off your upcoming to-dos here.',
                flashTitle: "[es] You're done!",
                flashDescription: "[es] We'll zap your future tasks here.",
                sunglassesTitle: '[es] Nothing to show',
                sunglassesDescription: "[es] Time to chill, though stay tuned for what's next!",
                f1FlagsTitle: '[es] All caught up',
                f1FlagsDescription: "[es] You've finished all outstanding to-dos.",
            },
        },
        gettingStartedSection: {
            title: '[es] Getting started',
            createWorkspace: '[es] Create a workspace',
            connectAccounting: ({integrationName}: {integrationName: string}) => `[es] Connect to ${integrationName}`,
            connectAccountingDefault: '[es] Connect to accounting',
            customizeCategories: '[es] Customize accounting categories',
            inviteAccountant: '[es] Invite your accountant',
            linkCompanyCards: '[es] Link company cards',
            setupRules: '[es] Set up spend rules',
        },
        upcomingTravel: '[es] Upcoming travel',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `[es] Flight to ${destination}`,
            trainTo: ({destination}: {destination: string}) => `[es] Train to ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `[es] Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `[es] Car rental in ${destination}`,
            inOneWeek: '[es] In 1 week',
            inDays: () => ({
                one: '[es] In 1 day',
                other: (count: number) => `[es] In ${count} days`,
            }),
            today: '[es] Today',
        },
    },
    allSettingsScreen: {
        subscription: '[es] Subscription',
        domains: '[es] Domains',
    },
    tabSelector: {
        chat: '[es] Chat',
        room: '[es] Room',
        distance: '[es] Distance',
        manual: '[es] Manual',
        scan: '[es] Scan',
        map: '[es] Map',
        gps: '[es] GPS',
        odometer: '[es] Odometer',
    },
    spreadsheet: {
        upload: '[es] Upload a spreadsheet',
        import: '[es] Import spreadsheet',
        dragAndDrop: '[es] <muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `[es] <muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '[es] <muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `[es] <muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: '[es] File contains column headers',
        column: (name: string) => `[es] Column ${name}`,
        fieldNotMapped: (fieldName: string) => `[es] Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `[es] Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `[es] Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: '[es] Import successful',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[es] No categories have been added or updated.';
            }
            if (added && updated) {
                return `[es] ${added} ${added === 1 ? '[es] category' : '[es] categories'} added, ${updated} ${updated === 1 ? '[es] category' : '[es] categories'} updated.`;
            }
            if (added) {
                return added === 1 ? '[es] 1 category has been added.' : `[es] ${added} categories have been added.`;
            }
            return updated === 1 ? '[es] 1 category has been updated.' : `[es] ${updated} categories have been updated.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[es] ${transactions} transactions have been added.` : '[es] 1 transaction has been added.',
        importCompanyCardTransactionsPendingMessage: '[es] New cards and transactions may take some time to appear, please hang tight.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[es] No members have been added or updated.';
            }
            if (added && updated) {
                return `[es] ${added} member${added > 1 ? '[es] s' : ''} added, ${updated} member${updated > 1 ? '[es] s' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `[es] ${updated} members have been updated.` : '[es] 1 member has been updated.';
            }
            return added > 1 ? `[es] ${added} members have been added.` : '[es] 1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `[es] ${tags} tags have been added.` : '[es] 1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: '[es] Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `[es] ${rates} per diem rates have been added.` : '[es] 1 per diem rate has been added.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[es] ${transactions} transactions have been imported.` : '[es] 1 transaction has been imported.',
        importFailedTitle: '[es] Import failed',
        importFailedDescription: '[es] Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: '[es] Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: '[es] File size must be greater than 0 bytes',
        invalidFileMessage:
            '[es] The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: '[es] Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: '[es] Import spreadsheet',
        downloadCSV: '[es] Download CSV',
        importMemberConfirmation: () => ({
            one: `[es] Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `[es] Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: '[es] Upload receipt',
        uploadMultiple: '[es] Upload receipts',
        desktopSubtitleSingle: `[es] or drag and drop it here`,
        desktopSubtitleMultiple: `[es] or drag and drop them here`,
        alternativeMethodsTitle: '[es] Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `[es] <label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `[es] <label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `[es] <label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `[es] <label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: '[es] Take a photo',
        cameraAccess: '[es] Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `[es] Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: '[es] Camera error',
        cameraErrorMessage: '[es] An error occurred while taking a photo. Please try again.',
        locationAccessTitle: '[es] Allow location access',
        locationAccessMessage: '[es] Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: '[es] Allow location access',
        locationErrorMessage: '[es] Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `[es] Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '[es] Let it go',
        dropMessage: '[es] Drop your file here',
        flash: '[es] flash',
        multiScan: '[es] multi-scan',
        shutter: '[es] shutter',
        gallery: '[es] gallery',
        deleteReceipt: '[es] Delete receipt',
        deleteConfirmation: '[es] Are you sure you want to delete this receipt?',
        addReceipt: '[es] Add receipt',
        addAdditionalReceipt: '[es] Add additional receipt',
        scanFailed: "[es] The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        crop: '[es] Crop',
        addAReceipt: {
            phrase1: '[es] Add a receipt',
            phrase2: '[es] or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: '[es] Scan receipt',
        recordDistance: '[es] Track distance',
        requestMoney: '[es] Create expense',
        perDiem: '[es] Create per diem',
        splitBill: '[es] Split expense',
        splitScan: '[es] Split receipt',
        splitDistance: '[es] Split distance',
        paySomeone: (name?: string) => `[es] Pay ${name ?? '[es] someone'}`,
        assignTask: '[es] Assign task',
        header: '[es] Quick action',
        noLongerHaveReportAccess: '[es] You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: '[es] Update destination',
        createReport: '[es] Create report',
        createTimeExpense: '[es] Create time expense',
    },
    iou: {
        amount: '[es] Amount',
        percent: '[es] Percent',
        date: '[es] Date',
        taxAmount: '[es] Tax amount',
        taxRate: '[es] Tax rate',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `[es] Approve ${formattedAmount}` : '[es] Approve'),
        approved: '[es] Approved',
        cash: '[es] Cash',
        card: '[es] Card',
        original: '[es] Original',
        split: '[es] Split',
        splitExpense: '[es] Split expense',
        splitDates: '[es] Split dates',
        splitDateRange: (startDate: string, endDate: string, count: number) => `[es] ${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `[es] ${amount} from ${merchant}`,
        splitByPercentage: '[es] Split by percentage',
        splitByDate: '[es] Split by date',
        addSplit: '[es] Add split',
        makeSplitsEven: '[es] Make splits even',
        editSplits: '[es] Edit splits',
        totalAmountGreaterThanOriginal: (amount: string) => `[es] Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: (amount: string) => `[es] Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: '[es] Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: '[es] No splits added. Add at least one to save.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `[es] Edit ${amount} for ${merchant}`,
        removeSplit: '[es] Remove split',
        splitExpenseCannotBeEditedModalTitle: "[es] This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: '[es] Approved or paid expenses cannot be edited',
        paySomeone: (name?: string) => `[es] Pay ${name ?? '[es] someone'}`,
        splitExpenseDistanceErrorModalDescription: '[es] Please fix the distance rate error and try again.',
        splitExpensePerDiemRateErrorModalDescription: '[es] Please fix the per diem rate error and try again.',
        expense: '[es] Expense',
        categorize: '[es] Categorize',
        share: '[es] Share',
        participants: '[es] Participants',
        createExpense: '[es] Create expense',
        trackDistance: '[es] Track distance',
        createExpenses: (expensesNumber: number) => `[es] Create ${expensesNumber} expenses`,
        removeExpense: '[es] Remove expense',
        removeThisExpense: '[es] Remove this expense',
        removeExpenseConfirmation: '[es] Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: '[es] Add expense',
        chooseRecipient: '[es] Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `[es] Create ${amount} expense`,
        confirmDetails: '[es] Confirm details',
        pay: '[es] Pay',
        cancelPayment: '[es] Cancel payment',
        cancelPaymentConfirmation: '[es] Are you sure that you want to cancel this payment?',
        viewDetails: '[es] View details',
        pending: '[es] Pending',
        canceled: '[es] Canceled',
        posted: '[es] Posted',
        deleteReceipt: '[es] Delete receipt',
        findExpense: '[es] Find expense',
        deletedTransaction: (amount: string, merchant: string) => `[es] deleted an expense (${amount} for ${merchant})`,
        movedFromReport: (reportName: string) => `[es] moved an expense from ${reportName}`,
        movedFromReportNoName: '[es] moved an expense',
        movedTransactionTo: (reportUrl: string, reportName: string) => `[es] moved this expense to <a href="${reportUrl}">${reportName}</a>`,
        movedTransactionToAnotherReport: '[es] moved this expense to another report',
        movedTransactionFrom: (reportUrl: string, reportName: string) => `[es] moved this expense from <a href="${reportUrl}">${reportName}</a>`,
        movedTransactionFromAnotherReport: '[es] moved this expense from another report',
        unreportedTransaction: (reportUrl: string) => `[es] moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `[es] moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `[es] moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: '[es] Receipt pending match with card transaction',
        pendingMatch: '[es] Pending match',
        pendingMatchWithCreditCardDescription: '[es] Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: '[es] Mark as cash',
        pendingMatchSubmitTitle: '[es] Submit report',
        pendingMatchSubmitDescription: '[es] Some expenses are awaiting a match with a credit card transaction. Do you want to mark them as cash?',
        routePending: '[es] Route pending...',
        automaticallyEnterExpenseDetails: '[es] Concierge will automatically enter the expense details for you, or you can add them manually.',
        receiptScanning: () => ({
            one: '[es] Receipt scanning...',
            other: '[es] Receipts scanning...',
        }),
        scanMultipleReceipts: '[es] Scan multiple receipts',
        scanMultipleReceiptsDescription: "[es] Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: '[es] Receipt scan in progress',
        receiptScanInProgressDescription: '[es] Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: '[es] Remove from report',
        moveToPersonalSpace: '[es] Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '[es] Potential duplicate expenses identified. Review duplicates to enable submission.'
                : '[es] Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: '[es] Issue found',
            other: '[es] Issues found',
        }),
        fieldPending: '[es] Pending...',
        defaultRate: '[es] Default rate',
        receiptMissingDetails: '[es] Receipt missing details',
        missingAmount: '[es] Missing amount',
        missingMerchant: '[es] Missing merchant',
        receiptStatusTitle: '[es] Scanning…',
        receiptStatusText: "[es] Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: '[es] Receipt scanning failed. Please enter the details manually.',
        allTransactionsPendingNextStep: "[es] All transactions are pending. You can't submit this report until they post in a few days.",
        companyInfo: '[es] Company info',
        companyInfoDescription: '[es] We need a few more details before you can send your first invoice.',
        yourCompanyName: '[es] Your company name',
        yourCompanyWebsite: '[es] Your company website',
        yourCompanyWebsiteNote: "[es] If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: '[es] You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: '[es] You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '[es] 1 expense',
                other: (count: number) => `[es] ${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: '[es] Delete expense',
            other: '[es] Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: '[es] Are you sure that you want to delete this expense?',
            other: '[es] Are you sure that you want to delete these expenses?',
        }),
        deleteReport: () => ({
            one: '[es] Delete report',
            other: '[es] Delete reports',
        }),
        deleteReportConfirmation: () => ({
            one: '[es] Are you sure that you want to delete this report?',
            other: '[es] Are you sure that you want to delete these reports?',
        }),
        settledExpensify: '[es] Paid',
        done: '[es] Done',
        deleted: '[es] Deleted',
        settledElsewhere: '[es] Paid elsewhere',
        individual: '[es] Individual',
        business: '[es] Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `[es] Pay ${formattedAmount} as an individual` : `[es] Pay with personal account`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `[es] Pay ${formattedAmount} with wallet` : `[es] Pay with wallet`),
        settlePayment: (formattedAmount: string) => `[es] Pay ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `[es] Pay ${formattedAmount} as a business` : `[es] Pay with business account`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `[es] Mark ${formattedAmount} as paid` : `[es] Mark as paid`),
        confirmPaymentReceivedModalTitle: '[es] Confirm payment received',
        receivedPayment: '[es] Received payment',
        receivedPaymentConfirmation: "[es] Please proceed only if you've already received payment outside of Expensify.",
        confirmReceivedPayment: "[es] Yes, I've received payment",
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `[es] paid ${amount} with personal account ${last4Digits}` : `[es] Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `[es] paid ${amount} with business account ${last4Digits}` : `[es] Paid with business account`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `[es] Pay ${formattedAmount} via ${policyName}` : `[es] Pay via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `[es] paid ${amount} with bank account ${last4Digits}` : `[es] paid with bank account ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `[es] paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `[es] Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `[es] Business Account • ${lastFour}`,
        nextStep: '[es] Next steps',
        finished: '[es] Finished',
        flip: '[es] Flip',
        sendInvoice: (amount: string) => `[es] Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `[es]  for ${comment}` : ''}`,
        submitted: (memo?: string) => `[es] submitted${memo ? `[es] , saying ${memo}` : ''}`,
        automaticallySubmitted: `[es] submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: '[es] queued to submit via custom approval workflow',
        failedToAutoSubmitViaDEW: (reason: string) => `[es] failed to submit the report via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `[es] failed to submit the report. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `[es] failed to approve via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `[es] failed to approve. ${reason}`,
        queuedToApproveViaDEW: '[es] queued to approve via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `[es] tracking ${formattedAmount}${comment ? `[es]  for ${comment}` : ''}`,
        splitAmount: (amount: string) => `[es] split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `[es] split ${formattedAmount}${comment ? `[es]  for ${comment}` : ''}`,
        yourSplit: (amount: string) => `[es] Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `[es] ${payer} owes ${amount}${comment ? `[es]  for ${comment}` : ''}`,
        payerOwes: (payer: string) => `[es] ${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `[es] ${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: (payer: string) => `[es] ${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `[es] ${payer} spent ${amount}`,
        payerSpent: (payer: string) => `[es] ${payer} spent: `,
        managerApproved: (manager: string) => `[es] ${manager} approved:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `[es] ${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `[es] paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `[es] paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `[es] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `[es] approved ${amount}`,
        approvedMessage: `[es] approved`,
        unapproved: `[es] unapproved`,
        automaticallyForwarded: `[es] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `[es] approved`,
        rejectedThisReport: '[es] rejected',
        waitingOnBankAccount: (submitterDisplayName: string) => `[es] started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: '[es] canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `[es] canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `[es] ${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `[es] ${payer ? `${payer} ` : ''}marked as paid${comment ? `[es] , saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `[es] ${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `[es] ${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        reimbursedThisReport: '[es] reimbursed this report',
        paidThisBill: '[es] paid this bill',
        reimbursedOnBehalfOf: (actor: string) => `[es] on behalf of ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `[es] from the bank account ending in ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `[es] ${submitter} added a bank account, taking report off hold. Reimbursement is initiated`,
        reimbursedWithFastACH: ({
            isCurrentUser,
            submitterLogin,
            creditBankAccount,
            expectedDate,
        }: {
            isCurrentUser: boolean;
            submitterLogin: string;
            creditBankAccount: string;
            expectedDate: string;
        }) =>
            isCurrentUser
                ? `[es] . Money is on its way to your${creditBankAccount ? `[es]  bank account ending in ${creditBankAccount}` : '[es]  account'}. Reimbursement estimated to complete on ${expectedDate}.`
                : `[es] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[es]  bank account ending in ${creditBankAccount}` : '[es]  account'}. Reimbursement estimated to complete on ${expectedDate}.`,
        reimbursedWithCheck: '[es]  via check.',
        reimbursedWithStripeConnect: ({
            isCurrentUser,
            submitterLogin,
            creditBankAccount,
            isCard,
        }: {
            isCurrentUser: boolean;
            submitterLogin: string;
            creditBankAccount: string;
            isCard: boolean;
        }) => {
            const paymentMethod = isCard ? '[es] card' : '[es] bank account';
            return isCurrentUser
                ? `[es] . Money is on its way to your${creditBankAccount ? `[es]  bank account ending in ${creditBankAccount}` : '[es]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`
                : `[es] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[es]  bank account ending in ${creditBankAccount}` : '[es]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `[es]  with direct deposit (ACH)${creditBankAccount ? `[es]  to the bank account ending in ${creditBankAccount}. ` : '. '}${expectedDate ? `[es] The reimbursement is estimated to complete by ${expectedDate}.` : '[es] This generally takes 4-5 business days.'}`,
        noReimbursableExpenses: '[es] This report has an invalid amount',
        pendingConversionMessage: "[es] Total will update when you're back online",
        changedTheExpense: '[es] changed the expense',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `[es] the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `[es] set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `[es] the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: (valueName: string, newValueToDisplay: string, oldValueToDisplay: string) => `[es] the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, oldMerchant: string, newAmountToDisplay: string, oldAmountToDisplay: string) =>
            `[es] changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: '[es] based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `[es] based on <a href="${rulesLink}">workspace rules</a>` : '[es] based on workspace rule'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `[es] for ${comment}` : '[es] expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `[es] Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `[es] ${formattedAmount} sent${comment ? `[es]  for ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) => `[es] moved expense from personal space to ${workspaceName ?? `[es] chat with ${reportName}`}`,
        movedToPersonalSpace: '[es] moved expense to personal space',
        error: {
            invalidCategoryLength: '[es] The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: '[es] The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: '[es] Please enter a valid amount before continuing',
            invalidDistance: '[es] Please enter a valid distance before continuing',
            invalidReadings: '[es] Please enter both start & end readings to continue',
            negativeDistanceNotAllowed: '[es] End reading must be greater than start reading',
            distanceAmountTooLarge: '[es] The total amount is too large. Reduce the distance or lower the rate.',
            distanceAmountTooLargeReduceDistance: '[es] The total amount is too large. Reduce the distance.',
            distanceAmountTooLargeReduceRate: '[es] The total amount is too large. Lower the rate.',
            odometerReadingTooLarge: (formattedMax: string) => `[es] Odometer readings cannot exceed ${formattedMax}.`,
            stitchOdometerImagesFailed: '[es] Failed to combine odometer images. Please try again later.',
            unableToSubmitReport: '[es] Unable to submit report',
            allTransactionsPendingDescription: "[es] You can't submit this report because all transactions are pending. They may take a few days to post.",
            failedToSaveOdometerDraft: "[es] Couldn't save your odometer draft. Please try again.",
            invalidIntegerAmount: '[es] Please enter a whole dollar amount before continuing',
            invalidTaxAmount: (amount: string) => `[es] Maximum tax amount is ${amount}`,
            invalidSplit: '[es] The sum of splits must equal the total amount',
            invalidSplitParticipants: '[es] Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: '[es] Please enter a non-zero amount for your split',
            noParticipantSelected: '[es] Please select a participant',
            other: '[es] Unexpected error. Please try again later.',
            genericCreateFailureMessage: '[es] Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: '[es] Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: '[es] Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: '[es] Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: '[es] Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '[es] <rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: '[es] There was an error uploading your receipt.',
            receiptUploadFailedMessage: '[es] Receipt upload failed. Save the receipt, or delete the expense and lose it.',
            saveReceipt: '[es] Save receipt',
            genericDeleteFailureMessage: '[es] Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: '[es] Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: '[es] Transaction is missing fields',
            duplicateWaypointsErrorMessage: '[es] Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: '[es] Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: '[es] An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: '[es] Please enter a valid merchant',
            atLeastOneAttendee: '[es] At least one attendee must be selected',
            invalidQuantity: '[es] Please enter a valid quantity',
            quantityGreaterThanZero: '[es] Quantity must be greater than zero',
            invalidSubrateLength: '[es] There must be at least one subrate',
            invalidRate: '[es] Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "[es] The end date can't be before the start date",
            endDateSameAsStartDate: "[es] The end date can't be the same as the start date",
            manySplitsProvided: `[es] The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `[es] The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
        },
        dismissReceiptError: '[es] Dismiss error',
        dismissReceiptErrorConfirmation: '[es] Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `[es] started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: '[es] Enable wallet',
        hold: '[es] Hold',
        unhold: '[es] Remove hold',
        holdExpense: () => ({
            one: '[es] Hold expense',
            other: '[es] Hold expenses',
        }),
        unholdExpense: '[es] Unhold expense',
        heldExpense: '[es] held this expense',
        unheldExpense: '[es] unheld this expense',
        moveUnreportedExpense: '[es] Move unreported expense',
        addExistingExpense: '[es] Add existing expense',
        selectExistingExpense: '[es] Select at least one expense to add to the report.',
        emptyStateExistingExpenseTitle: '[es] No existing expenses',
        emptyStateExistingExpenseSubtitle: '[es] Looks like you don’t have any existing expenses. Try creating one below.',
        addExistingExpenseConfirm: '[es] Add to report',
        newReport: '[es] New report',
        explainHold: () => ({
            one: "[es] Explain why you're holding this expense.",
            other: "[es] Explain why you're holding these expenses.",
        }),
        explainHoldApprover: () => ({
            one: '[es] Explain what you need before approving this expense.',
            other: '[es] Explain what you need before approving these expenses.',
        }),
        retracted: '[es] retracted',
        retract: '[es] Retract',
        reopened: '[es] reopened',
        reopenReport: '[es] Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `[es] This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: '[es] Reason',
        holdReasonRequired: '[es] A reason is required when holding.',
        expenseWasPutOnHold: '[es] Expense was put on hold',
        expenseOnHold: '[es] This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: '[es] All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: '[es] This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: '[es] Some of these duplicates have been approved or paid already.',
        reviewDuplicates: '[es] Review duplicates',
        keepAll: '[es] Keep all',
        noDuplicatesTitle: '[es] All set!',
        noDuplicatesDescription: '[es] There are no duplicate transactions for review here.',
        confirmApprove: '[es] Confirm approval amount',
        confirmApprovalAmount: '[es] Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: '[es] This expense is on hold. Do you want to approve anyway?',
            other: '[es] These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: '[es] Confirm payment amount',
        confirmPayAmount: "[es] Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: '[es] This expense is on hold. Do you want to pay anyway?',
            other: '[es] These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: '[es] Pay only',
        approveOnly: '[es] Approve only',
        holdEducationalTitle: '[es] Should you hold this expense?',
        whatIsHoldExplain: "[es] Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: '[es] Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "[es] Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: '[es] You moved this report!',
            description: '[es] Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '[es] <strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: '[es] This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: '[es] Change workspace',
        set: '[es] set',
        changed: '[es] changed',
        removed: '[es] removed',
        transactionPending: '[es] Transaction pending.',
        chooseARate: '[es] Select a workspace reimbursement rate per mile or kilometer',
        unapprove: '[es] Unapprove',
        unapproveReport: '[es] Unapprove report',
        headsUp: '[es] Heads up!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `[es] This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: '[es] reimbursable',
        nonReimbursable: '[es] non-reimbursable',
        bookingPending: '[es] This booking is pending',
        bookingPendingDescription: "[es] This booking is pending because it hasn't been paid yet.",
        bookingArchived: '[es] This booking is archived',
        bookingArchivedDescription: '[es] This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: '[es] Attendees',
        totalPerAttendee: '[es] Per attendee',
        whoIsYourAccountant: '[es] Who is your accountant?',
        paymentComplete: '[es] Payment complete',
        time: '[es] Time',
        startDate: '[es] Start date',
        endDate: '[es] End date',
        startTime: '[es] Start time',
        endTime: '[es] End time',
        deleteSubrate: '[es] Delete subrate',
        deleteSubrateConfirmation: '[es] Are you sure you want to delete this subrate?',
        quantity: '[es] Quantity',
        subrateSelection: '[es] Select a subrate and enter a quantity.',
        qty: '[es] Qty',
        firstDayText: () => ({
            one: `[es] First day: 1 hour`,
            other: (count: number) => `[es] First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `[es] Last day: 1 hour`,
            other: (count: number) => `[es] Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `[es] Trip: 1 full day`,
            other: (count: number) => `[es] Trip: ${count} full days`,
        }),
        dates: '[es] Dates',
        rates: '[es] Rates',
        submitsTo: (name: string) => `[es] Submits to ${name}`,
        reject: {
            educationalTitle: '[es] Should you hold or reject?',
            educationalText: "[es] If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: '[es] Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: '[es] Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: '[es] Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "[es] Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: '[es] Reject expense',
            reasonPageDescription: '[es] Explain why you will not approve this expense.',
            rejectReason: '[es] Rejection reason',
            markAsResolved: '[es] Mark as resolved',
            rejectedStatus: '[es] This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: '[es] rejected this expense',
                markedAsResolved: '[es] marked the rejection reason as resolved',
            },
        },
        rejectReport: {
            title: '[es] Reject report',
            description: '[es] Explain why you will not approve this report:',
            rejectReason: '[es] Rejection reason',
            selectTarget: '[es] Choose the member to reject this report back to for review:',
            lastApprover: '[es] Last approver',
            submitter: '[es] Submitter',
            rejectedReportMessage: '[es] This report was rejected.',
            rejectedNextStep: '[es] This report was rejected. Waiting on you to fix the issues and manually resubmit.',
            selectMemberError: '[es] Select a member to reject this report back to.',
            couldNotReject: '[es] The report could not be rejected. Please try again.',
        },
        moveExpenses: '[es] Move to report',
        moveExpensesError: "[es] You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: '[es] Change approver',
            header: (workflowSettingLink: string) =>
                `[es] Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `[es] changed the approver to <mention-user accountID="${managerID}"/>`,
            reassignedApproverMessage: (managerID: number) => `[es] reassigned the approver to <mention-user accountID="${managerID}"/> via a workflow update`,
            actions: {
                addApprover: '[es] Add approver',
                addApproverSubtitle: '[es] Add an additional approver to the existing workflow.',
                bypassApprovers: '[es] Bypass approvers',
                bypassApproversSubtitle: '[es] Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: '[es] Choose an additional approver for this report before we route through the rest of the approval workflow.',
                bulkSubtitle: '[es] Choose an additional approver for these reports before we route through the rest of the approval workflow.',
            },
            bulkSubtitle: '[es] Choose an option to change the approver for these reports.',
        },
        chooseWorkspace: '[es] Choose a workspace',
        routedDueToDEW: (to: string, reason?: string) => `[es] report routed to ${to}${reason ? `[es]  because ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `[es] ${hours} ${hours === 1 ? '[es] hour' : '[es] hours'} @ ${rate} / hour`,
            hrs: '[es] hrs',
            hours: '[es] Hours',
            ratePreview: (rate: string) => `[es] ${rate} / hour`,
            amountTooLargeError: '[es] The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctRateError: '[es] Fix the rate error and try again.',
        AskToExplain: `[es] . <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explain<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '[es] marked the expense as "reimbursable"' : '[es] marked the expense as "non-reimbursable"'),
            billable: (value: boolean) => (value ? '[es] marked the expense as "billable"' : '[es] marked the expense as "non-billable"'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `[es] set the tax rate to "${value}"` : `[es] tax rate to "${value}"`),
            reportName: (value: string) => `[es] moved this expense to report "${value}"`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `[es] set the ${field} to "${value}"` : `[es] ${field} to "${value}"`;
            },
            formatPersonalRules: (fragments: string, route: string) => `[es] ${fragments} via <a href="${route}">personal expense rules</a>`,
            formatPolicyRules: (fragments: string, route: string) => `[es] ${fragments} via <a href="${route}">workspace rules</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: "[es] You can't duplicate per diem expenses across workspaces because the rates may differ between workspaces.",
        cannotDuplicateDistanceExpense: "[es] You can't duplicate distance expenses across workspaces because the rates may differ between workspaces.",
        bulkDuplicateLimit: `[es] You can duplicate up to ${CONST.SEARCH.BULK_DUPLICATE_LIMIT} expenses at a time. Please select fewer expenses and try again.`,
        taxDisabledAlert: {
            title: '[es] Tax disabled',
            prompt: '[es] Enable tax tracking on the workspace to edit the expense details or delete the tax from this expense.',
            confirmText: '[es] Delete tax',
        },
    },
    transactionMerge: {
        listPage: {
            header: '[es] Merge expenses',
            noEligibleExpenseFound: '[es] No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `[es] <muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `[es] Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '[es] Select receipt',
            pageTitle: '[es] Select the receipt you want to keep:',
        },
        detailsPage: {
            header: '[es] Select details',
            pageTitle: '[es] Select the details you want to keep:',
            noDifferences: '[es] No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '[es] an' : '[es] a';
                return `[es] Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: '[es] Please select attendees',
            selectAllDetailsError: '[es] Select all details before continuing.',
        },
        confirmationPage: {
            header: '[es] Confirm details',
            pageTitle: "[es] Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: '[es] Merge expenses',
        },
    },
    share: {
        shareToExpensify: '[es] Share to Expensify',
        messageInputLabel: '[es] Message',
    },
    notificationPreferencesPage: {
        header: '[es] Notification preferences',
        label: '[es] Notify me about new messages',
        notificationPreferences: {
            always: '[es] Immediately',
            daily: '[es] Daily',
            mute: '[es] Mute',
            hidden: '[es][ctx: UI label indicating that something is concealed or not visible to the user.] Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "[es] The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "[es] The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: '[es] Upload photo',
        removePhoto: '[es] Remove photo',
        editImage: '[es] Edit photo',
        viewPhoto: '[es] View photo',
        imageUploadFailed: '[es] Image upload failed',
        deleteWorkspaceError: '[es] Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `[es] The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `[es] Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `[es] Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: '[es] Edit profile picture',
        upload: '[es] Upload',
        uploadPhoto: '[es] Upload photo',
        selectAvatar: '[es] Select avatar',
        choosePresetAvatar: '[es] Or choose a custom avatar',
    },
    modal: {
        backdropLabel: '[es] Modal Backdrop',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] Waiting for an admin to add expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] Waiting for an admin to submit expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `[es] No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] Waiting for an admin to add a bank account.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                eta?: string,
                etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[es]  on the ${eta} of each month` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] Waiting for your expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] Waiting for an admin's expenses to automatically submit${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] Waiting for an admin to fix the issues.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] Waiting for an admin to approve expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] Waiting for an admin to export this report.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] Waiting for an admin to pay expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] Waiting for an admin to finish setting up a business bank account.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                eta?: string,
                etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[es]  by ${eta}` : ` ${eta}`;
                }
                return `[es] Waiting for payment to complete${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `[es] Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[es] This report was rejected. Waiting on <strong>you</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[es] This report was rejected. Waiting on <strong>${actor}</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[es] This report was rejected. Waiting on an admin to fix the issues and manually resubmit.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '[es] shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '[es] later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '[es] on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '[es] on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '[es] on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '[es] on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '[es] at the end of your trip',
        },
    },
    profilePage: {
        profile: '[es] Profile',
        preferredPronouns: '[es] Preferred pronouns',
        selectYourPronouns: '[es] Select your pronouns',
        selfSelectYourPronoun: '[es] Self-select your pronoun',
        emailAddress: '[es] Email address',
        setMyTimezoneAutomatically: '[es] Set my timezone automatically',
        timezone: '[es] Timezone',
        invalidFileMessage: '[es] Invalid file. Please try a different image.',
        avatarUploadFailureMessage: '[es] An error occurred uploading the avatar. Please try again.',
        online: '[es] Online',
        offline: '[es] Offline',
        syncing: '[es] Syncing',
        profileAvatar: '[es] Profile avatar',
        publicSection: {
            title: '[es] Public',
            subtitle: '[es] These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: '[es] Private',
            subtitle: "[es] These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: '[es] Security options',
        subtitle: '[es] Enable two-factor authentication to keep your account safe.',
        goToSecurity: '[es] Go back to security page',
    },
    shareCodePage: {
        title: '[es] Your code',
        subtitle: '[es] Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: '[es] Pronouns',
        isShownOnProfile: '[es] Your pronouns are shown on your profile.',
        placeholderText: '[es] Search to see options',
    },
    contacts: {
        contactMethods: '[es] Contact methods',
        featureRequiresValidate: '[es] This feature requires you to validate your account.',
        validateAccount: '[es] Validate your account',
        helpText: ({email}: {email: string}) =>
            `[es] Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: '[es] Please verify this contact method.',
        getInTouch: "[es] We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `[es] Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '[es] Set as default',
        yourDefaultContactMethod: "[es] This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        yourDefaultContactMethodRestrictedSwitch: '[es] This is your current default contact method. Your company has restricted removing or changing it.',
        removeContactMethod: '[es] Remove contact method',
        removeAreYouSure: "[es] Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: '[es] Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: '[es] Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: '[es] Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: '[es] Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: '[es] Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: '[es] Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: '[es] This contact method already exists',
            passwordRequired: '[es] password required.',
            contactMethodRequired: '[es] Contact method is required',
            invalidContactMethod: '[es] Invalid contact method',
        },
        newContactMethod: '[es] New contact method',
        goBackContactMethods: '[es] Go back to contact methods',
    },
    pronouns: {
        coCos: '[es] Co / Cos',
        eEyEmEir: '[es] E / Ey / Em / Eir',
        faeFaer: '[es] Fae / Faer',
        heHimHis: '[es] He / Him / His',
        heHimHisTheyThemTheirs: '[es] He / Him / His / They / Them / Theirs',
        sheHerHers: '[es] She / Her / Hers',
        sheHerHersTheyThemTheirs: '[es] She / Her / Hers / They / Them / Theirs',
        merMers: '[es] Mer / Mers',
        neNirNirs: '[es] Ne / Nir / Nirs',
        neeNerNers: '[es] Nee / Ner / Ners',
        perPers: '[es] Per / Pers',
        theyThemTheirs: '[es] They / Them / Theirs',
        thonThons: '[es] Thon / Thons',
        veVerVis: '[es] Ve / Ver / Vis',
        viVir: '[es] Vi / Vir',
        xeXemXyr: '[es] Xe / Xem / Xyr',
        zeZieZirHir: '[es] Ze / Zie / Zir / Hir',
        zeHirHirs: '[es] Ze / Hir',
        callMeByMyName: '[es] Call me by my name',
    },
    displayNamePage: {
        headerTitle: '[es] Display name',
        isShownOnProfile: '[es] Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: '[es] Timezone',
        isShownOnProfile: '[es] Your timezone is shown on your profile.',
        getLocationAutomatically: '[es] Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: '[es] Update required',
        pleaseInstall: '[es] Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: '[es] Please install the latest version of Expensify',
        toGetLatestChanges: '[es] For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: '[es] The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: '[es] About',
        aboutPage: {
            description: '[es] The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: '[es] App download links',
            viewKeyboardShortcuts: '[es] View keyboard shortcuts',
            viewTheCode: '[es] View the code',
            viewOpenJobs: '[es] View open jobs',
            reportABug: '[es] Report a bug',
            troubleshoot: '[es] Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: '[es] Android',
            },
            ios: {
                label: '[es] iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '[es] Clear cache and restart',
            description:
                '[es] <muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: '[es] All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: '[es] Reset and refresh',
            clientSideLogging: '[es] Client side logging',
            noLogsToShare: '[es] No logs to share',
            useProfiling: '[es] Use profiling',
            profileTrace: '[es] Profile trace',
            results: '[es] Results',
            releaseOptions: '[es] Release options',
            testingPreferences: '[es] Testing preferences',
            useStagingServer: '[es] Use Staging Server',
            forceOffline: '[es] Force offline',
            simulatePoorConnection: '[es] Simulate poor internet connection',
            simulateFailingNetworkRequests: '[es] Simulate failing network requests',
            authenticationStatus: '[es] Authentication status',
            deviceCredentials: '[es] Device credentials',
            invalidate: '[es] Invalidate',
            destroy: '[es] Destroy',
            maskExportOnyxStateData: '[es] Mask fragile member data while exporting Onyx state',
            exportOnyxState: '[es] Export Onyx state',
            importOnyxState: '[es] Import Onyx state',
            testCrash: '[es] Test crash',
            resetToOriginalState: '[es] Reset to original state',
            usingImportedState: '[es] You are using imported state. Press here to clear it.',
            debugMode: '[es] Debug mode',
            showBranchNameInTitle: '[es] Show branch name in browser title',
            invalidFile: '[es] Invalid file',
            invalidFileDescription: '[es] The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: '[es] Invalidate with delay',
            leftHandNavCache: '[es] Left Hand Nav cache',
            clearleftHandNavCache: '[es] Clear',
            softKillTheApp: '[es] Soft kill the app',
            kill: '[es] Kill',
            sentryDebug: '[es] Sentry debug',
            sentrySendDescription: '[es] Send data to Sentry',
            sentryDebugDescription: '[es] Log Sentry requests to console',
            sentryHighlightedSpanOps: '[es] Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: '[es] ui.interaction.click, navigation, ui.load',
        },
        security: '[es] Security',
        signOut: '[es] Sign out',
        restoreStashed: '[es] Restore stashed login',
        signOutConfirmationText: "[es] You'll lose any offline changes if you sign out.",
        versionLetter: '[es] v',
        readTheTermsAndPrivacy: `[es] Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.`,
        help: '[es] Help',
        helpPage: {
            title: '[es] Got questions?',
            description: "[es] We're here to help, around the clock.",
            helpSite: '[es] Help site',
            conciergeChat: '[es] Concierge',
            conciergeChatDescription: '[es] Your personal AI agent',
            accountManagerDescription: '[es] Your account manager',
            partnerManagerDescription: '[es] Your partner manager',
            guideDescription: '[es] Your setup specialist',
        },
        whatIsNew: "[es] What's new",
        accountSettings: '[es] Account settings',
        account: '[es] Account',
        general: '[es] General',
    },
    closeAccountPage: {
        closeAccount: '[es][ctx: close as a verb, not an adjective] Close account',
        reasonForLeavingPrompt: '[es] We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: '[es] Enter message here',
        closeAccountWarning: '[es] Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: '[es] Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: '[es] Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: '[es] Enter your default contact method',
        defaultContact: '[es] Default contact method:',
        enterYourDefaultContactMethod: '[es] Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: '[es] Merge accounts',
        accountDetails: {
            accountToMergeInto: (login: string) => `[es] Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: '[es] I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: '[es] Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: (login: string) => `[es] Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `[es] To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: '[es] Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: '[es] Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: '[es] Accounts merged!',
            description: (from: string, to: string) =>
                `[es] <muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '[es] We’re working on it',
            limitedSupport: '[es] We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp: '[es] <muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: '[es] Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `[es] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `[es] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `[es] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: '[es] Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `[es] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `[es] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `[es] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `[es] <muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '[es] Try again later',
            description: '[es] There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "[es] You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: '[es] You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: '[es] Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '[es] Report suspicious activity',
        lockAccount: '[es] Lock account',
        unlockAccount: '[es] Unlock account',
        unlockTitle: '[es] We’ve received your request',
        unlockDescription: '[es] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        compromisedDescription:
            '[es] Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: '[es] For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: '[es] Are you sure you want to lock your Expensify account?',
        onceLocked: '[es] Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '[es] Failed to lock account',
        failedToLockAccountDescription: `[es] We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: '[es] Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: '[es] Account locked',
        yourAccountIsLocked: '[es] Your account is locked',
        chatToConciergeToUnlock: '[es] Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: '[es] Chat with Concierge',
    },
    deviceManagementPage: {
        title: '[es] Device management',
        description:
            '[es] Manage all the devices that you have logged into with your Expensify Account. <a href="https://help.expensify.com/articles/new-expensify/settings/Manage-Logged-in-Devices">Learn more</a>.',
        revoke: '[es] Revoke',
        unknownDevice: '[es] Unknown Device',
    },
    twoFactorAuth: {
        headerTitle: '[es] Two-factor authentication',
        twoFactorAuthEnabled: '[es] Two-factor authentication enabled',
        whatIsTwoFactorAuth: '[es] Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: '[es] Disable two-factor authentication',
        explainProcessToRemove: '[es] To disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: '[es] To disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: '[es] Two-factor authentication is now disabled',
        downloadCodes: '[es] Download codes',
        noAuthenticatorApp: '[es] You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: '[es] Recovery codes',
        keepCodesSafe: '[es] Keep these codes safe!',
        codesLoseAccess: dedent(`
            [es] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            <strong>Note</strong>: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        screenshotTip: '[es] Tip: Screenshot this to save it to your photo library',
        errorStepCodes: '[es] Please copy or download codes before continuing',
        stepVerify: '[es] Verify',
        scanCode: '[es] Scan the QR code using your',
        authenticatorApp: '[es] authenticator app',
        addKey: '[es] Or add this secret key to your authenticator app:',
        secretKey: '[es] secret key',
        enterCode: '[es] Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: '[es] Finished',
        enabled: '[es] Two-factor authentication enabled',
        congrats: '[es] Congrats! Now you’ve got that extra security.',
        copy: '[es] Copy',
        copyCodes: '[es] Copy codes',
        disable: '[es] Disable',
        enableTwoFactorAuth: '[es] Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: '[es] Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: '[es] For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: '[es] Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: '[es] Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: '[es] Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: '[es] Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: '[es] Cannot disable 2FA',
        twoFactorAuthRequired: '[es] Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
        replaceDevice: '[es] Replace device',
        replaceDeviceTitle: '[es] Replace two-factor device',
        verifyOldDeviceTitle: '[es] Verify old device',
        verifyOldDeviceDescription: '[es] Enter the six-digit code from your current authenticator app to confirm you have access to it.',
        verifyNewDeviceTitle: '[es] Set up new device',
        verifyNewDeviceDescription: '[es] Scan the QR code with your new device, then enter the code to complete setup.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '[es] Please enter your recovery code',
            incorrectRecoveryCode: '[es] Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: '[es] Use recovery code',
        recoveryCode: '[es] Recovery code',
        use2fa: '[es] Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '[es] Please enter your two-factor authentication code',
            incorrect2fa: '[es] Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '[es] Password updated!',
        allSet: '[es] You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: '[es] Private notes',
        personalNoteMessage: "[es] Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: '[es] Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: '[es] Notes',
        myNote: '[es] My note',
        error: {
            genericFailureMessage: "[es] Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: '[es] Please enter a valid security code',
        },
        securityCode: '[es] Security code',
        changeBillingCurrency: '[es] Change billing currency',
        changePaymentCurrency: '[es] Change payment currency',
        paymentCurrency: '[es] Payment currency',
        paymentCurrencyDescription: '[es] Select a standardized currency that all personal expenses should be converted to',
        note: `[es] Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: '[es] Add a debit card',
        nameOnCard: '[es] Name on card',
        debitCardNumber: '[es] Debit card number',
        expiration: '[es] Expiration date',
        expirationDate: '[es] MMYY',
        cvv: '[es] CVV',
        billingAddress: '[es] Billing address',
        growlMessageOnSave: '[es] Your debit card was successfully added',
        expensifyPassword: '[es] Expensify password',
        error: {
            invalidName: '[es] Name can only include letters',
            addressZipCode: '[es] Please enter a valid zip code',
            debitCardNumber: '[es] Please enter a valid debit card number',
            expirationDate: '[es] Please select a valid expiration date',
            securityCode: '[es] Please enter a valid security code',
            addressStreet: "[es] Please enter a valid billing address that's not a PO box",
            addressState: '[es] Please select a state',
            addressCity: '[es] Please enter a city',
            genericFailureMessage: '[es] An error occurred while adding your card. Please try again.',
            password: '[es] Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '[es] Add payment card',
        nameOnCard: '[es] Name on card',
        paymentCardNumber: '[es] Card number',
        expiration: '[es] Expiration date',
        expirationDate: '[es] MM/YY',
        cvv: '[es] CVV',
        billingAddress: '[es] Billing address',
        growlMessageOnSave: '[es] Your payment card was successfully added',
        expensifyPassword: '[es] Expensify password',
        error: {
            invalidName: '[es] Name can only include letters',
            addressZipCode: '[es] Please enter a valid zip code',
            paymentCardNumber: '[es] Please enter a valid card number',
            expirationDate: '[es] Please select a valid expiration date',
            securityCode: '[es] Please enter a valid security code',
            addressStreet: "[es] Please enter a valid billing address that's not a PO box",
            addressState: '[es] Please select a state',
            addressCity: '[es] Please enter a city',
            genericFailureMessage: '[es] An error occurred while adding your card. Please try again.',
            password: '[es] Please enter your Expensify password',
        },
    },
    personalCard: {
        addPersonalCard: '[es] Add personal card',
        addCompanyCard: '[es] Add company card',
        lookingForCompanyCards: '[es] Need to add company cards?',
        lookingForCompanyCardsDescription: '[es] Bring your own cards from 10,000+ banks worldwide.',
        personalCardAdded: '[es] Personal card added!',
        personalCardAddedDescription: '[es] Congrats, we’ll begin importing transactions from your card.',
        isPersonalCard: '[es] Is this a personal card?',
        thisIsPersonalCard: '[es] This is a personal card',
        thisIsCompanyCard: '[es] This is a company card',
        askAdmin: '[es] Ask your admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `[es] If so, great! But if it's a <strong>company</strong> card, please ${isAdmin ? '[es] assign it from your workspace instead.' : '[es] ask your admin to assign it to you from the workspace instead.'}`,
        bankConnectionError: '[es] Bank connection issue',
        bankConnectionDescription: '[es] Please try adding your cards again. Otherwise, you can',
        connectWithPlaid: '[es] connect via Plaid.',
        brokenConnection: '[es] Your card connection is broken.',
        fixCard: '[es] Fix card',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `[es] Your ${cardName} card connection is broken. <a href="${connectionLink}">Log into your bank</a> to fix the card.`
                : `[es] Your ${cardName} card connection is broken. Log into your bank to fix the card.`,
        addAdditionalCards: '[es] Add additional cards',
        upgradeDescription: '[es] Need to add more cards? Create a workspace to add additional personal cards or assign company cards to the entire team.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `[es] <muted-text>This is available on the Collect plan, which is <strong>${formattedPrice}</strong> per member per month.</muted-text>`,
        note: (subscriptionLink: string) =>
            `[es] <muted-text>Create a workspace to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
        workspaceCreated: '[es] Workspace created',
        newWorkspace: '[es] You created a workspace!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `[es] <centered-text>You’re all set to add additional cards. <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
    },
    walletPage: {
        balance: '[es] Balance',
        paymentMethodsTitle: '[es] Payment methods',
        setDefaultConfirmation: '[es] Make default payment method',
        setDefaultSuccess: '[es] Default payment method set!',
        deleteAccount: '[es] Delete account',
        deleteConfirmation: '[es] Are you sure you want to delete this account?',
        deleteCard: '[es] Delete card',
        deleteCardConfirmation:
            '[es] All unsubmitted card transactions, including those on open reports, will be removed. Are you sure you want to delete this card? You cannot undo this action.',
        error: {
            notOwnerOfBankAccount: '[es] An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: '[es] This bank account is temporarily suspended',
            notOwnerOfFund: '[es] An error occurred while setting this card as your default payment method',
            setDefaultFailure: '[es] Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: '[es] An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: '[es] Get paid faster',
        addPaymentMethod: '[es] Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: '[es] Get paid back faster',
        secureAccessToYourMoney: '[es] Secure access to your money',
        receiveMoney: '[es] Receive money in your local currency',
        expensifyWallet: '[es] Expensify Wallet (Beta)',
        sendAndReceiveMoney: '[es] Send and receive money with friends. US bank accounts only.',
        enableWallet: '[es] Enable wallet',
        addBankAccountToSendAndReceive: '[es] Add a bank account to make or receive payments.',
        addDebitOrCreditCard: '[es] Add debit or credit card',
        cardInactive: '[es] Inactive',
        cardActive: '[es] Active',
        bankAccountStatus: {
            active: '[es] Active',
            incomplete: '[es] Incomplete',
            pending: '[es] Pending',
            verifying: '[es] Verifying',
            locked: '[es] Locked',
            incompleteDescription: '[es] Finish adding bank account',
            pendingDescription: '[es] Please confirm test transactions',
            verifyingDescription: "[es] We're reviewing your documentation",
            lockedDescription: '[es] This account requires attention',
            finish: '[es] Finish',
            confirm: '[es] Confirm',
            unlock: '[es] Unlock',
        },
        cardFixConnection: '[es] Please fix this connection',
        cardAskAdminToFix: '[es] Please ask an admin to fix this connection',
        cardAdminFixConnection: '[es] Please fix this connection in Company Cards',
        lastSynced: (dateStr: string) => `[es] Last synced ${dateStr}`,
        assignedCards: '[es] Cards',
        assignedCardsDescription: '[es] Transactions from assigned cards sync automatically.',
        expensifyCard: '[es] Expensify Card',
        walletActivationPending: "[es] We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "[es] Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: '[es] Add your bank account',
        addBankAccountBody: "[es] Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: '[es] Choose your bank account',
        chooseAccountBody: '[es] Make sure that you select the right one.',
        confirmYourBankAccount: '[es] Confirm your bank account',
        personalBankAccounts: '[es] Personal bank accounts',
        businessBankAccounts: '[es] Business bank accounts',
        shareBankAccount: '[es] Share bank account',
        bankAccountShared: '[es] Bank account shared',
        shareBankAccountTitle: '[es] Select the admins to share this bank account with:',
        shareBankAccountSuccess: '[es] Bank account shared!',
        shareBankAccountSuccessDescription: '[es] The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: '[es] An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: '[es] No admins available',
        shareBankAccountEmptyDescription: '[es] There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: '[es] Please select an admin before continuing',
        unshareBankAccount: '[es] Unshare bank account',
        unshareBankAccountDescription: '[es] Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `[es] ${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: '[es] It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: `[es] Can't unshare bank account`,
        travelCVV: {
            title: '[es] Travel CVV',
            subtitle: '[es] Use this when booking travel',
            description: "[es] Use this card for your Expensify Travel bookings. It'll show as “Travel Card” at checkout.",
        },
        chaseAccountNumberDifferent: '[es] Why is my account number different?',
    },
    cardPage: {
        expensifyCard: '[es] Expensify Card',
        expensifyTravelCard: '[es] Expensify Travel Card',
        availableSpend: '[es] Remaining limit',
        smartLimit: {
            name: '[es] Smart limit',
            title: (formattedLimit: string) => `[es] You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: '[es] Fixed limit',
            title: (formattedLimit: string) => `[es] You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: '[es] Monthly limit',
            title: (formattedLimit: string) => `[es] You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: '[es] Virtual card number',
        travelCardCvv: '[es] Travel card CVV',
        physicalCardNumber: '[es] Physical card number',
        physicalCardPin: '[es] PIN',
        getPhysicalCard: '[es] Get physical card',
        reportFraud: '[es] Report virtual card fraud',
        reportTravelFraud: '[es] Report travel card fraud',
        spendRules: '[es] Spend rules',
        editSpendRules: '[es] Edit spend rules',
        reviewTransaction: '[es] Review transaction',
        suspiciousBannerTitle: '[es] Suspicious transaction',
        suspiciousBannerDescription: '[es] We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "[es] Your card is temporarily locked while our team reviews your company's account.",
        markTransactionsAsReimbursable: '[es] Mark transactions as reimbursable',
        markTransactionsDescription: '[es] When enabled, transactions imported from this card are marked as reimbursable by default.',
        csvCardDescription: '[es] CSV Import',
        cardDetails: {
            cardNumber: '[es] Virtual card number',
            expiration: '[es] Expiration',
            cvv: '[es] CVV',
            address: '[es] Address',
            reveal: '[es] Reveal',
            revealDetails: '[es] Reveal details',
            revealCvv: '[es] Reveal CVV',
            copyCardNumber: '[es] Copy card number',
            copyCvv: '[es] Copy CVV',
            updateAddress: '[es] Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `[es] Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: '[es] An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "[es] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[es] Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        unexpectedError: '[es] There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: '[es] Yes, I do',
            reportFraudButtonText: "[es] No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `[es] cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `[es] deactivated the card ending in ${cardLastFour}`,
            alertMessage: ({
                cardLastFour,
                amount,
                merchant,
                date,
            }: {
                cardLastFour: string;
                amount: string;
                merchant: string;
                date: string;
            }) => `[es] identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?

${amount} for ${merchant} - ${date}`,
        },
        setYourPin: '[es] Set the PIN for your card.',
        confirmYourPin: '[es] Enter your PIN again to confirm.',
        changeYourPin: '[es] Enter a new PIN for your card.',
        confirmYourChangedPin: '[es] Confirm your new PIN.',
        pinMustBeFourDigits: '[es] PIN must be exactly 4 digits.',
        invalidPin: '[es] Please choose a more secure PIN.',
        pinMismatch: '[es] PINs do not match. Please try again.',
        revealPin: '[es] Reveal PIN',
        hidePin: '[es] Hide PIN',
        pin: '[es] PIN',
        pinChanged: '[es] PIN changed!',
        pinChangedHeader: '[es] PIN changed',
        pinChangedDescription: "[es] You're all set to use your PIN now.",
        cardUnblocked: '[es] Card unblocked!',
        cardUnblockedDescription: '[es] You may be prompted to insert your card into the reader the next time you make a purchase.',
        pinBlocked: '[es] Your card was blocked due to incorrect PIN entries.',
        unblock: '[es] Unblock',
        unblockCard: '[es] Unblock card',
        changePin: '[es] Change PIN',
        changePinAtATM: '[es] Change your PIN at any ATM',
        changePinAtATMDescription: '[es] This is required in your region. <concierge-link>Reach out to Concierge</concierge-link> if you have any questions.',
        freezeCard: '[es] Freeze card',
        unfreeze: '[es] Unfreeze',
        unfreezeCard: '[es] Unfreeze card',
        askToUnfreeze: '[es] Ask to unfreeze',
        freezeDescription: '[es] A frozen card cannot be used for purchases and transactions. You can unfreeze it at any time.',
        unfreezeDescription: "[es] Unfreezing this card will start allowing purchases and transactions again. Only proceed if you're sure the card is safe to use.",
        frozen: '[es] Frozen',
        youFroze: ({date}: {date: string}) => `[es] You froze this card on ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `[es] ${person} froze this card on ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `[es] This card was frozen on ${date} by `,
        frozenByAdminNeedsUnfreezePrefix: '[es] This card was frozen by ',
        frozenByAdminNeedsUnfreezeSuffix: '[es] . Please contact an admin to unfreeze it.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `[es] This card was frozen by ${person}. Please contact an admin to unfreeze it.`,
    },
    workflowsPage: {
        workflowTitle: '[es] Spend',
        workflowDescription: '[es] Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: '[es] Submissions',
        submissionFrequencyDescription: '[es] Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: '[es] Date of month',
        disableApprovalPromptDescription: '[es] Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: '[es] Approvals',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `[es] expenses from ${members}, and the approver is ${approvers}`,
        addApprovalButton: '[es] Add approval workflow',
        findWorkflow: '[es] Find workflow',
        addApprovalTip: '[es] This default workflow applies to all members, unless a more specific workflow exists.',
        approver: '[es] Approver',
        addApprovalsDescription: '[es] Require additional approval before authorizing a payment.',
        configureViaHR: ({provider}: {provider: string}) => `[es] Configure via ${provider}.`,
        hrApprovalWorkflowLockedPrompt: ({provider}: {provider: string}) =>
            `[es] Approvals are managed by your ${provider} integration. To update your approval workflow, head to your ${provider} connection settings.`,
        goToHRSettings: ({provider}: {provider: string}) => `[es] Go to ${provider} settings`,
        makeOrTrackPaymentsTitle: '[es] Payments',
        makeOrTrackPaymentsDescription: '[es] Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '[es] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '[es] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: '[es] Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: '[es] Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: '[es] Instantly',
            weekly: '[es] Weekly',
            monthly: '[es] Monthly',
            twiceAMonth: '[es] Twice a month',
            byTrip: '[es] By trip',
            manually: '[es] Manually',
            daily: '[es] Daily',
            lastDayOfMonth: '[es] Last day of the month',
            lastBusinessDayOfMonth: '[es] Last business day of the month',
            ordinals: {
                one: '[es] st',
                two: '[es] nd',
                few: '[es] rd',
                other: '[es] th',
                '1': '[es] First',
                '2': '[es] Second',
                '3': '[es] Third',
                '4': '[es] Fourth',
                '5': '[es] Fifth',
                '6': '[es] Sixth',
                '7': '[es] Seventh',
                '8': '[es] Eighth',
                '9': '[es] Ninth',
                '10': '[es] Tenth',
            },
        },
        approverInMultipleWorkflows: '[es] This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `[es] <strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: '[es] No members to display',
            expensesFromSubtitle: '[es] All workspace members already belong to an existing approval workflow.',
            approverSubtitle: '[es] All approvers belong to an existing workflow.',
            bulkApproverSubtitle: '[es] No approvers match the criteria for selected reports.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "[es] Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "[es] Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: '[es] Confirm',
        header: '[es] Add more approvers and confirm.',
        additionalApprover: '[es] Additional approver',
        submitButton: '[es] Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: '[es] Edit approval workflow',
        deleteTitle: '[es] Delete approval workflow',
        deletePrompt: '[es] Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: '[es] Expenses from',
        header: '[es] When the following members submit expenses:',
        memberAlreadyInWorkflowTitle: '[es] Member already in a workflow',
        memberAlreadyInWorkflowPrompt: ({memberName, approverName}: {memberName: string; approverName: string}) =>
            `[es] ${memberName} is already in an approval workflow that submits to ${approverName}. Adding them here will move them to this workflow.`,
    },
    workflowsApproverPage: {
        genericErrorMessage: "[es] The approver couldn't be changed. Please try again or contact support.",
        title: '[es] Set approver',
        description: '[es] This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: '[es] Approver',
        header: '[es] (Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `[es] Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : '[es] Add another approver when a report exceeds the amount below:',
        reportAmountLabel: '[es] Report amount',
        additionalApproverLabel: '[es] Additional approver',
        skip: '[es] Skip',
        next: '[es] Next',
        removeLimit: '[es] Remove limit',
        enterAmountError: '[es] Please enter a valid amount',
        enterApproverError: '[es] Approver is required when you set a report limit',
        enterBothError: '[es] Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `[es] Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: '[es] Authorized payer',
        genericErrorMessage: '[es] The authorized payer could not be changed. Please try again.',
        admins: '[es] Admins',
        payer: '[es] Payer',
        paymentAccount: '[es] Payment account',
        shareBankAccount: {
            shareTitle: '[es] Share bank account access?',
            shareDescription: ({admin}: {admin: string}) => `[es] You'll need to share bank account access with ${admin} to make them the payer.`,
            validationTitle: '[es] Bank account awaiting validation',
            validationDescription: ({admin}: {admin: string}) =>
                `[es] You need to <a href="#">validate this bank account</a>. Once that's done, you can share bank account access with ${admin} to make them the payer.`,
            errorTitle: "[es] Can't change payer",
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `[es] ${admin} doesn't have access to this bank account, so you can't make them the payer. <a href="#">Chat with ${owner}</a> if the bank account should be shared.`,
        },
    },
    reportFraudPage: {
        title: '[es] Report virtual card fraud',
        description: '[es] If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: '[es] Deactivate card',
        reportVirtualCardFraud: '[es] Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: '[es] Card fraud reported',
        description: '[es] We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        descriptionCardNotReplaced: '[es] Your card was permanently deactivated. Please contact an admin to issue a new card.',
        buttonText: '[es] Got it, thanks!',
    },
    activateCardPage: {
        activateCard: '[es] Activate card',
        pleaseEnterLastFour: '[es] Please enter the last four digits of your card.',
        activatePhysicalCard: '[es] Activate physical card',
        error: {
            thatDidNotMatch: "[es] That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "[es] You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: '[es] Get physical card',
        nameMessage: '[es] Enter your first and last name, as this will be shown on your card.',
        legalName: '[es] Legal name',
        legalFirstName: '[es] Legal first name',
        legalLastName: '[es] Legal last name',
        phoneMessage: '[es] Enter your phone number.',
        phoneNumber: '[es] Phone number',
        address: '[es] Address',
        addressMessage: '[es] Enter your shipping address.',
        streetAddress: '[es] Street Address',
        city: '[es] City',
        state: '[es] State',
        zipPostcode: '[es] Zip/Postcode',
        country: '[es] Country',
        confirmMessage: '[es] Please confirm your details below.',
        estimatedDeliveryMessage: '[es] Your physical card will arrive in 2-3 business days.',
        next: '[es] Next',
        getPhysicalCard: '[es] Get physical card',
        shipCard: '[es] Ship card',
    },
    transferAmountPage: {
        transfer: (amount: string) => `[es] Transfer${amount ? ` ${amount}` : ''}`,
        instant: '[es] Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `[es] ${rate}% fee (${minAmount} minimum)`,
        ach: '[es] 1-3 Business days (Bank account)',
        achSummary: '[es] No fee',
        whichAccount: '[es] Which account?',
        fee: '[es] Fee',
        transferSuccess: '[es] Transfer successful!',
        transferDetailBankAccount: '[es] Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: '[es] Your money should arrive immediately.',
        failedTransfer: '[es] Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: '[es] Please transfer your balance from the wallet page',
        goToWallet: '[es] Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: '[es] Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: '[es] Add payment method',
        addNewDebitCard: '[es] Add new debit card',
        addNewBankAccount: '[es] Add new bank account',
        accountLastFour: '[es] Ending in',
        cardLastFour: '[es] Card ending in',
        addFirstPaymentMethod: '[es] Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: '[es] Default',
        bankAccountLastFour: (lastFour: string) => `[es] Bank Account • ${lastFour}`,
    },
    agentsPage: {
        title: '[es] Agents',
        subtitle: '[es] Create agents to handle your workflow. Skip the manual work and get hours back in your day.',
        newAgent: '[es] New agent',
        emptyAgents: {
            title: '[es] No agents created',
            subtitle: '[es] Stop manually doing stuff. Instruct an agent instead and save yourself lots of time.',
        },
        error: {
            genericAdd: '[es] There was a problem adding this agent',
            genericUpdate: '[es] There was a problem updating this agent',
            updateName: "[es] There was a problem updating this agent's name",
            updatePrompt: "[es] There was a problem updating this agent's instructions",
            updateAvatar: "[es] There was a problem updating this agent's avatar",
        },
    },
    addAgentPage: {
        title: '[es] New agent',
        agentName: '[es] Agent name',
        instructions: '[es] Write custom instructions',
        createAgent: '[es] Create agent',
        editAvatar: '[es] Edit avatar',
        defaultAgentName: (displayName: string) => `[es] ${displayName}'s Agent`,
        defaultPrompt:
            "[es] Reject expenses that are for gambling, movies, or other obvious non-business reasons.\n\nRemind the user to always include a receipt image that makes the tip clear.\n\nApprove the report if it's very similar to previous reports from the same user.\n\nReject reports with more than $500 in travel expenses.",
    },
    editAgentPage: {
        title: '[es] Edit agent',
        agentName: '[es] Agent name',
        instructions: '[es] Write custom instructions',
        deleteAgent: '[es] Delete agent',
        deleteAgentTitle: '[es] Delete agent?',
        deleteAgentMessage: '[es] Are you sure you want to delete this agent? This action cannot be undone.',
    },
    editAgentAvatarPage: {
        title: '[es] Edit avatar',
    },
    editAgentNamePage: {
        title: '[es] Agent name',
    },
    editAgentPromptPage: {
        title: '[es] Write custom instructions',
        error: {
            emptyPrompt: '[es] Please enter instructions for your agent.',
        },
    },
    expenseRulesPage: {
        title: '[es] Expense rules',
        subtitle: '[es] These rules will apply to your expenses.',
        findRule: '[es] Find rule',
        emptyRules: {
            title: "[es] You haven't created any rules",
            subtitle: '[es] Add a rule to automate expense reporting.',
        },
        changes: {
            billableUpdate: (value: boolean) => `[es] Update expense ${value ? '[es] billable' : '[es] non-billable'}`,
            categoryUpdate: (value: string) => `[es] Update category to "${value}"`,
            commentUpdate: (value: string) => `[es] Update description to "${value}"`,
            merchantUpdate: (value: string) => `[es] Update merchant to "${value}"`,
            reimbursableUpdate: (value: boolean) => `[es] Update expense ${value ? '[es] reimbursable' : '[es] non-reimbursable'}`,
            tagUpdate: (value: string) => `[es] Update tag to "${value}"`,
            taxUpdate: (value: string) => `[es] Update tax rate to "${value}"`,
            billable: (value: boolean) => `[es] expense ${value ? '[es] billable' : '[es] non-billable'}`,
            category: (value: string) => `[es] category to "${value}"`,
            comment: (value: string) => `[es] description to "${value}"`,
            merchant: (value: string) => `[es] merchant to "${value}"`,
            reimbursable: (value: boolean) => `[es] expense ${value ? '[es] reimbursable' : '[es] non-reimbursable'}`,
            tag: (value: string) => `[es] tag to "${value}"`,
            tax: (value: string) => `[es] tax rate to "${value}"`,
            report: (value: string) => `[es] add to a report named "${value}"`,
        },
        newRule: '[es] New rule',
        addRule: {
            title: '[es] Add rule',
            expenseContains: '[es] If expense contains:',
            applyUpdates: '[es] Then apply these updates:',
            merchantHint: '[es] Type . to create a rule that applies to all merchants',
            addToReport: '[es] Add to a report named',
            createReport: '[es] Create report if necessary',
            applyToExistingExpenses: '[es] Apply to existing matching expenses',
            confirmError: '[es] Enter merchant and apply at least one update',
            confirmErrorMerchant: '[es] Please enter merchant',
            confirmErrorUpdate: '[es] Please apply at least one update',
            saveRule: '[es] Save rule',
        },
        editRule: {
            title: '[es] Edit rule',
        },
        deleteRule: {
            deleteSingle: '[es] Delete rule',
            deleteMultiple: '[es] Delete rules',
            deleteSinglePrompt: '[es] Are you sure you want to delete this rule?',
            deleteMultiplePrompt: '[es] Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: '[es] App preferences',
        },
        testSection: {
            title: '[es] Test preferences',
            subtitle: '[es] Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '[es] Receive relevant feature updates and Expensify news',
        muteAllSounds: '[es] Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: '[es] Priority mode',
        explainerText: '[es] Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: '[es] Most recent',
                description: '[es] Show all chats sorted by most recent',
            },
            gsd: {
                label: '[es] #focus',
                description: '[es] Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `[es] in ${policyName}`,
        generatingPDF: '[es] Generate PDF',
        waitForPDF: '[es] Please wait while we generate the PDF.',
        errorPDF: '[es] There was an error when trying to generate your PDF',
        successPDF: "[es] Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: '[es] Room description',
        roomDescriptionOptional: '[es] Room description (optional)',
        explainerText: '[es] Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: '[es] Heads up!',
        lastMemberWarning: "[es] Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: (displayName: string) => `[es] ${displayName}'s group chat`,
    },
    languagePage: {
        language: '[es] Language',
        aiGenerated: '[es] The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: '[es] Theme',
        themes: {
            dark: {
                label: '[es] Dark',
            },
            light: {
                label: '[es] Light',
            },
            system: {
                label: '[es] Use device settings',
            },
        },
        highContrastMode: '[es] High contrast mode',
        chooseThemeBelowOrSync: '[es] Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `[es] <muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `[es] Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "[es] Didn't receive a magic code?",
        avoidScamsMessage: '[es] <strong>Avoid scams. Do not share your code with anyone.</strong> Our team will never call, text, or email you for this code.',
        enterAuthenticatorCode: '[es] Please enter your authenticator code',
        enterRecoveryCode: '[es] Please enter your recovery code',
        requiredWhen2FAEnabled: '[es] Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `[es] Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '[es] Request a new code',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `[es] Time remaining: ${timeRemaining} ${timeRemaining === 1 ? '[es] second' : '[es] seconds'}`,
        timeExpiredAnnouncement: '[es] The time has expired',
        error: {
            pleaseFillMagicCode: '[es] Please enter your magic code',
            incorrectMagicCode: '[es] Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: '[es] Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '[es] Please fill out all fields',
        pleaseFillPassword: '[es] Please enter your password',
        pleaseFillTwoFactorAuth: '[es] Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: '[es] Enter your two-factor authentication code to continue',
        forgot: '[es] Forgot?',
        requiredWhen2FAEnabled: '[es] Required when 2FA is enabled',
        error: {
            incorrectPassword: '[es] Incorrect password. Please try again.',
            incorrectLoginOrPassword: '[es] Incorrect login or password. Please try again.',
            incorrect2fa: '[es] Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: '[es] You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: '[es] Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                '[es] We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: '[es] You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: '[es] Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: '[es] Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: '[es] Phone or email',
        error: {
            invalidFormatEmailLogin: '[es] The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "[es] Couldn't retrieve account details. Please try to sign in again.",
        loginForm: '[es] Login form',
        notYou: (user: string) => `[es] Not ${user}?`,
    },
    onboarding: {
        welcome: '[es] Welcome!',
        welcomeSignOffTitleManageTeam: '[es] Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "[es] It's great to meet you!",
        explanationModal: {
            title: '[es] Welcome to Expensify',
            description: '[es] One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: '[es] To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: '[es] Get started',
        whatsYourName: "[es] What's your name?",
        peopleYouMayKnow: '[es] People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: (domain: string, email: string) => `[es] Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '[es] Join a workspace',
        listOfWorkspaces: "[es] Here's the list of workspaces you can join.",
        skipForNow: '[es] Skip for now',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `[es] ${employeeCount} member${employeeCount > 1 ? '[es] s' : ''} • ${policyOwner}`,
        whereYouWork: '[es] Where do you work?',
        errorSelection: '[es] Select an option to move forward',
        purpose: {
            title: '[es] What do you want to do today?',
            errorContinue: '[es] Please press continue to get set up',
            errorBackButton: '[es] Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '[es] Submit expenses to my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "[es] Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.TRACK_BUSINESS]: '[es] Track expenses for my business',
            [CONST.ONBOARDING_CHOICES.TRACK_PERSONAL]: '[es] Organize my personal spending',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '[es] Something else',
        },
        employees: {
            title: '[es] How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL]: '[es] 1-4 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM]: '[es] 5-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '[es] 1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '[es] 11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '[es] 51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '[es] 101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '[es] More than 1,000 employees',
        },
        accounting: {
            title: '[es] Do you use any accounting software?',
            none: '[es] None',
        },
        interestedFeatures: {
            title: '[es] What features are you interested in?',
            featuresAlreadyEnabled: '[es] Here are our most popular features:',
            featureYouMayBeInterestedIn: '[es] Enable additional features:',
        },
        error: {
            requiredFirstName: '[es] Please input your first name to continue',
        },
        workEmail: {
            title: '[es] What’s your work email?',
            subtitle: '[es] Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: '[es] Forward to receipts@expensify.com for scanning',
                descriptionTwo: '[es] Join your colleagues already using Expensify',
                descriptionThree: '[es] Enjoy a more customized experience',
            },
            addWorkEmail: '[es] Add work email',
        },
        workEmailValidation: {
            title: '[es] Verify your work email',
            magicCodeSent: (workEmail: string | undefined) => `[es] Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: '[es] Please enter a valid work email from a private domain e.g. mitch@company.com',
            sameAsSignupEmail: '[es] Please enter a different email than the one you signed up with',
            offline: '[es] We couldn’t add your work email as you appear to be offline',
        },
        workEmail2FAError: '[es] This login is an existing account with Two-Factor Authentication (2FA) enabled.',
        mergeBlockScreen: {
            title: '[es] Couldn’t add work email',
            subtitle: (workEmail: string | undefined) => `[es] We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
            workAccountClosedSubtitle: '[es] The work account associated with this email is closed. Please contact your company admin to reactivate it, or sign up with a different email.',
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[es] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[es] [Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[es] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[es] Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: '[es] Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [es] *Add expense approvals* to review your team's spend and keep it under control.

                        Here's how:

                        1. Go to *Workspaces*.
                        2. Select your workspace.
                        3. Click *More features*.
                        4. Enable *Workflows*.
                        5. Navigate to *Workflows* in the workspace editor.
                        6. Enable *Approvals*.
                        7. You'll be set as the expense approver. You can change this to any admin once you invite your team.

                        [Take me to more features](${workspaceMoreFeaturesLink}).
                    `),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[es] [Create](${workspaceConfirmationLink}) a workspace`,
                description: '[es] Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[es] Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [es] *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[es] Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        [es] *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '[es] Submit an expense',
                description: dedent(`
                    [es] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: '[es] Submit an expense',
                description: dedent(`
                    [es] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: '[es] Track an expense',
                description: dedent(`
                    [es] *Track an expense* in any currency, whether you have a receipt or not.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Choose your *personal* space.
                    5. Click *Create*.

                    And you're done! Yep, it's that easy.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `[es] Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '[es]  to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[es] your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        [es] Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[es] your' : '[es] to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        [Take me to accounting](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[es] Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        [es] Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[es] Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [es] *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[es] Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        [es] *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[es] Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [es] Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *More features*.
                        4. Enable *Tags*.
                        5. Navigate to *Tags* in the workspace editor.
                        6. Click *+ Add tag* to make your own.

                        [Take me to more features](${workspaceMoreFeaturesLink}).

                    `),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `[es] Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [es] *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: '[es] Start a chat',
                description: dedent(`
                    [es] *Start a chat* with anyone using their email or phone number.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },
            splitExpenseTask: {
                title: '[es] Split an expense',
                description: dedent(`
                    [es] *Split expenses* with one or more people.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[es] Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [es] Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: '[es] Create your first report',
                description: dedent(`
                    [es] Here's how to create a report:

                    1. Click the *+* button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[es] Take a [test drive](${testDriveURL})` : '[es] Take a test drive'),
            embeddedDemoIframeTitle: '[es] Test Drive',
            employeeFakeReceipt: {
                description: '[es] My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '[es] Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: '[es] Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        [es] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        [es] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage: '[es] To make the most of your 30-day free trial, follow the remaining steps below:',
            onboardingChatSplitMessage: '[es] Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "[es] Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingTestDriveReceiverMessage: "[es] *You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: '[es] Stay organized with a workspace',
            subtitle: '[es] Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: '[es] Track and organize receipts',
                descriptionTwo: '[es] Categorize and tag expenses',
                descriptionThree: '[es] Create and share reports',
            },
            price: (price?: string) => `[es] Try it free for 30 days, then upgrade for just <strong>${price ?? '$5'}/user/month</strong>.`,
            createWorkspace: '[es] Create workspace',
        },
        confirmWorkspace: {
            title: '[es] Confirm workspace',
            subtitle: '[es] Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: '[es] Invite members',
            subtitle: '[es] Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "[es] Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '[es] Name cannot contain special characters',
            containsReservedWord: '[es] Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: '[es] Name cannot contain a comma or semicolon',
            requiredFirstName: '[es] First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "[es] What's your legal name?",
        enterDateOfBirth: "[es] What's your date of birth?",
        enterAddress: "[es] What's your address?",
        enterPhoneNumber: "[es] What's your phone number?",
        personalDetails: '[es] Personal details',
        privateDataMessage: '[es] These details are used for travel and payments. They are never shown on your public profile.',
        legalName: '[es] Legal name',
        legalFirstName: '[es] Legal first name',
        legalLastName: '[es] Legal last name',
        address: '[es] Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `[es] Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `[es] Date should be after ${dateString}`,
            hasInvalidCharacter: '[es] Name can only include Latin characters',
            cannotIncludeCommaOrSemicolon: '[es] Name cannot contain a comma or semicolon',
            incorrectZipFormat: (zipFormat?: string) => `[es] Incorrect zip code format${zipFormat ? `[es]  Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `[es] Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '[es] Link has been re-sent',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `[es] I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: '[es] Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) => `[es] To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `[es] If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '[es] Unlink',
        linkSent: '[es] Link sent!',
        successfullyUnlinkedLogin: '[es] Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) => `[es] Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `[es] <strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `[es] <strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `[es] Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: '[es] Something went wrong...',
        subtitle: `[es] We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: '[es] Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `[es] We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: '[es] Your number has been validated! Click below to send a new magic sign-in code.',
        validationFailed: ({
            timeData,
        }: {
            timeData?: {
                days?: number;
                hours?: number;
                minutes?: number;
            } | null;
        }) => {
            if (!timeData) {
                return '[es] Please wait a moment before trying again.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '[es] day' : '[es] days'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '[es] hour' : '[es] hours'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '[es] minute' : '[es] minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `[es] Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: '[es] Join',
    },
    detailsPage: {
        localTime: '[es] Local time',
    },
    newChatPage: {
        startGroup: '[es] Start group',
        addToGroup: '[es] Add to group',
        addUserToGroup: (username: string) => `[es] Add ${username} to group`,
    },
    yearPickerPage: {
        year: '[es] Year',
        selectYear: '[es] Please select a year',
    },
    monthPickerPage: {
        month: '[es] Month',
        selectMonth: '[es] Please select a month',
    },
    focusModeUpdateModal: {
        title: '[es] Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `[es] Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '[es] The chat you are looking for cannot be found.',
        getMeOutOfHere: '[es] Get me out of here',
        iouReportNotFound: '[es] The payment details you are looking for cannot be found.',
        notHere: "[es] Hmm... it's not here",
        pageNotFound: '[es] Oops, this page cannot be found',
        noAccess: '[es] This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: '[es] Go back to home page',
        commentYouLookingForCannotBeFound: '[es] The comment you are looking for cannot be found.',
        goToChatInstead: '[es] Go to the chat instead.',
        contactConcierge: '[es] For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `[es] Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: '[es] Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "[es] That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: '[es] Status',
        statusExplanation: "[es] Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: '[es] Today',
        clearStatus: '[es] Clear status',
        save: '[es] Save',
        message: '[es] Message',
        timePeriods: {
            never: '[es] Never',
            thirtyMinutes: '[es] 30 minutes',
            oneHour: '[es] 1 hour',
            afterToday: '[es] Today',
            afterWeek: '[es] A week',
            custom: '[es] Custom',
        },
        untilTomorrow: '[es] Until tomorrow',
        untilTime: (time: string) => `[es] Until ${time}`,
        date: '[es] Date',
        time: '[es] Time',
        clearAfter: '[es] Clear after',
        whenClearStatus: '[es] When should we clear your status?',
        setVacationDelegate: `[es] Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        cannotSetVacationDelegate: `[es] You can't set a vacation delegate because you're currently the delegate for the following members:`,
        addVacationDelegate: '[es] Add vacation delegate',
        vacationDelegateError: '[es] There was an error updating your vacation delegate.',
        asVacationDelegate: (nameOrEmail: string) => `[es] as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `[es] to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `[es] You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `[es] Step ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '[es] Bank info',
        confirmBankInfo: '[es] Confirm bank info',
        manuallyAdd: '[es] Manually add your bank account',
        letsDoubleCheck: "[es] Let's double check that everything looks right.",
        accountEnding: '[es] Account ending in',
        thisBankAccount: '[es] This bank account will be used for business payments on your workspace',
        accountNumber: '[es] Account number',
        routingNumber: '[es] Routing number',
        chooseAnAccountBelow: '[es] Choose an account below',
        addBankAccount: '[es] Add bank account',
        chooseAnAccount: '[es] Choose an account',
        connectOnlineWithPlaid: '[es] Log into your bank',
        connectManually: '[es] Connect manually',
        desktopConnection: '[es] Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: '[es] Your data is secure',
        toGetStarted: '[es] Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: '[es] Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: '[es] Your routing number and account number can be found on a check for the account.',
        bankAccountPurposeTitle: '[es] What do you want to do with your bank account?',
        getReimbursed: '[es] Get reimbursed',
        getReimbursedDescription: '[es] By employer or others',
        makePayments: '[es] Make payments',
        makePaymentsDescription: '[es] Pay expenses or issue Expensify Cards',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `[es] To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: '[es] An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: (workspaceRoute: string) =>
            `[es] Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: '[es] Business bank account added!',
        bbaAddedDescription: "[es] It's ready to be used for payments.",
        lockedBankAccount: '[es] Locked bank account',
        unlockBankAccount: '[es] Unlock bank account',
        youCantPayThis: `[es] You can't pay this report because you have a <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">locked bank account</a>. Tap below and Concierge will help with the next steps to unlock it.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `[es] <h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `[es] Expensify Business Bank Account ${maskedAccountNumber}
Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.`,
        error: {
            youNeedToSelectAnOption: '[es] Please select an option to proceed',
            noBankAccountAvailable: "[es] Sorry, there's no bank account available",
            noBankAccountSelected: '[es] Please choose an account',
            taxID: '[es] Please enter a valid tax ID number',
            website: '[es] Please enter a valid website',
            zipCode: `[es] Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '[es] Please enter a valid phone number',
            email: '[es] Please enter a valid email address',
            companyName: '[es] Please enter a valid business name',
            addressCity: '[es] Please enter a valid city',
            addressStreet: '[es] Please enter a valid street address',
            addressState: '[es] Please select a valid state',
            incorporationDateFuture: "[es] Incorporation date can't be in the future",
            incorporationState: '[es] Please select a valid state',
            industryCode: '[es] Please enter a valid industry classification code with six digits',
            restrictedBusiness: "[es] Please confirm the business isn't on the list of restricted businesses",
            routingNumber: '[es] Please enter a valid routing number',
            accountNumber: '[es] Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "[es] Routing and account numbers can't match",
            companyType: '[es] Please select a valid company type',
            tooManyAttempts: '[es] Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: '[es] Please enter a valid address',
            dob: '[es] Please select a valid date of birth',
            age: '[es] Must be over 18 years old',
            ssnLast4: '[es] Please enter valid last 4 digits of SSN',
            firstName: '[es] Please enter a valid first name',
            lastName: '[es] Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: '[es] Please add a default deposit account or debit card',
            validationAmounts: '[es] The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: '[es] Please enter a valid full name',
            ownershipPercentage: '[es] Please enter a valid percentage number',
            deletePaymentBankAccount:
                "[es] This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: '[es] The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "[es] Where's your bank account located?",
        accountDetailsStepHeader: '[es] What are your account details?',
        accountTypeStepHeader: '[es] What type of account is this?',
        bankInformationStepHeader: '[es] What are your bank details?',
        accountHolderInformationStepHeader: '[es] What are the account holder details?',
        howDoWeProtectYourData: '[es] How do we protect your data?',
        currencyHeader: "[es] What's your bank account's currency?",
        confirmationStepHeader: '[es] Check your info.',
        confirmationStepSubHeader: '[es] Double check the details below, and check the terms box to confirm.',
        toGetStarted: '[es] Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
        updatePersonalInfo: '[es] Update bank account',
        updatePersonalInfoFailure: '[es] Unable to update bank account information. Please try again later.',
        updateSuccessTitle: '[es] Bank account updated!',
        updateSuccessHeader: '[es] Bank account updated',
        updateSuccessMessage: '[es] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    addPersonalBankAccountPage: {
        enterPassword: '[es] Enter Expensify password',
        alreadyAdded: '[es] This account has already been added.',
        chooseAccountLabel: '[es] Account',
        successTitle: '[es] Personal bank account added!',
        successMessage: '[es] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: '[es] Unknown filename',
        passwordRequired: '[es] Please enter a password',
        passwordIncorrect: '[es] Incorrect password. Please try again.',
        failedToLoadPDF: '[es] Failed to load PDF file',
        pdfPasswordForm: {
            title: '[es] Password protected PDF',
            infoText: '[es] This PDF is password protected.',
            beforeLinkText: '[es] Please',
            linkText: '[es] enter the password',
            afterLinkText: '[es] to view it.',
            formLabel: '[es] View PDF',
        },
        attachmentNotFound: '[es] Attachment not found',
        retry: '[es] Retry',
    },
    messages: {
        errorMessageInvalidPhone: `[es] Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '[es] Invalid email',
        userIsAlreadyMember: (login: string, name: string) => `[es] ${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: (login: string, name: string) => `[es] ${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '[es] By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: '[es] Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `[es] <muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: '[es] Try again',
        verifyIdentity: '[es] Verify identity',
        letsVerifyIdentity: "[es] Let's verify your identity",
        butFirst: `[es] But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '[es] An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: '[es] Enable camera access',
        cameraRequestMessage: '[es] We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: '[es] Enable microphone access',
        microphoneRequestMessage: '[es] We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: '[es] Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: '[es] Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "[es] There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "[es] There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "[es] Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "[es] Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: '[es] Additional details',
        helpText: '[es] We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: '[es] We need to ask you just a few more questions to finish validating your identity.',
        helpLink: '[es] Learn more about why we need this.',
        legalFirstNameLabel: '[es] Legal first name',
        legalMiddleNameLabel: '[es] Legal middle name',
        legalLastNameLabel: '[es] Legal last name',
        selectAnswer: '[es] Please select a response to proceed',
        ssnFull9Error: '[es] Please enter a valid nine-digit SSN',
        needSSNFull9: "[es] We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "[es] We couldn't verify",
        pleaseFixIt: '[es] Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `[es] We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: '[es] Terms and fees',
        headerTitleRefactor: '[es] Fees and terms',
        haveReadAndAgreePlain: '[es] I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `[es] I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: '[es] I agree to the Privacy and Wallet agreement.',
        agreeToThe: (walletAgreementUrl: string) =>
            `[es] I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: '[es] Enable payments',
        monthlyFee: '[es] Monthly fee',
        inactivity: '[es] Inactivity',
        noOverdraftOrCredit: '[es] No overdraft/credit feature.',
        electronicFundsWithdrawal: '[es] Electronic funds withdrawal',
        standard: '[es] Standard',
        reviewTheFees: '[es] Take a look at some fees.',
        checkTheBoxes: '[es] Please check the boxes below.',
        agreeToTerms: '[es] Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `[es] The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: '[es] Per purchase',
            atmWithdrawal: '[es] ATM withdrawal',
            cashReload: '[es] Cash reload',
            inNetwork: '[es] in-network',
            outOfNetwork: '[es] out-of-network',
            atmBalanceInquiry: '[es] ATM balance inquiry (in-network or out-of-network)',
            customerService: '[es] Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: '[es] Inactivity (after 12 months with no transactions)',
            weChargeOneFee: '[es] We charge 1 other type of fee. It is:',
            fdicInsurance: '[es] Your funds are eligible for FDIC insurance.',
            generalInfo: `[es] For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `[es] For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: '[es] Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: (amount: string) => `[es] (min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '[es] A list of all Expensify Wallet fees',
            typeOfFeeHeader: '[es] All fees',
            feeAmountHeader: '[es] Amount',
            moreDetailsHeader: '[es] Details',
            openingAccountTitle: '[es] Opening an account',
            openingAccountDetails: "[es] There's no fee to open an account.",
            monthlyFeeDetails: "[es] There's no monthly fee.",
            customerServiceTitle: '[es] Customer service',
            customerServiceDetails: '[es] There are no customer service fees.',
            inactivityDetails: "[es] There's no inactivity fee.",
            sendingFundsTitle: '[es] Sending funds to another account holder',
            sendingFundsDetails: "[es] There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "[es] There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "[es] There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                `[es]  The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `[es] Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                `[es]  Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `[es] Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `[es] For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: '[es] View printer-friendly version',
            automated: '[es] Automated',
            liveAgent: '[es] Live agent',
            instant: '[es] Instant',
            electronicFundsInstantFeeMin: (amount: string) => `[es] Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '[es] Enable payments',
        activatedTitle: '[es] Wallet activated!',
        activatedMessage: '[es] Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: '[es] Just a minute...',
        checkBackLaterMessage: "[es] We're still reviewing your information. Please check back later.",
        continueToPayment: '[es] Continue to payment',
        continueToTransfer: '[es] Continue to transfer',
    },
    companyStep: {
        headerTitle: '[es] Company information',
        subtitle: '[es] Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: '[es] Legal business name',
        companyWebsite: '[es] Company website',
        taxIDNumber: '[es] Tax ID number',
        taxIDNumberPlaceholder: '[es] 9 digits',
        companyType: '[es] Company type',
        incorporationDate: '[es] Incorporation date',
        incorporationState: '[es] Incorporation state',
        industryClassificationCode: '[es] Industry classification code',
        confirmCompanyIsNot: '[es] I confirm that this company is not on the',
        listOfRestrictedBusinesses: '[es] list of restricted businesses',
        incorporationDatePlaceholder: '[es] Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '[es] LLC',
            CORPORATION: '[es] Corp',
            PARTNERSHIP: '[es] Partnership',
            COOPERATIVE: '[es] Cooperative',
            SOLE_PROPRIETORSHIP: '[es] Sole proprietorship',
            OTHER: '[es] Other',
        },
        industryClassification: '[es] Which industry is the business classified under?',
        industryClassificationCodePlaceholder: '[es] Search for industry classification code',
    },
    requestorStep: {
        headerTitle: '[es] Personal information',
        learnMore: '[es] Learn more',
        isMyDataSafe: '[es] Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: '[es] Personal info',
        enterYourLegalFirstAndLast: "[es] What's your legal name?",
        legalFirstName: '[es] Legal first name',
        legalLastName: '[es] Legal last name',
        legalName: '[es] Legal name',
        enterYourDateOfBirth: "[es] What's your date of birth?",
        enterTheLast4: '[es] What are the last four digits of your Social Security Number?',
        dontWorry: "[es] Don't worry, we don't do any personal credit checks!",
        last4SSN: '[es] Last 4 of SSN',
        enterYourAddress: "[es] What's your address?",
        address: '[es] Address',
        letsDoubleCheck: "[es] Let's double check that everything looks right.",
        byAddingThisBankAccount: "[es] By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: '[es] What’s your legal name?',
        whatsYourDOB: '[es] What’s your date of birth?',
        whatsYourAddress: '[es] What’s your address?',
        whatsYourSSN: '[es] What are the last four digits of your Social Security Number?',
        noPersonalChecks: '[es] Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: '[es] What’s your phone number?',
        weNeedThisToVerify: '[es] We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: '[es] Company info',
        enterTheNameOfYourBusiness: "[es] What's the name of your company?",
        businessName: '[es] Legal company name',
        enterYourCompanyTaxIdNumber: "[es] What's your company’s Tax ID number?",
        taxIDNumber: '[es] Tax ID number',
        taxIDNumberPlaceholder: '[es] 9 digits',
        enterYourCompanyWebsite: "[es] What's your company’s website?",
        companyWebsite: '[es] Company website',
        enterYourCompanyPhoneNumber: "[es] What's your company’s phone number?",
        enterYourCompanyAddress: "[es] What's your company’s address?",
        selectYourCompanyType: '[es] What type of company is it?',
        companyType: '[es] Company type',
        incorporationType: {
            LLC: '[es] LLC',
            CORPORATION: '[es] Corp',
            PARTNERSHIP: '[es] Partnership',
            COOPERATIVE: '[es] Cooperative',
            SOLE_PROPRIETORSHIP: '[es] Sole proprietorship',
            OTHER: '[es] Other',
        },
        selectYourCompanyIncorporationDate: "[es] What's your company’s incorporation date?",
        incorporationDate: '[es] Incorporation date',
        incorporationDatePlaceholder: '[es] Start date (yyyy-mm-dd)',
        incorporationState: '[es] Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '[es] Which state was your company incorporated in?',
        letsDoubleCheck: "[es] Let's double check that everything looks right.",
        companyAddress: '[es] Company address',
        listOfRestrictedBusinesses: '[es] list of restricted businesses',
        confirmCompanyIsNot: '[es] I confirm that this company is not on the',
        businessInfoTitle: '[es] Business info',
        legalBusinessName: '[es] Legal business name',
        whatsTheBusinessName: "[es] What's the business name?",
        whatsTheBusinessAddress: "[es] What's the business address?",
        whatsTheBusinessContactInformation: "[es] What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "[es] What's the Company Registration Number (CRN)?";
                default:
                    return "[es] What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[es] What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return '[es] What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return '[es] What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return '[es] What’s the Australian Business Number (ABN)?';
                default:
                    return '[es] What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "[es] What's this number?",
        whereWasTheBusinessIncorporated: '[es] Where was the business incorporated?',
        whatTypeOfBusinessIsIt: '[es] What type of business is it?',
        whatsTheBusinessAnnualPayment: "[es] What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "[es] What's your expected average reimbursement amount?",
        registrationNumber: '[es] Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[es] EIN';
                case CONST.COUNTRY.CA:
                    return '[es] BN';
                case CONST.COUNTRY.GB:
                    return '[es] VRN';
                case CONST.COUNTRY.AU:
                    return '[es] ABN';
                default:
                    return '[es] EU VAT';
            }
        },
        businessAddress: '[es] Business address',
        businessType: '[es] Business type',
        incorporation: '[es] Incorporation',
        incorporationCountry: '[es] Incorporation country',
        incorporationTypeName: '[es] Incorporation type',
        businessCategory: '[es] Business category',
        annualPaymentVolume: '[es] Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `[es] Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '[es] Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `[es] Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '[es] Select incorporation type',
        selectBusinessCategory: '[es] Select business category',
        selectAnnualPaymentVolume: '[es] Select annual payment volume',
        selectIncorporationCountry: '[es] Select incorporation country',
        selectIncorporationState: '[es] Select incorporation state',
        selectAverageReimbursement: '[es] Select average reimbursement amount',
        selectBusinessType: '[es] Select business type',
        findIncorporationType: '[es] Find incorporation type',
        findBusinessCategory: '[es] Find business category',
        findAnnualPaymentVolume: '[es] Find annual payment volume',
        findIncorporationState: '[es] Find incorporation state',
        findAverageReimbursement: '[es] Find average reimbursement amount',
        findBusinessType: '[es] Find business type',
        error: {
            registrationNumber: '[es] Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '[es] Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return '[es] Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return '[es] Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return '[es] Please provide a valid Australian Business Number (ABN)';
                    default:
                        return '[es] Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `[es] Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `[es] Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `[es] Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: '[es] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: '[es] Business owner',
        enterLegalFirstAndLastName: "[es] What's the owner's legal name?",
        legalFirstName: '[es] Legal first name',
        legalLastName: '[es] Legal last name',
        enterTheDateOfBirthOfTheOwner: "[es] What's the owner's date of birth?",
        enterTheLast4: '[es] What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: '[es] Last 4 of SSN',
        dontWorry: "[es] Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "[es] What's the owner's address?",
        letsDoubleCheck: '[es] Let’s double check that everything looks right.',
        legalName: '[es] Legal name',
        address: '[es] Address',
        byAddingThisBankAccount: "[es] By adding this bank account, you confirm that you've read, understand, and accept",
        owners: '[es] Owners',
    },
    ownershipInfoStep: {
        ownerInfo: '[es] Owner info',
        businessOwner: '[es] Business owner',
        signerInfo: '[es] Signer info',
        doYouOwn: (companyName: string) => `[es] Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `[es] Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: '[es] Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: '[es] Legal first name',
        legalLastName: '[es] Legal last name',
        whatsTheOwnersName: "[es] What's the owner's legal name?",
        whatsYourName: "[es] What's your legal name?",
        whatPercentage: '[es] What percentage of the business belongs to the owner?',
        whatsYoursPercentage: '[es] What percentage of the business do you own?',
        ownership: '[es] Ownership',
        whatsTheOwnersDOB: "[es] What's the owner's date of birth?",
        whatsYourDOB: "[es] What's your date of birth?",
        whatsTheOwnersAddress: "[es] What's the owner's address?",
        whatsYourAddress: "[es] What's your address?",
        whatAreTheLast: "[es] What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: '[es] What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: '[es] What is your country of citizenship?',
        whatsTheOwnersNationality: "[es] What's the owner's country of citizenship?",
        countryOfCitizenship: '[es] Country of citizenship',
        dontWorry: "[es] Don't worry, we don't do any personal credit checks!",
        last4: '[es] Last 4 of SSN',
        whyDoWeAsk: '[es] Why do we ask for this?',
        letsDoubleCheck: '[es] Let’s double check that everything looks right.',
        legalName: '[es] Legal name',
        ownershipPercentage: '[es] Ownership percentage',
        areThereOther: (companyName: string) => `[es] Are there other individuals who own 25% or more of ${companyName}?`,
        owners: '[es] Owners',
        addCertified: '[es] Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart: '[es] Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: '[es] Upload entity ownership chart',
        noteEntity: '[es] Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: '[es] Certified entity ownership chart',
        selectCountry: '[es] Select country',
        findCountry: '[es] Find country',
        address: '[es] Address',
        chooseFile: '[es] Choose file',
        uploadDocuments: '[es] Upload additional documentation',
        pleaseUpload: '[es] Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: '[es] Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: '[es] Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "[es] Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: '[es] Copy of ID for beneficial owner',
        copyOfIDDescription: "[es] Examples: Passport, driver's license, etc.",
        proofOfAddress: '[es] Address proof for beneficial owner',
        proofOfAddressDescription: '[es] Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: '[es] Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            '[es] Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: '[es] Complete verification',
        confirmAgreements: '[es] Please confirm the agreements below.',
        certifyTrueAndAccurate: '[es] I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: '[es] Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: '[es] I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: '[es] You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: '[es] terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '[es] Validate your bank account',
        validateButtonText: '[es] Validate',
        validationInputLabel: '[es] Transaction',
        maxAttemptsReached: '[es] Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `[es] Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '[es] Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: '[es] Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: '[es] Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: '[es] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: '[es] Secure your account',
    },
    countryStep: {
        confirmBusinessBank: '[es] Confirm business bank account currency and country',
        confirmCurrency: '[es] Confirm currency and country',
        yourBusiness: '[es] Your business bank account currency must match your workspace currency.',
        youCanChange: '[es] You can change your workspace currency in your',
        findCountry: '[es] Find country',
        selectCountry: '[es] Select country',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `[es] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> so you can invite a director to sign in a later step.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '[es] What are your business bank account details?',
        letsDoubleCheck: '[es] Let’s double check that everything looks fine.',
        thisBankAccount: '[es] This bank account will be used for business payments on your workspace',
        accountNumber: '[es] Account number',
        accountHolderNameDescription: "[es] Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: '[es] Signer info',
        areYouDirector: (companyName: string) => `[es] Are you a director at ${companyName}?`,
        regulationRequiresUs: '[es] Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "[es] What's your legal name",
        fullName: '[es] Legal full name',
        whatsYourJobTitle: "[es] What's your job title?",
        jobTitle: '[es] Job title',
        whatsYourDOB: "[es] What's your date of birth?",
        uploadID: '[es] Upload ID and proof of address',
        personalAddress: '[es] Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: '[es] Let’s double check that everything looks right.',
        legalName: '[es] Legal name',
        proofOf: '[es] Proof of personal address',
        enterOneEmail: (companyName: string) => `[es] Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: '[es] Regulation requires at least one more director as a signer.',
        hangTight: '[es] Hang tight...',
        enterTwoEmails: (companyName: string) => `[es] Enter the emails of two directors at ${companyName}`,
        sendReminder: '[es] Send a reminder',
        chooseFile: '[es] Choose file',
        weAreWaiting: "[es] We're waiting for others to verify their identities as directors of the business.",
        id: '[es] Copy of ID',
        proofOfDirectors: '[es] Proof of director(s)',
        proofOfDirectorsDescription: '[es] Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: '[es] Codice Fiscale',
        codiceFiscaleDescription: '[es] Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: '[es] PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            [es] Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: '[es] Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: '[es] Enter signer info',
        thisStep: '[es] This step has been completed',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `[es] is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: '[es] Emails must be different',
            connectToWorkspace: (workspaceRoute: string) => `[es] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> to invite a director to sign.`,
        },
    },
    agreementsStep: {
        agreements: '[es] Agreements',
        pleaseConfirm: '[es] Please confirm the agreements below',
        regulationRequiresUs: '[es] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: '[es] I am authorized to use the business bank account for business spend.',
        iCertify: '[es] I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `[es] I accept the <a href="https://www.corpay.com/cross-border/terms">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: '[es] I accept the terms and conditions.',
        accept: '[es] Accept and add bank account',
        iConsentToThePrivacyNotice: '[es] I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: '[es] I consent to the privacy notice.',
        error: {
            authorized: '[es] You must be a controlling officer with authorization to operate the business bank account',
            certify: '[es] Please certify that the information is true and accurate',
            consent: '[es] Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: '[es] Docusign Form',
        pleaseComplete:
            '[es] Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: '[es] Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            '[es] Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: '[es] Take me to Docusign',
        uploadAdditional: '[es] Upload additional documentation',
        pleaseUpload: '[es] Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: '[es] Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "[es] Let's finish in chat!",
        thanksFor:
            "[es] Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: '[es] I have a question',
        enable2FA: '[es] Enable two-factor authentication (2FA) to prevent fraud',
        weTake: '[es] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: '[es] Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '[es] One moment',
        explanationLine: "[es] We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "[es] Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: '[es] Book travel',
        title: '[es] Travel smart',
        subtitle: '[es] Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: '[es] Save money on your bookings',
            alerts: '[es] Get realtime alerts if your travel plans change',
        },
        bookTravel: '[es] Book travel',
        bookDemo: '[es] Book demo',
        bookADemo: '[es] Book a demo',
        toLearnMore: '[es]  to learn more.',
        termsAndConditions: {
            header: '[es] Before we continue...',
            title: '[es] Terms & conditions',
            label: '[es] I agree to the terms & conditions',
            subtitle: `[es] Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: '[es] You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                '[es] You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: '[es] Flight',
        flightDetails: {
            passenger: '[es] Passenger',
            layover: (layover: string) => `[es] <muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: '[es] Take-off',
            landing: '[es] Landing',
            seat: '[es] Seat',
            class: '[es] Cabin Class',
            recordLocator: '[es] Record locator',
            cabinClasses: {
                unknown: '[es] Unknown',
                economy: '[es] Economy',
                premiumEconomy: '[es] Premium Economy',
                business: '[es] Business',
                first: '[es] First',
            },
        },
        hotel: '[es] Hotel',
        hotelDetails: {
            guest: '[es] Guest',
            checkIn: '[es] Check-in',
            checkOut: '[es] Check-out',
            roomType: '[es] Room type',
            cancellation: '[es] Cancellation policy',
            cancellationUntil: '[es] Free cancellation until',
            confirmation: '[es] Confirmation number',
            cancellationPolicies: {
                unknown: '[es] Unknown',
                nonRefundable: '[es] Non-refundable',
                freeCancellationUntil: '[es] Free cancellation until',
                partiallyRefundable: '[es] Partially refundable',
            },
        },
        car: '[es] Car',
        carDetails: {
            rentalCar: '[es] Car rental',
            pickUp: '[es] Pick-up',
            dropOff: '[es] Drop-off',
            driver: '[es] Driver',
            carType: '[es] Car type',
            cancellation: '[es] Cancellation policy',
            cancellationUntil: '[es] Free cancellation until',
            freeCancellation: '[es] Free cancellation',
            confirmation: '[es] Confirmation number',
        },
        train: '[es] Rail',
        trainDetails: {
            passenger: '[es] Passenger',
            departs: '[es] Departs',
            arrives: '[es] Arrives',
            coachNumber: '[es] Coach number',
            seat: '[es] Seat',
            fareDetails: '[es] Fare details',
            confirmation: '[es] Confirmation number',
        },
        viewTrip: '[es] View trip',
        modifyTrip: '[es] Modify trip',
        tripSupport: '[es] Trip support',
        tripDetails: '[es] Trip details',
        viewTripDetails: '[es] View trip details',
        trip: '[es] Trip',
        trips: '[es] Trips',
        tripSummary: '[es] Trip summary',
        departs: '[es] Departs',
        errorMessage: '[es] Something went wrong. Please try again later.',
        phoneError: (phoneErrorMethodsRoute: string) => `[es] <rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: '[es] Domain',
            subtitle: '[es] Choose a domain for Expensify Travel setup.',
            recommended: '[es] Recommended',
        },
        domainPermissionInfo: {
            title: '[es] Domain',
            restriction: (domain: string) =>
                `[es] You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `[es] If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '[es] Get started with Expensify Travel',
            message: `[es] You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: '[es] Expensify Travel has been disabled',
            message: `[es] Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "[es] We're reviewing your request...",
            message: `[es] We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: '[es] Got it',
            conciergeMessage: ({domain}: {domain: string}) => `[es] Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `[es] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[es] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[es] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[es] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `[es] The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `[es] Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[es] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `[es] Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `[es] Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `[es] Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `[es] Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: '[es] Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: (type: string, id = '') => `[es] You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `[es] The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: (type: string, id = '') => `[es] Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: (type: string) => `[es] Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `[es] Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `[es] Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `[es] Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: (type: string) => `[es] Your ${type} reservation was updated.`,
        },
        flightTo: '[es] Flight to',
        trainTo: '[es] Train to',
        carRental: '[es]  car rental',
        nightIn: '[es] night in',
        nightsIn: '[es] nights in',
    },
    proactiveAppReview: {
        title: '[es] Enjoying New Expensify?',
        description: '[es] Let us know so we can help make your expensing experience even better.',
        positiveButton: '[es] Yeah!',
        negativeButton: '[es] Not really',
    },
    workspace: {
        common: {
            card: '[es] Cards',
            expensifyCard: '[es] Expensify Card',
            companyCards: '[es] Company cards',
            personalCards: '[es] Personal cards',
            workflows: '[es] Workflows',
            workspace: '[es] Workspace',
            findWorkspace: '[es] Find workspace',
            edit: '[es] Edit workspace',
            enabled: '[es] Enabled',
            disabled: '[es] Disabled',
            everyone: '[es] Everyone',
            delete: '[es] Delete workspace',
            settings: '[es] Settings',
            categories: '[es] Categories',
            tags: '[es] Tags',
            customField1: '[es] Custom field 1',
            customField2: '[es] Custom field 2',
            customFieldHint: '[es] Add custom coding that applies to all spend from this member.',
            reports: '[es] Reports',
            reportFields: '[es] Report fields',
            reportTitle: '[es] Report title',
            reportField: '[es] Report field',
            taxes: '[es] Taxes',
            bills: '[es] Bills',
            invoices: '[es] Invoices',
            perDiem: '[es] Per diem',
            travel: '[es] Travel',
            members: '[es] Members',
            rooms: '[es] Rooms',
            accounting: '[es] Accounting',
            hr: '[es] HR',
            receiptPartners: '[es] Receipt partners',
            rules: '[es] Rules',
            displayedAs: '[es] Displayed as',
            plan: '[es] Plan',
            profile: '[es] Overview',
            bankAccount: '[es] Bank account',
            testTransactions: '[es] Test transactions',
            issueAndManageCards: '[es] Issue and manage cards',
            reconcileCards: '[es] Reconcile cards',
            selectAll: '[es] Select all',
            selected: () => ({
                one: '[es] 1 selected',
                other: (count: number) => `[es] ${count} selected`,
            }),
            settlementFrequency: '[es] Settlement frequency',
            setAsDefault: '[es] Set as default workspace',
            defaultNote: `[es] Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '[es] Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: '[es] Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            deleteOpenExpensifyCardsError: '[es] Your company still has open Expensify Cards.',
            outstandingBalanceWarning:
                '[es] You have an outstanding balance that must be settled before deleting your last workspace. Please go to your subscription settings to resolve the payment.',
            settleBalance: '[es] Go to subscription',
            unavailable: '[es] Unavailable workspace',
            memberNotFound: '[es] Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `[es] You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: '[es] Go to workspace',
            duplicateWorkspace: '[es] Duplicate workspace',
            duplicateWorkspacePrefix: '[es] Duplicate',
            goToWorkspaces: '[es] Go to workspaces',
            clearFilter: '[es] Clear filter',
            workspaceName: '[es] Workspace name',
            workspaceOwner: '[es] Owner',
            keepMeAsAdmin: '[es] Keep me as an admin',
            workspaceType: '[es] Workspace type',
            workspaceAvatar: '[es] Workspace avatar',
            clientID: '[es] Client ID',
            clientIDInputHint: "[es] Enter the client's unique identifier",
            mustBeOnlineToViewMembers: '[es] You need to be online in order to view members of this workspace.',
            moreFeatures: '[es] More features',
            requested: '[es] Requested',
            distanceRates: '[es] Distance rates',
            defaultDescription: '[es] One place for all your receipts and expenses.',
            descriptionHint: '[es] Share information about this workspace with all members.',
            welcomeNote: '[es] Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: '[es] Subscription',
            markAsEntered: '[es] Mark as manually entered',
            markAsExported: '[es] Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `[es] Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "[es] Let's double check that everything looks right.",
            lineItemLevel: '[es] Line-item level',
            reportLevel: '[es] Report level',
            topLevel: '[es] Top level',
            appliedOnExport: '[es] Not imported into Expensify, applied on export',
            shareNote: {
                header: '[es] Share your workspace with other members',
                content: (adminsRoomLink: string) =>
                    `[es] Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `[es] Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '[es] Create new connection',
            reuseExistingConnection: '[es] Reuse existing connection',
            existingConnections: '[es] Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `[es] Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `[es] ${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `[es] Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: '[es] Learn more',
            memberAlternateText: '[es] Submit and approve reports.',
            adminAlternateText: '[es] Manage reports and workspace settings.',
            auditorAlternateText: '[es] View and comment on reports.',
            cardAdminAlternateText: '[es] Manage workspace cards.',
            peopleAdminAlternateText: '[es] Manage members and approval workflows.',
            paymentsAdminAlternateText: '[es] Manage workflow payments.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: '[es] Direct',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: '[es] None',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '[es] Indirect',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '[es] Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '[es] Auditor';
                    case CONST.POLICY.ROLE.CARD_ADMIN:
                        return '[es] Card Admin';
                    case CONST.POLICY.ROLE.PEOPLE_ADMIN:
                        return '[es] People Admin';
                    case CONST.POLICY.ROLE.PAYMENTS_ADMIN:
                        return '[es] Payments Admin';
                    case CONST.POLICY.ROLE.USER:
                        return '[es] Member';
                    default:
                        return '[es] Member';
                }
            },
            frequency: {
                manual: '[es] Manually',
                instant: '[es] Instant',
                immediate: '[es] Daily',
                trip: '[es] By trip',
                weekly: '[es] Weekly',
                semimonthly: '[es] Twice a month',
                monthly: '[es] Monthly',
            },
            budgetFrequency: {
                monthly: '[es] monthly',
                yearly: '[es] yearly',
            },
            budgetFrequencyUnit: {
                monthly: '[es] month',
                yearly: '[es] year',
            },
            budgetTypeForNotificationMessage: {
                tag: '[es] tag',
                category: '[es] category',
            },
            planType: '[es] Plan type',
            youCantDowngradeInvoicing:
                "[es] You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: '[es] Default category',
            viewTransactions: '[es] View transactions',
            policyExpenseChatName: (displayName: string) => `[es] ${displayName}'s expenses`,
            deepDiveExpensifyCard: `[es] <muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
            travelInvoicing: '[es] Export travel invoicing expenses as',
            travelInvoicingVendor: '[es] Travel vendor',
            travelInvoicingPayableAccount: '[es] Travel payable account',
        },
        createdForClient: {
            title: "[es] You've created a workspace for your client!",
            description: '[es] Great news 🎉. Reach out to us if they need any help with the setup.',
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `[es] Connected to ${organizationName}` : '[es] Automate travel and meal delivery expenses across your organization.',
                sendInvites: '[es] Send invites',
                sendInvitesDescription: "[es] These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: '[es] Confirm invite',
                manageInvites: '[es] Manage invites',
                confirm: '[es] Confirm',
                allSet: '[es] All set',
                readyToRoll: "[es] You're ready to roll",
                takeBusinessRideMessage: '[es] Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: '[es] All',
                linked: '[es] Linked',
                outstanding: '[es] Outstanding',
                status: {
                    resend: '[es] Resend',
                    invite: '[es] Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '[es] Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '[es] Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '[es] Suspended',
                },
                centralBillingAccount: '[es] Central billing account',
                centralBillingDescription: '[es] Choose where to import all Uber receipts.',
                invitationFailure: '[es] Failed to invite member to Uber for Business',
                autoInvite: '[es] Invite new workspace members to Uber for Business',
                autoRemove: '[es] Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: '[es] No outstanding invites',
                    subtitle: '[es] Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `[es] <muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: '[es] Amount',
            deleteRates: () => ({
                one: '[es] Delete rate',
                other: '[es] Delete rates',
            }),
            deletePerDiemRate: '[es] Delete per diem rate',
            findPerDiemRate: '[es] Find per diem rate',
            areYouSureDelete: () => ({
                one: '[es] Are you sure you want to delete this rate?',
                other: '[es] Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: '[es] Per diem',
                subtitle: '[es] Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: '[es] Import per diem rates',
            editPerDiemRate: '[es] Edit per diem rate',
            editPerDiemRates: '[es] Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `[es] Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `[es] Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '[es] Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: '[es] Mark checks as “print later”',
            exportDescription: '[es] Configure how Expensify data exports to QuickBooks Desktop.',
            date: '[es] Export date',
            exportInvoices: '[es] Export invoices to',
            exportExpensifyCard: '[es] Export Expensify Card transactions as',
            account: '[es] Account',
            accountDescription: '[es] Choose where to post journal entries.',
            accountsPayable: '[es] Accounts payable',
            accountsPayableDescription: '[es] Choose where to create vendor bills.',
            bankAccount: '[es] Bank account',
            notConfigured: '[es] Not configured',
            bankAccountDescription: '[es] Choose where to send checks from.',
            creditCardAccount: '[es] Credit card account',
            exportDate: {
                label: '[es] Export date',
                description: '[es] Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[es] Date of last expense',
                        description: '[es] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[es] Export date',
                        description: '[es] Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[es] Submitted date',
                        description: '[es] Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "[es] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[es] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[es] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "[es] QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[es] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[es] Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[es] Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[es] Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[es] Check',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "[es] We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[es] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[es] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[es] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[es] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '[es] Choose where to send checks from.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[es] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[es] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[es] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: '[es] No accounts found',
            noAccountsFoundDescription: '[es] Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: '[es] QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "[es] Can't connect from this device",
                body1: "[es] You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "[es] Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: '[es] Open this link to connect',
                body: '[es] To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: '[es] Something went wrong',
                setupErrorBody: (conciergeLink: string) =>
                    `[es] <muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: '[es] Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: '[es] Classes',
            items: '[es] Items',
            customers: '[es] Customers/projects',
            exportCompanyCardsDescription: '[es] Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: '[es] Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: '[es] Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[es] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[es] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[es] Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: '[es] Line item level',
            reportFieldsDisplayedAsDescription: '[es] Report level',
            customersDescription: '[es] Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: '[es] Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: '[es] Auto-create entities',
                createEntitiesDescription: "[es] Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: '[es] Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: '[es] When to Export',
                description: '[es] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: '[es] Connected to',
            importDescription: '[es] Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: '[es] Classes',
            locations: '[es] Locations',
            customers: '[es] Customers/projects',
            accountsDescription: '[es] Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[es] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[es] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[es] Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: '[es] Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: '[es] Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: '[es] Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "[es] QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "[es] QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: '[es] Configure how Expensify data exports to QuickBooks Online.',
            date: '[es] Export date',
            exportInvoices: '[es] Export invoices to',
            exportExpensifyCard: '[es] Export Expensify Card transactions as',
            exportDate: {
                label: '[es] Export date',
                description: '[es] Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[es] Date of last expense',
                        description: '[es] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[es] Export date',
                        description: '[es] Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[es] Submitted date',
                        description: '[es] Date the report was submitted for approval.',
                    },
                },
            },
            receivable: '[es] Accounts receivable',
            archive: '[es] Accounts receivable archive',
            exportInvoicesDescription: '[es] Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: '[es] Set how company card purchases export to QuickBooks Online.',
            vendor: '[es] Vendor',
            defaultVendorDescription: '[es] Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: '[es] Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "[es] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[es] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[es] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: '[es] Account',
            accountDescription: '[es] Choose where to post journal entries.',
            accountsPayable: '[es] Accounts payable',
            accountsPayableDescription: '[es] Choose where to create vendor bills.',
            bankAccount: '[es] Bank account',
            notConfigured: '[es] Not configured',
            bankAccountDescription: '[es] Choose where to send checks from.',
            creditCardAccount: '[es] Credit card account',
            travelInvoicingDescription: '[es] Travel expenses will export as credit card charges to the QuickBooks Online account specified below.',
            companyCardsLocationEnabledDescription:
                "[es] QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "[es] QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[es] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: '[es] Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: '[es] Invite employees',
                inviteEmployeesDescription: '[es] Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: '[es] Auto-create entities',
                createEntitiesDescription:
                    "[es] Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription: '[es] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: '[es] QuickBooks bill payment account',
                qboInvoiceCollectionAccount: '[es] QuickBooks invoice collections account',
                accountSelectDescription: "[es] Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "[es] Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '[es] Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[es] Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[es] Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[es] Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[es] Check',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "[es] We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[es] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[es] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '[es] Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[es] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[es] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '[es] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[es] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '[es] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[es] Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[es] Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[es] Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[es] To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[es] To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[es] To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: '[es] No accounts found',
            noAccountsFoundDescription: '[es] Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: '[es] When to Export',
                description: '[es] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Out-of-pocket expenses will export when paid',
                },
            },
        },
        workspaceList: {
            joinNow: '[es] Join now',
            askToJoin: '[es] Ask to join',
        },
        xero: {
            organization: '[es] Xero organization',
            organizationDescription: "[es] Choose the Xero organization that you'd like to import data from.",
            importDescription: '[es] Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: '[es] Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[es] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[es] Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: '[es] Tracking categories',
            trackingCategoriesDescription: '[es] Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `[es] Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `[es] Choose where to map ${categoryName} when exporting to Xero.`,
            customers: '[es] Re-bill customers',
            customersDescription: '[es] Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: '[es] Choose how to handle Xero taxes in Expensify.',
            notImported: '[es] Not imported',
            notConfigured: '[es] Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: '[es] Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '[es] Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '[es] Report fields',
            },
            exportDescription: '[es] Configure how Expensify data exports to Xero.',
            purchaseBill: '[es] Purchase bill',
            exportDeepDiveCompanyCard:
                '[es] Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: '[es] Bank transactions',
            travelInvoicingDescription: '[es] Travel expenses will export as bank transactions to the Xero account specified below.',
            xeroBankAccount: '[es] Xero bank account',
            xeroBankAccountDescription: '[es] Choose where expenses will post as bank transactions.',
            exportExpensesDescription: '[es] Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: '[es] Purchase bill date',
            exportInvoices: '[es] Export invoices as',
            salesInvoice: '[es] Sales invoice',
            exportInvoicesDescription: '[es] Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: '[es] Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: '[es] Purchase bill status',
                reimbursedReportsDescription: '[es] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: '[es] Xero bill payment account',
                xeroInvoiceCollectionAccount: '[es] Xero invoice collections account',
                xeroBillPaymentAccountDescription: "[es] Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "[es] Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: '[es] Purchase bill date',
                description: '[es] Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[es] Date of last expense',
                        description: '[es] Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[es] Export date',
                        description: '[es] Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[es] Submitted date',
                        description: '[es] Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: '[es] Purchase bill status',
                description: '[es] Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '[es] Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '[es] Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '[es] Awaiting payment',
                },
            },
            noAccountsFound: '[es] No accounts found',
            noAccountsFoundDescription: '[es] Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: '[es] When to Export',
                description: '[es] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '[es] Preferred exporter',
            taxSolution: '[es] Tax solution',
            notConfigured: '[es] Not configured',
            exportDate: {
                label: '[es] Export date',
                description: '[es] Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[es] Date of last expense',
                        description: '[es] Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '[es] Export date',
                        description: '[es] Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '[es] Submitted date',
                        description: '[es] Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: '[es] Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '[es] Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[es] Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: '[es] Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '[es] Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[es] Vendor bills',
                },
            },
            travelInvoicingDescription: '[es] Travel expenses will export as credit card charges to the Sage Intacct account specified below.',
            creditCardAccount: '[es] Credit card account',
            defaultVendor: '[es] Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `[es] Set a default vendor that will apply to ${isReimbursable ? '' : '[es] non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: '[es] Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                '[es] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[es] Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: '[es] No accounts found',
            noAccountsFoundDescription: `[es] Please add the account in Sage Intacct and sync the connection again`,
            autoSync: '[es] Auto-sync',
            autoSyncDescription: '[es] Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: '[es] Invite employees',
            inviteEmployeesDescription:
                '[es] Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: '[es] Sync reimbursed reports',
            syncReimbursedReportsDescription: '[es] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: '[es] Sage Intacct payment account',
            accountingMethods: {
                label: '[es] When to Export',
                description: '[es] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Out-of-pocket expenses will export when paid',
                },
            },
        },
        certinia: {
            title: '[es] Certinia',
            prerequisites: {
                title: '[es] Before you connect',
                installBundle: '[es] For FFA Connections',
                installBundleDescription: ({href, version}: {href: string; version: string}) =>
                    `[es] Install the Expensify bundle in Salesforce by clicking this link: <a href="${href}">Install FFA Expensify Bundle (Version ${version})</a>`,
                installBundleConfirm: "[es] I've installed the bundle",
                setupContacts: '[es] Set up user and contacts',
                setupContactsBullet1:
                    "[es] Create both a User and a Contact for yourself if these don't already exist in Certinia making sure the email matches your primary email in Expensify.\n\n",
                setupContactsBullet2:
                    "[es] Create contacts for each employee who will be submitting expense reports and for each report approver. Make sure each contact's email address corresponds with the email address on the employee's Expensify account.\n\n",
                setupContactsBullet3: '[es] Set permission controls for your user for each contact/resource.\n\n',
                setupContactsConfirm: "[es] I've set up the user and contacts",
                oauth: '[es] Log in through Salesforce',
                oauthDescription: "[es] To finish setup, you'll have to sign in through Salesforce and Certinia.\n\nUse the button below to continue.",
                connectButton: '[es] Connect to Certinia',
            },
        },
        netsuite: {
            subsidiary: '[es] Subsidiary',
            subsidiarySelectDescription: "[es] Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: '[es] Configure how Expensify data exports to NetSuite.',
            exportInvoices: '[es] Export invoices to',
            journalEntriesTaxPostingAccount: '[es] Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: '[es] Journal entries provincial tax posting account',
            foreignCurrencyAmount: '[es] Export foreign currency amount',
            exportToNextOpenPeriod: '[es] Export to next open period',
            nonReimbursableJournalPostingAccount: '[es] Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: '[es] Reimbursable journal posting account',
            journalPostingPreference: {
                label: '[es] Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '[es] Single entry for each expense',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '[es] Single, itemized entry for each report',
                },
            },
            invoiceItem: {
                label: '[es] Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '[es] Create one for me',
                        description: '[es] We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '[es] Select existing',
                        description: "[es] We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: '[es] Export date',
                description: '[es] Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[es] Date of last expense',
                        description: '[es] Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '[es] Export date',
                        description: '[es] Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '[es] Submitted date',
                        description: '[es] Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '[es] Expense reports',
                        reimbursableDescription: '[es] Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: '[es] Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '[es] Vendor bills',
                        reimbursableDescription: dedent(`
                            [es] Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [es] Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '[es] Journal entries',
                        reimbursableDescription: dedent(`
                            [es] Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [es] Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        travelDescription: '[es] Travel expenses will export as journal entries to the NetSuite account specified below.',
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "[es] If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: '[es] Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: '[es] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: '[es] Reimbursements account',
                reimbursementsAccountDescription: "[es] Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: '[es] Collections account',
                collectionsAccountDescription: '[es] Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: '[es] A/P approval account',
                approvalAccountDescription:
                    '[es] Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: '[es] NetSuite default',
                inviteEmployees: '[es] Invite employees and set approvals',
                inviteEmployeesDescription:
                    '[es] Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: '[es] Auto-create employees/vendors',
                enableCategories: '[es] Enable newly imported categories',
                customFormID: '[es] Custom form ID',
                customFormIDDescription:
                    '[es] By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: '[es] Out-of-pocket expense',
                customFormIDNonReimbursable: '[es] Company card expense',
                exportReportsTo: {
                    label: '[es] Expense report approval level',
                    description: '[es] Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: '[es] NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '[es] Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '[es] Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '[es] Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: '[es] When to Export',
                    description: '[es] Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[es] Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[es] Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: '[es] Vendor bill approval level',
                    description: '[es] Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: '[es] NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '[es] Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '[es] Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: '[es] Journal entry approval level',
                    description: '[es] Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: '[es] NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '[es] Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '[es] Approved for posting',
                    },
                },
                error: {
                    customFormID: '[es] Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: '[es] No accounts found',
            noAccountsFoundDescription: '[es] Please add the account in NetSuite and sync the connection again',
            noVendorsFound: '[es] No vendors found',
            noVendorsFoundDescription: '[es] Please add vendors in NetSuite and sync the connection again',
            noItemsFound: '[es] No invoice items found',
            noItemsFoundDescription: '[es] Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: '[es] No subsidiaries found',
            noSubsidiariesFoundDescription: '[es] Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: '[es] NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: '[es] Install the Expensify bundle',
                        description: '[es] In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: '[es] Enable token-based authentication',
                        description: '[es] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: '[es] Enable SOAP web services',
                        description: '[es] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: '[es] Create an access token',
                        description:
                            '[es] In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: '[es] Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: '[es] NetSuite Account ID',
                            netSuiteTokenID: '[es] Token ID',
                            netSuiteTokenSecret: '[es] Token Secret',
                        },
                        netSuiteAccountIDDescription: '[es] In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: '[es] Expense categories',
                expenseCategoriesDescription: '[es] Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: '[es] Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: '[es] Departments',
                        subtitle: '[es] Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: '[es] Classes',
                        subtitle: '[es] Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: '[es] Locations',
                        subtitle: '[es] Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: '[es] Customers/projects',
                    subtitle: '[es] Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: '[es] Import customers',
                    importJobs: '[es] Import projects',
                    customers: '[es] customers',
                    jobs: '[es] projects',
                    label: (importFields: string[], importType: string) => `${importFields.join('[es]  and ')}, ${importType}`,
                },
                importTaxDescription: '[es] Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: '[es] Choose an option below:',
                    label: (importedTypes: string[]) => `[es] Imported as ${importedTypes.join('[es]  and ')}`,
                    requiredFieldError: (fieldName: string) => `[es] Please enter the ${fieldName}`,
                    customSegments: {
                        title: '[es] Custom segments/records',
                        addText: '[es] Add custom segment/record',
                        recordTitle: '[es] Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '[es] View detailed instructions',
                        helpText: '[es]  on configuring custom segments/records.',
                        emptyTitle: '[es] Add a custom segment or custom record',
                        fields: {
                            segmentName: '[es] Name',
                            internalID: '[es] Internal ID',
                            scriptID: '[es] Script ID',
                            customRecordScriptID: '[es] Transaction column ID',
                            mapping: '[es] Displayed as',
                        },
                        removeTitle: '[es] Remove custom segment/record',
                        removePrompt: '[es] Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: '[es] custom segment name',
                            customRecordName: '[es] custom record name',
                            segmentTitle: '[es] Custom segment',
                            customSegmentAddTitle: '[es] Add custom segment',
                            customRecordAddTitle: '[es] Add custom record',
                            recordTitle: '[es] Custom record',
                            segmentRecordType: '[es] Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "[es] What's the custom segment name?",
                            customRecordNameTitle: "[es] What's the custom record name?",
                            customSegmentNameFooter: `[es] You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `[es] You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "[es] What's the internal ID?",
                            customSegmentInternalIDFooter: `[es] First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*

You can find custom segment internal IDs in NetSuite under:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the hyperlink next to *Custom Record Type*.
4. Find the internal ID in the table at the bottom.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `[es] You can find custom record internal IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the internal ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "[es] What's the script ID?",
                            customSegmentScriptIDFooter: `[es] You can find custom segment script IDs in NetSuite under: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the *Application and Sourcing* tab near the bottom, then:
    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.
    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "[es] What's the transaction column ID?",
                            customRecordScriptIDFooter: `[es] You can find custom record script IDs in NetSuite under:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the script ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '[es] How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: '[es] How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `[es] A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: '[es] Custom lists',
                        addText: '[es] Add custom list',
                        recordTitle: '[es] Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '[es] View detailed instructions',
                        helpText: '[es]  on configuring custom lists.',
                        emptyTitle: '[es] Add a custom list',
                        fields: {
                            listName: '[es] Name',
                            internalID: '[es] Internal ID',
                            transactionFieldID: '[es] Transaction field ID',
                            mapping: '[es] Displayed as',
                        },
                        removeTitle: '[es] Remove custom list',
                        removePrompt: '[es] Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: '[es] Choose a custom list',
                            transactionFieldIDTitle: "[es] What's the transaction field ID?",
                            transactionFieldIDFooter: `[es] You can find transaction field IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom list.
3. Find the transaction field ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '[es] How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `[es] A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: '[es] NetSuite employee default',
                        description: '[es] Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `[es] If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '[es] Tags',
                        description: '[es] Line-item level',
                        footerContent: (importField: string) => `[es] ${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '[es] Report fields',
                        description: '[es] Report level',
                        footerContent: (importField: string) => `[es] ${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: '[es] Sage Intacct setup',
            prerequisitesTitle: '[es] Before you connect...',
            downloadExpensifyPackage: '[es] Download the Expensify package for Sage Intacct',
            followSteps: '[es] Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: '[es] Enter your Sage Intacct credentials',
            entity: '[es] Entity',
            employeeDefault: '[es] Sage Intacct employee default',
            employeeDefaultDescription: "[es] The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "[es] Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "[es] Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: (mappingTitle: string) => `[es] Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: '[es] Expense types',
            expenseTypesDescription: '[es] Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: '[es] Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: '[es] Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: '[es] User-defined dimensions',
            addUserDefinedDimension: '[es] Add user-defined dimension',
            integrationName: '[es] Integration name',
            dimensionExists: '[es] A dimension with this name already exists.',
            removeDimension: '[es] Remove user-defined dimension',
            removeDimensionPrompt: '[es] Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: '[es] User-defined dimension',
            addAUserDefinedDimension: '[es] Add a user-defined dimension',
            detailedInstructionsLink: '[es] View detailed instructions',
            detailedInstructionsRestOfSentence: '[es]  on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '[es] 1 UDD added',
                other: (count: number) => `[es] ${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '[es] departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '[es] classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '[es] locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '[es] customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '[es] projects (jobs)';
                    default:
                        return '[es] mappings';
                }
            },
        },
        type: {
            free: '[es] Free',
            control: '[es] Control',
            collect: '[es] Collect',
            submit: '[es] Submit',
        },
        companyCards: {
            addCards: '[es] Add cards',
            selectCards: '[es] Select cards',
            fromOtherWorkspaces: '[es] From other workspaces',
            addWorkEmail: '[es] Add your work email',
            addWorkEmailDescription: '[es] Please add your work email in order to use existing feeds from other workspaces.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: "[es] Couldn't load card feeds",
                workspaceFeedsCouldNotBeLoadedMessage: '[es] An error occurred while loading workspace card feeds. Please try again or contact your administrator.',
                feedCouldNotBeLoadedTitle: "[es] Couldn't load this feed",
                feedCouldNotBeLoadedMessage: '[es] An error occurred while loading this feed. Please try again or contact your administrator.',
                tryAgain: '[es] Try again',
            },
            addNewCard: {
                other: '[es] Other',
                fileImport: '[es] Import transactions from file',
                fileImportDescription: "[es] A manual option if your bank can't send a feed.",
                createFileFeedHelpText: `[es] <muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: '[es] Company card layout name',
                cardLayoutNameRequired: '[es] The Company card layout name is required',
                useAdvancedFields: '[es] Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: '[es] American Express Corporate Cards',
                    cdf: '[es] Mastercard Commercial Cards',
                    vcf: '[es] Visa Commercial Cards',
                    stripe: '[es] Stripe Cards',
                },
                yourCardProvider: `[es] Who's your card provider?`,
                whoIsYourBankAccount: '[es] Who’s your bank?',
                whereIsYourBankLocated: '[es] Where’s your bank located?',
                howDoYouWantToConnect: '[es] How do you want to connect to your bank?',
                learnMoreAboutOptions: `[es] <muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: '[es] Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `[es] Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: '[es] The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `[es] Enable your ${provider} feed`,
                    heading: '[es] We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: '[es] We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: '[es] We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `[es] 1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.

2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `[es] 1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.

2. Once the feed is enabled, Amex will send you a production letter.

3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `[es] 1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.

 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `[es] 1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Under Product Integrations, click Enable next to Expensify.

3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: '[es] What bank issues these cards?',
                enterNameOfBank: '[es] Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: '[es] What are the Visa feed details?',
                        processorLabel: '[es] Processor ID',
                        bankLabel: '[es] Financial institution (bank) ID',
                        companyLabel: '[es] Company ID',
                        helpLabel: '[es] Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `[es] What's the Amex delivery file name?`,
                        fileNameLabel: '[es] Delivery file name',
                        helpLabel: '[es] Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `[es] What's the Mastercard distribution ID?`,
                        distributionLabel: '[es] Distribution ID',
                        helpLabel: '[es] Where do I find the distribution ID?',
                    },
                },
                amexCorporate: '[es] Select this if the front of your cards say “Corporate”',
                amexBusiness: '[es] Select this if the front of your cards say “Business”',
                amexPersonal: '[es] Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: '[es] Please select a card provider before continuing',
                    pleaseSelectBankAccount: '[es] Please select a bank account before continuing',
                    pleaseSelectBank: '[es] Please select a bank before continuing',
                    pleaseSelectCountry: '[es] Please select a country before continuing',
                    pleaseSelectFeedType: '[es] Please select a feed type before continuing',
                },
                exitModal: {
                    title: '[es] Something not working?',
                    prompt: "[es] We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: '[es] Report issue',
                    cancelText: '[es] Skip',
                },
                duplicateFeedModal: {
                    title: '[es] Card feed already connected',
                    prompt: "[es] You can't add the same card feed to the same workspace twice.",
                },
                csvColumns: {
                    cardNumber: '[es] Card number',
                    postedDate: '[es] Date',
                    merchant: '[es] Merchant',
                    amount: '[es] Amount',
                    currency: '[es] Currency',
                    ignore: '[es] Ignore',
                    originalTransactionDate: '[es] Original transaction date',
                    originalAmount: '[es] Original amount',
                    originalCurrency: '[es] Original currency',
                    comment: '[es] Comment',
                    category: '[es] Category',
                    tag: '[es] Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `[es] Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `[es] Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '[es] Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '[es] Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '[es] Custom day of month',
            },
            assign: '[es] Assign',
            assignCard: '[es] Assign card',
            findCard: '[es] Find card',
            cardNumber: '[es] Card number',
            commercialFeed: '[es] Commercial feed',
            feedName: (feedName: string) => `[es] ${feedName} cards`,
            deletedFeed: '[es] Deleted feed',
            deletedCard: '[es] Deleted card',
            directFeed: '[es] Direct feed',
            whoNeedsCardAssigned: '[es] Who needs a card assigned?',
            chooseTheCardholder: '[es] Choose the cardholder',
            chooseCard: '[es] Choose a card',
            chooseCardFor: (assignee: string) => `[es] Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: '[es] No active cards on this feed',
            somethingMightBeBroken:
                '[es] <muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: '[es] Choose a transaction start date',
            startDateDescription: "[es] Choose your import start date. We'll sync all transactions from this date onwards.",
            editStartDateDescription: "[es] Choose a new transaction start date. We'll sync all transactions from that date onwards, excluding those we already imported.",
            fromTheBeginning: '[es] From the beginning',
            customStartDate: '[es] Custom start date',
            customCloseDate: '[es] Custom close date',
            letsDoubleCheck: "[es] Let's double check that everything looks right.",
            confirmationDescription: "[es] We'll begin importing transactions immediately.",
            card: '[es] Card',
            cardName: '[es] Card name',
            brokenConnectionError: '[es] <rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `[es] assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '[es] company card',
            chooseCardFeed: '[es] Choose card feed',
            ukRegulation:
                '[es] Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: '[es] Card assignment failed.',
            unassignCardFailedError: '[es] Card unassignment failed.',
            cardAlreadyAssignedError: '[es] This card is already assigned to a user in another workspace.',
            importTransactions: {
                title: '[es] Import transactions from file',
                description: '[es] Please adjust the settings for your file that will be applied on import.',
                cardDisplayName: '[es] Card display name',
                currency: '[es] Currency',
                transactionsAreReimbursable: '[es] Transactions are reimbursable',
                flipAmountSign: '[es] Flip amount sign',
                importButton: '[es] Import transactions',
            },
            assignNewCards: {
                title: '[es] Assign new cards',
                description: '[es] Get the latest cards to assign from your bank',
            },
        },
        expensifyCard: {
            issueAndManageCards: '[es] Issue and manage your Expensify Cards',
            getStartedIssuing: '[es] Get started by issuing your first virtual or physical card.',
            verificationInProgress: '[es] Verification in progress...',
            verifyingTheDetails: "[es] We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                '[es] The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                '[es] Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: '[es] Issue card',
            exportAsCSV: '[es] Export as CSV',
            csvColumnType: '[es] Type',
            csvColumnLimitType: '[es] Limit type',
            csvColumnLimit: '[es] Limit',
            findCard: '[es] Find card',
            newCard: '[es] New card',
            name: '[es] Name',
            lastFour: '[es] Last 4',
            limit: '[es] Limit',
            currentBalance: '[es] Current balance',
            currentBalanceDescription: '[es] Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: (settlementDate: string) => `[es] Balance will be settled on ${settlementDate}`,
            settleBalance: '[es] Settle balance',
            cardLimit: '[es] Card limit',
            remainingLimit: '[es] Remaining limit',
            requestLimitIncrease: '[es] Request limit increase',
            remainingLimitDescription:
                '[es] We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: '[es] Cash back',
            earnedCashbackDescription: '[es] Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: '[es] Issue new card',
            finishSetup: '[es] Finish setup',
            chooseBankAccount: '[es] Choose bank account',
            chooseExistingBank: '[es] Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: '[es] Account ending in',
            addNewBankAccount: '[es] Add a new bank account',
            settlementAccount: '[es] Settlement account',
            settlementAccountDescription: '[es] Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `[es] Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: '[es] Settlement frequency',
            settlementFrequencyDescription: '[es] Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo: '[es] If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            applyCashbackToBill: '[es] Apply cash back to my Expensify bill',
            applyCashbackToBillDescription: '[es] Cash back from the Expensify Card will be used towards payment for your Expensify bill.',
            frequency: {
                daily: '[es] Daily',
                monthly: '[es] Monthly',
            },
            cardDetails: '[es] Card details',
            virtual: '[es] Virtual',
            physical: '[es] Physical',
            deactivate: '[es] Deactivate card',
            changeCardLimit: '[es] Change card limit',
            changeLimit: '[es] Change limit',
            smartLimitWarning: (limit: number | string) => `[es] If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `[es] If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `[es] If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: '[es] Change card limit type',
            changeLimitType: '[es] Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `[es] If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `[es] If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: '[es] Add shipping details',
            issuedCard: (assignee: string) => `[es] issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `[es] issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: (assignee: string, link: string) => `[es] issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `[es] ${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `[es] ${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: (assignee: string, link: string) => `[es] ${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: '[es] card',
            replacementCard: '[es] replacement card',
            verifyingHeader: '[es] Verifying',
            bankAccountVerifiedHeader: '[es] Bank account verified',
            verifyingBankAccount: '[es] Verifying bank account...',
            verifyingBankAccountDescription: '[es] Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: '[es] Bank account verified!',
            bankAccountVerifiedDescription: '[es] You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: '[es] One more step...',
            oneMoreStepDescription: '[es] Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: '[es] Got it',
            goToConcierge: '[es] Go to Concierge',
        },
        categories: {
            deleteCategories: '[es] Delete categories',
            deleteCategoriesPrompt: '[es] Are you sure you want to delete these categories?',
            deleteCategory: '[es] Delete category',
            deleteCategoryPrompt: '[es] Are you sure you want to delete this category?',
            disableCategories: '[es] Disable categories',
            disableCategory: '[es] Disable category',
            enableCategories: '[es] Enable categories',
            enableCategory: '[es] Enable category',
            defaultSpendCategories: '[es] Default spend categories',
            spendCategoriesDescription: '[es] Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: '[es] An error occurred while deleting the category, please try again',
            categoryName: '[es] Category name',
            requiresCategory: '[es] Members must categorize all expenses',
            needCategoryForExportToIntegration: (connectionName: string) => `[es] All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: '[es] Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "[es] You haven't created any categories",
                subtitle: '[es] Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[es] <muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: '[es] An error occurred while updating the category, please try again',
            createFailureMessage: '[es] An error occurred while creating the category, please try again',
            addCategory: '[es] Add category',
            editCategory: '[es] Edit category',
            editCategories: '[es] Edit categories',
            findCategory: '[es] Find category',
            categoryRequiredError: '[es] Category name is required',
            existingCategoryError: '[es] A category with this name already exists',
            invalidCategoryName: '[es] Invalid category name',
            importedFromAccountingSoftware: '[es] The categories below are imported from your',
            payrollCode: '[es] Payroll code',
            updatePayrollCodeFailureMessage: '[es] An error occurred while updating the payroll code, please try again',
            glCode: '[es] GL code',
            updateGLCodeFailureMessage: '[es] An error occurred while updating the GL code, please try again',
            importCategories: '[es] Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: '[es] Cannot delete or disable all categories',
                description: `[es] At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: '[es] Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: '[es] Spend',
                subtitle: '[es] Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: '[es] Manage',
                subtitle: '[es] Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: '[es] Earn',
                subtitle: '[es] Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: '[es] Organize',
                subtitle: '[es] Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: '[es] Integrate',
                subtitle: '[es] Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: '[es] Distance rates',
                subtitle: '[es] Add, update, and enforce rates.',
            },
            perDiem: {
                title: '[es] Per diem',
                subtitle: '[es] Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: '[es] Travel',
                subtitle: '[es] Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: '[es] Get started with Expensify Travel',
                    subtitle: "[es] We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "[es] Let's go",
                },
                reviewingRequest: {
                    title: "[es] Pack your bags, we've got your request...",
                    subtitle: "[es] We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: '[es] Request sent',
                },
                bookOrManageYourTrip: {
                    title: '[es] Travel booking',
                    subtitle: "[es] Congrats! You're all set to book and manage travel on this workspace.",
                    ctaText: '[es] Manage travel',
                },
                settings: {
                    autoAddTripName: {
                        title: '[es] Add trip names to expenses',
                        subtitle: '[es] Automatically add trip names to expense descriptions for travel booked in Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '[es] Travel booking',
                        subtitle: "[es] Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: '[es] Manage travel',
                    },
                    travelInvoicingSection: {
                        title: '[es] Travel invoicing',
                        subtitle: '[es] Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: '[es] Learn how.',
                        subsections: {
                            currentTravelSpendLabel: '[es] Current travel spend',
                            currentTravelSpendPaymentQueued: (amount: string) => `[es] Payment of ${amount} is queued and will be processed soon.`,
                            currentTravelSpendCta: '[es] Pay balance',
                            currentTravelLimitLabel: '[es] Current travel limit',
                            settlementAccountLabel: '[es] Settlement account',
                            settlementFrequencyLabel: '[es] Settlement frequency',
                            settlementFrequencyDescription: '[es] How often Expensify will pull from your business bank account to settle recent Expensify Travel transactions.',
                            monthlySpendLimitLabel: '[es] Monthly spend limit per member',
                            monthlySpendLimitDescription: '[es] The maximum amount each member can spend on travel per month.',
                            reduceLimitTitle: '[es] Reduce travel spend limit?',
                            reduceLimitWarning:
                                '[es] If you reduce the limit, members who have already spent more than this amount will be unable to make new travel bookings until next month.',
                            provisioningError:
                                "[es] We weren't able to provision some of the members of your workspace for travel invoicing. Please try again later or reach out to Concierge for assistance.",
                        },
                    },
                    disableModal: {
                        title: '[es] Turn off Travel Invoicing?',
                        body: '[es] Upcoming hotel and car rental reservations may need to be re-booked with a different payment method to avoid cancellation.',
                        confirm: '[es] Turn off',
                    },
                    outstandingBalanceModal: {
                        title: "[es] Can't turn off Travel Invoicing",
                        body: '[es] You still have an outstanding travel balance. Please pay your balance first.',
                        confirm: '[es] Got it',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `[es] Pay balance of ${amount}?`,
                        body: '[es] The payment will be queued and processed shortly after. This action cannot be undone once started.',
                    },
                    exportToPDF: '[es] Export to PDF',
                    exportToCSV: '[es] Export to CSV',
                    selectDateRangeError: '[es] Please select a date range to export',
                    invalidDateRangeError: '[es] The start date must be before the end date',
                    enabled: '[es] Travel Invoicing enabled!',
                    enabledDescription: '[es] All travel spend on this workspace will now be centralized in a monthly invoice.',
                },
                personalDetailsDescription: '[es] In order to book travel, please enter your legal name as it appears on your government-issued ID.',
            },
            expensifyCard: {
                title: '[es] Expensify Card',
                subtitle: '[es] Gain insights and control over spend.',
                disableCardTitle: '[es] Disable Expensify Card',
                disableCardPrompt: '[es] You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: '[es] Chat with Concierge',
                feed: {
                    title: '[es] Get the Expensify Card',
                    subTitle: '[es] Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: '[es] Cash back on every US purchase',
                        unlimited: '[es] Unlimited virtual cards',
                        spend: '[es] Spend controls and custom limits',
                    },
                    ctaTitle: '[es] Issue new card',
                },
            },
            companyCards: {
                title: '[es] Company cards',
                subtitle: '[es] Connect the cards you already have.',
                feed: {
                    title: '[es] Bring your own cards (BYOC)',
                    subtitle: '[es] Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: '[es] Connect cards from 10,000+ banks',
                        assignCards: '[es] Link your team’s existing cards',
                        automaticImport: '[es] We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: '[es] Bank connection issue',
                connectWithPlaid: '[es] connect via Plaid',
                connectWithExpensifyCard: '[es] try the Expensify Card.',
                bankConnectionDescription: `[es] Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: '[es] Disable company cards',
                disableCardPrompt: '[es] You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: '[es] Chat with Concierge',
                cardDetails: '[es] Card details',
                cardNumber: '[es] Card number',
                cardholder: '[es] Cardholder',
                cardName: '[es] Card name',
                allCards: '[es] All cards',
                assignedCards: '[es] Assigned',
                unassignedCards: '[es] Unassigned',
                integrationExport: (integration: string, type?: string) => (integration && type ? `[es] ${integration} ${type.toLowerCase()} export` : `[es] ${integration} export`),
                integrationExportTitleXero: (integration: string) => `[es] Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `[es] Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: '[es] Last updated',
                transactionStartDate: '[es] Transaction start date',
                updateCard: '[es] Update card',
                unassignCard: '[es] Unassign card',
                unassign: '[es] Unassign',
                unassignCardDescription: '[es] Unassigning this card will delete all unsubmitted transactions.',
                assignCard: '[es] Assign card',
                removeCard: '[es] Remove card',
                remove: '[es] Remove',
                removeCardDescription: '[es] Removing this card will delete all unsubmitted transactions.',
                cardFeedName: '[es] Card feed name',
                cardFeedNameDescription: '[es] Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: '[es] Delete transactions',
                cardFeedTransactionDescription: '[es] Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: '[es] Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: '[es] Allow deleting transactions',
                removeCardFeed: '[es] Remove card feed',
                removeCardFeedTitle: (feedName: string) => `[es] Remove ${feedName} feed`,
                removeCardFeedDescription: '[es] Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: '[es] Card feed name is required',
                    statementCloseDateRequired: '[es] Please select a statement close date.',
                },
                corporate: '[es] Restrict deleting transactions',
                personal: '[es] Allow deleting transactions',
                setFeedNameDescription: '[es] Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: '[es] When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: '[es] No cards in this feed',
                emptyAddedFeedDescription: "[es] Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `[es] We're reviewing your request...`,
                pendingFeedDescription: `[es] We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '[es] Check your browser window',
                pendingBankDescription: (bankName: string) => `[es] Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: '[es] please click here',
                giveItNameInstruction: '[es] Give the card a name that sets it apart from others.',
                updating: '[es] Updating...',
                neverUpdated: '[es] Never',
                noAccountsFound: '[es] No accounts found',
                defaultCard: '[es] Default card',
                downgradeTitle: `[es] Can't downgrade workspace`,
                downgradeSubTitle: `[es] This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `[es] Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: '[es] Get the Expensify Card',
                expensifyCardBannerSubtitle: '[es] Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: '[es] Learn more',
                statementCloseDateTitle: '[es] Statement close date',
                statementCloseDateDescription: '[es] Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: '[es] Workflows',
                subtitle: '[es] Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    '[es] Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: '[es] Invoices',
                subtitle: '[es] Send and receive invoices.',
            },
            categories: {
                title: '[es] Categories',
                subtitle: '[es] Track and organize spend.',
            },
            tags: {
                title: '[es] Tags',
                subtitle: '[es] Classify costs and track billable expenses.',
            },
            taxes: {
                title: '[es] Taxes',
                subtitle: '[es] Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: '[es] Report fields',
                subtitle: '[es] Set up custom fields for spend.',
            },
            connections: {
                title: '[es] Accounting',
                subtitle: '[es] Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: '[es] Receipt partners',
                subtitle: '[es] Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '[es] Not so fast...',
                featureEnabledText: "[es] To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "[es] To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: '[es] Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '[es] Disconnect Uber',
                disconnectText: '[es] To disable this feature, please disconnect the Uber for Business integration first.',
                description: '[es] Are you sure you want to disconnect this integration?',
                confirmText: '[es] Got it',
            },
            hrWarningModal: {
                disconnectText: ({integration}: {integration: string}) => `[es] To disable HR, please disconnect ${integration} from this workspace first.`,
            },
            workflowWarningModal: {
                featureEnabledTitle: '[es] Not so fast...',
                featureEnabledText:
                    '[es] Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: '[es] Go to Expensify Cards',
            },
            rules: {
                title: '[es] Rules',
                subtitle: '[es] Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: '[es] Time',
                subtitle: '[es] Set a billable hourly rate for time tracking.',
                defaultHourlyRate: '[es] Default hourly rate',
            },
        },
        reports: {
            reportsCustomTitleExamples: '[es] Examples:',
            customReportNamesSubtitle: `[es] <muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: '[es] Default report title',
            customNameDescription: `[es] Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: '[es] Name',
            customNameEmailPhoneExample: '[es] Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: '[es] Report start date: {report:startdate}',
            customNameWorkspaceNameExample: '[es] Workspace name: {report:workspacename}',
            customNameReportIDExample: '[es] Report ID: {report:id}',
            customNameTotalExample: '[es] Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: '[es] Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: '[es] Add field',
            delete: '[es] Delete field',
            deleteFields: '[es] Delete fields',
            findReportField: '[es] Find report field',
            deleteConfirmation: '[es] Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: '[es] Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "[es] You haven't created any report fields",
                subtitle: '[es] Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "[es] Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: '[es] Disable report fields',
            disableReportFieldsConfirmation: '[es] Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: '[es] The report fields below are imported from your',
            textType: '[es] Text',
            dateType: '[es] Date',
            dropdownType: '[es] List',
            formulaType: '[es] Formula',
            textAlternateText: '[es] Add a field for free text input.',
            dateAlternateText: '[es] Add a calendar for date selection.',
            dropdownAlternateText: '[es] Add a list of options to choose from.',
            formulaAlternateText: '[es] Add a formula field.',
            nameInputSubtitle: '[es] Choose a name for the report field.',
            typeInputSubtitle: '[es] Choose what type of report field to use.',
            initialValueInputSubtitle: '[es] Enter a starting value to show in the report field.',
            listValuesInputSubtitle: '[es] These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: '[es] These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: '[es] Delete value',
            deleteValues: '[es] Delete values',
            disableValue: '[es] Disable value',
            disableValues: '[es] Disable values',
            enableValue: '[es] Enable value',
            enableValues: '[es] Enable values',
            emptyReportFieldsValues: {
                title: "[es] You haven't created any list values",
                subtitle: '[es] Add custom values to appear on reports.',
            },
            deleteValuePrompt: '[es] Are you sure you want to delete this list value?',
            deleteValuesPrompt: '[es] Are you sure you want to delete these list values?',
            listValueRequiredError: '[es] Please enter a list value name',
            existingListValueError: '[es] A list value with this name already exists',
            editValue: '[es] Edit value',
            listValues: '[es] List values',
            addValue: '[es] Add value',
            existingReportFieldNameError: '[es] A report field with this name already exists',
            reportFieldNameRequiredError: '[es] Please enter a report field name',
            reportFieldTypeRequiredError: '[es] Please choose a report field type',
            circularReferenceError: "[es] This field can't refer to itself. Please update.",
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `[es] Formula field ${value} not recognized`,
            reportFieldInitialValueRequiredError: '[es] Please choose a report field initial value',
            genericFailureMessage: '[es] An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: '[es] Tag name',
            requiresTag: '[es] Members must tag all expenses',
            trackBillable: '[es] Track billable expenses',
            customTagName: '[es] Custom tag name',
            enableTag: '[es] Enable tag',
            enableTags: '[es] Enable tags',
            requireTag: '[es] Require tag',
            requireTags: '[es] Require tags',
            notRequireTags: '[es] Don’t require',
            disableTag: '[es] Disable tag',
            disableTags: '[es] Disable tags',
            addTag: '[es] Add tag',
            editTag: '[es] Edit tag',
            editTags: '[es] Edit tags',
            findTag: '[es] Find tag',
            subtitle: '[es] Tags add more detailed ways to classify costs.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `[es] <muted-text>Tags add more detailed ways to classify costs. You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "[es] You haven't created any tags",
                subtitle: '[es] Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `[es] <muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[es] <muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: '[es] Delete tag',
            deleteTags: '[es] Delete tags',
            deleteTagConfirmation: '[es] Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: '[es] Are you sure that you want to delete these tags?',
            deleteFailureMessage: '[es] An error occurred while deleting the tag, please try again',
            tagRequiredError: '[es] Tag name is required',
            existingTagError: '[es] A tag with this name already exists',
            invalidTagNameError: '[es] Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: '[es] An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: '[es] Tags are managed in your',
            employeesSeeTagsAs: '[es] Employees see tags as',
            glCode: '[es] GL code',
            updateGLCodeFailureMessage: '[es] An error occurred while updating the GL code, please try again',
            tagRules: '[es] Tag rules',
            approverDescription: '[es] Approver',
            importTags: '[es] Import tags',
            importTagsSupportingText: '[es] Code your expenses with one type of tag or many.',
            configureMultiLevelTags: '[es] Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `[es] Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: '[es] The first row is the title for each tag list',
                independentTags: '[es] These are independent tags',
                glAdjacentColumn: '[es] There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: '[es] Single level of tags',
                multiLevel: '[es] Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '[es] Switch Tag Levels',
                prompt1: '[es] Switching tag levels will erase all current tags.',
                prompt2: '[es]  We suggest you first',
                prompt3: '[es]  download a backup',
                prompt4: '[es]  by exporting your tags.',
                prompt5: '[es]  Learn more',
                prompt6: '[es]  about tag levels.',
            },
            overrideMultiTagWarning: {
                title: '[es] Import tags',
                prompt1: '[es] Are you sure?',
                prompt2: '[es]  The existing tags will be overridden, but you can',
                prompt3: '[es]  download a backup',
                prompt4: '[es]  first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `[es] We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: '[es] Cannot delete or disable all tags',
                description: `[es] At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: '[es] Cannot make all tags optional',
                description: `[es] At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: '[es] Cannot make tag list required',
                description: '[es] You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '[es] 1 Tag',
                other: (count: number) => `[es] ${count} Tags`,
            }),
        },
        taxes: {
            subtitle: '[es] Add tax names, rates, and set defaults.',
            addRate: '[es] Add rate',
            workspaceDefault: '[es] Workspace currency default',
            foreignDefault: '[es] Foreign currency default',
            customTaxName: '[es] Custom tax name',
            value: '[es] Value',
            taxReclaimableOn: '[es] Tax reclaimable on',
            taxRate: '[es] Tax rate',
            findTaxRate: '[es] Find tax rate',
            error: {
                taxRateAlreadyExists: '[es] This tax name is already in use',
                taxCodeAlreadyExists: '[es] This tax code is already in use',
                valuePercentageRange: '[es] Please enter a valid percentage between 0 and 100',
                customNameRequired: '[es] Custom tax name is required',
                deleteFailureMessage: '[es] An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: '[es] An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: '[es] An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: '[es] The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: '[es] Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `[es] Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '[es] Delete rate',
                deleteMultiple: '[es] Delete rates',
                enable: '[es] Enable rate',
                disable: '[es] Disable rate',
                enableTaxRates: () => ({
                    one: '[es] Enable rate',
                    other: '[es] Enable rates',
                }),
                disableTaxRates: () => ({
                    one: '[es] Disable rate',
                    other: '[es] Disable rates',
                }),
            },
            importedFromAccountingSoftware: '[es] The taxes below are imported from your',
            taxCode: '[es] Tax code',
            updateTaxCodeFailureMessage: '[es] An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: '[es] Name your new workspace',
            selectFeatures: '[es] Select features to copy',
            whichFeatures: '[es] Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '[es] \n\nDo you want to continue?',
            categories: '[es] categories and your auto-categorization rules',
            reimbursementAccount: '[es] reimbursement account',
            welcomeNote: '[es] Please start using my new workspace',
            delayedSubmission: '[es] delayed submission',
            merchantRules: '[es] Merchant rules',
            merchantRulesCount: () => ({
                one: '[es] 1 merchant rule',
                other: (count: number) => `[es] ${count} merchant rules`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `[es] You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: '[es] An error occurred while duplicating your new workspace. Please try again.',
        },
        copyPolicySettings: {
            error: '[es] An error occurred while copying workspace settings. Please try again.',
            title: '[es] Copy settings',
            selectWorkspaces: '[es] Select workspaces',
            description: '[es] Choose the workspaces you want to copy settings to, then select the settings you’d like to copy.',
            searchPlaceholder: '[es] Search workspaces',
        },
        emptyWorkspace: {
            title: '[es] No workspaces yet',
            subtitle: '[es] Create a workspace to manage your expenses, reimbursements, and company cards.',
            createAWorkspaceCTA: '[es] Get Started',
            features: {
                trackAndCollect: '[es] Track and collect receipts',
                reimbursements: '[es] Reimburse employees',
                companyCards: '[es] Manage company cards',
            },
            notFound: '[es] No workspace found',
            description: '[es] Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: '[es] New workspace',
            getTheExpensifyCardAndMore: '[es] Get the Expensify Card and more',
            confirmWorkspace: '[es] Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `[es] My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `[es] ${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '[es] An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `[es] Are you sure you want to remove ${memberName}?`,
                other: '[es] Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `[es] ${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '[es] Remove member',
                other: '[es] Remove members',
            }),
            findMember: '[es] Find member',
            removeWorkspaceMemberButtonTitle: '[es] Remove from workspace',
            removeGroupMemberButtonTitle: '[es] Remove from group',
            removeRoomMemberButtonTitle: '[es] Remove from chat',
            removeMemberPrompt: (memberName: string) => `[es] Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '[es] Remove member',
            transferOwner: '[es] Transfer owner',
            makeMember: () => ({
                one: '[es] Make member',
                other: '[es] Make members',
            }),
            makeAdmin: () => ({
                one: '[es] Make admin',
                other: '[es] Make admins',
            }),
            makeAuditor: () => ({
                one: '[es] Make auditor',
                other: '[es] Make auditors',
            }),
            selectAll: '[es] Select all',
            error: {
                genericAdd: '[es] There was a problem adding this workspace member',
                cannotRemove: "[es] You can't remove yourself or the workspace owner",
                genericRemove: '[es] There was a problem removing that workspace member',
            },
            addedWithPrimary: '[es] Some members were added with their primary logins.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `[es] Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `[es] Total workspace members: ${count}`,
            configureHRSync: (providerName: string) => `[es] Configure ${providerName} sync.`,
            syncWithHR: (providerName: string) => `[es] Sync with ${providerName}`,
            allMembers: '[es] All members',
            admins: '[es] Admins',
            approvers: '[es] Approvers',
            auditors: '[es] Auditors',
            emptyRoleFilter: {
                title: '[es] No members match this filter',
                subtitle: '[es] Invite a member or change the filter above.',
            },
            importMembers: '[es] Import members',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `[es] If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `[es] ${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `[es] You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[es] If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[es] If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `[es] ${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: '[es] Get started by issuing your first virtual or physical card.',
            issueCard: '[es] Issue card',
            issueNewCard: {
                whoNeedsCard: '[es] Who needs a card?',
                inviteNewMember: '[es] Invite new member',
                findMember: '[es] Find member',
                chooseCardType: '[es] Choose a card type',
                physicalCard: '[es] Physical card',
                physicalCardDescription: '[es] Great for the frequent spender',
                virtualCard: '[es] Virtual card',
                virtualCardDescription: '[es] Instant and flexible',
                chooseLimitType: '[es] Choose a limit type',
                smartLimit: '[es] Smart Limit',
                smartLimitDescription: '[es] Spend up to a certain amount before requiring approval',
                monthly: '[es] Monthly',
                monthlyDescription: '[es] Limit renews monthly',
                fixedAmount: '[es] Fixed amount',
                fixedAmountDescription: '[es] Spend until the limit is reached',
                setLimit: '[es] Set a limit',
                cardLimitError: '[es] Please enter an amount less than $21,474,836',
                giveItName: '[es] Give it a name',
                giveItNameInstruction: '[es] Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: '[es] Card name',
                letsDoubleCheck: '[es] Let’s double check that everything looks right.',
                willBeReadyToUse: '[es] This card will be ready to use immediately.',
                willBeReadyToShip: '[es] This card will be ready to ship immediately.',
                cardholder: '[es] Cardholder',
                cardType: '[es] Card type',
                limit: '[es] Limit',
                limitType: '[es] Limit type',
                disabledApprovalForSmartLimitError: '[es] Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
                singleUse: '[es] Single-use',
                singleUseDescription: '[es] Expires after one transaction',
                validFrom: '[es] Valid from',
                startDate: '[es] Start date',
                endDate: '[es] End date',
                noExpirationHint: "[es] A card without an expiration date won't expire",
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `[es] Valid from ${startDate} to ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `[es] ${startDate} to ${endDate}`,
                combineWithExpiration: '[es] Combine with expiration options for additional spend control',
                enterValidDate: '[es] Enter a valid date',
                expirationDate: '[es] Expiration date',
                limitAmount: '[es] Limit amount',
                setExpiryOptions: '[es] Set expiry options',
                setExpiryDate: '[es] Set expiry date',
                setExpiryDateDescription: '[es] Card will expire as listed on the card',
                amount: '[es] Amount',
            },
            deactivateCardModal: {
                deactivate: '[es] Deactivate',
                deactivateCard: '[es] Deactivate card',
                deactivateConfirmation: '[es] Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: '[es] settings',
            title: '[es] Connections',
            subtitle: '[es] Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: '[es] QuickBooks Online',
            qbd: '[es] QuickBooks Desktop',
            xero: '[es] Xero',
            netsuite: '[es] NetSuite',
            intacct: '[es] Sage Intacct',
            sap: '[es] SAP',
            oracle: '[es] Oracle',
            microsoftDynamics: '[es] Microsoft Dynamics',
            talkYourOnboardingSpecialist: '[es] Chat with your setup specialist.',
            talkYourAccountManager: '[es] Chat with your account manager.',
            talkToConcierge: '[es] Chat with Concierge.',
            needAnotherAccounting: '[es] Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '[es] QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '[es] Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '[es] NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '[es] Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `[es] There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '[es] Go to Expensify Classic to manage your settings.',
            setup: '[es] Connect',
            lastSync: (relativeDate: string) => `[es] Last synced ${relativeDate}`,
            notSync: '[es] Not synced',
            import: '[es] Import',
            export: '[es] Export',
            advanced: '[es] Advanced',
            other: '[es] Other',
            syncNow: '[es] Sync now',
            disconnect: '[es] Disconnect',
            reinstall: '[es] Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[es] integration';
                return `[es] Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `[es] Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[es] accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "[es] Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "[es] Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "[es] Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "[es] Can't connect to QuickBooks Desktop";
                    default: {
                        return "[es] Can't connect to integration";
                    }
                }
            },
            accounts: '[es] Chart of accounts',
            taxes: '[es] Taxes',
            imported: '[es] Imported',
            notImported: '[es] Not imported',
            importAsCategory: '[es] Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '[es] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '[es] Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '[es] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '[es] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '[es] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '[es] Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: '[es] NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[es] this integration';
                return `[es] Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `[es] Are you sure you want to connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[es] this accounting integration'}? This will remove any existing accounting connections.`,
            enterCredentials: '[es] Enter your credentials',
            updateCredentials: '[es] Update credentials',
            claimOffer: {
                badgeText: '[es] Offer available!',
                xero: {
                    headline: '[es] Get Xero free for 6 months!',
                    description: '[es] <muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: '[es] Connect to Xero',
                },
                uber: {
                    headerTitle: '[es] Uber for Business',
                    headline: '[es] Get 5% off Uber rides',
                    description: `[es] <muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: '[es] Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '[es] Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '[es] Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '[es] Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '[es] Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return '[es] Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return '[es] Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '[es] Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '[es] Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return '[es] Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return '[es] Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return '[es] Importing Xero data';
                        case 'startingImportQBO':
                            return '[es] Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '[es] Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return '[es] Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '[es] Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return '[es] Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '[es] Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '[es] Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return '[es] Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '[es] Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '[es] Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '[es] Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '[es] Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '[es] Updating report fields';
                        case 'jobDone':
                            return '[es] Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return '[es] Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return '[es] Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return '[es] Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return '[es] Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '[es] Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return '[es] Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return '[es] Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return '[es] Syncing tax rates';
                        case 'xeroCheckConnection':
                            return '[es] Checking Xero connection';
                        case 'xeroSyncTitle':
                            return '[es] Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return '[es] Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '[es] Importing customers';
                        case 'netSuiteSyncInitData':
                            return '[es] Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return '[es] Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return '[es] Importing items';
                        case 'netSuiteSyncData':
                            return '[es] Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return '[es] Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return '[es] Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return '[es] Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return '[es] Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return '[es] Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '[es] Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '[es] Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '[es] Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return '[es] Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return '[es] Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return '[es] Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '[es] Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '[es] Importing vendors';
                        case 'intacctCheckConnection':
                            return '[es] Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return '[es] Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return '[es] Importing Sage Intacct data';
                        default: {
                            return `[es] Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '[es] Preferred exporter',
            exportPreferredExporterNote:
                '[es] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[es] Once set, the preferred exporter will see reports for export in their account.',
            exportAs: '[es] Export as',
            exportOutOfPocket: '[es] Export out-of-pocket expenses as',
            exportCompanyCard: '[es] Export company card expenses as',
            exportDate: '[es] Export date',
            defaultVendor: '[es] Default vendor',
            autoSync: '[es] Auto-sync',
            autoSyncDescription: '[es] Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: '[es] Sync reimbursed reports',
            cardReconciliation: '[es] Card reconciliation',
            reconciliationAccount: '[es] Reconciliation account',
            continuousReconciliation: '[es] Continuous Reconciliation',
            syncTravelInvoicingSettlements: '[es] Sync travel invoicing settlements',
            saveHoursOnReconciliation:
                '[es] Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `[es] <muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '[es] Choose the bank account that your Expensify Card payments will be reconciled against.',
                chooseTravelInvoicingBankAccount: '[es] Choose the bank account that your travel invoicing payments will be reconciled against.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `[es] Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
                travelInvoicingSettlementAccountReconciliation: (lastFourPAN: string) =>
                    `[es] Make sure this account matches your travel invoicing settlement account (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        hr: {
            title: '[es] HR',
            connections: '[es] Connections',
            subtitle: '[es] Connect HR tools and keep employee approvals in sync.',
            connect: '[es] Connect',
            syncNow: '[es] Sync now',
            disconnect: '[es] Disconnect',
            disconnectTitle: (providerName: string) => `[es] Disconnect ${providerName}`,
            disconnectPrompt: (providerName: string) => `[es] Are you sure you want to disconnect ${providerName}?`,
            alreadyConnectedTitle: '[es] Cannot connect to multiple HR platforms',
            alreadyConnectedPrompt: '[es] You must disconnect your current HR platform before connecting another.',
            lastSync: (relativeDate: string) => `[es] Last synced ${relativeDate}`,
            syncError: (providerName: string) => `[es] Can't connect to ${providerName}`,
            connectionDescription: (providerName: string) => `[es] Connect ${providerName} to keep employee approvals in sync with your workspace.`,
            approvalMode: '[es] Approval mode',
            providerApprovalMode: (providerName: string) => `[es] ${providerName} approval mode`,
            finalApprover: '[es] Final approver',
            providerFinalApprover: (providerName: string) => `[es] ${providerName} final approver`,
            notSet: '[es] Not set',
            syncing: '[es] Syncing employees',
            syncingModalTitle: '[es] Your connection is syncing',
            syncingModalDescription: "[es] The first connection can take some time. You'll be notified of any errors.",
            approvalModeDescription: (providerName: string) => `[es] Members and managers are set up to sync with ${providerName}.`,
            approvalModeWarningTitle: '[es] Change approval mode?',
            approvalModeWarningPrompt: (providerName: string, helpSiteURL: string) =>
                `[es] Are you sure you would like to change the approval mode for this workspace? Learn more about the different ${providerName}-enabled workflow modes in our <a href="${helpSiteURL}">help site</a>.`,
            approvalModeWarningConfirm: '[es] Change approval mode',
            approvalModes: {
                basic: {label: '[es] Basic approval', description: '[es] All users submit to a single person for processing and approval.'},
                manager: {
                    label: '[es] Manager approval',
                    description: (providerName: string) => `[es] Employees submit reports to their direct manager configured in ${providerName}.`,
                },
                custom: {label: '[es] Custom approval', description: "[es] I'll manually setup approval workflows in Expensify."},
            },
            syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                switch (stage) {
                    case 'gustoSyncTitle':
                        return '[es] Synchronizing Gusto Employees';
                    case 'gustoSyncLoadData':
                        return '[es] Loading data from Gusto';
                    case 'gustoSyncProvisioning':
                        return '[es] Provisioning employees in policy';
                    case 'zenefitsSyncTitle':
                        return '[es] Synchronizing TriNet Employees';
                    case 'zenefitsSyncLoadData':
                        return '[es] Loading data from TriNet';
                    case 'zenefitsSyncProvisioning':
                        return '[es] Provisioning employees in policy';
                    case 'jobDone':
                        return '[es] Waiting for imported data to load';
                    default: {
                        return `[es] Translation missing for stage: ${stage}`;
                    }
                }
            },
            syncResults: {
                title: (provider: string) => `[es] ${provider} sync complete`,
                successTitle: (provider: string) => `[es] Successfully synced your ${provider} connection!`,
                added: '[es] Added',
                removed: '[es] Removed',
                skipped: '[es] Skipped',
                employeeCount: () => ({
                    one: '[es] 1 employee',
                    other: (count: number) => `[es] ${count} employees`,
                }),
            },
            gusto: {
                title: '[es] Gusto',
            },
            zenefits: {
                title: '[es] TriNet',
            },
        },
        export: {
            notReadyHeading: '[es] Not ready to export',
            notReadyDescription: '[es] Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: '[es] Send invoice',
            sendFrom: '[es] Send from',
            invoicingDetails: '[es] Invoicing details',
            invoicingDetailsDescription: '[es] This info will appear on your invoices.',
            companyName: '[es] Company name',
            companyWebsite: '[es] Company website',
            paymentMethods: {
                personal: '[es] Personal',
                business: '[es] Business',
                chooseInvoiceMethod: '[es] Choose a payment method below:',
                payingAsIndividual: '[es] Paying as an individual',
                payingAsBusiness: '[es] Paying as a business',
            },
            invoiceBalance: '[es] Invoice balance',
            invoiceBalanceSubtitle: "[es] This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: '[es] Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: '[es] Invite member',
            members: '[es] Invite members',
            invitePeople: '[es] Invite new members',
            genericFailureMessage: '[es] An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `[es] Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '[es] user',
            users: '[es] users',
            invited: '[es] invited',
            removed: '[es] removed',
            to: '[es] to',
            from: '[es] from',
        },
        inviteMessage: {
            confirmDetails: '[es] Confirm details',
            inviteMessagePrompt: '[es] Make your invitation extra special by adding a message below!',
            personalMessagePrompt: '[es] Message',
            genericFailureMessage: '[es] An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: '[es] Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `[es] ${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '[es] Oops! Not so fast...',
            workspaceNeeds: '[es] A workspace needs at least one enabled distance rate.',
            distance: '[es] Distance',
            centrallyManage: '[es] Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: '[es] Rate',
            addRate: '[es] Add rate',
            findRate: '[es] Find rate',
            trackTax: '[es] Track tax',
            deleteRates: () => ({
                one: '[es] Delete rate',
                other: '[es] Delete rates',
            }),
            enableRates: () => ({
                one: '[es] Enable rate',
                other: '[es] Enable rates',
            }),
            disableRates: () => ({
                one: '[es] Disable rate',
                other: '[es] Disable rates',
            }),
            enableRate: '[es] Enable rate',
            status: '[es] Status',
            unit: '[es] Unit',
            taxFeatureNotEnabledMessage:
                '[es] <muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: '[es] Delete distance rate',
            areYouSureDelete: () => ({
                one: '[es] Are you sure you want to delete this rate?',
                other: '[es] Are you sure you want to delete these rates?',
            }),
            amountPerUnit: (unit: string) => `[es] Amount per ${unit}`,
            startDate: '[es] Start date',
            endDate: '[es] End date',
            errors: {
                rateNameRequired: '[es] Rate name is required',
                existingRateName: '[es] A distance rate with this name already exists',
                nameRequired: '[es] Name is required',
                amountRequired: '[es] Amount is required',
                startDateMustBeBeforeEndDate: '[es] Start date must be before end date',
            },
        },
        editor: {
            descriptionInputLabel: '[es] Description',
            nameInputLabel: '[es] Name',
            typeInputLabel: '[es] Type',
            initialValueInputLabel: '[es] Initial value',
            nameInputHelpText: "[es] This is the name you'll see on your workspace.",
            nameIsRequiredError: "[es] You'll need to give your workspace a name",
            currencyInputLabel: '[es] Default currency',
            currencyInputHelpText: '[es] All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `[es] The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: '[es] Save',
            genericFailureMessage: '[es] An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: '[es] An error occurred uploading the avatar. Please try again.',
            addressContext: '[es] A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: '[es] Expense policy',
        },
        bankAccount: {
            continueWithSetup: '[es] Continue setup',
            youAreAlmostDone: "[es] You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: '[es] Streamline payments',
            connectBankAccountNote: "[es] Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: '[es] One more thing!',
            allSet: "[es] You're all set!",
            accountDescriptionWithCards: '[es] This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "[es] Let's finish in chat!",
            finishInChat: '[es] Finish in chat',
            almostDone: '[es] Almost done!',
            disconnectBankAccount: '[es] Disconnect bank account',
            startOver: '[es] Start over',
            updateDetails: '[es] Update details',
            yesDisconnectMyBankAccount: '[es] Yes, disconnect my bank account',
            yesStartOver: '[es] Yes, start over',
            disconnectYourBankAccount: (bankName: string) =>
                `[es] Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "[es] Starting over will clear the progress you've made so far.",
            areYouSure: '[es] Are you sure?',
            workspaceCurrency: '[es] Workspace currency',
            updateCurrencyPrompt: '[es] It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: '[es] Update to USD',
            updateWorkspaceCurrency: '[es] Update workspace currency',
            workspaceCurrencyNotSupported: '[es] Workspace currency not supported',
            yourWorkspace: `[es] Your workspace is set to an unsupported currency. View the <a href="${CONST.ENABLE_GLOBAL_REIMBURSEMENT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: '[es] Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: '[es] Transfer owner',
            addPaymentCardTitle: '[es] Enter your payment card to transfer ownership',
            addPaymentCardButtonText: '[es] Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `[es] <muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: '[es] PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: '[es] Bank level encryption',
            addPaymentCardRedundant: '[es] Redundant infrastructure',
            addPaymentCardLearnMore: `[es] <muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: '[es] Outstanding balance',
            amountOwedButtonText: '[es] OK',
            amountOwedText: '[es] This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: '[es] Outstanding balance',
            ownerOwesAmountButtonText: '[es] Transfer balance',
            ownerOwesAmountText: (email: string, amount: string) => `[es] The account owning this workspace (${email}) has an outstanding balance from a previous month.

Do you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: '[es] Take over annual subscription',
            subscriptionButtonText: '[es] Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `[es] Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: '[es] Duplicate subscription alert',
            duplicateSubscriptionButtonText: '[es] Continue',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `[es] It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.

Click "Continue" if you only want to take over billing for the workspace ${workspaceName}.

If you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '[es] Cannot transfer ownership',
            hasFailedSettlementsButtonText: '[es] Got it',
            hasFailedSettlementsText: (email: string) =>
                `[es] You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '[es] Failed to clear balance',
            failedToClearBalanceButtonText: '[es] OK',
            failedToClearBalanceText: '[es] We were unable to clear the balance. Please try again later.',
            successTitle: '[es] Woohoo! All set.',
            successDescription: "[es] You're now the owner of this workspace.",
            errorTitle: '[es] Oops! Not so fast...',
            errorDescription: `[es] <muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '[es] Careful!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `[es] The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Are you sure you want to export them again?`,
            confirmText: '[es] Yes, export again',
            cancelText: '[es] Cancel',
        },
        upgrade: {
            reportFields: {
                title: '[es] Report fields',
                description: `[es] Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: '[es] NetSuite',
                description: `[es] Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '[es] Sage Intacct',
                description: `[es] Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: '[es] QuickBooks Desktop',
                description: `[es] Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                title: '[es] Certinia',
                description: `[es] Enjoy automated syncing and reduce manual entries with the Expensify + Certinia integration. Align expense coding dimensions and tax sync with your Certinia setup for clearer financial visibility.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Our Certinia integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '[es] Advanced Approvals',
                description: `[es] If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            approvalSubmit: {
                title: '[es] Approvals',
                description: '[es] Centrally configure who all members submit to by enabling approvals.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Approvals are available on the Collect and Control plans, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            categories: {
                title: '[es] Categories',
                description: '[es] Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: '[es] GL codes',
                description: `[es] Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '[es] GL & Payroll codes',
                description: `[es] Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: '[es] Tax codes',
                description: `[es] Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: '[es] Unlimited Company cards',
                description: `[es] Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            companyCardSubmit: {
                title: '[es] Company cards',
                description: `[es] Bring your own company card to Expensify to get automatic import, automatic categorization, customizable rule support, and integrated reconciliation.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Company card import is available on the Collect and Control plans, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            rules: {
                title: '[es] Rules',
                description: `[es] Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.

Require expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: '[es] Per diem',
                description:
                    '[es] Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            hr: {
                title: '[es] HR integrations',
                description:
                    '[es] Connect your HR provider to automatically sync employees and manage approval workflows. Keep your team roster and reporting structure up to date without manual work.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>HR integrations are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            travel: {
                title: '[es] Travel',
                description: '[es] Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            travelSubmit: {
                title: '[es] Expensify Travel',
                description: '[es] Book discounted flights, hotels, cars, and trains globally from within Expensify, with duty of care reporting and integrated expense management.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Expensify Travel is available on the Collect and Control plans, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            reports: {
                title: '[es] Reports',
                description: '[es] Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: '[es] Multi-level tags',
                description:
                    '[es] Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: '[es] Distance rates',
                description: '[es] Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: '[es] Auditor',
                description: '[es] Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '[es] Multiple approval levels',
                description: '[es] Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            roles: {
                title: '[es] Roles',
                description: '[es] Assign different roles to different members to increase or decrease visibility and control as appropriate.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Roles are available on the Collect and Control plans, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            payments: {
                title: '[es] Payments',
                description: '[es] Reimburse employees directly from your business bank account.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Payments are available on the Collect and Control plans, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            accounting: {
                title: '[es] Accounting',
                description:
                    '[es] Sync categories, tags, tax rates, and more from your accounting system to Expensify, as well as export expense reports and card transactions – no typing (or typos) involved!',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Accounting is available on the Collect and Control plans, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            expensifyCard: {
                title: '[es] Expensify Card',
                description:
                    '[es] Issue company cards (including virtual cards) directly from your own bank account to get realtime spend control with an unbreakable connection, and up to 2% cashback!',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>The Expensify Card is available on the Collect and Control plans, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
                upgradeButton: '[es] Upgrade and enable',
            },
            invoicing: {
                title: '[es] Invoicing',
                description: '[es] Create, send, and track professional invoices, all inside Expensify. Get paid faster with integrated payments and real-time visibility.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[es] <muted-text>Invoicing is available on the Collect and Control plans, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '[es] per active member per month.',
                perMember: '[es] per member per month.',
            },
            note: (subscriptionLink: string) => `[es] <muted-text><a href="${subscriptionLink}">Learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: '[es] Unlock this feature',
            completed: {
                headline: `[es] You've upgraded your workspace!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `[es] <centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `[es] You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `[es] You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `[es] You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: '[es] Got it, thanks',
                createdWorkspace: `[es] You've created a workspace!`,
            },
            commonFeatures: {
                title: '[es] Upgrade to the Control plan',
                note: '[es] Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `[es] <muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[es] per member per month.` : `[es] per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: '[es] Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: '[es] Smart expense rules',
                    benefit3: '[es] Multi-level approval workflows',
                    benefit4: '[es] Enhanced security controls',
                    toUpgrade: '[es] To upgrade, click',
                    selectWorkspace: '[es] select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `[es] Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '[es] Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '[es] Downgrade to Collect',
                note: "[es] You'll lose access to the following features",
                noteAndMore: '[es] and more:',
                benefits: {
                    important: '[es] IMPORTANT: ',
                    confirm: '[es] You\'ll need to change the "Plan type" of every workspace to "Collect" in order to secure the Collect rate.',
                    benefit1Label: '[es] ERP integrations',
                    benefit1: '[es] NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: '[es] HR integrations',
                    benefit2: '[es] Workday, Certinia',
                    benefit3Label: '[es] Security',
                    benefit3: '[es] SSO/SAML',
                    benefit4Label: '[es] Advanced',
                    benefit4: '[es] Smart expense rules, per diems, multi-level approvals, custom reporting, and budgeting',
                    headsUp: '[es] Heads up!',
                    multiWorkspaceNote: '[es] You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '[es] > select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: '[es] Your workspace has been downgraded',
                description: '[es] You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: '[es] Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: '[es] Pay & downgrade',
            headline: '[es] Your final payment',
            description1: (formattedAmount: string) => `[es] Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `[es] See your breakdown below for ${date}:`,
            subscription:
                '[es] Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: '[es] An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: '[es] Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `[es] Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `[es] Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "[es] You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: '[es] Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: '[es] Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: '[es] Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: '[es] Chat with your admin',
            chatInAdmins: '[es] Chat in #admins',
            addPaymentCard: '[es] Add payment card',
            goToSubscription: '[es] Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: '[es] Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `[es] <muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: '[es] Receipt required amount',
                receiptRequiredAmountDescription: '[es] Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `[es] Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: '[es] Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: '[es] Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `[es] Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: '[es] Max expense amount',
                maxExpenseAmountDescription: '[es] Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: '[es] Max age',
                maxExpenseAge: '[es] Max expense age',
                maxExpenseAgeDescription: '[es] Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '[es] 1 day',
                    other: (count: number) => `[es] ${count} days`,
                }),
                cashExpenseDefault: '[es] Cash expense default',
                cashExpenseDefaultDescription:
                    '[es] Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: '[es] Reimbursable',
                reimbursableDefaultDescription: '[es] Expenses are most often paid back to employees',
                nonReimbursableDefault: '[es] Non-reimbursable',
                nonReimbursableDefaultDescription: '[es] Expenses are occasionally paid back to employees',
                alwaysReimbursable: '[es] Always reimbursable',
                alwaysReimbursableDescription: '[es] Expenses are always paid back to employees',
                alwaysNonReimbursable: '[es] Always non-reimbursable',
                alwaysNonReimbursableDescription: '[es] Expenses are never paid back to employees',
                billableDefault: '[es] Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `[es] <muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: '[es] Billable',
                billableDescription: '[es] Expenses are most often re-billed to clients',
                nonBillable: '[es] Non-billable',
                nonBillableDescription: '[es] Expenses are occasionally re-billed to clients',
                eReceipts: '[es] eReceipts',
                eReceiptsHint: `[es] eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: '[es] Attendee tracking',
                attendeeTrackingHint: '[es] Track the per-person cost for every expense.',
                prohibitedDefaultDescription: '[es] Flag receipts with these line items for manual review.',
                prohibitedExpenses: '[es] Prohibited expenses',
                alcohol: '[es] Alcohol',
                hotelIncidentals: '[es] Hotel incidentals',
                gambling: '[es] Gambling',
                tobacco: '[es] Tobacco',
                adultEntertainment: '[es] Adult entertainment',
                giftCard: '[es] Gift card purchases',
                handwrittenReceipt: '[es] Handwritten receipts',
                requireCompanyCard: '[es] Require company cards for all purchases',
                requireCompanyCardDescription: '[es] Flag all cash spend, including mileage and per-diem expenses.',
                requireCompanyCardDisabledTooltip: '[es] Enable Company cards (under More features) to unlock.',
            },
            expenseReportRules: {
                title: '[es] Advanced',
                subtitle: '[es] Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: '[es] Prevent self-approvals',
                preventSelfApprovalsSubtitle: '[es] Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: '[es] Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: '[es] Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: '[es] Auto-approve reports with all expenses under',
                autoApproveReportsUnderDescription: '[es] Fully compliant expense reports where all expenses are under this amount will be automatically approved.',
                randomReportAuditTitle: '[es] Random report audit',
                randomReportAuditDescription: '[es] Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: '[es] Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: '[es] Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `[es] Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: '[es] Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: '[es] Auto-pay reports under',
                autoPayReportsUnderDescription: '[es] Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `[es] Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[es] Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: '[es] Merchant',
                subtitle: '[es] Set merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: '[es] Add merchant rule',
                findRule: '[es] Find merchant rule',
                addRuleTitle: '[es] Add rule',
                editRuleTitle: '[es] Edit rule',
                expensesWith: '[es] For expenses with:',
                expensesExactlyMatching: '[es] For expenses exactly matching:',
                applyUpdates: '[es] Apply these updates:',
                saveRule: '[es] Save rule',
                previewMatches: '[es] Preview matches',
                confirmError: '[es] Enter merchant and apply at least one update',
                confirmErrorMerchant: '[es] Please enter merchant',
                confirmErrorUpdate: '[es] Please apply at least one update',
                previewMatchesEmptyStateTitle: '[es] Nothing to show',
                previewMatchesEmptyStateSubtitle: '[es] No unsubmitted expenses match this rule.',
                deleteRule: '[es] Delete rule',
                deleteRuleConfirmation: '[es] Are you sure you want to delete this rule?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `[es] If merchant ${isExactMatch ? '[es] exactly matches' : '[es] contains'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `[es] Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `[es] Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `[es] Mark as  "${reimbursable ? '[es] reimbursable' : '[es] non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `[es] Mark as "${billable ? '[es] billable' : '[es] non-billable'}"`,
                matchType: '[es] Match type',
                matchTypeContains: '[es] Contains',
                matchTypeExact: '[es] Exactly matches',
                duplicateRuleTitle: '[es] Similar merchant rule already exists',
                duplicateRulePrompt: (merchantName: string) => `[es] Your existing rule for "${merchantName}" will take priority over this one. Save anyway?`,
                saveAnyway: '[es] Save anyway',
                applyToExistingUnsubmittedExpenses: '[es] Apply to existing unsubmitted expenses',
            },
            categoryRules: {
                title: '[es] Category rules',
                approver: '[es] Approver',
                requireDescription: '[es] Require description',
                requireFields: '[es] Require fields',
                requiredFieldsTitle: '[es] Required fields',
                requiredFieldsDescription: (categoryName: string) => `[es] This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: '[es] Require attendees',
                descriptionHint: '[es] Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `[es] Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: '[es] Hint',
                descriptionHintSubtitle: '[es] Pro-tip: The shorter the better!',
                maxAmount: '[es] Max amount',
                flagAmountsOver: '[es] Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `[es] Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: '[es] This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: '[es] Individual expense',
                    expenseSubtitle: '[es] Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: '[es] Category total',
                    dailySubtitle: '[es] Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: '[es] Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `[es] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[es] Never require receipts',
                    always: '[es] Always require receipts',
                },
                requireItemizedReceiptsOver: '[es] Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `[es] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[es] Never require itemized receipts',
                    always: '[es] Always require itemized receipts',
                },
                defaultTaxRate: '[es] Default tax rate',
                enableWorkflows: (moreFeaturesLink: string) => `[es] Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: '[es] Expense policy',
                cardSubtitle: "[es] Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
                policyDocument: '[es] Policy document',
                policyText: '[es] Policy text',
            },
            spendRules: {
                title: '[es] Spend',
                subtitle: '[es] Approve or decline Expensify Card transactions in realtime.',
                defaultRuleDescription: '[es] All cards',
                block: '[es] Block',
                defaultRuleTitle: '[es] Categories: Adult services, ATMs, gambling, money transfers',
                builtInProtectionModal: {
                    title: '[es] Expensify Cards offer built-in protection - always',
                    description: `[es] Expensify always declines these charges:

  • Adult services
  • ATMs
  • Gambling
  • Money transfers

Add more spend rules to protect company cash flow.`,
                },
                addSpendRule: '[es] Add spend rule',
                editRuleTitle: '[es] Edit rule',
                cardPageTitle: '[es] Card',
                cardsSectionTitle: '[es] Cards',
                chooseCards: '[es] Choose cards',
                saveRule: '[es] Save rule',
                deleteRule: '[es] Delete rule',
                deleteRuleConfirmation: '[es] Are you sure you want to delete this rule?',
                allow: '[es] Allow',
                spendRuleSectionTitle: '[es] Spend rule',
                restrictionType: '[es] Restriction type',
                restrictionTypeHelpAllow: "[es] Charges are approved if they match any merchant or category, and don't exceed a max amount.",
                restrictionTypeHelpBlock: '[es] Charges are declined if they match any merchant or category, or exceed a max amount.',
                addMerchant: '[es] Add merchant',
                merchantContains: '[es] Merchant contains',
                merchantExactlyMatches: '[es] Merchant exactly matches',
                noBlockedMerchants: '[es] No blocked merchants',
                addMerchantToBlockSpend: '[es] Add a merchant to block spend',
                noAllowedMerchants: '[es] No allowed merchants',
                addMerchantToAllowSpend: '[es] Add a merchant to allow spend',
                matchType: '[es] Match type',
                matchTypeContains: '[es] Contains',
                matchTypeExact: '[es] Matches exactly',
                spendCategory: '[es] Spend category',
                maxAmount: '[es] Max amount',
                maxAmountHelp: '[es] Any charge over this amount will be declined, regardless of merchant and spend category restrictions.',
                currencyMismatchTitle: '[es] Currency mismatch',
                currencyMismatchPrompt: '[es] To set a max amount, select cards that settle in the same currency.',
                reviewSelectedCards: '[es] Review selected cards',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => (count > 0 ? `[es] ${summary}, +${count} more` : summary),
                summaryMerchants: ({
                    merchants,
                    hiddenCount,
                    shownCount,
                    action,
                }: {
                    merchants: string;
                    hiddenCount: number;
                    shownCount: number;
                    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
                }) =>
                    `${action === CONST.SPEND_RULES.ACTION.BLOCK ? '[es] Blocked' : '[es] Allowed'} ${shownCount > 1 ? '[es] merchants' : '[es] merchant'}: ${merchants}${hiddenCount > 0 ? `[es] , +${hiddenCount} more` : ''}`,
                summaryCategories: ({
                    categories,
                    hiddenCount,
                    shownCount,
                    action,
                }: {
                    categories: string;
                    hiddenCount: number;
                    shownCount: number;
                    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
                }) =>
                    `${action === CONST.SPEND_RULES.ACTION.BLOCK ? '[es] Blocked' : '[es] Allowed'} ${shownCount > 1 ? '[es] categories' : '[es] category'}: ${categories}${hiddenCount > 0 ? `[es] , +${hiddenCount} more` : ''}`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '[es] Apply at least one spend rule to one card',
                confirmErrorCardRequired: '[es] Card is a required field',
                confirmErrorApplyAtLeastOneSpendRule: '[es] Apply at least one spend rule',
                categories: '[es] Categories',
                merchants: '[es] Merchants',
                noAvailableCards: '[es] All cards already have a rule',
                noAvailableCardsSubtitle: '[es] Edit an existing card rule to make changes',
                noCardsIssuedTitle: '[es] No Expensify Cards issued',
                noCardsIssuedSubtitle: '[es] Issue Expensify Cards to create spend rules',
                max: '[es] Max',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '[es] Airlines',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '[es] Alcohol and bars',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: '[es] Amazon and bookstores',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '[es] Automotive',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: '[es] Car rentals',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '[es] Dining',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '[es] Fuel and gas',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '[es] Government and non-profits',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '[es] Groceries',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: '[es] Gyms and fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '[es] Healthcare',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: '[es] Hotels',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: '[es] Internet and phone',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '[es] Office supplies',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '[es] Parking and tolls',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: '[es] Professional services',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '[es] Retail',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '[es] Shipping and delivery',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: '[es] Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '[es] Transit and rideshare',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '[es] Travel agencies',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '[es] Collect',
                    description: '[es] For teams looking to automate their processes.',
                },
                corporate: {
                    label: '[es] Control',
                    description: '[es] For organizations with advanced requirements.',
                },
                submit2026: {
                    label: '[es] Submit',
                    description: '[es] For employees looking to submit expenses to their employer.',
                },
            },
            description: "[es] Choose a plan that's right for you.",
            subscriptionLink: '[es] Learn more',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `[es] You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `[es] You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: '[es] Subscriptions',
        },
    },
    getAssistancePage: {
        title: '[es] Get assistance',
        subtitle: "[es] We're here to clear your path to greatness!",
        description: '[es] Choose from the support options below:',
        chatWithConcierge: '[es] Chat with Concierge',
        scheduleSetupCall: '[es] Schedule a setup call',
        scheduleACall: '[es] Schedule call',
        questionMarkButtonTooltip: '[es] Get assistance from our team',
        exploreHelpDocs: '[es] Explore help docs',
        registerForWebinar: '[es] Register for webinar',
        onboardingHelp: '[es] Onboarding help',
    },
    emojiPicker: {
        emojiNotSelected: '[es] Emoji not selected',
        skinTonePickerLabel: '[es] Change default skin tone',
        headers: {
            frequentlyUsed: '[es] Frequently Used',
            smileysAndEmotion: '[es] Smileys & Emotion',
            peopleAndBody: '[es] People & Body',
            animalsAndNature: '[es] Animals & Nature',
            foodAndDrink: '[es] Food & Drinks',
            travelAndPlaces: '[es] Travel & Places',
            activities: '[es] Activities',
            objects: '[es] Objects',
            symbols: '[es] Symbols',
            flags: '[es] Flags',
        },
    },
    newRoomPage: {
        newRoom: '[es] New room',
        groupName: '[es] Group name',
        roomName: '[es] Room name',
        visibility: '[es] Visibility',
        restrictedDescription: '[es] People in your workspace can find this room',
        privateDescription: '[es] People invited to this room can find it',
        publicDescription: '[es] Anyone can find this room',
        public_announceDescription: '[es] Anyone can find this room',
        createRoom: '[es] Create room',
        roomAlreadyExistsError: '[es] A room with this name already exists',
        roomNameReservedError: (reservedName: string) => `[es] ${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '[es] Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: '[es] Please enter a room name',
        pleaseSelectWorkspace: '[es] Please select a workspace',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `[es] ${actor}renamed to "${newName}" (previously "${oldName}")` : `[es] ${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: (newName: string) => `[es] Room renamed to ${newName}`,
        social: '[es] social',
        selectAWorkspace: '[es] Select a workspace',
        growlMessageOnRenameError: '[es] Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: '[es] Workspace',
            private: '[es] Private',
            public: '[es] Public',
            public_announce: '[es] Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '[es] Submit and Close',
        submitAndApprove: '[es] Submit and Approve',
        advanced: '[es] ADVANCED',
        dynamicExternal: '[es] DYNAMIC_EXTERNAL',
        smartReport: '[es] SMARTREPORT',
        billcom: '[es] BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[es] set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[es] removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        changedDefaultBankAccount: ({
            bankAccountName,
            maskedBankAccountNumber,
            oldBankAccountName,
            oldMaskedBankAccountNumber,
        }: {
            bankAccountName: string;
            maskedBankAccountNumber: string;
            oldBankAccountName: string;
            oldMaskedBankAccountNumber: string;
        }) =>
            `[es] changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `[es] changed the company address to "${newAddress}" (previously "${previousAddress}")` : `[es] set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[es] added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[es] removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: (field: string, name: string, newApproverEmail: string, newApproverName: string | undefined, oldApproverEmail: string, oldApproverName: string | undefined) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `[es] changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `[es] added the category "${categoryName}"`,
        deleteCategory: (categoryName: string) => `[es] removed the category "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `[es] ${oldValue ? '[es] disabled' : '[es] enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[es] added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[es] removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[es] changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[es] added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[es] removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[es] changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `[es] changed the "${categoryName}" category description to ${!oldValue ? '[es] required' : '[es] not required'} (previously ${!oldValue ? '[es] not required' : '[es] required'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `[es] added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `[es] removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `[es] changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[es] added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `[es] changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[es] updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `[es] changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: (categoryName: string, oldValue: string | undefined, newValue: string) => {
            if (!oldValue) {
                return `[es] updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `[es] changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `[es] renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `[es] removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }
            return !oldValue
                ? `[es] added the description hint "${newValue}" to the category "${categoryName}"`
                : `[es] changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategories: (count: number) => `[es] updated ${count} categories`,
        updateTagListName: (oldName: string, newName: string) => `[es] changed the tag list name to "${newName}" (previously "${oldName}")`,
        updateTagList: (tagListName: string) => `[es] updated tags on the list "${tagListName}"`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `[es] changed tag list "${tagListsName}" to ${isRequired ? '[es] required' : '[es] not required'}`,
        importTags: '[es] imported tags from a spreadsheet',
        deletedAllTags: '[es] deleted all tags',
        addTag: (tagListName: string, tagName?: string) => `[es] added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `[es] updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `[es] ${enabled ? '[es] enabled' : '[es] disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `[es] removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `[es] removed "${count}" tags from the list "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `[es] updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `[es] updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: (customUnitName: string, newValue: string, oldValue: string, updatedField: string) =>
            `[es] changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `[es] ${newValue ? '[es] enabled' : '[es] disabled'} tax tracking on distance rates`,
        updateCustomUnitDefaultCategory: (customUnitName: string, newValue?: string, oldValue?: string) =>
            `[es] changed the ${customUnitName} default category to "${newValue}" ${oldValue ? `[es] (previously "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `[es] imported rates for custom unit "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `[es] added a new ${customUnitName} rate "${rateName}"`,
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `[es] removed the "${customUnitName}" rate "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `[es] changed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${customUnitSubRateName}" ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `[es] removed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${removedSubRateName}"`,
        addedReportField: (fieldType: string, fieldName?: string, defaultValue?: string) =>
            `[es] added ${fieldType} report field "${fieldName}"${defaultValue ? `[es]  with default value "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `[es] changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `[es] changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `[es] added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `[es] changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `[es] added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `[es] ${newValue ? '[es] enabled' : '[es] disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `[es] set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `[es] added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `[es] removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `[es] ${optionEnabled ? '[es] enabled' : '[es] disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `[es] ${allEnabled ? '[es] enabled' : '[es] disabled'} all options for the report field "${fieldName}" `;
            }
            return `[es] ${allEnabled ? '[es] enabled' : '[es] disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? '[es] enabled' : '[es] disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `[es] removed ${fieldType} Report Field "${fieldName}"`,
        addedCardFeed: (feedName: string) => `[es] added card feed "${feedName}"`,
        removedCardFeed: (feedName: string) => `[es] removed card feed "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `[es] renamed card feed to "${newName}" (previously "${oldName}")`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) => `[es] assigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[es] unassigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `[es] ${enabled ? '[es] enabled' : '[es] disabled'} cardholders to delete card transactions for card feed "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `[es] changed card feed "${feedName}" statement period end day${newValue ? `[es]  to "${newValue}"` : ''}${previousValue ? `[es]  (previously "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `[es] updated "Prevent self-approval" to "${newValue === 'true' ? '[es] Enabled' : '[es] Disabled'}" (previously "${oldValue === 'true' ? '[es] Enabled' : '[es] Disabled'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `[es] set the monthly report submission date to "${newValue}"`;
            }
            return `[es] updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `[es] updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `[es] updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `[es] turned "Enforce default report titles" ${value ? '[es] on' : '[es] off'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `[es] changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `[es] updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `[es] set the description of this workspace to "${newDescription}"`
                : `[es] updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('[es]  and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `[es] removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `[es] removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `[es] updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `[es] updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `[es] updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `[es] updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: '[es] upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `[es] This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: '[es] downgraded this workspace to the Collect plan',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `[es] changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: (oldLimit: string, newLimit: string) => `[es] changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        addBudget: (frequency: string, entityName: string, entityType: string, shared?: string, individual?: string, notificationThreshold?: number) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[es]  with notification threshold of "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `[es] added ${frequency} individual budget of "${individual}" and ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            if (typeof individual !== 'undefined') {
                return `[es] added ${frequency} individual budget of "${individual}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            return `[es] added ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
        },
        updateBudget: (
            entityType: string,
            entityName: string,
            oldFrequency?: string,
            newFrequency?: string,
            oldIndividual?: string,
            newIndividual?: string,
            oldShared?: string,
            newShared?: string,
            oldNotificationThreshold?: number,
            newNotificationThreshold?: number,
        ) => {
            const frequencyChanged = !!(newFrequency && oldFrequency !== newFrequency);
            const sharedChanged = !!(newShared && oldShared !== newShared);
            const individualChanged = !!(newIndividual && oldIndividual !== newIndividual);
            const thresholdChanged = typeof newNotificationThreshold === 'number' && oldNotificationThreshold !== newNotificationThreshold;
            const changesList: string[] = [];
            if (frequencyChanged) {
                changesList.push(`[es] changed budget frequency to "${newFrequency}" (previously "${oldFrequency}")`);
            }
            if (sharedChanged) {
                changesList.push(`[es] changed total workspace budget to "${newShared}" (previously "${oldShared}")`);
            }
            if (individualChanged) {
                changesList.push(`[es] changed individual budget to "${newIndividual}" (previously "${oldIndividual}")`);
            }
            if (thresholdChanged) {
                changesList.push(`[es] changed notification threshold to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `[es] updated budget for the ${entityType} "${entityName}"`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `[es] changed budget frequency for the ${entityType} "${entityName}" to "${newFrequency}" (previously "${oldFrequency}")`;
                }
                if (sharedChanged) {
                    return `[es] changed total workspace budget for the ${entityType} "${entityName}" to "${newShared}" (previously "${oldShared}")`;
                }
                if (individualChanged) {
                    return `[es] changed individual budget for the ${entityType} "${entityName}" to "${newIndividual}" (previously "${oldIndividual}")`;
                }
                return `[es] changed notification threshold for the ${entityType} "${entityName}" to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`;
            }
            return `[es] updated budget for the ${entityType} "${entityName}": ${changesList.join('; ')}`;
        },
        deleteBudget: (entityType: string, entityName: string, frequency?: string, individual?: string, shared?: string, notificationThreshold?: number) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[es]  with notification threshold of "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `[es] removed ${frequency} shared budget of "${shared}" and individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (shared) {
                return `[es] removed ${frequency} shared budget of "${shared}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `[es] removed ${frequency} individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            return `[es] removed budget from the ${entityType} "${entityName}"`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} time tracking`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `[es] changed hourly rate to "${newRate}" (previously "${oldRate}")`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[es] added "${prohibitedExpense}" to prohibited expenses`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[es] removed "${prohibitedExpense}" from prohibited expenses`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `[es] changed reimbursement method to "${newReimbursementChoice}" (previously "${oldReimbursementChoice}")`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `[es] ${enabled ? '[es] enabled' : '[es] disabled'} pre-approval of workspace join requests`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `[es] changed custom report name formula to "${newDefaultTitle}" (previously "${oldDefaultTitle}")`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `[es] took over ownership of ${policyName} from ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `[es] ${enabled ? '[es] enabled' : '[es] disabled'} scheduled submit`,
        updatedIndividualBudgetNotification: (
            budgetAmount: string,
            budgetFrequency: string,
            budgetName: string,
            budgetTypeForNotificationMessage: string,
            thresholdPercentage: number,
            totalSpend: number,
            unsubmittedSpend: number,
            awaitingApprovalSpend: number,
            approvedReimbursedClosedSpend: number,
            summaryLink?: string,
            userEmail?: string,
        ) =>
            `[es] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". ${userEmail} is currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}.${summaryLink ? `[es]  <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedSharedBudgetNotification: (
            budgetAmount: string,
            budgetFrequency: string,
            budgetName: string,
            budgetTypeForNotificationMessage: string,
            summaryLink: string | undefined,
            thresholdPercentage: number,
            totalSpend: number,
            unsubmittedSpend: number,
            awaitingApprovalSpend: number,
            approvedReimbursedClosedSpend: number,
        ) =>
            `[es] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". You're currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}. ${summaryLink ? `[es] <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} categories`;
                case 'tags':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} tags`;
                case 'workflows':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} workflows`;
                case 'distance rates':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} distance rates`;
                case 'accounting':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} accounting`;
                case 'Expensify Cards':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} Expensify Cards`;
                case 'travel invoicing':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} travel invoicing`;
                case 'company cards':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} company cards`;
                case 'invoicing':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} invoicing`;
                case 'per diem':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} per diem`;
                case 'receipt partners':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} receipt partners`;
                case 'rules':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} rules`;
                case 'tax tracking':
                    return `[es] ${enabled ? '[es] enabled' : '[es] disabled'} tax tracking`;
                default:
                    return `${enabled ? '[es] enabled' : '[es] disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `[es] ${enabled ? '[es] enabled' : '[es] disabled'} attendee tracking`,
        updatedRequireCompanyCards: ({enabled}: {enabled: boolean}) => `[es] ${enabled ? '[es] enabled' : '[es] disabled'} the company card purchases requirement`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `[es] ${enabled ? '[es] enabled' : '[es] disabled'} auto-pay approved reports`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `[es] set the auto-pay approved reports threshold to "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `[es] changed the auto-pay approved reports threshold to "${newLimit}" (previously "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: '[es] removed the auto-pay approved reports threshold',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `[es] changed the default approver to ${newApprover} (previously ${previousApprover})` : `[es] changed the default approver to ${newApprover}`,
        changedSubmitsToApprover: ({
            members,
            approver,
            previousApprover,
            wasDefaultApprover,
        }: {
            members: string;
            approver: string;
            previousApprover?: string;
            wasDefaultApprover?: boolean;
        }) => {
            let text = `[es] changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `[es]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[es]  (previously default approver)';
            } else if (previousApprover) {
                text += `[es]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedSubmitsToDefault: ({
            members,
            approver,
            previousApprover,
            wasDefaultApprover,
        }: {
            members: string;
            approver?: string;
            previousApprover?: string;
            wasDefaultApprover?: boolean;
        }) => {
            let text = approver
                ? `[es] changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `[es] changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += `[es]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[es]  (previously default approver)';
            } else if (previousApprover) {
                text += `[es]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[es] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `[es] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[es] changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `[es] changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[es] changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `[es] set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[es] changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `[es] set the invoice company website to "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser ? `[es] changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")` : `[es] changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: (enabled: boolean) => `[es] ${enabled ? '[es] enabled' : '[es] disabled'} reimbursements`,
        updateCustomTaxName: (oldName: string, newName: string) => `[es] changed the custom tax name to "${newName}" (previously "${oldName}")`,
        updateCurrencyDefaultTax: (oldName: string, newName: string) => `[es] changed the workspace currency default tax rate to "${newName}" (previously "${oldName}")`,
        updateForeignCurrencyDefaultTax: (oldName: string, newName: string) => `[es] changed the foreign currency default tax rate to "${newName}" (previously "${oldName}")`,
        addTax: (taxName: string) => `[es] added the tax "${taxName}"`,
        deleteTax: (taxName: string) => `[es] removed the tax "${taxName}"`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `[es] renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `[es] changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `[es] changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `[es] ${oldValue ? '[es] disabled' : '[es] enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `[es] set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[es] changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: (oldValue: string) => `[es] removed receipt required amount (previously "${oldValue}")`,
        setItemizedReceiptRequiredAmount: (newValue: string) => `[es] set itemized receipt required amount to "${newValue}"`,
        changedItemizedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[es] changed itemized receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedItemizedReceiptRequiredAmount: (oldValue: string) => `[es] removed itemized receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `[es] set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `[es] changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: (oldValue: string) => `[es] removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: (newValue: string) => `[es] set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `[es] changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `[es] removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: '[es] Member not found.',
        useInviteButton: '[es] To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `[es] You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `[es] It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `[es] Are you sure you want to remove ${memberName} from the room?`,
            other: '[es] Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: '[es] There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: '[es] Assign task',
        assignMe: '[es] Assign to me',
        confirmTask: '[es] Confirm task',
        confirmError: '[es] Please enter a title and select a share destination',
        descriptionOptional: '[es] Description (optional)',
        pleaseEnterTaskName: '[es] Please enter a title',
        pleaseEnterTaskDestination: '[es] Please select where you want to share this task',
    },
    task: {
        task: '[es] Task',
        title: '[es] Title',
        description: '[es] Description',
        assignee: '[es] Assignee',
        completed: '[es] Completed',
        action: '[es] Complete',
        messages: {
            created: (title: string) => `[es] task for ${title}`,
            completed: '[es] marked as complete',
            canceled: '[es] deleted task',
            reopened: '[es] marked as incomplete',
            error: "[es] You don't have permission to take the requested action",
        },
        markAsComplete: '[es] Mark as complete',
        markAsIncomplete: '[es] Mark as incomplete',
        assigneeError: '[es] An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: '[es] There was an error creating this task. Please try again later.',
        deleteTask: '[es] Delete task',
        deleteConfirmation: '[es] Are you sure you want to delete this task?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `[es] ${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '[es] Keyboard shortcuts',
        subtitle: '[es] Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: '[es] Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: '[es] Mark all messages as read',
            escape: '[es] Escape dialogs',
            search: '[es] Open search dialog',
            newChat: '[es] New chat screen',
            copy: '[es] Copy comment',
            openDebug: '[es] Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: '[es] Screen share',
        screenShareRequest: '[es] Expensify is inviting you to a screen share',
    },
    search: {
        tabs: {
            expenseReports: '[es] Expense reports',
            reports: '[es] Reports',
            expenses: '[es] Expenses',
            submit: '[es] Drafts',
            approve: '[es] Needs approval',
            pay: '[es] Ready to pay',
            accounting: '[es] Accounting',
            export: '[es] Awaiting export',
            unapprovedCash: '[es] Cash accruals',
            unapprovedCard: '[es] Card accruals',
            statements: '[es] Card statements',
            reconciliation: '[es] Bank reconciliation',
            insights: '[es] Insights',
            topSpenders: '[es] Top spenders',
            topCategories: '[es] Top categories',
            topMerchants: '[es] Top merchants',
        },
        resultsAreLimited: '[es] Search results are limited.',
        viewResults: '[es] View results',
        appliedFilters: '[es] Applied filters',
        resetFilters: '[es] Reset filters',
        searchResults: {
            emptyResults: {
                title: '[es] Nothing to show',
                subtitle: `[es] Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "[es] You haven't created any expenses yet",
                subtitle: '[es] Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[es] Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "[es] You haven't created any reports yet",
                subtitle: '[es] Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[es] Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    [es] You haven't created any
                    invoices yet
                `),
                subtitle: '[es] Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[es] Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: '[es] No trips to display',
                subtitle: '[es] Get started by booking your first trip below.',
                buttonText: '[es] Book a trip',
            },
            emptySubmitResults: {
                title: '[es] No expenses to submit',
                subtitle: "[es] You're all clear. Take a victory lap!",
                buttonText: '[es] Create report',
            },
            emptyApproveResults: {
                title: '[es] No expenses to approve',
                subtitle: '[es] Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: '[es] No expenses to pay',
                subtitle: '[es] Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: '[es] No expenses to export',
                subtitle: '[es] Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: '[es] No expenses to display',
                subtitle: '[es] No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: '[es] No expenses to approve',
                subtitle: '[es] Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: '[es] Columns',
        editColumns: '[es] Edit columns',
        resetColumns: '[es] Reset columns',
        groupColumns: '[es] Group columns',
        expenseColumns: '[es] Expense Columns',
        saveSearch: '[es] Save search',
        deleteSavedSearch: '[es] Delete saved search',
        deleteSavedSearchConfirm: '[es] Are you sure you want to delete this search?',
        searchName: '[es] Search name',
        savedSearchesMenuItemTitle: '[es] Saved',
        urlCopied: '[es] URL copied',
        spendOverTime: '[es] Spend over time',
        groupedExpenses: '[es] grouped expenses',
        bulkActions: {
            editMultiple: '[es] Edit multiple',
            editMultipleTitle: '[es] Edit multiple expenses',
            editMultipleDescription: '[es] Changes will be set for all selected expenses and will override any previously set values.',
            approve: '[es] Approve',
            pay: '[es] Pay',
            delete: '[es] Delete',
            hold: '[es] Hold',
            unhold: '[es] Remove hold',
            reject: '[es] Reject',
            duplicateExpense: ({count}: {count: number}) => `[es] Duplicate ${count === 1 ? '[es] expense' : '[es] expenses'}`,
            duplicateReport: ({count}: {count: number}) => `[es] Duplicate ${count === 1 ? '[es] report' : '[es] reports'}`,
            undelete: '[es] Undelete',
            noOptionsAvailable: '[es] No options available for the selected group of expenses.',
        },
        filtersHeader: '[es] Filters',
        filters: {
            date: {
                before: (date?: string) => `[es] Before ${date ?? ''}`,
                after: (date?: string) => `[es] After ${date ?? ''}`,
                on: (date?: string) => `[es] On ${date ?? ''}`,
                customDate: '[es] Custom date',
                customRange: '[es] Custom range',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '[es] Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '[es] Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '[es] This month',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '[es] Year to date',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '[es] Last 12 months',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '[es] Last statement',
                },
            },
            status: '[es] Status',
            keyword: '[es] Keyword',
            keywords: '[es] Keywords',
            limit: '[es] Limit',
            limitDescription: '[es] Set a limit for the results of your search.',
            currency: '[es] Currency',
            completed: '[es] Completed',
            amount: {
                lessThan: (amount?: string) => `[es] Less than ${amount ?? ''}`,
                greaterThan: (amount?: string) => `[es] Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `[es] Between ${greaterThan} and ${lessThan}`,
                equalTo: (amount?: string) => `[es] Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: '[es] Expensify',
                travelInvoicing: '[es] Travel invoicing',
                individualCards: '[es] Individual cards',
                closedCards: '[es] Closed cards',
                cardFeeds: '[es] Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `[es] All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `[es] All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `[es] ${name} is ${value}`,
            current: '[es] Current',
            past: '[es] Past',
            submitted: '[es] Submitted',
            approved: '[es] Approved',
            paid: '[es] Paid',
            exported: '[es] Exported',
            posted: '[es] Posted',
            withdrawn: '[es] Withdrawn',
            billable: '[es] Billable',
            reimbursable: '[es] Reimbursable',
            purchaseCurrency: '[es] Purchase currency',
            sortOrder: {
                [CONST.SEARCH.SORT_ORDER.ASC]: '[es] Ascending',
                [CONST.SEARCH.SORT_ORDER.DESC]: '[es] Descending',
            },
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '[es] From',
                [CONST.SEARCH.GROUP_BY.CARD]: '[es] Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[es] Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '[es] Category',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '[es] Merchant',
                [CONST.SEARCH.GROUP_BY.TAG]: '[es] Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: '[es] Month',
                [CONST.SEARCH.GROUP_BY.WEEK]: '[es] Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: '[es] Year',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '[es] Quarter',
            },
            feed: '[es] Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: '[es] Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '[es] Reimbursement',
                [CONST.SEARCH.WITHDRAWAL_TYPE.CENTRAL_TRAVEL_INVOICING]: '[es] Travel invoicing',
            },
            is: '[es] Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '[es] Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '[es] Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '[es] Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '[es] Export',
            },
        },
        display: {
            label: '[es] Display',
            sortBy: '[es] Sort by',
            sortOrder: '[es] Sort order',
            groupBy: '[es] Group by',
            limitResults: '[es] Limit results',
        },
        has: '[es] Has',
        view: {
            label: '[es] View',
            table: '[es] Table',
            bar: '[es] Bar',
            line: '[es] Line',
            pie: '[es] Pie',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '[es] From',
            [CONST.SEARCH.GROUP_BY.CARD]: '[es] Cards',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[es] Exports',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '[es] Categories',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '[es] Merchants',
            [CONST.SEARCH.GROUP_BY.TAG]: '[es] Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: '[es] Months',
            [CONST.SEARCH.GROUP_BY.WEEK]: '[es] Weeks',
            [CONST.SEARCH.GROUP_BY.YEAR]: '[es] Years',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '[es] Quarters',
        },
        moneyRequestReport: {
            emptyStateTitle: '[es] This report has no expenses.',
            accessPlaceHolder: '[es] Open for details',
        },
        noCategory: '[es] No category',
        noMerchant: '[es] No merchant',
        noTag: '[es] No tag',
        expenseType: '[es] Expense type',
        withdrawalType: '[es] Withdrawal type',
        recentSearches: '[es] Recent searches',
        recentChats: '[es] Recent chats',
        searchIn: '[es] Search in',
        askConcierge: (message: string) => `[es] Ask Concierge “${message}”`,
        searchPlaceholder: '[es] Search for something...',
        suggestions: '[es] Suggestions',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `[es] Suggestions available${query ? `[es]  for ${query}` : ''}. ${count} result.`,
            other: (resultCount: number) => `[es] Suggestions available${query ? `[es]  for ${query}` : ''}. ${resultCount} results.`,
        }),
        exportSearchResults: {
            title: '[es] Create export',
            description: "[es] Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: '[es] Exported to',
        exportAll: {
            selectAllMatchingItems: '[es] Select all matching items',
            allMatchingItemsSelected: '[es] All matching items selected',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: '[es] Please select dates for both From and To',
        },
    },
    genericErrorPage: {
        title: '[es] Uh-oh, something went wrong!',
        body: {
            helpTextMobile: '[es] Please close and reopen the app, or switch to',
            helpTextWeb: '[es] web.',
            helpTextConcierge: '[es] If the problem persists, reach out to',
        },
        refresh: '[es] Refresh',
    },
    fileDownload: {
        success: {
            title: '[es] Downloaded!',
            message: '[es] Attachment successfully downloaded!',
            qrMessage: '[es] Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: '[es] Attachment error',
            message: "[es] Attachment can't be downloaded",
        },
        permissionError: {
            title: '[es] Storage access',
            message: "[es] Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: '[es] Pending',
            cleared: '[es] Cleared',
            failed: '[es] Failed',
        },
        failedError: ({link}: {link: string}) => `[es] We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `[es] ${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '[es] Report layout',
        groupByLabel: '[es] Group by:',
        selectGroupByOption: '[es] Select how to group report expenses',
        uncategorized: '[es] Uncategorized',
        noTag: '[es] No tag',
        selectGroup: ({groupName}: {groupName: string}) => `[es] Select all expenses in ${groupName}`,
        groupBy: {
            category: '[es] Category',
            tag: '[es] Tag',
        },
    },
    report: {
        newReport: {
            createExpense: '[es] Create expense',
            createReport: '[es] Create report',
            chooseWorkspace: '[es] Choose a workspace for this report.',
            emptyReportConfirmationTitle: '[es] You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `[es] Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationDontShowAgain: "[es] Don't show me this again",
            genericWorkspaceName: '[es] this workspace',
        },
        genericCreateReportFailureMessage: '[es] Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: '[es] Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: '[es] Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: '[es] Unexpected error renaming the report. Please try again later.',
        noActivityYet: '[es] No activity yet',
        connectionSettings: '[es] Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `[es] changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `[es] set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `[es] changed the workspace${fromPolicyName ? `[es]  (previously ${fromPolicyName})` : ''}`;
                    }
                    return `[es] changed the workspace to ${toPolicyName}${fromPolicyName ? `[es]  (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `[es] changed type from ${oldType} to ${newType}`,
                exportedToCSV: `[es] exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `[es] exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `[es] exported to ${label} via`,
                    automaticActionTwo: '[es] accounting settings',
                    manual: (label: string) => `[es] marked this report as manually exported to ${label}.`,
                    automaticActionThree: '[es] and successfully created a record for',
                    reimburseableLink: '[es] out-of-pocket expenses',
                    nonReimbursableLink: '[es] company card expenses',
                    travelCardLink: '[es] travel card expenses',
                    pending: (label: string) => `[es] started exporting this report to ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `[es] failed to export this report to ${label} ("${errorMessage}${linkText ? `[es]  <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `[es] added a receipt`,
                managerDetachReceipt: `[es] removed a receipt`,
                markedReimbursed: (amount: string, currency: string) => `[es] paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `[es] paid ${currency}${amount} via integration`,
                outdatedBankAccount: `[es] couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounceDefault: `[es] couldn't process the payment due to an incorrect routing/account number or closed account`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `[es] couldn't process the payment: ${returnReason}`,
                reimbursementACHCancelled: `[es] canceled the payment`,
                reimbursementAccountChanged: `[es] couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `[es] processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `[es] randomly selected for review`,
                selectedForRandomAuditMarkdown: `[es] [randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `[es] invited member ${to}`,
                unshare: ({to}: UnshareParams) => `[es] removed member ${to}`,
                stripePaid: (amount: string, currency: string) => `[es] paid ${currency}${amount}`,
                takeControl: `[es] took control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `[es] Open the Expensify mobile app to review your ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}transaction`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `[es] there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                integrationSyncFailedRecurrence: ({count}: {count: number}) => `[es] (Repeated ${count} times.)`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `[es] The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `[es] the Plaid connection to your business bank account is broken. Please <a href='${walletRoute}'>reconnect your bank account ${maskedAccountNumber}</a> so you can continue to use your Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `[es] ${email} joined via the workspace invite link` : `[es] added ${email} as ${role === 'member' ? '[es] a' : '[es] an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `[es] updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[es] removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[es] added "${newValue}" to ${email}’s custom field 1`
                        : `[es] changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[es] removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[es] added "${newValue}" to ${email}’s custom field 2`
                        : `[es] changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `[es] ${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `[es] removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `[es] removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `[es] connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '[es] left the chat',
                leftTheChatWithName: (nameOrEmail: string) => `[es] ${nameOrEmail ? `${nameOrEmail}: ` : ''}left the chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `[es] business bank account ${maskedBankAccountNumber} has been automatically locked due to an issue with either Reimbursement or Expensify Card settlement. Please fix the issue in your <a href="${linkURL}">workspace settings</a>.`,
            },
            error: {
                invalidCredentials: '[es] Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `[es] ${summary} for ${dayCount} ${dayCount === 1 ? '[es] day' : '[es] days'} until ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `[es] ${summary} from ${timePeriod} on ${date}`,
        startTimer: '[es] Start Timer',
        stopTimer: (duration: string) => `[es] Stop Timer (${duration})`,
        scheduleOOO: '[es] Schedule OOO',
        scheduleOOOTitle: '[es] Schedule Out of Office',
        date: '[es] Date',
        time: '[es] Time (use 24-hour format)',
        durationAmount: '[es] Duration',
        durationUnit: '[es] Unit',
        reason: '[es] Reason',
        workingPercentage: '[es] Working percentage',
        dateRequired: '[es] Date is required.',
        invalidTimeFormat: '[es] Please enter a valid 24-hour time (e.g., 14:30).',
        enterANumber: '[es] Please enter a number.',
        hour: '[es] hours',
        day: '[es] days',
        week: '[es] weeks',
        month: '[es] months',
    },
    footer: {
        features: '[es] Features',
        expenseManagement: '[es] Expense Management',
        spendManagement: '[es] Spend Management',
        expenseReports: '[es] Expense Reports',
        companyCreditCard: '[es] Company Credit Card',
        receiptScanningApp: '[es] Receipt Scanning App',
        billPay: '[es] Bill Pay',
        invoicing: '[es] Invoicing',
        CPACard: '[es] CPA Card',
        payroll: '[es] Payroll',
        travel: '[es] Travel',
        resources: '[es] Resources',
        expensifyApproved: '[es] ExpensifyApproved!',
        pressKit: '[es] Press Kit',
        support: '[es] Support',
        expensifyHelp: '[es] ExpensifyHelp',
        terms: '[es] Terms of Service',
        privacy: '[es] Privacy',
        learnMore: '[es] Learn More',
        aboutExpensify: '[es] About Expensify',
        blog: '[es] Blog',
        jobs: '[es] Jobs',
        expensifyOrg: '[es] Expensify.org',
        investorRelations: '[es] Investor Relations',
        getStarted: '[es] Get Started',
        createAccount: '[es] Create A New Account',
        logIn: '[es] Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '[es] Navigate back to chats list',
        chatWelcomeMessage: '[es] Chat welcome message',
        navigatesToChat: '[es] Navigates to a chat',
        newMessageLineIndicator: '[es] New message line indicator',
        chatMessage: '[es] Chat message',
        lastChatMessagePreview: '[es] Last chat message preview',
        workspaceName: '[es] Workspace name',
        chatUserDisplayNames: '[es] Chat member display names',
        scrollToNewestMessages: '[es] Scroll to newest messages',
        preStyledText: '[es] Pre-styled text',
        viewAttachment: '[es] View attachment',
        contextMenuAvailable: '[es] Context menu available. Press Shift+F10 to open.',
        contextMenuAvailableMacOS: '[es] Context menu available. Press VO-Shift-M to open.',
        contextMenuAvailableNative: '[es] Context menu available. Double-tap and hold to open.',
        selectAllFeatures: '[es] Select all features',
        selectAllTransactions: '[es] Select all transactions',
        selectAllItems: '[es] Select all items',
        openActionsMenu: '[es] Open actions menu',
        selectAllCategories: '[es] Select all categories',
        selectAllDistanceRates: '[es] Select all distance rates',
        selectAllTags: '[es] Select all tags',
        selectAllTaxes: '[es] Select all taxes',
        selectAllPerDiemRates: '[es] Select all per diem rates',
        selectAllMembers: '[es] Select all members',
        selectAllValues: '[es] Select all values',
        selectAllRules: '[es] Select all rules',
    },
    parentReportAction: {
        deletedReport: '[es] Deleted report',
        deletedMessage: '[es] Deleted message',
        deletedExpense: '[es] Deleted expense',
        reversedTransaction: '[es] Reversed transaction',
        deletedTask: '[es] Deleted task',
        hiddenMessage: '[es] Hidden message',
    },
    threads: {
        thread: '[es] Thread',
        replies: '[es] Replies',
        reply: '[es] Reply',
        from: '[es] From',
        in: '[es] in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `[es] From ${reportName}${workspaceName ? `[es]  in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: '[es] QR code',
        copy: '[es] Copy URL',
        copied: '[es] Copied!',
    },
    moderation: {
        flagDescription: '[es] All flagged messages will be sent to a moderator for review.',
        chooseAReason: '[es] Choose a reason for flagging below:',
        spam: '[es] Spam',
        spamDescription: '[es] Unsolicited off-topic promotion',
        inconsiderate: '[es] Inconsiderate',
        inconsiderateDescription: '[es] Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: '[es] Intimidation',
        intimidationDescription: '[es] Aggressively pursuing an agenda over valid objections',
        bullying: '[es] Bullying',
        bullyingDescription: '[es] Targeting an individual to obtain obedience',
        harassment: '[es] Harassment',
        harassmentDescription: '[es] Racist, misogynistic, or other broadly discriminatory behavior',
        assault: '[es] Assault',
        assaultDescription: '[es] Specifically targeted emotional attack with the intention of harm',
        flaggedContent: '[es] This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: '[es] Hide message',
        revealMessage: '[es] Reveal message',
        levelOneResult: '[es] Sends anonymous warning and message is reported for review.',
        levelTwoResult: '[es] Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: '[es] Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '[es] Invite to submit expenses',
        inviteToChat: '[es] Invite to chat only',
        nothing: '[es] Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '[es] Accept',
        decline: '[es] Decline',
    },
    actionableMentionTrackExpense: {
        submit: '[es] Submit it to someone',
        categorize: '[es] Categorize it',
        share: '[es] Share it with my accountant',
        nothing: '[es] Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: '[es] Teachers Unite',
        joinExpensifyOrg:
            '[es] Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: '[es] I know a teacher',
        iAmATeacher: '[es] I am a teacher',
        personalKarma: {
            title: '[es] Enable Personal Karma',
            description: '[es] Donate $1 to Expensify.org for every $500 you spend each month',
            stopDonationsPrompt: '[es] Are you sure you want to stop donating to Expensify.org?',
        },
        getInTouch: '[es] Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: '[es] Intro to your school principal',
        schoolPrincipalVerifyExpense:
            '[es] Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: '[es] Principal first name',
        principalLastName: '[es] Principal last name',
        principalWorkEmail: '[es] Principal work email',
        updateYourEmail: '[es] Update your email address',
        updateEmail: '[es] Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `[es] Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: '[es] Enter a valid email or phone number',
            enterEmail: '[es] Enter an email',
            enterValidEmail: '[es] Enter a valid email',
            tryDifferentEmail: '[es] Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: '[es] Not activated',
        outOfPocket: '[es] Reimbursable',
        companySpend: '[es] Non-reimbursable',
        personalCard: '[es] Personal card',
        companyCard: '[es] Company card',
        expensifyCard: '[es] Expensify Card',
        travelInvoicing: '[es] Travel invoicing',
        travelCard: '[es] Travel Card',
    },
    distance: {
        addStop: '[es] Add stop',
        address: '[es] Address',
        waypointDescription: {
            start: '[es] Start',
            stop: '[es] Stop',
        },
        mapPending: {
            title: '[es] Map pending',
            subtitle: '[es] The map will be generated when you go back online',
            onlineSubtitle: '[es] One moment while we set up the map',
            errorTitle: '[es] Map error',
            errorSubtitle: '[es] There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: '[es] Please select a suggested address or use current location',
        },
        odometer: {
            startReading: '[es] Start reading',
            endReading: '[es] End reading',
            saveForLater: '[es] Save for later',
            totalDistance: '[es] Total distance',
            startTitle: '[es] Odometer start photo',
            endTitle: '[es] Odometer end photo',
            deleteOdometerPhoto: '[es] Delete odometer photo',
            deleteOdometerPhotoConfirmation: '[es] Are you sure you want to delete this odometer photo?',
            startMessageWeb: '[es] Add a photo of your odometer from the <strong>start</strong> of your trip. Drag a file here or choose one to upload.',
            endMessageWeb: '[es] Add a photo of your odometer from the <strong>end</strong> of your trip. Drag a file here or choose one to upload.',
            cameraAccessRequired: '[es] Camera access is required to take pictures.',
            snapPhotoStart: '[es] <muted-text-label>Snap a photo of your odometer at the <strong>start</strong> of your trip.</muted-text-label>',
            snapPhotoEnd: '[es] <muted-text-label>Snap a photo of your odometer at the <strong>end</strong> of your trip.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '[es] Failed to start location tracking.',
            failedToGetPermissions: '[es] Failed to get required location permissions.',
        },
        trackingDistance: '[es] Tracking distance...',
        stopped: '[es] Stopped',
        start: '[es] Start',
        stop: '[es] Stop',
        save: '[es] Save',
        resume: '[es] Resume',
        discard: '[es] Discard',
        discardDistanceTrackingModal: {
            title: '[es] Discard distance tracking',
            prompt: "[es] Are you sure? This will discard your current journey and can't be undone.",
            confirm: '[es] Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "[es] Can't create expense",
            prompt: "[es] You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: '[es] Location access required',
            prompt: '[es] Please allow location access in your device settings to start GPS distance tracking.',
            allow: '[es] Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: '[es] Background location access required',
            prompt: '[es] Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: '[es] Precise location required',
            prompt: '[es] Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: '[es] Track distance on your phone',
            subtitle: '[es] Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: '[es] Download the app',
        },
        notification: {
            title: '[es] GPS tracking in progress',
            body: '[es] Go to the app to finish',
        },
        continueGpsTripModal: {
            title: '[es] Continue GPS trip recording?',
            prompt: '[es] Looks like the app closed during your last GPS trip. Would you like to continue recording from that trip?',
            confirm: '[es] Continue trip',
            cancel: '[es] View trip',
        },
        signOutWarningTripInProgress: {
            title: '[es] GPS tracking in progress',
            prompt: '[es] Are you sure you want to discard the trip and sign out?',
            confirm: '[es] Discard and sign out',
        },
        switchToODWarningTripInProgress: {
            title: '[es] GPS tracking in progress',
            prompt: '[es] Are you sure you want to stop GPS tracking and switch to Expensify Classic?',
            confirm: '[es] Stop and switch',
        },
        switchAccountWarningTripInProgress: {
            title: '[es] GPS tracking in progress',
            prompt: '[es] Are you sure you want to stop GPS tracking and switch accounts?',
            confirm: '[es] Stop and switch',
        },
        locationServicesRequiredModal: {
            title: '[es] Location access required',
            confirm: '[es] Open settings',
            prompt: '[es] Please allow location access in your device settings to start GPS distance tracking.',
        },
        gpsFloatingPillText: '[es] GPS tracking in progress...',
        liveActivity: {
            subtitle: '[es] Tracking distance',
            lockScreenBadgeText: '[es] Distance',
            lockScreenTrackingText: '[es] Tracking...',
            button: '[es] View progress',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '[es] Report card lost or damaged',
        nextButtonLabel: '[es] Next',
        reasonTitle: '[es] Why do you need a new card?',
        cardDamaged: '[es] My card was damaged',
        cardLostOrStolen: '[es] My card was lost or stolen',
        confirmAddressTitle: '[es] Please confirm the mailing address for your new card.',
        cardDamagedInfo: '[es] Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: '[es] Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: '[es] Address',
        deactivateCardButton: '[es] Deactivate card',
        shipNewCardButton: '[es] Ship new card',
        addressError: '[es] Address is required',
        reasonError: '[es] Reason is required',
        successTitle: '[es] Your new card is on the way!',
        successDescription: "[es] You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: '[es] Guaranteed eReceipt',
        transactionDate: '[es] Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '[es] Start a chat, <success><strong>refer a friend</strong></success>.',
            header: '[es] Start a chat, refer a friend',
            closeAccessibilityLabel: '[es] Close, start a chat, refer a friend, banner',
            body: "[es] Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '[es] Submit an expense, <success><strong>refer your team</strong></success>.',
            header: '[es] Submit an expense, refer your team',
            closeAccessibilityLabel: '[es] Close, submit an expense, refer your team, banner',
            body: "[es] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '[es] Refer a friend',
            body: "[es] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '[es] Refer a friend',
            header: '[es] Refer a friend',
            body: "[es] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: '[es] Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `[es] Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `[es] Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: '[es] All tags required',
        autoReportedRejectedExpense: '[es] This expense was rejected.',
        billableExpense: '[es] Billable no longer valid',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `[es] Receipt required${formattedLimit ? `[es]  over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '[es] Category no longer valid',
        conversionSurcharge: (surcharge: number) => `[es] Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: '[es] Rate not valid for this workspace',
        duplicatedTransaction: '[es] Potential duplicate',
        fieldRequired: '[es] Report fields are required',
        futureDate: '[es] Future date not allowed',
        invoiceMarkup: (invoiceMarkup: number) => `[es] Marked up by ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `[es] Date older than ${maxAge} days`,
        missingCategory: '[es] Missing category',
        missingComment: '[es] Description required for selected category',
        missingAttendees: '[es] Multiple attendees required for this category',
        missingTag: (tagName?: string) => `[es] Missing ${tagName ?? '[es] tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '[es] Amount differs from calculated distance';
                case 'card':
                    return '[es] Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `[es] Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return '[es] Amount greater than scanned receipt';
            }
        },
        modifiedDate: '[es] Date differs from scanned receipt',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `[es] Distance exceeds the calculated route of ${formattedRouteDistance}` : '[es] Distance exceeds the calculated route',
        nonExpensiworksExpense: '[es] Non-Expensiworks expense',
        overAutoApprovalLimit: (formattedLimit: string) => `[es] Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `[es] Amount over ${formattedLimit}/person category limit`,
        overLimit: (formattedLimit: string) => `[es] Amount over ${formattedLimit}/person limit`,
        overTripLimit: (formattedLimit: string) => `[es] Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: (formattedLimit: string) => `[es] Amount over ${formattedLimit}/person limit`,
        perDayLimit: (formattedLimit: string) => `[es] Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: '[es] Receipt and expense details added manually.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `[es] Receipt required over ${formattedLimit} category limit`;
            }
            if (formattedLimit) {
                return `[es] Receipt required over ${formattedLimit}`;
            }
            if (category) {
                return `[es] Receipt required over category limit`;
            }
            return '[es] Receipt required';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `[es] Itemized receipt required${formattedLimit ? `[es]  over ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '[es] Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `[es] alcohol`;
                    case 'gambling':
                        return `[es] gambling`;
                    case 'tobacco':
                        return `[es] tobacco`;
                    case 'adultEntertainment':
                        return `[es] adult entertainment`;
                    case 'hotelIncidentals':
                        return `[es] hotel incidentals`;
                    case 'giftCard':
                        return `[es] gift card purchases`;
                    case 'handwrittenReceipt':
                        return `[es] handwritten receipts`;
                    default:
                        return `${prohibitedExpenseType}`;
                }
            };
            let types: string[] = [];
            if (Array.isArray(prohibitedExpenseTypes)) {
                types = prohibitedExpenseTypes;
            } else if (prohibitedExpenseTypes) {
                types = [prohibitedExpenseTypes];
            }
            if (types.length === 0) {
                return preMessage;
            }
            return `${preMessage} ${types.map(getProhibitedExpenseTypeText).join(', ')}`;
        },
        customRules: (message: string) => message,
        reviewRequired: '[es] Review required',
        rter: (
            brokenBankConnection: boolean,
            isAdmin: boolean,
            isTransactionOlderThan7Days: boolean,
            member?: string,
            rterType?: ValueOf<typeof CONST.RTER_VIOLATION_TYPES>,
            companyCardPageURL?: string,
            connectionLink?: string,
            isPersonalCard?: boolean,
            isMarkAsCash?: boolean,
        ) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return "[es] Can't auto-match receipt due to broken bank connection.";
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return "[es] Can't auto-match receipt due to broken bank connection.";
                }
                return isMarkAsCash
                    ? `[es] Can't auto-match receipt due to broken card connection. Mark as cash to ignore, or <a href="${connectionLink}">fix the card</a> to match the receipt.`
                    : `[es] Can't auto-match receipt due to broken card connection. <a href="${connectionLink}">Fix the card</a> to match the receipt.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `[es] Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : '[es] Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `[es] Ask ${member} to mark as a cash or wait 7 days and try again` : '[es] Awaiting merge with card transaction.';
            }
            return '';
        },
        brokenConnection530Error: '[es] Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `[es] <muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: '[es] Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: '[es] Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true, missingFields = []}: {canEdit?: boolean; missingFields?: string[]}) => {
            if (missingFields.length > 0) {
                const fieldNames: Record<string, string> = {merchant: '[es] merchant', date: '[es] date', amount: '[es] amount'};
                const translated = missingFields.map((f) => fieldNames[f] ?? f);
                let fieldList = '';
                if (translated.length === 1) {
                    fieldList = translated.at(0) ?? '';
                } else if (translated.length === 2) {
                    fieldList = translated.join('[es]  and ');
                } else {
                    fieldList = `${translated.slice(0, translated.length - 1).join(', ')}, and ${translated.at(-1)}`;
                }
                return `[es] Receipt scanning failed — missing ${fieldList}.${canEdit ? '[es]  Enter details manually.' : ''}`;
            }
            return `[es] Receipt scanning failed.${canEdit ? '[es]  Enter details manually.' : ''}`;
        },
        receiptGeneratedWithAI: '[es] Potential AI-generated receipt',
        someTagLevelsRequired: (tagName?: string) => `[es] Missing ${tagName ?? '[es] Tag'}`,
        tagOutOfPolicy: (tagName?: string) => `[es] ${tagName ?? '[es] Tag'} no longer valid`,
        taxAmountChanged: '[es] Tax amount was modified',
        taxOutOfPolicy: (taxName?: string) => `[es] ${taxName ?? '[es] Tax'} no longer valid`,
        taxRateChanged: '[es] Tax rate was modified',
        taxRequired: '[es] Missing tax rate',
        none: '[es] None',
        taxCodeToKeep: '[es] Choose which tax code to keep',
        tagToKeep: '[es] Choose which tag to keep',
        isTransactionReimbursable: '[es] Choose if transaction is reimbursable',
        merchantToKeep: '[es] Choose which merchant to keep',
        descriptionToKeep: '[es] Choose which description to keep',
        categoryToKeep: '[es] Choose which category to keep',
        isTransactionBillable: '[es] Choose if transaction is billable',
        keepThisOne: '[es] Keep this one',
        confirmDetails: `[es] Confirm the details you're keeping`,
        confirmDuplicatesInfo: `[es] The duplicates you don't keep will be held for the submitter to delete.`,
        hold: '[es] This expense was put on hold',
        resolvedDuplicates: '[es] resolved the duplicate',
        companyCardRequired: '[es] Company card purchases required',
        noRoute: '[es] Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `[es] ${fieldName} is required`,
        reportContainsExpensesWithViolations: '[es] Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: '[es] marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: '[es] resolved the duplicate',
        },
    },
    videoPlayer: {
        play: '[es] Play',
        pause: '[es] Pause',
        fullscreen: '[es] Fullscreen',
        playbackSpeed: '[es] Playback speed',
        expand: '[es] Expand',
        mute: '[es] Mute',
        unmute: '[es] Unmute',
        normal: '[es] Normal',
    },
    exitSurvey: {
        header: '[es] Before you go',
        reasonPage: {
            title: "[es] Please tell us why you're leaving",
            subtitle: '[es] Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[es] I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "[es] I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[es] I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[es] What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '[es] What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[es] Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: '[es] Your response',
        thankYou: '[es] Thanks for the feedback!',
        thankYouSubtitle: '[es] Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: '[es] Switch to Expensify Classic',
        offlineTitle: "[es] Looks like you're stuck here...",
        offline:
            "[es] You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: '[es] Quick tip...',
        quickTipSubTitle: '[es] You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: '[es] Book a call',
        bookACallTitle: '[es] Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '[es] Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '[es] Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '[es] Travel and expense at the speed of chat',
        },
        bookACallTextTop: '[es] By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: '[es] We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: '[es] Take me to Expensify Classic',
        goBackJustOnce: '[es] Go back just once',
    },
    listBoundary: {
        errorMessage: '[es] An error occurred while loading more messages',
        tryAgain: '[es] Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: '[es] matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: '[es] Authenticate payment card',
        mobileReducedFunctionalityMessage: '[es] You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `[es] Free trial: ${numOfDays} ${numOfDays === 1 ? '[es] day' : '[es] days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '[es] Your payment info is outdated',
                subtitle: (date: string) => `[es] Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '[es] Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `[es] Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : '[es] Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: '[es] Your payment info is outdated',
                subtitle: (date: string) => `[es] Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '[es] Your payment info is outdated',
                subtitle: '[es] Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: '[es] Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `[es] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: '[es] Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `[es] Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: '[es] Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `[es] Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: '[es] Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `[es] Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: '[es] Your card is expiring soon',
                subtitle: '[es] Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: '[es] Success!',
                subtitle: '[es] Your card has been billed successfully.',
            },
            retryBillingError: {
                title: '[es] Your card couldn’t be charged',
                subtitle: '[es] Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `[es] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '[es] Start a free trial',
                subtitle: '[es] As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: (numOfDays: number) => `[es] Trial: ${numOfDays} ${numOfDays === 1 ? '[es] day' : '[es] days'} left!`,
                subtitle: '[es] Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: '[es] Your free trial has ended',
                subtitle: '[es] Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: '[es] Claim offer',
                subscriptionPageTitle: (discountType: number) => `[es] <strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `[es] Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `[es] Claim within ${days > 0 ? `[es] ${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '[es] Payment',
            subtitle: '[es] Add a card to pay for your Expensify subscription.',
            addCardButton: '[es] Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `[es] Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `[es] Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `[es] Card ending in ${cardNumber}`,
            changeCard: '[es] Change payment card',
            changeCurrency: '[es] Change payment currency',
            cardNotFound: '[es] No payment card added',
            retryPaymentButton: '[es] Retry payment',
            authenticatePayment: '[es] Authenticate payment',
            requestRefund: '[es] Request refund',
            requestRefundModal: {
                full: '[es] Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: '[es] Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: '[es] View payment history',
        },
        yourPlan: {
            title: '[es] Your plan',
            exploreAllPlans: '[es] Explore all plans',
            customPricing: '[es] Custom pricing',
            asLowAs: (price: string) => `[es] as low as ${price} per active member/month`,
            pricePerMemberMonth: (price: string) => `[es] ${price} per member/month`,
            pricePerMemberPerMonth: (price: string) => `[es] ${price} per member per month`,
            perMemberMonth: '[es] per member/month',
            collect: {
                title: '[es] Collect',
                description: '[es] The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[es] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[es] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[es] Receipt scanning',
                benefit2: '[es] Reimbursements',
                benefit3: '[es] Corporate card management',
                benefit4: '[es] Expense and travel approvals',
                benefit5: '[es] Travel booking and rules',
                benefit6: '[es] QuickBooks/Xero integrations',
                benefit7: '[es] Chat on expenses, reports, and rooms',
                benefit8: '[es] AI and human support',
            },
            control: {
                title: '[es] Control',
                description: '[es] Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[es] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[es] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[es] Everything in the Collect plan',
                benefit2: '[es] Multi-level approval workflows',
                benefit3: '[es] Custom expense rules',
                benefit4: '[es] ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: '[es] HR integrations (Workday, Certinia)',
                benefit6: '[es] SAML/SSO',
                benefit7: '[es] Custom insights and reporting',
                benefit8: '[es] Budgeting',
            },
            thisIsYourCurrentPlan: '[es] This is your current plan',
            downgrade: '[es] Downgrade to Collect',
            upgrade: '[es] Upgrade to Control',
            addMembers: '[es] Add members',
            saveWithExpensifyTitle: '[es] Save with the Expensify Card',
            saveWithExpensifyDescription: '[es] Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: '[es] Learn more',
        },
        compareModal: {
            comparePlans: '[es] Compare Plans',
            subtitle: `[es] <muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: '[es] Subscription details',
            annual: '[es] Annual subscription',
            creditBalance: '[es] Credit balance',
            taxExempt: '[es] Request tax exempt status',
            taxExemptEnabled: '[es] Tax exempt',
            taxExemptStatus: '[es] Tax exempt status',
            payPerUse: '[es] Pay-per-use',
            subscriptionSize: '[es] Subscription size',
            headsUp:
                "[es] Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: '[es] Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: '[es] Subscription size',
            yourSize: '[es] Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                '[es] Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: '[es] Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: '[es] Confirm your new annual subscription details:',
            subscriptionSize: '[es] Subscription size',
            activeMembers: (size: number) => `[es] ${size} active members/month`,
            subscriptionRenews: '[es] Subscription renews',
            youCantDowngrade: '[es] You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: (size: number, date: string) =>
                `[es] You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: '[es] Please enter a valid subscription size',
                sameSize: '[es] Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: '[es] Add payment card',
            enterPaymentCardDetails: '[es] Enter your payment card details',
            security: '[es] Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: '[es] Learn more about our security.',
        },
        expensifyCode: {
            title: '[es] Expensify code',
            discountCode: '[es] Discount code',
            enterCode: '[es] Enter an Expensify code to apply to your subscription.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `[es] You will get a ${promoDiscount}% discount on your next ${validBillingCycles ? `${validBillingCycles} ` : ''}billing charges.`,
            apply: '[es] Apply',
            error: {
                invalid: '[es] This code is invalid',
            },
        },
        subscriptionSettings: {
            title: '[es] Subscription settings',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `[es] Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}${expensifyCode ? `[es] , Expensify code: ${expensifyCode}` : ''}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: '[es] none',
            on: '[es] on',
            off: '[es] off',
            annual: '[es] Annual',
            autoRenew: '[es] Auto-renew',
            autoIncrease: '[es] Auto-increase annual seats',
            saveUpTo: (amountWithCurrency: string) => `[es] Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                '[es] Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: '[es] Disable auto-renew',
            helpUsImprove: '[es] Help us improve Expensify',
            whatsMainReason: "[es] What's the main reason you're disabling auto-renew?",
            renewsOn: (date: string) => `[es] Renews on ${date}.`,
            pricingConfiguration: '[es] Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `[es] <muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `[es] <a href="adminsRoom">#admins room.</a>` : '[es] #admins room.'}</muted-text>`,
            estimatedPrice: '[es] Estimated price',
            changesBasedOn: '[es] This changes based on your Expensify Card usage and the subscription options below.',
            collectBillingDescription: '[es] Collect workspaces are billed monthly per member, with no annual commitment.',
            pricing: '[es] Pricing',
        },
        cancelSubscription: {
            title: '[es] Cancel subscription',
            subtitle: '[es] What’s the main reason you’re canceling your subscription?',
            subscriptionCanceled: {
                title: '[es] Subscription canceled',
                subtitle: '[es] Your annual subscription has been canceled.',
                info: '[es] If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `[es] If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: '[es] Request submitted',
                subtitle:
                    '[es] Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `[es] By requesting cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: '[es] Functionality needs improvement',
        tooExpensive: '[es] Too expensive',
        inadequateSupport: '[es] Inadequate customer support',
        businessClosing: '[es] Company closing, downsizing, or acquired',
        additionalInfoTitle: '[es] What software are you moving to and why?',
        additionalInfoInputLabel: '[es] Your response',
    },
    roomChangeLog: {
        updateRoomDescription: '[es] set the room description to:',
        clearRoomDescription: '[es] cleared the room description',
        changedRoomAvatar: '[es] changed the room avatar',
        removedRoomAvatar: '[es] removed the room avatar',
    },
    delegate: {
        switchAccount: '[es] Switch accounts:',
        switch: '[es] Switch',
        copilot: '[es] Copilot',
        copilotDelegatedAccess: '[es] Copilot: Delegated access',
        copilotDelegatedAccessDescription: '[es] Allow other members to access your account.',
        learnMoreAboutDelegatedAccess: '[es] Learn more about delegated access',
        addCopilot: '[es] Add a copilot to your account',
        membersCanAccessYourAccount: '[es] These members can access your account:',
        youCanAccessTheseAccounts: '[es] You can access these accounts:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[es] Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[es] Limited';
                default:
                    return '';
            }
        },
        genericError: '[es] Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `[es] on behalf of ${delegator}`,
        accessLevel: '[es] Access level',
        confirmCopilot: '[es] Confirm your copilot below.',
        accessLevelDescription: '[es] Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[es] Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[es] Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: '[es] Remove copilot',
        removeCopilotConfirmation: '[es] Are you sure you want to remove this copilot?',
        changeAccessLevel: '[es] Change access level',
        makeSureItIsYou: "[es] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[es] Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `[es] Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '[es] Not so fast...',
        noAccessMessage: dedent(`
            [es] As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `[es] As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: '[es] Copilot access',
    },
    debug: {
        debug: '[es] Debug',
        details: '[es] Details',
        JSON: '[es] JSON',
        reportActions: '[es] Actions',
        reportActionPreview: '[es] Preview',
        nothingToPreview: '[es] Nothing to preview',
        editJson: '[es] Edit JSON:',
        preview: '[es] Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `[es] Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `[es] Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `[es] Invalid value - Expected: ${expectedValues}`,
        missingValue: '[es] Missing value',
        createReportAction: '[es] Create Report Action',
        reportAction: '[es] Report Action',
        report: '[es] Report',
        transaction: '[es] Transaction',
        violations: '[es] Violations',
        transactionViolation: '[es] Transaction Violation',
        hint: "[es] Data changes won't be sent to the backend",
        textFields: '[es] Text fields',
        numberFields: '[es] Number fields',
        booleanFields: '[es] Boolean fields',
        constantFields: '[es] Constant fields',
        dateTimeFields: '[es] DateTime fields',
        date: '[es] Date',
        time: '[es] Time',
        none: '[es] None',
        visibleInLHN: '[es] Visible in LHN',
        GBR: '[es] GBR',
        RBR: '[es] RBR',
        true: '[es] true',
        false: '[es] false',
        viewReport: '[es] View Report',
        viewTransaction: '[es] View transaction',
        createTransactionViolation: '[es] Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: '[es] Has draft comment',
            hasGBR: '[es] Has GBR',
            hasRBR: '[es] Has RBR',
            pinnedByUser: '[es] Pinned by member',
            hasIOUViolations: '[es] Has IOU violations',
            hasAddWorkspaceRoomErrors: '[es] Has add workspace room errors',
            isUnread: '[es] Is unread (focus mode)',
            isArchived: '[es] Is archived (most recent mode)',
            isSelfDM: '[es] Is self DM',
            isFocused: '[es] Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: '[es] Has join request (admin room)',
            isUnreadWithMention: '[es] Is unread with mention',
            isWaitingForAssigneeToCompleteAction: '[es] Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: '[es] Has child report awaiting action',
            hasMissingInvoiceBankAccount: '[es] Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: '[es] Has unresolved card fraud alert',
            hasDEWApproveFailed: '[es] Has DEW approve failed',
        },
        reasonRBR: {
            hasErrors: '[es] Has errors in report or report actions data',
            hasViolations: '[es] Has violations',
            hasTransactionThreadViolations: '[es] Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "[es] There's a report awaiting action",
            theresAReportWithErrors: "[es] There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "[es] There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "[es] There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: '[es] There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "[es] There's a problem with a contact method",
            aContactMethodRequiresVerification: '[es] A contact method requires verification',
            theresAProblemWithAPaymentMethod: "[es] There's a problem with a payment method",
            theresAProblemWithAWorkspace: "[es] There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "[es] There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "[es] There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: '[es] Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: '[es] There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "[es] There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "[es] There's a problem with your wallet terms",
            aBankAccountIsLocked: '[es] A bank account is locked',
        },
    },
    emptySearchView: {
        takeATestDrive: '[es] Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: '[es] Welcome to New Expensify!',
        subtitle: "[es] It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "[es] Let's go!",
        helpText: '[es] Try 2-min demo',
        features: {
            search: '[es] More powerful search on mobile, web, and desktop',
            concierge: '[es] Built-in Concierge AI to help automate your expenses',
            chat: '[es] Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '[es] <tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '[es] <tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '[es] <tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        outstandingFilter: '[es] <tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '[es] <tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "[es] <tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
        hasFilterNegation: '[es] <tooltip>Search for expenses without receipts using <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '[es] Discard changes?',
        body: '[es] Are you sure you want to discard the changes you made?',
        confirmText: '[es] Discard changes',
    },
    scheduledCall: {
        book: {
            title: '[es] Schedule call',
            description: '[es] Find a time that works for you.',
            slots: ({date}: {date: string}) => `[es] <muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '[es] Confirm call',
            description: "[es] Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: '[es] Your setup specialist',
            meetingLength: '[es] Meeting length',
            dateTime: '[es] Date & time',
            minutes: '[es] 30 minutes',
        },
        callScheduled: '[es] Call scheduled',
    },
    autoSubmitModal: {
        title: '[es] All clear and submitted!',
        description: '[es] All warnings and violations has been cleared so:',
        submittedExpensesTitle: '[es] These expenses have been submitted',
        submittedExpensesDescription: '[es] These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: '[es] Pending expenses have been moved',
        pendingExpensesDescription: '[es] Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '[es] Take a 2-minute test drive',
        },
        modal: {
            title: '[es] Take us for a test drive',
            description: '[es] Take a quick product tour to get up to speed fast.',
            confirmText: '[es] Start test drive',
            helpText: '[es] Skip',
            employee: {
                description: '[es] <muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "[es] Enter your boss's email",
                error: '[es] That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "[es] You're currently test driving Expensify",
            readyForTheRealThing: '[es] Ready for the real thing?',
            getStarted: '[es] Get started',
        },
        employeeInviteMessage: (name: string) => `[es] # ${name} invited you to test drive Expensify
Hey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.

Here’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: '[es] Basic export',
        reportLevelExport: '[es] All Data - report level',
        expenseLevelExport: '[es] All Data - expense level',
        exportInProgress: '[es] Export in progress',
        conciergeWillSend: '[es] Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: '[es] Not verified',
        retry: '[es] Retry',
        verifyDomain: {
            title: '[es] Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `[es] Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `[es] Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: '[es] Add the following TXT record:',
            saveChanges: '[es] Save changes and return here to verify your domain.',
            youMayNeedToConsult: `[es] You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: '[es] After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: '[es] Couldn’t fetch verification code',
            genericError: "[es] We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: '[es] Domain verified',
            header: '[es] Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `[es] <muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: '[es] SAML',
        samlFeatureList: {
            title: '[es] SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `[es] <muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: '[es] Faster and easier login',
            moreSecurityAndControl: '[es] More security and control',
            onePasswordForAnything: '[es] One password for everything',
        },
        goToDomain: '[es] Go to domain',
        samlLogin: {
            title: '[es] SAML login',
            subtitle: `[es] <muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a>.</muted-text>`,
            enableSamlLogin: '[es] Enable SAML login',
            allowMembers: '[es] Allow members to log in with SAML.',
            requireSamlLogin: '[es] Require SAML login',
            anyMemberWillBeRequired: '[es] Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "[es] Couldn't update SAML enablement setting",
            requireError: "[es] Couldn't update SAML requirement setting",
            disableSamlRequired: '[es] Disable SAML required',
            oktaWarningPrompt: '[es] Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: '[es] Please add Identity Provider metadata below to enable',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `[es] <muted-text>Please disable <a href="${twoFactorAuthSettingsUrl}">force two-factor authentication</a> to enable SAML login.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: '[es] SAML configuration details',
            subtitle: '[es] Use these details to get SAML set up.',
            identityProviderMetadata: '[es] Identity Provider Metadata',
            entityID: '[es] Entity ID',
            nameIDFormat: '[es] Name ID Format',
            loginUrl: '[es] Login URL',
            acsUrl: '[es] ACS (Assertion Consumer Service) URL',
            logoutUrl: '[es] Logout URL',
            sloUrl: '[es] SLO (Single Logout) URL',
            serviceProviderMetaData: '[es] Service Provider MetaData',
            oktaScimToken: '[es] Okta SCIM Token',
            revealToken: '[es] Reveal token',
            fetchError: "[es] Couldn't fetch SAML configuration details",
            setMetadataGenericError: "[es] Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: '[es] Access restricted',
            subtitle: (domainName: string) => `[es] Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: '[es] Company card management',
            accountCreationAndDeletion: '[es] Account creation and deletion',
            workspaceCreation: '[es] Workspace creation',
            samlSSO: '[es] SAML SSO',
        },
        addDomain: {
            title: '[es] Add domain',
            subtitle: '[es] Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: '[es] Domain name',
            newDomain: '[es] New domain',
        },
        domainAdded: {
            title: '[es] Domain added',
            description: "[es] Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: '[es] Configure',
        },
        enhancedSecurity: {
            title: '[es] Enhanced security',
            subtitle: '[es] Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: '[es] Enable',
        },
        domainAdmins: '[es] Domain admins',
        admins: {
            title: '[es] Admins',
            findAdmin: '[es] Find admin',
            primaryContact: '[es] Primary contact',
            addPrimaryContact: '[es] Add primary contact',
            setPrimaryContactError: '[es] Unable to set primary contact. Please try again later.',
            consolidatedDomainBilling: '[es] Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `[es] <comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "[es] Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: '[es] Add admin',
            addAdminError: '[es] Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: '[es] Revoke admin access',
            cantRevokeAdminAccess: "[es] Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: '[es] Unable to remove this user as an Admin. Please try again.',
                removeDomain: '[es] Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: '[es] Please enter your domain name to reset it.',
            },
            resetDomain: '[es] Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `[es] Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: '[es] Enter your domain name here',
            resetDomainInfo: `[es] This action is <strong>permanent</strong> and the following data will be deleted: <br/> <bullet-list><bullet-item>Company card connections and any unreported expenses from those cards</bullet-item><bullet-item>SAML and group settings</bullet-item><bullet-item>Travel data and access to Expensify Travel</bullet-item></bullet-list> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        domainMembers: '[es] Domain members',
        members: {
            title: '[es] Members',
            findMember: '[es] Find member',
            addMember: '[es] Add member',
            emptyMembers: {
                title: '[es] No members in this group',
                subtitle: '[es] Add a member or try changing the filter above.',
            },
            allMembers: '[es] All members',
            email: '[es] Email address',
            closeAccountPrompt: '[es] Are you sure? This action is permanent.',
            forceCloseAccount: () => ({
                one: '[es] Force close account',
                other: '[es] Force close accounts',
            }),
            safeCloseAccount: () => ({
                one: '[es] Close account safely',
                other: '[es] Close accounts safely',
            }),
            closeAccountInfo: () => ({
                one: '[es] We recommend closing the account safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected account.',
                other: '[es] We recommend closing the accounts safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected accounts.',
            }),
            closeAccount: () => ({
                one: '[es] Close account',
                other: '[es] Close accounts',
            }),
            moveToGroup: '[es] Move to group',
            domainGroup: '[es] Domain group',
            chooseWhereToMove: ({count}: {count: number}) => `[es] Choose where to move ${count} ${count === 1 ? '[es] member' : '[es] members'}.`,
            chooseWhereToMoveName: ({name}: {name: string}) => `[es] Choose where to move ${name}.`,
            error: {
                addMember: '[es] Unable to add this member. Please try again.',
                removeMember: '[es] Unable to remove this user. Please try again.',
                moveMember: '[es] Unable to move this member. Please try again.',
                vacationDelegate: '[es] Unable to set this user as a vacation delegate. Please try again.',
                moveMemberNotPolicyAdmin:
                    '[es] Cannot move member to the domain group. You must be a Policy Admin for the Preferred Policy set on the domain group you are trying to move this user to.',
            },
            cannotSetVacationDelegateForMember: (email: string) => `[es] You can't set a vacation delegate for ${email} because they're currently the delegate for the following members:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `[es] Are you sure? This will lock <strong>${email}'s</strong> account. <br /><br /> Our team will then review the account and remove any unauthorized access. To regain access, they'll need to work with Concierge.`,
            reportSuspiciousActivityConfirmationPrompt: '[es] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        },
        common: {
            settings: '[es] Settings',
            forceTwoFactorAuth: '[es] Force two-factor authentication',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `[es] <muted-text>Please disable <a href="${samlPageUrl}">SAML</a> to force two-factor authentication.</muted-text>`,
            forceTwoFactorAuthDescription: `[es] <muted-text>Require two-factor authentication for all members of this domain. Domain members will be prompted to set up two-factor authentication on their account when they sign in.</muted-text>`,
            forceTwoFactorAuthError: "[es] Force two-factor authentication couldn't be changed. Please try again later.",
            resetTwoFactorAuth: '[es] Reset two-factor authentication',
            error: "[es] Couldn't save this change. Please try again.",
        },
        groups: {
            title: '[es] Groups',
            memberCount: () => {
                return {
                    one: '[es] 1 member',
                    other: (count: number) => `[es] ${count} members`,
                };
            },
            defaultGroup: '[es] Default group for new members',
            defaultGroupPrompt: (currentName: string, newName: string) =>
                `[es] Are you sure you want to make ${newName} the default group? New members will be invited to this group instead of the previous default group (${currentName}). `,
            makeDefault: '[es] Make default',
            neverMind: '[es] Never mind',
            createGroupError: '[es] Unable to create this group. Please try again.',
            permissions: '[es] Group permissions',
            createNewGroupButton: '[es] New group',
            createGroupSubmitButton: '[es] Create group',
            expensifyCardPreferredWorkspace: '[es] Expensify Card preferred workspace',
            expensifyCardPreferredWorkspaceDescription:
                '[es] All Expensify Card transactions will be created on the Expensify Card Preferred Workspace instead of the Preferred Workspace. Enabling this feature will override the Preferred Workspace setting for Expensify Card transactions only.',
            strictlyEnforceWorkspaceRules: '[es] Strictly enforce workspace rules',
            strictlyEnforceWorkspaceRulesDescription: '[es] All workspace rules must be met before submitting a report. No manual exceptions allowed.',
            restrictExpenseWorkspaceCreation: '[es] Restrict expense workspace creation/removal',
            restrictExpenseWorkspaceCreationDescription:
                '[es] Prevent members from being able to create an expense workspace or remove themselves from an expense workspace. This is useful for preventing people from using Expensify to submit reports for use outside your domain when combined with strict workspace enforcement.',
            deleteGroup: '[es] Delete Group',
            deleteGroupDangerConfirmationModal: '[es] Delete Group',
            deleteGroupDangerConfirmationModalDescription: (defaultGroupName: string) =>
                `[es] Are you sure? This will reassign all members to the default group (${defaultGroupName}) and can't be undone.`,
            deleteGroupError: '[es] Unable to delete this group. Please try again.',
            preferredWorkspace: '[es] Preferred Workspace',
            preferredWorkspaceDescription: (enabled: boolean) => `[es] All new reports and expenses will be created on ${enabled ? '[es] selected preferred' : '[es] this'} workspace.`,
            preferredWorkspaceSelectDescription: '[es] All new expenses and reports will be created on this workspace.',
            noWorkspacesMessage: '[es] There are no workspaces on this domain. A workspace is required to enable this restriction.',
            restrictDefaultLoginSelection: '[es] Restrict default login selection',
            restrictDefaultLoginSelectionDescription: '[es] Prevent members from changing their login email away from their company domain to avoid policy restrictions.',
            expensifyCardPreferredWorkspaceDisabledMessage: '[es] To enable this setting, please first enable a preferred workspace and set up Expensify Cards on your domain.',
            findGroup: '[es] Find group',
        },
    },
};
export default translations;
