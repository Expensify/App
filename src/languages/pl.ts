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
        count: '[pl][ctx: Used as a noun meaning a numerical total or quantity, not the verb “to count.”] Count',
        cancel: '[pl] Cancel',
        dismiss: '[pl][ctx: Refers to closing or hiding a notification or message, not rejecting or ignoring something.] Dismiss',
        proceed: '[pl][ctx: Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”] Proceed',
        unshare: '[pl] Unshare',
        yes: '[pl] Yes',
        no: '[pl] No',
        ok: '[pl][ctx: Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.] OK',
        notNow: '[pl] Not now',
        noThanks: '[pl] No thanks',
        learnMore: '[pl] Learn more',
        buttonConfirm: '[pl] Got it',
        name: '[pl] Name',
        attachment: '[pl] Attachment',
        attachments: '[pl] Attachments',
        center: '[pl] Center',
        from: '[pl] From',
        to: '[pl] To',
        in: '[pl] In',
        optional: '[pl] Optional',
        new: '[pl] New',
        newFeature: '[pl] New feature',
        search: '[pl] Search',
        reports: '[pl] Reports',
        spend: '[pl] Spend',
        find: '[pl] Find',
        searchWithThreeDots: '[pl] Search...',
        next: '[pl] Next',
        previous: '[pl] Previous',
        previousMonth: '[pl] Previous month',
        nextMonth: '[pl] Next month',
        previousYear: '[pl] Previous year',
        nextYear: '[pl] Next year',
        goBack: '[pl][ctx: Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.] Go back',
        create: '[pl] Create',
        add: '[pl] Add',
        resend: '[pl] Resend',
        save: '[pl] Save',
        select: '[pl] Select',
        deselect: '[pl] Deselect',
        selectMultiple: '[pl][ctx: Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.] Select multiple',
        saveChanges: '[pl] Save changes',
        submit: '[pl] Submit',
        submitted: '[pl][ctx: Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”] Submitted',
        rotate: '[pl] Rotate',
        zoom: '[pl] Zoom',
        password: '[pl] Password',
        magicCode: '[pl] Magic code',
        digits: '[pl] digits',
        twoFactorCode: '[pl] Two-factor code',
        workspaces: '[pl] Workspaces',
        home: '[pl] Home',
        inbox: '[pl] Inbox',
        yourReviewIsRequired: '[pl] Your review is required',
        actionBadge: {
            submit: '[pl] Submit',
            approve: '[pl] Approve',
            pay: '[pl] Pay',
            fix: '[pl] Fix',
        },
        success: '[pl][ctx: Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”] Success',
        group: '[pl] Group',
        profile: '[pl] Profile',
        referral: '[pl] Referral',
        payments: '[pl] Payments',
        approvals: '[pl] Approvals',
        wallet: '[pl] Wallet',
        preferences: '[pl] Preferences',
        view: '[pl] View',
        review: (amount?: string) => `[pl] Review${amount ? ` ${amount}` : ''}`,
        not: '[pl] Not',
        signIn: '[pl] Sign in',
        signInWithGoogle: '[pl] Sign in with Google',
        signInWithApple: '[pl] Sign in with Apple',
        signInWith: '[pl] Sign in with',
        continue: '[pl] Continue',
        firstName: '[pl] First name',
        lastName: '[pl] Last name',
        scanning: '[pl] Scanning',
        analyzing: '[pl] Analyzing...',
        thinking: '[pl] Concierge is thinking...',
        addCardTermsOfService: '[pl] Expensify Terms of Service',
        perPerson: '[pl] per person',
        phone: '[pl] Phone',
        phoneNumber: '[pl] Phone number',
        phoneNumberPlaceholder: '[pl] (xxx) xxx-xxxx',
        email: '[pl] Email',
        and: '[pl] and',
        or: '[pl] or',
        details: '[pl] Details',
        privacy: '[pl] Privacy',
        privacyPolicy: '[pl] Privacy Policy',
        hidden: '[pl] Hidden',
        visible: '[pl] Visible',
        delete: '[pl] Delete',
        archived: '[pl][ctx: UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.] archived',
        contacts: '[pl] Contacts',
        recents: '[pl] Recents',
        close: '[pl] Close',
        comment: '[pl] Comment',
        download: '[pl] Download',
        downloading: '[pl] Downloading',
        uploading: '[pl][ctx: Indicates that a file is currently being uploaded (sent to the server), not downloaded.] Uploading',
        pin: '[pl][ctx: as a verb, not a noun] Pin',
        unPin: '[pl] Unpin',
        back: '[pl] Back',
        saveAndContinue: '[pl] Save & continue',
        settings: '[pl] Settings',
        termsOfService: '[pl] Terms of Service',
        members: '[pl] Members',
        invite: '[pl] Invite',
        here: '[pl] here',
        date: '[pl] Date',
        dob: '[pl] Date of birth',
        currentYear: '[pl] Current year',
        currentMonth: '[pl] Current month',
        ssnLast4: '[pl] Last 4 digits of SSN',
        ssnFull9: '[pl] Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `[pl] Address line ${lineNumber}`,
        personalAddress: '[pl] Personal address',
        companyAddress: '[pl] Company address',
        noPO: '[pl] No PO boxes or mail-drop addresses, please.',
        city: '[pl] City',
        state: '[pl] State',
        streetAddress: '[pl] Street address',
        stateOrProvince: '[pl] State / Province',
        country: '[pl] Country',
        zip: '[pl] Zip code',
        zipPostCode: '[pl] Zip / Postcode',
        whatThis: "[pl] What's this?",
        iAcceptThe: '[pl] I accept the ',
        acceptTermsAndPrivacy: `[pl] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `[pl] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `[pl] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: "[pl] You can't export an empty report.",
            other: () => `[pl] You can't export empty reports.`,
        }),
        remove: '[pl] Remove',
        admin: '[pl] Admin',
        owner: '[pl] Owner',
        dateFormat: '[pl] YYYY-MM-DD',
        send: '[pl] Send',
        na: '[pl] N/A',
        noResultsFound: '[pl] No results found',
        noResultsFoundMatching: (searchString: string) => `[pl] No results found matching "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `[pl] Suggestions available for "${searchString}".` : '[pl] Suggestions available.'),
        recentDestinations: '[pl] Recent destinations',
        timePrefix: "[pl] It's",
        conjunctionFor: '[pl] for',
        todayAt: '[pl] Today at',
        tomorrowAt: '[pl] Tomorrow at',
        yesterdayAt: '[pl] Yesterday at',
        conjunctionAt: '[pl] at',
        conjunctionTo: '[pl] to',
        genericErrorMessage: '[pl] Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: '[pl] Percentage',
        progressBarLabel: '[pl] Onboarding progress',
        converted: '[pl] Converted',
        error: {
            invalidAmount: '[pl] Invalid amount',
            acceptTerms: '[pl] You must accept the Terms of Service to continue',
            phoneNumber: `[pl] Please enter a complete phone number
