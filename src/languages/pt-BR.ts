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
        count: '[pt-BR][ctx: Used as a noun meaning a numerical total or quantity, not the verb “to count.”] Count',
        cancel: '[pt-BR] Cancel',
        dismiss: '[pt-BR][ctx: Refers to closing or hiding a notification or message, not rejecting or ignoring something.] Dismiss',
        proceed: '[pt-BR][ctx: Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”] Proceed',
        unshare: '[pt-BR] Unshare',
        yes: '[pt-BR] Yes',
        no: '[pt-BR] No',
        ok: '[pt-BR][ctx: Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.] OK',
        notNow: '[pt-BR] Not now',
        noThanks: '[pt-BR] No thanks',
        learnMore: '[pt-BR] Learn more',
        buttonConfirm: '[pt-BR] Got it',
        name: '[pt-BR] Name',
        attachment: '[pt-BR] Attachment',
        attachments: '[pt-BR] Attachments',
        center: '[pt-BR] Center',
        from: '[pt-BR] From',
        to: '[pt-BR] To',
        in: '[pt-BR] In',
        optional: '[pt-BR] Optional',
        new: '[pt-BR] New',
        newFeature: '[pt-BR] New feature',
        search: '[pt-BR] Search',
        reports: '[pt-BR] Spend',
        find: '[pt-BR] Find',
        searchWithThreeDots: '[pt-BR] Search...',
        next: '[pt-BR] Next',
        previous: '[pt-BR] Previous',
        previousMonth: '[pt-BR] Previous month',
        nextMonth: '[pt-BR] Next month',
        previousYear: '[pt-BR] Previous year',
        nextYear: '[pt-BR] Next year',
        goBack: '[pt-BR][ctx: Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.] Go back',
        create: '[pt-BR] Create',
        add: '[pt-BR] Add',
        resend: '[pt-BR] Resend',
        save: '[pt-BR] Save',
        select: '[pt-BR] Select',
        deselect: '[pt-BR] Deselect',
        selectMultiple: '[pt-BR][ctx: Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.] Select multiple',
        saveChanges: '[pt-BR] Save changes',
        submit: '[pt-BR] Submit',
        submitted: '[pt-BR][ctx: Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”] Submitted',
        rotate: '[pt-BR] Rotate',
        zoom: '[pt-BR] Zoom',
        password: '[pt-BR] Password',
        magicCode: '[pt-BR] Magic code',
        digits: '[pt-BR] digits',
        twoFactorCode: '[pt-BR] Two-factor code',
        workspaces: '[pt-BR] Workspaces',
        home: '[pt-BR] Home',
        inbox: '[pt-BR] Inbox',
        yourReviewIsRequired: '[pt-BR] Your review is required',
        actionBadge: {
            submit: '[pt-BR] Submit',
            approve: '[pt-BR] Approve',
            pay: '[pt-BR] Pay',
            fix: '[pt-BR] Fix',
        },
        success: '[pt-BR][ctx: Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”] Success',
        group: '[pt-BR] Group',
        profile: '[pt-BR] Profile',
        referral: '[pt-BR] Referral',
        payments: '[pt-BR] Payments',
        approvals: '[pt-BR] Approvals',
        wallet: '[pt-BR] Wallet',
        preferences: '[pt-BR] Preferences',
        view: '[pt-BR] View',
        review: (amount?: string) => `[pt-BR] Review${amount ? ` ${amount}` : ''}`,
        not: '[pt-BR] Not',
        signIn: '[pt-BR] Sign in',
        signInWithGoogle: '[pt-BR] Sign in with Google',
        signInWithApple: '[pt-BR] Sign in with Apple',
        signInWith: '[pt-BR] Sign in with',
        continue: '[pt-BR] Continue',
        firstName: '[pt-BR] First name',
        lastName: '[pt-BR] Last name',
        scanning: '[pt-BR] Scanning',
        analyzing: '[pt-BR] Analyzing...',
        thinking: '[pt-BR] Concierge is thinking...',
        addCardTermsOfService: '[pt-BR] Expensify Terms of Service',
        perPerson: '[pt-BR] per person',
        phone: '[pt-BR] Phone',
        phoneNumber: '[pt-BR] Phone number',
        phoneNumberPlaceholder: '[pt-BR] (xxx) xxx-xxxx',
        email: '[pt-BR] Email',
        and: '[pt-BR] and',
        or: '[pt-BR] or',
        details: '[pt-BR] Details',
        privacy: '[pt-BR] Privacy',
        privacyPolicy: '[pt-BR] Privacy Policy',
        hidden: '[pt-BR] Hidden',
        visible: '[pt-BR] Visible',
        delete: '[pt-BR] Delete',
        archived: '[pt-BR][ctx: UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.] archived',
        contacts: '[pt-BR] Contacts',
        recents: '[pt-BR] Recents',
        close: '[pt-BR] Close',
        comment: '[pt-BR] Comment',
        download: '[pt-BR] Download',
        downloading: '[pt-BR] Downloading',
        uploading: '[pt-BR][ctx: Indicates that a file is currently being uploaded (sent to the server), not downloaded.] Uploading',
        pin: '[pt-BR][ctx: as a verb, not a noun] Pin',
        unPin: '[pt-BR] Unpin',
        back: '[pt-BR] Back',
        saveAndContinue: '[pt-BR] Save & continue',
        settings: '[pt-BR] Settings',
        termsOfService: '[pt-BR] Terms of Service',
        members: '[pt-BR] Members',
        invite: '[pt-BR] Invite',
        here: '[pt-BR] here',
        date: '[pt-BR] Date',
        dob: '[pt-BR] Date of birth',
        currentYear: '[pt-BR] Current year',
        currentMonth: '[pt-BR] Current month',
        ssnLast4: '[pt-BR] Last 4 digits of SSN',
        ssnFull9: '[pt-BR] Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `[pt-BR] Address line ${lineNumber}`,
        personalAddress: '[pt-BR] Personal address',
        companyAddress: '[pt-BR] Company address',
        noPO: '[pt-BR] No PO boxes or mail-drop addresses, please.',
        city: '[pt-BR] City',
        state: '[pt-BR] State',
        streetAddress: '[pt-BR] Street address',
        stateOrProvince: '[pt-BR] State / Province',
        country: '[pt-BR] Country',
        zip: '[pt-BR] Zip code',
        zipPostCode: '[pt-BR] Zip / Postcode',
        whatThis: "[pt-BR] What's this?",
        iAcceptThe: '[pt-BR] I accept the ',
        acceptTermsAndPrivacy: `[pt-BR] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `[pt-BR] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `[pt-BR] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: "[pt-BR] You can't export an empty report.",
            other: () => `[pt-BR] You can't export empty reports.`,
        }),
        remove: '[pt-BR] Remove',
        admin: '[pt-BR] Admin',
        owner: '[pt-BR] Owner',
        dateFormat: '[pt-BR] YYYY-MM-DD',
        send: '[pt-BR] Send',
        na: '[pt-BR] N/A',
        noResultsFound: '[pt-BR] No results found',
        noResultsFoundMatching: (searchString: string) => `[pt-BR] No results found matching "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `[pt-BR] Suggestions available for "${searchString}".` : '[pt-BR] Suggestions available.'),
        recentDestinations: '[pt-BR] Recent destinations',
        timePrefix: "[pt-BR] It's",
        conjunctionFor: '[pt-BR] for',
        todayAt: '[pt-BR] Today at',
        tomorrowAt: '[pt-BR] Tomorrow at',
        yesterdayAt: '[pt-BR] Yesterday at',
        conjunctionAt: '[pt-BR] at',
        conjunctionTo: '[pt-BR] to',
        genericErrorMessage: '[pt-BR] Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: '[pt-BR] Percentage',
        progressBarLabel: '[pt-BR] Onboarding progress',
        converted: '[pt-BR] Converted',
        error: {
            invalidAmount: '[pt-BR] Invalid amount',
            acceptTerms: '[pt-BR] You must accept the Terms of Service to continue',
            phoneNumber: `[pt-BR] Please enter a complete phone number
(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '[pt-BR] This field is required',
            requestModified: '[pt-BR] This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `[pt-BR] Character limit exceeded (${length}/${limit})`,
            dateInvalid: '[pt-BR] Please select a valid date',
            invalidDateShouldBeFuture: '[pt-BR] Please choose today or a future date',
            invalidTimeShouldBeFuture: '[pt-BR] Please choose a time at least one minute ahead',
            invalidCharacter: '[pt-BR] Invalid character',
            enterMerchant: '[pt-BR] Enter a merchant name',
            enterAmount: '[pt-BR] Enter an amount',
            missingMerchantName: '[pt-BR] Missing merchant name',
            missingAmount: '[pt-BR] Missing amount',
            missingDate: '[pt-BR] Missing date',
            enterDate: '[pt-BR] Enter a date',
            invalidTimeRange: '[pt-BR] Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: '[pt-BR] Please complete the form above to continue',
            pleaseSelectOne: '[pt-BR] Please select an option above',
            invalidRateError: '[pt-BR] Please enter a valid rate',
            lowRateError: '[pt-BR] Rate must be greater than 0',
            email: '[pt-BR] Please enter a valid email address',
            login: '[pt-BR] An error occurred while logging in. Please try again.',
        },
        comma: '[pt-BR] comma',
        semicolon: '[pt-BR] semicolon',
        please: '[pt-BR] Please',
        contactUs: '[pt-BR][ctx: Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.] contact us',
        pleaseEnterEmailOrPhoneNumber: '[pt-BR] Please enter an email or phone number',
        fixTheErrors: '[pt-BR][ctx: Instruction prompting the user to correct multiple issues. Should use imperative form when translated.] fix the errors',
        inTheFormBeforeContinuing: '[pt-BR] in the form before continuing',
        confirm: '[pt-BR] Confirm',
        reset: '[pt-BR] Reset',
        done: '[pt-BR][ctx: Status or button indicating that an action or process has been completed. Should reflect completion.] Done',
        more: '[pt-BR] More',
        debitCard: '[pt-BR] Debit card',
        bankAccount: '[pt-BR] Bank account',
        personalBankAccount: '[pt-BR] Personal bank account',
        businessBankAccount: '[pt-BR] Business bank account',
        join: '[pt-BR] Join',
        leave: '[pt-BR] Leave',
        decline: '[pt-BR] Decline',
        reject: '[pt-BR] Reject',
        transferBalance: '[pt-BR] Transfer balance',
        enterManually: '[pt-BR][ctx: Instruction telling the user to input data manually. Refers to entering text or values in a field.] Enter it manually',
        message: '[pt-BR] Message',
        leaveThread: '[pt-BR] Leave thread',
        you: '[pt-BR] You',
        me: '[pt-BR][ctx: Refers to the current user in the UI. Should follow capitalization rules for labels] me',
        youAfterPreposition: '[pt-BR] you',
        your: '[pt-BR] your',
        conciergeHelp: '[pt-BR] Please reach out to Concierge for help.',
        youAppearToBeOffline: '[pt-BR] You appear to be offline.',
        thisFeatureRequiresInternet: '[pt-BR] This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: '[pt-BR] Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: '[pt-BR] An error occurred while trying to play this video.',
        areYouSure: '[pt-BR] Are you sure?',
        verify: '[pt-BR] Verify',
        yesContinue: '[pt-BR] Yes, continue',
        websiteExample: '[pt-BR][ctx: Provides an example format for a website URL.] e.g. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `[pt-BR][ctx: Provides an example format for a ZIP] e.g. ${zipSampleFormat}` : ''),
        description: '[pt-BR] Description',
        title: '[pt-BR] Title',
        assignee: '[pt-BR] Assignee',
        createdBy: '[pt-BR] Created by',
        with: '[pt-BR] with',
        shareCode: '[pt-BR] Share code',
        share: '[pt-BR] Share',
        per: '[pt-BR] per',
        mi: '[pt-BR][ctx: Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.] mile',
        km: '[pt-BR] kilometer',
        milesAbbreviated: '[pt-BR] mi',
        kilometersAbbreviated: '[pt-BR] km',
        copied: '[pt-BR] Copied!',
        someone: '[pt-BR] Someone',
        total: '[pt-BR] Total',
        edit: '[pt-BR] Edit',
        letsDoThis: `[pt-BR] Let's do this!`,
        letsStart: `[pt-BR] Let's start`,
        showMore: '[pt-BR] Show more',
        showLess: '[pt-BR] Show less',
        merchant: '[pt-BR] Merchant',
        change: '[pt-BR] Change',
        category: '[pt-BR] Category',
        report: '[pt-BR] Report',
        billable: '[pt-BR] Billable',
        nonBillable: '[pt-BR] Non-billable',
        tag: '[pt-BR] Tag',
        receipt: '[pt-BR] Receipt',
        verified: '[pt-BR] Verified',
        replace: '[pt-BR] Replace',
        distance: '[pt-BR] Distance',
        mile: '[pt-BR] mile',
        miles: '[pt-BR][ctx: Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.] miles',
        kilometer: '[pt-BR] kilometer',
        kilometers: '[pt-BR] kilometers',
        recent: '[pt-BR] Recent',
        all: '[pt-BR] All',
        am: '[pt-BR] AM',
        pm: '[pt-BR] PM',
        tbd: "[pt-BR][ctx: Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.] TBD",
        selectCurrency: '[pt-BR] Select a currency',
        selectSymbolOrCurrency: '[pt-BR] Select a symbol or currency',
        card: '[pt-BR] Card',
        whyDoWeAskForThis: '[pt-BR] Why do we ask for this?',
        required: '[pt-BR] Required',
        automatic: '[pt-BR] Automatic',
        showing: '[pt-BR] Showing',
        of: '[pt-BR] of',
        default: '[pt-BR] Default',
        update: '[pt-BR] Update',
        member: '[pt-BR] Member',
        auditor: '[pt-BR] Auditor',
        role: '[pt-BR] Role',
        roleCannotBeChanged: (workflowsLinkPage: string) => `[pt-BR] Role can't be changed because this member is a <a href="${workflowsLinkPage}">payer</a> on this workspace.`,
        currency: '[pt-BR] Currency',
        groupCurrency: '[pt-BR] Group currency',
        rate: '[pt-BR] Rate',
        emptyLHN: {
            title: '[pt-BR] Woohoo! All caught up.',
            subtitleText1: '[pt-BR] Find a chat using the',
            subtitleText2: '[pt-BR] button above, or create something using the',
            subtitleText3: '[pt-BR] button below.',
        },
        businessName: '[pt-BR] Business name',
        clear: '[pt-BR] Clear',
        type: '[pt-BR] Type',
        reportName: '[pt-BR] Report name',
        action: '[pt-BR] Action',
        expenses: '[pt-BR] Expenses',
        totalSpend: '[pt-BR] Total spend',
        tax: '[pt-BR] Tax',
        shared: '[pt-BR] Shared',
        drafts: '[pt-BR] Drafts',
        draft: '[pt-BR][ctx: as a noun, not a verb] Draft',
        finished: '[pt-BR] Finished',
        upgrade: '[pt-BR] Upgrade',
        downgradeWorkspace: '[pt-BR] Downgrade workspace',
        companyID: '[pt-BR] Company ID',
        userID: '[pt-BR] User ID',
        disable: '[pt-BR] Disable',
        export: '[pt-BR] Export',
        initialValue: '[pt-BR] Initial value',
        currentDate: '[pt-BR][ctx: UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.] Current date',
        value: '[pt-BR] Value',
        downloadFailedTitle: '[pt-BR] Download failed',
        downloadFailedDescription: "[pt-BR] Your download couldn't be completed. Please try again later.",
        filterLogs: '[pt-BR] Filter Logs',
        network: '[pt-BR] Network',
        reportID: '[pt-BR] Report ID',
        longReportID: '[pt-BR] Long Report ID',
        withdrawalID: '[pt-BR] Withdrawal ID',
        withdrawalStatus: '[pt-BR] Withdrawal status',
        bankAccounts: '[pt-BR] Bank accounts',
        chooseFile: '[pt-BR] Choose file',
        chooseFiles: '[pt-BR] Choose files',
        dropTitle: '[pt-BR][ctx: Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.] Let it go',
        dropMessage: '[pt-BR][ctx: Instruction for dropping one or more files into an upload area.] Drop your file here',
        ignore: '[pt-BR] Ignore',
        enabled: '[pt-BR] Enabled',
        disabled: '[pt-BR] Disabled',
        import: '[pt-BR][ctx: Action button for importing a file or data. Should use the verb form, not the noun form.] Import',
        offlinePrompt: "[pt-BR] You can't take this action right now.",
        outstanding: '[pt-BR][ctx: meaning "remaining to be paid, done, or dealt with", not "exceptionally good"] Outstanding',
        chats: '[pt-BR] Chats',
        tasks: '[pt-BR] Tasks',
        unread: '[pt-BR] Unread',
        sent: '[pt-BR] Sent',
        links: '[pt-BR] Links',
        day: '[pt-BR][ctx: Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).] day',
        days: '[pt-BR] days',
        rename: '[pt-BR] Rename',
        address: '[pt-BR] Address',
        hourAbbreviation: '[pt-BR] h',
        minuteAbbreviation: '[pt-BR] m',
        secondAbbreviation: '[pt-BR] s',
        skip: '[pt-BR] Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `[pt-BR] Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: '[pt-BR] Chat now',
        workEmail: '[pt-BR] Work email',
        destination: '[pt-BR] Destination',
        subrate: '[pt-BR][ctx: Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.] Subrate',
        perDiem: '[pt-BR] Per diem',
        validate: '[pt-BR] Validate',
        downloadAsPDF: '[pt-BR] Download as PDF',
        downloadAsCSV: '[pt-BR] Download as CSV',
        print: '[pt-BR] Print',
        help: '[pt-BR] Help',
        collapsed: '[pt-BR] Collapsed',
        expanded: '[pt-BR] Expanded',
        expenseReport: '[pt-BR] Expense Report',
        expenseReports: '[pt-BR] Expense Reports',
        rateOutOfPolicy: '[pt-BR][ctx: Rate as a noun, not a verb] Rate out of policy',
        leaveWorkspace: '[pt-BR] Leave workspace',
        leaveWorkspaceConfirmation: "[pt-BR] If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "[pt-BR] If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "[pt-BR] If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `[pt-BR] If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `[pt-BR] If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `[pt-BR] If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "[pt-BR] You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: '[pt-BR] Reimbursable',
        editYourProfile: '[pt-BR] Edit your profile',
        comments: '[pt-BR] Comments',
        sharedIn: '[pt-BR] Shared in',
        unreported: '[pt-BR] Unreported',
        explore: '[pt-BR] Explore',
        insights: '[pt-BR] Insights',
        todo: '[pt-BR] To-do',
        invoice: '[pt-BR] Invoice',
        expense: '[pt-BR] Expense',
        chat: '[pt-BR] Chat',
        task: '[pt-BR] Task',
        trip: '[pt-BR] Trip',
        apply: '[pt-BR] Apply',
        status: '[pt-BR] Status',
        on: '[pt-BR] On',
        before: '[pt-BR] Before',
        after: '[pt-BR] After',
        range: '[pt-BR] Range',
        reschedule: '[pt-BR] Reschedule',
        general: '[pt-BR] General',
        workspacesTabTitle: '[pt-BR] Workspaces',
        headsUp: '[pt-BR] Heads up!',
        submitTo: '[pt-BR] Submit to',
        forwardTo: '[pt-BR] Forward to',
        approvalLimit: '[pt-BR] Approval limit',
        overLimitForwardTo: '[pt-BR] Over limit forward to',
        merge: '[pt-BR] Merge',
        none: '[pt-BR] None',
        unstableInternetConnection: '[pt-BR] Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: '[pt-BR] Enable Global Reimbursements',
        purchaseAmount: '[pt-BR] Purchase amount',
        originalAmount: '[pt-BR] Original amount',
        frequency: '[pt-BR] Frequency',
        link: '[pt-BR] Link',
        pinned: '[pt-BR] Pinned',
        read: '[pt-BR] Read',
        copyToClipboard: '[pt-BR] Copy to clipboard',
        thisIsTakingLongerThanExpected: '[pt-BR] This is taking longer than expected...',
        domains: '[pt-BR] Domains',
        actionRequired: '[pt-BR] Action required',
        duplicate: '[pt-BR] Duplicate',
        duplicated: '[pt-BR] Duplicated',
        duplicateExpense: '[pt-BR] Duplicate expense',
        duplicateReport: '[pt-BR] Duplicate report',
        copyOfReportName: (reportName: string) => `[pt-BR] Copy of ${reportName}`,
        exchangeRate: '[pt-BR] Exchange rate',
        reimbursableTotal: '[pt-BR] Reimbursable total',
        nonReimbursableTotal: '[pt-BR] Non-reimbursable total',
        opensInNewTab: '[pt-BR] Opens in a new tab',
        locked: '[pt-BR] Locked',
        month: '[pt-BR] Month',
        week: '[pt-BR] Week',
        year: '[pt-BR] Year',
        quarter: '[pt-BR] Quarter',
        concierge: {
            sidePanelGreeting: '[pt-BR] Hi there, how can I help?',
            showHistory: '[pt-BR] Show history',
        },
        vacationDelegate: '[pt-BR] Vacation delegate',
        expensifyLogo: '[pt-BR] Expensify logo',
        approver: '[pt-BR] Approver',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `[pt-BR] enter digit ${digitIndex} of ${totalDigits}`,
    },
    socials: {
        podcast: '[pt-BR] Follow us on Podcast',
        twitter: '[pt-BR] Follow us on Twitter',
        instagram: '[pt-BR] Follow us on Instagram',
        facebook: '[pt-BR] Follow us on Facebook',
        linkedin: '[pt-BR] Follow us on LinkedIn',
    },
    concierge: {
        collapseReasoning: '[pt-BR] Collapse reasoning',
        expandReasoning: '[pt-BR] Expand reasoning',
    },
    supportalNoAccess: {
        title: '[pt-BR] Not so fast',
        descriptionWithCommand: (command?: string) =>
            `[pt-BR] You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: '[pt-BR] Locked Account',
        description: "[pt-BR] You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: '[pt-BR] Use current location',
        notFound: '[pt-BR] We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "[pt-BR] It looks like you've denied access to your location.",
        please: '[pt-BR] Please',
        allowPermission: '[pt-BR] allow location access in settings',
        tryAgain: '[pt-BR] and try again.',
    },
    contact: {
        importContacts: '[pt-BR] Import contacts',
        importContactsTitle: '[pt-BR] Import your contacts',
        importContactsText: '[pt-BR] Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: '[pt-BR] so your favorite people are always a tap away.',
        importContactsNativeText: '[pt-BR] Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: '[pt-BR] Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '[pt-BR] Camera access',
        expensifyDoesNotHaveAccessToCamera: "[pt-BR] Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: '[pt-BR] Attachment error',
        errorWhileSelectingAttachment: '[pt-BR] An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: '[pt-BR] An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: '[pt-BR] Take photo',
        chooseFromGallery: '[pt-BR] Choose from gallery',
        chooseDocument: '[pt-BR] Choose file',
        attachmentTooLarge: '[pt-BR] Attachment is too large',
        sizeExceeded: '[pt-BR] Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `[pt-BR] Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: '[pt-BR] Attachment is too small',
        sizeNotMet: '[pt-BR] Attachment size must be greater than 240 bytes',
        wrongFileType: '[pt-BR] Invalid file type',
        notAllowedExtension: '[pt-BR] This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: '[pt-BR] Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: '[pt-BR] Password-protected PDF is not supported',
        attachmentImageResized: '[pt-BR] This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: '[pt-BR] This image is too large to preview before uploading.',
        imageDimensionsTooLarge: '[pt-BR] Image dimensions are too large to process. Please use a smaller image.',
        tooManyFiles: (fileLimit: number) => `[pt-BR] You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `[pt-BR] Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "[pt-BR] Some files can't be uploaded",
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `[pt-BR] Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "[pt-BR] You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `[pt-BR] ${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: '[pt-BR] Learn more about supported formats.',
        passwordProtected: "[pt-BR] Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: '[pt-BR] Add attachments',
        addReceipt: '[pt-BR] Add receipt',
        scanReceipts: '[pt-BR] Scan receipts',
        replaceReceipt: '[pt-BR] Replace receipt',
    },
    filePicker: {
        fileError: '[pt-BR] File error',
        errorWhileSelectingFile: '[pt-BR] An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: '[pt-BR] Connection complete',
        supportingText: '[pt-BR] You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: '[pt-BR] Edit photo',
        description: '[pt-BR] Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: '[pt-BR] No extension found for mime type',
        problemGettingImageYouPasted: '[pt-BR] There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `[pt-BR] The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `[pt-BR] The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: '[pt-BR] Update app',
        updatePrompt: '[pt-BR] A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: '[pt-BR] Launching Expensify',
        expired: '[pt-BR] Your session has expired.',
        signIn: '[pt-BR] Please sign in again.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: '[pt-BR] Review transaction',
            pleaseReview: '[pt-BR] Please review this transaction',
            requiresYourReview: '[pt-BR] An Expensify Card transaction requires your review.',
            transactionDetails: '[pt-BR] Transaction details',
            attemptedTransaction: '[pt-BR] Attempted transaction',
            deny: '[pt-BR] Deny',
            approve: '[pt-BR] Approve',
            denyTransaction: '[pt-BR] Deny transaction',
            transactionDenied: '[pt-BR] Transaction denied',
            transactionApproved: '[pt-BR] Transaction approved!',
            areYouSureToDeny: '[pt-BR] Are you sure? The transaction will be denied if you close this screen.',
            youCanTryAgainAtMerchantOrReachOut:
                "[pt-BR] You can try again at the merchant. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            youNeedToTryAgainAtMerchant: "[pt-BR] This transaction was not verified, so we denied it. You'll need to try again at the merchant.",
            goBackToTheMerchant: '[pt-BR] Return to the merchant site to continue the transaction.',
            transactionFailed: '[pt-BR] Transaction failed',
            transactionCouldNotBeCompleted: '[pt-BR] Your transaction could not be completed. Please try again at the merchant.',
            transactionCouldNotBeCompletedReachOut:
                "[pt-BR] Your transaction could not be completed. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            reviewFailed: '[pt-BR] Review failed',
            alreadyReviewedSubtitle:
                '[pt-BR] You already reviewed this transaction. Please check your <transaction-history-link>transaction history</transaction-history-link> or contact <concierge-link>Concierge</concierge-link> to report any issues.',
        },
        unsupportedDevice: {
            unsupportedDevice: '[pt-BR] Unsupported device',
            pleaseDownloadMobileApp: `[pt-BR] This action is not supported on your device. Please download the Expensify app from the <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> or <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> and try again.`,
            pleaseUseWebApp: `[pt-BR] This action is not supported on your device. Please use the <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify web app</a> and try again.`,
        },
        biometricsTest: {
            biometricsTest: '[pt-BR] Biometrics test',
            authenticationSuccessful: '[pt-BR] Authentication successful',
            successfullyAuthenticatedUsing: (authType?: string) => `[pt-BR] You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `[pt-BR] Biometrics (${status})`,
            statusNeverRegistered: '[pt-BR] Never registered',
            statusNotRegistered: '[pt-BR] Not registered',
            statusRegisteredOtherDevice: () => ({one: '[pt-BR] Another device registered', other: '[pt-BR] Other devices registered'}),
            statusRegisteredThisDevice: '[pt-BR] Registered',
            yourAttemptWasUnsuccessful: '[pt-BR] Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: '[pt-BR] You couldn’t be authenticated',
            areYouSureToReject: '[pt-BR] Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: '[pt-BR] Reject authentication',
            test: '[pt-BR] Test',
            biometricsAuthentication: '[pt-BR] Biometric authentication',
            authType: {
                unknown: '[pt-BR] Unknown',
                none: '[pt-BR] None',
                credentials: '[pt-BR] Credentials',
                biometrics: '[pt-BR] Biometrics',
                faceId: '[pt-BR] Face ID',
                touchId: '[pt-BR] Touch ID',
                opticId: '[pt-BR] Optic ID',
                passkey: '[pt-BR] Passkey',
            },
        },
        pleaseEnableInSystemSettings: {
            start: '[pt-BR] Please enable face/fingerprint verification or set a device passcode in your ',
            link: '[pt-BR] system settings',
            end: '.',
        },
        oops: '[pt-BR] Oops, something went wrong',
        verificationFailed: '[pt-BR] Verification failed',
        looksLikeYouRanOutOfTime: '[pt-BR] Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: '[pt-BR] You ran out of time',
        letsVerifyItsYou: '[pt-BR] Let’s verify it’s you',
        nowLetsAuthenticateYou: "[pt-BR] Now, let's authenticate you...",
        letsAuthenticateYou: "[pt-BR] Let's authenticate you...",
        verifyYourself: {
            biometrics: '[pt-BR] Verify yourself with your face or fingerprint',
            passkeys: '[pt-BR] Verify yourself with a passkey',
        },
        enableQuickVerification: {
            biometrics: '[pt-BR] Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
            passkeys: '[pt-BR] Enable quick, secure verification using a passkey. No passwords or codes required.',
        },
        revoke: {
            revoke: '[pt-BR] Revoke',
            title: '[pt-BR] Face/fingerprint & passkeys',
            explanation:
                '[pt-BR] Face/fingerprint or passkey verification are enabled on one or more devices. Revoking access will require a magic code for the next verification on that device.',
            confirmationPrompt: "[pt-BR] Are you sure? You'll need a magic code for the next verification on that device.",
            confirmationPromptThisDevice: "[pt-BR] Are you sure? You'll need a magic code for the next verification on this device.",
            confirmationPromptMultiple: "[pt-BR] Are you sure? You'll need a magic code for the next verification on those devices.",
            confirmationPromptAll: "[pt-BR] Are you sure? You'll need a magic code for the next verification on any device.",
            cta: '[pt-BR] Revoke access',
            ctaAll: '[pt-BR] Revoke all',
            noDevices: "[pt-BR] You don't have any devices registered for face/fingerprint or passkey verification. If you register any, you will be able to revoke that access here.",
            dismiss: '[pt-BR] Got it',
            error: '[pt-BR] Request failed. Try again later.',
            thisDevice: '[pt-BR] This device',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['[pt-BR] One', '[pt-BR] Two', '[pt-BR] Three', '[pt-BR] Four', '[pt-BR] Five', '[pt-BR] Six', '[pt-BR] Seven', '[pt-BR] Eight', '[pt-BR] Nine'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `[pt-BR] ${displayCount} other ${otherDeviceCount === 1 ? '[pt-BR] device' : '[pt-BR] devices'}`;
            },
        },
        setPin: {
            didNotShipCard: "[pt-BR] We didn't ship your card. Please try again.",
        },
        revealPin: {
            couldNotReveal: "[pt-BR] We couldn't reveal your PIN. Please try again.",
        },
        changePin: {
            didNotChange: "[pt-BR] We didn't change your PIN. Please try again.",
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            [pt-BR] Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: '[pt-BR] Head back to your original tab to continue.',
        title: "[pt-BR] Here's your magic code",
        description: dedent(`
            [pt-BR] Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            [pt-BR] Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: '[pt-BR] , or',
        signInHere: '[pt-BR] just sign in here',
        expiredCodeTitle: '[pt-BR] Magic code expired',
        expiredCodeDescription: '[pt-BR] Go back to the original device and request a new code',
        successfulNewCodeRequest: '[pt-BR] Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            [pt-BR] Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            [pt-BR] Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: '[pt-BR] request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: '[pt-BR] Paid by',
        whatsItFor: "[pt-BR] What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: '[pt-BR] Name, email, or phone number',
        findMember: '[pt-BR] Find a member',
        searchForSomeone: '[pt-BR] Search for someone',
        userSelected: (username: string) => `[pt-BR] ${username} selected`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '[pt-BR] Submit an expense, refer your team',
            subtitleText: "[pt-BR] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '[pt-BR] Book a call',
    },
    hello: '[pt-BR] Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '[pt-BR] Get started below.',
        anotherLoginPageIsOpen: '[pt-BR] Another login page is open.',
        anotherLoginPageIsOpenExplanation: "[pt-BR] You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: '[pt-BR] Welcome!',
        welcomeWithoutExclamation: '[pt-BR] Welcome',
        phrase2: "[pt-BR] Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: '[pt-BR] Your payments get to you as fast as you can get your point across.',
        enterPassword: '[pt-BR] Please enter your password',
        welcomeNewFace: (login: string) => `[pt-BR] ${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: (login: string) => `[pt-BR] Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '[pt-BR] Travel and expense, at the speed of chat',
            body: '[pt-BR] Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '[pt-BR] Continue logging in with single sign-on:',
        orContinueWithMagicCode: '[pt-BR] You can also sign in with a magic code',
        useSingleSignOn: '[pt-BR] Use single sign-on',
        useMagicCode: '[pt-BR] Use magic code',
        launching: '[pt-BR] Launching...',
        oneMoment: "[pt-BR] One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: '[pt-BR] Drop to upload',
        sendAttachment: '[pt-BR] Send attachment',
        addAttachment: '[pt-BR] Add attachment',
        writeSomething: '[pt-BR] Write something...',
        blockedFromConcierge: '[pt-BR] Communication is barred',
        askConciergeToUpdate: '[pt-BR] Try "Update an expense"...',
        askConciergeToCorrect: '[pt-BR] Try "Correct an expense"...',
        askConciergeForHelp: '[pt-BR] Ask Concierge AI for help...',
        fileUploadFailed: '[pt-BR] Upload failed. File is not supported.',
        localTime: (user: string, time: string) => `[pt-BR] It's ${time} for ${user}`,
        edited: '[pt-BR] (edited)',
        emoji: '[pt-BR] Emoji',
        collapse: '[pt-BR] Collapse',
        expand: '[pt-BR] Expand',
    },
    reportActionContextMenu: {
        copyMessage: '[pt-BR] Copy message',
        copied: '[pt-BR] Copied!',
        copyLink: '[pt-BR] Copy link',
        copyURLToClipboard: '[pt-BR] Copy URL to clipboard',
        copyEmailToClipboard: '[pt-BR] Copy email to clipboard',
        markAsUnread: '[pt-BR] Mark as unread',
        markAsRead: '[pt-BR] Mark as read',
        editAction: ({action}: EditActionParams) => `[pt-BR] Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '[pt-BR] expense' : '[pt-BR] comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '[pt-BR] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[pt-BR] Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '[pt-BR] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[pt-BR] Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: '[pt-BR] Only visible to',
        explain: '[pt-BR] Explain',
        explainMessage: '[pt-BR] Please explain this to me.',
        replyInThread: '[pt-BR] Reply in thread',
        joinThread: '[pt-BR] Join thread',
        leaveThread: '[pt-BR] Leave thread',
        copyOnyxData: '[pt-BR] Copy Onyx data',
        flagAsOffensive: '[pt-BR] Flag as offensive',
        menu: '[pt-BR] Menu',
    },
    emojiReactions: {
        addReactionTooltip: '[pt-BR] Add reaction',
        reactedWith: '[pt-BR] reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `[pt-BR] You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `[pt-BR] This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `[pt-BR] This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) =>
            `[pt-BR] This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `[pt-BR] This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `[pt-BR] This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `[pt-BR] This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `[pt-BR] This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: '[pt-BR] This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "[pt-BR] Welcome! Let's get you set up.",
        chatWithAccountManager: '[pt-BR] Chat with your account manager here',
        askMeAnything: '[pt-BR] Ask me anything!',
        sayHello: '[pt-BR] Say hello!',
        yourSpace: '[pt-BR] Your space',
        welcomeToRoom: (roomName: string) => `[pt-BR] Welcome to ${roomName}!`,
        usePlusButton: (additionalText: string) => `[pt-BR]  Use the + button to ${additionalText} an expense.`,
        askConcierge: '[pt-BR] This is your chat with Concierge, your personal AI agent. I can do almost anything, try me!',
        conciergeSupport: '[pt-BR] Your personal AI agent',
        create: '[pt-BR] create',
        iouTypes: {
            pay: '[pt-BR] pay',
            split: '[pt-BR] split',
            submit: '[pt-BR] submit',
            track: '[pt-BR] track',
            invoice: '[pt-BR] invoice',
        },
    },
    adminOnlyCanPost: '[pt-BR] Only admins can send messages in this room.',
    reportAction: {
        asCopilot: '[pt-BR] as copilot for',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `[pt-BR] created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `[pt-BR] created this report for any held expenses from deleted report #${reportID}`
                : `[pt-BR] created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: '[pt-BR] Notify everyone in this conversation',
    },
    newMessages: '[pt-BR] New messages',
    latestMessages: '[pt-BR] Latest messages',
    youHaveBeenBanned: "[pt-BR] Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: '[pt-BR] is typing...',
        areTyping: '[pt-BR] are typing...',
        multipleMembers: '[pt-BR] Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '[pt-BR] This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `[pt-BR] This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `[pt-BR] This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `[pt-BR] This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `[pt-BR] This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[pt-BR] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[pt-BR] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '[pt-BR] This booking is archived.',
    },
    writeCapabilityPage: {
        label: '[pt-BR] Who can post',
        writeCapability: {
            all: '[pt-BR] All members',
            admins: '[pt-BR] Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: '[pt-BR] Find something...',
        buttonMySettings: '[pt-BR] My settings',
        fabNewChat: '[pt-BR] Start chat',
        fabNewChatExplained: '[pt-BR] Open actions menu',
        fabScanReceiptExplained: '[pt-BR] Scan receipt',
        chatPinned: '[pt-BR] Chat pinned',
        draftedMessage: '[pt-BR] Drafted message',
        listOfChatMessages: '[pt-BR] List of chat messages',
        listOfChats: '[pt-BR] List of chats',
        saveTheWorld: '[pt-BR] Save the world',
        tooltip: '[pt-BR] Get started here!',
        redirectToExpensifyClassicModal: {
            title: '[pt-BR] Coming soon',
            description: "[pt-BR] We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        },
    },
    homePage: {
        forYou: '[pt-BR] For you',
        timeSensitiveSection: {
            title: '[pt-BR] Time sensitive',
            ctaFix: '[pt-BR] Fix',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `[pt-BR] Fix ${feedName} company card connection` : '[pt-BR] Fix company card connection'),
                defaultSubtitle: '[pt-BR] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `[pt-BR] Fix ${cardName} personal card connection` : '[pt-BR] Fix personal card connection'),
                subtitle: '[pt-BR] Wallet',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `[pt-BR] Fix ${integrationName} connection`,
                defaultSubtitle: '[pt-BR] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: '[pt-BR] We need your shipping address',
                subtitle: '[pt-BR] Provide an address to receive your Expensify Card.',
                cta: '[pt-BR] Add address',
            },
            addPaymentCard: {
                title: '[pt-BR] Add a payment card to keep using Expensify',
                subtitle: '[pt-BR] Account > Subscription',
                cta: '[pt-BR] Add',
            },
            activateCard: {
                title: '[pt-BR] Activate your Expensify Card',
                subtitle: '[pt-BR] Validate your card and start spending.',
                cta: '[pt-BR] Activate',
            },
            reviewCardFraud: {
                title: '[pt-BR] Review potential fraud on your Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `[pt-BR] Review ${amount} in potential fraud at ${merchant}`,
                subtitle: '[pt-BR] Expensify Card',
                cta: '[pt-BR] Review',
            },
            validateAccount: {
                title: '[pt-BR] Validate your account to continue using Expensify',
                subtitle: '[pt-BR] Account',
                cta: '[pt-BR] Validate',
            },
            fixFailedBilling: {
                title: "[pt-BR] We couldn't bill your card on file",
                subtitle: '[pt-BR] Subscription',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `[pt-BR] Free trial: ${days} ${days === 1 ? '[pt-BR] day' : '[pt-BR] days'} left!`,
            offer50Body: '[pt-BR] Get 50% off your first year!',
            offer25Body: '[pt-BR] Get 25% off your first year!',
            addCardBody: "[pt-BR] Don't wait! Add your payment card now.",
            ctaClaim: '[pt-BR] Claim',
            ctaAdd: '[pt-BR] Add card',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `[pt-BR] Time remaining: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: '[pt-BR] Time remaining: 1 day',
                other: (pluralCount: number) => `[pt-BR] Time remaining: ${pluralCount} days`,
            }),
        },
        assignedCards: '[pt-BR] Your Expensify Cards',
        assignedCardsRemaining: ({amount}: {amount: string}) => `[pt-BR] ${amount} remaining`,
        announcements: '[pt-BR] Announcements',
        discoverSection: {
            title: '[pt-BR] Discover',
            menuItemTitleNonAdmin: '[pt-BR] Learn how to create expenses and submit reports.',
            menuItemTitleAdmin: '[pt-BR] Learn how to invite members, edit approval workflows, and reconcile company cards.',
            menuItemDescription: '[pt-BR] See what Expensify can do in 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `[pt-BR] Submit ${count} ${count === 1 ? '[pt-BR] report' : '[pt-BR] reports'}`,
            approve: ({count}: {count: number}) => `[pt-BR] Approve ${count} ${count === 1 ? '[pt-BR] report' : '[pt-BR] reports'}`,
            pay: ({count}: {count: number}) => `[pt-BR] Pay ${count} ${count === 1 ? '[pt-BR] report' : '[pt-BR] reports'}`,
            export: ({count}: {count: number}) => `[pt-BR] Export ${count} ${count === 1 ? '[pt-BR] report' : '[pt-BR] reports'}`,
            begin: '[pt-BR] Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: "[pt-BR] You're done!",
                thumbsUpStarsDescription: '[pt-BR] Thumbs up to you, stay tuned for more tasks.',
                smallRocketTitle: '[pt-BR] All caught up',
                smallRocketDescription: '[pt-BR] Upcoming to-dos will launch here.',
                cowboyHatTitle: "[pt-BR] You're done!",
                cowboyHatDescription: '[pt-BR] All tasks are wrangled, keep an eye out for more.',
                trophy1Title: '[pt-BR] Nothing to show',
                trophy1Description: '[pt-BR] You did it! Keep an eye out for more to-dos.',
                palmTreeTitle: '[pt-BR] All caught up',
                palmTreeDescription: '[pt-BR] Time to relax but stay tuned for future tasks.',
                fishbowlBlueTitle: "[pt-BR] You're done!",
                fishbowlBlueDescription: "[pt-BR] We'll bubble up future tasks here.",
                targetTitle: '[pt-BR] All caught up',
                targetDescription: '[pt-BR] Way to stay on target. Check back for more tasks!',
                chairTitle: '[pt-BR] Nothing to show',
                chairDescription: "[pt-BR] Go relax, we'll list upcoming to-dos here.",
                broomTitle: "[pt-BR] You're done!",
                broomDescription: '[pt-BR] Tasks are clean, though stay tuned for more to-dos.',
                houseTitle: '[pt-BR] All caught up',
                houseDescription: '[pt-BR] This is your home base for upcoming to-dos.',
                conciergeBotTitle: '[pt-BR] Nothing to show',
                conciergeBotDescription: '[pt-BR] Beep boop beep boop, check back for more tasks!',
                checkboxTextTitle: '[pt-BR] All caught up',
                checkboxTextDescription: '[pt-BR] Check off your upcoming to-dos here.',
                flashTitle: "[pt-BR] You're done!",
                flashDescription: "[pt-BR] We'll zap your future tasks here.",
                sunglassesTitle: '[pt-BR] Nothing to show',
                sunglassesDescription: "[pt-BR] Time to chill, though stay tuned for what's next!",
                f1FlagsTitle: '[pt-BR] All caught up',
                f1FlagsDescription: "[pt-BR] You've finished all outstanding to-dos.",
            },
        },
        gettingStartedSection: {
            title: '[pt-BR] Getting started',
            createWorkspace: '[pt-BR] Create a workspace',
            connectAccounting: ({integrationName}: {integrationName: string}) => `[pt-BR] Connect to ${integrationName}`,
            customizeCategories: '[pt-BR] Customize accounting categories',
            linkCompanyCards: '[pt-BR] Link company cards',
            setupRules: '[pt-BR] Set up spend rules',
        },
        upcomingTravel: '[pt-BR] Upcoming travel',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `[pt-BR] Flight to ${destination}`,
            trainTo: ({destination}: {destination: string}) => `[pt-BR] Train to ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `[pt-BR] Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `[pt-BR] Car rental in ${destination}`,
            inOneWeek: '[pt-BR] In 1 week',
            inDays: () => ({
                one: '[pt-BR] In 1 day',
                other: (count: number) => `[pt-BR] In ${count} days`,
            }),
            today: '[pt-BR] Today',
        },
    },
    allSettingsScreen: {
        subscription: '[pt-BR] Subscription',
        domains: '[pt-BR] Domains',
    },
    tabSelector: {
        chat: '[pt-BR] Chat',
        room: '[pt-BR] Room',
        distance: '[pt-BR] Distance',
        manual: '[pt-BR] Manual',
        scan: '[pt-BR] Scan',
        map: '[pt-BR] Map',
        gps: '[pt-BR] GPS',
        odometer: '[pt-BR] Odometer',
    },
    spreadsheet: {
        upload: '[pt-BR] Upload a spreadsheet',
        import: '[pt-BR] Import spreadsheet',
        dragAndDrop: '[pt-BR] <muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `[pt-BR] <muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '[pt-BR] <muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `[pt-BR] <muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: '[pt-BR] File contains column headers',
        column: (name: string) => `[pt-BR] Column ${name}`,
        fieldNotMapped: (fieldName: string) => `[pt-BR] Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `[pt-BR] Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `[pt-BR] Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: '[pt-BR] Import successful',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[pt-BR] No categories have been added or updated.';
            }
            if (added && updated) {
                return `[pt-BR] ${added} ${added === 1 ? '[pt-BR] category' : '[pt-BR] categories'} added, ${updated} ${updated === 1 ? '[pt-BR] category' : '[pt-BR] categories'} updated.`;
            }
            if (added) {
                return added === 1 ? '[pt-BR] 1 category has been added.' : `[pt-BR] ${added} categories have been added.`;
            }
            return updated === 1 ? '[pt-BR] 1 category has been updated.' : `[pt-BR] ${updated} categories have been updated.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[pt-BR] ${transactions} transactions have been added.` : '[pt-BR] 1 transaction has been added.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[pt-BR] No members have been added or updated.';
            }
            if (added && updated) {
                return `[pt-BR] ${added} member${added > 1 ? '[pt-BR] s' : ''} added, ${updated} member${updated > 1 ? '[pt-BR] s' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `[pt-BR] ${updated} members have been updated.` : '[pt-BR] 1 member has been updated.';
            }
            return added > 1 ? `[pt-BR] ${added} members have been added.` : '[pt-BR] 1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `[pt-BR] ${tags} tags have been added.` : '[pt-BR] 1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: '[pt-BR] Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `[pt-BR] ${rates} per diem rates have been added.` : '[pt-BR] 1 per diem rate has been added.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[pt-BR] ${transactions} transactions have been imported.` : '[pt-BR] 1 transaction has been imported.',
        importFailedTitle: '[pt-BR] Import failed',
        importFailedDescription: '[pt-BR] Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: '[pt-BR] Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: '[pt-BR] File size must be greater than 0 bytes',
        invalidFileMessage:
            '[pt-BR] The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: '[pt-BR] Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: '[pt-BR] Import spreadsheet',
        downloadCSV: '[pt-BR] Download CSV',
        importMemberConfirmation: () => ({
            one: `[pt-BR] Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `[pt-BR] Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: '[pt-BR] Upload receipt',
        uploadMultiple: '[pt-BR] Upload receipts',
        desktopSubtitleSingle: `[pt-BR] or drag and drop it here`,
        desktopSubtitleMultiple: `[pt-BR] or drag and drop them here`,
        alternativeMethodsTitle: '[pt-BR] Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `[pt-BR] <label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `[pt-BR] <label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `[pt-BR] <label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `[pt-BR] <label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: '[pt-BR] Take a photo',
        cameraAccess: '[pt-BR] Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `[pt-BR] Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: '[pt-BR] Camera error',
        cameraErrorMessage: '[pt-BR] An error occurred while taking a photo. Please try again.',
        locationAccessTitle: '[pt-BR] Allow location access',
        locationAccessMessage: '[pt-BR] Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: '[pt-BR] Allow location access',
        locationErrorMessage: '[pt-BR] Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `[pt-BR] Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '[pt-BR] Let it go',
        dropMessage: '[pt-BR] Drop your file here',
        flash: '[pt-BR] flash',
        multiScan: '[pt-BR] multi-scan',
        shutter: '[pt-BR] shutter',
        gallery: '[pt-BR] gallery',
        deleteReceipt: '[pt-BR] Delete receipt',
        deleteConfirmation: '[pt-BR] Are you sure you want to delete this receipt?',
        addReceipt: '[pt-BR] Add receipt',
        addAdditionalReceipt: '[pt-BR] Add additional receipt',
        scanFailed: "[pt-BR] The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        crop: '[pt-BR] Crop',
        addAReceipt: {
            phrase1: '[pt-BR] Add a receipt',
            phrase2: '[pt-BR] or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: '[pt-BR] Scan receipt',
        recordDistance: '[pt-BR] Track distance',
        requestMoney: '[pt-BR] Create expense',
        perDiem: '[pt-BR] Create per diem',
        splitBill: '[pt-BR] Split expense',
        splitScan: '[pt-BR] Split receipt',
        splitDistance: '[pt-BR] Split distance',
        paySomeone: (name?: string) => `[pt-BR] Pay ${name ?? '[pt-BR] someone'}`,
        assignTask: '[pt-BR] Assign task',
        header: '[pt-BR] Quick action',
        noLongerHaveReportAccess: '[pt-BR] You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: '[pt-BR] Update destination',
        createReport: '[pt-BR] Create report',
        createTimeExpense: '[pt-BR] Create time expense',
    },
    iou: {
        amount: '[pt-BR] Amount',
        percent: '[pt-BR] Percent',
        date: '[pt-BR] Date',
        taxAmount: '[pt-BR] Tax amount',
        taxRate: '[pt-BR] Tax rate',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `[pt-BR] Approve ${formattedAmount}` : '[pt-BR] Approve'),
        approved: '[pt-BR] Approved',
        cash: '[pt-BR] Cash',
        card: '[pt-BR] Card',
        original: '[pt-BR] Original',
        split: '[pt-BR] Split',
        splitExpense: '[pt-BR] Split expense',
        splitDates: '[pt-BR] Split dates',
        splitDateRange: (startDate: string, endDate: string, count: number) => `[pt-BR] ${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `[pt-BR] ${amount} from ${merchant}`,
        splitByPercentage: '[pt-BR] Split by percentage',
        splitByDate: '[pt-BR] Split by date',
        addSplit: '[pt-BR] Add split',
        makeSplitsEven: '[pt-BR] Make splits even',
        editSplits: '[pt-BR] Edit splits',
        totalAmountGreaterThanOriginal: (amount: string) => `[pt-BR] Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: (amount: string) => `[pt-BR] Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: '[pt-BR] Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: '[pt-BR] No splits added. Add at least one to save.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `[pt-BR] Edit ${amount} for ${merchant}`,
        removeSplit: '[pt-BR] Remove split',
        splitExpenseCannotBeEditedModalTitle: "[pt-BR] This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: '[pt-BR] Approved or paid expenses cannot be edited',
        paySomeone: (name?: string) => `[pt-BR] Pay ${name ?? '[pt-BR] someone'}`,
        splitExpenseDistanceErrorModalDescription: '[pt-BR] Please fix the distance rate error and try again.',
        splitExpensePerDiemRateErrorModalDescription: '[pt-BR] Please fix the per diem rate error and try again.',
        expense: '[pt-BR] Expense',
        categorize: '[pt-BR] Categorize',
        share: '[pt-BR] Share',
        participants: '[pt-BR] Participants',
        createExpense: '[pt-BR] Create expense',
        trackDistance: '[pt-BR] Track distance',
        createExpenses: (expensesNumber: number) => `[pt-BR] Create ${expensesNumber} expenses`,
        removeExpense: '[pt-BR] Remove expense',
        removeThisExpense: '[pt-BR] Remove this expense',
        removeExpenseConfirmation: '[pt-BR] Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: '[pt-BR] Add expense',
        chooseRecipient: '[pt-BR] Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `[pt-BR] Create ${amount} expense`,
        confirmDetails: '[pt-BR] Confirm details',
        pay: '[pt-BR] Pay',
        cancelPayment: '[pt-BR] Cancel payment',
        cancelPaymentConfirmation: '[pt-BR] Are you sure that you want to cancel this payment?',
        viewDetails: '[pt-BR] View details',
        pending: '[pt-BR] Pending',
        canceled: '[pt-BR] Canceled',
        posted: '[pt-BR] Posted',
        deleteReceipt: '[pt-BR] Delete receipt',
        findExpense: '[pt-BR] Find expense',
        deletedTransaction: (amount: string, merchant: string) => `[pt-BR] deleted an expense (${amount} for ${merchant})`,
        movedFromReport: (reportName: string) => `[pt-BR] moved an expense${reportName ? `[pt-BR]  from ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `[pt-BR] moved this expense${reportName ? `[pt-BR]  to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `[pt-BR] moved this expense${reportName ? `[pt-BR]  from <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `[pt-BR] moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `[pt-BR] moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `[pt-BR] moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: '[pt-BR] Receipt pending match with card transaction',
        pendingMatch: '[pt-BR] Pending match',
        pendingMatchWithCreditCardDescription: '[pt-BR] Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: '[pt-BR] Mark as cash',
        pendingMatchSubmitTitle: '[pt-BR] Submit report',
        pendingMatchSubmitDescription: '[pt-BR] Some expenses are awaiting a match with a credit card transaction. Do you want to mark them as cash?',
        routePending: '[pt-BR] Route pending...',
        automaticallyEnterExpenseDetails: '[pt-BR] Concierge will automatically enter the expense details for you, or you can add them manually.',
        receiptScanning: () => ({
            one: '[pt-BR] Receipt scanning...',
            other: '[pt-BR] Receipts scanning...',
        }),
        scanMultipleReceipts: '[pt-BR] Scan multiple receipts',
        scanMultipleReceiptsDescription: "[pt-BR] Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: '[pt-BR] Receipt scan in progress',
        receiptScanInProgressDescription: '[pt-BR] Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: '[pt-BR] Remove from report',
        moveToPersonalSpace: '[pt-BR] Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '[pt-BR] Potential duplicate expenses identified. Review duplicates to enable submission.'
                : '[pt-BR] Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: '[pt-BR] Issue found',
            other: '[pt-BR] Issues found',
        }),
        fieldPending: '[pt-BR] Pending...',
        defaultRate: '[pt-BR] Default rate',
        receiptMissingDetails: '[pt-BR] Receipt missing details',
        missingAmount: '[pt-BR] Missing amount',
        missingMerchant: '[pt-BR] Missing merchant',
        receiptStatusTitle: '[pt-BR] Scanning…',
        receiptStatusText: "[pt-BR] Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: '[pt-BR] Receipt scanning failed. Please enter the details manually.',
        transactionPendingDescription: '[pt-BR] Transaction pending. It may take a few days to post.',
        companyInfo: '[pt-BR] Company info',
        companyInfoDescription: '[pt-BR] We need a few more details before you can send your first invoice.',
        yourCompanyName: '[pt-BR] Your company name',
        yourCompanyWebsite: '[pt-BR] Your company website',
        yourCompanyWebsiteNote: "[pt-BR] If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: '[pt-BR] You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: '[pt-BR] You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '[pt-BR] 1 expense',
                other: (count: number) => `[pt-BR] ${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: '[pt-BR] Delete expense',
            other: '[pt-BR] Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: '[pt-BR] Are you sure that you want to delete this expense?',
            other: '[pt-BR] Are you sure that you want to delete these expenses?',
        }),
        deleteReport: () => ({
            one: '[pt-BR] Delete report',
            other: '[pt-BR] Delete reports',
        }),
        deleteReportConfirmation: () => ({
            one: '[pt-BR] Are you sure that you want to delete this report?',
            other: '[pt-BR] Are you sure that you want to delete these reports?',
        }),
        settledExpensify: '[pt-BR] Paid',
        done: '[pt-BR] Done',
        settledElsewhere: '[pt-BR] Paid elsewhere',
        individual: '[pt-BR] Individual',
        business: '[pt-BR] Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `[pt-BR] Pay ${formattedAmount} as an individual` : `[pt-BR] Pay with personal account`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `[pt-BR] Pay ${formattedAmount} with wallet` : `[pt-BR] Pay with wallet`),
        settlePayment: (formattedAmount: string) => `[pt-BR] Pay ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `[pt-BR] Pay ${formattedAmount} as a business` : `[pt-BR] Pay with business account`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `[pt-BR] Mark ${formattedAmount} as paid` : `[pt-BR] Mark as paid`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `[pt-BR] paid ${amount} with personal account ${last4Digits}` : `[pt-BR] Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `[pt-BR] paid ${amount} with business account ${last4Digits}` : `[pt-BR] Paid with business account`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `[pt-BR] Pay ${formattedAmount} via ${policyName}` : `[pt-BR] Pay via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) =>
            amount ? `[pt-BR] paid ${amount} with bank account ${last4Digits}` : `[pt-BR] paid with bank account ${last4Digits}`,
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `[pt-BR] paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `[pt-BR] Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `[pt-BR] Business Account • ${lastFour}`,
        nextStep: '[pt-BR] Next steps',
        finished: '[pt-BR] Finished',
        flip: '[pt-BR] Flip',
        sendInvoice: (amount: string) => `[pt-BR] Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `[pt-BR]  for ${comment}` : ''}`,
        submitted: (memo?: string) => `[pt-BR] submitted${memo ? `[pt-BR] , saying ${memo}` : ''}`,
        automaticallySubmitted: `[pt-BR] submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: '[pt-BR] queued to submit via custom approval workflow',
        failedToAutoSubmitViaDEW: (reason: string) => `[pt-BR] failed to submit the report via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `[pt-BR] failed to submit the report. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `[pt-BR] failed to approve via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `[pt-BR] failed to approve. ${reason}`,
        queuedToApproveViaDEW: '[pt-BR] queued to approve via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `[pt-BR] tracking ${formattedAmount}${comment ? `[pt-BR]  for ${comment}` : ''}`,
        splitAmount: (amount: string) => `[pt-BR] split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `[pt-BR] split ${formattedAmount}${comment ? `[pt-BR]  for ${comment}` : ''}`,
        yourSplit: (amount: string) => `[pt-BR] Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `[pt-BR] ${payer} owes ${amount}${comment ? `[pt-BR]  for ${comment}` : ''}`,
        payerOwes: (payer: string) => `[pt-BR] ${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `[pt-BR] ${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: (payer: string) => `[pt-BR] ${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `[pt-BR] ${payer} spent ${amount}`,
        payerSpent: (payer: string) => `[pt-BR] ${payer} spent: `,
        managerApproved: (manager: string) => `[pt-BR] ${manager} approved:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `[pt-BR] ${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `[pt-BR] paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `[pt-BR] paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `[pt-BR] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `[pt-BR] approved ${amount}`,
        approvedMessage: `[pt-BR] approved`,
        unapproved: `[pt-BR] unapproved`,
        automaticallyForwarded: `[pt-BR] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `[pt-BR] approved`,
        rejectedThisReport: '[pt-BR] rejected',
        waitingOnBankAccount: (submitterDisplayName: string) => `[pt-BR] started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: '[pt-BR] canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `[pt-BR] canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `[pt-BR] ${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `[pt-BR] ${payer ? `${payer} ` : ''}marked as paid${comment ? `[pt-BR] , saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `[pt-BR] ${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `[pt-BR] ${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        reimbursedThisReport: '[pt-BR] reimbursed this report',
        paidThisBill: '[pt-BR] paid this bill',
        reimbursedOnBehalfOf: (actor: string) => `[pt-BR] on behalf of ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `[pt-BR] from the bank account ending in ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `[pt-BR] ${submitter} added a bank account, taking report off hold. Reimbursement is initiated`,
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
                ? `[pt-BR] . Money is on its way to your${creditBankAccount ? `[pt-BR]  bank account ending in ${creditBankAccount}` : '[pt-BR]  account'}. Reimbursement estimated to complete on ${expectedDate}.`
                : `[pt-BR] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[pt-BR]  bank account ending in ${creditBankAccount}` : '[pt-BR]  account'}. Reimbursement estimated to complete on ${expectedDate}.`,
        reimbursedWithCheck: '[pt-BR]  via check.',
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
            const paymentMethod = isCard ? '[pt-BR] card' : '[pt-BR] bank account';
            return isCurrentUser
                ? `[pt-BR] . Money is on its way to your${creditBankAccount ? `[pt-BR]  bank account ending in ${creditBankAccount}` : '[pt-BR]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`
                : `[pt-BR] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[pt-BR]  bank account ending in ${creditBankAccount}` : '[pt-BR]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `[pt-BR]  with direct deposit (ACH)${creditBankAccount ? `[pt-BR]  to the bank account ending in ${creditBankAccount}. ` : '. '}${expectedDate ? `[pt-BR] The reimbursement is estimated to complete by ${expectedDate}.` : '[pt-BR] This generally takes 4-5 business days.'}`,
        noReimbursableExpenses: '[pt-BR] This report has an invalid amount',
        pendingConversionMessage: "[pt-BR] Total will update when you're back online",
        changedTheExpense: '[pt-BR] changed the expense',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `[pt-BR] the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `[pt-BR] set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `[pt-BR] the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) =>
            `[pt-BR] the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `[pt-BR] changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: '[pt-BR] based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `[pt-BR] based on <a href="${rulesLink}">workspace rules</a>` : '[pt-BR] based on workspace rule'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `[pt-BR] for ${comment}` : '[pt-BR] expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `[pt-BR] Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `[pt-BR] ${formattedAmount} sent${comment ? `[pt-BR]  for ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) =>
            `[pt-BR] moved expense from personal space to ${workspaceName ?? `[pt-BR] chat with ${reportName}`}`,
        movedToPersonalSpace: '[pt-BR] moved expense to personal space',
        error: {
            invalidCategoryLength: '[pt-BR] The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: '[pt-BR] The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: '[pt-BR] Please enter a valid amount before continuing',
            invalidDistance: '[pt-BR] Please enter a valid distance before continuing',
            invalidReadings: '[pt-BR] Please enter both start and end readings',
            negativeDistanceNotAllowed: '[pt-BR] End reading must be greater than start reading',
            distanceAmountTooLarge: '[pt-BR] The total amount is too large. Reduce the distance or lower the rate.',
            distanceAmountTooLargeReduceDistance: '[pt-BR] The total amount is too large. Reduce the distance.',
            distanceAmountTooLargeReduceRate: '[pt-BR] The total amount is too large. Lower the rate.',
            odometerReadingTooLarge: (formattedMax: string) => `[pt-BR] Odometer readings cannot exceed ${formattedMax}.`,
            stitchOdometerImagesFailed: '[pt-BR] Failed to combine odometer images. Please try again later.',
            invalidIntegerAmount: '[pt-BR] Please enter a whole dollar amount before continuing',
            invalidTaxAmount: (amount: string) => `[pt-BR] Maximum tax amount is ${amount}`,
            invalidSplit: '[pt-BR] The sum of splits must equal the total amount',
            invalidSplitParticipants: '[pt-BR] Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: '[pt-BR] Please enter a non-zero amount for your split',
            noParticipantSelected: '[pt-BR] Please select a participant',
            other: '[pt-BR] Unexpected error. Please try again later.',
            genericCreateFailureMessage: '[pt-BR] Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: '[pt-BR] Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: '[pt-BR] Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: '[pt-BR] Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: '[pt-BR] Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '[pt-BR] <rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: '[pt-BR] There was an error uploading your receipt.',
            genericDeleteFailureMessage: '[pt-BR] Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: '[pt-BR] Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: '[pt-BR] Transaction is missing fields',
            duplicateWaypointsErrorMessage: '[pt-BR] Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: '[pt-BR] Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: '[pt-BR] An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: '[pt-BR] Please enter a valid merchant',
            atLeastOneAttendee: '[pt-BR] At least one attendee must be selected',
            invalidQuantity: '[pt-BR] Please enter a valid quantity',
            quantityGreaterThanZero: '[pt-BR] Quantity must be greater than zero',
            invalidSubrateLength: '[pt-BR] There must be at least one subrate',
            invalidRate: '[pt-BR] Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "[pt-BR] The end date can't be before the start date",
            endDateSameAsStartDate: "[pt-BR] The end date can't be the same as the start date",
            manySplitsProvided: `[pt-BR] The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `[pt-BR] The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
        },
        dismissReceiptError: '[pt-BR] Dismiss error',
        dismissReceiptErrorConfirmation: '[pt-BR] Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `[pt-BR] started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: '[pt-BR] Enable wallet',
        hold: '[pt-BR] Hold',
        unhold: '[pt-BR] Remove hold',
        holdExpense: () => ({
            one: '[pt-BR] Hold expense',
            other: '[pt-BR] Hold expenses',
        }),
        unholdExpense: '[pt-BR] Unhold expense',
        heldExpense: '[pt-BR] held this expense',
        unheldExpense: '[pt-BR] unheld this expense',
        moveUnreportedExpense: '[pt-BR] Move unreported expense',
        addUnreportedExpense: '[pt-BR] Add unreported expense',
        selectUnreportedExpense: '[pt-BR] Select at least one expense to add to the report.',
        emptyStateUnreportedExpenseTitle: '[pt-BR] No unreported expenses',
        emptyStateUnreportedExpenseSubtitle: '[pt-BR] Looks like you don’t have any unreported expenses. Try creating one below.',
        addUnreportedExpenseConfirm: '[pt-BR] Add to report',
        newReport: '[pt-BR] New report',
        explainHold: () => ({
            one: "[pt-BR] Explain why you're holding this expense.",
            other: "[pt-BR] Explain why you're holding these expenses.",
        }),
        explainHoldApprover: () => ({
            one: '[pt-BR] Explain what you need before approving this expense.',
            other: '[pt-BR] Explain what you need before approving these expenses.',
        }),
        retracted: '[pt-BR] retracted',
        retract: '[pt-BR] Retract',
        reopened: '[pt-BR] reopened',
        reopenReport: '[pt-BR] Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `[pt-BR] This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: '[pt-BR] Reason',
        holdReasonRequired: '[pt-BR] A reason is required when holding.',
        expenseWasPutOnHold: '[pt-BR] Expense was put on hold',
        expenseOnHold: '[pt-BR] This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: '[pt-BR] All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: '[pt-BR] This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: '[pt-BR] Some of these duplicates have been approved or paid already.',
        reviewDuplicates: '[pt-BR] Review duplicates',
        keepAll: '[pt-BR] Keep all',
        noDuplicatesTitle: '[pt-BR] All set!',
        noDuplicatesDescription: '[pt-BR] There are no duplicate transactions for review here.',
        confirmApprove: '[pt-BR] Confirm approval amount',
        confirmApprovalAmount: '[pt-BR] Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: '[pt-BR] This expense is on hold. Do you want to approve anyway?',
            other: '[pt-BR] These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: '[pt-BR] Confirm payment amount',
        confirmPayAmount: "[pt-BR] Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: '[pt-BR] This expense is on hold. Do you want to pay anyway?',
            other: '[pt-BR] These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: '[pt-BR] Pay only',
        approveOnly: '[pt-BR] Approve only',
        holdEducationalTitle: '[pt-BR] Should you hold this expense?',
        whatIsHoldExplain: "[pt-BR] Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: '[pt-BR] Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "[pt-BR] Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: '[pt-BR] You moved this report!',
            description: '[pt-BR] Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '[pt-BR] <strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: '[pt-BR] This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: '[pt-BR] Change workspace',
        set: '[pt-BR] set',
        changed: '[pt-BR] changed',
        removed: '[pt-BR] removed',
        transactionPending: '[pt-BR] Transaction pending.',
        chooseARate: '[pt-BR] Select a workspace reimbursement rate per mile or kilometer',
        unapprove: '[pt-BR] Unapprove',
        unapproveReport: '[pt-BR] Unapprove report',
        headsUp: '[pt-BR] Heads up!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `[pt-BR] This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: '[pt-BR] reimbursable',
        nonReimbursable: '[pt-BR] non-reimbursable',
        bookingPending: '[pt-BR] This booking is pending',
        bookingPendingDescription: "[pt-BR] This booking is pending because it hasn't been paid yet.",
        bookingArchived: '[pt-BR] This booking is archived',
        bookingArchivedDescription: '[pt-BR] This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: '[pt-BR] Attendees',
        totalPerAttendee: '[pt-BR] Per attendee',
        whoIsYourAccountant: '[pt-BR] Who is your accountant?',
        paymentComplete: '[pt-BR] Payment complete',
        time: '[pt-BR] Time',
        startDate: '[pt-BR] Start date',
        endDate: '[pt-BR] End date',
        startTime: '[pt-BR] Start time',
        endTime: '[pt-BR] End time',
        deleteSubrate: '[pt-BR] Delete subrate',
        deleteSubrateConfirmation: '[pt-BR] Are you sure you want to delete this subrate?',
        quantity: '[pt-BR] Quantity',
        subrateSelection: '[pt-BR] Select a subrate and enter a quantity.',
        qty: '[pt-BR] Qty',
        firstDayText: () => ({
            one: `[pt-BR] First day: 1 hour`,
            other: (count: number) => `[pt-BR] First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `[pt-BR] Last day: 1 hour`,
            other: (count: number) => `[pt-BR] Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `[pt-BR] Trip: 1 full day`,
            other: (count: number) => `[pt-BR] Trip: ${count} full days`,
        }),
        dates: '[pt-BR] Dates',
        rates: '[pt-BR] Rates',
        submitsTo: (name: string) => `[pt-BR] Submits to ${name}`,
        reject: {
            educationalTitle: '[pt-BR] Should you hold or reject?',
            educationalText: "[pt-BR] If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: '[pt-BR] Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: '[pt-BR] Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: '[pt-BR] Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "[pt-BR] Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: '[pt-BR] Reject expense',
            reasonPageDescription: '[pt-BR] Explain why you will not approve this expense.',
            rejectReason: '[pt-BR] Rejection reason',
            markAsResolved: '[pt-BR] Mark as resolved',
            rejectedStatus: '[pt-BR] This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: '[pt-BR] rejected this expense',
                markedAsResolved: '[pt-BR] marked the rejection reason as resolved',
            },
        },
        rejectReport: {
            title: '[pt-BR] Reject report',
            description: '[pt-BR] Explain why you will not approve this report:',
            rejectReason: '[pt-BR] Rejection reason',
            selectTarget: '[pt-BR] Choose the member to reject this report back to for review:',
            lastApprover: '[pt-BR] Last approver',
            submitter: '[pt-BR] Submitter',
            rejectedReportMessage: '[pt-BR] This report was rejected.',
            rejectedNextStep: '[pt-BR] This report was rejected. Waiting on you to fix the issues and manually resubmit.',
            selectMemberError: '[pt-BR] Select a member to reject this report back to.',
            couldNotReject: '[pt-BR] The report could not be rejected. Please try again.',
        },
        moveExpenses: '[pt-BR] Move to report',
        moveExpensesError: "[pt-BR] You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: '[pt-BR] Change approver',
            header: (workflowSettingLink: string) =>
                `[pt-BR] Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `[pt-BR] changed the approver to <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '[pt-BR] Add approver',
                addApproverSubtitle: '[pt-BR] Add an additional approver to the existing workflow.',
                bypassApprovers: '[pt-BR] Bypass approvers',
                bypassApproversSubtitle: '[pt-BR] Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: '[pt-BR] Choose an additional approver for this report before we route through the rest of the approval workflow.',
                bulkSubtitle: '[pt-BR] Choose an additional approver for these reports before we route through the rest of the approval workflow.',
            },
            bulkSubtitle: '[pt-BR] Choose an option to change the approver for these reports.',
        },
        chooseWorkspace: '[pt-BR] Choose a workspace',
        routedDueToDEW: (to: string, reason?: string) => `[pt-BR] report routed to ${to}${reason ? `[pt-BR]  because ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `[pt-BR] ${hours} ${hours === 1 ? '[pt-BR] hour' : '[pt-BR] hours'} @ ${rate} / hour`,
            hrs: '[pt-BR] hrs',
            hours: '[pt-BR] Hours',
            ratePreview: (rate: string) => `[pt-BR] ${rate} / hour`,
            amountTooLargeError: '[pt-BR] The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctRateError: '[pt-BR] Fix the rate error and try again.',
        AskToExplain: `[pt-BR] . <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explain<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '[pt-BR] marked the expense as "reimbursable"' : '[pt-BR] marked the expense as "non-reimbursable"'),
            billable: (value: boolean) => (value ? '[pt-BR] marked the expense as "billable"' : '[pt-BR] marked the expense as "non-billable"'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `[pt-BR] set the tax rate to "${value}"` : `[pt-BR] tax rate to "${value}"`),
            reportName: (value: string) => `[pt-BR] moved this expense to report "${value}"`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `[pt-BR] set the ${field} to "${value}"` : `[pt-BR] ${field} to "${value}"`;
            },
            formatPersonalRules: (fragments: string, route: string) => `[pt-BR] ${fragments} via <a href="${route}">personal expense rules</a>`,
            formatPolicyRules: (fragments: string, route: string) => `[pt-BR] ${fragments} via <a href="${route}">workspace rules</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: "[pt-BR] You can't duplicate per diem expenses across workspaces because the rates may differ between workspaces.",
        cannotDuplicateDistanceExpense: "[pt-BR] You can't duplicate distance expenses across workspaces because the rates may differ between workspaces.",
        taxDisabledAlert: {
            title: '[pt-BR] Tax disabled',
            prompt: '[pt-BR] Enable tax tracking on the workspace to edit the expense details or delete the tax from this expense.',
            confirmText: '[pt-BR] Delete tax',
        },
    },
    transactionMerge: {
        listPage: {
            header: '[pt-BR] Merge expenses',
            noEligibleExpenseFound: '[pt-BR] No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `[pt-BR] <muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `[pt-BR] Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '[pt-BR] Select receipt',
            pageTitle: '[pt-BR] Select the receipt you want to keep:',
        },
        detailsPage: {
            header: '[pt-BR] Select details',
            pageTitle: '[pt-BR] Select the details you want to keep:',
            noDifferences: '[pt-BR] No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '[pt-BR] an' : '[pt-BR] a';
                return `[pt-BR] Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: '[pt-BR] Please select attendees',
            selectAllDetailsError: '[pt-BR] Select all details before continuing.',
        },
        confirmationPage: {
            header: '[pt-BR] Confirm details',
            pageTitle: "[pt-BR] Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: '[pt-BR] Merge expenses',
        },
    },
    share: {
        shareToExpensify: '[pt-BR] Share to Expensify',
        messageInputLabel: '[pt-BR] Message',
    },
    notificationPreferencesPage: {
        header: '[pt-BR] Notification preferences',
        label: '[pt-BR] Notify me about new messages',
        notificationPreferences: {
            always: '[pt-BR] Immediately',
            daily: '[pt-BR] Daily',
            mute: '[pt-BR] Mute',
            hidden: '[pt-BR][ctx: UI label indicating that something is concealed or not visible to the user.] Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "[pt-BR] The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "[pt-BR] The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: '[pt-BR] Upload photo',
        removePhoto: '[pt-BR] Remove photo',
        editImage: '[pt-BR] Edit photo',
        viewPhoto: '[pt-BR] View photo',
        imageUploadFailed: '[pt-BR] Image upload failed',
        deleteWorkspaceError: '[pt-BR] Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `[pt-BR] The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `[pt-BR] Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `[pt-BR] Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: '[pt-BR] Edit profile picture',
        upload: '[pt-BR] Upload',
        uploadPhoto: '[pt-BR] Upload photo',
        selectAvatar: '[pt-BR] Select avatar',
        choosePresetAvatar: '[pt-BR] Or choose a custom avatar',
    },
    modal: {
        backdropLabel: '[pt-BR] Modal Backdrop',
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
                        return `[pt-BR] Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] Waiting for an admin to add expenses.`;
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
                        return `[pt-BR] Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] Waiting for an admin to submit expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `[pt-BR] No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[pt-BR] Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] Waiting for an admin to add a bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[pt-BR]  on the ${eta} of each month` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[pt-BR] Waiting for your expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] Waiting for an admin's expenses to automatically submit${formattedETA}.`;
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
                        return `[pt-BR] Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] Waiting for an admin to fix the issues.`;
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
                        return `[pt-BR] Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] Waiting for an admin to approve expenses.`;
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
                        return `[pt-BR] Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] Waiting for an admin to export this report.`;
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
                        return `[pt-BR] Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] Waiting for an admin to pay expenses.`;
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
                        return `[pt-BR] Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] Waiting for an admin to finish setting up a business bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[pt-BR]  by ${eta}` : ` ${eta}`;
                }
                return `[pt-BR] Waiting for payment to complete${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `[pt-BR] Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[pt-BR] This report was rejected. Waiting on <strong>you</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[pt-BR] This report was rejected. Waiting on <strong>${actor}</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[pt-BR] This report was rejected. Waiting on an admin to fix the issues and manually resubmit.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '[pt-BR] shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '[pt-BR] later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '[pt-BR] on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '[pt-BR] on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '[pt-BR] on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '[pt-BR] on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '[pt-BR] at the end of your trip',
        },
    },
    profilePage: {
        profile: '[pt-BR] Profile',
        preferredPronouns: '[pt-BR] Preferred pronouns',
        selectYourPronouns: '[pt-BR] Select your pronouns',
        selfSelectYourPronoun: '[pt-BR] Self-select your pronoun',
        emailAddress: '[pt-BR] Email address',
        setMyTimezoneAutomatically: '[pt-BR] Set my timezone automatically',
        timezone: '[pt-BR] Timezone',
        invalidFileMessage: '[pt-BR] Invalid file. Please try a different image.',
        avatarUploadFailureMessage: '[pt-BR] An error occurred uploading the avatar. Please try again.',
        online: '[pt-BR] Online',
        offline: '[pt-BR] Offline',
        syncing: '[pt-BR] Syncing',
        profileAvatar: '[pt-BR] Profile avatar',
        publicSection: {
            title: '[pt-BR] Public',
            subtitle: '[pt-BR] These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: '[pt-BR] Private',
            subtitle: "[pt-BR] These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: '[pt-BR] Security options',
        subtitle: '[pt-BR] Enable two-factor authentication to keep your account safe.',
        goToSecurity: '[pt-BR] Go back to security page',
    },
    shareCodePage: {
        title: '[pt-BR] Your code',
        subtitle: '[pt-BR] Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: '[pt-BR] Pronouns',
        isShownOnProfile: '[pt-BR] Your pronouns are shown on your profile.',
        placeholderText: '[pt-BR] Search to see options',
    },
    contacts: {
        contactMethods: '[pt-BR] Contact methods',
        featureRequiresValidate: '[pt-BR] This feature requires you to validate your account.',
        validateAccount: '[pt-BR] Validate your account',
        helpText: ({email}: {email: string}) =>
            `[pt-BR] Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: '[pt-BR] Please verify this contact method.',
        getInTouch: "[pt-BR] We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `[pt-BR] Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '[pt-BR] Set as default',
        yourDefaultContactMethod: "[pt-BR] This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        yourDefaultContactMethodRestrictedSwitch: '[pt-BR] This is your current default contact method. Your company has restricted removing or changing it.',
        removeContactMethod: '[pt-BR] Remove contact method',
        removeAreYouSure: "[pt-BR] Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: '[pt-BR] Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: '[pt-BR] Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: '[pt-BR] Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: '[pt-BR] Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: '[pt-BR] Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: '[pt-BR] Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: '[pt-BR] This contact method already exists',
            passwordRequired: '[pt-BR] password required.',
            contactMethodRequired: '[pt-BR] Contact method is required',
            invalidContactMethod: '[pt-BR] Invalid contact method',
        },
        newContactMethod: '[pt-BR] New contact method',
        goBackContactMethods: '[pt-BR] Go back to contact methods',
    },
    pronouns: {
        coCos: '[pt-BR] Co / Cos',
        eEyEmEir: '[pt-BR] E / Ey / Em / Eir',
        faeFaer: '[pt-BR] Fae / Faer',
        heHimHis: '[pt-BR] He / Him / His',
        heHimHisTheyThemTheirs: '[pt-BR] He / Him / His / They / Them / Theirs',
        sheHerHers: '[pt-BR] She / Her / Hers',
        sheHerHersTheyThemTheirs: '[pt-BR] She / Her / Hers / They / Them / Theirs',
        merMers: '[pt-BR] Mer / Mers',
        neNirNirs: '[pt-BR] Ne / Nir / Nirs',
        neeNerNers: '[pt-BR] Nee / Ner / Ners',
        perPers: '[pt-BR] Per / Pers',
        theyThemTheirs: '[pt-BR] They / Them / Theirs',
        thonThons: '[pt-BR] Thon / Thons',
        veVerVis: '[pt-BR] Ve / Ver / Vis',
        viVir: '[pt-BR] Vi / Vir',
        xeXemXyr: '[pt-BR] Xe / Xem / Xyr',
        zeZieZirHir: '[pt-BR] Ze / Zie / Zir / Hir',
        zeHirHirs: '[pt-BR] Ze / Hir',
        callMeByMyName: '[pt-BR] Call me by my name',
    },
    displayNamePage: {
        headerTitle: '[pt-BR] Display name',
        isShownOnProfile: '[pt-BR] Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: '[pt-BR] Timezone',
        isShownOnProfile: '[pt-BR] Your timezone is shown on your profile.',
        getLocationAutomatically: '[pt-BR] Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: '[pt-BR] Update required',
        pleaseInstall: '[pt-BR] Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: '[pt-BR] Please install the latest version of Expensify',
        toGetLatestChanges: '[pt-BR] For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: '[pt-BR] The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: '[pt-BR] About',
        aboutPage: {
            description: '[pt-BR] The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: '[pt-BR] App download links',
            viewKeyboardShortcuts: '[pt-BR] View keyboard shortcuts',
            viewTheCode: '[pt-BR] View the code',
            viewOpenJobs: '[pt-BR] View open jobs',
            reportABug: '[pt-BR] Report a bug',
            troubleshoot: '[pt-BR] Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: '[pt-BR] Android',
            },
            ios: {
                label: '[pt-BR] iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '[pt-BR] Clear cache and restart',
            description:
                '[pt-BR] <muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: '[pt-BR] All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: '[pt-BR] Reset and refresh',
            clientSideLogging: '[pt-BR] Client side logging',
            noLogsToShare: '[pt-BR] No logs to share',
            useProfiling: '[pt-BR] Use profiling',
            profileTrace: '[pt-BR] Profile trace',
            results: '[pt-BR] Results',
            releaseOptions: '[pt-BR] Release options',
            testingPreferences: '[pt-BR] Testing preferences',
            useStagingServer: '[pt-BR] Use Staging Server',
            forceOffline: '[pt-BR] Force offline',
            simulatePoorConnection: '[pt-BR] Simulate poor internet connection',
            simulateFailingNetworkRequests: '[pt-BR] Simulate failing network requests',
            authenticationStatus: '[pt-BR] Authentication status',
            deviceCredentials: '[pt-BR] Device credentials',
            invalidate: '[pt-BR] Invalidate',
            destroy: '[pt-BR] Destroy',
            maskExportOnyxStateData: '[pt-BR] Mask fragile member data while exporting Onyx state',
            exportOnyxState: '[pt-BR] Export Onyx state',
            importOnyxState: '[pt-BR] Import Onyx state',
            testCrash: '[pt-BR] Test crash',
            resetToOriginalState: '[pt-BR] Reset to original state',
            usingImportedState: '[pt-BR] You are using imported state. Press here to clear it.',
            debugMode: '[pt-BR] Debug mode',
            invalidFile: '[pt-BR] Invalid file',
            invalidFileDescription: '[pt-BR] The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: '[pt-BR] Invalidate with delay',
            leftHandNavCache: '[pt-BR] Left Hand Nav cache',
            clearleftHandNavCache: '[pt-BR] Clear',
            softKillTheApp: '[pt-BR] Soft kill the app',
            kill: '[pt-BR] Kill',
            sentryDebug: '[pt-BR] Sentry debug',
            sentrySendDescription: '[pt-BR] Send data to Sentry',
            sentryDebugDescription: '[pt-BR] Log Sentry requests to console',
            sentryHighlightedSpanOps: '[pt-BR] Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: '[pt-BR] ui.interaction.click, navigation, ui.load',
        },
        security: '[pt-BR] Security',
        signOut: '[pt-BR] Sign out',
        restoreStashed: '[pt-BR] Restore stashed login',
        signOutConfirmationText: "[pt-BR] You'll lose any offline changes if you sign out.",
        versionLetter: '[pt-BR] v',
        readTheTermsAndPrivacy: `[pt-BR] Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.`,
        help: '[pt-BR] Help',
        helpPage: {
            title: '[pt-BR] Help and support',
            description: '[pt-BR] We are here to help you 24/7',
            helpSite: '[pt-BR] Help site',
            conciergeChat: '[pt-BR] Concierge',
            conciergeChatDescription: '[pt-BR] Your personal AI agent',
        },
        whatIsNew: "[pt-BR] What's new",
        accountSettings: '[pt-BR] Account settings',
        account: '[pt-BR] Account',
        general: '[pt-BR] General',
    },
    closeAccountPage: {
        closeAccount: '[pt-BR][ctx: close as a verb, not an adjective] Close account',
        reasonForLeavingPrompt: '[pt-BR] We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: '[pt-BR] Enter message here',
        closeAccountWarning: '[pt-BR] Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: '[pt-BR] Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: '[pt-BR] Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: '[pt-BR] Enter your default contact method',
        defaultContact: '[pt-BR] Default contact method:',
        enterYourDefaultContactMethod: '[pt-BR] Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: '[pt-BR] Merge accounts',
        accountDetails: {
            accountToMergeInto: (login: string) => `[pt-BR] Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: '[pt-BR] I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: '[pt-BR] Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: (login: string) => `[pt-BR] Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `[pt-BR] To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: '[pt-BR] Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: '[pt-BR] Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: '[pt-BR] Accounts merged!',
            description: (from: string, to: string) =>
                `[pt-BR] <muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '[pt-BR] We’re working on it',
            limitedSupport: '[pt-BR] We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp:
                '[pt-BR] <muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: '[pt-BR] Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `[pt-BR] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `[pt-BR] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `[pt-BR] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: '[pt-BR] Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `[pt-BR] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `[pt-BR] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `[pt-BR] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `[pt-BR] <muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '[pt-BR] Try again later',
            description: '[pt-BR] There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "[pt-BR] You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: '[pt-BR] You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: '[pt-BR] Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '[pt-BR] Report suspicious activity',
        lockAccount: '[pt-BR] Lock account',
        unlockAccount: '[pt-BR] Unlock account',
        unlockTitle: '[pt-BR] We’ve received your request',
        unlockDescription: '[pt-BR] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        compromisedDescription:
            '[pt-BR] Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: '[pt-BR] For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: '[pt-BR] Are you sure you want to lock your Expensify account?',
        onceLocked: '[pt-BR] Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '[pt-BR] Failed to lock account',
        failedToLockAccountDescription: `[pt-BR] We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: '[pt-BR] Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: '[pt-BR] Account locked',
        yourAccountIsLocked: '[pt-BR] Your account is locked',
        chatToConciergeToUnlock: '[pt-BR] Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: '[pt-BR] Chat with Concierge',
    },
    twoFactorAuth: {
        headerTitle: '[pt-BR] Two-factor authentication',
        twoFactorAuthEnabled: '[pt-BR] Two-factor authentication enabled',
        whatIsTwoFactorAuth:
            '[pt-BR] Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: '[pt-BR] Disable two-factor authentication',
        explainProcessToRemove: '[pt-BR] To disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: '[pt-BR] To disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: '[pt-BR] Two-factor authentication is now disabled',
        noAuthenticatorApp: '[pt-BR] You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: '[pt-BR] Recovery codes',
        keepCodesSafe: '[pt-BR] Keep these recovery codes safe!',
        codesLoseAccess: dedent(`
            [pt-BR] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            Note: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        errorStepCodes: '[pt-BR] Please copy or download codes before continuing',
        stepVerify: '[pt-BR] Verify',
        scanCode: '[pt-BR] Scan the QR code using your',
        authenticatorApp: '[pt-BR] authenticator app',
        addKey: '[pt-BR] Or add this secret key to your authenticator app:',
        secretKey: '[pt-BR] secret key',
        enterCode: '[pt-BR] Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: '[pt-BR] Finished',
        enabled: '[pt-BR] Two-factor authentication enabled',
        congrats: '[pt-BR] Congrats! Now you’ve got that extra security.',
        copy: '[pt-BR] Copy',
        disable: '[pt-BR] Disable',
        enableTwoFactorAuth: '[pt-BR] Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: '[pt-BR] Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: '[pt-BR] For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: '[pt-BR] Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: '[pt-BR] Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: '[pt-BR] Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: '[pt-BR] Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: '[pt-BR] Cannot disable 2FA',
        twoFactorAuthRequired: '[pt-BR] Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
        replaceDevice: '[pt-BR] Replace device',
        replaceDeviceTitle: '[pt-BR] Replace two-factor device',
        verifyOldDeviceTitle: '[pt-BR] Verify old device',
        verifyOldDeviceDescription: '[pt-BR] Enter the six-digit code from your current authenticator app to confirm you have access to it.',
        verifyNewDeviceTitle: '[pt-BR] Set up new device',
        verifyNewDeviceDescription: '[pt-BR] Scan the QR code with your new device, then enter the code to complete setup.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '[pt-BR] Please enter your recovery code',
            incorrectRecoveryCode: '[pt-BR] Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: '[pt-BR] Use recovery code',
        recoveryCode: '[pt-BR] Recovery code',
        use2fa: '[pt-BR] Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '[pt-BR] Please enter your two-factor authentication code',
            incorrect2fa: '[pt-BR] Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '[pt-BR] Password updated!',
        allSet: '[pt-BR] You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: '[pt-BR] Private notes',
        personalNoteMessage: "[pt-BR] Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: '[pt-BR] Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: '[pt-BR] Notes',
        myNote: '[pt-BR] My note',
        error: {
            genericFailureMessage: "[pt-BR] Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: '[pt-BR] Please enter a valid security code',
        },
        securityCode: '[pt-BR] Security code',
        changeBillingCurrency: '[pt-BR] Change billing currency',
        changePaymentCurrency: '[pt-BR] Change payment currency',
        paymentCurrency: '[pt-BR] Payment currency',
        paymentCurrencyDescription: '[pt-BR] Select a standardized currency that all personal expenses should be converted to',
        note: `[pt-BR] Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: '[pt-BR] Add a debit card',
        nameOnCard: '[pt-BR] Name on card',
        debitCardNumber: '[pt-BR] Debit card number',
        expiration: '[pt-BR] Expiration date',
        expirationDate: '[pt-BR] MMYY',
        cvv: '[pt-BR] CVV',
        billingAddress: '[pt-BR] Billing address',
        growlMessageOnSave: '[pt-BR] Your debit card was successfully added',
        expensifyPassword: '[pt-BR] Expensify password',
        error: {
            invalidName: '[pt-BR] Name can only include letters',
            addressZipCode: '[pt-BR] Please enter a valid zip code',
            debitCardNumber: '[pt-BR] Please enter a valid debit card number',
            expirationDate: '[pt-BR] Please select a valid expiration date',
            securityCode: '[pt-BR] Please enter a valid security code',
            addressStreet: "[pt-BR] Please enter a valid billing address that's not a PO box",
            addressState: '[pt-BR] Please select a state',
            addressCity: '[pt-BR] Please enter a city',
            genericFailureMessage: '[pt-BR] An error occurred while adding your card. Please try again.',
            password: '[pt-BR] Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '[pt-BR] Add payment card',
        nameOnCard: '[pt-BR] Name on card',
        paymentCardNumber: '[pt-BR] Card number',
        expiration: '[pt-BR] Expiration date',
        expirationDate: '[pt-BR] MM/YY',
        cvv: '[pt-BR] CVV',
        billingAddress: '[pt-BR] Billing address',
        growlMessageOnSave: '[pt-BR] Your payment card was successfully added',
        expensifyPassword: '[pt-BR] Expensify password',
        error: {
            invalidName: '[pt-BR] Name can only include letters',
            addressZipCode: '[pt-BR] Please enter a valid zip code',
            paymentCardNumber: '[pt-BR] Please enter a valid card number',
            expirationDate: '[pt-BR] Please select a valid expiration date',
            securityCode: '[pt-BR] Please enter a valid security code',
            addressStreet: "[pt-BR] Please enter a valid billing address that's not a PO box",
            addressState: '[pt-BR] Please select a state',
            addressCity: '[pt-BR] Please enter a city',
            genericFailureMessage: '[pt-BR] An error occurred while adding your card. Please try again.',
            password: '[pt-BR] Please enter your Expensify password',
        },
    },
    personalCard: {
        addPersonalCard: '[pt-BR] Add personal card',
        addCompanyCard: '[pt-BR] Add company card',
        lookingForCompanyCards: '[pt-BR] Need to add company cards?',
        lookingForCompanyCardsDescription: '[pt-BR] Bring your own cards from 10,000+ banks worldwide.',
        personalCardAdded: '[pt-BR] Personal card added!',
        personalCardAddedDescription: '[pt-BR] Congrats, we’ll begin importing transactions from your card.',
        isPersonalCard: '[pt-BR] Is this a personal card?',
        thisIsPersonalCard: '[pt-BR] This is a personal card',
        thisIsCompanyCard: '[pt-BR] This is a company card',
        askAdmin: '[pt-BR] Ask your admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `[pt-BR] If so, great! But if it's a <strong>company</strong> card, please ${isAdmin ? '[pt-BR] assign it from your workspace instead.' : '[pt-BR] ask your admin to assign it to you from the workspace instead.'}`,
        bankConnectionError: '[pt-BR] Bank connection issue',
        bankConnectionDescription: '[pt-BR] Please try adding your cards again. Otherwise, you can',
        connectWithPlaid: '[pt-BR] connect via Plaid.',
        brokenConnection: '[pt-BR] Your card connection is broken.',
        fixCard: '[pt-BR] Fix card',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `[pt-BR] Your ${cardName} card connection is broken. <a href="${connectionLink}">Log into your bank</a> to fix the card.`
                : `[pt-BR] Your ${cardName} card connection is broken. Log into your bank to fix the card.`,
        addAdditionalCards: '[pt-BR] Add additional cards',
        upgradeDescription: '[pt-BR] Need to add more cards? Create a workspace to add additional personal cards or assign company cards to the entire team.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `[pt-BR] <muted-text>This is available on the Collect plan, which is <strong>${formattedPrice}</strong> per member per month.</muted-text>`,
        note: (subscriptionLink: string) =>
            `[pt-BR] <muted-text>Create a workspace to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
        workspaceCreated: '[pt-BR] Workspace created',
        newWorkspace: '[pt-BR] You created a workspace!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `[pt-BR] <centered-text>You’re all set to add additional cards. <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
    },
    walletPage: {
        balance: '[pt-BR] Balance',
        paymentMethodsTitle: '[pt-BR] Payment methods',
        setDefaultConfirmation: '[pt-BR] Make default payment method',
        setDefaultSuccess: '[pt-BR] Default payment method set!',
        deleteAccount: '[pt-BR] Delete account',
        deleteConfirmation: '[pt-BR] Are you sure you want to delete this account?',
        deleteCard: '[pt-BR] Delete card',
        deleteCardConfirmation:
            '[pt-BR] All unsubmitted card transactions, including those on open reports, will be removed. Are you sure you want to delete this card? You cannot undo this action.',
        error: {
            notOwnerOfBankAccount: '[pt-BR] An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: '[pt-BR] This bank account is temporarily suspended',
            notOwnerOfFund: '[pt-BR] An error occurred while setting this card as your default payment method',
            setDefaultFailure: '[pt-BR] Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: '[pt-BR] An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: '[pt-BR] Get paid faster',
        addPaymentMethod: '[pt-BR] Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: '[pt-BR] Get paid back faster',
        secureAccessToYourMoney: '[pt-BR] Secure access to your money',
        receiveMoney: '[pt-BR] Receive money in your local currency',
        expensifyWallet: '[pt-BR] Expensify Wallet (Beta)',
        sendAndReceiveMoney: '[pt-BR] Send and receive money with friends. US bank accounts only.',
        enableWallet: '[pt-BR] Enable wallet',
        addBankAccountToSendAndReceive: '[pt-BR] Add a bank account to make or receive payments.',
        addDebitOrCreditCard: '[pt-BR] Add debit or credit card',
        cardInactive: '[pt-BR] Inactive',
        assignedCards: '[pt-BR] Assigned cards',
        assignedCardsDescription: '[pt-BR] Transactions from these cards sync automatically.',
        expensifyCard: '[pt-BR] Expensify Card',
        walletActivationPending: "[pt-BR] We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "[pt-BR] Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: '[pt-BR] Add your bank account',
        addBankAccountBody: "[pt-BR] Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: '[pt-BR] Choose your bank account',
        chooseAccountBody: '[pt-BR] Make sure that you select the right one.',
        confirmYourBankAccount: '[pt-BR] Confirm your bank account',
        personalBankAccounts: '[pt-BR] Personal bank accounts',
        businessBankAccounts: '[pt-BR] Business bank accounts',
        shareBankAccount: '[pt-BR] Share bank account',
        bankAccountShared: '[pt-BR] Bank account shared',
        shareBankAccountTitle: '[pt-BR] Select the admins to share this bank account with:',
        shareBankAccountSuccess: '[pt-BR] Bank account shared!',
        shareBankAccountSuccessDescription: '[pt-BR] The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: '[pt-BR] An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: '[pt-BR] No admins available',
        shareBankAccountEmptyDescription: '[pt-BR] There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: '[pt-BR] Please select an admin before continuing',
        unshareBankAccount: '[pt-BR] Unshare bank account',
        unshareBankAccountDescription: '[pt-BR] Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `[pt-BR] ${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: '[pt-BR] It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: `[pt-BR] Can't unshare bank account`,
        travelCVV: {
            title: '[pt-BR] Travel CVV',
            subtitle: '[pt-BR] Use this when booking travel',
            description: "[pt-BR] Use this card for your Expensify Travel bookings. It'll show as “Travel Card” at checkout.",
        },
        chaseAccountNumberDifferent: '[pt-BR] Why is my account number different?',
    },
    cardPage: {
        expensifyCard: '[pt-BR] Expensify Card',
        expensifyTravelCard: '[pt-BR] Expensify Travel Card',
        availableSpend: '[pt-BR] Remaining limit',
        smartLimit: {
            name: '[pt-BR] Smart limit',
            title: (formattedLimit: string) => `[pt-BR] You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: '[pt-BR] Fixed limit',
            title: (formattedLimit: string) => `[pt-BR] You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: '[pt-BR] Monthly limit',
            title: (formattedLimit: string) => `[pt-BR] You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: '[pt-BR] Virtual card number',
        travelCardCvv: '[pt-BR] Travel card CVV',
        physicalCardNumber: '[pt-BR] Physical card number',
        physicalCardPin: '[pt-BR] PIN',
        getPhysicalCard: '[pt-BR] Get physical card',
        reportFraud: '[pt-BR] Report virtual card fraud',
        reportTravelFraud: '[pt-BR] Report travel card fraud',
        reviewTransaction: '[pt-BR] Review transaction',
        suspiciousBannerTitle: '[pt-BR] Suspicious transaction',
        suspiciousBannerDescription: '[pt-BR] We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "[pt-BR] Your card is temporarily locked while our team reviews your company's account.",
        markTransactionsAsReimbursable: '[pt-BR] Mark transactions as reimbursable',
        markTransactionsDescription: '[pt-BR] When enabled, transactions imported from this card are marked as reimbursable by default.',
        csvCardDescription: '[pt-BR] CSV Import',
        cardDetails: {
            cardNumber: '[pt-BR] Virtual card number',
            expiration: '[pt-BR] Expiration',
            cvv: '[pt-BR] CVV',
            address: '[pt-BR] Address',
            revealDetails: '[pt-BR] Reveal details',
            revealCvv: '[pt-BR] Reveal CVV',
            copyCardNumber: '[pt-BR] Copy card number',
            updateAddress: '[pt-BR] Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `[pt-BR] Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: '[pt-BR] An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "[pt-BR] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[pt-BR] Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        unexpectedError: '[pt-BR] There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: '[pt-BR] Yes, I do',
            reportFraudButtonText: "[pt-BR] No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `[pt-BR] cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `[pt-BR] deactivated the card ending in ${cardLastFour}`,
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
            }) => `[pt-BR] identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?

${amount} for ${merchant} - ${date}`,
        },
        setYourPin: '[pt-BR] Set the PIN for your card.',
        confirmYourPin: '[pt-BR] Enter your PIN again to confirm.',
        changeYourPin: '[pt-BR] Enter a new PIN for your card.',
        confirmYourChangedPin: '[pt-BR] Confirm your new PIN.',
        pinMustBeFourDigits: '[pt-BR] PIN must be exactly 4 digits.',
        invalidPin: '[pt-BR] Please choose a more secure PIN.',
        pinMismatch: '[pt-BR] PINs do not match. Please try again.',
        revealPin: '[pt-BR] Reveal PIN',
        hidePin: '[pt-BR] Hide PIN',
        pin: '[pt-BR] PIN',
        pinChanged: '[pt-BR] PIN changed!',
        pinChangedHeader: '[pt-BR] PIN changed',
        pinChangedDescription: "[pt-BR] You're all set to use your PIN now.",
        changePin: '[pt-BR] Change PIN',
        changePinAtATM: '[pt-BR] Change your PIN at any ATM',
        changePinAtATMDescription: '[pt-BR] This is required in your region. <concierge-link>Reach out to Concierge</concierge-link> if you have any questions.',
        freezeCard: '[pt-BR] Freeze card',
        unfreeze: '[pt-BR] Unfreeze',
        unfreezeCard: '[pt-BR] Unfreeze card',
        askToUnfreeze: '[pt-BR] Ask to unfreeze',
        freezeDescription: '[pt-BR] A frozen card cannot be used for purchases and transactions. You can unfreeze it at any time.',
        unfreezeDescription: "[pt-BR] Unfreezing this card will start allowing purchases and transactions again. Only proceed if you're sure the card is safe to use.",
        frozen: '[pt-BR] Frozen',
        youFroze: ({date}: {date: string}) => `[pt-BR] You froze this card on ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `[pt-BR] ${person} froze this card on ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `[pt-BR] This card was frozen on ${date} by `,
        frozenByAdminNeedsUnfreezePrefix: '[pt-BR] This card was frozen by ',
        frozenByAdminNeedsUnfreezeSuffix: '[pt-BR] . Please contact an admin to unfreeze it.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `[pt-BR] This card was frozen by ${person}. Please contact an admin to unfreeze it.`,
    },
    workflowsPage: {
        workflowTitle: '[pt-BR] Spend',
        workflowDescription: '[pt-BR] Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: '[pt-BR] Submissions',
        submissionFrequencyDescription: '[pt-BR] Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: '[pt-BR] Date of month',
        disableApprovalPromptDescription: '[pt-BR] Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: '[pt-BR] Approvals',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `[pt-BR] expenses from ${members}, and the approver is ${approvers}`,
        addApprovalButton: '[pt-BR] Add approval workflow',
        findWorkflow: '[pt-BR] Find workflow',
        addApprovalTip: '[pt-BR] This default workflow applies to all members, unless a more specific workflow exists.',
        approver: '[pt-BR] Approver',
        addApprovalsDescription: '[pt-BR] Require additional approval before authorizing a payment.',
        makeOrTrackPaymentsTitle: '[pt-BR] Payments',
        makeOrTrackPaymentsDescription: '[pt-BR] Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '[pt-BR] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '[pt-BR] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: '[pt-BR] Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: '[pt-BR] Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: '[pt-BR] Instantly',
            weekly: '[pt-BR] Weekly',
            monthly: '[pt-BR] Monthly',
            twiceAMonth: '[pt-BR] Twice a month',
            byTrip: '[pt-BR] By trip',
            manually: '[pt-BR] Manually',
            daily: '[pt-BR] Daily',
            lastDayOfMonth: '[pt-BR] Last day of the month',
            lastBusinessDayOfMonth: '[pt-BR] Last business day of the month',
            ordinals: {
                one: '[pt-BR] st',
                two: '[pt-BR] nd',
                few: '[pt-BR] rd',
                other: '[pt-BR] th',
                '1': '[pt-BR] First',
                '2': '[pt-BR] Second',
                '3': '[pt-BR] Third',
                '4': '[pt-BR] Fourth',
                '5': '[pt-BR] Fifth',
                '6': '[pt-BR] Sixth',
                '7': '[pt-BR] Seventh',
                '8': '[pt-BR] Eighth',
                '9': '[pt-BR] Ninth',
                '10': '[pt-BR] Tenth',
            },
        },
        approverInMultipleWorkflows: '[pt-BR] This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `[pt-BR] <strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: '[pt-BR] No members to display',
            expensesFromSubtitle: '[pt-BR] All workspace members already belong to an existing approval workflow.',
            approverSubtitle: '[pt-BR] All approvers belong to an existing workflow.',
            bulkApproverSubtitle: '[pt-BR] No approvers match the criteria for selected reports.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "[pt-BR] Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "[pt-BR] Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: '[pt-BR] Confirm',
        header: '[pt-BR] Add more approvers and confirm.',
        additionalApprover: '[pt-BR] Additional approver',
        submitButton: '[pt-BR] Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: '[pt-BR] Edit approval workflow',
        deleteTitle: '[pt-BR] Delete approval workflow',
        deletePrompt: '[pt-BR] Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: '[pt-BR] Expenses from',
        header: '[pt-BR] When the following members submit expenses:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "[pt-BR] The approver couldn't be changed. Please try again or contact support.",
        title: '[pt-BR] Set approver',
        description: '[pt-BR] This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: '[pt-BR] Approver',
        header: '[pt-BR] (Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `[pt-BR] Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : '[pt-BR] Add another approver when a report exceeds the amount below:',
        reportAmountLabel: '[pt-BR] Report amount',
        additionalApproverLabel: '[pt-BR] Additional approver',
        skip: '[pt-BR] Skip',
        next: '[pt-BR] Next',
        removeLimit: '[pt-BR] Remove limit',
        enterAmountError: '[pt-BR] Please enter a valid amount',
        enterApproverError: '[pt-BR] Approver is required when you set a report limit',
        enterBothError: '[pt-BR] Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `[pt-BR] Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: '[pt-BR] Authorized payer',
        genericErrorMessage: '[pt-BR] The authorized payer could not be changed. Please try again.',
        admins: '[pt-BR] Admins',
        payer: '[pt-BR] Payer',
        paymentAccount: '[pt-BR] Payment account',
        shareBankAccount: {
            shareTitle: '[pt-BR] Share bank account access?',
            shareDescription: ({admin}: {admin: string}) => `[pt-BR] You'll need to share bank account access with ${admin} to make them the payer.`,
            validationTitle: '[pt-BR] Bank account awaiting validation',
            validationDescription: ({admin}: {admin: string}) =>
                `[pt-BR] You need to <a href="#">validate this bank account</a>. Once that's done, you can share bank account access with ${admin} to make them the payer.`,
            errorTitle: "[pt-BR] Can't change payer",
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `[pt-BR] ${admin} doesn't have access to this bank account, so you can't make them the payer. <a href="#">Chat with ${owner}</a> if the bank account should be shared.`,
        },
    },
    reportFraudPage: {
        title: '[pt-BR] Report virtual card fraud',
        description:
            '[pt-BR] If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: '[pt-BR] Deactivate card',
        reportVirtualCardFraud: '[pt-BR] Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: '[pt-BR] Card fraud reported',
        description: '[pt-BR] We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        buttonText: '[pt-BR] Got it, thanks!',
    },
    activateCardPage: {
        activateCard: '[pt-BR] Activate card',
        pleaseEnterLastFour: '[pt-BR] Please enter the last four digits of your card.',
        activatePhysicalCard: '[pt-BR] Activate physical card',
        error: {
            thatDidNotMatch: "[pt-BR] That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "[pt-BR] You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: '[pt-BR] Get physical card',
        nameMessage: '[pt-BR] Enter your first and last name, as this will be shown on your card.',
        legalName: '[pt-BR] Legal name',
        legalFirstName: '[pt-BR] Legal first name',
        legalLastName: '[pt-BR] Legal last name',
        phoneMessage: '[pt-BR] Enter your phone number.',
        phoneNumber: '[pt-BR] Phone number',
        address: '[pt-BR] Address',
        addressMessage: '[pt-BR] Enter your shipping address.',
        streetAddress: '[pt-BR] Street Address',
        city: '[pt-BR] City',
        state: '[pt-BR] State',
        zipPostcode: '[pt-BR] Zip/Postcode',
        country: '[pt-BR] Country',
        confirmMessage: '[pt-BR] Please confirm your details below.',
        estimatedDeliveryMessage: '[pt-BR] Your physical card will arrive in 2-3 business days.',
        next: '[pt-BR] Next',
        getPhysicalCard: '[pt-BR] Get physical card',
        shipCard: '[pt-BR] Ship card',
    },
    transferAmountPage: {
        transfer: (amount: string) => `[pt-BR] Transfer${amount ? ` ${amount}` : ''}`,
        instant: '[pt-BR] Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `[pt-BR] ${rate}% fee (${minAmount} minimum)`,
        ach: '[pt-BR] 1-3 Business days (Bank account)',
        achSummary: '[pt-BR] No fee',
        whichAccount: '[pt-BR] Which account?',
        fee: '[pt-BR] Fee',
        transferSuccess: '[pt-BR] Transfer successful!',
        transferDetailBankAccount: '[pt-BR] Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: '[pt-BR] Your money should arrive immediately.',
        failedTransfer: '[pt-BR] Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: '[pt-BR] Please transfer your balance from the wallet page',
        goToWallet: '[pt-BR] Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: '[pt-BR] Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: '[pt-BR] Add payment method',
        addNewDebitCard: '[pt-BR] Add new debit card',
        addNewBankAccount: '[pt-BR] Add new bank account',
        accountLastFour: '[pt-BR] Ending in',
        cardLastFour: '[pt-BR] Card ending in',
        addFirstPaymentMethod: '[pt-BR] Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: '[pt-BR] Default',
        bankAccountLastFour: (lastFour: string) => `[pt-BR] Bank Account • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '[pt-BR] Expense rules',
        subtitle: '[pt-BR] These rules will apply to your expenses.',
        findRule: '[pt-BR] Find rule',
        emptyRules: {
            title: "[pt-BR] You haven't created any rules",
            subtitle: '[pt-BR] Add a rule to automate expense reporting.',
        },
        changes: {
            billableUpdate: (value: boolean) => `[pt-BR] Update expense ${value ? '[pt-BR] billable' : '[pt-BR] non-billable'}`,
            categoryUpdate: (value: string) => `[pt-BR] Update category to "${value}"`,
            commentUpdate: (value: string) => `[pt-BR] Update description to "${value}"`,
            merchantUpdate: (value: string) => `[pt-BR] Update merchant to "${value}"`,
            reimbursableUpdate: (value: boolean) => `[pt-BR] Update expense ${value ? '[pt-BR] reimbursable' : '[pt-BR] non-reimbursable'}`,
            tagUpdate: (value: string) => `[pt-BR] Update tag to "${value}"`,
            taxUpdate: (value: string) => `[pt-BR] Update tax rate to "${value}"`,
            billable: (value: boolean) => `[pt-BR] expense ${value ? '[pt-BR] billable' : '[pt-BR] non-billable'}`,
            category: (value: string) => `[pt-BR] category to "${value}"`,
            comment: (value: string) => `[pt-BR] description to "${value}"`,
            merchant: (value: string) => `[pt-BR] merchant to "${value}"`,
            reimbursable: (value: boolean) => `[pt-BR] expense ${value ? '[pt-BR] reimbursable' : '[pt-BR] non-reimbursable'}`,
            tag: (value: string) => `[pt-BR] tag to "${value}"`,
            tax: (value: string) => `[pt-BR] tax rate to "${value}"`,
            report: (value: string) => `[pt-BR] add to a report named "${value}"`,
        },
        newRule: '[pt-BR] New rule',
        addRule: {
            title: '[pt-BR] Add rule',
            expenseContains: '[pt-BR] If expense contains:',
            applyUpdates: '[pt-BR] Then apply these updates:',
            merchantHint: '[pt-BR] Type . to create a rule that applies to all merchants',
            addToReport: '[pt-BR] Add to a report named',
            createReport: '[pt-BR] Create report if necessary',
            applyToExistingExpenses: '[pt-BR] Apply to existing matching expenses',
            confirmError: '[pt-BR] Enter merchant and apply at least one update',
            confirmErrorMerchant: '[pt-BR] Please enter merchant',
            confirmErrorUpdate: '[pt-BR] Please apply at least one update',
            saveRule: '[pt-BR] Save rule',
        },
        editRule: {
            title: '[pt-BR] Edit rule',
        },
        deleteRule: {
            deleteSingle: '[pt-BR] Delete rule',
            deleteMultiple: '[pt-BR] Delete rules',
            deleteSinglePrompt: '[pt-BR] Are you sure you want to delete this rule?',
            deleteMultiplePrompt: '[pt-BR] Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: '[pt-BR] App preferences',
        },
        testSection: {
            title: '[pt-BR] Test preferences',
            subtitle: '[pt-BR] Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '[pt-BR] Receive relevant feature updates and Expensify news',
        muteAllSounds: '[pt-BR] Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: '[pt-BR] Priority mode',
        explainerText: '[pt-BR] Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: '[pt-BR] Most recent',
                description: '[pt-BR] Show all chats sorted by most recent',
            },
            gsd: {
                label: '[pt-BR] #focus',
                description: '[pt-BR] Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `[pt-BR] in ${policyName}`,
        generatingPDF: '[pt-BR] Generate PDF',
        waitForPDF: '[pt-BR] Please wait while we generate the PDF.',
        errorPDF: '[pt-BR] There was an error when trying to generate your PDF',
        successPDF: "[pt-BR] Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: '[pt-BR] Room description',
        roomDescriptionOptional: '[pt-BR] Room description (optional)',
        explainerText: '[pt-BR] Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: '[pt-BR] Heads up!',
        lastMemberWarning: "[pt-BR] Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: (displayName: string) => `[pt-BR] ${displayName}'s group chat`,
    },
    languagePage: {
        language: '[pt-BR] Language',
        aiGenerated: '[pt-BR] The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: '[pt-BR] Theme',
        themes: {
            dark: {
                label: '[pt-BR] Dark',
            },
            light: {
                label: '[pt-BR] Light',
            },
            system: {
                label: '[pt-BR] Use device settings',
            },
        },
        highContrastMode: '[pt-BR] High contrast mode',
        chooseThemeBelowOrSync: '[pt-BR] Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `[pt-BR] <muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `[pt-BR] Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "[pt-BR] Didn't receive a magic code?",
        enterAuthenticatorCode: '[pt-BR] Please enter your authenticator code',
        enterRecoveryCode: '[pt-BR] Please enter your recovery code',
        requiredWhen2FAEnabled: '[pt-BR] Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `[pt-BR] Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '[pt-BR] Request a new code',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `[pt-BR] Time remaining: ${timeRemaining} ${timeRemaining === 1 ? '[pt-BR] second' : '[pt-BR] seconds'}`,
        timeExpiredAnnouncement: '[pt-BR] The time has expired',
        error: {
            pleaseFillMagicCode: '[pt-BR] Please enter your magic code',
            incorrectMagicCode: '[pt-BR] Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: '[pt-BR] Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '[pt-BR] Please fill out all fields',
        pleaseFillPassword: '[pt-BR] Please enter your password',
        pleaseFillTwoFactorAuth: '[pt-BR] Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: '[pt-BR] Enter your two-factor authentication code to continue',
        forgot: '[pt-BR] Forgot?',
        requiredWhen2FAEnabled: '[pt-BR] Required when 2FA is enabled',
        error: {
            incorrectPassword: '[pt-BR] Incorrect password. Please try again.',
            incorrectLoginOrPassword: '[pt-BR] Incorrect login or password. Please try again.',
            incorrect2fa: '[pt-BR] Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: '[pt-BR] You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: '[pt-BR] Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                '[pt-BR] We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: '[pt-BR] You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: '[pt-BR] Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: '[pt-BR] Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: '[pt-BR] Phone or email',
        error: {
            invalidFormatEmailLogin: '[pt-BR] The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "[pt-BR] Couldn't retrieve account details. Please try to sign in again.",
        loginForm: '[pt-BR] Login form',
        notYou: (user: string) => `[pt-BR] Not ${user}?`,
    },
    onboarding: {
        welcome: '[pt-BR] Welcome!',
        welcomeSignOffTitleManageTeam: '[pt-BR] Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "[pt-BR] It's great to meet you!",
        explanationModal: {
            title: '[pt-BR] Welcome to Expensify',
            description: '[pt-BR] One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: '[pt-BR] To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: '[pt-BR] Get started',
        whatsYourName: "[pt-BR] What's your name?",
        peopleYouMayKnow: '[pt-BR] People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: (domain: string, email: string) => `[pt-BR] Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '[pt-BR] Join a workspace',
        listOfWorkspaces: "[pt-BR] Here's the list of workspaces you can join. Don't worry, you can always join them later if you prefer.",
        skipForNow: '[pt-BR] Skip for now',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `[pt-BR] ${employeeCount} member${employeeCount > 1 ? '[pt-BR] s' : ''} • ${policyOwner}`,
        whereYouWork: '[pt-BR] Where do you work?',
        errorSelection: '[pt-BR] Select an option to move forward',
        purpose: {
            title: '[pt-BR] What do you want to do today?',
            errorContinue: '[pt-BR] Please press continue to get set up',
            errorBackButton: '[pt-BR] Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '[pt-BR] Get paid back by my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "[pt-BR] Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '[pt-BR] Track and budget expenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '[pt-BR] Chat and split expenses with friends',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '[pt-BR] Something else',
        },
        employees: {
            title: '[pt-BR] How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '[pt-BR] 1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '[pt-BR] 11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '[pt-BR] 51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '[pt-BR] 101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '[pt-BR] More than 1,000 employees',
        },
        accounting: {
            title: '[pt-BR] Do you use any accounting software?',
            none: '[pt-BR] None',
        },
        interestedFeatures: {
            title: '[pt-BR] What features are you interested in?',
            featuresAlreadyEnabled: '[pt-BR] Here are our most popular features:',
            featureYouMayBeInterestedIn: '[pt-BR] Enable additional features:',
        },
        error: {
            requiredFirstName: '[pt-BR] Please input your first name to continue',
        },
        workEmail: {
            title: '[pt-BR] What’s your work email?',
            subtitle: '[pt-BR] Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: '[pt-BR] Forward to receipts@expensify.com for scanning',
                descriptionTwo: '[pt-BR] Join your colleagues already using Expensify',
                descriptionThree: '[pt-BR] Enjoy a more customized experience',
            },
            addWorkEmail: '[pt-BR] Add work email',
        },
        workEmailValidation: {
            title: '[pt-BR] Verify your work email',
            magicCodeSent: (workEmail: string | undefined) => `[pt-BR] Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: '[pt-BR] Please enter a valid work email from a private domain e.g. mitch@company.com',
            sameAsSignupEmail: '[pt-BR] Please enter a different email than the one you signed up with',
            offline: '[pt-BR] We couldn’t add your work email as you appear to be offline',
        },
        mergeBlockScreen: {
            title: '[pt-BR] Couldn’t add work email',
            subtitle: (workEmail: string | undefined) => `[pt-BR] We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[pt-BR] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[pt-BR] [Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[pt-BR] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[pt-BR] Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: '[pt-BR] Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [pt-BR] *Add expense approvals* to review your team's spend and keep it under control.

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
                title: ({workspaceConfirmationLink}) => `[pt-BR] [Create](${workspaceConfirmationLink}) a workspace`,
                description: '[pt-BR] Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[pt-BR] Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [pt-BR] *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[pt-BR] Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        [pt-BR] *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '[pt-BR] Submit an expense',
                description: dedent(`
                    [pt-BR] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: '[pt-BR] Submit an expense',
                description: dedent(`
                    [pt-BR] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: '[pt-BR] Track an expense',
                description: dedent(`
                    [pt-BR] *Track an expense* in any currency, whether you have a receipt or not.

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
                    `[pt-BR] Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '[pt-BR]  to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[pt-BR] your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        [pt-BR] Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[pt-BR] your' : '[pt-BR] to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        [Take me to accounting](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[pt-BR] Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        [pt-BR] Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[pt-BR] Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [pt-BR] *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[pt-BR] Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        [pt-BR] *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[pt-BR] Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [pt-BR] Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

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
                title: ({workspaceMembersLink}) => `[pt-BR] Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [pt-BR] *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: '[pt-BR] Start a chat',
                description: dedent(`
                    [pt-BR] *Start a chat* with anyone using their email or phone number.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },
            splitExpenseTask: {
                title: '[pt-BR] Split an expense',
                description: dedent(`
                    [pt-BR] *Split expenses* with one or more people.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[pt-BR] Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [pt-BR] Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: '[pt-BR] Create your first report',
                description: dedent(`
                    [pt-BR] Here's how to create a report:

                    1. Click the *+* button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[pt-BR] Take a [test drive](${testDriveURL})` : '[pt-BR] Take a test drive'),
            embeddedDemoIframeTitle: '[pt-BR] Test Drive',
            employeeFakeReceipt: {
                description: '[pt-BR] My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '[pt-BR] Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: '[pt-BR] Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        [pt-BR] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        [pt-BR] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage: '[pt-BR] To make the most of your 30-day free trial, follow the remaining steps below:',
            onboardingChatSplitMessage: '[pt-BR] Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "[pt-BR] Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingTestDriveReceiverMessage: "[pt-BR] *You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: '[pt-BR] Stay organized with a workspace',
            subtitle: '[pt-BR] Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: '[pt-BR] Track and organize receipts',
                descriptionTwo: '[pt-BR] Categorize and tag expenses',
                descriptionThree: '[pt-BR] Create and share reports',
            },
            price: (price?: string) => `[pt-BR] Try it free for 30 days, then upgrade for just <strong>${price ?? '$5'}/user/month</strong>.`,
            createWorkspace: '[pt-BR] Create workspace',
        },
        confirmWorkspace: {
            title: '[pt-BR] Confirm workspace',
            subtitle: '[pt-BR] Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: '[pt-BR] Invite members',
            subtitle: '[pt-BR] Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "[pt-BR] Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '[pt-BR] Name cannot contain special characters',
            containsReservedWord: '[pt-BR] Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: '[pt-BR] Name cannot contain a comma or semicolon',
            requiredFirstName: '[pt-BR] First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "[pt-BR] What's your legal name?",
        enterDateOfBirth: "[pt-BR] What's your date of birth?",
        enterAddress: "[pt-BR] What's your address?",
        enterPhoneNumber: "[pt-BR] What's your phone number?",
        personalDetails: '[pt-BR] Personal details',
        privateDataMessage: '[pt-BR] These details are used for travel and payments. They are never shown on your public profile.',
        legalName: '[pt-BR] Legal name',
        legalFirstName: '[pt-BR] Legal first name',
        legalLastName: '[pt-BR] Legal last name',
        address: '[pt-BR] Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `[pt-BR] Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `[pt-BR] Date should be after ${dateString}`,
            hasInvalidCharacter: '[pt-BR] Name can only include Latin characters',
            cannotIncludeCommaOrSemicolon: '[pt-BR] Name cannot contain a comma or semicolon',
            incorrectZipFormat: (zipFormat?: string) => `[pt-BR] Incorrect zip code format${zipFormat ? `[pt-BR]  Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `[pt-BR] Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '[pt-BR] Link has been re-sent',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `[pt-BR] I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: '[pt-BR] Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) =>
            `[pt-BR] To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `[pt-BR] If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '[pt-BR] Unlink',
        linkSent: '[pt-BR] Link sent!',
        successfullyUnlinkedLogin: '[pt-BR] Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) =>
            `[pt-BR] Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `[pt-BR] <strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `[pt-BR] <strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `[pt-BR] Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: '[pt-BR] Something went wrong...',
        subtitle: `[pt-BR] We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: '[pt-BR] Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `[pt-BR] We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: '[pt-BR] Your number has been validated! Click below to send a new magic sign-in code.',
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
                return '[pt-BR] Please wait a moment before trying again.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '[pt-BR] day' : '[pt-BR] days'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '[pt-BR] hour' : '[pt-BR] hours'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '[pt-BR] minute' : '[pt-BR] minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `[pt-BR] Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: '[pt-BR] Join',
    },
    detailsPage: {
        localTime: '[pt-BR] Local time',
    },
    newChatPage: {
        startGroup: '[pt-BR] Start group',
        addToGroup: '[pt-BR] Add to group',
        addUserToGroup: (username: string) => `[pt-BR] Add ${username} to group`,
    },
    yearPickerPage: {
        year: '[pt-BR] Year',
        selectYear: '[pt-BR] Please select a year',
    },
    monthPickerPage: {
        month: '[pt-BR] Month',
        selectMonth: '[pt-BR] Please select a month',
    },
    focusModeUpdateModal: {
        title: '[pt-BR] Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `[pt-BR] Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '[pt-BR] The chat you are looking for cannot be found.',
        getMeOutOfHere: '[pt-BR] Get me out of here',
        iouReportNotFound: '[pt-BR] The payment details you are looking for cannot be found.',
        notHere: "[pt-BR] Hmm... it's not here",
        pageNotFound: '[pt-BR] Oops, this page cannot be found',
        noAccess: '[pt-BR] This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: '[pt-BR] Go back to home page',
        commentYouLookingForCannotBeFound: '[pt-BR] The comment you are looking for cannot be found.',
        goToChatInstead: '[pt-BR] Go to the chat instead.',
        contactConcierge: '[pt-BR] For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `[pt-BR] Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: '[pt-BR] Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "[pt-BR] That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: '[pt-BR] Status',
        statusExplanation: "[pt-BR] Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: '[pt-BR] Today',
        clearStatus: '[pt-BR] Clear status',
        save: '[pt-BR] Save',
        message: '[pt-BR] Message',
        timePeriods: {
            never: '[pt-BR] Never',
            thirtyMinutes: '[pt-BR] 30 minutes',
            oneHour: '[pt-BR] 1 hour',
            afterToday: '[pt-BR] Today',
            afterWeek: '[pt-BR] A week',
            custom: '[pt-BR] Custom',
        },
        untilTomorrow: '[pt-BR] Until tomorrow',
        untilTime: (time: string) => `[pt-BR] Until ${time}`,
        date: '[pt-BR] Date',
        time: '[pt-BR] Time',
        clearAfter: '[pt-BR] Clear after',
        whenClearStatus: '[pt-BR] When should we clear your status?',
        setVacationDelegate: `[pt-BR] Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        cannotSetVacationDelegate: `[pt-BR] You can't set a vacation delegate because you're currently the delegate for the following members:`,
        vacationDelegateError: '[pt-BR] There was an error updating your vacation delegate.',
        asVacationDelegate: (nameOrEmail: string) => `[pt-BR] as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `[pt-BR] to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `[pt-BR] You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `[pt-BR] Step ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '[pt-BR] Bank info',
        confirmBankInfo: '[pt-BR] Confirm bank info',
        manuallyAdd: '[pt-BR] Manually add your bank account',
        letsDoubleCheck: "[pt-BR] Let's double check that everything looks right.",
        accountEnding: '[pt-BR] Account ending in',
        thisBankAccount: '[pt-BR] This bank account will be used for business payments on your workspace',
        accountNumber: '[pt-BR] Account number',
        routingNumber: '[pt-BR] Routing number',
        chooseAnAccountBelow: '[pt-BR] Choose an account below',
        addBankAccount: '[pt-BR] Add bank account',
        chooseAnAccount: '[pt-BR] Choose an account',
        connectOnlineWithPlaid: '[pt-BR] Log into your bank',
        connectManually: '[pt-BR] Connect manually',
        desktopConnection: '[pt-BR] Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: '[pt-BR] Your data is secure',
        toGetStarted: '[pt-BR] Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: '[pt-BR] Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: '[pt-BR] Your routing number and account number can be found on a check for the account.',
        bankAccountPurposeTitle: '[pt-BR] What do you want to do with your bank account?',
        getReimbursed: '[pt-BR] Get reimbursed',
        getReimbursedDescription: '[pt-BR] By employer or others',
        makePayments: '[pt-BR] Make payments',
        makePaymentsDescription: '[pt-BR] Pay expenses or issue Expensify Cards',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `[pt-BR] To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: '[pt-BR] An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: (workspaceRoute: string) =>
            `[pt-BR] Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: '[pt-BR] Business bank account added!',
        bbaAddedDescription: "[pt-BR] It's ready to be used for payments.",
        lockedBankAccount: '[pt-BR] Locked bank account',
        unlockBankAccount: '[pt-BR] Unlock bank account',
        youCantPayThis: `[pt-BR] You can't pay this report because you have a <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">locked bank account</a>. Tap below and Concierge will help with the next steps to unlock it.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `[pt-BR] <h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `[pt-BR] Expensify Business Bank Account ${maskedAccountNumber}
Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.`,
        error: {
            youNeedToSelectAnOption: '[pt-BR] Please select an option to proceed',
            noBankAccountAvailable: "[pt-BR] Sorry, there's no bank account available",
            noBankAccountSelected: '[pt-BR] Please choose an account',
            taxID: '[pt-BR] Please enter a valid tax ID number',
            website: '[pt-BR] Please enter a valid website',
            zipCode: `[pt-BR] Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '[pt-BR] Please enter a valid phone number',
            email: '[pt-BR] Please enter a valid email address',
            companyName: '[pt-BR] Please enter a valid business name',
            addressCity: '[pt-BR] Please enter a valid city',
            addressStreet: '[pt-BR] Please enter a valid street address',
            addressState: '[pt-BR] Please select a valid state',
            incorporationDateFuture: "[pt-BR] Incorporation date can't be in the future",
            incorporationState: '[pt-BR] Please select a valid state',
            industryCode: '[pt-BR] Please enter a valid industry classification code with six digits',
            restrictedBusiness: "[pt-BR] Please confirm the business isn't on the list of restricted businesses",
            routingNumber: '[pt-BR] Please enter a valid routing number',
            accountNumber: '[pt-BR] Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "[pt-BR] Routing and account numbers can't match",
            companyType: '[pt-BR] Please select a valid company type',
            tooManyAttempts: '[pt-BR] Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: '[pt-BR] Please enter a valid address',
            dob: '[pt-BR] Please select a valid date of birth',
            age: '[pt-BR] Must be over 18 years old',
            ssnLast4: '[pt-BR] Please enter valid last 4 digits of SSN',
            firstName: '[pt-BR] Please enter a valid first name',
            lastName: '[pt-BR] Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: '[pt-BR] Please add a default deposit account or debit card',
            validationAmounts: '[pt-BR] The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: '[pt-BR] Please enter a valid full name',
            ownershipPercentage: '[pt-BR] Please enter a valid percentage number',
            deletePaymentBankAccount:
                "[pt-BR] This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: '[pt-BR] The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "[pt-BR] Where's your bank account located?",
        accountDetailsStepHeader: '[pt-BR] What are your account details?',
        accountTypeStepHeader: '[pt-BR] What type of account is this?',
        bankInformationStepHeader: '[pt-BR] What are your bank details?',
        accountHolderInformationStepHeader: '[pt-BR] What are the account holder details?',
        howDoWeProtectYourData: '[pt-BR] How do we protect your data?',
        currencyHeader: "[pt-BR] What's your bank account's currency?",
        confirmationStepHeader: '[pt-BR] Check your info.',
        confirmationStepSubHeader: '[pt-BR] Double check the details below, and check the terms box to confirm.',
        toGetStarted: '[pt-BR] Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
    },
    addPersonalBankAccountPage: {
        enterPassword: '[pt-BR] Enter Expensify password',
        alreadyAdded: '[pt-BR] This account has already been added.',
        chooseAccountLabel: '[pt-BR] Account',
        successTitle: '[pt-BR] Personal bank account added!',
        successMessage: '[pt-BR] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: '[pt-BR] Unknown filename',
        passwordRequired: '[pt-BR] Please enter a password',
        passwordIncorrect: '[pt-BR] Incorrect password. Please try again.',
        failedToLoadPDF: '[pt-BR] Failed to load PDF file',
        pdfPasswordForm: {
            title: '[pt-BR] Password protected PDF',
            infoText: '[pt-BR] This PDF is password protected.',
            beforeLinkText: '[pt-BR] Please',
            linkText: '[pt-BR] enter the password',
            afterLinkText: '[pt-BR] to view it.',
            formLabel: '[pt-BR] View PDF',
        },
        attachmentNotFound: '[pt-BR] Attachment not found',
        retry: '[pt-BR] Retry',
    },
    messages: {
        errorMessageInvalidPhone: `[pt-BR] Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '[pt-BR] Invalid email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `[pt-BR] ${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `[pt-BR] ${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '[pt-BR] By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: '[pt-BR] Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `[pt-BR] <muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: '[pt-BR] Try again',
        verifyIdentity: '[pt-BR] Verify identity',
        letsVerifyIdentity: "[pt-BR] Let's verify your identity",
        butFirst: `[pt-BR] But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '[pt-BR] An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: '[pt-BR] Enable camera access',
        cameraRequestMessage: '[pt-BR] We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: '[pt-BR] Enable microphone access',
        microphoneRequestMessage: '[pt-BR] We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: '[pt-BR] Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: '[pt-BR] Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "[pt-BR] There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "[pt-BR] There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "[pt-BR] Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "[pt-BR] Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: '[pt-BR] Additional details',
        helpText: '[pt-BR] We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: '[pt-BR] We need to ask you just a few more questions to finish validating your identity.',
        helpLink: '[pt-BR] Learn more about why we need this.',
        legalFirstNameLabel: '[pt-BR] Legal first name',
        legalMiddleNameLabel: '[pt-BR] Legal middle name',
        legalLastNameLabel: '[pt-BR] Legal last name',
        selectAnswer: '[pt-BR] Please select a response to proceed',
        ssnFull9Error: '[pt-BR] Please enter a valid nine-digit SSN',
        needSSNFull9: "[pt-BR] We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "[pt-BR] We couldn't verify",
        pleaseFixIt: '[pt-BR] Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `[pt-BR] We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: '[pt-BR] Terms and fees',
        headerTitleRefactor: '[pt-BR] Fees and terms',
        haveReadAndAgreePlain: '[pt-BR] I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `[pt-BR] I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: '[pt-BR] I agree to the Privacy and Wallet agreement.',
        agreeToThe: (walletAgreementUrl: string) =>
            `[pt-BR] I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: '[pt-BR] Enable payments',
        monthlyFee: '[pt-BR] Monthly fee',
        inactivity: '[pt-BR] Inactivity',
        noOverdraftOrCredit: '[pt-BR] No overdraft/credit feature.',
        electronicFundsWithdrawal: '[pt-BR] Electronic funds withdrawal',
        standard: '[pt-BR] Standard',
        reviewTheFees: '[pt-BR] Take a look at some fees.',
        checkTheBoxes: '[pt-BR] Please check the boxes below.',
        agreeToTerms: '[pt-BR] Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `[pt-BR] The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: '[pt-BR] Per purchase',
            atmWithdrawal: '[pt-BR] ATM withdrawal',
            cashReload: '[pt-BR] Cash reload',
            inNetwork: '[pt-BR] in-network',
            outOfNetwork: '[pt-BR] out-of-network',
            atmBalanceInquiry: '[pt-BR] ATM balance inquiry (in-network or out-of-network)',
            customerService: '[pt-BR] Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: '[pt-BR] Inactivity (after 12 months with no transactions)',
            weChargeOneFee: '[pt-BR] We charge 1 other type of fee. It is:',
            fdicInsurance: '[pt-BR] Your funds are eligible for FDIC insurance.',
            generalInfo: `[pt-BR] For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `[pt-BR] For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: '[pt-BR] Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: (amount: string) => `[pt-BR] (min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '[pt-BR] A list of all Expensify Wallet fees',
            typeOfFeeHeader: '[pt-BR] All fees',
            feeAmountHeader: '[pt-BR] Amount',
            moreDetailsHeader: '[pt-BR] Details',
            openingAccountTitle: '[pt-BR] Opening an account',
            openingAccountDetails: "[pt-BR] There's no fee to open an account.",
            monthlyFeeDetails: "[pt-BR] There's no monthly fee.",
            customerServiceTitle: '[pt-BR] Customer service',
            customerServiceDetails: '[pt-BR] There are no customer service fees.',
            inactivityDetails: "[pt-BR] There's no inactivity fee.",
            sendingFundsTitle: '[pt-BR] Sending funds to another account holder',
            sendingFundsDetails: "[pt-BR] There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "[pt-BR] There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "[pt-BR] There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                `[pt-BR]  The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `[pt-BR] Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                `[pt-BR]  Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `[pt-BR] Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `[pt-BR] For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: '[pt-BR] View printer-friendly version',
            automated: '[pt-BR] Automated',
            liveAgent: '[pt-BR] Live agent',
            instant: '[pt-BR] Instant',
            electronicFundsInstantFeeMin: (amount: string) => `[pt-BR] Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '[pt-BR] Enable payments',
        activatedTitle: '[pt-BR] Wallet activated!',
        activatedMessage: '[pt-BR] Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: '[pt-BR] Just a minute...',
        checkBackLaterMessage: "[pt-BR] We're still reviewing your information. Please check back later.",
        continueToPayment: '[pt-BR] Continue to payment',
        continueToTransfer: '[pt-BR] Continue to transfer',
    },
    companyStep: {
        headerTitle: '[pt-BR] Company information',
        subtitle: '[pt-BR] Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: '[pt-BR] Legal business name',
        companyWebsite: '[pt-BR] Company website',
        taxIDNumber: '[pt-BR] Tax ID number',
        taxIDNumberPlaceholder: '[pt-BR] 9 digits',
        companyType: '[pt-BR] Company type',
        incorporationDate: '[pt-BR] Incorporation date',
        incorporationState: '[pt-BR] Incorporation state',
        industryClassificationCode: '[pt-BR] Industry classification code',
        confirmCompanyIsNot: '[pt-BR] I confirm that this company is not on the',
        listOfRestrictedBusinesses: '[pt-BR] list of restricted businesses',
        incorporationDatePlaceholder: '[pt-BR] Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '[pt-BR] LLC',
            CORPORATION: '[pt-BR] Corp',
            PARTNERSHIP: '[pt-BR] Partnership',
            COOPERATIVE: '[pt-BR] Cooperative',
            SOLE_PROPRIETORSHIP: '[pt-BR] Sole proprietorship',
            OTHER: '[pt-BR] Other',
        },
        industryClassification: '[pt-BR] Which industry is the business classified under?',
        industryClassificationCodePlaceholder: '[pt-BR] Search for industry classification code',
    },
    requestorStep: {
        headerTitle: '[pt-BR] Personal information',
        learnMore: '[pt-BR] Learn more',
        isMyDataSafe: '[pt-BR] Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: '[pt-BR] Personal info',
        enterYourLegalFirstAndLast: "[pt-BR] What's your legal name?",
        legalFirstName: '[pt-BR] Legal first name',
        legalLastName: '[pt-BR] Legal last name',
        legalName: '[pt-BR] Legal name',
        enterYourDateOfBirth: "[pt-BR] What's your date of birth?",
        enterTheLast4: '[pt-BR] What are the last four digits of your Social Security Number?',
        dontWorry: "[pt-BR] Don't worry, we don't do any personal credit checks!",
        last4SSN: '[pt-BR] Last 4 of SSN',
        enterYourAddress: "[pt-BR] What's your address?",
        address: '[pt-BR] Address',
        letsDoubleCheck: "[pt-BR] Let's double check that everything looks right.",
        byAddingThisBankAccount: "[pt-BR] By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: '[pt-BR] What’s your legal name?',
        whatsYourDOB: '[pt-BR] What’s your date of birth?',
        whatsYourAddress: '[pt-BR] What’s your address?',
        whatsYourSSN: '[pt-BR] What are the last four digits of your Social Security Number?',
        noPersonalChecks: '[pt-BR] Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: '[pt-BR] What’s your phone number?',
        weNeedThisToVerify: '[pt-BR] We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: '[pt-BR] Company info',
        enterTheNameOfYourBusiness: "[pt-BR] What's the name of your company?",
        businessName: '[pt-BR] Legal company name',
        enterYourCompanyTaxIdNumber: "[pt-BR] What's your company’s Tax ID number?",
        taxIDNumber: '[pt-BR] Tax ID number',
        taxIDNumberPlaceholder: '[pt-BR] 9 digits',
        enterYourCompanyWebsite: "[pt-BR] What's your company’s website?",
        companyWebsite: '[pt-BR] Company website',
        enterYourCompanyPhoneNumber: "[pt-BR] What's your company’s phone number?",
        enterYourCompanyAddress: "[pt-BR] What's your company’s address?",
        selectYourCompanyType: '[pt-BR] What type of company is it?',
        companyType: '[pt-BR] Company type',
        incorporationType: {
            LLC: '[pt-BR] LLC',
            CORPORATION: '[pt-BR] Corp',
            PARTNERSHIP: '[pt-BR] Partnership',
            COOPERATIVE: '[pt-BR] Cooperative',
            SOLE_PROPRIETORSHIP: '[pt-BR] Sole proprietorship',
            OTHER: '[pt-BR] Other',
        },
        selectYourCompanyIncorporationDate: "[pt-BR] What's your company’s incorporation date?",
        incorporationDate: '[pt-BR] Incorporation date',
        incorporationDatePlaceholder: '[pt-BR] Start date (yyyy-mm-dd)',
        incorporationState: '[pt-BR] Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '[pt-BR] Which state was your company incorporated in?',
        letsDoubleCheck: "[pt-BR] Let's double check that everything looks right.",
        companyAddress: '[pt-BR] Company address',
        listOfRestrictedBusinesses: '[pt-BR] list of restricted businesses',
        confirmCompanyIsNot: '[pt-BR] I confirm that this company is not on the',
        businessInfoTitle: '[pt-BR] Business info',
        legalBusinessName: '[pt-BR] Legal business name',
        whatsTheBusinessName: "[pt-BR] What's the business name?",
        whatsTheBusinessAddress: "[pt-BR] What's the business address?",
        whatsTheBusinessContactInformation: "[pt-BR] What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "[pt-BR] What's the Company Registration Number (CRN)?";
                default:
                    return "[pt-BR] What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[pt-BR] What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return '[pt-BR] What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return '[pt-BR] What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return '[pt-BR] What’s the Australian Business Number (ABN)?';
                default:
                    return '[pt-BR] What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "[pt-BR] What's this number?",
        whereWasTheBusinessIncorporated: '[pt-BR] Where was the business incorporated?',
        whatTypeOfBusinessIsIt: '[pt-BR] What type of business is it?',
        whatsTheBusinessAnnualPayment: "[pt-BR] What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "[pt-BR] What's your expected average reimbursement amount?",
        registrationNumber: '[pt-BR] Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[pt-BR] EIN';
                case CONST.COUNTRY.CA:
                    return '[pt-BR] BN';
                case CONST.COUNTRY.GB:
                    return '[pt-BR] VRN';
                case CONST.COUNTRY.AU:
                    return '[pt-BR] ABN';
                default:
                    return '[pt-BR] EU VAT';
            }
        },
        businessAddress: '[pt-BR] Business address',
        businessType: '[pt-BR] Business type',
        incorporation: '[pt-BR] Incorporation',
        incorporationCountry: '[pt-BR] Incorporation country',
        incorporationTypeName: '[pt-BR] Incorporation type',
        businessCategory: '[pt-BR] Business category',
        annualPaymentVolume: '[pt-BR] Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `[pt-BR] Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '[pt-BR] Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `[pt-BR] Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '[pt-BR] Select incorporation type',
        selectBusinessCategory: '[pt-BR] Select business category',
        selectAnnualPaymentVolume: '[pt-BR] Select annual payment volume',
        selectIncorporationCountry: '[pt-BR] Select incorporation country',
        selectIncorporationState: '[pt-BR] Select incorporation state',
        selectAverageReimbursement: '[pt-BR] Select average reimbursement amount',
        selectBusinessType: '[pt-BR] Select business type',
        findIncorporationType: '[pt-BR] Find incorporation type',
        findBusinessCategory: '[pt-BR] Find business category',
        findAnnualPaymentVolume: '[pt-BR] Find annual payment volume',
        findIncorporationState: '[pt-BR] Find incorporation state',
        findAverageReimbursement: '[pt-BR] Find average reimbursement amount',
        findBusinessType: '[pt-BR] Find business type',
        error: {
            registrationNumber: '[pt-BR] Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '[pt-BR] Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return '[pt-BR] Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return '[pt-BR] Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return '[pt-BR] Please provide a valid Australian Business Number (ABN)';
                    default:
                        return '[pt-BR] Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `[pt-BR] Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `[pt-BR] Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `[pt-BR] Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: '[pt-BR] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: '[pt-BR] Business owner',
        enterLegalFirstAndLastName: "[pt-BR] What's the owner's legal name?",
        legalFirstName: '[pt-BR] Legal first name',
        legalLastName: '[pt-BR] Legal last name',
        enterTheDateOfBirthOfTheOwner: "[pt-BR] What's the owner's date of birth?",
        enterTheLast4: '[pt-BR] What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: '[pt-BR] Last 4 of SSN',
        dontWorry: "[pt-BR] Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "[pt-BR] What's the owner's address?",
        letsDoubleCheck: '[pt-BR] Let’s double check that everything looks right.',
        legalName: '[pt-BR] Legal name',
        address: '[pt-BR] Address',
        byAddingThisBankAccount: "[pt-BR] By adding this bank account, you confirm that you've read, understand, and accept",
        owners: '[pt-BR] Owners',
    },
    ownershipInfoStep: {
        ownerInfo: '[pt-BR] Owner info',
        businessOwner: '[pt-BR] Business owner',
        signerInfo: '[pt-BR] Signer info',
        doYouOwn: (companyName: string) => `[pt-BR] Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `[pt-BR] Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: '[pt-BR] Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: '[pt-BR] Legal first name',
        legalLastName: '[pt-BR] Legal last name',
        whatsTheOwnersName: "[pt-BR] What's the owner's legal name?",
        whatsYourName: "[pt-BR] What's your legal name?",
        whatPercentage: '[pt-BR] What percentage of the business belongs to the owner?',
        whatsYoursPercentage: '[pt-BR] What percentage of the business do you own?',
        ownership: '[pt-BR] Ownership',
        whatsTheOwnersDOB: "[pt-BR] What's the owner's date of birth?",
        whatsYourDOB: "[pt-BR] What's your date of birth?",
        whatsTheOwnersAddress: "[pt-BR] What's the owner's address?",
        whatsYourAddress: "[pt-BR] What's your address?",
        whatAreTheLast: "[pt-BR] What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: '[pt-BR] What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: '[pt-BR] What is your country of citizenship?',
        whatsTheOwnersNationality: "[pt-BR] What's the owner's country of citizenship?",
        countryOfCitizenship: '[pt-BR] Country of citizenship',
        dontWorry: "[pt-BR] Don't worry, we don't do any personal credit checks!",
        last4: '[pt-BR] Last 4 of SSN',
        whyDoWeAsk: '[pt-BR] Why do we ask for this?',
        letsDoubleCheck: '[pt-BR] Let’s double check that everything looks right.',
        legalName: '[pt-BR] Legal name',
        ownershipPercentage: '[pt-BR] Ownership percentage',
        areThereOther: (companyName: string) => `[pt-BR] Are there other individuals who own 25% or more of ${companyName}?`,
        owners: '[pt-BR] Owners',
        addCertified: '[pt-BR] Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart:
            '[pt-BR] Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: '[pt-BR] Upload entity ownership chart',
        noteEntity: '[pt-BR] Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: '[pt-BR] Certified entity ownership chart',
        selectCountry: '[pt-BR] Select country',
        findCountry: '[pt-BR] Find country',
        address: '[pt-BR] Address',
        chooseFile: '[pt-BR] Choose file',
        uploadDocuments: '[pt-BR] Upload additional documentation',
        pleaseUpload: '[pt-BR] Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: '[pt-BR] Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: '[pt-BR] Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "[pt-BR] Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: '[pt-BR] Copy of ID for beneficial owner',
        copyOfIDDescription: "[pt-BR] Examples: Passport, driver's license, etc.",
        proofOfAddress: '[pt-BR] Address proof for beneficial owner',
        proofOfAddressDescription: '[pt-BR] Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: '[pt-BR] Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            '[pt-BR] Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: '[pt-BR] Complete verification',
        confirmAgreements: '[pt-BR] Please confirm the agreements below.',
        certifyTrueAndAccurate: '[pt-BR] I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: '[pt-BR] Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: '[pt-BR] I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: '[pt-BR] You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: '[pt-BR] terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '[pt-BR] Validate your bank account',
        validateButtonText: '[pt-BR] Validate',
        validationInputLabel: '[pt-BR] Transaction',
        maxAttemptsReached: '[pt-BR] Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `[pt-BR] Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '[pt-BR] Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: '[pt-BR] Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: '[pt-BR] Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: '[pt-BR] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: '[pt-BR] Secure your account',
    },
    countryStep: {
        confirmBusinessBank: '[pt-BR] Confirm business bank account currency and country',
        confirmCurrency: '[pt-BR] Confirm currency and country',
        yourBusiness: '[pt-BR] Your business bank account currency must match your workspace currency.',
        youCanChange: '[pt-BR] You can change your workspace currency in your',
        findCountry: '[pt-BR] Find country',
        selectCountry: '[pt-BR] Select country',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `[pt-BR] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> so you can invite a director to sign in a later step.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '[pt-BR] What are your business bank account details?',
        letsDoubleCheck: '[pt-BR] Let’s double check that everything looks fine.',
        thisBankAccount: '[pt-BR] This bank account will be used for business payments on your workspace',
        accountNumber: '[pt-BR] Account number',
        accountHolderNameDescription: "[pt-BR] Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: '[pt-BR] Signer info',
        areYouDirector: (companyName: string) => `[pt-BR] Are you a director at ${companyName}?`,
        regulationRequiresUs: '[pt-BR] Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "[pt-BR] What's your legal name",
        fullName: '[pt-BR] Legal full name',
        whatsYourJobTitle: "[pt-BR] What's your job title?",
        jobTitle: '[pt-BR] Job title',
        whatsYourDOB: "[pt-BR] What's your date of birth?",
        uploadID: '[pt-BR] Upload ID and proof of address',
        personalAddress: '[pt-BR] Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: '[pt-BR] Let’s double check that everything looks right.',
        legalName: '[pt-BR] Legal name',
        proofOf: '[pt-BR] Proof of personal address',
        enterOneEmail: (companyName: string) => `[pt-BR] Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: '[pt-BR] Regulation requires at least one more director as a signer.',
        hangTight: '[pt-BR] Hang tight...',
        enterTwoEmails: (companyName: string) => `[pt-BR] Enter the emails of two directors at ${companyName}`,
        sendReminder: '[pt-BR] Send a reminder',
        chooseFile: '[pt-BR] Choose file',
        weAreWaiting: "[pt-BR] We're waiting for others to verify their identities as directors of the business.",
        id: '[pt-BR] Copy of ID',
        proofOfDirectors: '[pt-BR] Proof of director(s)',
        proofOfDirectorsDescription: '[pt-BR] Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: '[pt-BR] Codice Fiscale',
        codiceFiscaleDescription: '[pt-BR] Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: '[pt-BR] PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            [pt-BR] Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: '[pt-BR] Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: '[pt-BR] Enter signer info',
        thisStep: '[pt-BR] This step has been completed',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `[pt-BR] is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: '[pt-BR] Emails must be different',
            connectToWorkspace: (workspaceRoute: string) => `[pt-BR] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> to invite a director to sign.`,
        },
    },
    agreementsStep: {
        agreements: '[pt-BR] Agreements',
        pleaseConfirm: '[pt-BR] Please confirm the agreements below',
        regulationRequiresUs: '[pt-BR] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: '[pt-BR] I am authorized to use the business bank account for business spend.',
        iCertify: '[pt-BR] I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `[pt-BR] I accept the <a href="https://www.corpay.com/cross-border/terms">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: '[pt-BR] I accept the terms and conditions.',
        accept: '[pt-BR] Accept and add bank account',
        iConsentToThePrivacyNotice: '[pt-BR] I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: '[pt-BR] I consent to the privacy notice.',
        error: {
            authorized: '[pt-BR] You must be a controlling officer with authorization to operate the business bank account',
            certify: '[pt-BR] Please certify that the information is true and accurate',
            consent: '[pt-BR] Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: '[pt-BR] Docusign Form',
        pleaseComplete:
            '[pt-BR] Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: '[pt-BR] Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            '[pt-BR] Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: '[pt-BR] Take me to Docusign',
        uploadAdditional: '[pt-BR] Upload additional documentation',
        pleaseUpload: '[pt-BR] Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: '[pt-BR] Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "[pt-BR] Let's finish in chat!",
        thanksFor:
            "[pt-BR] Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: '[pt-BR] I have a question',
        enable2FA: '[pt-BR] Enable two-factor authentication (2FA) to prevent fraud',
        weTake: '[pt-BR] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: '[pt-BR] Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '[pt-BR] One moment',
        explanationLine: "[pt-BR] We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "[pt-BR] Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: '[pt-BR] Book travel',
        title: '[pt-BR] Travel smart',
        subtitle: '[pt-BR] Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: '[pt-BR] Save money on your bookings',
            alerts: '[pt-BR] Get realtime alerts if your travel plans change',
        },
        bookTravel: '[pt-BR] Book travel',
        bookDemo: '[pt-BR] Book demo',
        bookADemo: '[pt-BR] Book a demo',
        toLearnMore: '[pt-BR]  to learn more.',
        termsAndConditions: {
            header: '[pt-BR] Before we continue...',
            title: '[pt-BR] Terms & conditions',
            label: '[pt-BR] I agree to the terms & conditions',
            subtitle: `[pt-BR] Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: '[pt-BR] You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                '[pt-BR] You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: '[pt-BR] Flight',
        flightDetails: {
            passenger: '[pt-BR] Passenger',
            layover: (layover: string) => `[pt-BR] <muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: '[pt-BR] Take-off',
            landing: '[pt-BR] Landing',
            seat: '[pt-BR] Seat',
            class: '[pt-BR] Cabin Class',
            recordLocator: '[pt-BR] Record locator',
            cabinClasses: {
                unknown: '[pt-BR] Unknown',
                economy: '[pt-BR] Economy',
                premiumEconomy: '[pt-BR] Premium Economy',
                business: '[pt-BR] Business',
                first: '[pt-BR] First',
            },
        },
        hotel: '[pt-BR] Hotel',
        hotelDetails: {
            guest: '[pt-BR] Guest',
            checkIn: '[pt-BR] Check-in',
            checkOut: '[pt-BR] Check-out',
            roomType: '[pt-BR] Room type',
            cancellation: '[pt-BR] Cancellation policy',
            cancellationUntil: '[pt-BR] Free cancellation until',
            confirmation: '[pt-BR] Confirmation number',
            cancellationPolicies: {
                unknown: '[pt-BR] Unknown',
                nonRefundable: '[pt-BR] Non-refundable',
                freeCancellationUntil: '[pt-BR] Free cancellation until',
                partiallyRefundable: '[pt-BR] Partially refundable',
            },
        },
        car: '[pt-BR] Car',
        carDetails: {
            rentalCar: '[pt-BR] Car rental',
            pickUp: '[pt-BR] Pick-up',
            dropOff: '[pt-BR] Drop-off',
            driver: '[pt-BR] Driver',
            carType: '[pt-BR] Car type',
            cancellation: '[pt-BR] Cancellation policy',
            cancellationUntil: '[pt-BR] Free cancellation until',
            freeCancellation: '[pt-BR] Free cancellation',
            confirmation: '[pt-BR] Confirmation number',
        },
        train: '[pt-BR] Rail',
        trainDetails: {
            passenger: '[pt-BR] Passenger',
            departs: '[pt-BR] Departs',
            arrives: '[pt-BR] Arrives',
            coachNumber: '[pt-BR] Coach number',
            seat: '[pt-BR] Seat',
            fareDetails: '[pt-BR] Fare details',
            confirmation: '[pt-BR] Confirmation number',
        },
        viewTrip: '[pt-BR] View trip',
        modifyTrip: '[pt-BR] Modify trip',
        tripSupport: '[pt-BR] Trip support',
        tripDetails: '[pt-BR] Trip details',
        viewTripDetails: '[pt-BR] View trip details',
        trip: '[pt-BR] Trip',
        trips: '[pt-BR] Trips',
        tripSummary: '[pt-BR] Trip summary',
        departs: '[pt-BR] Departs',
        errorMessage: '[pt-BR] Something went wrong. Please try again later.',
        phoneError: (phoneErrorMethodsRoute: string) => `[pt-BR] <rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: '[pt-BR] Domain',
            subtitle: '[pt-BR] Choose a domain for Expensify Travel setup.',
            recommended: '[pt-BR] Recommended',
        },
        domainPermissionInfo: {
            title: '[pt-BR] Domain',
            restriction: (domain: string) =>
                `[pt-BR] You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `[pt-BR] If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '[pt-BR] Get started with Expensify Travel',
            message: `[pt-BR] You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: '[pt-BR] Expensify Travel has been disabled',
            message: `[pt-BR] Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "[pt-BR] We're reviewing your request...",
            message: `[pt-BR] We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: '[pt-BR] Got it',
            conciergeMessage: ({domain}: {domain: string}) => `[pt-BR] Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `[pt-BR] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[pt-BR] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[pt-BR] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[pt-BR] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `[pt-BR] The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `[pt-BR] Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[pt-BR] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `[pt-BR] Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `[pt-BR] Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `[pt-BR] Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `[pt-BR] Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: '[pt-BR] Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: (type: string, id = '') => `[pt-BR] You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `[pt-BR] The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: (type: string, id = '') => `[pt-BR] Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: (type: string) => `[pt-BR] Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `[pt-BR] Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `[pt-BR] Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `[pt-BR] Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: (type: string) => `[pt-BR] Your ${type} reservation was updated.`,
        },
        flightTo: '[pt-BR] Flight to',
        trainTo: '[pt-BR] Train to',
        carRental: '[pt-BR]  car rental',
        nightIn: '[pt-BR] night in',
        nightsIn: '[pt-BR] nights in',
    },
    proactiveAppReview: {
        title: '[pt-BR] Enjoying New Expensify?',
        description: '[pt-BR] Let us know so we can help make your expensing experience even better.',
        positiveButton: '[pt-BR] Yeah!',
        negativeButton: '[pt-BR] Not really',
    },
    workspace: {
        common: {
            card: '[pt-BR] Cards',
            expensifyCard: '[pt-BR] Expensify Card',
            companyCards: '[pt-BR] Company cards',
            personalCards: '[pt-BR] Personal cards',
            workflows: '[pt-BR] Workflows',
            workspace: '[pt-BR] Workspace',
            findWorkspace: '[pt-BR] Find workspace',
            edit: '[pt-BR] Edit workspace',
            enabled: '[pt-BR] Enabled',
            disabled: '[pt-BR] Disabled',
            everyone: '[pt-BR] Everyone',
            delete: '[pt-BR] Delete workspace',
            settings: '[pt-BR] Settings',
            reimburse: '[pt-BR] Reimbursements',
            categories: '[pt-BR] Categories',
            tags: '[pt-BR] Tags',
            customField1: '[pt-BR] Custom field 1',
            customField2: '[pt-BR] Custom field 2',
            customFieldHint: '[pt-BR] Add custom coding that applies to all spend from this member.',
            reports: '[pt-BR] Reports',
            reportFields: '[pt-BR] Report fields',
            reportTitle: '[pt-BR] Report title',
            reportField: '[pt-BR] Report field',
            taxes: '[pt-BR] Taxes',
            bills: '[pt-BR] Bills',
            invoices: '[pt-BR] Invoices',
            perDiem: '[pt-BR] Per diem',
            travel: '[pt-BR] Travel',
            members: '[pt-BR] Members',
            accounting: '[pt-BR] Accounting',
            receiptPartners: '[pt-BR] Receipt partners',
            rules: '[pt-BR] Rules',
            displayedAs: '[pt-BR] Displayed as',
            plan: '[pt-BR] Plan',
            profile: '[pt-BR] Overview',
            bankAccount: '[pt-BR] Bank account',
            testTransactions: '[pt-BR] Test transactions',
            issueAndManageCards: '[pt-BR] Issue and manage cards',
            reconcileCards: '[pt-BR] Reconcile cards',
            selectAll: '[pt-BR] Select all',
            selected: () => ({
                one: '[pt-BR] 1 selected',
                other: (count: number) => `[pt-BR] ${count} selected`,
            }),
            settlementFrequency: '[pt-BR] Settlement frequency',
            setAsDefault: '[pt-BR] Set as default workspace',
            defaultNote: `[pt-BR] Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '[pt-BR] Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: '[pt-BR] Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            deleteOpenExpensifyCardsError: '[pt-BR] Your company still has open Expensify Cards.',
            outstandingBalanceWarning:
                '[pt-BR] You have an outstanding balance that must be settled before deleting your last workspace. Please go to your subscription settings to resolve the payment.',
            settleBalance: '[pt-BR] Go to subscription',
            unavailable: '[pt-BR] Unavailable workspace',
            memberNotFound: '[pt-BR] Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `[pt-BR] You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: '[pt-BR] Go to workspace',
            duplicateWorkspace: '[pt-BR] Duplicate workspace',
            duplicateWorkspacePrefix: '[pt-BR] Duplicate',
            goToWorkspaces: '[pt-BR] Go to workspaces',
            clearFilter: '[pt-BR] Clear filter',
            workspaceName: '[pt-BR] Workspace name',
            workspaceOwner: '[pt-BR] Owner',
            keepMeAsAdmin: '[pt-BR] Keep me as an admin',
            workspaceType: '[pt-BR] Workspace type',
            workspaceAvatar: '[pt-BR] Workspace avatar',
            clientID: '[pt-BR] Client ID',
            clientIDInputHint: "[pt-BR] Enter the client's unique identifier",
            mustBeOnlineToViewMembers: '[pt-BR] You need to be online in order to view members of this workspace.',
            moreFeatures: '[pt-BR] More features',
            requested: '[pt-BR] Requested',
            distanceRates: '[pt-BR] Distance rates',
            defaultDescription: '[pt-BR] One place for all your receipts and expenses.',
            descriptionHint: '[pt-BR] Share information about this workspace with all members.',
            welcomeNote: '[pt-BR] Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: '[pt-BR] Subscription',
            markAsEntered: '[pt-BR] Mark as manually entered',
            markAsExported: '[pt-BR] Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `[pt-BR] Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "[pt-BR] Let's double check that everything looks right.",
            lineItemLevel: '[pt-BR] Line-item level',
            reportLevel: '[pt-BR] Report level',
            topLevel: '[pt-BR] Top level',
            appliedOnExport: '[pt-BR] Not imported into Expensify, applied on export',
            shareNote: {
                header: '[pt-BR] Share your workspace with other members',
                content: (adminsRoomLink: string) =>
                    `[pt-BR] Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `[pt-BR] Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '[pt-BR] Create new connection',
            reuseExistingConnection: '[pt-BR] Reuse existing connection',
            existingConnections: '[pt-BR] Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `[pt-BR] Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `[pt-BR] ${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `[pt-BR] Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: '[pt-BR] Learn more',
            memberAlternateText: '[pt-BR] Submit and approve reports.',
            adminAlternateText: '[pt-BR] Manage reports and workspace settings.',
            auditorAlternateText: '[pt-BR] View and comment on reports.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: '[pt-BR] Direct',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: '[pt-BR] None',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '[pt-BR] Indirect',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '[pt-BR] Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '[pt-BR] Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return '[pt-BR] Member';
                    default:
                        return '[pt-BR] Member';
                }
            },
            frequency: {
                manual: '[pt-BR] Manually',
                instant: '[pt-BR] Instant',
                immediate: '[pt-BR] Daily',
                trip: '[pt-BR] By trip',
                weekly: '[pt-BR] Weekly',
                semimonthly: '[pt-BR] Twice a month',
                monthly: '[pt-BR] Monthly',
            },
            budgetFrequency: {
                monthly: '[pt-BR] monthly',
                yearly: '[pt-BR] yearly',
            },
            budgetFrequencyUnit: {
                monthly: '[pt-BR] month',
                yearly: '[pt-BR] year',
            },
            budgetTypeForNotificationMessage: {
                tag: '[pt-BR] tag',
                category: '[pt-BR] category',
            },
            planType: '[pt-BR] Plan type',
            youCantDowngradeInvoicing:
                "[pt-BR] You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: '[pt-BR] Default category',
            viewTransactions: '[pt-BR] View transactions',
            policyExpenseChatName: (displayName: string) => `[pt-BR] ${displayName}'s expenses`,
            deepDiveExpensifyCard: `[pt-BR] <muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `[pt-BR] Connected to ${organizationName}` : '[pt-BR] Automate travel and meal delivery expenses across your organization.',
                sendInvites: '[pt-BR] Send invites',
                sendInvitesDescription: "[pt-BR] These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: '[pt-BR] Confirm invite',
                manageInvites: '[pt-BR] Manage invites',
                confirm: '[pt-BR] Confirm',
                allSet: '[pt-BR] All set',
                readyToRoll: "[pt-BR] You're ready to roll",
                takeBusinessRideMessage: '[pt-BR] Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: '[pt-BR] All',
                linked: '[pt-BR] Linked',
                outstanding: '[pt-BR] Outstanding',
                status: {
                    resend: '[pt-BR] Resend',
                    invite: '[pt-BR] Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '[pt-BR] Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '[pt-BR] Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '[pt-BR] Suspended',
                },
                centralBillingAccount: '[pt-BR] Central billing account',
                centralBillingDescription: '[pt-BR] Choose where to import all Uber receipts.',
                invitationFailure: '[pt-BR] Failed to invite member to Uber for Business',
                autoInvite: '[pt-BR] Invite new workspace members to Uber for Business',
                autoRemove: '[pt-BR] Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: '[pt-BR] No outstanding invites',
                    subtitle: '[pt-BR] Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `[pt-BR] <muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: '[pt-BR] Amount',
            deleteRates: () => ({
                one: '[pt-BR] Delete rate',
                other: '[pt-BR] Delete rates',
            }),
            deletePerDiemRate: '[pt-BR] Delete per diem rate',
            findPerDiemRate: '[pt-BR] Find per diem rate',
            areYouSureDelete: () => ({
                one: '[pt-BR] Are you sure you want to delete this rate?',
                other: '[pt-BR] Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: '[pt-BR] Per diem',
                subtitle: '[pt-BR] Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: '[pt-BR] Import per diem rates',
            editPerDiemRate: '[pt-BR] Edit per diem rate',
            editPerDiemRates: '[pt-BR] Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `[pt-BR] Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `[pt-BR] Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '[pt-BR] Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: '[pt-BR] Mark checks as “print later”',
            exportDescription: '[pt-BR] Configure how Expensify data exports to QuickBooks Desktop.',
            date: '[pt-BR] Export date',
            exportInvoices: '[pt-BR] Export invoices to',
            exportExpensifyCard: '[pt-BR] Export Expensify Card transactions as',
            account: '[pt-BR] Account',
            accountDescription: '[pt-BR] Choose where to post journal entries.',
            accountsPayable: '[pt-BR] Accounts payable',
            accountsPayableDescription: '[pt-BR] Choose where to create vendor bills.',
            bankAccount: '[pt-BR] Bank account',
            notConfigured: '[pt-BR] Not configured',
            bankAccountDescription: '[pt-BR] Choose where to send checks from.',
            creditCardAccount: '[pt-BR] Credit card account',
            exportDate: {
                label: '[pt-BR] Export date',
                description: '[pt-BR] Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pt-BR] Date of last expense',
                        description: '[pt-BR] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[pt-BR] Export date',
                        description: '[pt-BR] Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[pt-BR] Submitted date',
                        description: '[pt-BR] Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "[pt-BR] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[pt-BR] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[pt-BR] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "[pt-BR] QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[pt-BR] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[pt-BR] Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[pt-BR] Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[pt-BR] Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[pt-BR] Check',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "[pt-BR] We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[pt-BR] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[pt-BR] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[pt-BR] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[pt-BR] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '[pt-BR] Choose where to send checks from.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[pt-BR] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[pt-BR] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[pt-BR] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: '[pt-BR] No accounts found',
            noAccountsFoundDescription: '[pt-BR] Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: '[pt-BR] QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "[pt-BR] Can't connect from this device",
                body1: "[pt-BR] You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "[pt-BR] Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: '[pt-BR] Open this link to connect',
                body: '[pt-BR] To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: '[pt-BR] Something went wrong',
                setupErrorBody: (conciergeLink: string) =>
                    `[pt-BR] <muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: '[pt-BR] Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: '[pt-BR] Classes',
            items: '[pt-BR] Items',
            customers: '[pt-BR] Customers/projects',
            exportCompanyCardsDescription: '[pt-BR] Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: '[pt-BR] Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: '[pt-BR] Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[pt-BR] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[pt-BR] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[pt-BR] Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: '[pt-BR] Line item level',
            reportFieldsDisplayedAsDescription: '[pt-BR] Report level',
            customersDescription: '[pt-BR] Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: '[pt-BR] Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: '[pt-BR] Auto-create entities',
                createEntitiesDescription: "[pt-BR] Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: '[pt-BR] Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: '[pt-BR] When to Export',
                description: '[pt-BR] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: '[pt-BR] Connected to',
            importDescription: '[pt-BR] Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: '[pt-BR] Classes',
            locations: '[pt-BR] Locations',
            customers: '[pt-BR] Customers/projects',
            accountsDescription: '[pt-BR] Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[pt-BR] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[pt-BR] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[pt-BR] Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: '[pt-BR] Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: '[pt-BR] Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: '[pt-BR] Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "[pt-BR] QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "[pt-BR] QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: '[pt-BR] Configure how Expensify data exports to QuickBooks Online.',
            date: '[pt-BR] Export date',
            exportInvoices: '[pt-BR] Export invoices to',
            exportExpensifyCard: '[pt-BR] Export Expensify Card transactions as',
            exportDate: {
                label: '[pt-BR] Export date',
                description: '[pt-BR] Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pt-BR] Date of last expense',
                        description: '[pt-BR] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[pt-BR] Export date',
                        description: '[pt-BR] Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[pt-BR] Submitted date',
                        description: '[pt-BR] Date the report was submitted for approval.',
                    },
                },
            },
            receivable: '[pt-BR] Accounts receivable',
            archive: '[pt-BR] Accounts receivable archive',
            exportInvoicesDescription: '[pt-BR] Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: '[pt-BR] Set how company card purchases export to QuickBooks Online.',
            vendor: '[pt-BR] Vendor',
            defaultVendorDescription: '[pt-BR] Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: '[pt-BR] Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "[pt-BR] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[pt-BR] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[pt-BR] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: '[pt-BR] Account',
            accountDescription: '[pt-BR] Choose where to post journal entries.',
            accountsPayable: '[pt-BR] Accounts payable',
            accountsPayableDescription: '[pt-BR] Choose where to create vendor bills.',
            bankAccount: '[pt-BR] Bank account',
            notConfigured: '[pt-BR] Not configured',
            bankAccountDescription: '[pt-BR] Choose where to send checks from.',
            creditCardAccount: '[pt-BR] Credit card account',
            companyCardsLocationEnabledDescription:
                "[pt-BR] QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "[pt-BR] QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[pt-BR] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: '[pt-BR] Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: '[pt-BR] Invite employees',
                inviteEmployeesDescription: '[pt-BR] Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: '[pt-BR] Auto-create entities',
                createEntitiesDescription:
                    "[pt-BR] Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription: '[pt-BR] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: '[pt-BR] QuickBooks bill payment account',
                qboInvoiceCollectionAccount: '[pt-BR] QuickBooks invoice collections account',
                accountSelectDescription: "[pt-BR] Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "[pt-BR] Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '[pt-BR] Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[pt-BR] Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[pt-BR] Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[pt-BR] Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[pt-BR] Check',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "[pt-BR] We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[pt-BR] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[pt-BR] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '[pt-BR] Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[pt-BR] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[pt-BR] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[pt-BR] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[pt-BR] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[pt-BR] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[pt-BR] Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[pt-BR] Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[pt-BR] Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[pt-BR] To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[pt-BR] To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[pt-BR] To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: '[pt-BR] No accounts found',
            noAccountsFoundDescription: '[pt-BR] Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: '[pt-BR] When to Export',
                description: '[pt-BR] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Out-of-pocket expenses will export when paid',
                },
            },
            travelInvoicing: '[pt-BR] Export Expensify Travel Payable To',
            travelInvoicingVendor: '[pt-BR] Travel vendor',
            travelInvoicingPayableAccount: '[pt-BR] Travel payable account',
        },
        workspaceList: {
            joinNow: '[pt-BR] Join now',
            askToJoin: '[pt-BR] Ask to join',
        },
        xero: {
            organization: '[pt-BR] Xero organization',
            organizationDescription: "[pt-BR] Choose the Xero organization that you'd like to import data from.",
            importDescription: '[pt-BR] Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: '[pt-BR] Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[pt-BR] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[pt-BR] Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: '[pt-BR] Tracking categories',
            trackingCategoriesDescription: '[pt-BR] Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `[pt-BR] Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `[pt-BR] Choose where to map ${categoryName} when exporting to Xero.`,
            customers: '[pt-BR] Re-bill customers',
            customersDescription:
                '[pt-BR] Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: '[pt-BR] Choose how to handle Xero taxes in Expensify.',
            notImported: '[pt-BR] Not imported',
            notConfigured: '[pt-BR] Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: '[pt-BR] Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '[pt-BR] Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '[pt-BR] Report fields',
            },
            exportDescription: '[pt-BR] Configure how Expensify data exports to Xero.',
            purchaseBill: '[pt-BR] Purchase bill',
            exportDeepDiveCompanyCard:
                '[pt-BR] Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: '[pt-BR] Bank transactions',
            xeroBankAccount: '[pt-BR] Xero bank account',
            xeroBankAccountDescription: '[pt-BR] Choose where expenses will post as bank transactions.',
            exportExpensesDescription: '[pt-BR] Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: '[pt-BR] Purchase bill date',
            exportInvoices: '[pt-BR] Export invoices as',
            salesInvoice: '[pt-BR] Sales invoice',
            exportInvoicesDescription: '[pt-BR] Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: '[pt-BR] Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: '[pt-BR] Purchase bill status',
                reimbursedReportsDescription: '[pt-BR] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: '[pt-BR] Xero bill payment account',
                xeroInvoiceCollectionAccount: '[pt-BR] Xero invoice collections account',
                xeroBillPaymentAccountDescription: "[pt-BR] Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "[pt-BR] Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: '[pt-BR] Purchase bill date',
                description: '[pt-BR] Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pt-BR] Date of last expense',
                        description: '[pt-BR] Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[pt-BR] Export date',
                        description: '[pt-BR] Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[pt-BR] Submitted date',
                        description: '[pt-BR] Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: '[pt-BR] Purchase bill status',
                description: '[pt-BR] Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '[pt-BR] Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '[pt-BR] Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '[pt-BR] Awaiting payment',
                },
            },
            noAccountsFound: '[pt-BR] No accounts found',
            noAccountsFoundDescription: '[pt-BR] Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: '[pt-BR] When to Export',
                description: '[pt-BR] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '[pt-BR] Preferred exporter',
            taxSolution: '[pt-BR] Tax solution',
            notConfigured: '[pt-BR] Not configured',
            exportDate: {
                label: '[pt-BR] Export date',
                description: '[pt-BR] Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pt-BR] Date of last expense',
                        description: '[pt-BR] Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '[pt-BR] Export date',
                        description: '[pt-BR] Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '[pt-BR] Submitted date',
                        description: '[pt-BR] Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: '[pt-BR] Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '[pt-BR] Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[pt-BR] Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: '[pt-BR] Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '[pt-BR] Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[pt-BR] Vendor bills',
                },
            },
            creditCardAccount: '[pt-BR] Credit card account',
            defaultVendor: '[pt-BR] Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `[pt-BR] Set a default vendor that will apply to ${isReimbursable ? '' : '[pt-BR] non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: '[pt-BR] Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                '[pt-BR] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[pt-BR] Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: '[pt-BR] No accounts found',
            noAccountsFoundDescription: `[pt-BR] Please add the account in Sage Intacct and sync the connection again`,
            autoSync: '[pt-BR] Auto-sync',
            autoSyncDescription: '[pt-BR] Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: '[pt-BR] Invite employees',
            inviteEmployeesDescription:
                '[pt-BR] Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: '[pt-BR] Sync reimbursed reports',
            syncReimbursedReportsDescription: '[pt-BR] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: '[pt-BR] Sage Intacct payment account',
            accountingMethods: {
                label: '[pt-BR] When to Export',
                description: '[pt-BR] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Out-of-pocket expenses will export when paid',
                },
            },
        },
        netsuite: {
            subsidiary: '[pt-BR] Subsidiary',
            subsidiarySelectDescription: "[pt-BR] Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: '[pt-BR] Configure how Expensify data exports to NetSuite.',
            exportInvoices: '[pt-BR] Export invoices to',
            journalEntriesTaxPostingAccount: '[pt-BR] Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: '[pt-BR] Journal entries provincial tax posting account',
            foreignCurrencyAmount: '[pt-BR] Export foreign currency amount',
            exportToNextOpenPeriod: '[pt-BR] Export to next open period',
            nonReimbursableJournalPostingAccount: '[pt-BR] Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: '[pt-BR] Reimbursable journal posting account',
            journalPostingPreference: {
                label: '[pt-BR] Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '[pt-BR] Single, itemized entry for each report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '[pt-BR] Single entry for each expense',
                },
            },
            invoiceItem: {
                label: '[pt-BR] Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '[pt-BR] Create one for me',
                        description: '[pt-BR] We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '[pt-BR] Select existing',
                        description: "[pt-BR] We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: '[pt-BR] Export date',
                description: '[pt-BR] Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[pt-BR] Date of last expense',
                        description: '[pt-BR] Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '[pt-BR] Export date',
                        description: '[pt-BR] Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '[pt-BR] Submitted date',
                        description: '[pt-BR] Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '[pt-BR] Expense reports',
                        reimbursableDescription: '[pt-BR] Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: '[pt-BR] Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '[pt-BR] Vendor bills',
                        reimbursableDescription: dedent(`
                            [pt-BR] Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [pt-BR] Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '[pt-BR] Journal entries',
                        reimbursableDescription: dedent(`
                            [pt-BR] Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [pt-BR] Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "[pt-BR] If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: '[pt-BR] Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: '[pt-BR] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: '[pt-BR] Reimbursements account',
                reimbursementsAccountDescription: "[pt-BR] Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: '[pt-BR] Collections account',
                collectionsAccountDescription: '[pt-BR] Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: '[pt-BR] A/P approval account',
                approvalAccountDescription:
                    '[pt-BR] Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: '[pt-BR] NetSuite default',
                inviteEmployees: '[pt-BR] Invite employees and set approvals',
                inviteEmployeesDescription:
                    '[pt-BR] Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: '[pt-BR] Auto-create employees/vendors',
                enableCategories: '[pt-BR] Enable newly imported categories',
                customFormID: '[pt-BR] Custom form ID',
                customFormIDDescription:
                    '[pt-BR] By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: '[pt-BR] Out-of-pocket expense',
                customFormIDNonReimbursable: '[pt-BR] Company card expense',
                exportReportsTo: {
                    label: '[pt-BR] Expense report approval level',
                    description:
                        '[pt-BR] Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: '[pt-BR] NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '[pt-BR] Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '[pt-BR] Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '[pt-BR] Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: '[pt-BR] When to Export',
                    description: '[pt-BR] Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[pt-BR] Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[pt-BR] Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: '[pt-BR] Vendor bill approval level',
                    description: '[pt-BR] Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: '[pt-BR] NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '[pt-BR] Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '[pt-BR] Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: '[pt-BR] Journal entry approval level',
                    description: '[pt-BR] Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: '[pt-BR] NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '[pt-BR] Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '[pt-BR] Approved for posting',
                    },
                },
                error: {
                    customFormID: '[pt-BR] Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: '[pt-BR] No accounts found',
            noAccountsFoundDescription: '[pt-BR] Please add the account in NetSuite and sync the connection again',
            noVendorsFound: '[pt-BR] No vendors found',
            noVendorsFoundDescription: '[pt-BR] Please add vendors in NetSuite and sync the connection again',
            noItemsFound: '[pt-BR] No invoice items found',
            noItemsFoundDescription: '[pt-BR] Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: '[pt-BR] No subsidiaries found',
            noSubsidiariesFoundDescription: '[pt-BR] Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: '[pt-BR] NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: '[pt-BR] Install the Expensify bundle',
                        description: '[pt-BR] In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: '[pt-BR] Enable token-based authentication',
                        description: '[pt-BR] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: '[pt-BR] Enable SOAP web services',
                        description: '[pt-BR] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: '[pt-BR] Create an access token',
                        description:
                            '[pt-BR] In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: '[pt-BR] Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: '[pt-BR] NetSuite Account ID',
                            netSuiteTokenID: '[pt-BR] Token ID',
                            netSuiteTokenSecret: '[pt-BR] Token Secret',
                        },
                        netSuiteAccountIDDescription: '[pt-BR] In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: '[pt-BR] Expense categories',
                expenseCategoriesDescription: '[pt-BR] Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: '[pt-BR] Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: '[pt-BR] Departments',
                        subtitle: '[pt-BR] Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: '[pt-BR] Classes',
                        subtitle: '[pt-BR] Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: '[pt-BR] Locations',
                        subtitle: '[pt-BR] Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: '[pt-BR] Customers/projects',
                    subtitle: '[pt-BR] Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: '[pt-BR] Import customers',
                    importJobs: '[pt-BR] Import projects',
                    customers: '[pt-BR] customers',
                    jobs: '[pt-BR] projects',
                    label: (importFields: string[], importType: string) => `${importFields.join('[pt-BR]  and ')}, ${importType}`,
                },
                importTaxDescription: '[pt-BR] Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: '[pt-BR] Choose an option below:',
                    label: (importedTypes: string[]) => `[pt-BR] Imported as ${importedTypes.join('[pt-BR]  and ')}`,
                    requiredFieldError: (fieldName: string) => `[pt-BR] Please enter the ${fieldName}`,
                    customSegments: {
                        title: '[pt-BR] Custom segments/records',
                        addText: '[pt-BR] Add custom segment/record',
                        recordTitle: '[pt-BR] Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '[pt-BR] View detailed instructions',
                        helpText: '[pt-BR]  on configuring custom segments/records.',
                        emptyTitle: '[pt-BR] Add a custom segment or custom record',
                        fields: {
                            segmentName: '[pt-BR] Name',
                            internalID: '[pt-BR] Internal ID',
                            scriptID: '[pt-BR] Script ID',
                            customRecordScriptID: '[pt-BR] Transaction column ID',
                            mapping: '[pt-BR] Displayed as',
                        },
                        removeTitle: '[pt-BR] Remove custom segment/record',
                        removePrompt: '[pt-BR] Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: '[pt-BR] custom segment name',
                            customRecordName: '[pt-BR] custom record name',
                            segmentTitle: '[pt-BR] Custom segment',
                            customSegmentAddTitle: '[pt-BR] Add custom segment',
                            customRecordAddTitle: '[pt-BR] Add custom record',
                            recordTitle: '[pt-BR] Custom record',
                            segmentRecordType: '[pt-BR] Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "[pt-BR] What's the custom segment name?",
                            customRecordNameTitle: "[pt-BR] What's the custom record name?",
                            customSegmentNameFooter: `[pt-BR] You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `[pt-BR] You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "[pt-BR] What's the internal ID?",
                            customSegmentInternalIDFooter: `[pt-BR] First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*

You can find custom segment internal IDs in NetSuite under:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the hyperlink next to *Custom Record Type*.
4. Find the internal ID in the table at the bottom.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `[pt-BR] You can find custom record internal IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the internal ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "[pt-BR] What's the script ID?",
                            customSegmentScriptIDFooter: `[pt-BR] You can find custom segment script IDs in NetSuite under: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the *Application and Sourcing* tab near the bottom, then:
    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.
    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "[pt-BR] What's the transaction column ID?",
                            customRecordScriptIDFooter: `[pt-BR] You can find custom record script IDs in NetSuite under:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the script ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '[pt-BR] How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: '[pt-BR] How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `[pt-BR] A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: '[pt-BR] Custom lists',
                        addText: '[pt-BR] Add custom list',
                        recordTitle: '[pt-BR] Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '[pt-BR] View detailed instructions',
                        helpText: '[pt-BR]  on configuring custom lists.',
                        emptyTitle: '[pt-BR] Add a custom list',
                        fields: {
                            listName: '[pt-BR] Name',
                            internalID: '[pt-BR] Internal ID',
                            transactionFieldID: '[pt-BR] Transaction field ID',
                            mapping: '[pt-BR] Displayed as',
                        },
                        removeTitle: '[pt-BR] Remove custom list',
                        removePrompt: '[pt-BR] Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: '[pt-BR] Choose a custom list',
                            transactionFieldIDTitle: "[pt-BR] What's the transaction field ID?",
                            transactionFieldIDFooter: `[pt-BR] You can find transaction field IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom list.
3. Find the transaction field ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '[pt-BR] How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `[pt-BR] A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: '[pt-BR] NetSuite employee default',
                        description: '[pt-BR] Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `[pt-BR] If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '[pt-BR] Tags',
                        description: '[pt-BR] Line-item level',
                        footerContent: (importField: string) => `[pt-BR] ${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '[pt-BR] Report fields',
                        description: '[pt-BR] Report level',
                        footerContent: (importField: string) => `[pt-BR] ${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: '[pt-BR] Sage Intacct setup',
            prerequisitesTitle: '[pt-BR] Before you connect...',
            downloadExpensifyPackage: '[pt-BR] Download the Expensify package for Sage Intacct',
            followSteps: '[pt-BR] Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: '[pt-BR] Enter your Sage Intacct credentials',
            entity: '[pt-BR] Entity',
            employeeDefault: '[pt-BR] Sage Intacct employee default',
            employeeDefaultDescription: "[pt-BR] The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "[pt-BR] Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "[pt-BR] Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: (mappingTitle: string) => `[pt-BR] Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: '[pt-BR] Expense types',
            expenseTypesDescription: '[pt-BR] Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: '[pt-BR] Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: '[pt-BR] Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: '[pt-BR] User-defined dimensions',
            addUserDefinedDimension: '[pt-BR] Add user-defined dimension',
            integrationName: '[pt-BR] Integration name',
            dimensionExists: '[pt-BR] A dimension with this name already exists.',
            removeDimension: '[pt-BR] Remove user-defined dimension',
            removeDimensionPrompt: '[pt-BR] Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: '[pt-BR] User-defined dimension',
            addAUserDefinedDimension: '[pt-BR] Add a user-defined dimension',
            detailedInstructionsLink: '[pt-BR] View detailed instructions',
            detailedInstructionsRestOfSentence: '[pt-BR]  on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '[pt-BR] 1 UDD added',
                other: (count: number) => `[pt-BR] ${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '[pt-BR] departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '[pt-BR] classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '[pt-BR] locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '[pt-BR] customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '[pt-BR] projects (jobs)';
                    default:
                        return '[pt-BR] mappings';
                }
            },
        },
        type: {
            free: '[pt-BR] Free',
            control: '[pt-BR] Control',
            collect: '[pt-BR] Collect',
        },
        companyCards: {
            addCards: '[pt-BR] Add cards',
            selectCards: '[pt-BR] Select cards',
            fromOtherWorkspaces: '[pt-BR] From other workspaces',
            addWorkEmail: '[pt-BR] Add your work email',
            addWorkEmailDescription: '[pt-BR] Please add your work email in order to use existing feeds from other workspaces.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: "[pt-BR] Couldn't load card feeds",
                workspaceFeedsCouldNotBeLoadedMessage: '[pt-BR] An error occurred while loading workspace card feeds. Please try again or contact your administrator.',
                feedCouldNotBeLoadedTitle: "[pt-BR] Couldn't load this feed",
                feedCouldNotBeLoadedMessage: '[pt-BR] An error occurred while loading this feed. Please try again or contact your administrator.',
                tryAgain: '[pt-BR] Try again',
            },
            addNewCard: {
                other: '[pt-BR] Other',
                fileImport: '[pt-BR] Import transactions from file',
                createFileFeedHelpText: `[pt-BR] <muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: '[pt-BR] Company card layout name',
                cardLayoutNameRequired: '[pt-BR] The Company card layout name is required',
                useAdvancedFields: '[pt-BR] Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: '[pt-BR] American Express Corporate Cards',
                    cdf: '[pt-BR] Mastercard Commercial Cards',
                    vcf: '[pt-BR] Visa Commercial Cards',
                    stripe: '[pt-BR] Stripe Cards',
                },
                yourCardProvider: `[pt-BR] Who's your card provider?`,
                whoIsYourBankAccount: '[pt-BR] Who’s your bank?',
                whereIsYourBankLocated: '[pt-BR] Where’s your bank located?',
                howDoYouWantToConnect: '[pt-BR] How do you want to connect to your bank?',
                learnMoreAboutOptions: `[pt-BR] <muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: '[pt-BR] Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `[pt-BR] Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: '[pt-BR] The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `[pt-BR] Enable your ${provider} feed`,
                    heading:
                        '[pt-BR] We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: '[pt-BR] We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: '[pt-BR] We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `[pt-BR] 1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.

2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `[pt-BR] 1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.

2. Once the feed is enabled, Amex will send you a production letter.

3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `[pt-BR] 1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.

 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `[pt-BR] 1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Under Product Integrations, click Enable next to Expensify.

3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: '[pt-BR] What bank issues these cards?',
                enterNameOfBank: '[pt-BR] Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: '[pt-BR] What are the Visa feed details?',
                        processorLabel: '[pt-BR] Processor ID',
                        bankLabel: '[pt-BR] Financial institution (bank) ID',
                        companyLabel: '[pt-BR] Company ID',
                        helpLabel: '[pt-BR] Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `[pt-BR] What's the Amex delivery file name?`,
                        fileNameLabel: '[pt-BR] Delivery file name',
                        helpLabel: '[pt-BR] Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `[pt-BR] What's the Mastercard distribution ID?`,
                        distributionLabel: '[pt-BR] Distribution ID',
                        helpLabel: '[pt-BR] Where do I find the distribution ID?',
                    },
                },
                amexCorporate: '[pt-BR] Select this if the front of your cards say “Corporate”',
                amexBusiness: '[pt-BR] Select this if the front of your cards say “Business”',
                amexPersonal: '[pt-BR] Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: '[pt-BR] Please select a card provider before continuing',
                    pleaseSelectBankAccount: '[pt-BR] Please select a bank account before continuing',
                    pleaseSelectBank: '[pt-BR] Please select a bank before continuing',
                    pleaseSelectCountry: '[pt-BR] Please select a country before continuing',
                    pleaseSelectFeedType: '[pt-BR] Please select a feed type before continuing',
                },
                exitModal: {
                    title: '[pt-BR] Something not working?',
                    prompt: "[pt-BR] We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: '[pt-BR] Report issue',
                    cancelText: '[pt-BR] Skip',
                },
                csvColumns: {
                    cardNumber: '[pt-BR] Card number',
                    postedDate: '[pt-BR] Date',
                    merchant: '[pt-BR] Merchant',
                    amount: '[pt-BR] Amount',
                    currency: '[pt-BR] Currency',
                    ignore: '[pt-BR] Ignore',
                    originalTransactionDate: '[pt-BR] Original transaction date',
                    originalAmount: '[pt-BR] Original amount',
                    originalCurrency: '[pt-BR] Original currency',
                    comment: '[pt-BR] Comment',
                    category: '[pt-BR] Category',
                    tag: '[pt-BR] Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `[pt-BR] Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `[pt-BR] Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '[pt-BR] Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '[pt-BR] Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '[pt-BR] Custom day of month',
            },
            assign: '[pt-BR] Assign',
            assignCard: '[pt-BR] Assign card',
            findCard: '[pt-BR] Find card',
            cardNumber: '[pt-BR] Card number',
            commercialFeed: '[pt-BR] Commercial feed',
            feedName: (feedName: string) => `[pt-BR] ${feedName} cards`,
            deletedFeed: '[pt-BR] Deleted feed',
            deletedCard: '[pt-BR] Deleted card',
            directFeed: '[pt-BR] Direct feed',
            whoNeedsCardAssigned: '[pt-BR] Who needs a card assigned?',
            chooseTheCardholder: '[pt-BR] Choose the cardholder',
            chooseCard: '[pt-BR] Choose a card',
            chooseCardFor: (assignee: string) =>
                `[pt-BR] Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: '[pt-BR] No active cards on this feed',
            somethingMightBeBroken:
                '[pt-BR] <muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: '[pt-BR] Choose a transaction start date',
            startDateDescription: "[pt-BR] Choose your import start date. We'll sync all transactions from this date onwards.",
            editStartDateDescription: "[pt-BR] Choose a new transaction start date. We'll sync all transactions from that date onwards, excluding those we already imported.",
            fromTheBeginning: '[pt-BR] From the beginning',
            customStartDate: '[pt-BR] Custom start date',
            customCloseDate: '[pt-BR] Custom close date',
            letsDoubleCheck: "[pt-BR] Let's double check that everything looks right.",
            confirmationDescription: "[pt-BR] We'll begin importing transactions immediately.",
            card: '[pt-BR] Card',
            cardName: '[pt-BR] Card name',
            brokenConnectionError: '[pt-BR] <rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `[pt-BR] assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '[pt-BR] company card',
            chooseCardFeed: '[pt-BR] Choose card feed',
            ukRegulation:
                '[pt-BR] Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: '[pt-BR] Card assignment failed.',
            unassignCardFailedError: '[pt-BR] Card unassignment failed.',
            cardAlreadyAssignedError: '[pt-BR] This card is already assigned to a user in another workspace.',
            importTransactions: {
                title: '[pt-BR] Import transactions from file',
                description: '[pt-BR] Please adjust the settings for your file that will be applied on import.',
                cardDisplayName: '[pt-BR] Card display name',
                currency: '[pt-BR] Currency',
                transactionsAreReimbursable: '[pt-BR] Transactions are reimbursable',
                flipAmountSign: '[pt-BR] Flip amount sign',
                importButton: '[pt-BR] Import transactions',
            },
            assignNewCards: {
                title: '[pt-BR] Assign new cards',
                description: '[pt-BR] Get the latest cards to assign from your bank',
            },
        },
        expensifyCard: {
            issueAndManageCards: '[pt-BR] Issue and manage your Expensify Cards',
            getStartedIssuing: '[pt-BR] Get started by issuing your first virtual or physical card.',
            verificationInProgress: '[pt-BR] Verification in progress...',
            verifyingTheDetails: "[pt-BR] We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                '[pt-BR] The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                '[pt-BR] Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: '[pt-BR] Issue card',
            findCard: '[pt-BR] Find card',
            newCard: '[pt-BR] New card',
            name: '[pt-BR] Name',
            lastFour: '[pt-BR] Last 4',
            limit: '[pt-BR] Limit',
            currentBalance: '[pt-BR] Current balance',
            currentBalanceDescription: '[pt-BR] Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: (settlementDate: string) => `[pt-BR] Balance will be settled on ${settlementDate}`,
            settleBalance: '[pt-BR] Settle balance',
            cardLimit: '[pt-BR] Card limit',
            remainingLimit: '[pt-BR] Remaining limit',
            requestLimitIncrease: '[pt-BR] Request limit increase',
            remainingLimitDescription:
                '[pt-BR] We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: '[pt-BR] Cash back',
            earnedCashbackDescription: '[pt-BR] Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: '[pt-BR] Issue new card',
            finishSetup: '[pt-BR] Finish setup',
            chooseBankAccount: '[pt-BR] Choose bank account',
            chooseExistingBank: '[pt-BR] Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: '[pt-BR] Account ending in',
            addNewBankAccount: '[pt-BR] Add a new bank account',
            settlementAccount: '[pt-BR] Settlement account',
            settlementAccountDescription: '[pt-BR] Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `[pt-BR] Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: '[pt-BR] Settlement frequency',
            settlementFrequencyDescription: '[pt-BR] Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo: '[pt-BR] If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            frequency: {
                daily: '[pt-BR] Daily',
                monthly: '[pt-BR] Monthly',
            },
            cardDetails: '[pt-BR] Card details',
            cardPending: ({name}: {name: string}) => `[pt-BR] Card is currently pending and will be issued once ${name}'s account is validated.`,
            virtual: '[pt-BR] Virtual',
            physical: '[pt-BR] Physical',
            deactivate: '[pt-BR] Deactivate card',
            changeCardLimit: '[pt-BR] Change card limit',
            changeLimit: '[pt-BR] Change limit',
            smartLimitWarning: (limit: number | string) =>
                `[pt-BR] If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `[pt-BR] If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `[pt-BR] If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: '[pt-BR] Change card limit type',
            changeLimitType: '[pt-BR] Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `[pt-BR] If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `[pt-BR] If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: '[pt-BR] Add shipping details',
            issuedCard: (assignee: string) => `[pt-BR] issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `[pt-BR] issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: (assignee: string, link: string) => `[pt-BR] issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `[pt-BR] ${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `[pt-BR] ${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: (assignee: string, link: string) => `[pt-BR] ${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: '[pt-BR] card',
            replacementCard: '[pt-BR] replacement card',
            verifyingHeader: '[pt-BR] Verifying',
            bankAccountVerifiedHeader: '[pt-BR] Bank account verified',
            verifyingBankAccount: '[pt-BR] Verifying bank account...',
            verifyingBankAccountDescription: '[pt-BR] Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: '[pt-BR] Bank account verified!',
            bankAccountVerifiedDescription: '[pt-BR] You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: '[pt-BR] One more step...',
            oneMoreStepDescription: '[pt-BR] Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: '[pt-BR] Got it',
            goToConcierge: '[pt-BR] Go to Concierge',
        },
        categories: {
            deleteCategories: '[pt-BR] Delete categories',
            deleteCategoriesPrompt: '[pt-BR] Are you sure you want to delete these categories?',
            deleteCategory: '[pt-BR] Delete category',
            deleteCategoryPrompt: '[pt-BR] Are you sure you want to delete this category?',
            disableCategories: '[pt-BR] Disable categories',
            disableCategory: '[pt-BR] Disable category',
            enableCategories: '[pt-BR] Enable categories',
            enableCategory: '[pt-BR] Enable category',
            defaultSpendCategories: '[pt-BR] Default spend categories',
            spendCategoriesDescription: '[pt-BR] Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: '[pt-BR] An error occurred while deleting the category, please try again',
            categoryName: '[pt-BR] Category name',
            requiresCategory: '[pt-BR] Members must categorize all expenses',
            needCategoryForExportToIntegration: (connectionName: string) => `[pt-BR] All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: '[pt-BR] Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "[pt-BR] You haven't created any categories",
                subtitle: '[pt-BR] Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[pt-BR] <muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: '[pt-BR] An error occurred while updating the category, please try again',
            createFailureMessage: '[pt-BR] An error occurred while creating the category, please try again',
            addCategory: '[pt-BR] Add category',
            editCategory: '[pt-BR] Edit category',
            editCategories: '[pt-BR] Edit categories',
            findCategory: '[pt-BR] Find category',
            categoryRequiredError: '[pt-BR] Category name is required',
            existingCategoryError: '[pt-BR] A category with this name already exists',
            invalidCategoryName: '[pt-BR] Invalid category name',
            importedFromAccountingSoftware: '[pt-BR] The categories below are imported from your',
            payrollCode: '[pt-BR] Payroll code',
            updatePayrollCodeFailureMessage: '[pt-BR] An error occurred while updating the payroll code, please try again',
            glCode: '[pt-BR] GL code',
            updateGLCodeFailureMessage: '[pt-BR] An error occurred while updating the GL code, please try again',
            importCategories: '[pt-BR] Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: '[pt-BR] Cannot delete or disable all categories',
                description: `[pt-BR] At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: '[pt-BR] Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: '[pt-BR] Spend',
                subtitle: '[pt-BR] Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: '[pt-BR] Manage',
                subtitle: '[pt-BR] Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: '[pt-BR] Earn',
                subtitle: '[pt-BR] Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: '[pt-BR] Organize',
                subtitle: '[pt-BR] Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: '[pt-BR] Integrate',
                subtitle: '[pt-BR] Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: '[pt-BR] Distance rates',
                subtitle: '[pt-BR] Add, update, and enforce rates.',
            },
            perDiem: {
                title: '[pt-BR] Per diem',
                subtitle: '[pt-BR] Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: '[pt-BR] Travel',
                subtitle: '[pt-BR] Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: '[pt-BR] Get started with Expensify Travel',
                    subtitle: "[pt-BR] We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "[pt-BR] Let's go",
                },
                reviewingRequest: {
                    title: "[pt-BR] Pack your bags, we've got your request...",
                    subtitle: "[pt-BR] We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: '[pt-BR] Request sent',
                },
                bookOrManageYourTrip: {
                    title: '[pt-BR] Travel booking',
                    subtitle: "[pt-BR] Congrats! You're all set to book and manage travel on this workspace.",
                    ctaText: '[pt-BR] Manage travel',
                },
                settings: {
                    autoAddTripName: {
                        title: '[pt-BR] Add trip names to expenses',
                        subtitle: '[pt-BR] Automatically add trip names to expense descriptions for travel booked in Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '[pt-BR] Travel booking',
                        subtitle: "[pt-BR] Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: '[pt-BR] Manage travel',
                    },
                    centralInvoicingSection: {
                        title: '[pt-BR] Central invoicing',
                        subtitle: '[pt-BR] Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: '[pt-BR] Learn how.',
                        subsections: {
                            currentTravelSpendLabel: '[pt-BR] Current travel spend',
                            currentTravelSpendPaymentQueued: (amount: string) => `[pt-BR] Payment of ${amount} is queued and will be processed soon.`,
                            currentTravelSpendCta: '[pt-BR] Pay balance',
                            currentTravelLimitLabel: '[pt-BR] Current travel limit',
                            settlementAccountLabel: '[pt-BR] Settlement account',
                            settlementFrequencyLabel: '[pt-BR] Settlement frequency',
                            settlementFrequencyDescription: '[pt-BR] How often Expensify will pull from your business bank account to settle recent Expensify Travel transactions.',
                        },
                    },
                    disableModal: {
                        title: '[pt-BR] Turn off Travel Invoicing?',
                        body: '[pt-BR] Upcoming hotel and car rental reservations may need to be re-booked with a different payment method to avoid cancellation.',
                        confirm: '[pt-BR] Turn off',
                    },
                    outstandingBalanceModal: {
                        title: "[pt-BR] Can't turn off Travel Invoicing",
                        body: '[pt-BR] You still have an outstanding travel balance. Please pay your balance first.',
                        confirm: '[pt-BR] Got it',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `[pt-BR] Pay balance of ${amount}?`,
                        body: '[pt-BR] The payment will be queued and processed shortly after. This action cannot be undone once started.',
                    },
                    exportToPDF: '[pt-BR] Export to PDF',
                    exportToCSV: '[pt-BR] Export to CSV',
                    selectDateRangeError: '[pt-BR] Please select a date range to export',
                    invalidDateRangeError: '[pt-BR] The start date must be before the end date',
                    enabled: '[pt-BR] Central Invoicing enabled!',
                    enabledDescription: '[pt-BR] All travel spend on this workspace will now be centralized in a monthly invoice.',
                },
                personalDetailsDescription: '[pt-BR] In order to book travel, please enter your legal name as it appears on your government-issued ID.',
            },
            expensifyCard: {
                title: '[pt-BR] Expensify Card',
                subtitle: '[pt-BR] Gain insights and control over spend.',
                disableCardTitle: '[pt-BR] Disable Expensify Card',
                disableCardPrompt: '[pt-BR] You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: '[pt-BR] Chat with Concierge',
                feed: {
                    title: '[pt-BR] Get the Expensify Card',
                    subTitle: '[pt-BR] Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: '[pt-BR] Cash back on every US purchase',
                        unlimited: '[pt-BR] Unlimited virtual cards',
                        spend: '[pt-BR] Spend controls and custom limits',
                    },
                    ctaTitle: '[pt-BR] Issue new card',
                },
            },
            companyCards: {
                title: '[pt-BR] Company cards',
                subtitle: '[pt-BR] Connect the cards you already have.',
                feed: {
                    title: '[pt-BR] Bring your own cards (BYOC)',
                    subtitle: '[pt-BR] Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: '[pt-BR] Connect cards from 10,000+ banks',
                        assignCards: '[pt-BR] Link your team’s existing cards',
                        automaticImport: '[pt-BR] We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: '[pt-BR] Bank connection issue',
                connectWithPlaid: '[pt-BR] connect via Plaid',
                connectWithExpensifyCard: '[pt-BR] try the Expensify Card.',
                bankConnectionDescription: `[pt-BR] Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: '[pt-BR] Disable company cards',
                disableCardPrompt: '[pt-BR] You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: '[pt-BR] Chat with Concierge',
                cardDetails: '[pt-BR] Card details',
                cardNumber: '[pt-BR] Card number',
                cardholder: '[pt-BR] Cardholder',
                cardName: '[pt-BR] Card name',
                allCards: '[pt-BR] All cards',
                assignedCards: '[pt-BR] Assigned',
                unassignedCards: '[pt-BR] Unassigned',
                integrationExport: (integration: string, type?: string) => (integration && type ? `[pt-BR] ${integration} ${type.toLowerCase()} export` : `[pt-BR] ${integration} export`),
                integrationExportTitleXero: (integration: string) => `[pt-BR] Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `[pt-BR] Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: '[pt-BR] Last updated',
                transactionStartDate: '[pt-BR] Transaction start date',
                updateCard: '[pt-BR] Update card',
                unassignCard: '[pt-BR] Unassign card',
                unassign: '[pt-BR] Unassign',
                unassignCardDescription: '[pt-BR] Unassigning this card will delete all unsubmitted transactions.',
                assignCard: '[pt-BR] Assign card',
                removeCard: '[pt-BR] Remove card',
                remove: '[pt-BR] Remove',
                removeCardDescription: '[pt-BR] Removing this card will delete all unsubmitted transactions.',
                cardFeedName: '[pt-BR] Card feed name',
                cardFeedNameDescription: '[pt-BR] Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: '[pt-BR] Delete transactions',
                cardFeedTransactionDescription: '[pt-BR] Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: '[pt-BR] Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: '[pt-BR] Allow deleting transactions',
                removeCardFeed: '[pt-BR] Remove card feed',
                removeCardFeedTitle: (feedName: string) => `[pt-BR] Remove ${feedName} feed`,
                removeCardFeedDescription: '[pt-BR] Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: '[pt-BR] Card feed name is required',
                    statementCloseDateRequired: '[pt-BR] Please select a statement close date.',
                },
                corporate: '[pt-BR] Restrict deleting transactions',
                personal: '[pt-BR] Allow deleting transactions',
                setFeedNameDescription: '[pt-BR] Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: '[pt-BR] When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: '[pt-BR] No cards in this feed',
                emptyAddedFeedDescription: "[pt-BR] Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `[pt-BR] We're reviewing your request...`,
                pendingFeedDescription: `[pt-BR] We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '[pt-BR] Check your browser window',
                pendingBankDescription: (bankName: string) => `[pt-BR] Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: '[pt-BR] please click here',
                giveItNameInstruction: '[pt-BR] Give the card a name that sets it apart from others.',
                updating: '[pt-BR] Updating...',
                neverUpdated: '[pt-BR] Never',
                noAccountsFound: '[pt-BR] No accounts found',
                defaultCard: '[pt-BR] Default card',
                downgradeTitle: `[pt-BR] Can't downgrade workspace`,
                downgradeSubTitle: `[pt-BR] This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `[pt-BR] Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: '[pt-BR] Get the Expensify Card',
                expensifyCardBannerSubtitle: '[pt-BR] Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: '[pt-BR] Learn more',
                statementCloseDateTitle: '[pt-BR] Statement close date',
                statementCloseDateDescription: '[pt-BR] Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: '[pt-BR] Workflows',
                subtitle: '[pt-BR] Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    '[pt-BR] Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: '[pt-BR] Invoices',
                subtitle: '[pt-BR] Send and receive invoices.',
            },
            categories: {
                title: '[pt-BR] Categories',
                subtitle: '[pt-BR] Track and organize spend.',
            },
            tags: {
                title: '[pt-BR] Tags',
                subtitle: '[pt-BR] Classify costs and track billable expenses.',
            },
            taxes: {
                title: '[pt-BR] Taxes',
                subtitle: '[pt-BR] Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: '[pt-BR] Report fields',
                subtitle: '[pt-BR] Set up custom fields for spend.',
            },
            connections: {
                title: '[pt-BR] Accounting',
                subtitle: '[pt-BR] Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: '[pt-BR] Receipt partners',
                subtitle: '[pt-BR] Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '[pt-BR] Not so fast...',
                featureEnabledText: "[pt-BR] To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "[pt-BR] To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: '[pt-BR] Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '[pt-BR] Disconnect Uber',
                disconnectText: '[pt-BR] To disable this feature, please disconnect the Uber for Business integration first.',
                description: '[pt-BR] Are you sure you want to disconnect this integration?',
                confirmText: '[pt-BR] Got it',
            },
            workflowWarningModal: {
                featureEnabledTitle: '[pt-BR] Not so fast...',
                featureEnabledText:
                    '[pt-BR] Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: '[pt-BR] Go to Expensify Cards',
            },
            rules: {
                title: '[pt-BR] Rules',
                subtitle: '[pt-BR] Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: '[pt-BR] Time',
                subtitle: '[pt-BR] Set a billable hourly rate for time tracking.',
                defaultHourlyRate: '[pt-BR] Default hourly rate',
            },
        },
        reports: {
            reportsCustomTitleExamples: '[pt-BR] Examples:',
            customReportNamesSubtitle: `[pt-BR] <muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: '[pt-BR] Default report title',
            customNameDescription: `[pt-BR] Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: '[pt-BR] Name',
            customNameEmailPhoneExample: '[pt-BR] Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: '[pt-BR] Report start date: {report:startdate}',
            customNameWorkspaceNameExample: '[pt-BR] Workspace name: {report:workspacename}',
            customNameReportIDExample: '[pt-BR] Report ID: {report:id}',
            customNameTotalExample: '[pt-BR] Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: '[pt-BR] Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: '[pt-BR] Add field',
            delete: '[pt-BR] Delete field',
            deleteFields: '[pt-BR] Delete fields',
            findReportField: '[pt-BR] Find report field',
            deleteConfirmation: '[pt-BR] Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: '[pt-BR] Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "[pt-BR] You haven't created any report fields",
                subtitle: '[pt-BR] Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "[pt-BR] Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: '[pt-BR] Disable report fields',
            disableReportFieldsConfirmation: '[pt-BR] Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: '[pt-BR] The report fields below are imported from your',
            textType: '[pt-BR] Text',
            dateType: '[pt-BR] Date',
            dropdownType: '[pt-BR] List',
            formulaType: '[pt-BR] Formula',
            textAlternateText: '[pt-BR] Add a field for free text input.',
            dateAlternateText: '[pt-BR] Add a calendar for date selection.',
            dropdownAlternateText: '[pt-BR] Add a list of options to choose from.',
            formulaAlternateText: '[pt-BR] Add a formula field.',
            nameInputSubtitle: '[pt-BR] Choose a name for the report field.',
            typeInputSubtitle: '[pt-BR] Choose what type of report field to use.',
            initialValueInputSubtitle: '[pt-BR] Enter a starting value to show in the report field.',
            listValuesInputSubtitle: '[pt-BR] These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: '[pt-BR] These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: '[pt-BR] Delete value',
            deleteValues: '[pt-BR] Delete values',
            disableValue: '[pt-BR] Disable value',
            disableValues: '[pt-BR] Disable values',
            enableValue: '[pt-BR] Enable value',
            enableValues: '[pt-BR] Enable values',
            emptyReportFieldsValues: {
                title: "[pt-BR] You haven't created any list values",
                subtitle: '[pt-BR] Add custom values to appear on reports.',
            },
            deleteValuePrompt: '[pt-BR] Are you sure you want to delete this list value?',
            deleteValuesPrompt: '[pt-BR] Are you sure you want to delete these list values?',
            listValueRequiredError: '[pt-BR] Please enter a list value name',
            existingListValueError: '[pt-BR] A list value with this name already exists',
            editValue: '[pt-BR] Edit value',
            listValues: '[pt-BR] List values',
            addValue: '[pt-BR] Add value',
            existingReportFieldNameError: '[pt-BR] A report field with this name already exists',
            reportFieldNameRequiredError: '[pt-BR] Please enter a report field name',
            reportFieldTypeRequiredError: '[pt-BR] Please choose a report field type',
            circularReferenceError: "[pt-BR] This field can't refer to itself. Please update.",
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `[pt-BR] Formula field ${value} not recognized`,
            reportFieldInitialValueRequiredError: '[pt-BR] Please choose a report field initial value',
            genericFailureMessage: '[pt-BR] An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: '[pt-BR] Tag name',
            requiresTag: '[pt-BR] Members must tag all expenses',
            trackBillable: '[pt-BR] Track billable expenses',
            customTagName: '[pt-BR] Custom tag name',
            enableTag: '[pt-BR] Enable tag',
            enableTags: '[pt-BR] Enable tags',
            requireTag: '[pt-BR] Require tag',
            requireTags: '[pt-BR] Require tags',
            notRequireTags: '[pt-BR] Don’t require',
            disableTag: '[pt-BR] Disable tag',
            disableTags: '[pt-BR] Disable tags',
            addTag: '[pt-BR] Add tag',
            editTag: '[pt-BR] Edit tag',
            editTags: '[pt-BR] Edit tags',
            findTag: '[pt-BR] Find tag',
            subtitle: '[pt-BR] Tags add more detailed ways to classify costs.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `[pt-BR] <muted-text>Tags add more detailed ways to classify costs. You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "[pt-BR] You haven't created any tags",
                subtitle: '[pt-BR] Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `[pt-BR] <muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[pt-BR] <muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: '[pt-BR] Delete tag',
            deleteTags: '[pt-BR] Delete tags',
            deleteTagConfirmation: '[pt-BR] Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: '[pt-BR] Are you sure that you want to delete these tags?',
            deleteFailureMessage: '[pt-BR] An error occurred while deleting the tag, please try again',
            tagRequiredError: '[pt-BR] Tag name is required',
            existingTagError: '[pt-BR] A tag with this name already exists',
            invalidTagNameError: '[pt-BR] Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: '[pt-BR] An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: '[pt-BR] Tags are managed in your',
            employeesSeeTagsAs: '[pt-BR] Employees see tags as',
            glCode: '[pt-BR] GL code',
            updateGLCodeFailureMessage: '[pt-BR] An error occurred while updating the GL code, please try again',
            tagRules: '[pt-BR] Tag rules',
            approverDescription: '[pt-BR] Approver',
            importTags: '[pt-BR] Import tags',
            importTagsSupportingText: '[pt-BR] Code your expenses with one type of tag or many.',
            configureMultiLevelTags: '[pt-BR] Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `[pt-BR] Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: '[pt-BR] The first row is the title for each tag list',
                independentTags: '[pt-BR] These are independent tags',
                glAdjacentColumn: '[pt-BR] There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: '[pt-BR] Single level of tags',
                multiLevel: '[pt-BR] Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '[pt-BR] Switch Tag Levels',
                prompt1: '[pt-BR] Switching tag levels will erase all current tags.',
                prompt2: '[pt-BR]  We suggest you first',
                prompt3: '[pt-BR]  download a backup',
                prompt4: '[pt-BR]  by exporting your tags.',
                prompt5: '[pt-BR]  Learn more',
                prompt6: '[pt-BR]  about tag levels.',
            },
            overrideMultiTagWarning: {
                title: '[pt-BR] Import tags',
                prompt1: '[pt-BR] Are you sure?',
                prompt2: '[pt-BR]  The existing tags will be overridden, but you can',
                prompt3: '[pt-BR]  download a backup',
                prompt4: '[pt-BR]  first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `[pt-BR] We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: '[pt-BR] Cannot delete or disable all tags',
                description: `[pt-BR] At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: '[pt-BR] Cannot make all tags optional',
                description: `[pt-BR] At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: '[pt-BR] Cannot make tag list required',
                description: '[pt-BR] You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '[pt-BR] 1 Tag',
                other: (count: number) => `[pt-BR] ${count} Tags`,
            }),
        },
        taxes: {
            subtitle: '[pt-BR] Add tax names, rates, and set defaults.',
            addRate: '[pt-BR] Add rate',
            workspaceDefault: '[pt-BR] Workspace currency default',
            foreignDefault: '[pt-BR] Foreign currency default',
            customTaxName: '[pt-BR] Custom tax name',
            value: '[pt-BR] Value',
            taxReclaimableOn: '[pt-BR] Tax reclaimable on',
            taxRate: '[pt-BR] Tax rate',
            findTaxRate: '[pt-BR] Find tax rate',
            error: {
                taxRateAlreadyExists: '[pt-BR] This tax name is already in use',
                taxCodeAlreadyExists: '[pt-BR] This tax code is already in use',
                valuePercentageRange: '[pt-BR] Please enter a valid percentage between 0 and 100',
                customNameRequired: '[pt-BR] Custom tax name is required',
                deleteFailureMessage: '[pt-BR] An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: '[pt-BR] An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: '[pt-BR] An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: '[pt-BR] The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: '[pt-BR] Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `[pt-BR] Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '[pt-BR] Delete rate',
                deleteMultiple: '[pt-BR] Delete rates',
                enable: '[pt-BR] Enable rate',
                disable: '[pt-BR] Disable rate',
                enableTaxRates: () => ({
                    one: '[pt-BR] Enable rate',
                    other: '[pt-BR] Enable rates',
                }),
                disableTaxRates: () => ({
                    one: '[pt-BR] Disable rate',
                    other: '[pt-BR] Disable rates',
                }),
            },
            importedFromAccountingSoftware: '[pt-BR] The taxes below are imported from your',
            taxCode: '[pt-BR] Tax code',
            updateTaxCodeFailureMessage: '[pt-BR] An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: '[pt-BR] Name your new workspace',
            selectFeatures: '[pt-BR] Select features to copy',
            whichFeatures: '[pt-BR] Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '[pt-BR] \n\nDo you want to continue?',
            categories: '[pt-BR] categories and your auto-categorization rules',
            reimbursementAccount: '[pt-BR] reimbursement account',
            welcomeNote: '[pt-BR] Please start using my new workspace',
            delayedSubmission: '[pt-BR] delayed submission',
            merchantRules: '[pt-BR] Merchant rules',
            merchantRulesCount: () => ({
                one: '[pt-BR] 1 merchant rule',
                other: (count: number) => `[pt-BR] ${count} merchant rules`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `[pt-BR] You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: '[pt-BR] An error occurred while duplicating your new workspace. Please try again.',
        },
        emptyWorkspace: {
            title: '[pt-BR] No workspaces yet',
            subtitle: '[pt-BR] Create a workspace to manage your expenses, reimbursements, and company cards.',
            createAWorkspaceCTA: '[pt-BR] Get Started',
            features: {
                trackAndCollect: '[pt-BR] Track and collect receipts',
                reimbursements: '[pt-BR] Reimburse employees',
                companyCards: '[pt-BR] Manage company cards',
            },
            notFound: '[pt-BR] No workspace found',
            description: '[pt-BR] Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: '[pt-BR] New workspace',
            getTheExpensifyCardAndMore: '[pt-BR] Get the Expensify Card and more',
            confirmWorkspace: '[pt-BR] Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `[pt-BR] My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `[pt-BR] ${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '[pt-BR] An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `[pt-BR] Are you sure you want to remove ${memberName}?`,
                other: '[pt-BR] Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `[pt-BR] ${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '[pt-BR] Remove member',
                other: '[pt-BR] Remove members',
            }),
            findMember: '[pt-BR] Find member',
            removeWorkspaceMemberButtonTitle: '[pt-BR] Remove from workspace',
            removeGroupMemberButtonTitle: '[pt-BR] Remove from group',
            removeRoomMemberButtonTitle: '[pt-BR] Remove from chat',
            removeMemberPrompt: (memberName: string) => `[pt-BR] Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '[pt-BR] Remove member',
            transferOwner: '[pt-BR] Transfer owner',
            makeMember: () => ({
                one: '[pt-BR] Make member',
                other: '[pt-BR] Make members',
            }),
            makeAdmin: () => ({
                one: '[pt-BR] Make admin',
                other: '[pt-BR] Make admins',
            }),
            makeAuditor: () => ({
                one: '[pt-BR] Make auditor',
                other: '[pt-BR] Make auditors',
            }),
            selectAll: '[pt-BR] Select all',
            error: {
                genericAdd: '[pt-BR] There was a problem adding this workspace member',
                cannotRemove: "[pt-BR] You can't remove yourself or the workspace owner",
                genericRemove: '[pt-BR] There was a problem removing that workspace member',
            },
            addedWithPrimary: '[pt-BR] Some members were added with their primary logins.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `[pt-BR] Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `[pt-BR] Total workspace members: ${count}`,
            importMembers: '[pt-BR] Import members',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `[pt-BR] If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `[pt-BR] ${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `[pt-BR] You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[pt-BR] If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[pt-BR] If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `[pt-BR] ${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: '[pt-BR] Get started by issuing your first virtual or physical card.',
            issueCard: '[pt-BR] Issue card',
            issueNewCard: {
                whoNeedsCard: '[pt-BR] Who needs a card?',
                inviteNewMember: '[pt-BR] Invite new member',
                findMember: '[pt-BR] Find member',
                chooseCardType: '[pt-BR] Choose a card type',
                physicalCard: '[pt-BR] Physical card',
                physicalCardDescription: '[pt-BR] Great for the frequent spender',
                virtualCard: '[pt-BR] Virtual card',
                virtualCardDescription: '[pt-BR] Instant and flexible',
                chooseLimitType: '[pt-BR] Choose a limit type',
                smartLimit: '[pt-BR] Smart Limit',
                smartLimitDescription: '[pt-BR] Spend up to a certain amount before requiring approval',
                monthly: '[pt-BR] Monthly',
                monthlyDescription: '[pt-BR] Limit renews monthly',
                fixedAmount: '[pt-BR] Fixed amount',
                fixedAmountDescription: '[pt-BR] Spend until the limit is reached',
                setLimit: '[pt-BR] Set a limit',
                cardLimitError: '[pt-BR] Please enter an amount less than $21,474,836',
                giveItName: '[pt-BR] Give it a name',
                giveItNameInstruction: '[pt-BR] Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: '[pt-BR] Card name',
                letsDoubleCheck: '[pt-BR] Let’s double check that everything looks right.',
                willBeReadyToUse: '[pt-BR] This card will be ready to use immediately.',
                willBeReadyToShip: '[pt-BR] This card will be ready to ship immediately.',
                cardholder: '[pt-BR] Cardholder',
                cardType: '[pt-BR] Card type',
                limit: '[pt-BR] Limit',
                limitType: '[pt-BR] Limit type',
                disabledApprovalForSmartLimitError: '[pt-BR] Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
                singleUse: '[pt-BR] Single-use',
                singleUseDescription: '[pt-BR] Expires after one transaction',
                validFrom: '[pt-BR] Valid from',
                startDate: '[pt-BR] Start date',
                endDate: '[pt-BR] End date',
                noExpirationHint: "[pt-BR] A card without an expiration date won't expire",
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `[pt-BR] Valid from ${startDate} to ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `[pt-BR] ${startDate} to ${endDate}`,
                combineWithExpiration: '[pt-BR] Combine with expiration options for additional spend control',
                enterValidDate: '[pt-BR] Enter a valid date',
                expirationDate: '[pt-BR] Expiration date',
                limitAmount: '[pt-BR] Limit amount',
                setExpiryOptions: '[pt-BR] Set expiry options',
                setExpiryDate: '[pt-BR] Set expiry date',
                setExpiryDateDescription: '[pt-BR] Card will expire as listed on the card',
                amount: '[pt-BR] Amount',
            },
            deactivateCardModal: {
                deactivate: '[pt-BR] Deactivate',
                deactivateCard: '[pt-BR] Deactivate card',
                deactivateConfirmation: '[pt-BR] Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: '[pt-BR] settings',
            title: '[pt-BR] Connections',
            subtitle: '[pt-BR] Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: '[pt-BR] QuickBooks Online',
            qbd: '[pt-BR] QuickBooks Desktop',
            xero: '[pt-BR] Xero',
            netsuite: '[pt-BR] NetSuite',
            intacct: '[pt-BR] Sage Intacct',
            sap: '[pt-BR] SAP',
            oracle: '[pt-BR] Oracle',
            microsoftDynamics: '[pt-BR] Microsoft Dynamics',
            talkYourOnboardingSpecialist: '[pt-BR] Chat with your setup specialist.',
            talkYourAccountManager: '[pt-BR] Chat with your account manager.',
            talkToConcierge: '[pt-BR] Chat with Concierge.',
            needAnotherAccounting: '[pt-BR] Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '[pt-BR] QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '[pt-BR] Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '[pt-BR] NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '[pt-BR] Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `[pt-BR] There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '[pt-BR] Go to Expensify Classic to manage your settings.',
            setup: '[pt-BR] Connect',
            lastSync: (relativeDate: string) => `[pt-BR] Last synced ${relativeDate}`,
            notSync: '[pt-BR] Not synced',
            import: '[pt-BR] Import',
            export: '[pt-BR] Export',
            advanced: '[pt-BR] Advanced',
            other: '[pt-BR] Other',
            syncNow: '[pt-BR] Sync now',
            disconnect: '[pt-BR] Disconnect',
            reinstall: '[pt-BR] Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[pt-BR] integration';
                return `[pt-BR] Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `[pt-BR] Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[pt-BR] accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "[pt-BR] Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "[pt-BR] Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "[pt-BR] Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "[pt-BR] Can't connect to QuickBooks Desktop";
                    default: {
                        return "[pt-BR] Can't connect to integration";
                    }
                }
            },
            accounts: '[pt-BR] Chart of accounts',
            taxes: '[pt-BR] Taxes',
            imported: '[pt-BR] Imported',
            notImported: '[pt-BR] Not imported',
            importAsCategory: '[pt-BR] Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '[pt-BR] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '[pt-BR] Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '[pt-BR] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '[pt-BR] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '[pt-BR] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '[pt-BR] Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: '[pt-BR] NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[pt-BR] this integration';
                return `[pt-BR] Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `[pt-BR] Are you sure you want to connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[pt-BR] this accounting integration'}? This will remove any existing accounting connections.`,
            enterCredentials: '[pt-BR] Enter your credentials',
            claimOffer: {
                badgeText: '[pt-BR] Offer available!',
                xero: {
                    headline: '[pt-BR] Get Xero free for 6 months!',
                    description: '[pt-BR] <muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: '[pt-BR] Connect to Xero',
                },
                uber: {
                    headerTitle: '[pt-BR] Uber for Business',
                    headline: '[pt-BR] Get 5% off Uber rides',
                    description: `[pt-BR] <muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: '[pt-BR] Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '[pt-BR] Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '[pt-BR] Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '[pt-BR] Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '[pt-BR] Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return '[pt-BR] Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return '[pt-BR] Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '[pt-BR] Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '[pt-BR] Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return '[pt-BR] Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return '[pt-BR] Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return '[pt-BR] Importing Xero data';
                        case 'startingImportQBO':
                            return '[pt-BR] Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '[pt-BR] Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return '[pt-BR] Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '[pt-BR] Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return '[pt-BR] Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '[pt-BR] Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '[pt-BR] Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return '[pt-BR] Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '[pt-BR] Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '[pt-BR] Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '[pt-BR] Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '[pt-BR] Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '[pt-BR] Updating report fields';
                        case 'jobDone':
                            return '[pt-BR] Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return '[pt-BR] Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return '[pt-BR] Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return '[pt-BR] Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return '[pt-BR] Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '[pt-BR] Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return '[pt-BR] Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return '[pt-BR] Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return '[pt-BR] Syncing tax rates';
                        case 'xeroCheckConnection':
                            return '[pt-BR] Checking Xero connection';
                        case 'xeroSyncTitle':
                            return '[pt-BR] Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return '[pt-BR] Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '[pt-BR] Importing customers';
                        case 'netSuiteSyncInitData':
                            return '[pt-BR] Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return '[pt-BR] Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return '[pt-BR] Importing items';
                        case 'netSuiteSyncData':
                            return '[pt-BR] Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return '[pt-BR] Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return '[pt-BR] Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return '[pt-BR] Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return '[pt-BR] Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return '[pt-BR] Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '[pt-BR] Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '[pt-BR] Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '[pt-BR] Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return '[pt-BR] Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return '[pt-BR] Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return '[pt-BR] Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '[pt-BR] Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '[pt-BR] Importing vendors';
                        case 'intacctCheckConnection':
                            return '[pt-BR] Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return '[pt-BR] Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return '[pt-BR] Importing Sage Intacct data';
                        default: {
                            return `[pt-BR] Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '[pt-BR] Preferred exporter',
            exportPreferredExporterNote:
                '[pt-BR] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[pt-BR] Once set, the preferred exporter will see reports for export in their account.',
            exportAs: '[pt-BR] Export as',
            exportOutOfPocket: '[pt-BR] Export out-of-pocket expenses as',
            exportCompanyCard: '[pt-BR] Export company card expenses as',
            exportDate: '[pt-BR] Export date',
            defaultVendor: '[pt-BR] Default vendor',
            autoSync: '[pt-BR] Auto-sync',
            autoSyncDescription: '[pt-BR] Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: '[pt-BR] Sync reimbursed reports',
            cardReconciliation: '[pt-BR] Card reconciliation',
            reconciliationAccount: '[pt-BR] Reconciliation account',
            continuousReconciliation: '[pt-BR] Continuous Reconciliation',
            saveHoursOnReconciliation:
                '[pt-BR] Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `[pt-BR] <muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '[pt-BR] Choose the bank account that your Expensify Card payments will be reconciled against.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `[pt-BR] Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        export: {
            notReadyHeading: '[pt-BR] Not ready to export',
            notReadyDescription: '[pt-BR] Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: '[pt-BR] Send invoice',
            sendFrom: '[pt-BR] Send from',
            invoicingDetails: '[pt-BR] Invoicing details',
            invoicingDetailsDescription: '[pt-BR] This info will appear on your invoices.',
            companyName: '[pt-BR] Company name',
            companyWebsite: '[pt-BR] Company website',
            paymentMethods: {
                personal: '[pt-BR] Personal',
                business: '[pt-BR] Business',
                chooseInvoiceMethod: '[pt-BR] Choose a payment method below:',
                payingAsIndividual: '[pt-BR] Paying as an individual',
                payingAsBusiness: '[pt-BR] Paying as a business',
            },
            invoiceBalance: '[pt-BR] Invoice balance',
            invoiceBalanceSubtitle: "[pt-BR] This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: '[pt-BR] Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: '[pt-BR] Invite member',
            members: '[pt-BR] Invite members',
            invitePeople: '[pt-BR] Invite new members',
            genericFailureMessage: '[pt-BR] An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `[pt-BR] Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '[pt-BR] user',
            users: '[pt-BR] users',
            invited: '[pt-BR] invited',
            removed: '[pt-BR] removed',
            to: '[pt-BR] to',
            from: '[pt-BR] from',
        },
        inviteMessage: {
            confirmDetails: '[pt-BR] Confirm details',
            inviteMessagePrompt: '[pt-BR] Make your invitation extra special by adding a message below!',
            personalMessagePrompt: '[pt-BR] Message',
            genericFailureMessage: '[pt-BR] An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: '[pt-BR] Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `[pt-BR] ${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '[pt-BR] Oops! Not so fast...',
            workspaceNeeds: '[pt-BR] A workspace needs at least one enabled distance rate.',
            distance: '[pt-BR] Distance',
            centrallyManage: '[pt-BR] Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: '[pt-BR] Rate',
            addRate: '[pt-BR] Add rate',
            findRate: '[pt-BR] Find rate',
            trackTax: '[pt-BR] Track tax',
            deleteRates: () => ({
                one: '[pt-BR] Delete rate',
                other: '[pt-BR] Delete rates',
            }),
            enableRates: () => ({
                one: '[pt-BR] Enable rate',
                other: '[pt-BR] Enable rates',
            }),
            disableRates: () => ({
                one: '[pt-BR] Disable rate',
                other: '[pt-BR] Disable rates',
            }),
            enableRate: '[pt-BR] Enable rate',
            status: '[pt-BR] Status',
            unit: '[pt-BR] Unit',
            taxFeatureNotEnabledMessage:
                '[pt-BR] <muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: '[pt-BR] Delete distance rate',
            areYouSureDelete: () => ({
                one: '[pt-BR] Are you sure you want to delete this rate?',
                other: '[pt-BR] Are you sure you want to delete these rates?',
            }),
            errors: {
                rateNameRequired: '[pt-BR] Rate name is required',
                existingRateName: '[pt-BR] A distance rate with this name already exists',
            },
        },
        editor: {
            descriptionInputLabel: '[pt-BR] Description',
            nameInputLabel: '[pt-BR] Name',
            typeInputLabel: '[pt-BR] Type',
            initialValueInputLabel: '[pt-BR] Initial value',
            nameInputHelpText: "[pt-BR] This is the name you'll see on your workspace.",
            nameIsRequiredError: "[pt-BR] You'll need to give your workspace a name",
            currencyInputLabel: '[pt-BR] Default currency',
            currencyInputHelpText: '[pt-BR] All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `[pt-BR] The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: '[pt-BR] Save',
            genericFailureMessage: '[pt-BR] An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: '[pt-BR] An error occurred uploading the avatar. Please try again.',
            addressContext: '[pt-BR] A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: '[pt-BR] Expense policy',
        },
        bankAccount: {
            continueWithSetup: '[pt-BR] Continue setup',
            youAreAlmostDone: "[pt-BR] You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: '[pt-BR] Streamline payments',
            connectBankAccountNote: "[pt-BR] Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: '[pt-BR] One more thing!',
            allSet: "[pt-BR] You're all set!",
            accountDescriptionWithCards: '[pt-BR] This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "[pt-BR] Let's finish in chat!",
            finishInChat: '[pt-BR] Finish in chat',
            almostDone: '[pt-BR] Almost done!',
            disconnectBankAccount: '[pt-BR] Disconnect bank account',
            startOver: '[pt-BR] Start over',
            updateDetails: '[pt-BR] Update details',
            yesDisconnectMyBankAccount: '[pt-BR] Yes, disconnect my bank account',
            yesStartOver: '[pt-BR] Yes, start over',
            disconnectYourBankAccount: (bankName: string) =>
                `[pt-BR] Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "[pt-BR] Starting over will clear the progress you've made so far.",
            areYouSure: '[pt-BR] Are you sure?',
            workspaceCurrency: '[pt-BR] Workspace currency',
            updateCurrencyPrompt: '[pt-BR] It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: '[pt-BR] Update to USD',
            updateWorkspaceCurrency: '[pt-BR] Update workspace currency',
            workspaceCurrencyNotSupported: '[pt-BR] Workspace currency not supported',
            yourWorkspace: `[pt-BR] Your workspace is set to an unsupported currency. View the <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: '[pt-BR] Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: '[pt-BR] Transfer owner',
            addPaymentCardTitle: '[pt-BR] Enter your payment card to transfer ownership',
            addPaymentCardButtonText: '[pt-BR] Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `[pt-BR] <muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: '[pt-BR] PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: '[pt-BR] Bank level encryption',
            addPaymentCardRedundant: '[pt-BR] Redundant infrastructure',
            addPaymentCardLearnMore: `[pt-BR] <muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: '[pt-BR] Outstanding balance',
            amountOwedButtonText: '[pt-BR] OK',
            amountOwedText: '[pt-BR] This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: '[pt-BR] Outstanding balance',
            ownerOwesAmountButtonText: '[pt-BR] Transfer balance',
            ownerOwesAmountText: (email: string, amount: string) => `[pt-BR] The account owning this workspace (${email}) has an outstanding balance from a previous month.

Do you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: '[pt-BR] Take over annual subscription',
            subscriptionButtonText: '[pt-BR] Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `[pt-BR] Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: '[pt-BR] Duplicate subscription alert',
            duplicateSubscriptionButtonText: '[pt-BR] Continue',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `[pt-BR] It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.

Click "Continue" if you only want to take over billing for the workspace ${workspaceName}.

If you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '[pt-BR] Cannot transfer ownership',
            hasFailedSettlementsButtonText: '[pt-BR] Got it',
            hasFailedSettlementsText: (email: string) =>
                `[pt-BR] You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '[pt-BR] Failed to clear balance',
            failedToClearBalanceButtonText: '[pt-BR] OK',
            failedToClearBalanceText: '[pt-BR] We were unable to clear the balance. Please try again later.',
            successTitle: '[pt-BR] Woohoo! All set.',
            successDescription: "[pt-BR] You're now the owner of this workspace.",
            errorTitle: '[pt-BR] Oops! Not so fast...',
            errorDescription: `[pt-BR] <muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '[pt-BR] Careful!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `[pt-BR] The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Are you sure you want to export them again?`,
            confirmText: '[pt-BR] Yes, export again',
            cancelText: '[pt-BR] Cancel',
        },
        upgrade: {
            reportFields: {
                title: '[pt-BR] Report fields',
                description: `[pt-BR] Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: '[pt-BR] NetSuite',
                description: `[pt-BR] Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '[pt-BR] Sage Intacct',
                description: `[pt-BR] Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: '[pt-BR] QuickBooks Desktop',
                description: `[pt-BR] Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '[pt-BR] Advanced Approvals',
                description: `[pt-BR] If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            categories: {
                title: '[pt-BR] Categories',
                description: '[pt-BR] Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: '[pt-BR] GL codes',
                description: `[pt-BR] Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '[pt-BR] GL & Payroll codes',
                description: `[pt-BR] Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: '[pt-BR] Tax codes',
                description: `[pt-BR] Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: '[pt-BR] Unlimited Company cards',
                description: `[pt-BR] Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            rules: {
                title: '[pt-BR] Rules',
                description: `[pt-BR] Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.

Require expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: '[pt-BR] Per diem',
                description:
                    '[pt-BR] Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            travel: {
                title: '[pt-BR] Travel',
                description:
                    '[pt-BR] Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            reports: {
                title: '[pt-BR] Reports',
                description: '[pt-BR] Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: '[pt-BR] Multi-level tags',
                description:
                    '[pt-BR] Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: '[pt-BR] Distance rates',
                description: '[pt-BR] Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: '[pt-BR] Auditor',
                description: '[pt-BR] Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '[pt-BR] Multiple approval levels',
                description: '[pt-BR] Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[pt-BR] <muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '[pt-BR] per active member per month.',
                perMember: '[pt-BR] per member per month.',
            },
            note: (subscriptionLink: string) =>
                `[pt-BR] <muted-text>Upgrade to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: '[pt-BR] Unlock this feature',
            completed: {
                headline: `[pt-BR] You've upgraded your workspace!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `[pt-BR] <centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `[pt-BR] You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `[pt-BR] You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `[pt-BR] You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: '[pt-BR] Got it, thanks',
                createdWorkspace: `[pt-BR] You've created a workspace!`,
            },
            commonFeatures: {
                title: '[pt-BR] Upgrade to the Control plan',
                note: '[pt-BR] Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `[pt-BR] <muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[pt-BR] per member per month.` : `[pt-BR] per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: '[pt-BR] Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: '[pt-BR] Smart expense rules',
                    benefit3: '[pt-BR] Multi-level approval workflows',
                    benefit4: '[pt-BR] Enhanced security controls',
                    toUpgrade: '[pt-BR] To upgrade, click',
                    selectWorkspace: '[pt-BR] select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `[pt-BR] Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '[pt-BR] Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '[pt-BR] Downgrade to Collect',
                note: "[pt-BR] You'll lose access to the following features",
                noteAndMore: '[pt-BR] and more:',
                benefits: {
                    important: '[pt-BR] IMPORTANT: ',
                    confirm: '[pt-BR] You\'ll need to change the "Plan type" of every workspace to "Collect" in order to secure the Collect rate.',
                    benefit1Label: '[pt-BR] ERP integrations',
                    benefit1: '[pt-BR] NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: '[pt-BR] HR integrations',
                    benefit2: '[pt-BR] Workday, Certinia',
                    benefit3Label: '[pt-BR] Security',
                    benefit3: '[pt-BR] SSO/SAML',
                    benefit4Label: '[pt-BR] Advanced',
                    benefit4: '[pt-BR] Smart expense rules, per diems, multi-level approvals, custom reporting, and budgeting',
                    headsUp: '[pt-BR] Heads up!',
                    multiWorkspaceNote: '[pt-BR] You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '[pt-BR] > select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: '[pt-BR] Your workspace has been downgraded',
                description: '[pt-BR] You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: '[pt-BR] Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: '[pt-BR] Pay & downgrade',
            headline: '[pt-BR] Your final payment',
            description1: (formattedAmount: string) => `[pt-BR] Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `[pt-BR] See your breakdown below for ${date}:`,
            subscription:
                '[pt-BR] Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: '[pt-BR] An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: '[pt-BR] Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `[pt-BR] Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `[pt-BR] Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "[pt-BR] You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: '[pt-BR] Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: '[pt-BR] Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: '[pt-BR] Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: '[pt-BR] Chat with your admin',
            chatInAdmins: '[pt-BR] Chat in #admins',
            addPaymentCard: '[pt-BR] Add payment card',
            goToSubscription: '[pt-BR] Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: '[pt-BR] Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `[pt-BR] <muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: '[pt-BR] Receipt required amount',
                receiptRequiredAmountDescription: '[pt-BR] Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `[pt-BR] Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: '[pt-BR] Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: '[pt-BR] Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `[pt-BR] Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: '[pt-BR] Max expense amount',
                maxExpenseAmountDescription: '[pt-BR] Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: '[pt-BR] Max age',
                maxExpenseAge: '[pt-BR] Max expense age',
                maxExpenseAgeDescription: '[pt-BR] Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '[pt-BR] 1 day',
                    other: (count: number) => `[pt-BR] ${count} days`,
                }),
                cashExpenseDefault: '[pt-BR] Cash expense default',
                cashExpenseDefaultDescription:
                    '[pt-BR] Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: '[pt-BR] Reimbursable',
                reimbursableDefaultDescription: '[pt-BR] Expenses are most often paid back to employees',
                nonReimbursableDefault: '[pt-BR] Non-reimbursable',
                nonReimbursableDefaultDescription: '[pt-BR] Expenses are occasionally paid back to employees',
                alwaysReimbursable: '[pt-BR] Always reimbursable',
                alwaysReimbursableDescription: '[pt-BR] Expenses are always paid back to employees',
                alwaysNonReimbursable: '[pt-BR] Always non-reimbursable',
                alwaysNonReimbursableDescription: '[pt-BR] Expenses are never paid back to employees',
                billableDefault: '[pt-BR] Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `[pt-BR] <muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: '[pt-BR] Billable',
                billableDescription: '[pt-BR] Expenses are most often re-billed to clients',
                nonBillable: '[pt-BR] Non-billable',
                nonBillableDescription: '[pt-BR] Expenses are occasionally re-billed to clients',
                eReceipts: '[pt-BR] eReceipts',
                eReceiptsHint: `[pt-BR] eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: '[pt-BR] Attendee tracking',
                attendeeTrackingHint: '[pt-BR] Track the per-person cost for every expense.',
                prohibitedDefaultDescription: '[pt-BR] Flag receipts with these line items for manual review.',
                prohibitedExpenses: '[pt-BR] Prohibited expenses',
                alcohol: '[pt-BR] Alcohol',
                hotelIncidentals: '[pt-BR] Hotel incidentals',
                gambling: '[pt-BR] Gambling',
                tobacco: '[pt-BR] Tobacco',
                adultEntertainment: '[pt-BR] Adult entertainment',
                requireCompanyCard: '[pt-BR] Require company cards for all purchases',
                requireCompanyCardDescription: '[pt-BR] Flag all cash spend, including mileage and per-diem expenses.',
                requireCompanyCardDisabledTooltip: '[pt-BR] Enable Company cards (under More features) to unlock.',
            },
            expenseReportRules: {
                title: '[pt-BR] Advanced',
                subtitle: '[pt-BR] Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: '[pt-BR] Prevent self-approvals',
                preventSelfApprovalsSubtitle: '[pt-BR] Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: '[pt-BR] Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: '[pt-BR] Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: '[pt-BR] Auto-approve reports with all expenses under',
                autoApproveReportsUnderDescription: '[pt-BR] Fully compliant expense reports where all expenses are under this amount will be automatically approved.',
                randomReportAuditTitle: '[pt-BR] Random report audit',
                randomReportAuditDescription: '[pt-BR] Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: '[pt-BR] Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: '[pt-BR] Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `[pt-BR] Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: '[pt-BR] Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: '[pt-BR] Auto-pay reports under',
                autoPayReportsUnderDescription: '[pt-BR] Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `[pt-BR] Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[pt-BR] Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: '[pt-BR] Merchant',
                subtitle: '[pt-BR] Set merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: '[pt-BR] Add merchant rule',
                findRule: '[pt-BR] Find merchant rule',
                addRuleTitle: '[pt-BR] Add rule',
                editRuleTitle: '[pt-BR] Edit rule',
                expensesWith: '[pt-BR] For expenses with:',
                expensesExactlyMatching: '[pt-BR] For expenses exactly matching:',
                applyUpdates: '[pt-BR] Apply these updates:',
                saveRule: '[pt-BR] Save rule',
                previewMatches: '[pt-BR] Preview matches',
                confirmError: '[pt-BR] Enter merchant and apply at least one update',
                confirmErrorMerchant: '[pt-BR] Please enter merchant',
                confirmErrorUpdate: '[pt-BR] Please apply at least one update',
                previewMatchesEmptyStateTitle: '[pt-BR] Nothing to show',
                previewMatchesEmptyStateSubtitle: '[pt-BR] No unsubmitted expenses match this rule.',
                deleteRule: '[pt-BR] Delete rule',
                deleteRuleConfirmation: '[pt-BR] Are you sure you want to delete this rule?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `[pt-BR] If merchant ${isExactMatch ? '[pt-BR] exactly matches' : '[pt-BR] contains'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `[pt-BR] Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `[pt-BR] Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `[pt-BR] Mark as  "${reimbursable ? '[pt-BR] reimbursable' : '[pt-BR] non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `[pt-BR] Mark as "${billable ? '[pt-BR] billable' : '[pt-BR] non-billable'}"`,
                matchType: '[pt-BR] Match type',
                matchTypeContains: '[pt-BR] Contains',
                matchTypeExact: '[pt-BR] Exactly matches',
                duplicateRuleTitle: '[pt-BR] Similar merchant rule already exists',
                duplicateRulePrompt: (merchantName: string) => `[pt-BR] Your existing rule for "${merchantName}" will take priority over this one. Save anyway?`,
                saveAnyway: '[pt-BR] Save anyway',
                applyToExistingUnsubmittedExpenses: '[pt-BR] Apply to existing unsubmitted expenses',
            },
            categoryRules: {
                title: '[pt-BR] Category rules',
                approver: '[pt-BR] Approver',
                requireDescription: '[pt-BR] Require description',
                requireFields: '[pt-BR] Require fields',
                requiredFieldsTitle: '[pt-BR] Required fields',
                requiredFieldsDescription: (categoryName: string) => `[pt-BR] This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: '[pt-BR] Require attendees',
                descriptionHint: '[pt-BR] Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `[pt-BR] Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: '[pt-BR] Hint',
                descriptionHintSubtitle: '[pt-BR] Pro-tip: The shorter the better!',
                maxAmount: '[pt-BR] Max amount',
                flagAmountsOver: '[pt-BR] Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `[pt-BR] Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: '[pt-BR] This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: '[pt-BR] Individual expense',
                    expenseSubtitle: '[pt-BR] Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: '[pt-BR] Category total',
                    dailySubtitle: '[pt-BR] Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: '[pt-BR] Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `[pt-BR] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[pt-BR] Never require receipts',
                    always: '[pt-BR] Always require receipts',
                },
                requireItemizedReceiptsOver: '[pt-BR] Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `[pt-BR] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[pt-BR] Never require itemized receipts',
                    always: '[pt-BR] Always require itemized receipts',
                },
                defaultTaxRate: '[pt-BR] Default tax rate',
                enableWorkflows: (moreFeaturesLink: string) => `[pt-BR] Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: '[pt-BR] Expense policy',
                cardSubtitle: "[pt-BR] Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
            },
            spendRules: {
                title: '[pt-BR] Spend',
                subtitle: '[pt-BR] Approve or decline Expensify Card transactions in realtime.',
                defaultRuleDescription: '[pt-BR] All cards',
                block: '[pt-BR] Block',
                defaultRuleTitle: '[pt-BR] Categories: Adult services, ATMs, gambling, money transfers',
                builtInProtectionModal: {
                    title: '[pt-BR] Expensify Cards offer built-in protection - always',
                    description: `[pt-BR] Expensify always declines these charges:

  • Adult services
  • ATMs
  • Gambling
  • Money transfers

Add more spend rules to protect company cash flow.`,
                },
                addSpendRule: '[pt-BR] Add spend rule',
                editRuleTitle: '[pt-BR] Edit rule',
                cardPageTitle: '[pt-BR] Card',
                cardsSectionTitle: '[pt-BR] Cards',
                chooseCards: '[pt-BR] Choose cards',
                saveRule: '[pt-BR] Save rule',
                deleteRule: '[pt-BR] Delete rule',
                deleteRuleConfirmation: '[pt-BR] Are you sure you want to delete this rule?',
                allow: '[pt-BR] Allow',
                spendRuleSectionTitle: '[pt-BR] Spend rule',
                restrictionType: '[pt-BR] Restriction type',
                restrictionTypeHelpAllow: "[pt-BR] Charges are approved if they match any merchant or category, and don't exceed a max amount.",
                restrictionTypeHelpBlock: '[pt-BR] Charges are declined if they match any merchant or category, or exceed a max amount.',
                addMerchant: '[pt-BR] Add merchant',
                merchantContains: '[pt-BR] Merchant contains',
                merchantExactlyMatches: '[pt-BR] Merchant exactly matches',
                noBlockedMerchants: '[pt-BR] No blocked merchants',
                addMerchantToBlockSpend: '[pt-BR] Add a merchant to block spend',
                noAllowedMerchants: '[pt-BR] No allowed merchants',
                addMerchantToAllowSpend: '[pt-BR] Add a merchant to allow spend',
                matchType: '[pt-BR] Match type',
                matchTypeContains: '[pt-BR] Contains',
                matchTypeExact: '[pt-BR] Matches exactly',
                spendCategory: '[pt-BR] Spend category',
                maxAmount: '[pt-BR] Max amount',
                maxAmountHelp: '[pt-BR] Any charge over this amount will be declined, regardless of merchant and spend category restrictions.',
                currencyMismatchTitle: '[pt-BR] Currency mismatch',
                currencyMismatchPrompt: '[pt-BR] To set a max amount, select cards that settle in the same currency.',
                reviewSelectedCards: '[pt-BR] Review selected cards',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => `[pt-BR] ${summary}, +${count} more`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '[pt-BR] Apply at least one spend rule to one card',
                confirmErrorCardRequired: '[pt-BR] Card is a required field',
                confirmErrorApplyAtLeastOneSpendRule: '[pt-BR] Apply at least one spend rule',
                categories: '[pt-BR] Categories',
                merchants: '[pt-BR] Merchants',
                noAvailableCards: '[pt-BR] All cards already have a rule',
                noAvailableCardsSubtitle: '[pt-BR] Edit an existing card rule to make changes',
                max: '[pt-BR] Max',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '[pt-BR] Airlines',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '[pt-BR] Alcohol and bars',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: '[pt-BR] Amazon and bookstores',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '[pt-BR] Automotive',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: '[pt-BR] Car rentals',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '[pt-BR] Dining',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '[pt-BR] Fuel and gas',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '[pt-BR] Government and non-profits',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '[pt-BR] Groceries',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: '[pt-BR] Gyms and fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '[pt-BR] Healthcare',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: '[pt-BR] Hotels',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: '[pt-BR] Internet and phone',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '[pt-BR] Office supplies',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '[pt-BR] Parking and tolls',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: '[pt-BR] Professional services',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '[pt-BR] Retail',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '[pt-BR] Shipping and delivery',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: '[pt-BR] Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '[pt-BR] Transit and rideshare',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '[pt-BR] Travel agencies',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '[pt-BR] Collect',
                    description: '[pt-BR] For teams looking to automate their processes.',
                },
                corporate: {
                    label: '[pt-BR] Control',
                    description: '[pt-BR] For organizations with advanced requirements.',
                },
            },
            description: "[pt-BR] Choose a plan that's right for you. For a detailed list of features and pricing, check out our",
            subscriptionLink: '[pt-BR] plan types and pricing help page',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `[pt-BR] You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `[pt-BR] You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: '[pt-BR] Subscriptions',
        },
    },
    getAssistancePage: {
        title: '[pt-BR] Get assistance',
        subtitle: "[pt-BR] We're here to clear your path to greatness!",
        description: '[pt-BR] Choose from the support options below:',
        chatWithConcierge: '[pt-BR] Chat with Concierge',
        scheduleSetupCall: '[pt-BR] Schedule a setup call',
        scheduleACall: '[pt-BR] Schedule call',
        questionMarkButtonTooltip: '[pt-BR] Get assistance from our team',
        exploreHelpDocs: '[pt-BR] Explore help docs',
        registerForWebinar: '[pt-BR] Register for webinar',
        onboardingHelp: '[pt-BR] Onboarding help',
    },
    emojiPicker: {
        emojiNotSelected: '[pt-BR] Emoji not selected',
        skinTonePickerLabel: '[pt-BR] Change default skin tone',
        headers: {
            frequentlyUsed: '[pt-BR] Frequently Used',
            smileysAndEmotion: '[pt-BR] Smileys & Emotion',
            peopleAndBody: '[pt-BR] People & Body',
            animalsAndNature: '[pt-BR] Animals & Nature',
            foodAndDrink: '[pt-BR] Food & Drinks',
            travelAndPlaces: '[pt-BR] Travel & Places',
            activities: '[pt-BR] Activities',
            objects: '[pt-BR] Objects',
            symbols: '[pt-BR] Symbols',
            flags: '[pt-BR] Flags',
        },
    },
    newRoomPage: {
        newRoom: '[pt-BR] New room',
        groupName: '[pt-BR] Group name',
        roomName: '[pt-BR] Room name',
        visibility: '[pt-BR] Visibility',
        restrictedDescription: '[pt-BR] People in your workspace can find this room',
        privateDescription: '[pt-BR] People invited to this room can find it',
        publicDescription: '[pt-BR] Anyone can find this room',
        public_announceDescription: '[pt-BR] Anyone can find this room',
        createRoom: '[pt-BR] Create room',
        roomAlreadyExistsError: '[pt-BR] A room with this name already exists',
        roomNameReservedError: (reservedName: string) => `[pt-BR] ${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '[pt-BR] Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: '[pt-BR] Please enter a room name',
        pleaseSelectWorkspace: '[pt-BR] Please select a workspace',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `[pt-BR] ${actor}renamed to "${newName}" (previously "${oldName}")` : `[pt-BR] ${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: (newName: string) => `[pt-BR] Room renamed to ${newName}`,
        social: '[pt-BR] social',
        selectAWorkspace: '[pt-BR] Select a workspace',
        growlMessageOnRenameError: '[pt-BR] Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: '[pt-BR] Workspace',
            private: '[pt-BR] Private',
            public: '[pt-BR] Public',
            public_announce: '[pt-BR] Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '[pt-BR] Submit and Close',
        submitAndApprove: '[pt-BR] Submit and Approve',
        advanced: '[pt-BR] ADVANCED',
        dynamicExternal: '[pt-BR] DYNAMIC_EXTERNAL',
        smartReport: '[pt-BR] SMARTREPORT',
        billcom: '[pt-BR] BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[pt-BR] set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[pt-BR] removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `[pt-BR] changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `[pt-BR] changed the company address to "${newAddress}" (previously "${previousAddress}")` : `[pt-BR] set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[pt-BR] added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[pt-BR] removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `[pt-BR] changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `[pt-BR] added the category "${categoryName}"`,
        deleteCategory: (categoryName: string) => `[pt-BR] removed the category "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `[pt-BR] ${oldValue ? '[pt-BR] disabled' : '[pt-BR] enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[pt-BR] added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[pt-BR] removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[pt-BR] changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[pt-BR] added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[pt-BR] removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[pt-BR] changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `[pt-BR] changed the "${categoryName}" category description to ${!oldValue ? '[pt-BR] required' : '[pt-BR] not required'} (previously ${!oldValue ? '[pt-BR] not required' : '[pt-BR] required'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `[pt-BR] added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `[pt-BR] removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `[pt-BR] changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[pt-BR] added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `[pt-BR] changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[pt-BR] updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `[pt-BR] changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `[pt-BR] updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `[pt-BR] changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `[pt-BR] renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `[pt-BR] removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }
            return !oldValue
                ? `[pt-BR] added the description hint "${newValue}" to the category "${categoryName}"`
                : `[pt-BR] changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategories: (count: number) => `[pt-BR] updated ${count} categories`,
        updateTagListName: (oldName: string, newName: string) => `[pt-BR] changed the tag list name to "${newName}" (previously "${oldName}")`,
        updateTagList: (tagListName: string) => `[pt-BR] updated tags on the list "${tagListName}"`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `[pt-BR] changed tag list "${tagListsName}" to ${isRequired ? '[pt-BR] required' : '[pt-BR] not required'}`,
        importTags: '[pt-BR] imported tags from a spreadsheet',
        deletedAllTags: '[pt-BR] deleted all tags',
        addTag: (tagListName: string, tagName?: string) => `[pt-BR] added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `[pt-BR] updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `[pt-BR] removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `[pt-BR] removed "${count}" tags from the list "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `[pt-BR] updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `[pt-BR] updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `[pt-BR] changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `[pt-BR] ${newValue ? '[pt-BR] enabled' : '[pt-BR] disabled'} tax tracking on distance rates`,
        updateCustomUnitDefaultCategory: ({customUnitName, newValue, oldValue}: UpdatePolicyCustomUnitDefaultCategoryParams) =>
            `[pt-BR] changed the ${customUnitName} default category to "${newValue}" ${oldValue ? `[pt-BR] (previously "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `[pt-BR] imported rates for custom unit "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `[pt-BR] added a new ${customUnitName} rate "${rateName}"`,
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `[pt-BR] removed the "${customUnitName}" rate "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `[pt-BR] changed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${customUnitSubRateName}" ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `[pt-BR] removed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${removedSubRateName}"`,
        addedReportField: ({fieldType, fieldName, defaultValue}: AddedOrDeletedPolicyReportFieldParams) =>
            `[pt-BR] added ${fieldType} report field "${fieldName}"${defaultValue ? `[pt-BR]  with default value "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `[pt-BR] changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `[pt-BR] changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `[pt-BR] added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `[pt-BR] changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `[pt-BR] added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `[pt-BR] ${newValue ? '[pt-BR] enabled' : '[pt-BR] disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `[pt-BR] set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `[pt-BR] added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `[pt-BR] removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `[pt-BR] ${optionEnabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `[pt-BR] ${allEnabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} all options for the report field "${fieldName}" `;
            }
            return `[pt-BR] ${allEnabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? '[pt-BR] enabled' : '[pt-BR] disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `[pt-BR] removed ${fieldType} Report Field "${fieldName}"`,
        addedCardFeed: (feedName: string) => `[pt-BR] added card feed "${feedName}"`,
        removedCardFeed: (feedName: string) => `[pt-BR] removed card feed "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `[pt-BR] renamed card feed to "${newName}" (previously "${oldName}")`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) => `[pt-BR] assigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[pt-BR] unassigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} cardholders to delete card transactions for card feed "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `[pt-BR] changed card feed "${feedName}" statement period end day${newValue ? `[pt-BR]  to "${newValue}"` : ''}${previousValue ? `[pt-BR]  (previously "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `[pt-BR] updated "Prevent self-approval" to "${newValue === 'true' ? '[pt-BR] Enabled' : '[pt-BR] Disabled'}" (previously "${oldValue === 'true' ? '[pt-BR] Enabled' : '[pt-BR] Disabled'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `[pt-BR] set the monthly report submission date to "${newValue}"`;
            }
            return `[pt-BR] updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `[pt-BR] updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `[pt-BR] updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `[pt-BR] turned "Enforce default report titles" ${value ? '[pt-BR] on' : '[pt-BR] off'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `[pt-BR] changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `[pt-BR] updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `[pt-BR] set the description of this workspace to "${newDescription}"`
                : `[pt-BR] updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('[pt-BR]  and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `[pt-BR] removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `[pt-BR] removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `[pt-BR] updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `[pt-BR] updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `[pt-BR] updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `[pt-BR] updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: '[pt-BR] upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `[pt-BR] This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: '[pt-BR] downgraded this workspace to the Collect plan',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `[pt-BR] changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `[pt-BR] changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        addBudget: ({frequency, entityName, entityType, shared, individual, notificationThreshold}: AddBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[pt-BR]  with notification threshold of "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `[pt-BR] added ${frequency} individual budget of "${individual}" and ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            if (typeof individual !== 'undefined') {
                return `[pt-BR] added ${frequency} individual budget of "${individual}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            return `[pt-BR] added ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
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
                changesList.push(`[pt-BR] changed budget frequency to "${newFrequency}" (previously "${oldFrequency}")`);
            }
            if (sharedChanged) {
                changesList.push(`[pt-BR] changed total workspace budget to "${newShared}" (previously "${oldShared}")`);
            }
            if (individualChanged) {
                changesList.push(`[pt-BR] changed individual budget to "${newIndividual}" (previously "${oldIndividual}")`);
            }
            if (thresholdChanged) {
                changesList.push(`[pt-BR] changed notification threshold to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `[pt-BR] updated budget for the ${entityType} "${entityName}"`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `[pt-BR] changed budget frequency for the ${entityType} "${entityName}" to "${newFrequency}" (previously "${oldFrequency}")`;
                }
                if (sharedChanged) {
                    return `[pt-BR] changed total workspace budget for the ${entityType} "${entityName}" to "${newShared}" (previously "${oldShared}")`;
                }
                if (individualChanged) {
                    return `[pt-BR] changed individual budget for the ${entityType} "${entityName}" to "${newIndividual}" (previously "${oldIndividual}")`;
                }
                return `[pt-BR] changed notification threshold for the ${entityType} "${entityName}" to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`;
            }
            return `[pt-BR] updated budget for the ${entityType} "${entityName}": ${changesList.join('; ')}`;
        },
        deleteBudget: ({entityType, entityName, frequency, individual, shared, notificationThreshold}: DeleteBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[pt-BR]  with notification threshold of "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `[pt-BR] removed ${frequency} shared budget of "${shared}" and individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (shared) {
                return `[pt-BR] removed ${frequency} shared budget of "${shared}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `[pt-BR] removed ${frequency} individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            return `[pt-BR] removed budget from the ${entityType} "${entityName}"`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} time tracking`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `[pt-BR] changed hourly rate to "${newRate}" (previously "${oldRate}")`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[pt-BR] added "${prohibitedExpense}" to prohibited expenses`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[pt-BR] removed "${prohibitedExpense}" from prohibited expenses`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `[pt-BR] changed reimbursement method to "${newReimbursementChoice}" (previously "${oldReimbursementChoice}")`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} pre-approval of workspace join requests`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `[pt-BR] changed custom report name formula to "${newDefaultTitle}" (previously "${oldDefaultTitle}")`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `[pt-BR] took over ownership of ${policyName} from ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} scheduled submit`,
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
            `[pt-BR] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". ${userEmail} is currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}.${summaryLink ? `[pt-BR]  <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
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
            `[pt-BR] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". You're currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}. ${summaryLink ? `[pt-BR] <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} categories`;
                case 'tags':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} tags`;
                case 'workflows':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} workflows`;
                case 'distance rates':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} distance rates`;
                case 'accounting':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} accounting`;
                case 'Expensify Cards':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} Expensify Cards`;
                case 'travel invoicing':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} travel invoicing`;
                case 'company cards':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} company cards`;
                case 'invoicing':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} invoicing`;
                case 'per diem':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} per diem`;
                case 'receipt partners':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} receipt partners`;
                case 'rules':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} rules`;
                case 'tax tracking':
                    return `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} tax tracking`;
                default:
                    return `${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} attendee tracking`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} auto-pay approved reports`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `[pt-BR] set the auto-pay approved reports threshold to "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `[pt-BR] changed the auto-pay approved reports threshold to "${newLimit}" (previously "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: '[pt-BR] removed the auto-pay approved reports threshold',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `[pt-BR] changed the default approver to ${newApprover} (previously ${previousApprover})` : `[pt-BR] changed the default approver to ${newApprover}`,
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
            let text = `[pt-BR] changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `[pt-BR]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[pt-BR]  (previously default approver)';
            } else if (previousApprover) {
                text += `[pt-BR]  (previously ${previousApprover})`;
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
                ? `[pt-BR] changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `[pt-BR] changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += `[pt-BR]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[pt-BR]  (previously default approver)';
            } else if (previousApprover) {
                text += `[pt-BR]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[pt-BR] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `[pt-BR] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[pt-BR] changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `[pt-BR] changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[pt-BR] changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `[pt-BR] set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[pt-BR] changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `[pt-BR] set the invoice company website to "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser
                ? `[pt-BR] changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")`
                : `[pt-BR] changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: (enabled: boolean) => `[pt-BR] ${enabled ? '[pt-BR] enabled' : '[pt-BR] disabled'} reimbursements`,
        updateCustomTaxName: ({oldName, newName}: UpdatedPolicyCustomTaxNameParams) => `[pt-BR] changed the custom tax name to "${newName}" (previously "${oldName}")`,
        updateCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyCurrencyDefaultTaxParams) =>
            `[pt-BR] changed the workspace currency default tax rate to "${newName}" (previously "${oldName}")`,
        updateForeignCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyForeignCurrencyDefaultTaxParams) =>
            `[pt-BR] changed the foreign currency default tax rate to "${newName}" (previously "${oldName}")`,
        addTax: (taxName: string) => `[pt-BR] added the tax "${taxName}"`,
        deleteTax: (taxName: string) => `[pt-BR] removed the tax "${taxName}"`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `[pt-BR] renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `[pt-BR] changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `[pt-BR] changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `[pt-BR] ${oldValue ? '[pt-BR] disabled' : '[pt-BR] enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `[pt-BR] set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[pt-BR] changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: (oldValue: string) => `[pt-BR] removed receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `[pt-BR] set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `[pt-BR] changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: (oldValue: string) => `[pt-BR] removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: (newValue: string) => `[pt-BR] set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `[pt-BR] changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `[pt-BR] removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: '[pt-BR] Member not found.',
        useInviteButton: '[pt-BR] To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `[pt-BR] You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `[pt-BR] It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `[pt-BR] Are you sure you want to remove ${memberName} from the room?`,
            other: '[pt-BR] Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: '[pt-BR] There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: '[pt-BR] Assign task',
        assignMe: '[pt-BR] Assign to me',
        confirmTask: '[pt-BR] Confirm task',
        confirmError: '[pt-BR] Please enter a title and select a share destination',
        descriptionOptional: '[pt-BR] Description (optional)',
        pleaseEnterTaskName: '[pt-BR] Please enter a title',
        pleaseEnterTaskDestination: '[pt-BR] Please select where you want to share this task',
    },
    task: {
        task: '[pt-BR] Task',
        title: '[pt-BR] Title',
        description: '[pt-BR] Description',
        assignee: '[pt-BR] Assignee',
        completed: '[pt-BR] Completed',
        action: '[pt-BR] Complete',
        messages: {
            created: (title: string) => `[pt-BR] task for ${title}`,
            completed: '[pt-BR] marked as complete',
            canceled: '[pt-BR] deleted task',
            reopened: '[pt-BR] marked as incomplete',
            error: "[pt-BR] You don't have permission to take the requested action",
        },
        markAsComplete: '[pt-BR] Mark as complete',
        markAsIncomplete: '[pt-BR] Mark as incomplete',
        assigneeError: '[pt-BR] An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: '[pt-BR] There was an error creating this task. Please try again later.',
        deleteTask: '[pt-BR] Delete task',
        deleteConfirmation: '[pt-BR] Are you sure you want to delete this task?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `[pt-BR] ${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '[pt-BR] Keyboard shortcuts',
        subtitle: '[pt-BR] Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: '[pt-BR] Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: '[pt-BR] Mark all messages as read',
            escape: '[pt-BR] Escape dialogs',
            search: '[pt-BR] Open search dialog',
            newChat: '[pt-BR] New chat screen',
            copy: '[pt-BR] Copy comment',
            openDebug: '[pt-BR] Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: '[pt-BR] Screen share',
        screenShareRequest: '[pt-BR] Expensify is inviting you to a screen share',
    },
    search: {
        resultsAreLimited: '[pt-BR] Search results are limited.',
        viewResults: '[pt-BR] View results',
        appliedFilters: '[pt-BR] Applied filters',
        resetFilters: '[pt-BR] Reset filters',
        searchResults: {
            emptyResults: {
                title: '[pt-BR] Nothing to show',
                subtitle: `[pt-BR] Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "[pt-BR] You haven't created any expenses yet",
                subtitle: '[pt-BR] Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[pt-BR] Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "[pt-BR] You haven't created any reports yet",
                subtitle: '[pt-BR] Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[pt-BR] Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    [pt-BR] You haven't created any
                    invoices yet
                `),
                subtitle: '[pt-BR] Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[pt-BR] Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: '[pt-BR] No trips to display',
                subtitle: '[pt-BR] Get started by booking your first trip below.',
                buttonText: '[pt-BR] Book a trip',
            },
            emptySubmitResults: {
                title: '[pt-BR] No expenses to submit',
                subtitle: "[pt-BR] You're all clear. Take a victory lap!",
                buttonText: '[pt-BR] Create report',
            },
            emptyApproveResults: {
                title: '[pt-BR] No expenses to approve',
                subtitle: '[pt-BR] Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: '[pt-BR] No expenses to pay',
                subtitle: '[pt-BR] Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: '[pt-BR] No expenses to export',
                subtitle: '[pt-BR] Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: '[pt-BR] No expenses to display',
                subtitle: '[pt-BR] No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: '[pt-BR] No expenses to approve',
                subtitle: '[pt-BR] Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: '[pt-BR] Columns',
        editColumns: '[pt-BR] Edit columns',
        resetColumns: '[pt-BR] Reset columns',
        groupColumns: '[pt-BR] Group columns',
        expenseColumns: '[pt-BR] Expense Columns',
        statements: '[pt-BR] Statements',
        cardStatements: '[pt-BR] Card statements',
        monthlyAccrual: '[pt-BR] Monthly accrual',
        unapprovedCash: '[pt-BR] Unapproved cash',
        unapprovedCard: '[pt-BR] Unapproved card',
        reconciliation: '[pt-BR] Reconciliation',
        topSpenders: '[pt-BR] Top spenders',
        saveSearch: '[pt-BR] Save search',
        deleteSavedSearch: '[pt-BR] Delete saved search',
        deleteSavedSearchConfirm: '[pt-BR] Are you sure you want to delete this search?',
        searchName: '[pt-BR] Search name',
        savedSearchesMenuItemTitle: '[pt-BR] Saved',
        topCategories: '[pt-BR] Top categories',
        topMerchants: '[pt-BR] Top merchants',
        spendOverTime: '[pt-BR] Spend over time',
        groupedExpenses: '[pt-BR] grouped expenses',
        bulkActions: {
            editMultiple: '[pt-BR] Edit multiple',
            editMultipleTitle: '[pt-BR] Edit multiple expenses',
            editMultipleDescription: "[pt-BR] Changes will be set for all selected expenses and will override any previously set values. Just sayin'.",
            approve: '[pt-BR] Approve',
            pay: '[pt-BR] Pay',
            delete: '[pt-BR] Delete',
            hold: '[pt-BR] Hold',
            unhold: '[pt-BR] Remove hold',
            reject: '[pt-BR] Reject',
            duplicateExpense: ({count}: {count: number}) => `[pt-BR] Duplicate ${count === 1 ? '[pt-BR] expense' : '[pt-BR] expenses'}`,
            noOptionsAvailable: '[pt-BR] No options available for the selected group of expenses.',
        },
        filtersHeader: '[pt-BR] Filters',
        filters: {
            date: {
                before: (date?: string) => `[pt-BR] Before ${date ?? ''}`,
                after: (date?: string) => `[pt-BR] After ${date ?? ''}`,
                on: (date?: string) => `[pt-BR] On ${date ?? ''}`,
                customDate: '[pt-BR] Custom date',
                customRange: '[pt-BR] Custom range',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '[pt-BR] Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '[pt-BR] Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '[pt-BR] This month',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '[pt-BR] Year to date',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '[pt-BR] Last 12 months',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '[pt-BR] Last statement',
                },
            },
            status: '[pt-BR] Status',
            keyword: '[pt-BR] Keyword',
            keywords: '[pt-BR] Keywords',
            limit: '[pt-BR] Limit',
            limitDescription: '[pt-BR] Set a limit for the results of your search.',
            currency: '[pt-BR] Currency',
            completed: '[pt-BR] Completed',
            amount: {
                lessThan: (amount?: string) => `[pt-BR] Less than ${amount ?? ''}`,
                greaterThan: (amount?: string) => `[pt-BR] Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `[pt-BR] Between ${greaterThan} and ${lessThan}`,
                equalTo: (amount?: string) => `[pt-BR] Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: '[pt-BR] Expensify',
                individualCards: '[pt-BR] Individual cards',
                closedCards: '[pt-BR] Closed cards',
                cardFeeds: '[pt-BR] Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `[pt-BR] All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `[pt-BR] All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `[pt-BR] ${name} is ${value}`,
            current: '[pt-BR] Current',
            past: '[pt-BR] Past',
            submitted: '[pt-BR] Submitted',
            approved: '[pt-BR] Approved',
            paid: '[pt-BR] Paid',
            exported: '[pt-BR] Exported',
            posted: '[pt-BR] Posted',
            withdrawn: '[pt-BR] Withdrawn',
            billable: '[pt-BR] Billable',
            reimbursable: '[pt-BR] Reimbursable',
            purchaseCurrency: '[pt-BR] Purchase currency',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '[pt-BR] From',
                [CONST.SEARCH.GROUP_BY.CARD]: '[pt-BR] Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[pt-BR] Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '[pt-BR] Category',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '[pt-BR] Merchant',
                [CONST.SEARCH.GROUP_BY.TAG]: '[pt-BR] Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: '[pt-BR] Month',
                [CONST.SEARCH.GROUP_BY.WEEK]: '[pt-BR] Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: '[pt-BR] Year',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '[pt-BR] Quarter',
            },
            feed: '[pt-BR] Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: '[pt-BR] Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '[pt-BR] Reimbursement',
            },
            is: '[pt-BR] Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '[pt-BR] Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '[pt-BR] Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '[pt-BR] Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '[pt-BR] Export',
            },
        },
        display: {
            label: '[pt-BR] Display',
            sortBy: '[pt-BR] Sort by',
            groupBy: '[pt-BR] Group by',
            limitResults: '[pt-BR] Limit results',
        },
        has: '[pt-BR] Has',
        view: {
            label: '[pt-BR] View',
            table: '[pt-BR] Table',
            bar: '[pt-BR] Bar',
            line: '[pt-BR] Line',
            pie: '[pt-BR] Pie',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '[pt-BR] From',
            [CONST.SEARCH.GROUP_BY.CARD]: '[pt-BR] Cards',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[pt-BR] Exports',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '[pt-BR] Categories',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '[pt-BR] Merchants',
            [CONST.SEARCH.GROUP_BY.TAG]: '[pt-BR] Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: '[pt-BR] Months',
            [CONST.SEARCH.GROUP_BY.WEEK]: '[pt-BR] Weeks',
            [CONST.SEARCH.GROUP_BY.YEAR]: '[pt-BR] Years',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '[pt-BR] Quarters',
        },
        moneyRequestReport: {
            emptyStateTitle: '[pt-BR] This report has no expenses.',
            accessPlaceHolder: '[pt-BR] Open for details',
        },
        noCategory: '[pt-BR] No category',
        noMerchant: '[pt-BR] No merchant',
        noTag: '[pt-BR] No tag',
        expenseType: '[pt-BR] Expense type',
        withdrawalType: '[pt-BR] Withdrawal type',
        recentSearches: '[pt-BR] Recent searches',
        recentChats: '[pt-BR] Recent chats',
        searchIn: '[pt-BR] Search in',
        searchPlaceholder: '[pt-BR] Search for something',
        suggestions: '[pt-BR] Suggestions',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `[pt-BR] Suggestions available${query ? `[pt-BR]  for ${query}` : ''}. ${count} result.`,
            other: (resultCount: number) => `[pt-BR] Suggestions available${query ? `[pt-BR]  for ${query}` : ''}. ${resultCount} results.`,
        }),
        exportSearchResults: {
            title: '[pt-BR] Create export',
            description: "[pt-BR] Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: '[pt-BR] Exported to',
        exportAll: {
            selectAllMatchingItems: '[pt-BR] Select all matching items',
            allMatchingItemsSelected: '[pt-BR] All matching items selected',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: '[pt-BR] Please select dates for both From and To',
        },
    },
    genericErrorPage: {
        title: '[pt-BR] Uh-oh, something went wrong!',
        body: {
            helpTextMobile: '[pt-BR] Please close and reopen the app, or switch to',
            helpTextWeb: '[pt-BR] web.',
            helpTextConcierge: '[pt-BR] If the problem persists, reach out to',
        },
        refresh: '[pt-BR] Refresh',
    },
    fileDownload: {
        success: {
            title: '[pt-BR] Downloaded!',
            message: '[pt-BR] Attachment successfully downloaded!',
            qrMessage: '[pt-BR] Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: '[pt-BR] Attachment error',
            message: "[pt-BR] Attachment can't be downloaded",
        },
        permissionError: {
            title: '[pt-BR] Storage access',
            message: "[pt-BR] Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: '[pt-BR] Pending',
            cleared: '[pt-BR] Cleared',
            failed: '[pt-BR] Failed',
        },
        failedError: ({link}: {link: string}) => `[pt-BR] We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `[pt-BR] ${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '[pt-BR] Report layout',
        groupByLabel: '[pt-BR] Group by:',
        selectGroupByOption: '[pt-BR] Select how to group report expenses',
        uncategorized: '[pt-BR] Uncategorized',
        noTag: '[pt-BR] No tag',
        selectGroup: ({groupName}: {groupName: string}) => `[pt-BR] Select all expenses in ${groupName}`,
        groupBy: {
            category: '[pt-BR] Category',
            tag: '[pt-BR] Tag',
        },
    },
    report: {
        newReport: {
            createExpense: '[pt-BR] Create expense',
            createReport: '[pt-BR] Create report',
            chooseWorkspace: '[pt-BR] Choose a workspace for this report.',
            emptyReportConfirmationTitle: '[pt-BR] You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `[pt-BR] Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationPromptLink: '[pt-BR] Reports',
            emptyReportConfirmationDontShowAgain: "[pt-BR] Don't show me this again",
            genericWorkspaceName: '[pt-BR] this workspace',
        },
        genericCreateReportFailureMessage: '[pt-BR] Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: '[pt-BR] Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: '[pt-BR] Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: '[pt-BR] Unexpected error renaming the report. Please try again later.',
        noActivityYet: '[pt-BR] No activity yet',
        connectionSettings: '[pt-BR] Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `[pt-BR] changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `[pt-BR] set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `[pt-BR] changed the workspace${fromPolicyName ? `[pt-BR]  (previously ${fromPolicyName})` : ''}`;
                    }
                    return `[pt-BR] changed the workspace to ${toPolicyName}${fromPolicyName ? `[pt-BR]  (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `[pt-BR] changed type from ${oldType} to ${newType}`,
                exportedToCSV: `[pt-BR] exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `[pt-BR] exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `[pt-BR] exported to ${label} via`,
                    automaticActionTwo: '[pt-BR] accounting settings',
                    manual: (label: string) => `[pt-BR] marked this report as manually exported to ${label}.`,
                    automaticActionThree: '[pt-BR] and successfully created a record for',
                    reimburseableLink: '[pt-BR] out-of-pocket expenses',
                    nonReimbursableLink: '[pt-BR] company card expenses',
                    pending: (label: string) => `[pt-BR] started exporting this report to ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `[pt-BR] failed to export this report to ${label} ("${errorMessage}${linkText ? `[pt-BR]  <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `[pt-BR] added a receipt`,
                managerDetachReceipt: `[pt-BR] removed a receipt`,
                markedReimbursed: (amount: string, currency: string) => `[pt-BR] paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `[pt-BR] paid ${currency}${amount} via integration`,
                outdatedBankAccount: `[pt-BR] couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounceDefault: `[pt-BR] couldn't process the payment due to an incorrect routing/account number or closed account`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `[pt-BR] couldn't process the payment: ${returnReason}`,
                reimbursementACHCancelled: `[pt-BR] canceled the payment`,
                reimbursementAccountChanged: `[pt-BR] couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `[pt-BR] processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `[pt-BR] randomly selected for review`,
                selectedForRandomAuditMarkdown: `[pt-BR] [randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `[pt-BR] invited member ${to}`,
                unshare: ({to}: UnshareParams) => `[pt-BR] removed member ${to}`,
                stripePaid: (amount: string, currency: string) => `[pt-BR] paid ${currency}${amount}`,
                takeControl: `[pt-BR] took control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `[pt-BR] Open the Expensify mobile app to review your ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}transaction`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `[pt-BR] there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `[pt-BR] The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `[pt-BR] the Plaid connection to your business bank account is broken. Please <a href='${walletRoute}'>reconnect your bank account ${maskedAccountNumber}</a> so you can continue to use your Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `[pt-BR] ${email} joined via the workspace invite link` : `[pt-BR] added ${email} as ${role === 'member' ? '[pt-BR] a' : '[pt-BR] an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `[pt-BR] updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[pt-BR] removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[pt-BR] added "${newValue}" to ${email}’s custom field 1`
                        : `[pt-BR] changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[pt-BR] removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[pt-BR] added "${newValue}" to ${email}’s custom field 2`
                        : `[pt-BR] changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `[pt-BR] ${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `[pt-BR] removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `[pt-BR] removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `[pt-BR] connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '[pt-BR] left the chat',
                leftTheChatWithName: (nameOrEmail: string) => `[pt-BR] ${nameOrEmail ? `${nameOrEmail}: ` : ''}left the chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `[pt-BR] business bank account ${maskedBankAccountNumber} has been automatically locked due to an issue with either Reimbursement or Expensify Card settlement. Please fix the issue in your <a href="${linkURL}">workspace settings</a>.`,
            },
            error: {
                invalidCredentials: '[pt-BR] Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `[pt-BR] ${summary} for ${dayCount} ${dayCount === 1 ? '[pt-BR] day' : '[pt-BR] days'} until ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `[pt-BR] ${summary} from ${timePeriod} on ${date}`,
        startTimer: '[pt-BR] Start Timer',
        stopTimer: '[pt-BR] Stop Timer',
        scheduleOOO: '[pt-BR] Schedule OOO',
        scheduleOOOTitle: '[pt-BR] Schedule Out of Office',
        date: '[pt-BR] Date',
        time: '[pt-BR] Time (use 24-hour format)',
        durationAmount: '[pt-BR] Duration',
        durationUnit: '[pt-BR] Unit',
        reason: '[pt-BR] Reason',
        workingPercentage: '[pt-BR] Working percentage',
        dateRequired: '[pt-BR] Date is required.',
        invalidTimeFormat: '[pt-BR] Please enter a valid 24-hour time (e.g., 14:30).',
        enterANumber: '[pt-BR] Please enter a number.',
        hour: '[pt-BR] hours',
        day: '[pt-BR] days',
        week: '[pt-BR] weeks',
        month: '[pt-BR] months',
    },
    footer: {
        features: '[pt-BR] Features',
        expenseManagement: '[pt-BR] Expense Management',
        spendManagement: '[pt-BR] Spend Management',
        expenseReports: '[pt-BR] Expense Reports',
        companyCreditCard: '[pt-BR] Company Credit Card',
        receiptScanningApp: '[pt-BR] Receipt Scanning App',
        billPay: '[pt-BR] Bill Pay',
        invoicing: '[pt-BR] Invoicing',
        CPACard: '[pt-BR] CPA Card',
        payroll: '[pt-BR] Payroll',
        travel: '[pt-BR] Travel',
        resources: '[pt-BR] Resources',
        expensifyApproved: '[pt-BR] ExpensifyApproved!',
        pressKit: '[pt-BR] Press Kit',
        support: '[pt-BR] Support',
        expensifyHelp: '[pt-BR] ExpensifyHelp',
        terms: '[pt-BR] Terms of Service',
        privacy: '[pt-BR] Privacy',
        learnMore: '[pt-BR] Learn More',
        aboutExpensify: '[pt-BR] About Expensify',
        blog: '[pt-BR] Blog',
        jobs: '[pt-BR] Jobs',
        expensifyOrg: '[pt-BR] Expensify.org',
        investorRelations: '[pt-BR] Investor Relations',
        getStarted: '[pt-BR] Get Started',
        createAccount: '[pt-BR] Create A New Account',
        logIn: '[pt-BR] Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '[pt-BR] Navigate back to chats list',
        chatWelcomeMessage: '[pt-BR] Chat welcome message',
        navigatesToChat: '[pt-BR] Navigates to a chat',
        newMessageLineIndicator: '[pt-BR] New message line indicator',
        chatMessage: '[pt-BR] Chat message',
        lastChatMessagePreview: '[pt-BR] Last chat message preview',
        workspaceName: '[pt-BR] Workspace name',
        chatUserDisplayNames: '[pt-BR] Chat member display names',
        scrollToNewestMessages: '[pt-BR] Scroll to newest messages',
        preStyledText: '[pt-BR] Pre-styled text',
        viewAttachment: '[pt-BR] View attachment',
        contextMenuAvailable: '[pt-BR] Context menu available. Press Shift+F10 to open.',
        contextMenuAvailableMacOS: '[pt-BR] Context menu available. Press VO-Shift-M to open.',
        contextMenuAvailableNative: '[pt-BR] Context menu available. Double-tap and hold to open.',
        selectAllFeatures: '[pt-BR] Select all features',
        selectAllTransactions: '[pt-BR] Select all transactions',
        selectAllItems: '[pt-BR] Select all items',
    },
    parentReportAction: {
        deletedReport: '[pt-BR] Deleted report',
        deletedMessage: '[pt-BR] Deleted message',
        deletedExpense: '[pt-BR] Deleted expense',
        reversedTransaction: '[pt-BR] Reversed transaction',
        deletedTask: '[pt-BR] Deleted task',
        hiddenMessage: '[pt-BR] Hidden message',
    },
    threads: {
        thread: '[pt-BR] Thread',
        replies: '[pt-BR] Replies',
        reply: '[pt-BR] Reply',
        from: '[pt-BR] From',
        in: '[pt-BR] in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `[pt-BR] From ${reportName}${workspaceName ? `[pt-BR]  in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: '[pt-BR] QR code',
        copy: '[pt-BR] Copy URL',
        copied: '[pt-BR] Copied!',
    },
    moderation: {
        flagDescription: '[pt-BR] All flagged messages will be sent to a moderator for review.',
        chooseAReason: '[pt-BR] Choose a reason for flagging below:',
        spam: '[pt-BR] Spam',
        spamDescription: '[pt-BR] Unsolicited off-topic promotion',
        inconsiderate: '[pt-BR] Inconsiderate',
        inconsiderateDescription: '[pt-BR] Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: '[pt-BR] Intimidation',
        intimidationDescription: '[pt-BR] Aggressively pursuing an agenda over valid objections',
        bullying: '[pt-BR] Bullying',
        bullyingDescription: '[pt-BR] Targeting an individual to obtain obedience',
        harassment: '[pt-BR] Harassment',
        harassmentDescription: '[pt-BR] Racist, misogynistic, or other broadly discriminatory behavior',
        assault: '[pt-BR] Assault',
        assaultDescription: '[pt-BR] Specifically targeted emotional attack with the intention of harm',
        flaggedContent: '[pt-BR] This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: '[pt-BR] Hide message',
        revealMessage: '[pt-BR] Reveal message',
        levelOneResult: '[pt-BR] Sends anonymous warning and message is reported for review.',
        levelTwoResult: '[pt-BR] Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: '[pt-BR] Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '[pt-BR] Invite to submit expenses',
        inviteToChat: '[pt-BR] Invite to chat only',
        nothing: '[pt-BR] Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '[pt-BR] Accept',
        decline: '[pt-BR] Decline',
    },
    actionableMentionTrackExpense: {
        submit: '[pt-BR] Submit it to someone',
        categorize: '[pt-BR] Categorize it',
        share: '[pt-BR] Share it with my accountant',
        nothing: '[pt-BR] Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: '[pt-BR] Teachers Unite',
        joinExpensifyOrg:
            '[pt-BR] Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: '[pt-BR] I know a teacher',
        iAmATeacher: '[pt-BR] I am a teacher',
        personalKarma: {
            title: '[pt-BR] Enable Personal Karma',
            description: '[pt-BR] Donate $1 to Expensify.org for every $500 you spend each month',
            stopDonationsPrompt: '[pt-BR] Are you sure you want to stop donating to Expensify.org?',
        },
        getInTouch: '[pt-BR] Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: '[pt-BR] Intro to your school principal',
        schoolPrincipalVerifyExpense:
            '[pt-BR] Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: '[pt-BR] Principal first name',
        principalLastName: '[pt-BR] Principal last name',
        principalWorkEmail: '[pt-BR] Principal work email',
        updateYourEmail: '[pt-BR] Update your email address',
        updateEmail: '[pt-BR] Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `[pt-BR] Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: '[pt-BR] Enter a valid email or phone number',
            enterEmail: '[pt-BR] Enter an email',
            enterValidEmail: '[pt-BR] Enter a valid email',
            tryDifferentEmail: '[pt-BR] Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: '[pt-BR] Not activated',
        outOfPocket: '[pt-BR] Reimbursable',
        companySpend: '[pt-BR] Non-reimbursable',
        personalCard: '[pt-BR] Personal card',
        companyCard: '[pt-BR] Company card',
        expensifyCard: '[pt-BR] Expensify Card',
        centralInvoicing: '[pt-BR] Central invoicing',
    },
    distance: {
        addStop: '[pt-BR] Add stop',
        address: '[pt-BR] Address',
        waypointDescription: {
            start: '[pt-BR] Start',
            stop: '[pt-BR] Stop',
        },
        mapPending: {
            title: '[pt-BR] Map pending',
            subtitle: '[pt-BR] The map will be generated when you go back online',
            onlineSubtitle: '[pt-BR] One moment while we set up the map',
            errorTitle: '[pt-BR] Map error',
            errorSubtitle: '[pt-BR] There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: '[pt-BR] Please select a suggested address or use current location',
        },
        odometer: {
            startReading: '[pt-BR] Start reading',
            endReading: '[pt-BR] End reading',
            saveForLater: '[pt-BR] Save for later',
            totalDistance: '[pt-BR] Total distance',
            startTitle: '[pt-BR] Odometer start photo',
            endTitle: '[pt-BR] Odometer end photo',
            deleteOdometerPhoto: '[pt-BR] Delete odometer photo',
            deleteOdometerPhotoConfirmation: '[pt-BR] Are you sure you want to delete this odometer photo?',
            startMessageWeb: '[pt-BR] Add a photo of your odometer from the <strong>start</strong> of your trip. Drag a file here or choose one to upload.',
            endMessageWeb: '[pt-BR] Add a photo of your odometer from the <strong>end</strong> of your trip. Drag a file here or choose one to upload.',
            cameraAccessRequired: '[pt-BR] Camera access is required to take pictures.',
            snapPhotoStart: '[pt-BR] <muted-text-label>Snap a photo of your odometer at the <strong>start</strong> of your trip.</muted-text-label>',
            snapPhotoEnd: '[pt-BR] <muted-text-label>Snap a photo of your odometer at the <strong>end</strong> of your trip.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '[pt-BR] Failed to start location tracking.',
            failedToGetPermissions: '[pt-BR] Failed to get required location permissions.',
        },
        trackingDistance: '[pt-BR] Tracking distance...',
        stopped: '[pt-BR] Stopped',
        start: '[pt-BR] Start',
        stop: '[pt-BR] Stop',
        discard: '[pt-BR] Discard',
        stopGpsTrackingModal: {
            title: '[pt-BR] Stop GPS tracking',
            prompt: '[pt-BR] Are you sure? This will end your current journey.',
            cancel: '[pt-BR] Resume tracking',
            confirm: '[pt-BR] Stop GPS tracking',
        },
        discardDistanceTrackingModal: {
            title: '[pt-BR] Discard distance tracking',
            prompt: "[pt-BR] Are you sure? This will discard your current journey and can't be undone.",
            confirm: '[pt-BR] Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "[pt-BR] Can't create expense",
            prompt: "[pt-BR] You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: '[pt-BR] Location access required',
            prompt: '[pt-BR] Please allow location access in your device settings to start GPS distance tracking.',
            allow: '[pt-BR] Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: '[pt-BR] Background location access required',
            prompt: '[pt-BR] Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: '[pt-BR] Precise location required',
            prompt: '[pt-BR] Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: '[pt-BR] Track distance on your phone',
            subtitle: '[pt-BR] Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: '[pt-BR] Download the app',
        },
        notification: {
            title: '[pt-BR] GPS tracking in progress',
            body: '[pt-BR] Go to the app to finish',
        },
        continueGpsTripModal: {
            title: '[pt-BR] Continue GPS trip recording?',
            prompt: '[pt-BR] Looks like the app closed during your last GPS trip. Would you like to continue recording from that trip?',
            confirm: '[pt-BR] Continue trip',
            cancel: '[pt-BR] View trip',
        },
        signOutWarningTripInProgress: {
            title: '[pt-BR] GPS tracking in progress',
            prompt: '[pt-BR] Are you sure you want to discard the trip and sign out?',
            confirm: '[pt-BR] Discard and sign out',
        },
        switchToODWarningTripInProgress: {
            title: '[pt-BR] GPS tracking in progress',
            prompt: '[pt-BR] Are you sure you want to stop GPS tracking and switch to Expensify Classic?',
            confirm: '[pt-BR] Stop and switch',
        },
        switchAccountWarningTripInProgress: {
            title: '[pt-BR] GPS tracking in progress',
            prompt: '[pt-BR] Are you sure you want to stop GPS tracking and switch accounts?',
            confirm: '[pt-BR] Stop and switch',
        },
        locationServicesRequiredModal: {
            title: '[pt-BR] Location access required',
            confirm: '[pt-BR] Open settings',
            prompt: '[pt-BR] Please allow location access in your device settings to start GPS distance tracking.',
        },
        gpsFloatingPillText: '[pt-BR] GPS tracking in progress...',
        liveActivity: {
            subtitle: '[pt-BR] Tracking distance',
            button: '[pt-BR] View progress',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '[pt-BR] Report card lost or damaged',
        nextButtonLabel: '[pt-BR] Next',
        reasonTitle: '[pt-BR] Why do you need a new card?',
        cardDamaged: '[pt-BR] My card was damaged',
        cardLostOrStolen: '[pt-BR] My card was lost or stolen',
        confirmAddressTitle: '[pt-BR] Please confirm the mailing address for your new card.',
        cardDamagedInfo: '[pt-BR] Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: '[pt-BR] Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: '[pt-BR] Address',
        deactivateCardButton: '[pt-BR] Deactivate card',
        shipNewCardButton: '[pt-BR] Ship new card',
        addressError: '[pt-BR] Address is required',
        reasonError: '[pt-BR] Reason is required',
        successTitle: '[pt-BR] Your new card is on the way!',
        successDescription: "[pt-BR] You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: '[pt-BR] Guaranteed eReceipt',
        transactionDate: '[pt-BR] Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '[pt-BR] Start a chat, <success><strong>refer a friend</strong></success>.',
            header: '[pt-BR] Start a chat, refer a friend',
            closeAccessibilityLabel: '[pt-BR] Close, start a chat, refer a friend, banner',
            body: "[pt-BR] Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '[pt-BR] Submit an expense, <success><strong>refer your team</strong></success>.',
            header: '[pt-BR] Submit an expense, refer your team',
            closeAccessibilityLabel: '[pt-BR] Close, submit an expense, refer your team, banner',
            body: "[pt-BR] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '[pt-BR] Refer a friend',
            body: "[pt-BR] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '[pt-BR] Refer a friend',
            header: '[pt-BR] Refer a friend',
            body: "[pt-BR] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: '[pt-BR] Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `[pt-BR] Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `[pt-BR] Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: '[pt-BR] All tags required',
        autoReportedRejectedExpense: '[pt-BR] This expense was rejected.',
        billableExpense: '[pt-BR] Billable no longer valid',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `[pt-BR] Receipt required${formattedLimit ? `[pt-BR]  over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '[pt-BR] Category no longer valid',
        conversionSurcharge: (surcharge: number) => `[pt-BR] Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: '[pt-BR] Rate not valid for this workspace',
        duplicatedTransaction: '[pt-BR] Potential duplicate',
        fieldRequired: '[pt-BR] Report fields are required',
        futureDate: '[pt-BR] Future date not allowed',
        invoiceMarkup: (invoiceMarkup: number) => `[pt-BR] Marked up by ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `[pt-BR] Date older than ${maxAge} days`,
        missingCategory: '[pt-BR] Missing category',
        missingComment: '[pt-BR] Description required for selected category',
        missingAttendees: '[pt-BR] Multiple attendees required for this category',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `[pt-BR] Missing ${tagName ?? '[pt-BR] tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '[pt-BR] Amount differs from calculated distance';
                case 'card':
                    return '[pt-BR] Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `[pt-BR] Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return '[pt-BR] Amount greater than scanned receipt';
            }
        },
        modifiedDate: '[pt-BR] Date differs from scanned receipt',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `[pt-BR] Distance exceeds the calculated route of ${formattedRouteDistance}` : '[pt-BR] Distance exceeds the calculated route',
        nonExpensiworksExpense: '[pt-BR] Non-Expensiworks expense',
        overAutoApprovalLimit: (formattedLimit: string) => `[pt-BR] Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `[pt-BR] Amount over ${formattedLimit}/person category limit`,
        overLimit: (formattedLimit: string) => `[pt-BR] Amount over ${formattedLimit}/person limit`,
        overTripLimit: (formattedLimit: string) => `[pt-BR] Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: (formattedLimit: string) => `[pt-BR] Amount over ${formattedLimit}/person limit`,
        perDayLimit: (formattedLimit: string) => `[pt-BR] Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: '[pt-BR] Receipt and expense details added manually.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `[pt-BR] Receipt required over ${formattedLimit} category limit`;
            }
            if (formattedLimit) {
                return `[pt-BR] Receipt required over ${formattedLimit}`;
            }
            if (category) {
                return `[pt-BR] Receipt required over category limit`;
            }
            return '[pt-BR] Receipt required';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `[pt-BR] Itemized receipt required${formattedLimit ? `[pt-BR]  over ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '[pt-BR] Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `[pt-BR] alcohol`;
                    case 'gambling':
                        return `[pt-BR] gambling`;
                    case 'tobacco':
                        return `[pt-BR] tobacco`;
                    case 'adultEntertainment':
                        return `[pt-BR] adult entertainment`;
                    case 'hotelIncidentals':
                        return `[pt-BR] hotel incidentals`;
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
        reviewRequired: '[pt-BR] Review required',
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
                return "[pt-BR] Can't auto-match receipt due to broken bank connection.";
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return "[pt-BR] Can't auto-match receipt due to broken bank connection.";
                }
                return isMarkAsCash
                    ? `[pt-BR] Can't auto-match receipt due to broken card connection. Mark as cash to ignore, or <a href="${connectionLink}">fix the card</a> to match the receipt.`
                    : `[pt-BR] Can't auto-match receipt due to broken card connection. <a href="${connectionLink}">Fix the card</a> to match the receipt.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `[pt-BR] Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : '[pt-BR] Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `[pt-BR] Ask ${member} to mark as a cash or wait 7 days and try again` : '[pt-BR] Awaiting merge with card transaction.';
            }
            return '';
        },
        brokenConnection530Error: '[pt-BR] Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `[pt-BR] <muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: '[pt-BR] Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: '[pt-BR] Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true}) => `[pt-BR] Receipt scanning failed.${canEdit ? '[pt-BR]  Enter details manually.' : ''}`,
        receiptGeneratedWithAI: '[pt-BR] Potential AI-generated receipt',
        someTagLevelsRequired: (tagName?: string) => `[pt-BR] Missing ${tagName ?? '[pt-BR] Tag'}`,
        tagOutOfPolicy: (tagName?: string) => `[pt-BR] ${tagName ?? '[pt-BR] Tag'} no longer valid`,
        taxAmountChanged: '[pt-BR] Tax amount was modified',
        taxOutOfPolicy: (taxName?: string) => `[pt-BR] ${taxName ?? '[pt-BR] Tax'} no longer valid`,
        taxRateChanged: '[pt-BR] Tax rate was modified',
        taxRequired: '[pt-BR] Missing tax rate',
        none: '[pt-BR] None',
        taxCodeToKeep: '[pt-BR] Choose which tax code to keep',
        tagToKeep: '[pt-BR] Choose which tag to keep',
        isTransactionReimbursable: '[pt-BR] Choose if transaction is reimbursable',
        merchantToKeep: '[pt-BR] Choose which merchant to keep',
        descriptionToKeep: '[pt-BR] Choose which description to keep',
        categoryToKeep: '[pt-BR] Choose which category to keep',
        isTransactionBillable: '[pt-BR] Choose if transaction is billable',
        keepThisOne: '[pt-BR] Keep this one',
        confirmDetails: `[pt-BR] Confirm the details you're keeping`,
        confirmDuplicatesInfo: `[pt-BR] The duplicates you don't keep will be held for the submitter to delete.`,
        hold: '[pt-BR] This expense was put on hold',
        resolvedDuplicates: '[pt-BR] resolved the duplicate',
        companyCardRequired: '[pt-BR] Company card purchases required',
        noRoute: '[pt-BR] Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `[pt-BR] ${fieldName} is required`,
        reportContainsExpensesWithViolations: '[pt-BR] Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: '[pt-BR] marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: '[pt-BR] resolved the duplicate',
        },
    },
    videoPlayer: {
        play: '[pt-BR] Play',
        pause: '[pt-BR] Pause',
        fullscreen: '[pt-BR] Fullscreen',
        playbackSpeed: '[pt-BR] Playback speed',
        expand: '[pt-BR] Expand',
        mute: '[pt-BR] Mute',
        unmute: '[pt-BR] Unmute',
        normal: '[pt-BR] Normal',
    },
    exitSurvey: {
        header: '[pt-BR] Before you go',
        reasonPage: {
            title: "[pt-BR] Please tell us why you're leaving",
            subtitle: '[pt-BR] Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[pt-BR] I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "[pt-BR] I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[pt-BR] I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[pt-BR] What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '[pt-BR] What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[pt-BR] Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: '[pt-BR] Your response',
        thankYou: '[pt-BR] Thanks for the feedback!',
        thankYouSubtitle: '[pt-BR] Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: '[pt-BR] Switch to Expensify Classic',
        offlineTitle: "[pt-BR] Looks like you're stuck here...",
        offline:
            "[pt-BR] You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: '[pt-BR] Quick tip...',
        quickTipSubTitle: '[pt-BR] You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: '[pt-BR] Book a call',
        bookACallTitle: '[pt-BR] Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '[pt-BR] Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '[pt-BR] Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '[pt-BR] Travel and expense at the speed of chat',
        },
        bookACallTextTop: '[pt-BR] By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: '[pt-BR] We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: '[pt-BR] Take me to Expensify Classic',
    },
    listBoundary: {
        errorMessage: '[pt-BR] An error occurred while loading more messages',
        tryAgain: '[pt-BR] Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: '[pt-BR] matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: '[pt-BR] Authenticate payment card',
        mobileReducedFunctionalityMessage: '[pt-BR] You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `[pt-BR] Free trial: ${numOfDays} ${numOfDays === 1 ? '[pt-BR] day' : '[pt-BR] days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '[pt-BR] Your payment info is outdated',
                subtitle: (date: string) => `[pt-BR] Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '[pt-BR] Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `[pt-BR] Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : '[pt-BR] Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: '[pt-BR] Your payment info is outdated',
                subtitle: (date: string) => `[pt-BR] Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '[pt-BR] Your payment info is outdated',
                subtitle: '[pt-BR] Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: '[pt-BR] Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `[pt-BR] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: '[pt-BR] Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `[pt-BR] Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: '[pt-BR] Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `[pt-BR] Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: '[pt-BR] Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `[pt-BR] Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: '[pt-BR] Your card is expiring soon',
                subtitle: '[pt-BR] Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: '[pt-BR] Success!',
                subtitle: '[pt-BR] Your card has been billed successfully.',
            },
            retryBillingError: {
                title: '[pt-BR] Your card couldn’t be charged',
                subtitle: '[pt-BR] Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `[pt-BR] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '[pt-BR] Start a free trial',
                subtitle: '[pt-BR] As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: (numOfDays: number) => `[pt-BR] Trial: ${numOfDays} ${numOfDays === 1 ? '[pt-BR] day' : '[pt-BR] days'} left!`,
                subtitle: '[pt-BR] Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: '[pt-BR] Your free trial has ended',
                subtitle: '[pt-BR] Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: '[pt-BR] Claim offer',
                subscriptionPageTitle: (discountType: number) => `[pt-BR] <strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `[pt-BR] Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) =>
                    `[pt-BR] Claim within ${days > 0 ? `[pt-BR] ${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '[pt-BR] Payment',
            subtitle: '[pt-BR] Add a card to pay for your Expensify subscription.',
            addCardButton: '[pt-BR] Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `[pt-BR] Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `[pt-BR] Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `[pt-BR] Card ending in ${cardNumber}`,
            changeCard: '[pt-BR] Change payment card',
            changeCurrency: '[pt-BR] Change payment currency',
            cardNotFound: '[pt-BR] No payment card added',
            retryPaymentButton: '[pt-BR] Retry payment',
            authenticatePayment: '[pt-BR] Authenticate payment',
            requestRefund: '[pt-BR] Request refund',
            requestRefundModal: {
                full: '[pt-BR] Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: '[pt-BR] Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: '[pt-BR] View payment history',
        },
        yourPlan: {
            title: '[pt-BR] Your plan',
            exploreAllPlans: '[pt-BR] Explore all plans',
            customPricing: '[pt-BR] Custom pricing',
            asLowAs: (price: string) => `[pt-BR] as low as ${price} per active member/month`,
            pricePerMemberMonth: (price: string) => `[pt-BR] ${price} per member/month`,
            pricePerMemberPerMonth: (price: string) => `[pt-BR] ${price} per member per month`,
            perMemberMonth: '[pt-BR] per member/month',
            collect: {
                title: '[pt-BR] Collect',
                description: '[pt-BR] The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[pt-BR] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[pt-BR] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[pt-BR] Receipt scanning',
                benefit2: '[pt-BR] Reimbursements',
                benefit3: '[pt-BR] Corporate card management',
                benefit4: '[pt-BR] Expense and travel approvals',
                benefit5: '[pt-BR] Travel booking and rules',
                benefit6: '[pt-BR] QuickBooks/Xero integrations',
                benefit7: '[pt-BR] Chat on expenses, reports, and rooms',
                benefit8: '[pt-BR] AI and human support',
            },
            control: {
                title: '[pt-BR] Control',
                description: '[pt-BR] Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[pt-BR] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[pt-BR] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[pt-BR] Everything in the Collect plan',
                benefit2: '[pt-BR] Multi-level approval workflows',
                benefit3: '[pt-BR] Custom expense rules',
                benefit4: '[pt-BR] ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: '[pt-BR] HR integrations (Workday, Certinia)',
                benefit6: '[pt-BR] SAML/SSO',
                benefit7: '[pt-BR] Custom insights and reporting',
                benefit8: '[pt-BR] Budgeting',
            },
            thisIsYourCurrentPlan: '[pt-BR] This is your current plan',
            downgrade: '[pt-BR] Downgrade to Collect',
            upgrade: '[pt-BR] Upgrade to Control',
            addMembers: '[pt-BR] Add members',
            saveWithExpensifyTitle: '[pt-BR] Save with the Expensify Card',
            saveWithExpensifyDescription: '[pt-BR] Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: '[pt-BR] Learn more',
        },
        compareModal: {
            comparePlans: '[pt-BR] Compare Plans',
            subtitle: `[pt-BR] <muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: '[pt-BR] Subscription details',
            annual: '[pt-BR] Annual subscription',
            taxExempt: '[pt-BR] Request tax exempt status',
            taxExemptEnabled: '[pt-BR] Tax exempt',
            taxExemptStatus: '[pt-BR] Tax exempt status',
            payPerUse: '[pt-BR] Pay-per-use',
            subscriptionSize: '[pt-BR] Subscription size',
            headsUp:
                "[pt-BR] Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: '[pt-BR] Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: '[pt-BR] Subscription size',
            yourSize: '[pt-BR] Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                '[pt-BR] Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: '[pt-BR] Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: '[pt-BR] Confirm your new annual subscription details:',
            subscriptionSize: '[pt-BR] Subscription size',
            activeMembers: (size: number) => `[pt-BR] ${size} active members/month`,
            subscriptionRenews: '[pt-BR] Subscription renews',
            youCantDowngrade: '[pt-BR] You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: (size: number, date: string) =>
                `[pt-BR] You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: '[pt-BR] Please enter a valid subscription size',
                sameSize: '[pt-BR] Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: '[pt-BR] Add payment card',
            enterPaymentCardDetails: '[pt-BR] Enter your payment card details',
            security: '[pt-BR] Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: '[pt-BR] Learn more about our security.',
        },
        expensifyCode: {
            title: '[pt-BR] Expensify code',
            discountCode: '[pt-BR] Discount code',
            enterCode: '[pt-BR] Enter an Expensify code to apply to your subscription.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `[pt-BR] You will get a ${promoDiscount}% discount on your next ${validBillingCycles ? `${validBillingCycles} ` : ''}billing charges.`,
            apply: '[pt-BR] Apply',
            error: {
                invalid: '[pt-BR] This code is invalid',
            },
        },
        subscriptionSettings: {
            title: '[pt-BR] Subscription settings',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `[pt-BR] Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}${expensifyCode ? `[pt-BR] , Expensify code: ${expensifyCode}` : ''}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: '[pt-BR] none',
            on: '[pt-BR] on',
            off: '[pt-BR] off',
            annual: '[pt-BR] Annual',
            autoRenew: '[pt-BR] Auto-renew',
            autoIncrease: '[pt-BR] Auto-increase annual seats',
            saveUpTo: (amountWithCurrency: string) => `[pt-BR] Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                '[pt-BR] Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: '[pt-BR] Disable auto-renew',
            helpUsImprove: '[pt-BR] Help us improve Expensify',
            whatsMainReason: "[pt-BR] What's the main reason you're disabling auto-renew?",
            renewsOn: (date: string) => `[pt-BR] Renews on ${date}.`,
            pricingConfiguration: '[pt-BR] Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `[pt-BR] <muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `[pt-BR] <a href="adminsRoom">#admins room.</a>` : '[pt-BR] #admins room.'}</muted-text>`,
            estimatedPrice: '[pt-BR] Estimated price',
            changesBasedOn: '[pt-BR] This changes based on your Expensify Card usage and the subscription options below.',
            collectBillingDescription: '[pt-BR] Collect workspaces are billed monthly per member, with no annual commitment.',
            pricing: '[pt-BR] Pricing',
        },
        requestEarlyCancellation: {
            title: '[pt-BR] Request early cancellation',
            subtitle: '[pt-BR] What’s the main reason you’re requesting early cancellation?',
            subscriptionCanceled: {
                title: '[pt-BR] Subscription canceled',
                subtitle: '[pt-BR] Your annual subscription has been canceled.',
                info: '[pt-BR] If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `[pt-BR] If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: '[pt-BR] Request submitted',
                subtitle:
                    '[pt-BR] Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `[pt-BR] By requesting early cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: '[pt-BR] Functionality needs improvement',
        tooExpensive: '[pt-BR] Too expensive',
        inadequateSupport: '[pt-BR] Inadequate customer support',
        businessClosing: '[pt-BR] Company closing, downsizing, or acquired',
        additionalInfoTitle: '[pt-BR] What software are you moving to and why?',
        additionalInfoInputLabel: '[pt-BR] Your response',
    },
    roomChangeLog: {
        updateRoomDescription: '[pt-BR] set the room description to:',
        clearRoomDescription: '[pt-BR] cleared the room description',
        changedRoomAvatar: '[pt-BR] changed the room avatar',
        removedRoomAvatar: '[pt-BR] removed the room avatar',
    },
    delegate: {
        switchAccount: '[pt-BR] Switch accounts:',
        copilotDelegatedAccess: '[pt-BR] Copilot: Delegated access',
        copilotDelegatedAccessDescription: '[pt-BR] Allow other members to access your account.',
        learnMoreAboutDelegatedAccess: '[pt-BR] Learn more about delegated access',
        addCopilot: '[pt-BR] Add copilot',
        membersCanAccessYourAccount: '[pt-BR] These members can access your account:',
        youCanAccessTheseAccounts: '[pt-BR] You can access these accounts via the account switcher:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[pt-BR] Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[pt-BR] Limited';
                default:
                    return '';
            }
        },
        genericError: '[pt-BR] Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `[pt-BR] on behalf of ${delegator}`,
        accessLevel: '[pt-BR] Access level',
        confirmCopilot: '[pt-BR] Confirm your copilot below.',
        accessLevelDescription: '[pt-BR] Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[pt-BR] Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[pt-BR] Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: '[pt-BR] Remove copilot',
        removeCopilotConfirmation: '[pt-BR] Are you sure you want to remove this copilot?',
        changeAccessLevel: '[pt-BR] Change access level',
        makeSureItIsYou: "[pt-BR] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[pt-BR] Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `[pt-BR] Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '[pt-BR] Not so fast...',
        noAccessMessage: dedent(`
            [pt-BR] As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `[pt-BR] As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: '[pt-BR] Copilot access',
    },
    debug: {
        debug: '[pt-BR] Debug',
        details: '[pt-BR] Details',
        JSON: '[pt-BR] JSON',
        reportActions: '[pt-BR] Actions',
        reportActionPreview: '[pt-BR] Preview',
        nothingToPreview: '[pt-BR] Nothing to preview',
        editJson: '[pt-BR] Edit JSON:',
        preview: '[pt-BR] Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `[pt-BR] Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `[pt-BR] Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `[pt-BR] Invalid value - Expected: ${expectedValues}`,
        missingValue: '[pt-BR] Missing value',
        createReportAction: '[pt-BR] Create Report Action',
        reportAction: '[pt-BR] Report Action',
        report: '[pt-BR] Report',
        transaction: '[pt-BR] Transaction',
        violations: '[pt-BR] Violations',
        transactionViolation: '[pt-BR] Transaction Violation',
        hint: "[pt-BR] Data changes won't be sent to the backend",
        textFields: '[pt-BR] Text fields',
        numberFields: '[pt-BR] Number fields',
        booleanFields: '[pt-BR] Boolean fields',
        constantFields: '[pt-BR] Constant fields',
        dateTimeFields: '[pt-BR] DateTime fields',
        date: '[pt-BR] Date',
        time: '[pt-BR] Time',
        none: '[pt-BR] None',
        visibleInLHN: '[pt-BR] Visible in LHN',
        GBR: '[pt-BR] GBR',
        RBR: '[pt-BR] RBR',
        true: '[pt-BR] true',
        false: '[pt-BR] false',
        viewReport: '[pt-BR] View Report',
        viewTransaction: '[pt-BR] View transaction',
        createTransactionViolation: '[pt-BR] Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: '[pt-BR] Has draft comment',
            hasGBR: '[pt-BR] Has GBR',
            hasRBR: '[pt-BR] Has RBR',
            pinnedByUser: '[pt-BR] Pinned by member',
            hasIOUViolations: '[pt-BR] Has IOU violations',
            hasAddWorkspaceRoomErrors: '[pt-BR] Has add workspace room errors',
            isUnread: '[pt-BR] Is unread (focus mode)',
            isArchived: '[pt-BR] Is archived (most recent mode)',
            isSelfDM: '[pt-BR] Is self DM',
            isFocused: '[pt-BR] Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: '[pt-BR] Has join request (admin room)',
            isUnreadWithMention: '[pt-BR] Is unread with mention',
            isWaitingForAssigneeToCompleteAction: '[pt-BR] Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: '[pt-BR] Has child report awaiting action',
            hasMissingInvoiceBankAccount: '[pt-BR] Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: '[pt-BR] Has unresolved card fraud alert',
            hasDEWApproveFailed: '[pt-BR] Has DEW approve failed',
        },
        reasonRBR: {
            hasErrors: '[pt-BR] Has errors in report or report actions data',
            hasViolations: '[pt-BR] Has violations',
            hasTransactionThreadViolations: '[pt-BR] Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "[pt-BR] There's a report awaiting action",
            theresAReportWithErrors: "[pt-BR] There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "[pt-BR] There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "[pt-BR] There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: '[pt-BR] There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "[pt-BR] There's a problem with a contact method",
            aContactMethodRequiresVerification: '[pt-BR] A contact method requires verification',
            theresAProblemWithAPaymentMethod: "[pt-BR] There's a problem with a payment method",
            theresAProblemWithAWorkspace: "[pt-BR] There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "[pt-BR] There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "[pt-BR] There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: '[pt-BR] Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: '[pt-BR] There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "[pt-BR] There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "[pt-BR] There's a problem with your wallet terms",
            aBankAccountIsLocked: '[pt-BR] A bank account is locked',
        },
    },
    emptySearchView: {
        takeATestDrive: '[pt-BR] Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: '[pt-BR] Welcome to New Expensify!',
        subtitle: "[pt-BR] It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "[pt-BR] Let's go!",
        helpText: '[pt-BR] Try 2-min demo',
        features: {
            search: '[pt-BR] More powerful search on mobile, web, and desktop',
            concierge: '[pt-BR] Built-in Concierge AI to help automate your expenses',
            chat: '[pt-BR] Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '[pt-BR] <tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '[pt-BR] <tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '[pt-BR] <tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        scanTestTooltip: {
            main: '[pt-BR] <tooltip><strong>Scan our test receipt</strong> to see how it works!</tooltip>',
            manager: '[pt-BR] <tooltip>Choose our <strong>test manager</strong> to try it out!</tooltip>',
            confirmation: '[pt-BR] <tooltip>Now, <strong>submit your expense</strong> and watch the\nmagic happen!</tooltip>',
            tryItOut: '[pt-BR] Try it out',
        },
        outstandingFilter: '[pt-BR] <tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '[pt-BR] <tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "[pt-BR] <tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
        hasFilterNegation: '[pt-BR] <tooltip>Search for expenses without receipts using <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '[pt-BR] Discard changes?',
        body: '[pt-BR] Are you sure you want to discard the changes you made?',
        confirmText: '[pt-BR] Discard changes',
    },
    scheduledCall: {
        book: {
            title: '[pt-BR] Schedule call',
            description: '[pt-BR] Find a time that works for you.',
            slots: ({date}: {date: string}) => `[pt-BR] <muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '[pt-BR] Confirm call',
            description: "[pt-BR] Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: '[pt-BR] Your setup specialist',
            meetingLength: '[pt-BR] Meeting length',
            dateTime: '[pt-BR] Date & time',
            minutes: '[pt-BR] 30 minutes',
        },
        callScheduled: '[pt-BR] Call scheduled',
    },
    autoSubmitModal: {
        title: '[pt-BR] All clear and submitted!',
        description: '[pt-BR] All warnings and violations has been cleared so:',
        submittedExpensesTitle: '[pt-BR] These expenses have been submitted',
        submittedExpensesDescription: '[pt-BR] These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: '[pt-BR] Pending expenses have been moved',
        pendingExpensesDescription: '[pt-BR] Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '[pt-BR] Take a 2-minute test drive',
        },
        modal: {
            title: '[pt-BR] Take us for a test drive',
            description: '[pt-BR] Take a quick product tour to get up to speed fast.',
            confirmText: '[pt-BR] Start test drive',
            helpText: '[pt-BR] Skip',
            employee: {
                description: '[pt-BR] <muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "[pt-BR] Enter your boss's email",
                error: '[pt-BR] That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "[pt-BR] You're currently test driving Expensify",
            readyForTheRealThing: '[pt-BR] Ready for the real thing?',
            getStarted: '[pt-BR] Get started',
        },
        employeeInviteMessage: (name: string) => `[pt-BR] # ${name} invited you to test drive Expensify
Hey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.

Here’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: '[pt-BR] Basic export',
        reportLevelExport: '[pt-BR] All Data - report level',
        expenseLevelExport: '[pt-BR] All Data - expense level',
        exportInProgress: '[pt-BR] Export in progress',
        conciergeWillSend: '[pt-BR] Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: '[pt-BR] Not verified',
        retry: '[pt-BR] Retry',
        verifyDomain: {
            title: '[pt-BR] Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `[pt-BR] Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `[pt-BR] Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: '[pt-BR] Add the following TXT record:',
            saveChanges: '[pt-BR] Save changes and return here to verify your domain.',
            youMayNeedToConsult: `[pt-BR] You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: '[pt-BR] After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: '[pt-BR] Couldn’t fetch verification code',
            genericError: "[pt-BR] We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: '[pt-BR] Domain verified',
            header: '[pt-BR] Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `[pt-BR] <muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: '[pt-BR] SAML',
        samlFeatureList: {
            title: '[pt-BR] SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `[pt-BR] <muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: '[pt-BR] Faster and easier login',
            moreSecurityAndControl: '[pt-BR] More security and control',
            onePasswordForAnything: '[pt-BR] One password for everything',
        },
        goToDomain: '[pt-BR] Go to domain',
        samlLogin: {
            title: '[pt-BR] SAML login',
            subtitle: `[pt-BR] <muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a>.</muted-text>`,
            enableSamlLogin: '[pt-BR] Enable SAML login',
            allowMembers: '[pt-BR] Allow members to log in with SAML.',
            requireSamlLogin: '[pt-BR] Require SAML login',
            anyMemberWillBeRequired: '[pt-BR] Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "[pt-BR] Couldn't update SAML enablement setting",
            requireError: "[pt-BR] Couldn't update SAML requirement setting",
            disableSamlRequired: '[pt-BR] Disable SAML required',
            oktaWarningPrompt: '[pt-BR] Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: '[pt-BR] Please add Identity Provider metadata below to enable',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `[pt-BR] <muted-text>Please disable <a href="${twoFactorAuthSettingsUrl}">force two-factor authentication</a> to enable SAML login.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: '[pt-BR] SAML configuration details',
            subtitle: '[pt-BR] Use these details to get SAML set up.',
            identityProviderMetadata: '[pt-BR] Identity Provider Metadata',
            entityID: '[pt-BR] Entity ID',
            nameIDFormat: '[pt-BR] Name ID Format',
            loginUrl: '[pt-BR] Login URL',
            acsUrl: '[pt-BR] ACS (Assertion Consumer Service) URL',
            logoutUrl: '[pt-BR] Logout URL',
            sloUrl: '[pt-BR] SLO (Single Logout) URL',
            serviceProviderMetaData: '[pt-BR] Service Provider MetaData',
            oktaScimToken: '[pt-BR] Okta SCIM Token',
            revealToken: '[pt-BR] Reveal token',
            fetchError: "[pt-BR] Couldn't fetch SAML configuration details",
            setMetadataGenericError: "[pt-BR] Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: '[pt-BR] Access restricted',
            subtitle: (domainName: string) => `[pt-BR] Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: '[pt-BR] Company card management',
            accountCreationAndDeletion: '[pt-BR] Account creation and deletion',
            workspaceCreation: '[pt-BR] Workspace creation',
            samlSSO: '[pt-BR] SAML SSO',
        },
        addDomain: {
            title: '[pt-BR] Add domain',
            subtitle: '[pt-BR] Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: '[pt-BR] Domain name',
            newDomain: '[pt-BR] New domain',
        },
        domainAdded: {
            title: '[pt-BR] Domain added',
            description: "[pt-BR] Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: '[pt-BR] Configure',
        },
        enhancedSecurity: {
            title: '[pt-BR] Enhanced security',
            subtitle: '[pt-BR] Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: '[pt-BR] Enable',
        },
        domainAdmins: '[pt-BR] Domain admins',
        admins: {
            title: '[pt-BR] Admins',
            findAdmin: '[pt-BR] Find admin',
            primaryContact: '[pt-BR] Primary contact',
            addPrimaryContact: '[pt-BR] Add primary contact',
            setPrimaryContactError: '[pt-BR] Unable to set primary contact. Please try again later.',
            consolidatedDomainBilling: '[pt-BR] Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `[pt-BR] <comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "[pt-BR] Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: '[pt-BR] Add admin',
            addAdminError: '[pt-BR] Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: '[pt-BR] Revoke admin access',
            cantRevokeAdminAccess: "[pt-BR] Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: '[pt-BR] Unable to remove this user as an Admin. Please try again.',
                removeDomain: '[pt-BR] Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: '[pt-BR] Please enter your domain name to reset it.',
            },
            resetDomain: '[pt-BR] Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `[pt-BR] Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: '[pt-BR] Enter your domain name here',
            resetDomainInfo: `[pt-BR] This action is <strong>permanent</strong> and the following data will be deleted: <br/> <bullet-list><bullet-item>Company card connections and any unreported expenses from those cards</bullet-item><bullet-item>SAML and group settings</bullet-item></bullet-list> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        domainMembers: '[pt-BR] Domain members',
        members: {
            title: '[pt-BR] Members',
            findMember: '[pt-BR] Find member',
            addMember: '[pt-BR] Add member',
            emptyMembers: {
                title: '[pt-BR] No members in this group',
                subtitle: '[pt-BR] Add a member or try changing the filter above.',
            },
            allMembers: '[pt-BR] All members',
            email: '[pt-BR] Email address',
            closeAccountPrompt: '[pt-BR] Are you sure? This action is permanent.',
            forceCloseAccount: () => ({
                one: '[pt-BR] Force close account',
                other: '[pt-BR] Force close accounts',
            }),
            safeCloseAccount: () => ({
                one: '[pt-BR] Close account safely',
                other: '[pt-BR] Close accounts safely',
            }),
            closeAccountInfo: () => ({
                one: '[pt-BR] We recommend closing the account safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected account.',
                other: '[pt-BR] We recommend closing the accounts safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected accounts.',
            }),
            closeAccount: () => ({
                one: '[pt-BR] Close account',
                other: '[pt-BR] Close accounts',
            }),
            error: {
                addMember: '[pt-BR] Unable to add this member. Please try again.',
                removeMember: '[pt-BR] Unable to remove this user. Please try again.',
                vacationDelegate: '[pt-BR] Unable to set this user as a vacation delegate. Please try again.',
            },
            cannotSetVacationDelegateForMember: (email: string) => `[pt-BR] You can't set a vacation delegate for ${email} because they're currently the delegate for the following members:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `[pt-BR] Are you sure? This will lock <strong>${email}'s</strong> account. <br /><br /> Our team will then review the account and remove any unauthorized access. To regain access, they'll need to work with Concierge.`,
            reportSuspiciousActivityConfirmationPrompt: '[pt-BR] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        },
        common: {
            settings: '[pt-BR] Settings',
            forceTwoFactorAuth: '[pt-BR] Force two-factor authentication',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `[pt-BR] <muted-text>Please disable <a href="${samlPageUrl}">SAML</a> to force two-factor authentication.</muted-text>`,
            forceTwoFactorAuthDescription: `[pt-BR] <muted-text>Require two-factor authentication for all members of this domain. Domain members will be prompted to set up two-factor authentication on their account when they sign in.</muted-text>`,
            forceTwoFactorAuthError: "[pt-BR] Force two-factor authentication couldn't be changed. Please try again later.",
            resetTwoFactorAuth: '[pt-BR] Reset two-factor authentication',
        },
        groups: {
            title: '[pt-BR] Groups',
            memberCount: () => {
                return {
                    one: '[pt-BR] 1 member',
                    other: (count: number) => `[pt-BR] ${count} members`,
                };
            },
        },
    },
};
export default translations;
