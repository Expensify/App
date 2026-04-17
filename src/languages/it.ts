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
        count: '[it][ctx: Used as a noun meaning a numerical total or quantity, not the verb “to count.”] Count',
        cancel: '[it] Cancel',
        dismiss: '[it][ctx: Refers to closing or hiding a notification or message, not rejecting or ignoring something.] Dismiss',
        proceed: '[it][ctx: Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”] Proceed',
        unshare: '[it] Unshare',
        yes: '[it] Yes',
        no: '[it] No',
        ok: '[it][ctx: Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.] OK',
        notNow: '[it] Not now',
        noThanks: '[it] No thanks',
        learnMore: '[it] Learn more',
        buttonConfirm: '[it] Got it',
        name: '[it] Name',
        attachment: '[it] Attachment',
        attachments: '[it] Attachments',
        center: '[it] Center',
        from: '[it] From',
        to: '[it] To',
        in: '[it] In',
        optional: '[it] Optional',
        new: '[it] New',
        newFeature: '[it] New feature',
        search: '[it] Search',
        reports: '[it] Reports',
        spend: '[it] Spend',
        find: '[it] Find',
        searchWithThreeDots: '[it] Search...',
        next: '[it] Next',
        previous: '[it] Previous',
        previousMonth: '[it] Previous month',
        nextMonth: '[it] Next month',
        previousYear: '[it] Previous year',
        nextYear: '[it] Next year',
        goBack: '[it][ctx: Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.] Go back',
        create: '[it] Create',
        add: '[it] Add',
        resend: '[it] Resend',
        save: '[it] Save',
        select: '[it] Select',
        deselect: '[it] Deselect',
        selectMultiple: '[it][ctx: Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.] Select multiple',
        saveChanges: '[it] Save changes',
        submit: '[it] Submit',
        submitted: '[it][ctx: Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”] Submitted',
        rotate: '[it] Rotate',
        zoom: '[it] Zoom',
        password: '[it] Password',
        magicCode: '[it] Magic code',
        digits: '[it] digits',
        twoFactorCode: '[it] Two-factor code',
        workspaces: '[it] Workspaces',
        home: '[it] Home',
        inbox: '[it] Inbox',
        yourReviewIsRequired: '[it] Your review is required',
        actionBadge: {
            submit: '[it] Submit',
            approve: '[it] Approve',
            pay: '[it] Pay',
            fix: '[it] Fix',
        },
        success: '[it][ctx: Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”] Success',
        group: '[it] Group',
        profile: '[it] Profile',
        referral: '[it] Referral',
        payments: '[it] Payments',
        approvals: '[it] Approvals',
        wallet: '[it] Wallet',
        preferences: '[it] Preferences',
        view: '[it] View',
        review: (amount?: string) => `[it] Review${amount ? ` ${amount}` : ''}`,
        not: '[it] Not',
        signIn: '[it] Sign in',
        signInWithGoogle: '[it] Sign in with Google',
        signInWithApple: '[it] Sign in with Apple',
        signInWith: '[it] Sign in with',
        continue: '[it] Continue',
        firstName: '[it] First name',
        lastName: '[it] Last name',
        scanning: '[it] Scanning',
        analyzing: '[it] Analyzing...',
        thinking: '[it] Concierge is thinking...',
        addCardTermsOfService: '[it] Expensify Terms of Service',
        perPerson: '[it] per person',
        phone: '[it] Phone',
        phoneNumber: '[it] Phone number',
        phoneNumberPlaceholder: '[it] (xxx) xxx-xxxx',
        email: '[it] Email',
        and: '[it] and',
        or: '[it] or',
        details: '[it] Details',
        privacy: '[it] Privacy',
        privacyPolicy: '[it] Privacy Policy',
        hidden: '[it] Hidden',
        visible: '[it] Visible',
        delete: '[it] Delete',
        archived: '[it][ctx: UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.] archived',
        contacts: '[it] Contacts',
        recents: '[it] Recents',
        close: '[it] Close',
        comment: '[it] Comment',
        download: '[it] Download',
        downloading: '[it] Downloading',
        uploading: '[it][ctx: Indicates that a file is currently being uploaded (sent to the server), not downloaded.] Uploading',
        pin: '[it][ctx: as a verb, not a noun] Pin',
        unPin: '[it] Unpin',
        back: '[it] Back',
        saveAndContinue: '[it] Save & continue',
        settings: '[it] Settings',
        termsOfService: '[it] Terms of Service',
        members: '[it] Members',
        invite: '[it] Invite',
        here: '[it] here',
        date: '[it] Date',
        dob: '[it] Date of birth',
        currentYear: '[it] Current year',
        currentMonth: '[it] Current month',
        ssnLast4: '[it] Last 4 digits of SSN',
        ssnFull9: '[it] Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `[it] Address line ${lineNumber}`,
        personalAddress: '[it] Personal address',
        companyAddress: '[it] Company address',
        noPO: '[it] No PO boxes or mail-drop addresses, please.',
        city: '[it] City',
        state: '[it] State',
        streetAddress: '[it] Street address',
        stateOrProvince: '[it] State / Province',
        country: '[it] Country',
        zip: '[it] Zip code',
        zipPostCode: '[it] Zip / Postcode',
        whatThis: "[it] What's this?",
        iAcceptThe: '[it] I accept the ',
        acceptTermsAndPrivacy: `[it] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `[it] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `[it] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: "[it] You can't export an empty report.",
            other: () => `[it] You can't export empty reports.`,
        }),
        remove: '[it] Remove',
        admin: '[it] Admin',
        owner: '[it] Owner',
        dateFormat: '[it] YYYY-MM-DD',
        send: '[it] Send',
        na: '[it] N/A',
        noResultsFound: '[it] No results found',
        noResultsFoundMatching: (searchString: string) => `[it] No results found matching "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `[it] Suggestions available for "${searchString}".` : '[it] Suggestions available.'),
        recentDestinations: '[it] Recent destinations',
        timePrefix: "[it] It's",
        conjunctionFor: '[it] for',
        todayAt: '[it] Today at',
        tomorrowAt: '[it] Tomorrow at',
        yesterdayAt: '[it] Yesterday at',
        conjunctionAt: '[it] at',
        conjunctionTo: '[it] to',
        genericErrorMessage: '[it] Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: '[it] Percentage',
        progressBarLabel: '[it] Onboarding progress',
        converted: '[it] Converted',
        error: {
            invalidAmount: '[it] Invalid amount',
            acceptTerms: '[it] You must accept the Terms of Service to continue',
            phoneNumber: `[it] Please enter a complete phone number
