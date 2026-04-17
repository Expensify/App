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
        count: '[de][ctx: Used as a noun meaning a numerical total or quantity, not the verb “to count.”] Count',
        cancel: '[de] Cancel',
        dismiss: '[de][ctx: Refers to closing or hiding a notification or message, not rejecting or ignoring something.] Dismiss',
        proceed: '[de][ctx: Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”] Proceed',
        unshare: '[de] Unshare',
        yes: '[de] Yes',
        no: '[de] No',
        ok: '[de][ctx: Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.] OK',
        notNow: '[de] Not now',
        noThanks: '[de] No thanks',
        learnMore: '[de] Learn more',
        buttonConfirm: '[de] Got it',
        name: '[de] Name',
        attachment: '[de] Attachment',
        attachments: '[de] Attachments',
        center: '[de] Center',
        from: '[de] From',
        to: '[de] To',
        in: '[de] In',
        optional: '[de] Optional',
        new: '[de] New',
        newFeature: '[de] New feature',
        search: '[de] Search',
        reports: '[de] Reports',
        spend: '[de] Spend',
        find: '[de] Find',
        searchWithThreeDots: '[de] Search...',
        next: '[de] Next',
        previous: '[de] Previous',
        previousMonth: '[de] Previous month',
        nextMonth: '[de] Next month',
        previousYear: '[de] Previous year',
        nextYear: '[de] Next year',
        goBack: '[de][ctx: Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.] Go back',
        create: '[de] Create',
        add: '[de] Add',
        resend: '[de] Resend',
        save: '[de] Save',
        select: '[de] Select',
        deselect: '[de] Deselect',
        selectMultiple: '[de][ctx: Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.] Select multiple',
        saveChanges: '[de] Save changes',
        submit: '[de] Submit',
        submitted: '[de][ctx: Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”] Submitted',
        rotate: '[de] Rotate',
        zoom: '[de] Zoom',
        password: '[de] Password',
        magicCode: '[de] Magic code',
        digits: '[de] digits',
        twoFactorCode: '[de] Two-factor code',
        workspaces: '[de] Workspaces',
        home: '[de] Home',
        inbox: '[de] Inbox',
        yourReviewIsRequired: '[de] Your review is required',
        actionBadge: {
            submit: '[de] Submit',
            approve: '[de] Approve',
            pay: '[de] Pay',
            fix: '[de] Fix',
        },
        success: '[de][ctx: Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”] Success',
        group: '[de] Group',
        profile: '[de] Profile',
        referral: '[de] Referral',
        payments: '[de] Payments',
        approvals: '[de] Approvals',
        wallet: '[de] Wallet',
        preferences: '[de] Preferences',
        view: '[de] View',
        review: (amount?: string) => `[de] Review${amount ? ` ${amount}` : ''}`,
        not: '[de] Not',
        signIn: '[de] Sign in',
        signInWithGoogle: '[de] Sign in with Google',
        signInWithApple: '[de] Sign in with Apple',
        signInWith: '[de] Sign in with',
        continue: '[de] Continue',
        firstName: '[de] First name',
        lastName: '[de] Last name',
        scanning: '[de] Scanning',
        analyzing: '[de] Analyzing...',
        thinking: '[de] Concierge is thinking...',
        addCardTermsOfService: '[de] Expensify Terms of Service',
        perPerson: '[de] per person',
        phone: '[de] Phone',
        phoneNumber: '[de] Phone number',
        phoneNumberPlaceholder: '[de] (xxx) xxx-xxxx',
        email: '[de] Email',
        and: '[de] and',
        or: '[de] or',
        details: '[de] Details',
        privacy: '[de] Privacy',
        privacyPolicy: '[de] Privacy Policy',
        hidden: '[de] Hidden',
        visible: '[de] Visible',
        delete: '[de] Delete',
        archived: '[de][ctx: UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.] archived',
        contacts: '[de] Contacts',
        recents: '[de] Recents',
        close: '[de] Close',
        comment: '[de] Comment',
        download: '[de] Download',
        downloading: '[de] Downloading',
        uploading: '[de][ctx: Indicates that a file is currently being uploaded (sent to the server), not downloaded.] Uploading',
        pin: '[de][ctx: as a verb, not a noun] Pin',
        unPin: '[de] Unpin',
        back: '[de] Back',
        saveAndContinue: '[de] Save & continue',
        settings: '[de] Settings',
        termsOfService: '[de] Terms of Service',
        members: '[de] Members',
        invite: '[de] Invite',
        here: '[de] here',
        date: '[de] Date',
        dob: '[de] Date of birth',
        currentYear: '[de] Current year',
        currentMonth: '[de] Current month',
        ssnLast4: '[de] Last 4 digits of SSN',
        ssnFull9: '[de] Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `[de] Address line ${lineNumber}`,
        personalAddress: '[de] Personal address',
        companyAddress: '[de] Company address',
        noPO: '[de] No PO boxes or mail-drop addresses, please.',
        city: '[de] City',
        state: '[de] State',
        streetAddress: '[de] Street address',
        stateOrProvince: '[de] State / Province',
        country: '[de] Country',
        zip: '[de] Zip code',
        zipPostCode: '[de] Zip / Postcode',
        whatThis: "[de] What's this?",
        iAcceptThe: '[de] I accept the ',
        acceptTermsAndPrivacy: `[de] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `[de] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `[de] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: "[de] You can't export an empty report.",
            other: () => `[de] You can't export empty reports.`,
        }),
        remove: '[de] Remove',
        admin: '[de] Admin',
        owner: '[de] Owner',
        dateFormat: '[de] YYYY-MM-DD',
        send: '[de] Send',
        na: '[de] N/A',
        noResultsFound: '[de] No results found',
        noResultsFoundMatching: (searchString: string) => `[de] No results found matching "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `[de] Suggestions available for "${searchString}".` : '[de] Suggestions available.'),
        recentDestinations: '[de] Recent destinations',
        timePrefix: "[de] It's",
        conjunctionFor: '[de] for',
        todayAt: '[de] Today at',
        tomorrowAt: '[de] Tomorrow at',
        yesterdayAt: '[de] Yesterday at',
        conjunctionAt: '[de] at',
        conjunctionTo: '[de] to',
        genericErrorMessage: '[de] Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: '[de] Percentage',
        progressBarLabel: '[de] Onboarding progress',
        converted: '[de] Converted',
        error: {
            invalidAmount: '[de] Invalid amount',
            acceptTerms: '[de] You must accept the Terms of Service to continue',
            phoneNumber: `[de] Please enter a complete phone number
