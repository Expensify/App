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
    AddBudgetParams,
    AddedOrDeletedPolicyReportFieldParams,
    AddOrDeletePolicyCustomUnitRateParams,
    ChangeFieldParams,
    ConciergeBrokenCardConnectionParams,
    ConnectionNameParams,
    CreatedReportForUnapprovedTransactionsParams,
    DelegateRoleParams,
    DeleteActionParams,
    DeleteBudgetParams,
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
    UpdatedBudgetParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    UpdatedPolicyCurrencyDefaultTaxParams,
    UpdatedPolicyCustomTaxNameParams,
    UpdatedPolicyForeignCurrencyDefaultTaxParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdatePolicyCustomUnitDefaultCategoryParams,
    UpdatePolicyCustomUnitParams,
    UpdateRoleParams,
    UserIsAlreadyMemberParams,
    ViolationsIncreasedDistanceParams,
    ViolationsMissingTagParams,
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
        count: '[ja][ctx: Used as a noun meaning a numerical total or quantity, not the verb “to count.”] Count',
        cancel: '[ja] Cancel',
        dismiss: '[ja][ctx: Refers to closing or hiding a notification or message, not rejecting or ignoring something.] Dismiss',
        proceed: '[ja][ctx: Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”] Proceed',
        unshare: '[ja] Unshare',
        yes: '[ja] Yes',
        no: '[ja] No',
        ok: '[ja][ctx: Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.] OK',
        notNow: '[ja] Not now',
        noThanks: '[ja] No thanks',
        learnMore: '[ja] Learn more',
        buttonConfirm: '[ja] Got it',
        name: '[ja] Name',
        attachment: '[ja] Attachment',
        attachments: '[ja] Attachments',
        center: '[ja] Center',
        from: '[ja] From',
        to: '[ja] To',
        in: '[ja] In',
        optional: '[ja] Optional',
        new: '[ja] New',
        newFeature: '[ja] New feature',
        search: '[ja] Search',
        reports: '[ja] Reports',
        spend: '[ja] Spend',
        find: '[ja] Find',
        searchWithThreeDots: '[ja] Search...',
        next: '[ja] Next',
        previous: '[ja] Previous',
        previousMonth: '[ja] Previous month',
        nextMonth: '[ja] Next month',
        previousYear: '[ja] Previous year',
        nextYear: '[ja] Next year',
        goBack: '[ja][ctx: Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.] Go back',
        create: '[ja] Create',
        add: '[ja] Add',
        resend: '[ja] Resend',
        save: '[ja] Save',
        select: '[ja] Select',
        deselect: '[ja] Deselect',
        selectMultiple: '[ja][ctx: Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.] Select multiple',
        saveChanges: '[ja] Save changes',
        submit: '[ja] Submit',
        submitted: '[ja][ctx: Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”] Submitted',
        rotate: '[ja] Rotate',
        zoom: '[ja] Zoom',
        password: '[ja] Password',
        magicCode: '[ja] Magic code',
        digits: '[ja] digits',
        twoFactorCode: '[ja] Two-factor code',
        workspaces: '[ja] Workspaces',
        home: '[ja] Home',
        inbox: '[ja] Inbox',
        yourReviewIsRequired: '[ja] Your review is required',
        actionBadge: {
            submit: '[ja] Submit',
            approve: '[ja] Approve',
            pay: '[ja] Pay',
            fix: '[ja] Fix',
        },
        success: '[ja][ctx: Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”] Success',
        group: '[ja] Group',
        profile: '[ja] Profile',
        referral: '[ja] Referral',
        payments: '[ja] Payments',
        approvals: '[ja] Approvals',
        wallet: '[ja] Wallet',
        preferences: '[ja] Preferences',
        view: '[ja] View',
        review: (amount?: string) => `[ja] Review${amount ? ` ${amount}` : ''}`,
        not: '[ja] Not',
        signIn: '[ja] Sign in',
        signInWithGoogle: '[ja] Sign in with Google',
        signInWithApple: '[ja] Sign in with Apple',
        signInWith: '[ja] Sign in with',
        continue: '[ja] Continue',
        firstName: '[ja] First name',
        lastName: '[ja] Last name',
        scanning: '[ja] Scanning',
        analyzing: '[ja] Analyzing...',
        thinking: '[ja] Concierge is thinking...',
        addCardTermsOfService: '[ja] Expensify Terms of Service',
        perPerson: '[ja] per person',
        phone: '[ja] Phone',
        phoneNumber: '[ja] Phone number',
        phoneNumberPlaceholder: '[ja] (xxx) xxx-xxxx',
        email: '[ja] Email',
        and: '[ja] and',
        or: '[ja] or',
        details: '[ja] Details',
        privacy: '[ja] Privacy',
        privacyPolicy: '[ja] Privacy Policy',
        hidden: '[ja] Hidden',
        visible: '[ja] Visible',
        delete: '[ja] Delete',
        archived: '[ja][ctx: UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.] archived',
        contacts: '[ja] Contacts',
        recents: '[ja] Recents',
        close: '[ja] Close',
        comment: '[ja] Comment',
        download: '[ja] Download',
        downloading: '[ja] Downloading',
        uploading: '[ja][ctx: Indicates that a file is currently being uploaded (sent to the server), not downloaded.] Uploading',
        pin: '[ja][ctx: as a verb, not a noun] Pin',
        unPin: '[ja] Unpin',
        back: '[ja] Back',
        saveAndContinue: '[ja] Save & continue',
        settings: '[ja] Settings',
        termsOfService: '[ja] Terms of Service',
        members: '[ja] Members',
        invite: '[ja] Invite',
        here: '[ja] here',
        date: '[ja] Date',
        dob: '[ja] Date of birth',
        currentYear: '[ja] Current year',
        currentMonth: '[ja] Current month',
        ssnLast4: '[ja] Last 4 digits of SSN',
        ssnFull9: '[ja] Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `[ja] Address line ${lineNumber}`,
        personalAddress: '[ja] Personal address',
        companyAddress: '[ja] Company address',
        noPO: '[ja] No PO boxes or mail-drop addresses, please.',
        city: '[ja] City',
        state: '[ja] State',
        streetAddress: '[ja] Street address',
        stateOrProvince: '[ja] State / Province',
        country: '[ja] Country',
        zip: '[ja] Zip code',
        zipPostCode: '[ja] Zip / Postcode',
        whatThis: "[ja] What's this?",
        iAcceptThe: '[ja] I accept the ',
        acceptTermsAndPrivacy: `[ja] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `[ja] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `[ja] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: "[ja] You can't export an empty report.",
            other: () => `[ja] You can't export empty reports.`,
        }),
        remove: '[ja] Remove',
        admin: '[ja] Admin',
        owner: '[ja] Owner',
        dateFormat: '[ja] YYYY-MM-DD',
        send: '[ja] Send',
        na: '[ja] N/A',
        noResultsFound: '[ja] No results found',
        noResultsFoundMatching: (searchString: string) => `[ja] No results found matching "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `[ja] Suggestions available for "${searchString}".` : '[ja] Suggestions available.'),
        recentDestinations: '[ja] Recent destinations',
        timePrefix: "[ja] It's",
        conjunctionFor: '[ja] for',
        todayAt: '[ja] Today at',
        tomorrowAt: '[ja] Tomorrow at',
        yesterdayAt: '[ja] Yesterday at',
        conjunctionAt: '[ja] at',
        conjunctionTo: '[ja] to',
        genericErrorMessage: '[ja] Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: '[ja] Percentage',
        progressBarLabel: '[ja] Onboarding progress',
        converted: '[ja] Converted',
        error: {
            invalidAmount: '[ja] Invalid amount',
            acceptTerms: '[ja] You must accept the Terms of Service to continue',
            phoneNumber: `[ja] Please enter a complete phone number