(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '[it] This field is required',
            requestModified: '[it] This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `[it] Character limit exceeded (${length}/${limit})`,
            dateInvalid: '[it] Please select a valid date',
            invalidDateShouldBeFuture: '[it] Please choose today or a future date',
            invalidTimeShouldBeFuture: '[it] Please choose a time at least one minute ahead',
            invalidCharacter: '[it] Invalid character',
            enterMerchant: '[it] Enter a merchant name',
            enterAmount: '[it] Enter an amount',
            missingMerchantName: '[it] Missing merchant name',
            missingAmount: '[it] Missing amount',
            missingDate: '[it] Missing date',
            enterDate: '[it] Enter a date',
            invalidTimeRange: '[it] Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: '[it] Please complete the form above to continue',
            pleaseSelectOne: '[it] Please select an option above',
            invalidRateError: '[it] Please enter a valid rate',
            lowRateError: '[it] Rate must be greater than 0',
            email: '[it] Please enter a valid email address',
            login: '[it] An error occurred while logging in. Please try again.',
        },
        comma: '[it] comma',
        semicolon: '[it] semicolon',
        please: '[it] Please',
        contactUs: '[it][ctx: Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.] contact us',
        pleaseEnterEmailOrPhoneNumber: '[it] Please enter an email or phone number',
        fixTheErrors: '[it][ctx: Instruction prompting the user to correct multiple issues. Should use imperative form when translated.] fix the errors',
        inTheFormBeforeContinuing: '[it] in the form before continuing',
        confirm: '[it] Confirm',
        reset: '[it] Reset',
        done: '[it][ctx: Status or button indicating that an action or process has been completed. Should reflect completion.] Done',
        more: '[it] More',
        debitCard: '[it] Debit card',
        bankAccount: '[it] Bank account',
        personalBankAccount: '[it] Personal bank account',
        businessBankAccount: '[it] Business bank account',
        join: '[it] Join',
        leave: '[it] Leave',
        decline: '[it] Decline',
        reject: '[it] Reject',
        transferBalance: '[it] Transfer balance',
        enterManually: '[it][ctx: Instruction telling the user to input data manually. Refers to entering text or values in a field.] Enter it manually',
        message: '[it] Message',
        leaveThread: '[it] Leave thread',
        you: '[it] You',
        me: '[it][ctx: Refers to the current user in the UI. Should follow capitalization rules for labels] me',
        youAfterPreposition: '[it] you',
        your: '[it] your',
        conciergeHelp: '[it] Please reach out to Concierge for help.',
        youAppearToBeOffline: '[it] You appear to be offline.',
        thisFeatureRequiresInternet: '[it] This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: '[it] Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: '[it] An error occurred while trying to play this video.',
        areYouSure: '[it] Are you sure?',
        verify: '[it] Verify',
        yesContinue: '[it] Yes, continue',
        websiteExample: '[it][ctx: Provides an example format for a website URL.] e.g. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `[it][ctx: Provides an example format for a ZIP] e.g. ${zipSampleFormat}` : ''),
        description: '[it] Description',
        title: '[it] Title',
        assignee: '[it] Assignee',
        createdBy: '[it] Created by',
        with: '[it] with',
        shareCode: '[it] Share code',
        share: '[it] Share',
        per: '[it] per',
        mi: '[it][ctx: Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.] mile',
        km: '[it] kilometer',
        milesAbbreviated: '[it] mi',
        kilometersAbbreviated: '[it] km',
        copied: '[it] Copied!',
        someone: '[it] Someone',
        total: '[it] Total',
        edit: '[it] Edit',
        letsDoThis: `[it] Let's do this!`,
        letsStart: `[it] Let's start`,
        showMore: '[it] Show more',
        showLess: '[it] Show less',
        merchant: '[it] Merchant',
        change: '[it] Change',
        category: '[it] Category',
        report: '[it] Report',
        billable: '[it] Billable',
        nonBillable: '[it] Non-billable',
        tag: '[it] Tag',
        receipt: '[it] Receipt',
        verified: '[it] Verified',
        replace: '[it] Replace',
        distance: '[it] Distance',
        mile: '[it] mile',
        miles: '[it][ctx: Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.] miles',
        kilometer: '[it] kilometer',
        kilometers: '[it] kilometers',
        recent: '[it] Recent',
        all: '[it] All',
        am: '[it] AM',
        pm: '[it] PM',
        tbd: "[it][ctx: Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.] TBD",
        selectCurrency: '[it] Select a currency',
        selectSymbolOrCurrency: '[it] Select a symbol or currency',
        card: '[it] Card',
        whyDoWeAskForThis: '[it] Why do we ask for this?',
        required: '[it] Required',
        automatic: '[it] Automatic',
        showing: '[it] Showing',
        of: '[it] of',
        default: '[it] Default',
        update: '[it] Update',
        member: '[it] Member',
        auditor: '[it] Auditor',
        role: '[it] Role',
        roleCannotBeChanged: (workflowsLinkPage: string) => `[it] Role can't be changed because this member is a <a href="${workflowsLinkPage}">payer</a> on this workspace.`,
        currency: '[it] Currency',
        groupCurrency: '[it] Group currency',
        rate: '[it] Rate',
        emptyLHN: {
            title: '[it] Woohoo! All caught up.',
            subtitleText1: '[it] Find a chat using the',
            subtitleText2: '[it] button above, or create something using the',
            subtitleText3: '[it] button below.',
        },
        businessName: '[it] Business name',
        clear: '[it] Clear',
        type: '[it] Type',
        reportName: '[it] Report name',
        action: '[it] Action',
        expenses: '[it] Expenses',
        totalSpend: '[it] Total spend',
        tax: '[it] Tax',
        shared: '[it] Shared',
        drafts: '[it] Drafts',
        draft: '[it][ctx: as a noun, not a verb] Draft',
        finished: '[it] Finished',
        upgrade: '[it] Upgrade',
        downgradeWorkspace: '[it] Downgrade workspace',
        companyID: '[it] Company ID',
        userID: '[it] User ID',
        disable: '[it] Disable',
        export: '[it] Export',
        initialValue: '[it] Initial value',
        currentDate: '[it][ctx: UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.] Current date',
        value: '[it] Value',
        downloadFailedTitle: '[it] Download failed',
        downloadFailedDescription: "[it] Your download couldn't be completed. Please try again later.",
        filterLogs: '[it] Filter Logs',
        network: '[it] Network',
        reportID: '[it] Report ID',
        longReportID: '[it] Long Report ID',
        withdrawalID: '[it] Withdrawal ID',
        withdrawalStatus: '[it] Withdrawal status',
        bankAccounts: '[it] Bank accounts',
        chooseFile: '[it] Choose file',
        chooseFiles: '[it] Choose files',
        dropTitle: '[it][ctx: Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.] Let it go',
        dropMessage: '[it][ctx: Instruction for dropping one or more files into an upload area.] Drop your file here',
        ignore: '[it] Ignore',
        enabled: '[it] Enabled',
        disabled: '[it] Disabled',
        import: '[it][ctx: Action button for importing a file or data. Should use the verb form, not the noun form.] Import',
        offlinePrompt: "[it] You can't take this action right now.",
        outstanding: '[it][ctx: meaning "remaining to be paid, done, or dealt with", not "exceptionally good"] Outstanding',
        chats: '[it] Chats',
        tasks: '[it] Tasks',
        unread: '[it] Unread',
        sent: '[it] Sent',
        links: '[it] Links',
        day: '[it][ctx: Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).] day',
        days: '[it] days',
        rename: '[it] Rename',
        address: '[it] Address',
        hourAbbreviation: '[it] h',
        minuteAbbreviation: '[it] m',
        secondAbbreviation: '[it] s',
        skip: '[it] Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `[it] Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: '[it] Chat now',
        workEmail: '[it] Work email',
        destination: '[it] Destination',
        subrate: '[it][ctx: Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.] Subrate',
        perDiem: '[it] Per diem',
        validate: '[it] Validate',
        downloadAsPDF: '[it] Download as PDF',
        downloadAsCSV: '[it] Download as CSV',
        print: '[it] Print',
        help: '[it] Help',
        collapsed: '[it] Collapsed',
        expanded: '[it] Expanded',
        expenseReport: '[it] Expense Report',
        expenseReports: '[it] Expense Reports',
        rateOutOfPolicy: '[it][ctx: Rate as a noun, not a verb] Rate out of policy',
        leaveWorkspace: '[it] Leave workspace',
        leaveWorkspaceConfirmation: "[it] If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "[it] If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "[it] If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `[it] If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `[it] If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `[it] If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "[it] You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: '[it] Reimbursable',
        editYourProfile: '[it] Edit your profile',
        comments: '[it] Comments',
        sharedIn: '[it] Shared in',
        unreported: '[it] Unreported',
        explore: '[it] Explore',
        insights: '[it] Insights',
        todo: '[it] To-do',
        invoice: '[it] Invoice',
        expense: '[it] Expense',
        chat: '[it] Chat',
        task: '[it] Task',
        trip: '[it] Trip',
        apply: '[it] Apply',
        status: '[it] Status',
        on: '[it] On',
        before: '[it] Before',
        after: '[it] After',
        range: '[it] Range',
        reschedule: '[it] Reschedule',
        general: '[it] General',
        workspacesTabTitle: '[it] Workspaces',
        headsUp: '[it] Heads up!',
        submitTo: '[it] Submit to',
        forwardTo: '[it] Forward to',
        approvalLimit: '[it] Approval limit',
        overLimitForwardTo: '[it] Over limit forward to',
        merge: '[it] Merge',
        none: '[it] None',
        unstableInternetConnection: '[it] Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: '[it] Enable Global Reimbursements',
        purchaseAmount: '[it] Purchase amount',
        originalAmount: '[it] Original amount',
        frequency: '[it] Frequency',
        link: '[it] Link',
        pinned: '[it] Pinned',
        read: '[it] Read',
        copyToClipboard: '[it] Copy to clipboard',
        thisIsTakingLongerThanExpected: '[it] This is taking longer than expected...',
        domains: '[it] Domains',
        actionRequired: '[it] Action required',
        duplicate: '[it] Duplicate',
        duplicated: '[it] Duplicated',
        duplicateExpense: '[it] Duplicate expense',
        duplicateReport: '[it] Duplicate report',
        copyOfReportName: (reportName: string) => `[it] Copy of ${reportName}`,
        exchangeRate: '[it] Exchange rate',
        reimbursableTotal: '[it] Reimbursable total',
        nonReimbursableTotal: '[it] Non-reimbursable total',
        opensInNewTab: '[it] Opens in a new tab',
        locked: '[it] Locked',
        month: '[it] Month',
        week: '[it] Week',
        year: '[it] Year',
        quarter: '[it] Quarter',
        concierge: {
            sidePanelGreeting: '[it] Hi there, how can I help?',
            showHistory: '[it] Show history',
        },
        vacationDelegate: '[it] Vacation delegate',
        expensifyLogo: '[it] Expensify logo',
        approver: '[it] Approver',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `[it] enter digit ${digitIndex} of ${totalDigits}`,
    },
    socials: {
        podcast: '[it] Follow us on Podcast',
        twitter: '[it] Follow us on Twitter',
        instagram: '[it] Follow us on Instagram',
        facebook: '[it] Follow us on Facebook',
        linkedin: '[it] Follow us on LinkedIn',
    },
    concierge: {
        collapseReasoning: '[it] Collapse reasoning',
        expandReasoning: '[it] Expand reasoning',
    },
    supportalNoAccess: {
        title: '[it] Not so fast',
        descriptionWithCommand: (command?: string) =>
            `[it] You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: '[it] Locked Account',
        description: "[it] You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: '[it] Use current location',
        notFound: '[it] We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "[it] It looks like you've denied access to your location.",
        please: '[it] Please',
        allowPermission: '[it] allow location access in settings',
        tryAgain: '[it] and try again.',
    },
    contact: {
        importContacts: '[it] Import contacts',
        importContactsTitle: '[it] Import your contacts',
        importContactsText: '[it] Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: '[it] so your favorite people are always a tap away.',
        importContactsNativeText: '[it] Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: '[it] Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '[it] Camera access',
        expensifyDoesNotHaveAccessToCamera: "[it] Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: '[it] Attachment error',
        errorWhileSelectingAttachment: '[it] An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: '[it] An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: '[it] Take photo',
        chooseFromGallery: '[it] Choose from gallery',
        chooseDocument: '[it] Choose file',
        attachmentTooLarge: '[it] Attachment is too large',
        sizeExceeded: '[it] Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `[it] Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: '[it] Attachment is too small',
        sizeNotMet: '[it] Attachment size must be greater than 240 bytes',
        wrongFileType: '[it] Invalid file type',
        notAllowedExtension: '[it] This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: '[it] Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: '[it] Password-protected PDF is not supported',
        attachmentImageResized: '[it] This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: '[it] This image is too large to preview before uploading.',
        imageDimensionsTooLarge: '[it] Image dimensions are too large to process. Please use a smaller image.',
        tooManyFiles: (fileLimit: number) => `[it] You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `[it] Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "[it] Some files can't be uploaded",
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `[it] Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "[it] You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `[it] ${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: '[it] Learn more about supported formats.',
        passwordProtected: "[it] Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: '[it] Add attachments',
        addReceipt: '[it] Add receipt',
        scanReceipts: '[it] Scan receipts',
        replaceReceipt: '[it] Replace receipt',
    },
    filePicker: {
        fileError: '[it] File error',
        errorWhileSelectingFile: '[it] An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: '[it] Connection complete',
        supportingText: '[it] You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: '[it] Edit photo',
        description: '[it] Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: '[it] No extension found for mime type',
        problemGettingImageYouPasted: '[it] There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `[it] The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `[it] The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: '[it] Update app',
        updatePrompt: '[it] A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: '[it] Launching Expensify',
        expired: '[it] Your session has expired.',
        signIn: '[it] Please sign in again.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: '[it] Review transaction',
            pleaseReview: '[it] Please review this transaction',
            requiresYourReview: '[it] An Expensify Card transaction requires your review.',
            transactionDetails: '[it] Transaction details',
            attemptedTransaction: '[it] Attempted transaction',
            deny: '[it] Deny',
            approve: '[it] Approve',
            denyTransaction: '[it] Deny transaction',
            transactionDenied: '[it] Transaction denied',
            transactionApproved: '[it] Transaction approved!',
            areYouSureToDeny: '[it] Are you sure? The transaction will be denied if you close this screen.',
            youCanTryAgainAtMerchantOrReachOut:
                "[it] You can try again at the merchant. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            youNeedToTryAgainAtMerchant: "[it] This transaction was not verified, so we denied it. You'll need to try again at the merchant.",
            goBackToTheMerchant: '[it] Return to the merchant site to continue the transaction.',
            transactionFailed: '[it] Transaction failed',
            transactionCouldNotBeCompleted: '[it] Your transaction could not be completed. Please try again at the merchant.',
            transactionCouldNotBeCompletedReachOut:
                "[it] Your transaction could not be completed. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            reviewFailed: '[it] Review failed',
            alreadyReviewedSubtitle:
                '[it] You already reviewed this transaction. Please check your <transaction-history-link>transaction history</transaction-history-link> or contact <concierge-link>Concierge</concierge-link> to report any issues.',
        },
        unsupportedDevice: {
            unsupportedDevice: '[it] Unsupported device',
            pleaseDownloadMobileApp: `[it] This action is not supported on your device. Please download the Expensify app from the <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> or <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> and try again.`,
            pleaseUseWebApp: `[it] This action is not supported on your device. Please use the <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify web app</a> and try again.`,
        },
        biometricsTest: {
            biometricsTest: '[it] Biometrics test',
            authenticationSuccessful: '[it] Authentication successful',
            successfullyAuthenticatedUsing: (authType?: string) => `[it] You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `[it] Biometrics (${status})`,
            statusNeverRegistered: '[it] Never registered',
            statusNotRegistered: '[it] Not registered',
            statusRegisteredOtherDevice: () => ({one: '[it] Another device registered', other: '[it] Other devices registered'}),
            statusRegisteredThisDevice: '[it] Registered',
            yourAttemptWasUnsuccessful: '[it] Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: '[it] You couldn’t be authenticated',
            areYouSureToReject: '[it] Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: '[it] Reject authentication',
            test: '[it] Test',
            biometricsAuthentication: '[it] Biometric authentication',
            authType: {
                unknown: '[it] Unknown',
                none: '[it] None',
                credentials: '[it] Credentials',
                biometrics: '[it] Biometrics',
                faceId: '[it] Face ID',
                touchId: '[it] Touch ID',
                opticId: '[it] Optic ID',
                passkey: '[it] Passkey',
            },
        },
        pleaseEnableInSystemSettings: {
            start: '[it] Please enable face/fingerprint verification or set a device passcode in your ',
            link: '[it] system settings',
            end: '.',
        },
        oops: '[it] Oops, something went wrong',
        verificationFailed: '[it] Verification failed',
        looksLikeYouRanOutOfTime: '[it] Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: '[it] You ran out of time',
        letsVerifyItsYou: '[it] Let’s verify it’s you',
        nowLetsAuthenticateYou: "[it] Now, let's authenticate you...",
        letsAuthenticateYou: "[it] Let's authenticate you...",
        verifyYourself: {
            biometrics: '[it] Verify yourself with your face or fingerprint',
            passkeys: '[it] Verify yourself with a passkey',
        },
        enableQuickVerification: {
            biometrics: '[it] Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
            passkeys: '[it] Enable quick, secure verification using a passkey. No passwords or codes required.',
        },
        revoke: {
            revoke: '[it] Revoke',
            title: '[it] Face/fingerprint & passkeys',
            explanation:
                '[it] Face/fingerprint or passkey verification are enabled on one or more devices. Revoking access will require a magic code for the next verification on that device.',
            confirmationPrompt: "[it] Are you sure? You'll need a magic code for the next verification on that device.",
            confirmationPromptThisDevice: "[it] Are you sure? You'll need a magic code for the next verification on this device.",
            confirmationPromptMultiple: "[it] Are you sure? You'll need a magic code for the next verification on those devices.",
            confirmationPromptAll: "[it] Are you sure? You'll need a magic code for the next verification on any device.",
            cta: '[it] Revoke access',
            ctaAll: '[it] Revoke all',
            noDevices: "[it] You don't have any devices registered for face/fingerprint or passkey verification. If you register any, you will be able to revoke that access here.",
            dismiss: '[it] Got it',
            error: '[it] Request failed. Try again later.',
            thisDevice: '[it] This device',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['[it] One', '[it] Two', '[it] Three', '[it] Four', '[it] Five', '[it] Six', '[it] Seven', '[it] Eight', '[it] Nine'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `[it] ${displayCount} other ${otherDeviceCount === 1 ? '[it] device' : '[it] devices'}`;
            },
        },
        setPin: {
            didNotShipCard: "[it] We didn't ship your card. Please try again.",
        },
        revealPin: {
            couldNotReveal: "[it] We couldn't reveal your PIN. Please try again.",
        },
        changePin: {
            didNotChange: "[it] We didn't change your PIN. Please try again.",
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            [it] Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: '[it] Head back to your original tab to continue.',
        title: "[it] Here's your magic code",
        description: dedent(`
            [it] Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            [it] Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: '[it] , or',
        signInHere: '[it] just sign in here',
        expiredCodeTitle: '[it] Magic code expired',
        expiredCodeDescription: '[it] Go back to the original device and request a new code',
        successfulNewCodeRequest: '[it] Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            [it] Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            [it] Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: '[it] request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: '[it] Paid by',
        whatsItFor: "[it] What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: '[it] Name, email, or phone number',
        findMember: '[it] Find a member',
        searchForSomeone: '[it] Search for someone',
        userSelected: (username: string) => `[it] ${username} selected`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '[it] Submit an expense, refer your team',
            subtitleText: "[it] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '[it] Book a call',
    },
    hello: '[it] Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '[it] Get started below.',
        anotherLoginPageIsOpen: '[it] Another login page is open.',
        anotherLoginPageIsOpenExplanation: "[it] You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: '[it] Welcome!',
        welcomeWithoutExclamation: '[it] Welcome',
        phrase2: "[it] Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: '[it] Your payments get to you as fast as you can get your point across.',
        enterPassword: '[it] Please enter your password',
        welcomeNewFace: (login: string) => `[it] ${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: (login: string) => `[it] Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '[it] Travel and expense, at the speed of chat',
            body: '[it] Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '[it] Continue logging in with single sign-on:',
        orContinueWithMagicCode: '[it] You can also sign in with a magic code',
        useSingleSignOn: '[it] Use single sign-on',
        useMagicCode: '[it] Use magic code',
        launching: '[it] Launching...',
        oneMoment: "[it] One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: '[it] Drop to upload',
        sendAttachment: '[it] Send attachment',
        addAttachment: '[it] Add attachment',
        writeSomething: '[it] Write something...',
        blockedFromConcierge: '[it] Communication is barred',
        askConciergeToUpdate: '[it] Try "Update an expense"...',
        askConciergeToCorrect: '[it] Try "Correct an expense"...',
        askConciergeForHelp: '[it] Ask Concierge AI for help...',
        fileUploadFailed: '[it] Upload failed. File is not supported.',
        localTime: (user: string, time: string) => `[it] It's ${time} for ${user}`,
        edited: '[it] (edited)',
        emoji: '[it] Emoji',
        collapse: '[it] Collapse',
        expand: '[it] Expand',
    },
    reportActionContextMenu: {
        copyMessage: '[it] Copy message',
        copied: '[it] Copied!',
        copyLink: '[it] Copy link',
        copyURLToClipboard: '[it] Copy URL to clipboard',
        copyEmailToClipboard: '[it] Copy email to clipboard',
        markAsUnread: '[it] Mark as unread',
        markAsRead: '[it] Mark as read',
        editAction: ({action}: EditActionParams) => `[it] Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '[it] expense' : '[it] comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '[it] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[it] Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '[it] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[it] Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: '[it] Only visible to',
        explain: '[it] Explain',
        explainMessage: '[it] Please explain this to me.',
        replyInThread: '[it] Reply in thread',
        joinThread: '[it] Join thread',
        leaveThread: '[it] Leave thread',
        copyOnyxData: '[it] Copy Onyx data',
        flagAsOffensive: '[it] Flag as offensive',
        menu: '[it] Menu',
    },
    emojiReactions: {
        addReactionTooltip: '[it] Add reaction',
        reactedWith: '[it] reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `[it] You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `[it] This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `[it] This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `[it] This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `[it] This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `[it] This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `[it] This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `[it] This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: '[it] This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "[it] Welcome! Let's get you set up.",
        chatWithAccountManager: '[it] Chat with your account manager here',
        askMeAnything: '[it] Ask me anything!',
        sayHello: '[it] Say hello!',
        yourSpace: '[it] Your space',
        welcomeToRoom: (roomName: string) => `[it] Welcome to ${roomName}!`,
        usePlusButton: (additionalText: string) => `[it]  Use the + button to ${additionalText} an expense.`,
        askConcierge: '[it] This is your chat with Concierge, your personal AI agent. I can do almost anything, try me!',
        conciergeSupport: '[it] Your personal AI agent',
        create: '[it] create',
        iouTypes: {
            pay: '[it] pay',
            split: '[it] split',
            submit: '[it] submit',
            track: '[it] track',
            invoice: '[it] invoice',
        },
    },
    adminOnlyCanPost: '[it] Only admins can send messages in this room.',
    reportAction: {
        asCopilot: '[it] as copilot for',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `[it] created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `[it] created this report for any held expenses from deleted report #${reportID}`
                : `[it] created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: '[it] Notify everyone in this conversation',
    },
    newMessages: '[it] New messages',
    latestMessages: '[it] Latest messages',
    youHaveBeenBanned: "[it] Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: '[it] is typing...',
        areTyping: '[it] are typing...',
        multipleMembers: '[it] Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '[it] This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `[it] This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `[it] This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `[it] This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `[it] This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[it] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[it] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '[it] This booking is archived.',
    },
    writeCapabilityPage: {
        label: '[it] Who can post',
        writeCapability: {
            all: '[it] All members',
            admins: '[it] Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: '[it] Find something...',
        buttonMySettings: '[it] My settings',
        fabNewChat: '[it] Start chat',
        fabNewChatExplained: '[it] Open actions menu',
        fabScanReceiptExplained: '[it] Scan receipt',
        chatPinned: '[it] Chat pinned',
        draftedMessage: '[it] Drafted message',
        listOfChatMessages: '[it] List of chat messages',
        listOfChats: '[it] List of chats',
        saveTheWorld: '[it] Save the world',
        tooltip: '[it] Get started here!',
        redirectToExpensifyClassicModal: {
            title: '[it] Coming soon',
            description: "[it] We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        },
    },
    homePage: {
        forYou: '[it] For you',
        timeSensitiveSection: {
            title: '[it] Time sensitive',
            ctaFix: '[it] Fix',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `[it] Fix ${feedName} company card connection` : '[it] Fix company card connection'),
                defaultSubtitle: '[it] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `[it] Fix ${cardName} personal card connection` : '[it] Fix personal card connection'),
                subtitle: '[it] Wallet',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `[it] Fix ${integrationName} connection`,
                defaultSubtitle: '[it] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: '[it] We need your shipping address',
                subtitle: '[it] Provide an address to receive your Expensify Card.',
                cta: '[it] Add address',
            },
            addPaymentCard: {
                title: '[it] Add a payment card to keep using Expensify',
                subtitle: '[it] Account > Subscription',
                cta: '[it] Add',
            },
            activateCard: {
                title: '[it] Activate your Expensify Card',
                subtitle: '[it] Validate your card and start spending.',
                cta: '[it] Activate',
            },
            reviewCardFraud: {
                title: '[it] Review potential fraud on your Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `[it] Review ${amount} in potential fraud at ${merchant}`,
                subtitle: '[it] Expensify Card',
                cta: '[it] Review',
            },
            validateAccount: {
                title: '[it] Validate your account to continue using Expensify',
                subtitle: '[it] Account',
                cta: '[it] Validate',
            },
            fixFailedBilling: {
                title: "[it] We couldn't bill your card on file",
                subtitle: '[it] Subscription',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `[it] Free trial: ${days} ${days === 1 ? '[it] day' : '[it] days'} left!`,
            offer50Body: '[it] Get 50% off your first year!',
            offer25Body: '[it] Get 25% off your first year!',
            addCardBody: "[it] Don't wait! Add your payment card now.",
            ctaClaim: '[it] Claim',
            ctaAdd: '[it] Add card',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `[it] Time remaining: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: '[it] Time remaining: 1 day',
                other: (pluralCount: number) => `[it] Time remaining: ${pluralCount} days`,
            }),
        },
        assignedCards: '[it] Your Expensify Cards',
        assignedCardsRemaining: ({amount}: {amount: string}) => `[it] ${amount} remaining`,
        announcements: '[it] Announcements',
        discoverSection: {
            title: '[it] Discover',
            menuItemTitleNonAdmin: '[it] Learn how to create expenses and submit reports.',
            menuItemTitleAdmin: '[it] Learn how to invite members, edit approval workflows, and reconcile company cards.',
            menuItemDescription: '[it] See what Expensify can do in 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `[it] Submit ${count} ${count === 1 ? '[it] report' : '[it] reports'}`,
            approve: ({count}: {count: number}) => `[it] Approve ${count} ${count === 1 ? '[it] report' : '[it] reports'}`,
            pay: ({count}: {count: number}) => `[it] Pay ${count} ${count === 1 ? '[it] report' : '[it] reports'}`,
            export: ({count}: {count: number}) => `[it] Export ${count} ${count === 1 ? '[it] report' : '[it] reports'}`,
            begin: '[it] Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: "[it] You're done!",
                thumbsUpStarsDescription: '[it] Thumbs up to you, stay tuned for more tasks.',
                smallRocketTitle: '[it] All caught up',
                smallRocketDescription: '[it] Upcoming to-dos will launch here.',
                cowboyHatTitle: "[it] You're done!",
                cowboyHatDescription: '[it] All tasks are wrangled, keep an eye out for more.',
                trophy1Title: '[it] Nothing to show',
                trophy1Description: '[it] You did it! Keep an eye out for more to-dos.',
                palmTreeTitle: '[it] All caught up',
                palmTreeDescription: '[it] Time to relax but stay tuned for future tasks.',
                fishbowlBlueTitle: "[it] You're done!",
                fishbowlBlueDescription: "[it] We'll bubble up future tasks here.",
                targetTitle: '[it] All caught up',
                targetDescription: '[it] Way to stay on target. Check back for more tasks!',
                chairTitle: '[it] Nothing to show',
                chairDescription: "[it] Go relax, we'll list upcoming to-dos here.",
                broomTitle: "[it] You're done!",
                broomDescription: '[it] Tasks are clean, though stay tuned for more to-dos.',
                houseTitle: '[it] All caught up',
                houseDescription: '[it] This is your home base for upcoming to-dos.',
                conciergeBotTitle: '[it] Nothing to show',
                conciergeBotDescription: '[it] Beep boop beep boop, check back for more tasks!',
                checkboxTextTitle: '[it] All caught up',
                checkboxTextDescription: '[it] Check off your upcoming to-dos here.',
                flashTitle: "[it] You're done!",
                flashDescription: "[it] We'll zap your future tasks here.",
                sunglassesTitle: '[it] Nothing to show',
                sunglassesDescription: "[it] Time to chill, though stay tuned for what's next!",
                f1FlagsTitle: '[it] All caught up',
                f1FlagsDescription: "[it] You've finished all outstanding to-dos.",
            },
        },
        gettingStartedSection: {
            title: '[it] Getting started',
            createWorkspace: '[it] Create a workspace',
            connectAccounting: ({integrationName}: {integrationName: string}) => `[it] Connect to ${integrationName}`,
            connectAccountingDefault: '[it] Connect to accounting',
            customizeCategories: '[it] Customize accounting categories',
            linkCompanyCards: '[it] Link company cards',
            setupRules: '[it] Set up spend rules',
        },
        upcomingTravel: '[it] Upcoming travel',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `[it] Flight to ${destination}`,
            trainTo: ({destination}: {destination: string}) => `[it] Train to ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `[it] Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `[it] Car rental in ${destination}`,
            inOneWeek: '[it] In 1 week',
            inDays: () => ({
                one: '[it] In 1 day',
                other: (count: number) => `[it] In ${count} days`,
            }),
            today: '[it] Today',
        },
    },
    allSettingsScreen: {
        subscription: '[it] Subscription',
        domains: '[it] Domains',
    },
    tabSelector: {
        chat: '[it] Chat',
        room: '[it] Room',
        distance: '[it] Distance',
        manual: '[it] Manual',
        scan: '[it] Scan',
        map: '[it] Map',
        gps: '[it] GPS',
        odometer: '[it] Odometer',
    },
    spreadsheet: {
        upload: '[it] Upload a spreadsheet',
        import: '[it] Import spreadsheet',
        dragAndDrop: '[it] <muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `[it] <muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '[it] <muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `[it] <muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: '[it] File contains column headers',
        column: (name: string) => `[it] Column ${name}`,
        fieldNotMapped: (fieldName: string) => `[it] Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `[it] Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `[it] Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: '[it] Import successful',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[it] No categories have been added or updated.';
            }
            if (added && updated) {
                return `[it] ${added} ${added === 1 ? '[it] category' : '[it] categories'} added, ${updated} ${updated === 1 ? '[it] category' : '[it] categories'} updated.`;
            }
            if (added) {
                return added === 1 ? '[it] 1 category has been added.' : `[it] ${added} categories have been added.`;
            }
            return updated === 1 ? '[it] 1 category has been updated.' : `[it] ${updated} categories have been updated.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[it] ${transactions} transactions have been added.` : '[it] 1 transaction has been added.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[it] No members have been added or updated.';
            }
            if (added && updated) {
                return `[it] ${added} member${added > 1 ? '[it] s' : ''} added, ${updated} member${updated > 1 ? '[it] s' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `[it] ${updated} members have been updated.` : '[it] 1 member has been updated.';
            }
            return added > 1 ? `[it] ${added} members have been added.` : '[it] 1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `[it] ${tags} tags have been added.` : '[it] 1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: '[it] Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `[it] ${rates} per diem rates have been added.` : '[it] 1 per diem rate has been added.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[it] ${transactions} transactions have been imported.` : '[it] 1 transaction has been imported.',
        importFailedTitle: '[it] Import failed',
        importFailedDescription: '[it] Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: '[it] Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: '[it] File size must be greater than 0 bytes',
        invalidFileMessage:
            '[it] The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: '[it] Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: '[it] Import spreadsheet',
        downloadCSV: '[it] Download CSV',
        importMemberConfirmation: () => ({
            one: `[it] Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `[it] Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: '[it] Upload receipt',
        uploadMultiple: '[it] Upload receipts',
        desktopSubtitleSingle: `[it] or drag and drop it here`,
        desktopSubtitleMultiple: `[it] or drag and drop them here`,
        alternativeMethodsTitle: '[it] Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `[it] <label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `[it] <label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `[it] <label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `[it] <label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: '[it] Take a photo',
        cameraAccess: '[it] Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `[it] Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: '[it] Camera error',
        cameraErrorMessage: '[it] An error occurred while taking a photo. Please try again.',
        locationAccessTitle: '[it] Allow location access',
        locationAccessMessage: '[it] Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: '[it] Allow location access',
        locationErrorMessage: '[it] Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `[it] Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '[it] Let it go',
        dropMessage: '[it] Drop your file here',
        flash: '[it] flash',
        multiScan: '[it] multi-scan',
        shutter: '[it] shutter',
        gallery: '[it] gallery',
        deleteReceipt: '[it] Delete receipt',
        deleteConfirmation: '[it] Are you sure you want to delete this receipt?',
        addReceipt: '[it] Add receipt',
        addAdditionalReceipt: '[it] Add additional receipt',
        scanFailed: "[it] The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        crop: '[it] Crop',
        addAReceipt: {
            phrase1: '[it] Add a receipt',
            phrase2: '[it] or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: '[it] Scan receipt',
        recordDistance: '[it] Track distance',
        requestMoney: '[it] Create expense',
        perDiem: '[it] Create per diem',
        splitBill: '[it] Split expense',
        splitScan: '[it] Split receipt',
        splitDistance: '[it] Split distance',
        paySomeone: (name?: string) => `[it] Pay ${name ?? '[it] someone'}`,
        assignTask: '[it] Assign task',
        header: '[it] Quick action',
        noLongerHaveReportAccess: '[it] You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: '[it] Update destination',
        createReport: '[it] Create report',
        createTimeExpense: '[it] Create time expense',
    },
    iou: {
        amount: '[it] Amount',
        percent: '[it] Percent',
        date: '[it] Date',
        taxAmount: '[it] Tax amount',
        taxRate: '[it] Tax rate',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `[it] Approve ${formattedAmount}` : '[it] Approve'),
        approved: '[it] Approved',
        cash: '[it] Cash',
        card: '[it] Card',
        original: '[it] Original',
        split: '[it] Split',
        splitExpense: '[it] Split expense',
        splitDates: '[it] Split dates',
        splitDateRange: (startDate: string, endDate: string, count: number) => `[it] ${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `[it] ${amount} from ${merchant}`,
        splitByPercentage: '[it] Split by percentage',
        splitByDate: '[it] Split by date',
        addSplit: '[it] Add split',
        makeSplitsEven: '[it] Make splits even',
        editSplits: '[it] Edit splits',
        totalAmountGreaterThanOriginal: (amount: string) => `[it] Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: (amount: string) => `[it] Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: '[it] Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: '[it] No splits added. Add at least one to save.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `[it] Edit ${amount} for ${merchant}`,
        removeSplit: '[it] Remove split',
        splitExpenseCannotBeEditedModalTitle: "[it] This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: '[it] Approved or paid expenses cannot be edited',
        paySomeone: (name?: string) => `[it] Pay ${name ?? '[it] someone'}`,
        splitExpenseDistanceErrorModalDescription: '[it] Please fix the distance rate error and try again.',
        splitExpensePerDiemRateErrorModalDescription: '[it] Please fix the per diem rate error and try again.',
        expense: '[it] Expense',
        categorize: '[it] Categorize',
        share: '[it] Share',
        participants: '[it] Participants',
        createExpense: '[it] Create expense',
        trackDistance: '[it] Track distance',
        createExpenses: (expensesNumber: number) => `[it] Create ${expensesNumber} expenses`,
        removeExpense: '[it] Remove expense',
        removeThisExpense: '[it] Remove this expense',
        removeExpenseConfirmation: '[it] Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: '[it] Add expense',
        chooseRecipient: '[it] Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `[it] Create ${amount} expense`,
        confirmDetails: '[it] Confirm details',
        pay: '[it] Pay',
        cancelPayment: '[it] Cancel payment',
        cancelPaymentConfirmation: '[it] Are you sure that you want to cancel this payment?',
        viewDetails: '[it] View details',
        pending: '[it] Pending',
        canceled: '[it] Canceled',
        posted: '[it] Posted',
        deleteReceipt: '[it] Delete receipt',
        findExpense: '[it] Find expense',
        deletedTransaction: (amount: string, merchant: string) => `[it] deleted an expense (${amount} for ${merchant})`,
        movedFromReport: (reportName: string) => `[it] moved an expense${reportName ? `[it]  from ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `[it] moved this expense${reportName ? `[it]  to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `[it] moved this expense${reportName ? `[it]  from <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `[it] moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `[it] moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `[it] moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: '[it] Receipt pending match with card transaction',
        pendingMatch: '[it] Pending match',
        pendingMatchWithCreditCardDescription: '[it] Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: '[it] Mark as cash',
        pendingMatchSubmitTitle: '[it] Submit report',
        pendingMatchSubmitDescription: '[it] Some expenses are awaiting a match with a credit card transaction. Do you want to mark them as cash?',
        routePending: '[it] Route pending...',
        automaticallyEnterExpenseDetails: '[it] Concierge will automatically enter the expense details for you, or you can add them manually.',
        receiptScanning: () => ({
            one: '[it] Receipt scanning...',
            other: '[it] Receipts scanning...',
        }),
        scanMultipleReceipts: '[it] Scan multiple receipts',
        scanMultipleReceiptsDescription: "[it] Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: '[it] Receipt scan in progress',
        receiptScanInProgressDescription: '[it] Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: '[it] Remove from report',
        moveToPersonalSpace: '[it] Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '[it] Potential duplicate expenses identified. Review duplicates to enable submission.'
                : '[it] Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: '[it] Issue found',
            other: '[it] Issues found',
        }),
        fieldPending: '[it] Pending...',
        defaultRate: '[it] Default rate',
        receiptMissingDetails: '[it] Receipt missing details',
        missingAmount: '[it] Missing amount',
        missingMerchant: '[it] Missing merchant',
        receiptStatusTitle: '[it] Scanning…',
        receiptStatusText: "[it] Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: '[it] Receipt scanning failed. Please enter the details manually.',
        transactionPendingDescription: '[it] Transaction pending. It may take a few days to post.',
        companyInfo: '[it] Company info',
        companyInfoDescription: '[it] We need a few more details before you can send your first invoice.',
        yourCompanyName: '[it] Your company name',
        yourCompanyWebsite: '[it] Your company website',
        yourCompanyWebsiteNote: "[it] If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: '[it] You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: '[it] You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '[it] 1 expense',
                other: (count: number) => `[it] ${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: '[it] Delete expense',
            other: '[it] Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: '[it] Are you sure that you want to delete this expense?',
            other: '[it] Are you sure that you want to delete these expenses?',
        }),
        deleteReport: () => ({
            one: '[it] Delete report',
            other: '[it] Delete reports',
        }),
        deleteReportConfirmation: () => ({
            one: '[it] Are you sure that you want to delete this report?',
            other: '[it] Are you sure that you want to delete these reports?',
        }),
        settledExpensify: '[it] Paid',
        done: '[it] Done',
        deleted: '[it] Deleted',
        settledElsewhere: '[it] Paid elsewhere',
        individual: '[it] Individual',
        business: '[it] Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `[it] Pay ${formattedAmount} as an individual` : `[it] Pay with personal account`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `[it] Pay ${formattedAmount} with wallet` : `[it] Pay with wallet`),
        settlePayment: (formattedAmount: string) => `[it] Pay ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `[it] Pay ${formattedAmount} as a business` : `[it] Pay with business account`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `[it] Mark ${formattedAmount} as paid` : `[it] Mark as paid`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `[it] paid ${amount} with personal account ${last4Digits}` : `[it] Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `[it] paid ${amount} with business account ${last4Digits}` : `[it] Paid with business account`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `[it] Pay ${formattedAmount} via ${policyName}` : `[it] Pay via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `[it] paid ${amount} with bank account ${last4Digits}` : `[it] paid with bank account ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `[it] paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `[it] Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `[it] Business Account • ${lastFour}`,
        nextStep: '[it] Next steps',
        finished: '[it] Finished',
        flip: '[it] Flip',
        sendInvoice: (amount: string) => `[it] Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `[it]  for ${comment}` : ''}`,
        submitted: (memo?: string) => `[it] submitted${memo ? `[it] , saying ${memo}` : ''}`,
        automaticallySubmitted: `[it] submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: '[it] queued to submit via custom approval workflow',
        failedToAutoSubmitViaDEW: (reason: string) => `[it] failed to submit the report via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `[it] failed to submit the report. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `[it] failed to approve via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `[it] failed to approve. ${reason}`,
        queuedToApproveViaDEW: '[it] queued to approve via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `[it] tracking ${formattedAmount}${comment ? `[it]  for ${comment}` : ''}`,
        splitAmount: (amount: string) => `[it] split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `[it] split ${formattedAmount}${comment ? `[it]  for ${comment}` : ''}`,
        yourSplit: (amount: string) => `[it] Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `[it] ${payer} owes ${amount}${comment ? `[it]  for ${comment}` : ''}`,
        payerOwes: (payer: string) => `[it] ${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `[it] ${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: (payer: string) => `[it] ${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `[it] ${payer} spent ${amount}`,
        payerSpent: (payer: string) => `[it] ${payer} spent: `,
        managerApproved: (manager: string) => `[it] ${manager} approved:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `[it] ${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `[it] paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `[it] paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `[it] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `[it] approved ${amount}`,
        approvedMessage: `[it] approved`,
        unapproved: `[it] unapproved`,
        automaticallyForwarded: `[it] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `[it] approved`,
        rejectedThisReport: '[it] rejected',
        waitingOnBankAccount: (submitterDisplayName: string) => `[it] started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: '[it] canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `[it] canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `[it] ${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `[it] ${payer ? `${payer} ` : ''}marked as paid${comment ? `[it] , saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `[it] ${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `[it] ${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        reimbursedThisReport: '[it] reimbursed this report',
        paidThisBill: '[it] paid this bill',
        reimbursedOnBehalfOf: (actor: string) => `[it] on behalf of ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `[it] from the bank account ending in ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `[it] ${submitter} added a bank account, taking report off hold. Reimbursement is initiated`,
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
                ? `[it] . Money is on its way to your${creditBankAccount ? `[it]  bank account ending in ${creditBankAccount}` : '[it]  account'}. Reimbursement estimated to complete on ${expectedDate}.`
                : `[it] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[it]  bank account ending in ${creditBankAccount}` : '[it]  account'}. Reimbursement estimated to complete on ${expectedDate}.`,
        reimbursedWithCheck: '[it]  via check.',
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
            const paymentMethod = isCard ? '[it] card' : '[it] bank account';
            return isCurrentUser
                ? `[it] . Money is on its way to your${creditBankAccount ? `[it]  bank account ending in ${creditBankAccount}` : '[it]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`
                : `[it] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[it]  bank account ending in ${creditBankAccount}` : '[it]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `[it]  with direct deposit (ACH)${creditBankAccount ? `[it]  to the bank account ending in ${creditBankAccount}. ` : '. '}${expectedDate ? `[it] The reimbursement is estimated to complete by ${expectedDate}.` : '[it] This generally takes 4-5 business days.'}`,
        noReimbursableExpenses: '[it] This report has an invalid amount',
        pendingConversionMessage: "[it] Total will update when you're back online",
        changedTheExpense: '[it] changed the expense',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `[it] the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `[it] set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `[it] the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `[it] the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `[it] changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: '[it] based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `[it] based on <a href="${rulesLink}">workspace rules</a>` : '[it] based on workspace rule'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `[it] for ${comment}` : '[it] expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `[it] Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `[it] ${formattedAmount} sent${comment ? `[it]  for ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) => `[it] moved expense from personal space to ${workspaceName ?? `[it] chat with ${reportName}`}`,
        movedToPersonalSpace: '[it] moved expense to personal space',
        error: {
            invalidCategoryLength: '[it] The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: '[it] The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: '[it] Please enter a valid amount before continuing',
            invalidDistance: '[it] Please enter a valid distance before continuing',
            invalidReadings: '[it] Please enter both start and end readings',
            negativeDistanceNotAllowed: '[it] End reading must be greater than start reading',
            distanceAmountTooLarge: '[it] The total amount is too large. Reduce the distance or lower the rate.',
            distanceAmountTooLargeReduceDistance: '[it] The total amount is too large. Reduce the distance.',
            distanceAmountTooLargeReduceRate: '[it] The total amount is too large. Lower the rate.',
            odometerReadingTooLarge: (formattedMax: string) => `[it] Odometer readings cannot exceed ${formattedMax}.`,
            stitchOdometerImagesFailed: '[it] Failed to combine odometer images. Please try again later.',
            invalidIntegerAmount: '[it] Please enter a whole dollar amount before continuing',
            invalidTaxAmount: (amount: string) => `[it] Maximum tax amount is ${amount}`,
            invalidSplit: '[it] The sum of splits must equal the total amount',
            invalidSplitParticipants: '[it] Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: '[it] Please enter a non-zero amount for your split',
            noParticipantSelected: '[it] Please select a participant',
            other: '[it] Unexpected error. Please try again later.',
            genericCreateFailureMessage: '[it] Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: '[it] Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: '[it] Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: '[it] Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: '[it] Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '[it] <rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: '[it] There was an error uploading your receipt.',
            genericDeleteFailureMessage: '[it] Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: '[it] Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: '[it] Transaction is missing fields',
            duplicateWaypointsErrorMessage: '[it] Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: '[it] Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: '[it] An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: '[it] Please enter a valid merchant',
            atLeastOneAttendee: '[it] At least one attendee must be selected',
            invalidQuantity: '[it] Please enter a valid quantity',
            quantityGreaterThanZero: '[it] Quantity must be greater than zero',
            invalidSubrateLength: '[it] There must be at least one subrate',
            invalidRate: '[it] Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "[it] The end date can't be before the start date",
            endDateSameAsStartDate: "[it] The end date can't be the same as the start date",
            manySplitsProvided: `[it] The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `[it] The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
        },
        dismissReceiptError: '[it] Dismiss error',
        dismissReceiptErrorConfirmation: '[it] Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `[it] started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: '[it] Enable wallet',
        hold: '[it] Hold',
        unhold: '[it] Remove hold',
        holdExpense: () => ({
            one: '[it] Hold expense',
            other: '[it] Hold expenses',
        }),
        unholdExpense: '[it] Unhold expense',
        heldExpense: '[it] held this expense',
        unheldExpense: '[it] unheld this expense',
        moveUnreportedExpense: '[it] Move unreported expense',
        addUnreportedExpense: '[it] Add unreported expense',
        selectUnreportedExpense: '[it] Select at least one expense to add to the report.',
        emptyStateUnreportedExpenseTitle: '[it] No unreported expenses',
        emptyStateUnreportedExpenseSubtitle: '[it] Looks like you don’t have any unreported expenses. Try creating one below.',
        addUnreportedExpenseConfirm: '[it] Add to report',
        newReport: '[it] New report',
        explainHold: () => ({
            one: "[it] Explain why you're holding this expense.",
            other: "[it] Explain why you're holding these expenses.",
        }),
        explainHoldApprover: () => ({
            one: '[it] Explain what you need before approving this expense.',
            other: '[it] Explain what you need before approving these expenses.',
        }),
        retracted: '[it] retracted',
        retract: '[it] Retract',
        reopened: '[it] reopened',
        reopenReport: '[it] Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `[it] This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: '[it] Reason',
        holdReasonRequired: '[it] A reason is required when holding.',
        expenseWasPutOnHold: '[it] Expense was put on hold',
        expenseOnHold: '[it] This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: '[it] All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: '[it] This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: '[it] Some of these duplicates have been approved or paid already.',
        reviewDuplicates: '[it] Review duplicates',
        keepAll: '[it] Keep all',
        noDuplicatesTitle: '[it] All set!',
        noDuplicatesDescription: '[it] There are no duplicate transactions for review here.',
        confirmApprove: '[it] Confirm approval amount',
        confirmApprovalAmount: '[it] Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: '[it] This expense is on hold. Do you want to approve anyway?',
            other: '[it] These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: '[it] Confirm payment amount',
        confirmPayAmount: "[it] Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: '[it] This expense is on hold. Do you want to pay anyway?',
            other: '[it] These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: '[it] Pay only',
        approveOnly: '[it] Approve only',
        holdEducationalTitle: '[it] Should you hold this expense?',
        whatIsHoldExplain: "[it] Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: '[it] Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "[it] Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: '[it] You moved this report!',
            description: '[it] Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '[it] <strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: '[it] This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: '[it] Change workspace',
        set: '[it] set',
        changed: '[it] changed',
        removed: '[it] removed',
        transactionPending: '[it] Transaction pending.',
        chooseARate: '[it] Select a workspace reimbursement rate per mile or kilometer',
        unapprove: '[it] Unapprove',
        unapproveReport: '[it] Unapprove report',
        headsUp: '[it] Heads up!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `[it] This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: '[it] reimbursable',
        nonReimbursable: '[it] non-reimbursable',
        bookingPending: '[it] This booking is pending',
        bookingPendingDescription: "[it] This booking is pending because it hasn't been paid yet.",
        bookingArchived: '[it] This booking is archived',
        bookingArchivedDescription: '[it] This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: '[it] Attendees',
        totalPerAttendee: '[it] Per attendee',
        whoIsYourAccountant: '[it] Who is your accountant?',
        paymentComplete: '[it] Payment complete',
        time: '[it] Time',
        startDate: '[it] Start date',
        endDate: '[it] End date',
        startTime: '[it] Start time',
        endTime: '[it] End time',
        deleteSubrate: '[it] Delete subrate',
        deleteSubrateConfirmation: '[it] Are you sure you want to delete this subrate?',
        quantity: '[it] Quantity',
        subrateSelection: '[it] Select a subrate and enter a quantity.',
        qty: '[it] Qty',
        firstDayText: () => ({
            one: `[it] First day: 1 hour`,
            other: (count: number) => `[it] First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `[it] Last day: 1 hour`,
            other: (count: number) => `[it] Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `[it] Trip: 1 full day`,
            other: (count: number) => `[it] Trip: ${count} full days`,
        }),
        dates: '[it] Dates',
        rates: '[it] Rates',
        submitsTo: (name: string) => `[it] Submits to ${name}`,
        reject: {
            educationalTitle: '[it] Should you hold or reject?',
            educationalText: "[it] If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: '[it] Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: '[it] Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: '[it] Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "[it] Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: '[it] Reject expense',
            reasonPageDescription: '[it] Explain why you will not approve this expense.',
            rejectReason: '[it] Rejection reason',
            markAsResolved: '[it] Mark as resolved',
            rejectedStatus: '[it] This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: '[it] rejected this expense',
                markedAsResolved: '[it] marked the rejection reason as resolved',
            },
        },
        rejectReport: {
            title: '[it] Reject report',
            description: '[it] Explain why you will not approve this report:',
            rejectReason: '[it] Rejection reason',
            selectTarget: '[it] Choose the member to reject this report back to for review:',
            lastApprover: '[it] Last approver',
            submitter: '[it] Submitter',
            rejectedReportMessage: '[it] This report was rejected.',
            rejectedNextStep: '[it] This report was rejected. Waiting on you to fix the issues and manually resubmit.',
            selectMemberError: '[it] Select a member to reject this report back to.',
            couldNotReject: '[it] The report could not be rejected. Please try again.',
        },
        moveExpenses: '[it] Move to report',
        moveExpensesError: "[it] You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: '[it] Change approver',
            header: (workflowSettingLink: string) =>
                `[it] Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `[it] changed the approver to <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '[it] Add approver',
                addApproverSubtitle: '[it] Add an additional approver to the existing workflow.',
                bypassApprovers: '[it] Bypass approvers',
                bypassApproversSubtitle: '[it] Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: '[it] Choose an additional approver for this report before we route through the rest of the approval workflow.',
                bulkSubtitle: '[it] Choose an additional approver for these reports before we route through the rest of the approval workflow.',
            },
            bulkSubtitle: '[it] Choose an option to change the approver for these reports.',
        },
        chooseWorkspace: '[it] Choose a workspace',
        routedDueToDEW: (to: string, reason?: string) => `[it] report routed to ${to}${reason ? `[it]  because ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `[it] ${hours} ${hours === 1 ? '[it] hour' : '[it] hours'} @ ${rate} / hour`,
            hrs: '[it] hrs',
            hours: '[it] Hours',
            ratePreview: (rate: string) => `[it] ${rate} / hour`,
            amountTooLargeError: '[it] The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctRateError: '[it] Fix the rate error and try again.',
        AskToExplain: `[it] . <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explain<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '[it] marked the expense as "reimbursable"' : '[it] marked the expense as "non-reimbursable"'),
            billable: (value: boolean) => (value ? '[it] marked the expense as "billable"' : '[it] marked the expense as "non-billable"'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `[it] set the tax rate to "${value}"` : `[it] tax rate to "${value}"`),
            reportName: (value: string) => `[it] moved this expense to report "${value}"`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `[it] set the ${field} to "${value}"` : `[it] ${field} to "${value}"`;
            },
            formatPersonalRules: (fragments: string, route: string) => `[it] ${fragments} via <a href="${route}">personal expense rules</a>`,
            formatPolicyRules: (fragments: string, route: string) => `[it] ${fragments} via <a href="${route}">workspace rules</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: "[it] You can't duplicate per diem expenses across workspaces because the rates may differ between workspaces.",
        cannotDuplicateDistanceExpense: "[it] You can't duplicate distance expenses across workspaces because the rates may differ between workspaces.",
        taxDisabledAlert: {
            title: '[it] Tax disabled',
            prompt: '[it] Enable tax tracking on the workspace to edit the expense details or delete the tax from this expense.',
            confirmText: '[it] Delete tax',
        },
    },
    transactionMerge: {
        listPage: {
            header: '[it] Merge expenses',
            noEligibleExpenseFound: '[it] No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `[it] <muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `[it] Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '[it] Select receipt',
            pageTitle: '[it] Select the receipt you want to keep:',
        },
        detailsPage: {
            header: '[it] Select details',
            pageTitle: '[it] Select the details you want to keep:',
            noDifferences: '[it] No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '[it] an' : '[it] a';
                return `[it] Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: '[it] Please select attendees',
            selectAllDetailsError: '[it] Select all details before continuing.',
        },
        confirmationPage: {
            header: '[it] Confirm details',
            pageTitle: "[it] Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: '[it] Merge expenses',
        },
    },
    share: {
        shareToExpensify: '[it] Share to Expensify',
        messageInputLabel: '[it] Message',
    },
    notificationPreferencesPage: {
        header: '[it] Notification preferences',
        label: '[it] Notify me about new messages',
        notificationPreferences: {
            always: '[it] Immediately',
            daily: '[it] Daily',
            mute: '[it] Mute',
            hidden: '[it][ctx: UI label indicating that something is concealed or not visible to the user.] Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "[it] The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "[it] The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: '[it] Upload photo',
        removePhoto: '[it] Remove photo',
        editImage: '[it] Edit photo',
        viewPhoto: '[it] View photo',
        imageUploadFailed: '[it] Image upload failed',
        deleteWorkspaceError: '[it] Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `[it] The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `[it] Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `[it] Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: '[it] Edit profile picture',
        upload: '[it] Upload',
        uploadPhoto: '[it] Upload photo',
        selectAvatar: '[it] Select avatar',
        choosePresetAvatar: '[it] Or choose a custom avatar',
    },
    modal: {
        backdropLabel: '[it] Modal Backdrop',
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
                        return `[it] Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] Waiting for an admin to add expenses.`;
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
                        return `[it] Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] Waiting for an admin to submit expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `[it] No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[it] Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] Waiting for an admin to add a bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[it]  on the ${eta} of each month` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[it] Waiting for your expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] Waiting for an admin's expenses to automatically submit${formattedETA}.`;
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
                        return `[it] Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] Waiting for an admin to fix the issues.`;
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
                        return `[it] Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] Waiting for an admin to approve expenses.`;
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
                        return `[it] Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] Waiting for an admin to export this report.`;
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
                        return `[it] Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] Waiting for an admin to pay expenses.`;
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
                        return `[it] Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] Waiting for an admin to finish setting up a business bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[it]  by ${eta}` : ` ${eta}`;
                }
                return `[it] Waiting for payment to complete${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `[it] Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[it] This report was rejected. Waiting on <strong>you</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[it] This report was rejected. Waiting on <strong>${actor}</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[it] This report was rejected. Waiting on an admin to fix the issues and manually resubmit.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '[it] shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '[it] later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '[it] on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '[it] on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '[it] on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '[it] on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '[it] at the end of your trip',
        },
    },
    profilePage: {
        profile: '[it] Profile',
        preferredPronouns: '[it] Preferred pronouns',
        selectYourPronouns: '[it] Select your pronouns',
        selfSelectYourPronoun: '[it] Self-select your pronoun',
        emailAddress: '[it] Email address',
        setMyTimezoneAutomatically: '[it] Set my timezone automatically',
        timezone: '[it] Timezone',
        invalidFileMessage: '[it] Invalid file. Please try a different image.',
        avatarUploadFailureMessage: '[it] An error occurred uploading the avatar. Please try again.',
        online: '[it] Online',
        offline: '[it] Offline',
        syncing: '[it] Syncing',
        profileAvatar: '[it] Profile avatar',
        publicSection: {
            title: '[it] Public',
            subtitle: '[it] These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: '[it] Private',
            subtitle: "[it] These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: '[it] Security options',
        subtitle: '[it] Enable two-factor authentication to keep your account safe.',
        goToSecurity: '[it] Go back to security page',
    },
    shareCodePage: {
        title: '[it] Your code',
        subtitle: '[it] Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: '[it] Pronouns',
        isShownOnProfile: '[it] Your pronouns are shown on your profile.',
        placeholderText: '[it] Search to see options',
    },
    contacts: {
        contactMethods: '[it] Contact methods',
        featureRequiresValidate: '[it] This feature requires you to validate your account.',
        validateAccount: '[it] Validate your account',
        helpText: ({email}: {email: string}) =>
            `[it] Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: '[it] Please verify this contact method.',
        getInTouch: "[it] We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `[it] Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '[it] Set as default',
        yourDefaultContactMethod: "[it] This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        yourDefaultContactMethodRestrictedSwitch: '[it] This is your current default contact method. Your company has restricted removing or changing it.',
        removeContactMethod: '[it] Remove contact method',
        removeAreYouSure: "[it] Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: '[it] Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: '[it] Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: '[it] Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: '[it] Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: '[it] Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: '[it] Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: '[it] This contact method already exists',
            passwordRequired: '[it] password required.',
            contactMethodRequired: '[it] Contact method is required',
            invalidContactMethod: '[it] Invalid contact method',
        },
        newContactMethod: '[it] New contact method',
        goBackContactMethods: '[it] Go back to contact methods',
    },
    pronouns: {
        coCos: '[it] Co / Cos',
        eEyEmEir: '[it] E / Ey / Em / Eir',
        faeFaer: '[it] Fae / Faer',
        heHimHis: '[it] He / Him / His',
        heHimHisTheyThemTheirs: '[it] He / Him / His / They / Them / Theirs',
        sheHerHers: '[it] She / Her / Hers',
        sheHerHersTheyThemTheirs: '[it] She / Her / Hers / They / Them / Theirs',
        merMers: '[it] Mer / Mers',
        neNirNirs: '[it] Ne / Nir / Nirs',
        neeNerNers: '[it] Nee / Ner / Ners',
        perPers: '[it] Per / Pers',
        theyThemTheirs: '[it] They / Them / Theirs',
        thonThons: '[it] Thon / Thons',
        veVerVis: '[it] Ve / Ver / Vis',
        viVir: '[it] Vi / Vir',
        xeXemXyr: '[it] Xe / Xem / Xyr',
        zeZieZirHir: '[it] Ze / Zie / Zir / Hir',
        zeHirHirs: '[it] Ze / Hir',
        callMeByMyName: '[it] Call me by my name',
    },
    displayNamePage: {
        headerTitle: '[it] Display name',
        isShownOnProfile: '[it] Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: '[it] Timezone',
        isShownOnProfile: '[it] Your timezone is shown on your profile.',
        getLocationAutomatically: '[it] Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: '[it] Update required',
        pleaseInstall: '[it] Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: '[it] Please install the latest version of Expensify',
        toGetLatestChanges: '[it] For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: '[it] The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: '[it] About',
        aboutPage: {
            description: '[it] The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: '[it] App download links',
            viewKeyboardShortcuts: '[it] View keyboard shortcuts',
            viewTheCode: '[it] View the code',
            viewOpenJobs: '[it] View open jobs',
            reportABug: '[it] Report a bug',
            troubleshoot: '[it] Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: '[it] Android',
            },
            ios: {
                label: '[it] iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '[it] Clear cache and restart',
            description:
                '[it] <muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: '[it] All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: '[it] Reset and refresh',
            clientSideLogging: '[it] Client side logging',
            noLogsToShare: '[it] No logs to share',
            useProfiling: '[it] Use profiling',
            profileTrace: '[it] Profile trace',
            results: '[it] Results',
            releaseOptions: '[it] Release options',
            testingPreferences: '[it] Testing preferences',
            useStagingServer: '[it] Use Staging Server',
            forceOffline: '[it] Force offline',
            simulatePoorConnection: '[it] Simulate poor internet connection',
            simulateFailingNetworkRequests: '[it] Simulate failing network requests',
            authenticationStatus: '[it] Authentication status',
            deviceCredentials: '[it] Device credentials',
            invalidate: '[it] Invalidate',
            destroy: '[it] Destroy',
            maskExportOnyxStateData: '[it] Mask fragile member data while exporting Onyx state',
            exportOnyxState: '[it] Export Onyx state',
            importOnyxState: '[it] Import Onyx state',
            testCrash: '[it] Test crash',
            resetToOriginalState: '[it] Reset to original state',
            usingImportedState: '[it] You are using imported state. Press here to clear it.',
            debugMode: '[it] Debug mode',
            invalidFile: '[it] Invalid file',
            invalidFileDescription: '[it] The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: '[it] Invalidate with delay',
            leftHandNavCache: '[it] Left Hand Nav cache',
            clearleftHandNavCache: '[it] Clear',
            softKillTheApp: '[it] Soft kill the app',
            kill: '[it] Kill',
            sentryDebug: '[it] Sentry debug',
            sentrySendDescription: '[it] Send data to Sentry',
            sentryDebugDescription: '[it] Log Sentry requests to console',
            sentryHighlightedSpanOps: '[it] Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: '[it] ui.interaction.click, navigation, ui.load',
        },
        security: '[it] Security',
        signOut: '[it] Sign out',
        restoreStashed: '[it] Restore stashed login',
        signOutConfirmationText: "[it] You'll lose any offline changes if you sign out.",
        versionLetter: '[it] v',
        readTheTermsAndPrivacy: `[it] Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.`,
        help: '[it] Help',
        helpPage: {
            title: '[it] Help and support',
            description: '[it] We are here to help you 24/7',
            helpSite: '[it] Help site',
            conciergeChat: '[it] Concierge',
            conciergeChatDescription: '[it] Your personal AI agent',
            accountManagerDescription: '[it] Your account manager',
            partnerManagerDescription: '[it] Your partner manager',
            guideDescription: '[it] Your setup specialist',
        },
        whatIsNew: "[it] What's new",
        accountSettings: '[it] Account settings',
        account: '[it] Account',
        general: '[it] General',
    },
    closeAccountPage: {
        closeAccount: '[it][ctx: close as a verb, not an adjective] Close account',
        reasonForLeavingPrompt: '[it] We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: '[it] Enter message here',
        closeAccountWarning: '[it] Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: '[it] Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: '[it] Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: '[it] Enter your default contact method',
        defaultContact: '[it] Default contact method:',
        enterYourDefaultContactMethod: '[it] Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: '[it] Merge accounts',
        accountDetails: {
            accountToMergeInto: (login: string) => `[it] Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: '[it] I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: '[it] Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: (login: string) => `[it] Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `[it] To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: '[it] Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: '[it] Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: '[it] Accounts merged!',
            description: (from: string, to: string) =>
                `[it] <muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '[it] We’re working on it',
            limitedSupport: '[it] We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp: '[it] <muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: '[it] Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `[it] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `[it] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `[it] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: '[it] Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `[it] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `[it] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `[it] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `[it] <muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '[it] Try again later',
            description: '[it] There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "[it] You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: '[it] You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: '[it] Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '[it] Report suspicious activity',
        lockAccount: '[it] Lock account',
        unlockAccount: '[it] Unlock account',
        unlockTitle: '[it] We’ve received your request',
        unlockDescription: '[it] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        compromisedDescription:
            '[it] Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: '[it] For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: '[it] Are you sure you want to lock your Expensify account?',
        onceLocked: '[it] Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '[it] Failed to lock account',
        failedToLockAccountDescription: `[it] We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: '[it] Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: '[it] Account locked',
        yourAccountIsLocked: '[it] Your account is locked',
        chatToConciergeToUnlock: '[it] Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: '[it] Chat with Concierge',
    },
    twoFactorAuth: {
        headerTitle: '[it] Two-factor authentication',
        twoFactorAuthEnabled: '[it] Two-factor authentication enabled',
        whatIsTwoFactorAuth: '[it] Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: '[it] Disable two-factor authentication',
        explainProcessToRemove: '[it] To disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: '[it] To disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: '[it] Two-factor authentication is now disabled',
        noAuthenticatorApp: '[it] You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: '[it] Recovery codes',
        keepCodesSafe: '[it] Keep these recovery codes safe!',
        codesLoseAccess: dedent(`
            [it] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            Note: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        errorStepCodes: '[it] Please copy or download codes before continuing',
        stepVerify: '[it] Verify',
        scanCode: '[it] Scan the QR code using your',
        authenticatorApp: '[it] authenticator app',
        addKey: '[it] Or add this secret key to your authenticator app:',
        secretKey: '[it] secret key',
        enterCode: '[it] Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: '[it] Finished',
        enabled: '[it] Two-factor authentication enabled',
        congrats: '[it] Congrats! Now you’ve got that extra security.',
        copy: '[it] Copy',
        disable: '[it] Disable',
        enableTwoFactorAuth: '[it] Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: '[it] Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: '[it] For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: '[it] Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: '[it] Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: '[it] Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: '[it] Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: '[it] Cannot disable 2FA',
        twoFactorAuthRequired: '[it] Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
        replaceDevice: '[it] Replace device',
        replaceDeviceTitle: '[it] Replace two-factor device',
        verifyOldDeviceTitle: '[it] Verify old device',
        verifyOldDeviceDescription: '[it] Enter the six-digit code from your current authenticator app to confirm you have access to it.',
        verifyNewDeviceTitle: '[it] Set up new device',
        verifyNewDeviceDescription: '[it] Scan the QR code with your new device, then enter the code to complete setup.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '[it] Please enter your recovery code',
            incorrectRecoveryCode: '[it] Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: '[it] Use recovery code',
        recoveryCode: '[it] Recovery code',
        use2fa: '[it] Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '[it] Please enter your two-factor authentication code',
            incorrect2fa: '[it] Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '[it] Password updated!',
        allSet: '[it] You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: '[it] Private notes',
        personalNoteMessage: "[it] Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: '[it] Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: '[it] Notes',
        myNote: '[it] My note',
        error: {
            genericFailureMessage: "[it] Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: '[it] Please enter a valid security code',
        },
        securityCode: '[it] Security code',
        changeBillingCurrency: '[it] Change billing currency',
        changePaymentCurrency: '[it] Change payment currency',
        paymentCurrency: '[it] Payment currency',
        paymentCurrencyDescription: '[it] Select a standardized currency that all personal expenses should be converted to',
        note: `[it] Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: '[it] Add a debit card',
        nameOnCard: '[it] Name on card',
        debitCardNumber: '[it] Debit card number',
        expiration: '[it] Expiration date',
        expirationDate: '[it] MMYY',
        cvv: '[it] CVV',
        billingAddress: '[it] Billing address',
        growlMessageOnSave: '[it] Your debit card was successfully added',
        expensifyPassword: '[it] Expensify password',
        error: {
            invalidName: '[it] Name can only include letters',
            addressZipCode: '[it] Please enter a valid zip code',
            debitCardNumber: '[it] Please enter a valid debit card number',
            expirationDate: '[it] Please select a valid expiration date',
            securityCode: '[it] Please enter a valid security code',
            addressStreet: "[it] Please enter a valid billing address that's not a PO box",
            addressState: '[it] Please select a state',
            addressCity: '[it] Please enter a city',
            genericFailureMessage: '[it] An error occurred while adding your card. Please try again.',
            password: '[it] Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '[it] Add payment card',
        nameOnCard: '[it] Name on card',
        paymentCardNumber: '[it] Card number',
        expiration: '[it] Expiration date',
        expirationDate: '[it] MM/YY',
        cvv: '[it] CVV',
        billingAddress: '[it] Billing address',
        growlMessageOnSave: '[it] Your payment card was successfully added',
        expensifyPassword: '[it] Expensify password',
        error: {
            invalidName: '[it] Name can only include letters',
            addressZipCode: '[it] Please enter a valid zip code',
            paymentCardNumber: '[it] Please enter a valid card number',
            expirationDate: '[it] Please select a valid expiration date',
            securityCode: '[it] Please enter a valid security code',
            addressStreet: "[it] Please enter a valid billing address that's not a PO box",
            addressState: '[it] Please select a state',
            addressCity: '[it] Please enter a city',
            genericFailureMessage: '[it] An error occurred while adding your card. Please try again.',
            password: '[it] Please enter your Expensify password',
        },
    },
    personalCard: {
        addPersonalCard: '[it] Add personal card',
        addCompanyCard: '[it] Add company card',
        lookingForCompanyCards: '[it] Need to add company cards?',
        lookingForCompanyCardsDescription: '[it] Bring your own cards from 10,000+ banks worldwide.',
        personalCardAdded: '[it] Personal card added!',
        personalCardAddedDescription: '[it] Congrats, we’ll begin importing transactions from your card.',
        isPersonalCard: '[it] Is this a personal card?',
        thisIsPersonalCard: '[it] This is a personal card',
        thisIsCompanyCard: '[it] This is a company card',
        askAdmin: '[it] Ask your admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `[it] If so, great! But if it's a <strong>company</strong> card, please ${isAdmin ? '[it] assign it from your workspace instead.' : '[it] ask your admin to assign it to you from the workspace instead.'}`,
        bankConnectionError: '[it] Bank connection issue',
        bankConnectionDescription: '[it] Please try adding your cards again. Otherwise, you can',
        connectWithPlaid: '[it] connect via Plaid.',
        brokenConnection: '[it] Your card connection is broken.',
        fixCard: '[it] Fix card',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `[it] Your ${cardName} card connection is broken. <a href="${connectionLink}">Log into your bank</a> to fix the card.`
                : `[it] Your ${cardName} card connection is broken. Log into your bank to fix the card.`,
        addAdditionalCards: '[it] Add additional cards',
        upgradeDescription: '[it] Need to add more cards? Create a workspace to add additional personal cards or assign company cards to the entire team.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `[it] <muted-text>This is available on the Collect plan, which is <strong>${formattedPrice}</strong> per member per month.</muted-text>`,
        note: (subscriptionLink: string) =>
            `[it] <muted-text>Create a workspace to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
        workspaceCreated: '[it] Workspace created',
        newWorkspace: '[it] You created a workspace!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `[it] <centered-text>You’re all set to add additional cards. <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
    },
    walletPage: {
        balance: '[it] Balance',
        paymentMethodsTitle: '[it] Payment methods',
        setDefaultConfirmation: '[it] Make default payment method',
        setDefaultSuccess: '[it] Default payment method set!',
        deleteAccount: '[it] Delete account',
        deleteConfirmation: '[it] Are you sure you want to delete this account?',
        deleteCard: '[it] Delete card',
        deleteCardConfirmation:
            '[it] All unsubmitted card transactions, including those on open reports, will be removed. Are you sure you want to delete this card? You cannot undo this action.',
        error: {
            notOwnerOfBankAccount: '[it] An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: '[it] This bank account is temporarily suspended',
            notOwnerOfFund: '[it] An error occurred while setting this card as your default payment method',
            setDefaultFailure: '[it] Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: '[it] An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: '[it] Get paid faster',
        addPaymentMethod: '[it] Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: '[it] Get paid back faster',
        secureAccessToYourMoney: '[it] Secure access to your money',
        receiveMoney: '[it] Receive money in your local currency',
        expensifyWallet: '[it] Expensify Wallet (Beta)',
        sendAndReceiveMoney: '[it] Send and receive money with friends. US bank accounts only.',
        enableWallet: '[it] Enable wallet',
        addBankAccountToSendAndReceive: '[it] Add a bank account to make or receive payments.',
        addDebitOrCreditCard: '[it] Add debit or credit card',
        cardInactive: '[it] Inactive',
        assignedCards: '[it] Assigned cards',
        assignedCardsDescription: '[it] Transactions from these cards sync automatically.',
        expensifyCard: '[it] Expensify Card',
        walletActivationPending: "[it] We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "[it] Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: '[it] Add your bank account',
        addBankAccountBody: "[it] Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: '[it] Choose your bank account',
        chooseAccountBody: '[it] Make sure that you select the right one.',
        confirmYourBankAccount: '[it] Confirm your bank account',
        personalBankAccounts: '[it] Personal bank accounts',
        businessBankAccounts: '[it] Business bank accounts',
        shareBankAccount: '[it] Share bank account',
        bankAccountShared: '[it] Bank account shared',
        shareBankAccountTitle: '[it] Select the admins to share this bank account with:',
        shareBankAccountSuccess: '[it] Bank account shared!',
        shareBankAccountSuccessDescription: '[it] The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: '[it] An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: '[it] No admins available',
        shareBankAccountEmptyDescription: '[it] There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: '[it] Please select an admin before continuing',
        unshareBankAccount: '[it] Unshare bank account',
        unshareBankAccountDescription: '[it] Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `[it] ${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: '[it] It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: `[it] Can't unshare bank account`,
        travelCVV: {
            title: '[it] Travel CVV',
            subtitle: '[it] Use this when booking travel',
            description: "[it] Use this card for your Expensify Travel bookings. It'll show as “Travel Card” at checkout.",
        },
        chaseAccountNumberDifferent: '[it] Why is my account number different?',
    },
    cardPage: {
        expensifyCard: '[it] Expensify Card',
        expensifyTravelCard: '[it] Expensify Travel Card',
        availableSpend: '[it] Remaining limit',
        smartLimit: {
            name: '[it] Smart limit',
            title: (formattedLimit: string) => `[it] You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: '[it] Fixed limit',
            title: (formattedLimit: string) => `[it] You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: '[it] Monthly limit',
            title: (formattedLimit: string) => `[it] You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: '[it] Virtual card number',
        travelCardCvv: '[it] Travel card CVV',
        physicalCardNumber: '[it] Physical card number',
        physicalCardPin: '[it] PIN',
        getPhysicalCard: '[it] Get physical card',
        reportFraud: '[it] Report virtual card fraud',
        reportTravelFraud: '[it] Report travel card fraud',
        reviewTransaction: '[it] Review transaction',
        suspiciousBannerTitle: '[it] Suspicious transaction',
        suspiciousBannerDescription: '[it] We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "[it] Your card is temporarily locked while our team reviews your company's account.",
        markTransactionsAsReimbursable: '[it] Mark transactions as reimbursable',
        markTransactionsDescription: '[it] When enabled, transactions imported from this card are marked as reimbursable by default.',
        csvCardDescription: '[it] CSV Import',
        cardDetails: {
            cardNumber: '[it] Virtual card number',
            expiration: '[it] Expiration',
            cvv: '[it] CVV',
            address: '[it] Address',
            revealDetails: '[it] Reveal details',
            revealCvv: '[it] Reveal CVV',
            copyCardNumber: '[it] Copy card number',
            updateAddress: '[it] Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `[it] Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: '[it] An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "[it] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[it] Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        unexpectedError: '[it] There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: '[it] Yes, I do',
            reportFraudButtonText: "[it] No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `[it] cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `[it] deactivated the card ending in ${cardLastFour}`,
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
            }) => `[it] identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?

${amount} for ${merchant} - ${date}`,
        },
        setYourPin: '[it] Set the PIN for your card.',
        confirmYourPin: '[it] Enter your PIN again to confirm.',
        changeYourPin: '[it] Enter a new PIN for your card.',
        confirmYourChangedPin: '[it] Confirm your new PIN.',
        pinMustBeFourDigits: '[it] PIN must be exactly 4 digits.',
        invalidPin: '[it] Please choose a more secure PIN.',
        pinMismatch: '[it] PINs do not match. Please try again.',
        revealPin: '[it] Reveal PIN',
        hidePin: '[it] Hide PIN',
        pin: '[it] PIN',
        pinChanged: '[it] PIN changed!',
        pinChangedHeader: '[it] PIN changed',
        pinChangedDescription: "[it] You're all set to use your PIN now.",
        changePin: '[it] Change PIN',
        changePinAtATM: '[it] Change your PIN at any ATM',
        changePinAtATMDescription: '[it] This is required in your region. <concierge-link>Reach out to Concierge</concierge-link> if you have any questions.',
        freezeCard: '[it] Freeze card',
        unfreeze: '[it] Unfreeze',
        unfreezeCard: '[it] Unfreeze card',
        askToUnfreeze: '[it] Ask to unfreeze',
        freezeDescription: '[it] A frozen card cannot be used for purchases and transactions. You can unfreeze it at any time.',
        unfreezeDescription: "[it] Unfreezing this card will start allowing purchases and transactions again. Only proceed if you're sure the card is safe to use.",
        frozen: '[it] Frozen',
        youFroze: ({date}: {date: string}) => `[it] You froze this card on ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `[it] ${person} froze this card on ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `[it] This card was frozen on ${date} by `,
        frozenByAdminNeedsUnfreezePrefix: '[it] This card was frozen by ',
        frozenByAdminNeedsUnfreezeSuffix: '[it] . Please contact an admin to unfreeze it.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `[it] This card was frozen by ${person}. Please contact an admin to unfreeze it.`,
    },
    workflowsPage: {
        workflowTitle: '[it] Spend',
        workflowDescription: '[it] Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: '[it] Submissions',
        submissionFrequencyDescription: '[it] Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: '[it] Date of month',
        disableApprovalPromptDescription: '[it] Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: '[it] Approvals',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `[it] expenses from ${members}, and the approver is ${approvers}`,
        addApprovalButton: '[it] Add approval workflow',
        findWorkflow: '[it] Find workflow',
        addApprovalTip: '[it] This default workflow applies to all members, unless a more specific workflow exists.',
        approver: '[it] Approver',
        addApprovalsDescription: '[it] Require additional approval before authorizing a payment.',
        makeOrTrackPaymentsTitle: '[it] Payments',
        makeOrTrackPaymentsDescription: '[it] Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '[it] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '[it] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: '[it] Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: '[it] Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: '[it] Instantly',
            weekly: '[it] Weekly',
            monthly: '[it] Monthly',
            twiceAMonth: '[it] Twice a month',
            byTrip: '[it] By trip',
            manually: '[it] Manually',
            daily: '[it] Daily',
            lastDayOfMonth: '[it] Last day of the month',
            lastBusinessDayOfMonth: '[it] Last business day of the month',
            ordinals: {
                one: '[it] st',
                two: '[it] nd',
                few: '[it] rd',
                other: '[it] th',
                '1': '[it] First',
                '2': '[it] Second',
                '3': '[it] Third',
                '4': '[it] Fourth',
                '5': '[it] Fifth',
                '6': '[it] Sixth',
                '7': '[it] Seventh',
                '8': '[it] Eighth',
                '9': '[it] Ninth',
                '10': '[it] Tenth',
            },
        },
        approverInMultipleWorkflows: '[it] This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `[it] <strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: '[it] No members to display',
            expensesFromSubtitle: '[it] All workspace members already belong to an existing approval workflow.',
            approverSubtitle: '[it] All approvers belong to an existing workflow.',
            bulkApproverSubtitle: '[it] No approvers match the criteria for selected reports.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "[it] Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "[it] Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: '[it] Confirm',
        header: '[it] Add more approvers and confirm.',
        additionalApprover: '[it] Additional approver',
        submitButton: '[it] Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: '[it] Edit approval workflow',
        deleteTitle: '[it] Delete approval workflow',
        deletePrompt: '[it] Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: '[it] Expenses from',
        header: '[it] When the following members submit expenses:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "[it] The approver couldn't be changed. Please try again or contact support.",
        title: '[it] Set approver',
        description: '[it] This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: '[it] Approver',
        header: '[it] (Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `[it] Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : '[it] Add another approver when a report exceeds the amount below:',
        reportAmountLabel: '[it] Report amount',
        additionalApproverLabel: '[it] Additional approver',
        skip: '[it] Skip',
        next: '[it] Next',
        removeLimit: '[it] Remove limit',
        enterAmountError: '[it] Please enter a valid amount',
        enterApproverError: '[it] Approver is required when you set a report limit',
        enterBothError: '[it] Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `[it] Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: '[it] Authorized payer',
        genericErrorMessage: '[it] The authorized payer could not be changed. Please try again.',
        admins: '[it] Admins',
        payer: '[it] Payer',
        paymentAccount: '[it] Payment account',
        shareBankAccount: {
            shareTitle: '[it] Share bank account access?',
            shareDescription: ({admin}: {admin: string}) => `[it] You'll need to share bank account access with ${admin} to make them the payer.`,
            validationTitle: '[it] Bank account awaiting validation',
            validationDescription: ({admin}: {admin: string}) =>
                `[it] You need to <a href="#">validate this bank account</a>. Once that's done, you can share bank account access with ${admin} to make them the payer.`,
            errorTitle: "[it] Can't change payer",
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `[it] ${admin} doesn't have access to this bank account, so you can't make them the payer. <a href="#">Chat with ${owner}</a> if the bank account should be shared.`,
        },
    },
    reportFraudPage: {
        title: '[it] Report virtual card fraud',
        description: '[it] If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: '[it] Deactivate card',
        reportVirtualCardFraud: '[it] Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: '[it] Card fraud reported',
        description: '[it] We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        buttonText: '[it] Got it, thanks!',
    },
    activateCardPage: {
        activateCard: '[it] Activate card',
        pleaseEnterLastFour: '[it] Please enter the last four digits of your card.',
        activatePhysicalCard: '[it] Activate physical card',
        error: {
            thatDidNotMatch: "[it] That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "[it] You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: '[it] Get physical card',
        nameMessage: '[it] Enter your first and last name, as this will be shown on your card.',
        legalName: '[it] Legal name',
        legalFirstName: '[it] Legal first name',
        legalLastName: '[it] Legal last name',
        phoneMessage: '[it] Enter your phone number.',
        phoneNumber: '[it] Phone number',
        address: '[it] Address',
        addressMessage: '[it] Enter your shipping address.',
        streetAddress: '[it] Street Address',
        city: '[it] City',
        state: '[it] State',
        zipPostcode: '[it] Zip/Postcode',
        country: '[it] Country',
        confirmMessage: '[it] Please confirm your details below.',
        estimatedDeliveryMessage: '[it] Your physical card will arrive in 2-3 business days.',
        next: '[it] Next',
        getPhysicalCard: '[it] Get physical card',
        shipCard: '[it] Ship card',
    },
    transferAmountPage: {
        transfer: (amount: string) => `[it] Transfer${amount ? ` ${amount}` : ''}`,
        instant: '[it] Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `[it] ${rate}% fee (${minAmount} minimum)`,
        ach: '[it] 1-3 Business days (Bank account)',
        achSummary: '[it] No fee',
        whichAccount: '[it] Which account?',
        fee: '[it] Fee',
        transferSuccess: '[it] Transfer successful!',
        transferDetailBankAccount: '[it] Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: '[it] Your money should arrive immediately.',
        failedTransfer: '[it] Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: '[it] Please transfer your balance from the wallet page',
        goToWallet: '[it] Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: '[it] Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: '[it] Add payment method',
        addNewDebitCard: '[it] Add new debit card',
        addNewBankAccount: '[it] Add new bank account',
        accountLastFour: '[it] Ending in',
        cardLastFour: '[it] Card ending in',
        addFirstPaymentMethod: '[it] Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: '[it] Default',
        bankAccountLastFour: (lastFour: string) => `[it] Bank Account • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '[it] Expense rules',
        subtitle: '[it] These rules will apply to your expenses.',
        findRule: '[it] Find rule',
        emptyRules: {
            title: "[it] You haven't created any rules",
            subtitle: '[it] Add a rule to automate expense reporting.',
        },
        changes: {
            billableUpdate: (value: boolean) => `[it] Update expense ${value ? '[it] billable' : '[it] non-billable'}`,
            categoryUpdate: (value: string) => `[it] Update category to "${value}"`,
            commentUpdate: (value: string) => `[it] Update description to "${value}"`,
            merchantUpdate: (value: string) => `[it] Update merchant to "${value}"`,
            reimbursableUpdate: (value: boolean) => `[it] Update expense ${value ? '[it] reimbursable' : '[it] non-reimbursable'}`,
            tagUpdate: (value: string) => `[it] Update tag to "${value}"`,
            taxUpdate: (value: string) => `[it] Update tax rate to "${value}"`,
            billable: (value: boolean) => `[it] expense ${value ? '[it] billable' : '[it] non-billable'}`,
            category: (value: string) => `[it] category to "${value}"`,
            comment: (value: string) => `[it] description to "${value}"`,
            merchant: (value: string) => `[it] merchant to "${value}"`,
            reimbursable: (value: boolean) => `[it] expense ${value ? '[it] reimbursable' : '[it] non-reimbursable'}`,
            tag: (value: string) => `[it] tag to "${value}"`,
            tax: (value: string) => `[it] tax rate to "${value}"`,
            report: (value: string) => `[it] add to a report named "${value}"`,
        },
        newRule: '[it] New rule',
        addRule: {
            title: '[it] Add rule',
            expenseContains: '[it] If expense contains:',
            applyUpdates: '[it] Then apply these updates:',
            merchantHint: '[it] Type . to create a rule that applies to all merchants',
            addToReport: '[it] Add to a report named',
            createReport: '[it] Create report if necessary',
            applyToExistingExpenses: '[it] Apply to existing matching expenses',
            confirmError: '[it] Enter merchant and apply at least one update',
            confirmErrorMerchant: '[it] Please enter merchant',
            confirmErrorUpdate: '[it] Please apply at least one update',
            saveRule: '[it] Save rule',
        },
        editRule: {
            title: '[it] Edit rule',
        },
        deleteRule: {
            deleteSingle: '[it] Delete rule',
            deleteMultiple: '[it] Delete rules',
            deleteSinglePrompt: '[it] Are you sure you want to delete this rule?',
            deleteMultiplePrompt: '[it] Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: '[it] App preferences',
        },
        testSection: {
            title: '[it] Test preferences',
            subtitle: '[it] Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '[it] Receive relevant feature updates and Expensify news',
        muteAllSounds: '[it] Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: '[it] Priority mode',
        explainerText: '[it] Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: '[it] Most recent',
                description: '[it] Show all chats sorted by most recent',
            },
            gsd: {
                label: '[it] #focus',
                description: '[it] Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `[it] in ${policyName}`,
        generatingPDF: '[it] Generate PDF',
        waitForPDF: '[it] Please wait while we generate the PDF.',
        errorPDF: '[it] There was an error when trying to generate your PDF',
        successPDF: "[it] Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: '[it] Room description',
        roomDescriptionOptional: '[it] Room description (optional)',
        explainerText: '[it] Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: '[it] Heads up!',
        lastMemberWarning: "[it] Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: (displayName: string) => `[it] ${displayName}'s group chat`,
    },
    languagePage: {
        language: '[it] Language',
        aiGenerated: '[it] The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: '[it] Theme',
        themes: {
            dark: {
                label: '[it] Dark',
            },
            light: {
                label: '[it] Light',
            },
            system: {
                label: '[it] Use device settings',
            },
        },
        highContrastMode: '[it] High contrast mode',
        chooseThemeBelowOrSync: '[it] Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `[it] <muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `[it] Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "[it] Didn't receive a magic code?",
        enterAuthenticatorCode: '[it] Please enter your authenticator code',
        enterRecoveryCode: '[it] Please enter your recovery code',
        requiredWhen2FAEnabled: '[it] Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `[it] Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '[it] Request a new code',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `[it] Time remaining: ${timeRemaining} ${timeRemaining === 1 ? '[it] second' : '[it] seconds'}`,
        timeExpiredAnnouncement: '[it] The time has expired',
        error: {
            pleaseFillMagicCode: '[it] Please enter your magic code',
            incorrectMagicCode: '[it] Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: '[it] Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '[it] Please fill out all fields',
        pleaseFillPassword: '[it] Please enter your password',
        pleaseFillTwoFactorAuth: '[it] Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: '[it] Enter your two-factor authentication code to continue',
        forgot: '[it] Forgot?',
        requiredWhen2FAEnabled: '[it] Required when 2FA is enabled',
        error: {
            incorrectPassword: '[it] Incorrect password. Please try again.',
            incorrectLoginOrPassword: '[it] Incorrect login or password. Please try again.',
            incorrect2fa: '[it] Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: '[it] You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: '[it] Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                '[it] We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: '[it] You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: '[it] Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: '[it] Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: '[it] Phone or email',
        error: {
            invalidFormatEmailLogin: '[it] The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "[it] Couldn't retrieve account details. Please try to sign in again.",
        loginForm: '[it] Login form',
        notYou: (user: string) => `[it] Not ${user}?`,
    },
    onboarding: {
        welcome: '[it] Welcome!',
        welcomeSignOffTitleManageTeam: '[it] Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "[it] It's great to meet you!",
        explanationModal: {
            title: '[it] Welcome to Expensify',
            description: '[it] One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: '[it] To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: '[it] Get started',
        whatsYourName: "[it] What's your name?",
        peopleYouMayKnow: '[it] People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: (domain: string, email: string) => `[it] Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '[it] Join a workspace',
        listOfWorkspaces: "[it] Here's the list of workspaces you can join. Don't worry, you can always join them later if you prefer.",
        skipForNow: '[it] Skip for now',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `[it] ${employeeCount} member${employeeCount > 1 ? '[it] s' : ''} • ${policyOwner}`,
        whereYouWork: '[it] Where do you work?',
        errorSelection: '[it] Select an option to move forward',
        purpose: {
            title: '[it] What do you want to do today?',
            errorContinue: '[it] Please press continue to get set up',
            errorBackButton: '[it] Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '[it] Get paid back by my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "[it] Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '[it] Track and budget expenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '[it] Chat and split expenses with friends',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '[it] Something else',
        },
        employees: {
            title: '[it] How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL]: '[it] 1-4 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM]: '[it] 5-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '[it] 1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '[it] 11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '[it] 51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '[it] 101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '[it] More than 1,000 employees',
        },
        accounting: {
            title: '[it] Do you use any accounting software?',
            none: '[it] None',
        },
        interestedFeatures: {
            title: '[it] What features are you interested in?',
            featuresAlreadyEnabled: '[it] Here are our most popular features:',
            featureYouMayBeInterestedIn: '[it] Enable additional features:',
        },
        error: {
            requiredFirstName: '[it] Please input your first name to continue',
        },
        workEmail: {
            title: '[it] What’s your work email?',
            subtitle: '[it] Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: '[it] Forward to receipts@expensify.com for scanning',
                descriptionTwo: '[it] Join your colleagues already using Expensify',
                descriptionThree: '[it] Enjoy a more customized experience',
            },
            addWorkEmail: '[it] Add work email',
        },
        workEmailValidation: {
            title: '[it] Verify your work email',
            magicCodeSent: (workEmail: string | undefined) => `[it] Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: '[it] Please enter a valid work email from a private domain e.g. mitch@company.com',
            sameAsSignupEmail: '[it] Please enter a different email than the one you signed up with',
            offline: '[it] We couldn’t add your work email as you appear to be offline',
        },
        mergeBlockScreen: {
            title: '[it] Couldn’t add work email',
            subtitle: (workEmail: string | undefined) => `[it] We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[it] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[it] [Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[it] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[it] Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: '[it] Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [it] *Add expense approvals* to review your team's spend and keep it under control.

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
                title: ({workspaceConfirmationLink}) => `[it] [Create](${workspaceConfirmationLink}) a workspace`,
                description: '[it] Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[it] Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [it] *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[it] Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        [it] *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '[it] Submit an expense',
                description: dedent(`
                    [it] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: '[it] Submit an expense',
                description: dedent(`
                    [it] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: '[it] Track an expense',
                description: dedent(`
                    [it] *Track an expense* in any currency, whether you have a receipt or not.

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
                    `[it] Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '[it]  to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[it] your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        [it] Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[it] your' : '[it] to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        [Take me to accounting](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[it] Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        [it] Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[it] Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [it] *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[it] Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        [it] *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[it] Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [it] Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

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
                title: ({workspaceMembersLink}) => `[it] Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [it] *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: '[it] Start a chat',
                description: dedent(`
                    [it] *Start a chat* with anyone using their email or phone number.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },
            splitExpenseTask: {
                title: '[it] Split an expense',
                description: dedent(`
                    [it] *Split expenses* with one or more people.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[it] Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [it] Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: '[it] Create your first report',
                description: dedent(`
                    [it] Here's how to create a report:

                    1. Click the *+* button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[it] Take a [test drive](${testDriveURL})` : '[it] Take a test drive'),
            embeddedDemoIframeTitle: '[it] Test Drive',
            employeeFakeReceipt: {
                description: '[it] My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '[it] Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: '[it] Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        [it] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        [it] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage: '[it] To make the most of your 30-day free trial, follow the remaining steps below:',
            onboardingChatSplitMessage: '[it] Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "[it] Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingTestDriveReceiverMessage: "[it] *You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: '[it] Stay organized with a workspace',
            subtitle: '[it] Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: '[it] Track and organize receipts',
                descriptionTwo: '[it] Categorize and tag expenses',
                descriptionThree: '[it] Create and share reports',
            },
            price: (price?: string) => `[it] Try it free for 30 days, then upgrade for just <strong>${price ?? '$5'}/user/month</strong>.`,
            createWorkspace: '[it] Create workspace',
        },
        confirmWorkspace: {
            title: '[it] Confirm workspace',
            subtitle: '[it] Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: '[it] Invite members',
            subtitle: '[it] Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "[it] Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '[it] Name cannot contain special characters',
            containsReservedWord: '[it] Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: '[it] Name cannot contain a comma or semicolon',
            requiredFirstName: '[it] First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "[it] What's your legal name?",
        enterDateOfBirth: "[it] What's your date of birth?",
        enterAddress: "[it] What's your address?",
        enterPhoneNumber: "[it] What's your phone number?",
        personalDetails: '[it] Personal details',
        privateDataMessage: '[it] These details are used for travel and payments. They are never shown on your public profile.',
        legalName: '[it] Legal name',
        legalFirstName: '[it] Legal first name',
        legalLastName: '[it] Legal last name',
        address: '[it] Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `[it] Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `[it] Date should be after ${dateString}`,
            hasInvalidCharacter: '[it] Name can only include Latin characters',
            cannotIncludeCommaOrSemicolon: '[it] Name cannot contain a comma or semicolon',
            incorrectZipFormat: (zipFormat?: string) => `[it] Incorrect zip code format${zipFormat ? `[it]  Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `[it] Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '[it] Link has been re-sent',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `[it] I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: '[it] Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) => `[it] To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `[it] If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '[it] Unlink',
        linkSent: '[it] Link sent!',
        successfullyUnlinkedLogin: '[it] Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) => `[it] Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `[it] <strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `[it] <strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `[it] Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: '[it] Something went wrong...',
        subtitle: `[it] We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: '[it] Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `[it] We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: '[it] Your number has been validated! Click below to send a new magic sign-in code.',
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
                return '[it] Please wait a moment before trying again.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '[it] day' : '[it] days'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '[it] hour' : '[it] hours'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '[it] minute' : '[it] minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `[it] Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: '[it] Join',
    },
    detailsPage: {
        localTime: '[it] Local time',
    },
    newChatPage: {
        startGroup: '[it] Start group',
        addToGroup: '[it] Add to group',
        addUserToGroup: (username: string) => `[it] Add ${username} to group`,
    },
    yearPickerPage: {
        year: '[it] Year',
        selectYear: '[it] Please select a year',
    },
    monthPickerPage: {
        month: '[it] Month',
        selectMonth: '[it] Please select a month',
    },
    focusModeUpdateModal: {
        title: '[it] Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `[it] Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '[it] The chat you are looking for cannot be found.',
        getMeOutOfHere: '[it] Get me out of here',
        iouReportNotFound: '[it] The payment details you are looking for cannot be found.',
        notHere: "[it] Hmm... it's not here",
        pageNotFound: '[it] Oops, this page cannot be found',
        noAccess: '[it] This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: '[it] Go back to home page',
        commentYouLookingForCannotBeFound: '[it] The comment you are looking for cannot be found.',
        goToChatInstead: '[it] Go to the chat instead.',
        contactConcierge: '[it] For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `[it] Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: '[it] Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "[it] That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: '[it] Status',
        statusExplanation: "[it] Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: '[it] Today',
        clearStatus: '[it] Clear status',
        save: '[it] Save',
        message: '[it] Message',
        timePeriods: {
            never: '[it] Never',
            thirtyMinutes: '[it] 30 minutes',
            oneHour: '[it] 1 hour',
            afterToday: '[it] Today',
            afterWeek: '[it] A week',
            custom: '[it] Custom',
        },
        untilTomorrow: '[it] Until tomorrow',
        untilTime: (time: string) => `[it] Until ${time}`,
        date: '[it] Date',
        time: '[it] Time',
        clearAfter: '[it] Clear after',
        whenClearStatus: '[it] When should we clear your status?',
        setVacationDelegate: `[it] Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        cannotSetVacationDelegate: `[it] You can't set a vacation delegate because you're currently the delegate for the following members:`,
        vacationDelegateError: '[it] There was an error updating your vacation delegate.',
        asVacationDelegate: (nameOrEmail: string) => `[it] as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `[it] to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `[it] You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `[it] Step ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '[it] Bank info',
        confirmBankInfo: '[it] Confirm bank info',
        manuallyAdd: '[it] Manually add your bank account',
        letsDoubleCheck: "[it] Let's double check that everything looks right.",
        accountEnding: '[it] Account ending in',
        thisBankAccount: '[it] This bank account will be used for business payments on your workspace',
        accountNumber: '[it] Account number',
        routingNumber: '[it] Routing number',
        chooseAnAccountBelow: '[it] Choose an account below',
        addBankAccount: '[it] Add bank account',
        chooseAnAccount: '[it] Choose an account',
        connectOnlineWithPlaid: '[it] Log into your bank',
        connectManually: '[it] Connect manually',
        desktopConnection: '[it] Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: '[it] Your data is secure',
        toGetStarted: '[it] Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: '[it] Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: '[it] Your routing number and account number can be found on a check for the account.',
        bankAccountPurposeTitle: '[it] What do you want to do with your bank account?',
        getReimbursed: '[it] Get reimbursed',
        getReimbursedDescription: '[it] By employer or others',
        makePayments: '[it] Make payments',
        makePaymentsDescription: '[it] Pay expenses or issue Expensify Cards',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `[it] To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: '[it] An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: (workspaceRoute: string) =>
            `[it] Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: '[it] Business bank account added!',
        bbaAddedDescription: "[it] It's ready to be used for payments.",
        lockedBankAccount: '[it] Locked bank account',
        unlockBankAccount: '[it] Unlock bank account',
        youCantPayThis: `[it] You can't pay this report because you have a <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">locked bank account</a>. Tap below and Concierge will help with the next steps to unlock it.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `[it] <h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `[it] Expensify Business Bank Account ${maskedAccountNumber}
Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.`,
        error: {
            youNeedToSelectAnOption: '[it] Please select an option to proceed',
            noBankAccountAvailable: "[it] Sorry, there's no bank account available",
            noBankAccountSelected: '[it] Please choose an account',
            taxID: '[it] Please enter a valid tax ID number',
            website: '[it] Please enter a valid website',
            zipCode: `[it] Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '[it] Please enter a valid phone number',
            email: '[it] Please enter a valid email address',
            companyName: '[it] Please enter a valid business name',
            addressCity: '[it] Please enter a valid city',
            addressStreet: '[it] Please enter a valid street address',
            addressState: '[it] Please select a valid state',
            incorporationDateFuture: "[it] Incorporation date can't be in the future",
            incorporationState: '[it] Please select a valid state',
            industryCode: '[it] Please enter a valid industry classification code with six digits',
            restrictedBusiness: "[it] Please confirm the business isn't on the list of restricted businesses",
            routingNumber: '[it] Please enter a valid routing number',
            accountNumber: '[it] Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "[it] Routing and account numbers can't match",
            companyType: '[it] Please select a valid company type',
            tooManyAttempts: '[it] Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: '[it] Please enter a valid address',
            dob: '[it] Please select a valid date of birth',
            age: '[it] Must be over 18 years old',
            ssnLast4: '[it] Please enter valid last 4 digits of SSN',
            firstName: '[it] Please enter a valid first name',
            lastName: '[it] Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: '[it] Please add a default deposit account or debit card',
            validationAmounts: '[it] The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: '[it] Please enter a valid full name',
            ownershipPercentage: '[it] Please enter a valid percentage number',
            deletePaymentBankAccount:
                "[it] This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: '[it] The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "[it] Where's your bank account located?",
        accountDetailsStepHeader: '[it] What are your account details?',
        accountTypeStepHeader: '[it] What type of account is this?',
        bankInformationStepHeader: '[it] What are your bank details?',
        accountHolderInformationStepHeader: '[it] What are the account holder details?',
        howDoWeProtectYourData: '[it] How do we protect your data?',
        currencyHeader: "[it] What's your bank account's currency?",
        confirmationStepHeader: '[it] Check your info.',
        confirmationStepSubHeader: '[it] Double check the details below, and check the terms box to confirm.',
        toGetStarted: '[it] Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
    },
    addPersonalBankAccountPage: {
        enterPassword: '[it] Enter Expensify password',
        alreadyAdded: '[it] This account has already been added.',
        chooseAccountLabel: '[it] Account',
        successTitle: '[it] Personal bank account added!',
        successMessage: '[it] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: '[it] Unknown filename',
        passwordRequired: '[it] Please enter a password',
        passwordIncorrect: '[it] Incorrect password. Please try again.',
        failedToLoadPDF: '[it] Failed to load PDF file',
        pdfPasswordForm: {
            title: '[it] Password protected PDF',
            infoText: '[it] This PDF is password protected.',
            beforeLinkText: '[it] Please',
            linkText: '[it] enter the password',
            afterLinkText: '[it] to view it.',
            formLabel: '[it] View PDF',
        },
        attachmentNotFound: '[it] Attachment not found',
        retry: '[it] Retry',
    },
    messages: {
        errorMessageInvalidPhone: `[it] Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '[it] Invalid email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `[it] ${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `[it] ${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '[it] By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: '[it] Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `[it] <muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: '[it] Try again',
        verifyIdentity: '[it] Verify identity',
        letsVerifyIdentity: "[it] Let's verify your identity",
        butFirst: `[it] But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '[it] An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: '[it] Enable camera access',
        cameraRequestMessage: '[it] We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: '[it] Enable microphone access',
        microphoneRequestMessage: '[it] We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: '[it] Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: '[it] Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "[it] There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "[it] There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "[it] Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "[it] Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: '[it] Additional details',
        helpText: '[it] We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: '[it] We need to ask you just a few more questions to finish validating your identity.',
        helpLink: '[it] Learn more about why we need this.',
        legalFirstNameLabel: '[it] Legal first name',
        legalMiddleNameLabel: '[it] Legal middle name',
        legalLastNameLabel: '[it] Legal last name',
        selectAnswer: '[it] Please select a response to proceed',
        ssnFull9Error: '[it] Please enter a valid nine-digit SSN',
        needSSNFull9: "[it] We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "[it] We couldn't verify",
        pleaseFixIt: '[it] Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `[it] We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: '[it] Terms and fees',
        headerTitleRefactor: '[it] Fees and terms',
        haveReadAndAgreePlain: '[it] I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `[it] I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: '[it] I agree to the Privacy and Wallet agreement.',
        agreeToThe: (walletAgreementUrl: string) =>
            `[it] I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: '[it] Enable payments',
        monthlyFee: '[it] Monthly fee',
        inactivity: '[it] Inactivity',
        noOverdraftOrCredit: '[it] No overdraft/credit feature.',
        electronicFundsWithdrawal: '[it] Electronic funds withdrawal',
        standard: '[it] Standard',
        reviewTheFees: '[it] Take a look at some fees.',
        checkTheBoxes: '[it] Please check the boxes below.',
        agreeToTerms: '[it] Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `[it] The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: '[it] Per purchase',
            atmWithdrawal: '[it] ATM withdrawal',
            cashReload: '[it] Cash reload',
            inNetwork: '[it] in-network',
            outOfNetwork: '[it] out-of-network',
            atmBalanceInquiry: '[it] ATM balance inquiry (in-network or out-of-network)',
            customerService: '[it] Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: '[it] Inactivity (after 12 months with no transactions)',
            weChargeOneFee: '[it] We charge 1 other type of fee. It is:',
            fdicInsurance: '[it] Your funds are eligible for FDIC insurance.',
            generalInfo: `[it] For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `[it] For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: '[it] Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: (amount: string) => `[it] (min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '[it] A list of all Expensify Wallet fees',
            typeOfFeeHeader: '[it] All fees',
            feeAmountHeader: '[it] Amount',
            moreDetailsHeader: '[it] Details',
            openingAccountTitle: '[it] Opening an account',
            openingAccountDetails: "[it] There's no fee to open an account.",
            monthlyFeeDetails: "[it] There's no monthly fee.",
            customerServiceTitle: '[it] Customer service',
            customerServiceDetails: '[it] There are no customer service fees.',
            inactivityDetails: "[it] There's no inactivity fee.",
            sendingFundsTitle: '[it] Sending funds to another account holder',
            sendingFundsDetails: "[it] There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "[it] There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "[it] There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                `[it]  The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `[it] Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                `[it]  Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `[it] Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `[it] For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: '[it] View printer-friendly version',
            automated: '[it] Automated',
            liveAgent: '[it] Live agent',
            instant: '[it] Instant',
            electronicFundsInstantFeeMin: (amount: string) => `[it] Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '[it] Enable payments',
        activatedTitle: '[it] Wallet activated!',
        activatedMessage: '[it] Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: '[it] Just a minute...',
        checkBackLaterMessage: "[it] We're still reviewing your information. Please check back later.",
        continueToPayment: '[it] Continue to payment',
        continueToTransfer: '[it] Continue to transfer',
    },
    companyStep: {
        headerTitle: '[it] Company information',
        subtitle: '[it] Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: '[it] Legal business name',
        companyWebsite: '[it] Company website',
        taxIDNumber: '[it] Tax ID number',
        taxIDNumberPlaceholder: '[it] 9 digits',
        companyType: '[it] Company type',
        incorporationDate: '[it] Incorporation date',
        incorporationState: '[it] Incorporation state',
        industryClassificationCode: '[it] Industry classification code',
        confirmCompanyIsNot: '[it] I confirm that this company is not on the',
        listOfRestrictedBusinesses: '[it] list of restricted businesses',
        incorporationDatePlaceholder: '[it] Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '[it] LLC',
            CORPORATION: '[it] Corp',
            PARTNERSHIP: '[it] Partnership',
            COOPERATIVE: '[it] Cooperative',
            SOLE_PROPRIETORSHIP: '[it] Sole proprietorship',
            OTHER: '[it] Other',
        },
        industryClassification: '[it] Which industry is the business classified under?',
        industryClassificationCodePlaceholder: '[it] Search for industry classification code',
    },
    requestorStep: {
        headerTitle: '[it] Personal information',
        learnMore: '[it] Learn more',
        isMyDataSafe: '[it] Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: '[it] Personal info',
        enterYourLegalFirstAndLast: "[it] What's your legal name?",
        legalFirstName: '[it] Legal first name',
        legalLastName: '[it] Legal last name',
        legalName: '[it] Legal name',
        enterYourDateOfBirth: "[it] What's your date of birth?",
        enterTheLast4: '[it] What are the last four digits of your Social Security Number?',
        dontWorry: "[it] Don't worry, we don't do any personal credit checks!",
        last4SSN: '[it] Last 4 of SSN',
        enterYourAddress: "[it] What's your address?",
        address: '[it] Address',
        letsDoubleCheck: "[it] Let's double check that everything looks right.",
        byAddingThisBankAccount: "[it] By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: '[it] What’s your legal name?',
        whatsYourDOB: '[it] What’s your date of birth?',
        whatsYourAddress: '[it] What’s your address?',
        whatsYourSSN: '[it] What are the last four digits of your Social Security Number?',
        noPersonalChecks: '[it] Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: '[it] What’s your phone number?',
        weNeedThisToVerify: '[it] We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: '[it] Company info',
        enterTheNameOfYourBusiness: "[it] What's the name of your company?",
        businessName: '[it] Legal company name',
        enterYourCompanyTaxIdNumber: "[it] What's your company’s Tax ID number?",
        taxIDNumber: '[it] Tax ID number',
        taxIDNumberPlaceholder: '[it] 9 digits',
        enterYourCompanyWebsite: "[it] What's your company’s website?",
        companyWebsite: '[it] Company website',
        enterYourCompanyPhoneNumber: "[it] What's your company’s phone number?",
        enterYourCompanyAddress: "[it] What's your company’s address?",
        selectYourCompanyType: '[it] What type of company is it?',
        companyType: '[it] Company type',
        incorporationType: {
            LLC: '[it] LLC',
            CORPORATION: '[it] Corp',
            PARTNERSHIP: '[it] Partnership',
            COOPERATIVE: '[it] Cooperative',
            SOLE_PROPRIETORSHIP: '[it] Sole proprietorship',
            OTHER: '[it] Other',
        },
        selectYourCompanyIncorporationDate: "[it] What's your company’s incorporation date?",
        incorporationDate: '[it] Incorporation date',
        incorporationDatePlaceholder: '[it] Start date (yyyy-mm-dd)',
        incorporationState: '[it] Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '[it] Which state was your company incorporated in?',
        letsDoubleCheck: "[it] Let's double check that everything looks right.",
        companyAddress: '[it] Company address',
        listOfRestrictedBusinesses: '[it] list of restricted businesses',
        confirmCompanyIsNot: '[it] I confirm that this company is not on the',
        businessInfoTitle: '[it] Business info',
        legalBusinessName: '[it] Legal business name',
        whatsTheBusinessName: "[it] What's the business name?",
        whatsTheBusinessAddress: "[it] What's the business address?",
        whatsTheBusinessContactInformation: "[it] What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "[it] What's the Company Registration Number (CRN)?";
                default:
                    return "[it] What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[it] What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return '[it] What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return '[it] What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return '[it] What’s the Australian Business Number (ABN)?';
                default:
                    return '[it] What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "[it] What's this number?",
        whereWasTheBusinessIncorporated: '[it] Where was the business incorporated?',
        whatTypeOfBusinessIsIt: '[it] What type of business is it?',
        whatsTheBusinessAnnualPayment: "[it] What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "[it] What's your expected average reimbursement amount?",
        registrationNumber: '[it] Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[it] EIN';
                case CONST.COUNTRY.CA:
                    return '[it] BN';
                case CONST.COUNTRY.GB:
                    return '[it] VRN';
                case CONST.COUNTRY.AU:
                    return '[it] ABN';
                default:
                    return '[it] EU VAT';
            }
        },
        businessAddress: '[it] Business address',
        businessType: '[it] Business type',
        incorporation: '[it] Incorporation',
        incorporationCountry: '[it] Incorporation country',
        incorporationTypeName: '[it] Incorporation type',
        businessCategory: '[it] Business category',
        annualPaymentVolume: '[it] Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `[it] Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '[it] Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `[it] Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '[it] Select incorporation type',
        selectBusinessCategory: '[it] Select business category',
        selectAnnualPaymentVolume: '[it] Select annual payment volume',
        selectIncorporationCountry: '[it] Select incorporation country',
        selectIncorporationState: '[it] Select incorporation state',
        selectAverageReimbursement: '[it] Select average reimbursement amount',
        selectBusinessType: '[it] Select business type',
        findIncorporationType: '[it] Find incorporation type',
        findBusinessCategory: '[it] Find business category',
        findAnnualPaymentVolume: '[it] Find annual payment volume',
        findIncorporationState: '[it] Find incorporation state',
        findAverageReimbursement: '[it] Find average reimbursement amount',
        findBusinessType: '[it] Find business type',
        error: {
            registrationNumber: '[it] Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '[it] Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return '[it] Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return '[it] Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return '[it] Please provide a valid Australian Business Number (ABN)';
                    default:
                        return '[it] Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `[it] Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `[it] Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `[it] Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: '[it] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: '[it] Business owner',
        enterLegalFirstAndLastName: "[it] What's the owner's legal name?",
        legalFirstName: '[it] Legal first name',
        legalLastName: '[it] Legal last name',
        enterTheDateOfBirthOfTheOwner: "[it] What's the owner's date of birth?",
        enterTheLast4: '[it] What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: '[it] Last 4 of SSN',
        dontWorry: "[it] Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "[it] What's the owner's address?",
        letsDoubleCheck: '[it] Let’s double check that everything looks right.',
        legalName: '[it] Legal name',
        address: '[it] Address',
        byAddingThisBankAccount: "[it] By adding this bank account, you confirm that you've read, understand, and accept",
        owners: '[it] Owners',
    },
    ownershipInfoStep: {
        ownerInfo: '[it] Owner info',
        businessOwner: '[it] Business owner',
        signerInfo: '[it] Signer info',
        doYouOwn: (companyName: string) => `[it] Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `[it] Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: '[it] Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: '[it] Legal first name',
        legalLastName: '[it] Legal last name',
        whatsTheOwnersName: "[it] What's the owner's legal name?",
        whatsYourName: "[it] What's your legal name?",
        whatPercentage: '[it] What percentage of the business belongs to the owner?',
        whatsYoursPercentage: '[it] What percentage of the business do you own?',
        ownership: '[it] Ownership',
        whatsTheOwnersDOB: "[it] What's the owner's date of birth?",
        whatsYourDOB: "[it] What's your date of birth?",
        whatsTheOwnersAddress: "[it] What's the owner's address?",
        whatsYourAddress: "[it] What's your address?",
        whatAreTheLast: "[it] What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: '[it] What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: '[it] What is your country of citizenship?',
        whatsTheOwnersNationality: "[it] What's the owner's country of citizenship?",
        countryOfCitizenship: '[it] Country of citizenship',
        dontWorry: "[it] Don't worry, we don't do any personal credit checks!",
        last4: '[it] Last 4 of SSN',
        whyDoWeAsk: '[it] Why do we ask for this?',
        letsDoubleCheck: '[it] Let’s double check that everything looks right.',
        legalName: '[it] Legal name',
        ownershipPercentage: '[it] Ownership percentage',
        areThereOther: (companyName: string) => `[it] Are there other individuals who own 25% or more of ${companyName}?`,
        owners: '[it] Owners',
        addCertified: '[it] Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart: '[it] Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: '[it] Upload entity ownership chart',
        noteEntity: '[it] Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: '[it] Certified entity ownership chart',
        selectCountry: '[it] Select country',
        findCountry: '[it] Find country',
        address: '[it] Address',
        chooseFile: '[it] Choose file',
        uploadDocuments: '[it] Upload additional documentation',
        pleaseUpload: '[it] Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: '[it] Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: '[it] Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "[it] Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: '[it] Copy of ID for beneficial owner',
        copyOfIDDescription: "[it] Examples: Passport, driver's license, etc.",
        proofOfAddress: '[it] Address proof for beneficial owner',
        proofOfAddressDescription: '[it] Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: '[it] Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            '[it] Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: '[it] Complete verification',
        confirmAgreements: '[it] Please confirm the agreements below.',
        certifyTrueAndAccurate: '[it] I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: '[it] Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: '[it] I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: '[it] You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: '[it] terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '[it] Validate your bank account',
        validateButtonText: '[it] Validate',
        validationInputLabel: '[it] Transaction',
        maxAttemptsReached: '[it] Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `[it] Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '[it] Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: '[it] Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: '[it] Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: '[it] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: '[it] Secure your account',
    },
    countryStep: {
        confirmBusinessBank: '[it] Confirm business bank account currency and country',
        confirmCurrency: '[it] Confirm currency and country',
        yourBusiness: '[it] Your business bank account currency must match your workspace currency.',
        youCanChange: '[it] You can change your workspace currency in your',
        findCountry: '[it] Find country',
        selectCountry: '[it] Select country',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `[it] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> so you can invite a director to sign in a later step.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '[it] What are your business bank account details?',
        letsDoubleCheck: '[it] Let’s double check that everything looks fine.',
        thisBankAccount: '[it] This bank account will be used for business payments on your workspace',
        accountNumber: '[it] Account number',
        accountHolderNameDescription: "[it] Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: '[it] Signer info',
        areYouDirector: (companyName: string) => `[it] Are you a director at ${companyName}?`,
        regulationRequiresUs: '[it] Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "[it] What's your legal name",
        fullName: '[it] Legal full name',
        whatsYourJobTitle: "[it] What's your job title?",
        jobTitle: '[it] Job title',
        whatsYourDOB: "[it] What's your date of birth?",
        uploadID: '[it] Upload ID and proof of address',
        personalAddress: '[it] Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: '[it] Let’s double check that everything looks right.',
        legalName: '[it] Legal name',
        proofOf: '[it] Proof of personal address',
        enterOneEmail: (companyName: string) => `[it] Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: '[it] Regulation requires at least one more director as a signer.',
        hangTight: '[it] Hang tight...',
        enterTwoEmails: (companyName: string) => `[it] Enter the emails of two directors at ${companyName}`,
        sendReminder: '[it] Send a reminder',
        chooseFile: '[it] Choose file',
        weAreWaiting: "[it] We're waiting for others to verify their identities as directors of the business.",
        id: '[it] Copy of ID',
        proofOfDirectors: '[it] Proof of director(s)',
        proofOfDirectorsDescription: '[it] Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: '[it] Codice Fiscale',
        codiceFiscaleDescription: '[it] Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: '[it] PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            [it] Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: '[it] Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: '[it] Enter signer info',
        thisStep: '[it] This step has been completed',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `[it] is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: '[it] Emails must be different',
            connectToWorkspace: (workspaceRoute: string) => `[it] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> to invite a director to sign.`,
        },
    },
    agreementsStep: {
        agreements: '[it] Agreements',
        pleaseConfirm: '[it] Please confirm the agreements below',
        regulationRequiresUs: '[it] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: '[it] I am authorized to use the business bank account for business spend.',
        iCertify: '[it] I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `[it] I accept the <a href="https://www.corpay.com/cross-border/terms">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: '[it] I accept the terms and conditions.',
        accept: '[it] Accept and add bank account',
        iConsentToThePrivacyNotice: '[it] I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: '[it] I consent to the privacy notice.',
        error: {
            authorized: '[it] You must be a controlling officer with authorization to operate the business bank account',
            certify: '[it] Please certify that the information is true and accurate',
            consent: '[it] Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: '[it] Docusign Form',
        pleaseComplete:
            '[it] Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: '[it] Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            '[it] Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: '[it] Take me to Docusign',
        uploadAdditional: '[it] Upload additional documentation',
        pleaseUpload: '[it] Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: '[it] Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "[it] Let's finish in chat!",
        thanksFor:
            "[it] Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: '[it] I have a question',
        enable2FA: '[it] Enable two-factor authentication (2FA) to prevent fraud',
        weTake: '[it] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: '[it] Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '[it] One moment',
        explanationLine: "[it] We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "[it] Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: '[it] Book travel',
        title: '[it] Travel smart',
        subtitle: '[it] Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: '[it] Save money on your bookings',
            alerts: '[it] Get realtime alerts if your travel plans change',
        },
        bookTravel: '[it] Book travel',
        bookDemo: '[it] Book demo',
        bookADemo: '[it] Book a demo',
        toLearnMore: '[it]  to learn more.',
        termsAndConditions: {
            header: '[it] Before we continue...',
            title: '[it] Terms & conditions',
            label: '[it] I agree to the terms & conditions',
            subtitle: `[it] Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: '[it] You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                '[it] You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: '[it] Flight',
        flightDetails: {
            passenger: '[it] Passenger',
            layover: (layover: string) => `[it] <muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: '[it] Take-off',
            landing: '[it] Landing',
            seat: '[it] Seat',
            class: '[it] Cabin Class',
            recordLocator: '[it] Record locator',
            cabinClasses: {
                unknown: '[it] Unknown',
                economy: '[it] Economy',
                premiumEconomy: '[it] Premium Economy',
                business: '[it] Business',
                first: '[it] First',
            },
        },
        hotel: '[it] Hotel',
        hotelDetails: {
            guest: '[it] Guest',
            checkIn: '[it] Check-in',
            checkOut: '[it] Check-out',
            roomType: '[it] Room type',
            cancellation: '[it] Cancellation policy',
            cancellationUntil: '[it] Free cancellation until',
            confirmation: '[it] Confirmation number',
            cancellationPolicies: {
                unknown: '[it] Unknown',
                nonRefundable: '[it] Non-refundable',
                freeCancellationUntil: '[it] Free cancellation until',
                partiallyRefundable: '[it] Partially refundable',
            },
        },
        car: '[it] Car',
        carDetails: {
            rentalCar: '[it] Car rental',
            pickUp: '[it] Pick-up',
            dropOff: '[it] Drop-off',
            driver: '[it] Driver',
            carType: '[it] Car type',
            cancellation: '[it] Cancellation policy',
            cancellationUntil: '[it] Free cancellation until',
            freeCancellation: '[it] Free cancellation',
            confirmation: '[it] Confirmation number',
        },
        train: '[it] Rail',
        trainDetails: {
            passenger: '[it] Passenger',
            departs: '[it] Departs',
            arrives: '[it] Arrives',
            coachNumber: '[it] Coach number',
            seat: '[it] Seat',
            fareDetails: '[it] Fare details',
            confirmation: '[it] Confirmation number',
        },
        viewTrip: '[it] View trip',
        modifyTrip: '[it] Modify trip',
        tripSupport: '[it] Trip support',
        tripDetails: '[it] Trip details',
        viewTripDetails: '[it] View trip details',
        trip: '[it] Trip',
        trips: '[it] Trips',
        tripSummary: '[it] Trip summary',
        departs: '[it] Departs',
        errorMessage: '[it] Something went wrong. Please try again later.',
        phoneError: (phoneErrorMethodsRoute: string) => `[it] <rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: '[it] Domain',
            subtitle: '[it] Choose a domain for Expensify Travel setup.',
            recommended: '[it] Recommended',
        },
        domainPermissionInfo: {
            title: '[it] Domain',
            restriction: (domain: string) =>
                `[it] You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `[it] If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '[it] Get started with Expensify Travel',
            message: `[it] You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: '[it] Expensify Travel has been disabled',
            message: `[it] Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "[it] We're reviewing your request...",
            message: `[it] We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: '[it] Got it',
            conciergeMessage: ({domain}: {domain: string}) => `[it] Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `[it] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[it] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[it] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[it] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `[it] The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `[it] Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[it] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `[it] Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `[it] Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `[it] Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `[it] Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: '[it] Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: (type: string, id = '') => `[it] You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `[it] The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: (type: string, id = '') => `[it] Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: (type: string) => `[it] Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `[it] Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `[it] Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `[it] Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: (type: string) => `[it] Your ${type} reservation was updated.`,
        },
        flightTo: '[it] Flight to',
        trainTo: '[it] Train to',
        carRental: '[it]  car rental',
        nightIn: '[it] night in',
        nightsIn: '[it] nights in',
    },
    proactiveAppReview: {
        title: '[it] Enjoying New Expensify?',
        description: '[it] Let us know so we can help make your expensing experience even better.',
        positiveButton: '[it] Yeah!',
        negativeButton: '[it] Not really',
    },
    workspace: {
        common: {
            card: '[it] Cards',
            expensifyCard: '[it] Expensify Card',
            companyCards: '[it] Company cards',
            personalCards: '[it] Personal cards',
            workflows: '[it] Workflows',
            workspace: '[it] Workspace',
            findWorkspace: '[it] Find workspace',
            edit: '[it] Edit workspace',
            enabled: '[it] Enabled',
            disabled: '[it] Disabled',
            everyone: '[it] Everyone',
            delete: '[it] Delete workspace',
            settings: '[it] Settings',
            reimburse: '[it] Reimbursements',
            categories: '[it] Categories',
            tags: '[it] Tags',
            customField1: '[it] Custom field 1',
            customField2: '[it] Custom field 2',
            customFieldHint: '[it] Add custom coding that applies to all spend from this member.',
            reports: '[it] Reports',
            reportFields: '[it] Report fields',
            reportTitle: '[it] Report title',
            reportField: '[it] Report field',
            taxes: '[it] Taxes',
            bills: '[it] Bills',
            invoices: '[it] Invoices',
            perDiem: '[it] Per diem',
            travel: '[it] Travel',
            members: '[it] Members',
            accounting: '[it] Accounting',
            receiptPartners: '[it] Receipt partners',
            rules: '[it] Rules',
            displayedAs: '[it] Displayed as',
            plan: '[it] Plan',
            profile: '[it] Overview',
            bankAccount: '[it] Bank account',
            testTransactions: '[it] Test transactions',
            issueAndManageCards: '[it] Issue and manage cards',
            reconcileCards: '[it] Reconcile cards',
            selectAll: '[it] Select all',
            selected: () => ({
                one: '[it] 1 selected',
                other: (count: number) => `[it] ${count} selected`,
            }),
            settlementFrequency: '[it] Settlement frequency',
            setAsDefault: '[it] Set as default workspace',
            defaultNote: `[it] Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '[it] Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: '[it] Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            deleteOpenExpensifyCardsError: '[it] Your company still has open Expensify Cards.',
            outstandingBalanceWarning:
                '[it] You have an outstanding balance that must be settled before deleting your last workspace. Please go to your subscription settings to resolve the payment.',
            settleBalance: '[it] Go to subscription',
            unavailable: '[it] Unavailable workspace',
            memberNotFound: '[it] Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `[it] You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: '[it] Go to workspace',
            duplicateWorkspace: '[it] Duplicate workspace',
            duplicateWorkspacePrefix: '[it] Duplicate',
            goToWorkspaces: '[it] Go to workspaces',
            clearFilter: '[it] Clear filter',
            workspaceName: '[it] Workspace name',
            workspaceOwner: '[it] Owner',
            keepMeAsAdmin: '[it] Keep me as an admin',
            workspaceType: '[it] Workspace type',
            workspaceAvatar: '[it] Workspace avatar',
            clientID: '[it] Client ID',
            clientIDInputHint: "[it] Enter the client's unique identifier",
            mustBeOnlineToViewMembers: '[it] You need to be online in order to view members of this workspace.',
            moreFeatures: '[it] More features',
            requested: '[it] Requested',
            distanceRates: '[it] Distance rates',
            defaultDescription: '[it] One place for all your receipts and expenses.',
            descriptionHint: '[it] Share information about this workspace with all members.',
            welcomeNote: '[it] Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: '[it] Subscription',
            markAsEntered: '[it] Mark as manually entered',
            markAsExported: '[it] Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `[it] Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "[it] Let's double check that everything looks right.",
            lineItemLevel: '[it] Line-item level',
            reportLevel: '[it] Report level',
            topLevel: '[it] Top level',
            appliedOnExport: '[it] Not imported into Expensify, applied on export',
            shareNote: {
                header: '[it] Share your workspace with other members',
                content: (adminsRoomLink: string) =>
                    `[it] Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `[it] Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '[it] Create new connection',
            reuseExistingConnection: '[it] Reuse existing connection',
            existingConnections: '[it] Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `[it] Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `[it] ${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `[it] Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: '[it] Learn more',
            memberAlternateText: '[it] Submit and approve reports.',
            adminAlternateText: '[it] Manage reports and workspace settings.',
            auditorAlternateText: '[it] View and comment on reports.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: '[it] Direct',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: '[it] None',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '[it] Indirect',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '[it] Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '[it] Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return '[it] Member';
                    default:
                        return '[it] Member';
                }
            },
            frequency: {
                manual: '[it] Manually',
                instant: '[it] Instant',
                immediate: '[it] Daily',
                trip: '[it] By trip',
                weekly: '[it] Weekly',
                semimonthly: '[it] Twice a month',
                monthly: '[it] Monthly',
            },
            budgetFrequency: {
                monthly: '[it] monthly',
                yearly: '[it] yearly',
            },
            budgetFrequencyUnit: {
                monthly: '[it] month',
                yearly: '[it] year',
            },
            budgetTypeForNotificationMessage: {
                tag: '[it] tag',
                category: '[it] category',
            },
            planType: '[it] Plan type',
            youCantDowngradeInvoicing:
                "[it] You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: '[it] Default category',
            viewTransactions: '[it] View transactions',
            policyExpenseChatName: (displayName: string) => `[it] ${displayName}'s expenses`,
            deepDiveExpensifyCard: `[it] <muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `[it] Connected to ${organizationName}` : '[it] Automate travel and meal delivery expenses across your organization.',
                sendInvites: '[it] Send invites',
                sendInvitesDescription: "[it] These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: '[it] Confirm invite',
                manageInvites: '[it] Manage invites',
                confirm: '[it] Confirm',
                allSet: '[it] All set',
                readyToRoll: "[it] You're ready to roll",
                takeBusinessRideMessage: '[it] Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: '[it] All',
                linked: '[it] Linked',
                outstanding: '[it] Outstanding',
                status: {
                    resend: '[it] Resend',
                    invite: '[it] Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '[it] Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '[it] Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '[it] Suspended',
                },
                centralBillingAccount: '[it] Central billing account',
                centralBillingDescription: '[it] Choose where to import all Uber receipts.',
                invitationFailure: '[it] Failed to invite member to Uber for Business',
                autoInvite: '[it] Invite new workspace members to Uber for Business',
                autoRemove: '[it] Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: '[it] No outstanding invites',
                    subtitle: '[it] Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `[it] <muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: '[it] Amount',
            deleteRates: () => ({
                one: '[it] Delete rate',
                other: '[it] Delete rates',
            }),
            deletePerDiemRate: '[it] Delete per diem rate',
            findPerDiemRate: '[it] Find per diem rate',
            areYouSureDelete: () => ({
                one: '[it] Are you sure you want to delete this rate?',
                other: '[it] Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: '[it] Per diem',
                subtitle: '[it] Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: '[it] Import per diem rates',
            editPerDiemRate: '[it] Edit per diem rate',
            editPerDiemRates: '[it] Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `[it] Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `[it] Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '[it] Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: '[it] Mark checks as “print later”',
            exportDescription: '[it] Configure how Expensify data exports to QuickBooks Desktop.',
            date: '[it] Export date',
            exportInvoices: '[it] Export invoices to',
            exportExpensifyCard: '[it] Export Expensify Card transactions as',
            account: '[it] Account',
            accountDescription: '[it] Choose where to post journal entries.',
            accountsPayable: '[it] Accounts payable',
            accountsPayableDescription: '[it] Choose where to create vendor bills.',
            bankAccount: '[it] Bank account',
            notConfigured: '[it] Not configured',
            bankAccountDescription: '[it] Choose where to send checks from.',
            creditCardAccount: '[it] Credit card account',
            exportDate: {
                label: '[it] Export date',
                description: '[it] Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[it] Date of last expense',
                        description: '[it] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[it] Export date',
                        description: '[it] Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[it] Submitted date',
                        description: '[it] Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "[it] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[it] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[it] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "[it] QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[it] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[it] Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[it] Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[it] Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[it] Check',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "[it] We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[it] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[it] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[it] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[it] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '[it] Choose where to send checks from.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[it] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[it] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[it] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: '[it] No accounts found',
            noAccountsFoundDescription: '[it] Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: '[it] QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "[it] Can't connect from this device",
                body1: "[it] You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "[it] Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: '[it] Open this link to connect',
                body: '[it] To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: '[it] Something went wrong',
                setupErrorBody: (conciergeLink: string) =>
                    `[it] <muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: '[it] Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: '[it] Classes',
            items: '[it] Items',
            customers: '[it] Customers/projects',
            exportCompanyCardsDescription: '[it] Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: '[it] Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: '[it] Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[it] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[it] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[it] Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: '[it] Line item level',
            reportFieldsDisplayedAsDescription: '[it] Report level',
            customersDescription: '[it] Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: '[it] Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: '[it] Auto-create entities',
                createEntitiesDescription: "[it] Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: '[it] Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: '[it] When to Export',
                description: '[it] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: '[it] Connected to',
            importDescription: '[it] Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: '[it] Classes',
            locations: '[it] Locations',
            customers: '[it] Customers/projects',
            accountsDescription: '[it] Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[it] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[it] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[it] Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: '[it] Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: '[it] Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: '[it] Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "[it] QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "[it] QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: '[it] Configure how Expensify data exports to QuickBooks Online.',
            date: '[it] Export date',
            exportInvoices: '[it] Export invoices to',
            exportExpensifyCard: '[it] Export Expensify Card transactions as',
            exportDate: {
                label: '[it] Export date',
                description: '[it] Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[it] Date of last expense',
                        description: '[it] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[it] Export date',
                        description: '[it] Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[it] Submitted date',
                        description: '[it] Date the report was submitted for approval.',
                    },
                },
            },
            receivable: '[it] Accounts receivable',
            archive: '[it] Accounts receivable archive',
            exportInvoicesDescription: '[it] Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: '[it] Set how company card purchases export to QuickBooks Online.',
            vendor: '[it] Vendor',
            defaultVendorDescription: '[it] Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: '[it] Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "[it] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[it] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[it] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: '[it] Account',
            accountDescription: '[it] Choose where to post journal entries.',
            accountsPayable: '[it] Accounts payable',
            accountsPayableDescription: '[it] Choose where to create vendor bills.',
            bankAccount: '[it] Bank account',
            notConfigured: '[it] Not configured',
            bankAccountDescription: '[it] Choose where to send checks from.',
            creditCardAccount: '[it] Credit card account',
            companyCardsLocationEnabledDescription:
                "[it] QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "[it] QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[it] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: '[it] Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: '[it] Invite employees',
                inviteEmployeesDescription: '[it] Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: '[it] Auto-create entities',
                createEntitiesDescription:
                    "[it] Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription: '[it] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: '[it] QuickBooks bill payment account',
                qboInvoiceCollectionAccount: '[it] QuickBooks invoice collections account',
                accountSelectDescription: "[it] Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "[it] Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '[it] Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[it] Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[it] Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[it] Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[it] Check',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "[it] We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[it] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[it] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '[it] Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[it] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[it] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '[it] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[it] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '[it] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[it] Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[it] Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[it] Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[it] To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[it] To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[it] To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: '[it] No accounts found',
            noAccountsFoundDescription: '[it] Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: '[it] When to Export',
                description: '[it] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Out-of-pocket expenses will export when paid',
                },
            },
            travelInvoicing: '[it] Export Expensify Travel Payable To',
            travelInvoicingVendor: '[it] Travel vendor',
            travelInvoicingPayableAccount: '[it] Travel payable account',
        },
        workspaceList: {
            joinNow: '[it] Join now',
            askToJoin: '[it] Ask to join',
        },
        xero: {
            organization: '[it] Xero organization',
            organizationDescription: "[it] Choose the Xero organization that you'd like to import data from.",
            importDescription: '[it] Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: '[it] Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[it] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[it] Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: '[it] Tracking categories',
            trackingCategoriesDescription: '[it] Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `[it] Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `[it] Choose where to map ${categoryName} when exporting to Xero.`,
            customers: '[it] Re-bill customers',
            customersDescription: '[it] Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: '[it] Choose how to handle Xero taxes in Expensify.',
            notImported: '[it] Not imported',
            notConfigured: '[it] Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: '[it] Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '[it] Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '[it] Report fields',
            },
            exportDescription: '[it] Configure how Expensify data exports to Xero.',
            purchaseBill: '[it] Purchase bill',
            exportDeepDiveCompanyCard:
                '[it] Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: '[it] Bank transactions',
            xeroBankAccount: '[it] Xero bank account',
            xeroBankAccountDescription: '[it] Choose where expenses will post as bank transactions.',
            exportExpensesDescription: '[it] Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: '[it] Purchase bill date',
            exportInvoices: '[it] Export invoices as',
            salesInvoice: '[it] Sales invoice',
            exportInvoicesDescription: '[it] Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: '[it] Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: '[it] Purchase bill status',
                reimbursedReportsDescription: '[it] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: '[it] Xero bill payment account',
                xeroInvoiceCollectionAccount: '[it] Xero invoice collections account',
                xeroBillPaymentAccountDescription: "[it] Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "[it] Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: '[it] Purchase bill date',
                description: '[it] Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[it] Date of last expense',
                        description: '[it] Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[it] Export date',
                        description: '[it] Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[it] Submitted date',
                        description: '[it] Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: '[it] Purchase bill status',
                description: '[it] Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '[it] Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '[it] Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '[it] Awaiting payment',
                },
            },
            noAccountsFound: '[it] No accounts found',
            noAccountsFoundDescription: '[it] Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: '[it] When to Export',
                description: '[it] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '[it] Preferred exporter',
            taxSolution: '[it] Tax solution',
            notConfigured: '[it] Not configured',
            exportDate: {
                label: '[it] Export date',
                description: '[it] Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[it] Date of last expense',
                        description: '[it] Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '[it] Export date',
                        description: '[it] Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '[it] Submitted date',
                        description: '[it] Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: '[it] Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '[it] Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[it] Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: '[it] Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '[it] Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[it] Vendor bills',
                },
            },
            creditCardAccount: '[it] Credit card account',
            defaultVendor: '[it] Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `[it] Set a default vendor that will apply to ${isReimbursable ? '' : '[it] non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: '[it] Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                '[it] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[it] Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: '[it] No accounts found',
            noAccountsFoundDescription: `[it] Please add the account in Sage Intacct and sync the connection again`,
            autoSync: '[it] Auto-sync',
            autoSyncDescription: '[it] Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: '[it] Invite employees',
            inviteEmployeesDescription:
                '[it] Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: '[it] Sync reimbursed reports',
            syncReimbursedReportsDescription: '[it] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: '[it] Sage Intacct payment account',
            accountingMethods: {
                label: '[it] When to Export',
                description: '[it] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Out-of-pocket expenses will export when paid',
                },
            },
        },
        netsuite: {
            subsidiary: '[it] Subsidiary',
            subsidiarySelectDescription: "[it] Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: '[it] Configure how Expensify data exports to NetSuite.',
            exportInvoices: '[it] Export invoices to',
            journalEntriesTaxPostingAccount: '[it] Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: '[it] Journal entries provincial tax posting account',
            foreignCurrencyAmount: '[it] Export foreign currency amount',
            exportToNextOpenPeriod: '[it] Export to next open period',
            nonReimbursableJournalPostingAccount: '[it] Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: '[it] Reimbursable journal posting account',
            journalPostingPreference: {
                label: '[it] Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '[it] Single, itemized entry for each report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '[it] Single entry for each expense',
                },
            },
            invoiceItem: {
                label: '[it] Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '[it] Create one for me',
                        description: '[it] We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '[it] Select existing',
                        description: "[it] We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: '[it] Export date',
                description: '[it] Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[it] Date of last expense',
                        description: '[it] Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '[it] Export date',
                        description: '[it] Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '[it] Submitted date',
                        description: '[it] Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '[it] Expense reports',
                        reimbursableDescription: '[it] Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: '[it] Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '[it] Vendor bills',
                        reimbursableDescription: dedent(`
                            [it] Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [it] Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '[it] Journal entries',
                        reimbursableDescription: dedent(`
                            [it] Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [it] Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "[it] If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: '[it] Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: '[it] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: '[it] Reimbursements account',
                reimbursementsAccountDescription: "[it] Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: '[it] Collections account',
                collectionsAccountDescription: '[it] Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: '[it] A/P approval account',
                approvalAccountDescription:
                    '[it] Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: '[it] NetSuite default',
                inviteEmployees: '[it] Invite employees and set approvals',
                inviteEmployeesDescription:
                    '[it] Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: '[it] Auto-create employees/vendors',
                enableCategories: '[it] Enable newly imported categories',
                customFormID: '[it] Custom form ID',
                customFormIDDescription:
                    '[it] By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: '[it] Out-of-pocket expense',
                customFormIDNonReimbursable: '[it] Company card expense',
                exportReportsTo: {
                    label: '[it] Expense report approval level',
                    description: '[it] Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: '[it] NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '[it] Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '[it] Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '[it] Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: '[it] When to Export',
                    description: '[it] Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[it] Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[it] Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: '[it] Vendor bill approval level',
                    description: '[it] Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: '[it] NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '[it] Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '[it] Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: '[it] Journal entry approval level',
                    description: '[it] Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: '[it] NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '[it] Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '[it] Approved for posting',
                    },
                },
                error: {
                    customFormID: '[it] Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: '[it] No accounts found',
            noAccountsFoundDescription: '[it] Please add the account in NetSuite and sync the connection again',
            noVendorsFound: '[it] No vendors found',
            noVendorsFoundDescription: '[it] Please add vendors in NetSuite and sync the connection again',
            noItemsFound: '[it] No invoice items found',
            noItemsFoundDescription: '[it] Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: '[it] No subsidiaries found',
            noSubsidiariesFoundDescription: '[it] Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: '[it] NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: '[it] Install the Expensify bundle',
                        description: '[it] In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: '[it] Enable token-based authentication',
                        description: '[it] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: '[it] Enable SOAP web services',
                        description: '[it] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: '[it] Create an access token',
                        description:
                            '[it] In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: '[it] Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: '[it] NetSuite Account ID',
                            netSuiteTokenID: '[it] Token ID',
                            netSuiteTokenSecret: '[it] Token Secret',
                        },
                        netSuiteAccountIDDescription: '[it] In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: '[it] Expense categories',
                expenseCategoriesDescription: '[it] Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: '[it] Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: '[it] Departments',
                        subtitle: '[it] Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: '[it] Classes',
                        subtitle: '[it] Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: '[it] Locations',
                        subtitle: '[it] Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: '[it] Customers/projects',
                    subtitle: '[it] Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: '[it] Import customers',
                    importJobs: '[it] Import projects',
                    customers: '[it] customers',
                    jobs: '[it] projects',
                    label: (importFields: string[], importType: string) => `${importFields.join('[it]  and ')}, ${importType}`,
                },
                importTaxDescription: '[it] Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: '[it] Choose an option below:',
                    label: (importedTypes: string[]) => `[it] Imported as ${importedTypes.join('[it]  and ')}`,
                    requiredFieldError: (fieldName: string) => `[it] Please enter the ${fieldName}`,
                    customSegments: {
                        title: '[it] Custom segments/records',
                        addText: '[it] Add custom segment/record',
                        recordTitle: '[it] Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '[it] View detailed instructions',
                        helpText: '[it]  on configuring custom segments/records.',
                        emptyTitle: '[it] Add a custom segment or custom record',
                        fields: {
                            segmentName: '[it] Name',
                            internalID: '[it] Internal ID',
                            scriptID: '[it] Script ID',
                            customRecordScriptID: '[it] Transaction column ID',
                            mapping: '[it] Displayed as',
                        },
                        removeTitle: '[it] Remove custom segment/record',
                        removePrompt: '[it] Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: '[it] custom segment name',
                            customRecordName: '[it] custom record name',
                            segmentTitle: '[it] Custom segment',
                            customSegmentAddTitle: '[it] Add custom segment',
                            customRecordAddTitle: '[it] Add custom record',
                            recordTitle: '[it] Custom record',
                            segmentRecordType: '[it] Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "[it] What's the custom segment name?",
                            customRecordNameTitle: "[it] What's the custom record name?",
                            customSegmentNameFooter: `[it] You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `[it] You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "[it] What's the internal ID?",
                            customSegmentInternalIDFooter: `[it] First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*

You can find custom segment internal IDs in NetSuite under:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the hyperlink next to *Custom Record Type*.
4. Find the internal ID in the table at the bottom.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `[it] You can find custom record internal IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the internal ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "[it] What's the script ID?",
                            customSegmentScriptIDFooter: `[it] You can find custom segment script IDs in NetSuite under: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the *Application and Sourcing* tab near the bottom, then:
    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.
    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "[it] What's the transaction column ID?",
                            customRecordScriptIDFooter: `[it] You can find custom record script IDs in NetSuite under:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the script ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '[it] How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: '[it] How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `[it] A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: '[it] Custom lists',
                        addText: '[it] Add custom list',
                        recordTitle: '[it] Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '[it] View detailed instructions',
                        helpText: '[it]  on configuring custom lists.',
                        emptyTitle: '[it] Add a custom list',
                        fields: {
                            listName: '[it] Name',
                            internalID: '[it] Internal ID',
                            transactionFieldID: '[it] Transaction field ID',
                            mapping: '[it] Displayed as',
                        },
                        removeTitle: '[it] Remove custom list',
                        removePrompt: '[it] Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: '[it] Choose a custom list',
                            transactionFieldIDTitle: "[it] What's the transaction field ID?",
                            transactionFieldIDFooter: `[it] You can find transaction field IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom list.
3. Find the transaction field ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '[it] How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `[it] A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: '[it] NetSuite employee default',
                        description: '[it] Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `[it] If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '[it] Tags',
                        description: '[it] Line-item level',
                        footerContent: (importField: string) => `[it] ${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '[it] Report fields',
                        description: '[it] Report level',
                        footerContent: (importField: string) => `[it] ${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: '[it] Sage Intacct setup',
            prerequisitesTitle: '[it] Before you connect...',
            downloadExpensifyPackage: '[it] Download the Expensify package for Sage Intacct',
            followSteps: '[it] Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: '[it] Enter your Sage Intacct credentials',
            entity: '[it] Entity',
            employeeDefault: '[it] Sage Intacct employee default',
            employeeDefaultDescription: "[it] The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "[it] Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "[it] Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: (mappingTitle: string) => `[it] Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: '[it] Expense types',
            expenseTypesDescription: '[it] Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: '[it] Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: '[it] Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: '[it] User-defined dimensions',
            addUserDefinedDimension: '[it] Add user-defined dimension',
            integrationName: '[it] Integration name',
            dimensionExists: '[it] A dimension with this name already exists.',
            removeDimension: '[it] Remove user-defined dimension',
            removeDimensionPrompt: '[it] Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: '[it] User-defined dimension',
            addAUserDefinedDimension: '[it] Add a user-defined dimension',
            detailedInstructionsLink: '[it] View detailed instructions',
            detailedInstructionsRestOfSentence: '[it]  on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '[it] 1 UDD added',
                other: (count: number) => `[it] ${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '[it] departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '[it] classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '[it] locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '[it] customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '[it] projects (jobs)';
                    default:
                        return '[it] mappings';
                }
            },
        },
        type: {
            free: '[it] Free',
            control: '[it] Control',
            collect: '[it] Collect',
        },
        companyCards: {
            addCards: '[it] Add cards',
            selectCards: '[it] Select cards',
            fromOtherWorkspaces: '[it] From other workspaces',
            addWorkEmail: '[it] Add your work email',
            addWorkEmailDescription: '[it] Please add your work email in order to use existing feeds from other workspaces.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: "[it] Couldn't load card feeds",
                workspaceFeedsCouldNotBeLoadedMessage: '[it] An error occurred while loading workspace card feeds. Please try again or contact your administrator.',
                feedCouldNotBeLoadedTitle: "[it] Couldn't load this feed",
                feedCouldNotBeLoadedMessage: '[it] An error occurred while loading this feed. Please try again or contact your administrator.',
                tryAgain: '[it] Try again',
            },
            addNewCard: {
                other: '[it] Other',
                fileImport: '[it] Import transactions from file',
                createFileFeedHelpText: `[it] <muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: '[it] Company card layout name',
                cardLayoutNameRequired: '[it] The Company card layout name is required',
                useAdvancedFields: '[it] Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: '[it] American Express Corporate Cards',
                    cdf: '[it] Mastercard Commercial Cards',
                    vcf: '[it] Visa Commercial Cards',
                    stripe: '[it] Stripe Cards',
                },
                yourCardProvider: `[it] Who's your card provider?`,
                whoIsYourBankAccount: '[it] Who’s your bank?',
                whereIsYourBankLocated: '[it] Where’s your bank located?',
                howDoYouWantToConnect: '[it] How do you want to connect to your bank?',
                learnMoreAboutOptions: `[it] <muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: '[it] Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `[it] Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: '[it] The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `[it] Enable your ${provider} feed`,
                    heading: '[it] We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: '[it] We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: '[it] We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `[it] 1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.

2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `[it] 1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.

2. Once the feed is enabled, Amex will send you a production letter.

3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `[it] 1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.

 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `[it] 1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Under Product Integrations, click Enable next to Expensify.

3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: '[it] What bank issues these cards?',
                enterNameOfBank: '[it] Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: '[it] What are the Visa feed details?',
                        processorLabel: '[it] Processor ID',
                        bankLabel: '[it] Financial institution (bank) ID',
                        companyLabel: '[it] Company ID',
                        helpLabel: '[it] Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `[it] What's the Amex delivery file name?`,
                        fileNameLabel: '[it] Delivery file name',
                        helpLabel: '[it] Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `[it] What's the Mastercard distribution ID?`,
                        distributionLabel: '[it] Distribution ID',
                        helpLabel: '[it] Where do I find the distribution ID?',
                    },
                },
                amexCorporate: '[it] Select this if the front of your cards say “Corporate”',
                amexBusiness: '[it] Select this if the front of your cards say “Business”',
                amexPersonal: '[it] Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: '[it] Please select a card provider before continuing',
                    pleaseSelectBankAccount: '[it] Please select a bank account before continuing',
                    pleaseSelectBank: '[it] Please select a bank before continuing',
                    pleaseSelectCountry: '[it] Please select a country before continuing',
                    pleaseSelectFeedType: '[it] Please select a feed type before continuing',
                },
                exitModal: {
                    title: '[it] Something not working?',
                    prompt: "[it] We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: '[it] Report issue',
                    cancelText: '[it] Skip',
                },
                csvColumns: {
                    cardNumber: '[it] Card number',
                    postedDate: '[it] Date',
                    merchant: '[it] Merchant',
                    amount: '[it] Amount',
                    currency: '[it] Currency',
                    ignore: '[it] Ignore',
                    originalTransactionDate: '[it] Original transaction date',
                    originalAmount: '[it] Original amount',
                    originalCurrency: '[it] Original currency',
                    comment: '[it] Comment',
                    category: '[it] Category',
                    tag: '[it] Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `[it] Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `[it] Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '[it] Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '[it] Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '[it] Custom day of month',
            },
            assign: '[it] Assign',
            assignCard: '[it] Assign card',
            findCard: '[it] Find card',
            cardNumber: '[it] Card number',
            commercialFeed: '[it] Commercial feed',
            feedName: (feedName: string) => `[it] ${feedName} cards`,
            deletedFeed: '[it] Deleted feed',
            deletedCard: '[it] Deleted card',
            directFeed: '[it] Direct feed',
            whoNeedsCardAssigned: '[it] Who needs a card assigned?',
            chooseTheCardholder: '[it] Choose the cardholder',
            chooseCard: '[it] Choose a card',
            chooseCardFor: (assignee: string) => `[it] Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: '[it] No active cards on this feed',
            somethingMightBeBroken:
                '[it] <muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: '[it] Choose a transaction start date',
            startDateDescription: "[it] Choose your import start date. We'll sync all transactions from this date onwards.",
            editStartDateDescription: "[it] Choose a new transaction start date. We'll sync all transactions from that date onwards, excluding those we already imported.",
            fromTheBeginning: '[it] From the beginning',
            customStartDate: '[it] Custom start date',
            customCloseDate: '[it] Custom close date',
            letsDoubleCheck: "[it] Let's double check that everything looks right.",
            confirmationDescription: "[it] We'll begin importing transactions immediately.",
            card: '[it] Card',
            cardName: '[it] Card name',
            brokenConnectionError: '[it] <rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `[it] assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '[it] company card',
            chooseCardFeed: '[it] Choose card feed',
            ukRegulation:
                '[it] Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: '[it] Card assignment failed.',
            unassignCardFailedError: '[it] Card unassignment failed.',
            cardAlreadyAssignedError: '[it] This card is already assigned to a user in another workspace.',
            importTransactions: {
                title: '[it] Import transactions from file',
                description: '[it] Please adjust the settings for your file that will be applied on import.',
                cardDisplayName: '[it] Card display name',
                currency: '[it] Currency',
                transactionsAreReimbursable: '[it] Transactions are reimbursable',
                flipAmountSign: '[it] Flip amount sign',
                importButton: '[it] Import transactions',
            },
            assignNewCards: {
                title: '[it] Assign new cards',
                description: '[it] Get the latest cards to assign from your bank',
            },
        },
        expensifyCard: {
            issueAndManageCards: '[it] Issue and manage your Expensify Cards',
            getStartedIssuing: '[it] Get started by issuing your first virtual or physical card.',
            verificationInProgress: '[it] Verification in progress...',
            verifyingTheDetails: "[it] We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                '[it] The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                '[it] Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: '[it] Issue card',
            findCard: '[it] Find card',
            newCard: '[it] New card',
            name: '[it] Name',
            lastFour: '[it] Last 4',
            limit: '[it] Limit',
            currentBalance: '[it] Current balance',
            currentBalanceDescription: '[it] Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: (settlementDate: string) => `[it] Balance will be settled on ${settlementDate}`,
            settleBalance: '[it] Settle balance',
            cardLimit: '[it] Card limit',
            remainingLimit: '[it] Remaining limit',
            requestLimitIncrease: '[it] Request limit increase',
            remainingLimitDescription:
                '[it] We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: '[it] Cash back',
            earnedCashbackDescription: '[it] Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: '[it] Issue new card',
            finishSetup: '[it] Finish setup',
            chooseBankAccount: '[it] Choose bank account',
            chooseExistingBank: '[it] Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: '[it] Account ending in',
            addNewBankAccount: '[it] Add a new bank account',
            settlementAccount: '[it] Settlement account',
            settlementAccountDescription: '[it] Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `[it] Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: '[it] Settlement frequency',
            settlementFrequencyDescription: '[it] Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo: '[it] If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            frequency: {
                daily: '[it] Daily',
                monthly: '[it] Monthly',
            },
            cardDetails: '[it] Card details',
            cardPending: ({name}: {name: string}) => `[it] Card is currently pending and will be issued once ${name}'s account is validated.`,
            virtual: '[it] Virtual',
            physical: '[it] Physical',
            deactivate: '[it] Deactivate card',
            changeCardLimit: '[it] Change card limit',
            changeLimit: '[it] Change limit',
            smartLimitWarning: (limit: number | string) => `[it] If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `[it] If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `[it] If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: '[it] Change card limit type',
            changeLimitType: '[it] Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `[it] If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `[it] If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: '[it] Add shipping details',
            issuedCard: (assignee: string) => `[it] issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `[it] issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: (assignee: string, link: string) => `[it] issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `[it] ${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `[it] ${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: (assignee: string, link: string) => `[it] ${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: '[it] card',
            replacementCard: '[it] replacement card',
            verifyingHeader: '[it] Verifying',
            bankAccountVerifiedHeader: '[it] Bank account verified',
            verifyingBankAccount: '[it] Verifying bank account...',
            verifyingBankAccountDescription: '[it] Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: '[it] Bank account verified!',
            bankAccountVerifiedDescription: '[it] You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: '[it] One more step...',
            oneMoreStepDescription: '[it] Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: '[it] Got it',
            goToConcierge: '[it] Go to Concierge',
        },
        categories: {
            deleteCategories: '[it] Delete categories',
            deleteCategoriesPrompt: '[it] Are you sure you want to delete these categories?',
            deleteCategory: '[it] Delete category',
            deleteCategoryPrompt: '[it] Are you sure you want to delete this category?',
            disableCategories: '[it] Disable categories',
            disableCategory: '[it] Disable category',
            enableCategories: '[it] Enable categories',
            enableCategory: '[it] Enable category',
            defaultSpendCategories: '[it] Default spend categories',
            spendCategoriesDescription: '[it] Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: '[it] An error occurred while deleting the category, please try again',
            categoryName: '[it] Category name',
            requiresCategory: '[it] Members must categorize all expenses',
            needCategoryForExportToIntegration: (connectionName: string) => `[it] All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: '[it] Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "[it] You haven't created any categories",
                subtitle: '[it] Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[it] <muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: '[it] An error occurred while updating the category, please try again',
            createFailureMessage: '[it] An error occurred while creating the category, please try again',
            addCategory: '[it] Add category',
            editCategory: '[it] Edit category',
            editCategories: '[it] Edit categories',
            findCategory: '[it] Find category',
            categoryRequiredError: '[it] Category name is required',
            existingCategoryError: '[it] A category with this name already exists',
            invalidCategoryName: '[it] Invalid category name',
            importedFromAccountingSoftware: '[it] The categories below are imported from your',
            payrollCode: '[it] Payroll code',
            updatePayrollCodeFailureMessage: '[it] An error occurred while updating the payroll code, please try again',
            glCode: '[it] GL code',
            updateGLCodeFailureMessage: '[it] An error occurred while updating the GL code, please try again',
            importCategories: '[it] Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: '[it] Cannot delete or disable all categories',
                description: `[it] At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: '[it] Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: '[it] Spend',
                subtitle: '[it] Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: '[it] Manage',
                subtitle: '[it] Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: '[it] Earn',
                subtitle: '[it] Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: '[it] Organize',
                subtitle: '[it] Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: '[it] Integrate',
                subtitle: '[it] Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: '[it] Distance rates',
                subtitle: '[it] Add, update, and enforce rates.',
            },
            perDiem: {
                title: '[it] Per diem',
                subtitle: '[it] Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: '[it] Travel',
                subtitle: '[it] Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: '[it] Get started with Expensify Travel',
                    subtitle: "[it] We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "[it] Let's go",
                },
                reviewingRequest: {
                    title: "[it] Pack your bags, we've got your request...",
                    subtitle: "[it] We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: '[it] Request sent',
                },
                bookOrManageYourTrip: {
                    title: '[it] Travel booking',
                    subtitle: "[it] Congrats! You're all set to book and manage travel on this workspace.",
                    ctaText: '[it] Manage travel',
                },
                settings: {
                    autoAddTripName: {
                        title: '[it] Add trip names to expenses',
                        subtitle: '[it] Automatically add trip names to expense descriptions for travel booked in Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '[it] Travel booking',
                        subtitle: "[it] Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: '[it] Manage travel',
                    },
                    centralInvoicingSection: {
                        title: '[it] Central invoicing',
                        subtitle: '[it] Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: '[it] Learn how.',
                        subsections: {
                            currentTravelSpendLabel: '[it] Current travel spend',
                            currentTravelSpendPaymentQueued: (amount: string) => `[it] Payment of ${amount} is queued and will be processed soon.`,
                            currentTravelSpendCta: '[it] Pay balance',
                            currentTravelLimitLabel: '[it] Current travel limit',
                            settlementAccountLabel: '[it] Settlement account',
                            settlementFrequencyLabel: '[it] Settlement frequency',
                            settlementFrequencyDescription: '[it] How often Expensify will pull from your business bank account to settle recent Expensify Travel transactions.',
                            monthlySpendLimitLabel: '[it] Monthly spend limit per member',
                            monthlySpendLimitDescription: '[it] The maximum amount each member can spend on travel per month.',
                            reduceLimitTitle: '[it] Reduce travel spend limit?',
                            reduceLimitWarning:
                                '[it] If you reduce the limit, members who have already spent more than this amount will be unable to make new travel bookings until next month.',
                            provisioningError:
                                "[it] We weren't able to provision some of the members of your workspace for central invoicing. Please try again later or reach out to Concierge for assistance.",
                        },
                    },
                    disableModal: {
                        title: '[it] Turn off Travel Invoicing?',
                        body: '[it] Upcoming hotel and car rental reservations may need to be re-booked with a different payment method to avoid cancellation.',
                        confirm: '[it] Turn off',
                    },
                    outstandingBalanceModal: {
                        title: "[it] Can't turn off Travel Invoicing",
                        body: '[it] You still have an outstanding travel balance. Please pay your balance first.',
                        confirm: '[it] Got it',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `[it] Pay balance of ${amount}?`,
                        body: '[it] The payment will be queued and processed shortly after. This action cannot be undone once started.',
                    },
                    exportToPDF: '[it] Export to PDF',
                    exportToCSV: '[it] Export to CSV',
                    selectDateRangeError: '[it] Please select a date range to export',
                    invalidDateRangeError: '[it] The start date must be before the end date',
                    enabled: '[it] Central Invoicing enabled!',
                    enabledDescription: '[it] All travel spend on this workspace will now be centralized in a monthly invoice.',
                },
                personalDetailsDescription: '[it] In order to book travel, please enter your legal name as it appears on your government-issued ID.',
            },
            expensifyCard: {
                title: '[it] Expensify Card',
                subtitle: '[it] Gain insights and control over spend.',
                disableCardTitle: '[it] Disable Expensify Card',
                disableCardPrompt: '[it] You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: '[it] Chat with Concierge',
                feed: {
                    title: '[it] Get the Expensify Card',
                    subTitle: '[it] Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: '[it] Cash back on every US purchase',
                        unlimited: '[it] Unlimited virtual cards',
                        spend: '[it] Spend controls and custom limits',
                    },
                    ctaTitle: '[it] Issue new card',
                },
            },
            companyCards: {
                title: '[it] Company cards',
                subtitle: '[it] Connect the cards you already have.',
                feed: {
                    title: '[it] Bring your own cards (BYOC)',
                    subtitle: '[it] Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: '[it] Connect cards from 10,000+ banks',
                        assignCards: '[it] Link your team’s existing cards',
                        automaticImport: '[it] We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: '[it] Bank connection issue',
                connectWithPlaid: '[it] connect via Plaid',
                connectWithExpensifyCard: '[it] try the Expensify Card.',
                bankConnectionDescription: `[it] Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: '[it] Disable company cards',
                disableCardPrompt: '[it] You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: '[it] Chat with Concierge',
                cardDetails: '[it] Card details',
                cardNumber: '[it] Card number',
                cardholder: '[it] Cardholder',
                cardName: '[it] Card name',
                allCards: '[it] All cards',
                assignedCards: '[it] Assigned',
                unassignedCards: '[it] Unassigned',
                integrationExport: (integration: string, type?: string) => (integration && type ? `[it] ${integration} ${type.toLowerCase()} export` : `[it] ${integration} export`),
                integrationExportTitleXero: (integration: string) => `[it] Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `[it] Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: '[it] Last updated',
                transactionStartDate: '[it] Transaction start date',
                updateCard: '[it] Update card',
                unassignCard: '[it] Unassign card',
                unassign: '[it] Unassign',
                unassignCardDescription: '[it] Unassigning this card will delete all unsubmitted transactions.',
                assignCard: '[it] Assign card',
                removeCard: '[it] Remove card',
                remove: '[it] Remove',
                removeCardDescription: '[it] Removing this card will delete all unsubmitted transactions.',
                cardFeedName: '[it] Card feed name',
                cardFeedNameDescription: '[it] Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: '[it] Delete transactions',
                cardFeedTransactionDescription: '[it] Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: '[it] Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: '[it] Allow deleting transactions',
                removeCardFeed: '[it] Remove card feed',
                removeCardFeedTitle: (feedName: string) => `[it] Remove ${feedName} feed`,
                removeCardFeedDescription: '[it] Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: '[it] Card feed name is required',
                    statementCloseDateRequired: '[it] Please select a statement close date.',
                },
                corporate: '[it] Restrict deleting transactions',
                personal: '[it] Allow deleting transactions',
                setFeedNameDescription: '[it] Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: '[it] When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: '[it] No cards in this feed',
                emptyAddedFeedDescription: "[it] Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `[it] We're reviewing your request...`,
                pendingFeedDescription: `[it] We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '[it] Check your browser window',
                pendingBankDescription: (bankName: string) => `[it] Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: '[it] please click here',
                giveItNameInstruction: '[it] Give the card a name that sets it apart from others.',
                updating: '[it] Updating...',
                neverUpdated: '[it] Never',
                noAccountsFound: '[it] No accounts found',
                defaultCard: '[it] Default card',
                downgradeTitle: `[it] Can't downgrade workspace`,
                downgradeSubTitle: `[it] This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `[it] Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: '[it] Get the Expensify Card',
                expensifyCardBannerSubtitle: '[it] Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: '[it] Learn more',
                statementCloseDateTitle: '[it] Statement close date',
                statementCloseDateDescription: '[it] Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: '[it] Workflows',
                subtitle: '[it] Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    '[it] Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: '[it] Invoices',
                subtitle: '[it] Send and receive invoices.',
            },
            categories: {
                title: '[it] Categories',
                subtitle: '[it] Track and organize spend.',
            },
            tags: {
                title: '[it] Tags',
                subtitle: '[it] Classify costs and track billable expenses.',
            },
            taxes: {
                title: '[it] Taxes',
                subtitle: '[it] Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: '[it] Report fields',
                subtitle: '[it] Set up custom fields for spend.',
            },
            connections: {
                title: '[it] Accounting',
                subtitle: '[it] Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: '[it] Receipt partners',
                subtitle: '[it] Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '[it] Not so fast...',
                featureEnabledText: "[it] To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "[it] To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: '[it] Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '[it] Disconnect Uber',
                disconnectText: '[it] To disable this feature, please disconnect the Uber for Business integration first.',
                description: '[it] Are you sure you want to disconnect this integration?',
                confirmText: '[it] Got it',
            },
            workflowWarningModal: {
                featureEnabledTitle: '[it] Not so fast...',
                featureEnabledText:
                    '[it] Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: '[it] Go to Expensify Cards',
            },
            rules: {
                title: '[it] Rules',
                subtitle: '[it] Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: '[it] Time',
                subtitle: '[it] Set a billable hourly rate for time tracking.',
                defaultHourlyRate: '[it] Default hourly rate',
            },
        },
        reports: {
            reportsCustomTitleExamples: '[it] Examples:',
            customReportNamesSubtitle: `[it] <muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: '[it] Default report title',
            customNameDescription: `[it] Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: '[it] Name',
            customNameEmailPhoneExample: '[it] Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: '[it] Report start date: {report:startdate}',
            customNameWorkspaceNameExample: '[it] Workspace name: {report:workspacename}',
            customNameReportIDExample: '[it] Report ID: {report:id}',
            customNameTotalExample: '[it] Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: '[it] Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: '[it] Add field',
            delete: '[it] Delete field',
            deleteFields: '[it] Delete fields',
            findReportField: '[it] Find report field',
            deleteConfirmation: '[it] Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: '[it] Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "[it] You haven't created any report fields",
                subtitle: '[it] Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "[it] Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: '[it] Disable report fields',
            disableReportFieldsConfirmation: '[it] Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: '[it] The report fields below are imported from your',
            textType: '[it] Text',
            dateType: '[it] Date',
            dropdownType: '[it] List',
            formulaType: '[it] Formula',
            textAlternateText: '[it] Add a field for free text input.',
            dateAlternateText: '[it] Add a calendar for date selection.',
            dropdownAlternateText: '[it] Add a list of options to choose from.',
            formulaAlternateText: '[it] Add a formula field.',
            nameInputSubtitle: '[it] Choose a name for the report field.',
            typeInputSubtitle: '[it] Choose what type of report field to use.',
            initialValueInputSubtitle: '[it] Enter a starting value to show in the report field.',
            listValuesInputSubtitle: '[it] These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: '[it] These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: '[it] Delete value',
            deleteValues: '[it] Delete values',
            disableValue: '[it] Disable value',
            disableValues: '[it] Disable values',
            enableValue: '[it] Enable value',
            enableValues: '[it] Enable values',
            emptyReportFieldsValues: {
                title: "[it] You haven't created any list values",
                subtitle: '[it] Add custom values to appear on reports.',
            },
            deleteValuePrompt: '[it] Are you sure you want to delete this list value?',
            deleteValuesPrompt: '[it] Are you sure you want to delete these list values?',
            listValueRequiredError: '[it] Please enter a list value name',
            existingListValueError: '[it] A list value with this name already exists',
            editValue: '[it] Edit value',
            listValues: '[it] List values',
            addValue: '[it] Add value',
            existingReportFieldNameError: '[it] A report field with this name already exists',
            reportFieldNameRequiredError: '[it] Please enter a report field name',
            reportFieldTypeRequiredError: '[it] Please choose a report field type',
            circularReferenceError: "[it] This field can't refer to itself. Please update.",
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `[it] Formula field ${value} not recognized`,
            reportFieldInitialValueRequiredError: '[it] Please choose a report field initial value',
            genericFailureMessage: '[it] An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: '[it] Tag name',
            requiresTag: '[it] Members must tag all expenses',
            trackBillable: '[it] Track billable expenses',
            customTagName: '[it] Custom tag name',
            enableTag: '[it] Enable tag',
            enableTags: '[it] Enable tags',
            requireTag: '[it] Require tag',
            requireTags: '[it] Require tags',
            notRequireTags: '[it] Don’t require',
            disableTag: '[it] Disable tag',
            disableTags: '[it] Disable tags',
            addTag: '[it] Add tag',
            editTag: '[it] Edit tag',
            editTags: '[it] Edit tags',
            findTag: '[it] Find tag',
            subtitle: '[it] Tags add more detailed ways to classify costs.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `[it] <muted-text>Tags add more detailed ways to classify costs. You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "[it] You haven't created any tags",
                subtitle: '[it] Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `[it] <muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[it] <muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: '[it] Delete tag',
            deleteTags: '[it] Delete tags',
            deleteTagConfirmation: '[it] Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: '[it] Are you sure that you want to delete these tags?',
            deleteFailureMessage: '[it] An error occurred while deleting the tag, please try again',
            tagRequiredError: '[it] Tag name is required',
            existingTagError: '[it] A tag with this name already exists',
            invalidTagNameError: '[it] Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: '[it] An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: '[it] Tags are managed in your',
            employeesSeeTagsAs: '[it] Employees see tags as',
            glCode: '[it] GL code',
            updateGLCodeFailureMessage: '[it] An error occurred while updating the GL code, please try again',
            tagRules: '[it] Tag rules',
            approverDescription: '[it] Approver',
            importTags: '[it] Import tags',
            importTagsSupportingText: '[it] Code your expenses with one type of tag or many.',
            configureMultiLevelTags: '[it] Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `[it] Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: '[it] The first row is the title for each tag list',
                independentTags: '[it] These are independent tags',
                glAdjacentColumn: '[it] There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: '[it] Single level of tags',
                multiLevel: '[it] Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '[it] Switch Tag Levels',
                prompt1: '[it] Switching tag levels will erase all current tags.',
                prompt2: '[it]  We suggest you first',
                prompt3: '[it]  download a backup',
                prompt4: '[it]  by exporting your tags.',
                prompt5: '[it]  Learn more',
                prompt6: '[it]  about tag levels.',
            },
            overrideMultiTagWarning: {
                title: '[it] Import tags',
                prompt1: '[it] Are you sure?',
                prompt2: '[it]  The existing tags will be overridden, but you can',
                prompt3: '[it]  download a backup',
                prompt4: '[it]  first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `[it] We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: '[it] Cannot delete or disable all tags',
                description: `[it] At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: '[it] Cannot make all tags optional',
                description: `[it] At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: '[it] Cannot make tag list required',
                description: '[it] You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '[it] 1 Tag',
                other: (count: number) => `[it] ${count} Tags`,
            }),
        },
        taxes: {
            subtitle: '[it] Add tax names, rates, and set defaults.',
            addRate: '[it] Add rate',
            workspaceDefault: '[it] Workspace currency default',
            foreignDefault: '[it] Foreign currency default',
            customTaxName: '[it] Custom tax name',
            value: '[it] Value',
            taxReclaimableOn: '[it] Tax reclaimable on',
            taxRate: '[it] Tax rate',
            findTaxRate: '[it] Find tax rate',
            error: {
                taxRateAlreadyExists: '[it] This tax name is already in use',
                taxCodeAlreadyExists: '[it] This tax code is already in use',
                valuePercentageRange: '[it] Please enter a valid percentage between 0 and 100',
                customNameRequired: '[it] Custom tax name is required',
                deleteFailureMessage: '[it] An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: '[it] An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: '[it] An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: '[it] The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: '[it] Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `[it] Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '[it] Delete rate',
                deleteMultiple: '[it] Delete rates',
                enable: '[it] Enable rate',
                disable: '[it] Disable rate',
                enableTaxRates: () => ({
                    one: '[it] Enable rate',
                    other: '[it] Enable rates',
                }),
                disableTaxRates: () => ({
                    one: '[it] Disable rate',
                    other: '[it] Disable rates',
                }),
            },
            importedFromAccountingSoftware: '[it] The taxes below are imported from your',
            taxCode: '[it] Tax code',
            updateTaxCodeFailureMessage: '[it] An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: '[it] Name your new workspace',
            selectFeatures: '[it] Select features to copy',
            whichFeatures: '[it] Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '[it] \n\nDo you want to continue?',
            categories: '[it] categories and your auto-categorization rules',
            reimbursementAccount: '[it] reimbursement account',
            welcomeNote: '[it] Please start using my new workspace',
            delayedSubmission: '[it] delayed submission',
            merchantRules: '[it] Merchant rules',
            merchantRulesCount: () => ({
                one: '[it] 1 merchant rule',
                other: (count: number) => `[it] ${count} merchant rules`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `[it] You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: '[it] An error occurred while duplicating your new workspace. Please try again.',
        },
        emptyWorkspace: {
            title: '[it] No workspaces yet',
            subtitle: '[it] Create a workspace to manage your expenses, reimbursements, and company cards.',
            createAWorkspaceCTA: '[it] Get Started',
            features: {
                trackAndCollect: '[it] Track and collect receipts',
                reimbursements: '[it] Reimburse employees',
                companyCards: '[it] Manage company cards',
            },
            notFound: '[it] No workspace found',
            description: '[it] Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: '[it] New workspace',
            getTheExpensifyCardAndMore: '[it] Get the Expensify Card and more',
            confirmWorkspace: '[it] Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `[it] My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `[it] ${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '[it] An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `[it] Are you sure you want to remove ${memberName}?`,
                other: '[it] Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `[it] ${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '[it] Remove member',
                other: '[it] Remove members',
            }),
            findMember: '[it] Find member',
            removeWorkspaceMemberButtonTitle: '[it] Remove from workspace',
            removeGroupMemberButtonTitle: '[it] Remove from group',
            removeRoomMemberButtonTitle: '[it] Remove from chat',
            removeMemberPrompt: (memberName: string) => `[it] Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '[it] Remove member',
            transferOwner: '[it] Transfer owner',
            makeMember: () => ({
                one: '[it] Make member',
                other: '[it] Make members',
            }),
            makeAdmin: () => ({
                one: '[it] Make admin',
                other: '[it] Make admins',
            }),
            makeAuditor: () => ({
                one: '[it] Make auditor',
                other: '[it] Make auditors',
            }),
            selectAll: '[it] Select all',
            error: {
                genericAdd: '[it] There was a problem adding this workspace member',
                cannotRemove: "[it] You can't remove yourself or the workspace owner",
                genericRemove: '[it] There was a problem removing that workspace member',
            },
            addedWithPrimary: '[it] Some members were added with their primary logins.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `[it] Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `[it] Total workspace members: ${count}`,
            importMembers: '[it] Import members',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `[it] If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `[it] ${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `[it] You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[it] If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[it] If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `[it] ${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: '[it] Get started by issuing your first virtual or physical card.',
            issueCard: '[it] Issue card',
            issueNewCard: {
                whoNeedsCard: '[it] Who needs a card?',
                inviteNewMember: '[it] Invite new member',
                findMember: '[it] Find member',
                chooseCardType: '[it] Choose a card type',
                physicalCard: '[it] Physical card',
                physicalCardDescription: '[it] Great for the frequent spender',
                virtualCard: '[it] Virtual card',
                virtualCardDescription: '[it] Instant and flexible',
                chooseLimitType: '[it] Choose a limit type',
                smartLimit: '[it] Smart Limit',
                smartLimitDescription: '[it] Spend up to a certain amount before requiring approval',
                monthly: '[it] Monthly',
                monthlyDescription: '[it] Limit renews monthly',
                fixedAmount: '[it] Fixed amount',
                fixedAmountDescription: '[it] Spend until the limit is reached',
                setLimit: '[it] Set a limit',
                cardLimitError: '[it] Please enter an amount less than $21,474,836',
                giveItName: '[it] Give it a name',
                giveItNameInstruction: '[it] Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: '[it] Card name',
                letsDoubleCheck: '[it] Let’s double check that everything looks right.',
                willBeReadyToUse: '[it] This card will be ready to use immediately.',
                willBeReadyToShip: '[it] This card will be ready to ship immediately.',
                cardholder: '[it] Cardholder',
                cardType: '[it] Card type',
                limit: '[it] Limit',
                limitType: '[it] Limit type',
                disabledApprovalForSmartLimitError: '[it] Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
                singleUse: '[it] Single-use',
                singleUseDescription: '[it] Expires after one transaction',
                validFrom: '[it] Valid from',
                startDate: '[it] Start date',
                endDate: '[it] End date',
                noExpirationHint: "[it] A card without an expiration date won't expire",
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `[it] Valid from ${startDate} to ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `[it] ${startDate} to ${endDate}`,
                combineWithExpiration: '[it] Combine with expiration options for additional spend control',
                enterValidDate: '[it] Enter a valid date',
                expirationDate: '[it] Expiration date',
                limitAmount: '[it] Limit amount',
                setExpiryOptions: '[it] Set expiry options',
                setExpiryDate: '[it] Set expiry date',
                setExpiryDateDescription: '[it] Card will expire as listed on the card',
                amount: '[it] Amount',
            },
            deactivateCardModal: {
                deactivate: '[it] Deactivate',
                deactivateCard: '[it] Deactivate card',
                deactivateConfirmation: '[it] Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: '[it] settings',
            title: '[it] Connections',
            subtitle: '[it] Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: '[it] QuickBooks Online',
            qbd: '[it] QuickBooks Desktop',
            xero: '[it] Xero',
            netsuite: '[it] NetSuite',
            intacct: '[it] Sage Intacct',
            sap: '[it] SAP',
            oracle: '[it] Oracle',
            microsoftDynamics: '[it] Microsoft Dynamics',
            talkYourOnboardingSpecialist: '[it] Chat with your setup specialist.',
            talkYourAccountManager: '[it] Chat with your account manager.',
            talkToConcierge: '[it] Chat with Concierge.',
            needAnotherAccounting: '[it] Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '[it] QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '[it] Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '[it] NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '[it] Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `[it] There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '[it] Go to Expensify Classic to manage your settings.',
            setup: '[it] Connect',
            lastSync: (relativeDate: string) => `[it] Last synced ${relativeDate}`,
            notSync: '[it] Not synced',
            import: '[it] Import',
            export: '[it] Export',
            advanced: '[it] Advanced',
            other: '[it] Other',
            syncNow: '[it] Sync now',
            disconnect: '[it] Disconnect',
            reinstall: '[it] Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[it] integration';
                return `[it] Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `[it] Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[it] accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "[it] Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "[it] Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "[it] Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "[it] Can't connect to QuickBooks Desktop";
                    default: {
                        return "[it] Can't connect to integration";
                    }
                }
            },
            accounts: '[it] Chart of accounts',
            taxes: '[it] Taxes',
            imported: '[it] Imported',
            notImported: '[it] Not imported',
            importAsCategory: '[it] Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '[it] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '[it] Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '[it] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '[it] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '[it] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '[it] Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: '[it] NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[it] this integration';
                return `[it] Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `[it] Are you sure you want to connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[it] this accounting integration'}? This will remove any existing accounting connections.`,
            enterCredentials: '[it] Enter your credentials',
            claimOffer: {
                badgeText: '[it] Offer available!',
                xero: {
                    headline: '[it] Get Xero free for 6 months!',
                    description: '[it] <muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: '[it] Connect to Xero',
                },
                uber: {
                    headerTitle: '[it] Uber for Business',
                    headline: '[it] Get 5% off Uber rides',
                    description: `[it] <muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: '[it] Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '[it] Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '[it] Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '[it] Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '[it] Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return '[it] Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return '[it] Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '[it] Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '[it] Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return '[it] Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return '[it] Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return '[it] Importing Xero data';
                        case 'startingImportQBO':
                            return '[it] Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '[it] Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return '[it] Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '[it] Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return '[it] Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '[it] Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '[it] Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return '[it] Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '[it] Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '[it] Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '[it] Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '[it] Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '[it] Updating report fields';
                        case 'jobDone':
                            return '[it] Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return '[it] Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return '[it] Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return '[it] Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return '[it] Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '[it] Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return '[it] Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return '[it] Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return '[it] Syncing tax rates';
                        case 'xeroCheckConnection':
                            return '[it] Checking Xero connection';
                        case 'xeroSyncTitle':
                            return '[it] Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return '[it] Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '[it] Importing customers';
                        case 'netSuiteSyncInitData':
                            return '[it] Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return '[it] Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return '[it] Importing items';
                        case 'netSuiteSyncData':
                            return '[it] Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return '[it] Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return '[it] Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return '[it] Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return '[it] Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return '[it] Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '[it] Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '[it] Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '[it] Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return '[it] Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return '[it] Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return '[it] Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '[it] Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '[it] Importing vendors';
                        case 'intacctCheckConnection':
                            return '[it] Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return '[it] Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return '[it] Importing Sage Intacct data';
                        default: {
                            return `[it] Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '[it] Preferred exporter',
            exportPreferredExporterNote:
                '[it] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[it] Once set, the preferred exporter will see reports for export in their account.',
            exportAs: '[it] Export as',
            exportOutOfPocket: '[it] Export out-of-pocket expenses as',
            exportCompanyCard: '[it] Export company card expenses as',
            exportDate: '[it] Export date',
            defaultVendor: '[it] Default vendor',
            autoSync: '[it] Auto-sync',
            autoSyncDescription: '[it] Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: '[it] Sync reimbursed reports',
            cardReconciliation: '[it] Card reconciliation',
            reconciliationAccount: '[it] Reconciliation account',
            continuousReconciliation: '[it] Continuous Reconciliation',
            saveHoursOnReconciliation:
                '[it] Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `[it] <muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '[it] Choose the bank account that your Expensify Card payments will be reconciled against.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `[it] Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        export: {
            notReadyHeading: '[it] Not ready to export',
            notReadyDescription: '[it] Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: '[it] Send invoice',
            sendFrom: '[it] Send from',
            invoicingDetails: '[it] Invoicing details',
            invoicingDetailsDescription: '[it] This info will appear on your invoices.',
            companyName: '[it] Company name',
            companyWebsite: '[it] Company website',
            paymentMethods: {
                personal: '[it] Personal',
                business: '[it] Business',
                chooseInvoiceMethod: '[it] Choose a payment method below:',
                payingAsIndividual: '[it] Paying as an individual',
                payingAsBusiness: '[it] Paying as a business',
            },
            invoiceBalance: '[it] Invoice balance',
            invoiceBalanceSubtitle: "[it] This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: '[it] Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: '[it] Invite member',
            members: '[it] Invite members',
            invitePeople: '[it] Invite new members',
            genericFailureMessage: '[it] An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `[it] Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '[it] user',
            users: '[it] users',
            invited: '[it] invited',
            removed: '[it] removed',
            to: '[it] to',
            from: '[it] from',
        },
        inviteMessage: {
            confirmDetails: '[it] Confirm details',
            inviteMessagePrompt: '[it] Make your invitation extra special by adding a message below!',
            personalMessagePrompt: '[it] Message',
            genericFailureMessage: '[it] An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: '[it] Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `[it] ${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '[it] Oops! Not so fast...',
            workspaceNeeds: '[it] A workspace needs at least one enabled distance rate.',
            distance: '[it] Distance',
            centrallyManage: '[it] Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: '[it] Rate',
            addRate: '[it] Add rate',
            findRate: '[it] Find rate',
            trackTax: '[it] Track tax',
            deleteRates: () => ({
                one: '[it] Delete rate',
                other: '[it] Delete rates',
            }),
            enableRates: () => ({
                one: '[it] Enable rate',
                other: '[it] Enable rates',
            }),
            disableRates: () => ({
                one: '[it] Disable rate',
                other: '[it] Disable rates',
            }),
            enableRate: '[it] Enable rate',
            status: '[it] Status',
            unit: '[it] Unit',
            taxFeatureNotEnabledMessage:
                '[it] <muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: '[it] Delete distance rate',
            areYouSureDelete: () => ({
                one: '[it] Are you sure you want to delete this rate?',
                other: '[it] Are you sure you want to delete these rates?',
            }),
            errors: {
                rateNameRequired: '[it] Rate name is required',
                existingRateName: '[it] A distance rate with this name already exists',
            },
        },
        editor: {
            descriptionInputLabel: '[it] Description',
            nameInputLabel: '[it] Name',
            typeInputLabel: '[it] Type',
            initialValueInputLabel: '[it] Initial value',
            nameInputHelpText: "[it] This is the name you'll see on your workspace.",
            nameIsRequiredError: "[it] You'll need to give your workspace a name",
            currencyInputLabel: '[it] Default currency',
            currencyInputHelpText: '[it] All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `[it] The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: '[it] Save',
            genericFailureMessage: '[it] An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: '[it] An error occurred uploading the avatar. Please try again.',
            addressContext: '[it] A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: '[it] Expense policy',
        },
        bankAccount: {
            continueWithSetup: '[it] Continue setup',
            youAreAlmostDone: "[it] You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: '[it] Streamline payments',
            connectBankAccountNote: "[it] Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: '[it] One more thing!',
            allSet: "[it] You're all set!",
            accountDescriptionWithCards: '[it] This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "[it] Let's finish in chat!",
            finishInChat: '[it] Finish in chat',
            almostDone: '[it] Almost done!',
            disconnectBankAccount: '[it] Disconnect bank account',
            startOver: '[it] Start over',
            updateDetails: '[it] Update details',
            yesDisconnectMyBankAccount: '[it] Yes, disconnect my bank account',
            yesStartOver: '[it] Yes, start over',
            disconnectYourBankAccount: (bankName: string) =>
                `[it] Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "[it] Starting over will clear the progress you've made so far.",
            areYouSure: '[it] Are you sure?',
            workspaceCurrency: '[it] Workspace currency',
            updateCurrencyPrompt: '[it] It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: '[it] Update to USD',
            updateWorkspaceCurrency: '[it] Update workspace currency',
            workspaceCurrencyNotSupported: '[it] Workspace currency not supported',
            yourWorkspace: `[it] Your workspace is set to an unsupported currency. View the <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: '[it] Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: '[it] Transfer owner',
            addPaymentCardTitle: '[it] Enter your payment card to transfer ownership',
            addPaymentCardButtonText: '[it] Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `[it] <muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: '[it] PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: '[it] Bank level encryption',
            addPaymentCardRedundant: '[it] Redundant infrastructure',
            addPaymentCardLearnMore: `[it] <muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: '[it] Outstanding balance',
            amountOwedButtonText: '[it] OK',
            amountOwedText: '[it] This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: '[it] Outstanding balance',
            ownerOwesAmountButtonText: '[it] Transfer balance',
            ownerOwesAmountText: (email: string, amount: string) => `[it] The account owning this workspace (${email}) has an outstanding balance from a previous month.

Do you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: '[it] Take over annual subscription',
            subscriptionButtonText: '[it] Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `[it] Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: '[it] Duplicate subscription alert',
            duplicateSubscriptionButtonText: '[it] Continue',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `[it] It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.

Click "Continue" if you only want to take over billing for the workspace ${workspaceName}.

If you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '[it] Cannot transfer ownership',
            hasFailedSettlementsButtonText: '[it] Got it',
            hasFailedSettlementsText: (email: string) =>
                `[it] You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '[it] Failed to clear balance',
            failedToClearBalanceButtonText: '[it] OK',
            failedToClearBalanceText: '[it] We were unable to clear the balance. Please try again later.',
            successTitle: '[it] Woohoo! All set.',
            successDescription: "[it] You're now the owner of this workspace.",
            errorTitle: '[it] Oops! Not so fast...',
            errorDescription: `[it] <muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '[it] Careful!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `[it] The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Are you sure you want to export them again?`,
            confirmText: '[it] Yes, export again',
            cancelText: '[it] Cancel',
        },
        upgrade: {
            reportFields: {
                title: '[it] Report fields',
                description: `[it] Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: '[it] NetSuite',
                description: `[it] Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '[it] Sage Intacct',
                description: `[it] Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: '[it] QuickBooks Desktop',
                description: `[it] Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '[it] Advanced Approvals',
                description: `[it] If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            categories: {
                title: '[it] Categories',
                description: '[it] Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: '[it] GL codes',
                description: `[it] Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '[it] GL & Payroll codes',
                description: `[it] Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: '[it] Tax codes',
                description: `[it] Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: '[it] Unlimited Company cards',
                description: `[it] Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            rules: {
                title: '[it] Rules',
                description: `[it] Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.

Require expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: '[it] Per diem',
                description:
                    '[it] Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            travel: {
                title: '[it] Travel',
                description: '[it] Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            reports: {
                title: '[it] Reports',
                description: '[it] Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: '[it] Multi-level tags',
                description:
                    '[it] Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: '[it] Distance rates',
                description: '[it] Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: '[it] Auditor',
                description: '[it] Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '[it] Multiple approval levels',
                description: '[it] Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[it] <muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '[it] per active member per month.',
                perMember: '[it] per member per month.',
            },
            note: (subscriptionLink: string) => `[it] <muted-text>Upgrade to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: '[it] Unlock this feature',
            completed: {
                headline: `[it] You've upgraded your workspace!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `[it] <centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `[it] You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `[it] You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `[it] You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: '[it] Got it, thanks',
                createdWorkspace: `[it] You've created a workspace!`,
            },
            commonFeatures: {
                title: '[it] Upgrade to the Control plan',
                note: '[it] Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `[it] <muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[it] per member per month.` : `[it] per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: '[it] Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: '[it] Smart expense rules',
                    benefit3: '[it] Multi-level approval workflows',
                    benefit4: '[it] Enhanced security controls',
                    toUpgrade: '[it] To upgrade, click',
                    selectWorkspace: '[it] select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `[it] Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '[it] Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '[it] Downgrade to Collect',
                note: "[it] You'll lose access to the following features",
                noteAndMore: '[it] and more:',
                benefits: {
                    important: '[it] IMPORTANT: ',
                    confirm: '[it] You\'ll need to change the "Plan type" of every workspace to "Collect" in order to secure the Collect rate.',
                    benefit1Label: '[it] ERP integrations',
                    benefit1: '[it] NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: '[it] HR integrations',
                    benefit2: '[it] Workday, Certinia',
                    benefit3Label: '[it] Security',
                    benefit3: '[it] SSO/SAML',
                    benefit4Label: '[it] Advanced',
                    benefit4: '[it] Smart expense rules, per diems, multi-level approvals, custom reporting, and budgeting',
                    headsUp: '[it] Heads up!',
                    multiWorkspaceNote: '[it] You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '[it] > select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: '[it] Your workspace has been downgraded',
                description: '[it] You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: '[it] Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: '[it] Pay & downgrade',
            headline: '[it] Your final payment',
            description1: (formattedAmount: string) => `[it] Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `[it] See your breakdown below for ${date}:`,
            subscription:
                '[it] Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: '[it] An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: '[it] Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `[it] Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `[it] Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "[it] You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: '[it] Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: '[it] Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: '[it] Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: '[it] Chat with your admin',
            chatInAdmins: '[it] Chat in #admins',
            addPaymentCard: '[it] Add payment card',
            goToSubscription: '[it] Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: '[it] Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `[it] <muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: '[it] Receipt required amount',
                receiptRequiredAmountDescription: '[it] Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `[it] Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: '[it] Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: '[it] Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `[it] Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: '[it] Max expense amount',
                maxExpenseAmountDescription: '[it] Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: '[it] Max age',
                maxExpenseAge: '[it] Max expense age',
                maxExpenseAgeDescription: '[it] Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '[it] 1 day',
                    other: (count: number) => `[it] ${count} days`,
                }),
                cashExpenseDefault: '[it] Cash expense default',
                cashExpenseDefaultDescription:
                    '[it] Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: '[it] Reimbursable',
                reimbursableDefaultDescription: '[it] Expenses are most often paid back to employees',
                nonReimbursableDefault: '[it] Non-reimbursable',
                nonReimbursableDefaultDescription: '[it] Expenses are occasionally paid back to employees',
                alwaysReimbursable: '[it] Always reimbursable',
                alwaysReimbursableDescription: '[it] Expenses are always paid back to employees',
                alwaysNonReimbursable: '[it] Always non-reimbursable',
                alwaysNonReimbursableDescription: '[it] Expenses are never paid back to employees',
                billableDefault: '[it] Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `[it] <muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: '[it] Billable',
                billableDescription: '[it] Expenses are most often re-billed to clients',
                nonBillable: '[it] Non-billable',
                nonBillableDescription: '[it] Expenses are occasionally re-billed to clients',
                eReceipts: '[it] eReceipts',
                eReceiptsHint: `[it] eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: '[it] Attendee tracking',
                attendeeTrackingHint: '[it] Track the per-person cost for every expense.',
                prohibitedDefaultDescription: '[it] Flag receipts with these line items for manual review.',
                prohibitedExpenses: '[it] Prohibited expenses',
                alcohol: '[it] Alcohol',
                hotelIncidentals: '[it] Hotel incidentals',
                gambling: '[it] Gambling',
                tobacco: '[it] Tobacco',
                adultEntertainment: '[it] Adult entertainment',
                requireCompanyCard: '[it] Require company cards for all purchases',
                requireCompanyCardDescription: '[it] Flag all cash spend, including mileage and per-diem expenses.',
                requireCompanyCardDisabledTooltip: '[it] Enable Company cards (under More features) to unlock.',
            },
            expenseReportRules: {
                title: '[it] Advanced',
                subtitle: '[it] Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: '[it] Prevent self-approvals',
                preventSelfApprovalsSubtitle: '[it] Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: '[it] Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: '[it] Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: '[it] Auto-approve reports with all expenses under',
                autoApproveReportsUnderDescription: '[it] Fully compliant expense reports where all expenses are under this amount will be automatically approved.',
                randomReportAuditTitle: '[it] Random report audit',
                randomReportAuditDescription: '[it] Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: '[it] Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: '[it] Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `[it] Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: '[it] Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: '[it] Auto-pay reports under',
                autoPayReportsUnderDescription: '[it] Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `[it] Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[it] Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: '[it] Merchant',
                subtitle: '[it] Set merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: '[it] Add merchant rule',
                findRule: '[it] Find merchant rule',
                addRuleTitle: '[it] Add rule',
                editRuleTitle: '[it] Edit rule',
                expensesWith: '[it] For expenses with:',
                expensesExactlyMatching: '[it] For expenses exactly matching:',
                applyUpdates: '[it] Apply these updates:',
                saveRule: '[it] Save rule',
                previewMatches: '[it] Preview matches',
                confirmError: '[it] Enter merchant and apply at least one update',
                confirmErrorMerchant: '[it] Please enter merchant',
                confirmErrorUpdate: '[it] Please apply at least one update',
                previewMatchesEmptyStateTitle: '[it] Nothing to show',
                previewMatchesEmptyStateSubtitle: '[it] No unsubmitted expenses match this rule.',
                deleteRule: '[it] Delete rule',
                deleteRuleConfirmation: '[it] Are you sure you want to delete this rule?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `[it] If merchant ${isExactMatch ? '[it] exactly matches' : '[it] contains'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `[it] Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `[it] Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `[it] Mark as  "${reimbursable ? '[it] reimbursable' : '[it] non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `[it] Mark as "${billable ? '[it] billable' : '[it] non-billable'}"`,
                matchType: '[it] Match type',
                matchTypeContains: '[it] Contains',
                matchTypeExact: '[it] Exactly matches',
                duplicateRuleTitle: '[it] Similar merchant rule already exists',
                duplicateRulePrompt: (merchantName: string) => `[it] Your existing rule for "${merchantName}" will take priority over this one. Save anyway?`,
                saveAnyway: '[it] Save anyway',
                applyToExistingUnsubmittedExpenses: '[it] Apply to existing unsubmitted expenses',
            },
            categoryRules: {
                title: '[it] Category rules',
                approver: '[it] Approver',
                requireDescription: '[it] Require description',
                requireFields: '[it] Require fields',
                requiredFieldsTitle: '[it] Required fields',
                requiredFieldsDescription: (categoryName: string) => `[it] This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: '[it] Require attendees',
                descriptionHint: '[it] Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `[it] Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: '[it] Hint',
                descriptionHintSubtitle: '[it] Pro-tip: The shorter the better!',
                maxAmount: '[it] Max amount',
                flagAmountsOver: '[it] Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `[it] Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: '[it] This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: '[it] Individual expense',
                    expenseSubtitle: '[it] Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: '[it] Category total',
                    dailySubtitle: '[it] Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: '[it] Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `[it] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[it] Never require receipts',
                    always: '[it] Always require receipts',
                },
                requireItemizedReceiptsOver: '[it] Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `[it] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[it] Never require itemized receipts',
                    always: '[it] Always require itemized receipts',
                },
                defaultTaxRate: '[it] Default tax rate',
                enableWorkflows: (moreFeaturesLink: string) => `[it] Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: '[it] Expense policy',
                cardSubtitle: "[it] Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
            },
            spendRules: {
                title: '[it] Spend',
                subtitle: '[it] Approve or decline Expensify Card transactions in realtime.',
                defaultRuleDescription: '[it] All cards',
                block: '[it] Block',
                defaultRuleTitle: '[it] Categories: Adult services, ATMs, gambling, money transfers',
                builtInProtectionModal: {
                    title: '[it] Expensify Cards offer built-in protection - always',
                    description: `[it] Expensify always declines these charges:

  • Adult services
  • ATMs
  • Gambling
  • Money transfers

Add more spend rules to protect company cash flow.`,
                },
                addSpendRule: '[it] Add spend rule',
                editRuleTitle: '[it] Edit rule',
                cardPageTitle: '[it] Card',
                cardsSectionTitle: '[it] Cards',
                chooseCards: '[it] Choose cards',
                saveRule: '[it] Save rule',
                deleteRule: '[it] Delete rule',
                deleteRuleConfirmation: '[it] Are you sure you want to delete this rule?',
                allow: '[it] Allow',
                spendRuleSectionTitle: '[it] Spend rule',
                restrictionType: '[it] Restriction type',
                restrictionTypeHelpAllow: "[it] Charges are approved if they match any merchant or category, and don't exceed a max amount.",
                restrictionTypeHelpBlock: '[it] Charges are declined if they match any merchant or category, or exceed a max amount.',
                addMerchant: '[it] Add merchant',
                merchantContains: '[it] Merchant contains',
                merchantExactlyMatches: '[it] Merchant exactly matches',
                noBlockedMerchants: '[it] No blocked merchants',
                addMerchantToBlockSpend: '[it] Add a merchant to block spend',
                noAllowedMerchants: '[it] No allowed merchants',
                addMerchantToAllowSpend: '[it] Add a merchant to allow spend',
                matchType: '[it] Match type',
                matchTypeContains: '[it] Contains',
                matchTypeExact: '[it] Matches exactly',
                spendCategory: '[it] Spend category',
                maxAmount: '[it] Max amount',
                maxAmountHelp: '[it] Any charge over this amount will be declined, regardless of merchant and spend category restrictions.',
                currencyMismatchTitle: '[it] Currency mismatch',
                currencyMismatchPrompt: '[it] To set a max amount, select cards that settle in the same currency.',
                reviewSelectedCards: '[it] Review selected cards',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => `[it] ${summary}, +${count} more`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '[it] Apply at least one spend rule to one card',
                confirmErrorCardRequired: '[it] Card is a required field',
                confirmErrorApplyAtLeastOneSpendRule: '[it] Apply at least one spend rule',
                categories: '[it] Categories',
                merchants: '[it] Merchants',
                noAvailableCards: '[it] All cards already have a rule',
                noAvailableCardsSubtitle: '[it] Edit an existing card rule to make changes',
                noCardsIssuedTitle: '[it] No Expensify cards issued',
                noCardsIssuedSubtitle: '[it] Issue Expensify cards to create spend rules',
                max: '[it] Max',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '[it] Airlines',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '[it] Alcohol and bars',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: '[it] Amazon and bookstores',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '[it] Automotive',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: '[it] Car rentals',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '[it] Dining',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '[it] Fuel and gas',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '[it] Government and non-profits',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '[it] Groceries',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: '[it] Gyms and fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '[it] Healthcare',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: '[it] Hotels',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: '[it] Internet and phone',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '[it] Office supplies',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '[it] Parking and tolls',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: '[it] Professional services',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '[it] Retail',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '[it] Shipping and delivery',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: '[it] Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '[it] Transit and rideshare',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '[it] Travel agencies',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '[it] Collect',
                    description: '[it] For teams looking to automate their processes.',
                },
                corporate: {
                    label: '[it] Control',
                    description: '[it] For organizations with advanced requirements.',
                },
            },
            description: "[it] Choose a plan that's right for you. For a detailed list of features and pricing, check out our",
            subscriptionLink: '[it] plan types and pricing help page',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `[it] You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `[it] You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: '[it] Subscriptions',
        },
    },
    getAssistancePage: {
        title: '[it] Get assistance',
        subtitle: "[it] We're here to clear your path to greatness!",
        description: '[it] Choose from the support options below:',
        chatWithConcierge: '[it] Chat with Concierge',
        scheduleSetupCall: '[it] Schedule a setup call',
        scheduleACall: '[it] Schedule call',
        questionMarkButtonTooltip: '[it] Get assistance from our team',
        exploreHelpDocs: '[it] Explore help docs',
        registerForWebinar: '[it] Register for webinar',
        onboardingHelp: '[it] Onboarding help',
    },
    emojiPicker: {
        emojiNotSelected: '[it] Emoji not selected',
        skinTonePickerLabel: '[it] Change default skin tone',
        headers: {
            frequentlyUsed: '[it] Frequently Used',
            smileysAndEmotion: '[it] Smileys & Emotion',
            peopleAndBody: '[it] People & Body',
            animalsAndNature: '[it] Animals & Nature',
            foodAndDrink: '[it] Food & Drinks',
            travelAndPlaces: '[it] Travel & Places',
            activities: '[it] Activities',
            objects: '[it] Objects',
            symbols: '[it] Symbols',
            flags: '[it] Flags',
        },
    },
    newRoomPage: {
        newRoom: '[it] New room',
        groupName: '[it] Group name',
        roomName: '[it] Room name',
        visibility: '[it] Visibility',
        restrictedDescription: '[it] People in your workspace can find this room',
        privateDescription: '[it] People invited to this room can find it',
        publicDescription: '[it] Anyone can find this room',
        public_announceDescription: '[it] Anyone can find this room',
        createRoom: '[it] Create room',
        roomAlreadyExistsError: '[it] A room with this name already exists',
        roomNameReservedError: (reservedName: string) => `[it] ${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '[it] Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: '[it] Please enter a room name',
        pleaseSelectWorkspace: '[it] Please select a workspace',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `[it] ${actor}renamed to "${newName}" (previously "${oldName}")` : `[it] ${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: (newName: string) => `[it] Room renamed to ${newName}`,
        social: '[it] social',
        selectAWorkspace: '[it] Select a workspace',
        growlMessageOnRenameError: '[it] Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: '[it] Workspace',
            private: '[it] Private',
            public: '[it] Public',
            public_announce: '[it] Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '[it] Submit and Close',
        submitAndApprove: '[it] Submit and Approve',
        advanced: '[it] ADVANCED',
        dynamicExternal: '[it] DYNAMIC_EXTERNAL',
        smartReport: '[it] SMARTREPORT',
        billcom: '[it] BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[it] set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[it] removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `[it] changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `[it] changed the company address to "${newAddress}" (previously "${previousAddress}")` : `[it] set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[it] added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[it] removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `[it] changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `[it] added the category "${categoryName}"`,
        deleteCategory: (categoryName: string) => `[it] removed the category "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `[it] ${oldValue ? '[it] disabled' : '[it] enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[it] added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[it] removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[it] changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[it] added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[it] removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[it] changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `[it] changed the "${categoryName}" category description to ${!oldValue ? '[it] required' : '[it] not required'} (previously ${!oldValue ? '[it] not required' : '[it] required'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `[it] added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `[it] removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `[it] changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[it] added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `[it] changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[it] updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `[it] changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `[it] updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `[it] changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `[it] renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `[it] removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }
            return !oldValue
                ? `[it] added the description hint "${newValue}" to the category "${categoryName}"`
                : `[it] changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategories: (count: number) => `[it] updated ${count} categories`,
        updateTagListName: (oldName: string, newName: string) => `[it] changed the tag list name to "${newName}" (previously "${oldName}")`,
        updateTagList: (tagListName: string) => `[it] updated tags on the list "${tagListName}"`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `[it] changed tag list "${tagListsName}" to ${isRequired ? '[it] required' : '[it] not required'}`,
        importTags: '[it] imported tags from a spreadsheet',
        deletedAllTags: '[it] deleted all tags',
        addTag: (tagListName: string, tagName?: string) => `[it] added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `[it] updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `[it] ${enabled ? '[it] enabled' : '[it] disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `[it] removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `[it] removed "${count}" tags from the list "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `[it] updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `[it] updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `[it] changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `[it] ${newValue ? '[it] enabled' : '[it] disabled'} tax tracking on distance rates`,
        updateCustomUnitDefaultCategory: ({customUnitName, newValue, oldValue}: UpdatePolicyCustomUnitDefaultCategoryParams) =>
            `[it] changed the ${customUnitName} default category to "${newValue}" ${oldValue ? `[it] (previously "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `[it] imported rates for custom unit "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `[it] added a new ${customUnitName} rate "${rateName}"`,
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `[it] removed the "${customUnitName}" rate "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `[it] changed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${customUnitSubRateName}" ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `[it] removed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${removedSubRateName}"`,
        addedReportField: ({fieldType, fieldName, defaultValue}: AddedOrDeletedPolicyReportFieldParams) =>
            `[it] added ${fieldType} report field "${fieldName}"${defaultValue ? `[it]  with default value "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `[it] changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `[it] changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `[it] added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `[it] changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `[it] added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `[it] ${newValue ? '[it] enabled' : '[it] disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `[it] set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `[it] added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `[it] removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `[it] ${optionEnabled ? '[it] enabled' : '[it] disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `[it] ${allEnabled ? '[it] enabled' : '[it] disabled'} all options for the report field "${fieldName}" `;
            }
            return `[it] ${allEnabled ? '[it] enabled' : '[it] disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? '[it] enabled' : '[it] disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `[it] removed ${fieldType} Report Field "${fieldName}"`,
        addedCardFeed: (feedName: string) => `[it] added card feed "${feedName}"`,
        removedCardFeed: (feedName: string) => `[it] removed card feed "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `[it] renamed card feed to "${newName}" (previously "${oldName}")`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) => `[it] assigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[it] unassigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `[it] ${enabled ? '[it] enabled' : '[it] disabled'} cardholders to delete card transactions for card feed "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `[it] changed card feed "${feedName}" statement period end day${newValue ? `[it]  to "${newValue}"` : ''}${previousValue ? `[it]  (previously "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `[it] updated "Prevent self-approval" to "${newValue === 'true' ? '[it] Enabled' : '[it] Disabled'}" (previously "${oldValue === 'true' ? '[it] Enabled' : '[it] Disabled'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `[it] set the monthly report submission date to "${newValue}"`;
            }
            return `[it] updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `[it] updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `[it] updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `[it] turned "Enforce default report titles" ${value ? '[it] on' : '[it] off'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `[it] changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `[it] updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `[it] set the description of this workspace to "${newDescription}"`
                : `[it] updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('[it]  and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `[it] removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `[it] removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `[it] updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `[it] updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `[it] updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `[it] updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: '[it] upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `[it] This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: '[it] downgraded this workspace to the Collect plan',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `[it] changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `[it] changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        addBudget: ({frequency, entityName, entityType, shared, individual, notificationThreshold}: AddBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[it]  with notification threshold of "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `[it] added ${frequency} individual budget of "${individual}" and ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            if (typeof individual !== 'undefined') {
                return `[it] added ${frequency} individual budget of "${individual}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            return `[it] added ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
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
                changesList.push(`[it] changed budget frequency to "${newFrequency}" (previously "${oldFrequency}")`);
            }
            if (sharedChanged) {
                changesList.push(`[it] changed total workspace budget to "${newShared}" (previously "${oldShared}")`);
            }
            if (individualChanged) {
                changesList.push(`[it] changed individual budget to "${newIndividual}" (previously "${oldIndividual}")`);
            }
            if (thresholdChanged) {
                changesList.push(`[it] changed notification threshold to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `[it] updated budget for the ${entityType} "${entityName}"`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `[it] changed budget frequency for the ${entityType} "${entityName}" to "${newFrequency}" (previously "${oldFrequency}")`;
                }
                if (sharedChanged) {
                    return `[it] changed total workspace budget for the ${entityType} "${entityName}" to "${newShared}" (previously "${oldShared}")`;
                }
                if (individualChanged) {
                    return `[it] changed individual budget for the ${entityType} "${entityName}" to "${newIndividual}" (previously "${oldIndividual}")`;
                }
                return `[it] changed notification threshold for the ${entityType} "${entityName}" to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`;
            }
            return `[it] updated budget for the ${entityType} "${entityName}": ${changesList.join('; ')}`;
        },
        deleteBudget: ({entityType, entityName, frequency, individual, shared, notificationThreshold}: DeleteBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[it]  with notification threshold of "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `[it] removed ${frequency} shared budget of "${shared}" and individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (shared) {
                return `[it] removed ${frequency} shared budget of "${shared}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `[it] removed ${frequency} individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            return `[it] removed budget from the ${entityType} "${entityName}"`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} time tracking`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `[it] changed hourly rate to "${newRate}" (previously "${oldRate}")`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[it] added "${prohibitedExpense}" to prohibited expenses`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[it] removed "${prohibitedExpense}" from prohibited expenses`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `[it] changed reimbursement method to "${newReimbursementChoice}" (previously "${oldReimbursementChoice}")`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `[it] ${enabled ? '[it] enabled' : '[it] disabled'} pre-approval of workspace join requests`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `[it] changed custom report name formula to "${newDefaultTitle}" (previously "${oldDefaultTitle}")`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `[it] took over ownership of ${policyName} from ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `[it] ${enabled ? '[it] enabled' : '[it] disabled'} scheduled submit`,
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
            `[it] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". ${userEmail} is currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}.${summaryLink ? `[it]  <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
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
            `[it] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". You're currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}. ${summaryLink ? `[it] <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} categories`;
                case 'tags':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} tags`;
                case 'workflows':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} workflows`;
                case 'distance rates':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} distance rates`;
                case 'accounting':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} accounting`;
                case 'Expensify Cards':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} Expensify Cards`;
                case 'travel invoicing':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} travel invoicing`;
                case 'company cards':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} company cards`;
                case 'invoicing':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} invoicing`;
                case 'per diem':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} per diem`;
                case 'receipt partners':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} receipt partners`;
                case 'rules':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} rules`;
                case 'tax tracking':
                    return `[it] ${enabled ? '[it] enabled' : '[it] disabled'} tax tracking`;
                default:
                    return `${enabled ? '[it] enabled' : '[it] disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `[it] ${enabled ? '[it] enabled' : '[it] disabled'} attendee tracking`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `[it] ${enabled ? '[it] enabled' : '[it] disabled'} auto-pay approved reports`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `[it] set the auto-pay approved reports threshold to "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `[it] changed the auto-pay approved reports threshold to "${newLimit}" (previously "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: '[it] removed the auto-pay approved reports threshold',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `[it] changed the default approver to ${newApprover} (previously ${previousApprover})` : `[it] changed the default approver to ${newApprover}`,
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
            let text = `[it] changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `[it]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[it]  (previously default approver)';
            } else if (previousApprover) {
                text += `[it]  (previously ${previousApprover})`;
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
                ? `[it] changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `[it] changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += `[it]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[it]  (previously default approver)';
            } else if (previousApprover) {
                text += `[it]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[it] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `[it] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[it] changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `[it] changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[it] changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `[it] set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[it] changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `[it] set the invoice company website to "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser ? `[it] changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")` : `[it] changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: (enabled: boolean) => `[it] ${enabled ? '[it] enabled' : '[it] disabled'} reimbursements`,
        updateCustomTaxName: ({oldName, newName}: UpdatedPolicyCustomTaxNameParams) => `[it] changed the custom tax name to "${newName}" (previously "${oldName}")`,
        updateCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyCurrencyDefaultTaxParams) =>
            `[it] changed the workspace currency default tax rate to "${newName}" (previously "${oldName}")`,
        updateForeignCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyForeignCurrencyDefaultTaxParams) =>
            `[it] changed the foreign currency default tax rate to "${newName}" (previously "${oldName}")`,
        addTax: (taxName: string) => `[it] added the tax "${taxName}"`,
        deleteTax: (taxName: string) => `[it] removed the tax "${taxName}"`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `[it] renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `[it] changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `[it] changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `[it] ${oldValue ? '[it] disabled' : '[it] enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `[it] set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[it] changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: (oldValue: string) => `[it] removed receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `[it] set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `[it] changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: (oldValue: string) => `[it] removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: (newValue: string) => `[it] set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `[it] changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `[it] removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: '[it] Member not found.',
        useInviteButton: '[it] To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `[it] You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `[it] It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `[it] Are you sure you want to remove ${memberName} from the room?`,
            other: '[it] Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: '[it] There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: '[it] Assign task',
        assignMe: '[it] Assign to me',
        confirmTask: '[it] Confirm task',
        confirmError: '[it] Please enter a title and select a share destination',
        descriptionOptional: '[it] Description (optional)',
        pleaseEnterTaskName: '[it] Please enter a title',
        pleaseEnterTaskDestination: '[it] Please select where you want to share this task',
    },
    task: {
        task: '[it] Task',
        title: '[it] Title',
        description: '[it] Description',
        assignee: '[it] Assignee',
        completed: '[it] Completed',
        action: '[it] Complete',
        messages: {
            created: (title: string) => `[it] task for ${title}`,
            completed: '[it] marked as complete',
            canceled: '[it] deleted task',
            reopened: '[it] marked as incomplete',
            error: "[it] You don't have permission to take the requested action",
        },
        markAsComplete: '[it] Mark as complete',
        markAsIncomplete: '[it] Mark as incomplete',
        assigneeError: '[it] An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: '[it] There was an error creating this task. Please try again later.',
        deleteTask: '[it] Delete task',
        deleteConfirmation: '[it] Are you sure you want to delete this task?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `[it] ${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '[it] Keyboard shortcuts',
        subtitle: '[it] Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: '[it] Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: '[it] Mark all messages as read',
            escape: '[it] Escape dialogs',
            search: '[it] Open search dialog',
            newChat: '[it] New chat screen',
            copy: '[it] Copy comment',
            openDebug: '[it] Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: '[it] Screen share',
        screenShareRequest: '[it] Expensify is inviting you to a screen share',
    },
    search: {
        resultsAreLimited: '[it] Search results are limited.',
        viewResults: '[it] View results',
        appliedFilters: '[it] Applied filters',
        resetFilters: '[it] Reset filters',
        searchResults: {
            emptyResults: {
                title: '[it] Nothing to show',
                subtitle: `[it] Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "[it] You haven't created any expenses yet",
                subtitle: '[it] Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[it] Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "[it] You haven't created any reports yet",
                subtitle: '[it] Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[it] Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    [it] You haven't created any
                    invoices yet
                `),
                subtitle: '[it] Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[it] Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: '[it] No trips to display',
                subtitle: '[it] Get started by booking your first trip below.',
                buttonText: '[it] Book a trip',
            },
            emptySubmitResults: {
                title: '[it] No expenses to submit',
                subtitle: "[it] You're all clear. Take a victory lap!",
                buttonText: '[it] Create report',
            },
            emptyApproveResults: {
                title: '[it] No expenses to approve',
                subtitle: '[it] Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: '[it] No expenses to pay',
                subtitle: '[it] Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: '[it] No expenses to export',
                subtitle: '[it] Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: '[it] No expenses to display',
                subtitle: '[it] No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: '[it] No expenses to approve',
                subtitle: '[it] Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: '[it] Columns',
        editColumns: '[it] Edit columns',
        resetColumns: '[it] Reset columns',
        groupColumns: '[it] Group columns',
        expenseColumns: '[it] Expense Columns',
        statements: '[it] Statements',
        cardStatements: '[it] Card statements',
        monthlyAccrual: '[it] Monthly accrual',
        unapprovedCash: '[it] Unapproved cash',
        unapprovedCard: '[it] Unapproved card',
        reconciliation: '[it] Reconciliation',
        topSpenders: '[it] Top spenders',
        saveSearch: '[it] Save search',
        deleteSavedSearch: '[it] Delete saved search',
        deleteSavedSearchConfirm: '[it] Are you sure you want to delete this search?',
        searchName: '[it] Search name',
        savedSearchesMenuItemTitle: '[it] Saved',
        topCategories: '[it] Top categories',
        topMerchants: '[it] Top merchants',
        spendOverTime: '[it] Spend over time',
        groupedExpenses: '[it] grouped expenses',
        bulkActions: {
            editMultiple: '[it] Edit multiple',
            editMultipleTitle: '[it] Edit multiple expenses',
            editMultipleDescription: "[it] Changes will be set for all selected expenses and will override any previously set values. Just sayin'.",
            approve: '[it] Approve',
            pay: '[it] Pay',
            delete: '[it] Delete',
            hold: '[it] Hold',
            unhold: '[it] Remove hold',
            reject: '[it] Reject',
            duplicateExpense: ({count}: {count: number}) => `[it] Duplicate ${count === 1 ? '[it] expense' : '[it] expenses'}`,
            undelete: '[it] Undelete',
            noOptionsAvailable: '[it] No options available for the selected group of expenses.',
        },
        filtersHeader: '[it] Filters',
        filters: {
            date: {
                before: (date?: string) => `[it] Before ${date ?? ''}`,
                after: (date?: string) => `[it] After ${date ?? ''}`,
                on: (date?: string) => `[it] On ${date ?? ''}`,
                customDate: '[it] Custom date',
                customRange: '[it] Custom range',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '[it] Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '[it] Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '[it] This month',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '[it] Year to date',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '[it] Last 12 months',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '[it] Last statement',
                },
            },
            status: '[it] Status',
            keyword: '[it] Keyword',
            keywords: '[it] Keywords',
            limit: '[it] Limit',
            limitDescription: '[it] Set a limit for the results of your search.',
            currency: '[it] Currency',
            completed: '[it] Completed',
            amount: {
                lessThan: (amount?: string) => `[it] Less than ${amount ?? ''}`,
                greaterThan: (amount?: string) => `[it] Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `[it] Between ${greaterThan} and ${lessThan}`,
                equalTo: (amount?: string) => `[it] Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: '[it] Expensify',
                individualCards: '[it] Individual cards',
                closedCards: '[it] Closed cards',
                cardFeeds: '[it] Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `[it] All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `[it] All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `[it] ${name} is ${value}`,
            current: '[it] Current',
            past: '[it] Past',
            submitted: '[it] Submitted',
            approved: '[it] Approved',
            paid: '[it] Paid',
            exported: '[it] Exported',
            posted: '[it] Posted',
            withdrawn: '[it] Withdrawn',
            billable: '[it] Billable',
            reimbursable: '[it] Reimbursable',
            purchaseCurrency: '[it] Purchase currency',
            sortOrder: {
                [CONST.SEARCH.SORT_ORDER.ASC]: '[it] Ascending',
                [CONST.SEARCH.SORT_ORDER.DESC]: '[it] Descending',
            },
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '[it] From',
                [CONST.SEARCH.GROUP_BY.CARD]: '[it] Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[it] Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '[it] Category',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '[it] Merchant',
                [CONST.SEARCH.GROUP_BY.TAG]: '[it] Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: '[it] Month',
                [CONST.SEARCH.GROUP_BY.WEEK]: '[it] Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: '[it] Year',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '[it] Quarter',
            },
            feed: '[it] Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: '[it] Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '[it] Reimbursement',
            },
            is: '[it] Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '[it] Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '[it] Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '[it] Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '[it] Export',
            },
        },
        display: {
            label: '[it] Display',
            sortBy: '[it] Sort by',
            sortOrder: '[it] Sort order',
            groupBy: '[it] Group by',
            limitResults: '[it] Limit results',
        },
        has: '[it] Has',
        view: {
            label: '[it] View',
            table: '[it] Table',
            bar: '[it] Bar',
            line: '[it] Line',
            pie: '[it] Pie',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '[it] From',
            [CONST.SEARCH.GROUP_BY.CARD]: '[it] Cards',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[it] Exports',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '[it] Categories',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '[it] Merchants',
            [CONST.SEARCH.GROUP_BY.TAG]: '[it] Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: '[it] Months',
            [CONST.SEARCH.GROUP_BY.WEEK]: '[it] Weeks',
            [CONST.SEARCH.GROUP_BY.YEAR]: '[it] Years',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '[it] Quarters',
        },
        moneyRequestReport: {
            emptyStateTitle: '[it] This report has no expenses.',
            accessPlaceHolder: '[it] Open for details',
        },
        noCategory: '[it] No category',
        noMerchant: '[it] No merchant',
        noTag: '[it] No tag',
        expenseType: '[it] Expense type',
        withdrawalType: '[it] Withdrawal type',
        recentSearches: '[it] Recent searches',
        recentChats: '[it] Recent chats',
        searchIn: '[it] Search in',
        searchPlaceholder: '[it] Search for something...',
        suggestions: '[it] Suggestions',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `[it] Suggestions available${query ? `[it]  for ${query}` : ''}. ${count} result.`,
            other: (resultCount: number) => `[it] Suggestions available${query ? `[it]  for ${query}` : ''}. ${resultCount} results.`,
        }),
        exportSearchResults: {
            title: '[it] Create export',
            description: "[it] Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: '[it] Exported to',
        exportAll: {
            selectAllMatchingItems: '[it] Select all matching items',
            allMatchingItemsSelected: '[it] All matching items selected',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: '[it] Please select dates for both From and To',
        },
    },
    genericErrorPage: {
        title: '[it] Uh-oh, something went wrong!',
        body: {
            helpTextMobile: '[it] Please close and reopen the app, or switch to',
            helpTextWeb: '[it] web.',
            helpTextConcierge: '[it] If the problem persists, reach out to',
        },
        refresh: '[it] Refresh',
    },
    fileDownload: {
        success: {
            title: '[it] Downloaded!',
            message: '[it] Attachment successfully downloaded!',
            qrMessage: '[it] Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: '[it] Attachment error',
            message: "[it] Attachment can't be downloaded",
        },
        permissionError: {
            title: '[it] Storage access',
            message: "[it] Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: '[it] Pending',
            cleared: '[it] Cleared',
            failed: '[it] Failed',
        },
        failedError: ({link}: {link: string}) => `[it] We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `[it] ${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '[it] Report layout',
        groupByLabel: '[it] Group by:',
        selectGroupByOption: '[it] Select how to group report expenses',
        uncategorized: '[it] Uncategorized',
        noTag: '[it] No tag',
        selectGroup: ({groupName}: {groupName: string}) => `[it] Select all expenses in ${groupName}`,
        groupBy: {
            category: '[it] Category',
            tag: '[it] Tag',
        },
    },
    report: {
        newReport: {
            createExpense: '[it] Create expense',
            createReport: '[it] Create report',
            chooseWorkspace: '[it] Choose a workspace for this report.',
            emptyReportConfirmationTitle: '[it] You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `[it] Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationPromptLink: '[it] Reports',
            emptyReportConfirmationDontShowAgain: "[it] Don't show me this again",
            genericWorkspaceName: '[it] this workspace',
        },
        genericCreateReportFailureMessage: '[it] Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: '[it] Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: '[it] Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: '[it] Unexpected error renaming the report. Please try again later.',
        noActivityYet: '[it] No activity yet',
        connectionSettings: '[it] Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `[it] changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `[it] set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `[it] changed the workspace${fromPolicyName ? `[it]  (previously ${fromPolicyName})` : ''}`;
                    }
                    return `[it] changed the workspace to ${toPolicyName}${fromPolicyName ? `[it]  (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `[it] changed type from ${oldType} to ${newType}`,
                exportedToCSV: `[it] exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `[it] exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `[it] exported to ${label} via`,
                    automaticActionTwo: '[it] accounting settings',
                    manual: (label: string) => `[it] marked this report as manually exported to ${label}.`,
                    automaticActionThree: '[it] and successfully created a record for',
                    reimburseableLink: '[it] out-of-pocket expenses',
                    nonReimbursableLink: '[it] company card expenses',
                    pending: (label: string) => `[it] started exporting this report to ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `[it] failed to export this report to ${label} ("${errorMessage}${linkText ? `[it]  <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `[it] added a receipt`,
                managerDetachReceipt: `[it] removed a receipt`,
                markedReimbursed: (amount: string, currency: string) => `[it] paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `[it] paid ${currency}${amount} via integration`,
                outdatedBankAccount: `[it] couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounceDefault: `[it] couldn't process the payment due to an incorrect routing/account number or closed account`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `[it] couldn't process the payment: ${returnReason}`,
                reimbursementACHCancelled: `[it] canceled the payment`,
                reimbursementAccountChanged: `[it] couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `[it] processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `[it] randomly selected for review`,
                selectedForRandomAuditMarkdown: `[it] [randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `[it] invited member ${to}`,
                unshare: ({to}: UnshareParams) => `[it] removed member ${to}`,
                stripePaid: (amount: string, currency: string) => `[it] paid ${currency}${amount}`,
                takeControl: `[it] took control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `[it] Open the Expensify mobile app to review your ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}transaction`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `[it] there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `[it] The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `[it] the Plaid connection to your business bank account is broken. Please <a href='${walletRoute}'>reconnect your bank account ${maskedAccountNumber}</a> so you can continue to use your Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `[it] ${email} joined via the workspace invite link` : `[it] added ${email} as ${role === 'member' ? '[it] a' : '[it] an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `[it] updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[it] removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[it] added "${newValue}" to ${email}’s custom field 1`
                        : `[it] changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[it] removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[it] added "${newValue}" to ${email}’s custom field 2`
                        : `[it] changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `[it] ${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `[it] removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `[it] removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `[it] connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '[it] left the chat',
                leftTheChatWithName: (nameOrEmail: string) => `[it] ${nameOrEmail ? `${nameOrEmail}: ` : ''}left the chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `[it] business bank account ${maskedBankAccountNumber} has been automatically locked due to an issue with either Reimbursement or Expensify Card settlement. Please fix the issue in your <a href="${linkURL}">workspace settings</a>.`,
            },
            error: {
                invalidCredentials: '[it] Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `[it] ${summary} for ${dayCount} ${dayCount === 1 ? '[it] day' : '[it] days'} until ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `[it] ${summary} from ${timePeriod} on ${date}`,
        startTimer: '[it] Start Timer',
        stopTimer: '[it] Stop Timer',
        scheduleOOO: '[it] Schedule OOO',
        scheduleOOOTitle: '[it] Schedule Out of Office',
        date: '[it] Date',
        time: '[it] Time (use 24-hour format)',
        durationAmount: '[it] Duration',
        durationUnit: '[it] Unit',
        reason: '[it] Reason',
        workingPercentage: '[it] Working percentage',
        dateRequired: '[it] Date is required.',
        invalidTimeFormat: '[it] Please enter a valid 24-hour time (e.g., 14:30).',
        enterANumber: '[it] Please enter a number.',
        hour: '[it] hours',
        day: '[it] days',
        week: '[it] weeks',
        month: '[it] months',
    },
    footer: {
        features: '[it] Features',
        expenseManagement: '[it] Expense Management',
        spendManagement: '[it] Spend Management',
        expenseReports: '[it] Expense Reports',
        companyCreditCard: '[it] Company Credit Card',
        receiptScanningApp: '[it] Receipt Scanning App',
        billPay: '[it] Bill Pay',
        invoicing: '[it] Invoicing',
        CPACard: '[it] CPA Card',
        payroll: '[it] Payroll',
        travel: '[it] Travel',
        resources: '[it] Resources',
        expensifyApproved: '[it] ExpensifyApproved!',
        pressKit: '[it] Press Kit',
        support: '[it] Support',
        expensifyHelp: '[it] ExpensifyHelp',
        terms: '[it] Terms of Service',
        privacy: '[it] Privacy',
        learnMore: '[it] Learn More',
        aboutExpensify: '[it] About Expensify',
        blog: '[it] Blog',
        jobs: '[it] Jobs',
        expensifyOrg: '[it] Expensify.org',
        investorRelations: '[it] Investor Relations',
        getStarted: '[it] Get Started',
        createAccount: '[it] Create A New Account',
        logIn: '[it] Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '[it] Navigate back to chats list',
        chatWelcomeMessage: '[it] Chat welcome message',
        navigatesToChat: '[it] Navigates to a chat',
        newMessageLineIndicator: '[it] New message line indicator',
        chatMessage: '[it] Chat message',
        lastChatMessagePreview: '[it] Last chat message preview',
        workspaceName: '[it] Workspace name',
        chatUserDisplayNames: '[it] Chat member display names',
        scrollToNewestMessages: '[it] Scroll to newest messages',
        preStyledText: '[it] Pre-styled text',
        viewAttachment: '[it] View attachment',
        contextMenuAvailable: '[it] Context menu available. Press Shift+F10 to open.',
        contextMenuAvailableMacOS: '[it] Context menu available. Press VO-Shift-M to open.',
        contextMenuAvailableNative: '[it] Context menu available. Double-tap and hold to open.',
        selectAllFeatures: '[it] Select all features',
        selectAllTransactions: '[it] Select all transactions',
        selectAllItems: '[it] Select all items',
    },
    parentReportAction: {
        deletedReport: '[it] Deleted report',
        deletedMessage: '[it] Deleted message',
        deletedExpense: '[it] Deleted expense',
        reversedTransaction: '[it] Reversed transaction',
        deletedTask: '[it] Deleted task',
        hiddenMessage: '[it] Hidden message',
    },
    threads: {
        thread: '[it] Thread',
        replies: '[it] Replies',
        reply: '[it] Reply',
        from: '[it] From',
        in: '[it] in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `[it] From ${reportName}${workspaceName ? `[it]  in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: '[it] QR code',
        copy: '[it] Copy URL',
        copied: '[it] Copied!',
    },
    moderation: {
        flagDescription: '[it] All flagged messages will be sent to a moderator for review.',
        chooseAReason: '[it] Choose a reason for flagging below:',
        spam: '[it] Spam',
        spamDescription: '[it] Unsolicited off-topic promotion',
        inconsiderate: '[it] Inconsiderate',
        inconsiderateDescription: '[it] Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: '[it] Intimidation',
        intimidationDescription: '[it] Aggressively pursuing an agenda over valid objections',
        bullying: '[it] Bullying',
        bullyingDescription: '[it] Targeting an individual to obtain obedience',
        harassment: '[it] Harassment',
        harassmentDescription: '[it] Racist, misogynistic, or other broadly discriminatory behavior',
        assault: '[it] Assault',
        assaultDescription: '[it] Specifically targeted emotional attack with the intention of harm',
        flaggedContent: '[it] This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: '[it] Hide message',
        revealMessage: '[it] Reveal message',
        levelOneResult: '[it] Sends anonymous warning and message is reported for review.',
        levelTwoResult: '[it] Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: '[it] Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '[it] Invite to submit expenses',
        inviteToChat: '[it] Invite to chat only',
        nothing: '[it] Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '[it] Accept',
        decline: '[it] Decline',
    },
    actionableMentionTrackExpense: {
        submit: '[it] Submit it to someone',
        categorize: '[it] Categorize it',
        share: '[it] Share it with my accountant',
        nothing: '[it] Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: '[it] Teachers Unite',
        joinExpensifyOrg:
            '[it] Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: '[it] I know a teacher',
        iAmATeacher: '[it] I am a teacher',
        personalKarma: {
            title: '[it] Enable Personal Karma',
            description: '[it] Donate $1 to Expensify.org for every $500 you spend each month',
            stopDonationsPrompt: '[it] Are you sure you want to stop donating to Expensify.org?',
        },
        getInTouch: '[it] Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: '[it] Intro to your school principal',
        schoolPrincipalVerifyExpense:
            '[it] Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: '[it] Principal first name',
        principalLastName: '[it] Principal last name',
        principalWorkEmail: '[it] Principal work email',
        updateYourEmail: '[it] Update your email address',
        updateEmail: '[it] Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `[it] Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: '[it] Enter a valid email or phone number',
            enterEmail: '[it] Enter an email',
            enterValidEmail: '[it] Enter a valid email',
            tryDifferentEmail: '[it] Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: '[it] Not activated',
        outOfPocket: '[it] Reimbursable',
        companySpend: '[it] Non-reimbursable',
        personalCard: '[it] Personal card',
        companyCard: '[it] Company card',
        expensifyCard: '[it] Expensify Card',
        centralInvoicing: '[it] Central invoicing',
    },
    distance: {
        addStop: '[it] Add stop',
        address: '[it] Address',
        waypointDescription: {
            start: '[it] Start',
            stop: '[it] Stop',
        },
        mapPending: {
            title: '[it] Map pending',
            subtitle: '[it] The map will be generated when you go back online',
            onlineSubtitle: '[it] One moment while we set up the map',
            errorTitle: '[it] Map error',
            errorSubtitle: '[it] There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: '[it] Please select a suggested address or use current location',
        },
        odometer: {
            startReading: '[it] Start reading',
            endReading: '[it] End reading',
            saveForLater: '[it] Save for later',
            totalDistance: '[it] Total distance',
            startTitle: '[it] Odometer start photo',
            endTitle: '[it] Odometer end photo',
            deleteOdometerPhoto: '[it] Delete odometer photo',
            deleteOdometerPhotoConfirmation: '[it] Are you sure you want to delete this odometer photo?',
            startMessageWeb: '[it] Add a photo of your odometer from the <strong>start</strong> of your trip. Drag a file here or choose one to upload.',
            endMessageWeb: '[it] Add a photo of your odometer from the <strong>end</strong> of your trip. Drag a file here or choose one to upload.',
            cameraAccessRequired: '[it] Camera access is required to take pictures.',
            snapPhotoStart: '[it] <muted-text-label>Snap a photo of your odometer at the <strong>start</strong> of your trip.</muted-text-label>',
            snapPhotoEnd: '[it] <muted-text-label>Snap a photo of your odometer at the <strong>end</strong> of your trip.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '[it] Failed to start location tracking.',
            failedToGetPermissions: '[it] Failed to get required location permissions.',
        },
        trackingDistance: '[it] Tracking distance...',
        stopped: '[it] Stopped',
        start: '[it] Start',
        stop: '[it] Stop',
        discard: '[it] Discard',
        stopGpsTrackingModal: {
            title: '[it] Stop GPS tracking',
            prompt: '[it] Are you sure? This will end your current journey.',
            cancel: '[it] Resume tracking',
            confirm: '[it] Stop GPS tracking',
        },
        discardDistanceTrackingModal: {
            title: '[it] Discard distance tracking',
            prompt: "[it] Are you sure? This will discard your current journey and can't be undone.",
            confirm: '[it] Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "[it] Can't create expense",
            prompt: "[it] You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: '[it] Location access required',
            prompt: '[it] Please allow location access in your device settings to start GPS distance tracking.',
            allow: '[it] Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: '[it] Background location access required',
            prompt: '[it] Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: '[it] Precise location required',
            prompt: '[it] Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: '[it] Track distance on your phone',
            subtitle: '[it] Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: '[it] Download the app',
        },
        notification: {
            title: '[it] GPS tracking in progress',
            body: '[it] Go to the app to finish',
        },
        continueGpsTripModal: {
            title: '[it] Continue GPS trip recording?',
            prompt: '[it] Looks like the app closed during your last GPS trip. Would you like to continue recording from that trip?',
            confirm: '[it] Continue trip',
            cancel: '[it] View trip',
        },
        signOutWarningTripInProgress: {
            title: '[it] GPS tracking in progress',
            prompt: '[it] Are you sure you want to discard the trip and sign out?',
            confirm: '[it] Discard and sign out',
        },
        switchToODWarningTripInProgress: {
            title: '[it] GPS tracking in progress',
            prompt: '[it] Are you sure you want to stop GPS tracking and switch to Expensify Classic?',
            confirm: '[it] Stop and switch',
        },
        switchAccountWarningTripInProgress: {
            title: '[it] GPS tracking in progress',
            prompt: '[it] Are you sure you want to stop GPS tracking and switch accounts?',
            confirm: '[it] Stop and switch',
        },
        locationServicesRequiredModal: {
            title: '[it] Location access required',
            confirm: '[it] Open settings',
            prompt: '[it] Please allow location access in your device settings to start GPS distance tracking.',
        },
        gpsFloatingPillText: '[it] GPS tracking in progress...',
        liveActivity: {
            subtitle: '[it] Tracking distance',
            button: '[it] View progress',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '[it] Report card lost or damaged',
        nextButtonLabel: '[it] Next',
        reasonTitle: '[it] Why do you need a new card?',
        cardDamaged: '[it] My card was damaged',
        cardLostOrStolen: '[it] My card was lost or stolen',
        confirmAddressTitle: '[it] Please confirm the mailing address for your new card.',
        cardDamagedInfo: '[it] Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: '[it] Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: '[it] Address',
        deactivateCardButton: '[it] Deactivate card',
        shipNewCardButton: '[it] Ship new card',
        addressError: '[it] Address is required',
        reasonError: '[it] Reason is required',
        successTitle: '[it] Your new card is on the way!',
        successDescription: "[it] You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: '[it] Guaranteed eReceipt',
        transactionDate: '[it] Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '[it] Start a chat, <success><strong>refer a friend</strong></success>.',
            header: '[it] Start a chat, refer a friend',
            closeAccessibilityLabel: '[it] Close, start a chat, refer a friend, banner',
            body: "[it] Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '[it] Submit an expense, <success><strong>refer your team</strong></success>.',
            header: '[it] Submit an expense, refer your team',
            closeAccessibilityLabel: '[it] Close, submit an expense, refer your team, banner',
            body: "[it] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '[it] Refer a friend',
            body: "[it] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '[it] Refer a friend',
            header: '[it] Refer a friend',
            body: "[it] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: '[it] Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `[it] Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `[it] Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: '[it] All tags required',
        autoReportedRejectedExpense: '[it] This expense was rejected.',
        billableExpense: '[it] Billable no longer valid',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `[it] Receipt required${formattedLimit ? `[it]  over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '[it] Category no longer valid',
        conversionSurcharge: (surcharge: number) => `[it] Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: '[it] Rate not valid for this workspace',
        duplicatedTransaction: '[it] Potential duplicate',
        fieldRequired: '[it] Report fields are required',
        futureDate: '[it] Future date not allowed',
        invoiceMarkup: (invoiceMarkup: number) => `[it] Marked up by ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `[it] Date older than ${maxAge} days`,
        missingCategory: '[it] Missing category',
        missingComment: '[it] Description required for selected category',
        missingAttendees: '[it] Multiple attendees required for this category',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `[it] Missing ${tagName ?? '[it] tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '[it] Amount differs from calculated distance';
                case 'card':
                    return '[it] Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `[it] Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return '[it] Amount greater than scanned receipt';
            }
        },
        modifiedDate: '[it] Date differs from scanned receipt',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `[it] Distance exceeds the calculated route of ${formattedRouteDistance}` : '[it] Distance exceeds the calculated route',
        nonExpensiworksExpense: '[it] Non-Expensiworks expense',
        overAutoApprovalLimit: (formattedLimit: string) => `[it] Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `[it] Amount over ${formattedLimit}/person category limit`,
        overLimit: (formattedLimit: string) => `[it] Amount over ${formattedLimit}/person limit`,
        overTripLimit: (formattedLimit: string) => `[it] Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: (formattedLimit: string) => `[it] Amount over ${formattedLimit}/person limit`,
        perDayLimit: (formattedLimit: string) => `[it] Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: '[it] Receipt and expense details added manually.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `[it] Receipt required over ${formattedLimit} category limit`;
            }
            if (formattedLimit) {
                return `[it] Receipt required over ${formattedLimit}`;
            }
            if (category) {
                return `[it] Receipt required over category limit`;
            }
            return '[it] Receipt required';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `[it] Itemized receipt required${formattedLimit ? `[it]  over ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '[it] Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `[it] alcohol`;
                    case 'gambling':
                        return `[it] gambling`;
                    case 'tobacco':
                        return `[it] tobacco`;
                    case 'adultEntertainment':
                        return `[it] adult entertainment`;
                    case 'hotelIncidentals':
                        return `[it] hotel incidentals`;
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
        reviewRequired: '[it] Review required',
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
                return "[it] Can't auto-match receipt due to broken bank connection.";
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return "[it] Can't auto-match receipt due to broken bank connection.";
                }
                return isMarkAsCash
                    ? `[it] Can't auto-match receipt due to broken card connection. Mark as cash to ignore, or <a href="${connectionLink}">fix the card</a> to match the receipt.`
                    : `[it] Can't auto-match receipt due to broken card connection. <a href="${connectionLink}">Fix the card</a> to match the receipt.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `[it] Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : '[it] Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `[it] Ask ${member} to mark as a cash or wait 7 days and try again` : '[it] Awaiting merge with card transaction.';
            }
            return '';
        },
        brokenConnection530Error: '[it] Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `[it] <muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: '[it] Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: '[it] Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true}) => `[it] Receipt scanning failed.${canEdit ? '[it]  Enter details manually.' : ''}`,
        receiptGeneratedWithAI: '[it] Potential AI-generated receipt',
        someTagLevelsRequired: (tagName?: string) => `[it] Missing ${tagName ?? '[it] Tag'}`,
        tagOutOfPolicy: (tagName?: string) => `[it] ${tagName ?? '[it] Tag'} no longer valid`,
        taxAmountChanged: '[it] Tax amount was modified',
        taxOutOfPolicy: (taxName?: string) => `[it] ${taxName ?? '[it] Tax'} no longer valid`,
        taxRateChanged: '[it] Tax rate was modified',
        taxRequired: '[it] Missing tax rate',
        none: '[it] None',
        taxCodeToKeep: '[it] Choose which tax code to keep',
        tagToKeep: '[it] Choose which tag to keep',
        isTransactionReimbursable: '[it] Choose if transaction is reimbursable',
        merchantToKeep: '[it] Choose which merchant to keep',
        descriptionToKeep: '[it] Choose which description to keep',
        categoryToKeep: '[it] Choose which category to keep',
        isTransactionBillable: '[it] Choose if transaction is billable',
        keepThisOne: '[it] Keep this one',
        confirmDetails: `[it] Confirm the details you're keeping`,
        confirmDuplicatesInfo: `[it] The duplicates you don't keep will be held for the submitter to delete.`,
        hold: '[it] This expense was put on hold',
        resolvedDuplicates: '[it] resolved the duplicate',
        companyCardRequired: '[it] Company card purchases required',
        noRoute: '[it] Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `[it] ${fieldName} is required`,
        reportContainsExpensesWithViolations: '[it] Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: '[it] marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: '[it] resolved the duplicate',
        },
    },
    videoPlayer: {
        play: '[it] Play',
        pause: '[it] Pause',
        fullscreen: '[it] Fullscreen',
        playbackSpeed: '[it] Playback speed',
        expand: '[it] Expand',
        mute: '[it] Mute',
        unmute: '[it] Unmute',
        normal: '[it] Normal',
    },
    exitSurvey: {
        header: '[it] Before you go',
        reasonPage: {
            title: "[it] Please tell us why you're leaving",
            subtitle: '[it] Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[it] I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "[it] I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[it] I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[it] What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '[it] What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[it] Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: '[it] Your response',
        thankYou: '[it] Thanks for the feedback!',
        thankYouSubtitle: '[it] Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: '[it] Switch to Expensify Classic',
        offlineTitle: "[it] Looks like you're stuck here...",
        offline:
            "[it] You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: '[it] Quick tip...',
        quickTipSubTitle: '[it] You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: '[it] Book a call',
        bookACallTitle: '[it] Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '[it] Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '[it] Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '[it] Travel and expense at the speed of chat',
        },
        bookACallTextTop: '[it] By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: '[it] We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: '[it] Take me to Expensify Classic',
    },
    listBoundary: {
        errorMessage: '[it] An error occurred while loading more messages',
        tryAgain: '[it] Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: '[it] matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: '[it] Authenticate payment card',
        mobileReducedFunctionalityMessage: '[it] You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `[it] Free trial: ${numOfDays} ${numOfDays === 1 ? '[it] day' : '[it] days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '[it] Your payment info is outdated',
                subtitle: (date: string) => `[it] Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '[it] Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `[it] Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : '[it] Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: '[it] Your payment info is outdated',
                subtitle: (date: string) => `[it] Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '[it] Your payment info is outdated',
                subtitle: '[it] Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: '[it] Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `[it] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: '[it] Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `[it] Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: '[it] Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `[it] Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: '[it] Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `[it] Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: '[it] Your card is expiring soon',
                subtitle: '[it] Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: '[it] Success!',
                subtitle: '[it] Your card has been billed successfully.',
            },
            retryBillingError: {
                title: '[it] Your card couldn’t be charged',
                subtitle: '[it] Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `[it] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '[it] Start a free trial',
                subtitle: '[it] As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: (numOfDays: number) => `[it] Trial: ${numOfDays} ${numOfDays === 1 ? '[it] day' : '[it] days'} left!`,
                subtitle: '[it] Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: '[it] Your free trial has ended',
                subtitle: '[it] Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: '[it] Claim offer',
                subscriptionPageTitle: (discountType: number) => `[it] <strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `[it] Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `[it] Claim within ${days > 0 ? `[it] ${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '[it] Payment',
            subtitle: '[it] Add a card to pay for your Expensify subscription.',
            addCardButton: '[it] Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `[it] Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `[it] Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `[it] Card ending in ${cardNumber}`,
            changeCard: '[it] Change payment card',
            changeCurrency: '[it] Change payment currency',
            cardNotFound: '[it] No payment card added',
            retryPaymentButton: '[it] Retry payment',
            authenticatePayment: '[it] Authenticate payment',
            requestRefund: '[it] Request refund',
            requestRefundModal: {
                full: '[it] Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: '[it] Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: '[it] View payment history',
        },
        yourPlan: {
            title: '[it] Your plan',
            exploreAllPlans: '[it] Explore all plans',
            customPricing: '[it] Custom pricing',
            asLowAs: (price: string) => `[it] as low as ${price} per active member/month`,
            pricePerMemberMonth: (price: string) => `[it] ${price} per member/month`,
            pricePerMemberPerMonth: (price: string) => `[it] ${price} per member per month`,
            perMemberMonth: '[it] per member/month',
            collect: {
                title: '[it] Collect',
                description: '[it] The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[it] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[it] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[it] Receipt scanning',
                benefit2: '[it] Reimbursements',
                benefit3: '[it] Corporate card management',
                benefit4: '[it] Expense and travel approvals',
                benefit5: '[it] Travel booking and rules',
                benefit6: '[it] QuickBooks/Xero integrations',
                benefit7: '[it] Chat on expenses, reports, and rooms',
                benefit8: '[it] AI and human support',
            },
            control: {
                title: '[it] Control',
                description: '[it] Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[it] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[it] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[it] Everything in the Collect plan',
                benefit2: '[it] Multi-level approval workflows',
                benefit3: '[it] Custom expense rules',
                benefit4: '[it] ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: '[it] HR integrations (Workday, Certinia)',
                benefit6: '[it] SAML/SSO',
                benefit7: '[it] Custom insights and reporting',
                benefit8: '[it] Budgeting',
            },
            thisIsYourCurrentPlan: '[it] This is your current plan',
            downgrade: '[it] Downgrade to Collect',
            upgrade: '[it] Upgrade to Control',
            addMembers: '[it] Add members',
            saveWithExpensifyTitle: '[it] Save with the Expensify Card',
            saveWithExpensifyDescription: '[it] Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: '[it] Learn more',
        },
        compareModal: {
            comparePlans: '[it] Compare Plans',
            subtitle: `[it] <muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: '[it] Subscription details',
            annual: '[it] Annual subscription',
            taxExempt: '[it] Request tax exempt status',
            taxExemptEnabled: '[it] Tax exempt',
            taxExemptStatus: '[it] Tax exempt status',
            payPerUse: '[it] Pay-per-use',
            subscriptionSize: '[it] Subscription size',
            headsUp:
                "[it] Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: '[it] Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: '[it] Subscription size',
            yourSize: '[it] Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                '[it] Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: '[it] Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: '[it] Confirm your new annual subscription details:',
            subscriptionSize: '[it] Subscription size',
            activeMembers: (size: number) => `[it] ${size} active members/month`,
            subscriptionRenews: '[it] Subscription renews',
            youCantDowngrade: '[it] You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: (size: number, date: string) =>
                `[it] You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: '[it] Please enter a valid subscription size',
                sameSize: '[it] Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: '[it] Add payment card',
            enterPaymentCardDetails: '[it] Enter your payment card details',
            security: '[it] Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: '[it] Learn more about our security.',
        },
        expensifyCode: {
            title: '[it] Expensify code',
            discountCode: '[it] Discount code',
            enterCode: '[it] Enter an Expensify code to apply to your subscription.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `[it] You will get a ${promoDiscount}% discount on your next ${validBillingCycles ? `${validBillingCycles} ` : ''}billing charges.`,
            apply: '[it] Apply',
            error: {
                invalid: '[it] This code is invalid',
            },
        },
        subscriptionSettings: {
            title: '[it] Subscription settings',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `[it] Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}${expensifyCode ? `[it] , Expensify code: ${expensifyCode}` : ''}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: '[it] none',
            on: '[it] on',
            off: '[it] off',
            annual: '[it] Annual',
            autoRenew: '[it] Auto-renew',
            autoIncrease: '[it] Auto-increase annual seats',
            saveUpTo: (amountWithCurrency: string) => `[it] Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                '[it] Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: '[it] Disable auto-renew',
            helpUsImprove: '[it] Help us improve Expensify',
            whatsMainReason: "[it] What's the main reason you're disabling auto-renew?",
            renewsOn: (date: string) => `[it] Renews on ${date}.`,
            pricingConfiguration: '[it] Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `[it] <muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `[it] <a href="adminsRoom">#admins room.</a>` : '[it] #admins room.'}</muted-text>`,
            estimatedPrice: '[it] Estimated price',
            changesBasedOn: '[it] This changes based on your Expensify Card usage and the subscription options below.',
            collectBillingDescription: '[it] Collect workspaces are billed monthly per member, with no annual commitment.',
            pricing: '[it] Pricing',
        },
        requestEarlyCancellation: {
            title: '[it] Request early cancellation',
            subtitle: '[it] What’s the main reason you’re requesting early cancellation?',
            subscriptionCanceled: {
                title: '[it] Subscription canceled',
                subtitle: '[it] Your annual subscription has been canceled.',
                info: '[it] If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `[it] If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: '[it] Request submitted',
                subtitle:
                    '[it] Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `[it] By requesting early cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: '[it] Functionality needs improvement',
        tooExpensive: '[it] Too expensive',
        inadequateSupport: '[it] Inadequate customer support',
        businessClosing: '[it] Company closing, downsizing, or acquired',
        additionalInfoTitle: '[it] What software are you moving to and why?',
        additionalInfoInputLabel: '[it] Your response',
    },
    roomChangeLog: {
        updateRoomDescription: '[it] set the room description to:',
        clearRoomDescription: '[it] cleared the room description',
        changedRoomAvatar: '[it] changed the room avatar',
        removedRoomAvatar: '[it] removed the room avatar',
    },
    delegate: {
        switchAccount: '[it] Switch accounts:',
        copilotDelegatedAccess: '[it] Copilot: Delegated access',
        copilotDelegatedAccessDescription: '[it] Allow other members to access your account.',
        learnMoreAboutDelegatedAccess: '[it] Learn more about delegated access',
        addCopilot: '[it] Add copilot',
        membersCanAccessYourAccount: '[it] These members can access your account:',
        youCanAccessTheseAccounts: '[it] You can access these accounts via the account switcher:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[it] Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[it] Limited';
                default:
                    return '';
            }
        },
        genericError: '[it] Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `[it] on behalf of ${delegator}`,
        accessLevel: '[it] Access level',
        confirmCopilot: '[it] Confirm your copilot below.',
        accessLevelDescription: '[it] Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[it] Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[it] Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: '[it] Remove copilot',
        removeCopilotConfirmation: '[it] Are you sure you want to remove this copilot?',
        changeAccessLevel: '[it] Change access level',
        makeSureItIsYou: "[it] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[it] Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `[it] Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '[it] Not so fast...',
        noAccessMessage: dedent(`
            [it] As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `[it] As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: '[it] Copilot access',
    },
    debug: {
        debug: '[it] Debug',
        details: '[it] Details',
        JSON: '[it] JSON',
        reportActions: '[it] Actions',
        reportActionPreview: '[it] Preview',
        nothingToPreview: '[it] Nothing to preview',
        editJson: '[it] Edit JSON:',
        preview: '[it] Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `[it] Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `[it] Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `[it] Invalid value - Expected: ${expectedValues}`,
        missingValue: '[it] Missing value',
        createReportAction: '[it] Create Report Action',
        reportAction: '[it] Report Action',
        report: '[it] Report',
        transaction: '[it] Transaction',
        violations: '[it] Violations',
        transactionViolation: '[it] Transaction Violation',
        hint: "[it] Data changes won't be sent to the backend",
        textFields: '[it] Text fields',
        numberFields: '[it] Number fields',
        booleanFields: '[it] Boolean fields',
        constantFields: '[it] Constant fields',
        dateTimeFields: '[it] DateTime fields',
        date: '[it] Date',
        time: '[it] Time',
        none: '[it] None',
        visibleInLHN: '[it] Visible in LHN',
        GBR: '[it] GBR',
        RBR: '[it] RBR',
        true: '[it] true',
        false: '[it] false',
        viewReport: '[it] View Report',
        viewTransaction: '[it] View transaction',
        createTransactionViolation: '[it] Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: '[it] Has draft comment',
            hasGBR: '[it] Has GBR',
            hasRBR: '[it] Has RBR',
            pinnedByUser: '[it] Pinned by member',
            hasIOUViolations: '[it] Has IOU violations',
            hasAddWorkspaceRoomErrors: '[it] Has add workspace room errors',
            isUnread: '[it] Is unread (focus mode)',
            isArchived: '[it] Is archived (most recent mode)',
            isSelfDM: '[it] Is self DM',
            isFocused: '[it] Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: '[it] Has join request (admin room)',
            isUnreadWithMention: '[it] Is unread with mention',
            isWaitingForAssigneeToCompleteAction: '[it] Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: '[it] Has child report awaiting action',
            hasMissingInvoiceBankAccount: '[it] Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: '[it] Has unresolved card fraud alert',
            hasDEWApproveFailed: '[it] Has DEW approve failed',
        },
        reasonRBR: {
            hasErrors: '[it] Has errors in report or report actions data',
            hasViolations: '[it] Has violations',
            hasTransactionThreadViolations: '[it] Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "[it] There's a report awaiting action",
            theresAReportWithErrors: "[it] There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "[it] There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "[it] There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: '[it] There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "[it] There's a problem with a contact method",
            aContactMethodRequiresVerification: '[it] A contact method requires verification',
            theresAProblemWithAPaymentMethod: "[it] There's a problem with a payment method",
            theresAProblemWithAWorkspace: "[it] There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "[it] There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "[it] There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: '[it] Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: '[it] There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "[it] There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "[it] There's a problem with your wallet terms",
            aBankAccountIsLocked: '[it] A bank account is locked',
        },
    },
    emptySearchView: {
        takeATestDrive: '[it] Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: '[it] Welcome to New Expensify!',
        subtitle: "[it] It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "[it] Let's go!",
        helpText: '[it] Try 2-min demo',
        features: {
            search: '[it] More powerful search on mobile, web, and desktop',
            concierge: '[it] Built-in Concierge AI to help automate your expenses',
            chat: '[it] Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '[it] <tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '[it] <tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '[it] <tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        scanTestTooltip: {
            main: '[it] <tooltip><strong>Scan our test receipt</strong> to see how it works!</tooltip>',
            manager: '[it] <tooltip>Choose our <strong>test manager</strong> to try it out!</tooltip>',
            confirmation: '[it] <tooltip>Now, <strong>submit your expense</strong> and watch the\nmagic happen!</tooltip>',
            tryItOut: '[it] Try it out',
        },
        outstandingFilter: '[it] <tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '[it] <tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "[it] <tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
        hasFilterNegation: '[it] <tooltip>Search for expenses without receipts using <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '[it] Discard changes?',
        body: '[it] Are you sure you want to discard the changes you made?',
        confirmText: '[it] Discard changes',
    },
    scheduledCall: {
        book: {
            title: '[it] Schedule call',
            description: '[it] Find a time that works for you.',
            slots: ({date}: {date: string}) => `[it] <muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '[it] Confirm call',
            description: "[it] Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: '[it] Your setup specialist',
            meetingLength: '[it] Meeting length',
            dateTime: '[it] Date & time',
            minutes: '[it] 30 minutes',
        },
        callScheduled: '[it] Call scheduled',
    },
    autoSubmitModal: {
        title: '[it] All clear and submitted!',
        description: '[it] All warnings and violations has been cleared so:',
        submittedExpensesTitle: '[it] These expenses have been submitted',
        submittedExpensesDescription: '[it] These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: '[it] Pending expenses have been moved',
        pendingExpensesDescription: '[it] Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '[it] Take a 2-minute test drive',
        },
        modal: {
            title: '[it] Take us for a test drive',
            description: '[it] Take a quick product tour to get up to speed fast.',
            confirmText: '[it] Start test drive',
            helpText: '[it] Skip',
            employee: {
                description: '[it] <muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "[it] Enter your boss's email",
                error: '[it] That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "[it] You're currently test driving Expensify",
            readyForTheRealThing: '[it] Ready for the real thing?',
            getStarted: '[it] Get started',
        },
        employeeInviteMessage: (name: string) => `[it] # ${name} invited you to test drive Expensify
Hey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.

Here’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: '[it] Basic export',
        reportLevelExport: '[it] All Data - report level',
        expenseLevelExport: '[it] All Data - expense level',
        exportInProgress: '[it] Export in progress',
        conciergeWillSend: '[it] Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: '[it] Not verified',
        retry: '[it] Retry',
        verifyDomain: {
            title: '[it] Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `[it] Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `[it] Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: '[it] Add the following TXT record:',
            saveChanges: '[it] Save changes and return here to verify your domain.',
            youMayNeedToConsult: `[it] You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: '[it] After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: '[it] Couldn’t fetch verification code',
            genericError: "[it] We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: '[it] Domain verified',
            header: '[it] Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `[it] <muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: '[it] SAML',
        samlFeatureList: {
            title: '[it] SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `[it] <muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: '[it] Faster and easier login',
            moreSecurityAndControl: '[it] More security and control',
            onePasswordForAnything: '[it] One password for everything',
        },
        goToDomain: '[it] Go to domain',
        samlLogin: {
            title: '[it] SAML login',
            subtitle: `[it] <muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a>.</muted-text>`,
            enableSamlLogin: '[it] Enable SAML login',
            allowMembers: '[it] Allow members to log in with SAML.',
            requireSamlLogin: '[it] Require SAML login',
            anyMemberWillBeRequired: '[it] Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "[it] Couldn't update SAML enablement setting",
            requireError: "[it] Couldn't update SAML requirement setting",
            disableSamlRequired: '[it] Disable SAML required',
            oktaWarningPrompt: '[it] Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: '[it] Please add Identity Provider metadata below to enable',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `[it] <muted-text>Please disable <a href="${twoFactorAuthSettingsUrl}">force two-factor authentication</a> to enable SAML login.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: '[it] SAML configuration details',
            subtitle: '[it] Use these details to get SAML set up.',
            identityProviderMetadata: '[it] Identity Provider Metadata',
            entityID: '[it] Entity ID',
            nameIDFormat: '[it] Name ID Format',
            loginUrl: '[it] Login URL',
            acsUrl: '[it] ACS (Assertion Consumer Service) URL',
            logoutUrl: '[it] Logout URL',
            sloUrl: '[it] SLO (Single Logout) URL',
            serviceProviderMetaData: '[it] Service Provider MetaData',
            oktaScimToken: '[it] Okta SCIM Token',
            revealToken: '[it] Reveal token',
            fetchError: "[it] Couldn't fetch SAML configuration details",
            setMetadataGenericError: "[it] Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: '[it] Access restricted',
            subtitle: (domainName: string) => `[it] Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: '[it] Company card management',
            accountCreationAndDeletion: '[it] Account creation and deletion',
            workspaceCreation: '[it] Workspace creation',
            samlSSO: '[it] SAML SSO',
        },
        addDomain: {
            title: '[it] Add domain',
            subtitle: '[it] Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: '[it] Domain name',
            newDomain: '[it] New domain',
        },
        domainAdded: {
            title: '[it] Domain added',
            description: "[it] Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: '[it] Configure',
        },
        enhancedSecurity: {
            title: '[it] Enhanced security',
            subtitle: '[it] Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: '[it] Enable',
        },
        domainAdmins: '[it] Domain admins',
        admins: {
            title: '[it] Admins',
            findAdmin: '[it] Find admin',
            primaryContact: '[it] Primary contact',
            addPrimaryContact: '[it] Add primary contact',
            setPrimaryContactError: '[it] Unable to set primary contact. Please try again later.',
            consolidatedDomainBilling: '[it] Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `[it] <comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "[it] Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: '[it] Add admin',
            addAdminError: '[it] Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: '[it] Revoke admin access',
            cantRevokeAdminAccess: "[it] Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: '[it] Unable to remove this user as an Admin. Please try again.',
                removeDomain: '[it] Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: '[it] Please enter your domain name to reset it.',
            },
            resetDomain: '[it] Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `[it] Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: '[it] Enter your domain name here',
            resetDomainInfo: `[it] This action is <strong>permanent</strong> and the following data will be deleted: <br/> <bullet-list><bullet-item>Company card connections and any unreported expenses from those cards</bullet-item><bullet-item>SAML and group settings</bullet-item></bullet-list> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        domainMembers: '[it] Domain members',
        members: {
            title: '[it] Members',
            findMember: '[it] Find member',
            addMember: '[it] Add member',
            emptyMembers: {
                title: '[it] No members in this group',
                subtitle: '[it] Add a member or try changing the filter above.',
            },
            allMembers: '[it] All members',
            email: '[it] Email address',
            closeAccountPrompt: '[it] Are you sure? This action is permanent.',
            forceCloseAccount: () => ({
                one: '[it] Force close account',
                other: '[it] Force close accounts',
            }),
            safeCloseAccount: () => ({
                one: '[it] Close account safely',
                other: '[it] Close accounts safely',
            }),
            closeAccountInfo: () => ({
                one: '[it] We recommend closing the account safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected account.',
                other: '[it] We recommend closing the accounts safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected accounts.',
            }),
            closeAccount: () => ({
                one: '[it] Close account',
                other: '[it] Close accounts',
            }),
            moveToGroup: '[it] Move to group',
            chooseWhereToMove: ({count}: {count: number}) => `[it] Choose where to move ${count} ${count === 1 ? '[it] member' : '[it] members'}.`,
            error: {
                addMember: '[it] Unable to add this member. Please try again.',
                removeMember: '[it] Unable to remove this user. Please try again.',
                moveMember: '[it] Unable to move this member. Please try again.',
                vacationDelegate: '[it] Unable to set this user as a vacation delegate. Please try again.',
            },
            cannotSetVacationDelegateForMember: (email: string) => `[it] You can't set a vacation delegate for ${email} because they're currently the delegate for the following members:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `[it] Are you sure? This will lock <strong>${email}'s</strong> account. <br /><br /> Our team will then review the account and remove any unauthorized access. To regain access, they'll need to work with Concierge.`,
            reportSuspiciousActivityConfirmationPrompt: '[it] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        },
        common: {
            settings: '[it] Settings',
            forceTwoFactorAuth: '[it] Force two-factor authentication',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `[it] <muted-text>Please disable <a href="${samlPageUrl}">SAML</a> to force two-factor authentication.</muted-text>`,
            forceTwoFactorAuthDescription: `[it] <muted-text>Require two-factor authentication for all members of this domain. Domain members will be prompted to set up two-factor authentication on their account when they sign in.</muted-text>`,
            forceTwoFactorAuthError: "[it] Force two-factor authentication couldn't be changed. Please try again later.",
            resetTwoFactorAuth: '[it] Reset two-factor authentication',
        },
        groups: {
            title: '[it] Groups',
            memberCount: () => {
                return {
                    one: '[it] 1 member',
                    other: (count: number) => `[it] ${count} members`,
                };
            },
        },
    },
};
export default translations;
