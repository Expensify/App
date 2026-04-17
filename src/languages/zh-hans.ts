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
        count: '[zh-hans][ctx: Used as a noun meaning a numerical total or quantity, not the verb “to count.”] Count',
        cancel: '[zh-hans] Cancel',
        dismiss: '[zh-hans][ctx: Refers to closing or hiding a notification or message, not rejecting or ignoring something.] Dismiss',
        proceed: '[zh-hans][ctx: Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”] Proceed',
        unshare: '[zh-hans] Unshare',
        yes: '[zh-hans] Yes',
        no: '[zh-hans] No',
        ok: '[zh-hans][ctx: Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.] OK',
        notNow: '[zh-hans] Not now',
        noThanks: '[zh-hans] No thanks',
        learnMore: '[zh-hans] Learn more',
        buttonConfirm: '[zh-hans] Got it',
        name: '[zh-hans] Name',
        attachment: '[zh-hans] Attachment',
        attachments: '[zh-hans] Attachments',
        center: '[zh-hans] Center',
        from: '[zh-hans] From',
        to: '[zh-hans] To',
        in: '[zh-hans] In',
        optional: '[zh-hans] Optional',
        new: '[zh-hans] New',
        newFeature: '[zh-hans] New feature',
        search: '[zh-hans] Search',
        reports: '[zh-hans] Reports',
        spend: '[zh-hans] Spend',
        find: '[zh-hans] Find',
        searchWithThreeDots: '[zh-hans] Search...',
        next: '[zh-hans] Next',
        previous: '[zh-hans] Previous',
        previousMonth: '[zh-hans] Previous month',
        nextMonth: '[zh-hans] Next month',
        previousYear: '[zh-hans] Previous year',
        nextYear: '[zh-hans] Next year',
        goBack: '[zh-hans][ctx: Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.] Go back',
        create: '[zh-hans] Create',
        add: '[zh-hans] Add',
        resend: '[zh-hans] Resend',
        save: '[zh-hans] Save',
        select: '[zh-hans] Select',
        deselect: '[zh-hans] Deselect',
        selectMultiple: '[zh-hans][ctx: Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.] Select multiple',
        saveChanges: '[zh-hans] Save changes',
        submit: '[zh-hans] Submit',
        submitted: '[zh-hans][ctx: Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”] Submitted',
        rotate: '[zh-hans] Rotate',
        zoom: '[zh-hans] Zoom',
        password: '[zh-hans] Password',
        magicCode: '[zh-hans] Magic code',
        digits: '[zh-hans] digits',
        twoFactorCode: '[zh-hans] Two-factor code',
        workspaces: '[zh-hans] Workspaces',
        home: '[zh-hans] Home',
        inbox: '[zh-hans] Inbox',
        yourReviewIsRequired: '[zh-hans] Your review is required',
        actionBadge: {
            submit: '[zh-hans] Submit',
            approve: '[zh-hans] Approve',
            pay: '[zh-hans] Pay',
            fix: '[zh-hans] Fix',
        },
        success: '[zh-hans][ctx: Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”] Success',
        group: '[zh-hans] Group',
        profile: '[zh-hans] Profile',
        referral: '[zh-hans] Referral',
        payments: '[zh-hans] Payments',
        approvals: '[zh-hans] Approvals',
        wallet: '[zh-hans] Wallet',
        preferences: '[zh-hans] Preferences',
        view: '[zh-hans] View',
        review: (amount?: string) => `[zh-hans] Review${amount ? ` ${amount}` : ''}`,
        not: '[zh-hans] Not',
        signIn: '[zh-hans] Sign in',
        signInWithGoogle: '[zh-hans] Sign in with Google',
        signInWithApple: '[zh-hans] Sign in with Apple',
        signInWith: '[zh-hans] Sign in with',
        continue: '[zh-hans] Continue',
        firstName: '[zh-hans] First name',
        lastName: '[zh-hans] Last name',
        scanning: '[zh-hans] Scanning',
        analyzing: '[zh-hans] Analyzing...',
        thinking: '[zh-hans] Concierge is thinking...',
        addCardTermsOfService: '[zh-hans] Expensify Terms of Service',
        perPerson: '[zh-hans] per person',
        phone: '[zh-hans] Phone',
        phoneNumber: '[zh-hans] Phone number',
        phoneNumberPlaceholder: '[zh-hans] (xxx) xxx-xxxx',
        email: '[zh-hans] Email',
        and: '[zh-hans] and',
        or: '[zh-hans] or',
        details: '[zh-hans] Details',
        privacy: '[zh-hans] Privacy',
        privacyPolicy: '[zh-hans] Privacy Policy',
        hidden: '[zh-hans] Hidden',
        visible: '[zh-hans] Visible',
        delete: '[zh-hans] Delete',
        archived: '[zh-hans][ctx: UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.] archived',
        contacts: '[zh-hans] Contacts',
        recents: '[zh-hans] Recents',
        close: '[zh-hans] Close',
        comment: '[zh-hans] Comment',
        download: '[zh-hans] Download',
        downloading: '[zh-hans] Downloading',
        uploading: '[zh-hans][ctx: Indicates that a file is currently being uploaded (sent to the server), not downloaded.] Uploading',
        pin: '[zh-hans][ctx: as a verb, not a noun] Pin',
        unPin: '[zh-hans] Unpin',
        back: '[zh-hans] Back',
        saveAndContinue: '[zh-hans] Save & continue',
        settings: '[zh-hans] Settings',
        termsOfService: '[zh-hans] Terms of Service',
        members: '[zh-hans] Members',
        invite: '[zh-hans] Invite',
        here: '[zh-hans] here',
        date: '[zh-hans] Date',
        dob: '[zh-hans] Date of birth',
        currentYear: '[zh-hans] Current year',
        currentMonth: '[zh-hans] Current month',
        ssnLast4: '[zh-hans] Last 4 digits of SSN',
        ssnFull9: '[zh-hans] Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `[zh-hans] Address line ${lineNumber}`,
        personalAddress: '[zh-hans] Personal address',
        companyAddress: '[zh-hans] Company address',
        noPO: '[zh-hans] No PO boxes or mail-drop addresses, please.',
        city: '[zh-hans] City',
        state: '[zh-hans] State',
        streetAddress: '[zh-hans] Street address',
        stateOrProvince: '[zh-hans] State / Province',
        country: '[zh-hans] Country',
        zip: '[zh-hans] Zip code',
        zipPostCode: '[zh-hans] Zip / Postcode',
        whatThis: "[zh-hans] What's this?",
        iAcceptThe: '[zh-hans] I accept the ',
        acceptTermsAndPrivacy: `[zh-hans] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `[zh-hans] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `[zh-hans] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: "[zh-hans] You can't export an empty report.",
            other: () => `[zh-hans] You can't export empty reports.`,
        }),
        remove: '[zh-hans] Remove',
        admin: '[zh-hans] Admin',
        owner: '[zh-hans] Owner',
        dateFormat: '[zh-hans] YYYY-MM-DD',
        send: '[zh-hans] Send',
        na: '[zh-hans] N/A',
        noResultsFound: '[zh-hans] No results found',
        noResultsFoundMatching: (searchString: string) => `[zh-hans] No results found matching "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `[zh-hans] Suggestions available for "${searchString}".` : '[zh-hans] Suggestions available.'),
        recentDestinations: '[zh-hans] Recent destinations',
        timePrefix: "[zh-hans] It's",
        conjunctionFor: '[zh-hans] for',
        todayAt: '[zh-hans] Today at',
        tomorrowAt: '[zh-hans] Tomorrow at',
        yesterdayAt: '[zh-hans] Yesterday at',
        conjunctionAt: '[zh-hans] at',
        conjunctionTo: '[zh-hans] to',
        genericErrorMessage: '[zh-hans] Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: '[zh-hans] Percentage',
        progressBarLabel: '[zh-hans] Onboarding progress',
        converted: '[zh-hans] Converted',
        error: {
            invalidAmount: '[zh-hans] Invalid amount',
            acceptTerms: '[zh-hans] You must accept the Terms of Service to continue',
            phoneNumber: `[zh-hans] Please enter a complete phone number
(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '[zh-hans] This field is required',
            requestModified: '[zh-hans] This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `[zh-hans] Character limit exceeded (${length}/${limit})`,
            dateInvalid: '[zh-hans] Please select a valid date',
            invalidDateShouldBeFuture: '[zh-hans] Please choose today or a future date',
            invalidTimeShouldBeFuture: '[zh-hans] Please choose a time at least one minute ahead',
            invalidCharacter: '[zh-hans] Invalid character',
            enterMerchant: '[zh-hans] Enter a merchant name',
            enterAmount: '[zh-hans] Enter an amount',
            missingMerchantName: '[zh-hans] Missing merchant name',
            missingAmount: '[zh-hans] Missing amount',
            missingDate: '[zh-hans] Missing date',
            enterDate: '[zh-hans] Enter a date',
            invalidTimeRange: '[zh-hans] Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: '[zh-hans] Please complete the form above to continue',
            pleaseSelectOne: '[zh-hans] Please select an option above',
            invalidRateError: '[zh-hans] Please enter a valid rate',
            lowRateError: '[zh-hans] Rate must be greater than 0',
            email: '[zh-hans] Please enter a valid email address',
            login: '[zh-hans] An error occurred while logging in. Please try again.',
        },
        comma: '[zh-hans] comma',
        semicolon: '[zh-hans] semicolon',
        please: '[zh-hans] Please',
        contactUs: '[zh-hans][ctx: Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.] contact us',
        pleaseEnterEmailOrPhoneNumber: '[zh-hans] Please enter an email or phone number',
        fixTheErrors: '[zh-hans][ctx: Instruction prompting the user to correct multiple issues. Should use imperative form when translated.] fix the errors',
        inTheFormBeforeContinuing: '[zh-hans] in the form before continuing',
        confirm: '[zh-hans] Confirm',
        reset: '[zh-hans] Reset',
        done: '[zh-hans][ctx: Status or button indicating that an action or process has been completed. Should reflect completion.] Done',
        more: '[zh-hans] More',
        debitCard: '[zh-hans] Debit card',
        bankAccount: '[zh-hans] Bank account',
        personalBankAccount: '[zh-hans] Personal bank account',
        businessBankAccount: '[zh-hans] Business bank account',
        join: '[zh-hans] Join',
        leave: '[zh-hans] Leave',
        decline: '[zh-hans] Decline',
        reject: '[zh-hans] Reject',
        transferBalance: '[zh-hans] Transfer balance',
        enterManually: '[zh-hans][ctx: Instruction telling the user to input data manually. Refers to entering text or values in a field.] Enter it manually',
        message: '[zh-hans] Message',
        leaveThread: '[zh-hans] Leave thread',
        you: '[zh-hans] You',
        me: '[zh-hans][ctx: Refers to the current user in the UI. Should follow capitalization rules for labels] me',
        youAfterPreposition: '[zh-hans] you',
        your: '[zh-hans] your',
        conciergeHelp: '[zh-hans] Please reach out to Concierge for help.',
        youAppearToBeOffline: '[zh-hans] You appear to be offline.',
        thisFeatureRequiresInternet: '[zh-hans] This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: '[zh-hans] Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: '[zh-hans] An error occurred while trying to play this video.',
        areYouSure: '[zh-hans] Are you sure?',
        verify: '[zh-hans] Verify',
        yesContinue: '[zh-hans] Yes, continue',
        websiteExample: '[zh-hans][ctx: Provides an example format for a website URL.] e.g. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `[zh-hans][ctx: Provides an example format for a ZIP] e.g. ${zipSampleFormat}` : ''),
        description: '[zh-hans] Description',
        title: '[zh-hans] Title',
        assignee: '[zh-hans] Assignee',
        createdBy: '[zh-hans] Created by',
        with: '[zh-hans] with',
        shareCode: '[zh-hans] Share code',
        share: '[zh-hans] Share',
        per: '[zh-hans] per',
        mi: '[zh-hans][ctx: Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.] mile',
        km: '[zh-hans] kilometer',
        milesAbbreviated: '[zh-hans] mi',
        kilometersAbbreviated: '[zh-hans] km',
        copied: '[zh-hans] Copied!',
        someone: '[zh-hans] Someone',
        total: '[zh-hans] Total',
        edit: '[zh-hans] Edit',
        letsDoThis: `[zh-hans] Let's do this!`,
        letsStart: `[zh-hans] Let's start`,
        showMore: '[zh-hans] Show more',
        showLess: '[zh-hans] Show less',
        merchant: '[zh-hans] Merchant',
        change: '[zh-hans] Change',
        category: '[zh-hans] Category',
        report: '[zh-hans] Report',
        billable: '[zh-hans] Billable',
        nonBillable: '[zh-hans] Non-billable',
        tag: '[zh-hans] Tag',
        receipt: '[zh-hans] Receipt',
        verified: '[zh-hans] Verified',
        replace: '[zh-hans] Replace',
        distance: '[zh-hans] Distance',
        mile: '[zh-hans] mile',
        miles: '[zh-hans][ctx: Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.] miles',
        kilometer: '[zh-hans] kilometer',
        kilometers: '[zh-hans] kilometers',
        recent: '[zh-hans] Recent',
        all: '[zh-hans] All',
        am: '[zh-hans] AM',
        pm: '[zh-hans] PM',
        tbd: "[zh-hans][ctx: Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.] TBD",
        selectCurrency: '[zh-hans] Select a currency',
        selectSymbolOrCurrency: '[zh-hans] Select a symbol or currency',
        card: '[zh-hans] Card',
        whyDoWeAskForThis: '[zh-hans] Why do we ask for this?',
        required: '[zh-hans] Required',
        automatic: '[zh-hans] Automatic',
        showing: '[zh-hans] Showing',
        of: '[zh-hans] of',
        default: '[zh-hans] Default',
        update: '[zh-hans] Update',
        member: '[zh-hans] Member',
        auditor: '[zh-hans] Auditor',
        role: '[zh-hans] Role',
        roleCannotBeChanged: (workflowsLinkPage: string) => `[zh-hans] Role can't be changed because this member is a <a href="${workflowsLinkPage}">payer</a> on this workspace.`,
        currency: '[zh-hans] Currency',
        groupCurrency: '[zh-hans] Group currency',
        rate: '[zh-hans] Rate',
        emptyLHN: {
            title: '[zh-hans] Woohoo! All caught up.',
            subtitleText1: '[zh-hans] Find a chat using the',
            subtitleText2: '[zh-hans] button above, or create something using the',
            subtitleText3: '[zh-hans] button below.',
        },
        businessName: '[zh-hans] Business name',
        clear: '[zh-hans] Clear',
        type: '[zh-hans] Type',
        reportName: '[zh-hans] Report name',
        action: '[zh-hans] Action',
        expenses: '[zh-hans] Expenses',
        totalSpend: '[zh-hans] Total spend',
        tax: '[zh-hans] Tax',
        shared: '[zh-hans] Shared',
        drafts: '[zh-hans] Drafts',
        draft: '[zh-hans][ctx: as a noun, not a verb] Draft',
        finished: '[zh-hans] Finished',
        upgrade: '[zh-hans] Upgrade',
        downgradeWorkspace: '[zh-hans] Downgrade workspace',
        companyID: '[zh-hans] Company ID',
        userID: '[zh-hans] User ID',
        disable: '[zh-hans] Disable',
        export: '[zh-hans] Export',
        initialValue: '[zh-hans] Initial value',
        currentDate: '[zh-hans][ctx: UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.] Current date',
        value: '[zh-hans] Value',
        downloadFailedTitle: '[zh-hans] Download failed',
        downloadFailedDescription: "[zh-hans] Your download couldn't be completed. Please try again later.",
        filterLogs: '[zh-hans] Filter Logs',
        network: '[zh-hans] Network',
        reportID: '[zh-hans] Report ID',
        longReportID: '[zh-hans] Long Report ID',
        withdrawalID: '[zh-hans] Withdrawal ID',
        withdrawalStatus: '[zh-hans] Withdrawal status',
        bankAccounts: '[zh-hans] Bank accounts',
        chooseFile: '[zh-hans] Choose file',
        chooseFiles: '[zh-hans] Choose files',
        dropTitle: '[zh-hans][ctx: Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.] Let it go',
        dropMessage: '[zh-hans][ctx: Instruction for dropping one or more files into an upload area.] Drop your file here',
        ignore: '[zh-hans] Ignore',
        enabled: '[zh-hans] Enabled',
        disabled: '[zh-hans] Disabled',
        import: '[zh-hans][ctx: Action button for importing a file or data. Should use the verb form, not the noun form.] Import',
        offlinePrompt: "[zh-hans] You can't take this action right now.",
        outstanding: '[zh-hans][ctx: meaning "remaining to be paid, done, or dealt with", not "exceptionally good"] Outstanding',
        chats: '[zh-hans] Chats',
        tasks: '[zh-hans] Tasks',
        unread: '[zh-hans] Unread',
        sent: '[zh-hans] Sent',
        links: '[zh-hans] Links',
        day: '[zh-hans][ctx: Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).] day',
        days: '[zh-hans] days',
        rename: '[zh-hans] Rename',
        address: '[zh-hans] Address',
        hourAbbreviation: '[zh-hans] h',
        minuteAbbreviation: '[zh-hans] m',
        secondAbbreviation: '[zh-hans] s',
        skip: '[zh-hans] Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `[zh-hans] Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: '[zh-hans] Chat now',
        workEmail: '[zh-hans] Work email',
        destination: '[zh-hans] Destination',
        subrate: '[zh-hans][ctx: Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.] Subrate',
        perDiem: '[zh-hans] Per diem',
        validate: '[zh-hans] Validate',
        downloadAsPDF: '[zh-hans] Download as PDF',
        downloadAsCSV: '[zh-hans] Download as CSV',
        print: '[zh-hans] Print',
        help: '[zh-hans] Help',
        collapsed: '[zh-hans] Collapsed',
        expanded: '[zh-hans] Expanded',
        expenseReport: '[zh-hans] Expense Report',
        expenseReports: '[zh-hans] Expense Reports',
        rateOutOfPolicy: '[zh-hans][ctx: Rate as a noun, not a verb] Rate out of policy',
        leaveWorkspace: '[zh-hans] Leave workspace',
        leaveWorkspaceConfirmation: "[zh-hans] If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "[zh-hans] If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "[zh-hans] If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `[zh-hans] If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `[zh-hans] If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `[zh-hans] If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "[zh-hans] You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: '[zh-hans] Reimbursable',
        editYourProfile: '[zh-hans] Edit your profile',
        comments: '[zh-hans] Comments',
        sharedIn: '[zh-hans] Shared in',
        unreported: '[zh-hans] Unreported',
        explore: '[zh-hans] Explore',
        insights: '[zh-hans] Insights',
        todo: '[zh-hans] To-do',
        invoice: '[zh-hans] Invoice',
        expense: '[zh-hans] Expense',
        chat: '[zh-hans] Chat',
        task: '[zh-hans] Task',
        trip: '[zh-hans] Trip',
        apply: '[zh-hans] Apply',
        status: '[zh-hans] Status',
        on: '[zh-hans] On',
        before: '[zh-hans] Before',
        after: '[zh-hans] After',
        range: '[zh-hans] Range',
        reschedule: '[zh-hans] Reschedule',
        general: '[zh-hans] General',
        workspacesTabTitle: '[zh-hans] Workspaces',
        headsUp: '[zh-hans] Heads up!',
        submitTo: '[zh-hans] Submit to',
        forwardTo: '[zh-hans] Forward to',
        approvalLimit: '[zh-hans] Approval limit',
        overLimitForwardTo: '[zh-hans] Over limit forward to',
        merge: '[zh-hans] Merge',
        none: '[zh-hans] None',
        unstableInternetConnection: '[zh-hans] Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: '[zh-hans] Enable Global Reimbursements',
        purchaseAmount: '[zh-hans] Purchase amount',
        originalAmount: '[zh-hans] Original amount',
        frequency: '[zh-hans] Frequency',
        link: '[zh-hans] Link',
        pinned: '[zh-hans] Pinned',
        read: '[zh-hans] Read',
        copyToClipboard: '[zh-hans] Copy to clipboard',
        thisIsTakingLongerThanExpected: '[zh-hans] This is taking longer than expected...',
        domains: '[zh-hans] Domains',
        actionRequired: '[zh-hans] Action required',
        duplicate: '[zh-hans] Duplicate',
        duplicated: '[zh-hans] Duplicated',
        duplicateExpense: '[zh-hans] Duplicate expense',
        duplicateReport: '[zh-hans] Duplicate report',
        copyOfReportName: (reportName: string) => `[zh-hans] Copy of ${reportName}`,
        exchangeRate: '[zh-hans] Exchange rate',
        reimbursableTotal: '[zh-hans] Reimbursable total',
        nonReimbursableTotal: '[zh-hans] Non-reimbursable total',
        opensInNewTab: '[zh-hans] Opens in a new tab',
        locked: '[zh-hans] Locked',
        month: '[zh-hans] Month',
        week: '[zh-hans] Week',
        year: '[zh-hans] Year',
        quarter: '[zh-hans] Quarter',
        concierge: {
            sidePanelGreeting: '[zh-hans] Hi there, how can I help?',
            showHistory: '[zh-hans] Show history',
        },
        vacationDelegate: '[zh-hans] Vacation delegate',
        expensifyLogo: '[zh-hans] Expensify logo',
        approver: '[zh-hans] Approver',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `[zh-hans] enter digit ${digitIndex} of ${totalDigits}`,
    },
    socials: {
        podcast: '[zh-hans] Follow us on Podcast',
        twitter: '[zh-hans] Follow us on Twitter',
        instagram: '[zh-hans] Follow us on Instagram',
        facebook: '[zh-hans] Follow us on Facebook',
        linkedin: '[zh-hans] Follow us on LinkedIn',
    },
    concierge: {
        collapseReasoning: '[zh-hans] Collapse reasoning',
        expandReasoning: '[zh-hans] Expand reasoning',
    },
    supportalNoAccess: {
        title: '[zh-hans] Not so fast',
        descriptionWithCommand: (command?: string) =>
            `[zh-hans] You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: '[zh-hans] Locked Account',
        description: "[zh-hans] You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: '[zh-hans] Use current location',
        notFound: '[zh-hans] We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "[zh-hans] It looks like you've denied access to your location.",
        please: '[zh-hans] Please',
        allowPermission: '[zh-hans] allow location access in settings',
        tryAgain: '[zh-hans] and try again.',
    },
    contact: {
        importContacts: '[zh-hans] Import contacts',
        importContactsTitle: '[zh-hans] Import your contacts',
        importContactsText: '[zh-hans] Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: '[zh-hans] so your favorite people are always a tap away.',
        importContactsNativeText: '[zh-hans] Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: '[zh-hans] Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '[zh-hans] Camera access',
        expensifyDoesNotHaveAccessToCamera: "[zh-hans] Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: '[zh-hans] Attachment error',
        errorWhileSelectingAttachment: '[zh-hans] An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: '[zh-hans] An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: '[zh-hans] Take photo',
        chooseFromGallery: '[zh-hans] Choose from gallery',
        chooseDocument: '[zh-hans] Choose file',
        attachmentTooLarge: '[zh-hans] Attachment is too large',
        sizeExceeded: '[zh-hans] Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `[zh-hans] Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: '[zh-hans] Attachment is too small',
        sizeNotMet: '[zh-hans] Attachment size must be greater than 240 bytes',
        wrongFileType: '[zh-hans] Invalid file type',
        notAllowedExtension: '[zh-hans] This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: '[zh-hans] Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: '[zh-hans] Password-protected PDF is not supported',
        attachmentImageResized: '[zh-hans] This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: '[zh-hans] This image is too large to preview before uploading.',
        imageDimensionsTooLarge: '[zh-hans] Image dimensions are too large to process. Please use a smaller image.',
        tooManyFiles: (fileLimit: number) => `[zh-hans] You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `[zh-hans] Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "[zh-hans] Some files can't be uploaded",
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `[zh-hans] Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "[zh-hans] You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `[zh-hans] ${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: '[zh-hans] Learn more about supported formats.',
        passwordProtected: "[zh-hans] Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: '[zh-hans] Add attachments',
        addReceipt: '[zh-hans] Add receipt',
        scanReceipts: '[zh-hans] Scan receipts',
        replaceReceipt: '[zh-hans] Replace receipt',
    },
    filePicker: {
        fileError: '[zh-hans] File error',
        errorWhileSelectingFile: '[zh-hans] An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: '[zh-hans] Connection complete',
        supportingText: '[zh-hans] You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: '[zh-hans] Edit photo',
        description: '[zh-hans] Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: '[zh-hans] No extension found for mime type',
        problemGettingImageYouPasted: '[zh-hans] There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `[zh-hans] The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `[zh-hans] The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: '[zh-hans] Update app',
        updatePrompt: '[zh-hans] A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: '[zh-hans] Launching Expensify',
        expired: '[zh-hans] Your session has expired.',
        signIn: '[zh-hans] Please sign in again.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: '[zh-hans] Review transaction',
            pleaseReview: '[zh-hans] Please review this transaction',
            requiresYourReview: '[zh-hans] An Expensify Card transaction requires your review.',
            transactionDetails: '[zh-hans] Transaction details',
            attemptedTransaction: '[zh-hans] Attempted transaction',
            deny: '[zh-hans] Deny',
            approve: '[zh-hans] Approve',
            denyTransaction: '[zh-hans] Deny transaction',
            transactionDenied: '[zh-hans] Transaction denied',
            transactionApproved: '[zh-hans] Transaction approved!',
            areYouSureToDeny: '[zh-hans] Are you sure? The transaction will be denied if you close this screen.',
            youCanTryAgainAtMerchantOrReachOut:
                "[zh-hans] You can try again at the merchant. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            youNeedToTryAgainAtMerchant: "[zh-hans] This transaction was not verified, so we denied it. You'll need to try again at the merchant.",
            goBackToTheMerchant: '[zh-hans] Return to the merchant site to continue the transaction.',
            transactionFailed: '[zh-hans] Transaction failed',
            transactionCouldNotBeCompleted: '[zh-hans] Your transaction could not be completed. Please try again at the merchant.',
            transactionCouldNotBeCompletedReachOut:
                "[zh-hans] Your transaction could not be completed. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            reviewFailed: '[zh-hans] Review failed',
            alreadyReviewedSubtitle:
                '[zh-hans] You already reviewed this transaction. Please check your <transaction-history-link>transaction history</transaction-history-link> or contact <concierge-link>Concierge</concierge-link> to report any issues.',
        },
        unsupportedDevice: {
            unsupportedDevice: '[zh-hans] Unsupported device',
            pleaseDownloadMobileApp: `[zh-hans] This action is not supported on your device. Please download the Expensify app from the <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> or <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> and try again.`,
            pleaseUseWebApp: `[zh-hans] This action is not supported on your device. Please use the <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify web app</a> and try again.`,
        },
        biometricsTest: {
            biometricsTest: '[zh-hans] Biometrics test',
            authenticationSuccessful: '[zh-hans] Authentication successful',
            successfullyAuthenticatedUsing: (authType?: string) => `[zh-hans] You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `[zh-hans] Biometrics (${status})`,
            statusNeverRegistered: '[zh-hans] Never registered',
            statusNotRegistered: '[zh-hans] Not registered',
            statusRegisteredOtherDevice: () => ({one: '[zh-hans] Another device registered', other: '[zh-hans] Other devices registered'}),
            statusRegisteredThisDevice: '[zh-hans] Registered',
            yourAttemptWasUnsuccessful: '[zh-hans] Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: '[zh-hans] You couldn’t be authenticated',
            areYouSureToReject: '[zh-hans] Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: '[zh-hans] Reject authentication',
            test: '[zh-hans] Test',
            biometricsAuthentication: '[zh-hans] Biometric authentication',
            authType: {
                unknown: '[zh-hans] Unknown',
                none: '[zh-hans] None',
                credentials: '[zh-hans] Credentials',
                biometrics: '[zh-hans] Biometrics',
                faceId: '[zh-hans] Face ID',
                touchId: '[zh-hans] Touch ID',
                opticId: '[zh-hans] Optic ID',
                passkey: '[zh-hans] Passkey',
            },
        },
        pleaseEnableInSystemSettings: {
            start: '[zh-hans] Please enable face/fingerprint verification or set a device passcode in your ',
            link: '[zh-hans] system settings',
            end: '.',
        },
        oops: '[zh-hans] Oops, something went wrong',
        verificationFailed: '[zh-hans] Verification failed',
        looksLikeYouRanOutOfTime: '[zh-hans] Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: '[zh-hans] You ran out of time',
        letsVerifyItsYou: '[zh-hans] Let’s verify it’s you',
        nowLetsAuthenticateYou: "[zh-hans] Now, let's authenticate you...",
        letsAuthenticateYou: "[zh-hans] Let's authenticate you...",
        verifyYourself: {
            biometrics: '[zh-hans] Verify yourself with your face or fingerprint',
            passkeys: '[zh-hans] Verify yourself with a passkey',
        },
        enableQuickVerification: {
            biometrics: '[zh-hans] Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
            passkeys: '[zh-hans] Enable quick, secure verification using a passkey. No passwords or codes required.',
        },
        revoke: {
            revoke: '[zh-hans] Revoke',
            title: '[zh-hans] Face/fingerprint & passkeys',
            explanation:
                '[zh-hans] Face/fingerprint or passkey verification are enabled on one or more devices. Revoking access will require a magic code for the next verification on that device.',
            confirmationPrompt: "[zh-hans] Are you sure? You'll need a magic code for the next verification on that device.",
            confirmationPromptThisDevice: "[zh-hans] Are you sure? You'll need a magic code for the next verification on this device.",
            confirmationPromptMultiple: "[zh-hans] Are you sure? You'll need a magic code for the next verification on those devices.",
            confirmationPromptAll: "[zh-hans] Are you sure? You'll need a magic code for the next verification on any device.",
            cta: '[zh-hans] Revoke access',
            ctaAll: '[zh-hans] Revoke all',
            noDevices: "[zh-hans] You don't have any devices registered for face/fingerprint or passkey verification. If you register any, you will be able to revoke that access here.",
            dismiss: '[zh-hans] Got it',
            error: '[zh-hans] Request failed. Try again later.',
            thisDevice: '[zh-hans] This device',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = [
                    '[zh-hans] One',
                    '[zh-hans] Two',
                    '[zh-hans] Three',
                    '[zh-hans] Four',
                    '[zh-hans] Five',
                    '[zh-hans] Six',
                    '[zh-hans] Seven',
                    '[zh-hans] Eight',
                    '[zh-hans] Nine',
                ];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `[zh-hans] ${displayCount} other ${otherDeviceCount === 1 ? '[zh-hans] device' : '[zh-hans] devices'}`;
            },
        },
        setPin: {
            didNotShipCard: "[zh-hans] We didn't ship your card. Please try again.",
        },
        revealPin: {
            couldNotReveal: "[zh-hans] We couldn't reveal your PIN. Please try again.",
        },
        changePin: {
            didNotChange: "[zh-hans] We didn't change your PIN. Please try again.",
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            [zh-hans] Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: '[zh-hans] Head back to your original tab to continue.',
        title: "[zh-hans] Here's your magic code",
        description: dedent(`
            [zh-hans] Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            [zh-hans] Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: '[zh-hans] , or',
        signInHere: '[zh-hans] just sign in here',
        expiredCodeTitle: '[zh-hans] Magic code expired',
        expiredCodeDescription: '[zh-hans] Go back to the original device and request a new code',
        successfulNewCodeRequest: '[zh-hans] Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            [zh-hans] Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            [zh-hans] Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: '[zh-hans] request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: '[zh-hans] Paid by',
        whatsItFor: "[zh-hans] What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: '[zh-hans] Name, email, or phone number',
        findMember: '[zh-hans] Find a member',
        searchForSomeone: '[zh-hans] Search for someone',
        userSelected: (username: string) => `[zh-hans] ${username} selected`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '[zh-hans] Submit an expense, refer your team',
            subtitleText: "[zh-hans] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '[zh-hans] Book a call',
    },
    hello: '[zh-hans] Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '[zh-hans] Get started below.',
        anotherLoginPageIsOpen: '[zh-hans] Another login page is open.',
        anotherLoginPageIsOpenExplanation: "[zh-hans] You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: '[zh-hans] Welcome!',
        welcomeWithoutExclamation: '[zh-hans] Welcome',
        phrase2: "[zh-hans] Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: '[zh-hans] Your payments get to you as fast as you can get your point across.',
        enterPassword: '[zh-hans] Please enter your password',
        welcomeNewFace: (login: string) => `[zh-hans] ${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: (login: string) => `[zh-hans] Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '[zh-hans] Travel and expense, at the speed of chat',
            body: '[zh-hans] Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '[zh-hans] Continue logging in with single sign-on:',
        orContinueWithMagicCode: '[zh-hans] You can also sign in with a magic code',
        useSingleSignOn: '[zh-hans] Use single sign-on',
        useMagicCode: '[zh-hans] Use magic code',
        launching: '[zh-hans] Launching...',
        oneMoment: "[zh-hans] One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: '[zh-hans] Drop to upload',
        sendAttachment: '[zh-hans] Send attachment',
        addAttachment: '[zh-hans] Add attachment',
        writeSomething: '[zh-hans] Write something...',
        blockedFromConcierge: '[zh-hans] Communication is barred',
        askConciergeToUpdate: '[zh-hans] Try "Update an expense"...',
        askConciergeToCorrect: '[zh-hans] Try "Correct an expense"...',
        askConciergeForHelp: '[zh-hans] Ask Concierge AI for help...',
        fileUploadFailed: '[zh-hans] Upload failed. File is not supported.',
        localTime: (user: string, time: string) => `[zh-hans] It's ${time} for ${user}`,
        edited: '[zh-hans] (edited)',
        emoji: '[zh-hans] Emoji',
        collapse: '[zh-hans] Collapse',
        expand: '[zh-hans] Expand',
    },
    reportActionContextMenu: {
        copyMessage: '[zh-hans] Copy message',
        copied: '[zh-hans] Copied!',
        copyLink: '[zh-hans] Copy link',
        copyURLToClipboard: '[zh-hans] Copy URL to clipboard',
        copyEmailToClipboard: '[zh-hans] Copy email to clipboard',
        markAsUnread: '[zh-hans] Mark as unread',
        markAsRead: '[zh-hans] Mark as read',
        editAction: ({action}: EditActionParams) => `[zh-hans] Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '[zh-hans] expense' : '[zh-hans] comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '[zh-hans] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[zh-hans] Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '[zh-hans] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[zh-hans] Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: '[zh-hans] Only visible to',
        explain: '[zh-hans] Explain',
        explainMessage: '[zh-hans] Please explain this to me.',
        replyInThread: '[zh-hans] Reply in thread',
        joinThread: '[zh-hans] Join thread',
        leaveThread: '[zh-hans] Leave thread',
        copyOnyxData: '[zh-hans] Copy Onyx data',
        flagAsOffensive: '[zh-hans] Flag as offensive',
        menu: '[zh-hans] Menu',
    },
    emojiReactions: {
        addReactionTooltip: '[zh-hans] Add reaction',
        reactedWith: '[zh-hans] reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `[zh-hans] You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `[zh-hans] This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `[zh-hans] This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) =>
            `[zh-hans] This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `[zh-hans] This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `[zh-hans] This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `[zh-hans] This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `[zh-hans] This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: '[zh-hans] This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "[zh-hans] Welcome! Let's get you set up.",
        chatWithAccountManager: '[zh-hans] Chat with your account manager here',
        askMeAnything: '[zh-hans] Ask me anything!',
        sayHello: '[zh-hans] Say hello!',
        yourSpace: '[zh-hans] Your space',
        welcomeToRoom: (roomName: string) => `[zh-hans] Welcome to ${roomName}!`,
        usePlusButton: (additionalText: string) => `[zh-hans]  Use the + button to ${additionalText} an expense.`,
        askConcierge: '[zh-hans] This is your chat with Concierge, your personal AI agent. I can do almost anything, try me!',
        conciergeSupport: '[zh-hans] Your personal AI agent',
        create: '[zh-hans] create',
        iouTypes: {
            pay: '[zh-hans] pay',
            split: '[zh-hans] split',
            submit: '[zh-hans] submit',
            track: '[zh-hans] track',
            invoice: '[zh-hans] invoice',
        },
    },
    adminOnlyCanPost: '[zh-hans] Only admins can send messages in this room.',
    reportAction: {
        asCopilot: '[zh-hans] as copilot for',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `[zh-hans] created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `[zh-hans] created this report for any held expenses from deleted report #${reportID}`
                : `[zh-hans] created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: '[zh-hans] Notify everyone in this conversation',
    },
    newMessages: '[zh-hans] New messages',
    latestMessages: '[zh-hans] Latest messages',
    youHaveBeenBanned: "[zh-hans] Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: '[zh-hans] is typing...',
        areTyping: '[zh-hans] are typing...',
        multipleMembers: '[zh-hans] Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '[zh-hans] This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `[zh-hans] This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `[zh-hans] This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `[zh-hans] This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `[zh-hans] This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[zh-hans] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[zh-hans] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '[zh-hans] This booking is archived.',
    },
    writeCapabilityPage: {
        label: '[zh-hans] Who can post',
        writeCapability: {
            all: '[zh-hans] All members',
            admins: '[zh-hans] Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: '[zh-hans] Find something...',
        buttonMySettings: '[zh-hans] My settings',
        fabNewChat: '[zh-hans] Start chat',
        fabNewChatExplained: '[zh-hans] Open actions menu',
        fabScanReceiptExplained: '[zh-hans] Scan receipt',
        chatPinned: '[zh-hans] Chat pinned',
        draftedMessage: '[zh-hans] Drafted message',
        listOfChatMessages: '[zh-hans] List of chat messages',
        listOfChats: '[zh-hans] List of chats',
        saveTheWorld: '[zh-hans] Save the world',
        tooltip: '[zh-hans] Get started here!',
        redirectToExpensifyClassicModal: {
            title: '[zh-hans] Coming soon',
            description: "[zh-hans] We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        },
    },
    homePage: {
        forYou: '[zh-hans] For you',
        timeSensitiveSection: {
            title: '[zh-hans] Time sensitive',
            ctaFix: '[zh-hans] Fix',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `[zh-hans] Fix ${feedName} company card connection` : '[zh-hans] Fix company card connection'),
                defaultSubtitle: '[zh-hans] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `[zh-hans] Fix ${cardName} personal card connection` : '[zh-hans] Fix personal card connection'),
                subtitle: '[zh-hans] Wallet',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `[zh-hans] Fix ${integrationName} connection`,
                defaultSubtitle: '[zh-hans] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: '[zh-hans] We need your shipping address',
                subtitle: '[zh-hans] Provide an address to receive your Expensify Card.',
                cta: '[zh-hans] Add address',
            },
            addPaymentCard: {
                title: '[zh-hans] Add a payment card to keep using Expensify',
                subtitle: '[zh-hans] Account > Subscription',
                cta: '[zh-hans] Add',
            },
            activateCard: {
                title: '[zh-hans] Activate your Expensify Card',
                subtitle: '[zh-hans] Validate your card and start spending.',
                cta: '[zh-hans] Activate',
            },
            reviewCardFraud: {
                title: '[zh-hans] Review potential fraud on your Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `[zh-hans] Review ${amount} in potential fraud at ${merchant}`,
                subtitle: '[zh-hans] Expensify Card',
                cta: '[zh-hans] Review',
            },
            validateAccount: {
                title: '[zh-hans] Validate your account to continue using Expensify',
                subtitle: '[zh-hans] Account',
                cta: '[zh-hans] Validate',
            },
            fixFailedBilling: {
                title: "[zh-hans] We couldn't bill your card on file",
                subtitle: '[zh-hans] Subscription',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `[zh-hans] Free trial: ${days} ${days === 1 ? '[zh-hans] day' : '[zh-hans] days'} left!`,
            offer50Body: '[zh-hans] Get 50% off your first year!',
            offer25Body: '[zh-hans] Get 25% off your first year!',
            addCardBody: "[zh-hans] Don't wait! Add your payment card now.",
            ctaClaim: '[zh-hans] Claim',
            ctaAdd: '[zh-hans] Add card',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `[zh-hans] Time remaining: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: '[zh-hans] Time remaining: 1 day',
                other: (pluralCount: number) => `[zh-hans] Time remaining: ${pluralCount} days`,
            }),
        },
        assignedCards: '[zh-hans] Your Expensify Cards',
        assignedCardsRemaining: ({amount}: {amount: string}) => `[zh-hans] ${amount} remaining`,
        announcements: '[zh-hans] Announcements',
        discoverSection: {
            title: '[zh-hans] Discover',
            menuItemTitleNonAdmin: '[zh-hans] Learn how to create expenses and submit reports.',
            menuItemTitleAdmin: '[zh-hans] Learn how to invite members, edit approval workflows, and reconcile company cards.',
            menuItemDescription: '[zh-hans] See what Expensify can do in 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `[zh-hans] Submit ${count} ${count === 1 ? '[zh-hans] report' : '[zh-hans] reports'}`,
            approve: ({count}: {count: number}) => `[zh-hans] Approve ${count} ${count === 1 ? '[zh-hans] report' : '[zh-hans] reports'}`,
            pay: ({count}: {count: number}) => `[zh-hans] Pay ${count} ${count === 1 ? '[zh-hans] report' : '[zh-hans] reports'}`,
            export: ({count}: {count: number}) => `[zh-hans] Export ${count} ${count === 1 ? '[zh-hans] report' : '[zh-hans] reports'}`,
            begin: '[zh-hans] Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: "[zh-hans] You're done!",
                thumbsUpStarsDescription: '[zh-hans] Thumbs up to you, stay tuned for more tasks.',
                smallRocketTitle: '[zh-hans] All caught up',
                smallRocketDescription: '[zh-hans] Upcoming to-dos will launch here.',
                cowboyHatTitle: "[zh-hans] You're done!",
                cowboyHatDescription: '[zh-hans] All tasks are wrangled, keep an eye out for more.',
                trophy1Title: '[zh-hans] Nothing to show',
                trophy1Description: '[zh-hans] You did it! Keep an eye out for more to-dos.',
                palmTreeTitle: '[zh-hans] All caught up',
                palmTreeDescription: '[zh-hans] Time to relax but stay tuned for future tasks.',
                fishbowlBlueTitle: "[zh-hans] You're done!",
                fishbowlBlueDescription: "[zh-hans] We'll bubble up future tasks here.",
                targetTitle: '[zh-hans] All caught up',
                targetDescription: '[zh-hans] Way to stay on target. Check back for more tasks!',
                chairTitle: '[zh-hans] Nothing to show',
                chairDescription: "[zh-hans] Go relax, we'll list upcoming to-dos here.",
                broomTitle: "[zh-hans] You're done!",
                broomDescription: '[zh-hans] Tasks are clean, though stay tuned for more to-dos.',
                houseTitle: '[zh-hans] All caught up',
                houseDescription: '[zh-hans] This is your home base for upcoming to-dos.',
                conciergeBotTitle: '[zh-hans] Nothing to show',
                conciergeBotDescription: '[zh-hans] Beep boop beep boop, check back for more tasks!',
                checkboxTextTitle: '[zh-hans] All caught up',
                checkboxTextDescription: '[zh-hans] Check off your upcoming to-dos here.',
                flashTitle: "[zh-hans] You're done!",
                flashDescription: "[zh-hans] We'll zap your future tasks here.",
                sunglassesTitle: '[zh-hans] Nothing to show',
                sunglassesDescription: "[zh-hans] Time to chill, though stay tuned for what's next!",
                f1FlagsTitle: '[zh-hans] All caught up',
                f1FlagsDescription: "[zh-hans] You've finished all outstanding to-dos.",
            },
        },
        gettingStartedSection: {
            title: '[zh-hans] Getting started',
            createWorkspace: '[zh-hans] Create a workspace',
            connectAccounting: ({integrationName}: {integrationName: string}) => `[zh-hans] Connect to ${integrationName}`,
            connectAccountingDefault: '[zh-hans] Connect to accounting',
            customizeCategories: '[zh-hans] Customize accounting categories',
            linkCompanyCards: '[zh-hans] Link company cards',
            setupRules: '[zh-hans] Set up spend rules',
        },
        upcomingTravel: '[zh-hans] Upcoming travel',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `[zh-hans] Flight to ${destination}`,
            trainTo: ({destination}: {destination: string}) => `[zh-hans] Train to ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `[zh-hans] Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `[zh-hans] Car rental in ${destination}`,
            inOneWeek: '[zh-hans] In 1 week',
            inDays: () => ({
                one: '[zh-hans] In 1 day',
                other: (count: number) => `[zh-hans] In ${count} days`,
            }),
            today: '[zh-hans] Today',
        },
    },
    allSettingsScreen: {
        subscription: '[zh-hans] Subscription',
        domains: '[zh-hans] Domains',
    },
    tabSelector: {
        chat: '[zh-hans] Chat',
        room: '[zh-hans] Room',
        distance: '[zh-hans] Distance',
        manual: '[zh-hans] Manual',
        scan: '[zh-hans] Scan',
        map: '[zh-hans] Map',
        gps: '[zh-hans] GPS',
        odometer: '[zh-hans] Odometer',
    },
    spreadsheet: {
        upload: '[zh-hans] Upload a spreadsheet',
        import: '[zh-hans] Import spreadsheet',
        dragAndDrop: '[zh-hans] <muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `[zh-hans] <muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '[zh-hans] <muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `[zh-hans] <muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: '[zh-hans] File contains column headers',
        column: (name: string) => `[zh-hans] Column ${name}`,
        fieldNotMapped: (fieldName: string) => `[zh-hans] Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `[zh-hans] Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `[zh-hans] Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: '[zh-hans] Import successful',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[zh-hans] No categories have been added or updated.';
            }
            if (added && updated) {
                return `[zh-hans] ${added} ${added === 1 ? '[zh-hans] category' : '[zh-hans] categories'} added, ${updated} ${updated === 1 ? '[zh-hans] category' : '[zh-hans] categories'} updated.`;
            }
            if (added) {
                return added === 1 ? '[zh-hans] 1 category has been added.' : `[zh-hans] ${added} categories have been added.`;
            }
            return updated === 1 ? '[zh-hans] 1 category has been updated.' : `[zh-hans] ${updated} categories have been updated.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[zh-hans] ${transactions} transactions have been added.` : '[zh-hans] 1 transaction has been added.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[zh-hans] No members have been added or updated.';
            }
            if (added && updated) {
                return `[zh-hans] ${added} member${added > 1 ? '[zh-hans] s' : ''} added, ${updated} member${updated > 1 ? '[zh-hans] s' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `[zh-hans] ${updated} members have been updated.` : '[zh-hans] 1 member has been updated.';
            }
            return added > 1 ? `[zh-hans] ${added} members have been added.` : '[zh-hans] 1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `[zh-hans] ${tags} tags have been added.` : '[zh-hans] 1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: '[zh-hans] Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) =>
            rates > 1 ? `[zh-hans] ${rates} per diem rates have been added.` : '[zh-hans] 1 per diem rate has been added.',
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[zh-hans] ${transactions} transactions have been imported.` : '[zh-hans] 1 transaction has been imported.',
        importFailedTitle: '[zh-hans] Import failed',
        importFailedDescription: '[zh-hans] Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: '[zh-hans] Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: '[zh-hans] File size must be greater than 0 bytes',
        invalidFileMessage:
            '[zh-hans] The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: '[zh-hans] Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: '[zh-hans] Import spreadsheet',
        downloadCSV: '[zh-hans] Download CSV',
        importMemberConfirmation: () => ({
            one: `[zh-hans] Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `[zh-hans] Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: '[zh-hans] Upload receipt',
        uploadMultiple: '[zh-hans] Upload receipts',
        desktopSubtitleSingle: `[zh-hans] or drag and drop it here`,
        desktopSubtitleMultiple: `[zh-hans] or drag and drop them here`,
        alternativeMethodsTitle: '[zh-hans] Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `[zh-hans] <label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `[zh-hans] <label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `[zh-hans] <label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `[zh-hans] <label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: '[zh-hans] Take a photo',
        cameraAccess: '[zh-hans] Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `[zh-hans] Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: '[zh-hans] Camera error',
        cameraErrorMessage: '[zh-hans] An error occurred while taking a photo. Please try again.',
        locationAccessTitle: '[zh-hans] Allow location access',
        locationAccessMessage: '[zh-hans] Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: '[zh-hans] Allow location access',
        locationErrorMessage: '[zh-hans] Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `[zh-hans] Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '[zh-hans] Let it go',
        dropMessage: '[zh-hans] Drop your file here',
        flash: '[zh-hans] flash',
        multiScan: '[zh-hans] multi-scan',
        shutter: '[zh-hans] shutter',
        gallery: '[zh-hans] gallery',
        deleteReceipt: '[zh-hans] Delete receipt',
        deleteConfirmation: '[zh-hans] Are you sure you want to delete this receipt?',
        addReceipt: '[zh-hans] Add receipt',
        addAdditionalReceipt: '[zh-hans] Add additional receipt',
        scanFailed: "[zh-hans] The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        crop: '[zh-hans] Crop',
        addAReceipt: {
            phrase1: '[zh-hans] Add a receipt',
            phrase2: '[zh-hans] or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: '[zh-hans] Scan receipt',
        recordDistance: '[zh-hans] Track distance',
        requestMoney: '[zh-hans] Create expense',
        perDiem: '[zh-hans] Create per diem',
        splitBill: '[zh-hans] Split expense',
        splitScan: '[zh-hans] Split receipt',
        splitDistance: '[zh-hans] Split distance',
        paySomeone: (name?: string) => `[zh-hans] Pay ${name ?? '[zh-hans] someone'}`,
        assignTask: '[zh-hans] Assign task',
        header: '[zh-hans] Quick action',
        noLongerHaveReportAccess: '[zh-hans] You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: '[zh-hans] Update destination',
        createReport: '[zh-hans] Create report',
        createTimeExpense: '[zh-hans] Create time expense',
    },
    iou: {
        amount: '[zh-hans] Amount',
        percent: '[zh-hans] Percent',
        date: '[zh-hans] Date',
        taxAmount: '[zh-hans] Tax amount',
        taxRate: '[zh-hans] Tax rate',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `[zh-hans] Approve ${formattedAmount}` : '[zh-hans] Approve'),
        approved: '[zh-hans] Approved',
        cash: '[zh-hans] Cash',
        card: '[zh-hans] Card',
        original: '[zh-hans] Original',
        split: '[zh-hans] Split',
        splitExpense: '[zh-hans] Split expense',
        splitDates: '[zh-hans] Split dates',
        splitDateRange: (startDate: string, endDate: string, count: number) => `[zh-hans] ${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `[zh-hans] ${amount} from ${merchant}`,
        splitByPercentage: '[zh-hans] Split by percentage',
        splitByDate: '[zh-hans] Split by date',
        addSplit: '[zh-hans] Add split',
        makeSplitsEven: '[zh-hans] Make splits even',
        editSplits: '[zh-hans] Edit splits',
        totalAmountGreaterThanOriginal: (amount: string) => `[zh-hans] Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: (amount: string) => `[zh-hans] Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: '[zh-hans] Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: '[zh-hans] No splits added. Add at least one to save.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `[zh-hans] Edit ${amount} for ${merchant}`,
        removeSplit: '[zh-hans] Remove split',
        splitExpenseCannotBeEditedModalTitle: "[zh-hans] This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: '[zh-hans] Approved or paid expenses cannot be edited',
        paySomeone: (name?: string) => `[zh-hans] Pay ${name ?? '[zh-hans] someone'}`,
        splitExpenseDistanceErrorModalDescription: '[zh-hans] Please fix the distance rate error and try again.',
        splitExpensePerDiemRateErrorModalDescription: '[zh-hans] Please fix the per diem rate error and try again.',
        expense: '[zh-hans] Expense',
        categorize: '[zh-hans] Categorize',
        share: '[zh-hans] Share',
        participants: '[zh-hans] Participants',
        createExpense: '[zh-hans] Create expense',
        trackDistance: '[zh-hans] Track distance',
        createExpenses: (expensesNumber: number) => `[zh-hans] Create ${expensesNumber} expenses`,
        removeExpense: '[zh-hans] Remove expense',
        removeThisExpense: '[zh-hans] Remove this expense',
        removeExpenseConfirmation: '[zh-hans] Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: '[zh-hans] Add expense',
        chooseRecipient: '[zh-hans] Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `[zh-hans] Create ${amount} expense`,
        confirmDetails: '[zh-hans] Confirm details',
        pay: '[zh-hans] Pay',
        cancelPayment: '[zh-hans] Cancel payment',
        cancelPaymentConfirmation: '[zh-hans] Are you sure that you want to cancel this payment?',
        viewDetails: '[zh-hans] View details',
        pending: '[zh-hans] Pending',
        canceled: '[zh-hans] Canceled',
        posted: '[zh-hans] Posted',
        deleteReceipt: '[zh-hans] Delete receipt',
        findExpense: '[zh-hans] Find expense',
        deletedTransaction: (amount: string, merchant: string) => `[zh-hans] deleted an expense (${amount} for ${merchant})`,
        movedFromReport: (reportName: string) => `[zh-hans] moved an expense${reportName ? `[zh-hans]  from ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `[zh-hans] moved this expense${reportName ? `[zh-hans]  to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `[zh-hans] moved this expense${reportName ? `[zh-hans]  from <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `[zh-hans] moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `[zh-hans] moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `[zh-hans] moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: '[zh-hans] Receipt pending match with card transaction',
        pendingMatch: '[zh-hans] Pending match',
        pendingMatchWithCreditCardDescription: '[zh-hans] Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: '[zh-hans] Mark as cash',
        pendingMatchSubmitTitle: '[zh-hans] Submit report',
        pendingMatchSubmitDescription: '[zh-hans] Some expenses are awaiting a match with a credit card transaction. Do you want to mark them as cash?',
        routePending: '[zh-hans] Route pending...',
        automaticallyEnterExpenseDetails: '[zh-hans] Concierge will automatically enter the expense details for you, or you can add them manually.',
        receiptScanning: () => ({
            one: '[zh-hans] Receipt scanning...',
            other: '[zh-hans] Receipts scanning...',
        }),
        scanMultipleReceipts: '[zh-hans] Scan multiple receipts',
        scanMultipleReceiptsDescription: "[zh-hans] Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: '[zh-hans] Receipt scan in progress',
        receiptScanInProgressDescription: '[zh-hans] Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: '[zh-hans] Remove from report',
        moveToPersonalSpace: '[zh-hans] Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '[zh-hans] Potential duplicate expenses identified. Review duplicates to enable submission.'
                : '[zh-hans] Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: '[zh-hans] Issue found',
            other: '[zh-hans] Issues found',
        }),
        fieldPending: '[zh-hans] Pending...',
        defaultRate: '[zh-hans] Default rate',
        receiptMissingDetails: '[zh-hans] Receipt missing details',
        missingAmount: '[zh-hans] Missing amount',
        missingMerchant: '[zh-hans] Missing merchant',
        receiptStatusTitle: '[zh-hans] Scanning…',
        receiptStatusText: "[zh-hans] Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: '[zh-hans] Receipt scanning failed. Please enter the details manually.',
        transactionPendingDescription: '[zh-hans] Transaction pending. It may take a few days to post.',
        companyInfo: '[zh-hans] Company info',
        companyInfoDescription: '[zh-hans] We need a few more details before you can send your first invoice.',
        yourCompanyName: '[zh-hans] Your company name',
        yourCompanyWebsite: '[zh-hans] Your company website',
        yourCompanyWebsiteNote: "[zh-hans] If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: '[zh-hans] You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: '[zh-hans] You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '[zh-hans] 1 expense',
                other: (count: number) => `[zh-hans] ${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: '[zh-hans] Delete expense',
            other: '[zh-hans] Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: '[zh-hans] Are you sure that you want to delete this expense?',
            other: '[zh-hans] Are you sure that you want to delete these expenses?',
        }),
        deleteReport: () => ({
            one: '[zh-hans] Delete report',
            other: '[zh-hans] Delete reports',
        }),
        deleteReportConfirmation: () => ({
            one: '[zh-hans] Are you sure that you want to delete this report?',
            other: '[zh-hans] Are you sure that you want to delete these reports?',
        }),
        settledExpensify: '[zh-hans] Paid',
        done: '[zh-hans] Done',
        deleted: '[zh-hans] Deleted',
        settledElsewhere: '[zh-hans] Paid elsewhere',
        individual: '[zh-hans] Individual',
        business: '[zh-hans] Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `[zh-hans] Pay ${formattedAmount} as an individual` : `[zh-hans] Pay with personal account`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `[zh-hans] Pay ${formattedAmount} with wallet` : `[zh-hans] Pay with wallet`),
        settlePayment: (formattedAmount: string) => `[zh-hans] Pay ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `[zh-hans] Pay ${formattedAmount} as a business` : `[zh-hans] Pay with business account`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `[zh-hans] Mark ${formattedAmount} as paid` : `[zh-hans] Mark as paid`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `[zh-hans] paid ${amount} with personal account ${last4Digits}` : `[zh-hans] Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `[zh-hans] paid ${amount} with business account ${last4Digits}` : `[zh-hans] Paid with business account`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `[zh-hans] Pay ${formattedAmount} via ${policyName}` : `[zh-hans] Pay via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) =>
            amount ? `[zh-hans] paid ${amount} with bank account ${last4Digits}` : `[zh-hans] paid with bank account ${last4Digits}`,
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `[zh-hans] paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `[zh-hans] Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `[zh-hans] Business Account • ${lastFour}`,
        nextStep: '[zh-hans] Next steps',
        finished: '[zh-hans] Finished',
        flip: '[zh-hans] Flip',
        sendInvoice: (amount: string) => `[zh-hans] Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `[zh-hans]  for ${comment}` : ''}`,
        submitted: (memo?: string) => `[zh-hans] submitted${memo ? `[zh-hans] , saying ${memo}` : ''}`,
        automaticallySubmitted: `[zh-hans] submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: '[zh-hans] queued to submit via custom approval workflow',
        failedToAutoSubmitViaDEW: (reason: string) => `[zh-hans] failed to submit the report via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `[zh-hans] failed to submit the report. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `[zh-hans] failed to approve via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `[zh-hans] failed to approve. ${reason}`,
        queuedToApproveViaDEW: '[zh-hans] queued to approve via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `[zh-hans] tracking ${formattedAmount}${comment ? `[zh-hans]  for ${comment}` : ''}`,
        splitAmount: (amount: string) => `[zh-hans] split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `[zh-hans] split ${formattedAmount}${comment ? `[zh-hans]  for ${comment}` : ''}`,
        yourSplit: (amount: string) => `[zh-hans] Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `[zh-hans] ${payer} owes ${amount}${comment ? `[zh-hans]  for ${comment}` : ''}`,
        payerOwes: (payer: string) => `[zh-hans] ${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `[zh-hans] ${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: (payer: string) => `[zh-hans] ${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `[zh-hans] ${payer} spent ${amount}`,
        payerSpent: (payer: string) => `[zh-hans] ${payer} spent: `,
        managerApproved: (manager: string) => `[zh-hans] ${manager} approved:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `[zh-hans] ${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `[zh-hans] paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `[zh-hans] paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `[zh-hans] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `[zh-hans] approved ${amount}`,
        approvedMessage: `[zh-hans] approved`,
        unapproved: `[zh-hans] unapproved`,
        automaticallyForwarded: `[zh-hans] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `[zh-hans] approved`,
        rejectedThisReport: '[zh-hans] rejected',
        waitingOnBankAccount: (submitterDisplayName: string) => `[zh-hans] started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: '[zh-hans] canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `[zh-hans] canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `[zh-hans] ${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `[zh-hans] ${payer ? `${payer} ` : ''}marked as paid${comment ? `[zh-hans] , saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `[zh-hans] ${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `[zh-hans] ${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        reimbursedThisReport: '[zh-hans] reimbursed this report',
        paidThisBill: '[zh-hans] paid this bill',
        reimbursedOnBehalfOf: (actor: string) => `[zh-hans] on behalf of ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `[zh-hans] from the bank account ending in ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `[zh-hans] ${submitter} added a bank account, taking report off hold. Reimbursement is initiated`,
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
                ? `[zh-hans] . Money is on its way to your${creditBankAccount ? `[zh-hans]  bank account ending in ${creditBankAccount}` : '[zh-hans]  account'}. Reimbursement estimated to complete on ${expectedDate}.`
                : `[zh-hans] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[zh-hans]  bank account ending in ${creditBankAccount}` : '[zh-hans]  account'}. Reimbursement estimated to complete on ${expectedDate}.`,
        reimbursedWithCheck: '[zh-hans]  via check.',
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
            const paymentMethod = isCard ? '[zh-hans] card' : '[zh-hans] bank account';
            return isCurrentUser
                ? `[zh-hans] . Money is on its way to your${creditBankAccount ? `[zh-hans]  bank account ending in ${creditBankAccount}` : '[zh-hans]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`
                : `[zh-hans] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[zh-hans]  bank account ending in ${creditBankAccount}` : '[zh-hans]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `[zh-hans]  with direct deposit (ACH)${creditBankAccount ? `[zh-hans]  to the bank account ending in ${creditBankAccount}. ` : '. '}${expectedDate ? `[zh-hans] The reimbursement is estimated to complete by ${expectedDate}.` : '[zh-hans] This generally takes 4-5 business days.'}`,
        noReimbursableExpenses: '[zh-hans] This report has an invalid amount',
        pendingConversionMessage: "[zh-hans] Total will update when you're back online",
        changedTheExpense: '[zh-hans] changed the expense',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `[zh-hans] the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `[zh-hans] set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `[zh-hans] the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) =>
            `[zh-hans] the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `[zh-hans] changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: '[zh-hans] based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `[zh-hans] based on <a href="${rulesLink}">workspace rules</a>` : '[zh-hans] based on workspace rule'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `[zh-hans] for ${comment}` : '[zh-hans] expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `[zh-hans] Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `[zh-hans] ${formattedAmount} sent${comment ? `[zh-hans]  for ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) =>
            `[zh-hans] moved expense from personal space to ${workspaceName ?? `[zh-hans] chat with ${reportName}`}`,
        movedToPersonalSpace: '[zh-hans] moved expense to personal space',
        error: {
            invalidCategoryLength: '[zh-hans] The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: '[zh-hans] The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: '[zh-hans] Please enter a valid amount before continuing',
            invalidDistance: '[zh-hans] Please enter a valid distance before continuing',
            invalidReadings: '[zh-hans] Please enter both start and end readings',
            negativeDistanceNotAllowed: '[zh-hans] End reading must be greater than start reading',
            distanceAmountTooLarge: '[zh-hans] The total amount is too large. Reduce the distance or lower the rate.',
            distanceAmountTooLargeReduceDistance: '[zh-hans] The total amount is too large. Reduce the distance.',
            distanceAmountTooLargeReduceRate: '[zh-hans] The total amount is too large. Lower the rate.',
            odometerReadingTooLarge: (formattedMax: string) => `[zh-hans] Odometer readings cannot exceed ${formattedMax}.`,
            stitchOdometerImagesFailed: '[zh-hans] Failed to combine odometer images. Please try again later.',
            invalidIntegerAmount: '[zh-hans] Please enter a whole dollar amount before continuing',
            invalidTaxAmount: (amount: string) => `[zh-hans] Maximum tax amount is ${amount}`,
            invalidSplit: '[zh-hans] The sum of splits must equal the total amount',
            invalidSplitParticipants: '[zh-hans] Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: '[zh-hans] Please enter a non-zero amount for your split',
            noParticipantSelected: '[zh-hans] Please select a participant',
            other: '[zh-hans] Unexpected error. Please try again later.',
            genericCreateFailureMessage: '[zh-hans] Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: '[zh-hans] Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: '[zh-hans] Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: '[zh-hans] Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: '[zh-hans] Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '[zh-hans] <rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: '[zh-hans] There was an error uploading your receipt.',
            genericDeleteFailureMessage: '[zh-hans] Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: '[zh-hans] Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: '[zh-hans] Transaction is missing fields',
            duplicateWaypointsErrorMessage: '[zh-hans] Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: '[zh-hans] Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: '[zh-hans] An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: '[zh-hans] Please enter a valid merchant',
            atLeastOneAttendee: '[zh-hans] At least one attendee must be selected',
            invalidQuantity: '[zh-hans] Please enter a valid quantity',
            quantityGreaterThanZero: '[zh-hans] Quantity must be greater than zero',
            invalidSubrateLength: '[zh-hans] There must be at least one subrate',
            invalidRate: '[zh-hans] Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "[zh-hans] The end date can't be before the start date",
            endDateSameAsStartDate: "[zh-hans] The end date can't be the same as the start date",
            manySplitsProvided: `[zh-hans] The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `[zh-hans] The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
        },
        dismissReceiptError: '[zh-hans] Dismiss error',
        dismissReceiptErrorConfirmation: '[zh-hans] Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `[zh-hans] started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: '[zh-hans] Enable wallet',
        hold: '[zh-hans] Hold',
        unhold: '[zh-hans] Remove hold',
        holdExpense: () => ({
            one: '[zh-hans] Hold expense',
            other: '[zh-hans] Hold expenses',
        }),
        unholdExpense: '[zh-hans] Unhold expense',
        heldExpense: '[zh-hans] held this expense',
        unheldExpense: '[zh-hans] unheld this expense',
        moveUnreportedExpense: '[zh-hans] Move unreported expense',
        addUnreportedExpense: '[zh-hans] Add unreported expense',
        selectUnreportedExpense: '[zh-hans] Select at least one expense to add to the report.',
        emptyStateUnreportedExpenseTitle: '[zh-hans] No unreported expenses',
        emptyStateUnreportedExpenseSubtitle: '[zh-hans] Looks like you don’t have any unreported expenses. Try creating one below.',
        addUnreportedExpenseConfirm: '[zh-hans] Add to report',
        newReport: '[zh-hans] New report',
        explainHold: () => ({
            one: "[zh-hans] Explain why you're holding this expense.",
            other: "[zh-hans] Explain why you're holding these expenses.",
        }),
        explainHoldApprover: () => ({
            one: '[zh-hans] Explain what you need before approving this expense.',
            other: '[zh-hans] Explain what you need before approving these expenses.',
        }),
        retracted: '[zh-hans] retracted',
        retract: '[zh-hans] Retract',
        reopened: '[zh-hans] reopened',
        reopenReport: '[zh-hans] Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `[zh-hans] This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: '[zh-hans] Reason',
        holdReasonRequired: '[zh-hans] A reason is required when holding.',
        expenseWasPutOnHold: '[zh-hans] Expense was put on hold',
        expenseOnHold: '[zh-hans] This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: '[zh-hans] All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: '[zh-hans] This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: '[zh-hans] Some of these duplicates have been approved or paid already.',
        reviewDuplicates: '[zh-hans] Review duplicates',
        keepAll: '[zh-hans] Keep all',
        noDuplicatesTitle: '[zh-hans] All set!',
        noDuplicatesDescription: '[zh-hans] There are no duplicate transactions for review here.',
        confirmApprove: '[zh-hans] Confirm approval amount',
        confirmApprovalAmount: '[zh-hans] Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: '[zh-hans] This expense is on hold. Do you want to approve anyway?',
            other: '[zh-hans] These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: '[zh-hans] Confirm payment amount',
        confirmPayAmount: "[zh-hans] Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: '[zh-hans] This expense is on hold. Do you want to pay anyway?',
            other: '[zh-hans] These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: '[zh-hans] Pay only',
        approveOnly: '[zh-hans] Approve only',
        holdEducationalTitle: '[zh-hans] Should you hold this expense?',
        whatIsHoldExplain: "[zh-hans] Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: '[zh-hans] Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "[zh-hans] Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: '[zh-hans] You moved this report!',
            description: '[zh-hans] Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '[zh-hans] <strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: '[zh-hans] This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: '[zh-hans] Change workspace',
        set: '[zh-hans] set',
        changed: '[zh-hans] changed',
        removed: '[zh-hans] removed',
        transactionPending: '[zh-hans] Transaction pending.',
        chooseARate: '[zh-hans] Select a workspace reimbursement rate per mile or kilometer',
        unapprove: '[zh-hans] Unapprove',
        unapproveReport: '[zh-hans] Unapprove report',
        headsUp: '[zh-hans] Heads up!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `[zh-hans] This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: '[zh-hans] reimbursable',
        nonReimbursable: '[zh-hans] non-reimbursable',
        bookingPending: '[zh-hans] This booking is pending',
        bookingPendingDescription: "[zh-hans] This booking is pending because it hasn't been paid yet.",
        bookingArchived: '[zh-hans] This booking is archived',
        bookingArchivedDescription: '[zh-hans] This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: '[zh-hans] Attendees',
        totalPerAttendee: '[zh-hans] Per attendee',
        whoIsYourAccountant: '[zh-hans] Who is your accountant?',
        paymentComplete: '[zh-hans] Payment complete',
        time: '[zh-hans] Time',
        startDate: '[zh-hans] Start date',
        endDate: '[zh-hans] End date',
        startTime: '[zh-hans] Start time',
        endTime: '[zh-hans] End time',
        deleteSubrate: '[zh-hans] Delete subrate',
        deleteSubrateConfirmation: '[zh-hans] Are you sure you want to delete this subrate?',
        quantity: '[zh-hans] Quantity',
        subrateSelection: '[zh-hans] Select a subrate and enter a quantity.',
        qty: '[zh-hans] Qty',
        firstDayText: () => ({
            one: `[zh-hans] First day: 1 hour`,
            other: (count: number) => `[zh-hans] First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `[zh-hans] Last day: 1 hour`,
            other: (count: number) => `[zh-hans] Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `[zh-hans] Trip: 1 full day`,
            other: (count: number) => `[zh-hans] Trip: ${count} full days`,
        }),
        dates: '[zh-hans] Dates',
        rates: '[zh-hans] Rates',
        submitsTo: (name: string) => `[zh-hans] Submits to ${name}`,
        reject: {
            educationalTitle: '[zh-hans] Should you hold or reject?',
            educationalText: "[zh-hans] If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: '[zh-hans] Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: '[zh-hans] Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: '[zh-hans] Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "[zh-hans] Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: '[zh-hans] Reject expense',
            reasonPageDescription: '[zh-hans] Explain why you will not approve this expense.',
            rejectReason: '[zh-hans] Rejection reason',
            markAsResolved: '[zh-hans] Mark as resolved',
            rejectedStatus: '[zh-hans] This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: '[zh-hans] rejected this expense',
                markedAsResolved: '[zh-hans] marked the rejection reason as resolved',
            },
        },
        rejectReport: {
            title: '[zh-hans] Reject report',
            description: '[zh-hans] Explain why you will not approve this report:',
            rejectReason: '[zh-hans] Rejection reason',
            selectTarget: '[zh-hans] Choose the member to reject this report back to for review:',
            lastApprover: '[zh-hans] Last approver',
            submitter: '[zh-hans] Submitter',
            rejectedReportMessage: '[zh-hans] This report was rejected.',
            rejectedNextStep: '[zh-hans] This report was rejected. Waiting on you to fix the issues and manually resubmit.',
            selectMemberError: '[zh-hans] Select a member to reject this report back to.',
            couldNotReject: '[zh-hans] The report could not be rejected. Please try again.',
        },
        moveExpenses: '[zh-hans] Move to report',
        moveExpensesError: "[zh-hans] You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: '[zh-hans] Change approver',
            header: (workflowSettingLink: string) =>
                `[zh-hans] Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `[zh-hans] changed the approver to <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '[zh-hans] Add approver',
                addApproverSubtitle: '[zh-hans] Add an additional approver to the existing workflow.',
                bypassApprovers: '[zh-hans] Bypass approvers',
                bypassApproversSubtitle: '[zh-hans] Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: '[zh-hans] Choose an additional approver for this report before we route through the rest of the approval workflow.',
                bulkSubtitle: '[zh-hans] Choose an additional approver for these reports before we route through the rest of the approval workflow.',
            },
            bulkSubtitle: '[zh-hans] Choose an option to change the approver for these reports.',
        },
        chooseWorkspace: '[zh-hans] Choose a workspace',
        routedDueToDEW: (to: string, reason?: string) => `[zh-hans] report routed to ${to}${reason ? `[zh-hans]  because ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `[zh-hans] ${hours} ${hours === 1 ? '[zh-hans] hour' : '[zh-hans] hours'} @ ${rate} / hour`,
            hrs: '[zh-hans] hrs',
            hours: '[zh-hans] Hours',
            ratePreview: (rate: string) => `[zh-hans] ${rate} / hour`,
            amountTooLargeError: '[zh-hans] The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctRateError: '[zh-hans] Fix the rate error and try again.',
        AskToExplain: `[zh-hans] . <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explain<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '[zh-hans] marked the expense as "reimbursable"' : '[zh-hans] marked the expense as "non-reimbursable"'),
            billable: (value: boolean) => (value ? '[zh-hans] marked the expense as "billable"' : '[zh-hans] marked the expense as "non-billable"'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `[zh-hans] set the tax rate to "${value}"` : `[zh-hans] tax rate to "${value}"`),
            reportName: (value: string) => `[zh-hans] moved this expense to report "${value}"`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `[zh-hans] set the ${field} to "${value}"` : `[zh-hans] ${field} to "${value}"`;
            },
            formatPersonalRules: (fragments: string, route: string) => `[zh-hans] ${fragments} via <a href="${route}">personal expense rules</a>`,
            formatPolicyRules: (fragments: string, route: string) => `[zh-hans] ${fragments} via <a href="${route}">workspace rules</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: "[zh-hans] You can't duplicate per diem expenses across workspaces because the rates may differ between workspaces.",
        cannotDuplicateDistanceExpense: "[zh-hans] You can't duplicate distance expenses across workspaces because the rates may differ between workspaces.",
        taxDisabledAlert: {
            title: '[zh-hans] Tax disabled',
            prompt: '[zh-hans] Enable tax tracking on the workspace to edit the expense details or delete the tax from this expense.',
            confirmText: '[zh-hans] Delete tax',
        },
    },
    transactionMerge: {
        listPage: {
            header: '[zh-hans] Merge expenses',
            noEligibleExpenseFound: '[zh-hans] No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `[zh-hans] <muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `[zh-hans] Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '[zh-hans] Select receipt',
            pageTitle: '[zh-hans] Select the receipt you want to keep:',
        },
        detailsPage: {
            header: '[zh-hans] Select details',
            pageTitle: '[zh-hans] Select the details you want to keep:',
            noDifferences: '[zh-hans] No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '[zh-hans] an' : '[zh-hans] a';
                return `[zh-hans] Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: '[zh-hans] Please select attendees',
            selectAllDetailsError: '[zh-hans] Select all details before continuing.',
        },
        confirmationPage: {
            header: '[zh-hans] Confirm details',
            pageTitle: "[zh-hans] Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: '[zh-hans] Merge expenses',
        },
    },
    share: {
        shareToExpensify: '[zh-hans] Share to Expensify',
        messageInputLabel: '[zh-hans] Message',
    },
    notificationPreferencesPage: {
        header: '[zh-hans] Notification preferences',
        label: '[zh-hans] Notify me about new messages',
        notificationPreferences: {
            always: '[zh-hans] Immediately',
            daily: '[zh-hans] Daily',
            mute: '[zh-hans] Mute',
            hidden: '[zh-hans][ctx: UI label indicating that something is concealed or not visible to the user.] Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "[zh-hans] The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "[zh-hans] The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: '[zh-hans] Upload photo',
        removePhoto: '[zh-hans] Remove photo',
        editImage: '[zh-hans] Edit photo',
        viewPhoto: '[zh-hans] View photo',
        imageUploadFailed: '[zh-hans] Image upload failed',
        deleteWorkspaceError: '[zh-hans] Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `[zh-hans] The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `[zh-hans] Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `[zh-hans] Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: '[zh-hans] Edit profile picture',
        upload: '[zh-hans] Upload',
        uploadPhoto: '[zh-hans] Upload photo',
        selectAvatar: '[zh-hans] Select avatar',
        choosePresetAvatar: '[zh-hans] Or choose a custom avatar',
    },
    modal: {
        backdropLabel: '[zh-hans] Modal Backdrop',
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
                        return `[zh-hans] Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] Waiting for an admin to add expenses.`;
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
                        return `[zh-hans] Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] Waiting for an admin to submit expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `[zh-hans] No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[zh-hans] Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] Waiting for an admin to add a bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[zh-hans]  on the ${eta} of each month` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[zh-hans] Waiting for your expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] Waiting for an admin's expenses to automatically submit${formattedETA}.`;
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
                        return `[zh-hans] Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] Waiting for an admin to fix the issues.`;
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
                        return `[zh-hans] Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] Waiting for an admin to approve expenses.`;
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
                        return `[zh-hans] Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] Waiting for an admin to export this report.`;
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
                        return `[zh-hans] Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] Waiting for an admin to pay expenses.`;
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
                        return `[zh-hans] Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] Waiting for an admin to finish setting up a business bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[zh-hans]  by ${eta}` : ` ${eta}`;
                }
                return `[zh-hans] Waiting for payment to complete${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `[zh-hans] Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[zh-hans] This report was rejected. Waiting on <strong>you</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[zh-hans] This report was rejected. Waiting on <strong>${actor}</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[zh-hans] This report was rejected. Waiting on an admin to fix the issues and manually resubmit.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '[zh-hans] shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '[zh-hans] later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '[zh-hans] on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '[zh-hans] on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '[zh-hans] on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '[zh-hans] on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '[zh-hans] at the end of your trip',
        },
    },
    profilePage: {
        profile: '[zh-hans] Profile',
        preferredPronouns: '[zh-hans] Preferred pronouns',
        selectYourPronouns: '[zh-hans] Select your pronouns',
        selfSelectYourPronoun: '[zh-hans] Self-select your pronoun',
        emailAddress: '[zh-hans] Email address',
        setMyTimezoneAutomatically: '[zh-hans] Set my timezone automatically',
        timezone: '[zh-hans] Timezone',
        invalidFileMessage: '[zh-hans] Invalid file. Please try a different image.',
        avatarUploadFailureMessage: '[zh-hans] An error occurred uploading the avatar. Please try again.',
        online: '[zh-hans] Online',
        offline: '[zh-hans] Offline',
        syncing: '[zh-hans] Syncing',
        profileAvatar: '[zh-hans] Profile avatar',
        publicSection: {
            title: '[zh-hans] Public',
            subtitle: '[zh-hans] These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: '[zh-hans] Private',
            subtitle: "[zh-hans] These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: '[zh-hans] Security options',
        subtitle: '[zh-hans] Enable two-factor authentication to keep your account safe.',
        goToSecurity: '[zh-hans] Go back to security page',
    },
    shareCodePage: {
        title: '[zh-hans] Your code',
        subtitle: '[zh-hans] Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: '[zh-hans] Pronouns',
        isShownOnProfile: '[zh-hans] Your pronouns are shown on your profile.',
        placeholderText: '[zh-hans] Search to see options',
    },
    contacts: {
        contactMethods: '[zh-hans] Contact methods',
        featureRequiresValidate: '[zh-hans] This feature requires you to validate your account.',
        validateAccount: '[zh-hans] Validate your account',
        helpText: ({email}: {email: string}) =>
            `[zh-hans] Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: '[zh-hans] Please verify this contact method.',
        getInTouch: "[zh-hans] We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `[zh-hans] Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '[zh-hans] Set as default',
        yourDefaultContactMethod: "[zh-hans] This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        yourDefaultContactMethodRestrictedSwitch: '[zh-hans] This is your current default contact method. Your company has restricted removing or changing it.',
        removeContactMethod: '[zh-hans] Remove contact method',
        removeAreYouSure: "[zh-hans] Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: '[zh-hans] Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: '[zh-hans] Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: '[zh-hans] Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: '[zh-hans] Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: '[zh-hans] Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: '[zh-hans] Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: '[zh-hans] This contact method already exists',
            passwordRequired: '[zh-hans] password required.',
            contactMethodRequired: '[zh-hans] Contact method is required',
            invalidContactMethod: '[zh-hans] Invalid contact method',
        },
        newContactMethod: '[zh-hans] New contact method',
        goBackContactMethods: '[zh-hans] Go back to contact methods',
    },
    pronouns: {
        coCos: '[zh-hans] Co / Cos',
        eEyEmEir: '[zh-hans] E / Ey / Em / Eir',
        faeFaer: '[zh-hans] Fae / Faer',
        heHimHis: '[zh-hans] He / Him / His',
        heHimHisTheyThemTheirs: '[zh-hans] He / Him / His / They / Them / Theirs',
        sheHerHers: '[zh-hans] She / Her / Hers',
        sheHerHersTheyThemTheirs: '[zh-hans] She / Her / Hers / They / Them / Theirs',
        merMers: '[zh-hans] Mer / Mers',
        neNirNirs: '[zh-hans] Ne / Nir / Nirs',
        neeNerNers: '[zh-hans] Nee / Ner / Ners',
        perPers: '[zh-hans] Per / Pers',
        theyThemTheirs: '[zh-hans] They / Them / Theirs',
        thonThons: '[zh-hans] Thon / Thons',
        veVerVis: '[zh-hans] Ve / Ver / Vis',
        viVir: '[zh-hans] Vi / Vir',
        xeXemXyr: '[zh-hans] Xe / Xem / Xyr',
        zeZieZirHir: '[zh-hans] Ze / Zie / Zir / Hir',
        zeHirHirs: '[zh-hans] Ze / Hir',
        callMeByMyName: '[zh-hans] Call me by my name',
    },
    displayNamePage: {
        headerTitle: '[zh-hans] Display name',
        isShownOnProfile: '[zh-hans] Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: '[zh-hans] Timezone',
        isShownOnProfile: '[zh-hans] Your timezone is shown on your profile.',
        getLocationAutomatically: '[zh-hans] Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: '[zh-hans] Update required',
        pleaseInstall: '[zh-hans] Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: '[zh-hans] Please install the latest version of Expensify',
        toGetLatestChanges: '[zh-hans] For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: '[zh-hans] The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: '[zh-hans] About',
        aboutPage: {
            description: '[zh-hans] The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: '[zh-hans] App download links',
            viewKeyboardShortcuts: '[zh-hans] View keyboard shortcuts',
            viewTheCode: '[zh-hans] View the code',
            viewOpenJobs: '[zh-hans] View open jobs',
            reportABug: '[zh-hans] Report a bug',
            troubleshoot: '[zh-hans] Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: '[zh-hans] Android',
            },
            ios: {
                label: '[zh-hans] iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '[zh-hans] Clear cache and restart',
            description:
                '[zh-hans] <muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: '[zh-hans] All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: '[zh-hans] Reset and refresh',
            clientSideLogging: '[zh-hans] Client side logging',
            noLogsToShare: '[zh-hans] No logs to share',
            useProfiling: '[zh-hans] Use profiling',
            profileTrace: '[zh-hans] Profile trace',
            results: '[zh-hans] Results',
            releaseOptions: '[zh-hans] Release options',
            testingPreferences: '[zh-hans] Testing preferences',
            useStagingServer: '[zh-hans] Use Staging Server',
            forceOffline: '[zh-hans] Force offline',
            simulatePoorConnection: '[zh-hans] Simulate poor internet connection',
            simulateFailingNetworkRequests: '[zh-hans] Simulate failing network requests',
            authenticationStatus: '[zh-hans] Authentication status',
            deviceCredentials: '[zh-hans] Device credentials',
            invalidate: '[zh-hans] Invalidate',
            destroy: '[zh-hans] Destroy',
            maskExportOnyxStateData: '[zh-hans] Mask fragile member data while exporting Onyx state',
            exportOnyxState: '[zh-hans] Export Onyx state',
            importOnyxState: '[zh-hans] Import Onyx state',
            testCrash: '[zh-hans] Test crash',
            resetToOriginalState: '[zh-hans] Reset to original state',
            usingImportedState: '[zh-hans] You are using imported state. Press here to clear it.',
            debugMode: '[zh-hans] Debug mode',
            invalidFile: '[zh-hans] Invalid file',
            invalidFileDescription: '[zh-hans] The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: '[zh-hans] Invalidate with delay',
            leftHandNavCache: '[zh-hans] Left Hand Nav cache',
            clearleftHandNavCache: '[zh-hans] Clear',
            softKillTheApp: '[zh-hans] Soft kill the app',
            kill: '[zh-hans] Kill',
            sentryDebug: '[zh-hans] Sentry debug',
            sentrySendDescription: '[zh-hans] Send data to Sentry',
            sentryDebugDescription: '[zh-hans] Log Sentry requests to console',
            sentryHighlightedSpanOps: '[zh-hans] Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: '[zh-hans] ui.interaction.click, navigation, ui.load',
        },
        security: '[zh-hans] Security',
        signOut: '[zh-hans] Sign out',
        restoreStashed: '[zh-hans] Restore stashed login',
        signOutConfirmationText: "[zh-hans] You'll lose any offline changes if you sign out.",
        versionLetter: '[zh-hans] v',
        readTheTermsAndPrivacy: `[zh-hans] Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.`,
        help: '[zh-hans] Help',
        helpPage: {
            title: '[zh-hans] Help and support',
            description: '[zh-hans] We are here to help you 24/7',
            helpSite: '[zh-hans] Help site',
            conciergeChat: '[zh-hans] Concierge',
            conciergeChatDescription: '[zh-hans] Your personal AI agent',
            accountManagerDescription: '[zh-hans] Your account manager',
            partnerManagerDescription: '[zh-hans] Your partner manager',
            guideDescription: '[zh-hans] Your setup specialist',
        },
        whatIsNew: "[zh-hans] What's new",
        accountSettings: '[zh-hans] Account settings',
        account: '[zh-hans] Account',
        general: '[zh-hans] General',
    },
    closeAccountPage: {
        closeAccount: '[zh-hans][ctx: close as a verb, not an adjective] Close account',
        reasonForLeavingPrompt: '[zh-hans] We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: '[zh-hans] Enter message here',
        closeAccountWarning: '[zh-hans] Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: '[zh-hans] Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: '[zh-hans] Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: '[zh-hans] Enter your default contact method',
        defaultContact: '[zh-hans] Default contact method:',
        enterYourDefaultContactMethod: '[zh-hans] Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: '[zh-hans] Merge accounts',
        accountDetails: {
            accountToMergeInto: (login: string) => `[zh-hans] Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: '[zh-hans] I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: '[zh-hans] Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: (login: string) =>
                `[zh-hans] Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `[zh-hans] To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: '[zh-hans] Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: '[zh-hans] Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: '[zh-hans] Accounts merged!',
            description: (from: string, to: string) =>
                `[zh-hans] <muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '[zh-hans] We’re working on it',
            limitedSupport: '[zh-hans] We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp:
                '[zh-hans] <muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: '[zh-hans] Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `[zh-hans] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `[zh-hans] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `[zh-hans] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: '[zh-hans] Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `[zh-hans] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `[zh-hans] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `[zh-hans] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `[zh-hans] <muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '[zh-hans] Try again later',
            description: '[zh-hans] There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "[zh-hans] You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: '[zh-hans] You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: '[zh-hans] Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '[zh-hans] Report suspicious activity',
        lockAccount: '[zh-hans] Lock account',
        unlockAccount: '[zh-hans] Unlock account',
        unlockTitle: '[zh-hans] We’ve received your request',
        unlockDescription: '[zh-hans] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        compromisedDescription:
            '[zh-hans] Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: '[zh-hans] For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: '[zh-hans] Are you sure you want to lock your Expensify account?',
        onceLocked: '[zh-hans] Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '[zh-hans] Failed to lock account',
        failedToLockAccountDescription: `[zh-hans] We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: '[zh-hans] Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: '[zh-hans] Account locked',
        yourAccountIsLocked: '[zh-hans] Your account is locked',
        chatToConciergeToUnlock: '[zh-hans] Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: '[zh-hans] Chat with Concierge',
    },
    twoFactorAuth: {
        headerTitle: '[zh-hans] Two-factor authentication',
        twoFactorAuthEnabled: '[zh-hans] Two-factor authentication enabled',
        whatIsTwoFactorAuth:
            '[zh-hans] Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: '[zh-hans] Disable two-factor authentication',
        explainProcessToRemove: '[zh-hans] To disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: '[zh-hans] To disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: '[zh-hans] Two-factor authentication is now disabled',
        noAuthenticatorApp: '[zh-hans] You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: '[zh-hans] Recovery codes',
        keepCodesSafe: '[zh-hans] Keep these recovery codes safe!',
        codesLoseAccess: dedent(`
            [zh-hans] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            Note: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        errorStepCodes: '[zh-hans] Please copy or download codes before continuing',
        stepVerify: '[zh-hans] Verify',
        scanCode: '[zh-hans] Scan the QR code using your',
        authenticatorApp: '[zh-hans] authenticator app',
        addKey: '[zh-hans] Or add this secret key to your authenticator app:',
        secretKey: '[zh-hans] secret key',
        enterCode: '[zh-hans] Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: '[zh-hans] Finished',
        enabled: '[zh-hans] Two-factor authentication enabled',
        congrats: '[zh-hans] Congrats! Now you’ve got that extra security.',
        copy: '[zh-hans] Copy',
        disable: '[zh-hans] Disable',
        enableTwoFactorAuth: '[zh-hans] Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: '[zh-hans] Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: '[zh-hans] For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: '[zh-hans] Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: '[zh-hans] Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: '[zh-hans] Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: '[zh-hans] Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: '[zh-hans] Cannot disable 2FA',
        twoFactorAuthRequired: '[zh-hans] Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
        replaceDevice: '[zh-hans] Replace device',
        replaceDeviceTitle: '[zh-hans] Replace two-factor device',
        verifyOldDeviceTitle: '[zh-hans] Verify old device',
        verifyOldDeviceDescription: '[zh-hans] Enter the six-digit code from your current authenticator app to confirm you have access to it.',
        verifyNewDeviceTitle: '[zh-hans] Set up new device',
        verifyNewDeviceDescription: '[zh-hans] Scan the QR code with your new device, then enter the code to complete setup.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '[zh-hans] Please enter your recovery code',
            incorrectRecoveryCode: '[zh-hans] Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: '[zh-hans] Use recovery code',
        recoveryCode: '[zh-hans] Recovery code',
        use2fa: '[zh-hans] Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '[zh-hans] Please enter your two-factor authentication code',
            incorrect2fa: '[zh-hans] Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '[zh-hans] Password updated!',
        allSet: '[zh-hans] You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: '[zh-hans] Private notes',
        personalNoteMessage: "[zh-hans] Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: '[zh-hans] Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: '[zh-hans] Notes',
        myNote: '[zh-hans] My note',
        error: {
            genericFailureMessage: "[zh-hans] Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: '[zh-hans] Please enter a valid security code',
        },
        securityCode: '[zh-hans] Security code',
        changeBillingCurrency: '[zh-hans] Change billing currency',
        changePaymentCurrency: '[zh-hans] Change payment currency',
        paymentCurrency: '[zh-hans] Payment currency',
        paymentCurrencyDescription: '[zh-hans] Select a standardized currency that all personal expenses should be converted to',
        note: `[zh-hans] Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: '[zh-hans] Add a debit card',
        nameOnCard: '[zh-hans] Name on card',
        debitCardNumber: '[zh-hans] Debit card number',
        expiration: '[zh-hans] Expiration date',
        expirationDate: '[zh-hans] MMYY',
        cvv: '[zh-hans] CVV',
        billingAddress: '[zh-hans] Billing address',
        growlMessageOnSave: '[zh-hans] Your debit card was successfully added',
        expensifyPassword: '[zh-hans] Expensify password',
        error: {
            invalidName: '[zh-hans] Name can only include letters',
            addressZipCode: '[zh-hans] Please enter a valid zip code',
            debitCardNumber: '[zh-hans] Please enter a valid debit card number',
            expirationDate: '[zh-hans] Please select a valid expiration date',
            securityCode: '[zh-hans] Please enter a valid security code',
            addressStreet: "[zh-hans] Please enter a valid billing address that's not a PO box",
            addressState: '[zh-hans] Please select a state',
            addressCity: '[zh-hans] Please enter a city',
            genericFailureMessage: '[zh-hans] An error occurred while adding your card. Please try again.',
            password: '[zh-hans] Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '[zh-hans] Add payment card',
        nameOnCard: '[zh-hans] Name on card',
        paymentCardNumber: '[zh-hans] Card number',
        expiration: '[zh-hans] Expiration date',
        expirationDate: '[zh-hans] MM/YY',
        cvv: '[zh-hans] CVV',
        billingAddress: '[zh-hans] Billing address',
        growlMessageOnSave: '[zh-hans] Your payment card was successfully added',
        expensifyPassword: '[zh-hans] Expensify password',
        error: {
            invalidName: '[zh-hans] Name can only include letters',
            addressZipCode: '[zh-hans] Please enter a valid zip code',
            paymentCardNumber: '[zh-hans] Please enter a valid card number',
            expirationDate: '[zh-hans] Please select a valid expiration date',
            securityCode: '[zh-hans] Please enter a valid security code',
            addressStreet: "[zh-hans] Please enter a valid billing address that's not a PO box",
            addressState: '[zh-hans] Please select a state',
            addressCity: '[zh-hans] Please enter a city',
            genericFailureMessage: '[zh-hans] An error occurred while adding your card. Please try again.',
            password: '[zh-hans] Please enter your Expensify password',
        },
    },
    personalCard: {
        addPersonalCard: '[zh-hans] Add personal card',
        addCompanyCard: '[zh-hans] Add company card',
        lookingForCompanyCards: '[zh-hans] Need to add company cards?',
        lookingForCompanyCardsDescription: '[zh-hans] Bring your own cards from 10,000+ banks worldwide.',
        personalCardAdded: '[zh-hans] Personal card added!',
        personalCardAddedDescription: '[zh-hans] Congrats, we’ll begin importing transactions from your card.',
        isPersonalCard: '[zh-hans] Is this a personal card?',
        thisIsPersonalCard: '[zh-hans] This is a personal card',
        thisIsCompanyCard: '[zh-hans] This is a company card',
        askAdmin: '[zh-hans] Ask your admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `[zh-hans] If so, great! But if it's a <strong>company</strong> card, please ${isAdmin ? '[zh-hans] assign it from your workspace instead.' : '[zh-hans] ask your admin to assign it to you from the workspace instead.'}`,
        bankConnectionError: '[zh-hans] Bank connection issue',
        bankConnectionDescription: '[zh-hans] Please try adding your cards again. Otherwise, you can',
        connectWithPlaid: '[zh-hans] connect via Plaid.',
        brokenConnection: '[zh-hans] Your card connection is broken.',
        fixCard: '[zh-hans] Fix card',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `[zh-hans] Your ${cardName} card connection is broken. <a href="${connectionLink}">Log into your bank</a> to fix the card.`
                : `[zh-hans] Your ${cardName} card connection is broken. Log into your bank to fix the card.`,
        addAdditionalCards: '[zh-hans] Add additional cards',
        upgradeDescription: '[zh-hans] Need to add more cards? Create a workspace to add additional personal cards or assign company cards to the entire team.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `[zh-hans] <muted-text>This is available on the Collect plan, which is <strong>${formattedPrice}</strong> per member per month.</muted-text>`,
        note: (subscriptionLink: string) =>
            `[zh-hans] <muted-text>Create a workspace to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
        workspaceCreated: '[zh-hans] Workspace created',
        newWorkspace: '[zh-hans] You created a workspace!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `[zh-hans] <centered-text>You’re all set to add additional cards. <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
    },
    walletPage: {
        balance: '[zh-hans] Balance',
        paymentMethodsTitle: '[zh-hans] Payment methods',
        setDefaultConfirmation: '[zh-hans] Make default payment method',
        setDefaultSuccess: '[zh-hans] Default payment method set!',
        deleteAccount: '[zh-hans] Delete account',
        deleteConfirmation: '[zh-hans] Are you sure you want to delete this account?',
        deleteCard: '[zh-hans] Delete card',
        deleteCardConfirmation:
            '[zh-hans] All unsubmitted card transactions, including those on open reports, will be removed. Are you sure you want to delete this card? You cannot undo this action.',
        error: {
            notOwnerOfBankAccount: '[zh-hans] An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: '[zh-hans] This bank account is temporarily suspended',
            notOwnerOfFund: '[zh-hans] An error occurred while setting this card as your default payment method',
            setDefaultFailure: '[zh-hans] Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: '[zh-hans] An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: '[zh-hans] Get paid faster',
        addPaymentMethod: '[zh-hans] Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: '[zh-hans] Get paid back faster',
        secureAccessToYourMoney: '[zh-hans] Secure access to your money',
        receiveMoney: '[zh-hans] Receive money in your local currency',
        expensifyWallet: '[zh-hans] Expensify Wallet (Beta)',
        sendAndReceiveMoney: '[zh-hans] Send and receive money with friends. US bank accounts only.',
        enableWallet: '[zh-hans] Enable wallet',
        addBankAccountToSendAndReceive: '[zh-hans] Add a bank account to make or receive payments.',
        addDebitOrCreditCard: '[zh-hans] Add debit or credit card',
        cardInactive: '[zh-hans] Inactive',
        assignedCards: '[zh-hans] Assigned cards',
        assignedCardsDescription: '[zh-hans] Transactions from these cards sync automatically.',
        expensifyCard: '[zh-hans] Expensify Card',
        walletActivationPending: "[zh-hans] We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "[zh-hans] Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: '[zh-hans] Add your bank account',
        addBankAccountBody: "[zh-hans] Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: '[zh-hans] Choose your bank account',
        chooseAccountBody: '[zh-hans] Make sure that you select the right one.',
        confirmYourBankAccount: '[zh-hans] Confirm your bank account',
        personalBankAccounts: '[zh-hans] Personal bank accounts',
        businessBankAccounts: '[zh-hans] Business bank accounts',
        shareBankAccount: '[zh-hans] Share bank account',
        bankAccountShared: '[zh-hans] Bank account shared',
        shareBankAccountTitle: '[zh-hans] Select the admins to share this bank account with:',
        shareBankAccountSuccess: '[zh-hans] Bank account shared!',
        shareBankAccountSuccessDescription: '[zh-hans] The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: '[zh-hans] An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: '[zh-hans] No admins available',
        shareBankAccountEmptyDescription: '[zh-hans] There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: '[zh-hans] Please select an admin before continuing',
        unshareBankAccount: '[zh-hans] Unshare bank account',
        unshareBankAccountDescription: '[zh-hans] Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `[zh-hans] ${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: '[zh-hans] It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: `[zh-hans] Can't unshare bank account`,
        travelCVV: {
            title: '[zh-hans] Travel CVV',
            subtitle: '[zh-hans] Use this when booking travel',
            description: "[zh-hans] Use this card for your Expensify Travel bookings. It'll show as “Travel Card” at checkout.",
        },
        chaseAccountNumberDifferent: '[zh-hans] Why is my account number different?',
    },
    cardPage: {
        expensifyCard: '[zh-hans] Expensify Card',
        expensifyTravelCard: '[zh-hans] Expensify Travel Card',
        availableSpend: '[zh-hans] Remaining limit',
        smartLimit: {
            name: '[zh-hans] Smart limit',
            title: (formattedLimit: string) => `[zh-hans] You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: '[zh-hans] Fixed limit',
            title: (formattedLimit: string) => `[zh-hans] You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: '[zh-hans] Monthly limit',
            title: (formattedLimit: string) => `[zh-hans] You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: '[zh-hans] Virtual card number',
        travelCardCvv: '[zh-hans] Travel card CVV',
        physicalCardNumber: '[zh-hans] Physical card number',
        physicalCardPin: '[zh-hans] PIN',
        getPhysicalCard: '[zh-hans] Get physical card',
        reportFraud: '[zh-hans] Report virtual card fraud',
        reportTravelFraud: '[zh-hans] Report travel card fraud',
        reviewTransaction: '[zh-hans] Review transaction',
        suspiciousBannerTitle: '[zh-hans] Suspicious transaction',
        suspiciousBannerDescription: '[zh-hans] We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "[zh-hans] Your card is temporarily locked while our team reviews your company's account.",
        markTransactionsAsReimbursable: '[zh-hans] Mark transactions as reimbursable',
        markTransactionsDescription: '[zh-hans] When enabled, transactions imported from this card are marked as reimbursable by default.',
        csvCardDescription: '[zh-hans] CSV Import',
        cardDetails: {
            cardNumber: '[zh-hans] Virtual card number',
            expiration: '[zh-hans] Expiration',
            cvv: '[zh-hans] CVV',
            address: '[zh-hans] Address',
            revealDetails: '[zh-hans] Reveal details',
            revealCvv: '[zh-hans] Reveal CVV',
            copyCardNumber: '[zh-hans] Copy card number',
            updateAddress: '[zh-hans] Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `[zh-hans] Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: '[zh-hans] An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "[zh-hans] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[zh-hans] Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        unexpectedError: '[zh-hans] There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: '[zh-hans] Yes, I do',
            reportFraudButtonText: "[zh-hans] No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `[zh-hans] cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `[zh-hans] deactivated the card ending in ${cardLastFour}`,
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
            }) => `[zh-hans] identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?

${amount} for ${merchant} - ${date}`,
        },
        setYourPin: '[zh-hans] Set the PIN for your card.',
        confirmYourPin: '[zh-hans] Enter your PIN again to confirm.',
        changeYourPin: '[zh-hans] Enter a new PIN for your card.',
        confirmYourChangedPin: '[zh-hans] Confirm your new PIN.',
        pinMustBeFourDigits: '[zh-hans] PIN must be exactly 4 digits.',
        invalidPin: '[zh-hans] Please choose a more secure PIN.',
        pinMismatch: '[zh-hans] PINs do not match. Please try again.',
        revealPin: '[zh-hans] Reveal PIN',
        hidePin: '[zh-hans] Hide PIN',
        pin: '[zh-hans] PIN',
        pinChanged: '[zh-hans] PIN changed!',
        pinChangedHeader: '[zh-hans] PIN changed',
        pinChangedDescription: "[zh-hans] You're all set to use your PIN now.",
        changePin: '[zh-hans] Change PIN',
        changePinAtATM: '[zh-hans] Change your PIN at any ATM',
        changePinAtATMDescription: '[zh-hans] This is required in your region. <concierge-link>Reach out to Concierge</concierge-link> if you have any questions.',
        freezeCard: '[zh-hans] Freeze card',
        unfreeze: '[zh-hans] Unfreeze',
        unfreezeCard: '[zh-hans] Unfreeze card',
        askToUnfreeze: '[zh-hans] Ask to unfreeze',
        freezeDescription: '[zh-hans] A frozen card cannot be used for purchases and transactions. You can unfreeze it at any time.',
        unfreezeDescription: "[zh-hans] Unfreezing this card will start allowing purchases and transactions again. Only proceed if you're sure the card is safe to use.",
        frozen: '[zh-hans] Frozen',
        youFroze: ({date}: {date: string}) => `[zh-hans] You froze this card on ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `[zh-hans] ${person} froze this card on ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `[zh-hans] This card was frozen on ${date} by `,
        frozenByAdminNeedsUnfreezePrefix: '[zh-hans] This card was frozen by ',
        frozenByAdminNeedsUnfreezeSuffix: '[zh-hans] . Please contact an admin to unfreeze it.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `[zh-hans] This card was frozen by ${person}. Please contact an admin to unfreeze it.`,
    },
    workflowsPage: {
        workflowTitle: '[zh-hans] Spend',
        workflowDescription: '[zh-hans] Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: '[zh-hans] Submissions',
        submissionFrequencyDescription: '[zh-hans] Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: '[zh-hans] Date of month',
        disableApprovalPromptDescription: '[zh-hans] Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: '[zh-hans] Approvals',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `[zh-hans] expenses from ${members}, and the approver is ${approvers}`,
        addApprovalButton: '[zh-hans] Add approval workflow',
        findWorkflow: '[zh-hans] Find workflow',
        addApprovalTip: '[zh-hans] This default workflow applies to all members, unless a more specific workflow exists.',
        approver: '[zh-hans] Approver',
        addApprovalsDescription: '[zh-hans] Require additional approval before authorizing a payment.',
        makeOrTrackPaymentsTitle: '[zh-hans] Payments',
        makeOrTrackPaymentsDescription: '[zh-hans] Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '[zh-hans] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '[zh-hans] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: '[zh-hans] Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: '[zh-hans] Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: '[zh-hans] Instantly',
            weekly: '[zh-hans] Weekly',
            monthly: '[zh-hans] Monthly',
            twiceAMonth: '[zh-hans] Twice a month',
            byTrip: '[zh-hans] By trip',
            manually: '[zh-hans] Manually',
            daily: '[zh-hans] Daily',
            lastDayOfMonth: '[zh-hans] Last day of the month',
            lastBusinessDayOfMonth: '[zh-hans] Last business day of the month',
            ordinals: {
                one: '[zh-hans] st',
                two: '[zh-hans] nd',
                few: '[zh-hans] rd',
                other: '[zh-hans] th',
                '1': '[zh-hans] First',
                '2': '[zh-hans] Second',
                '3': '[zh-hans] Third',
                '4': '[zh-hans] Fourth',
                '5': '[zh-hans] Fifth',
                '6': '[zh-hans] Sixth',
                '7': '[zh-hans] Seventh',
                '8': '[zh-hans] Eighth',
                '9': '[zh-hans] Ninth',
                '10': '[zh-hans] Tenth',
            },
        },
        approverInMultipleWorkflows: '[zh-hans] This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `[zh-hans] <strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: '[zh-hans] No members to display',
            expensesFromSubtitle: '[zh-hans] All workspace members already belong to an existing approval workflow.',
            approverSubtitle: '[zh-hans] All approvers belong to an existing workflow.',
            bulkApproverSubtitle: '[zh-hans] No approvers match the criteria for selected reports.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "[zh-hans] Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "[zh-hans] Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: '[zh-hans] Confirm',
        header: '[zh-hans] Add more approvers and confirm.',
        additionalApprover: '[zh-hans] Additional approver',
        submitButton: '[zh-hans] Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: '[zh-hans] Edit approval workflow',
        deleteTitle: '[zh-hans] Delete approval workflow',
        deletePrompt: '[zh-hans] Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: '[zh-hans] Expenses from',
        header: '[zh-hans] When the following members submit expenses:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "[zh-hans] The approver couldn't be changed. Please try again or contact support.",
        title: '[zh-hans] Set approver',
        description: '[zh-hans] This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: '[zh-hans] Approver',
        header: '[zh-hans] (Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `[zh-hans] Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : '[zh-hans] Add another approver when a report exceeds the amount below:',
        reportAmountLabel: '[zh-hans] Report amount',
        additionalApproverLabel: '[zh-hans] Additional approver',
        skip: '[zh-hans] Skip',
        next: '[zh-hans] Next',
        removeLimit: '[zh-hans] Remove limit',
        enterAmountError: '[zh-hans] Please enter a valid amount',
        enterApproverError: '[zh-hans] Approver is required when you set a report limit',
        enterBothError: '[zh-hans] Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `[zh-hans] Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: '[zh-hans] Authorized payer',
        genericErrorMessage: '[zh-hans] The authorized payer could not be changed. Please try again.',
        admins: '[zh-hans] Admins',
        payer: '[zh-hans] Payer',
        paymentAccount: '[zh-hans] Payment account',
        shareBankAccount: {
            shareTitle: '[zh-hans] Share bank account access?',
            shareDescription: ({admin}: {admin: string}) => `[zh-hans] You'll need to share bank account access with ${admin} to make them the payer.`,
            validationTitle: '[zh-hans] Bank account awaiting validation',
            validationDescription: ({admin}: {admin: string}) =>
                `[zh-hans] You need to <a href="#">validate this bank account</a>. Once that's done, you can share bank account access with ${admin} to make them the payer.`,
            errorTitle: "[zh-hans] Can't change payer",
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `[zh-hans] ${admin} doesn't have access to this bank account, so you can't make them the payer. <a href="#">Chat with ${owner}</a> if the bank account should be shared.`,
        },
    },
    reportFraudPage: {
        title: '[zh-hans] Report virtual card fraud',
        description:
            '[zh-hans] If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: '[zh-hans] Deactivate card',
        reportVirtualCardFraud: '[zh-hans] Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: '[zh-hans] Card fraud reported',
        description: '[zh-hans] We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        buttonText: '[zh-hans] Got it, thanks!',
    },
    activateCardPage: {
        activateCard: '[zh-hans] Activate card',
        pleaseEnterLastFour: '[zh-hans] Please enter the last four digits of your card.',
        activatePhysicalCard: '[zh-hans] Activate physical card',
        error: {
            thatDidNotMatch: "[zh-hans] That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "[zh-hans] You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: '[zh-hans] Get physical card',
        nameMessage: '[zh-hans] Enter your first and last name, as this will be shown on your card.',
        legalName: '[zh-hans] Legal name',
        legalFirstName: '[zh-hans] Legal first name',
        legalLastName: '[zh-hans] Legal last name',
        phoneMessage: '[zh-hans] Enter your phone number.',
        phoneNumber: '[zh-hans] Phone number',
        address: '[zh-hans] Address',
        addressMessage: '[zh-hans] Enter your shipping address.',
        streetAddress: '[zh-hans] Street Address',
        city: '[zh-hans] City',
        state: '[zh-hans] State',
        zipPostcode: '[zh-hans] Zip/Postcode',
        country: '[zh-hans] Country',
        confirmMessage: '[zh-hans] Please confirm your details below.',
        estimatedDeliveryMessage: '[zh-hans] Your physical card will arrive in 2-3 business days.',
        next: '[zh-hans] Next',
        getPhysicalCard: '[zh-hans] Get physical card',
        shipCard: '[zh-hans] Ship card',
    },
    transferAmountPage: {
        transfer: (amount: string) => `[zh-hans] Transfer${amount ? ` ${amount}` : ''}`,
        instant: '[zh-hans] Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `[zh-hans] ${rate}% fee (${minAmount} minimum)`,
        ach: '[zh-hans] 1-3 Business days (Bank account)',
        achSummary: '[zh-hans] No fee',
        whichAccount: '[zh-hans] Which account?',
        fee: '[zh-hans] Fee',
        transferSuccess: '[zh-hans] Transfer successful!',
        transferDetailBankAccount: '[zh-hans] Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: '[zh-hans] Your money should arrive immediately.',
        failedTransfer: '[zh-hans] Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: '[zh-hans] Please transfer your balance from the wallet page',
        goToWallet: '[zh-hans] Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: '[zh-hans] Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: '[zh-hans] Add payment method',
        addNewDebitCard: '[zh-hans] Add new debit card',
        addNewBankAccount: '[zh-hans] Add new bank account',
        accountLastFour: '[zh-hans] Ending in',
        cardLastFour: '[zh-hans] Card ending in',
        addFirstPaymentMethod: '[zh-hans] Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: '[zh-hans] Default',
        bankAccountLastFour: (lastFour: string) => `[zh-hans] Bank Account • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '[zh-hans] Expense rules',
        subtitle: '[zh-hans] These rules will apply to your expenses.',
        findRule: '[zh-hans] Find rule',
        emptyRules: {
            title: "[zh-hans] You haven't created any rules",
            subtitle: '[zh-hans] Add a rule to automate expense reporting.',
        },
        changes: {
            billableUpdate: (value: boolean) => `[zh-hans] Update expense ${value ? '[zh-hans] billable' : '[zh-hans] non-billable'}`,
            categoryUpdate: (value: string) => `[zh-hans] Update category to "${value}"`,
            commentUpdate: (value: string) => `[zh-hans] Update description to "${value}"`,
            merchantUpdate: (value: string) => `[zh-hans] Update merchant to "${value}"`,
            reimbursableUpdate: (value: boolean) => `[zh-hans] Update expense ${value ? '[zh-hans] reimbursable' : '[zh-hans] non-reimbursable'}`,
            tagUpdate: (value: string) => `[zh-hans] Update tag to "${value}"`,
            taxUpdate: (value: string) => `[zh-hans] Update tax rate to "${value}"`,
            billable: (value: boolean) => `[zh-hans] expense ${value ? '[zh-hans] billable' : '[zh-hans] non-billable'}`,
            category: (value: string) => `[zh-hans] category to "${value}"`,
            comment: (value: string) => `[zh-hans] description to "${value}"`,
            merchant: (value: string) => `[zh-hans] merchant to "${value}"`,
            reimbursable: (value: boolean) => `[zh-hans] expense ${value ? '[zh-hans] reimbursable' : '[zh-hans] non-reimbursable'}`,
            tag: (value: string) => `[zh-hans] tag to "${value}"`,
            tax: (value: string) => `[zh-hans] tax rate to "${value}"`,
            report: (value: string) => `[zh-hans] add to a report named "${value}"`,
        },
        newRule: '[zh-hans] New rule',
        addRule: {
            title: '[zh-hans] Add rule',
            expenseContains: '[zh-hans] If expense contains:',
            applyUpdates: '[zh-hans] Then apply these updates:',
            merchantHint: '[zh-hans] Type . to create a rule that applies to all merchants',
            addToReport: '[zh-hans] Add to a report named',
            createReport: '[zh-hans] Create report if necessary',
            applyToExistingExpenses: '[zh-hans] Apply to existing matching expenses',
            confirmError: '[zh-hans] Enter merchant and apply at least one update',
            confirmErrorMerchant: '[zh-hans] Please enter merchant',
            confirmErrorUpdate: '[zh-hans] Please apply at least one update',
            saveRule: '[zh-hans] Save rule',
        },
        editRule: {
            title: '[zh-hans] Edit rule',
        },
        deleteRule: {
            deleteSingle: '[zh-hans] Delete rule',
            deleteMultiple: '[zh-hans] Delete rules',
            deleteSinglePrompt: '[zh-hans] Are you sure you want to delete this rule?',
            deleteMultiplePrompt: '[zh-hans] Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: '[zh-hans] App preferences',
        },
        testSection: {
            title: '[zh-hans] Test preferences',
            subtitle: '[zh-hans] Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '[zh-hans] Receive relevant feature updates and Expensify news',
        muteAllSounds: '[zh-hans] Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: '[zh-hans] Priority mode',
        explainerText: '[zh-hans] Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: '[zh-hans] Most recent',
                description: '[zh-hans] Show all chats sorted by most recent',
            },
            gsd: {
                label: '[zh-hans] #focus',
                description: '[zh-hans] Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `[zh-hans] in ${policyName}`,
        generatingPDF: '[zh-hans] Generate PDF',
        waitForPDF: '[zh-hans] Please wait while we generate the PDF.',
        errorPDF: '[zh-hans] There was an error when trying to generate your PDF',
        successPDF: "[zh-hans] Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: '[zh-hans] Room description',
        roomDescriptionOptional: '[zh-hans] Room description (optional)',
        explainerText: '[zh-hans] Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: '[zh-hans] Heads up!',
        lastMemberWarning: "[zh-hans] Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: (displayName: string) => `[zh-hans] ${displayName}'s group chat`,
    },
    languagePage: {
        language: '[zh-hans] Language',
        aiGenerated: '[zh-hans] The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: '[zh-hans] Theme',
        themes: {
            dark: {
                label: '[zh-hans] Dark',
            },
            light: {
                label: '[zh-hans] Light',
            },
            system: {
                label: '[zh-hans] Use device settings',
            },
        },
        highContrastMode: '[zh-hans] High contrast mode',
        chooseThemeBelowOrSync: '[zh-hans] Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `[zh-hans] <muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `[zh-hans] Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "[zh-hans] Didn't receive a magic code?",
        enterAuthenticatorCode: '[zh-hans] Please enter your authenticator code',
        enterRecoveryCode: '[zh-hans] Please enter your recovery code',
        requiredWhen2FAEnabled: '[zh-hans] Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `[zh-hans] Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '[zh-hans] Request a new code',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) =>
            `[zh-hans] Time remaining: ${timeRemaining} ${timeRemaining === 1 ? '[zh-hans] second' : '[zh-hans] seconds'}`,
        timeExpiredAnnouncement: '[zh-hans] The time has expired',
        error: {
            pleaseFillMagicCode: '[zh-hans] Please enter your magic code',
            incorrectMagicCode: '[zh-hans] Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: '[zh-hans] Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '[zh-hans] Please fill out all fields',
        pleaseFillPassword: '[zh-hans] Please enter your password',
        pleaseFillTwoFactorAuth: '[zh-hans] Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: '[zh-hans] Enter your two-factor authentication code to continue',
        forgot: '[zh-hans] Forgot?',
        requiredWhen2FAEnabled: '[zh-hans] Required when 2FA is enabled',
        error: {
            incorrectPassword: '[zh-hans] Incorrect password. Please try again.',
            incorrectLoginOrPassword: '[zh-hans] Incorrect login or password. Please try again.',
            incorrect2fa: '[zh-hans] Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: '[zh-hans] You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: '[zh-hans] Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                '[zh-hans] We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: '[zh-hans] You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: '[zh-hans] Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: '[zh-hans] Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: '[zh-hans] Phone or email',
        error: {
            invalidFormatEmailLogin: '[zh-hans] The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "[zh-hans] Couldn't retrieve account details. Please try to sign in again.",
        loginForm: '[zh-hans] Login form',
        notYou: (user: string) => `[zh-hans] Not ${user}?`,
    },
    onboarding: {
        welcome: '[zh-hans] Welcome!',
        welcomeSignOffTitleManageTeam: '[zh-hans] Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "[zh-hans] It's great to meet you!",
        explanationModal: {
            title: '[zh-hans] Welcome to Expensify',
            description: '[zh-hans] One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: '[zh-hans] To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: '[zh-hans] Get started',
        whatsYourName: "[zh-hans] What's your name?",
        peopleYouMayKnow: '[zh-hans] People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: (domain: string, email: string) => `[zh-hans] Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '[zh-hans] Join a workspace',
        listOfWorkspaces: "[zh-hans] Here's the list of workspaces you can join. Don't worry, you can always join them later if you prefer.",
        skipForNow: '[zh-hans] Skip for now',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `[zh-hans] ${employeeCount} member${employeeCount > 1 ? '[zh-hans] s' : ''} • ${policyOwner}`,
        whereYouWork: '[zh-hans] Where do you work?',
        errorSelection: '[zh-hans] Select an option to move forward',
        purpose: {
            title: '[zh-hans] What do you want to do today?',
            errorContinue: '[zh-hans] Please press continue to get set up',
            errorBackButton: '[zh-hans] Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '[zh-hans] Get paid back by my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "[zh-hans] Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '[zh-hans] Track and budget expenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '[zh-hans] Chat and split expenses with friends',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '[zh-hans] Something else',
        },
        employees: {
            title: '[zh-hans] How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL]: '[zh-hans] 1-4 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM]: '[zh-hans] 5-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '[zh-hans] 1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '[zh-hans] 11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '[zh-hans] 51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '[zh-hans] 101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '[zh-hans] More than 1,000 employees',
        },
        accounting: {
            title: '[zh-hans] Do you use any accounting software?',
            none: '[zh-hans] None',
        },
        interestedFeatures: {
            title: '[zh-hans] What features are you interested in?',
            featuresAlreadyEnabled: '[zh-hans] Here are our most popular features:',
            featureYouMayBeInterestedIn: '[zh-hans] Enable additional features:',
        },
        error: {
            requiredFirstName: '[zh-hans] Please input your first name to continue',
        },
        workEmail: {
            title: '[zh-hans] What’s your work email?',
            subtitle: '[zh-hans] Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: '[zh-hans] Forward to receipts@expensify.com for scanning',
                descriptionTwo: '[zh-hans] Join your colleagues already using Expensify',
                descriptionThree: '[zh-hans] Enjoy a more customized experience',
            },
            addWorkEmail: '[zh-hans] Add work email',
        },
        workEmailValidation: {
            title: '[zh-hans] Verify your work email',
            magicCodeSent: (workEmail: string | undefined) => `[zh-hans] Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: '[zh-hans] Please enter a valid work email from a private domain e.g. mitch@company.com',
            sameAsSignupEmail: '[zh-hans] Please enter a different email than the one you signed up with',
            offline: '[zh-hans] We couldn’t add your work email as you appear to be offline',
        },
        mergeBlockScreen: {
            title: '[zh-hans] Couldn’t add work email',
            subtitle: (workEmail: string | undefined) => `[zh-hans] We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[zh-hans] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[zh-hans] [Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[zh-hans] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[zh-hans] Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: '[zh-hans] Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [zh-hans] *Add expense approvals* to review your team's spend and keep it under control.

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
                title: ({workspaceConfirmationLink}) => `[zh-hans] [Create](${workspaceConfirmationLink}) a workspace`,
                description: '[zh-hans] Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[zh-hans] Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [zh-hans] *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[zh-hans] Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        [zh-hans] *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '[zh-hans] Submit an expense',
                description: dedent(`
                    [zh-hans] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: '[zh-hans] Submit an expense',
                description: dedent(`
                    [zh-hans] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: '[zh-hans] Track an expense',
                description: dedent(`
                    [zh-hans] *Track an expense* in any currency, whether you have a receipt or not.

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
                    `[zh-hans] Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '[zh-hans]  to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[zh-hans] your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        [zh-hans] Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[zh-hans] your' : '[zh-hans] to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        [Take me to accounting](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[zh-hans] Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        [zh-hans] Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[zh-hans] Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [zh-hans] *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[zh-hans] Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        [zh-hans] *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[zh-hans] Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [zh-hans] Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

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
                title: ({workspaceMembersLink}) => `[zh-hans] Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [zh-hans] *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: '[zh-hans] Start a chat',
                description: dedent(`
                    [zh-hans] *Start a chat* with anyone using their email or phone number.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },
            splitExpenseTask: {
                title: '[zh-hans] Split an expense',
                description: dedent(`
                    [zh-hans] *Split expenses* with one or more people.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[zh-hans] Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [zh-hans] Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: '[zh-hans] Create your first report',
                description: dedent(`
                    [zh-hans] Here's how to create a report:

                    1. Click the *+* button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[zh-hans] Take a [test drive](${testDriveURL})` : '[zh-hans] Take a test drive'),
            embeddedDemoIframeTitle: '[zh-hans] Test Drive',
            employeeFakeReceipt: {
                description: '[zh-hans] My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '[zh-hans] Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: '[zh-hans] Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        [zh-hans] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        [zh-hans] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage: '[zh-hans] To make the most of your 30-day free trial, follow the remaining steps below:',
            onboardingChatSplitMessage: '[zh-hans] Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "[zh-hans] Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingTestDriveReceiverMessage: "[zh-hans] *You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: '[zh-hans] Stay organized with a workspace',
            subtitle: '[zh-hans] Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: '[zh-hans] Track and organize receipts',
                descriptionTwo: '[zh-hans] Categorize and tag expenses',
                descriptionThree: '[zh-hans] Create and share reports',
            },
            price: (price?: string) => `[zh-hans] Try it free for 30 days, then upgrade for just <strong>${price ?? '$5'}/user/month</strong>.`,
            createWorkspace: '[zh-hans] Create workspace',
        },
        confirmWorkspace: {
            title: '[zh-hans] Confirm workspace',
            subtitle: '[zh-hans] Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: '[zh-hans] Invite members',
            subtitle: '[zh-hans] Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "[zh-hans] Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '[zh-hans] Name cannot contain special characters',
            containsReservedWord: '[zh-hans] Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: '[zh-hans] Name cannot contain a comma or semicolon',
            requiredFirstName: '[zh-hans] First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "[zh-hans] What's your legal name?",
        enterDateOfBirth: "[zh-hans] What's your date of birth?",
        enterAddress: "[zh-hans] What's your address?",
        enterPhoneNumber: "[zh-hans] What's your phone number?",
        personalDetails: '[zh-hans] Personal details',
        privateDataMessage: '[zh-hans] These details are used for travel and payments. They are never shown on your public profile.',
        legalName: '[zh-hans] Legal name',
        legalFirstName: '[zh-hans] Legal first name',
        legalLastName: '[zh-hans] Legal last name',
        address: '[zh-hans] Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `[zh-hans] Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `[zh-hans] Date should be after ${dateString}`,
            hasInvalidCharacter: '[zh-hans] Name can only include Latin characters',
            cannotIncludeCommaOrSemicolon: '[zh-hans] Name cannot contain a comma or semicolon',
            incorrectZipFormat: (zipFormat?: string) => `[zh-hans] Incorrect zip code format${zipFormat ? `[zh-hans]  Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `[zh-hans] Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '[zh-hans] Link has been re-sent',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `[zh-hans] I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: '[zh-hans] Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) =>
            `[zh-hans] To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `[zh-hans] If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '[zh-hans] Unlink',
        linkSent: '[zh-hans] Link sent!',
        successfullyUnlinkedLogin: '[zh-hans] Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) =>
            `[zh-hans] Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `[zh-hans] <strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `[zh-hans] <strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `[zh-hans] Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: '[zh-hans] Something went wrong...',
        subtitle: `[zh-hans] We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: '[zh-hans] Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) =>
            `[zh-hans] We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: '[zh-hans] Your number has been validated! Click below to send a new magic sign-in code.',
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
                return '[zh-hans] Please wait a moment before trying again.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '[zh-hans] day' : '[zh-hans] days'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '[zh-hans] hour' : '[zh-hans] hours'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '[zh-hans] minute' : '[zh-hans] minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `[zh-hans] Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: '[zh-hans] Join',
    },
    detailsPage: {
        localTime: '[zh-hans] Local time',
    },
    newChatPage: {
        startGroup: '[zh-hans] Start group',
        addToGroup: '[zh-hans] Add to group',
        addUserToGroup: (username: string) => `[zh-hans] Add ${username} to group`,
    },
    yearPickerPage: {
        year: '[zh-hans] Year',
        selectYear: '[zh-hans] Please select a year',
    },
    monthPickerPage: {
        month: '[zh-hans] Month',
        selectMonth: '[zh-hans] Please select a month',
    },
    focusModeUpdateModal: {
        title: '[zh-hans] Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `[zh-hans] Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '[zh-hans] The chat you are looking for cannot be found.',
        getMeOutOfHere: '[zh-hans] Get me out of here',
        iouReportNotFound: '[zh-hans] The payment details you are looking for cannot be found.',
        notHere: "[zh-hans] Hmm... it's not here",
        pageNotFound: '[zh-hans] Oops, this page cannot be found',
        noAccess: '[zh-hans] This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: '[zh-hans] Go back to home page',
        commentYouLookingForCannotBeFound: '[zh-hans] The comment you are looking for cannot be found.',
        goToChatInstead: '[zh-hans] Go to the chat instead.',
        contactConcierge: '[zh-hans] For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `[zh-hans] Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: '[zh-hans] Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "[zh-hans] That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: '[zh-hans] Status',
        statusExplanation: "[zh-hans] Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: '[zh-hans] Today',
        clearStatus: '[zh-hans] Clear status',
        save: '[zh-hans] Save',
        message: '[zh-hans] Message',
        timePeriods: {
            never: '[zh-hans] Never',
            thirtyMinutes: '[zh-hans] 30 minutes',
            oneHour: '[zh-hans] 1 hour',
            afterToday: '[zh-hans] Today',
            afterWeek: '[zh-hans] A week',
            custom: '[zh-hans] Custom',
        },
        untilTomorrow: '[zh-hans] Until tomorrow',
        untilTime: (time: string) => `[zh-hans] Until ${time}`,
        date: '[zh-hans] Date',
        time: '[zh-hans] Time',
        clearAfter: '[zh-hans] Clear after',
        whenClearStatus: '[zh-hans] When should we clear your status?',
        setVacationDelegate: `[zh-hans] Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        cannotSetVacationDelegate: `[zh-hans] You can't set a vacation delegate because you're currently the delegate for the following members:`,
        vacationDelegateError: '[zh-hans] There was an error updating your vacation delegate.',
        asVacationDelegate: (nameOrEmail: string) => `[zh-hans] as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `[zh-hans] to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `[zh-hans] You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `[zh-hans] Step ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '[zh-hans] Bank info',
        confirmBankInfo: '[zh-hans] Confirm bank info',
        manuallyAdd: '[zh-hans] Manually add your bank account',
        letsDoubleCheck: "[zh-hans] Let's double check that everything looks right.",
        accountEnding: '[zh-hans] Account ending in',
        thisBankAccount: '[zh-hans] This bank account will be used for business payments on your workspace',
        accountNumber: '[zh-hans] Account number',
        routingNumber: '[zh-hans] Routing number',
        chooseAnAccountBelow: '[zh-hans] Choose an account below',
        addBankAccount: '[zh-hans] Add bank account',
        chooseAnAccount: '[zh-hans] Choose an account',
        connectOnlineWithPlaid: '[zh-hans] Log into your bank',
        connectManually: '[zh-hans] Connect manually',
        desktopConnection: '[zh-hans] Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: '[zh-hans] Your data is secure',
        toGetStarted: '[zh-hans] Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: '[zh-hans] Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: '[zh-hans] Your routing number and account number can be found on a check for the account.',
        bankAccountPurposeTitle: '[zh-hans] What do you want to do with your bank account?',
        getReimbursed: '[zh-hans] Get reimbursed',
        getReimbursedDescription: '[zh-hans] By employer or others',
        makePayments: '[zh-hans] Make payments',
        makePaymentsDescription: '[zh-hans] Pay expenses or issue Expensify Cards',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `[zh-hans] To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: '[zh-hans] An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: (workspaceRoute: string) =>
            `[zh-hans] Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: '[zh-hans] Business bank account added!',
        bbaAddedDescription: "[zh-hans] It's ready to be used for payments.",
        lockedBankAccount: '[zh-hans] Locked bank account',
        unlockBankAccount: '[zh-hans] Unlock bank account',
        youCantPayThis: `[zh-hans] You can't pay this report because you have a <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">locked bank account</a>. Tap below and Concierge will help with the next steps to unlock it.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `[zh-hans] <h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `[zh-hans] Expensify Business Bank Account ${maskedAccountNumber}
Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.`,
        error: {
            youNeedToSelectAnOption: '[zh-hans] Please select an option to proceed',
            noBankAccountAvailable: "[zh-hans] Sorry, there's no bank account available",
            noBankAccountSelected: '[zh-hans] Please choose an account',
            taxID: '[zh-hans] Please enter a valid tax ID number',
            website: '[zh-hans] Please enter a valid website',
            zipCode: `[zh-hans] Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '[zh-hans] Please enter a valid phone number',
            email: '[zh-hans] Please enter a valid email address',
            companyName: '[zh-hans] Please enter a valid business name',
            addressCity: '[zh-hans] Please enter a valid city',
            addressStreet: '[zh-hans] Please enter a valid street address',
            addressState: '[zh-hans] Please select a valid state',
            incorporationDateFuture: "[zh-hans] Incorporation date can't be in the future",
            incorporationState: '[zh-hans] Please select a valid state',
            industryCode: '[zh-hans] Please enter a valid industry classification code with six digits',
            restrictedBusiness: "[zh-hans] Please confirm the business isn't on the list of restricted businesses",
            routingNumber: '[zh-hans] Please enter a valid routing number',
            accountNumber: '[zh-hans] Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "[zh-hans] Routing and account numbers can't match",
            companyType: '[zh-hans] Please select a valid company type',
            tooManyAttempts: '[zh-hans] Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: '[zh-hans] Please enter a valid address',
            dob: '[zh-hans] Please select a valid date of birth',
            age: '[zh-hans] Must be over 18 years old',
            ssnLast4: '[zh-hans] Please enter valid last 4 digits of SSN',
            firstName: '[zh-hans] Please enter a valid first name',
            lastName: '[zh-hans] Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: '[zh-hans] Please add a default deposit account or debit card',
            validationAmounts: '[zh-hans] The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: '[zh-hans] Please enter a valid full name',
            ownershipPercentage: '[zh-hans] Please enter a valid percentage number',
            deletePaymentBankAccount:
                "[zh-hans] This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: '[zh-hans] The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "[zh-hans] Where's your bank account located?",
        accountDetailsStepHeader: '[zh-hans] What are your account details?',
        accountTypeStepHeader: '[zh-hans] What type of account is this?',
        bankInformationStepHeader: '[zh-hans] What are your bank details?',
        accountHolderInformationStepHeader: '[zh-hans] What are the account holder details?',
        howDoWeProtectYourData: '[zh-hans] How do we protect your data?',
        currencyHeader: "[zh-hans] What's your bank account's currency?",
        confirmationStepHeader: '[zh-hans] Check your info.',
        confirmationStepSubHeader: '[zh-hans] Double check the details below, and check the terms box to confirm.',
        toGetStarted: '[zh-hans] Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
    },
    addPersonalBankAccountPage: {
        enterPassword: '[zh-hans] Enter Expensify password',
        alreadyAdded: '[zh-hans] This account has already been added.',
        chooseAccountLabel: '[zh-hans] Account',
        successTitle: '[zh-hans] Personal bank account added!',
        successMessage: '[zh-hans] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: '[zh-hans] Unknown filename',
        passwordRequired: '[zh-hans] Please enter a password',
        passwordIncorrect: '[zh-hans] Incorrect password. Please try again.',
        failedToLoadPDF: '[zh-hans] Failed to load PDF file',
        pdfPasswordForm: {
            title: '[zh-hans] Password protected PDF',
            infoText: '[zh-hans] This PDF is password protected.',
            beforeLinkText: '[zh-hans] Please',
            linkText: '[zh-hans] enter the password',
            afterLinkText: '[zh-hans] to view it.',
            formLabel: '[zh-hans] View PDF',
        },
        attachmentNotFound: '[zh-hans] Attachment not found',
        retry: '[zh-hans] Retry',
    },
    messages: {
        errorMessageInvalidPhone: `[zh-hans] Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '[zh-hans] Invalid email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `[zh-hans] ${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `[zh-hans] ${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '[zh-hans] By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: '[zh-hans] Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `[zh-hans] <muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: '[zh-hans] Try again',
        verifyIdentity: '[zh-hans] Verify identity',
        letsVerifyIdentity: "[zh-hans] Let's verify your identity",
        butFirst: `[zh-hans] But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '[zh-hans] An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: '[zh-hans] Enable camera access',
        cameraRequestMessage: '[zh-hans] We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: '[zh-hans] Enable microphone access',
        microphoneRequestMessage: '[zh-hans] We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: '[zh-hans] Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: '[zh-hans] Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "[zh-hans] There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "[zh-hans] There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "[zh-hans] Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "[zh-hans] Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: '[zh-hans] Additional details',
        helpText: '[zh-hans] We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: '[zh-hans] We need to ask you just a few more questions to finish validating your identity.',
        helpLink: '[zh-hans] Learn more about why we need this.',
        legalFirstNameLabel: '[zh-hans] Legal first name',
        legalMiddleNameLabel: '[zh-hans] Legal middle name',
        legalLastNameLabel: '[zh-hans] Legal last name',
        selectAnswer: '[zh-hans] Please select a response to proceed',
        ssnFull9Error: '[zh-hans] Please enter a valid nine-digit SSN',
        needSSNFull9: "[zh-hans] We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "[zh-hans] We couldn't verify",
        pleaseFixIt: '[zh-hans] Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `[zh-hans] We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: '[zh-hans] Terms and fees',
        headerTitleRefactor: '[zh-hans] Fees and terms',
        haveReadAndAgreePlain: '[zh-hans] I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `[zh-hans] I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: '[zh-hans] I agree to the Privacy and Wallet agreement.',
        agreeToThe: (walletAgreementUrl: string) =>
            `[zh-hans] I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: '[zh-hans] Enable payments',
        monthlyFee: '[zh-hans] Monthly fee',
        inactivity: '[zh-hans] Inactivity',
        noOverdraftOrCredit: '[zh-hans] No overdraft/credit feature.',
        electronicFundsWithdrawal: '[zh-hans] Electronic funds withdrawal',
        standard: '[zh-hans] Standard',
        reviewTheFees: '[zh-hans] Take a look at some fees.',
        checkTheBoxes: '[zh-hans] Please check the boxes below.',
        agreeToTerms: '[zh-hans] Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `[zh-hans] The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: '[zh-hans] Per purchase',
            atmWithdrawal: '[zh-hans] ATM withdrawal',
            cashReload: '[zh-hans] Cash reload',
            inNetwork: '[zh-hans] in-network',
            outOfNetwork: '[zh-hans] out-of-network',
            atmBalanceInquiry: '[zh-hans] ATM balance inquiry (in-network or out-of-network)',
            customerService: '[zh-hans] Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: '[zh-hans] Inactivity (after 12 months with no transactions)',
            weChargeOneFee: '[zh-hans] We charge 1 other type of fee. It is:',
            fdicInsurance: '[zh-hans] Your funds are eligible for FDIC insurance.',
            generalInfo: `[zh-hans] For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `[zh-hans] For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: '[zh-hans] Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: (amount: string) => `[zh-hans] (min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '[zh-hans] A list of all Expensify Wallet fees',
            typeOfFeeHeader: '[zh-hans] All fees',
            feeAmountHeader: '[zh-hans] Amount',
            moreDetailsHeader: '[zh-hans] Details',
            openingAccountTitle: '[zh-hans] Opening an account',
            openingAccountDetails: "[zh-hans] There's no fee to open an account.",
            monthlyFeeDetails: "[zh-hans] There's no monthly fee.",
            customerServiceTitle: '[zh-hans] Customer service',
            customerServiceDetails: '[zh-hans] There are no customer service fees.',
            inactivityDetails: "[zh-hans] There's no inactivity fee.",
            sendingFundsTitle: '[zh-hans] Sending funds to another account holder',
            sendingFundsDetails: "[zh-hans] There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "[zh-hans] There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "[zh-hans] There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                `[zh-hans]  The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `[zh-hans] Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                `[zh-hans]  Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `[zh-hans] Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `[zh-hans] For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: '[zh-hans] View printer-friendly version',
            automated: '[zh-hans] Automated',
            liveAgent: '[zh-hans] Live agent',
            instant: '[zh-hans] Instant',
            electronicFundsInstantFeeMin: (amount: string) => `[zh-hans] Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '[zh-hans] Enable payments',
        activatedTitle: '[zh-hans] Wallet activated!',
        activatedMessage: '[zh-hans] Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: '[zh-hans] Just a minute...',
        checkBackLaterMessage: "[zh-hans] We're still reviewing your information. Please check back later.",
        continueToPayment: '[zh-hans] Continue to payment',
        continueToTransfer: '[zh-hans] Continue to transfer',
    },
    companyStep: {
        headerTitle: '[zh-hans] Company information',
        subtitle: '[zh-hans] Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: '[zh-hans] Legal business name',
        companyWebsite: '[zh-hans] Company website',
        taxIDNumber: '[zh-hans] Tax ID number',
        taxIDNumberPlaceholder: '[zh-hans] 9 digits',
        companyType: '[zh-hans] Company type',
        incorporationDate: '[zh-hans] Incorporation date',
        incorporationState: '[zh-hans] Incorporation state',
        industryClassificationCode: '[zh-hans] Industry classification code',
        confirmCompanyIsNot: '[zh-hans] I confirm that this company is not on the',
        listOfRestrictedBusinesses: '[zh-hans] list of restricted businesses',
        incorporationDatePlaceholder: '[zh-hans] Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '[zh-hans] LLC',
            CORPORATION: '[zh-hans] Corp',
            PARTNERSHIP: '[zh-hans] Partnership',
            COOPERATIVE: '[zh-hans] Cooperative',
            SOLE_PROPRIETORSHIP: '[zh-hans] Sole proprietorship',
            OTHER: '[zh-hans] Other',
        },
        industryClassification: '[zh-hans] Which industry is the business classified under?',
        industryClassificationCodePlaceholder: '[zh-hans] Search for industry classification code',
    },
    requestorStep: {
        headerTitle: '[zh-hans] Personal information',
        learnMore: '[zh-hans] Learn more',
        isMyDataSafe: '[zh-hans] Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: '[zh-hans] Personal info',
        enterYourLegalFirstAndLast: "[zh-hans] What's your legal name?",
        legalFirstName: '[zh-hans] Legal first name',
        legalLastName: '[zh-hans] Legal last name',
        legalName: '[zh-hans] Legal name',
        enterYourDateOfBirth: "[zh-hans] What's your date of birth?",
        enterTheLast4: '[zh-hans] What are the last four digits of your Social Security Number?',
        dontWorry: "[zh-hans] Don't worry, we don't do any personal credit checks!",
        last4SSN: '[zh-hans] Last 4 of SSN',
        enterYourAddress: "[zh-hans] What's your address?",
        address: '[zh-hans] Address',
        letsDoubleCheck: "[zh-hans] Let's double check that everything looks right.",
        byAddingThisBankAccount: "[zh-hans] By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: '[zh-hans] What’s your legal name?',
        whatsYourDOB: '[zh-hans] What’s your date of birth?',
        whatsYourAddress: '[zh-hans] What’s your address?',
        whatsYourSSN: '[zh-hans] What are the last four digits of your Social Security Number?',
        noPersonalChecks: '[zh-hans] Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: '[zh-hans] What’s your phone number?',
        weNeedThisToVerify: '[zh-hans] We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: '[zh-hans] Company info',
        enterTheNameOfYourBusiness: "[zh-hans] What's the name of your company?",
        businessName: '[zh-hans] Legal company name',
        enterYourCompanyTaxIdNumber: "[zh-hans] What's your company’s Tax ID number?",
        taxIDNumber: '[zh-hans] Tax ID number',
        taxIDNumberPlaceholder: '[zh-hans] 9 digits',
        enterYourCompanyWebsite: "[zh-hans] What's your company’s website?",
        companyWebsite: '[zh-hans] Company website',
        enterYourCompanyPhoneNumber: "[zh-hans] What's your company’s phone number?",
        enterYourCompanyAddress: "[zh-hans] What's your company’s address?",
        selectYourCompanyType: '[zh-hans] What type of company is it?',
        companyType: '[zh-hans] Company type',
        incorporationType: {
            LLC: '[zh-hans] LLC',
            CORPORATION: '[zh-hans] Corp',
            PARTNERSHIP: '[zh-hans] Partnership',
            COOPERATIVE: '[zh-hans] Cooperative',
            SOLE_PROPRIETORSHIP: '[zh-hans] Sole proprietorship',
            OTHER: '[zh-hans] Other',
        },
        selectYourCompanyIncorporationDate: "[zh-hans] What's your company’s incorporation date?",
        incorporationDate: '[zh-hans] Incorporation date',
        incorporationDatePlaceholder: '[zh-hans] Start date (yyyy-mm-dd)',
        incorporationState: '[zh-hans] Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '[zh-hans] Which state was your company incorporated in?',
        letsDoubleCheck: "[zh-hans] Let's double check that everything looks right.",
        companyAddress: '[zh-hans] Company address',
        listOfRestrictedBusinesses: '[zh-hans] list of restricted businesses',
        confirmCompanyIsNot: '[zh-hans] I confirm that this company is not on the',
        businessInfoTitle: '[zh-hans] Business info',
        legalBusinessName: '[zh-hans] Legal business name',
        whatsTheBusinessName: "[zh-hans] What's the business name?",
        whatsTheBusinessAddress: "[zh-hans] What's the business address?",
        whatsTheBusinessContactInformation: "[zh-hans] What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "[zh-hans] What's the Company Registration Number (CRN)?";
                default:
                    return "[zh-hans] What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[zh-hans] What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return '[zh-hans] What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return '[zh-hans] What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return '[zh-hans] What’s the Australian Business Number (ABN)?';
                default:
                    return '[zh-hans] What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "[zh-hans] What's this number?",
        whereWasTheBusinessIncorporated: '[zh-hans] Where was the business incorporated?',
        whatTypeOfBusinessIsIt: '[zh-hans] What type of business is it?',
        whatsTheBusinessAnnualPayment: "[zh-hans] What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "[zh-hans] What's your expected average reimbursement amount?",
        registrationNumber: '[zh-hans] Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[zh-hans] EIN';
                case CONST.COUNTRY.CA:
                    return '[zh-hans] BN';
                case CONST.COUNTRY.GB:
                    return '[zh-hans] VRN';
                case CONST.COUNTRY.AU:
                    return '[zh-hans] ABN';
                default:
                    return '[zh-hans] EU VAT';
            }
        },
        businessAddress: '[zh-hans] Business address',
        businessType: '[zh-hans] Business type',
        incorporation: '[zh-hans] Incorporation',
        incorporationCountry: '[zh-hans] Incorporation country',
        incorporationTypeName: '[zh-hans] Incorporation type',
        businessCategory: '[zh-hans] Business category',
        annualPaymentVolume: '[zh-hans] Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `[zh-hans] Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '[zh-hans] Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `[zh-hans] Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '[zh-hans] Select incorporation type',
        selectBusinessCategory: '[zh-hans] Select business category',
        selectAnnualPaymentVolume: '[zh-hans] Select annual payment volume',
        selectIncorporationCountry: '[zh-hans] Select incorporation country',
        selectIncorporationState: '[zh-hans] Select incorporation state',
        selectAverageReimbursement: '[zh-hans] Select average reimbursement amount',
        selectBusinessType: '[zh-hans] Select business type',
        findIncorporationType: '[zh-hans] Find incorporation type',
        findBusinessCategory: '[zh-hans] Find business category',
        findAnnualPaymentVolume: '[zh-hans] Find annual payment volume',
        findIncorporationState: '[zh-hans] Find incorporation state',
        findAverageReimbursement: '[zh-hans] Find average reimbursement amount',
        findBusinessType: '[zh-hans] Find business type',
        error: {
            registrationNumber: '[zh-hans] Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '[zh-hans] Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return '[zh-hans] Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return '[zh-hans] Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return '[zh-hans] Please provide a valid Australian Business Number (ABN)';
                    default:
                        return '[zh-hans] Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `[zh-hans] Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `[zh-hans] Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `[zh-hans] Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: '[zh-hans] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: '[zh-hans] Business owner',
        enterLegalFirstAndLastName: "[zh-hans] What's the owner's legal name?",
        legalFirstName: '[zh-hans] Legal first name',
        legalLastName: '[zh-hans] Legal last name',
        enterTheDateOfBirthOfTheOwner: "[zh-hans] What's the owner's date of birth?",
        enterTheLast4: '[zh-hans] What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: '[zh-hans] Last 4 of SSN',
        dontWorry: "[zh-hans] Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "[zh-hans] What's the owner's address?",
        letsDoubleCheck: '[zh-hans] Let’s double check that everything looks right.',
        legalName: '[zh-hans] Legal name',
        address: '[zh-hans] Address',
        byAddingThisBankAccount: "[zh-hans] By adding this bank account, you confirm that you've read, understand, and accept",
        owners: '[zh-hans] Owners',
    },
    ownershipInfoStep: {
        ownerInfo: '[zh-hans] Owner info',
        businessOwner: '[zh-hans] Business owner',
        signerInfo: '[zh-hans] Signer info',
        doYouOwn: (companyName: string) => `[zh-hans] Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `[zh-hans] Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: '[zh-hans] Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: '[zh-hans] Legal first name',
        legalLastName: '[zh-hans] Legal last name',
        whatsTheOwnersName: "[zh-hans] What's the owner's legal name?",
        whatsYourName: "[zh-hans] What's your legal name?",
        whatPercentage: '[zh-hans] What percentage of the business belongs to the owner?',
        whatsYoursPercentage: '[zh-hans] What percentage of the business do you own?',
        ownership: '[zh-hans] Ownership',
        whatsTheOwnersDOB: "[zh-hans] What's the owner's date of birth?",
        whatsYourDOB: "[zh-hans] What's your date of birth?",
        whatsTheOwnersAddress: "[zh-hans] What's the owner's address?",
        whatsYourAddress: "[zh-hans] What's your address?",
        whatAreTheLast: "[zh-hans] What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: '[zh-hans] What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: '[zh-hans] What is your country of citizenship?',
        whatsTheOwnersNationality: "[zh-hans] What's the owner's country of citizenship?",
        countryOfCitizenship: '[zh-hans] Country of citizenship',
        dontWorry: "[zh-hans] Don't worry, we don't do any personal credit checks!",
        last4: '[zh-hans] Last 4 of SSN',
        whyDoWeAsk: '[zh-hans] Why do we ask for this?',
        letsDoubleCheck: '[zh-hans] Let’s double check that everything looks right.',
        legalName: '[zh-hans] Legal name',
        ownershipPercentage: '[zh-hans] Ownership percentage',
        areThereOther: (companyName: string) => `[zh-hans] Are there other individuals who own 25% or more of ${companyName}?`,
        owners: '[zh-hans] Owners',
        addCertified: '[zh-hans] Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart:
            '[zh-hans] Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: '[zh-hans] Upload entity ownership chart',
        noteEntity: '[zh-hans] Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: '[zh-hans] Certified entity ownership chart',
        selectCountry: '[zh-hans] Select country',
        findCountry: '[zh-hans] Find country',
        address: '[zh-hans] Address',
        chooseFile: '[zh-hans] Choose file',
        uploadDocuments: '[zh-hans] Upload additional documentation',
        pleaseUpload: '[zh-hans] Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: '[zh-hans] Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: '[zh-hans] Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "[zh-hans] Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: '[zh-hans] Copy of ID for beneficial owner',
        copyOfIDDescription: "[zh-hans] Examples: Passport, driver's license, etc.",
        proofOfAddress: '[zh-hans] Address proof for beneficial owner',
        proofOfAddressDescription: '[zh-hans] Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: '[zh-hans] Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            '[zh-hans] Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: '[zh-hans] Complete verification',
        confirmAgreements: '[zh-hans] Please confirm the agreements below.',
        certifyTrueAndAccurate: '[zh-hans] I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: '[zh-hans] Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: '[zh-hans] I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: '[zh-hans] You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: '[zh-hans] terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '[zh-hans] Validate your bank account',
        validateButtonText: '[zh-hans] Validate',
        validationInputLabel: '[zh-hans] Transaction',
        maxAttemptsReached: '[zh-hans] Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `[zh-hans] Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '[zh-hans] Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: '[zh-hans] Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: '[zh-hans] Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: '[zh-hans] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: '[zh-hans] Secure your account',
    },
    countryStep: {
        confirmBusinessBank: '[zh-hans] Confirm business bank account currency and country',
        confirmCurrency: '[zh-hans] Confirm currency and country',
        yourBusiness: '[zh-hans] Your business bank account currency must match your workspace currency.',
        youCanChange: '[zh-hans] You can change your workspace currency in your',
        findCountry: '[zh-hans] Find country',
        selectCountry: '[zh-hans] Select country',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `[zh-hans] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> so you can invite a director to sign in a later step.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '[zh-hans] What are your business bank account details?',
        letsDoubleCheck: '[zh-hans] Let’s double check that everything looks fine.',
        thisBankAccount: '[zh-hans] This bank account will be used for business payments on your workspace',
        accountNumber: '[zh-hans] Account number',
        accountHolderNameDescription: "[zh-hans] Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: '[zh-hans] Signer info',
        areYouDirector: (companyName: string) => `[zh-hans] Are you a director at ${companyName}?`,
        regulationRequiresUs: '[zh-hans] Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "[zh-hans] What's your legal name",
        fullName: '[zh-hans] Legal full name',
        whatsYourJobTitle: "[zh-hans] What's your job title?",
        jobTitle: '[zh-hans] Job title',
        whatsYourDOB: "[zh-hans] What's your date of birth?",
        uploadID: '[zh-hans] Upload ID and proof of address',
        personalAddress: '[zh-hans] Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: '[zh-hans] Let’s double check that everything looks right.',
        legalName: '[zh-hans] Legal name',
        proofOf: '[zh-hans] Proof of personal address',
        enterOneEmail: (companyName: string) => `[zh-hans] Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: '[zh-hans] Regulation requires at least one more director as a signer.',
        hangTight: '[zh-hans] Hang tight...',
        enterTwoEmails: (companyName: string) => `[zh-hans] Enter the emails of two directors at ${companyName}`,
        sendReminder: '[zh-hans] Send a reminder',
        chooseFile: '[zh-hans] Choose file',
        weAreWaiting: "[zh-hans] We're waiting for others to verify their identities as directors of the business.",
        id: '[zh-hans] Copy of ID',
        proofOfDirectors: '[zh-hans] Proof of director(s)',
        proofOfDirectorsDescription: '[zh-hans] Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: '[zh-hans] Codice Fiscale',
        codiceFiscaleDescription: '[zh-hans] Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: '[zh-hans] PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            [zh-hans] Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: '[zh-hans] Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: '[zh-hans] Enter signer info',
        thisStep: '[zh-hans] This step has been completed',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `[zh-hans] is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: '[zh-hans] Emails must be different',
            connectToWorkspace: (workspaceRoute: string) => `[zh-hans] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> to invite a director to sign.`,
        },
    },
    agreementsStep: {
        agreements: '[zh-hans] Agreements',
        pleaseConfirm: '[zh-hans] Please confirm the agreements below',
        regulationRequiresUs: '[zh-hans] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: '[zh-hans] I am authorized to use the business bank account for business spend.',
        iCertify: '[zh-hans] I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `[zh-hans] I accept the <a href="https://www.corpay.com/cross-border/terms">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: '[zh-hans] I accept the terms and conditions.',
        accept: '[zh-hans] Accept and add bank account',
        iConsentToThePrivacyNotice: '[zh-hans] I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: '[zh-hans] I consent to the privacy notice.',
        error: {
            authorized: '[zh-hans] You must be a controlling officer with authorization to operate the business bank account',
            certify: '[zh-hans] Please certify that the information is true and accurate',
            consent: '[zh-hans] Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: '[zh-hans] Docusign Form',
        pleaseComplete:
            '[zh-hans] Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: '[zh-hans] Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            '[zh-hans] Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: '[zh-hans] Take me to Docusign',
        uploadAdditional: '[zh-hans] Upload additional documentation',
        pleaseUpload: '[zh-hans] Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: '[zh-hans] Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "[zh-hans] Let's finish in chat!",
        thanksFor:
            "[zh-hans] Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: '[zh-hans] I have a question',
        enable2FA: '[zh-hans] Enable two-factor authentication (2FA) to prevent fraud',
        weTake: '[zh-hans] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: '[zh-hans] Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '[zh-hans] One moment',
        explanationLine: "[zh-hans] We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "[zh-hans] Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: '[zh-hans] Book travel',
        title: '[zh-hans] Travel smart',
        subtitle: '[zh-hans] Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: '[zh-hans] Save money on your bookings',
            alerts: '[zh-hans] Get realtime alerts if your travel plans change',
        },
        bookTravel: '[zh-hans] Book travel',
        bookDemo: '[zh-hans] Book demo',
        bookADemo: '[zh-hans] Book a demo',
        toLearnMore: '[zh-hans]  to learn more.',
        termsAndConditions: {
            header: '[zh-hans] Before we continue...',
            title: '[zh-hans] Terms & conditions',
            label: '[zh-hans] I agree to the terms & conditions',
            subtitle: `[zh-hans] Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: '[zh-hans] You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                '[zh-hans] You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: '[zh-hans] Flight',
        flightDetails: {
            passenger: '[zh-hans] Passenger',
            layover: (layover: string) => `[zh-hans] <muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: '[zh-hans] Take-off',
            landing: '[zh-hans] Landing',
            seat: '[zh-hans] Seat',
            class: '[zh-hans] Cabin Class',
            recordLocator: '[zh-hans] Record locator',
            cabinClasses: {
                unknown: '[zh-hans] Unknown',
                economy: '[zh-hans] Economy',
                premiumEconomy: '[zh-hans] Premium Economy',
                business: '[zh-hans] Business',
                first: '[zh-hans] First',
            },
        },
        hotel: '[zh-hans] Hotel',
        hotelDetails: {
            guest: '[zh-hans] Guest',
            checkIn: '[zh-hans] Check-in',
            checkOut: '[zh-hans] Check-out',
            roomType: '[zh-hans] Room type',
            cancellation: '[zh-hans] Cancellation policy',
            cancellationUntil: '[zh-hans] Free cancellation until',
            confirmation: '[zh-hans] Confirmation number',
            cancellationPolicies: {
                unknown: '[zh-hans] Unknown',
                nonRefundable: '[zh-hans] Non-refundable',
                freeCancellationUntil: '[zh-hans] Free cancellation until',
                partiallyRefundable: '[zh-hans] Partially refundable',
            },
        },
        car: '[zh-hans] Car',
        carDetails: {
            rentalCar: '[zh-hans] Car rental',
            pickUp: '[zh-hans] Pick-up',
            dropOff: '[zh-hans] Drop-off',
            driver: '[zh-hans] Driver',
            carType: '[zh-hans] Car type',
            cancellation: '[zh-hans] Cancellation policy',
            cancellationUntil: '[zh-hans] Free cancellation until',
            freeCancellation: '[zh-hans] Free cancellation',
            confirmation: '[zh-hans] Confirmation number',
        },
        train: '[zh-hans] Rail',
        trainDetails: {
            passenger: '[zh-hans] Passenger',
            departs: '[zh-hans] Departs',
            arrives: '[zh-hans] Arrives',
            coachNumber: '[zh-hans] Coach number',
            seat: '[zh-hans] Seat',
            fareDetails: '[zh-hans] Fare details',
            confirmation: '[zh-hans] Confirmation number',
        },
        viewTrip: '[zh-hans] View trip',
        modifyTrip: '[zh-hans] Modify trip',
        tripSupport: '[zh-hans] Trip support',
        tripDetails: '[zh-hans] Trip details',
        viewTripDetails: '[zh-hans] View trip details',
        trip: '[zh-hans] Trip',
        trips: '[zh-hans] Trips',
        tripSummary: '[zh-hans] Trip summary',
        departs: '[zh-hans] Departs',
        errorMessage: '[zh-hans] Something went wrong. Please try again later.',
        phoneError: (phoneErrorMethodsRoute: string) => `[zh-hans] <rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: '[zh-hans] Domain',
            subtitle: '[zh-hans] Choose a domain for Expensify Travel setup.',
            recommended: '[zh-hans] Recommended',
        },
        domainPermissionInfo: {
            title: '[zh-hans] Domain',
            restriction: (domain: string) =>
                `[zh-hans] You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `[zh-hans] If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '[zh-hans] Get started with Expensify Travel',
            message: `[zh-hans] You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: '[zh-hans] Expensify Travel has been disabled',
            message: `[zh-hans] Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "[zh-hans] We're reviewing your request...",
            message: `[zh-hans] We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: '[zh-hans] Got it',
            conciergeMessage: ({domain}: {domain: string}) => `[zh-hans] Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `[zh-hans] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[zh-hans] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[zh-hans] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[zh-hans] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `[zh-hans] The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `[zh-hans] Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[zh-hans] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `[zh-hans] Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `[zh-hans] Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `[zh-hans] Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `[zh-hans] Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: '[zh-hans] Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: (type: string, id = '') => `[zh-hans] You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `[zh-hans] The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: (type: string, id = '') => `[zh-hans] Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: (type: string) => `[zh-hans] Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `[zh-hans] Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `[zh-hans] Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `[zh-hans] Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: (type: string) => `[zh-hans] Your ${type} reservation was updated.`,
        },
        flightTo: '[zh-hans] Flight to',
        trainTo: '[zh-hans] Train to',
        carRental: '[zh-hans]  car rental',
        nightIn: '[zh-hans] night in',
        nightsIn: '[zh-hans] nights in',
    },
    proactiveAppReview: {
        title: '[zh-hans] Enjoying New Expensify?',
        description: '[zh-hans] Let us know so we can help make your expensing experience even better.',
        positiveButton: '[zh-hans] Yeah!',
        negativeButton: '[zh-hans] Not really',
    },
    workspace: {
        common: {
            card: '[zh-hans] Cards',
            expensifyCard: '[zh-hans] Expensify Card',
            companyCards: '[zh-hans] Company cards',
            personalCards: '[zh-hans] Personal cards',
            workflows: '[zh-hans] Workflows',
            workspace: '[zh-hans] Workspace',
            findWorkspace: '[zh-hans] Find workspace',
            edit: '[zh-hans] Edit workspace',
            enabled: '[zh-hans] Enabled',
            disabled: '[zh-hans] Disabled',
            everyone: '[zh-hans] Everyone',
            delete: '[zh-hans] Delete workspace',
            settings: '[zh-hans] Settings',
            reimburse: '[zh-hans] Reimbursements',
            categories: '[zh-hans] Categories',
            tags: '[zh-hans] Tags',
            customField1: '[zh-hans] Custom field 1',
            customField2: '[zh-hans] Custom field 2',
            customFieldHint: '[zh-hans] Add custom coding that applies to all spend from this member.',
            reports: '[zh-hans] Reports',
            reportFields: '[zh-hans] Report fields',
            reportTitle: '[zh-hans] Report title',
            reportField: '[zh-hans] Report field',
            taxes: '[zh-hans] Taxes',
            bills: '[zh-hans] Bills',
            invoices: '[zh-hans] Invoices',
            perDiem: '[zh-hans] Per diem',
            travel: '[zh-hans] Travel',
            members: '[zh-hans] Members',
            accounting: '[zh-hans] Accounting',
            receiptPartners: '[zh-hans] Receipt partners',
            rules: '[zh-hans] Rules',
            displayedAs: '[zh-hans] Displayed as',
            plan: '[zh-hans] Plan',
            profile: '[zh-hans] Overview',
            bankAccount: '[zh-hans] Bank account',
            testTransactions: '[zh-hans] Test transactions',
            issueAndManageCards: '[zh-hans] Issue and manage cards',
            reconcileCards: '[zh-hans] Reconcile cards',
            selectAll: '[zh-hans] Select all',
            selected: () => ({
                one: '[zh-hans] 1 selected',
                other: (count: number) => `[zh-hans] ${count} selected`,
            }),
            settlementFrequency: '[zh-hans] Settlement frequency',
            setAsDefault: '[zh-hans] Set as default workspace',
            defaultNote: `[zh-hans] Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '[zh-hans] Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: '[zh-hans] Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            deleteOpenExpensifyCardsError: '[zh-hans] Your company still has open Expensify Cards.',
            outstandingBalanceWarning:
                '[zh-hans] You have an outstanding balance that must be settled before deleting your last workspace. Please go to your subscription settings to resolve the payment.',
            settleBalance: '[zh-hans] Go to subscription',
            unavailable: '[zh-hans] Unavailable workspace',
            memberNotFound: '[zh-hans] Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `[zh-hans] You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: '[zh-hans] Go to workspace',
            duplicateWorkspace: '[zh-hans] Duplicate workspace',
            duplicateWorkspacePrefix: '[zh-hans] Duplicate',
            goToWorkspaces: '[zh-hans] Go to workspaces',
            clearFilter: '[zh-hans] Clear filter',
            workspaceName: '[zh-hans] Workspace name',
            workspaceOwner: '[zh-hans] Owner',
            keepMeAsAdmin: '[zh-hans] Keep me as an admin',
            workspaceType: '[zh-hans] Workspace type',
            workspaceAvatar: '[zh-hans] Workspace avatar',
            clientID: '[zh-hans] Client ID',
            clientIDInputHint: "[zh-hans] Enter the client's unique identifier",
            mustBeOnlineToViewMembers: '[zh-hans] You need to be online in order to view members of this workspace.',
            moreFeatures: '[zh-hans] More features',
            requested: '[zh-hans] Requested',
            distanceRates: '[zh-hans] Distance rates',
            defaultDescription: '[zh-hans] One place for all your receipts and expenses.',
            descriptionHint: '[zh-hans] Share information about this workspace with all members.',
            welcomeNote: '[zh-hans] Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: '[zh-hans] Subscription',
            markAsEntered: '[zh-hans] Mark as manually entered',
            markAsExported: '[zh-hans] Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `[zh-hans] Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "[zh-hans] Let's double check that everything looks right.",
            lineItemLevel: '[zh-hans] Line-item level',
            reportLevel: '[zh-hans] Report level',
            topLevel: '[zh-hans] Top level',
            appliedOnExport: '[zh-hans] Not imported into Expensify, applied on export',
            shareNote: {
                header: '[zh-hans] Share your workspace with other members',
                content: (adminsRoomLink: string) =>
                    `[zh-hans] Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `[zh-hans] Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '[zh-hans] Create new connection',
            reuseExistingConnection: '[zh-hans] Reuse existing connection',
            existingConnections: '[zh-hans] Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `[zh-hans] Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `[zh-hans] ${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `[zh-hans] Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: '[zh-hans] Learn more',
            memberAlternateText: '[zh-hans] Submit and approve reports.',
            adminAlternateText: '[zh-hans] Manage reports and workspace settings.',
            auditorAlternateText: '[zh-hans] View and comment on reports.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: '[zh-hans] Direct',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: '[zh-hans] None',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '[zh-hans] Indirect',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '[zh-hans] Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '[zh-hans] Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return '[zh-hans] Member';
                    default:
                        return '[zh-hans] Member';
                }
            },
            frequency: {
                manual: '[zh-hans] Manually',
                instant: '[zh-hans] Instant',
                immediate: '[zh-hans] Daily',
                trip: '[zh-hans] By trip',
                weekly: '[zh-hans] Weekly',
                semimonthly: '[zh-hans] Twice a month',
                monthly: '[zh-hans] Monthly',
            },
            budgetFrequency: {
                monthly: '[zh-hans] monthly',
                yearly: '[zh-hans] yearly',
            },
            budgetFrequencyUnit: {
                monthly: '[zh-hans] month',
                yearly: '[zh-hans] year',
            },
            budgetTypeForNotificationMessage: {
                tag: '[zh-hans] tag',
                category: '[zh-hans] category',
            },
            planType: '[zh-hans] Plan type',
            youCantDowngradeInvoicing:
                "[zh-hans] You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: '[zh-hans] Default category',
            viewTransactions: '[zh-hans] View transactions',
            policyExpenseChatName: (displayName: string) => `[zh-hans] ${displayName}'s expenses`,
            deepDiveExpensifyCard: `[zh-hans] <muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `[zh-hans] Connected to ${organizationName}` : '[zh-hans] Automate travel and meal delivery expenses across your organization.',
                sendInvites: '[zh-hans] Send invites',
                sendInvitesDescription: "[zh-hans] These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: '[zh-hans] Confirm invite',
                manageInvites: '[zh-hans] Manage invites',
                confirm: '[zh-hans] Confirm',
                allSet: '[zh-hans] All set',
                readyToRoll: "[zh-hans] You're ready to roll",
                takeBusinessRideMessage: '[zh-hans] Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: '[zh-hans] All',
                linked: '[zh-hans] Linked',
                outstanding: '[zh-hans] Outstanding',
                status: {
                    resend: '[zh-hans] Resend',
                    invite: '[zh-hans] Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '[zh-hans] Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '[zh-hans] Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '[zh-hans] Suspended',
                },
                centralBillingAccount: '[zh-hans] Central billing account',
                centralBillingDescription: '[zh-hans] Choose where to import all Uber receipts.',
                invitationFailure: '[zh-hans] Failed to invite member to Uber for Business',
                autoInvite: '[zh-hans] Invite new workspace members to Uber for Business',
                autoRemove: '[zh-hans] Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: '[zh-hans] No outstanding invites',
                    subtitle: '[zh-hans] Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `[zh-hans] <muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: '[zh-hans] Amount',
            deleteRates: () => ({
                one: '[zh-hans] Delete rate',
                other: '[zh-hans] Delete rates',
            }),
            deletePerDiemRate: '[zh-hans] Delete per diem rate',
            findPerDiemRate: '[zh-hans] Find per diem rate',
            areYouSureDelete: () => ({
                one: '[zh-hans] Are you sure you want to delete this rate?',
                other: '[zh-hans] Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: '[zh-hans] Per diem',
                subtitle: '[zh-hans] Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: '[zh-hans] Import per diem rates',
            editPerDiemRate: '[zh-hans] Edit per diem rate',
            editPerDiemRates: '[zh-hans] Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `[zh-hans] Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `[zh-hans] Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '[zh-hans] Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: '[zh-hans] Mark checks as “print later”',
            exportDescription: '[zh-hans] Configure how Expensify data exports to QuickBooks Desktop.',
            date: '[zh-hans] Export date',
            exportInvoices: '[zh-hans] Export invoices to',
            exportExpensifyCard: '[zh-hans] Export Expensify Card transactions as',
            account: '[zh-hans] Account',
            accountDescription: '[zh-hans] Choose where to post journal entries.',
            accountsPayable: '[zh-hans] Accounts payable',
            accountsPayableDescription: '[zh-hans] Choose where to create vendor bills.',
            bankAccount: '[zh-hans] Bank account',
            notConfigured: '[zh-hans] Not configured',
            bankAccountDescription: '[zh-hans] Choose where to send checks from.',
            creditCardAccount: '[zh-hans] Credit card account',
            exportDate: {
                label: '[zh-hans] Export date',
                description: '[zh-hans] Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[zh-hans] Date of last expense',
                        description: '[zh-hans] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[zh-hans] Export date',
                        description: '[zh-hans] Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[zh-hans] Submitted date',
                        description: '[zh-hans] Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "[zh-hans] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[zh-hans] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[zh-hans] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "[zh-hans] QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[zh-hans] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[zh-hans] Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[zh-hans] Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[zh-hans] Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[zh-hans] Check',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "[zh-hans] We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[zh-hans] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[zh-hans] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[zh-hans] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[zh-hans] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '[zh-hans] Choose where to send checks from.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[zh-hans] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[zh-hans] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[zh-hans] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: '[zh-hans] No accounts found',
            noAccountsFoundDescription: '[zh-hans] Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: '[zh-hans] QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "[zh-hans] Can't connect from this device",
                body1: "[zh-hans] You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "[zh-hans] Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: '[zh-hans] Open this link to connect',
                body: '[zh-hans] To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: '[zh-hans] Something went wrong',
                setupErrorBody: (conciergeLink: string) =>
                    `[zh-hans] <muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: '[zh-hans] Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: '[zh-hans] Classes',
            items: '[zh-hans] Items',
            customers: '[zh-hans] Customers/projects',
            exportCompanyCardsDescription: '[zh-hans] Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: '[zh-hans] Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: '[zh-hans] Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[zh-hans] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[zh-hans] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[zh-hans] Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: '[zh-hans] Line item level',
            reportFieldsDisplayedAsDescription: '[zh-hans] Report level',
            customersDescription: '[zh-hans] Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: '[zh-hans] Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: '[zh-hans] Auto-create entities',
                createEntitiesDescription: "[zh-hans] Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: '[zh-hans] Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: '[zh-hans] When to Export',
                description: '[zh-hans] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: '[zh-hans] Connected to',
            importDescription: '[zh-hans] Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: '[zh-hans] Classes',
            locations: '[zh-hans] Locations',
            customers: '[zh-hans] Customers/projects',
            accountsDescription: '[zh-hans] Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[zh-hans] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[zh-hans] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[zh-hans] Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: '[zh-hans] Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: '[zh-hans] Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: '[zh-hans] Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "[zh-hans] QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "[zh-hans] QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: '[zh-hans] Configure how Expensify data exports to QuickBooks Online.',
            date: '[zh-hans] Export date',
            exportInvoices: '[zh-hans] Export invoices to',
            exportExpensifyCard: '[zh-hans] Export Expensify Card transactions as',
            exportDate: {
                label: '[zh-hans] Export date',
                description: '[zh-hans] Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[zh-hans] Date of last expense',
                        description: '[zh-hans] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[zh-hans] Export date',
                        description: '[zh-hans] Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[zh-hans] Submitted date',
                        description: '[zh-hans] Date the report was submitted for approval.',
                    },
                },
            },
            receivable: '[zh-hans] Accounts receivable',
            archive: '[zh-hans] Accounts receivable archive',
            exportInvoicesDescription: '[zh-hans] Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: '[zh-hans] Set how company card purchases export to QuickBooks Online.',
            vendor: '[zh-hans] Vendor',
            defaultVendorDescription: '[zh-hans] Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: '[zh-hans] Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "[zh-hans] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[zh-hans] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[zh-hans] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: '[zh-hans] Account',
            accountDescription: '[zh-hans] Choose where to post journal entries.',
            accountsPayable: '[zh-hans] Accounts payable',
            accountsPayableDescription: '[zh-hans] Choose where to create vendor bills.',
            bankAccount: '[zh-hans] Bank account',
            notConfigured: '[zh-hans] Not configured',
            bankAccountDescription: '[zh-hans] Choose where to send checks from.',
            creditCardAccount: '[zh-hans] Credit card account',
            companyCardsLocationEnabledDescription:
                "[zh-hans] QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "[zh-hans] QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[zh-hans] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: '[zh-hans] Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: '[zh-hans] Invite employees',
                inviteEmployeesDescription: '[zh-hans] Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: '[zh-hans] Auto-create entities',
                createEntitiesDescription:
                    "[zh-hans] Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription:
                    '[zh-hans] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: '[zh-hans] QuickBooks bill payment account',
                qboInvoiceCollectionAccount: '[zh-hans] QuickBooks invoice collections account',
                accountSelectDescription: "[zh-hans] Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "[zh-hans] Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '[zh-hans] Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[zh-hans] Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[zh-hans] Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[zh-hans] Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[zh-hans] Check',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "[zh-hans] We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[zh-hans] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[zh-hans] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '[zh-hans] Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[zh-hans] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[zh-hans] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[zh-hans] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[zh-hans] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[zh-hans] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[zh-hans] Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[zh-hans] Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[zh-hans] Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[zh-hans] To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[zh-hans] To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[zh-hans] To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: '[zh-hans] No accounts found',
            noAccountsFoundDescription: '[zh-hans] Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: '[zh-hans] When to Export',
                description: '[zh-hans] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Out-of-pocket expenses will export when paid',
                },
            },
            travelInvoicing: '[zh-hans] Export Expensify Travel Payable To',
            travelInvoicingVendor: '[zh-hans] Travel vendor',
            travelInvoicingPayableAccount: '[zh-hans] Travel payable account',
        },
        workspaceList: {
            joinNow: '[zh-hans] Join now',
            askToJoin: '[zh-hans] Ask to join',
        },
        xero: {
            organization: '[zh-hans] Xero organization',
            organizationDescription: "[zh-hans] Choose the Xero organization that you'd like to import data from.",
            importDescription: '[zh-hans] Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: '[zh-hans] Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[zh-hans] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[zh-hans] Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: '[zh-hans] Tracking categories',
            trackingCategoriesDescription: '[zh-hans] Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `[zh-hans] Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `[zh-hans] Choose where to map ${categoryName} when exporting to Xero.`,
            customers: '[zh-hans] Re-bill customers',
            customersDescription:
                '[zh-hans] Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: '[zh-hans] Choose how to handle Xero taxes in Expensify.',
            notImported: '[zh-hans] Not imported',
            notConfigured: '[zh-hans] Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: '[zh-hans] Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '[zh-hans] Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '[zh-hans] Report fields',
            },
            exportDescription: '[zh-hans] Configure how Expensify data exports to Xero.',
            purchaseBill: '[zh-hans] Purchase bill',
            exportDeepDiveCompanyCard:
                '[zh-hans] Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: '[zh-hans] Bank transactions',
            xeroBankAccount: '[zh-hans] Xero bank account',
            xeroBankAccountDescription: '[zh-hans] Choose where expenses will post as bank transactions.',
            exportExpensesDescription: '[zh-hans] Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: '[zh-hans] Purchase bill date',
            exportInvoices: '[zh-hans] Export invoices as',
            salesInvoice: '[zh-hans] Sales invoice',
            exportInvoicesDescription: '[zh-hans] Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: '[zh-hans] Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: '[zh-hans] Purchase bill status',
                reimbursedReportsDescription: '[zh-hans] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: '[zh-hans] Xero bill payment account',
                xeroInvoiceCollectionAccount: '[zh-hans] Xero invoice collections account',
                xeroBillPaymentAccountDescription: "[zh-hans] Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "[zh-hans] Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: '[zh-hans] Purchase bill date',
                description: '[zh-hans] Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[zh-hans] Date of last expense',
                        description: '[zh-hans] Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[zh-hans] Export date',
                        description: '[zh-hans] Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[zh-hans] Submitted date',
                        description: '[zh-hans] Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: '[zh-hans] Purchase bill status',
                description: '[zh-hans] Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '[zh-hans] Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '[zh-hans] Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '[zh-hans] Awaiting payment',
                },
            },
            noAccountsFound: '[zh-hans] No accounts found',
            noAccountsFoundDescription: '[zh-hans] Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: '[zh-hans] When to Export',
                description: '[zh-hans] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '[zh-hans] Preferred exporter',
            taxSolution: '[zh-hans] Tax solution',
            notConfigured: '[zh-hans] Not configured',
            exportDate: {
                label: '[zh-hans] Export date',
                description: '[zh-hans] Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[zh-hans] Date of last expense',
                        description: '[zh-hans] Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '[zh-hans] Export date',
                        description: '[zh-hans] Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '[zh-hans] Submitted date',
                        description: '[zh-hans] Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: '[zh-hans] Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '[zh-hans] Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[zh-hans] Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: '[zh-hans] Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '[zh-hans] Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[zh-hans] Vendor bills',
                },
            },
            creditCardAccount: '[zh-hans] Credit card account',
            defaultVendor: '[zh-hans] Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `[zh-hans] Set a default vendor that will apply to ${isReimbursable ? '' : '[zh-hans] non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: '[zh-hans] Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                '[zh-hans] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[zh-hans] Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: '[zh-hans] No accounts found',
            noAccountsFoundDescription: `[zh-hans] Please add the account in Sage Intacct and sync the connection again`,
            autoSync: '[zh-hans] Auto-sync',
            autoSyncDescription: '[zh-hans] Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: '[zh-hans] Invite employees',
            inviteEmployeesDescription:
                '[zh-hans] Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: '[zh-hans] Sync reimbursed reports',
            syncReimbursedReportsDescription: '[zh-hans] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: '[zh-hans] Sage Intacct payment account',
            accountingMethods: {
                label: '[zh-hans] When to Export',
                description: '[zh-hans] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Out-of-pocket expenses will export when paid',
                },
            },
        },
        netsuite: {
            subsidiary: '[zh-hans] Subsidiary',
            subsidiarySelectDescription: "[zh-hans] Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: '[zh-hans] Configure how Expensify data exports to NetSuite.',
            exportInvoices: '[zh-hans] Export invoices to',
            journalEntriesTaxPostingAccount: '[zh-hans] Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: '[zh-hans] Journal entries provincial tax posting account',
            foreignCurrencyAmount: '[zh-hans] Export foreign currency amount',
            exportToNextOpenPeriod: '[zh-hans] Export to next open period',
            nonReimbursableJournalPostingAccount: '[zh-hans] Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: '[zh-hans] Reimbursable journal posting account',
            journalPostingPreference: {
                label: '[zh-hans] Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '[zh-hans] Single, itemized entry for each report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '[zh-hans] Single entry for each expense',
                },
            },
            invoiceItem: {
                label: '[zh-hans] Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '[zh-hans] Create one for me',
                        description: '[zh-hans] We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '[zh-hans] Select existing',
                        description: "[zh-hans] We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: '[zh-hans] Export date',
                description: '[zh-hans] Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[zh-hans] Date of last expense',
                        description: '[zh-hans] Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '[zh-hans] Export date',
                        description: '[zh-hans] Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '[zh-hans] Submitted date',
                        description: '[zh-hans] Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '[zh-hans] Expense reports',
                        reimbursableDescription: '[zh-hans] Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: '[zh-hans] Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '[zh-hans] Vendor bills',
                        reimbursableDescription: dedent(`
                            [zh-hans] Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [zh-hans] Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '[zh-hans] Journal entries',
                        reimbursableDescription: dedent(`
                            [zh-hans] Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [zh-hans] Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "[zh-hans] If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: '[zh-hans] Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: '[zh-hans] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: '[zh-hans] Reimbursements account',
                reimbursementsAccountDescription: "[zh-hans] Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: '[zh-hans] Collections account',
                collectionsAccountDescription: '[zh-hans] Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: '[zh-hans] A/P approval account',
                approvalAccountDescription:
                    '[zh-hans] Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: '[zh-hans] NetSuite default',
                inviteEmployees: '[zh-hans] Invite employees and set approvals',
                inviteEmployeesDescription:
                    '[zh-hans] Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: '[zh-hans] Auto-create employees/vendors',
                enableCategories: '[zh-hans] Enable newly imported categories',
                customFormID: '[zh-hans] Custom form ID',
                customFormIDDescription:
                    '[zh-hans] By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: '[zh-hans] Out-of-pocket expense',
                customFormIDNonReimbursable: '[zh-hans] Company card expense',
                exportReportsTo: {
                    label: '[zh-hans] Expense report approval level',
                    description:
                        '[zh-hans] Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: '[zh-hans] NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '[zh-hans] Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '[zh-hans] Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '[zh-hans] Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: '[zh-hans] When to Export',
                    description: '[zh-hans] Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[zh-hans] Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[zh-hans] Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: '[zh-hans] Vendor bill approval level',
                    description: '[zh-hans] Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: '[zh-hans] NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '[zh-hans] Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '[zh-hans] Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: '[zh-hans] Journal entry approval level',
                    description:
                        '[zh-hans] Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: '[zh-hans] NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '[zh-hans] Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '[zh-hans] Approved for posting',
                    },
                },
                error: {
                    customFormID: '[zh-hans] Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: '[zh-hans] No accounts found',
            noAccountsFoundDescription: '[zh-hans] Please add the account in NetSuite and sync the connection again',
            noVendorsFound: '[zh-hans] No vendors found',
            noVendorsFoundDescription: '[zh-hans] Please add vendors in NetSuite and sync the connection again',
            noItemsFound: '[zh-hans] No invoice items found',
            noItemsFoundDescription: '[zh-hans] Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: '[zh-hans] No subsidiaries found',
            noSubsidiariesFoundDescription: '[zh-hans] Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: '[zh-hans] NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: '[zh-hans] Install the Expensify bundle',
                        description: '[zh-hans] In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: '[zh-hans] Enable token-based authentication',
                        description: '[zh-hans] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: '[zh-hans] Enable SOAP web services',
                        description: '[zh-hans] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: '[zh-hans] Create an access token',
                        description:
                            '[zh-hans] In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: '[zh-hans] Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: '[zh-hans] NetSuite Account ID',
                            netSuiteTokenID: '[zh-hans] Token ID',
                            netSuiteTokenSecret: '[zh-hans] Token Secret',
                        },
                        netSuiteAccountIDDescription: '[zh-hans] In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: '[zh-hans] Expense categories',
                expenseCategoriesDescription: '[zh-hans] Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: '[zh-hans] Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: '[zh-hans] Departments',
                        subtitle: '[zh-hans] Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: '[zh-hans] Classes',
                        subtitle: '[zh-hans] Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: '[zh-hans] Locations',
                        subtitle: '[zh-hans] Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: '[zh-hans] Customers/projects',
                    subtitle: '[zh-hans] Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: '[zh-hans] Import customers',
                    importJobs: '[zh-hans] Import projects',
                    customers: '[zh-hans] customers',
                    jobs: '[zh-hans] projects',
                    label: (importFields: string[], importType: string) => `${importFields.join('[zh-hans]  and ')}, ${importType}`,
                },
                importTaxDescription: '[zh-hans] Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: '[zh-hans] Choose an option below:',
                    label: (importedTypes: string[]) => `[zh-hans] Imported as ${importedTypes.join('[zh-hans]  and ')}`,
                    requiredFieldError: (fieldName: string) => `[zh-hans] Please enter the ${fieldName}`,
                    customSegments: {
                        title: '[zh-hans] Custom segments/records',
                        addText: '[zh-hans] Add custom segment/record',
                        recordTitle: '[zh-hans] Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '[zh-hans] View detailed instructions',
                        helpText: '[zh-hans]  on configuring custom segments/records.',
                        emptyTitle: '[zh-hans] Add a custom segment or custom record',
                        fields: {
                            segmentName: '[zh-hans] Name',
                            internalID: '[zh-hans] Internal ID',
                            scriptID: '[zh-hans] Script ID',
                            customRecordScriptID: '[zh-hans] Transaction column ID',
                            mapping: '[zh-hans] Displayed as',
                        },
                        removeTitle: '[zh-hans] Remove custom segment/record',
                        removePrompt: '[zh-hans] Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: '[zh-hans] custom segment name',
                            customRecordName: '[zh-hans] custom record name',
                            segmentTitle: '[zh-hans] Custom segment',
                            customSegmentAddTitle: '[zh-hans] Add custom segment',
                            customRecordAddTitle: '[zh-hans] Add custom record',
                            recordTitle: '[zh-hans] Custom record',
                            segmentRecordType: '[zh-hans] Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "[zh-hans] What's the custom segment name?",
                            customRecordNameTitle: "[zh-hans] What's the custom record name?",
                            customSegmentNameFooter: `[zh-hans] You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `[zh-hans] You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "[zh-hans] What's the internal ID?",
                            customSegmentInternalIDFooter: `[zh-hans] First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*

You can find custom segment internal IDs in NetSuite under:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the hyperlink next to *Custom Record Type*.
4. Find the internal ID in the table at the bottom.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `[zh-hans] You can find custom record internal IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the internal ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "[zh-hans] What's the script ID?",
                            customSegmentScriptIDFooter: `[zh-hans] You can find custom segment script IDs in NetSuite under: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the *Application and Sourcing* tab near the bottom, then:
    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.
    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "[zh-hans] What's the transaction column ID?",
                            customRecordScriptIDFooter: `[zh-hans] You can find custom record script IDs in NetSuite under:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the script ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '[zh-hans] How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: '[zh-hans] How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `[zh-hans] A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: '[zh-hans] Custom lists',
                        addText: '[zh-hans] Add custom list',
                        recordTitle: '[zh-hans] Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '[zh-hans] View detailed instructions',
                        helpText: '[zh-hans]  on configuring custom lists.',
                        emptyTitle: '[zh-hans] Add a custom list',
                        fields: {
                            listName: '[zh-hans] Name',
                            internalID: '[zh-hans] Internal ID',
                            transactionFieldID: '[zh-hans] Transaction field ID',
                            mapping: '[zh-hans] Displayed as',
                        },
                        removeTitle: '[zh-hans] Remove custom list',
                        removePrompt: '[zh-hans] Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: '[zh-hans] Choose a custom list',
                            transactionFieldIDTitle: "[zh-hans] What's the transaction field ID?",
                            transactionFieldIDFooter: `[zh-hans] You can find transaction field IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom list.
3. Find the transaction field ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '[zh-hans] How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `[zh-hans] A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: '[zh-hans] NetSuite employee default',
                        description: '[zh-hans] Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `[zh-hans] If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '[zh-hans] Tags',
                        description: '[zh-hans] Line-item level',
                        footerContent: (importField: string) => `[zh-hans] ${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '[zh-hans] Report fields',
                        description: '[zh-hans] Report level',
                        footerContent: (importField: string) => `[zh-hans] ${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: '[zh-hans] Sage Intacct setup',
            prerequisitesTitle: '[zh-hans] Before you connect...',
            downloadExpensifyPackage: '[zh-hans] Download the Expensify package for Sage Intacct',
            followSteps: '[zh-hans] Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: '[zh-hans] Enter your Sage Intacct credentials',
            entity: '[zh-hans] Entity',
            employeeDefault: '[zh-hans] Sage Intacct employee default',
            employeeDefaultDescription: "[zh-hans] The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "[zh-hans] Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "[zh-hans] Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: (mappingTitle: string) => `[zh-hans] Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: '[zh-hans] Expense types',
            expenseTypesDescription: '[zh-hans] Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: '[zh-hans] Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: '[zh-hans] Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: '[zh-hans] User-defined dimensions',
            addUserDefinedDimension: '[zh-hans] Add user-defined dimension',
            integrationName: '[zh-hans] Integration name',
            dimensionExists: '[zh-hans] A dimension with this name already exists.',
            removeDimension: '[zh-hans] Remove user-defined dimension',
            removeDimensionPrompt: '[zh-hans] Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: '[zh-hans] User-defined dimension',
            addAUserDefinedDimension: '[zh-hans] Add a user-defined dimension',
            detailedInstructionsLink: '[zh-hans] View detailed instructions',
            detailedInstructionsRestOfSentence: '[zh-hans]  on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '[zh-hans] 1 UDD added',
                other: (count: number) => `[zh-hans] ${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '[zh-hans] departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '[zh-hans] classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '[zh-hans] locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '[zh-hans] customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '[zh-hans] projects (jobs)';
                    default:
                        return '[zh-hans] mappings';
                }
            },
        },
        type: {
            free: '[zh-hans] Free',
            control: '[zh-hans] Control',
            collect: '[zh-hans] Collect',
        },
        companyCards: {
            addCards: '[zh-hans] Add cards',
            selectCards: '[zh-hans] Select cards',
            fromOtherWorkspaces: '[zh-hans] From other workspaces',
            addWorkEmail: '[zh-hans] Add your work email',
            addWorkEmailDescription: '[zh-hans] Please add your work email in order to use existing feeds from other workspaces.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: "[zh-hans] Couldn't load card feeds",
                workspaceFeedsCouldNotBeLoadedMessage: '[zh-hans] An error occurred while loading workspace card feeds. Please try again or contact your administrator.',
                feedCouldNotBeLoadedTitle: "[zh-hans] Couldn't load this feed",
                feedCouldNotBeLoadedMessage: '[zh-hans] An error occurred while loading this feed. Please try again or contact your administrator.',
                tryAgain: '[zh-hans] Try again',
            },
            addNewCard: {
                other: '[zh-hans] Other',
                fileImport: '[zh-hans] Import transactions from file',
                createFileFeedHelpText: `[zh-hans] <muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: '[zh-hans] Company card layout name',
                cardLayoutNameRequired: '[zh-hans] The Company card layout name is required',
                useAdvancedFields: '[zh-hans] Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: '[zh-hans] American Express Corporate Cards',
                    cdf: '[zh-hans] Mastercard Commercial Cards',
                    vcf: '[zh-hans] Visa Commercial Cards',
                    stripe: '[zh-hans] Stripe Cards',
                },
                yourCardProvider: `[zh-hans] Who's your card provider?`,
                whoIsYourBankAccount: '[zh-hans] Who’s your bank?',
                whereIsYourBankLocated: '[zh-hans] Where’s your bank located?',
                howDoYouWantToConnect: '[zh-hans] How do you want to connect to your bank?',
                learnMoreAboutOptions: `[zh-hans] <muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: '[zh-hans] Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `[zh-hans] Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: '[zh-hans] The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `[zh-hans] Enable your ${provider} feed`,
                    heading:
                        '[zh-hans] We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: '[zh-hans] We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: '[zh-hans] We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `[zh-hans] 1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.

2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `[zh-hans] 1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.

2. Once the feed is enabled, Amex will send you a production letter.

3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `[zh-hans] 1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.

 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `[zh-hans] 1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Under Product Integrations, click Enable next to Expensify.

3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: '[zh-hans] What bank issues these cards?',
                enterNameOfBank: '[zh-hans] Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: '[zh-hans] What are the Visa feed details?',
                        processorLabel: '[zh-hans] Processor ID',
                        bankLabel: '[zh-hans] Financial institution (bank) ID',
                        companyLabel: '[zh-hans] Company ID',
                        helpLabel: '[zh-hans] Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `[zh-hans] What's the Amex delivery file name?`,
                        fileNameLabel: '[zh-hans] Delivery file name',
                        helpLabel: '[zh-hans] Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `[zh-hans] What's the Mastercard distribution ID?`,
                        distributionLabel: '[zh-hans] Distribution ID',
                        helpLabel: '[zh-hans] Where do I find the distribution ID?',
                    },
                },
                amexCorporate: '[zh-hans] Select this if the front of your cards say “Corporate”',
                amexBusiness: '[zh-hans] Select this if the front of your cards say “Business”',
                amexPersonal: '[zh-hans] Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: '[zh-hans] Please select a card provider before continuing',
                    pleaseSelectBankAccount: '[zh-hans] Please select a bank account before continuing',
                    pleaseSelectBank: '[zh-hans] Please select a bank before continuing',
                    pleaseSelectCountry: '[zh-hans] Please select a country before continuing',
                    pleaseSelectFeedType: '[zh-hans] Please select a feed type before continuing',
                },
                exitModal: {
                    title: '[zh-hans] Something not working?',
                    prompt: "[zh-hans] We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: '[zh-hans] Report issue',
                    cancelText: '[zh-hans] Skip',
                },
                csvColumns: {
                    cardNumber: '[zh-hans] Card number',
                    postedDate: '[zh-hans] Date',
                    merchant: '[zh-hans] Merchant',
                    amount: '[zh-hans] Amount',
                    currency: '[zh-hans] Currency',
                    ignore: '[zh-hans] Ignore',
                    originalTransactionDate: '[zh-hans] Original transaction date',
                    originalAmount: '[zh-hans] Original amount',
                    originalCurrency: '[zh-hans] Original currency',
                    comment: '[zh-hans] Comment',
                    category: '[zh-hans] Category',
                    tag: '[zh-hans] Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `[zh-hans] Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `[zh-hans] Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '[zh-hans] Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '[zh-hans] Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '[zh-hans] Custom day of month',
            },
            assign: '[zh-hans] Assign',
            assignCard: '[zh-hans] Assign card',
            findCard: '[zh-hans] Find card',
            cardNumber: '[zh-hans] Card number',
            commercialFeed: '[zh-hans] Commercial feed',
            feedName: (feedName: string) => `[zh-hans] ${feedName} cards`,
            deletedFeed: '[zh-hans] Deleted feed',
            deletedCard: '[zh-hans] Deleted card',
            directFeed: '[zh-hans] Direct feed',
            whoNeedsCardAssigned: '[zh-hans] Who needs a card assigned?',
            chooseTheCardholder: '[zh-hans] Choose the cardholder',
            chooseCard: '[zh-hans] Choose a card',
            chooseCardFor: (assignee: string) =>
                `[zh-hans] Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: '[zh-hans] No active cards on this feed',
            somethingMightBeBroken:
                '[zh-hans] <muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: '[zh-hans] Choose a transaction start date',
            startDateDescription: "[zh-hans] Choose your import start date. We'll sync all transactions from this date onwards.",
            editStartDateDescription: "[zh-hans] Choose a new transaction start date. We'll sync all transactions from that date onwards, excluding those we already imported.",
            fromTheBeginning: '[zh-hans] From the beginning',
            customStartDate: '[zh-hans] Custom start date',
            customCloseDate: '[zh-hans] Custom close date',
            letsDoubleCheck: "[zh-hans] Let's double check that everything looks right.",
            confirmationDescription: "[zh-hans] We'll begin importing transactions immediately.",
            card: '[zh-hans] Card',
            cardName: '[zh-hans] Card name',
            brokenConnectionError: '[zh-hans] <rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `[zh-hans] assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '[zh-hans] company card',
            chooseCardFeed: '[zh-hans] Choose card feed',
            ukRegulation:
                '[zh-hans] Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: '[zh-hans] Card assignment failed.',
            unassignCardFailedError: '[zh-hans] Card unassignment failed.',
            cardAlreadyAssignedError: '[zh-hans] This card is already assigned to a user in another workspace.',
            importTransactions: {
                title: '[zh-hans] Import transactions from file',
                description: '[zh-hans] Please adjust the settings for your file that will be applied on import.',
                cardDisplayName: '[zh-hans] Card display name',
                currency: '[zh-hans] Currency',
                transactionsAreReimbursable: '[zh-hans] Transactions are reimbursable',
                flipAmountSign: '[zh-hans] Flip amount sign',
                importButton: '[zh-hans] Import transactions',
            },
            assignNewCards: {
                title: '[zh-hans] Assign new cards',
                description: '[zh-hans] Get the latest cards to assign from your bank',
            },
        },
        expensifyCard: {
            issueAndManageCards: '[zh-hans] Issue and manage your Expensify Cards',
            getStartedIssuing: '[zh-hans] Get started by issuing your first virtual or physical card.',
            verificationInProgress: '[zh-hans] Verification in progress...',
            verifyingTheDetails: "[zh-hans] We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                '[zh-hans] The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                '[zh-hans] Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: '[zh-hans] Issue card',
            findCard: '[zh-hans] Find card',
            newCard: '[zh-hans] New card',
            name: '[zh-hans] Name',
            lastFour: '[zh-hans] Last 4',
            limit: '[zh-hans] Limit',
            currentBalance: '[zh-hans] Current balance',
            currentBalanceDescription: '[zh-hans] Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: (settlementDate: string) => `[zh-hans] Balance will be settled on ${settlementDate}`,
            settleBalance: '[zh-hans] Settle balance',
            cardLimit: '[zh-hans] Card limit',
            remainingLimit: '[zh-hans] Remaining limit',
            requestLimitIncrease: '[zh-hans] Request limit increase',
            remainingLimitDescription:
                '[zh-hans] We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: '[zh-hans] Cash back',
            earnedCashbackDescription: '[zh-hans] Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: '[zh-hans] Issue new card',
            finishSetup: '[zh-hans] Finish setup',
            chooseBankAccount: '[zh-hans] Choose bank account',
            chooseExistingBank: '[zh-hans] Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: '[zh-hans] Account ending in',
            addNewBankAccount: '[zh-hans] Add a new bank account',
            settlementAccount: '[zh-hans] Settlement account',
            settlementAccountDescription: '[zh-hans] Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `[zh-hans] Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: '[zh-hans] Settlement frequency',
            settlementFrequencyDescription: '[zh-hans] Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo:
                '[zh-hans] If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            frequency: {
                daily: '[zh-hans] Daily',
                monthly: '[zh-hans] Monthly',
            },
            cardDetails: '[zh-hans] Card details',
            cardPending: ({name}: {name: string}) => `[zh-hans] Card is currently pending and will be issued once ${name}'s account is validated.`,
            virtual: '[zh-hans] Virtual',
            physical: '[zh-hans] Physical',
            deactivate: '[zh-hans] Deactivate card',
            changeCardLimit: '[zh-hans] Change card limit',
            changeLimit: '[zh-hans] Change limit',
            smartLimitWarning: (limit: number | string) =>
                `[zh-hans] If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `[zh-hans] If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `[zh-hans] If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: '[zh-hans] Change card limit type',
            changeLimitType: '[zh-hans] Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `[zh-hans] If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `[zh-hans] If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: '[zh-hans] Add shipping details',
            issuedCard: (assignee: string) => `[zh-hans] issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `[zh-hans] issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: (assignee: string, link: string) => `[zh-hans] issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `[zh-hans] ${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `[zh-hans] ${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: (assignee: string, link: string) => `[zh-hans] ${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: '[zh-hans] card',
            replacementCard: '[zh-hans] replacement card',
            verifyingHeader: '[zh-hans] Verifying',
            bankAccountVerifiedHeader: '[zh-hans] Bank account verified',
            verifyingBankAccount: '[zh-hans] Verifying bank account...',
            verifyingBankAccountDescription: '[zh-hans] Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: '[zh-hans] Bank account verified!',
            bankAccountVerifiedDescription: '[zh-hans] You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: '[zh-hans] One more step...',
            oneMoreStepDescription: '[zh-hans] Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: '[zh-hans] Got it',
            goToConcierge: '[zh-hans] Go to Concierge',
        },
        categories: {
            deleteCategories: '[zh-hans] Delete categories',
            deleteCategoriesPrompt: '[zh-hans] Are you sure you want to delete these categories?',
            deleteCategory: '[zh-hans] Delete category',
            deleteCategoryPrompt: '[zh-hans] Are you sure you want to delete this category?',
            disableCategories: '[zh-hans] Disable categories',
            disableCategory: '[zh-hans] Disable category',
            enableCategories: '[zh-hans] Enable categories',
            enableCategory: '[zh-hans] Enable category',
            defaultSpendCategories: '[zh-hans] Default spend categories',
            spendCategoriesDescription: '[zh-hans] Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: '[zh-hans] An error occurred while deleting the category, please try again',
            categoryName: '[zh-hans] Category name',
            requiresCategory: '[zh-hans] Members must categorize all expenses',
            needCategoryForExportToIntegration: (connectionName: string) => `[zh-hans] All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: '[zh-hans] Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "[zh-hans] You haven't created any categories",
                subtitle: '[zh-hans] Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[zh-hans] <muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: '[zh-hans] An error occurred while updating the category, please try again',
            createFailureMessage: '[zh-hans] An error occurred while creating the category, please try again',
            addCategory: '[zh-hans] Add category',
            editCategory: '[zh-hans] Edit category',
            editCategories: '[zh-hans] Edit categories',
            findCategory: '[zh-hans] Find category',
            categoryRequiredError: '[zh-hans] Category name is required',
            existingCategoryError: '[zh-hans] A category with this name already exists',
            invalidCategoryName: '[zh-hans] Invalid category name',
            importedFromAccountingSoftware: '[zh-hans] The categories below are imported from your',
            payrollCode: '[zh-hans] Payroll code',
            updatePayrollCodeFailureMessage: '[zh-hans] An error occurred while updating the payroll code, please try again',
            glCode: '[zh-hans] GL code',
            updateGLCodeFailureMessage: '[zh-hans] An error occurred while updating the GL code, please try again',
            importCategories: '[zh-hans] Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: '[zh-hans] Cannot delete or disable all categories',
                description: `[zh-hans] At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: '[zh-hans] Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: '[zh-hans] Spend',
                subtitle: '[zh-hans] Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: '[zh-hans] Manage',
                subtitle: '[zh-hans] Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: '[zh-hans] Earn',
                subtitle: '[zh-hans] Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: '[zh-hans] Organize',
                subtitle: '[zh-hans] Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: '[zh-hans] Integrate',
                subtitle: '[zh-hans] Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: '[zh-hans] Distance rates',
                subtitle: '[zh-hans] Add, update, and enforce rates.',
            },
            perDiem: {
                title: '[zh-hans] Per diem',
                subtitle: '[zh-hans] Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: '[zh-hans] Travel',
                subtitle: '[zh-hans] Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: '[zh-hans] Get started with Expensify Travel',
                    subtitle: "[zh-hans] We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "[zh-hans] Let's go",
                },
                reviewingRequest: {
                    title: "[zh-hans] Pack your bags, we've got your request...",
                    subtitle: "[zh-hans] We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: '[zh-hans] Request sent',
                },
                bookOrManageYourTrip: {
                    title: '[zh-hans] Travel booking',
                    subtitle: "[zh-hans] Congrats! You're all set to book and manage travel on this workspace.",
                    ctaText: '[zh-hans] Manage travel',
                },
                settings: {
                    autoAddTripName: {
                        title: '[zh-hans] Add trip names to expenses',
                        subtitle: '[zh-hans] Automatically add trip names to expense descriptions for travel booked in Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '[zh-hans] Travel booking',
                        subtitle: "[zh-hans] Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: '[zh-hans] Manage travel',
                    },
                    centralInvoicingSection: {
                        title: '[zh-hans] Central invoicing',
                        subtitle: '[zh-hans] Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: '[zh-hans] Learn how.',
                        subsections: {
                            currentTravelSpendLabel: '[zh-hans] Current travel spend',
                            currentTravelSpendPaymentQueued: (amount: string) => `[zh-hans] Payment of ${amount} is queued and will be processed soon.`,
                            currentTravelSpendCta: '[zh-hans] Pay balance',
                            currentTravelLimitLabel: '[zh-hans] Current travel limit',
                            settlementAccountLabel: '[zh-hans] Settlement account',
                            settlementFrequencyLabel: '[zh-hans] Settlement frequency',
                            settlementFrequencyDescription: '[zh-hans] How often Expensify will pull from your business bank account to settle recent Expensify Travel transactions.',
                            monthlySpendLimitLabel: '[zh-hans] Monthly spend limit per member',
                            monthlySpendLimitDescription: '[zh-hans] The maximum amount each member can spend on travel per month.',
                            reduceLimitTitle: '[zh-hans] Reduce travel spend limit?',
                            reduceLimitWarning:
                                '[zh-hans] If you reduce the limit, members who have already spent more than this amount will be unable to make new travel bookings until next month.',
                            provisioningError:
                                "[zh-hans] We weren't able to provision some of the members of your workspace for central invoicing. Please try again later or reach out to Concierge for assistance.",
                        },
                    },
                    disableModal: {
                        title: '[zh-hans] Turn off Travel Invoicing?',
                        body: '[zh-hans] Upcoming hotel and car rental reservations may need to be re-booked with a different payment method to avoid cancellation.',
                        confirm: '[zh-hans] Turn off',
                    },
                    outstandingBalanceModal: {
                        title: "[zh-hans] Can't turn off Travel Invoicing",
                        body: '[zh-hans] You still have an outstanding travel balance. Please pay your balance first.',
                        confirm: '[zh-hans] Got it',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `[zh-hans] Pay balance of ${amount}?`,
                        body: '[zh-hans] The payment will be queued and processed shortly after. This action cannot be undone once started.',
                    },
                    exportToPDF: '[zh-hans] Export to PDF',
                    exportToCSV: '[zh-hans] Export to CSV',
                    selectDateRangeError: '[zh-hans] Please select a date range to export',
                    invalidDateRangeError: '[zh-hans] The start date must be before the end date',
                    enabled: '[zh-hans] Central Invoicing enabled!',
                    enabledDescription: '[zh-hans] All travel spend on this workspace will now be centralized in a monthly invoice.',
                },
                personalDetailsDescription: '[zh-hans] In order to book travel, please enter your legal name as it appears on your government-issued ID.',
            },
            expensifyCard: {
                title: '[zh-hans] Expensify Card',
                subtitle: '[zh-hans] Gain insights and control over spend.',
                disableCardTitle: '[zh-hans] Disable Expensify Card',
                disableCardPrompt: '[zh-hans] You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: '[zh-hans] Chat with Concierge',
                feed: {
                    title: '[zh-hans] Get the Expensify Card',
                    subTitle: '[zh-hans] Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: '[zh-hans] Cash back on every US purchase',
                        unlimited: '[zh-hans] Unlimited virtual cards',
                        spend: '[zh-hans] Spend controls and custom limits',
                    },
                    ctaTitle: '[zh-hans] Issue new card',
                },
            },
            companyCards: {
                title: '[zh-hans] Company cards',
                subtitle: '[zh-hans] Connect the cards you already have.',
                feed: {
                    title: '[zh-hans] Bring your own cards (BYOC)',
                    subtitle: '[zh-hans] Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: '[zh-hans] Connect cards from 10,000+ banks',
                        assignCards: '[zh-hans] Link your team’s existing cards',
                        automaticImport: '[zh-hans] We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: '[zh-hans] Bank connection issue',
                connectWithPlaid: '[zh-hans] connect via Plaid',
                connectWithExpensifyCard: '[zh-hans] try the Expensify Card.',
                bankConnectionDescription: `[zh-hans] Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: '[zh-hans] Disable company cards',
                disableCardPrompt: '[zh-hans] You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: '[zh-hans] Chat with Concierge',
                cardDetails: '[zh-hans] Card details',
                cardNumber: '[zh-hans] Card number',
                cardholder: '[zh-hans] Cardholder',
                cardName: '[zh-hans] Card name',
                allCards: '[zh-hans] All cards',
                assignedCards: '[zh-hans] Assigned',
                unassignedCards: '[zh-hans] Unassigned',
                integrationExport: (integration: string, type?: string) =>
                    integration && type ? `[zh-hans] ${integration} ${type.toLowerCase()} export` : `[zh-hans] ${integration} export`,
                integrationExportTitleXero: (integration: string) => `[zh-hans] Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `[zh-hans] Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: '[zh-hans] Last updated',
                transactionStartDate: '[zh-hans] Transaction start date',
                updateCard: '[zh-hans] Update card',
                unassignCard: '[zh-hans] Unassign card',
                unassign: '[zh-hans] Unassign',
                unassignCardDescription: '[zh-hans] Unassigning this card will delete all unsubmitted transactions.',
                assignCard: '[zh-hans] Assign card',
                removeCard: '[zh-hans] Remove card',
                remove: '[zh-hans] Remove',
                removeCardDescription: '[zh-hans] Removing this card will delete all unsubmitted transactions.',
                cardFeedName: '[zh-hans] Card feed name',
                cardFeedNameDescription: '[zh-hans] Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: '[zh-hans] Delete transactions',
                cardFeedTransactionDescription: '[zh-hans] Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: '[zh-hans] Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: '[zh-hans] Allow deleting transactions',
                removeCardFeed: '[zh-hans] Remove card feed',
                removeCardFeedTitle: (feedName: string) => `[zh-hans] Remove ${feedName} feed`,
                removeCardFeedDescription: '[zh-hans] Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: '[zh-hans] Card feed name is required',
                    statementCloseDateRequired: '[zh-hans] Please select a statement close date.',
                },
                corporate: '[zh-hans] Restrict deleting transactions',
                personal: '[zh-hans] Allow deleting transactions',
                setFeedNameDescription: '[zh-hans] Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: '[zh-hans] When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: '[zh-hans] No cards in this feed',
                emptyAddedFeedDescription: "[zh-hans] Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `[zh-hans] We're reviewing your request...`,
                pendingFeedDescription: `[zh-hans] We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '[zh-hans] Check your browser window',
                pendingBankDescription: (bankName: string) => `[zh-hans] Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: '[zh-hans] please click here',
                giveItNameInstruction: '[zh-hans] Give the card a name that sets it apart from others.',
                updating: '[zh-hans] Updating...',
                neverUpdated: '[zh-hans] Never',
                noAccountsFound: '[zh-hans] No accounts found',
                defaultCard: '[zh-hans] Default card',
                downgradeTitle: `[zh-hans] Can't downgrade workspace`,
                downgradeSubTitle: `[zh-hans] This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `[zh-hans] Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: '[zh-hans] Get the Expensify Card',
                expensifyCardBannerSubtitle: '[zh-hans] Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: '[zh-hans] Learn more',
                statementCloseDateTitle: '[zh-hans] Statement close date',
                statementCloseDateDescription: '[zh-hans] Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: '[zh-hans] Workflows',
                subtitle: '[zh-hans] Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    '[zh-hans] Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: '[zh-hans] Invoices',
                subtitle: '[zh-hans] Send and receive invoices.',
            },
            categories: {
                title: '[zh-hans] Categories',
                subtitle: '[zh-hans] Track and organize spend.',
            },
            tags: {
                title: '[zh-hans] Tags',
                subtitle: '[zh-hans] Classify costs and track billable expenses.',
            },
            taxes: {
                title: '[zh-hans] Taxes',
                subtitle: '[zh-hans] Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: '[zh-hans] Report fields',
                subtitle: '[zh-hans] Set up custom fields for spend.',
            },
            connections: {
                title: '[zh-hans] Accounting',
                subtitle: '[zh-hans] Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: '[zh-hans] Receipt partners',
                subtitle: '[zh-hans] Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '[zh-hans] Not so fast...',
                featureEnabledText: "[zh-hans] To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "[zh-hans] To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: '[zh-hans] Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '[zh-hans] Disconnect Uber',
                disconnectText: '[zh-hans] To disable this feature, please disconnect the Uber for Business integration first.',
                description: '[zh-hans] Are you sure you want to disconnect this integration?',
                confirmText: '[zh-hans] Got it',
            },
            workflowWarningModal: {
                featureEnabledTitle: '[zh-hans] Not so fast...',
                featureEnabledText:
                    '[zh-hans] Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: '[zh-hans] Go to Expensify Cards',
            },
            rules: {
                title: '[zh-hans] Rules',
                subtitle: '[zh-hans] Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: '[zh-hans] Time',
                subtitle: '[zh-hans] Set a billable hourly rate for time tracking.',
                defaultHourlyRate: '[zh-hans] Default hourly rate',
            },
        },
        reports: {
            reportsCustomTitleExamples: '[zh-hans] Examples:',
            customReportNamesSubtitle: `[zh-hans] <muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: '[zh-hans] Default report title',
            customNameDescription: `[zh-hans] Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: '[zh-hans] Name',
            customNameEmailPhoneExample: '[zh-hans] Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: '[zh-hans] Report start date: {report:startdate}',
            customNameWorkspaceNameExample: '[zh-hans] Workspace name: {report:workspacename}',
            customNameReportIDExample: '[zh-hans] Report ID: {report:id}',
            customNameTotalExample: '[zh-hans] Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: '[zh-hans] Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: '[zh-hans] Add field',
            delete: '[zh-hans] Delete field',
            deleteFields: '[zh-hans] Delete fields',
            findReportField: '[zh-hans] Find report field',
            deleteConfirmation: '[zh-hans] Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: '[zh-hans] Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "[zh-hans] You haven't created any report fields",
                subtitle: '[zh-hans] Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "[zh-hans] Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: '[zh-hans] Disable report fields',
            disableReportFieldsConfirmation: '[zh-hans] Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: '[zh-hans] The report fields below are imported from your',
            textType: '[zh-hans] Text',
            dateType: '[zh-hans] Date',
            dropdownType: '[zh-hans] List',
            formulaType: '[zh-hans] Formula',
            textAlternateText: '[zh-hans] Add a field for free text input.',
            dateAlternateText: '[zh-hans] Add a calendar for date selection.',
            dropdownAlternateText: '[zh-hans] Add a list of options to choose from.',
            formulaAlternateText: '[zh-hans] Add a formula field.',
            nameInputSubtitle: '[zh-hans] Choose a name for the report field.',
            typeInputSubtitle: '[zh-hans] Choose what type of report field to use.',
            initialValueInputSubtitle: '[zh-hans] Enter a starting value to show in the report field.',
            listValuesInputSubtitle: '[zh-hans] These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: '[zh-hans] These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: '[zh-hans] Delete value',
            deleteValues: '[zh-hans] Delete values',
            disableValue: '[zh-hans] Disable value',
            disableValues: '[zh-hans] Disable values',
            enableValue: '[zh-hans] Enable value',
            enableValues: '[zh-hans] Enable values',
            emptyReportFieldsValues: {
                title: "[zh-hans] You haven't created any list values",
                subtitle: '[zh-hans] Add custom values to appear on reports.',
            },
            deleteValuePrompt: '[zh-hans] Are you sure you want to delete this list value?',
            deleteValuesPrompt: '[zh-hans] Are you sure you want to delete these list values?',
            listValueRequiredError: '[zh-hans] Please enter a list value name',
            existingListValueError: '[zh-hans] A list value with this name already exists',
            editValue: '[zh-hans] Edit value',
            listValues: '[zh-hans] List values',
            addValue: '[zh-hans] Add value',
            existingReportFieldNameError: '[zh-hans] A report field with this name already exists',
            reportFieldNameRequiredError: '[zh-hans] Please enter a report field name',
            reportFieldTypeRequiredError: '[zh-hans] Please choose a report field type',
            circularReferenceError: "[zh-hans] This field can't refer to itself. Please update.",
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `[zh-hans] Formula field ${value} not recognized`,
            reportFieldInitialValueRequiredError: '[zh-hans] Please choose a report field initial value',
            genericFailureMessage: '[zh-hans] An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: '[zh-hans] Tag name',
            requiresTag: '[zh-hans] Members must tag all expenses',
            trackBillable: '[zh-hans] Track billable expenses',
            customTagName: '[zh-hans] Custom tag name',
            enableTag: '[zh-hans] Enable tag',
            enableTags: '[zh-hans] Enable tags',
            requireTag: '[zh-hans] Require tag',
            requireTags: '[zh-hans] Require tags',
            notRequireTags: '[zh-hans] Don’t require',
            disableTag: '[zh-hans] Disable tag',
            disableTags: '[zh-hans] Disable tags',
            addTag: '[zh-hans] Add tag',
            editTag: '[zh-hans] Edit tag',
            editTags: '[zh-hans] Edit tags',
            findTag: '[zh-hans] Find tag',
            subtitle: '[zh-hans] Tags add more detailed ways to classify costs.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `[zh-hans] <muted-text>Tags add more detailed ways to classify costs. You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "[zh-hans] You haven't created any tags",
                subtitle: '[zh-hans] Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `[zh-hans] <muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[zh-hans] <muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: '[zh-hans] Delete tag',
            deleteTags: '[zh-hans] Delete tags',
            deleteTagConfirmation: '[zh-hans] Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: '[zh-hans] Are you sure that you want to delete these tags?',
            deleteFailureMessage: '[zh-hans] An error occurred while deleting the tag, please try again',
            tagRequiredError: '[zh-hans] Tag name is required',
            existingTagError: '[zh-hans] A tag with this name already exists',
            invalidTagNameError: '[zh-hans] Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: '[zh-hans] An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: '[zh-hans] Tags are managed in your',
            employeesSeeTagsAs: '[zh-hans] Employees see tags as',
            glCode: '[zh-hans] GL code',
            updateGLCodeFailureMessage: '[zh-hans] An error occurred while updating the GL code, please try again',
            tagRules: '[zh-hans] Tag rules',
            approverDescription: '[zh-hans] Approver',
            importTags: '[zh-hans] Import tags',
            importTagsSupportingText: '[zh-hans] Code your expenses with one type of tag or many.',
            configureMultiLevelTags: '[zh-hans] Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `[zh-hans] Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: '[zh-hans] The first row is the title for each tag list',
                independentTags: '[zh-hans] These are independent tags',
                glAdjacentColumn: '[zh-hans] There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: '[zh-hans] Single level of tags',
                multiLevel: '[zh-hans] Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '[zh-hans] Switch Tag Levels',
                prompt1: '[zh-hans] Switching tag levels will erase all current tags.',
                prompt2: '[zh-hans]  We suggest you first',
                prompt3: '[zh-hans]  download a backup',
                prompt4: '[zh-hans]  by exporting your tags.',
                prompt5: '[zh-hans]  Learn more',
                prompt6: '[zh-hans]  about tag levels.',
            },
            overrideMultiTagWarning: {
                title: '[zh-hans] Import tags',
                prompt1: '[zh-hans] Are you sure?',
                prompt2: '[zh-hans]  The existing tags will be overridden, but you can',
                prompt3: '[zh-hans]  download a backup',
                prompt4: '[zh-hans]  first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `[zh-hans] We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: '[zh-hans] Cannot delete or disable all tags',
                description: `[zh-hans] At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: '[zh-hans] Cannot make all tags optional',
                description: `[zh-hans] At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: '[zh-hans] Cannot make tag list required',
                description: '[zh-hans] You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '[zh-hans] 1 Tag',
                other: (count: number) => `[zh-hans] ${count} Tags`,
            }),
        },
        taxes: {
            subtitle: '[zh-hans] Add tax names, rates, and set defaults.',
            addRate: '[zh-hans] Add rate',
            workspaceDefault: '[zh-hans] Workspace currency default',
            foreignDefault: '[zh-hans] Foreign currency default',
            customTaxName: '[zh-hans] Custom tax name',
            value: '[zh-hans] Value',
            taxReclaimableOn: '[zh-hans] Tax reclaimable on',
            taxRate: '[zh-hans] Tax rate',
            findTaxRate: '[zh-hans] Find tax rate',
            error: {
                taxRateAlreadyExists: '[zh-hans] This tax name is already in use',
                taxCodeAlreadyExists: '[zh-hans] This tax code is already in use',
                valuePercentageRange: '[zh-hans] Please enter a valid percentage between 0 and 100',
                customNameRequired: '[zh-hans] Custom tax name is required',
                deleteFailureMessage: '[zh-hans] An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: '[zh-hans] An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: '[zh-hans] An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: '[zh-hans] The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: '[zh-hans] Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `[zh-hans] Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '[zh-hans] Delete rate',
                deleteMultiple: '[zh-hans] Delete rates',
                enable: '[zh-hans] Enable rate',
                disable: '[zh-hans] Disable rate',
                enableTaxRates: () => ({
                    one: '[zh-hans] Enable rate',
                    other: '[zh-hans] Enable rates',
                }),
                disableTaxRates: () => ({
                    one: '[zh-hans] Disable rate',
                    other: '[zh-hans] Disable rates',
                }),
            },
            importedFromAccountingSoftware: '[zh-hans] The taxes below are imported from your',
            taxCode: '[zh-hans] Tax code',
            updateTaxCodeFailureMessage: '[zh-hans] An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: '[zh-hans] Name your new workspace',
            selectFeatures: '[zh-hans] Select features to copy',
            whichFeatures: '[zh-hans] Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '[zh-hans] \n\nDo you want to continue?',
            categories: '[zh-hans] categories and your auto-categorization rules',
            reimbursementAccount: '[zh-hans] reimbursement account',
            welcomeNote: '[zh-hans] Please start using my new workspace',
            delayedSubmission: '[zh-hans] delayed submission',
            merchantRules: '[zh-hans] Merchant rules',
            merchantRulesCount: () => ({
                one: '[zh-hans] 1 merchant rule',
                other: (count: number) => `[zh-hans] ${count} merchant rules`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `[zh-hans] You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: '[zh-hans] An error occurred while duplicating your new workspace. Please try again.',
        },
        emptyWorkspace: {
            title: '[zh-hans] No workspaces yet',
            subtitle: '[zh-hans] Create a workspace to manage your expenses, reimbursements, and company cards.',
            createAWorkspaceCTA: '[zh-hans] Get Started',
            features: {
                trackAndCollect: '[zh-hans] Track and collect receipts',
                reimbursements: '[zh-hans] Reimburse employees',
                companyCards: '[zh-hans] Manage company cards',
            },
            notFound: '[zh-hans] No workspace found',
            description: '[zh-hans] Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: '[zh-hans] New workspace',
            getTheExpensifyCardAndMore: '[zh-hans] Get the Expensify Card and more',
            confirmWorkspace: '[zh-hans] Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `[zh-hans] My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `[zh-hans] ${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '[zh-hans] An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `[zh-hans] Are you sure you want to remove ${memberName}?`,
                other: '[zh-hans] Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `[zh-hans] ${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '[zh-hans] Remove member',
                other: '[zh-hans] Remove members',
            }),
            findMember: '[zh-hans] Find member',
            removeWorkspaceMemberButtonTitle: '[zh-hans] Remove from workspace',
            removeGroupMemberButtonTitle: '[zh-hans] Remove from group',
            removeRoomMemberButtonTitle: '[zh-hans] Remove from chat',
            removeMemberPrompt: (memberName: string) => `[zh-hans] Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '[zh-hans] Remove member',
            transferOwner: '[zh-hans] Transfer owner',
            makeMember: () => ({
                one: '[zh-hans] Make member',
                other: '[zh-hans] Make members',
            }),
            makeAdmin: () => ({
                one: '[zh-hans] Make admin',
                other: '[zh-hans] Make admins',
            }),
            makeAuditor: () => ({
                one: '[zh-hans] Make auditor',
                other: '[zh-hans] Make auditors',
            }),
            selectAll: '[zh-hans] Select all',
            error: {
                genericAdd: '[zh-hans] There was a problem adding this workspace member',
                cannotRemove: "[zh-hans] You can't remove yourself or the workspace owner",
                genericRemove: '[zh-hans] There was a problem removing that workspace member',
            },
            addedWithPrimary: '[zh-hans] Some members were added with their primary logins.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `[zh-hans] Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `[zh-hans] Total workspace members: ${count}`,
            importMembers: '[zh-hans] Import members',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `[zh-hans] If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `[zh-hans] ${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `[zh-hans] You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[zh-hans] If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[zh-hans] If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `[zh-hans] ${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: '[zh-hans] Get started by issuing your first virtual or physical card.',
            issueCard: '[zh-hans] Issue card',
            issueNewCard: {
                whoNeedsCard: '[zh-hans] Who needs a card?',
                inviteNewMember: '[zh-hans] Invite new member',
                findMember: '[zh-hans] Find member',
                chooseCardType: '[zh-hans] Choose a card type',
                physicalCard: '[zh-hans] Physical card',
                physicalCardDescription: '[zh-hans] Great for the frequent spender',
                virtualCard: '[zh-hans] Virtual card',
                virtualCardDescription: '[zh-hans] Instant and flexible',
                chooseLimitType: '[zh-hans] Choose a limit type',
                smartLimit: '[zh-hans] Smart Limit',
                smartLimitDescription: '[zh-hans] Spend up to a certain amount before requiring approval',
                monthly: '[zh-hans] Monthly',
                monthlyDescription: '[zh-hans] Limit renews monthly',
                fixedAmount: '[zh-hans] Fixed amount',
                fixedAmountDescription: '[zh-hans] Spend until the limit is reached',
                setLimit: '[zh-hans] Set a limit',
                cardLimitError: '[zh-hans] Please enter an amount less than $21,474,836',
                giveItName: '[zh-hans] Give it a name',
                giveItNameInstruction: '[zh-hans] Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: '[zh-hans] Card name',
                letsDoubleCheck: '[zh-hans] Let’s double check that everything looks right.',
                willBeReadyToUse: '[zh-hans] This card will be ready to use immediately.',
                willBeReadyToShip: '[zh-hans] This card will be ready to ship immediately.',
                cardholder: '[zh-hans] Cardholder',
                cardType: '[zh-hans] Card type',
                limit: '[zh-hans] Limit',
                limitType: '[zh-hans] Limit type',
                disabledApprovalForSmartLimitError: '[zh-hans] Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
                singleUse: '[zh-hans] Single-use',
                singleUseDescription: '[zh-hans] Expires after one transaction',
                validFrom: '[zh-hans] Valid from',
                startDate: '[zh-hans] Start date',
                endDate: '[zh-hans] End date',
                noExpirationHint: "[zh-hans] A card without an expiration date won't expire",
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `[zh-hans] Valid from ${startDate} to ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `[zh-hans] ${startDate} to ${endDate}`,
                combineWithExpiration: '[zh-hans] Combine with expiration options for additional spend control',
                enterValidDate: '[zh-hans] Enter a valid date',
                expirationDate: '[zh-hans] Expiration date',
                limitAmount: '[zh-hans] Limit amount',
                setExpiryOptions: '[zh-hans] Set expiry options',
                setExpiryDate: '[zh-hans] Set expiry date',
                setExpiryDateDescription: '[zh-hans] Card will expire as listed on the card',
                amount: '[zh-hans] Amount',
            },
            deactivateCardModal: {
                deactivate: '[zh-hans] Deactivate',
                deactivateCard: '[zh-hans] Deactivate card',
                deactivateConfirmation: '[zh-hans] Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: '[zh-hans] settings',
            title: '[zh-hans] Connections',
            subtitle: '[zh-hans] Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: '[zh-hans] QuickBooks Online',
            qbd: '[zh-hans] QuickBooks Desktop',
            xero: '[zh-hans] Xero',
            netsuite: '[zh-hans] NetSuite',
            intacct: '[zh-hans] Sage Intacct',
            sap: '[zh-hans] SAP',
            oracle: '[zh-hans] Oracle',
            microsoftDynamics: '[zh-hans] Microsoft Dynamics',
            talkYourOnboardingSpecialist: '[zh-hans] Chat with your setup specialist.',
            talkYourAccountManager: '[zh-hans] Chat with your account manager.',
            talkToConcierge: '[zh-hans] Chat with Concierge.',
            needAnotherAccounting: '[zh-hans] Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '[zh-hans] QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '[zh-hans] Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '[zh-hans] NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '[zh-hans] Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `[zh-hans] There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '[zh-hans] Go to Expensify Classic to manage your settings.',
            setup: '[zh-hans] Connect',
            lastSync: (relativeDate: string) => `[zh-hans] Last synced ${relativeDate}`,
            notSync: '[zh-hans] Not synced',
            import: '[zh-hans] Import',
            export: '[zh-hans] Export',
            advanced: '[zh-hans] Advanced',
            other: '[zh-hans] Other',
            syncNow: '[zh-hans] Sync now',
            disconnect: '[zh-hans] Disconnect',
            reinstall: '[zh-hans] Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[zh-hans] integration';
                return `[zh-hans] Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) =>
                `[zh-hans] Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[zh-hans] accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "[zh-hans] Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "[zh-hans] Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "[zh-hans] Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "[zh-hans] Can't connect to QuickBooks Desktop";
                    default: {
                        return "[zh-hans] Can't connect to integration";
                    }
                }
            },
            accounts: '[zh-hans] Chart of accounts',
            taxes: '[zh-hans] Taxes',
            imported: '[zh-hans] Imported',
            notImported: '[zh-hans] Not imported',
            importAsCategory: '[zh-hans] Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '[zh-hans] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '[zh-hans] Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '[zh-hans] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '[zh-hans] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '[zh-hans] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '[zh-hans] Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: '[zh-hans] NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]
                        ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]
                        : '[zh-hans] this integration';
                return `[zh-hans] Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `[zh-hans] Are you sure you want to connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[zh-hans] this accounting integration'}? This will remove any existing accounting connections.`,
            enterCredentials: '[zh-hans] Enter your credentials',
            claimOffer: {
                badgeText: '[zh-hans] Offer available!',
                xero: {
                    headline: '[zh-hans] Get Xero free for 6 months!',
                    description: '[zh-hans] <muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: '[zh-hans] Connect to Xero',
                },
                uber: {
                    headerTitle: '[zh-hans] Uber for Business',
                    headline: '[zh-hans] Get 5% off Uber rides',
                    description: `[zh-hans] <muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: '[zh-hans] Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '[zh-hans] Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '[zh-hans] Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '[zh-hans] Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '[zh-hans] Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return '[zh-hans] Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return '[zh-hans] Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '[zh-hans] Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '[zh-hans] Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return '[zh-hans] Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return '[zh-hans] Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return '[zh-hans] Importing Xero data';
                        case 'startingImportQBO':
                            return '[zh-hans] Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '[zh-hans] Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return '[zh-hans] Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '[zh-hans] Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return '[zh-hans] Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '[zh-hans] Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '[zh-hans] Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return '[zh-hans] Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '[zh-hans] Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '[zh-hans] Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '[zh-hans] Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '[zh-hans] Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '[zh-hans] Updating report fields';
                        case 'jobDone':
                            return '[zh-hans] Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return '[zh-hans] Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return '[zh-hans] Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return '[zh-hans] Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return '[zh-hans] Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '[zh-hans] Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return '[zh-hans] Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return '[zh-hans] Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return '[zh-hans] Syncing tax rates';
                        case 'xeroCheckConnection':
                            return '[zh-hans] Checking Xero connection';
                        case 'xeroSyncTitle':
                            return '[zh-hans] Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return '[zh-hans] Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '[zh-hans] Importing customers';
                        case 'netSuiteSyncInitData':
                            return '[zh-hans] Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return '[zh-hans] Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return '[zh-hans] Importing items';
                        case 'netSuiteSyncData':
                            return '[zh-hans] Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return '[zh-hans] Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return '[zh-hans] Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return '[zh-hans] Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return '[zh-hans] Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return '[zh-hans] Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '[zh-hans] Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '[zh-hans] Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '[zh-hans] Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return '[zh-hans] Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return '[zh-hans] Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return '[zh-hans] Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '[zh-hans] Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '[zh-hans] Importing vendors';
                        case 'intacctCheckConnection':
                            return '[zh-hans] Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return '[zh-hans] Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return '[zh-hans] Importing Sage Intacct data';
                        default: {
                            return `[zh-hans] Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '[zh-hans] Preferred exporter',
            exportPreferredExporterNote:
                '[zh-hans] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[zh-hans] Once set, the preferred exporter will see reports for export in their account.',
            exportAs: '[zh-hans] Export as',
            exportOutOfPocket: '[zh-hans] Export out-of-pocket expenses as',
            exportCompanyCard: '[zh-hans] Export company card expenses as',
            exportDate: '[zh-hans] Export date',
            defaultVendor: '[zh-hans] Default vendor',
            autoSync: '[zh-hans] Auto-sync',
            autoSyncDescription: '[zh-hans] Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: '[zh-hans] Sync reimbursed reports',
            cardReconciliation: '[zh-hans] Card reconciliation',
            reconciliationAccount: '[zh-hans] Reconciliation account',
            continuousReconciliation: '[zh-hans] Continuous Reconciliation',
            saveHoursOnReconciliation:
                '[zh-hans] Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `[zh-hans] <muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '[zh-hans] Choose the bank account that your Expensify Card payments will be reconciled against.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `[zh-hans] Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        export: {
            notReadyHeading: '[zh-hans] Not ready to export',
            notReadyDescription: '[zh-hans] Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: '[zh-hans] Send invoice',
            sendFrom: '[zh-hans] Send from',
            invoicingDetails: '[zh-hans] Invoicing details',
            invoicingDetailsDescription: '[zh-hans] This info will appear on your invoices.',
            companyName: '[zh-hans] Company name',
            companyWebsite: '[zh-hans] Company website',
            paymentMethods: {
                personal: '[zh-hans] Personal',
                business: '[zh-hans] Business',
                chooseInvoiceMethod: '[zh-hans] Choose a payment method below:',
                payingAsIndividual: '[zh-hans] Paying as an individual',
                payingAsBusiness: '[zh-hans] Paying as a business',
            },
            invoiceBalance: '[zh-hans] Invoice balance',
            invoiceBalanceSubtitle: "[zh-hans] This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: '[zh-hans] Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: '[zh-hans] Invite member',
            members: '[zh-hans] Invite members',
            invitePeople: '[zh-hans] Invite new members',
            genericFailureMessage: '[zh-hans] An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `[zh-hans] Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '[zh-hans] user',
            users: '[zh-hans] users',
            invited: '[zh-hans] invited',
            removed: '[zh-hans] removed',
            to: '[zh-hans] to',
            from: '[zh-hans] from',
        },
        inviteMessage: {
            confirmDetails: '[zh-hans] Confirm details',
            inviteMessagePrompt: '[zh-hans] Make your invitation extra special by adding a message below!',
            personalMessagePrompt: '[zh-hans] Message',
            genericFailureMessage: '[zh-hans] An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: '[zh-hans] Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `[zh-hans] ${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '[zh-hans] Oops! Not so fast...',
            workspaceNeeds: '[zh-hans] A workspace needs at least one enabled distance rate.',
            distance: '[zh-hans] Distance',
            centrallyManage: '[zh-hans] Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: '[zh-hans] Rate',
            addRate: '[zh-hans] Add rate',
            findRate: '[zh-hans] Find rate',
            trackTax: '[zh-hans] Track tax',
            deleteRates: () => ({
                one: '[zh-hans] Delete rate',
                other: '[zh-hans] Delete rates',
            }),
            enableRates: () => ({
                one: '[zh-hans] Enable rate',
                other: '[zh-hans] Enable rates',
            }),
            disableRates: () => ({
                one: '[zh-hans] Disable rate',
                other: '[zh-hans] Disable rates',
            }),
            enableRate: '[zh-hans] Enable rate',
            status: '[zh-hans] Status',
            unit: '[zh-hans] Unit',
            taxFeatureNotEnabledMessage:
                '[zh-hans] <muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: '[zh-hans] Delete distance rate',
            areYouSureDelete: () => ({
                one: '[zh-hans] Are you sure you want to delete this rate?',
                other: '[zh-hans] Are you sure you want to delete these rates?',
            }),
            errors: {
                rateNameRequired: '[zh-hans] Rate name is required',
                existingRateName: '[zh-hans] A distance rate with this name already exists',
            },
        },
        editor: {
            descriptionInputLabel: '[zh-hans] Description',
            nameInputLabel: '[zh-hans] Name',
            typeInputLabel: '[zh-hans] Type',
            initialValueInputLabel: '[zh-hans] Initial value',
            nameInputHelpText: "[zh-hans] This is the name you'll see on your workspace.",
            nameIsRequiredError: "[zh-hans] You'll need to give your workspace a name",
            currencyInputLabel: '[zh-hans] Default currency',
            currencyInputHelpText: '[zh-hans] All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `[zh-hans] The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: '[zh-hans] Save',
            genericFailureMessage: '[zh-hans] An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: '[zh-hans] An error occurred uploading the avatar. Please try again.',
            addressContext: '[zh-hans] A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: '[zh-hans] Expense policy',
        },
        bankAccount: {
            continueWithSetup: '[zh-hans] Continue setup',
            youAreAlmostDone: "[zh-hans] You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: '[zh-hans] Streamline payments',
            connectBankAccountNote: "[zh-hans] Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: '[zh-hans] One more thing!',
            allSet: "[zh-hans] You're all set!",
            accountDescriptionWithCards: '[zh-hans] This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "[zh-hans] Let's finish in chat!",
            finishInChat: '[zh-hans] Finish in chat',
            almostDone: '[zh-hans] Almost done!',
            disconnectBankAccount: '[zh-hans] Disconnect bank account',
            startOver: '[zh-hans] Start over',
            updateDetails: '[zh-hans] Update details',
            yesDisconnectMyBankAccount: '[zh-hans] Yes, disconnect my bank account',
            yesStartOver: '[zh-hans] Yes, start over',
            disconnectYourBankAccount: (bankName: string) =>
                `[zh-hans] Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "[zh-hans] Starting over will clear the progress you've made so far.",
            areYouSure: '[zh-hans] Are you sure?',
            workspaceCurrency: '[zh-hans] Workspace currency',
            updateCurrencyPrompt:
                '[zh-hans] It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: '[zh-hans] Update to USD',
            updateWorkspaceCurrency: '[zh-hans] Update workspace currency',
            workspaceCurrencyNotSupported: '[zh-hans] Workspace currency not supported',
            yourWorkspace: `[zh-hans] Your workspace is set to an unsupported currency. View the <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: '[zh-hans] Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: '[zh-hans] Transfer owner',
            addPaymentCardTitle: '[zh-hans] Enter your payment card to transfer ownership',
            addPaymentCardButtonText: '[zh-hans] Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `[zh-hans] <muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: '[zh-hans] PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: '[zh-hans] Bank level encryption',
            addPaymentCardRedundant: '[zh-hans] Redundant infrastructure',
            addPaymentCardLearnMore: `[zh-hans] <muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: '[zh-hans] Outstanding balance',
            amountOwedButtonText: '[zh-hans] OK',
            amountOwedText: '[zh-hans] This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: '[zh-hans] Outstanding balance',
            ownerOwesAmountButtonText: '[zh-hans] Transfer balance',
            ownerOwesAmountText: (email: string, amount: string) => `[zh-hans] The account owning this workspace (${email}) has an outstanding balance from a previous month.

Do you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: '[zh-hans] Take over annual subscription',
            subscriptionButtonText: '[zh-hans] Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `[zh-hans] Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: '[zh-hans] Duplicate subscription alert',
            duplicateSubscriptionButtonText: '[zh-hans] Continue',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `[zh-hans] It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.

Click "Continue" if you only want to take over billing for the workspace ${workspaceName}.

If you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '[zh-hans] Cannot transfer ownership',
            hasFailedSettlementsButtonText: '[zh-hans] Got it',
            hasFailedSettlementsText: (email: string) =>
                `[zh-hans] You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '[zh-hans] Failed to clear balance',
            failedToClearBalanceButtonText: '[zh-hans] OK',
            failedToClearBalanceText: '[zh-hans] We were unable to clear the balance. Please try again later.',
            successTitle: '[zh-hans] Woohoo! All set.',
            successDescription: "[zh-hans] You're now the owner of this workspace.",
            errorTitle: '[zh-hans] Oops! Not so fast...',
            errorDescription: `[zh-hans] <muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '[zh-hans] Careful!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `[zh-hans] The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Are you sure you want to export them again?`,
            confirmText: '[zh-hans] Yes, export again',
            cancelText: '[zh-hans] Cancel',
        },
        upgrade: {
            reportFields: {
                title: '[zh-hans] Report fields',
                description: `[zh-hans] Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: '[zh-hans] NetSuite',
                description: `[zh-hans] Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '[zh-hans] Sage Intacct',
                description: `[zh-hans] Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: '[zh-hans] QuickBooks Desktop',
                description: `[zh-hans] Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '[zh-hans] Advanced Approvals',
                description: `[zh-hans] If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            categories: {
                title: '[zh-hans] Categories',
                description: '[zh-hans] Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: '[zh-hans] GL codes',
                description: `[zh-hans] Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '[zh-hans] GL & Payroll codes',
                description: `[zh-hans] Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: '[zh-hans] Tax codes',
                description: `[zh-hans] Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: '[zh-hans] Unlimited Company cards',
                description: `[zh-hans] Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            rules: {
                title: '[zh-hans] Rules',
                description: `[zh-hans] Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.

Require expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: '[zh-hans] Per diem',
                description:
                    '[zh-hans] Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            travel: {
                title: '[zh-hans] Travel',
                description:
                    '[zh-hans] Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            reports: {
                title: '[zh-hans] Reports',
                description: '[zh-hans] Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: '[zh-hans] Multi-level tags',
                description:
                    '[zh-hans] Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: '[zh-hans] Distance rates',
                description: '[zh-hans] Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: '[zh-hans] Auditor',
                description: '[zh-hans] Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '[zh-hans] Multiple approval levels',
                description: '[zh-hans] Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[zh-hans] <muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '[zh-hans] per active member per month.',
                perMember: '[zh-hans] per member per month.',
            },
            note: (subscriptionLink: string) =>
                `[zh-hans] <muted-text>Upgrade to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: '[zh-hans] Unlock this feature',
            completed: {
                headline: `[zh-hans] You've upgraded your workspace!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `[zh-hans] <centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `[zh-hans] You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `[zh-hans] You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `[zh-hans] You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: '[zh-hans] Got it, thanks',
                createdWorkspace: `[zh-hans] You've created a workspace!`,
            },
            commonFeatures: {
                title: '[zh-hans] Upgrade to the Control plan',
                note: '[zh-hans] Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `[zh-hans] <muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[zh-hans] per member per month.` : `[zh-hans] per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: '[zh-hans] Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: '[zh-hans] Smart expense rules',
                    benefit3: '[zh-hans] Multi-level approval workflows',
                    benefit4: '[zh-hans] Enhanced security controls',
                    toUpgrade: '[zh-hans] To upgrade, click',
                    selectWorkspace: '[zh-hans] select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `[zh-hans] Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '[zh-hans] Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '[zh-hans] Downgrade to Collect',
                note: "[zh-hans] You'll lose access to the following features",
                noteAndMore: '[zh-hans] and more:',
                benefits: {
                    important: '[zh-hans] IMPORTANT: ',
                    confirm: '[zh-hans] You\'ll need to change the "Plan type" of every workspace to "Collect" in order to secure the Collect rate.',
                    benefit1Label: '[zh-hans] ERP integrations',
                    benefit1: '[zh-hans] NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: '[zh-hans] HR integrations',
                    benefit2: '[zh-hans] Workday, Certinia',
                    benefit3Label: '[zh-hans] Security',
                    benefit3: '[zh-hans] SSO/SAML',
                    benefit4Label: '[zh-hans] Advanced',
                    benefit4: '[zh-hans] Smart expense rules, per diems, multi-level approvals, custom reporting, and budgeting',
                    headsUp: '[zh-hans] Heads up!',
                    multiWorkspaceNote: '[zh-hans] You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '[zh-hans] > select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: '[zh-hans] Your workspace has been downgraded',
                description: '[zh-hans] You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: '[zh-hans] Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: '[zh-hans] Pay & downgrade',
            headline: '[zh-hans] Your final payment',
            description1: (formattedAmount: string) => `[zh-hans] Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `[zh-hans] See your breakdown below for ${date}:`,
            subscription:
                '[zh-hans] Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: '[zh-hans] An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: '[zh-hans] Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `[zh-hans] Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `[zh-hans] Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "[zh-hans] You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: '[zh-hans] Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: '[zh-hans] Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: '[zh-hans] Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: '[zh-hans] Chat with your admin',
            chatInAdmins: '[zh-hans] Chat in #admins',
            addPaymentCard: '[zh-hans] Add payment card',
            goToSubscription: '[zh-hans] Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: '[zh-hans] Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `[zh-hans] <muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: '[zh-hans] Receipt required amount',
                receiptRequiredAmountDescription: '[zh-hans] Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `[zh-hans] Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: '[zh-hans] Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: '[zh-hans] Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `[zh-hans] Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: '[zh-hans] Max expense amount',
                maxExpenseAmountDescription: '[zh-hans] Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: '[zh-hans] Max age',
                maxExpenseAge: '[zh-hans] Max expense age',
                maxExpenseAgeDescription: '[zh-hans] Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '[zh-hans] 1 day',
                    other: (count: number) => `[zh-hans] ${count} days`,
                }),
                cashExpenseDefault: '[zh-hans] Cash expense default',
                cashExpenseDefaultDescription:
                    '[zh-hans] Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: '[zh-hans] Reimbursable',
                reimbursableDefaultDescription: '[zh-hans] Expenses are most often paid back to employees',
                nonReimbursableDefault: '[zh-hans] Non-reimbursable',
                nonReimbursableDefaultDescription: '[zh-hans] Expenses are occasionally paid back to employees',
                alwaysReimbursable: '[zh-hans] Always reimbursable',
                alwaysReimbursableDescription: '[zh-hans] Expenses are always paid back to employees',
                alwaysNonReimbursable: '[zh-hans] Always non-reimbursable',
                alwaysNonReimbursableDescription: '[zh-hans] Expenses are never paid back to employees',
                billableDefault: '[zh-hans] Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `[zh-hans] <muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: '[zh-hans] Billable',
                billableDescription: '[zh-hans] Expenses are most often re-billed to clients',
                nonBillable: '[zh-hans] Non-billable',
                nonBillableDescription: '[zh-hans] Expenses are occasionally re-billed to clients',
                eReceipts: '[zh-hans] eReceipts',
                eReceiptsHint: `[zh-hans] eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: '[zh-hans] Attendee tracking',
                attendeeTrackingHint: '[zh-hans] Track the per-person cost for every expense.',
                prohibitedDefaultDescription: '[zh-hans] Flag receipts with these line items for manual review.',
                prohibitedExpenses: '[zh-hans] Prohibited expenses',
                alcohol: '[zh-hans] Alcohol',
                hotelIncidentals: '[zh-hans] Hotel incidentals',
                gambling: '[zh-hans] Gambling',
                tobacco: '[zh-hans] Tobacco',
                adultEntertainment: '[zh-hans] Adult entertainment',
                requireCompanyCard: '[zh-hans] Require company cards for all purchases',
                requireCompanyCardDescription: '[zh-hans] Flag all cash spend, including mileage and per-diem expenses.',
                requireCompanyCardDisabledTooltip: '[zh-hans] Enable Company cards (under More features) to unlock.',
            },
            expenseReportRules: {
                title: '[zh-hans] Advanced',
                subtitle: '[zh-hans] Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: '[zh-hans] Prevent self-approvals',
                preventSelfApprovalsSubtitle: '[zh-hans] Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: '[zh-hans] Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: '[zh-hans] Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: '[zh-hans] Auto-approve reports with all expenses under',
                autoApproveReportsUnderDescription: '[zh-hans] Fully compliant expense reports where all expenses are under this amount will be automatically approved.',
                randomReportAuditTitle: '[zh-hans] Random report audit',
                randomReportAuditDescription: '[zh-hans] Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: '[zh-hans] Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: '[zh-hans] Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `[zh-hans] Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: '[zh-hans] Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: '[zh-hans] Auto-pay reports under',
                autoPayReportsUnderDescription: '[zh-hans] Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `[zh-hans] Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[zh-hans] Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: '[zh-hans] Merchant',
                subtitle: '[zh-hans] Set merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: '[zh-hans] Add merchant rule',
                findRule: '[zh-hans] Find merchant rule',
                addRuleTitle: '[zh-hans] Add rule',
                editRuleTitle: '[zh-hans] Edit rule',
                expensesWith: '[zh-hans] For expenses with:',
                expensesExactlyMatching: '[zh-hans] For expenses exactly matching:',
                applyUpdates: '[zh-hans] Apply these updates:',
                saveRule: '[zh-hans] Save rule',
                previewMatches: '[zh-hans] Preview matches',
                confirmError: '[zh-hans] Enter merchant and apply at least one update',
                confirmErrorMerchant: '[zh-hans] Please enter merchant',
                confirmErrorUpdate: '[zh-hans] Please apply at least one update',
                previewMatchesEmptyStateTitle: '[zh-hans] Nothing to show',
                previewMatchesEmptyStateSubtitle: '[zh-hans] No unsubmitted expenses match this rule.',
                deleteRule: '[zh-hans] Delete rule',
                deleteRuleConfirmation: '[zh-hans] Are you sure you want to delete this rule?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) =>
                    `[zh-hans] If merchant ${isExactMatch ? '[zh-hans] exactly matches' : '[zh-hans] contains'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `[zh-hans] Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `[zh-hans] Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `[zh-hans] Mark as  "${reimbursable ? '[zh-hans] reimbursable' : '[zh-hans] non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `[zh-hans] Mark as "${billable ? '[zh-hans] billable' : '[zh-hans] non-billable'}"`,
                matchType: '[zh-hans] Match type',
                matchTypeContains: '[zh-hans] Contains',
                matchTypeExact: '[zh-hans] Exactly matches',
                duplicateRuleTitle: '[zh-hans] Similar merchant rule already exists',
                duplicateRulePrompt: (merchantName: string) => `[zh-hans] Your existing rule for "${merchantName}" will take priority over this one. Save anyway?`,
                saveAnyway: '[zh-hans] Save anyway',
                applyToExistingUnsubmittedExpenses: '[zh-hans] Apply to existing unsubmitted expenses',
            },
            categoryRules: {
                title: '[zh-hans] Category rules',
                approver: '[zh-hans] Approver',
                requireDescription: '[zh-hans] Require description',
                requireFields: '[zh-hans] Require fields',
                requiredFieldsTitle: '[zh-hans] Required fields',
                requiredFieldsDescription: (categoryName: string) => `[zh-hans] This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: '[zh-hans] Require attendees',
                descriptionHint: '[zh-hans] Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `[zh-hans] Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: '[zh-hans] Hint',
                descriptionHintSubtitle: '[zh-hans] Pro-tip: The shorter the better!',
                maxAmount: '[zh-hans] Max amount',
                flagAmountsOver: '[zh-hans] Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `[zh-hans] Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: '[zh-hans] This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: '[zh-hans] Individual expense',
                    expenseSubtitle: '[zh-hans] Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: '[zh-hans] Category total',
                    dailySubtitle: '[zh-hans] Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: '[zh-hans] Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `[zh-hans] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[zh-hans] Never require receipts',
                    always: '[zh-hans] Always require receipts',
                },
                requireItemizedReceiptsOver: '[zh-hans] Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `[zh-hans] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[zh-hans] Never require itemized receipts',
                    always: '[zh-hans] Always require itemized receipts',
                },
                defaultTaxRate: '[zh-hans] Default tax rate',
                enableWorkflows: (moreFeaturesLink: string) => `[zh-hans] Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: '[zh-hans] Expense policy',
                cardSubtitle: "[zh-hans] Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
            },
            spendRules: {
                title: '[zh-hans] Spend',
                subtitle: '[zh-hans] Approve or decline Expensify Card transactions in realtime.',
                defaultRuleDescription: '[zh-hans] All cards',
                block: '[zh-hans] Block',
                defaultRuleTitle: '[zh-hans] Categories: Adult services, ATMs, gambling, money transfers',
                builtInProtectionModal: {
                    title: '[zh-hans] Expensify Cards offer built-in protection - always',
                    description: `[zh-hans] Expensify always declines these charges:

  • Adult services
  • ATMs
  • Gambling
  • Money transfers

Add more spend rules to protect company cash flow.`,
                },
                addSpendRule: '[zh-hans] Add spend rule',
                editRuleTitle: '[zh-hans] Edit rule',
                cardPageTitle: '[zh-hans] Card',
                cardsSectionTitle: '[zh-hans] Cards',
                chooseCards: '[zh-hans] Choose cards',
                saveRule: '[zh-hans] Save rule',
                deleteRule: '[zh-hans] Delete rule',
                deleteRuleConfirmation: '[zh-hans] Are you sure you want to delete this rule?',
                allow: '[zh-hans] Allow',
                spendRuleSectionTitle: '[zh-hans] Spend rule',
                restrictionType: '[zh-hans] Restriction type',
                restrictionTypeHelpAllow: "[zh-hans] Charges are approved if they match any merchant or category, and don't exceed a max amount.",
                restrictionTypeHelpBlock: '[zh-hans] Charges are declined if they match any merchant or category, or exceed a max amount.',
                addMerchant: '[zh-hans] Add merchant',
                merchantContains: '[zh-hans] Merchant contains',
                merchantExactlyMatches: '[zh-hans] Merchant exactly matches',
                noBlockedMerchants: '[zh-hans] No blocked merchants',
                addMerchantToBlockSpend: '[zh-hans] Add a merchant to block spend',
                noAllowedMerchants: '[zh-hans] No allowed merchants',
                addMerchantToAllowSpend: '[zh-hans] Add a merchant to allow spend',
                matchType: '[zh-hans] Match type',
                matchTypeContains: '[zh-hans] Contains',
                matchTypeExact: '[zh-hans] Matches exactly',
                spendCategory: '[zh-hans] Spend category',
                maxAmount: '[zh-hans] Max amount',
                maxAmountHelp: '[zh-hans] Any charge over this amount will be declined, regardless of merchant and spend category restrictions.',
                currencyMismatchTitle: '[zh-hans] Currency mismatch',
                currencyMismatchPrompt: '[zh-hans] To set a max amount, select cards that settle in the same currency.',
                reviewSelectedCards: '[zh-hans] Review selected cards',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => `[zh-hans] ${summary}, +${count} more`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '[zh-hans] Apply at least one spend rule to one card',
                confirmErrorCardRequired: '[zh-hans] Card is a required field',
                confirmErrorApplyAtLeastOneSpendRule: '[zh-hans] Apply at least one spend rule',
                categories: '[zh-hans] Categories',
                merchants: '[zh-hans] Merchants',
                noAvailableCards: '[zh-hans] All cards already have a rule',
                noAvailableCardsSubtitle: '[zh-hans] Edit an existing card rule to make changes',
                noCardsIssuedTitle: '[zh-hans] No Expensify cards issued',
                noCardsIssuedSubtitle: '[zh-hans] Issue Expensify cards to create spend rules',
                max: '[zh-hans] Max',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '[zh-hans] Airlines',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '[zh-hans] Alcohol and bars',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: '[zh-hans] Amazon and bookstores',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '[zh-hans] Automotive',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: '[zh-hans] Car rentals',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '[zh-hans] Dining',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '[zh-hans] Fuel and gas',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '[zh-hans] Government and non-profits',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '[zh-hans] Groceries',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: '[zh-hans] Gyms and fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '[zh-hans] Healthcare',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: '[zh-hans] Hotels',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: '[zh-hans] Internet and phone',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '[zh-hans] Office supplies',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '[zh-hans] Parking and tolls',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: '[zh-hans] Professional services',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '[zh-hans] Retail',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '[zh-hans] Shipping and delivery',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: '[zh-hans] Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '[zh-hans] Transit and rideshare',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '[zh-hans] Travel agencies',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '[zh-hans] Collect',
                    description: '[zh-hans] For teams looking to automate their processes.',
                },
                corporate: {
                    label: '[zh-hans] Control',
                    description: '[zh-hans] For organizations with advanced requirements.',
                },
            },
            description: "[zh-hans] Choose a plan that's right for you. For a detailed list of features and pricing, check out our",
            subscriptionLink: '[zh-hans] plan types and pricing help page',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `[zh-hans] You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `[zh-hans] You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: '[zh-hans] Subscriptions',
        },
    },
    getAssistancePage: {
        title: '[zh-hans] Get assistance',
        subtitle: "[zh-hans] We're here to clear your path to greatness!",
        description: '[zh-hans] Choose from the support options below:',
        chatWithConcierge: '[zh-hans] Chat with Concierge',
        scheduleSetupCall: '[zh-hans] Schedule a setup call',
        scheduleACall: '[zh-hans] Schedule call',
        questionMarkButtonTooltip: '[zh-hans] Get assistance from our team',
        exploreHelpDocs: '[zh-hans] Explore help docs',
        registerForWebinar: '[zh-hans] Register for webinar',
        onboardingHelp: '[zh-hans] Onboarding help',
    },
    emojiPicker: {
        emojiNotSelected: '[zh-hans] Emoji not selected',
        skinTonePickerLabel: '[zh-hans] Change default skin tone',
        headers: {
            frequentlyUsed: '[zh-hans] Frequently Used',
            smileysAndEmotion: '[zh-hans] Smileys & Emotion',
            peopleAndBody: '[zh-hans] People & Body',
            animalsAndNature: '[zh-hans] Animals & Nature',
            foodAndDrink: '[zh-hans] Food & Drinks',
            travelAndPlaces: '[zh-hans] Travel & Places',
            activities: '[zh-hans] Activities',
            objects: '[zh-hans] Objects',
            symbols: '[zh-hans] Symbols',
            flags: '[zh-hans] Flags',
        },
    },
    newRoomPage: {
        newRoom: '[zh-hans] New room',
        groupName: '[zh-hans] Group name',
        roomName: '[zh-hans] Room name',
        visibility: '[zh-hans] Visibility',
        restrictedDescription: '[zh-hans] People in your workspace can find this room',
        privateDescription: '[zh-hans] People invited to this room can find it',
        publicDescription: '[zh-hans] Anyone can find this room',
        public_announceDescription: '[zh-hans] Anyone can find this room',
        createRoom: '[zh-hans] Create room',
        roomAlreadyExistsError: '[zh-hans] A room with this name already exists',
        roomNameReservedError: (reservedName: string) => `[zh-hans] ${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '[zh-hans] Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: '[zh-hans] Please enter a room name',
        pleaseSelectWorkspace: '[zh-hans] Please select a workspace',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `[zh-hans] ${actor}renamed to "${newName}" (previously "${oldName}")` : `[zh-hans] ${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: (newName: string) => `[zh-hans] Room renamed to ${newName}`,
        social: '[zh-hans] social',
        selectAWorkspace: '[zh-hans] Select a workspace',
        growlMessageOnRenameError: '[zh-hans] Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: '[zh-hans] Workspace',
            private: '[zh-hans] Private',
            public: '[zh-hans] Public',
            public_announce: '[zh-hans] Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '[zh-hans] Submit and Close',
        submitAndApprove: '[zh-hans] Submit and Approve',
        advanced: '[zh-hans] ADVANCED',
        dynamicExternal: '[zh-hans] DYNAMIC_EXTERNAL',
        smartReport: '[zh-hans] SMARTREPORT',
        billcom: '[zh-hans] BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[zh-hans] set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[zh-hans] removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `[zh-hans] changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `[zh-hans] changed the company address to "${newAddress}" (previously "${previousAddress}")` : `[zh-hans] set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[zh-hans] added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[zh-hans] removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `[zh-hans] changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `[zh-hans] added the category "${categoryName}"`,
        deleteCategory: (categoryName: string) => `[zh-hans] removed the category "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `[zh-hans] ${oldValue ? '[zh-hans] disabled' : '[zh-hans] enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[zh-hans] added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[zh-hans] removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[zh-hans] changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[zh-hans] added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[zh-hans] removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[zh-hans] changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `[zh-hans] changed the "${categoryName}" category description to ${!oldValue ? '[zh-hans] required' : '[zh-hans] not required'} (previously ${!oldValue ? '[zh-hans] not required' : '[zh-hans] required'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `[zh-hans] added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `[zh-hans] removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `[zh-hans] changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[zh-hans] added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `[zh-hans] changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[zh-hans] updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `[zh-hans] changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `[zh-hans] updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `[zh-hans] changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `[zh-hans] renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `[zh-hans] removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }
            return !oldValue
                ? `[zh-hans] added the description hint "${newValue}" to the category "${categoryName}"`
                : `[zh-hans] changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategories: (count: number) => `[zh-hans] updated ${count} categories`,
        updateTagListName: (oldName: string, newName: string) => `[zh-hans] changed the tag list name to "${newName}" (previously "${oldName}")`,
        updateTagList: (tagListName: string) => `[zh-hans] updated tags on the list "${tagListName}"`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) =>
            `[zh-hans] changed tag list "${tagListsName}" to ${isRequired ? '[zh-hans] required' : '[zh-hans] not required'}`,
        importTags: '[zh-hans] imported tags from a spreadsheet',
        deletedAllTags: '[zh-hans] deleted all tags',
        addTag: (tagListName: string, tagName?: string) => `[zh-hans] added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `[zh-hans] updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `[zh-hans] removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `[zh-hans] removed "${count}" tags from the list "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `[zh-hans] updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `[zh-hans] updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `[zh-hans] changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `[zh-hans] ${newValue ? '[zh-hans] enabled' : '[zh-hans] disabled'} tax tracking on distance rates`,
        updateCustomUnitDefaultCategory: ({customUnitName, newValue, oldValue}: UpdatePolicyCustomUnitDefaultCategoryParams) =>
            `[zh-hans] changed the ${customUnitName} default category to "${newValue}" ${oldValue ? `[zh-hans] (previously "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `[zh-hans] imported rates for custom unit "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `[zh-hans] added a new ${customUnitName} rate "${rateName}"`,
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `[zh-hans] removed the "${customUnitName}" rate "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `[zh-hans] changed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${customUnitSubRateName}" ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `[zh-hans] removed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${removedSubRateName}"`,
        addedReportField: ({fieldType, fieldName, defaultValue}: AddedOrDeletedPolicyReportFieldParams) =>
            `[zh-hans] added ${fieldType} report field "${fieldName}"${defaultValue ? `[zh-hans]  with default value "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `[zh-hans] changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `[zh-hans] changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `[zh-hans] added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `[zh-hans] changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `[zh-hans] added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `[zh-hans] ${newValue ? '[zh-hans] enabled' : '[zh-hans] disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `[zh-hans] set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `[zh-hans] added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `[zh-hans] removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `[zh-hans] ${optionEnabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `[zh-hans] ${allEnabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} all options for the report field "${fieldName}" `;
            }
            return `[zh-hans] ${allEnabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? '[zh-hans] enabled' : '[zh-hans] disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `[zh-hans] removed ${fieldType} Report Field "${fieldName}"`,
        addedCardFeed: (feedName: string) => `[zh-hans] added card feed "${feedName}"`,
        removedCardFeed: (feedName: string) => `[zh-hans] removed card feed "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `[zh-hans] renamed card feed to "${newName}" (previously "${oldName}")`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[zh-hans] assigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[zh-hans] unassigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} cardholders to delete card transactions for card feed "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `[zh-hans] changed card feed "${feedName}" statement period end day${newValue ? `[zh-hans]  to "${newValue}"` : ''}${previousValue ? `[zh-hans]  (previously "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `[zh-hans] updated "Prevent self-approval" to "${newValue === 'true' ? '[zh-hans] Enabled' : '[zh-hans] Disabled'}" (previously "${oldValue === 'true' ? '[zh-hans] Enabled' : '[zh-hans] Disabled'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `[zh-hans] set the monthly report submission date to "${newValue}"`;
            }
            return `[zh-hans] updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `[zh-hans] updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `[zh-hans] updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `[zh-hans] turned "Enforce default report titles" ${value ? '[zh-hans] on' : '[zh-hans] off'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `[zh-hans] changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `[zh-hans] updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `[zh-hans] set the description of this workspace to "${newDescription}"`
                : `[zh-hans] updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('[zh-hans]  and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `[zh-hans] removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `[zh-hans] removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `[zh-hans] updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `[zh-hans] updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `[zh-hans] updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `[zh-hans] updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: '[zh-hans] upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `[zh-hans] This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: '[zh-hans] downgraded this workspace to the Collect plan',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `[zh-hans] changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `[zh-hans] changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        addBudget: ({frequency, entityName, entityType, shared, individual, notificationThreshold}: AddBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[zh-hans]  with notification threshold of "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `[zh-hans] added ${frequency} individual budget of "${individual}" and ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            if (typeof individual !== 'undefined') {
                return `[zh-hans] added ${frequency} individual budget of "${individual}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            return `[zh-hans] added ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
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
                changesList.push(`[zh-hans] changed budget frequency to "${newFrequency}" (previously "${oldFrequency}")`);
            }
            if (sharedChanged) {
                changesList.push(`[zh-hans] changed total workspace budget to "${newShared}" (previously "${oldShared}")`);
            }
            if (individualChanged) {
                changesList.push(`[zh-hans] changed individual budget to "${newIndividual}" (previously "${oldIndividual}")`);
            }
            if (thresholdChanged) {
                changesList.push(`[zh-hans] changed notification threshold to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `[zh-hans] updated budget for the ${entityType} "${entityName}"`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `[zh-hans] changed budget frequency for the ${entityType} "${entityName}" to "${newFrequency}" (previously "${oldFrequency}")`;
                }
                if (sharedChanged) {
                    return `[zh-hans] changed total workspace budget for the ${entityType} "${entityName}" to "${newShared}" (previously "${oldShared}")`;
                }
                if (individualChanged) {
                    return `[zh-hans] changed individual budget for the ${entityType} "${entityName}" to "${newIndividual}" (previously "${oldIndividual}")`;
                }
                return `[zh-hans] changed notification threshold for the ${entityType} "${entityName}" to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`;
            }
            return `[zh-hans] updated budget for the ${entityType} "${entityName}": ${changesList.join('; ')}`;
        },
        deleteBudget: ({entityType, entityName, frequency, individual, shared, notificationThreshold}: DeleteBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[zh-hans]  with notification threshold of "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `[zh-hans] removed ${frequency} shared budget of "${shared}" and individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (shared) {
                return `[zh-hans] removed ${frequency} shared budget of "${shared}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `[zh-hans] removed ${frequency} individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            return `[zh-hans] removed budget from the ${entityType} "${entityName}"`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} time tracking`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `[zh-hans] changed hourly rate to "${newRate}" (previously "${oldRate}")`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[zh-hans] added "${prohibitedExpense}" to prohibited expenses`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[zh-hans] removed "${prohibitedExpense}" from prohibited expenses`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `[zh-hans] changed reimbursement method to "${newReimbursementChoice}" (previously "${oldReimbursementChoice}")`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} pre-approval of workspace join requests`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `[zh-hans] changed custom report name formula to "${newDefaultTitle}" (previously "${oldDefaultTitle}")`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `[zh-hans] took over ownership of ${policyName} from ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} scheduled submit`,
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
            `[zh-hans] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". ${userEmail} is currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}.${summaryLink ? `[zh-hans]  <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
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
            `[zh-hans] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". You're currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}. ${summaryLink ? `[zh-hans] <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} categories`;
                case 'tags':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} tags`;
                case 'workflows':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} workflows`;
                case 'distance rates':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} distance rates`;
                case 'accounting':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} accounting`;
                case 'Expensify Cards':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} Expensify Cards`;
                case 'travel invoicing':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} travel invoicing`;
                case 'company cards':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} company cards`;
                case 'invoicing':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} invoicing`;
                case 'per diem':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} per diem`;
                case 'receipt partners':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} receipt partners`;
                case 'rules':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} rules`;
                case 'tax tracking':
                    return `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} tax tracking`;
                default:
                    return `${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} attendee tracking`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} auto-pay approved reports`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `[zh-hans] set the auto-pay approved reports threshold to "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `[zh-hans] changed the auto-pay approved reports threshold to "${newLimit}" (previously "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: '[zh-hans] removed the auto-pay approved reports threshold',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `[zh-hans] changed the default approver to ${newApprover} (previously ${previousApprover})` : `[zh-hans] changed the default approver to ${newApprover}`,
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
            let text = `[zh-hans] changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `[zh-hans]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[zh-hans]  (previously default approver)';
            } else if (previousApprover) {
                text += `[zh-hans]  (previously ${previousApprover})`;
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
                ? `[zh-hans] changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `[zh-hans] changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += `[zh-hans]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[zh-hans]  (previously default approver)';
            } else if (previousApprover) {
                text += `[zh-hans]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[zh-hans] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `[zh-hans] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[zh-hans] changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `[zh-hans] changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[zh-hans] changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `[zh-hans] set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[zh-hans] changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `[zh-hans] set the invoice company website to "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser
                ? `[zh-hans] changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")`
                : `[zh-hans] changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: (enabled: boolean) => `[zh-hans] ${enabled ? '[zh-hans] enabled' : '[zh-hans] disabled'} reimbursements`,
        updateCustomTaxName: ({oldName, newName}: UpdatedPolicyCustomTaxNameParams) => `[zh-hans] changed the custom tax name to "${newName}" (previously "${oldName}")`,
        updateCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyCurrencyDefaultTaxParams) =>
            `[zh-hans] changed the workspace currency default tax rate to "${newName}" (previously "${oldName}")`,
        updateForeignCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyForeignCurrencyDefaultTaxParams) =>
            `[zh-hans] changed the foreign currency default tax rate to "${newName}" (previously "${oldName}")`,
        addTax: (taxName: string) => `[zh-hans] added the tax "${taxName}"`,
        deleteTax: (taxName: string) => `[zh-hans] removed the tax "${taxName}"`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `[zh-hans] renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `[zh-hans] changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `[zh-hans] changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `[zh-hans] ${oldValue ? '[zh-hans] disabled' : '[zh-hans] enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `[zh-hans] set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[zh-hans] changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: (oldValue: string) => `[zh-hans] removed receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `[zh-hans] set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `[zh-hans] changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: (oldValue: string) => `[zh-hans] removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: (newValue: string) => `[zh-hans] set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `[zh-hans] changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `[zh-hans] removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: '[zh-hans] Member not found.',
        useInviteButton: '[zh-hans] To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `[zh-hans] You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `[zh-hans] It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `[zh-hans] Are you sure you want to remove ${memberName} from the room?`,
            other: '[zh-hans] Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: '[zh-hans] There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: '[zh-hans] Assign task',
        assignMe: '[zh-hans] Assign to me',
        confirmTask: '[zh-hans] Confirm task',
        confirmError: '[zh-hans] Please enter a title and select a share destination',
        descriptionOptional: '[zh-hans] Description (optional)',
        pleaseEnterTaskName: '[zh-hans] Please enter a title',
        pleaseEnterTaskDestination: '[zh-hans] Please select where you want to share this task',
    },
    task: {
        task: '[zh-hans] Task',
        title: '[zh-hans] Title',
        description: '[zh-hans] Description',
        assignee: '[zh-hans] Assignee',
        completed: '[zh-hans] Completed',
        action: '[zh-hans] Complete',
        messages: {
            created: (title: string) => `[zh-hans] task for ${title}`,
            completed: '[zh-hans] marked as complete',
            canceled: '[zh-hans] deleted task',
            reopened: '[zh-hans] marked as incomplete',
            error: "[zh-hans] You don't have permission to take the requested action",
        },
        markAsComplete: '[zh-hans] Mark as complete',
        markAsIncomplete: '[zh-hans] Mark as incomplete',
        assigneeError: '[zh-hans] An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: '[zh-hans] There was an error creating this task. Please try again later.',
        deleteTask: '[zh-hans] Delete task',
        deleteConfirmation: '[zh-hans] Are you sure you want to delete this task?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `[zh-hans] ${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '[zh-hans] Keyboard shortcuts',
        subtitle: '[zh-hans] Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: '[zh-hans] Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: '[zh-hans] Mark all messages as read',
            escape: '[zh-hans] Escape dialogs',
            search: '[zh-hans] Open search dialog',
            newChat: '[zh-hans] New chat screen',
            copy: '[zh-hans] Copy comment',
            openDebug: '[zh-hans] Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: '[zh-hans] Screen share',
        screenShareRequest: '[zh-hans] Expensify is inviting you to a screen share',
    },
    search: {
        resultsAreLimited: '[zh-hans] Search results are limited.',
        viewResults: '[zh-hans] View results',
        appliedFilters: '[zh-hans] Applied filters',
        resetFilters: '[zh-hans] Reset filters',
        searchResults: {
            emptyResults: {
                title: '[zh-hans] Nothing to show',
                subtitle: `[zh-hans] Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "[zh-hans] You haven't created any expenses yet",
                subtitle: '[zh-hans] Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[zh-hans] Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "[zh-hans] You haven't created any reports yet",
                subtitle: '[zh-hans] Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[zh-hans] Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    [zh-hans] You haven't created any
                    invoices yet
                `),
                subtitle: '[zh-hans] Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[zh-hans] Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: '[zh-hans] No trips to display',
                subtitle: '[zh-hans] Get started by booking your first trip below.',
                buttonText: '[zh-hans] Book a trip',
            },
            emptySubmitResults: {
                title: '[zh-hans] No expenses to submit',
                subtitle: "[zh-hans] You're all clear. Take a victory lap!",
                buttonText: '[zh-hans] Create report',
            },
            emptyApproveResults: {
                title: '[zh-hans] No expenses to approve',
                subtitle: '[zh-hans] Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: '[zh-hans] No expenses to pay',
                subtitle: '[zh-hans] Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: '[zh-hans] No expenses to export',
                subtitle: '[zh-hans] Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: '[zh-hans] No expenses to display',
                subtitle: '[zh-hans] No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: '[zh-hans] No expenses to approve',
                subtitle: '[zh-hans] Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: '[zh-hans] Columns',
        editColumns: '[zh-hans] Edit columns',
        resetColumns: '[zh-hans] Reset columns',
        groupColumns: '[zh-hans] Group columns',
        expenseColumns: '[zh-hans] Expense Columns',
        statements: '[zh-hans] Statements',
        cardStatements: '[zh-hans] Card statements',
        monthlyAccrual: '[zh-hans] Monthly accrual',
        unapprovedCash: '[zh-hans] Unapproved cash',
        unapprovedCard: '[zh-hans] Unapproved card',
        reconciliation: '[zh-hans] Reconciliation',
        topSpenders: '[zh-hans] Top spenders',
        saveSearch: '[zh-hans] Save search',
        deleteSavedSearch: '[zh-hans] Delete saved search',
        deleteSavedSearchConfirm: '[zh-hans] Are you sure you want to delete this search?',
        searchName: '[zh-hans] Search name',
        savedSearchesMenuItemTitle: '[zh-hans] Saved',
        topCategories: '[zh-hans] Top categories',
        topMerchants: '[zh-hans] Top merchants',
        spendOverTime: '[zh-hans] Spend over time',
        groupedExpenses: '[zh-hans] grouped expenses',
        bulkActions: {
            editMultiple: '[zh-hans] Edit multiple',
            editMultipleTitle: '[zh-hans] Edit multiple expenses',
            editMultipleDescription: "[zh-hans] Changes will be set for all selected expenses and will override any previously set values. Just sayin'.",
            approve: '[zh-hans] Approve',
            pay: '[zh-hans] Pay',
            delete: '[zh-hans] Delete',
            hold: '[zh-hans] Hold',
            unhold: '[zh-hans] Remove hold',
            reject: '[zh-hans] Reject',
            duplicateExpense: ({count}: {count: number}) => `[zh-hans] Duplicate ${count === 1 ? '[zh-hans] expense' : '[zh-hans] expenses'}`,
            undelete: '[zh-hans] Undelete',
            noOptionsAvailable: '[zh-hans] No options available for the selected group of expenses.',
        },
        filtersHeader: '[zh-hans] Filters',
        filters: {
            date: {
                before: (date?: string) => `[zh-hans] Before ${date ?? ''}`,
                after: (date?: string) => `[zh-hans] After ${date ?? ''}`,
                on: (date?: string) => `[zh-hans] On ${date ?? ''}`,
                customDate: '[zh-hans] Custom date',
                customRange: '[zh-hans] Custom range',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '[zh-hans] Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '[zh-hans] Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '[zh-hans] This month',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '[zh-hans] Year to date',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '[zh-hans] Last 12 months',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '[zh-hans] Last statement',
                },
            },
            status: '[zh-hans] Status',
            keyword: '[zh-hans] Keyword',
            keywords: '[zh-hans] Keywords',
            limit: '[zh-hans] Limit',
            limitDescription: '[zh-hans] Set a limit for the results of your search.',
            currency: '[zh-hans] Currency',
            completed: '[zh-hans] Completed',
            amount: {
                lessThan: (amount?: string) => `[zh-hans] Less than ${amount ?? ''}`,
                greaterThan: (amount?: string) => `[zh-hans] Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `[zh-hans] Between ${greaterThan} and ${lessThan}`,
                equalTo: (amount?: string) => `[zh-hans] Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: '[zh-hans] Expensify',
                individualCards: '[zh-hans] Individual cards',
                closedCards: '[zh-hans] Closed cards',
                cardFeeds: '[zh-hans] Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `[zh-hans] All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `[zh-hans] All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `[zh-hans] ${name} is ${value}`,
            current: '[zh-hans] Current',
            past: '[zh-hans] Past',
            submitted: '[zh-hans] Submitted',
            approved: '[zh-hans] Approved',
            paid: '[zh-hans] Paid',
            exported: '[zh-hans] Exported',
            posted: '[zh-hans] Posted',
            withdrawn: '[zh-hans] Withdrawn',
            billable: '[zh-hans] Billable',
            reimbursable: '[zh-hans] Reimbursable',
            purchaseCurrency: '[zh-hans] Purchase currency',
            sortOrder: {
                [CONST.SEARCH.SORT_ORDER.ASC]: '[zh-hans] Ascending',
                [CONST.SEARCH.SORT_ORDER.DESC]: '[zh-hans] Descending',
            },
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '[zh-hans] From',
                [CONST.SEARCH.GROUP_BY.CARD]: '[zh-hans] Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[zh-hans] Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '[zh-hans] Category',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '[zh-hans] Merchant',
                [CONST.SEARCH.GROUP_BY.TAG]: '[zh-hans] Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: '[zh-hans] Month',
                [CONST.SEARCH.GROUP_BY.WEEK]: '[zh-hans] Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: '[zh-hans] Year',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '[zh-hans] Quarter',
            },
            feed: '[zh-hans] Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: '[zh-hans] Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '[zh-hans] Reimbursement',
            },
            is: '[zh-hans] Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '[zh-hans] Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '[zh-hans] Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '[zh-hans] Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '[zh-hans] Export',
            },
        },
        display: {
            label: '[zh-hans] Display',
            sortBy: '[zh-hans] Sort by',
            sortOrder: '[zh-hans] Sort order',
            groupBy: '[zh-hans] Group by',
            limitResults: '[zh-hans] Limit results',
        },
        has: '[zh-hans] Has',
        view: {
            label: '[zh-hans] View',
            table: '[zh-hans] Table',
            bar: '[zh-hans] Bar',
            line: '[zh-hans] Line',
            pie: '[zh-hans] Pie',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '[zh-hans] From',
            [CONST.SEARCH.GROUP_BY.CARD]: '[zh-hans] Cards',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[zh-hans] Exports',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '[zh-hans] Categories',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '[zh-hans] Merchants',
            [CONST.SEARCH.GROUP_BY.TAG]: '[zh-hans] Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: '[zh-hans] Months',
            [CONST.SEARCH.GROUP_BY.WEEK]: '[zh-hans] Weeks',
            [CONST.SEARCH.GROUP_BY.YEAR]: '[zh-hans] Years',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '[zh-hans] Quarters',
        },
        moneyRequestReport: {
            emptyStateTitle: '[zh-hans] This report has no expenses.',
            accessPlaceHolder: '[zh-hans] Open for details',
        },
        noCategory: '[zh-hans] No category',
        noMerchant: '[zh-hans] No merchant',
        noTag: '[zh-hans] No tag',
        expenseType: '[zh-hans] Expense type',
        withdrawalType: '[zh-hans] Withdrawal type',
        recentSearches: '[zh-hans] Recent searches',
        recentChats: '[zh-hans] Recent chats',
        searchIn: '[zh-hans] Search in',
        searchPlaceholder: '[zh-hans] Search for something...',
        suggestions: '[zh-hans] Suggestions',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `[zh-hans] Suggestions available${query ? `[zh-hans]  for ${query}` : ''}. ${count} result.`,
            other: (resultCount: number) => `[zh-hans] Suggestions available${query ? `[zh-hans]  for ${query}` : ''}. ${resultCount} results.`,
        }),
        exportSearchResults: {
            title: '[zh-hans] Create export',
            description: "[zh-hans] Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: '[zh-hans] Exported to',
        exportAll: {
            selectAllMatchingItems: '[zh-hans] Select all matching items',
            allMatchingItemsSelected: '[zh-hans] All matching items selected',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: '[zh-hans] Please select dates for both From and To',
        },
    },
    genericErrorPage: {
        title: '[zh-hans] Uh-oh, something went wrong!',
        body: {
            helpTextMobile: '[zh-hans] Please close and reopen the app, or switch to',
            helpTextWeb: '[zh-hans] web.',
            helpTextConcierge: '[zh-hans] If the problem persists, reach out to',
        },
        refresh: '[zh-hans] Refresh',
    },
    fileDownload: {
        success: {
            title: '[zh-hans] Downloaded!',
            message: '[zh-hans] Attachment successfully downloaded!',
            qrMessage:
                '[zh-hans] Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: '[zh-hans] Attachment error',
            message: "[zh-hans] Attachment can't be downloaded",
        },
        permissionError: {
            title: '[zh-hans] Storage access',
            message: "[zh-hans] Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: '[zh-hans] Pending',
            cleared: '[zh-hans] Cleared',
            failed: '[zh-hans] Failed',
        },
        failedError: ({link}: {link: string}) => `[zh-hans] We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `[zh-hans] ${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '[zh-hans] Report layout',
        groupByLabel: '[zh-hans] Group by:',
        selectGroupByOption: '[zh-hans] Select how to group report expenses',
        uncategorized: '[zh-hans] Uncategorized',
        noTag: '[zh-hans] No tag',
        selectGroup: ({groupName}: {groupName: string}) => `[zh-hans] Select all expenses in ${groupName}`,
        groupBy: {
            category: '[zh-hans] Category',
            tag: '[zh-hans] Tag',
        },
    },
    report: {
        newReport: {
            createExpense: '[zh-hans] Create expense',
            createReport: '[zh-hans] Create report',
            chooseWorkspace: '[zh-hans] Choose a workspace for this report.',
            emptyReportConfirmationTitle: '[zh-hans] You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `[zh-hans] Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationPromptLink: '[zh-hans] Reports',
            emptyReportConfirmationDontShowAgain: "[zh-hans] Don't show me this again",
            genericWorkspaceName: '[zh-hans] this workspace',
        },
        genericCreateReportFailureMessage: '[zh-hans] Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: '[zh-hans] Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: '[zh-hans] Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: '[zh-hans] Unexpected error renaming the report. Please try again later.',
        noActivityYet: '[zh-hans] No activity yet',
        connectionSettings: '[zh-hans] Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `[zh-hans] changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `[zh-hans] set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `[zh-hans] changed the workspace${fromPolicyName ? `[zh-hans]  (previously ${fromPolicyName})` : ''}`;
                    }
                    return `[zh-hans] changed the workspace to ${toPolicyName}${fromPolicyName ? `[zh-hans]  (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `[zh-hans] changed type from ${oldType} to ${newType}`,
                exportedToCSV: `[zh-hans] exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `[zh-hans] exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `[zh-hans] exported to ${label} via`,
                    automaticActionTwo: '[zh-hans] accounting settings',
                    manual: (label: string) => `[zh-hans] marked this report as manually exported to ${label}.`,
                    automaticActionThree: '[zh-hans] and successfully created a record for',
                    reimburseableLink: '[zh-hans] out-of-pocket expenses',
                    nonReimbursableLink: '[zh-hans] company card expenses',
                    pending: (label: string) => `[zh-hans] started exporting this report to ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `[zh-hans] failed to export this report to ${label} ("${errorMessage}${linkText ? `[zh-hans]  <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `[zh-hans] added a receipt`,
                managerDetachReceipt: `[zh-hans] removed a receipt`,
                markedReimbursed: (amount: string, currency: string) => `[zh-hans] paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `[zh-hans] paid ${currency}${amount} via integration`,
                outdatedBankAccount: `[zh-hans] couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounceDefault: `[zh-hans] couldn't process the payment due to an incorrect routing/account number or closed account`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `[zh-hans] couldn't process the payment: ${returnReason}`,
                reimbursementACHCancelled: `[zh-hans] canceled the payment`,
                reimbursementAccountChanged: `[zh-hans] couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `[zh-hans] processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `[zh-hans] randomly selected for review`,
                selectedForRandomAuditMarkdown: `[zh-hans] [randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `[zh-hans] invited member ${to}`,
                unshare: ({to}: UnshareParams) => `[zh-hans] removed member ${to}`,
                stripePaid: (amount: string, currency: string) => `[zh-hans] paid ${currency}${amount}`,
                takeControl: `[zh-hans] took control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `[zh-hans] Open the Expensify mobile app to review your ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}transaction`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `[zh-hans] there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `[zh-hans] The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `[zh-hans] the Plaid connection to your business bank account is broken. Please <a href='${walletRoute}'>reconnect your bank account ${maskedAccountNumber}</a> so you can continue to use your Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `[zh-hans] ${email} joined via the workspace invite link` : `[zh-hans] added ${email} as ${role === 'member' ? '[zh-hans] a' : '[zh-hans] an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `[zh-hans] updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[zh-hans] removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[zh-hans] added "${newValue}" to ${email}’s custom field 1`
                        : `[zh-hans] changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[zh-hans] removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[zh-hans] added "${newValue}" to ${email}’s custom field 2`
                        : `[zh-hans] changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `[zh-hans] ${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `[zh-hans] removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `[zh-hans] removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `[zh-hans] connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '[zh-hans] left the chat',
                leftTheChatWithName: (nameOrEmail: string) => `[zh-hans] ${nameOrEmail ? `${nameOrEmail}: ` : ''}left the chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `[zh-hans] business bank account ${maskedBankAccountNumber} has been automatically locked due to an issue with either Reimbursement or Expensify Card settlement. Please fix the issue in your <a href="${linkURL}">workspace settings</a>.`,
            },
            error: {
                invalidCredentials: '[zh-hans] Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) =>
            `[zh-hans] ${summary} for ${dayCount} ${dayCount === 1 ? '[zh-hans] day' : '[zh-hans] days'} until ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `[zh-hans] ${summary} from ${timePeriod} on ${date}`,
        startTimer: '[zh-hans] Start Timer',
        stopTimer: '[zh-hans] Stop Timer',
        scheduleOOO: '[zh-hans] Schedule OOO',
        scheduleOOOTitle: '[zh-hans] Schedule Out of Office',
        date: '[zh-hans] Date',
        time: '[zh-hans] Time (use 24-hour format)',
        durationAmount: '[zh-hans] Duration',
        durationUnit: '[zh-hans] Unit',
        reason: '[zh-hans] Reason',
        workingPercentage: '[zh-hans] Working percentage',
        dateRequired: '[zh-hans] Date is required.',
        invalidTimeFormat: '[zh-hans] Please enter a valid 24-hour time (e.g., 14:30).',
        enterANumber: '[zh-hans] Please enter a number.',
        hour: '[zh-hans] hours',
        day: '[zh-hans] days',
        week: '[zh-hans] weeks',
        month: '[zh-hans] months',
    },
    footer: {
        features: '[zh-hans] Features',
        expenseManagement: '[zh-hans] Expense Management',
        spendManagement: '[zh-hans] Spend Management',
        expenseReports: '[zh-hans] Expense Reports',
        companyCreditCard: '[zh-hans] Company Credit Card',
        receiptScanningApp: '[zh-hans] Receipt Scanning App',
        billPay: '[zh-hans] Bill Pay',
        invoicing: '[zh-hans] Invoicing',
        CPACard: '[zh-hans] CPA Card',
        payroll: '[zh-hans] Payroll',
        travel: '[zh-hans] Travel',
        resources: '[zh-hans] Resources',
        expensifyApproved: '[zh-hans] ExpensifyApproved!',
        pressKit: '[zh-hans] Press Kit',
        support: '[zh-hans] Support',
        expensifyHelp: '[zh-hans] ExpensifyHelp',
        terms: '[zh-hans] Terms of Service',
        privacy: '[zh-hans] Privacy',
        learnMore: '[zh-hans] Learn More',
        aboutExpensify: '[zh-hans] About Expensify',
        blog: '[zh-hans] Blog',
        jobs: '[zh-hans] Jobs',
        expensifyOrg: '[zh-hans] Expensify.org',
        investorRelations: '[zh-hans] Investor Relations',
        getStarted: '[zh-hans] Get Started',
        createAccount: '[zh-hans] Create A New Account',
        logIn: '[zh-hans] Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '[zh-hans] Navigate back to chats list',
        chatWelcomeMessage: '[zh-hans] Chat welcome message',
        navigatesToChat: '[zh-hans] Navigates to a chat',
        newMessageLineIndicator: '[zh-hans] New message line indicator',
        chatMessage: '[zh-hans] Chat message',
        lastChatMessagePreview: '[zh-hans] Last chat message preview',
        workspaceName: '[zh-hans] Workspace name',
        chatUserDisplayNames: '[zh-hans] Chat member display names',
        scrollToNewestMessages: '[zh-hans] Scroll to newest messages',
        preStyledText: '[zh-hans] Pre-styled text',
        viewAttachment: '[zh-hans] View attachment',
        contextMenuAvailable: '[zh-hans] Context menu available. Press Shift+F10 to open.',
        contextMenuAvailableMacOS: '[zh-hans] Context menu available. Press VO-Shift-M to open.',
        contextMenuAvailableNative: '[zh-hans] Context menu available. Double-tap and hold to open.',
        selectAllFeatures: '[zh-hans] Select all features',
        selectAllTransactions: '[zh-hans] Select all transactions',
        selectAllItems: '[zh-hans] Select all items',
    },
    parentReportAction: {
        deletedReport: '[zh-hans] Deleted report',
        deletedMessage: '[zh-hans] Deleted message',
        deletedExpense: '[zh-hans] Deleted expense',
        reversedTransaction: '[zh-hans] Reversed transaction',
        deletedTask: '[zh-hans] Deleted task',
        hiddenMessage: '[zh-hans] Hidden message',
    },
    threads: {
        thread: '[zh-hans] Thread',
        replies: '[zh-hans] Replies',
        reply: '[zh-hans] Reply',
        from: '[zh-hans] From',
        in: '[zh-hans] in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `[zh-hans] From ${reportName}${workspaceName ? `[zh-hans]  in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: '[zh-hans] QR code',
        copy: '[zh-hans] Copy URL',
        copied: '[zh-hans] Copied!',
    },
    moderation: {
        flagDescription: '[zh-hans] All flagged messages will be sent to a moderator for review.',
        chooseAReason: '[zh-hans] Choose a reason for flagging below:',
        spam: '[zh-hans] Spam',
        spamDescription: '[zh-hans] Unsolicited off-topic promotion',
        inconsiderate: '[zh-hans] Inconsiderate',
        inconsiderateDescription: '[zh-hans] Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: '[zh-hans] Intimidation',
        intimidationDescription: '[zh-hans] Aggressively pursuing an agenda over valid objections',
        bullying: '[zh-hans] Bullying',
        bullyingDescription: '[zh-hans] Targeting an individual to obtain obedience',
        harassment: '[zh-hans] Harassment',
        harassmentDescription: '[zh-hans] Racist, misogynistic, or other broadly discriminatory behavior',
        assault: '[zh-hans] Assault',
        assaultDescription: '[zh-hans] Specifically targeted emotional attack with the intention of harm',
        flaggedContent: '[zh-hans] This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: '[zh-hans] Hide message',
        revealMessage: '[zh-hans] Reveal message',
        levelOneResult: '[zh-hans] Sends anonymous warning and message is reported for review.',
        levelTwoResult: '[zh-hans] Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: '[zh-hans] Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '[zh-hans] Invite to submit expenses',
        inviteToChat: '[zh-hans] Invite to chat only',
        nothing: '[zh-hans] Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '[zh-hans] Accept',
        decline: '[zh-hans] Decline',
    },
    actionableMentionTrackExpense: {
        submit: '[zh-hans] Submit it to someone',
        categorize: '[zh-hans] Categorize it',
        share: '[zh-hans] Share it with my accountant',
        nothing: '[zh-hans] Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: '[zh-hans] Teachers Unite',
        joinExpensifyOrg:
            '[zh-hans] Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: '[zh-hans] I know a teacher',
        iAmATeacher: '[zh-hans] I am a teacher',
        personalKarma: {
            title: '[zh-hans] Enable Personal Karma',
            description: '[zh-hans] Donate $1 to Expensify.org for every $500 you spend each month',
            stopDonationsPrompt: '[zh-hans] Are you sure you want to stop donating to Expensify.org?',
        },
        getInTouch: '[zh-hans] Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: '[zh-hans] Intro to your school principal',
        schoolPrincipalVerifyExpense:
            '[zh-hans] Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: '[zh-hans] Principal first name',
        principalLastName: '[zh-hans] Principal last name',
        principalWorkEmail: '[zh-hans] Principal work email',
        updateYourEmail: '[zh-hans] Update your email address',
        updateEmail: '[zh-hans] Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `[zh-hans] Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: '[zh-hans] Enter a valid email or phone number',
            enterEmail: '[zh-hans] Enter an email',
            enterValidEmail: '[zh-hans] Enter a valid email',
            tryDifferentEmail: '[zh-hans] Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: '[zh-hans] Not activated',
        outOfPocket: '[zh-hans] Reimbursable',
        companySpend: '[zh-hans] Non-reimbursable',
        personalCard: '[zh-hans] Personal card',
        companyCard: '[zh-hans] Company card',
        expensifyCard: '[zh-hans] Expensify Card',
        centralInvoicing: '[zh-hans] Central invoicing',
    },
    distance: {
        addStop: '[zh-hans] Add stop',
        address: '[zh-hans] Address',
        waypointDescription: {
            start: '[zh-hans] Start',
            stop: '[zh-hans] Stop',
        },
        mapPending: {
            title: '[zh-hans] Map pending',
            subtitle: '[zh-hans] The map will be generated when you go back online',
            onlineSubtitle: '[zh-hans] One moment while we set up the map',
            errorTitle: '[zh-hans] Map error',
            errorSubtitle: '[zh-hans] There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: '[zh-hans] Please select a suggested address or use current location',
        },
        odometer: {
            startReading: '[zh-hans] Start reading',
            endReading: '[zh-hans] End reading',
            saveForLater: '[zh-hans] Save for later',
            totalDistance: '[zh-hans] Total distance',
            startTitle: '[zh-hans] Odometer start photo',
            endTitle: '[zh-hans] Odometer end photo',
            deleteOdometerPhoto: '[zh-hans] Delete odometer photo',
            deleteOdometerPhotoConfirmation: '[zh-hans] Are you sure you want to delete this odometer photo?',
            startMessageWeb: '[zh-hans] Add a photo of your odometer from the <strong>start</strong> of your trip. Drag a file here or choose one to upload.',
            endMessageWeb: '[zh-hans] Add a photo of your odometer from the <strong>end</strong> of your trip. Drag a file here or choose one to upload.',
            cameraAccessRequired: '[zh-hans] Camera access is required to take pictures.',
            snapPhotoStart: '[zh-hans] <muted-text-label>Snap a photo of your odometer at the <strong>start</strong> of your trip.</muted-text-label>',
            snapPhotoEnd: '[zh-hans] <muted-text-label>Snap a photo of your odometer at the <strong>end</strong> of your trip.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '[zh-hans] Failed to start location tracking.',
            failedToGetPermissions: '[zh-hans] Failed to get required location permissions.',
        },
        trackingDistance: '[zh-hans] Tracking distance...',
        stopped: '[zh-hans] Stopped',
        start: '[zh-hans] Start',
        stop: '[zh-hans] Stop',
        discard: '[zh-hans] Discard',
        stopGpsTrackingModal: {
            title: '[zh-hans] Stop GPS tracking',
            prompt: '[zh-hans] Are you sure? This will end your current journey.',
            cancel: '[zh-hans] Resume tracking',
            confirm: '[zh-hans] Stop GPS tracking',
        },
        discardDistanceTrackingModal: {
            title: '[zh-hans] Discard distance tracking',
            prompt: "[zh-hans] Are you sure? This will discard your current journey and can't be undone.",
            confirm: '[zh-hans] Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "[zh-hans] Can't create expense",
            prompt: "[zh-hans] You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: '[zh-hans] Location access required',
            prompt: '[zh-hans] Please allow location access in your device settings to start GPS distance tracking.',
            allow: '[zh-hans] Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: '[zh-hans] Background location access required',
            prompt: '[zh-hans] Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: '[zh-hans] Precise location required',
            prompt: '[zh-hans] Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: '[zh-hans] Track distance on your phone',
            subtitle: '[zh-hans] Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: '[zh-hans] Download the app',
        },
        notification: {
            title: '[zh-hans] GPS tracking in progress',
            body: '[zh-hans] Go to the app to finish',
        },
        continueGpsTripModal: {
            title: '[zh-hans] Continue GPS trip recording?',
            prompt: '[zh-hans] Looks like the app closed during your last GPS trip. Would you like to continue recording from that trip?',
            confirm: '[zh-hans] Continue trip',
            cancel: '[zh-hans] View trip',
        },
        signOutWarningTripInProgress: {
            title: '[zh-hans] GPS tracking in progress',
            prompt: '[zh-hans] Are you sure you want to discard the trip and sign out?',
            confirm: '[zh-hans] Discard and sign out',
        },
        switchToODWarningTripInProgress: {
            title: '[zh-hans] GPS tracking in progress',
            prompt: '[zh-hans] Are you sure you want to stop GPS tracking and switch to Expensify Classic?',
            confirm: '[zh-hans] Stop and switch',
        },
        switchAccountWarningTripInProgress: {
            title: '[zh-hans] GPS tracking in progress',
            prompt: '[zh-hans] Are you sure you want to stop GPS tracking and switch accounts?',
            confirm: '[zh-hans] Stop and switch',
        },
        locationServicesRequiredModal: {
            title: '[zh-hans] Location access required',
            confirm: '[zh-hans] Open settings',
            prompt: '[zh-hans] Please allow location access in your device settings to start GPS distance tracking.',
        },
        gpsFloatingPillText: '[zh-hans] GPS tracking in progress...',
        liveActivity: {
            subtitle: '[zh-hans] Tracking distance',
            button: '[zh-hans] View progress',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '[zh-hans] Report card lost or damaged',
        nextButtonLabel: '[zh-hans] Next',
        reasonTitle: '[zh-hans] Why do you need a new card?',
        cardDamaged: '[zh-hans] My card was damaged',
        cardLostOrStolen: '[zh-hans] My card was lost or stolen',
        confirmAddressTitle: '[zh-hans] Please confirm the mailing address for your new card.',
        cardDamagedInfo: '[zh-hans] Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: '[zh-hans] Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: '[zh-hans] Address',
        deactivateCardButton: '[zh-hans] Deactivate card',
        shipNewCardButton: '[zh-hans] Ship new card',
        addressError: '[zh-hans] Address is required',
        reasonError: '[zh-hans] Reason is required',
        successTitle: '[zh-hans] Your new card is on the way!',
        successDescription: "[zh-hans] You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: '[zh-hans] Guaranteed eReceipt',
        transactionDate: '[zh-hans] Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '[zh-hans] Start a chat, <success><strong>refer a friend</strong></success>.',
            header: '[zh-hans] Start a chat, refer a friend',
            closeAccessibilityLabel: '[zh-hans] Close, start a chat, refer a friend, banner',
            body: "[zh-hans] Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '[zh-hans] Submit an expense, <success><strong>refer your team</strong></success>.',
            header: '[zh-hans] Submit an expense, refer your team',
            closeAccessibilityLabel: '[zh-hans] Close, submit an expense, refer your team, banner',
            body: "[zh-hans] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '[zh-hans] Refer a friend',
            body: "[zh-hans] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '[zh-hans] Refer a friend',
            header: '[zh-hans] Refer a friend',
            body: "[zh-hans] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: '[zh-hans] Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `[zh-hans] Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `[zh-hans] Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: '[zh-hans] All tags required',
        autoReportedRejectedExpense: '[zh-hans] This expense was rejected.',
        billableExpense: '[zh-hans] Billable no longer valid',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `[zh-hans] Receipt required${formattedLimit ? `[zh-hans]  over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '[zh-hans] Category no longer valid',
        conversionSurcharge: (surcharge: number) => `[zh-hans] Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: '[zh-hans] Rate not valid for this workspace',
        duplicatedTransaction: '[zh-hans] Potential duplicate',
        fieldRequired: '[zh-hans] Report fields are required',
        futureDate: '[zh-hans] Future date not allowed',
        invoiceMarkup: (invoiceMarkup: number) => `[zh-hans] Marked up by ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `[zh-hans] Date older than ${maxAge} days`,
        missingCategory: '[zh-hans] Missing category',
        missingComment: '[zh-hans] Description required for selected category',
        missingAttendees: '[zh-hans] Multiple attendees required for this category',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `[zh-hans] Missing ${tagName ?? '[zh-hans] tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '[zh-hans] Amount differs from calculated distance';
                case 'card':
                    return '[zh-hans] Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `[zh-hans] Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return '[zh-hans] Amount greater than scanned receipt';
            }
        },
        modifiedDate: '[zh-hans] Date differs from scanned receipt',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `[zh-hans] Distance exceeds the calculated route of ${formattedRouteDistance}` : '[zh-hans] Distance exceeds the calculated route',
        nonExpensiworksExpense: '[zh-hans] Non-Expensiworks expense',
        overAutoApprovalLimit: (formattedLimit: string) => `[zh-hans] Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `[zh-hans] Amount over ${formattedLimit}/person category limit`,
        overLimit: (formattedLimit: string) => `[zh-hans] Amount over ${formattedLimit}/person limit`,
        overTripLimit: (formattedLimit: string) => `[zh-hans] Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: (formattedLimit: string) => `[zh-hans] Amount over ${formattedLimit}/person limit`,
        perDayLimit: (formattedLimit: string) => `[zh-hans] Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: '[zh-hans] Receipt and expense details added manually.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `[zh-hans] Receipt required over ${formattedLimit} category limit`;
            }
            if (formattedLimit) {
                return `[zh-hans] Receipt required over ${formattedLimit}`;
            }
            if (category) {
                return `[zh-hans] Receipt required over category limit`;
            }
            return '[zh-hans] Receipt required';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `[zh-hans] Itemized receipt required${formattedLimit ? `[zh-hans]  over ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '[zh-hans] Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `[zh-hans] alcohol`;
                    case 'gambling':
                        return `[zh-hans] gambling`;
                    case 'tobacco':
                        return `[zh-hans] tobacco`;
                    case 'adultEntertainment':
                        return `[zh-hans] adult entertainment`;
                    case 'hotelIncidentals':
                        return `[zh-hans] hotel incidentals`;
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
        reviewRequired: '[zh-hans] Review required',
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
                return "[zh-hans] Can't auto-match receipt due to broken bank connection.";
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return "[zh-hans] Can't auto-match receipt due to broken bank connection.";
                }
                return isMarkAsCash
                    ? `[zh-hans] Can't auto-match receipt due to broken card connection. Mark as cash to ignore, or <a href="${connectionLink}">fix the card</a> to match the receipt.`
                    : `[zh-hans] Can't auto-match receipt due to broken card connection. <a href="${connectionLink}">Fix the card</a> to match the receipt.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `[zh-hans] Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : '[zh-hans] Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `[zh-hans] Ask ${member} to mark as a cash or wait 7 days and try again` : '[zh-hans] Awaiting merge with card transaction.';
            }
            return '';
        },
        brokenConnection530Error: '[zh-hans] Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `[zh-hans] <muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: '[zh-hans] Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: '[zh-hans] Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true}) => `[zh-hans] Receipt scanning failed.${canEdit ? '[zh-hans]  Enter details manually.' : ''}`,
        receiptGeneratedWithAI: '[zh-hans] Potential AI-generated receipt',
        someTagLevelsRequired: (tagName?: string) => `[zh-hans] Missing ${tagName ?? '[zh-hans] Tag'}`,
        tagOutOfPolicy: (tagName?: string) => `[zh-hans] ${tagName ?? '[zh-hans] Tag'} no longer valid`,
        taxAmountChanged: '[zh-hans] Tax amount was modified',
        taxOutOfPolicy: (taxName?: string) => `[zh-hans] ${taxName ?? '[zh-hans] Tax'} no longer valid`,
        taxRateChanged: '[zh-hans] Tax rate was modified',
        taxRequired: '[zh-hans] Missing tax rate',
        none: '[zh-hans] None',
        taxCodeToKeep: '[zh-hans] Choose which tax code to keep',
        tagToKeep: '[zh-hans] Choose which tag to keep',
        isTransactionReimbursable: '[zh-hans] Choose if transaction is reimbursable',
        merchantToKeep: '[zh-hans] Choose which merchant to keep',
        descriptionToKeep: '[zh-hans] Choose which description to keep',
        categoryToKeep: '[zh-hans] Choose which category to keep',
        isTransactionBillable: '[zh-hans] Choose if transaction is billable',
        keepThisOne: '[zh-hans] Keep this one',
        confirmDetails: `[zh-hans] Confirm the details you're keeping`,
        confirmDuplicatesInfo: `[zh-hans] The duplicates you don't keep will be held for the submitter to delete.`,
        hold: '[zh-hans] This expense was put on hold',
        resolvedDuplicates: '[zh-hans] resolved the duplicate',
        companyCardRequired: '[zh-hans] Company card purchases required',
        noRoute: '[zh-hans] Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `[zh-hans] ${fieldName} is required`,
        reportContainsExpensesWithViolations: '[zh-hans] Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: '[zh-hans] marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: '[zh-hans] resolved the duplicate',
        },
    },
    videoPlayer: {
        play: '[zh-hans] Play',
        pause: '[zh-hans] Pause',
        fullscreen: '[zh-hans] Fullscreen',
        playbackSpeed: '[zh-hans] Playback speed',
        expand: '[zh-hans] Expand',
        mute: '[zh-hans] Mute',
        unmute: '[zh-hans] Unmute',
        normal: '[zh-hans] Normal',
    },
    exitSurvey: {
        header: '[zh-hans] Before you go',
        reasonPage: {
            title: "[zh-hans] Please tell us why you're leaving",
            subtitle: '[zh-hans] Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[zh-hans] I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "[zh-hans] I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[zh-hans] I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[zh-hans] What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '[zh-hans] What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[zh-hans] Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: '[zh-hans] Your response',
        thankYou: '[zh-hans] Thanks for the feedback!',
        thankYouSubtitle: '[zh-hans] Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: '[zh-hans] Switch to Expensify Classic',
        offlineTitle: "[zh-hans] Looks like you're stuck here...",
        offline:
            "[zh-hans] You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: '[zh-hans] Quick tip...',
        quickTipSubTitle: '[zh-hans] You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: '[zh-hans] Book a call',
        bookACallTitle: '[zh-hans] Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '[zh-hans] Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '[zh-hans] Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '[zh-hans] Travel and expense at the speed of chat',
        },
        bookACallTextTop: '[zh-hans] By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: '[zh-hans] We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: '[zh-hans] Take me to Expensify Classic',
    },
    listBoundary: {
        errorMessage: '[zh-hans] An error occurred while loading more messages',
        tryAgain: '[zh-hans] Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: '[zh-hans] matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: '[zh-hans] Authenticate payment card',
        mobileReducedFunctionalityMessage: '[zh-hans] You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `[zh-hans] Free trial: ${numOfDays} ${numOfDays === 1 ? '[zh-hans] day' : '[zh-hans] days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '[zh-hans] Your payment info is outdated',
                subtitle: (date: string) => `[zh-hans] Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '[zh-hans] Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `[zh-hans] Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : '[zh-hans] Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: '[zh-hans] Your payment info is outdated',
                subtitle: (date: string) => `[zh-hans] Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '[zh-hans] Your payment info is outdated',
                subtitle: '[zh-hans] Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: '[zh-hans] Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `[zh-hans] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: '[zh-hans] Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `[zh-hans] Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: '[zh-hans] Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `[zh-hans] Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: '[zh-hans] Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `[zh-hans] Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: '[zh-hans] Your card is expiring soon',
                subtitle: '[zh-hans] Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: '[zh-hans] Success!',
                subtitle: '[zh-hans] Your card has been billed successfully.',
            },
            retryBillingError: {
                title: '[zh-hans] Your card couldn’t be charged',
                subtitle: '[zh-hans] Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `[zh-hans] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '[zh-hans] Start a free trial',
                subtitle: '[zh-hans] As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: (numOfDays: number) => `[zh-hans] Trial: ${numOfDays} ${numOfDays === 1 ? '[zh-hans] day' : '[zh-hans] days'} left!`,
                subtitle: '[zh-hans] Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: '[zh-hans] Your free trial has ended',
                subtitle: '[zh-hans] Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: '[zh-hans] Claim offer',
                subscriptionPageTitle: (discountType: number) => `[zh-hans] <strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `[zh-hans] Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) =>
                    `[zh-hans] Claim within ${days > 0 ? `[zh-hans] ${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '[zh-hans] Payment',
            subtitle: '[zh-hans] Add a card to pay for your Expensify subscription.',
            addCardButton: '[zh-hans] Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `[zh-hans] Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `[zh-hans] Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `[zh-hans] Card ending in ${cardNumber}`,
            changeCard: '[zh-hans] Change payment card',
            changeCurrency: '[zh-hans] Change payment currency',
            cardNotFound: '[zh-hans] No payment card added',
            retryPaymentButton: '[zh-hans] Retry payment',
            authenticatePayment: '[zh-hans] Authenticate payment',
            requestRefund: '[zh-hans] Request refund',
            requestRefundModal: {
                full: '[zh-hans] Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: '[zh-hans] Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: '[zh-hans] View payment history',
        },
        yourPlan: {
            title: '[zh-hans] Your plan',
            exploreAllPlans: '[zh-hans] Explore all plans',
            customPricing: '[zh-hans] Custom pricing',
            asLowAs: (price: string) => `[zh-hans] as low as ${price} per active member/month`,
            pricePerMemberMonth: (price: string) => `[zh-hans] ${price} per member/month`,
            pricePerMemberPerMonth: (price: string) => `[zh-hans] ${price} per member per month`,
            perMemberMonth: '[zh-hans] per member/month',
            collect: {
                title: '[zh-hans] Collect',
                description: '[zh-hans] The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[zh-hans] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[zh-hans] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[zh-hans] Receipt scanning',
                benefit2: '[zh-hans] Reimbursements',
                benefit3: '[zh-hans] Corporate card management',
                benefit4: '[zh-hans] Expense and travel approvals',
                benefit5: '[zh-hans] Travel booking and rules',
                benefit6: '[zh-hans] QuickBooks/Xero integrations',
                benefit7: '[zh-hans] Chat on expenses, reports, and rooms',
                benefit8: '[zh-hans] AI and human support',
            },
            control: {
                title: '[zh-hans] Control',
                description: '[zh-hans] Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[zh-hans] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[zh-hans] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[zh-hans] Everything in the Collect plan',
                benefit2: '[zh-hans] Multi-level approval workflows',
                benefit3: '[zh-hans] Custom expense rules',
                benefit4: '[zh-hans] ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: '[zh-hans] HR integrations (Workday, Certinia)',
                benefit6: '[zh-hans] SAML/SSO',
                benefit7: '[zh-hans] Custom insights and reporting',
                benefit8: '[zh-hans] Budgeting',
            },
            thisIsYourCurrentPlan: '[zh-hans] This is your current plan',
            downgrade: '[zh-hans] Downgrade to Collect',
            upgrade: '[zh-hans] Upgrade to Control',
            addMembers: '[zh-hans] Add members',
            saveWithExpensifyTitle: '[zh-hans] Save with the Expensify Card',
            saveWithExpensifyDescription: '[zh-hans] Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: '[zh-hans] Learn more',
        },
        compareModal: {
            comparePlans: '[zh-hans] Compare Plans',
            subtitle: `[zh-hans] <muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: '[zh-hans] Subscription details',
            annual: '[zh-hans] Annual subscription',
            taxExempt: '[zh-hans] Request tax exempt status',
            taxExemptEnabled: '[zh-hans] Tax exempt',
            taxExemptStatus: '[zh-hans] Tax exempt status',
            payPerUse: '[zh-hans] Pay-per-use',
            subscriptionSize: '[zh-hans] Subscription size',
            headsUp:
                "[zh-hans] Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: '[zh-hans] Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: '[zh-hans] Subscription size',
            yourSize: '[zh-hans] Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                '[zh-hans] Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: '[zh-hans] Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: '[zh-hans] Confirm your new annual subscription details:',
            subscriptionSize: '[zh-hans] Subscription size',
            activeMembers: (size: number) => `[zh-hans] ${size} active members/month`,
            subscriptionRenews: '[zh-hans] Subscription renews',
            youCantDowngrade: '[zh-hans] You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: (size: number, date: string) =>
                `[zh-hans] You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: '[zh-hans] Please enter a valid subscription size',
                sameSize: '[zh-hans] Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: '[zh-hans] Add payment card',
            enterPaymentCardDetails: '[zh-hans] Enter your payment card details',
            security: '[zh-hans] Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: '[zh-hans] Learn more about our security.',
        },
        expensifyCode: {
            title: '[zh-hans] Expensify code',
            discountCode: '[zh-hans] Discount code',
            enterCode: '[zh-hans] Enter an Expensify code to apply to your subscription.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `[zh-hans] You will get a ${promoDiscount}% discount on your next ${validBillingCycles ? `${validBillingCycles} ` : ''}billing charges.`,
            apply: '[zh-hans] Apply',
            error: {
                invalid: '[zh-hans] This code is invalid',
            },
        },
        subscriptionSettings: {
            title: '[zh-hans] Subscription settings',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `[zh-hans] Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}${expensifyCode ? `[zh-hans] , Expensify code: ${expensifyCode}` : ''}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: '[zh-hans] none',
            on: '[zh-hans] on',
            off: '[zh-hans] off',
            annual: '[zh-hans] Annual',
            autoRenew: '[zh-hans] Auto-renew',
            autoIncrease: '[zh-hans] Auto-increase annual seats',
            saveUpTo: (amountWithCurrency: string) => `[zh-hans] Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                '[zh-hans] Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: '[zh-hans] Disable auto-renew',
            helpUsImprove: '[zh-hans] Help us improve Expensify',
            whatsMainReason: "[zh-hans] What's the main reason you're disabling auto-renew?",
            renewsOn: (date: string) => `[zh-hans] Renews on ${date}.`,
            pricingConfiguration: '[zh-hans] Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `[zh-hans] <muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `[zh-hans] <a href="adminsRoom">#admins room.</a>` : '[zh-hans] #admins room.'}</muted-text>`,
            estimatedPrice: '[zh-hans] Estimated price',
            changesBasedOn: '[zh-hans] This changes based on your Expensify Card usage and the subscription options below.',
            collectBillingDescription: '[zh-hans] Collect workspaces are billed monthly per member, with no annual commitment.',
            pricing: '[zh-hans] Pricing',
        },
        requestEarlyCancellation: {
            title: '[zh-hans] Request early cancellation',
            subtitle: '[zh-hans] What’s the main reason you’re requesting early cancellation?',
            subscriptionCanceled: {
                title: '[zh-hans] Subscription canceled',
                subtitle: '[zh-hans] Your annual subscription has been canceled.',
                info: '[zh-hans] If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `[zh-hans] If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: '[zh-hans] Request submitted',
                subtitle:
                    '[zh-hans] Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `[zh-hans] By requesting early cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: '[zh-hans] Functionality needs improvement',
        tooExpensive: '[zh-hans] Too expensive',
        inadequateSupport: '[zh-hans] Inadequate customer support',
        businessClosing: '[zh-hans] Company closing, downsizing, or acquired',
        additionalInfoTitle: '[zh-hans] What software are you moving to and why?',
        additionalInfoInputLabel: '[zh-hans] Your response',
    },
    roomChangeLog: {
        updateRoomDescription: '[zh-hans] set the room description to:',
        clearRoomDescription: '[zh-hans] cleared the room description',
        changedRoomAvatar: '[zh-hans] changed the room avatar',
        removedRoomAvatar: '[zh-hans] removed the room avatar',
    },
    delegate: {
        switchAccount: '[zh-hans] Switch accounts:',
        copilotDelegatedAccess: '[zh-hans] Copilot: Delegated access',
        copilotDelegatedAccessDescription: '[zh-hans] Allow other members to access your account.',
        learnMoreAboutDelegatedAccess: '[zh-hans] Learn more about delegated access',
        addCopilot: '[zh-hans] Add copilot',
        membersCanAccessYourAccount: '[zh-hans] These members can access your account:',
        youCanAccessTheseAccounts: '[zh-hans] You can access these accounts via the account switcher:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[zh-hans] Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[zh-hans] Limited';
                default:
                    return '';
            }
        },
        genericError: '[zh-hans] Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `[zh-hans] on behalf of ${delegator}`,
        accessLevel: '[zh-hans] Access level',
        confirmCopilot: '[zh-hans] Confirm your copilot below.',
        accessLevelDescription: '[zh-hans] Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[zh-hans] Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[zh-hans] Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: '[zh-hans] Remove copilot',
        removeCopilotConfirmation: '[zh-hans] Are you sure you want to remove this copilot?',
        changeAccessLevel: '[zh-hans] Change access level',
        makeSureItIsYou: "[zh-hans] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[zh-hans] Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `[zh-hans] Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '[zh-hans] Not so fast...',
        noAccessMessage: dedent(`
            [zh-hans] As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `[zh-hans] As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: '[zh-hans] Copilot access',
    },
    debug: {
        debug: '[zh-hans] Debug',
        details: '[zh-hans] Details',
        JSON: '[zh-hans] JSON',
        reportActions: '[zh-hans] Actions',
        reportActionPreview: '[zh-hans] Preview',
        nothingToPreview: '[zh-hans] Nothing to preview',
        editJson: '[zh-hans] Edit JSON:',
        preview: '[zh-hans] Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `[zh-hans] Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `[zh-hans] Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `[zh-hans] Invalid value - Expected: ${expectedValues}`,
        missingValue: '[zh-hans] Missing value',
        createReportAction: '[zh-hans] Create Report Action',
        reportAction: '[zh-hans] Report Action',
        report: '[zh-hans] Report',
        transaction: '[zh-hans] Transaction',
        violations: '[zh-hans] Violations',
        transactionViolation: '[zh-hans] Transaction Violation',
        hint: "[zh-hans] Data changes won't be sent to the backend",
        textFields: '[zh-hans] Text fields',
        numberFields: '[zh-hans] Number fields',
        booleanFields: '[zh-hans] Boolean fields',
        constantFields: '[zh-hans] Constant fields',
        dateTimeFields: '[zh-hans] DateTime fields',
        date: '[zh-hans] Date',
        time: '[zh-hans] Time',
        none: '[zh-hans] None',
        visibleInLHN: '[zh-hans] Visible in LHN',
        GBR: '[zh-hans] GBR',
        RBR: '[zh-hans] RBR',
        true: '[zh-hans] true',
        false: '[zh-hans] false',
        viewReport: '[zh-hans] View Report',
        viewTransaction: '[zh-hans] View transaction',
        createTransactionViolation: '[zh-hans] Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: '[zh-hans] Has draft comment',
            hasGBR: '[zh-hans] Has GBR',
            hasRBR: '[zh-hans] Has RBR',
            pinnedByUser: '[zh-hans] Pinned by member',
            hasIOUViolations: '[zh-hans] Has IOU violations',
            hasAddWorkspaceRoomErrors: '[zh-hans] Has add workspace room errors',
            isUnread: '[zh-hans] Is unread (focus mode)',
            isArchived: '[zh-hans] Is archived (most recent mode)',
            isSelfDM: '[zh-hans] Is self DM',
            isFocused: '[zh-hans] Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: '[zh-hans] Has join request (admin room)',
            isUnreadWithMention: '[zh-hans] Is unread with mention',
            isWaitingForAssigneeToCompleteAction: '[zh-hans] Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: '[zh-hans] Has child report awaiting action',
            hasMissingInvoiceBankAccount: '[zh-hans] Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: '[zh-hans] Has unresolved card fraud alert',
            hasDEWApproveFailed: '[zh-hans] Has DEW approve failed',
        },
        reasonRBR: {
            hasErrors: '[zh-hans] Has errors in report or report actions data',
            hasViolations: '[zh-hans] Has violations',
            hasTransactionThreadViolations: '[zh-hans] Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "[zh-hans] There's a report awaiting action",
            theresAReportWithErrors: "[zh-hans] There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "[zh-hans] There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "[zh-hans] There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: '[zh-hans] There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "[zh-hans] There's a problem with a contact method",
            aContactMethodRequiresVerification: '[zh-hans] A contact method requires verification',
            theresAProblemWithAPaymentMethod: "[zh-hans] There's a problem with a payment method",
            theresAProblemWithAWorkspace: "[zh-hans] There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "[zh-hans] There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "[zh-hans] There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: '[zh-hans] Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: '[zh-hans] There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "[zh-hans] There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "[zh-hans] There's a problem with your wallet terms",
            aBankAccountIsLocked: '[zh-hans] A bank account is locked',
        },
    },
    emptySearchView: {
        takeATestDrive: '[zh-hans] Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: '[zh-hans] Welcome to New Expensify!',
        subtitle: "[zh-hans] It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "[zh-hans] Let's go!",
        helpText: '[zh-hans] Try 2-min demo',
        features: {
            search: '[zh-hans] More powerful search on mobile, web, and desktop',
            concierge: '[zh-hans] Built-in Concierge AI to help automate your expenses',
            chat: '[zh-hans] Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '[zh-hans] <tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '[zh-hans] <tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '[zh-hans] <tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        scanTestTooltip: {
            main: '[zh-hans] <tooltip><strong>Scan our test receipt</strong> to see how it works!</tooltip>',
            manager: '[zh-hans] <tooltip>Choose our <strong>test manager</strong> to try it out!</tooltip>',
            confirmation: '[zh-hans] <tooltip>Now, <strong>submit your expense</strong> and watch the\nmagic happen!</tooltip>',
            tryItOut: '[zh-hans] Try it out',
        },
        outstandingFilter: '[zh-hans] <tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '[zh-hans] <tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "[zh-hans] <tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
        hasFilterNegation: '[zh-hans] <tooltip>Search for expenses without receipts using <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '[zh-hans] Discard changes?',
        body: '[zh-hans] Are you sure you want to discard the changes you made?',
        confirmText: '[zh-hans] Discard changes',
    },
    scheduledCall: {
        book: {
            title: '[zh-hans] Schedule call',
            description: '[zh-hans] Find a time that works for you.',
            slots: ({date}: {date: string}) => `[zh-hans] <muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '[zh-hans] Confirm call',
            description: "[zh-hans] Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: '[zh-hans] Your setup specialist',
            meetingLength: '[zh-hans] Meeting length',
            dateTime: '[zh-hans] Date & time',
            minutes: '[zh-hans] 30 minutes',
        },
        callScheduled: '[zh-hans] Call scheduled',
    },
    autoSubmitModal: {
        title: '[zh-hans] All clear and submitted!',
        description: '[zh-hans] All warnings and violations has been cleared so:',
        submittedExpensesTitle: '[zh-hans] These expenses have been submitted',
        submittedExpensesDescription: '[zh-hans] These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: '[zh-hans] Pending expenses have been moved',
        pendingExpensesDescription: '[zh-hans] Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '[zh-hans] Take a 2-minute test drive',
        },
        modal: {
            title: '[zh-hans] Take us for a test drive',
            description: '[zh-hans] Take a quick product tour to get up to speed fast.',
            confirmText: '[zh-hans] Start test drive',
            helpText: '[zh-hans] Skip',
            employee: {
                description: '[zh-hans] <muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "[zh-hans] Enter your boss's email",
                error: '[zh-hans] That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "[zh-hans] You're currently test driving Expensify",
            readyForTheRealThing: '[zh-hans] Ready for the real thing?',
            getStarted: '[zh-hans] Get started',
        },
        employeeInviteMessage: (name: string) => `[zh-hans] # ${name} invited you to test drive Expensify
Hey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.

Here’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: '[zh-hans] Basic export',
        reportLevelExport: '[zh-hans] All Data - report level',
        expenseLevelExport: '[zh-hans] All Data - expense level',
        exportInProgress: '[zh-hans] Export in progress',
        conciergeWillSend: '[zh-hans] Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: '[zh-hans] Not verified',
        retry: '[zh-hans] Retry',
        verifyDomain: {
            title: '[zh-hans] Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `[zh-hans] Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `[zh-hans] Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: '[zh-hans] Add the following TXT record:',
            saveChanges: '[zh-hans] Save changes and return here to verify your domain.',
            youMayNeedToConsult: `[zh-hans] You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: '[zh-hans] After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: '[zh-hans] Couldn’t fetch verification code',
            genericError: "[zh-hans] We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: '[zh-hans] Domain verified',
            header: '[zh-hans] Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `[zh-hans] <muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: '[zh-hans] SAML',
        samlFeatureList: {
            title: '[zh-hans] SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `[zh-hans] <muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: '[zh-hans] Faster and easier login',
            moreSecurityAndControl: '[zh-hans] More security and control',
            onePasswordForAnything: '[zh-hans] One password for everything',
        },
        goToDomain: '[zh-hans] Go to domain',
        samlLogin: {
            title: '[zh-hans] SAML login',
            subtitle: `[zh-hans] <muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a>.</muted-text>`,
            enableSamlLogin: '[zh-hans] Enable SAML login',
            allowMembers: '[zh-hans] Allow members to log in with SAML.',
            requireSamlLogin: '[zh-hans] Require SAML login',
            anyMemberWillBeRequired: '[zh-hans] Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "[zh-hans] Couldn't update SAML enablement setting",
            requireError: "[zh-hans] Couldn't update SAML requirement setting",
            disableSamlRequired: '[zh-hans] Disable SAML required',
            oktaWarningPrompt: '[zh-hans] Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: '[zh-hans] Please add Identity Provider metadata below to enable',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `[zh-hans] <muted-text>Please disable <a href="${twoFactorAuthSettingsUrl}">force two-factor authentication</a> to enable SAML login.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: '[zh-hans] SAML configuration details',
            subtitle: '[zh-hans] Use these details to get SAML set up.',
            identityProviderMetadata: '[zh-hans] Identity Provider Metadata',
            entityID: '[zh-hans] Entity ID',
            nameIDFormat: '[zh-hans] Name ID Format',
            loginUrl: '[zh-hans] Login URL',
            acsUrl: '[zh-hans] ACS (Assertion Consumer Service) URL',
            logoutUrl: '[zh-hans] Logout URL',
            sloUrl: '[zh-hans] SLO (Single Logout) URL',
            serviceProviderMetaData: '[zh-hans] Service Provider MetaData',
            oktaScimToken: '[zh-hans] Okta SCIM Token',
            revealToken: '[zh-hans] Reveal token',
            fetchError: "[zh-hans] Couldn't fetch SAML configuration details",
            setMetadataGenericError: "[zh-hans] Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: '[zh-hans] Access restricted',
            subtitle: (domainName: string) => `[zh-hans] Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: '[zh-hans] Company card management',
            accountCreationAndDeletion: '[zh-hans] Account creation and deletion',
            workspaceCreation: '[zh-hans] Workspace creation',
            samlSSO: '[zh-hans] SAML SSO',
        },
        addDomain: {
            title: '[zh-hans] Add domain',
            subtitle: '[zh-hans] Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: '[zh-hans] Domain name',
            newDomain: '[zh-hans] New domain',
        },
        domainAdded: {
            title: '[zh-hans] Domain added',
            description: "[zh-hans] Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: '[zh-hans] Configure',
        },
        enhancedSecurity: {
            title: '[zh-hans] Enhanced security',
            subtitle: '[zh-hans] Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: '[zh-hans] Enable',
        },
        domainAdmins: '[zh-hans] Domain admins',
        admins: {
            title: '[zh-hans] Admins',
            findAdmin: '[zh-hans] Find admin',
            primaryContact: '[zh-hans] Primary contact',
            addPrimaryContact: '[zh-hans] Add primary contact',
            setPrimaryContactError: '[zh-hans] Unable to set primary contact. Please try again later.',
            consolidatedDomainBilling: '[zh-hans] Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `[zh-hans] <comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "[zh-hans] Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: '[zh-hans] Add admin',
            addAdminError: '[zh-hans] Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: '[zh-hans] Revoke admin access',
            cantRevokeAdminAccess: "[zh-hans] Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: '[zh-hans] Unable to remove this user as an Admin. Please try again.',
                removeDomain: '[zh-hans] Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: '[zh-hans] Please enter your domain name to reset it.',
            },
            resetDomain: '[zh-hans] Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `[zh-hans] Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: '[zh-hans] Enter your domain name here',
            resetDomainInfo: `[zh-hans] This action is <strong>permanent</strong> and the following data will be deleted: <br/> <bullet-list><bullet-item>Company card connections and any unreported expenses from those cards</bullet-item><bullet-item>SAML and group settings</bullet-item></bullet-list> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        domainMembers: '[zh-hans] Domain members',
        members: {
            title: '[zh-hans] Members',
            findMember: '[zh-hans] Find member',
            addMember: '[zh-hans] Add member',
            emptyMembers: {
                title: '[zh-hans] No members in this group',
                subtitle: '[zh-hans] Add a member or try changing the filter above.',
            },
            allMembers: '[zh-hans] All members',
            email: '[zh-hans] Email address',
            closeAccountPrompt: '[zh-hans] Are you sure? This action is permanent.',
            forceCloseAccount: () => ({
                one: '[zh-hans] Force close account',
                other: '[zh-hans] Force close accounts',
            }),
            safeCloseAccount: () => ({
                one: '[zh-hans] Close account safely',
                other: '[zh-hans] Close accounts safely',
            }),
            closeAccountInfo: () => ({
                one: '[zh-hans] We recommend closing the account safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected account.',
                other: '[zh-hans] We recommend closing the accounts safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected accounts.',
            }),
            closeAccount: () => ({
                one: '[zh-hans] Close account',
                other: '[zh-hans] Close accounts',
            }),
            moveToGroup: '[zh-hans] Move to group',
            chooseWhereToMove: ({count}: {count: number}) => `[zh-hans] Choose where to move ${count} ${count === 1 ? '[zh-hans] member' : '[zh-hans] members'}.`,
            error: {
                addMember: '[zh-hans] Unable to add this member. Please try again.',
                removeMember: '[zh-hans] Unable to remove this user. Please try again.',
                moveMember: '[zh-hans] Unable to move this member. Please try again.',
                vacationDelegate: '[zh-hans] Unable to set this user as a vacation delegate. Please try again.',
            },
            cannotSetVacationDelegateForMember: (email: string) =>
                `[zh-hans] You can't set a vacation delegate for ${email} because they're currently the delegate for the following members:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `[zh-hans] Are you sure? This will lock <strong>${email}'s</strong> account. <br /><br /> Our team will then review the account and remove any unauthorized access. To regain access, they'll need to work with Concierge.`,
            reportSuspiciousActivityConfirmationPrompt: '[zh-hans] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        },
        common: {
            settings: '[zh-hans] Settings',
            forceTwoFactorAuth: '[zh-hans] Force two-factor authentication',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `[zh-hans] <muted-text>Please disable <a href="${samlPageUrl}">SAML</a> to force two-factor authentication.</muted-text>`,
            forceTwoFactorAuthDescription: `[zh-hans] <muted-text>Require two-factor authentication for all members of this domain. Domain members will be prompted to set up two-factor authentication on their account when they sign in.</muted-text>`,
            forceTwoFactorAuthError: "[zh-hans] Force two-factor authentication couldn't be changed. Please try again later.",
            resetTwoFactorAuth: '[zh-hans] Reset two-factor authentication',
        },
        groups: {
            title: '[zh-hans] Groups',
            memberCount: () => {
                return {
                    one: '[zh-hans] 1 member',
                    other: (count: number) => `[zh-hans] ${count} members`,
                };
            },
        },
    },
};
export default translations;