(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '[ja] This field is required',
            requestModified: '[ja] This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `[ja] Character limit exceeded (${length}/${limit})`,
            dateInvalid: '[ja] Please select a valid date',
            invalidDateShouldBeFuture: '[ja] Please choose today or a future date',
            invalidTimeShouldBeFuture: '[ja] Please choose a time at least one minute ahead',
            invalidCharacter: '[ja] Invalid character',
            enterMerchant: '[ja] Enter a merchant name',
            enterAmount: '[ja] Enter an amount',
            missingMerchantName: '[ja] Missing merchant name',
            missingAmount: '[ja] Missing amount',
            missingDate: '[ja] Missing date',
            enterDate: '[ja] Enter a date',
            invalidTimeRange: '[ja] Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: '[ja] Please complete the form above to continue',
            pleaseSelectOne: '[ja] Please select an option above',
            invalidRateError: '[ja] Please enter a valid rate',
            lowRateError: '[ja] Rate must be greater than 0',
            email: '[ja] Please enter a valid email address',
            login: '[ja] An error occurred while logging in. Please try again.',
        },
        comma: '[ja] comma',
        semicolon: '[ja] semicolon',
        please: '[ja] Please',
        contactUs: '[ja][ctx: Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.] contact us',
        pleaseEnterEmailOrPhoneNumber: '[ja] Please enter an email or phone number',
        fixTheErrors: '[ja][ctx: Instruction prompting the user to correct multiple issues. Should use imperative form when translated.] fix the errors',
        inTheFormBeforeContinuing: '[ja] in the form before continuing',
        confirm: '[ja] Confirm',
        reset: '[ja] Reset',
        done: '[ja][ctx: Status or button indicating that an action or process has been completed. Should reflect completion.] Done',
        more: '[ja] More',
        debitCard: '[ja] Debit card',
        bankAccount: '[ja] Bank account',
        personalBankAccount: '[ja] Personal bank account',
        businessBankAccount: '[ja] Business bank account',
        join: '[ja] Join',
        leave: '[ja] Leave',
        decline: '[ja] Decline',
        reject: '[ja] Reject',
        transferBalance: '[ja] Transfer balance',
        enterManually: '[ja][ctx: Instruction telling the user to input data manually. Refers to entering text or values in a field.] Enter it manually',
        message: '[ja] Message',
        leaveThread: '[ja] Leave thread',
        you: '[ja] You',
        me: '[ja][ctx: Refers to the current user in the UI. Should follow capitalization rules for labels] me',
        youAfterPreposition: '[ja] you',
        your: '[ja] your',
        conciergeHelp: '[ja] Please reach out to Concierge for help.',
        youAppearToBeOffline: '[ja] You appear to be offline.',
        thisFeatureRequiresInternet: '[ja] This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: '[ja] Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: '[ja] An error occurred while trying to play this video.',
        areYouSure: '[ja] Are you sure?',
        verify: '[ja] Verify',
        yesContinue: '[ja] Yes, continue',
        websiteExample: '[ja][ctx: Provides an example format for a website URL.] e.g. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `[ja][ctx: Provides an example format for a ZIP] e.g. ${zipSampleFormat}` : ''),
        description: '[ja] Description',
        title: '[ja] Title',
        assignee: '[ja] Assignee',
        createdBy: '[ja] Created by',
        with: '[ja] with',
        shareCode: '[ja] Share code',
        share: '[ja] Share',
        per: '[ja] per',
        mi: '[ja][ctx: Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.] mile',
        km: '[ja] kilometer',
        milesAbbreviated: '[ja] mi',
        kilometersAbbreviated: '[ja] km',
        copied: '[ja] Copied!',
        someone: '[ja] Someone',
        total: '[ja] Total',
        edit: '[ja] Edit',
        letsDoThis: `[ja] Let's do this!`,
        letsStart: `[ja] Let's start`,
        showMore: '[ja] Show more',
        showLess: '[ja] Show less',
        merchant: '[ja] Merchant',
        change: '[ja] Change',
        category: '[ja] Category',
        report: '[ja] Report',
        billable: '[ja] Billable',
        nonBillable: '[ja] Non-billable',
        tag: '[ja] Tag',
        receipt: '[ja] Receipt',
        verified: '[ja] Verified',
        replace: '[ja] Replace',
        distance: '[ja] Distance',
        mile: '[ja] mile',
        miles: '[ja][ctx: Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.] miles',
        kilometer: '[ja] kilometer',
        kilometers: '[ja] kilometers',
        recent: '[ja] Recent',
        all: '[ja] All',
        am: '[ja] AM',
        pm: '[ja] PM',
        tbd: "[ja][ctx: Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.] TBD",
        selectCurrency: '[ja] Select a currency',
        selectSymbolOrCurrency: '[ja] Select a symbol or currency',
        card: '[ja] Card',
        whyDoWeAskForThis: '[ja] Why do we ask for this?',
        required: '[ja] Required',
        automatic: '[ja] Automatic',
        showing: '[ja] Showing',
        of: '[ja] of',
        default: '[ja] Default',
        update: '[ja] Update',
        member: '[ja] Member',
        auditor: '[ja] Auditor',
        role: '[ja] Role',
        roleCannotBeChanged: (workflowsLinkPage: string) => `[ja] Role can't be changed because this member is a <a href="${workflowsLinkPage}">payer</a> on this workspace.`,
        currency: '[ja] Currency',
        groupCurrency: '[ja] Group currency',
        rate: '[ja] Rate',
        emptyLHN: {
            title: '[ja] Woohoo! All caught up.',
            subtitleText1: '[ja] Find a chat using the',
            subtitleText2: '[ja] button above, or create something using the',
            subtitleText3: '[ja] button below.',
        },
        businessName: '[ja] Business name',
        clear: '[ja] Clear',
        type: '[ja] Type',
        reportName: '[ja] Report name',
        action: '[ja] Action',
        expenses: '[ja] Expenses',
        totalSpend: '[ja] Total spend',
        tax: '[ja] Tax',
        shared: '[ja] Shared',
        drafts: '[ja] Drafts',
        draft: '[ja][ctx: as a noun, not a verb] Draft',
        finished: '[ja] Finished',
        upgrade: '[ja] Upgrade',
        downgradeWorkspace: '[ja] Downgrade workspace',
        companyID: '[ja] Company ID',
        userID: '[ja] User ID',
        disable: '[ja] Disable',
        export: '[ja] Export',
        initialValue: '[ja] Initial value',
        currentDate: '[ja][ctx: UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.] Current date',
        value: '[ja] Value',
        downloadFailedTitle: '[ja] Download failed',
        downloadFailedDescription: "[ja] Your download couldn't be completed. Please try again later.",
        filterLogs: '[ja] Filter Logs',
        network: '[ja] Network',
        reportID: '[ja] Report ID',
        longReportID: '[ja] Long Report ID',
        withdrawalID: '[ja] Withdrawal ID',
        withdrawalStatus: '[ja] Withdrawal status',
        bankAccounts: '[ja] Bank accounts',
        chooseFile: '[ja] Choose file',
        chooseFiles: '[ja] Choose files',
        dropTitle: '[ja][ctx: Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.] Let it go',
        dropMessage: '[ja][ctx: Instruction for dropping one or more files into an upload area.] Drop your file here',
        ignore: '[ja] Ignore',
        enabled: '[ja] Enabled',
        disabled: '[ja] Disabled',
        import: '[ja][ctx: Action button for importing a file or data. Should use the verb form, not the noun form.] Import',
        offlinePrompt: "[ja] You can't take this action right now.",
        outstanding: '[ja][ctx: meaning "remaining to be paid, done, or dealt with", not "exceptionally good"] Outstanding',
        chats: '[ja] Chats',
        tasks: '[ja] Tasks',
        unread: '[ja] Unread',
        sent: '[ja] Sent',
        links: '[ja] Links',
        day: '[ja][ctx: Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).] day',
        days: '[ja] days',
        rename: '[ja] Rename',
        address: '[ja] Address',
        hourAbbreviation: '[ja] h',
        minuteAbbreviation: '[ja] m',
        secondAbbreviation: '[ja] s',
        skip: '[ja] Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `[ja] Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: '[ja] Chat now',
        workEmail: '[ja] Work email',
        destination: '[ja] Destination',
        subrate: '[ja][ctx: Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.] Subrate',
        perDiem: '[ja] Per diem',
        validate: '[ja] Validate',
        downloadAsPDF: '[ja] Download as PDF',
        downloadAsCSV: '[ja] Download as CSV',
        print: '[ja] Print',
        help: '[ja] Help',
        collapsed: '[ja] Collapsed',
        expanded: '[ja] Expanded',
        expenseReport: '[ja] Expense Report',
        expenseReports: '[ja] Expense Reports',
        rateOutOfPolicy: '[ja][ctx: Rate as a noun, not a verb] Rate out of policy',
        leaveWorkspace: '[ja] Leave workspace',
        leaveWorkspaceConfirmation: "[ja] If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "[ja] If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "[ja] If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `[ja] If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `[ja] If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `[ja] If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "[ja] You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: '[ja] Reimbursable',
        editYourProfile: '[ja] Edit your profile',
        comments: '[ja] Comments',
        sharedIn: '[ja] Shared in',
        unreported: '[ja] Unreported',
        explore: '[ja] Explore',
        insights: '[ja] Insights',
        todo: '[ja] To-do',
        invoice: '[ja] Invoice',
        expense: '[ja] Expense',
        chat: '[ja] Chat',
        task: '[ja] Task',
        trip: '[ja] Trip',
        apply: '[ja] Apply',
        status: '[ja] Status',
        on: '[ja] On',
        before: '[ja] Before',
        after: '[ja] After',
        range: '[ja] Range',
        reschedule: '[ja] Reschedule',
        general: '[ja] General',
        workspacesTabTitle: '[ja] Workspaces',
        headsUp: '[ja] Heads up!',
        submitTo: '[ja] Submit to',
        forwardTo: '[ja] Forward to',
        approvalLimit: '[ja] Approval limit',
        overLimitForwardTo: '[ja] Over limit forward to',
        merge: '[ja] Merge',
        none: '[ja] None',
        unstableInternetConnection: '[ja] Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: '[ja] Enable Global Reimbursements',
        purchaseAmount: '[ja] Purchase amount',
        originalAmount: '[ja] Original amount',
        frequency: '[ja] Frequency',
        link: '[ja] Link',
        pinned: '[ja] Pinned',
        read: '[ja] Read',
        copyToClipboard: '[ja] Copy to clipboard',
        thisIsTakingLongerThanExpected: '[ja] This is taking longer than expected...',
        domains: '[ja] Domains',
        actionRequired: '[ja] Action required',
        duplicate: '[ja] Duplicate',
        duplicated: '[ja] Duplicated',
        duplicateExpense: '[ja] Duplicate expense',
        duplicateReport: '[ja] Duplicate report',
        copyOfReportName: (reportName: string) => `[ja] Copy of ${reportName}`,
        exchangeRate: '[ja] Exchange rate',
        reimbursableTotal: '[ja] Reimbursable total',
        nonReimbursableTotal: '[ja] Non-reimbursable total',
        opensInNewTab: '[ja] Opens in a new tab',
        locked: '[ja] Locked',
        month: '[ja] Month',
        week: '[ja] Week',
        year: '[ja] Year',
        quarter: '[ja] Quarter',
        concierge: {
            sidePanelGreeting: '[ja] Hi there, how can I help?',
            showHistory: '[ja] Show history',
        },
        vacationDelegate: '[ja] Vacation delegate',
        expensifyLogo: '[ja] Expensify logo',
        approver: '[ja] Approver',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `[ja] enter digit ${digitIndex} of ${totalDigits}`,
    },
    socials: {
        podcast: '[ja] Follow us on Podcast',
        twitter: '[ja] Follow us on Twitter',
        instagram: '[ja] Follow us on Instagram',
        facebook: '[ja] Follow us on Facebook',
        linkedin: '[ja] Follow us on LinkedIn',
    },
    concierge: {
        collapseReasoning: '[ja] Collapse reasoning',
        expandReasoning: '[ja] Expand reasoning',
    },
    supportalNoAccess: {
        title: '[ja] Not so fast',
        descriptionWithCommand: (command?: string) =>
            `[ja] You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: '[ja] Locked Account',
        description: "[ja] You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: '[ja] Use current location',
        notFound: '[ja] We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "[ja] It looks like you've denied access to your location.",
        please: '[ja] Please',
        allowPermission: '[ja] allow location access in settings',
        tryAgain: '[ja] and try again.',
    },
    contact: {
        importContacts: '[ja] Import contacts',
        importContactsTitle: '[ja] Import your contacts',
        importContactsText: '[ja] Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: '[ja] so your favorite people are always a tap away.',
        importContactsNativeText: '[ja] Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: '[ja] Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '[ja] Camera access',
        expensifyDoesNotHaveAccessToCamera: "[ja] Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: '[ja] Attachment error',
        errorWhileSelectingAttachment: '[ja] An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: '[ja] An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: '[ja] Take photo',
        chooseFromGallery: '[ja] Choose from gallery',
        chooseDocument: '[ja] Choose file',
        attachmentTooLarge: '[ja] Attachment is too large',
        sizeExceeded: '[ja] Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `[ja] Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: '[ja] Attachment is too small',
        sizeNotMet: '[ja] Attachment size must be greater than 240 bytes',
        wrongFileType: '[ja] Invalid file type',
        notAllowedExtension: '[ja] This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: '[ja] Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: '[ja] Password-protected PDF is not supported',
        attachmentImageResized: '[ja] This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: '[ja] This image is too large to preview before uploading.',
        imageDimensionsTooLarge: '[ja] Image dimensions are too large to process. Please use a smaller image.',
        tooManyFiles: (fileLimit: number) => `[ja] You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `[ja] Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "[ja] Some files can't be uploaded",
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `[ja] Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "[ja] You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `[ja] ${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: '[ja] Learn more about supported formats.',
        passwordProtected: "[ja] Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: '[ja] Add attachments',
        addReceipt: '[ja] Add receipt',
        scanReceipts: '[ja] Scan receipts',
        replaceReceipt: '[ja] Replace receipt',
    },
    filePicker: {
        fileError: '[ja] File error',
        errorWhileSelectingFile: '[ja] An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: '[ja] Connection complete',
        supportingText: '[ja] You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: '[ja] Edit photo',
        description: '[ja] Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: '[ja] No extension found for mime type',
        problemGettingImageYouPasted: '[ja] There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `[ja] The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `[ja] The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: '[ja] Update app',
        updatePrompt: '[ja] A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: '[ja] Launching Expensify',
        expired: '[ja] Your session has expired.',
        signIn: '[ja] Please sign in again.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: '[ja] Review transaction',
            pleaseReview: '[ja] Please review this transaction',
            requiresYourReview: '[ja] An Expensify Card transaction requires your review.',
            transactionDetails: '[ja] Transaction details',
            attemptedTransaction: '[ja] Attempted transaction',
            deny: '[ja] Deny',
            approve: '[ja] Approve',
            denyTransaction: '[ja] Deny transaction',
            transactionDenied: '[ja] Transaction denied',
            transactionApproved: '[ja] Transaction approved!',
            areYouSureToDeny: '[ja] Are you sure? The transaction will be denied if you close this screen.',
            youCanTryAgainAtMerchantOrReachOut:
                "[ja] You can try again at the merchant. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            youNeedToTryAgainAtMerchant: "[ja] This transaction was not verified, so we denied it. You'll need to try again at the merchant.",
            goBackToTheMerchant: '[ja] Return to the merchant site to continue the transaction.',
            transactionFailed: '[ja] Transaction failed',
            transactionCouldNotBeCompleted: '[ja] Your transaction could not be completed. Please try again at the merchant.',
            transactionCouldNotBeCompletedReachOut:
                "[ja] Your transaction could not be completed. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            reviewFailed: '[ja] Review failed',
            alreadyReviewedSubtitle:
                '[ja] You already reviewed this transaction. Please check your <transaction-history-link>transaction history</transaction-history-link> or contact <concierge-link>Concierge</concierge-link> to report any issues.',
        },
        unsupportedDevice: {
            unsupportedDevice: '[ja] Unsupported device',
            pleaseDownloadMobileApp: `[ja] This action is not supported on your device. Please download the Expensify app from the <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> or <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> and try again.`,
            pleaseUseWebApp: `[ja] This action is not supported on your device. Please use the <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify web app</a> and try again.`,
        },
        biometricsTest: {
            biometricsTest: '[ja] Biometrics test',
            authenticationSuccessful: '[ja] Authentication successful',
            successfullyAuthenticatedUsing: (authType?: string) => `[ja] You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `[ja] Biometrics (${status})`,
            statusNeverRegistered: '[ja] Never registered',
            statusNotRegistered: '[ja] Not registered',
            statusRegisteredOtherDevice: () => ({one: '[ja] Another device registered', other: '[ja] Other devices registered'}),
            statusRegisteredThisDevice: '[ja] Registered',
            yourAttemptWasUnsuccessful: '[ja] Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: '[ja] You couldn’t be authenticated',
            areYouSureToReject: '[ja] Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: '[ja] Reject authentication',
            test: '[ja] Test',
            biometricsAuthentication: '[ja] Biometric authentication',
            authType: {
                unknown: '[ja] Unknown',
                none: '[ja] None',
                credentials: '[ja] Credentials',
                biometrics: '[ja] Biometrics',
                faceId: '[ja] Face ID',
                touchId: '[ja] Touch ID',
                opticId: '[ja] Optic ID',
                passkey: '[ja] Passkey',
            },
        },
        pleaseEnableInSystemSettings: {
            start: '[ja] Please enable face/fingerprint verification or set a device passcode in your ',
            link: '[ja] system settings',
            end: '.',
        },
        oops: '[ja] Oops, something went wrong',
        verificationFailed: '[ja] Verification failed',
        looksLikeYouRanOutOfTime: '[ja] Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: '[ja] You ran out of time',
        letsVerifyItsYou: '[ja] Let’s verify it’s you',
        nowLetsAuthenticateYou: "[ja] Now, let's authenticate you...",
        letsAuthenticateYou: "[ja] Let's authenticate you...",
        verifyYourself: {
            biometrics: '[ja] Verify yourself with your face or fingerprint',
            passkeys: '[ja] Verify yourself with a passkey',
        },
        enableQuickVerification: {
            biometrics: '[ja] Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
            passkeys: '[ja] Enable quick, secure verification using a passkey. No passwords or codes required.',
        },
        revoke: {
            revoke: '[ja] Revoke',
            title: '[ja] Face/fingerprint & passkeys',
            explanation:
                '[ja] Face/fingerprint or passkey verification are enabled on one or more devices. Revoking access will require a magic code for the next verification on that device.',
            confirmationPrompt: "[ja] Are you sure? You'll need a magic code for the next verification on that device.",
            confirmationPromptThisDevice: "[ja] Are you sure? You'll need a magic code for the next verification on this device.",
            confirmationPromptMultiple: "[ja] Are you sure? You'll need a magic code for the next verification on those devices.",
            confirmationPromptAll: "[ja] Are you sure? You'll need a magic code for the next verification on any device.",
            cta: '[ja] Revoke access',
            ctaAll: '[ja] Revoke all',
            noDevices: "[ja] You don't have any devices registered for face/fingerprint or passkey verification. If you register any, you will be able to revoke that access here.",
            dismiss: '[ja] Got it',
            error: '[ja] Request failed. Try again later.',
            thisDevice: '[ja] This device',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['[ja] One', '[ja] Two', '[ja] Three', '[ja] Four', '[ja] Five', '[ja] Six', '[ja] Seven', '[ja] Eight', '[ja] Nine'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `[ja] ${displayCount} other ${otherDeviceCount === 1 ? '[ja] device' : '[ja] devices'}`;
            },
        },
        setPin: {
            didNotShipCard: "[ja] We didn't ship your card. Please try again.",
        },
        revealPin: {
            couldNotReveal: "[ja] We couldn't reveal your PIN. Please try again.",
        },
        changePin: {
            didNotChange: "[ja] We didn't change your PIN. Please try again.",
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            [ja] Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: '[ja] Head back to your original tab to continue.',
        title: "[ja] Here's your magic code",
        description: dedent(`
            [ja] Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            [ja] Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: '[ja] , or',
        signInHere: '[ja] just sign in here',
        expiredCodeTitle: '[ja] Magic code expired',
        expiredCodeDescription: '[ja] Go back to the original device and request a new code',
        successfulNewCodeRequest: '[ja] Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            [ja] Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            [ja] Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: '[ja] request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: '[ja] Paid by',
        whatsItFor: "[ja] What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: '[ja] Name, email, or phone number',
        findMember: '[ja] Find a member',
        searchForSomeone: '[ja] Search for someone',
        userSelected: (username: string) => `[ja] ${username} selected`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '[ja] Submit an expense, refer your team',
            subtitleText: "[ja] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '[ja] Book a call',
    },
    hello: '[ja] Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '[ja] Get started below.',
        anotherLoginPageIsOpen: '[ja] Another login page is open.',
        anotherLoginPageIsOpenExplanation: "[ja] You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: '[ja] Welcome!',
        welcomeWithoutExclamation: '[ja] Welcome',
        phrase2: "[ja] Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: '[ja] Your payments get to you as fast as you can get your point across.',
        enterPassword: '[ja] Please enter your password',
        welcomeNewFace: (login: string) => `[ja] ${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: (login: string) => `[ja] Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '[ja] Travel and expense, at the speed of chat',
            body: '[ja] Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '[ja] Continue logging in with single sign-on:',
        orContinueWithMagicCode: '[ja] You can also sign in with a magic code',
        useSingleSignOn: '[ja] Use single sign-on',
        useMagicCode: '[ja] Use magic code',
        launching: '[ja] Launching...',
        oneMoment: "[ja] One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: '[ja] Drop to upload',
        sendAttachment: '[ja] Send attachment',
        addAttachment: '[ja] Add attachment',
        writeSomething: '[ja] Write something...',
        blockedFromConcierge: '[ja] Communication is barred',
        askConciergeToUpdate: '[ja] Try "Update an expense"...',
        askConciergeToCorrect: '[ja] Try "Correct an expense"...',
        askConciergeForHelp: '[ja] Ask Concierge AI for help...',
        fileUploadFailed: '[ja] Upload failed. File is not supported.',
        localTime: (user: string, time: string) => `[ja] It's ${time} for ${user}`,
        edited: '[ja] (edited)',
        emoji: '[ja] Emoji',
        collapse: '[ja] Collapse',
        expand: '[ja] Expand',
    },
    reportActionContextMenu: {
        copyMessage: '[ja] Copy message',
        copied: '[ja] Copied!',
        copyLink: '[ja] Copy link',
        copyURLToClipboard: '[ja] Copy URL to clipboard',
        copyEmailToClipboard: '[ja] Copy email to clipboard',
        markAsUnread: '[ja] Mark as unread',
        markAsRead: '[ja] Mark as read',
        editAction: ({action}: EditActionParams) => `[ja] Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '[ja] expense' : '[ja] comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '[ja] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[ja] Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '[ja] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[ja] Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: '[ja] Only visible to',
        explain: '[ja] Explain',
        explainMessage: '[ja] Please explain this to me.',
        replyInThread: '[ja] Reply in thread',
        joinThread: '[ja] Join thread',
        leaveThread: '[ja] Leave thread',
        copyOnyxData: '[ja] Copy Onyx data',
        flagAsOffensive: '[ja] Flag as offensive',
        menu: '[ja] Menu',
    },
    emojiReactions: {
        addReactionTooltip: '[ja] Add reaction',
        reactedWith: '[ja] reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `[ja] You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `[ja] This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `[ja] This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `[ja] This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `[ja] This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `[ja] This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `[ja] This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `[ja] This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: '[ja] This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "[ja] Welcome! Let's get you set up.",
        chatWithAccountManager: '[ja] Chat with your account manager here',
        askMeAnything: '[ja] Ask me anything!',
        sayHello: '[ja] Say hello!',
        yourSpace: '[ja] Your space',
        welcomeToRoom: (roomName: string) => `[ja] Welcome to ${roomName}!`,
        usePlusButton: (additionalText: string) => `[ja]  Use the + button to ${additionalText} an expense.`,
        askConcierge: '[ja] This is your chat with Concierge, your personal AI agent. I can do almost anything, try me!',
        conciergeSupport: '[ja] Your personal AI agent',
        create: '[ja] create',
        iouTypes: {
            pay: '[ja] pay',
            split: '[ja] split',
            submit: '[ja] submit',
            track: '[ja] track',
            invoice: '[ja] invoice',
        },
    },
    adminOnlyCanPost: '[ja] Only admins can send messages in this room.',
    reportAction: {
        asCopilot: '[ja] as copilot for',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `[ja] created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `[ja] created this report for any held expenses from deleted report #${reportID}`
                : `[ja] created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: '[ja] Notify everyone in this conversation',
    },
    newMessages: '[ja] New messages',
    latestMessages: '[ja] Latest messages',
    youHaveBeenBanned: "[ja] Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: '[ja] is typing...',
        areTyping: '[ja] are typing...',
        multipleMembers: '[ja] Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '[ja] This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `[ja] This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `[ja] This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `[ja] This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `[ja] This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[ja] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[ja] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '[ja] This booking is archived.',
    },
    writeCapabilityPage: {
        label: '[ja] Who can post',
        writeCapability: {
            all: '[ja] All members',
            admins: '[ja] Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: '[ja] Find something...',
        buttonMySettings: '[ja] My settings',
        fabNewChat: '[ja] Start chat',
        fabNewChatExplained: '[ja] Open actions menu',
        fabScanReceiptExplained: '[ja] Scan receipt',
        chatPinned: '[ja] Chat pinned',
        draftedMessage: '[ja] Drafted message',
        listOfChatMessages: '[ja] List of chat messages',
        listOfChats: '[ja] List of chats',
        saveTheWorld: '[ja] Save the world',
        tooltip: '[ja] Get started here!',
        redirectToExpensifyClassicModal: {
            title: '[ja] Coming soon',
            description: "[ja] We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        },
    },
    homePage: {
        forYou: '[ja] For you',
        timeSensitiveSection: {
            title: '[ja] Time sensitive',
            ctaFix: '[ja] Fix',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `[ja] Fix ${feedName} company card connection` : '[ja] Fix company card connection'),
                defaultSubtitle: '[ja] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `[ja] Fix ${cardName} personal card connection` : '[ja] Fix personal card connection'),
                subtitle: '[ja] Wallet',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `[ja] Fix ${integrationName} connection`,
                defaultSubtitle: '[ja] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: '[ja] We need your shipping address',
                subtitle: '[ja] Provide an address to receive your Expensify Card.',
                cta: '[ja] Add address',
            },
            addPaymentCard: {
                title: '[ja] Add a payment card to keep using Expensify',
                subtitle: '[ja] Account > Subscription',
                cta: '[ja] Add',
            },
            activateCard: {
                title: '[ja] Activate your Expensify Card',
                subtitle: '[ja] Validate your card and start spending.',
                cta: '[ja] Activate',
            },
            reviewCardFraud: {
                title: '[ja] Review potential fraud on your Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `[ja] Review ${amount} in potential fraud at ${merchant}`,
                subtitle: '[ja] Expensify Card',
                cta: '[ja] Review',
            },
            validateAccount: {
                title: '[ja] Validate your account to continue using Expensify',
                subtitle: '[ja] Account',
                cta: '[ja] Validate',
            },
            fixFailedBilling: {
                title: "[ja] We couldn't bill your card on file",
                subtitle: '[ja] Subscription',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `[ja] Free trial: ${days} ${days === 1 ? '[ja] day' : '[ja] days'} left!`,
            offer50Body: '[ja] Get 50% off your first year!',
            offer25Body: '[ja] Get 25% off your first year!',
            addCardBody: "[ja] Don't wait! Add your payment card now.",
            ctaClaim: '[ja] Claim',
            ctaAdd: '[ja] Add card',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `[ja] Time remaining: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: '[ja] Time remaining: 1 day',
                other: (pluralCount: number) => `[ja] Time remaining: ${pluralCount} days`,
            }),
        },
        assignedCards: '[ja] Your Expensify Cards',
        assignedCardsRemaining: ({amount}: {amount: string}) => `[ja] ${amount} remaining`,
        announcements: '[ja] Announcements',
        discoverSection: {
            title: '[ja] Discover',
            menuItemTitleNonAdmin: '[ja] Learn how to create expenses and submit reports.',
            menuItemTitleAdmin: '[ja] Learn how to invite members, edit approval workflows, and reconcile company cards.',
            menuItemDescription: '[ja] See what Expensify can do in 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `[ja] Submit ${count} ${count === 1 ? '[ja] report' : '[ja] reports'}`,
            approve: ({count}: {count: number}) => `[ja] Approve ${count} ${count === 1 ? '[ja] report' : '[ja] reports'}`,
            pay: ({count}: {count: number}) => `[ja] Pay ${count} ${count === 1 ? '[ja] report' : '[ja] reports'}`,
            export: ({count}: {count: number}) => `[ja] Export ${count} ${count === 1 ? '[ja] report' : '[ja] reports'}`,
            begin: '[ja] Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: "[ja] You're done!",
                thumbsUpStarsDescription: '[ja] Thumbs up to you, stay tuned for more tasks.',
                smallRocketTitle: '[ja] All caught up',
                smallRocketDescription: '[ja] Upcoming to-dos will launch here.',
                cowboyHatTitle: "[ja] You're done!",
                cowboyHatDescription: '[ja] All tasks are wrangled, keep an eye out for more.',
                trophy1Title: '[ja] Nothing to show',
                trophy1Description: '[ja] You did it! Keep an eye out for more to-dos.',
                palmTreeTitle: '[ja] All caught up',
                palmTreeDescription: '[ja] Time to relax but stay tuned for future tasks.',
                fishbowlBlueTitle: "[ja] You're done!",
                fishbowlBlueDescription: "[ja] We'll bubble up future tasks here.",
                targetTitle: '[ja] All caught up',
                targetDescription: '[ja] Way to stay on target. Check back for more tasks!',
                chairTitle: '[ja] Nothing to show',
                chairDescription: "[ja] Go relax, we'll list upcoming to-dos here.",
                broomTitle: "[ja] You're done!",
                broomDescription: '[ja] Tasks are clean, though stay tuned for more to-dos.',
                houseTitle: '[ja] All caught up',
                houseDescription: '[ja] This is your home base for upcoming to-dos.',
                conciergeBotTitle: '[ja] Nothing to show',
                conciergeBotDescription: '[ja] Beep boop beep boop, check back for more tasks!',
                checkboxTextTitle: '[ja] All caught up',
                checkboxTextDescription: '[ja] Check off your upcoming to-dos here.',
                flashTitle: "[ja] You're done!",
                flashDescription: "[ja] We'll zap your future tasks here.",
                sunglassesTitle: '[ja] Nothing to show',
                sunglassesDescription: "[ja] Time to chill, though stay tuned for what's next!",
                f1FlagsTitle: '[ja] All caught up',
                f1FlagsDescription: "[ja] You've finished all outstanding to-dos.",
            },
        },
        gettingStartedSection: {
            title: '[ja] Getting started',
            createWorkspace: '[ja] Create a workspace',
            connectAccounting: ({integrationName}: {integrationName: string}) => `[ja] Connect to ${integrationName}`,
            connectAccountingDefault: '[ja] Connect to accounting',
            customizeCategories: '[ja] Customize accounting categories',
            linkCompanyCards: '[ja] Link company cards',
            setupRules: '[ja] Set up spend rules',
        },
        upcomingTravel: '[ja] Upcoming travel',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `[ja] Flight to ${destination}`,
            trainTo: ({destination}: {destination: string}) => `[ja] Train to ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `[ja] Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `[ja] Car rental in ${destination}`,
            inOneWeek: '[ja] In 1 week',
            inDays: () => ({
                one: '[ja] In 1 day',
                other: (count: number) => `[ja] In ${count} days`,
            }),
            today: '[ja] Today',
        },
    },
    allSettingsScreen: {
        subscription: '[ja] Subscription',
        domains: '[ja] Domains',
    },
    tabSelector: {
        chat: '[ja] Chat',
        room: '[ja] Room',
        distance: '[ja] Distance',
        manual: '[ja] Manual',
        scan: '[ja] Scan',
        map: '[ja] Map',
        gps: '[ja] GPS',
        odometer: '[ja] Odometer',
    },
    spreadsheet: {
        upload: '[ja] Upload a spreadsheet',
        import: '[ja] Import spreadsheet',
        dragAndDrop: '[ja] <muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `[ja] <muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '[ja] <muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `[ja] <muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: '[ja] File contains column headers',
        column: (name: string) => `[ja] Column ${name}`,
        fieldNotMapped: (fieldName: string) => `[ja] Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `[ja] Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `[ja] Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: '[ja] Import successful',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[ja] No categories have been added or updated.';
            }
            if (added && updated) {
                return `[ja] ${added} ${added === 1 ? '[ja] category' : '[ja] categories'} added, ${updated} ${updated === 1 ? '[ja] category' : '[ja] categories'} updated.`;
            }
            if (added) {
                return added === 1 ? '[ja] 1 category has been added.' : `[ja] ${added} categories have been added.`;
            }
            return updated === 1 ? '[ja] 1 category has been updated.' : `[ja] ${updated} categories have been updated.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[ja] ${transactions} transactions have been added.` : '[ja] 1 transaction has been added.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[ja] No members have been added or updated.';
            }
            if (added && updated) {
                return `[ja] ${added} member${added > 1 ? '[ja] s' : ''} added, ${updated} member${updated > 1 ? '[ja] s' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `[ja] ${updated} members have been updated.` : '[ja] 1 member has been updated.';
            }
            return added > 1 ? `[ja] ${added} members have been added.` : '[ja] 1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `[ja] ${tags} tags have been added.` : '[ja] 1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: '[ja] Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `[ja] ${rates} per diem rates have been added.` : '[ja] 1 per diem rate has been added.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[ja] ${transactions} transactions have been imported.` : '[ja] 1 transaction has been imported.',
        importFailedTitle: '[ja] Import failed',
        importFailedDescription: '[ja] Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: '[ja] Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: '[ja] File size must be greater than 0 bytes',
        invalidFileMessage:
            '[ja] The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: '[ja] Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: '[ja] Import spreadsheet',
        downloadCSV: '[ja] Download CSV',
        importMemberConfirmation: () => ({
            one: `[ja] Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `[ja] Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: '[ja] Upload receipt',
        uploadMultiple: '[ja] Upload receipts',
        desktopSubtitleSingle: `[ja] or drag and drop it here`,
        desktopSubtitleMultiple: `[ja] or drag and drop them here`,
        alternativeMethodsTitle: '[ja] Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `[ja] <label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `[ja] <label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `[ja] <label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `[ja] <label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: '[ja] Take a photo',
        cameraAccess: '[ja] Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `[ja] Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: '[ja] Camera error',
        cameraErrorMessage: '[ja] An error occurred while taking a photo. Please try again.',
        locationAccessTitle: '[ja] Allow location access',
        locationAccessMessage: '[ja] Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: '[ja] Allow location access',
        locationErrorMessage: '[ja] Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `[ja] Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '[ja] Let it go',
        dropMessage: '[ja] Drop your file here',
        flash: '[ja] flash',
        multiScan: '[ja] multi-scan',
        shutter: '[ja] shutter',
        gallery: '[ja] gallery',
        deleteReceipt: '[ja] Delete receipt',
        deleteConfirmation: '[ja] Are you sure you want to delete this receipt?',
        addReceipt: '[ja] Add receipt',
        addAdditionalReceipt: '[ja] Add additional receipt',
        scanFailed: "[ja] The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        crop: '[ja] Crop',
        addAReceipt: {
            phrase1: '[ja] Add a receipt',
            phrase2: '[ja] or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: '[ja] Scan receipt',
        recordDistance: '[ja] Track distance',
        requestMoney: '[ja] Create expense',
        perDiem: '[ja] Create per diem',
        splitBill: '[ja] Split expense',
        splitScan: '[ja] Split receipt',
        splitDistance: '[ja] Split distance',
        paySomeone: (name?: string) => `[ja] Pay ${name ?? '[ja] someone'}`,
        assignTask: '[ja] Assign task',
        header: '[ja] Quick action',
        noLongerHaveReportAccess: '[ja] You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: '[ja] Update destination',
        createReport: '[ja] Create report',
        createTimeExpense: '[ja] Create time expense',
    },
    iou: {
        amount: '[ja] Amount',
        percent: '[ja] Percent',
        date: '[ja] Date',
        taxAmount: '[ja] Tax amount',
        taxRate: '[ja] Tax rate',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `[ja] Approve ${formattedAmount}` : '[ja] Approve'),
        approved: '[ja] Approved',
        cash: '[ja] Cash',
        card: '[ja] Card',
        original: '[ja] Original',
        split: '[ja] Split',
        splitExpense: '[ja] Split expense',
        splitDates: '[ja] Split dates',
        splitDateRange: (startDate: string, endDate: string, count: number) => `[ja] ${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `[ja] ${amount} from ${merchant}`,
        splitByPercentage: '[ja] Split by percentage',
        splitByDate: '[ja] Split by date',
        addSplit: '[ja] Add split',
        makeSplitsEven: '[ja] Make splits even',
        editSplits: '[ja] Edit splits',
        totalAmountGreaterThanOriginal: (amount: string) => `[ja] Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: (amount: string) => `[ja] Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: '[ja] Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: '[ja] No splits added. Add at least one to save.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `[ja] Edit ${amount} for ${merchant}`,
        removeSplit: '[ja] Remove split',
        splitExpenseCannotBeEditedModalTitle: "[ja] This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: '[ja] Approved or paid expenses cannot be edited',
        paySomeone: (name?: string) => `[ja] Pay ${name ?? '[ja] someone'}`,
        splitExpenseDistanceErrorModalDescription: '[ja] Please fix the distance rate error and try again.',
        splitExpensePerDiemRateErrorModalDescription: '[ja] Please fix the per diem rate error and try again.',
        expense: '[ja] Expense',
        categorize: '[ja] Categorize',
        share: '[ja] Share',
        participants: '[ja] Participants',
        createExpense: '[ja] Create expense',
        trackDistance: '[ja] Track distance',
        createExpenses: (expensesNumber: number) => `[ja] Create ${expensesNumber} expenses`,
        removeExpense: '[ja] Remove expense',
        removeThisExpense: '[ja] Remove this expense',
        removeExpenseConfirmation: '[ja] Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: '[ja] Add expense',
        chooseRecipient: '[ja] Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `[ja] Create ${amount} expense`,
        confirmDetails: '[ja] Confirm details',
        pay: '[ja] Pay',
        cancelPayment: '[ja] Cancel payment',
        cancelPaymentConfirmation: '[ja] Are you sure that you want to cancel this payment?',
        viewDetails: '[ja] View details',
        pending: '[ja] Pending',
        canceled: '[ja] Canceled',
        posted: '[ja] Posted',
        deleteReceipt: '[ja] Delete receipt',
        findExpense: '[ja] Find expense',
        deletedTransaction: (amount: string, merchant: string) => `[ja] deleted an expense (${amount} for ${merchant})`,
        movedFromReport: (reportName: string) => `[ja] moved an expense${reportName ? `[ja]  from ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `[ja] moved this expense${reportName ? `[ja]  to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `[ja] moved this expense${reportName ? `[ja]  from <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `[ja] moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `[ja] moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `[ja] moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: '[ja] Receipt pending match with card transaction',
        pendingMatch: '[ja] Pending match',
        pendingMatchWithCreditCardDescription: '[ja] Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: '[ja] Mark as cash',
        pendingMatchSubmitTitle: '[ja] Submit report',
        pendingMatchSubmitDescription: '[ja] Some expenses are awaiting a match with a credit card transaction. Do you want to mark them as cash?',
        routePending: '[ja] Route pending...',
        automaticallyEnterExpenseDetails: '[ja] Concierge will automatically enter the expense details for you, or you can add them manually.',
        receiptScanning: () => ({
            one: '[ja] Receipt scanning...',
            other: '[ja] Receipts scanning...',
        }),
        scanMultipleReceipts: '[ja] Scan multiple receipts',
        scanMultipleReceiptsDescription: "[ja] Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: '[ja] Receipt scan in progress',
        receiptScanInProgressDescription: '[ja] Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: '[ja] Remove from report',
        moveToPersonalSpace: '[ja] Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '[ja] Potential duplicate expenses identified. Review duplicates to enable submission.'
                : '[ja] Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: '[ja] Issue found',
            other: '[ja] Issues found',
        }),
        fieldPending: '[ja] Pending...',
        defaultRate: '[ja] Default rate',
        receiptMissingDetails: '[ja] Receipt missing details',
        missingAmount: '[ja] Missing amount',
        missingMerchant: '[ja] Missing merchant',
        receiptStatusTitle: '[ja] Scanning…',
        receiptStatusText: "[ja] Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: '[ja] Receipt scanning failed. Please enter the details manually.',
        transactionPendingDescription: '[ja] Transaction pending. It may take a few days to post.',
        companyInfo: '[ja] Company info',
        companyInfoDescription: '[ja] We need a few more details before you can send your first invoice.',
        yourCompanyName: '[ja] Your company name',
        yourCompanyWebsite: '[ja] Your company website',
        yourCompanyWebsiteNote: "[ja] If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: '[ja] You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: '[ja] You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '[ja] 1 expense',
                other: (count: number) => `[ja] ${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: '[ja] Delete expense',
            other: '[ja] Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: '[ja] Are you sure that you want to delete this expense?',
            other: '[ja] Are you sure that you want to delete these expenses?',
        }),
        deleteReport: () => ({
            one: '[ja] Delete report',
            other: '[ja] Delete reports',
        }),
        deleteReportConfirmation: () => ({
            one: '[ja] Are you sure that you want to delete this report?',
            other: '[ja] Are you sure that you want to delete these reports?',
        }),
        settledExpensify: '[ja] Paid',
        done: '[ja] Done',
        deleted: '[ja] Deleted',
        settledElsewhere: '[ja] Paid elsewhere',
        individual: '[ja] Individual',
        business: '[ja] Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `[ja] Pay ${formattedAmount} as an individual` : `[ja] Pay with personal account`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `[ja] Pay ${formattedAmount} with wallet` : `[ja] Pay with wallet`),
        settlePayment: (formattedAmount: string) => `[ja] Pay ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `[ja] Pay ${formattedAmount} as a business` : `[ja] Pay with business account`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `[ja] Mark ${formattedAmount} as paid` : `[ja] Mark as paid`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `[ja] paid ${amount} with personal account ${last4Digits}` : `[ja] Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `[ja] paid ${amount} with business account ${last4Digits}` : `[ja] Paid with business account`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `[ja] Pay ${formattedAmount} via ${policyName}` : `[ja] Pay via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `[ja] paid ${amount} with bank account ${last4Digits}` : `[ja] paid with bank account ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `[ja] paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `[ja] Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `[ja] Business Account • ${lastFour}`,
        nextStep: '[ja] Next steps',
        finished: '[ja] Finished',
        flip: '[ja] Flip',
        sendInvoice: (amount: string) => `[ja] Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `[ja]  for ${comment}` : ''}`,
        submitted: (memo?: string) => `[ja] submitted${memo ? `[ja] , saying ${memo}` : ''}`,
        automaticallySubmitted: `[ja] submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: '[ja] queued to submit via custom approval workflow',
        failedToAutoSubmitViaDEW: (reason: string) => `[ja] failed to submit the report via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `[ja] failed to submit the report. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `[ja] failed to approve via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `[ja] failed to approve. ${reason}`,
        queuedToApproveViaDEW: '[ja] queued to approve via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `[ja] tracking ${formattedAmount}${comment ? `[ja]  for ${comment}` : ''}`,
        splitAmount: (amount: string) => `[ja] split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `[ja] split ${formattedAmount}${comment ? `[ja]  for ${comment}` : ''}`,
        yourSplit: (amount: string) => `[ja] Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `[ja] ${payer} owes ${amount}${comment ? `[ja]  for ${comment}` : ''}`,
        payerOwes: (payer: string) => `[ja] ${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `[ja] ${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: (payer: string) => `[ja] ${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `[ja] ${payer} spent ${amount}`,
        payerSpent: (payer: string) => `[ja] ${payer} spent: `,
        managerApproved: (manager: string) => `[ja] ${manager} approved:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `[ja] ${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `[ja] paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `[ja] paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `[ja] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `[ja] approved ${amount}`,
        approvedMessage: `[ja] approved`,
        unapproved: `[ja] unapproved`,
        automaticallyForwarded: `[ja] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `[ja] approved`,
        rejectedThisReport: '[ja] rejected',
        waitingOnBankAccount: (submitterDisplayName: string) => `[ja] started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: '[ja] canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `[ja] canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `[ja] ${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `[ja] ${payer ? `${payer} ` : ''}marked as paid${comment ? `[ja] , saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `[ja] ${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `[ja] ${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        reimbursedThisReport: '[ja] reimbursed this report',
        paidThisBill: '[ja] paid this bill',
        reimbursedOnBehalfOf: (actor: string) => `[ja] on behalf of ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `[ja] from the bank account ending in ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `[ja] ${submitter} added a bank account, taking report off hold. Reimbursement is initiated`,
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
                ? `[ja] . Money is on its way to your${creditBankAccount ? `[ja]  bank account ending in ${creditBankAccount}` : '[ja]  account'}. Reimbursement estimated to complete on ${expectedDate}.`
                : `[ja] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[ja]  bank account ending in ${creditBankAccount}` : '[ja]  account'}. Reimbursement estimated to complete on ${expectedDate}.`,
        reimbursedWithCheck: '[ja]  via check.',
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
            const paymentMethod = isCard ? '[ja] card' : '[ja] bank account';
            return isCurrentUser
                ? `[ja] . Money is on its way to your${creditBankAccount ? `[ja]  bank account ending in ${creditBankAccount}` : '[ja]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`
                : `[ja] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[ja]  bank account ending in ${creditBankAccount}` : '[ja]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `[ja]  with direct deposit (ACH)${creditBankAccount ? `[ja]  to the bank account ending in ${creditBankAccount}. ` : '. '}${expectedDate ? `[ja] The reimbursement is estimated to complete by ${expectedDate}.` : '[ja] This generally takes 4-5 business days.'}`,
        noReimbursableExpenses: '[ja] This report has an invalid amount',
        pendingConversionMessage: "[ja] Total will update when you're back online",
        changedTheExpense: '[ja] changed the expense',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `[ja] the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `[ja] set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `[ja] the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `[ja] the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `[ja] changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: '[ja] based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `[ja] based on <a href="${rulesLink}">workspace rules</a>` : '[ja] based on workspace rule'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `[ja] for ${comment}` : '[ja] expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `[ja] Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `[ja] ${formattedAmount} sent${comment ? `[ja]  for ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) => `[ja] moved expense from personal space to ${workspaceName ?? `[ja] chat with ${reportName}`}`,
        movedToPersonalSpace: '[ja] moved expense to personal space',
        error: {
            invalidCategoryLength: '[ja] The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: '[ja] The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: '[ja] Please enter a valid amount before continuing',
            invalidDistance: '[ja] Please enter a valid distance before continuing',
            invalidReadings: '[ja] Please enter both start and end readings',
            negativeDistanceNotAllowed: '[ja] End reading must be greater than start reading',
            distanceAmountTooLarge: '[ja] The total amount is too large. Reduce the distance or lower the rate.',
            distanceAmountTooLargeReduceDistance: '[ja] The total amount is too large. Reduce the distance.',
            distanceAmountTooLargeReduceRate: '[ja] The total amount is too large. Lower the rate.',
            odometerReadingTooLarge: (formattedMax: string) => `[ja] Odometer readings cannot exceed ${formattedMax}.`,
            stitchOdometerImagesFailed: '[ja] Failed to combine odometer images. Please try again later.',
            invalidIntegerAmount: '[ja] Please enter a whole dollar amount before continuing',
            invalidTaxAmount: (amount: string) => `[ja] Maximum tax amount is ${amount}`,
            invalidSplit: '[ja] The sum of splits must equal the total amount',
            invalidSplitParticipants: '[ja] Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: '[ja] Please enter a non-zero amount for your split',
            noParticipantSelected: '[ja] Please select a participant',
            other: '[ja] Unexpected error. Please try again later.',
            genericCreateFailureMessage: '[ja] Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: '[ja] Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: '[ja] Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: '[ja] Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: '[ja] Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '[ja] <rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: '[ja] There was an error uploading your receipt.',
            genericDeleteFailureMessage: '[ja] Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: '[ja] Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: '[ja] Transaction is missing fields',
            duplicateWaypointsErrorMessage: '[ja] Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: '[ja] Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: '[ja] An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: '[ja] Please enter a valid merchant',
            atLeastOneAttendee: '[ja] At least one attendee must be selected',
            invalidQuantity: '[ja] Please enter a valid quantity',
            quantityGreaterThanZero: '[ja] Quantity must be greater than zero',
            invalidSubrateLength: '[ja] There must be at least one subrate',
            invalidRate: '[ja] Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "[ja] The end date can't be before the start date",
            endDateSameAsStartDate: "[ja] The end date can't be the same as the start date",
            manySplitsProvided: `[ja] The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `[ja] The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
        },
        dismissReceiptError: '[ja] Dismiss error',
        dismissReceiptErrorConfirmation: '[ja] Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `[ja] started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: '[ja] Enable wallet',
        hold: '[ja] Hold',
        unhold: '[ja] Remove hold',
        holdExpense: () => ({
            one: '[ja] Hold expense',
            other: '[ja] Hold expenses',
        }),
        unholdExpense: '[ja] Unhold expense',
        heldExpense: '[ja] held this expense',
        unheldExpense: '[ja] unheld this expense',
        moveUnreportedExpense: '[ja] Move unreported expense',
        addUnreportedExpense: '[ja] Add unreported expense',
        selectUnreportedExpense: '[ja] Select at least one expense to add to the report.',
        emptyStateUnreportedExpenseTitle: '[ja] No unreported expenses',
        emptyStateUnreportedExpenseSubtitle: '[ja] Looks like you don’t have any unreported expenses. Try creating one below.',
        addUnreportedExpenseConfirm: '[ja] Add to report',
        newReport: '[ja] New report',
        explainHold: () => ({
            one: "[ja] Explain why you're holding this expense.",
            other: "[ja] Explain why you're holding these expenses.",
        }),
        explainHoldApprover: () => ({
            one: '[ja] Explain what you need before approving this expense.',
            other: '[ja] Explain what you need before approving these expenses.',
        }),
        retracted: '[ja] retracted',
        retract: '[ja] Retract',
        reopened: '[ja] reopened',
        reopenReport: '[ja] Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `[ja] This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: '[ja] Reason',
        holdReasonRequired: '[ja] A reason is required when holding.',
        expenseWasPutOnHold: '[ja] Expense was put on hold',
        expenseOnHold: '[ja] This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: '[ja] All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: '[ja] This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: '[ja] Some of these duplicates have been approved or paid already.',
        reviewDuplicates: '[ja] Review duplicates',
        keepAll: '[ja] Keep all',
        noDuplicatesTitle: '[ja] All set!',
        noDuplicatesDescription: '[ja] There are no duplicate transactions for review here.',
        confirmApprove: '[ja] Confirm approval amount',
        confirmApprovalAmount: '[ja] Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: '[ja] This expense is on hold. Do you want to approve anyway?',
            other: '[ja] These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: '[ja] Confirm payment amount',
        confirmPayAmount: "[ja] Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: '[ja] This expense is on hold. Do you want to pay anyway?',
            other: '[ja] These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: '[ja] Pay only',
        approveOnly: '[ja] Approve only',
        holdEducationalTitle: '[ja] Should you hold this expense?',
        whatIsHoldExplain: "[ja] Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: '[ja] Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "[ja] Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: '[ja] You moved this report!',
            description: '[ja] Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '[ja] <strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: '[ja] This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: '[ja] Change workspace',
        set: '[ja] set',
        changed: '[ja] changed',
        removed: '[ja] removed',
        transactionPending: '[ja] Transaction pending.',
        chooseARate: '[ja] Select a workspace reimbursement rate per mile or kilometer',
        unapprove: '[ja] Unapprove',
        unapproveReport: '[ja] Unapprove report',
        headsUp: '[ja] Heads up!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `[ja] This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: '[ja] reimbursable',
        nonReimbursable: '[ja] non-reimbursable',
        bookingPending: '[ja] This booking is pending',
        bookingPendingDescription: "[ja] This booking is pending because it hasn't been paid yet.",
        bookingArchived: '[ja] This booking is archived',
        bookingArchivedDescription: '[ja] This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: '[ja] Attendees',
        totalPerAttendee: '[ja] Per attendee',
        whoIsYourAccountant: '[ja] Who is your accountant?',
        paymentComplete: '[ja] Payment complete',
        time: '[ja] Time',
        startDate: '[ja] Start date',
        endDate: '[ja] End date',
        startTime: '[ja] Start time',
        endTime: '[ja] End time',
        deleteSubrate: '[ja] Delete subrate',
        deleteSubrateConfirmation: '[ja] Are you sure you want to delete this subrate?',
        quantity: '[ja] Quantity',
        subrateSelection: '[ja] Select a subrate and enter a quantity.',
        qty: '[ja] Qty',
        firstDayText: () => ({
            one: `[ja] First day: 1 hour`,
            other: (count: number) => `[ja] First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `[ja] Last day: 1 hour`,
            other: (count: number) => `[ja] Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `[ja] Trip: 1 full day`,
            other: (count: number) => `[ja] Trip: ${count} full days`,
        }),
        dates: '[ja] Dates',
        rates: '[ja] Rates',
        submitsTo: (name: string) => `[ja] Submits to ${name}`,
        reject: {
            educationalTitle: '[ja] Should you hold or reject?',
            educationalText: "[ja] If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: '[ja] Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: '[ja] Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: '[ja] Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "[ja] Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: '[ja] Reject expense',
            reasonPageDescription: '[ja] Explain why you will not approve this expense.',
            rejectReason: '[ja] Rejection reason',
            markAsResolved: '[ja] Mark as resolved',
            rejectedStatus: '[ja] This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: '[ja] rejected this expense',
                markedAsResolved: '[ja] marked the rejection reason as resolved',
            },
        },
        rejectReport: {
            title: '[ja] Reject report',
            description: '[ja] Explain why you will not approve this report:',
            rejectReason: '[ja] Rejection reason',
            selectTarget: '[ja] Choose the member to reject this report back to for review:',
            lastApprover: '[ja] Last approver',
            submitter: '[ja] Submitter',
            rejectedReportMessage: '[ja] This report was rejected.',
            rejectedNextStep: '[ja] This report was rejected. Waiting on you to fix the issues and manually resubmit.',
            selectMemberError: '[ja] Select a member to reject this report back to.',
            couldNotReject: '[ja] The report could not be rejected. Please try again.',
        },
        moveExpenses: '[ja] Move to report',
        moveExpensesError: "[ja] You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: '[ja] Change approver',
            header: (workflowSettingLink: string) =>
                `[ja] Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `[ja] changed the approver to <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '[ja] Add approver',
                addApproverSubtitle: '[ja] Add an additional approver to the existing workflow.',
                bypassApprovers: '[ja] Bypass approvers',
                bypassApproversSubtitle: '[ja] Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: '[ja] Choose an additional approver for this report before we route through the rest of the approval workflow.',
                bulkSubtitle: '[ja] Choose an additional approver for these reports before we route through the rest of the approval workflow.',
            },
            bulkSubtitle: '[ja] Choose an option to change the approver for these reports.',
        },
        chooseWorkspace: '[ja] Choose a workspace',
        routedDueToDEW: (to: string, reason?: string) => `[ja] report routed to ${to}${reason ? `[ja]  because ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `[ja] ${hours} ${hours === 1 ? '[ja] hour' : '[ja] hours'} @ ${rate} / hour`,
            hrs: '[ja] hrs',
            hours: '[ja] Hours',
            ratePreview: (rate: string) => `[ja] ${rate} / hour`,
            amountTooLargeError: '[ja] The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctRateError: '[ja] Fix the rate error and try again.',
        AskToExplain: `[ja] . <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explain<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '[ja] marked the expense as "reimbursable"' : '[ja] marked the expense as "non-reimbursable"'),
            billable: (value: boolean) => (value ? '[ja] marked the expense as "billable"' : '[ja] marked the expense as "non-billable"'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `[ja] set the tax rate to "${value}"` : `[ja] tax rate to "${value}"`),
            reportName: (value: string) => `[ja] moved this expense to report "${value}"`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `[ja] set the ${field} to "${value}"` : `[ja] ${field} to "${value}"`;
            },
            formatPersonalRules: (fragments: string, route: string) => `[ja] ${fragments} via <a href="${route}">personal expense rules</a>`,
            formatPolicyRules: (fragments: string, route: string) => `[ja] ${fragments} via <a href="${route}">workspace rules</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: "[ja] You can't duplicate per diem expenses across workspaces because the rates may differ between workspaces.",
        cannotDuplicateDistanceExpense: "[ja] You can't duplicate distance expenses across workspaces because the rates may differ between workspaces.",
        taxDisabledAlert: {
            title: '[ja] Tax disabled',
            prompt: '[ja] Enable tax tracking on the workspace to edit the expense details or delete the tax from this expense.',
            confirmText: '[ja] Delete tax',
        },
    },
    transactionMerge: {
        listPage: {
            header: '[ja] Merge expenses',
            noEligibleExpenseFound: '[ja] No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `[ja] <muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `[ja] Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '[ja] Select receipt',
            pageTitle: '[ja] Select the receipt you want to keep:',
        },
        detailsPage: {
            header: '[ja] Select details',
            pageTitle: '[ja] Select the details you want to keep:',
            noDifferences: '[ja] No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '[ja] an' : '[ja] a';
                return `[ja] Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: '[ja] Please select attendees',
            selectAllDetailsError: '[ja] Select all details before continuing.',
        },
        confirmationPage: {
            header: '[ja] Confirm details',
            pageTitle: "[ja] Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: '[ja] Merge expenses',
        },
    },
    share: {
        shareToExpensify: '[ja] Share to Expensify',
        messageInputLabel: '[ja] Message',
    },
    notificationPreferencesPage: {
        header: '[ja] Notification preferences',
        label: '[ja] Notify me about new messages',
        notificationPreferences: {
            always: '[ja] Immediately',
            daily: '[ja] Daily',
            mute: '[ja] Mute',
            hidden: '[ja][ctx: UI label indicating that something is concealed or not visible to the user.] Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "[ja] The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "[ja] The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: '[ja] Upload photo',
        removePhoto: '[ja] Remove photo',
        editImage: '[ja] Edit photo',
        viewPhoto: '[ja] View photo',
        imageUploadFailed: '[ja] Image upload failed',
        deleteWorkspaceError: '[ja] Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `[ja] The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `[ja] Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `[ja] Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: '[ja] Edit profile picture',
        upload: '[ja] Upload',
        uploadPhoto: '[ja] Upload photo',
        selectAvatar: '[ja] Select avatar',
        choosePresetAvatar: '[ja] Or choose a custom avatar',
    },
    modal: {
        backdropLabel: '[ja] Modal Backdrop',
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
                        return `[ja] Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] Waiting for an admin to add expenses.`;
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
                        return `[ja] Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] Waiting for an admin to submit expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `[ja] No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[ja] Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] Waiting for an admin to add a bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[ja]  on the ${eta} of each month` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[ja] Waiting for your expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] Waiting for an admin's expenses to automatically submit${formattedETA}.`;
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
                        return `[ja] Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] Waiting for an admin to fix the issues.`;
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
                        return `[ja] Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] Waiting for an admin to approve expenses.`;
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
                        return `[ja] Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] Waiting for an admin to export this report.`;
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
                        return `[ja] Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] Waiting for an admin to pay expenses.`;
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
                        return `[ja] Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] Waiting for an admin to finish setting up a business bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[ja]  by ${eta}` : ` ${eta}`;
                }
                return `[ja] Waiting for payment to complete${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `[ja] Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[ja] This report was rejected. Waiting on <strong>you</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[ja] This report was rejected. Waiting on <strong>${actor}</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[ja] This report was rejected. Waiting on an admin to fix the issues and manually resubmit.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '[ja] shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '[ja] later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '[ja] on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '[ja] on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '[ja] on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '[ja] on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '[ja] at the end of your trip',
        },
    },
    profilePage: {
        profile: '[ja] Profile',
        preferredPronouns: '[ja] Preferred pronouns',
        selectYourPronouns: '[ja] Select your pronouns',
        selfSelectYourPronoun: '[ja] Self-select your pronoun',
        emailAddress: '[ja] Email address',
        setMyTimezoneAutomatically: '[ja] Set my timezone automatically',
        timezone: '[ja] Timezone',
        invalidFileMessage: '[ja] Invalid file. Please try a different image.',
        avatarUploadFailureMessage: '[ja] An error occurred uploading the avatar. Please try again.',
        online: '[ja] Online',
        offline: '[ja] Offline',
        syncing: '[ja] Syncing',
        profileAvatar: '[ja] Profile avatar',
        publicSection: {
            title: '[ja] Public',
            subtitle: '[ja] These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: '[ja] Private',
            subtitle: "[ja] These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: '[ja] Security options',
        subtitle: '[ja] Enable two-factor authentication to keep your account safe.',
        goToSecurity: '[ja] Go back to security page',
    },
    shareCodePage: {
        title: '[ja] Your code',
        subtitle: '[ja] Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: '[ja] Pronouns',
        isShownOnProfile: '[ja] Your pronouns are shown on your profile.',
        placeholderText: '[ja] Search to see options',
    },
    contacts: {
        contactMethods: '[ja] Contact methods',
        featureRequiresValidate: '[ja] This feature requires you to validate your account.',
        validateAccount: '[ja] Validate your account',
        helpText: ({email}: {email: string}) =>
            `[ja] Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: '[ja] Please verify this contact method.',
        getInTouch: "[ja] We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `[ja] Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '[ja] Set as default',
        yourDefaultContactMethod: "[ja] This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        yourDefaultContactMethodRestrictedSwitch: '[ja] This is your current default contact method. Your company has restricted removing or changing it.',
        removeContactMethod: '[ja] Remove contact method',
        removeAreYouSure: "[ja] Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: '[ja] Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: '[ja] Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: '[ja] Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: '[ja] Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: '[ja] Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: '[ja] Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: '[ja] This contact method already exists',
            passwordRequired: '[ja] password required.',
            contactMethodRequired: '[ja] Contact method is required',
            invalidContactMethod: '[ja] Invalid contact method',
        },
        newContactMethod: '[ja] New contact method',
        goBackContactMethods: '[ja] Go back to contact methods',
    },
    pronouns: {
        coCos: '[ja] Co / Cos',
        eEyEmEir: '[ja] E / Ey / Em / Eir',
        faeFaer: '[ja] Fae / Faer',
        heHimHis: '[ja] He / Him / His',
        heHimHisTheyThemTheirs: '[ja] He / Him / His / They / Them / Theirs',
        sheHerHers: '[ja] She / Her / Hers',
        sheHerHersTheyThemTheirs: '[ja] She / Her / Hers / They / Them / Theirs',
        merMers: '[ja] Mer / Mers',
        neNirNirs: '[ja] Ne / Nir / Nirs',
        neeNerNers: '[ja] Nee / Ner / Ners',
        perPers: '[ja] Per / Pers',
        theyThemTheirs: '[ja] They / Them / Theirs',
        thonThons: '[ja] Thon / Thons',
        veVerVis: '[ja] Ve / Ver / Vis',
        viVir: '[ja] Vi / Vir',
        xeXemXyr: '[ja] Xe / Xem / Xyr',
        zeZieZirHir: '[ja] Ze / Zie / Zir / Hir',
        zeHirHirs: '[ja] Ze / Hir',
        callMeByMyName: '[ja] Call me by my name',
    },
    displayNamePage: {
        headerTitle: '[ja] Display name',
        isShownOnProfile: '[ja] Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: '[ja] Timezone',
        isShownOnProfile: '[ja] Your timezone is shown on your profile.',
        getLocationAutomatically: '[ja] Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: '[ja] Update required',
        pleaseInstall: '[ja] Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: '[ja] Please install the latest version of Expensify',
        toGetLatestChanges: '[ja] For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: '[ja] The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: '[ja] About',
        aboutPage: {
            description: '[ja] The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: '[ja] App download links',
            viewKeyboardShortcuts: '[ja] View keyboard shortcuts',
            viewTheCode: '[ja] View the code',
            viewOpenJobs: '[ja] View open jobs',
            reportABug: '[ja] Report a bug',
            troubleshoot: '[ja] Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: '[ja] Android',
            },
            ios: {
                label: '[ja] iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '[ja] Clear cache and restart',
            description:
                '[ja] <muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: '[ja] All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: '[ja] Reset and refresh',
            clientSideLogging: '[ja] Client side logging',
            noLogsToShare: '[ja] No logs to share',
            useProfiling: '[ja] Use profiling',
            profileTrace: '[ja] Profile trace',
            results: '[ja] Results',
            releaseOptions: '[ja] Release options',
            testingPreferences: '[ja] Testing preferences',
            useStagingServer: '[ja] Use Staging Server',
            forceOffline: '[ja] Force offline',
            simulatePoorConnection: '[ja] Simulate poor internet connection',
            simulateFailingNetworkRequests: '[ja] Simulate failing network requests',
            authenticationStatus: '[ja] Authentication status',
            deviceCredentials: '[ja] Device credentials',
            invalidate: '[ja] Invalidate',
            destroy: '[ja] Destroy',
            maskExportOnyxStateData: '[ja] Mask fragile member data while exporting Onyx state',
            exportOnyxState: '[ja] Export Onyx state',
            importOnyxState: '[ja] Import Onyx state',
            testCrash: '[ja] Test crash',
            resetToOriginalState: '[ja] Reset to original state',
            usingImportedState: '[ja] You are using imported state. Press here to clear it.',
            debugMode: '[ja] Debug mode',
            invalidFile: '[ja] Invalid file',
            invalidFileDescription: '[ja] The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: '[ja] Invalidate with delay',
            leftHandNavCache: '[ja] Left Hand Nav cache',
            clearleftHandNavCache: '[ja] Clear',
            softKillTheApp: '[ja] Soft kill the app',
            kill: '[ja] Kill',
            sentryDebug: '[ja] Sentry debug',
            sentrySendDescription: '[ja] Send data to Sentry',
            sentryDebugDescription: '[ja] Log Sentry requests to console',
            sentryHighlightedSpanOps: '[ja] Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: '[ja] ui.interaction.click, navigation, ui.load',
        },
        security: '[ja] Security',
        signOut: '[ja] Sign out',
        restoreStashed: '[ja] Restore stashed login',
        signOutConfirmationText: "[ja] You'll lose any offline changes if you sign out.",
        versionLetter: '[ja] v',
        readTheTermsAndPrivacy: `[ja] Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.`,
        help: '[ja] Help',
        helpPage: {
            title: '[ja] Help and support',
            description: '[ja] We are here to help you 24/7',
            helpSite: '[ja] Help site',
            conciergeChat: '[ja] Concierge',
            conciergeChatDescription: '[ja] Your personal AI agent',
            accountManagerDescription: '[ja] Your account manager',
            partnerManagerDescription: '[ja] Your partner manager',
            guideDescription: '[ja] Your setup specialist',
        },
        whatIsNew: "[ja] What's new",
        accountSettings: '[ja] Account settings',
        account: '[ja] Account',
        general: '[ja] General',
    },
    closeAccountPage: {
        closeAccount: '[ja][ctx: close as a verb, not an adjective] Close account',
        reasonForLeavingPrompt: '[ja] We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: '[ja] Enter message here',
        closeAccountWarning: '[ja] Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: '[ja] Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: '[ja] Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: '[ja] Enter your default contact method',
        defaultContact: '[ja] Default contact method:',
        enterYourDefaultContactMethod: '[ja] Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: '[ja] Merge accounts',
        accountDetails: {
            accountToMergeInto: (login: string) => `[ja] Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: '[ja] I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: '[ja] Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: (login: string) => `[ja] Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `[ja] To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: '[ja] Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: '[ja] Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: '[ja] Accounts merged!',
            description: (from: string, to: string) =>
                `[ja] <muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '[ja] We’re working on it',
            limitedSupport: '[ja] We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp: '[ja] <muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: '[ja] Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `[ja] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `[ja] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `[ja] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: '[ja] Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `[ja] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `[ja] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `[ja] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `[ja] <muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '[ja] Try again later',
            description: '[ja] There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "[ja] You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: '[ja] You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: '[ja] Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '[ja] Report suspicious activity',
        lockAccount: '[ja] Lock account',
        unlockAccount: '[ja] Unlock account',
        unlockTitle: '[ja] We’ve received your request',
        unlockDescription: '[ja] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        compromisedDescription:
            '[ja] Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: '[ja] For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: '[ja] Are you sure you want to lock your Expensify account?',
        onceLocked: '[ja] Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '[ja] Failed to lock account',
        failedToLockAccountDescription: `[ja] We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: '[ja] Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: '[ja] Account locked',
        yourAccountIsLocked: '[ja] Your account is locked',
        chatToConciergeToUnlock: '[ja] Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: '[ja] Chat with Concierge',
    },
    twoFactorAuth: {
        headerTitle: '[ja] Two-factor authentication',
        twoFactorAuthEnabled: '[ja] Two-factor authentication enabled',
        whatIsTwoFactorAuth: '[ja] Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: '[ja] Disable two-factor authentication',
        explainProcessToRemove: '[ja] To disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: '[ja] To disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: '[ja] Two-factor authentication is now disabled',
        noAuthenticatorApp: '[ja] You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: '[ja] Recovery codes',
        keepCodesSafe: '[ja] Keep these recovery codes safe!',
        codesLoseAccess: dedent(`
            [ja] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            Note: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        errorStepCodes: '[ja] Please copy or download codes before continuing',
        stepVerify: '[ja] Verify',
        scanCode: '[ja] Scan the QR code using your',
        authenticatorApp: '[ja] authenticator app',
        addKey: '[ja] Or add this secret key to your authenticator app:',
        secretKey: '[ja] secret key',
        enterCode: '[ja] Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: '[ja] Finished',
        enabled: '[ja] Two-factor authentication enabled',
        congrats: '[ja] Congrats! Now you’ve got that extra security.',
        copy: '[ja] Copy',
        disable: '[ja] Disable',
        enableTwoFactorAuth: '[ja] Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: '[ja] Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: '[ja] For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: '[ja] Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: '[ja] Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: '[ja] Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: '[ja] Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: '[ja] Cannot disable 2FA',
        twoFactorAuthRequired: '[ja] Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
        replaceDevice: '[ja] Replace device',
        replaceDeviceTitle: '[ja] Replace two-factor device',
        verifyOldDeviceTitle: '[ja] Verify old device',
        verifyOldDeviceDescription: '[ja] Enter the six-digit code from your current authenticator app to confirm you have access to it.',
        verifyNewDeviceTitle: '[ja] Set up new device',
        verifyNewDeviceDescription: '[ja] Scan the QR code with your new device, then enter the code to complete setup.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '[ja] Please enter your recovery code',
            incorrectRecoveryCode: '[ja] Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: '[ja] Use recovery code',
        recoveryCode: '[ja] Recovery code',
        use2fa: '[ja] Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '[ja] Please enter your two-factor authentication code',
            incorrect2fa: '[ja] Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '[ja] Password updated!',
        allSet: '[ja] You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: '[ja] Private notes',
        personalNoteMessage: "[ja] Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: '[ja] Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: '[ja] Notes',
        myNote: '[ja] My note',
        error: {
            genericFailureMessage: "[ja] Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: '[ja] Please enter a valid security code',
        },
        securityCode: '[ja] Security code',
        changeBillingCurrency: '[ja] Change billing currency',
        changePaymentCurrency: '[ja] Change payment currency',
        paymentCurrency: '[ja] Payment currency',
        paymentCurrencyDescription: '[ja] Select a standardized currency that all personal expenses should be converted to',
        note: `[ja] Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: '[ja] Add a debit card',
        nameOnCard: '[ja] Name on card',
        debitCardNumber: '[ja] Debit card number',
        expiration: '[ja] Expiration date',
        expirationDate: '[ja] MMYY',
        cvv: '[ja] CVV',
        billingAddress: '[ja] Billing address',
        growlMessageOnSave: '[ja] Your debit card was successfully added',
        expensifyPassword: '[ja] Expensify password',
        error: {
            invalidName: '[ja] Name can only include letters',
            addressZipCode: '[ja] Please enter a valid zip code',
            debitCardNumber: '[ja] Please enter a valid debit card number',
            expirationDate: '[ja] Please select a valid expiration date',
            securityCode: '[ja] Please enter a valid security code',
            addressStreet: "[ja] Please enter a valid billing address that's not a PO box",
            addressState: '[ja] Please select a state',
            addressCity: '[ja] Please enter a city',
            genericFailureMessage: '[ja] An error occurred while adding your card. Please try again.',
            password: '[ja] Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '[ja] Add payment card',
        nameOnCard: '[ja] Name on card',
        paymentCardNumber: '[ja] Card number',
        expiration: '[ja] Expiration date',
        expirationDate: '[ja] MM/YY',
        cvv: '[ja] CVV',
        billingAddress: '[ja] Billing address',
        growlMessageOnSave: '[ja] Your payment card was successfully added',
        expensifyPassword: '[ja] Expensify password',
        error: {
            invalidName: '[ja] Name can only include letters',
            addressZipCode: '[ja] Please enter a valid zip code',
            paymentCardNumber: '[ja] Please enter a valid card number',
            expirationDate: '[ja] Please select a valid expiration date',
            securityCode: '[ja] Please enter a valid security code',
            addressStreet: "[ja] Please enter a valid billing address that's not a PO box",
            addressState: '[ja] Please select a state',
            addressCity: '[ja] Please enter a city',
            genericFailureMessage: '[ja] An error occurred while adding your card. Please try again.',
            password: '[ja] Please enter your Expensify password',
        },
    },
    personalCard: {
        addPersonalCard: '[ja] Add personal card',
        addCompanyCard: '[ja] Add company card',
        lookingForCompanyCards: '[ja] Need to add company cards?',
        lookingForCompanyCardsDescription: '[ja] Bring your own cards from 10,000+ banks worldwide.',
        personalCardAdded: '[ja] Personal card added!',
        personalCardAddedDescription: '[ja] Congrats, we’ll begin importing transactions from your card.',
        isPersonalCard: '[ja] Is this a personal card?',
        thisIsPersonalCard: '[ja] This is a personal card',
        thisIsCompanyCard: '[ja] This is a company card',
        askAdmin: '[ja] Ask your admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `[ja] If so, great! But if it's a <strong>company</strong> card, please ${isAdmin ? '[ja] assign it from your workspace instead.' : '[ja] ask your admin to assign it to you from the workspace instead.'}`,
        bankConnectionError: '[ja] Bank connection issue',
        bankConnectionDescription: '[ja] Please try adding your cards again. Otherwise, you can',
        connectWithPlaid: '[ja] connect via Plaid.',
        brokenConnection: '[ja] Your card connection is broken.',
        fixCard: '[ja] Fix card',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `[ja] Your ${cardName} card connection is broken. <a href="${connectionLink}">Log into your bank</a> to fix the card.`
                : `[ja] Your ${cardName} card connection is broken. Log into your bank to fix the card.`,
        addAdditionalCards: '[ja] Add additional cards',
        upgradeDescription: '[ja] Need to add more cards? Create a workspace to add additional personal cards or assign company cards to the entire team.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `[ja] <muted-text>This is available on the Collect plan, which is <strong>${formattedPrice}</strong> per member per month.</muted-text>`,
        note: (subscriptionLink: string) =>
            `[ja] <muted-text>Create a workspace to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
        workspaceCreated: '[ja] Workspace created',
        newWorkspace: '[ja] You created a workspace!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `[ja] <centered-text>You’re all set to add additional cards. <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
    },
    walletPage: {
        balance: '[ja] Balance',
        paymentMethodsTitle: '[ja] Payment methods',
        setDefaultConfirmation: '[ja] Make default payment method',
        setDefaultSuccess: '[ja] Default payment method set!',
        deleteAccount: '[ja] Delete account',
        deleteConfirmation: '[ja] Are you sure you want to delete this account?',
        deleteCard: '[ja] Delete card',
        deleteCardConfirmation:
            '[ja] All unsubmitted card transactions, including those on open reports, will be removed. Are you sure you want to delete this card? You cannot undo this action.',
        error: {
            notOwnerOfBankAccount: '[ja] An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: '[ja] This bank account is temporarily suspended',
            notOwnerOfFund: '[ja] An error occurred while setting this card as your default payment method',
            setDefaultFailure: '[ja] Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: '[ja] An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: '[ja] Get paid faster',
        addPaymentMethod: '[ja] Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: '[ja] Get paid back faster',
        secureAccessToYourMoney: '[ja] Secure access to your money',
        receiveMoney: '[ja] Receive money in your local currency',
        expensifyWallet: '[ja] Expensify Wallet (Beta)',
        sendAndReceiveMoney: '[ja] Send and receive money with friends. US bank accounts only.',
        enableWallet: '[ja] Enable wallet',
        addBankAccountToSendAndReceive: '[ja] Add a bank account to make or receive payments.',
        addDebitOrCreditCard: '[ja] Add debit or credit card',
        cardInactive: '[ja] Inactive',
        assignedCards: '[ja] Assigned cards',
        assignedCardsDescription: '[ja] Transactions from these cards sync automatically.',
        expensifyCard: '[ja] Expensify Card',
        walletActivationPending: "[ja] We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "[ja] Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: '[ja] Add your bank account',
        addBankAccountBody: "[ja] Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: '[ja] Choose your bank account',
        chooseAccountBody: '[ja] Make sure that you select the right one.',
        confirmYourBankAccount: '[ja] Confirm your bank account',
        personalBankAccounts: '[ja] Personal bank accounts',
        businessBankAccounts: '[ja] Business bank accounts',
        shareBankAccount: '[ja] Share bank account',
        bankAccountShared: '[ja] Bank account shared',
        shareBankAccountTitle: '[ja] Select the admins to share this bank account with:',
        shareBankAccountSuccess: '[ja] Bank account shared!',
        shareBankAccountSuccessDescription: '[ja] The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: '[ja] An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: '[ja] No admins available',
        shareBankAccountEmptyDescription: '[ja] There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: '[ja] Please select an admin before continuing',
        unshareBankAccount: '[ja] Unshare bank account',
        unshareBankAccountDescription: '[ja] Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `[ja] ${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: '[ja] It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: `[ja] Can't unshare bank account`,
        travelCVV: {
            title: '[ja] Travel CVV',
            subtitle: '[ja] Use this when booking travel',
            description: "[ja] Use this card for your Expensify Travel bookings. It'll show as “Travel Card” at checkout.",
        },
        chaseAccountNumberDifferent: '[ja] Why is my account number different?',
    },
    cardPage: {
        expensifyCard: '[ja] Expensify Card',
        expensifyTravelCard: '[ja] Expensify Travel Card',
        availableSpend: '[ja] Remaining limit',
        smartLimit: {
            name: '[ja] Smart limit',
            title: (formattedLimit: string) => `[ja] You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: '[ja] Fixed limit',
            title: (formattedLimit: string) => `[ja] You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: '[ja] Monthly limit',
            title: (formattedLimit: string) => `[ja] You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: '[ja] Virtual card number',
        travelCardCvv: '[ja] Travel card CVV',
        physicalCardNumber: '[ja] Physical card number',
        physicalCardPin: '[ja] PIN',
        getPhysicalCard: '[ja] Get physical card',
        reportFraud: '[ja] Report virtual card fraud',
        reportTravelFraud: '[ja] Report travel card fraud',
        reviewTransaction: '[ja] Review transaction',
        suspiciousBannerTitle: '[ja] Suspicious transaction',
        suspiciousBannerDescription: '[ja] We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "[ja] Your card is temporarily locked while our team reviews your company's account.",
        markTransactionsAsReimbursable: '[ja] Mark transactions as reimbursable',
        markTransactionsDescription: '[ja] When enabled, transactions imported from this card are marked as reimbursable by default.',
        csvCardDescription: '[ja] CSV Import',
        cardDetails: {
            cardNumber: '[ja] Virtual card number',
            expiration: '[ja] Expiration',
            cvv: '[ja] CVV',
            address: '[ja] Address',
            revealDetails: '[ja] Reveal details',
            revealCvv: '[ja] Reveal CVV',
            copyCardNumber: '[ja] Copy card number',
            updateAddress: '[ja] Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `[ja] Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: '[ja] An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "[ja] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[ja] Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        unexpectedError: '[ja] There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: '[ja] Yes, I do',
            reportFraudButtonText: "[ja] No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `[ja] cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `[ja] deactivated the card ending in ${cardLastFour}`,
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
            }) => `[ja] identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?

${amount} for ${merchant} - ${date}`,
        },
        setYourPin: '[ja] Set the PIN for your card.',
        confirmYourPin: '[ja] Enter your PIN again to confirm.',
        changeYourPin: '[ja] Enter a new PIN for your card.',
        confirmYourChangedPin: '[ja] Confirm your new PIN.',
        pinMustBeFourDigits: '[ja] PIN must be exactly 4 digits.',
        invalidPin: '[ja] Please choose a more secure PIN.',
        pinMismatch: '[ja] PINs do not match. Please try again.',
        revealPin: '[ja] Reveal PIN',
        hidePin: '[ja] Hide PIN',
        pin: '[ja] PIN',
        pinChanged: '[ja] PIN changed!',
        pinChangedHeader: '[ja] PIN changed',
        pinChangedDescription: "[ja] You're all set to use your PIN now.",
        changePin: '[ja] Change PIN',
        changePinAtATM: '[ja] Change your PIN at any ATM',
        changePinAtATMDescription: '[ja] This is required in your region. <concierge-link>Reach out to Concierge</concierge-link> if you have any questions.',
        freezeCard: '[ja] Freeze card',
        unfreeze: '[ja] Unfreeze',
        unfreezeCard: '[ja] Unfreeze card',
        askToUnfreeze: '[ja] Ask to unfreeze',
        freezeDescription: '[ja] A frozen card cannot be used for purchases and transactions. You can unfreeze it at any time.',
        unfreezeDescription: "[ja] Unfreezing this card will start allowing purchases and transactions again. Only proceed if you're sure the card is safe to use.",
        frozen: '[ja] Frozen',
        youFroze: ({date}: {date: string}) => `[ja] You froze this card on ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `[ja] ${person} froze this card on ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `[ja] This card was frozen on ${date} by `,
        frozenByAdminNeedsUnfreezePrefix: '[ja] This card was frozen by ',
        frozenByAdminNeedsUnfreezeSuffix: '[ja] . Please contact an admin to unfreeze it.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `[ja] This card was frozen by ${person}. Please contact an admin to unfreeze it.`,
    },
    workflowsPage: {
        workflowTitle: '[ja] Spend',
        workflowDescription: '[ja] Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: '[ja] Submissions',
        submissionFrequencyDescription: '[ja] Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: '[ja] Date of month',
        disableApprovalPromptDescription: '[ja] Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: '[ja] Approvals',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `[ja] expenses from ${members}, and the approver is ${approvers}`,
        addApprovalButton: '[ja] Add approval workflow',
        findWorkflow: '[ja] Find workflow',
        addApprovalTip: '[ja] This default workflow applies to all members, unless a more specific workflow exists.',
        approver: '[ja] Approver',
        addApprovalsDescription: '[ja] Require additional approval before authorizing a payment.',
        makeOrTrackPaymentsTitle: '[ja] Payments',
        makeOrTrackPaymentsDescription: '[ja] Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '[ja] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '[ja] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: '[ja] Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: '[ja] Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: '[ja] Instantly',
            weekly: '[ja] Weekly',
            monthly: '[ja] Monthly',
            twiceAMonth: '[ja] Twice a month',
            byTrip: '[ja] By trip',
            manually: '[ja] Manually',
            daily: '[ja] Daily',
            lastDayOfMonth: '[ja] Last day of the month',
            lastBusinessDayOfMonth: '[ja] Last business day of the month',
            ordinals: {
                one: '[ja] st',
                two: '[ja] nd',
                few: '[ja] rd',
                other: '[ja] th',
                '1': '[ja] First',
                '2': '[ja] Second',
                '3': '[ja] Third',
                '4': '[ja] Fourth',
                '5': '[ja] Fifth',
                '6': '[ja] Sixth',
                '7': '[ja] Seventh',
                '8': '[ja] Eighth',
                '9': '[ja] Ninth',
                '10': '[ja] Tenth',
            },
        },
        approverInMultipleWorkflows: '[ja] This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `[ja] <strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: '[ja] No members to display',
            expensesFromSubtitle: '[ja] All workspace members already belong to an existing approval workflow.',
            approverSubtitle: '[ja] All approvers belong to an existing workflow.',
            bulkApproverSubtitle: '[ja] No approvers match the criteria for selected reports.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "[ja] Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "[ja] Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: '[ja] Confirm',
        header: '[ja] Add more approvers and confirm.',
        additionalApprover: '[ja] Additional approver',
        submitButton: '[ja] Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: '[ja] Edit approval workflow',
        deleteTitle: '[ja] Delete approval workflow',
        deletePrompt: '[ja] Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: '[ja] Expenses from',
        header: '[ja] When the following members submit expenses:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "[ja] The approver couldn't be changed. Please try again or contact support.",
        title: '[ja] Set approver',
        description: '[ja] This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: '[ja] Approver',
        header: '[ja] (Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `[ja] Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : '[ja] Add another approver when a report exceeds the amount below:',
        reportAmountLabel: '[ja] Report amount',
        additionalApproverLabel: '[ja] Additional approver',
        skip: '[ja] Skip',
        next: '[ja] Next',
        removeLimit: '[ja] Remove limit',
        enterAmountError: '[ja] Please enter a valid amount',
        enterApproverError: '[ja] Approver is required when you set a report limit',
        enterBothError: '[ja] Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `[ja] Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: '[ja] Authorized payer',
        genericErrorMessage: '[ja] The authorized payer could not be changed. Please try again.',
        admins: '[ja] Admins',
        payer: '[ja] Payer',
        paymentAccount: '[ja] Payment account',
        shareBankAccount: {
            shareTitle: '[ja] Share bank account access?',
            shareDescription: ({admin}: {admin: string}) => `[ja] You'll need to share bank account access with ${admin} to make them the payer.`,
            validationTitle: '[ja] Bank account awaiting validation',
            validationDescription: ({admin}: {admin: string}) =>
                `[ja] You need to <a href="#">validate this bank account</a>. Once that's done, you can share bank account access with ${admin} to make them the payer.`,
            errorTitle: "[ja] Can't change payer",
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `[ja] ${admin} doesn't have access to this bank account, so you can't make them the payer. <a href="#">Chat with ${owner}</a> if the bank account should be shared.`,
        },
    },
    reportFraudPage: {
        title: '[ja] Report virtual card fraud',
        description: '[ja] If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: '[ja] Deactivate card',
        reportVirtualCardFraud: '[ja] Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: '[ja] Card fraud reported',
        description: '[ja] We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        buttonText: '[ja] Got it, thanks!',
    },
    activateCardPage: {
        activateCard: '[ja] Activate card',
        pleaseEnterLastFour: '[ja] Please enter the last four digits of your card.',
        activatePhysicalCard: '[ja] Activate physical card',
        error: {
            thatDidNotMatch: "[ja] That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "[ja] You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: '[ja] Get physical card',
        nameMessage: '[ja] Enter your first and last name, as this will be shown on your card.',
        legalName: '[ja] Legal name',
        legalFirstName: '[ja] Legal first name',
        legalLastName: '[ja] Legal last name',
        phoneMessage: '[ja] Enter your phone number.',
        phoneNumber: '[ja] Phone number',
        address: '[ja] Address',
        addressMessage: '[ja] Enter your shipping address.',
        streetAddress: '[ja] Street Address',
        city: '[ja] City',
        state: '[ja] State',
        zipPostcode: '[ja] Zip/Postcode',
        country: '[ja] Country',
        confirmMessage: '[ja] Please confirm your details below.',
        estimatedDeliveryMessage: '[ja] Your physical card will arrive in 2-3 business days.',
        next: '[ja] Next',
        getPhysicalCard: '[ja] Get physical card',
        shipCard: '[ja] Ship card',
    },
    transferAmountPage: {
        transfer: (amount: string) => `[ja] Transfer${amount ? ` ${amount}` : ''}`,
        instant: '[ja] Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `[ja] ${rate}% fee (${minAmount} minimum)`,
        ach: '[ja] 1-3 Business days (Bank account)',
        achSummary: '[ja] No fee',
        whichAccount: '[ja] Which account?',
        fee: '[ja] Fee',
        transferSuccess: '[ja] Transfer successful!',
        transferDetailBankAccount: '[ja] Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: '[ja] Your money should arrive immediately.',
        failedTransfer: '[ja] Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: '[ja] Please transfer your balance from the wallet page',
        goToWallet: '[ja] Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: '[ja] Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: '[ja] Add payment method',
        addNewDebitCard: '[ja] Add new debit card',
        addNewBankAccount: '[ja] Add new bank account',
        accountLastFour: '[ja] Ending in',
        cardLastFour: '[ja] Card ending in',
        addFirstPaymentMethod: '[ja] Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: '[ja] Default',
        bankAccountLastFour: (lastFour: string) => `[ja] Bank Account • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '[ja] Expense rules',
        subtitle: '[ja] These rules will apply to your expenses.',
        findRule: '[ja] Find rule',
        emptyRules: {
            title: "[ja] You haven't created any rules",
            subtitle: '[ja] Add a rule to automate expense reporting.',
        },
        changes: {
            billableUpdate: (value: boolean) => `[ja] Update expense ${value ? '[ja] billable' : '[ja] non-billable'}`,
            categoryUpdate: (value: string) => `[ja] Update category to "${value}"`,
            commentUpdate: (value: string) => `[ja] Update description to "${value}"`,
            merchantUpdate: (value: string) => `[ja] Update merchant to "${value}"`,
            reimbursableUpdate: (value: boolean) => `[ja] Update expense ${value ? '[ja] reimbursable' : '[ja] non-reimbursable'}`,
            tagUpdate: (value: string) => `[ja] Update tag to "${value}"`,
            taxUpdate: (value: string) => `[ja] Update tax rate to "${value}"`,
            billable: (value: boolean) => `[ja] expense ${value ? '[ja] billable' : '[ja] non-billable'}`,
            category: (value: string) => `[ja] category to "${value}"`,
            comment: (value: string) => `[ja] description to "${value}"`,
            merchant: (value: string) => `[ja] merchant to "${value}"`,
            reimbursable: (value: boolean) => `[ja] expense ${value ? '[ja] reimbursable' : '[ja] non-reimbursable'}`,
            tag: (value: string) => `[ja] tag to "${value}"`,
            tax: (value: string) => `[ja] tax rate to "${value}"`,
            report: (value: string) => `[ja] add to a report named "${value}"`,
        },
        newRule: '[ja] New rule',
        addRule: {
            title: '[ja] Add rule',
            expenseContains: '[ja] If expense contains:',
            applyUpdates: '[ja] Then apply these updates:',
            merchantHint: '[ja] Type . to create a rule that applies to all merchants',
            addToReport: '[ja] Add to a report named',
            createReport: '[ja] Create report if necessary',
            applyToExistingExpenses: '[ja] Apply to existing matching expenses',
            confirmError: '[ja] Enter merchant and apply at least one update',
            confirmErrorMerchant: '[ja] Please enter merchant',
            confirmErrorUpdate: '[ja] Please apply at least one update',
            saveRule: '[ja] Save rule',
        },
        editRule: {
            title: '[ja] Edit rule',
        },
        deleteRule: {
            deleteSingle: '[ja] Delete rule',
            deleteMultiple: '[ja] Delete rules',
            deleteSinglePrompt: '[ja] Are you sure you want to delete this rule?',
            deleteMultiplePrompt: '[ja] Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: '[ja] App preferences',
        },
        testSection: {
            title: '[ja] Test preferences',
            subtitle: '[ja] Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '[ja] Receive relevant feature updates and Expensify news',
        muteAllSounds: '[ja] Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: '[ja] Priority mode',
        explainerText: '[ja] Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: '[ja] Most recent',
                description: '[ja] Show all chats sorted by most recent',
            },
            gsd: {
                label: '[ja] #focus',
                description: '[ja] Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `[ja] in ${policyName}`,
        generatingPDF: '[ja] Generate PDF',
        waitForPDF: '[ja] Please wait while we generate the PDF.',
        errorPDF: '[ja] There was an error when trying to generate your PDF',
        successPDF: "[ja] Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: '[ja] Room description',
        roomDescriptionOptional: '[ja] Room description (optional)',
        explainerText: '[ja] Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: '[ja] Heads up!',
        lastMemberWarning: "[ja] Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: (displayName: string) => `[ja] ${displayName}'s group chat`,
    },
    languagePage: {
        language: '[ja] Language',
        aiGenerated: '[ja] The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: '[ja] Theme',
        themes: {
            dark: {
                label: '[ja] Dark',
            },
            light: {
                label: '[ja] Light',
            },
            system: {
                label: '[ja] Use device settings',
            },
        },
        highContrastMode: '[ja] High contrast mode',
        chooseThemeBelowOrSync: '[ja] Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `[ja] <muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `[ja] Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "[ja] Didn't receive a magic code?",
        enterAuthenticatorCode: '[ja] Please enter your authenticator code',
        enterRecoveryCode: '[ja] Please enter your recovery code',
        requiredWhen2FAEnabled: '[ja] Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `[ja] Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '[ja] Request a new code',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `[ja] Time remaining: ${timeRemaining} ${timeRemaining === 1 ? '[ja] second' : '[ja] seconds'}`,
        timeExpiredAnnouncement: '[ja] The time has expired',
        error: {
            pleaseFillMagicCode: '[ja] Please enter your magic code',
            incorrectMagicCode: '[ja] Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: '[ja] Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '[ja] Please fill out all fields',
        pleaseFillPassword: '[ja] Please enter your password',
        pleaseFillTwoFactorAuth: '[ja] Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: '[ja] Enter your two-factor authentication code to continue',
        forgot: '[ja] Forgot?',
        requiredWhen2FAEnabled: '[ja] Required when 2FA is enabled',
        error: {
            incorrectPassword: '[ja] Incorrect password. Please try again.',
            incorrectLoginOrPassword: '[ja] Incorrect login or password. Please try again.',
            incorrect2fa: '[ja] Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: '[ja] You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: '[ja] Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                '[ja] We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: '[ja] You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: '[ja] Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: '[ja] Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: '[ja] Phone or email',
        error: {
            invalidFormatEmailLogin: '[ja] The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "[ja] Couldn't retrieve account details. Please try to sign in again.",
        loginForm: '[ja] Login form',
        notYou: (user: string) => `[ja] Not ${user}?`,
    },
    onboarding: {
        welcome: '[ja] Welcome!',
        welcomeSignOffTitleManageTeam: '[ja] Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "[ja] It's great to meet you!",
        explanationModal: {
            title: '[ja] Welcome to Expensify',
            description: '[ja] One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: '[ja] To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: '[ja] Get started',
        whatsYourName: "[ja] What's your name?",
        peopleYouMayKnow: '[ja] People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: (domain: string, email: string) => `[ja] Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '[ja] Join a workspace',
        listOfWorkspaces: "[ja] Here's the list of workspaces you can join. Don't worry, you can always join them later if you prefer.",
        skipForNow: '[ja] Skip for now',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `[ja] ${employeeCount} member${employeeCount > 1 ? '[ja] s' : ''} • ${policyOwner}`,
        whereYouWork: '[ja] Where do you work?',
        errorSelection: '[ja] Select an option to move forward',
        purpose: {
            title: '[ja] What do you want to do today?',
            errorContinue: '[ja] Please press continue to get set up',
            errorBackButton: '[ja] Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '[ja] Get paid back by my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "[ja] Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '[ja] Track and budget expenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '[ja] Chat and split expenses with friends',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '[ja] Something else',
        },
        employees: {
            title: '[ja] How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL]: '[ja] 1-4 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM]: '[ja] 5-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '[ja] 1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '[ja] 11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '[ja] 51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '[ja] 101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '[ja] More than 1,000 employees',
        },
        accounting: {
            title: '[ja] Do you use any accounting software?',
            none: '[ja] None',
        },
        interestedFeatures: {
            title: '[ja] What features are you interested in?',
            featuresAlreadyEnabled: '[ja] Here are our most popular features:',
            featureYouMayBeInterestedIn: '[ja] Enable additional features:',
        },
        error: {
            requiredFirstName: '[ja] Please input your first name to continue',
        },
        workEmail: {
            title: '[ja] What’s your work email?',
            subtitle: '[ja] Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: '[ja] Forward to receipts@expensify.com for scanning',
                descriptionTwo: '[ja] Join your colleagues already using Expensify',
                descriptionThree: '[ja] Enjoy a more customized experience',
            },
            addWorkEmail: '[ja] Add work email',
        },
        workEmailValidation: {
            title: '[ja] Verify your work email',
            magicCodeSent: (workEmail: string | undefined) => `[ja] Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: '[ja] Please enter a valid work email from a private domain e.g. mitch@company.com',
            sameAsSignupEmail: '[ja] Please enter a different email than the one you signed up with',
            offline: '[ja] We couldn’t add your work email as you appear to be offline',
        },
        mergeBlockScreen: {
            title: '[ja] Couldn’t add work email',
            subtitle: (workEmail: string | undefined) => `[ja] We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[ja] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[ja] [Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[ja] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[ja] Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: '[ja] Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [ja] *Add expense approvals* to review your team's spend and keep it under control.

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
                title: ({workspaceConfirmationLink}) => `[ja] [Create](${workspaceConfirmationLink}) a workspace`,
                description: '[ja] Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[ja] Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [ja] *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[ja] Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        [ja] *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '[ja] Submit an expense',
                description: dedent(`
                    [ja] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: '[ja] Submit an expense',
                description: dedent(`
                    [ja] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: '[ja] Track an expense',
                description: dedent(`
                    [ja] *Track an expense* in any currency, whether you have a receipt or not.

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
                    `[ja] Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '[ja]  to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[ja] your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        [ja] Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[ja] your' : '[ja] to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        [Take me to accounting](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[ja] Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        [ja] Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[ja] Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [ja] *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[ja] Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        [ja] *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[ja] Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [ja] Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

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
                title: ({workspaceMembersLink}) => `[ja] Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [ja] *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: '[ja] Start a chat',
                description: dedent(`
                    [ja] *Start a chat* with anyone using their email or phone number.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },
            splitExpenseTask: {
                title: '[ja] Split an expense',
                description: dedent(`
                    [ja] *Split expenses* with one or more people.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[ja] Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [ja] Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: '[ja] Create your first report',
                description: dedent(`
                    [ja] Here's how to create a report:

                    1. Click the *+* button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[ja] Take a [test drive](${testDriveURL})` : '[ja] Take a test drive'),
            embeddedDemoIframeTitle: '[ja] Test Drive',
            employeeFakeReceipt: {
                description: '[ja] My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '[ja] Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: '[ja] Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        [ja] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        [ja] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage: '[ja] To make the most of your 30-day free trial, follow the remaining steps below:',
            onboardingChatSplitMessage: '[ja] Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "[ja] Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingTestDriveReceiverMessage: "[ja] *You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: '[ja] Stay organized with a workspace',
            subtitle: '[ja] Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: '[ja] Track and organize receipts',
                descriptionTwo: '[ja] Categorize and tag expenses',
                descriptionThree: '[ja] Create and share reports',
            },
            price: (price?: string) => `[ja] Try it free for 30 days, then upgrade for just <strong>${price ?? '$5'}/user/month</strong>.`,
            createWorkspace: '[ja] Create workspace',
        },
        confirmWorkspace: {
            title: '[ja] Confirm workspace',
            subtitle: '[ja] Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: '[ja] Invite members',
            subtitle: '[ja] Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "[ja] Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '[ja] Name cannot contain special characters',
            containsReservedWord: '[ja] Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: '[ja] Name cannot contain a comma or semicolon',
            requiredFirstName: '[ja] First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "[ja] What's your legal name?",
        enterDateOfBirth: "[ja] What's your date of birth?",
        enterAddress: "[ja] What's your address?",
        enterPhoneNumber: "[ja] What's your phone number?",
        personalDetails: '[ja] Personal details',
        privateDataMessage: '[ja] These details are used for travel and payments. They are never shown on your public profile.',
        legalName: '[ja] Legal name',
        legalFirstName: '[ja] Legal first name',
        legalLastName: '[ja] Legal last name',
        address: '[ja] Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `[ja] Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `[ja] Date should be after ${dateString}`,
            hasInvalidCharacter: '[ja] Name can only include Latin characters',
            cannotIncludeCommaOrSemicolon: '[ja] Name cannot contain a comma or semicolon',
            incorrectZipFormat: (zipFormat?: string) => `[ja] Incorrect zip code format${zipFormat ? `[ja]  Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `[ja] Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '[ja] Link has been re-sent',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `[ja] I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: '[ja] Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) => `[ja] To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `[ja] If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '[ja] Unlink',
        linkSent: '[ja] Link sent!',
        successfullyUnlinkedLogin: '[ja] Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) => `[ja] Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `[ja] <strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `[ja] <strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `[ja] Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: '[ja] Something went wrong...',
        subtitle: `[ja] We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: '[ja] Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `[ja] We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: '[ja] Your number has been validated! Click below to send a new magic sign-in code.',
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
                return '[ja] Please wait a moment before trying again.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '[ja] day' : '[ja] days'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '[ja] hour' : '[ja] hours'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '[ja] minute' : '[ja] minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `[ja] Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: '[ja] Join',
    },
    detailsPage: {
        localTime: '[ja] Local time',
    },
    newChatPage: {
        startGroup: '[ja] Start group',
        addToGroup: '[ja] Add to group',
        addUserToGroup: (username: string) => `[ja] Add ${username} to group`,
    },
    yearPickerPage: {
        year: '[ja] Year',
        selectYear: '[ja] Please select a year',
    },
    monthPickerPage: {
        month: '[ja] Month',
        selectMonth: '[ja] Please select a month',
    },
    focusModeUpdateModal: {
        title: '[ja] Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `[ja] Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '[ja] The chat you are looking for cannot be found.',
        getMeOutOfHere: '[ja] Get me out of here',
        iouReportNotFound: '[ja] The payment details you are looking for cannot be found.',
        notHere: "[ja] Hmm... it's not here",
        pageNotFound: '[ja] Oops, this page cannot be found',
        noAccess: '[ja] This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: '[ja] Go back to home page',
        commentYouLookingForCannotBeFound: '[ja] The comment you are looking for cannot be found.',
        goToChatInstead: '[ja] Go to the chat instead.',
        contactConcierge: '[ja] For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `[ja] Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: '[ja] Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "[ja] That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: '[ja] Status',
        statusExplanation: "[ja] Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: '[ja] Today',
        clearStatus: '[ja] Clear status',
        save: '[ja] Save',
        message: '[ja] Message',
        timePeriods: {
            never: '[ja] Never',
            thirtyMinutes: '[ja] 30 minutes',
            oneHour: '[ja] 1 hour',
            afterToday: '[ja] Today',
            afterWeek: '[ja] A week',
            custom: '[ja] Custom',
        },
        untilTomorrow: '[ja] Until tomorrow',
        untilTime: (time: string) => `[ja] Until ${time}`,
        date: '[ja] Date',
        time: '[ja] Time',
        clearAfter: '[ja] Clear after',
        whenClearStatus: '[ja] When should we clear your status?',
        setVacationDelegate: `[ja] Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        cannotSetVacationDelegate: `[ja] You can't set a vacation delegate because you're currently the delegate for the following members:`,
        vacationDelegateError: '[ja] There was an error updating your vacation delegate.',
        asVacationDelegate: (nameOrEmail: string) => `[ja] as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `[ja] to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `[ja] You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `[ja] Step ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '[ja] Bank info',
        confirmBankInfo: '[ja] Confirm bank info',
        manuallyAdd: '[ja] Manually add your bank account',
        letsDoubleCheck: "[ja] Let's double check that everything looks right.",
        accountEnding: '[ja] Account ending in',
        thisBankAccount: '[ja] This bank account will be used for business payments on your workspace',
        accountNumber: '[ja] Account number',
        routingNumber: '[ja] Routing number',
        chooseAnAccountBelow: '[ja] Choose an account below',
        addBankAccount: '[ja] Add bank account',
        chooseAnAccount: '[ja] Choose an account',
        connectOnlineWithPlaid: '[ja] Log into your bank',
        connectManually: '[ja] Connect manually',
        desktopConnection: '[ja] Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: '[ja] Your data is secure',
        toGetStarted: '[ja] Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: '[ja] Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: '[ja] Your routing number and account number can be found on a check for the account.',
        bankAccountPurposeTitle: '[ja] What do you want to do with your bank account?',
        getReimbursed: '[ja] Get reimbursed',
        getReimbursedDescription: '[ja] By employer or others',
        makePayments: '[ja] Make payments',
        makePaymentsDescription: '[ja] Pay expenses or issue Expensify Cards',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `[ja] To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: '[ja] An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: (workspaceRoute: string) =>
            `[ja] Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: '[ja] Business bank account added!',
        bbaAddedDescription: "[ja] It's ready to be used for payments.",
        lockedBankAccount: '[ja] Locked bank account',
        unlockBankAccount: '[ja] Unlock bank account',
        youCantPayThis: `[ja] You can't pay this report because you have a <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">locked bank account</a>. Tap below and Concierge will help with the next steps to unlock it.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `[ja] <h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `[ja] Expensify Business Bank Account ${maskedAccountNumber}
Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.`,
        error: {
            youNeedToSelectAnOption: '[ja] Please select an option to proceed',
            noBankAccountAvailable: "[ja] Sorry, there's no bank account available",
            noBankAccountSelected: '[ja] Please choose an account',
            taxID: '[ja] Please enter a valid tax ID number',
            website: '[ja] Please enter a valid website',
            zipCode: `[ja] Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '[ja] Please enter a valid phone number',
            email: '[ja] Please enter a valid email address',
            companyName: '[ja] Please enter a valid business name',
            addressCity: '[ja] Please enter a valid city',
            addressStreet: '[ja] Please enter a valid street address',
            addressState: '[ja] Please select a valid state',
            incorporationDateFuture: "[ja] Incorporation date can't be in the future",
            incorporationState: '[ja] Please select a valid state',
            industryCode: '[ja] Please enter a valid industry classification code with six digits',
            restrictedBusiness: "[ja] Please confirm the business isn't on the list of restricted businesses",
            routingNumber: '[ja] Please enter a valid routing number',
            accountNumber: '[ja] Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "[ja] Routing and account numbers can't match",
            companyType: '[ja] Please select a valid company type',
            tooManyAttempts: '[ja] Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: '[ja] Please enter a valid address',
            dob: '[ja] Please select a valid date of birth',
            age: '[ja] Must be over 18 years old',
            ssnLast4: '[ja] Please enter valid last 4 digits of SSN',
            firstName: '[ja] Please enter a valid first name',
            lastName: '[ja] Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: '[ja] Please add a default deposit account or debit card',
            validationAmounts: '[ja] The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: '[ja] Please enter a valid full name',
            ownershipPercentage: '[ja] Please enter a valid percentage number',
            deletePaymentBankAccount:
                "[ja] This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: '[ja] The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "[ja] Where's your bank account located?",
        accountDetailsStepHeader: '[ja] What are your account details?',
        accountTypeStepHeader: '[ja] What type of account is this?',
        bankInformationStepHeader: '[ja] What are your bank details?',
        accountHolderInformationStepHeader: '[ja] What are the account holder details?',
        howDoWeProtectYourData: '[ja] How do we protect your data?',
        currencyHeader: "[ja] What's your bank account's currency?",
        confirmationStepHeader: '[ja] Check your info.',
        confirmationStepSubHeader: '[ja] Double check the details below, and check the terms box to confirm.',
        toGetStarted: '[ja] Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
    },
    addPersonalBankAccountPage: {
        enterPassword: '[ja] Enter Expensify password',
        alreadyAdded: '[ja] This account has already been added.',
        chooseAccountLabel: '[ja] Account',
        successTitle: '[ja] Personal bank account added!',
        successMessage: '[ja] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: '[ja] Unknown filename',
        passwordRequired: '[ja] Please enter a password',
        passwordIncorrect: '[ja] Incorrect password. Please try again.',
        failedToLoadPDF: '[ja] Failed to load PDF file',
        pdfPasswordForm: {
            title: '[ja] Password protected PDF',
            infoText: '[ja] This PDF is password protected.',
            beforeLinkText: '[ja] Please',
            linkText: '[ja] enter the password',
            afterLinkText: '[ja] to view it.',
            formLabel: '[ja] View PDF',
        },
        attachmentNotFound: '[ja] Attachment not found',
        retry: '[ja] Retry',
    },
    messages: {
        errorMessageInvalidPhone: `[ja] Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '[ja] Invalid email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `[ja] ${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `[ja] ${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '[ja] By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: '[ja] Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `[ja] <muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: '[ja] Try again',
        verifyIdentity: '[ja] Verify identity',
        letsVerifyIdentity: "[ja] Let's verify your identity",
        butFirst: `[ja] But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '[ja] An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: '[ja] Enable camera access',
        cameraRequestMessage: '[ja] We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: '[ja] Enable microphone access',
        microphoneRequestMessage: '[ja] We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: '[ja] Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: '[ja] Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "[ja] There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "[ja] There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "[ja] Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "[ja] Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: '[ja] Additional details',
        helpText: '[ja] We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: '[ja] We need to ask you just a few more questions to finish validating your identity.',
        helpLink: '[ja] Learn more about why we need this.',
        legalFirstNameLabel: '[ja] Legal first name',
        legalMiddleNameLabel: '[ja] Legal middle name',
        legalLastNameLabel: '[ja] Legal last name',
        selectAnswer: '[ja] Please select a response to proceed',
        ssnFull9Error: '[ja] Please enter a valid nine-digit SSN',
        needSSNFull9: "[ja] We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "[ja] We couldn't verify",
        pleaseFixIt: '[ja] Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `[ja] We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: '[ja] Terms and fees',
        headerTitleRefactor: '[ja] Fees and terms',
        haveReadAndAgreePlain: '[ja] I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `[ja] I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: '[ja] I agree to the Privacy and Wallet agreement.',
        agreeToThe: (walletAgreementUrl: string) =>
            `[ja] I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: '[ja] Enable payments',
        monthlyFee: '[ja] Monthly fee',
        inactivity: '[ja] Inactivity',
        noOverdraftOrCredit: '[ja] No overdraft/credit feature.',
        electronicFundsWithdrawal: '[ja] Electronic funds withdrawal',
        standard: '[ja] Standard',
        reviewTheFees: '[ja] Take a look at some fees.',
        checkTheBoxes: '[ja] Please check the boxes below.',
        agreeToTerms: '[ja] Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `[ja] The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: '[ja] Per purchase',
            atmWithdrawal: '[ja] ATM withdrawal',
            cashReload: '[ja] Cash reload',
            inNetwork: '[ja] in-network',
            outOfNetwork: '[ja] out-of-network',
            atmBalanceInquiry: '[ja] ATM balance inquiry (in-network or out-of-network)',
            customerService: '[ja] Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: '[ja] Inactivity (after 12 months with no transactions)',
            weChargeOneFee: '[ja] We charge 1 other type of fee. It is:',
            fdicInsurance: '[ja] Your funds are eligible for FDIC insurance.',
            generalInfo: `[ja] For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `[ja] For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: '[ja] Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: (amount: string) => `[ja] (min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '[ja] A list of all Expensify Wallet fees',
            typeOfFeeHeader: '[ja] All fees',
            feeAmountHeader: '[ja] Amount',
            moreDetailsHeader: '[ja] Details',
            openingAccountTitle: '[ja] Opening an account',
            openingAccountDetails: "[ja] There's no fee to open an account.",
            monthlyFeeDetails: "[ja] There's no monthly fee.",
            customerServiceTitle: '[ja] Customer service',
            customerServiceDetails: '[ja] There are no customer service fees.',
            inactivityDetails: "[ja] There's no inactivity fee.",
            sendingFundsTitle: '[ja] Sending funds to another account holder',
            sendingFundsDetails: "[ja] There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "[ja] There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "[ja] There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                `[ja]  The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `[ja] Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                `[ja]  Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `[ja] Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `[ja] For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: '[ja] View printer-friendly version',
            automated: '[ja] Automated',
            liveAgent: '[ja] Live agent',
            instant: '[ja] Instant',
            electronicFundsInstantFeeMin: (amount: string) => `[ja] Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '[ja] Enable payments',
        activatedTitle: '[ja] Wallet activated!',
        activatedMessage: '[ja] Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: '[ja] Just a minute...',
        checkBackLaterMessage: "[ja] We're still reviewing your information. Please check back later.",
        continueToPayment: '[ja] Continue to payment',
        continueToTransfer: '[ja] Continue to transfer',
    },
    companyStep: {
        headerTitle: '[ja] Company information',
        subtitle: '[ja] Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: '[ja] Legal business name',
        companyWebsite: '[ja] Company website',
        taxIDNumber: '[ja] Tax ID number',
        taxIDNumberPlaceholder: '[ja] 9 digits',
        companyType: '[ja] Company type',
        incorporationDate: '[ja] Incorporation date',
        incorporationState: '[ja] Incorporation state',
        industryClassificationCode: '[ja] Industry classification code',
        confirmCompanyIsNot: '[ja] I confirm that this company is not on the',
        listOfRestrictedBusinesses: '[ja] list of restricted businesses',
        incorporationDatePlaceholder: '[ja] Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '[ja] LLC',
            CORPORATION: '[ja] Corp',
            PARTNERSHIP: '[ja] Partnership',
            COOPERATIVE: '[ja] Cooperative',
            SOLE_PROPRIETORSHIP: '[ja] Sole proprietorship',
            OTHER: '[ja] Other',
        },
        industryClassification: '[ja] Which industry is the business classified under?',
        industryClassificationCodePlaceholder: '[ja] Search for industry classification code',
    },
    requestorStep: {
        headerTitle: '[ja] Personal information',
        learnMore: '[ja] Learn more',
        isMyDataSafe: '[ja] Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: '[ja] Personal info',
        enterYourLegalFirstAndLast: "[ja] What's your legal name?",
        legalFirstName: '[ja] Legal first name',
        legalLastName: '[ja] Legal last name',
        legalName: '[ja] Legal name',
        enterYourDateOfBirth: "[ja] What's your date of birth?",
        enterTheLast4: '[ja] What are the last four digits of your Social Security Number?',
        dontWorry: "[ja] Don't worry, we don't do any personal credit checks!",
        last4SSN: '[ja] Last 4 of SSN',
        enterYourAddress: "[ja] What's your address?",
        address: '[ja] Address',
        letsDoubleCheck: "[ja] Let's double check that everything looks right.",
        byAddingThisBankAccount: "[ja] By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: '[ja] What’s your legal name?',
        whatsYourDOB: '[ja] What’s your date of birth?',
        whatsYourAddress: '[ja] What’s your address?',
        whatsYourSSN: '[ja] What are the last four digits of your Social Security Number?',
        noPersonalChecks: '[ja] Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: '[ja] What’s your phone number?',
        weNeedThisToVerify: '[ja] We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: '[ja] Company info',
        enterTheNameOfYourBusiness: "[ja] What's the name of your company?",
        businessName: '[ja] Legal company name',
        enterYourCompanyTaxIdNumber: "[ja] What's your company’s Tax ID number?",
        taxIDNumber: '[ja] Tax ID number',
        taxIDNumberPlaceholder: '[ja] 9 digits',
        enterYourCompanyWebsite: "[ja] What's your company’s website?",
        companyWebsite: '[ja] Company website',
        enterYourCompanyPhoneNumber: "[ja] What's your company’s phone number?",
        enterYourCompanyAddress: "[ja] What's your company’s address?",
        selectYourCompanyType: '[ja] What type of company is it?',
        companyType: '[ja] Company type',
        incorporationType: {
            LLC: '[ja] LLC',
            CORPORATION: '[ja] Corp',
            PARTNERSHIP: '[ja] Partnership',
            COOPERATIVE: '[ja] Cooperative',
            SOLE_PROPRIETORSHIP: '[ja] Sole proprietorship',
            OTHER: '[ja] Other',
        },
        selectYourCompanyIncorporationDate: "[ja] What's your company’s incorporation date?",
        incorporationDate: '[ja] Incorporation date',
        incorporationDatePlaceholder: '[ja] Start date (yyyy-mm-dd)',
        incorporationState: '[ja] Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '[ja] Which state was your company incorporated in?',
        letsDoubleCheck: "[ja] Let's double check that everything looks right.",
        companyAddress: '[ja] Company address',
        listOfRestrictedBusinesses: '[ja] list of restricted businesses',
        confirmCompanyIsNot: '[ja] I confirm that this company is not on the',
        businessInfoTitle: '[ja] Business info',
        legalBusinessName: '[ja] Legal business name',
        whatsTheBusinessName: "[ja] What's the business name?",
        whatsTheBusinessAddress: "[ja] What's the business address?",
        whatsTheBusinessContactInformation: "[ja] What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "[ja] What's the Company Registration Number (CRN)?";
                default:
                    return "[ja] What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[ja] What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return '[ja] What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return '[ja] What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return '[ja] What’s the Australian Business Number (ABN)?';
                default:
                    return '[ja] What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "[ja] What's this number?",
        whereWasTheBusinessIncorporated: '[ja] Where was the business incorporated?',
        whatTypeOfBusinessIsIt: '[ja] What type of business is it?',
        whatsTheBusinessAnnualPayment: "[ja] What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "[ja] What's your expected average reimbursement amount?",
        registrationNumber: '[ja] Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[ja] EIN';
                case CONST.COUNTRY.CA:
                    return '[ja] BN';
                case CONST.COUNTRY.GB:
                    return '[ja] VRN';
                case CONST.COUNTRY.AU:
                    return '[ja] ABN';
                default:
                    return '[ja] EU VAT';
            }
        },
        businessAddress: '[ja] Business address',
        businessType: '[ja] Business type',
        incorporation: '[ja] Incorporation',
        incorporationCountry: '[ja] Incorporation country',
        incorporationTypeName: '[ja] Incorporation type',
        businessCategory: '[ja] Business category',
        annualPaymentVolume: '[ja] Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `[ja] Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '[ja] Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `[ja] Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '[ja] Select incorporation type',
        selectBusinessCategory: '[ja] Select business category',
        selectAnnualPaymentVolume: '[ja] Select annual payment volume',
        selectIncorporationCountry: '[ja] Select incorporation country',
        selectIncorporationState: '[ja] Select incorporation state',
        selectAverageReimbursement: '[ja] Select average reimbursement amount',
        selectBusinessType: '[ja] Select business type',
        findIncorporationType: '[ja] Find incorporation type',
        findBusinessCategory: '[ja] Find business category',
        findAnnualPaymentVolume: '[ja] Find annual payment volume',
        findIncorporationState: '[ja] Find incorporation state',
        findAverageReimbursement: '[ja] Find average reimbursement amount',
        findBusinessType: '[ja] Find business type',
        error: {
            registrationNumber: '[ja] Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '[ja] Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return '[ja] Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return '[ja] Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return '[ja] Please provide a valid Australian Business Number (ABN)';
                    default:
                        return '[ja] Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `[ja] Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `[ja] Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `[ja] Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: '[ja] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: '[ja] Business owner',
        enterLegalFirstAndLastName: "[ja] What's the owner's legal name?",
        legalFirstName: '[ja] Legal first name',
        legalLastName: '[ja] Legal last name',
        enterTheDateOfBirthOfTheOwner: "[ja] What's the owner's date of birth?",
        enterTheLast4: '[ja] What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: '[ja] Last 4 of SSN',
        dontWorry: "[ja] Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "[ja] What's the owner's address?",
        letsDoubleCheck: '[ja] Let’s double check that everything looks right.',
        legalName: '[ja] Legal name',
        address: '[ja] Address',
        byAddingThisBankAccount: "[ja] By adding this bank account, you confirm that you've read, understand, and accept",
        owners: '[ja] Owners',
    },
    ownershipInfoStep: {
        ownerInfo: '[ja] Owner info',
        businessOwner: '[ja] Business owner',
        signerInfo: '[ja] Signer info',
        doYouOwn: (companyName: string) => `[ja] Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `[ja] Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: '[ja] Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: '[ja] Legal first name',
        legalLastName: '[ja] Legal last name',
        whatsTheOwnersName: "[ja] What's the owner's legal name?",
        whatsYourName: "[ja] What's your legal name?",
        whatPercentage: '[ja] What percentage of the business belongs to the owner?',
        whatsYoursPercentage: '[ja] What percentage of the business do you own?',
        ownership: '[ja] Ownership',
        whatsTheOwnersDOB: "[ja] What's the owner's date of birth?",
        whatsYourDOB: "[ja] What's your date of birth?",
        whatsTheOwnersAddress: "[ja] What's the owner's address?",
        whatsYourAddress: "[ja] What's your address?",
        whatAreTheLast: "[ja] What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: '[ja] What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: '[ja] What is your country of citizenship?',
        whatsTheOwnersNationality: "[ja] What's the owner's country of citizenship?",
        countryOfCitizenship: '[ja] Country of citizenship',
        dontWorry: "[ja] Don't worry, we don't do any personal credit checks!",
        last4: '[ja] Last 4 of SSN',
        whyDoWeAsk: '[ja] Why do we ask for this?',
        letsDoubleCheck: '[ja] Let’s double check that everything looks right.',
        legalName: '[ja] Legal name',
        ownershipPercentage: '[ja] Ownership percentage',
        areThereOther: (companyName: string) => `[ja] Are there other individuals who own 25% or more of ${companyName}?`,
        owners: '[ja] Owners',
        addCertified: '[ja] Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart: '[ja] Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: '[ja] Upload entity ownership chart',
        noteEntity: '[ja] Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: '[ja] Certified entity ownership chart',
        selectCountry: '[ja] Select country',
        findCountry: '[ja] Find country',
        address: '[ja] Address',
        chooseFile: '[ja] Choose file',
        uploadDocuments: '[ja] Upload additional documentation',
        pleaseUpload: '[ja] Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: '[ja] Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: '[ja] Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "[ja] Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: '[ja] Copy of ID for beneficial owner',
        copyOfIDDescription: "[ja] Examples: Passport, driver's license, etc.",
        proofOfAddress: '[ja] Address proof for beneficial owner',
        proofOfAddressDescription: '[ja] Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: '[ja] Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            '[ja] Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: '[ja] Complete verification',
        confirmAgreements: '[ja] Please confirm the agreements below.',
        certifyTrueAndAccurate: '[ja] I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: '[ja] Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: '[ja] I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: '[ja] You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: '[ja] terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '[ja] Validate your bank account',
        validateButtonText: '[ja] Validate',
        validationInputLabel: '[ja] Transaction',
        maxAttemptsReached: '[ja] Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `[ja] Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '[ja] Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: '[ja] Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: '[ja] Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: '[ja] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: '[ja] Secure your account',
    },
    countryStep: {
        confirmBusinessBank: '[ja] Confirm business bank account currency and country',
        confirmCurrency: '[ja] Confirm currency and country',
        yourBusiness: '[ja] Your business bank account currency must match your workspace currency.',
        youCanChange: '[ja] You can change your workspace currency in your',
        findCountry: '[ja] Find country',
        selectCountry: '[ja] Select country',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `[ja] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> so you can invite a director to sign in a later step.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '[ja] What are your business bank account details?',
        letsDoubleCheck: '[ja] Let’s double check that everything looks fine.',
        thisBankAccount: '[ja] This bank account will be used for business payments on your workspace',
        accountNumber: '[ja] Account number',
        accountHolderNameDescription: "[ja] Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: '[ja] Signer info',
        areYouDirector: (companyName: string) => `[ja] Are you a director at ${companyName}?`,
        regulationRequiresUs: '[ja] Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "[ja] What's your legal name",
        fullName: '[ja] Legal full name',
        whatsYourJobTitle: "[ja] What's your job title?",
        jobTitle: '[ja] Job title',
        whatsYourDOB: "[ja] What's your date of birth?",
        uploadID: '[ja] Upload ID and proof of address',
        personalAddress: '[ja] Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: '[ja] Let’s double check that everything looks right.',
        legalName: '[ja] Legal name',
        proofOf: '[ja] Proof of personal address',
        enterOneEmail: (companyName: string) => `[ja] Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: '[ja] Regulation requires at least one more director as a signer.',
        hangTight: '[ja] Hang tight...',
        enterTwoEmails: (companyName: string) => `[ja] Enter the emails of two directors at ${companyName}`,
        sendReminder: '[ja] Send a reminder',
        chooseFile: '[ja] Choose file',
        weAreWaiting: "[ja] We're waiting for others to verify their identities as directors of the business.",
        id: '[ja] Copy of ID',
        proofOfDirectors: '[ja] Proof of director(s)',
        proofOfDirectorsDescription: '[ja] Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: '[ja] Codice Fiscale',
        codiceFiscaleDescription: '[ja] Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: '[ja] PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            [ja] Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: '[ja] Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: '[ja] Enter signer info',
        thisStep: '[ja] This step has been completed',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `[ja] is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: '[ja] Emails must be different',
            connectToWorkspace: (workspaceRoute: string) => `[ja] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> to invite a director to sign.`,
        },
    },
    agreementsStep: {
        agreements: '[ja] Agreements',
        pleaseConfirm: '[ja] Please confirm the agreements below',
        regulationRequiresUs: '[ja] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: '[ja] I am authorized to use the business bank account for business spend.',
        iCertify: '[ja] I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `[ja] I accept the <a href="https://www.corpay.com/cross-border/terms">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: '[ja] I accept the terms and conditions.',
        accept: '[ja] Accept and add bank account',
        iConsentToThePrivacyNotice: '[ja] I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: '[ja] I consent to the privacy notice.',
        error: {
            authorized: '[ja] You must be a controlling officer with authorization to operate the business bank account',
            certify: '[ja] Please certify that the information is true and accurate',
            consent: '[ja] Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: '[ja] Docusign Form',
        pleaseComplete:
            '[ja] Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: '[ja] Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            '[ja] Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: '[ja] Take me to Docusign',
        uploadAdditional: '[ja] Upload additional documentation',
        pleaseUpload: '[ja] Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: '[ja] Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "[ja] Let's finish in chat!",
        thanksFor:
            "[ja] Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: '[ja] I have a question',
        enable2FA: '[ja] Enable two-factor authentication (2FA) to prevent fraud',
        weTake: '[ja] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: '[ja] Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '[ja] One moment',
        explanationLine: "[ja] We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "[ja] Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: '[ja] Book travel',
        title: '[ja] Travel smart',
        subtitle: '[ja] Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: '[ja] Save money on your bookings',
            alerts: '[ja] Get realtime alerts if your travel plans change',
        },
        bookTravel: '[ja] Book travel',
        bookDemo: '[ja] Book demo',
        bookADemo: '[ja] Book a demo',
        toLearnMore: '[ja]  to learn more.',
        termsAndConditions: {
            header: '[ja] Before we continue...',
            title: '[ja] Terms & conditions',
            label: '[ja] I agree to the terms & conditions',
            subtitle: `[ja] Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: '[ja] You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                '[ja] You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: '[ja] Flight',
        flightDetails: {
            passenger: '[ja] Passenger',
            layover: (layover: string) => `[ja] <muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: '[ja] Take-off',
            landing: '[ja] Landing',
            seat: '[ja] Seat',
            class: '[ja] Cabin Class',
            recordLocator: '[ja] Record locator',
            cabinClasses: {
                unknown: '[ja] Unknown',
                economy: '[ja] Economy',
                premiumEconomy: '[ja] Premium Economy',
                business: '[ja] Business',
                first: '[ja] First',
            },
        },
        hotel: '[ja] Hotel',
        hotelDetails: {
            guest: '[ja] Guest',
            checkIn: '[ja] Check-in',
            checkOut: '[ja] Check-out',
            roomType: '[ja] Room type',
            cancellation: '[ja] Cancellation policy',
            cancellationUntil: '[ja] Free cancellation until',
            confirmation: '[ja] Confirmation number',
            cancellationPolicies: {
                unknown: '[ja] Unknown',
                nonRefundable: '[ja] Non-refundable',
                freeCancellationUntil: '[ja] Free cancellation until',
                partiallyRefundable: '[ja] Partially refundable',
            },
        },
        car: '[ja] Car',
        carDetails: {
            rentalCar: '[ja] Car rental',
            pickUp: '[ja] Pick-up',
            dropOff: '[ja] Drop-off',
            driver: '[ja] Driver',
            carType: '[ja] Car type',
            cancellation: '[ja] Cancellation policy',
            cancellationUntil: '[ja] Free cancellation until',
            freeCancellation: '[ja] Free cancellation',
            confirmation: '[ja] Confirmation number',
        },
        train: '[ja] Rail',
        trainDetails: {
            passenger: '[ja] Passenger',
            departs: '[ja] Departs',
            arrives: '[ja] Arrives',
            coachNumber: '[ja] Coach number',
            seat: '[ja] Seat',
            fareDetails: '[ja] Fare details',
            confirmation: '[ja] Confirmation number',
        },
        viewTrip: '[ja] View trip',
        modifyTrip: '[ja] Modify trip',
        tripSupport: '[ja] Trip support',
        tripDetails: '[ja] Trip details',
        viewTripDetails: '[ja] View trip details',
        trip: '[ja] Trip',
        trips: '[ja] Trips',
        tripSummary: '[ja] Trip summary',
        departs: '[ja] Departs',
        errorMessage: '[ja] Something went wrong. Please try again later.',
        phoneError: (phoneErrorMethodsRoute: string) => `[ja] <rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: '[ja] Domain',
            subtitle: '[ja] Choose a domain for Expensify Travel setup.',
            recommended: '[ja] Recommended',
        },
        domainPermissionInfo: {
            title: '[ja] Domain',
            restriction: (domain: string) =>
                `[ja] You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `[ja] If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '[ja] Get started with Expensify Travel',
            message: `[ja] You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: '[ja] Expensify Travel has been disabled',
            message: `[ja] Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "[ja] We're reviewing your request...",
            message: `[ja] We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: '[ja] Got it',
            conciergeMessage: ({domain}: {domain: string}) => `[ja] Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `[ja] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[ja] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[ja] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[ja] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `[ja] The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `[ja] Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[ja] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `[ja] Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `[ja] Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `[ja] Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `[ja] Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: '[ja] Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: (type: string, id = '') => `[ja] You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `[ja] The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: (type: string, id = '') => `[ja] Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: (type: string) => `[ja] Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `[ja] Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `[ja] Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `[ja] Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: (type: string) => `[ja] Your ${type} reservation was updated.`,
        },
        flightTo: '[ja] Flight to',
        trainTo: '[ja] Train to',
        carRental: '[ja]  car rental',
        nightIn: '[ja] night in',
        nightsIn: '[ja] nights in',
    },
    proactiveAppReview: {
        title: '[ja] Enjoying New Expensify?',
        description: '[ja] Let us know so we can help make your expensing experience even better.',
        positiveButton: '[ja] Yeah!',
        negativeButton: '[ja] Not really',
    },
    workspace: {
        common: {
            card: '[ja] Cards',
            expensifyCard: '[ja] Expensify Card',
            companyCards: '[ja] Company cards',
            personalCards: '[ja] Personal cards',
            workflows: '[ja] Workflows',
            workspace: '[ja] Workspace',
            findWorkspace: '[ja] Find workspace',
            edit: '[ja] Edit workspace',
            enabled: '[ja] Enabled',
            disabled: '[ja] Disabled',
            everyone: '[ja] Everyone',
            delete: '[ja] Delete workspace',
            settings: '[ja] Settings',
            reimburse: '[ja] Reimbursements',
            categories: '[ja] Categories',
            tags: '[ja] Tags',
            customField1: '[ja] Custom field 1',
            customField2: '[ja] Custom field 2',
            customFieldHint: '[ja] Add custom coding that applies to all spend from this member.',
            reports: '[ja] Reports',
            reportFields: '[ja] Report fields',
            reportTitle: '[ja] Report title',
            reportField: '[ja] Report field',
            taxes: '[ja] Taxes',
            bills: '[ja] Bills',
            invoices: '[ja] Invoices',
            perDiem: '[ja] Per diem',
            travel: '[ja] Travel',
            members: '[ja] Members',
            accounting: '[ja] Accounting',
            receiptPartners: '[ja] Receipt partners',
            rules: '[ja] Rules',
            displayedAs: '[ja] Displayed as',
            plan: '[ja] Plan',
            profile: '[ja] Overview',
            bankAccount: '[ja] Bank account',
            testTransactions: '[ja] Test transactions',
            issueAndManageCards: '[ja] Issue and manage cards',
            reconcileCards: '[ja] Reconcile cards',
            selectAll: '[ja] Select all',
            selected: () => ({
                one: '[ja] 1 selected',
                other: (count: number) => `[ja] ${count} selected`,
            }),
            settlementFrequency: '[ja] Settlement frequency',
            setAsDefault: '[ja] Set as default workspace',
            defaultNote: `[ja] Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '[ja] Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: '[ja] Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            deleteOpenExpensifyCardsError: '[ja] Your company still has open Expensify Cards.',
            outstandingBalanceWarning:
                '[ja] You have an outstanding balance that must be settled before deleting your last workspace. Please go to your subscription settings to resolve the payment.',
            settleBalance: '[ja] Go to subscription',
            unavailable: '[ja] Unavailable workspace',
            memberNotFound: '[ja] Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `[ja] You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: '[ja] Go to workspace',
            duplicateWorkspace: '[ja] Duplicate workspace',
            duplicateWorkspacePrefix: '[ja] Duplicate',
            goToWorkspaces: '[ja] Go to workspaces',
            clearFilter: '[ja] Clear filter',
            workspaceName: '[ja] Workspace name',
            workspaceOwner: '[ja] Owner',
            keepMeAsAdmin: '[ja] Keep me as an admin',
            workspaceType: '[ja] Workspace type',
            workspaceAvatar: '[ja] Workspace avatar',
            clientID: '[ja] Client ID',
            clientIDInputHint: "[ja] Enter the client's unique identifier",
            mustBeOnlineToViewMembers: '[ja] You need to be online in order to view members of this workspace.',
            moreFeatures: '[ja] More features',
            requested: '[ja] Requested',
            distanceRates: '[ja] Distance rates',
            defaultDescription: '[ja] One place for all your receipts and expenses.',
            descriptionHint: '[ja] Share information about this workspace with all members.',
            welcomeNote: '[ja] Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: '[ja] Subscription',
            markAsEntered: '[ja] Mark as manually entered',
            markAsExported: '[ja] Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `[ja] Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "[ja] Let's double check that everything looks right.",
            lineItemLevel: '[ja] Line-item level',
            reportLevel: '[ja] Report level',
            topLevel: '[ja] Top level',
            appliedOnExport: '[ja] Not imported into Expensify, applied on export',
            shareNote: {
                header: '[ja] Share your workspace with other members',
                content: (adminsRoomLink: string) =>
                    `[ja] Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `[ja] Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '[ja] Create new connection',
            reuseExistingConnection: '[ja] Reuse existing connection',
            existingConnections: '[ja] Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `[ja] Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `[ja] ${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `[ja] Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: '[ja] Learn more',
            memberAlternateText: '[ja] Submit and approve reports.',
            adminAlternateText: '[ja] Manage reports and workspace settings.',
            auditorAlternateText: '[ja] View and comment on reports.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: '[ja] Direct',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: '[ja] None',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '[ja] Indirect',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '[ja] Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '[ja] Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return '[ja] Member';
                    default:
                        return '[ja] Member';
                }
            },
            frequency: {
                manual: '[ja] Manually',
                instant: '[ja] Instant',
                immediate: '[ja] Daily',
                trip: '[ja] By trip',
                weekly: '[ja] Weekly',
                semimonthly: '[ja] Twice a month',
                monthly: '[ja] Monthly',
            },
            budgetFrequency: {
                monthly: '[ja] monthly',
                yearly: '[ja] yearly',
            },
            budgetFrequencyUnit: {
                monthly: '[ja] month',
                yearly: '[ja] year',
            },
            budgetTypeForNotificationMessage: {
                tag: '[ja] tag',
                category: '[ja] category',
            },
            planType: '[ja] Plan type',
            youCantDowngradeInvoicing:
                "[ja] You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: '[ja] Default category',
            viewTransactions: '[ja] View transactions',
            policyExpenseChatName: (displayName: string) => `[ja] ${displayName}'s expenses`,
            deepDiveExpensifyCard: `[ja] <muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `[ja] Connected to ${organizationName}` : '[ja] Automate travel and meal delivery expenses across your organization.',
                sendInvites: '[ja] Send invites',
                sendInvitesDescription: "[ja] These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: '[ja] Confirm invite',
                manageInvites: '[ja] Manage invites',
                confirm: '[ja] Confirm',
                allSet: '[ja] All set',
                readyToRoll: "[ja] You're ready to roll",
                takeBusinessRideMessage: '[ja] Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: '[ja] All',
                linked: '[ja] Linked',
                outstanding: '[ja] Outstanding',
                status: {
                    resend: '[ja] Resend',
                    invite: '[ja] Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '[ja] Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '[ja] Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '[ja] Suspended',
                },
                centralBillingAccount: '[ja] Central billing account',
                centralBillingDescription: '[ja] Choose where to import all Uber receipts.',
                invitationFailure: '[ja] Failed to invite member to Uber for Business',
                autoInvite: '[ja] Invite new workspace members to Uber for Business',
                autoRemove: '[ja] Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: '[ja] No outstanding invites',
                    subtitle: '[ja] Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `[ja] <muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: '[ja] Amount',
            deleteRates: () => ({
                one: '[ja] Delete rate',
                other: '[ja] Delete rates',
            }),
            deletePerDiemRate: '[ja] Delete per diem rate',
            findPerDiemRate: '[ja] Find per diem rate',
            areYouSureDelete: () => ({
                one: '[ja] Are you sure you want to delete this rate?',
                other: '[ja] Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: '[ja] Per diem',
                subtitle: '[ja] Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: '[ja] Import per diem rates',
            editPerDiemRate: '[ja] Edit per diem rate',
            editPerDiemRates: '[ja] Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `[ja] Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `[ja] Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '[ja] Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: '[ja] Mark checks as “print later”',
            exportDescription: '[ja] Configure how Expensify data exports to QuickBooks Desktop.',
            date: '[ja] Export date',
            exportInvoices: '[ja] Export invoices to',
            exportExpensifyCard: '[ja] Export Expensify Card transactions as',
            account: '[ja] Account',
            accountDescription: '[ja] Choose where to post journal entries.',
            accountsPayable: '[ja] Accounts payable',
            accountsPayableDescription: '[ja] Choose where to create vendor bills.',
            bankAccount: '[ja] Bank account',
            notConfigured: '[ja] Not configured',
            bankAccountDescription: '[ja] Choose where to send checks from.',
            creditCardAccount: '[ja] Credit card account',
            exportDate: {
                label: '[ja] Export date',
                description: '[ja] Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[ja] Date of last expense',
                        description: '[ja] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[ja] Export date',
                        description: '[ja] Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[ja] Submitted date',
                        description: '[ja] Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "[ja] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[ja] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[ja] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "[ja] QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[ja] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[ja] Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[ja] Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[ja] Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[ja] Check',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "[ja] We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[ja] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[ja] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[ja] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[ja] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '[ja] Choose where to send checks from.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[ja] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[ja] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[ja] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: '[ja] No accounts found',
            noAccountsFoundDescription: '[ja] Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: '[ja] QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "[ja] Can't connect from this device",
                body1: "[ja] You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "[ja] Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: '[ja] Open this link to connect',
                body: '[ja] To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: '[ja] Something went wrong',
                setupErrorBody: (conciergeLink: string) =>
                    `[ja] <muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: '[ja] Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: '[ja] Classes',
            items: '[ja] Items',
            customers: '[ja] Customers/projects',
            exportCompanyCardsDescription: '[ja] Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: '[ja] Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: '[ja] Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[ja] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[ja] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[ja] Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: '[ja] Line item level',
            reportFieldsDisplayedAsDescription: '[ja] Report level',
            customersDescription: '[ja] Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: '[ja] Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: '[ja] Auto-create entities',
                createEntitiesDescription: "[ja] Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: '[ja] Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: '[ja] When to Export',
                description: '[ja] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: '[ja] Connected to',
            importDescription: '[ja] Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: '[ja] Classes',
            locations: '[ja] Locations',
            customers: '[ja] Customers/projects',
            accountsDescription: '[ja] Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[ja] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[ja] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[ja] Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: '[ja] Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: '[ja] Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: '[ja] Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "[ja] QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "[ja] QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: '[ja] Configure how Expensify data exports to QuickBooks Online.',
            date: '[ja] Export date',
            exportInvoices: '[ja] Export invoices to',
            exportExpensifyCard: '[ja] Export Expensify Card transactions as',
            exportDate: {
                label: '[ja] Export date',
                description: '[ja] Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[ja] Date of last expense',
                        description: '[ja] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[ja] Export date',
                        description: '[ja] Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[ja] Submitted date',
                        description: '[ja] Date the report was submitted for approval.',
                    },
                },
            },
            receivable: '[ja] Accounts receivable',
            archive: '[ja] Accounts receivable archive',
            exportInvoicesDescription: '[ja] Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: '[ja] Set how company card purchases export to QuickBooks Online.',
            vendor: '[ja] Vendor',
            defaultVendorDescription: '[ja] Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: '[ja] Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "[ja] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[ja] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[ja] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: '[ja] Account',
            accountDescription: '[ja] Choose where to post journal entries.',
            accountsPayable: '[ja] Accounts payable',
            accountsPayableDescription: '[ja] Choose where to create vendor bills.',
            bankAccount: '[ja] Bank account',
            notConfigured: '[ja] Not configured',
            bankAccountDescription: '[ja] Choose where to send checks from.',
            creditCardAccount: '[ja] Credit card account',
            companyCardsLocationEnabledDescription:
                "[ja] QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "[ja] QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[ja] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: '[ja] Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: '[ja] Invite employees',
                inviteEmployeesDescription: '[ja] Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: '[ja] Auto-create entities',
                createEntitiesDescription:
                    "[ja] Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription: '[ja] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: '[ja] QuickBooks bill payment account',
                qboInvoiceCollectionAccount: '[ja] QuickBooks invoice collections account',
                accountSelectDescription: "[ja] Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "[ja] Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '[ja] Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[ja] Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[ja] Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[ja] Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[ja] Check',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "[ja] We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[ja] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[ja] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '[ja] Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[ja] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[ja] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '[ja] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[ja] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '[ja] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[ja] Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[ja] Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[ja] Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[ja] To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[ja] To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[ja] To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: '[ja] No accounts found',
            noAccountsFoundDescription: '[ja] Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: '[ja] When to Export',
                description: '[ja] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Out-of-pocket expenses will export when paid',
                },
            },
            travelInvoicing: '[ja] Export Expensify Travel Payable To',
            travelInvoicingVendor: '[ja] Travel vendor',
            travelInvoicingPayableAccount: '[ja] Travel payable account',
        },
        workspaceList: {
            joinNow: '[ja] Join now',
            askToJoin: '[ja] Ask to join',
        },
        xero: {
            organization: '[ja] Xero organization',
            organizationDescription: "[ja] Choose the Xero organization that you'd like to import data from.",
            importDescription: '[ja] Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: '[ja] Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[ja] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[ja] Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: '[ja] Tracking categories',
            trackingCategoriesDescription: '[ja] Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `[ja] Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `[ja] Choose where to map ${categoryName} when exporting to Xero.`,
            customers: '[ja] Re-bill customers',
            customersDescription: '[ja] Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: '[ja] Choose how to handle Xero taxes in Expensify.',
            notImported: '[ja] Not imported',
            notConfigured: '[ja] Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: '[ja] Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '[ja] Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '[ja] Report fields',
            },
            exportDescription: '[ja] Configure how Expensify data exports to Xero.',
            purchaseBill: '[ja] Purchase bill',
            exportDeepDiveCompanyCard:
                '[ja] Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: '[ja] Bank transactions',
            xeroBankAccount: '[ja] Xero bank account',
            xeroBankAccountDescription: '[ja] Choose where expenses will post as bank transactions.',
            exportExpensesDescription: '[ja] Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: '[ja] Purchase bill date',
            exportInvoices: '[ja] Export invoices as',
            salesInvoice: '[ja] Sales invoice',
            exportInvoicesDescription: '[ja] Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: '[ja] Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: '[ja] Purchase bill status',
                reimbursedReportsDescription: '[ja] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: '[ja] Xero bill payment account',
                xeroInvoiceCollectionAccount: '[ja] Xero invoice collections account',
                xeroBillPaymentAccountDescription: "[ja] Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "[ja] Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: '[ja] Purchase bill date',
                description: '[ja] Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[ja] Date of last expense',
                        description: '[ja] Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[ja] Export date',
                        description: '[ja] Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[ja] Submitted date',
                        description: '[ja] Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: '[ja] Purchase bill status',
                description: '[ja] Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '[ja] Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '[ja] Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '[ja] Awaiting payment',
                },
            },
            noAccountsFound: '[ja] No accounts found',
            noAccountsFoundDescription: '[ja] Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: '[ja] When to Export',
                description: '[ja] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '[ja] Preferred exporter',
            taxSolution: '[ja] Tax solution',
            notConfigured: '[ja] Not configured',
            exportDate: {
                label: '[ja] Export date',
                description: '[ja] Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[ja] Date of last expense',
                        description: '[ja] Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '[ja] Export date',
                        description: '[ja] Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '[ja] Submitted date',
                        description: '[ja] Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: '[ja] Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '[ja] Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[ja] Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: '[ja] Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '[ja] Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[ja] Vendor bills',
                },
            },
            creditCardAccount: '[ja] Credit card account',
            defaultVendor: '[ja] Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `[ja] Set a default vendor that will apply to ${isReimbursable ? '' : '[ja] non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: '[ja] Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                '[ja] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[ja] Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: '[ja] No accounts found',
            noAccountsFoundDescription: `[ja] Please add the account in Sage Intacct and sync the connection again`,
            autoSync: '[ja] Auto-sync',
            autoSyncDescription: '[ja] Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: '[ja] Invite employees',
            inviteEmployeesDescription:
                '[ja] Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: '[ja] Sync reimbursed reports',
            syncReimbursedReportsDescription: '[ja] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: '[ja] Sage Intacct payment account',
            accountingMethods: {
                label: '[ja] When to Export',
                description: '[ja] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Out-of-pocket expenses will export when paid',
                },
            },
        },
        netsuite: {
            subsidiary: '[ja] Subsidiary',
            subsidiarySelectDescription: "[ja] Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: '[ja] Configure how Expensify data exports to NetSuite.',
            exportInvoices: '[ja] Export invoices to',
            journalEntriesTaxPostingAccount: '[ja] Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: '[ja] Journal entries provincial tax posting account',
            foreignCurrencyAmount: '[ja] Export foreign currency amount',
            exportToNextOpenPeriod: '[ja] Export to next open period',
            nonReimbursableJournalPostingAccount: '[ja] Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: '[ja] Reimbursable journal posting account',
            journalPostingPreference: {
                label: '[ja] Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '[ja] Single, itemized entry for each report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '[ja] Single entry for each expense',
                },
            },
            invoiceItem: {
                label: '[ja] Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '[ja] Create one for me',
                        description: '[ja] We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '[ja] Select existing',
                        description: "[ja] We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: '[ja] Export date',
                description: '[ja] Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[ja] Date of last expense',
                        description: '[ja] Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '[ja] Export date',
                        description: '[ja] Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '[ja] Submitted date',
                        description: '[ja] Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '[ja] Expense reports',
                        reimbursableDescription: '[ja] Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: '[ja] Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '[ja] Vendor bills',
                        reimbursableDescription: dedent(`
                            [ja] Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [ja] Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '[ja] Journal entries',
                        reimbursableDescription: dedent(`
                            [ja] Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [ja] Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "[ja] If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: '[ja] Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: '[ja] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: '[ja] Reimbursements account',
                reimbursementsAccountDescription: "[ja] Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: '[ja] Collections account',
                collectionsAccountDescription: '[ja] Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: '[ja] A/P approval account',
                approvalAccountDescription:
                    '[ja] Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: '[ja] NetSuite default',
                inviteEmployees: '[ja] Invite employees and set approvals',
                inviteEmployeesDescription:
                    '[ja] Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: '[ja] Auto-create employees/vendors',
                enableCategories: '[ja] Enable newly imported categories',
                customFormID: '[ja] Custom form ID',
                customFormIDDescription:
                    '[ja] By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: '[ja] Out-of-pocket expense',
                customFormIDNonReimbursable: '[ja] Company card expense',
                exportReportsTo: {
                    label: '[ja] Expense report approval level',
                    description: '[ja] Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: '[ja] NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '[ja] Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '[ja] Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '[ja] Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: '[ja] When to Export',
                    description: '[ja] Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[ja] Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[ja] Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: '[ja] Vendor bill approval level',
                    description: '[ja] Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: '[ja] NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '[ja] Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '[ja] Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: '[ja] Journal entry approval level',
                    description: '[ja] Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: '[ja] NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '[ja] Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '[ja] Approved for posting',
                    },
                },
                error: {
                    customFormID: '[ja] Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: '[ja] No accounts found',
            noAccountsFoundDescription: '[ja] Please add the account in NetSuite and sync the connection again',
            noVendorsFound: '[ja] No vendors found',
            noVendorsFoundDescription: '[ja] Please add vendors in NetSuite and sync the connection again',
            noItemsFound: '[ja] No invoice items found',
            noItemsFoundDescription: '[ja] Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: '[ja] No subsidiaries found',
            noSubsidiariesFoundDescription: '[ja] Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: '[ja] NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: '[ja] Install the Expensify bundle',
                        description: '[ja] In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: '[ja] Enable token-based authentication',
                        description: '[ja] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: '[ja] Enable SOAP web services',
                        description: '[ja] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: '[ja] Create an access token',
                        description:
                            '[ja] In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: '[ja] Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: '[ja] NetSuite Account ID',
                            netSuiteTokenID: '[ja] Token ID',
                            netSuiteTokenSecret: '[ja] Token Secret',
                        },
                        netSuiteAccountIDDescription: '[ja] In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: '[ja] Expense categories',
                expenseCategoriesDescription: '[ja] Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: '[ja] Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: '[ja] Departments',
                        subtitle: '[ja] Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: '[ja] Classes',
                        subtitle: '[ja] Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: '[ja] Locations',
                        subtitle: '[ja] Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: '[ja] Customers/projects',
                    subtitle: '[ja] Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: '[ja] Import customers',
                    importJobs: '[ja] Import projects',
                    customers: '[ja] customers',
                    jobs: '[ja] projects',
                    label: (importFields: string[], importType: string) => `${importFields.join('[ja]  and ')}, ${importType}`,
                },
                importTaxDescription: '[ja] Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: '[ja] Choose an option below:',
                    label: (importedTypes: string[]) => `[ja] Imported as ${importedTypes.join('[ja]  and ')}`,
                    requiredFieldError: (fieldName: string) => `[ja] Please enter the ${fieldName}`,
                    customSegments: {
                        title: '[ja] Custom segments/records',
                        addText: '[ja] Add custom segment/record',
                        recordTitle: '[ja] Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '[ja] View detailed instructions',
                        helpText: '[ja]  on configuring custom segments/records.',
                        emptyTitle: '[ja] Add a custom segment or custom record',
                        fields: {
                            segmentName: '[ja] Name',
                            internalID: '[ja] Internal ID',
                            scriptID: '[ja] Script ID',
                            customRecordScriptID: '[ja] Transaction column ID',
                            mapping: '[ja] Displayed as',
                        },
                        removeTitle: '[ja] Remove custom segment/record',
                        removePrompt: '[ja] Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: '[ja] custom segment name',
                            customRecordName: '[ja] custom record name',
                            segmentTitle: '[ja] Custom segment',
                            customSegmentAddTitle: '[ja] Add custom segment',
                            customRecordAddTitle: '[ja] Add custom record',
                            recordTitle: '[ja] Custom record',
                            segmentRecordType: '[ja] Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "[ja] What's the custom segment name?",
                            customRecordNameTitle: "[ja] What's the custom record name?",
                            customSegmentNameFooter: `[ja] You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `[ja] You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "[ja] What's the internal ID?",
                            customSegmentInternalIDFooter: `[ja] First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*

You can find custom segment internal IDs in NetSuite under:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the hyperlink next to *Custom Record Type*.
4. Find the internal ID in the table at the bottom.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `[ja] You can find custom record internal IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the internal ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "[ja] What's the script ID?",
                            customSegmentScriptIDFooter: `[ja] You can find custom segment script IDs in NetSuite under: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the *Application and Sourcing* tab near the bottom, then:
    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.
    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "[ja] What's the transaction column ID?",
                            customRecordScriptIDFooter: `[ja] You can find custom record script IDs in NetSuite under:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the script ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '[ja] How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: '[ja] How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `[ja] A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: '[ja] Custom lists',
                        addText: '[ja] Add custom list',
                        recordTitle: '[ja] Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '[ja] View detailed instructions',
                        helpText: '[ja]  on configuring custom lists.',
                        emptyTitle: '[ja] Add a custom list',
                        fields: {
                            listName: '[ja] Name',
                            internalID: '[ja] Internal ID',
                            transactionFieldID: '[ja] Transaction field ID',
                            mapping: '[ja] Displayed as',
                        },
                        removeTitle: '[ja] Remove custom list',
                        removePrompt: '[ja] Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: '[ja] Choose a custom list',
                            transactionFieldIDTitle: "[ja] What's the transaction field ID?",
                            transactionFieldIDFooter: `[ja] You can find transaction field IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom list.
3. Find the transaction field ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '[ja] How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `[ja] A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: '[ja] NetSuite employee default',
                        description: '[ja] Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `[ja] If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '[ja] Tags',
                        description: '[ja] Line-item level',
                        footerContent: (importField: string) => `[ja] ${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '[ja] Report fields',
                        description: '[ja] Report level',
                        footerContent: (importField: string) => `[ja] ${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: '[ja] Sage Intacct setup',
            prerequisitesTitle: '[ja] Before you connect...',
            downloadExpensifyPackage: '[ja] Download the Expensify package for Sage Intacct',
            followSteps: '[ja] Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: '[ja] Enter your Sage Intacct credentials',
            entity: '[ja] Entity',
            employeeDefault: '[ja] Sage Intacct employee default',
            employeeDefaultDescription: "[ja] The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "[ja] Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "[ja] Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: (mappingTitle: string) => `[ja] Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: '[ja] Expense types',
            expenseTypesDescription: '[ja] Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: '[ja] Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: '[ja] Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: '[ja] User-defined dimensions',
            addUserDefinedDimension: '[ja] Add user-defined dimension',
            integrationName: '[ja] Integration name',
            dimensionExists: '[ja] A dimension with this name already exists.',
            removeDimension: '[ja] Remove user-defined dimension',
            removeDimensionPrompt: '[ja] Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: '[ja] User-defined dimension',
            addAUserDefinedDimension: '[ja] Add a user-defined dimension',
            detailedInstructionsLink: '[ja] View detailed instructions',
            detailedInstructionsRestOfSentence: '[ja]  on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '[ja] 1 UDD added',
                other: (count: number) => `[ja] ${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '[ja] departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '[ja] classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '[ja] locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '[ja] customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '[ja] projects (jobs)';
                    default:
                        return '[ja] mappings';
                }
            },
        },
        type: {
            free: '[ja] Free',
            control: '[ja] Control',
            collect: '[ja] Collect',
        },
        companyCards: {
            addCards: '[ja] Add cards',
            selectCards: '[ja] Select cards',
            fromOtherWorkspaces: '[ja] From other workspaces',
            addWorkEmail: '[ja] Add your work email',
            addWorkEmailDescription: '[ja] Please add your work email in order to use existing feeds from other workspaces.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: "[ja] Couldn't load card feeds",
                workspaceFeedsCouldNotBeLoadedMessage: '[ja] An error occurred while loading workspace card feeds. Please try again or contact your administrator.',
                feedCouldNotBeLoadedTitle: "[ja] Couldn't load this feed",
                feedCouldNotBeLoadedMessage: '[ja] An error occurred while loading this feed. Please try again or contact your administrator.',
                tryAgain: '[ja] Try again',
            },
            addNewCard: {
                other: '[ja] Other',
                fileImport: '[ja] Import transactions from file',
                createFileFeedHelpText: `[ja] <muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: '[ja] Company card layout name',
                cardLayoutNameRequired: '[ja] The Company card layout name is required',
                useAdvancedFields: '[ja] Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: '[ja] American Express Corporate Cards',
                    cdf: '[ja] Mastercard Commercial Cards',
                    vcf: '[ja] Visa Commercial Cards',
                    stripe: '[ja] Stripe Cards',
                },
                yourCardProvider: `[ja] Who's your card provider?`,
                whoIsYourBankAccount: '[ja] Who’s your bank?',
                whereIsYourBankLocated: '[ja] Where’s your bank located?',
                howDoYouWantToConnect: '[ja] How do you want to connect to your bank?',
                learnMoreAboutOptions: `[ja] <muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: '[ja] Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `[ja] Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: '[ja] The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `[ja] Enable your ${provider} feed`,
                    heading: '[ja] We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: '[ja] We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: '[ja] We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `[ja] 1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.

2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `[ja] 1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.

2. Once the feed is enabled, Amex will send you a production letter.

3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `[ja] 1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.

 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `[ja] 1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Under Product Integrations, click Enable next to Expensify.

3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: '[ja] What bank issues these cards?',
                enterNameOfBank: '[ja] Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: '[ja] What are the Visa feed details?',
                        processorLabel: '[ja] Processor ID',
                        bankLabel: '[ja] Financial institution (bank) ID',
                        companyLabel: '[ja] Company ID',
                        helpLabel: '[ja] Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `[ja] What's the Amex delivery file name?`,
                        fileNameLabel: '[ja] Delivery file name',
                        helpLabel: '[ja] Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `[ja] What's the Mastercard distribution ID?`,
                        distributionLabel: '[ja] Distribution ID',
                        helpLabel: '[ja] Where do I find the distribution ID?',
                    },
                },
                amexCorporate: '[ja] Select this if the front of your cards say “Corporate”',
                amexBusiness: '[ja] Select this if the front of your cards say “Business”',
                amexPersonal: '[ja] Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: '[ja] Please select a card provider before continuing',
                    pleaseSelectBankAccount: '[ja] Please select a bank account before continuing',
                    pleaseSelectBank: '[ja] Please select a bank before continuing',
                    pleaseSelectCountry: '[ja] Please select a country before continuing',
                    pleaseSelectFeedType: '[ja] Please select a feed type before continuing',
                },
                exitModal: {
                    title: '[ja] Something not working?',
                    prompt: "[ja] We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: '[ja] Report issue',
                    cancelText: '[ja] Skip',
                },
                csvColumns: {
                    cardNumber: '[ja] Card number',
                    postedDate: '[ja] Date',
                    merchant: '[ja] Merchant',
                    amount: '[ja] Amount',
                    currency: '[ja] Currency',
                    ignore: '[ja] Ignore',
                    originalTransactionDate: '[ja] Original transaction date',
                    originalAmount: '[ja] Original amount',
                    originalCurrency: '[ja] Original currency',
                    comment: '[ja] Comment',
                    category: '[ja] Category',
                    tag: '[ja] Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `[ja] Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `[ja] Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '[ja] Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '[ja] Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '[ja] Custom day of month',
            },
            assign: '[ja] Assign',
            assignCard: '[ja] Assign card',
            findCard: '[ja] Find card',
            cardNumber: '[ja] Card number',
            commercialFeed: '[ja] Commercial feed',
            feedName: (feedName: string) => `[ja] ${feedName} cards`,
            deletedFeed: '[ja] Deleted feed',
            deletedCard: '[ja] Deleted card',
            directFeed: '[ja] Direct feed',
            whoNeedsCardAssigned: '[ja] Who needs a card assigned?',
            chooseTheCardholder: '[ja] Choose the cardholder',
            chooseCard: '[ja] Choose a card',
            chooseCardFor: (assignee: string) => `[ja] Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: '[ja] No active cards on this feed',
            somethingMightBeBroken:
                '[ja] <muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: '[ja] Choose a transaction start date',
            startDateDescription: "[ja] Choose your import start date. We'll sync all transactions from this date onwards.",
            editStartDateDescription: "[ja] Choose a new transaction start date. We'll sync all transactions from that date onwards, excluding those we already imported.",
            fromTheBeginning: '[ja] From the beginning',
            customStartDate: '[ja] Custom start date',
            customCloseDate: '[ja] Custom close date',
            letsDoubleCheck: "[ja] Let's double check that everything looks right.",
            confirmationDescription: "[ja] We'll begin importing transactions immediately.",
            card: '[ja] Card',
            cardName: '[ja] Card name',
            brokenConnectionError: '[ja] <rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `[ja] assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '[ja] company card',
            chooseCardFeed: '[ja] Choose card feed',
            ukRegulation:
                '[ja] Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: '[ja] Card assignment failed.',
            unassignCardFailedError: '[ja] Card unassignment failed.',
            cardAlreadyAssignedError: '[ja] This card is already assigned to a user in another workspace.',
            importTransactions: {
                title: '[ja] Import transactions from file',
                description: '[ja] Please adjust the settings for your file that will be applied on import.',
                cardDisplayName: '[ja] Card display name',
                currency: '[ja] Currency',
                transactionsAreReimbursable: '[ja] Transactions are reimbursable',
                flipAmountSign: '[ja] Flip amount sign',
                importButton: '[ja] Import transactions',
            },
            assignNewCards: {
                title: '[ja] Assign new cards',
                description: '[ja] Get the latest cards to assign from your bank',
            },
        },
        expensifyCard: {
            issueAndManageCards: '[ja] Issue and manage your Expensify Cards',
            getStartedIssuing: '[ja] Get started by issuing your first virtual or physical card.',
            verificationInProgress: '[ja] Verification in progress...',
            verifyingTheDetails: "[ja] We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                '[ja] The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                '[ja] Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: '[ja] Issue card',
            findCard: '[ja] Find card',
            newCard: '[ja] New card',
            name: '[ja] Name',
            lastFour: '[ja] Last 4',
            limit: '[ja] Limit',
            currentBalance: '[ja] Current balance',
            currentBalanceDescription: '[ja] Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: (settlementDate: string) => `[ja] Balance will be settled on ${settlementDate}`,
            settleBalance: '[ja] Settle balance',
            cardLimit: '[ja] Card limit',
            remainingLimit: '[ja] Remaining limit',
            requestLimitIncrease: '[ja] Request limit increase',
            remainingLimitDescription:
                '[ja] We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: '[ja] Cash back',
            earnedCashbackDescription: '[ja] Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: '[ja] Issue new card',
            finishSetup: '[ja] Finish setup',
            chooseBankAccount: '[ja] Choose bank account',
            chooseExistingBank: '[ja] Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: '[ja] Account ending in',
            addNewBankAccount: '[ja] Add a new bank account',
            settlementAccount: '[ja] Settlement account',
            settlementAccountDescription: '[ja] Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `[ja] Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: '[ja] Settlement frequency',
            settlementFrequencyDescription: '[ja] Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo: '[ja] If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            frequency: {
                daily: '[ja] Daily',
                monthly: '[ja] Monthly',
            },
            cardDetails: '[ja] Card details',
            cardPending: ({name}: {name: string}) => `[ja] Card is currently pending and will be issued once ${name}'s account is validated.`,
            virtual: '[ja] Virtual',
            physical: '[ja] Physical',
            deactivate: '[ja] Deactivate card',
            changeCardLimit: '[ja] Change card limit',
            changeLimit: '[ja] Change limit',
            smartLimitWarning: (limit: number | string) => `[ja] If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `[ja] If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `[ja] If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: '[ja] Change card limit type',
            changeLimitType: '[ja] Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `[ja] If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `[ja] If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: '[ja] Add shipping details',
            issuedCard: (assignee: string) => `[ja] issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `[ja] issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: (assignee: string, link: string) => `[ja] issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `[ja] ${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `[ja] ${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: (assignee: string, link: string) => `[ja] ${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: '[ja] card',
            replacementCard: '[ja] replacement card',
            verifyingHeader: '[ja] Verifying',
            bankAccountVerifiedHeader: '[ja] Bank account verified',
            verifyingBankAccount: '[ja] Verifying bank account...',
            verifyingBankAccountDescription: '[ja] Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: '[ja] Bank account verified!',
            bankAccountVerifiedDescription: '[ja] You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: '[ja] One more step...',
            oneMoreStepDescription: '[ja] Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: '[ja] Got it',
            goToConcierge: '[ja] Go to Concierge',
        },
        categories: {
            deleteCategories: '[ja] Delete categories',
            deleteCategoriesPrompt: '[ja] Are you sure you want to delete these categories?',
            deleteCategory: '[ja] Delete category',
            deleteCategoryPrompt: '[ja] Are you sure you want to delete this category?',
            disableCategories: '[ja] Disable categories',
            disableCategory: '[ja] Disable category',
            enableCategories: '[ja] Enable categories',
            enableCategory: '[ja] Enable category',
            defaultSpendCategories: '[ja] Default spend categories',
            spendCategoriesDescription: '[ja] Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: '[ja] An error occurred while deleting the category, please try again',
            categoryName: '[ja] Category name',
            requiresCategory: '[ja] Members must categorize all expenses',
            needCategoryForExportToIntegration: (connectionName: string) => `[ja] All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: '[ja] Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "[ja] You haven't created any categories",
                subtitle: '[ja] Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[ja] <muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: '[ja] An error occurred while updating the category, please try again',
            createFailureMessage: '[ja] An error occurred while creating the category, please try again',
            addCategory: '[ja] Add category',
            editCategory: '[ja] Edit category',
            editCategories: '[ja] Edit categories',
            findCategory: '[ja] Find category',
            categoryRequiredError: '[ja] Category name is required',
            existingCategoryError: '[ja] A category with this name already exists',
            invalidCategoryName: '[ja] Invalid category name',
            importedFromAccountingSoftware: '[ja] The categories below are imported from your',
            payrollCode: '[ja] Payroll code',
            updatePayrollCodeFailureMessage: '[ja] An error occurred while updating the payroll code, please try again',
            glCode: '[ja] GL code',
            updateGLCodeFailureMessage: '[ja] An error occurred while updating the GL code, please try again',
            importCategories: '[ja] Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: '[ja] Cannot delete or disable all categories',
                description: `[ja] At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: '[ja] Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: '[ja] Spend',
                subtitle: '[ja] Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: '[ja] Manage',
                subtitle: '[ja] Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: '[ja] Earn',
                subtitle: '[ja] Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: '[ja] Organize',
                subtitle: '[ja] Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: '[ja] Integrate',
                subtitle: '[ja] Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: '[ja] Distance rates',
                subtitle: '[ja] Add, update, and enforce rates.',
            },
            perDiem: {
                title: '[ja] Per diem',
                subtitle: '[ja] Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: '[ja] Travel',
                subtitle: '[ja] Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: '[ja] Get started with Expensify Travel',
                    subtitle: "[ja] We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "[ja] Let's go",
                },
                reviewingRequest: {
                    title: "[ja] Pack your bags, we've got your request...",
                    subtitle: "[ja] We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: '[ja] Request sent',
                },
                bookOrManageYourTrip: {
                    title: '[ja] Travel booking',
                    subtitle: "[ja] Congrats! You're all set to book and manage travel on this workspace.",
                    ctaText: '[ja] Manage travel',
                },
                settings: {
                    autoAddTripName: {
                        title: '[ja] Add trip names to expenses',
                        subtitle: '[ja] Automatically add trip names to expense descriptions for travel booked in Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '[ja] Travel booking',
                        subtitle: "[ja] Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: '[ja] Manage travel',
                    },
                    centralInvoicingSection: {
                        title: '[ja] Central invoicing',
                        subtitle: '[ja] Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: '[ja] Learn how.',
                        subsections: {
                            currentTravelSpendLabel: '[ja] Current travel spend',
                            currentTravelSpendPaymentQueued: (amount: string) => `[ja] Payment of ${amount} is queued and will be processed soon.`,
                            currentTravelSpendCta: '[ja] Pay balance',
                            currentTravelLimitLabel: '[ja] Current travel limit',
                            settlementAccountLabel: '[ja] Settlement account',
                            settlementFrequencyLabel: '[ja] Settlement frequency',
                            settlementFrequencyDescription: '[ja] How often Expensify will pull from your business bank account to settle recent Expensify Travel transactions.',
                            monthlySpendLimitLabel: '[ja] Monthly spend limit per member',
                            monthlySpendLimitDescription: '[ja] The maximum amount each member can spend on travel per month.',
                            reduceLimitTitle: '[ja] Reduce travel spend limit?',
                            reduceLimitWarning:
                                '[ja] If you reduce the limit, members who have already spent more than this amount will be unable to make new travel bookings until next month.',
                            provisioningError:
                                "[ja] We weren't able to provision some of the members of your workspace for central invoicing. Please try again later or reach out to Concierge for assistance.",
                        },
                    },
                    disableModal: {
                        title: '[ja] Turn off Travel Invoicing?',
                        body: '[ja] Upcoming hotel and car rental reservations may need to be re-booked with a different payment method to avoid cancellation.',
                        confirm: '[ja] Turn off',
                    },
                    outstandingBalanceModal: {
                        title: "[ja] Can't turn off Travel Invoicing",
                        body: '[ja] You still have an outstanding travel balance. Please pay your balance first.',
                        confirm: '[ja] Got it',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `[ja] Pay balance of ${amount}?`,
                        body: '[ja] The payment will be queued and processed shortly after. This action cannot be undone once started.',
                    },
                    exportToPDF: '[ja] Export to PDF',
                    exportToCSV: '[ja] Export to CSV',
                    selectDateRangeError: '[ja] Please select a date range to export',
                    invalidDateRangeError: '[ja] The start date must be before the end date',
                    enabled: '[ja] Central Invoicing enabled!',
                    enabledDescription: '[ja] All travel spend on this workspace will now be centralized in a monthly invoice.',
                },
                personalDetailsDescription: '[ja] In order to book travel, please enter your legal name as it appears on your government-issued ID.',
            },
            expensifyCard: {
                title: '[ja] Expensify Card',
                subtitle: '[ja] Gain insights and control over spend.',
                disableCardTitle: '[ja] Disable Expensify Card',
                disableCardPrompt: '[ja] You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: '[ja] Chat with Concierge',
                feed: {
                    title: '[ja] Get the Expensify Card',
                    subTitle: '[ja] Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: '[ja] Cash back on every US purchase',
                        unlimited: '[ja] Unlimited virtual cards',
                        spend: '[ja] Spend controls and custom limits',
                    },
                    ctaTitle: '[ja] Issue new card',
                },
            },
            companyCards: {
                title: '[ja] Company cards',
                subtitle: '[ja] Connect the cards you already have.',
                feed: {
                    title: '[ja] Bring your own cards (BYOC)',
                    subtitle: '[ja] Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: '[ja] Connect cards from 10,000+ banks',
                        assignCards: '[ja] Link your team’s existing cards',
                        automaticImport: '[ja] We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: '[ja] Bank connection issue',
                connectWithPlaid: '[ja] connect via Plaid',
                connectWithExpensifyCard: '[ja] try the Expensify Card.',
                bankConnectionDescription: `[ja] Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: '[ja] Disable company cards',
                disableCardPrompt: '[ja] You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: '[ja] Chat with Concierge',
                cardDetails: '[ja] Card details',
                cardNumber: '[ja] Card number',
                cardholder: '[ja] Cardholder',
                cardName: '[ja] Card name',
                allCards: '[ja] All cards',
                assignedCards: '[ja] Assigned',
                unassignedCards: '[ja] Unassigned',
                integrationExport: (integration: string, type?: string) => (integration && type ? `[ja] ${integration} ${type.toLowerCase()} export` : `[ja] ${integration} export`),
                integrationExportTitleXero: (integration: string) => `[ja] Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `[ja] Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: '[ja] Last updated',
                transactionStartDate: '[ja] Transaction start date',
                updateCard: '[ja] Update card',
                unassignCard: '[ja] Unassign card',
                unassign: '[ja] Unassign',
                unassignCardDescription: '[ja] Unassigning this card will delete all unsubmitted transactions.',
                assignCard: '[ja] Assign card',
                removeCard: '[ja] Remove card',
                remove: '[ja] Remove',
                removeCardDescription: '[ja] Removing this card will delete all unsubmitted transactions.',
                cardFeedName: '[ja] Card feed name',
                cardFeedNameDescription: '[ja] Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: '[ja] Delete transactions',
                cardFeedTransactionDescription: '[ja] Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: '[ja] Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: '[ja] Allow deleting transactions',
                removeCardFeed: '[ja] Remove card feed',
                removeCardFeedTitle: (feedName: string) => `[ja] Remove ${feedName} feed`,
                removeCardFeedDescription: '[ja] Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: '[ja] Card feed name is required',
                    statementCloseDateRequired: '[ja] Please select a statement close date.',
                },
                corporate: '[ja] Restrict deleting transactions',
                personal: '[ja] Allow deleting transactions',
                setFeedNameDescription: '[ja] Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: '[ja] When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: '[ja] No cards in this feed',
                emptyAddedFeedDescription: "[ja] Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `[ja] We're reviewing your request...`,
                pendingFeedDescription: `[ja] We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '[ja] Check your browser window',
                pendingBankDescription: (bankName: string) => `[ja] Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: '[ja] please click here',
                giveItNameInstruction: '[ja] Give the card a name that sets it apart from others.',
                updating: '[ja] Updating...',
                neverUpdated: '[ja] Never',
                noAccountsFound: '[ja] No accounts found',
                defaultCard: '[ja] Default card',
                downgradeTitle: `[ja] Can't downgrade workspace`,
                downgradeSubTitle: `[ja] This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `[ja] Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: '[ja] Get the Expensify Card',
                expensifyCardBannerSubtitle: '[ja] Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: '[ja] Learn more',
                statementCloseDateTitle: '[ja] Statement close date',
                statementCloseDateDescription: '[ja] Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: '[ja] Workflows',
                subtitle: '[ja] Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    '[ja] Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: '[ja] Invoices',
                subtitle: '[ja] Send and receive invoices.',
            },
            categories: {
                title: '[ja] Categories',
                subtitle: '[ja] Track and organize spend.',
            },
            tags: {
                title: '[ja] Tags',
                subtitle: '[ja] Classify costs and track billable expenses.',
            },
            taxes: {
                title: '[ja] Taxes',
                subtitle: '[ja] Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: '[ja] Report fields',
                subtitle: '[ja] Set up custom fields for spend.',
            },
            connections: {
                title: '[ja] Accounting',
                subtitle: '[ja] Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: '[ja] Receipt partners',
                subtitle: '[ja] Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '[ja] Not so fast...',
                featureEnabledText: "[ja] To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "[ja] To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: '[ja] Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '[ja] Disconnect Uber',
                disconnectText: '[ja] To disable this feature, please disconnect the Uber for Business integration first.',
                description: '[ja] Are you sure you want to disconnect this integration?',
                confirmText: '[ja] Got it',
            },
            workflowWarningModal: {
                featureEnabledTitle: '[ja] Not so fast...',
                featureEnabledText:
                    '[ja] Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: '[ja] Go to Expensify Cards',
            },
            rules: {
                title: '[ja] Rules',
                subtitle: '[ja] Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: '[ja] Time',
                subtitle: '[ja] Set a billable hourly rate for time tracking.',
                defaultHourlyRate: '[ja] Default hourly rate',
            },
        },
        reports: {
            reportsCustomTitleExamples: '[ja] Examples:',
            customReportNamesSubtitle: `[ja] <muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: '[ja] Default report title',
            customNameDescription: `[ja] Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: '[ja] Name',
            customNameEmailPhoneExample: '[ja] Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: '[ja] Report start date: {report:startdate}',
            customNameWorkspaceNameExample: '[ja] Workspace name: {report:workspacename}',
            customNameReportIDExample: '[ja] Report ID: {report:id}',
            customNameTotalExample: '[ja] Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: '[ja] Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: '[ja] Add field',
            delete: '[ja] Delete field',
            deleteFields: '[ja] Delete fields',
            findReportField: '[ja] Find report field',
            deleteConfirmation: '[ja] Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: '[ja] Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "[ja] You haven't created any report fields",
                subtitle: '[ja] Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "[ja] Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: '[ja] Disable report fields',
            disableReportFieldsConfirmation: '[ja] Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: '[ja] The report fields below are imported from your',
            textType: '[ja] Text',
            dateType: '[ja] Date',
            dropdownType: '[ja] List',
            formulaType: '[ja] Formula',
            textAlternateText: '[ja] Add a field for free text input.',
            dateAlternateText: '[ja] Add a calendar for date selection.',
            dropdownAlternateText: '[ja] Add a list of options to choose from.',
            formulaAlternateText: '[ja] Add a formula field.',
            nameInputSubtitle: '[ja] Choose a name for the report field.',
            typeInputSubtitle: '[ja] Choose what type of report field to use.',
            initialValueInputSubtitle: '[ja] Enter a starting value to show in the report field.',
            listValuesInputSubtitle: '[ja] These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: '[ja] These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: '[ja] Delete value',
            deleteValues: '[ja] Delete values',
            disableValue: '[ja] Disable value',
            disableValues: '[ja] Disable values',
            enableValue: '[ja] Enable value',
            enableValues: '[ja] Enable values',
            emptyReportFieldsValues: {
                title: "[ja] You haven't created any list values",
                subtitle: '[ja] Add custom values to appear on reports.',
            },
            deleteValuePrompt: '[ja] Are you sure you want to delete this list value?',
            deleteValuesPrompt: '[ja] Are you sure you want to delete these list values?',
            listValueRequiredError: '[ja] Please enter a list value name',
            existingListValueError: '[ja] A list value with this name already exists',
            editValue: '[ja] Edit value',
            listValues: '[ja] List values',
            addValue: '[ja] Add value',
            existingReportFieldNameError: '[ja] A report field with this name already exists',
            reportFieldNameRequiredError: '[ja] Please enter a report field name',
            reportFieldTypeRequiredError: '[ja] Please choose a report field type',
            circularReferenceError: "[ja] This field can't refer to itself. Please update.",
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `[ja] Formula field ${value} not recognized`,
            reportFieldInitialValueRequiredError: '[ja] Please choose a report field initial value',
            genericFailureMessage: '[ja] An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: '[ja] Tag name',
            requiresTag: '[ja] Members must tag all expenses',
            trackBillable: '[ja] Track billable expenses',
            customTagName: '[ja] Custom tag name',
            enableTag: '[ja] Enable tag',
            enableTags: '[ja] Enable tags',
            requireTag: '[ja] Require tag',
            requireTags: '[ja] Require tags',
            notRequireTags: '[ja] Don’t require',
            disableTag: '[ja] Disable tag',
            disableTags: '[ja] Disable tags',
            addTag: '[ja] Add tag',
            editTag: '[ja] Edit tag',
            editTags: '[ja] Edit tags',
            findTag: '[ja] Find tag',
            subtitle: '[ja] Tags add more detailed ways to classify costs.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `[ja] <muted-text>Tags add more detailed ways to classify costs. You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "[ja] You haven't created any tags",
                subtitle: '[ja] Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `[ja] <muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[ja] <muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: '[ja] Delete tag',
            deleteTags: '[ja] Delete tags',
            deleteTagConfirmation: '[ja] Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: '[ja] Are you sure that you want to delete these tags?',
            deleteFailureMessage: '[ja] An error occurred while deleting the tag, please try again',
            tagRequiredError: '[ja] Tag name is required',
            existingTagError: '[ja] A tag with this name already exists',
            invalidTagNameError: '[ja] Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: '[ja] An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: '[ja] Tags are managed in your',
            employeesSeeTagsAs: '[ja] Employees see tags as',
            glCode: '[ja] GL code',
            updateGLCodeFailureMessage: '[ja] An error occurred while updating the GL code, please try again',
            tagRules: '[ja] Tag rules',
            approverDescription: '[ja] Approver',
            importTags: '[ja] Import tags',
            importTagsSupportingText: '[ja] Code your expenses with one type of tag or many.',
            configureMultiLevelTags: '[ja] Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `[ja] Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: '[ja] The first row is the title for each tag list',
                independentTags: '[ja] These are independent tags',
                glAdjacentColumn: '[ja] There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: '[ja] Single level of tags',
                multiLevel: '[ja] Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '[ja] Switch Tag Levels',
                prompt1: '[ja] Switching tag levels will erase all current tags.',
                prompt2: '[ja]  We suggest you first',
                prompt3: '[ja]  download a backup',
                prompt4: '[ja]  by exporting your tags.',
                prompt5: '[ja]  Learn more',
                prompt6: '[ja]  about tag levels.',
            },
            overrideMultiTagWarning: {
                title: '[ja] Import tags',
                prompt1: '[ja] Are you sure?',
                prompt2: '[ja]  The existing tags will be overridden, but you can',
                prompt3: '[ja]  download a backup',
                prompt4: '[ja]  first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `[ja] We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: '[ja] Cannot delete or disable all tags',
                description: `[ja] At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: '[ja] Cannot make all tags optional',
                description: `[ja] At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: '[ja] Cannot make tag list required',
                description: '[ja] You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '[ja] 1 Tag',
                other: (count: number) => `[ja] ${count} Tags`,
            }),
        },
        taxes: {
            subtitle: '[ja] Add tax names, rates, and set defaults.',
            addRate: '[ja] Add rate',
            workspaceDefault: '[ja] Workspace currency default',
            foreignDefault: '[ja] Foreign currency default',
            customTaxName: '[ja] Custom tax name',
            value: '[ja] Value',
            taxReclaimableOn: '[ja] Tax reclaimable on',
            taxRate: '[ja] Tax rate',
            findTaxRate: '[ja] Find tax rate',
            error: {
                taxRateAlreadyExists: '[ja] This tax name is already in use',
                taxCodeAlreadyExists: '[ja] This tax code is already in use',
                valuePercentageRange: '[ja] Please enter a valid percentage between 0 and 100',
                customNameRequired: '[ja] Custom tax name is required',
                deleteFailureMessage: '[ja] An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: '[ja] An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: '[ja] An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: '[ja] The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: '[ja] Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `[ja] Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '[ja] Delete rate',
                deleteMultiple: '[ja] Delete rates',
                enable: '[ja] Enable rate',
                disable: '[ja] Disable rate',
                enableTaxRates: () => ({
                    one: '[ja] Enable rate',
                    other: '[ja] Enable rates',
                }),
                disableTaxRates: () => ({
                    one: '[ja] Disable rate',
                    other: '[ja] Disable rates',
                }),
            },
            importedFromAccountingSoftware: '[ja] The taxes below are imported from your',
            taxCode: '[ja] Tax code',
            updateTaxCodeFailureMessage: '[ja] An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: '[ja] Name your new workspace',
            selectFeatures: '[ja] Select features to copy',
            whichFeatures: '[ja] Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '[ja] \n\nDo you want to continue?',
            categories: '[ja] categories and your auto-categorization rules',
            reimbursementAccount: '[ja] reimbursement account',
            welcomeNote: '[ja] Please start using my new workspace',
            delayedSubmission: '[ja] delayed submission',
            merchantRules: '[ja] Merchant rules',
            merchantRulesCount: () => ({
                one: '[ja] 1 merchant rule',
                other: (count: number) => `[ja] ${count} merchant rules`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `[ja] You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: '[ja] An error occurred while duplicating your new workspace. Please try again.',
        },
        emptyWorkspace: {
            title: '[ja] No workspaces yet',
            subtitle: '[ja] Create a workspace to manage your expenses, reimbursements, and company cards.',
            createAWorkspaceCTA: '[ja] Get Started',
            features: {
                trackAndCollect: '[ja] Track and collect receipts',
                reimbursements: '[ja] Reimburse employees',
                companyCards: '[ja] Manage company cards',
            },
            notFound: '[ja] No workspace found',
            description: '[ja] Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: '[ja] New workspace',
            getTheExpensifyCardAndMore: '[ja] Get the Expensify Card and more',
            confirmWorkspace: '[ja] Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `[ja] My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `[ja] ${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '[ja] An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `[ja] Are you sure you want to remove ${memberName}?`,
                other: '[ja] Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `[ja] ${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '[ja] Remove member',
                other: '[ja] Remove members',
            }),
            findMember: '[ja] Find member',
            removeWorkspaceMemberButtonTitle: '[ja] Remove from workspace',
            removeGroupMemberButtonTitle: '[ja] Remove from group',
            removeRoomMemberButtonTitle: '[ja] Remove from chat',
            removeMemberPrompt: (memberName: string) => `[ja] Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '[ja] Remove member',
            transferOwner: '[ja] Transfer owner',
            makeMember: () => ({
                one: '[ja] Make member',
                other: '[ja] Make members',
            }),
            makeAdmin: () => ({
                one: '[ja] Make admin',
                other: '[ja] Make admins',
            }),
            makeAuditor: () => ({
                one: '[ja] Make auditor',
                other: '[ja] Make auditors',
            }),
            selectAll: '[ja] Select all',
            error: {
                genericAdd: '[ja] There was a problem adding this workspace member',
                cannotRemove: "[ja] You can't remove yourself or the workspace owner",
                genericRemove: '[ja] There was a problem removing that workspace member',
            },
            addedWithPrimary: '[ja] Some members were added with their primary logins.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `[ja] Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `[ja] Total workspace members: ${count}`,
            importMembers: '[ja] Import members',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `[ja] If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `[ja] ${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `[ja] You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[ja] If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[ja] If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `[ja] ${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: '[ja] Get started by issuing your first virtual or physical card.',
            issueCard: '[ja] Issue card',
            issueNewCard: {
                whoNeedsCard: '[ja] Who needs a card?',
                inviteNewMember: '[ja] Invite new member',
                findMember: '[ja] Find member',
                chooseCardType: '[ja] Choose a card type',
                physicalCard: '[ja] Physical card',
                physicalCardDescription: '[ja] Great for the frequent spender',
                virtualCard: '[ja] Virtual card',
                virtualCardDescription: '[ja] Instant and flexible',
                chooseLimitType: '[ja] Choose a limit type',
                smartLimit: '[ja] Smart Limit',
                smartLimitDescription: '[ja] Spend up to a certain amount before requiring approval',
                monthly: '[ja] Monthly',
                monthlyDescription: '[ja] Limit renews monthly',
                fixedAmount: '[ja] Fixed amount',
                fixedAmountDescription: '[ja] Spend until the limit is reached',
                setLimit: '[ja] Set a limit',
                cardLimitError: '[ja] Please enter an amount less than $21,474,836',
                giveItName: '[ja] Give it a name',
                giveItNameInstruction: '[ja] Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: '[ja] Card name',
                letsDoubleCheck: '[ja] Let’s double check that everything looks right.',
                willBeReadyToUse: '[ja] This card will be ready to use immediately.',
                willBeReadyToShip: '[ja] This card will be ready to ship immediately.',
                cardholder: '[ja] Cardholder',
                cardType: '[ja] Card type',
                limit: '[ja] Limit',
                limitType: '[ja] Limit type',
                disabledApprovalForSmartLimitError: '[ja] Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
                singleUse: '[ja] Single-use',
                singleUseDescription: '[ja] Expires after one transaction',
                validFrom: '[ja] Valid from',
                startDate: '[ja] Start date',
                endDate: '[ja] End date',
                noExpirationHint: "[ja] A card without an expiration date won't expire",
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `[ja] Valid from ${startDate} to ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `[ja] ${startDate} to ${endDate}`,
                combineWithExpiration: '[ja] Combine with expiration options for additional spend control',
                enterValidDate: '[ja] Enter a valid date',
                expirationDate: '[ja] Expiration date',
                limitAmount: '[ja] Limit amount',
                setExpiryOptions: '[ja] Set expiry options',
                setExpiryDate: '[ja] Set expiry date',
                setExpiryDateDescription: '[ja] Card will expire as listed on the card',
                amount: '[ja] Amount',
            },
            deactivateCardModal: {
                deactivate: '[ja] Deactivate',
                deactivateCard: '[ja] Deactivate card',
                deactivateConfirmation: '[ja] Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: '[ja] settings',
            title: '[ja] Connections',
            subtitle: '[ja] Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: '[ja] QuickBooks Online',
            qbd: '[ja] QuickBooks Desktop',
            xero: '[ja] Xero',
            netsuite: '[ja] NetSuite',
            intacct: '[ja] Sage Intacct',
            sap: '[ja] SAP',
            oracle: '[ja] Oracle',
            microsoftDynamics: '[ja] Microsoft Dynamics',
            talkYourOnboardingSpecialist: '[ja] Chat with your setup specialist.',
            talkYourAccountManager: '[ja] Chat with your account manager.',
            talkToConcierge: '[ja] Chat with Concierge.',
            needAnotherAccounting: '[ja] Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '[ja] QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '[ja] Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '[ja] NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '[ja] Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `[ja] There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '[ja] Go to Expensify Classic to manage your settings.',
            setup: '[ja] Connect',
            lastSync: (relativeDate: string) => `[ja] Last synced ${relativeDate}`,
            notSync: '[ja] Not synced',
            import: '[ja] Import',
            export: '[ja] Export',
            advanced: '[ja] Advanced',
            other: '[ja] Other',
            syncNow: '[ja] Sync now',
            disconnect: '[ja] Disconnect',
            reinstall: '[ja] Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[ja] integration';
                return `[ja] Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `[ja] Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[ja] accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "[ja] Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "[ja] Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "[ja] Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "[ja] Can't connect to QuickBooks Desktop";
                    default: {
                        return "[ja] Can't connect to integration";
                    }
                }
            },
            accounts: '[ja] Chart of accounts',
            taxes: '[ja] Taxes',
            imported: '[ja] Imported',
            notImported: '[ja] Not imported',
            importAsCategory: '[ja] Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '[ja] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '[ja] Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '[ja] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '[ja] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '[ja] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '[ja] Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: '[ja] NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[ja] this integration';
                return `[ja] Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `[ja] Are you sure you want to connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[ja] this accounting integration'}? This will remove any existing accounting connections.`,
            enterCredentials: '[ja] Enter your credentials',
            claimOffer: {
                badgeText: '[ja] Offer available!',
                xero: {
                    headline: '[ja] Get Xero free for 6 months!',
                    description: '[ja] <muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: '[ja] Connect to Xero',
                },
                uber: {
                    headerTitle: '[ja] Uber for Business',
                    headline: '[ja] Get 5% off Uber rides',
                    description: `[ja] <muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: '[ja] Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '[ja] Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '[ja] Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '[ja] Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '[ja] Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return '[ja] Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return '[ja] Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '[ja] Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '[ja] Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return '[ja] Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return '[ja] Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return '[ja] Importing Xero data';
                        case 'startingImportQBO':
                            return '[ja] Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '[ja] Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return '[ja] Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '[ja] Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return '[ja] Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '[ja] Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '[ja] Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return '[ja] Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '[ja] Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '[ja] Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '[ja] Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '[ja] Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '[ja] Updating report fields';
                        case 'jobDone':
                            return '[ja] Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return '[ja] Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return '[ja] Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return '[ja] Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return '[ja] Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '[ja] Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return '[ja] Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return '[ja] Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return '[ja] Syncing tax rates';
                        case 'xeroCheckConnection':
                            return '[ja] Checking Xero connection';
                        case 'xeroSyncTitle':
                            return '[ja] Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return '[ja] Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '[ja] Importing customers';
                        case 'netSuiteSyncInitData':
                            return '[ja] Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return '[ja] Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return '[ja] Importing items';
                        case 'netSuiteSyncData':
                            return '[ja] Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return '[ja] Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return '[ja] Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return '[ja] Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return '[ja] Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return '[ja] Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '[ja] Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '[ja] Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '[ja] Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return '[ja] Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return '[ja] Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return '[ja] Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '[ja] Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '[ja] Importing vendors';
                        case 'intacctCheckConnection':
                            return '[ja] Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return '[ja] Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return '[ja] Importing Sage Intacct data';
                        default: {
                            return `[ja] Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '[ja] Preferred exporter',
            exportPreferredExporterNote:
                '[ja] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[ja] Once set, the preferred exporter will see reports for export in their account.',
            exportAs: '[ja] Export as',
            exportOutOfPocket: '[ja] Export out-of-pocket expenses as',
            exportCompanyCard: '[ja] Export company card expenses as',
            exportDate: '[ja] Export date',
            defaultVendor: '[ja] Default vendor',
            autoSync: '[ja] Auto-sync',
            autoSyncDescription: '[ja] Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: '[ja] Sync reimbursed reports',
            cardReconciliation: '[ja] Card reconciliation',
            reconciliationAccount: '[ja] Reconciliation account',
            continuousReconciliation: '[ja] Continuous Reconciliation',
            saveHoursOnReconciliation:
                '[ja] Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `[ja] <muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '[ja] Choose the bank account that your Expensify Card payments will be reconciled against.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `[ja] Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        export: {
            notReadyHeading: '[ja] Not ready to export',
            notReadyDescription: '[ja] Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: '[ja] Send invoice',
            sendFrom: '[ja] Send from',
            invoicingDetails: '[ja] Invoicing details',
            invoicingDetailsDescription: '[ja] This info will appear on your invoices.',
            companyName: '[ja] Company name',
            companyWebsite: '[ja] Company website',
            paymentMethods: {
                personal: '[ja] Personal',
                business: '[ja] Business',
                chooseInvoiceMethod: '[ja] Choose a payment method below:',
                payingAsIndividual: '[ja] Paying as an individual',
                payingAsBusiness: '[ja] Paying as a business',
            },
            invoiceBalance: '[ja] Invoice balance',
            invoiceBalanceSubtitle: "[ja] This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: '[ja] Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: '[ja] Invite member',
            members: '[ja] Invite members',
            invitePeople: '[ja] Invite new members',
            genericFailureMessage: '[ja] An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `[ja] Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '[ja] user',
            users: '[ja] users',
            invited: '[ja] invited',
            removed: '[ja] removed',
            to: '[ja] to',
            from: '[ja] from',
        },
        inviteMessage: {
            confirmDetails: '[ja] Confirm details',
            inviteMessagePrompt: '[ja] Make your invitation extra special by adding a message below!',
            personalMessagePrompt: '[ja] Message',
            genericFailureMessage: '[ja] An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: '[ja] Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `[ja] ${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '[ja] Oops! Not so fast...',
            workspaceNeeds: '[ja] A workspace needs at least one enabled distance rate.',
            distance: '[ja] Distance',
            centrallyManage: '[ja] Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: '[ja] Rate',
            addRate: '[ja] Add rate',
            findRate: '[ja] Find rate',
            trackTax: '[ja] Track tax',
            deleteRates: () => ({
                one: '[ja] Delete rate',
                other: '[ja] Delete rates',
            }),
            enableRates: () => ({
                one: '[ja] Enable rate',
                other: '[ja] Enable rates',
            }),
            disableRates: () => ({
                one: '[ja] Disable rate',
                other: '[ja] Disable rates',
            }),
            enableRate: '[ja] Enable rate',
            status: '[ja] Status',
            unit: '[ja] Unit',
            taxFeatureNotEnabledMessage:
                '[ja] <muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: '[ja] Delete distance rate',
            areYouSureDelete: () => ({
                one: '[ja] Are you sure you want to delete this rate?',
                other: '[ja] Are you sure you want to delete these rates?',
            }),
            errors: {
                rateNameRequired: '[ja] Rate name is required',
                existingRateName: '[ja] A distance rate with this name already exists',
            },
        },
        editor: {
            descriptionInputLabel: '[ja] Description',
            nameInputLabel: '[ja] Name',
            typeInputLabel: '[ja] Type',
            initialValueInputLabel: '[ja] Initial value',
            nameInputHelpText: "[ja] This is the name you'll see on your workspace.",
            nameIsRequiredError: "[ja] You'll need to give your workspace a name",
            currencyInputLabel: '[ja] Default currency',
            currencyInputHelpText: '[ja] All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `[ja] The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: '[ja] Save',
            genericFailureMessage: '[ja] An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: '[ja] An error occurred uploading the avatar. Please try again.',
            addressContext: '[ja] A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: '[ja] Expense policy',
        },
        bankAccount: {
            continueWithSetup: '[ja] Continue setup',
            youAreAlmostDone: "[ja] You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: '[ja] Streamline payments',
            connectBankAccountNote: "[ja] Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: '[ja] One more thing!',
            allSet: "[ja] You're all set!",
            accountDescriptionWithCards: '[ja] This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "[ja] Let's finish in chat!",
            finishInChat: '[ja] Finish in chat',
            almostDone: '[ja] Almost done!',
            disconnectBankAccount: '[ja] Disconnect bank account',
            startOver: '[ja] Start over',
            updateDetails: '[ja] Update details',
            yesDisconnectMyBankAccount: '[ja] Yes, disconnect my bank account',
            yesStartOver: '[ja] Yes, start over',
            disconnectYourBankAccount: (bankName: string) =>
                `[ja] Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "[ja] Starting over will clear the progress you've made so far.",
            areYouSure: '[ja] Are you sure?',
            workspaceCurrency: '[ja] Workspace currency',
            updateCurrencyPrompt: '[ja] It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: '[ja] Update to USD',
            updateWorkspaceCurrency: '[ja] Update workspace currency',
            workspaceCurrencyNotSupported: '[ja] Workspace currency not supported',
            yourWorkspace: `[ja] Your workspace is set to an unsupported currency. View the <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: '[ja] Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: '[ja] Transfer owner',
            addPaymentCardTitle: '[ja] Enter your payment card to transfer ownership',
            addPaymentCardButtonText: '[ja] Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `[ja] <muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: '[ja] PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: '[ja] Bank level encryption',
            addPaymentCardRedundant: '[ja] Redundant infrastructure',
            addPaymentCardLearnMore: `[ja] <muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: '[ja] Outstanding balance',
            amountOwedButtonText: '[ja] OK',
            amountOwedText: '[ja] This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: '[ja] Outstanding balance',
            ownerOwesAmountButtonText: '[ja] Transfer balance',
            ownerOwesAmountText: (email: string, amount: string) => `[ja] The account owning this workspace (${email}) has an outstanding balance from a previous month.

Do you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: '[ja] Take over annual subscription',
            subscriptionButtonText: '[ja] Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `[ja] Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: '[ja] Duplicate subscription alert',
            duplicateSubscriptionButtonText: '[ja] Continue',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `[ja] It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.

Click "Continue" if you only want to take over billing for the workspace ${workspaceName}.

If you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '[ja] Cannot transfer ownership',
            hasFailedSettlementsButtonText: '[ja] Got it',
            hasFailedSettlementsText: (email: string) =>
                `[ja] You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '[ja] Failed to clear balance',
            failedToClearBalanceButtonText: '[ja] OK',
            failedToClearBalanceText: '[ja] We were unable to clear the balance. Please try again later.',
            successTitle: '[ja] Woohoo! All set.',
            successDescription: "[ja] You're now the owner of this workspace.",
            errorTitle: '[ja] Oops! Not so fast...',
            errorDescription: `[ja] <muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '[ja] Careful!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `[ja] The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Are you sure you want to export them again?`,
            confirmText: '[ja] Yes, export again',
            cancelText: '[ja] Cancel',
        },
        upgrade: {
            reportFields: {
                title: '[ja] Report fields',
                description: `[ja] Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: '[ja] NetSuite',
                description: `[ja] Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '[ja] Sage Intacct',
                description: `[ja] Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: '[ja] QuickBooks Desktop',
                description: `[ja] Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '[ja] Advanced Approvals',
                description: `[ja] If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            categories: {
                title: '[ja] Categories',
                description: '[ja] Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: '[ja] GL codes',
                description: `[ja] Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '[ja] GL & Payroll codes',
                description: `[ja] Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: '[ja] Tax codes',
                description: `[ja] Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: '[ja] Unlimited Company cards',
                description: `[ja] Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            rules: {
                title: '[ja] Rules',
                description: `[ja] Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.

Require expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: '[ja] Per diem',
                description:
                    '[ja] Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            travel: {
                title: '[ja] Travel',
                description: '[ja] Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            reports: {
                title: '[ja] Reports',
                description: '[ja] Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: '[ja] Multi-level tags',
                description:
                    '[ja] Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: '[ja] Distance rates',
                description: '[ja] Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: '[ja] Auditor',
                description: '[ja] Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '[ja] Multiple approval levels',
                description: '[ja] Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[ja] <muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '[ja] per active member per month.',
                perMember: '[ja] per member per month.',
            },
            note: (subscriptionLink: string) => `[ja] <muted-text>Upgrade to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: '[ja] Unlock this feature',
            completed: {
                headline: `[ja] You've upgraded your workspace!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `[ja] <centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `[ja] You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `[ja] You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `[ja] You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: '[ja] Got it, thanks',
                createdWorkspace: `[ja] You've created a workspace!`,
            },
            commonFeatures: {
                title: '[ja] Upgrade to the Control plan',
                note: '[ja] Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `[ja] <muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[ja] per member per month.` : `[ja] per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: '[ja] Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: '[ja] Smart expense rules',
                    benefit3: '[ja] Multi-level approval workflows',
                    benefit4: '[ja] Enhanced security controls',
                    toUpgrade: '[ja] To upgrade, click',
                    selectWorkspace: '[ja] select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `[ja] Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '[ja] Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '[ja] Downgrade to Collect',
                note: "[ja] You'll lose access to the following features",
                noteAndMore: '[ja] and more:',
                benefits: {
                    important: '[ja] IMPORTANT: ',
                    confirm: '[ja] You\'ll need to change the "Plan type" of every workspace to "Collect" in order to secure the Collect rate.',
                    benefit1Label: '[ja] ERP integrations',
                    benefit1: '[ja] NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: '[ja] HR integrations',
                    benefit2: '[ja] Workday, Certinia',
                    benefit3Label: '[ja] Security',
                    benefit3: '[ja] SSO/SAML',
                    benefit4Label: '[ja] Advanced',
                    benefit4: '[ja] Smart expense rules, per diems, multi-level approvals, custom reporting, and budgeting',
                    headsUp: '[ja] Heads up!',
                    multiWorkspaceNote: '[ja] You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '[ja] > select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: '[ja] Your workspace has been downgraded',
                description: '[ja] You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: '[ja] Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: '[ja] Pay & downgrade',
            headline: '[ja] Your final payment',
            description1: (formattedAmount: string) => `[ja] Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `[ja] See your breakdown below for ${date}:`,
            subscription:
                '[ja] Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: '[ja] An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: '[ja] Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `[ja] Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `[ja] Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "[ja] You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: '[ja] Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: '[ja] Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: '[ja] Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: '[ja] Chat with your admin',
            chatInAdmins: '[ja] Chat in #admins',
            addPaymentCard: '[ja] Add payment card',
            goToSubscription: '[ja] Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: '[ja] Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `[ja] <muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: '[ja] Receipt required amount',
                receiptRequiredAmountDescription: '[ja] Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `[ja] Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: '[ja] Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: '[ja] Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `[ja] Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: '[ja] Max expense amount',
                maxExpenseAmountDescription: '[ja] Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: '[ja] Max age',
                maxExpenseAge: '[ja] Max expense age',
                maxExpenseAgeDescription: '[ja] Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '[ja] 1 day',
                    other: (count: number) => `[ja] ${count} days`,
                }),
                cashExpenseDefault: '[ja] Cash expense default',
                cashExpenseDefaultDescription:
                    '[ja] Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: '[ja] Reimbursable',
                reimbursableDefaultDescription: '[ja] Expenses are most often paid back to employees',
                nonReimbursableDefault: '[ja] Non-reimbursable',
                nonReimbursableDefaultDescription: '[ja] Expenses are occasionally paid back to employees',
                alwaysReimbursable: '[ja] Always reimbursable',
                alwaysReimbursableDescription: '[ja] Expenses are always paid back to employees',
                alwaysNonReimbursable: '[ja] Always non-reimbursable',
                alwaysNonReimbursableDescription: '[ja] Expenses are never paid back to employees',
                billableDefault: '[ja] Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `[ja] <muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: '[ja] Billable',
                billableDescription: '[ja] Expenses are most often re-billed to clients',
                nonBillable: '[ja] Non-billable',
                nonBillableDescription: '[ja] Expenses are occasionally re-billed to clients',
                eReceipts: '[ja] eReceipts',
                eReceiptsHint: `[ja] eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: '[ja] Attendee tracking',
                attendeeTrackingHint: '[ja] Track the per-person cost for every expense.',
                prohibitedDefaultDescription: '[ja] Flag receipts with these line items for manual review.',
                prohibitedExpenses: '[ja] Prohibited expenses',
                alcohol: '[ja] Alcohol',
                hotelIncidentals: '[ja] Hotel incidentals',
                gambling: '[ja] Gambling',
                tobacco: '[ja] Tobacco',
                adultEntertainment: '[ja] Adult entertainment',
                requireCompanyCard: '[ja] Require company cards for all purchases',
                requireCompanyCardDescription: '[ja] Flag all cash spend, including mileage and per-diem expenses.',
                requireCompanyCardDisabledTooltip: '[ja] Enable Company cards (under More features) to unlock.',
            },
            expenseReportRules: {
                title: '[ja] Advanced',
                subtitle: '[ja] Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: '[ja] Prevent self-approvals',
                preventSelfApprovalsSubtitle: '[ja] Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: '[ja] Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: '[ja] Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: '[ja] Auto-approve reports with all expenses under',
                autoApproveReportsUnderDescription: '[ja] Fully compliant expense reports where all expenses are under this amount will be automatically approved.',
                randomReportAuditTitle: '[ja] Random report audit',
                randomReportAuditDescription: '[ja] Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: '[ja] Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: '[ja] Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `[ja] Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: '[ja] Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: '[ja] Auto-pay reports under',
                autoPayReportsUnderDescription: '[ja] Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `[ja] Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[ja] Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: '[ja] Merchant',
                subtitle: '[ja] Set merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: '[ja] Add merchant rule',
                findRule: '[ja] Find merchant rule',
                addRuleTitle: '[ja] Add rule',
                editRuleTitle: '[ja] Edit rule',
                expensesWith: '[ja] For expenses with:',
                expensesExactlyMatching: '[ja] For expenses exactly matching:',
                applyUpdates: '[ja] Apply these updates:',
                saveRule: '[ja] Save rule',
                previewMatches: '[ja] Preview matches',
                confirmError: '[ja] Enter merchant and apply at least one update',
                confirmErrorMerchant: '[ja] Please enter merchant',
                confirmErrorUpdate: '[ja] Please apply at least one update',
                previewMatchesEmptyStateTitle: '[ja] Nothing to show',
                previewMatchesEmptyStateSubtitle: '[ja] No unsubmitted expenses match this rule.',
                deleteRule: '[ja] Delete rule',
                deleteRuleConfirmation: '[ja] Are you sure you want to delete this rule?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `[ja] If merchant ${isExactMatch ? '[ja] exactly matches' : '[ja] contains'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `[ja] Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `[ja] Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `[ja] Mark as  "${reimbursable ? '[ja] reimbursable' : '[ja] non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `[ja] Mark as "${billable ? '[ja] billable' : '[ja] non-billable'}"`,
                matchType: '[ja] Match type',
                matchTypeContains: '[ja] Contains',
                matchTypeExact: '[ja] Exactly matches',
                duplicateRuleTitle: '[ja] Similar merchant rule already exists',
                duplicateRulePrompt: (merchantName: string) => `[ja] Your existing rule for "${merchantName}" will take priority over this one. Save anyway?`,
                saveAnyway: '[ja] Save anyway',
                applyToExistingUnsubmittedExpenses: '[ja] Apply to existing unsubmitted expenses',
            },
            categoryRules: {
                title: '[ja] Category rules',
                approver: '[ja] Approver',
                requireDescription: '[ja] Require description',
                requireFields: '[ja] Require fields',
                requiredFieldsTitle: '[ja] Required fields',
                requiredFieldsDescription: (categoryName: string) => `[ja] This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: '[ja] Require attendees',
                descriptionHint: '[ja] Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `[ja] Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: '[ja] Hint',
                descriptionHintSubtitle: '[ja] Pro-tip: The shorter the better!',
                maxAmount: '[ja] Max amount',
                flagAmountsOver: '[ja] Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `[ja] Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: '[ja] This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: '[ja] Individual expense',
                    expenseSubtitle: '[ja] Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: '[ja] Category total',
                    dailySubtitle: '[ja] Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: '[ja] Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `[ja] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[ja] Never require receipts',
                    always: '[ja] Always require receipts',
                },
                requireItemizedReceiptsOver: '[ja] Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `[ja] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[ja] Never require itemized receipts',
                    always: '[ja] Always require itemized receipts',
                },
                defaultTaxRate: '[ja] Default tax rate',
                enableWorkflows: (moreFeaturesLink: string) => `[ja] Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: '[ja] Expense policy',
                cardSubtitle: "[ja] Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
            },
            spendRules: {
                title: '[ja] Spend',
                subtitle: '[ja] Approve or decline Expensify Card transactions in realtime.',
                defaultRuleDescription: '[ja] All cards',
                block: '[ja] Block',
                defaultRuleTitle: '[ja] Categories: Adult services, ATMs, gambling, money transfers',
                builtInProtectionModal: {
                    title: '[ja] Expensify Cards offer built-in protection - always',
                    description: `[ja] Expensify always declines these charges:

  • Adult services
  • ATMs
  • Gambling
  • Money transfers

Add more spend rules to protect company cash flow.`,
                },
                addSpendRule: '[ja] Add spend rule',
                editRuleTitle: '[ja] Edit rule',
                cardPageTitle: '[ja] Card',
                cardsSectionTitle: '[ja] Cards',
                chooseCards: '[ja] Choose cards',
                saveRule: '[ja] Save rule',
                deleteRule: '[ja] Delete rule',
                deleteRuleConfirmation: '[ja] Are you sure you want to delete this rule?',
                allow: '[ja] Allow',
                spendRuleSectionTitle: '[ja] Spend rule',
                restrictionType: '[ja] Restriction type',
                restrictionTypeHelpAllow: "[ja] Charges are approved if they match any merchant or category, and don't exceed a max amount.",
                restrictionTypeHelpBlock: '[ja] Charges are declined if they match any merchant or category, or exceed a max amount.',
                addMerchant: '[ja] Add merchant',
                merchantContains: '[ja] Merchant contains',
                merchantExactlyMatches: '[ja] Merchant exactly matches',
                noBlockedMerchants: '[ja] No blocked merchants',
                addMerchantToBlockSpend: '[ja] Add a merchant to block spend',
                noAllowedMerchants: '[ja] No allowed merchants',
                addMerchantToAllowSpend: '[ja] Add a merchant to allow spend',
                matchType: '[ja] Match type',
                matchTypeContains: '[ja] Contains',
                matchTypeExact: '[ja] Matches exactly',
                spendCategory: '[ja] Spend category',
                maxAmount: '[ja] Max amount',
                maxAmountHelp: '[ja] Any charge over this amount will be declined, regardless of merchant and spend category restrictions.',
                currencyMismatchTitle: '[ja] Currency mismatch',
                currencyMismatchPrompt: '[ja] To set a max amount, select cards that settle in the same currency.',
                reviewSelectedCards: '[ja] Review selected cards',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => `[ja] ${summary}, +${count} more`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '[ja] Apply at least one spend rule to one card',
                confirmErrorCardRequired: '[ja] Card is a required field',
                confirmErrorApplyAtLeastOneSpendRule: '[ja] Apply at least one spend rule',
                categories: '[ja] Categories',
                merchants: '[ja] Merchants',
                noAvailableCards: '[ja] All cards already have a rule',
                noAvailableCardsSubtitle: '[ja] Edit an existing card rule to make changes',
                noCardsIssuedTitle: '[ja] No Expensify cards issued',
                noCardsIssuedSubtitle: '[ja] Issue Expensify cards to create spend rules',
                max: '[ja] Max',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '[ja] Airlines',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '[ja] Alcohol and bars',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: '[ja] Amazon and bookstores',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '[ja] Automotive',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: '[ja] Car rentals',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '[ja] Dining',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '[ja] Fuel and gas',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '[ja] Government and non-profits',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '[ja] Groceries',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: '[ja] Gyms and fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '[ja] Healthcare',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: '[ja] Hotels',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: '[ja] Internet and phone',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '[ja] Office supplies',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '[ja] Parking and tolls',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: '[ja] Professional services',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '[ja] Retail',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '[ja] Shipping and delivery',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: '[ja] Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '[ja] Transit and rideshare',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '[ja] Travel agencies',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '[ja] Collect',
                    description: '[ja] For teams looking to automate their processes.',
                },
                corporate: {
                    label: '[ja] Control',
                    description: '[ja] For organizations with advanced requirements.',
                },
            },
            description: "[ja] Choose a plan that's right for you. For a detailed list of features and pricing, check out our",
            subscriptionLink: '[ja] plan types and pricing help page',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `[ja] You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `[ja] You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: '[ja] Subscriptions',
        },
    },
    getAssistancePage: {
        title: '[ja] Get assistance',
        subtitle: "[ja] We're here to clear your path to greatness!",
        description: '[ja] Choose from the support options below:',
        chatWithConcierge: '[ja] Chat with Concierge',
        scheduleSetupCall: '[ja] Schedule a setup call',
        scheduleACall: '[ja] Schedule call',
        questionMarkButtonTooltip: '[ja] Get assistance from our team',
        exploreHelpDocs: '[ja] Explore help docs',
        registerForWebinar: '[ja] Register for webinar',
        onboardingHelp: '[ja] Onboarding help',
    },
    emojiPicker: {
        emojiNotSelected: '[ja] Emoji not selected',
        skinTonePickerLabel: '[ja] Change default skin tone',
        headers: {
            frequentlyUsed: '[ja] Frequently Used',
            smileysAndEmotion: '[ja] Smileys & Emotion',
            peopleAndBody: '[ja] People & Body',
            animalsAndNature: '[ja] Animals & Nature',
            foodAndDrink: '[ja] Food & Drinks',
            travelAndPlaces: '[ja] Travel & Places',
            activities: '[ja] Activities',
            objects: '[ja] Objects',
            symbols: '[ja] Symbols',
            flags: '[ja] Flags',
        },
    },
    newRoomPage: {
        newRoom: '[ja] New room',
        groupName: '[ja] Group name',
        roomName: '[ja] Room name',
        visibility: '[ja] Visibility',
        restrictedDescription: '[ja] People in your workspace can find this room',
        privateDescription: '[ja] People invited to this room can find it',
        publicDescription: '[ja] Anyone can find this room',
        public_announceDescription: '[ja] Anyone can find this room',
        createRoom: '[ja] Create room',
        roomAlreadyExistsError: '[ja] A room with this name already exists',
        roomNameReservedError: (reservedName: string) => `[ja] ${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '[ja] Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: '[ja] Please enter a room name',
        pleaseSelectWorkspace: '[ja] Please select a workspace',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `[ja] ${actor}renamed to "${newName}" (previously "${oldName}")` : `[ja] ${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: (newName: string) => `[ja] Room renamed to ${newName}`,
        social: '[ja] social',
        selectAWorkspace: '[ja] Select a workspace',
        growlMessageOnRenameError: '[ja] Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: '[ja] Workspace',
            private: '[ja] Private',
            public: '[ja] Public',
            public_announce: '[ja] Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '[ja] Submit and Close',
        submitAndApprove: '[ja] Submit and Approve',
        advanced: '[ja] ADVANCED',
        dynamicExternal: '[ja] DYNAMIC_EXTERNAL',
        smartReport: '[ja] SMARTREPORT',
        billcom: '[ja] BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[ja] set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[ja] removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `[ja] changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `[ja] changed the company address to "${newAddress}" (previously "${previousAddress}")` : `[ja] set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[ja] added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[ja] removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `[ja] changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `[ja] added the category "${categoryName}"`,
        deleteCategory: (categoryName: string) => `[ja] removed the category "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `[ja] ${oldValue ? '[ja] disabled' : '[ja] enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[ja] added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[ja] removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[ja] changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[ja] added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[ja] removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[ja] changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `[ja] changed the "${categoryName}" category description to ${!oldValue ? '[ja] required' : '[ja] not required'} (previously ${!oldValue ? '[ja] not required' : '[ja] required'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `[ja] added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `[ja] removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `[ja] changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[ja] added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `[ja] changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[ja] updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `[ja] changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `[ja] updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `[ja] changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `[ja] renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `[ja] removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }
            return !oldValue
                ? `[ja] added the description hint "${newValue}" to the category "${categoryName}"`
                : `[ja] changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategories: (count: number) => `[ja] updated ${count} categories`,
        updateTagListName: (oldName: string, newName: string) => `[ja] changed the tag list name to "${newName}" (previously "${oldName}")`,
        updateTagList: (tagListName: string) => `[ja] updated tags on the list "${tagListName}"`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `[ja] changed tag list "${tagListsName}" to ${isRequired ? '[ja] required' : '[ja] not required'}`,
        importTags: '[ja] imported tags from a spreadsheet',
        deletedAllTags: '[ja] deleted all tags',
        addTag: (tagListName: string, tagName?: string) => `[ja] added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `[ja] updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `[ja] removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `[ja] removed "${count}" tags from the list "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `[ja] updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `[ja] updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `[ja] changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `[ja] ${newValue ? '[ja] enabled' : '[ja] disabled'} tax tracking on distance rates`,
        updateCustomUnitDefaultCategory: ({customUnitName, newValue, oldValue}: UpdatePolicyCustomUnitDefaultCategoryParams) =>
            `[ja] changed the ${customUnitName} default category to "${newValue}" ${oldValue ? `[ja] (previously "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `[ja] imported rates for custom unit "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `[ja] added a new ${customUnitName} rate "${rateName}"`,
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `[ja] removed the "${customUnitName}" rate "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `[ja] changed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${customUnitSubRateName}" ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `[ja] removed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${removedSubRateName}"`,
        addedReportField: ({fieldType, fieldName, defaultValue}: AddedOrDeletedPolicyReportFieldParams) =>
            `[ja] added ${fieldType} report field "${fieldName}"${defaultValue ? `[ja]  with default value "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `[ja] changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `[ja] changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `[ja] added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `[ja] changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `[ja] added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `[ja] ${newValue ? '[ja] enabled' : '[ja] disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `[ja] set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `[ja] added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `[ja] removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `[ja] ${optionEnabled ? '[ja] enabled' : '[ja] disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `[ja] ${allEnabled ? '[ja] enabled' : '[ja] disabled'} all options for the report field "${fieldName}" `;
            }
            return `[ja] ${allEnabled ? '[ja] enabled' : '[ja] disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? '[ja] enabled' : '[ja] disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `[ja] removed ${fieldType} Report Field "${fieldName}"`,
        addedCardFeed: (feedName: string) => `[ja] added card feed "${feedName}"`,
        removedCardFeed: (feedName: string) => `[ja] removed card feed "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `[ja] renamed card feed to "${newName}" (previously "${oldName}")`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) => `[ja] assigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[ja] unassigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} cardholders to delete card transactions for card feed "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `[ja] changed card feed "${feedName}" statement period end day${newValue ? `[ja]  to "${newValue}"` : ''}${previousValue ? `[ja]  (previously "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `[ja] updated "Prevent self-approval" to "${newValue === 'true' ? '[ja] Enabled' : '[ja] Disabled'}" (previously "${oldValue === 'true' ? '[ja] Enabled' : '[ja] Disabled'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `[ja] set the monthly report submission date to "${newValue}"`;
            }
            return `[ja] updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `[ja] updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `[ja] updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `[ja] turned "Enforce default report titles" ${value ? '[ja] on' : '[ja] off'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `[ja] changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `[ja] updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `[ja] set the description of this workspace to "${newDescription}"`
                : `[ja] updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('[ja]  and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `[ja] removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `[ja] removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `[ja] updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `[ja] updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `[ja] updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `[ja] updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: '[ja] upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `[ja] This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: '[ja] downgraded this workspace to the Collect plan',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `[ja] changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `[ja] changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        addBudget: ({frequency, entityName, entityType, shared, individual, notificationThreshold}: AddBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[ja]  with notification threshold of "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `[ja] added ${frequency} individual budget of "${individual}" and ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            if (typeof individual !== 'undefined') {
                return `[ja] added ${frequency} individual budget of "${individual}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            return `[ja] added ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
        },
        updateBudget: ({
            entityType,
            entityName,
            oldFrequency,
            newFrequency,
            oldIndividual,
            newIndividual,
            oldShared,
            newShared,
            oldNotificationThreshold,
            newNotificationThreshold,
        }: UpdatedBudgetParams) => {
            const frequencyChanged = !!(newFrequency && oldFrequency !== newFrequency);
            const sharedChanged = !!(newShared && oldShared !== newShared);
            const individualChanged = !!(newIndividual && oldIndividual !== newIndividual);
            const thresholdChanged = typeof newNotificationThreshold === 'number' && oldNotificationThreshold !== newNotificationThreshold;
            const changesList: string[] = [];
            if (frequencyChanged) {
                changesList.push(`[ja] changed budget frequency to "${newFrequency}" (previously "${oldFrequency}")`);
            }
            if (sharedChanged) {
                changesList.push(`[ja] changed total workspace budget to "${newShared}" (previously "${oldShared}")`);
            }
            if (individualChanged) {
                changesList.push(`[ja] changed individual budget to "${newIndividual}" (previously "${oldIndividual}")`);
            }
            if (thresholdChanged) {
                changesList.push(`[ja] changed notification threshold to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `[ja] updated budget for the ${entityType} "${entityName}"`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `[ja] changed budget frequency for the ${entityType} "${entityName}" to "${newFrequency}" (previously "${oldFrequency}")`;
                }
                if (sharedChanged) {
                    return `[ja] changed total workspace budget for the ${entityType} "${entityName}" to "${newShared}" (previously "${oldShared}")`;
                }
                if (individualChanged) {
                    return `[ja] changed individual budget for the ${entityType} "${entityName}" to "${newIndividual}" (previously "${oldIndividual}")`;
                }
                return `[ja] changed notification threshold for the ${entityType} "${entityName}" to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`;
            }
            return `[ja] updated budget for the ${entityType} "${entityName}": ${changesList.join('; ')}`;
        },
        deleteBudget: ({entityType, entityName, frequency, individual, shared, notificationThreshold}: DeleteBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[ja]  with notification threshold of "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `[ja] removed ${frequency} shared budget of "${shared}" and individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (shared) {
                return `[ja] removed ${frequency} shared budget of "${shared}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `[ja] removed ${frequency} individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            return `[ja] removed budget from the ${entityType} "${entityName}"`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} time tracking`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `[ja] changed hourly rate to "${newRate}" (previously "${oldRate}")`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[ja] added "${prohibitedExpense}" to prohibited expenses`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[ja] removed "${prohibitedExpense}" from prohibited expenses`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `[ja] changed reimbursement method to "${newReimbursementChoice}" (previously "${oldReimbursementChoice}")`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} pre-approval of workspace join requests`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `[ja] changed custom report name formula to "${newDefaultTitle}" (previously "${oldDefaultTitle}")`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `[ja] took over ownership of ${policyName} from ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} scheduled submit`,
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
            `[ja] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". ${userEmail} is currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}.${summaryLink ? `[ja]  <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
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
            `[ja] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". You're currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}. ${summaryLink ? `[ja] <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} categories`;
                case 'tags':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} tags`;
                case 'workflows':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} workflows`;
                case 'distance rates':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} distance rates`;
                case 'accounting':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} accounting`;
                case 'Expensify Cards':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} Expensify Cards`;
                case 'travel invoicing':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} travel invoicing`;
                case 'company cards':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} company cards`;
                case 'invoicing':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} invoicing`;
                case 'per diem':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} per diem`;
                case 'receipt partners':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} receipt partners`;
                case 'rules':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} rules`;
                case 'tax tracking':
                    return `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} tax tracking`;
                default:
                    return `${enabled ? '[ja] enabled' : '[ja] disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} attendee tracking`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} auto-pay approved reports`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `[ja] set the auto-pay approved reports threshold to "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `[ja] changed the auto-pay approved reports threshold to "${newLimit}" (previously "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: '[ja] removed the auto-pay approved reports threshold',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `[ja] changed the default approver to ${newApprover} (previously ${previousApprover})` : `[ja] changed the default approver to ${newApprover}`,
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
            let text = `[ja] changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `[ja]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[ja]  (previously default approver)';
            } else if (previousApprover) {
                text += `[ja]  (previously ${previousApprover})`;
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
                ? `[ja] changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `[ja] changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += `[ja]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[ja]  (previously default approver)';
            } else if (previousApprover) {
                text += `[ja]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[ja] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `[ja] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[ja] changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `[ja] changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[ja] changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `[ja] set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[ja] changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `[ja] set the invoice company website to "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser ? `[ja] changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")` : `[ja] changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: (enabled: boolean) => `[ja] ${enabled ? '[ja] enabled' : '[ja] disabled'} reimbursements`,
        updateCustomTaxName: ({oldName, newName}: UpdatedPolicyCustomTaxNameParams) => `[ja] changed the custom tax name to "${newName}" (previously "${oldName}")`,
        updateCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyCurrencyDefaultTaxParams) =>
            `[ja] changed the workspace currency default tax rate to "${newName}" (previously "${oldName}")`,
        updateForeignCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyForeignCurrencyDefaultTaxParams) =>
            `[ja] changed the foreign currency default tax rate to "${newName}" (previously "${oldName}")`,
        addTax: (taxName: string) => `[ja] added the tax "${taxName}"`,
        deleteTax: (taxName: string) => `[ja] removed the tax "${taxName}"`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `[ja] renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `[ja] changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `[ja] changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `[ja] ${oldValue ? '[ja] disabled' : '[ja] enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `[ja] set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[ja] changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: (oldValue: string) => `[ja] removed receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `[ja] set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `[ja] changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: (oldValue: string) => `[ja] removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: (newValue: string) => `[ja] set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `[ja] changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `[ja] removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: '[ja] Member not found.',
        useInviteButton: '[ja] To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `[ja] You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `[ja] It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `[ja] Are you sure you want to remove ${memberName} from the room?`,
            other: '[ja] Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: '[ja] There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: '[ja] Assign task',
        assignMe: '[ja] Assign to me',
        confirmTask: '[ja] Confirm task',
        confirmError: '[ja] Please enter a title and select a share destination',
        descriptionOptional: '[ja] Description (optional)',
        pleaseEnterTaskName: '[ja] Please enter a title',
        pleaseEnterTaskDestination: '[ja] Please select where you want to share this task',
    },
    task: {
        task: '[ja] Task',
        title: '[ja] Title',
        description: '[ja] Description',
        assignee: '[ja] Assignee',
        completed: '[ja] Completed',
        action: '[ja] Complete',
        messages: {
            created: (title: string) => `[ja] task for ${title}`,
            completed: '[ja] marked as complete',
            canceled: '[ja] deleted task',
            reopened: '[ja] marked as incomplete',
            error: "[ja] You don't have permission to take the requested action",
        },
        markAsComplete: '[ja] Mark as complete',
        markAsIncomplete: '[ja] Mark as incomplete',
        assigneeError: '[ja] An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: '[ja] There was an error creating this task. Please try again later.',
        deleteTask: '[ja] Delete task',
        deleteConfirmation: '[ja] Are you sure you want to delete this task?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `[ja] ${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '[ja] Keyboard shortcuts',
        subtitle: '[ja] Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: '[ja] Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: '[ja] Mark all messages as read',
            escape: '[ja] Escape dialogs',
            search: '[ja] Open search dialog',
            newChat: '[ja] New chat screen',
            copy: '[ja] Copy comment',
            openDebug: '[ja] Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: '[ja] Screen share',
        screenShareRequest: '[ja] Expensify is inviting you to a screen share',
    },
    search: {
        resultsAreLimited: '[ja] Search results are limited.',
        viewResults: '[ja] View results',
        appliedFilters: '[ja] Applied filters',
        resetFilters: '[ja] Reset filters',
        searchResults: {
            emptyResults: {
                title: '[ja] Nothing to show',
                subtitle: `[ja] Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "[ja] You haven't created any expenses yet",
                subtitle: '[ja] Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[ja] Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "[ja] You haven't created any reports yet",
                subtitle: '[ja] Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[ja] Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    [ja] You haven't created any
                    invoices yet
                `),
                subtitle: '[ja] Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[ja] Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: '[ja] No trips to display',
                subtitle: '[ja] Get started by booking your first trip below.',
                buttonText: '[ja] Book a trip',
            },
            emptySubmitResults: {
                title: '[ja] No expenses to submit',
                subtitle: "[ja] You're all clear. Take a victory lap!",
                buttonText: '[ja] Create report',
            },
            emptyApproveResults: {
                title: '[ja] No expenses to approve',
                subtitle: '[ja] Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: '[ja] No expenses to pay',
                subtitle: '[ja] Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: '[ja] No expenses to export',
                subtitle: '[ja] Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: '[ja] No expenses to display',
                subtitle: '[ja] No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: '[ja] No expenses to approve',
                subtitle: '[ja] Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: '[ja] Columns',
        editColumns: '[ja] Edit columns',
        resetColumns: '[ja] Reset columns',
        groupColumns: '[ja] Group columns',
        expenseColumns: '[ja] Expense Columns',
        statements: '[ja] Statements',
        cardStatements: '[ja] Card statements',
        monthlyAccrual: '[ja] Monthly accrual',
        unapprovedCash: '[ja] Unapproved cash',
        unapprovedCard: '[ja] Unapproved card',
        reconciliation: '[ja] Reconciliation',
        topSpenders: '[ja] Top spenders',
        saveSearch: '[ja] Save search',
        deleteSavedSearch: '[ja] Delete saved search',
        deleteSavedSearchConfirm: '[ja] Are you sure you want to delete this search?',
        searchName: '[ja] Search name',
        savedSearchesMenuItemTitle: '[ja] Saved',
        topCategories: '[ja] Top categories',
        topMerchants: '[ja] Top merchants',
        spendOverTime: '[ja] Spend over time',
        groupedExpenses: '[ja] grouped expenses',
        bulkActions: {
            editMultiple: '[ja] Edit multiple',
            editMultipleTitle: '[ja] Edit multiple expenses',
            editMultipleDescription: "[ja] Changes will be set for all selected expenses and will override any previously set values. Just sayin'.",
            approve: '[ja] Approve',
            pay: '[ja] Pay',
            delete: '[ja] Delete',
            hold: '[ja] Hold',
            unhold: '[ja] Remove hold',
            reject: '[ja] Reject',
            duplicateExpense: ({count}: {count: number}) => `[ja] Duplicate ${count === 1 ? '[ja] expense' : '[ja] expenses'}`,
            undelete: '[ja] Undelete',
            noOptionsAvailable: '[ja] No options available for the selected group of expenses.',
        },
        filtersHeader: '[ja] Filters',
        filters: {
            date: {
                before: (date?: string) => `[ja] Before ${date ?? ''}`,
                after: (date?: string) => `[ja] After ${date ?? ''}`,
                on: (date?: string) => `[ja] On ${date ?? ''}`,
                customDate: '[ja] Custom date',
                customRange: '[ja] Custom range',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '[ja] Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '[ja] Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '[ja] This month',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '[ja] Year to date',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '[ja] Last 12 months',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '[ja] Last statement',
                },
            },
            status: '[ja] Status',
            keyword: '[ja] Keyword',
            keywords: '[ja] Keywords',
            limit: '[ja] Limit',
            limitDescription: '[ja] Set a limit for the results of your search.',
            currency: '[ja] Currency',
            completed: '[ja] Completed',
            amount: {
                lessThan: (amount?: string) => `[ja] Less than ${amount ?? ''}`,
                greaterThan: (amount?: string) => `[ja] Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `[ja] Between ${greaterThan} and ${lessThan}`,
                equalTo: (amount?: string) => `[ja] Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: '[ja] Expensify',
                individualCards: '[ja] Individual cards',
                closedCards: '[ja] Closed cards',
                cardFeeds: '[ja] Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `[ja] All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `[ja] All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `[ja] ${name} is ${value}`,
            current: '[ja] Current',
            past: '[ja] Past',
            submitted: '[ja] Submitted',
            approved: '[ja] Approved',
            paid: '[ja] Paid',
            exported: '[ja] Exported',
            posted: '[ja] Posted',
            withdrawn: '[ja] Withdrawn',
            billable: '[ja] Billable',
            reimbursable: '[ja] Reimbursable',
            purchaseCurrency: '[ja] Purchase currency',
            sortOrder: {
                [CONST.SEARCH.SORT_ORDER.ASC]: '[ja] Ascending',
                [CONST.SEARCH.SORT_ORDER.DESC]: '[ja] Descending',
            },
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '[ja] From',
                [CONST.SEARCH.GROUP_BY.CARD]: '[ja] Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[ja] Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '[ja] Category',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '[ja] Merchant',
                [CONST.SEARCH.GROUP_BY.TAG]: '[ja] Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: '[ja] Month',
                [CONST.SEARCH.GROUP_BY.WEEK]: '[ja] Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: '[ja] Year',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '[ja] Quarter',
            },
            feed: '[ja] Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: '[ja] Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '[ja] Reimbursement',
            },
            is: '[ja] Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '[ja] Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '[ja] Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '[ja] Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '[ja] Export',
            },
        },
        display: {
            label: '[ja] Display',
            sortBy: '[ja] Sort by',
            sortOrder: '[ja] Sort order',
            groupBy: '[ja] Group by',
            limitResults: '[ja] Limit results',
        },
        has: '[ja] Has',
        view: {
            label: '[ja] View',
            table: '[ja] Table',
            bar: '[ja] Bar',
            line: '[ja] Line',
            pie: '[ja] Pie',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '[ja] From',
            [CONST.SEARCH.GROUP_BY.CARD]: '[ja] Cards',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[ja] Exports',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '[ja] Categories',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '[ja] Merchants',
            [CONST.SEARCH.GROUP_BY.TAG]: '[ja] Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: '[ja] Months',
            [CONST.SEARCH.GROUP_BY.WEEK]: '[ja] Weeks',
            [CONST.SEARCH.GROUP_BY.YEAR]: '[ja] Years',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '[ja] Quarters',
        },
        moneyRequestReport: {
            emptyStateTitle: '[ja] This report has no expenses.',
            accessPlaceHolder: '[ja] Open for details',
        },
        noCategory: '[ja] No category',
        noMerchant: '[ja] No merchant',
        noTag: '[ja] No tag',
        expenseType: '[ja] Expense type',
        withdrawalType: '[ja] Withdrawal type',
        recentSearches: '[ja] Recent searches',
        recentChats: '[ja] Recent chats',
        searchIn: '[ja] Search in',
        searchPlaceholder: '[ja] Search for something...',
        suggestions: '[ja] Suggestions',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `[ja] Suggestions available${query ? `[ja]  for ${query}` : ''}. ${count} result.`,
            other: (resultCount: number) => `[ja] Suggestions available${query ? `[ja]  for ${query}` : ''}. ${resultCount} results.`,
        }),
        exportSearchResults: {
            title: '[ja] Create export',
            description: "[ja] Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: '[ja] Exported to',
        exportAll: {
            selectAllMatchingItems: '[ja] Select all matching items',
            allMatchingItemsSelected: '[ja] All matching items selected',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: '[ja] Please select dates for both From and To',
        },
    },
    genericErrorPage: {
        title: '[ja] Uh-oh, something went wrong!',
        body: {
            helpTextMobile: '[ja] Please close and reopen the app, or switch to',
            helpTextWeb: '[ja] web.',
            helpTextConcierge: '[ja] If the problem persists, reach out to',
        },
        refresh: '[ja] Refresh',
    },
    fileDownload: {
        success: {
            title: '[ja] Downloaded!',
            message: '[ja] Attachment successfully downloaded!',
            qrMessage: '[ja] Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: '[ja] Attachment error',
            message: "[ja] Attachment can't be downloaded",
        },
        permissionError: {
            title: '[ja] Storage access',
            message: "[ja] Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: '[ja] Pending',
            cleared: '[ja] Cleared',
            failed: '[ja] Failed',
        },
        failedError: ({link}: {link: string}) => `[ja] We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `[ja] ${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '[ja] Report layout',
        groupByLabel: '[ja] Group by:',
        selectGroupByOption: '[ja] Select how to group report expenses',
        uncategorized: '[ja] Uncategorized',
        noTag: '[ja] No tag',
        selectGroup: ({groupName}: {groupName: string}) => `[ja] Select all expenses in ${groupName}`,
        groupBy: {
            category: '[ja] Category',
            tag: '[ja] Tag',
        },
    },
    report: {
        newReport: {
            createExpense: '[ja] Create expense',
            createReport: '[ja] Create report',
            chooseWorkspace: '[ja] Choose a workspace for this report.',
            emptyReportConfirmationTitle: '[ja] You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `[ja] Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationPromptLink: '[ja] Reports',
            emptyReportConfirmationDontShowAgain: "[ja] Don't show me this again",
            genericWorkspaceName: '[ja] this workspace',
        },
        genericCreateReportFailureMessage: '[ja] Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: '[ja] Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: '[ja] Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: '[ja] Unexpected error renaming the report. Please try again later.',
        noActivityYet: '[ja] No activity yet',
        connectionSettings: '[ja] Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `[ja] changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `[ja] set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `[ja] changed the workspace${fromPolicyName ? `[ja]  (previously ${fromPolicyName})` : ''}`;
                    }
                    return `[ja] changed the workspace to ${toPolicyName}${fromPolicyName ? `[ja]  (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `[ja] changed type from ${oldType} to ${newType}`,
                exportedToCSV: `[ja] exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `[ja] exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `[ja] exported to ${label} via`,
                    automaticActionTwo: '[ja] accounting settings',
                    manual: (label: string) => `[ja] marked this report as manually exported to ${label}.`,
                    automaticActionThree: '[ja] and successfully created a record for',
                    reimburseableLink: '[ja] out-of-pocket expenses',
                    nonReimbursableLink: '[ja] company card expenses',
                    pending: (label: string) => `[ja] started exporting this report to ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `[ja] failed to export this report to ${label} ("${errorMessage}${linkText ? `[ja]  <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `[ja] added a receipt`,
                managerDetachReceipt: `[ja] removed a receipt`,
                markedReimbursed: (amount: string, currency: string) => `[ja] paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `[ja] paid ${currency}${amount} via integration`,
                outdatedBankAccount: `[ja] couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounceDefault: `[ja] couldn't process the payment due to an incorrect routing/account number or closed account`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `[ja] couldn't process the payment: ${returnReason}`,
                reimbursementACHCancelled: `[ja] canceled the payment`,
                reimbursementAccountChanged: `[ja] couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `[ja] processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `[ja] randomly selected for review`,
                selectedForRandomAuditMarkdown: `[ja] [randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `[ja] invited member ${to}`,
                unshare: ({to}: UnshareParams) => `[ja] removed member ${to}`,
                stripePaid: (amount: string, currency: string) => `[ja] paid ${currency}${amount}`,
                takeControl: `[ja] took control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `[ja] Open the Expensify mobile app to review your ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}transaction`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `[ja] there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `[ja] The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `[ja] the Plaid connection to your business bank account is broken. Please <a href='${walletRoute}'>reconnect your bank account ${maskedAccountNumber}</a> so you can continue to use your Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `[ja] ${email} joined via the workspace invite link` : `[ja] added ${email} as ${role === 'member' ? '[ja] a' : '[ja] an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `[ja] updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[ja] removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[ja] added "${newValue}" to ${email}’s custom field 1`
                        : `[ja] changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[ja] removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[ja] added "${newValue}" to ${email}’s custom field 2`
                        : `[ja] changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `[ja] ${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `[ja] removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `[ja] removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `[ja] connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '[ja] left the chat',
                leftTheChatWithName: (nameOrEmail: string) => `[ja] ${nameOrEmail ? `${nameOrEmail}: ` : ''}left the chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `[ja] business bank account ${maskedBankAccountNumber} has been automatically locked due to an issue with either Reimbursement or Expensify Card settlement. Please fix the issue in your <a href="${linkURL}">workspace settings</a>.`,
            },
            error: {
                invalidCredentials: '[ja] Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `[ja] ${summary} for ${dayCount} ${dayCount === 1 ? '[ja] day' : '[ja] days'} until ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `[ja] ${summary} from ${timePeriod} on ${date}`,
        startTimer: '[ja] Start Timer',
        stopTimer: '[ja] Stop Timer',
        scheduleOOO: '[ja] Schedule OOO',
        scheduleOOOTitle: '[ja] Schedule Out of Office',
        date: '[ja] Date',
        time: '[ja] Time (use 24-hour format)',
        durationAmount: '[ja] Duration',
        durationUnit: '[ja] Unit',
        reason: '[ja] Reason',
        workingPercentage: '[ja] Working percentage',
        dateRequired: '[ja] Date is required.',
        invalidTimeFormat: '[ja] Please enter a valid 24-hour time (e.g., 14:30).',
        enterANumber: '[ja] Please enter a number.',
        hour: '[ja] hours',
        day: '[ja] days',
        week: '[ja] weeks',
        month: '[ja] months',
    },
    footer: {
        features: '[ja] Features',
        expenseManagement: '[ja] Expense Management',
        spendManagement: '[ja] Spend Management',
        expenseReports: '[ja] Expense Reports',
        companyCreditCard: '[ja] Company Credit Card',
        receiptScanningApp: '[ja] Receipt Scanning App',
        billPay: '[ja] Bill Pay',
        invoicing: '[ja] Invoicing',
        CPACard: '[ja] CPA Card',
        payroll: '[ja] Payroll',
        travel: '[ja] Travel',
        resources: '[ja] Resources',
        expensifyApproved: '[ja] ExpensifyApproved!',
        pressKit: '[ja] Press Kit',
        support: '[ja] Support',
        expensifyHelp: '[ja] ExpensifyHelp',
        terms: '[ja] Terms of Service',
        privacy: '[ja] Privacy',
        learnMore: '[ja] Learn More',
        aboutExpensify: '[ja] About Expensify',
        blog: '[ja] Blog',
        jobs: '[ja] Jobs',
        expensifyOrg: '[ja] Expensify.org',
        investorRelations: '[ja] Investor Relations',
        getStarted: '[ja] Get Started',
        createAccount: '[ja] Create A New Account',
        logIn: '[ja] Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '[ja] Navigate back to chats list',
        chatWelcomeMessage: '[ja] Chat welcome message',
        navigatesToChat: '[ja] Navigates to a chat',
        newMessageLineIndicator: '[ja] New message line indicator',
        chatMessage: '[ja] Chat message',
        lastChatMessagePreview: '[ja] Last chat message preview',
        workspaceName: '[ja] Workspace name',
        chatUserDisplayNames: '[ja] Chat member display names',
        scrollToNewestMessages: '[ja] Scroll to newest messages',
        preStyledText: '[ja] Pre-styled text',
        viewAttachment: '[ja] View attachment',
        contextMenuAvailable: '[ja] Context menu available. Press Shift+F10 to open.',
        contextMenuAvailableMacOS: '[ja] Context menu available. Press VO-Shift-M to open.',
        contextMenuAvailableNative: '[ja] Context menu available. Double-tap and hold to open.',
        selectAllFeatures: '[ja] Select all features',
        selectAllTransactions: '[ja] Select all transactions',
        selectAllItems: '[ja] Select all items',
    },
    parentReportAction: {
        deletedReport: '[ja] Deleted report',
        deletedMessage: '[ja] Deleted message',
        deletedExpense: '[ja] Deleted expense',
        reversedTransaction: '[ja] Reversed transaction',
        deletedTask: '[ja] Deleted task',
        hiddenMessage: '[ja] Hidden message',
    },
    threads: {
        thread: '[ja] Thread',
        replies: '[ja] Replies',
        reply: '[ja] Reply',
        from: '[ja] From',
        in: '[ja] in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `[ja] From ${reportName}${workspaceName ? `[ja]  in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: '[ja] QR code',
        copy: '[ja] Copy URL',
        copied: '[ja] Copied!',
    },
    moderation: {
        flagDescription: '[ja] All flagged messages will be sent to a moderator for review.',
        chooseAReason: '[ja] Choose a reason for flagging below:',
        spam: '[ja] Spam',
        spamDescription: '[ja] Unsolicited off-topic promotion',
        inconsiderate: '[ja] Inconsiderate',
        inconsiderateDescription: '[ja] Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: '[ja] Intimidation',
        intimidationDescription: '[ja] Aggressively pursuing an agenda over valid objections',
        bullying: '[ja] Bullying',
        bullyingDescription: '[ja] Targeting an individual to obtain obedience',
        harassment: '[ja] Harassment',
        harassmentDescription: '[ja] Racist, misogynistic, or other broadly discriminatory behavior',
        assault: '[ja] Assault',
        assaultDescription: '[ja] Specifically targeted emotional attack with the intention of harm',
        flaggedContent: '[ja] This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: '[ja] Hide message',
        revealMessage: '[ja] Reveal message',
        levelOneResult: '[ja] Sends anonymous warning and message is reported for review.',
        levelTwoResult: '[ja] Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: '[ja] Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '[ja] Invite to submit expenses',
        inviteToChat: '[ja] Invite to chat only',
        nothing: '[ja] Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '[ja] Accept',
        decline: '[ja] Decline',
    },
    actionableMentionTrackExpense: {
        submit: '[ja] Submit it to someone',
        categorize: '[ja] Categorize it',
        share: '[ja] Share it with my accountant',
        nothing: '[ja] Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: '[ja] Teachers Unite',
        joinExpensifyOrg:
            '[ja] Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: '[ja] I know a teacher',
        iAmATeacher: '[ja] I am a teacher',
        personalKarma: {
            title: '[ja] Enable Personal Karma',
            description: '[ja] Donate $1 to Expensify.org for every $500 you spend each month',
            stopDonationsPrompt: '[ja] Are you sure you want to stop donating to Expensify.org?',
        },
        getInTouch: '[ja] Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: '[ja] Intro to your school principal',
        schoolPrincipalVerifyExpense:
            '[ja] Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: '[ja] Principal first name',
        principalLastName: '[ja] Principal last name',
        principalWorkEmail: '[ja] Principal work email',
        updateYourEmail: '[ja] Update your email address',
        updateEmail: '[ja] Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `[ja] Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: '[ja] Enter a valid email or phone number',
            enterEmail: '[ja] Enter an email',
            enterValidEmail: '[ja] Enter a valid email',
            tryDifferentEmail: '[ja] Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: '[ja] Not activated',
        outOfPocket: '[ja] Reimbursable',
        companySpend: '[ja] Non-reimbursable',
        personalCard: '[ja] Personal card',
        companyCard: '[ja] Company card',
        expensifyCard: '[ja] Expensify Card',
        centralInvoicing: '[ja] Central invoicing',
    },
    distance: {
        addStop: '[ja] Add stop',
        address: '[ja] Address',
        waypointDescription: {
            start: '[ja] Start',
            stop: '[ja] Stop',
        },
        mapPending: {
            title: '[ja] Map pending',
            subtitle: '[ja] The map will be generated when you go back online',
            onlineSubtitle: '[ja] One moment while we set up the map',
            errorTitle: '[ja] Map error',
            errorSubtitle: '[ja] There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: '[ja] Please select a suggested address or use current location',
        },
        odometer: {
            startReading: '[ja] Start reading',
            endReading: '[ja] End reading',
            saveForLater: '[ja] Save for later',
            totalDistance: '[ja] Total distance',
            startTitle: '[ja] Odometer start photo',
            endTitle: '[ja] Odometer end photo',
            deleteOdometerPhoto: '[ja] Delete odometer photo',
            deleteOdometerPhotoConfirmation: '[ja] Are you sure you want to delete this odometer photo?',
            startMessageWeb: '[ja] Add a photo of your odometer from the <strong>start</strong> of your trip. Drag a file here or choose one to upload.',
            endMessageWeb: '[ja] Add a photo of your odometer from the <strong>end</strong> of your trip. Drag a file here or choose one to upload.',
            cameraAccessRequired: '[ja] Camera access is required to take pictures.',
            snapPhotoStart: '[ja] <muted-text-label>Snap a photo of your odometer at the <strong>start</strong> of your trip.</muted-text-label>',
            snapPhotoEnd: '[ja] <muted-text-label>Snap a photo of your odometer at the <strong>end</strong> of your trip.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '[ja] Failed to start location tracking.',
            failedToGetPermissions: '[ja] Failed to get required location permissions.',
        },
        trackingDistance: '[ja] Tracking distance...',
        stopped: '[ja] Stopped',
        start: '[ja] Start',
        stop: '[ja] Stop',
        discard: '[ja] Discard',
        stopGpsTrackingModal: {
            title: '[ja] Stop GPS tracking',
            prompt: '[ja] Are you sure? This will end your current journey.',
            cancel: '[ja] Resume tracking',
            confirm: '[ja] Stop GPS tracking',
        },
        discardDistanceTrackingModal: {
            title: '[ja] Discard distance tracking',
            prompt: "[ja] Are you sure? This will discard your current journey and can't be undone.",
            confirm: '[ja] Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "[ja] Can't create expense",
            prompt: "[ja] You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: '[ja] Location access required',
            prompt: '[ja] Please allow location access in your device settings to start GPS distance tracking.',
            allow: '[ja] Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: '[ja] Background location access required',
            prompt: '[ja] Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: '[ja] Precise location required',
            prompt: '[ja] Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: '[ja] Track distance on your phone',
            subtitle: '[ja] Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: '[ja] Download the app',
        },
        notification: {
            title: '[ja] GPS tracking in progress',
            body: '[ja] Go to the app to finish',
        },
        continueGpsTripModal: {
            title: '[ja] Continue GPS trip recording?',
            prompt: '[ja] Looks like the app closed during your last GPS trip. Would you like to continue recording from that trip?',
            confirm: '[ja] Continue trip',
            cancel: '[ja] View trip',
        },
        signOutWarningTripInProgress: {
            title: '[ja] GPS tracking in progress',
            prompt: '[ja] Are you sure you want to discard the trip and sign out?',
            confirm: '[ja] Discard and sign out',
        },
        switchToODWarningTripInProgress: {
            title: '[ja] GPS tracking in progress',
            prompt: '[ja] Are you sure you want to stop GPS tracking and switch to Expensify Classic?',
            confirm: '[ja] Stop and switch',
        },
        switchAccountWarningTripInProgress: {
            title: '[ja] GPS tracking in progress',
            prompt: '[ja] Are you sure you want to stop GPS tracking and switch accounts?',
            confirm: '[ja] Stop and switch',
        },
        locationServicesRequiredModal: {
            title: '[ja] Location access required',
            confirm: '[ja] Open settings',
            prompt: '[ja] Please allow location access in your device settings to start GPS distance tracking.',
        },
        gpsFloatingPillText: '[ja] GPS tracking in progress...',
        liveActivity: {
            subtitle: '[ja] Tracking distance',
            button: '[ja] View progress',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '[ja] Report card lost or damaged',
        nextButtonLabel: '[ja] Next',
        reasonTitle: '[ja] Why do you need a new card?',
        cardDamaged: '[ja] My card was damaged',
        cardLostOrStolen: '[ja] My card was lost or stolen',
        confirmAddressTitle: '[ja] Please confirm the mailing address for your new card.',
        cardDamagedInfo: '[ja] Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: '[ja] Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: '[ja] Address',
        deactivateCardButton: '[ja] Deactivate card',
        shipNewCardButton: '[ja] Ship new card',
        addressError: '[ja] Address is required',
        reasonError: '[ja] Reason is required',
        successTitle: '[ja] Your new card is on the way!',
        successDescription: "[ja] You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: '[ja] Guaranteed eReceipt',
        transactionDate: '[ja] Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '[ja] Start a chat, <success><strong>refer a friend</strong></success>.',
            header: '[ja] Start a chat, refer a friend',
            closeAccessibilityLabel: '[ja] Close, start a chat, refer a friend, banner',
            body: "[ja] Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '[ja] Submit an expense, <success><strong>refer your team</strong></success>.',
            header: '[ja] Submit an expense, refer your team',
            closeAccessibilityLabel: '[ja] Close, submit an expense, refer your team, banner',
            body: "[ja] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '[ja] Refer a friend',
            body: "[ja] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '[ja] Refer a friend',
            header: '[ja] Refer a friend',
            body: "[ja] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: '[ja] Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `[ja] Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `[ja] Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: '[ja] All tags required',
        autoReportedRejectedExpense: '[ja] This expense was rejected.',
        billableExpense: '[ja] Billable no longer valid',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `[ja] Receipt required${formattedLimit ? `[ja]  over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '[ja] Category no longer valid',
        conversionSurcharge: (surcharge: number) => `[ja] Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: '[ja] Rate not valid for this workspace',
        duplicatedTransaction: '[ja] Potential duplicate',
        fieldRequired: '[ja] Report fields are required',
        futureDate: '[ja] Future date not allowed',
        invoiceMarkup: (invoiceMarkup: number) => `[ja] Marked up by ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `[ja] Date older than ${maxAge} days`,
        missingCategory: '[ja] Missing category',
        missingComment: '[ja] Description required for selected category',
        missingAttendees: '[ja] Multiple attendees required for this category',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `[ja] Missing ${tagName ?? '[ja] tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '[ja] Amount differs from calculated distance';
                case 'card':
                    return '[ja] Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `[ja] Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return '[ja] Amount greater than scanned receipt';
            }
        },
        modifiedDate: '[ja] Date differs from scanned receipt',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `[ja] Distance exceeds the calculated route of ${formattedRouteDistance}` : '[ja] Distance exceeds the calculated route',
        nonExpensiworksExpense: '[ja] Non-Expensiworks expense',
        overAutoApprovalLimit: (formattedLimit: string) => `[ja] Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `[ja] Amount over ${formattedLimit}/person category limit`,
        overLimit: (formattedLimit: string) => `[ja] Amount over ${formattedLimit}/person limit`,
        overTripLimit: (formattedLimit: string) => `[ja] Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: (formattedLimit: string) => `[ja] Amount over ${formattedLimit}/person limit`,
        perDayLimit: (formattedLimit: string) => `[ja] Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: '[ja] Receipt and expense details added manually.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `[ja] Receipt required over ${formattedLimit} category limit`;
            }
            if (formattedLimit) {
                return `[ja] Receipt required over ${formattedLimit}`;
            }
            if (category) {
                return `[ja] Receipt required over category limit`;
            }
            return '[ja] Receipt required';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `[ja] Itemized receipt required${formattedLimit ? `[ja]  over ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '[ja] Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `[ja] alcohol`;
                    case 'gambling':
                        return `[ja] gambling`;
                    case 'tobacco':
                        return `[ja] tobacco`;
                    case 'adultEntertainment':
                        return `[ja] adult entertainment`;
                    case 'hotelIncidentals':
                        return `[ja] hotel incidentals`;
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
        reviewRequired: '[ja] Review required',
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
                return "[ja] Can't auto-match receipt due to broken bank connection.";
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return "[ja] Can't auto-match receipt due to broken bank connection.";
                }
                return isMarkAsCash
                    ? `[ja] Can't auto-match receipt due to broken card connection. Mark as cash to ignore, or <a href="${connectionLink}">fix the card</a> to match the receipt.`
                    : `[ja] Can't auto-match receipt due to broken card connection. <a href="${connectionLink}">Fix the card</a> to match the receipt.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `[ja] Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : '[ja] Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `[ja] Ask ${member} to mark as a cash or wait 7 days and try again` : '[ja] Awaiting merge with card transaction.';
            }
            return '';
        },
        brokenConnection530Error: '[ja] Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `[ja] <muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: '[ja] Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: '[ja] Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true}) => `[ja] Receipt scanning failed.${canEdit ? '[ja]  Enter details manually.' : ''}`,
        receiptGeneratedWithAI: '[ja] Potential AI-generated receipt',
        someTagLevelsRequired: (tagName?: string) => `[ja] Missing ${tagName ?? '[ja] Tag'}`,
        tagOutOfPolicy: (tagName?: string) => `[ja] ${tagName ?? '[ja] Tag'} no longer valid`,
        taxAmountChanged: '[ja] Tax amount was modified',
        taxOutOfPolicy: (taxName?: string) => `[ja] ${taxName ?? '[ja] Tax'} no longer valid`,
        taxRateChanged: '[ja] Tax rate was modified',
        taxRequired: '[ja] Missing tax rate',
        none: '[ja] None',
        taxCodeToKeep: '[ja] Choose which tax code to keep',
        tagToKeep: '[ja] Choose which tag to keep',
        isTransactionReimbursable: '[ja] Choose if transaction is reimbursable',
        merchantToKeep: '[ja] Choose which merchant to keep',
        descriptionToKeep: '[ja] Choose which description to keep',
        categoryToKeep: '[ja] Choose which category to keep',
        isTransactionBillable: '[ja] Choose if transaction is billable',
        keepThisOne: '[ja] Keep this one',
        confirmDetails: `[ja] Confirm the details you're keeping`,
        confirmDuplicatesInfo: `[ja] The duplicates you don't keep will be held for the submitter to delete.`,
        hold: '[ja] This expense was put on hold',
        resolvedDuplicates: '[ja] resolved the duplicate',
        companyCardRequired: '[ja] Company card purchases required',
        noRoute: '[ja] Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `[ja] ${fieldName} is required`,
        reportContainsExpensesWithViolations: '[ja] Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: '[ja] marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: '[ja] resolved the duplicate',
        },
    },
    videoPlayer: {
        play: '[ja] Play',
        pause: '[ja] Pause',
        fullscreen: '[ja] Fullscreen',
        playbackSpeed: '[ja] Playback speed',
        expand: '[ja] Expand',
        mute: '[ja] Mute',
        unmute: '[ja] Unmute',
        normal: '[ja] Normal',
    },
    exitSurvey: {
        header: '[ja] Before you go',
        reasonPage: {
            title: "[ja] Please tell us why you're leaving",
            subtitle: '[ja] Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[ja] I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "[ja] I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[ja] I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[ja] What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '[ja] What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[ja] Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: '[ja] Your response',
        thankYou: '[ja] Thanks for the feedback!',
        thankYouSubtitle: '[ja] Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: '[ja] Switch to Expensify Classic',
        offlineTitle: "[ja] Looks like you're stuck here...",
        offline:
            "[ja] You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: '[ja] Quick tip...',
        quickTipSubTitle: '[ja] You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: '[ja] Book a call',
        bookACallTitle: '[ja] Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '[ja] Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '[ja] Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '[ja] Travel and expense at the speed of chat',
        },
        bookACallTextTop: '[ja] By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: '[ja] We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: '[ja] Take me to Expensify Classic',
    },
    listBoundary: {
        errorMessage: '[ja] An error occurred while loading more messages',
        tryAgain: '[ja] Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: '[ja] matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: '[ja] Authenticate payment card',
        mobileReducedFunctionalityMessage: '[ja] You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `[ja] Free trial: ${numOfDays} ${numOfDays === 1 ? '[ja] day' : '[ja] days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '[ja] Your payment info is outdated',
                subtitle: (date: string) => `[ja] Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '[ja] Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `[ja] Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : '[ja] Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: '[ja] Your payment info is outdated',
                subtitle: (date: string) => `[ja] Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '[ja] Your payment info is outdated',
                subtitle: '[ja] Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: '[ja] Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `[ja] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: '[ja] Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `[ja] Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: '[ja] Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `[ja] Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: '[ja] Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `[ja] Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: '[ja] Your card is expiring soon',
                subtitle: '[ja] Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: '[ja] Success!',
                subtitle: '[ja] Your card has been billed successfully.',
            },
            retryBillingError: {
                title: '[ja] Your card couldn’t be charged',
                subtitle: '[ja] Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `[ja] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '[ja] Start a free trial',
                subtitle: '[ja] As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: (numOfDays: number) => `[ja] Trial: ${numOfDays} ${numOfDays === 1 ? '[ja] day' : '[ja] days'} left!`,
                subtitle: '[ja] Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: '[ja] Your free trial has ended',
                subtitle: '[ja] Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: '[ja] Claim offer',
                subscriptionPageTitle: (discountType: number) => `[ja] <strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `[ja] Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `[ja] Claim within ${days > 0 ? `[ja] ${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '[ja] Payment',
            subtitle: '[ja] Add a card to pay for your Expensify subscription.',
            addCardButton: '[ja] Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `[ja] Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `[ja] Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `[ja] Card ending in ${cardNumber}`,
            changeCard: '[ja] Change payment card',
            changeCurrency: '[ja] Change payment currency',
            cardNotFound: '[ja] No payment card added',
            retryPaymentButton: '[ja] Retry payment',
            authenticatePayment: '[ja] Authenticate payment',
            requestRefund: '[ja] Request refund',
            requestRefundModal: {
                full: '[ja] Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: '[ja] Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: '[ja] View payment history',
        },
        yourPlan: {
            title: '[ja] Your plan',
            exploreAllPlans: '[ja] Explore all plans',
            customPricing: '[ja] Custom pricing',
            asLowAs: (price: string) => `[ja] as low as ${price} per active member/month`,
            pricePerMemberMonth: (price: string) => `[ja] ${price} per member/month`,
            pricePerMemberPerMonth: (price: string) => `[ja] ${price} per member per month`,
            perMemberMonth: '[ja] per member/month',
            collect: {
                title: '[ja] Collect',
                description: '[ja] The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[ja] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[ja] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[ja] Receipt scanning',
                benefit2: '[ja] Reimbursements',
                benefit3: '[ja] Corporate card management',
                benefit4: '[ja] Expense and travel approvals',
                benefit5: '[ja] Travel booking and rules',
                benefit6: '[ja] QuickBooks/Xero integrations',
                benefit7: '[ja] Chat on expenses, reports, and rooms',
                benefit8: '[ja] AI and human support',
            },
            control: {
                title: '[ja] Control',
                description: '[ja] Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[ja] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[ja] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[ja] Everything in the Collect plan',
                benefit2: '[ja] Multi-level approval workflows',
                benefit3: '[ja] Custom expense rules',
                benefit4: '[ja] ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: '[ja] HR integrations (Workday, Certinia)',
                benefit6: '[ja] SAML/SSO',
                benefit7: '[ja] Custom insights and reporting',
                benefit8: '[ja] Budgeting',
            },
            thisIsYourCurrentPlan: '[ja] This is your current plan',
            downgrade: '[ja] Downgrade to Collect',
            upgrade: '[ja] Upgrade to Control',
            addMembers: '[ja] Add members',
            saveWithExpensifyTitle: '[ja] Save with the Expensify Card',
            saveWithExpensifyDescription: '[ja] Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: '[ja] Learn more',
        },
        compareModal: {
            comparePlans: '[ja] Compare Plans',
            subtitle: `[ja] <muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: '[ja] Subscription details',
            annual: '[ja] Annual subscription',
            taxExempt: '[ja] Request tax exempt status',
            taxExemptEnabled: '[ja] Tax exempt',
            taxExemptStatus: '[ja] Tax exempt status',
            payPerUse: '[ja] Pay-per-use',
            subscriptionSize: '[ja] Subscription size',
            headsUp:
                "[ja] Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: '[ja] Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: '[ja] Subscription size',
            yourSize: '[ja] Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                '[ja] Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: '[ja] Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: '[ja] Confirm your new annual subscription details:',
            subscriptionSize: '[ja] Subscription size',
            activeMembers: (size: number) => `[ja] ${size} active members/month`,
            subscriptionRenews: '[ja] Subscription renews',
            youCantDowngrade: '[ja] You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: (size: number, date: string) =>
                `[ja] You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: '[ja] Please enter a valid subscription size',
                sameSize: '[ja] Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: '[ja] Add payment card',
            enterPaymentCardDetails: '[ja] Enter your payment card details',
            security: '[ja] Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: '[ja] Learn more about our security.',
        },
        expensifyCode: {
            title: '[ja] Expensify code',
            discountCode: '[ja] Discount code',
            enterCode: '[ja] Enter an Expensify code to apply to your subscription.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `[ja] You will get a ${promoDiscount}% discount on your next ${validBillingCycles ? `${validBillingCycles} ` : ''}billing charges.`,
            apply: '[ja] Apply',
            error: {
                invalid: '[ja] This code is invalid',
            },
        },
        subscriptionSettings: {
            title: '[ja] Subscription settings',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `[ja] Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}${expensifyCode ? `[ja] , Expensify code: ${expensifyCode}` : ''}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: '[ja] none',
            on: '[ja] on',
            off: '[ja] off',
            annual: '[ja] Annual',
            autoRenew: '[ja] Auto-renew',
            autoIncrease: '[ja] Auto-increase annual seats',
            saveUpTo: (amountWithCurrency: string) => `[ja] Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                '[ja] Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: '[ja] Disable auto-renew',
            helpUsImprove: '[ja] Help us improve Expensify',
            whatsMainReason: "[ja] What's the main reason you're disabling auto-renew?",
            renewsOn: (date: string) => `[ja] Renews on ${date}.`,
            pricingConfiguration: '[ja] Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `[ja] <muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `[ja] <a href="adminsRoom">#admins room.</a>` : '[ja] #admins room.'}</muted-text>`,
            estimatedPrice: '[ja] Estimated price',
            changesBasedOn: '[ja] This changes based on your Expensify Card usage and the subscription options below.',
            collectBillingDescription: '[ja] Collect workspaces are billed monthly per member, with no annual commitment.',
            pricing: '[ja] Pricing',
        },
        requestEarlyCancellation: {
            title: '[ja] Request early cancellation',
            subtitle: '[ja] What’s the main reason you’re requesting early cancellation?',
            subscriptionCanceled: {
                title: '[ja] Subscription canceled',
                subtitle: '[ja] Your annual subscription has been canceled.',
                info: '[ja] If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `[ja] If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: '[ja] Request submitted',
                subtitle:
                    '[ja] Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `[ja] By requesting early cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: '[ja] Functionality needs improvement',
        tooExpensive: '[ja] Too expensive',
        inadequateSupport: '[ja] Inadequate customer support',
        businessClosing: '[ja] Company closing, downsizing, or acquired',
        additionalInfoTitle: '[ja] What software are you moving to and why?',
        additionalInfoInputLabel: '[ja] Your response',
    },
    roomChangeLog: {
        updateRoomDescription: '[ja] set the room description to:',
        clearRoomDescription: '[ja] cleared the room description',
        changedRoomAvatar: '[ja] changed the room avatar',
        removedRoomAvatar: '[ja] removed the room avatar',
    },
    delegate: {
        switchAccount: '[ja] Switch accounts:',
        copilotDelegatedAccess: '[ja] Copilot: Delegated access',
        copilotDelegatedAccessDescription: '[ja] Allow other members to access your account.',
        learnMoreAboutDelegatedAccess: '[ja] Learn more about delegated access',
        addCopilot: '[ja] Add copilot',
        membersCanAccessYourAccount: '[ja] These members can access your account:',
        youCanAccessTheseAccounts: '[ja] You can access these accounts via the account switcher:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[ja] Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[ja] Limited';
                default:
                    return '';
            }
        },
        genericError: '[ja] Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `[ja] on behalf of ${delegator}`,
        accessLevel: '[ja] Access level',
        confirmCopilot: '[ja] Confirm your copilot below.',
        accessLevelDescription: '[ja] Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[ja] Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[ja] Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: '[ja] Remove copilot',
        removeCopilotConfirmation: '[ja] Are you sure you want to remove this copilot?',
        changeAccessLevel: '[ja] Change access level',
        makeSureItIsYou: "[ja] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[ja] Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `[ja] Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '[ja] Not so fast...',
        noAccessMessage: dedent(`
            [ja] As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `[ja] As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: '[ja] Copilot access',
    },
    debug: {
        debug: '[ja] Debug',
        details: '[ja] Details',
        JSON: '[ja] JSON',
        reportActions: '[ja] Actions',
        reportActionPreview: '[ja] Preview',
        nothingToPreview: '[ja] Nothing to preview',
        editJson: '[ja] Edit JSON:',
        preview: '[ja] Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `[ja] Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `[ja] Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `[ja] Invalid value - Expected: ${expectedValues}`,
        missingValue: '[ja] Missing value',
        createReportAction: '[ja] Create Report Action',
        reportAction: '[ja] Report Action',
        report: '[ja] Report',
        transaction: '[ja] Transaction',
        violations: '[ja] Violations',
        transactionViolation: '[ja] Transaction Violation',
        hint: "[ja] Data changes won't be sent to the backend",
        textFields: '[ja] Text fields',
        numberFields: '[ja] Number fields',
        booleanFields: '[ja] Boolean fields',
        constantFields: '[ja] Constant fields',
        dateTimeFields: '[ja] DateTime fields',
        date: '[ja] Date',
        time: '[ja] Time',
        none: '[ja] None',
        visibleInLHN: '[ja] Visible in LHN',
        GBR: '[ja] GBR',
        RBR: '[ja] RBR',
        true: '[ja] true',
        false: '[ja] false',
        viewReport: '[ja] View Report',
        viewTransaction: '[ja] View transaction',
        createTransactionViolation: '[ja] Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: '[ja] Has draft comment',
            hasGBR: '[ja] Has GBR',
            hasRBR: '[ja] Has RBR',
            pinnedByUser: '[ja] Pinned by member',
            hasIOUViolations: '[ja] Has IOU violations',
            hasAddWorkspaceRoomErrors: '[ja] Has add workspace room errors',
            isUnread: '[ja] Is unread (focus mode)',
            isArchived: '[ja] Is archived (most recent mode)',
            isSelfDM: '[ja] Is self DM',
            isFocused: '[ja] Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: '[ja] Has join request (admin room)',
            isUnreadWithMention: '[ja] Is unread with mention',
            isWaitingForAssigneeToCompleteAction: '[ja] Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: '[ja] Has child report awaiting action',
            hasMissingInvoiceBankAccount: '[ja] Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: '[ja] Has unresolved card fraud alert',
            hasDEWApproveFailed: '[ja] Has DEW approve failed',
        },
        reasonRBR: {
            hasErrors: '[ja] Has errors in report or report actions data',
            hasViolations: '[ja] Has violations',
            hasTransactionThreadViolations: '[ja] Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "[ja] There's a report awaiting action",
            theresAReportWithErrors: "[ja] There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "[ja] There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "[ja] There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: '[ja] There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "[ja] There's a problem with a contact method",
            aContactMethodRequiresVerification: '[ja] A contact method requires verification',
            theresAProblemWithAPaymentMethod: "[ja] There's a problem with a payment method",
            theresAProblemWithAWorkspace: "[ja] There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "[ja] There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "[ja] There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: '[ja] Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: '[ja] There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "[ja] There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "[ja] There's a problem with your wallet terms",
            aBankAccountIsLocked: '[ja] A bank account is locked',
        },
    },
    emptySearchView: {
        takeATestDrive: '[ja] Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: '[ja] Welcome to New Expensify!',
        subtitle: "[ja] It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "[ja] Let's go!",
        helpText: '[ja] Try 2-min demo',
        features: {
            search: '[ja] More powerful search on mobile, web, and desktop',
            concierge: '[ja] Built-in Concierge AI to help automate your expenses',
            chat: '[ja] Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '[ja] <tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '[ja] <tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '[ja] <tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        scanTestTooltip: {
            main: '[ja] <tooltip><strong>Scan our test receipt</strong> to see how it works!</tooltip>',
            manager: '[ja] <tooltip>Choose our <strong>test manager</strong> to try it out!</tooltip>',
            confirmation: '[ja] <tooltip>Now, <strong>submit your expense</strong> and watch the\nmagic happen!</tooltip>',
            tryItOut: '[ja] Try it out',
        },
        outstandingFilter: '[ja] <tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '[ja] <tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "[ja] <tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
        hasFilterNegation: '[ja] <tooltip>Search for expenses without receipts using <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '[ja] Discard changes?',
        body: '[ja] Are you sure you want to discard the changes you made?',
        confirmText: '[ja] Discard changes',
    },
    scheduledCall: {
        book: {
            title: '[ja] Schedule call',
            description: '[ja] Find a time that works for you.',
            slots: ({date}: {date: string}) => `[ja] <muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '[ja] Confirm call',
            description: "[ja] Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: '[ja] Your setup specialist',
            meetingLength: '[ja] Meeting length',
            dateTime: '[ja] Date & time',
            minutes: '[ja] 30 minutes',
        },
        callScheduled: '[ja] Call scheduled',
    },
    autoSubmitModal: {
        title: '[ja] All clear and submitted!',
        description: '[ja] All warnings and violations has been cleared so:',
        submittedExpensesTitle: '[ja] These expenses have been submitted',
        submittedExpensesDescription: '[ja] These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: '[ja] Pending expenses have been moved',
        pendingExpensesDescription: '[ja] Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '[ja] Take a 2-minute test drive',
        },
        modal: {
            title: '[ja] Take us for a test drive',
            description: '[ja] Take a quick product tour to get up to speed fast.',
            confirmText: '[ja] Start test drive',
            helpText: '[ja] Skip',
            employee: {
                description: '[ja] <muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "[ja] Enter your boss's email",
                error: '[ja] That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "[ja] You're currently test driving Expensify",
            readyForTheRealThing: '[ja] Ready for the real thing?',
            getStarted: '[ja] Get started',
        },
        employeeInviteMessage: (name: string) => `[ja] # ${name} invited you to test drive Expensify
Hey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.

Here’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: '[ja] Basic export',
        reportLevelExport: '[ja] All Data - report level',
        expenseLevelExport: '[ja] All Data - expense level',
        exportInProgress: '[ja] Export in progress',
        conciergeWillSend: '[ja] Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: '[ja] Not verified',
        retry: '[ja] Retry',
        verifyDomain: {
            title: '[ja] Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `[ja] Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `[ja] Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: '[ja] Add the following TXT record:',
            saveChanges: '[ja] Save changes and return here to verify your domain.',
            youMayNeedToConsult: `[ja] You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: '[ja] After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: '[ja] Couldn’t fetch verification code',
            genericError: "[ja] We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: '[ja] Domain verified',
            header: '[ja] Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `[ja] <muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: '[ja] SAML',
        samlFeatureList: {
            title: '[ja] SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `[ja] <muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: '[ja] Faster and easier login',
            moreSecurityAndControl: '[ja] More security and control',
            onePasswordForAnything: '[ja] One password for everything',
        },
        goToDomain: '[ja] Go to domain',
        samlLogin: {
            title: '[ja] SAML login',
            subtitle: `[ja] <muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a>.</muted-text>`,
            enableSamlLogin: '[ja] Enable SAML login',
            allowMembers: '[ja] Allow members to log in with SAML.',
            requireSamlLogin: '[ja] Require SAML login',
            anyMemberWillBeRequired: '[ja] Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "[ja] Couldn't update SAML enablement setting",
            requireError: "[ja] Couldn't update SAML requirement setting",
            disableSamlRequired: '[ja] Disable SAML required',
            oktaWarningPrompt: '[ja] Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: '[ja] Please add Identity Provider metadata below to enable',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `[ja] <muted-text>Please disable <a href="${twoFactorAuthSettingsUrl}">force two-factor authentication</a> to enable SAML login.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: '[ja] SAML configuration details',
            subtitle: '[ja] Use these details to get SAML set up.',
            identityProviderMetadata: '[ja] Identity Provider Metadata',
            entityID: '[ja] Entity ID',
            nameIDFormat: '[ja] Name ID Format',
            loginUrl: '[ja] Login URL',
            acsUrl: '[ja] ACS (Assertion Consumer Service) URL',
            logoutUrl: '[ja] Logout URL',
            sloUrl: '[ja] SLO (Single Logout) URL',
            serviceProviderMetaData: '[ja] Service Provider MetaData',
            oktaScimToken: '[ja] Okta SCIM Token',
            revealToken: '[ja] Reveal token',
            fetchError: "[ja] Couldn't fetch SAML configuration details",
            setMetadataGenericError: "[ja] Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: '[ja] Access restricted',
            subtitle: (domainName: string) => `[ja] Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: '[ja] Company card management',
            accountCreationAndDeletion: '[ja] Account creation and deletion',
            workspaceCreation: '[ja] Workspace creation',
            samlSSO: '[ja] SAML SSO',
        },
        addDomain: {
            title: '[ja] Add domain',
            subtitle: '[ja] Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: '[ja] Domain name',
            newDomain: '[ja] New domain',
        },
        domainAdded: {
            title: '[ja] Domain added',
            description: "[ja] Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: '[ja] Configure',
        },
        enhancedSecurity: {
            title: '[ja] Enhanced security',
            subtitle: '[ja] Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: '[ja] Enable',
        },
        domainAdmins: '[ja] Domain admins',
        admins: {
            title: '[ja] Admins',
            findAdmin: '[ja] Find admin',
            primaryContact: '[ja] Primary contact',
            addPrimaryContact: '[ja] Add primary contact',
            setPrimaryContactError: '[ja] Unable to set primary contact. Please try again later.',
            consolidatedDomainBilling: '[ja] Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `[ja] <comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "[ja] Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: '[ja] Add admin',
            addAdminError: '[ja] Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: '[ja] Revoke admin access',
            cantRevokeAdminAccess: "[ja] Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: '[ja] Unable to remove this user as an Admin. Please try again.',
                removeDomain: '[ja] Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: '[ja] Please enter your domain name to reset it.',
            },
            resetDomain: '[ja] Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `[ja] Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: '[ja] Enter your domain name here',
            resetDomainInfo: `[ja] This action is <strong>permanent</strong> and the following data will be deleted: <br/> <bullet-list><bullet-item>Company card connections and any unreported expenses from those cards</bullet-item><bullet-item>SAML and group settings</bullet-item></bullet-list> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        domainMembers: '[ja] Domain members',
        members: {
            title: '[ja] Members',
            findMember: '[ja] Find member',
            addMember: '[ja] Add member',
            emptyMembers: {
                title: '[ja] No members in this group',
                subtitle: '[ja] Add a member or try changing the filter above.',
            },
            allMembers: '[ja] All members',
            email: '[ja] Email address',
            closeAccountPrompt: '[ja] Are you sure? This action is permanent.',
            forceCloseAccount: () => ({
                one: '[ja] Force close account',
                other: '[ja] Force close accounts',
            }),
            safeCloseAccount: () => ({
                one: '[ja] Close account safely',
                other: '[ja] Close accounts safely',
            }),
            closeAccountInfo: () => ({
                one: '[ja] We recommend closing the account safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected account.',
                other: '[ja] We recommend closing the accounts safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected accounts.',
            }),
            closeAccount: () => ({
                one: '[ja] Close account',
                other: '[ja] Close accounts',
            }),
            moveToGroup: '[ja] Move to group',
            chooseWhereToMove: ({count}: {count: number}) => `[ja] Choose where to move ${count} ${count === 1 ? '[ja] member' : '[ja] members'}.`,
            error: {
                addMember: '[ja] Unable to add this member. Please try again.',
                removeMember: '[ja] Unable to remove this user. Please try again.',
                moveMember: '[ja] Unable to move this member. Please try again.',
                vacationDelegate: '[ja] Unable to set this user as a vacation delegate. Please try again.',
            },
            cannotSetVacationDelegateForMember: (email: string) => `[ja] You can't set a vacation delegate for ${email} because they're currently the delegate for the following members:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `[ja] Are you sure? This will lock <strong>${email}'s</strong> account. <br /><br /> Our team will then review the account and remove any unauthorized access. To regain access, they'll need to work with Concierge.`,
            reportSuspiciousActivityConfirmationPrompt: '[ja] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        },
        common: {
            settings: '[ja] Settings',
            forceTwoFactorAuth: '[ja] Force two-factor authentication',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `[ja] <muted-text>Please disable <a href="${samlPageUrl}">SAML</a> to force two-factor authentication.</muted-text>`,
            forceTwoFactorAuthDescription: `[ja] <muted-text>Require two-factor authentication for all members of this domain. Domain members will be prompted to set up two-factor authentication on their account when they sign in.</muted-text>`,
            forceTwoFactorAuthError: "[ja] Force two-factor authentication couldn't be changed. Please try again later.",
            resetTwoFactorAuth: '[ja] Reset two-factor authentication',
        },
        groups: {
            title: '[ja] Groups',
            memberCount: () => {
                return {
                    one: '[ja] 1 member',
                    other: (count: number) => `[ja] ${count} members`,
                };
            },
        },
    },
};
export default translations;
