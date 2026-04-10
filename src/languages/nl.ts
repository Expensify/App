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
        count: '[nl][ctx: Used as a noun meaning a numerical total or quantity, not the verb “to count.”] Count',
        cancel: '[nl] Cancel',
        dismiss: '[nl][ctx: Refers to closing or hiding a notification or message, not rejecting or ignoring something.] Dismiss',
        proceed: '[nl][ctx: Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”] Proceed',
        unshare: '[nl] Unshare',
        yes: '[nl] Yes',
        no: '[nl] No',
        ok: '[nl][ctx: Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.] OK',
        notNow: '[nl] Not now',
        noThanks: '[nl] No thanks',
        learnMore: '[nl] Learn more',
        buttonConfirm: '[nl] Got it',
        name: '[nl] Name',
        attachment: '[nl] Attachment',
        attachments: '[nl] Attachments',
        center: '[nl] Center',
        from: '[nl] From',
        to: '[nl] To',
        in: '[nl] In',
        optional: '[nl] Optional',
        new: '[nl] New',
        newFeature: '[nl] New feature',
        search: '[nl] Search',
        reports: '[nl] Reports',
        find: '[nl] Find',
        searchWithThreeDots: '[nl] Search...',
        next: '[nl] Next',
        previous: '[nl] Previous',
        previousMonth: '[nl] Previous month',
        nextMonth: '[nl] Next month',
        previousYear: '[nl] Previous year',
        nextYear: '[nl] Next year',
        goBack: '[nl][ctx: Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.] Go back',
        create: '[nl] Create',
        add: '[nl] Add',
        resend: '[nl] Resend',
        save: '[nl] Save',
        select: '[nl] Select',
        deselect: '[nl] Deselect',
        selectMultiple: '[nl][ctx: Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.] Select multiple',
        saveChanges: '[nl] Save changes',
        submit: '[nl] Submit',
        submitted: '[nl][ctx: Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”] Submitted',
        rotate: '[nl] Rotate',
        zoom: '[nl] Zoom',
        password: '[nl] Password',
        magicCode: '[nl] Magic code',
        digits: '[nl] digits',
        twoFactorCode: '[nl] Two-factor code',
        workspaces: '[nl] Workspaces',
        home: '[nl] Home',
        inbox: '[nl] Inbox',
        yourReviewIsRequired: '[nl] Your review is required',
        actionBadge: {
            submit: '[nl] Submit',
            approve: '[nl] Approve',
            pay: '[nl] Pay',
            fix: '[nl] Fix',
        },
        success: '[nl][ctx: Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”] Success',
        group: '[nl] Group',
        profile: '[nl] Profile',
        referral: '[nl] Referral',
        payments: '[nl] Payments',
        approvals: '[nl] Approvals',
        wallet: '[nl] Wallet',
        preferences: '[nl] Preferences',
        view: '[nl] View',
        review: (amount?: string) => `[nl] Review${amount ? ` ${amount}` : ''}`,
        not: '[nl] Not',
        signIn: '[nl] Sign in',
        signInWithGoogle: '[nl] Sign in with Google',
        signInWithApple: '[nl] Sign in with Apple',
        signInWith: '[nl] Sign in with',
        continue: '[nl] Continue',
        firstName: '[nl] First name',
        lastName: '[nl] Last name',
        scanning: '[nl] Scanning',
        analyzing: '[nl] Analyzing...',
        thinking: '[nl] Concierge is thinking...',
        addCardTermsOfService: '[nl] Expensify Terms of Service',
        perPerson: '[nl] per person',
        phone: '[nl] Phone',
        phoneNumber: '[nl] Phone number',
        phoneNumberPlaceholder: '[nl] (xxx) xxx-xxxx',
        email: '[nl] Email',
        and: '[nl] and',
        or: '[nl] or',
        details: '[nl] Details',
        privacy: '[nl] Privacy',
        privacyPolicy: '[nl] Privacy Policy',
        hidden: '[nl] Hidden',
        visible: '[nl] Visible',
        delete: '[nl] Delete',
        archived: '[nl][ctx: UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.] archived',
        contacts: '[nl] Contacts',
        recents: '[nl] Recents',
        close: '[nl] Close',
        comment: '[nl] Comment',
        download: '[nl] Download',
        downloading: '[nl] Downloading',
        uploading: '[nl][ctx: Indicates that a file is currently being uploaded (sent to the server), not downloaded.] Uploading',
        pin: '[nl][ctx: as a verb, not a noun] Pin',
        unPin: '[nl] Unpin',
        back: '[nl] Back',
        saveAndContinue: '[nl] Save & continue',
        settings: '[nl] Settings',
        termsOfService: '[nl] Terms of Service',
        members: '[nl] Members',
        invite: '[nl] Invite',
        here: '[nl] here',
        date: '[nl] Date',
        dob: '[nl] Date of birth',
        currentYear: '[nl] Current year',
        currentMonth: '[nl] Current month',
        ssnLast4: '[nl] Last 4 digits of SSN',
        ssnFull9: '[nl] Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `[nl] Address line ${lineNumber}`,
        personalAddress: '[nl] Personal address',
        companyAddress: '[nl] Company address',
        noPO: '[nl] No PO boxes or mail-drop addresses, please.',
        city: '[nl] City',
        state: '[nl] State',
        streetAddress: '[nl] Street address',
        stateOrProvince: '[nl] State / Province',
        country: '[nl] Country',
        zip: '[nl] Zip code',
        zipPostCode: '[nl] Zip / Postcode',
        whatThis: "[nl] What's this?",
        iAcceptThe: '[nl] I accept the ',
        acceptTermsAndPrivacy: `[nl] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `[nl] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `[nl] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: "[nl] You can't export an empty report.",
            other: () => `[nl] You can't export empty reports.`,
        }),
        remove: '[nl] Remove',
        admin: '[nl] Admin',
        owner: '[nl] Owner',
        dateFormat: '[nl] YYYY-MM-DD',
        send: '[nl] Send',
        na: '[nl] N/A',
        noResultsFound: '[nl] No results found',
        noResultsFoundMatching: (searchString: string) => `[nl] No results found matching "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `[nl] Suggestions available for "${searchString}".` : '[nl] Suggestions available.'),
        recentDestinations: '[nl] Recent destinations',
        timePrefix: "[nl] It's",
        conjunctionFor: '[nl] for',
        todayAt: '[nl] Today at',
        tomorrowAt: '[nl] Tomorrow at',
        yesterdayAt: '[nl] Yesterday at',
        conjunctionAt: '[nl] at',
        conjunctionTo: '[nl] to',
        genericErrorMessage: '[nl] Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: '[nl] Percentage',
        progressBarLabel: '[nl] Onboarding progress',
        converted: '[nl] Converted',
        error: {
            invalidAmount: '[nl] Invalid amount',
            acceptTerms: '[nl] You must accept the Terms of Service to continue',
            phoneNumber: `[nl] Please enter a complete phone number