(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '[de] This field is required',
            requestModified: '[de] This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `[de] Character limit exceeded (${length}/${limit})`,
            dateInvalid: '[de] Please select a valid date',
            invalidDateShouldBeFuture: '[de] Please choose today or a future date',
            invalidTimeShouldBeFuture: '[de] Please choose a time at least one minute ahead',
            invalidCharacter: '[de] Invalid character',
            enterMerchant: '[de] Enter a merchant name',
            enterAmount: '[de] Enter an amount',
            missingMerchantName: '[de] Missing merchant name',
            missingAmount: '[de] Missing amount',
            missingDate: '[de] Missing date',
            enterDate: '[de] Enter a date',
            invalidTimeRange: '[de] Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: '[de] Please complete the form above to continue',
            pleaseSelectOne: '[de] Please select an option above',
            invalidRateError: '[de] Please enter a valid rate',
            lowRateError: '[de] Rate must be greater than 0',
            email: '[de] Please enter a valid email address',
            login: '[de] An error occurred while logging in. Please try again.',
        },
        comma: '[de] comma',
        semicolon: '[de] semicolon',
        please: '[de] Please',
        contactUs: '[de][ctx: Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.] contact us',
        pleaseEnterEmailOrPhoneNumber: '[de] Please enter an email or phone number',
        fixTheErrors: '[de][ctx: Instruction prompting the user to correct multiple issues. Should use imperative form when translated.] fix the errors',
        inTheFormBeforeContinuing: '[de] in the form before continuing',
        confirm: '[de] Confirm',
        reset: '[de] Reset',
        done: '[de][ctx: Status or button indicating that an action or process has been completed. Should reflect completion.] Done',
        more: '[de] More',
        debitCard: '[de] Debit card',
        bankAccount: '[de] Bank account',
        personalBankAccount: '[de] Personal bank account',
        businessBankAccount: '[de] Business bank account',
        join: '[de] Join',
        leave: '[de] Leave',
        decline: '[de] Decline',
        reject: '[de] Reject',
        transferBalance: '[de] Transfer balance',
        enterManually: '[de][ctx: Instruction telling the user to input data manually. Refers to entering text or values in a field.] Enter it manually',
        message: '[de] Message',
        leaveThread: '[de] Leave thread',
        you: '[de] You',
        me: '[de][ctx: Refers to the current user in the UI. Should follow capitalization rules for labels] me',
        youAfterPreposition: '[de] you',
        your: '[de] your',
        conciergeHelp: '[de] Please reach out to Concierge for help.',
        youAppearToBeOffline: '[de] You appear to be offline.',
        thisFeatureRequiresInternet: '[de] This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: '[de] Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: '[de] An error occurred while trying to play this video.',
        areYouSure: '[de] Are you sure?',
        verify: '[de] Verify',
        yesContinue: '[de] Yes, continue',
        websiteExample: '[de][ctx: Provides an example format for a website URL.] e.g. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `[de][ctx: Provides an example format for a ZIP] e.g. ${zipSampleFormat}` : ''),
        description: '[de] Description',
        title: '[de] Title',
        assignee: '[de] Assignee',
        createdBy: '[de] Created by',
        with: '[de] with',
        shareCode: '[de] Share code',
        share: '[de] Share',
        per: '[de] per',
        mi: '[de][ctx: Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.] mile',
        km: '[de] kilometer',
        milesAbbreviated: '[de] mi',
        kilometersAbbreviated: '[de] km',
        copied: '[de] Copied!',
        someone: '[de] Someone',
        total: '[de] Total',
        edit: '[de] Edit',
        letsDoThis: `[de] Let's do this!`,
        letsStart: `[de] Let's start`,
        showMore: '[de] Show more',
        showLess: '[de] Show less',
        merchant: '[de] Merchant',
        change: '[de] Change',
        category: '[de] Category',
        report: '[de] Report',
        billable: '[de] Billable',
        nonBillable: '[de] Non-billable',
        tag: '[de] Tag',
        receipt: '[de] Receipt',
        verified: '[de] Verified',
        replace: '[de] Replace',
        distance: '[de] Distance',
        mile: '[de] mile',
        miles: '[de][ctx: Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.] miles',
        kilometer: '[de] kilometer',
        kilometers: '[de] kilometers',
        recent: '[de] Recent',
        all: '[de] All',
        am: '[de] AM',
        pm: '[de] PM',
        tbd: "[de][ctx: Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.] TBD",
        selectCurrency: '[de] Select a currency',
        selectSymbolOrCurrency: '[de] Select a symbol or currency',
        card: '[de] Card',
        whyDoWeAskForThis: '[de] Why do we ask for this?',
        required: '[de] Required',
        automatic: '[de] Automatic',
        showing: '[de] Showing',
        of: '[de] of',
        default: '[de] Default',
        update: '[de] Update',
        member: '[de] Member',
        auditor: '[de] Auditor',
        role: '[de] Role',
        roleCannotBeChanged: (workflowsLinkPage: string) => `[de] Role can't be changed because this member is a <a href="${workflowsLinkPage}">payer</a> on this workspace.`,
        currency: '[de] Currency',
        groupCurrency: '[de] Group currency',
        rate: '[de] Rate',
        emptyLHN: {
            title: '[de] Woohoo! All caught up.',
            subtitleText1: '[de] Find a chat using the',
            subtitleText2: '[de] button above, or create something using the',
            subtitleText3: '[de] button below.',
        },
        businessName: '[de] Business name',
        clear: '[de] Clear',
        type: '[de] Type',
        reportName: '[de] Report name',
        action: '[de] Action',
        expenses: '[de] Expenses',
        totalSpend: '[de] Total spend',
        tax: '[de] Tax',
        shared: '[de] Shared',
        drafts: '[de] Drafts',
        draft: '[de][ctx: as a noun, not a verb] Draft',
        finished: '[de] Finished',
        upgrade: '[de] Upgrade',
        downgradeWorkspace: '[de] Downgrade workspace',
        companyID: '[de] Company ID',
        userID: '[de] User ID',
        disable: '[de] Disable',
        export: '[de] Export',
        initialValue: '[de] Initial value',
        currentDate: '[de][ctx: UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.] Current date',
        value: '[de] Value',
        downloadFailedTitle: '[de] Download failed',
        downloadFailedDescription: "[de] Your download couldn't be completed. Please try again later.",
        filterLogs: '[de] Filter Logs',
        network: '[de] Network',
        reportID: '[de] Report ID',
        longReportID: '[de] Long Report ID',
        withdrawalID: '[de] Withdrawal ID',
        withdrawalStatus: '[de] Withdrawal status',
        bankAccounts: '[de] Bank accounts',
        chooseFile: '[de] Choose file',
        chooseFiles: '[de] Choose files',
        dropTitle: '[de][ctx: Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.] Let it go',
        dropMessage: '[de][ctx: Instruction for dropping one or more files into an upload area.] Drop your file here',
        ignore: '[de] Ignore',
        enabled: '[de] Enabled',
        disabled: '[de] Disabled',
        import: '[de][ctx: Action button for importing a file or data. Should use the verb form, not the noun form.] Import',
        offlinePrompt: "[de] You can't take this action right now.",
        outstanding: '[de][ctx: meaning "remaining to be paid, done, or dealt with", not "exceptionally good"] Outstanding',
        chats: '[de] Chats',
        tasks: '[de] Tasks',
        unread: '[de] Unread',
        sent: '[de] Sent',
        links: '[de] Links',
        day: '[de][ctx: Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).] day',
        days: '[de] days',
        rename: '[de] Rename',
        address: '[de] Address',
        hourAbbreviation: '[de] h',
        minuteAbbreviation: '[de] m',
        secondAbbreviation: '[de] s',
        skip: '[de] Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `[de] Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: '[de] Chat now',
        workEmail: '[de] Work email',
        destination: '[de] Destination',
        subrate: '[de][ctx: Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.] Subrate',
        perDiem: '[de] Per diem',
        validate: '[de] Validate',
        downloadAsPDF: '[de] Download as PDF',
        downloadAsCSV: '[de] Download as CSV',
        print: '[de] Print',
        help: '[de] Help',
        collapsed: '[de] Collapsed',
        expanded: '[de] Expanded',
        expenseReport: '[de] Expense Report',
        expenseReports: '[de] Expense Reports',
        rateOutOfPolicy: '[de][ctx: Rate as a noun, not a verb] Rate out of policy',
        leaveWorkspace: '[de] Leave workspace',
        leaveWorkspaceConfirmation: "[de] If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "[de] If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "[de] If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `[de] If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `[de] If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `[de] If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "[de] You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: '[de] Reimbursable',
        editYourProfile: '[de] Edit your profile',
        comments: '[de] Comments',
        sharedIn: '[de] Shared in',
        unreported: '[de] Unreported',
        explore: '[de] Explore',
        insights: '[de] Insights',
        todo: '[de] To-do',
        invoice: '[de] Invoice',
        expense: '[de] Expense',
        chat: '[de] Chat',
        task: '[de] Task',
        trip: '[de] Trip',
        apply: '[de] Apply',
        status: '[de] Status',
        on: '[de] On',
        before: '[de] Before',
        after: '[de] After',
        range: '[de] Range',
        reschedule: '[de] Reschedule',
        general: '[de] General',
        workspacesTabTitle: '[de] Workspaces',
        headsUp: '[de] Heads up!',
        submitTo: '[de] Submit to',
        forwardTo: '[de] Forward to',
        approvalLimit: '[de] Approval limit',
        overLimitForwardTo: '[de] Over limit forward to',
        merge: '[de] Merge',
        none: '[de] None',
        unstableInternetConnection: '[de] Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: '[de] Enable Global Reimbursements',
        purchaseAmount: '[de] Purchase amount',
        originalAmount: '[de] Original amount',
        frequency: '[de] Frequency',
        link: '[de] Link',
        pinned: '[de] Pinned',
        read: '[de] Read',
        copyToClipboard: '[de] Copy to clipboard',
        thisIsTakingLongerThanExpected: '[de] This is taking longer than expected...',
        domains: '[de] Domains',
        actionRequired: '[de] Action required',
        duplicate: '[de] Duplicate',
        duplicated: '[de] Duplicated',
        duplicateExpense: '[de] Duplicate expense',
        duplicateReport: '[de] Duplicate report',
        copyOfReportName: (reportName: string) => `[de] Copy of ${reportName}`,
        exchangeRate: '[de] Exchange rate',
        reimbursableTotal: '[de] Reimbursable total',
        nonReimbursableTotal: '[de] Non-reimbursable total',
        opensInNewTab: '[de] Opens in a new tab',
        locked: '[de] Locked',
        month: '[de] Month',
        week: '[de] Week',
        year: '[de] Year',
        quarter: '[de] Quarter',
        concierge: {
            sidePanelGreeting: '[de] Hi there, how can I help?',
            showHistory: '[de] Show history',
        },
        vacationDelegate: '[de] Vacation delegate',
        expensifyLogo: '[de] Expensify logo',
        approver: '[de] Approver',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `[de] enter digit ${digitIndex} of ${totalDigits}`,
    },
    socials: {
        podcast: '[de] Follow us on Podcast',
        twitter: '[de] Follow us on Twitter',
        instagram: '[de] Follow us on Instagram',
        facebook: '[de] Follow us on Facebook',
        linkedin: '[de] Follow us on LinkedIn',
    },
    concierge: {
        collapseReasoning: '[de] Collapse reasoning',
        expandReasoning: '[de] Expand reasoning',
    },
    supportalNoAccess: {
        title: '[de] Not so fast',
        descriptionWithCommand: (command?: string) =>
            `[de] You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: '[de] Locked Account',
        description: "[de] You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: '[de] Use current location',
        notFound: '[de] We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "[de] It looks like you've denied access to your location.",
        please: '[de] Please',
        allowPermission: '[de] allow location access in settings',
        tryAgain: '[de] and try again.',
    },
    contact: {
        importContacts: '[de] Import contacts',
        importContactsTitle: '[de] Import your contacts',
        importContactsText: '[de] Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: '[de] so your favorite people are always a tap away.',
        importContactsNativeText: '[de] Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: '[de] Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '[de] Camera access',
        expensifyDoesNotHaveAccessToCamera: "[de] Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: '[de] Attachment error',
        errorWhileSelectingAttachment: '[de] An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: '[de] An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: '[de] Take photo',
        chooseFromGallery: '[de] Choose from gallery',
        chooseDocument: '[de] Choose file',
        attachmentTooLarge: '[de] Attachment is too large',
        sizeExceeded: '[de] Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `[de] Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: '[de] Attachment is too small',
        sizeNotMet: '[de] Attachment size must be greater than 240 bytes',
        wrongFileType: '[de] Invalid file type',
        notAllowedExtension: '[de] This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: '[de] Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: '[de] Password-protected PDF is not supported',
        attachmentImageResized: '[de] This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: '[de] This image is too large to preview before uploading.',
        imageDimensionsTooLarge: '[de] Image dimensions are too large to process. Please use a smaller image.',
        tooManyFiles: (fileLimit: number) => `[de] You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `[de] Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "[de] Some files can't be uploaded",
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `[de] Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "[de] You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `[de] ${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: '[de] Learn more about supported formats.',
        passwordProtected: "[de] Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: '[de] Add attachments',
        addReceipt: '[de] Add receipt',
        scanReceipts: '[de] Scan receipts',
        replaceReceipt: '[de] Replace receipt',
    },
    filePicker: {
        fileError: '[de] File error',
        errorWhileSelectingFile: '[de] An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: '[de] Connection complete',
        supportingText: '[de] You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: '[de] Edit photo',
        description: '[de] Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: '[de] No extension found for mime type',
        problemGettingImageYouPasted: '[de] There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `[de] The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `[de] The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: '[de] Update app',
        updatePrompt: '[de] A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: '[de] Launching Expensify',
        expired: '[de] Your session has expired.',
        signIn: '[de] Please sign in again.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: '[de] Review transaction',
            pleaseReview: '[de] Please review this transaction',
            requiresYourReview: '[de] An Expensify Card transaction requires your review.',
            transactionDetails: '[de] Transaction details',
            attemptedTransaction: '[de] Attempted transaction',
            deny: '[de] Deny',
            approve: '[de] Approve',
            denyTransaction: '[de] Deny transaction',
            transactionDenied: '[de] Transaction denied',
            transactionApproved: '[de] Transaction approved!',
            areYouSureToDeny: '[de] Are you sure? The transaction will be denied if you close this screen.',
            youCanTryAgainAtMerchantOrReachOut:
                "[de] You can try again at the merchant. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            youNeedToTryAgainAtMerchant: "[de] This transaction was not verified, so we denied it. You'll need to try again at the merchant.",
            goBackToTheMerchant: '[de] Return to the merchant site to continue the transaction.',
            transactionFailed: '[de] Transaction failed',
            transactionCouldNotBeCompleted: '[de] Your transaction could not be completed. Please try again at the merchant.',
            transactionCouldNotBeCompletedReachOut:
                "[de] Your transaction could not be completed. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            reviewFailed: '[de] Review failed',
            alreadyReviewedSubtitle:
                '[de] You already reviewed this transaction. Please check your <transaction-history-link>transaction history</transaction-history-link> or contact <concierge-link>Concierge</concierge-link> to report any issues.',
        },
        unsupportedDevice: {
            unsupportedDevice: '[de] Unsupported device',
            pleaseDownloadMobileApp: `[de] This action is not supported on your device. Please download the Expensify app from the <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> or <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> and try again.`,
            pleaseUseWebApp: `[de] This action is not supported on your device. Please use the <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify web app</a> and try again.`,
        },
        biometricsTest: {
            biometricsTest: '[de] Biometrics test',
            authenticationSuccessful: '[de] Authentication successful',
            successfullyAuthenticatedUsing: (authType?: string) => `[de] You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `[de] Biometrics (${status})`,
            statusNeverRegistered: '[de] Never registered',
            statusNotRegistered: '[de] Not registered',
            statusRegisteredOtherDevice: () => ({one: '[de] Another device registered', other: '[de] Other devices registered'}),
            statusRegisteredThisDevice: '[de] Registered',
            yourAttemptWasUnsuccessful: '[de] Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: '[de] You couldn’t be authenticated',
            areYouSureToReject: '[de] Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: '[de] Reject authentication',
            test: '[de] Test',
            biometricsAuthentication: '[de] Biometric authentication',
            authType: {
                unknown: '[de] Unknown',
                none: '[de] None',
                credentials: '[de] Credentials',
                biometrics: '[de] Biometrics',
                faceId: '[de] Face ID',
                touchId: '[de] Touch ID',
                opticId: '[de] Optic ID',
                passkey: '[de] Passkey',
            },
        },
        pleaseEnableInSystemSettings: {
            start: '[de] Please enable face/fingerprint verification or set a device passcode in your ',
            link: '[de] system settings',
            end: '.',
        },
        oops: '[de] Oops, something went wrong',
        verificationFailed: '[de] Verification failed',
        looksLikeYouRanOutOfTime: '[de] Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: '[de] You ran out of time',
        letsVerifyItsYou: '[de] Let’s verify it’s you',
        nowLetsAuthenticateYou: "[de] Now, let's authenticate you...",
        letsAuthenticateYou: "[de] Let's authenticate you...",
        verifyYourself: {
            biometrics: '[de] Verify yourself with your face or fingerprint',
            passkeys: '[de] Verify yourself with a passkey',
        },
        enableQuickVerification: {
            biometrics: '[de] Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
            passkeys: '[de] Enable quick, secure verification using a passkey. No passwords or codes required.',
        },
        revoke: {
            revoke: '[de] Revoke',
            title: '[de] Face/fingerprint & passkeys',
            explanation:
                '[de] Face/fingerprint or passkey verification are enabled on one or more devices. Revoking access will require a magic code for the next verification on that device.',
            confirmationPrompt: "[de] Are you sure? You'll need a magic code for the next verification on that device.",
            confirmationPromptThisDevice: "[de] Are you sure? You'll need a magic code for the next verification on this device.",
            confirmationPromptMultiple: "[de] Are you sure? You'll need a magic code for the next verification on those devices.",
            confirmationPromptAll: "[de] Are you sure? You'll need a magic code for the next verification on any device.",
            cta: '[de] Revoke access',
            ctaAll: '[de] Revoke all',
            noDevices: "[de] You don't have any devices registered for face/fingerprint or passkey verification. If you register any, you will be able to revoke that access here.",
            dismiss: '[de] Got it',
            error: '[de] Request failed. Try again later.',
            thisDevice: '[de] This device',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['[de] One', '[de] Two', '[de] Three', '[de] Four', '[de] Five', '[de] Six', '[de] Seven', '[de] Eight', '[de] Nine'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `[de] ${displayCount} other ${otherDeviceCount === 1 ? '[de] device' : '[de] devices'}`;
            },
        },
        setPin: {
            didNotShipCard: "[de] We didn't ship your card. Please try again.",
        },
        revealPin: {
            couldNotReveal: "[de] We couldn't reveal your PIN. Please try again.",
        },
        changePin: {
            didNotChange: "[de] We didn't change your PIN. Please try again.",
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            [de] Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: '[de] Head back to your original tab to continue.',
        title: "[de] Here's your magic code",
        description: dedent(`
            [de] Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            [de] Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: '[de] , or',
        signInHere: '[de] just sign in here',
        expiredCodeTitle: '[de] Magic code expired',
        expiredCodeDescription: '[de] Go back to the original device and request a new code',
        successfulNewCodeRequest: '[de] Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            [de] Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            [de] Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: '[de] request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: '[de] Paid by',
        whatsItFor: "[de] What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: '[de] Name, email, or phone number',
        findMember: '[de] Find a member',
        searchForSomeone: '[de] Search for someone',
        userSelected: (username: string) => `[de] ${username} selected`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '[de] Submit an expense, refer your team',
            subtitleText: "[de] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '[de] Book a call',
    },
    hello: '[de] Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '[de] Get started below.',
        anotherLoginPageIsOpen: '[de] Another login page is open.',
        anotherLoginPageIsOpenExplanation: "[de] You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: '[de] Welcome!',
        welcomeWithoutExclamation: '[de] Welcome',
        phrase2: "[de] Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: '[de] Your payments get to you as fast as you can get your point across.',
        enterPassword: '[de] Please enter your password',
        welcomeNewFace: (login: string) => `[de] ${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: (login: string) => `[de] Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '[de] Travel and expense, at the speed of chat',
            body: '[de] Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '[de] Continue logging in with single sign-on:',
        orContinueWithMagicCode: '[de] You can also sign in with a magic code',
        useSingleSignOn: '[de] Use single sign-on',
        useMagicCode: '[de] Use magic code',
        launching: '[de] Launching...',
        oneMoment: "[de] One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: '[de] Drop to upload',
        sendAttachment: '[de] Send attachment',
        addAttachment: '[de] Add attachment',
        writeSomething: '[de] Write something...',
        blockedFromConcierge: '[de] Communication is barred',
        askConciergeToUpdate: '[de] Try "Update an expense"...',
        askConciergeToCorrect: '[de] Try "Correct an expense"...',
        askConciergeForHelp: '[de] Ask Concierge AI for help...',
        fileUploadFailed: '[de] Upload failed. File is not supported.',
        localTime: (user: string, time: string) => `[de] It's ${time} for ${user}`,
        edited: '[de] (edited)',
        emoji: '[de] Emoji',
        collapse: '[de] Collapse',
        expand: '[de] Expand',
    },
    reportActionContextMenu: {
        copyMessage: '[de] Copy message',
        copied: '[de] Copied!',
        copyLink: '[de] Copy link',
        copyURLToClipboard: '[de] Copy URL to clipboard',
        copyEmailToClipboard: '[de] Copy email to clipboard',
        markAsUnread: '[de] Mark as unread',
        markAsRead: '[de] Mark as read',
        editAction: ({action}: EditActionParams) => `[de] Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '[de] expense' : '[de] comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '[de] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[de] Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '[de] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[de] Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: '[de] Only visible to',
        explain: '[de] Explain',
        explainMessage: '[de] Please explain this to me.',
        replyInThread: '[de] Reply in thread',
        joinThread: '[de] Join thread',
        leaveThread: '[de] Leave thread',
        copyOnyxData: '[de] Copy Onyx data',
        flagAsOffensive: '[de] Flag as offensive',
        menu: '[de] Menu',
    },
    emojiReactions: {
        addReactionTooltip: '[de] Add reaction',
        reactedWith: '[de] reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `[de] You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `[de] This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `[de] This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `[de] This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `[de] This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `[de] This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `[de] This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `[de] This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: '[de] This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "[de] Welcome! Let's get you set up.",
        chatWithAccountManager: '[de] Chat with your account manager here',
        askMeAnything: '[de] Ask me anything!',
        sayHello: '[de] Say hello!',
        yourSpace: '[de] Your space',
        welcomeToRoom: (roomName: string) => `[de] Welcome to ${roomName}!`,
        usePlusButton: (additionalText: string) => `[de]  Use the + button to ${additionalText} an expense.`,
        askConcierge: '[de] This is your chat with Concierge, your personal AI agent. I can do almost anything, try me!',
        conciergeSupport: '[de] Your personal AI agent',
        create: '[de] create',
        iouTypes: {
            pay: '[de] pay',
            split: '[de] split',
            submit: '[de] submit',
            track: '[de] track',
            invoice: '[de] invoice',
        },
    },
    adminOnlyCanPost: '[de] Only admins can send messages in this room.',
    reportAction: {
        asCopilot: '[de] as copilot for',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `[de] created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `[de] created this report for any held expenses from deleted report #${reportID}`
                : `[de] created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: '[de] Notify everyone in this conversation',
    },
    newMessages: '[de] New messages',
    latestMessages: '[de] Latest messages',
    youHaveBeenBanned: "[de] Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: '[de] is typing...',
        areTyping: '[de] are typing...',
        multipleMembers: '[de] Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '[de] This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `[de] This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `[de] This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `[de] This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `[de] This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[de] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[de] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '[de] This booking is archived.',
    },
    writeCapabilityPage: {
        label: '[de] Who can post',
        writeCapability: {
            all: '[de] All members',
            admins: '[de] Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: '[de] Find something...',
        buttonMySettings: '[de] My settings',
        fabNewChat: '[de] Start chat',
        fabNewChatExplained: '[de] Open actions menu',
        fabScanReceiptExplained: '[de] Scan receipt',
        chatPinned: '[de] Chat pinned',
        draftedMessage: '[de] Drafted message',
        listOfChatMessages: '[de] List of chat messages',
        listOfChats: '[de] List of chats',
        saveTheWorld: '[de] Save the world',
        tooltip: '[de] Get started here!',
        redirectToExpensifyClassicModal: {
            title: '[de] Coming soon',
            description: "[de] We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        },
    },
    homePage: {
        forYou: '[de] For you',
        timeSensitiveSection: {
            title: '[de] Time sensitive',
            ctaFix: '[de] Fix',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `[de] Fix ${feedName} company card connection` : '[de] Fix company card connection'),
                defaultSubtitle: '[de] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `[de] Fix ${cardName} personal card connection` : '[de] Fix personal card connection'),
                subtitle: '[de] Wallet',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `[de] Fix ${integrationName} connection`,
                defaultSubtitle: '[de] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: '[de] We need your shipping address',
                subtitle: '[de] Provide an address to receive your Expensify Card.',
                cta: '[de] Add address',
            },
            addPaymentCard: {
                title: '[de] Add a payment card to keep using Expensify',
                subtitle: '[de] Account > Subscription',
                cta: '[de] Add',
            },
            activateCard: {
                title: '[de] Activate your Expensify Card',
                subtitle: '[de] Validate your card and start spending.',
                cta: '[de] Activate',
            },
            reviewCardFraud: {
                title: '[de] Review potential fraud on your Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `[de] Review ${amount} in potential fraud at ${merchant}`,
                subtitle: '[de] Expensify Card',
                cta: '[de] Review',
            },
            validateAccount: {
                title: '[de] Validate your account to continue using Expensify',
                subtitle: '[de] Account',
                cta: '[de] Validate',
            },
            fixFailedBilling: {
                title: "[de] We couldn't bill your card on file",
                subtitle: '[de] Subscription',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `[de] Free trial: ${days} ${days === 1 ? '[de] day' : '[de] days'} left!`,
            offer50Body: '[de] Get 50% off your first year!',
            offer25Body: '[de] Get 25% off your first year!',
            addCardBody: "[de] Don't wait! Add your payment card now.",
            ctaClaim: '[de] Claim',
            ctaAdd: '[de] Add card',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `[de] Time remaining: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: '[de] Time remaining: 1 day',
                other: (pluralCount: number) => `[de] Time remaining: ${pluralCount} days`,
            }),
        },
        assignedCards: '[de] Your Expensify Cards',
        assignedCardsRemaining: ({amount}: {amount: string}) => `[de] ${amount} remaining`,
        announcements: '[de] Announcements',
        discoverSection: {
            title: '[de] Discover',
            menuItemTitleNonAdmin: '[de] Learn how to create expenses and submit reports.',
            menuItemTitleAdmin: '[de] Learn how to invite members, edit approval workflows, and reconcile company cards.',
            menuItemDescription: '[de] See what Expensify can do in 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `[de] Submit ${count} ${count === 1 ? '[de] report' : '[de] reports'}`,
            approve: ({count}: {count: number}) => `[de] Approve ${count} ${count === 1 ? '[de] report' : '[de] reports'}`,
            pay: ({count}: {count: number}) => `[de] Pay ${count} ${count === 1 ? '[de] report' : '[de] reports'}`,
            export: ({count}: {count: number}) => `[de] Export ${count} ${count === 1 ? '[de] report' : '[de] reports'}`,
            begin: '[de] Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: "[de] You're done!",
                thumbsUpStarsDescription: '[de] Thumbs up to you, stay tuned for more tasks.',
                smallRocketTitle: '[de] All caught up',
                smallRocketDescription: '[de] Upcoming to-dos will launch here.',
                cowboyHatTitle: "[de] You're done!",
                cowboyHatDescription: '[de] All tasks are wrangled, keep an eye out for more.',
                trophy1Title: '[de] Nothing to show',
                trophy1Description: '[de] You did it! Keep an eye out for more to-dos.',
                palmTreeTitle: '[de] All caught up',
                palmTreeDescription: '[de] Time to relax but stay tuned for future tasks.',
                fishbowlBlueTitle: "[de] You're done!",
                fishbowlBlueDescription: "[de] We'll bubble up future tasks here.",
                targetTitle: '[de] All caught up',
                targetDescription: '[de] Way to stay on target. Check back for more tasks!',
                chairTitle: '[de] Nothing to show',
                chairDescription: "[de] Go relax, we'll list upcoming to-dos here.",
                broomTitle: "[de] You're done!",
                broomDescription: '[de] Tasks are clean, though stay tuned for more to-dos.',
                houseTitle: '[de] All caught up',
                houseDescription: '[de] This is your home base for upcoming to-dos.',
                conciergeBotTitle: '[de] Nothing to show',
                conciergeBotDescription: '[de] Beep boop beep boop, check back for more tasks!',
                checkboxTextTitle: '[de] All caught up',
                checkboxTextDescription: '[de] Check off your upcoming to-dos here.',
                flashTitle: "[de] You're done!",
                flashDescription: "[de] We'll zap your future tasks here.",
                sunglassesTitle: '[de] Nothing to show',
                sunglassesDescription: "[de] Time to chill, though stay tuned for what's next!",
                f1FlagsTitle: '[de] All caught up',
                f1FlagsDescription: "[de] You've finished all outstanding to-dos.",
            },
        },
        gettingStartedSection: {
            title: '[de] Getting started',
            createWorkspace: '[de] Create a workspace',
            connectAccounting: ({integrationName}: {integrationName: string}) => `[de] Connect to ${integrationName}`,
            connectAccountingDefault: '[de] Connect to accounting',
            customizeCategories: '[de] Customize accounting categories',
            linkCompanyCards: '[de] Link company cards',
            setupRules: '[de] Set up spend rules',
        },
        upcomingTravel: '[de] Upcoming travel',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `[de] Flight to ${destination}`,
            trainTo: ({destination}: {destination: string}) => `[de] Train to ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `[de] Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `[de] Car rental in ${destination}`,
            inOneWeek: '[de] In 1 week',
            inDays: () => ({
                one: '[de] In 1 day',
                other: (count: number) => `[de] In ${count} days`,
            }),
            today: '[de] Today',
        },
    },
    allSettingsScreen: {
        subscription: '[de] Subscription',
        domains: '[de] Domains',
    },
    tabSelector: {
        chat: '[de] Chat',
        room: '[de] Room',
        distance: '[de] Distance',
        manual: '[de] Manual',
        scan: '[de] Scan',
        map: '[de] Map',
        gps: '[de] GPS',
        odometer: '[de] Odometer',
    },
    spreadsheet: {
        upload: '[de] Upload a spreadsheet',
        import: '[de] Import spreadsheet',
        dragAndDrop: '[de] <muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `[de] <muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '[de] <muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `[de] <muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: '[de] File contains column headers',
        column: (name: string) => `[de] Column ${name}`,
        fieldNotMapped: (fieldName: string) => `[de] Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `[de] Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `[de] Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: '[de] Import successful',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[de] No categories have been added or updated.';
            }
            if (added && updated) {
                return `[de] ${added} ${added === 1 ? '[de] category' : '[de] categories'} added, ${updated} ${updated === 1 ? '[de] category' : '[de] categories'} updated.`;
            }
            if (added) {
                return added === 1 ? '[de] 1 category has been added.' : `[de] ${added} categories have been added.`;
            }
            return updated === 1 ? '[de] 1 category has been updated.' : `[de] ${updated} categories have been updated.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[de] ${transactions} transactions have been added.` : '[de] 1 transaction has been added.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[de] No members have been added or updated.';
            }
            if (added && updated) {
                return `[de] ${added} member${added > 1 ? '[de] s' : ''} added, ${updated} member${updated > 1 ? '[de] s' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `[de] ${updated} members have been updated.` : '[de] 1 member has been updated.';
            }
            return added > 1 ? `[de] ${added} members have been added.` : '[de] 1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `[de] ${tags} tags have been added.` : '[de] 1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: '[de] Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `[de] ${rates} per diem rates have been added.` : '[de] 1 per diem rate has been added.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[de] ${transactions} transactions have been imported.` : '[de] 1 transaction has been imported.',
        importFailedTitle: '[de] Import failed',
        importFailedDescription: '[de] Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: '[de] Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: '[de] File size must be greater than 0 bytes',
        invalidFileMessage:
            '[de] The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: '[de] Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: '[de] Import spreadsheet',
        downloadCSV: '[de] Download CSV',
        importMemberConfirmation: () => ({
            one: `[de] Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `[de] Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: '[de] Upload receipt',
        uploadMultiple: '[de] Upload receipts',
        desktopSubtitleSingle: `[de] or drag and drop it here`,
        desktopSubtitleMultiple: `[de] or drag and drop them here`,
        alternativeMethodsTitle: '[de] Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `[de] <label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `[de] <label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `[de] <label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `[de] <label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: '[de] Take a photo',
        cameraAccess: '[de] Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `[de] Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: '[de] Camera error',
        cameraErrorMessage: '[de] An error occurred while taking a photo. Please try again.',
        locationAccessTitle: '[de] Allow location access',
        locationAccessMessage: '[de] Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: '[de] Allow location access',
        locationErrorMessage: '[de] Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `[de] Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '[de] Let it go',
        dropMessage: '[de] Drop your file here',
        flash: '[de] flash',
        multiScan: '[de] multi-scan',
        shutter: '[de] shutter',
        gallery: '[de] gallery',
        deleteReceipt: '[de] Delete receipt',
        deleteConfirmation: '[de] Are you sure you want to delete this receipt?',
        addReceipt: '[de] Add receipt',
        addAdditionalReceipt: '[de] Add additional receipt',
        scanFailed: "[de] The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        crop: '[de] Crop',
        addAReceipt: {
            phrase1: '[de] Add a receipt',
            phrase2: '[de] or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: '[de] Scan receipt',
        recordDistance: '[de] Track distance',
        requestMoney: '[de] Create expense',
        perDiem: '[de] Create per diem',
        splitBill: '[de] Split expense',
        splitScan: '[de] Split receipt',
        splitDistance: '[de] Split distance',
        paySomeone: (name?: string) => `[de] Pay ${name ?? '[de] someone'}`,
        assignTask: '[de] Assign task',
        header: '[de] Quick action',
        noLongerHaveReportAccess: '[de] You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: '[de] Update destination',
        createReport: '[de] Create report',
        createTimeExpense: '[de] Create time expense',
    },
    iou: {
        amount: '[de] Amount',
        percent: '[de] Percent',
        date: '[de] Date',
        taxAmount: '[de] Tax amount',
        taxRate: '[de] Tax rate',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `[de] Approve ${formattedAmount}` : '[de] Approve'),
        approved: '[de] Approved',
        cash: '[de] Cash',
        card: '[de] Card',
        original: '[de] Original',
        split: '[de] Split',
        splitExpense: '[de] Split expense',
        splitDates: '[de] Split dates',
        splitDateRange: (startDate: string, endDate: string, count: number) => `[de] ${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `[de] ${amount} from ${merchant}`,
        splitByPercentage: '[de] Split by percentage',
        splitByDate: '[de] Split by date',
        addSplit: '[de] Add split',
        makeSplitsEven: '[de] Make splits even',
        editSplits: '[de] Edit splits',
        totalAmountGreaterThanOriginal: (amount: string) => `[de] Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: (amount: string) => `[de] Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: '[de] Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: '[de] No splits added. Add at least one to save.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `[de] Edit ${amount} for ${merchant}`,
        removeSplit: '[de] Remove split',
        splitExpenseCannotBeEditedModalTitle: "[de] This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: '[de] Approved or paid expenses cannot be edited',
        paySomeone: (name?: string) => `[de] Pay ${name ?? '[de] someone'}`,
        splitExpenseDistanceErrorModalDescription: '[de] Please fix the distance rate error and try again.',
        splitExpensePerDiemRateErrorModalDescription: '[de] Please fix the per diem rate error and try again.',
        expense: '[de] Expense',
        categorize: '[de] Categorize',
        share: '[de] Share',
        participants: '[de] Participants',
        createExpense: '[de] Create expense',
        trackDistance: '[de] Track distance',
        createExpenses: (expensesNumber: number) => `[de] Create ${expensesNumber} expenses`,
        removeExpense: '[de] Remove expense',
        removeThisExpense: '[de] Remove this expense',
        removeExpenseConfirmation: '[de] Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: '[de] Add expense',
        chooseRecipient: '[de] Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `[de] Create ${amount} expense`,
        confirmDetails: '[de] Confirm details',
        pay: '[de] Pay',
        cancelPayment: '[de] Cancel payment',
        cancelPaymentConfirmation: '[de] Are you sure that you want to cancel this payment?',
        viewDetails: '[de] View details',
        pending: '[de] Pending',
        canceled: '[de] Canceled',
        posted: '[de] Posted',
        deleteReceipt: '[de] Delete receipt',
        findExpense: '[de] Find expense',
        deletedTransaction: (amount: string, merchant: string) => `[de] deleted an expense (${amount} for ${merchant})`,
        movedFromReport: (reportName: string) => `[de] moved an expense${reportName ? `[de]  from ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `[de] moved this expense${reportName ? `[de]  to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `[de] moved this expense${reportName ? `[de]  from <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `[de] moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `[de] moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `[de] moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: '[de] Receipt pending match with card transaction',
        pendingMatch: '[de] Pending match',
        pendingMatchWithCreditCardDescription: '[de] Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: '[de] Mark as cash',
        pendingMatchSubmitTitle: '[de] Submit report',
        pendingMatchSubmitDescription: '[de] Some expenses are awaiting a match with a credit card transaction. Do you want to mark them as cash?',
        routePending: '[de] Route pending...',
        automaticallyEnterExpenseDetails: '[de] Concierge will automatically enter the expense details for you, or you can add them manually.',
        receiptScanning: () => ({
            one: '[de] Receipt scanning...',
            other: '[de] Receipts scanning...',
        }),
        scanMultipleReceipts: '[de] Scan multiple receipts',
        scanMultipleReceiptsDescription: "[de] Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: '[de] Receipt scan in progress',
        receiptScanInProgressDescription: '[de] Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: '[de] Remove from report',
        moveToPersonalSpace: '[de] Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '[de] Potential duplicate expenses identified. Review duplicates to enable submission.'
                : '[de] Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: '[de] Issue found',
            other: '[de] Issues found',
        }),
        fieldPending: '[de] Pending...',
        defaultRate: '[de] Default rate',
        receiptMissingDetails: '[de] Receipt missing details',
        missingAmount: '[de] Missing amount',
        missingMerchant: '[de] Missing merchant',
        receiptStatusTitle: '[de] Scanning…',
        receiptStatusText: "[de] Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: '[de] Receipt scanning failed. Please enter the details manually.',
        transactionPendingDescription: '[de] Transaction pending. It may take a few days to post.',
        companyInfo: '[de] Company info',
        companyInfoDescription: '[de] We need a few more details before you can send your first invoice.',
        yourCompanyName: '[de] Your company name',
        yourCompanyWebsite: '[de] Your company website',
        yourCompanyWebsiteNote: "[de] If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: '[de] You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: '[de] You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '[de] 1 expense',
                other: (count: number) => `[de] ${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: '[de] Delete expense',
            other: '[de] Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: '[de] Are you sure that you want to delete this expense?',
            other: '[de] Are you sure that you want to delete these expenses?',
        }),
        deleteReport: () => ({
            one: '[de] Delete report',
            other: '[de] Delete reports',
        }),
        deleteReportConfirmation: () => ({
            one: '[de] Are you sure that you want to delete this report?',
            other: '[de] Are you sure that you want to delete these reports?',
        }),
        settledExpensify: '[de] Paid',
        done: '[de] Done',
        deleted: '[de] Deleted',
        settledElsewhere: '[de] Paid elsewhere',
        individual: '[de] Individual',
        business: '[de] Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `[de] Pay ${formattedAmount} as an individual` : `[de] Pay with personal account`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `[de] Pay ${formattedAmount} with wallet` : `[de] Pay with wallet`),
        settlePayment: (formattedAmount: string) => `[de] Pay ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `[de] Pay ${formattedAmount} as a business` : `[de] Pay with business account`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `[de] Mark ${formattedAmount} as paid` : `[de] Mark as paid`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `[de] paid ${amount} with personal account ${last4Digits}` : `[de] Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `[de] paid ${amount} with business account ${last4Digits}` : `[de] Paid with business account`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `[de] Pay ${formattedAmount} via ${policyName}` : `[de] Pay via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `[de] paid ${amount} with bank account ${last4Digits}` : `[de] paid with bank account ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `[de] paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `[de] Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `[de] Business Account • ${lastFour}`,
        nextStep: '[de] Next steps',
        finished: '[de] Finished',
        flip: '[de] Flip',
        sendInvoice: (amount: string) => `[de] Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `[de]  for ${comment}` : ''}`,
        submitted: (memo?: string) => `[de] submitted${memo ? `[de] , saying ${memo}` : ''}`,
        automaticallySubmitted: `[de] submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: '[de] queued to submit via custom approval workflow',
        failedToAutoSubmitViaDEW: (reason: string) => `[de] failed to submit the report via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `[de] failed to submit the report. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `[de] failed to approve via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `[de] failed to approve. ${reason}`,
        queuedToApproveViaDEW: '[de] queued to approve via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `[de] tracking ${formattedAmount}${comment ? `[de]  for ${comment}` : ''}`,
        splitAmount: (amount: string) => `[de] split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `[de] split ${formattedAmount}${comment ? `[de]  for ${comment}` : ''}`,
        yourSplit: (amount: string) => `[de] Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `[de] ${payer} owes ${amount}${comment ? `[de]  for ${comment}` : ''}`,
        payerOwes: (payer: string) => `[de] ${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `[de] ${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: (payer: string) => `[de] ${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `[de] ${payer} spent ${amount}`,
        payerSpent: (payer: string) => `[de] ${payer} spent: `,
        managerApproved: (manager: string) => `[de] ${manager} approved:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `[de] ${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `[de] paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `[de] paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `[de] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `[de] approved ${amount}`,
        approvedMessage: `[de] approved`,
        unapproved: `[de] unapproved`,
        automaticallyForwarded: `[de] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `[de] approved`,
        rejectedThisReport: '[de] rejected',
        waitingOnBankAccount: (submitterDisplayName: string) => `[de] started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: '[de] canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `[de] canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `[de] ${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `[de] ${payer ? `${payer} ` : ''}marked as paid${comment ? `[de] , saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `[de] ${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `[de] ${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        reimbursedThisReport: '[de] reimbursed this report',
        paidThisBill: '[de] paid this bill',
        reimbursedOnBehalfOf: (actor: string) => `[de] on behalf of ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `[de] from the bank account ending in ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `[de] ${submitter} added a bank account, taking report off hold. Reimbursement is initiated`,
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
                ? `[de] . Money is on its way to your${creditBankAccount ? `[de]  bank account ending in ${creditBankAccount}` : '[de]  account'}. Reimbursement estimated to complete on ${expectedDate}.`
                : `[de] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[de]  bank account ending in ${creditBankAccount}` : '[de]  account'}. Reimbursement estimated to complete on ${expectedDate}.`,
        reimbursedWithCheck: '[de]  via check.',
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
            const paymentMethod = isCard ? '[de] card' : '[de] bank account';
            return isCurrentUser
                ? `[de] . Money is on its way to your${creditBankAccount ? `[de]  bank account ending in ${creditBankAccount}` : '[de]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`
                : `[de] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[de]  bank account ending in ${creditBankAccount}` : '[de]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `[de]  with direct deposit (ACH)${creditBankAccount ? `[de]  to the bank account ending in ${creditBankAccount}. ` : '. '}${expectedDate ? `[de] The reimbursement is estimated to complete by ${expectedDate}.` : '[de] This generally takes 4-5 business days.'}`,
        noReimbursableExpenses: '[de] This report has an invalid amount',
        pendingConversionMessage: "[de] Total will update when you're back online",
        changedTheExpense: '[de] changed the expense',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `[de] the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `[de] set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `[de] the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `[de] the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `[de] changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: '[de] based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `[de] based on <a href="${rulesLink}">workspace rules</a>` : '[de] based on workspace rule'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `[de] for ${comment}` : '[de] expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `[de] Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `[de] ${formattedAmount} sent${comment ? `[de]  for ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) => `[de] moved expense from personal space to ${workspaceName ?? `[de] chat with ${reportName}`}`,
        movedToPersonalSpace: '[de] moved expense to personal space',
        error: {
            invalidCategoryLength: '[de] The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: '[de] The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: '[de] Please enter a valid amount before continuing',
            invalidDistance: '[de] Please enter a valid distance before continuing',
            invalidReadings: '[de] Please enter both start and end readings',
            negativeDistanceNotAllowed: '[de] End reading must be greater than start reading',
            distanceAmountTooLarge: '[de] The total amount is too large. Reduce the distance or lower the rate.',
            distanceAmountTooLargeReduceDistance: '[de] The total amount is too large. Reduce the distance.',
            distanceAmountTooLargeReduceRate: '[de] The total amount is too large. Lower the rate.',
            odometerReadingTooLarge: (formattedMax: string) => `[de] Odometer readings cannot exceed ${formattedMax}.`,
            stitchOdometerImagesFailed: '[de] Failed to combine odometer images. Please try again later.',
            invalidIntegerAmount: '[de] Please enter a whole dollar amount before continuing',
            invalidTaxAmount: (amount: string) => `[de] Maximum tax amount is ${amount}`,
            invalidSplit: '[de] The sum of splits must equal the total amount',
            invalidSplitParticipants: '[de] Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: '[de] Please enter a non-zero amount for your split',
            noParticipantSelected: '[de] Please select a participant',
            other: '[de] Unexpected error. Please try again later.',
            genericCreateFailureMessage: '[de] Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: '[de] Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: '[de] Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: '[de] Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: '[de] Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '[de] <rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: '[de] There was an error uploading your receipt.',
            genericDeleteFailureMessage: '[de] Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: '[de] Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: '[de] Transaction is missing fields',
            duplicateWaypointsErrorMessage: '[de] Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: '[de] Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: '[de] An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: '[de] Please enter a valid merchant',
            atLeastOneAttendee: '[de] At least one attendee must be selected',
            invalidQuantity: '[de] Please enter a valid quantity',
            quantityGreaterThanZero: '[de] Quantity must be greater than zero',
            invalidSubrateLength: '[de] There must be at least one subrate',
            invalidRate: '[de] Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "[de] The end date can't be before the start date",
            endDateSameAsStartDate: "[de] The end date can't be the same as the start date",
            manySplitsProvided: `[de] The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `[de] The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
        },
        dismissReceiptError: '[de] Dismiss error',
        dismissReceiptErrorConfirmation: '[de] Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `[de] started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: '[de] Enable wallet',
        hold: '[de] Hold',
        unhold: '[de] Remove hold',
        holdExpense: () => ({
            one: '[de] Hold expense',
            other: '[de] Hold expenses',
        }),
        unholdExpense: '[de] Unhold expense',
        heldExpense: '[de] held this expense',
        unheldExpense: '[de] unheld this expense',
        moveUnreportedExpense: '[de] Move unreported expense',
        addUnreportedExpense: '[de] Add unreported expense',
        selectUnreportedExpense: '[de] Select at least one expense to add to the report.',
        emptyStateUnreportedExpenseTitle: '[de] No unreported expenses',
        emptyStateUnreportedExpenseSubtitle: '[de] Looks like you don’t have any unreported expenses. Try creating one below.',
        addUnreportedExpenseConfirm: '[de] Add to report',
        newReport: '[de] New report',
        explainHold: () => ({
            one: "[de] Explain why you're holding this expense.",
            other: "[de] Explain why you're holding these expenses.",
        }),
        explainHoldApprover: () => ({
            one: '[de] Explain what you need before approving this expense.',
            other: '[de] Explain what you need before approving these expenses.',
        }),
        retracted: '[de] retracted',
        retract: '[de] Retract',
        reopened: '[de] reopened',
        reopenReport: '[de] Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `[de] This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: '[de] Reason',
        holdReasonRequired: '[de] A reason is required when holding.',
        expenseWasPutOnHold: '[de] Expense was put on hold',
        expenseOnHold: '[de] This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: '[de] All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: '[de] This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: '[de] Some of these duplicates have been approved or paid already.',
        reviewDuplicates: '[de] Review duplicates',
        keepAll: '[de] Keep all',
        noDuplicatesTitle: '[de] All set!',
        noDuplicatesDescription: '[de] There are no duplicate transactions for review here.',
        confirmApprove: '[de] Confirm approval amount',
        confirmApprovalAmount: '[de] Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: '[de] This expense is on hold. Do you want to approve anyway?',
            other: '[de] These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: '[de] Confirm payment amount',
        confirmPayAmount: "[de] Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: '[de] This expense is on hold. Do you want to pay anyway?',
            other: '[de] These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: '[de] Pay only',
        approveOnly: '[de] Approve only',
        holdEducationalTitle: '[de] Should you hold this expense?',
        whatIsHoldExplain: "[de] Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: '[de] Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "[de] Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: '[de] You moved this report!',
            description: '[de] Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '[de] <strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: '[de] This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: '[de] Change workspace',
        set: '[de] set',
        changed: '[de] changed',
        removed: '[de] removed',
        transactionPending: '[de] Transaction pending.',
        chooseARate: '[de] Select a workspace reimbursement rate per mile or kilometer',
        unapprove: '[de] Unapprove',
        unapproveReport: '[de] Unapprove report',
        headsUp: '[de] Heads up!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `[de] This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: '[de] reimbursable',
        nonReimbursable: '[de] non-reimbursable',
        bookingPending: '[de] This booking is pending',
        bookingPendingDescription: "[de] This booking is pending because it hasn't been paid yet.",
        bookingArchived: '[de] This booking is archived',
        bookingArchivedDescription: '[de] This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: '[de] Attendees',
        totalPerAttendee: '[de] Per attendee',
        whoIsYourAccountant: '[de] Who is your accountant?',
        paymentComplete: '[de] Payment complete',
        time: '[de] Time',
        startDate: '[de] Start date',
        endDate: '[de] End date',
        startTime: '[de] Start time',
        endTime: '[de] End time',
        deleteSubrate: '[de] Delete subrate',
        deleteSubrateConfirmation: '[de] Are you sure you want to delete this subrate?',
        quantity: '[de] Quantity',
        subrateSelection: '[de] Select a subrate and enter a quantity.',
        qty: '[de] Qty',
        firstDayText: () => ({
            one: `[de] First day: 1 hour`,
            other: (count: number) => `[de] First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `[de] Last day: 1 hour`,
            other: (count: number) => `[de] Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `[de] Trip: 1 full day`,
            other: (count: number) => `[de] Trip: ${count} full days`,
        }),
        dates: '[de] Dates',
        rates: '[de] Rates',
        submitsTo: (name: string) => `[de] Submits to ${name}`,
        reject: {
            educationalTitle: '[de] Should you hold or reject?',
            educationalText: "[de] If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: '[de] Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: '[de] Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: '[de] Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "[de] Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: '[de] Reject expense',
            reasonPageDescription: '[de] Explain why you will not approve this expense.',
            rejectReason: '[de] Rejection reason',
            markAsResolved: '[de] Mark as resolved',
            rejectedStatus: '[de] This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: '[de] rejected this expense',
                markedAsResolved: '[de] marked the rejection reason as resolved',
            },
        },
        rejectReport: {
            title: '[de] Reject report',
            description: '[de] Explain why you will not approve this report:',
            rejectReason: '[de] Rejection reason',
            selectTarget: '[de] Choose the member to reject this report back to for review:',
            lastApprover: '[de] Last approver',
            submitter: '[de] Submitter',
            rejectedReportMessage: '[de] This report was rejected.',
            rejectedNextStep: '[de] This report was rejected. Waiting on you to fix the issues and manually resubmit.',
            selectMemberError: '[de] Select a member to reject this report back to.',
            couldNotReject: '[de] The report could not be rejected. Please try again.',
        },
        moveExpenses: '[de] Move to report',
        moveExpensesError: "[de] You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: '[de] Change approver',
            header: (workflowSettingLink: string) =>
                `[de] Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `[de] changed the approver to <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '[de] Add approver',
                addApproverSubtitle: '[de] Add an additional approver to the existing workflow.',
                bypassApprovers: '[de] Bypass approvers',
                bypassApproversSubtitle: '[de] Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: '[de] Choose an additional approver for this report before we route through the rest of the approval workflow.',
                bulkSubtitle: '[de] Choose an additional approver for these reports before we route through the rest of the approval workflow.',
            },
            bulkSubtitle: '[de] Choose an option to change the approver for these reports.',
        },
        chooseWorkspace: '[de] Choose a workspace',
        routedDueToDEW: (to: string, reason?: string) => `[de] report routed to ${to}${reason ? `[de]  because ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `[de] ${hours} ${hours === 1 ? '[de] hour' : '[de] hours'} @ ${rate} / hour`,
            hrs: '[de] hrs',
            hours: '[de] Hours',
            ratePreview: (rate: string) => `[de] ${rate} / hour`,
            amountTooLargeError: '[de] The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctRateError: '[de] Fix the rate error and try again.',
        AskToExplain: `[de] . <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explain<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '[de] marked the expense as "reimbursable"' : '[de] marked the expense as "non-reimbursable"'),
            billable: (value: boolean) => (value ? '[de] marked the expense as "billable"' : '[de] marked the expense as "non-billable"'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `[de] set the tax rate to "${value}"` : `[de] tax rate to "${value}"`),
            reportName: (value: string) => `[de] moved this expense to report "${value}"`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `[de] set the ${field} to "${value}"` : `[de] ${field} to "${value}"`;
            },
            formatPersonalRules: (fragments: string, route: string) => `[de] ${fragments} via <a href="${route}">personal expense rules</a>`,
            formatPolicyRules: (fragments: string, route: string) => `[de] ${fragments} via <a href="${route}">workspace rules</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: "[de] You can't duplicate per diem expenses across workspaces because the rates may differ between workspaces.",
        cannotDuplicateDistanceExpense: "[de] You can't duplicate distance expenses across workspaces because the rates may differ between workspaces.",
        taxDisabledAlert: {
            title: '[de] Tax disabled',
            prompt: '[de] Enable tax tracking on the workspace to edit the expense details or delete the tax from this expense.',
            confirmText: '[de] Delete tax',
        },
    },
    transactionMerge: {
        listPage: {
            header: '[de] Merge expenses',
            noEligibleExpenseFound: '[de] No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `[de] <muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `[de] Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '[de] Select receipt',
            pageTitle: '[de] Select the receipt you want to keep:',
        },
        detailsPage: {
            header: '[de] Select details',
            pageTitle: '[de] Select the details you want to keep:',
            noDifferences: '[de] No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '[de] an' : '[de] a';
                return `[de] Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: '[de] Please select attendees',
            selectAllDetailsError: '[de] Select all details before continuing.',
        },
        confirmationPage: {
            header: '[de] Confirm details',
            pageTitle: "[de] Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: '[de] Merge expenses',
        },
    },
    share: {
        shareToExpensify: '[de] Share to Expensify',
        messageInputLabel: '[de] Message',
    },
    notificationPreferencesPage: {
        header: '[de] Notification preferences',
        label: '[de] Notify me about new messages',
        notificationPreferences: {
            always: '[de] Immediately',
            daily: '[de] Daily',
            mute: '[de] Mute',
            hidden: '[de][ctx: UI label indicating that something is concealed or not visible to the user.] Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "[de] The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "[de] The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: '[de] Upload photo',
        removePhoto: '[de] Remove photo',
        editImage: '[de] Edit photo',
        viewPhoto: '[de] View photo',
        imageUploadFailed: '[de] Image upload failed',
        deleteWorkspaceError: '[de] Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `[de] The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `[de] Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `[de] Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: '[de] Edit profile picture',
        upload: '[de] Upload',
        uploadPhoto: '[de] Upload photo',
        selectAvatar: '[de] Select avatar',
        choosePresetAvatar: '[de] Or choose a custom avatar',
    },
    modal: {
        backdropLabel: '[de] Modal Backdrop',
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
                        return `[de] Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] Waiting for an admin to add expenses.`;
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
                        return `[de] Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] Waiting for an admin to submit expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `[de] No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[de] Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] Waiting for an admin to add a bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[de]  on the ${eta} of each month` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[de] Waiting for your expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] Waiting for an admin's expenses to automatically submit${formattedETA}.`;
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
                        return `[de] Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] Waiting for an admin to fix the issues.`;
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
                        return `[de] Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] Waiting for an admin to approve expenses.`;
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
                        return `[de] Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] Waiting for an admin to export this report.`;
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
                        return `[de] Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] Waiting for an admin to pay expenses.`;
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
                        return `[de] Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] Waiting for an admin to finish setting up a business bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[de]  by ${eta}` : ` ${eta}`;
                }
                return `[de] Waiting for payment to complete${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `[de] Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[de] This report was rejected. Waiting on <strong>you</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[de] This report was rejected. Waiting on <strong>${actor}</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[de] This report was rejected. Waiting on an admin to fix the issues and manually resubmit.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '[de] shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '[de] later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '[de] on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '[de] on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '[de] on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '[de] on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '[de] at the end of your trip',
        },
    },
    profilePage: {
        profile: '[de] Profile',
        preferredPronouns: '[de] Preferred pronouns',
        selectYourPronouns: '[de] Select your pronouns',
        selfSelectYourPronoun: '[de] Self-select your pronoun',
        emailAddress: '[de] Email address',
        setMyTimezoneAutomatically: '[de] Set my timezone automatically',
        timezone: '[de] Timezone',
        invalidFileMessage: '[de] Invalid file. Please try a different image.',
        avatarUploadFailureMessage: '[de] An error occurred uploading the avatar. Please try again.',
        online: '[de] Online',
        offline: '[de] Offline',
        syncing: '[de] Syncing',
        profileAvatar: '[de] Profile avatar',
        publicSection: {
            title: '[de] Public',
            subtitle: '[de] These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: '[de] Private',
            subtitle: "[de] These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: '[de] Security options',
        subtitle: '[de] Enable two-factor authentication to keep your account safe.',
        goToSecurity: '[de] Go back to security page',
    },
    shareCodePage: {
        title: '[de] Your code',
        subtitle: '[de] Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: '[de] Pronouns',
        isShownOnProfile: '[de] Your pronouns are shown on your profile.',
        placeholderText: '[de] Search to see options',
    },
    contacts: {
        contactMethods: '[de] Contact methods',
        featureRequiresValidate: '[de] This feature requires you to validate your account.',
        validateAccount: '[de] Validate your account',
        helpText: ({email}: {email: string}) =>
            `[de] Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: '[de] Please verify this contact method.',
        getInTouch: "[de] We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `[de] Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '[de] Set as default',
        yourDefaultContactMethod: "[de] This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        yourDefaultContactMethodRestrictedSwitch: '[de] This is your current default contact method. Your company has restricted removing or changing it.',
        removeContactMethod: '[de] Remove contact method',
        removeAreYouSure: "[de] Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: '[de] Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: '[de] Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: '[de] Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: '[de] Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: '[de] Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: '[de] Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: '[de] This contact method already exists',
            passwordRequired: '[de] password required.',
            contactMethodRequired: '[de] Contact method is required',
            invalidContactMethod: '[de] Invalid contact method',
        },
        newContactMethod: '[de] New contact method',
        goBackContactMethods: '[de] Go back to contact methods',
    },
    pronouns: {
        coCos: '[de] Co / Cos',
        eEyEmEir: '[de] E / Ey / Em / Eir',
        faeFaer: '[de] Fae / Faer',
        heHimHis: '[de] He / Him / His',
        heHimHisTheyThemTheirs: '[de] He / Him / His / They / Them / Theirs',
        sheHerHers: '[de] She / Her / Hers',
        sheHerHersTheyThemTheirs: '[de] She / Her / Hers / They / Them / Theirs',
        merMers: '[de] Mer / Mers',
        neNirNirs: '[de] Ne / Nir / Nirs',
        neeNerNers: '[de] Nee / Ner / Ners',
        perPers: '[de] Per / Pers',
        theyThemTheirs: '[de] They / Them / Theirs',
        thonThons: '[de] Thon / Thons',
        veVerVis: '[de] Ve / Ver / Vis',
        viVir: '[de] Vi / Vir',
        xeXemXyr: '[de] Xe / Xem / Xyr',
        zeZieZirHir: '[de] Ze / Zie / Zir / Hir',
        zeHirHirs: '[de] Ze / Hir',
        callMeByMyName: '[de] Call me by my name',
    },
    displayNamePage: {
        headerTitle: '[de] Display name',
        isShownOnProfile: '[de] Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: '[de] Timezone',
        isShownOnProfile: '[de] Your timezone is shown on your profile.',
        getLocationAutomatically: '[de] Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: '[de] Update required',
        pleaseInstall: '[de] Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: '[de] Please install the latest version of Expensify',
        toGetLatestChanges: '[de] For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: '[de] The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: '[de] About',
        aboutPage: {
            description: '[de] The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: '[de] App download links',
            viewKeyboardShortcuts: '[de] View keyboard shortcuts',
            viewTheCode: '[de] View the code',
            viewOpenJobs: '[de] View open jobs',
            reportABug: '[de] Report a bug',
            troubleshoot: '[de] Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: '[de] Android',
            },
            ios: {
                label: '[de] iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '[de] Clear cache and restart',
            description:
                '[de] <muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: '[de] All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: '[de] Reset and refresh',
            clientSideLogging: '[de] Client side logging',
            noLogsToShare: '[de] No logs to share',
            useProfiling: '[de] Use profiling',
            profileTrace: '[de] Profile trace',
            results: '[de] Results',
            releaseOptions: '[de] Release options',
            testingPreferences: '[de] Testing preferences',
            useStagingServer: '[de] Use Staging Server',
            forceOffline: '[de] Force offline',
            simulatePoorConnection: '[de] Simulate poor internet connection',
            simulateFailingNetworkRequests: '[de] Simulate failing network requests',
            authenticationStatus: '[de] Authentication status',
            deviceCredentials: '[de] Device credentials',
            invalidate: '[de] Invalidate',
            destroy: '[de] Destroy',
            maskExportOnyxStateData: '[de] Mask fragile member data while exporting Onyx state',
            exportOnyxState: '[de] Export Onyx state',
            importOnyxState: '[de] Import Onyx state',
            testCrash: '[de] Test crash',
            resetToOriginalState: '[de] Reset to original state',
            usingImportedState: '[de] You are using imported state. Press here to clear it.',
            debugMode: '[de] Debug mode',
            invalidFile: '[de] Invalid file',
            invalidFileDescription: '[de] The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: '[de] Invalidate with delay',
            leftHandNavCache: '[de] Left Hand Nav cache',
            clearleftHandNavCache: '[de] Clear',
            softKillTheApp: '[de] Soft kill the app',
            kill: '[de] Kill',
            sentryDebug: '[de] Sentry debug',
            sentrySendDescription: '[de] Send data to Sentry',
            sentryDebugDescription: '[de] Log Sentry requests to console',
            sentryHighlightedSpanOps: '[de] Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: '[de] ui.interaction.click, navigation, ui.load',
        },
        security: '[de] Security',
        signOut: '[de] Sign out',
        restoreStashed: '[de] Restore stashed login',
        signOutConfirmationText: "[de] You'll lose any offline changes if you sign out.",
        versionLetter: '[de] v',
        readTheTermsAndPrivacy: `[de] Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.`,
        help: '[de] Help',
        helpPage: {
            title: '[de] Help and support',
            description: '[de] We are here to help you 24/7',
            helpSite: '[de] Help site',
            conciergeChat: '[de] Concierge',
            conciergeChatDescription: '[de] Your personal AI agent',
            accountManagerDescription: '[de] Your account manager',
            partnerManagerDescription: '[de] Your partner manager',
            guideDescription: '[de] Your setup specialist',
        },
        whatIsNew: "[de] What's new",
        accountSettings: '[de] Account settings',
        account: '[de] Account',
        general: '[de] General',
    },
    closeAccountPage: {
        closeAccount: '[de][ctx: close as a verb, not an adjective] Close account',
        reasonForLeavingPrompt: '[de] We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: '[de] Enter message here',
        closeAccountWarning: '[de] Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: '[de] Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: '[de] Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: '[de] Enter your default contact method',
        defaultContact: '[de] Default contact method:',
        enterYourDefaultContactMethod: '[de] Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: '[de] Merge accounts',
        accountDetails: {
            accountToMergeInto: (login: string) => `[de] Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: '[de] I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: '[de] Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: (login: string) => `[de] Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `[de] To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: '[de] Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: '[de] Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: '[de] Accounts merged!',
            description: (from: string, to: string) =>
                `[de] <muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '[de] We’re working on it',
            limitedSupport: '[de] We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp: '[de] <muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: '[de] Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `[de] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `[de] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `[de] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: '[de] Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `[de] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `[de] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `[de] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `[de] <muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '[de] Try again later',
            description: '[de] There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "[de] You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: '[de] You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: '[de] Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '[de] Report suspicious activity',
        lockAccount: '[de] Lock account',
        unlockAccount: '[de] Unlock account',
        unlockTitle: '[de] We’ve received your request',
        unlockDescription: '[de] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        compromisedDescription:
            '[de] Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: '[de] For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: '[de] Are you sure you want to lock your Expensify account?',
        onceLocked: '[de] Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '[de] Failed to lock account',
        failedToLockAccountDescription: `[de] We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: '[de] Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: '[de] Account locked',
        yourAccountIsLocked: '[de] Your account is locked',
        chatToConciergeToUnlock: '[de] Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: '[de] Chat with Concierge',
    },
    twoFactorAuth: {
        headerTitle: '[de] Two-factor authentication',
        twoFactorAuthEnabled: '[de] Two-factor authentication enabled',
        whatIsTwoFactorAuth: '[de] Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: '[de] Disable two-factor authentication',
        explainProcessToRemove: '[de] To disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: '[de] To disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: '[de] Two-factor authentication is now disabled',
        noAuthenticatorApp: '[de] You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: '[de] Recovery codes',
        keepCodesSafe: '[de] Keep these recovery codes safe!',
        codesLoseAccess: dedent(`
            [de] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            Note: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        errorStepCodes: '[de] Please copy or download codes before continuing',
        stepVerify: '[de] Verify',
        scanCode: '[de] Scan the QR code using your',
        authenticatorApp: '[de] authenticator app',
        addKey: '[de] Or add this secret key to your authenticator app:',
        secretKey: '[de] secret key',
        enterCode: '[de] Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: '[de] Finished',
        enabled: '[de] Two-factor authentication enabled',
        congrats: '[de] Congrats! Now you’ve got that extra security.',
        copy: '[de] Copy',
        disable: '[de] Disable',
        enableTwoFactorAuth: '[de] Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: '[de] Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: '[de] For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: '[de] Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: '[de] Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: '[de] Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: '[de] Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: '[de] Cannot disable 2FA',
        twoFactorAuthRequired: '[de] Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
        replaceDevice: '[de] Replace device',
        replaceDeviceTitle: '[de] Replace two-factor device',
        verifyOldDeviceTitle: '[de] Verify old device',
        verifyOldDeviceDescription: '[de] Enter the six-digit code from your current authenticator app to confirm you have access to it.',
        verifyNewDeviceTitle: '[de] Set up new device',
        verifyNewDeviceDescription: '[de] Scan the QR code with your new device, then enter the code to complete setup.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '[de] Please enter your recovery code',
            incorrectRecoveryCode: '[de] Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: '[de] Use recovery code',
        recoveryCode: '[de] Recovery code',
        use2fa: '[de] Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '[de] Please enter your two-factor authentication code',
            incorrect2fa: '[de] Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '[de] Password updated!',
        allSet: '[de] You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: '[de] Private notes',
        personalNoteMessage: "[de] Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: '[de] Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: '[de] Notes',
        myNote: '[de] My note',
        error: {
            genericFailureMessage: "[de] Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: '[de] Please enter a valid security code',
        },
        securityCode: '[de] Security code',
        changeBillingCurrency: '[de] Change billing currency',
        changePaymentCurrency: '[de] Change payment currency',
        paymentCurrency: '[de] Payment currency',
        paymentCurrencyDescription: '[de] Select a standardized currency that all personal expenses should be converted to',
        note: `[de] Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: '[de] Add a debit card',
        nameOnCard: '[de] Name on card',
        debitCardNumber: '[de] Debit card number',
        expiration: '[de] Expiration date',
        expirationDate: '[de] MMYY',
        cvv: '[de] CVV',
        billingAddress: '[de] Billing address',
        growlMessageOnSave: '[de] Your debit card was successfully added',
        expensifyPassword: '[de] Expensify password',
        error: {
            invalidName: '[de] Name can only include letters',
            addressZipCode: '[de] Please enter a valid zip code',
            debitCardNumber: '[de] Please enter a valid debit card number',
            expirationDate: '[de] Please select a valid expiration date',
            securityCode: '[de] Please enter a valid security code',
            addressStreet: "[de] Please enter a valid billing address that's not a PO box",
            addressState: '[de] Please select a state',
            addressCity: '[de] Please enter a city',
            genericFailureMessage: '[de] An error occurred while adding your card. Please try again.',
            password: '[de] Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '[de] Add payment card',
        nameOnCard: '[de] Name on card',
        paymentCardNumber: '[de] Card number',
        expiration: '[de] Expiration date',
        expirationDate: '[de] MM/YY',
        cvv: '[de] CVV',
        billingAddress: '[de] Billing address',
        growlMessageOnSave: '[de] Your payment card was successfully added',
        expensifyPassword: '[de] Expensify password',
        error: {
            invalidName: '[de] Name can only include letters',
            addressZipCode: '[de] Please enter a valid zip code',
            paymentCardNumber: '[de] Please enter a valid card number',
            expirationDate: '[de] Please select a valid expiration date',
            securityCode: '[de] Please enter a valid security code',
            addressStreet: "[de] Please enter a valid billing address that's not a PO box",
            addressState: '[de] Please select a state',
            addressCity: '[de] Please enter a city',
            genericFailureMessage: '[de] An error occurred while adding your card. Please try again.',
            password: '[de] Please enter your Expensify password',
        },
    },
    personalCard: {
        addPersonalCard: '[de] Add personal card',
        addCompanyCard: '[de] Add company card',
        lookingForCompanyCards: '[de] Need to add company cards?',
        lookingForCompanyCardsDescription: '[de] Bring your own cards from 10,000+ banks worldwide.',
        personalCardAdded: '[de] Personal card added!',
        personalCardAddedDescription: '[de] Congrats, we’ll begin importing transactions from your card.',
        isPersonalCard: '[de] Is this a personal card?',
        thisIsPersonalCard: '[de] This is a personal card',
        thisIsCompanyCard: '[de] This is a company card',
        askAdmin: '[de] Ask your admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `[de] If so, great! But if it's a <strong>company</strong> card, please ${isAdmin ? '[de] assign it from your workspace instead.' : '[de] ask your admin to assign it to you from the workspace instead.'}`,
        bankConnectionError: '[de] Bank connection issue',
        bankConnectionDescription: '[de] Please try adding your cards again. Otherwise, you can',
        connectWithPlaid: '[de] connect via Plaid.',
        brokenConnection: '[de] Your card connection is broken.',
        fixCard: '[de] Fix card',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `[de] Your ${cardName} card connection is broken. <a href="${connectionLink}">Log into your bank</a> to fix the card.`
                : `[de] Your ${cardName} card connection is broken. Log into your bank to fix the card.`,
        addAdditionalCards: '[de] Add additional cards',
        upgradeDescription: '[de] Need to add more cards? Create a workspace to add additional personal cards or assign company cards to the entire team.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `[de] <muted-text>This is available on the Collect plan, which is <strong>${formattedPrice}</strong> per member per month.</muted-text>`,
        note: (subscriptionLink: string) =>
            `[de] <muted-text>Create a workspace to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
        workspaceCreated: '[de] Workspace created',
        newWorkspace: '[de] You created a workspace!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `[de] <centered-text>You’re all set to add additional cards. <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
    },
    walletPage: {
        balance: '[de] Balance',
        paymentMethodsTitle: '[de] Payment methods',
        setDefaultConfirmation: '[de] Make default payment method',
        setDefaultSuccess: '[de] Default payment method set!',
        deleteAccount: '[de] Delete account',
        deleteConfirmation: '[de] Are you sure you want to delete this account?',
        deleteCard: '[de] Delete card',
        deleteCardConfirmation:
            '[de] All unsubmitted card transactions, including those on open reports, will be removed. Are you sure you want to delete this card? You cannot undo this action.',
        error: {
            notOwnerOfBankAccount: '[de] An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: '[de] This bank account is temporarily suspended',
            notOwnerOfFund: '[de] An error occurred while setting this card as your default payment method',
            setDefaultFailure: '[de] Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: '[de] An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: '[de] Get paid faster',
        addPaymentMethod: '[de] Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: '[de] Get paid back faster',
        secureAccessToYourMoney: '[de] Secure access to your money',
        receiveMoney: '[de] Receive money in your local currency',
        expensifyWallet: '[de] Expensify Wallet (Beta)',
        sendAndReceiveMoney: '[de] Send and receive money with friends. US bank accounts only.',
        enableWallet: '[de] Enable wallet',
        addBankAccountToSendAndReceive: '[de] Add a bank account to make or receive payments.',
        addDebitOrCreditCard: '[de] Add debit or credit card',
        cardInactive: '[de] Inactive',
        assignedCards: '[de] Assigned cards',
        assignedCardsDescription: '[de] Transactions from these cards sync automatically.',
        expensifyCard: '[de] Expensify Card',
        walletActivationPending: "[de] We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "[de] Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: '[de] Add your bank account',
        addBankAccountBody: "[de] Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: '[de] Choose your bank account',
        chooseAccountBody: '[de] Make sure that you select the right one.',
        confirmYourBankAccount: '[de] Confirm your bank account',
        personalBankAccounts: '[de] Personal bank accounts',
        businessBankAccounts: '[de] Business bank accounts',
        shareBankAccount: '[de] Share bank account',
        bankAccountShared: '[de] Bank account shared',
        shareBankAccountTitle: '[de] Select the admins to share this bank account with:',
        shareBankAccountSuccess: '[de] Bank account shared!',
        shareBankAccountSuccessDescription: '[de] The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: '[de] An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: '[de] No admins available',
        shareBankAccountEmptyDescription: '[de] There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: '[de] Please select an admin before continuing',
        unshareBankAccount: '[de] Unshare bank account',
        unshareBankAccountDescription: '[de] Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `[de] ${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: '[de] It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: `[de] Can't unshare bank account`,
        travelCVV: {
            title: '[de] Travel CVV',
            subtitle: '[de] Use this when booking travel',
            description: "[de] Use this card for your Expensify Travel bookings. It'll show as “Travel Card” at checkout.",
        },
        chaseAccountNumberDifferent: '[de] Why is my account number different?',
    },
    cardPage: {
        expensifyCard: '[de] Expensify Card',
        expensifyTravelCard: '[de] Expensify Travel Card',
        availableSpend: '[de] Remaining limit',
        smartLimit: {
            name: '[de] Smart limit',
            title: (formattedLimit: string) => `[de] You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: '[de] Fixed limit',
            title: (formattedLimit: string) => `[de] You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: '[de] Monthly limit',
            title: (formattedLimit: string) => `[de] You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: '[de] Virtual card number',
        travelCardCvv: '[de] Travel card CVV',
        physicalCardNumber: '[de] Physical card number',
        physicalCardPin: '[de] PIN',
        getPhysicalCard: '[de] Get physical card',
        reportFraud: '[de] Report virtual card fraud',
        reportTravelFraud: '[de] Report travel card fraud',
        reviewTransaction: '[de] Review transaction',
        suspiciousBannerTitle: '[de] Suspicious transaction',
        suspiciousBannerDescription: '[de] We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "[de] Your card is temporarily locked while our team reviews your company's account.",
        markTransactionsAsReimbursable: '[de] Mark transactions as reimbursable',
        markTransactionsDescription: '[de] When enabled, transactions imported from this card are marked as reimbursable by default.',
        csvCardDescription: '[de] CSV Import',
        cardDetails: {
            cardNumber: '[de] Virtual card number',
            expiration: '[de] Expiration',
            cvv: '[de] CVV',
            address: '[de] Address',
            revealDetails: '[de] Reveal details',
            revealCvv: '[de] Reveal CVV',
            copyCardNumber: '[de] Copy card number',
            updateAddress: '[de] Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `[de] Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: '[de] An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "[de] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[de] Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        unexpectedError: '[de] There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: '[de] Yes, I do',
            reportFraudButtonText: "[de] No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `[de] cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `[de] deactivated the card ending in ${cardLastFour}`,
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
            }) => `[de] identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?

${amount} for ${merchant} - ${date}`,
        },
        setYourPin: '[de] Set the PIN for your card.',
        confirmYourPin: '[de] Enter your PIN again to confirm.',
        changeYourPin: '[de] Enter a new PIN for your card.',
        confirmYourChangedPin: '[de] Confirm your new PIN.',
        pinMustBeFourDigits: '[de] PIN must be exactly 4 digits.',
        invalidPin: '[de] Please choose a more secure PIN.',
        pinMismatch: '[de] PINs do not match. Please try again.',
        revealPin: '[de] Reveal PIN',
        hidePin: '[de] Hide PIN',
        pin: '[de] PIN',
        pinChanged: '[de] PIN changed!',
        pinChangedHeader: '[de] PIN changed',
        pinChangedDescription: "[de] You're all set to use your PIN now.",
        changePin: '[de] Change PIN',
        changePinAtATM: '[de] Change your PIN at any ATM',
        changePinAtATMDescription: '[de] This is required in your region. <concierge-link>Reach out to Concierge</concierge-link> if you have any questions.',
        freezeCard: '[de] Freeze card',
        unfreeze: '[de] Unfreeze',
        unfreezeCard: '[de] Unfreeze card',
        askToUnfreeze: '[de] Ask to unfreeze',
        freezeDescription: '[de] A frozen card cannot be used for purchases and transactions. You can unfreeze it at any time.',
        unfreezeDescription: "[de] Unfreezing this card will start allowing purchases and transactions again. Only proceed if you're sure the card is safe to use.",
        frozen: '[de] Frozen',
        youFroze: ({date}: {date: string}) => `[de] You froze this card on ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `[de] ${person} froze this card on ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `[de] This card was frozen on ${date} by `,
        frozenByAdminNeedsUnfreezePrefix: '[de] This card was frozen by ',
        frozenByAdminNeedsUnfreezeSuffix: '[de] . Please contact an admin to unfreeze it.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `[de] This card was frozen by ${person}. Please contact an admin to unfreeze it.`,
    },
    workflowsPage: {
        workflowTitle: '[de] Spend',
        workflowDescription: '[de] Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: '[de] Submissions',
        submissionFrequencyDescription: '[de] Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: '[de] Date of month',
        disableApprovalPromptDescription: '[de] Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: '[de] Approvals',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `[de] expenses from ${members}, and the approver is ${approvers}`,
        addApprovalButton: '[de] Add approval workflow',
        findWorkflow: '[de] Find workflow',
        addApprovalTip: '[de] This default workflow applies to all members, unless a more specific workflow exists.',
        approver: '[de] Approver',
        addApprovalsDescription: '[de] Require additional approval before authorizing a payment.',
        makeOrTrackPaymentsTitle: '[de] Payments',
        makeOrTrackPaymentsDescription: '[de] Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '[de] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '[de] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: '[de] Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: '[de] Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: '[de] Instantly',
            weekly: '[de] Weekly',
            monthly: '[de] Monthly',
            twiceAMonth: '[de] Twice a month',
            byTrip: '[de] By trip',
            manually: '[de] Manually',
            daily: '[de] Daily',
            lastDayOfMonth: '[de] Last day of the month',
            lastBusinessDayOfMonth: '[de] Last business day of the month',
            ordinals: {
                one: '[de] st',
                two: '[de] nd',
                few: '[de] rd',
                other: '[de] th',
                '1': '[de] First',
                '2': '[de] Second',
                '3': '[de] Third',
                '4': '[de] Fourth',
                '5': '[de] Fifth',
                '6': '[de] Sixth',
                '7': '[de] Seventh',
                '8': '[de] Eighth',
                '9': '[de] Ninth',
                '10': '[de] Tenth',
            },
        },
        approverInMultipleWorkflows: '[de] This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `[de] <strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: '[de] No members to display',
            expensesFromSubtitle: '[de] All workspace members already belong to an existing approval workflow.',
            approverSubtitle: '[de] All approvers belong to an existing workflow.',
            bulkApproverSubtitle: '[de] No approvers match the criteria for selected reports.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "[de] Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "[de] Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: '[de] Confirm',
        header: '[de] Add more approvers and confirm.',
        additionalApprover: '[de] Additional approver',
        submitButton: '[de] Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: '[de] Edit approval workflow',
        deleteTitle: '[de] Delete approval workflow',
        deletePrompt: '[de] Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: '[de] Expenses from',
        header: '[de] When the following members submit expenses:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "[de] The approver couldn't be changed. Please try again or contact support.",
        title: '[de] Set approver',
        description: '[de] This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: '[de] Approver',
        header: '[de] (Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `[de] Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : '[de] Add another approver when a report exceeds the amount below:',
        reportAmountLabel: '[de] Report amount',
        additionalApproverLabel: '[de] Additional approver',
        skip: '[de] Skip',
        next: '[de] Next',
        removeLimit: '[de] Remove limit',
        enterAmountError: '[de] Please enter a valid amount',
        enterApproverError: '[de] Approver is required when you set a report limit',
        enterBothError: '[de] Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `[de] Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: '[de] Authorized payer',
        genericErrorMessage: '[de] The authorized payer could not be changed. Please try again.',
        admins: '[de] Admins',
        payer: '[de] Payer',
        paymentAccount: '[de] Payment account',
        shareBankAccount: {
            shareTitle: '[de] Share bank account access?',
            shareDescription: ({admin}: {admin: string}) => `[de] You'll need to share bank account access with ${admin} to make them the payer.`,
            validationTitle: '[de] Bank account awaiting validation',
            validationDescription: ({admin}: {admin: string}) =>
                `[de] You need to <a href="#">validate this bank account</a>. Once that's done, you can share bank account access with ${admin} to make them the payer.`,
            errorTitle: "[de] Can't change payer",
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `[de] ${admin} doesn't have access to this bank account, so you can't make them the payer. <a href="#">Chat with ${owner}</a> if the bank account should be shared.`,
        },
    },
    reportFraudPage: {
        title: '[de] Report virtual card fraud',
        description: '[de] If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: '[de] Deactivate card',
        reportVirtualCardFraud: '[de] Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: '[de] Card fraud reported',
        description: '[de] We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        buttonText: '[de] Got it, thanks!',
    },
    activateCardPage: {
        activateCard: '[de] Activate card',
        pleaseEnterLastFour: '[de] Please enter the last four digits of your card.',
        activatePhysicalCard: '[de] Activate physical card',
        error: {
            thatDidNotMatch: "[de] That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "[de] You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: '[de] Get physical card',
        nameMessage: '[de] Enter your first and last name, as this will be shown on your card.',
        legalName: '[de] Legal name',
        legalFirstName: '[de] Legal first name',
        legalLastName: '[de] Legal last name',
        phoneMessage: '[de] Enter your phone number.',
        phoneNumber: '[de] Phone number',
        address: '[de] Address',
        addressMessage: '[de] Enter your shipping address.',
        streetAddress: '[de] Street Address',
        city: '[de] City',
        state: '[de] State',
        zipPostcode: '[de] Zip/Postcode',
        country: '[de] Country',
        confirmMessage: '[de] Please confirm your details below.',
        estimatedDeliveryMessage: '[de] Your physical card will arrive in 2-3 business days.',
        next: '[de] Next',
        getPhysicalCard: '[de] Get physical card',
        shipCard: '[de] Ship card',
    },
    transferAmountPage: {
        transfer: (amount: string) => `[de] Transfer${amount ? ` ${amount}` : ''}`,
        instant: '[de] Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `[de] ${rate}% fee (${minAmount} minimum)`,
        ach: '[de] 1-3 Business days (Bank account)',
        achSummary: '[de] No fee',
        whichAccount: '[de] Which account?',
        fee: '[de] Fee',
        transferSuccess: '[de] Transfer successful!',
        transferDetailBankAccount: '[de] Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: '[de] Your money should arrive immediately.',
        failedTransfer: '[de] Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: '[de] Please transfer your balance from the wallet page',
        goToWallet: '[de] Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: '[de] Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: '[de] Add payment method',
        addNewDebitCard: '[de] Add new debit card',
        addNewBankAccount: '[de] Add new bank account',
        accountLastFour: '[de] Ending in',
        cardLastFour: '[de] Card ending in',
        addFirstPaymentMethod: '[de] Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: '[de] Default',
        bankAccountLastFour: (lastFour: string) => `[de] Bank Account • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '[de] Expense rules',
        subtitle: '[de] These rules will apply to your expenses.',
        findRule: '[de] Find rule',
        emptyRules: {
            title: "[de] You haven't created any rules",
            subtitle: '[de] Add a rule to automate expense reporting.',
        },
        changes: {
            billableUpdate: (value: boolean) => `[de] Update expense ${value ? '[de] billable' : '[de] non-billable'}`,
            categoryUpdate: (value: string) => `[de] Update category to "${value}"`,
            commentUpdate: (value: string) => `[de] Update description to "${value}"`,
            merchantUpdate: (value: string) => `[de] Update merchant to "${value}"`,
            reimbursableUpdate: (value: boolean) => `[de] Update expense ${value ? '[de] reimbursable' : '[de] non-reimbursable'}`,
            tagUpdate: (value: string) => `[de] Update tag to "${value}"`,
            taxUpdate: (value: string) => `[de] Update tax rate to "${value}"`,
            billable: (value: boolean) => `[de] expense ${value ? '[de] billable' : '[de] non-billable'}`,
            category: (value: string) => `[de] category to "${value}"`,
            comment: (value: string) => `[de] description to "${value}"`,
            merchant: (value: string) => `[de] merchant to "${value}"`,
            reimbursable: (value: boolean) => `[de] expense ${value ? '[de] reimbursable' : '[de] non-reimbursable'}`,
            tag: (value: string) => `[de] tag to "${value}"`,
            tax: (value: string) => `[de] tax rate to "${value}"`,
            report: (value: string) => `[de] add to a report named "${value}"`,
        },
        newRule: '[de] New rule',
        addRule: {
            title: '[de] Add rule',
            expenseContains: '[de] If expense contains:',
            applyUpdates: '[de] Then apply these updates:',
            merchantHint: '[de] Type . to create a rule that applies to all merchants',
            addToReport: '[de] Add to a report named',
            createReport: '[de] Create report if necessary',
            applyToExistingExpenses: '[de] Apply to existing matching expenses',
            confirmError: '[de] Enter merchant and apply at least one update',
            confirmErrorMerchant: '[de] Please enter merchant',
            confirmErrorUpdate: '[de] Please apply at least one update',
            saveRule: '[de] Save rule',
        },
        editRule: {
            title: '[de] Edit rule',
        },
        deleteRule: {
            deleteSingle: '[de] Delete rule',
            deleteMultiple: '[de] Delete rules',
            deleteSinglePrompt: '[de] Are you sure you want to delete this rule?',
            deleteMultiplePrompt: '[de] Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: '[de] App preferences',
        },
        testSection: {
            title: '[de] Test preferences',
            subtitle: '[de] Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '[de] Receive relevant feature updates and Expensify news',
        muteAllSounds: '[de] Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: '[de] Priority mode',
        explainerText: '[de] Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: '[de] Most recent',
                description: '[de] Show all chats sorted by most recent',
            },
            gsd: {
                label: '[de] #focus',
                description: '[de] Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `[de] in ${policyName}`,
        generatingPDF: '[de] Generate PDF',
        waitForPDF: '[de] Please wait while we generate the PDF.',
        errorPDF: '[de] There was an error when trying to generate your PDF',
        successPDF: "[de] Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: '[de] Room description',
        roomDescriptionOptional: '[de] Room description (optional)',
        explainerText: '[de] Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: '[de] Heads up!',
        lastMemberWarning: "[de] Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: (displayName: string) => `[de] ${displayName}'s group chat`,
    },
    languagePage: {
        language: '[de] Language',
        aiGenerated: '[de] The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: '[de] Theme',
        themes: {
            dark: {
                label: '[de] Dark',
            },
            light: {
                label: '[de] Light',
            },
            system: {
                label: '[de] Use device settings',
            },
        },
        highContrastMode: '[de] High contrast mode',
        chooseThemeBelowOrSync: '[de] Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `[de] <muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `[de] Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "[de] Didn't receive a magic code?",
        enterAuthenticatorCode: '[de] Please enter your authenticator code',
        enterRecoveryCode: '[de] Please enter your recovery code',
        requiredWhen2FAEnabled: '[de] Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `[de] Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '[de] Request a new code',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `[de] Time remaining: ${timeRemaining} ${timeRemaining === 1 ? '[de] second' : '[de] seconds'}`,
        timeExpiredAnnouncement: '[de] The time has expired',
        error: {
            pleaseFillMagicCode: '[de] Please enter your magic code',
            incorrectMagicCode: '[de] Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: '[de] Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '[de] Please fill out all fields',
        pleaseFillPassword: '[de] Please enter your password',
        pleaseFillTwoFactorAuth: '[de] Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: '[de] Enter your two-factor authentication code to continue',
        forgot: '[de] Forgot?',
        requiredWhen2FAEnabled: '[de] Required when 2FA is enabled',
        error: {
            incorrectPassword: '[de] Incorrect password. Please try again.',
            incorrectLoginOrPassword: '[de] Incorrect login or password. Please try again.',
            incorrect2fa: '[de] Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: '[de] You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: '[de] Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                '[de] We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: '[de] You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: '[de] Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: '[de] Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: '[de] Phone or email',
        error: {
            invalidFormatEmailLogin: '[de] The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "[de] Couldn't retrieve account details. Please try to sign in again.",
        loginForm: '[de] Login form',
        notYou: (user: string) => `[de] Not ${user}?`,
    },
    onboarding: {
        welcome: '[de] Welcome!',
        welcomeSignOffTitleManageTeam: '[de] Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "[de] It's great to meet you!",
        explanationModal: {
            title: '[de] Welcome to Expensify',
            description: '[de] One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: '[de] To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: '[de] Get started',
        whatsYourName: "[de] What's your name?",
        peopleYouMayKnow: '[de] People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: (domain: string, email: string) => `[de] Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '[de] Join a workspace',
        listOfWorkspaces: "[de] Here's the list of workspaces you can join. Don't worry, you can always join them later if you prefer.",
        skipForNow: '[de] Skip for now',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `[de] ${employeeCount} member${employeeCount > 1 ? '[de] s' : ''} • ${policyOwner}`,
        whereYouWork: '[de] Where do you work?',
        errorSelection: '[de] Select an option to move forward',
        purpose: {
            title: '[de] What do you want to do today?',
            errorContinue: '[de] Please press continue to get set up',
            errorBackButton: '[de] Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '[de] Get paid back by my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "[de] Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '[de] Track and budget expenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '[de] Chat and split expenses with friends',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '[de] Something else',
        },
        employees: {
            title: '[de] How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL]: '[de] 1-4 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM]: '[de] 5-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '[de] 1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '[de] 11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '[de] 51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '[de] 101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '[de] More than 1,000 employees',
        },
        accounting: {
            title: '[de] Do you use any accounting software?',
            none: '[de] None',
        },
        interestedFeatures: {
            title: '[de] What features are you interested in?',
            featuresAlreadyEnabled: '[de] Here are our most popular features:',
            featureYouMayBeInterestedIn: '[de] Enable additional features:',
        },
        error: {
            requiredFirstName: '[de] Please input your first name to continue',
        },
        workEmail: {
            title: '[de] What’s your work email?',
            subtitle: '[de] Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: '[de] Forward to receipts@expensify.com for scanning',
                descriptionTwo: '[de] Join your colleagues already using Expensify',
                descriptionThree: '[de] Enjoy a more customized experience',
            },
            addWorkEmail: '[de] Add work email',
        },
        workEmailValidation: {
            title: '[de] Verify your work email',
            magicCodeSent: (workEmail: string | undefined) => `[de] Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: '[de] Please enter a valid work email from a private domain e.g. mitch@company.com',
            sameAsSignupEmail: '[de] Please enter a different email than the one you signed up with',
            offline: '[de] We couldn’t add your work email as you appear to be offline',
        },
        mergeBlockScreen: {
            title: '[de] Couldn’t add work email',
            subtitle: (workEmail: string | undefined) => `[de] We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[de] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[de] [Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[de] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[de] Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: '[de] Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [de] *Add expense approvals* to review your team's spend and keep it under control.

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
                title: ({workspaceConfirmationLink}) => `[de] [Create](${workspaceConfirmationLink}) a workspace`,
                description: '[de] Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[de] Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [de] *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[de] Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        [de] *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '[de] Submit an expense',
                description: dedent(`
                    [de] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: '[de] Submit an expense',
                description: dedent(`
                    [de] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: '[de] Track an expense',
                description: dedent(`
                    [de] *Track an expense* in any currency, whether you have a receipt or not.

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
                    `[de] Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '[de]  to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[de] your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        [de] Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[de] your' : '[de] to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        [Take me to accounting](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[de] Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        [de] Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[de] Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [de] *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[de] Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        [de] *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[de] Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [de] Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

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
                title: ({workspaceMembersLink}) => `[de] Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [de] *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: '[de] Start a chat',
                description: dedent(`
                    [de] *Start a chat* with anyone using their email or phone number.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },
            splitExpenseTask: {
                title: '[de] Split an expense',
                description: dedent(`
                    [de] *Split expenses* with one or more people.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[de] Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [de] Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: '[de] Create your first report',
                description: dedent(`
                    [de] Here's how to create a report:

                    1. Click the *+* button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[de] Take a [test drive](${testDriveURL})` : '[de] Take a test drive'),
            embeddedDemoIframeTitle: '[de] Test Drive',
            employeeFakeReceipt: {
                description: '[de] My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '[de] Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: '[de] Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        [de] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        [de] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage: '[de] To make the most of your 30-day free trial, follow the remaining steps below:',
            onboardingChatSplitMessage: '[de] Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "[de] Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingTestDriveReceiverMessage: "[de] *You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: '[de] Stay organized with a workspace',
            subtitle: '[de] Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: '[de] Track and organize receipts',
                descriptionTwo: '[de] Categorize and tag expenses',
                descriptionThree: '[de] Create and share reports',
            },
            price: (price?: string) => `[de] Try it free for 30 days, then upgrade for just <strong>${price ?? '$5'}/user/month</strong>.`,
            createWorkspace: '[de] Create workspace',
        },
        confirmWorkspace: {
            title: '[de] Confirm workspace',
            subtitle: '[de] Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: '[de] Invite members',
            subtitle: '[de] Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "[de] Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '[de] Name cannot contain special characters',
            containsReservedWord: '[de] Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: '[de] Name cannot contain a comma or semicolon',
            requiredFirstName: '[de] First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "[de] What's your legal name?",
        enterDateOfBirth: "[de] What's your date of birth?",
        enterAddress: "[de] What's your address?",
        enterPhoneNumber: "[de] What's your phone number?",
        personalDetails: '[de] Personal details',
        privateDataMessage: '[de] These details are used for travel and payments. They are never shown on your public profile.',
        legalName: '[de] Legal name',
        legalFirstName: '[de] Legal first name',
        legalLastName: '[de] Legal last name',
        address: '[de] Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `[de] Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `[de] Date should be after ${dateString}`,
            hasInvalidCharacter: '[de] Name can only include Latin characters',
            cannotIncludeCommaOrSemicolon: '[de] Name cannot contain a comma or semicolon',
            incorrectZipFormat: (zipFormat?: string) => `[de] Incorrect zip code format${zipFormat ? `[de]  Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `[de] Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '[de] Link has been re-sent',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `[de] I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: '[de] Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) => `[de] To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `[de] If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '[de] Unlink',
        linkSent: '[de] Link sent!',
        successfullyUnlinkedLogin: '[de] Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) => `[de] Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `[de] <strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `[de] <strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `[de] Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: '[de] Something went wrong...',
        subtitle: `[de] We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: '[de] Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `[de] We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: '[de] Your number has been validated! Click below to send a new magic sign-in code.',
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
                return '[de] Please wait a moment before trying again.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '[de] day' : '[de] days'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '[de] hour' : '[de] hours'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '[de] minute' : '[de] minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `[de] Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: '[de] Join',
    },
    detailsPage: {
        localTime: '[de] Local time',
    },
    newChatPage: {
        startGroup: '[de] Start group',
        addToGroup: '[de] Add to group',
        addUserToGroup: (username: string) => `[de] Add ${username} to group`,
    },
    yearPickerPage: {
        year: '[de] Year',
        selectYear: '[de] Please select a year',
    },
    monthPickerPage: {
        month: '[de] Month',
        selectMonth: '[de] Please select a month',
    },
    focusModeUpdateModal: {
        title: '[de] Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `[de] Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '[de] The chat you are looking for cannot be found.',
        getMeOutOfHere: '[de] Get me out of here',
        iouReportNotFound: '[de] The payment details you are looking for cannot be found.',
        notHere: "[de] Hmm... it's not here",
        pageNotFound: '[de] Oops, this page cannot be found',
        noAccess: '[de] This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: '[de] Go back to home page',
        commentYouLookingForCannotBeFound: '[de] The comment you are looking for cannot be found.',
        goToChatInstead: '[de] Go to the chat instead.',
        contactConcierge: '[de] For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `[de] Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: '[de] Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "[de] That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: '[de] Status',
        statusExplanation: "[de] Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: '[de] Today',
        clearStatus: '[de] Clear status',
        save: '[de] Save',
        message: '[de] Message',
        timePeriods: {
            never: '[de] Never',
            thirtyMinutes: '[de] 30 minutes',
            oneHour: '[de] 1 hour',
            afterToday: '[de] Today',
            afterWeek: '[de] A week',
            custom: '[de] Custom',
        },
        untilTomorrow: '[de] Until tomorrow',
        untilTime: (time: string) => `[de] Until ${time}`,
        date: '[de] Date',
        time: '[de] Time',
        clearAfter: '[de] Clear after',
        whenClearStatus: '[de] When should we clear your status?',
        setVacationDelegate: `[de] Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        cannotSetVacationDelegate: `[de] You can't set a vacation delegate because you're currently the delegate for the following members:`,
        vacationDelegateError: '[de] There was an error updating your vacation delegate.',
        asVacationDelegate: (nameOrEmail: string) => `[de] as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `[de] to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `[de] You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `[de] Step ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '[de] Bank info',
        confirmBankInfo: '[de] Confirm bank info',
        manuallyAdd: '[de] Manually add your bank account',
        letsDoubleCheck: "[de] Let's double check that everything looks right.",
        accountEnding: '[de] Account ending in',
        thisBankAccount: '[de] This bank account will be used for business payments on your workspace',
        accountNumber: '[de] Account number',
        routingNumber: '[de] Routing number',
        chooseAnAccountBelow: '[de] Choose an account below',
        addBankAccount: '[de] Add bank account',
        chooseAnAccount: '[de] Choose an account',
        connectOnlineWithPlaid: '[de] Log into your bank',
        connectManually: '[de] Connect manually',
        desktopConnection: '[de] Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: '[de] Your data is secure',
        toGetStarted: '[de] Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: '[de] Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: '[de] Your routing number and account number can be found on a check for the account.',
        bankAccountPurposeTitle: '[de] What do you want to do with your bank account?',
        getReimbursed: '[de] Get reimbursed',
        getReimbursedDescription: '[de] By employer or others',
        makePayments: '[de] Make payments',
        makePaymentsDescription: '[de] Pay expenses or issue Expensify Cards',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `[de] To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: '[de] An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: (workspaceRoute: string) =>
            `[de] Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: '[de] Business bank account added!',
        bbaAddedDescription: "[de] It's ready to be used for payments.",
        lockedBankAccount: '[de] Locked bank account',
        unlockBankAccount: '[de] Unlock bank account',
        youCantPayThis: `[de] You can't pay this report because you have a <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">locked bank account</a>. Tap below and Concierge will help with the next steps to unlock it.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `[de] <h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `[de] Expensify Business Bank Account ${maskedAccountNumber}
Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.`,
        error: {
            youNeedToSelectAnOption: '[de] Please select an option to proceed',
            noBankAccountAvailable: "[de] Sorry, there's no bank account available",
            noBankAccountSelected: '[de] Please choose an account',
            taxID: '[de] Please enter a valid tax ID number',
            website: '[de] Please enter a valid website',
            zipCode: `[de] Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '[de] Please enter a valid phone number',
            email: '[de] Please enter a valid email address',
            companyName: '[de] Please enter a valid business name',
            addressCity: '[de] Please enter a valid city',
            addressStreet: '[de] Please enter a valid street address',
            addressState: '[de] Please select a valid state',
            incorporationDateFuture: "[de] Incorporation date can't be in the future",
            incorporationState: '[de] Please select a valid state',
            industryCode: '[de] Please enter a valid industry classification code with six digits',
            restrictedBusiness: "[de] Please confirm the business isn't on the list of restricted businesses",
            routingNumber: '[de] Please enter a valid routing number',
            accountNumber: '[de] Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "[de] Routing and account numbers can't match",
            companyType: '[de] Please select a valid company type',
            tooManyAttempts: '[de] Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: '[de] Please enter a valid address',
            dob: '[de] Please select a valid date of birth',
            age: '[de] Must be over 18 years old',
            ssnLast4: '[de] Please enter valid last 4 digits of SSN',
            firstName: '[de] Please enter a valid first name',
            lastName: '[de] Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: '[de] Please add a default deposit account or debit card',
            validationAmounts: '[de] The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: '[de] Please enter a valid full name',
            ownershipPercentage: '[de] Please enter a valid percentage number',
            deletePaymentBankAccount:
                "[de] This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: '[de] The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "[de] Where's your bank account located?",
        accountDetailsStepHeader: '[de] What are your account details?',
        accountTypeStepHeader: '[de] What type of account is this?',
        bankInformationStepHeader: '[de] What are your bank details?',
        accountHolderInformationStepHeader: '[de] What are the account holder details?',
        howDoWeProtectYourData: '[de] How do we protect your data?',
        currencyHeader: "[de] What's your bank account's currency?",
        confirmationStepHeader: '[de] Check your info.',
        confirmationStepSubHeader: '[de] Double check the details below, and check the terms box to confirm.',
        toGetStarted: '[de] Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
    },
    addPersonalBankAccountPage: {
        enterPassword: '[de] Enter Expensify password',
        alreadyAdded: '[de] This account has already been added.',
        chooseAccountLabel: '[de] Account',
        successTitle: '[de] Personal bank account added!',
        successMessage: '[de] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: '[de] Unknown filename',
        passwordRequired: '[de] Please enter a password',
        passwordIncorrect: '[de] Incorrect password. Please try again.',
        failedToLoadPDF: '[de] Failed to load PDF file',
        pdfPasswordForm: {
            title: '[de] Password protected PDF',
            infoText: '[de] This PDF is password protected.',
            beforeLinkText: '[de] Please',
            linkText: '[de] enter the password',
            afterLinkText: '[de] to view it.',
            formLabel: '[de] View PDF',
        },
        attachmentNotFound: '[de] Attachment not found',
        retry: '[de] Retry',
    },
    messages: {
        errorMessageInvalidPhone: `[de] Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '[de] Invalid email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `[de] ${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `[de] ${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '[de] By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: '[de] Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `[de] <muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: '[de] Try again',
        verifyIdentity: '[de] Verify identity',
        letsVerifyIdentity: "[de] Let's verify your identity",
        butFirst: `[de] But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '[de] An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: '[de] Enable camera access',
        cameraRequestMessage: '[de] We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: '[de] Enable microphone access',
        microphoneRequestMessage: '[de] We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: '[de] Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: '[de] Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "[de] There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "[de] There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "[de] Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "[de] Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: '[de] Additional details',
        helpText: '[de] We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: '[de] We need to ask you just a few more questions to finish validating your identity.',
        helpLink: '[de] Learn more about why we need this.',
        legalFirstNameLabel: '[de] Legal first name',
        legalMiddleNameLabel: '[de] Legal middle name',
        legalLastNameLabel: '[de] Legal last name',
        selectAnswer: '[de] Please select a response to proceed',
        ssnFull9Error: '[de] Please enter a valid nine-digit SSN',
        needSSNFull9: "[de] We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "[de] We couldn't verify",
        pleaseFixIt: '[de] Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `[de] We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: '[de] Terms and fees',
        headerTitleRefactor: '[de] Fees and terms',
        haveReadAndAgreePlain: '[de] I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `[de] I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: '[de] I agree to the Privacy and Wallet agreement.',
        agreeToThe: (walletAgreementUrl: string) =>
            `[de] I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: '[de] Enable payments',
        monthlyFee: '[de] Monthly fee',
        inactivity: '[de] Inactivity',
        noOverdraftOrCredit: '[de] No overdraft/credit feature.',
        electronicFundsWithdrawal: '[de] Electronic funds withdrawal',
        standard: '[de] Standard',
        reviewTheFees: '[de] Take a look at some fees.',
        checkTheBoxes: '[de] Please check the boxes below.',
        agreeToTerms: '[de] Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `[de] The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: '[de] Per purchase',
            atmWithdrawal: '[de] ATM withdrawal',
            cashReload: '[de] Cash reload',
            inNetwork: '[de] in-network',
            outOfNetwork: '[de] out-of-network',
            atmBalanceInquiry: '[de] ATM balance inquiry (in-network or out-of-network)',
            customerService: '[de] Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: '[de] Inactivity (after 12 months with no transactions)',
            weChargeOneFee: '[de] We charge 1 other type of fee. It is:',
            fdicInsurance: '[de] Your funds are eligible for FDIC insurance.',
            generalInfo: `[de] For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `[de] For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: '[de] Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: (amount: string) => `[de] (min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '[de] A list of all Expensify Wallet fees',
            typeOfFeeHeader: '[de] All fees',
            feeAmountHeader: '[de] Amount',
            moreDetailsHeader: '[de] Details',
            openingAccountTitle: '[de] Opening an account',
            openingAccountDetails: "[de] There's no fee to open an account.",
            monthlyFeeDetails: "[de] There's no monthly fee.",
            customerServiceTitle: '[de] Customer service',
            customerServiceDetails: '[de] There are no customer service fees.',
            inactivityDetails: "[de] There's no inactivity fee.",
            sendingFundsTitle: '[de] Sending funds to another account holder',
            sendingFundsDetails: "[de] There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "[de] There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "[de] There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                `[de]  The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `[de] Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                `[de]  Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `[de] Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `[de] For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: '[de] View printer-friendly version',
            automated: '[de] Automated',
            liveAgent: '[de] Live agent',
            instant: '[de] Instant',
            electronicFundsInstantFeeMin: (amount: string) => `[de] Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '[de] Enable payments',
        activatedTitle: '[de] Wallet activated!',
        activatedMessage: '[de] Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: '[de] Just a minute...',
        checkBackLaterMessage: "[de] We're still reviewing your information. Please check back later.",
        continueToPayment: '[de] Continue to payment',
        continueToTransfer: '[de] Continue to transfer',
    },
    companyStep: {
        headerTitle: '[de] Company information',
        subtitle: '[de] Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: '[de] Legal business name',
        companyWebsite: '[de] Company website',
        taxIDNumber: '[de] Tax ID number',
        taxIDNumberPlaceholder: '[de] 9 digits',
        companyType: '[de] Company type',
        incorporationDate: '[de] Incorporation date',
        incorporationState: '[de] Incorporation state',
        industryClassificationCode: '[de] Industry classification code',
        confirmCompanyIsNot: '[de] I confirm that this company is not on the',
        listOfRestrictedBusinesses: '[de] list of restricted businesses',
        incorporationDatePlaceholder: '[de] Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '[de] LLC',
            CORPORATION: '[de] Corp',
            PARTNERSHIP: '[de] Partnership',
            COOPERATIVE: '[de] Cooperative',
            SOLE_PROPRIETORSHIP: '[de] Sole proprietorship',
            OTHER: '[de] Other',
        },
        industryClassification: '[de] Which industry is the business classified under?',
        industryClassificationCodePlaceholder: '[de] Search for industry classification code',
    },
    requestorStep: {
        headerTitle: '[de] Personal information',
        learnMore: '[de] Learn more',
        isMyDataSafe: '[de] Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: '[de] Personal info',
        enterYourLegalFirstAndLast: "[de] What's your legal name?",
        legalFirstName: '[de] Legal first name',
        legalLastName: '[de] Legal last name',
        legalName: '[de] Legal name',
        enterYourDateOfBirth: "[de] What's your date of birth?",
        enterTheLast4: '[de] What are the last four digits of your Social Security Number?',
        dontWorry: "[de] Don't worry, we don't do any personal credit checks!",
        last4SSN: '[de] Last 4 of SSN',
        enterYourAddress: "[de] What's your address?",
        address: '[de] Address',
        letsDoubleCheck: "[de] Let's double check that everything looks right.",
        byAddingThisBankAccount: "[de] By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: '[de] What’s your legal name?',
        whatsYourDOB: '[de] What’s your date of birth?',
        whatsYourAddress: '[de] What’s your address?',
        whatsYourSSN: '[de] What are the last four digits of your Social Security Number?',
        noPersonalChecks: '[de] Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: '[de] What’s your phone number?',
        weNeedThisToVerify: '[de] We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: '[de] Company info',
        enterTheNameOfYourBusiness: "[de] What's the name of your company?",
        businessName: '[de] Legal company name',
        enterYourCompanyTaxIdNumber: "[de] What's your company’s Tax ID number?",
        taxIDNumber: '[de] Tax ID number',
        taxIDNumberPlaceholder: '[de] 9 digits',
        enterYourCompanyWebsite: "[de] What's your company’s website?",
        companyWebsite: '[de] Company website',
        enterYourCompanyPhoneNumber: "[de] What's your company’s phone number?",
        enterYourCompanyAddress: "[de] What's your company’s address?",
        selectYourCompanyType: '[de] What type of company is it?',
        companyType: '[de] Company type',
        incorporationType: {
            LLC: '[de] LLC',
            CORPORATION: '[de] Corp',
            PARTNERSHIP: '[de] Partnership',
            COOPERATIVE: '[de] Cooperative',
            SOLE_PROPRIETORSHIP: '[de] Sole proprietorship',
            OTHER: '[de] Other',
        },
        selectYourCompanyIncorporationDate: "[de] What's your company’s incorporation date?",
        incorporationDate: '[de] Incorporation date',
        incorporationDatePlaceholder: '[de] Start date (yyyy-mm-dd)',
        incorporationState: '[de] Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '[de] Which state was your company incorporated in?',
        letsDoubleCheck: "[de] Let's double check that everything looks right.",
        companyAddress: '[de] Company address',
        listOfRestrictedBusinesses: '[de] list of restricted businesses',
        confirmCompanyIsNot: '[de] I confirm that this company is not on the',
        businessInfoTitle: '[de] Business info',
        legalBusinessName: '[de] Legal business name',
        whatsTheBusinessName: "[de] What's the business name?",
        whatsTheBusinessAddress: "[de] What's the business address?",
        whatsTheBusinessContactInformation: "[de] What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "[de] What's the Company Registration Number (CRN)?";
                default:
                    return "[de] What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[de] What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return '[de] What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return '[de] What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return '[de] What’s the Australian Business Number (ABN)?';
                default:
                    return '[de] What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "[de] What's this number?",
        whereWasTheBusinessIncorporated: '[de] Where was the business incorporated?',
        whatTypeOfBusinessIsIt: '[de] What type of business is it?',
        whatsTheBusinessAnnualPayment: "[de] What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "[de] What's your expected average reimbursement amount?",
        registrationNumber: '[de] Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[de] EIN';
                case CONST.COUNTRY.CA:
                    return '[de] BN';
                case CONST.COUNTRY.GB:
                    return '[de] VRN';
                case CONST.COUNTRY.AU:
                    return '[de] ABN';
                default:
                    return '[de] EU VAT';
            }
        },
        businessAddress: '[de] Business address',
        businessType: '[de] Business type',
        incorporation: '[de] Incorporation',
        incorporationCountry: '[de] Incorporation country',
        incorporationTypeName: '[de] Incorporation type',
        businessCategory: '[de] Business category',
        annualPaymentVolume: '[de] Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `[de] Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '[de] Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `[de] Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '[de] Select incorporation type',
        selectBusinessCategory: '[de] Select business category',
        selectAnnualPaymentVolume: '[de] Select annual payment volume',
        selectIncorporationCountry: '[de] Select incorporation country',
        selectIncorporationState: '[de] Select incorporation state',
        selectAverageReimbursement: '[de] Select average reimbursement amount',
        selectBusinessType: '[de] Select business type',
        findIncorporationType: '[de] Find incorporation type',
        findBusinessCategory: '[de] Find business category',
        findAnnualPaymentVolume: '[de] Find annual payment volume',
        findIncorporationState: '[de] Find incorporation state',
        findAverageReimbursement: '[de] Find average reimbursement amount',
        findBusinessType: '[de] Find business type',
        error: {
            registrationNumber: '[de] Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '[de] Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return '[de] Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return '[de] Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return '[de] Please provide a valid Australian Business Number (ABN)';
                    default:
                        return '[de] Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `[de] Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `[de] Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `[de] Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: '[de] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: '[de] Business owner',
        enterLegalFirstAndLastName: "[de] What's the owner's legal name?",
        legalFirstName: '[de] Legal first name',
        legalLastName: '[de] Legal last name',
        enterTheDateOfBirthOfTheOwner: "[de] What's the owner's date of birth?",
        enterTheLast4: '[de] What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: '[de] Last 4 of SSN',
        dontWorry: "[de] Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "[de] What's the owner's address?",
        letsDoubleCheck: '[de] Let’s double check that everything looks right.',
        legalName: '[de] Legal name',
        address: '[de] Address',
        byAddingThisBankAccount: "[de] By adding this bank account, you confirm that you've read, understand, and accept",
        owners: '[de] Owners',
    },
    ownershipInfoStep: {
        ownerInfo: '[de] Owner info',
        businessOwner: '[de] Business owner',
        signerInfo: '[de] Signer info',
        doYouOwn: (companyName: string) => `[de] Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `[de] Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: '[de] Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: '[de] Legal first name',
        legalLastName: '[de] Legal last name',
        whatsTheOwnersName: "[de] What's the owner's legal name?",
        whatsYourName: "[de] What's your legal name?",
        whatPercentage: '[de] What percentage of the business belongs to the owner?',
        whatsYoursPercentage: '[de] What percentage of the business do you own?',
        ownership: '[de] Ownership',
        whatsTheOwnersDOB: "[de] What's the owner's date of birth?",
        whatsYourDOB: "[de] What's your date of birth?",
        whatsTheOwnersAddress: "[de] What's the owner's address?",
        whatsYourAddress: "[de] What's your address?",
        whatAreTheLast: "[de] What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: '[de] What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: '[de] What is your country of citizenship?',
        whatsTheOwnersNationality: "[de] What's the owner's country of citizenship?",
        countryOfCitizenship: '[de] Country of citizenship',
        dontWorry: "[de] Don't worry, we don't do any personal credit checks!",
        last4: '[de] Last 4 of SSN',
        whyDoWeAsk: '[de] Why do we ask for this?',
        letsDoubleCheck: '[de] Let’s double check that everything looks right.',
        legalName: '[de] Legal name',
        ownershipPercentage: '[de] Ownership percentage',
        areThereOther: (companyName: string) => `[de] Are there other individuals who own 25% or more of ${companyName}?`,
        owners: '[de] Owners',
        addCertified: '[de] Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart: '[de] Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: '[de] Upload entity ownership chart',
        noteEntity: '[de] Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: '[de] Certified entity ownership chart',
        selectCountry: '[de] Select country',
        findCountry: '[de] Find country',
        address: '[de] Address',
        chooseFile: '[de] Choose file',
        uploadDocuments: '[de] Upload additional documentation',
        pleaseUpload: '[de] Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: '[de] Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: '[de] Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "[de] Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: '[de] Copy of ID for beneficial owner',
        copyOfIDDescription: "[de] Examples: Passport, driver's license, etc.",
        proofOfAddress: '[de] Address proof for beneficial owner',
        proofOfAddressDescription: '[de] Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: '[de] Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            '[de] Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: '[de] Complete verification',
        confirmAgreements: '[de] Please confirm the agreements below.',
        certifyTrueAndAccurate: '[de] I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: '[de] Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: '[de] I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: '[de] You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: '[de] terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '[de] Validate your bank account',
        validateButtonText: '[de] Validate',
        validationInputLabel: '[de] Transaction',
        maxAttemptsReached: '[de] Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `[de] Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '[de] Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: '[de] Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: '[de] Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: '[de] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: '[de] Secure your account',
    },
    countryStep: {
        confirmBusinessBank: '[de] Confirm business bank account currency and country',
        confirmCurrency: '[de] Confirm currency and country',
        yourBusiness: '[de] Your business bank account currency must match your workspace currency.',
        youCanChange: '[de] You can change your workspace currency in your',
        findCountry: '[de] Find country',
        selectCountry: '[de] Select country',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `[de] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> so you can invite a director to sign in a later step.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '[de] What are your business bank account details?',
        letsDoubleCheck: '[de] Let’s double check that everything looks fine.',
        thisBankAccount: '[de] This bank account will be used for business payments on your workspace',
        accountNumber: '[de] Account number',
        accountHolderNameDescription: "[de] Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: '[de] Signer info',
        areYouDirector: (companyName: string) => `[de] Are you a director at ${companyName}?`,
        regulationRequiresUs: '[de] Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "[de] What's your legal name",
        fullName: '[de] Legal full name',
        whatsYourJobTitle: "[de] What's your job title?",
        jobTitle: '[de] Job title',
        whatsYourDOB: "[de] What's your date of birth?",
        uploadID: '[de] Upload ID and proof of address',
        personalAddress: '[de] Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: '[de] Let’s double check that everything looks right.',
        legalName: '[de] Legal name',
        proofOf: '[de] Proof of personal address',
        enterOneEmail: (companyName: string) => `[de] Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: '[de] Regulation requires at least one more director as a signer.',
        hangTight: '[de] Hang tight...',
        enterTwoEmails: (companyName: string) => `[de] Enter the emails of two directors at ${companyName}`,
        sendReminder: '[de] Send a reminder',
        chooseFile: '[de] Choose file',
        weAreWaiting: "[de] We're waiting for others to verify their identities as directors of the business.",
        id: '[de] Copy of ID',
        proofOfDirectors: '[de] Proof of director(s)',
        proofOfDirectorsDescription: '[de] Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: '[de] Codice Fiscale',
        codiceFiscaleDescription: '[de] Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: '[de] PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            [de] Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: '[de] Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: '[de] Enter signer info',
        thisStep: '[de] This step has been completed',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `[de] is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: '[de] Emails must be different',
            connectToWorkspace: (workspaceRoute: string) => `[de] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> to invite a director to sign.`,
        },
    },
    agreementsStep: {
        agreements: '[de] Agreements',
        pleaseConfirm: '[de] Please confirm the agreements below',
        regulationRequiresUs: '[de] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: '[de] I am authorized to use the business bank account for business spend.',
        iCertify: '[de] I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `[de] I accept the <a href="https://www.corpay.com/cross-border/terms">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: '[de] I accept the terms and conditions.',
        accept: '[de] Accept and add bank account',
        iConsentToThePrivacyNotice: '[de] I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: '[de] I consent to the privacy notice.',
        error: {
            authorized: '[de] You must be a controlling officer with authorization to operate the business bank account',
            certify: '[de] Please certify that the information is true and accurate',
            consent: '[de] Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: '[de] Docusign Form',
        pleaseComplete:
            '[de] Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: '[de] Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            '[de] Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: '[de] Take me to Docusign',
        uploadAdditional: '[de] Upload additional documentation',
        pleaseUpload: '[de] Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: '[de] Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "[de] Let's finish in chat!",
        thanksFor:
            "[de] Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: '[de] I have a question',
        enable2FA: '[de] Enable two-factor authentication (2FA) to prevent fraud',
        weTake: '[de] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: '[de] Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '[de] One moment',
        explanationLine: "[de] We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "[de] Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: '[de] Book travel',
        title: '[de] Travel smart',
        subtitle: '[de] Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: '[de] Save money on your bookings',
            alerts: '[de] Get realtime alerts if your travel plans change',
        },
        bookTravel: '[de] Book travel',
        bookDemo: '[de] Book demo',
        bookADemo: '[de] Book a demo',
        toLearnMore: '[de]  to learn more.',
        termsAndConditions: {
            header: '[de] Before we continue...',
            title: '[de] Terms & conditions',
            label: '[de] I agree to the terms & conditions',
            subtitle: `[de] Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: '[de] You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                '[de] You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: '[de] Flight',
        flightDetails: {
            passenger: '[de] Passenger',
            layover: (layover: string) => `[de] <muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: '[de] Take-off',
            landing: '[de] Landing',
            seat: '[de] Seat',
            class: '[de] Cabin Class',
            recordLocator: '[de] Record locator',
            cabinClasses: {
                unknown: '[de] Unknown',
                economy: '[de] Economy',
                premiumEconomy: '[de] Premium Economy',
                business: '[de] Business',
                first: '[de] First',
            },
        },
        hotel: '[de] Hotel',
        hotelDetails: {
            guest: '[de] Guest',
            checkIn: '[de] Check-in',
            checkOut: '[de] Check-out',
            roomType: '[de] Room type',
            cancellation: '[de] Cancellation policy',
            cancellationUntil: '[de] Free cancellation until',
            confirmation: '[de] Confirmation number',
            cancellationPolicies: {
                unknown: '[de] Unknown',
                nonRefundable: '[de] Non-refundable',
                freeCancellationUntil: '[de] Free cancellation until',
                partiallyRefundable: '[de] Partially refundable',
            },
        },
        car: '[de] Car',
        carDetails: {
            rentalCar: '[de] Car rental',
            pickUp: '[de] Pick-up',
            dropOff: '[de] Drop-off',
            driver: '[de] Driver',
            carType: '[de] Car type',
            cancellation: '[de] Cancellation policy',
            cancellationUntil: '[de] Free cancellation until',
            freeCancellation: '[de] Free cancellation',
            confirmation: '[de] Confirmation number',
        },
        train: '[de] Rail',
        trainDetails: {
            passenger: '[de] Passenger',
            departs: '[de] Departs',
            arrives: '[de] Arrives',
            coachNumber: '[de] Coach number',
            seat: '[de] Seat',
            fareDetails: '[de] Fare details',
            confirmation: '[de] Confirmation number',
        },
        viewTrip: '[de] View trip',
        modifyTrip: '[de] Modify trip',
        tripSupport: '[de] Trip support',
        tripDetails: '[de] Trip details',
        viewTripDetails: '[de] View trip details',
        trip: '[de] Trip',
        trips: '[de] Trips',
        tripSummary: '[de] Trip summary',
        departs: '[de] Departs',
        errorMessage: '[de] Something went wrong. Please try again later.',
        phoneError: (phoneErrorMethodsRoute: string) => `[de] <rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: '[de] Domain',
            subtitle: '[de] Choose a domain for Expensify Travel setup.',
            recommended: '[de] Recommended',
        },
        domainPermissionInfo: {
            title: '[de] Domain',
            restriction: (domain: string) =>
                `[de] You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `[de] If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '[de] Get started with Expensify Travel',
            message: `[de] You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: '[de] Expensify Travel has been disabled',
            message: `[de] Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "[de] We're reviewing your request...",
            message: `[de] We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: '[de] Got it',
            conciergeMessage: ({domain}: {domain: string}) => `[de] Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `[de] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[de] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[de] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[de] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `[de] The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `[de] Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[de] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `[de] Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `[de] Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `[de] Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `[de] Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: '[de] Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: (type: string, id = '') => `[de] You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `[de] The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: (type: string, id = '') => `[de] Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: (type: string) => `[de] Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `[de] Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `[de] Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `[de] Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: (type: string) => `[de] Your ${type} reservation was updated.`,
        },
        flightTo: '[de] Flight to',
        trainTo: '[de] Train to',
        carRental: '[de]  car rental',
        nightIn: '[de] night in',
        nightsIn: '[de] nights in',
    },
    proactiveAppReview: {
        title: '[de] Enjoying New Expensify?',
        description: '[de] Let us know so we can help make your expensing experience even better.',
        positiveButton: '[de] Yeah!',
        negativeButton: '[de] Not really',
    },
    workspace: {
        common: {
            card: '[de] Cards',
            expensifyCard: '[de] Expensify Card',
            companyCards: '[de] Company cards',
            personalCards: '[de] Personal cards',
            workflows: '[de] Workflows',
            workspace: '[de] Workspace',
            findWorkspace: '[de] Find workspace',
            edit: '[de] Edit workspace',
            enabled: '[de] Enabled',
            disabled: '[de] Disabled',
            everyone: '[de] Everyone',
            delete: '[de] Delete workspace',
            settings: '[de] Settings',
            reimburse: '[de] Reimbursements',
            categories: '[de] Categories',
            tags: '[de] Tags',
            customField1: '[de] Custom field 1',
            customField2: '[de] Custom field 2',
            customFieldHint: '[de] Add custom coding that applies to all spend from this member.',
            reports: '[de] Reports',
            reportFields: '[de] Report fields',
            reportTitle: '[de] Report title',
            reportField: '[de] Report field',
            taxes: '[de] Taxes',
            bills: '[de] Bills',
            invoices: '[de] Invoices',
            perDiem: '[de] Per diem',
            travel: '[de] Travel',
            members: '[de] Members',
            accounting: '[de] Accounting',
            receiptPartners: '[de] Receipt partners',
            rules: '[de] Rules',
            displayedAs: '[de] Displayed as',
            plan: '[de] Plan',
            profile: '[de] Overview',
            bankAccount: '[de] Bank account',
            testTransactions: '[de] Test transactions',
            issueAndManageCards: '[de] Issue and manage cards',
            reconcileCards: '[de] Reconcile cards',
            selectAll: '[de] Select all',
            selected: () => ({
                one: '[de] 1 selected',
                other: (count: number) => `[de] ${count} selected`,
            }),
            settlementFrequency: '[de] Settlement frequency',
            setAsDefault: '[de] Set as default workspace',
            defaultNote: `[de] Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '[de] Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: '[de] Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            deleteOpenExpensifyCardsError: '[de] Your company still has open Expensify Cards.',
            outstandingBalanceWarning:
                '[de] You have an outstanding balance that must be settled before deleting your last workspace. Please go to your subscription settings to resolve the payment.',
            settleBalance: '[de] Go to subscription',
            unavailable: '[de] Unavailable workspace',
            memberNotFound: '[de] Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `[de] You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: '[de] Go to workspace',
            duplicateWorkspace: '[de] Duplicate workspace',
            duplicateWorkspacePrefix: '[de] Duplicate',
            goToWorkspaces: '[de] Go to workspaces',
            clearFilter: '[de] Clear filter',
            workspaceName: '[de] Workspace name',
            workspaceOwner: '[de] Owner',
            keepMeAsAdmin: '[de] Keep me as an admin',
            workspaceType: '[de] Workspace type',
            workspaceAvatar: '[de] Workspace avatar',
            clientID: '[de] Client ID',
            clientIDInputHint: "[de] Enter the client's unique identifier",
            mustBeOnlineToViewMembers: '[de] You need to be online in order to view members of this workspace.',
            moreFeatures: '[de] More features',
            requested: '[de] Requested',
            distanceRates: '[de] Distance rates',
            defaultDescription: '[de] One place for all your receipts and expenses.',
            descriptionHint: '[de] Share information about this workspace with all members.',
            welcomeNote: '[de] Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: '[de] Subscription',
            markAsEntered: '[de] Mark as manually entered',
            markAsExported: '[de] Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `[de] Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "[de] Let's double check that everything looks right.",
            lineItemLevel: '[de] Line-item level',
            reportLevel: '[de] Report level',
            topLevel: '[de] Top level',
            appliedOnExport: '[de] Not imported into Expensify, applied on export',
            shareNote: {
                header: '[de] Share your workspace with other members',
                content: (adminsRoomLink: string) =>
                    `[de] Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `[de] Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '[de] Create new connection',
            reuseExistingConnection: '[de] Reuse existing connection',
            existingConnections: '[de] Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `[de] Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `[de] ${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `[de] Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: '[de] Learn more',
            memberAlternateText: '[de] Submit and approve reports.',
            adminAlternateText: '[de] Manage reports and workspace settings.',
            auditorAlternateText: '[de] View and comment on reports.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: '[de] Direct',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: '[de] None',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '[de] Indirect',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '[de] Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '[de] Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return '[de] Member';
                    default:
                        return '[de] Member';
                }
            },
            frequency: {
                manual: '[de] Manually',
                instant: '[de] Instant',
                immediate: '[de] Daily',
                trip: '[de] By trip',
                weekly: '[de] Weekly',
                semimonthly: '[de] Twice a month',
                monthly: '[de] Monthly',
            },
            budgetFrequency: {
                monthly: '[de] monthly',
                yearly: '[de] yearly',
            },
            budgetFrequencyUnit: {
                monthly: '[de] month',
                yearly: '[de] year',
            },
            budgetTypeForNotificationMessage: {
                tag: '[de] tag',
                category: '[de] category',
            },
            planType: '[de] Plan type',
            youCantDowngradeInvoicing:
                "[de] You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: '[de] Default category',
            viewTransactions: '[de] View transactions',
            policyExpenseChatName: (displayName: string) => `[de] ${displayName}'s expenses`,
            deepDiveExpensifyCard: `[de] <muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `[de] Connected to ${organizationName}` : '[de] Automate travel and meal delivery expenses across your organization.',
                sendInvites: '[de] Send invites',
                sendInvitesDescription: "[de] These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: '[de] Confirm invite',
                manageInvites: '[de] Manage invites',
                confirm: '[de] Confirm',
                allSet: '[de] All set',
                readyToRoll: "[de] You're ready to roll",
                takeBusinessRideMessage: '[de] Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: '[de] All',
                linked: '[de] Linked',
                outstanding: '[de] Outstanding',
                status: {
                    resend: '[de] Resend',
                    invite: '[de] Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '[de] Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '[de] Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '[de] Suspended',
                },
                centralBillingAccount: '[de] Central billing account',
                centralBillingDescription: '[de] Choose where to import all Uber receipts.',
                invitationFailure: '[de] Failed to invite member to Uber for Business',
                autoInvite: '[de] Invite new workspace members to Uber for Business',
                autoRemove: '[de] Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: '[de] No outstanding invites',
                    subtitle: '[de] Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `[de] <muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: '[de] Amount',
            deleteRates: () => ({
                one: '[de] Delete rate',
                other: '[de] Delete rates',
            }),
            deletePerDiemRate: '[de] Delete per diem rate',
            findPerDiemRate: '[de] Find per diem rate',
            areYouSureDelete: () => ({
                one: '[de] Are you sure you want to delete this rate?',
                other: '[de] Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: '[de] Per diem',
                subtitle: '[de] Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: '[de] Import per diem rates',
            editPerDiemRate: '[de] Edit per diem rate',
            editPerDiemRates: '[de] Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `[de] Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `[de] Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '[de] Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: '[de] Mark checks as “print later”',
            exportDescription: '[de] Configure how Expensify data exports to QuickBooks Desktop.',
            date: '[de] Export date',
            exportInvoices: '[de] Export invoices to',
            exportExpensifyCard: '[de] Export Expensify Card transactions as',
            account: '[de] Account',
            accountDescription: '[de] Choose where to post journal entries.',
            accountsPayable: '[de] Accounts payable',
            accountsPayableDescription: '[de] Choose where to create vendor bills.',
            bankAccount: '[de] Bank account',
            notConfigured: '[de] Not configured',
            bankAccountDescription: '[de] Choose where to send checks from.',
            creditCardAccount: '[de] Credit card account',
            exportDate: {
                label: '[de] Export date',
                description: '[de] Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[de] Date of last expense',
                        description: '[de] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[de] Export date',
                        description: '[de] Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[de] Submitted date',
                        description: '[de] Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "[de] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[de] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[de] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "[de] QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[de] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[de] Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[de] Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[de] Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[de] Check',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "[de] We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[de] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[de] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[de] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[de] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '[de] Choose where to send checks from.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[de] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[de] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[de] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: '[de] No accounts found',
            noAccountsFoundDescription: '[de] Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: '[de] QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "[de] Can't connect from this device",
                body1: "[de] You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "[de] Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: '[de] Open this link to connect',
                body: '[de] To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: '[de] Something went wrong',
                setupErrorBody: (conciergeLink: string) =>
                    `[de] <muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: '[de] Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: '[de] Classes',
            items: '[de] Items',
            customers: '[de] Customers/projects',
            exportCompanyCardsDescription: '[de] Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: '[de] Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: '[de] Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[de] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[de] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[de] Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: '[de] Line item level',
            reportFieldsDisplayedAsDescription: '[de] Report level',
            customersDescription: '[de] Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: '[de] Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: '[de] Auto-create entities',
                createEntitiesDescription: "[de] Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: '[de] Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: '[de] When to Export',
                description: '[de] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: '[de] Connected to',
            importDescription: '[de] Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: '[de] Classes',
            locations: '[de] Locations',
            customers: '[de] Customers/projects',
            accountsDescription: '[de] Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[de] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[de] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[de] Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: '[de] Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: '[de] Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: '[de] Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "[de] QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "[de] QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: '[de] Configure how Expensify data exports to QuickBooks Online.',
            date: '[de] Export date',
            exportInvoices: '[de] Export invoices to',
            exportExpensifyCard: '[de] Export Expensify Card transactions as',
            exportDate: {
                label: '[de] Export date',
                description: '[de] Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[de] Date of last expense',
                        description: '[de] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[de] Export date',
                        description: '[de] Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[de] Submitted date',
                        description: '[de] Date the report was submitted for approval.',
                    },
                },
            },
            receivable: '[de] Accounts receivable',
            archive: '[de] Accounts receivable archive',
            exportInvoicesDescription: '[de] Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: '[de] Set how company card purchases export to QuickBooks Online.',
            vendor: '[de] Vendor',
            defaultVendorDescription: '[de] Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: '[de] Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "[de] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[de] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[de] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: '[de] Account',
            accountDescription: '[de] Choose where to post journal entries.',
            accountsPayable: '[de] Accounts payable',
            accountsPayableDescription: '[de] Choose where to create vendor bills.',
            bankAccount: '[de] Bank account',
            notConfigured: '[de] Not configured',
            bankAccountDescription: '[de] Choose where to send checks from.',
            creditCardAccount: '[de] Credit card account',
            companyCardsLocationEnabledDescription:
                "[de] QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "[de] QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[de] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: '[de] Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: '[de] Invite employees',
                inviteEmployeesDescription: '[de] Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: '[de] Auto-create entities',
                createEntitiesDescription:
                    "[de] Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription: '[de] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: '[de] QuickBooks bill payment account',
                qboInvoiceCollectionAccount: '[de] QuickBooks invoice collections account',
                accountSelectDescription: "[de] Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "[de] Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '[de] Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[de] Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[de] Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[de] Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[de] Check',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "[de] We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[de] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[de] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '[de] Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[de] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[de] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '[de] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[de] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '[de] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[de] Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[de] Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[de] Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[de] To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[de] To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[de] To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: '[de] No accounts found',
            noAccountsFoundDescription: '[de] Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: '[de] When to Export',
                description: '[de] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Out-of-pocket expenses will export when paid',
                },
            },
            travelInvoicing: '[de] Export Expensify Travel Payable To',
            travelInvoicingVendor: '[de] Travel vendor',
            travelInvoicingPayableAccount: '[de] Travel payable account',
        },
        workspaceList: {
            joinNow: '[de] Join now',
            askToJoin: '[de] Ask to join',
        },
        xero: {
            organization: '[de] Xero organization',
            organizationDescription: "[de] Choose the Xero organization that you'd like to import data from.",
            importDescription: '[de] Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: '[de] Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[de] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[de] Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: '[de] Tracking categories',
            trackingCategoriesDescription: '[de] Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `[de] Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `[de] Choose where to map ${categoryName} when exporting to Xero.`,
            customers: '[de] Re-bill customers',
            customersDescription: '[de] Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: '[de] Choose how to handle Xero taxes in Expensify.',
            notImported: '[de] Not imported',
            notConfigured: '[de] Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: '[de] Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '[de] Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '[de] Report fields',
            },
            exportDescription: '[de] Configure how Expensify data exports to Xero.',
            purchaseBill: '[de] Purchase bill',
            exportDeepDiveCompanyCard:
                '[de] Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: '[de] Bank transactions',
            xeroBankAccount: '[de] Xero bank account',
            xeroBankAccountDescription: '[de] Choose where expenses will post as bank transactions.',
            exportExpensesDescription: '[de] Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: '[de] Purchase bill date',
            exportInvoices: '[de] Export invoices as',
            salesInvoice: '[de] Sales invoice',
            exportInvoicesDescription: '[de] Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: '[de] Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: '[de] Purchase bill status',
                reimbursedReportsDescription: '[de] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: '[de] Xero bill payment account',
                xeroInvoiceCollectionAccount: '[de] Xero invoice collections account',
                xeroBillPaymentAccountDescription: "[de] Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "[de] Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: '[de] Purchase bill date',
                description: '[de] Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[de] Date of last expense',
                        description: '[de] Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[de] Export date',
                        description: '[de] Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[de] Submitted date',
                        description: '[de] Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: '[de] Purchase bill status',
                description: '[de] Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '[de] Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '[de] Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '[de] Awaiting payment',
                },
            },
            noAccountsFound: '[de] No accounts found',
            noAccountsFoundDescription: '[de] Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: '[de] When to Export',
                description: '[de] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '[de] Preferred exporter',
            taxSolution: '[de] Tax solution',
            notConfigured: '[de] Not configured',
            exportDate: {
                label: '[de] Export date',
                description: '[de] Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[de] Date of last expense',
                        description: '[de] Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '[de] Export date',
                        description: '[de] Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '[de] Submitted date',
                        description: '[de] Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: '[de] Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '[de] Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[de] Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: '[de] Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '[de] Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[de] Vendor bills',
                },
            },
            creditCardAccount: '[de] Credit card account',
            defaultVendor: '[de] Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `[de] Set a default vendor that will apply to ${isReimbursable ? '' : '[de] non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: '[de] Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                '[de] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[de] Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: '[de] No accounts found',
            noAccountsFoundDescription: `[de] Please add the account in Sage Intacct and sync the connection again`,
            autoSync: '[de] Auto-sync',
            autoSyncDescription: '[de] Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: '[de] Invite employees',
            inviteEmployeesDescription:
                '[de] Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: '[de] Sync reimbursed reports',
            syncReimbursedReportsDescription: '[de] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: '[de] Sage Intacct payment account',
            accountingMethods: {
                label: '[de] When to Export',
                description: '[de] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Out-of-pocket expenses will export when paid',
                },
            },
        },
        netsuite: {
            subsidiary: '[de] Subsidiary',
            subsidiarySelectDescription: "[de] Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: '[de] Configure how Expensify data exports to NetSuite.',
            exportInvoices: '[de] Export invoices to',
            journalEntriesTaxPostingAccount: '[de] Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: '[de] Journal entries provincial tax posting account',
            foreignCurrencyAmount: '[de] Export foreign currency amount',
            exportToNextOpenPeriod: '[de] Export to next open period',
            nonReimbursableJournalPostingAccount: '[de] Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: '[de] Reimbursable journal posting account',
            journalPostingPreference: {
                label: '[de] Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '[de] Single, itemized entry for each report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '[de] Single entry for each expense',
                },
            },
            invoiceItem: {
                label: '[de] Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '[de] Create one for me',
                        description: '[de] We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '[de] Select existing',
                        description: "[de] We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: '[de] Export date',
                description: '[de] Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[de] Date of last expense',
                        description: '[de] Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '[de] Export date',
                        description: '[de] Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '[de] Submitted date',
                        description: '[de] Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '[de] Expense reports',
                        reimbursableDescription: '[de] Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: '[de] Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '[de] Vendor bills',
                        reimbursableDescription: dedent(`
                            [de] Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [de] Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '[de] Journal entries',
                        reimbursableDescription: dedent(`
                            [de] Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [de] Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "[de] If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: '[de] Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: '[de] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: '[de] Reimbursements account',
                reimbursementsAccountDescription: "[de] Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: '[de] Collections account',
                collectionsAccountDescription: '[de] Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: '[de] A/P approval account',
                approvalAccountDescription:
                    '[de] Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: '[de] NetSuite default',
                inviteEmployees: '[de] Invite employees and set approvals',
                inviteEmployeesDescription:
                    '[de] Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: '[de] Auto-create employees/vendors',
                enableCategories: '[de] Enable newly imported categories',
                customFormID: '[de] Custom form ID',
                customFormIDDescription:
                    '[de] By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: '[de] Out-of-pocket expense',
                customFormIDNonReimbursable: '[de] Company card expense',
                exportReportsTo: {
                    label: '[de] Expense report approval level',
                    description: '[de] Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: '[de] NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '[de] Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '[de] Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '[de] Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: '[de] When to Export',
                    description: '[de] Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[de] Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[de] Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: '[de] Vendor bill approval level',
                    description: '[de] Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: '[de] NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '[de] Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '[de] Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: '[de] Journal entry approval level',
                    description: '[de] Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: '[de] NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '[de] Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '[de] Approved for posting',
                    },
                },
                error: {
                    customFormID: '[de] Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: '[de] No accounts found',
            noAccountsFoundDescription: '[de] Please add the account in NetSuite and sync the connection again',
            noVendorsFound: '[de] No vendors found',
            noVendorsFoundDescription: '[de] Please add vendors in NetSuite and sync the connection again',
            noItemsFound: '[de] No invoice items found',
            noItemsFoundDescription: '[de] Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: '[de] No subsidiaries found',
            noSubsidiariesFoundDescription: '[de] Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: '[de] NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: '[de] Install the Expensify bundle',
                        description: '[de] In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: '[de] Enable token-based authentication',
                        description: '[de] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: '[de] Enable SOAP web services',
                        description: '[de] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: '[de] Create an access token',
                        description:
                            '[de] In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: '[de] Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: '[de] NetSuite Account ID',
                            netSuiteTokenID: '[de] Token ID',
                            netSuiteTokenSecret: '[de] Token Secret',
                        },
                        netSuiteAccountIDDescription: '[de] In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: '[de] Expense categories',
                expenseCategoriesDescription: '[de] Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: '[de] Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: '[de] Departments',
                        subtitle: '[de] Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: '[de] Classes',
                        subtitle: '[de] Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: '[de] Locations',
                        subtitle: '[de] Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: '[de] Customers/projects',
                    subtitle: '[de] Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: '[de] Import customers',
                    importJobs: '[de] Import projects',
                    customers: '[de] customers',
                    jobs: '[de] projects',
                    label: (importFields: string[], importType: string) => `${importFields.join('[de]  and ')}, ${importType}`,
                },
                importTaxDescription: '[de] Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: '[de] Choose an option below:',
                    label: (importedTypes: string[]) => `[de] Imported as ${importedTypes.join('[de]  and ')}`,
                    requiredFieldError: (fieldName: string) => `[de] Please enter the ${fieldName}`,
                    customSegments: {
                        title: '[de] Custom segments/records',
                        addText: '[de] Add custom segment/record',
                        recordTitle: '[de] Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '[de] View detailed instructions',
                        helpText: '[de]  on configuring custom segments/records.',
                        emptyTitle: '[de] Add a custom segment or custom record',
                        fields: {
                            segmentName: '[de] Name',
                            internalID: '[de] Internal ID',
                            scriptID: '[de] Script ID',
                            customRecordScriptID: '[de] Transaction column ID',
                            mapping: '[de] Displayed as',
                        },
                        removeTitle: '[de] Remove custom segment/record',
                        removePrompt: '[de] Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: '[de] custom segment name',
                            customRecordName: '[de] custom record name',
                            segmentTitle: '[de] Custom segment',
                            customSegmentAddTitle: '[de] Add custom segment',
                            customRecordAddTitle: '[de] Add custom record',
                            recordTitle: '[de] Custom record',
                            segmentRecordType: '[de] Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "[de] What's the custom segment name?",
                            customRecordNameTitle: "[de] What's the custom record name?",
                            customSegmentNameFooter: `[de] You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `[de] You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "[de] What's the internal ID?",
                            customSegmentInternalIDFooter: `[de] First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*

You can find custom segment internal IDs in NetSuite under:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the hyperlink next to *Custom Record Type*.
4. Find the internal ID in the table at the bottom.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `[de] You can find custom record internal IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the internal ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "[de] What's the script ID?",
                            customSegmentScriptIDFooter: `[de] You can find custom segment script IDs in NetSuite under: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the *Application and Sourcing* tab near the bottom, then:
    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.
    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "[de] What's the transaction column ID?",
                            customRecordScriptIDFooter: `[de] You can find custom record script IDs in NetSuite under:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the script ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '[de] How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: '[de] How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `[de] A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: '[de] Custom lists',
                        addText: '[de] Add custom list',
                        recordTitle: '[de] Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '[de] View detailed instructions',
                        helpText: '[de]  on configuring custom lists.',
                        emptyTitle: '[de] Add a custom list',
                        fields: {
                            listName: '[de] Name',
                            internalID: '[de] Internal ID',
                            transactionFieldID: '[de] Transaction field ID',
                            mapping: '[de] Displayed as',
                        },
                        removeTitle: '[de] Remove custom list',
                        removePrompt: '[de] Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: '[de] Choose a custom list',
                            transactionFieldIDTitle: "[de] What's the transaction field ID?",
                            transactionFieldIDFooter: `[de] You can find transaction field IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom list.
3. Find the transaction field ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '[de] How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `[de] A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: '[de] NetSuite employee default',
                        description: '[de] Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `[de] If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '[de] Tags',
                        description: '[de] Line-item level',
                        footerContent: (importField: string) => `[de] ${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '[de] Report fields',
                        description: '[de] Report level',
                        footerContent: (importField: string) => `[de] ${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: '[de] Sage Intacct setup',
            prerequisitesTitle: '[de] Before you connect...',
            downloadExpensifyPackage: '[de] Download the Expensify package for Sage Intacct',
            followSteps: '[de] Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: '[de] Enter your Sage Intacct credentials',
            entity: '[de] Entity',
            employeeDefault: '[de] Sage Intacct employee default',
            employeeDefaultDescription: "[de] The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "[de] Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "[de] Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: (mappingTitle: string) => `[de] Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: '[de] Expense types',
            expenseTypesDescription: '[de] Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: '[de] Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: '[de] Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: '[de] User-defined dimensions',
            addUserDefinedDimension: '[de] Add user-defined dimension',
            integrationName: '[de] Integration name',
            dimensionExists: '[de] A dimension with this name already exists.',
            removeDimension: '[de] Remove user-defined dimension',
            removeDimensionPrompt: '[de] Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: '[de] User-defined dimension',
            addAUserDefinedDimension: '[de] Add a user-defined dimension',
            detailedInstructionsLink: '[de] View detailed instructions',
            detailedInstructionsRestOfSentence: '[de]  on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '[de] 1 UDD added',
                other: (count: number) => `[de] ${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '[de] departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '[de] classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '[de] locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '[de] customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '[de] projects (jobs)';
                    default:
                        return '[de] mappings';
                }
            },
        },
        type: {
            free: '[de] Free',
            control: '[de] Control',
            collect: '[de] Collect',
        },
        companyCards: {
            addCards: '[de] Add cards',
            selectCards: '[de] Select cards',
            fromOtherWorkspaces: '[de] From other workspaces',
            addWorkEmail: '[de] Add your work email',
            addWorkEmailDescription: '[de] Please add your work email in order to use existing feeds from other workspaces.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: "[de] Couldn't load card feeds",
                workspaceFeedsCouldNotBeLoadedMessage: '[de] An error occurred while loading workspace card feeds. Please try again or contact your administrator.',
                feedCouldNotBeLoadedTitle: "[de] Couldn't load this feed",
                feedCouldNotBeLoadedMessage: '[de] An error occurred while loading this feed. Please try again or contact your administrator.',
                tryAgain: '[de] Try again',
            },
            addNewCard: {
                other: '[de] Other',
                fileImport: '[de] Import transactions from file',
                createFileFeedHelpText: `[de] <muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: '[de] Company card layout name',
                cardLayoutNameRequired: '[de] The Company card layout name is required',
                useAdvancedFields: '[de] Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: '[de] American Express Corporate Cards',
                    cdf: '[de] Mastercard Commercial Cards',
                    vcf: '[de] Visa Commercial Cards',
                    stripe: '[de] Stripe Cards',
                },
                yourCardProvider: `[de] Who's your card provider?`,
                whoIsYourBankAccount: '[de] Who’s your bank?',
                whereIsYourBankLocated: '[de] Where’s your bank located?',
                howDoYouWantToConnect: '[de] How do you want to connect to your bank?',
                learnMoreAboutOptions: `[de] <muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: '[de] Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `[de] Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: '[de] The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `[de] Enable your ${provider} feed`,
                    heading: '[de] We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: '[de] We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: '[de] We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `[de] 1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.

2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `[de] 1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.

2. Once the feed is enabled, Amex will send you a production letter.

3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `[de] 1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.

 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `[de] 1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Under Product Integrations, click Enable next to Expensify.

3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: '[de] What bank issues these cards?',
                enterNameOfBank: '[de] Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: '[de] What are the Visa feed details?',
                        processorLabel: '[de] Processor ID',
                        bankLabel: '[de] Financial institution (bank) ID',
                        companyLabel: '[de] Company ID',
                        helpLabel: '[de] Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `[de] What's the Amex delivery file name?`,
                        fileNameLabel: '[de] Delivery file name',
                        helpLabel: '[de] Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `[de] What's the Mastercard distribution ID?`,
                        distributionLabel: '[de] Distribution ID',
                        helpLabel: '[de] Where do I find the distribution ID?',
                    },
                },
                amexCorporate: '[de] Select this if the front of your cards say “Corporate”',
                amexBusiness: '[de] Select this if the front of your cards say “Business”',
                amexPersonal: '[de] Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: '[de] Please select a card provider before continuing',
                    pleaseSelectBankAccount: '[de] Please select a bank account before continuing',
                    pleaseSelectBank: '[de] Please select a bank before continuing',
                    pleaseSelectCountry: '[de] Please select a country before continuing',
                    pleaseSelectFeedType: '[de] Please select a feed type before continuing',
                },
                exitModal: {
                    title: '[de] Something not working?',
                    prompt: "[de] We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: '[de] Report issue',
                    cancelText: '[de] Skip',
                },
                csvColumns: {
                    cardNumber: '[de] Card number',
                    postedDate: '[de] Date',
                    merchant: '[de] Merchant',
                    amount: '[de] Amount',
                    currency: '[de] Currency',
                    ignore: '[de] Ignore',
                    originalTransactionDate: '[de] Original transaction date',
                    originalAmount: '[de] Original amount',
                    originalCurrency: '[de] Original currency',
                    comment: '[de] Comment',
                    category: '[de] Category',
                    tag: '[de] Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `[de] Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `[de] Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '[de] Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '[de] Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '[de] Custom day of month',
            },
            assign: '[de] Assign',
            assignCard: '[de] Assign card',
            findCard: '[de] Find card',
            cardNumber: '[de] Card number',
            commercialFeed: '[de] Commercial feed',
            feedName: (feedName: string) => `[de] ${feedName} cards`,
            deletedFeed: '[de] Deleted feed',
            deletedCard: '[de] Deleted card',
            directFeed: '[de] Direct feed',
            whoNeedsCardAssigned: '[de] Who needs a card assigned?',
            chooseTheCardholder: '[de] Choose the cardholder',
            chooseCard: '[de] Choose a card',
            chooseCardFor: (assignee: string) => `[de] Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: '[de] No active cards on this feed',
            somethingMightBeBroken:
                '[de] <muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: '[de] Choose a transaction start date',
            startDateDescription: "[de] Choose your import start date. We'll sync all transactions from this date onwards.",
            editStartDateDescription: "[de] Choose a new transaction start date. We'll sync all transactions from that date onwards, excluding those we already imported.",
            fromTheBeginning: '[de] From the beginning',
            customStartDate: '[de] Custom start date',
            customCloseDate: '[de] Custom close date',
            letsDoubleCheck: "[de] Let's double check that everything looks right.",
            confirmationDescription: "[de] We'll begin importing transactions immediately.",
            card: '[de] Card',
            cardName: '[de] Card name',
            brokenConnectionError: '[de] <rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `[de] assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '[de] company card',
            chooseCardFeed: '[de] Choose card feed',
            ukRegulation:
                '[de] Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: '[de] Card assignment failed.',
            unassignCardFailedError: '[de] Card unassignment failed.',
            cardAlreadyAssignedError: '[de] This card is already assigned to a user in another workspace.',
            importTransactions: {
                title: '[de] Import transactions from file',
                description: '[de] Please adjust the settings for your file that will be applied on import.',
                cardDisplayName: '[de] Card display name',
                currency: '[de] Currency',
                transactionsAreReimbursable: '[de] Transactions are reimbursable',
                flipAmountSign: '[de] Flip amount sign',
                importButton: '[de] Import transactions',
            },
            assignNewCards: {
                title: '[de] Assign new cards',
                description: '[de] Get the latest cards to assign from your bank',
            },
        },
        expensifyCard: {
            issueAndManageCards: '[de] Issue and manage your Expensify Cards',
            getStartedIssuing: '[de] Get started by issuing your first virtual or physical card.',
            verificationInProgress: '[de] Verification in progress...',
            verifyingTheDetails: "[de] We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                '[de] The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                '[de] Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: '[de] Issue card',
            findCard: '[de] Find card',
            newCard: '[de] New card',
            name: '[de] Name',
            lastFour: '[de] Last 4',
            limit: '[de] Limit',
            currentBalance: '[de] Current balance',
            currentBalanceDescription: '[de] Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: (settlementDate: string) => `[de] Balance will be settled on ${settlementDate}`,
            settleBalance: '[de] Settle balance',
            cardLimit: '[de] Card limit',
            remainingLimit: '[de] Remaining limit',
            requestLimitIncrease: '[de] Request limit increase',
            remainingLimitDescription:
                '[de] We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: '[de] Cash back',
            earnedCashbackDescription: '[de] Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: '[de] Issue new card',
            finishSetup: '[de] Finish setup',
            chooseBankAccount: '[de] Choose bank account',
            chooseExistingBank: '[de] Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: '[de] Account ending in',
            addNewBankAccount: '[de] Add a new bank account',
            settlementAccount: '[de] Settlement account',
            settlementAccountDescription: '[de] Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `[de] Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: '[de] Settlement frequency',
            settlementFrequencyDescription: '[de] Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo: '[de] If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            frequency: {
                daily: '[de] Daily',
                monthly: '[de] Monthly',
            },
            cardDetails: '[de] Card details',
            cardPending: ({name}: {name: string}) => `[de] Card is currently pending and will be issued once ${name}'s account is validated.`,
            virtual: '[de] Virtual',
            physical: '[de] Physical',
            deactivate: '[de] Deactivate card',
            changeCardLimit: '[de] Change card limit',
            changeLimit: '[de] Change limit',
            smartLimitWarning: (limit: number | string) => `[de] If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `[de] If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `[de] If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: '[de] Change card limit type',
            changeLimitType: '[de] Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `[de] If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `[de] If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: '[de] Add shipping details',
            issuedCard: (assignee: string) => `[de] issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `[de] issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: (assignee: string, link: string) => `[de] issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `[de] ${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `[de] ${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: (assignee: string, link: string) => `[de] ${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: '[de] card',
            replacementCard: '[de] replacement card',
            verifyingHeader: '[de] Verifying',
            bankAccountVerifiedHeader: '[de] Bank account verified',
            verifyingBankAccount: '[de] Verifying bank account...',
            verifyingBankAccountDescription: '[de] Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: '[de] Bank account verified!',
            bankAccountVerifiedDescription: '[de] You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: '[de] One more step...',
            oneMoreStepDescription: '[de] Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: '[de] Got it',
            goToConcierge: '[de] Go to Concierge',
        },
        categories: {
            deleteCategories: '[de] Delete categories',
            deleteCategoriesPrompt: '[de] Are you sure you want to delete these categories?',
            deleteCategory: '[de] Delete category',
            deleteCategoryPrompt: '[de] Are you sure you want to delete this category?',
            disableCategories: '[de] Disable categories',
            disableCategory: '[de] Disable category',
            enableCategories: '[de] Enable categories',
            enableCategory: '[de] Enable category',
            defaultSpendCategories: '[de] Default spend categories',
            spendCategoriesDescription: '[de] Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: '[de] An error occurred while deleting the category, please try again',
            categoryName: '[de] Category name',
            requiresCategory: '[de] Members must categorize all expenses',
            needCategoryForExportToIntegration: (connectionName: string) => `[de] All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: '[de] Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "[de] You haven't created any categories",
                subtitle: '[de] Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[de] <muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: '[de] An error occurred while updating the category, please try again',
            createFailureMessage: '[de] An error occurred while creating the category, please try again',
            addCategory: '[de] Add category',
            editCategory: '[de] Edit category',
            editCategories: '[de] Edit categories',
            findCategory: '[de] Find category',
            categoryRequiredError: '[de] Category name is required',
            existingCategoryError: '[de] A category with this name already exists',
            invalidCategoryName: '[de] Invalid category name',
            importedFromAccountingSoftware: '[de] The categories below are imported from your',
            payrollCode: '[de] Payroll code',
            updatePayrollCodeFailureMessage: '[de] An error occurred while updating the payroll code, please try again',
            glCode: '[de] GL code',
            updateGLCodeFailureMessage: '[de] An error occurred while updating the GL code, please try again',
            importCategories: '[de] Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: '[de] Cannot delete or disable all categories',
                description: `[de] At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: '[de] Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: '[de] Spend',
                subtitle: '[de] Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: '[de] Manage',
                subtitle: '[de] Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: '[de] Earn',
                subtitle: '[de] Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: '[de] Organize',
                subtitle: '[de] Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: '[de] Integrate',
                subtitle: '[de] Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: '[de] Distance rates',
                subtitle: '[de] Add, update, and enforce rates.',
            },
            perDiem: {
                title: '[de] Per diem',
                subtitle: '[de] Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: '[de] Travel',
                subtitle: '[de] Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: '[de] Get started with Expensify Travel',
                    subtitle: "[de] We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "[de] Let's go",
                },
                reviewingRequest: {
                    title: "[de] Pack your bags, we've got your request...",
                    subtitle: "[de] We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: '[de] Request sent',
                },
                bookOrManageYourTrip: {
                    title: '[de] Travel booking',
                    subtitle: "[de] Congrats! You're all set to book and manage travel on this workspace.",
                    ctaText: '[de] Manage travel',
                },
                settings: {
                    autoAddTripName: {
                        title: '[de] Add trip names to expenses',
                        subtitle: '[de] Automatically add trip names to expense descriptions for travel booked in Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '[de] Travel booking',
                        subtitle: "[de] Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: '[de] Manage travel',
                    },
                    centralInvoicingSection: {
                        title: '[de] Central invoicing',
                        subtitle: '[de] Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: '[de] Learn how.',
                        subsections: {
                            currentTravelSpendLabel: '[de] Current travel spend',
                            currentTravelSpendPaymentQueued: (amount: string) => `[de] Payment of ${amount} is queued and will be processed soon.`,
                            currentTravelSpendCta: '[de] Pay balance',
                            currentTravelLimitLabel: '[de] Current travel limit',
                            settlementAccountLabel: '[de] Settlement account',
                            settlementFrequencyLabel: '[de] Settlement frequency',
                            settlementFrequencyDescription: '[de] How often Expensify will pull from your business bank account to settle recent Expensify Travel transactions.',
                            monthlySpendLimitLabel: '[de] Monthly spend limit per member',
                            monthlySpendLimitDescription: '[de] The maximum amount each member can spend on travel per month.',
                            reduceLimitTitle: '[de] Reduce travel spend limit?',
                            reduceLimitWarning:
                                '[de] If you reduce the limit, members who have already spent more than this amount will be unable to make new travel bookings until next month.',
                            provisioningError:
                                "[de] We weren't able to provision some of the members of your workspace for central invoicing. Please try again later or reach out to Concierge for assistance.",
                        },
                    },
                    disableModal: {
                        title: '[de] Turn off Travel Invoicing?',
                        body: '[de] Upcoming hotel and car rental reservations may need to be re-booked with a different payment method to avoid cancellation.',
                        confirm: '[de] Turn off',
                    },
                    outstandingBalanceModal: {
                        title: "[de] Can't turn off Travel Invoicing",
                        body: '[de] You still have an outstanding travel balance. Please pay your balance first.',
                        confirm: '[de] Got it',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `[de] Pay balance of ${amount}?`,
                        body: '[de] The payment will be queued and processed shortly after. This action cannot be undone once started.',
                    },
                    exportToPDF: '[de] Export to PDF',
                    exportToCSV: '[de] Export to CSV',
                    selectDateRangeError: '[de] Please select a date range to export',
                    invalidDateRangeError: '[de] The start date must be before the end date',
                    enabled: '[de] Central Invoicing enabled!',
                    enabledDescription: '[de] All travel spend on this workspace will now be centralized in a monthly invoice.',
                },
                personalDetailsDescription: '[de] In order to book travel, please enter your legal name as it appears on your government-issued ID.',
            },
            expensifyCard: {
                title: '[de] Expensify Card',
                subtitle: '[de] Gain insights and control over spend.',
                disableCardTitle: '[de] Disable Expensify Card',
                disableCardPrompt: '[de] You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: '[de] Chat with Concierge',
                feed: {
                    title: '[de] Get the Expensify Card',
                    subTitle: '[de] Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: '[de] Cash back on every US purchase',
                        unlimited: '[de] Unlimited virtual cards',
                        spend: '[de] Spend controls and custom limits',
                    },
                    ctaTitle: '[de] Issue new card',
                },
            },
            companyCards: {
                title: '[de] Company cards',
                subtitle: '[de] Connect the cards you already have.',
                feed: {
                    title: '[de] Bring your own cards (BYOC)',
                    subtitle: '[de] Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: '[de] Connect cards from 10,000+ banks',
                        assignCards: '[de] Link your team’s existing cards',
                        automaticImport: '[de] We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: '[de] Bank connection issue',
                connectWithPlaid: '[de] connect via Plaid',
                connectWithExpensifyCard: '[de] try the Expensify Card.',
                bankConnectionDescription: `[de] Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: '[de] Disable company cards',
                disableCardPrompt: '[de] You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: '[de] Chat with Concierge',
                cardDetails: '[de] Card details',
                cardNumber: '[de] Card number',
                cardholder: '[de] Cardholder',
                cardName: '[de] Card name',
                allCards: '[de] All cards',
                assignedCards: '[de] Assigned',
                unassignedCards: '[de] Unassigned',
                integrationExport: (integration: string, type?: string) => (integration && type ? `[de] ${integration} ${type.toLowerCase()} export` : `[de] ${integration} export`),
                integrationExportTitleXero: (integration: string) => `[de] Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `[de] Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: '[de] Last updated',
                transactionStartDate: '[de] Transaction start date',
                updateCard: '[de] Update card',
                unassignCard: '[de] Unassign card',
                unassign: '[de] Unassign',
                unassignCardDescription: '[de] Unassigning this card will delete all unsubmitted transactions.',
                assignCard: '[de] Assign card',
                removeCard: '[de] Remove card',
                remove: '[de] Remove',
                removeCardDescription: '[de] Removing this card will delete all unsubmitted transactions.',
                cardFeedName: '[de] Card feed name',
                cardFeedNameDescription: '[de] Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: '[de] Delete transactions',
                cardFeedTransactionDescription: '[de] Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: '[de] Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: '[de] Allow deleting transactions',
                removeCardFeed: '[de] Remove card feed',
                removeCardFeedTitle: (feedName: string) => `[de] Remove ${feedName} feed`,
                removeCardFeedDescription: '[de] Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: '[de] Card feed name is required',
                    statementCloseDateRequired: '[de] Please select a statement close date.',
                },
                corporate: '[de] Restrict deleting transactions',
                personal: '[de] Allow deleting transactions',
                setFeedNameDescription: '[de] Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: '[de] When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: '[de] No cards in this feed',
                emptyAddedFeedDescription: "[de] Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `[de] We're reviewing your request...`,
                pendingFeedDescription: `[de] We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '[de] Check your browser window',
                pendingBankDescription: (bankName: string) => `[de] Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: '[de] please click here',
                giveItNameInstruction: '[de] Give the card a name that sets it apart from others.',
                updating: '[de] Updating...',
                neverUpdated: '[de] Never',
                noAccountsFound: '[de] No accounts found',
                defaultCard: '[de] Default card',
                downgradeTitle: `[de] Can't downgrade workspace`,
                downgradeSubTitle: `[de] This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `[de] Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: '[de] Get the Expensify Card',
                expensifyCardBannerSubtitle: '[de] Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: '[de] Learn more',
                statementCloseDateTitle: '[de] Statement close date',
                statementCloseDateDescription: '[de] Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: '[de] Workflows',
                subtitle: '[de] Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    '[de] Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: '[de] Invoices',
                subtitle: '[de] Send and receive invoices.',
            },
            categories: {
                title: '[de] Categories',
                subtitle: '[de] Track and organize spend.',
            },
            tags: {
                title: '[de] Tags',
                subtitle: '[de] Classify costs and track billable expenses.',
            },
            taxes: {
                title: '[de] Taxes',
                subtitle: '[de] Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: '[de] Report fields',
                subtitle: '[de] Set up custom fields for spend.',
            },
            connections: {
                title: '[de] Accounting',
                subtitle: '[de] Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: '[de] Receipt partners',
                subtitle: '[de] Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '[de] Not so fast...',
                featureEnabledText: "[de] To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "[de] To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: '[de] Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '[de] Disconnect Uber',
                disconnectText: '[de] To disable this feature, please disconnect the Uber for Business integration first.',
                description: '[de] Are you sure you want to disconnect this integration?',
                confirmText: '[de] Got it',
            },
            workflowWarningModal: {
                featureEnabledTitle: '[de] Not so fast...',
                featureEnabledText:
                    '[de] Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: '[de] Go to Expensify Cards',
            },
            rules: {
                title: '[de] Rules',
                subtitle: '[de] Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: '[de] Time',
                subtitle: '[de] Set a billable hourly rate for time tracking.',
                defaultHourlyRate: '[de] Default hourly rate',
            },
        },
        reports: {
            reportsCustomTitleExamples: '[de] Examples:',
            customReportNamesSubtitle: `[de] <muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: '[de] Default report title',
            customNameDescription: `[de] Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: '[de] Name',
            customNameEmailPhoneExample: '[de] Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: '[de] Report start date: {report:startdate}',
            customNameWorkspaceNameExample: '[de] Workspace name: {report:workspacename}',
            customNameReportIDExample: '[de] Report ID: {report:id}',
            customNameTotalExample: '[de] Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: '[de] Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: '[de] Add field',
            delete: '[de] Delete field',
            deleteFields: '[de] Delete fields',
            findReportField: '[de] Find report field',
            deleteConfirmation: '[de] Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: '[de] Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "[de] You haven't created any report fields",
                subtitle: '[de] Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "[de] Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: '[de] Disable report fields',
            disableReportFieldsConfirmation: '[de] Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: '[de] The report fields below are imported from your',
            textType: '[de] Text',
            dateType: '[de] Date',
            dropdownType: '[de] List',
            formulaType: '[de] Formula',
            textAlternateText: '[de] Add a field for free text input.',
            dateAlternateText: '[de] Add a calendar for date selection.',
            dropdownAlternateText: '[de] Add a list of options to choose from.',
            formulaAlternateText: '[de] Add a formula field.',
            nameInputSubtitle: '[de] Choose a name for the report field.',
            typeInputSubtitle: '[de] Choose what type of report field to use.',
            initialValueInputSubtitle: '[de] Enter a starting value to show in the report field.',
            listValuesInputSubtitle: '[de] These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: '[de] These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: '[de] Delete value',
            deleteValues: '[de] Delete values',
            disableValue: '[de] Disable value',
            disableValues: '[de] Disable values',
            enableValue: '[de] Enable value',
            enableValues: '[de] Enable values',
            emptyReportFieldsValues: {
                title: "[de] You haven't created any list values",
                subtitle: '[de] Add custom values to appear on reports.',
            },
            deleteValuePrompt: '[de] Are you sure you want to delete this list value?',
            deleteValuesPrompt: '[de] Are you sure you want to delete these list values?',
            listValueRequiredError: '[de] Please enter a list value name',
            existingListValueError: '[de] A list value with this name already exists',
            editValue: '[de] Edit value',
            listValues: '[de] List values',
            addValue: '[de] Add value',
            existingReportFieldNameError: '[de] A report field with this name already exists',
            reportFieldNameRequiredError: '[de] Please enter a report field name',
            reportFieldTypeRequiredError: '[de] Please choose a report field type',
            circularReferenceError: "[de] This field can't refer to itself. Please update.",
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `[de] Formula field ${value} not recognized`,
            reportFieldInitialValueRequiredError: '[de] Please choose a report field initial value',
            genericFailureMessage: '[de] An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: '[de] Tag name',
            requiresTag: '[de] Members must tag all expenses',
            trackBillable: '[de] Track billable expenses',
            customTagName: '[de] Custom tag name',
            enableTag: '[de] Enable tag',
            enableTags: '[de] Enable tags',
            requireTag: '[de] Require tag',
            requireTags: '[de] Require tags',
            notRequireTags: '[de] Don’t require',
            disableTag: '[de] Disable tag',
            disableTags: '[de] Disable tags',
            addTag: '[de] Add tag',
            editTag: '[de] Edit tag',
            editTags: '[de] Edit tags',
            findTag: '[de] Find tag',
            subtitle: '[de] Tags add more detailed ways to classify costs.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `[de] <muted-text>Tags add more detailed ways to classify costs. You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "[de] You haven't created any tags",
                subtitle: '[de] Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `[de] <muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[de] <muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: '[de] Delete tag',
            deleteTags: '[de] Delete tags',
            deleteTagConfirmation: '[de] Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: '[de] Are you sure that you want to delete these tags?',
            deleteFailureMessage: '[de] An error occurred while deleting the tag, please try again',
            tagRequiredError: '[de] Tag name is required',
            existingTagError: '[de] A tag with this name already exists',
            invalidTagNameError: '[de] Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: '[de] An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: '[de] Tags are managed in your',
            employeesSeeTagsAs: '[de] Employees see tags as',
            glCode: '[de] GL code',
            updateGLCodeFailureMessage: '[de] An error occurred while updating the GL code, please try again',
            tagRules: '[de] Tag rules',
            approverDescription: '[de] Approver',
            importTags: '[de] Import tags',
            importTagsSupportingText: '[de] Code your expenses with one type of tag or many.',
            configureMultiLevelTags: '[de] Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `[de] Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: '[de] The first row is the title for each tag list',
                independentTags: '[de] These are independent tags',
                glAdjacentColumn: '[de] There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: '[de] Single level of tags',
                multiLevel: '[de] Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '[de] Switch Tag Levels',
                prompt1: '[de] Switching tag levels will erase all current tags.',
                prompt2: '[de]  We suggest you first',
                prompt3: '[de]  download a backup',
                prompt4: '[de]  by exporting your tags.',
                prompt5: '[de]  Learn more',
                prompt6: '[de]  about tag levels.',
            },
            overrideMultiTagWarning: {
                title: '[de] Import tags',
                prompt1: '[de] Are you sure?',
                prompt2: '[de]  The existing tags will be overridden, but you can',
                prompt3: '[de]  download a backup',
                prompt4: '[de]  first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `[de] We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: '[de] Cannot delete or disable all tags',
                description: `[de] At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: '[de] Cannot make all tags optional',
                description: `[de] At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: '[de] Cannot make tag list required',
                description: '[de] You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '[de] 1 Tag',
                other: (count: number) => `[de] ${count} Tags`,
            }),
        },
        taxes: {
            subtitle: '[de] Add tax names, rates, and set defaults.',
            addRate: '[de] Add rate',
            workspaceDefault: '[de] Workspace currency default',
            foreignDefault: '[de] Foreign currency default',
            customTaxName: '[de] Custom tax name',
            value: '[de] Value',
            taxReclaimableOn: '[de] Tax reclaimable on',
            taxRate: '[de] Tax rate',
            findTaxRate: '[de] Find tax rate',
            error: {
                taxRateAlreadyExists: '[de] This tax name is already in use',
                taxCodeAlreadyExists: '[de] This tax code is already in use',
                valuePercentageRange: '[de] Please enter a valid percentage between 0 and 100',
                customNameRequired: '[de] Custom tax name is required',
                deleteFailureMessage: '[de] An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: '[de] An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: '[de] An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: '[de] The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: '[de] Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `[de] Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '[de] Delete rate',
                deleteMultiple: '[de] Delete rates',
                enable: '[de] Enable rate',
                disable: '[de] Disable rate',
                enableTaxRates: () => ({
                    one: '[de] Enable rate',
                    other: '[de] Enable rates',
                }),
                disableTaxRates: () => ({
                    one: '[de] Disable rate',
                    other: '[de] Disable rates',
                }),
            },
            importedFromAccountingSoftware: '[de] The taxes below are imported from your',
            taxCode: '[de] Tax code',
            updateTaxCodeFailureMessage: '[de] An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: '[de] Name your new workspace',
            selectFeatures: '[de] Select features to copy',
            whichFeatures: '[de] Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '[de] \n\nDo you want to continue?',
            categories: '[de] categories and your auto-categorization rules',
            reimbursementAccount: '[de] reimbursement account',
            welcomeNote: '[de] Please start using my new workspace',
            delayedSubmission: '[de] delayed submission',
            merchantRules: '[de] Merchant rules',
            merchantRulesCount: () => ({
                one: '[de] 1 merchant rule',
                other: (count: number) => `[de] ${count} merchant rules`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `[de] You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: '[de] An error occurred while duplicating your new workspace. Please try again.',
        },
        emptyWorkspace: {
            title: '[de] No workspaces yet',
            subtitle: '[de] Create a workspace to manage your expenses, reimbursements, and company cards.',
            createAWorkspaceCTA: '[de] Get Started',
            features: {
                trackAndCollect: '[de] Track and collect receipts',
                reimbursements: '[de] Reimburse employees',
                companyCards: '[de] Manage company cards',
            },
            notFound: '[de] No workspace found',
            description: '[de] Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: '[de] New workspace',
            getTheExpensifyCardAndMore: '[de] Get the Expensify Card and more',
            confirmWorkspace: '[de] Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `[de] My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `[de] ${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '[de] An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `[de] Are you sure you want to remove ${memberName}?`,
                other: '[de] Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `[de] ${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '[de] Remove member',
                other: '[de] Remove members',
            }),
            findMember: '[de] Find member',
            removeWorkspaceMemberButtonTitle: '[de] Remove from workspace',
            removeGroupMemberButtonTitle: '[de] Remove from group',
            removeRoomMemberButtonTitle: '[de] Remove from chat',
            removeMemberPrompt: (memberName: string) => `[de] Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '[de] Remove member',
            transferOwner: '[de] Transfer owner',
            makeMember: () => ({
                one: '[de] Make member',
                other: '[de] Make members',
            }),
            makeAdmin: () => ({
                one: '[de] Make admin',
                other: '[de] Make admins',
            }),
            makeAuditor: () => ({
                one: '[de] Make auditor',
                other: '[de] Make auditors',
            }),
            selectAll: '[de] Select all',
            error: {
                genericAdd: '[de] There was a problem adding this workspace member',
                cannotRemove: "[de] You can't remove yourself or the workspace owner",
                genericRemove: '[de] There was a problem removing that workspace member',
            },
            addedWithPrimary: '[de] Some members were added with their primary logins.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `[de] Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `[de] Total workspace members: ${count}`,
            importMembers: '[de] Import members',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `[de] If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `[de] ${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `[de] You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[de] If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[de] If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `[de] ${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: '[de] Get started by issuing your first virtual or physical card.',
            issueCard: '[de] Issue card',
            issueNewCard: {
                whoNeedsCard: '[de] Who needs a card?',
                inviteNewMember: '[de] Invite new member',
                findMember: '[de] Find member',
                chooseCardType: '[de] Choose a card type',
                physicalCard: '[de] Physical card',
                physicalCardDescription: '[de] Great for the frequent spender',
                virtualCard: '[de] Virtual card',
                virtualCardDescription: '[de] Instant and flexible',
                chooseLimitType: '[de] Choose a limit type',
                smartLimit: '[de] Smart Limit',
                smartLimitDescription: '[de] Spend up to a certain amount before requiring approval',
                monthly: '[de] Monthly',
                monthlyDescription: '[de] Limit renews monthly',
                fixedAmount: '[de] Fixed amount',
                fixedAmountDescription: '[de] Spend until the limit is reached',
                setLimit: '[de] Set a limit',
                cardLimitError: '[de] Please enter an amount less than $21,474,836',
                giveItName: '[de] Give it a name',
                giveItNameInstruction: '[de] Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: '[de] Card name',
                letsDoubleCheck: '[de] Let’s double check that everything looks right.',
                willBeReadyToUse: '[de] This card will be ready to use immediately.',
                willBeReadyToShip: '[de] This card will be ready to ship immediately.',
                cardholder: '[de] Cardholder',
                cardType: '[de] Card type',
                limit: '[de] Limit',
                limitType: '[de] Limit type',
                disabledApprovalForSmartLimitError: '[de] Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
                singleUse: '[de] Single-use',
                singleUseDescription: '[de] Expires after one transaction',
                validFrom: '[de] Valid from',
                startDate: '[de] Start date',
                endDate: '[de] End date',
                noExpirationHint: "[de] A card without an expiration date won't expire",
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `[de] Valid from ${startDate} to ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `[de] ${startDate} to ${endDate}`,
                combineWithExpiration: '[de] Combine with expiration options for additional spend control',
                enterValidDate: '[de] Enter a valid date',
                expirationDate: '[de] Expiration date',
                limitAmount: '[de] Limit amount',
                setExpiryOptions: '[de] Set expiry options',
                setExpiryDate: '[de] Set expiry date',
                setExpiryDateDescription: '[de] Card will expire as listed on the card',
                amount: '[de] Amount',
            },
            deactivateCardModal: {
                deactivate: '[de] Deactivate',
                deactivateCard: '[de] Deactivate card',
                deactivateConfirmation: '[de] Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: '[de] settings',
            title: '[de] Connections',
            subtitle: '[de] Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: '[de] QuickBooks Online',
            qbd: '[de] QuickBooks Desktop',
            xero: '[de] Xero',
            netsuite: '[de] NetSuite',
            intacct: '[de] Sage Intacct',
            sap: '[de] SAP',
            oracle: '[de] Oracle',
            microsoftDynamics: '[de] Microsoft Dynamics',
            talkYourOnboardingSpecialist: '[de] Chat with your setup specialist.',
            talkYourAccountManager: '[de] Chat with your account manager.',
            talkToConcierge: '[de] Chat with Concierge.',
            needAnotherAccounting: '[de] Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '[de] QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '[de] Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '[de] NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '[de] Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `[de] There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '[de] Go to Expensify Classic to manage your settings.',
            setup: '[de] Connect',
            lastSync: (relativeDate: string) => `[de] Last synced ${relativeDate}`,
            notSync: '[de] Not synced',
            import: '[de] Import',
            export: '[de] Export',
            advanced: '[de] Advanced',
            other: '[de] Other',
            syncNow: '[de] Sync now',
            disconnect: '[de] Disconnect',
            reinstall: '[de] Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[de] integration';
                return `[de] Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `[de] Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[de] accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "[de] Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "[de] Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "[de] Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "[de] Can't connect to QuickBooks Desktop";
                    default: {
                        return "[de] Can't connect to integration";
                    }
                }
            },
            accounts: '[de] Chart of accounts',
            taxes: '[de] Taxes',
            imported: '[de] Imported',
            notImported: '[de] Not imported',
            importAsCategory: '[de] Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '[de] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '[de] Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '[de] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '[de] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '[de] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '[de] Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: '[de] NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[de] this integration';
                return `[de] Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `[de] Are you sure you want to connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[de] this accounting integration'}? This will remove any existing accounting connections.`,
            enterCredentials: '[de] Enter your credentials',
            claimOffer: {
                badgeText: '[de] Offer available!',
                xero: {
                    headline: '[de] Get Xero free for 6 months!',
                    description: '[de] <muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: '[de] Connect to Xero',
                },
                uber: {
                    headerTitle: '[de] Uber for Business',
                    headline: '[de] Get 5% off Uber rides',
                    description: `[de] <muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: '[de] Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '[de] Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '[de] Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '[de] Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '[de] Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return '[de] Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return '[de] Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '[de] Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '[de] Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return '[de] Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return '[de] Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return '[de] Importing Xero data';
                        case 'startingImportQBO':
                            return '[de] Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '[de] Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return '[de] Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '[de] Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return '[de] Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '[de] Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '[de] Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return '[de] Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '[de] Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '[de] Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '[de] Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '[de] Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '[de] Updating report fields';
                        case 'jobDone':
                            return '[de] Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return '[de] Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return '[de] Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return '[de] Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return '[de] Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '[de] Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return '[de] Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return '[de] Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return '[de] Syncing tax rates';
                        case 'xeroCheckConnection':
                            return '[de] Checking Xero connection';
                        case 'xeroSyncTitle':
                            return '[de] Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return '[de] Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '[de] Importing customers';
                        case 'netSuiteSyncInitData':
                            return '[de] Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return '[de] Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return '[de] Importing items';
                        case 'netSuiteSyncData':
                            return '[de] Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return '[de] Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return '[de] Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return '[de] Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return '[de] Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return '[de] Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '[de] Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '[de] Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '[de] Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return '[de] Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return '[de] Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return '[de] Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '[de] Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '[de] Importing vendors';
                        case 'intacctCheckConnection':
                            return '[de] Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return '[de] Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return '[de] Importing Sage Intacct data';
                        default: {
                            return `[de] Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '[de] Preferred exporter',
            exportPreferredExporterNote:
                '[de] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[de] Once set, the preferred exporter will see reports for export in their account.',
            exportAs: '[de] Export as',
            exportOutOfPocket: '[de] Export out-of-pocket expenses as',
            exportCompanyCard: '[de] Export company card expenses as',
            exportDate: '[de] Export date',
            defaultVendor: '[de] Default vendor',
            autoSync: '[de] Auto-sync',
            autoSyncDescription: '[de] Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: '[de] Sync reimbursed reports',
            cardReconciliation: '[de] Card reconciliation',
            reconciliationAccount: '[de] Reconciliation account',
            continuousReconciliation: '[de] Continuous Reconciliation',
            saveHoursOnReconciliation:
                '[de] Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `[de] <muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '[de] Choose the bank account that your Expensify Card payments will be reconciled against.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `[de] Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        export: {
            notReadyHeading: '[de] Not ready to export',
            notReadyDescription: '[de] Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: '[de] Send invoice',
            sendFrom: '[de] Send from',
            invoicingDetails: '[de] Invoicing details',
            invoicingDetailsDescription: '[de] This info will appear on your invoices.',
            companyName: '[de] Company name',
            companyWebsite: '[de] Company website',
            paymentMethods: {
                personal: '[de] Personal',
                business: '[de] Business',
                chooseInvoiceMethod: '[de] Choose a payment method below:',
                payingAsIndividual: '[de] Paying as an individual',
                payingAsBusiness: '[de] Paying as a business',
            },
            invoiceBalance: '[de] Invoice balance',
            invoiceBalanceSubtitle: "[de] This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: '[de] Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: '[de] Invite member',
            members: '[de] Invite members',
            invitePeople: '[de] Invite new members',
            genericFailureMessage: '[de] An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `[de] Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '[de] user',
            users: '[de] users',
            invited: '[de] invited',
            removed: '[de] removed',
            to: '[de] to',
            from: '[de] from',
        },
        inviteMessage: {
            confirmDetails: '[de] Confirm details',
            inviteMessagePrompt: '[de] Make your invitation extra special by adding a message below!',
            personalMessagePrompt: '[de] Message',
            genericFailureMessage: '[de] An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: '[de] Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `[de] ${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '[de] Oops! Not so fast...',
            workspaceNeeds: '[de] A workspace needs at least one enabled distance rate.',
            distance: '[de] Distance',
            centrallyManage: '[de] Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: '[de] Rate',
            addRate: '[de] Add rate',
            findRate: '[de] Find rate',
            trackTax: '[de] Track tax',
            deleteRates: () => ({
                one: '[de] Delete rate',
                other: '[de] Delete rates',
            }),
            enableRates: () => ({
                one: '[de] Enable rate',
                other: '[de] Enable rates',
            }),
            disableRates: () => ({
                one: '[de] Disable rate',
                other: '[de] Disable rates',
            }),
            enableRate: '[de] Enable rate',
            status: '[de] Status',
            unit: '[de] Unit',
            taxFeatureNotEnabledMessage:
                '[de] <muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: '[de] Delete distance rate',
            areYouSureDelete: () => ({
                one: '[de] Are you sure you want to delete this rate?',
                other: '[de] Are you sure you want to delete these rates?',
            }),
            errors: {
                rateNameRequired: '[de] Rate name is required',
                existingRateName: '[de] A distance rate with this name already exists',
            },
        },
        editor: {
            descriptionInputLabel: '[de] Description',
            nameInputLabel: '[de] Name',
            typeInputLabel: '[de] Type',
            initialValueInputLabel: '[de] Initial value',
            nameInputHelpText: "[de] This is the name you'll see on your workspace.",
            nameIsRequiredError: "[de] You'll need to give your workspace a name",
            currencyInputLabel: '[de] Default currency',
            currencyInputHelpText: '[de] All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `[de] The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: '[de] Save',
            genericFailureMessage: '[de] An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: '[de] An error occurred uploading the avatar. Please try again.',
            addressContext: '[de] A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: '[de] Expense policy',
        },
        bankAccount: {
            continueWithSetup: '[de] Continue setup',
            youAreAlmostDone: "[de] You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: '[de] Streamline payments',
            connectBankAccountNote: "[de] Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: '[de] One more thing!',
            allSet: "[de] You're all set!",
            accountDescriptionWithCards: '[de] This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "[de] Let's finish in chat!",
            finishInChat: '[de] Finish in chat',
            almostDone: '[de] Almost done!',
            disconnectBankAccount: '[de] Disconnect bank account',
            startOver: '[de] Start over',
            updateDetails: '[de] Update details',
            yesDisconnectMyBankAccount: '[de] Yes, disconnect my bank account',
            yesStartOver: '[de] Yes, start over',
            disconnectYourBankAccount: (bankName: string) =>
                `[de] Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "[de] Starting over will clear the progress you've made so far.",
            areYouSure: '[de] Are you sure?',
            workspaceCurrency: '[de] Workspace currency',
            updateCurrencyPrompt: '[de] It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: '[de] Update to USD',
            updateWorkspaceCurrency: '[de] Update workspace currency',
            workspaceCurrencyNotSupported: '[de] Workspace currency not supported',
            yourWorkspace: `[de] Your workspace is set to an unsupported currency. View the <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: '[de] Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: '[de] Transfer owner',
            addPaymentCardTitle: '[de] Enter your payment card to transfer ownership',
            addPaymentCardButtonText: '[de] Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `[de] <muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: '[de] PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: '[de] Bank level encryption',
            addPaymentCardRedundant: '[de] Redundant infrastructure',
            addPaymentCardLearnMore: `[de] <muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: '[de] Outstanding balance',
            amountOwedButtonText: '[de] OK',
            amountOwedText: '[de] This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: '[de] Outstanding balance',
            ownerOwesAmountButtonText: '[de] Transfer balance',
            ownerOwesAmountText: (email: string, amount: string) => `[de] The account owning this workspace (${email}) has an outstanding balance from a previous month.

Do you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: '[de] Take over annual subscription',
            subscriptionButtonText: '[de] Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `[de] Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: '[de] Duplicate subscription alert',
            duplicateSubscriptionButtonText: '[de] Continue',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `[de] It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.

Click "Continue" if you only want to take over billing for the workspace ${workspaceName}.

If you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '[de] Cannot transfer ownership',
            hasFailedSettlementsButtonText: '[de] Got it',
            hasFailedSettlementsText: (email: string) =>
                `[de] You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '[de] Failed to clear balance',
            failedToClearBalanceButtonText: '[de] OK',
            failedToClearBalanceText: '[de] We were unable to clear the balance. Please try again later.',
            successTitle: '[de] Woohoo! All set.',
            successDescription: "[de] You're now the owner of this workspace.",
            errorTitle: '[de] Oops! Not so fast...',
            errorDescription: `[de] <muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '[de] Careful!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `[de] The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Are you sure you want to export them again?`,
            confirmText: '[de] Yes, export again',
            cancelText: '[de] Cancel',
        },
        upgrade: {
            reportFields: {
                title: '[de] Report fields',
                description: `[de] Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: '[de] NetSuite',
                description: `[de] Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '[de] Sage Intacct',
                description: `[de] Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: '[de] QuickBooks Desktop',
                description: `[de] Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '[de] Advanced Approvals',
                description: `[de] If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            categories: {
                title: '[de] Categories',
                description: '[de] Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: '[de] GL codes',
                description: `[de] Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '[de] GL & Payroll codes',
                description: `[de] Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: '[de] Tax codes',
                description: `[de] Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: '[de] Unlimited Company cards',
                description: `[de] Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            rules: {
                title: '[de] Rules',
                description: `[de] Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.

Require expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: '[de] Per diem',
                description:
                    '[de] Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            travel: {
                title: '[de] Travel',
                description: '[de] Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            reports: {
                title: '[de] Reports',
                description: '[de] Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: '[de] Multi-level tags',
                description:
                    '[de] Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: '[de] Distance rates',
                description: '[de] Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: '[de] Auditor',
                description: '[de] Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '[de] Multiple approval levels',
                description: '[de] Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[de] <muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '[de] per active member per month.',
                perMember: '[de] per member per month.',
            },
            note: (subscriptionLink: string) => `[de] <muted-text>Upgrade to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: '[de] Unlock this feature',
            completed: {
                headline: `[de] You've upgraded your workspace!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `[de] <centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `[de] You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `[de] You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `[de] You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: '[de] Got it, thanks',
                createdWorkspace: `[de] You've created a workspace!`,
            },
            commonFeatures: {
                title: '[de] Upgrade to the Control plan',
                note: '[de] Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `[de] <muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[de] per member per month.` : `[de] per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: '[de] Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: '[de] Smart expense rules',
                    benefit3: '[de] Multi-level approval workflows',
                    benefit4: '[de] Enhanced security controls',
                    toUpgrade: '[de] To upgrade, click',
                    selectWorkspace: '[de] select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `[de] Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '[de] Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '[de] Downgrade to Collect',
                note: "[de] You'll lose access to the following features",
                noteAndMore: '[de] and more:',
                benefits: {
                    important: '[de] IMPORTANT: ',
                    confirm: '[de] You\'ll need to change the "Plan type" of every workspace to "Collect" in order to secure the Collect rate.',
                    benefit1Label: '[de] ERP integrations',
                    benefit1: '[de] NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: '[de] HR integrations',
                    benefit2: '[de] Workday, Certinia',
                    benefit3Label: '[de] Security',
                    benefit3: '[de] SSO/SAML',
                    benefit4Label: '[de] Advanced',
                    benefit4: '[de] Smart expense rules, per diems, multi-level approvals, custom reporting, and budgeting',
                    headsUp: '[de] Heads up!',
                    multiWorkspaceNote: '[de] You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '[de] > select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: '[de] Your workspace has been downgraded',
                description: '[de] You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: '[de] Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: '[de] Pay & downgrade',
            headline: '[de] Your final payment',
            description1: (formattedAmount: string) => `[de] Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `[de] See your breakdown below for ${date}:`,
            subscription:
                '[de] Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: '[de] An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: '[de] Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `[de] Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `[de] Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "[de] You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: '[de] Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: '[de] Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: '[de] Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: '[de] Chat with your admin',
            chatInAdmins: '[de] Chat in #admins',
            addPaymentCard: '[de] Add payment card',
            goToSubscription: '[de] Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: '[de] Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `[de] <muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: '[de] Receipt required amount',
                receiptRequiredAmountDescription: '[de] Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `[de] Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: '[de] Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: '[de] Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `[de] Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: '[de] Max expense amount',
                maxExpenseAmountDescription: '[de] Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: '[de] Max age',
                maxExpenseAge: '[de] Max expense age',
                maxExpenseAgeDescription: '[de] Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '[de] 1 day',
                    other: (count: number) => `[de] ${count} days`,
                }),
                cashExpenseDefault: '[de] Cash expense default',
                cashExpenseDefaultDescription:
                    '[de] Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: '[de] Reimbursable',
                reimbursableDefaultDescription: '[de] Expenses are most often paid back to employees',
                nonReimbursableDefault: '[de] Non-reimbursable',
                nonReimbursableDefaultDescription: '[de] Expenses are occasionally paid back to employees',
                alwaysReimbursable: '[de] Always reimbursable',
                alwaysReimbursableDescription: '[de] Expenses are always paid back to employees',
                alwaysNonReimbursable: '[de] Always non-reimbursable',
                alwaysNonReimbursableDescription: '[de] Expenses are never paid back to employees',
                billableDefault: '[de] Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `[de] <muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: '[de] Billable',
                billableDescription: '[de] Expenses are most often re-billed to clients',
                nonBillable: '[de] Non-billable',
                nonBillableDescription: '[de] Expenses are occasionally re-billed to clients',
                eReceipts: '[de] eReceipts',
                eReceiptsHint: `[de] eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: '[de] Attendee tracking',
                attendeeTrackingHint: '[de] Track the per-person cost for every expense.',
                prohibitedDefaultDescription: '[de] Flag receipts with these line items for manual review.',
                prohibitedExpenses: '[de] Prohibited expenses',
                alcohol: '[de] Alcohol',
                hotelIncidentals: '[de] Hotel incidentals',
                gambling: '[de] Gambling',
                tobacco: '[de] Tobacco',
                adultEntertainment: '[de] Adult entertainment',
                requireCompanyCard: '[de] Require company cards for all purchases',
                requireCompanyCardDescription: '[de] Flag all cash spend, including mileage and per-diem expenses.',
                requireCompanyCardDisabledTooltip: '[de] Enable Company cards (under More features) to unlock.',
            },
            expenseReportRules: {
                title: '[de] Advanced',
                subtitle: '[de] Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: '[de] Prevent self-approvals',
                preventSelfApprovalsSubtitle: '[de] Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: '[de] Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: '[de] Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: '[de] Auto-approve reports with all expenses under',
                autoApproveReportsUnderDescription: '[de] Fully compliant expense reports where all expenses are under this amount will be automatically approved.',
                randomReportAuditTitle: '[de] Random report audit',
                randomReportAuditDescription: '[de] Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: '[de] Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: '[de] Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `[de] Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: '[de] Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: '[de] Auto-pay reports under',
                autoPayReportsUnderDescription: '[de] Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `[de] Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[de] Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: '[de] Merchant',
                subtitle: '[de] Set merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: '[de] Add merchant rule',
                findRule: '[de] Find merchant rule',
                addRuleTitle: '[de] Add rule',
                editRuleTitle: '[de] Edit rule',
                expensesWith: '[de] For expenses with:',
                expensesExactlyMatching: '[de] For expenses exactly matching:',
                applyUpdates: '[de] Apply these updates:',
                saveRule: '[de] Save rule',
                previewMatches: '[de] Preview matches',
                confirmError: '[de] Enter merchant and apply at least one update',
                confirmErrorMerchant: '[de] Please enter merchant',
                confirmErrorUpdate: '[de] Please apply at least one update',
                previewMatchesEmptyStateTitle: '[de] Nothing to show',
                previewMatchesEmptyStateSubtitle: '[de] No unsubmitted expenses match this rule.',
                deleteRule: '[de] Delete rule',
                deleteRuleConfirmation: '[de] Are you sure you want to delete this rule?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `[de] If merchant ${isExactMatch ? '[de] exactly matches' : '[de] contains'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `[de] Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `[de] Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `[de] Mark as  "${reimbursable ? '[de] reimbursable' : '[de] non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `[de] Mark as "${billable ? '[de] billable' : '[de] non-billable'}"`,
                matchType: '[de] Match type',
                matchTypeContains: '[de] Contains',
                matchTypeExact: '[de] Exactly matches',
                duplicateRuleTitle: '[de] Similar merchant rule already exists',
                duplicateRulePrompt: (merchantName: string) => `[de] Your existing rule for "${merchantName}" will take priority over this one. Save anyway?`,
                saveAnyway: '[de] Save anyway',
                applyToExistingUnsubmittedExpenses: '[de] Apply to existing unsubmitted expenses',
            },
            categoryRules: {
                title: '[de] Category rules',
                approver: '[de] Approver',
                requireDescription: '[de] Require description',
                requireFields: '[de] Require fields',
                requiredFieldsTitle: '[de] Required fields',
                requiredFieldsDescription: (categoryName: string) => `[de] This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: '[de] Require attendees',
                descriptionHint: '[de] Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `[de] Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: '[de] Hint',
                descriptionHintSubtitle: '[de] Pro-tip: The shorter the better!',
                maxAmount: '[de] Max amount',
                flagAmountsOver: '[de] Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `[de] Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: '[de] This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: '[de] Individual expense',
                    expenseSubtitle: '[de] Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: '[de] Category total',
                    dailySubtitle: '[de] Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: '[de] Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `[de] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[de] Never require receipts',
                    always: '[de] Always require receipts',
                },
                requireItemizedReceiptsOver: '[de] Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `[de] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[de] Never require itemized receipts',
                    always: '[de] Always require itemized receipts',
                },
                defaultTaxRate: '[de] Default tax rate',
                enableWorkflows: (moreFeaturesLink: string) => `[de] Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: '[de] Expense policy',
                cardSubtitle: "[de] Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
            },
            spendRules: {
                title: '[de] Spend',
                subtitle: '[de] Approve or decline Expensify Card transactions in realtime.',
                defaultRuleDescription: '[de] All cards',
                block: '[de] Block',
                defaultRuleTitle: '[de] Categories: Adult services, ATMs, gambling, money transfers',
                builtInProtectionModal: {
                    title: '[de] Expensify Cards offer built-in protection - always',
                    description: `[de] Expensify always declines these charges:

  • Adult services
  • ATMs
  • Gambling
  • Money transfers

Add more spend rules to protect company cash flow.`,
                },
                addSpendRule: '[de] Add spend rule',
                editRuleTitle: '[de] Edit rule',
                cardPageTitle: '[de] Card',
                cardsSectionTitle: '[de] Cards',
                chooseCards: '[de] Choose cards',
                saveRule: '[de] Save rule',
                deleteRule: '[de] Delete rule',
                deleteRuleConfirmation: '[de] Are you sure you want to delete this rule?',
                allow: '[de] Allow',
                spendRuleSectionTitle: '[de] Spend rule',
                restrictionType: '[de] Restriction type',
                restrictionTypeHelpAllow: "[de] Charges are approved if they match any merchant or category, and don't exceed a max amount.",
                restrictionTypeHelpBlock: '[de] Charges are declined if they match any merchant or category, or exceed a max amount.',
                addMerchant: '[de] Add merchant',
                merchantContains: '[de] Merchant contains',
                merchantExactlyMatches: '[de] Merchant exactly matches',
                noBlockedMerchants: '[de] No blocked merchants',
                addMerchantToBlockSpend: '[de] Add a merchant to block spend',
                noAllowedMerchants: '[de] No allowed merchants',
                addMerchantToAllowSpend: '[de] Add a merchant to allow spend',
                matchType: '[de] Match type',
                matchTypeContains: '[de] Contains',
                matchTypeExact: '[de] Matches exactly',
                spendCategory: '[de] Spend category',
                maxAmount: '[de] Max amount',
                maxAmountHelp: '[de] Any charge over this amount will be declined, regardless of merchant and spend category restrictions.',
                currencyMismatchTitle: '[de] Currency mismatch',
                currencyMismatchPrompt: '[de] To set a max amount, select cards that settle in the same currency.',
                reviewSelectedCards: '[de] Review selected cards',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => `[de] ${summary}, +${count} more`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '[de] Apply at least one spend rule to one card',
                confirmErrorCardRequired: '[de] Card is a required field',
                confirmErrorApplyAtLeastOneSpendRule: '[de] Apply at least one spend rule',
                categories: '[de] Categories',
                merchants: '[de] Merchants',
                noAvailableCards: '[de] All cards already have a rule',
                noAvailableCardsSubtitle: '[de] Edit an existing card rule to make changes',
                noCardsIssuedTitle: '[de] No Expensify cards issued',
                noCardsIssuedSubtitle: '[de] Issue Expensify cards to create spend rules',
                max: '[de] Max',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '[de] Airlines',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '[de] Alcohol and bars',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: '[de] Amazon and bookstores',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '[de] Automotive',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: '[de] Car rentals',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '[de] Dining',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '[de] Fuel and gas',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '[de] Government and non-profits',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '[de] Groceries',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: '[de] Gyms and fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '[de] Healthcare',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: '[de] Hotels',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: '[de] Internet and phone',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '[de] Office supplies',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '[de] Parking and tolls',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: '[de] Professional services',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '[de] Retail',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '[de] Shipping and delivery',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: '[de] Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '[de] Transit and rideshare',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '[de] Travel agencies',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '[de] Collect',
                    description: '[de] For teams looking to automate their processes.',
                },
                corporate: {
                    label: '[de] Control',
                    description: '[de] For organizations with advanced requirements.',
                },
            },
            description: "[de] Choose a plan that's right for you. For a detailed list of features and pricing, check out our",
            subscriptionLink: '[de] plan types and pricing help page',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `[de] You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `[de] You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: '[de] Subscriptions',
        },
    },
    getAssistancePage: {
        title: '[de] Get assistance',
        subtitle: "[de] We're here to clear your path to greatness!",
        description: '[de] Choose from the support options below:',
        chatWithConcierge: '[de] Chat with Concierge',
        scheduleSetupCall: '[de] Schedule a setup call',
        scheduleACall: '[de] Schedule call',
        questionMarkButtonTooltip: '[de] Get assistance from our team',
        exploreHelpDocs: '[de] Explore help docs',
        registerForWebinar: '[de] Register for webinar',
        onboardingHelp: '[de] Onboarding help',
    },
    emojiPicker: {
        emojiNotSelected: '[de] Emoji not selected',
        skinTonePickerLabel: '[de] Change default skin tone',
        headers: {
            frequentlyUsed: '[de] Frequently Used',
            smileysAndEmotion: '[de] Smileys & Emotion',
            peopleAndBody: '[de] People & Body',
            animalsAndNature: '[de] Animals & Nature',
            foodAndDrink: '[de] Food & Drinks',
            travelAndPlaces: '[de] Travel & Places',
            activities: '[de] Activities',
            objects: '[de] Objects',
            symbols: '[de] Symbols',
            flags: '[de] Flags',
        },
    },
    newRoomPage: {
        newRoom: '[de] New room',
        groupName: '[de] Group name',
        roomName: '[de] Room name',
        visibility: '[de] Visibility',
        restrictedDescription: '[de] People in your workspace can find this room',
        privateDescription: '[de] People invited to this room can find it',
        publicDescription: '[de] Anyone can find this room',
        public_announceDescription: '[de] Anyone can find this room',
        createRoom: '[de] Create room',
        roomAlreadyExistsError: '[de] A room with this name already exists',
        roomNameReservedError: (reservedName: string) => `[de] ${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '[de] Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: '[de] Please enter a room name',
        pleaseSelectWorkspace: '[de] Please select a workspace',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `[de] ${actor}renamed to "${newName}" (previously "${oldName}")` : `[de] ${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: (newName: string) => `[de] Room renamed to ${newName}`,
        social: '[de] social',
        selectAWorkspace: '[de] Select a workspace',
        growlMessageOnRenameError: '[de] Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: '[de] Workspace',
            private: '[de] Private',
            public: '[de] Public',
            public_announce: '[de] Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '[de] Submit and Close',
        submitAndApprove: '[de] Submit and Approve',
        advanced: '[de] ADVANCED',
        dynamicExternal: '[de] DYNAMIC_EXTERNAL',
        smartReport: '[de] SMARTREPORT',
        billcom: '[de] BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[de] set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[de] removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `[de] changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `[de] changed the company address to "${newAddress}" (previously "${previousAddress}")` : `[de] set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[de] added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[de] removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `[de] changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `[de] added the category "${categoryName}"`,
        deleteCategory: (categoryName: string) => `[de] removed the category "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `[de] ${oldValue ? '[de] disabled' : '[de] enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[de] added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[de] removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[de] changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[de] added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[de] removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[de] changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `[de] changed the "${categoryName}" category description to ${!oldValue ? '[de] required' : '[de] not required'} (previously ${!oldValue ? '[de] not required' : '[de] required'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `[de] added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `[de] removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `[de] changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[de] added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `[de] changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[de] updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `[de] changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `[de] updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `[de] changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `[de] renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `[de] removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }
            return !oldValue
                ? `[de] added the description hint "${newValue}" to the category "${categoryName}"`
                : `[de] changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategories: (count: number) => `[de] updated ${count} categories`,
        updateTagListName: (oldName: string, newName: string) => `[de] changed the tag list name to "${newName}" (previously "${oldName}")`,
        updateTagList: (tagListName: string) => `[de] updated tags on the list "${tagListName}"`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `[de] changed tag list "${tagListsName}" to ${isRequired ? '[de] required' : '[de] not required'}`,
        importTags: '[de] imported tags from a spreadsheet',
        deletedAllTags: '[de] deleted all tags',
        addTag: (tagListName: string, tagName?: string) => `[de] added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `[de] updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `[de] ${enabled ? '[de] enabled' : '[de] disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `[de] removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `[de] removed "${count}" tags from the list "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `[de] updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `[de] updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `[de] changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `[de] ${newValue ? '[de] enabled' : '[de] disabled'} tax tracking on distance rates`,
        updateCustomUnitDefaultCategory: ({customUnitName, newValue, oldValue}: UpdatePolicyCustomUnitDefaultCategoryParams) =>
            `[de] changed the ${customUnitName} default category to "${newValue}" ${oldValue ? `[de] (previously "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `[de] imported rates for custom unit "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `[de] added a new ${customUnitName} rate "${rateName}"`,
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `[de] removed the "${customUnitName}" rate "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `[de] changed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${customUnitSubRateName}" ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `[de] removed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${removedSubRateName}"`,
        addedReportField: ({fieldType, fieldName, defaultValue}: AddedOrDeletedPolicyReportFieldParams) =>
            `[de] added ${fieldType} report field "${fieldName}"${defaultValue ? `[de]  with default value "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `[de] changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `[de] changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `[de] added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `[de] changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `[de] added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `[de] ${newValue ? '[de] enabled' : '[de] disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `[de] set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `[de] added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `[de] removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `[de] ${optionEnabled ? '[de] enabled' : '[de] disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `[de] ${allEnabled ? '[de] enabled' : '[de] disabled'} all options for the report field "${fieldName}" `;
            }
            return `[de] ${allEnabled ? '[de] enabled' : '[de] disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? '[de] enabled' : '[de] disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `[de] removed ${fieldType} Report Field "${fieldName}"`,
        addedCardFeed: (feedName: string) => `[de] added card feed "${feedName}"`,
        removedCardFeed: (feedName: string) => `[de] removed card feed "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `[de] renamed card feed to "${newName}" (previously "${oldName}")`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) => `[de] assigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[de] unassigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `[de] ${enabled ? '[de] enabled' : '[de] disabled'} cardholders to delete card transactions for card feed "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `[de] changed card feed "${feedName}" statement period end day${newValue ? `[de]  to "${newValue}"` : ''}${previousValue ? `[de]  (previously "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `[de] updated "Prevent self-approval" to "${newValue === 'true' ? '[de] Enabled' : '[de] Disabled'}" (previously "${oldValue === 'true' ? '[de] Enabled' : '[de] Disabled'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `[de] set the monthly report submission date to "${newValue}"`;
            }
            return `[de] updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `[de] updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `[de] updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `[de] turned "Enforce default report titles" ${value ? '[de] on' : '[de] off'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `[de] changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `[de] updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `[de] set the description of this workspace to "${newDescription}"`
                : `[de] updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('[de]  and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `[de] removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `[de] removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `[de] updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `[de] updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `[de] updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `[de] updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: '[de] upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `[de] This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: '[de] downgraded this workspace to the Collect plan',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `[de] changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `[de] changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        addBudget: ({frequency, entityName, entityType, shared, individual, notificationThreshold}: AddBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[de]  with notification threshold of "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `[de] added ${frequency} individual budget of "${individual}" and ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            if (typeof individual !== 'undefined') {
                return `[de] added ${frequency} individual budget of "${individual}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            return `[de] added ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
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
                changesList.push(`[de] changed budget frequency to "${newFrequency}" (previously "${oldFrequency}")`);
            }
            if (sharedChanged) {
                changesList.push(`[de] changed total workspace budget to "${newShared}" (previously "${oldShared}")`);
            }
            if (individualChanged) {
                changesList.push(`[de] changed individual budget to "${newIndividual}" (previously "${oldIndividual}")`);
            }
            if (thresholdChanged) {
                changesList.push(`[de] changed notification threshold to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `[de] updated budget for the ${entityType} "${entityName}"`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `[de] changed budget frequency for the ${entityType} "${entityName}" to "${newFrequency}" (previously "${oldFrequency}")`;
                }
                if (sharedChanged) {
                    return `[de] changed total workspace budget for the ${entityType} "${entityName}" to "${newShared}" (previously "${oldShared}")`;
                }
                if (individualChanged) {
                    return `[de] changed individual budget for the ${entityType} "${entityName}" to "${newIndividual}" (previously "${oldIndividual}")`;
                }
                return `[de] changed notification threshold for the ${entityType} "${entityName}" to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`;
            }
            return `[de] updated budget for the ${entityType} "${entityName}": ${changesList.join('; ')}`;
        },
        deleteBudget: ({entityType, entityName, frequency, individual, shared, notificationThreshold}: DeleteBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[de]  with notification threshold of "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `[de] removed ${frequency} shared budget of "${shared}" and individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (shared) {
                return `[de] removed ${frequency} shared budget of "${shared}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `[de] removed ${frequency} individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            return `[de] removed budget from the ${entityType} "${entityName}"`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} time tracking`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `[de] changed hourly rate to "${newRate}" (previously "${oldRate}")`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[de] added "${prohibitedExpense}" to prohibited expenses`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[de] removed "${prohibitedExpense}" from prohibited expenses`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `[de] changed reimbursement method to "${newReimbursementChoice}" (previously "${oldReimbursementChoice}")`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `[de] ${enabled ? '[de] enabled' : '[de] disabled'} pre-approval of workspace join requests`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `[de] changed custom report name formula to "${newDefaultTitle}" (previously "${oldDefaultTitle}")`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `[de] took over ownership of ${policyName} from ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `[de] ${enabled ? '[de] enabled' : '[de] disabled'} scheduled submit`,
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
            `[de] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". ${userEmail} is currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}.${summaryLink ? `[de]  <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
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
            `[de] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". You're currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}. ${summaryLink ? `[de] <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} categories`;
                case 'tags':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} tags`;
                case 'workflows':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} workflows`;
                case 'distance rates':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} distance rates`;
                case 'accounting':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} accounting`;
                case 'Expensify Cards':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} Expensify Cards`;
                case 'travel invoicing':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} travel invoicing`;
                case 'company cards':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} company cards`;
                case 'invoicing':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} invoicing`;
                case 'per diem':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} per diem`;
                case 'receipt partners':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} receipt partners`;
                case 'rules':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} rules`;
                case 'tax tracking':
                    return `[de] ${enabled ? '[de] enabled' : '[de] disabled'} tax tracking`;
                default:
                    return `${enabled ? '[de] enabled' : '[de] disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `[de] ${enabled ? '[de] enabled' : '[de] disabled'} attendee tracking`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `[de] ${enabled ? '[de] enabled' : '[de] disabled'} auto-pay approved reports`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `[de] set the auto-pay approved reports threshold to "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `[de] changed the auto-pay approved reports threshold to "${newLimit}" (previously "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: '[de] removed the auto-pay approved reports threshold',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `[de] changed the default approver to ${newApprover} (previously ${previousApprover})` : `[de] changed the default approver to ${newApprover}`,
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
            let text = `[de] changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `[de]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[de]  (previously default approver)';
            } else if (previousApprover) {
                text += `[de]  (previously ${previousApprover})`;
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
                ? `[de] changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `[de] changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += `[de]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[de]  (previously default approver)';
            } else if (previousApprover) {
                text += `[de]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[de] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `[de] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[de] changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `[de] changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[de] changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `[de] set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[de] changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `[de] set the invoice company website to "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser ? `[de] changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")` : `[de] changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: (enabled: boolean) => `[de] ${enabled ? '[de] enabled' : '[de] disabled'} reimbursements`,
        updateCustomTaxName: ({oldName, newName}: UpdatedPolicyCustomTaxNameParams) => `[de] changed the custom tax name to "${newName}" (previously "${oldName}")`,
        updateCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyCurrencyDefaultTaxParams) =>
            `[de] changed the workspace currency default tax rate to "${newName}" (previously "${oldName}")`,
        updateForeignCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyForeignCurrencyDefaultTaxParams) =>
            `[de] changed the foreign currency default tax rate to "${newName}" (previously "${oldName}")`,
        addTax: (taxName: string) => `[de] added the tax "${taxName}"`,
        deleteTax: (taxName: string) => `[de] removed the tax "${taxName}"`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `[de] renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `[de] changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `[de] changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `[de] ${oldValue ? '[de] disabled' : '[de] enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `[de] set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[de] changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: (oldValue: string) => `[de] removed receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `[de] set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `[de] changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: (oldValue: string) => `[de] removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: (newValue: string) => `[de] set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `[de] changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `[de] removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: '[de] Member not found.',
        useInviteButton: '[de] To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `[de] You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `[de] It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `[de] Are you sure you want to remove ${memberName} from the room?`,
            other: '[de] Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: '[de] There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: '[de] Assign task',
        assignMe: '[de] Assign to me',
        confirmTask: '[de] Confirm task',
        confirmError: '[de] Please enter a title and select a share destination',
        descriptionOptional: '[de] Description (optional)',
        pleaseEnterTaskName: '[de] Please enter a title',
        pleaseEnterTaskDestination: '[de] Please select where you want to share this task',
    },
    task: {
        task: '[de] Task',
        title: '[de] Title',
        description: '[de] Description',
        assignee: '[de] Assignee',
        completed: '[de] Completed',
        action: '[de] Complete',
        messages: {
            created: (title: string) => `[de] task for ${title}`,
            completed: '[de] marked as complete',
            canceled: '[de] deleted task',
            reopened: '[de] marked as incomplete',
            error: "[de] You don't have permission to take the requested action",
        },
        markAsComplete: '[de] Mark as complete',
        markAsIncomplete: '[de] Mark as incomplete',
        assigneeError: '[de] An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: '[de] There was an error creating this task. Please try again later.',
        deleteTask: '[de] Delete task',
        deleteConfirmation: '[de] Are you sure you want to delete this task?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `[de] ${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '[de] Keyboard shortcuts',
        subtitle: '[de] Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: '[de] Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: '[de] Mark all messages as read',
            escape: '[de] Escape dialogs',
            search: '[de] Open search dialog',
            newChat: '[de] New chat screen',
            copy: '[de] Copy comment',
            openDebug: '[de] Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: '[de] Screen share',
        screenShareRequest: '[de] Expensify is inviting you to a screen share',
    },
    search: {
        resultsAreLimited: '[de] Search results are limited.',
        viewResults: '[de] View results',
        appliedFilters: '[de] Applied filters',
        resetFilters: '[de] Reset filters',
        searchResults: {
            emptyResults: {
                title: '[de] Nothing to show',
                subtitle: `[de] Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "[de] You haven't created any expenses yet",
                subtitle: '[de] Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[de] Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "[de] You haven't created any reports yet",
                subtitle: '[de] Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[de] Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    [de] You haven't created any
                    invoices yet
                `),
                subtitle: '[de] Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[de] Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: '[de] No trips to display',
                subtitle: '[de] Get started by booking your first trip below.',
                buttonText: '[de] Book a trip',
            },
            emptySubmitResults: {
                title: '[de] No expenses to submit',
                subtitle: "[de] You're all clear. Take a victory lap!",
                buttonText: '[de] Create report',
            },
            emptyApproveResults: {
                title: '[de] No expenses to approve',
                subtitle: '[de] Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: '[de] No expenses to pay',
                subtitle: '[de] Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: '[de] No expenses to export',
                subtitle: '[de] Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: '[de] No expenses to display',
                subtitle: '[de] No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: '[de] No expenses to approve',
                subtitle: '[de] Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: '[de] Columns',
        editColumns: '[de] Edit columns',
        resetColumns: '[de] Reset columns',
        groupColumns: '[de] Group columns',
        expenseColumns: '[de] Expense Columns',
        statements: '[de] Statements',
        cardStatements: '[de] Card statements',
        monthlyAccrual: '[de] Monthly accrual',
        unapprovedCash: '[de] Unapproved cash',
        unapprovedCard: '[de] Unapproved card',
        reconciliation: '[de] Reconciliation',
        topSpenders: '[de] Top spenders',
        saveSearch: '[de] Save search',
        deleteSavedSearch: '[de] Delete saved search',
        deleteSavedSearchConfirm: '[de] Are you sure you want to delete this search?',
        searchName: '[de] Search name',
        savedSearchesMenuItemTitle: '[de] Saved',
        topCategories: '[de] Top categories',
        topMerchants: '[de] Top merchants',
        spendOverTime: '[de] Spend over time',
        groupedExpenses: '[de] grouped expenses',
        bulkActions: {
            editMultiple: '[de] Edit multiple',
            editMultipleTitle: '[de] Edit multiple expenses',
            editMultipleDescription: "[de] Changes will be set for all selected expenses and will override any previously set values. Just sayin'.",
            approve: '[de] Approve',
            pay: '[de] Pay',
            delete: '[de] Delete',
            hold: '[de] Hold',
            unhold: '[de] Remove hold',
            reject: '[de] Reject',
            duplicateExpense: ({count}: {count: number}) => `[de] Duplicate ${count === 1 ? '[de] expense' : '[de] expenses'}`,
            undelete: '[de] Undelete',
            noOptionsAvailable: '[de] No options available for the selected group of expenses.',
        },
        filtersHeader: '[de] Filters',
        filters: {
            date: {
                before: (date?: string) => `[de] Before ${date ?? ''}`,
                after: (date?: string) => `[de] After ${date ?? ''}`,
                on: (date?: string) => `[de] On ${date ?? ''}`,
                customDate: '[de] Custom date',
                customRange: '[de] Custom range',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '[de] Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '[de] Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '[de] This month',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '[de] Year to date',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '[de] Last 12 months',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '[de] Last statement',
                },
            },
            status: '[de] Status',
            keyword: '[de] Keyword',
            keywords: '[de] Keywords',
            limit: '[de] Limit',
            limitDescription: '[de] Set a limit for the results of your search.',
            currency: '[de] Currency',
            completed: '[de] Completed',
            amount: {
                lessThan: (amount?: string) => `[de] Less than ${amount ?? ''}`,
                greaterThan: (amount?: string) => `[de] Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `[de] Between ${greaterThan} and ${lessThan}`,
                equalTo: (amount?: string) => `[de] Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: '[de] Expensify',
                individualCards: '[de] Individual cards',
                closedCards: '[de] Closed cards',
                cardFeeds: '[de] Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `[de] All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `[de] All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `[de] ${name} is ${value}`,
            current: '[de] Current',
            past: '[de] Past',
            submitted: '[de] Submitted',
            approved: '[de] Approved',
            paid: '[de] Paid',
            exported: '[de] Exported',
            posted: '[de] Posted',
            withdrawn: '[de] Withdrawn',
            billable: '[de] Billable',
            reimbursable: '[de] Reimbursable',
            purchaseCurrency: '[de] Purchase currency',
            sortOrder: {
                [CONST.SEARCH.SORT_ORDER.ASC]: '[de] Ascending',
                [CONST.SEARCH.SORT_ORDER.DESC]: '[de] Descending',
            },
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '[de] From',
                [CONST.SEARCH.GROUP_BY.CARD]: '[de] Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[de] Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '[de] Category',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '[de] Merchant',
                [CONST.SEARCH.GROUP_BY.TAG]: '[de] Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: '[de] Month',
                [CONST.SEARCH.GROUP_BY.WEEK]: '[de] Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: '[de] Year',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '[de] Quarter',
            },
            feed: '[de] Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: '[de] Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '[de] Reimbursement',
            },
            is: '[de] Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '[de] Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '[de] Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '[de] Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '[de] Export',
            },
        },
        display: {
            label: '[de] Display',
            sortBy: '[de] Sort by',
            sortOrder: '[de] Sort order',
            groupBy: '[de] Group by',
            limitResults: '[de] Limit results',
        },
        has: '[de] Has',
        view: {
            label: '[de] View',
            table: '[de] Table',
            bar: '[de] Bar',
            line: '[de] Line',
            pie: '[de] Pie',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '[de] From',
            [CONST.SEARCH.GROUP_BY.CARD]: '[de] Cards',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[de] Exports',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '[de] Categories',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '[de] Merchants',
            [CONST.SEARCH.GROUP_BY.TAG]: '[de] Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: '[de] Months',
            [CONST.SEARCH.GROUP_BY.WEEK]: '[de] Weeks',
            [CONST.SEARCH.GROUP_BY.YEAR]: '[de] Years',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '[de] Quarters',
        },
        moneyRequestReport: {
            emptyStateTitle: '[de] This report has no expenses.',
            accessPlaceHolder: '[de] Open for details',
        },
        noCategory: '[de] No category',
        noMerchant: '[de] No merchant',
        noTag: '[de] No tag',
        expenseType: '[de] Expense type',
        withdrawalType: '[de] Withdrawal type',
        recentSearches: '[de] Recent searches',
        recentChats: '[de] Recent chats',
        searchIn: '[de] Search in',
        searchPlaceholder: '[de] Search for something...',
        suggestions: '[de] Suggestions',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `[de] Suggestions available${query ? `[de]  for ${query}` : ''}. ${count} result.`,
            other: (resultCount: number) => `[de] Suggestions available${query ? `[de]  for ${query}` : ''}. ${resultCount} results.`,
        }),
        exportSearchResults: {
            title: '[de] Create export',
            description: "[de] Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: '[de] Exported to',
        exportAll: {
            selectAllMatchingItems: '[de] Select all matching items',
            allMatchingItemsSelected: '[de] All matching items selected',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: '[de] Please select dates for both From and To',
        },
    },
    genericErrorPage: {
        title: '[de] Uh-oh, something went wrong!',
        body: {
            helpTextMobile: '[de] Please close and reopen the app, or switch to',
            helpTextWeb: '[de] web.',
            helpTextConcierge: '[de] If the problem persists, reach out to',
        },
        refresh: '[de] Refresh',
    },
    fileDownload: {
        success: {
            title: '[de] Downloaded!',
            message: '[de] Attachment successfully downloaded!',
            qrMessage: '[de] Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: '[de] Attachment error',
            message: "[de] Attachment can't be downloaded",
        },
        permissionError: {
            title: '[de] Storage access',
            message: "[de] Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: '[de] Pending',
            cleared: '[de] Cleared',
            failed: '[de] Failed',
        },
        failedError: ({link}: {link: string}) => `[de] We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `[de] ${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '[de] Report layout',
        groupByLabel: '[de] Group by:',
        selectGroupByOption: '[de] Select how to group report expenses',
        uncategorized: '[de] Uncategorized',
        noTag: '[de] No tag',
        selectGroup: ({groupName}: {groupName: string}) => `[de] Select all expenses in ${groupName}`,
        groupBy: {
            category: '[de] Category',
            tag: '[de] Tag',
        },
    },
    report: {
        newReport: {
            createExpense: '[de] Create expense',
            createReport: '[de] Create report',
            chooseWorkspace: '[de] Choose a workspace for this report.',
            emptyReportConfirmationTitle: '[de] You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `[de] Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationPromptLink: '[de] Reports',
            emptyReportConfirmationDontShowAgain: "[de] Don't show me this again",
            genericWorkspaceName: '[de] this workspace',
        },
        genericCreateReportFailureMessage: '[de] Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: '[de] Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: '[de] Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: '[de] Unexpected error renaming the report. Please try again later.',
        noActivityYet: '[de] No activity yet',
        connectionSettings: '[de] Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `[de] changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `[de] set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `[de] changed the workspace${fromPolicyName ? `[de]  (previously ${fromPolicyName})` : ''}`;
                    }
                    return `[de] changed the workspace to ${toPolicyName}${fromPolicyName ? `[de]  (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `[de] changed type from ${oldType} to ${newType}`,
                exportedToCSV: `[de] exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `[de] exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `[de] exported to ${label} via`,
                    automaticActionTwo: '[de] accounting settings',
                    manual: (label: string) => `[de] marked this report as manually exported to ${label}.`,
                    automaticActionThree: '[de] and successfully created a record for',
                    reimburseableLink: '[de] out-of-pocket expenses',
                    nonReimbursableLink: '[de] company card expenses',
                    pending: (label: string) => `[de] started exporting this report to ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `[de] failed to export this report to ${label} ("${errorMessage}${linkText ? `[de]  <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `[de] added a receipt`,
                managerDetachReceipt: `[de] removed a receipt`,
                markedReimbursed: (amount: string, currency: string) => `[de] paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `[de] paid ${currency}${amount} via integration`,
                outdatedBankAccount: `[de] couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounceDefault: `[de] couldn't process the payment due to an incorrect routing/account number or closed account`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `[de] couldn't process the payment: ${returnReason}`,
                reimbursementACHCancelled: `[de] canceled the payment`,
                reimbursementAccountChanged: `[de] couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `[de] processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `[de] randomly selected for review`,
                selectedForRandomAuditMarkdown: `[de] [randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `[de] invited member ${to}`,
                unshare: ({to}: UnshareParams) => `[de] removed member ${to}`,
                stripePaid: (amount: string, currency: string) => `[de] paid ${currency}${amount}`,
                takeControl: `[de] took control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `[de] Open the Expensify mobile app to review your ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}transaction`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `[de] there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `[de] The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `[de] the Plaid connection to your business bank account is broken. Please <a href='${walletRoute}'>reconnect your bank account ${maskedAccountNumber}</a> so you can continue to use your Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `[de] ${email} joined via the workspace invite link` : `[de] added ${email} as ${role === 'member' ? '[de] a' : '[de] an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `[de] updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[de] removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[de] added "${newValue}" to ${email}’s custom field 1`
                        : `[de] changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[de] removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[de] added "${newValue}" to ${email}’s custom field 2`
                        : `[de] changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `[de] ${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `[de] removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `[de] removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `[de] connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '[de] left the chat',
                leftTheChatWithName: (nameOrEmail: string) => `[de] ${nameOrEmail ? `${nameOrEmail}: ` : ''}left the chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `[de] business bank account ${maskedBankAccountNumber} has been automatically locked due to an issue with either Reimbursement or Expensify Card settlement. Please fix the issue in your <a href="${linkURL}">workspace settings</a>.`,
            },
            error: {
                invalidCredentials: '[de] Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `[de] ${summary} for ${dayCount} ${dayCount === 1 ? '[de] day' : '[de] days'} until ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `[de] ${summary} from ${timePeriod} on ${date}`,
        startTimer: '[de] Start Timer',
        stopTimer: '[de] Stop Timer',
        scheduleOOO: '[de] Schedule OOO',
        scheduleOOOTitle: '[de] Schedule Out of Office',
        date: '[de] Date',
        time: '[de] Time (use 24-hour format)',
        durationAmount: '[de] Duration',
        durationUnit: '[de] Unit',
        reason: '[de] Reason',
        workingPercentage: '[de] Working percentage',
        dateRequired: '[de] Date is required.',
        invalidTimeFormat: '[de] Please enter a valid 24-hour time (e.g., 14:30).',
        enterANumber: '[de] Please enter a number.',
        hour: '[de] hours',
        day: '[de] days',
        week: '[de] weeks',
        month: '[de] months',
    },
    footer: {
        features: '[de] Features',
        expenseManagement: '[de] Expense Management',
        spendManagement: '[de] Spend Management',
        expenseReports: '[de] Expense Reports',
        companyCreditCard: '[de] Company Credit Card',
        receiptScanningApp: '[de] Receipt Scanning App',
        billPay: '[de] Bill Pay',
        invoicing: '[de] Invoicing',
        CPACard: '[de] CPA Card',
        payroll: '[de] Payroll',
        travel: '[de] Travel',
        resources: '[de] Resources',
        expensifyApproved: '[de] ExpensifyApproved!',
        pressKit: '[de] Press Kit',
        support: '[de] Support',
        expensifyHelp: '[de] ExpensifyHelp',
        terms: '[de] Terms of Service',
        privacy: '[de] Privacy',
        learnMore: '[de] Learn More',
        aboutExpensify: '[de] About Expensify',
        blog: '[de] Blog',
        jobs: '[de] Jobs',
        expensifyOrg: '[de] Expensify.org',
        investorRelations: '[de] Investor Relations',
        getStarted: '[de] Get Started',
        createAccount: '[de] Create A New Account',
        logIn: '[de] Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '[de] Navigate back to chats list',
        chatWelcomeMessage: '[de] Chat welcome message',
        navigatesToChat: '[de] Navigates to a chat',
        newMessageLineIndicator: '[de] New message line indicator',
        chatMessage: '[de] Chat message',
        lastChatMessagePreview: '[de] Last chat message preview',
        workspaceName: '[de] Workspace name',
        chatUserDisplayNames: '[de] Chat member display names',
        scrollToNewestMessages: '[de] Scroll to newest messages',
        preStyledText: '[de] Pre-styled text',
        viewAttachment: '[de] View attachment',
        contextMenuAvailable: '[de] Context menu available. Press Shift+F10 to open.',
        contextMenuAvailableMacOS: '[de] Context menu available. Press VO-Shift-M to open.',
        contextMenuAvailableNative: '[de] Context menu available. Double-tap and hold to open.',
        selectAllFeatures: '[de] Select all features',
        selectAllTransactions: '[de] Select all transactions',
        selectAllItems: '[de] Select all items',
    },
    parentReportAction: {
        deletedReport: '[de] Deleted report',
        deletedMessage: '[de] Deleted message',
        deletedExpense: '[de] Deleted expense',
        reversedTransaction: '[de] Reversed transaction',
        deletedTask: '[de] Deleted task',
        hiddenMessage: '[de] Hidden message',
    },
    threads: {
        thread: '[de] Thread',
        replies: '[de] Replies',
        reply: '[de] Reply',
        from: '[de] From',
        in: '[de] in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `[de] From ${reportName}${workspaceName ? `[de]  in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: '[de] QR code',
        copy: '[de] Copy URL',
        copied: '[de] Copied!',
    },
    moderation: {
        flagDescription: '[de] All flagged messages will be sent to a moderator for review.',
        chooseAReason: '[de] Choose a reason for flagging below:',
        spam: '[de] Spam',
        spamDescription: '[de] Unsolicited off-topic promotion',
        inconsiderate: '[de] Inconsiderate',
        inconsiderateDescription: '[de] Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: '[de] Intimidation',
        intimidationDescription: '[de] Aggressively pursuing an agenda over valid objections',
        bullying: '[de] Bullying',
        bullyingDescription: '[de] Targeting an individual to obtain obedience',
        harassment: '[de] Harassment',
        harassmentDescription: '[de] Racist, misogynistic, or other broadly discriminatory behavior',
        assault: '[de] Assault',
        assaultDescription: '[de] Specifically targeted emotional attack with the intention of harm',
        flaggedContent: '[de] This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: '[de] Hide message',
        revealMessage: '[de] Reveal message',
        levelOneResult: '[de] Sends anonymous warning and message is reported for review.',
        levelTwoResult: '[de] Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: '[de] Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '[de] Invite to submit expenses',
        inviteToChat: '[de] Invite to chat only',
        nothing: '[de] Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '[de] Accept',
        decline: '[de] Decline',
    },
    actionableMentionTrackExpense: {
        submit: '[de] Submit it to someone',
        categorize: '[de] Categorize it',
        share: '[de] Share it with my accountant',
        nothing: '[de] Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: '[de] Teachers Unite',
        joinExpensifyOrg:
            '[de] Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: '[de] I know a teacher',
        iAmATeacher: '[de] I am a teacher',
        personalKarma: {
            title: '[de] Enable Personal Karma',
            description: '[de] Donate $1 to Expensify.org for every $500 you spend each month',
            stopDonationsPrompt: '[de] Are you sure you want to stop donating to Expensify.org?',
        },
        getInTouch: '[de] Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: '[de] Intro to your school principal',
        schoolPrincipalVerifyExpense:
            '[de] Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: '[de] Principal first name',
        principalLastName: '[de] Principal last name',
        principalWorkEmail: '[de] Principal work email',
        updateYourEmail: '[de] Update your email address',
        updateEmail: '[de] Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `[de] Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: '[de] Enter a valid email or phone number',
            enterEmail: '[de] Enter an email',
            enterValidEmail: '[de] Enter a valid email',
            tryDifferentEmail: '[de] Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: '[de] Not activated',
        outOfPocket: '[de] Reimbursable',
        companySpend: '[de] Non-reimbursable',
        personalCard: '[de] Personal card',
        companyCard: '[de] Company card',
        expensifyCard: '[de] Expensify Card',
        centralInvoicing: '[de] Central invoicing',
    },
    distance: {
        addStop: '[de] Add stop',
        address: '[de] Address',
        waypointDescription: {
            start: '[de] Start',
            stop: '[de] Stop',
        },
        mapPending: {
            title: '[de] Map pending',
            subtitle: '[de] The map will be generated when you go back online',
            onlineSubtitle: '[de] One moment while we set up the map',
            errorTitle: '[de] Map error',
            errorSubtitle: '[de] There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: '[de] Please select a suggested address or use current location',
        },
        odometer: {
            startReading: '[de] Start reading',
            endReading: '[de] End reading',
            saveForLater: '[de] Save for later',
            totalDistance: '[de] Total distance',
            startTitle: '[de] Odometer start photo',
            endTitle: '[de] Odometer end photo',
            deleteOdometerPhoto: '[de] Delete odometer photo',
            deleteOdometerPhotoConfirmation: '[de] Are you sure you want to delete this odometer photo?',
            startMessageWeb: '[de] Add a photo of your odometer from the <strong>start</strong> of your trip. Drag a file here or choose one to upload.',
            endMessageWeb: '[de] Add a photo of your odometer from the <strong>end</strong> of your trip. Drag a file here or choose one to upload.',
            cameraAccessRequired: '[de] Camera access is required to take pictures.',
            snapPhotoStart: '[de] <muted-text-label>Snap a photo of your odometer at the <strong>start</strong> of your trip.</muted-text-label>',
            snapPhotoEnd: '[de] <muted-text-label>Snap a photo of your odometer at the <strong>end</strong> of your trip.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '[de] Failed to start location tracking.',
            failedToGetPermissions: '[de] Failed to get required location permissions.',
        },
        trackingDistance: '[de] Tracking distance...',
        stopped: '[de] Stopped',
        start: '[de] Start',
        stop: '[de] Stop',
        discard: '[de] Discard',
        stopGpsTrackingModal: {
            title: '[de] Stop GPS tracking',
            prompt: '[de] Are you sure? This will end your current journey.',
            cancel: '[de] Resume tracking',
            confirm: '[de] Stop GPS tracking',
        },
        discardDistanceTrackingModal: {
            title: '[de] Discard distance tracking',
            prompt: "[de] Are you sure? This will discard your current journey and can't be undone.",
            confirm: '[de] Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "[de] Can't create expense",
            prompt: "[de] You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: '[de] Location access required',
            prompt: '[de] Please allow location access in your device settings to start GPS distance tracking.',
            allow: '[de] Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: '[de] Background location access required',
            prompt: '[de] Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: '[de] Precise location required',
            prompt: '[de] Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: '[de] Track distance on your phone',
            subtitle: '[de] Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: '[de] Download the app',
        },
        notification: {
            title: '[de] GPS tracking in progress',
            body: '[de] Go to the app to finish',
        },
        continueGpsTripModal: {
            title: '[de] Continue GPS trip recording?',
            prompt: '[de] Looks like the app closed during your last GPS trip. Would you like to continue recording from that trip?',
            confirm: '[de] Continue trip',
            cancel: '[de] View trip',
        },
        signOutWarningTripInProgress: {
            title: '[de] GPS tracking in progress',
            prompt: '[de] Are you sure you want to discard the trip and sign out?',
            confirm: '[de] Discard and sign out',
        },
        switchToODWarningTripInProgress: {
            title: '[de] GPS tracking in progress',
            prompt: '[de] Are you sure you want to stop GPS tracking and switch to Expensify Classic?',
            confirm: '[de] Stop and switch',
        },
        switchAccountWarningTripInProgress: {
            title: '[de] GPS tracking in progress',
            prompt: '[de] Are you sure you want to stop GPS tracking and switch accounts?',
            confirm: '[de] Stop and switch',
        },
        locationServicesRequiredModal: {
            title: '[de] Location access required',
            confirm: '[de] Open settings',
            prompt: '[de] Please allow location access in your device settings to start GPS distance tracking.',
        },
        gpsFloatingPillText: '[de] GPS tracking in progress...',
        liveActivity: {
            subtitle: '[de] Tracking distance',
            button: '[de] View progress',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '[de] Report card lost or damaged',
        nextButtonLabel: '[de] Next',
        reasonTitle: '[de] Why do you need a new card?',
        cardDamaged: '[de] My card was damaged',
        cardLostOrStolen: '[de] My card was lost or stolen',
        confirmAddressTitle: '[de] Please confirm the mailing address for your new card.',
        cardDamagedInfo: '[de] Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: '[de] Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: '[de] Address',
        deactivateCardButton: '[de] Deactivate card',
        shipNewCardButton: '[de] Ship new card',
        addressError: '[de] Address is required',
        reasonError: '[de] Reason is required',
        successTitle: '[de] Your new card is on the way!',
        successDescription: "[de] You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: '[de] Guaranteed eReceipt',
        transactionDate: '[de] Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '[de] Start a chat, <success><strong>refer a friend</strong></success>.',
            header: '[de] Start a chat, refer a friend',
            closeAccessibilityLabel: '[de] Close, start a chat, refer a friend, banner',
            body: "[de] Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '[de] Submit an expense, <success><strong>refer your team</strong></success>.',
            header: '[de] Submit an expense, refer your team',
            closeAccessibilityLabel: '[de] Close, submit an expense, refer your team, banner',
            body: "[de] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '[de] Refer a friend',
            body: "[de] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '[de] Refer a friend',
            header: '[de] Refer a friend',
            body: "[de] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: '[de] Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `[de] Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `[de] Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: '[de] All tags required',
        autoReportedRejectedExpense: '[de] This expense was rejected.',
        billableExpense: '[de] Billable no longer valid',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `[de] Receipt required${formattedLimit ? `[de]  over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '[de] Category no longer valid',
        conversionSurcharge: (surcharge: number) => `[de] Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: '[de] Rate not valid for this workspace',
        duplicatedTransaction: '[de] Potential duplicate',
        fieldRequired: '[de] Report fields are required',
        futureDate: '[de] Future date not allowed',
        invoiceMarkup: (invoiceMarkup: number) => `[de] Marked up by ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `[de] Date older than ${maxAge} days`,
        missingCategory: '[de] Missing category',
        missingComment: '[de] Description required for selected category',
        missingAttendees: '[de] Multiple attendees required for this category',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `[de] Missing ${tagName ?? '[de] tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '[de] Amount differs from calculated distance';
                case 'card':
                    return '[de] Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `[de] Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return '[de] Amount greater than scanned receipt';
            }
        },
        modifiedDate: '[de] Date differs from scanned receipt',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `[de] Distance exceeds the calculated route of ${formattedRouteDistance}` : '[de] Distance exceeds the calculated route',
        nonExpensiworksExpense: '[de] Non-Expensiworks expense',
        overAutoApprovalLimit: (formattedLimit: string) => `[de] Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `[de] Amount over ${formattedLimit}/person category limit`,
        overLimit: (formattedLimit: string) => `[de] Amount over ${formattedLimit}/person limit`,
        overTripLimit: (formattedLimit: string) => `[de] Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: (formattedLimit: string) => `[de] Amount over ${formattedLimit}/person limit`,
        perDayLimit: (formattedLimit: string) => `[de] Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: '[de] Receipt and expense details added manually.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `[de] Receipt required over ${formattedLimit} category limit`;
            }
            if (formattedLimit) {
                return `[de] Receipt required over ${formattedLimit}`;
            }
            if (category) {
                return `[de] Receipt required over category limit`;
            }
            return '[de] Receipt required';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `[de] Itemized receipt required${formattedLimit ? `[de]  over ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '[de] Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `[de] alcohol`;
                    case 'gambling':
                        return `[de] gambling`;
                    case 'tobacco':
                        return `[de] tobacco`;
                    case 'adultEntertainment':
                        return `[de] adult entertainment`;
                    case 'hotelIncidentals':
                        return `[de] hotel incidentals`;
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
        reviewRequired: '[de] Review required',
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
                return "[de] Can't auto-match receipt due to broken bank connection.";
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return "[de] Can't auto-match receipt due to broken bank connection.";
                }
                return isMarkAsCash
                    ? `[de] Can't auto-match receipt due to broken card connection. Mark as cash to ignore, or <a href="${connectionLink}">fix the card</a> to match the receipt.`
                    : `[de] Can't auto-match receipt due to broken card connection. <a href="${connectionLink}">Fix the card</a> to match the receipt.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `[de] Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : '[de] Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `[de] Ask ${member} to mark as a cash or wait 7 days and try again` : '[de] Awaiting merge with card transaction.';
            }
            return '';
        },
        brokenConnection530Error: '[de] Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `[de] <muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: '[de] Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: '[de] Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true}) => `[de] Receipt scanning failed.${canEdit ? '[de]  Enter details manually.' : ''}`,
        receiptGeneratedWithAI: '[de] Potential AI-generated receipt',
        someTagLevelsRequired: (tagName?: string) => `[de] Missing ${tagName ?? '[de] Tag'}`,
        tagOutOfPolicy: (tagName?: string) => `[de] ${tagName ?? '[de] Tag'} no longer valid`,
        taxAmountChanged: '[de] Tax amount was modified',
        taxOutOfPolicy: (taxName?: string) => `[de] ${taxName ?? '[de] Tax'} no longer valid`,
        taxRateChanged: '[de] Tax rate was modified',
        taxRequired: '[de] Missing tax rate',
        none: '[de] None',
        taxCodeToKeep: '[de] Choose which tax code to keep',
        tagToKeep: '[de] Choose which tag to keep',
        isTransactionReimbursable: '[de] Choose if transaction is reimbursable',
        merchantToKeep: '[de] Choose which merchant to keep',
        descriptionToKeep: '[de] Choose which description to keep',
        categoryToKeep: '[de] Choose which category to keep',
        isTransactionBillable: '[de] Choose if transaction is billable',
        keepThisOne: '[de] Keep this one',
        confirmDetails: `[de] Confirm the details you're keeping`,
        confirmDuplicatesInfo: `[de] The duplicates you don't keep will be held for the submitter to delete.`,
        hold: '[de] This expense was put on hold',
        resolvedDuplicates: '[de] resolved the duplicate',
        companyCardRequired: '[de] Company card purchases required',
        noRoute: '[de] Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `[de] ${fieldName} is required`,
        reportContainsExpensesWithViolations: '[de] Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: '[de] marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: '[de] resolved the duplicate',
        },
    },
    videoPlayer: {
        play: '[de] Play',
        pause: '[de] Pause',
        fullscreen: '[de] Fullscreen',
        playbackSpeed: '[de] Playback speed',
        expand: '[de] Expand',
        mute: '[de] Mute',
        unmute: '[de] Unmute',
        normal: '[de] Normal',
    },
    exitSurvey: {
        header: '[de] Before you go',
        reasonPage: {
            title: "[de] Please tell us why you're leaving",
            subtitle: '[de] Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[de] I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "[de] I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[de] I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[de] What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '[de] What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[de] Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: '[de] Your response',
        thankYou: '[de] Thanks for the feedback!',
        thankYouSubtitle: '[de] Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: '[de] Switch to Expensify Classic',
        offlineTitle: "[de] Looks like you're stuck here...",
        offline:
            "[de] You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: '[de] Quick tip...',
        quickTipSubTitle: '[de] You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: '[de] Book a call',
        bookACallTitle: '[de] Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '[de] Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '[de] Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '[de] Travel and expense at the speed of chat',
        },
        bookACallTextTop: '[de] By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: '[de] We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: '[de] Take me to Expensify Classic',
    },
    listBoundary: {
        errorMessage: '[de] An error occurred while loading more messages',
        tryAgain: '[de] Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: '[de] matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: '[de] Authenticate payment card',
        mobileReducedFunctionalityMessage: '[de] You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `[de] Free trial: ${numOfDays} ${numOfDays === 1 ? '[de] day' : '[de] days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '[de] Your payment info is outdated',
                subtitle: (date: string) => `[de] Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '[de] Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `[de] Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : '[de] Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: '[de] Your payment info is outdated',
                subtitle: (date: string) => `[de] Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '[de] Your payment info is outdated',
                subtitle: '[de] Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: '[de] Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `[de] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: '[de] Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `[de] Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: '[de] Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `[de] Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: '[de] Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `[de] Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: '[de] Your card is expiring soon',
                subtitle: '[de] Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: '[de] Success!',
                subtitle: '[de] Your card has been billed successfully.',
            },
            retryBillingError: {
                title: '[de] Your card couldn’t be charged',
                subtitle: '[de] Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `[de] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '[de] Start a free trial',
                subtitle: '[de] As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: (numOfDays: number) => `[de] Trial: ${numOfDays} ${numOfDays === 1 ? '[de] day' : '[de] days'} left!`,
                subtitle: '[de] Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: '[de] Your free trial has ended',
                subtitle: '[de] Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: '[de] Claim offer',
                subscriptionPageTitle: (discountType: number) => `[de] <strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `[de] Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `[de] Claim within ${days > 0 ? `[de] ${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '[de] Payment',
            subtitle: '[de] Add a card to pay for your Expensify subscription.',
            addCardButton: '[de] Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `[de] Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `[de] Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `[de] Card ending in ${cardNumber}`,
            changeCard: '[de] Change payment card',
            changeCurrency: '[de] Change payment currency',
            cardNotFound: '[de] No payment card added',
            retryPaymentButton: '[de] Retry payment',
            authenticatePayment: '[de] Authenticate payment',
            requestRefund: '[de] Request refund',
            requestRefundModal: {
                full: '[de] Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: '[de] Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: '[de] View payment history',
        },
        yourPlan: {
            title: '[de] Your plan',
            exploreAllPlans: '[de] Explore all plans',
            customPricing: '[de] Custom pricing',
            asLowAs: (price: string) => `[de] as low as ${price} per active member/month`,
            pricePerMemberMonth: (price: string) => `[de] ${price} per member/month`,
            pricePerMemberPerMonth: (price: string) => `[de] ${price} per member per month`,
            perMemberMonth: '[de] per member/month',
            collect: {
                title: '[de] Collect',
                description: '[de] The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[de] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[de] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[de] Receipt scanning',
                benefit2: '[de] Reimbursements',
                benefit3: '[de] Corporate card management',
                benefit4: '[de] Expense and travel approvals',
                benefit5: '[de] Travel booking and rules',
                benefit6: '[de] QuickBooks/Xero integrations',
                benefit7: '[de] Chat on expenses, reports, and rooms',
                benefit8: '[de] AI and human support',
            },
            control: {
                title: '[de] Control',
                description: '[de] Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[de] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[de] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[de] Everything in the Collect plan',
                benefit2: '[de] Multi-level approval workflows',
                benefit3: '[de] Custom expense rules',
                benefit4: '[de] ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: '[de] HR integrations (Workday, Certinia)',
                benefit6: '[de] SAML/SSO',
                benefit7: '[de] Custom insights and reporting',
                benefit8: '[de] Budgeting',
            },
            thisIsYourCurrentPlan: '[de] This is your current plan',
            downgrade: '[de] Downgrade to Collect',
            upgrade: '[de] Upgrade to Control',
            addMembers: '[de] Add members',
            saveWithExpensifyTitle: '[de] Save with the Expensify Card',
            saveWithExpensifyDescription: '[de] Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: '[de] Learn more',
        },
        compareModal: {
            comparePlans: '[de] Compare Plans',
            subtitle: `[de] <muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: '[de] Subscription details',
            annual: '[de] Annual subscription',
            taxExempt: '[de] Request tax exempt status',
            taxExemptEnabled: '[de] Tax exempt',
            taxExemptStatus: '[de] Tax exempt status',
            payPerUse: '[de] Pay-per-use',
            subscriptionSize: '[de] Subscription size',
            headsUp:
                "[de] Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: '[de] Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: '[de] Subscription size',
            yourSize: '[de] Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                '[de] Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: '[de] Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: '[de] Confirm your new annual subscription details:',
            subscriptionSize: '[de] Subscription size',
            activeMembers: (size: number) => `[de] ${size} active members/month`,
            subscriptionRenews: '[de] Subscription renews',
            youCantDowngrade: '[de] You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: (size: number, date: string) =>
                `[de] You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: '[de] Please enter a valid subscription size',
                sameSize: '[de] Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: '[de] Add payment card',
            enterPaymentCardDetails: '[de] Enter your payment card details',
            security: '[de] Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: '[de] Learn more about our security.',
        },
        expensifyCode: {
            title: '[de] Expensify code',
            discountCode: '[de] Discount code',
            enterCode: '[de] Enter an Expensify code to apply to your subscription.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `[de] You will get a ${promoDiscount}% discount on your next ${validBillingCycles ? `${validBillingCycles} ` : ''}billing charges.`,
            apply: '[de] Apply',
            error: {
                invalid: '[de] This code is invalid',
            },
        },
        subscriptionSettings: {
            title: '[de] Subscription settings',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `[de] Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}${expensifyCode ? `[de] , Expensify code: ${expensifyCode}` : ''}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: '[de] none',
            on: '[de] on',
            off: '[de] off',
            annual: '[de] Annual',
            autoRenew: '[de] Auto-renew',
            autoIncrease: '[de] Auto-increase annual seats',
            saveUpTo: (amountWithCurrency: string) => `[de] Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                '[de] Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: '[de] Disable auto-renew',
            helpUsImprove: '[de] Help us improve Expensify',
            whatsMainReason: "[de] What's the main reason you're disabling auto-renew?",
            renewsOn: (date: string) => `[de] Renews on ${date}.`,
            pricingConfiguration: '[de] Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `[de] <muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `[de] <a href="adminsRoom">#admins room.</a>` : '[de] #admins room.'}</muted-text>`,
            estimatedPrice: '[de] Estimated price',
            changesBasedOn: '[de] This changes based on your Expensify Card usage and the subscription options below.',
            collectBillingDescription: '[de] Collect workspaces are billed monthly per member, with no annual commitment.',
            pricing: '[de] Pricing',
        },
        requestEarlyCancellation: {
            title: '[de] Request early cancellation',
            subtitle: '[de] What’s the main reason you’re requesting early cancellation?',
            subscriptionCanceled: {
                title: '[de] Subscription canceled',
                subtitle: '[de] Your annual subscription has been canceled.',
                info: '[de] If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `[de] If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: '[de] Request submitted',
                subtitle:
                    '[de] Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `[de] By requesting early cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: '[de] Functionality needs improvement',
        tooExpensive: '[de] Too expensive',
        inadequateSupport: '[de] Inadequate customer support',
        businessClosing: '[de] Company closing, downsizing, or acquired',
        additionalInfoTitle: '[de] What software are you moving to and why?',
        additionalInfoInputLabel: '[de] Your response',
    },
    roomChangeLog: {
        updateRoomDescription: '[de] set the room description to:',
        clearRoomDescription: '[de] cleared the room description',
        changedRoomAvatar: '[de] changed the room avatar',
        removedRoomAvatar: '[de] removed the room avatar',
    },
    delegate: {
        switchAccount: '[de] Switch accounts:',
        copilotDelegatedAccess: '[de] Copilot: Delegated access',
        copilotDelegatedAccessDescription: '[de] Allow other members to access your account.',
        learnMoreAboutDelegatedAccess: '[de] Learn more about delegated access',
        addCopilot: '[de] Add copilot',
        membersCanAccessYourAccount: '[de] These members can access your account:',
        youCanAccessTheseAccounts: '[de] You can access these accounts via the account switcher:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[de] Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[de] Limited';
                default:
                    return '';
            }
        },
        genericError: '[de] Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `[de] on behalf of ${delegator}`,
        accessLevel: '[de] Access level',
        confirmCopilot: '[de] Confirm your copilot below.',
        accessLevelDescription: '[de] Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[de] Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[de] Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: '[de] Remove copilot',
        removeCopilotConfirmation: '[de] Are you sure you want to remove this copilot?',
        changeAccessLevel: '[de] Change access level',
        makeSureItIsYou: "[de] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[de] Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `[de] Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '[de] Not so fast...',
        noAccessMessage: dedent(`
            [de] As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `[de] As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: '[de] Copilot access',
    },
    debug: {
        debug: '[de] Debug',
        details: '[de] Details',
        JSON: '[de] JSON',
        reportActions: '[de] Actions',
        reportActionPreview: '[de] Preview',
        nothingToPreview: '[de] Nothing to preview',
        editJson: '[de] Edit JSON:',
        preview: '[de] Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `[de] Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `[de] Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `[de] Invalid value - Expected: ${expectedValues}`,
        missingValue: '[de] Missing value',
        createReportAction: '[de] Create Report Action',
        reportAction: '[de] Report Action',
        report: '[de] Report',
        transaction: '[de] Transaction',
        violations: '[de] Violations',
        transactionViolation: '[de] Transaction Violation',
        hint: "[de] Data changes won't be sent to the backend",
        textFields: '[de] Text fields',
        numberFields: '[de] Number fields',
        booleanFields: '[de] Boolean fields',
        constantFields: '[de] Constant fields',
        dateTimeFields: '[de] DateTime fields',
        date: '[de] Date',
        time: '[de] Time',
        none: '[de] None',
        visibleInLHN: '[de] Visible in LHN',
        GBR: '[de] GBR',
        RBR: '[de] RBR',
        true: '[de] true',
        false: '[de] false',
        viewReport: '[de] View Report',
        viewTransaction: '[de] View transaction',
        createTransactionViolation: '[de] Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: '[de] Has draft comment',
            hasGBR: '[de] Has GBR',
            hasRBR: '[de] Has RBR',
            pinnedByUser: '[de] Pinned by member',
            hasIOUViolations: '[de] Has IOU violations',
            hasAddWorkspaceRoomErrors: '[de] Has add workspace room errors',
            isUnread: '[de] Is unread (focus mode)',
            isArchived: '[de] Is archived (most recent mode)',
            isSelfDM: '[de] Is self DM',
            isFocused: '[de] Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: '[de] Has join request (admin room)',
            isUnreadWithMention: '[de] Is unread with mention',
            isWaitingForAssigneeToCompleteAction: '[de] Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: '[de] Has child report awaiting action',
            hasMissingInvoiceBankAccount: '[de] Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: '[de] Has unresolved card fraud alert',
            hasDEWApproveFailed: '[de] Has DEW approve failed',
        },
        reasonRBR: {
            hasErrors: '[de] Has errors in report or report actions data',
            hasViolations: '[de] Has violations',
            hasTransactionThreadViolations: '[de] Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "[de] There's a report awaiting action",
            theresAReportWithErrors: "[de] There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "[de] There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "[de] There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: '[de] There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "[de] There's a problem with a contact method",
            aContactMethodRequiresVerification: '[de] A contact method requires verification',
            theresAProblemWithAPaymentMethod: "[de] There's a problem with a payment method",
            theresAProblemWithAWorkspace: "[de] There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "[de] There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "[de] There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: '[de] Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: '[de] There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "[de] There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "[de] There's a problem with your wallet terms",
            aBankAccountIsLocked: '[de] A bank account is locked',
        },
    },
    emptySearchView: {
        takeATestDrive: '[de] Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: '[de] Welcome to New Expensify!',
        subtitle: "[de] It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "[de] Let's go!",
        helpText: '[de] Try 2-min demo',
        features: {
            search: '[de] More powerful search on mobile, web, and desktop',
            concierge: '[de] Built-in Concierge AI to help automate your expenses',
            chat: '[de] Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '[de] <tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '[de] <tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '[de] <tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        scanTestTooltip: {
            main: '[de] <tooltip><strong>Scan our test receipt</strong> to see how it works!</tooltip>',
            manager: '[de] <tooltip>Choose our <strong>test manager</strong> to try it out!</tooltip>',
            confirmation: '[de] <tooltip>Now, <strong>submit your expense</strong> and watch the\nmagic happen!</tooltip>',
            tryItOut: '[de] Try it out',
        },
        outstandingFilter: '[de] <tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '[de] <tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "[de] <tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
        hasFilterNegation: '[de] <tooltip>Search for expenses without receipts using <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '[de] Discard changes?',
        body: '[de] Are you sure you want to discard the changes you made?',
        confirmText: '[de] Discard changes',
    },
    scheduledCall: {
        book: {
            title: '[de] Schedule call',
            description: '[de] Find a time that works for you.',
            slots: ({date}: {date: string}) => `[de] <muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '[de] Confirm call',
            description: "[de] Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: '[de] Your setup specialist',
            meetingLength: '[de] Meeting length',
            dateTime: '[de] Date & time',
            minutes: '[de] 30 minutes',
        },
        callScheduled: '[de] Call scheduled',
    },
    autoSubmitModal: {
        title: '[de] All clear and submitted!',
        description: '[de] All warnings and violations has been cleared so:',
        submittedExpensesTitle: '[de] These expenses have been submitted',
        submittedExpensesDescription: '[de] These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: '[de] Pending expenses have been moved',
        pendingExpensesDescription: '[de] Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '[de] Take a 2-minute test drive',
        },
        modal: {
            title: '[de] Take us for a test drive',
            description: '[de] Take a quick product tour to get up to speed fast.',
            confirmText: '[de] Start test drive',
            helpText: '[de] Skip',
            employee: {
                description: '[de] <muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "[de] Enter your boss's email",
                error: '[de] That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "[de] You're currently test driving Expensify",
            readyForTheRealThing: '[de] Ready for the real thing?',
            getStarted: '[de] Get started',
        },
        employeeInviteMessage: (name: string) => `[de] # ${name} invited you to test drive Expensify
Hey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.

Here’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: '[de] Basic export',
        reportLevelExport: '[de] All Data - report level',
        expenseLevelExport: '[de] All Data - expense level',
        exportInProgress: '[de] Export in progress',
        conciergeWillSend: '[de] Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: '[de] Not verified',
        retry: '[de] Retry',
        verifyDomain: {
            title: '[de] Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `[de] Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `[de] Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: '[de] Add the following TXT record:',
            saveChanges: '[de] Save changes and return here to verify your domain.',
            youMayNeedToConsult: `[de] You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: '[de] After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: '[de] Couldn’t fetch verification code',
            genericError: "[de] We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: '[de] Domain verified',
            header: '[de] Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `[de] <muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: '[de] SAML',
        samlFeatureList: {
            title: '[de] SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `[de] <muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: '[de] Faster and easier login',
            moreSecurityAndControl: '[de] More security and control',
            onePasswordForAnything: '[de] One password for everything',
        },
        goToDomain: '[de] Go to domain',
        samlLogin: {
            title: '[de] SAML login',
            subtitle: `[de] <muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a>.</muted-text>`,
            enableSamlLogin: '[de] Enable SAML login',
            allowMembers: '[de] Allow members to log in with SAML.',
            requireSamlLogin: '[de] Require SAML login',
            anyMemberWillBeRequired: '[de] Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "[de] Couldn't update SAML enablement setting",
            requireError: "[de] Couldn't update SAML requirement setting",
            disableSamlRequired: '[de] Disable SAML required',
            oktaWarningPrompt: '[de] Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: '[de] Please add Identity Provider metadata below to enable',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `[de] <muted-text>Please disable <a href="${twoFactorAuthSettingsUrl}">force two-factor authentication</a> to enable SAML login.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: '[de] SAML configuration details',
            subtitle: '[de] Use these details to get SAML set up.',
            identityProviderMetadata: '[de] Identity Provider Metadata',
            entityID: '[de] Entity ID',
            nameIDFormat: '[de] Name ID Format',
            loginUrl: '[de] Login URL',
            acsUrl: '[de] ACS (Assertion Consumer Service) URL',
            logoutUrl: '[de] Logout URL',
            sloUrl: '[de] SLO (Single Logout) URL',
            serviceProviderMetaData: '[de] Service Provider MetaData',
            oktaScimToken: '[de] Okta SCIM Token',
            revealToken: '[de] Reveal token',
            fetchError: "[de] Couldn't fetch SAML configuration details",
            setMetadataGenericError: "[de] Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: '[de] Access restricted',
            subtitle: (domainName: string) => `[de] Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: '[de] Company card management',
            accountCreationAndDeletion: '[de] Account creation and deletion',
            workspaceCreation: '[de] Workspace creation',
            samlSSO: '[de] SAML SSO',
        },
        addDomain: {
            title: '[de] Add domain',
            subtitle: '[de] Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: '[de] Domain name',
            newDomain: '[de] New domain',
        },
        domainAdded: {
            title: '[de] Domain added',
            description: "[de] Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: '[de] Configure',
        },
        enhancedSecurity: {
            title: '[de] Enhanced security',
            subtitle: '[de] Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: '[de] Enable',
        },
        domainAdmins: '[de] Domain admins',
        admins: {
            title: '[de] Admins',
            findAdmin: '[de] Find admin',
            primaryContact: '[de] Primary contact',
            addPrimaryContact: '[de] Add primary contact',
            setPrimaryContactError: '[de] Unable to set primary contact. Please try again later.',
            consolidatedDomainBilling: '[de] Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `[de] <comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "[de] Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: '[de] Add admin',
            addAdminError: '[de] Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: '[de] Revoke admin access',
            cantRevokeAdminAccess: "[de] Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: '[de] Unable to remove this user as an Admin. Please try again.',
                removeDomain: '[de] Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: '[de] Please enter your domain name to reset it.',
            },
            resetDomain: '[de] Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `[de] Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: '[de] Enter your domain name here',
            resetDomainInfo: `[de] This action is <strong>permanent</strong> and the following data will be deleted: <br/> <bullet-list><bullet-item>Company card connections and any unreported expenses from those cards</bullet-item><bullet-item>SAML and group settings</bullet-item></bullet-list> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        domainMembers: '[de] Domain members',
        members: {
            title: '[de] Members',
            findMember: '[de] Find member',
            addMember: '[de] Add member',
            emptyMembers: {
                title: '[de] No members in this group',
                subtitle: '[de] Add a member or try changing the filter above.',
            },
            allMembers: '[de] All members',
            email: '[de] Email address',
            closeAccountPrompt: '[de] Are you sure? This action is permanent.',
            forceCloseAccount: () => ({
                one: '[de] Force close account',
                other: '[de] Force close accounts',
            }),
            safeCloseAccount: () => ({
                one: '[de] Close account safely',
                other: '[de] Close accounts safely',
            }),
            closeAccountInfo: () => ({
                one: '[de] We recommend closing the account safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected account.',
                other: '[de] We recommend closing the accounts safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected accounts.',
            }),
            closeAccount: () => ({
                one: '[de] Close account',
                other: '[de] Close accounts',
            }),
            moveToGroup: '[de] Move to group',
            chooseWhereToMove: ({count}: {count: number}) => `[de] Choose where to move ${count} ${count === 1 ? '[de] member' : '[de] members'}.`,
            error: {
                addMember: '[de] Unable to add this member. Please try again.',
                removeMember: '[de] Unable to remove this user. Please try again.',
                moveMember: '[de] Unable to move this member. Please try again.',
                vacationDelegate: '[de] Unable to set this user as a vacation delegate. Please try again.',
            },
            cannotSetVacationDelegateForMember: (email: string) => `[de] You can't set a vacation delegate for ${email} because they're currently the delegate for the following members:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `[de] Are you sure? This will lock <strong>${email}'s</strong> account. <br /><br /> Our team will then review the account and remove any unauthorized access. To regain access, they'll need to work with Concierge.`,
            reportSuspiciousActivityConfirmationPrompt: '[de] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        },
        common: {
            settings: '[de] Settings',
            forceTwoFactorAuth: '[de] Force two-factor authentication',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `[de] <muted-text>Please disable <a href="${samlPageUrl}">SAML</a> to force two-factor authentication.</muted-text>`,
            forceTwoFactorAuthDescription: `[de] <muted-text>Require two-factor authentication for all members of this domain. Domain members will be prompted to set up two-factor authentication on their account when they sign in.</muted-text>`,
            forceTwoFactorAuthError: "[de] Force two-factor authentication couldn't be changed. Please try again later.",
            resetTwoFactorAuth: '[de] Reset two-factor authentication',
        },
        groups: {
            title: '[de] Groups',
            memberCount: () => {
                return {
                    one: '[de] 1 member',
                    other: (count: number) => `[de] ${count} members`,
                };
            },
        },
    },
};
export default translations;