(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '[pl] This field is required',
            requestModified: '[pl] This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `[pl] Character limit exceeded (${length}/${limit})`,
            dateInvalid: '[pl] Please select a valid date',
            invalidDateShouldBeFuture: '[pl] Please choose today or a future date',
            invalidTimeShouldBeFuture: '[pl] Please choose a time at least one minute ahead',
            invalidCharacter: '[pl] Invalid character',
            enterMerchant: '[pl] Enter a merchant name',
            enterAmount: '[pl] Enter an amount',
            missingMerchantName: '[pl] Missing merchant name',
            missingAmount: '[pl] Missing amount',
            missingDate: '[pl] Missing date',
            enterDate: '[pl] Enter a date',
            invalidTimeRange: '[pl] Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: '[pl] Please complete the form above to continue',
            pleaseSelectOne: '[pl] Please select an option above',
            invalidRateError: '[pl] Please enter a valid rate',
            lowRateError: '[pl] Rate must be greater than 0',
            email: '[pl] Please enter a valid email address',
            login: '[pl] An error occurred while logging in. Please try again.',
        },
        comma: '[pl] comma',
        semicolon: '[pl] semicolon',
        please: '[pl] Please',
        contactUs: '[pl][ctx: Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.] contact us',
        pleaseEnterEmailOrPhoneNumber: '[pl] Please enter an email or phone number',
        fixTheErrors: '[pl][ctx: Instruction prompting the user to correct multiple issues. Should use imperative form when translated.] fix the errors',
        inTheFormBeforeContinuing: '[pl] in the form before continuing',
        confirm: '[pl] Confirm',
        reset: '[pl] Reset',
        done: '[pl][ctx: Status or button indicating that an action or process has been completed. Should reflect completion.] Done',
        more: '[pl] More',
        debitCard: '[pl] Debit card',
        bankAccount: '[pl] Bank account',
        personalBankAccount: '[pl] Personal bank account',
        businessBankAccount: '[pl] Business bank account',
        join: '[pl] Join',
        leave: '[pl] Leave',
        decline: '[pl] Decline',
        reject: '[pl] Reject',
        transferBalance: '[pl] Transfer balance',
        enterManually: '[pl][ctx: Instruction telling the user to input data manually. Refers to entering text or values in a field.] Enter it manually',
        message: '[pl] Message',
        leaveThread: '[pl] Leave thread',
        you: '[pl] You',
        me: '[pl][ctx: Refers to the current user in the UI. Should follow capitalization rules for labels] me',
        youAfterPreposition: '[pl] you',
        your: '[pl] your',
        conciergeHelp: '[pl] Please reach out to Concierge for help.',
        youAppearToBeOffline: '[pl] You appear to be offline.',
        thisFeatureRequiresInternet: '[pl] This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: '[pl] Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: '[pl] An error occurred while trying to play this video.',
        areYouSure: '[pl] Are you sure?',
        verify: '[pl] Verify',
        yesContinue: '[pl] Yes, continue',
        websiteExample: '[pl][ctx: Provides an example format for a website URL.] e.g. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `[pl][ctx: Provides an example format for a ZIP] e.g. ${zipSampleFormat}` : ''),
        description: '[pl] Description',
        title: '[pl] Title',
        assignee: '[pl] Assignee',
        createdBy: '[pl] Created by',
        with: '[pl] with',
        shareCode: '[pl] Share code',
        share: '[pl] Share',
        per: '[pl] per',
        mi: '[pl][ctx: Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.] mile',
        km: '[pl] kilometer',
        milesAbbreviated: '[pl] mi',
        kilometersAbbreviated: '[pl] km',
        copied: '[pl] Copied!',
        someone: '[pl] Someone',
        total: '[pl] Total',
        edit: '[pl] Edit',
        letsDoThis: `[pl] Let's do this!`,
        letsStart: `[pl] Let's start`,
        showMore: '[pl] Show more',
        showLess: '[pl] Show less',
        merchant: '[pl] Merchant',
        change: '[pl] Change',
        category: '[pl] Category',
        report: '[pl] Report',
        billable: '[pl] Billable',
        nonBillable: '[pl] Non-billable',
        tag: '[pl] Tag',
        receipt: '[pl] Receipt',
        verified: '[pl] Verified',
        replace: '[pl] Replace',
        distance: '[pl] Distance',
        mile: '[pl] mile',
        miles: '[pl][ctx: Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.] miles',
        kilometer: '[pl] kilometer',
        kilometers: '[pl] kilometers',
        recent: '[pl] Recent',
        all: '[pl] All',
        am: '[pl] AM',
        pm: '[pl] PM',
        tbd: "[pl][ctx: Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.] TBD",
        selectCurrency: '[pl] Select a currency',
        selectSymbolOrCurrency: '[pl] Select a symbol or currency',
        card: '[pl] Card',
        whyDoWeAskForThis: '[pl] Why do we ask for this?',
        required: '[pl] Required',
        automatic: '[pl] Automatic',
        showing: '[pl] Showing',
        of: '[pl] of',
        default: '[pl] Default',
        update: '[pl] Update',
        member: '[pl] Member',
        auditor: '[pl] Auditor',
        role: '[pl] Role',
        roleCannotBeChanged: (workflowsLinkPage: string) => `[pl] Role can't be changed because this member is a <a href="${workflowsLinkPage}">payer</a> on this workspace.`,
        currency: '[pl] Currency',
        groupCurrency: '[pl] Group currency',
        rate: '[pl] Rate',
        emptyLHN: {
            title: '[pl] Woohoo! All caught up.',
            subtitleText1: '[pl] Find a chat using the',
            subtitleText2: '[pl] button above, or create something using the',
            subtitleText3: '[pl] button below.',
        },
        businessName: '[pl] Business name',
        clear: '[pl] Clear',
        type: '[pl] Type',
        reportName: '[pl] Report name',
        action: '[pl] Action',
        expenses: '[pl] Expenses',
        totalSpend: '[pl] Total spend',
        tax: '[pl] Tax',
        shared: '[pl] Shared',
        drafts: '[pl] Drafts',
        draft: '[pl][ctx: as a noun, not a verb] Draft',
        finished: '[pl] Finished',
        upgrade: '[pl] Upgrade',
        downgradeWorkspace: '[pl] Downgrade workspace',
        companyID: '[pl] Company ID',
        userID: '[pl] User ID',
        disable: '[pl] Disable',
        export: '[pl] Export',
        initialValue: '[pl] Initial value',
        currentDate: '[pl][ctx: UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.] Current date',
        value: '[pl] Value',
        downloadFailedTitle: '[pl] Download failed',
        downloadFailedDescription: "[pl] Your download couldn't be completed. Please try again later.",
        filterLogs: '[pl] Filter Logs',
        network: '[pl] Network',
        reportID: '[pl] Report ID',
        longReportID: '[pl] Long Report ID',
        withdrawalID: '[pl] Withdrawal ID',
        withdrawalStatus: '[pl] Withdrawal status',
        bankAccounts: '[pl] Bank accounts',
        chooseFile: '[pl] Choose file',
        chooseFiles: '[pl] Choose files',
        dropTitle: '[pl][ctx: Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.] Let it go',
        dropMessage: '[pl][ctx: Instruction for dropping one or more files into an upload area.] Drop your file here',
        ignore: '[pl] Ignore',
        enabled: '[pl] Enabled',
        disabled: '[pl] Disabled',
        import: '[pl][ctx: Action button for importing a file or data. Should use the verb form, not the noun form.] Import',
        offlinePrompt: "[pl] You can't take this action right now.",
        outstanding: '[pl][ctx: meaning "remaining to be paid, done, or dealt with", not "exceptionally good"] Outstanding',
        chats: '[pl] Chats',
        tasks: '[pl] Tasks',
        unread: '[pl] Unread',
        sent: '[pl] Sent',
        links: '[pl] Links',
        day: '[pl][ctx: Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).] day',
        days: '[pl] days',
        rename: '[pl] Rename',
        address: '[pl] Address',
        hourAbbreviation: '[pl] h',
        minuteAbbreviation: '[pl] m',
        secondAbbreviation: '[pl] s',
        skip: '[pl] Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `[pl] Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: '[pl] Chat now',
        workEmail: '[pl] Work email',
        destination: '[pl] Destination',
        subrate: '[pl][ctx: Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.] Subrate',
        perDiem: '[pl] Per diem',
        validate: '[pl] Validate',
        downloadAsPDF: '[pl] Download as PDF',
        downloadAsCSV: '[pl] Download as CSV',
        print: '[pl] Print',
        help: '[pl] Help',
        collapsed: '[pl] Collapsed',
        expanded: '[pl] Expanded',
        expenseReport: '[pl] Expense Report',
        expenseReports: '[pl] Expense Reports',
        rateOutOfPolicy: '[pl][ctx: Rate as a noun, not a verb] Rate out of policy',
        leaveWorkspace: '[pl] Leave workspace',
        leaveWorkspaceConfirmation: "[pl] If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "[pl] If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "[pl] If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `[pl] If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `[pl] If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `[pl] If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "[pl] You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: '[pl] Reimbursable',
        editYourProfile: '[pl] Edit your profile',
        comments: '[pl] Comments',
        sharedIn: '[pl] Shared in',
        unreported: '[pl] Unreported',
        explore: '[pl] Explore',
        insights: '[pl] Insights',
        todo: '[pl] To-do',
        invoice: '[pl] Invoice',
        expense: '[pl] Expense',
        chat: '[pl] Chat',
        task: '[pl] Task',
        trip: '[pl] Trip',
        apply: '[pl] Apply',
        status: '[pl] Status',
        on: '[pl] On',
        before: '[pl] Before',
        after: '[pl] After',
        range: '[pl] Range',
        reschedule: '[pl] Reschedule',
        general: '[pl] General',
        workspacesTabTitle: '[pl] Workspaces',
        headsUp: '[pl] Heads up!',
        submitTo: '[pl] Submit to',
        forwardTo: '[pl] Forward to',
        approvalLimit: '[pl] Approval limit',
        overLimitForwardTo: '[pl] Over limit forward to',
        merge: '[pl] Merge',
        none: '[pl] None',
        unstableInternetConnection: '[pl] Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: '[pl] Enable Global Reimbursements',
        purchaseAmount: '[pl] Purchase amount',
        originalAmount: '[pl] Original amount',
        frequency: '[pl] Frequency',
        link: '[pl] Link',
        pinned: '[pl] Pinned',
        read: '[pl] Read',
        copyToClipboard: '[pl] Copy to clipboard',
        thisIsTakingLongerThanExpected: '[pl] This is taking longer than expected...',
        domains: '[pl] Domains',
        actionRequired: '[pl] Action required',
        duplicate: '[pl] Duplicate',
        duplicated: '[pl] Duplicated',
        duplicateExpense: '[pl] Duplicate expense',
        duplicateReport: '[pl] Duplicate report',
        copyOfReportName: (reportName: string) => `[pl] Copy of ${reportName}`,
        exchangeRate: '[pl] Exchange rate',
        reimbursableTotal: '[pl] Reimbursable total',
        nonReimbursableTotal: '[pl] Non-reimbursable total',
        opensInNewTab: '[pl] Opens in a new tab',
        locked: '[pl] Locked',
        month: '[pl] Month',
        week: '[pl] Week',
        year: '[pl] Year',
        quarter: '[pl] Quarter',
        concierge: {
            sidePanelGreeting: '[pl] Hi there, how can I help?',
            showHistory: '[pl] Show history',
        },
        vacationDelegate: '[pl] Vacation delegate',
        expensifyLogo: '[pl] Expensify logo',
        approver: '[pl] Approver',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `[pl] enter digit ${digitIndex} of ${totalDigits}`,
    },
    socials: {
        podcast: '[pl] Follow us on Podcast',
        twitter: '[pl] Follow us on Twitter',
        instagram: '[pl] Follow us on Instagram',
        facebook: '[pl] Follow us on Facebook',
        linkedin: '[pl] Follow us on LinkedIn',
    },
    concierge: {
        collapseReasoning: '[pl] Collapse reasoning',
        expandReasoning: '[pl] Expand reasoning',
    },
    supportalNoAccess: {
        title: '[pl] Not so fast',
        descriptionWithCommand: (command?: string) =>
            `[pl] You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: '[pl] Locked Account',
        description: "[pl] You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: '[pl] Use current location',
        notFound: '[pl] We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "[pl] It looks like you've denied access to your location.",
        please: '[pl] Please',
        allowPermission: '[pl] allow location access in settings',
        tryAgain: '[pl] and try again.',
    },
    contact: {
        importContacts: '[pl] Import contacts',
        importContactsTitle: '[pl] Import your contacts',
        importContactsText: '[pl] Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: '[pl] so your favorite people are always a tap away.',
        importContactsNativeText: '[pl] Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: '[pl] Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '[pl] Camera access',
        expensifyDoesNotHaveAccessToCamera: "[pl] Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: '[pl] Attachment error',
        errorWhileSelectingAttachment: '[pl] An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: '[pl] An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: '[pl] Take photo',
        chooseFromGallery: '[pl] Choose from gallery',
        chooseDocument: '[pl] Choose file',
        attachmentTooLarge: '[pl] Attachment is too large',
        sizeExceeded: '[pl] Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `[pl] Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: '[pl] Attachment is too small',
        sizeNotMet: '[pl] Attachment size must be greater than 240 bytes',
        wrongFileType: '[pl] Invalid file type',
        notAllowedExtension: '[pl] This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: '[pl] Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: '[pl] Password-protected PDF is not supported',
        attachmentImageResized: '[pl] This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: '[pl] This image is too large to preview before uploading.',
        imageDimensionsTooLarge: '[pl] Image dimensions are too large to process. Please use a smaller image.',
        tooManyFiles: (fileLimit: number) => `[pl] You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `[pl] Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "[pl] Some files can't be uploaded",
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `[pl] Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "[pl] You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `[pl] ${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: '[pl] Learn more about supported formats.',
        passwordProtected: "[pl] Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: '[pl] Add attachments',
        addReceipt: '[pl] Add receipt',
        scanReceipts: '[pl] Scan receipts',
        replaceReceipt: '[pl] Replace receipt',
    },
    filePicker: {
        fileError: '[pl] File error',
        errorWhileSelectingFile: '[pl] An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: '[pl] Connection complete',
        supportingText: '[pl] You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: '[pl] Edit photo',
        description: '[pl] Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: '[pl] No extension found for mime type',
        problemGettingImageYouPasted: '[pl] There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `[pl] The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `[pl] The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: '[pl] Update app',
        updatePrompt: '[pl] A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: '[pl] Launching Expensify',
        expired: '[pl] Your session has expired.',
        signIn: '[pl] Please sign in again.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: '[pl] Review transaction',
            pleaseReview: '[pl] Please review this transaction',
            requiresYourReview: '[pl] An Expensify Card transaction requires your review.',
            transactionDetails: '[pl] Transaction details',
            attemptedTransaction: '[pl] Attempted transaction',
            deny: '[pl] Deny',
            approve: '[pl] Approve',
            denyTransaction: '[pl] Deny transaction',
            transactionDenied: '[pl] Transaction denied',
            transactionApproved: '[pl] Transaction approved!',
            areYouSureToDeny: '[pl] Are you sure? The transaction will be denied if you close this screen.',
            youCanTryAgainAtMerchantOrReachOut:
                "[pl] You can try again at the merchant. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            youNeedToTryAgainAtMerchant: "[pl] This transaction was not verified, so we denied it. You'll need to try again at the merchant.",
            goBackToTheMerchant: '[pl] Return to the merchant site to continue the transaction.',
            transactionFailed: '[pl] Transaction failed',
            transactionCouldNotBeCompleted: '[pl] Your transaction could not be completed. Please try again at the merchant.',
            transactionCouldNotBeCompletedReachOut:
                "[pl] Your transaction could not be completed. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            reviewFailed: '[pl] Review failed',
            alreadyReviewedSubtitle:
                '[pl] You already reviewed this transaction. Please check your <transaction-history-link>transaction history</transaction-history-link> or contact <concierge-link>Concierge</concierge-link> to report any issues.',
        },
        unsupportedDevice: {
            unsupportedDevice: '[pl] Unsupported device',
            pleaseDownloadMobileApp: `[pl] This action is not supported on your device. Please download the Expensify app from the <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> or <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> and try again.`,
            pleaseUseWebApp: `[pl] This action is not supported on your device. Please use the <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify web app</a> and try again.`,
        },
        biometricsTest: {
            biometricsTest: '[pl] Biometrics test',
            authenticationSuccessful: '[pl] Authentication successful',
            successfullyAuthenticatedUsing: (authType?: string) => `[pl] You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `[pl] Biometrics (${status})`,
            statusNeverRegistered: '[pl] Never registered',
            statusNotRegistered: '[pl] Not registered',
            statusRegisteredOtherDevice: () => ({one: '[pl] Another device registered', other: '[pl] Other devices registered'}),
            statusRegisteredThisDevice: '[pl] Registered',
            yourAttemptWasUnsuccessful: '[pl] Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: '[pl] You couldn’t be authenticated',
            areYouSureToReject: '[pl] Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: '[pl] Reject authentication',
            test: '[pl] Test',
            biometricsAuthentication: '[pl] Biometric authentication',
            authType: {
                unknown: '[pl] Unknown',
                none: '[pl] None',
                credentials: '[pl] Credentials',
                biometrics: '[pl] Biometrics',
                faceId: '[pl] Face ID',
                touchId: '[pl] Touch ID',
                opticId: '[pl] Optic ID',
                passkey: '[pl] Passkey',
            },
        },
        pleaseEnableInSystemSettings: {
            start: '[pl] Please enable face/fingerprint verification or set a device passcode in your ',
            link: '[pl] system settings',
            end: '.',
        },
        oops: '[pl] Oops, something went wrong',
        verificationFailed: '[pl] Verification failed',
        looksLikeYouRanOutOfTime: '[pl] Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: '[pl] You ran out of time',
        letsVerifyItsYou: '[pl] Let’s verify it’s you',
        nowLetsAuthenticateYou: "[pl] Now, let's authenticate you...",
        letsAuthenticateYou: "[pl] Let's authenticate you...",
        verifyYourself: {
            biometrics: '[pl] Verify yourself with your face or fingerprint',
            passkeys: '[pl] Verify yourself with a passkey',
        },
        enableQuickVerification: {
            biometrics: '[pl] Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
            passkeys: '[pl] Enable quick, secure verification using a passkey. No passwords or codes required.',
        },
        revoke: {
            revoke: '[pl] Revoke',
            title: '[pl] Face/fingerprint & passkeys',
            explanation:
                '[pl] Face/fingerprint or passkey verification are enabled on one or more devices. Revoking access will require a magic code for the next verification on that device.',
            confirmationPrompt: "[pl] Are you sure? You'll need a magic code for the next verification on that device.",
            confirmationPromptThisDevice: "[pl] Are you sure? You'll need a magic code for the next verification on this device.",
            confirmationPromptMultiple: "[pl] Are you sure? You'll need a magic code for the next verification on those devices.",
            confirmationPromptAll: "[pl] Are you sure? You'll need a magic code for the next verification on any device.",
            cta: '[pl] Revoke access',
            ctaAll: '[pl] Revoke all',
            noDevices: "[pl] You don't have any devices registered for face/fingerprint or passkey verification. If you register any, you will be able to revoke that access here.",
            dismiss: '[pl] Got it',
            error: '[pl] Request failed. Try again later.',
            thisDevice: '[pl] This device',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['[pl] One', '[pl] Two', '[pl] Three', '[pl] Four', '[pl] Five', '[pl] Six', '[pl] Seven', '[pl] Eight', '[pl] Nine'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `[pl] ${displayCount} other ${otherDeviceCount === 1 ? '[pl] device' : '[pl] devices'}`;
            },
        },
        setPin: {
            didNotShipCard: "[pl] We didn't ship your card. Please try again.",
        },
        revealPin: {
            couldNotReveal: "[pl] We couldn't reveal your PIN. Please try again.",
        },
        changePin: {
            didNotChange: "[pl] We didn't change your PIN. Please try again.",
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            [pl] Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: '[pl] Head back to your original tab to continue.',
        title: "[pl] Here's your magic code",
        description: dedent(`
            [pl] Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            [pl] Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: '[pl] , or',
        signInHere: '[pl] just sign in here',
        expiredCodeTitle: '[pl] Magic code expired',
        expiredCodeDescription: '[pl] Go back to the original device and request a new code',
        successfulNewCodeRequest: '[pl] Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            [pl] Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            [pl] Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: '[pl] request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: '[pl] Paid by',
        whatsItFor: "[pl] What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: '[pl] Name, email, or phone number',
        findMember: '[pl] Find a member',
        searchForSomeone: '[pl] Search for someone',
        userSelected: (username: string) => `[pl] ${username} selected`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '[pl] Submit an expense, refer your team',
            subtitleText: "[pl] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '[pl] Book a call',
    },
    hello: '[pl] Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '[pl] Get started below.',
        anotherLoginPageIsOpen: '[pl] Another login page is open.',
        anotherLoginPageIsOpenExplanation: "[pl] You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: '[pl] Welcome!',
        welcomeWithoutExclamation: '[pl] Welcome',
        phrase2: "[pl] Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: '[pl] Your payments get to you as fast as you can get your point across.',
        enterPassword: '[pl] Please enter your password',
        welcomeNewFace: (login: string) => `[pl] ${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: (login: string) => `[pl] Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '[pl] Travel and expense, at the speed of chat',
            body: '[pl] Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '[pl] Continue logging in with single sign-on:',
        orContinueWithMagicCode: '[pl] You can also sign in with a magic code',
        useSingleSignOn: '[pl] Use single sign-on',
        useMagicCode: '[pl] Use magic code',
        launching: '[pl] Launching...',
        oneMoment: "[pl] One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: '[pl] Drop to upload',
        sendAttachment: '[pl] Send attachment',
        addAttachment: '[pl] Add attachment',
        writeSomething: '[pl] Write something...',
        blockedFromConcierge: '[pl] Communication is barred',
        askConciergeToUpdate: '[pl] Try "Update an expense"...',
        askConciergeToCorrect: '[pl] Try "Correct an expense"...',
        askConciergeForHelp: '[pl] Ask Concierge AI for help...',
        fileUploadFailed: '[pl] Upload failed. File is not supported.',
        localTime: (user: string, time: string) => `[pl] It's ${time} for ${user}`,
        edited: '[pl] (edited)',
        emoji: '[pl] Emoji',
        collapse: '[pl] Collapse',
        expand: '[pl] Expand',
    },
    reportActionContextMenu: {
        copyMessage: '[pl] Copy message',
        copied: '[pl] Copied!',
        copyLink: '[pl] Copy link',
        copyURLToClipboard: '[pl] Copy URL to clipboard',
        copyEmailToClipboard: '[pl] Copy email to clipboard',
        markAsUnread: '[pl] Mark as unread',
        markAsRead: '[pl] Mark as read',
        editAction: ({action}: EditActionParams) => `[pl] Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '[pl] expense' : '[pl] comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '[pl] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[pl] Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '[pl] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[pl] Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: '[pl] Only visible to',
        explain: '[pl] Explain',
        explainMessage: '[pl] Please explain this to me.',
        replyInThread: '[pl] Reply in thread',
        joinThread: '[pl] Join thread',
        leaveThread: '[pl] Leave thread',
        copyOnyxData: '[pl] Copy Onyx data',
        flagAsOffensive: '[pl] Flag as offensive',
        menu: '[pl] Menu',
    },
    emojiReactions: {
        addReactionTooltip: '[pl] Add reaction',
        reactedWith: '[pl] reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `[pl] You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `[pl] This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `[pl] This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `[pl] This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `[pl] This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `[pl] This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `[pl] This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `[pl] This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: '[pl] This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "[pl] Welcome! Let's get you set up.",
        chatWithAccountManager: '[pl] Chat with your account manager here',
        askMeAnything: '[pl] Ask me anything!',
        sayHello: '[pl] Say hello!',
        yourSpace: '[pl] Your space',
        welcomeToRoom: (roomName: string) => `[pl] Welcome to ${roomName}!`,
        usePlusButton: (additionalText: string) => `[pl]  Use the + button to ${additionalText} an expense.`,
        askConcierge: '[pl] This is your chat with Concierge, your personal AI agent. I can do almost anything, try me!',
        conciergeSupport: '[pl] Your personal AI agent',
        create: '[pl] create',
        iouTypes: {
            pay: '[pl] pay',
            split: '[pl] split',
            submit: '[pl] submit',
            track: '[pl] track',
            invoice: '[pl] invoice',
        },
    },
    adminOnlyCanPost: '[pl] Only admins can send messages in this room.',
    reportAction: {
        asCopilot: '[pl] as copilot for',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `[pl] created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `[pl] created this report for any held expenses from deleted report #${reportID}`
                : `[pl] created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: '[pl] Notify everyone in this conversation',
    },
    newMessages: '[pl] New messages',
    latestMessages: '[pl] Latest messages',
    youHaveBeenBanned: "[pl] Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: '[pl] is typing...',
        areTyping: '[pl] are typing...',
        multipleMembers: '[pl] Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '[pl] This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `[pl] This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `[pl] This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `[pl] This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `[pl] This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[pl] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[pl] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '[pl] This booking is archived.',
    },
    writeCapabilityPage: {
        label: '[pl] Who can post',
        writeCapability: {
            all: '[pl] All members',
            admins: '[pl] Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: '[pl] Find something...',
        buttonMySettings: '[pl] My settings',
        fabNewChat: '[pl] Start chat',
        fabNewChatExplained: '[pl] Open actions menu',
        fabScanReceiptExplained: '[pl] Scan receipt',
        chatPinned: '[pl] Chat pinned',
        draftedMessage: '[pl] Drafted message',
        listOfChatMessages: '[pl] List of chat messages',
        listOfChats: '[pl] List of chats',
        saveTheWorld: '[pl] Save the world',
        tooltip: '[pl] Get started here!',
        redirectToExpensifyClassicModal: {
            title: '[pl] Coming soon',
            description: "[pl] We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        },
    },
    homePage: {
        forYou: '[pl] For you',
        timeSensitiveSection: {
            title: '[pl] Time sensitive',
            ctaFix: '[pl] Fix',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `[pl] Fix ${feedName} company card connection` : '[pl] Fix company card connection'),
                defaultSubtitle: '[pl] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `[pl] Fix ${cardName} personal card connection` : '[pl] Fix personal card connection'),
                subtitle: '[pl] Wallet',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `[pl] Fix ${integrationName} connection`,
                defaultSubtitle: '[pl] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: '[pl] We need your shipping address',
                subtitle: '[pl] Provide an address to receive your Expensify Card.',
                cta: '[pl] Add address',
            },
            addPaymentCard: {
                title: '[pl] Add a payment card to keep using Expensify',
                subtitle: '[pl] Account > Subscription',
                cta: '[pl] Add',
            },
            activateCard: {
                title: '[pl] Activate your Expensify Card',
                subtitle: '[pl] Validate your card and start spending.',
                cta: '[pl] Activate',
            },
            reviewCardFraud: {
                title: '[pl] Review potential fraud on your Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `[pl] Review ${amount} in potential fraud at ${merchant}`,
                subtitle: '[pl] Expensify Card',
                cta: '[pl] Review',
            },
            validateAccount: {
                title: '[pl] Validate your account to continue using Expensify',
                subtitle: '[pl] Account',
                cta: '[pl] Validate',
            },
            fixFailedBilling: {
                title: "[pl] We couldn't bill your card on file",
                subtitle: '[pl] Subscription',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `[pl] Free trial: ${days} ${days === 1 ? '[pl] day' : '[pl] days'} left!`,
            offer50Body: '[pl] Get 50% off your first year!',
            offer25Body: '[pl] Get 25% off your first year!',
            addCardBody: "[pl] Don't wait! Add your payment card now.",
            ctaClaim: '[pl] Claim',
            ctaAdd: '[pl] Add card',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `[pl] Time remaining: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: '[pl] Time remaining: 1 day',
                other: (pluralCount: number) => `[pl] Time remaining: ${pluralCount} days`,
            }),
        },
        assignedCards: '[pl] Your Expensify Cards',
        assignedCardsRemaining: ({amount}: {amount: string}) => `[pl] ${amount} remaining`,
        announcements: '[pl] Announcements',
        discoverSection: {
            title: '[pl] Discover',
            menuItemTitleNonAdmin: '[pl] Learn how to create expenses and submit reports.',
            menuItemTitleAdmin: '[pl] Learn how to invite members, edit approval workflows, and reconcile company cards.',
            menuItemDescription: '[pl] See what Expensify can do in 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `[pl] Submit ${count} ${count === 1 ? '[pl] report' : '[pl] reports'}`,
            approve: ({count}: {count: number}) => `[pl] Approve ${count} ${count === 1 ? '[pl] report' : '[pl] reports'}`,
            pay: ({count}: {count: number}) => `[pl] Pay ${count} ${count === 1 ? '[pl] report' : '[pl] reports'}`,
            export: ({count}: {count: number}) => `[pl] Export ${count} ${count === 1 ? '[pl] report' : '[pl] reports'}`,
            begin: '[pl] Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: "[pl] You're done!",
                thumbsUpStarsDescription: '[pl] Thumbs up to you, stay tuned for more tasks.',
                smallRocketTitle: '[pl] All caught up',
                smallRocketDescription: '[pl] Upcoming to-dos will launch here.',
                cowboyHatTitle: "[pl] You're done!",
                cowboyHatDescription: '[pl] All tasks are wrangled, keep an eye out for more.',
                trophy1Title: '[pl] Nothing to show',
                trophy1Description: '[pl] You did it! Keep an eye out for more to-dos.',
                palmTreeTitle: '[pl] All caught up',
                palmTreeDescription: '[pl] Time to relax but stay tuned for future tasks.',
                fishbowlBlueTitle: "[pl] You're done!",
                fishbowlBlueDescription: "[pl] We'll bubble up future tasks here.",
                targetTitle: '[pl] All caught up',
                targetDescription: '[pl] Way to stay on target. Check back for more tasks!',
                chairTitle: '[pl] Nothing to show',
                chairDescription: "[pl] Go relax, we'll list upcoming to-dos here.",
                broomTitle: "[pl] You're done!",
                broomDescription: '[pl] Tasks are clean, though stay tuned for more to-dos.',
                houseTitle: '[pl] All caught up',
                houseDescription: '[pl] This is your home base for upcoming to-dos.',
                conciergeBotTitle: '[pl] Nothing to show',
                conciergeBotDescription: '[pl] Beep boop beep boop, check back for more tasks!',
                checkboxTextTitle: '[pl] All caught up',
                checkboxTextDescription: '[pl] Check off your upcoming to-dos here.',
                flashTitle: "[pl] You're done!",
                flashDescription: "[pl] We'll zap your future tasks here.",
                sunglassesTitle: '[pl] Nothing to show',
                sunglassesDescription: "[pl] Time to chill, though stay tuned for what's next!",
                f1FlagsTitle: '[pl] All caught up',
                f1FlagsDescription: "[pl] You've finished all outstanding to-dos.",
            },
        },
        gettingStartedSection: {
            title: '[pl] Getting started',
            createWorkspace: '[pl] Create a workspace',
            connectAccounting: ({integrationName}: {integrationName: string}) => `[pl] Connect to ${integrationName}`,
            connectAccountingDefault: '[pl] Connect to accounting',
            customizeCategories: '[pl] Customize accounting categories',
            linkCompanyCards: '[pl] Link company cards',
            setupRules: '[pl] Set up spend rules',
        },
        upcomingTravel: '[pl] Upcoming travel',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `[pl] Flight to ${destination}`,
            trainTo: ({destination}: {destination: string}) => `[pl] Train to ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `[pl] Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `[pl] Car rental in ${destination}`,
            inOneWeek: '[pl] In 1 week',
            inDays: () => ({
                one: '[pl] In 1 day',
                other: (count: number) => `[pl] In ${count} days`,
            }),
            today: '[pl] Today',
        },
    },
    allSettingsScreen: {
        subscription: '[pl] Subscription',
        domains: '[pl] Domains',
    },
    tabSelector: {
        chat: '[pl] Chat',
        room: '[pl] Room',
        distance: '[pl] Distance',
        manual: '[pl] Manual',
        scan: '[pl] Scan',
        map: '[pl] Map',
        gps: '[pl] GPS',
        odometer: '[pl] Odometer',
    },
    spreadsheet: {
        upload: '[pl] Upload a spreadsheet',
        import: '[pl] Import spreadsheet',
        dragAndDrop: '[pl] <muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `[pl] <muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '[pl] <muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `[pl] <muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: '[pl] File contains column headers',
        column: (name: string) => `[pl] Column ${name}`,
        fieldNotMapped: (fieldName: string) => `[pl] Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `[pl] Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `[pl] Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: '[pl] Import successful',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[pl] No categories have been added or updated.';
            }
            if (added && updated) {
                return `[pl] ${added} ${added === 1 ? '[pl] category' : '[pl] categories'} added, ${updated} ${updated === 1 ? '[pl] category' : '[pl] categories'} updated.`;
            }
            if (added) {
                return added === 1 ? '[pl] 1 category has been added.' : `[pl] ${added} categories have been added.`;
            }
            return updated === 1 ? '[pl] 1 category has been updated.' : `[pl] ${updated} categories have been updated.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[pl] ${transactions} transactions have been added.` : '[pl] 1 transaction has been added.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[pl] No members have been added or updated.';
            }
            if (added && updated) {
                return `[pl] ${added} member${added > 1 ? '[pl] s' : ''} added, ${updated} member${updated > 1 ? '[pl] s' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `[pl] ${updated} members have been updated.` : '[pl] 1 member has been updated.';
            }
            return added > 1 ? `[pl] ${added} members have been added.` : '[pl] 1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `[pl] ${tags} tags have been added.` : '[pl] 1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: '[pl] Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `[pl] ${rates} per diem rates have been added.` : '[pl] 1 per diem rate has been added.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[pl] ${transactions} transactions have been imported.` : '[pl] 1 transaction has been imported.',
        importFailedTitle: '[pl] Import failed',
        importFailedDescription: '[pl] Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: '[pl] Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: '[pl] File size must be greater than 0 bytes',
        invalidFileMessage:
            '[pl] The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: '[pl] Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: '[pl] Import spreadsheet',
        downloadCSV: '[pl] Download CSV',
        importMemberConfirmation: () => ({
            one: `[pl] Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `[pl] Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: '[pl] Upload receipt',
        uploadMultiple: '[pl] Upload receipts',
        desktopSubtitleSingle: `[pl] or drag and drop it here`,
        desktopSubtitleMultiple: `[pl] or drag and drop them here`,
        alternativeMethodsTitle: '[pl] Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `[pl] <label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `[pl] <label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `[pl] <label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `[pl] <label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: '[pl] Take a photo',
        cameraAccess: '[pl] Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `[pl] Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: '[pl] Camera error',
        cameraErrorMessage: '[pl] An error occurred while taking a photo. Please try again.',
        locationAccessTitle: '[pl] Allow location access',
        locationAccessMessage: '[pl] Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: '[pl] Allow location access',
        locationErrorMessage: '[pl] Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `[pl] Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '[pl] Let it go',
        dropMessage: '[pl] Drop your file here',
        flash: '[pl] flash',
        multiScan: '[pl] multi-scan',
        shutter: '[pl] shutter',
        gallery: '[pl] gallery',
        deleteReceipt: '[pl] Delete receipt',
        deleteConfirmation: '[pl] Are you sure you want to delete this receipt?',
        addReceipt: '[pl] Add receipt',
        addAdditionalReceipt: '[pl] Add additional receipt',
        scanFailed: "[pl] The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        crop: '[pl] Crop',
        addAReceipt: {
            phrase1: '[pl] Add a receipt',
            phrase2: '[pl] or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: '[pl] Scan receipt',
        recordDistance: '[pl] Track distance',
        requestMoney: '[pl] Create expense',
        perDiem: '[pl] Create per diem',
        splitBill: '[pl] Split expense',
        splitScan: '[pl] Split receipt',
        splitDistance: '[pl] Split distance',
        paySomeone: (name?: string) => `[pl] Pay ${name ?? '[pl] someone'}`,
        assignTask: '[pl] Assign task',
        header: '[pl] Quick action',
        noLongerHaveReportAccess: '[pl] You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: '[pl] Update destination',
        createReport: '[pl] Create report',
        createTimeExpense: '[pl] Create time expense',
    },
    iou: {
        amount: '[pl] Amount',
        percent: '[pl] Percent',
        date: '[pl] Date',
        taxAmount: '[pl] Tax amount',
        taxRate: '[pl] Tax rate',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `[pl] Approve ${formattedAmount}` : '[pl] Approve'),
        approved: '[pl] Approved',
        cash: '[pl] Cash',
        card: '[pl] Card',
        original: '[pl] Original',
        split: '[pl] Split',
        splitExpense: '[pl] Split expense',
        splitDates: '[pl] Split dates',
        splitDateRange: (startDate: string, endDate: string, count: number) => `[pl] ${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `[pl] ${amount} from ${merchant}`,
        splitByPercentage: '[pl] Split by percentage',
        splitByDate: '[pl] Split by date',
        addSplit: '[pl] Add split',
        makeSplitsEven: '[pl] Make splits even',
        editSplits: '[pl] Edit splits',
        totalAmountGreaterThanOriginal: (amount: string) => `[pl] Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: (amount: string) => `[pl] Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: '[pl] Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: '[pl] No splits added. Add at least one to save.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `[pl] Edit ${amount} for ${merchant}`,
        removeSplit: '[pl] Remove split',
        splitExpenseCannotBeEditedModalTitle: "[pl] This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: '[pl] Approved or paid expenses cannot be edited',
        paySomeone: (name?: string) => `[pl] Pay ${name ?? '[pl] someone'}`,
        splitExpenseDistanceErrorModalDescription: '[pl] Please fix the distance rate error and try again.',
        splitExpensePerDiemRateErrorModalDescription: '[pl] Please fix the per diem rate error and try again.',
        expense: '[pl] Expense',
        categorize: '[pl] Categorize',
        share: '[pl] Share',
        participants: '[pl] Participants',
        createExpense: '[pl] Create expense',
        trackDistance: '[pl] Track distance',
        createExpenses: (expensesNumber: number) => `[pl] Create ${expensesNumber} expenses`,
        removeExpense: '[pl] Remove expense',
        removeThisExpense: '[pl] Remove this expense',
        removeExpenseConfirmation: '[pl] Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: '[pl] Add expense',
        chooseRecipient: '[pl] Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `[pl] Create ${amount} expense`,
        confirmDetails: '[pl] Confirm details',
        pay: '[pl] Pay',
        cancelPayment: '[pl] Cancel payment',
        cancelPaymentConfirmation: '[pl] Are you sure that you want to cancel this payment?',
        viewDetails: '[pl] View details',
        pending: '[pl] Pending',
        canceled: '[pl] Canceled',
        posted: '[pl] Posted',
        deleteReceipt: '[pl] Delete receipt',
        findExpense: '[pl] Find expense',
        deletedTransaction: (amount: string, merchant: string) => `[pl] deleted an expense (${amount} for ${merchant})`,
        movedFromReport: (reportName: string) => `[pl] moved an expense${reportName ? `[pl]  from ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `[pl] moved this expense${reportName ? `[pl]  to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `[pl] moved this expense${reportName ? `[pl]  from <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `[pl] moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `[pl] moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `[pl] moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: '[pl] Receipt pending match with card transaction',
        pendingMatch: '[pl] Pending match',
        pendingMatchWithCreditCardDescription: '[pl] Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: '[pl] Mark as cash',
        pendingMatchSubmitTitle: '[pl] Submit report',
        pendingMatchSubmitDescription: '[pl] Some expenses are awaiting a match with a credit card transaction. Do you want to mark them as cash?',
        routePending: '[pl] Route pending...',
        automaticallyEnterExpenseDetails: '[pl] Concierge will automatically enter the expense details for you, or you can add them manually.',
        receiptScanning: () => ({
            one: '[pl] Receipt scanning...',
            other: '[pl] Receipts scanning...',
        }),
        scanMultipleReceipts: '[pl] Scan multiple receipts',
        scanMultipleReceiptsDescription: "[pl] Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: '[pl] Receipt scan in progress',
        receiptScanInProgressDescription: '[pl] Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: '[pl] Remove from report',
        moveToPersonalSpace: '[pl] Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '[pl] Potential duplicate expenses identified. Review duplicates to enable submission.'
                : '[pl] Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: '[pl] Issue found',
            other: '[pl] Issues found',
        }),
        fieldPending: '[pl] Pending...',
        defaultRate: '[pl] Default rate',
        receiptMissingDetails: '[pl] Receipt missing details',
        missingAmount: '[pl] Missing amount',
        missingMerchant: '[pl] Missing merchant',
        receiptStatusTitle: '[pl] Scanning…',
        receiptStatusText: "[pl] Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: '[pl] Receipt scanning failed. Please enter the details manually.',
        transactionPendingDescription: '[pl] Transaction pending. It may take a few days to post.',
        companyInfo: '[pl] Company info',
        companyInfoDescription: '[pl] We need a few more details before you can send your first invoice.',
        yourCompanyName: '[pl] Your company name',
        yourCompanyWebsite: '[pl] Your company website',
        yourCompanyWebsiteNote: "[pl] If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: '[pl] You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: '[pl] You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '[pl] 1 expense',
                other: (count: number) => `[pl] ${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: '[pl] Delete expense',
            other: '[pl] Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: '[pl] Are you sure that you want to delete this expense?',
            other: '[pl] Are you sure that you want to delete these expenses?',
        }),
        deleteReport: () => ({
            one: '[pl] Delete report',
            other: '[pl] Delete reports',
        }),
        deleteReportConfirmation: () => ({
            one: '[pl] Are you sure that you want to delete this report?',
            other: '[pl] Are you sure that you want to delete these reports?',
        }),
        settledExpensify: '[pl] Paid',
        done: '[pl] Done',
        deleted: '[pl] Deleted',
        settledElsewhere: '[pl] Paid elsewhere',
        individual: '[pl] Individual',
        business: '[pl] Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `[pl] Pay ${formattedAmount} as an individual` : `[pl] Pay with personal account`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `[pl] Pay ${formattedAmount} with wallet` : `[pl] Pay with wallet`),
        settlePayment: (formattedAmount: string) => `[pl] Pay ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `[pl] Pay ${formattedAmount} as a business` : `[pl] Pay with business account`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `[pl] Mark ${formattedAmount} as paid` : `[pl] Mark as paid`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `[pl] paid ${amount} with personal account ${last4Digits}` : `[pl] Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `[pl] paid ${amount} with business account ${last4Digits}` : `[pl] Paid with business account`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `[pl] Pay ${formattedAmount} via ${policyName}` : `[pl] Pay via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `[pl] paid ${amount} with bank account ${last4Digits}` : `[pl] paid with bank account ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `[pl] paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `[pl] Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `[pl] Business Account • ${lastFour}`,
        nextStep: '[pl] Next steps',
        finished: '[pl] Finished',
        flip: '[pl] Flip',
        sendInvoice: (amount: string) => `[pl] Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `[pl]  for ${comment}` : ''}`,
        submitted: (memo?: string) => `[pl] submitted${memo ? `[pl] , saying ${memo}` : ''}`,
        automaticallySubmitted: `[pl] submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: '[pl] queued to submit via custom approval workflow',
        failedToAutoSubmitViaDEW: (reason: string) => `[pl] failed to submit the report via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `[pl] failed to submit the report. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `[pl] failed to approve via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `[pl] failed to approve. ${reason}`,
        queuedToApproveViaDEW: '[pl] queued to approve via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `[pl] tracking ${formattedAmount}${comment ? `[pl]  for ${comment}` : ''}`,
        splitAmount: (amount: string) => `[pl] split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `[pl] split ${formattedAmount}${comment ? `[pl]  for ${comment}` : ''}`,
        yourSplit: (amount: string) => `[pl] Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `[pl] ${payer} owes ${amount}${comment ? `[pl]  for ${comment}` : ''}`,
        payerOwes: (payer: string) => `[pl] ${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `[pl] ${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: (payer: string) => `[pl] ${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `[pl] ${payer} spent ${amount}`,
        payerSpent: (payer: string) => `[pl] ${payer} spent: `,
        managerApproved: (manager: string) => `[pl] ${manager} approved:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `[pl] ${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `[pl] paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `[pl] paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `[pl] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `[pl] approved ${amount}`,
        approvedMessage: `[pl] approved`,
        unapproved: `[pl] unapproved`,
        automaticallyForwarded: `[pl] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `[pl] approved`,
        rejectedThisReport: '[pl] rejected',
        waitingOnBankAccount: (submitterDisplayName: string) => `[pl] started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: '[pl] canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `[pl] canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `[pl] ${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `[pl] ${payer ? `${payer} ` : ''}marked as paid${comment ? `[pl] , saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `[pl] ${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `[pl] ${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        reimbursedThisReport: '[pl] reimbursed this report',
        paidThisBill: '[pl] paid this bill',
        reimbursedOnBehalfOf: (actor: string) => `[pl] on behalf of ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `[pl] from the bank account ending in ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `[pl] ${submitter} added a bank account, taking report off hold. Reimbursement is initiated`,
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
                ? `[pl] . Money is on its way to your${creditBankAccount ? `[pl]  bank account ending in ${creditBankAccount}` : '[pl]  account'}. Reimbursement estimated to complete on ${expectedDate}.`
                : `[pl] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[pl]  bank account ending in ${creditBankAccount}` : '[pl]  account'}. Reimbursement estimated to complete on ${expectedDate}.`,
        reimbursedWithCheck: '[pl]  via check.',
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
            const paymentMethod = isCard ? '[pl] card' : '[pl] bank account';
            return isCurrentUser
                ? `[pl] . Money is on its way to your${creditBankAccount ? `[pl]  bank account ending in ${creditBankAccount}` : '[pl]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`
                : `[pl] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[pl]  bank account ending in ${creditBankAccount}` : '[pl]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `[pl]  with direct deposit (ACH)${creditBankAccount ? `[pl]  to the bank account ending in ${creditBankAccount}. ` : '. '}${expectedDate ? `[pl] The reimbursement is estimated to complete by ${expectedDate}.` : '[pl] This generally takes 4-5 business days.'}`,
        noReimbursableExpenses: '[pl] This report has an invalid amount',
        pendingConversionMessage: "[pl] Total will update when you're back online",
        changedTheExpense: '[pl] changed the expense',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `[pl] the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `[pl] set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `[pl] the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `[pl] the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `[pl] changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: '[pl] based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `[pl] based on <a href="${rulesLink}">workspace rules</a>` : '[pl] based on workspace rule'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `[pl] for ${comment}` : '[pl] expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `[pl] Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `[pl] ${formattedAmount} sent${comment ? `[pl]  for ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) => `[pl] moved expense from personal space to ${workspaceName ?? `[pl] chat with ${reportName}`}`,
        movedToPersonalSpace: '[pl] moved expense to personal space',
        error: {
            invalidCategoryLength: '[pl] The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: '[pl] The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: '[pl] Please enter a valid amount before continuing',
            invalidDistance: '[pl] Please enter a valid distance before continuing',
            invalidReadings: '[pl] Please enter both start and end readings',
            negativeDistanceNotAllowed: '[pl] End reading must be greater than start reading',
            distanceAmountTooLarge: '[pl] The total amount is too large. Reduce the distance or lower the rate.',
            distanceAmountTooLargeReduceDistance: '[pl] The total amount is too large. Reduce the distance.',
            distanceAmountTooLargeReduceRate: '[pl] The total amount is too large. Lower the rate.',
            odometerReadingTooLarge: (formattedMax: string) => `[pl] Odometer readings cannot exceed ${formattedMax}.`,
            stitchOdometerImagesFailed: '[pl] Failed to combine odometer images. Please try again later.',
            invalidIntegerAmount: '[pl] Please enter a whole dollar amount before continuing',
            invalidTaxAmount: (amount: string) => `[pl] Maximum tax amount is ${amount}`,
            invalidSplit: '[pl] The sum of splits must equal the total amount',
            invalidSplitParticipants: '[pl] Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: '[pl] Please enter a non-zero amount for your split',
            noParticipantSelected: '[pl] Please select a participant',
            other: '[pl] Unexpected error. Please try again later.',
            genericCreateFailureMessage: '[pl] Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: '[pl] Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: '[pl] Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: '[pl] Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: '[pl] Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '[pl] <rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: '[pl] There was an error uploading your receipt.',
            genericDeleteFailureMessage: '[pl] Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: '[pl] Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: '[pl] Transaction is missing fields',
            duplicateWaypointsErrorMessage: '[pl] Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: '[pl] Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: '[pl] An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: '[pl] Please enter a valid merchant',
            atLeastOneAttendee: '[pl] At least one attendee must be selected',
            invalidQuantity: '[pl] Please enter a valid quantity',
            quantityGreaterThanZero: '[pl] Quantity must be greater than zero',
            invalidSubrateLength: '[pl] There must be at least one subrate',
            invalidRate: '[pl] Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "[pl] The end date can't be before the start date",
            endDateSameAsStartDate: "[pl] The end date can't be the same as the start date",
            manySplitsProvided: `[pl] The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `[pl] The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
        },
        dismissReceiptError: '[pl] Dismiss error',
        dismissReceiptErrorConfirmation: '[pl] Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `[pl] started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: '[pl] Enable wallet',
        hold: '[pl] Hold',
        unhold: '[pl] Remove hold',
        holdExpense: () => ({
            one: '[pl] Hold expense',
            other: '[pl] Hold expenses',
        }),
        unholdExpense: '[pl] Unhold expense',
        heldExpense: '[pl] held this expense',
        unheldExpense: '[pl] unheld this expense',
        moveUnreportedExpense: '[pl] Move unreported expense',
        addUnreportedExpense: '[pl] Add unreported expense',
        selectUnreportedExpense: '[pl] Select at least one expense to add to the report.',
        emptyStateUnreportedExpenseTitle: '[pl] No unreported expenses',
        emptyStateUnreportedExpenseSubtitle: '[pl] Looks like you don’t have any unreported expenses. Try creating one below.',
        addUnreportedExpenseConfirm: '[pl] Add to report',
        newReport: '[pl] New report',
        explainHold: () => ({
            one: "[pl] Explain why you're holding this expense.",
            other: "[pl] Explain why you're holding these expenses.",
        }),
        explainHoldApprover: () => ({
            one: '[pl] Explain what you need before approving this expense.',
            other: '[pl] Explain what you need before approving these expenses.',
        }),
        retracted: '[pl] retracted',
        retract: '[pl] Retract',
        reopened: '[pl] reopened',
        reopenReport: '[pl] Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `[pl] This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: '[pl] Reason',
        holdReasonRequired: '[pl] A reason is required when holding.',
        expenseWasPutOnHold: '[pl] Expense was put on hold',
        expenseOnHold: '[pl] This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: '[pl] All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: '[pl] This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: '[pl] Some of these duplicates have been approved or paid already.',
        reviewDuplicates: '[pl] Review duplicates',
        keepAll: '[pl] Keep all',
        noDuplicatesTitle: '[pl] All set!',
        noDuplicatesDescription: '[pl] There are no duplicate transactions for review here.',
        confirmApprove: '[pl] Confirm approval amount',
        confirmApprovalAmount: '[pl] Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: '[pl] This expense is on hold. Do you want to approve anyway?',
            other: '[pl] These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: '[pl] Confirm payment amount',
        confirmPayAmount: "[pl] Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: '[pl] This expense is on hold. Do you want to pay anyway?',
            other: '[pl] These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: '[pl] Pay only',
        approveOnly: '[pl] Approve only',
        holdEducationalTitle: '[pl] Should you hold this expense?',
        whatIsHoldExplain: "[pl] Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: '[pl] Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "[pl] Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: '[pl] You moved this report!',
            description: '[pl] Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '[pl] <strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: '[pl] This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: '[pl] Change workspace',
        set: '[pl] set',
        changed: '[pl] changed',
        removed: '[pl] removed',
        transactionPending: '[pl] Transaction pending.',
        chooseARate: '[pl] Select a workspace reimbursement rate per mile or kilometer',
        unapprove: '[pl] Unapprove',
        unapproveReport: '[pl] Unapprove report',
        headsUp: '[pl] Heads up!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `[pl] This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: '[pl] reimbursable',
        nonReimbursable: '[pl] non-reimbursable',
        bookingPending: '[pl] This booking is pending',
        bookingPendingDescription: "[pl] This booking is pending because it hasn't been paid yet.",
        bookingArchived: '[pl] This booking is archived',
        bookingArchivedDescription: '[pl] This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: '[pl] Attendees',
        totalPerAttendee: '[pl] Per attendee',
        whoIsYourAccountant: '[pl] Who is your accountant?',
        paymentComplete: '[pl] Payment complete',
        time: '[pl] Time',
        startDate: '[pl] Start date',
        endDate: '[pl] End date',
        startTime: '[pl] Start time',
        endTime: '[pl] End time',
        deleteSubrate: '[pl] Delete subrate',
        deleteSubrateConfirmation: '[pl] Are you sure you want to delete this subrate?',
        quantity: '[pl] Quantity',
        subrateSelection: '[pl] Select a subrate and enter a quantity.',
        qty: '[pl] Qty',
        firstDayText: () => ({
            one: `[pl] First day: 1 hour`,
            other: (count: number) => `[pl] First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `[pl] Last day: 1 hour`,
            other: (count: number) => `[pl] Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `[pl] Trip: 1 full day`,
            other: (count: number) => `[pl] Trip: ${count} full days`,
        }),
        dates: '[pl] Dates',
        rates: '[pl] Rates',
        submitsTo: (name: string) => `[pl] Submits to ${name}`,
        reject: {
            educationalTitle: '[pl] Should you hold or reject?',
            educationalText: "[pl] If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: '[pl] Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: '[pl] Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: '[pl] Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "[pl] Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: '[pl] Reject expense',
            reasonPageDescription: '[pl] Explain why you will not approve this expense.',
            rejectReason: '[pl] Rejection reason',
            markAsResolved: '[pl] Mark as resolved',
            rejectedStatus: '[pl] This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: '[pl] rejected this expense',
                markedAsResolved: '[pl] marked the rejection reason as resolved',
            },
        },
        rejectReport: {
            title: '[pl] Reject report',
            description: '[pl] Explain why you will not approve this report:',
            rejectReason: '[pl] Rejection reason',
            selectTarget: '[pl] Choose the member to reject this report back to for review:',
            lastApprover: '[pl] Last approver',
            submitter: '[pl] Submitter',
            rejectedReportMessage: '[pl] This report was rejected.',
            rejectedNextStep: '[pl] This report was rejected. Waiting on you to fix the issues and manually resubmit.',
            selectMemberError: '[pl] Select a member to reject this report back to.',
            couldNotReject: '[pl] The report could not be rejected. Please try again.',
        },
        moveExpenses: '[pl] Move to report',
        moveExpensesError: "[pl] You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: '[pl] Change approver',
            header: (workflowSettingLink: string) =>
                `[pl] Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `[pl] changed the approver to <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '[pl] Add approver',
                addApproverSubtitle: '[pl] Add an additional approver to the existing workflow.',
                bypassApprovers: '[pl] Bypass approvers',
                bypassApproversSubtitle: '[pl] Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: '[pl] Choose an additional approver for this report before we route through the rest of the approval workflow.',
                bulkSubtitle: '[pl] Choose an additional approver for these reports before we route through the rest of the approval workflow.',
            },
            bulkSubtitle: '[pl] Choose an option to change the approver for these reports.',
        },
        chooseWorkspace: '[pl] Choose a workspace',
        routedDueToDEW: (to: string, reason?: string) => `[pl] report routed to ${to}${reason ? `[pl]  because ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `[pl] ${hours} ${hours === 1 ? '[pl] hour' : '[pl] hours'} @ ${rate} / hour`,
            hrs: '[pl] hrs',
            hours: '[pl] Hours',
            ratePreview: (rate: string) => `[pl] ${rate} / hour`,
            amountTooLargeError: '[pl] The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctRateError: '[pl] Fix the rate error and try again.',
        AskToExplain: `[pl] . <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explain<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '[pl] marked the expense as "reimbursable"' : '[pl] marked the expense as "non-reimbursable"'),
            billable: (value: boolean) => (value ? '[pl] marked the expense as "billable"' : '[pl] marked the expense as "non-billable"'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `[pl] set the tax rate to "${value}"` : `[pl] tax rate to "${value}"`),
            reportName: (value: string) => `[pl] moved this expense to report "${value}"`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `[pl] set the ${field} to "${value}"` : `[pl] ${field} to "${value}"`;
            },
            formatPersonalRules: (fragments: string, route: string) => `[pl] ${fragments} via <a href="${route}">personal expense rules</a>`,
            formatPolicyRules: (fragments: string, route: string) => `[pl] ${fragments} via <a href="${route}">workspace rules</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: "[pl] You can't duplicate per diem expenses across workspaces because the rates may differ between workspaces.",
        cannotDuplicateDistanceExpense: "[pl] You can't duplicate distance expenses across workspaces because the rates may differ between workspaces.",
        taxDisabledAlert: {
            title: '[pl] Tax disabled',
            prompt: '[pl] Enable tax tracking on the workspace to edit the expense details or delete the tax from this expense.',
            confirmText: '[pl] Delete tax',
        },
    },
    transactionMerge: {
        listPage: {
            header: '[pl] Merge expenses',
            noEligibleExpenseFound: '[pl] No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `[pl] <muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `[pl] Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '[pl] Select receipt',
            pageTitle: '[pl] Select the receipt you want to keep:',
        },
        detailsPage: {
            header: '[pl] Select details',
            pageTitle: '[pl] Select the details you want to keep:',
            noDifferences: '[pl] No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '[pl] an' : '[pl] a';
                return `[pl] Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: '[pl] Please select attendees',
            selectAllDetailsError: '[pl] Select all details before continuing.',
        },
        confirmationPage: {
            header: '[pl] Confirm details',
            pageTitle: "[pl] Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: '[pl] Merge expenses',
        },
    },
    share: {
        shareToExpensify: '[pl] Share to Expensify',
        messageInputLabel: '[pl] Message',
    },
    notificationPreferencesPage: {
        header: '[pl] Notification preferences',
        label: '[pl] Notify me about new messages',
        notificationPreferences: {
            always: '[pl] Immediately',
            daily: '[pl] Daily',
            mute: '[pl] Mute',
            hidden: '[pl][ctx: UI label indicating that something is concealed or not visible to the user.] Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "[pl] The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "[pl] The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: '[pl] Upload photo',
        removePhoto: '[pl] Remove photo',
        editImage: '[pl] Edit photo',
        viewPhoto: '[pl] View photo',
        imageUploadFailed: '[pl] Image upload failed',
        deleteWorkspaceError: '[pl] Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `[pl] The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `[pl] Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `[pl] Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: '[pl] Edit profile picture',
        upload: '[pl] Upload',
        uploadPhoto: '[pl] Upload photo',
        selectAvatar: '[pl] Select avatar',
        choosePresetAvatar: '[pl] Or choose a custom avatar',
    },
    modal: {
        backdropLabel: '[pl] Modal Backdrop',
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
                        return `[pl] Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] Waiting for an admin to add expenses.`;
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
                        return `[pl] Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] Waiting for an admin to submit expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `[pl] No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[pl] Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] Waiting for an admin to add a bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[pl]  on the ${eta} of each month` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[pl] Waiting for your expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] Waiting for an admin's expenses to automatically submit${formattedETA}.`;
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
                        return `[pl] Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] Waiting for an admin to fix the issues.`;
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
                        return `[pl] Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] Waiting for an admin to approve expenses.`;
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
                        return `[pl] Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] Waiting for an admin to export this report.`;
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
                        return `[pl] Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] Waiting for an admin to pay expenses.`;
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
                        return `[pl] Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] Waiting for an admin to finish setting up a business bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[pl]  by ${eta}` : ` ${eta}`;
                }
                return `[pl] Waiting for payment to complete${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `[pl] Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[pl] This report was rejected. Waiting on <strong>you</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pl] This report was rejected. Waiting on <strong>${actor}</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pl] This report was rejected. Waiting on an admin to fix the issues and manually resubmit.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '[pl] shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '[pl] later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '[pl] on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '[pl] on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '[pl] on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '[pl] on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '[pl] at the end of your trip',
        },
    },
    profilePage: {
        profile: '[pl] Profile',
        preferredPronouns: '[pl] Preferred pronouns',
        selectYourPronouns: '[pl] Select your pronouns',
        selfSelectYourPronoun: '[pl] Self-select your pronoun',
        emailAddress: '[pl] Email address',
        setMyTimezoneAutomatically: '[pl] Set my timezone automatically',
        timezone: '[pl] Timezone',
        invalidFileMessage: '[pl] Invalid file. Please try a different image.',
        avatarUploadFailureMessage: '[pl] An error occurred uploading the avatar. Please try again.',
        online: '[pl] Online',
        offline: '[pl] Offline',
        syncing: '[pl] Syncing',
        profileAvatar: '[pl] Profile avatar',
        publicSection: {
            title: '[pl] Public',
            subtitle: '[pl] These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: '[pl] Private',
            subtitle: "[pl] These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: '[pl] Security options',
        subtitle: '[pl] Enable two-factor authentication to keep your account safe.',
        goToSecurity: '[pl] Go back to security page',
    },
    shareCodePage: {
        title: '[pl] Your code',
        subtitle: '[pl] Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: '[pl] Pronouns',
        isShownOnProfile: '[pl] Your pronouns are shown on your profile.',
        placeholderText: '[pl] Search to see options',
    },
    contacts: {
        contactMethods: '[pl] Contact methods',
        featureRequiresValidate: '[pl] This feature requires you to validate your account.',
        validateAccount: '[pl] Validate your account',
        helpText: ({email}: {email: string}) =>
            `[pl] Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: '[pl] Please verify this contact method.',
        getInTouch: "[pl] We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `[pl] Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '[pl] Set as default',
        yourDefaultContactMethod: "[pl] This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        yourDefaultContactMethodRestrictedSwitch: '[pl] This is your current default contact method. Your company has restricted removing or changing it.',
        removeContactMethod: '[pl] Remove contact method',
        removeAreYouSure: "[pl] Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: '[pl] Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: '[pl] Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: '[pl] Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: '[pl] Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: '[pl] Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: '[pl] Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: '[pl] This contact method already exists',
            passwordRequired: '[pl] password required.',
            contactMethodRequired: '[pl] Contact method is required',
            invalidContactMethod: '[pl] Invalid contact method',
        },
        newContactMethod: '[pl] New contact method',
        goBackContactMethods: '[pl] Go back to contact methods',
    },
    pronouns: {
        coCos: '[pl] Co / Cos',
        eEyEmEir: '[pl] E / Ey / Em / Eir',
        faeFaer: '[pl] Fae / Faer',
        heHimHis: '[pl] He / Him / His',
        heHimHisTheyThemTheirs: '[pl] He / Him / His / They / Them / Theirs',
        sheHerHers: '[pl] She / Her / Hers',
        sheHerHersTheyThemTheirs: '[pl] She / Her / Hers / They / Them / Theirs',
        merMers: '[pl] Mer / Mers',
        neNirNirs: '[pl] Ne / Nir / Nirs',
        neeNerNers: '[pl] Nee / Ner / Ners',
        perPers: '[pl] Per / Pers',
        theyThemTheirs: '[pl] They / Them / Theirs',
        thonThons: '[pl] Thon / Thons',
        veVerVis: '[pl] Ve / Ver / Vis',
        viVir: '[pl] Vi / Vir',
        xeXemXyr: '[pl] Xe / Xem / Xyr',
        zeZieZirHir: '[pl] Ze / Zie / Zir / Hir',
        zeHirHirs: '[pl] Ze / Hir',
        callMeByMyName: '[pl] Call me by my name',
    },
    displayNamePage: {
        headerTitle: '[pl] Display name',
        isShownOnProfile: '[pl] Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: '[pl] Timezone',
        isShownOnProfile: '[pl] Your timezone is shown on your profile.',
        getLocationAutomatically: '[pl] Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: '[pl] Update required',
        pleaseInstall: '[pl] Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: '[pl] Please install the latest version of Expensify',
        toGetLatestChanges: '[pl] For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: '[pl] The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: '[pl] About',
        aboutPage: {
            description: '[pl] The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: '[pl] App download links',
            viewKeyboardShortcuts: '[pl] View keyboard shortcuts',
            viewTheCode: '[pl] View the code',
            viewOpenJobs: '[pl] View open jobs',
            reportABug: '[pl] Report a bug',
            troubleshoot: '[pl] Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: '[pl] Android',
            },
            ios: {
                label: '[pl] iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '[pl] Clear cache and restart',
            description:
                '[pl] <muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: '[pl] All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: '[pl] Reset and refresh',
            clientSideLogging: '[pl] Client side logging',
            noLogsToShare: '[pl] No logs to share',
            useProfiling: '[pl] Use profiling',
            profileTrace: '[pl] Profile trace',
            results: '[pl] Results',
            releaseOptions: '[pl] Release options',
            testingPreferences: '[pl] Testing preferences',
            useStagingServer: '[pl] Use Staging Server',
            forceOffline: '[pl] Force offline',
            simulatePoorConnection: '[pl] Simulate poor internet connection',
            simulateFailingNetworkRequests: '[pl] Simulate failing network requests',
            authenticationStatus: '[pl] Authentication status',
            deviceCredentials: '[pl] Device credentials',
            invalidate: '[pl] Invalidate',
            destroy: '[pl] Destroy',
            maskExportOnyxStateData: '[pl] Mask fragile member data while exporting Onyx state',
            exportOnyxState: '[pl] Export Onyx state',
            importOnyxState: '[pl] Import Onyx state',
            testCrash: '[pl] Test crash',
            resetToOriginalState: '[pl] Reset to original state',
            usingImportedState: '[pl] You are using imported state. Press here to clear it.',
            debugMode: '[pl] Debug mode',
            invalidFile: '[pl] Invalid file',
            invalidFileDescription: '[pl] The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: '[pl] Invalidate with delay',
            leftHandNavCache: '[pl] Left Hand Nav cache',
            clearleftHandNavCache: '[pl] Clear',
            softKillTheApp: '[pl] Soft kill the app',
            kill: '[pl] Kill',
            sentryDebug: '[pl] Sentry debug',
            sentrySendDescription: '[pl] Send data to Sentry',
            sentryDebugDescription: '[pl] Log Sentry requests to console',
            sentryHighlightedSpanOps: '[pl] Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: '[pl] ui.interaction.click, navigation, ui.load',
        },
        security: '[pl] Security',
        signOut: '[pl] Sign out',
        restoreStashed: '[pl] Restore stashed login',
        signOutConfirmationText: "[pl] You'll lose any offline changes if you sign out.",
        versionLetter: '[pl] v',
        readTheTermsAndPrivacy: `[pl] Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.`,
        help: '[pl] Help',
        helpPage: {
            title: '[pl] Help and support',
            description: '[pl] We are here to help you 24/7',
            helpSite: '[pl] Help site',
            conciergeChat: '[pl] Concierge',
            conciergeChatDescription: '[pl] Your personal AI agent',
            accountManagerDescription: '[pl] Your account manager',
            partnerManagerDescription: '[pl] Your partner manager',
            guideDescription: '[pl] Your setup specialist',
        },
        whatIsNew: "[pl] What's new",
        accountSettings: '[pl] Account settings',
        account: '[pl] Account',
        general: '[pl] General',
    },
    closeAccountPage: {
        closeAccount: '[pl][ctx: close as a verb, not an adjective] Close account',
        reasonForLeavingPrompt: '[pl] We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: '[pl] Enter message here',
        closeAccountWarning: '[pl] Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: '[pl] Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: '[pl] Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: '[pl] Enter your default contact method',
        defaultContact: '[pl] Default contact method:',
        enterYourDefaultContactMethod: '[pl] Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: '[pl] Merge accounts',
        accountDetails: {
            accountToMergeInto: (login: string) => `[pl] Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: '[pl] I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: '[pl] Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: (login: string) => `[pl] Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `[pl] To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: '[pl] Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: '[pl] Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: '[pl] Accounts merged!',
            description: (from: string, to: string) =>
                `[pl] <muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '[pl] We’re working on it',
            limitedSupport: '[pl] We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp: '[pl] <muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: '[pl] Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `[pl] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `[pl] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `[pl] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: '[pl] Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `[pl] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `[pl] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `[pl] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `[pl] <muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '[pl] Try again later',
            description: '[pl] There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "[pl] You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: '[pl] You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: '[pl] Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '[pl] Report suspicious activity',
        lockAccount: '[pl] Lock account',
        unlockAccount: '[pl] Unlock account',
        unlockTitle: '[pl] We’ve received your request',
        unlockDescription: '[pl] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        compromisedDescription:
            '[pl] Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: '[pl] For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: '[pl] Are you sure you want to lock your Expensify account?',
        onceLocked: '[pl] Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '[pl] Failed to lock account',
        failedToLockAccountDescription: `[pl] We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: '[pl] Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: '[pl] Account locked',
        yourAccountIsLocked: '[pl] Your account is locked',
        chatToConciergeToUnlock: '[pl] Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: '[pl] Chat with Concierge',
    },
    twoFactorAuth: {
        headerTitle: '[pl] Two-factor authentication',
        twoFactorAuthEnabled: '[pl] Two-factor authentication enabled',
        whatIsTwoFactorAuth: '[pl] Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: '[pl] Disable two-factor authentication',
        explainProcessToRemove: '[pl] To disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: '[pl] To disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: '[pl] Two-factor authentication is now disabled',
        noAuthenticatorApp: '[pl] You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: '[pl] Recovery codes',
        keepCodesSafe: '[pl] Keep these recovery codes safe!',
        codesLoseAccess: dedent(`
            [pl] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            Note: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        errorStepCodes: '[pl] Please copy or download codes before continuing',
        stepVerify: '[pl] Verify',
        scanCode: '[pl] Scan the QR code using your',
        authenticatorApp: '[pl] authenticator app',
        addKey: '[pl] Or add this secret key to your authenticator app:',
        secretKey: '[pl] secret key',
        enterCode: '[pl] Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: '[pl] Finished',
        enabled: '[pl] Two-factor authentication enabled',
        congrats: '[pl] Congrats! Now you’ve got that extra security.',
        copy: '[pl] Copy',
        disable: '[pl] Disable',
        enableTwoFactorAuth: '[pl] Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: '[pl] Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: '[pl] For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: '[pl] Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: '[pl] Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: '[pl] Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: '[pl] Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: '[pl] Cannot disable 2FA',
        twoFactorAuthRequired: '[pl] Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
        replaceDevice: '[pl] Replace device',
        replaceDeviceTitle: '[pl] Replace two-factor device',
        verifyOldDeviceTitle: '[pl] Verify old device',
        verifyOldDeviceDescription: '[pl] Enter the six-digit code from your current authenticator app to confirm you have access to it.',
        verifyNewDeviceTitle: '[pl] Set up new device',
        verifyNewDeviceDescription: '[pl] Scan the QR code with your new device, then enter the code to complete setup.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '[pl] Please enter your recovery code',
            incorrectRecoveryCode: '[pl] Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: '[pl] Use recovery code',
        recoveryCode: '[pl] Recovery code',
        use2fa: '[pl] Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '[pl] Please enter your two-factor authentication code',
            incorrect2fa: '[pl] Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '[pl] Password updated!',
        allSet: '[pl] You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: '[pl] Private notes',
        personalNoteMessage: "[pl] Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: '[pl] Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: '[pl] Notes',
        myNote: '[pl] My note',
        error: {
            genericFailureMessage: "[pl] Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: '[pl] Please enter a valid security code',
        },
        securityCode: '[pl] Security code',
        changeBillingCurrency: '[pl] Change billing currency',
        changePaymentCurrency: '[pl] Change payment currency',
        paymentCurrency: '[pl] Payment currency',
        paymentCurrencyDescription: '[pl] Select a standardized currency that all personal expenses should be converted to',
        note: `[pl] Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: '[pl] Add a debit card',
        nameOnCard: '[pl] Name on card',
        debitCardNumber: '[pl] Debit card number',
        expiration: '[pl] Expiration date',
        expirationDate: '[pl] MMYY',
        cvv: '[pl] CVV',
        billingAddress: '[pl] Billing address',
        growlMessageOnSave: '[pl] Your debit card was successfully added',
        expensifyPassword: '[pl] Expensify password',
        error: {
            invalidName: '[pl] Name can only include letters',
            addressZipCode: '[pl] Please enter a valid zip code',
            debitCardNumber: '[pl] Please enter a valid debit card number',
            expirationDate: '[pl] Please select a valid expiration date',
            securityCode: '[pl] Please enter a valid security code',
            addressStreet: "[pl] Please enter a valid billing address that's not a PO box",
            addressState: '[pl] Please select a state',
            addressCity: '[pl] Please enter a city',
            genericFailureMessage: '[pl] An error occurred while adding your card. Please try again.',
            password: '[pl] Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '[pl] Add payment card',
        nameOnCard: '[pl] Name on card',
        paymentCardNumber: '[pl] Card number',
        expiration: '[pl] Expiration date',
        expirationDate: '[pl] MM/YY',
        cvv: '[pl] CVV',
        billingAddress: '[pl] Billing address',
        growlMessageOnSave: '[pl] Your payment card was successfully added',
        expensifyPassword: '[pl] Expensify password',
        error: {
            invalidName: '[pl] Name can only include letters',
            addressZipCode: '[pl] Please enter a valid zip code',
            paymentCardNumber: '[pl] Please enter a valid card number',
            expirationDate: '[pl] Please select a valid expiration date',
            securityCode: '[pl] Please enter a valid security code',
            addressStreet: "[pl] Please enter a valid billing address that's not a PO box",
            addressState: '[pl] Please select a state',
            addressCity: '[pl] Please enter a city',
            genericFailureMessage: '[pl] An error occurred while adding your card. Please try again.',
            password: '[pl] Please enter your Expensify password',
        },
    },
    personalCard: {
        addPersonalCard: '[pl] Add personal card',
        addCompanyCard: '[pl] Add company card',
        lookingForCompanyCards: '[pl] Need to add company cards?',
        lookingForCompanyCardsDescription: '[pl] Bring your own cards from 10,000+ banks worldwide.',
        personalCardAdded: '[pl] Personal card added!',
        personalCardAddedDescription: '[pl] Congrats, we’ll begin importing transactions from your card.',
        isPersonalCard: '[pl] Is this a personal card?',
        thisIsPersonalCard: '[pl] This is a personal card',
        thisIsCompanyCard: '[pl] This is a company card',
        askAdmin: '[pl] Ask your admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `[pl] If so, great! But if it's a <strong>company</strong> card, please ${isAdmin ? '[pl] assign it from your workspace instead.' : '[pl] ask your admin to assign it to you from the workspace instead.'}`,
        bankConnectionError: '[pl] Bank connection issue',
        bankConnectionDescription: '[pl] Please try adding your cards again. Otherwise, you can',
        connectWithPlaid: '[pl] connect via Plaid.',
        brokenConnection: '[pl] Your card connection is broken.',
        fixCard: '[pl] Fix card',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `[pl] Your ${cardName} card connection is broken. <a href="${connectionLink}">Log into your bank</a> to fix the card.`
                : `[pl] Your ${cardName} card connection is broken. Log into your bank to fix the card.`,
        addAdditionalCards: '[pl] Add additional cards',
        upgradeDescription: '[pl] Need to add more cards? Create a workspace to add additional personal cards or assign company cards to the entire team.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `[pl] <muted-text>This is available on the Collect plan, which is <strong>${formattedPrice}</strong> per member per month.</muted-text>`,
        note: (subscriptionLink: string) =>
            `[pl] <muted-text>Create a workspace to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
        workspaceCreated: '[pl] Workspace created',
        newWorkspace: '[pl] You created a workspace!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `[pl] <centered-text>You’re all set to add additional cards. <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
    },
    walletPage: {
        balance: '[pl] Balance',
        paymentMethodsTitle: '[pl] Payment methods',
        setDefaultConfirmation: '[pl] Make default payment method',
        setDefaultSuccess: '[pl] Default payment method set!',
        deleteAccount: '[pl] Delete account',
        deleteConfirmation: '[pl] Are you sure you want to delete this account?',
        deleteCard: '[pl] Delete card',
        deleteCardConfirmation:
            '[pl] All unsubmitted card transactions, including those on open reports, will be removed. Are you sure you want to delete this card? You cannot undo this action.',
        error: {
            notOwnerOfBankAccount: '[pl] An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: '[pl] This bank account is temporarily suspended',
            notOwnerOfFund: '[pl] An error occurred while setting this card as your default payment method',
            setDefaultFailure: '[pl] Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: '[pl] An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: '[pl] Get paid faster',
        addPaymentMethod: '[pl] Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: '[pl] Get paid back faster',
        secureAccessToYourMoney: '[pl] Secure access to your money',
        receiveMoney: '[pl] Receive money in your local currency',
        expensifyWallet: '[pl] Expensify Wallet (Beta)',
        sendAndReceiveMoney: '[pl] Send and receive money with friends. US bank accounts only.',
        enableWallet: '[pl] Enable wallet',
        addBankAccountToSendAndReceive: '[pl] Add a bank account to make or receive payments.',
        addDebitOrCreditCard: '[pl] Add debit or credit card',
        cardInactive: '[pl] Inactive',
        assignedCards: '[pl] Assigned cards',
        assignedCardsDescription: '[pl] Transactions from these cards sync automatically.',
        expensifyCard: '[pl] Expensify Card',
        walletActivationPending: "[pl] We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "[pl] Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: '[pl] Add your bank account',
        addBankAccountBody: "[pl] Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: '[pl] Choose your bank account',
        chooseAccountBody: '[pl] Make sure that you select the right one.',
        confirmYourBankAccount: '[pl] Confirm your bank account',
        personalBankAccounts: '[pl] Personal bank accounts',
        businessBankAccounts: '[pl] Business bank accounts',
        shareBankAccount: '[pl] Share bank account',
        bankAccountShared: '[pl] Bank account shared',
        shareBankAccountTitle: '[pl] Select the admins to share this bank account with:',
        shareBankAccountSuccess: '[pl] Bank account shared!',
        shareBankAccountSuccessDescription: '[pl] The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: '[pl] An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: '[pl] No admins available',
        shareBankAccountEmptyDescription: '[pl] There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: '[pl] Please select an admin before continuing',
        unshareBankAccount: '[pl] Unshare bank account',
        unshareBankAccountDescription: '[pl] Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `[pl] ${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: '[pl] It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: `[pl] Can't unshare bank account`,
        travelCVV: {
            title: '[pl] Travel CVV',
            subtitle: '[pl] Use this when booking travel',
            description: "[pl] Use this card for your Expensify Travel bookings. It'll show as “Travel Card” at checkout.",
        },
        chaseAccountNumberDifferent: '[pl] Why is my account number different?',
    },
    cardPage: {
        expensifyCard: '[pl] Expensify Card',
        expensifyTravelCard: '[pl] Expensify Travel Card',
        availableSpend: '[pl] Remaining limit',
        smartLimit: {
            name: '[pl] Smart limit',
            title: (formattedLimit: string) => `[pl] You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: '[pl] Fixed limit',
            title: (formattedLimit: string) => `[pl] You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: '[pl] Monthly limit',
            title: (formattedLimit: string) => `[pl] You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: '[pl] Virtual card number',
        travelCardCvv: '[pl] Travel card CVV',
        physicalCardNumber: '[pl] Physical card number',
        physicalCardPin: '[pl] PIN',
        getPhysicalCard: '[pl] Get physical card',
        reportFraud: '[pl] Report virtual card fraud',
        reportTravelFraud: '[pl] Report travel card fraud',
        reviewTransaction: '[pl] Review transaction',
        suspiciousBannerTitle: '[pl] Suspicious transaction',
        suspiciousBannerDescription: '[pl] We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "[pl] Your card is temporarily locked while our team reviews your company's account.",
        markTransactionsAsReimbursable: '[pl] Mark transactions as reimbursable',
        markTransactionsDescription: '[pl] When enabled, transactions imported from this card are marked as reimbursable by default.',
        csvCardDescription: '[pl] CSV Import',
        cardDetails: {
            cardNumber: '[pl] Virtual card number',
            expiration: '[pl] Expiration',
            cvv: '[pl] CVV',
            address: '[pl] Address',
            revealDetails: '[pl] Reveal details',
            revealCvv: '[pl] Reveal CVV',
            copyCardNumber: '[pl] Copy card number',
            updateAddress: '[pl] Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `[pl] Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: '[pl] An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "[pl] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[pl] Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        unexpectedError: '[pl] There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: '[pl] Yes, I do',
            reportFraudButtonText: "[pl] No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `[pl] cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `[pl] deactivated the card ending in ${cardLastFour}`,
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
            }) => `[pl] identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?

${amount} for ${merchant} - ${date}`,
        },
        setYourPin: '[pl] Set the PIN for your card.',
        confirmYourPin: '[pl] Enter your PIN again to confirm.',
        changeYourPin: '[pl] Enter a new PIN for your card.',
        confirmYourChangedPin: '[pl] Confirm your new PIN.',
        pinMustBeFourDigits: '[pl] PIN must be exactly 4 digits.',
        invalidPin: '[pl] Please choose a more secure PIN.',
        pinMismatch: '[pl] PINs do not match. Please try again.',
        revealPin: '[pl] Reveal PIN',
        hidePin: '[pl] Hide PIN',
        pin: '[pl] PIN',
        pinChanged: '[pl] PIN changed!',
        pinChangedHeader: '[pl] PIN changed',
        pinChangedDescription: "[pl] You're all set to use your PIN now.",
        changePin: '[pl] Change PIN',
        changePinAtATM: '[pl] Change your PIN at any ATM',
        changePinAtATMDescription: '[pl] This is required in your region. <concierge-link>Reach out to Concierge</concierge-link> if you have any questions.',
        freezeCard: '[pl] Freeze card',
        unfreeze: '[pl] Unfreeze',
        unfreezeCard: '[pl] Unfreeze card',
        askToUnfreeze: '[pl] Ask to unfreeze',
        freezeDescription: '[pl] A frozen card cannot be used for purchases and transactions. You can unfreeze it at any time.',
        unfreezeDescription: "[pl] Unfreezing this card will start allowing purchases and transactions again. Only proceed if you're sure the card is safe to use.",
        frozen: '[pl] Frozen',
        youFroze: ({date}: {date: string}) => `[pl] You froze this card on ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `[pl] ${person} froze this card on ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `[pl] This card was frozen on ${date} by `,
        frozenByAdminNeedsUnfreezePrefix: '[pl] This card was frozen by ',
        frozenByAdminNeedsUnfreezeSuffix: '[pl] . Please contact an admin to unfreeze it.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `[pl] This card was frozen by ${person}. Please contact an admin to unfreeze it.`,
    },
    workflowsPage: {
        workflowTitle: '[pl] Spend',
        workflowDescription: '[pl] Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: '[pl] Submissions',
        submissionFrequencyDescription: '[pl] Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: '[pl] Date of month',
        disableApprovalPromptDescription: '[pl] Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: '[pl] Approvals',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `[pl] expenses from ${members}, and the approver is ${approvers}`,
        addApprovalButton: '[pl] Add approval workflow',
        findWorkflow: '[pl] Find workflow',
        addApprovalTip: '[pl] This default workflow applies to all members, unless a more specific workflow exists.',
        approver: '[pl] Approver',
        addApprovalsDescription: '[pl] Require additional approval before authorizing a payment.',
        makeOrTrackPaymentsTitle: '[pl] Payments',
        makeOrTrackPaymentsDescription: '[pl] Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '[pl] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '[pl] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: '[pl] Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: '[pl] Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: '[pl] Instantly',
            weekly: '[pl] Weekly',
            monthly: '[pl] Monthly',
            twiceAMonth: '[pl] Twice a month',
            byTrip: '[pl] By trip',
            manually: '[pl] Manually',
            daily: '[pl] Daily',
            lastDayOfMonth: '[pl] Last day of the month',
            lastBusinessDayOfMonth: '[pl] Last business day of the month',
            ordinals: {
                one: '[pl] st',
                two: '[pl] nd',
                few: '[pl] rd',
                other: '[pl] th',
                '1': '[pl] First',
                '2': '[pl] Second',
                '3': '[pl] Third',
                '4': '[pl] Fourth',
                '5': '[pl] Fifth',
                '6': '[pl] Sixth',
                '7': '[pl] Seventh',
                '8': '[pl] Eighth',
                '9': '[pl] Ninth',
                '10': '[pl] Tenth',
            },
        },
        approverInMultipleWorkflows: '[pl] This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `[pl] <strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: '[pl] No members to display',
            expensesFromSubtitle: '[pl] All workspace members already belong to an existing approval workflow.',
            approverSubtitle: '[pl] All approvers belong to an existing workflow.',
            bulkApproverSubtitle: '[pl] No approvers match the criteria for selected reports.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "[pl] Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "[pl] Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: '[pl] Confirm',
        header: '[pl] Add more approvers and confirm.',
        additionalApprover: '[pl] Additional approver',
        submitButton: '[pl] Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: '[pl] Edit approval workflow',
        deleteTitle: '[pl] Delete approval workflow',
        deletePrompt: '[pl] Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: '[pl] Expenses from',
        header: '[pl] When the following members submit expenses:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "[pl] The approver couldn't be changed. Please try again or contact support.",
        title: '[pl] Set approver',
        description: '[pl] This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: '[pl] Approver',
        header: '[pl] (Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `[pl] Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : '[pl] Add another approver when a report exceeds the amount below:',
        reportAmountLabel: '[pl] Report amount',
        additionalApproverLabel: '[pl] Additional approver',
        skip: '[pl] Skip',
        next: '[pl] Next',
        removeLimit: '[pl] Remove limit',
        enterAmountError: '[pl] Please enter a valid amount',
        enterApproverError: '[pl] Approver is required when you set a report limit',
        enterBothError: '[pl] Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `[pl] Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: '[pl] Authorized payer',
        genericErrorMessage: '[pl] The authorized payer could not be changed. Please try again.',
        admins: '[pl] Admins',
        payer: '[pl] Payer',
        paymentAccount: '[pl] Payment account',
        shareBankAccount: {
            shareTitle: '[pl] Share bank account access?',
            shareDescription: ({admin}: {admin: string}) => `[pl] You'll need to share bank account access with ${admin} to make them the payer.`,
            validationTitle: '[pl] Bank account awaiting validation',
            validationDescription: ({admin}: {admin: string}) =>
                `[pl] You need to <a href="#">validate this bank account</a>. Once that's done, you can share bank account access with ${admin} to make them the payer.`,
            errorTitle: "[pl] Can't change payer",
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `[pl] ${admin} doesn't have access to this bank account, so you can't make them the payer. <a href="#">Chat with ${owner}</a> if the bank account should be shared.`,
        },
    },
    reportFraudPage: {
        title: '[pl] Report virtual card fraud',
        description: '[pl] If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: '[pl] Deactivate card',
        reportVirtualCardFraud: '[pl] Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: '[pl] Card fraud reported',
        description: '[pl] We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        buttonText: '[pl] Got it, thanks!',
    },
    activateCardPage: {
        activateCard: '[pl] Activate card',
        pleaseEnterLastFour: '[pl] Please enter the last four digits of your card.',
        activatePhysicalCard: '[pl] Activate physical card',
        error: {
            thatDidNotMatch: "[pl] That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "[pl] You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: '[pl] Get physical card',
        nameMessage: '[pl] Enter your first and last name, as this will be shown on your card.',
        legalName: '[pl] Legal name',
        legalFirstName: '[pl] Legal first name',
        legalLastName: '[pl] Legal last name',
        phoneMessage: '[pl] Enter your phone number.',
        phoneNumber: '[pl] Phone number',
        address: '[pl] Address',
        addressMessage: '[pl] Enter your shipping address.',
        streetAddress: '[pl] Street Address',
        city: '[pl] City',
        state: '[pl] State',
        zipPostcode: '[pl] Zip/Postcode',
        country: '[pl] Country',
        confirmMessage: '[pl] Please confirm your details below.',
        estimatedDeliveryMessage: '[pl] Your physical card will arrive in 2-3 business days.',
        next: '[pl] Next',
        getPhysicalCard: '[pl] Get physical card',
        shipCard: '[pl] Ship card',
    },
    transferAmountPage: {
        transfer: (amount: string) => `[pl] Transfer${amount ? ` ${amount}` : ''}`,
        instant: '[pl] Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `[pl] ${rate}% fee (${minAmount} minimum)`,
        ach: '[pl] 1-3 Business days (Bank account)',
        achSummary: '[pl] No fee',
        whichAccount: '[pl] Which account?',
        fee: '[pl] Fee',
        transferSuccess: '[pl] Transfer successful!',
        transferDetailBankAccount: '[pl] Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: '[pl] Your money should arrive immediately.',
        failedTransfer: '[pl] Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: '[pl] Please transfer your balance from the wallet page',
        goToWallet: '[pl] Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: '[pl] Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: '[pl] Add payment method',
        addNewDebitCard: '[pl] Add new debit card',
        addNewBankAccount: '[pl] Add new bank account',
        accountLastFour: '[pl] Ending in',
        cardLastFour: '[pl] Card ending in',
        addFirstPaymentMethod: '[pl] Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: '[pl] Default',
        bankAccountLastFour: (lastFour: string) => `[pl] Bank Account • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '[pl] Expense rules',
        subtitle: '[pl] These rules will apply to your expenses.',
        findRule: '[pl] Find rule',
        emptyRules: {
            title: "[pl] You haven't created any rules",
            subtitle: '[pl] Add a rule to automate expense reporting.',
        },
        changes: {
            billableUpdate: (value: boolean) => `[pl] Update expense ${value ? '[pl] billable' : '[pl] non-billable'}`,
            categoryUpdate: (value: string) => `[pl] Update category to "${value}"`,
            commentUpdate: (value: string) => `[pl] Update description to "${value}"`,
            merchantUpdate: (value: string) => `[pl] Update merchant to "${value}"`,
            reimbursableUpdate: (value: boolean) => `[pl] Update expense ${value ? '[pl] reimbursable' : '[pl] non-reimbursable'}`,
            tagUpdate: (value: string) => `[pl] Update tag to "${value}"`,
            taxUpdate: (value: string) => `[pl] Update tax rate to "${value}"`,
            billable: (value: boolean) => `[pl] expense ${value ? '[pl] billable' : '[pl] non-billable'}`,
            category: (value: string) => `[pl] category to "${value}"`,
            comment: (value: string) => `[pl] description to "${value}"`,
            merchant: (value: string) => `[pl] merchant to "${value}"`,
            reimbursable: (value: boolean) => `[pl] expense ${value ? '[pl] reimbursable' : '[pl] non-reimbursable'}`,
            tag: (value: string) => `[pl] tag to "${value}"`,
            tax: (value: string) => `[pl] tax rate to "${value}"`,
            report: (value: string) => `[pl] add to a report named "${value}"`,
        },
        newRule: '[pl] New rule',
        addRule: {
            title: '[pl] Add rule',
            expenseContains: '[pl] If expense contains:',
            applyUpdates: '[pl] Then apply these updates:',
            merchantHint: '[pl] Type . to create a rule that applies to all merchants',
            addToReport: '[pl] Add to a report named',
            createReport: '[pl] Create report if necessary',
            applyToExistingExpenses: '[pl] Apply to existing matching expenses',
            confirmError: '[pl] Enter merchant and apply at least one update',
            confirmErrorMerchant: '[pl] Please enter merchant',
            confirmErrorUpdate: '[pl] Please apply at least one update',
            saveRule: '[pl] Save rule',
        },
        editRule: {
            title: '[pl] Edit rule',
        },
        deleteRule: {
            deleteSingle: '[pl] Delete rule',
            deleteMultiple: '[pl] Delete rules',
            deleteSinglePrompt: '[pl] Are you sure you want to delete this rule?',
            deleteMultiplePrompt: '[pl] Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: '[pl] App preferences',
        },
        testSection: {
            title: '[pl] Test preferences',
            subtitle: '[pl] Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '[pl] Receive relevant feature updates and Expensify news',
        muteAllSounds: '[pl] Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: '[pl] Priority mode',
        explainerText: '[pl] Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: '[pl] Most recent',
                description: '[pl] Show all chats sorted by most recent',
            },
            gsd: {
                label: '[pl] #focus',
                description: '[pl] Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `[pl] in ${policyName}`,
        generatingPDF: '[pl] Generate PDF',
        waitForPDF: '[pl] Please wait while we generate the PDF.',
        errorPDF: '[pl] There was an error when trying to generate your PDF',
        successPDF: "[pl] Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: '[pl] Room description',
        roomDescriptionOptional: '[pl] Room description (optional)',
        explainerText: '[pl] Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: '[pl] Heads up!',
        lastMemberWarning: "[pl] Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: (displayName: string) => `[pl] ${displayName}'s group chat`,
    },
    languagePage: {
        language: '[pl] Language',
        aiGenerated: '[pl] The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: '[pl] Theme',
        themes: {
            dark: {
                label: '[pl] Dark',
            },
            light: {
                label: '[pl] Light',
            },
            system: {
                label: '[pl] Use device settings',
            },
        },
        highContrastMode: '[pl] High contrast mode',
        chooseThemeBelowOrSync: '[pl] Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `[pl] <muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `[pl] Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "[pl] Didn't receive a magic code?",
        enterAuthenticatorCode: '[pl] Please enter your authenticator code',
        enterRecoveryCode: '[pl] Please enter your recovery code',
        requiredWhen2FAEnabled: '[pl] Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `[pl] Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '[pl] Request a new code',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `[pl] Time remaining: ${timeRemaining} ${timeRemaining === 1 ? '[pl] second' : '[pl] seconds'}`,
        timeExpiredAnnouncement: '[pl] The time has expired',
        error: {
            pleaseFillMagicCode: '[pl] Please enter your magic code',
            incorrectMagicCode: '[pl] Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: '[pl] Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '[pl] Please fill out all fields',
        pleaseFillPassword: '[pl] Please enter your password',
        pleaseFillTwoFactorAuth: '[pl] Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: '[pl] Enter your two-factor authentication code to continue',
        forgot: '[pl] Forgot?',
        requiredWhen2FAEnabled: '[pl] Required when 2FA is enabled',
        error: {
            incorrectPassword: '[pl] Incorrect password. Please try again.',
            incorrectLoginOrPassword: '[pl] Incorrect login or password. Please try again.',
            incorrect2fa: '[pl] Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: '[pl] You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: '[pl] Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                '[pl] We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: '[pl] You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: '[pl] Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: '[pl] Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: '[pl] Phone or email',
        error: {
            invalidFormatEmailLogin: '[pl] The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "[pl] Couldn't retrieve account details. Please try to sign in again.",
        loginForm: '[pl] Login form',
        notYou: (user: string) => `[pl] Not ${user}?`,
    },
    onboarding: {
        welcome: '[pl] Welcome!',
        welcomeSignOffTitleManageTeam: '[pl] Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "[pl] It's great to meet you!",
        explanationModal: {
            title: '[pl] Welcome to Expensify',
            description: '[pl] One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: '[pl] To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: '[pl] Get started',
        whatsYourName: "[pl] What's your name?",
        peopleYouMayKnow: '[pl] People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: (domain: string, email: string) => `[pl] Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '[pl] Join a workspace',
        listOfWorkspaces: "[pl] Here's the list of workspaces you can join. Don't worry, you can always join them later if you prefer.",
        skipForNow: '[pl] Skip for now',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `[pl] ${employeeCount} member${employeeCount > 1 ? '[pl] s' : ''} • ${policyOwner}`,
        whereYouWork: '[pl] Where do you work?',
        errorSelection: '[pl] Select an option to move forward',
        purpose: {
            title: '[pl] What do you want to do today?',
            errorContinue: '[pl] Please press continue to get set up',
            errorBackButton: '[pl] Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '[pl] Get paid back by my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "[pl] Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '[pl] Track and budget expenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '[pl] Chat and split expenses with friends',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '[pl] Something else',
        },
        employees: {
            title: '[pl] How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL]: '[pl] 1-4 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM]: '[pl] 5-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '[pl] 1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '[pl] 11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '[pl] 51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '[pl] 101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '[pl] More than 1,000 employees',
        },
        accounting: {
            title: '[pl] Do you use any accounting software?',
            none: '[pl] None',
        },
        interestedFeatures: {
            title: '[pl] What features are you interested in?',
            featuresAlreadyEnabled: '[pl] Here are our most popular features:',
            featureYouMayBeInterestedIn: '[pl] Enable additional features:',
        },
        error: {
            requiredFirstName: '[pl] Please input your first name to continue',
        },
        workEmail: {
            title: '[pl] What’s your work email?',
            subtitle: '[pl] Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: '[pl] Forward to receipts@expensify.com for scanning',
                descriptionTwo: '[pl] Join your colleagues already using Expensify',
                descriptionThree: '[pl] Enjoy a more customized experience',
            },
            addWorkEmail: '[pl] Add work email',
        },
        workEmailValidation: {
            title: '[pl] Verify your work email',
            magicCodeSent: (workEmail: string | undefined) => `[pl] Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: '[pl] Please enter a valid work email from a private domain e.g. mitch@company.com',
            sameAsSignupEmail: '[pl] Please enter a different email than the one you signed up with',
            offline: '[pl] We couldn’t add your work email as you appear to be offline',
        },
        mergeBlockScreen: {
            title: '[pl] Couldn’t add work email',
            subtitle: (workEmail: string | undefined) => `[pl] We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[pl] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[pl] [Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[pl] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[pl] Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: '[pl] Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [pl] *Add expense approvals* to review your team's spend and keep it under control.

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
                title: ({workspaceConfirmationLink}) => `[pl] [Create](${workspaceConfirmationLink}) a workspace`,
                description: '[pl] Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[pl] Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [pl] *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[pl] Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        [pl] *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '[pl] Submit an expense',
                description: dedent(`
                    [pl] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: '[pl] Submit an expense',
                description: dedent(`
                    [pl] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: '[pl] Track an expense',
                description: dedent(`
                    [pl] *Track an expense* in any currency, whether you have a receipt or not.

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
                    `[pl] Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '[pl]  to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[pl] your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        [pl] Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[pl] your' : '[pl] to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        [Take me to accounting](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[pl] Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        [pl] Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[pl] Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [pl] *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[pl] Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        [pl] *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[pl] Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [pl] Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

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
                title: ({workspaceMembersLink}) => `[pl] Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [pl] *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: '[pl] Start a chat',
                description: dedent(`
                    [pl] *Start a chat* with anyone using their email or phone number.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },
            splitExpenseTask: {
                title: '[pl] Split an expense',
                description: dedent(`
                    [pl] *Split expenses* with one or more people.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[pl] Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [pl] Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: '[pl] Create your first report',
                description: dedent(`
                    [pl] Here's how to create a report:

                    1. Click the *+* button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[pl] Take a [test drive](${testDriveURL})` : '[pl] Take a test drive'),
            embeddedDemoIframeTitle: '[pl] Test Drive',
            employeeFakeReceipt: {
                description: '[pl] My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '[pl] Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: '[pl] Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        [pl] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        [pl] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage: '[pl] To make the most of your 30-day free trial, follow the remaining steps below:',
            onboardingChatSplitMessage: '[pl] Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "[pl] Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingTestDriveReceiverMessage: "[pl] *You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: '[pl] Stay organized with a workspace',
            subtitle: '[pl] Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: '[pl] Track and organize receipts',
                descriptionTwo: '[pl] Categorize and tag expenses',
                descriptionThree: '[pl] Create and share reports',
            },
            price: (price?: string) => `[pl] Try it free for 30 days, then upgrade for just <strong>${price ?? '$5'}/user/month</strong>.`,
            createWorkspace: '[pl] Create workspace',
        },
        confirmWorkspace: {
            title: '[pl] Confirm workspace',
            subtitle: '[pl] Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: '[pl] Invite members',
            subtitle: '[pl] Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "[pl] Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '[pl] Name cannot contain special characters',
            containsReservedWord: '[pl] Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: '[pl] Name cannot contain a comma or semicolon',
            requiredFirstName: '[pl] First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "[pl] What's your legal name?",
        enterDateOfBirth: "[pl] What's your date of birth?",
        enterAddress: "[pl] What's your address?",
        enterPhoneNumber: "[pl] What's your phone number?",
        personalDetails: '[pl] Personal details',
        privateDataMessage: '[pl] These details are used for travel and payments. They are never shown on your public profile.',
        legalName: '[pl] Legal name',
        legalFirstName: '[pl] Legal first name',
        legalLastName: '[pl] Legal last name',
        address: '[pl] Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `[pl] Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `[pl] Date should be after ${dateString}`,
            hasInvalidCharacter: '[pl] Name can only include Latin characters',
            cannotIncludeCommaOrSemicolon: '[pl] Name cannot contain a comma or semicolon',
            incorrectZipFormat: (zipFormat?: string) => `[pl] Incorrect zip code format${zipFormat ? `[pl]  Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `[pl] Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '[pl] Link has been re-sent',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `[pl] I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: '[pl] Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) => `[pl] To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `[pl] If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '[pl] Unlink',
        linkSent: '[pl] Link sent!',
        successfullyUnlinkedLogin: '[pl] Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) => `[pl] Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `[pl] <strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `[pl] <strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `[pl] Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: '[pl] Something went wrong...',
        subtitle: `[pl] We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: '[pl] Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `[pl] We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: '[pl] Your number has been validated! Click below to send a new magic sign-in code.',
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
                return '[pl] Please wait a moment before trying again.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '[pl] day' : '[pl] days'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '[pl] hour' : '[pl] hours'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '[pl] minute' : '[pl] minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `[pl] Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: '[pl] Join',
    },
    detailsPage: {
        localTime: '[pl] Local time',
    },
    newChatPage: {
        startGroup: '[pl] Start group',
        addToGroup: '[pl] Add to group',
        addUserToGroup: (username: string) => `[pl] Add ${username} to group`,
    },
    yearPickerPage: {
        year: '[pl] Year',
        selectYear: '[pl] Please select a year',
    },
    monthPickerPage: {
        month: '[pl] Month',
        selectMonth: '[pl] Please select a month',
    },
    focusModeUpdateModal: {
        title: '[pl] Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `[pl] Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '[pl] The chat you are looking for cannot be found.',
        getMeOutOfHere: '[pl] Get me out of here',
        iouReportNotFound: '[pl] The payment details you are looking for cannot be found.',
        notHere: "[pl] Hmm... it's not here",
        pageNotFound: '[pl] Oops, this page cannot be found',
        noAccess: '[pl] This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: '[pl] Go back to home page',
        commentYouLookingForCannotBeFound: '[pl] The comment you are looking for cannot be found.',
        goToChatInstead: '[pl] Go to the chat instead.',
        contactConcierge: '[pl] For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `[pl] Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: '[pl] Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "[pl] That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: '[pl] Status',
        statusExplanation: "[pl] Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: '[pl] Today',
        clearStatus: '[pl] Clear status',
        save: '[pl] Save',
        message: '[pl] Message',
        timePeriods: {
            never: '[pl] Never',
            thirtyMinutes: '[pl] 30 minutes',
            oneHour: '[pl] 1 hour',
            afterToday: '[pl] Today',
            afterWeek: '[pl] A week',
            custom: '[pl] Custom',
        },
        untilTomorrow: '[pl] Until tomorrow',
        untilTime: (time: string) => `[pl] Until ${time}`,
        date: '[pl] Date',
        time: '[pl] Time',
        clearAfter: '[pl] Clear after',
        whenClearStatus: '[pl] When should we clear your status?',
        setVacationDelegate: `[pl] Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        cannotSetVacationDelegate: `[pl] You can't set a vacation delegate because you're currently the delegate for the following members:`,
        vacationDelegateError: '[pl] There was an error updating your vacation delegate.',
        asVacationDelegate: (nameOrEmail: string) => `[pl] as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `[pl] to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `[pl] You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `[pl] Step ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '[pl] Bank info',
        confirmBankInfo: '[pl] Confirm bank info',
        manuallyAdd: '[pl] Manually add your bank account',
        letsDoubleCheck: "[pl] Let's double check that everything looks right.",
        accountEnding: '[pl] Account ending in',
        thisBankAccount: '[pl] This bank account will be used for business payments on your workspace',
        accountNumber: '[pl] Account number',
        routingNumber: '[pl] Routing number',
        chooseAnAccountBelow: '[pl] Choose an account below',
        addBankAccount: '[pl] Add bank account',
        chooseAnAccount: '[pl] Choose an account',
        connectOnlineWithPlaid: '[pl] Log into your bank',
        connectManually: '[pl] Connect manually',
        desktopConnection: '[pl] Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: '[pl] Your data is secure',
        toGetStarted: '[pl] Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: '[pl] Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: '[pl] Your routing number and account number can be found on a check for the account.',
        bankAccountPurposeTitle: '[pl] What do you want to do with your bank account?',
        getReimbursed: '[pl] Get reimbursed',
        getReimbursedDescription: '[pl] By employer or others',
        makePayments: '[pl] Make payments',
        makePaymentsDescription: '[pl] Pay expenses or issue Expensify Cards',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `[pl] To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: '[pl] An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: (workspaceRoute: string) =>
            `[pl] Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: '[pl] Business bank account added!',
        bbaAddedDescription: "[pl] It's ready to be used for payments.",
        lockedBankAccount: '[pl] Locked bank account',
        unlockBankAccount: '[pl] Unlock bank account',
        youCantPayThis: `[pl] You can't pay this report because you have a <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">locked bank account</a>. Tap below and Concierge will help with the next steps to unlock it.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `[pl] <h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `[pl] Expensify Business Bank Account ${maskedAccountNumber}
Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.`,
        error: {
            youNeedToSelectAnOption: '[pl] Please select an option to proceed',
            noBankAccountAvailable: "[pl] Sorry, there's no bank account available",
            noBankAccountSelected: '[pl] Please choose an account',
            taxID: '[pl] Please enter a valid tax ID number',
            website: '[pl] Please enter a valid website',
            zipCode: `[pl] Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '[pl] Please enter a valid phone number',
            email: '[pl] Please enter a valid email address',
            companyName: '[pl] Please enter a valid business name',
            addressCity: '[pl] Please enter a valid city',
            addressStreet: '[pl] Please enter a valid street address',
            addressState: '[pl] Please select a valid state',
            incorporationDateFuture: "[pl] Incorporation date can't be in the future",
            incorporationState: '[pl] Please select a valid state',
            industryCode: '[pl] Please enter a valid industry classification code with six digits',
            restrictedBusiness: "[pl] Please confirm the business isn't on the list of restricted businesses",
            routingNumber: '[pl] Please enter a valid routing number',
            accountNumber: '[pl] Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "[pl] Routing and account numbers can't match",
            companyType: '[pl] Please select a valid company type',
            tooManyAttempts: '[pl] Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: '[pl] Please enter a valid address',
            dob: '[pl] Please select a valid date of birth',
            age: '[pl] Must be over 18 years old',
            ssnLast4: '[pl] Please enter valid last 4 digits of SSN',
            firstName: '[pl] Please enter a valid first name',
            lastName: '[pl] Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: '[pl] Please add a default deposit account or debit card',
            validationAmounts: '[pl] The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: '[pl] Please enter a valid full name',
            ownershipPercentage: '[pl] Please enter a valid percentage number',
            deletePaymentBankAccount:
                "[pl] This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: '[pl] The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "[pl] Where's your bank account located?",
        accountDetailsStepHeader: '[pl] What are your account details?',
        accountTypeStepHeader: '[pl] What type of account is this?',
        bankInformationStepHeader: '[pl] What are your bank details?',
        accountHolderInformationStepHeader: '[pl] What are the account holder details?',
        howDoWeProtectYourData: '[pl] How do we protect your data?',
        currencyHeader: "[pl] What's your bank account's currency?",
        confirmationStepHeader: '[pl] Check your info.',
        confirmationStepSubHeader: '[pl] Double check the details below, and check the terms box to confirm.',
        toGetStarted: '[pl] Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
    },
    addPersonalBankAccountPage: {
        enterPassword: '[pl] Enter Expensify password',
        alreadyAdded: '[pl] This account has already been added.',
        chooseAccountLabel: '[pl] Account',
        successTitle: '[pl] Personal bank account added!',
        successMessage: '[pl] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: '[pl] Unknown filename',
        passwordRequired: '[pl] Please enter a password',
        passwordIncorrect: '[pl] Incorrect password. Please try again.',
        failedToLoadPDF: '[pl] Failed to load PDF file',
        pdfPasswordForm: {
            title: '[pl] Password protected PDF',
            infoText: '[pl] This PDF is password protected.',
            beforeLinkText: '[pl] Please',
            linkText: '[pl] enter the password',
            afterLinkText: '[pl] to view it.',
            formLabel: '[pl] View PDF',
        },
        attachmentNotFound: '[pl] Attachment not found',
        retry: '[pl] Retry',
    },
    messages: {
        errorMessageInvalidPhone: `[pl] Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '[pl] Invalid email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `[pl] ${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `[pl] ${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '[pl] By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: '[pl] Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `[pl] <muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: '[pl] Try again',
        verifyIdentity: '[pl] Verify identity',
        letsVerifyIdentity: "[pl] Let's verify your identity",
        butFirst: `[pl] But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '[pl] An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: '[pl] Enable camera access',
        cameraRequestMessage: '[pl] We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: '[pl] Enable microphone access',
        microphoneRequestMessage: '[pl] We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: '[pl] Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: '[pl] Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "[pl] There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "[pl] There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "[pl] Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "[pl] Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: '[pl] Additional details',
        helpText: '[pl] We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: '[pl] We need to ask you just a few more questions to finish validating your identity.',
        helpLink: '[pl] Learn more about why we need this.',
        legalFirstNameLabel: '[pl] Legal first name',
        legalMiddleNameLabel: '[pl] Legal middle name',
        legalLastNameLabel: '[pl] Legal last name',
        selectAnswer: '[pl] Please select a response to proceed',
        ssnFull9Error: '[pl] Please enter a valid nine-digit SSN',
        needSSNFull9: "[pl] We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "[pl] We couldn't verify",
        pleaseFixIt: '[pl] Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `[pl] We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: '[pl] Terms and fees',
        headerTitleRefactor: '[pl] Fees and terms',
        haveReadAndAgreePlain: '[pl] I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `[pl] I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: '[pl] I agree to the Privacy and Wallet agreement.',
        agreeToThe: (walletAgreementUrl: string) =>
            `[pl] I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: '[pl] Enable payments',
        monthlyFee: '[pl] Monthly fee',
        inactivity: '[pl] Inactivity',
        noOverdraftOrCredit: '[pl] No overdraft/credit feature.',
        electronicFundsWithdrawal: '[pl] Electronic funds withdrawal',
        standard: '[pl] Standard',
        reviewTheFees: '[pl] Take a look at some fees.',
        checkTheBoxes: '[pl] Please check the boxes below.',
        agreeToTerms: '[pl] Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `[pl] The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: '[pl] Per purchase',
            atmWithdrawal: '[pl] ATM withdrawal',
            cashReload: '[pl] Cash reload',
            inNetwork: '[pl] in-network',
            outOfNetwork: '[pl] out-of-network',
            atmBalanceInquiry: '[pl] ATM balance inquiry (in-network or out-of-network)',
            customerService: '[pl] Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: '[pl] Inactivity (after 12 months with no transactions)',
            weChargeOneFee: '[pl] We charge 1 other type of fee. It is:',
            fdicInsurance: '[pl] Your funds are eligible for FDIC insurance.',
            generalInfo: `[pl] For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `[pl] For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: '[pl] Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: (amount: string) => `[pl] (min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '[pl] A list of all Expensify Wallet fees',
            typeOfFeeHeader: '[pl] All fees',
            feeAmountHeader: '[pl] Amount',
            moreDetailsHeader: '[pl] Details',
            openingAccountTitle: '[pl] Opening an account',
            openingAccountDetails: "[pl] There's no fee to open an account.",
            monthlyFeeDetails: "[pl] There's no monthly fee.",
            customerServiceTitle: '[pl] Customer service',
            customerServiceDetails: '[pl] There are no customer service fees.',
            inactivityDetails: "[pl] There's no inactivity fee.",
            sendingFundsTitle: '[pl] Sending funds to another account holder',
            sendingFundsDetails: "[pl] There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "[pl] There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "[pl] There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                `[pl]  The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `[pl] Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                `[pl]  Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `[pl] Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `[pl] For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: '[pl] View printer-friendly version',
            automated: '[pl] Automated',
            liveAgent: '[pl] Live agent',
            instant: '[pl] Instant',
            electronicFundsInstantFeeMin: (amount: string) => `[pl] Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '[pl] Enable payments',
        activatedTitle: '[pl] Wallet activated!',
        activatedMessage: '[pl] Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: '[pl] Just a minute...',
        checkBackLaterMessage: "[pl] We're still reviewing your information. Please check back later.",
        continueToPayment: '[pl] Continue to payment',
        continueToTransfer: '[pl] Continue to transfer',
    },
    companyStep: {
        headerTitle: '[pl] Company information',
        subtitle: '[pl] Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: '[pl] Legal business name',
        companyWebsite: '[pl] Company website',
        taxIDNumber: '[pl] Tax ID number',
        taxIDNumberPlaceholder: '[pl] 9 digits',
        companyType: '[pl] Company type',
        incorporationDate: '[pl] Incorporation date',
        incorporationState: '[pl] Incorporation state',
        industryClassificationCode: '[pl] Industry classification code',
        confirmCompanyIsNot: '[pl] I confirm that this company is not on the',
        listOfRestrictedBusinesses: '[pl] list of restricted businesses',
        incorporationDatePlaceholder: '[pl] Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '[pl] LLC',
            CORPORATION: '[pl] Corp',
            PARTNERSHIP: '[pl] Partnership',
            COOPERATIVE: '[pl] Cooperative',
            SOLE_PROPRIETORSHIP: '[pl] Sole proprietorship',
            OTHER: '[pl] Other',
        },
        industryClassification: '[pl] Which industry is the business classified under?',
        industryClassificationCodePlaceholder: '[pl] Search for industry classification code',
    },
    requestorStep: {
        headerTitle: '[pl] Personal information',
        learnMore: '[pl] Learn more',
        isMyDataSafe: '[pl] Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: '[pl] Personal info',
        enterYourLegalFirstAndLast: "[pl] What's your legal name?",
        legalFirstName: '[pl] Legal first name',
        legalLastName: '[pl] Legal last name',
        legalName: '[pl] Legal name',
        enterYourDateOfBirth: "[pl] What's your date of birth?",
        enterTheLast4: '[pl] What are the last four digits of your Social Security Number?',
        dontWorry: "[pl] Don't worry, we don't do any personal credit checks!",
        last4SSN: '[pl] Last 4 of SSN',
        enterYourAddress: "[pl] What's your address?",
        address: '[pl] Address',
        letsDoubleCheck: "[pl] Let's double check that everything looks right.",
        byAddingThisBankAccount: "[pl] By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: '[pl] What’s your legal name?',
        whatsYourDOB: '[pl] What’s your date of birth?',
        whatsYourAddress: '[pl] What’s your address?',
        whatsYourSSN: '[pl] What are the last four digits of your Social Security Number?',
        noPersonalChecks: '[pl] Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: '[pl] What’s your phone number?',
        weNeedThisToVerify: '[pl] We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: '[pl] Company info',
        enterTheNameOfYourBusiness: "[pl] What's the name of your company?",
        businessName: '[pl] Legal company name',
        enterYourCompanyTaxIdNumber: "[pl] What's your company’s Tax ID number?",
        taxIDNumber: '[pl] Tax ID number',
        taxIDNumberPlaceholder: '[pl] 9 digits',
        enterYourCompanyWebsite: "[pl] What's your company’s website?",
        companyWebsite: '[pl] Company website',
        enterYourCompanyPhoneNumber: "[pl] What's your company’s phone number?",
        enterYourCompanyAddress: "[pl] What's your company’s address?",
        selectYourCompanyType: '[pl] What type of company is it?',
        companyType: '[pl] Company type',
        incorporationType: {
            LLC: '[pl] LLC',
            CORPORATION: '[pl] Corp',
            PARTNERSHIP: '[pl] Partnership',
            COOPERATIVE: '[pl] Cooperative',
            SOLE_PROPRIETORSHIP: '[pl] Sole proprietorship',
            OTHER: '[pl] Other',
        },
        selectYourCompanyIncorporationDate: "[pl] What's your company’s incorporation date?",
        incorporationDate: '[pl] Incorporation date',
        incorporationDatePlaceholder: '[pl] Start date (yyyy-mm-dd)',
        incorporationState: '[pl] Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '[pl] Which state was your company incorporated in?',
        letsDoubleCheck: "[pl] Let's double check that everything looks right.",
        companyAddress: '[pl] Company address',
        listOfRestrictedBusinesses: '[pl] list of restricted businesses',
        confirmCompanyIsNot: '[pl] I confirm that this company is not on the',
        businessInfoTitle: '[pl] Business info',
        legalBusinessName: '[pl] Legal business name',
        whatsTheBusinessName: "[pl] What's the business name?",
        whatsTheBusinessAddress: "[pl] What's the business address?",
        whatsTheBusinessContactInformation: "[pl] What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "[pl] What's the Company Registration Number (CRN)?";
                default:
                    return "[pl] What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[pl] What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return '[pl] What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return '[pl] What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return '[pl] What’s the Australian Business Number (ABN)?';
                default:
                    return '[pl] What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "[pl] What's this number?",
        whereWasTheBusinessIncorporated: '[pl] Where was the business incorporated?',
        whatTypeOfBusinessIsIt: '[pl] What type of business is it?',
        whatsTheBusinessAnnualPayment: "[pl] What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "[pl] What's your expected average reimbursement amount?",
        registrationNumber: '[pl] Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[pl] EIN';
                case CONST.COUNTRY.CA:
                    return '[pl] BN';
                case CONST.COUNTRY.GB:
                    return '[pl] VRN';
                case CONST.COUNTRY.AU:
                    return '[pl] ABN';
                default:
                    return '[pl] EU VAT';
            }
        },
        businessAddress: '[pl] Business address',
        businessType: '[pl] Business type',
        incorporation: '[pl] Incorporation',
        incorporationCountry: '[pl] Incorporation country',
        incorporationTypeName: '[pl] Incorporation type',
        businessCategory: '[pl] Business category',
        annualPaymentVolume: '[pl] Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `[pl] Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '[pl] Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `[pl] Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '[pl] Select incorporation type',
        selectBusinessCategory: '[pl] Select business category',
        selectAnnualPaymentVolume: '[pl] Select annual payment volume',
        selectIncorporationCountry: '[pl] Select incorporation country',
        selectIncorporationState: '[pl] Select incorporation state',
        selectAverageReimbursement: '[pl] Select average reimbursement amount',
        selectBusinessType: '[pl] Select business type',
        findIncorporationType: '[pl] Find incorporation type',
        findBusinessCategory: '[pl] Find business category',
        findAnnualPaymentVolume: '[pl] Find annual payment volume',
        findIncorporationState: '[pl] Find incorporation state',
        findAverageReimbursement: '[pl] Find average reimbursement amount',
        findBusinessType: '[pl] Find business type',
        error: {
            registrationNumber: '[pl] Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '[pl] Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return '[pl] Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return '[pl] Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return '[pl] Please provide a valid Australian Business Number (ABN)';
                    default:
                        return '[pl] Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `[pl] Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `[pl] Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `[pl] Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: '[pl] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: '[pl] Business owner',
        enterLegalFirstAndLastName: "[pl] What's the owner's legal name?",
        legalFirstName: '[pl] Legal first name',
        legalLastName: '[pl] Legal last name',
        enterTheDateOfBirthOfTheOwner: "[pl] What's the owner's date of birth?",
        enterTheLast4: '[pl] What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: '[pl] Last 4 of SSN',
        dontWorry: "[pl] Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "[pl] What's the owner's address?",
        letsDoubleCheck: '[pl] Let’s double check that everything looks right.',
        legalName: '[pl] Legal name',
        address: '[pl] Address',
        byAddingThisBankAccount: "[pl] By adding this bank account, you confirm that you've read, understand, and accept",
        owners: '[pl] Owners',
    },
    ownershipInfoStep: {
        ownerInfo: '[pl] Owner info',
        businessOwner: '[pl] Business owner',
        signerInfo: '[pl] Signer info',
        doYouOwn: (companyName: string) => `[pl] Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `[pl] Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: '[pl] Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: '[pl] Legal first name',
        legalLastName: '[pl] Legal last name',
        whatsTheOwnersName: "[pl] What's the owner's legal name?",
        whatsYourName: "[pl] What's your legal name?",
        whatPercentage: '[pl] What percentage of the business belongs to the owner?',
        whatsYoursPercentage: '[pl] What percentage of the business do you own?',
        ownership: '[pl] Ownership',
        whatsTheOwnersDOB: "[pl] What's the owner's date of birth?",
        whatsYourDOB: "[pl] What's your date of birth?",
        whatsTheOwnersAddress: "[pl] What's the owner's address?",
        whatsYourAddress: "[pl] What's your address?",
        whatAreTheLast: "[pl] What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: '[pl] What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: '[pl] What is your country of citizenship?',
        whatsTheOwnersNationality: "[pl] What's the owner's country of citizenship?",
        countryOfCitizenship: '[pl] Country of citizenship',
        dontWorry: "[pl] Don't worry, we don't do any personal credit checks!",
        last4: '[pl] Last 4 of SSN',
        whyDoWeAsk: '[pl] Why do we ask for this?',
        letsDoubleCheck: '[pl] Let’s double check that everything looks right.',
        legalName: '[pl] Legal name',
        ownershipPercentage: '[pl] Ownership percentage',
        areThereOther: (companyName: string) => `[pl] Are there other individuals who own 25% or more of ${companyName}?`,
        owners: '[pl] Owners',
        addCertified: '[pl] Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart: '[pl] Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: '[pl] Upload entity ownership chart',
        noteEntity: '[pl] Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: '[pl] Certified entity ownership chart',
        selectCountry: '[pl] Select country',
        findCountry: '[pl] Find country',
        address: '[pl] Address',
        chooseFile: '[pl] Choose file',
        uploadDocuments: '[pl] Upload additional documentation',
        pleaseUpload: '[pl] Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: '[pl] Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: '[pl] Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "[pl] Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: '[pl] Copy of ID for beneficial owner',
        copyOfIDDescription: "[pl] Examples: Passport, driver's license, etc.",
        proofOfAddress: '[pl] Address proof for beneficial owner',
        proofOfAddressDescription: '[pl] Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: '[pl] Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            '[pl] Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: '[pl] Complete verification',
        confirmAgreements: '[pl] Please confirm the agreements below.',
        certifyTrueAndAccurate: '[pl] I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: '[pl] Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: '[pl] I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: '[pl] You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: '[pl] terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '[pl] Validate your bank account',
        validateButtonText: '[pl] Validate',
        validationInputLabel: '[pl] Transaction',
        maxAttemptsReached: '[pl] Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `[pl] Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '[pl] Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: '[pl] Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: '[pl] Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: '[pl] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: '[pl] Secure your account',
    },
    countryStep: {
        confirmBusinessBank: '[pl] Confirm business bank account currency and country',
        confirmCurrency: '[pl] Confirm currency and country',
        yourBusiness: '[pl] Your business bank account currency must match your workspace currency.',
        youCanChange: '[pl] You can change your workspace currency in your',
        findCountry: '[pl] Find country',
        selectCountry: '[pl] Select country',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `[pl] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> so you can invite a director to sign in a later step.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '[pl] What are your business bank account details?',
        letsDoubleCheck: '[pl] Let’s double check that everything looks fine.',
        thisBankAccount: '[pl] This bank account will be used for business payments on your workspace',
        accountNumber: '[pl] Account number',
        accountHolderNameDescription: "[pl] Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: '[pl] Signer info',
        areYouDirector: (companyName: string) => `[pl] Are you a director at ${companyName}?`,
        regulationRequiresUs: '[pl] Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "[pl] What's your legal name",
        fullName: '[pl] Legal full name',
        whatsYourJobTitle: "[pl] What's your job title?",
        jobTitle: '[pl] Job title',
        whatsYourDOB: "[pl] What's your date of birth?",
        uploadID: '[pl] Upload ID and proof of address',
        personalAddress: '[pl] Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: '[pl] Let’s double check that everything looks right.',
        legalName: '[pl] Legal name',
        proofOf: '[pl] Proof of personal address',
        enterOneEmail: (companyName: string) => `[pl] Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: '[pl] Regulation requires at least one more director as a signer.',
        hangTight: '[pl] Hang tight...',
        enterTwoEmails: (companyName: string) => `[pl] Enter the emails of two directors at ${companyName}`,
        sendReminder: '[pl] Send a reminder',
        chooseFile: '[pl] Choose file',
        weAreWaiting: "[pl] We're waiting for others to verify their identities as directors of the business.",
        id: '[pl] Copy of ID',
        proofOfDirectors: '[pl] Proof of director(s)',
        proofOfDirectorsDescription: '[pl] Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: '[pl] Codice Fiscale',
        codiceFiscaleDescription: '[pl] Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: '[pl] PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            [pl] Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: '[pl] Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: '[pl] Enter signer info',
        thisStep: '[pl] This step has been completed',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `[pl] is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: '[pl] Emails must be different',
            connectToWorkspace: (workspaceRoute: string) => `[pl] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> to invite a director to sign.`,
        },
    },
    agreementsStep: {
        agreements: '[pl] Agreements',
        pleaseConfirm: '[pl] Please confirm the agreements below',
        regulationRequiresUs: '[pl] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: '[pl] I am authorized to use the business bank account for business spend.',
        iCertify: '[pl] I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `[pl] I accept the <a href="https://www.corpay.com/cross-border/terms">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: '[pl] I accept the terms and conditions.',
        accept: '[pl] Accept and add bank account',
        iConsentToThePrivacyNotice: '[pl] I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: '[pl] I consent to the privacy notice.',
        error: {
            authorized: '[pl] You must be a controlling officer with authorization to operate the business bank account',
            certify: '[pl] Please certify that the information is true and accurate',
            consent: '[pl] Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: '[pl] Docusign Form',
        pleaseComplete:
            '[pl] Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: '[pl] Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            '[pl] Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: '[pl] Take me to Docusign',
        uploadAdditional: '[pl] Upload additional documentation',
        pleaseUpload: '[pl] Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: '[pl] Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "[pl] Let's finish in chat!",
        thanksFor:
            "[pl] Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: '[pl] I have a question',
        enable2FA: '[pl] Enable two-factor authentication (2FA) to prevent fraud',
        weTake: '[pl] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: '[pl] Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '[pl] One moment',
        explanationLine: "[pl] We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "[pl] Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: '[pl] Book travel',
        title: '[pl] Travel smart',
        subtitle: '[pl] Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: '[pl] Save money on your bookings',
            alerts: '[pl] Get realtime alerts if your travel plans change',
        },
        bookTravel: '[pl] Book travel',
        bookDemo: '[pl] Book demo',
        bookADemo: '[pl] Book a demo',
        toLearnMore: '[pl]  to learn more.',
        termsAndConditions: {
            header: '[pl] Before we continue...',
            title: '[pl] Terms & conditions',
            label: '[pl] I agree to the terms & conditions',
            subtitle: `[pl] Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: '[pl] You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                '[pl] You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: '[pl] Flight',
        flightDetails: {
            passenger: '[pl] Passenger',
            layover: (layover: string) => `[pl] <muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: '[pl] Take-off',
            landing: '[pl] Landing',
            seat: '[pl] Seat',
            class: '[pl] Cabin Class',
            recordLocator: '[pl] Record locator',
            cabinClasses: {
                unknown: '[pl] Unknown',
                economy: '[pl] Economy',
                premiumEconomy: '[pl] Premium Economy',
                business: '[pl] Business',
                first: '[pl] First',
            },
        },
        hotel: '[pl] Hotel',
        hotelDetails: {
            guest: '[pl] Guest',
            checkIn: '[pl] Check-in',
            checkOut: '[pl] Check-out',
            roomType: '[pl] Room type',
            cancellation: '[pl] Cancellation policy',
            cancellationUntil: '[pl] Free cancellation until',
            confirmation: '[pl] Confirmation number',
            cancellationPolicies: {
                unknown: '[pl] Unknown',
                nonRefundable: '[pl] Non-refundable',
                freeCancellationUntil: '[pl] Free cancellation until',
                partiallyRefundable: '[pl] Partially refundable',
            },
        },
        car: '[pl] Car',
        carDetails: {
            rentalCar: '[pl] Car rental',
            pickUp: '[pl] Pick-up',
            dropOff: '[pl] Drop-off',
            driver: '[pl] Driver',
            carType: '[pl] Car type',
            cancellation: '[pl] Cancellation policy',
            cancellationUntil: '[pl] Free cancellation until',
            freeCancellation: '[pl] Free cancellation',
            confirmation: '[pl] Confirmation number',
        },
        train: '[pl] Rail',
        trainDetails: {
            passenger: '[pl] Passenger',
            departs: '[pl] Departs',
            arrives: '[pl] Arrives',
            coachNumber: '[pl] Coach number',
            seat: '[pl] Seat',
            fareDetails: '[pl] Fare details',
            confirmation: '[pl] Confirmation number',
        },
        viewTrip: '[pl] View trip',
        modifyTrip: '[pl] Modify trip',
        tripSupport: '[pl] Trip support',
        tripDetails: '[pl] Trip details',
        viewTripDetails: '[pl] View trip details',
        trip: '[pl] Trip',
        trips: '[pl] Trips',
        tripSummary: '[pl] Trip summary',
        departs: '[pl] Departs',
        errorMessage: '[pl] Something went wrong. Please try again later.',
        phoneError: (phoneErrorMethodsRoute: string) => `[pl] <rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: '[pl] Domain',
            subtitle: '[pl] Choose a domain for Expensify Travel setup.',
            recommended: '[pl] Recommended',
        },
        domainPermissionInfo: {
            title: '[pl] Domain',
            restriction: (domain: string) =>
                `[pl] You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `[pl] If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '[pl] Get started with Expensify Travel',
            message: `[pl] You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: '[pl] Expensify Travel has been disabled',
            message: `[pl] Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "[pl] We're reviewing your request...",
            message: `[pl] We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: '[pl] Got it',
            conciergeMessage: ({domain}: {domain: string}) => `[pl] Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `[pl] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[pl] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[pl] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[pl] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `[pl] The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `[pl] Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[pl] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `[pl] Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `[pl] Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `[pl] Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `[pl] Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: '[pl] Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: (type: string, id = '') => `[pl] You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `[pl] The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: (type: string, id = '') => `[pl] Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: (type: string) => `[pl] Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `[pl] Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `[pl] Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `[pl] Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: (type: string) => `[pl] Your ${type} reservation was updated.`,
        },
        flightTo: '[pl] Flight to',
        trainTo: '[pl] Train to',
        carRental: '[pl]  car rental',
        nightIn: '[pl] night in',
        nightsIn: '[pl] nights in',
    },
    proactiveAppReview: {
        title: '[pl] Enjoying New Expensify?',
        description: '[pl] Let us know so we can help make your expensing experience even better.',
        positiveButton: '[pl] Yeah!',
        negativeButton: '[pl] Not really',
    },
    workspace: {
        common: {
            card: '[pl] Cards',
            expensifyCard: '[pl] Expensify Card',
            companyCards: '[pl] Company cards',
            personalCards: '[pl] Personal cards',
            workflows: '[pl] Workflows',
            workspace: '[pl] Workspace',
            findWorkspace: '[pl] Find workspace',
            edit: '[pl] Edit workspace',
            enabled: '[pl] Enabled',
            disabled: '[pl] Disabled',
            everyone: '[pl] Everyone',
            delete: '[pl] Delete workspace',
            settings: '[pl] Settings',
            reimburse: '[pl] Reimbursements',
            categories: '[pl] Categories',
            tags: '[pl] Tags',
            customField1: '[pl] Custom field 1',
            customField2: '[pl] Custom field 2',
            customFieldHint: '[pl] Add custom coding that applies to all spend from this member.',
            reports: '[pl] Reports',
            reportFields: '[pl] Report fields',
            reportTitle: '[pl] Report title',
            reportField: '[pl] Report field',
            taxes: '[pl] Taxes',
            bills: '[pl] Bills',
            invoices: '[pl] Invoices',
            perDiem: '[pl] Per diem',
            travel: '[pl] Travel',
            members: '[pl] Members',
            accounting: '[pl] Accounting',
            receiptPartners: '[pl] Receipt partners',
            rules: '[pl] Rules',
            displayedAs: '[pl] Displayed as',
            plan: '[pl] Plan',
            profile: '[pl] Overview',
            bankAccount: '[pl] Bank account',
            testTransactions: '[pl] Test transactions',
            issueAndManageCards: '[pl] Issue and manage cards',
            reconcileCards: '[pl] Reconcile cards',
            selectAll: '[pl] Select all',
            selected: () => ({
                one: '[pl] 1 selected',
                other: (count: number) => `[pl] ${count} selected`,
            }),
            settlementFrequency: '[pl] Settlement frequency',
            setAsDefault: '[pl] Set as default workspace',
            defaultNote: `[pl] Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '[pl] Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: '[pl] Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            deleteOpenExpensifyCardsError: '[pl] Your company still has open Expensify Cards.',
            outstandingBalanceWarning:
                '[pl] You have an outstanding balance that must be settled before deleting your last workspace. Please go to your subscription settings to resolve the payment.',
            settleBalance: '[pl] Go to subscription',
            unavailable: '[pl] Unavailable workspace',
            memberNotFound: '[pl] Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `[pl] You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: '[pl] Go to workspace',
            duplicateWorkspace: '[pl] Duplicate workspace',
            duplicateWorkspacePrefix: '[pl] Duplicate',
            goToWorkspaces: '[pl] Go to workspaces',
            clearFilter: '[pl] Clear filter',
            workspaceName: '[pl] Workspace name',
            workspaceOwner: '[pl] Owner',
            keepMeAsAdmin: '[pl] Keep me as an admin',
            workspaceType: '[pl] Workspace type',
            workspaceAvatar: '[pl] Workspace avatar',
            clientID: '[pl] Client ID',
            clientIDInputHint: "[pl] Enter the client's unique identifier",
            mustBeOnlineToViewMembers: '[pl] You need to be online in order to view members of this workspace.',
            moreFeatures: '[pl] More features',
            requested: '[pl] Requested',
            distanceRates: '[pl] Distance rates',
            defaultDescription: '[pl] One place for all your receipts and expenses.',
            descriptionHint: '[pl] Share information about this workspace with all members.',
            welcomeNote: '[pl] Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: '[pl] Subscription',
            markAsEntered: '[pl] Mark as manually entered',
            markAsExported: '[pl] Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `[pl] Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "[pl] Let's double check that everything looks right.",
            lineItemLevel: '[pl] Line-item level',
            reportLevel: '[pl] Report level',
            topLevel: '[pl] Top level',
            appliedOnExport: '[pl] Not imported into Expensify, applied on export',
            shareNote: {
                header: '[pl] Share your workspace with other members',
                content: (adminsRoomLink: string) =>
                    `[pl] Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `[pl] Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '[pl] Create new connection',
            reuseExistingConnection: '[pl] Reuse existing connection',
            existingConnections: '[pl] Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `[pl] Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `[pl] ${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `[pl] Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: '[pl] Learn more',
            memberAlternateText: '[pl] Submit and approve reports.',
            adminAlternateText: '[pl] Manage reports and workspace settings.',
            auditorAlternateText: '[pl] View and comment on reports.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: '[pl] Direct',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: '[pl] None',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '[pl] Indirect',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '[pl] Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '[pl] Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return '[pl] Member';
                    default:
                        return '[pl] Member';
                }
            },
            frequency: {
                manual: '[pl] Manually',
                instant: '[pl] Instant',
                immediate: '[pl] Daily',
                trip: '[pl] By trip',
                weekly: '[pl] Weekly',
                semimonthly: '[pl] Twice a month',
                monthly: '[pl] Monthly',
            },
            budgetFrequency: {
                monthly: '[pl] monthly',
                yearly: '[pl] yearly',
            },
            budgetFrequencyUnit: {
                monthly: '[pl] month',
                yearly: '[pl] year',
            },
            budgetTypeForNotificationMessage: {
                tag: '[pl] tag',
                category: '[pl] category',
            },
            planType: '[pl] Plan type',
            youCantDowngradeInvoicing:
                "[pl] You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: '[pl] Default category',
            viewTransactions: '[pl] View transactions',
            policyExpenseChatName: (displayName: string) => `[pl] ${displayName}'s expenses`,
            deepDiveExpensifyCard: `[pl] <muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `[pl] Connected to ${organizationName}` : '[pl] Automate travel and meal delivery expenses across your organization.',
                sendInvites: '[pl] Send invites',
                sendInvitesDescription: "[pl] These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: '[pl] Confirm invite',
                manageInvites: '[pl] Manage invites',
                confirm: '[pl] Confirm',
                allSet: '[pl] All set',
                readyToRoll: "[pl] You're ready to roll",
                takeBusinessRideMessage: '[pl] Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: '[pl] All',
                linked: '[pl] Linked',
                outstanding: '[pl] Outstanding',
                status: {
                    resend: '[pl] Resend',
                    invite: '[pl] Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '[pl] Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '[pl] Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '[pl] Suspended',
                },
                centralBillingAccount: '[pl] Central billing account',
                centralBillingDescription: '[pl] Choose where to import all Uber receipts.',
                invitationFailure: '[pl] Failed to invite member to Uber for Business',
                autoInvite: '[pl] Invite new workspace members to Uber for Business',
                autoRemove: '[pl] Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: '[pl] No outstanding invites',
                    subtitle: '[pl] Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `[pl] <muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: '[pl] Amount',
            deleteRates: () => ({
                one: '[pl] Delete rate',
                other: '[pl] Delete rates',
            }),
            deletePerDiemRate: '[pl] Delete per diem rate',
            findPerDiemRate: '[pl] Find per diem rate',
            areYouSureDelete: () => ({
                one: '[pl] Are you sure you want to delete this rate?',
                other: '[pl] Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: '[pl] Per diem',
                subtitle: '[pl] Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: '[pl] Import per diem rates',
            editPerDiemRate: '[pl] Edit per diem rate',
            editPerDiemRates: '[pl] Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `[pl] Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `[pl] Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '[pl] Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: '[pl] Mark checks as “print later”',
            exportDescription: '[pl] Configure how Expensify data exports to QuickBooks Desktop.',
            date: '[pl] Export date',
            exportInvoices: '[pl] Export invoices to',
            exportExpensifyCard: '[pl] Export Expensify Card transactions as',
            account: '[pl] Account',
            accountDescription: '[pl] Choose where to post journal entries.',
            accountsPayable: '[pl] Accounts payable',
            accountsPayableDescription: '[pl] Choose where to create vendor bills.',
            bankAccount: '[pl] Bank account',
            notConfigured: '[pl] Not configured',
            bankAccountDescription: '[pl] Choose where to send checks from.',
            creditCardAccount: '[pl] Credit card account',
            exportDate: {
                label: '[pl] Export date',
                description: '[pl] Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pl] Date of last expense',
                        description: '[pl] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[pl] Export date',
                        description: '[pl] Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[pl] Submitted date',
                        description: '[pl] Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "[pl] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[pl] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[pl] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "[pl] QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[pl] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[pl] Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[pl] Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[pl] Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[pl] Check',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "[pl] We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[pl] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[pl] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[pl] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[pl] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '[pl] Choose where to send checks from.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[pl] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[pl] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[pl] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: '[pl] No accounts found',
            noAccountsFoundDescription: '[pl] Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: '[pl] QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "[pl] Can't connect from this device",
                body1: "[pl] You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "[pl] Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: '[pl] Open this link to connect',
                body: '[pl] To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: '[pl] Something went wrong',
                setupErrorBody: (conciergeLink: string) =>
                    `[pl] <muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: '[pl] Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: '[pl] Classes',
            items: '[pl] Items',
            customers: '[pl] Customers/projects',
            exportCompanyCardsDescription: '[pl] Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: '[pl] Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: '[pl] Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[pl] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[pl] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[pl] Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: '[pl] Line item level',
            reportFieldsDisplayedAsDescription: '[pl] Report level',
            customersDescription: '[pl] Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: '[pl] Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: '[pl] Auto-create entities',
                createEntitiesDescription: "[pl] Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: '[pl] Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: '[pl] When to Export',
                description: '[pl] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: '[pl] Connected to',
            importDescription: '[pl] Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: '[pl] Classes',
            locations: '[pl] Locations',
            customers: '[pl] Customers/projects',
            accountsDescription: '[pl] Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[pl] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[pl] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[pl] Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: '[pl] Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: '[pl] Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: '[pl] Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "[pl] QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "[pl] QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: '[pl] Configure how Expensify data exports to QuickBooks Online.',
            date: '[pl] Export date',
            exportInvoices: '[pl] Export invoices to',
            exportExpensifyCard: '[pl] Export Expensify Card transactions as',
            exportDate: {
                label: '[pl] Export date',
                description: '[pl] Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pl] Date of last expense',
                        description: '[pl] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[pl] Export date',
                        description: '[pl] Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[pl] Submitted date',
                        description: '[pl] Date the report was submitted for approval.',
                    },
                },
            },
            receivable: '[pl] Accounts receivable',
            archive: '[pl] Accounts receivable archive',
            exportInvoicesDescription: '[pl] Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: '[pl] Set how company card purchases export to QuickBooks Online.',
            vendor: '[pl] Vendor',
            defaultVendorDescription: '[pl] Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: '[pl] Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "[pl] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[pl] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[pl] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: '[pl] Account',
            accountDescription: '[pl] Choose where to post journal entries.',
            accountsPayable: '[pl] Accounts payable',
            accountsPayableDescription: '[pl] Choose where to create vendor bills.',
            bankAccount: '[pl] Bank account',
            notConfigured: '[pl] Not configured',
            bankAccountDescription: '[pl] Choose where to send checks from.',
            creditCardAccount: '[pl] Credit card account',
            companyCardsLocationEnabledDescription:
                "[pl] QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "[pl] QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[pl] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: '[pl] Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: '[pl] Invite employees',
                inviteEmployeesDescription: '[pl] Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: '[pl] Auto-create entities',
                createEntitiesDescription:
                    "[pl] Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription: '[pl] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: '[pl] QuickBooks bill payment account',
                qboInvoiceCollectionAccount: '[pl] QuickBooks invoice collections account',
                accountSelectDescription: "[pl] Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "[pl] Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '[pl] Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[pl] Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[pl] Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[pl] Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[pl] Check',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "[pl] We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[pl] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[pl] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '[pl] Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[pl] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[pl] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '[pl] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[pl] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '[pl] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[pl] Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[pl] Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[pl] Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[pl] To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[pl] To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[pl] To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: '[pl] No accounts found',
            noAccountsFoundDescription: '[pl] Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: '[pl] When to Export',
                description: '[pl] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Out-of-pocket expenses will export when paid',
                },
            },
            travelInvoicing: '[pl] Export Expensify Travel Payable To',
            travelInvoicingVendor: '[pl] Travel vendor',
            travelInvoicingPayableAccount: '[pl] Travel payable account',
        },
        workspaceList: {
            joinNow: '[pl] Join now',
            askToJoin: '[pl] Ask to join',
        },
        xero: {
            organization: '[pl] Xero organization',
            organizationDescription: "[pl] Choose the Xero organization that you'd like to import data from.",
            importDescription: '[pl] Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: '[pl] Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[pl] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[pl] Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: '[pl] Tracking categories',
            trackingCategoriesDescription: '[pl] Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `[pl] Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `[pl] Choose where to map ${categoryName} when exporting to Xero.`,
            customers: '[pl] Re-bill customers',
            customersDescription: '[pl] Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: '[pl] Choose how to handle Xero taxes in Expensify.',
            notImported: '[pl] Not imported',
            notConfigured: '[pl] Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: '[pl] Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '[pl] Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '[pl] Report fields',
            },
            exportDescription: '[pl] Configure how Expensify data exports to Xero.',
            purchaseBill: '[pl] Purchase bill',
            exportDeepDiveCompanyCard:
                '[pl] Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: '[pl] Bank transactions',
            xeroBankAccount: '[pl] Xero bank account',
            xeroBankAccountDescription: '[pl] Choose where expenses will post as bank transactions.',
            exportExpensesDescription: '[pl] Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: '[pl] Purchase bill date',
            exportInvoices: '[pl] Export invoices as',
            salesInvoice: '[pl] Sales invoice',
            exportInvoicesDescription: '[pl] Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: '[pl] Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: '[pl] Purchase bill status',
                reimbursedReportsDescription: '[pl] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: '[pl] Xero bill payment account',
                xeroInvoiceCollectionAccount: '[pl] Xero invoice collections account',
                xeroBillPaymentAccountDescription: "[pl] Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "[pl] Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: '[pl] Purchase bill date',
                description: '[pl] Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pl] Date of last expense',
                        description: '[pl] Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[pl] Export date',
                        description: '[pl] Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[pl] Submitted date',
                        description: '[pl] Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: '[pl] Purchase bill status',
                description: '[pl] Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '[pl] Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '[pl] Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '[pl] Awaiting payment',
                },
            },
            noAccountsFound: '[pl] No accounts found',
            noAccountsFoundDescription: '[pl] Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: '[pl] When to Export',
                description: '[pl] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '[pl] Preferred exporter',
            taxSolution: '[pl] Tax solution',
            notConfigured: '[pl] Not configured',
            exportDate: {
                label: '[pl] Export date',
                description: '[pl] Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pl] Date of last expense',
                        description: '[pl] Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '[pl] Export date',
                        description: '[pl] Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '[pl] Submitted date',
                        description: '[pl] Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: '[pl] Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '[pl] Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[pl] Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: '[pl] Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '[pl] Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[pl] Vendor bills',
                },
            },
            creditCardAccount: '[pl] Credit card account',
            defaultVendor: '[pl] Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `[pl] Set a default vendor that will apply to ${isReimbursable ? '' : '[pl] non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: '[pl] Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                '[pl] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[pl] Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: '[pl] No accounts found',
            noAccountsFoundDescription: `[pl] Please add the account in Sage Intacct and sync the connection again`,
            autoSync: '[pl] Auto-sync',
            autoSyncDescription: '[pl] Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: '[pl] Invite employees',
            inviteEmployeesDescription:
                '[pl] Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: '[pl] Sync reimbursed reports',
            syncReimbursedReportsDescription: '[pl] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: '[pl] Sage Intacct payment account',
            accountingMethods: {
                label: '[pl] When to Export',
                description: '[pl] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Out-of-pocket expenses will export when paid',
                },
            },
        },
        netsuite: {
            subsidiary: '[pl] Subsidiary',
            subsidiarySelectDescription: "[pl] Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: '[pl] Configure how Expensify data exports to NetSuite.',
            exportInvoices: '[pl] Export invoices to',
            journalEntriesTaxPostingAccount: '[pl] Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: '[pl] Journal entries provincial tax posting account',
            foreignCurrencyAmount: '[pl] Export foreign currency amount',
            exportToNextOpenPeriod: '[pl] Export to next open period',
            nonReimbursableJournalPostingAccount: '[pl] Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: '[pl] Reimbursable journal posting account',
            journalPostingPreference: {
                label: '[pl] Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '[pl] Single, itemized entry for each report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '[pl] Single entry for each expense',
                },
            },
            invoiceItem: {
                label: '[pl] Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '[pl] Create one for me',
                        description: '[pl] We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '[pl] Select existing',
                        description: "[pl] We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: '[pl] Export date',
                description: '[pl] Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pl] Date of last expense',
                        description: '[pl] Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '[pl] Export date',
                        description: '[pl] Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '[pl] Submitted date',
                        description: '[pl] Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '[pl] Expense reports',
                        reimbursableDescription: '[pl] Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: '[pl] Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '[pl] Vendor bills',
                        reimbursableDescription: dedent(`
                            [pl] Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [pl] Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '[pl] Journal entries',
                        reimbursableDescription: dedent(`
                            [pl] Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [pl] Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "[pl] If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: '[pl] Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: '[pl] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: '[pl] Reimbursements account',
                reimbursementsAccountDescription: "[pl] Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: '[pl] Collections account',
                collectionsAccountDescription: '[pl] Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: '[pl] A/P approval account',
                approvalAccountDescription:
                    '[pl] Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: '[pl] NetSuite default',
                inviteEmployees: '[pl] Invite employees and set approvals',
                inviteEmployeesDescription:
                    '[pl] Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: '[pl] Auto-create employees/vendors',
                enableCategories: '[pl] Enable newly imported categories',
                customFormID: '[pl] Custom form ID',
                customFormIDDescription:
                    '[pl] By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: '[pl] Out-of-pocket expense',
                customFormIDNonReimbursable: '[pl] Company card expense',
                exportReportsTo: {
                    label: '[pl] Expense report approval level',
                    description: '[pl] Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: '[pl] NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '[pl] Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '[pl] Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '[pl] Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: '[pl] When to Export',
                    description: '[pl] Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pl] Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pl] Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: '[pl] Vendor bill approval level',
                    description: '[pl] Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: '[pl] NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '[pl] Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '[pl] Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: '[pl] Journal entry approval level',
                    description: '[pl] Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: '[pl] NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '[pl] Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '[pl] Approved for posting',
                    },
                },
                error: {
                    customFormID: '[pl] Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: '[pl] No accounts found',
            noAccountsFoundDescription: '[pl] Please add the account in NetSuite and sync the connection again',
            noVendorsFound: '[pl] No vendors found',
            noVendorsFoundDescription: '[pl] Please add vendors in NetSuite and sync the connection again',
            noItemsFound: '[pl] No invoice items found',
            noItemsFoundDescription: '[pl] Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: '[pl] No subsidiaries found',
            noSubsidiariesFoundDescription: '[pl] Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: '[pl] NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: '[pl] Install the Expensify bundle',
                        description: '[pl] In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: '[pl] Enable token-based authentication',
                        description: '[pl] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: '[pl] Enable SOAP web services',
                        description: '[pl] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: '[pl] Create an access token',
                        description:
                            '[pl] In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: '[pl] Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: '[pl] NetSuite Account ID',
                            netSuiteTokenID: '[pl] Token ID',
                            netSuiteTokenSecret: '[pl] Token Secret',
                        },
                        netSuiteAccountIDDescription: '[pl] In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: '[pl] Expense categories',
                expenseCategoriesDescription: '[pl] Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: '[pl] Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: '[pl] Departments',
                        subtitle: '[pl] Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: '[pl] Classes',
                        subtitle: '[pl] Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: '[pl] Locations',
                        subtitle: '[pl] Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: '[pl] Customers/projects',
                    subtitle: '[pl] Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: '[pl] Import customers',
                    importJobs: '[pl] Import projects',
                    customers: '[pl] customers',
                    jobs: '[pl] projects',
                    label: (importFields: string[], importType: string) => `${importFields.join('[pl]  and ')}, ${importType}`,
                },
                importTaxDescription: '[pl] Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: '[pl] Choose an option below:',
                    label: (importedTypes: string[]) => `[pl] Imported as ${importedTypes.join('[pl]  and ')}`,
                    requiredFieldError: (fieldName: string) => `[pl] Please enter the ${fieldName}`,
                    customSegments: {
                        title: '[pl] Custom segments/records',
                        addText: '[pl] Add custom segment/record',
                        recordTitle: '[pl] Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '[pl] View detailed instructions',
                        helpText: '[pl]  on configuring custom segments/records.',
                        emptyTitle: '[pl] Add a custom segment or custom record',
                        fields: {
                            segmentName: '[pl] Name',
                            internalID: '[pl] Internal ID',
                            scriptID: '[pl] Script ID',
                            customRecordScriptID: '[pl] Transaction column ID',
                            mapping: '[pl] Displayed as',
                        },
                        removeTitle: '[pl] Remove custom segment/record',
                        removePrompt: '[pl] Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: '[pl] custom segment name',
                            customRecordName: '[pl] custom record name',
                            segmentTitle: '[pl] Custom segment',
                            customSegmentAddTitle: '[pl] Add custom segment',
                            customRecordAddTitle: '[pl] Add custom record',
                            recordTitle: '[pl] Custom record',
                            segmentRecordType: '[pl] Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "[pl] What's the custom segment name?",
                            customRecordNameTitle: "[pl] What's the custom record name?",
                            customSegmentNameFooter: `[pl] You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `[pl] You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "[pl] What's the internal ID?",
                            customSegmentInternalIDFooter: `[pl] First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*

You can find custom segment internal IDs in NetSuite under:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the hyperlink next to *Custom Record Type*.
4. Find the internal ID in the table at the bottom.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `[pl] You can find custom record internal IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the internal ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "[pl] What's the script ID?",
                            customSegmentScriptIDFooter: `[pl] You can find custom segment script IDs in NetSuite under: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the *Application and Sourcing* tab near the bottom, then:
    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.
    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "[pl] What's the transaction column ID?",
                            customRecordScriptIDFooter: `[pl] You can find custom record script IDs in NetSuite under:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the script ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '[pl] How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: '[pl] How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `[pl] A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: '[pl] Custom lists',
                        addText: '[pl] Add custom list',
                        recordTitle: '[pl] Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '[pl] View detailed instructions',
                        helpText: '[pl]  on configuring custom lists.',
                        emptyTitle: '[pl] Add a custom list',
                        fields: {
                            listName: '[pl] Name',
                            internalID: '[pl] Internal ID',
                            transactionFieldID: '[pl] Transaction field ID',
                            mapping: '[pl] Displayed as',
                        },
                        removeTitle: '[pl] Remove custom list',
                        removePrompt: '[pl] Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: '[pl] Choose a custom list',
                            transactionFieldIDTitle: "[pl] What's the transaction field ID?",
                            transactionFieldIDFooter: `[pl] You can find transaction field IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom list.
3. Find the transaction field ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '[pl] How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `[pl] A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: '[pl] NetSuite employee default',
                        description: '[pl] Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `[pl] If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '[pl] Tags',
                        description: '[pl] Line-item level',
                        footerContent: (importField: string) => `[pl] ${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '[pl] Report fields',
                        description: '[pl] Report level',
                        footerContent: (importField: string) => `[pl] ${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: '[pl] Sage Intacct setup',
            prerequisitesTitle: '[pl] Before you connect...',
            downloadExpensifyPackage: '[pl] Download the Expensify package for Sage Intacct',
            followSteps: '[pl] Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: '[pl] Enter your Sage Intacct credentials',
            entity: '[pl] Entity',
            employeeDefault: '[pl] Sage Intacct employee default',
            employeeDefaultDescription: "[pl] The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "[pl] Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "[pl] Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: (mappingTitle: string) => `[pl] Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: '[pl] Expense types',
            expenseTypesDescription: '[pl] Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: '[pl] Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: '[pl] Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: '[pl] User-defined dimensions',
            addUserDefinedDimension: '[pl] Add user-defined dimension',
            integrationName: '[pl] Integration name',
            dimensionExists: '[pl] A dimension with this name already exists.',
            removeDimension: '[pl] Remove user-defined dimension',
            removeDimensionPrompt: '[pl] Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: '[pl] User-defined dimension',
            addAUserDefinedDimension: '[pl] Add a user-defined dimension',
            detailedInstructionsLink: '[pl] View detailed instructions',
            detailedInstructionsRestOfSentence: '[pl]  on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '[pl] 1 UDD added',
                other: (count: number) => `[pl] ${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '[pl] departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '[pl] classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '[pl] locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '[pl] customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '[pl] projects (jobs)';
                    default:
                        return '[pl] mappings';
                }
            },
        },
        type: {
            free: '[pl] Free',
            control: '[pl] Control',
            collect: '[pl] Collect',
        },
        companyCards: {
            addCards: '[pl] Add cards',
            selectCards: '[pl] Select cards',
            fromOtherWorkspaces: '[pl] From other workspaces',
            addWorkEmail: '[pl] Add your work email',
            addWorkEmailDescription: '[pl] Please add your work email in order to use existing feeds from other workspaces.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: "[pl] Couldn't load card feeds",
                workspaceFeedsCouldNotBeLoadedMessage: '[pl] An error occurred while loading workspace card feeds. Please try again or contact your administrator.',
                feedCouldNotBeLoadedTitle: "[pl] Couldn't load this feed",
                feedCouldNotBeLoadedMessage: '[pl] An error occurred while loading this feed. Please try again or contact your administrator.',
                tryAgain: '[pl] Try again',
            },
            addNewCard: {
                other: '[pl] Other',
                fileImport: '[pl] Import transactions from file',
                createFileFeedHelpText: `[pl] <muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: '[pl] Company card layout name',
                cardLayoutNameRequired: '[pl] The Company card layout name is required',
                useAdvancedFields: '[pl] Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: '[pl] American Express Corporate Cards',
                    cdf: '[pl] Mastercard Commercial Cards',
                    vcf: '[pl] Visa Commercial Cards',
                    stripe: '[pl] Stripe Cards',
                },
                yourCardProvider: `[pl] Who's your card provider?`,
                whoIsYourBankAccount: '[pl] Who’s your bank?',
                whereIsYourBankLocated: '[pl] Where’s your bank located?',
                howDoYouWantToConnect: '[pl] How do you want to connect to your bank?',
                learnMoreAboutOptions: `[pl] <muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: '[pl] Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `[pl] Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: '[pl] The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `[pl] Enable your ${provider} feed`,
                    heading: '[pl] We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: '[pl] We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: '[pl] We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `[pl] 1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.

2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `[pl] 1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.

2. Once the feed is enabled, Amex will send you a production letter.

3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `[pl] 1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.

 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `[pl] 1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Under Product Integrations, click Enable next to Expensify.

3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: '[pl] What bank issues these cards?',
                enterNameOfBank: '[pl] Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: '[pl] What are the Visa feed details?',
                        processorLabel: '[pl] Processor ID',
                        bankLabel: '[pl] Financial institution (bank) ID',
                        companyLabel: '[pl] Company ID',
                        helpLabel: '[pl] Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `[pl] What's the Amex delivery file name?`,
                        fileNameLabel: '[pl] Delivery file name',
                        helpLabel: '[pl] Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `[pl] What's the Mastercard distribution ID?`,
                        distributionLabel: '[pl] Distribution ID',
                        helpLabel: '[pl] Where do I find the distribution ID?',
                    },
                },
                amexCorporate: '[pl] Select this if the front of your cards say “Corporate”',
                amexBusiness: '[pl] Select this if the front of your cards say “Business”',
                amexPersonal: '[pl] Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: '[pl] Please select a card provider before continuing',
                    pleaseSelectBankAccount: '[pl] Please select a bank account before continuing',
                    pleaseSelectBank: '[pl] Please select a bank before continuing',
                    pleaseSelectCountry: '[pl] Please select a country before continuing',
                    pleaseSelectFeedType: '[pl] Please select a feed type before continuing',
                },
                exitModal: {
                    title: '[pl] Something not working?',
                    prompt: "[pl] We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: '[pl] Report issue',
                    cancelText: '[pl] Skip',
                },
                csvColumns: {
                    cardNumber: '[pl] Card number',
                    postedDate: '[pl] Date',
                    merchant: '[pl] Merchant',
                    amount: '[pl] Amount',
                    currency: '[pl] Currency',
                    ignore: '[pl] Ignore',
                    originalTransactionDate: '[pl] Original transaction date',
                    originalAmount: '[pl] Original amount',
                    originalCurrency: '[pl] Original currency',
                    comment: '[pl] Comment',
                    category: '[pl] Category',
                    tag: '[pl] Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `[pl] Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `[pl] Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '[pl] Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '[pl] Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '[pl] Custom day of month',
            },
            assign: '[pl] Assign',
            assignCard: '[pl] Assign card',
            findCard: '[pl] Find card',
            cardNumber: '[pl] Card number',
            commercialFeed: '[pl] Commercial feed',
            feedName: (feedName: string) => `[pl] ${feedName} cards`,
            deletedFeed: '[pl] Deleted feed',
            deletedCard: '[pl] Deleted card',
            directFeed: '[pl] Direct feed',
            whoNeedsCardAssigned: '[pl] Who needs a card assigned?',
            chooseTheCardholder: '[pl] Choose the cardholder',
            chooseCard: '[pl] Choose a card',
            chooseCardFor: (assignee: string) => `[pl] Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: '[pl] No active cards on this feed',
            somethingMightBeBroken:
                '[pl] <muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: '[pl] Choose a transaction start date',
            startDateDescription: "[pl] Choose your import start date. We'll sync all transactions from this date onwards.",
            editStartDateDescription: "[pl] Choose a new transaction start date. We'll sync all transactions from that date onwards, excluding those we already imported.",
            fromTheBeginning: '[pl] From the beginning',
            customStartDate: '[pl] Custom start date',
            customCloseDate: '[pl] Custom close date',
            letsDoubleCheck: "[pl] Let's double check that everything looks right.",
            confirmationDescription: "[pl] We'll begin importing transactions immediately.",
            card: '[pl] Card',
            cardName: '[pl] Card name',
            brokenConnectionError: '[pl] <rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `[pl] assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '[pl] company card',
            chooseCardFeed: '[pl] Choose card feed',
            ukRegulation:
                '[pl] Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: '[pl] Card assignment failed.',
            unassignCardFailedError: '[pl] Card unassignment failed.',
            cardAlreadyAssignedError: '[pl] This card is already assigned to a user in another workspace.',
            importTransactions: {
                title: '[pl] Import transactions from file',
                description: '[pl] Please adjust the settings for your file that will be applied on import.',
                cardDisplayName: '[pl] Card display name',
                currency: '[pl] Currency',
                transactionsAreReimbursable: '[pl] Transactions are reimbursable',
                flipAmountSign: '[pl] Flip amount sign',
                importButton: '[pl] Import transactions',
            },
            assignNewCards: {
                title: '[pl] Assign new cards',
                description: '[pl] Get the latest cards to assign from your bank',
            },
        },
        expensifyCard: {
            issueAndManageCards: '[pl] Issue and manage your Expensify Cards',
            getStartedIssuing: '[pl] Get started by issuing your first virtual or physical card.',
            verificationInProgress: '[pl] Verification in progress...',
            verifyingTheDetails: "[pl] We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                '[pl] The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                '[pl] Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: '[pl] Issue card',
            findCard: '[pl] Find card',
            newCard: '[pl] New card',
            name: '[pl] Name',
            lastFour: '[pl] Last 4',
            limit: '[pl] Limit',
            currentBalance: '[pl] Current balance',
            currentBalanceDescription: '[pl] Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: (settlementDate: string) => `[pl] Balance will be settled on ${settlementDate}`,
            settleBalance: '[pl] Settle balance',
            cardLimit: '[pl] Card limit',
            remainingLimit: '[pl] Remaining limit',
            requestLimitIncrease: '[pl] Request limit increase',
            remainingLimitDescription:
                '[pl] We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: '[pl] Cash back',
            earnedCashbackDescription: '[pl] Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: '[pl] Issue new card',
            finishSetup: '[pl] Finish setup',
            chooseBankAccount: '[pl] Choose bank account',
            chooseExistingBank: '[pl] Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: '[pl] Account ending in',
            addNewBankAccount: '[pl] Add a new bank account',
            settlementAccount: '[pl] Settlement account',
            settlementAccountDescription: '[pl] Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `[pl] Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: '[pl] Settlement frequency',
            settlementFrequencyDescription: '[pl] Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo: '[pl] If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            frequency: {
                daily: '[pl] Daily',
                monthly: '[pl] Monthly',
            },
            cardDetails: '[pl] Card details',
            cardPending: ({name}: {name: string}) => `[pl] Card is currently pending and will be issued once ${name}'s account is validated.`,
            virtual: '[pl] Virtual',
            physical: '[pl] Physical',
            deactivate: '[pl] Deactivate card',
            changeCardLimit: '[pl] Change card limit',
            changeLimit: '[pl] Change limit',
            smartLimitWarning: (limit: number | string) => `[pl] If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `[pl] If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `[pl] If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: '[pl] Change card limit type',
            changeLimitType: '[pl] Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `[pl] If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `[pl] If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: '[pl] Add shipping details',
            issuedCard: (assignee: string) => `[pl] issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `[pl] issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: (assignee: string, link: string) => `[pl] issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `[pl] ${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `[pl] ${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: (assignee: string, link: string) => `[pl] ${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: '[pl] card',
            replacementCard: '[pl] replacement card',
            verifyingHeader: '[pl] Verifying',
            bankAccountVerifiedHeader: '[pl] Bank account verified',
            verifyingBankAccount: '[pl] Verifying bank account...',
            verifyingBankAccountDescription: '[pl] Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: '[pl] Bank account verified!',
            bankAccountVerifiedDescription: '[pl] You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: '[pl] One more step...',
            oneMoreStepDescription: '[pl] Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: '[pl] Got it',
            goToConcierge: '[pl] Go to Concierge',
        },
        categories: {
            deleteCategories: '[pl] Delete categories',
            deleteCategoriesPrompt: '[pl] Are you sure you want to delete these categories?',
            deleteCategory: '[pl] Delete category',
            deleteCategoryPrompt: '[pl] Are you sure you want to delete this category?',
            disableCategories: '[pl] Disable categories',
            disableCategory: '[pl] Disable category',
            enableCategories: '[pl] Enable categories',
            enableCategory: '[pl] Enable category',
            defaultSpendCategories: '[pl] Default spend categories',
            spendCategoriesDescription: '[pl] Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: '[pl] An error occurred while deleting the category, please try again',
            categoryName: '[pl] Category name',
            requiresCategory: '[pl] Members must categorize all expenses',
            needCategoryForExportToIntegration: (connectionName: string) => `[pl] All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: '[pl] Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "[pl] You haven't created any categories",
                subtitle: '[pl] Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[pl] <muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: '[pl] An error occurred while updating the category, please try again',
            createFailureMessage: '[pl] An error occurred while creating the category, please try again',
            addCategory: '[pl] Add category',
            editCategory: '[pl] Edit category',
            editCategories: '[pl] Edit categories',
            findCategory: '[pl] Find category',
            categoryRequiredError: '[pl] Category name is required',
            existingCategoryError: '[pl] A category with this name already exists',
            invalidCategoryName: '[pl] Invalid category name',
            importedFromAccountingSoftware: '[pl] The categories below are imported from your',
            payrollCode: '[pl] Payroll code',
            updatePayrollCodeFailureMessage: '[pl] An error occurred while updating the payroll code, please try again',
            glCode: '[pl] GL code',
            updateGLCodeFailureMessage: '[pl] An error occurred while updating the GL code, please try again',
            importCategories: '[pl] Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: '[pl] Cannot delete or disable all categories',
                description: `[pl] At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: '[pl] Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: '[pl] Spend',
                subtitle: '[pl] Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: '[pl] Manage',
                subtitle: '[pl] Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: '[pl] Earn',
                subtitle: '[pl] Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: '[pl] Organize',
                subtitle: '[pl] Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: '[pl] Integrate',
                subtitle: '[pl] Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: '[pl] Distance rates',
                subtitle: '[pl] Add, update, and enforce rates.',
            },
            perDiem: {
                title: '[pl] Per diem',
                subtitle: '[pl] Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: '[pl] Travel',
                subtitle: '[pl] Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: '[pl] Get started with Expensify Travel',
                    subtitle: "[pl] We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "[pl] Let's go",
                },
                reviewingRequest: {
                    title: "[pl] Pack your bags, we've got your request...",
                    subtitle: "[pl] We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: '[pl] Request sent',
                },
                bookOrManageYourTrip: {
                    title: '[pl] Travel booking',
                    subtitle: "[pl] Congrats! You're all set to book and manage travel on this workspace.",
                    ctaText: '[pl] Manage travel',
                },
                settings: {
                    autoAddTripName: {
                        title: '[pl] Add trip names to expenses',
                        subtitle: '[pl] Automatically add trip names to expense descriptions for travel booked in Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '[pl] Travel booking',
                        subtitle: "[pl] Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: '[pl] Manage travel',
                    },
                    centralInvoicingSection: {
                        title: '[pl] Central invoicing',
                        subtitle: '[pl] Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: '[pl] Learn how.',
                        subsections: {
                            currentTravelSpendLabel: '[pl] Current travel spend',
                            currentTravelSpendPaymentQueued: (amount: string) => `[pl] Payment of ${amount} is queued and will be processed soon.`,
                            currentTravelSpendCta: '[pl] Pay balance',
                            currentTravelLimitLabel: '[pl] Current travel limit',
                            settlementAccountLabel: '[pl] Settlement account',
                            settlementFrequencyLabel: '[pl] Settlement frequency',
                            settlementFrequencyDescription: '[pl] How often Expensify will pull from your business bank account to settle recent Expensify Travel transactions.',
                            monthlySpendLimitLabel: '[pl] Monthly spend limit per member',
                            monthlySpendLimitDescription: '[pl] The maximum amount each member can spend on travel per month.',
                            reduceLimitTitle: '[pl] Reduce travel spend limit?',
                            reduceLimitWarning:
                                '[pl] If you reduce the limit, members who have already spent more than this amount will be unable to make new travel bookings until next month.',
                            provisioningError:
                                "[pl] We weren't able to provision some of the members of your workspace for central invoicing. Please try again later or reach out to Concierge for assistance.",
                        },
                    },
                    disableModal: {
                        title: '[pl] Turn off Travel Invoicing?',
                        body: '[pl] Upcoming hotel and car rental reservations may need to be re-booked with a different payment method to avoid cancellation.',
                        confirm: '[pl] Turn off',
                    },
                    outstandingBalanceModal: {
                        title: "[pl] Can't turn off Travel Invoicing",
                        body: '[pl] You still have an outstanding travel balance. Please pay your balance first.',
                        confirm: '[pl] Got it',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `[pl] Pay balance of ${amount}?`,
                        body: '[pl] The payment will be queued and processed shortly after. This action cannot be undone once started.',
                    },
                    exportToPDF: '[pl] Export to PDF',
                    exportToCSV: '[pl] Export to CSV',
                    selectDateRangeError: '[pl] Please select a date range to export',
                    invalidDateRangeError: '[pl] The start date must be before the end date',
                    enabled: '[pl] Central Invoicing enabled!',
                    enabledDescription: '[pl] All travel spend on this workspace will now be centralized in a monthly invoice.',
                },
                personalDetailsDescription: '[pl] In order to book travel, please enter your legal name as it appears on your government-issued ID.',
            },
            expensifyCard: {
                title: '[pl] Expensify Card',
                subtitle: '[pl] Gain insights and control over spend.',
                disableCardTitle: '[pl] Disable Expensify Card',
                disableCardPrompt: '[pl] You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: '[pl] Chat with Concierge',
                feed: {
                    title: '[pl] Get the Expensify Card',
                    subTitle: '[pl] Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: '[pl] Cash back on every US purchase',
                        unlimited: '[pl] Unlimited virtual cards',
                        spend: '[pl] Spend controls and custom limits',
                    },
                    ctaTitle: '[pl] Issue new card',
                },
            },
            companyCards: {
                title: '[pl] Company cards',
                subtitle: '[pl] Connect the cards you already have.',
                feed: {
                    title: '[pl] Bring your own cards (BYOC)',
                    subtitle: '[pl] Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: '[pl] Connect cards from 10,000+ banks',
                        assignCards: '[pl] Link your team’s existing cards',
                        automaticImport: '[pl] We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: '[pl] Bank connection issue',
                connectWithPlaid: '[pl] connect via Plaid',
                connectWithExpensifyCard: '[pl] try the Expensify Card.',
                bankConnectionDescription: `[pl] Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: '[pl] Disable company cards',
                disableCardPrompt: '[pl] You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: '[pl] Chat with Concierge',
                cardDetails: '[pl] Card details',
                cardNumber: '[pl] Card number',
                cardholder: '[pl] Cardholder',
                cardName: '[pl] Card name',
                allCards: '[pl] All cards',
                assignedCards: '[pl] Assigned',
                unassignedCards: '[pl] Unassigned',
                integrationExport: (integration: string, type?: string) => (integration && type ? `[pl] ${integration} ${type.toLowerCase()} export` : `[pl] ${integration} export`),
                integrationExportTitleXero: (integration: string) => `[pl] Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `[pl] Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: '[pl] Last updated',
                transactionStartDate: '[pl] Transaction start date',
                updateCard: '[pl] Update card',
                unassignCard: '[pl] Unassign card',
                unassign: '[pl] Unassign',
                unassignCardDescription: '[pl] Unassigning this card will delete all unsubmitted transactions.',
                assignCard: '[pl] Assign card',
                removeCard: '[pl] Remove card',
                remove: '[pl] Remove',
                removeCardDescription: '[pl] Removing this card will delete all unsubmitted transactions.',
                cardFeedName: '[pl] Card feed name',
                cardFeedNameDescription: '[pl] Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: '[pl] Delete transactions',
                cardFeedTransactionDescription: '[pl] Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: '[pl] Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: '[pl] Allow deleting transactions',
                removeCardFeed: '[pl] Remove card feed',
                removeCardFeedTitle: (feedName: string) => `[pl] Remove ${feedName} feed`,
                removeCardFeedDescription: '[pl] Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: '[pl] Card feed name is required',
                    statementCloseDateRequired: '[pl] Please select a statement close date.',
                },
                corporate: '[pl] Restrict deleting transactions',
                personal: '[pl] Allow deleting transactions',
                setFeedNameDescription: '[pl] Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: '[pl] When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: '[pl] No cards in this feed',
                emptyAddedFeedDescription: "[pl] Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `[pl] We're reviewing your request...`,
                pendingFeedDescription: `[pl] We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '[pl] Check your browser window',
                pendingBankDescription: (bankName: string) => `[pl] Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: '[pl] please click here',
                giveItNameInstruction: '[pl] Give the card a name that sets it apart from others.',
                updating: '[pl] Updating...',
                neverUpdated: '[pl] Never',
                noAccountsFound: '[pl] No accounts found',
                defaultCard: '[pl] Default card',
                downgradeTitle: `[pl] Can't downgrade workspace`,
                downgradeSubTitle: `[pl] This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `[pl] Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: '[pl] Get the Expensify Card',
                expensifyCardBannerSubtitle: '[pl] Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: '[pl] Learn more',
                statementCloseDateTitle: '[pl] Statement close date',
                statementCloseDateDescription: '[pl] Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: '[pl] Workflows',
                subtitle: '[pl] Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    '[pl] Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: '[pl] Invoices',
                subtitle: '[pl] Send and receive invoices.',
            },
            categories: {
                title: '[pl] Categories',
                subtitle: '[pl] Track and organize spend.',
            },
            tags: {
                title: '[pl] Tags',
                subtitle: '[pl] Classify costs and track billable expenses.',
            },
            taxes: {
                title: '[pl] Taxes',
                subtitle: '[pl] Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: '[pl] Report fields',
                subtitle: '[pl] Set up custom fields for spend.',
            },
            connections: {
                title: '[pl] Accounting',
                subtitle: '[pl] Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: '[pl] Receipt partners',
                subtitle: '[pl] Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '[pl] Not so fast...',
                featureEnabledText: "[pl] To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "[pl] To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: '[pl] Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '[pl] Disconnect Uber',
                disconnectText: '[pl] To disable this feature, please disconnect the Uber for Business integration first.',
                description: '[pl] Are you sure you want to disconnect this integration?',
                confirmText: '[pl] Got it',
            },
            workflowWarningModal: {
                featureEnabledTitle: '[pl] Not so fast...',
                featureEnabledText:
                    '[pl] Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: '[pl] Go to Expensify Cards',
            },
            rules: {
                title: '[pl] Rules',
                subtitle: '[pl] Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: '[pl] Time',
                subtitle: '[pl] Set a billable hourly rate for time tracking.',
                defaultHourlyRate: '[pl] Default hourly rate',
            },
        },
        reports: {
            reportsCustomTitleExamples: '[pl] Examples:',
            customReportNamesSubtitle: `[pl] <muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: '[pl] Default report title',
            customNameDescription: `[pl] Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: '[pl] Name',
            customNameEmailPhoneExample: '[pl] Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: '[pl] Report start date: {report:startdate}',
            customNameWorkspaceNameExample: '[pl] Workspace name: {report:workspacename}',
            customNameReportIDExample: '[pl] Report ID: {report:id}',
            customNameTotalExample: '[pl] Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: '[pl] Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: '[pl] Add field',
            delete: '[pl] Delete field',
            deleteFields: '[pl] Delete fields',
            findReportField: '[pl] Find report field',
            deleteConfirmation: '[pl] Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: '[pl] Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "[pl] You haven't created any report fields",
                subtitle: '[pl] Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "[pl] Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: '[pl] Disable report fields',
            disableReportFieldsConfirmation: '[pl] Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: '[pl] The report fields below are imported from your',
            textType: '[pl] Text',
            dateType: '[pl] Date',
            dropdownType: '[pl] List',
            formulaType: '[pl] Formula',
            textAlternateText: '[pl] Add a field for free text input.',
            dateAlternateText: '[pl] Add a calendar for date selection.',
            dropdownAlternateText: '[pl] Add a list of options to choose from.',
            formulaAlternateText: '[pl] Add a formula field.',
            nameInputSubtitle: '[pl] Choose a name for the report field.',
            typeInputSubtitle: '[pl] Choose what type of report field to use.',
            initialValueInputSubtitle: '[pl] Enter a starting value to show in the report field.',
            listValuesInputSubtitle: '[pl] These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: '[pl] These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: '[pl] Delete value',
            deleteValues: '[pl] Delete values',
            disableValue: '[pl] Disable value',
            disableValues: '[pl] Disable values',
            enableValue: '[pl] Enable value',
            enableValues: '[pl] Enable values',
            emptyReportFieldsValues: {
                title: "[pl] You haven't created any list values",
                subtitle: '[pl] Add custom values to appear on reports.',
            },
            deleteValuePrompt: '[pl] Are you sure you want to delete this list value?',
            deleteValuesPrompt: '[pl] Are you sure you want to delete these list values?',
            listValueRequiredError: '[pl] Please enter a list value name',
            existingListValueError: '[pl] A list value with this name already exists',
            editValue: '[pl] Edit value',
            listValues: '[pl] List values',
            addValue: '[pl] Add value',
            existingReportFieldNameError: '[pl] A report field with this name already exists',
            reportFieldNameRequiredError: '[pl] Please enter a report field name',
            reportFieldTypeRequiredError: '[pl] Please choose a report field type',
            circularReferenceError: "[pl] This field can't refer to itself. Please update.",
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `[pl] Formula field ${value} not recognized`,
            reportFieldInitialValueRequiredError: '[pl] Please choose a report field initial value',
            genericFailureMessage: '[pl] An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: '[pl] Tag name',
            requiresTag: '[pl] Members must tag all expenses',
            trackBillable: '[pl] Track billable expenses',
            customTagName: '[pl] Custom tag name',
            enableTag: '[pl] Enable tag',
            enableTags: '[pl] Enable tags',
            requireTag: '[pl] Require tag',
            requireTags: '[pl] Require tags',
            notRequireTags: '[pl] Don’t require',
            disableTag: '[pl] Disable tag',
            disableTags: '[pl] Disable tags',
            addTag: '[pl] Add tag',
            editTag: '[pl] Edit tag',
            editTags: '[pl] Edit tags',
            findTag: '[pl] Find tag',
            subtitle: '[pl] Tags add more detailed ways to classify costs.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `[pl] <muted-text>Tags add more detailed ways to classify costs. You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "[pl] You haven't created any tags",
                subtitle: '[pl] Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `[pl] <muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[pl] <muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: '[pl] Delete tag',
            deleteTags: '[pl] Delete tags',
            deleteTagConfirmation: '[pl] Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: '[pl] Are you sure that you want to delete these tags?',
            deleteFailureMessage: '[pl] An error occurred while deleting the tag, please try again',
            tagRequiredError: '[pl] Tag name is required',
            existingTagError: '[pl] A tag with this name already exists',
            invalidTagNameError: '[pl] Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: '[pl] An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: '[pl] Tags are managed in your',
            employeesSeeTagsAs: '[pl] Employees see tags as',
            glCode: '[pl] GL code',
            updateGLCodeFailureMessage: '[pl] An error occurred while updating the GL code, please try again',
            tagRules: '[pl] Tag rules',
            approverDescription: '[pl] Approver',
            importTags: '[pl] Import tags',
            importTagsSupportingText: '[pl] Code your expenses with one type of tag or many.',
            configureMultiLevelTags: '[pl] Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `[pl] Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: '[pl] The first row is the title for each tag list',
                independentTags: '[pl] These are independent tags',
                glAdjacentColumn: '[pl] There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: '[pl] Single level of tags',
                multiLevel: '[pl] Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '[pl] Switch Tag Levels',
                prompt1: '[pl] Switching tag levels will erase all current tags.',
                prompt2: '[pl]  We suggest you first',
                prompt3: '[pl]  download a backup',
                prompt4: '[pl]  by exporting your tags.',
                prompt5: '[pl]  Learn more',
                prompt6: '[pl]  about tag levels.',
            },
            overrideMultiTagWarning: {
                title: '[pl] Import tags',
                prompt1: '[pl] Are you sure?',
                prompt2: '[pl]  The existing tags will be overridden, but you can',
                prompt3: '[pl]  download a backup',
                prompt4: '[pl]  first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `[pl] We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: '[pl] Cannot delete or disable all tags',
                description: `[pl] At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: '[pl] Cannot make all tags optional',
                description: `[pl] At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: '[pl] Cannot make tag list required',
                description: '[pl] You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '[pl] 1 Tag',
                other: (count: number) => `[pl] ${count} Tags`,
            }),
        },
        taxes: {
            subtitle: '[pl] Add tax names, rates, and set defaults.',
            addRate: '[pl] Add rate',
            workspaceDefault: '[pl] Workspace currency default',
            foreignDefault: '[pl] Foreign currency default',
            customTaxName: '[pl] Custom tax name',
            value: '[pl] Value',
            taxReclaimableOn: '[pl] Tax reclaimable on',
            taxRate: '[pl] Tax rate',
            findTaxRate: '[pl] Find tax rate',
            error: {
                taxRateAlreadyExists: '[pl] This tax name is already in use',
                taxCodeAlreadyExists: '[pl] This tax code is already in use',
                valuePercentageRange: '[pl] Please enter a valid percentage between 0 and 100',
                customNameRequired: '[pl] Custom tax name is required',
                deleteFailureMessage: '[pl] An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: '[pl] An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: '[pl] An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: '[pl] The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: '[pl] Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `[pl] Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '[pl] Delete rate',
                deleteMultiple: '[pl] Delete rates',
                enable: '[pl] Enable rate',
                disable: '[pl] Disable rate',
                enableTaxRates: () => ({
                    one: '[pl] Enable rate',
                    other: '[pl] Enable rates',
                }),
                disableTaxRates: () => ({
                    one: '[pl] Disable rate',
                    other: '[pl] Disable rates',
                }),
            },
            importedFromAccountingSoftware: '[pl] The taxes below are imported from your',
            taxCode: '[pl] Tax code',
            updateTaxCodeFailureMessage: '[pl] An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: '[pl] Name your new workspace',
            selectFeatures: '[pl] Select features to copy',
            whichFeatures: '[pl] Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '[pl] \n\nDo you want to continue?',
            categories: '[pl] categories and your auto-categorization rules',
            reimbursementAccount: '[pl] reimbursement account',
            welcomeNote: '[pl] Please start using my new workspace',
            delayedSubmission: '[pl] delayed submission',
            merchantRules: '[pl] Merchant rules',
            merchantRulesCount: () => ({
                one: '[pl] 1 merchant rule',
                other: (count: number) => `[pl] ${count} merchant rules`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `[pl] You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: '[pl] An error occurred while duplicating your new workspace. Please try again.',
        },
        emptyWorkspace: {
            title: '[pl] No workspaces yet',
            subtitle: '[pl] Create a workspace to manage your expenses, reimbursements, and company cards.',
            createAWorkspaceCTA: '[pl] Get Started',
            features: {
                trackAndCollect: '[pl] Track and collect receipts',
                reimbursements: '[pl] Reimburse employees',
                companyCards: '[pl] Manage company cards',
            },
            notFound: '[pl] No workspace found',
            description: '[pl] Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: '[pl] New workspace',
            getTheExpensifyCardAndMore: '[pl] Get the Expensify Card and more',
            confirmWorkspace: '[pl] Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `[pl] My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `[pl] ${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '[pl] An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `[pl] Are you sure you want to remove ${memberName}?`,
                other: '[pl] Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `[pl] ${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '[pl] Remove member',
                other: '[pl] Remove members',
            }),
            findMember: '[pl] Find member',
            removeWorkspaceMemberButtonTitle: '[pl] Remove from workspace',
            removeGroupMemberButtonTitle: '[pl] Remove from group',
            removeRoomMemberButtonTitle: '[pl] Remove from chat',
            removeMemberPrompt: (memberName: string) => `[pl] Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '[pl] Remove member',
            transferOwner: '[pl] Transfer owner',
            makeMember: () => ({
                one: '[pl] Make member',
                other: '[pl] Make members',
            }),
            makeAdmin: () => ({
                one: '[pl] Make admin',
                other: '[pl] Make admins',
            }),
            makeAuditor: () => ({
                one: '[pl] Make auditor',
                other: '[pl] Make auditors',
            }),
            selectAll: '[pl] Select all',
            error: {
                genericAdd: '[pl] There was a problem adding this workspace member',
                cannotRemove: "[pl] You can't remove yourself or the workspace owner",
                genericRemove: '[pl] There was a problem removing that workspace member',
            },
            addedWithPrimary: '[pl] Some members were added with their primary logins.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `[pl] Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `[pl] Total workspace members: ${count}`,
            importMembers: '[pl] Import members',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `[pl] If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `[pl] ${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `[pl] You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[pl] If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[pl] If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `[pl] ${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: '[pl] Get started by issuing your first virtual or physical card.',
            issueCard: '[pl] Issue card',
            issueNewCard: {
                whoNeedsCard: '[pl] Who needs a card?',
                inviteNewMember: '[pl] Invite new member',
                findMember: '[pl] Find member',
                chooseCardType: '[pl] Choose a card type',
                physicalCard: '[pl] Physical card',
                physicalCardDescription: '[pl] Great for the frequent spender',
                virtualCard: '[pl] Virtual card',
                virtualCardDescription: '[pl] Instant and flexible',
                chooseLimitType: '[pl] Choose a limit type',
                smartLimit: '[pl] Smart Limit',
                smartLimitDescription: '[pl] Spend up to a certain amount before requiring approval',
                monthly: '[pl] Monthly',
                monthlyDescription: '[pl] Limit renews monthly',
                fixedAmount: '[pl] Fixed amount',
                fixedAmountDescription: '[pl] Spend until the limit is reached',
                setLimit: '[pl] Set a limit',
                cardLimitError: '[pl] Please enter an amount less than $21,474,836',
                giveItName: '[pl] Give it a name',
                giveItNameInstruction: '[pl] Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: '[pl] Card name',
                letsDoubleCheck: '[pl] Let’s double check that everything looks right.',
                willBeReadyToUse: '[pl] This card will be ready to use immediately.',
                willBeReadyToShip: '[pl] This card will be ready to ship immediately.',
                cardholder: '[pl] Cardholder',
                cardType: '[pl] Card type',
                limit: '[pl] Limit',
                limitType: '[pl] Limit type',
                disabledApprovalForSmartLimitError: '[pl] Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
                singleUse: '[pl] Single-use',
                singleUseDescription: '[pl] Expires after one transaction',
                validFrom: '[pl] Valid from',
                startDate: '[pl] Start date',
                endDate: '[pl] End date',
                noExpirationHint: "[pl] A card without an expiration date won't expire",
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `[pl] Valid from ${startDate} to ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `[pl] ${startDate} to ${endDate}`,
                combineWithExpiration: '[pl] Combine with expiration options for additional spend control',
                enterValidDate: '[pl] Enter a valid date',
                expirationDate: '[pl] Expiration date',
                limitAmount: '[pl] Limit amount',
                setExpiryOptions: '[pl] Set expiry options',
                setExpiryDate: '[pl] Set expiry date',
                setExpiryDateDescription: '[pl] Card will expire as listed on the card',
                amount: '[pl] Amount',
            },
            deactivateCardModal: {
                deactivate: '[pl] Deactivate',
                deactivateCard: '[pl] Deactivate card',
                deactivateConfirmation: '[pl] Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: '[pl] settings',
            title: '[pl] Connections',
            subtitle: '[pl] Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: '[pl] QuickBooks Online',
            qbd: '[pl] QuickBooks Desktop',
            xero: '[pl] Xero',
            netsuite: '[pl] NetSuite',
            intacct: '[pl] Sage Intacct',
            sap: '[pl] SAP',
            oracle: '[pl] Oracle',
            microsoftDynamics: '[pl] Microsoft Dynamics',
            talkYourOnboardingSpecialist: '[pl] Chat with your setup specialist.',
            talkYourAccountManager: '[pl] Chat with your account manager.',
            talkToConcierge: '[pl] Chat with Concierge.',
            needAnotherAccounting: '[pl] Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '[pl] QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '[pl] Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '[pl] NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '[pl] Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `[pl] There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '[pl] Go to Expensify Classic to manage your settings.',
            setup: '[pl] Connect',
            lastSync: (relativeDate: string) => `[pl] Last synced ${relativeDate}`,
            notSync: '[pl] Not synced',
            import: '[pl] Import',
            export: '[pl] Export',
            advanced: '[pl] Advanced',
            other: '[pl] Other',
            syncNow: '[pl] Sync now',
            disconnect: '[pl] Disconnect',
            reinstall: '[pl] Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[pl] integration';
                return `[pl] Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `[pl] Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[pl] accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "[pl] Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "[pl] Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "[pl] Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "[pl] Can't connect to QuickBooks Desktop";
                    default: {
                        return "[pl] Can't connect to integration";
                    }
                }
            },
            accounts: '[pl] Chart of accounts',
            taxes: '[pl] Taxes',
            imported: '[pl] Imported',
            notImported: '[pl] Not imported',
            importAsCategory: '[pl] Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '[pl] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '[pl] Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '[pl] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '[pl] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '[pl] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '[pl] Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: '[pl] NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[pl] this integration';
                return `[pl] Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `[pl] Are you sure you want to connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[pl] this accounting integration'}? This will remove any existing accounting connections.`,
            enterCredentials: '[pl] Enter your credentials',
            claimOffer: {
                badgeText: '[pl] Offer available!',
                xero: {
                    headline: '[pl] Get Xero free for 6 months!',
                    description: '[pl] <muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: '[pl] Connect to Xero',
                },
                uber: {
                    headerTitle: '[pl] Uber for Business',
                    headline: '[pl] Get 5% off Uber rides',
                    description: `[pl] <muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: '[pl] Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '[pl] Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '[pl] Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '[pl] Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '[pl] Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return '[pl] Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return '[pl] Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '[pl] Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '[pl] Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return '[pl] Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return '[pl] Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return '[pl] Importing Xero data';
                        case 'startingImportQBO':
                            return '[pl] Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '[pl] Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return '[pl] Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '[pl] Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return '[pl] Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '[pl] Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '[pl] Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return '[pl] Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '[pl] Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '[pl] Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '[pl] Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '[pl] Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '[pl] Updating report fields';
                        case 'jobDone':
                            return '[pl] Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return '[pl] Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return '[pl] Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return '[pl] Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return '[pl] Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '[pl] Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return '[pl] Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return '[pl] Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return '[pl] Syncing tax rates';
                        case 'xeroCheckConnection':
                            return '[pl] Checking Xero connection';
                        case 'xeroSyncTitle':
                            return '[pl] Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return '[pl] Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '[pl] Importing customers';
                        case 'netSuiteSyncInitData':
                            return '[pl] Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return '[pl] Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return '[pl] Importing items';
                        case 'netSuiteSyncData':
                            return '[pl] Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return '[pl] Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return '[pl] Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return '[pl] Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return '[pl] Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return '[pl] Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '[pl] Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '[pl] Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '[pl] Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return '[pl] Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return '[pl] Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return '[pl] Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '[pl] Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '[pl] Importing vendors';
                        case 'intacctCheckConnection':
                            return '[pl] Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return '[pl] Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return '[pl] Importing Sage Intacct data';
                        default: {
                            return `[pl] Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '[pl] Preferred exporter',
            exportPreferredExporterNote:
                '[pl] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[pl] Once set, the preferred exporter will see reports for export in their account.',
            exportAs: '[pl] Export as',
            exportOutOfPocket: '[pl] Export out-of-pocket expenses as',
            exportCompanyCard: '[pl] Export company card expenses as',
            exportDate: '[pl] Export date',
            defaultVendor: '[pl] Default vendor',
            autoSync: '[pl] Auto-sync',
            autoSyncDescription: '[pl] Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: '[pl] Sync reimbursed reports',
            cardReconciliation: '[pl] Card reconciliation',
            reconciliationAccount: '[pl] Reconciliation account',
            continuousReconciliation: '[pl] Continuous Reconciliation',
            saveHoursOnReconciliation:
                '[pl] Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `[pl] <muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '[pl] Choose the bank account that your Expensify Card payments will be reconciled against.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `[pl] Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        export: {
            notReadyHeading: '[pl] Not ready to export',
            notReadyDescription: '[pl] Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: '[pl] Send invoice',
            sendFrom: '[pl] Send from',
            invoicingDetails: '[pl] Invoicing details',
            invoicingDetailsDescription: '[pl] This info will appear on your invoices.',
            companyName: '[pl] Company name',
            companyWebsite: '[pl] Company website',
            paymentMethods: {
                personal: '[pl] Personal',
                business: '[pl] Business',
                chooseInvoiceMethod: '[pl] Choose a payment method below:',
                payingAsIndividual: '[pl] Paying as an individual',
                payingAsBusiness: '[pl] Paying as a business',
            },
            invoiceBalance: '[pl] Invoice balance',
            invoiceBalanceSubtitle: "[pl] This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: '[pl] Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: '[pl] Invite member',
            members: '[pl] Invite members',
            invitePeople: '[pl] Invite new members',
            genericFailureMessage: '[pl] An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `[pl] Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '[pl] user',
            users: '[pl] users',
            invited: '[pl] invited',
            removed: '[pl] removed',
            to: '[pl] to',
            from: '[pl] from',
        },
        inviteMessage: {
            confirmDetails: '[pl] Confirm details',
            inviteMessagePrompt: '[pl] Make your invitation extra special by adding a message below!',
            personalMessagePrompt: '[pl] Message',
            genericFailureMessage: '[pl] An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: '[pl] Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `[pl] ${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '[pl] Oops! Not so fast...',
            workspaceNeeds: '[pl] A workspace needs at least one enabled distance rate.',
            distance: '[pl] Distance',
            centrallyManage: '[pl] Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: '[pl] Rate',
            addRate: '[pl] Add rate',
            findRate: '[pl] Find rate',
            trackTax: '[pl] Track tax',
            deleteRates: () => ({
                one: '[pl] Delete rate',
                other: '[pl] Delete rates',
            }),
            enableRates: () => ({
                one: '[pl] Enable rate',
                other: '[pl] Enable rates',
            }),
            disableRates: () => ({
                one: '[pl] Disable rate',
                other: '[pl] Disable rates',
            }),
            enableRate: '[pl] Enable rate',
            status: '[pl] Status',
            unit: '[pl] Unit',
            taxFeatureNotEnabledMessage:
                '[pl] <muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: '[pl] Delete distance rate',
            areYouSureDelete: () => ({
                one: '[pl] Are you sure you want to delete this rate?',
                other: '[pl] Are you sure you want to delete these rates?',
            }),
            errors: {
                rateNameRequired: '[pl] Rate name is required',
                existingRateName: '[pl] A distance rate with this name already exists',
            },
        },
        editor: {
            descriptionInputLabel: '[pl] Description',
            nameInputLabel: '[pl] Name',
            typeInputLabel: '[pl] Type',
            initialValueInputLabel: '[pl] Initial value',
            nameInputHelpText: "[pl] This is the name you'll see on your workspace.",
            nameIsRequiredError: "[pl] You'll need to give your workspace a name",
            currencyInputLabel: '[pl] Default currency',
            currencyInputHelpText: '[pl] All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `[pl] The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: '[pl] Save',
            genericFailureMessage: '[pl] An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: '[pl] An error occurred uploading the avatar. Please try again.',
            addressContext: '[pl] A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: '[pl] Expense policy',
        },
        bankAccount: {
            continueWithSetup: '[pl] Continue setup',
            youAreAlmostDone: "[pl] You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: '[pl] Streamline payments',
            connectBankAccountNote: "[pl] Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: '[pl] One more thing!',
            allSet: "[pl] You're all set!",
            accountDescriptionWithCards: '[pl] This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "[pl] Let's finish in chat!",
            finishInChat: '[pl] Finish in chat',
            almostDone: '[pl] Almost done!',
            disconnectBankAccount: '[pl] Disconnect bank account',
            startOver: '[pl] Start over',
            updateDetails: '[pl] Update details',
            yesDisconnectMyBankAccount: '[pl] Yes, disconnect my bank account',
            yesStartOver: '[pl] Yes, start over',
            disconnectYourBankAccount: (bankName: string) =>
                `[pl] Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "[pl] Starting over will clear the progress you've made so far.",
            areYouSure: '[pl] Are you sure?',
            workspaceCurrency: '[pl] Workspace currency',
            updateCurrencyPrompt: '[pl] It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: '[pl] Update to USD',
            updateWorkspaceCurrency: '[pl] Update workspace currency',
            workspaceCurrencyNotSupported: '[pl] Workspace currency not supported',
            yourWorkspace: `[pl] Your workspace is set to an unsupported currency. View the <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: '[pl] Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: '[pl] Transfer owner',
            addPaymentCardTitle: '[pl] Enter your payment card to transfer ownership',
            addPaymentCardButtonText: '[pl] Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `[pl] <muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: '[pl] PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: '[pl] Bank level encryption',
            addPaymentCardRedundant: '[pl] Redundant infrastructure',
            addPaymentCardLearnMore: `[pl] <muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: '[pl] Outstanding balance',
            amountOwedButtonText: '[pl] OK',
            amountOwedText: '[pl] This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: '[pl] Outstanding balance',
            ownerOwesAmountButtonText: '[pl] Transfer balance',
            ownerOwesAmountText: (email: string, amount: string) => `[pl] The account owning this workspace (${email}) has an outstanding balance from a previous month.

Do you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: '[pl] Take over annual subscription',
            subscriptionButtonText: '[pl] Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `[pl] Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: '[pl] Duplicate subscription alert',
            duplicateSubscriptionButtonText: '[pl] Continue',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `[pl] It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.

Click "Continue" if you only want to take over billing for the workspace ${workspaceName}.

If you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '[pl] Cannot transfer ownership',
            hasFailedSettlementsButtonText: '[pl] Got it',
            hasFailedSettlementsText: (email: string) =>
                `[pl] You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '[pl] Failed to clear balance',
            failedToClearBalanceButtonText: '[pl] OK',
            failedToClearBalanceText: '[pl] We were unable to clear the balance. Please try again later.',
            successTitle: '[pl] Woohoo! All set.',
            successDescription: "[pl] You're now the owner of this workspace.",
            errorTitle: '[pl] Oops! Not so fast...',
            errorDescription: `[pl] <muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '[pl] Careful!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `[pl] The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Are you sure you want to export them again?`,
            confirmText: '[pl] Yes, export again',
            cancelText: '[pl] Cancel',
        },
        upgrade: {
            reportFields: {
                title: '[pl] Report fields',
                description: `[pl] Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: '[pl] NetSuite',
                description: `[pl] Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '[pl] Sage Intacct',
                description: `[pl] Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: '[pl] QuickBooks Desktop',
                description: `[pl] Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '[pl] Advanced Approvals',
                description: `[pl] If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            categories: {
                title: '[pl] Categories',
                description: '[pl] Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: '[pl] GL codes',
                description: `[pl] Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '[pl] GL & Payroll codes',
                description: `[pl] Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: '[pl] Tax codes',
                description: `[pl] Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: '[pl] Unlimited Company cards',
                description: `[pl] Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            rules: {
                title: '[pl] Rules',
                description: `[pl] Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.

Require expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: '[pl] Per diem',
                description:
                    '[pl] Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            travel: {
                title: '[pl] Travel',
                description: '[pl] Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            reports: {
                title: '[pl] Reports',
                description: '[pl] Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: '[pl] Multi-level tags',
                description:
                    '[pl] Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: '[pl] Distance rates',
                description: '[pl] Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: '[pl] Auditor',
                description: '[pl] Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '[pl] Multiple approval levels',
                description: '[pl] Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pl] <muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '[pl] per active member per month.',
                perMember: '[pl] per member per month.',
            },
            note: (subscriptionLink: string) => `[pl] <muted-text>Upgrade to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: '[pl] Unlock this feature',
            completed: {
                headline: `[pl] You've upgraded your workspace!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `[pl] <centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `[pl] You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `[pl] You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `[pl] You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: '[pl] Got it, thanks',
                createdWorkspace: `[pl] You've created a workspace!`,
            },
            commonFeatures: {
                title: '[pl] Upgrade to the Control plan',
                note: '[pl] Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `[pl] <muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pl] per member per month.` : `[pl] per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: '[pl] Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: '[pl] Smart expense rules',
                    benefit3: '[pl] Multi-level approval workflows',
                    benefit4: '[pl] Enhanced security controls',
                    toUpgrade: '[pl] To upgrade, click',
                    selectWorkspace: '[pl] select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `[pl] Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '[pl] Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '[pl] Downgrade to Collect',
                note: "[pl] You'll lose access to the following features",
                noteAndMore: '[pl] and more:',
                benefits: {
                    important: '[pl] IMPORTANT: ',
                    confirm: '[pl] You\'ll need to change the "Plan type" of every workspace to "Collect" in order to secure the Collect rate.',
                    benefit1Label: '[pl] ERP integrations',
                    benefit1: '[pl] NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: '[pl] HR integrations',
                    benefit2: '[pl] Workday, Certinia',
                    benefit3Label: '[pl] Security',
                    benefit3: '[pl] SSO/SAML',
                    benefit4Label: '[pl] Advanced',
                    benefit4: '[pl] Smart expense rules, per diems, multi-level approvals, custom reporting, and budgeting',
                    headsUp: '[pl] Heads up!',
                    multiWorkspaceNote: '[pl] You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '[pl] > select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: '[pl] Your workspace has been downgraded',
                description: '[pl] You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: '[pl] Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: '[pl] Pay & downgrade',
            headline: '[pl] Your final payment',
            description1: (formattedAmount: string) => `[pl] Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `[pl] See your breakdown below for ${date}:`,
            subscription:
                '[pl] Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: '[pl] An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: '[pl] Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `[pl] Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `[pl] Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "[pl] You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: '[pl] Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: '[pl] Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: '[pl] Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: '[pl] Chat with your admin',
            chatInAdmins: '[pl] Chat in #admins',
            addPaymentCard: '[pl] Add payment card',
            goToSubscription: '[pl] Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: '[pl] Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `[pl] <muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: '[pl] Receipt required amount',
                receiptRequiredAmountDescription: '[pl] Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `[pl] Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: '[pl] Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: '[pl] Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `[pl] Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: '[pl] Max expense amount',
                maxExpenseAmountDescription: '[pl] Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: '[pl] Max age',
                maxExpenseAge: '[pl] Max expense age',
                maxExpenseAgeDescription: '[pl] Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '[pl] 1 day',
                    other: (count: number) => `[pl] ${count} days`,
                }),
                cashExpenseDefault: '[pl] Cash expense default',
                cashExpenseDefaultDescription:
                    '[pl] Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: '[pl] Reimbursable',
                reimbursableDefaultDescription: '[pl] Expenses are most often paid back to employees',
                nonReimbursableDefault: '[pl] Non-reimbursable',
                nonReimbursableDefaultDescription: '[pl] Expenses are occasionally paid back to employees',
                alwaysReimbursable: '[pl] Always reimbursable',
                alwaysReimbursableDescription: '[pl] Expenses are always paid back to employees',
                alwaysNonReimbursable: '[pl] Always non-reimbursable',
                alwaysNonReimbursableDescription: '[pl] Expenses are never paid back to employees',
                billableDefault: '[pl] Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `[pl] <muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: '[pl] Billable',
                billableDescription: '[pl] Expenses are most often re-billed to clients',
                nonBillable: '[pl] Non-billable',
                nonBillableDescription: '[pl] Expenses are occasionally re-billed to clients',
                eReceipts: '[pl] eReceipts',
                eReceiptsHint: `[pl] eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: '[pl] Attendee tracking',
                attendeeTrackingHint: '[pl] Track the per-person cost for every expense.',
                prohibitedDefaultDescription: '[pl] Flag receipts with these line items for manual review.',
                prohibitedExpenses: '[pl] Prohibited expenses',
                alcohol: '[pl] Alcohol',
                hotelIncidentals: '[pl] Hotel incidentals',
                gambling: '[pl] Gambling',
                tobacco: '[pl] Tobacco',
                adultEntertainment: '[pl] Adult entertainment',
                requireCompanyCard: '[pl] Require company cards for all purchases',
                requireCompanyCardDescription: '[pl] Flag all cash spend, including mileage and per-diem expenses.',
                requireCompanyCardDisabledTooltip: '[pl] Enable Company cards (under More features) to unlock.',
            },
            expenseReportRules: {
                title: '[pl] Advanced',
                subtitle: '[pl] Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: '[pl] Prevent self-approvals',
                preventSelfApprovalsSubtitle: '[pl] Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: '[pl] Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: '[pl] Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: '[pl] Auto-approve reports with all expenses under',
                autoApproveReportsUnderDescription: '[pl] Fully compliant expense reports where all expenses are under this amount will be automatically approved.',
                randomReportAuditTitle: '[pl] Random report audit',
                randomReportAuditDescription: '[pl] Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: '[pl] Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: '[pl] Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `[pl] Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: '[pl] Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: '[pl] Auto-pay reports under',
                autoPayReportsUnderDescription: '[pl] Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `[pl] Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[pl] Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: '[pl] Merchant',
                subtitle: '[pl] Set merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: '[pl] Add merchant rule',
                findRule: '[pl] Find merchant rule',
                addRuleTitle: '[pl] Add rule',
                editRuleTitle: '[pl] Edit rule',
                expensesWith: '[pl] For expenses with:',
                expensesExactlyMatching: '[pl] For expenses exactly matching:',
                applyUpdates: '[pl] Apply these updates:',
                saveRule: '[pl] Save rule',
                previewMatches: '[pl] Preview matches',
                confirmError: '[pl] Enter merchant and apply at least one update',
                confirmErrorMerchant: '[pl] Please enter merchant',
                confirmErrorUpdate: '[pl] Please apply at least one update',
                previewMatchesEmptyStateTitle: '[pl] Nothing to show',
                previewMatchesEmptyStateSubtitle: '[pl] No unsubmitted expenses match this rule.',
                deleteRule: '[pl] Delete rule',
                deleteRuleConfirmation: '[pl] Are you sure you want to delete this rule?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `[pl] If merchant ${isExactMatch ? '[pl] exactly matches' : '[pl] contains'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `[pl] Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `[pl] Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `[pl] Mark as  "${reimbursable ? '[pl] reimbursable' : '[pl] non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `[pl] Mark as "${billable ? '[pl] billable' : '[pl] non-billable'}"`,
                matchType: '[pl] Match type',
                matchTypeContains: '[pl] Contains',
                matchTypeExact: '[pl] Exactly matches',
                duplicateRuleTitle: '[pl] Similar merchant rule already exists',
                duplicateRulePrompt: (merchantName: string) => `[pl] Your existing rule for "${merchantName}" will take priority over this one. Save anyway?`,
                saveAnyway: '[pl] Save anyway',
                applyToExistingUnsubmittedExpenses: '[pl] Apply to existing unsubmitted expenses',
            },
            categoryRules: {
                title: '[pl] Category rules',
                approver: '[pl] Approver',
                requireDescription: '[pl] Require description',
                requireFields: '[pl] Require fields',
                requiredFieldsTitle: '[pl] Required fields',
                requiredFieldsDescription: (categoryName: string) => `[pl] This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: '[pl] Require attendees',
                descriptionHint: '[pl] Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `[pl] Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: '[pl] Hint',
                descriptionHintSubtitle: '[pl] Pro-tip: The shorter the better!',
                maxAmount: '[pl] Max amount',
                flagAmountsOver: '[pl] Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `[pl] Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: '[pl] This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: '[pl] Individual expense',
                    expenseSubtitle: '[pl] Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: '[pl] Category total',
                    dailySubtitle: '[pl] Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: '[pl] Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `[pl] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[pl] Never require receipts',
                    always: '[pl] Always require receipts',
                },
                requireItemizedReceiptsOver: '[pl] Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `[pl] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[pl] Never require itemized receipts',
                    always: '[pl] Always require itemized receipts',
                },
                defaultTaxRate: '[pl] Default tax rate',
                enableWorkflows: (moreFeaturesLink: string) => `[pl] Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: '[pl] Expense policy',
                cardSubtitle: "[pl] Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
            },
            spendRules: {
                title: '[pl] Spend',
                subtitle: '[pl] Approve or decline Expensify Card transactions in realtime.',
                defaultRuleDescription: '[pl] All cards',
                block: '[pl] Block',
                defaultRuleTitle: '[pl] Categories: Adult services, ATMs, gambling, money transfers',
                builtInProtectionModal: {
                    title: '[pl] Expensify Cards offer built-in protection - always',
                    description: `[pl] Expensify always declines these charges:

  • Adult services
  • ATMs
  • Gambling
  • Money transfers

Add more spend rules to protect company cash flow.`,
                },
                addSpendRule: '[pl] Add spend rule',
                editRuleTitle: '[pl] Edit rule',
                cardPageTitle: '[pl] Card',
                cardsSectionTitle: '[pl] Cards',
                chooseCards: '[pl] Choose cards',
                saveRule: '[pl] Save rule',
                deleteRule: '[pl] Delete rule',
                deleteRuleConfirmation: '[pl] Are you sure you want to delete this rule?',
                allow: '[pl] Allow',
                spendRuleSectionTitle: '[pl] Spend rule',
                restrictionType: '[pl] Restriction type',
                restrictionTypeHelpAllow: "[pl] Charges are approved if they match any merchant or category, and don't exceed a max amount.",
                restrictionTypeHelpBlock: '[pl] Charges are declined if they match any merchant or category, or exceed a max amount.',
                addMerchant: '[pl] Add merchant',
                merchantContains: '[pl] Merchant contains',
                merchantExactlyMatches: '[pl] Merchant exactly matches',
                noBlockedMerchants: '[pl] No blocked merchants',
                addMerchantToBlockSpend: '[pl] Add a merchant to block spend',
                noAllowedMerchants: '[pl] No allowed merchants',
                addMerchantToAllowSpend: '[pl] Add a merchant to allow spend',
                matchType: '[pl] Match type',
                matchTypeContains: '[pl] Contains',
                matchTypeExact: '[pl] Matches exactly',
                spendCategory: '[pl] Spend category',
                maxAmount: '[pl] Max amount',
                maxAmountHelp: '[pl] Any charge over this amount will be declined, regardless of merchant and spend category restrictions.',
                currencyMismatchTitle: '[pl] Currency mismatch',
                currencyMismatchPrompt: '[pl] To set a max amount, select cards that settle in the same currency.',
                reviewSelectedCards: '[pl] Review selected cards',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => `[pl] ${summary}, +${count} more`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '[pl] Apply at least one spend rule to one card',
                confirmErrorCardRequired: '[pl] Card is a required field',
                confirmErrorApplyAtLeastOneSpendRule: '[pl] Apply at least one spend rule',
                categories: '[pl] Categories',
                merchants: '[pl] Merchants',
                noAvailableCards: '[pl] All cards already have a rule',
                noAvailableCardsSubtitle: '[pl] Edit an existing card rule to make changes',
                noCardsIssuedTitle: '[pl] No Expensify cards issued',
                noCardsIssuedSubtitle: '[pl] Issue Expensify cards to create spend rules',
                max: '[pl] Max',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '[pl] Airlines',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '[pl] Alcohol and bars',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: '[pl] Amazon and bookstores',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '[pl] Automotive',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: '[pl] Car rentals',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '[pl] Dining',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '[pl] Fuel and gas',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '[pl] Government and non-profits',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '[pl] Groceries',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: '[pl] Gyms and fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '[pl] Healthcare',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: '[pl] Hotels',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: '[pl] Internet and phone',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '[pl] Office supplies',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '[pl] Parking and tolls',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: '[pl] Professional services',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '[pl] Retail',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '[pl] Shipping and delivery',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: '[pl] Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '[pl] Transit and rideshare',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '[pl] Travel agencies',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '[pl] Collect',
                    description: '[pl] For teams looking to automate their processes.',
                },
                corporate: {
                    label: '[pl] Control',
                    description: '[pl] For organizations with advanced requirements.',
                },
            },
            description: "[pl] Choose a plan that's right for you. For a detailed list of features and pricing, check out our",
            subscriptionLink: '[pl] plan types and pricing help page',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `[pl] You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `[pl] You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: '[pl] Subscriptions',
        },
    },
    getAssistancePage: {
        title: '[pl] Get assistance',
        subtitle: "[pl] We're here to clear your path to greatness!",
        description: '[pl] Choose from the support options below:',
        chatWithConcierge: '[pl] Chat with Concierge',
        scheduleSetupCall: '[pl] Schedule a setup call',
        scheduleACall: '[pl] Schedule call',
        questionMarkButtonTooltip: '[pl] Get assistance from our team',
        exploreHelpDocs: '[pl] Explore help docs',
        registerForWebinar: '[pl] Register for webinar',
        onboardingHelp: '[pl] Onboarding help',
    },
    emojiPicker: {
        emojiNotSelected: '[pl] Emoji not selected',
        skinTonePickerLabel: '[pl] Change default skin tone',
        headers: {
            frequentlyUsed: '[pl] Frequently Used',
            smileysAndEmotion: '[pl] Smileys & Emotion',
            peopleAndBody: '[pl] People & Body',
            animalsAndNature: '[pl] Animals & Nature',
            foodAndDrink: '[pl] Food & Drinks',
            travelAndPlaces: '[pl] Travel & Places',
            activities: '[pl] Activities',
            objects: '[pl] Objects',
            symbols: '[pl] Symbols',
            flags: '[pl] Flags',
        },
    },
    newRoomPage: {
        newRoom: '[pl] New room',
        groupName: '[pl] Group name',
        roomName: '[pl] Room name',
        visibility: '[pl] Visibility',
        restrictedDescription: '[pl] People in your workspace can find this room',
        privateDescription: '[pl] People invited to this room can find it',
        publicDescription: '[pl] Anyone can find this room',
        public_announceDescription: '[pl] Anyone can find this room',
        createRoom: '[pl] Create room',
        roomAlreadyExistsError: '[pl] A room with this name already exists',
        roomNameReservedError: (reservedName: string) => `[pl] ${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '[pl] Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: '[pl] Please enter a room name',
        pleaseSelectWorkspace: '[pl] Please select a workspace',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `[pl] ${actor}renamed to "${newName}" (previously "${oldName}")` : `[pl] ${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: (newName: string) => `[pl] Room renamed to ${newName}`,
        social: '[pl] social',
        selectAWorkspace: '[pl] Select a workspace',
        growlMessageOnRenameError: '[pl] Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: '[pl] Workspace',
            private: '[pl] Private',
            public: '[pl] Public',
            public_announce: '[pl] Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '[pl] Submit and Close',
        submitAndApprove: '[pl] Submit and Approve',
        advanced: '[pl] ADVANCED',
        dynamicExternal: '[pl] DYNAMIC_EXTERNAL',
        smartReport: '[pl] SMARTREPORT',
        billcom: '[pl] BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[pl] set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[pl] removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `[pl] changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `[pl] changed the company address to "${newAddress}" (previously "${previousAddress}")` : `[pl] set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[pl] added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[pl] removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `[pl] changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `[pl] added the category "${categoryName}"`,
        deleteCategory: (categoryName: string) => `[pl] removed the category "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `[pl] ${oldValue ? '[pl] disabled' : '[pl] enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[pl] added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[pl] removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[pl] changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[pl] added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[pl] removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[pl] changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `[pl] changed the "${categoryName}" category description to ${!oldValue ? '[pl] required' : '[pl] not required'} (previously ${!oldValue ? '[pl] not required' : '[pl] required'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `[pl] added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `[pl] removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `[pl] changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[pl] added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `[pl] changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[pl] updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `[pl] changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `[pl] updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `[pl] changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `[pl] renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `[pl] removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }
            return !oldValue
                ? `[pl] added the description hint "${newValue}" to the category "${categoryName}"`
                : `[pl] changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategories: (count: number) => `[pl] updated ${count} categories`,
        updateTagListName: (oldName: string, newName: string) => `[pl] changed the tag list name to "${newName}" (previously "${oldName}")`,
        updateTagList: (tagListName: string) => `[pl] updated tags on the list "${tagListName}"`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `[pl] changed tag list "${tagListsName}" to ${isRequired ? '[pl] required' : '[pl] not required'}`,
        importTags: '[pl] imported tags from a spreadsheet',
        deletedAllTags: '[pl] deleted all tags',
        addTag: (tagListName: string, tagName?: string) => `[pl] added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `[pl] updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `[pl] removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `[pl] removed "${count}" tags from the list "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `[pl] updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `[pl] updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `[pl] changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `[pl] ${newValue ? '[pl] enabled' : '[pl] disabled'} tax tracking on distance rates`,
        updateCustomUnitDefaultCategory: ({customUnitName, newValue, oldValue}: UpdatePolicyCustomUnitDefaultCategoryParams) =>
            `[pl] changed the ${customUnitName} default category to "${newValue}" ${oldValue ? `[pl] (previously "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `[pl] imported rates for custom unit "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `[pl] added a new ${customUnitName} rate "${rateName}"`,
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `[pl] removed the "${customUnitName}" rate "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `[pl] changed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${customUnitSubRateName}" ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `[pl] removed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${removedSubRateName}"`,
        addedReportField: ({fieldType, fieldName, defaultValue}: AddedOrDeletedPolicyReportFieldParams) =>
            `[pl] added ${fieldType} report field "${fieldName}"${defaultValue ? `[pl]  with default value "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `[pl] changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `[pl] changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `[pl] added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `[pl] changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `[pl] added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `[pl] ${newValue ? '[pl] enabled' : '[pl] disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `[pl] set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `[pl] added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `[pl] removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `[pl] ${optionEnabled ? '[pl] enabled' : '[pl] disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `[pl] ${allEnabled ? '[pl] enabled' : '[pl] disabled'} all options for the report field "${fieldName}" `;
            }
            return `[pl] ${allEnabled ? '[pl] enabled' : '[pl] disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? '[pl] enabled' : '[pl] disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `[pl] removed ${fieldType} Report Field "${fieldName}"`,
        addedCardFeed: (feedName: string) => `[pl] added card feed "${feedName}"`,
        removedCardFeed: (feedName: string) => `[pl] removed card feed "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `[pl] renamed card feed to "${newName}" (previously "${oldName}")`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) => `[pl] assigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[pl] unassigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} cardholders to delete card transactions for card feed "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `[pl] changed card feed "${feedName}" statement period end day${newValue ? `[pl]  to "${newValue}"` : ''}${previousValue ? `[pl]  (previously "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `[pl] updated "Prevent self-approval" to "${newValue === 'true' ? '[pl] Enabled' : '[pl] Disabled'}" (previously "${oldValue === 'true' ? '[pl] Enabled' : '[pl] Disabled'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `[pl] set the monthly report submission date to "${newValue}"`;
            }
            return `[pl] updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `[pl] updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `[pl] updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `[pl] turned "Enforce default report titles" ${value ? '[pl] on' : '[pl] off'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `[pl] changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `[pl] updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `[pl] set the description of this workspace to "${newDescription}"`
                : `[pl] updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('[pl]  and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `[pl] removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `[pl] removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `[pl] updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `[pl] updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `[pl] updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `[pl] updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: '[pl] upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `[pl] This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: '[pl] downgraded this workspace to the Collect plan',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `[pl] changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `[pl] changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        addBudget: ({frequency, entityName, entityType, shared, individual, notificationThreshold}: AddBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[pl]  with notification threshold of "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `[pl] added ${frequency} individual budget of "${individual}" and ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            if (typeof individual !== 'undefined') {
                return `[pl] added ${frequency} individual budget of "${individual}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            return `[pl] added ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
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
                changesList.push(`[pl] changed budget frequency to "${newFrequency}" (previously "${oldFrequency}")`);
            }
            if (sharedChanged) {
                changesList.push(`[pl] changed total workspace budget to "${newShared}" (previously "${oldShared}")`);
            }
            if (individualChanged) {
                changesList.push(`[pl] changed individual budget to "${newIndividual}" (previously "${oldIndividual}")`);
            }
            if (thresholdChanged) {
                changesList.push(`[pl] changed notification threshold to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `[pl] updated budget for the ${entityType} "${entityName}"`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `[pl] changed budget frequency for the ${entityType} "${entityName}" to "${newFrequency}" (previously "${oldFrequency}")`;
                }
                if (sharedChanged) {
                    return `[pl] changed total workspace budget for the ${entityType} "${entityName}" to "${newShared}" (previously "${oldShared}")`;
                }
                if (individualChanged) {
                    return `[pl] changed individual budget for the ${entityType} "${entityName}" to "${newIndividual}" (previously "${oldIndividual}")`;
                }
                return `[pl] changed notification threshold for the ${entityType} "${entityName}" to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`;
            }
            return `[pl] updated budget for the ${entityType} "${entityName}": ${changesList.join('; ')}`;
        },
        deleteBudget: ({entityType, entityName, frequency, individual, shared, notificationThreshold}: DeleteBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[pl]  with notification threshold of "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `[pl] removed ${frequency} shared budget of "${shared}" and individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (shared) {
                return `[pl] removed ${frequency} shared budget of "${shared}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `[pl] removed ${frequency} individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            return `[pl] removed budget from the ${entityType} "${entityName}"`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} time tracking`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `[pl] changed hourly rate to "${newRate}" (previously "${oldRate}")`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[pl] added "${prohibitedExpense}" to prohibited expenses`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[pl] removed "${prohibitedExpense}" from prohibited expenses`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `[pl] changed reimbursement method to "${newReimbursementChoice}" (previously "${oldReimbursementChoice}")`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} pre-approval of workspace join requests`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `[pl] changed custom report name formula to "${newDefaultTitle}" (previously "${oldDefaultTitle}")`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `[pl] took over ownership of ${policyName} from ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} scheduled submit`,
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
            `[pl] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". ${userEmail} is currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}.${summaryLink ? `[pl]  <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
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
            `[pl] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". You're currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}. ${summaryLink ? `[pl] <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} categories`;
                case 'tags':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} tags`;
                case 'workflows':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} workflows`;
                case 'distance rates':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} distance rates`;
                case 'accounting':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} accounting`;
                case 'Expensify Cards':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} Expensify Cards`;
                case 'travel invoicing':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} travel invoicing`;
                case 'company cards':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} company cards`;
                case 'invoicing':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} invoicing`;
                case 'per diem':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} per diem`;
                case 'receipt partners':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} receipt partners`;
                case 'rules':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} rules`;
                case 'tax tracking':
                    return `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} tax tracking`;
                default:
                    return `${enabled ? '[pl] enabled' : '[pl] disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} attendee tracking`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} auto-pay approved reports`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `[pl] set the auto-pay approved reports threshold to "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `[pl] changed the auto-pay approved reports threshold to "${newLimit}" (previously "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: '[pl] removed the auto-pay approved reports threshold',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `[pl] changed the default approver to ${newApprover} (previously ${previousApprover})` : `[pl] changed the default approver to ${newApprover}`,
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
            let text = `[pl] changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `[pl]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[pl]  (previously default approver)';
            } else if (previousApprover) {
                text += `[pl]  (previously ${previousApprover})`;
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
                ? `[pl] changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `[pl] changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += `[pl]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[pl]  (previously default approver)';
            } else if (previousApprover) {
                text += `[pl]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[pl] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `[pl] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[pl] changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `[pl] changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[pl] changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `[pl] set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[pl] changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `[pl] set the invoice company website to "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser ? `[pl] changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")` : `[pl] changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: (enabled: boolean) => `[pl] ${enabled ? '[pl] enabled' : '[pl] disabled'} reimbursements`,
        updateCustomTaxName: ({oldName, newName}: UpdatedPolicyCustomTaxNameParams) => `[pl] changed the custom tax name to "${newName}" (previously "${oldName}")`,
        updateCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyCurrencyDefaultTaxParams) =>
            `[pl] changed the workspace currency default tax rate to "${newName}" (previously "${oldName}")`,
        updateForeignCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyForeignCurrencyDefaultTaxParams) =>
            `[pl] changed the foreign currency default tax rate to "${newName}" (previously "${oldName}")`,
        addTax: (taxName: string) => `[pl] added the tax "${taxName}"`,
        deleteTax: (taxName: string) => `[pl] removed the tax "${taxName}"`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `[pl] renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `[pl] changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `[pl] changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `[pl] ${oldValue ? '[pl] disabled' : '[pl] enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `[pl] set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[pl] changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: (oldValue: string) => `[pl] removed receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `[pl] set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `[pl] changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: (oldValue: string) => `[pl] removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: (newValue: string) => `[pl] set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `[pl] changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `[pl] removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: '[pl] Member not found.',
        useInviteButton: '[pl] To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `[pl] You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `[pl] It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `[pl] Are you sure you want to remove ${memberName} from the room?`,
            other: '[pl] Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: '[pl] There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: '[pl] Assign task',
        assignMe: '[pl] Assign to me',
        confirmTask: '[pl] Confirm task',
        confirmError: '[pl] Please enter a title and select a share destination',
        descriptionOptional: '[pl] Description (optional)',
        pleaseEnterTaskName: '[pl] Please enter a title',
        pleaseEnterTaskDestination: '[pl] Please select where you want to share this task',
    },
    task: {
        task: '[pl] Task',
        title: '[pl] Title',
        description: '[pl] Description',
        assignee: '[pl] Assignee',
        completed: '[pl] Completed',
        action: '[pl] Complete',
        messages: {
            created: (title: string) => `[pl] task for ${title}`,
            completed: '[pl] marked as complete',
            canceled: '[pl] deleted task',
            reopened: '[pl] marked as incomplete',
            error: "[pl] You don't have permission to take the requested action",
        },
        markAsComplete: '[pl] Mark as complete',
        markAsIncomplete: '[pl] Mark as incomplete',
        assigneeError: '[pl] An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: '[pl] There was an error creating this task. Please try again later.',
        deleteTask: '[pl] Delete task',
        deleteConfirmation: '[pl] Are you sure you want to delete this task?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `[pl] ${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '[pl] Keyboard shortcuts',
        subtitle: '[pl] Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: '[pl] Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: '[pl] Mark all messages as read',
            escape: '[pl] Escape dialogs',
            search: '[pl] Open search dialog',
            newChat: '[pl] New chat screen',
            copy: '[pl] Copy comment',
            openDebug: '[pl] Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: '[pl] Screen share',
        screenShareRequest: '[pl] Expensify is inviting you to a screen share',
    },
    search: {
        resultsAreLimited: '[pl] Search results are limited.',
        viewResults: '[pl] View results',
        appliedFilters: '[pl] Applied filters',
        resetFilters: '[pl] Reset filters',
        searchResults: {
            emptyResults: {
                title: '[pl] Nothing to show',
                subtitle: `[pl] Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "[pl] You haven't created any expenses yet",
                subtitle: '[pl] Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[pl] Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "[pl] You haven't created any reports yet",
                subtitle: '[pl] Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[pl] Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    [pl] You haven't created any
                    invoices yet
                `),
                subtitle: '[pl] Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[pl] Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: '[pl] No trips to display',
                subtitle: '[pl] Get started by booking your first trip below.',
                buttonText: '[pl] Book a trip',
            },
            emptySubmitResults: {
                title: '[pl] No expenses to submit',
                subtitle: "[pl] You're all clear. Take a victory lap!",
                buttonText: '[pl] Create report',
            },
            emptyApproveResults: {
                title: '[pl] No expenses to approve',
                subtitle: '[pl] Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: '[pl] No expenses to pay',
                subtitle: '[pl] Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: '[pl] No expenses to export',
                subtitle: '[pl] Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: '[pl] No expenses to display',
                subtitle: '[pl] No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: '[pl] No expenses to approve',
                subtitle: '[pl] Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: '[pl] Columns',
        editColumns: '[pl] Edit columns',
        resetColumns: '[pl] Reset columns',
        groupColumns: '[pl] Group columns',
        expenseColumns: '[pl] Expense Columns',
        statements: '[pl] Statements',
        cardStatements: '[pl] Card statements',
        monthlyAccrual: '[pl] Monthly accrual',
        unapprovedCash: '[pl] Unapproved cash',
        unapprovedCard: '[pl] Unapproved card',
        reconciliation: '[pl] Reconciliation',
        topSpenders: '[pl] Top spenders',
        saveSearch: '[pl] Save search',
        deleteSavedSearch: '[pl] Delete saved search',
        deleteSavedSearchConfirm: '[pl] Are you sure you want to delete this search?',
        searchName: '[pl] Search name',
        savedSearchesMenuItemTitle: '[pl] Saved',
        topCategories: '[pl] Top categories',
        topMerchants: '[pl] Top merchants',
        spendOverTime: '[pl] Spend over time',
        groupedExpenses: '[pl] grouped expenses',
        bulkActions: {
            editMultiple: '[pl] Edit multiple',
            editMultipleTitle: '[pl] Edit multiple expenses',
            editMultipleDescription: "[pl] Changes will be set for all selected expenses and will override any previously set values. Just sayin'.",
            approve: '[pl] Approve',
            pay: '[pl] Pay',
            delete: '[pl] Delete',
            hold: '[pl] Hold',
            unhold: '[pl] Remove hold',
            reject: '[pl] Reject',
            duplicateExpense: ({count}: {count: number}) => `[pl] Duplicate ${count === 1 ? '[pl] expense' : '[pl] expenses'}`,
            undelete: '[pl] Undelete',
            noOptionsAvailable: '[pl] No options available for the selected group of expenses.',
        },
        filtersHeader: '[pl] Filters',
        filters: {
            date: {
                before: (date?: string) => `[pl] Before ${date ?? ''}`,
                after: (date?: string) => `[pl] After ${date ?? ''}`,
                on: (date?: string) => `[pl] On ${date ?? ''}`,
                customDate: '[pl] Custom date',
                customRange: '[pl] Custom range',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '[pl] Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '[pl] Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '[pl] This month',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '[pl] Year to date',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '[pl] Last 12 months',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '[pl] Last statement',
                },
            },
            status: '[pl] Status',
            keyword: '[pl] Keyword',
            keywords: '[pl] Keywords',
            limit: '[pl] Limit',
            limitDescription: '[pl] Set a limit for the results of your search.',
            currency: '[pl] Currency',
            completed: '[pl] Completed',
            amount: {
                lessThan: (amount?: string) => `[pl] Less than ${amount ?? ''}`,
                greaterThan: (amount?: string) => `[pl] Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `[pl] Between ${greaterThan} and ${lessThan}`,
                equalTo: (amount?: string) => `[pl] Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: '[pl] Expensify',
                individualCards: '[pl] Individual cards',
                closedCards: '[pl] Closed cards',
                cardFeeds: '[pl] Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `[pl] All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `[pl] All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `[pl] ${name} is ${value}`,
            current: '[pl] Current',
            past: '[pl] Past',
            submitted: '[pl] Submitted',
            approved: '[pl] Approved',
            paid: '[pl] Paid',
            exported: '[pl] Exported',
            posted: '[pl] Posted',
            withdrawn: '[pl] Withdrawn',
            billable: '[pl] Billable',
            reimbursable: '[pl] Reimbursable',
            purchaseCurrency: '[pl] Purchase currency',
            sortOrder: {
                [CONST.SEARCH.SORT_ORDER.ASC]: '[pl] Ascending',
                [CONST.SEARCH.SORT_ORDER.DESC]: '[pl] Descending',
            },
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '[pl] From',
                [CONST.SEARCH.GROUP_BY.CARD]: '[pl] Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[pl] Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '[pl] Category',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '[pl] Merchant',
                [CONST.SEARCH.GROUP_BY.TAG]: '[pl] Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: '[pl] Month',
                [CONST.SEARCH.GROUP_BY.WEEK]: '[pl] Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: '[pl] Year',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '[pl] Quarter',
            },
            feed: '[pl] Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: '[pl] Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '[pl] Reimbursement',
            },
            is: '[pl] Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '[pl] Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '[pl] Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '[pl] Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '[pl] Export',
            },
        },
        display: {
            label: '[pl] Display',
            sortBy: '[pl] Sort by',
            sortOrder: '[pl] Sort order',
            groupBy: '[pl] Group by',
            limitResults: '[pl] Limit results',
        },
        has: '[pl] Has',
        view: {
            label: '[pl] View',
            table: '[pl] Table',
            bar: '[pl] Bar',
            line: '[pl] Line',
            pie: '[pl] Pie',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '[pl] From',
            [CONST.SEARCH.GROUP_BY.CARD]: '[pl] Cards',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[pl] Exports',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '[pl] Categories',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '[pl] Merchants',
            [CONST.SEARCH.GROUP_BY.TAG]: '[pl] Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: '[pl] Months',
            [CONST.SEARCH.GROUP_BY.WEEK]: '[pl] Weeks',
            [CONST.SEARCH.GROUP_BY.YEAR]: '[pl] Years',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '[pl] Quarters',
        },
        moneyRequestReport: {
            emptyStateTitle: '[pl] This report has no expenses.',
            accessPlaceHolder: '[pl] Open for details',
        },
        noCategory: '[pl] No category',
        noMerchant: '[pl] No merchant',
        noTag: '[pl] No tag',
        expenseType: '[pl] Expense type',
        withdrawalType: '[pl] Withdrawal type',
        recentSearches: '[pl] Recent searches',
        recentChats: '[pl] Recent chats',
        searchIn: '[pl] Search in',
        searchPlaceholder: '[pl] Search for something...',
        suggestions: '[pl] Suggestions',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `[pl] Suggestions available${query ? `[pl]  for ${query}` : ''}. ${count} result.`,
            other: (resultCount: number) => `[pl] Suggestions available${query ? `[pl]  for ${query}` : ''}. ${resultCount} results.`,
        }),
        exportSearchResults: {
            title: '[pl] Create export',
            description: "[pl] Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: '[pl] Exported to',
        exportAll: {
            selectAllMatchingItems: '[pl] Select all matching items',
            allMatchingItemsSelected: '[pl] All matching items selected',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: '[pl] Please select dates for both From and To',
        },
    },
    genericErrorPage: {
        title: '[pl] Uh-oh, something went wrong!',
        body: {
            helpTextMobile: '[pl] Please close and reopen the app, or switch to',
            helpTextWeb: '[pl] web.',
            helpTextConcierge: '[pl] If the problem persists, reach out to',
        },
        refresh: '[pl] Refresh',
    },
    fileDownload: {
        success: {
            title: '[pl] Downloaded!',
            message: '[pl] Attachment successfully downloaded!',
            qrMessage: '[pl] Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: '[pl] Attachment error',
            message: "[pl] Attachment can't be downloaded",
        },
        permissionError: {
            title: '[pl] Storage access',
            message: "[pl] Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: '[pl] Pending',
            cleared: '[pl] Cleared',
            failed: '[pl] Failed',
        },
        failedError: ({link}: {link: string}) => `[pl] We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `[pl] ${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '[pl] Report layout',
        groupByLabel: '[pl] Group by:',
        selectGroupByOption: '[pl] Select how to group report expenses',
        uncategorized: '[pl] Uncategorized',
        noTag: '[pl] No tag',
        selectGroup: ({groupName}: {groupName: string}) => `[pl] Select all expenses in ${groupName}`,
        groupBy: {
            category: '[pl] Category',
            tag: '[pl] Tag',
        },
    },
    report: {
        newReport: {
            createExpense: '[pl] Create expense',
            createReport: '[pl] Create report',
            chooseWorkspace: '[pl] Choose a workspace for this report.',
            emptyReportConfirmationTitle: '[pl] You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `[pl] Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationPromptLink: '[pl] Reports',
            emptyReportConfirmationDontShowAgain: "[pl] Don't show me this again",
            genericWorkspaceName: '[pl] this workspace',
        },
        genericCreateReportFailureMessage: '[pl] Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: '[pl] Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: '[pl] Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: '[pl] Unexpected error renaming the report. Please try again later.',
        noActivityYet: '[pl] No activity yet',
        connectionSettings: '[pl] Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `[pl] changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `[pl] set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `[pl] changed the workspace${fromPolicyName ? `[pl]  (previously ${fromPolicyName})` : ''}`;
                    }
                    return `[pl] changed the workspace to ${toPolicyName}${fromPolicyName ? `[pl]  (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `[pl] changed type from ${oldType} to ${newType}`,
                exportedToCSV: `[pl] exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `[pl] exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `[pl] exported to ${label} via`,
                    automaticActionTwo: '[pl] accounting settings',
                    manual: (label: string) => `[pl] marked this report as manually exported to ${label}.`,
                    automaticActionThree: '[pl] and successfully created a record for',
                    reimburseableLink: '[pl] out-of-pocket expenses',
                    nonReimbursableLink: '[pl] company card expenses',
                    pending: (label: string) => `[pl] started exporting this report to ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `[pl] failed to export this report to ${label} ("${errorMessage}${linkText ? `[pl]  <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `[pl] added a receipt`,
                managerDetachReceipt: `[pl] removed a receipt`,
                markedReimbursed: (amount: string, currency: string) => `[pl] paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `[pl] paid ${currency}${amount} via integration`,
                outdatedBankAccount: `[pl] couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounceDefault: `[pl] couldn't process the payment due to an incorrect routing/account number or closed account`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `[pl] couldn't process the payment: ${returnReason}`,
                reimbursementACHCancelled: `[pl] canceled the payment`,
                reimbursementAccountChanged: `[pl] couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `[pl] processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `[pl] randomly selected for review`,
                selectedForRandomAuditMarkdown: `[pl] [randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `[pl] invited member ${to}`,
                unshare: ({to}: UnshareParams) => `[pl] removed member ${to}`,
                stripePaid: (amount: string, currency: string) => `[pl] paid ${currency}${amount}`,
                takeControl: `[pl] took control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `[pl] Open the Expensify mobile app to review your ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}transaction`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `[pl] there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `[pl] The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `[pl] the Plaid connection to your business bank account is broken. Please <a href='${walletRoute}'>reconnect your bank account ${maskedAccountNumber}</a> so you can continue to use your Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `[pl] ${email} joined via the workspace invite link` : `[pl] added ${email} as ${role === 'member' ? '[pl] a' : '[pl] an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `[pl] updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[pl] removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[pl] added "${newValue}" to ${email}’s custom field 1`
                        : `[pl] changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[pl] removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[pl] added "${newValue}" to ${email}’s custom field 2`
                        : `[pl] changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `[pl] ${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `[pl] removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `[pl] removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `[pl] connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '[pl] left the chat',
                leftTheChatWithName: (nameOrEmail: string) => `[pl] ${nameOrEmail ? `${nameOrEmail}: ` : ''}left the chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `[pl] business bank account ${maskedBankAccountNumber} has been automatically locked due to an issue with either Reimbursement or Expensify Card settlement. Please fix the issue in your <a href="${linkURL}">workspace settings</a>.`,
            },
            error: {
                invalidCredentials: '[pl] Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `[pl] ${summary} for ${dayCount} ${dayCount === 1 ? '[pl] day' : '[pl] days'} until ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `[pl] ${summary} from ${timePeriod} on ${date}`,
        startTimer: '[pl] Start Timer',
        stopTimer: '[pl] Stop Timer',
        scheduleOOO: '[pl] Schedule OOO',
        scheduleOOOTitle: '[pl] Schedule Out of Office',
        date: '[pl] Date',
        time: '[pl] Time (use 24-hour format)',
        durationAmount: '[pl] Duration',
        durationUnit: '[pl] Unit',
        reason: '[pl] Reason',
        workingPercentage: '[pl] Working percentage',
        dateRequired: '[pl] Date is required.',
        invalidTimeFormat: '[pl] Please enter a valid 24-hour time (e.g., 14:30).',
        enterANumber: '[pl] Please enter a number.',
        hour: '[pl] hours',
        day: '[pl] days',
        week: '[pl] weeks',
        month: '[pl] months',
    },
    footer: {
        features: '[pl] Features',
        expenseManagement: '[pl] Expense Management',
        spendManagement: '[pl] Spend Management',
        expenseReports: '[pl] Expense Reports',
        companyCreditCard: '[pl] Company Credit Card',
        receiptScanningApp: '[pl] Receipt Scanning App',
        billPay: '[pl] Bill Pay',
        invoicing: '[pl] Invoicing',
        CPACard: '[pl] CPA Card',
        payroll: '[pl] Payroll',
        travel: '[pl] Travel',
        resources: '[pl] Resources',
        expensifyApproved: '[pl] ExpensifyApproved!',
        pressKit: '[pl] Press Kit',
        support: '[pl] Support',
        expensifyHelp: '[pl] ExpensifyHelp',
        terms: '[pl] Terms of Service',
        privacy: '[pl] Privacy',
        learnMore: '[pl] Learn More',
        aboutExpensify: '[pl] About Expensify',
        blog: '[pl] Blog',
        jobs: '[pl] Jobs',
        expensifyOrg: '[pl] Expensify.org',
        investorRelations: '[pl] Investor Relations',
        getStarted: '[pl] Get Started',
        createAccount: '[pl] Create A New Account',
        logIn: '[pl] Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '[pl] Navigate back to chats list',
        chatWelcomeMessage: '[pl] Chat welcome message',
        navigatesToChat: '[pl] Navigates to a chat',
        newMessageLineIndicator: '[pl] New message line indicator',
        chatMessage: '[pl] Chat message',
        lastChatMessagePreview: '[pl] Last chat message preview',
        workspaceName: '[pl] Workspace name',
        chatUserDisplayNames: '[pl] Chat member display names',
        scrollToNewestMessages: '[pl] Scroll to newest messages',
        preStyledText: '[pl] Pre-styled text',
        viewAttachment: '[pl] View attachment',
        contextMenuAvailable: '[pl] Context menu available. Press Shift+F10 to open.',
        contextMenuAvailableMacOS: '[pl] Context menu available. Press VO-Shift-M to open.',
        contextMenuAvailableNative: '[pl] Context menu available. Double-tap and hold to open.',
        selectAllFeatures: '[pl] Select all features',
        selectAllTransactions: '[pl] Select all transactions',
        selectAllItems: '[pl] Select all items',
    },
    parentReportAction: {
        deletedReport: '[pl] Deleted report',
        deletedMessage: '[pl] Deleted message',
        deletedExpense: '[pl] Deleted expense',
        reversedTransaction: '[pl] Reversed transaction',
        deletedTask: '[pl] Deleted task',
        hiddenMessage: '[pl] Hidden message',
    },
    threads: {
        thread: '[pl] Thread',
        replies: '[pl] Replies',
        reply: '[pl] Reply',
        from: '[pl] From',
        in: '[pl] in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `[pl] From ${reportName}${workspaceName ? `[pl]  in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: '[pl] QR code',
        copy: '[pl] Copy URL',
        copied: '[pl] Copied!',
    },
    moderation: {
        flagDescription: '[pl] All flagged messages will be sent to a moderator for review.',
        chooseAReason: '[pl] Choose a reason for flagging below:',
        spam: '[pl] Spam',
        spamDescription: '[pl] Unsolicited off-topic promotion',
        inconsiderate: '[pl] Inconsiderate',
        inconsiderateDescription: '[pl] Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: '[pl] Intimidation',
        intimidationDescription: '[pl] Aggressively pursuing an agenda over valid objections',
        bullying: '[pl] Bullying',
        bullyingDescription: '[pl] Targeting an individual to obtain obedience',
        harassment: '[pl] Harassment',
        harassmentDescription: '[pl] Racist, misogynistic, or other broadly discriminatory behavior',
        assault: '[pl] Assault',
        assaultDescription: '[pl] Specifically targeted emotional attack with the intention of harm',
        flaggedContent: '[pl] This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: '[pl] Hide message',
        revealMessage: '[pl] Reveal message',
        levelOneResult: '[pl] Sends anonymous warning and message is reported for review.',
        levelTwoResult: '[pl] Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: '[pl] Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '[pl] Invite to submit expenses',
        inviteToChat: '[pl] Invite to chat only',
        nothing: '[pl] Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '[pl] Accept',
        decline: '[pl] Decline',
    },
    actionableMentionTrackExpense: {
        submit: '[pl] Submit it to someone',
        categorize: '[pl] Categorize it',
        share: '[pl] Share it with my accountant',
        nothing: '[pl] Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: '[pl] Teachers Unite',
        joinExpensifyOrg:
            '[pl] Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: '[pl] I know a teacher',
        iAmATeacher: '[pl] I am a teacher',
        personalKarma: {
            title: '[pl] Enable Personal Karma',
            description: '[pl] Donate $1 to Expensify.org for every $500 you spend each month',
            stopDonationsPrompt: '[pl] Are you sure you want to stop donating to Expensify.org?',
        },
        getInTouch: '[pl] Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: '[pl] Intro to your school principal',
        schoolPrincipalVerifyExpense:
            '[pl] Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: '[pl] Principal first name',
        principalLastName: '[pl] Principal last name',
        principalWorkEmail: '[pl] Principal work email',
        updateYourEmail: '[pl] Update your email address',
        updateEmail: '[pl] Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `[pl] Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: '[pl] Enter a valid email or phone number',
            enterEmail: '[pl] Enter an email',
            enterValidEmail: '[pl] Enter a valid email',
            tryDifferentEmail: '[pl] Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: '[pl] Not activated',
        outOfPocket: '[pl] Reimbursable',
        companySpend: '[pl] Non-reimbursable',
        personalCard: '[pl] Personal card',
        companyCard: '[pl] Company card',
        expensifyCard: '[pl] Expensify Card',
        centralInvoicing: '[pl] Central invoicing',
    },
    distance: {
        addStop: '[pl] Add stop',
        address: '[pl] Address',
        waypointDescription: {
            start: '[pl] Start',
            stop: '[pl] Stop',
        },
        mapPending: {
            title: '[pl] Map pending',
            subtitle: '[pl] The map will be generated when you go back online',
            onlineSubtitle: '[pl] One moment while we set up the map',
            errorTitle: '[pl] Map error',
            errorSubtitle: '[pl] There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: '[pl] Please select a suggested address or use current location',
        },
        odometer: {
            startReading: '[pl] Start reading',
            endReading: '[pl] End reading',
            saveForLater: '[pl] Save for later',
            totalDistance: '[pl] Total distance',
            startTitle: '[pl] Odometer start photo',
            endTitle: '[pl] Odometer end photo',
            deleteOdometerPhoto: '[pl] Delete odometer photo',
            deleteOdometerPhotoConfirmation: '[pl] Are you sure you want to delete this odometer photo?',
            startMessageWeb: '[pl] Add a photo of your odometer from the <strong>start</strong> of your trip. Drag a file here or choose one to upload.',
            endMessageWeb: '[pl] Add a photo of your odometer from the <strong>end</strong> of your trip. Drag a file here or choose one to upload.',
            cameraAccessRequired: '[pl] Camera access is required to take pictures.',
            snapPhotoStart: '[pl] <muted-text-label>Snap a photo of your odometer at the <strong>start</strong> of your trip.</muted-text-label>',
            snapPhotoEnd: '[pl] <muted-text-label>Snap a photo of your odometer at the <strong>end</strong> of your trip.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '[pl] Failed to start location tracking.',
            failedToGetPermissions: '[pl] Failed to get required location permissions.',
        },
        trackingDistance: '[pl] Tracking distance...',
        stopped: '[pl] Stopped',
        start: '[pl] Start',
        stop: '[pl] Stop',
        discard: '[pl] Discard',
        stopGpsTrackingModal: {
            title: '[pl] Stop GPS tracking',
            prompt: '[pl] Are you sure? This will end your current journey.',
            cancel: '[pl] Resume tracking',
            confirm: '[pl] Stop GPS tracking',
        },
        discardDistanceTrackingModal: {
            title: '[pl] Discard distance tracking',
            prompt: "[pl] Are you sure? This will discard your current journey and can't be undone.",
            confirm: '[pl] Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "[pl] Can't create expense",
            prompt: "[pl] You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: '[pl] Location access required',
            prompt: '[pl] Please allow location access in your device settings to start GPS distance tracking.',
            allow: '[pl] Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: '[pl] Background location access required',
            prompt: '[pl] Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: '[pl] Precise location required',
            prompt: '[pl] Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: '[pl] Track distance on your phone',
            subtitle: '[pl] Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: '[pl] Download the app',
        },
        notification: {
            title: '[pl] GPS tracking in progress',
            body: '[pl] Go to the app to finish',
        },
        continueGpsTripModal: {
            title: '[pl] Continue GPS trip recording?',
            prompt: '[pl] Looks like the app closed during your last GPS trip. Would you like to continue recording from that trip?',
            confirm: '[pl] Continue trip',
            cancel: '[pl] View trip',
        },
        signOutWarningTripInProgress: {
            title: '[pl] GPS tracking in progress',
            prompt: '[pl] Are you sure you want to discard the trip and sign out?',
            confirm: '[pl] Discard and sign out',
        },
        switchToODWarningTripInProgress: {
            title: '[pl] GPS tracking in progress',
            prompt: '[pl] Are you sure you want to stop GPS tracking and switch to Expensify Classic?',
            confirm: '[pl] Stop and switch',
        },
        switchAccountWarningTripInProgress: {
            title: '[pl] GPS tracking in progress',
            prompt: '[pl] Are you sure you want to stop GPS tracking and switch accounts?',
            confirm: '[pl] Stop and switch',
        },
        locationServicesRequiredModal: {
            title: '[pl] Location access required',
            confirm: '[pl] Open settings',
            prompt: '[pl] Please allow location access in your device settings to start GPS distance tracking.',
        },
        gpsFloatingPillText: '[pl] GPS tracking in progress...',
        liveActivity: {
            subtitle: '[pl] Tracking distance',
            button: '[pl] View progress',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '[pl] Report card lost or damaged',
        nextButtonLabel: '[pl] Next',
        reasonTitle: '[pl] Why do you need a new card?',
        cardDamaged: '[pl] My card was damaged',
        cardLostOrStolen: '[pl] My card was lost or stolen',
        confirmAddressTitle: '[pl] Please confirm the mailing address for your new card.',
        cardDamagedInfo: '[pl] Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: '[pl] Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: '[pl] Address',
        deactivateCardButton: '[pl] Deactivate card',
        shipNewCardButton: '[pl] Ship new card',
        addressError: '[pl] Address is required',
        reasonError: '[pl] Reason is required',
        successTitle: '[pl] Your new card is on the way!',
        successDescription: "[pl] You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: '[pl] Guaranteed eReceipt',
        transactionDate: '[pl] Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '[pl] Start a chat, <success><strong>refer a friend</strong></success>.',
            header: '[pl] Start a chat, refer a friend',
            closeAccessibilityLabel: '[pl] Close, start a chat, refer a friend, banner',
            body: "[pl] Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '[pl] Submit an expense, <success><strong>refer your team</strong></success>.',
            header: '[pl] Submit an expense, refer your team',
            closeAccessibilityLabel: '[pl] Close, submit an expense, refer your team, banner',
            body: "[pl] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '[pl] Refer a friend',
            body: "[pl] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '[pl] Refer a friend',
            header: '[pl] Refer a friend',
            body: "[pl] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: '[pl] Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `[pl] Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `[pl] Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: '[pl] All tags required',
        autoReportedRejectedExpense: '[pl] This expense was rejected.',
        billableExpense: '[pl] Billable no longer valid',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `[pl] Receipt required${formattedLimit ? `[pl]  over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '[pl] Category no longer valid',
        conversionSurcharge: (surcharge: number) => `[pl] Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: '[pl] Rate not valid for this workspace',
        duplicatedTransaction: '[pl] Potential duplicate',
        fieldRequired: '[pl] Report fields are required',
        futureDate: '[pl] Future date not allowed',
        invoiceMarkup: (invoiceMarkup: number) => `[pl] Marked up by ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `[pl] Date older than ${maxAge} days`,
        missingCategory: '[pl] Missing category',
        missingComment: '[pl] Description required for selected category',
        missingAttendees: '[pl] Multiple attendees required for this category',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `[pl] Missing ${tagName ?? '[pl] tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '[pl] Amount differs from calculated distance';
                case 'card':
                    return '[pl] Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `[pl] Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return '[pl] Amount greater than scanned receipt';
            }
        },
        modifiedDate: '[pl] Date differs from scanned receipt',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `[pl] Distance exceeds the calculated route of ${formattedRouteDistance}` : '[pl] Distance exceeds the calculated route',
        nonExpensiworksExpense: '[pl] Non-Expensiworks expense',
        overAutoApprovalLimit: (formattedLimit: string) => `[pl] Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `[pl] Amount over ${formattedLimit}/person category limit`,
        overLimit: (formattedLimit: string) => `[pl] Amount over ${formattedLimit}/person limit`,
        overTripLimit: (formattedLimit: string) => `[pl] Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: (formattedLimit: string) => `[pl] Amount over ${formattedLimit}/person limit`,
        perDayLimit: (formattedLimit: string) => `[pl] Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: '[pl] Receipt and expense details added manually.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `[pl] Receipt required over ${formattedLimit} category limit`;
            }
            if (formattedLimit) {
                return `[pl] Receipt required over ${formattedLimit}`;
            }
            if (category) {
                return `[pl] Receipt required over category limit`;
            }
            return '[pl] Receipt required';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `[pl] Itemized receipt required${formattedLimit ? `[pl]  over ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '[pl] Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `[pl] alcohol`;
                    case 'gambling':
                        return `[pl] gambling`;
                    case 'tobacco':
                        return `[pl] tobacco`;
                    case 'adultEntertainment':
                        return `[pl] adult entertainment`;
                    case 'hotelIncidentals':
                        return `[pl] hotel incidentals`;
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
        reviewRequired: '[pl] Review required',
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
                return "[pl] Can't auto-match receipt due to broken bank connection.";
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return "[pl] Can't auto-match receipt due to broken bank connection.";
                }
                return isMarkAsCash
                    ? `[pl] Can't auto-match receipt due to broken card connection. Mark as cash to ignore, or <a href="${connectionLink}">fix the card</a> to match the receipt.`
                    : `[pl] Can't auto-match receipt due to broken card connection. <a href="${connectionLink}">Fix the card</a> to match the receipt.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `[pl] Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : '[pl] Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `[pl] Ask ${member} to mark as a cash or wait 7 days and try again` : '[pl] Awaiting merge with card transaction.';
            }
            return '';
        },
        brokenConnection530Error: '[pl] Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `[pl] <muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: '[pl] Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: '[pl] Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true}) => `[pl] Receipt scanning failed.${canEdit ? '[pl]  Enter details manually.' : ''}`,
        receiptGeneratedWithAI: '[pl] Potential AI-generated receipt',
        someTagLevelsRequired: (tagName?: string) => `[pl] Missing ${tagName ?? '[pl] Tag'}`,
        tagOutOfPolicy: (tagName?: string) => `[pl] ${tagName ?? '[pl] Tag'} no longer valid`,
        taxAmountChanged: '[pl] Tax amount was modified',
        taxOutOfPolicy: (taxName?: string) => `[pl] ${taxName ?? '[pl] Tax'} no longer valid`,
        taxRateChanged: '[pl] Tax rate was modified',
        taxRequired: '[pl] Missing tax rate',
        none: '[pl] None',
        taxCodeToKeep: '[pl] Choose which tax code to keep',
        tagToKeep: '[pl] Choose which tag to keep',
        isTransactionReimbursable: '[pl] Choose if transaction is reimbursable',
        merchantToKeep: '[pl] Choose which merchant to keep',
        descriptionToKeep: '[pl] Choose which description to keep',
        categoryToKeep: '[pl] Choose which category to keep',
        isTransactionBillable: '[pl] Choose if transaction is billable',
        keepThisOne: '[pl] Keep this one',
        confirmDetails: `[pl] Confirm the details you're keeping`,
        confirmDuplicatesInfo: `[pl] The duplicates you don't keep will be held for the submitter to delete.`,
        hold: '[pl] This expense was put on hold',
        resolvedDuplicates: '[pl] resolved the duplicate',
        companyCardRequired: '[pl] Company card purchases required',
        noRoute: '[pl] Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `[pl] ${fieldName} is required`,
        reportContainsExpensesWithViolations: '[pl] Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: '[pl] marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: '[pl] resolved the duplicate',
        },
    },
    videoPlayer: {
        play: '[pl] Play',
        pause: '[pl] Pause',
        fullscreen: '[pl] Fullscreen',
        playbackSpeed: '[pl] Playback speed',
        expand: '[pl] Expand',
        mute: '[pl] Mute',
        unmute: '[pl] Unmute',
        normal: '[pl] Normal',
    },
    exitSurvey: {
        header: '[pl] Before you go',
        reasonPage: {
            title: "[pl] Please tell us why you're leaving",
            subtitle: '[pl] Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[pl] I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "[pl] I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[pl] I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[pl] What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '[pl] What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[pl] Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: '[pl] Your response',
        thankYou: '[pl] Thanks for the feedback!',
        thankYouSubtitle: '[pl] Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: '[pl] Switch to Expensify Classic',
        offlineTitle: "[pl] Looks like you're stuck here...",
        offline:
            "[pl] You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: '[pl] Quick tip...',
        quickTipSubTitle: '[pl] You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: '[pl] Book a call',
        bookACallTitle: '[pl] Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '[pl] Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '[pl] Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '[pl] Travel and expense at the speed of chat',
        },
        bookACallTextTop: '[pl] By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: '[pl] We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: '[pl] Take me to Expensify Classic',
    },
    listBoundary: {
        errorMessage: '[pl] An error occurred while loading more messages',
        tryAgain: '[pl] Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: '[pl] matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: '[pl] Authenticate payment card',
        mobileReducedFunctionalityMessage: '[pl] You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `[pl] Free trial: ${numOfDays} ${numOfDays === 1 ? '[pl] day' : '[pl] days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '[pl] Your payment info is outdated',
                subtitle: (date: string) => `[pl] Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '[pl] Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `[pl] Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : '[pl] Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: '[pl] Your payment info is outdated',
                subtitle: (date: string) => `[pl] Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '[pl] Your payment info is outdated',
                subtitle: '[pl] Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: '[pl] Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `[pl] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: '[pl] Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `[pl] Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: '[pl] Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `[pl] Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: '[pl] Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `[pl] Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: '[pl] Your card is expiring soon',
                subtitle: '[pl] Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: '[pl] Success!',
                subtitle: '[pl] Your card has been billed successfully.',
            },
            retryBillingError: {
                title: '[pl] Your card couldn’t be charged',
                subtitle: '[pl] Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `[pl] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '[pl] Start a free trial',
                subtitle: '[pl] As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: (numOfDays: number) => `[pl] Trial: ${numOfDays} ${numOfDays === 1 ? '[pl] day' : '[pl] days'} left!`,
                subtitle: '[pl] Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: '[pl] Your free trial has ended',
                subtitle: '[pl] Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: '[pl] Claim offer',
                subscriptionPageTitle: (discountType: number) => `[pl] <strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `[pl] Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `[pl] Claim within ${days > 0 ? `[pl] ${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '[pl] Payment',
            subtitle: '[pl] Add a card to pay for your Expensify subscription.',
            addCardButton: '[pl] Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `[pl] Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `[pl] Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `[pl] Card ending in ${cardNumber}`,
            changeCard: '[pl] Change payment card',
            changeCurrency: '[pl] Change payment currency',
            cardNotFound: '[pl] No payment card added',
            retryPaymentButton: '[pl] Retry payment',
            authenticatePayment: '[pl] Authenticate payment',
            requestRefund: '[pl] Request refund',
            requestRefundModal: {
                full: '[pl] Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: '[pl] Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: '[pl] View payment history',
        },
        yourPlan: {
            title: '[pl] Your plan',
            exploreAllPlans: '[pl] Explore all plans',
            customPricing: '[pl] Custom pricing',
            asLowAs: (price: string) => `[pl] as low as ${price} per active member/month`,
            pricePerMemberMonth: (price: string) => `[pl] ${price} per member/month`,
            pricePerMemberPerMonth: (price: string) => `[pl] ${price} per member per month`,
            perMemberMonth: '[pl] per member/month',
            collect: {
                title: '[pl] Collect',
                description: '[pl] The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[pl] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[pl] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[pl] Receipt scanning',
                benefit2: '[pl] Reimbursements',
                benefit3: '[pl] Corporate card management',
                benefit4: '[pl] Expense and travel approvals',
                benefit5: '[pl] Travel booking and rules',
                benefit6: '[pl] QuickBooks/Xero integrations',
                benefit7: '[pl] Chat on expenses, reports, and rooms',
                benefit8: '[pl] AI and human support',
            },
            control: {
                title: '[pl] Control',
                description: '[pl] Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[pl] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[pl] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[pl] Everything in the Collect plan',
                benefit2: '[pl] Multi-level approval workflows',
                benefit3: '[pl] Custom expense rules',
                benefit4: '[pl] ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: '[pl] HR integrations (Workday, Certinia)',
                benefit6: '[pl] SAML/SSO',
                benefit7: '[pl] Custom insights and reporting',
                benefit8: '[pl] Budgeting',
            },
            thisIsYourCurrentPlan: '[pl] This is your current plan',
            downgrade: '[pl] Downgrade to Collect',
            upgrade: '[pl] Upgrade to Control',
            addMembers: '[pl] Add members',
            saveWithExpensifyTitle: '[pl] Save with the Expensify Card',
            saveWithExpensifyDescription: '[pl] Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: '[pl] Learn more',
        },
        compareModal: {
            comparePlans: '[pl] Compare Plans',
            subtitle: `[pl] <muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: '[pl] Subscription details',
            annual: '[pl] Annual subscription',
            taxExempt: '[pl] Request tax exempt status',
            taxExemptEnabled: '[pl] Tax exempt',
            taxExemptStatus: '[pl] Tax exempt status',
            payPerUse: '[pl] Pay-per-use',
            subscriptionSize: '[pl] Subscription size',
            headsUp:
                "[pl] Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: '[pl] Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: '[pl] Subscription size',
            yourSize: '[pl] Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                '[pl] Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: '[pl] Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: '[pl] Confirm your new annual subscription details:',
            subscriptionSize: '[pl] Subscription size',
            activeMembers: (size: number) => `[pl] ${size} active members/month`,
            subscriptionRenews: '[pl] Subscription renews',
            youCantDowngrade: '[pl] You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: (size: number, date: string) =>
                `[pl] You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: '[pl] Please enter a valid subscription size',
                sameSize: '[pl] Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: '[pl] Add payment card',
            enterPaymentCardDetails: '[pl] Enter your payment card details',
            security: '[pl] Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: '[pl] Learn more about our security.',
        },
        expensifyCode: {
            title: '[pl] Expensify code',
            discountCode: '[pl] Discount code',
            enterCode: '[pl] Enter an Expensify code to apply to your subscription.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `[pl] You will get a ${promoDiscount}% discount on your next ${validBillingCycles ? `${validBillingCycles} ` : ''}billing charges.`,
            apply: '[pl] Apply',
            error: {
                invalid: '[pl] This code is invalid',
            },
        },
        subscriptionSettings: {
            title: '[pl] Subscription settings',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `[pl] Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}${expensifyCode ? `[pl] , Expensify code: ${expensifyCode}` : ''}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: '[pl] none',
            on: '[pl] on',
            off: '[pl] off',
            annual: '[pl] Annual',
            autoRenew: '[pl] Auto-renew',
            autoIncrease: '[pl] Auto-increase annual seats',
            saveUpTo: (amountWithCurrency: string) => `[pl] Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                '[pl] Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: '[pl] Disable auto-renew',
            helpUsImprove: '[pl] Help us improve Expensify',
            whatsMainReason: "[pl] What's the main reason you're disabling auto-renew?",
            renewsOn: (date: string) => `[pl] Renews on ${date}.`,
            pricingConfiguration: '[pl] Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `[pl] <muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `[pl] <a href="adminsRoom">#admins room.</a>` : '[pl] #admins room.'}</muted-text>`,
            estimatedPrice: '[pl] Estimated price',
            changesBasedOn: '[pl] This changes based on your Expensify Card usage and the subscription options below.',
            collectBillingDescription: '[pl] Collect workspaces are billed monthly per member, with no annual commitment.',
            pricing: '[pl] Pricing',
        },
        requestEarlyCancellation: {
            title: '[pl] Request early cancellation',
            subtitle: '[pl] What’s the main reason you’re requesting early cancellation?',
            subscriptionCanceled: {
                title: '[pl] Subscription canceled',
                subtitle: '[pl] Your annual subscription has been canceled.',
                info: '[pl] If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `[pl] If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: '[pl] Request submitted',
                subtitle:
                    '[pl] Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `[pl] By requesting early cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: '[pl] Functionality needs improvement',
        tooExpensive: '[pl] Too expensive',
        inadequateSupport: '[pl] Inadequate customer support',
        businessClosing: '[pl] Company closing, downsizing, or acquired',
        additionalInfoTitle: '[pl] What software are you moving to and why?',
        additionalInfoInputLabel: '[pl] Your response',
    },
    roomChangeLog: {
        updateRoomDescription: '[pl] set the room description to:',
        clearRoomDescription: '[pl] cleared the room description',
        changedRoomAvatar: '[pl] changed the room avatar',
        removedRoomAvatar: '[pl] removed the room avatar',
    },
    delegate: {
        switchAccount: '[pl] Switch accounts:',
        copilotDelegatedAccess: '[pl] Copilot: Delegated access',
        copilotDelegatedAccessDescription: '[pl] Allow other members to access your account.',
        learnMoreAboutDelegatedAccess: '[pl] Learn more about delegated access',
        addCopilot: '[pl] Add copilot',
        membersCanAccessYourAccount: '[pl] These members can access your account:',
        youCanAccessTheseAccounts: '[pl] You can access these accounts via the account switcher:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[pl] Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[pl] Limited';
                default:
                    return '';
            }
        },
        genericError: '[pl] Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `[pl] on behalf of ${delegator}`,
        accessLevel: '[pl] Access level',
        confirmCopilot: '[pl] Confirm your copilot below.',
        accessLevelDescription: '[pl] Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[pl] Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[pl] Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: '[pl] Remove copilot',
        removeCopilotConfirmation: '[pl] Are you sure you want to remove this copilot?',
        changeAccessLevel: '[pl] Change access level',
        makeSureItIsYou: "[pl] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[pl] Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `[pl] Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '[pl] Not so fast...',
        noAccessMessage: dedent(`
            [pl] As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `[pl] As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: '[pl] Copilot access',
    },
    debug: {
        debug: '[pl] Debug',
        details: '[pl] Details',
        JSON: '[pl] JSON',
        reportActions: '[pl] Actions',
        reportActionPreview: '[pl] Preview',
        nothingToPreview: '[pl] Nothing to preview',
        editJson: '[pl] Edit JSON:',
        preview: '[pl] Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `[pl] Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `[pl] Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `[pl] Invalid value - Expected: ${expectedValues}`,
        missingValue: '[pl] Missing value',
        createReportAction: '[pl] Create Report Action',
        reportAction: '[pl] Report Action',
        report: '[pl] Report',
        transaction: '[pl] Transaction',
        violations: '[pl] Violations',
        transactionViolation: '[pl] Transaction Violation',
        hint: "[pl] Data changes won't be sent to the backend",
        textFields: '[pl] Text fields',
        numberFields: '[pl] Number fields',
        booleanFields: '[pl] Boolean fields',
        constantFields: '[pl] Constant fields',
        dateTimeFields: '[pl] DateTime fields',
        date: '[pl] Date',
        time: '[pl] Time',
        none: '[pl] None',
        visibleInLHN: '[pl] Visible in LHN',
        GBR: '[pl] GBR',
        RBR: '[pl] RBR',
        true: '[pl] true',
        false: '[pl] false',
        viewReport: '[pl] View Report',
        viewTransaction: '[pl] View transaction',
        createTransactionViolation: '[pl] Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: '[pl] Has draft comment',
            hasGBR: '[pl] Has GBR',
            hasRBR: '[pl] Has RBR',
            pinnedByUser: '[pl] Pinned by member',
            hasIOUViolations: '[pl] Has IOU violations',
            hasAddWorkspaceRoomErrors: '[pl] Has add workspace room errors',
            isUnread: '[pl] Is unread (focus mode)',
            isArchived: '[pl] Is archived (most recent mode)',
            isSelfDM: '[pl] Is self DM',
            isFocused: '[pl] Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: '[pl] Has join request (admin room)',
            isUnreadWithMention: '[pl] Is unread with mention',
            isWaitingForAssigneeToCompleteAction: '[pl] Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: '[pl] Has child report awaiting action',
            hasMissingInvoiceBankAccount: '[pl] Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: '[pl] Has unresolved card fraud alert',
            hasDEWApproveFailed: '[pl] Has DEW approve failed',
        },
        reasonRBR: {
            hasErrors: '[pl] Has errors in report or report actions data',
            hasViolations: '[pl] Has violations',
            hasTransactionThreadViolations: '[pl] Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "[pl] There's a report awaiting action",
            theresAReportWithErrors: "[pl] There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "[pl] There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "[pl] There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: '[pl] There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "[pl] There's a problem with a contact method",
            aContactMethodRequiresVerification: '[pl] A contact method requires verification',
            theresAProblemWithAPaymentMethod: "[pl] There's a problem with a payment method",
            theresAProblemWithAWorkspace: "[pl] There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "[pl] There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "[pl] There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: '[pl] Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: '[pl] There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "[pl] There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "[pl] There's a problem with your wallet terms",
            aBankAccountIsLocked: '[pl] A bank account is locked',
        },
    },
    emptySearchView: {
        takeATestDrive: '[pl] Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: '[pl] Welcome to New Expensify!',
        subtitle: "[pl] It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "[pl] Let's go!",
        helpText: '[pl] Try 2-min demo',
        features: {
            search: '[pl] More powerful search on mobile, web, and desktop',
            concierge: '[pl] Built-in Concierge AI to help automate your expenses',
            chat: '[pl] Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '[pl] <tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '[pl] <tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '[pl] <tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        scanTestTooltip: {
            main: '[pl] <tooltip><strong>Scan our test receipt</strong> to see how it works!</tooltip>',
            manager: '[pl] <tooltip>Choose our <strong>test manager</strong> to try it out!</tooltip>',
            confirmation: '[pl] <tooltip>Now, <strong>submit your expense</strong> and watch the\nmagic happen!</tooltip>',
            tryItOut: '[pl] Try it out',
        },
        outstandingFilter: '[pl] <tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '[pl] <tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "[pl] <tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
        hasFilterNegation: '[pl] <tooltip>Search for expenses without receipts using <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '[pl] Discard changes?',
        body: '[pl] Are you sure you want to discard the changes you made?',
        confirmText: '[pl] Discard changes',
    },
    scheduledCall: {
        book: {
            title: '[pl] Schedule call',
            description: '[pl] Find a time that works for you.',
            slots: ({date}: {date: string}) => `[pl] <muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '[pl] Confirm call',
            description: "[pl] Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: '[pl] Your setup specialist',
            meetingLength: '[pl] Meeting length',
            dateTime: '[pl] Date & time',
            minutes: '[pl] 30 minutes',
        },
        callScheduled: '[pl] Call scheduled',
    },
    autoSubmitModal: {
        title: '[pl] All clear and submitted!',
        description: '[pl] All warnings and violations has been cleared so:',
        submittedExpensesTitle: '[pl] These expenses have been submitted',
        submittedExpensesDescription: '[pl] These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: '[pl] Pending expenses have been moved',
        pendingExpensesDescription: '[pl] Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '[pl] Take a 2-minute test drive',
        },
        modal: {
            title: '[pl] Take us for a test drive',
            description: '[pl] Take a quick product tour to get up to speed fast.',
            confirmText: '[pl] Start test drive',
            helpText: '[pl] Skip',
            employee: {
                description: '[pl] <muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "[pl] Enter your boss's email",
                error: '[pl] That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "[pl] You're currently test driving Expensify",
            readyForTheRealThing: '[pl] Ready for the real thing?',
            getStarted: '[pl] Get started',
        },
        employeeInviteMessage: (name: string) => `[pl] # ${name} invited you to test drive Expensify
Hey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.

Here’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: '[pl] Basic export',
        reportLevelExport: '[pl] All Data - report level',
        expenseLevelExport: '[pl] All Data - expense level',
        exportInProgress: '[pl] Export in progress',
        conciergeWillSend: '[pl] Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: '[pl] Not verified',
        retry: '[pl] Retry',
        verifyDomain: {
            title: '[pl] Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `[pl] Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `[pl] Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: '[pl] Add the following TXT record:',
            saveChanges: '[pl] Save changes and return here to verify your domain.',
            youMayNeedToConsult: `[pl] You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: '[pl] After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: '[pl] Couldn’t fetch verification code',
            genericError: "[pl] We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: '[pl] Domain verified',
            header: '[pl] Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `[pl] <muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: '[pl] SAML',
        samlFeatureList: {
            title: '[pl] SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `[pl] <muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: '[pl] Faster and easier login',
            moreSecurityAndControl: '[pl] More security and control',
            onePasswordForAnything: '[pl] One password for everything',
        },
        goToDomain: '[pl] Go to domain',
        samlLogin: {
            title: '[pl] SAML login',
            subtitle: `[pl] <muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a>.</muted-text>`,
            enableSamlLogin: '[pl] Enable SAML login',
            allowMembers: '[pl] Allow members to log in with SAML.',
            requireSamlLogin: '[pl] Require SAML login',
            anyMemberWillBeRequired: '[pl] Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "[pl] Couldn't update SAML enablement setting",
            requireError: "[pl] Couldn't update SAML requirement setting",
            disableSamlRequired: '[pl] Disable SAML required',
            oktaWarningPrompt: '[pl] Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: '[pl] Please add Identity Provider metadata below to enable',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `[pl] <muted-text>Please disable <a href="${twoFactorAuthSettingsUrl}">force two-factor authentication</a> to enable SAML login.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: '[pl] SAML configuration details',
            subtitle: '[pl] Use these details to get SAML set up.',
            identityProviderMetadata: '[pl] Identity Provider Metadata',
            entityID: '[pl] Entity ID',
            nameIDFormat: '[pl] Name ID Format',
            loginUrl: '[pl] Login URL',
            acsUrl: '[pl] ACS (Assertion Consumer Service) URL',
            logoutUrl: '[pl] Logout URL',
            sloUrl: '[pl] SLO (Single Logout) URL',
            serviceProviderMetaData: '[pl] Service Provider MetaData',
            oktaScimToken: '[pl] Okta SCIM Token',
            revealToken: '[pl] Reveal token',
            fetchError: "[pl] Couldn't fetch SAML configuration details",
            setMetadataGenericError: "[pl] Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: '[pl] Access restricted',
            subtitle: (domainName: string) => `[pl] Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: '[pl] Company card management',
            accountCreationAndDeletion: '[pl] Account creation and deletion',
            workspaceCreation: '[pl] Workspace creation',
            samlSSO: '[pl] SAML SSO',
        },
        addDomain: {
            title: '[pl] Add domain',
            subtitle: '[pl] Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: '[pl] Domain name',
            newDomain: '[pl] New domain',
        },
        domainAdded: {
            title: '[pl] Domain added',
            description: "[pl] Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: '[pl] Configure',
        },
        enhancedSecurity: {
            title: '[pl] Enhanced security',
            subtitle: '[pl] Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: '[pl] Enable',
        },
        domainAdmins: '[pl] Domain admins',
        admins: {
            title: '[pl] Admins',
            findAdmin: '[pl] Find admin',
            primaryContact: '[pl] Primary contact',
            addPrimaryContact: '[pl] Add primary contact',
            setPrimaryContactError: '[pl] Unable to set primary contact. Please try again later.',
            consolidatedDomainBilling: '[pl] Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `[pl] <comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "[pl] Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: '[pl] Add admin',
            addAdminError: '[pl] Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: '[pl] Revoke admin access',
            cantRevokeAdminAccess: "[pl] Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: '[pl] Unable to remove this user as an Admin. Please try again.',
                removeDomain: '[pl] Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: '[pl] Please enter your domain name to reset it.',
            },
            resetDomain: '[pl] Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `[pl] Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: '[pl] Enter your domain name here',
            resetDomainInfo: `[pl] This action is <strong>permanent</strong> and the following data will be deleted: <br/> <bullet-list><bullet-item>Company card connections and any unreported expenses from those cards</bullet-item><bullet-item>SAML and group settings</bullet-item></bullet-list> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        domainMembers: '[pl] Domain members',
        members: {
            title: '[pl] Members',
            findMember: '[pl] Find member',
            addMember: '[pl] Add member',
            emptyMembers: {
                title: '[pl] No members in this group',
                subtitle: '[pl] Add a member or try changing the filter above.',
            },
            allMembers: '[pl] All members',
            email: '[pl] Email address',
            closeAccountPrompt: '[pl] Are you sure? This action is permanent.',
            forceCloseAccount: () => ({
                one: '[pl] Force close account',
                other: '[pl] Force close accounts',
            }),
            safeCloseAccount: () => ({
                one: '[pl] Close account safely',
                other: '[pl] Close accounts safely',
            }),
            closeAccountInfo: () => ({
                one: '[pl] We recommend closing the account safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected account.',
                other: '[pl] We recommend closing the accounts safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected accounts.',
            }),
            closeAccount: () => ({
                one: '[pl] Close account',
                other: '[pl] Close accounts',
            }),
            moveToGroup: '[pl] Move to group',
            chooseWhereToMove: ({count}: {count: number}) => `[pl] Choose where to move ${count} ${count === 1 ? '[pl] member' : '[pl] members'}.`,
            error: {
                addMember: '[pl] Unable to add this member. Please try again.',
                removeMember: '[pl] Unable to remove this user. Please try again.',
                moveMember: '[pl] Unable to move this member. Please try again.',
                vacationDelegate: '[pl] Unable to set this user as a vacation delegate. Please try again.',
            },
            cannotSetVacationDelegateForMember: (email: string) => `[pl] You can't set a vacation delegate for ${email} because they're currently the delegate for the following members:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `[pl] Are you sure? This will lock <strong>${email}'s</strong> account. <br /><br /> Our team will then review the account and remove any unauthorized access. To regain access, they'll need to work with Concierge.`,
            reportSuspiciousActivityConfirmationPrompt: '[pl] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        },
        common: {
            settings: '[pl] Settings',
            forceTwoFactorAuth: '[pl] Force two-factor authentication',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `[pl] <muted-text>Please disable <a href="${samlPageUrl}">SAML</a> to force two-factor authentication.</muted-text>`,
            forceTwoFactorAuthDescription: `[pl] <muted-text>Require two-factor authentication for all members of this domain. Domain members will be prompted to set up two-factor authentication on their account when they sign in.</muted-text>`,
            forceTwoFactorAuthError: "[pl] Force two-factor authentication couldn't be changed. Please try again later.",
            resetTwoFactorAuth: '[pl] Reset two-factor authentication',
        },
        groups: {
            title: '[pl] Groups',
            memberCount: () => {
                return {
                    one: '[pl] 1 member',
                    other: (count: number) => `[pl] ${count} members`,
                };
            },
        },
    },
};
export default translations;