(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '[nl] This field is required',
            requestModified: '[nl] This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `[nl] Character limit exceeded (${length}/${limit})`,
            dateInvalid: '[nl] Please select a valid date',
            invalidDateShouldBeFuture: '[nl] Please choose today or a future date',
            invalidTimeShouldBeFuture: '[nl] Please choose a time at least one minute ahead',
            invalidCharacter: '[nl] Invalid character',
            enterMerchant: '[nl] Enter a merchant name',
            enterAmount: '[nl] Enter an amount',
            missingMerchantName: '[nl] Missing merchant name',
            missingAmount: '[nl] Missing amount',
            missingDate: '[nl] Missing date',
            enterDate: '[nl] Enter a date',
            invalidTimeRange: '[nl] Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: '[nl] Please complete the form above to continue',
            pleaseSelectOne: '[nl] Please select an option above',
            invalidRateError: '[nl] Please enter a valid rate',
            lowRateError: '[nl] Rate must be greater than 0',
            email: '[nl] Please enter a valid email address',
            login: '[nl] An error occurred while logging in. Please try again.',
        },
        comma: '[nl] comma',
        semicolon: '[nl] semicolon',
        please: '[nl] Please',
        contactUs: '[nl][ctx: Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.] contact us',
        pleaseEnterEmailOrPhoneNumber: '[nl] Please enter an email or phone number',
        fixTheErrors: '[nl][ctx: Instruction prompting the user to correct multiple issues. Should use imperative form when translated.] fix the errors',
        inTheFormBeforeContinuing: '[nl] in the form before continuing',
        confirm: '[nl] Confirm',
        reset: '[nl] Reset',
        done: '[nl][ctx: Status or button indicating that an action or process has been completed. Should reflect completion.] Done',
        more: '[nl] More',
        debitCard: '[nl] Debit card',
        bankAccount: '[nl] Bank account',
        personalBankAccount: '[nl] Personal bank account',
        businessBankAccount: '[nl] Business bank account',
        join: '[nl] Join',
        leave: '[nl] Leave',
        decline: '[nl] Decline',
        reject: '[nl] Reject',
        transferBalance: '[nl] Transfer balance',
        enterManually: '[nl][ctx: Instruction telling the user to input data manually. Refers to entering text or values in a field.] Enter it manually',
        message: '[nl] Message',
        leaveThread: '[nl] Leave thread',
        you: '[nl] You',
        me: '[nl][ctx: Refers to the current user in the UI. Should follow capitalization rules for labels] me',
        youAfterPreposition: '[nl] you',
        your: '[nl] your',
        conciergeHelp: '[nl] Please reach out to Concierge for help.',
        youAppearToBeOffline: '[nl] You appear to be offline.',
        thisFeatureRequiresInternet: '[nl] This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: '[nl] Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: '[nl] An error occurred while trying to play this video.',
        areYouSure: '[nl] Are you sure?',
        verify: '[nl] Verify',
        yesContinue: '[nl] Yes, continue',
        websiteExample: '[nl][ctx: Provides an example format for a website URL.] e.g. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `[nl][ctx: Provides an example format for a ZIP] e.g. ${zipSampleFormat}` : ''),
        description: '[nl] Description',
        title: '[nl] Title',
        assignee: '[nl] Assignee',
        createdBy: '[nl] Created by',
        with: '[nl] with',
        shareCode: '[nl] Share code',
        share: '[nl] Share',
        per: '[nl] per',
        mi: '[nl][ctx: Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.] mile',
        km: '[nl] kilometer',
        milesAbbreviated: '[nl] mi',
        kilometersAbbreviated: '[nl] km',
        copied: '[nl] Copied!',
        someone: '[nl] Someone',
        total: '[nl] Total',
        edit: '[nl] Edit',
        letsDoThis: `[nl] Let's do this!`,
        letsStart: `[nl] Let's start`,
        showMore: '[nl] Show more',
        showLess: '[nl] Show less',
        merchant: '[nl] Merchant',
        change: '[nl] Change',
        category: '[nl] Category',
        report: '[nl] Report',
        billable: '[nl] Billable',
        nonBillable: '[nl] Non-billable',
        tag: '[nl] Tag',
        receipt: '[nl] Receipt',
        verified: '[nl] Verified',
        replace: '[nl] Replace',
        distance: '[nl] Distance',
        mile: '[nl] mile',
        miles: '[nl][ctx: Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.] miles',
        kilometer: '[nl] kilometer',
        kilometers: '[nl] kilometers',
        recent: '[nl] Recent',
        all: '[nl] All',
        am: '[nl] AM',
        pm: '[nl] PM',
        tbd: "[nl][ctx: Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.] TBD",
        selectCurrency: '[nl] Select a currency',
        selectSymbolOrCurrency: '[nl] Select a symbol or currency',
        card: '[nl] Card',
        whyDoWeAskForThis: '[nl] Why do we ask for this?',
        required: '[nl] Required',
        automatic: '[nl] Automatic',
        showing: '[nl] Showing',
        of: '[nl] of',
        default: '[nl] Default',
        update: '[nl] Update',
        member: '[nl] Member',
        auditor: '[nl] Auditor',
        role: '[nl] Role',
        roleCannotBeChanged: (workflowsLinkPage: string) => `[nl] Role can't be changed because this member is a <a href="${workflowsLinkPage}">payer</a> on this workspace.`,
        currency: '[nl] Currency',
        groupCurrency: '[nl] Group currency',
        rate: '[nl] Rate',
        emptyLHN: {
            title: '[nl] Woohoo! All caught up.',
            subtitleText1: '[nl] Find a chat using the',
            subtitleText2: '[nl] button above, or create something using the',
            subtitleText3: '[nl] button below.',
        },
        businessName: '[nl] Business name',
        clear: '[nl] Clear',
        type: '[nl] Type',
        reportName: '[nl] Report name',
        action: '[nl] Action',
        expenses: '[nl] Expenses',
        totalSpend: '[nl] Total spend',
        tax: '[nl] Tax',
        shared: '[nl] Shared',
        drafts: '[nl] Drafts',
        draft: '[nl][ctx: as a noun, not a verb] Draft',
        finished: '[nl] Finished',
        upgrade: '[nl] Upgrade',
        downgradeWorkspace: '[nl] Downgrade workspace',
        companyID: '[nl] Company ID',
        userID: '[nl] User ID',
        disable: '[nl] Disable',
        export: '[nl] Export',
        initialValue: '[nl] Initial value',
        currentDate: '[nl][ctx: UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.] Current date',
        value: '[nl] Value',
        downloadFailedTitle: '[nl] Download failed',
        downloadFailedDescription: "[nl] Your download couldn't be completed. Please try again later.",
        filterLogs: '[nl] Filter Logs',
        network: '[nl] Network',
        reportID: '[nl] Report ID',
        longReportID: '[nl] Long Report ID',
        withdrawalID: '[nl] Withdrawal ID',
        withdrawalStatus: '[nl] Withdrawal status',
        bankAccounts: '[nl] Bank accounts',
        chooseFile: '[nl] Choose file',
        chooseFiles: '[nl] Choose files',
        dropTitle: '[nl][ctx: Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.] Let it go',
        dropMessage: '[nl][ctx: Instruction for dropping one or more files into an upload area.] Drop your file here',
        ignore: '[nl] Ignore',
        enabled: '[nl] Enabled',
        disabled: '[nl] Disabled',
        import: '[nl][ctx: Action button for importing a file or data. Should use the verb form, not the noun form.] Import',
        offlinePrompt: "[nl] You can't take this action right now.",
        outstanding: '[nl][ctx: meaning "remaining to be paid, done, or dealt with", not "exceptionally good"] Outstanding',
        chats: '[nl] Chats',
        tasks: '[nl] Tasks',
        unread: '[nl] Unread',
        sent: '[nl] Sent',
        links: '[nl] Links',
        day: '[nl][ctx: Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).] day',
        days: '[nl] days',
        rename: '[nl] Rename',
        address: '[nl] Address',
        hourAbbreviation: '[nl] h',
        minuteAbbreviation: '[nl] m',
        secondAbbreviation: '[nl] s',
        skip: '[nl] Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `[nl] Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: '[nl] Chat now',
        workEmail: '[nl] Work email',
        destination: '[nl] Destination',
        subrate: '[nl][ctx: Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.] Subrate',
        perDiem: '[nl] Per diem',
        validate: '[nl] Validate',
        downloadAsPDF: '[nl] Download as PDF',
        downloadAsCSV: '[nl] Download as CSV',
        print: '[nl] Print',
        help: '[nl] Help',
        collapsed: '[nl] Collapsed',
        expanded: '[nl] Expanded',
        expenseReport: '[nl] Expense Report',
        expenseReports: '[nl] Expense Reports',
        rateOutOfPolicy: '[nl][ctx: Rate as a noun, not a verb] Rate out of policy',
        leaveWorkspace: '[nl] Leave workspace',
        leaveWorkspaceConfirmation: "[nl] If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "[nl] If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "[nl] If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `[nl] If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `[nl] If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `[nl] If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "[nl] You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: '[nl] Reimbursable',
        editYourProfile: '[nl] Edit your profile',
        comments: '[nl] Comments',
        sharedIn: '[nl] Shared in',
        unreported: '[nl] Unreported',
        explore: '[nl] Explore',
        insights: '[nl] Insights',
        todo: '[nl] To-do',
        invoice: '[nl] Invoice',
        expense: '[nl] Expense',
        chat: '[nl] Chat',
        task: '[nl] Task',
        trip: '[nl] Trip',
        apply: '[nl] Apply',
        status: '[nl] Status',
        on: '[nl] On',
        before: '[nl] Before',
        after: '[nl] After',
        range: '[nl] Range',
        reschedule: '[nl] Reschedule',
        general: '[nl] General',
        workspacesTabTitle: '[nl] Workspaces',
        headsUp: '[nl] Heads up!',
        submitTo: '[nl] Submit to',
        forwardTo: '[nl] Forward to',
        approvalLimit: '[nl] Approval limit',
        overLimitForwardTo: '[nl] Over limit forward to',
        merge: '[nl] Merge',
        none: '[nl] None',
        unstableInternetConnection: '[nl] Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: '[nl] Enable Global Reimbursements',
        purchaseAmount: '[nl] Purchase amount',
        originalAmount: '[nl] Original amount',
        frequency: '[nl] Frequency',
        link: '[nl] Link',
        pinned: '[nl] Pinned',
        read: '[nl] Read',
        copyToClipboard: '[nl] Copy to clipboard',
        thisIsTakingLongerThanExpected: '[nl] This is taking longer than expected...',
        domains: '[nl] Domains',
        actionRequired: '[nl] Action required',
        duplicate: '[nl] Duplicate',
        duplicated: '[nl] Duplicated',
        duplicateExpense: '[nl] Duplicate expense',
        duplicateReport: '[nl] Duplicate report',
        copyOfReportName: (reportName: string) => `[nl] Copy of ${reportName}`,
        exchangeRate: '[nl] Exchange rate',
        reimbursableTotal: '[nl] Reimbursable total',
        nonReimbursableTotal: '[nl] Non-reimbursable total',
        opensInNewTab: '[nl] Opens in a new tab',
        locked: '[nl] Locked',
        month: '[nl] Month',
        week: '[nl] Week',
        year: '[nl] Year',
        quarter: '[nl] Quarter',
        concierge: {
            sidePanelGreeting: '[nl] Hi there, how can I help?',
            showHistory: '[nl] Show history',
        },
        vacationDelegate: '[nl] Vacation delegate',
        expensifyLogo: '[nl] Expensify logo',
        approver: '[nl] Approver',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `[nl] enter digit ${digitIndex} of ${totalDigits}`,
    },
    socials: {
        podcast: '[nl] Follow us on Podcast',
        twitter: '[nl] Follow us on Twitter',
        instagram: '[nl] Follow us on Instagram',
        facebook: '[nl] Follow us on Facebook',
        linkedin: '[nl] Follow us on LinkedIn',
    },
    concierge: {
        collapseReasoning: '[nl] Collapse reasoning',
        expandReasoning: '[nl] Expand reasoning',
    },
    supportalNoAccess: {
        title: '[nl] Not so fast',
        descriptionWithCommand: (command?: string) =>
            `[nl] You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: '[nl] Locked Account',
        description: "[nl] You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: '[nl] Use current location',
        notFound: '[nl] We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "[nl] It looks like you've denied access to your location.",
        please: '[nl] Please',
        allowPermission: '[nl] allow location access in settings',
        tryAgain: '[nl] and try again.',
    },
    contact: {
        importContacts: '[nl] Import contacts',
        importContactsTitle: '[nl] Import your contacts',
        importContactsText: '[nl] Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: '[nl] so your favorite people are always a tap away.',
        importContactsNativeText: '[nl] Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: '[nl] Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '[nl] Camera access',
        expensifyDoesNotHaveAccessToCamera: "[nl] Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: '[nl] Attachment error',
        errorWhileSelectingAttachment: '[nl] An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: '[nl] An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: '[nl] Take photo',
        chooseFromGallery: '[nl] Choose from gallery',
        chooseDocument: '[nl] Choose file',
        attachmentTooLarge: '[nl] Attachment is too large',
        sizeExceeded: '[nl] Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `[nl] Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: '[nl] Attachment is too small',
        sizeNotMet: '[nl] Attachment size must be greater than 240 bytes',
        wrongFileType: '[nl] Invalid file type',
        notAllowedExtension: '[nl] This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: '[nl] Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: '[nl] Password-protected PDF is not supported',
        attachmentImageResized: '[nl] This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: '[nl] This image is too large to preview before uploading.',
        imageDimensionsTooLarge: '[nl] Image dimensions are too large to process. Please use a smaller image.',
        tooManyFiles: (fileLimit: number) => `[nl] You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `[nl] Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "[nl] Some files can't be uploaded",
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `[nl] Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "[nl] You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `[nl] ${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: '[nl] Learn more about supported formats.',
        passwordProtected: "[nl] Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: '[nl] Add attachments',
        addReceipt: '[nl] Add receipt',
        scanReceipts: '[nl] Scan receipts',
        replaceReceipt: '[nl] Replace receipt',
    },
    filePicker: {
        fileError: '[nl] File error',
        errorWhileSelectingFile: '[nl] An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: '[nl] Connection complete',
        supportingText: '[nl] You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: '[nl] Edit photo',
        description: '[nl] Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: '[nl] No extension found for mime type',
        problemGettingImageYouPasted: '[nl] There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `[nl] The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `[nl] The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: '[nl] Update app',
        updatePrompt: '[nl] A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: '[nl] Launching Expensify',
        expired: '[nl] Your session has expired.',
        signIn: '[nl] Please sign in again.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: '[nl] Review transaction',
            pleaseReview: '[nl] Please review this transaction',
            requiresYourReview: '[nl] An Expensify Card transaction requires your review.',
            transactionDetails: '[nl] Transaction details',
            attemptedTransaction: '[nl] Attempted transaction',
            deny: '[nl] Deny',
            approve: '[nl] Approve',
            denyTransaction: '[nl] Deny transaction',
            transactionDenied: '[nl] Transaction denied',
            transactionApproved: '[nl] Transaction approved!',
            areYouSureToDeny: '[nl] Are you sure? The transaction will be denied if you close this screen.',
            youCanTryAgainAtMerchantOrReachOut:
                "[nl] You can try again at the merchant. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            youNeedToTryAgainAtMerchant: "[nl] This transaction was not verified, so we denied it. You'll need to try again at the merchant.",
            goBackToTheMerchant: '[nl] Return to the merchant site to continue the transaction.',
            transactionFailed: '[nl] Transaction failed',
            transactionCouldNotBeCompleted: '[nl] Your transaction could not be completed. Please try again at the merchant.',
            transactionCouldNotBeCompletedReachOut:
                "[nl] Your transaction could not be completed. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            reviewFailed: '[nl] Review failed',
            alreadyReviewedSubtitle:
                '[nl] You already reviewed this transaction. Please check your <transaction-history-link>transaction history</transaction-history-link> or contact <concierge-link>Concierge</concierge-link> to report any issues.',
        },
        unsupportedDevice: {
            unsupportedDevice: '[nl] Unsupported device',
            pleaseDownloadMobileApp: `[nl] This action is not supported on your device. Please download the Expensify app from the <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> or <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> and try again.`,
            pleaseUseWebApp: `[nl] This action is not supported on your device. Please use the <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify web app</a> and try again.`,
        },
        biometricsTest: {
            biometricsTest: '[nl] Biometrics test',
            authenticationSuccessful: '[nl] Authentication successful',
            successfullyAuthenticatedUsing: (authType?: string) => `[nl] You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `[nl] Biometrics (${status})`,
            statusNeverRegistered: '[nl] Never registered',
            statusNotRegistered: '[nl] Not registered',
            statusRegisteredOtherDevice: () => ({one: '[nl] Another device registered', other: '[nl] Other devices registered'}),
            statusRegisteredThisDevice: '[nl] Registered',
            yourAttemptWasUnsuccessful: '[nl] Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: '[nl] You couldn’t be authenticated',
            areYouSureToReject: '[nl] Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: '[nl] Reject authentication',
            test: '[nl] Test',
            biometricsAuthentication: '[nl] Biometric authentication',
            authType: {
                unknown: '[nl] Unknown',
                none: '[nl] None',
                credentials: '[nl] Credentials',
                biometrics: '[nl] Biometrics',
                faceId: '[nl] Face ID',
                touchId: '[nl] Touch ID',
                opticId: '[nl] Optic ID',
                passkey: '[nl] Passkey',
            },
        },
        pleaseEnableInSystemSettings: {
            start: '[nl] Please enable face/fingerprint verification or set a device passcode in your ',
            link: '[nl] system settings',
            end: '.',
        },
        oops: '[nl] Oops, something went wrong',
        verificationFailed: '[nl] Verification failed',
        looksLikeYouRanOutOfTime: '[nl] Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: '[nl] You ran out of time',
        letsVerifyItsYou: '[nl] Let’s verify it’s you',
        nowLetsAuthenticateYou: "[nl] Now, let's authenticate you...",
        letsAuthenticateYou: "[nl] Let's authenticate you...",
        verifyYourself: {
            biometrics: '[nl] Verify yourself with your face or fingerprint',
            passkeys: '[nl] Verify yourself with a passkey',
        },
        enableQuickVerification: {
            biometrics: '[nl] Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
            passkeys: '[nl] Enable quick, secure verification using a passkey. No passwords or codes required.',
        },
        revoke: {
            revoke: '[nl] Revoke',
            title: '[nl] Face/fingerprint & passkeys',
            explanation:
                '[nl] Face/fingerprint or passkey verification are enabled on one or more devices. Revoking access will require a magic code for the next verification on that device.',
            confirmationPrompt: "[nl] Are you sure? You'll need a magic code for the next verification on that device.",
            confirmationPromptThisDevice: "[nl] Are you sure? You'll need a magic code for the next verification on this device.",
            confirmationPromptMultiple: "[nl] Are you sure? You'll need a magic code for the next verification on those devices.",
            confirmationPromptAll: "[nl] Are you sure? You'll need a magic code for the next verification on any device.",
            cta: '[nl] Revoke access',
            ctaAll: '[nl] Revoke all',
            noDevices: "[nl] You don't have any devices registered for face/fingerprint or passkey verification. If you register any, you will be able to revoke that access here.",
            dismiss: '[nl] Got it',
            error: '[nl] Request failed. Try again later.',
            thisDevice: '[nl] This device',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['[nl] One', '[nl] Two', '[nl] Three', '[nl] Four', '[nl] Five', '[nl] Six', '[nl] Seven', '[nl] Eight', '[nl] Nine'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `[nl] ${displayCount} other ${otherDeviceCount === 1 ? '[nl] device' : '[nl] devices'}`;
            },
        },
        setPin: {
            didNotShipCard: "[nl] We didn't ship your card. Please try again.",
        },
        revealPin: {
            couldNotReveal: "[nl] We couldn't reveal your PIN. Please try again.",
        },
        changePin: {
            didNotChange: "[nl] We didn't change your PIN. Please try again.",
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            [nl] Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: '[nl] Head back to your original tab to continue.',
        title: "[nl] Here's your magic code",
        description: dedent(`
            [nl] Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            [nl] Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: '[nl] , or',
        signInHere: '[nl] just sign in here',
        expiredCodeTitle: '[nl] Magic code expired',
        expiredCodeDescription: '[nl] Go back to the original device and request a new code',
        successfulNewCodeRequest: '[nl] Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            [nl] Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            [nl] Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: '[nl] request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: '[nl] Paid by',
        whatsItFor: "[nl] What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: '[nl] Name, email, or phone number',
        findMember: '[nl] Find a member',
        searchForSomeone: '[nl] Search for someone',
        userSelected: (username: string) => `[nl] ${username} selected`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '[nl] Submit an expense, refer your team',
            subtitleText: "[nl] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '[nl] Book a call',
    },
    hello: '[nl] Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '[nl] Get started below.',
        anotherLoginPageIsOpen: '[nl] Another login page is open.',
        anotherLoginPageIsOpenExplanation: "[nl] You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: '[nl] Welcome!',
        welcomeWithoutExclamation: '[nl] Welcome',
        phrase2: "[nl] Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: '[nl] Your payments get to you as fast as you can get your point across.',
        enterPassword: '[nl] Please enter your password',
        welcomeNewFace: (login: string) => `[nl] ${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: (login: string) => `[nl] Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '[nl] Travel and expense, at the speed of chat',
            body: '[nl] Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '[nl] Continue logging in with single sign-on:',
        orContinueWithMagicCode: '[nl] You can also sign in with a magic code',
        useSingleSignOn: '[nl] Use single sign-on',
        useMagicCode: '[nl] Use magic code',
        launching: '[nl] Launching...',
        oneMoment: "[nl] One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: '[nl] Drop to upload',
        sendAttachment: '[nl] Send attachment',
        addAttachment: '[nl] Add attachment',
        writeSomething: '[nl] Write something...',
        blockedFromConcierge: '[nl] Communication is barred',
        askConciergeToUpdate: '[nl] Try "Update an expense"...',
        askConciergeToCorrect: '[nl] Try "Correct an expense"...',
        askConciergeForHelp: '[nl] Ask Concierge AI for help...',
        fileUploadFailed: '[nl] Upload failed. File is not supported.',
        localTime: (user: string, time: string) => `[nl] It's ${time} for ${user}`,
        edited: '[nl] (edited)',
        emoji: '[nl] Emoji',
        collapse: '[nl] Collapse',
        expand: '[nl] Expand',
    },
    reportActionContextMenu: {
        copyMessage: '[nl] Copy message',
        copied: '[nl] Copied!',
        copyLink: '[nl] Copy link',
        copyURLToClipboard: '[nl] Copy URL to clipboard',
        copyEmailToClipboard: '[nl] Copy email to clipboard',
        markAsUnread: '[nl] Mark as unread',
        markAsRead: '[nl] Mark as read',
        editAction: ({action}: EditActionParams) => `[nl] Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '[nl] expense' : '[nl] comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '[nl] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[nl] Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '[nl] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[nl] Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: '[nl] Only visible to',
        explain: '[nl] Explain',
        explainMessage: '[nl] Please explain this to me.',
        replyInThread: '[nl] Reply in thread',
        joinThread: '[nl] Join thread',
        leaveThread: '[nl] Leave thread',
        copyOnyxData: '[nl] Copy Onyx data',
        flagAsOffensive: '[nl] Flag as offensive',
        menu: '[nl] Menu',
    },
    emojiReactions: {
        addReactionTooltip: '[nl] Add reaction',
        reactedWith: '[nl] reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `[nl] You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `[nl] This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `[nl] This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `[nl] This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `[nl] This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `[nl] This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `[nl] This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `[nl] This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: '[nl] This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "[nl] Welcome! Let's get you set up.",
        chatWithAccountManager: '[nl] Chat with your account manager here',
        askMeAnything: '[nl] Ask me anything!',
        sayHello: '[nl] Say hello!',
        yourSpace: '[nl] Your space',
        welcomeToRoom: (roomName: string) => `[nl] Welcome to ${roomName}!`,
        usePlusButton: (additionalText: string) => `[nl]  Use the + button to ${additionalText} an expense.`,
        askConcierge: '[nl] This is your chat with Concierge, your personal AI agent. I can do almost anything, try me!',
        conciergeSupport: '[nl] Your personal AI agent',
        create: '[nl] create',
        iouTypes: {
            pay: '[nl] pay',
            split: '[nl] split',
            submit: '[nl] submit',
            track: '[nl] track',
            invoice: '[nl] invoice',
        },
    },
    adminOnlyCanPost: '[nl] Only admins can send messages in this room.',
    reportAction: {
        asCopilot: '[nl] as copilot for',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `[nl] created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `[nl] created this report for any held expenses from deleted report #${reportID}`
                : `[nl] created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: '[nl] Notify everyone in this conversation',
    },
    newMessages: '[nl] New messages',
    latestMessages: '[nl] Latest messages',
    youHaveBeenBanned: "[nl] Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: '[nl] is typing...',
        areTyping: '[nl] are typing...',
        multipleMembers: '[nl] Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '[nl] This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `[nl] This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `[nl] This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `[nl] This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `[nl] This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[nl] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[nl] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '[nl] This booking is archived.',
    },
    writeCapabilityPage: {
        label: '[nl] Who can post',
        writeCapability: {
            all: '[nl] All members',
            admins: '[nl] Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: '[nl] Find something...',
        buttonMySettings: '[nl] My settings',
        fabNewChat: '[nl] Start chat',
        fabNewChatExplained: '[nl] Open actions menu',
        fabScanReceiptExplained: '[nl] Scan receipt',
        chatPinned: '[nl] Chat pinned',
        draftedMessage: '[nl] Drafted message',
        listOfChatMessages: '[nl] List of chat messages',
        listOfChats: '[nl] List of chats',
        saveTheWorld: '[nl] Save the world',
        tooltip: '[nl] Get started here!',
        redirectToExpensifyClassicModal: {
            title: '[nl] Coming soon',
            description: "[nl] We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        },
    },
    homePage: {
        forYou: '[nl] For you',
        timeSensitiveSection: {
            title: '[nl] Time sensitive',
            ctaFix: '[nl] Fix',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `[nl] Fix ${feedName} company card connection` : '[nl] Fix company card connection'),
                defaultSubtitle: '[nl] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `[nl] Fix ${cardName} personal card connection` : '[nl] Fix personal card connection'),
                subtitle: '[nl] Wallet',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `[nl] Fix ${integrationName} connection`,
                defaultSubtitle: '[nl] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: '[nl] We need your shipping address',
                subtitle: '[nl] Provide an address to receive your Expensify Card.',
                cta: '[nl] Add address',
            },
            addPaymentCard: {
                title: '[nl] Add a payment card to keep using Expensify',
                subtitle: '[nl] Account > Subscription',
                cta: '[nl] Add',
            },
            activateCard: {
                title: '[nl] Activate your Expensify Card',
                subtitle: '[nl] Validate your card and start spending.',
                cta: '[nl] Activate',
            },
            reviewCardFraud: {
                title: '[nl] Review potential fraud on your Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `[nl] Review ${amount} in potential fraud at ${merchant}`,
                subtitle: '[nl] Expensify Card',
                cta: '[nl] Review',
            },
            validateAccount: {
                title: '[nl] Validate your account to continue using Expensify',
                subtitle: '[nl] Account',
                cta: '[nl] Validate',
            },
            fixFailedBilling: {
                title: "[nl] We couldn't bill your card on file",
                subtitle: '[nl] Subscription',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `[nl] Free trial: ${days} ${days === 1 ? '[nl] day' : '[nl] days'} left!`,
            offer50Body: '[nl] Get 50% off your first year!',
            offer25Body: '[nl] Get 25% off your first year!',
            addCardBody: "[nl] Don't wait! Add your payment card now.",
            ctaClaim: '[nl] Claim',
            ctaAdd: '[nl] Add card',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `[nl] Time remaining: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: '[nl] Time remaining: 1 day',
                other: (pluralCount: number) => `[nl] Time remaining: ${pluralCount} days`,
            }),
        },
        assignedCards: '[nl] Your Expensify Cards',
        assignedCardsRemaining: ({amount}: {amount: string}) => `[nl] ${amount} remaining`,
        announcements: '[nl] Announcements',
        discoverSection: {
            title: '[nl] Discover',
            menuItemTitleNonAdmin: '[nl] Learn how to create expenses and submit reports.',
            menuItemTitleAdmin: '[nl] Learn how to invite members, edit approval workflows, and reconcile company cards.',
            menuItemDescription: '[nl] See what Expensify can do in 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `[nl] Submit ${count} ${count === 1 ? '[nl] report' : '[nl] reports'}`,
            approve: ({count}: {count: number}) => `[nl] Approve ${count} ${count === 1 ? '[nl] report' : '[nl] reports'}`,
            pay: ({count}: {count: number}) => `[nl] Pay ${count} ${count === 1 ? '[nl] report' : '[nl] reports'}`,
            export: ({count}: {count: number}) => `[nl] Export ${count} ${count === 1 ? '[nl] report' : '[nl] reports'}`,
            begin: '[nl] Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: "[nl] You're done!",
                thumbsUpStarsDescription: '[nl] Thumbs up to you, stay tuned for more tasks.',
                smallRocketTitle: '[nl] All caught up',
                smallRocketDescription: '[nl] Upcoming to-dos will launch here.',
                cowboyHatTitle: "[nl] You're done!",
                cowboyHatDescription: '[nl] All tasks are wrangled, keep an eye out for more.',
                trophy1Title: '[nl] Nothing to show',
                trophy1Description: '[nl] You did it! Keep an eye out for more to-dos.',
                palmTreeTitle: '[nl] All caught up',
                palmTreeDescription: '[nl] Time to relax but stay tuned for future tasks.',
                fishbowlBlueTitle: "[nl] You're done!",
                fishbowlBlueDescription: "[nl] We'll bubble up future tasks here.",
                targetTitle: '[nl] All caught up',
                targetDescription: '[nl] Way to stay on target. Check back for more tasks!',
                chairTitle: '[nl] Nothing to show',
                chairDescription: "[nl] Go relax, we'll list upcoming to-dos here.",
                broomTitle: "[nl] You're done!",
                broomDescription: '[nl] Tasks are clean, though stay tuned for more to-dos.',
                houseTitle: '[nl] All caught up',
                houseDescription: '[nl] This is your home base for upcoming to-dos.',
                conciergeBotTitle: '[nl] Nothing to show',
                conciergeBotDescription: '[nl] Beep boop beep boop, check back for more tasks!',
                checkboxTextTitle: '[nl] All caught up',
                checkboxTextDescription: '[nl] Check off your upcoming to-dos here.',
                flashTitle: "[nl] You're done!",
                flashDescription: "[nl] We'll zap your future tasks here.",
                sunglassesTitle: '[nl] Nothing to show',
                sunglassesDescription: "[nl] Time to chill, though stay tuned for what's next!",
                f1FlagsTitle: '[nl] All caught up',
                f1FlagsDescription: "[nl] You've finished all outstanding to-dos.",
                fireworksTitle: '[nl] All caught up',
                fireworksDescription: '[nl] Upcoming to-dos will appear here.',
            },
        },
        gettingStartedSection: {
            title: '[nl] Getting started',
            createWorkspace: '[nl] Create a workspace',
            connectAccounting: ({integrationName}: {integrationName: string}) => `[nl] Connect to ${integrationName}`,
            customizeCategories: '[nl] Customize accounting categories',
            linkCompanyCards: '[nl] Link company cards',
            setupRules: '[nl] Set up spend rules',
        },
        upcomingTravel: '[nl] Upcoming travel',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `[nl] Flight to ${destination}`,
            trainTo: ({destination}: {destination: string}) => `[nl] Train to ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `[nl] Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `[nl] Car rental in ${destination}`,
            inOneWeek: '[nl] In 1 week',
            inDays: () => ({
                one: '[nl] In 1 day',
                other: (count: number) => `[nl] In ${count} days`,
            }),
            today: '[nl] Today',
        },
    },
    allSettingsScreen: {
        subscription: '[nl] Subscription',
        domains: '[nl] Domains',
    },
    tabSelector: {
        chat: '[nl] Chat',
        room: '[nl] Room',
        distance: '[nl] Distance',
        manual: '[nl] Manual',
        scan: '[nl] Scan',
        map: '[nl] Map',
        gps: '[nl] GPS',
        odometer: '[nl] Odometer',
    },
    spreadsheet: {
        upload: '[nl] Upload a spreadsheet',
        import: '[nl] Import spreadsheet',
        dragAndDrop: '[nl] <muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `[nl] <muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '[nl] <muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `[nl] <muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: '[nl] File contains column headers',
        column: (name: string) => `[nl] Column ${name}`,
        fieldNotMapped: (fieldName: string) => `[nl] Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `[nl] Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `[nl] Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: '[nl] Import successful',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[nl] No categories have been added or updated.';
            }
            if (added && updated) {
                return `[nl] ${added} ${added === 1 ? '[nl] category' : '[nl] categories'} added, ${updated} ${updated === 1 ? '[nl] category' : '[nl] categories'} updated.`;
            }
            if (added) {
                return added === 1 ? '[nl] 1 category has been added.' : `[nl] ${added} categories have been added.`;
            }
            return updated === 1 ? '[nl] 1 category has been updated.' : `[nl] ${updated} categories have been updated.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[nl] ${transactions} transactions have been added.` : '[nl] 1 transaction has been added.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[nl] No members have been added or updated.';
            }
            if (added && updated) {
                return `[nl] ${added} member${added > 1 ? '[nl] s' : ''} added, ${updated} member${updated > 1 ? '[nl] s' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `[nl] ${updated} members have been updated.` : '[nl] 1 member has been updated.';
            }
            return added > 1 ? `[nl] ${added} members have been added.` : '[nl] 1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `[nl] ${tags} tags have been added.` : '[nl] 1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: '[nl] Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `[nl] ${rates} per diem rates have been added.` : '[nl] 1 per diem rate has been added.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[nl] ${transactions} transactions have been imported.` : '[nl] 1 transaction has been imported.',
        importFailedTitle: '[nl] Import failed',
        importFailedDescription: '[nl] Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: '[nl] Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: '[nl] File size must be greater than 0 bytes',
        invalidFileMessage:
            '[nl] The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: '[nl] Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: '[nl] Import spreadsheet',
        downloadCSV: '[nl] Download CSV',
        importMemberConfirmation: () => ({
            one: `[nl] Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `[nl] Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: '[nl] Upload receipt',
        uploadMultiple: '[nl] Upload receipts',
        desktopSubtitleSingle: `[nl] or drag and drop it here`,
        desktopSubtitleMultiple: `[nl] or drag and drop them here`,
        alternativeMethodsTitle: '[nl] Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `[nl] <label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `[nl] <label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `[nl] <label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `[nl] <label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: '[nl] Take a photo',
        cameraAccess: '[nl] Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `[nl] Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: '[nl] Camera error',
        cameraErrorMessage: '[nl] An error occurred while taking a photo. Please try again.',
        locationAccessTitle: '[nl] Allow location access',
        locationAccessMessage: '[nl] Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: '[nl] Allow location access',
        locationErrorMessage: '[nl] Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `[nl] Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '[nl] Let it go',
        dropMessage: '[nl] Drop your file here',
        flash: '[nl] flash',
        flipCamera: '[nl] Flip camera',
        multiScan: '[nl] multi-scan',
        shutter: '[nl] shutter',
        gallery: '[nl] gallery',
        deleteReceipt: '[nl] Delete receipt',
        deleteConfirmation: '[nl] Are you sure you want to delete this receipt?',
        addReceipt: '[nl] Add receipt',
        addAdditionalReceipt: '[nl] Add additional receipt',
        scanFailed: "[nl] The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        crop: '[nl] Crop',
        addAReceipt: {
            phrase1: '[nl] Add a receipt',
            phrase2: '[nl] or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: '[nl] Scan receipt',
        recordDistance: '[nl] Track distance',
        requestMoney: '[nl] Create expense',
        perDiem: '[nl] Create per diem',
        splitBill: '[nl] Split expense',
        splitScan: '[nl] Split receipt',
        splitDistance: '[nl] Split distance',
        paySomeone: (name?: string) => `[nl] Pay ${name ?? '[nl] someone'}`,
        assignTask: '[nl] Assign task',
        header: '[nl] Quick action',
        noLongerHaveReportAccess: '[nl] You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: '[nl] Update destination',
        createReport: '[nl] Create report',
        createTimeExpense: '[nl] Create time expense',
    },
    iou: {
        amount: '[nl] Amount',
        percent: '[nl] Percent',
        date: '[nl] Date',
        taxAmount: '[nl] Tax amount',
        taxRate: '[nl] Tax rate',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `[nl] Approve ${formattedAmount}` : '[nl] Approve'),
        approved: '[nl] Approved',
        cash: '[nl] Cash',
        card: '[nl] Card',
        original: '[nl] Original',
        split: '[nl] Split',
        splitExpense: '[nl] Split expense',
        splitDates: '[nl] Split dates',
        splitDateRange: (startDate: string, endDate: string, count: number) => `[nl] ${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `[nl] ${amount} from ${merchant}`,
        splitByPercentage: '[nl] Split by percentage',
        splitByDate: '[nl] Split by date',
        addSplit: '[nl] Add split',
        makeSplitsEven: '[nl] Make splits even',
        editSplits: '[nl] Edit splits',
        totalAmountGreaterThanOriginal: (amount: string) => `[nl] Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: (amount: string) => `[nl] Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: '[nl] Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: '[nl] No splits added. Add at least one to save.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `[nl] Edit ${amount} for ${merchant}`,
        removeSplit: '[nl] Remove split',
        splitExpenseCannotBeEditedModalTitle: "[nl] This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: '[nl] Approved or paid expenses cannot be edited',
        paySomeone: (name?: string) => `[nl] Pay ${name ?? '[nl] someone'}`,
        splitExpenseDistanceErrorModalDescription: '[nl] Please fix the distance rate error and try again.',
        splitExpensePerDiemRateErrorModalDescription: '[nl] Please fix the per diem rate error and try again.',
        expense: '[nl] Expense',
        categorize: '[nl] Categorize',
        share: '[nl] Share',
        participants: '[nl] Participants',
        createExpense: '[nl] Create expense',
        trackDistance: '[nl] Track distance',
        createExpenses: (expensesNumber: number) => `[nl] Create ${expensesNumber} expenses`,
        removeExpense: '[nl] Remove expense',
        removeThisExpense: '[nl] Remove this expense',
        removeExpenseConfirmation: '[nl] Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: '[nl] Add expense',
        chooseRecipient: '[nl] Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `[nl] Create ${amount} expense`,
        confirmDetails: '[nl] Confirm details',
        pay: '[nl] Pay',
        cancelPayment: '[nl] Cancel payment',
        cancelPaymentConfirmation: '[nl] Are you sure that you want to cancel this payment?',
        viewDetails: '[nl] View details',
        pending: '[nl] Pending',
        canceled: '[nl] Canceled',
        posted: '[nl] Posted',
        deleteReceipt: '[nl] Delete receipt',
        findExpense: '[nl] Find expense',
        deletedTransaction: (amount: string, merchant: string) => `[nl] deleted an expense (${amount} for ${merchant})`,
        movedFromReport: (reportName: string) => `[nl] moved an expense${reportName ? `[nl]  from ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `[nl] moved this expense${reportName ? `[nl]  to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `[nl] moved this expense${reportName ? `[nl]  from <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `[nl] moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `[nl] moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `[nl] moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: '[nl] Receipt pending match with card transaction',
        pendingMatch: '[nl] Pending match',
        pendingMatchWithCreditCardDescription: '[nl] Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: '[nl] Mark as cash',
        pendingMatchSubmitTitle: '[nl] Submit report',
        pendingMatchSubmitDescription: '[nl] Some expenses are awaiting a match with a credit card transaction. Do you want to mark them as cash?',
        routePending: '[nl] Route pending...',
        automaticallyEnterExpenseDetails: '[nl] Concierge will automatically enter the expense details for you, or you can add them manually.',
        receiptScanning: () => ({
            one: '[nl] Receipt scanning...',
            other: '[nl] Receipts scanning...',
        }),
        scanMultipleReceipts: '[nl] Scan multiple receipts',
        scanMultipleReceiptsDescription: "[nl] Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: '[nl] Receipt scan in progress',
        receiptScanInProgressDescription: '[nl] Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: '[nl] Remove from report',
        moveToPersonalSpace: '[nl] Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '[nl] Potential duplicate expenses identified. Review duplicates to enable submission.'
                : '[nl] Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: '[nl] Issue found',
            other: '[nl] Issues found',
        }),
        fieldPending: '[nl] Pending...',
        defaultRate: '[nl] Default rate',
        receiptMissingDetails: '[nl] Receipt missing details',
        missingAmount: '[nl] Missing amount',
        missingMerchant: '[nl] Missing merchant',
        receiptStatusTitle: '[nl] Scanning…',
        receiptStatusText: "[nl] Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: '[nl] Receipt scanning failed. Please enter the details manually.',
        transactionPendingDescription: '[nl] Transaction pending. It may take a few days to post.',
        companyInfo: '[nl] Company info',
        companyInfoDescription: '[nl] We need a few more details before you can send your first invoice.',
        yourCompanyName: '[nl] Your company name',
        yourCompanyWebsite: '[nl] Your company website',
        yourCompanyWebsiteNote: "[nl] If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: '[nl] You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: '[nl] You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '[nl] 1 expense',
                other: (count: number) => `[nl] ${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: '[nl] Delete expense',
            other: '[nl] Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: '[nl] Are you sure that you want to delete this expense?',
            other: '[nl] Are you sure that you want to delete these expenses?',
        }),
        deleteReport: () => ({
            one: '[nl] Delete report',
            other: '[nl] Delete reports',
        }),
        deleteReportConfirmation: () => ({
            one: '[nl] Are you sure that you want to delete this report?',
            other: '[nl] Are you sure that you want to delete these reports?',
        }),
        settledExpensify: '[nl] Paid',
        done: '[nl] Done',
        settledElsewhere: '[nl] Paid elsewhere',
        individual: '[nl] Individual',
        business: '[nl] Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `[nl] Pay ${formattedAmount} as an individual` : `[nl] Pay with personal account`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `[nl] Pay ${formattedAmount} with wallet` : `[nl] Pay with wallet`),
        settlePayment: (formattedAmount: string) => `[nl] Pay ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `[nl] Pay ${formattedAmount} as a business` : `[nl] Pay with business account`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `[nl] Mark ${formattedAmount} as paid` : `[nl] Mark as paid`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `[nl] paid ${amount} with personal account ${last4Digits}` : `[nl] Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `[nl] paid ${amount} with business account ${last4Digits}` : `[nl] Paid with business account`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `[nl] Pay ${formattedAmount} via ${policyName}` : `[nl] Pay via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `[nl] paid ${amount} with bank account ${last4Digits}` : `[nl] paid with bank account ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `[nl] paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `[nl] Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `[nl] Business Account • ${lastFour}`,
        nextStep: '[nl] Next steps',
        finished: '[nl] Finished',
        flip: '[nl] Flip',
        sendInvoice: (amount: string) => `[nl] Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `[nl]  for ${comment}` : ''}`,
        submitted: (memo?: string) => `[nl] submitted${memo ? `[nl] , saying ${memo}` : ''}`,
        automaticallySubmitted: `[nl] submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: '[nl] queued to submit via custom approval workflow',
        failedToAutoSubmitViaDEW: (reason: string) => `[nl] failed to submit the report via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `[nl] failed to submit the report. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `[nl] failed to approve via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `[nl] failed to approve. ${reason}`,
        queuedToApproveViaDEW: '[nl] queued to approve via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `[nl] tracking ${formattedAmount}${comment ? `[nl]  for ${comment}` : ''}`,
        splitAmount: (amount: string) => `[nl] split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `[nl] split ${formattedAmount}${comment ? `[nl]  for ${comment}` : ''}`,
        yourSplit: (amount: string) => `[nl] Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `[nl] ${payer} owes ${amount}${comment ? `[nl]  for ${comment}` : ''}`,
        payerOwes: (payer: string) => `[nl] ${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `[nl] ${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: (payer: string) => `[nl] ${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `[nl] ${payer} spent ${amount}`,
        payerSpent: (payer: string) => `[nl] ${payer} spent: `,
        managerApproved: (manager: string) => `[nl] ${manager} approved:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `[nl] ${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `[nl] paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `[nl] paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `[nl] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `[nl] approved ${amount}`,
        approvedMessage: `[nl] approved`,
        unapproved: `[nl] unapproved`,
        automaticallyForwarded: `[nl] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `[nl] approved`,
        rejectedThisReport: '[nl] rejected',
        waitingOnBankAccount: (submitterDisplayName: string) => `[nl] started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: '[nl] canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `[nl] canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `[nl] ${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `[nl] ${payer ? `${payer} ` : ''}marked as paid${comment ? `[nl] , saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `[nl] ${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `[nl] ${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        noReimbursableExpenses: '[nl] This report has an invalid amount',
        pendingConversionMessage: "[nl] Total will update when you're back online",
        changedTheExpense: '[nl] changed the expense',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `[nl] the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `[nl] set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `[nl] the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `[nl] the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `[nl] changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: '[nl] based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `[nl] based on <a href="${rulesLink}">workspace rules</a>` : '[nl] based on workspace rule'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `[nl] for ${comment}` : '[nl] expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `[nl] Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `[nl] ${formattedAmount} sent${comment ? `[nl]  for ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) => `[nl] moved expense from personal space to ${workspaceName ?? `[nl] chat with ${reportName}`}`,
        movedToPersonalSpace: '[nl] moved expense to personal space',
        error: {
            invalidCategoryLength: '[nl] The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: '[nl] The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: '[nl] Please enter a valid amount before continuing',
            invalidDistance: '[nl] Please enter a valid distance before continuing',
            invalidReadings: '[nl] Please enter both start and end readings',
            negativeDistanceNotAllowed: '[nl] End reading must be greater than start reading',
            distanceAmountTooLarge: '[nl] The total amount is too large. Reduce the distance or lower the rate.',
            distanceAmountTooLargeReduceDistance: '[nl] The total amount is too large. Reduce the distance.',
            distanceAmountTooLargeReduceRate: '[nl] The total amount is too large. Lower the rate.',
            odometerReadingTooLarge: (formattedMax: string) => `[nl] Odometer readings cannot exceed ${formattedMax}.`,
            stitchOdometerImagesFailed: '[nl] Failed to combine odometer images. Please try again later.',
            invalidIntegerAmount: '[nl] Please enter a whole dollar amount before continuing',
            invalidTaxAmount: (amount: string) => `[nl] Maximum tax amount is ${amount}`,
            invalidSplit: '[nl] The sum of splits must equal the total amount',
            invalidSplitParticipants: '[nl] Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: '[nl] Please enter a non-zero amount for your split',
            noParticipantSelected: '[nl] Please select a participant',
            other: '[nl] Unexpected error. Please try again later.',
            genericCreateFailureMessage: '[nl] Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: '[nl] Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: '[nl] Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: '[nl] Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: '[nl] Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '[nl] <rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: '[nl] There was an error uploading your receipt.',
            genericDeleteFailureMessage: '[nl] Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: '[nl] Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: '[nl] Transaction is missing fields',
            duplicateWaypointsErrorMessage: '[nl] Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: '[nl] Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: '[nl] An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: '[nl] Please enter a valid merchant',
            atLeastOneAttendee: '[nl] At least one attendee must be selected',
            invalidQuantity: '[nl] Please enter a valid quantity',
            quantityGreaterThanZero: '[nl] Quantity must be greater than zero',
            invalidSubrateLength: '[nl] There must be at least one subrate',
            invalidRate: '[nl] Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "[nl] The end date can't be before the start date",
            endDateSameAsStartDate: "[nl] The end date can't be the same as the start date",
            manySplitsProvided: `[nl] The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `[nl] The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
            nonReimbursablePayment: '[nl] Cannot pay via Expensify',
            nonReimbursablePaymentDescription: (isMultiple?: boolean) =>
                isMultiple
                    ? "[nl] One or more selected reports don't have reimbursable expenses. Double check the expenses, or manually mark as paid."
                    : "[nl] The report doesn't have reimbursable expenses. Double check the expenses, or manually mark as paid.",
        },
        dismissReceiptError: '[nl] Dismiss error',
        dismissReceiptErrorConfirmation: '[nl] Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `[nl] started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: '[nl] Enable wallet',
        hold: '[nl] Hold',
        unhold: '[nl] Remove hold',
        holdExpense: () => ({
            one: '[nl] Hold expense',
            other: '[nl] Hold expenses',
        }),
        unholdExpense: '[nl] Unhold expense',
        heldExpense: '[nl] held this expense',
        unheldExpense: '[nl] unheld this expense',
        moveUnreportedExpense: '[nl] Move unreported expense',
        addUnreportedExpense: '[nl] Add unreported expense',
        selectUnreportedExpense: '[nl] Select at least one expense to add to the report.',
        emptyStateUnreportedExpenseTitle: '[nl] No unreported expenses',
        emptyStateUnreportedExpenseSubtitle: '[nl] Looks like you don’t have any unreported expenses. Try creating one below.',
        addUnreportedExpenseConfirm: '[nl] Add to report',
        newReport: '[nl] New report',
        explainHold: () => ({
            one: "[nl] Explain why you're holding this expense.",
            other: "[nl] Explain why you're holding these expenses.",
        }),
        explainHoldApprover: () => ({
            one: '[nl] Explain what you need before approving this expense.',
            other: '[nl] Explain what you need before approving these expenses.',
        }),
        retracted: '[nl] retracted',
        retract: '[nl] Retract',
        reopened: '[nl] reopened',
        reopenReport: '[nl] Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `[nl] This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: '[nl] Reason',
        holdReasonRequired: '[nl] A reason is required when holding.',
        expenseWasPutOnHold: '[nl] Expense was put on hold',
        expenseOnHold: '[nl] This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: '[nl] All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: '[nl] This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: '[nl] Some of these duplicates have been approved or paid already.',
        reviewDuplicates: '[nl] Review duplicates',
        keepAll: '[nl] Keep all',
        noDuplicatesTitle: '[nl] All set!',
        noDuplicatesDescription: '[nl] There are no duplicate transactions for review here.',
        confirmApprove: '[nl] Confirm approval amount',
        confirmApprovalAmount: '[nl] Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: '[nl] This expense is on hold. Do you want to approve anyway?',
            other: '[nl] These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: '[nl] Confirm payment amount',
        confirmPayAmount: "[nl] Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: '[nl] This expense is on hold. Do you want to pay anyway?',
            other: '[nl] These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: '[nl] Pay only',
        approveOnly: '[nl] Approve only',
        holdEducationalTitle: '[nl] Should you hold this expense?',
        whatIsHoldExplain: "[nl] Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: '[nl] Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "[nl] Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: '[nl] You moved this report!',
            description: '[nl] Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '[nl] <strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: '[nl] This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: '[nl] Change workspace',
        set: '[nl] set',
        changed: '[nl] changed',
        removed: '[nl] removed',
        transactionPending: '[nl] Transaction pending.',
        chooseARate: '[nl] Select a workspace reimbursement rate per mile or kilometer',
        unapprove: '[nl] Unapprove',
        unapproveReport: '[nl] Unapprove report',
        headsUp: '[nl] Heads up!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `[nl] This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: '[nl] reimbursable',
        nonReimbursable: '[nl] non-reimbursable',
        bookingPending: '[nl] This booking is pending',
        bookingPendingDescription: "[nl] This booking is pending because it hasn't been paid yet.",
        bookingArchived: '[nl] This booking is archived',
        bookingArchivedDescription: '[nl] This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: '[nl] Attendees',
        totalPerAttendee: '[nl] Per attendee',
        whoIsYourAccountant: '[nl] Who is your accountant?',
        paymentComplete: '[nl] Payment complete',
        time: '[nl] Time',
        startDate: '[nl] Start date',
        endDate: '[nl] End date',
        startTime: '[nl] Start time',
        endTime: '[nl] End time',
        deleteSubrate: '[nl] Delete subrate',
        deleteSubrateConfirmation: '[nl] Are you sure you want to delete this subrate?',
        quantity: '[nl] Quantity',
        subrateSelection: '[nl] Select a subrate and enter a quantity.',
        qty: '[nl] Qty',
        firstDayText: () => ({
            one: `[nl] First day: 1 hour`,
            other: (count: number) => `[nl] First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `[nl] Last day: 1 hour`,
            other: (count: number) => `[nl] Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `[nl] Trip: 1 full day`,
            other: (count: number) => `[nl] Trip: ${count} full days`,
        }),
        dates: '[nl] Dates',
        rates: '[nl] Rates',
        submitsTo: (name: string) => `[nl] Submits to ${name}`,
        reject: {
            educationalTitle: '[nl] Should you hold or reject?',
            educationalText: "[nl] If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: '[nl] Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: '[nl] Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: '[nl] Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "[nl] Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: '[nl] Reject expense',
            reasonPageDescription: '[nl] Explain why you will not approve this expense.',
            rejectReason: '[nl] Rejection reason',
            markAsResolved: '[nl] Mark as resolved',
            rejectedStatus: '[nl] This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: '[nl] rejected this expense',
                markedAsResolved: '[nl] marked the rejection reason as resolved',
            },
        },
        rejectReport: {
            title: '[nl] Reject report',
            description: '[nl] Explain why you will not approve this report:',
            rejectReason: '[nl] Rejection reason',
            selectTarget: '[nl] Choose the member to reject this report back to for review:',
            lastApprover: '[nl] Last approver',
            submitter: '[nl] Submitter',
            rejectedReportMessage: '[nl] This report was rejected.',
            rejectedNextStep: '[nl] This report was rejected. Waiting on you to fix the issues and manually resubmit.',
            selectMemberError: '[nl] Select a member to reject this report back to.',
            couldNotReject: '[nl] The report could not be rejected. Please try again.',
        },
        moveExpenses: '[nl] Move to report',
        moveExpensesError: "[nl] You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: '[nl] Change approver',
            header: (workflowSettingLink: string) =>
                `[nl] Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `[nl] changed the approver to <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '[nl] Add approver',
                addApproverSubtitle: '[nl] Add an additional approver to the existing workflow.',
                bypassApprovers: '[nl] Bypass approvers',
                bypassApproversSubtitle: '[nl] Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: '[nl] Choose an additional approver for this report before we route through the rest of the approval workflow.',
                bulkSubtitle: '[nl] Choose an additional approver for these reports before we route through the rest of the approval workflow.',
            },
            bulkSubtitle: '[nl] Choose an option to change the approver for these reports.',
        },
        chooseWorkspace: '[nl] Choose a workspace',
        routedDueToDEW: (to: string, reason?: string) => `[nl] report routed to ${to}${reason ? `[nl]  because ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `[nl] ${hours} ${hours === 1 ? '[nl] hour' : '[nl] hours'} @ ${rate} / hour`,
            hrs: '[nl] hrs',
            hours: '[nl] Hours',
            ratePreview: (rate: string) => `[nl] ${rate} / hour`,
            amountTooLargeError: '[nl] The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctRateError: '[nl] Fix the rate error and try again.',
        AskToExplain: `[nl] . <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explain<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '[nl] marked the expense as "reimbursable"' : '[nl] marked the expense as "non-reimbursable"'),
            billable: (value: boolean) => (value ? '[nl] marked the expense as "billable"' : '[nl] marked the expense as "non-billable"'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `[nl] set the tax rate to "${value}"` : `[nl] tax rate to "${value}"`),
            reportName: (value: string) => `[nl] moved this expense to report "${value}"`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `[nl] set the ${field} to "${value}"` : `[nl] ${field} to "${value}"`;
            },
            formatPersonalRules: (fragments: string, route: string) => `[nl] ${fragments} via <a href="${route}">personal expense rules</a>`,
            formatPolicyRules: (fragments: string, route: string) => `[nl] ${fragments} via <a href="${route}">workspace rules</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: "[nl] You can't duplicate per diem expenses across workspaces because the rates may differ between workspaces.",
        cannotDuplicateDistanceExpense: "[nl] You can't duplicate distance expenses across workspaces because the rates may differ between workspaces.",
        taxDisabledAlert: {
            title: '[nl] Tax disabled',
            prompt: '[nl] Enable tax tracking on the workspace to edit the expense details or delete the tax from this expense.',
            confirmText: '[nl] Delete tax',
        },
    },
    transactionMerge: {
        listPage: {
            header: '[nl] Merge expenses',
            noEligibleExpenseFound: '[nl] No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `[nl] <muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `[nl] Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '[nl] Select receipt',
            pageTitle: '[nl] Select the receipt you want to keep:',
        },
        detailsPage: {
            header: '[nl] Select details',
            pageTitle: '[nl] Select the details you want to keep:',
            noDifferences: '[nl] No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '[nl] an' : '[nl] a';
                return `[nl] Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: '[nl] Please select attendees',
            selectAllDetailsError: '[nl] Select all details before continuing.',
        },
        confirmationPage: {
            header: '[nl] Confirm details',
            pageTitle: "[nl] Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: '[nl] Merge expenses',
        },
    },
    share: {
        shareToExpensify: '[nl] Share to Expensify',
        messageInputLabel: '[nl] Message',
    },
    notificationPreferencesPage: {
        header: '[nl] Notification preferences',
        label: '[nl] Notify me about new messages',
        notificationPreferences: {
            always: '[nl] Immediately',
            daily: '[nl] Daily',
            mute: '[nl] Mute',
            hidden: '[nl][ctx: UI label indicating that something is concealed or not visible to the user.] Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "[nl] The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "[nl] The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: '[nl] Upload photo',
        removePhoto: '[nl] Remove photo',
        editImage: '[nl] Edit photo',
        viewPhoto: '[nl] View photo',
        imageUploadFailed: '[nl] Image upload failed',
        deleteWorkspaceError: '[nl] Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `[nl] The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `[nl] Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `[nl] Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: '[nl] Edit profile picture',
        upload: '[nl] Upload',
        uploadPhoto: '[nl] Upload photo',
        selectAvatar: '[nl] Select avatar',
        choosePresetAvatar: '[nl] Or choose a custom avatar',
    },
    modal: {
        backdropLabel: '[nl] Modal Backdrop',
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
                        return `[nl] Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] Waiting for an admin to add expenses.`;
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
                        return `[nl] Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] Waiting for an admin to submit expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `[nl] No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[nl] Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] Waiting for an admin to add a bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[nl]  on the ${eta} of each month` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[nl] Waiting for your expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] Waiting for an admin's expenses to automatically submit${formattedETA}.`;
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
                        return `[nl] Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] Waiting for an admin to fix the issues.`;
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
                        return `[nl] Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] Waiting for an admin to approve expenses.`;
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
                        return `[nl] Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] Waiting for an admin to export this report.`;
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
                        return `[nl] Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] Waiting for an admin to pay expenses.`;
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
                        return `[nl] Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] Waiting for an admin to finish setting up a business bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[nl]  by ${eta}` : ` ${eta}`;
                }
                return `[nl] Waiting for payment to complete${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `[nl] Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[nl] This report was rejected. Waiting on <strong>you</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[nl] This report was rejected. Waiting on <strong>${actor}</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[nl] This report was rejected. Waiting on an admin to fix the issues and manually resubmit.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '[nl] shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '[nl] later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '[nl] on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '[nl] on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '[nl] on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '[nl] on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '[nl] at the end of your trip',
        },
    },
    profilePage: {
        profile: '[nl] Profile',
        preferredPronouns: '[nl] Preferred pronouns',
        selectYourPronouns: '[nl] Select your pronouns',
        selfSelectYourPronoun: '[nl] Self-select your pronoun',
        emailAddress: '[nl] Email address',
        setMyTimezoneAutomatically: '[nl] Set my timezone automatically',
        timezone: '[nl] Timezone',
        invalidFileMessage: '[nl] Invalid file. Please try a different image.',
        avatarUploadFailureMessage: '[nl] An error occurred uploading the avatar. Please try again.',
        online: '[nl] Online',
        offline: '[nl] Offline',
        syncing: '[nl] Syncing',
        profileAvatar: '[nl] Profile avatar',
        publicSection: {
            title: '[nl] Public',
            subtitle: '[nl] These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: '[nl] Private',
            subtitle: "[nl] These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: '[nl] Security options',
        subtitle: '[nl] Enable two-factor authentication to keep your account safe.',
        goToSecurity: '[nl] Go back to security page',
    },
    shareCodePage: {
        title: '[nl] Your code',
        subtitle: '[nl] Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: '[nl] Pronouns',
        isShownOnProfile: '[nl] Your pronouns are shown on your profile.',
        placeholderText: '[nl] Search to see options',
    },
    contacts: {
        contactMethods: '[nl] Contact methods',
        featureRequiresValidate: '[nl] This feature requires you to validate your account.',
        validateAccount: '[nl] Validate your account',
        helpText: ({email}: {email: string}) =>
            `[nl] Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: '[nl] Please verify this contact method.',
        getInTouch: "[nl] We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `[nl] Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '[nl] Set as default',
        yourDefaultContactMethod: "[nl] This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        yourDefaultContactMethodRestrictedSwitch: '[nl] This is your current default contact method. Your company has restricted removing or changing it.',
        removeContactMethod: '[nl] Remove contact method',
        removeAreYouSure: "[nl] Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: '[nl] Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: '[nl] Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: '[nl] Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: '[nl] Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: '[nl] Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: '[nl] Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: '[nl] This contact method already exists',
            passwordRequired: '[nl] password required.',
            contactMethodRequired: '[nl] Contact method is required',
            invalidContactMethod: '[nl] Invalid contact method',
        },
        newContactMethod: '[nl] New contact method',
        goBackContactMethods: '[nl] Go back to contact methods',
    },
    pronouns: {
        coCos: '[nl] Co / Cos',
        eEyEmEir: '[nl] E / Ey / Em / Eir',
        faeFaer: '[nl] Fae / Faer',
        heHimHis: '[nl] He / Him / His',
        heHimHisTheyThemTheirs: '[nl] He / Him / His / They / Them / Theirs',
        sheHerHers: '[nl] She / Her / Hers',
        sheHerHersTheyThemTheirs: '[nl] She / Her / Hers / They / Them / Theirs',
        merMers: '[nl] Mer / Mers',
        neNirNirs: '[nl] Ne / Nir / Nirs',
        neeNerNers: '[nl] Nee / Ner / Ners',
        perPers: '[nl] Per / Pers',
        theyThemTheirs: '[nl] They / Them / Theirs',
        thonThons: '[nl] Thon / Thons',
        veVerVis: '[nl] Ve / Ver / Vis',
        viVir: '[nl] Vi / Vir',
        xeXemXyr: '[nl] Xe / Xem / Xyr',
        zeZieZirHir: '[nl] Ze / Zie / Zir / Hir',
        zeHirHirs: '[nl] Ze / Hir',
        callMeByMyName: '[nl] Call me by my name',
    },
    displayNamePage: {
        headerTitle: '[nl] Display name',
        isShownOnProfile: '[nl] Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: '[nl] Timezone',
        isShownOnProfile: '[nl] Your timezone is shown on your profile.',
        getLocationAutomatically: '[nl] Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: '[nl] Update required',
        pleaseInstall: '[nl] Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: '[nl] Please install the latest version of Expensify',
        toGetLatestChanges: '[nl] For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: '[nl] The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: '[nl] About',
        aboutPage: {
            description: '[nl] The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: '[nl] App download links',
            viewKeyboardShortcuts: '[nl] View keyboard shortcuts',
            viewTheCode: '[nl] View the code',
            viewOpenJobs: '[nl] View open jobs',
            reportABug: '[nl] Report a bug',
            troubleshoot: '[nl] Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: '[nl] Android',
            },
            ios: {
                label: '[nl] iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '[nl] Clear cache and restart',
            description:
                '[nl] <muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: '[nl] All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: '[nl] Reset and refresh',
            clientSideLogging: '[nl] Client side logging',
            noLogsToShare: '[nl] No logs to share',
            useProfiling: '[nl] Use profiling',
            profileTrace: '[nl] Profile trace',
            results: '[nl] Results',
            releaseOptions: '[nl] Release options',
            testingPreferences: '[nl] Testing preferences',
            useStagingServer: '[nl] Use Staging Server',
            forceOffline: '[nl] Force offline',
            simulatePoorConnection: '[nl] Simulate poor internet connection',
            simulateFailingNetworkRequests: '[nl] Simulate failing network requests',
            authenticationStatus: '[nl] Authentication status',
            deviceCredentials: '[nl] Device credentials',
            invalidate: '[nl] Invalidate',
            destroy: '[nl] Destroy',
            maskExportOnyxStateData: '[nl] Mask fragile member data while exporting Onyx state',
            exportOnyxState: '[nl] Export Onyx state',
            importOnyxState: '[nl] Import Onyx state',
            testCrash: '[nl] Test crash',
            resetToOriginalState: '[nl] Reset to original state',
            usingImportedState: '[nl] You are using imported state. Press here to clear it.',
            debugMode: '[nl] Debug mode',
            invalidFile: '[nl] Invalid file',
            invalidFileDescription: '[nl] The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: '[nl] Invalidate with delay',
            leftHandNavCache: '[nl] Left Hand Nav cache',
            clearleftHandNavCache: '[nl] Clear',
            softKillTheApp: '[nl] Soft kill the app',
            kill: '[nl] Kill',
            sentryDebug: '[nl] Sentry debug',
            sentrySendDescription: '[nl] Send data to Sentry',
            sentryDebugDescription: '[nl] Log Sentry requests to console',
            sentryHighlightedSpanOps: '[nl] Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: '[nl] ui.interaction.click, navigation, ui.load',
        },
        security: '[nl] Security',
        signOut: '[nl] Sign out',
        restoreStashed: '[nl] Restore stashed login',
        signOutConfirmationText: "[nl] You'll lose any offline changes if you sign out.",
        versionLetter: '[nl] v',
        readTheTermsAndPrivacy: `[nl] Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.`,
        help: '[nl] Help',
        helpPage: {
            title: '[nl] Help and support',
            description: '[nl] We are here to help you 24/7',
            helpSite: '[nl] Help site',
            conciergeChat: '[nl] Concierge',
            conciergeChatDescription: '[nl] Your personal AI agent',
        },
        whatIsNew: "[nl] What's new",
        accountSettings: '[nl] Account settings',
        account: '[nl] Account',
        general: '[nl] General',
    },
    closeAccountPage: {
        closeAccount: '[nl][ctx: close as a verb, not an adjective] Close account',
        reasonForLeavingPrompt: '[nl] We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: '[nl] Enter message here',
        closeAccountWarning: '[nl] Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: '[nl] Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: '[nl] Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: '[nl] Enter your default contact method',
        defaultContact: '[nl] Default contact method:',
        enterYourDefaultContactMethod: '[nl] Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: '[nl] Merge accounts',
        accountDetails: {
            accountToMergeInto: (login: string) => `[nl] Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: '[nl] I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: '[nl] Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: (login: string) => `[nl] Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `[nl] To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: '[nl] Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: '[nl] Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: '[nl] Accounts merged!',
            description: (from: string, to: string) =>
                `[nl] <muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '[nl] We’re working on it',
            limitedSupport: '[nl] We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp: '[nl] <muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: '[nl] Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `[nl] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `[nl] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `[nl] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: '[nl] Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `[nl] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `[nl] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `[nl] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `[nl] <muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '[nl] Try again later',
            description: '[nl] There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "[nl] You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: '[nl] You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: '[nl] Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '[nl] Report suspicious activity',
        lockAccount: '[nl] Lock account',
        unlockAccount: '[nl] Unlock account',
        unlockTitle: '[nl] We’ve received your request',
        unlockDescription: '[nl] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        compromisedDescription:
            '[nl] Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: '[nl] For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: '[nl] Are you sure you want to lock your Expensify account?',
        onceLocked: '[nl] Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '[nl] Failed to lock account',
        failedToLockAccountDescription: `[nl] We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: '[nl] Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: '[nl] Account locked',
        yourAccountIsLocked: '[nl] Your account is locked',
        chatToConciergeToUnlock: '[nl] Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: '[nl] Chat with Concierge',
    },
    twoFactorAuth: {
        headerTitle: '[nl] Two-factor authentication',
        twoFactorAuthEnabled: '[nl] Two-factor authentication enabled',
        whatIsTwoFactorAuth: '[nl] Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: '[nl] Disable two-factor authentication',
        explainProcessToRemove: '[nl] To disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: '[nl] To disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: '[nl] Two-factor authentication is now disabled',
        noAuthenticatorApp: '[nl] You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: '[nl] Recovery codes',
        keepCodesSafe: '[nl] Keep these recovery codes safe!',
        codesLoseAccess: dedent(`
            [nl] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            Note: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        errorStepCodes: '[nl] Please copy or download codes before continuing',
        stepVerify: '[nl] Verify',
        scanCode: '[nl] Scan the QR code using your',
        authenticatorApp: '[nl] authenticator app',
        addKey: '[nl] Or add this secret key to your authenticator app:',
        secretKey: '[nl] secret key',
        enterCode: '[nl] Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: '[nl] Finished',
        enabled: '[nl] Two-factor authentication enabled',
        congrats: '[nl] Congrats! Now you’ve got that extra security.',
        copy: '[nl] Copy',
        disable: '[nl] Disable',
        enableTwoFactorAuth: '[nl] Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: '[nl] Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: '[nl] For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: '[nl] Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: '[nl] Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: '[nl] Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: '[nl] Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: '[nl] Cannot disable 2FA',
        twoFactorAuthRequired: '[nl] Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
        replaceDevice: '[nl] Replace device',
        replaceDeviceTitle: '[nl] Replace two-factor device',
        verifyOldDeviceTitle: '[nl] Verify old device',
        verifyOldDeviceDescription: '[nl] Enter the six-digit code from your current authenticator app to confirm you have access to it.',
        verifyNewDeviceTitle: '[nl] Set up new device',
        verifyNewDeviceDescription: '[nl] Scan the QR code with your new device, then enter the code to complete setup.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '[nl] Please enter your recovery code',
            incorrectRecoveryCode: '[nl] Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: '[nl] Use recovery code',
        recoveryCode: '[nl] Recovery code',
        use2fa: '[nl] Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '[nl] Please enter your two-factor authentication code',
            incorrect2fa: '[nl] Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '[nl] Password updated!',
        allSet: '[nl] You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: '[nl] Private notes',
        personalNoteMessage: "[nl] Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: '[nl] Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: '[nl] Notes',
        myNote: '[nl] My note',
        error: {
            genericFailureMessage: "[nl] Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: '[nl] Please enter a valid security code',
        },
        securityCode: '[nl] Security code',
        changeBillingCurrency: '[nl] Change billing currency',
        changePaymentCurrency: '[nl] Change payment currency',
        paymentCurrency: '[nl] Payment currency',
        paymentCurrencyDescription: '[nl] Select a standardized currency that all personal expenses should be converted to',
        note: `[nl] Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: '[nl] Add a debit card',
        nameOnCard: '[nl] Name on card',
        debitCardNumber: '[nl] Debit card number',
        expiration: '[nl] Expiration date',
        expirationDate: '[nl] MMYY',
        cvv: '[nl] CVV',
        billingAddress: '[nl] Billing address',
        growlMessageOnSave: '[nl] Your debit card was successfully added',
        expensifyPassword: '[nl] Expensify password',
        error: {
            invalidName: '[nl] Name can only include letters',
            addressZipCode: '[nl] Please enter a valid zip code',
            debitCardNumber: '[nl] Please enter a valid debit card number',
            expirationDate: '[nl] Please select a valid expiration date',
            securityCode: '[nl] Please enter a valid security code',
            addressStreet: "[nl] Please enter a valid billing address that's not a PO box",
            addressState: '[nl] Please select a state',
            addressCity: '[nl] Please enter a city',
            genericFailureMessage: '[nl] An error occurred while adding your card. Please try again.',
            password: '[nl] Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '[nl] Add payment card',
        nameOnCard: '[nl] Name on card',
        paymentCardNumber: '[nl] Card number',
        expiration: '[nl] Expiration date',
        expirationDate: '[nl] MM/YY',
        cvv: '[nl] CVV',
        billingAddress: '[nl] Billing address',
        growlMessageOnSave: '[nl] Your payment card was successfully added',
        expensifyPassword: '[nl] Expensify password',
        error: {
            invalidName: '[nl] Name can only include letters',
            addressZipCode: '[nl] Please enter a valid zip code',
            paymentCardNumber: '[nl] Please enter a valid card number',
            expirationDate: '[nl] Please select a valid expiration date',
            securityCode: '[nl] Please enter a valid security code',
            addressStreet: "[nl] Please enter a valid billing address that's not a PO box",
            addressState: '[nl] Please select a state',
            addressCity: '[nl] Please enter a city',
            genericFailureMessage: '[nl] An error occurred while adding your card. Please try again.',
            password: '[nl] Please enter your Expensify password',
        },
    },
    personalCard: {
        addPersonalCard: '[nl] Add personal card',
        addCompanyCard: '[nl] Add company card',
        lookingForCompanyCards: '[nl] Need to add company cards?',
        lookingForCompanyCardsDescription: '[nl] Bring your own cards from 10,000+ banks worldwide.',
        personalCardAdded: '[nl] Personal card added!',
        personalCardAddedDescription: '[nl] Congrats, we’ll begin importing transactions from your card.',
        isPersonalCard: '[nl] Is this a personal card?',
        thisIsPersonalCard: '[nl] This is a personal card',
        thisIsCompanyCard: '[nl] This is a company card',
        askAdmin: '[nl] Ask your admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `[nl] If so, great! But if it's a <strong>company</strong> card, please ${isAdmin ? '[nl] assign it from your workspace instead.' : '[nl] ask your admin to assign it to you from the workspace instead.'}`,
        bankConnectionError: '[nl] Bank connection issue',
        bankConnectionDescription: '[nl] Please try adding your cards again. Otherwise, you can',
        connectWithPlaid: '[nl] connect via Plaid.',
        brokenConnection: '[nl] Your card connection is broken.',
        fixCard: '[nl] Fix card',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `[nl] Your ${cardName} card connection is broken. <a href="${connectionLink}">Log into your bank</a> to fix the card.`
                : `[nl] Your ${cardName} card connection is broken. Log into your bank to fix the card.`,
        addAdditionalCards: '[nl] Add additional cards',
        upgradeDescription: '[nl] Need to add more cards? Create a workspace to add additional personal cards or assign company cards to the entire team.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `[nl] <muted-text>This is available on the Collect plan, which is <strong>${formattedPrice}</strong> per member per month.</muted-text>`,
        note: (subscriptionLink: string) =>
            `[nl] <muted-text>Create a workspace to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
        workspaceCreated: '[nl] Workspace created',
        newWorkspace: '[nl] You created a workspace!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `[nl] <centered-text>You’re all set to add additional cards. <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
    },
    walletPage: {
        balance: '[nl] Balance',
        paymentMethodsTitle: '[nl] Payment methods',
        setDefaultConfirmation: '[nl] Make default payment method',
        setDefaultSuccess: '[nl] Default payment method set!',
        deleteAccount: '[nl] Delete account',
        deleteConfirmation: '[nl] Are you sure you want to delete this account?',
        deleteCard: '[nl] Delete card',
        deleteCardConfirmation:
            '[nl] All unsubmitted card transactions, including those on open reports, will be removed. Are you sure you want to delete this card? You cannot undo this action.',
        error: {
            notOwnerOfBankAccount: '[nl] An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: '[nl] This bank account is temporarily suspended',
            notOwnerOfFund: '[nl] An error occurred while setting this card as your default payment method',
            setDefaultFailure: '[nl] Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: '[nl] An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: '[nl] Get paid faster',
        addPaymentMethod: '[nl] Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: '[nl] Get paid back faster',
        secureAccessToYourMoney: '[nl] Secure access to your money',
        receiveMoney: '[nl] Receive money in your local currency',
        expensifyWallet: '[nl] Expensify Wallet (Beta)',
        sendAndReceiveMoney: '[nl] Send and receive money with friends. US bank accounts only.',
        enableWallet: '[nl] Enable wallet',
        addBankAccountToSendAndReceive: '[nl] Add a bank account to make or receive payments.',
        addDebitOrCreditCard: '[nl] Add debit or credit card',
        cardInactive: '[nl] Inactive',
        assignedCards: '[nl] Assigned cards',
        assignedCardsDescription: '[nl] Transactions from these cards sync automatically.',
        expensifyCard: '[nl] Expensify Card',
        walletActivationPending: "[nl] We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "[nl] Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: '[nl] Add your bank account',
        addBankAccountBody: "[nl] Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: '[nl] Choose your bank account',
        chooseAccountBody: '[nl] Make sure that you select the right one.',
        confirmYourBankAccount: '[nl] Confirm your bank account',
        personalBankAccounts: '[nl] Personal bank accounts',
        businessBankAccounts: '[nl] Business bank accounts',
        shareBankAccount: '[nl] Share bank account',
        bankAccountShared: '[nl] Bank account shared',
        shareBankAccountTitle: '[nl] Select the admins to share this bank account with:',
        shareBankAccountSuccess: '[nl] Bank account shared!',
        shareBankAccountSuccessDescription: '[nl] The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: '[nl] An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: '[nl] No admins available',
        shareBankAccountEmptyDescription: '[nl] There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: '[nl] Please select an admin before continuing',
        unshareBankAccount: '[nl] Unshare bank account',
        unshareBankAccountDescription: '[nl] Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `[nl] ${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: '[nl] It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: `[nl] Can't unshare bank account`,
        travelCVV: {
            title: '[nl] Travel CVV',
            subtitle: '[nl] Use this when booking travel',
            description: "[nl] Use this card for your Expensify Travel bookings. It'll show as “Travel Card” at checkout.",
        },
        chaseAccountNumberDifferent: '[nl] Why is my account number different?',
    },
    cardPage: {
        expensifyCard: '[nl] Expensify Card',
        expensifyTravelCard: '[nl] Expensify Travel Card',
        availableSpend: '[nl] Remaining limit',
        smartLimit: {
            name: '[nl] Smart limit',
            title: (formattedLimit: string) => `[nl] You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: '[nl] Fixed limit',
            title: (formattedLimit: string) => `[nl] You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: '[nl] Monthly limit',
            title: (formattedLimit: string) => `[nl] You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: '[nl] Virtual card number',
        travelCardCvv: '[nl] Travel card CVV',
        physicalCardNumber: '[nl] Physical card number',
        physicalCardPin: '[nl] PIN',
        getPhysicalCard: '[nl] Get physical card',
        reportFraud: '[nl] Report virtual card fraud',
        reportTravelFraud: '[nl] Report travel card fraud',
        reviewTransaction: '[nl] Review transaction',
        suspiciousBannerTitle: '[nl] Suspicious transaction',
        suspiciousBannerDescription: '[nl] We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "[nl] Your card is temporarily locked while our team reviews your company's account.",
        markTransactionsAsReimbursable: '[nl] Mark transactions as reimbursable',
        markTransactionsDescription: '[nl] When enabled, transactions imported from this card are marked as reimbursable by default.',
        csvCardDescription: '[nl] CSV Import',
        cardDetails: {
            cardNumber: '[nl] Virtual card number',
            expiration: '[nl] Expiration',
            cvv: '[nl] CVV',
            address: '[nl] Address',
            revealDetails: '[nl] Reveal details',
            revealCvv: '[nl] Reveal CVV',
            copyCardNumber: '[nl] Copy card number',
            updateAddress: '[nl] Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `[nl] Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: '[nl] An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "[nl] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[nl] Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        unexpectedError: '[nl] There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: '[nl] Yes, I do',
            reportFraudButtonText: "[nl] No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `[nl] cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `[nl] deactivated the card ending in ${cardLastFour}`,
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
            }) => `[nl] identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?

${amount} for ${merchant} - ${date}`,
        },
        setYourPin: '[nl] Set the PIN for your card.',
        confirmYourPin: '[nl] Enter your PIN again to confirm.',
        changeYourPin: '[nl] Enter a new PIN for your card.',
        confirmYourChangedPin: '[nl] Confirm your new PIN.',
        pinMustBeFourDigits: '[nl] PIN must be exactly 4 digits.',
        invalidPin: '[nl] Please choose a more secure PIN.',
        pinMismatch: '[nl] PINs do not match. Please try again.',
        revealPin: '[nl] Reveal PIN',
        hidePin: '[nl] Hide PIN',
        pin: '[nl] PIN',
        pinChanged: '[nl] PIN changed!',
        pinChangedHeader: '[nl] PIN changed',
        pinChangedDescription: "[nl] You're all set to use your PIN now.",
        changePin: '[nl] Change PIN',
        changePinAtATM: '[nl] Change your PIN at any ATM',
        changePinAtATMDescription: '[nl] This is required in your region. <concierge-link>Reach out to Concierge</concierge-link> if you have any questions.',
        freezeCard: '[nl] Freeze card',
        unfreeze: '[nl] Unfreeze',
        unfreezeCard: '[nl] Unfreeze card',
        askToUnfreeze: '[nl] Ask to unfreeze',
        freezeDescription: '[nl] A frozen card cannot be used for purchases and transactions. You can unfreeze it at any time.',
        unfreezeDescription: "[nl] Unfreezing this card will start allowing purchases and transactions again. Only proceed if you're sure the card is safe to use.",
        frozen: '[nl] Frozen',
        youFroze: ({date}: {date: string}) => `[nl] You froze this card on ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `[nl] ${person} froze this card on ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `[nl] This card was frozen on ${date} by `,
        frozenByAdminNeedsUnfreezePrefix: '[nl] This card was frozen by ',
        frozenByAdminNeedsUnfreezeSuffix: '[nl] . Please contact an admin to unfreeze it.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `[nl] This card was frozen by ${person}. Please contact an admin to unfreeze it.`,
    },
    workflowsPage: {
        workflowTitle: '[nl] Spend',
        workflowDescription: '[nl] Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: '[nl] Submissions',
        submissionFrequencyDescription: '[nl] Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: '[nl] Date of month',
        disableApprovalPromptDescription: '[nl] Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: '[nl] Approvals',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `[nl] expenses from ${members}, and the approver is ${approvers}`,
        addApprovalButton: '[nl] Add approval workflow',
        findWorkflow: '[nl] Find workflow',
        addApprovalTip: '[nl] This default workflow applies to all members, unless a more specific workflow exists.',
        approver: '[nl] Approver',
        addApprovalsDescription: '[nl] Require additional approval before authorizing a payment.',
        makeOrTrackPaymentsTitle: '[nl] Payments',
        makeOrTrackPaymentsDescription: '[nl] Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '[nl] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '[nl] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: '[nl] Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: '[nl] Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: '[nl] Instantly',
            weekly: '[nl] Weekly',
            monthly: '[nl] Monthly',
            twiceAMonth: '[nl] Twice a month',
            byTrip: '[nl] By trip',
            manually: '[nl] Manually',
            daily: '[nl] Daily',
            lastDayOfMonth: '[nl] Last day of the month',
            lastBusinessDayOfMonth: '[nl] Last business day of the month',
            ordinals: {
                one: '[nl] st',
                two: '[nl] nd',
                few: '[nl] rd',
                other: '[nl] th',
                '1': '[nl] First',
                '2': '[nl] Second',
                '3': '[nl] Third',
                '4': '[nl] Fourth',
                '5': '[nl] Fifth',
                '6': '[nl] Sixth',
                '7': '[nl] Seventh',
                '8': '[nl] Eighth',
                '9': '[nl] Ninth',
                '10': '[nl] Tenth',
            },
        },
        approverInMultipleWorkflows: '[nl] This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `[nl] <strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: '[nl] No members to display',
            expensesFromSubtitle: '[nl] All workspace members already belong to an existing approval workflow.',
            approverSubtitle: '[nl] All approvers belong to an existing workflow.',
            bulkApproverSubtitle: '[nl] No approvers match the criteria for selected reports.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "[nl] Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "[nl] Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: '[nl] Confirm',
        header: '[nl] Add more approvers and confirm.',
        additionalApprover: '[nl] Additional approver',
        submitButton: '[nl] Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: '[nl] Edit approval workflow',
        deleteTitle: '[nl] Delete approval workflow',
        deletePrompt: '[nl] Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: '[nl] Expenses from',
        header: '[nl] When the following members submit expenses:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "[nl] The approver couldn't be changed. Please try again or contact support.",
        title: '[nl] Set approver',
        description: '[nl] This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: '[nl] Approver',
        header: '[nl] (Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `[nl] Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : '[nl] Add another approver when a report exceeds the amount below:',
        reportAmountLabel: '[nl] Report amount',
        additionalApproverLabel: '[nl] Additional approver',
        skip: '[nl] Skip',
        next: '[nl] Next',
        removeLimit: '[nl] Remove limit',
        enterAmountError: '[nl] Please enter a valid amount',
        enterApproverError: '[nl] Approver is required when you set a report limit',
        enterBothError: '[nl] Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `[nl] Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: '[nl] Authorized payer',
        genericErrorMessage: '[nl] The authorized payer could not be changed. Please try again.',
        admins: '[nl] Admins',
        payer: '[nl] Payer',
        paymentAccount: '[nl] Payment account',
        shareBankAccount: {
            shareTitle: '[nl] Share bank account access?',
            shareDescription: ({admin}: {admin: string}) => `[nl] You'll need to share bank account access with ${admin} to make them the payer.`,
            validationTitle: '[nl] Bank account awaiting validation',
            validationDescription: ({admin}: {admin: string}) =>
                `[nl] You need to <a href="#">validate this bank account</a>. Once that's done, you can share bank account access with ${admin} to make them the payer.`,
            errorTitle: "[nl] Can't change payer",
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `[nl] ${admin} doesn't have access to this bank account, so you can't make them the payer. <a href="#">Chat with ${owner}</a> if the bank account should be shared.`,
        },
    },
    reportFraudPage: {
        title: '[nl] Report virtual card fraud',
        description: '[nl] If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: '[nl] Deactivate card',
        reportVirtualCardFraud: '[nl] Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: '[nl] Card fraud reported',
        description: '[nl] We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        buttonText: '[nl] Got it, thanks!',
    },
    activateCardPage: {
        activateCard: '[nl] Activate card',
        pleaseEnterLastFour: '[nl] Please enter the last four digits of your card.',
        activatePhysicalCard: '[nl] Activate physical card',
        error: {
            thatDidNotMatch: "[nl] That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "[nl] You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: '[nl] Get physical card',
        nameMessage: '[nl] Enter your first and last name, as this will be shown on your card.',
        legalName: '[nl] Legal name',
        legalFirstName: '[nl] Legal first name',
        legalLastName: '[nl] Legal last name',
        phoneMessage: '[nl] Enter your phone number.',
        phoneNumber: '[nl] Phone number',
        address: '[nl] Address',
        addressMessage: '[nl] Enter your shipping address.',
        streetAddress: '[nl] Street Address',
        city: '[nl] City',
        state: '[nl] State',
        zipPostcode: '[nl] Zip/Postcode',
        country: '[nl] Country',
        confirmMessage: '[nl] Please confirm your details below.',
        estimatedDeliveryMessage: '[nl] Your physical card will arrive in 2-3 business days.',
        next: '[nl] Next',
        getPhysicalCard: '[nl] Get physical card',
        shipCard: '[nl] Ship card',
    },
    transferAmountPage: {
        transfer: (amount: string) => `[nl] Transfer${amount ? ` ${amount}` : ''}`,
        instant: '[nl] Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `[nl] ${rate}% fee (${minAmount} minimum)`,
        ach: '[nl] 1-3 Business days (Bank account)',
        achSummary: '[nl] No fee',
        whichAccount: '[nl] Which account?',
        fee: '[nl] Fee',
        transferSuccess: '[nl] Transfer successful!',
        transferDetailBankAccount: '[nl] Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: '[nl] Your money should arrive immediately.',
        failedTransfer: '[nl] Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: '[nl] Please transfer your balance from the wallet page',
        goToWallet: '[nl] Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: '[nl] Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: '[nl] Add payment method',
        addNewDebitCard: '[nl] Add new debit card',
        addNewBankAccount: '[nl] Add new bank account',
        accountLastFour: '[nl] Ending in',
        cardLastFour: '[nl] Card ending in',
        addFirstPaymentMethod: '[nl] Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: '[nl] Default',
        bankAccountLastFour: (lastFour: string) => `[nl] Bank Account • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '[nl] Expense rules',
        subtitle: '[nl] These rules will apply to your expenses.',
        findRule: '[nl] Find rule',
        emptyRules: {
            title: "[nl] You haven't created any rules",
            subtitle: '[nl] Add a rule to automate expense reporting.',
        },
        changes: {
            billableUpdate: (value: boolean) => `[nl] Update expense ${value ? '[nl] billable' : '[nl] non-billable'}`,
            categoryUpdate: (value: string) => `[nl] Update category to "${value}"`,
            commentUpdate: (value: string) => `[nl] Update description to "${value}"`,
            merchantUpdate: (value: string) => `[nl] Update merchant to "${value}"`,
            reimbursableUpdate: (value: boolean) => `[nl] Update expense ${value ? '[nl] reimbursable' : '[nl] non-reimbursable'}`,
            tagUpdate: (value: string) => `[nl] Update tag to "${value}"`,
            taxUpdate: (value: string) => `[nl] Update tax rate to "${value}"`,
            billable: (value: boolean) => `[nl] expense ${value ? '[nl] billable' : '[nl] non-billable'}`,
            category: (value: string) => `[nl] category to "${value}"`,
            comment: (value: string) => `[nl] description to "${value}"`,
            merchant: (value: string) => `[nl] merchant to "${value}"`,
            reimbursable: (value: boolean) => `[nl] expense ${value ? '[nl] reimbursable' : '[nl] non-reimbursable'}`,
            tag: (value: string) => `[nl] tag to "${value}"`,
            tax: (value: string) => `[nl] tax rate to "${value}"`,
            report: (value: string) => `[nl] add to a report named "${value}"`,
        },
        newRule: '[nl] New rule',
        addRule: {
            title: '[nl] Add rule',
            expenseContains: '[nl] If expense contains:',
            applyUpdates: '[nl] Then apply these updates:',
            merchantHint: '[nl] Type . to create a rule that applies to all merchants',
            addToReport: '[nl] Add to a report named',
            createReport: '[nl] Create report if necessary',
            applyToExistingExpenses: '[nl] Apply to existing matching expenses',
            confirmError: '[nl] Enter merchant and apply at least one update',
            confirmErrorMerchant: '[nl] Please enter merchant',
            confirmErrorUpdate: '[nl] Please apply at least one update',
            saveRule: '[nl] Save rule',
        },
        editRule: {
            title: '[nl] Edit rule',
        },
        deleteRule: {
            deleteSingle: '[nl] Delete rule',
            deleteMultiple: '[nl] Delete rules',
            deleteSinglePrompt: '[nl] Are you sure you want to delete this rule?',
            deleteMultiplePrompt: '[nl] Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: '[nl] App preferences',
        },
        testSection: {
            title: '[nl] Test preferences',
            subtitle: '[nl] Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '[nl] Receive relevant feature updates and Expensify news',
        muteAllSounds: '[nl] Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: '[nl] Priority mode',
        explainerText: '[nl] Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: '[nl] Most recent',
                description: '[nl] Show all chats sorted by most recent',
            },
            gsd: {
                label: '[nl] #focus',
                description: '[nl] Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `[nl] in ${policyName}`,
        generatingPDF: '[nl] Generate PDF',
        waitForPDF: '[nl] Please wait while we generate the PDF.',
        errorPDF: '[nl] There was an error when trying to generate your PDF',
        successPDF: "[nl] Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: '[nl] Room description',
        roomDescriptionOptional: '[nl] Room description (optional)',
        explainerText: '[nl] Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: '[nl] Heads up!',
        lastMemberWarning: "[nl] Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: (displayName: string) => `[nl] ${displayName}'s group chat`,
    },
    languagePage: {
        language: '[nl] Language',
        aiGenerated: '[nl] The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: '[nl] Theme',
        themes: {
            dark: {
                label: '[nl] Dark',
            },
            light: {
                label: '[nl] Light',
            },
            system: {
                label: '[nl] Use device settings',
            },
        },
        highContrastMode: '[nl] High contrast mode',
        chooseThemeBelowOrSync: '[nl] Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `[nl] <muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `[nl] Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "[nl] Didn't receive a magic code?",
        enterAuthenticatorCode: '[nl] Please enter your authenticator code',
        enterRecoveryCode: '[nl] Please enter your recovery code',
        requiredWhen2FAEnabled: '[nl] Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `[nl] Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '[nl] Request a new code',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `[nl] Time remaining: ${timeRemaining} ${timeRemaining === 1 ? '[nl] second' : '[nl] seconds'}`,
        timeExpiredAnnouncement: '[nl] The time has expired',
        error: {
            pleaseFillMagicCode: '[nl] Please enter your magic code',
            incorrectMagicCode: '[nl] Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: '[nl] Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '[nl] Please fill out all fields',
        pleaseFillPassword: '[nl] Please enter your password',
        pleaseFillTwoFactorAuth: '[nl] Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: '[nl] Enter your two-factor authentication code to continue',
        forgot: '[nl] Forgot?',
        requiredWhen2FAEnabled: '[nl] Required when 2FA is enabled',
        error: {
            incorrectPassword: '[nl] Incorrect password. Please try again.',
            incorrectLoginOrPassword: '[nl] Incorrect login or password. Please try again.',
            incorrect2fa: '[nl] Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: '[nl] You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: '[nl] Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                '[nl] We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: '[nl] You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: '[nl] Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: '[nl] Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: '[nl] Phone or email',
        error: {
            invalidFormatEmailLogin: '[nl] The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "[nl] Couldn't retrieve account details. Please try to sign in again.",
        loginForm: '[nl] Login form',
        notYou: (user: string) => `[nl] Not ${user}?`,
    },
    onboarding: {
        welcome: '[nl] Welcome!',
        welcomeSignOffTitleManageTeam: '[nl] Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "[nl] It's great to meet you!",
        explanationModal: {
            title: '[nl] Welcome to Expensify',
            description: '[nl] One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: '[nl] To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: '[nl] Get started',
        whatsYourName: "[nl] What's your name?",
        peopleYouMayKnow: '[nl] People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: (domain: string, email: string) => `[nl] Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '[nl] Join a workspace',
        listOfWorkspaces: "[nl] Here's the list of workspaces you can join. Don't worry, you can always join them later if you prefer.",
        skipForNow: '[nl] Skip for now',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `[nl] ${employeeCount} member${employeeCount > 1 ? '[nl] s' : ''} • ${policyOwner}`,
        whereYouWork: '[nl] Where do you work?',
        errorSelection: '[nl] Select an option to move forward',
        purpose: {
            title: '[nl] What do you want to do today?',
            errorContinue: '[nl] Please press continue to get set up',
            errorBackButton: '[nl] Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '[nl] Get paid back by my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "[nl] Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '[nl] Track and budget expenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '[nl] Chat and split expenses with friends',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '[nl] Something else',
        },
        employees: {
            title: '[nl] How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '[nl] 1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '[nl] 11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '[nl] 51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '[nl] 101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '[nl] More than 1,000 employees',
        },
        accounting: {
            title: '[nl] Do you use any accounting software?',
            none: '[nl] None',
        },
        interestedFeatures: {
            title: '[nl] What features are you interested in?',
            featuresAlreadyEnabled: '[nl] Here are our most popular features:',
            featureYouMayBeInterestedIn: '[nl] Enable additional features:',
        },
        error: {
            requiredFirstName: '[nl] Please input your first name to continue',
        },
        workEmail: {
            title: '[nl] What’s your work email?',
            subtitle: '[nl] Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: '[nl] Forward to receipts@expensify.com for scanning',
                descriptionTwo: '[nl] Join your colleagues already using Expensify',
                descriptionThree: '[nl] Enjoy a more customized experience',
            },
            addWorkEmail: '[nl] Add work email',
        },
        workEmailValidation: {
            title: '[nl] Verify your work email',
            magicCodeSent: (workEmail: string | undefined) => `[nl] Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: '[nl] Please enter a valid work email from a private domain e.g. mitch@company.com',
            sameAsSignupEmail: '[nl] Please enter a different email than the one you signed up with',
            offline: '[nl] We couldn’t add your work email as you appear to be offline',
        },
        mergeBlockScreen: {
            title: '[nl] Couldn’t add work email',
            subtitle: (workEmail: string | undefined) => `[nl] We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[nl] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[nl] [Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[nl] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[nl] Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: '[nl] Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [nl] *Add expense approvals* to review your team's spend and keep it under control.

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
                title: ({workspaceConfirmationLink}) => `[nl] [Create](${workspaceConfirmationLink}) a workspace`,
                description: '[nl] Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[nl] Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [nl] *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[nl] Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        [nl] *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '[nl] Submit an expense',
                description: dedent(`
                    [nl] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: '[nl] Submit an expense',
                description: dedent(`
                    [nl] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: '[nl] Track an expense',
                description: dedent(`
                    [nl] *Track an expense* in any currency, whether you have a receipt or not.

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
                    `[nl] Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '[nl]  to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[nl] your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        [nl] Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[nl] your' : '[nl] to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        [Take me to accounting](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[nl] Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        [nl] Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[nl] Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [nl] *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[nl] Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        [nl] *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[nl] Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [nl] Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

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
                title: ({workspaceMembersLink}) => `[nl] Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [nl] *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: '[nl] Start a chat',
                description: dedent(`
                    [nl] *Start a chat* with anyone using their email or phone number.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },
            splitExpenseTask: {
                title: '[nl] Split an expense',
                description: dedent(`
                    [nl] *Split expenses* with one or more people.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[nl] Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [nl] Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: '[nl] Create your first report',
                description: dedent(`
                    [nl] Here's how to create a report:

                    1. Click the *+* button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[nl] Take a [test drive](${testDriveURL})` : '[nl] Take a test drive'),
            embeddedDemoIframeTitle: '[nl] Test Drive',
            employeeFakeReceipt: {
                description: '[nl] My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '[nl] Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: '[nl] Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        [nl] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        [nl] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage:
                "[nl] # Let’s get you set up\n👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!",
            onboardingChatSplitMessage: '[nl] Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "[nl] Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingTestDriveReceiverMessage: "[nl] *You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: '[nl] Stay organized with a workspace',
            subtitle: '[nl] Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: '[nl] Track and organize receipts',
                descriptionTwo: '[nl] Categorize and tag expenses',
                descriptionThree: '[nl] Create and share reports',
            },
            price: (price?: string) => `[nl] Try it free for 30 days, then upgrade for just <strong>${price ?? '$5'}/user/month</strong>.`,
            createWorkspace: '[nl] Create workspace',
        },
        confirmWorkspace: {
            title: '[nl] Confirm workspace',
            subtitle: '[nl] Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: '[nl] Invite members',
            subtitle: '[nl] Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "[nl] Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '[nl] Name cannot contain special characters',
            containsReservedWord: '[nl] Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: '[nl] Name cannot contain a comma or semicolon',
            requiredFirstName: '[nl] First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "[nl] What's your legal name?",
        enterDateOfBirth: "[nl] What's your date of birth?",
        enterAddress: "[nl] What's your address?",
        enterPhoneNumber: "[nl] What's your phone number?",
        personalDetails: '[nl] Personal details',
        privateDataMessage: '[nl] These details are used for travel and payments. They are never shown on your public profile.',
        legalName: '[nl] Legal name',
        legalFirstName: '[nl] Legal first name',
        legalLastName: '[nl] Legal last name',
        address: '[nl] Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `[nl] Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `[nl] Date should be after ${dateString}`,
            hasInvalidCharacter: '[nl] Name can only include Latin characters',
            cannotIncludeCommaOrSemicolon: '[nl] Name cannot contain a comma or semicolon',
            incorrectZipFormat: (zipFormat?: string) => `[nl] Incorrect zip code format${zipFormat ? `[nl]  Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `[nl] Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '[nl] Link has been re-sent',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `[nl] I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: '[nl] Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) => `[nl] To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `[nl] If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '[nl] Unlink',
        linkSent: '[nl] Link sent!',
        successfullyUnlinkedLogin: '[nl] Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) => `[nl] Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `[nl] <strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `[nl] <strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `[nl] Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: '[nl] Something went wrong...',
        subtitle: `[nl] We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: '[nl] Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `[nl] We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: '[nl] Your number has been validated! Click below to send a new magic sign-in code.',
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
                return '[nl] Please wait a moment before trying again.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '[nl] day' : '[nl] days'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '[nl] hour' : '[nl] hours'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '[nl] minute' : '[nl] minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `[nl] Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: '[nl] Join',
    },
    detailsPage: {
        localTime: '[nl] Local time',
    },
    newChatPage: {
        startGroup: '[nl] Start group',
        addToGroup: '[nl] Add to group',
        addUserToGroup: (username: string) => `[nl] Add ${username} to group`,
    },
    yearPickerPage: {
        year: '[nl] Year',
        selectYear: '[nl] Please select a year',
    },
    monthPickerPage: {
        month: '[nl] Month',
        selectMonth: '[nl] Please select a month',
    },
    focusModeUpdateModal: {
        title: '[nl] Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `[nl] Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '[nl] The chat you are looking for cannot be found.',
        getMeOutOfHere: '[nl] Get me out of here',
        iouReportNotFound: '[nl] The payment details you are looking for cannot be found.',
        notHere: "[nl] Hmm... it's not here",
        pageNotFound: '[nl] Oops, this page cannot be found',
        noAccess: '[nl] This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: '[nl] Go back to home page',
        commentYouLookingForCannotBeFound: '[nl] The comment you are looking for cannot be found.',
        goToChatInstead: '[nl] Go to the chat instead.',
        contactConcierge: '[nl] For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `[nl] Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: '[nl] Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "[nl] That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: '[nl] Status',
        statusExplanation: "[nl] Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: '[nl] Today',
        clearStatus: '[nl] Clear status',
        save: '[nl] Save',
        message: '[nl] Message',
        timePeriods: {
            never: '[nl] Never',
            thirtyMinutes: '[nl] 30 minutes',
            oneHour: '[nl] 1 hour',
            afterToday: '[nl] Today',
            afterWeek: '[nl] A week',
            custom: '[nl] Custom',
        },
        untilTomorrow: '[nl] Until tomorrow',
        untilTime: (time: string) => `[nl] Until ${time}`,
        date: '[nl] Date',
        time: '[nl] Time',
        clearAfter: '[nl] Clear after',
        whenClearStatus: '[nl] When should we clear your status?',
        setVacationDelegate: `[nl] Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        cannotSetVacationDelegate: `[nl] You can't set a vacation delegate because you're currently the delegate for the following members:`,
        vacationDelegateError: '[nl] There was an error updating your vacation delegate.',
        asVacationDelegate: (nameOrEmail: string) => `[nl] as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `[nl] to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `[nl] You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `[nl] Step ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '[nl] Bank info',
        confirmBankInfo: '[nl] Confirm bank info',
        manuallyAdd: '[nl] Manually add your bank account',
        letsDoubleCheck: "[nl] Let's double check that everything looks right.",
        accountEnding: '[nl] Account ending in',
        thisBankAccount: '[nl] This bank account will be used for business payments on your workspace',
        accountNumber: '[nl] Account number',
        routingNumber: '[nl] Routing number',
        chooseAnAccountBelow: '[nl] Choose an account below',
        addBankAccount: '[nl] Add bank account',
        chooseAnAccount: '[nl] Choose an account',
        connectOnlineWithPlaid: '[nl] Log into your bank',
        connectManually: '[nl] Connect manually',
        desktopConnection: '[nl] Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: '[nl] Your data is secure',
        toGetStarted: '[nl] Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: '[nl] Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: '[nl] Your routing number and account number can be found on a check for the account.',
        bankAccountPurposeTitle: '[nl] What do you want to do with your bank account?',
        getReimbursed: '[nl] Get reimbursed',
        getReimbursedDescription: '[nl] By employer or others',
        makePayments: '[nl] Make payments',
        makePaymentsDescription: '[nl] Pay expenses or issue Expensify Cards',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `[nl] To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: '[nl] An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: (workspaceRoute: string) =>
            `[nl] Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: '[nl] Business bank account added!',
        bbaAddedDescription: "[nl] It's ready to be used for payments.",
        lockedBankAccount: '[nl] Locked bank account',
        unlockBankAccount: '[nl] Unlock bank account',
        youCantPayThis: `[nl] You can't pay this report because you have a <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">locked bank account</a>. Tap below and Concierge will help with the next steps to unlock it.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `[nl] <h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `[nl] Expensify Business Bank Account ${maskedAccountNumber}
Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.`,
        error: {
            youNeedToSelectAnOption: '[nl] Please select an option to proceed',
            noBankAccountAvailable: "[nl] Sorry, there's no bank account available",
            noBankAccountSelected: '[nl] Please choose an account',
            taxID: '[nl] Please enter a valid tax ID number',
            website: '[nl] Please enter a valid website',
            zipCode: `[nl] Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '[nl] Please enter a valid phone number',
            email: '[nl] Please enter a valid email address',
            companyName: '[nl] Please enter a valid business name',
            addressCity: '[nl] Please enter a valid city',
            addressStreet: '[nl] Please enter a valid street address',
            addressState: '[nl] Please select a valid state',
            incorporationDateFuture: "[nl] Incorporation date can't be in the future",
            incorporationState: '[nl] Please select a valid state',
            industryCode: '[nl] Please enter a valid industry classification code with six digits',
            restrictedBusiness: "[nl] Please confirm the business isn't on the list of restricted businesses",
            routingNumber: '[nl] Please enter a valid routing number',
            accountNumber: '[nl] Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "[nl] Routing and account numbers can't match",
            companyType: '[nl] Please select a valid company type',
            tooManyAttempts: '[nl] Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: '[nl] Please enter a valid address',
            dob: '[nl] Please select a valid date of birth',
            age: '[nl] Must be over 18 years old',
            ssnLast4: '[nl] Please enter valid last 4 digits of SSN',
            firstName: '[nl] Please enter a valid first name',
            lastName: '[nl] Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: '[nl] Please add a default deposit account or debit card',
            validationAmounts: '[nl] The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: '[nl] Please enter a valid full name',
            ownershipPercentage: '[nl] Please enter a valid percentage number',
            deletePaymentBankAccount:
                "[nl] This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: '[nl] The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "[nl] Where's your bank account located?",
        accountDetailsStepHeader: '[nl] What are your account details?',
        accountTypeStepHeader: '[nl] What type of account is this?',
        bankInformationStepHeader: '[nl] What are your bank details?',
        accountHolderInformationStepHeader: '[nl] What are the account holder details?',
        howDoWeProtectYourData: '[nl] How do we protect your data?',
        currencyHeader: "[nl] What's your bank account's currency?",
        confirmationStepHeader: '[nl] Check your info.',
        confirmationStepSubHeader: '[nl] Double check the details below, and check the terms box to confirm.',
        toGetStarted: '[nl] Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
    },
    addPersonalBankAccountPage: {
        enterPassword: '[nl] Enter Expensify password',
        alreadyAdded: '[nl] This account has already been added.',
        chooseAccountLabel: '[nl] Account',
        successTitle: '[nl] Personal bank account added!',
        successMessage: '[nl] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: '[nl] Unknown filename',
        passwordRequired: '[nl] Please enter a password',
        passwordIncorrect: '[nl] Incorrect password. Please try again.',
        failedToLoadPDF: '[nl] Failed to load PDF file',
        pdfPasswordForm: {
            title: '[nl] Password protected PDF',
            infoText: '[nl] This PDF is password protected.',
            beforeLinkText: '[nl] Please',
            linkText: '[nl] enter the password',
            afterLinkText: '[nl] to view it.',
            formLabel: '[nl] View PDF',
        },
        attachmentNotFound: '[nl] Attachment not found',
        retry: '[nl] Retry',
    },
    messages: {
        errorMessageInvalidPhone: `[nl] Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '[nl] Invalid email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `[nl] ${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `[nl] ${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '[nl] By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: '[nl] Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `[nl] <muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: '[nl] Try again',
        verifyIdentity: '[nl] Verify identity',
        letsVerifyIdentity: "[nl] Let's verify your identity",
        butFirst: `[nl] But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '[nl] An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: '[nl] Enable camera access',
        cameraRequestMessage: '[nl] We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: '[nl] Enable microphone access',
        microphoneRequestMessage: '[nl] We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: '[nl] Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: '[nl] Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "[nl] There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "[nl] There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "[nl] Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "[nl] Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: '[nl] Additional details',
        helpText: '[nl] We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: '[nl] We need to ask you just a few more questions to finish validating your identity.',
        helpLink: '[nl] Learn more about why we need this.',
        legalFirstNameLabel: '[nl] Legal first name',
        legalMiddleNameLabel: '[nl] Legal middle name',
        legalLastNameLabel: '[nl] Legal last name',
        selectAnswer: '[nl] Please select a response to proceed',
        ssnFull9Error: '[nl] Please enter a valid nine-digit SSN',
        needSSNFull9: "[nl] We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "[nl] We couldn't verify",
        pleaseFixIt: '[nl] Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `[nl] We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: '[nl] Terms and fees',
        headerTitleRefactor: '[nl] Fees and terms',
        haveReadAndAgreePlain: '[nl] I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `[nl] I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: '[nl] I agree to the Privacy and Wallet agreement.',
        agreeToThe: (walletAgreementUrl: string) =>
            `[nl] I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: '[nl] Enable payments',
        monthlyFee: '[nl] Monthly fee',
        inactivity: '[nl] Inactivity',
        noOverdraftOrCredit: '[nl] No overdraft/credit feature.',
        electronicFundsWithdrawal: '[nl] Electronic funds withdrawal',
        standard: '[nl] Standard',
        reviewTheFees: '[nl] Take a look at some fees.',
        checkTheBoxes: '[nl] Please check the boxes below.',
        agreeToTerms: '[nl] Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `[nl] The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: '[nl] Per purchase',
            atmWithdrawal: '[nl] ATM withdrawal',
            cashReload: '[nl] Cash reload',
            inNetwork: '[nl] in-network',
            outOfNetwork: '[nl] out-of-network',
            atmBalanceInquiry: '[nl] ATM balance inquiry (in-network or out-of-network)',
            customerService: '[nl] Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: '[nl] Inactivity (after 12 months with no transactions)',
            weChargeOneFee: '[nl] We charge 1 other type of fee. It is:',
            fdicInsurance: '[nl] Your funds are eligible for FDIC insurance.',
            generalInfo: `[nl] For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `[nl] For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: '[nl] Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: (amount: string) => `[nl] (min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '[nl] A list of all Expensify Wallet fees',
            typeOfFeeHeader: '[nl] All fees',
            feeAmountHeader: '[nl] Amount',
            moreDetailsHeader: '[nl] Details',
            openingAccountTitle: '[nl] Opening an account',
            openingAccountDetails: "[nl] There's no fee to open an account.",
            monthlyFeeDetails: "[nl] There's no monthly fee.",
            customerServiceTitle: '[nl] Customer service',
            customerServiceDetails: '[nl] There are no customer service fees.',
            inactivityDetails: "[nl] There's no inactivity fee.",
            sendingFundsTitle: '[nl] Sending funds to another account holder',
            sendingFundsDetails: "[nl] There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "[nl] There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "[nl] There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                `[nl]  The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `[nl] Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                `[nl]  Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `[nl] Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `[nl] For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: '[nl] View printer-friendly version',
            automated: '[nl] Automated',
            liveAgent: '[nl] Live agent',
            instant: '[nl] Instant',
            electronicFundsInstantFeeMin: (amount: string) => `[nl] Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '[nl] Enable payments',
        activatedTitle: '[nl] Wallet activated!',
        activatedMessage: '[nl] Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: '[nl] Just a minute...',
        checkBackLaterMessage: "[nl] We're still reviewing your information. Please check back later.",
        continueToPayment: '[nl] Continue to payment',
        continueToTransfer: '[nl] Continue to transfer',
    },
    companyStep: {
        headerTitle: '[nl] Company information',
        subtitle: '[nl] Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: '[nl] Legal business name',
        companyWebsite: '[nl] Company website',
        taxIDNumber: '[nl] Tax ID number',
        taxIDNumberPlaceholder: '[nl] 9 digits',
        companyType: '[nl] Company type',
        incorporationDate: '[nl] Incorporation date',
        incorporationState: '[nl] Incorporation state',
        industryClassificationCode: '[nl] Industry classification code',
        confirmCompanyIsNot: '[nl] I confirm that this company is not on the',
        listOfRestrictedBusinesses: '[nl] list of restricted businesses',
        incorporationDatePlaceholder: '[nl] Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '[nl] LLC',
            CORPORATION: '[nl] Corp',
            PARTNERSHIP: '[nl] Partnership',
            COOPERATIVE: '[nl] Cooperative',
            SOLE_PROPRIETORSHIP: '[nl] Sole proprietorship',
            OTHER: '[nl] Other',
        },
        industryClassification: '[nl] Which industry is the business classified under?',
        industryClassificationCodePlaceholder: '[nl] Search for industry classification code',
    },
    requestorStep: {
        headerTitle: '[nl] Personal information',
        learnMore: '[nl] Learn more',
        isMyDataSafe: '[nl] Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: '[nl] Personal info',
        enterYourLegalFirstAndLast: "[nl] What's your legal name?",
        legalFirstName: '[nl] Legal first name',
        legalLastName: '[nl] Legal last name',
        legalName: '[nl] Legal name',
        enterYourDateOfBirth: "[nl] What's your date of birth?",
        enterTheLast4: '[nl] What are the last four digits of your Social Security Number?',
        dontWorry: "[nl] Don't worry, we don't do any personal credit checks!",
        last4SSN: '[nl] Last 4 of SSN',
        enterYourAddress: "[nl] What's your address?",
        address: '[nl] Address',
        letsDoubleCheck: "[nl] Let's double check that everything looks right.",
        byAddingThisBankAccount: "[nl] By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: '[nl] What’s your legal name?',
        whatsYourDOB: '[nl] What’s your date of birth?',
        whatsYourAddress: '[nl] What’s your address?',
        whatsYourSSN: '[nl] What are the last four digits of your Social Security Number?',
        noPersonalChecks: '[nl] Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: '[nl] What’s your phone number?',
        weNeedThisToVerify: '[nl] We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: '[nl] Company info',
        enterTheNameOfYourBusiness: "[nl] What's the name of your company?",
        businessName: '[nl] Legal company name',
        enterYourCompanyTaxIdNumber: "[nl] What's your company’s Tax ID number?",
        taxIDNumber: '[nl] Tax ID number',
        taxIDNumberPlaceholder: '[nl] 9 digits',
        enterYourCompanyWebsite: "[nl] What's your company’s website?",
        companyWebsite: '[nl] Company website',
        enterYourCompanyPhoneNumber: "[nl] What's your company’s phone number?",
        enterYourCompanyAddress: "[nl] What's your company’s address?",
        selectYourCompanyType: '[nl] What type of company is it?',
        companyType: '[nl] Company type',
        incorporationType: {
            LLC: '[nl] LLC',
            CORPORATION: '[nl] Corp',
            PARTNERSHIP: '[nl] Partnership',
            COOPERATIVE: '[nl] Cooperative',
            SOLE_PROPRIETORSHIP: '[nl] Sole proprietorship',
            OTHER: '[nl] Other',
        },
        selectYourCompanyIncorporationDate: "[nl] What's your company’s incorporation date?",
        incorporationDate: '[nl] Incorporation date',
        incorporationDatePlaceholder: '[nl] Start date (yyyy-mm-dd)',
        incorporationState: '[nl] Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '[nl] Which state was your company incorporated in?',
        letsDoubleCheck: "[nl] Let's double check that everything looks right.",
        companyAddress: '[nl] Company address',
        listOfRestrictedBusinesses: '[nl] list of restricted businesses',
        confirmCompanyIsNot: '[nl] I confirm that this company is not on the',
        businessInfoTitle: '[nl] Business info',
        legalBusinessName: '[nl] Legal business name',
        whatsTheBusinessName: "[nl] What's the business name?",
        whatsTheBusinessAddress: "[nl] What's the business address?",
        whatsTheBusinessContactInformation: "[nl] What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "[nl] What's the Company Registration Number (CRN)?";
                default:
                    return "[nl] What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[nl] What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return '[nl] What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return '[nl] What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return '[nl] What’s the Australian Business Number (ABN)?';
                default:
                    return '[nl] What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "[nl] What's this number?",
        whereWasTheBusinessIncorporated: '[nl] Where was the business incorporated?',
        whatTypeOfBusinessIsIt: '[nl] What type of business is it?',
        whatsTheBusinessAnnualPayment: "[nl] What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "[nl] What's your expected average reimbursement amount?",
        registrationNumber: '[nl] Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[nl] EIN';
                case CONST.COUNTRY.CA:
                    return '[nl] BN';
                case CONST.COUNTRY.GB:
                    return '[nl] VRN';
                case CONST.COUNTRY.AU:
                    return '[nl] ABN';
                default:
                    return '[nl] EU VAT';
            }
        },
        businessAddress: '[nl] Business address',
        businessType: '[nl] Business type',
        incorporation: '[nl] Incorporation',
        incorporationCountry: '[nl] Incorporation country',
        incorporationTypeName: '[nl] Incorporation type',
        businessCategory: '[nl] Business category',
        annualPaymentVolume: '[nl] Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `[nl] Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '[nl] Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `[nl] Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '[nl] Select incorporation type',
        selectBusinessCategory: '[nl] Select business category',
        selectAnnualPaymentVolume: '[nl] Select annual payment volume',
        selectIncorporationCountry: '[nl] Select incorporation country',
        selectIncorporationState: '[nl] Select incorporation state',
        selectAverageReimbursement: '[nl] Select average reimbursement amount',
        selectBusinessType: '[nl] Select business type',
        findIncorporationType: '[nl] Find incorporation type',
        findBusinessCategory: '[nl] Find business category',
        findAnnualPaymentVolume: '[nl] Find annual payment volume',
        findIncorporationState: '[nl] Find incorporation state',
        findAverageReimbursement: '[nl] Find average reimbursement amount',
        findBusinessType: '[nl] Find business type',
        error: {
            registrationNumber: '[nl] Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '[nl] Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return '[nl] Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return '[nl] Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return '[nl] Please provide a valid Australian Business Number (ABN)';
                    default:
                        return '[nl] Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `[nl] Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `[nl] Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `[nl] Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: '[nl] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: '[nl] Business owner',
        enterLegalFirstAndLastName: "[nl] What's the owner's legal name?",
        legalFirstName: '[nl] Legal first name',
        legalLastName: '[nl] Legal last name',
        enterTheDateOfBirthOfTheOwner: "[nl] What's the owner's date of birth?",
        enterTheLast4: '[nl] What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: '[nl] Last 4 of SSN',
        dontWorry: "[nl] Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "[nl] What's the owner's address?",
        letsDoubleCheck: '[nl] Let’s double check that everything looks right.',
        legalName: '[nl] Legal name',
        address: '[nl] Address',
        byAddingThisBankAccount: "[nl] By adding this bank account, you confirm that you've read, understand, and accept",
        owners: '[nl] Owners',
    },
    ownershipInfoStep: {
        ownerInfo: '[nl] Owner info',
        businessOwner: '[nl] Business owner',
        signerInfo: '[nl] Signer info',
        doYouOwn: (companyName: string) => `[nl] Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `[nl] Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: '[nl] Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: '[nl] Legal first name',
        legalLastName: '[nl] Legal last name',
        whatsTheOwnersName: "[nl] What's the owner's legal name?",
        whatsYourName: "[nl] What's your legal name?",
        whatPercentage: '[nl] What percentage of the business belongs to the owner?',
        whatsYoursPercentage: '[nl] What percentage of the business do you own?',
        ownership: '[nl] Ownership',
        whatsTheOwnersDOB: "[nl] What's the owner's date of birth?",
        whatsYourDOB: "[nl] What's your date of birth?",
        whatsTheOwnersAddress: "[nl] What's the owner's address?",
        whatsYourAddress: "[nl] What's your address?",
        whatAreTheLast: "[nl] What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: '[nl] What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: '[nl] What is your country of citizenship?',
        whatsTheOwnersNationality: "[nl] What's the owner's country of citizenship?",
        countryOfCitizenship: '[nl] Country of citizenship',
        dontWorry: "[nl] Don't worry, we don't do any personal credit checks!",
        last4: '[nl] Last 4 of SSN',
        whyDoWeAsk: '[nl] Why do we ask for this?',
        letsDoubleCheck: '[nl] Let’s double check that everything looks right.',
        legalName: '[nl] Legal name',
        ownershipPercentage: '[nl] Ownership percentage',
        areThereOther: (companyName: string) => `[nl] Are there other individuals who own 25% or more of ${companyName}?`,
        owners: '[nl] Owners',
        addCertified: '[nl] Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart: '[nl] Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: '[nl] Upload entity ownership chart',
        noteEntity: '[nl] Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: '[nl] Certified entity ownership chart',
        selectCountry: '[nl] Select country',
        findCountry: '[nl] Find country',
        address: '[nl] Address',
        chooseFile: '[nl] Choose file',
        uploadDocuments: '[nl] Upload additional documentation',
        pleaseUpload: '[nl] Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: '[nl] Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: '[nl] Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "[nl] Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: '[nl] Copy of ID for beneficial owner',
        copyOfIDDescription: "[nl] Examples: Passport, driver's license, etc.",
        proofOfAddress: '[nl] Address proof for beneficial owner',
        proofOfAddressDescription: '[nl] Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: '[nl] Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            '[nl] Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: '[nl] Complete verification',
        confirmAgreements: '[nl] Please confirm the agreements below.',
        certifyTrueAndAccurate: '[nl] I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: '[nl] Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: '[nl] I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: '[nl] You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: '[nl] terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '[nl] Validate your bank account',
        validateButtonText: '[nl] Validate',
        validationInputLabel: '[nl] Transaction',
        maxAttemptsReached: '[nl] Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `[nl] Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '[nl] Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: '[nl] Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: '[nl] Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: '[nl] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: '[nl] Secure your account',
    },
    countryStep: {
        confirmBusinessBank: '[nl] Confirm business bank account currency and country',
        confirmCurrency: '[nl] Confirm currency and country',
        yourBusiness: '[nl] Your business bank account currency must match your workspace currency.',
        youCanChange: '[nl] You can change your workspace currency in your',
        findCountry: '[nl] Find country',
        selectCountry: '[nl] Select country',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `[nl] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> so you can invite a director to sign in a later step.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '[nl] What are your business bank account details?',
        letsDoubleCheck: '[nl] Let’s double check that everything looks fine.',
        thisBankAccount: '[nl] This bank account will be used for business payments on your workspace',
        accountNumber: '[nl] Account number',
        accountHolderNameDescription: "[nl] Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: '[nl] Signer info',
        areYouDirector: (companyName: string) => `[nl] Are you a director at ${companyName}?`,
        regulationRequiresUs: '[nl] Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "[nl] What's your legal name",
        fullName: '[nl] Legal full name',
        whatsYourJobTitle: "[nl] What's your job title?",
        jobTitle: '[nl] Job title',
        whatsYourDOB: "[nl] What's your date of birth?",
        uploadID: '[nl] Upload ID and proof of address',
        personalAddress: '[nl] Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: '[nl] Let’s double check that everything looks right.',
        legalName: '[nl] Legal name',
        proofOf: '[nl] Proof of personal address',
        enterOneEmail: (companyName: string) => `[nl] Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: '[nl] Regulation requires at least one more director as a signer.',
        hangTight: '[nl] Hang tight...',
        enterTwoEmails: (companyName: string) => `[nl] Enter the emails of two directors at ${companyName}`,
        sendReminder: '[nl] Send a reminder',
        chooseFile: '[nl] Choose file',
        weAreWaiting: "[nl] We're waiting for others to verify their identities as directors of the business.",
        id: '[nl] Copy of ID',
        proofOfDirectors: '[nl] Proof of director(s)',
        proofOfDirectorsDescription: '[nl] Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: '[nl] Codice Fiscale',
        codiceFiscaleDescription: '[nl] Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: '[nl] PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            [nl] Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: '[nl] Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: '[nl] Enter signer info',
        thisStep: '[nl] This step has been completed',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `[nl] is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: '[nl] Emails must be different',
            connectToWorkspace: (workspaceRoute: string) => `[nl] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> to invite a director to sign.`,
        },
    },
    agreementsStep: {
        agreements: '[nl] Agreements',
        pleaseConfirm: '[nl] Please confirm the agreements below',
        regulationRequiresUs: '[nl] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: '[nl] I am authorized to use the business bank account for business spend.',
        iCertify: '[nl] I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `[nl] I accept the <a href="https://www.corpay.com/cross-border/terms">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: '[nl] I accept the terms and conditions.',
        accept: '[nl] Accept and add bank account',
        iConsentToThePrivacyNotice: '[nl] I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: '[nl] I consent to the privacy notice.',
        error: {
            authorized: '[nl] You must be a controlling officer with authorization to operate the business bank account',
            certify: '[nl] Please certify that the information is true and accurate',
            consent: '[nl] Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: '[nl] Docusign Form',
        pleaseComplete:
            '[nl] Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: '[nl] Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            '[nl] Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: '[nl] Take me to Docusign',
        uploadAdditional: '[nl] Upload additional documentation',
        pleaseUpload: '[nl] Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: '[nl] Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "[nl] Let's finish in chat!",
        thanksFor:
            "[nl] Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: '[nl] I have a question',
        enable2FA: '[nl] Enable two-factor authentication (2FA) to prevent fraud',
        weTake: '[nl] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: '[nl] Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '[nl] One moment',
        explanationLine: "[nl] We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "[nl] Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: '[nl] Book travel',
        title: '[nl] Travel smart',
        subtitle: '[nl] Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: '[nl] Save money on your bookings',
            alerts: '[nl] Get realtime alerts if your travel plans change',
        },
        bookTravel: '[nl] Book travel',
        bookDemo: '[nl] Book demo',
        bookADemo: '[nl] Book a demo',
        toLearnMore: '[nl]  to learn more.',
        termsAndConditions: {
            header: '[nl] Before we continue...',
            title: '[nl] Terms & conditions',
            label: '[nl] I agree to the terms & conditions',
            subtitle: `[nl] Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: '[nl] You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                '[nl] You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: '[nl] Flight',
        flightDetails: {
            passenger: '[nl] Passenger',
            layover: (layover: string) => `[nl] <muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: '[nl] Take-off',
            landing: '[nl] Landing',
            seat: '[nl] Seat',
            class: '[nl] Cabin Class',
            recordLocator: '[nl] Record locator',
            cabinClasses: {
                unknown: '[nl] Unknown',
                economy: '[nl] Economy',
                premiumEconomy: '[nl] Premium Economy',
                business: '[nl] Business',
                first: '[nl] First',
            },
        },
        hotel: '[nl] Hotel',
        hotelDetails: {
            guest: '[nl] Guest',
            checkIn: '[nl] Check-in',
            checkOut: '[nl] Check-out',
            roomType: '[nl] Room type',
            cancellation: '[nl] Cancellation policy',
            cancellationUntil: '[nl] Free cancellation until',
            confirmation: '[nl] Confirmation number',
            cancellationPolicies: {
                unknown: '[nl] Unknown',
                nonRefundable: '[nl] Non-refundable',
                freeCancellationUntil: '[nl] Free cancellation until',
                partiallyRefundable: '[nl] Partially refundable',
            },
        },
        car: '[nl] Car',
        carDetails: {
            rentalCar: '[nl] Car rental',
            pickUp: '[nl] Pick-up',
            dropOff: '[nl] Drop-off',
            driver: '[nl] Driver',
            carType: '[nl] Car type',
            cancellation: '[nl] Cancellation policy',
            cancellationUntil: '[nl] Free cancellation until',
            freeCancellation: '[nl] Free cancellation',
            confirmation: '[nl] Confirmation number',
        },
        train: '[nl] Rail',
        trainDetails: {
            passenger: '[nl] Passenger',
            departs: '[nl] Departs',
            arrives: '[nl] Arrives',
            coachNumber: '[nl] Coach number',
            seat: '[nl] Seat',
            fareDetails: '[nl] Fare details',
            confirmation: '[nl] Confirmation number',
        },
        viewTrip: '[nl] View trip',
        modifyTrip: '[nl] Modify trip',
        tripSupport: '[nl] Trip support',
        tripDetails: '[nl] Trip details',
        viewTripDetails: '[nl] View trip details',
        trip: '[nl] Trip',
        trips: '[nl] Trips',
        tripSummary: '[nl] Trip summary',
        departs: '[nl] Departs',
        errorMessage: '[nl] Something went wrong. Please try again later.',
        phoneError: (phoneErrorMethodsRoute: string) => `[nl] <rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: '[nl] Domain',
            subtitle: '[nl] Choose a domain for Expensify Travel setup.',
            recommended: '[nl] Recommended',
        },
        domainPermissionInfo: {
            title: '[nl] Domain',
            restriction: (domain: string) =>
                `[nl] You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `[nl] If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '[nl] Get started with Expensify Travel',
            message: `[nl] You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: '[nl] Expensify Travel has been disabled',
            message: `[nl] Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "[nl] We're reviewing your request...",
            message: `[nl] We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: '[nl] Got it',
            conciergeMessage: ({domain}: {domain: string}) => `[nl] Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `[nl] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[nl] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[nl] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[nl] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `[nl] The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `[nl] Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[nl] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `[nl] Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `[nl] Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `[nl] Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `[nl] Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: '[nl] Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: (type: string, id = '') => `[nl] You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `[nl] The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: (type: string, id = '') => `[nl] Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: (type: string) => `[nl] Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `[nl] Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `[nl] Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `[nl] Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: (type: string) => `[nl] Your ${type} reservation was updated.`,
        },
        flightTo: '[nl] Flight to',
        trainTo: '[nl] Train to',
        carRental: '[nl]  car rental',
        nightIn: '[nl] night in',
        nightsIn: '[nl] nights in',
    },
    proactiveAppReview: {
        title: '[nl] Enjoying New Expensify?',
        description: '[nl] Let us know so we can help make your expensing experience even better.',
        positiveButton: '[nl] Yeah!',
        negativeButton: '[nl] Not really',
    },
    workspace: {
        common: {
            card: '[nl] Cards',
            expensifyCard: '[nl] Expensify Card',
            companyCards: '[nl] Company cards',
            personalCards: '[nl] Personal cards',
            workflows: '[nl] Workflows',
            workspace: '[nl] Workspace',
            findWorkspace: '[nl] Find workspace',
            edit: '[nl] Edit workspace',
            enabled: '[nl] Enabled',
            disabled: '[nl] Disabled',
            everyone: '[nl] Everyone',
            delete: '[nl] Delete workspace',
            settings: '[nl] Settings',
            reimburse: '[nl] Reimbursements',
            categories: '[nl] Categories',
            tags: '[nl] Tags',
            customField1: '[nl] Custom field 1',
            customField2: '[nl] Custom field 2',
            customFieldHint: '[nl] Add custom coding that applies to all spend from this member.',
            reports: '[nl] Reports',
            reportFields: '[nl] Report fields',
            reportTitle: '[nl] Report title',
            reportField: '[nl] Report field',
            taxes: '[nl] Taxes',
            bills: '[nl] Bills',
            invoices: '[nl] Invoices',
            perDiem: '[nl] Per diem',
            travel: '[nl] Travel',
            members: '[nl] Members',
            accounting: '[nl] Accounting',
            receiptPartners: '[nl] Receipt partners',
            rules: '[nl] Rules',
            displayedAs: '[nl] Displayed as',
            plan: '[nl] Plan',
            profile: '[nl] Overview',
            bankAccount: '[nl] Bank account',
            testTransactions: '[nl] Test transactions',
            issueAndManageCards: '[nl] Issue and manage cards',
            reconcileCards: '[nl] Reconcile cards',
            selectAll: '[nl] Select all',
            selected: () => ({
                one: '[nl] 1 selected',
                other: (count: number) => `[nl] ${count} selected`,
            }),
            settlementFrequency: '[nl] Settlement frequency',
            setAsDefault: '[nl] Set as default workspace',
            defaultNote: `[nl] Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '[nl] Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: '[nl] Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            deleteOpenExpensifyCardsError: '[nl] Your company still has open Expensify Cards.',
            outstandingBalanceWarning:
                '[nl] You have an outstanding balance that must be settled before deleting your last workspace. Please go to your subscription settings to resolve the payment.',
            settleBalance: '[nl] Go to subscription',
            unavailable: '[nl] Unavailable workspace',
            memberNotFound: '[nl] Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `[nl] You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: '[nl] Go to workspace',
            duplicateWorkspace: '[nl] Duplicate workspace',
            duplicateWorkspacePrefix: '[nl] Duplicate',
            goToWorkspaces: '[nl] Go to workspaces',
            clearFilter: '[nl] Clear filter',
            workspaceName: '[nl] Workspace name',
            workspaceOwner: '[nl] Owner',
            keepMeAsAdmin: '[nl] Keep me as an admin',
            workspaceType: '[nl] Workspace type',
            workspaceAvatar: '[nl] Workspace avatar',
            clientID: '[nl] Client ID',
            clientIDInputHint: "[nl] Enter the client's unique identifier",
            mustBeOnlineToViewMembers: '[nl] You need to be online in order to view members of this workspace.',
            moreFeatures: '[nl] More features',
            requested: '[nl] Requested',
            distanceRates: '[nl] Distance rates',
            defaultDescription: '[nl] One place for all your receipts and expenses.',
            descriptionHint: '[nl] Share information about this workspace with all members.',
            welcomeNote: '[nl] Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: '[nl] Subscription',
            markAsEntered: '[nl] Mark as manually entered',
            markAsExported: '[nl] Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `[nl] Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "[nl] Let's double check that everything looks right.",
            lineItemLevel: '[nl] Line-item level',
            reportLevel: '[nl] Report level',
            topLevel: '[nl] Top level',
            appliedOnExport: '[nl] Not imported into Expensify, applied on export',
            shareNote: {
                header: '[nl] Share your workspace with other members',
                content: (adminsRoomLink: string) =>
                    `[nl] Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `[nl] Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '[nl] Create new connection',
            reuseExistingConnection: '[nl] Reuse existing connection',
            existingConnections: '[nl] Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `[nl] Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `[nl] ${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `[nl] Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: '[nl] Learn more',
            memberAlternateText: '[nl] Submit and approve reports.',
            adminAlternateText: '[nl] Manage reports and workspace settings.',
            auditorAlternateText: '[nl] View and comment on reports.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: '[nl] Direct',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: '[nl] None',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '[nl] Indirect',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '[nl] Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '[nl] Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return '[nl] Member';
                    default:
                        return '[nl] Member';
                }
            },
            frequency: {
                manual: '[nl] Manually',
                instant: '[nl] Instant',
                immediate: '[nl] Daily',
                trip: '[nl] By trip',
                weekly: '[nl] Weekly',
                semimonthly: '[nl] Twice a month',
                monthly: '[nl] Monthly',
            },
            budgetFrequency: {
                monthly: '[nl] monthly',
                yearly: '[nl] yearly',
            },
            budgetFrequencyUnit: {
                monthly: '[nl] month',
                yearly: '[nl] year',
            },
            budgetTypeForNotificationMessage: {
                tag: '[nl] tag',
                category: '[nl] category',
            },
            planType: '[nl] Plan type',
            youCantDowngradeInvoicing:
                "[nl] You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: '[nl] Default category',
            viewTransactions: '[nl] View transactions',
            policyExpenseChatName: (displayName: string) => `[nl] ${displayName}'s expenses`,
            deepDiveExpensifyCard: `[nl] <muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `[nl] Connected to ${organizationName}` : '[nl] Automate travel and meal delivery expenses across your organization.',
                sendInvites: '[nl] Send invites',
                sendInvitesDescription: "[nl] These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: '[nl] Confirm invite',
                manageInvites: '[nl] Manage invites',
                confirm: '[nl] Confirm',
                allSet: '[nl] All set',
                readyToRoll: "[nl] You're ready to roll",
                takeBusinessRideMessage: '[nl] Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: '[nl] All',
                linked: '[nl] Linked',
                outstanding: '[nl] Outstanding',
                status: {
                    resend: '[nl] Resend',
                    invite: '[nl] Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '[nl] Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '[nl] Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '[nl] Suspended',
                },
                centralBillingAccount: '[nl] Central billing account',
                centralBillingDescription: '[nl] Choose where to import all Uber receipts.',
                invitationFailure: '[nl] Failed to invite member to Uber for Business',
                autoInvite: '[nl] Invite new workspace members to Uber for Business',
                autoRemove: '[nl] Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: '[nl] No outstanding invites',
                    subtitle: '[nl] Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `[nl] <muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: '[nl] Amount',
            deleteRates: () => ({
                one: '[nl] Delete rate',
                other: '[nl] Delete rates',
            }),
            deletePerDiemRate: '[nl] Delete per diem rate',
            findPerDiemRate: '[nl] Find per diem rate',
            areYouSureDelete: () => ({
                one: '[nl] Are you sure you want to delete this rate?',
                other: '[nl] Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: '[nl] Per diem',
                subtitle: '[nl] Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: '[nl] Import per diem rates',
            editPerDiemRate: '[nl] Edit per diem rate',
            editPerDiemRates: '[nl] Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `[nl] Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `[nl] Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '[nl] Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: '[nl] Mark checks as “print later”',
            exportDescription: '[nl] Configure how Expensify data exports to QuickBooks Desktop.',
            date: '[nl] Export date',
            exportInvoices: '[nl] Export invoices to',
            exportExpensifyCard: '[nl] Export Expensify Card transactions as',
            account: '[nl] Account',
            accountDescription: '[nl] Choose where to post journal entries.',
            accountsPayable: '[nl] Accounts payable',
            accountsPayableDescription: '[nl] Choose where to create vendor bills.',
            bankAccount: '[nl] Bank account',
            notConfigured: '[nl] Not configured',
            bankAccountDescription: '[nl] Choose where to send checks from.',
            creditCardAccount: '[nl] Credit card account',
            exportDate: {
                label: '[nl] Export date',
                description: '[nl] Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[nl] Date of last expense',
                        description: '[nl] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[nl] Export date',
                        description: '[nl] Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[nl] Submitted date',
                        description: '[nl] Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "[nl] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[nl] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[nl] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "[nl] QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[nl] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[nl] Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[nl] Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[nl] Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[nl] Check',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "[nl] We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[nl] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[nl] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[nl] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[nl] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '[nl] Choose where to send checks from.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[nl] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[nl] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[nl] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: '[nl] No accounts found',
            noAccountsFoundDescription: '[nl] Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: '[nl] QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "[nl] Can't connect from this device",
                body1: "[nl] You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "[nl] Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: '[nl] Open this link to connect',
                body: '[nl] To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: '[nl] Something went wrong',
                setupErrorBody: (conciergeLink: string) =>
                    `[nl] <muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: '[nl] Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: '[nl] Classes',
            items: '[nl] Items',
            customers: '[nl] Customers/projects',
            exportCompanyCardsDescription: '[nl] Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: '[nl] Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: '[nl] Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[nl] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[nl] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[nl] Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: '[nl] Line item level',
            reportFieldsDisplayedAsDescription: '[nl] Report level',
            customersDescription: '[nl] Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: '[nl] Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: '[nl] Auto-create entities',
                createEntitiesDescription: "[nl] Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: '[nl] Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: '[nl] When to Export',
                description: '[nl] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: '[nl] Connected to',
            importDescription: '[nl] Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: '[nl] Classes',
            locations: '[nl] Locations',
            customers: '[nl] Customers/projects',
            accountsDescription: '[nl] Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[nl] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[nl] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[nl] Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: '[nl] Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: '[nl] Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: '[nl] Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "[nl] QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "[nl] QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: '[nl] Configure how Expensify data exports to QuickBooks Online.',
            date: '[nl] Export date',
            exportInvoices: '[nl] Export invoices to',
            exportExpensifyCard: '[nl] Export Expensify Card transactions as',
            exportDate: {
                label: '[nl] Export date',
                description: '[nl] Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[nl] Date of last expense',
                        description: '[nl] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[nl] Export date',
                        description: '[nl] Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[nl] Submitted date',
                        description: '[nl] Date the report was submitted for approval.',
                    },
                },
            },
            receivable: '[nl] Accounts receivable',
            archive: '[nl] Accounts receivable archive',
            exportInvoicesDescription: '[nl] Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: '[nl] Set how company card purchases export to QuickBooks Online.',
            vendor: '[nl] Vendor',
            defaultVendorDescription: '[nl] Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: '[nl] Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "[nl] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[nl] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[nl] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: '[nl] Account',
            accountDescription: '[nl] Choose where to post journal entries.',
            accountsPayable: '[nl] Accounts payable',
            accountsPayableDescription: '[nl] Choose where to create vendor bills.',
            bankAccount: '[nl] Bank account',
            notConfigured: '[nl] Not configured',
            bankAccountDescription: '[nl] Choose where to send checks from.',
            creditCardAccount: '[nl] Credit card account',
            companyCardsLocationEnabledDescription:
                "[nl] QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "[nl] QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[nl] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: '[nl] Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: '[nl] Invite employees',
                inviteEmployeesDescription: '[nl] Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: '[nl] Auto-create entities',
                createEntitiesDescription:
                    "[nl] Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription: '[nl] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: '[nl] QuickBooks bill payment account',
                qboInvoiceCollectionAccount: '[nl] QuickBooks invoice collections account',
                accountSelectDescription: "[nl] Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "[nl] Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '[nl] Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[nl] Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[nl] Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[nl] Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[nl] Check',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "[nl] We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[nl] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[nl] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '[nl] Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[nl] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[nl] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '[nl] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[nl] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '[nl] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[nl] Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[nl] Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[nl] Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[nl] To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[nl] To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[nl] To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: '[nl] No accounts found',
            noAccountsFoundDescription: '[nl] Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: '[nl] When to Export',
                description: '[nl] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Out-of-pocket expenses will export when paid',
                },
            },
            travelInvoicing: '[nl] Travel Invoicing',
            travelInvoicingVendor: '[nl] Travel vendor',
            travelInvoicingPayableAccount: '[nl] Travel payable account',
        },
        workspaceList: {
            joinNow: '[nl] Join now',
            askToJoin: '[nl] Ask to join',
        },
        xero: {
            organization: '[nl] Xero organization',
            organizationDescription: "[nl] Choose the Xero organization that you'd like to import data from.",
            importDescription: '[nl] Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: '[nl] Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[nl] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[nl] Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: '[nl] Tracking categories',
            trackingCategoriesDescription: '[nl] Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `[nl] Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `[nl] Choose where to map ${categoryName} when exporting to Xero.`,
            customers: '[nl] Re-bill customers',
            customersDescription: '[nl] Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: '[nl] Choose how to handle Xero taxes in Expensify.',
            notImported: '[nl] Not imported',
            notConfigured: '[nl] Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: '[nl] Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '[nl] Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '[nl] Report fields',
            },
            exportDescription: '[nl] Configure how Expensify data exports to Xero.',
            purchaseBill: '[nl] Purchase bill',
            exportDeepDiveCompanyCard:
                '[nl] Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: '[nl] Bank transactions',
            xeroBankAccount: '[nl] Xero bank account',
            xeroBankAccountDescription: '[nl] Choose where expenses will post as bank transactions.',
            exportExpensesDescription: '[nl] Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: '[nl] Purchase bill date',
            exportInvoices: '[nl] Export invoices as',
            salesInvoice: '[nl] Sales invoice',
            exportInvoicesDescription: '[nl] Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: '[nl] Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: '[nl] Purchase bill status',
                reimbursedReportsDescription: '[nl] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: '[nl] Xero bill payment account',
                xeroInvoiceCollectionAccount: '[nl] Xero invoice collections account',
                xeroBillPaymentAccountDescription: "[nl] Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "[nl] Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: '[nl] Purchase bill date',
                description: '[nl] Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[nl] Date of last expense',
                        description: '[nl] Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[nl] Export date',
                        description: '[nl] Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[nl] Submitted date',
                        description: '[nl] Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: '[nl] Purchase bill status',
                description: '[nl] Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '[nl] Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '[nl] Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '[nl] Awaiting payment',
                },
            },
            noAccountsFound: '[nl] No accounts found',
            noAccountsFoundDescription: '[nl] Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: '[nl] When to Export',
                description: '[nl] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '[nl] Preferred exporter',
            taxSolution: '[nl] Tax solution',
            notConfigured: '[nl] Not configured',
            exportDate: {
                label: '[nl] Export date',
                description: '[nl] Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[nl] Date of last expense',
                        description: '[nl] Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '[nl] Export date',
                        description: '[nl] Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '[nl] Submitted date',
                        description: '[nl] Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: '[nl] Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '[nl] Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[nl] Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: '[nl] Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '[nl] Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[nl] Vendor bills',
                },
            },
            creditCardAccount: '[nl] Credit card account',
            defaultVendor: '[nl] Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `[nl] Set a default vendor that will apply to ${isReimbursable ? '' : '[nl] non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: '[nl] Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                '[nl] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[nl] Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: '[nl] No accounts found',
            noAccountsFoundDescription: `[nl] Please add the account in Sage Intacct and sync the connection again`,
            autoSync: '[nl] Auto-sync',
            autoSyncDescription: '[nl] Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: '[nl] Invite employees',
            inviteEmployeesDescription:
                '[nl] Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: '[nl] Sync reimbursed reports',
            syncReimbursedReportsDescription: '[nl] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: '[nl] Sage Intacct payment account',
            accountingMethods: {
                label: '[nl] When to Export',
                description: '[nl] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Out-of-pocket expenses will export when paid',
                },
            },
        },
        netsuite: {
            subsidiary: '[nl] Subsidiary',
            subsidiarySelectDescription: "[nl] Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: '[nl] Configure how Expensify data exports to NetSuite.',
            exportInvoices: '[nl] Export invoices to',
            journalEntriesTaxPostingAccount: '[nl] Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: '[nl] Journal entries provincial tax posting account',
            foreignCurrencyAmount: '[nl] Export foreign currency amount',
            exportToNextOpenPeriod: '[nl] Export to next open period',
            nonReimbursableJournalPostingAccount: '[nl] Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: '[nl] Reimbursable journal posting account',
            journalPostingPreference: {
                label: '[nl] Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '[nl] Single, itemized entry for each report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '[nl] Single entry for each expense',
                },
            },
            invoiceItem: {
                label: '[nl] Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '[nl] Create one for me',
                        description: '[nl] We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '[nl] Select existing',
                        description: "[nl] We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: '[nl] Export date',
                description: '[nl] Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[nl] Date of last expense',
                        description: '[nl] Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '[nl] Export date',
                        description: '[nl] Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '[nl] Submitted date',
                        description: '[nl] Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '[nl] Expense reports',
                        reimbursableDescription: '[nl] Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: '[nl] Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '[nl] Vendor bills',
                        reimbursableDescription: dedent(`
                            [nl] Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [nl] Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '[nl] Journal entries',
                        reimbursableDescription: dedent(`
                            [nl] Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [nl] Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "[nl] If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: '[nl] Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: '[nl] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: '[nl] Reimbursements account',
                reimbursementsAccountDescription: "[nl] Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: '[nl] Collections account',
                collectionsAccountDescription: '[nl] Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: '[nl] A/P approval account',
                approvalAccountDescription:
                    '[nl] Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: '[nl] NetSuite default',
                inviteEmployees: '[nl] Invite employees and set approvals',
                inviteEmployeesDescription:
                    '[nl] Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: '[nl] Auto-create employees/vendors',
                enableCategories: '[nl] Enable newly imported categories',
                customFormID: '[nl] Custom form ID',
                customFormIDDescription:
                    '[nl] By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: '[nl] Out-of-pocket expense',
                customFormIDNonReimbursable: '[nl] Company card expense',
                exportReportsTo: {
                    label: '[nl] Expense report approval level',
                    description: '[nl] Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: '[nl] NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '[nl] Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '[nl] Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '[nl] Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: '[nl] When to Export',
                    description: '[nl] Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[nl] Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[nl] Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: '[nl] Vendor bill approval level',
                    description: '[nl] Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: '[nl] NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '[nl] Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '[nl] Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: '[nl] Journal entry approval level',
                    description: '[nl] Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: '[nl] NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '[nl] Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '[nl] Approved for posting',
                    },
                },
                error: {
                    customFormID: '[nl] Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: '[nl] No accounts found',
            noAccountsFoundDescription: '[nl] Please add the account in NetSuite and sync the connection again',
            noVendorsFound: '[nl] No vendors found',
            noVendorsFoundDescription: '[nl] Please add vendors in NetSuite and sync the connection again',
            noItemsFound: '[nl] No invoice items found',
            noItemsFoundDescription: '[nl] Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: '[nl] No subsidiaries found',
            noSubsidiariesFoundDescription: '[nl] Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: '[nl] NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: '[nl] Install the Expensify bundle',
                        description: '[nl] In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: '[nl] Enable token-based authentication',
                        description: '[nl] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: '[nl] Enable SOAP web services',
                        description: '[nl] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: '[nl] Create an access token',
                        description:
                            '[nl] In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: '[nl] Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: '[nl] NetSuite Account ID',
                            netSuiteTokenID: '[nl] Token ID',
                            netSuiteTokenSecret: '[nl] Token Secret',
                        },
                        netSuiteAccountIDDescription: '[nl] In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: '[nl] Expense categories',
                expenseCategoriesDescription: '[nl] Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: '[nl] Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: '[nl] Departments',
                        subtitle: '[nl] Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: '[nl] Classes',
                        subtitle: '[nl] Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: '[nl] Locations',
                        subtitle: '[nl] Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: '[nl] Customers/projects',
                    subtitle: '[nl] Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: '[nl] Import customers',
                    importJobs: '[nl] Import projects',
                    customers: '[nl] customers',
                    jobs: '[nl] projects',
                    label: (importFields: string[], importType: string) => `${importFields.join('[nl]  and ')}, ${importType}`,
                },
                importTaxDescription: '[nl] Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: '[nl] Choose an option below:',
                    label: (importedTypes: string[]) => `[nl] Imported as ${importedTypes.join('[nl]  and ')}`,
                    requiredFieldError: (fieldName: string) => `[nl] Please enter the ${fieldName}`,
                    customSegments: {
                        title: '[nl] Custom segments/records',
                        addText: '[nl] Add custom segment/record',
                        recordTitle: '[nl] Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '[nl] View detailed instructions',
                        helpText: '[nl]  on configuring custom segments/records.',
                        emptyTitle: '[nl] Add a custom segment or custom record',
                        fields: {
                            segmentName: '[nl] Name',
                            internalID: '[nl] Internal ID',
                            scriptID: '[nl] Script ID',
                            customRecordScriptID: '[nl] Transaction column ID',
                            mapping: '[nl] Displayed as',
                        },
                        removeTitle: '[nl] Remove custom segment/record',
                        removePrompt: '[nl] Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: '[nl] custom segment name',
                            customRecordName: '[nl] custom record name',
                            segmentTitle: '[nl] Custom segment',
                            customSegmentAddTitle: '[nl] Add custom segment',
                            customRecordAddTitle: '[nl] Add custom record',
                            recordTitle: '[nl] Custom record',
                            segmentRecordType: '[nl] Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "[nl] What's the custom segment name?",
                            customRecordNameTitle: "[nl] What's the custom record name?",
                            customSegmentNameFooter: `[nl] You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `[nl] You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "[nl] What's the internal ID?",
                            customSegmentInternalIDFooter: `[nl] First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*

You can find custom segment internal IDs in NetSuite under:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the hyperlink next to *Custom Record Type*.
4. Find the internal ID in the table at the bottom.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `[nl] You can find custom record internal IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the internal ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "[nl] What's the script ID?",
                            customSegmentScriptIDFooter: `[nl] You can find custom segment script IDs in NetSuite under: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the *Application and Sourcing* tab near the bottom, then:
    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.
    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "[nl] What's the transaction column ID?",
                            customRecordScriptIDFooter: `[nl] You can find custom record script IDs in NetSuite under:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the script ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '[nl] How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: '[nl] How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `[nl] A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: '[nl] Custom lists',
                        addText: '[nl] Add custom list',
                        recordTitle: '[nl] Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '[nl] View detailed instructions',
                        helpText: '[nl]  on configuring custom lists.',
                        emptyTitle: '[nl] Add a custom list',
                        fields: {
                            listName: '[nl] Name',
                            internalID: '[nl] Internal ID',
                            transactionFieldID: '[nl] Transaction field ID',
                            mapping: '[nl] Displayed as',
                        },
                        removeTitle: '[nl] Remove custom list',
                        removePrompt: '[nl] Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: '[nl] Choose a custom list',
                            transactionFieldIDTitle: "[nl] What's the transaction field ID?",
                            transactionFieldIDFooter: `[nl] You can find transaction field IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom list.
3. Find the transaction field ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '[nl] How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `[nl] A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: '[nl] NetSuite employee default',
                        description: '[nl] Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `[nl] If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '[nl] Tags',
                        description: '[nl] Line-item level',
                        footerContent: (importField: string) => `[nl] ${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '[nl] Report fields',
                        description: '[nl] Report level',
                        footerContent: (importField: string) => `[nl] ${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: '[nl] Sage Intacct setup',
            prerequisitesTitle: '[nl] Before you connect...',
            downloadExpensifyPackage: '[nl] Download the Expensify package for Sage Intacct',
            followSteps: '[nl] Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: '[nl] Enter your Sage Intacct credentials',
            entity: '[nl] Entity',
            employeeDefault: '[nl] Sage Intacct employee default',
            employeeDefaultDescription: "[nl] The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "[nl] Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "[nl] Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: (mappingTitle: string) => `[nl] Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: '[nl] Expense types',
            expenseTypesDescription: '[nl] Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: '[nl] Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: '[nl] Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: '[nl] User-defined dimensions',
            addUserDefinedDimension: '[nl] Add user-defined dimension',
            integrationName: '[nl] Integration name',
            dimensionExists: '[nl] A dimension with this name already exists.',
            removeDimension: '[nl] Remove user-defined dimension',
            removeDimensionPrompt: '[nl] Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: '[nl] User-defined dimension',
            addAUserDefinedDimension: '[nl] Add a user-defined dimension',
            detailedInstructionsLink: '[nl] View detailed instructions',
            detailedInstructionsRestOfSentence: '[nl]  on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '[nl] 1 UDD added',
                other: (count: number) => `[nl] ${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '[nl] departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '[nl] classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '[nl] locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '[nl] customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '[nl] projects (jobs)';
                    default:
                        return '[nl] mappings';
                }
            },
        },
        type: {
            free: '[nl] Free',
            control: '[nl] Control',
            collect: '[nl] Collect',
        },
        companyCards: {
            addCards: '[nl] Add cards',
            selectCards: '[nl] Select cards',
            fromOtherWorkspaces: '[nl] From other workspaces',
            addWorkEmail: '[nl] Add your work email',
            addWorkEmailDescription: '[nl] Please add your work email in order to use existing feeds from other workspaces.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: "[nl] Couldn't load card feeds",
                workspaceFeedsCouldNotBeLoadedMessage: '[nl] An error occurred while loading workspace card feeds. Please try again or contact your administrator.',
                feedCouldNotBeLoadedTitle: "[nl] Couldn't load this feed",
                feedCouldNotBeLoadedMessage: '[nl] An error occurred while loading this feed. Please try again or contact your administrator.',
                tryAgain: '[nl] Try again',
            },
            addNewCard: {
                other: '[nl] Other',
                fileImport: '[nl] Import transactions from file',
                createFileFeedHelpText: `[nl] <muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: '[nl] Company card layout name',
                cardLayoutNameRequired: '[nl] The Company card layout name is required',
                useAdvancedFields: '[nl] Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: '[nl] American Express Corporate Cards',
                    cdf: '[nl] Mastercard Commercial Cards',
                    vcf: '[nl] Visa Commercial Cards',
                    stripe: '[nl] Stripe Cards',
                },
                yourCardProvider: `[nl] Who's your card provider?`,
                whoIsYourBankAccount: '[nl] Who’s your bank?',
                whereIsYourBankLocated: '[nl] Where’s your bank located?',
                howDoYouWantToConnect: '[nl] How do you want to connect to your bank?',
                learnMoreAboutOptions: `[nl] <muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: '[nl] Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `[nl] Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: '[nl] The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `[nl] Enable your ${provider} feed`,
                    heading: '[nl] We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: '[nl] We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: '[nl] We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `[nl] 1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.

2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `[nl] 1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.

2. Once the feed is enabled, Amex will send you a production letter.

3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `[nl] 1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.

 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `[nl] 1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Under Product Integrations, click Enable next to Expensify.

3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: '[nl] What bank issues these cards?',
                enterNameOfBank: '[nl] Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: '[nl] What are the Visa feed details?',
                        processorLabel: '[nl] Processor ID',
                        bankLabel: '[nl] Financial institution (bank) ID',
                        companyLabel: '[nl] Company ID',
                        helpLabel: '[nl] Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `[nl] What's the Amex delivery file name?`,
                        fileNameLabel: '[nl] Delivery file name',
                        helpLabel: '[nl] Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `[nl] What's the Mastercard distribution ID?`,
                        distributionLabel: '[nl] Distribution ID',
                        helpLabel: '[nl] Where do I find the distribution ID?',
                    },
                },
                amexCorporate: '[nl] Select this if the front of your cards say “Corporate”',
                amexBusiness: '[nl] Select this if the front of your cards say “Business”',
                amexPersonal: '[nl] Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: '[nl] Please select a card provider before continuing',
                    pleaseSelectBankAccount: '[nl] Please select a bank account before continuing',
                    pleaseSelectBank: '[nl] Please select a bank before continuing',
                    pleaseSelectCountry: '[nl] Please select a country before continuing',
                    pleaseSelectFeedType: '[nl] Please select a feed type before continuing',
                },
                exitModal: {
                    title: '[nl] Something not working?',
                    prompt: "[nl] We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: '[nl] Report issue',
                    cancelText: '[nl] Skip',
                },
                csvColumns: {
                    cardNumber: '[nl] Card number',
                    postedDate: '[nl] Date',
                    merchant: '[nl] Merchant',
                    amount: '[nl] Amount',
                    currency: '[nl] Currency',
                    ignore: '[nl] Ignore',
                    originalTransactionDate: '[nl] Original transaction date',
                    originalAmount: '[nl] Original amount',
                    originalCurrency: '[nl] Original currency',
                    comment: '[nl] Comment',
                    category: '[nl] Category',
                    tag: '[nl] Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `[nl] Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `[nl] Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '[nl] Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '[nl] Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '[nl] Custom day of month',
            },
            assign: '[nl] Assign',
            assignCard: '[nl] Assign card',
            findCard: '[nl] Find card',
            cardNumber: '[nl] Card number',
            commercialFeed: '[nl] Commercial feed',
            feedName: (feedName: string) => `[nl] ${feedName} cards`,
            deletedFeed: '[nl] Deleted feed',
            deletedCard: '[nl] Deleted card',
            directFeed: '[nl] Direct feed',
            whoNeedsCardAssigned: '[nl] Who needs a card assigned?',
            chooseTheCardholder: '[nl] Choose the cardholder',
            chooseCard: '[nl] Choose a card',
            chooseCardFor: (assignee: string) => `[nl] Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: '[nl] No active cards on this feed',
            somethingMightBeBroken:
                '[nl] <muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: '[nl] Choose a transaction start date',
            startDateDescription: "[nl] Choose your import start date. We'll sync all transactions from this date onwards.",
            editStartDateDescription: "[nl] Choose a new transaction start date. We'll sync all transactions from that date onwards, excluding those we already imported.",
            fromTheBeginning: '[nl] From the beginning',
            customStartDate: '[nl] Custom start date',
            customCloseDate: '[nl] Custom close date',
            letsDoubleCheck: "[nl] Let's double check that everything looks right.",
            confirmationDescription: "[nl] We'll begin importing transactions immediately.",
            card: '[nl] Card',
            cardName: '[nl] Card name',
            brokenConnectionError: '[nl] <rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `[nl] assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '[nl] company card',
            chooseCardFeed: '[nl] Choose card feed',
            ukRegulation:
                '[nl] Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: '[nl] Card assignment failed.',
            unassignCardFailedError: '[nl] Card unassignment failed.',
            cardAlreadyAssignedError: '[nl] This card is already assigned to a user in another workspace.',
            importTransactions: {
                title: '[nl] Import transactions from file',
                description: '[nl] Please adjust the settings for your file that will be applied on import.',
                cardDisplayName: '[nl] Card display name',
                currency: '[nl] Currency',
                transactionsAreReimbursable: '[nl] Transactions are reimbursable',
                flipAmountSign: '[nl] Flip amount sign',
                importButton: '[nl] Import transactions',
            },
            assignNewCards: {
                title: '[nl] Assign new cards',
                description: '[nl] Get the latest cards to assign from your bank',
            },
        },
        expensifyCard: {
            issueAndManageCards: '[nl] Issue and manage your Expensify Cards',
            getStartedIssuing: '[nl] Get started by issuing your first virtual or physical card.',
            verificationInProgress: '[nl] Verification in progress...',
            verifyingTheDetails: "[nl] We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                '[nl] The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                '[nl] Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: '[nl] Issue card',
            findCard: '[nl] Find card',
            newCard: '[nl] New card',
            name: '[nl] Name',
            lastFour: '[nl] Last 4',
            limit: '[nl] Limit',
            currentBalance: '[nl] Current balance',
            currentBalanceDescription: '[nl] Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: (settlementDate: string) => `[nl] Balance will be settled on ${settlementDate}`,
            settleBalance: '[nl] Settle balance',
            cardLimit: '[nl] Card limit',
            remainingLimit: '[nl] Remaining limit',
            requestLimitIncrease: '[nl] Request limit increase',
            remainingLimitDescription:
                '[nl] We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: '[nl] Cash back',
            earnedCashbackDescription: '[nl] Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: '[nl] Issue new card',
            finishSetup: '[nl] Finish setup',
            chooseBankAccount: '[nl] Choose bank account',
            chooseExistingBank: '[nl] Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: '[nl] Account ending in',
            addNewBankAccount: '[nl] Add a new bank account',
            settlementAccount: '[nl] Settlement account',
            settlementAccountDescription: '[nl] Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `[nl] Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: '[nl] Settlement frequency',
            settlementFrequencyDescription: '[nl] Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo: '[nl] If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            frequency: {
                daily: '[nl] Daily',
                monthly: '[nl] Monthly',
            },
            cardDetails: '[nl] Card details',
            cardPending: ({name}: {name: string}) => `[nl] Card is currently pending and will be issued once ${name}'s account is validated.`,
            virtual: '[nl] Virtual',
            physical: '[nl] Physical',
            deactivate: '[nl] Deactivate card',
            changeCardLimit: '[nl] Change card limit',
            changeLimit: '[nl] Change limit',
            smartLimitWarning: (limit: number | string) => `[nl] If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `[nl] If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `[nl] If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: '[nl] Change card limit type',
            changeLimitType: '[nl] Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `[nl] If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `[nl] If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: '[nl] Add shipping details',
            issuedCard: (assignee: string) => `[nl] issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `[nl] issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: (assignee: string, link: string) => `[nl] issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `[nl] ${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `[nl] ${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: (assignee: string, link: string) => `[nl] ${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: '[nl] card',
            replacementCard: '[nl] replacement card',
            verifyingHeader: '[nl] Verifying',
            bankAccountVerifiedHeader: '[nl] Bank account verified',
            verifyingBankAccount: '[nl] Verifying bank account...',
            verifyingBankAccountDescription: '[nl] Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: '[nl] Bank account verified!',
            bankAccountVerifiedDescription: '[nl] You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: '[nl] One more step...',
            oneMoreStepDescription: '[nl] Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: '[nl] Got it',
            goToConcierge: '[nl] Go to Concierge',
        },
        categories: {
            deleteCategories: '[nl] Delete categories',
            deleteCategoriesPrompt: '[nl] Are you sure you want to delete these categories?',
            deleteCategory: '[nl] Delete category',
            deleteCategoryPrompt: '[nl] Are you sure you want to delete this category?',
            disableCategories: '[nl] Disable categories',
            disableCategory: '[nl] Disable category',
            enableCategories: '[nl] Enable categories',
            enableCategory: '[nl] Enable category',
            defaultSpendCategories: '[nl] Default spend categories',
            spendCategoriesDescription: '[nl] Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: '[nl] An error occurred while deleting the category, please try again',
            categoryName: '[nl] Category name',
            requiresCategory: '[nl] Members must categorize all expenses',
            needCategoryForExportToIntegration: (connectionName: string) => `[nl] All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: '[nl] Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "[nl] You haven't created any categories",
                subtitle: '[nl] Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[nl] <muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: '[nl] An error occurred while updating the category, please try again',
            createFailureMessage: '[nl] An error occurred while creating the category, please try again',
            addCategory: '[nl] Add category',
            editCategory: '[nl] Edit category',
            editCategories: '[nl] Edit categories',
            findCategory: '[nl] Find category',
            categoryRequiredError: '[nl] Category name is required',
            existingCategoryError: '[nl] A category with this name already exists',
            invalidCategoryName: '[nl] Invalid category name',
            importedFromAccountingSoftware: '[nl] The categories below are imported from your',
            payrollCode: '[nl] Payroll code',
            updatePayrollCodeFailureMessage: '[nl] An error occurred while updating the payroll code, please try again',
            glCode: '[nl] GL code',
            updateGLCodeFailureMessage: '[nl] An error occurred while updating the GL code, please try again',
            importCategories: '[nl] Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: '[nl] Cannot delete or disable all categories',
                description: `[nl] At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: '[nl] Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: '[nl] Spend',
                subtitle: '[nl] Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: '[nl] Manage',
                subtitle: '[nl] Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: '[nl] Earn',
                subtitle: '[nl] Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: '[nl] Organize',
                subtitle: '[nl] Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: '[nl] Integrate',
                subtitle: '[nl] Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: '[nl] Distance rates',
                subtitle: '[nl] Add, update, and enforce rates.',
            },
            perDiem: {
                title: '[nl] Per diem',
                subtitle: '[nl] Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: '[nl] Travel',
                subtitle: '[nl] Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: '[nl] Get started with Expensify Travel',
                    subtitle: "[nl] We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "[nl] Let's go",
                },
                reviewingRequest: {
                    title: "[nl] Pack your bags, we've got your request...",
                    subtitle: "[nl] We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: '[nl] Request sent',
                },
                bookOrManageYourTrip: {
                    title: '[nl] Travel booking',
                    subtitle: "[nl] Congrats! You're all set to book and manage travel on this workspace.",
                    ctaText: '[nl] Manage travel',
                },
                settings: {
                    autoAddTripName: {
                        title: '[nl] Add trip names to expenses',
                        subtitle: '[nl] Automatically add trip names to expense descriptions for travel booked in Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '[nl] Travel booking',
                        subtitle: "[nl] Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: '[nl] Manage travel',
                    },
                    centralInvoicingSection: {
                        title: '[nl] Central invoicing',
                        subtitle: '[nl] Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: '[nl] Learn how.',
                        subsections: {
                            currentTravelSpendLabel: '[nl] Current travel spend',
                            currentTravelSpendPaymentQueued: (amount: string) => `[nl] Payment of ${amount} is queued and will be processed soon.`,
                            currentTravelSpendCta: '[nl] Pay balance',
                            currentTravelLimitLabel: '[nl] Current travel limit',
                            settlementAccountLabel: '[nl] Settlement account',
                            settlementFrequencyLabel: '[nl] Settlement frequency',
                            settlementFrequencyDescription: '[nl] How often Expensify will pull from your business bank account to settle recent Expensify Travel transactions.',
                        },
                    },
                    disableModal: {
                        title: '[nl] Turn off Travel Invoicing?',
                        body: '[nl] Upcoming hotel and car rental reservations may need to be re-booked with a different payment method to avoid cancellation.',
                        confirm: '[nl] Turn off',
                    },
                    outstandingBalanceModal: {
                        title: "[nl] Can't turn off Travel Invoicing",
                        body: '[nl] You still have an outstanding travel balance. Please pay your balance first.',
                        confirm: '[nl] Got it',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `[nl] Pay balance of ${amount}?`,
                        body: '[nl] The payment will be queued and processed shortly after. This action cannot be undone once started.',
                    },
                    exportToPDF: '[nl] Export to PDF',
                    exportToCSV: '[nl] Export to CSV',
                    selectDateRangeError: '[nl] Please select a date range to export',
                    invalidDateRangeError: '[nl] The start date must be before the end date',
                    enabled: '[nl] Central Invoicing enabled!',
                    enabledDescription: '[nl] All travel spend on this workspace will now be centralized in a monthly invoice.',
                },
                personalDetailsDescription: '[nl] In order to book travel, please enter your legal name as it appears on your government-issued ID.',
            },
            expensifyCard: {
                title: '[nl] Expensify Card',
                subtitle: '[nl] Gain insights and control over spend.',
                disableCardTitle: '[nl] Disable Expensify Card',
                disableCardPrompt: '[nl] You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: '[nl] Chat with Concierge',
                feed: {
                    title: '[nl] Get the Expensify Card',
                    subTitle: '[nl] Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: '[nl] Cash back on every US purchase',
                        unlimited: '[nl] Unlimited virtual cards',
                        spend: '[nl] Spend controls and custom limits',
                    },
                    ctaTitle: '[nl] Issue new card',
                },
            },
            companyCards: {
                title: '[nl] Company cards',
                subtitle: '[nl] Connect the cards you already have.',
                feed: {
                    title: '[nl] Bring your own cards (BYOC)',
                    subtitle: '[nl] Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: '[nl] Connect cards from 10,000+ banks',
                        assignCards: '[nl] Link your team’s existing cards',
                        automaticImport: '[nl] We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: '[nl] Bank connection issue',
                connectWithPlaid: '[nl] connect via Plaid',
                connectWithExpensifyCard: '[nl] try the Expensify Card.',
                bankConnectionDescription: `[nl] Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: '[nl] Disable company cards',
                disableCardPrompt: '[nl] You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: '[nl] Chat with Concierge',
                cardDetails: '[nl] Card details',
                cardNumber: '[nl] Card number',
                cardholder: '[nl] Cardholder',
                cardName: '[nl] Card name',
                allCards: '[nl] All cards',
                assignedCards: '[nl] Assigned',
                unassignedCards: '[nl] Unassigned',
                integrationExport: (integration: string, type?: string) => (integration && type ? `[nl] ${integration} ${type.toLowerCase()} export` : `[nl] ${integration} export`),
                integrationExportTitleXero: (integration: string) => `[nl] Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `[nl] Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: '[nl] Last updated',
                transactionStartDate: '[nl] Transaction start date',
                updateCard: '[nl] Update card',
                unassignCard: '[nl] Unassign card',
                unassign: '[nl] Unassign',
                unassignCardDescription: '[nl] Unassigning this card will delete all unsubmitted transactions.',
                assignCard: '[nl] Assign card',
                removeCard: '[nl] Remove card',
                remove: '[nl] Remove',
                removeCardDescription: '[nl] Removing this card will delete all unsubmitted transactions.',
                cardFeedName: '[nl] Card feed name',
                cardFeedNameDescription: '[nl] Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: '[nl] Delete transactions',
                cardFeedTransactionDescription: '[nl] Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: '[nl] Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: '[nl] Allow deleting transactions',
                removeCardFeed: '[nl] Remove card feed',
                removeCardFeedTitle: (feedName: string) => `[nl] Remove ${feedName} feed`,
                removeCardFeedDescription: '[nl] Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: '[nl] Card feed name is required',
                    statementCloseDateRequired: '[nl] Please select a statement close date.',
                },
                corporate: '[nl] Restrict deleting transactions',
                personal: '[nl] Allow deleting transactions',
                setFeedNameDescription: '[nl] Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: '[nl] When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: '[nl] No cards in this feed',
                emptyAddedFeedDescription: "[nl] Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `[nl] We're reviewing your request...`,
                pendingFeedDescription: `[nl] We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '[nl] Check your browser window',
                pendingBankDescription: (bankName: string) => `[nl] Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: '[nl] please click here',
                giveItNameInstruction: '[nl] Give the card a name that sets it apart from others.',
                updating: '[nl] Updating...',
                neverUpdated: '[nl] Never',
                noAccountsFound: '[nl] No accounts found',
                defaultCard: '[nl] Default card',
                downgradeTitle: `[nl] Can't downgrade workspace`,
                downgradeSubTitle: `[nl] This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `[nl] Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: '[nl] Get the Expensify Card',
                expensifyCardBannerSubtitle: '[nl] Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: '[nl] Learn more',
                statementCloseDateTitle: '[nl] Statement close date',
                statementCloseDateDescription: '[nl] Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: '[nl] Workflows',
                subtitle: '[nl] Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    '[nl] Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: '[nl] Invoices',
                subtitle: '[nl] Send and receive invoices.',
            },
            categories: {
                title: '[nl] Categories',
                subtitle: '[nl] Track and organize spend.',
            },
            tags: {
                title: '[nl] Tags',
                subtitle: '[nl] Classify costs and track billable expenses.',
            },
            taxes: {
                title: '[nl] Taxes',
                subtitle: '[nl] Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: '[nl] Report fields',
                subtitle: '[nl] Set up custom fields for spend.',
            },
            connections: {
                title: '[nl] Accounting',
                subtitle: '[nl] Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: '[nl] Receipt partners',
                subtitle: '[nl] Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '[nl] Not so fast...',
                featureEnabledText: "[nl] To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "[nl] To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: '[nl] Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '[nl] Disconnect Uber',
                disconnectText: '[nl] To disable this feature, please disconnect the Uber for Business integration first.',
                description: '[nl] Are you sure you want to disconnect this integration?',
                confirmText: '[nl] Got it',
            },
            workflowWarningModal: {
                featureEnabledTitle: '[nl] Not so fast...',
                featureEnabledText:
                    '[nl] Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: '[nl] Go to Expensify Cards',
            },
            rules: {
                title: '[nl] Rules',
                subtitle: '[nl] Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: '[nl] Time',
                subtitle: '[nl] Set a billable hourly rate for time tracking.',
                defaultHourlyRate: '[nl] Default hourly rate',
            },
        },
        reports: {
            reportsCustomTitleExamples: '[nl] Examples:',
            customReportNamesSubtitle: `[nl] <muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: '[nl] Default report title',
            customNameDescription: `[nl] Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: '[nl] Name',
            customNameEmailPhoneExample: '[nl] Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: '[nl] Report start date: {report:startdate}',
            customNameWorkspaceNameExample: '[nl] Workspace name: {report:workspacename}',
            customNameReportIDExample: '[nl] Report ID: {report:id}',
            customNameTotalExample: '[nl] Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: '[nl] Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: '[nl] Add field',
            delete: '[nl] Delete field',
            deleteFields: '[nl] Delete fields',
            findReportField: '[nl] Find report field',
            deleteConfirmation: '[nl] Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: '[nl] Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "[nl] You haven't created any report fields",
                subtitle: '[nl] Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "[nl] Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: '[nl] Disable report fields',
            disableReportFieldsConfirmation: '[nl] Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: '[nl] The report fields below are imported from your',
            textType: '[nl] Text',
            dateType: '[nl] Date',
            dropdownType: '[nl] List',
            formulaType: '[nl] Formula',
            textAlternateText: '[nl] Add a field for free text input.',
            dateAlternateText: '[nl] Add a calendar for date selection.',
            dropdownAlternateText: '[nl] Add a list of options to choose from.',
            formulaAlternateText: '[nl] Add a formula field.',
            nameInputSubtitle: '[nl] Choose a name for the report field.',
            typeInputSubtitle: '[nl] Choose what type of report field to use.',
            initialValueInputSubtitle: '[nl] Enter a starting value to show in the report field.',
            listValuesInputSubtitle: '[nl] These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: '[nl] These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: '[nl] Delete value',
            deleteValues: '[nl] Delete values',
            disableValue: '[nl] Disable value',
            disableValues: '[nl] Disable values',
            enableValue: '[nl] Enable value',
            enableValues: '[nl] Enable values',
            emptyReportFieldsValues: {
                title: "[nl] You haven't created any list values",
                subtitle: '[nl] Add custom values to appear on reports.',
            },
            deleteValuePrompt: '[nl] Are you sure you want to delete this list value?',
            deleteValuesPrompt: '[nl] Are you sure you want to delete these list values?',
            listValueRequiredError: '[nl] Please enter a list value name',
            existingListValueError: '[nl] A list value with this name already exists',
            editValue: '[nl] Edit value',
            listValues: '[nl] List values',
            addValue: '[nl] Add value',
            existingReportFieldNameError: '[nl] A report field with this name already exists',
            reportFieldNameRequiredError: '[nl] Please enter a report field name',
            reportFieldTypeRequiredError: '[nl] Please choose a report field type',
            circularReferenceError: "[nl] This field can't refer to itself. Please update.",
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `[nl] Formula field ${value} not recognized`,
            reportFieldInitialValueRequiredError: '[nl] Please choose a report field initial value',
            genericFailureMessage: '[nl] An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: '[nl] Tag name',
            requiresTag: '[nl] Members must tag all expenses',
            trackBillable: '[nl] Track billable expenses',
            customTagName: '[nl] Custom tag name',
            enableTag: '[nl] Enable tag',
            enableTags: '[nl] Enable tags',
            requireTag: '[nl] Require tag',
            requireTags: '[nl] Require tags',
            notRequireTags: '[nl] Don’t require',
            disableTag: '[nl] Disable tag',
            disableTags: '[nl] Disable tags',
            addTag: '[nl] Add tag',
            editTag: '[nl] Edit tag',
            editTags: '[nl] Edit tags',
            findTag: '[nl] Find tag',
            subtitle: '[nl] Tags add more detailed ways to classify costs.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `[nl] <muted-text>Tags add more detailed ways to classify costs. You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "[nl] You haven't created any tags",
                subtitle: '[nl] Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `[nl] <muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[nl] <muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: '[nl] Delete tag',
            deleteTags: '[nl] Delete tags',
            deleteTagConfirmation: '[nl] Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: '[nl] Are you sure that you want to delete these tags?',
            deleteFailureMessage: '[nl] An error occurred while deleting the tag, please try again',
            tagRequiredError: '[nl] Tag name is required',
            existingTagError: '[nl] A tag with this name already exists',
            invalidTagNameError: '[nl] Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: '[nl] An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: '[nl] Tags are managed in your',
            employeesSeeTagsAs: '[nl] Employees see tags as',
            glCode: '[nl] GL code',
            updateGLCodeFailureMessage: '[nl] An error occurred while updating the GL code, please try again',
            tagRules: '[nl] Tag rules',
            approverDescription: '[nl] Approver',
            importTags: '[nl] Import tags',
            importTagsSupportingText: '[nl] Code your expenses with one type of tag or many.',
            configureMultiLevelTags: '[nl] Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `[nl] Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: '[nl] The first row is the title for each tag list',
                independentTags: '[nl] These are independent tags',
                glAdjacentColumn: '[nl] There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: '[nl] Single level of tags',
                multiLevel: '[nl] Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '[nl] Switch Tag Levels',
                prompt1: '[nl] Switching tag levels will erase all current tags.',
                prompt2: '[nl]  We suggest you first',
                prompt3: '[nl]  download a backup',
                prompt4: '[nl]  by exporting your tags.',
                prompt5: '[nl]  Learn more',
                prompt6: '[nl]  about tag levels.',
            },
            overrideMultiTagWarning: {
                title: '[nl] Import tags',
                prompt1: '[nl] Are you sure?',
                prompt2: '[nl]  The existing tags will be overridden, but you can',
                prompt3: '[nl]  download a backup',
                prompt4: '[nl]  first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `[nl] We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: '[nl] Cannot delete or disable all tags',
                description: `[nl] At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: '[nl] Cannot make all tags optional',
                description: `[nl] At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: '[nl] Cannot make tag list required',
                description: '[nl] You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '[nl] 1 Tag',
                other: (count: number) => `[nl] ${count} Tags`,
            }),
        },
        taxes: {
            subtitle: '[nl] Add tax names, rates, and set defaults.',
            addRate: '[nl] Add rate',
            workspaceDefault: '[nl] Workspace currency default',
            foreignDefault: '[nl] Foreign currency default',
            customTaxName: '[nl] Custom tax name',
            value: '[nl] Value',
            taxReclaimableOn: '[nl] Tax reclaimable on',
            taxRate: '[nl] Tax rate',
            findTaxRate: '[nl] Find tax rate',
            error: {
                taxRateAlreadyExists: '[nl] This tax name is already in use',
                taxCodeAlreadyExists: '[nl] This tax code is already in use',
                valuePercentageRange: '[nl] Please enter a valid percentage between 0 and 100',
                customNameRequired: '[nl] Custom tax name is required',
                deleteFailureMessage: '[nl] An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: '[nl] An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: '[nl] An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: '[nl] The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: '[nl] Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `[nl] Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '[nl] Delete rate',
                deleteMultiple: '[nl] Delete rates',
                enable: '[nl] Enable rate',
                disable: '[nl] Disable rate',
                enableTaxRates: () => ({
                    one: '[nl] Enable rate',
                    other: '[nl] Enable rates',
                }),
                disableTaxRates: () => ({
                    one: '[nl] Disable rate',
                    other: '[nl] Disable rates',
                }),
            },
            importedFromAccountingSoftware: '[nl] The taxes below are imported from your',
            taxCode: '[nl] Tax code',
            updateTaxCodeFailureMessage: '[nl] An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: '[nl] Name your new workspace',
            selectFeatures: '[nl] Select features to copy',
            whichFeatures: '[nl] Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '[nl] \n\nDo you want to continue?',
            categories: '[nl] categories and your auto-categorization rules',
            reimbursementAccount: '[nl] reimbursement account',
            welcomeNote: '[nl] Please start using my new workspace',
            delayedSubmission: '[nl] delayed submission',
            merchantRules: '[nl] Merchant rules',
            merchantRulesCount: () => ({
                one: '[nl] 1 merchant rule',
                other: (count: number) => `[nl] ${count} merchant rules`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `[nl] You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: '[nl] An error occurred while duplicating your new workspace. Please try again.',
        },
        emptyWorkspace: {
            title: '[nl] You have no workspaces',
            subtitle: '[nl] Track receipts, reimburse expenses, manage travel, send invoices, and more.',
            createAWorkspaceCTA: '[nl] Get Started',
            features: {
                trackAndCollect: '[nl] Track and collect receipts',
                reimbursements: '[nl] Reimburse employees',
                companyCards: '[nl] Manage company cards',
            },
            notFound: '[nl] No workspace found',
            description: '[nl] Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: '[nl] New workspace',
            getTheExpensifyCardAndMore: '[nl] Get the Expensify Card and more',
            confirmWorkspace: '[nl] Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `[nl] My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `[nl] ${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '[nl] An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `[nl] Are you sure you want to remove ${memberName}?`,
                other: '[nl] Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `[nl] ${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '[nl] Remove member',
                other: '[nl] Remove members',
            }),
            findMember: '[nl] Find member',
            removeWorkspaceMemberButtonTitle: '[nl] Remove from workspace',
            removeGroupMemberButtonTitle: '[nl] Remove from group',
            removeRoomMemberButtonTitle: '[nl] Remove from chat',
            removeMemberPrompt: (memberName: string) => `[nl] Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '[nl] Remove member',
            transferOwner: '[nl] Transfer owner',
            makeMember: () => ({
                one: '[nl] Make member',
                other: '[nl] Make members',
            }),
            makeAdmin: () => ({
                one: '[nl] Make admin',
                other: '[nl] Make admins',
            }),
            makeAuditor: () => ({
                one: '[nl] Make auditor',
                other: '[nl] Make auditors',
            }),
            selectAll: '[nl] Select all',
            error: {
                genericAdd: '[nl] There was a problem adding this workspace member',
                cannotRemove: "[nl] You can't remove yourself or the workspace owner",
                genericRemove: '[nl] There was a problem removing that workspace member',
            },
            addedWithPrimary: '[nl] Some members were added with their primary logins.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `[nl] Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `[nl] Total workspace members: ${count}`,
            importMembers: '[nl] Import members',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `[nl] If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `[nl] ${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `[nl] You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[nl] If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[nl] If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `[nl] ${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: '[nl] Get started by issuing your first virtual or physical card.',
            issueCard: '[nl] Issue card',
            issueNewCard: {
                whoNeedsCard: '[nl] Who needs a card?',
                inviteNewMember: '[nl] Invite new member',
                findMember: '[nl] Find member',
                chooseCardType: '[nl] Choose a card type',
                physicalCard: '[nl] Physical card',
                physicalCardDescription: '[nl] Great for the frequent spender',
                virtualCard: '[nl] Virtual card',
                virtualCardDescription: '[nl] Instant and flexible',
                chooseLimitType: '[nl] Choose a limit type',
                smartLimit: '[nl] Smart Limit',
                smartLimitDescription: '[nl] Spend up to a certain amount before requiring approval',
                monthly: '[nl] Monthly',
                monthlyDescription: '[nl] Limit renews monthly',
                fixedAmount: '[nl] Fixed amount',
                fixedAmountDescription: '[nl] Spend until the limit is reached',
                setLimit: '[nl] Set a limit',
                cardLimitError: '[nl] Please enter an amount less than $21,474,836',
                giveItName: '[nl] Give it a name',
                giveItNameInstruction: '[nl] Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: '[nl] Card name',
                letsDoubleCheck: '[nl] Let’s double check that everything looks right.',
                willBeReadyToUse: '[nl] This card will be ready to use immediately.',
                willBeReadyToShip: '[nl] This card will be ready to ship immediately.',
                cardholder: '[nl] Cardholder',
                cardType: '[nl] Card type',
                limit: '[nl] Limit',
                limitType: '[nl] Limit type',
                disabledApprovalForSmartLimitError: '[nl] Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
                singleUse: '[nl] Single-use',
                singleUseDescription: '[nl] Expires after one transaction',
                validFrom: '[nl] Valid from',
                startDate: '[nl] Start date',
                endDate: '[nl] End date',
                noExpirationHint: "[nl] A card without an expiration date won't expire",
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `[nl] Valid from ${startDate} to ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `[nl] ${startDate} to ${endDate}`,
                combineWithExpiration: '[nl] Combine with expiration options for additional spend control',
                enterValidDate: '[nl] Enter a valid date',
                expirationDate: '[nl] Expiration date',
                limitAmount: '[nl] Limit amount',
                setExpiryOptions: '[nl] Set expiry options',
                setExpiryDate: '[nl] Set expiry date',
                setExpiryDateDescription: '[nl] Card will expire as listed on the card',
                amount: '[nl] Amount',
            },
            deactivateCardModal: {
                deactivate: '[nl] Deactivate',
                deactivateCard: '[nl] Deactivate card',
                deactivateConfirmation: '[nl] Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: '[nl] settings',
            title: '[nl] Connections',
            subtitle: '[nl] Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: '[nl] QuickBooks Online',
            qbd: '[nl] QuickBooks Desktop',
            xero: '[nl] Xero',
            netsuite: '[nl] NetSuite',
            intacct: '[nl] Sage Intacct',
            sap: '[nl] SAP',
            oracle: '[nl] Oracle',
            microsoftDynamics: '[nl] Microsoft Dynamics',
            talkYourOnboardingSpecialist: '[nl] Chat with your setup specialist.',
            talkYourAccountManager: '[nl] Chat with your account manager.',
            talkToConcierge: '[nl] Chat with Concierge.',
            needAnotherAccounting: '[nl] Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '[nl] QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '[nl] Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '[nl] NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '[nl] Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `[nl] There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '[nl] Go to Expensify Classic to manage your settings.',
            setup: '[nl] Connect',
            lastSync: (relativeDate: string) => `[nl] Last synced ${relativeDate}`,
            notSync: '[nl] Not synced',
            import: '[nl] Import',
            export: '[nl] Export',
            advanced: '[nl] Advanced',
            other: '[nl] Other',
            syncNow: '[nl] Sync now',
            disconnect: '[nl] Disconnect',
            reinstall: '[nl] Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[nl] integration';
                return `[nl] Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `[nl] Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[nl] accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "[nl] Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "[nl] Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "[nl] Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "[nl] Can't connect to QuickBooks Desktop";
                    default: {
                        return "[nl] Can't connect to integration";
                    }
                }
            },
            accounts: '[nl] Chart of accounts',
            taxes: '[nl] Taxes',
            imported: '[nl] Imported',
            notImported: '[nl] Not imported',
            importAsCategory: '[nl] Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '[nl] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '[nl] Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '[nl] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '[nl] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '[nl] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '[nl] Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: '[nl] NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[nl] this integration';
                return `[nl] Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `[nl] Are you sure you want to connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[nl] this accounting integration'}? This will remove any existing accounting connections.`,
            enterCredentials: '[nl] Enter your credentials',
            claimOffer: {
                badgeText: '[nl] Offer available!',
                xero: {
                    headline: '[nl] Get Xero free for 6 months!',
                    description: '[nl] <muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: '[nl] Connect to Xero',
                },
                uber: {
                    headerTitle: '[nl] Uber for Business',
                    headline: '[nl] Get 5% off Uber rides',
                    description: `[nl] <muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: '[nl] Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '[nl] Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '[nl] Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '[nl] Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '[nl] Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return '[nl] Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return '[nl] Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '[nl] Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '[nl] Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return '[nl] Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return '[nl] Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return '[nl] Importing Xero data';
                        case 'startingImportQBO':
                            return '[nl] Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '[nl] Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return '[nl] Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '[nl] Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return '[nl] Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '[nl] Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '[nl] Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return '[nl] Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '[nl] Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '[nl] Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '[nl] Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '[nl] Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '[nl] Updating report fields';
                        case 'jobDone':
                            return '[nl] Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return '[nl] Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return '[nl] Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return '[nl] Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return '[nl] Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '[nl] Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return '[nl] Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return '[nl] Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return '[nl] Syncing tax rates';
                        case 'xeroCheckConnection':
                            return '[nl] Checking Xero connection';
                        case 'xeroSyncTitle':
                            return '[nl] Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return '[nl] Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '[nl] Importing customers';
                        case 'netSuiteSyncInitData':
                            return '[nl] Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return '[nl] Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return '[nl] Importing items';
                        case 'netSuiteSyncData':
                            return '[nl] Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return '[nl] Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return '[nl] Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return '[nl] Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return '[nl] Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return '[nl] Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '[nl] Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '[nl] Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '[nl] Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return '[nl] Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return '[nl] Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return '[nl] Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '[nl] Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '[nl] Importing vendors';
                        case 'intacctCheckConnection':
                            return '[nl] Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return '[nl] Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return '[nl] Importing Sage Intacct data';
                        default: {
                            return `[nl] Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '[nl] Preferred exporter',
            exportPreferredExporterNote:
                '[nl] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[nl] Once set, the preferred exporter will see reports for export in their account.',
            exportAs: '[nl] Export as',
            exportOutOfPocket: '[nl] Export out-of-pocket expenses as',
            exportCompanyCard: '[nl] Export company card expenses as',
            exportDate: '[nl] Export date',
            defaultVendor: '[nl] Default vendor',
            autoSync: '[nl] Auto-sync',
            autoSyncDescription: '[nl] Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: '[nl] Sync reimbursed reports',
            cardReconciliation: '[nl] Card reconciliation',
            reconciliationAccount: '[nl] Reconciliation account',
            continuousReconciliation: '[nl] Continuous Reconciliation',
            saveHoursOnReconciliation:
                '[nl] Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `[nl] <muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '[nl] Choose the bank account that your Expensify Card payments will be reconciled against.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `[nl] Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        export: {
            notReadyHeading: '[nl] Not ready to export',
            notReadyDescription: '[nl] Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: '[nl] Send invoice',
            sendFrom: '[nl] Send from',
            invoicingDetails: '[nl] Invoicing details',
            invoicingDetailsDescription: '[nl] This info will appear on your invoices.',
            companyName: '[nl] Company name',
            companyWebsite: '[nl] Company website',
            paymentMethods: {
                personal: '[nl] Personal',
                business: '[nl] Business',
                chooseInvoiceMethod: '[nl] Choose a payment method below:',
                payingAsIndividual: '[nl] Paying as an individual',
                payingAsBusiness: '[nl] Paying as a business',
            },
            invoiceBalance: '[nl] Invoice balance',
            invoiceBalanceSubtitle: "[nl] This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: '[nl] Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: '[nl] Invite member',
            members: '[nl] Invite members',
            invitePeople: '[nl] Invite new members',
            genericFailureMessage: '[nl] An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `[nl] Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '[nl] user',
            users: '[nl] users',
            invited: '[nl] invited',
            removed: '[nl] removed',
            to: '[nl] to',
            from: '[nl] from',
        },
        inviteMessage: {
            confirmDetails: '[nl] Confirm details',
            inviteMessagePrompt: '[nl] Make your invitation extra special by adding a message below!',
            personalMessagePrompt: '[nl] Message',
            genericFailureMessage: '[nl] An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: '[nl] Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `[nl] ${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '[nl] Oops! Not so fast...',
            workspaceNeeds: '[nl] A workspace needs at least one enabled distance rate.',
            distance: '[nl] Distance',
            centrallyManage: '[nl] Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: '[nl] Rate',
            addRate: '[nl] Add rate',
            findRate: '[nl] Find rate',
            trackTax: '[nl] Track tax',
            deleteRates: () => ({
                one: '[nl] Delete rate',
                other: '[nl] Delete rates',
            }),
            enableRates: () => ({
                one: '[nl] Enable rate',
                other: '[nl] Enable rates',
            }),
            disableRates: () => ({
                one: '[nl] Disable rate',
                other: '[nl] Disable rates',
            }),
            enableRate: '[nl] Enable rate',
            status: '[nl] Status',
            unit: '[nl] Unit',
            taxFeatureNotEnabledMessage:
                '[nl] <muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: '[nl] Delete distance rate',
            areYouSureDelete: () => ({
                one: '[nl] Are you sure you want to delete this rate?',
                other: '[nl] Are you sure you want to delete these rates?',
            }),
            errors: {
                rateNameRequired: '[nl] Rate name is required',
                existingRateName: '[nl] A distance rate with this name already exists',
            },
        },
        editor: {
            descriptionInputLabel: '[nl] Description',
            nameInputLabel: '[nl] Name',
            typeInputLabel: '[nl] Type',
            initialValueInputLabel: '[nl] Initial value',
            nameInputHelpText: "[nl] This is the name you'll see on your workspace.",
            nameIsRequiredError: "[nl] You'll need to give your workspace a name",
            currencyInputLabel: '[nl] Default currency',
            currencyInputHelpText: '[nl] All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `[nl] The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: '[nl] Save',
            genericFailureMessage: '[nl] An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: '[nl] An error occurred uploading the avatar. Please try again.',
            addressContext: '[nl] A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: '[nl] Expense policy',
        },
        bankAccount: {
            continueWithSetup: '[nl] Continue setup',
            youAreAlmostDone: "[nl] You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: '[nl] Streamline payments',
            connectBankAccountNote: "[nl] Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: '[nl] One more thing!',
            allSet: "[nl] You're all set!",
            accountDescriptionWithCards: '[nl] This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "[nl] Let's finish in chat!",
            finishInChat: '[nl] Finish in chat',
            almostDone: '[nl] Almost done!',
            disconnectBankAccount: '[nl] Disconnect bank account',
            startOver: '[nl] Start over',
            updateDetails: '[nl] Update details',
            yesDisconnectMyBankAccount: '[nl] Yes, disconnect my bank account',
            yesStartOver: '[nl] Yes, start over',
            disconnectYourBankAccount: (bankName: string) =>
                `[nl] Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "[nl] Starting over will clear the progress you've made so far.",
            areYouSure: '[nl] Are you sure?',
            workspaceCurrency: '[nl] Workspace currency',
            updateCurrencyPrompt: '[nl] It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: '[nl] Update to USD',
            updateWorkspaceCurrency: '[nl] Update workspace currency',
            workspaceCurrencyNotSupported: '[nl] Workspace currency not supported',
            yourWorkspace: `[nl] Your workspace is set to an unsupported currency. View the <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: '[nl] Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: '[nl] Transfer owner',
            addPaymentCardTitle: '[nl] Enter your payment card to transfer ownership',
            addPaymentCardButtonText: '[nl] Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `[nl] <muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: '[nl] PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: '[nl] Bank level encryption',
            addPaymentCardRedundant: '[nl] Redundant infrastructure',
            addPaymentCardLearnMore: `[nl] <muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: '[nl] Outstanding balance',
            amountOwedButtonText: '[nl] OK',
            amountOwedText: '[nl] This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: '[nl] Outstanding balance',
            ownerOwesAmountButtonText: '[nl] Transfer balance',
            ownerOwesAmountText: (email: string, amount: string) => `[nl] The account owning this workspace (${email}) has an outstanding balance from a previous month.

Do you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: '[nl] Take over annual subscription',
            subscriptionButtonText: '[nl] Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `[nl] Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: '[nl] Duplicate subscription alert',
            duplicateSubscriptionButtonText: '[nl] Continue',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `[nl] It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.

Click "Continue" if you only want to take over billing for the workspace ${workspaceName}.

If you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '[nl] Cannot transfer ownership',
            hasFailedSettlementsButtonText: '[nl] Got it',
            hasFailedSettlementsText: (email: string) =>
                `[nl] You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '[nl] Failed to clear balance',
            failedToClearBalanceButtonText: '[nl] OK',
            failedToClearBalanceText: '[nl] We were unable to clear the balance. Please try again later.',
            successTitle: '[nl] Woohoo! All set.',
            successDescription: "[nl] You're now the owner of this workspace.",
            errorTitle: '[nl] Oops! Not so fast...',
            errorDescription: `[nl] <muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '[nl] Careful!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `[nl] The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Are you sure you want to export them again?`,
            confirmText: '[nl] Yes, export again',
            cancelText: '[nl] Cancel',
        },
        upgrade: {
            reportFields: {
                title: '[nl] Report fields',
                description: `[nl] Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: '[nl] NetSuite',
                description: `[nl] Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '[nl] Sage Intacct',
                description: `[nl] Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: '[nl] QuickBooks Desktop',
                description: `[nl] Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '[nl] Advanced Approvals',
                description: `[nl] If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            categories: {
                title: '[nl] Categories',
                description: '[nl] Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: '[nl] GL codes',
                description: `[nl] Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '[nl] GL & Payroll codes',
                description: `[nl] Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: '[nl] Tax codes',
                description: `[nl] Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: '[nl] Unlimited Company cards',
                description: `[nl] Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            rules: {
                title: '[nl] Rules',
                description: `[nl] Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.

Require expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: '[nl] Per diem',
                description:
                    '[nl] Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            travel: {
                title: '[nl] Travel',
                description: '[nl] Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            reports: {
                title: '[nl] Reports',
                description: '[nl] Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: '[nl] Multi-level tags',
                description:
                    '[nl] Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: '[nl] Distance rates',
                description: '[nl] Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: '[nl] Auditor',
                description: '[nl] Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '[nl] Multiple approval levels',
                description: '[nl] Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[nl] <muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '[nl] per active member per month.',
                perMember: '[nl] per member per month.',
            },
            note: (subscriptionLink: string) => `[nl] <muted-text>Upgrade to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: '[nl] Unlock this feature',
            completed: {
                headline: `[nl] You've upgraded your workspace!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `[nl] <centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `[nl] You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `[nl] You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `[nl] You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: '[nl] Got it, thanks',
                createdWorkspace: `[nl] You've created a workspace!`,
            },
            commonFeatures: {
                title: '[nl] Upgrade to the Control plan',
                note: '[nl] Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `[nl] <muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[nl] per member per month.` : `[nl] per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: '[nl] Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: '[nl] Smart expense rules',
                    benefit3: '[nl] Multi-level approval workflows',
                    benefit4: '[nl] Enhanced security controls',
                    toUpgrade: '[nl] To upgrade, click',
                    selectWorkspace: '[nl] select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `[nl] Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '[nl] Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '[nl] Downgrade to Collect',
                note: "[nl] You'll lose access to the following features",
                noteAndMore: '[nl] and more:',
                benefits: {
                    important: '[nl] IMPORTANT: ',
                    confirm: '[nl] You\'ll need to change the "Plan type" of every workspace to "Collect" in order to secure the Collect rate.',
                    benefit1Label: '[nl] ERP integrations',
                    benefit1: '[nl] NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: '[nl] HR integrations',
                    benefit2: '[nl] Workday, Certinia',
                    benefit3Label: '[nl] Security',
                    benefit3: '[nl] SSO/SAML',
                    benefit4Label: '[nl] Advanced',
                    benefit4: '[nl] Smart expense rules, per diems, multi-level approvals, custom reporting, and budgeting',
                    headsUp: '[nl] Heads up!',
                    multiWorkspaceNote: '[nl] You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '[nl] > select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: '[nl] Your workspace has been downgraded',
                description: '[nl] You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: '[nl] Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: '[nl] Pay & downgrade',
            headline: '[nl] Your final payment',
            description1: (formattedAmount: string) => `[nl] Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `[nl] See your breakdown below for ${date}:`,
            subscription:
                '[nl] Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: '[nl] An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: '[nl] Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `[nl] Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `[nl] Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "[nl] You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: '[nl] Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: '[nl] Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: '[nl] Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: '[nl] Chat with your admin',
            chatInAdmins: '[nl] Chat in #admins',
            addPaymentCard: '[nl] Add payment card',
            goToSubscription: '[nl] Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: '[nl] Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `[nl] <muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: '[nl] Receipt required amount',
                receiptRequiredAmountDescription: '[nl] Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `[nl] Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: '[nl] Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: '[nl] Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `[nl] Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: '[nl] Max expense amount',
                maxExpenseAmountDescription: '[nl] Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: '[nl] Max age',
                maxExpenseAge: '[nl] Max expense age',
                maxExpenseAgeDescription: '[nl] Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '[nl] 1 day',
                    other: (count: number) => `[nl] ${count} days`,
                }),
                cashExpenseDefault: '[nl] Cash expense default',
                cashExpenseDefaultDescription:
                    '[nl] Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: '[nl] Reimbursable',
                reimbursableDefaultDescription: '[nl] Expenses are most often paid back to employees',
                nonReimbursableDefault: '[nl] Non-reimbursable',
                nonReimbursableDefaultDescription: '[nl] Expenses are occasionally paid back to employees',
                alwaysReimbursable: '[nl] Always reimbursable',
                alwaysReimbursableDescription: '[nl] Expenses are always paid back to employees',
                alwaysNonReimbursable: '[nl] Always non-reimbursable',
                alwaysNonReimbursableDescription: '[nl] Expenses are never paid back to employees',
                billableDefault: '[nl] Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `[nl] <muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: '[nl] Billable',
                billableDescription: '[nl] Expenses are most often re-billed to clients',
                nonBillable: '[nl] Non-billable',
                nonBillableDescription: '[nl] Expenses are occasionally re-billed to clients',
                eReceipts: '[nl] eReceipts',
                eReceiptsHint: `[nl] eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: '[nl] Attendee tracking',
                attendeeTrackingHint: '[nl] Track the per-person cost for every expense.',
                prohibitedDefaultDescription: '[nl] Flag receipts with these line items for manual review.',
                prohibitedExpenses: '[nl] Prohibited expenses',
                alcohol: '[nl] Alcohol',
                hotelIncidentals: '[nl] Hotel incidentals',
                gambling: '[nl] Gambling',
                tobacco: '[nl] Tobacco',
                adultEntertainment: '[nl] Adult entertainment',
                requireCompanyCard: '[nl] Require company cards for all purchases',
                requireCompanyCardDescription: '[nl] Flag all cash spend, including mileage and per-diem expenses.',
                requireCompanyCardDisabledTooltip: '[nl] Enable Company cards (under More features) to unlock.',
            },
            expenseReportRules: {
                title: '[nl] Advanced',
                subtitle: '[nl] Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: '[nl] Prevent self-approvals',
                preventSelfApprovalsSubtitle: '[nl] Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: '[nl] Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: '[nl] Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: '[nl] Auto-approve reports with all expenses under',
                autoApproveReportsUnderDescription: '[nl] Fully compliant expense reports where all expenses are under this amount will be automatically approved.',
                randomReportAuditTitle: '[nl] Random report audit',
                randomReportAuditDescription: '[nl] Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: '[nl] Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: '[nl] Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `[nl] Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: '[nl] Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: '[nl] Auto-pay reports under',
                autoPayReportsUnderDescription: '[nl] Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `[nl] Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[nl] Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: '[nl] Merchant',
                subtitle: '[nl] Set merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: '[nl] Add merchant rule',
                findRule: '[nl] Find merchant rule',
                addRuleTitle: '[nl] Add rule',
                editRuleTitle: '[nl] Edit rule',
                expensesWith: '[nl] For expenses with:',
                expensesExactlyMatching: '[nl] For expenses exactly matching:',
                applyUpdates: '[nl] Apply these updates:',
                saveRule: '[nl] Save rule',
                previewMatches: '[nl] Preview matches',
                confirmError: '[nl] Enter merchant and apply at least one update',
                confirmErrorMerchant: '[nl] Please enter merchant',
                confirmErrorUpdate: '[nl] Please apply at least one update',
                previewMatchesEmptyStateTitle: '[nl] Nothing to show',
                previewMatchesEmptyStateSubtitle: '[nl] No unsubmitted expenses match this rule.',
                deleteRule: '[nl] Delete rule',
                deleteRuleConfirmation: '[nl] Are you sure you want to delete this rule?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `[nl] If merchant ${isExactMatch ? '[nl] exactly matches' : '[nl] contains'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `[nl] Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `[nl] Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `[nl] Mark as  "${reimbursable ? '[nl] reimbursable' : '[nl] non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `[nl] Mark as "${billable ? '[nl] billable' : '[nl] non-billable'}"`,
                matchType: '[nl] Match type',
                matchTypeContains: '[nl] Contains',
                matchTypeExact: '[nl] Exactly matches',
                duplicateRuleTitle: '[nl] Similar merchant rule already exists',
                duplicateRulePrompt: (merchantName: string) => `[nl] Your existing rule for "${merchantName}" will take priority over this one. Save anyway?`,
                saveAnyway: '[nl] Save anyway',
                applyToExistingUnsubmittedExpenses: '[nl] Apply to existing unsubmitted expenses',
            },
            categoryRules: {
                title: '[nl] Category rules',
                approver: '[nl] Approver',
                requireDescription: '[nl] Require description',
                requireFields: '[nl] Require fields',
                requiredFieldsTitle: '[nl] Required fields',
                requiredFieldsDescription: (categoryName: string) => `[nl] This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: '[nl] Require attendees',
                descriptionHint: '[nl] Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `[nl] Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: '[nl] Hint',
                descriptionHintSubtitle: '[nl] Pro-tip: The shorter the better!',
                maxAmount: '[nl] Max amount',
                flagAmountsOver: '[nl] Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `[nl] Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: '[nl] This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: '[nl] Individual expense',
                    expenseSubtitle: '[nl] Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: '[nl] Category total',
                    dailySubtitle: '[nl] Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: '[nl] Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `[nl] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[nl] Never require receipts',
                    always: '[nl] Always require receipts',
                },
                requireItemizedReceiptsOver: '[nl] Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `[nl] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[nl] Never require itemized receipts',
                    always: '[nl] Always require itemized receipts',
                },
                defaultTaxRate: '[nl] Default tax rate',
                enableWorkflows: (moreFeaturesLink: string) => `[nl] Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: '[nl] Expense policy',
                cardSubtitle: "[nl] Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
            },
            spendRules: {
                title: '[nl] Spend',
                subtitle: '[nl] Approve or decline Expensify Card transactions in realtime.',
                defaultRuleDescription: '[nl] All cards',
                block: '[nl] Block',
                defaultRuleTitle: '[nl] Categories: Adult services, ATMs, gambling, money transfers',
                builtInProtectionModal: {
                    title: '[nl] Expensify Cards offer built-in protection - always',
                    description: `[nl] Expensify always declines these charges:

  • Adult services
  • ATMs
  • Gambling
  • Money transfers

Add more spend rules to protect company cash flow.`,
                },
                addSpendRule: '[nl] Add spend rule',
                editRuleTitle: '[nl] Edit rule',
                cardPageTitle: '[nl] Card',
                cardsSectionTitle: '[nl] Cards',
                chooseCards: '[nl] Choose cards',
                saveRule: '[nl] Save rule',
                deleteRule: '[nl] Delete rule',
                deleteRuleConfirmation: '[nl] Are you sure you want to delete this rule?',
                allow: '[nl] Allow',
                spendRuleSectionTitle: '[nl] Spend rule',
                restrictionType: '[nl] Restriction type',
                restrictionTypeHelpAllow: "[nl] Charges are approved if they match any merchant or category, and don't exceed a max amount.",
                restrictionTypeHelpBlock: '[nl] Charges are declined if they match any merchant or category, or exceed a max amount.',
                addMerchant: '[nl] Add merchant',
                merchantContains: '[nl] Merchant contains',
                merchantExactlyMatches: '[nl] Merchant exactly matches',
                noBlockedMerchants: '[nl] No blocked merchants',
                addMerchantToBlockSpend: '[nl] Add a merchant to block spend',
                noAllowedMerchants: '[nl] No allowed merchants',
                addMerchantToAllowSpend: '[nl] Add a merchant to allow spend',
                matchType: '[nl] Match type',
                matchTypeContains: '[nl] Contains',
                matchTypeExact: '[nl] Matches exactly',
                spendCategory: '[nl] Spend category',
                maxAmount: '[nl] Max amount',
                maxAmountHelp: '[nl] Any charge over this amount will be declined, regardless of merchant and spend category restrictions.',
                currencyMismatchTitle: '[nl] Currency mismatch',
                currencyMismatchPrompt: '[nl] To set a max amount, select cards that settle in the same currency.',
                reviewSelectedCards: '[nl] Review selected cards',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => `[nl] ${summary}, +${count} more`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '[nl] Apply at least one spend rule to one card',
                confirmErrorCardRequired: '[nl] Card is a required field',
                confirmErrorApplyAtLeastOneSpendRule: '[nl] Apply at least one spend rule',
                categories: '[nl] Categories',
                merchants: '[nl] Merchants',
                max: '[nl] Max',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '[nl] Airlines',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '[nl] Alcohol and bars',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: '[nl] Amazon and bookstores',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '[nl] Automotive',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: '[nl] Car rentals',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '[nl] Dining',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '[nl] Fuel and gas',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '[nl] Government and non-profits',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '[nl] Groceries',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: '[nl] Gyms and fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '[nl] Healthcare',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: '[nl] Hotels',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: '[nl] Internet and phone',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '[nl] Office supplies',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '[nl] Parking and tolls',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: '[nl] Professional services',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '[nl] Retail',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '[nl] Shipping and delivery',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: '[nl] Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '[nl] Transit and rideshare',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '[nl] Travel agencies',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '[nl] Collect',
                    description: '[nl] For teams looking to automate their processes.',
                },
                corporate: {
                    label: '[nl] Control',
                    description: '[nl] For organizations with advanced requirements.',
                },
            },
            description: "[nl] Choose a plan that's right for you. For a detailed list of features and pricing, check out our",
            subscriptionLink: '[nl] plan types and pricing help page',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `[nl] You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `[nl] You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: '[nl] Subscriptions',
        },
    },
    getAssistancePage: {
        title: '[nl] Get assistance',
        subtitle: "[nl] We're here to clear your path to greatness!",
        description: '[nl] Choose from the support options below:',
        chatWithConcierge: '[nl] Chat with Concierge',
        scheduleSetupCall: '[nl] Schedule a setup call',
        scheduleACall: '[nl] Schedule call',
        questionMarkButtonTooltip: '[nl] Get assistance from our team',
        exploreHelpDocs: '[nl] Explore help docs',
        registerForWebinar: '[nl] Register for webinar',
        onboardingHelp: '[nl] Onboarding help',
    },
    emojiPicker: {
        emojiNotSelected: '[nl] Emoji not selected',
        skinTonePickerLabel: '[nl] Change default skin tone',
        headers: {
            frequentlyUsed: '[nl] Frequently Used',
            smileysAndEmotion: '[nl] Smileys & Emotion',
            peopleAndBody: '[nl] People & Body',
            animalsAndNature: '[nl] Animals & Nature',
            foodAndDrink: '[nl] Food & Drinks',
            travelAndPlaces: '[nl] Travel & Places',
            activities: '[nl] Activities',
            objects: '[nl] Objects',
            symbols: '[nl] Symbols',
            flags: '[nl] Flags',
        },
    },
    newRoomPage: {
        newRoom: '[nl] New room',
        groupName: '[nl] Group name',
        roomName: '[nl] Room name',
        visibility: '[nl] Visibility',
        restrictedDescription: '[nl] People in your workspace can find this room',
        privateDescription: '[nl] People invited to this room can find it',
        publicDescription: '[nl] Anyone can find this room',
        public_announceDescription: '[nl] Anyone can find this room',
        createRoom: '[nl] Create room',
        roomAlreadyExistsError: '[nl] A room with this name already exists',
        roomNameReservedError: (reservedName: string) => `[nl] ${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '[nl] Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: '[nl] Please enter a room name',
        pleaseSelectWorkspace: '[nl] Please select a workspace',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `[nl] ${actor}renamed to "${newName}" (previously "${oldName}")` : `[nl] ${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: (newName: string) => `[nl] Room renamed to ${newName}`,
        social: '[nl] social',
        selectAWorkspace: '[nl] Select a workspace',
        growlMessageOnRenameError: '[nl] Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: '[nl] Workspace',
            private: '[nl] Private',
            public: '[nl] Public',
            public_announce: '[nl] Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '[nl] Submit and Close',
        submitAndApprove: '[nl] Submit and Approve',
        advanced: '[nl] ADVANCED',
        dynamicExternal: '[nl] DYNAMIC_EXTERNAL',
        smartReport: '[nl] SMARTREPORT',
        billcom: '[nl] BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[nl] set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[nl] removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `[nl] changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `[nl] changed the company address to "${newAddress}" (previously "${previousAddress}")` : `[nl] set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[nl] added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[nl] removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `[nl] changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `[nl] added the category "${categoryName}"`,
        deleteCategory: (categoryName: string) => `[nl] removed the category "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `[nl] ${oldValue ? '[nl] disabled' : '[nl] enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[nl] added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[nl] removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[nl] changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[nl] added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[nl] removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[nl] changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `[nl] changed the "${categoryName}" category description to ${!oldValue ? '[nl] required' : '[nl] not required'} (previously ${!oldValue ? '[nl] not required' : '[nl] required'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `[nl] added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `[nl] removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `[nl] changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[nl] added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `[nl] changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[nl] updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `[nl] changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `[nl] updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `[nl] changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `[nl] renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `[nl] removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }
            return !oldValue
                ? `[nl] added the description hint "${newValue}" to the category "${categoryName}"`
                : `[nl] changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategories: (count: number) => `[nl] updated ${count} categories`,
        updateTagListName: (oldName: string, newName: string) => `[nl] changed the tag list name to "${newName}" (previously "${oldName}")`,
        updateTagList: (tagListName: string) => `[nl] updated tags on the list "${tagListName}"`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `[nl] changed tag list "${tagListsName}" to ${isRequired ? '[nl] required' : '[nl] not required'}`,
        importTags: '[nl] imported tags from a spreadsheet',
        deletedAllTags: '[nl] deleted all tags',
        addTag: (tagListName: string, tagName?: string) => `[nl] added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `[nl] updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `[nl] removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `[nl] removed "${count}" tags from the list "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `[nl] updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `[nl] updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `[nl] changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `[nl] ${newValue ? '[nl] enabled' : '[nl] disabled'} tax tracking on distance rates`,
        updateCustomUnitDefaultCategory: ({customUnitName, newValue, oldValue}: UpdatePolicyCustomUnitDefaultCategoryParams) =>
            `[nl] changed the ${customUnitName} default category to "${newValue}" ${oldValue ? `[nl] (previously "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `[nl] imported rates for custom unit "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `[nl] added a new ${customUnitName} rate "${rateName}"`,
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `[nl] removed the "${customUnitName}" rate "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `[nl] changed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${customUnitSubRateName}" ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `[nl] removed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${removedSubRateName}"`,
        addedReportField: ({fieldType, fieldName, defaultValue}: AddedOrDeletedPolicyReportFieldParams) =>
            `[nl] added ${fieldType} report field "${fieldName}"${defaultValue ? `[nl]  with default value "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `[nl] changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `[nl] changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `[nl] added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `[nl] changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `[nl] added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `[nl] ${newValue ? '[nl] enabled' : '[nl] disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `[nl] set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `[nl] added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `[nl] removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `[nl] ${optionEnabled ? '[nl] enabled' : '[nl] disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `[nl] ${allEnabled ? '[nl] enabled' : '[nl] disabled'} all options for the report field "${fieldName}" `;
            }
            return `[nl] ${allEnabled ? '[nl] enabled' : '[nl] disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? '[nl] enabled' : '[nl] disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `[nl] removed ${fieldType} Report Field "${fieldName}"`,
        addedCardFeed: (feedName: string) => `[nl] added card feed "${feedName}"`,
        removedCardFeed: (feedName: string) => `[nl] removed card feed "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `[nl] renamed card feed to "${newName}" (previously "${oldName}")`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) => `[nl] assigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[nl] unassigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} cardholders to delete card transactions for card feed "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `[nl] changed card feed "${feedName}" statement period end day${newValue ? `[nl]  to "${newValue}"` : ''}${previousValue ? `[nl]  (previously "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `[nl] updated "Prevent self-approval" to "${newValue === 'true' ? '[nl] Enabled' : '[nl] Disabled'}" (previously "${oldValue === 'true' ? '[nl] Enabled' : '[nl] Disabled'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `[nl] set the monthly report submission date to "${newValue}"`;
            }
            return `[nl] updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `[nl] updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `[nl] updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `[nl] turned "Enforce default report titles" ${value ? '[nl] on' : '[nl] off'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `[nl] changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `[nl] updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `[nl] set the description of this workspace to "${newDescription}"`
                : `[nl] updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('[nl]  and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `[nl] removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `[nl] removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `[nl] updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `[nl] updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `[nl] updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `[nl] updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: '[nl] upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `[nl] This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: '[nl] downgraded this workspace to the Collect plan',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `[nl] changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `[nl] changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        addBudget: ({frequency, entityName, entityType, shared, individual, notificationThreshold}: AddBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[nl]  with notification threshold of "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `[nl] added ${frequency} individual budget of "${individual}" and ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            if (typeof individual !== 'undefined') {
                return `[nl] added ${frequency} individual budget of "${individual}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            return `[nl] added ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
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
                changesList.push(`[nl] changed budget frequency to "${newFrequency}" (previously "${oldFrequency}")`);
            }
            if (sharedChanged) {
                changesList.push(`[nl] changed total workspace budget to "${newShared}" (previously "${oldShared}")`);
            }
            if (individualChanged) {
                changesList.push(`[nl] changed individual budget to "${newIndividual}" (previously "${oldIndividual}")`);
            }
            if (thresholdChanged) {
                changesList.push(`[nl] changed notification threshold to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `[nl] updated budget for the ${entityType} "${entityName}"`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `[nl] changed budget frequency for the ${entityType} "${entityName}" to "${newFrequency}" (previously "${oldFrequency}")`;
                }
                if (sharedChanged) {
                    return `[nl] changed total workspace budget for the ${entityType} "${entityName}" to "${newShared}" (previously "${oldShared}")`;
                }
                if (individualChanged) {
                    return `[nl] changed individual budget for the ${entityType} "${entityName}" to "${newIndividual}" (previously "${oldIndividual}")`;
                }
                return `[nl] changed notification threshold for the ${entityType} "${entityName}" to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`;
            }
            return `[nl] updated budget for the ${entityType} "${entityName}": ${changesList.join('; ')}`;
        },
        deleteBudget: ({entityType, entityName, frequency, individual, shared, notificationThreshold}: DeleteBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[nl]  with notification threshold of "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `[nl] removed ${frequency} shared budget of "${shared}" and individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (shared) {
                return `[nl] removed ${frequency} shared budget of "${shared}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `[nl] removed ${frequency} individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            return `[nl] removed budget from the ${entityType} "${entityName}"`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} time tracking`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `[nl] changed hourly rate to "${newRate}" (previously "${oldRate}")`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[nl] added "${prohibitedExpense}" to prohibited expenses`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[nl] removed "${prohibitedExpense}" from prohibited expenses`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `[nl] changed reimbursement method to "${newReimbursementChoice}" (previously "${oldReimbursementChoice}")`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} pre-approval of workspace join requests`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `[nl] changed custom report name formula to "${newDefaultTitle}" (previously "${oldDefaultTitle}")`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `[nl] took over ownership of ${policyName} from ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} scheduled submit`,
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
            `[nl] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". ${userEmail} is currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}.${summaryLink ? `[nl]  <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
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
            `[nl] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". You're currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}. ${summaryLink ? `[nl] <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} categories`;
                case 'tags':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} tags`;
                case 'workflows':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} workflows`;
                case 'distance rates':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} distance rates`;
                case 'accounting':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} accounting`;
                case 'Expensify Cards':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} Expensify Cards`;
                case 'travel invoicing':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} travel invoicing`;
                case 'company cards':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} company cards`;
                case 'invoicing':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} invoicing`;
                case 'per diem':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} per diem`;
                case 'receipt partners':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} receipt partners`;
                case 'rules':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} rules`;
                case 'tax tracking':
                    return `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} tax tracking`;
                default:
                    return `${enabled ? '[nl] enabled' : '[nl] disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} attendee tracking`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} auto-pay approved reports`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `[nl] set the auto-pay approved reports threshold to "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `[nl] changed the auto-pay approved reports threshold to "${newLimit}" (previously "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: '[nl] removed the auto-pay approved reports threshold',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `[nl] changed the default approver to ${newApprover} (previously ${previousApprover})` : `[nl] changed the default approver to ${newApprover}`,
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
            let text = `[nl] changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `[nl]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[nl]  (previously default approver)';
            } else if (previousApprover) {
                text += `[nl]  (previously ${previousApprover})`;
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
                ? `[nl] changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `[nl] changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += `[nl]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[nl]  (previously default approver)';
            } else if (previousApprover) {
                text += `[nl]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[nl] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `[nl] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[nl] changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `[nl] changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[nl] changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `[nl] set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[nl] changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `[nl] set the invoice company website to "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser ? `[nl] changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")` : `[nl] changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: (enabled: boolean) => `[nl] ${enabled ? '[nl] enabled' : '[nl] disabled'} reimbursements`,
        updateCustomTaxName: ({oldName, newName}: UpdatedPolicyCustomTaxNameParams) => `[nl] changed the custom tax name to "${newName}" (previously "${oldName}")`,
        updateCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyCurrencyDefaultTaxParams) =>
            `[nl] changed the workspace currency default tax rate to "${newName}" (previously "${oldName}")`,
        updateForeignCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyForeignCurrencyDefaultTaxParams) =>
            `[nl] changed the foreign currency default tax rate to "${newName}" (previously "${oldName}")`,
        addTax: (taxName: string) => `[nl] added the tax "${taxName}"`,
        deleteTax: (taxName: string) => `[nl] removed the tax "${taxName}"`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `[nl] renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `[nl] changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `[nl] changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `[nl] ${oldValue ? '[nl] disabled' : '[nl] enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `[nl] set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[nl] changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: (oldValue: string) => `[nl] removed receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `[nl] set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `[nl] changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: (oldValue: string) => `[nl] removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: (newValue: string) => `[nl] set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `[nl] changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `[nl] removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: '[nl] Member not found.',
        useInviteButton: '[nl] To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `[nl] You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `[nl] It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `[nl] Are you sure you want to remove ${memberName} from the room?`,
            other: '[nl] Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: '[nl] There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: '[nl] Assign task',
        assignMe: '[nl] Assign to me',
        confirmTask: '[nl] Confirm task',
        confirmError: '[nl] Please enter a title and select a share destination',
        descriptionOptional: '[nl] Description (optional)',
        pleaseEnterTaskName: '[nl] Please enter a title',
        pleaseEnterTaskDestination: '[nl] Please select where you want to share this task',
    },
    task: {
        task: '[nl] Task',
        title: '[nl] Title',
        description: '[nl] Description',
        assignee: '[nl] Assignee',
        completed: '[nl] Completed',
        action: '[nl] Complete',
        messages: {
            created: (title: string) => `[nl] task for ${title}`,
            completed: '[nl] marked as complete',
            canceled: '[nl] deleted task',
            reopened: '[nl] marked as incomplete',
            error: "[nl] You don't have permission to take the requested action",
        },
        markAsComplete: '[nl] Mark as complete',
        markAsIncomplete: '[nl] Mark as incomplete',
        assigneeError: '[nl] An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: '[nl] There was an error creating this task. Please try again later.',
        deleteTask: '[nl] Delete task',
        deleteConfirmation: '[nl] Are you sure you want to delete this task?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `[nl] ${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '[nl] Keyboard shortcuts',
        subtitle: '[nl] Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: '[nl] Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: '[nl] Mark all messages as read',
            escape: '[nl] Escape dialogs',
            search: '[nl] Open search dialog',
            newChat: '[nl] New chat screen',
            copy: '[nl] Copy comment',
            openDebug: '[nl] Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: '[nl] Screen share',
        screenShareRequest: '[nl] Expensify is inviting you to a screen share',
    },
    search: {
        resultsAreLimited: '[nl] Search results are limited.',
        viewResults: '[nl] View results',
        appliedFilters: '[nl] Applied filters',
        resetFilters: '[nl] Reset filters',
        searchResults: {
            emptyResults: {
                title: '[nl] Nothing to show',
                subtitle: `[nl] Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "[nl] You haven't created any expenses yet",
                subtitle: '[nl] Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[nl] Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "[nl] You haven't created any reports yet",
                subtitle: '[nl] Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[nl] Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    [nl] You haven't created any
                    invoices yet
                `),
                subtitle: '[nl] Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[nl] Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: '[nl] No trips to display',
                subtitle: '[nl] Get started by booking your first trip below.',
                buttonText: '[nl] Book a trip',
            },
            emptySubmitResults: {
                title: '[nl] No expenses to submit',
                subtitle: "[nl] You're all clear. Take a victory lap!",
                buttonText: '[nl] Create report',
            },
            emptyApproveResults: {
                title: '[nl] No expenses to approve',
                subtitle: '[nl] Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: '[nl] No expenses to pay',
                subtitle: '[nl] Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: '[nl] No expenses to export',
                subtitle: '[nl] Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: '[nl] No expenses to display',
                subtitle: '[nl] No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: '[nl] No expenses to approve',
                subtitle: '[nl] Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: '[nl] Columns',
        editColumns: '[nl] Edit columns',
        resetColumns: '[nl] Reset columns',
        groupColumns: '[nl] Group columns',
        expenseColumns: '[nl] Expense Columns',
        statements: '[nl] Statements',
        cardStatements: '[nl] Card statements',
        monthlyAccrual: '[nl] Monthly accrual',
        unapprovedCash: '[nl] Unapproved cash',
        unapprovedCard: '[nl] Unapproved card',
        reconciliation: '[nl] Reconciliation',
        topSpenders: '[nl] Top spenders',
        saveSearch: '[nl] Save search',
        deleteSavedSearch: '[nl] Delete saved search',
        deleteSavedSearchConfirm: '[nl] Are you sure you want to delete this search?',
        searchName: '[nl] Search name',
        savedSearchesMenuItemTitle: '[nl] Saved',
        topCategories: '[nl] Top categories',
        topMerchants: '[nl] Top merchants',
        spendOverTime: '[nl] Spend over time',
        groupedExpenses: '[nl] grouped expenses',
        bulkActions: {
            editMultiple: '[nl] Edit multiple',
            editMultipleTitle: '[nl] Edit multiple expenses',
            editMultipleDescription: "[nl] Changes will be set for all selected expenses and will override any previously set values. Just sayin'.",
            approve: '[nl] Approve',
            pay: '[nl] Pay',
            delete: '[nl] Delete',
            hold: '[nl] Hold',
            unhold: '[nl] Remove hold',
            reject: '[nl] Reject',
            duplicateExpense: ({count}: {count: number}) => `[nl] Duplicate ${count === 1 ? '[nl] expense' : '[nl] expenses'}`,
            noOptionsAvailable: '[nl] No options available for the selected group of expenses.',
        },
        filtersHeader: '[nl] Filters',
        filters: {
            date: {
                before: (date?: string) => `[nl] Before ${date ?? ''}`,
                after: (date?: string) => `[nl] After ${date ?? ''}`,
                on: (date?: string) => `[nl] On ${date ?? ''}`,
                customDate: '[nl] Custom date',
                customRange: '[nl] Custom range',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '[nl] Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '[nl] Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '[nl] This month',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '[nl] Year to date',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '[nl] Last 12 months',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '[nl] Last statement',
                },
            },
            status: '[nl] Status',
            keyword: '[nl] Keyword',
            keywords: '[nl] Keywords',
            limit: '[nl] Limit',
            limitDescription: '[nl] Set a limit for the results of your search.',
            currency: '[nl] Currency',
            completed: '[nl] Completed',
            amount: {
                lessThan: (amount?: string) => `[nl] Less than ${amount ?? ''}`,
                greaterThan: (amount?: string) => `[nl] Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `[nl] Between ${greaterThan} and ${lessThan}`,
                equalTo: (amount?: string) => `[nl] Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: '[nl] Expensify',
                individualCards: '[nl] Individual cards',
                closedCards: '[nl] Closed cards',
                cardFeeds: '[nl] Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `[nl] All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `[nl] All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `[nl] ${name} is ${value}`,
            current: '[nl] Current',
            past: '[nl] Past',
            submitted: '[nl] Submitted',
            approved: '[nl] Approved',
            paid: '[nl] Paid',
            exported: '[nl] Exported',
            posted: '[nl] Posted',
            withdrawn: '[nl] Withdrawn',
            billable: '[nl] Billable',
            reimbursable: '[nl] Reimbursable',
            purchaseCurrency: '[nl] Purchase currency',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '[nl] From',
                [CONST.SEARCH.GROUP_BY.CARD]: '[nl] Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[nl] Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '[nl] Category',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '[nl] Merchant',
                [CONST.SEARCH.GROUP_BY.TAG]: '[nl] Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: '[nl] Month',
                [CONST.SEARCH.GROUP_BY.WEEK]: '[nl] Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: '[nl] Year',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '[nl] Quarter',
            },
            feed: '[nl] Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: '[nl] Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '[nl] Reimbursement',
            },
            is: '[nl] Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '[nl] Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '[nl] Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '[nl] Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '[nl] Export',
            },
        },
        display: {
            label: '[nl] Display',
            sortBy: '[nl] Sort by',
            groupBy: '[nl] Group by',
            limitResults: '[nl] Limit results',
        },
        has: '[nl] Has',
        view: {
            label: '[nl] View',
            table: '[nl] Table',
            bar: '[nl] Bar',
            line: '[nl] Line',
            pie: '[nl] Pie',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '[nl] From',
            [CONST.SEARCH.GROUP_BY.CARD]: '[nl] Cards',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[nl] Exports',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '[nl] Categories',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '[nl] Merchants',
            [CONST.SEARCH.GROUP_BY.TAG]: '[nl] Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: '[nl] Months',
            [CONST.SEARCH.GROUP_BY.WEEK]: '[nl] Weeks',
            [CONST.SEARCH.GROUP_BY.YEAR]: '[nl] Years',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '[nl] Quarters',
        },
        moneyRequestReport: {
            emptyStateTitle: '[nl] This report has no expenses.',
            accessPlaceHolder: '[nl] Open for details',
        },
        noCategory: '[nl] No category',
        noMerchant: '[nl] No merchant',
        noTag: '[nl] No tag',
        expenseType: '[nl] Expense type',
        withdrawalType: '[nl] Withdrawal type',
        recentSearches: '[nl] Recent searches',
        recentChats: '[nl] Recent chats',
        searchIn: '[nl] Search in',
        searchPlaceholder: '[nl] Search for something',
        suggestions: '[nl] Suggestions',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `[nl] Suggestions available${query ? `[nl]  for ${query}` : ''}. ${count} result.`,
            other: (resultCount: number) => `[nl] Suggestions available${query ? `[nl]  for ${query}` : ''}. ${resultCount} results.`,
        }),
        exportSearchResults: {
            title: '[nl] Create export',
            description: "[nl] Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: '[nl] Exported to',
        exportAll: {
            selectAllMatchingItems: '[nl] Select all matching items',
            allMatchingItemsSelected: '[nl] All matching items selected',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: '[nl] Please select dates for both From and To',
        },
    },
    genericErrorPage: {
        title: '[nl] Uh-oh, something went wrong!',
        body: {
            helpTextMobile: '[nl] Please close and reopen the app, or switch to',
            helpTextWeb: '[nl] web.',
            helpTextConcierge: '[nl] If the problem persists, reach out to',
        },
        refresh: '[nl] Refresh',
    },
    fileDownload: {
        success: {
            title: '[nl] Downloaded!',
            message: '[nl] Attachment successfully downloaded!',
            qrMessage: '[nl] Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: '[nl] Attachment error',
            message: "[nl] Attachment can't be downloaded",
        },
        permissionError: {
            title: '[nl] Storage access',
            message: "[nl] Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: '[nl] Pending',
            cleared: '[nl] Cleared',
            failed: '[nl] Failed',
        },
        failedError: ({link}: {link: string}) => `[nl] We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `[nl] ${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '[nl] Report layout',
        groupByLabel: '[nl] Group by:',
        selectGroupByOption: '[nl] Select how to group report expenses',
        uncategorized: '[nl] Uncategorized',
        noTag: '[nl] No tag',
        selectGroup: ({groupName}: {groupName: string}) => `[nl] Select all expenses in ${groupName}`,
        groupBy: {
            category: '[nl] Category',
            tag: '[nl] Tag',
        },
    },
    report: {
        newReport: {
            createExpense: '[nl] Create expense',
            createReport: '[nl] Create report',
            chooseWorkspace: '[nl] Choose a workspace for this report.',
            emptyReportConfirmationTitle: '[nl] You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `[nl] Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationPromptLink: '[nl] Reports',
            emptyReportConfirmationDontShowAgain: "[nl] Don't show me this again",
            genericWorkspaceName: '[nl] this workspace',
        },
        genericCreateReportFailureMessage: '[nl] Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: '[nl] Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: '[nl] Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: '[nl] Unexpected error renaming the report. Please try again later.',
        noActivityYet: '[nl] No activity yet',
        connectionSettings: '[nl] Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `[nl] changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `[nl] set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `[nl] changed the workspace${fromPolicyName ? `[nl]  (previously ${fromPolicyName})` : ''}`;
                    }
                    return `[nl] changed the workspace to ${toPolicyName}${fromPolicyName ? `[nl]  (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `[nl] changed type from ${oldType} to ${newType}`,
                exportedToCSV: `[nl] exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `[nl] exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `[nl] exported to ${label} via`,
                    automaticActionTwo: '[nl] accounting settings',
                    manual: (label: string) => `[nl] marked this report as manually exported to ${label}.`,
                    automaticActionThree: '[nl] and successfully created a record for',
                    reimburseableLink: '[nl] out-of-pocket expenses',
                    nonReimbursableLink: '[nl] company card expenses',
                    pending: (label: string) => `[nl] started exporting this report to ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `[nl] failed to export this report to ${label} ("${errorMessage}${linkText ? `[nl]  <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `[nl] added a receipt`,
                managerDetachReceipt: `[nl] removed a receipt`,
                markedReimbursed: (amount: string, currency: string) => `[nl] paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `[nl] paid ${currency}${amount} via integration`,
                outdatedBankAccount: `[nl] couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounceDefault: `[nl] couldn't process the payment due to an incorrect routing/account number or closed account`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `[nl] couldn't process the payment: ${returnReason}`,
                reimbursementACHCancelled: `[nl] canceled the payment`,
                reimbursementAccountChanged: `[nl] couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `[nl] processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `[nl] randomly selected for review`,
                selectedForRandomAuditMarkdown: `[nl] [randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `[nl] invited member ${to}`,
                unshare: ({to}: UnshareParams) => `[nl] removed member ${to}`,
                stripePaid: (amount: string, currency: string) => `[nl] paid ${currency}${amount}`,
                takeControl: `[nl] took control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `[nl] Open the Expensify mobile app to review your ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}transaction`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `[nl] there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `[nl] The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `[nl] the Plaid connection to your business bank account is broken. Please <a href='${walletRoute}'>reconnect your bank account ${maskedAccountNumber}</a> so you can continue to use your Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `[nl] ${email} joined via the workspace invite link` : `[nl] added ${email} as ${role === 'member' ? '[nl] a' : '[nl] an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `[nl] updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[nl] removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[nl] added "${newValue}" to ${email}’s custom field 1`
                        : `[nl] changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[nl] removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[nl] added "${newValue}" to ${email}’s custom field 2`
                        : `[nl] changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `[nl] ${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `[nl] removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `[nl] removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `[nl] connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '[nl] left the chat',
                leftTheChatWithName: (nameOrEmail: string) => `[nl] ${nameOrEmail ? `${nameOrEmail}: ` : ''}left the chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `[nl] business bank account ${maskedBankAccountNumber} has been automatically locked due to an issue with either Reimbursement or Expensify Card settlement. Please fix the issue in your <a href="${linkURL}">workspace settings</a>.`,
            },
            error: {
                invalidCredentials: '[nl] Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `[nl] ${summary} for ${dayCount} ${dayCount === 1 ? '[nl] day' : '[nl] days'} until ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `[nl] ${summary} from ${timePeriod} on ${date}`,
        startTimer: '[nl] Start Timer',
        stopTimer: '[nl] Stop Timer',
    },
    footer: {
        features: '[nl] Features',
        expenseManagement: '[nl] Expense Management',
        spendManagement: '[nl] Spend Management',
        expenseReports: '[nl] Expense Reports',
        companyCreditCard: '[nl] Company Credit Card',
        receiptScanningApp: '[nl] Receipt Scanning App',
        billPay: '[nl] Bill Pay',
        invoicing: '[nl] Invoicing',
        CPACard: '[nl] CPA Card',
        payroll: '[nl] Payroll',
        travel: '[nl] Travel',
        resources: '[nl] Resources',
        expensifyApproved: '[nl] ExpensifyApproved!',
        pressKit: '[nl] Press Kit',
        support: '[nl] Support',
        expensifyHelp: '[nl] ExpensifyHelp',
        terms: '[nl] Terms of Service',
        privacy: '[nl] Privacy',
        learnMore: '[nl] Learn More',
        aboutExpensify: '[nl] About Expensify',
        blog: '[nl] Blog',
        jobs: '[nl] Jobs',
        expensifyOrg: '[nl] Expensify.org',
        investorRelations: '[nl] Investor Relations',
        getStarted: '[nl] Get Started',
        createAccount: '[nl] Create A New Account',
        logIn: '[nl] Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '[nl] Navigate back to chats list',
        chatWelcomeMessage: '[nl] Chat welcome message',
        navigatesToChat: '[nl] Navigates to a chat',
        newMessageLineIndicator: '[nl] New message line indicator',
        chatMessage: '[nl] Chat message',
        lastChatMessagePreview: '[nl] Last chat message preview',
        workspaceName: '[nl] Workspace name',
        chatUserDisplayNames: '[nl] Chat member display names',
        scrollToNewestMessages: '[nl] Scroll to newest messages',
        preStyledText: '[nl] Pre-styled text',
        viewAttachment: '[nl] View attachment',
        contextMenuAvailable: '[nl] Context menu available. Press Shift+F10 to open.',
        contextMenuAvailableMacOS: '[nl] Context menu available. Press VO-Shift-M to open.',
        contextMenuAvailableNative: '[nl] Context menu available. Double-tap and hold to open.',
        selectAllFeatures: '[nl] Select all features',
        selectAllTransactions: '[nl] Select all transactions',
        selectAllItems: '[nl] Select all items',
    },
    parentReportAction: {
        deletedReport: '[nl] Deleted report',
        deletedMessage: '[nl] Deleted message',
        deletedExpense: '[nl] Deleted expense',
        reversedTransaction: '[nl] Reversed transaction',
        deletedTask: '[nl] Deleted task',
        hiddenMessage: '[nl] Hidden message',
    },
    threads: {
        thread: '[nl] Thread',
        replies: '[nl] Replies',
        reply: '[nl] Reply',
        from: '[nl] From',
        in: '[nl] in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `[nl] From ${reportName}${workspaceName ? `[nl]  in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: '[nl] QR code',
        copy: '[nl] Copy URL',
        copied: '[nl] Copied!',
    },
    moderation: {
        flagDescription: '[nl] All flagged messages will be sent to a moderator for review.',
        chooseAReason: '[nl] Choose a reason for flagging below:',
        spam: '[nl] Spam',
        spamDescription: '[nl] Unsolicited off-topic promotion',
        inconsiderate: '[nl] Inconsiderate',
        inconsiderateDescription: '[nl] Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: '[nl] Intimidation',
        intimidationDescription: '[nl] Aggressively pursuing an agenda over valid objections',
        bullying: '[nl] Bullying',
        bullyingDescription: '[nl] Targeting an individual to obtain obedience',
        harassment: '[nl] Harassment',
        harassmentDescription: '[nl] Racist, misogynistic, or other broadly discriminatory behavior',
        assault: '[nl] Assault',
        assaultDescription: '[nl] Specifically targeted emotional attack with the intention of harm',
        flaggedContent: '[nl] This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: '[nl] Hide message',
        revealMessage: '[nl] Reveal message',
        levelOneResult: '[nl] Sends anonymous warning and message is reported for review.',
        levelTwoResult: '[nl] Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: '[nl] Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '[nl] Invite to submit expenses',
        inviteToChat: '[nl] Invite to chat only',
        nothing: '[nl] Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '[nl] Accept',
        decline: '[nl] Decline',
    },
    actionableMentionTrackExpense: {
        submit: '[nl] Submit it to someone',
        categorize: '[nl] Categorize it',
        share: '[nl] Share it with my accountant',
        nothing: '[nl] Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: '[nl] Teachers Unite',
        joinExpensifyOrg:
            '[nl] Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: '[nl] I know a teacher',
        iAmATeacher: '[nl] I am a teacher',
        personalKarma: {
            title: '[nl] Enable Personal Karma',
            description: '[nl] Donate $1 to Expensify.org for every $500 you spend each month',
            stopDonationsPrompt: '[nl] Are you sure you want to stop donating to Expensify.org?',
        },
        getInTouch: '[nl] Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: '[nl] Intro to your school principal',
        schoolPrincipalVerifyExpense:
            '[nl] Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: '[nl] Principal first name',
        principalLastName: '[nl] Principal last name',
        principalWorkEmail: '[nl] Principal work email',
        updateYourEmail: '[nl] Update your email address',
        updateEmail: '[nl] Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `[nl] Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: '[nl] Enter a valid email or phone number',
            enterEmail: '[nl] Enter an email',
            enterValidEmail: '[nl] Enter a valid email',
            tryDifferentEmail: '[nl] Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: '[nl] Not activated',
        outOfPocket: '[nl] Reimbursable',
        companySpend: '[nl] Non-reimbursable',
        personalCard: '[nl] Personal card',
        companyCard: '[nl] Company card',
        expensifyCard: '[nl] Expensify Card',
    },
    distance: {
        addStop: '[nl] Add stop',
        address: '[nl] Address',
        waypointDescription: {
            start: '[nl] Start',
            stop: '[nl] Stop',
        },
        mapPending: {
            title: '[nl] Map pending',
            subtitle: '[nl] The map will be generated when you go back online',
            onlineSubtitle: '[nl] One moment while we set up the map',
            errorTitle: '[nl] Map error',
            errorSubtitle: '[nl] There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: '[nl] Please select a suggested address or use current location',
        },
        odometer: {
            startReading: '[nl] Start reading',
            endReading: '[nl] End reading',
            saveForLater: '[nl] Save for later',
            totalDistance: '[nl] Total distance',
            startTitle: '[nl] Odometer start photo',
            endTitle: '[nl] Odometer end photo',
            deleteOdometerPhoto: '[nl] Delete odometer photo',
            deleteOdometerPhotoConfirmation: '[nl] Are you sure you want to delete this odometer photo?',
            startMessageWeb: '[nl] Add a photo of your odometer from the <strong>start</strong> of your trip. Drag a file here or choose one to upload.',
            endMessageWeb: '[nl] Add a photo of your odometer from the <strong>end</strong> of your trip. Drag a file here or choose one to upload.',
            cameraAccessRequired: '[nl] Camera access is required to take pictures.',
            snapPhotoStart: '[nl] <muted-text-label>Snap a photo of your odometer at the <strong>start</strong> of your trip.</muted-text-label>',
            snapPhotoEnd: '[nl] <muted-text-label>Snap a photo of your odometer at the <strong>end</strong> of your trip.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '[nl] Failed to start location tracking.',
            failedToGetPermissions: '[nl] Failed to get required location permissions.',
        },
        trackingDistance: '[nl] Tracking distance...',
        stopped: '[nl] Stopped',
        start: '[nl] Start',
        stop: '[nl] Stop',
        discard: '[nl] Discard',
        stopGpsTrackingModal: {
            title: '[nl] Stop GPS tracking',
            prompt: '[nl] Are you sure? This will end your current journey.',
            cancel: '[nl] Resume tracking',
            confirm: '[nl] Stop GPS tracking',
        },
        discardDistanceTrackingModal: {
            title: '[nl] Discard distance tracking',
            prompt: "[nl] Are you sure? This will discard your current journey and can't be undone.",
            confirm: '[nl] Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "[nl] Can't create expense",
            prompt: "[nl] You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: '[nl] Location access required',
            prompt: '[nl] Please allow location access in your device settings to start GPS distance tracking.',
            allow: '[nl] Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: '[nl] Background location access required',
            prompt: '[nl] Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: '[nl] Precise location required',
            prompt: '[nl] Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: '[nl] Track distance on your phone',
            subtitle: '[nl] Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: '[nl] Download the app',
        },
        notification: {
            title: '[nl] GPS tracking in progress',
            body: '[nl] Go to the app to finish',
        },
        continueGpsTripModal: {
            title: '[nl] Continue GPS trip recording?',
            prompt: '[nl] Looks like the app closed during your last GPS trip. Would you like to continue recording from that trip?',
            confirm: '[nl] Continue trip',
            cancel: '[nl] View trip',
        },
        signOutWarningTripInProgress: {
            title: '[nl] GPS tracking in progress',
            prompt: '[nl] Are you sure you want to discard the trip and sign out?',
            confirm: '[nl] Discard and sign out',
        },
        switchToODWarningTripInProgress: {
            title: '[nl] GPS tracking in progress',
            prompt: '[nl] Are you sure you want to stop GPS tracking and switch to Expensify Classic?',
            confirm: '[nl] Stop and switch',
        },
        switchAccountWarningTripInProgress: {
            title: '[nl] GPS tracking in progress',
            prompt: '[nl] Are you sure you want to stop GPS tracking and switch accounts?',
            confirm: '[nl] Stop and switch',
        },
        locationServicesRequiredModal: {
            title: '[nl] Location access required',
            confirm: '[nl] Open settings',
            prompt: '[nl] Please allow location access in your device settings to start GPS distance tracking.',
        },
        gpsFloatingPillText: '[nl] GPS tracking in progress...',
        liveActivity: {
            subtitle: '[nl] Tracking distance',
            button: '[nl] View progress',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '[nl] Report card lost or damaged',
        nextButtonLabel: '[nl] Next',
        reasonTitle: '[nl] Why do you need a new card?',
        cardDamaged: '[nl] My card was damaged',
        cardLostOrStolen: '[nl] My card was lost or stolen',
        confirmAddressTitle: '[nl] Please confirm the mailing address for your new card.',
        cardDamagedInfo: '[nl] Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: '[nl] Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: '[nl] Address',
        deactivateCardButton: '[nl] Deactivate card',
        shipNewCardButton: '[nl] Ship new card',
        addressError: '[nl] Address is required',
        reasonError: '[nl] Reason is required',
        successTitle: '[nl] Your new card is on the way!',
        successDescription: "[nl] You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: '[nl] Guaranteed eReceipt',
        transactionDate: '[nl] Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '[nl] Start a chat, <success><strong>refer a friend</strong></success>.',
            header: '[nl] Start a chat, refer a friend',
            closeAccessibilityLabel: '[nl] Close, start a chat, refer a friend, banner',
            body: "[nl] Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '[nl] Submit an expense, <success><strong>refer your team</strong></success>.',
            header: '[nl] Submit an expense, refer your team',
            closeAccessibilityLabel: '[nl] Close, submit an expense, refer your team, banner',
            body: "[nl] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '[nl] Refer a friend',
            body: "[nl] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '[nl] Refer a friend',
            header: '[nl] Refer a friend',
            body: "[nl] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: '[nl] Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `[nl] Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `[nl] Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: '[nl] All tags required',
        autoReportedRejectedExpense: '[nl] This expense was rejected.',
        billableExpense: '[nl] Billable no longer valid',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `[nl] Receipt required${formattedLimit ? `[nl]  over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '[nl] Category no longer valid',
        conversionSurcharge: (surcharge: number) => `[nl] Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: '[nl] Rate not valid for this workspace',
        duplicatedTransaction: '[nl] Potential duplicate',
        fieldRequired: '[nl] Report fields are required',
        futureDate: '[nl] Future date not allowed',
        invoiceMarkup: (invoiceMarkup: number) => `[nl] Marked up by ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `[nl] Date older than ${maxAge} days`,
        missingCategory: '[nl] Missing category',
        missingComment: '[nl] Description required for selected category',
        missingAttendees: '[nl] Multiple attendees required for this category',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `[nl] Missing ${tagName ?? '[nl] tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '[nl] Amount differs from calculated distance';
                case 'card':
                    return '[nl] Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `[nl] Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return '[nl] Amount greater than scanned receipt';
            }
        },
        modifiedDate: '[nl] Date differs from scanned receipt',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `[nl] Distance exceeds the calculated route of ${formattedRouteDistance}` : '[nl] Distance exceeds the calculated route',
        nonExpensiworksExpense: '[nl] Non-Expensiworks expense',
        overAutoApprovalLimit: (formattedLimit: string) => `[nl] Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `[nl] Amount over ${formattedLimit}/person category limit`,
        overLimit: (formattedLimit: string) => `[nl] Amount over ${formattedLimit}/person limit`,
        overTripLimit: (formattedLimit: string) => `[nl] Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: (formattedLimit: string) => `[nl] Amount over ${formattedLimit}/person limit`,
        perDayLimit: (formattedLimit: string) => `[nl] Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: '[nl] Receipt and expense details added manually.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `[nl] Receipt required over ${formattedLimit} category limit`;
            }
            if (formattedLimit) {
                return `[nl] Receipt required over ${formattedLimit}`;
            }
            if (category) {
                return `[nl] Receipt required over category limit`;
            }
            return '[nl] Receipt required';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `[nl] Itemized receipt required${formattedLimit ? `[nl]  over ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '[nl] Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `[nl] alcohol`;
                    case 'gambling':
                        return `[nl] gambling`;
                    case 'tobacco':
                        return `[nl] tobacco`;
                    case 'adultEntertainment':
                        return `[nl] adult entertainment`;
                    case 'hotelIncidentals':
                        return `[nl] hotel incidentals`;
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
        reviewRequired: '[nl] Review required',
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
                return "[nl] Can't auto-match receipt due to broken bank connection.";
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return "[nl] Can't auto-match receipt due to broken bank connection.";
                }
                return isMarkAsCash
                    ? `[nl] Can't auto-match receipt due to broken card connection. Mark as cash to ignore, or <a href="${connectionLink}">fix the card</a> to match the receipt.`
                    : `[nl] Can't auto-match receipt due to broken card connection. <a href="${connectionLink}">Fix the card</a> to match the receipt.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `[nl] Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : '[nl] Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `[nl] Ask ${member} to mark as a cash or wait 7 days and try again` : '[nl] Awaiting merge with card transaction.';
            }
            return '';
        },
        brokenConnection530Error: '[nl] Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `[nl] <muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: '[nl] Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: '[nl] Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true}) => `[nl] Receipt scanning failed.${canEdit ? '[nl]  Enter details manually.' : ''}`,
        receiptGeneratedWithAI: '[nl] Potential AI-generated receipt',
        someTagLevelsRequired: (tagName?: string) => `[nl] Missing ${tagName ?? '[nl] Tag'}`,
        tagOutOfPolicy: (tagName?: string) => `[nl] ${tagName ?? '[nl] Tag'} no longer valid`,
        taxAmountChanged: '[nl] Tax amount was modified',
        taxOutOfPolicy: (taxName?: string) => `[nl] ${taxName ?? '[nl] Tax'} no longer valid`,
        taxRateChanged: '[nl] Tax rate was modified',
        taxRequired: '[nl] Missing tax rate',
        none: '[nl] None',
        taxCodeToKeep: '[nl] Choose which tax code to keep',
        tagToKeep: '[nl] Choose which tag to keep',
        isTransactionReimbursable: '[nl] Choose if transaction is reimbursable',
        merchantToKeep: '[nl] Choose which merchant to keep',
        descriptionToKeep: '[nl] Choose which description to keep',
        categoryToKeep: '[nl] Choose which category to keep',
        isTransactionBillable: '[nl] Choose if transaction is billable',
        keepThisOne: '[nl] Keep this one',
        confirmDetails: `[nl] Confirm the details you're keeping`,
        confirmDuplicatesInfo: `[nl] The duplicates you don't keep will be held for the submitter to delete.`,
        hold: '[nl] This expense was put on hold',
        resolvedDuplicates: '[nl] resolved the duplicate',
        companyCardRequired: '[nl] Company card purchases required',
        noRoute: '[nl] Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `[nl] ${fieldName} is required`,
        reportContainsExpensesWithViolations: '[nl] Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: '[nl] marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: '[nl] resolved the duplicate',
        },
    },
    videoPlayer: {
        play: '[nl] Play',
        pause: '[nl] Pause',
        fullscreen: '[nl] Fullscreen',
        playbackSpeed: '[nl] Playback speed',
        expand: '[nl] Expand',
        mute: '[nl] Mute',
        unmute: '[nl] Unmute',
        normal: '[nl] Normal',
    },
    exitSurvey: {
        header: '[nl] Before you go',
        reasonPage: {
            title: "[nl] Please tell us why you're leaving",
            subtitle: '[nl] Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[nl] I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "[nl] I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[nl] I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[nl] What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '[nl] What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[nl] Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: '[nl] Your response',
        thankYou: '[nl] Thanks for the feedback!',
        thankYouSubtitle: '[nl] Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: '[nl] Switch to Expensify Classic',
        offlineTitle: "[nl] Looks like you're stuck here...",
        offline:
            "[nl] You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: '[nl] Quick tip...',
        quickTipSubTitle: '[nl] You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: '[nl] Book a call',
        bookACallTitle: '[nl] Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '[nl] Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '[nl] Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '[nl] Travel and expense at the speed of chat',
        },
        bookACallTextTop: '[nl] By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: '[nl] We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: '[nl] Take me to Expensify Classic',
    },
    listBoundary: {
        errorMessage: '[nl] An error occurred while loading more messages',
        tryAgain: '[nl] Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: '[nl] matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: '[nl] Authenticate payment card',
        mobileReducedFunctionalityMessage: '[nl] You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `[nl] Free trial: ${numOfDays} ${numOfDays === 1 ? '[nl] day' : '[nl] days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '[nl] Your payment info is outdated',
                subtitle: (date: string) => `[nl] Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '[nl] Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `[nl] Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : '[nl] Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: '[nl] Your payment info is outdated',
                subtitle: (date: string) => `[nl] Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '[nl] Your payment info is outdated',
                subtitle: '[nl] Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: '[nl] Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `[nl] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: '[nl] Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `[nl] Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: '[nl] Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `[nl] Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: '[nl] Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `[nl] Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: '[nl] Your card is expiring soon',
                subtitle: '[nl] Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: '[nl] Success!',
                subtitle: '[nl] Your card has been billed successfully.',
            },
            retryBillingError: {
                title: '[nl] Your card couldn’t be charged',
                subtitle: '[nl] Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `[nl] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '[nl] Start a free trial',
                subtitle: '[nl] As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: (numOfDays: number) => `[nl] Trial: ${numOfDays} ${numOfDays === 1 ? '[nl] day' : '[nl] days'} left!`,
                subtitle: '[nl] Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: '[nl] Your free trial has ended',
                subtitle: '[nl] Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: '[nl] Claim offer',
                subscriptionPageTitle: (discountType: number) => `[nl] <strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `[nl] Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `[nl] Claim within ${days > 0 ? `[nl] ${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '[nl] Payment',
            subtitle: '[nl] Add a card to pay for your Expensify subscription.',
            addCardButton: '[nl] Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `[nl] Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `[nl] Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `[nl] Card ending in ${cardNumber}`,
            changeCard: '[nl] Change payment card',
            changeCurrency: '[nl] Change payment currency',
            cardNotFound: '[nl] No payment card added',
            retryPaymentButton: '[nl] Retry payment',
            authenticatePayment: '[nl] Authenticate payment',
            requestRefund: '[nl] Request refund',
            requestRefundModal: {
                full: '[nl] Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: '[nl] Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: '[nl] View payment history',
        },
        yourPlan: {
            title: '[nl] Your plan',
            exploreAllPlans: '[nl] Explore all plans',
            customPricing: '[nl] Custom pricing',
            asLowAs: (price: string) => `[nl] as low as ${price} per active member/month`,
            pricePerMemberMonth: (price: string) => `[nl] ${price} per member/month`,
            pricePerMemberPerMonth: (price: string) => `[nl] ${price} per member per month`,
            perMemberMonth: '[nl] per member/month',
            collect: {
                title: '[nl] Collect',
                description: '[nl] The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[nl] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[nl] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[nl] Receipt scanning',
                benefit2: '[nl] Reimbursements',
                benefit3: '[nl] Corporate card management',
                benefit4: '[nl] Expense and travel approvals',
                benefit5: '[nl] Travel booking and rules',
                benefit6: '[nl] QuickBooks/Xero integrations',
                benefit7: '[nl] Chat on expenses, reports, and rooms',
                benefit8: '[nl] AI and human support',
            },
            control: {
                title: '[nl] Control',
                description: '[nl] Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[nl] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[nl] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[nl] Everything in the Collect plan',
                benefit2: '[nl] Multi-level approval workflows',
                benefit3: '[nl] Custom expense rules',
                benefit4: '[nl] ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: '[nl] HR integrations (Workday, Certinia)',
                benefit6: '[nl] SAML/SSO',
                benefit7: '[nl] Custom insights and reporting',
                benefit8: '[nl] Budgeting',
            },
            thisIsYourCurrentPlan: '[nl] This is your current plan',
            downgrade: '[nl] Downgrade to Collect',
            upgrade: '[nl] Upgrade to Control',
            addMembers: '[nl] Add members',
            saveWithExpensifyTitle: '[nl] Save with the Expensify Card',
            saveWithExpensifyDescription: '[nl] Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: '[nl] Learn more',
        },
        compareModal: {
            comparePlans: '[nl] Compare Plans',
            subtitle: `[nl] <muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: '[nl] Subscription details',
            annual: '[nl] Annual subscription',
            taxExempt: '[nl] Request tax exempt status',
            taxExemptEnabled: '[nl] Tax exempt',
            taxExemptStatus: '[nl] Tax exempt status',
            payPerUse: '[nl] Pay-per-use',
            subscriptionSize: '[nl] Subscription size',
            headsUp:
                "[nl] Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: '[nl] Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: '[nl] Subscription size',
            yourSize: '[nl] Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                '[nl] Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: '[nl] Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: '[nl] Confirm your new annual subscription details:',
            subscriptionSize: '[nl] Subscription size',
            activeMembers: (size: number) => `[nl] ${size} active members/month`,
            subscriptionRenews: '[nl] Subscription renews',
            youCantDowngrade: '[nl] You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: (size: number, date: string) =>
                `[nl] You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: '[nl] Please enter a valid subscription size',
                sameSize: '[nl] Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: '[nl] Add payment card',
            enterPaymentCardDetails: '[nl] Enter your payment card details',
            security: '[nl] Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: '[nl] Learn more about our security.',
        },
        expensifyCode: {
            title: '[nl] Expensify code',
            discountCode: '[nl] Discount code',
            enterCode: '[nl] Enter an Expensify code to apply to your subscription.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `[nl] You will get a ${promoDiscount}% discount on your next ${validBillingCycles ? `${validBillingCycles} ` : ''}billing charges.`,
            apply: '[nl] Apply',
            error: {
                invalid: '[nl] This code is invalid',
            },
        },
        subscriptionSettings: {
            title: '[nl] Subscription settings',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `[nl] Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}${expensifyCode ? `[nl] , Expensify code: ${expensifyCode}` : ''}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: '[nl] none',
            on: '[nl] on',
            off: '[nl] off',
            annual: '[nl] Annual',
            autoRenew: '[nl] Auto-renew',
            autoIncrease: '[nl] Auto-increase annual seats',
            saveUpTo: (amountWithCurrency: string) => `[nl] Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                '[nl] Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: '[nl] Disable auto-renew',
            helpUsImprove: '[nl] Help us improve Expensify',
            whatsMainReason: "[nl] What's the main reason you're disabling auto-renew?",
            renewsOn: (date: string) => `[nl] Renews on ${date}.`,
            pricingConfiguration: '[nl] Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `[nl] <muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `[nl] <a href="adminsRoom">#admins room.</a>` : '[nl] #admins room.'}</muted-text>`,
            estimatedPrice: '[nl] Estimated price',
            changesBasedOn: '[nl] This changes based on your Expensify Card usage and the subscription options below.',
            collectBillingDescription: '[nl] Collect workspaces are billed monthly per member, with no annual commitment.',
            pricing: '[nl] Pricing',
        },
        requestEarlyCancellation: {
            title: '[nl] Request early cancellation',
            subtitle: '[nl] What’s the main reason you’re requesting early cancellation?',
            subscriptionCanceled: {
                title: '[nl] Subscription canceled',
                subtitle: '[nl] Your annual subscription has been canceled.',
                info: '[nl] If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `[nl] If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: '[nl] Request submitted',
                subtitle:
                    '[nl] Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `[nl] By requesting early cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: '[nl] Functionality needs improvement',
        tooExpensive: '[nl] Too expensive',
        inadequateSupport: '[nl] Inadequate customer support',
        businessClosing: '[nl] Company closing, downsizing, or acquired',
        additionalInfoTitle: '[nl] What software are you moving to and why?',
        additionalInfoInputLabel: '[nl] Your response',
    },
    roomChangeLog: {
        updateRoomDescription: '[nl] set the room description to:',
        clearRoomDescription: '[nl] cleared the room description',
        changedRoomAvatar: '[nl] changed the room avatar',
        removedRoomAvatar: '[nl] removed the room avatar',
    },
    delegate: {
        switchAccount: '[nl] Switch accounts:',
        copilotDelegatedAccess: '[nl] Copilot: Delegated access',
        copilotDelegatedAccessDescription: '[nl] Allow other members to access your account.',
        learnMoreAboutDelegatedAccess: '[nl] Learn more about delegated access',
        addCopilot: '[nl] Add copilot',
        membersCanAccessYourAccount: '[nl] These members can access your account:',
        youCanAccessTheseAccounts: '[nl] You can access these accounts via the account switcher:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[nl] Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[nl] Limited';
                default:
                    return '';
            }
        },
        genericError: '[nl] Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `[nl] on behalf of ${delegator}`,
        accessLevel: '[nl] Access level',
        confirmCopilot: '[nl] Confirm your copilot below.',
        accessLevelDescription: '[nl] Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[nl] Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[nl] Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: '[nl] Remove copilot',
        removeCopilotConfirmation: '[nl] Are you sure you want to remove this copilot?',
        changeAccessLevel: '[nl] Change access level',
        makeSureItIsYou: "[nl] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[nl] Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `[nl] Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '[nl] Not so fast...',
        noAccessMessage: dedent(`
            [nl] As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `[nl] As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: '[nl] Copilot access',
    },
    debug: {
        debug: '[nl] Debug',
        details: '[nl] Details',
        JSON: '[nl] JSON',
        reportActions: '[nl] Actions',
        reportActionPreview: '[nl] Preview',
        nothingToPreview: '[nl] Nothing to preview',
        editJson: '[nl] Edit JSON:',
        preview: '[nl] Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `[nl] Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `[nl] Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `[nl] Invalid value - Expected: ${expectedValues}`,
        missingValue: '[nl] Missing value',
        createReportAction: '[nl] Create Report Action',
        reportAction: '[nl] Report Action',
        report: '[nl] Report',
        transaction: '[nl] Transaction',
        violations: '[nl] Violations',
        transactionViolation: '[nl] Transaction Violation',
        hint: "[nl] Data changes won't be sent to the backend",
        textFields: '[nl] Text fields',
        numberFields: '[nl] Number fields',
        booleanFields: '[nl] Boolean fields',
        constantFields: '[nl] Constant fields',
        dateTimeFields: '[nl] DateTime fields',
        date: '[nl] Date',
        time: '[nl] Time',
        none: '[nl] None',
        visibleInLHN: '[nl] Visible in LHN',
        GBR: '[nl] GBR',
        RBR: '[nl] RBR',
        true: '[nl] true',
        false: '[nl] false',
        viewReport: '[nl] View Report',
        viewTransaction: '[nl] View transaction',
        createTransactionViolation: '[nl] Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: '[nl] Has draft comment',
            hasGBR: '[nl] Has GBR',
            hasRBR: '[nl] Has RBR',
            pinnedByUser: '[nl] Pinned by member',
            hasIOUViolations: '[nl] Has IOU violations',
            hasAddWorkspaceRoomErrors: '[nl] Has add workspace room errors',
            isUnread: '[nl] Is unread (focus mode)',
            isArchived: '[nl] Is archived (most recent mode)',
            isSelfDM: '[nl] Is self DM',
            isFocused: '[nl] Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: '[nl] Has join request (admin room)',
            isUnreadWithMention: '[nl] Is unread with mention',
            isWaitingForAssigneeToCompleteAction: '[nl] Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: '[nl] Has child report awaiting action',
            hasMissingInvoiceBankAccount: '[nl] Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: '[nl] Has unresolved card fraud alert',
            hasDEWApproveFailed: '[nl] Has DEW approve failed',
        },
        reasonRBR: {
            hasErrors: '[nl] Has errors in report or report actions data',
            hasViolations: '[nl] Has violations',
            hasTransactionThreadViolations: '[nl] Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "[nl] There's a report awaiting action",
            theresAReportWithErrors: "[nl] There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "[nl] There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "[nl] There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: '[nl] There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "[nl] There's a problem with a contact method",
            aContactMethodRequiresVerification: '[nl] A contact method requires verification',
            theresAProblemWithAPaymentMethod: "[nl] There's a problem with a payment method",
            theresAProblemWithAWorkspace: "[nl] There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "[nl] There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "[nl] There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: '[nl] Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: '[nl] There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "[nl] There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "[nl] There's a problem with your wallet terms",
            aBankAccountIsLocked: '[nl] A bank account is locked',
        },
    },
    emptySearchView: {
        takeATestDrive: '[nl] Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: '[nl] Welcome to New Expensify!',
        subtitle: "[nl] It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "[nl] Let's go!",
        helpText: '[nl] Try 2-min demo',
        features: {
            search: '[nl] More powerful search on mobile, web, and desktop',
            concierge: '[nl] Built-in Concierge AI to help automate your expenses',
            chat: '[nl] Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '[nl] <tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '[nl] <tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '[nl] <tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        scanTestTooltip: {
            main: '[nl] <tooltip><strong>Scan our test receipt</strong> to see how it works!</tooltip>',
            manager: '[nl] <tooltip>Choose our <strong>test manager</strong> to try it out!</tooltip>',
            confirmation: '[nl] <tooltip>Now, <strong>submit your expense</strong> and watch the\nmagic happen!</tooltip>',
            tryItOut: '[nl] Try it out',
        },
        outstandingFilter: '[nl] <tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '[nl] <tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "[nl] <tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
        hasFilterNegation: '[nl] <tooltip>Search for expenses without receipts using <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '[nl] Discard changes?',
        body: '[nl] Are you sure you want to discard the changes you made?',
        confirmText: '[nl] Discard changes',
    },
    scheduledCall: {
        book: {
            title: '[nl] Schedule call',
            description: '[nl] Find a time that works for you.',
            slots: ({date}: {date: string}) => `[nl] <muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '[nl] Confirm call',
            description: "[nl] Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: '[nl] Your setup specialist',
            meetingLength: '[nl] Meeting length',
            dateTime: '[nl] Date & time',
            minutes: '[nl] 30 minutes',
        },
        callScheduled: '[nl] Call scheduled',
    },
    autoSubmitModal: {
        title: '[nl] All clear and submitted!',
        description: '[nl] All warnings and violations has been cleared so:',
        submittedExpensesTitle: '[nl] These expenses have been submitted',
        submittedExpensesDescription: '[nl] These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: '[nl] Pending expenses have been moved',
        pendingExpensesDescription: '[nl] Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '[nl] Take a 2-minute test drive',
        },
        modal: {
            title: '[nl] Take us for a test drive',
            description: '[nl] Take a quick product tour to get up to speed fast.',
            confirmText: '[nl] Start test drive',
            helpText: '[nl] Skip',
            employee: {
                description: '[nl] <muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "[nl] Enter your boss's email",
                error: '[nl] That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "[nl] You're currently test driving Expensify",
            readyForTheRealThing: '[nl] Ready for the real thing?',
            getStarted: '[nl] Get started',
        },
        employeeInviteMessage: (name: string) => `[nl] # ${name} invited you to test drive Expensify
Hey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.

Here’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: '[nl] Basic export',
        reportLevelExport: '[nl] All Data - report level',
        expenseLevelExport: '[nl] All Data - expense level',
        exportInProgress: '[nl] Export in progress',
        conciergeWillSend: '[nl] Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: '[nl] Not verified',
        retry: '[nl] Retry',
        verifyDomain: {
            title: '[nl] Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `[nl] Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `[nl] Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: '[nl] Add the following TXT record:',
            saveChanges: '[nl] Save changes and return here to verify your domain.',
            youMayNeedToConsult: `[nl] You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: '[nl] After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: '[nl] Couldn’t fetch verification code',
            genericError: "[nl] We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: '[nl] Domain verified',
            header: '[nl] Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `[nl] <muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: '[nl] SAML',
        samlFeatureList: {
            title: '[nl] SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `[nl] <muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: '[nl] Faster and easier login',
            moreSecurityAndControl: '[nl] More security and control',
            onePasswordForAnything: '[nl] One password for everything',
        },
        goToDomain: '[nl] Go to domain',
        samlLogin: {
            title: '[nl] SAML login',
            subtitle: `[nl] <muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a>.</muted-text>`,
            enableSamlLogin: '[nl] Enable SAML login',
            allowMembers: '[nl] Allow members to log in with SAML.',
            requireSamlLogin: '[nl] Require SAML login',
            anyMemberWillBeRequired: '[nl] Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "[nl] Couldn't update SAML enablement setting",
            requireError: "[nl] Couldn't update SAML requirement setting",
            disableSamlRequired: '[nl] Disable SAML required',
            oktaWarningPrompt: '[nl] Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: '[nl] Please add Identity Provider metadata below to enable',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `[nl] <muted-text>Please disable <a href="${twoFactorAuthSettingsUrl}">force two-factor authentication</a> to enable SAML login.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: '[nl] SAML configuration details',
            subtitle: '[nl] Use these details to get SAML set up.',
            identityProviderMetadata: '[nl] Identity Provider Metadata',
            entityID: '[nl] Entity ID',
            nameIDFormat: '[nl] Name ID Format',
            loginUrl: '[nl] Login URL',
            acsUrl: '[nl] ACS (Assertion Consumer Service) URL',
            logoutUrl: '[nl] Logout URL',
            sloUrl: '[nl] SLO (Single Logout) URL',
            serviceProviderMetaData: '[nl] Service Provider MetaData',
            oktaScimToken: '[nl] Okta SCIM Token',
            revealToken: '[nl] Reveal token',
            fetchError: "[nl] Couldn't fetch SAML configuration details",
            setMetadataGenericError: "[nl] Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: '[nl] Access restricted',
            subtitle: (domainName: string) => `[nl] Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: '[nl] Company card management',
            accountCreationAndDeletion: '[nl] Account creation and deletion',
            workspaceCreation: '[nl] Workspace creation',
            samlSSO: '[nl] SAML SSO',
        },
        addDomain: {
            title: '[nl] Add domain',
            subtitle: '[nl] Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: '[nl] Domain name',
            newDomain: '[nl] New domain',
        },
        domainAdded: {
            title: '[nl] Domain added',
            description: "[nl] Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: '[nl] Configure',
        },
        enhancedSecurity: {
            title: '[nl] Enhanced security',
            subtitle: '[nl] Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: '[nl] Enable',
        },
        domainAdmins: '[nl] Domain admins',
        admins: {
            title: '[nl] Admins',
            findAdmin: '[nl] Find admin',
            primaryContact: '[nl] Primary contact',
            addPrimaryContact: '[nl] Add primary contact',
            setPrimaryContactError: '[nl] Unable to set primary contact. Please try again later.',
            consolidatedDomainBilling: '[nl] Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `[nl] <comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "[nl] Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: '[nl] Add admin',
            addAdminError: '[nl] Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: '[nl] Revoke admin access',
            cantRevokeAdminAccess: "[nl] Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: '[nl] Unable to remove this user as an Admin. Please try again.',
                removeDomain: '[nl] Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: '[nl] Please enter your domain name to reset it.',
            },
            resetDomain: '[nl] Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `[nl] Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: '[nl] Enter your domain name here',
            resetDomainInfo: `[nl] This action is <strong>permanent</strong> and the following data will be deleted: <br/> <bullet-list><bullet-item>Company card connections and any unreported expenses from those cards</bullet-item><bullet-item>SAML and group settings</bullet-item></bullet-list> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        domainMembers: '[nl] Domain members',
        members: {
            title: '[nl] Members',
            findMember: '[nl] Find member',
            addMember: '[nl] Add member',
            emptyMembers: {
                title: '[nl] No members in this group',
                subtitle: '[nl] Add a member or try changing the filter above.',
            },
            allMembers: '[nl] All members',
            email: '[nl] Email address',
            closeAccountPrompt: '[nl] Are you sure? This action is permanent.',
            forceCloseAccount: () => ({
                one: '[nl] Force close account',
                other: '[nl] Force close accounts',
            }),
            safeCloseAccount: () => ({
                one: '[nl] Close account safely',
                other: '[nl] Close accounts safely',
            }),
            closeAccountInfo: () => ({
                one: '[nl] We recommend closing the account safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected account.',
                other: '[nl] We recommend closing the accounts safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected accounts.',
            }),
            closeAccount: () => ({
                one: '[nl] Close account',
                other: '[nl] Close accounts',
            }),
            error: {
                addMember: '[nl] Unable to add this member. Please try again.',
                removeMember: '[nl] Unable to remove this user. Please try again.',
                vacationDelegate: '[nl] Unable to set this user as a vacation delegate. Please try again.',
            },
            cannotSetVacationDelegateForMember: (email: string) => `[nl] You can't set a vacation delegate for ${email} because they're currently the delegate for the following members:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `[nl] Are you sure? This will lock <strong>${email}'s</strong> account. <br /><br /> Our team will then review the account and remove any unauthorized access. To regain access, they'll need to work with Concierge.`,
            reportSuspiciousActivityConfirmationPrompt: '[nl] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        },
        common: {
            settings: '[nl] Settings',
            forceTwoFactorAuth: '[nl] Force two-factor authentication',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `[nl] <muted-text>Please disable <a href="${samlPageUrl}">SAML</a> to force two-factor authentication.</muted-text>`,
            forceTwoFactorAuthDescription: `[nl] <muted-text>Require two-factor authentication for all members of this domain. Domain members will be prompted to set up two-factor authentication on their account when they sign in.</muted-text>`,
            forceTwoFactorAuthError: "[nl] Force two-factor authentication couldn't be changed. Please try again later.",
            resetTwoFactorAuth: '[nl] Reset two-factor authentication',
        },
        groups: {
            title: '[nl] Groups',
            memberCount: () => {
                return {
                    one: '[nl] 1 member',
                    other: (count: number) => `[nl] ${count} members`,
                };
            },
        },
    },
};
export default translations;
