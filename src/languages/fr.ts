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
        count: '[fr][ctx: Used as a noun meaning a numerical total or quantity, not the verb “to count.”] Count',
        cancel: '[fr] Cancel',
        dismiss: '[fr][ctx: Refers to closing or hiding a notification or message, not rejecting or ignoring something.] Dismiss',
        proceed: '[fr][ctx: Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”] Proceed',
        unshare: '[fr] Unshare',
        yes: '[fr] Yes',
        no: '[fr] No',
        ok: '[fr][ctx: Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.] OK',
        notNow: '[fr] Not now',
        noThanks: '[fr] No thanks',
        learnMore: '[fr] Learn more',
        buttonConfirm: '[fr] Got it',
        name: '[fr] Name',
        attachment: '[fr] Attachment',
        attachments: '[fr] Attachments',
        center: '[fr] Center',
        from: '[fr] From',
        to: '[fr] To',
        in: '[fr] In',
        optional: '[fr] Optional',
        new: '[fr] New',
        newFeature: '[fr] New feature',
        search: '[fr] Search',
        reports: '[fr] Spend',
        find: '[fr] Find',
        searchWithThreeDots: '[fr] Search...',
        next: '[fr] Next',
        previous: '[fr] Previous',
        previousMonth: '[fr] Previous month',
        nextMonth: '[fr] Next month',
        previousYear: '[fr] Previous year',
        nextYear: '[fr] Next year',
        goBack: '[fr][ctx: Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.] Go back',
        create: '[fr] Create',
        add: '[fr] Add',
        resend: '[fr] Resend',
        save: '[fr] Save',
        select: '[fr] Select',
        deselect: '[fr] Deselect',
        selectMultiple: '[fr][ctx: Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.] Select multiple',
        saveChanges: '[fr] Save changes',
        submit: '[fr] Submit',
        submitted: '[fr][ctx: Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”] Submitted',
        rotate: '[fr] Rotate',
        zoom: '[fr] Zoom',
        password: '[fr] Password',
        magicCode: '[fr] Magic code',
        digits: '[fr] digits',
        twoFactorCode: '[fr] Two-factor code',
        workspaces: '[fr] Workspaces',
        home: '[fr] Home',
        inbox: '[fr] Inbox',
        yourReviewIsRequired: '[fr] Your review is required',
        actionBadge: {
            submit: '[fr] Submit',
            approve: '[fr] Approve',
            pay: '[fr] Pay',
            fix: '[fr] Fix',
        },
        success: '[fr][ctx: Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”] Success',
        group: '[fr] Group',
        profile: '[fr] Profile',
        referral: '[fr] Referral',
        payments: '[fr] Payments',
        approvals: '[fr] Approvals',
        wallet: '[fr] Wallet',
        preferences: '[fr] Preferences',
        view: '[fr] View',
        review: (amount?: string) => `[fr] Review${amount ? ` ${amount}` : ''}`,
        not: '[fr] Not',
        signIn: '[fr] Sign in',
        signInWithGoogle: '[fr] Sign in with Google',
        signInWithApple: '[fr] Sign in with Apple',
        signInWith: '[fr] Sign in with',
        continue: '[fr] Continue',
        firstName: '[fr] First name',
        lastName: '[fr] Last name',
        scanning: '[fr] Scanning',
        analyzing: '[fr] Analyzing...',
        thinking: '[fr] Concierge is thinking...',
        addCardTermsOfService: '[fr] Expensify Terms of Service',
        perPerson: '[fr] per person',
        phone: '[fr] Phone',
        phoneNumber: '[fr] Phone number',
        phoneNumberPlaceholder: '[fr] (xxx) xxx-xxxx',
        email: '[fr] Email',
        and: '[fr] and',
        or: '[fr] or',
        details: '[fr] Details',
        privacy: '[fr] Privacy',
        privacyPolicy: '[fr] Privacy Policy',
        hidden: '[fr] Hidden',
        visible: '[fr] Visible',
        delete: '[fr] Delete',
        archived: '[fr][ctx: UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.] archived',
        contacts: '[fr] Contacts',
        recents: '[fr] Recents',
        close: '[fr] Close',
        comment: '[fr] Comment',
        download: '[fr] Download',
        downloading: '[fr] Downloading',
        uploading: '[fr][ctx: Indicates that a file is currently being uploaded (sent to the server), not downloaded.] Uploading',
        pin: '[fr][ctx: as a verb, not a noun] Pin',
        unPin: '[fr] Unpin',
        back: '[fr] Back',
        saveAndContinue: '[fr] Save & continue',
        settings: '[fr] Settings',
        termsOfService: '[fr] Terms of Service',
        members: '[fr] Members',
        invite: '[fr] Invite',
        here: '[fr] here',
        date: '[fr] Date',
        dob: '[fr] Date of birth',
        currentYear: '[fr] Current year',
        currentMonth: '[fr] Current month',
        ssnLast4: '[fr] Last 4 digits of SSN',
        ssnFull9: '[fr] Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `[fr] Address line ${lineNumber}`,
        personalAddress: '[fr] Personal address',
        companyAddress: '[fr] Company address',
        noPO: '[fr] No PO boxes or mail-drop addresses, please.',
        city: '[fr] City',
        state: '[fr] State',
        streetAddress: '[fr] Street address',
        stateOrProvince: '[fr] State / Province',
        country: '[fr] Country',
        zip: '[fr] Zip code',
        zipPostCode: '[fr] Zip / Postcode',
        whatThis: "[fr] What's this?",
        iAcceptThe: '[fr] I accept the ',
        acceptTermsAndPrivacy: `[fr] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `[fr] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `[fr] I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: "[fr] You can't export an empty report.",
            other: () => `[fr] You can't export empty reports.`,
        }),
        remove: '[fr] Remove',
        admin: '[fr] Admin',
        owner: '[fr] Owner',
        dateFormat: '[fr] YYYY-MM-DD',
        send: '[fr] Send',
        na: '[fr] N/A',
        noResultsFound: '[fr] No results found',
        noResultsFoundMatching: (searchString: string) => `[fr] No results found matching "${searchString}"`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `[fr] Suggestions available for "${searchString}".` : '[fr] Suggestions available.'),
        recentDestinations: '[fr] Recent destinations',
        timePrefix: "[fr] It's",
        conjunctionFor: '[fr] for',
        todayAt: '[fr] Today at',
        tomorrowAt: '[fr] Tomorrow at',
        yesterdayAt: '[fr] Yesterday at',
        conjunctionAt: '[fr] at',
        conjunctionTo: '[fr] to',
        genericErrorMessage: '[fr] Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: '[fr] Percentage',
        progressBarLabel: '[fr] Onboarding progress',
        converted: '[fr] Converted',
        error: {
            invalidAmount: '[fr] Invalid amount',
            acceptTerms: '[fr] You must accept the Terms of Service to continue',
            phoneNumber: `[fr] Please enter a complete phone number
(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '[fr] This field is required',
            requestModified: '[fr] This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `[fr] Character limit exceeded (${length}/${limit})`,
            dateInvalid: '[fr] Please select a valid date',
            invalidDateShouldBeFuture: '[fr] Please choose today or a future date',
            invalidTimeShouldBeFuture: '[fr] Please choose a time at least one minute ahead',
            invalidCharacter: '[fr] Invalid character',
            enterMerchant: '[fr] Enter a merchant name',
            enterAmount: '[fr] Enter an amount',
            missingMerchantName: '[fr] Missing merchant name',
            missingAmount: '[fr] Missing amount',
            missingDate: '[fr] Missing date',
            enterDate: '[fr] Enter a date',
            invalidTimeRange: '[fr] Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: '[fr] Please complete the form above to continue',
            pleaseSelectOne: '[fr] Please select an option above',
            invalidRateError: '[fr] Please enter a valid rate',
            lowRateError: '[fr] Rate must be greater than 0',
            email: '[fr] Please enter a valid email address',
            login: '[fr] An error occurred while logging in. Please try again.',
        },
        comma: '[fr] comma',
        semicolon: '[fr] semicolon',
        please: '[fr] Please',
        contactUs: '[fr][ctx: Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.] contact us',
        pleaseEnterEmailOrPhoneNumber: '[fr] Please enter an email or phone number',
        fixTheErrors: '[fr][ctx: Instruction prompting the user to correct multiple issues. Should use imperative form when translated.] fix the errors',
        inTheFormBeforeContinuing: '[fr] in the form before continuing',
        confirm: '[fr] Confirm',
        reset: '[fr] Reset',
        done: '[fr][ctx: Status or button indicating that an action or process has been completed. Should reflect completion.] Done',
        more: '[fr] More',
        debitCard: '[fr] Debit card',
        bankAccount: '[fr] Bank account',
        personalBankAccount: '[fr] Personal bank account',
        businessBankAccount: '[fr] Business bank account',
        join: '[fr] Join',
        leave: '[fr] Leave',
        decline: '[fr] Decline',
        reject: '[fr] Reject',
        transferBalance: '[fr] Transfer balance',
        enterManually: '[fr][ctx: Instruction telling the user to input data manually. Refers to entering text or values in a field.] Enter it manually',
        message: '[fr] Message',
        leaveThread: '[fr] Leave thread',
        you: '[fr] You',
        me: '[fr][ctx: Refers to the current user in the UI. Should follow capitalization rules for labels] me',
        youAfterPreposition: '[fr] you',
        your: '[fr] your',
        conciergeHelp: '[fr] Please reach out to Concierge for help.',
        youAppearToBeOffline: '[fr] You appear to be offline.',
        thisFeatureRequiresInternet: '[fr] This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: '[fr] Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: '[fr] An error occurred while trying to play this video.',
        areYouSure: '[fr] Are you sure?',
        verify: '[fr] Verify',
        yesContinue: '[fr] Yes, continue',
        websiteExample: '[fr][ctx: Provides an example format for a website URL.] e.g. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `[fr][ctx: Provides an example format for a ZIP] e.g. ${zipSampleFormat}` : ''),
        description: '[fr] Description',
        title: '[fr] Title',
        assignee: '[fr] Assignee',
        createdBy: '[fr] Created by',
        with: '[fr] with',
        shareCode: '[fr] Share code',
        share: '[fr] Share',
        per: '[fr] per',
        mi: '[fr][ctx: Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.] mile',
        km: '[fr] kilometer',
        milesAbbreviated: '[fr] mi',
        kilometersAbbreviated: '[fr] km',
        copied: '[fr] Copied!',
        someone: '[fr] Someone',
        total: '[fr] Total',
        edit: '[fr] Edit',
        letsDoThis: `[fr] Let's do this!`,
        letsStart: `[fr] Let's start`,
        showMore: '[fr] Show more',
        showLess: '[fr] Show less',
        merchant: '[fr] Merchant',
        change: '[fr] Change',
        category: '[fr] Category',
        report: '[fr] Report',
        billable: '[fr] Billable',
        nonBillable: '[fr] Non-billable',
        tag: '[fr] Tag',
        receipt: '[fr] Receipt',
        verified: '[fr] Verified',
        replace: '[fr] Replace',
        distance: '[fr] Distance',
        mile: '[fr] mile',
        miles: '[fr][ctx: Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.] miles',
        kilometer: '[fr] kilometer',
        kilometers: '[fr] kilometers',
        recent: '[fr] Recent',
        all: '[fr] All',
        am: '[fr] AM',
        pm: '[fr] PM',
        tbd: "[fr][ctx: Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.] TBD",
        selectCurrency: '[fr] Select a currency',
        selectSymbolOrCurrency: '[fr] Select a symbol or currency',
        card: '[fr] Card',
        whyDoWeAskForThis: '[fr] Why do we ask for this?',
        required: '[fr] Required',
        automatic: '[fr] Automatic',
        showing: '[fr] Showing',
        of: '[fr] of',
        default: '[fr] Default',
        update: '[fr] Update',
        member: '[fr] Member',
        auditor: '[fr] Auditor',
        role: '[fr] Role',
        roleCannotBeChanged: (workflowsLinkPage: string) => `[fr] Role can't be changed because this member is a <a href="${workflowsLinkPage}">payer</a> on this workspace.`,
        currency: '[fr] Currency',
        groupCurrency: '[fr] Group currency',
        rate: '[fr] Rate',
        emptyLHN: {
            title: '[fr] Woohoo! All caught up.',
            subtitleText1: '[fr] Find a chat using the',
            subtitleText2: '[fr] button above, or create something using the',
            subtitleText3: '[fr] button below.',
        },
        businessName: '[fr] Business name',
        clear: '[fr] Clear',
        type: '[fr] Type',
        reportName: '[fr] Report name',
        action: '[fr] Action',
        expenses: '[fr] Expenses',
        totalSpend: '[fr] Total spend',
        tax: '[fr] Tax',
        shared: '[fr] Shared',
        drafts: '[fr] Drafts',
        draft: '[fr][ctx: as a noun, not a verb] Draft',
        finished: '[fr] Finished',
        upgrade: '[fr] Upgrade',
        downgradeWorkspace: '[fr] Downgrade workspace',
        companyID: '[fr] Company ID',
        userID: '[fr] User ID',
        disable: '[fr] Disable',
        export: '[fr] Export',
        initialValue: '[fr] Initial value',
        currentDate: '[fr][ctx: UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.] Current date',
        value: '[fr] Value',
        downloadFailedTitle: '[fr] Download failed',
        downloadFailedDescription: "[fr] Your download couldn't be completed. Please try again later.",
        filterLogs: '[fr] Filter Logs',
        network: '[fr] Network',
        reportID: '[fr] Report ID',
        longReportID: '[fr] Long Report ID',
        withdrawalID: '[fr] Withdrawal ID',
        withdrawalStatus: '[fr] Withdrawal status',
        bankAccounts: '[fr] Bank accounts',
        chooseFile: '[fr] Choose file',
        chooseFiles: '[fr] Choose files',
        dropTitle: '[fr][ctx: Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.] Let it go',
        dropMessage: '[fr][ctx: Instruction for dropping one or more files into an upload area.] Drop your file here',
        ignore: '[fr] Ignore',
        enabled: '[fr] Enabled',
        disabled: '[fr] Disabled',
        import: '[fr][ctx: Action button for importing a file or data. Should use the verb form, not the noun form.] Import',
        offlinePrompt: "[fr] You can't take this action right now.",
        outstanding: '[fr][ctx: meaning "remaining to be paid, done, or dealt with", not "exceptionally good"] Outstanding',
        chats: '[fr] Chats',
        tasks: '[fr] Tasks',
        unread: '[fr] Unread',
        sent: '[fr] Sent',
        links: '[fr] Links',
        day: '[fr][ctx: Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).] day',
        days: '[fr] days',
        rename: '[fr] Rename',
        address: '[fr] Address',
        hourAbbreviation: '[fr] h',
        minuteAbbreviation: '[fr] m',
        secondAbbreviation: '[fr] s',
        skip: '[fr] Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `[fr] Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: '[fr] Chat now',
        workEmail: '[fr] Work email',
        destination: '[fr] Destination',
        subrate: '[fr][ctx: Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.] Subrate',
        perDiem: '[fr] Per diem',
        validate: '[fr] Validate',
        downloadAsPDF: '[fr] Download as PDF',
        downloadAsCSV: '[fr] Download as CSV',
        print: '[fr] Print',
        help: '[fr] Help',
        collapsed: '[fr] Collapsed',
        expanded: '[fr] Expanded',
        expenseReport: '[fr] Expense Report',
        expenseReports: '[fr] Expense Reports',
        rateOutOfPolicy: '[fr][ctx: Rate as a noun, not a verb] Rate out of policy',
        leaveWorkspace: '[fr] Leave workspace',
        leaveWorkspaceConfirmation: "[fr] If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "[fr] If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "[fr] If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `[fr] If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `[fr] If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `[fr] If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "[fr] You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: '[fr] Reimbursable',
        editYourProfile: '[fr] Edit your profile',
        comments: '[fr] Comments',
        sharedIn: '[fr] Shared in',
        unreported: '[fr] Unreported',
        explore: '[fr] Explore',
        insights: '[fr] Insights',
        todo: '[fr] To-do',
        invoice: '[fr] Invoice',
        expense: '[fr] Expense',
        chat: '[fr] Chat',
        task: '[fr] Task',
        trip: '[fr] Trip',
        apply: '[fr] Apply',
        status: '[fr] Status',
        on: '[fr] On',
        before: '[fr] Before',
        after: '[fr] After',
        range: '[fr] Range',
        reschedule: '[fr] Reschedule',
        general: '[fr] General',
        workspacesTabTitle: '[fr] Workspaces',
        headsUp: '[fr] Heads up!',
        submitTo: '[fr] Submit to',
        forwardTo: '[fr] Forward to',
        approvalLimit: '[fr] Approval limit',
        overLimitForwardTo: '[fr] Over limit forward to',
        merge: '[fr] Merge',
        none: '[fr] None',
        unstableInternetConnection: '[fr] Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: '[fr] Enable Global Reimbursements',
        purchaseAmount: '[fr] Purchase amount',
        originalAmount: '[fr] Original amount',
        frequency: '[fr] Frequency',
        link: '[fr] Link',
        pinned: '[fr] Pinned',
        read: '[fr] Read',
        copyToClipboard: '[fr] Copy to clipboard',
        thisIsTakingLongerThanExpected: '[fr] This is taking longer than expected...',
        domains: '[fr] Domains',
        actionRequired: '[fr] Action required',
        duplicate: '[fr] Duplicate',
        duplicated: '[fr] Duplicated',
        duplicateExpense: '[fr] Duplicate expense',
        duplicateReport: '[fr] Duplicate report',
        copyOfReportName: (reportName: string) => `[fr] Copy of ${reportName}`,
        exchangeRate: '[fr] Exchange rate',
        reimbursableTotal: '[fr] Reimbursable total',
        nonReimbursableTotal: '[fr] Non-reimbursable total',
        opensInNewTab: '[fr] Opens in a new tab',
        locked: '[fr] Locked',
        month: '[fr] Month',
        week: '[fr] Week',
        year: '[fr] Year',
        quarter: '[fr] Quarter',
        concierge: {
            sidePanelGreeting: '[fr] Hi there, how can I help?',
            showHistory: '[fr] Show history',
        },
        vacationDelegate: '[fr] Vacation delegate',
        expensifyLogo: '[fr] Expensify logo',
        approver: '[fr] Approver',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `[fr] enter digit ${digitIndex} of ${totalDigits}`,
    },
    socials: {
        podcast: '[fr] Follow us on Podcast',
        twitter: '[fr] Follow us on Twitter',
        instagram: '[fr] Follow us on Instagram',
        facebook: '[fr] Follow us on Facebook',
        linkedin: '[fr] Follow us on LinkedIn',
    },
    concierge: {
        collapseReasoning: '[fr] Collapse reasoning',
        expandReasoning: '[fr] Expand reasoning',
    },
    supportalNoAccess: {
        title: '[fr] Not so fast',
        descriptionWithCommand: (command?: string) =>
            `[fr] You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: '[fr] Locked Account',
        description: "[fr] You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: '[fr] Use current location',
        notFound: '[fr] We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "[fr] It looks like you've denied access to your location.",
        please: '[fr] Please',
        allowPermission: '[fr] allow location access in settings',
        tryAgain: '[fr] and try again.',
    },
    contact: {
        importContacts: '[fr] Import contacts',
        importContactsTitle: '[fr] Import your contacts',
        importContactsText: '[fr] Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: '[fr] so your favorite people are always a tap away.',
        importContactsNativeText: '[fr] Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: '[fr] Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '[fr] Camera access',
        expensifyDoesNotHaveAccessToCamera: "[fr] Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: '[fr] Attachment error',
        errorWhileSelectingAttachment: '[fr] An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: '[fr] An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: '[fr] Take photo',
        chooseFromGallery: '[fr] Choose from gallery',
        chooseDocument: '[fr] Choose file',
        attachmentTooLarge: '[fr] Attachment is too large',
        sizeExceeded: '[fr] Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `[fr] Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: '[fr] Attachment is too small',
        sizeNotMet: '[fr] Attachment size must be greater than 240 bytes',
        wrongFileType: '[fr] Invalid file type',
        notAllowedExtension: '[fr] This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: '[fr] Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: '[fr] Password-protected PDF is not supported',
        attachmentImageResized: '[fr] This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: '[fr] This image is too large to preview before uploading.',
        imageDimensionsTooLarge: '[fr] Image dimensions are too large to process. Please use a smaller image.',
        tooManyFiles: (fileLimit: number) => `[fr] You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `[fr] Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "[fr] Some files can't be uploaded",
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `[fr] Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "[fr] You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `[fr] ${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: '[fr] Learn more about supported formats.',
        passwordProtected: "[fr] Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: '[fr] Add attachments',
        addReceipt: '[fr] Add receipt',
        scanReceipts: '[fr] Scan receipts',
        replaceReceipt: '[fr] Replace receipt',
    },
    filePicker: {
        fileError: '[fr] File error',
        errorWhileSelectingFile: '[fr] An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: '[fr] Connection complete',
        supportingText: '[fr] You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: '[fr] Edit photo',
        description: '[fr] Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: '[fr] No extension found for mime type',
        problemGettingImageYouPasted: '[fr] There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `[fr] The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `[fr] The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: '[fr] Update app',
        updatePrompt: '[fr] A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: '[fr] Launching Expensify',
        expired: '[fr] Your session has expired.',
        signIn: '[fr] Please sign in again.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: '[fr] Review transaction',
            pleaseReview: '[fr] Please review this transaction',
            requiresYourReview: '[fr] An Expensify Card transaction requires your review.',
            transactionDetails: '[fr] Transaction details',
            attemptedTransaction: '[fr] Attempted transaction',
            deny: '[fr] Deny',
            approve: '[fr] Approve',
            denyTransaction: '[fr] Deny transaction',
            transactionDenied: '[fr] Transaction denied',
            transactionApproved: '[fr] Transaction approved!',
            areYouSureToDeny: '[fr] Are you sure? The transaction will be denied if you close this screen.',
            youCanTryAgainAtMerchantOrReachOut:
                "[fr] You can try again at the merchant. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            youNeedToTryAgainAtMerchant: "[fr] This transaction was not verified, so we denied it. You'll need to try again at the merchant.",
            goBackToTheMerchant: '[fr] Return to the merchant site to continue the transaction.',
            transactionFailed: '[fr] Transaction failed',
            transactionCouldNotBeCompleted: '[fr] Your transaction could not be completed. Please try again at the merchant.',
            transactionCouldNotBeCompletedReachOut:
                "[fr] Your transaction could not be completed. If you didn't attempt this transaction, <concierge-link>reach out to Concierge</concierge-link> to report potential fraud.",
            reviewFailed: '[fr] Review failed',
            alreadyReviewedSubtitle:
                '[fr] You already reviewed this transaction. Please check your <transaction-history-link>transaction history</transaction-history-link> or contact <concierge-link>Concierge</concierge-link> to report any issues.',
        },
        unsupportedDevice: {
            unsupportedDevice: '[fr] Unsupported device',
            pleaseDownloadMobileApp: `[fr] This action is not supported on your device. Please download the Expensify app from the <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> or <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> and try again.`,
            pleaseUseWebApp: `[fr] This action is not supported on your device. Please use the <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify web app</a> and try again.`,
        },
        biometricsTest: {
            biometricsTest: '[fr] Biometrics test',
            authenticationSuccessful: '[fr] Authentication successful',
            successfullyAuthenticatedUsing: (authType?: string) => `[fr] You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `[fr] Biometrics (${status})`,
            statusNeverRegistered: '[fr] Never registered',
            statusNotRegistered: '[fr] Not registered',
            statusRegisteredOtherDevice: () => ({one: '[fr] Another device registered', other: '[fr] Other devices registered'}),
            statusRegisteredThisDevice: '[fr] Registered',
            yourAttemptWasUnsuccessful: '[fr] Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: '[fr] You couldn’t be authenticated',
            areYouSureToReject: '[fr] Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: '[fr] Reject authentication',
            test: '[fr] Test',
            biometricsAuthentication: '[fr] Biometric authentication',
            authType: {
                unknown: '[fr] Unknown',
                none: '[fr] None',
                credentials: '[fr] Credentials',
                biometrics: '[fr] Biometrics',
                faceId: '[fr] Face ID',
                touchId: '[fr] Touch ID',
                opticId: '[fr] Optic ID',
                passkey: '[fr] Passkey',
            },
        },
        pleaseEnableInSystemSettings: {
            start: '[fr] Please enable face/fingerprint verification or set a device passcode in your ',
            link: '[fr] system settings',
            end: '.',
        },
        oops: '[fr] Oops, something went wrong',
        verificationFailed: '[fr] Verification failed',
        looksLikeYouRanOutOfTime: '[fr] Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: '[fr] You ran out of time',
        letsVerifyItsYou: '[fr] Let’s verify it’s you',
        nowLetsAuthenticateYou: "[fr] Now, let's authenticate you...",
        letsAuthenticateYou: "[fr] Let's authenticate you...",
        verifyYourself: {
            biometrics: '[fr] Verify yourself with your face or fingerprint',
            passkeys: '[fr] Verify yourself with a passkey',
        },
        enableQuickVerification: {
            biometrics: '[fr] Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
            passkeys: '[fr] Enable quick, secure verification using a passkey. No passwords or codes required.',
        },
        revoke: {
            revoke: '[fr] Revoke',
            title: '[fr] Face/fingerprint & passkeys',
            explanation:
                '[fr] Face/fingerprint or passkey verification are enabled on one or more devices. Revoking access will require a magic code for the next verification on that device.',
            confirmationPrompt: "[fr] Are you sure? You'll need a magic code for the next verification on that device.",
            confirmationPromptThisDevice: "[fr] Are you sure? You'll need a magic code for the next verification on this device.",
            confirmationPromptMultiple: "[fr] Are you sure? You'll need a magic code for the next verification on those devices.",
            confirmationPromptAll: "[fr] Are you sure? You'll need a magic code for the next verification on any device.",
            cta: '[fr] Revoke access',
            ctaAll: '[fr] Revoke all',
            noDevices: "[fr] You don't have any devices registered for face/fingerprint or passkey verification. If you register any, you will be able to revoke that access here.",
            dismiss: '[fr] Got it',
            error: '[fr] Request failed. Try again later.',
            thisDevice: '[fr] This device',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['[fr] One', '[fr] Two', '[fr] Three', '[fr] Four', '[fr] Five', '[fr] Six', '[fr] Seven', '[fr] Eight', '[fr] Nine'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `[fr] ${displayCount} other ${otherDeviceCount === 1 ? '[fr] device' : '[fr] devices'}`;
            },
        },
        setPin: {
            didNotShipCard: "[fr] We didn't ship your card. Please try again.",
        },
        revealPin: {
            couldNotReveal: "[fr] We couldn't reveal your PIN. Please try again.",
        },
        changePin: {
            didNotChange: "[fr] We didn't change your PIN. Please try again.",
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            [fr] Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: '[fr] Head back to your original tab to continue.',
        title: "[fr] Here's your magic code",
        description: dedent(`
            [fr] Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            [fr] Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: '[fr] , or',
        signInHere: '[fr] just sign in here',
        expiredCodeTitle: '[fr] Magic code expired',
        expiredCodeDescription: '[fr] Go back to the original device and request a new code',
        successfulNewCodeRequest: '[fr] Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            [fr] Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            [fr] Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: '[fr] request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: '[fr] Paid by',
        whatsItFor: "[fr] What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: '[fr] Name, email, or phone number',
        findMember: '[fr] Find a member',
        searchForSomeone: '[fr] Search for someone',
        userSelected: (username: string) => `[fr] ${username} selected`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '[fr] Submit an expense, refer your team',
            subtitleText: "[fr] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '[fr] Book a call',
    },
    hello: '[fr] Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '[fr] Get started below.',
        anotherLoginPageIsOpen: '[fr] Another login page is open.',
        anotherLoginPageIsOpenExplanation: "[fr] You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: '[fr] Welcome!',
        welcomeWithoutExclamation: '[fr] Welcome',
        phrase2: "[fr] Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: '[fr] Your payments get to you as fast as you can get your point across.',
        enterPassword: '[fr] Please enter your password',
        welcomeNewFace: (login: string) => `[fr] ${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: (login: string) => `[fr] Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '[fr] Travel and expense, at the speed of chat',
            body: '[fr] Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: '[fr] Continue logging in with single sign-on:',
        orContinueWithMagicCode: '[fr] You can also sign in with a magic code',
        useSingleSignOn: '[fr] Use single sign-on',
        useMagicCode: '[fr] Use magic code',
        launching: '[fr] Launching...',
        oneMoment: "[fr] One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: '[fr] Drop to upload',
        sendAttachment: '[fr] Send attachment',
        addAttachment: '[fr] Add attachment',
        writeSomething: '[fr] Write something...',
        blockedFromConcierge: '[fr] Communication is barred',
        askConciergeToUpdate: '[fr] Try "Update an expense"...',
        askConciergeToCorrect: '[fr] Try "Correct an expense"...',
        askConciergeForHelp: '[fr] Ask Concierge AI for help...',
        fileUploadFailed: '[fr] Upload failed. File is not supported.',
        localTime: (user: string, time: string) => `[fr] It's ${time} for ${user}`,
        edited: '[fr] (edited)',
        emoji: '[fr] Emoji',
        collapse: '[fr] Collapse',
        expand: '[fr] Expand',
    },
    reportActionContextMenu: {
        copyMessage: '[fr] Copy message',
        copied: '[fr] Copied!',
        copyLink: '[fr] Copy link',
        copyURLToClipboard: '[fr] Copy URL to clipboard',
        copyEmailToClipboard: '[fr] Copy email to clipboard',
        markAsUnread: '[fr] Mark as unread',
        markAsRead: '[fr] Mark as read',
        editAction: ({action}: EditActionParams) => `[fr] Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '[fr] expense' : '[fr] comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = '[fr] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[fr] Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = '[fr] comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `[fr] Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: '[fr] Only visible to',
        explain: '[fr] Explain',
        explainMessage: '[fr] Please explain this to me.',
        replyInThread: '[fr] Reply in thread',
        joinThread: '[fr] Join thread',
        leaveThread: '[fr] Leave thread',
        copyOnyxData: '[fr] Copy Onyx data',
        flagAsOffensive: '[fr] Flag as offensive',
        menu: '[fr] Menu',
    },
    emojiReactions: {
        addReactionTooltip: '[fr] Add reaction',
        reactedWith: '[fr] reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `[fr] You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `[fr] This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `[fr] This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `[fr] This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `[fr] This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `[fr] This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `[fr] This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `[fr] This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: '[fr] This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "[fr] Welcome! Let's get you set up.",
        chatWithAccountManager: '[fr] Chat with your account manager here',
        askMeAnything: '[fr] Ask me anything!',
        sayHello: '[fr] Say hello!',
        yourSpace: '[fr] Your space',
        welcomeToRoom: (roomName: string) => `[fr] Welcome to ${roomName}!`,
        usePlusButton: (additionalText: string) => `[fr]  Use the + button to ${additionalText} an expense.`,
        askConcierge: '[fr] This is your chat with Concierge, your personal AI agent. I can do almost anything, try me!',
        conciergeSupport: '[fr] Your personal AI agent',
        create: '[fr] create',
        iouTypes: {
            pay: '[fr] pay',
            split: '[fr] split',
            submit: '[fr] submit',
            track: '[fr] track',
            invoice: '[fr] invoice',
        },
    },
    adminOnlyCanPost: '[fr] Only admins can send messages in this room.',
    reportAction: {
        asCopilot: '[fr] as copilot for',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `[fr] created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `[fr] created this report for any held expenses from deleted report #${reportID}`
                : `[fr] created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: '[fr] Notify everyone in this conversation',
    },
    newMessages: '[fr] New messages',
    latestMessages: '[fr] Latest messages',
    youHaveBeenBanned: "[fr] Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: '[fr] is typing...',
        areTyping: '[fr] are typing...',
        multipleMembers: '[fr] Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '[fr] This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `[fr] This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `[fr] This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `[fr] This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `[fr] This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[fr] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `[fr] This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '[fr] This booking is archived.',
    },
    writeCapabilityPage: {
        label: '[fr] Who can post',
        writeCapability: {
            all: '[fr] All members',
            admins: '[fr] Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: '[fr] Find something...',
        buttonMySettings: '[fr] My settings',
        fabNewChat: '[fr] Start chat',
        fabNewChatExplained: '[fr] Open actions menu',
        fabScanReceiptExplained: '[fr] Scan receipt',
        chatPinned: '[fr] Chat pinned',
        draftedMessage: '[fr] Drafted message',
        listOfChatMessages: '[fr] List of chat messages',
        listOfChats: '[fr] List of chats',
        saveTheWorld: '[fr] Save the world',
        tooltip: '[fr] Get started here!',
        redirectToExpensifyClassicModal: {
            title: '[fr] Coming soon',
            description: "[fr] We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        },
    },
    homePage: {
        forYou: '[fr] For you',
        timeSensitiveSection: {
            title: '[fr] Time sensitive',
            ctaFix: '[fr] Fix',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `[fr] Fix ${feedName} company card connection` : '[fr] Fix company card connection'),
                defaultSubtitle: '[fr] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `[fr] Fix ${cardName} personal card connection` : '[fr] Fix personal card connection'),
                subtitle: '[fr] Wallet',
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `[fr] Fix ${integrationName} connection`,
                defaultSubtitle: '[fr] Workspace',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: '[fr] We need your shipping address',
                subtitle: '[fr] Provide an address to receive your Expensify Card.',
                cta: '[fr] Add address',
            },
            addPaymentCard: {
                title: '[fr] Add a payment card to keep using Expensify',
                subtitle: '[fr] Account > Subscription',
                cta: '[fr] Add',
            },
            activateCard: {
                title: '[fr] Activate your Expensify Card',
                subtitle: '[fr] Validate your card and start spending.',
                cta: '[fr] Activate',
            },
            reviewCardFraud: {
                title: '[fr] Review potential fraud on your Expensify Card',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `[fr] Review ${amount} in potential fraud at ${merchant}`,
                subtitle: '[fr] Expensify Card',
                cta: '[fr] Review',
            },
            validateAccount: {
                title: '[fr] Validate your account to continue using Expensify',
                subtitle: '[fr] Account',
                cta: '[fr] Validate',
            },
            fixFailedBilling: {
                title: "[fr] We couldn't bill your card on file",
                subtitle: '[fr] Subscription',
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `[fr] Free trial: ${days} ${days === 1 ? '[fr] day' : '[fr] days'} left!`,
            offer50Body: '[fr] Get 50% off your first year!',
            offer25Body: '[fr] Get 25% off your first year!',
            addCardBody: "[fr] Don't wait! Add your payment card now.",
            ctaClaim: '[fr] Claim',
            ctaAdd: '[fr] Add card',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `[fr] Time remaining: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: '[fr] Time remaining: 1 day',
                other: (pluralCount: number) => `[fr] Time remaining: ${pluralCount} days`,
            }),
        },
        assignedCards: '[fr] Your Expensify Cards',
        assignedCardsRemaining: ({amount}: {amount: string}) => `[fr] ${amount} remaining`,
        announcements: '[fr] Announcements',
        discoverSection: {
            title: '[fr] Discover',
            menuItemTitleNonAdmin: '[fr] Learn how to create expenses and submit reports.',
            menuItemTitleAdmin: '[fr] Learn how to invite members, edit approval workflows, and reconcile company cards.',
            menuItemDescription: '[fr] See what Expensify can do in 2 min',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `[fr] Submit ${count} ${count === 1 ? '[fr] report' : '[fr] reports'}`,
            approve: ({count}: {count: number}) => `[fr] Approve ${count} ${count === 1 ? '[fr] report' : '[fr] reports'}`,
            pay: ({count}: {count: number}) => `[fr] Pay ${count} ${count === 1 ? '[fr] report' : '[fr] reports'}`,
            export: ({count}: {count: number}) => `[fr] Export ${count} ${count === 1 ? '[fr] report' : '[fr] reports'}`,
            begin: '[fr] Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: "[fr] You're done!",
                thumbsUpStarsDescription: '[fr] Thumbs up to you, stay tuned for more tasks.',
                smallRocketTitle: '[fr] All caught up',
                smallRocketDescription: '[fr] Upcoming to-dos will launch here.',
                cowboyHatTitle: "[fr] You're done!",
                cowboyHatDescription: '[fr] All tasks are wrangled, keep an eye out for more.',
                trophy1Title: '[fr] Nothing to show',
                trophy1Description: '[fr] You did it! Keep an eye out for more to-dos.',
                palmTreeTitle: '[fr] All caught up',
                palmTreeDescription: '[fr] Time to relax but stay tuned for future tasks.',
                fishbowlBlueTitle: "[fr] You're done!",
                fishbowlBlueDescription: "[fr] We'll bubble up future tasks here.",
                targetTitle: '[fr] All caught up',
                targetDescription: '[fr] Way to stay on target. Check back for more tasks!',
                chairTitle: '[fr] Nothing to show',
                chairDescription: "[fr] Go relax, we'll list upcoming to-dos here.",
                broomTitle: "[fr] You're done!",
                broomDescription: '[fr] Tasks are clean, though stay tuned for more to-dos.',
                houseTitle: '[fr] All caught up',
                houseDescription: '[fr] This is your home base for upcoming to-dos.',
                conciergeBotTitle: '[fr] Nothing to show',
                conciergeBotDescription: '[fr] Beep boop beep boop, check back for more tasks!',
                checkboxTextTitle: '[fr] All caught up',
                checkboxTextDescription: '[fr] Check off your upcoming to-dos here.',
                flashTitle: "[fr] You're done!",
                flashDescription: "[fr] We'll zap your future tasks here.",
                sunglassesTitle: '[fr] Nothing to show',
                sunglassesDescription: "[fr] Time to chill, though stay tuned for what's next!",
                f1FlagsTitle: '[fr] All caught up',
                f1FlagsDescription: "[fr] You've finished all outstanding to-dos.",
            },
        },
        gettingStartedSection: {
            title: '[fr] Getting started',
            createWorkspace: '[fr] Create a workspace',
            connectAccounting: ({integrationName}: {integrationName: string}) => `[fr] Connect to ${integrationName}`,
            customizeCategories: '[fr] Customize accounting categories',
            linkCompanyCards: '[fr] Link company cards',
            setupRules: '[fr] Set up spend rules',
        },
        upcomingTravel: '[fr] Upcoming travel',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `[fr] Flight to ${destination}`,
            trainTo: ({destination}: {destination: string}) => `[fr] Train to ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `[fr] Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `[fr] Car rental in ${destination}`,
            inOneWeek: '[fr] In 1 week',
            inDays: () => ({
                one: '[fr] In 1 day',
                other: (count: number) => `[fr] In ${count} days`,
            }),
            today: '[fr] Today',
        },
    },
    allSettingsScreen: {
        subscription: '[fr] Subscription',
        domains: '[fr] Domains',
    },
    tabSelector: {
        chat: '[fr] Chat',
        room: '[fr] Room',
        distance: '[fr] Distance',
        manual: '[fr] Manual',
        scan: '[fr] Scan',
        map: '[fr] Map',
        gps: '[fr] GPS',
        odometer: '[fr] Odometer',
    },
    spreadsheet: {
        upload: '[fr] Upload a spreadsheet',
        import: '[fr] Import spreadsheet',
        dragAndDrop: '[fr] <muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `[fr] <muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '[fr] <muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `[fr] <muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: '[fr] File contains column headers',
        column: (name: string) => `[fr] Column ${name}`,
        fieldNotMapped: (fieldName: string) => `[fr] Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `[fr] Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `[fr] Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: '[fr] Import successful',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[fr] No categories have been added or updated.';
            }
            if (added && updated) {
                return `[fr] ${added} ${added === 1 ? '[fr] category' : '[fr] categories'} added, ${updated} ${updated === 1 ? '[fr] category' : '[fr] categories'} updated.`;
            }
            if (added) {
                return added === 1 ? '[fr] 1 category has been added.' : `[fr] ${added} categories have been added.`;
            }
            return updated === 1 ? '[fr] 1 category has been updated.' : `[fr] ${updated} categories have been updated.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[fr] ${transactions} transactions have been added.` : '[fr] 1 transaction has been added.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return '[fr] No members have been added or updated.';
            }
            if (added && updated) {
                return `[fr] ${added} member${added > 1 ? '[fr] s' : ''} added, ${updated} member${updated > 1 ? '[fr] s' : ''} updated.`;
            }
            if (updated) {
                return updated > 1 ? `[fr] ${updated} members have been updated.` : '[fr] 1 member has been updated.';
            }
            return added > 1 ? `[fr] ${added} members have been added.` : '[fr] 1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `[fr] ${tags} tags have been added.` : '[fr] 1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: '[fr] Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `[fr] ${rates} per diem rates have been added.` : '[fr] 1 per diem rate has been added.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `[fr] ${transactions} transactions have been imported.` : '[fr] 1 transaction has been imported.',
        importFailedTitle: '[fr] Import failed',
        importFailedDescription: '[fr] Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: '[fr] Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: '[fr] File size must be greater than 0 bytes',
        invalidFileMessage:
            '[fr] The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: '[fr] Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: '[fr] Import spreadsheet',
        downloadCSV: '[fr] Download CSV',
        importMemberConfirmation: () => ({
            one: `[fr] Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `[fr] Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: '[fr] Upload receipt',
        uploadMultiple: '[fr] Upload receipts',
        desktopSubtitleSingle: `[fr] or drag and drop it here`,
        desktopSubtitleMultiple: `[fr] or drag and drop them here`,
        alternativeMethodsTitle: '[fr] Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `[fr] <label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `[fr] <label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `[fr] <label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `[fr] <label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: '[fr] Take a photo',
        cameraAccess: '[fr] Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `[fr] Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: '[fr] Camera error',
        cameraErrorMessage: '[fr] An error occurred while taking a photo. Please try again.',
        locationAccessTitle: '[fr] Allow location access',
        locationAccessMessage: '[fr] Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: '[fr] Allow location access',
        locationErrorMessage: '[fr] Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `[fr] Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '[fr] Let it go',
        dropMessage: '[fr] Drop your file here',
        flash: '[fr] flash',
        multiScan: '[fr] multi-scan',
        shutter: '[fr] shutter',
        gallery: '[fr] gallery',
        deleteReceipt: '[fr] Delete receipt',
        deleteConfirmation: '[fr] Are you sure you want to delete this receipt?',
        addReceipt: '[fr] Add receipt',
        addAdditionalReceipt: '[fr] Add additional receipt',
        scanFailed: "[fr] The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        crop: '[fr] Crop',
        addAReceipt: {
            phrase1: '[fr] Add a receipt',
            phrase2: '[fr] or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: '[fr] Scan receipt',
        recordDistance: '[fr] Track distance',
        requestMoney: '[fr] Create expense',
        perDiem: '[fr] Create per diem',
        splitBill: '[fr] Split expense',
        splitScan: '[fr] Split receipt',
        splitDistance: '[fr] Split distance',
        paySomeone: (name?: string) => `[fr] Pay ${name ?? '[fr] someone'}`,
        assignTask: '[fr] Assign task',
        header: '[fr] Quick action',
        noLongerHaveReportAccess: '[fr] You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: '[fr] Update destination',
        createReport: '[fr] Create report',
        createTimeExpense: '[fr] Create time expense',
    },
    iou: {
        amount: '[fr] Amount',
        percent: '[fr] Percent',
        date: '[fr] Date',
        taxAmount: '[fr] Tax amount',
        taxRate: '[fr] Tax rate',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `[fr] Approve ${formattedAmount}` : '[fr] Approve'),
        approved: '[fr] Approved',
        cash: '[fr] Cash',
        card: '[fr] Card',
        original: '[fr] Original',
        split: '[fr] Split',
        splitExpense: '[fr] Split expense',
        splitDates: '[fr] Split dates',
        splitDateRange: (startDate: string, endDate: string, count: number) => `[fr] ${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `[fr] ${amount} from ${merchant}`,
        splitByPercentage: '[fr] Split by percentage',
        splitByDate: '[fr] Split by date',
        addSplit: '[fr] Add split',
        makeSplitsEven: '[fr] Make splits even',
        editSplits: '[fr] Edit splits',
        totalAmountGreaterThanOriginal: (amount: string) => `[fr] Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: (amount: string) => `[fr] Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: '[fr] Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: '[fr] No splits added. Add at least one to save.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `[fr] Edit ${amount} for ${merchant}`,
        removeSplit: '[fr] Remove split',
        splitExpenseCannotBeEditedModalTitle: "[fr] This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: '[fr] Approved or paid expenses cannot be edited',
        paySomeone: (name?: string) => `[fr] Pay ${name ?? '[fr] someone'}`,
        splitExpenseDistanceErrorModalDescription: '[fr] Please fix the distance rate error and try again.',
        splitExpensePerDiemRateErrorModalDescription: '[fr] Please fix the per diem rate error and try again.',
        expense: '[fr] Expense',
        categorize: '[fr] Categorize',
        share: '[fr] Share',
        participants: '[fr] Participants',
        createExpense: '[fr] Create expense',
        trackDistance: '[fr] Track distance',
        createExpenses: (expensesNumber: number) => `[fr] Create ${expensesNumber} expenses`,
        removeExpense: '[fr] Remove expense',
        removeThisExpense: '[fr] Remove this expense',
        removeExpenseConfirmation: '[fr] Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: '[fr] Add expense',
        chooseRecipient: '[fr] Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `[fr] Create ${amount} expense`,
        confirmDetails: '[fr] Confirm details',
        pay: '[fr] Pay',
        cancelPayment: '[fr] Cancel payment',
        cancelPaymentConfirmation: '[fr] Are you sure that you want to cancel this payment?',
        viewDetails: '[fr] View details',
        pending: '[fr] Pending',
        canceled: '[fr] Canceled',
        posted: '[fr] Posted',
        deleteReceipt: '[fr] Delete receipt',
        findExpense: '[fr] Find expense',
        deletedTransaction: (amount: string, merchant: string) => `[fr] deleted an expense (${amount} for ${merchant})`,
        movedFromReport: (reportName: string) => `[fr] moved an expense${reportName ? `[fr]  from ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `[fr] moved this expense${reportName ? `[fr]  to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `[fr] moved this expense${reportName ? `[fr]  from <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `[fr] moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `[fr] moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `[fr] moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: '[fr] Receipt pending match with card transaction',
        pendingMatch: '[fr] Pending match',
        pendingMatchWithCreditCardDescription: '[fr] Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: '[fr] Mark as cash',
        pendingMatchSubmitTitle: '[fr] Submit report',
        pendingMatchSubmitDescription: '[fr] Some expenses are awaiting a match with a credit card transaction. Do you want to mark them as cash?',
        routePending: '[fr] Route pending...',
        automaticallyEnterExpenseDetails: '[fr] Concierge will automatically enter the expense details for you, or you can add them manually.',
        receiptScanning: () => ({
            one: '[fr] Receipt scanning...',
            other: '[fr] Receipts scanning...',
        }),
        scanMultipleReceipts: '[fr] Scan multiple receipts',
        scanMultipleReceiptsDescription: "[fr] Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: '[fr] Receipt scan in progress',
        receiptScanInProgressDescription: '[fr] Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: '[fr] Remove from report',
        moveToPersonalSpace: '[fr] Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '[fr] Potential duplicate expenses identified. Review duplicates to enable submission.'
                : '[fr] Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: '[fr] Issue found',
            other: '[fr] Issues found',
        }),
        fieldPending: '[fr] Pending...',
        defaultRate: '[fr] Default rate',
        receiptMissingDetails: '[fr] Receipt missing details',
        missingAmount: '[fr] Missing amount',
        missingMerchant: '[fr] Missing merchant',
        receiptStatusTitle: '[fr] Scanning…',
        receiptStatusText: "[fr] Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: '[fr] Receipt scanning failed. Please enter the details manually.',
        transactionPendingDescription: '[fr] Transaction pending. It may take a few days to post.',
        companyInfo: '[fr] Company info',
        companyInfoDescription: '[fr] We need a few more details before you can send your first invoice.',
        yourCompanyName: '[fr] Your company name',
        yourCompanyWebsite: '[fr] Your company website',
        yourCompanyWebsiteNote: "[fr] If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: '[fr] You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: '[fr] You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '[fr] 1 expense',
                other: (count: number) => `[fr] ${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: '[fr] Delete expense',
            other: '[fr] Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: '[fr] Are you sure that you want to delete this expense?',
            other: '[fr] Are you sure that you want to delete these expenses?',
        }),
        deleteReport: () => ({
            one: '[fr] Delete report',
            other: '[fr] Delete reports',
        }),
        deleteReportConfirmation: () => ({
            one: '[fr] Are you sure that you want to delete this report?',
            other: '[fr] Are you sure that you want to delete these reports?',
        }),
        settledExpensify: '[fr] Paid',
        done: '[fr] Done',
        settledElsewhere: '[fr] Paid elsewhere',
        individual: '[fr] Individual',
        business: '[fr] Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `[fr] Pay ${formattedAmount} as an individual` : `[fr] Pay with personal account`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `[fr] Pay ${formattedAmount} with wallet` : `[fr] Pay with wallet`),
        settlePayment: (formattedAmount: string) => `[fr] Pay ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `[fr] Pay ${formattedAmount} as a business` : `[fr] Pay with business account`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `[fr] Mark ${formattedAmount} as paid` : `[fr] Mark as paid`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `[fr] paid ${amount} with personal account ${last4Digits}` : `[fr] Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `[fr] paid ${amount} with business account ${last4Digits}` : `[fr] Paid with business account`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `[fr] Pay ${formattedAmount} via ${policyName}` : `[fr] Pay via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `[fr] paid ${amount} with bank account ${last4Digits}` : `[fr] paid with bank account ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `[fr] paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `[fr] Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `[fr] Business Account • ${lastFour}`,
        nextStep: '[fr] Next steps',
        finished: '[fr] Finished',
        flip: '[fr] Flip',
        sendInvoice: (amount: string) => `[fr] Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `[fr]  for ${comment}` : ''}`,
        submitted: (memo?: string) => `[fr] submitted${memo ? `[fr] , saying ${memo}` : ''}`,
        automaticallySubmitted: `[fr] submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: '[fr] queued to submit via custom approval workflow',
        failedToAutoSubmitViaDEW: (reason: string) => `[fr] failed to submit the report via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `[fr] failed to submit the report. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `[fr] failed to approve via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `[fr] failed to approve. ${reason}`,
        queuedToApproveViaDEW: '[fr] queued to approve via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `[fr] tracking ${formattedAmount}${comment ? `[fr]  for ${comment}` : ''}`,
        splitAmount: (amount: string) => `[fr] split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `[fr] split ${formattedAmount}${comment ? `[fr]  for ${comment}` : ''}`,
        yourSplit: (amount: string) => `[fr] Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `[fr] ${payer} owes ${amount}${comment ? `[fr]  for ${comment}` : ''}`,
        payerOwes: (payer: string) => `[fr] ${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `[fr] ${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: (payer: string) => `[fr] ${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `[fr] ${payer} spent ${amount}`,
        payerSpent: (payer: string) => `[fr] ${payer} spent: `,
        managerApproved: (manager: string) => `[fr] ${manager} approved:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `[fr] ${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `[fr] paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `[fr] paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `[fr] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `[fr] approved ${amount}`,
        approvedMessage: `[fr] approved`,
        unapproved: `[fr] unapproved`,
        automaticallyForwarded: `[fr] approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `[fr] approved`,
        rejectedThisReport: '[fr] rejected',
        waitingOnBankAccount: (submitterDisplayName: string) => `[fr] started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: '[fr] canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `[fr] canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `[fr] ${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `[fr] ${payer ? `${payer} ` : ''}marked as paid${comment ? `[fr] , saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `[fr] ${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `[fr] ${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        reimbursedThisReport: '[fr] reimbursed this report',
        paidThisBill: '[fr] paid this bill',
        reimbursedOnBehalfOf: (actor: string) => `[fr] on behalf of ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `[fr] from the bank account ending in ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `[fr] ${submitter} added a bank account, taking report off hold. Reimbursement is initiated`,
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
                ? `[fr] . Money is on its way to your${creditBankAccount ? `[fr]  bank account ending in ${creditBankAccount}` : '[fr]  account'}. Reimbursement estimated to complete on ${expectedDate}.`
                : `[fr] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[fr]  bank account ending in ${creditBankAccount}` : '[fr]  account'}. Reimbursement estimated to complete on ${expectedDate}.`,
        reimbursedWithCheck: '[fr]  via check.',
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
            const paymentMethod = isCard ? '[fr] card' : '[fr] bank account';
            return isCurrentUser
                ? `[fr] . Money is on its way to your${creditBankAccount ? `[fr]  bank account ending in ${creditBankAccount}` : '[fr]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`
                : `[fr] . Money is on its way to ${submitterLogin}'s${creditBankAccount ? `[fr]  bank account ending in ${creditBankAccount}` : '[fr]  account'} (paid via ${paymentMethod}). This could take up to 10 business days.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `[fr]  with direct deposit (ACH)${creditBankAccount ? `[fr]  to the bank account ending in ${creditBankAccount}. ` : '. '}${expectedDate ? `[fr] The reimbursement is estimated to complete by ${expectedDate}.` : '[fr] This generally takes 4-5 business days.'}`,
        noReimbursableExpenses: '[fr] This report has an invalid amount',
        pendingConversionMessage: "[fr] Total will update when you're back online",
        changedTheExpense: '[fr] changed the expense',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `[fr] the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `[fr] set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `[fr] the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `[fr] the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `[fr] changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: '[fr] based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `[fr] based on <a href="${rulesLink}">workspace rules</a>` : '[fr] based on workspace rule'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `[fr] for ${comment}` : '[fr] expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `[fr] Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `[fr] ${formattedAmount} sent${comment ? `[fr]  for ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) => `[fr] moved expense from personal space to ${workspaceName ?? `[fr] chat with ${reportName}`}`,
        movedToPersonalSpace: '[fr] moved expense to personal space',
        error: {
            invalidCategoryLength: '[fr] The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: '[fr] The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: '[fr] Please enter a valid amount before continuing',
            invalidDistance: '[fr] Please enter a valid distance before continuing',
            invalidReadings: '[fr] Please enter both start and end readings',
            negativeDistanceNotAllowed: '[fr] End reading must be greater than start reading',
            distanceAmountTooLarge: '[fr] The total amount is too large. Reduce the distance or lower the rate.',
            distanceAmountTooLargeReduceDistance: '[fr] The total amount is too large. Reduce the distance.',
            distanceAmountTooLargeReduceRate: '[fr] The total amount is too large. Lower the rate.',
            odometerReadingTooLarge: (formattedMax: string) => `[fr] Odometer readings cannot exceed ${formattedMax}.`,
            stitchOdometerImagesFailed: '[fr] Failed to combine odometer images. Please try again later.',
            invalidIntegerAmount: '[fr] Please enter a whole dollar amount before continuing',
            invalidTaxAmount: (amount: string) => `[fr] Maximum tax amount is ${amount}`,
            invalidSplit: '[fr] The sum of splits must equal the total amount',
            invalidSplitParticipants: '[fr] Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: '[fr] Please enter a non-zero amount for your split',
            noParticipantSelected: '[fr] Please select a participant',
            other: '[fr] Unexpected error. Please try again later.',
            genericCreateFailureMessage: '[fr] Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: '[fr] Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: '[fr] Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: '[fr] Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: '[fr] Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '[fr] <rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: '[fr] There was an error uploading your receipt.',
            genericDeleteFailureMessage: '[fr] Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: '[fr] Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: '[fr] Transaction is missing fields',
            duplicateWaypointsErrorMessage: '[fr] Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: '[fr] Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: '[fr] An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: '[fr] Please enter a valid merchant',
            atLeastOneAttendee: '[fr] At least one attendee must be selected',
            invalidQuantity: '[fr] Please enter a valid quantity',
            quantityGreaterThanZero: '[fr] Quantity must be greater than zero',
            invalidSubrateLength: '[fr] There must be at least one subrate',
            invalidRate: '[fr] Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "[fr] The end date can't be before the start date",
            endDateSameAsStartDate: "[fr] The end date can't be the same as the start date",
            manySplitsProvided: `[fr] The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `[fr] The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
        },
        dismissReceiptError: '[fr] Dismiss error',
        dismissReceiptErrorConfirmation: '[fr] Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `[fr] started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: '[fr] Enable wallet',
        hold: '[fr] Hold',
        unhold: '[fr] Remove hold',
        holdExpense: () => ({
            one: '[fr] Hold expense',
            other: '[fr] Hold expenses',
        }),
        unholdExpense: '[fr] Unhold expense',
        heldExpense: '[fr] held this expense',
        unheldExpense: '[fr] unheld this expense',
        moveUnreportedExpense: '[fr] Move unreported expense',
        addUnreportedExpense: '[fr] Add unreported expense',
        selectUnreportedExpense: '[fr] Select at least one expense to add to the report.',
        emptyStateUnreportedExpenseTitle: '[fr] No unreported expenses',
        emptyStateUnreportedExpenseSubtitle: '[fr] Looks like you don’t have any unreported expenses. Try creating one below.',
        addUnreportedExpenseConfirm: '[fr] Add to report',
        newReport: '[fr] New report',
        explainHold: () => ({
            one: "[fr] Explain why you're holding this expense.",
            other: "[fr] Explain why you're holding these expenses.",
        }),
        explainHoldApprover: () => ({
            one: '[fr] Explain what you need before approving this expense.',
            other: '[fr] Explain what you need before approving these expenses.',
        }),
        retracted: '[fr] retracted',
        retract: '[fr] Retract',
        reopened: '[fr] reopened',
        reopenReport: '[fr] Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `[fr] This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: '[fr] Reason',
        holdReasonRequired: '[fr] A reason is required when holding.',
        expenseWasPutOnHold: '[fr] Expense was put on hold',
        expenseOnHold: '[fr] This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: '[fr] All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: '[fr] This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: '[fr] Some of these duplicates have been approved or paid already.',
        reviewDuplicates: '[fr] Review duplicates',
        keepAll: '[fr] Keep all',
        noDuplicatesTitle: '[fr] All set!',
        noDuplicatesDescription: '[fr] There are no duplicate transactions for review here.',
        confirmApprove: '[fr] Confirm approval amount',
        confirmApprovalAmount: '[fr] Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: '[fr] This expense is on hold. Do you want to approve anyway?',
            other: '[fr] These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: '[fr] Confirm payment amount',
        confirmPayAmount: "[fr] Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: '[fr] This expense is on hold. Do you want to pay anyway?',
            other: '[fr] These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: '[fr] Pay only',
        approveOnly: '[fr] Approve only',
        holdEducationalTitle: '[fr] Should you hold this expense?',
        whatIsHoldExplain: "[fr] Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: '[fr] Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "[fr] Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: '[fr] You moved this report!',
            description: '[fr] Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '[fr] <strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: '[fr] This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: '[fr] Change workspace',
        set: '[fr] set',
        changed: '[fr] changed',
        removed: '[fr] removed',
        transactionPending: '[fr] Transaction pending.',
        chooseARate: '[fr] Select a workspace reimbursement rate per mile or kilometer',
        unapprove: '[fr] Unapprove',
        unapproveReport: '[fr] Unapprove report',
        headsUp: '[fr] Heads up!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `[fr] This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: '[fr] reimbursable',
        nonReimbursable: '[fr] non-reimbursable',
        bookingPending: '[fr] This booking is pending',
        bookingPendingDescription: "[fr] This booking is pending because it hasn't been paid yet.",
        bookingArchived: '[fr] This booking is archived',
        bookingArchivedDescription: '[fr] This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: '[fr] Attendees',
        totalPerAttendee: '[fr] Per attendee',
        whoIsYourAccountant: '[fr] Who is your accountant?',
        paymentComplete: '[fr] Payment complete',
        time: '[fr] Time',
        startDate: '[fr] Start date',
        endDate: '[fr] End date',
        startTime: '[fr] Start time',
        endTime: '[fr] End time',
        deleteSubrate: '[fr] Delete subrate',
        deleteSubrateConfirmation: '[fr] Are you sure you want to delete this subrate?',
        quantity: '[fr] Quantity',
        subrateSelection: '[fr] Select a subrate and enter a quantity.',
        qty: '[fr] Qty',
        firstDayText: () => ({
            one: `[fr] First day: 1 hour`,
            other: (count: number) => `[fr] First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `[fr] Last day: 1 hour`,
            other: (count: number) => `[fr] Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `[fr] Trip: 1 full day`,
            other: (count: number) => `[fr] Trip: ${count} full days`,
        }),
        dates: '[fr] Dates',
        rates: '[fr] Rates',
        submitsTo: (name: string) => `[fr] Submits to ${name}`,
        reject: {
            educationalTitle: '[fr] Should you hold or reject?',
            educationalText: "[fr] If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: '[fr] Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: '[fr] Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: '[fr] Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "[fr] Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: '[fr] Reject expense',
            reasonPageDescription: '[fr] Explain why you will not approve this expense.',
            rejectReason: '[fr] Rejection reason',
            markAsResolved: '[fr] Mark as resolved',
            rejectedStatus: '[fr] This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: '[fr] rejected this expense',
                markedAsResolved: '[fr] marked the rejection reason as resolved',
            },
        },
        rejectReport: {
            title: '[fr] Reject report',
            description: '[fr] Explain why you will not approve this report:',
            rejectReason: '[fr] Rejection reason',
            selectTarget: '[fr] Choose the member to reject this report back to for review:',
            lastApprover: '[fr] Last approver',
            submitter: '[fr] Submitter',
            rejectedReportMessage: '[fr] This report was rejected.',
            rejectedNextStep: '[fr] This report was rejected. Waiting on you to fix the issues and manually resubmit.',
            selectMemberError: '[fr] Select a member to reject this report back to.',
            couldNotReject: '[fr] The report could not be rejected. Please try again.',
        },
        moveExpenses: '[fr] Move to report',
        moveExpensesError: "[fr] You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: '[fr] Change approver',
            header: (workflowSettingLink: string) =>
                `[fr] Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `[fr] changed the approver to <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: '[fr] Add approver',
                addApproverSubtitle: '[fr] Add an additional approver to the existing workflow.',
                bypassApprovers: '[fr] Bypass approvers',
                bypassApproversSubtitle: '[fr] Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: '[fr] Choose an additional approver for this report before we route through the rest of the approval workflow.',
                bulkSubtitle: '[fr] Choose an additional approver for these reports before we route through the rest of the approval workflow.',
            },
            bulkSubtitle: '[fr] Choose an option to change the approver for these reports.',
        },
        chooseWorkspace: '[fr] Choose a workspace',
        routedDueToDEW: (to: string, reason?: string) => `[fr] report routed to ${to}${reason ? `[fr]  because ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `[fr] ${hours} ${hours === 1 ? '[fr] hour' : '[fr] hours'} @ ${rate} / hour`,
            hrs: '[fr] hrs',
            hours: '[fr] Hours',
            ratePreview: (rate: string) => `[fr] ${rate} / hour`,
            amountTooLargeError: '[fr] The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctRateError: '[fr] Fix the rate error and try again.',
        AskToExplain: `[fr] . <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Explain<sparkles-icon/></a>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '[fr] marked the expense as "reimbursable"' : '[fr] marked the expense as "non-reimbursable"'),
            billable: (value: boolean) => (value ? '[fr] marked the expense as "billable"' : '[fr] marked the expense as "non-billable"'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `[fr] set the tax rate to "${value}"` : `[fr] tax rate to "${value}"`),
            reportName: (value: string) => `[fr] moved this expense to report "${value}"`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `[fr] set the ${field} to "${value}"` : `[fr] ${field} to "${value}"`;
            },
            formatPersonalRules: (fragments: string, route: string) => `[fr] ${fragments} via <a href="${route}">personal expense rules</a>`,
            formatPolicyRules: (fragments: string, route: string) => `[fr] ${fragments} via <a href="${route}">workspace rules</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: "[fr] You can't duplicate per diem expenses across workspaces because the rates may differ between workspaces.",
        cannotDuplicateDistanceExpense: "[fr] You can't duplicate distance expenses across workspaces because the rates may differ between workspaces.",
        taxDisabledAlert: {
            title: '[fr] Tax disabled',
            prompt: '[fr] Enable tax tracking on the workspace to edit the expense details or delete the tax from this expense.',
            confirmText: '[fr] Delete tax',
        },
    },
    transactionMerge: {
        listPage: {
            header: '[fr] Merge expenses',
            noEligibleExpenseFound: '[fr] No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `[fr] <muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `[fr] Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '[fr] Select receipt',
            pageTitle: '[fr] Select the receipt you want to keep:',
        },
        detailsPage: {
            header: '[fr] Select details',
            pageTitle: '[fr] Select the details you want to keep:',
            noDifferences: '[fr] No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '[fr] an' : '[fr] a';
                return `[fr] Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: '[fr] Please select attendees',
            selectAllDetailsError: '[fr] Select all details before continuing.',
        },
        confirmationPage: {
            header: '[fr] Confirm details',
            pageTitle: "[fr] Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: '[fr] Merge expenses',
        },
    },
    share: {
        shareToExpensify: '[fr] Share to Expensify',
        messageInputLabel: '[fr] Message',
    },
    notificationPreferencesPage: {
        header: '[fr] Notification preferences',
        label: '[fr] Notify me about new messages',
        notificationPreferences: {
            always: '[fr] Immediately',
            daily: '[fr] Daily',
            mute: '[fr] Mute',
            hidden: '[fr][ctx: UI label indicating that something is concealed or not visible to the user.] Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "[fr] The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "[fr] The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: '[fr] Upload photo',
        removePhoto: '[fr] Remove photo',
        editImage: '[fr] Edit photo',
        viewPhoto: '[fr] View photo',
        imageUploadFailed: '[fr] Image upload failed',
        deleteWorkspaceError: '[fr] Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `[fr] The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `[fr] Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `[fr] Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: '[fr] Edit profile picture',
        upload: '[fr] Upload',
        uploadPhoto: '[fr] Upload photo',
        selectAvatar: '[fr] Select avatar',
        choosePresetAvatar: '[fr] Or choose a custom avatar',
    },
    modal: {
        backdropLabel: '[fr] Modal Backdrop',
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
                        return `[fr] Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] Waiting for an admin to add expenses.`;
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
                        return `[fr] Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] Waiting for an admin to submit expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `[fr] No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[fr] Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] Waiting for an admin to add a bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[fr]  on the ${eta} of each month` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[fr] Waiting for your expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] Waiting for an admin's expenses to automatically submit${formattedETA}.`;
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
                        return `[fr] Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] Waiting for an admin to fix the issues.`;
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
                        return `[fr] Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] Waiting for an admin to approve expenses.`;
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
                        return `[fr] Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] Waiting for an admin to export this report.`;
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
                        return `[fr] Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] Waiting for an admin to pay expenses.`;
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
                        return `[fr] Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] Waiting for an admin to finish setting up a business bank account.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `[fr]  by ${eta}` : ` ${eta}`;
                }
                return `[fr] Waiting for payment to complete${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `[fr] Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `[fr] This report was rejected. Waiting on <strong>you</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `[fr] This report was rejected. Waiting on <strong>${actor}</strong> to fix the issues and manually resubmit.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `[fr] This report was rejected. Waiting on an admin to fix the issues and manually resubmit.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: '[fr] shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '[fr] later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '[fr] on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '[fr] on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '[fr] on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '[fr] on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '[fr] at the end of your trip',
        },
    },
    profilePage: {
        profile: '[fr] Profile',
        preferredPronouns: '[fr] Preferred pronouns',
        selectYourPronouns: '[fr] Select your pronouns',
        selfSelectYourPronoun: '[fr] Self-select your pronoun',
        emailAddress: '[fr] Email address',
        setMyTimezoneAutomatically: '[fr] Set my timezone automatically',
        timezone: '[fr] Timezone',
        invalidFileMessage: '[fr] Invalid file. Please try a different image.',
        avatarUploadFailureMessage: '[fr] An error occurred uploading the avatar. Please try again.',
        online: '[fr] Online',
        offline: '[fr] Offline',
        syncing: '[fr] Syncing',
        profileAvatar: '[fr] Profile avatar',
        publicSection: {
            title: '[fr] Public',
            subtitle: '[fr] These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: '[fr] Private',
            subtitle: "[fr] These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: '[fr] Security options',
        subtitle: '[fr] Enable two-factor authentication to keep your account safe.',
        goToSecurity: '[fr] Go back to security page',
    },
    shareCodePage: {
        title: '[fr] Your code',
        subtitle: '[fr] Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: '[fr] Pronouns',
        isShownOnProfile: '[fr] Your pronouns are shown on your profile.',
        placeholderText: '[fr] Search to see options',
    },
    contacts: {
        contactMethods: '[fr] Contact methods',
        featureRequiresValidate: '[fr] This feature requires you to validate your account.',
        validateAccount: '[fr] Validate your account',
        helpText: ({email}: {email: string}) =>
            `[fr] Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: '[fr] Please verify this contact method.',
        getInTouch: "[fr] We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `[fr] Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '[fr] Set as default',
        yourDefaultContactMethod: "[fr] This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        yourDefaultContactMethodRestrictedSwitch: '[fr] This is your current default contact method. Your company has restricted removing or changing it.',
        removeContactMethod: '[fr] Remove contact method',
        removeAreYouSure: "[fr] Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: '[fr] Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: '[fr] Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: '[fr] Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: '[fr] Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: '[fr] Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: '[fr] Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: '[fr] This contact method already exists',
            passwordRequired: '[fr] password required.',
            contactMethodRequired: '[fr] Contact method is required',
            invalidContactMethod: '[fr] Invalid contact method',
        },
        newContactMethod: '[fr] New contact method',
        goBackContactMethods: '[fr] Go back to contact methods',
    },
    pronouns: {
        coCos: '[fr] Co / Cos',
        eEyEmEir: '[fr] E / Ey / Em / Eir',
        faeFaer: '[fr] Fae / Faer',
        heHimHis: '[fr] He / Him / His',
        heHimHisTheyThemTheirs: '[fr] He / Him / His / They / Them / Theirs',
        sheHerHers: '[fr] She / Her / Hers',
        sheHerHersTheyThemTheirs: '[fr] She / Her / Hers / They / Them / Theirs',
        merMers: '[fr] Mer / Mers',
        neNirNirs: '[fr] Ne / Nir / Nirs',
        neeNerNers: '[fr] Nee / Ner / Ners',
        perPers: '[fr] Per / Pers',
        theyThemTheirs: '[fr] They / Them / Theirs',
        thonThons: '[fr] Thon / Thons',
        veVerVis: '[fr] Ve / Ver / Vis',
        viVir: '[fr] Vi / Vir',
        xeXemXyr: '[fr] Xe / Xem / Xyr',
        zeZieZirHir: '[fr] Ze / Zie / Zir / Hir',
        zeHirHirs: '[fr] Ze / Hir',
        callMeByMyName: '[fr] Call me by my name',
    },
    displayNamePage: {
        headerTitle: '[fr] Display name',
        isShownOnProfile: '[fr] Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: '[fr] Timezone',
        isShownOnProfile: '[fr] Your timezone is shown on your profile.',
        getLocationAutomatically: '[fr] Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: '[fr] Update required',
        pleaseInstall: '[fr] Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: '[fr] Please install the latest version of Expensify',
        toGetLatestChanges: '[fr] For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: '[fr] The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: '[fr] About',
        aboutPage: {
            description: '[fr] The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: '[fr] App download links',
            viewKeyboardShortcuts: '[fr] View keyboard shortcuts',
            viewTheCode: '[fr] View the code',
            viewOpenJobs: '[fr] View open jobs',
            reportABug: '[fr] Report a bug',
            troubleshoot: '[fr] Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: '[fr] Android',
            },
            ios: {
                label: '[fr] iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '[fr] Clear cache and restart',
            description:
                '[fr] <muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: '[fr] All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: '[fr] Reset and refresh',
            clientSideLogging: '[fr] Client side logging',
            noLogsToShare: '[fr] No logs to share',
            useProfiling: '[fr] Use profiling',
            profileTrace: '[fr] Profile trace',
            results: '[fr] Results',
            releaseOptions: '[fr] Release options',
            testingPreferences: '[fr] Testing preferences',
            useStagingServer: '[fr] Use Staging Server',
            forceOffline: '[fr] Force offline',
            simulatePoorConnection: '[fr] Simulate poor internet connection',
            simulateFailingNetworkRequests: '[fr] Simulate failing network requests',
            authenticationStatus: '[fr] Authentication status',
            deviceCredentials: '[fr] Device credentials',
            invalidate: '[fr] Invalidate',
            destroy: '[fr] Destroy',
            maskExportOnyxStateData: '[fr] Mask fragile member data while exporting Onyx state',
            exportOnyxState: '[fr] Export Onyx state',
            importOnyxState: '[fr] Import Onyx state',
            testCrash: '[fr] Test crash',
            resetToOriginalState: '[fr] Reset to original state',
            usingImportedState: '[fr] You are using imported state. Press here to clear it.',
            debugMode: '[fr] Debug mode',
            invalidFile: '[fr] Invalid file',
            invalidFileDescription: '[fr] The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: '[fr] Invalidate with delay',
            leftHandNavCache: '[fr] Left Hand Nav cache',
            clearleftHandNavCache: '[fr] Clear',
            softKillTheApp: '[fr] Soft kill the app',
            kill: '[fr] Kill',
            sentryDebug: '[fr] Sentry debug',
            sentrySendDescription: '[fr] Send data to Sentry',
            sentryDebugDescription: '[fr] Log Sentry requests to console',
            sentryHighlightedSpanOps: '[fr] Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: '[fr] ui.interaction.click, navigation, ui.load',
        },
        security: '[fr] Security',
        signOut: '[fr] Sign out',
        restoreStashed: '[fr] Restore stashed login',
        signOutConfirmationText: "[fr] You'll lose any offline changes if you sign out.",
        versionLetter: '[fr] v',
        readTheTermsAndPrivacy: `[fr] Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.`,
        help: '[fr] Help',
        helpPage: {
            title: '[fr] Help and support',
            description: '[fr] We are here to help you 24/7',
            helpSite: '[fr] Help site',
            conciergeChat: '[fr] Concierge',
            conciergeChatDescription: '[fr] Your personal AI agent',
        },
        whatIsNew: "[fr] What's new",
        accountSettings: '[fr] Account settings',
        account: '[fr] Account',
        general: '[fr] General',
    },
    closeAccountPage: {
        closeAccount: '[fr][ctx: close as a verb, not an adjective] Close account',
        reasonForLeavingPrompt: '[fr] We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: '[fr] Enter message here',
        closeAccountWarning: '[fr] Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: '[fr] Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: '[fr] Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: '[fr] Enter your default contact method',
        defaultContact: '[fr] Default contact method:',
        enterYourDefaultContactMethod: '[fr] Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: '[fr] Merge accounts',
        accountDetails: {
            accountToMergeInto: (login: string) => `[fr] Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: '[fr] I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: '[fr] Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: (login: string) => `[fr] Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `[fr] To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: '[fr] Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: '[fr] Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: '[fr] Accounts merged!',
            description: (from: string, to: string) =>
                `[fr] <muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '[fr] We’re working on it',
            limitedSupport: '[fr] We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp: '[fr] <muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: '[fr] Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `[fr] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `[fr] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `[fr] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: '[fr] Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `[fr] <muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `[fr] <muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `[fr] <muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `[fr] <muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '[fr] Try again later',
            description: '[fr] There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "[fr] You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: '[fr] You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: '[fr] Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '[fr] Report suspicious activity',
        lockAccount: '[fr] Lock account',
        unlockAccount: '[fr] Unlock account',
        unlockTitle: '[fr] We’ve received your request',
        unlockDescription: '[fr] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        compromisedDescription:
            '[fr] Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: '[fr] For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: '[fr] Are you sure you want to lock your Expensify account?',
        onceLocked: '[fr] Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: '[fr] Failed to lock account',
        failedToLockAccountDescription: `[fr] We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: '[fr] Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: '[fr] Account locked',
        yourAccountIsLocked: '[fr] Your account is locked',
        chatToConciergeToUnlock: '[fr] Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: '[fr] Chat with Concierge',
    },
    twoFactorAuth: {
        headerTitle: '[fr] Two-factor authentication',
        twoFactorAuthEnabled: '[fr] Two-factor authentication enabled',
        whatIsTwoFactorAuth: '[fr] Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: '[fr] Disable two-factor authentication',
        explainProcessToRemove: '[fr] To disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: '[fr] To disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: '[fr] Two-factor authentication is now disabled',
        noAuthenticatorApp: '[fr] You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: '[fr] Recovery codes',
        keepCodesSafe: '[fr] Keep these recovery codes safe!',
        codesLoseAccess: dedent(`
            [fr] If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            Note: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        errorStepCodes: '[fr] Please copy or download codes before continuing',
        stepVerify: '[fr] Verify',
        scanCode: '[fr] Scan the QR code using your',
        authenticatorApp: '[fr] authenticator app',
        addKey: '[fr] Or add this secret key to your authenticator app:',
        secretKey: '[fr] secret key',
        enterCode: '[fr] Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: '[fr] Finished',
        enabled: '[fr] Two-factor authentication enabled',
        congrats: '[fr] Congrats! Now you’ve got that extra security.',
        copy: '[fr] Copy',
        disable: '[fr] Disable',
        enableTwoFactorAuth: '[fr] Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: '[fr] Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: '[fr] For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: '[fr] Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: '[fr] Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: '[fr] Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: '[fr] Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: '[fr] Cannot disable 2FA',
        twoFactorAuthRequired: '[fr] Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
        replaceDevice: '[fr] Replace device',
        replaceDeviceTitle: '[fr] Replace two-factor device',
        verifyOldDeviceTitle: '[fr] Verify old device',
        verifyOldDeviceDescription: '[fr] Enter the six-digit code from your current authenticator app to confirm you have access to it.',
        verifyNewDeviceTitle: '[fr] Set up new device',
        verifyNewDeviceDescription: '[fr] Scan the QR code with your new device, then enter the code to complete setup.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '[fr] Please enter your recovery code',
            incorrectRecoveryCode: '[fr] Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: '[fr] Use recovery code',
        recoveryCode: '[fr] Recovery code',
        use2fa: '[fr] Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '[fr] Please enter your two-factor authentication code',
            incorrect2fa: '[fr] Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '[fr] Password updated!',
        allSet: '[fr] You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: '[fr] Private notes',
        personalNoteMessage: "[fr] Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: '[fr] Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: '[fr] Notes',
        myNote: '[fr] My note',
        error: {
            genericFailureMessage: "[fr] Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: '[fr] Please enter a valid security code',
        },
        securityCode: '[fr] Security code',
        changeBillingCurrency: '[fr] Change billing currency',
        changePaymentCurrency: '[fr] Change payment currency',
        paymentCurrency: '[fr] Payment currency',
        paymentCurrencyDescription: '[fr] Select a standardized currency that all personal expenses should be converted to',
        note: `[fr] Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: '[fr] Add a debit card',
        nameOnCard: '[fr] Name on card',
        debitCardNumber: '[fr] Debit card number',
        expiration: '[fr] Expiration date',
        expirationDate: '[fr] MMYY',
        cvv: '[fr] CVV',
        billingAddress: '[fr] Billing address',
        growlMessageOnSave: '[fr] Your debit card was successfully added',
        expensifyPassword: '[fr] Expensify password',
        error: {
            invalidName: '[fr] Name can only include letters',
            addressZipCode: '[fr] Please enter a valid zip code',
            debitCardNumber: '[fr] Please enter a valid debit card number',
            expirationDate: '[fr] Please select a valid expiration date',
            securityCode: '[fr] Please enter a valid security code',
            addressStreet: "[fr] Please enter a valid billing address that's not a PO box",
            addressState: '[fr] Please select a state',
            addressCity: '[fr] Please enter a city',
            genericFailureMessage: '[fr] An error occurred while adding your card. Please try again.',
            password: '[fr] Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '[fr] Add payment card',
        nameOnCard: '[fr] Name on card',
        paymentCardNumber: '[fr] Card number',
        expiration: '[fr] Expiration date',
        expirationDate: '[fr] MM/YY',
        cvv: '[fr] CVV',
        billingAddress: '[fr] Billing address',
        growlMessageOnSave: '[fr] Your payment card was successfully added',
        expensifyPassword: '[fr] Expensify password',
        error: {
            invalidName: '[fr] Name can only include letters',
            addressZipCode: '[fr] Please enter a valid zip code',
            paymentCardNumber: '[fr] Please enter a valid card number',
            expirationDate: '[fr] Please select a valid expiration date',
            securityCode: '[fr] Please enter a valid security code',
            addressStreet: "[fr] Please enter a valid billing address that's not a PO box",
            addressState: '[fr] Please select a state',
            addressCity: '[fr] Please enter a city',
            genericFailureMessage: '[fr] An error occurred while adding your card. Please try again.',
            password: '[fr] Please enter your Expensify password',
        },
    },
    personalCard: {
        addPersonalCard: '[fr] Add personal card',
        addCompanyCard: '[fr] Add company card',
        lookingForCompanyCards: '[fr] Need to add company cards?',
        lookingForCompanyCardsDescription: '[fr] Bring your own cards from 10,000+ banks worldwide.',
        personalCardAdded: '[fr] Personal card added!',
        personalCardAddedDescription: '[fr] Congrats, we’ll begin importing transactions from your card.',
        isPersonalCard: '[fr] Is this a personal card?',
        thisIsPersonalCard: '[fr] This is a personal card',
        thisIsCompanyCard: '[fr] This is a company card',
        askAdmin: '[fr] Ask your admin',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `[fr] If so, great! But if it's a <strong>company</strong> card, please ${isAdmin ? '[fr] assign it from your workspace instead.' : '[fr] ask your admin to assign it to you from the workspace instead.'}`,
        bankConnectionError: '[fr] Bank connection issue',
        bankConnectionDescription: '[fr] Please try adding your cards again. Otherwise, you can',
        connectWithPlaid: '[fr] connect via Plaid.',
        brokenConnection: '[fr] Your card connection is broken.',
        fixCard: '[fr] Fix card',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `[fr] Your ${cardName} card connection is broken. <a href="${connectionLink}">Log into your bank</a> to fix the card.`
                : `[fr] Your ${cardName} card connection is broken. Log into your bank to fix the card.`,
        addAdditionalCards: '[fr] Add additional cards',
        upgradeDescription: '[fr] Need to add more cards? Create a workspace to add additional personal cards or assign company cards to the entire team.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `[fr] <muted-text>This is available on the Collect plan, which is <strong>${formattedPrice}</strong> per member per month.</muted-text>`,
        note: (subscriptionLink: string) =>
            `[fr] <muted-text>Create a workspace to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
        workspaceCreated: '[fr] Workspace created',
        newWorkspace: '[fr] You created a workspace!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `[fr] <centered-text>You’re all set to add additional cards. <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
    },
    walletPage: {
        balance: '[fr] Balance',
        paymentMethodsTitle: '[fr] Payment methods',
        setDefaultConfirmation: '[fr] Make default payment method',
        setDefaultSuccess: '[fr] Default payment method set!',
        deleteAccount: '[fr] Delete account',
        deleteConfirmation: '[fr] Are you sure you want to delete this account?',
        deleteCard: '[fr] Delete card',
        deleteCardConfirmation:
            '[fr] All unsubmitted card transactions, including those on open reports, will be removed. Are you sure you want to delete this card? You cannot undo this action.',
        error: {
            notOwnerOfBankAccount: '[fr] An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: '[fr] This bank account is temporarily suspended',
            notOwnerOfFund: '[fr] An error occurred while setting this card as your default payment method',
            setDefaultFailure: '[fr] Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: '[fr] An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: '[fr] Get paid faster',
        addPaymentMethod: '[fr] Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: '[fr] Get paid back faster',
        secureAccessToYourMoney: '[fr] Secure access to your money',
        receiveMoney: '[fr] Receive money in your local currency',
        expensifyWallet: '[fr] Expensify Wallet (Beta)',
        sendAndReceiveMoney: '[fr] Send and receive money with friends. US bank accounts only.',
        enableWallet: '[fr] Enable wallet',
        addBankAccountToSendAndReceive: '[fr] Add a bank account to make or receive payments.',
        addDebitOrCreditCard: '[fr] Add debit or credit card',
        cardInactive: '[fr] Inactive',
        assignedCards: '[fr] Assigned cards',
        assignedCardsDescription: '[fr] Transactions from these cards sync automatically.',
        expensifyCard: '[fr] Expensify Card',
        walletActivationPending: "[fr] We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "[fr] Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: '[fr] Add your bank account',
        addBankAccountBody: "[fr] Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: '[fr] Choose your bank account',
        chooseAccountBody: '[fr] Make sure that you select the right one.',
        confirmYourBankAccount: '[fr] Confirm your bank account',
        personalBankAccounts: '[fr] Personal bank accounts',
        businessBankAccounts: '[fr] Business bank accounts',
        shareBankAccount: '[fr] Share bank account',
        bankAccountShared: '[fr] Bank account shared',
        shareBankAccountTitle: '[fr] Select the admins to share this bank account with:',
        shareBankAccountSuccess: '[fr] Bank account shared!',
        shareBankAccountSuccessDescription: '[fr] The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: '[fr] An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: '[fr] No admins available',
        shareBankAccountEmptyDescription: '[fr] There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: '[fr] Please select an admin before continuing',
        unshareBankAccount: '[fr] Unshare bank account',
        unshareBankAccountDescription: '[fr] Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `[fr] ${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: '[fr] It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: `[fr] Can't unshare bank account`,
        travelCVV: {
            title: '[fr] Travel CVV',
            subtitle: '[fr] Use this when booking travel',
            description: "[fr] Use this card for your Expensify Travel bookings. It'll show as “Travel Card” at checkout.",
        },
        chaseAccountNumberDifferent: '[fr] Why is my account number different?',
    },
    cardPage: {
        expensifyCard: '[fr] Expensify Card',
        expensifyTravelCard: '[fr] Expensify Travel Card',
        availableSpend: '[fr] Remaining limit',
        smartLimit: {
            name: '[fr] Smart limit',
            title: (formattedLimit: string) => `[fr] You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: '[fr] Fixed limit',
            title: (formattedLimit: string) => `[fr] You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: '[fr] Monthly limit',
            title: (formattedLimit: string) => `[fr] You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: '[fr] Virtual card number',
        travelCardCvv: '[fr] Travel card CVV',
        physicalCardNumber: '[fr] Physical card number',
        physicalCardPin: '[fr] PIN',
        getPhysicalCard: '[fr] Get physical card',
        reportFraud: '[fr] Report virtual card fraud',
        reportTravelFraud: '[fr] Report travel card fraud',
        reviewTransaction: '[fr] Review transaction',
        suspiciousBannerTitle: '[fr] Suspicious transaction',
        suspiciousBannerDescription: '[fr] We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "[fr] Your card is temporarily locked while our team reviews your company's account.",
        markTransactionsAsReimbursable: '[fr] Mark transactions as reimbursable',
        markTransactionsDescription: '[fr] When enabled, transactions imported from this card are marked as reimbursable by default.',
        csvCardDescription: '[fr] CSV Import',
        cardDetails: {
            cardNumber: '[fr] Virtual card number',
            expiration: '[fr] Expiration',
            cvv: '[fr] CVV',
            address: '[fr] Address',
            revealDetails: '[fr] Reveal details',
            revealCvv: '[fr] Reveal CVV',
            copyCardNumber: '[fr] Copy card number',
            updateAddress: '[fr] Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `[fr] Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: '[fr] An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "[fr] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[fr] Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        unexpectedError: '[fr] There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: '[fr] Yes, I do',
            reportFraudButtonText: "[fr] No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `[fr] cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `[fr] deactivated the card ending in ${cardLastFour}`,
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
            }) => `[fr] identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?

${amount} for ${merchant} - ${date}`,
        },
        setYourPin: '[fr] Set the PIN for your card.',
        confirmYourPin: '[fr] Enter your PIN again to confirm.',
        changeYourPin: '[fr] Enter a new PIN for your card.',
        confirmYourChangedPin: '[fr] Confirm your new PIN.',
        pinMustBeFourDigits: '[fr] PIN must be exactly 4 digits.',
        invalidPin: '[fr] Please choose a more secure PIN.',
        pinMismatch: '[fr] PINs do not match. Please try again.',
        revealPin: '[fr] Reveal PIN',
        hidePin: '[fr] Hide PIN',
        pin: '[fr] PIN',
        pinChanged: '[fr] PIN changed!',
        pinChangedHeader: '[fr] PIN changed',
        pinChangedDescription: "[fr] You're all set to use your PIN now.",
        changePin: '[fr] Change PIN',
        changePinAtATM: '[fr] Change your PIN at any ATM',
        changePinAtATMDescription: '[fr] This is required in your region. <concierge-link>Reach out to Concierge</concierge-link> if you have any questions.',
        freezeCard: '[fr] Freeze card',
        unfreeze: '[fr] Unfreeze',
        unfreezeCard: '[fr] Unfreeze card',
        askToUnfreeze: '[fr] Ask to unfreeze',
        freezeDescription: '[fr] A frozen card cannot be used for purchases and transactions. You can unfreeze it at any time.',
        unfreezeDescription: "[fr] Unfreezing this card will start allowing purchases and transactions again. Only proceed if you're sure the card is safe to use.",
        frozen: '[fr] Frozen',
        youFroze: ({date}: {date: string}) => `[fr] You froze this card on ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `[fr] ${person} froze this card on ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `[fr] This card was frozen on ${date} by `,
        frozenByAdminNeedsUnfreezePrefix: '[fr] This card was frozen by ',
        frozenByAdminNeedsUnfreezeSuffix: '[fr] . Please contact an admin to unfreeze it.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `[fr] This card was frozen by ${person}. Please contact an admin to unfreeze it.`,
    },
    workflowsPage: {
        workflowTitle: '[fr] Spend',
        workflowDescription: '[fr] Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: '[fr] Submissions',
        submissionFrequencyDescription: '[fr] Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: '[fr] Date of month',
        disableApprovalPromptDescription: '[fr] Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: '[fr] Approvals',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `[fr] expenses from ${members}, and the approver is ${approvers}`,
        addApprovalButton: '[fr] Add approval workflow',
        findWorkflow: '[fr] Find workflow',
        addApprovalTip: '[fr] This default workflow applies to all members, unless a more specific workflow exists.',
        approver: '[fr] Approver',
        addApprovalsDescription: '[fr] Require additional approval before authorizing a payment.',
        makeOrTrackPaymentsTitle: '[fr] Payments',
        makeOrTrackPaymentsDescription: '[fr] Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '[fr] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '[fr] <muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: '[fr] Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: '[fr] Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: '[fr] Instantly',
            weekly: '[fr] Weekly',
            monthly: '[fr] Monthly',
            twiceAMonth: '[fr] Twice a month',
            byTrip: '[fr] By trip',
            manually: '[fr] Manually',
            daily: '[fr] Daily',
            lastDayOfMonth: '[fr] Last day of the month',
            lastBusinessDayOfMonth: '[fr] Last business day of the month',
            ordinals: {
                one: '[fr] st',
                two: '[fr] nd',
                few: '[fr] rd',
                other: '[fr] th',
                '1': '[fr] First',
                '2': '[fr] Second',
                '3': '[fr] Third',
                '4': '[fr] Fourth',
                '5': '[fr] Fifth',
                '6': '[fr] Sixth',
                '7': '[fr] Seventh',
                '8': '[fr] Eighth',
                '9': '[fr] Ninth',
                '10': '[fr] Tenth',
            },
        },
        approverInMultipleWorkflows: '[fr] This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `[fr] <strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: '[fr] No members to display',
            expensesFromSubtitle: '[fr] All workspace members already belong to an existing approval workflow.',
            approverSubtitle: '[fr] All approvers belong to an existing workflow.',
            bulkApproverSubtitle: '[fr] No approvers match the criteria for selected reports.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "[fr] Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "[fr] Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: '[fr] Confirm',
        header: '[fr] Add more approvers and confirm.',
        additionalApprover: '[fr] Additional approver',
        submitButton: '[fr] Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: '[fr] Edit approval workflow',
        deleteTitle: '[fr] Delete approval workflow',
        deletePrompt: '[fr] Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: '[fr] Expenses from',
        header: '[fr] When the following members submit expenses:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "[fr] The approver couldn't be changed. Please try again or contact support.",
        title: '[fr] Set approver',
        description: '[fr] This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: '[fr] Approver',
        header: '[fr] (Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `[fr] Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : '[fr] Add another approver when a report exceeds the amount below:',
        reportAmountLabel: '[fr] Report amount',
        additionalApproverLabel: '[fr] Additional approver',
        skip: '[fr] Skip',
        next: '[fr] Next',
        removeLimit: '[fr] Remove limit',
        enterAmountError: '[fr] Please enter a valid amount',
        enterApproverError: '[fr] Approver is required when you set a report limit',
        enterBothError: '[fr] Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `[fr] Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: '[fr] Authorized payer',
        genericErrorMessage: '[fr] The authorized payer could not be changed. Please try again.',
        admins: '[fr] Admins',
        payer: '[fr] Payer',
        paymentAccount: '[fr] Payment account',
        shareBankAccount: {
            shareTitle: '[fr] Share bank account access?',
            shareDescription: ({admin}: {admin: string}) => `[fr] You'll need to share bank account access with ${admin} to make them the payer.`,
            validationTitle: '[fr] Bank account awaiting validation',
            validationDescription: ({admin}: {admin: string}) =>
                `[fr] You need to <a href="#">validate this bank account</a>. Once that's done, you can share bank account access with ${admin} to make them the payer.`,
            errorTitle: "[fr] Can't change payer",
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `[fr] ${admin} doesn't have access to this bank account, so you can't make them the payer. <a href="#">Chat with ${owner}</a> if the bank account should be shared.`,
        },
    },
    reportFraudPage: {
        title: '[fr] Report virtual card fraud',
        description: '[fr] If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: '[fr] Deactivate card',
        reportVirtualCardFraud: '[fr] Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: '[fr] Card fraud reported',
        description: '[fr] We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        buttonText: '[fr] Got it, thanks!',
    },
    activateCardPage: {
        activateCard: '[fr] Activate card',
        pleaseEnterLastFour: '[fr] Please enter the last four digits of your card.',
        activatePhysicalCard: '[fr] Activate physical card',
        error: {
            thatDidNotMatch: "[fr] That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "[fr] You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: '[fr] Get physical card',
        nameMessage: '[fr] Enter your first and last name, as this will be shown on your card.',
        legalName: '[fr] Legal name',
        legalFirstName: '[fr] Legal first name',
        legalLastName: '[fr] Legal last name',
        phoneMessage: '[fr] Enter your phone number.',
        phoneNumber: '[fr] Phone number',
        address: '[fr] Address',
        addressMessage: '[fr] Enter your shipping address.',
        streetAddress: '[fr] Street Address',
        city: '[fr] City',
        state: '[fr] State',
        zipPostcode: '[fr] Zip/Postcode',
        country: '[fr] Country',
        confirmMessage: '[fr] Please confirm your details below.',
        estimatedDeliveryMessage: '[fr] Your physical card will arrive in 2-3 business days.',
        next: '[fr] Next',
        getPhysicalCard: '[fr] Get physical card',
        shipCard: '[fr] Ship card',
    },
    transferAmountPage: {
        transfer: (amount: string) => `[fr] Transfer${amount ? ` ${amount}` : ''}`,
        instant: '[fr] Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `[fr] ${rate}% fee (${minAmount} minimum)`,
        ach: '[fr] 1-3 Business days (Bank account)',
        achSummary: '[fr] No fee',
        whichAccount: '[fr] Which account?',
        fee: '[fr] Fee',
        transferSuccess: '[fr] Transfer successful!',
        transferDetailBankAccount: '[fr] Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: '[fr] Your money should arrive immediately.',
        failedTransfer: '[fr] Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: '[fr] Please transfer your balance from the wallet page',
        goToWallet: '[fr] Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: '[fr] Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: '[fr] Add payment method',
        addNewDebitCard: '[fr] Add new debit card',
        addNewBankAccount: '[fr] Add new bank account',
        accountLastFour: '[fr] Ending in',
        cardLastFour: '[fr] Card ending in',
        addFirstPaymentMethod: '[fr] Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: '[fr] Default',
        bankAccountLastFour: (lastFour: string) => `[fr] Bank Account • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '[fr] Expense rules',
        subtitle: '[fr] These rules will apply to your expenses.',
        findRule: '[fr] Find rule',
        emptyRules: {
            title: "[fr] You haven't created any rules",
            subtitle: '[fr] Add a rule to automate expense reporting.',
        },
        changes: {
            billableUpdate: (value: boolean) => `[fr] Update expense ${value ? '[fr] billable' : '[fr] non-billable'}`,
            categoryUpdate: (value: string) => `[fr] Update category to "${value}"`,
            commentUpdate: (value: string) => `[fr] Update description to "${value}"`,
            merchantUpdate: (value: string) => `[fr] Update merchant to "${value}"`,
            reimbursableUpdate: (value: boolean) => `[fr] Update expense ${value ? '[fr] reimbursable' : '[fr] non-reimbursable'}`,
            tagUpdate: (value: string) => `[fr] Update tag to "${value}"`,
            taxUpdate: (value: string) => `[fr] Update tax rate to "${value}"`,
            billable: (value: boolean) => `[fr] expense ${value ? '[fr] billable' : '[fr] non-billable'}`,
            category: (value: string) => `[fr] category to "${value}"`,
            comment: (value: string) => `[fr] description to "${value}"`,
            merchant: (value: string) => `[fr] merchant to "${value}"`,
            reimbursable: (value: boolean) => `[fr] expense ${value ? '[fr] reimbursable' : '[fr] non-reimbursable'}`,
            tag: (value: string) => `[fr] tag to "${value}"`,
            tax: (value: string) => `[fr] tax rate to "${value}"`,
            report: (value: string) => `[fr] add to a report named "${value}"`,
        },
        newRule: '[fr] New rule',
        addRule: {
            title: '[fr] Add rule',
            expenseContains: '[fr] If expense contains:',
            applyUpdates: '[fr] Then apply these updates:',
            merchantHint: '[fr] Type . to create a rule that applies to all merchants',
            addToReport: '[fr] Add to a report named',
            createReport: '[fr] Create report if necessary',
            applyToExistingExpenses: '[fr] Apply to existing matching expenses',
            confirmError: '[fr] Enter merchant and apply at least one update',
            confirmErrorMerchant: '[fr] Please enter merchant',
            confirmErrorUpdate: '[fr] Please apply at least one update',
            saveRule: '[fr] Save rule',
        },
        editRule: {
            title: '[fr] Edit rule',
        },
        deleteRule: {
            deleteSingle: '[fr] Delete rule',
            deleteMultiple: '[fr] Delete rules',
            deleteSinglePrompt: '[fr] Are you sure you want to delete this rule?',
            deleteMultiplePrompt: '[fr] Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: '[fr] App preferences',
        },
        testSection: {
            title: '[fr] Test preferences',
            subtitle: '[fr] Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '[fr] Receive relevant feature updates and Expensify news',
        muteAllSounds: '[fr] Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: '[fr] Priority mode',
        explainerText: '[fr] Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: '[fr] Most recent',
                description: '[fr] Show all chats sorted by most recent',
            },
            gsd: {
                label: '[fr] #focus',
                description: '[fr] Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `[fr] in ${policyName}`,
        generatingPDF: '[fr] Generate PDF',
        waitForPDF: '[fr] Please wait while we generate the PDF.',
        errorPDF: '[fr] There was an error when trying to generate your PDF',
        successPDF: "[fr] Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: '[fr] Room description',
        roomDescriptionOptional: '[fr] Room description (optional)',
        explainerText: '[fr] Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: '[fr] Heads up!',
        lastMemberWarning: "[fr] Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: (displayName: string) => `[fr] ${displayName}'s group chat`,
    },
    languagePage: {
        language: '[fr] Language',
        aiGenerated: '[fr] The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: '[fr] Theme',
        themes: {
            dark: {
                label: '[fr] Dark',
            },
            light: {
                label: '[fr] Light',
            },
            system: {
                label: '[fr] Use device settings',
            },
        },
        highContrastMode: '[fr] High contrast mode',
        chooseThemeBelowOrSync: '[fr] Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `[fr] <muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `[fr] Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "[fr] Didn't receive a magic code?",
        enterAuthenticatorCode: '[fr] Please enter your authenticator code',
        enterRecoveryCode: '[fr] Please enter your recovery code',
        requiredWhen2FAEnabled: '[fr] Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `[fr] Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '[fr] Request a new code',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `[fr] Time remaining: ${timeRemaining} ${timeRemaining === 1 ? '[fr] second' : '[fr] seconds'}`,
        timeExpiredAnnouncement: '[fr] The time has expired',
        error: {
            pleaseFillMagicCode: '[fr] Please enter your magic code',
            incorrectMagicCode: '[fr] Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: '[fr] Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '[fr] Please fill out all fields',
        pleaseFillPassword: '[fr] Please enter your password',
        pleaseFillTwoFactorAuth: '[fr] Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: '[fr] Enter your two-factor authentication code to continue',
        forgot: '[fr] Forgot?',
        requiredWhen2FAEnabled: '[fr] Required when 2FA is enabled',
        error: {
            incorrectPassword: '[fr] Incorrect password. Please try again.',
            incorrectLoginOrPassword: '[fr] Incorrect login or password. Please try again.',
            incorrect2fa: '[fr] Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: '[fr] You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: '[fr] Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                '[fr] We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: '[fr] You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: '[fr] Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: '[fr] Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: '[fr] Phone or email',
        error: {
            invalidFormatEmailLogin: '[fr] The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "[fr] Couldn't retrieve account details. Please try to sign in again.",
        loginForm: '[fr] Login form',
        notYou: (user: string) => `[fr] Not ${user}?`,
    },
    onboarding: {
        welcome: '[fr] Welcome!',
        welcomeSignOffTitleManageTeam: '[fr] Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "[fr] It's great to meet you!",
        explanationModal: {
            title: '[fr] Welcome to Expensify',
            description: '[fr] One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: '[fr] To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: '[fr] Get started',
        whatsYourName: "[fr] What's your name?",
        peopleYouMayKnow: '[fr] People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: (domain: string, email: string) => `[fr] Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '[fr] Join a workspace',
        listOfWorkspaces: "[fr] Here's the list of workspaces you can join. Don't worry, you can always join them later if you prefer.",
        skipForNow: '[fr] Skip for now',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `[fr] ${employeeCount} member${employeeCount > 1 ? '[fr] s' : ''} • ${policyOwner}`,
        whereYouWork: '[fr] Where do you work?',
        errorSelection: '[fr] Select an option to move forward',
        purpose: {
            title: '[fr] What do you want to do today?',
            errorContinue: '[fr] Please press continue to get set up',
            errorBackButton: '[fr] Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '[fr] Get paid back by my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "[fr] Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '[fr] Track and budget expenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '[fr] Chat and split expenses with friends',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '[fr] Something else',
        },
        employees: {
            title: '[fr] How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '[fr] 1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '[fr] 11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '[fr] 51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '[fr] 101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '[fr] More than 1,000 employees',
        },
        accounting: {
            title: '[fr] Do you use any accounting software?',
            none: '[fr] None',
        },
        interestedFeatures: {
            title: '[fr] What features are you interested in?',
            featuresAlreadyEnabled: '[fr] Here are our most popular features:',
            featureYouMayBeInterestedIn: '[fr] Enable additional features:',
        },
        error: {
            requiredFirstName: '[fr] Please input your first name to continue',
        },
        workEmail: {
            title: '[fr] What’s your work email?',
            subtitle: '[fr] Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: '[fr] Forward to receipts@expensify.com for scanning',
                descriptionTwo: '[fr] Join your colleagues already using Expensify',
                descriptionThree: '[fr] Enjoy a more customized experience',
            },
            addWorkEmail: '[fr] Add work email',
        },
        workEmailValidation: {
            title: '[fr] Verify your work email',
            magicCodeSent: (workEmail: string | undefined) => `[fr] Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: '[fr] Please enter a valid work email from a private domain e.g. mitch@company.com',
            sameAsSignupEmail: '[fr] Please enter a different email than the one you signed up with',
            offline: '[fr] We couldn’t add your work email as you appear to be offline',
        },
        mergeBlockScreen: {
            title: '[fr] Couldn’t add work email',
            subtitle: (workEmail: string | undefined) => `[fr] We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[fr] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[fr] [Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[fr] Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[fr] Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: '[fr] Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [fr] *Add expense approvals* to review your team's spend and keep it under control.

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
                title: ({workspaceConfirmationLink}) => `[fr] [Create](${workspaceConfirmationLink}) a workspace`,
                description: '[fr] Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[fr] Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [fr] *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[fr] Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        [fr] *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '[fr] Submit an expense',
                description: dedent(`
                    [fr] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: '[fr] Submit an expense',
                description: dedent(`
                    [fr] *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the *+* button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: '[fr] Track an expense',
                description: dedent(`
                    [fr] *Track an expense* in any currency, whether you have a receipt or not.

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
                    `[fr] Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '[fr]  to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[fr] your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        [fr] Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '[fr] your' : '[fr] to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        [Take me to accounting](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[fr] Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        [fr] Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[fr] Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [fr] *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[fr] Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        [fr] *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[fr] Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        [fr] Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

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
                title: ({workspaceMembersLink}) => `[fr] Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        [fr] *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },
            startChatTask: {
                title: '[fr] Start a chat',
                description: dedent(`
                    [fr] *Start a chat* with anyone using their email or phone number.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },
            splitExpenseTask: {
                title: '[fr] Split an expense',
                description: dedent(`
                    [fr] *Split expenses* with one or more people.

                    1. Click the *+* button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[fr] Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        [fr] Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: '[fr] Create your first report',
                description: dedent(`
                    [fr] Here's how to create a report:

                    1. Click the *+* button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[fr] Take a [test drive](${testDriveURL})` : '[fr] Take a test drive'),
            embeddedDemoIframeTitle: '[fr] Test Drive',
            employeeFakeReceipt: {
                description: '[fr] My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '[fr] Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: '[fr] Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        [fr] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        [fr] # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage: '[fr] To make the most of your 30-day free trial, follow the remaining steps below:',
            onboardingChatSplitMessage: '[fr] Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "[fr] Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingTestDriveReceiverMessage: "[fr] *You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: '[fr] Stay organized with a workspace',
            subtitle: '[fr] Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: '[fr] Track and organize receipts',
                descriptionTwo: '[fr] Categorize and tag expenses',
                descriptionThree: '[fr] Create and share reports',
            },
            price: (price?: string) => `[fr] Try it free for 30 days, then upgrade for just <strong>${price ?? '$5'}/user/month</strong>.`,
            createWorkspace: '[fr] Create workspace',
        },
        confirmWorkspace: {
            title: '[fr] Confirm workspace',
            subtitle: '[fr] Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: '[fr] Invite members',
            subtitle: '[fr] Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "[fr] Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '[fr] Name cannot contain special characters',
            containsReservedWord: '[fr] Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: '[fr] Name cannot contain a comma or semicolon',
            requiredFirstName: '[fr] First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "[fr] What's your legal name?",
        enterDateOfBirth: "[fr] What's your date of birth?",
        enterAddress: "[fr] What's your address?",
        enterPhoneNumber: "[fr] What's your phone number?",
        personalDetails: '[fr] Personal details',
        privateDataMessage: '[fr] These details are used for travel and payments. They are never shown on your public profile.',
        legalName: '[fr] Legal name',
        legalFirstName: '[fr] Legal first name',
        legalLastName: '[fr] Legal last name',
        address: '[fr] Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `[fr] Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `[fr] Date should be after ${dateString}`,
            hasInvalidCharacter: '[fr] Name can only include Latin characters',
            cannotIncludeCommaOrSemicolon: '[fr] Name cannot contain a comma or semicolon',
            incorrectZipFormat: (zipFormat?: string) => `[fr] Incorrect zip code format${zipFormat ? `[fr]  Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `[fr] Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '[fr] Link has been re-sent',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `[fr] I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: '[fr] Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) => `[fr] To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `[fr] If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '[fr] Unlink',
        linkSent: '[fr] Link sent!',
        successfullyUnlinkedLogin: '[fr] Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) => `[fr] Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `[fr] <strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `[fr] <strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `[fr] Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: '[fr] Something went wrong...',
        subtitle: `[fr] We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: '[fr] Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `[fr] We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: '[fr] Your number has been validated! Click below to send a new magic sign-in code.',
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
                return '[fr] Please wait a moment before trying again.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '[fr] day' : '[fr] days'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '[fr] hour' : '[fr] hours'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '[fr] minute' : '[fr] minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `[fr] Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: '[fr] Join',
    },
    detailsPage: {
        localTime: '[fr] Local time',
    },
    newChatPage: {
        startGroup: '[fr] Start group',
        addToGroup: '[fr] Add to group',
        addUserToGroup: (username: string) => `[fr] Add ${username} to group`,
    },
    yearPickerPage: {
        year: '[fr] Year',
        selectYear: '[fr] Please select a year',
    },
    monthPickerPage: {
        month: '[fr] Month',
        selectMonth: '[fr] Please select a month',
    },
    focusModeUpdateModal: {
        title: '[fr] Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `[fr] Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: '[fr] The chat you are looking for cannot be found.',
        getMeOutOfHere: '[fr] Get me out of here',
        iouReportNotFound: '[fr] The payment details you are looking for cannot be found.',
        notHere: "[fr] Hmm... it's not here",
        pageNotFound: '[fr] Oops, this page cannot be found',
        noAccess: '[fr] This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: '[fr] Go back to home page',
        commentYouLookingForCannotBeFound: '[fr] The comment you are looking for cannot be found.',
        goToChatInstead: '[fr] Go to the chat instead.',
        contactConcierge: '[fr] For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `[fr] Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: '[fr] Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "[fr] That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: '[fr] Status',
        statusExplanation: "[fr] Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: '[fr] Today',
        clearStatus: '[fr] Clear status',
        save: '[fr] Save',
        message: '[fr] Message',
        timePeriods: {
            never: '[fr] Never',
            thirtyMinutes: '[fr] 30 minutes',
            oneHour: '[fr] 1 hour',
            afterToday: '[fr] Today',
            afterWeek: '[fr] A week',
            custom: '[fr] Custom',
        },
        untilTomorrow: '[fr] Until tomorrow',
        untilTime: (time: string) => `[fr] Until ${time}`,
        date: '[fr] Date',
        time: '[fr] Time',
        clearAfter: '[fr] Clear after',
        whenClearStatus: '[fr] When should we clear your status?',
        setVacationDelegate: `[fr] Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        cannotSetVacationDelegate: `[fr] You can't set a vacation delegate because you're currently the delegate for the following members:`,
        vacationDelegateError: '[fr] There was an error updating your vacation delegate.',
        asVacationDelegate: (nameOrEmail: string) => `[fr] as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `[fr] to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `[fr] You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `[fr] Step ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '[fr] Bank info',
        confirmBankInfo: '[fr] Confirm bank info',
        manuallyAdd: '[fr] Manually add your bank account',
        letsDoubleCheck: "[fr] Let's double check that everything looks right.",
        accountEnding: '[fr] Account ending in',
        thisBankAccount: '[fr] This bank account will be used for business payments on your workspace',
        accountNumber: '[fr] Account number',
        routingNumber: '[fr] Routing number',
        chooseAnAccountBelow: '[fr] Choose an account below',
        addBankAccount: '[fr] Add bank account',
        chooseAnAccount: '[fr] Choose an account',
        connectOnlineWithPlaid: '[fr] Log into your bank',
        connectManually: '[fr] Connect manually',
        desktopConnection: '[fr] Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: '[fr] Your data is secure',
        toGetStarted: '[fr] Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: '[fr] Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: '[fr] Your routing number and account number can be found on a check for the account.',
        bankAccountPurposeTitle: '[fr] What do you want to do with your bank account?',
        getReimbursed: '[fr] Get reimbursed',
        getReimbursedDescription: '[fr] By employer or others',
        makePayments: '[fr] Make payments',
        makePaymentsDescription: '[fr] Pay expenses or issue Expensify Cards',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `[fr] To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: '[fr] An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: (workspaceRoute: string) =>
            `[fr] Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: '[fr] Business bank account added!',
        bbaAddedDescription: "[fr] It's ready to be used for payments.",
        lockedBankAccount: '[fr] Locked bank account',
        unlockBankAccount: '[fr] Unlock bank account',
        youCantPayThis: `[fr] You can't pay this report because you have a <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">locked bank account</a>. Tap below and Concierge will help with the next steps to unlock it.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `[fr] <h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `[fr] Expensify Business Bank Account ${maskedAccountNumber}
Thank you for submitting a request to unlock your bank account. Withdrawal requests can be rejected due to insufficient funds, or if the bank account has not been enabled for direct debit. We will review your case and reach out to you if we need anything else to resolve this issue.`,
        error: {
            youNeedToSelectAnOption: '[fr] Please select an option to proceed',
            noBankAccountAvailable: "[fr] Sorry, there's no bank account available",
            noBankAccountSelected: '[fr] Please choose an account',
            taxID: '[fr] Please enter a valid tax ID number',
            website: '[fr] Please enter a valid website',
            zipCode: `[fr] Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '[fr] Please enter a valid phone number',
            email: '[fr] Please enter a valid email address',
            companyName: '[fr] Please enter a valid business name',
            addressCity: '[fr] Please enter a valid city',
            addressStreet: '[fr] Please enter a valid street address',
            addressState: '[fr] Please select a valid state',
            incorporationDateFuture: "[fr] Incorporation date can't be in the future",
            incorporationState: '[fr] Please select a valid state',
            industryCode: '[fr] Please enter a valid industry classification code with six digits',
            restrictedBusiness: "[fr] Please confirm the business isn't on the list of restricted businesses",
            routingNumber: '[fr] Please enter a valid routing number',
            accountNumber: '[fr] Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "[fr] Routing and account numbers can't match",
            companyType: '[fr] Please select a valid company type',
            tooManyAttempts: '[fr] Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: '[fr] Please enter a valid address',
            dob: '[fr] Please select a valid date of birth',
            age: '[fr] Must be over 18 years old',
            ssnLast4: '[fr] Please enter valid last 4 digits of SSN',
            firstName: '[fr] Please enter a valid first name',
            lastName: '[fr] Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: '[fr] Please add a default deposit account or debit card',
            validationAmounts: '[fr] The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: '[fr] Please enter a valid full name',
            ownershipPercentage: '[fr] Please enter a valid percentage number',
            deletePaymentBankAccount:
                "[fr] This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: '[fr] The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "[fr] Where's your bank account located?",
        accountDetailsStepHeader: '[fr] What are your account details?',
        accountTypeStepHeader: '[fr] What type of account is this?',
        bankInformationStepHeader: '[fr] What are your bank details?',
        accountHolderInformationStepHeader: '[fr] What are the account holder details?',
        howDoWeProtectYourData: '[fr] How do we protect your data?',
        currencyHeader: "[fr] What's your bank account's currency?",
        confirmationStepHeader: '[fr] Check your info.',
        confirmationStepSubHeader: '[fr] Double check the details below, and check the terms box to confirm.',
        toGetStarted: '[fr] Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
    },
    addPersonalBankAccountPage: {
        enterPassword: '[fr] Enter Expensify password',
        alreadyAdded: '[fr] This account has already been added.',
        chooseAccountLabel: '[fr] Account',
        successTitle: '[fr] Personal bank account added!',
        successMessage: '[fr] Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: '[fr] Unknown filename',
        passwordRequired: '[fr] Please enter a password',
        passwordIncorrect: '[fr] Incorrect password. Please try again.',
        failedToLoadPDF: '[fr] Failed to load PDF file',
        pdfPasswordForm: {
            title: '[fr] Password protected PDF',
            infoText: '[fr] This PDF is password protected.',
            beforeLinkText: '[fr] Please',
            linkText: '[fr] enter the password',
            afterLinkText: '[fr] to view it.',
            formLabel: '[fr] View PDF',
        },
        attachmentNotFound: '[fr] Attachment not found',
        retry: '[fr] Retry',
    },
    messages: {
        errorMessageInvalidPhone: `[fr] Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '[fr] Invalid email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `[fr] ${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `[fr] ${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '[fr] By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: '[fr] Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `[fr] <muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: '[fr] Try again',
        verifyIdentity: '[fr] Verify identity',
        letsVerifyIdentity: "[fr] Let's verify your identity",
        butFirst: `[fr] But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '[fr] An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: '[fr] Enable camera access',
        cameraRequestMessage: '[fr] We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: '[fr] Enable microphone access',
        microphoneRequestMessage: '[fr] We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: '[fr] Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: '[fr] Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "[fr] There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "[fr] There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "[fr] Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "[fr] Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: '[fr] Additional details',
        helpText: '[fr] We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: '[fr] We need to ask you just a few more questions to finish validating your identity.',
        helpLink: '[fr] Learn more about why we need this.',
        legalFirstNameLabel: '[fr] Legal first name',
        legalMiddleNameLabel: '[fr] Legal middle name',
        legalLastNameLabel: '[fr] Legal last name',
        selectAnswer: '[fr] Please select a response to proceed',
        ssnFull9Error: '[fr] Please enter a valid nine-digit SSN',
        needSSNFull9: "[fr] We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "[fr] We couldn't verify",
        pleaseFixIt: '[fr] Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `[fr] We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: '[fr] Terms and fees',
        headerTitleRefactor: '[fr] Fees and terms',
        haveReadAndAgreePlain: '[fr] I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `[fr] I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: '[fr] I agree to the Privacy and Wallet agreement.',
        agreeToThe: (walletAgreementUrl: string) =>
            `[fr] I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: '[fr] Enable payments',
        monthlyFee: '[fr] Monthly fee',
        inactivity: '[fr] Inactivity',
        noOverdraftOrCredit: '[fr] No overdraft/credit feature.',
        electronicFundsWithdrawal: '[fr] Electronic funds withdrawal',
        standard: '[fr] Standard',
        reviewTheFees: '[fr] Take a look at some fees.',
        checkTheBoxes: '[fr] Please check the boxes below.',
        agreeToTerms: '[fr] Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `[fr] The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: '[fr] Per purchase',
            atmWithdrawal: '[fr] ATM withdrawal',
            cashReload: '[fr] Cash reload',
            inNetwork: '[fr] in-network',
            outOfNetwork: '[fr] out-of-network',
            atmBalanceInquiry: '[fr] ATM balance inquiry (in-network or out-of-network)',
            customerService: '[fr] Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: '[fr] Inactivity (after 12 months with no transactions)',
            weChargeOneFee: '[fr] We charge 1 other type of fee. It is:',
            fdicInsurance: '[fr] Your funds are eligible for FDIC insurance.',
            generalInfo: `[fr] For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `[fr] For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: '[fr] Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: (amount: string) => `[fr] (min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '[fr] A list of all Expensify Wallet fees',
            typeOfFeeHeader: '[fr] All fees',
            feeAmountHeader: '[fr] Amount',
            moreDetailsHeader: '[fr] Details',
            openingAccountTitle: '[fr] Opening an account',
            openingAccountDetails: "[fr] There's no fee to open an account.",
            monthlyFeeDetails: "[fr] There's no monthly fee.",
            customerServiceTitle: '[fr] Customer service',
            customerServiceDetails: '[fr] There are no customer service fees.',
            inactivityDetails: "[fr] There's no inactivity fee.",
            sendingFundsTitle: '[fr] Sending funds to another account holder',
            sendingFundsDetails: "[fr] There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "[fr] There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "[fr] There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                `[fr]  The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `[fr] Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                `[fr]  Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `[fr] Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `[fr] For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: '[fr] View printer-friendly version',
            automated: '[fr] Automated',
            liveAgent: '[fr] Live agent',
            instant: '[fr] Instant',
            electronicFundsInstantFeeMin: (amount: string) => `[fr] Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '[fr] Enable payments',
        activatedTitle: '[fr] Wallet activated!',
        activatedMessage: '[fr] Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: '[fr] Just a minute...',
        checkBackLaterMessage: "[fr] We're still reviewing your information. Please check back later.",
        continueToPayment: '[fr] Continue to payment',
        continueToTransfer: '[fr] Continue to transfer',
    },
    companyStep: {
        headerTitle: '[fr] Company information',
        subtitle: '[fr] Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: '[fr] Legal business name',
        companyWebsite: '[fr] Company website',
        taxIDNumber: '[fr] Tax ID number',
        taxIDNumberPlaceholder: '[fr] 9 digits',
        companyType: '[fr] Company type',
        incorporationDate: '[fr] Incorporation date',
        incorporationState: '[fr] Incorporation state',
        industryClassificationCode: '[fr] Industry classification code',
        confirmCompanyIsNot: '[fr] I confirm that this company is not on the',
        listOfRestrictedBusinesses: '[fr] list of restricted businesses',
        incorporationDatePlaceholder: '[fr] Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '[fr] LLC',
            CORPORATION: '[fr] Corp',
            PARTNERSHIP: '[fr] Partnership',
            COOPERATIVE: '[fr] Cooperative',
            SOLE_PROPRIETORSHIP: '[fr] Sole proprietorship',
            OTHER: '[fr] Other',
        },
        industryClassification: '[fr] Which industry is the business classified under?',
        industryClassificationCodePlaceholder: '[fr] Search for industry classification code',
    },
    requestorStep: {
        headerTitle: '[fr] Personal information',
        learnMore: '[fr] Learn more',
        isMyDataSafe: '[fr] Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: '[fr] Personal info',
        enterYourLegalFirstAndLast: "[fr] What's your legal name?",
        legalFirstName: '[fr] Legal first name',
        legalLastName: '[fr] Legal last name',
        legalName: '[fr] Legal name',
        enterYourDateOfBirth: "[fr] What's your date of birth?",
        enterTheLast4: '[fr] What are the last four digits of your Social Security Number?',
        dontWorry: "[fr] Don't worry, we don't do any personal credit checks!",
        last4SSN: '[fr] Last 4 of SSN',
        enterYourAddress: "[fr] What's your address?",
        address: '[fr] Address',
        letsDoubleCheck: "[fr] Let's double check that everything looks right.",
        byAddingThisBankAccount: "[fr] By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: '[fr] What’s your legal name?',
        whatsYourDOB: '[fr] What’s your date of birth?',
        whatsYourAddress: '[fr] What’s your address?',
        whatsYourSSN: '[fr] What are the last four digits of your Social Security Number?',
        noPersonalChecks: '[fr] Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: '[fr] What’s your phone number?',
        weNeedThisToVerify: '[fr] We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: '[fr] Company info',
        enterTheNameOfYourBusiness: "[fr] What's the name of your company?",
        businessName: '[fr] Legal company name',
        enterYourCompanyTaxIdNumber: "[fr] What's your company’s Tax ID number?",
        taxIDNumber: '[fr] Tax ID number',
        taxIDNumberPlaceholder: '[fr] 9 digits',
        enterYourCompanyWebsite: "[fr] What's your company’s website?",
        companyWebsite: '[fr] Company website',
        enterYourCompanyPhoneNumber: "[fr] What's your company’s phone number?",
        enterYourCompanyAddress: "[fr] What's your company’s address?",
        selectYourCompanyType: '[fr] What type of company is it?',
        companyType: '[fr] Company type',
        incorporationType: {
            LLC: '[fr] LLC',
            CORPORATION: '[fr] Corp',
            PARTNERSHIP: '[fr] Partnership',
            COOPERATIVE: '[fr] Cooperative',
            SOLE_PROPRIETORSHIP: '[fr] Sole proprietorship',
            OTHER: '[fr] Other',
        },
        selectYourCompanyIncorporationDate: "[fr] What's your company’s incorporation date?",
        incorporationDate: '[fr] Incorporation date',
        incorporationDatePlaceholder: '[fr] Start date (yyyy-mm-dd)',
        incorporationState: '[fr] Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '[fr] Which state was your company incorporated in?',
        letsDoubleCheck: "[fr] Let's double check that everything looks right.",
        companyAddress: '[fr] Company address',
        listOfRestrictedBusinesses: '[fr] list of restricted businesses',
        confirmCompanyIsNot: '[fr] I confirm that this company is not on the',
        businessInfoTitle: '[fr] Business info',
        legalBusinessName: '[fr] Legal business name',
        whatsTheBusinessName: "[fr] What's the business name?",
        whatsTheBusinessAddress: "[fr] What's the business address?",
        whatsTheBusinessContactInformation: "[fr] What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "[fr] What's the Company Registration Number (CRN)?";
                default:
                    return "[fr] What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[fr] What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return '[fr] What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return '[fr] What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return '[fr] What’s the Australian Business Number (ABN)?';
                default:
                    return '[fr] What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "[fr] What's this number?",
        whereWasTheBusinessIncorporated: '[fr] Where was the business incorporated?',
        whatTypeOfBusinessIsIt: '[fr] What type of business is it?',
        whatsTheBusinessAnnualPayment: "[fr] What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "[fr] What's your expected average reimbursement amount?",
        registrationNumber: '[fr] Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '[fr] EIN';
                case CONST.COUNTRY.CA:
                    return '[fr] BN';
                case CONST.COUNTRY.GB:
                    return '[fr] VRN';
                case CONST.COUNTRY.AU:
                    return '[fr] ABN';
                default:
                    return '[fr] EU VAT';
            }
        },
        businessAddress: '[fr] Business address',
        businessType: '[fr] Business type',
        incorporation: '[fr] Incorporation',
        incorporationCountry: '[fr] Incorporation country',
        incorporationTypeName: '[fr] Incorporation type',
        businessCategory: '[fr] Business category',
        annualPaymentVolume: '[fr] Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `[fr] Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '[fr] Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `[fr] Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '[fr] Select incorporation type',
        selectBusinessCategory: '[fr] Select business category',
        selectAnnualPaymentVolume: '[fr] Select annual payment volume',
        selectIncorporationCountry: '[fr] Select incorporation country',
        selectIncorporationState: '[fr] Select incorporation state',
        selectAverageReimbursement: '[fr] Select average reimbursement amount',
        selectBusinessType: '[fr] Select business type',
        findIncorporationType: '[fr] Find incorporation type',
        findBusinessCategory: '[fr] Find business category',
        findAnnualPaymentVolume: '[fr] Find annual payment volume',
        findIncorporationState: '[fr] Find incorporation state',
        findAverageReimbursement: '[fr] Find average reimbursement amount',
        findBusinessType: '[fr] Find business type',
        error: {
            registrationNumber: '[fr] Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '[fr] Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return '[fr] Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return '[fr] Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return '[fr] Please provide a valid Australian Business Number (ABN)';
                    default:
                        return '[fr] Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `[fr] Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `[fr] Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `[fr] Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: '[fr] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: '[fr] Business owner',
        enterLegalFirstAndLastName: "[fr] What's the owner's legal name?",
        legalFirstName: '[fr] Legal first name',
        legalLastName: '[fr] Legal last name',
        enterTheDateOfBirthOfTheOwner: "[fr] What's the owner's date of birth?",
        enterTheLast4: '[fr] What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: '[fr] Last 4 of SSN',
        dontWorry: "[fr] Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "[fr] What's the owner's address?",
        letsDoubleCheck: '[fr] Let’s double check that everything looks right.',
        legalName: '[fr] Legal name',
        address: '[fr] Address',
        byAddingThisBankAccount: "[fr] By adding this bank account, you confirm that you've read, understand, and accept",
        owners: '[fr] Owners',
    },
    ownershipInfoStep: {
        ownerInfo: '[fr] Owner info',
        businessOwner: '[fr] Business owner',
        signerInfo: '[fr] Signer info',
        doYouOwn: (companyName: string) => `[fr] Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `[fr] Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: '[fr] Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: '[fr] Legal first name',
        legalLastName: '[fr] Legal last name',
        whatsTheOwnersName: "[fr] What's the owner's legal name?",
        whatsYourName: "[fr] What's your legal name?",
        whatPercentage: '[fr] What percentage of the business belongs to the owner?',
        whatsYoursPercentage: '[fr] What percentage of the business do you own?',
        ownership: '[fr] Ownership',
        whatsTheOwnersDOB: "[fr] What's the owner's date of birth?",
        whatsYourDOB: "[fr] What's your date of birth?",
        whatsTheOwnersAddress: "[fr] What's the owner's address?",
        whatsYourAddress: "[fr] What's your address?",
        whatAreTheLast: "[fr] What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: '[fr] What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: '[fr] What is your country of citizenship?',
        whatsTheOwnersNationality: "[fr] What's the owner's country of citizenship?",
        countryOfCitizenship: '[fr] Country of citizenship',
        dontWorry: "[fr] Don't worry, we don't do any personal credit checks!",
        last4: '[fr] Last 4 of SSN',
        whyDoWeAsk: '[fr] Why do we ask for this?',
        letsDoubleCheck: '[fr] Let’s double check that everything looks right.',
        legalName: '[fr] Legal name',
        ownershipPercentage: '[fr] Ownership percentage',
        areThereOther: (companyName: string) => `[fr] Are there other individuals who own 25% or more of ${companyName}?`,
        owners: '[fr] Owners',
        addCertified: '[fr] Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart: '[fr] Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: '[fr] Upload entity ownership chart',
        noteEntity: '[fr] Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: '[fr] Certified entity ownership chart',
        selectCountry: '[fr] Select country',
        findCountry: '[fr] Find country',
        address: '[fr] Address',
        chooseFile: '[fr] Choose file',
        uploadDocuments: '[fr] Upload additional documentation',
        pleaseUpload: '[fr] Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: '[fr] Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: '[fr] Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "[fr] Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: '[fr] Copy of ID for beneficial owner',
        copyOfIDDescription: "[fr] Examples: Passport, driver's license, etc.",
        proofOfAddress: '[fr] Address proof for beneficial owner',
        proofOfAddressDescription: '[fr] Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: '[fr] Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            '[fr] Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: '[fr] Complete verification',
        confirmAgreements: '[fr] Please confirm the agreements below.',
        certifyTrueAndAccurate: '[fr] I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: '[fr] Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: '[fr] I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: '[fr] You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: '[fr] terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '[fr] Validate your bank account',
        validateButtonText: '[fr] Validate',
        validationInputLabel: '[fr] Transaction',
        maxAttemptsReached: '[fr] Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `[fr] Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '[fr] Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: '[fr] Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: '[fr] Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: '[fr] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: '[fr] Secure your account',
    },
    countryStep: {
        confirmBusinessBank: '[fr] Confirm business bank account currency and country',
        confirmCurrency: '[fr] Confirm currency and country',
        yourBusiness: '[fr] Your business bank account currency must match your workspace currency.',
        youCanChange: '[fr] You can change your workspace currency in your',
        findCountry: '[fr] Find country',
        selectCountry: '[fr] Select country',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `[fr] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> so you can invite a director to sign in a later step.`,
        },
    },
    bankInfoStep: {
        whatAreYour: '[fr] What are your business bank account details?',
        letsDoubleCheck: '[fr] Let’s double check that everything looks fine.',
        thisBankAccount: '[fr] This bank account will be used for business payments on your workspace',
        accountNumber: '[fr] Account number',
        accountHolderNameDescription: "[fr] Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: '[fr] Signer info',
        areYouDirector: (companyName: string) => `[fr] Are you a director at ${companyName}?`,
        regulationRequiresUs: '[fr] Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "[fr] What's your legal name",
        fullName: '[fr] Legal full name',
        whatsYourJobTitle: "[fr] What's your job title?",
        jobTitle: '[fr] Job title',
        whatsYourDOB: "[fr] What's your date of birth?",
        uploadID: '[fr] Upload ID and proof of address',
        personalAddress: '[fr] Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: '[fr] Let’s double check that everything looks right.',
        legalName: '[fr] Legal name',
        proofOf: '[fr] Proof of personal address',
        enterOneEmail: (companyName: string) => `[fr] Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: '[fr] Regulation requires at least one more director as a signer.',
        hangTight: '[fr] Hang tight...',
        enterTwoEmails: (companyName: string) => `[fr] Enter the emails of two directors at ${companyName}`,
        sendReminder: '[fr] Send a reminder',
        chooseFile: '[fr] Choose file',
        weAreWaiting: "[fr] We're waiting for others to verify their identities as directors of the business.",
        id: '[fr] Copy of ID',
        proofOfDirectors: '[fr] Proof of director(s)',
        proofOfDirectorsDescription: '[fr] Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: '[fr] Codice Fiscale',
        codiceFiscaleDescription: '[fr] Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: '[fr] PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            [fr] Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: '[fr] Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: '[fr] Enter signer info',
        thisStep: '[fr] This step has been completed',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `[fr] is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: '[fr] Emails must be different',
            connectToWorkspace: (workspaceRoute: string) => `[fr] Please connect this bank account to a <a href="${workspaceRoute}">workspace</a> to invite a director to sign.`,
        },
    },
    agreementsStep: {
        agreements: '[fr] Agreements',
        pleaseConfirm: '[fr] Please confirm the agreements below',
        regulationRequiresUs: '[fr] Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: '[fr] I am authorized to use the business bank account for business spend.',
        iCertify: '[fr] I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `[fr] I accept the <a href="https://www.corpay.com/cross-border/terms">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: '[fr] I accept the terms and conditions.',
        accept: '[fr] Accept and add bank account',
        iConsentToThePrivacyNotice: '[fr] I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: '[fr] I consent to the privacy notice.',
        error: {
            authorized: '[fr] You must be a controlling officer with authorization to operate the business bank account',
            certify: '[fr] Please certify that the information is true and accurate',
            consent: '[fr] Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: '[fr] Docusign Form',
        pleaseComplete:
            '[fr] Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: '[fr] Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            '[fr] Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: '[fr] Take me to Docusign',
        uploadAdditional: '[fr] Upload additional documentation',
        pleaseUpload: '[fr] Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: '[fr] Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "[fr] Let's finish in chat!",
        thanksFor:
            "[fr] Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: '[fr] I have a question',
        enable2FA: '[fr] Enable two-factor authentication (2FA) to prevent fraud',
        weTake: '[fr] We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: '[fr] Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '[fr] One moment',
        explanationLine: "[fr] We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "[fr] Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: '[fr] Book travel',
        title: '[fr] Travel smart',
        subtitle: '[fr] Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: '[fr] Save money on your bookings',
            alerts: '[fr] Get realtime alerts if your travel plans change',
        },
        bookTravel: '[fr] Book travel',
        bookDemo: '[fr] Book demo',
        bookADemo: '[fr] Book a demo',
        toLearnMore: '[fr]  to learn more.',
        termsAndConditions: {
            header: '[fr] Before we continue...',
            title: '[fr] Terms & conditions',
            label: '[fr] I agree to the terms & conditions',
            subtitle: `[fr] Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: '[fr] You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                '[fr] You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: '[fr] Flight',
        flightDetails: {
            passenger: '[fr] Passenger',
            layover: (layover: string) => `[fr] <muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: '[fr] Take-off',
            landing: '[fr] Landing',
            seat: '[fr] Seat',
            class: '[fr] Cabin Class',
            recordLocator: '[fr] Record locator',
            cabinClasses: {
                unknown: '[fr] Unknown',
                economy: '[fr] Economy',
                premiumEconomy: '[fr] Premium Economy',
                business: '[fr] Business',
                first: '[fr] First',
            },
        },
        hotel: '[fr] Hotel',
        hotelDetails: {
            guest: '[fr] Guest',
            checkIn: '[fr] Check-in',
            checkOut: '[fr] Check-out',
            roomType: '[fr] Room type',
            cancellation: '[fr] Cancellation policy',
            cancellationUntil: '[fr] Free cancellation until',
            confirmation: '[fr] Confirmation number',
            cancellationPolicies: {
                unknown: '[fr] Unknown',
                nonRefundable: '[fr] Non-refundable',
                freeCancellationUntil: '[fr] Free cancellation until',
                partiallyRefundable: '[fr] Partially refundable',
            },
        },
        car: '[fr] Car',
        carDetails: {
            rentalCar: '[fr] Car rental',
            pickUp: '[fr] Pick-up',
            dropOff: '[fr] Drop-off',
            driver: '[fr] Driver',
            carType: '[fr] Car type',
            cancellation: '[fr] Cancellation policy',
            cancellationUntil: '[fr] Free cancellation until',
            freeCancellation: '[fr] Free cancellation',
            confirmation: '[fr] Confirmation number',
        },
        train: '[fr] Rail',
        trainDetails: {
            passenger: '[fr] Passenger',
            departs: '[fr] Departs',
            arrives: '[fr] Arrives',
            coachNumber: '[fr] Coach number',
            seat: '[fr] Seat',
            fareDetails: '[fr] Fare details',
            confirmation: '[fr] Confirmation number',
        },
        viewTrip: '[fr] View trip',
        modifyTrip: '[fr] Modify trip',
        tripSupport: '[fr] Trip support',
        tripDetails: '[fr] Trip details',
        viewTripDetails: '[fr] View trip details',
        trip: '[fr] Trip',
        trips: '[fr] Trips',
        tripSummary: '[fr] Trip summary',
        departs: '[fr] Departs',
        errorMessage: '[fr] Something went wrong. Please try again later.',
        phoneError: (phoneErrorMethodsRoute: string) => `[fr] <rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: '[fr] Domain',
            subtitle: '[fr] Choose a domain for Expensify Travel setup.',
            recommended: '[fr] Recommended',
        },
        domainPermissionInfo: {
            title: '[fr] Domain',
            restriction: (domain: string) =>
                `[fr] You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `[fr] If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '[fr] Get started with Expensify Travel',
            message: `[fr] You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: '[fr] Expensify Travel has been disabled',
            message: `[fr] Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "[fr] We're reviewing your request...",
            message: `[fr] We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: '[fr] Got it',
            conciergeMessage: ({domain}: {domain: string}) => `[fr] Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `[fr] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[fr] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[fr] Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[fr] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `[fr] The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `[fr] Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `[fr] Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `[fr] Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `[fr] Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `[fr] Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `[fr] Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: '[fr] Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: (type: string, id = '') => `[fr] You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `[fr] The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: (type: string, id = '') => `[fr] Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: (type: string) => `[fr] Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `[fr] Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `[fr] Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `[fr] Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: (type: string) => `[fr] Your ${type} reservation was updated.`,
        },
        flightTo: '[fr] Flight to',
        trainTo: '[fr] Train to',
        carRental: '[fr]  car rental',
        nightIn: '[fr] night in',
        nightsIn: '[fr] nights in',
    },
    proactiveAppReview: {
        title: '[fr] Enjoying New Expensify?',
        description: '[fr] Let us know so we can help make your expensing experience even better.',
        positiveButton: '[fr] Yeah!',
        negativeButton: '[fr] Not really',
    },
    workspace: {
        common: {
            card: '[fr] Cards',
            expensifyCard: '[fr] Expensify Card',
            companyCards: '[fr] Company cards',
            personalCards: '[fr] Personal cards',
            workflows: '[fr] Workflows',
            workspace: '[fr] Workspace',
            findWorkspace: '[fr] Find workspace',
            edit: '[fr] Edit workspace',
            enabled: '[fr] Enabled',
            disabled: '[fr] Disabled',
            everyone: '[fr] Everyone',
            delete: '[fr] Delete workspace',
            settings: '[fr] Settings',
            reimburse: '[fr] Reimbursements',
            categories: '[fr] Categories',
            tags: '[fr] Tags',
            customField1: '[fr] Custom field 1',
            customField2: '[fr] Custom field 2',
            customFieldHint: '[fr] Add custom coding that applies to all spend from this member.',
            reports: '[fr] Reports',
            reportFields: '[fr] Report fields',
            reportTitle: '[fr] Report title',
            reportField: '[fr] Report field',
            taxes: '[fr] Taxes',
            bills: '[fr] Bills',
            invoices: '[fr] Invoices',
            perDiem: '[fr] Per diem',
            travel: '[fr] Travel',
            members: '[fr] Members',
            accounting: '[fr] Accounting',
            receiptPartners: '[fr] Receipt partners',
            rules: '[fr] Rules',
            displayedAs: '[fr] Displayed as',
            plan: '[fr] Plan',
            profile: '[fr] Overview',
            bankAccount: '[fr] Bank account',
            testTransactions: '[fr] Test transactions',
            issueAndManageCards: '[fr] Issue and manage cards',
            reconcileCards: '[fr] Reconcile cards',
            selectAll: '[fr] Select all',
            selected: () => ({
                one: '[fr] 1 selected',
                other: (count: number) => `[fr] ${count} selected`,
            }),
            settlementFrequency: '[fr] Settlement frequency',
            setAsDefault: '[fr] Set as default workspace',
            defaultNote: `[fr] Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '[fr] Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: '[fr] Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            deleteOpenExpensifyCardsError: '[fr] Your company still has open Expensify Cards.',
            outstandingBalanceWarning:
                '[fr] You have an outstanding balance that must be settled before deleting your last workspace. Please go to your subscription settings to resolve the payment.',
            settleBalance: '[fr] Go to subscription',
            unavailable: '[fr] Unavailable workspace',
            memberNotFound: '[fr] Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `[fr] You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: '[fr] Go to workspace',
            duplicateWorkspace: '[fr] Duplicate workspace',
            duplicateWorkspacePrefix: '[fr] Duplicate',
            goToWorkspaces: '[fr] Go to workspaces',
            clearFilter: '[fr] Clear filter',
            workspaceName: '[fr] Workspace name',
            workspaceOwner: '[fr] Owner',
            keepMeAsAdmin: '[fr] Keep me as an admin',
            workspaceType: '[fr] Workspace type',
            workspaceAvatar: '[fr] Workspace avatar',
            clientID: '[fr] Client ID',
            clientIDInputHint: "[fr] Enter the client's unique identifier",
            mustBeOnlineToViewMembers: '[fr] You need to be online in order to view members of this workspace.',
            moreFeatures: '[fr] More features',
            requested: '[fr] Requested',
            distanceRates: '[fr] Distance rates',
            defaultDescription: '[fr] One place for all your receipts and expenses.',
            descriptionHint: '[fr] Share information about this workspace with all members.',
            welcomeNote: '[fr] Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: '[fr] Subscription',
            markAsEntered: '[fr] Mark as manually entered',
            markAsExported: '[fr] Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `[fr] Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "[fr] Let's double check that everything looks right.",
            lineItemLevel: '[fr] Line-item level',
            reportLevel: '[fr] Report level',
            topLevel: '[fr] Top level',
            appliedOnExport: '[fr] Not imported into Expensify, applied on export',
            shareNote: {
                header: '[fr] Share your workspace with other members',
                content: (adminsRoomLink: string) =>
                    `[fr] Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `[fr] Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '[fr] Create new connection',
            reuseExistingConnection: '[fr] Reuse existing connection',
            existingConnections: '[fr] Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `[fr] Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `[fr] ${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `[fr] Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: '[fr] Learn more',
            memberAlternateText: '[fr] Submit and approve reports.',
            adminAlternateText: '[fr] Manage reports and workspace settings.',
            auditorAlternateText: '[fr] View and comment on reports.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: '[fr] Direct',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: '[fr] None',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '[fr] Indirect',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '[fr] Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '[fr] Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return '[fr] Member';
                    default:
                        return '[fr] Member';
                }
            },
            frequency: {
                manual: '[fr] Manually',
                instant: '[fr] Instant',
                immediate: '[fr] Daily',
                trip: '[fr] By trip',
                weekly: '[fr] Weekly',
                semimonthly: '[fr] Twice a month',
                monthly: '[fr] Monthly',
            },
            budgetFrequency: {
                monthly: '[fr] monthly',
                yearly: '[fr] yearly',
            },
            budgetFrequencyUnit: {
                monthly: '[fr] month',
                yearly: '[fr] year',
            },
            budgetTypeForNotificationMessage: {
                tag: '[fr] tag',
                category: '[fr] category',
            },
            planType: '[fr] Plan type',
            youCantDowngradeInvoicing:
                "[fr] You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: '[fr] Default category',
            viewTransactions: '[fr] View transactions',
            policyExpenseChatName: (displayName: string) => `[fr] ${displayName}'s expenses`,
            deepDiveExpensifyCard: `[fr] <muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `[fr] Connected to ${organizationName}` : '[fr] Automate travel and meal delivery expenses across your organization.',
                sendInvites: '[fr] Send invites',
                sendInvitesDescription: "[fr] These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: '[fr] Confirm invite',
                manageInvites: '[fr] Manage invites',
                confirm: '[fr] Confirm',
                allSet: '[fr] All set',
                readyToRoll: "[fr] You're ready to roll",
                takeBusinessRideMessage: '[fr] Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: '[fr] All',
                linked: '[fr] Linked',
                outstanding: '[fr] Outstanding',
                status: {
                    resend: '[fr] Resend',
                    invite: '[fr] Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '[fr] Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '[fr] Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '[fr] Suspended',
                },
                centralBillingAccount: '[fr] Central billing account',
                centralBillingDescription: '[fr] Choose where to import all Uber receipts.',
                invitationFailure: '[fr] Failed to invite member to Uber for Business',
                autoInvite: '[fr] Invite new workspace members to Uber for Business',
                autoRemove: '[fr] Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: '[fr] No outstanding invites',
                    subtitle: '[fr] Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `[fr] <muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: '[fr] Amount',
            deleteRates: () => ({
                one: '[fr] Delete rate',
                other: '[fr] Delete rates',
            }),
            deletePerDiemRate: '[fr] Delete per diem rate',
            findPerDiemRate: '[fr] Find per diem rate',
            areYouSureDelete: () => ({
                one: '[fr] Are you sure you want to delete this rate?',
                other: '[fr] Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: '[fr] Per diem',
                subtitle: '[fr] Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: '[fr] Import per diem rates',
            editPerDiemRate: '[fr] Edit per diem rate',
            editPerDiemRates: '[fr] Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `[fr] Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `[fr] Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '[fr] Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: '[fr] Mark checks as “print later”',
            exportDescription: '[fr] Configure how Expensify data exports to QuickBooks Desktop.',
            date: '[fr] Export date',
            exportInvoices: '[fr] Export invoices to',
            exportExpensifyCard: '[fr] Export Expensify Card transactions as',
            account: '[fr] Account',
            accountDescription: '[fr] Choose where to post journal entries.',
            accountsPayable: '[fr] Accounts payable',
            accountsPayableDescription: '[fr] Choose where to create vendor bills.',
            bankAccount: '[fr] Bank account',
            notConfigured: '[fr] Not configured',
            bankAccountDescription: '[fr] Choose where to send checks from.',
            creditCardAccount: '[fr] Credit card account',
            exportDate: {
                label: '[fr] Export date',
                description: '[fr] Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[fr] Date of last expense',
                        description: '[fr] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[fr] Export date',
                        description: '[fr] Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[fr] Submitted date',
                        description: '[fr] Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "[fr] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[fr] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[fr] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "[fr] QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[fr] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[fr] Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[fr] Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[fr] Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[fr] Check',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "[fr] We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[fr] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[fr] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[fr] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[fr] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '[fr] Choose where to send checks from.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '[fr] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[fr] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '[fr] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: '[fr] No accounts found',
            noAccountsFoundDescription: '[fr] Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: '[fr] QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "[fr] Can't connect from this device",
                body1: "[fr] You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "[fr] Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: '[fr] Open this link to connect',
                body: '[fr] To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: '[fr] Something went wrong',
                setupErrorBody: (conciergeLink: string) =>
                    `[fr] <muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: '[fr] Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: '[fr] Classes',
            items: '[fr] Items',
            customers: '[fr] Customers/projects',
            exportCompanyCardsDescription: '[fr] Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: '[fr] Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: '[fr] Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[fr] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[fr] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[fr] Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: '[fr] Line item level',
            reportFieldsDisplayedAsDescription: '[fr] Report level',
            customersDescription: '[fr] Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: '[fr] Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: '[fr] Auto-create entities',
                createEntitiesDescription: "[fr] Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: '[fr] Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: '[fr] When to Export',
                description: '[fr] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: '[fr] Connected to',
            importDescription: '[fr] Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: '[fr] Classes',
            locations: '[fr] Locations',
            customers: '[fr] Customers/projects',
            accountsDescription: '[fr] Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[fr] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[fr] Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: '[fr] Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: '[fr] Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: '[fr] Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: '[fr] Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "[fr] QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "[fr] QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: '[fr] Configure how Expensify data exports to QuickBooks Online.',
            date: '[fr] Export date',
            exportInvoices: '[fr] Export invoices to',
            exportExpensifyCard: '[fr] Export Expensify Card transactions as',
            exportDate: {
                label: '[fr] Export date',
                description: '[fr] Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[fr] Date of last expense',
                        description: '[fr] Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[fr] Export date',
                        description: '[fr] Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[fr] Submitted date',
                        description: '[fr] Date the report was submitted for approval.',
                    },
                },
            },
            receivable: '[fr] Accounts receivable',
            archive: '[fr] Accounts receivable archive',
            exportInvoicesDescription: '[fr] Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: '[fr] Set how company card purchases export to QuickBooks Online.',
            vendor: '[fr] Vendor',
            defaultVendorDescription: '[fr] Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: '[fr] Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "[fr] We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "[fr] We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "[fr] We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: '[fr] Account',
            accountDescription: '[fr] Choose where to post journal entries.',
            accountsPayable: '[fr] Accounts payable',
            accountsPayableDescription: '[fr] Choose where to create vendor bills.',
            bankAccount: '[fr] Bank account',
            notConfigured: '[fr] Not configured',
            bankAccountDescription: '[fr] Choose where to send checks from.',
            creditCardAccount: '[fr] Credit card account',
            companyCardsLocationEnabledDescription:
                "[fr] QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "[fr] QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: '[fr] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: '[fr] Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: '[fr] Invite employees',
                inviteEmployeesDescription: '[fr] Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: '[fr] Auto-create entities',
                createEntitiesDescription:
                    "[fr] Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription: '[fr] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: '[fr] QuickBooks bill payment account',
                qboInvoiceCollectionAccount: '[fr] QuickBooks invoice collections account',
                accountSelectDescription: "[fr] Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "[fr] Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '[fr] Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '[fr] Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[fr] Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[fr] Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[fr] Check',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "[fr] We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "[fr] We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "[fr] We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '[fr] Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '[fr] Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: '[fr] Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: '[fr] Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '[fr] Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '[fr] Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[fr] Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[fr] Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[fr] Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '[fr] To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '[fr] To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '[fr] To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: '[fr] No accounts found',
            noAccountsFoundDescription: '[fr] Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: '[fr] When to Export',
                description: '[fr] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Out-of-pocket expenses will export when paid',
                },
            },
            travelInvoicing: '[fr] Export Expensify Travel Payable To',
            travelInvoicingVendor: '[fr] Travel vendor',
            travelInvoicingPayableAccount: '[fr] Travel payable account',
        },
        workspaceList: {
            joinNow: '[fr] Join now',
            askToJoin: '[fr] Ask to join',
        },
        xero: {
            organization: '[fr] Xero organization',
            organizationDescription: "[fr] Choose the Xero organization that you'd like to import data from.",
            importDescription: '[fr] Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: '[fr] Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: '[fr] Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: '[fr] Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: '[fr] Tracking categories',
            trackingCategoriesDescription: '[fr] Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `[fr] Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `[fr] Choose where to map ${categoryName} when exporting to Xero.`,
            customers: '[fr] Re-bill customers',
            customersDescription: '[fr] Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: '[fr] Choose how to handle Xero taxes in Expensify.',
            notImported: '[fr] Not imported',
            notConfigured: '[fr] Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: '[fr] Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '[fr] Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '[fr] Report fields',
            },
            exportDescription: '[fr] Configure how Expensify data exports to Xero.',
            purchaseBill: '[fr] Purchase bill',
            exportDeepDiveCompanyCard:
                '[fr] Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: '[fr] Bank transactions',
            xeroBankAccount: '[fr] Xero bank account',
            xeroBankAccountDescription: '[fr] Choose where expenses will post as bank transactions.',
            exportExpensesDescription: '[fr] Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: '[fr] Purchase bill date',
            exportInvoices: '[fr] Export invoices as',
            salesInvoice: '[fr] Sales invoice',
            exportInvoicesDescription: '[fr] Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: '[fr] Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: '[fr] Purchase bill status',
                reimbursedReportsDescription: '[fr] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: '[fr] Xero bill payment account',
                xeroInvoiceCollectionAccount: '[fr] Xero invoice collections account',
                xeroBillPaymentAccountDescription: "[fr] Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "[fr] Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: '[fr] Purchase bill date',
                description: '[fr] Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[fr] Date of last expense',
                        description: '[fr] Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '[fr] Export date',
                        description: '[fr] Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '[fr] Submitted date',
                        description: '[fr] Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: '[fr] Purchase bill status',
                description: '[fr] Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '[fr] Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '[fr] Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '[fr] Awaiting payment',
                },
            },
            noAccountsFound: '[fr] No accounts found',
            noAccountsFoundDescription: '[fr] Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: '[fr] When to Export',
                description: '[fr] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '[fr] Preferred exporter',
            taxSolution: '[fr] Tax solution',
            notConfigured: '[fr] Not configured',
            exportDate: {
                label: '[fr] Export date',
                description: '[fr] Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[fr] Date of last expense',
                        description: '[fr] Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '[fr] Export date',
                        description: '[fr] Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '[fr] Submitted date',
                        description: '[fr] Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: '[fr] Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '[fr] Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[fr] Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: '[fr] Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '[fr] Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '[fr] Vendor bills',
                },
            },
            creditCardAccount: '[fr] Credit card account',
            defaultVendor: '[fr] Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `[fr] Set a default vendor that will apply to ${isReimbursable ? '' : '[fr] non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: '[fr] Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                '[fr] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[fr] Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: '[fr] No accounts found',
            noAccountsFoundDescription: `[fr] Please add the account in Sage Intacct and sync the connection again`,
            autoSync: '[fr] Auto-sync',
            autoSyncDescription: '[fr] Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: '[fr] Invite employees',
            inviteEmployeesDescription:
                '[fr] Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: '[fr] Sync reimbursed reports',
            syncReimbursedReportsDescription: '[fr] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: '[fr] Sage Intacct payment account',
            accountingMethods: {
                label: '[fr] When to Export',
                description: '[fr] Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Out-of-pocket expenses will export when paid',
                },
            },
        },
        netsuite: {
            subsidiary: '[fr] Subsidiary',
            subsidiarySelectDescription: "[fr] Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: '[fr] Configure how Expensify data exports to NetSuite.',
            exportInvoices: '[fr] Export invoices to',
            journalEntriesTaxPostingAccount: '[fr] Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: '[fr] Journal entries provincial tax posting account',
            foreignCurrencyAmount: '[fr] Export foreign currency amount',
            exportToNextOpenPeriod: '[fr] Export to next open period',
            nonReimbursableJournalPostingAccount: '[fr] Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: '[fr] Reimbursable journal posting account',
            journalPostingPreference: {
                label: '[fr] Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '[fr] Single, itemized entry for each report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '[fr] Single entry for each expense',
                },
            },
            invoiceItem: {
                label: '[fr] Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '[fr] Create one for me',
                        description: '[fr] We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '[fr] Select existing',
                        description: "[fr] We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: '[fr] Export date',
                description: '[fr] Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '[fr] Date of last expense',
                        description: '[fr] Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '[fr] Export date',
                        description: '[fr] Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '[fr] Submitted date',
                        description: '[fr] Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '[fr] Expense reports',
                        reimbursableDescription: '[fr] Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: '[fr] Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '[fr] Vendor bills',
                        reimbursableDescription: dedent(`
                            [fr] Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [fr] Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '[fr] Journal entries',
                        reimbursableDescription: dedent(`
                            [fr] Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            [fr] Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "[fr] If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: '[fr] Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: '[fr] Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: '[fr] Reimbursements account',
                reimbursementsAccountDescription: "[fr] Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: '[fr] Collections account',
                collectionsAccountDescription: '[fr] Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: '[fr] A/P approval account',
                approvalAccountDescription:
                    '[fr] Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: '[fr] NetSuite default',
                inviteEmployees: '[fr] Invite employees and set approvals',
                inviteEmployeesDescription:
                    '[fr] Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: '[fr] Auto-create employees/vendors',
                enableCategories: '[fr] Enable newly imported categories',
                customFormID: '[fr] Custom form ID',
                customFormIDDescription:
                    '[fr] By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: '[fr] Out-of-pocket expense',
                customFormIDNonReimbursable: '[fr] Company card expense',
                exportReportsTo: {
                    label: '[fr] Expense report approval level',
                    description: '[fr] Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: '[fr] NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '[fr] Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '[fr] Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '[fr] Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: '[fr] When to Export',
                    description: '[fr] Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '[fr] Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '[fr] Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: '[fr] Vendor bill approval level',
                    description: '[fr] Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: '[fr] NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '[fr] Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '[fr] Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: '[fr] Journal entry approval level',
                    description: '[fr] Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: '[fr] NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '[fr] Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '[fr] Approved for posting',
                    },
                },
                error: {
                    customFormID: '[fr] Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: '[fr] No accounts found',
            noAccountsFoundDescription: '[fr] Please add the account in NetSuite and sync the connection again',
            noVendorsFound: '[fr] No vendors found',
            noVendorsFoundDescription: '[fr] Please add vendors in NetSuite and sync the connection again',
            noItemsFound: '[fr] No invoice items found',
            noItemsFoundDescription: '[fr] Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: '[fr] No subsidiaries found',
            noSubsidiariesFoundDescription: '[fr] Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: '[fr] NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: '[fr] Install the Expensify bundle',
                        description: '[fr] In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: '[fr] Enable token-based authentication',
                        description: '[fr] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: '[fr] Enable SOAP web services',
                        description: '[fr] In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: '[fr] Create an access token',
                        description:
                            '[fr] In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: '[fr] Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: '[fr] NetSuite Account ID',
                            netSuiteTokenID: '[fr] Token ID',
                            netSuiteTokenSecret: '[fr] Token Secret',
                        },
                        netSuiteAccountIDDescription: '[fr] In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: '[fr] Expense categories',
                expenseCategoriesDescription: '[fr] Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: '[fr] Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: '[fr] Departments',
                        subtitle: '[fr] Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: '[fr] Classes',
                        subtitle: '[fr] Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: '[fr] Locations',
                        subtitle: '[fr] Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: '[fr] Customers/projects',
                    subtitle: '[fr] Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: '[fr] Import customers',
                    importJobs: '[fr] Import projects',
                    customers: '[fr] customers',
                    jobs: '[fr] projects',
                    label: (importFields: string[], importType: string) => `${importFields.join('[fr]  and ')}, ${importType}`,
                },
                importTaxDescription: '[fr] Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: '[fr] Choose an option below:',
                    label: (importedTypes: string[]) => `[fr] Imported as ${importedTypes.join('[fr]  and ')}`,
                    requiredFieldError: (fieldName: string) => `[fr] Please enter the ${fieldName}`,
                    customSegments: {
                        title: '[fr] Custom segments/records',
                        addText: '[fr] Add custom segment/record',
                        recordTitle: '[fr] Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '[fr] View detailed instructions',
                        helpText: '[fr]  on configuring custom segments/records.',
                        emptyTitle: '[fr] Add a custom segment or custom record',
                        fields: {
                            segmentName: '[fr] Name',
                            internalID: '[fr] Internal ID',
                            scriptID: '[fr] Script ID',
                            customRecordScriptID: '[fr] Transaction column ID',
                            mapping: '[fr] Displayed as',
                        },
                        removeTitle: '[fr] Remove custom segment/record',
                        removePrompt: '[fr] Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: '[fr] custom segment name',
                            customRecordName: '[fr] custom record name',
                            segmentTitle: '[fr] Custom segment',
                            customSegmentAddTitle: '[fr] Add custom segment',
                            customRecordAddTitle: '[fr] Add custom record',
                            recordTitle: '[fr] Custom record',
                            segmentRecordType: '[fr] Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "[fr] What's the custom segment name?",
                            customRecordNameTitle: "[fr] What's the custom record name?",
                            customSegmentNameFooter: `[fr] You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `[fr] You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "[fr] What's the internal ID?",
                            customSegmentInternalIDFooter: `[fr] First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*

You can find custom segment internal IDs in NetSuite under:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the hyperlink next to *Custom Record Type*.
4. Find the internal ID in the table at the bottom.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `[fr] You can find custom record internal IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the internal ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "[fr] What's the script ID?",
                            customSegmentScriptIDFooter: `[fr] You can find custom segment script IDs in NetSuite under: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Click into a custom segment.
3. Click the *Application and Sourcing* tab near the bottom, then:
    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.
    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "[fr] What's the transaction column ID?",
                            customRecordScriptIDFooter: `[fr] You can find custom record script IDs in NetSuite under:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom record.
3. Find the script ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: '[fr] How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: '[fr] How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `[fr] A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: '[fr] Custom lists',
                        addText: '[fr] Add custom list',
                        recordTitle: '[fr] Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '[fr] View detailed instructions',
                        helpText: '[fr]  on configuring custom lists.',
                        emptyTitle: '[fr] Add a custom list',
                        fields: {
                            listName: '[fr] Name',
                            internalID: '[fr] Internal ID',
                            transactionFieldID: '[fr] Transaction field ID',
                            mapping: '[fr] Displayed as',
                        },
                        removeTitle: '[fr] Remove custom list',
                        removePrompt: '[fr] Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: '[fr] Choose a custom list',
                            transactionFieldIDTitle: "[fr] What's the transaction field ID?",
                            transactionFieldIDFooter: `[fr] You can find transaction field IDs in NetSuite by following these steps:

1. Enter "Transaction Line Fields" in global search.
2. Click into a custom list.
3. Find the transaction field ID on the left-hand side.

_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: '[fr] How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `[fr] A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: '[fr] NetSuite employee default',
                        description: '[fr] Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `[fr] If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '[fr] Tags',
                        description: '[fr] Line-item level',
                        footerContent: (importField: string) => `[fr] ${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '[fr] Report fields',
                        description: '[fr] Report level',
                        footerContent: (importField: string) => `[fr] ${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: '[fr] Sage Intacct setup',
            prerequisitesTitle: '[fr] Before you connect...',
            downloadExpensifyPackage: '[fr] Download the Expensify package for Sage Intacct',
            followSteps: '[fr] Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: '[fr] Enter your Sage Intacct credentials',
            entity: '[fr] Entity',
            employeeDefault: '[fr] Sage Intacct employee default',
            employeeDefaultDescription: "[fr] The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "[fr] Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "[fr] Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: (mappingTitle: string) => `[fr] Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: '[fr] Expense types',
            expenseTypesDescription: '[fr] Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: '[fr] Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: '[fr] Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: '[fr] User-defined dimensions',
            addUserDefinedDimension: '[fr] Add user-defined dimension',
            integrationName: '[fr] Integration name',
            dimensionExists: '[fr] A dimension with this name already exists.',
            removeDimension: '[fr] Remove user-defined dimension',
            removeDimensionPrompt: '[fr] Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: '[fr] User-defined dimension',
            addAUserDefinedDimension: '[fr] Add a user-defined dimension',
            detailedInstructionsLink: '[fr] View detailed instructions',
            detailedInstructionsRestOfSentence: '[fr]  on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '[fr] 1 UDD added',
                other: (count: number) => `[fr] ${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '[fr] departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '[fr] classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '[fr] locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '[fr] customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '[fr] projects (jobs)';
                    default:
                        return '[fr] mappings';
                }
            },
        },
        type: {
            free: '[fr] Free',
            control: '[fr] Control',
            collect: '[fr] Collect',
        },
        companyCards: {
            addCards: '[fr] Add cards',
            selectCards: '[fr] Select cards',
            fromOtherWorkspaces: '[fr] From other workspaces',
            addWorkEmail: '[fr] Add your work email',
            addWorkEmailDescription: '[fr] Please add your work email in order to use existing feeds from other workspaces.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: "[fr] Couldn't load card feeds",
                workspaceFeedsCouldNotBeLoadedMessage: '[fr] An error occurred while loading workspace card feeds. Please try again or contact your administrator.',
                feedCouldNotBeLoadedTitle: "[fr] Couldn't load this feed",
                feedCouldNotBeLoadedMessage: '[fr] An error occurred while loading this feed. Please try again or contact your administrator.',
                tryAgain: '[fr] Try again',
            },
            addNewCard: {
                other: '[fr] Other',
                fileImport: '[fr] Import transactions from file',
                createFileFeedHelpText: `[fr] <muted-text>Please follow this <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">help guide</a> to get your company card expenses imported!</muted-text>`,
                companyCardLayoutName: '[fr] Company card layout name',
                cardLayoutNameRequired: '[fr] The Company card layout name is required',
                useAdvancedFields: '[fr] Use advanced fields (not recommended)',
                cardProviders: {
                    gl1025: '[fr] American Express Corporate Cards',
                    cdf: '[fr] Mastercard Commercial Cards',
                    vcf: '[fr] Visa Commercial Cards',
                    stripe: '[fr] Stripe Cards',
                },
                yourCardProvider: `[fr] Who's your card provider?`,
                whoIsYourBankAccount: '[fr] Who’s your bank?',
                whereIsYourBankLocated: '[fr] Where’s your bank located?',
                howDoYouWantToConnect: '[fr] How do you want to connect to your bank?',
                learnMoreAboutOptions: `[fr] <muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: '[fr] Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `[fr] Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: '[fr] The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `[fr] Enable your ${provider} feed`,
                    heading: '[fr] We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: '[fr] We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: '[fr] We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `[fr] 1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.

2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `[fr] 1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.

2. Once the feed is enabled, Amex will send you a production letter.

3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `[fr] 1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.

 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.

3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `[fr] 1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Under Product Integrations, click Enable next to Expensify.

3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: '[fr] What bank issues these cards?',
                enterNameOfBank: '[fr] Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: '[fr] What are the Visa feed details?',
                        processorLabel: '[fr] Processor ID',
                        bankLabel: '[fr] Financial institution (bank) ID',
                        companyLabel: '[fr] Company ID',
                        helpLabel: '[fr] Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `[fr] What's the Amex delivery file name?`,
                        fileNameLabel: '[fr] Delivery file name',
                        helpLabel: '[fr] Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `[fr] What's the Mastercard distribution ID?`,
                        distributionLabel: '[fr] Distribution ID',
                        helpLabel: '[fr] Where do I find the distribution ID?',
                    },
                },
                amexCorporate: '[fr] Select this if the front of your cards say “Corporate”',
                amexBusiness: '[fr] Select this if the front of your cards say “Business”',
                amexPersonal: '[fr] Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: '[fr] Please select a card provider before continuing',
                    pleaseSelectBankAccount: '[fr] Please select a bank account before continuing',
                    pleaseSelectBank: '[fr] Please select a bank before continuing',
                    pleaseSelectCountry: '[fr] Please select a country before continuing',
                    pleaseSelectFeedType: '[fr] Please select a feed type before continuing',
                },
                exitModal: {
                    title: '[fr] Something not working?',
                    prompt: "[fr] We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: '[fr] Report issue',
                    cancelText: '[fr] Skip',
                },
                csvColumns: {
                    cardNumber: '[fr] Card number',
                    postedDate: '[fr] Date',
                    merchant: '[fr] Merchant',
                    amount: '[fr] Amount',
                    currency: '[fr] Currency',
                    ignore: '[fr] Ignore',
                    originalTransactionDate: '[fr] Original transaction date',
                    originalAmount: '[fr] Original amount',
                    originalCurrency: '[fr] Original currency',
                    comment: '[fr] Comment',
                    category: '[fr] Category',
                    tag: '[fr] Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `[fr] Please assign a column to each of the attributes: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) => `[fr] Oops! You've mapped a single field ("${duplicateColumn}") to multiple columns. Please review and try again.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '[fr] Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '[fr] Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: '[fr] Custom day of month',
            },
            assign: '[fr] Assign',
            assignCard: '[fr] Assign card',
            findCard: '[fr] Find card',
            cardNumber: '[fr] Card number',
            commercialFeed: '[fr] Commercial feed',
            feedName: (feedName: string) => `[fr] ${feedName} cards`,
            deletedFeed: '[fr] Deleted feed',
            deletedCard: '[fr] Deleted card',
            directFeed: '[fr] Direct feed',
            whoNeedsCardAssigned: '[fr] Who needs a card assigned?',
            chooseTheCardholder: '[fr] Choose the cardholder',
            chooseCard: '[fr] Choose a card',
            chooseCardFor: (assignee: string) => `[fr] Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: '[fr] No active cards on this feed',
            somethingMightBeBroken:
                '[fr] <muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: '[fr] Choose a transaction start date',
            startDateDescription: "[fr] Choose your import start date. We'll sync all transactions from this date onwards.",
            editStartDateDescription: "[fr] Choose a new transaction start date. We'll sync all transactions from that date onwards, excluding those we already imported.",
            fromTheBeginning: '[fr] From the beginning',
            customStartDate: '[fr] Custom start date',
            customCloseDate: '[fr] Custom close date',
            letsDoubleCheck: "[fr] Let's double check that everything looks right.",
            confirmationDescription: "[fr] We'll begin importing transactions immediately.",
            card: '[fr] Card',
            cardName: '[fr] Card name',
            brokenConnectionError: '[fr] <rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `[fr] assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '[fr] company card',
            chooseCardFeed: '[fr] Choose card feed',
            ukRegulation:
                '[fr] Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: '[fr] Card assignment failed.',
            unassignCardFailedError: '[fr] Card unassignment failed.',
            cardAlreadyAssignedError: '[fr] This card is already assigned to a user in another workspace.',
            importTransactions: {
                title: '[fr] Import transactions from file',
                description: '[fr] Please adjust the settings for your file that will be applied on import.',
                cardDisplayName: '[fr] Card display name',
                currency: '[fr] Currency',
                transactionsAreReimbursable: '[fr] Transactions are reimbursable',
                flipAmountSign: '[fr] Flip amount sign',
                importButton: '[fr] Import transactions',
            },
            assignNewCards: {
                title: '[fr] Assign new cards',
                description: '[fr] Get the latest cards to assign from your bank',
            },
        },
        expensifyCard: {
            issueAndManageCards: '[fr] Issue and manage your Expensify Cards',
            getStartedIssuing: '[fr] Get started by issuing your first virtual or physical card.',
            verificationInProgress: '[fr] Verification in progress...',
            verifyingTheDetails: "[fr] We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                '[fr] The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                '[fr] Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: '[fr] Issue card',
            findCard: '[fr] Find card',
            newCard: '[fr] New card',
            name: '[fr] Name',
            lastFour: '[fr] Last 4',
            limit: '[fr] Limit',
            currentBalance: '[fr] Current balance',
            currentBalanceDescription: '[fr] Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: (settlementDate: string) => `[fr] Balance will be settled on ${settlementDate}`,
            settleBalance: '[fr] Settle balance',
            cardLimit: '[fr] Card limit',
            remainingLimit: '[fr] Remaining limit',
            requestLimitIncrease: '[fr] Request limit increase',
            remainingLimitDescription:
                '[fr] We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: '[fr] Cash back',
            earnedCashbackDescription: '[fr] Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: '[fr] Issue new card',
            finishSetup: '[fr] Finish setup',
            chooseBankAccount: '[fr] Choose bank account',
            chooseExistingBank: '[fr] Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: '[fr] Account ending in',
            addNewBankAccount: '[fr] Add a new bank account',
            settlementAccount: '[fr] Settlement account',
            settlementAccountDescription: '[fr] Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `[fr] Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: '[fr] Settlement frequency',
            settlementFrequencyDescription: '[fr] Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo: '[fr] If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            frequency: {
                daily: '[fr] Daily',
                monthly: '[fr] Monthly',
            },
            cardDetails: '[fr] Card details',
            cardPending: ({name}: {name: string}) => `[fr] Card is currently pending and will be issued once ${name}'s account is validated.`,
            virtual: '[fr] Virtual',
            physical: '[fr] Physical',
            deactivate: '[fr] Deactivate card',
            changeCardLimit: '[fr] Change card limit',
            changeLimit: '[fr] Change limit',
            smartLimitWarning: (limit: number | string) => `[fr] If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `[fr] If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `[fr] If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: '[fr] Change card limit type',
            changeLimitType: '[fr] Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `[fr] If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `[fr] If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: '[fr] Add shipping details',
            issuedCard: (assignee: string) => `[fr] issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `[fr] issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: (assignee: string, link: string) => `[fr] issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `[fr] ${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `[fr] ${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: (assignee: string, link: string) => `[fr] ${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: '[fr] card',
            replacementCard: '[fr] replacement card',
            verifyingHeader: '[fr] Verifying',
            bankAccountVerifiedHeader: '[fr] Bank account verified',
            verifyingBankAccount: '[fr] Verifying bank account...',
            verifyingBankAccountDescription: '[fr] Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: '[fr] Bank account verified!',
            bankAccountVerifiedDescription: '[fr] You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: '[fr] One more step...',
            oneMoreStepDescription: '[fr] Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: '[fr] Got it',
            goToConcierge: '[fr] Go to Concierge',
        },
        categories: {
            deleteCategories: '[fr] Delete categories',
            deleteCategoriesPrompt: '[fr] Are you sure you want to delete these categories?',
            deleteCategory: '[fr] Delete category',
            deleteCategoryPrompt: '[fr] Are you sure you want to delete this category?',
            disableCategories: '[fr] Disable categories',
            disableCategory: '[fr] Disable category',
            enableCategories: '[fr] Enable categories',
            enableCategory: '[fr] Enable category',
            defaultSpendCategories: '[fr] Default spend categories',
            spendCategoriesDescription: '[fr] Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: '[fr] An error occurred while deleting the category, please try again',
            categoryName: '[fr] Category name',
            requiresCategory: '[fr] Members must categorize all expenses',
            needCategoryForExportToIntegration: (connectionName: string) => `[fr] All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: '[fr] Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "[fr] You haven't created any categories",
                subtitle: '[fr] Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[fr] <muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: '[fr] An error occurred while updating the category, please try again',
            createFailureMessage: '[fr] An error occurred while creating the category, please try again',
            addCategory: '[fr] Add category',
            editCategory: '[fr] Edit category',
            editCategories: '[fr] Edit categories',
            findCategory: '[fr] Find category',
            categoryRequiredError: '[fr] Category name is required',
            existingCategoryError: '[fr] A category with this name already exists',
            invalidCategoryName: '[fr] Invalid category name',
            importedFromAccountingSoftware: '[fr] The categories below are imported from your',
            payrollCode: '[fr] Payroll code',
            updatePayrollCodeFailureMessage: '[fr] An error occurred while updating the payroll code, please try again',
            glCode: '[fr] GL code',
            updateGLCodeFailureMessage: '[fr] An error occurred while updating the GL code, please try again',
            importCategories: '[fr] Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: '[fr] Cannot delete or disable all categories',
                description: `[fr] At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: '[fr] Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: '[fr] Spend',
                subtitle: '[fr] Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: '[fr] Manage',
                subtitle: '[fr] Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: '[fr] Earn',
                subtitle: '[fr] Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: '[fr] Organize',
                subtitle: '[fr] Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: '[fr] Integrate',
                subtitle: '[fr] Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: '[fr] Distance rates',
                subtitle: '[fr] Add, update, and enforce rates.',
            },
            perDiem: {
                title: '[fr] Per diem',
                subtitle: '[fr] Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: '[fr] Travel',
                subtitle: '[fr] Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: '[fr] Get started with Expensify Travel',
                    subtitle: "[fr] We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "[fr] Let's go",
                },
                reviewingRequest: {
                    title: "[fr] Pack your bags, we've got your request...",
                    subtitle: "[fr] We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: '[fr] Request sent',
                },
                bookOrManageYourTrip: {
                    title: '[fr] Travel booking',
                    subtitle: "[fr] Congrats! You're all set to book and manage travel on this workspace.",
                    ctaText: '[fr] Manage travel',
                },
                settings: {
                    autoAddTripName: {
                        title: '[fr] Add trip names to expenses',
                        subtitle: '[fr] Automatically add trip names to expense descriptions for travel booked in Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '[fr] Travel booking',
                        subtitle: "[fr] Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: '[fr] Manage travel',
                    },
                    centralInvoicingSection: {
                        title: '[fr] Central invoicing',
                        subtitle: '[fr] Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: '[fr] Learn how.',
                        subsections: {
                            currentTravelSpendLabel: '[fr] Current travel spend',
                            currentTravelSpendPaymentQueued: (amount: string) => `[fr] Payment of ${amount} is queued and will be processed soon.`,
                            currentTravelSpendCta: '[fr] Pay balance',
                            currentTravelLimitLabel: '[fr] Current travel limit',
                            settlementAccountLabel: '[fr] Settlement account',
                            settlementFrequencyLabel: '[fr] Settlement frequency',
                            settlementFrequencyDescription: '[fr] How often Expensify will pull from your business bank account to settle recent Expensify Travel transactions.',
                        },
                    },
                    disableModal: {
                        title: '[fr] Turn off Travel Invoicing?',
                        body: '[fr] Upcoming hotel and car rental reservations may need to be re-booked with a different payment method to avoid cancellation.',
                        confirm: '[fr] Turn off',
                    },
                    outstandingBalanceModal: {
                        title: "[fr] Can't turn off Travel Invoicing",
                        body: '[fr] You still have an outstanding travel balance. Please pay your balance first.',
                        confirm: '[fr] Got it',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `[fr] Pay balance of ${amount}?`,
                        body: '[fr] The payment will be queued and processed shortly after. This action cannot be undone once started.',
                    },
                    exportToPDF: '[fr] Export to PDF',
                    exportToCSV: '[fr] Export to CSV',
                    selectDateRangeError: '[fr] Please select a date range to export',
                    invalidDateRangeError: '[fr] The start date must be before the end date',
                    enabled: '[fr] Central Invoicing enabled!',
                    enabledDescription: '[fr] All travel spend on this workspace will now be centralized in a monthly invoice.',
                },
                personalDetailsDescription: '[fr] In order to book travel, please enter your legal name as it appears on your government-issued ID.',
            },
            expensifyCard: {
                title: '[fr] Expensify Card',
                subtitle: '[fr] Gain insights and control over spend.',
                disableCardTitle: '[fr] Disable Expensify Card',
                disableCardPrompt: '[fr] You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: '[fr] Chat with Concierge',
                feed: {
                    title: '[fr] Get the Expensify Card',
                    subTitle: '[fr] Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: '[fr] Cash back on every US purchase',
                        unlimited: '[fr] Unlimited virtual cards',
                        spend: '[fr] Spend controls and custom limits',
                    },
                    ctaTitle: '[fr] Issue new card',
                },
            },
            companyCards: {
                title: '[fr] Company cards',
                subtitle: '[fr] Connect the cards you already have.',
                feed: {
                    title: '[fr] Bring your own cards (BYOC)',
                    subtitle: '[fr] Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: '[fr] Connect cards from 10,000+ banks',
                        assignCards: '[fr] Link your team’s existing cards',
                        automaticImport: '[fr] We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: '[fr] Bank connection issue',
                connectWithPlaid: '[fr] connect via Plaid',
                connectWithExpensifyCard: '[fr] try the Expensify Card.',
                bankConnectionDescription: `[fr] Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: '[fr] Disable company cards',
                disableCardPrompt: '[fr] You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: '[fr] Chat with Concierge',
                cardDetails: '[fr] Card details',
                cardNumber: '[fr] Card number',
                cardholder: '[fr] Cardholder',
                cardName: '[fr] Card name',
                allCards: '[fr] All cards',
                assignedCards: '[fr] Assigned',
                unassignedCards: '[fr] Unassigned',
                integrationExport: (integration: string, type?: string) => (integration && type ? `[fr] ${integration} ${type.toLowerCase()} export` : `[fr] ${integration} export`),
                integrationExportTitleXero: (integration: string) => `[fr] Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `[fr] Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: '[fr] Last updated',
                transactionStartDate: '[fr] Transaction start date',
                updateCard: '[fr] Update card',
                unassignCard: '[fr] Unassign card',
                unassign: '[fr] Unassign',
                unassignCardDescription: '[fr] Unassigning this card will delete all unsubmitted transactions.',
                assignCard: '[fr] Assign card',
                removeCard: '[fr] Remove card',
                remove: '[fr] Remove',
                removeCardDescription: '[fr] Removing this card will delete all unsubmitted transactions.',
                cardFeedName: '[fr] Card feed name',
                cardFeedNameDescription: '[fr] Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: '[fr] Delete transactions',
                cardFeedTransactionDescription: '[fr] Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: '[fr] Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: '[fr] Allow deleting transactions',
                removeCardFeed: '[fr] Remove card feed',
                removeCardFeedTitle: (feedName: string) => `[fr] Remove ${feedName} feed`,
                removeCardFeedDescription: '[fr] Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: '[fr] Card feed name is required',
                    statementCloseDateRequired: '[fr] Please select a statement close date.',
                },
                corporate: '[fr] Restrict deleting transactions',
                personal: '[fr] Allow deleting transactions',
                setFeedNameDescription: '[fr] Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: '[fr] When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: '[fr] No cards in this feed',
                emptyAddedFeedDescription: "[fr] Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `[fr] We're reviewing your request...`,
                pendingFeedDescription: `[fr] We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '[fr] Check your browser window',
                pendingBankDescription: (bankName: string) => `[fr] Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: '[fr] please click here',
                giveItNameInstruction: '[fr] Give the card a name that sets it apart from others.',
                updating: '[fr] Updating...',
                neverUpdated: '[fr] Never',
                noAccountsFound: '[fr] No accounts found',
                defaultCard: '[fr] Default card',
                downgradeTitle: `[fr] Can't downgrade workspace`,
                downgradeSubTitle: `[fr] This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `[fr] Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: '[fr] Get the Expensify Card',
                expensifyCardBannerSubtitle: '[fr] Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: '[fr] Learn more',
                statementCloseDateTitle: '[fr] Statement close date',
                statementCloseDateDescription: '[fr] Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: '[fr] Workflows',
                subtitle: '[fr] Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    '[fr] Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: '[fr] Invoices',
                subtitle: '[fr] Send and receive invoices.',
            },
            categories: {
                title: '[fr] Categories',
                subtitle: '[fr] Track and organize spend.',
            },
            tags: {
                title: '[fr] Tags',
                subtitle: '[fr] Classify costs and track billable expenses.',
            },
            taxes: {
                title: '[fr] Taxes',
                subtitle: '[fr] Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: '[fr] Report fields',
                subtitle: '[fr] Set up custom fields for spend.',
            },
            connections: {
                title: '[fr] Accounting',
                subtitle: '[fr] Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: '[fr] Receipt partners',
                subtitle: '[fr] Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '[fr] Not so fast...',
                featureEnabledText: "[fr] To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "[fr] To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: '[fr] Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: '[fr] Disconnect Uber',
                disconnectText: '[fr] To disable this feature, please disconnect the Uber for Business integration first.',
                description: '[fr] Are you sure you want to disconnect this integration?',
                confirmText: '[fr] Got it',
            },
            workflowWarningModal: {
                featureEnabledTitle: '[fr] Not so fast...',
                featureEnabledText:
                    '[fr] Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: '[fr] Go to Expensify Cards',
            },
            rules: {
                title: '[fr] Rules',
                subtitle: '[fr] Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: '[fr] Time',
                subtitle: '[fr] Set a billable hourly rate for time tracking.',
                defaultHourlyRate: '[fr] Default hourly rate',
            },
        },
        reports: {
            reportsCustomTitleExamples: '[fr] Examples:',
            customReportNamesSubtitle: `[fr] <muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: '[fr] Default report title',
            customNameDescription: `[fr] Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: '[fr] Name',
            customNameEmailPhoneExample: '[fr] Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: '[fr] Report start date: {report:startdate}',
            customNameWorkspaceNameExample: '[fr] Workspace name: {report:workspacename}',
            customNameReportIDExample: '[fr] Report ID: {report:id}',
            customNameTotalExample: '[fr] Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: '[fr] Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: '[fr] Add field',
            delete: '[fr] Delete field',
            deleteFields: '[fr] Delete fields',
            findReportField: '[fr] Find report field',
            deleteConfirmation: '[fr] Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: '[fr] Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "[fr] You haven't created any report fields",
                subtitle: '[fr] Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "[fr] Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: '[fr] Disable report fields',
            disableReportFieldsConfirmation: '[fr] Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: '[fr] The report fields below are imported from your',
            textType: '[fr] Text',
            dateType: '[fr] Date',
            dropdownType: '[fr] List',
            formulaType: '[fr] Formula',
            textAlternateText: '[fr] Add a field for free text input.',
            dateAlternateText: '[fr] Add a calendar for date selection.',
            dropdownAlternateText: '[fr] Add a list of options to choose from.',
            formulaAlternateText: '[fr] Add a formula field.',
            nameInputSubtitle: '[fr] Choose a name for the report field.',
            typeInputSubtitle: '[fr] Choose what type of report field to use.',
            initialValueInputSubtitle: '[fr] Enter a starting value to show in the report field.',
            listValuesInputSubtitle: '[fr] These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: '[fr] These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: '[fr] Delete value',
            deleteValues: '[fr] Delete values',
            disableValue: '[fr] Disable value',
            disableValues: '[fr] Disable values',
            enableValue: '[fr] Enable value',
            enableValues: '[fr] Enable values',
            emptyReportFieldsValues: {
                title: "[fr] You haven't created any list values",
                subtitle: '[fr] Add custom values to appear on reports.',
            },
            deleteValuePrompt: '[fr] Are you sure you want to delete this list value?',
            deleteValuesPrompt: '[fr] Are you sure you want to delete these list values?',
            listValueRequiredError: '[fr] Please enter a list value name',
            existingListValueError: '[fr] A list value with this name already exists',
            editValue: '[fr] Edit value',
            listValues: '[fr] List values',
            addValue: '[fr] Add value',
            existingReportFieldNameError: '[fr] A report field with this name already exists',
            reportFieldNameRequiredError: '[fr] Please enter a report field name',
            reportFieldTypeRequiredError: '[fr] Please choose a report field type',
            circularReferenceError: "[fr] This field can't refer to itself. Please update.",
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `[fr] Formula field ${value} not recognized`,
            reportFieldInitialValueRequiredError: '[fr] Please choose a report field initial value',
            genericFailureMessage: '[fr] An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: '[fr] Tag name',
            requiresTag: '[fr] Members must tag all expenses',
            trackBillable: '[fr] Track billable expenses',
            customTagName: '[fr] Custom tag name',
            enableTag: '[fr] Enable tag',
            enableTags: '[fr] Enable tags',
            requireTag: '[fr] Require tag',
            requireTags: '[fr] Require tags',
            notRequireTags: '[fr] Don’t require',
            disableTag: '[fr] Disable tag',
            disableTags: '[fr] Disable tags',
            addTag: '[fr] Add tag',
            editTag: '[fr] Edit tag',
            editTags: '[fr] Edit tags',
            findTag: '[fr] Find tag',
            subtitle: '[fr] Tags add more detailed ways to classify costs.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `[fr] <muted-text>Tags add more detailed ways to classify costs. You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "[fr] You haven't created any tags",
                subtitle: '[fr] Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `[fr] <muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `[fr] <muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: '[fr] Delete tag',
            deleteTags: '[fr] Delete tags',
            deleteTagConfirmation: '[fr] Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: '[fr] Are you sure that you want to delete these tags?',
            deleteFailureMessage: '[fr] An error occurred while deleting the tag, please try again',
            tagRequiredError: '[fr] Tag name is required',
            existingTagError: '[fr] A tag with this name already exists',
            invalidTagNameError: '[fr] Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: '[fr] An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: '[fr] Tags are managed in your',
            employeesSeeTagsAs: '[fr] Employees see tags as',
            glCode: '[fr] GL code',
            updateGLCodeFailureMessage: '[fr] An error occurred while updating the GL code, please try again',
            tagRules: '[fr] Tag rules',
            approverDescription: '[fr] Approver',
            importTags: '[fr] Import tags',
            importTagsSupportingText: '[fr] Code your expenses with one type of tag or many.',
            configureMultiLevelTags: '[fr] Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `[fr] Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: '[fr] The first row is the title for each tag list',
                independentTags: '[fr] These are independent tags',
                glAdjacentColumn: '[fr] There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: '[fr] Single level of tags',
                multiLevel: '[fr] Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '[fr] Switch Tag Levels',
                prompt1: '[fr] Switching tag levels will erase all current tags.',
                prompt2: '[fr]  We suggest you first',
                prompt3: '[fr]  download a backup',
                prompt4: '[fr]  by exporting your tags.',
                prompt5: '[fr]  Learn more',
                prompt6: '[fr]  about tag levels.',
            },
            overrideMultiTagWarning: {
                title: '[fr] Import tags',
                prompt1: '[fr] Are you sure?',
                prompt2: '[fr]  The existing tags will be overridden, but you can',
                prompt3: '[fr]  download a backup',
                prompt4: '[fr]  first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `[fr] We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: '[fr] Cannot delete or disable all tags',
                description: `[fr] At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: '[fr] Cannot make all tags optional',
                description: `[fr] At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: '[fr] Cannot make tag list required',
                description: '[fr] You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '[fr] 1 Tag',
                other: (count: number) => `[fr] ${count} Tags`,
            }),
        },
        taxes: {
            subtitle: '[fr] Add tax names, rates, and set defaults.',
            addRate: '[fr] Add rate',
            workspaceDefault: '[fr] Workspace currency default',
            foreignDefault: '[fr] Foreign currency default',
            customTaxName: '[fr] Custom tax name',
            value: '[fr] Value',
            taxReclaimableOn: '[fr] Tax reclaimable on',
            taxRate: '[fr] Tax rate',
            findTaxRate: '[fr] Find tax rate',
            error: {
                taxRateAlreadyExists: '[fr] This tax name is already in use',
                taxCodeAlreadyExists: '[fr] This tax code is already in use',
                valuePercentageRange: '[fr] Please enter a valid percentage between 0 and 100',
                customNameRequired: '[fr] Custom tax name is required',
                deleteFailureMessage: '[fr] An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: '[fr] An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: '[fr] An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: '[fr] The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: '[fr] Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `[fr] Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '[fr] Delete rate',
                deleteMultiple: '[fr] Delete rates',
                enable: '[fr] Enable rate',
                disable: '[fr] Disable rate',
                enableTaxRates: () => ({
                    one: '[fr] Enable rate',
                    other: '[fr] Enable rates',
                }),
                disableTaxRates: () => ({
                    one: '[fr] Disable rate',
                    other: '[fr] Disable rates',
                }),
            },
            importedFromAccountingSoftware: '[fr] The taxes below are imported from your',
            taxCode: '[fr] Tax code',
            updateTaxCodeFailureMessage: '[fr] An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: '[fr] Name your new workspace',
            selectFeatures: '[fr] Select features to copy',
            whichFeatures: '[fr] Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '[fr] \n\nDo you want to continue?',
            categories: '[fr] categories and your auto-categorization rules',
            reimbursementAccount: '[fr] reimbursement account',
            welcomeNote: '[fr] Please start using my new workspace',
            delayedSubmission: '[fr] delayed submission',
            merchantRules: '[fr] Merchant rules',
            merchantRulesCount: () => ({
                one: '[fr] 1 merchant rule',
                other: (count: number) => `[fr] ${count} merchant rules`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `[fr] You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: '[fr] An error occurred while duplicating your new workspace. Please try again.',
        },
        emptyWorkspace: {
            title: '[fr] No workspaces yet',
            subtitle: '[fr] Create a workspace to manage your expenses, reimbursements, and company cards.',
            createAWorkspaceCTA: '[fr] Get Started',
            features: {
                trackAndCollect: '[fr] Track and collect receipts',
                reimbursements: '[fr] Reimburse employees',
                companyCards: '[fr] Manage company cards',
            },
            notFound: '[fr] No workspace found',
            description: '[fr] Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: '[fr] New workspace',
            getTheExpensifyCardAndMore: '[fr] Get the Expensify Card and more',
            confirmWorkspace: '[fr] Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `[fr] My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `[fr] ${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '[fr] An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `[fr] Are you sure you want to remove ${memberName}?`,
                other: '[fr] Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `[fr] ${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '[fr] Remove member',
                other: '[fr] Remove members',
            }),
            findMember: '[fr] Find member',
            removeWorkspaceMemberButtonTitle: '[fr] Remove from workspace',
            removeGroupMemberButtonTitle: '[fr] Remove from group',
            removeRoomMemberButtonTitle: '[fr] Remove from chat',
            removeMemberPrompt: (memberName: string) => `[fr] Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '[fr] Remove member',
            transferOwner: '[fr] Transfer owner',
            makeMember: () => ({
                one: '[fr] Make member',
                other: '[fr] Make members',
            }),
            makeAdmin: () => ({
                one: '[fr] Make admin',
                other: '[fr] Make admins',
            }),
            makeAuditor: () => ({
                one: '[fr] Make auditor',
                other: '[fr] Make auditors',
            }),
            selectAll: '[fr] Select all',
            error: {
                genericAdd: '[fr] There was a problem adding this workspace member',
                cannotRemove: "[fr] You can't remove yourself or the workspace owner",
                genericRemove: '[fr] There was a problem removing that workspace member',
            },
            addedWithPrimary: '[fr] Some members were added with their primary logins.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `[fr] Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `[fr] Total workspace members: ${count}`,
            importMembers: '[fr] Import members',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `[fr] If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `[fr] ${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `[fr] You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[fr] If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `[fr] If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `[fr] ${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: '[fr] Get started by issuing your first virtual or physical card.',
            issueCard: '[fr] Issue card',
            issueNewCard: {
                whoNeedsCard: '[fr] Who needs a card?',
                inviteNewMember: '[fr] Invite new member',
                findMember: '[fr] Find member',
                chooseCardType: '[fr] Choose a card type',
                physicalCard: '[fr] Physical card',
                physicalCardDescription: '[fr] Great for the frequent spender',
                virtualCard: '[fr] Virtual card',
                virtualCardDescription: '[fr] Instant and flexible',
                chooseLimitType: '[fr] Choose a limit type',
                smartLimit: '[fr] Smart Limit',
                smartLimitDescription: '[fr] Spend up to a certain amount before requiring approval',
                monthly: '[fr] Monthly',
                monthlyDescription: '[fr] Limit renews monthly',
                fixedAmount: '[fr] Fixed amount',
                fixedAmountDescription: '[fr] Spend until the limit is reached',
                setLimit: '[fr] Set a limit',
                cardLimitError: '[fr] Please enter an amount less than $21,474,836',
                giveItName: '[fr] Give it a name',
                giveItNameInstruction: '[fr] Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: '[fr] Card name',
                letsDoubleCheck: '[fr] Let’s double check that everything looks right.',
                willBeReadyToUse: '[fr] This card will be ready to use immediately.',
                willBeReadyToShip: '[fr] This card will be ready to ship immediately.',
                cardholder: '[fr] Cardholder',
                cardType: '[fr] Card type',
                limit: '[fr] Limit',
                limitType: '[fr] Limit type',
                disabledApprovalForSmartLimitError: '[fr] Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
                singleUse: '[fr] Single-use',
                singleUseDescription: '[fr] Expires after one transaction',
                validFrom: '[fr] Valid from',
                startDate: '[fr] Start date',
                endDate: '[fr] End date',
                noExpirationHint: "[fr] A card without an expiration date won't expire",
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `[fr] Valid from ${startDate} to ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `[fr] ${startDate} to ${endDate}`,
                combineWithExpiration: '[fr] Combine with expiration options for additional spend control',
                enterValidDate: '[fr] Enter a valid date',
                expirationDate: '[fr] Expiration date',
                limitAmount: '[fr] Limit amount',
                setExpiryOptions: '[fr] Set expiry options',
                setExpiryDate: '[fr] Set expiry date',
                setExpiryDateDescription: '[fr] Card will expire as listed on the card',
                amount: '[fr] Amount',
            },
            deactivateCardModal: {
                deactivate: '[fr] Deactivate',
                deactivateCard: '[fr] Deactivate card',
                deactivateConfirmation: '[fr] Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: '[fr] settings',
            title: '[fr] Connections',
            subtitle: '[fr] Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: '[fr] QuickBooks Online',
            qbd: '[fr] QuickBooks Desktop',
            xero: '[fr] Xero',
            netsuite: '[fr] NetSuite',
            intacct: '[fr] Sage Intacct',
            sap: '[fr] SAP',
            oracle: '[fr] Oracle',
            microsoftDynamics: '[fr] Microsoft Dynamics',
            talkYourOnboardingSpecialist: '[fr] Chat with your setup specialist.',
            talkYourAccountManager: '[fr] Chat with your account manager.',
            talkToConcierge: '[fr] Chat with Concierge.',
            needAnotherAccounting: '[fr] Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '[fr] QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '[fr] Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '[fr] NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '[fr] Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `[fr] There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '[fr] Go to Expensify Classic to manage your settings.',
            setup: '[fr] Connect',
            lastSync: (relativeDate: string) => `[fr] Last synced ${relativeDate}`,
            notSync: '[fr] Not synced',
            import: '[fr] Import',
            export: '[fr] Export',
            advanced: '[fr] Advanced',
            other: '[fr] Other',
            syncNow: '[fr] Sync now',
            disconnect: '[fr] Disconnect',
            reinstall: '[fr] Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[fr] integration';
                return `[fr] Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `[fr] Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[fr] accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "[fr] Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "[fr] Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "[fr] Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "[fr] Can't connect to QuickBooks Desktop";
                    default: {
                        return "[fr] Can't connect to integration";
                    }
                }
            },
            accounts: '[fr] Chart of accounts',
            taxes: '[fr] Taxes',
            imported: '[fr] Imported',
            notImported: '[fr] Not imported',
            importAsCategory: '[fr] Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '[fr] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '[fr] Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '[fr] Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '[fr] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '[fr] Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '[fr] Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: '[fr] NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '[fr] this integration';
                return `[fr] Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `[fr] Are you sure you want to connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '[fr] this accounting integration'}? This will remove any existing accounting connections.`,
            enterCredentials: '[fr] Enter your credentials',
            claimOffer: {
                badgeText: '[fr] Offer available!',
                xero: {
                    headline: '[fr] Get Xero free for 6 months!',
                    description: '[fr] <muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: '[fr] Connect to Xero',
                },
                uber: {
                    headerTitle: '[fr] Uber for Business',
                    headline: '[fr] Get 5% off Uber rides',
                    description: `[fr] <muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: '[fr] Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '[fr] Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '[fr] Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '[fr] Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '[fr] Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return '[fr] Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return '[fr] Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '[fr] Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '[fr] Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return '[fr] Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return '[fr] Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return '[fr] Importing Xero data';
                        case 'startingImportQBO':
                            return '[fr] Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '[fr] Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return '[fr] Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '[fr] Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return '[fr] Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '[fr] Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '[fr] Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return '[fr] Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '[fr] Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '[fr] Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '[fr] Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '[fr] Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '[fr] Updating report fields';
                        case 'jobDone':
                            return '[fr] Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return '[fr] Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return '[fr] Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return '[fr] Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return '[fr] Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '[fr] Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return '[fr] Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return '[fr] Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return '[fr] Syncing tax rates';
                        case 'xeroCheckConnection':
                            return '[fr] Checking Xero connection';
                        case 'xeroSyncTitle':
                            return '[fr] Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return '[fr] Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '[fr] Importing customers';
                        case 'netSuiteSyncInitData':
                            return '[fr] Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return '[fr] Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return '[fr] Importing items';
                        case 'netSuiteSyncData':
                            return '[fr] Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return '[fr] Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return '[fr] Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return '[fr] Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return '[fr] Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return '[fr] Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '[fr] Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '[fr] Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '[fr] Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return '[fr] Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return '[fr] Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return '[fr] Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '[fr] Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '[fr] Importing vendors';
                        case 'intacctCheckConnection':
                            return '[fr] Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return '[fr] Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return '[fr] Importing Sage Intacct data';
                        default: {
                            return `[fr] Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '[fr] Preferred exporter',
            exportPreferredExporterNote:
                '[fr] The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: '[fr] Once set, the preferred exporter will see reports for export in their account.',
            exportAs: '[fr] Export as',
            exportOutOfPocket: '[fr] Export out-of-pocket expenses as',
            exportCompanyCard: '[fr] Export company card expenses as',
            exportDate: '[fr] Export date',
            defaultVendor: '[fr] Default vendor',
            autoSync: '[fr] Auto-sync',
            autoSyncDescription: '[fr] Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: '[fr] Sync reimbursed reports',
            cardReconciliation: '[fr] Card reconciliation',
            reconciliationAccount: '[fr] Reconciliation account',
            continuousReconciliation: '[fr] Continuous Reconciliation',
            saveHoursOnReconciliation:
                '[fr] Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `[fr] <muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: '[fr] Choose the bank account that your Expensify Card payments will be reconciled against.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `[fr] Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        export: {
            notReadyHeading: '[fr] Not ready to export',
            notReadyDescription: '[fr] Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: '[fr] Send invoice',
            sendFrom: '[fr] Send from',
            invoicingDetails: '[fr] Invoicing details',
            invoicingDetailsDescription: '[fr] This info will appear on your invoices.',
            companyName: '[fr] Company name',
            companyWebsite: '[fr] Company website',
            paymentMethods: {
                personal: '[fr] Personal',
                business: '[fr] Business',
                chooseInvoiceMethod: '[fr] Choose a payment method below:',
                payingAsIndividual: '[fr] Paying as an individual',
                payingAsBusiness: '[fr] Paying as a business',
            },
            invoiceBalance: '[fr] Invoice balance',
            invoiceBalanceSubtitle: "[fr] This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: '[fr] Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: '[fr] Invite member',
            members: '[fr] Invite members',
            invitePeople: '[fr] Invite new members',
            genericFailureMessage: '[fr] An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `[fr] Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '[fr] user',
            users: '[fr] users',
            invited: '[fr] invited',
            removed: '[fr] removed',
            to: '[fr] to',
            from: '[fr] from',
        },
        inviteMessage: {
            confirmDetails: '[fr] Confirm details',
            inviteMessagePrompt: '[fr] Make your invitation extra special by adding a message below!',
            personalMessagePrompt: '[fr] Message',
            genericFailureMessage: '[fr] An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: '[fr] Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `[fr] ${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '[fr] Oops! Not so fast...',
            workspaceNeeds: '[fr] A workspace needs at least one enabled distance rate.',
            distance: '[fr] Distance',
            centrallyManage: '[fr] Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: '[fr] Rate',
            addRate: '[fr] Add rate',
            findRate: '[fr] Find rate',
            trackTax: '[fr] Track tax',
            deleteRates: () => ({
                one: '[fr] Delete rate',
                other: '[fr] Delete rates',
            }),
            enableRates: () => ({
                one: '[fr] Enable rate',
                other: '[fr] Enable rates',
            }),
            disableRates: () => ({
                one: '[fr] Disable rate',
                other: '[fr] Disable rates',
            }),
            enableRate: '[fr] Enable rate',
            status: '[fr] Status',
            unit: '[fr] Unit',
            taxFeatureNotEnabledMessage:
                '[fr] <muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: '[fr] Delete distance rate',
            areYouSureDelete: () => ({
                one: '[fr] Are you sure you want to delete this rate?',
                other: '[fr] Are you sure you want to delete these rates?',
            }),
            errors: {
                rateNameRequired: '[fr] Rate name is required',
                existingRateName: '[fr] A distance rate with this name already exists',
            },
        },
        editor: {
            descriptionInputLabel: '[fr] Description',
            nameInputLabel: '[fr] Name',
            typeInputLabel: '[fr] Type',
            initialValueInputLabel: '[fr] Initial value',
            nameInputHelpText: "[fr] This is the name you'll see on your workspace.",
            nameIsRequiredError: "[fr] You'll need to give your workspace a name",
            currencyInputLabel: '[fr] Default currency',
            currencyInputHelpText: '[fr] All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `[fr] The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: '[fr] Save',
            genericFailureMessage: '[fr] An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: '[fr] An error occurred uploading the avatar. Please try again.',
            addressContext: '[fr] A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: '[fr] Expense policy',
        },
        bankAccount: {
            continueWithSetup: '[fr] Continue setup',
            youAreAlmostDone: "[fr] You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: '[fr] Streamline payments',
            connectBankAccountNote: "[fr] Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: '[fr] One more thing!',
            allSet: "[fr] You're all set!",
            accountDescriptionWithCards: '[fr] This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "[fr] Let's finish in chat!",
            finishInChat: '[fr] Finish in chat',
            almostDone: '[fr] Almost done!',
            disconnectBankAccount: '[fr] Disconnect bank account',
            startOver: '[fr] Start over',
            updateDetails: '[fr] Update details',
            yesDisconnectMyBankAccount: '[fr] Yes, disconnect my bank account',
            yesStartOver: '[fr] Yes, start over',
            disconnectYourBankAccount: (bankName: string) =>
                `[fr] Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "[fr] Starting over will clear the progress you've made so far.",
            areYouSure: '[fr] Are you sure?',
            workspaceCurrency: '[fr] Workspace currency',
            updateCurrencyPrompt: '[fr] It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: '[fr] Update to USD',
            updateWorkspaceCurrency: '[fr] Update workspace currency',
            workspaceCurrencyNotSupported: '[fr] Workspace currency not supported',
            yourWorkspace: `[fr] Your workspace is set to an unsupported currency. View the <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: '[fr] Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: '[fr] Transfer owner',
            addPaymentCardTitle: '[fr] Enter your payment card to transfer ownership',
            addPaymentCardButtonText: '[fr] Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `[fr] <muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: '[fr] PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: '[fr] Bank level encryption',
            addPaymentCardRedundant: '[fr] Redundant infrastructure',
            addPaymentCardLearnMore: `[fr] <muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: '[fr] Outstanding balance',
            amountOwedButtonText: '[fr] OK',
            amountOwedText: '[fr] This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: '[fr] Outstanding balance',
            ownerOwesAmountButtonText: '[fr] Transfer balance',
            ownerOwesAmountText: (email: string, amount: string) => `[fr] The account owning this workspace (${email}) has an outstanding balance from a previous month.

Do you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: '[fr] Take over annual subscription',
            subscriptionButtonText: '[fr] Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `[fr] Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: '[fr] Duplicate subscription alert',
            duplicateSubscriptionButtonText: '[fr] Continue',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `[fr] It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.

Click "Continue" if you only want to take over billing for the workspace ${workspaceName}.

If you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '[fr] Cannot transfer ownership',
            hasFailedSettlementsButtonText: '[fr] Got it',
            hasFailedSettlementsText: (email: string) =>
                `[fr] You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '[fr] Failed to clear balance',
            failedToClearBalanceButtonText: '[fr] OK',
            failedToClearBalanceText: '[fr] We were unable to clear the balance. Please try again later.',
            successTitle: '[fr] Woohoo! All set.',
            successDescription: "[fr] You're now the owner of this workspace.",
            errorTitle: '[fr] Oops! Not so fast...',
            errorDescription: `[fr] <muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '[fr] Careful!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `[fr] The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Are you sure you want to export them again?`,
            confirmText: '[fr] Yes, export again',
            cancelText: '[fr] Cancel',
        },
        upgrade: {
            reportFields: {
                title: '[fr] Report fields',
                description: `[fr] Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: '[fr] NetSuite',
                description: `[fr] Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '[fr] Sage Intacct',
                description: `[fr] Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: '[fr] QuickBooks Desktop',
                description: `[fr] Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '[fr] Advanced Approvals',
                description: `[fr] If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            categories: {
                title: '[fr] Categories',
                description: '[fr] Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: '[fr] GL codes',
                description: `[fr] Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '[fr] GL & Payroll codes',
                description: `[fr] Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: '[fr] Tax codes',
                description: `[fr] Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: '[fr] Unlimited Company cards',
                description: `[fr] Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            rules: {
                title: '[fr] Rules',
                description: `[fr] Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.

Require expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: '[fr] Per diem',
                description:
                    '[fr] Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            travel: {
                title: '[fr] Travel',
                description: '[fr] Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            reports: {
                title: '[fr] Reports',
                description: '[fr] Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: '[fr] Multi-level tags',
                description:
                    '[fr] Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: '[fr] Distance rates',
                description: '[fr] Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: '[fr] Auditor',
                description: '[fr] Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '[fr] Multiple approval levels',
                description: '[fr] Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `[fr] <muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: '[fr] per active member per month.',
                perMember: '[fr] per member per month.',
            },
            note: (subscriptionLink: string) => `[fr] <muted-text>Upgrade to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: '[fr] Unlock this feature',
            completed: {
                headline: `[fr] You've upgraded your workspace!`,
                successMessage: (policyName: string, subscriptionLink: string) =>
                    `[fr] <centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `[fr] You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `[fr] You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `[fr] You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: '[fr] Got it, thanks',
                createdWorkspace: `[fr] You've created a workspace!`,
            },
            commonFeatures: {
                title: '[fr] Upgrade to the Control plan',
                note: '[fr] Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `[fr] <muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `[fr] per member per month.` : `[fr] per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: '[fr] Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: '[fr] Smart expense rules',
                    benefit3: '[fr] Multi-level approval workflows',
                    benefit4: '[fr] Enhanced security controls',
                    toUpgrade: '[fr] To upgrade, click',
                    selectWorkspace: '[fr] select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `[fr] Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '[fr] Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: '[fr] Downgrade to Collect',
                note: "[fr] You'll lose access to the following features",
                noteAndMore: '[fr] and more:',
                benefits: {
                    important: '[fr] IMPORTANT: ',
                    confirm: '[fr] You\'ll need to change the "Plan type" of every workspace to "Collect" in order to secure the Collect rate.',
                    benefit1Label: '[fr] ERP integrations',
                    benefit1: '[fr] NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: '[fr] HR integrations',
                    benefit2: '[fr] Workday, Certinia',
                    benefit3Label: '[fr] Security',
                    benefit3: '[fr] SSO/SAML',
                    benefit4Label: '[fr] Advanced',
                    benefit4: '[fr] Smart expense rules, per diems, multi-level approvals, custom reporting, and budgeting',
                    headsUp: '[fr] Heads up!',
                    multiWorkspaceNote: '[fr] You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '[fr] > select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: '[fr] Your workspace has been downgraded',
                description: '[fr] You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: '[fr] Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: '[fr] Pay & downgrade',
            headline: '[fr] Your final payment',
            description1: (formattedAmount: string) => `[fr] Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `[fr] See your breakdown below for ${date}:`,
            subscription:
                '[fr] Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: '[fr] An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: '[fr] Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `[fr] Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `[fr] Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "[fr] You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: '[fr] Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: '[fr] Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: '[fr] Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: '[fr] Chat with your admin',
            chatInAdmins: '[fr] Chat in #admins',
            addPaymentCard: '[fr] Add payment card',
            goToSubscription: '[fr] Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: '[fr] Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `[fr] <muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: '[fr] Receipt required amount',
                receiptRequiredAmountDescription: '[fr] Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `[fr] Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: '[fr] Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: '[fr] Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `[fr] Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: '[fr] Max expense amount',
                maxExpenseAmountDescription: '[fr] Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: '[fr] Max age',
                maxExpenseAge: '[fr] Max expense age',
                maxExpenseAgeDescription: '[fr] Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '[fr] 1 day',
                    other: (count: number) => `[fr] ${count} days`,
                }),
                cashExpenseDefault: '[fr] Cash expense default',
                cashExpenseDefaultDescription:
                    '[fr] Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: '[fr] Reimbursable',
                reimbursableDefaultDescription: '[fr] Expenses are most often paid back to employees',
                nonReimbursableDefault: '[fr] Non-reimbursable',
                nonReimbursableDefaultDescription: '[fr] Expenses are occasionally paid back to employees',
                alwaysReimbursable: '[fr] Always reimbursable',
                alwaysReimbursableDescription: '[fr] Expenses are always paid back to employees',
                alwaysNonReimbursable: '[fr] Always non-reimbursable',
                alwaysNonReimbursableDescription: '[fr] Expenses are never paid back to employees',
                billableDefault: '[fr] Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `[fr] <muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: '[fr] Billable',
                billableDescription: '[fr] Expenses are most often re-billed to clients',
                nonBillable: '[fr] Non-billable',
                nonBillableDescription: '[fr] Expenses are occasionally re-billed to clients',
                eReceipts: '[fr] eReceipts',
                eReceiptsHint: `[fr] eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: '[fr] Attendee tracking',
                attendeeTrackingHint: '[fr] Track the per-person cost for every expense.',
                prohibitedDefaultDescription: '[fr] Flag receipts with these line items for manual review.',
                prohibitedExpenses: '[fr] Prohibited expenses',
                alcohol: '[fr] Alcohol',
                hotelIncidentals: '[fr] Hotel incidentals',
                gambling: '[fr] Gambling',
                tobacco: '[fr] Tobacco',
                adultEntertainment: '[fr] Adult entertainment',
                requireCompanyCard: '[fr] Require company cards for all purchases',
                requireCompanyCardDescription: '[fr] Flag all cash spend, including mileage and per-diem expenses.',
                requireCompanyCardDisabledTooltip: '[fr] Enable Company cards (under More features) to unlock.',
            },
            expenseReportRules: {
                title: '[fr] Advanced',
                subtitle: '[fr] Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: '[fr] Prevent self-approvals',
                preventSelfApprovalsSubtitle: '[fr] Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: '[fr] Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: '[fr] Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: '[fr] Auto-approve reports with all expenses under',
                autoApproveReportsUnderDescription: '[fr] Fully compliant expense reports where all expenses are under this amount will be automatically approved.',
                randomReportAuditTitle: '[fr] Random report audit',
                randomReportAuditDescription: '[fr] Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: '[fr] Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: '[fr] Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `[fr] Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: '[fr] Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: '[fr] Auto-pay reports under',
                autoPayReportsUnderDescription: '[fr] Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `[fr] Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[fr] Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: '[fr] Merchant',
                subtitle: '[fr] Set merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: '[fr] Add merchant rule',
                findRule: '[fr] Find merchant rule',
                addRuleTitle: '[fr] Add rule',
                editRuleTitle: '[fr] Edit rule',
                expensesWith: '[fr] For expenses with:',
                expensesExactlyMatching: '[fr] For expenses exactly matching:',
                applyUpdates: '[fr] Apply these updates:',
                saveRule: '[fr] Save rule',
                previewMatches: '[fr] Preview matches',
                confirmError: '[fr] Enter merchant and apply at least one update',
                confirmErrorMerchant: '[fr] Please enter merchant',
                confirmErrorUpdate: '[fr] Please apply at least one update',
                previewMatchesEmptyStateTitle: '[fr] Nothing to show',
                previewMatchesEmptyStateSubtitle: '[fr] No unsubmitted expenses match this rule.',
                deleteRule: '[fr] Delete rule',
                deleteRuleConfirmation: '[fr] Are you sure you want to delete this rule?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `[fr] If merchant ${isExactMatch ? '[fr] exactly matches' : '[fr] contains'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `[fr] Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `[fr] Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `[fr] Mark as  "${reimbursable ? '[fr] reimbursable' : '[fr] non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `[fr] Mark as "${billable ? '[fr] billable' : '[fr] non-billable'}"`,
                matchType: '[fr] Match type',
                matchTypeContains: '[fr] Contains',
                matchTypeExact: '[fr] Exactly matches',
                duplicateRuleTitle: '[fr] Similar merchant rule already exists',
                duplicateRulePrompt: (merchantName: string) => `[fr] Your existing rule for "${merchantName}" will take priority over this one. Save anyway?`,
                saveAnyway: '[fr] Save anyway',
                applyToExistingUnsubmittedExpenses: '[fr] Apply to existing unsubmitted expenses',
            },
            categoryRules: {
                title: '[fr] Category rules',
                approver: '[fr] Approver',
                requireDescription: '[fr] Require description',
                requireFields: '[fr] Require fields',
                requiredFieldsTitle: '[fr] Required fields',
                requiredFieldsDescription: (categoryName: string) => `[fr] This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: '[fr] Require attendees',
                descriptionHint: '[fr] Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `[fr] Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: '[fr] Hint',
                descriptionHintSubtitle: '[fr] Pro-tip: The shorter the better!',
                maxAmount: '[fr] Max amount',
                flagAmountsOver: '[fr] Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `[fr] Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: '[fr] This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: '[fr] Individual expense',
                    expenseSubtitle: '[fr] Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: '[fr] Category total',
                    dailySubtitle: '[fr] Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: '[fr] Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `[fr] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[fr] Never require receipts',
                    always: '[fr] Always require receipts',
                },
                requireItemizedReceiptsOver: '[fr] Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `[fr] ${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '[fr] Never require itemized receipts',
                    always: '[fr] Always require itemized receipts',
                },
                defaultTaxRate: '[fr] Default tax rate',
                enableWorkflows: (moreFeaturesLink: string) => `[fr] Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: '[fr] Expense policy',
                cardSubtitle: "[fr] Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
            },
            spendRules: {
                title: '[fr] Spend',
                subtitle: '[fr] Approve or decline Expensify Card transactions in realtime.',
                defaultRuleDescription: '[fr] All cards',
                block: '[fr] Block',
                defaultRuleTitle: '[fr] Categories: Adult services, ATMs, gambling, money transfers',
                builtInProtectionModal: {
                    title: '[fr] Expensify Cards offer built-in protection - always',
                    description: `[fr] Expensify always declines these charges:

  • Adult services
  • ATMs
  • Gambling
  • Money transfers

Add more spend rules to protect company cash flow.`,
                },
                addSpendRule: '[fr] Add spend rule',
                editRuleTitle: '[fr] Edit rule',
                cardPageTitle: '[fr] Card',
                cardsSectionTitle: '[fr] Cards',
                chooseCards: '[fr] Choose cards',
                saveRule: '[fr] Save rule',
                deleteRule: '[fr] Delete rule',
                deleteRuleConfirmation: '[fr] Are you sure you want to delete this rule?',
                allow: '[fr] Allow',
                spendRuleSectionTitle: '[fr] Spend rule',
                restrictionType: '[fr] Restriction type',
                restrictionTypeHelpAllow: "[fr] Charges are approved if they match any merchant or category, and don't exceed a max amount.",
                restrictionTypeHelpBlock: '[fr] Charges are declined if they match any merchant or category, or exceed a max amount.',
                addMerchant: '[fr] Add merchant',
                merchantContains: '[fr] Merchant contains',
                merchantExactlyMatches: '[fr] Merchant exactly matches',
                noBlockedMerchants: '[fr] No blocked merchants',
                addMerchantToBlockSpend: '[fr] Add a merchant to block spend',
                noAllowedMerchants: '[fr] No allowed merchants',
                addMerchantToAllowSpend: '[fr] Add a merchant to allow spend',
                matchType: '[fr] Match type',
                matchTypeContains: '[fr] Contains',
                matchTypeExact: '[fr] Matches exactly',
                spendCategory: '[fr] Spend category',
                maxAmount: '[fr] Max amount',
                maxAmountHelp: '[fr] Any charge over this amount will be declined, regardless of merchant and spend category restrictions.',
                currencyMismatchTitle: '[fr] Currency mismatch',
                currencyMismatchPrompt: '[fr] To set a max amount, select cards that settle in the same currency.',
                reviewSelectedCards: '[fr] Review selected cards',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => `[fr] ${summary}, +${count} more`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '[fr] Apply at least one spend rule to one card',
                confirmErrorCardRequired: '[fr] Card is a required field',
                confirmErrorApplyAtLeastOneSpendRule: '[fr] Apply at least one spend rule',
                categories: '[fr] Categories',
                merchants: '[fr] Merchants',
                noAvailableCards: '[fr] All cards already have a rule',
                noAvailableCardsSubtitle: '[fr] Edit an existing card rule to make changes',
                max: '[fr] Max',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '[fr] Airlines',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '[fr] Alcohol and bars',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: '[fr] Amazon and bookstores',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '[fr] Automotive',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: '[fr] Car rentals',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '[fr] Dining',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '[fr] Fuel and gas',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '[fr] Government and non-profits',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '[fr] Groceries',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: '[fr] Gyms and fitness',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '[fr] Healthcare',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: '[fr] Hotels',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: '[fr] Internet and phone',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '[fr] Office supplies',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '[fr] Parking and tolls',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: '[fr] Professional services',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '[fr] Retail',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '[fr] Shipping and delivery',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: '[fr] Software',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '[fr] Transit and rideshare',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '[fr] Travel agencies',
                },
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '[fr] Collect',
                    description: '[fr] For teams looking to automate their processes.',
                },
                corporate: {
                    label: '[fr] Control',
                    description: '[fr] For organizations with advanced requirements.',
                },
            },
            description: "[fr] Choose a plan that's right for you. For a detailed list of features and pricing, check out our",
            subscriptionLink: '[fr] plan types and pricing help page',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `[fr] You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `[fr] You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: '[fr] Subscriptions',
        },
    },
    getAssistancePage: {
        title: '[fr] Get assistance',
        subtitle: "[fr] We're here to clear your path to greatness!",
        description: '[fr] Choose from the support options below:',
        chatWithConcierge: '[fr] Chat with Concierge',
        scheduleSetupCall: '[fr] Schedule a setup call',
        scheduleACall: '[fr] Schedule call',
        questionMarkButtonTooltip: '[fr] Get assistance from our team',
        exploreHelpDocs: '[fr] Explore help docs',
        registerForWebinar: '[fr] Register for webinar',
        onboardingHelp: '[fr] Onboarding help',
    },
    emojiPicker: {
        emojiNotSelected: '[fr] Emoji not selected',
        skinTonePickerLabel: '[fr] Change default skin tone',
        headers: {
            frequentlyUsed: '[fr] Frequently Used',
            smileysAndEmotion: '[fr] Smileys & Emotion',
            peopleAndBody: '[fr] People & Body',
            animalsAndNature: '[fr] Animals & Nature',
            foodAndDrink: '[fr] Food & Drinks',
            travelAndPlaces: '[fr] Travel & Places',
            activities: '[fr] Activities',
            objects: '[fr] Objects',
            symbols: '[fr] Symbols',
            flags: '[fr] Flags',
        },
    },
    newRoomPage: {
        newRoom: '[fr] New room',
        groupName: '[fr] Group name',
        roomName: '[fr] Room name',
        visibility: '[fr] Visibility',
        restrictedDescription: '[fr] People in your workspace can find this room',
        privateDescription: '[fr] People invited to this room can find it',
        publicDescription: '[fr] Anyone can find this room',
        public_announceDescription: '[fr] Anyone can find this room',
        createRoom: '[fr] Create room',
        roomAlreadyExistsError: '[fr] A room with this name already exists',
        roomNameReservedError: (reservedName: string) => `[fr] ${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '[fr] Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: '[fr] Please enter a room name',
        pleaseSelectWorkspace: '[fr] Please select a workspace',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `[fr] ${actor}renamed to "${newName}" (previously "${oldName}")` : `[fr] ${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: (newName: string) => `[fr] Room renamed to ${newName}`,
        social: '[fr] social',
        selectAWorkspace: '[fr] Select a workspace',
        growlMessageOnRenameError: '[fr] Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: '[fr] Workspace',
            private: '[fr] Private',
            public: '[fr] Public',
            public_announce: '[fr] Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '[fr] Submit and Close',
        submitAndApprove: '[fr] Submit and Approve',
        advanced: '[fr] ADVANCED',
        dynamicExternal: '[fr] DYNAMIC_EXTERNAL',
        smartReport: '[fr] SMARTREPORT',
        billcom: '[fr] BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[fr] set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `[fr] removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
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
            `[fr] changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `[fr] changed the company address to "${newAddress}" (previously "${previousAddress}")` : `[fr] set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[fr] added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `[fr] removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `[fr] changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `[fr] added the category "${categoryName}"`,
        deleteCategory: (categoryName: string) => `[fr] removed the category "${categoryName}"`,
        updateCategory: (categoryName: string, oldValue: boolean) => `[fr] ${oldValue ? '[fr] disabled' : '[fr] enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[fr] added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[fr] removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[fr] changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `[fr] added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `[fr] removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `[fr] changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `[fr] changed the "${categoryName}" category description to ${!oldValue ? '[fr] required' : '[fr] not required'} (previously ${!oldValue ? '[fr] not required' : '[fr] required'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `[fr] added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `[fr] removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `[fr] changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[fr] added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `[fr] changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `[fr] updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `[fr] changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `[fr] updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `[fr] changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `[fr] renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `[fr] removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }
            return !oldValue
                ? `[fr] added the description hint "${newValue}" to the category "${categoryName}"`
                : `[fr] changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategories: (count: number) => `[fr] updated ${count} categories`,
        updateTagListName: (oldName: string, newName: string) => `[fr] changed the tag list name to "${newName}" (previously "${oldName}")`,
        updateTagList: (tagListName: string) => `[fr] updated tags on the list "${tagListName}"`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `[fr] changed tag list "${tagListsName}" to ${isRequired ? '[fr] required' : '[fr] not required'}`,
        importTags: '[fr] imported tags from a spreadsheet',
        deletedAllTags: '[fr] deleted all tags',
        addTag: (tagListName: string, tagName?: string) => `[fr] added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `[fr] updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}"`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: (tagListName: string, tagName?: string) => `[fr] removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `[fr] removed "${count}" tags from the list "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `[fr] updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `[fr] updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `[fr] changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `[fr] ${newValue ? '[fr] enabled' : '[fr] disabled'} tax tracking on distance rates`,
        updateCustomUnitDefaultCategory: ({customUnitName, newValue, oldValue}: UpdatePolicyCustomUnitDefaultCategoryParams) =>
            `[fr] changed the ${customUnitName} default category to "${newValue}" ${oldValue ? `[fr] (previously "${oldValue}")` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `[fr] imported rates for custom unit "${customUnitName}"`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `[fr] added a new ${customUnitName} rate "${rateName}"`,
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `[fr] removed the "${customUnitName}" rate "${rateName}"`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `[fr] changed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${customUnitSubRateName}" ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `[fr] removed "${customUnitName}" rate "${customUnitRateName}" sub-rate "${removedSubRateName}"`,
        addedReportField: ({fieldType, fieldName, defaultValue}: AddedOrDeletedPolicyReportFieldParams) =>
            `[fr] added ${fieldType} report field "${fieldName}"${defaultValue ? `[fr]  with default value "${defaultValue}"` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `[fr] changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `[fr] changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `[fr] added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `[fr] changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `[fr] added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `[fr] ${newValue ? '[fr] enabled' : '[fr] disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `[fr] set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `[fr] added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `[fr] removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `[fr] ${optionEnabled ? '[fr] enabled' : '[fr] disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `[fr] ${allEnabled ? '[fr] enabled' : '[fr] disabled'} all options for the report field "${fieldName}" `;
            }
            return `[fr] ${allEnabled ? '[fr] enabled' : '[fr] disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? '[fr] enabled' : '[fr] disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `[fr] removed ${fieldType} Report Field "${fieldName}"`,
        addedCardFeed: (feedName: string) => `[fr] added card feed "${feedName}"`,
        removedCardFeed: (feedName: string) => `[fr] removed card feed "${feedName}"`,
        renamedCardFeed: (newName: string, oldName: string) => `[fr] renamed card feed to "${newName}" (previously "${oldName}")`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) => `[fr] assigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `[fr] unassigned ${email} ${feedName ? `"${feedName}" ` : ''}company card ending in ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} cardholders to delete card transactions for card feed "${feedName}"`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `[fr] changed card feed "${feedName}" statement period end day${newValue ? `[fr]  to "${newValue}"` : ''}${previousValue ? `[fr]  (previously "${previousValue}")` : ''}`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `[fr] updated "Prevent self-approval" to "${newValue === 'true' ? '[fr] Enabled' : '[fr] Disabled'}" (previously "${oldValue === 'true' ? '[fr] Enabled' : '[fr] Disabled'}")`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `[fr] set the monthly report submission date to "${newValue}"`;
            }
            return `[fr] updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `[fr] updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `[fr] updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: (value: boolean) => `[fr] turned "Enforce default report titles" ${value ? '[fr] on' : '[fr] off'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `[fr] changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `[fr] updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `[fr] set the description of this workspace to "${newDescription}"`
                : `[fr] updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('[fr]  and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `[fr] removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `[fr] removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `[fr] updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `[fr] updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `[fr] updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `[fr] updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: '[fr] upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `[fr] This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: '[fr] downgraded this workspace to the Collect plan',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `[fr] changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `[fr] changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        addBudget: ({frequency, entityName, entityType, shared, individual, notificationThreshold}: AddBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[fr]  with notification threshold of "${notificationThreshold}%"` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `[fr] added ${frequency} individual budget of "${individual}" and ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            if (typeof individual !== 'undefined') {
                return `[fr] added ${frequency} individual budget of "${individual}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
            }
            return `[fr] added ${frequency} shared budget of "${shared}"${thresholdSuffix} to the ${entityType} "${entityName}"`;
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
                changesList.push(`[fr] changed budget frequency to "${newFrequency}" (previously "${oldFrequency}")`);
            }
            if (sharedChanged) {
                changesList.push(`[fr] changed total workspace budget to "${newShared}" (previously "${oldShared}")`);
            }
            if (individualChanged) {
                changesList.push(`[fr] changed individual budget to "${newIndividual}" (previously "${oldIndividual}")`);
            }
            if (thresholdChanged) {
                changesList.push(`[fr] changed notification threshold to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `[fr] updated budget for the ${entityType} "${entityName}"`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `[fr] changed budget frequency for the ${entityType} "${entityName}" to "${newFrequency}" (previously "${oldFrequency}")`;
                }
                if (sharedChanged) {
                    return `[fr] changed total workspace budget for the ${entityType} "${entityName}" to "${newShared}" (previously "${oldShared}")`;
                }
                if (individualChanged) {
                    return `[fr] changed individual budget for the ${entityType} "${entityName}" to "${newIndividual}" (previously "${oldIndividual}")`;
                }
                return `[fr] changed notification threshold for the ${entityType} "${entityName}" to "${newNotificationThreshold}%" (previously "${oldNotificationThreshold}%")`;
            }
            return `[fr] updated budget for the ${entityType} "${entityName}": ${changesList.join('; ')}`;
        },
        deleteBudget: ({entityType, entityName, frequency, individual, shared, notificationThreshold}: DeleteBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `[fr]  with notification threshold of "${notificationThreshold}%"` : '';
            if (shared && individual) {
                return `[fr] removed ${frequency} shared budget of "${shared}" and individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (shared) {
                return `[fr] removed ${frequency} shared budget of "${shared}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            if (individual) {
                return `[fr] removed ${frequency} individual budget of "${individual}"${thresholdSuffix} from the ${entityType} "${entityName}"`;
            }
            return `[fr] removed budget from the ${entityType} "${entityName}"`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} time tracking`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `[fr] changed hourly rate to "${newRate}" (previously "${oldRate}")`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[fr] added "${prohibitedExpense}" to prohibited expenses`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `[fr] removed "${prohibitedExpense}" from prohibited expenses`,
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `[fr] changed reimbursement method to "${newReimbursementChoice}" (previously "${oldReimbursementChoice}")`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} pre-approval of workspace join requests`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `[fr] changed custom report name formula to "${newDefaultTitle}" (previously "${oldDefaultTitle}")`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `[fr] took over ownership of ${policyName} from ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} scheduled submit`,
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
            `[fr] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". ${userEmail} is currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}.${summaryLink ? `[fr]  <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
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
            `[fr] Heads up! This workspace has a ${budgetFrequency} budget of "${budgetAmount}" for the ${budgetTypeForNotificationMessage} "${budgetName}". You're currently at ${approvedReimbursedClosedSpend}, which is over ${thresholdPercentage}% of the budget. There's also ${awaitingApprovalSpend} awaiting approval, and ${unsubmittedSpend} that hasn't been submitted yet, for a total of ${totalSpend}. ${summaryLink ? `[fr] <a href="${summaryLink}">Here's a report</a> with all those expenses for your records!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} categories`;
                case 'tags':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} tags`;
                case 'workflows':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} workflows`;
                case 'distance rates':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} distance rates`;
                case 'accounting':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} accounting`;
                case 'Expensify Cards':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} Expensify Cards`;
                case 'travel invoicing':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} travel invoicing`;
                case 'company cards':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} company cards`;
                case 'invoicing':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} invoicing`;
                case 'per diem':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} per diem`;
                case 'receipt partners':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} receipt partners`;
                case 'rules':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} rules`;
                case 'tax tracking':
                    return `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} tax tracking`;
                default:
                    return `${enabled ? '[fr] enabled' : '[fr] disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} attendee tracking`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} auto-pay approved reports`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `[fr] set the auto-pay approved reports threshold to "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `[fr] changed the auto-pay approved reports threshold to "${newLimit}" (previously "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: '[fr] removed the auto-pay approved reports threshold',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `[fr] changed the default approver to ${newApprover} (previously ${previousApprover})` : `[fr] changed the default approver to ${newApprover}`,
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
            let text = `[fr] changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `[fr]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[fr]  (previously default approver)';
            } else if (previousApprover) {
                text += `[fr]  (previously ${previousApprover})`;
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
                ? `[fr] changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `[fr] changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += `[fr]  (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '[fr]  (previously default approver)';
            } else if (previousApprover) {
                text += `[fr]  (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[fr] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `[fr] changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `[fr] changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `[fr] changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[fr] changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `[fr] set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `[fr] changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `[fr] set the invoice company website to "${newValue}"`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser ? `[fr] changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")` : `[fr] changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: (enabled: boolean) => `[fr] ${enabled ? '[fr] enabled' : '[fr] disabled'} reimbursements`,
        updateCustomTaxName: ({oldName, newName}: UpdatedPolicyCustomTaxNameParams) => `[fr] changed the custom tax name to "${newName}" (previously "${oldName}")`,
        updateCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyCurrencyDefaultTaxParams) =>
            `[fr] changed the workspace currency default tax rate to "${newName}" (previously "${oldName}")`,
        updateForeignCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyForeignCurrencyDefaultTaxParams) =>
            `[fr] changed the foreign currency default tax rate to "${newName}" (previously "${oldName}")`,
        addTax: (taxName: string) => `[fr] added the tax "${taxName}"`,
        deleteTax: (taxName: string) => `[fr] removed the tax "${taxName}"`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `[fr] renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `[fr] changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `[fr] changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `[fr] ${oldValue ? '[fr] disabled' : '[fr] enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `[fr] set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `[fr] changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: (oldValue: string) => `[fr] removed receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: (newValue: string) => `[fr] set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `[fr] changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: (oldValue: string) => `[fr] removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: (newValue: string) => `[fr] set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `[fr] changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: (oldValue: string) => `[fr] removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: '[fr] Member not found.',
        useInviteButton: '[fr] To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `[fr] You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `[fr] It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `[fr] Are you sure you want to remove ${memberName} from the room?`,
            other: '[fr] Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: '[fr] There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: '[fr] Assign task',
        assignMe: '[fr] Assign to me',
        confirmTask: '[fr] Confirm task',
        confirmError: '[fr] Please enter a title and select a share destination',
        descriptionOptional: '[fr] Description (optional)',
        pleaseEnterTaskName: '[fr] Please enter a title',
        pleaseEnterTaskDestination: '[fr] Please select where you want to share this task',
    },
    task: {
        task: '[fr] Task',
        title: '[fr] Title',
        description: '[fr] Description',
        assignee: '[fr] Assignee',
        completed: '[fr] Completed',
        action: '[fr] Complete',
        messages: {
            created: (title: string) => `[fr] task for ${title}`,
            completed: '[fr] marked as complete',
            canceled: '[fr] deleted task',
            reopened: '[fr] marked as incomplete',
            error: "[fr] You don't have permission to take the requested action",
        },
        markAsComplete: '[fr] Mark as complete',
        markAsIncomplete: '[fr] Mark as incomplete',
        assigneeError: '[fr] An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: '[fr] There was an error creating this task. Please try again later.',
        deleteTask: '[fr] Delete task',
        deleteConfirmation: '[fr] Are you sure you want to delete this task?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `[fr] ${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '[fr] Keyboard shortcuts',
        subtitle: '[fr] Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: '[fr] Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: '[fr] Mark all messages as read',
            escape: '[fr] Escape dialogs',
            search: '[fr] Open search dialog',
            newChat: '[fr] New chat screen',
            copy: '[fr] Copy comment',
            openDebug: '[fr] Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: '[fr] Screen share',
        screenShareRequest: '[fr] Expensify is inviting you to a screen share',
    },
    search: {
        resultsAreLimited: '[fr] Search results are limited.',
        viewResults: '[fr] View results',
        appliedFilters: '[fr] Applied filters',
        resetFilters: '[fr] Reset filters',
        searchResults: {
            emptyResults: {
                title: '[fr] Nothing to show',
                subtitle: `[fr] Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "[fr] You haven't created any expenses yet",
                subtitle: '[fr] Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[fr] Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "[fr] You haven't created any reports yet",
                subtitle: '[fr] Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[fr] Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    [fr] You haven't created any
                    invoices yet
                `),
                subtitle: '[fr] Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: '[fr] Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: '[fr] No trips to display',
                subtitle: '[fr] Get started by booking your first trip below.',
                buttonText: '[fr] Book a trip',
            },
            emptySubmitResults: {
                title: '[fr] No expenses to submit',
                subtitle: "[fr] You're all clear. Take a victory lap!",
                buttonText: '[fr] Create report',
            },
            emptyApproveResults: {
                title: '[fr] No expenses to approve',
                subtitle: '[fr] Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: '[fr] No expenses to pay',
                subtitle: '[fr] Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: '[fr] No expenses to export',
                subtitle: '[fr] Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: '[fr] No expenses to display',
                subtitle: '[fr] No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: '[fr] No expenses to approve',
                subtitle: '[fr] Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: '[fr] Columns',
        editColumns: '[fr] Edit columns',
        resetColumns: '[fr] Reset columns',
        groupColumns: '[fr] Group columns',
        expenseColumns: '[fr] Expense Columns',
        statements: '[fr] Statements',
        cardStatements: '[fr] Card statements',
        monthlyAccrual: '[fr] Monthly accrual',
        unapprovedCash: '[fr] Unapproved cash',
        unapprovedCard: '[fr] Unapproved card',
        reconciliation: '[fr] Reconciliation',
        topSpenders: '[fr] Top spenders',
        saveSearch: '[fr] Save search',
        deleteSavedSearch: '[fr] Delete saved search',
        deleteSavedSearchConfirm: '[fr] Are you sure you want to delete this search?',
        searchName: '[fr] Search name',
        savedSearchesMenuItemTitle: '[fr] Saved',
        topCategories: '[fr] Top categories',
        topMerchants: '[fr] Top merchants',
        spendOverTime: '[fr] Spend over time',
        groupedExpenses: '[fr] grouped expenses',
        bulkActions: {
            editMultiple: '[fr] Edit multiple',
            editMultipleTitle: '[fr] Edit multiple expenses',
            editMultipleDescription: "[fr] Changes will be set for all selected expenses and will override any previously set values. Just sayin'.",
            approve: '[fr] Approve',
            pay: '[fr] Pay',
            delete: '[fr] Delete',
            hold: '[fr] Hold',
            unhold: '[fr] Remove hold',
            reject: '[fr] Reject',
            duplicateExpense: ({count}: {count: number}) => `[fr] Duplicate ${count === 1 ? '[fr] expense' : '[fr] expenses'}`,
            noOptionsAvailable: '[fr] No options available for the selected group of expenses.',
        },
        filtersHeader: '[fr] Filters',
        filters: {
            date: {
                before: (date?: string) => `[fr] Before ${date ?? ''}`,
                after: (date?: string) => `[fr] After ${date ?? ''}`,
                on: (date?: string) => `[fr] On ${date ?? ''}`,
                customDate: '[fr] Custom date',
                customRange: '[fr] Custom range',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '[fr] Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '[fr] Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '[fr] This month',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '[fr] Year to date',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '[fr] Last 12 months',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '[fr] Last statement',
                },
            },
            status: '[fr] Status',
            keyword: '[fr] Keyword',
            keywords: '[fr] Keywords',
            limit: '[fr] Limit',
            limitDescription: '[fr] Set a limit for the results of your search.',
            currency: '[fr] Currency',
            completed: '[fr] Completed',
            amount: {
                lessThan: (amount?: string) => `[fr] Less than ${amount ?? ''}`,
                greaterThan: (amount?: string) => `[fr] Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `[fr] Between ${greaterThan} and ${lessThan}`,
                equalTo: (amount?: string) => `[fr] Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: '[fr] Expensify',
                individualCards: '[fr] Individual cards',
                closedCards: '[fr] Closed cards',
                cardFeeds: '[fr] Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `[fr] All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `[fr] All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: (name: string, value: string) => `[fr] ${name} is ${value}`,
            current: '[fr] Current',
            past: '[fr] Past',
            submitted: '[fr] Submitted',
            approved: '[fr] Approved',
            paid: '[fr] Paid',
            exported: '[fr] Exported',
            posted: '[fr] Posted',
            withdrawn: '[fr] Withdrawn',
            billable: '[fr] Billable',
            reimbursable: '[fr] Reimbursable',
            purchaseCurrency: '[fr] Purchase currency',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '[fr] From',
                [CONST.SEARCH.GROUP_BY.CARD]: '[fr] Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[fr] Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: '[fr] Category',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '[fr] Merchant',
                [CONST.SEARCH.GROUP_BY.TAG]: '[fr] Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: '[fr] Month',
                [CONST.SEARCH.GROUP_BY.WEEK]: '[fr] Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: '[fr] Year',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '[fr] Quarter',
            },
            feed: '[fr] Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: '[fr] Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '[fr] Reimbursement',
            },
            is: '[fr] Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '[fr] Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '[fr] Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '[fr] Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: '[fr] Export',
            },
        },
        display: {
            label: '[fr] Display',
            sortBy: '[fr] Sort by',
            groupBy: '[fr] Group by',
            limitResults: '[fr] Limit results',
        },
        has: '[fr] Has',
        view: {
            label: '[fr] View',
            table: '[fr] Table',
            bar: '[fr] Bar',
            line: '[fr] Line',
            pie: '[fr] Pie',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '[fr] From',
            [CONST.SEARCH.GROUP_BY.CARD]: '[fr] Cards',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '[fr] Exports',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: '[fr] Categories',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '[fr] Merchants',
            [CONST.SEARCH.GROUP_BY.TAG]: '[fr] Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: '[fr] Months',
            [CONST.SEARCH.GROUP_BY.WEEK]: '[fr] Weeks',
            [CONST.SEARCH.GROUP_BY.YEAR]: '[fr] Years',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '[fr] Quarters',
        },
        moneyRequestReport: {
            emptyStateTitle: '[fr] This report has no expenses.',
            accessPlaceHolder: '[fr] Open for details',
        },
        noCategory: '[fr] No category',
        noMerchant: '[fr] No merchant',
        noTag: '[fr] No tag',
        expenseType: '[fr] Expense type',
        withdrawalType: '[fr] Withdrawal type',
        recentSearches: '[fr] Recent searches',
        recentChats: '[fr] Recent chats',
        searchIn: '[fr] Search in',
        searchPlaceholder: '[fr] Search for something',
        suggestions: '[fr] Suggestions',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `[fr] Suggestions available${query ? `[fr]  for ${query}` : ''}. ${count} result.`,
            other: (resultCount: number) => `[fr] Suggestions available${query ? `[fr]  for ${query}` : ''}. ${resultCount} results.`,
        }),
        exportSearchResults: {
            title: '[fr] Create export',
            description: "[fr] Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: '[fr] Exported to',
        exportAll: {
            selectAllMatchingItems: '[fr] Select all matching items',
            allMatchingItemsSelected: '[fr] All matching items selected',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: '[fr] Please select dates for both From and To',
        },
    },
    genericErrorPage: {
        title: '[fr] Uh-oh, something went wrong!',
        body: {
            helpTextMobile: '[fr] Please close and reopen the app, or switch to',
            helpTextWeb: '[fr] web.',
            helpTextConcierge: '[fr] If the problem persists, reach out to',
        },
        refresh: '[fr] Refresh',
    },
    fileDownload: {
        success: {
            title: '[fr] Downloaded!',
            message: '[fr] Attachment successfully downloaded!',
            qrMessage: '[fr] Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: '[fr] Attachment error',
            message: "[fr] Attachment can't be downloaded",
        },
        permissionError: {
            title: '[fr] Storage access',
            message: "[fr] Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: '[fr] Pending',
            cleared: '[fr] Cleared',
            failed: '[fr] Failed',
        },
        failedError: ({link}: {link: string}) => `[fr] We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `[fr] ${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: '[fr] Report layout',
        groupByLabel: '[fr] Group by:',
        selectGroupByOption: '[fr] Select how to group report expenses',
        uncategorized: '[fr] Uncategorized',
        noTag: '[fr] No tag',
        selectGroup: ({groupName}: {groupName: string}) => `[fr] Select all expenses in ${groupName}`,
        groupBy: {
            category: '[fr] Category',
            tag: '[fr] Tag',
        },
    },
    report: {
        newReport: {
            createExpense: '[fr] Create expense',
            createReport: '[fr] Create report',
            chooseWorkspace: '[fr] Choose a workspace for this report.',
            emptyReportConfirmationTitle: '[fr] You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `[fr] Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationPromptLink: '[fr] Reports',
            emptyReportConfirmationDontShowAgain: "[fr] Don't show me this again",
            genericWorkspaceName: '[fr] this workspace',
        },
        genericCreateReportFailureMessage: '[fr] Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: '[fr] Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: '[fr] Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: '[fr] Unexpected error renaming the report. Please try again later.',
        noActivityYet: '[fr] No activity yet',
        connectionSettings: '[fr] Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `[fr] changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `[fr] set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `[fr] changed the workspace${fromPolicyName ? `[fr]  (previously ${fromPolicyName})` : ''}`;
                    }
                    return `[fr] changed the workspace to ${toPolicyName}${fromPolicyName ? `[fr]  (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `[fr] changed type from ${oldType} to ${newType}`,
                exportedToCSV: `[fr] exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `[fr] exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `[fr] exported to ${label} via`,
                    automaticActionTwo: '[fr] accounting settings',
                    manual: (label: string) => `[fr] marked this report as manually exported to ${label}.`,
                    automaticActionThree: '[fr] and successfully created a record for',
                    reimburseableLink: '[fr] out-of-pocket expenses',
                    nonReimbursableLink: '[fr] company card expenses',
                    pending: (label: string) => `[fr] started exporting this report to ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `[fr] failed to export this report to ${label} ("${errorMessage}${linkText ? `[fr]  <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `[fr] added a receipt`,
                managerDetachReceipt: `[fr] removed a receipt`,
                markedReimbursed: (amount: string, currency: string) => `[fr] paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `[fr] paid ${currency}${amount} via integration`,
                outdatedBankAccount: `[fr] couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounceDefault: `[fr] couldn't process the payment due to an incorrect routing/account number or closed account`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `[fr] couldn't process the payment: ${returnReason}`,
                reimbursementACHCancelled: `[fr] canceled the payment`,
                reimbursementAccountChanged: `[fr] couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `[fr] processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `[fr] randomly selected for review`,
                selectedForRandomAuditMarkdown: `[fr] [randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `[fr] invited member ${to}`,
                unshare: ({to}: UnshareParams) => `[fr] removed member ${to}`,
                stripePaid: (amount: string, currency: string) => `[fr] paid ${currency}${amount}`,
                takeControl: `[fr] took control`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `[fr] Open the Expensify mobile app to review your ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''}transaction`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `[fr] there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `[fr] The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `[fr] the Plaid connection to your business bank account is broken. Please <a href='${walletRoute}'>reconnect your bank account ${maskedAccountNumber}</a> so you can continue to use your Expensify Cards.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `[fr] ${email} joined via the workspace invite link` : `[fr] added ${email} as ${role === 'member' ? '[fr] a' : '[fr] an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `[fr] updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[fr] removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[fr] added "${newValue}" to ${email}’s custom field 1`
                        : `[fr] changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `[fr] removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }
                    return !previousValue
                        ? `[fr] added "${newValue}" to ${email}’s custom field 2`
                        : `[fr] changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: (nameOrEmail: string) => `[fr] ${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `[fr] removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `[fr] removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `[fr] connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '[fr] left the chat',
                leftTheChatWithName: (nameOrEmail: string) => `[fr] ${nameOrEmail ? `${nameOrEmail}: ` : ''}left the chat`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `[fr] business bank account ${maskedBankAccountNumber} has been automatically locked due to an issue with either Reimbursement or Expensify Card settlement. Please fix the issue in your <a href="${linkURL}">workspace settings</a>.`,
            },
            error: {
                invalidCredentials: '[fr] Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `[fr] ${summary} for ${dayCount} ${dayCount === 1 ? '[fr] day' : '[fr] days'} until ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `[fr] ${summary} from ${timePeriod} on ${date}`,
        startTimer: '[fr] Start Timer',
        stopTimer: '[fr] Stop Timer',
        scheduleOOO: '[fr] Schedule OOO',
        scheduleOOOTitle: '[fr] Schedule Out of Office',
        date: '[fr] Date',
        time: '[fr] Time (use 24-hour format)',
        durationAmount: '[fr] Duration',
        durationUnit: '[fr] Unit',
        reason: '[fr] Reason',
        workingPercentage: '[fr] Working percentage',
        dateRequired: '[fr] Date is required.',
        invalidTimeFormat: '[fr] Please enter a valid 24-hour time (e.g., 14:30).',
        enterANumber: '[fr] Please enter a number.',
        hour: '[fr] hours',
        day: '[fr] days',
        week: '[fr] weeks',
        month: '[fr] months',
    },
    footer: {
        features: '[fr] Features',
        expenseManagement: '[fr] Expense Management',
        spendManagement: '[fr] Spend Management',
        expenseReports: '[fr] Expense Reports',
        companyCreditCard: '[fr] Company Credit Card',
        receiptScanningApp: '[fr] Receipt Scanning App',
        billPay: '[fr] Bill Pay',
        invoicing: '[fr] Invoicing',
        CPACard: '[fr] CPA Card',
        payroll: '[fr] Payroll',
        travel: '[fr] Travel',
        resources: '[fr] Resources',
        expensifyApproved: '[fr] ExpensifyApproved!',
        pressKit: '[fr] Press Kit',
        support: '[fr] Support',
        expensifyHelp: '[fr] ExpensifyHelp',
        terms: '[fr] Terms of Service',
        privacy: '[fr] Privacy',
        learnMore: '[fr] Learn More',
        aboutExpensify: '[fr] About Expensify',
        blog: '[fr] Blog',
        jobs: '[fr] Jobs',
        expensifyOrg: '[fr] Expensify.org',
        investorRelations: '[fr] Investor Relations',
        getStarted: '[fr] Get Started',
        createAccount: '[fr] Create A New Account',
        logIn: '[fr] Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '[fr] Navigate back to chats list',
        chatWelcomeMessage: '[fr] Chat welcome message',
        navigatesToChat: '[fr] Navigates to a chat',
        newMessageLineIndicator: '[fr] New message line indicator',
        chatMessage: '[fr] Chat message',
        lastChatMessagePreview: '[fr] Last chat message preview',
        workspaceName: '[fr] Workspace name',
        chatUserDisplayNames: '[fr] Chat member display names',
        scrollToNewestMessages: '[fr] Scroll to newest messages',
        preStyledText: '[fr] Pre-styled text',
        viewAttachment: '[fr] View attachment',
        contextMenuAvailable: '[fr] Context menu available. Press Shift+F10 to open.',
        contextMenuAvailableMacOS: '[fr] Context menu available. Press VO-Shift-M to open.',
        contextMenuAvailableNative: '[fr] Context menu available. Double-tap and hold to open.',
        selectAllFeatures: '[fr] Select all features',
        selectAllTransactions: '[fr] Select all transactions',
        selectAllItems: '[fr] Select all items',
    },
    parentReportAction: {
        deletedReport: '[fr] Deleted report',
        deletedMessage: '[fr] Deleted message',
        deletedExpense: '[fr] Deleted expense',
        reversedTransaction: '[fr] Reversed transaction',
        deletedTask: '[fr] Deleted task',
        hiddenMessage: '[fr] Hidden message',
    },
    threads: {
        thread: '[fr] Thread',
        replies: '[fr] Replies',
        reply: '[fr] Reply',
        from: '[fr] From',
        in: '[fr] in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `[fr] From ${reportName}${workspaceName ? `[fr]  in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: '[fr] QR code',
        copy: '[fr] Copy URL',
        copied: '[fr] Copied!',
    },
    moderation: {
        flagDescription: '[fr] All flagged messages will be sent to a moderator for review.',
        chooseAReason: '[fr] Choose a reason for flagging below:',
        spam: '[fr] Spam',
        spamDescription: '[fr] Unsolicited off-topic promotion',
        inconsiderate: '[fr] Inconsiderate',
        inconsiderateDescription: '[fr] Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: '[fr] Intimidation',
        intimidationDescription: '[fr] Aggressively pursuing an agenda over valid objections',
        bullying: '[fr] Bullying',
        bullyingDescription: '[fr] Targeting an individual to obtain obedience',
        harassment: '[fr] Harassment',
        harassmentDescription: '[fr] Racist, misogynistic, or other broadly discriminatory behavior',
        assault: '[fr] Assault',
        assaultDescription: '[fr] Specifically targeted emotional attack with the intention of harm',
        flaggedContent: '[fr] This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: '[fr] Hide message',
        revealMessage: '[fr] Reveal message',
        levelOneResult: '[fr] Sends anonymous warning and message is reported for review.',
        levelTwoResult: '[fr] Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: '[fr] Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '[fr] Invite to submit expenses',
        inviteToChat: '[fr] Invite to chat only',
        nothing: '[fr] Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '[fr] Accept',
        decline: '[fr] Decline',
    },
    actionableMentionTrackExpense: {
        submit: '[fr] Submit it to someone',
        categorize: '[fr] Categorize it',
        share: '[fr] Share it with my accountant',
        nothing: '[fr] Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: '[fr] Teachers Unite',
        joinExpensifyOrg:
            '[fr] Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: '[fr] I know a teacher',
        iAmATeacher: '[fr] I am a teacher',
        personalKarma: {
            title: '[fr] Enable Personal Karma',
            description: '[fr] Donate $1 to Expensify.org for every $500 you spend each month',
            stopDonationsPrompt: '[fr] Are you sure you want to stop donating to Expensify.org?',
        },
        getInTouch: '[fr] Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: '[fr] Intro to your school principal',
        schoolPrincipalVerifyExpense:
            '[fr] Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: '[fr] Principal first name',
        principalLastName: '[fr] Principal last name',
        principalWorkEmail: '[fr] Principal work email',
        updateYourEmail: '[fr] Update your email address',
        updateEmail: '[fr] Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `[fr] Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: '[fr] Enter a valid email or phone number',
            enterEmail: '[fr] Enter an email',
            enterValidEmail: '[fr] Enter a valid email',
            tryDifferentEmail: '[fr] Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: '[fr] Not activated',
        outOfPocket: '[fr] Reimbursable',
        companySpend: '[fr] Non-reimbursable',
        personalCard: '[fr] Personal card',
        companyCard: '[fr] Company card',
        expensifyCard: '[fr] Expensify Card',
        centralInvoicing: '[fr] Central invoicing',
    },
    distance: {
        addStop: '[fr] Add stop',
        address: '[fr] Address',
        waypointDescription: {
            start: '[fr] Start',
            stop: '[fr] Stop',
        },
        mapPending: {
            title: '[fr] Map pending',
            subtitle: '[fr] The map will be generated when you go back online',
            onlineSubtitle: '[fr] One moment while we set up the map',
            errorTitle: '[fr] Map error',
            errorSubtitle: '[fr] There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: '[fr] Please select a suggested address or use current location',
        },
        odometer: {
            startReading: '[fr] Start reading',
            endReading: '[fr] End reading',
            saveForLater: '[fr] Save for later',
            totalDistance: '[fr] Total distance',
            startTitle: '[fr] Odometer start photo',
            endTitle: '[fr] Odometer end photo',
            deleteOdometerPhoto: '[fr] Delete odometer photo',
            deleteOdometerPhotoConfirmation: '[fr] Are you sure you want to delete this odometer photo?',
            startMessageWeb: '[fr] Add a photo of your odometer from the <strong>start</strong> of your trip. Drag a file here or choose one to upload.',
            endMessageWeb: '[fr] Add a photo of your odometer from the <strong>end</strong> of your trip. Drag a file here or choose one to upload.',
            cameraAccessRequired: '[fr] Camera access is required to take pictures.',
            snapPhotoStart: '[fr] <muted-text-label>Snap a photo of your odometer at the <strong>start</strong> of your trip.</muted-text-label>',
            snapPhotoEnd: '[fr] <muted-text-label>Snap a photo of your odometer at the <strong>end</strong> of your trip.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '[fr] Failed to start location tracking.',
            failedToGetPermissions: '[fr] Failed to get required location permissions.',
        },
        trackingDistance: '[fr] Tracking distance...',
        stopped: '[fr] Stopped',
        start: '[fr] Start',
        stop: '[fr] Stop',
        discard: '[fr] Discard',
        stopGpsTrackingModal: {
            title: '[fr] Stop GPS tracking',
            prompt: '[fr] Are you sure? This will end your current journey.',
            cancel: '[fr] Resume tracking',
            confirm: '[fr] Stop GPS tracking',
        },
        discardDistanceTrackingModal: {
            title: '[fr] Discard distance tracking',
            prompt: "[fr] Are you sure? This will discard your current journey and can't be undone.",
            confirm: '[fr] Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "[fr] Can't create expense",
            prompt: "[fr] You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: '[fr] Location access required',
            prompt: '[fr] Please allow location access in your device settings to start GPS distance tracking.',
            allow: '[fr] Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: '[fr] Background location access required',
            prompt: '[fr] Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: '[fr] Precise location required',
            prompt: '[fr] Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: '[fr] Track distance on your phone',
            subtitle: '[fr] Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: '[fr] Download the app',
        },
        notification: {
            title: '[fr] GPS tracking in progress',
            body: '[fr] Go to the app to finish',
        },
        continueGpsTripModal: {
            title: '[fr] Continue GPS trip recording?',
            prompt: '[fr] Looks like the app closed during your last GPS trip. Would you like to continue recording from that trip?',
            confirm: '[fr] Continue trip',
            cancel: '[fr] View trip',
        },
        signOutWarningTripInProgress: {
            title: '[fr] GPS tracking in progress',
            prompt: '[fr] Are you sure you want to discard the trip and sign out?',
            confirm: '[fr] Discard and sign out',
        },
        switchToODWarningTripInProgress: {
            title: '[fr] GPS tracking in progress',
            prompt: '[fr] Are you sure you want to stop GPS tracking and switch to Expensify Classic?',
            confirm: '[fr] Stop and switch',
        },
        switchAccountWarningTripInProgress: {
            title: '[fr] GPS tracking in progress',
            prompt: '[fr] Are you sure you want to stop GPS tracking and switch accounts?',
            confirm: '[fr] Stop and switch',
        },
        locationServicesRequiredModal: {
            title: '[fr] Location access required',
            confirm: '[fr] Open settings',
            prompt: '[fr] Please allow location access in your device settings to start GPS distance tracking.',
        },
        gpsFloatingPillText: '[fr] GPS tracking in progress...',
        liveActivity: {
            subtitle: '[fr] Tracking distance',
            button: '[fr] View progress',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '[fr] Report card lost or damaged',
        nextButtonLabel: '[fr] Next',
        reasonTitle: '[fr] Why do you need a new card?',
        cardDamaged: '[fr] My card was damaged',
        cardLostOrStolen: '[fr] My card was lost or stolen',
        confirmAddressTitle: '[fr] Please confirm the mailing address for your new card.',
        cardDamagedInfo: '[fr] Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: '[fr] Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: '[fr] Address',
        deactivateCardButton: '[fr] Deactivate card',
        shipNewCardButton: '[fr] Ship new card',
        addressError: '[fr] Address is required',
        reasonError: '[fr] Reason is required',
        successTitle: '[fr] Your new card is on the way!',
        successDescription: "[fr] You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: '[fr] Guaranteed eReceipt',
        transactionDate: '[fr] Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: '[fr] Start a chat, <success><strong>refer a friend</strong></success>.',
            header: '[fr] Start a chat, refer a friend',
            closeAccessibilityLabel: '[fr] Close, start a chat, refer a friend, banner',
            body: "[fr] Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '[fr] Submit an expense, <success><strong>refer your team</strong></success>.',
            header: '[fr] Submit an expense, refer your team',
            closeAccessibilityLabel: '[fr] Close, submit an expense, refer your team, banner',
            body: "[fr] Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '[fr] Refer a friend',
            body: "[fr] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '[fr] Refer a friend',
            header: '[fr] Refer a friend',
            body: "[fr] Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: '[fr] Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `[fr] Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `[fr] Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: '[fr] All tags required',
        autoReportedRejectedExpense: '[fr] This expense was rejected.',
        billableExpense: '[fr] Billable no longer valid',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `[fr] Receipt required${formattedLimit ? `[fr]  over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '[fr] Category no longer valid',
        conversionSurcharge: (surcharge: number) => `[fr] Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: '[fr] Rate not valid for this workspace',
        duplicatedTransaction: '[fr] Potential duplicate',
        fieldRequired: '[fr] Report fields are required',
        futureDate: '[fr] Future date not allowed',
        invoiceMarkup: (invoiceMarkup: number) => `[fr] Marked up by ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `[fr] Date older than ${maxAge} days`,
        missingCategory: '[fr] Missing category',
        missingComment: '[fr] Description required for selected category',
        missingAttendees: '[fr] Multiple attendees required for this category',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `[fr] Missing ${tagName ?? '[fr] tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '[fr] Amount differs from calculated distance';
                case 'card':
                    return '[fr] Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `[fr] Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return '[fr] Amount greater than scanned receipt';
            }
        },
        modifiedDate: '[fr] Date differs from scanned receipt',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `[fr] Distance exceeds the calculated route of ${formattedRouteDistance}` : '[fr] Distance exceeds the calculated route',
        nonExpensiworksExpense: '[fr] Non-Expensiworks expense',
        overAutoApprovalLimit: (formattedLimit: string) => `[fr] Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `[fr] Amount over ${formattedLimit}/person category limit`,
        overLimit: (formattedLimit: string) => `[fr] Amount over ${formattedLimit}/person limit`,
        overTripLimit: (formattedLimit: string) => `[fr] Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: (formattedLimit: string) => `[fr] Amount over ${formattedLimit}/person limit`,
        perDayLimit: (formattedLimit: string) => `[fr] Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: '[fr] Receipt and expense details added manually.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `[fr] Receipt required over ${formattedLimit} category limit`;
            }
            if (formattedLimit) {
                return `[fr] Receipt required over ${formattedLimit}`;
            }
            if (category) {
                return `[fr] Receipt required over category limit`;
            }
            return '[fr] Receipt required';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `[fr] Itemized receipt required${formattedLimit ? `[fr]  over ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '[fr] Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `[fr] alcohol`;
                    case 'gambling':
                        return `[fr] gambling`;
                    case 'tobacco':
                        return `[fr] tobacco`;
                    case 'adultEntertainment':
                        return `[fr] adult entertainment`;
                    case 'hotelIncidentals':
                        return `[fr] hotel incidentals`;
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
        reviewRequired: '[fr] Review required',
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
                return "[fr] Can't auto-match receipt due to broken bank connection.";
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return "[fr] Can't auto-match receipt due to broken bank connection.";
                }
                return isMarkAsCash
                    ? `[fr] Can't auto-match receipt due to broken card connection. Mark as cash to ignore, or <a href="${connectionLink}">fix the card</a> to match the receipt.`
                    : `[fr] Can't auto-match receipt due to broken card connection. <a href="${connectionLink}">Fix the card</a> to match the receipt.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `[fr] Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : '[fr] Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `[fr] Ask ${member} to mark as a cash or wait 7 days and try again` : '[fr] Awaiting merge with card transaction.';
            }
            return '';
        },
        brokenConnection530Error: '[fr] Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `[fr] <muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: '[fr] Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: '[fr] Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true}) => `[fr] Receipt scanning failed.${canEdit ? '[fr]  Enter details manually.' : ''}`,
        receiptGeneratedWithAI: '[fr] Potential AI-generated receipt',
        someTagLevelsRequired: (tagName?: string) => `[fr] Missing ${tagName ?? '[fr] Tag'}`,
        tagOutOfPolicy: (tagName?: string) => `[fr] ${tagName ?? '[fr] Tag'} no longer valid`,
        taxAmountChanged: '[fr] Tax amount was modified',
        taxOutOfPolicy: (taxName?: string) => `[fr] ${taxName ?? '[fr] Tax'} no longer valid`,
        taxRateChanged: '[fr] Tax rate was modified',
        taxRequired: '[fr] Missing tax rate',
        none: '[fr] None',
        taxCodeToKeep: '[fr] Choose which tax code to keep',
        tagToKeep: '[fr] Choose which tag to keep',
        isTransactionReimbursable: '[fr] Choose if transaction is reimbursable',
        merchantToKeep: '[fr] Choose which merchant to keep',
        descriptionToKeep: '[fr] Choose which description to keep',
        categoryToKeep: '[fr] Choose which category to keep',
        isTransactionBillable: '[fr] Choose if transaction is billable',
        keepThisOne: '[fr] Keep this one',
        confirmDetails: `[fr] Confirm the details you're keeping`,
        confirmDuplicatesInfo: `[fr] The duplicates you don't keep will be held for the submitter to delete.`,
        hold: '[fr] This expense was put on hold',
        resolvedDuplicates: '[fr] resolved the duplicate',
        companyCardRequired: '[fr] Company card purchases required',
        noRoute: '[fr] Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `[fr] ${fieldName} is required`,
        reportContainsExpensesWithViolations: '[fr] Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: '[fr] marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: '[fr] resolved the duplicate',
        },
    },
    videoPlayer: {
        play: '[fr] Play',
        pause: '[fr] Pause',
        fullscreen: '[fr] Fullscreen',
        playbackSpeed: '[fr] Playback speed',
        expand: '[fr] Expand',
        mute: '[fr] Mute',
        unmute: '[fr] Unmute',
        normal: '[fr] Normal',
    },
    exitSurvey: {
        header: '[fr] Before you go',
        reasonPage: {
            title: "[fr] Please tell us why you're leaving",
            subtitle: '[fr] Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[fr] I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "[fr] I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[fr] I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "[fr] What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '[fr] What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '[fr] Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: '[fr] Your response',
        thankYou: '[fr] Thanks for the feedback!',
        thankYouSubtitle: '[fr] Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: '[fr] Switch to Expensify Classic',
        offlineTitle: "[fr] Looks like you're stuck here...",
        offline:
            "[fr] You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: '[fr] Quick tip...',
        quickTipSubTitle: '[fr] You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: '[fr] Book a call',
        bookACallTitle: '[fr] Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '[fr] Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '[fr] Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '[fr] Travel and expense at the speed of chat',
        },
        bookACallTextTop: '[fr] By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: '[fr] We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: '[fr] Take me to Expensify Classic',
    },
    listBoundary: {
        errorMessage: '[fr] An error occurred while loading more messages',
        tryAgain: '[fr] Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: '[fr] matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: '[fr] Authenticate payment card',
        mobileReducedFunctionalityMessage: '[fr] You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `[fr] Free trial: ${numOfDays} ${numOfDays === 1 ? '[fr] day' : '[fr] days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '[fr] Your payment info is outdated',
                subtitle: (date: string) => `[fr] Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '[fr] Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `[fr] Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : '[fr] Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: '[fr] Your payment info is outdated',
                subtitle: (date: string) => `[fr] Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '[fr] Your payment info is outdated',
                subtitle: '[fr] Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: '[fr] Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `[fr] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: '[fr] Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `[fr] Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: '[fr] Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `[fr] Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: '[fr] Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `[fr] Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: '[fr] Your card is expiring soon',
                subtitle: '[fr] Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: '[fr] Success!',
                subtitle: '[fr] Your card has been billed successfully.',
            },
            retryBillingError: {
                title: '[fr] Your card couldn’t be charged',
                subtitle: '[fr] Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `[fr] You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '[fr] Start a free trial',
                subtitle: '[fr] As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: (numOfDays: number) => `[fr] Trial: ${numOfDays} ${numOfDays === 1 ? '[fr] day' : '[fr] days'} left!`,
                subtitle: '[fr] Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: '[fr] Your free trial has ended',
                subtitle: '[fr] Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: '[fr] Claim offer',
                subscriptionPageTitle: (discountType: number) => `[fr] <strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `[fr] Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `[fr] Claim within ${days > 0 ? `[fr] ${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '[fr] Payment',
            subtitle: '[fr] Add a card to pay for your Expensify subscription.',
            addCardButton: '[fr] Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `[fr] Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `[fr] Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `[fr] Card ending in ${cardNumber}`,
            changeCard: '[fr] Change payment card',
            changeCurrency: '[fr] Change payment currency',
            cardNotFound: '[fr] No payment card added',
            retryPaymentButton: '[fr] Retry payment',
            authenticatePayment: '[fr] Authenticate payment',
            requestRefund: '[fr] Request refund',
            requestRefundModal: {
                full: '[fr] Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: '[fr] Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: '[fr] View payment history',
        },
        yourPlan: {
            title: '[fr] Your plan',
            exploreAllPlans: '[fr] Explore all plans',
            customPricing: '[fr] Custom pricing',
            asLowAs: (price: string) => `[fr] as low as ${price} per active member/month`,
            pricePerMemberMonth: (price: string) => `[fr] ${price} per member/month`,
            pricePerMemberPerMonth: (price: string) => `[fr] ${price} per member per month`,
            perMemberMonth: '[fr] per member/month',
            collect: {
                title: '[fr] Collect',
                description: '[fr] The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[fr] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[fr] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[fr] Receipt scanning',
                benefit2: '[fr] Reimbursements',
                benefit3: '[fr] Corporate card management',
                benefit4: '[fr] Expense and travel approvals',
                benefit5: '[fr] Travel booking and rules',
                benefit6: '[fr] QuickBooks/Xero integrations',
                benefit7: '[fr] Chat on expenses, reports, and rooms',
                benefit8: '[fr] AI and human support',
            },
            control: {
                title: '[fr] Control',
                description: '[fr] Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `[fr] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `[fr] From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: '[fr] Everything in the Collect plan',
                benefit2: '[fr] Multi-level approval workflows',
                benefit3: '[fr] Custom expense rules',
                benefit4: '[fr] ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: '[fr] HR integrations (Workday, Certinia)',
                benefit6: '[fr] SAML/SSO',
                benefit7: '[fr] Custom insights and reporting',
                benefit8: '[fr] Budgeting',
            },
            thisIsYourCurrentPlan: '[fr] This is your current plan',
            downgrade: '[fr] Downgrade to Collect',
            upgrade: '[fr] Upgrade to Control',
            addMembers: '[fr] Add members',
            saveWithExpensifyTitle: '[fr] Save with the Expensify Card',
            saveWithExpensifyDescription: '[fr] Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: '[fr] Learn more',
        },
        compareModal: {
            comparePlans: '[fr] Compare Plans',
            subtitle: `[fr] <muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: '[fr] Subscription details',
            annual: '[fr] Annual subscription',
            taxExempt: '[fr] Request tax exempt status',
            taxExemptEnabled: '[fr] Tax exempt',
            taxExemptStatus: '[fr] Tax exempt status',
            payPerUse: '[fr] Pay-per-use',
            subscriptionSize: '[fr] Subscription size',
            headsUp:
                "[fr] Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: '[fr] Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: '[fr] Subscription size',
            yourSize: '[fr] Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                '[fr] Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: '[fr] Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: '[fr] Confirm your new annual subscription details:',
            subscriptionSize: '[fr] Subscription size',
            activeMembers: (size: number) => `[fr] ${size} active members/month`,
            subscriptionRenews: '[fr] Subscription renews',
            youCantDowngrade: '[fr] You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: (size: number, date: string) =>
                `[fr] You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: '[fr] Please enter a valid subscription size',
                sameSize: '[fr] Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: '[fr] Add payment card',
            enterPaymentCardDetails: '[fr] Enter your payment card details',
            security: '[fr] Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: '[fr] Learn more about our security.',
        },
        expensifyCode: {
            title: '[fr] Expensify code',
            discountCode: '[fr] Discount code',
            enterCode: '[fr] Enter an Expensify code to apply to your subscription.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `[fr] You will get a ${promoDiscount}% discount on your next ${validBillingCycles ? `${validBillingCycles} ` : ''}billing charges.`,
            apply: '[fr] Apply',
            error: {
                invalid: '[fr] This code is invalid',
            },
        },
        subscriptionSettings: {
            title: '[fr] Subscription settings',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `[fr] Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}${expensifyCode ? `[fr] , Expensify code: ${expensifyCode}` : ''}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: '[fr] none',
            on: '[fr] on',
            off: '[fr] off',
            annual: '[fr] Annual',
            autoRenew: '[fr] Auto-renew',
            autoIncrease: '[fr] Auto-increase annual seats',
            saveUpTo: (amountWithCurrency: string) => `[fr] Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                '[fr] Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: '[fr] Disable auto-renew',
            helpUsImprove: '[fr] Help us improve Expensify',
            whatsMainReason: "[fr] What's the main reason you're disabling auto-renew?",
            renewsOn: (date: string) => `[fr] Renews on ${date}.`,
            pricingConfiguration: '[fr] Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: (hasAdminsRoom: boolean) =>
                `[fr] <muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `[fr] <a href="adminsRoom">#admins room.</a>` : '[fr] #admins room.'}</muted-text>`,
            estimatedPrice: '[fr] Estimated price',
            changesBasedOn: '[fr] This changes based on your Expensify Card usage and the subscription options below.',
            collectBillingDescription: '[fr] Collect workspaces are billed monthly per member, with no annual commitment.',
            pricing: '[fr] Pricing',
        },
        requestEarlyCancellation: {
            title: '[fr] Request early cancellation',
            subtitle: '[fr] What’s the main reason you’re requesting early cancellation?',
            subscriptionCanceled: {
                title: '[fr] Subscription canceled',
                subtitle: '[fr] Your annual subscription has been canceled.',
                info: '[fr] If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `[fr] If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: '[fr] Request submitted',
                subtitle:
                    '[fr] Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `[fr] By requesting early cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: '[fr] Functionality needs improvement',
        tooExpensive: '[fr] Too expensive',
        inadequateSupport: '[fr] Inadequate customer support',
        businessClosing: '[fr] Company closing, downsizing, or acquired',
        additionalInfoTitle: '[fr] What software are you moving to and why?',
        additionalInfoInputLabel: '[fr] Your response',
    },
    roomChangeLog: {
        updateRoomDescription: '[fr] set the room description to:',
        clearRoomDescription: '[fr] cleared the room description',
        changedRoomAvatar: '[fr] changed the room avatar',
        removedRoomAvatar: '[fr] removed the room avatar',
    },
    delegate: {
        switchAccount: '[fr] Switch accounts:',
        copilotDelegatedAccess: '[fr] Copilot: Delegated access',
        copilotDelegatedAccessDescription: '[fr] Allow other members to access your account.',
        learnMoreAboutDelegatedAccess: '[fr] Learn more about delegated access',
        addCopilot: '[fr] Add copilot',
        membersCanAccessYourAccount: '[fr] These members can access your account:',
        youCanAccessTheseAccounts: '[fr] You can access these accounts via the account switcher:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[fr] Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[fr] Limited';
                default:
                    return '';
            }
        },
        genericError: '[fr] Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `[fr] on behalf of ${delegator}`,
        accessLevel: '[fr] Access level',
        confirmCopilot: '[fr] Confirm your copilot below.',
        accessLevelDescription: '[fr] Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '[fr] Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '[fr] Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: '[fr] Remove copilot',
        removeCopilotConfirmation: '[fr] Are you sure you want to remove this copilot?',
        changeAccessLevel: '[fr] Change access level',
        makeSureItIsYou: "[fr] Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `[fr] Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `[fr] Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '[fr] Not so fast...',
        noAccessMessage: dedent(`
            [fr] As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `[fr] As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: '[fr] Copilot access',
    },
    debug: {
        debug: '[fr] Debug',
        details: '[fr] Details',
        JSON: '[fr] JSON',
        reportActions: '[fr] Actions',
        reportActionPreview: '[fr] Preview',
        nothingToPreview: '[fr] Nothing to preview',
        editJson: '[fr] Edit JSON:',
        preview: '[fr] Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `[fr] Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `[fr] Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `[fr] Invalid value - Expected: ${expectedValues}`,
        missingValue: '[fr] Missing value',
        createReportAction: '[fr] Create Report Action',
        reportAction: '[fr] Report Action',
        report: '[fr] Report',
        transaction: '[fr] Transaction',
        violations: '[fr] Violations',
        transactionViolation: '[fr] Transaction Violation',
        hint: "[fr] Data changes won't be sent to the backend",
        textFields: '[fr] Text fields',
        numberFields: '[fr] Number fields',
        booleanFields: '[fr] Boolean fields',
        constantFields: '[fr] Constant fields',
        dateTimeFields: '[fr] DateTime fields',
        date: '[fr] Date',
        time: '[fr] Time',
        none: '[fr] None',
        visibleInLHN: '[fr] Visible in LHN',
        GBR: '[fr] GBR',
        RBR: '[fr] RBR',
        true: '[fr] true',
        false: '[fr] false',
        viewReport: '[fr] View Report',
        viewTransaction: '[fr] View transaction',
        createTransactionViolation: '[fr] Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: '[fr] Has draft comment',
            hasGBR: '[fr] Has GBR',
            hasRBR: '[fr] Has RBR',
            pinnedByUser: '[fr] Pinned by member',
            hasIOUViolations: '[fr] Has IOU violations',
            hasAddWorkspaceRoomErrors: '[fr] Has add workspace room errors',
            isUnread: '[fr] Is unread (focus mode)',
            isArchived: '[fr] Is archived (most recent mode)',
            isSelfDM: '[fr] Is self DM',
            isFocused: '[fr] Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: '[fr] Has join request (admin room)',
            isUnreadWithMention: '[fr] Is unread with mention',
            isWaitingForAssigneeToCompleteAction: '[fr] Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: '[fr] Has child report awaiting action',
            hasMissingInvoiceBankAccount: '[fr] Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: '[fr] Has unresolved card fraud alert',
            hasDEWApproveFailed: '[fr] Has DEW approve failed',
        },
        reasonRBR: {
            hasErrors: '[fr] Has errors in report or report actions data',
            hasViolations: '[fr] Has violations',
            hasTransactionThreadViolations: '[fr] Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "[fr] There's a report awaiting action",
            theresAReportWithErrors: "[fr] There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "[fr] There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "[fr] There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: '[fr] There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "[fr] There's a problem with a contact method",
            aContactMethodRequiresVerification: '[fr] A contact method requires verification',
            theresAProblemWithAPaymentMethod: "[fr] There's a problem with a payment method",
            theresAProblemWithAWorkspace: "[fr] There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "[fr] There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "[fr] There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: '[fr] Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: '[fr] There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "[fr] There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "[fr] There's a problem with your wallet terms",
            aBankAccountIsLocked: '[fr] A bank account is locked',
        },
    },
    emptySearchView: {
        takeATestDrive: '[fr] Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: '[fr] Welcome to New Expensify!',
        subtitle: "[fr] It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "[fr] Let's go!",
        helpText: '[fr] Try 2-min demo',
        features: {
            search: '[fr] More powerful search on mobile, web, and desktop',
            concierge: '[fr] Built-in Concierge AI to help automate your expenses',
            chat: '[fr] Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '[fr] <tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '[fr] <tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '[fr] <tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        scanTestTooltip: {
            main: '[fr] <tooltip><strong>Scan our test receipt</strong> to see how it works!</tooltip>',
            manager: '[fr] <tooltip>Choose our <strong>test manager</strong> to try it out!</tooltip>',
            confirmation: '[fr] <tooltip>Now, <strong>submit your expense</strong> and watch the\nmagic happen!</tooltip>',
            tryItOut: '[fr] Try it out',
        },
        outstandingFilter: '[fr] <tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '[fr] <tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "[fr] <tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
        hasFilterNegation: '[fr] <tooltip>Search for expenses without receipts using <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: '[fr] Discard changes?',
        body: '[fr] Are you sure you want to discard the changes you made?',
        confirmText: '[fr] Discard changes',
    },
    scheduledCall: {
        book: {
            title: '[fr] Schedule call',
            description: '[fr] Find a time that works for you.',
            slots: ({date}: {date: string}) => `[fr] <muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '[fr] Confirm call',
            description: "[fr] Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: '[fr] Your setup specialist',
            meetingLength: '[fr] Meeting length',
            dateTime: '[fr] Date & time',
            minutes: '[fr] 30 minutes',
        },
        callScheduled: '[fr] Call scheduled',
    },
    autoSubmitModal: {
        title: '[fr] All clear and submitted!',
        description: '[fr] All warnings and violations has been cleared so:',
        submittedExpensesTitle: '[fr] These expenses have been submitted',
        submittedExpensesDescription: '[fr] These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: '[fr] Pending expenses have been moved',
        pendingExpensesDescription: '[fr] Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '[fr] Take a 2-minute test drive',
        },
        modal: {
            title: '[fr] Take us for a test drive',
            description: '[fr] Take a quick product tour to get up to speed fast.',
            confirmText: '[fr] Start test drive',
            helpText: '[fr] Skip',
            employee: {
                description: '[fr] <muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "[fr] Enter your boss's email",
                error: '[fr] That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "[fr] You're currently test driving Expensify",
            readyForTheRealThing: '[fr] Ready for the real thing?',
            getStarted: '[fr] Get started',
        },
        employeeInviteMessage: (name: string) => `[fr] # ${name} invited you to test drive Expensify
Hey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.

Here’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: '[fr] Basic export',
        reportLevelExport: '[fr] All Data - report level',
        expenseLevelExport: '[fr] All Data - expense level',
        exportInProgress: '[fr] Export in progress',
        conciergeWillSend: '[fr] Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: '[fr] Not verified',
        retry: '[fr] Retry',
        verifyDomain: {
            title: '[fr] Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `[fr] Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `[fr] Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: '[fr] Add the following TXT record:',
            saveChanges: '[fr] Save changes and return here to verify your domain.',
            youMayNeedToConsult: `[fr] You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: '[fr] After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: '[fr] Couldn’t fetch verification code',
            genericError: "[fr] We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: '[fr] Domain verified',
            header: '[fr] Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `[fr] <muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: '[fr] SAML',
        samlFeatureList: {
            title: '[fr] SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `[fr] <muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: '[fr] Faster and easier login',
            moreSecurityAndControl: '[fr] More security and control',
            onePasswordForAnything: '[fr] One password for everything',
        },
        goToDomain: '[fr] Go to domain',
        samlLogin: {
            title: '[fr] SAML login',
            subtitle: `[fr] <muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a>.</muted-text>`,
            enableSamlLogin: '[fr] Enable SAML login',
            allowMembers: '[fr] Allow members to log in with SAML.',
            requireSamlLogin: '[fr] Require SAML login',
            anyMemberWillBeRequired: '[fr] Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "[fr] Couldn't update SAML enablement setting",
            requireError: "[fr] Couldn't update SAML requirement setting",
            disableSamlRequired: '[fr] Disable SAML required',
            oktaWarningPrompt: '[fr] Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: '[fr] Please add Identity Provider metadata below to enable',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `[fr] <muted-text>Please disable <a href="${twoFactorAuthSettingsUrl}">force two-factor authentication</a> to enable SAML login.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: '[fr] SAML configuration details',
            subtitle: '[fr] Use these details to get SAML set up.',
            identityProviderMetadata: '[fr] Identity Provider Metadata',
            entityID: '[fr] Entity ID',
            nameIDFormat: '[fr] Name ID Format',
            loginUrl: '[fr] Login URL',
            acsUrl: '[fr] ACS (Assertion Consumer Service) URL',
            logoutUrl: '[fr] Logout URL',
            sloUrl: '[fr] SLO (Single Logout) URL',
            serviceProviderMetaData: '[fr] Service Provider MetaData',
            oktaScimToken: '[fr] Okta SCIM Token',
            revealToken: '[fr] Reveal token',
            fetchError: "[fr] Couldn't fetch SAML configuration details",
            setMetadataGenericError: "[fr] Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: '[fr] Access restricted',
            subtitle: (domainName: string) => `[fr] Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: '[fr] Company card management',
            accountCreationAndDeletion: '[fr] Account creation and deletion',
            workspaceCreation: '[fr] Workspace creation',
            samlSSO: '[fr] SAML SSO',
        },
        addDomain: {
            title: '[fr] Add domain',
            subtitle: '[fr] Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: '[fr] Domain name',
            newDomain: '[fr] New domain',
        },
        domainAdded: {
            title: '[fr] Domain added',
            description: "[fr] Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: '[fr] Configure',
        },
        enhancedSecurity: {
            title: '[fr] Enhanced security',
            subtitle: '[fr] Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: '[fr] Enable',
        },
        domainAdmins: '[fr] Domain admins',
        admins: {
            title: '[fr] Admins',
            findAdmin: '[fr] Find admin',
            primaryContact: '[fr] Primary contact',
            addPrimaryContact: '[fr] Add primary contact',
            setPrimaryContactError: '[fr] Unable to set primary contact. Please try again later.',
            consolidatedDomainBilling: '[fr] Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `[fr] <comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "[fr] Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: '[fr] Add admin',
            addAdminError: '[fr] Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: '[fr] Revoke admin access',
            cantRevokeAdminAccess: "[fr] Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: '[fr] Unable to remove this user as an Admin. Please try again.',
                removeDomain: '[fr] Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: '[fr] Please enter your domain name to reset it.',
            },
            resetDomain: '[fr] Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `[fr] Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: '[fr] Enter your domain name here',
            resetDomainInfo: `[fr] This action is <strong>permanent</strong> and the following data will be deleted: <br/> <bullet-list><bullet-item>Company card connections and any unreported expenses from those cards</bullet-item><bullet-item>SAML and group settings</bullet-item></bullet-list> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        domainMembers: '[fr] Domain members',
        members: {
            title: '[fr] Members',
            findMember: '[fr] Find member',
            addMember: '[fr] Add member',
            emptyMembers: {
                title: '[fr] No members in this group',
                subtitle: '[fr] Add a member or try changing the filter above.',
            },
            allMembers: '[fr] All members',
            email: '[fr] Email address',
            closeAccountPrompt: '[fr] Are you sure? This action is permanent.',
            forceCloseAccount: () => ({
                one: '[fr] Force close account',
                other: '[fr] Force close accounts',
            }),
            safeCloseAccount: () => ({
                one: '[fr] Close account safely',
                other: '[fr] Close accounts safely',
            }),
            closeAccountInfo: () => ({
                one: '[fr] We recommend closing the account safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected account.',
                other: '[fr] We recommend closing the accounts safely to skip closing it in case there are: <bullet-list><bullet-item>Pending approvals</bullet-item><bullet-item>Active reimbursements</bullet-item><bullet-item>No alternative login methods</bullet-item></bullet-list>Otherwise, you can ignore the safety precautions above and force close the selected accounts.',
            }),
            closeAccount: () => ({
                one: '[fr] Close account',
                other: '[fr] Close accounts',
            }),
            error: {
                addMember: '[fr] Unable to add this member. Please try again.',
                removeMember: '[fr] Unable to remove this user. Please try again.',
                vacationDelegate: '[fr] Unable to set this user as a vacation delegate. Please try again.',
            },
            cannotSetVacationDelegateForMember: (email: string) => `[fr] You can't set a vacation delegate for ${email} because they're currently the delegate for the following members:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `[fr] Are you sure? This will lock <strong>${email}'s</strong> account. <br /><br /> Our team will then review the account and remove any unauthorized access. To regain access, they'll need to work with Concierge.`,
            reportSuspiciousActivityConfirmationPrompt: '[fr] We’ll review the account to verify it’s safe to unlock and reach out via Concierge with any questions.',
        },
        common: {
            settings: '[fr] Settings',
            forceTwoFactorAuth: '[fr] Force two-factor authentication',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `[fr] <muted-text>Please disable <a href="${samlPageUrl}">SAML</a> to force two-factor authentication.</muted-text>`,
            forceTwoFactorAuthDescription: `[fr] <muted-text>Require two-factor authentication for all members of this domain. Domain members will be prompted to set up two-factor authentication on their account when they sign in.</muted-text>`,
            forceTwoFactorAuthError: "[fr] Force two-factor authentication couldn't be changed. Please try again later.",
            resetTwoFactorAuth: '[fr] Reset two-factor authentication',
        },
        groups: {
            title: '[fr] Groups',
            memberCount: () => {
                return {
                    one: '[fr] 1 member',
                    other: (count: number) => `[fr] ${count} members`,
                };
            },
        },
    },
};
export default translations;
