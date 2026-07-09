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
import type {OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type {OriginalMessageSettlementAccountLocked, PersonalRulesModifiedFields, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';

import type {ValueOf} from 'type-fest';

import {CONST as COMMON_CONST, Str} from 'expensify-common';
import startCase from 'lodash/startCase';

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
    RemoveCopilotAccessConfirmationParams,
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
        count: 'Πλήθος',
        cancel: 'Άκυρο',
        unableToDisplayChart: 'Δεν είναι δυνατή η εμφάνιση του γραφήματος',
        webGLNotSupported: 'Το πρόγραμμα περιήγησής σας δεν υποστηρίζει WebGL. Παρακαλούμε ενεργοποιήστε το ή αλλάξτε πρόγραμμα περιήγησης.',
        dismiss: 'Κλείσιμο',
        proceed: 'Συνέχεια',
        unshare: 'Αναίρεση κοινής χρήσης',
        yes: 'Ναι',
        no: 'Όχι',
        ok: 'OK',
        notNow: 'Όχι τώρα',
        noThanks: 'Όχι, ευχαριστώ',
        learnMore: 'Μάθετε περισσότερα',
        buttonConfirm: 'Εντάξει',
        name: 'Όνομα',
        attachment: 'Συνημμένο',
        attachments: 'Συνημμένα',
        center: 'Κέντρο',
        resetMapToNorth: 'Επαναφορά χάρτη προς βορρά',
        from: 'Από',
        to: 'Προς',
        in: 'Σε',
        optional: 'Προαιρετικό',
        new: 'Νέο',
        newFeature: 'Νέα δυνατότητα',
        beta: 'Beta',
        search: 'Αναζήτηση',
        reports: 'Αναφορές',
        spend: 'Δαπάνη',
        find: 'Εύρεση',
        searchWithThreeDots: 'Αναζήτηση...',
        next: 'Επόμενο',
        previous: 'Προηγούμενο',
        previousMonth: 'Προηγούμενος μήνας',
        nextMonth: 'Τον επόμενο μήνα',
        previousYear: 'Προηγούμενο έτος',
        nextYear: 'Επόμενο έτος',
        goBack: 'Πίσω',
        create: 'Δημιουργία',
        add: 'Προσθήκη',
        resend: 'Επαναποστολή',
        save: 'Αποθήκευση',
        select: 'Επιλέξτε',
        deselect: 'Αποεπιλογή',
        selectMultiple: 'Πολλαπλή επιλογή',
        saveChanges: 'Αποθήκευση αλλαγών',
        submit: 'Υποβολή',
        markAsDone: 'Σήμανση ως ολοκληρωμένο',
        submitted: 'Υποβλήθηκε',
        markedAsDoneStatus: 'Έχει σημανθεί ως ολοκληρωμένο',
        rotate: 'Περιστροφή',
        zoom: 'Ζουμ',
        password: 'Κωδικός πρόσβασης',
        magicCode: 'Μαγικός κωδικός',
        digits: 'ψηφία',
        twoFactorCode: 'Κωδικός δύο παραγόντων',
        workspaces: 'Χώροι εργασίας',
        home: 'Αρχική',
        inbox: 'Εισερχόμενα',
        yourReviewIsRequired: 'Απαιτείται η αξιολόγησή σας',
        actionBadge: {
            submit: 'Υποβολή',
            approve: 'Έγκριση',
            pay: 'Πληρωμή',
            fix: 'Διόρθωση',
            task: 'Εργασία',
        },
        success: 'Επιτυχία',
        group: 'Ομάδα',
        profile: 'Προφίλ',
        referral: 'Παραπομπή',
        payments: 'Πληρωμές',
        approvals: 'Εγκρίσεις',
        wallet: 'Πορτοφόλι',
        preferences: 'Προτιμήσεις',
        view: 'Προβολή',
        review: (amount?: string) => `Εξέταση${amount ? ` ${amount}` : ''}`,
        not: 'Όχι',
        signIn: 'Συνδεθείτε',
        signInWithGoogle: 'Συνδεθείτε με Google',
        signInWithApple: 'Συνδεθείτε με Apple',
        signInWith: 'Συνδεθείτε με',
        continue: 'Συνέχεια',
        firstName: 'Όνομα',
        lastName: 'Επώνυμο',
        scanning: 'Σάρωση',
        analyzing: 'Γίνεται ανάλυση...',
        thinking: 'Το Concierge σκέφτεται...',
        agentThinking: 'Γίνεται επεξεργασία…',
        addCardTermsOfService: 'Όροι χρήσης Expensify',
        perPerson: 'ανά άτομο',
        phone: 'Τηλέφωνο',
        phoneNumber: 'Αριθμός τηλεφώνου',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'και',
        or: 'ή',
        details: 'Λεπτομέρειες',
        privacy: 'Απόρρητο',
        privacyPolicy: 'Πολιτική απορρήτου',
        hidden: 'Κρυφό',
        visible: 'Ορατό',
        delete: 'Διαγραφή',
        archived: 'αρχειοθετημένο',
        contacts: 'Επαφές',
        recents: 'Πρόσφατα',
        close: 'Κλείσιμο',
        comment: 'Σχόλιο',
        download: 'Λήψη',
        downloading: 'Γίνεται λήψη',
        uploading: 'Γίνεται μεταφόρτωση',
        pin: 'Καρφιτσώστε',
        unPin: 'Ξακαρφίτσωμα',
        back: 'Πίσω',
        saveAndContinue: 'Αποθήκευση και συνέχεια',
        settings: 'Ρυθμίσεις',
        termsOfService: 'Όροι χρήσης',
        members: 'Μέλη',
        invite: 'Πρόσκληση',
        here: 'εδώ',
        avatar: 'Άβαταρ',
        date: 'Ημερομηνία',
        dob: 'Ημερομηνία γέννησης',
        currentYear: 'Τρέχον έτος',
        currentMonth: 'Τρέχων μήνας',
        ssnLast4: 'Τελευταία 4 ψηφία του SSN',
        ssnFull9: 'Ολόκληροι οι 9 αριθμοί του SSN',
        addressLine: (lineNumber: number) => `Γραμμή διεύθυνσης ${lineNumber}`,
        personalAddress: 'Προσωπική διεύθυνση',
        companyAddress: 'Διεύθυνση εταιρείας',
        noPO: 'Παρακαλούμε, όχι ταχυδρομικές θυρίδες ή διευθύνσεις παραλαβής αλληλογραφίας.',
        city: 'Πόλη',
        state: 'Πολιτεία',
        streetAddress: 'Οδός και αριθμός',
        stateOrProvince: 'Πολιτεία / Επαρχία',
        country: 'Χώρα',
        zip: 'Ταχυδρομικός κώδικας',
        zipPostCode: 'Τ.Κ. / Ταχυδρομικός κώδικας',
        whatThis: 'Τι είναι αυτό;',
        iAcceptThe: 'Αποδέχομαι τους',
        acceptTermsAndPrivacy: `Αποδέχομαι τους <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Όρους Παροχής Υπηρεσιών της Expensify</a> και την <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Πολιτική Απορρήτου</a>`,
        acceptTermsAndConditions: `Αποδέχομαι τους <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">όρους και τις προϋποθέσεις</a>`,
        acceptTermsOfService: `Αποδέχομαι τους <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Όρους Παροχής Υπηρεσιών της Expensify</a>`,
        downloadFailedEmptyReportDescription: () => ({
            one: 'Δεν μπορείτε να εξαγάγετε μια κενή αναφορά.',
            other: () => `Δεν μπορείτε να εξαγάγετε κενές αναφορές.`,
        }),
        remove: 'Κατάργηση',
        admin: 'Διαχείριση',
        editor: 'Επεξεργαστής',
        owner: 'Ιδιοκτήτης',
        dateFormat: 'YYYY-MM-DD',
        calendarOpened: 'άνοιξε το ημερολόγιο',
        send: 'Αποστολή',
        na: 'Μ/Δ',
        noResultsFound: 'Δεν βρέθηκαν αποτελέσματα',
        noResultsFoundMatching: (searchString: string) => `Δεν βρέθηκαν αποτελέσματα που να ταιριάζουν με το «${searchString}»`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `Υπάρχουν διαθέσιμες προτάσεις για «${searchString}».` : 'Διαθέσιμες προτάσεις.'),
        recentDestinations: 'Πρόσφατοι προορισμοί',
        timePrefix: 'Είναι',
        conjunctionFor: 'για',
        todayAt: 'Σήμερα στις',
        tomorrowAt: 'Αύριο στις',
        yesterdayAt: 'Χθες στις',
        conjunctionAt: 'στις',
        conjunctionTo: 'σε',
        genericErrorMessage: 'Ουπς... κάτι πήγε στραβά και το αίτημά σας δεν μπόρεσε να ολοκληρωθεί. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        percentage: 'Ποσοστό',
        progressBarLabel: 'Πρόοδος αρχικής ρύθμισης',
        converted: 'Μετατράπηκε',
        off: 'Ανενεργό',
        error: {
            invalidAmount: 'Μη έγκυρο ποσό',
            acceptTerms: 'Πρέπει να αποδεχθείτε τους Όρους Παροχής Υπηρεσιών για να συνεχίσετε',
            phoneNumber: `Παρακαλούμε εισαγάγετε έναν πλήρη αριθμό τηλεφώνου
(π.χ. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Αυτό το πεδίο είναι υποχρεωτικό',
            requestModified: 'Αυτό το αίτημα τροποποιείται από άλλο μέλος',
            characterLimitExceedCounter: (length: number, limit: number) => `Υπέρβαση ορίου χαρακτήρων (${length}/${limit})`,
            dateInvalid: 'Παρακαλώ επιλέξτε έγκυρη ημερομηνία',
            invalidDateShouldBeFuture: 'Παρακαλούμε επιλέξτε τη σημερινή ή κάποια μελλοντική ημερομηνία',
            invalidTimeShouldBeFuture: 'Παρακαλούμε επιλέξτε μια ώρα τουλάχιστον ένα λεπτό αργότερα',
            invalidCharacter: 'Μη έγκυρος χαρακτήρας',
            enterMerchant: 'Εισαγάγετε όνομα εμπόρου',
            enterAmount: 'Εισαγάγετε ποσό',
            missingMerchantName: 'Λείπει το όνομα εμπόρου',
            missingAmount: 'Λείπει ποσό',
            missingDate: 'Λείπει η ημερομηνία',
            enterDate: 'Εισαγάγετε ημερομηνία',
            invalidTimeRange: 'Παρακαλώ εισαγάγετε μια ώρα χρησιμοποιώντας τη μορφή 12ώρου (π.χ. 2:30 ΜΜ)',
            pleaseCompleteForm: 'Συμπληρώστε τη φόρμα παραπάνω για να συνεχίσετε',
            pleaseSelectOne: 'Παρακαλώ επιλέξτε μια από τις παραπάνω επιλογές',
            invalidRateError: 'Παρακαλούμε εισαγάγετε έγκυρο συντελεστή',
            lowRateError: 'Το ποσοστό πρέπει να είναι μεγαλύτερο από 0',
            email: 'Παρακαλούμε εισαγάγετε μια έγκυρη διεύθυνση email',
            login: 'Προέκυψε σφάλμα κατά τη σύνδεση. Παρακαλούμε δοκιμάστε ξανά.',
        },
        comma: 'κόμμα',
        semicolon: 'ερωτηματικό',
        please: 'Παρακαλώ',
        contactUs: 'επικοινωνήστε μαζί μας',
        pleaseEnterEmailOrPhoneNumber: 'Καταχωρίστε ένα email ή έναν αριθμό τηλεφώνου',
        fixTheErrors: 'διορθώστε τα σφάλματα',
        inTheFormBeforeContinuing: 'στη φόρμα πριν συνεχίσετε',
        confirm: 'Επιβεβαιώστε',
        reset: 'Επαναφορά',
        done: 'Ολοκληρώθηκε',
        more: 'Περισσότερα',
        other: 'Άλλο',
        debitCard: 'Χρεωστική κάρτα',
        bankAccount: 'Τραπεζικός λογαριασμός',
        personalBankAccount: 'Προσωπικός τραπεζικός λογαριασμός',
        businessBankAccount: 'Επαγγελματικός τραπεζικός λογαριασμός',
        join: 'Συμμετοχή',
        leave: 'Άδεια',
        decline: 'Απόρριψη',
        reject: 'Απόρριψη',
        transferBalance: 'Μεταφορά υπολοίπου',
        enterManually: 'Εισαγάγετέ το χειροκίνητα',
        message: 'Μήνυμα',
        leaveThread: 'Αποχώρηση από το νήμα',
        you: 'Εσείς',
        me: 'εγώ',
        youAfterPreposition: 'εσείς',
        your: 'σας',
        conciergeHelp: 'Παρακαλούμε επικοινωνήστε με το Concierge για βοήθεια.',
        youAppearToBeOffline: 'Φαίνεται ότι είστε εκτός σύνδεσης.',
        thisFeatureRequiresInternet: 'Αυτή η δυνατότητα απαιτεί ενεργή σύνδεση στο διαδίκτυο.',
        attachmentWillBeAvailableOnceBackOnline: 'Το συνημμένο θα είναι διαθέσιμο μόλις επανέλθετε σε σύνδεση.',
        errorOccurredWhileTryingToPlayVideo: 'Παρουσιάστηκε σφάλμα κατά την προσπάθεια αναπαραγωγής αυτού του βίντεο.',
        areYouSure: 'Είστε σίγουροι;',
        verify: 'Επιβεβαίωση',
        yesContinue: 'Ναι, συνεχίστε',
        websiteExample: 'π.χ. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `π.χ. ${zipSampleFormat}` : ''),
        description: 'Περιγραφή',
        title: 'Τίτλος',
        assignee: 'Ανάδοχος',
        with: 'με',
        shareCode: 'Κοινοποιήστε κωδικό',
        share: 'Κοινοποίηση',
        per: 'ανά',
        mi: 'μίλι',
        km: 'χιλιόμετρο',
        milesAbbreviated: 'εμένα',
        kilometersAbbreviated: 'χλμ',
        copied: 'Αντιγράφηκε!',
        someone: 'Κάποιος',
        total: 'Σύνολο',
        edit: 'Επεξεργασία',
        letsDoThis: `Πάμε να το κάνουμε!`,
        letsStart: `Ας ξεκινήσουμε`,
        showMore: 'Εμφάνιση περισσότερων',
        showLess: 'Εμφάνιση λιγότερων',
        plusMore: ({count}: {count: number}) => `+${count} ακόμη`,
        merchant: 'Έμπορος',
        googleThisMerchant: ({merchant}: {merchant: string}) => `Google ${merchant}`,
        searchOnGoogle: ({merchant}: {merchant: string}) => `Αναζητήστε το ${merchant} στο Google`,
        change: 'Αλλαγή',
        category: 'Κατηγορία',
        vendor: 'Προμηθευτής',
        report: 'Αναφορά',
        billable: 'Χρεώσιμη',
        nonBillable: 'Μη χρεώσιμο',
        tag: 'Ετικέτα',
        receipt: 'Απόδειξη',
        verified: 'Επαληθευμένο',
        replace: 'Αντικατάσταση',
        distance: 'Απόσταση',
        mile: 'μίλι',
        miles: 'μίλια',
        kilometer: 'χιλιόμετρο',
        kilometers: 'χιλιόμετρα',
        recent: 'Πρόσφατα',
        all: 'Όλα',
        am: 'π.μ.',
        pm: 'μμ.',
        tbd: 'Θα καθοριστεί',
        selectCurrency: 'Επιλέξτε νόμισμα',
        selectSymbolOrCurrency: 'Επιλέξτε ένα σύμβολο ή νόμισμα',
        card: 'Κάρτα',
        mcc: 'MCC',
        categoryGLCode: 'Κωδικός ΓΛ κατηγορίας',
        whyDoWeAskForThis: 'Γιατί ζητάμε αυτό;',
        required: 'Υποχρεωτικό',
        automatic: 'Αυτόματο',
        showing: 'Εμφανίζονται',
        of: 'του',
        default: 'Προεπιλογή',
        update: 'Ενημέρωση',
        member: 'Μέλος',
        auditor: 'Ελεγκτής',
        role: 'Ρόλος',
        roleCannotBeChanged: (workflowsLinkPage: string) =>
            `Ο ρόλος δεν μπορεί να αλλάξει επειδή αυτό το μέλος είναι <a href="${workflowsLinkPage}">πληρωτής</a> σε αυτόν τον χώρο εργασίας.`,
        currency: 'Νόμισμα',
        groupCurrency: 'Νόμισμα ομάδας',
        rate: 'Βαθμός',
        emptyLHN: {
            title: 'Τέλεια! Τα έχετε δει όλα.',
            subtitleText1: 'Βρείτε μια συνομιλία χρησιμοποιώντας το',
            subtitleText2: 'κουμπί παραπάνω ή δημιουργήστε κάτι χρησιμοποιώντας το',
            subtitleText3: 'κουμπί παρακάτω.',
            noUnreadChats: 'Καμία μη αναγνωσμένη συνομιλία',
            noTodos: 'Καμία εκκρεμότητα',
            caughtUp: 'Είστε πλήρως ενημερωμένοι. Μπράβο!',
            seeAllChats: 'Δείτε όλες τις συνομιλίες',
        },
        businessName: 'Επωνυμία επιχείρησης',
        clear: 'Εκκαθάριση',
        type: 'Τύπος',
        reportName: 'Όνομα αναφοράς',
        action: 'Ενέργεια',
        expenses: 'Έξοδα',
        totalSpend: 'Συνολικές δαπάνες',
        tax: 'Φόρος',
        shared: 'Κοινόχρηστο',
        drafts: 'Πρόχειρα',
        draft: 'Προσχέδιο',
        finished: 'Ολοκληρώθηκε',
        upgrade: 'Αναβάθμιση',
        downgradeWorkspace: 'Υποβιβασμός χώρου εργασίας',
        companyID: 'ID εταιρείας',
        userID: 'Αναγνωριστικό χρήστη',
        disable: 'Απενεργοποίηση',
        export: 'Εξαγωγή',
        initialValue: 'Αρχική τιμή',
        currentDate: 'Τρέχουσα ημερομηνία',
        value: 'Τιμή',
        downloadFailedTitle: 'Η λήψη απέτυχε',
        downloadFailedDescription: 'Η λήψη σας δεν μπόρεσε να ολοκληρωθεί. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        filterLogs: 'Φιλτράρισμα καταγραφών',
        network: 'Δίκτυο',
        reportID: 'Αναγνωριστικό αναφοράς',
        longReportID: 'Μακρύ αναγνωριστικό αναφοράς',
        withdrawalID: 'Αναγνωριστικό ανάληψης',
        internationalReimbursementIDs: 'Διεθνή αναγνωριστικά αποζημιώσεων',
        withdrawalStatus: 'Κατάσταση ανάληψης',
        paidStatus: 'Κατάσταση πληρωμής',
        bankAccounts: 'Τραπεζικοί λογαριασμοί',
        chooseFile: 'Επιλέξτε αρχείο',
        chooseFiles: 'Επιλέξτε αρχεία',
        dropTitle: 'Αφήστε το εδώ',
        dropMessage: 'Ρίξτε το αρχείο σας εδώ',
        ignore: 'Αγνοήστε',
        enabled: 'Ενεργοποιημένο',
        disabled: 'Απενεργοποιημένο',
        import: 'Εισαγάγετε',
        offlinePrompt: 'Δεν μπορείτε να πραγματοποιήσετε αυτήν την ενέργεια αυτή τη στιγμή.',
        outstanding: 'Σε εκκρεμότητα',
        chats: 'Συνομιλίες',
        tasks: 'Εργασίες',
        unread: 'Μη αναγνωσμένα',
        sent: 'Εστάλη',
        links: 'Σύνδεσμοι',
        day: 'ημέρα',
        days: 'ημέρες',
        rename: 'Μετονομασία',
        address: 'Διεύθυνση',
        hourAbbreviation: 'χ',
        minuteAbbreviation: 'μ',
        secondAbbreviation: 'ς',
        skip: 'Παράλειψη',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Χρειάζεστε κάτι συγκεκριμένο; Συνομιλήστε με τον υπεύθυνο λογαριασμού σας, ${accountManagerDisplayName}.`,
        chatNow: 'Συνομιλήστε τώρα',
        workEmail: 'Εταιρικό email',
        destination: 'Προορισμός',
        subrate: 'Δευτερεύουσα χρέωση',
        perDiem: 'Ημερήσια αποζημίωση',
        validate: 'Επικυρώστε',
        downloadAsPDF: 'Λήψη ως PDF',
        downloadAsCSV: 'Λήψη ως CSV',
        print: 'Εκτύπωση',
        help: 'Βοήθεια',
        collapsed: 'Συμπτυγμένο',
        expanded: 'Αναπτυγμένο',
        expenseReport: 'Έκθεση εξόδων',
        rateOutOfPolicy: 'Ποσοστό εκτός πολιτικής',
        leaveWorkspace: 'Έξοδος από τον χώρο εργασίας',
        leaveWorkspaceConfirmation: 'Αν αποχωρήσετε από αυτόν τον χώρο εργασίας, δεν θα μπορείτε να υποβάλλετε σε αυτόν έξοδα.',
        leaveWorkspaceConfirmationAuditor: 'Αν αποχωρήσετε από αυτόν τον χώρο εργασίας, δεν θα μπορείτε να δείτε τις αναφορές και τις ρυθμίσεις του.',
        leaveWorkspaceConfirmationAdmin: 'Αν αποχωρήσετε από αυτόν τον χώρο εργασίας, δεν θα μπορείτε να διαχειρίζεστε τις ρυθμίσεις του.',
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `Αν αποχωρήσετε από αυτόν τον χώρο εργασίας, θα αντικατασταθείτε στη ροή έγκρισης από τον/την ${workspaceOwner}, τον/την κάτοχο του χώρου εργασίας.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `Αν αποχωρήσετε από αυτόν τον χώρο εργασίας, θα αντικατασταθείτε ως προτιμώμενος εξαγωγέας από τον/την ${workspaceOwner}, τον/την κάτοχο του χώρου εργασίας.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `Αν αποχωρήσετε από αυτόν τον χώρο εργασίας, θα αντικατασταθείτε ως τεχνική επαφή από τον/την ${workspaceOwner}, τον/την ιδιοκτήτη/ιδιοκτήτρια του χώρου εργασίας.`,
        leaveWorkspaceReimburser:
            'Δεν μπορείτε να αποχωρήσετε από αυτόν τον χώρο εργασίας ως αυτός που πραγματοποιεί τις επιστροφές χρημάτων. Ορίστε νέο υπεύθυνο επιστροφών στο Χώροι εργασίας > Πραγματοποίηση ή παρακολούθηση πληρωμών και δοκιμάστε ξανά.',
        reimbursable: 'Επανεντάξιμο',
        editYourProfile: 'Επεξεργαστείτε το προφίλ σας',
        comments: 'Σχόλια',
        sharedIn: 'Κοινοποιήθηκε σε',
        unreported: 'Μη αναφερθέντα',
        invoice: 'Τιμολόγιο',
        expense: 'Έξοδο',
        chat: 'Συνομιλία',
        task: 'Εργασία',
        trip: 'Ταξίδι',
        apply: 'Εφαρμογή',
        status: 'Κατάσταση',
        on: 'Ενεργό',
        before: 'Πριν',
        after: 'Μετά',
        range: 'Εύρος',
        reschedule: 'Επαναπρογραμματισμός',
        general: 'Γενικά',
        workspacesTabTitle: 'Χώροι εργασίας',
        headsUp: 'Προσοχή!',
        submitTo: 'Υποβολή σε',
        forwardTo: 'Προώθηση σε',
        approvalLimit: 'Όριο έγκρισης',
        overLimitForwardTo: 'Προώθηση υπέρβασης ορίου προς',
        merge: 'Συγχώνευση',
        none: 'Κανένα',
        unstableInternetConnection: 'Η σύνδεση στο διαδίκτυο είναι ασταθής. Ελέγξτε το δίκτυό σας και προσπαθήστε ξανά.',
        enableGlobalReimbursements: 'Ενεργοποίηση διεθνών αποζημιώσεων',
        purchaseAmount: 'Ποσό αγοράς',
        originalAmount: 'Αρχικό ποσό',
        frequency: 'Συχνότητα',
        link: 'Σύνδεσμος',
        pinned: 'Καρφιτωμένο',
        read: 'Διαβάστηκε',
        copyToClipboard: 'Αντιγραφή στο πρόχειρο',
        thisIsTakingLongerThanExpected: 'Αυτό παίρνει περισσότερο χρόνο από το αναμενόμενο...',
        domains: 'Τομείς',
        actionRequired: 'Απαιτείται ενέργεια',
        duplicate: 'Διπλότυπο',
        duplicated: 'Διπλότυπο',
        duplicateExpense: 'Διπλή δαπάνη',
        duplicateReport: 'Διπλή αναφορά',
        copyOfReportName: (reportName: string) => `Αντίγραφο του ${reportName}`,
        exchangeRate: 'Ισοτιμία συναλλάγματος',
        reimbursableTotal: 'Συνολικό ποσό προς αποζημίωση',
        nonReimbursableTotal: 'Σύνολο μη αποζημιώσιμων',
        opensInNewTab: 'Ανοίγει σε νέα καρτέλα',
        locked: 'Κλειδωμένο',
        month: 'Μήνας',
        week: 'Εβδομάδα',
        year: 'Έτος',
        quarter: 'Τρίμηνο',
        restrictions: 'Περιορισμοί',
        tagGLCode: 'Ετικέτα κωδικού GL',
        concierge: {
            greeting: 'Γεια σας, πώς μπορώ να σας βοηθήσω;',
            showHistory: 'Εμφάνιση ιστορικού',
        },
        vacationDelegate: 'Εκπρόσωπος διακοπών',
        expensifyLogo: 'Λογότυπο Expensify',
        approver: 'Έγκριση',
        goToConcierge: 'Μεταβείτε στο Concierge',
        allSet: 'Έτοιμοι!',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `εισάγετε το ψηφίο ${digitIndex} από ${totalDigits}`,
        apiKey: 'Κλειδί API',
    },
    socials: {
        podcast: 'Ακολουθήστε μας στο Podcast',
        twitter: 'Ακολουθήστε μας στο Twitter',
        instagram: 'Ακολουθήστε μας στο Instagram',
        facebook: 'Ακολουθήστε μας στο Facebook',
        linkedin: 'Ακολουθήστε μας στο LinkedIn',
    },
    concierge: {
        collapseReasoning: 'Σύμπτυξη αιτιολόγησης',
        expandReasoning: 'Επεκτείνετε την αιτιολόγηση',
        enableNotifications: {
            prompt: 'Θέλετε να ειδοποιείστε όταν απαντά ο Concierge;',
            cta: 'Ειδοποίηση',
        },
    },
    supportalNoAccess: {
        title: 'Όχι τόσο γρήγορα',
        descriptionWithCommand: (command?: string) =>
            `Δεν έχετε δικαίωμα να πραγματοποιήσετε αυτήν την ενέργεια όταν έχει γίνει σύνδεση υποστήριξης (εντολή: ${command ?? ''}). Αν πιστεύετε ότι το Success θα πρέπει να μπορεί να πραγματοποιεί αυτήν την ενέργεια, ξεκινήστε μια συζήτηση στο Slack.`,
    },
    lockedAccount: {
        title: 'Κλειδωμένος λογαριασμός',
        description:
            'Δεν επιτρέπεται να ολοκληρώσετε αυτήν την ενέργεια, καθώς αυτός ο λογαριασμός έχει κλειδωθεί. Παρακαλούμε επικοινωνήστε με το concierge@expensify.com για τα επόμενα βήματα',
    },
    location: {
        useCurrent: 'Χρήση τρέχουσας τοποθεσίας',
        notFound: 'Δεν ήταν δυνατή η εύρεση της τοποθεσίας σας. Δοκιμάστε ξανά ή εισαγάγετε μια διεύθυνση χειροκίνητα.',
        permissionDenied: 'Φαίνεται ότι έχετε αρνηθεί την πρόσβαση στην τοποθεσία σας.',
        please: 'Παρακαλώ',
        allowPermission: 'επιτρέψτε την πρόσβαση στην τοποθεσία στις ρυθμίσεις',
        tryAgain: 'και δοκιμάστε ξανά.',
    },
    contact: {
        importContacts: 'Εισαγωγή επαφών',
        importContactsTitle: 'Εισαγωγή επαφών σας',
        importContactsText: 'Εισαγάγετε επαφές από το τηλέφωνό σας ώστε οι αγαπημένοι σας άνθρωποι να είναι πάντα ένα πάτημα μακριά.',
        importContactsExplanation: 'ώστε τα αγαπημένα σας άτομα να βρίσκονται πάντα σε απόσταση ενός αγγίγματος.',
        importContactsNativeText: 'Άλλο ένα βήμα μόνο! Δώστε μας το πράσινο φως για να εισαγάγουμε τις επαφές σας.',
    },
    anonymousReportFooter: {
        logoTagline: 'Συμμετάσχετε στη συζήτηση.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Πρόσβαση στην κάμερα',
        expensifyDoesNotHaveAccessToCamera: 'Το Expensify δεν μπορεί να τραβήξει φωτογραφίες χωρίς πρόσβαση στην κάμερά σας. Πατήστε «ρυθμίσεις» για να ενημερώσετε τα δικαιώματα.',
        attachmentError: 'Σφάλμα συνημμένου',
        errorWhileSelectingAttachment: 'Παρουσιάστηκε σφάλμα κατά την επιλογή συνημμένου. Παρακαλούμε δοκιμάστε ξανά.',
        errorWhileSelectingCorruptedAttachment: 'Προέκυψε σφάλμα κατά την επιλογή κατεστραμμένου συνημμένου. Παρακαλούμε δοκιμάστε άλλο αρχείο.',
        takePhoto: 'Βγάλτε φωτογραφία',
        chooseFromGallery: 'Επιλογή από τη συλλογή',
        chooseDocument: 'Επιλέξτε αρχείο',
        attachmentTooLarge: 'Το συνημμένο είναι πολύ μεγάλο',
        sizeExceeded: 'Το μέγεθος του συνημμένου είναι μεγαλύτερο από το όριο των 24 MB',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `Το μέγεθος του συνημμένου είναι μεγαλύτερο από το όριο των ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Το συνημμένο είναι πολύ μικρό',
        sizeNotMet: 'Το μέγεθος του συνημμένου πρέπει να είναι μεγαλύτερο από 240 bytes',
        wrongFileType: 'Μη έγκυρος τύπος αρχείου',
        notAllowedExtension: 'Αυτός ο τύπος αρχείου δεν επιτρέπεται. Παρακαλούμε δοκιμάστε έναν διαφορετικό τύπο αρχείου.',
        folderNotAllowedMessage: 'Δεν επιτρέπεται η μεταφόρτωση φακέλου. Παρακαλούμε δοκιμάστε ένα διαφορετικό αρχείο.',
        protectedPDFNotSupported: 'Δεν υποστηρίζονται PDF με προστασία κωδικού πρόσβασης',
        attachmentImageResized: 'Αυτή η εικόνα έχει αλλάξει μέγεθος για προεπισκόπηση. Κάντε λήψη για πλήρη ανάλυση.',
        attachmentImageTooLarge: 'Η εικόνα είναι πολύ μεγάλη για προεπισκόπηση πριν από την αποστολή.',
        imageDimensionsTooLarge: 'Οι διαστάσεις της εικόνας είναι πολύ μεγάλες για επεξεργασία. Παρακαλούμε χρησιμοποιήστε μια μικρότερη εικόνα.',
        tooManyFiles: (fileLimit: number) => `Μπορείτε να ανεβάζετε έως ${fileLimit} αρχεία κάθε φορά.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `Τα αρχεία υπερβαίνουν τα ${maxUploadSizeInMB} MB. Παρακαλούμε δοκιμάστε ξανά.`,
        someFilesCantBeUploaded: 'Ορισμένα αρχεία δεν μπορούν να μεταφορτωθούν',
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `Τα αρχεία πρέπει να είναι μικρότερα από ${maxUploadSizeInMB} MB. Τυχόν μεγαλύτερα αρχεία δεν θα αποσταλούν.`,
        maxFileLimitExceeded: 'Μπορείτε να ανεβάσετε έως και 30 αποδείξεις κάθε φορά. Τυχόν επιπλέον δεν θα ανεβούν.',
        unsupportedFileType: (fileType: string) => `Οι τύποι αρχείων ${fileType} δεν υποστηρίζονται. Θα μεταφορτώνονται μόνο οι υποστηριζόμενοι τύποι αρχείων.`,
        learnMoreAboutSupportedFiles: 'Μάθετε περισσότερα σχετικά με τις υποστηριζόμενες μορφές.',
        passwordProtected: 'Τα προστατευμένα με κωδικό πρόσβασης PDF δεν υποστηρίζονται. Μόνο τα υποστηριζόμενα αρχεία θα αποσταλούν.',
    },
    dropzone: {
        addAttachments: 'Προσθήκη συνημμένων',
        addReceipt: 'Προσθήκη απόδειξης',
        scanReceipts: 'Σάρωση αποδείξεων',
        replaceReceipt: 'Αντικατάσταση απόδειξης',
    },
    filePicker: {
        fileError: 'Σφάλμα αρχείου',
        errorWhileSelectingFile: 'Προέκυψε σφάλμα κατά την επιλογή ενός αρχείου. Παρακαλώ δοκιμάστε ξανά.',
    },
    connectionComplete: {
        title: 'Η σύνδεση ολοκληρώθηκε',
        supportingText: 'Μπορείτε να κλείσετε αυτό το παράθυρο και να επιστρέψετε στην εφαρμογή Expensify.',
    },
    avatarCropModal: {
        title: 'Επεξεργασία φωτογραφίας',
        description: 'Σύρετε, μεγεθύνετε και περιστρέψτε την εικόνα σας όπως θέλετε.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Δεν βρέθηκε επέκταση για αυτόν τον τύπο MIME',
        problemGettingImageYouPasted: 'Παρουσιάστηκε πρόβλημα κατά τη λήψη της εικόνας που επικολλήσατε',
        commentExceededMaxLength: (formattedMaxLength: string) => `Το μέγιστο μήκος σχολίου είναι ${formattedMaxLength} χαρακτήρες.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `Το μέγιστο μήκος τίτλου εργασίας είναι ${formattedMaxLength} χαρακτήρες.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Ενημέρωση εφαρμογής',
        updatePrompt: 'Μια νέα έκδοση αυτής της εφαρμογής είναι διαθέσιμη.  \nΕνημερώστε τώρα ή επανεκκινήστε την εφαρμογή αργότερα για να γίνει λήψη των πιο πρόσφατων αλλαγών.',
    },
    deeplinkWrapper: {
        launching: 'Εκκίνηση του Expensify',
        expired: 'Η συνεδρία σας έχει λήξει.',
        signIn: 'Παρακαλούμε συνδεθείτε ξανά.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: 'Επισκόπηση συναλλαγής',
            pleaseReview: 'Παρακαλούμε ελέγξτε αυτή τη συναλλαγή',
            requiresYourReview: 'Μια συναλλαγή με Κάρτα Expensify απαιτεί την εξέτασή σας.',
            transactionDetails: 'Λεπτομέρειες συναλλαγής',
            attemptedTransaction: 'Απόπειρα συναλλαγής',
            deny: 'Άρνηση',
            approve: 'Έγκριση',
            denyTransaction: 'Απόρριψη συναλλαγής',
            transactionDenied: 'Η συναλλαγή απορρίφθηκε',
            transactionApproved: 'Η συναλλαγή εγκρίθηκε!',
            areYouSureToDeny: 'Είστε βέβαιοι; Η συναλλαγή θα απορριφθεί αν κλείσετε αυτήν την οθόνη.',
            youCanTryAgainAtMerchantOrReachOut:
                'Μπορείτε να προσπαθήσετε ξανά στο κατάστημα. Αν δεν επιχειρήσατε εσείς αυτή τη συναλλαγή, <concierge-link>επικοινωνήστε με το Concierge</concierge-link> για να αναφέρετε πιθανή απάτη.',
            youNeedToTryAgainAtMerchant: 'Αυτή η συναλλαγή δεν επαληθεύτηκε, οπότε την απορρίψαμε. Θα χρειαστεί να δοκιμάσετε ξανά στο κατάστημα.',
            goBackToTheMerchant: 'Επιστρέψτε στον ιστότοπο του εμπόρου για να συνεχίσετε τη συναλλαγή.',
            transactionFailed: 'Η συναλλαγή απέτυχε',
            transactionCouldNotBeCompleted: 'Η συναλλαγή σας δεν μπόρεσε να ολοκληρωθεί. Παρακαλούμε δοκιμάστε ξανά στο κατάστημα.',
            transactionCouldNotBeCompletedReachOut:
                'Η συναλλαγή σας δεν μπόρεσε να ολοκληρωθεί. Αν δεν προσπαθήσατε εσείς να κάνετε αυτή τη συναλλαγή, <concierge-link>επικοινωνήστε με το Concierge</concierge-link> για να αναφέρετε πιθανή απάτη.',
            reviewFailed: 'Η αναθεώρηση απέτυχε',
            alreadyReviewedSubtitle:
                'Έχετε ήδη ελέγξει αυτή τη συναλλαγή. Παρακαλούμε ελέγξτε το <transaction-history-link>ιστορικό συναλλαγών</transaction-history-link> σας ή επικοινωνήστε με το <concierge-link>Concierge</concierge-link> για να αναφέρετε τυχόν προβλήματα.',
        },
        unsupportedDevice: {
            unsupportedDevice: 'Μη υποστηριζόμενη συσκευή',
            pleaseDownloadMobileApp: `Αυτή η ενέργεια δεν υποστηρίζεται στη συσκευή σας. Παρακαλούμε κατεβάστε την εφαρμογή Expensify από το <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> ή το <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> και δοκιμάστε ξανά.`,
            pleaseUseWebApp: `Αυτή η ενέργεια δεν υποστηρίζεται στη συσκευή σας. Παρακαλούμε χρησιμοποιήστε την <a href="${CONST.NEW_EXPENSIFY_URL}">web εφαρμογή Expensify</a> και δοκιμάστε ξανά.`,
        },
        biometricsTest: {
            biometricsTest: 'Δοκιμή βιομετρικών',
            authenticationSuccessful: 'Επιτυχής έλεγχος ταυτότητας',
            successfullyAuthenticatedUsing: (authType?: string) => `Έχετε πραγματοποιήσει επιτυχή έλεγχο ταυτότητας με χρήση ${authType}.`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `Βιομετρικά (${status})`,
            statusNeverRegistered: 'Ποτέ δεν έγινε εγγραφή',
            statusNotRegistered: 'Μη καταχωρισμένο',
            statusRegisteredOtherDevice: () => ({one: 'Καταχωρίστηκε άλλη συσκευή', other: 'Άλλες καταχωρισμένες συσκευές'}),
            statusRegisteredThisDevice: 'Εγγεγραμμένο',
            yourAttemptWasUnsuccessful: 'Η προσπάθεια ταυτοποίησής σας δεν ήταν επιτυχής.',
            youCouldNotBeAuthenticated: 'Δεν ήταν δυνατή η επιβεβαίωση της ταυτότητάς σας',
            areYouSureToReject: 'Είστε βέβαιοι; Η προσπάθεια πιστοποίησης θα απορριφθεί αν κλείσετε αυτήν την οθόνη.',
            rejectAuthentication: 'Απόρριψη ταυτοποίησης',
            test: 'Δοκιμή',
            biometricsAuthentication: 'Βιομετρικός έλεγχος ταυτότητας',
            authType: {
                unknown: 'Άγνωστο',
                none: 'Κανένα',
                credentials: 'Διαπιστευτήρια',
                biometrics: 'Βιομετρικά',
                faceId: 'Face ID',
                touchId: 'Touch ID',
                opticId: 'Ταυτότητα Optic ID',
                passkey: 'Κλειδί πρόσβασης',
            },
        },
        pleaseEnableInSystemSettings: {
            start: 'Παρακαλούμε ενεργοποιήστε την αναγνώριση προσώπου/δακτυλικού αποτυπώματος ή ορίστε κωδικό πρόσβασης συσκευής στις',
            link: 'ρυθμίσεις συστήματος',
            end: '.',
        },
        oops: 'Ουπς, κάτι πήγε στραβά',
        verificationFailed: 'Η επαλήθευση απέτυχε',
        looksLikeYouRanOutOfTime: 'Φαίνεται ότι ο χρόνος σας τελείωσε! Παρακαλούμε δοκιμάστε ξανά στο κατάστημα.',
        youRanOutOfTime: 'Ο χρόνος σας τελείωσε',
        letsVerifyItsYou: 'Ας επιβεβαιώσουμε ότι είστε εσείς',
        nowLetsAuthenticateYou: 'Τώρα, ας σας ταυτοποιήσουμε...',
        letsAuthenticateYou: 'Ας σας επαληθεύσουμε…',
        verifyYourself: {
            biometrics: 'Επαληθεύστε την ταυτότητά σας με το πρόσωπο ή το δακτυλικό σας αποτύπωμα',
            passkeys: 'Επαληθεύστε την ταυτότητά σας με passkey',
        },
        enableQuickVerification: {
            biometrics: 'Ενεργοποιήστε γρήγορη και ασφαλή επαλήθευση με το πρόσωπο ή το δακτυλικό σας αποτύπωμα. Δεν απαιτούνται κωδικοί πρόσβασης ή κωδικοί.',
            passkeys: 'Ενεργοποιήστε γρήγορη και ασφαλή επαλήθευση με χρήση passkey. Δεν απαιτούνται κωδικοί πρόσβασης ή κωδικοί.',
        },
        revoke: {
            revoke: 'Ανακαλέστε',
            title: 'Πρόσωπο/δακτυλικό αποτύπωμα & passkeys',
            explanation:
                'Η επαλήθευση μέσω προσώπου/δακτυλικού αποτυπώματος ή passkey είναι ενεργοποιημένη σε μία ή περισσότερες συσκευές. Η ανάκληση πρόσβασης θα απαιτήσει έναν μαγικό κωδικό για την επόμενη επαλήθευση σε αυτήν τη συσκευή.',
            confirmationPrompt: 'Είστε σίγουροι; Θα χρειαστείτε έναν μαγικό κωδικό για την επόμενη επαλήθευση σε αυτήν τη συσκευή.',
            confirmationPromptThisDevice: 'Είστε βέβαιοι; Θα χρειαστείτε έναν μαγικό κωδικό για την επόμενη επιβεβαίωση σε αυτήν τη συσκευή.',
            confirmationPromptMultiple: 'Είστε βέβαιοι; Θα χρειαστείτε έναν μαγικό κωδικό για την επόμενη επαλήθευση σε αυτές τις συσκευές.',
            confirmationPromptAll: 'Είστε βέβαιοι; Θα χρειαστείτε έναν μαγικό κωδικό για την επόμενη επαλήθευση σε οποιαδήποτε συσκευή.',
            cta: 'Ανακαλέστε πρόσβαση',
            ctaAll: 'Ανακλήστε όλα',
            noDevices:
                'Δεν έχετε καταχωρίσει καμία συσκευή για επαλήθευση με αναγνώριση προσώπου/δακτυλικού αποτυπώματος ή passkey. Αν καταχωρίσετε κάποια, θα μπορείτε να ανακαλέσετε αυτήν την πρόσβαση από εδώ.',
            dismiss: 'Εντάξει',
            error: 'Η αίτηση απέτυχε. Προσπαθήστε ξανά αργότερα.',
            thisDevice: 'Αυτή η συσκευή',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['Ένα', 'Δύο', 'Τρία', 'Τέσσερα', 'Πέντε', 'Έξι', 'Επτά', 'Οκτώ', 'Εννέα'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `${displayCount} άλλο ${otherDeviceCount === 1 ? 'συσκευή' : 'συσκευές'}`;
            },
        },
        setPin: {
            didNotShipCard: 'Δεν στείλαμε την κάρτα σας. Παρακαλούμε δοκιμάστε ξανά.',
        },
        revealPin: {
            couldNotReveal: 'Δεν ήταν δυνατή η εμφάνιση του PIN σας. Παρακαλούμε δοκιμάστε ξανά.',
        },
        changePin: {
            didNotChange: 'Δεν αλλάξαμε το PIN σας. Παρακαλούμε προσπαθήστε ξανά.',
        },
        revealCardDetail: {
            couldNotReveal: 'Δεν μπορέσαμε να εμφανίσουμε τα στοιχεία της κάρτας σας. Παρακαλούμε δοκιμάστε ξανά.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: Str.dedent(`
            Αμπρακατάμπρα,
            έχετε συνδεθεί!
        `),
        successfulSignInDescription: 'Επιστρέψτε στην αρχική σας καρτέλα για να συνεχίσετε.',
        title: 'Ορίστε ο μαγικός σας κωδικός',
        description: Str.dedent(`
            Παρακαλούμε εισαγάγετε τον κωδικό από τη συσκευή
            όπου ζητήθηκε αρχικά
        `),
        doNotShare: Str.dedent(`
            Μην κοινοποιείτε τον κωδικό σας σε κανέναν.
            Η Expensify δεν θα σας τον ζητήσει ποτέ!
        `),
        or: ', ή',
        signInHere: 'απλώς συνδεθείτε εδώ',
        expiredCodeTitle: 'Ο μαγικός κωδικός έληξε',
        expiredCodeDescription: 'Επιστρέψτε στην αρχική συσκευή και ζητήστε νέο κωδικό',
        successfulNewCodeRequest: 'Ο κωδικός ζητήθηκε. Παρακαλούμε ελέγξτε τη συσκευή σας.',
        tfaRequiredTitle: Str.dedent(`
            Απαιτείται έλεγχος ταυτότητας δύο παραγόντων
        `),
        tfaRequiredDescription: Str.dedent(`
            Παρακαλούμε εισαγάγετε τον κωδικό δύο παραγόντων εκεί όπου προσπαθείτε να συνδεθείτε.
        `),
        requestOneHere: 'ζητήστε μία εδώ.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Πληρώθηκε από',
        whatsItFor: 'Για ποιο πράγμα είναι;',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Όνομα, email ή αριθμός τηλεφώνου',
        findMember: 'Βρείτε μέλος',
        searchForSomeone: 'Αναζητήστε κάποιον',
        userSelected: (username: string) => `επιλέχθηκε ο/η ${username}`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Υποβάλετε μία δαπάνη, παραπέμψτε την ομάδα σας',
            subtitleText: 'Θέλετε να χρησιμοποιεί και η ομάδα σας το Expensify; Απλώς υποβάλετε μια δαπάνη σε αυτούς και εμείς θα φροντίσουμε τα υπόλοιπα.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Κλείστε ένα ραντεβού κλήσης',
    },
    hello: 'Γεια σας',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Ξεκινήστε παρακάτω.',
        anotherLoginPageIsOpen: 'Μία άλλη σελίδα σύνδεσης είναι ανοιχτή.',
        anotherLoginPageIsOpenExplanation: 'Έχετε ανοίξει τη σελίδα σύνδεσης σε ξεχωριστή καρτέλα. Παρακαλούμε συνδεθείτε από εκείνη την καρτέλα.',
        welcome: 'Καλώς ήρθατε!',
        welcomeWithoutExclamation: 'Καλώς ορίσατε',
        phrase2: 'Το χρήμα μιλάει. Και τώρα που η συνομιλία και οι πληρωμές βρίσκονται σε ένα μέρος, είναι και εύκολο.',
        phrase3: 'Οι πληρωμές σας φτάνουν σε εσάς τόσο γρήγορα όσο μπορείτε να περάσετε το μήνυμά σας.',
        enterPassword: 'Παρακαλούμε εισαγάγετε τον κωδικό πρόσβασής σας',
        welcomeNewFace: (login: string) => `${login}, είναι πάντα ωραίο να βλέπουμε ένα καινούργιο πρόσωπο εδώ γύρω!`,
        welcomeEnterMagicCode: (login: string) => `Παρακαλώ εισαγάγετε τον μαγικό κωδικό που στάλθηκε στο ${login}. Θα πρέπει να φτάσει μέσα σε ένα ή δύο λεπτά.`,
    },
    login: {
        hero: {
            header: 'Ταξίδια και έξοδα, με την ταχύτητα της συνομιλίας',
            body: 'Καλώς ήρθατε στη νέα γενιά του Expensify, όπου τα ταξίδια και τα έξοδά σας προχωρούν ταχύτερα με τη βοήθεια συμφραζόμενης, ζωντανής συνομιλίας.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Συνεχίστε τη σύνδεση με ενιαία σύνδεση (SSO):',
        orContinueWithMagicCode: 'Μπορείτε επίσης να συνδεθείτε με έναν μαγικό κωδικό',
        useSingleSignOn: 'Χρησιμοποιήστε ενιαία σύνδεση',
        useMagicCode: 'Χρησιμοποιήστε μαγικό κωδικό',
        launching: 'Εκκίνηση...',
        oneMoment: 'Μισό λεπτό, σας ανακατευθύνουμε στην πύλη μονού σημείου εισόδου της εταιρείας σας.',
    },
    reportActionCompose: {
        dropToUpload: 'Αφήστε εδώ για μεταφόρτωση',
        sendAttachment: 'Αποστολή συνημμένου',
        addAttachment: 'Προσθήκη συνημμένου',
        writeSomething: 'Γράψτε κάτι...',
        blockedFromConcierge: 'Η επικοινωνία απαγορεύεται',
        askConciergeToUpdate: 'Δοκιμάστε «Ενημέρωση μιας δαπάνης»...',
        askConciergeToCorrect: 'Δοκιμάστε «Διόρθωση μιας δαπάνης»...',
        askConciergeForHelp: 'Ζητήστε βοήθεια από το Concierge AI...',
        fileUploadFailed: 'Η μεταφόρτωση απέτυχε. Ο τύπος αρχείου δεν υποστηρίζεται.',
        localTime: (user: string, time: string) => `Είναι ${time} για τον/την ${user}`,
        edited: '(επεξεργάστηκε)',
        emoji: 'Emoji',
        collapse: 'Σύμπτυξη',
        expand: 'Ανάπτυξη',
    },
    reportActionContextMenu: {
        copyMessage: 'Αντιγραφή μηνύματος',
        copied: 'Αντιγράφηκε!',
        copyLink: 'Αντιγραφή συνδέσμου',
        copyURLToClipboard: 'Αντιγραφή URL στο πρόχειρο',
        copyEmailToClipboard: 'Αντιγραφή email στο πρόχειρο',
        markAsUnread: 'Επισήμανση ως μη αναγνωσμένο',
        markAsRead: 'Σήμανση ως αναγνωσμένο',
        editAction: ({action}: EditActionParams) => `Επεξεργασία ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'δαπάνη' : 'σχόλιο'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'σχόλιο';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Διαγραφή ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'σχόλιο';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το ${type};`;
        },
        onlyVisible: 'Ορατό μόνο σε',
        explain: 'Εξηγήστε',
        explainMessage: 'Παρακαλώ εξηγήστε μου αυτό.',
        replyInThread: 'Απάντηση σε νήμα',
        joinThread: 'Συμμετοχή στο νήμα',
        leaveThread: 'Αποχώρηση από το νήμα',
        copyOnyxData: 'Αντιγραφή δεδομένων Onyx',
        viewAgentZeroTrace: 'Προβολή ίχνους AgentZero',
        flagAsOffensive: 'Επισήμανση ως προσβλητικού',
        menu: 'Μενού',
    },
    emojiReactions: {
        addReactionTooltip: 'Προσθήκη αντίδρασης',
        reactedWith: 'αντέδρασε με',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Χάσατε το πάρτι στο <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, δεν υπάρχει τίποτα να δείτε εδώ.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Αυτή η συνομιλία είναι με όλα τα μέλη του Expensify στο domain <strong>${domainRoom}</strong>. Χρησιμοποιήστε την για να συνομιλείτε με συναδέλφους, να μοιράζεστε συμβουλές και να κάνετε ερωτήσεις.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Αυτή η συνομιλία είναι με τον/την διαχειριστή του χώρου εργασίας <strong>${workspaceName}</strong>. Χρησιμοποιήστε τη για να συνομιλήσετε σχετικά με τη ρύθμιση του χώρου εργασίας και άλλα.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) =>
            `Αυτή η συνομιλία είναι με όλους στο <strong>${workspaceName}</strong>. Χρησιμοποιήστε την για τις πιο σημαντικές ανακοινώσεις.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Αυτό το δωμάτιο συνομιλίας προορίζεται για οτιδήποτε σχετίζεται με <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Αυτή η συζήτηση αφορά τιμολόγια μεταξύ του/της <strong>${invoicePayer}</strong> και του/της <strong>${invoiceReceiver}</strong>. Χρησιμοποιήστε το κουμπί + για να στείλετε ένα τιμολόγιο.`,
        beginningOfChatHistory: (users: string) => `Αυτή η συνομιλία είναι με τον/την/τους ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Εδώ είναι όπου ο/η <strong>${submitterDisplayName}</strong> θα υποβάλλει δαπάνες στο <strong>${workspaceName}</strong>. Απλώς χρησιμοποιήστε το κουμπί +.`,
        beginningOfChatHistoryPolicyExpenseChatTrack: 'Εδώ θα παρακολουθείτε τις δαπάνες σας.',
        beginningOfChatHistorySelfDM: 'Αυτός είναι ο προσωπικός σας χώρος. Χρησιμοποιήστε τον για σημειώσεις, εργασίες, προσχέδια και υπενθυμίσεις.',
        beginningOfChatHistorySystemDM: 'Καλώς ορίσατε! Ας σας ρυθμίσουμε.',
        chatWithAccountManager: 'Συνομιλήστε με τον υπεύθυνο λογαριασμού σας εδώ',
        askMeAnything: 'Ρωτήστε με οτιδήποτε!',
        sayHello: 'Πείτε γεια!',
        yourSpace: 'Ο χώρος σας',
        welcomeToRoom: (roomName: string) => `Καλώς ήρθατε στο ${roomName}!`,
        usePlusButton: (additionalText: string) => `Χρησιμοποιήστε το κουμπί + για να ${additionalText} μία δαπάνη.`,
        askConcierge: 'Το Concierge μπορεί να απαντά σε ερωτήσεις, να ενημερώνει δαπάνες και πολλά άλλα.',
        conciergeSupport: 'Ο προσωπικός σας πράκτορας τεχνητής νοημοσύνης',
        create: 'δημιουργία',
        iouTypes: {
            pay: 'πληρώστε',
            split: 'διαχωρισμός',
            submit: 'υποβολή',
            track: 'παρακολούθηση',
            invoice: 'τιμολόγιο',
        },
    },
    adminOnlyCanPost: 'Μόνο οι διαχειριστές μπορούν να στέλνουν μηνύματα σε αυτό το δωμάτιο.',
    readOnlyConversation: 'Αυτή η συνομιλία είναι μόνο για ανάγνωση.',
    reportAction: {
        asCopilot: 'ως βοηθός για',
        assistedBy: (agentName: string) => `με τη βοήθεια του/της ${agentName}`,
        humanSupportAgent: 'έναν ανθρώπινο εκπρόσωπο υποστήριξης',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `δημιούργησε αυτήν την αναφορά για να συγκεντρώσει όλες τις δαπάνες από την αναφορά <a href="${reportUrl}">${reportName}</a> που δεν ήταν δυνατό να υποβληθούν στη συχνότητα που επιλέξατε`,
        createdReportForUnapprovedTransactions: (reportUrl: string, reportName: string, reportID: string, isReportDeleted: boolean) =>
            isReportDeleted
                ? `δημιούργησε αυτήν την αναφορά για τυχόν δεσμευμένες δαπάνες από τη διαγεγραμμένη αναφορά #${reportID}`
                : `δημιούργησε αυτήν την αναφορά για όλες τις δεσμευμένες δαπάνες από την αναφορά <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Ειδοποιήστε όλους σε αυτή τη συνομιλία',
    },
    newMessages: 'Νέα μηνύματα',
    latestMessages: 'Τελευταία μηνύματα',
    youHaveBeenBanned: 'Σημείωση: Έχετε αποκλειστεί από τη συνομιλία σε αυτό το κανάλι.',
    reportTypingIndicator: {
        isTyping: 'πληκτρολογεί...',
        areTyping: 'πληκτρολογούν...',
        multipleMembers: 'Πολλαπλά μέλη',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Αυτό το δωμάτιο συνομιλίας έχει αρχειοθετηθεί.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Αυτή η συνομιλία δεν είναι πλέον ενεργή, επειδή ο/η ${displayName} έκλεισε τον λογαριασμό του/της.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Αυτή η συνομιλία δεν είναι πλέον ενεργή, επειδή ο/η ${oldDisplayName} έχει συγχωνεύσει τον λογαριασμό του/της με τον/την ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Αυτή η συνομιλία δεν είναι πλέον ενεργή επειδή <strong>εσείς</strong> δεν είστε πλέον μέλος του χώρου εργασίας ${policyName}.`
                : `Αυτή η συνομιλία δεν είναι πλέον ενεργή επειδή ο/η ${displayName} δεν είναι πλέον μέλος του χώρου εργασίας ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Αυτή η συνομιλία δεν είναι πλέον ενεργή, επειδή το ${policyName} δεν είναι πλέον ενεργό χώρο εργασίας.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Αυτή η συνομιλία δεν είναι πλέον ενεργή, επειδή το ${policyName} δεν είναι πλέον ενεργό χώρο εργασίας.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Αυτή η κράτηση έχει αρχειοθετηθεί.',
    },
    writeCapabilityPage: {
        label: 'Ποιος μπορεί να δημοσιεύει',
        writeCapability: {
            all: 'Όλα τα μέλη',
            admins: 'Μόνο διαχειριστές',
        },
    },
    sidebarScreen: {
        buttonFind: 'Βρείτε κάτι...',
        buttonMySettings: 'Οι ρυθμίσεις μου',
        fabNewChat: 'Έναρξη συνομιλίας',
        fabScanReceiptExplained: 'Σαρώστε απόδειξη',
        chatPinned: 'Η συνομιλία καρφιτσώθηκε',
        draftedMessage: 'Πρόχειρο μήνυμα',
        listOfChatMessages: 'Λίστα μηνυμάτων συνομιλίας',
        listOfChats: 'Λίστα συνομιλιών',
        saveTheWorld: 'Σώστε τον κόσμο',
        tooltip: 'Ξεκινήστε εδώ!',
    },
    homePage: {
        forYou: 'Για εσάς',
        timeSensitiveSection: {
            title: 'Χρονικά ευαίσθητο',
            ctaFix: 'Διόρθωση',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `Διορθώστε τη σύνδεση της εταιρικής κάρτας ${feedName}` : 'Επιδιόρθωση σύνδεσης εταιρικής κάρτας'),
                defaultSubtitle: 'Χώρος εργασίας',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `Διόρθωση σύνδεσης προσωπικής κάρτας ${cardName}` : 'Διορθώστε τη σύνδεση προσωπικής κάρτας'),
                subtitle: 'Πορτοφόλι',
            },
            fixPolicyConnection: {
                title: ({integrationName}: {integrationName: string}) => `Επιδιόρθωση σύνδεσης ${integrationName}`,
                defaultSubtitle: 'Χώρος εργασίας',
                subtitle: ({policyName}: {policyName: string}) => policyName,
            },
            addShippingAddress: {
                title: 'Χρειαζόμαστε τη διεύθυνση αποστολής σας',
                subtitle: 'Δώστε μια διεύθυνση για να λάβετε την Κάρτα Expensify.',
                cta: 'Προσθήκη διεύθυνσης',
            },
            addVirtualCardPersonalDetails: {
                title: 'Χρειαζόμαστε τα προσωπικά σας στοιχεία',
                subtitle: 'Προσθέστε τα στοιχεία σας για να δείτε και να αρχίσετε να χρησιμοποιείτε την Κάρτα Expensify.',
                cta: 'Προσθέστε λεπτομέρειες',
            },
            addPaymentCard: {
                title: 'Προσθέστε μια κάρτα πληρωμής για να συνεχίσετε να χρησιμοποιείτε το Expensify',
                subtitle: 'Λογαριασμός > Συνδρομή',
                cta: 'Προσθήκη',
            },
            activateCard: {
                title: 'Ενεργοποιήστε την Κάρτα Expensify',
                subtitle: 'Επικυρώστε την κάρτα σας και ξεκινήστε να ξοδεύετε.',
                cta: 'Ενεργοποίηση',
            },
            reviewCardFraud: {
                title: 'Ελέγξτε πιθανή απάτη στην Κάρτα Expensify',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `Ελέγξτε ${amount} για πιθανή απάτη στο ${merchant}`,
                subtitle: 'Κάρτα Expensify',
                cta: 'Ανασκόπηση',
            },
            validateAccount: {
                title: 'Επικυρώστε τον λογαριασμό σας',
                subtitle: 'Λογαριασμός',
                cta: 'Επικυρώστε',
            },
            fixFailedBilling: {
                title: 'Δεν μπορέσαμε να χρεώσουμε την αποθηκευμένη κάρτα σας',
                subtitle: 'Συνδρομή',
            },
            unlockBankAccount: {
                workspaceTitle: 'Ο επαγγελματικός σας τραπεζικός λογαριασμός έχει κλειδωθεί',
                personalTitle: 'Ο τραπεζικός σας λογαριασμός έχει κλειδωθεί',
                workspaceSubtitle: ({policyName}: {policyName: string}) => policyName,
                personalSubtitle: 'Πορτοφόλι',
            },
            enterSignerInfo: {
                title: 'Απαιτούνται στοιχεία υπογράφοντος',
                subtitle: ({bankAccountLastFour}: {bankAccountLastFour: string}) => `Τραπεζικός λογαριασμός ${bankAccountLastFour}`,
            },
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `Δωρεάν δοκιμή: απομένουν ${days} ${days === 1 ? 'ημέρα' : 'ημέρες'} ημέρες!`,
            offer50Body: 'Κερδίστε έκπτωση 50% για τον πρώτο σας χρόνο',
            offer25Body: 'Κερδίστε έκπτωση 25% για τον πρώτο σας χρόνο',
            addCardBody: 'Προσθέστε κάρτα πληρωμής',
            ctaClaim: 'Απαίτηση',
            ctaAdd: 'Προσθήκη κάρτας',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `Χρόνος που απομένει: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: 'Χρόνος που απομένει: 1 ημέρα',
                other: (pluralCount: number) => `Χρόνος που απομένει: ${pluralCount} ημέρες`,
            }),
        },
        yourSpend: {
            title: 'Οι δαπάνες σας',
            awaitingApproval: 'Εκκρεμεί έγκριση',
            repaidLast30Days: 'Εξοφλήθηκε τις τελευταίες 30 ημέρες',
            recentTransactions: ({lastFour}: {lastFour: string}) => `Πρόσφατες συναλλαγές • ${lastFour}`,
        },
        seeMore: ({count}: {count: number}) => `Δείτε ακόμα ${count}`,
        announcements: 'Ανακοινώσεις',
        discoverSection: {
            title: 'Ανακαλύψτε',
            menuItemTitleNonAdmin: 'Μάθετε πώς να δημιουργείτε δαπάνες και να υποβάλλετε αναφορές.',
            menuItemTitleAdmin: 'Μάθετε πώς να προσκαλείτε μέλη, να επεξεργάζεστε ροές έγκρισης και να πραγματοποιείτε συμφωνία εταιρικών καρτών.',
            menuItemDescription: 'Δείτε τι μπορεί να κάνει το Expensify σε 2 λεπτά',
        },
        forYouSection: {
            reviewExpenses: ({count}: {count: number}) => `Ελέγξτε ${count} ${count === 1 ? 'δαπάνη' : 'έξοδα'}`,
            submit: ({count}: {count: number}) => `Υποβολή ${count} ${count === 1 ? 'αναφορά' : 'αναφορές'}`,
            approve: ({count}: {count: number}) => `Έγκριση ${count} ${count === 1 ? 'αναφορά' : 'αναφορές'}`,
            pay: ({count}: {count: number}) => `Πληρώστε ${count} ${count === 1 ? 'αναφορά' : 'αναφορές'}`,
            export: ({count}: {count: number}) => `Εξαγωγή ${count} ${count === 1 ? 'αναφορά' : 'αναφορές'}`,
            begin: 'Έναρξη',
            emptyStateMessages: {
                thumbsUpStarsTitle: 'Ολοκληρώσατε!',
                thumbsUpStarsDescription: 'Μπράβο σας, μείνετε συντονισμένοι για περισσότερες εργασίες.',
                smallRocketTitle: 'Είστε καλυμμένος',
                smallRocketDescription: 'Οι επερχόμενες εκκρεμότητες θα εμφανίζονται εδώ.',
                cowboyHatTitle: 'Ολοκληρώσατε!',
                cowboyHatDescription: 'Όλες οι εργασίες έχουν τακτοποιηθεί, μείνετε σε επιφυλακή για περισσότερες.',
                trophy1Title: 'Τίποτα προς εμφάνιση',
                trophy1Description: 'Τα καταφέρατε! Μείνετε σε εγρήγορση για περισσότερες εκκρεμότητες.',
                palmTreeTitle: 'Είστε καλυμμένος',
                palmTreeDescription: 'Ώρα για χαλάρωση, αλλά μείνετε συντονισμένοι για μελλοντικές εργασίες.',
                fishbowlBlueTitle: 'Ολοκληρώσατε!',
                fishbowlBlueDescription: 'Θα εμφανίζουμε εδώ μελλοντικές εργασίες.',
                targetTitle: 'Είστε καλυμμένος',
                targetDescription: 'Μπράβο, παραμένετε στον στόχο. Επιστρέψτε για περισσότερες εργασίες!',
                chairTitle: 'Τίποτα προς εμφάνιση',
                chairDescription: 'Χαλαρώστε, θα εμφανίσουμε εδώ τις επερχόμενες εκκρεμότητες σας.',
                broomTitle: 'Ολοκληρώσατε!',
                broomDescription: 'Οι εργασίες είναι τακτοποιημένες, αλλά μείνετε συντονισμένοι για περισσότερα προς διεκπεραίωση.',
                houseTitle: 'Είστε καλυμμένος',
                houseDescription: 'Αυτή είναι η κεντρική σας σελίδα για τις επερχόμενες εκκρεμότητες.',
                conciergeBotTitle: 'Τίποτα προς εμφάνιση',
                conciergeBotDescription: 'Μπιπ μπουπ μπιπ μπουπ, ελάτε ξανά για περισσότερες εργασίες!',
                checkboxTextTitle: 'Είστε καλυμμένος',
                checkboxTextDescription: 'Σημειώστε εδώ τις επερχόμενες εκκρεμότητές σας.',
                flashTitle: 'Ολοκληρώσατε!',
                flashDescription: 'Θα εξαφανίσουμε εδώ τις μελλοντικές σας εργασίες.',
                sunglassesTitle: 'Τίποτα προς εμφάνιση',
                sunglassesDescription: 'Ήρθε η ώρα για χαλάρωση, αλλά μείνετε συντονισμένοι για ό,τι ακολουθεί!',
                f1FlagsTitle: 'Είστε καλυμμένος',
                f1FlagsDescription: 'Έχετε ολοκληρώσει όλες τις εκκρεμείς εργασίες.',
            },
        },
        recentlyAddedSection: {
            title: 'Προστέθηκαν πρόσφατα',
            viewAll: 'Προβολή όλων των εξόδων',
            emptyStateTitle: 'Καμία πρόσφατη δαπάνη',
            emptyStateMessage: 'Δημιουργήστε μία ή σύρετε μια απόδειξη εδώ',
        },
        gettingStartedSection: {
            title: 'Ξεκινώντας',
            createWorkspace: 'Δημιουργία χώρου εργασίας',
            connectAccounting: ({integrationName}: {integrationName: string}) => `Συνδεθείτε στο ${integrationName}`,
            connectAccountingDefault: 'Σύνδεση με λογιστική',
            customizeCategories: 'Προσαρμόστε τις λογιστικές κατηγορίες',
            inviteAccountant: 'Προσκαλέστε τον λογιστή σας',
            linkCompanyCards: 'Σύνδεση εταιρικών καρτών',
            issueExpensifyCards: 'Έκδοση καρτών Expensify',
            issueExpensifyCardsSubtitle: 'Προσαρμόστε τους ελέγχους και απλοποιήστε τις δαπάνες',
            setupRules: 'Ρυθμίστε κανόνες δαπανών',
        },
        upcomingTravel: 'Επερχόμενα ταξίδια',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `Πτήση προς ${destination}`,
            trainTo: ({destination}: {destination: string}) => `Τρένο προς ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `Ξενοδοχείο στο ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `Ενοικίαση αυτοκινήτου σε ${destination}`,
            inOneWeek: 'Σε 1 εβδομάδα',
            inDays: () => ({
                one: 'Σε 1 ημέρα',
                other: (count: number) => `Σε ${count} ημέρες`,
            }),
            today: 'Σήμερα',
        },
    },
    allSettingsScreen: {
        subscription: 'Συνδρομή',
        domains: 'Τομείς',
    },
    tabSelector: {
        chat: 'Συνομιλία',
        room: 'Δωμάτιο',
        distance: 'Απόσταση',
        manual: 'Εγχειρίδιο',
        scan: 'Σάρωση',
        map: 'Χάρτης',
        gps: 'GPS',
        odometer: 'Χιλιομετρητής',
    },
    spreadsheet: {
        upload: 'Μεταφορτώστε ένα υπολογιστικό φύλλο',
        import: 'Εισαγωγή υπολογιστικού φύλλου',
        dragAndDrop: '<muted-link>Σύρετε και αποθέστε το υπολογιστικό φύλλο σας εδώ ή επιλέξτε ένα αρχείο παρακάτω. Υποστηριζόμενες μορφές: .csv, .txt, .xls και .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Σύρετε και αποθέστε το υπολογιστικό φύλλο σας εδώ ή επιλέξτε ένα αρχείο παρακάτω. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Μάθετε περισσότερα</a> σχετικά με τους υποστηριζόμενους τύπους αρχείων.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Επιλέξτε ένα αρχείο υπολογιστικού φύλλου για εισαγωγή. Υποστηριζόμενες μορφές: .csv, .txt, .xls και .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Επιλέξτε ένα αρχείο υπολογιστικού φύλλου για εισαγωγή. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Μάθετε περισσότερα</a> σχετικά με τους υποστηριζόμενους τύπους αρχείων.</muted-link>`,
        fileContainsHeader: 'Το αρχείο περιέχει επικεφαλίδες στηλών',
        column: (name: string) => `Στήλη ${name}`,
        fieldNotMapped: (fieldName: string) => `Ουπς! Ένα υποχρεωτικό πεδίο («${fieldName}») δεν έχει αντιστοιχιστεί. Παρακαλούμε ελέγξτε και δοκιμάστε ξανά.`,
        singleFieldMultipleColumns: (fieldName: string) => `Ωχ! Έχετε αντιστοιχίσει ένα μόνο πεδίο («${fieldName}») σε πολλές στήλες. Παρακαλούμε ελέγξτε και δοκιμάστε ξανά.`,
        emptyMappedField: (fieldName: string) => `Ωχ! Το πεδίο («${fieldName}») περιέχει μία ή περισσότερες κενές τιμές. Παρακαλούμε ελέγξτε και δοκιμάστε ξανά.`,
        importSuccessfulTitle: 'Η εισαγωγή ήταν επιτυχής',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'Δεν έχουν προστεθεί ή ενημερωθεί κατηγορίες.';
            }
            if (added && updated) {
                return `${added} ${added === 1 ? 'κατηγορία' : 'κατηγορίες'} προστέθηκαν, ${updated} ${updated === 1 ? 'κατηγορία' : 'κατηγορίες'} ενημερώθηκαν.`;
            }
            if (added) {
                return added === 1 ? 'Προστέθηκε 1 κατηγορία.' : `Προστέθηκαν ${added} κατηγορίες.`;
            }
            return updated === 1 ? 'Έχει ενημερωθεί 1 κατηγορία.' : `Οι ${updated} κατηγορίες έχουν ενημερωθεί.`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `Προστέθηκαν ${transactions} συναλλαγές.` : 'Προστέθηκε 1 συναλλαγή.',
        importCompanyCardTransactionsPendingMessage: 'Οι νέες κάρτες και συναλλαγές μπορεί να χρειαστούν λίγο χρόνο για να εμφανιστούν, παρακαλούμε περιμένετε.',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'Δεν προστέθηκαν ή ενημερώθηκαν μέλη.';
            }
            if (added && updated) {
                return `${added} μέλος${added > 1 ? 'ς' : ''} προστέθηκε, ${updated} μέλος${updated > 1 ? 'ς' : ''} ενημερώθηκε.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} μέλη ενημερώθηκαν.` : 'Ένα μέλος ενημερώθηκε.';
            }
            return added > 1 ? `Προστέθηκαν ${added} μέλη.` : 'Προστέθηκε 1 μέλος.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `Προστέθηκαν ${tags} ετικέτες.` : 'Προστέθηκε 1 ετικέτα.'),
        importMultiLevelTagsSuccessfulDescription: 'Προστέθηκαν ετικέτες πολλαπλών επιπέδων.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `Έχουν προστεθεί ${rates} ημερήσια επιδόματα.` : 'Προστέθηκε 1 ημερήσιο επίδομα.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) => (transactions > 1 ? `Έχουν εισαχθεί ${transactions} συναλλαγές.` : '1 συναλλαγή έχει εισαχθεί.'),
        importFailedTitle: 'Η εισαγωγή απέτυχε',
        importFailedDescription: 'Βεβαιωθείτε ότι όλα τα πεδία έχουν συμπληρωθεί σωστά και δοκιμάστε ξανά. Αν το πρόβλημα συνεχιστεί, επικοινωνήστε με το Concierge.',
        importDescription: 'Επιλέξτε ποια πεδία θα αντιστοιχίσετε από το υπολογιστικό σας φύλλο, κάνοντας κλικ στο αναπτυσσόμενο μενού δίπλα σε κάθε εισαγόμενη στήλη παρακάτω.',
        sizeNotMet: 'Το μέγεθος του αρχείου πρέπει να είναι μεγαλύτερο από 0 byte',
        invalidFileMessage:
            'Το αρχείο που ανεβάσατε είναι είτε κενό είτε περιέχει μη έγκυρα δεδομένα. Βεβαιωθείτε ότι το αρχείο είναι σωστά μορφοποιημένο και περιέχει τις απαραίτητες πληροφορίες πριν το ανεβάσετε ξανά.',
        importSpreadsheetLibraryError: 'Αποτυχία φόρτωσης της μονάδας υπολογιστικού φύλλου. Παρακαλούμε ελέγξτε τη σύνδεσή σας στο διαδίκτυο και δοκιμάστε ξανά.',
        importSpreadsheet: 'Εισαγωγή υπολογιστικού φύλλου',
        downloadCSV: 'Λήψη CSV',
        importMemberConfirmation: () => ({
            one: `Παρακαλούμε επιβεβαιώστε τα παρακάτω στοιχεία για το νέο μέλος του χώρου εργασίας που θα προστεθεί ως μέρος αυτής της αποστολής. Τα υπάρχοντα μέλη δεν θα λάβουν καμία ενημέρωση ρόλου ή μήνυμα πρόσκλησης.`,
            other: (count: number) =>
                `Παρακαλούμε επιβεβαιώστε τα παρακάτω στοιχεία για τα ${count} νέα μέλη του χώρου εργασίας που θα προστεθούν ως μέρος αυτής της μεταφόρτωσης. Τα υπάρχοντα μέλη δεν θα λάβουν ενημερώσεις ρόλων ή μηνύματα πρόσκλησης.`,
        }),
    },
    receipt: {
        upload: 'Μεταφορτώστε απόδειξη',
        uploadMultiple: 'Μεταφορτώστε αποδείξεις',
        desktopSubtitleSingle: `ή σύρετέ το εδώ και αποθέστε το`,
        desktopSubtitleMultiple: `ή σύρετέ τα και αποθέστε τα εδώ`,
        alternativeMethodsTitle: 'Άλλοι τρόποι προσθήκης αποδείξεων:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) =>
            `<label-text><a href="${downloadUrl}">Κατεβάστε την εφαρμογή</a> για να σαρώσετε από το τηλέφωνό σας</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Προωθήστε αποδείξεις στο <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Προσθέστε τον αριθμό σας</a> για να στέλνετε αποδείξεις με SMS στο ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Στείλτε αποδείξεις με μήνυμα στο ${phoneNumber} (μόνο αριθμοί ΗΠΑ)</label-text>`,
        takePhoto: 'Βγάλτε φωτογραφία',
        cameraAccess: 'Απαιτείται πρόσβαση στην κάμερα για να βγάζετε φωτογραφίες των αποδείξεων.',
        deniedCameraAccess: `Η πρόσβαση στην κάμερα δεν έχει ακόμη δοθεί, ακολουθήστε παρακαλώ <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">αυτές τις οδηγίες</a>.`,
        cameraErrorTitle: 'Σφάλμα κάμερας',
        cameraErrorMessage: 'Παρουσιάστηκε σφάλμα κατά τη λήψη φωτογραφίας. Παρακαλώ δοκιμάστε ξανά.',
        locationAccessTitle: 'Να επιτρέπεται η πρόσβαση στην τοποθεσία',
        locationAccessMessage: 'Η πρόσβαση στην τοποθεσία μάς βοηθά να διατηρούμε σωστά τη ζώνη ώρας και το νόμισμά σας, όπου κι αν βρίσκεστε.',
        locationErrorTitle: 'Να επιτρέπεται η πρόσβαση στην τοποθεσία',
        locationErrorMessage: 'Η πρόσβαση στην τοποθεσία μάς βοηθά να διατηρούμε σωστά τη ζώνη ώρας και το νόμισμά σας, όπου κι αν βρίσκεστε.',
        allowLocationFromSetting: `Η πρόσβαση στην τοποθεσία μάς βοηθά να διατηρούμε τη ζώνη ώρας και το νόμισμά σας ακριβή όπου κι αν βρίσκεστε. Παρακαλούμε επιτρέψτε την πρόσβαση στην τοποθεσία από τις ρυθμίσεις δικαιωμάτων της συσκευής σας.`,
        dropTitle: 'Άφησέ το να πάει',
        dropMessage: 'Αποθέστε το αρχείο σας εδώ',
        flash: 'φλας',
        multiScan: 'πολλαπλή σάρωση',
        shutter: 'κλείστρο',
        gallery: 'συλλογή',
        deleteReceipt: 'Διαγραφή απόδειξης',
        deleteConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτήν την απόδειξη;',
        addReceipt: 'Προσθήκη απόδειξης',
        addAdditionalReceipt: 'Προσθέστε επιπλέον απόδειξη',
        scanFailed: 'Η απόδειξη δεν ήταν δυνατό να σαρωθεί, επειδή λείπουν το κατάστημα, η ημερομηνία ή το ποσό.',
        crop: 'Περικοπή',
        addAReceipt: {
            phrase1: 'Προσθήκη απόδειξης',
            phrase2: 'ή σύρετε και αποθέστε ένα εδώ',
        },
    },
    quickAction: {
        scanReceipt: 'Σαρώστε απόδειξη',
        recordDistance: 'Παρακολουθήστε απόσταση',
        requestMoney: 'Δημιουργία δαπάνης',
        perDiem: 'Δημιουργία ημερήσιας αποζημίωσης',
        splitBill: 'Διαίρεση δαπάνης',
        splitScan: 'Διαίρεση απόδειξης',
        splitDistance: 'Διαχωρισμός απόστασης',
        paySomeone: (name?: string) => `Πληρώστε ${name ?? 'κάποιος'}`,
        assignTask: 'Ανάθεση εργασίας',
        header: 'Γρήγορη ενέργεια',
        noLongerHaveReportAccess: 'Δεν έχετε πλέον πρόσβαση στον προηγούμενο προορισμό γρήγορης ενέργειας. Επιλέξτε έναν νέο παρακάτω.',
        updateDestination: 'Ενημέρωση προορισμού',
        createReport: 'Δημιουργία αναφοράς',
        createTimeExpense: 'Δημιουργία χρονοχρέωσης',
    },
    iou: {
        amount: 'Ποσό',
        percent: 'Ποσοστό',
        date: 'Ημερομηνία',
        taxAmount: 'Ποσό φόρου',
        taxRate: 'Φορολογικός συντελεστής',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Έγκριση ${formattedAmount}` : 'Έγκριση'),
        approved: 'Εγκρίθηκε',
        cash: 'Μετρητά',
        card: 'Κάρτα',
        purchase: 'Αγορά',
        split: 'Διαχωρισμός',
        splitExpense: 'Διαίρεση δαπάνης',
        splitDates: 'Διαχωρισμός ημερομηνιών',
        splitDateRange: (startDate: string, endDate: string, count: number) => `${startDate} έως ${endDate} (${count} ημέρες)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `${amount} από ${merchant}`,
        splitByPercentage: 'Διαχωρισμός ανά ποσοστό',
        splitByDate: 'Διαχωρισμός ανά ημερομηνία',
        addSplit: 'Προσθήκη διαχωρισμού',
        makeSplitsEven: 'Κάντε τις διαιρέσεις ίσες',
        editSplits: 'Επεξεργασία διαιρέσεων',
        totalAmountGreaterThanOriginal: (amount: string) => `Το συνολικό ποσό είναι κατά ${amount} μεγαλύτερο από την αρχική δαπάνη.`,
        totalAmountLessThanOriginal: (amount: string) => `Το συνολικό ποσό είναι κατά ${amount} λιγότερο από την αρχική δαπάνη.`,
        splitExpenseZeroAmount: 'Παρακαλώ εισαγάγετε ένα έγκυρο ποσό πριν συνεχίσετε.',
        splitExpenseOneMoreSplit: 'Δεν προστέθηκαν κατανομές. Προσθέστε τουλάχιστον μία για να αποθηκεύσετε.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `Επεξεργαστείτε ${amount} για ${merchant}`,
        removeSplit: 'Αφαίρεση διαχωρισμού',
        splitExpenseCannotBeEditedModalTitle: 'Αυτό η δαπάνη δεν μπορεί να επεξεργαστεί',
        splitExpenseCannotBeEditedModalDescription: 'Δεν είναι δυνατή η επεξεργασία εγκεκριμένων ή πληρωμένων εξόδων',
        paySomeone: (name?: string) => `Πληρώστε ${name ?? 'κάποιος'}`,
        splitExpenseDistanceErrorModalDescription: 'Παρακαλούμε διορθώστε το σφάλμα στο τιμολόγιο απόστασης και δοκιμάστε ξανά.',
        splitExpensePerDiemRateErrorModalDescription: 'Παρακαλούμε διορθώστε το σφάλμα στο ημερήσιο επίδομα και δοκιμάστε ξανά.',
        expense: 'Έξοδο',
        categorize: 'Κατηγοριοποιήστε',
        share: 'Κοινοποίηση',
        participants: 'Συμμετέχοντες',
        createExpense: 'Δημιουργία δαπάνης',
        trackDistance: 'Παρακολουθήστε απόσταση',
        createExpenses: (expensesNumber: number) => `Δημιουργία ${expensesNumber} εξόδων`,
        removeExpense: 'Αφαίρεση δαπάνης',
        removeThisExpense: 'Καταργήστε αυτήν τη δαπάνη',
        removeExpenseConfirmation: 'Είστε βέβαιοι ότι θέλετε να αφαιρέσετε αυτήν την απόδειξη; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.',
        addExpense: 'Προσθέστε δαπάνη',
        chooseRecipient: 'Επιλέξτε παραλήπτη',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Δημιουργία εξόδου ${amount}`,
        confirmDetails: 'Επιβεβαιώστε τα στοιχεία',
        pay: 'Πληρωμή',
        cancelPayment: 'Ακύρωση πληρωμής',
        cancelPaymentConfirmation: 'Είστε βέβαιοι ότι θέλετε να ακυρώσετε αυτήν την πληρωμή;',
        viewDetails: 'Προβολή λεπτομερειών',
        pending: 'Σε εκκρεμότητα',
        canceled: 'Ακυρώθηκε',
        posted: 'Καταχωρισμένο',
        deleteReceipt: 'Διαγραφή απόδειξης',
        findExpense: 'Εύρεση δαπάνης',
        deletedTransaction: (amount: string, merchant: string) => `διέγραψε μια δαπάνη (${amount} για ${merchant})`,
        movedFromReport: (reportName: string) => `μετακίνησε μία δαπάνη από το ${reportName}`,
        movedFromReportNoName: 'μετακινήθηκε μία δαπάνη',
        movedTransactionTo: (reportUrl: string, reportName: string) => `μετακίνησε αυτήν την δαπάνη στο <a href="${reportUrl}">${reportName}</a>`,
        movedTransactionToAnotherReport: 'μετέφερε αυτή τη δαπάνη σε άλλη αναφορά',
        movedTransactionFrom: (reportUrl: string, reportName: string) => `μετέφερε αυτή την δαπάνη από την αναφορά <a href="${reportUrl}">${reportName}</a>`,
        movedTransactionFromAnotherReport: 'μετακίνησε αυτήν τη δαπάνη από άλλη αναφορά',
        unreportedTransaction: (reportUrl: string) => `μετέφερε αυτήν την δαπάνη στον <a href="${reportUrl}">προσωπικό σας χώρο</a>`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `μετέφερε αυτήν την αναφορά στον χώρο εργασίας <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `μετέφερε αυτήν την <a href="${movedReportUrl}">αναφορά</a> στον χώρο εργασίας <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Η απόδειξη εκκρεμεί για αντιστοίχιση με συναλλαγή κάρτας',
        pendingMatch: 'Εκκρεμής αντιστοίχιση',
        pendingMatchWithCreditCardDescription: 'Η απόδειξη εκκρεμεί για αντιστοίχιση με συναλλαγή κάρτας. Επισημάνετε την ως μετρητά για ακύρωση.',
        markAsCash: 'Σήμανση ως μετρητά',
        pendingMatchSubmitTitle: 'Υποβολή αναφοράς',
        pendingMatchSubmitDescription: 'Κάποιες δαπάνες αναμένουν αντιστοίχιση με συναλλαγή πιστωτικής κάρτας. Θέλετε να τις σημάνετε ως μετρητά;',
        routePending: 'Εκκρεμεί προώθηση διαδρομής...',
        automaticallyEnterExpenseDetails: 'Το Concierge θα συμπληρώσει τις λεπτομέρειες για εσάς.',
        receiptScanning: () => ({
            one: 'Σάρωση απόδειξης...',
            other: 'Σάρωση αποδείξεων...',
        }),
        scanMultipleReceipts: 'Σαρώστε πολλές αποδείξεις',
        scanMultipleReceiptsDescription: 'Βγάλτε φωτογραφία όλες τις αποδείξεις σας ταυτόχρονα και μετά επιβεβαιώστε οι ίδιοι τα στοιχεία ή αφήστε μας να το κάνουμε για εσάς.',
        receiptScanInProgress: 'Σάρωση απόδειξης σε εξέλιξη',
        receiptScanInProgressDescription: 'Σάρωση απόδειξης σε εξέλιξη. Επιστρέψτε αργότερα ή εισαγάγετε τώρα τα στοιχεία.',
        removeFromReport: 'Αφαίρεση από αναφορά',
        moveToPersonalSpace: 'Μεταφέρετε τα έξοδα στον προσωπικό σας χώρο',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Εντοπίστηκαν πιθανά διπλά έξοδα. Ελέγξτε τα διπλότυπα για να ενεργοποιήσετε την υποβολή.'
                : 'Εντοπίστηκαν πιθανά διπλά έξοδα. Εξετάστε τα διπλότυπα για να επιτρέψετε την έγκριση.',
        receiptIssuesFound: () => ({
            one: 'Βρέθηκε πρόβλημα',
            other: 'Βρέθηκαν προβλήματα',
        }),
        fieldPending: 'Σε εκκρεμότητα...',
        defaultRate: 'Προεπιλεγμένη χρέωση',
        receiptMissingDetails: 'Λείπουν στοιχεία από την απόδειξη',
        missingAmount: 'Λείπει ποσό',
        missingMerchant: 'Λείπει ο έμπορος',
        receiptStatusTitle: 'Σάρωση…',
        receiptStatusText: 'Μόνο εσείς μπορείτε να δείτε αυτήν την απόδειξη όσο σαρώνεται. Επιστρέψτε αργότερα ή εισαγάγετε τώρα τα στοιχεία.',
        receiptScanningFailed: 'Η σάρωση απόδειξης απέτυχε. Παρακαλούμε εισαγάγετε τα στοιχεία χειροκίνητα.',
        allTransactionsPendingNextStep: 'Όλες οι συναλλαγές εκκρεμούν. Δεν μπορείτε να υποβάλετε αυτήν την αναφορά μέχρι να καταχωριστούν σε λίγες ημέρες.',
        companyInfo: 'Πληροφορίες εταιρείας',
        companyInfoDescription: 'Χρειαζόμαστε λίγες ακόμη λεπτομέρειες πριν μπορέσετε να στείλετε το πρώτο σας τιμολόγιο.',
        yourCompanyName: 'Όνομα της εταιρείας σας',
        yourCompanyWebsite: 'Ιστότοπος της εταιρείας σας',
        yourCompanyWebsiteNote: 'Αν δεν έχετε ιστοσελίδα, μπορείτε αντί γι’ αυτό να δώσετε το προφίλ της εταιρείας σας στο LinkedIn ή σε κάποιο μέσο κοινωνικής δικτύωσης.',
        invalidDomainError: 'Έχετε εισαγάγει μη έγκυρο τομέα. Για να συνεχίσετε, παρακαλούμε εισαγάγετε έναν έγκυρο τομέα.',
        publicDomainError: 'Έχετε εισαγάγει ένα δημόσιο domain. Για να συνεχίσετε, παρακαλούμε εισαγάγετε ένα ιδιωτικό domain.',
        expenseCount: () => {
            return {
                one: '1 δαπάνη',
                other: (count: number) => `${count} δαπάνες`,
            };
        },
        deleteExpense: () => ({
            one: 'Διαγραφή δαπάνης',
            other: 'Διαγραφή εξόδων',
        }),
        deleteConfirmation: () => ({
            one: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτήν την δαπάνη;',
            other: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτές τις δαπάνες;',
        }),
        deletePendingExpense: 'Διαγράψτε την εκκρεμή δαπάνη',
        deleteConfirmationPendingBYOC: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την δαπάνη; Είναι σε εκκρεμότητα και ίσως την εισαγάγουμε ξανά αν καταχωριστεί.',
        deleteConfirmationSomePendingBYOC: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτές τις δαπάνες; Μερικές από αυτές εκκρεμούν και ενδέχεται να τις εισαγάγουμε ξανά αν καταχωριστούν.',
        deleteReport: () => ({
            one: 'Διαγραφή αναφοράς',
            other: 'Διαγραφή αναφορών',
        }),
        deleteReportConfirmation: () => ({
            one: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτήν την αναφορά;',
            other: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτές τις αναφορές;',
        }),
        settledExpensify: 'Πληρωμένο',
        paidStatusMarkedAsPaid: 'Επισημάνθηκε ως πληρωμένο',
        paidStatusWithdrawing: 'Ανάληψη',
        paidStatusConfirmed: 'Επιβεβαιώθηκε',
        done: 'Ολοκληρώθηκε',
        deleted: 'Διαγράφηκε',
        settledElsewhere: 'Πληρωμή αλλού',
        individual: 'Ιδιώτης',
        business: 'Επιχείρηση',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `Πληρώστε ${formattedAmount} ως ιδιώτης` : `Πληρώστε με προσωπικό λογαριασμό`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `Πληρώστε ${formattedAmount} με το πορτοφόλι` : `Πληρωμή με πορτοφόλι`),
        settlePayment: (formattedAmount: string) => `Πληρώστε ${formattedAmount}`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `Πληρώστε ${formattedAmount} ως επιχείρηση` : `Πληρωμή με επαγγελματικό λογαριασμό`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `Επισήμανση ${formattedAmount} ως πληρωμένου` : `Σήμανση ως πληρωμένο`),
        confirmPaymentReceivedModalTitle: 'Επιβεβαιώστε την παραλαβή πληρωμής',
        receivedPayment: 'Λήφθηκε πληρωμή',
        receivedPaymentReportAction: (payer?: string) => `${payer ? `${payer} ` : ''}έλαβε πληρωμή`,
        receivedPaymentConfirmation: 'Συνεχίστε μόνο αν έχετε ήδη λάβει την πληρωμή εκτός Expensify.',
        confirmReceivedPayment: 'Ναι, έλαβα την πληρωμή',
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `πληρώθηκε ${amount} με προσωπικό λογαριασμό ${last4Digits}` : `Πληρώθηκε με προσωπικό λογαριασμό`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `πληρώθηκε ${amount} με επαγγελματικό λογαριασμό ${last4Digits}` : `Πληρωμή με επαγγελματικό λογαριασμό`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `Πληρώστε ${formattedAmount} μέσω ${policyName}` : `Πληρωμή μέσω ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) =>
            amount ? `πληρώθηκε ${amount} με τραπεζικό λογαριασμό ${last4Digits}` : `πληρώθηκε με τραπεζικό λογαριασμό ${last4Digits}`,
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `πληρώθηκε ${amount ? `${amount} ` : ''}με τραπεζικό λογαριασμό ${last4Digits} μέσω των <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">κανόνων χώρου εργασίας</a>`,
        invoicePersonalBank: (lastFour: string) => `Προσωπικός λογαριασμός • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Επαγγελματικός λογαριασμός • ${lastFour}`,
        nextStep: 'Επόμενα βήματα',
        finished: 'Ολοκληρώθηκε',
        flip: 'Αναστροφή',
        sendInvoice: (amount: string) => `Αποστολή τιμολογίου ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `για ${comment}` : ''}`,
        submitted: (memo?: string) => `υποβλήθηκε${memo ? `, λέγοντας ${memo}` : ''}`,
        markedAsDone: (memo?: string) => `σημειώθηκε ως ολοκληρωμένο${memo ? `, λέγοντας ${memo}` : ''}`,
        automaticallySubmitted: `υποβλήθηκε μέσω των <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">καθυστερημένων υποβολών</a>`,
        queuedToSubmitViaDEW: 'σε αναμονή για υποβολή μέσω προσαρμοσμένης ροής έγκρισης',
        failedToAutoSubmitViaDEW: (reason: string) => `αποτυχία υποβολής της αναφοράς μέσω της επιλογής <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">καθυστέρηση υποβολών</a>. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `αδυναμία υποβολής της αναφοράς. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `αποτυχία έγκρισης μέσω των <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">κανόνων χώρου εργασίας</a>. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `αποτυχία έγκρισης. ${reason}`,
        queuedToApproveViaDEW: 'σε αναμονή για έγκριση μέσω προσαρμοσμένης ροής έγκρισης',
        trackedAmount: (formattedAmount: string, comment?: string) => `παρακολούθηση ${formattedAmount}${comment ? `για ${comment}` : ''}`,
        splitAmount: (amount: string) => `διαχωρίστε ${amount}`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `διαχωρισμός ${formattedAmount}${comment ? `για ${comment}` : ''}`,
        yourSplit: (amount: string) => `Το μερίδιό σας ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} οφείλει ${amount}${comment ? `για ${comment}` : ''}`,
        payerOwes: (payer: string) => `${payer} οφείλει:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}πλήρωσε ${amount}`,
        payerPaid: (payer: string) => `${payer} πλήρωσε:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} ξόδεψε ${amount}`,
        payerSpent: (payer: string) => `${payer} δαπάνησε:`,
        managerApproved: (manager: string) => `${manager} ενέκρινε:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `Ο/Η ${manager} ενέκρινε ${amount}`,
        payerSettled: (amount: number | string) => `πληρώθηκαν ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `πληρώθηκαν ${amount}. Προσθέστε έναν τραπεζικό λογαριασμό για να λάβετε την πληρωμή σας.`,
        automaticallyApproved: `εγκρίθηκε μέσω των <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">κανόνων χώρου εργασίας</a>`,
        approvedAmount: (amount: number | string) => `εγκρίθηκε ${amount}`,
        approvedMessage: `εγκεκριμένο`,
        unapproved: `μη εγκεκριμένο`,
        automaticallyForwarded: `εγκρίθηκε μέσω των <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">κανόνων χώρου εργασίας</a>`,
        forwarded: (memo?: string) => `εγκρίθηκε${memo ? `, λέγοντας ${memo}` : ''}`,
        rejectedThisReport: 'απορρίφθηκε',
        waitingOnBankAccount: (submitterDisplayName: string) => `ξεκίνησε την πληρωμή, αλλά περιμένει τον/την ${submitterDisplayName} να προσθέσει έναν τραπεζικό λογαριασμό.`,
        adminCanceledRequest: 'ακύρωσε την πληρωμή',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `ακύρωσε την πληρωμή των ${amount}, επειδή ο/η ${submitterDisplayName} δεν ενεργοποίησε το Expensify Wallet του/της μέσα σε 30 ημέρες`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) =>
            `Ο/Η ${submitterDisplayName} πρόσθεσε έναν τραπεζικό λογαριασμό. Η πληρωμή των ${amount} ολοκληρώθηκε.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}επισημάνθηκε ως πληρωμένο${comment ? `, λέγοντας «${comment}»` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}πληρώθηκε με πορτοφόλι`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}πληρώθηκε με το Expensify μέσω των <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">κανόνων χώρου εργασίας</a>`,
        reimbursedThisReport: 'πλήρωσε αυτήν την αναφορά',
        paidThisBill: 'πλήρωσε αυτόν τον λογαριασμό',
        reimbursedOnBehalfOf: (actor: string) => `εκ μέρους του/της ${actor}`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `από τον τραπεζικό λογαριασμό που λήγει σε ${debitBankAccount}`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `${submitter} πρόσθεσε έναν τραπεζικό λογαριασμό, αφαιρώντας την αναφορά από την αναμονή. Η αποζημίωση ξεκίνησε`,
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
                ? `. Τα χρήματα κατευθύνονται προς τον/την/το ${creditBankAccount ? `τραπεζικός λογαριασμός που λήγει σε ${creditBankAccount}` : 'λογαριασμός'}. Η αποζημίωση εκτιμάται ότι θα ολοκληρωθεί στις ${expectedDate}.`
                : `. Τα χρήματα είναι καθ’ οδόν προς τον/την ${submitterLogin}${creditBankAccount ? `τραπεζικός λογαριασμός που λήγει σε ${creditBankAccount}` : 'λογαριασμός'}. Η αποζημίωση εκτιμάται ότι θα ολοκληρωθεί στις ${expectedDate}.`,
        reimbursedWithCheck: 'με επιταγή.',
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
            const paymentMethod = isCard ? 'κάρτα' : 'τραπεζικός λογαριασμός';
            return isCurrentUser
                ? `. Τα χρήματα κατευθύνονται προς τον/την ${creditBankAccount ? `τραπεζικός λογαριασμός που λήγει σε ${creditBankAccount}` : 'λογαριασμός'} σας (πληρωμή μέσω ${paymentMethod}). Αυτό μπορεί να πάρει έως και 10 εργάσιμες ημέρες.`
                : `. Τα χρήματα είναι καθ' οδόν προς τον/την ${submitterLogin}${creditBankAccount ? `τραπεζικός λογαριασμός που λήγει σε ${creditBankAccount}` : 'λογαριασμός'} (πληρωμή μέσω ${paymentMethod}). Αυτό μπορεί να χρειαστεί έως και 10 εργάσιμες ημέρες.`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `με άμεση κατάθεση (ACH)${creditBankAccount ? `στον τραπεζικό λογαριασμό που λήγει σε ${creditBankAccount}.` : '. '}${expectedDate ? `Η αποζημίωση εκτιμάται ότι θα ολοκληρωθεί έως ${expectedDate}.` : 'Αυτό συνήθως διαρκεί 4–5 εργάσιμες ημέρες.'}`,
        noReimbursableExpenses: 'Αυτή η αναφορά έχει μη έγκυρο ποσό',
        pendingConversionMessage: 'Το σύνολο θα ενημερωθεί όταν είστε ξανά συνδεδεμένοι στο διαδίκτυο',
        changedTheExpense: 'τροποποίησε την δαπάνη',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `η τιμή ${valueName} σε ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `ορίστηκε το ${translatedChangedField} σε ${newMerchant}, το οποίο όρισε το ποσό σε ${newAmountToDisplay}`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `το ${valueName} (προηγουμένως ${oldValueToDisplay})`,
        updatedTheRequest: (valueName: string, newValueToDisplay: string, oldValueToDisplay: string) => `το ${valueName} σε ${newValueToDisplay} (προηγουμένως ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, oldMerchant: string, newAmountToDisplay: string, oldAmountToDisplay: string) =>
            `άλλαξε το ${translatedChangedField} σε ${newMerchant} (προηγουμένως ${oldMerchant}), κάτι που ενημέρωσε το ποσό σε ${newAmountToDisplay} (προηγουμένως ${oldAmountToDisplay})`,
        basedOnAI: 'βάσει προηγούμενης δραστηριότητας',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `βάσει των <a href="${rulesLink}">κανόνων του χώρου εργασίας</a>` : 'βάσει κανόνα χώρου εργασίας'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `για ${comment}` : 'δαπάνη'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Αναφορά τιμολογίου #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `στάλθηκαν ${formattedAmount}${comment ? `για ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) =>
            `μετακινήθηκε η δαπάνη από τον προσωπικό χώρο στο ${workspaceName ?? `συνομιλήστε με τον/την ${reportName}`}`,
        movedToPersonalSpace: 'μετακινήθηκε η δαπάνη στον προσωπικό χώρο',
        error: {
            invalidCategoryLength: 'Το όνομα της κατηγορίας υπερβαίνει τους 255 χαρακτήρες. Συντομεύστε το ή επιλέξτε μια άλλη κατηγορία.',
            invalidTagLength: 'Το όνομα της ετικέτας υπερβαίνει τους 255 χαρακτήρες. Παρακαλούμε συντομεύστε το ή επιλέξτε μια διαφορετική ετικέτα.',
            invalidAmount: 'Παρακαλούμε εισαγάγετε ένα έγκυρο ποσό πριν συνεχίσετε',
            invalidDistance: 'Παρακαλούμε εισαγάγετε μια έγκυρη απόσταση πριν συνεχίσετε',
            invalidReadings: 'Παρακαλούμε εισαγάγετε και τις ενδείξεις έναρξης και λήξης για να συνεχίσετε',
            negativeDistanceNotAllowed: 'Η τελική ένδειξη πρέπει να είναι μεγαλύτερη από την αρχική ένδειξη',
            distanceAmountTooLarge: 'Το συνολικό ποσό είναι υπερβολικά μεγάλο. Μειώστε την απόσταση ή χαμηλώστε την τιμή.',
            distanceAmountTooLargeReduceDistance: 'Το συνολικό ποσό είναι υπερβολικά μεγάλο. Μειώστε την απόσταση.',
            distanceAmountTooLargeReduceRate: 'Το συνολικό ποσό είναι υπερβολικά μεγάλο. Μειώστε το ποσοστό.',
            odometerReadingTooLarge: (formattedMax: string) => `Οι μετρήσεις χιλιομετρητή δεν μπορούν να υπερβαίνουν τα ${formattedMax}.`,
            stitchOdometerImagesFailed: 'Αποτυχία συνδυασμού των εικόνων οδομέτρου. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
            unableToSubmitReport: 'Δεν είναι δυνατή η υποβολή της αναφοράς',
            allTransactionsPendingDescription:
                'Δεν μπορείτε να υποβάλετε αυτήν την αναφορά, επειδή όλες οι συναλλαγές είναι σε εκκρεμότητα. Μπορεί να χρειαστούν λίγες ημέρες για να καταχωριστούν.',
            failedToSaveOdometerDraft: 'Δεν ήταν δυνατή η αποθήκευση του πρόχειρου χιλιομετρητή σας. Παρακαλούμε δοκιμάστε ξανά.',
            invalidIntegerAmount: 'Παρακαλούμε εισαγάγετε ένα ακέραιο ποσό σε δολάρια πριν συνεχίσετε',
            invalidTaxAmount: (amount: string) => `Το μέγιστο ποσό φόρου είναι ${amount}`,
            invalidSplit: 'Το άθροισμα των επιμερισμών πρέπει να ισούται με το συνολικό ποσό',
            invalidSplitParticipants: 'Παρακαλούμε εισαγάγετε ποσό μεγαλύτερο από το μηδέν για τουλάχιστον δύο συμμετέχοντες',
            invalidSplitYourself: 'Παρακαλούμε εισαγάγετε ένα μη μηδενικό ποσό για τη διαίρεσή σας',
            noParticipantSelected: 'Παρακαλούμε επιλέξτε έναν συμμετέχοντα',
            other: 'Απρόσμενο σφάλμα. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
            genericCreateFailureMessage: 'Μη αναμενόμενο σφάλμα κατά την αποστολή αυτής της δαπάνης. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
            genericCreateInvoiceFailureMessage: 'Προέκυψε απροσδόκητο σφάλμα κατά την αποστολή αυτού του τιμολογίου. Παρακαλούμε προσπαθήστε ξανά αργότερα.',
            genericHoldExpenseFailureMessage: 'Προέκυψε απρόσμενο σφάλμα κατά την κράτηση αυτής της δαπάνης. Δοκιμάστε ξανά αργότερα.',
            genericUnholdExpenseFailureMessage: 'Προέκυψε απρόσμενο σφάλμα κατά την αφαίρεση αυτής της δαπάνης από την αναμονή. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
            receiptDeleteFailureError: 'Μη αναμενόμενο σφάλμα κατά τη διαγραφή αυτής της απόδειξης. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
            receiptFailureMessage:
                '<rbr>Προέκυψε σφάλμα κατά τη μεταφόρτωση της απόδειξής σας. Παρακαλούμε <a href="download">αποθηκεύστε την απόδειξη</a> και <a href="retry">δοκιμάστε ξανά</a> αργότερα.</rbr>',
            receiptFailureMessageShort: 'Παρουσιάστηκε σφάλμα κατά τη μεταφόρτωση της απόδειξής σας.',
            receiptUploadFailedMessage: 'Η αποστολή της απόδειξης απέτυχε. Αποθηκεύστε την απόδειξη ή διαγράψτε την δαπάνη και χάστε την.',
            saveReceipt: 'Αποθήκευση απόδειξης',
            genericDeleteFailureMessage: 'Παρουσιάστηκε απρόσμενο σφάλμα κατά τη διαγραφή αυτής της δαπάνης. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
            genericEditFailureMessage: 'Παρουσιάστηκε απροσδόκητο σφάλμα κατά την επεξεργασία αυτής της δαπάνης. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
            genericSmartscanFailureMessage: 'Λείπουν πεδία από τη συναλλαγή',
            duplicateWaypointsErrorMessage: 'Παρακαλώ αφαιρέστε τα διπλά σημεία πορείας',
            atLeastTwoDifferentWaypoints: 'Παρακαλούμε εισαγάγετε τουλάχιστον δύο διαφορετικές διευθύνσεις',
            splitExpenseMultipleParticipantsErrorMessage: 'Μια δαπάνη δεν μπορεί να κατανεμηθεί μεταξύ ενός χώρου εργασίας και άλλων μελών. Παρακαλούμε ενημερώστε την επιλογή σας.',
            invalidMerchant: 'Παρακαλούμε εισαγάγετε έγκυρο έμπορο',
            atLeastOneAttendee: 'Πρέπει να επιλεγεί τουλάχιστον ένας συμμετέχων',
            invalidQuantity: 'Παρακαλούμε εισαγάγετε μια έγκυρη ποσότητα',
            quantityGreaterThanZero: 'Η ποσότητα πρέπει να είναι μεγαλύτερη από το μηδέν',
            invalidSubrateLength: 'Πρέπει να υπάρχει τουλάχιστον ένα υποποσό',
            invalidRate: 'Η τιμή δεν είναι έγκυρη για αυτόν τον χώρο εργασίας. Παρακαλούμε επιλέξτε μια διαθέσιμη τιμή από τον χώρο εργασίας.',
            endDateBeforeStartDate: 'Η ημερομηνία λήξης δεν μπορεί να είναι πριν από την ημερομηνία έναρξης',
            endDateSameAsStartDate: 'Η ημερομηνία λήξης δεν μπορεί να είναι ίδια με την ημερομηνία έναρξης',
            manySplitsProvided: `Ο μέγιστος επιτρεπόμενος αριθμός διαχωρισμών είναι ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Το εύρος ημερομηνιών δεν μπορεί να υπερβαίνει τις ${CONST.IOU.SPLITS_LIMIT} ημέρες.`,
        },
        dismissReceiptError: 'Απόρριψη σφάλματος',
        dismissReceiptErrorConfirmation: 'Προσοχή! Αν απορρίψετε αυτό το σφάλμα, η ανεβασμένη απόδειξή σας θα διαγραφεί πλήρως. Είστε βέβαιοι;',
        waitingOnEnabledWallet: (submitterDisplayName: string) =>
            `ξεκίνησε τη διαδικασία τακτοποίησης. Η πληρωμή έχει τεθεί σε αναμονή μέχρι ο/η ${submitterDisplayName} να ενεργοποιήσει το πορτοφόλι του/της.`,
        enableWallet: 'Ενεργοποίηση πορτοφολιού',
        hold: 'Σε αναμονή',
        unhold: 'Αφαίρεση κράτησης',
        holdExpense: () => ({
            one: 'Αναστολή δαπάνης',
            other: 'Αναστολή εξόδων',
        }),
        unholdExpense: 'Άρση παγώματος δαπάνης',
        heldExpense: 'κράτησε αυτή την δαπάνη',
        unheldExpense: 'άραρε αυτή την δαπάνη',
        moveUnreportedExpense: 'Μετακίνηση μη καταγεγραμμένης δαπάνης',
        addExistingExpense: 'Προσθήκη υπάρχοντος εξόδου',
        selectExistingExpense: 'Επιλέξτε τουλάχιστον μία δαπάνη για να την προσθέσετε στην αναφορά.',
        emptyStateExistingExpenseTitle: 'Δεν υπάρχουν υπάρχοντα έξοδα',
        emptyStateExistingExpenseSubtitle: 'Φαίνεται πως δεν έχετε καμία υπάρχουσα δαπάνη. Δοκιμάστε να δημιουργήσετε μία παρακάτω.',
        addExistingExpenseConfirm: 'Προσθήκη στην αναφορά',
        newReport: 'Νέα αναφορά',
        explainHold: () => ({
            one: 'Εξηγήστε γιατί κρατάτε αυτή την δαπάνη σε εκκρεμότητα.',
            other: 'Εξηγήστε γιατί κρατάτε αυτές τις δαπάνες.',
        }),
        explainHoldApprover: () => ({
            one: 'Εξηγήστε τι χρειάζεστε πριν εγκρίνετε αυτή την δαπάνη.',
            other: 'Εξηγήστε τι χρειάζεστε πριν εγκρίνετε αυτές τις δαπάνες.',
        }),
        retracted: 'ανακλήθηκε',
        retract: 'Ανακαλέστε',
        reopened: 'άνοιξε ξανά',
        reopenReport: 'Ξανανοίξτε την αναφορά',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Αυτή η αναφορά έχει ήδη εξαχθεί στο ${connectionName}. Η τροποποίησή της μπορεί να οδηγήσει σε αναντιστοιχίες δεδομένων. Είστε βέβαιοι ότι θέλετε να την ανοίξετε ξανά;`,
        reason: 'Αιτία',
        holdReasonRequired: 'Απαιτείται αιτιολογία όταν γίνεται κράτηση.',
        expenseWasPutOnHold: 'Το έξοδο τέθηκε σε αναμονή',
        expenseOnHold: 'Αυτή η δαπάνη τέθηκε σε αναμονή. Παρακαλούμε ελέγξτε τα σχόλια για τα επόμενα βήματα.',
        expensesOnHold: 'Όλες οι δαπάνες τέθηκαν σε αναμονή. Παρακαλούμε ελέγξτε τα σχόλια για τα επόμενα βήματα.',
        expenseDuplicate: 'Αυτή η δαπάνη έχει παρόμοιες λεπτομέρειες με μία άλλη. Παρακαλούμε ελέγξτε τα διπλότυπα για να συνεχίσετε.',
        someDuplicatesArePaid: 'Κάποια από αυτά τα διπλότυπα έχουν ήδη εγκριθεί ή πληρωθεί.',
        reviewDuplicates: 'Ελέγξτε τα διπλότυπα',
        keepAll: 'Διατήρηση όλων',
        keepSelected: 'Διατήρηση επιλογής',
        noDuplicatesTitle: 'Όλα έτοιμα!',
        noDuplicatesDescription: 'Δεν υπάρχουν διπλές συναλλαγές για έλεγχο εδώ.',
        confirmApprove: 'Επιβεβαιώστε το ποσό έγκρισης',
        confirmApprovalAmount: 'Εγκρίνετε μόνο τις σύμφωνες δαπάνες ή εγκρίνετε ολόκληρη την αναφορά.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Αυτή η δαπάνη είναι σε αναμονή. Θέλετε παρ’ όλα αυτά να την εγκρίνετε;',
            other: 'Αυτές οι δαπάνες έχουν τεθεί σε αναμονή. Θέλετε να εγκρίνετε ούτως ή άλλως;',
        }),
        confirmPay: 'Επιβεβαιώστε το ποσό πληρωμής',
        confirmPayAmount: 'Πληρώστε ό,τι δεν είναι σε αναμονή ή πληρώστε ολόκληρη την αναφορά.',
        confirmPayAllHoldAmount: () => ({
            one: 'Αυτή η δαπάνη έχει τεθεί σε αναμονή. Θέλετε να την πληρώσετε παρ’ όλα αυτά;',
            other: 'Αυτές οι δαπάνες έχουν τεθεί σε αναμονή. Θέλετε να πληρώσετε παρ’ όλα αυτά;',
        }),
        payOnly: 'Πληρώστε μόνο',
        approveOnly: 'Μόνο έγκριση',
        holdEducationalTitle: 'Πρέπει να κρατήσετε αυτή τη δαπάνη σε αναμονή;',
        whatIsHoldExplain: 'Η αναμονή είναι σαν να πατάτε «παύση» σε μια δαπάνη, μέχρι να είστε έτοιμοι να την υποβάλετε.',
        holdIsLeftBehind: 'Οι δεσμευμένες δαπάνες παραμένουν εκτός, ακόμη κι αν υποβάλετε ολόκληρη την αναφορά.',
        unholdWhenReady: 'Απελευθερώστε τις δαπάνες όταν είστε έτοιμοι να τις υποβάλετε.',
        changePolicyEducational: {
            title: 'Μετακινήσατε αυτήν την αναφορά!',
            description: 'Ελέγξτε προσεκτικά αυτά τα στοιχεία, τα οποία τείνουν να αλλάζουν όταν μεταφέρετε αναφορές σε νέο χώρο εργασίας.',
            reCategorize: '<strong>Επαναταξινομήστε τυχόν δαπάνες</strong> ώστε να συμμορφώνονται με τους κανόνες του χώρου εργασίας.',
            workflows: 'Αυτή η αναφορά ενδέχεται πλέον να υπόκειται σε διαφορετική <strong>ροή έγκρισης.</strong>',
        },
        changeWorkspace: 'Αλλαγή χώρου εργασίας',
        set: 'ορισμός',
        changed: 'αλλάχθηκε',
        removed: 'καταργήθηκε',
        transactionPending: 'Η συναλλαγή εκκρεμεί.',
        chooseARate: 'Επιλέξτε ένα ωριαίο επιτόκιο αποζημίωσης χώρου εργασίας ανά μίλι ή χιλιόμετρο',
        rateValidDateRange: ({startDate, endDate}: {startDate: string; endDate: string}) => `${startDate} έως ${endDate}`,
        rateValidFrom: ({startDate}: {startDate: string}) => `Ισχύει από ${startDate}`,
        rateValidUntil: ({endDate}: {endDate: string}) => `Ισχύει έως ${endDate}`,
        unapprove: 'Ανακαλέστε έγκριση',
        unapproveReport: 'Αναίρεση έγκρισης αναφοράς',
        headsUp: 'Προσοχή!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `Αυτή η αναφορά έχει ήδη εξαχθεί στο ${accountingIntegration}. Η αλλαγή της μπορεί να οδηγήσει σε αναντιστοιχίες δεδομένων. Είστε βέβαιοι ότι θέλετε να άρετε την έγκριση αυτής της αναφοράς;`,
        reimbursable: 'επιστρέψιμο',
        nonReimbursable: 'μη αποζημιώσιμα',
        bookingPending: 'Η κράτηση εκκρεμεί',
        bookingPendingDescription: 'Αυτή η κράτηση εκκρεμεί επειδή δεν έχει πληρωθεί ακόμη.',
        bookingArchived: 'Αυτή η κράτηση έχει αρχειοθετηθεί',
        bookingArchivedDescription: 'Αυτή η κράτηση έχει αρχειοθετηθεί επειδή η ημερομηνία ταξιδιού έχει περάσει. Προσθέστε μια δαπάνη για το τελικό ποσό, αν χρειάζεται.',
        attendees: 'Συμμετέχοντες',
        totalPerAttendee: 'Ανά συμμετέχοντα',
        whoIsYourAccountant: 'Ποιος είναι ο λογιστής σας;',
        paymentComplete: 'Η πληρωμή ολοκληρώθηκε',
        time: 'Ώρα',
        startDate: 'Ημερομηνία έναρξης',
        endDate: 'Ημερομηνία λήξης',
        startTime: 'Ώρα έναρξης',
        endTime: 'Ώρα λήξης',
        deleteSubrate: 'Διαγραφή υποτιμής',
        deleteSubrateConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την υποκατηγορία;',
        quantity: 'Ποσότητα',
        subrateSelection: 'Επιλέξτε μια υποτιμή και εισαγάγετε μια ποσότητα.',
        qty: 'Ποσότητα',
        firstDayText: () => ({
            one: `Πρώτη μέρα: 1 ώρα`,
            other: (count: number) => `Πρώτη ημέρα: ${count.toFixed(2)} ώρες`,
        }),
        lastDayText: () => ({
            one: `Τελευταία ημέρα: 1 ώρα`,
            other: (count: number) => `Τελευταία ημέρα: ${count.toFixed(2)} ώρες`,
        }),
        tripLengthText: () => ({
            one: `Ταξίδι: 1 πλήρης ημέρα`,
            other: (count: number) => `Ταξίδι: ${count} πλήρεις ημέρες`,
        }),
        dates: 'Ημερομηνίες',
        rates: 'Χρεώσεις',
        submitsTo: (name: string) => `Υποβάλλεται σε ${name}`,
        reject: {
            educationalTitle: 'Να το κρατήσετε ή να το απορρίψετε;',
            educationalText: 'Αν δεν είστε έτοιμοι να εγκρίνετε ή να πληρώσετε μια δαπάνη, μπορείτε να την θέσετε σε εκκρεμότητα ή να την απορρίψετε.',
            holdExpenseTitle: 'Κρατήστε μια δαπάνη σε εκκρεμότητα για να ζητήσετε περισσότερες λεπτομέρειες πριν από την έγκριση ή την πληρωμή.',
            approveExpenseTitle: 'Εγκρίνετε άλλες δαπάνες, ενώ οι δεσμευμένες δαπάνες παραμένουν ανατεθειμένες σε εσάς.',
            heldExpenseLeftBehindTitle: 'Οι δεσμευμένες δαπάνες αφήνονται εκτός όταν εγκρίνετε ολόκληρη την αναφορά.',
            rejectExpenseTitle: 'Απορρίψτε μια δαπάνη που δεν σκοπεύετε να εγκρίνετε ή να πληρώσετε.',
            reasonPageTitle: 'Απόρριψη δαπάνης',
            reasonPageDescription: 'Εξηγήστε γιατί δεν θα εγκρίνετε αυτήν την δαπάνη.',
            rejectReason: 'Λόγος απόρριψης',
            markAsResolved: 'Σήμανση ως επιλυμένο',
            rejectedStatus: 'Αυτή η δαπάνη απορρίφθηκε. Περιμένουμε από εσάς να διορθώσετε τα προβλήματα και να την επισημάνετε ως επιλυμένη για να ενεργοποιηθεί η υποβολή.',
            reportActions: {
                rejectedExpense: 'απέρριψε αυτή την δαπάνη',
                markedAsResolved: 'σήμανε ότι ο λόγος απόρριψης επιλύθηκε',
            },
        },
        rejectReport: {
            title: 'Απόρριψη αναφοράς',
            description: 'Εξηγήστε γιατί δεν θα εγκρίνετε αυτήν την αναφορά:',
            rejectReason: 'Λόγος απόρριψης',
            selectTarget: 'Επιλέξτε το μέλος στο οποίο θα επιστραφεί αυτή η αναφορά για επανεξέταση:',
            lastApprover: 'Τελευταίος εγκρίνων',
            submitter: 'Αποστολέας',
            rejectedReportMessage: 'Αυτή η αναφορά απορρίφθηκε.',
            rejectedNextStep: 'Αυτή η αναφορά απορρίφθηκε. Περιμένουμε από εσάς να διορθώσετε τα προβλήματα και να την υποβάλετε ξανά χειροκίνητα.',
            selectMemberError: 'Επιλέξτε μέλος στο οποίο θα απορρίψετε αυτήν την αναφορά.',
            couldNotReject: 'Η αναφορά δεν μπόρεσε να απορριφθεί. Παρακαλούμε προσπαθήστε ξανά.',
        },
        moveExpenses: 'Μετακίνηση στην αναφορά',
        moveExpensesError:
            'Δεν μπορείτε να μετακινήσετε έξοδα ημερήσιας αποζημίωσης σε αναφορές άλλων χώρων εργασίας, επειδή οι τιμές ημερήσιας αποζημίωσης μπορεί να διαφέρουν μεταξύ των χώρων εργασίας.',
        submitReportTo: {
            sendExpense: 'Στείλτε την δαπάνη σας σε οποιονδήποτε',
            sendExpenseSubtitle: 'Προσκαλέστε οποιονδήποτε στο Expensify χρησιμοποιώντας τη διεύθυνση email ή τον αριθμό τηλεφώνου τους.',
        },
        changeApprover: {
            title: 'Αλλαγή εγκρίνοντος',
            header: (workflowSettingLink: string) =>
                `Επιλέξτε μια επιλογή για να αλλάξετε τον εγκριτή για αυτήν την αναφορά. (Ενημερώστε τις <a href="${workflowSettingLink}">ρυθμίσεις χώρου εργασίας</a> σας για να το αλλάξετε μόνιμα για όλες τις αναφορές.)`,
            changedApproverMessage: (managerID: number) => `άλλαξε τον εγκρίνοντα σε <mention-user accountID="${managerID}"/>`,
            reassignedApproverMessage: (managerID: number) => `ανέθεσε εκ νέου τον εγκρίνοντα στον/στην <mention-user accountID="${managerID}"/> μέσω ενημέρωσης ροής εργασίας`,
            actions: {
                addApprover: 'Προσθήκη εγκρίνων',
                addApproverSubtitle: 'Προσθέστε έναν επιπλέον εγκρίνοντα στην υπάρχουσα ροή έγκρισης.',
                bypassApprovers: 'Παράκαμψη εγκριτών',
                bypassApproversSubtitle: 'Ορίστε τον εαυτό σας ως τελικό εγκρίνοντα και παρακάμψτε τυχόν υπόλοιπους εγκρίνοντες.',
            },
            addApprover: {
                subtitle: 'Επιλέξτε έναν επιπλέον εγκρίνωντα για αυτήν την αναφορά πριν τη διοχετεύσουμε στο υπόλοιπο στάδιο έγκρισης.',
                bulkSubtitle: 'Επιλέξτε έναν επιπλέον εγκριτή για αυτές τις αναφορές προτού τις προωθήσουμε στο υπόλοιπο στάδιο έγκρισης.',
            },
            bulkSubtitle: 'Επιλέξτε μια επιλογή για να αλλάξετε το άτομο που εγκρίνει αυτές τις αναφορές.',
        },
        chooseWorkspace: 'Επιλέξτε ένα χώρο εργασίας',
        routedDueToDEW: (to: string, reason?: string) => `η αναφορά προωθήθηκε σε ${to}${reason ? `επειδή ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'ώρα' : 'ώρες'} @ ${rate} / ώρα`,
            hrs: 'ώρες',
            hours: 'Ώρες',
            ratePreview: (rate: string) => `${rate} / ώρα`,
            amountTooLargeError: 'Το συνολικό ποσό είναι πολύ μεγάλο. Μειώστε τις ώρες ή μειώστε την τιμή.',
        },
        correctRateError: 'Διορθώστε το σφάλμα στο συντελεστή και δοκιμάστε ξανά.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Εξήγηση<sparkles-icon/></a>`,
        conciergeAutoMatchedVendor: ({vendorName}: {vendorName: string}) => `Το Concierge αντιστοίχισε αυτή την δαπάνη στο <strong>${vendorName}</strong>`,
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? 'σήμανε την δαπάνη ως «επιστρεπτέα»' : 'σήμανε την δαπάνη ως «μη αποζημιώσιμη»'),
            billable: (value: boolean) => (value ? 'σήμανε τη δαπάνη ως «χρεώσιμη»' : 'σήμανε την δαπάνη ως «μη χρεώσιμη»'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `ορίστε τον φορολογικό συντελεστή σε «${value}»` : `συντελεστή φόρου σε «${value}»`),
            reportName: (value: string) => `μετακίνησε αυτήν τη δαπάνη στην αναφορά «${value}»`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `ορίστε το ${field} σε «${value}»` : `${field} σε «${value}»`;
            },
            formatPersonalRules: (fragments: string, route: string) => `${fragments} μέσω των <a href="${route}">προσωπικών κανόνων εξόδων</a>`,
            formatPolicyRules: (fragments: string, route: string) => `${fragments} μέσω των <a href="${route}">κανόνων χώρου εργασίας</a>`,
        },
        duplicateNonDefaultWorkspacePerDiemError: 'Δεν μπορείτε να διπλασιάσετε ημερήσιες αποζημιώσεις μεταξύ χώρων εργασίας, επειδή τα ποσά ενδέχεται να διαφέρουν από χώρο σε χώρο.',
        cannotDuplicateDistanceExpense: 'Δεν μπορείτε να αντιγράψετε έξοδα απόστασης μεταξύ χώρων εργασίας, επειδή οι χρεώσεις μπορεί να διαφέρουν μεταξύ των χώρων εργασίας.',
        bulkDuplicateLimit: `Μπορείτε να δημιουργήσετε αντίγραφα έως και ${CONST.SEARCH.BULK_DUPLICATE_LIMIT} εξόδων κάθε φορά. Παρακαλούμε επιλέξτε λιγότερα έξοδα και δοκιμάστε ξανά.`,
        taxDisabledAlert: {
            title: 'Ο φόρος είναι απενεργοποιημένος',
            prompt: 'Ενεργοποιήστε την παρακολούθηση φόρου στον χώρο εργασίας για να επεξεργαστείτε τα στοιχεία της δαπάνης ή να διαγράψετε τον φόρο από αυτήν τη δαπάνη.',
            confirmText: 'Διαγραφή φόρου',
        },
        categoryDisabledAlert: {
            title: 'Η κατηγορία είναι απενεργοποιημένη',
            prompt: 'Ενεργοποιήστε τις κατηγορίες στον χώρο εργασίας για να επεξεργαστείτε τα στοιχεία της δαπάνης ή να διαγράψετε την κατηγορία από αυτήν τη δαπάνη.',
            confirmText: 'Διαγραφή κατηγορίας',
        },
        tagDisabledAlert: {
            title: 'Η ετικέτα είναι απενεργοποιημένη',
            prompt: 'Ενεργοποιήστε τις ετικέτες στον χώρο εργασίας για να επεξεργαστείτε τις λεπτομέρειες της δαπάνης ή να διαγράψετε την ετικέτα από αυτήν τη δαπάνη.',
            confirmText: 'Διαγραφή ετικέτας',
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Συγχωνεύστε δαπάνες',
            noEligibleExpenseFound: 'Δεν βρέθηκαν κατάλληλες δαπάνες',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Δεν έχετε καμία δαπάνη που να μπορεί να συγχωνευτεί με αυτήν. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Μάθετε περισσότερα</a> σχετικά με τις επιλέξιμες δαπάνες.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Επιλέξτε μία <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">επιλέξιμη δαπάνη</a> για συγχώνευση με την αναφορά <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Επιλέξτε απόδειξη',
            pageTitle: 'Επιλέξτε την απόδειξη που θέλετε να κρατήσετε:',
        },
        detailsPage: {
            header: 'Επιλέξτε λεπτομέρειες',
            pageTitle: 'Επιλέξτε τις λεπτομέρειες που θέλετε να διατηρήσετε:',
            noDifferences: 'Δεν βρέθηκαν διαφορές μεταξύ των συναλλαγών',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'ένα' : 'α';
                return `Παρακαλούμε επιλέξτε ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Παρακαλώ επιλέξτε συμμετέχοντες',
            selectAllDetailsError: 'Επιλέξτε όλες τις λεπτομέρειες πριν συνεχίσετε.',
        },
        confirmationPage: {
            header: 'Επιβεβαιώστε τα στοιχεία',
            pageTitle: 'Επιβεβαιώστε τα στοιχεία που θα διατηρήσετε. Τα στοιχεία που δεν θα διατηρήσετε θα διαγραφούν.',
            confirmButton: 'Συγχωνεύστε δαπάνες',
        },
    },
    share: {
        shareToExpensify: 'Κοινή χρήση στο Expensify',
        messageInputLabel: 'Μήνυμα',
    },
    notificationPreferencesPage: {
        header: 'Προτιμήσεις ειδοποιήσεων',
        label: 'Να με ειδοποιείτε για νέα μηνύματα',
        notificationPreferences: {
            always: 'Αμέσως',
            daily: 'Καθημερινά',
            mute: 'Σίγαση',
            hidden: 'Κρυφό',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Ο αριθμός δεν έχει επαληθευτεί. Κάντε κλικ στο κουμπί για να ξαναστείλετε τον σύνδεσμο επαλήθευσης με μήνυμα κειμένου.',
        emailHasNotBeenValidated: 'Το email δεν έχει επαληθευτεί. Κάντε κλικ στο κουμπί για να ξαναστείλετε τον σύνδεσμο επαλήθευσης με μήνυμα κειμένου.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Μεταφορτώστε φωτογραφία',
        removePhoto: 'Αφαίρεση φωτογραφίας',
        editImage: 'Επεξεργασία φωτογραφίας',
        viewPhoto: 'Προβολή φωτογραφίας',
        imageUploadFailed: 'Η μεταφόρτωση εικόνας απέτυχε',
        deleteWorkspaceError: 'Συγγνώμη, παρουσιάστηκε ένα απρόσμενο πρόβλημα κατά τη διαγραφή του avatar του χώρου εργασίας σας',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Η επιλεγμένη εικόνα υπερβαίνει το μέγιστο επιτρεπόμενο μέγεθος μεταφόρτωσης των ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Παρακαλούμε ανεβάστε μια εικόνα μεγαλύτερη από ${minHeightInPx}x${minWidthInPx} εικονοστοιχεία και μικρότερη από ${maxHeightInPx}x${maxWidthInPx} εικονοστοιχεία.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Η φωτογραφία προφίλ πρέπει να είναι ένας από τους ακόλουθους τύπους: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Επεξεργασία εικόνας προφίλ',
        upload: 'Μεταφόρτωση',
        uploadPhoto: 'Μεταφορτώστε φωτογραφία',
        selectAvatar: 'Επιλέξτε avatar',
        choosePresetAvatar: 'Ή επιλέξτε ένα προσαρμοσμένο άβαταρ',
    },
    modal: {
        backdropLabel: 'Φόντο παραθύρου διαλόγου',
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
                        return `Περιμένουμε από <strong>εσάς</strong> να προσθέσετε δαπάνες.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμονή για τον/την <strong>${actor}</strong> να προσθέσει έξοδα.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή για να προσθέσει διαχειριστής έξοδα.`;
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
                        return `Αναμένουμε από <strong>εσάς</strong> να υποβάλετε δαπάνες.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμονή για την/τον <strong>${actor}</strong> να υποβάλει έξοδα.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή για διαχειριστή ώστε να υποβάλει δαπάνες.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_MARK_AS_DONE]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Περιμένουμε να το σημειώσετε ως ολοκληρωμένο, <strong>εσείς</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμονή για τον/την <strong>${actor}</strong> να το σημειώσει ως ολοκληρωμένο.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή για έναν διαχειριστή να το σημειώσει ως ολοκληρωμένο.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `Δεν απαιτείται καμία περαιτέρω ενέργεια!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Αναμένουμε από <strong>εσάς</strong> να προσθέσετε έναν τραπεζικό λογαριασμό.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμονή για να προσθέσει ο/η <strong>${actor}</strong> έναν τραπεζικό λογαριασμό.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή για να προσθέσει ένας διαχειριστής έναν τραπεζικό λογαριασμό.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `στις ${eta} κάθε μήνα` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Αναμένεται η αυτόματη υποβολή των εξόδων σας${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμονή για τις δαπάνες του/της <strong>${actor}</strong> ώστε να υποβληθούν αυτόματα${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή για την αυτόματη υποβολή των εξόδων ενός διαχειριστή${formattedETA}.`;
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
                        return `Περιμένουμε <strong>εσάς</strong> να διορθώσετε τα προβλήματα.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμένεται από τον/την <strong>${actor}</strong> να διορθώσει τα προβλήματα.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή για διαχειριστή ώστε να διορθώσει τα προβλήματα.`;
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
                        return `Αναμένονται από <strong>εσάς</strong> εγκρίσεις εξόδων.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμονή για την έγκριση των εξόδων από τον/την <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή για έγκριση εξόδων από διαχειριστή.`;
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
                        return `Αναμένουμε από <strong>εσάς</strong> να εξαγάγετε αυτήν την αναφορά.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμονή για τον/την <strong>${actor}</strong> να εξάγει αυτήν την αναφορά.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή για διαχειριστή για εξαγωγή αυτής της αναφοράς.`;
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
                        return `Σε αναμονή να αποπληρώσετε <strong>εσείς</strong> τα έξοδα.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμονή για να πληρώσει ο/η <strong>${actor}</strong> τα έξοδα.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή διαχειριστή για την πληρωμή εξόδων.`;
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
                        return `Αναμένουμε από <strong>εσάς</strong> να ολοκληρώσετε τη ρύθμιση επαγγελματικού τραπεζικού λογαριασμού.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αναμονή για τον/την <strong>${actor}</strong> να ολοκληρώσει τη ρύθμιση επαγγελματικού τραπεζικού λογαριασμού.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αναμονή για διαχειριστή ώστε να ολοκληρώσει τη ρύθμιση εταιρικού τραπεζικού λογαριασμού.`;
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
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `έως ${eta}` : ` ${eta}`;
                }
                return `Αναμονή για την ολοκλήρωση της πληρωμής${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `Ωχ! Φαίνεται ότι υποβάλλετε σε <strong>εσάς τον/την ίδιο/ίδια</strong>. Η έγκριση των δικών σας αναφορών είναι <strong>απαγορευμένη</strong> από τον χώρο εργασίας σας. Υποβάλετε αυτήν την αναφορά σε κάποιον άλλον ή επικοινωνήστε με τον/την διαχειριστή σας για να αλλάξετε το άτομο στο οποίο υποβάλλετε.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Αυτή η αναφορά απορρίφθηκε. Περιμένουμε από <strong>εσάς</strong> να διορθώσετε τα ζητήματα και να την υποβάλετε ξανά χειροκίνητα.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Αυτή η αναφορά απορρίφθηκε. Αναμένεται από τον/την <strong>${actor}</strong> να διορθώσει τα προβλήματα και να την υποβάλει ξανά χειροκίνητα.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Αυτή η αναφορά απορρίφθηκε. Αναμένεται διαχειριστής για να διορθώσει τα προβλήματα και να την υποβάλει ξανά χειροκίνητα.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'σύντομα',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'αργότερα σήμερα',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'την Κυριακή',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'την 1η και την 16η κάθε μήνα',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'την τελευταία εργάσιμη ημέρα του μήνα',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'την τελευταία ημέρα του μήνα',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'στο τέλος του ταξιδιού σας',
        },
    },
    profilePage: {
        profile: 'Προφίλ',
        preferredPronouns: 'Προτιμώμενες αντωνυμίες',
        selectYourPronouns: 'Επιλέξτε τις αντωνυμίες σας',
        selfSelectYourPronoun: 'Επιλέξτε μόνος/η σας την αντωνυμία σας',
        emailAddress: 'Διεύθυνση email',
        setMyTimezoneAutomatically: 'Ορισμός αυτόματης ζώνης ώρας',
        timezone: 'Ζώνη ώρας',
        invalidFileMessage: 'Μη έγκυρο αρχείο. Δοκιμάστε μια διαφορετική εικόνα.',
        avatarUploadFailureMessage: 'Παρουσιάστηκε σφάλμα κατά τη μεταφόρτωση του avatar. Παρακαλούμε δοκιμάστε ξανά.',
        online: 'Σε σύνδεση',
        offline: 'Εκτός σύνδεσης',
        syncing: 'Γίνεται συγχρονισμός',
        profileAvatar: 'Εικόνα προφίλ',
        customInstructions: 'Προσαρμοσμένες οδηγίες',
        copilotIntoAccount: 'Οδηγός εντός λογαριασμού',
        publicSection: {
            title: 'Δημόσιο',
            subtitle: 'Αυτές οι πληροφορίες εμφανίζονται στο δημόσιο προφίλ σας. Μπορεί να τις δει οποιοσδήποτε.',
        },
        privateSection: {
            title: 'Ιδιωτικό',
            subtitle: 'Αυτές οι λεπτομέρειες χρησιμοποιούνται για ταξίδια και πληρωμές. Δεν εμφανίζονται ποτέ στο δημόσιο προφίλ σας.',
        },
        aiPromptSection: {
            title: 'Προτροπή τεχνητής νοημοσύνης',
            subtitle: 'Γράψτε προσαρμοσμένες οδηγίες',
            prompt: 'Προτροπή',
            editPrompt: 'Επεξεργασία προτροπής',
            promptCannotBeEmpty: 'Το πεδίο προτροπής δεν μπορεί να είναι κενό',
            saved: 'Αποθηκεύτηκε',
        },
    },
    securityPage: {
        title: 'Ασφάλεια',
        subtitle: 'Διατηρήστε τον λογαριασμό σας ασφαλή.',
        goToSecurity: 'Επιστροφή στη σελίδα ασφαλείας',
    },
    shareCodePage: {
        title: 'Ο κωδικός σας',
        subtitle: 'Προσκαλέστε μέλη στο Expensify μοιράζοντας τον προσωπικό σας κωδικό QR ή σύνδεσμο παραπομπής.',
    },
    pronounsPage: {
        pronouns: 'Αντωνυμίες',
        isShownOnProfile: 'Οι αντωνυμίες σας εμφανίζονται στο προφίλ σας.',
        placeholderText: 'Αναζητήστε για να δείτε επιλογές',
    },
    contacts: {
        contactMethods: 'Μέθοδοι επικοινωνίας',
        featureRequiresValidate: 'Αυτή η λειτουργία απαιτεί να επαληθεύσετε τον λογαριασμό σας.',
        validateAccount: 'Επικυρώστε τον λογαριασμό σας',
        helpText: ({email}: {email: string}) =>
            `Προσθέστε περισσότερους τρόπους για να συνδέεστε και να στέλνετε αποδείξεις στο Expensify.<br/><br/>Προσθέστε μια διεύθυνση email για να προωθείτε αποδείξεις στο <a href="mailto:${email}">${email}</a> ή προσθέστε έναν αριθμό τηλεφώνου για να στέλνετε αποδείξεις με μήνυμα στο 47777 (μόνο για αριθμούς ΗΠΑ).`,
        pleaseVerify: 'Παρακαλούμε επαληθεύστε αυτήν τη μέθοδο επικοινωνίας.',
        getInTouch: 'Θα χρησιμοποιήσουμε αυτήν τη μέθοδο για να επικοινωνήσουμε μαζί σας.',
        enterMagicCode: (contactMethod: string) => `Παρακαλούμε εισαγάγετε τον μαγικό κωδικό που στάλθηκε στο ${contactMethod}. Θα πρέπει να φτάσει μέσα σε ένα ή δύο λεπτά.`,
        setAsDefault: 'Ορισμός ως προεπιλογή',
        yourDefaultContactMethod:
            'Αυτή είναι η τρέχουσα προεπιλεγμένη μέθοδος επικοινωνίας σας. Πριν μπορέσετε να τη διαγράψετε, θα πρέπει να επιλέξετε μια άλλη μέθοδο επικοινωνίας και να κάνετε κλικ στην επιλογή «Ορισμός ως προεπιλογής».',
        yourDefaultContactMethodRestrictedSwitch: 'Αυτή είναι η τρέχουσα προεπιλεγμένη μέθοδος επικοινωνίας σας. Η εταιρεία σας έχει περιορίσει την αφαίρεση ή την αλλαγή της.',
        removeContactMethod: 'Αφαίρεση μεθόδου επικοινωνίας',
        removeAreYouSure: 'Είστε βέβαιοι ότι θέλετε να αφαιρέσετε αυτήν τη μέθοδο επικοινωνίας; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.',
        failedNewContact: 'Αποτυχία προσθήκης αυτής της μεθόδου επικοινωνίας.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Αποτυχία αποστολής νέου μαγικού κωδικού. Παρακαλούμε περιμένετε λίγο και δοκιμάστε ξανά.',
            validateSecondaryLogin: 'Λανθασμένος ή μη έγκυρος μαγικός κωδικός. Δοκιμάστε ξανά ή ζητήστε έναν νέο κωδικό.',
            deleteContactMethod: 'Δεν ήταν δυνατή η διαγραφή της μεθόδου επικοινωνίας. Παρακαλούμε επικοινωνήστε με το Concierge για βοήθεια.',
            setDefaultContactMethod: 'Αποτυχία ορισμού νέας προεπιλεγμένης μεθόδου επικοινωνίας. Παρακαλούμε επικοινωνήστε με το Concierge για βοήθεια.',
            addContactMethod: 'Αποτυχία προσθήκης αυτής της μεθόδου επικοινωνίας. Παρακαλούμε επικοινωνήστε με το Concierge για βοήθεια.',
            enteredMethodIsAlreadySubmitted: 'Αυτή η μέθοδος επικοινωνίας υπάρχει ήδη',
            passwordRequired: 'απαιτείται κωδικός πρόσβασης.',
            contactMethodRequired: 'Απαιτείται μέθοδος επικοινωνίας',
            invalidContactMethod: 'Μη έγκυρη μέθοδος επικοινωνίας',
        },
        newContactMethod: 'Νέος τρόπος επικοινωνίας',
        goBackContactMethods: 'Επιστρέψτε στις μεθόδους επικοινωνίας',
    },
    pronouns: {
        coCos: 'Συ / Συν',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Αυτός / Αυτόν / Δικός του',
        heHimHisTheyThemTheirs: 'Αυτός / Εκείνον / Δικός του / Αυτοί / Αυτούς / Δικά τους',
        sheHerHers: 'Αυτή / Αυτής / Δική της',
        sheHerHersTheyThemTheirs: 'Αυτή / Αυτήν / Δική της / Αυτοί / Αυτούς / Δική τους',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Ανά άτομο / άτομα',
        theyThemTheirs: 'Αυτοί / Αυτούς / Δικά τους',
        thonThons: 'Thon / Thonες',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Εσάς / Σας',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Φώναξέ με με το όνομά μου',
    },
    displayNamePage: {
        headerTitle: 'Εμφανιζόμενο όνομα',
        isShownOnProfile: 'Το εμφανιζόμενο όνομά σας εμφανίζεται στο προφίλ σας.',
    },
    timezonePage: {
        timezone: 'Ζώνη ώρας',
        isShownOnProfile: 'Η ζώνη ώρας σας εμφανίζεται στο προφίλ σας.',
        getLocationAutomatically: 'Αυτόματος προσδιορισμός της τοποθεσίας σας',
    },
    updateRequiredView: {
        updateRequired: 'Απαιτείται ενημέρωση',
        pleaseInstall: 'Παρακαλούμε ενημερώστε στην τελευταία έκδοση του New Expensify',
        pleaseInstallExpensifyClassic: 'Παρακαλούμε εγκαταστήστε την πιο πρόσφατη έκδοση του Expensify',
        toGetLatestChanges: 'Σε κινητό, κάντε λήψη και εγκαταστήστε την πιο πρόσφατη έκδοση. Σε web, ανανεώστε το πρόγραμμα περιήγησής σας.',
        newAppNotAvailable: 'Η εφαρμογή New Expensify δεν είναι πλέον διαθέσιμη.',
    },
    initialSettingsPage: {
        about: 'Πληροφορίες',
        aboutPage: {
            description: 'Η νέα εφαρμογή Expensify δημιουργείται από μια κοινότητα προγραμματιστών ανοικτού κώδικα από όλο τον κόσμο. Βοηθήστε μας να χτίσουμε το μέλλον της Expensify.',
            appDownloadLinks: 'Σύνδεσμοι λήψης εφαρμογής',
            viewKeyboardShortcuts: 'Προβολή συντομεύσεων πληκτρολογίου',
            viewTheCode: 'Προβολή κώδικα',
            viewOpenJobs: 'Προβολή ανοικτών εργασιών',
            reportABug: 'Αναφορά σφάλματος',
            troubleshoot: 'Επίλυση προβλημάτων',
        },
        appDownloadLinks: {
            android: {
                label: 'Android',
            },
            ios: {
                label: 'iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: 'Εκκαθαρίστε την προσωρινή μνήμη και επανεκκινήστε',
            description:
                '<muted-text>Χρησιμοποιήστε τα παρακάτω εργαλεία για να εντοπίσετε και να επιλύσετε προβλήματα με την εμπειρία σας στο Expensify. Αν αντιμετωπίσετε οποιοδήποτε ζήτημα, παρακαλούμε <concierge-link>υποβάλετε μια αναφορά σφάλματος</concierge-link>.</muted-text>',
            confirmResetDescription: 'Όλα τα μη αποσταλμένα πρόχειρα μηνύματα θα χαθούν, αλλά τα υπόλοιπα δεδομένα σας είναι ασφαλή.',
            resetAndRefresh: 'Επαναφορά και ανανέωση',
            clientSideLogging: 'Καταγραφή στην πλευρά του πελάτη',
            noLogsToShare: 'Δεν υπάρχουν αρχεία καταγραφής για κοινή χρήση',
            useProfiling: 'Χρησιμοποιήστε προφίλωση',
            profileTrace: 'Ίχνος προφίλ',
            results: 'Αποτελέσματα',
            releaseOptions: 'Επιλογές έκδοσης',
            testingPreferences: 'Προτιμήσεις δοκιμών',
            useStagingServer: 'Χρήση διακομιστή staging',
            forceOffline: 'Εξαναγκασμός εκτός σύνδεσης',
            simulatePoorConnection: 'Προσομοίωση κακής σύνδεσης στο διαδίκτυο',
            simulateFailingNetworkRequests: 'Προσομοίωση αποτυχημένων αιτημάτων δικτύου',
            authenticationStatus: 'Κατάσταση ελέγχου ταυτότητας',
            deviceCredentials: 'Διαπιστευτήρια συσκευής',
            invalidate: 'Ακύρωση έγκυρου',
            destroy: 'Καταστροφή',
            maskExportOnyxStateData: 'Απόκρυψη ευαίσθητων δεδομένων μελών κατά την εξαγωγή της κατάστασης Onyx',
            exportOnyxState: 'Εξαγωγή κατάστασης Onyx',
            importOnyxState: 'Εισαγωγή κατάστασης Onyx',
            testCrash: 'Δοκιμαστική κατάρρευση',
            resetToOriginalState: 'Επαναφορά στην αρχική κατάσταση',
            usingImportedState: 'Χρησιμοποιείτε εισαγόμενη κατάσταση. Πατήστε εδώ για να την καθαρίσετε.',
            debugMode: 'Λειτουργία αποσφαλμάτωσης',
            showBranchNameInTitle: 'Εμφάνιση ονόματος κλάδου στον τίτλο του προγράμματος περιήγησης',
            invalidFile: 'Μη έγκυρο αρχείο',
            invalidFileDescription: 'Το αρχείο που προσπαθείτε να εισαγάγετε δεν είναι έγκυρο. Παρακαλούμε δοκιμάστε ξανά.',
            invalidateWithDelay: 'Ακύρωση με καθυστέρηση',
            leftHandNavCache: 'μνήμη προσωρινής αποθήκευσης αριστερού πλαϊνού μενού',
            clearleftHandNavCache: 'Εκκαθάριση',
            softKillTheApp: 'Κλείσιμο της εφαρμογής (soft kill)',
            kill: 'Σκότωσε',
            sentryDebug: 'Εντοπισμός σφαλμάτων Sentry',
            sentrySendDescription: 'Αποστολή δεδομένων στο Sentry',
            sentryDebugDescription: 'Καταγραφή αιτημάτων Sentry στην κονσόλα',
            sentryHighlightedSpanOps: 'Επισημασμένα ονόματα span',
            sentryHighlightedSpanOpsPlaceholder: 'κλικ αλληλεπίδρασης διεπαφής, πλοήγηση, φόρτωση διεπαφής',
        },
        security: 'Ασφάλεια',
        signOut: 'Αποσύνδεση',
        restoreStashed: 'Επαναφορά αποθηκευμένης σύνδεσης',
        signOutConfirmationText: 'Θα χάσετε τυχόν αλλαγές εκτός σύνδεσης αν αποσυνδεθείτε.',
        versionLetter: 'ν',
        readTheTermsAndPrivacy: `Διαβάστε τους <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">όρους παροχής υπηρεσιών</a> και την <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">πολιτική απορρήτου</a>.`,
        help: 'Βοήθεια',
        helpPage: {
            title: 'Βοήθεια και υποστήριξη',
            description: 'Είμαστε εδώ για να σας βοηθάμε 24/7.',
            helpSite: 'Ιστότοπος βοήθειας',
            helpSiteDescription: 'Άρθρα, οδηγίες και άλλα',
            conciergeChat: 'Concierge',
            conciergeChatDescription: 'Ο προσωπικός σας πράκτορας τεχνητής νοημοσύνης',
            accountManager: 'Υπεύθυνος λογαριασμού',
            yourAccountManager: 'Ο υπεύθυνος διαχείρισης του λογαριασμού σας',
            accountManagerDescription: 'Κάντε ερωτήσεις και λάβετε υποστήριξη πελατών',
            partnerManager: 'Υπεύθυνος συνεργατών',
            yourPartnerManager: 'Ο υπεύθυνος συνεργατών σας',
            partnerManagerDescription: 'Μεγιστοποιήστε τη συνεργασία σας και αυξήστε τις συστάσεις σας',
            accountExecutive: 'Υπεύθυνος Πωλήσεων',
            accountExecutiveDescription: 'Ρυθμίστε επιτυχώς τους πελάτες σας',
            guideDescription: 'Ο υπεύθυνος λογαριασμού σας',
            approvedPartnerTeamTitle: 'Γνωρίστε την ομάδα συνεργατών του Approved!',
            approvedPartnerTeamDescription:
                'Μια αφοσιωμένη ομάδα που εστιάζει στο να βοηθά την εταιρεία σας να αναπτυχθεί, να εντάσσει πελάτες πιο γρήγορα και να λαμβάνει εξειδικευμένη υποστήριξη όποτε τη χρειάζεστε.',
            moreResources: 'Περισσότεροι πόροι',
        },
        whatIsNew: 'Τι νέο υπάρχει',
        accountSettings: 'Ρυθμίσεις λογαριασμού',
        account: 'Λογαριασμός',
        general: 'Γενικά',
    },
    closeAccountPage: {
        closeAccount: 'Κλείσιμο λογαριασμού',
        reasonForLeavingPrompt: 'Δε θα θέλαμε να σας χάσουμε! Θα ήσασταν τόσο ευγενικοί να μας πείτε τον λόγο, ώστε να μπορέσουμε να βελτιωθούμε;',
        enterMessageHere: 'Εισαγάγετε το μήνυμα εδώ',
        closeAccountWarning: 'Το κλείσιμο του λογαριασμού σας δεν μπορεί να αναιρεθεί.',
        closeAccountPermanentlyDeleteData: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε τον λογαριασμό σας; Αυτό θα διαγράψει οριστικά όλες τις εκκρεμείς δαπάνες.',
        enterDefaultContactToConfirm:
            'Παρακαλούμε εισαγάγετε την προεπιλεγμένη μέθοδο επικοινωνίας σας για να επιβεβαιώσετε ότι επιθυμείτε να κλείσετε τον λογαριασμό σας. Η προεπιλεγμένη μέθοδος επικοινωνίας σας είναι:',
        enterDefaultContact: 'Εισαγάγετε την προεπιλεγμένη μέθοδο επικοινωνίας σας',
        defaultContact: 'Προεπιλεγμένη μέθοδος επικοινωνίας:',
        enterYourDefaultContactMethod: 'Παρακαλούμε εισαγάγετε την προεπιλεγμένη μέθοδο επικοινωνίας σας για να κλείσετε τον λογαριασμό σας.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Συγχώνευση λογαριασμών',
        accountDetails: {
            accountToMergeInto: (login: string) => `Εισαγάγετε τον λογαριασμό που θέλετε να συγχωνεύσετε με το <strong>${login}</strong>.`,
            notReversibleConsent: 'Κατανοώ ότι αυτό δεν είναι αναστρέψιμο',
        },
        accountValidate: {
            confirmMerge: 'Είστε βέβαιοι ότι θέλετε να συγχωνεύσετε λογαριασμούς;',
            lossOfUnsubmittedData: (login: string) =>
                `Η συγχώνευση των λογαριασμών σας είναι μη αναστρέψιμη και θα έχει ως αποτέλεσμα την απώλεια τυχόν μη υποβληθέντων εξόδων για τον/την <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `Για να συνεχίσετε, εισαγάγετε τον μαγικό κωδικό που στάλθηκε στο <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Λανθασμένος ή μη έγκυρος μαγικός κωδικός. Δοκιμάστε ξανά ή ζητήστε έναν νέο κωδικό.',
                fallback: 'Κάτι πήγε στραβά. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Οι λογαριασμοί συγχωνεύτηκαν!',
            description: (from: string, to: string) =>
                `<muted-text><centered-text>Έχετε συγχωνεύσει με επιτυχία όλα τα δεδομένα από τον/την <strong>${from}</strong> στον/στην <strong>${to}</strong>. Από εδώ και στο εξής, μπορείτε να χρησιμοποιείτε οποιοδήποτε από τα δύο στοιχεία σύνδεσης για αυτόν τον λογαριασμό.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Το ετοιμάζουμε',
            limitedSupport: 'Δεν υποστηρίζουμε ακόμη τη συγχώνευση λογαριασμών στο νέο Expensify. Παρακαλούμε πραγματοποιήστε αυτήν την ενέργεια στο Expensify Classic.',
            reachOutForHelp:
                '<muted-text><centered-text>Μη διστάσετε να <concierge-link>επικοινωνήσετε με το Concierge</concierge-link> αν έχετε οποιεσδήποτε ερωτήσεις!</centered-text></muted-text>',
            goToExpensifyClassic: 'Μετάβαση στο Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `<muted-text><centered-text>Δεν μπορείτε να συγχωνεύσετε το <strong>${email}</strong> επειδή ελέγχεται από το <strong>${email.split('@').at(1) ?? ''}</strong>. Παρακαλούμε <concierge-link>επικοινωνήστε με το Concierge</concierge-link> για βοήθεια.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `<muted-text><centered-text>Δεν μπορείτε να συγχωνεύσετε τον λογαριασμό <strong>${email}</strong> με άλλους λογαριασμούς, επειδή ο διαχειριστής του τομέα σας τον έχει ορίσει ως κύρια σύνδεσή σας. Αντίθετα, συγχωνεύστε άλλους λογαριασμούς σε αυτόν.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `<muted-text><centered-text>Δεν μπορείτε να συγχωνεύσετε λογαριασμούς επειδή ο/η <strong>${email}</strong> έχει ενεργοποιημένο τον έλεγχο ταυτότητας δύο παραγόντων (2FA). Παρακαλούμε απενεργοποιήστε το 2FA για τον/την <strong>${email}</strong> και δοκιμάστε ξανά.</centered-text></muted-text>`,
            learnMore: 'Μάθετε περισσότερα σχετικά με τη συγχώνευση λογαριασμών.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `<muted-text><centered-text>Δεν μπορείτε να συγχωνεύσετε το <strong>${email}</strong> επειδή είναι κλειδωμένο. Παρακαλούμε <concierge-link>επικοινωνήστε με το Concierge</concierge-link> για βοήθεια.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `<muted-text><centered-text>Δεν μπορείτε να συγχωνεύσετε λογαριασμούς επειδή το <strong>${email}</strong> δεν έχει λογαριασμό Expensify. Παρακαλούμε <a href="${contactMethodLink}">προσθέστε το ως τρόπο επικοινωνίας</a> αντ’ αυτού.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `<muted-text><centered-text>Δεν μπορείτε να συγχωνεύσετε τον λογαριασμό <strong>${email}</strong> σε άλλους λογαριασμούς. Αντίθετα, συγχωνεύστε άλλους λογαριασμούς σε αυτόν.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `<muted-text><centered-text>Δεν μπορείτε να συγχωνεύσετε λογαριασμούς με το <strong>${email}</strong> επειδή αυτός ο λογαριασμός είναι ο κάτοχος μιας τιμολογημένης σχέσης χρέωσης.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Δοκιμάστε ξανά αργότερα',
            description: 'Έγιναν πάρα πολλές προσπάθειες συγχώνευσης λογαριασμών. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Δεν μπορείτε να συγχωνεύσετε με άλλους λογαριασμούς επειδή δεν έχει επαληθευτεί. Παρακαλούμε επαληθεύστε τον λογαριασμό και δοκιμάστε ξανά.',
        },
        mergeFailureSelfMerge: {
            description: 'Δεν μπορείτε να συγχωνεύσετε έναν λογαριασμό με τον εαυτό του.',
        },
        mergeFailureGenericHeading: 'Δεν είναι δυνατή η συγχώνευση λογαριασμών',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Αναφορά ύποπτης δραστηριότητας',
        lockAccount: 'Κλείδωμα λογαριασμού',
        lockMyAccount: 'Κλείδωμα του λογαριασμού μου',
        unlockAccount: 'Ξεκλειδώστε τον λογαριασμό',
        unlockTitle: 'Λάβαμε το αίτημά σας',
        unlockDescription: 'Θα εξετάσουμε τον λογαριασμό για να επιβεβαιώσουμε ότι είναι ασφαλές να ξεκλειδωθεί και θα επικοινωνήσουμε μέσω Concierge για τυχόν ερωτήσεις.',
        findYourSituation: 'Τα περισσότερα προβλήματα δεν απαιτούν κλείδωμα του λογαριασμού σας. Βρείτε την περίπτωσή σας παρακάτω:',
        lostCardOrCharges:
            '<a href="https://help.expensify.com/articles/expensify-classic/expensify-card/Dispute-Transaction">Χαμένη κάρτα ή άγνωστες χρεώσεις</a>: ακυρώστε την κάρτα σας και επικοινωνήστε με το Concierge για να αμφισβητήσετε άγνωστες συναλλαγές.',
        unauthorizedAccess:
            '<a href="https://help.expensify.com/articles/expensify-classic/settings/Report-Suspicious-Activity">Μη εξουσιοδοτημένη πρόσβαση στον λογαριασμό</a>: Κλειδώστε τον λογαριασμό σας παρακάτω. Αυτό μπλοκάρει νέες συναλλαγές με την Κάρτα Expensify, παραγγελίες καρτών και αλλαγές στον λογαριασμό. Αν είστε διαχειριστής τομέα, αυτό επίσης θέτει σε παύση όλη τη δραστηριότητα καρτών σε επίπεδο τομέα και τις ενέργειες διαχειριστή.',
        securityTeamFollowUp: 'Η ομάδα ασφαλείας μας θα επικοινωνήσει μαζί σας από το <a href="mailto:risk@expensify.com">risk@expensify.com</a> μετά το κλείδωμα.',
        areYouSure: 'Είστε βέβαιοι ότι θέλετε να κλειδώσετε τον λογαριασμό σας στο Expensify;',
        onceLocked: 'Μόλις κλειδωθεί, ο λογαριασμός σας θα περιοριστεί έως ότου υποβληθεί αίτημα ξεκλειδώματος και διενεργηθεί έλεγχος ασφαλείας',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Αποτυχία κλειδώματος λογαριασμού',
        failedToLockAccountDescription: `Δεν μπορέσαμε να κλειδώσουμε τον λογαριασμό σας. Παρακαλούμε συνομιλήστε με το Concierge για να επιλύσετε αυτό το πρόβλημα.`,
        chatWithConcierge: 'Συνομιλήστε με το Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Ο λογαριασμός έχει κλειδωθεί',
        yourAccountIsLocked: 'Ο λογαριασμός σας είναι κλειδωμένος',
        chatToConciergeToUnlock: 'Συνομιλήστε με το Concierge για να επιλύσετε ζητήματα ασφαλείας και να ξεκλειδώσετε τον λογαριασμό σας.',
        chatWithConcierge: 'Συνομιλήστε με το Concierge',
    },
    deviceManagementPage: {
        title: 'Διαχείριση συσκευών',
        description:
            'Διαχειριστείτε όλες τις συσκευές στις οποίες έχετε συνδεθεί με τον λογαριασμό σας Expensify. <a href="https://help.expensify.com/articles/new-expensify/settings/Manage-Logged-in-Devices">Μάθετε περισσότερα</a>.',
        revoke: 'Ανακαλέστε',
        unknownDevice: 'Άγνωστη συσκευή',
    },
    twoFactorAuth: {
        headerTitle: 'Έλεγχος ταυτότητας δύο παραγόντων',
        twoFactorAuthEnabled: 'Ενεργοποιήθηκε ο έλεγχος ταυτότητας δύο παραγόντων',
        whatIsTwoFactorAuth:
            'Ο έλεγχος ταυτότητας δύο παραγόντων (2FA) βοηθά να διατηρείτε τον λογαριασμό σας ασφαλή. Κατά τη σύνδεση, θα χρειάζεται να εισάγετε έναν κωδικό που δημιουργείται από την εφαρμογή ελέγχου ταυτότητας της προτίμησής σας.',
        disableTwoFactorAuth: 'Απενεργοποίηση ελέγχου ταυτότητας δύο παραγόντων',
        explainProcessToRemove: 'Για να απενεργοποιήσετε τον έλεγχο ταυτότητας δύο παραγόντων (2FA), εισαγάγετε έναν έγκυρο κωδικό από την εφαρμογή ελέγχου ταυτότητάς σας.',
        explainProcessToRemoveWithRecovery: 'Για να απενεργοποιήσετε τον έλεγχο ταυτότητας δύο παραγόντων (2FA), εισαγάγετε έναν έγκυρο κωδικό ανάκτησης.',
        disabled: 'Η επαλήθευση δύο παραγόντων είναι τώρα απενεργοποιημένη',
        downloadCodes: 'Λήψη κωδικών',
        noAuthenticatorApp: 'Δεν θα χρειάζεστε πλέον εφαρμογή ελέγχου ταυτότητας για να συνδέεστε στο Expensify.',
        stepCodes: 'Κωδικοί ανάκτησης',
        keepCodesSafe: 'Κρατήστε αυτούς τους κωδικούς ασφαλείς!',
        codesLoseAccess: Str.dedent(`
            Αν χάσετε την πρόσβαση στην εφαρμογή ελέγχου ταυτότητας και δεν έχετε αυτούς τους κωδικούς, θα αποκλειστείτε από τον λογαριασμό σας.<br><br>
            <strong>Σημείωση</strong>: Η ενεργοποίηση του 2FA σάς αποσυνδέει από όλες τις άλλες συνεδρίες.
        `),
        errorStepCodes: 'Παρακαλούμε αντιγράψτε ή κατεβάστε τους κωδικούς πριν συνεχίσετε',
        stepVerify: 'Επιβεβαίωση',
        scanCode: 'Σαρώστε τον κωδικό QR χρησιμοποιώντας το',
        authenticatorApp: 'εφαρμογή ελέγχου ταυτότητας',
        addKey: 'Ή προσθέστε αυτό το μυστικό κλειδί στην εφαρμογή ελέγχου ταυτότητάς σας:',
        secretKey: 'μυστικό κλειδί',
        enterCode: 'Στη συνέχεια, εισαγάγετε τον εξαψήφιο κωδικό που δημιουργήθηκε από την εφαρμογή ελέγχου ταυτότητάς σας.',
        stepSuccess: 'Ολοκληρώθηκε',
        enabled: 'Ενεργοποιήθηκε ο έλεγχος ταυτότητας δύο παραγόντων',
        congrats: 'Συγχαρητήρια! Τώρα έχετε αυτήν την επιπλέον ασφάλεια.',
        copy: 'Αντιγραφή',
        copyCodes: 'Αντιγραφή κωδικών',
        disable: 'Απενεργοποίηση',
        enableTwoFactorAuth: 'Ενεργοποιήστε τον έλεγχο ταυτότητας δύο παραγόντων',
        pleaseEnableTwoFactorAuth: 'Παρακαλούμε ενεργοποιήστε τον έλεγχο ταυτότητας δύο παραγόντων.',
        twoFactorAuthIsRequiredDescription: 'Για λόγους ασφαλείας, το Xero απαιτεί έλεγχο ταυτότητας δύο παραγόντων για να συνδεθεί η ενοποίηση.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Απαιτείται έλεγχος ταυτότητας δύο παραγόντων',
        twoFactorAuthIsRequiredForAdminsTitle: 'Παρακαλούμε ενεργοποιήστε τον έλεγχο ταυτότητας δύο παραγόντων',
        twoFactorAuthIsRequiredXero: 'Η σύνδεσή σας με το λογιστικό σύστημα Xero απαιτεί έλεγχο ταυτότητας δύο παραγόντων.',
        twoFactorAuthIsRequiredCompany: 'Η εταιρεία σας απαιτεί έλεγχο ταυτότητας δύο παραγόντων.',
        twoFactorAuthCannotDisable: 'Δεν είναι δυνατή η απενεργοποίηση του 2FA',
        twoFactorAuthRequired: 'Η επαλήθευση δύο παραγόντων (2FA) είναι υποχρεωτική για τη σύνδεσή σας με το Xero και δεν μπορεί να απενεργοποιηθεί.',
        replaceDevice: 'Αντικατάσταση συσκευής',
        replaceDeviceTitle: 'Αντικατάσταση συσκευής δύο παραγόντων',
        verifyOldDeviceTitle: 'Επαληθεύστε την παλιά συσκευή',
        verifyOldDeviceDescription: 'Εισαγάγετε τον εξαψήφιο κωδικό από την τωρινή εφαρμογή ελέγχου ταυτότητας για να επιβεβαιώσετε ότι έχετε πρόσβαση σε αυτήν.',
        verifyOldDeviceDescriptionWithRecovery: 'Εισαγάγετε έναν έγκυρο κωδικό ανάκτησης για να επιβεβαιώσετε ότι έχετε πρόσβαση στον λογαριασμό σας.',
        verifyNewDeviceTitle: 'Ρύθμιση νέας συσκευής',
        verifyNewDeviceDescription: 'Σαρώστε τον κωδικό QR με τη νέα σας συσκευή και κατόπιν εισαγάγετε τον κωδικό για να ολοκληρώσετε τη ρύθμιση.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Παρακαλώ εισαγάγετε τον κωδικό ανάκτησής σας',
            incorrectRecoveryCode: 'Εσφαλμένος κωδικός ανάκτησης. Παρακαλούμε δοκιμάστε ξανά.',
        },
        useRecoveryCode: 'Χρησιμοποιήστε κωδικό ανάκτησης',
        recoveryCode: 'Κωδικός ανάκτησης',
        use2fa: 'Χρησιμοποιήστε τον κωδικό δύο παραγόντων ταυτοποίησης',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Εισαγάγετε τον κωδικό ελέγχου ταυτότητας δύο παραγόντων σας',
            incorrect2fa: 'Λανθασμένος κωδικός δύο παραγόντων. Παρακαλούμε δοκιμάστε ξανά.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Ο κωδικός πρόσβασης ενημερώθηκε!',
        allSet: 'Είσαστε έτοιμος. Διατηρήστε τον νέο σας κωδικό πρόσβασης ασφαλή.',
    },
    privateNotes: {
        title: 'Ιδιωτικές σημειώσεις',
        personalNoteMessage: 'Κρατήστε σημειώσεις για αυτή τη συνομιλία εδώ. Είστε το μόνο άτομο που μπορεί να προσθέσει, να επεξεργαστεί ή να δει αυτές τις σημειώσεις.',
        sharedNoteMessage: 'Κρατήστε σημειώσεις για αυτή τη συνομιλία εδώ. Οι υπάλληλοι της Expensify και άλλα μέλη με το domain team.expensify.com μπορούν να δουν αυτές τις σημειώσεις.',
        composerLabel: 'Σημειώσεις',
        myNote: 'Η σημείωσή μου',
        error: {
            genericFailureMessage: 'Δεν ήταν δυνατή η αποθήκευση των ιδιωτικών σημειώσεων',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Παρακαλούμε εισαγάγετε έναν έγκυρο κωδικό ασφαλείας',
        },
        securityCode: 'Κωδικός ασφαλείας',
        changeBillingCurrency: 'Αλλαγή νομίσματος χρέωσης',
        changePaymentCurrency: 'Αλλαγή νομίσματος πληρωμής',
        paymentCurrency: 'Νόμισμα πληρωμής',
        paymentCurrencyDescription: 'Επιλέξτε ένα τυποποιημένο νόμισμα στο οποίο θα μετατρέπονται όλα τα προσωπικά έξοδα',
        note: `Σημείωση: η αλλαγή του νομίσματος πληρωμής σας μπορεί να επηρεάσει το πόσο θα πληρώνετε για το Expensify. Ανατρέξτε στη <a href="${CONST.PRICING}">σελίδα τιμολόγησης</a> μας για πλήρεις λεπτομέρειες.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Προσθέστε χρεωστική κάρτα',
        nameOnCard: 'Όνομα στην κάρτα',
        debitCardNumber: 'Αριθμός χρεωστικής κάρτας',
        expiration: 'Ημερομηνία λήξης',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Διεύθυνση χρέωσης',
        growlMessageOnSave: 'Η χρεωστική σας κάρτα προστέθηκε με επιτυχία',
        expensifyPassword: 'Κωδικός Expensify',
        error: {
            invalidName: 'Το όνομα μπορεί να περιέχει μόνο γράμματα',
            addressZipCode: 'Παρακαλώ εισαγάγετε έναν έγκυρο ταχυδρομικό κώδικα',
            debitCardNumber: 'Παρακαλούμε εισαγάγετε έναν έγκυρο αριθμό χρεωστικής κάρτας',
            expirationDate: 'Παρακαλώ επιλέξτε έγκυρη ημερομηνία λήξης',
            securityCode: 'Παρακαλούμε εισαγάγετε έναν έγκυρο κωδικό ασφαλείας',
            addressStreet: 'Παρακαλούμε εισαγάγετε μία έγκυρη διεύθυνση χρέωσης που να μην είναι ταχυδρομική θυρίδα',
            addressState: 'Παρακαλούμε επιλέξτε πολιτεία',
            addressCity: 'Παρακαλώ εισαγάγετε πόλη',
            genericFailureMessage: 'Παρουσιάστηκε σφάλμα κατά την προσθήκη της κάρτας σας. Δοκιμάστε ξανά.',
            password: 'Παρακαλούμε εισαγάγετε τον κωδικό πρόσβασής σας στο Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Προσθήκη κάρτας πληρωμής',
        nameOnCard: 'Όνομα στην κάρτα',
        paymentCardNumber: 'Αριθμός κάρτας',
        expiration: 'Ημερομηνία λήξης',
        expirationDate: 'MM/YY',
        cvv: 'CVV',
        billingAddress: 'Διεύθυνση χρέωσης',
        growlMessageOnSave: 'Η κάρτα πληρωμής σας προστέθηκε με επιτυχία',
        expensifyPassword: 'Κωδικός Expensify',
        error: {
            invalidName: 'Το όνομα μπορεί να περιέχει μόνο γράμματα',
            addressZipCode: 'Παρακαλώ εισαγάγετε έναν έγκυρο ταχυδρομικό κώδικα',
            paymentCardNumber: 'Παρακαλούμε εισαγάγετε έναν έγκυρο αριθμό κάρτας',
            expirationDate: 'Παρακαλώ επιλέξτε έγκυρη ημερομηνία λήξης',
            securityCode: 'Παρακαλούμε εισαγάγετε έναν έγκυρο κωδικό ασφαλείας',
            addressStreet: 'Παρακαλούμε εισαγάγετε μία έγκυρη διεύθυνση χρέωσης που να μην είναι ταχυδρομική θυρίδα',
            addressState: 'Παρακαλούμε επιλέξτε πολιτεία',
            addressCity: 'Παρακαλώ εισαγάγετε πόλη',
            genericFailureMessage: 'Παρουσιάστηκε σφάλμα κατά την προσθήκη της κάρτας σας. Δοκιμάστε ξανά.',
            password: 'Παρακαλούμε εισαγάγετε τον κωδικό πρόσβασής σας στο Expensify',
        },
    },
    personalCard: {
        addPersonalCard: 'Προσθήκη προσωπικής κάρτας',
        addCompanyCard: 'Προσθήκη εταιρικής κάρτας',
        lookingForCompanyCards: 'Πρέπει να προσθέσετε εταιρικές κάρτες;',
        lookingForCompanyCardsDescription: 'Χρησιμοποιήστε τις δικές σας κάρτες από περισσότερες από 10.000 τράπεζες παγκοσμίως.',
        personalCardAdded: 'Προσωπική κάρτα προστέθηκε!',
        personalCardAddedDescription: 'Συγχαρητήρια, θα αρχίσουμε να εισάγουμε συναλλαγές από την κάρτα σας.',
        isPersonalCard: 'Είναι αυτή μια προσωπική κάρτα;',
        thisIsPersonalCard: 'Αυτή είναι προσωπική κάρτα',
        thisIsCompanyCard: 'Αυτή είναι μια εταιρική κάρτα',
        askAdmin: 'Ρωτήστε τον διαχειριστή σας',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `Αν ναι, υπέροχα! Αλλά αν είναι κάρτα <strong>εταιρείας</strong>, παρακαλούμε ${isAdmin ? 'αντιθέτως, εκχωρήστε τη από τον χώρο εργασίας σας.' : 'αντί γι’ αυτό, ζητήστε από τον διαχειριστή σας να σας το αναθέσει από τον χώρο εργασίας.'}`,
        bankConnectionError: 'Πρόβλημα σύνδεσης με την τράπεζα',
        bankConnectionDescription: 'Παρακαλούμε δοκιμάστε να προσθέσετε ξανά τις κάρτες σας. Διαφορετικά, μπορείτε να',
        connectWithPlaid: 'συνδεθείτε μέσω Plaid.',
        brokenConnection: 'Η σύνδεση της κάρτας σας έχει διακοπεί.',
        fixCard: 'Διόρθωση κάρτας',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `Η σύνδεση της κάρτας ${cardName} έχει διακοπεί. <a href="${connectionLink}">Συνδεθείτε στην τράπεζά σας</a> για να διορθώσετε την κάρτα.`
                : `Η σύνδεση της κάρτας ${cardName} έχει διακοπεί. Συνδεθείτε στην τράπεζά σας για να διορθώσετε την κάρτα.`,
        addAdditionalCards: 'Προσθέστε επιπλέον κάρτες',
        upgradeDescription:
            'Χρειάζεστε να προσθέσετε περισσότερες κάρτες; Δημιουργήστε έναν χώρο εργασίας για να προσθέσετε επιπλέον προσωπικές κάρτες ή να αναθέσετε εταιρικές κάρτες σε όλη την ομάδα.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `<muted-text>Αυτό είναι διαθέσιμο στο πρόγραμμα Collect, το οποίο κοστίζει <strong>${formattedPrice}</strong> ανά μέλος τον μήνα.</muted-text>`,
        note: (subscriptionLink: string) =>
            `<muted-text>Δημιουργήστε έναν χώρο εργασίας για να αποκτήσετε πρόσβαση σε αυτήν τη λειτουργία ή <a href="${subscriptionLink}">μάθετε περισσότερα</a> σχετικά με τα πλάνα και τις τιμές μας.</muted-text>`,
        workspaceCreated: 'Ο χώρος εργασίας δημιουργήθηκε',
        newWorkspace: 'Δημιουργήσατε ένα χώρο εργασίας!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `<centered-text>Είστε έτοιμοι να προσθέσετε επιπλέον κάρτες. <a href="${subscriptionLink}">Δείτε τη συνδρομή σας</a> για περισσότερες λεπτομέρειες.</centered-text>`,
    },
    walletPage: {
        balance: 'Υπόλοιπο',
        paymentMethodsTitle: 'Μέθοδοι πληρωμής',
        setDefaultConfirmation: 'Ορισμός ως προεπιλεγμένης μεθόδου πληρωμής',
        setDefaultSuccess: 'Ορίστηκε η προεπιλεγμένη μέθοδος πληρωμής!',
        deleteAccount: 'Διαγραφή λογαριασμού',
        deleteConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον λογαριασμό;',
        deleteCard: 'Διαγραφή κάρτας',
        deleteCardConfirmation:
            'Όλες οι μη υποβληθείσες συναλλαγές κάρτας, συμπεριλαμβανομένων αυτών σε ανοικτές αναφορές, θα αφαιρεθούν. Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτήν την κάρτα; Δεν μπορείτε να αναιρέσετε αυτήν την ενέργεια.',
        error: {
            notOwnerOfBankAccount: 'Παρουσιάστηκε σφάλμα κατά τον ορισμό αυτού του τραπεζικού λογαριασμού ως προεπιλεγμένης μεθόδου πληρωμής σας',
            invalidBankAccount: 'Αυτός ο τραπεζικός λογαριασμός έχει ανασταλεί προσωρινά',
            notOwnerOfFund: 'Προέκυψε σφάλμα κατά τον ορισμό αυτής της κάρτας ως προεπιλεγμένης μεθόδου πληρωμής σας',
            setDefaultFailure: 'Κάτι πήγε στραβά. Παρακαλούμε συνομιλήστε με το Concierge για περαιτέρω βοήθεια.',
        },
        addBankAccountFailure: 'Παρουσιάστηκε ένα απρόσμενο σφάλμα κατά την προσπάθεια προσθήκης του τραπεζικού σας λογαριασμού. Παρακαλούμε δοκιμάστε ξανά.',
        getPaidFaster: 'Πληρωθείτε πιο γρήγορα',
        addPaymentMethod: 'Προσθέστε έναν τρόπο πληρωμής για να στέλνετε και να λαμβάνετε πληρωμές απευθείας στην εφαρμογή.',
        getPaidBackFaster: 'Πληρωθείτε πίσω πιο γρήγορα',
        secureAccessToYourMoney: 'Ασφαλής πρόσβαση στα χρήματά σας',
        receiveMoney: 'Λάβετε χρήματα στο τοπικό σας νόμισμα',
        expensifyWallet: 'Πορτοφόλι Expensify (Beta)',
        sendAndReceiveMoney: 'Στείλτε και λάβετε χρήματα με φίλους. Μόνο τραπεζικοί λογαριασμοί ΗΠΑ.',
        enableWallet: 'Ενεργοποίηση πορτοφολιού',
        addBankAccountToSendAndReceive: 'Προσθέστε έναν τραπεζικό λογαριασμό για να κάνετε ή να λαμβάνετε πληρωμές.',
        addDebitOrCreditCard: 'Προσθέστε χρεωστική ή πιστωτική κάρτα',
        cardInactive: 'Ανενεργό',
        assignedCards: 'Κάρτες',
        assignedCardsDescription: 'Οι συναλλαγές από τις ανατεθειμένες κάρτες συγχρονίζονται αυτόματα.',
        addVirtualCardPersonalDetails: {
            subtitle: 'Παρακαλούμε εισαγάγετε τα προσωπικά σας στοιχεία για να ξεκινήσετε να χρησιμοποιείτε την κάρτα σας',
            cta: 'Προσθέστε λεπτομέρειες',
        },
        expensifyCard: 'Κάρτα Expensify',
        walletActivationPending: 'Εξετάζουμε τις πληροφορίες σας. Παρακαλούμε ελέγξτε ξανά σε λίγα λεπτά!',
        walletActivationFailed: 'Δυστυχώς, το πορτοφόλι σας δεν μπορεί να ενεργοποιηθεί αυτή τη στιγμή. Παρακαλούμε συνομιλήστε με το Concierge για περαιτέρω βοήθεια.',
        addYourBankAccount: 'Προσθέστε τον τραπεζικό σας λογαριασμό',
        addBankAccountBody: 'Ας συνδέσουμε τον τραπεζικό σας λογαριασμό με το Expensify ώστε να είναι πιο εύκολο από ποτέ να στέλνετε και να λαμβάνετε πληρωμές απευθείας στην εφαρμογή.',
        chooseYourBankAccount: 'Επιλέξτε τον τραπεζικό σας λογαριασμό',
        chooseAccountBody: 'Βεβαιωθείτε ότι επιλέγετε το σωστό.',
        confirmYourBankAccount: 'Επιβεβαιώστε τον τραπεζικό σας λογαριασμό',
        personalBankAccounts: 'Προσωπικοί τραπεζικοί λογαριασμοί',
        businessBankAccounts: 'Επαγγελματικοί τραπεζικοί λογαριασμοί',
        shareBankAccount: 'Κοινοποιήστε τραπεζικό λογαριασμό',
        bankAccountShared: 'Κοινόχρηστος τραπεζικός λογαριασμός',
        shareBankAccountTitle: 'Επιλέξτε τους διαχειριστές με τους οποίους θα μοιραστείτε αυτόν τον τραπεζικό λογαριασμό:',
        shareBankAccountSuccess: 'Ο τραπεζικός λογαριασμός κοινοποιήθηκε!',
        shareBankAccountSuccessDescription: 'Οι επιλεγμένοι διαχειριστές θα λάβουν ένα μήνυμα επιβεβαίωσης από το Concierge.',
        shareBankAccountFailure: 'Προέκυψε ένα απροσδόκητο σφάλμα κατά την προσπάθεια κοινής χρήσης του τραπεζικού λογαριασμού. Παρακαλούμε δοκιμάστε ξανά.',
        shareBankAccountEmptyTitle: 'Δεν υπάρχουν διαθέσιμοι διαχειριστές',
        shareBankAccountEmptyDescription: 'Δεν υπάρχουν διαχειριστές χώρου εργασίας με τους οποίους μπορείτε να μοιραστείτε αυτόν τον τραπεζικό λογαριασμό.',
        shareBankAccountNoAdminsSelected: 'Παρακαλούμε επιλέξτε έναν διαχειριστή πριν συνεχίσετε',
        unshareBankAccount: 'Κατάργηση κοινής χρήσης τραπεζικού λογαριασμού',
        unshareBankAccountDescription:
            'Όλα τα παρακάτω άτομα έχουν πρόσβαση σε αυτόν τον τραπεζικό λογαριασμό. Μπορείτε να καταργήσετε την πρόσβαση οποιαδήποτε στιγμή. Θα ολοκληρώσουμε κανονικά όλες τις πληρωμές που βρίσκονται ήδη σε εξέλιξη.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) =>
            `Ο/Η ${admin} θα χάσει την πρόσβαση σε αυτόν τον επαγγελματικό τραπεζικό λογαριασμό. Θα ολοκληρώσουμε κανονικά όλες τις πληρωμές που βρίσκονται ήδη σε εξέλιξη.`,
        reachOutForHelp: 'Χρησιμοποιείται με την Κάρτα Expensify. <concierge-link>Επικοινωνήστε με το Concierge</concierge-link> αν χρειάζεται να σταματήσετε την κοινή χρήση της.',
        unshareErrorModalTitle: `Δεν είναι δυνατή η κατάργηση κοινής χρήσης του τραπεζικού λογαριασμού`,
        travelCVV: {
            title: 'CVV ταξιδιού',
            subtitle: 'Χρησιμοποιήστε το για κρατήσεις ταξιδιών',
            description: 'Χρησιμοποιήστε αυτήν την κάρτα για τις κρατήσεις σας στο Expensify Travel. Θα εμφανίζεται ως «Travel Card» κατά την πληρωμή.',
        },
        chaseAccountNumberDifferent: 'Γιατί ο αριθμός του λογαριασμού μου είναι διαφορετικός;',
    },
    cardPage: {
        expensifyCard: 'Κάρτα Expensify',
        expensifyTravelCard: 'Κάρτα Expensify Travel',
        availableSpend: 'Υπόλοιπο ορίου',
        smartLimit: {
            name: 'Έξυπνο όριο',
            title: (formattedLimit: string) => `Μπορείτε να ξοδέψετε έως ${formattedLimit} με αυτήν την κάρτα και το όριο θα επανέρχεται καθώς εγκρίνονται οι υποβληθείσες δαπάνες σας.`,
        },
        fixedLimit: {
            name: 'Σταθερό όριο',
            title: (formattedLimit: string) => `Μπορείτε να ξοδέψετε έως και ${formattedLimit} με αυτήν την κάρτα και μετά θα απενεργοποιηθεί.`,
        },
        monthlyLimit: {
            name: 'Μηνιαίο όριο',
            title: (formattedLimit: string) => `Μπορείτε να ξοδεύετε έως ${formattedLimit} με αυτήν την κάρτα κάθε μήνα. Το όριο θα επανέρχεται την 1η ημέρα κάθε ημερολογιακού μήνα.`,
        },
        virtualCardNumber: 'Αριθμός εικονικής κάρτας',
        travelCardCvv: 'CVV ταξιδιωτικής κάρτας',
        physicalCardNumber: 'Αριθμός φυσικής κάρτας',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Αποκτήστε φυσική κάρτα',
        reportFraud: 'Αναφορά απάτης εικονικής κάρτας',
        reportTravelFraud: 'Αναφορά απάτης εταιρικής κάρτας',
        spendRules: 'Κανόνες δαπανών',
        editSpendRules: 'Επεξεργαστείτε κανόνες δαπανών',
        reviewTransaction: 'Επισκόπηση συναλλαγής',
        suspiciousBannerTitle: 'Ύποπτη συναλλαγή',
        suspiciousBannerDescription: 'Παρατηρήσαμε ύποπτες συναλλαγές στην κάρτα σας. Πατήστε παρακάτω για να τις ελέγξετε.',
        cardLocked: 'Η κάρτα σας έχει κλειδωθεί προσωρινά όσο η ομάδα μας εξετάζει τον λογαριασμό της εταιρείας σας.',
        markTransactionsAsReimbursable: 'Σημειώστε τις συναλλαγές ως αποζημιώσιμες',
        markTransactionsDescription: 'Όταν είναι ενεργοποιημένο, οι συναλλαγές που εισάγονται από αυτήν την κάρτα επισημαίνονται ως επιστρέψιμες από προεπιλογή.',
        csvCardDescription: 'Εισαγωγή CSV',
        cardDetails: {
            cardNumber: 'Αριθμός εικονικής κάρτας',
            expiration: 'Λήξη',
            cvv: 'CVV',
            address: 'Διεύθυνση',
            reveal: 'Εμφάνιση',
            revealDetails: 'Εμφάνιση λεπτομερειών',
            revealCvv: 'Εμφάνιση CVV',
            copyCardNumber: 'Αντιγραφή αριθμού κάρτας',
            copyCvv: 'Αντιγραφή CVV',
            updateAddress: 'Ενημέρωση διεύθυνσης',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Προστέθηκε στο πορτοφόλι ${platform}`,
        cardDetailsLoadingFailure: 'Παρουσιάστηκε σφάλμα κατά τη φόρτωση των στοιχείων της κάρτας. Παρακαλούμε ελέγξτε τη σύνδεσή σας στο διαδίκτυο και δοκιμάστε ξανά.',
        validateCardTitle: 'Ας βεβαιωθούμε ότι είστε εσείς',
        enterMagicCode: (contactMethod: string) =>
            `Παρακαλούμε εισαγάγετε τον μαγικό κωδικό που στάλθηκε στο ${contactMethod} για να δείτε τα στοιχεία της κάρτας σας. Θα πρέπει να φτάσει μέσα σε ένα ή δύο λεπτά.`,
        unexpectedError: 'Παρουσιάστηκε σφάλμα κατά την προσπάθεια ανάκτησης των στοιχείων της κάρτας σας Expensify. Παρακαλούμε δοκιμάστε ξανά.',
        cardFraudAlert: {
            confirmButtonText: 'Ναι, το κάνω',
            reportFraudButtonText: 'Όχι, δεν ήμουν εγώ',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `καθαρίστηκε η ύποπτη δραστηριότητα και επανενεργοποιήθηκε η κάρτα x${cardLastFour}. Είστε έτοιμοι να συνεχίσετε να καταχωρίζετε έξοδα!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `απενεργοποίησε την κάρτα που λήγει σε ${cardLastFour}`,
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
            }) => `εντοπίστηκε ύποπτη δραστηριότητα στην κάρτα που λήγει σε ${cardLastFour}. Αναγνωρίζετε αυτή τη χρέωση;

${amount} για ${merchant} - ${date}`,
        },
        setYourPin: 'Ορίστε το PIN για την κάρτα σας.',
        confirmYourPin: 'Εισαγάγετε ξανά το PIN σας για επιβεβαίωση.',
        changeYourPin: 'Εισαγάγετε ένα νέο PIN για την κάρτα σας.',
        confirmYourChangedPin: 'Επιβεβαιώστε το νέο PIN σας.',
        pinMustBeFourDigits: 'Το PIN πρέπει να αποτελείται από ακριβώς 4 ψηφία.',
        invalidPin: 'Παρακαλούμε επιλέξτε ένα πιο ασφαλές PIN.',
        pinMismatch: 'Τα PIN δεν ταιριάζουν. Παρακαλούμε δοκιμάστε ξανά.',
        revealPin: 'Εμφάνιση PIN',
        hidePin: 'Απόκρυψη PIN',
        pin: 'PIN',
        pinChanged: 'Ο κωδικός PIN άλλαξε!',
        pinChangedHeader: 'Το PIN άλλαξε',
        pinChangedDescription: 'Είστε πλέον έτοιμοι να χρησιμοποιήσετε το PIN σας.',
        cardUnblocked: 'Η κάρτα ξεμπλοκαρίστηκε!',
        cardUnblockedDescription: 'Ενδέχεται να σας ζητηθεί να εισαγάγετε την κάρτα σας στο τερματικό την επόμενη φορά που θα πραγματοποιήσετε αγορά.',
        pinBlocked: 'Η κάρτα σας έχει μπλοκαριστεί λόγω λανθασμένων καταχωρίσεων PIN.',
        unblock: 'Άρση αποκλεισμού',
        unblockCard: 'Ξεκλειδώστε την κάρτα',
        changePin: 'Αλλαγή PIN',
        changePinAtATM: 'Αλλάξτε το PIN σας σε οποιοδήποτε ATM',
        changePinAtATMDescription: 'Αυτό απαιτείται στην περιοχή σας. <concierge-link>Επικοινωνήστε με το Concierge</concierge-link> αν έχετε οποιεσδήποτε ερωτήσεις.',
        freezeCard: 'Παγώστε την κάρτα',
        unfreeze: 'Ξεπαγώστε',
        unfreezeCard: 'Ξεμπλοκάρετε την κάρτα',
        askToUnfreeze: 'Αίτημα για άρση παγώματος',
        freezeDescription: 'Μια παγωμένη κάρτα δεν μπορεί να χρησιμοποιηθεί για αγορές και συναλλαγές. Μπορείτε να την ξεπαγώσετε οποτεδήποτε.',
        unfreezeDescription: 'Η άρση του παγώματος αυτής της κάρτας θα επιτρέψει ξανά αγορές και συναλλαγές. Προχωρήστε μόνο αν είστε βέβαιοι ότι η κάρτα είναι ασφαλής για χρήση.',
        frozen: 'Παγερό',
        youFroze: ({date}: {date: string}) => `Απενεργοποιήσατε αυτή την κάρτα στις ${date}.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `Ο/Η ${person} πάγωσε αυτήν την κάρτα στις ${date}.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `Αυτή η κάρτα ανεστάλη στις ${date} από`,
        frozenByAdminNeedsUnfreezePrefix: 'Αυτή η κάρτα πάγωσε από',
        frozenByAdminNeedsUnfreezeSuffix: '. Παρακαλούμε επικοινωνήστε με έναν διαχειριστή για να το ξεπαγώσει.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) =>
            `Αυτή η κάρτα πάγωσε από τον/την ${person}. Παρακαλούμε επικοινωνήστε με έναν διαχειριστή για να την ενεργοποιήσετε ξανά.`,
    },
    workflowsPage: {
        workflowTitle: 'Δαπάνη',
        workflowDescription: 'Ρυθμίστε μια ροή εργασίας από τη στιγμή που πραγματοποιείται η δαπάνη, συμπεριλαμβανομένης της έγκρισης και της πληρωμής.',
        submissionFrequency: 'Υποβολές',
        submissionFrequencyDescription: 'Επιλέξτε ένα προσαρμοσμένο πρόγραμμα για την υποβολή εξόδων.',
        submissionFrequencyDateOfMonth: 'Ημερομηνία μήνα',
        disableApprovalPromptDescription: 'Η απενεργοποίηση των εγκρίσεων θα διαγράψει όλες τις υπάρχουσες ροές εργασίας έγκρισης.',
        addApprovalsTitle: 'Εγκρίσεις',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `έξοδα από ${members}, και ο εγκρίνων είναι ο/η ${approvers}`,
        addApprovalButton: 'Προσθήκη ροής έγκρισης',
        loadMoreWorkflows: ({count}: {count: number}) => `Φόρτωση ακόμη ${count}`,
        editWorkflowAction: 'Επεξεργασία',
        findWorkflow: 'Εύρεση ροής εργασίας',
        addApprovalTip: 'Αυτή η προεπιλεγμένη ροή εργασιών ισχύει για όλα τα μέλη, εκτός εάν υπάρχει πιο συγκεκριμένη ροή εργασιών.',
        approver: 'Έγκριση',
        addApprovalsDescription: 'Να απαιτείται πρόσθετη έγκριση πριν από την έγκριση μιας πληρωμής.',
        configureViaHR: ({provider}: {provider: string}) => `Ρυθμίστε μέσω ${provider}.`,
        hrApprovalWorkflowLockedPrompt: ({provider}: {provider: string}) =>
            `Οι εγκρίσεις διαχειρίζονται από την ενοποίηση με το ${provider}. Για να ενημερώσετε τη ροή εργασίας εγκρίσεών σας, μεταβείτε στις ρυθμίσεις σύνδεσης του ${provider}.`,
        goToHRSettings: ({provider}: {provider: string}) => `Μεταβείτε στις ρυθμίσεις του ${provider}`,
        approverFromProvider: ({provider}: {provider: string}) => `από ${provider}`,
        finalApprover: 'Τελικός εγκρίνων',
        manager: 'Διαχειριστής',
        makeOrTrackPaymentsTitle: 'Πληρωμές',
        makeOrTrackPaymentsDescription: 'Προσθέστε ένα εξουσιοδοτημένο πρόσωπο πληρωμής για πληρωμές που γίνονται στο Expensify ή παρακολουθήστε πληρωμές που έγιναν αλλού.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Μια προσαρμοσμένη ροή έγκρισης είναι ενεργοποιημένη σε αυτόν τον χώρο εργασίας. Για να ελέγξετε ή να αλλάξετε αυτήν τη ροή, επικοινωνήστε με τον/την <account-manager-link>Account Manager</account-manager-link> σας ή το <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Μία προσαρμοσμένη ροή έγκρισης είναι ενεργοποιημένη σε αυτόν τον χώρο εργασίας. Για να ελέγξετε ή να αλλάξετε αυτήν τη ροή, επικοινωνήστε με τον/την <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Επιλέξτε πόσο χρόνο θα περιμένει το Expensify πριν κοινοποιήσει δαπάνες χωρίς σφάλματα.',
        },
        frequencyDescription: 'Επιλέξτε πόσο συχνά θέλετε να υποβάλλονται αυτόματα οι δαπάνες ή ορίστε χειροκίνητη υποβολή',
        frequencies: {
            instant: 'Άμεσα',
            weekly: 'Εβδομαδιαία',
            monthly: 'Μηνιαίως',
            twiceAMonth: 'Δύο φορές τον μήνα',
            byTrip: 'Ανά ταξίδι',
            manually: 'Μη αυτόματα',
            daily: 'Καθημερινά',
            lastDayOfMonth: 'Τελευταία ημέρα του μήνα',
            lastBusinessDayOfMonth: 'Τελευταία εργάσιμη ημέρα του μήνα',
            ordinals: {
                one: 'στ',
                two: '2η',
                few: 'ημ.',
                other: 'ημ.',
                '1': 'Πρώτο',
                '2': 'Δεύτερο',
                '3': 'Τρίτο',
                '4': 'Τέταρτο',
                '5': 'Πέμπτο',
                '6': 'Έκτος',
                '7': 'Έβδομος',
                '8': 'Όγδοο',
                '9': 'Ένατος',
                '10': 'Δέκατο',
            },
        },
        approverInMultipleWorkflows: 'Αυτό το μέλος ανήκει ήδη σε άλλη ροή έγκρισης. Τυχόν ενημερώσεις εδώ θα αντικατοπτρίζονται και εκεί.',
        approverCircularReference: (name1: string, name2: string) =>
            `Ο/Η <strong>${name1}</strong> ήδη εγκρίνει αναφορές προς τον/την <strong>${name2}</strong>. Παρακαλούμε επιλέξτε διαφορετικό εγκρίνων για να αποφύγετε έναν κυκλικό κύκλο έγκρισης.`,
        emptyContent: {
            title: 'Δεν υπάρχουν μέλη προς εμφάνιση',
            expensesFromSubtitle: 'Όλα τα μέλη του χώρου εργασίας ανήκουν ήδη σε μια υπάρχουσα ροή έγκρισης.',
            approverSubtitle: 'Όλοι οι εγκριτές ανήκουν σε μια υπάρχουσα ροή εργασίας.',
            bulkApproverSubtitle: 'Κανένας εγκρίνων δεν ταιριάζει στα κριτήρια για τις επιλεγμένες αναφορές.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Δεν ήταν δυνατή η αλλαγή της συχνότητας υποβολής. Δοκιμάστε ξανά ή επικοινωνήστε με την υποστήριξη.',
        monthlyOffsetErrorMessage: 'Η μηνιαία συχνότητα δεν μπόρεσε να αλλάξει. Δοκιμάστε ξανά ή επικοινωνήστε με την υποστήριξη.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Επιβεβαιώστε',
        header: 'Προσθέστε περισσότερους εγκριτές και επιβεβαιώστε.',
        additionalApprover: 'Πρόσθετος εγκρίνων',
        submitButton: 'Προσθήκη ροής εργασίας',
    },
    workflowsEditApprovalsPage: {
        title: 'Επεξεργασία ροής έγκρισης',
        deleteTitle: 'Διαγραφή ροής έγκρισης',
        deletePrompt: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή τη ροή έγκρισης; Όλα τα μέλη θα ακολουθούν στη συνέχεια την προεπιλεγμένη ροή.',
    },
    workflowsExpensesFromPage: {
        title: 'Έξοδα από',
        header: 'Όταν τα παρακάτω μέλη υποβάλλουν δαπάνες:',
        memberAlreadyInWorkflowTitle: 'Το μέλος συμμετέχει ήδη σε ροή εργασίας',
        memberAlreadyInWorkflowPrompt: ({memberName, approverName}: {memberName: string; approverName: string}) =>
            `Ο/Η ${memberName} βρίσκεται ήδη σε ροή έγκρισης που υποβάλλεται σε ${approverName}. Η προσθήκη τους εδώ θα τους μετακινήσει σε αυτήν τη ροή.`,
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Δεν ήταν δυνατή η αλλαγή του εγκρίνοντα. Δοκιμάστε ξανά ή επικοινωνήστε με την υποστήριξη.',
        title: 'Ορίστε εγκριτή',
        description: 'Αυτό το άτομο θα εγκρίνει τα έξοδα.',
    },
    workflowsApprovalLimitPage: {
        title: 'Έγκριση',
        header: '(Προαιρετικά) Θέλετε να προσθέσετε ένα όριο έγκρισης;',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Προσθέστε έναν ακόμη εγκρίνοντα όταν ο/η <strong>${approverName}</strong> είναι εγκρίνοντας και η αναφορά υπερβαίνει το παρακάτω ποσό:`
                : 'Προσθέστε έναν ακόμη εγκριθέντα όταν μια αναφορά υπερβαίνει το παρακάτω ποσό:',
        reportAmountLabel: 'Ποσό αναφοράς',
        additionalApproverLabel: 'Πρόσθετος εγκρίνων',
        skip: 'Παράλειψη',
        next: 'Επόμενο',
        removeLimit: 'Κατάργηση ορίου',
        enterAmountError: 'Παρακαλούμε εισαγάγετε ένα έγκυρο ποσό',
        enterApproverError: 'Απαιτείται εγκρίνων όταν ορίζετε όριο αναφοράς',
        enterBothError: 'Εισαγάγετε ένα ποσό αναφοράς και επιπλέον εγκρίνοντα',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Αναφορές πάνω από ${approvalLimit} προωθούνται στον/στην ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Εξουσιοδοτημένος πληρωτής',
        genericErrorMessage: 'Δεν ήταν δυνατή η αλλαγή του εξουσιοδοτημένου πληρωτή. Παρακαλούμε δοκιμάστε ξανά.',
        admins: 'Διαχειριστές',
        payer: 'Πληρωτής',
        paymentAccount: 'Λογαριασμός πληρωμών',
        shareBankAccount: {
            shareTitle: 'Κοινοποίηση πρόσβασης στον τραπεζικό λογαριασμό;',
            shareDescription: ({admin}: {admin: string}) => `Θα χρειαστεί να μοιραστείτε την πρόσβαση στον τραπεζικό λογαριασμό με τον/την ${admin} για να τον/την κάνετε πληρωτή.`,
            validationTitle: 'Ο τραπεζικός λογαριασμός αναμένει επιβεβαίωση',
            validationDescription: ({admin}: {admin: string}) =>
                `Πρέπει να <a href="#">επικυρώσετε αυτόν τον τραπεζικό λογαριασμό</a>. Μόλις ολοκληρωθεί αυτό, μπορείτε να μοιραστείτε την πρόσβαση στον τραπεζικό λογαριασμό με τον/την ${admin} ώστε να τον/την κάνετε πληρωτή.`,
            errorTitle: 'Δεν είναι δυνατή η αλλαγή του πληρωτή',
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `Ο/Η ${admin} δεν έχει πρόσβαση σε αυτόν τον τραπεζικό λογαριασμό, επομένως δεν μπορείτε να τον/την ορίσετε ως πληρωτή. <a href="#">Συνομιλήστε με τον/την ${owner}</a> αν ο τραπεζικός λογαριασμός πρέπει να κοινοποιηθεί.`,
        },
    },
    reportFraudPage: {
        title: 'Αναφορά απάτης εικονικής κάρτας',
        description:
            'Αν τα στοιχεία της εικονικής σας κάρτας έχουν κλαπεί ή παραβιαστεί, θα απενεργοποιήσουμε οριστικά την υπάρχουσα κάρτα σας και θα σας παρέχουμε μια νέα εικονική κάρτα και αριθμό.',
        deactivateCard: 'Απενεργοποίηση κάρτας',
        reportVirtualCardFraud: 'Αναφορά απάτης εικονικής κάρτας',
    },
    reportFraudConfirmationPage: {
        title: 'Δηλώθηκε απάτη κάρτας',
        description: 'Απενεργοποιήσαμε οριστικά την τρέχουσα κάρτα σας. Όταν επιστρέψετε για να δείτε τα στοιχεία της κάρτας σας, θα έχετε διαθέσιμη μια νέα εικονική κάρτα.',
        descriptionCardNotReplaced: 'Η κάρτα σας απενεργοποιήθηκε οριστικά. Παρακαλούμε επικοινωνήστε με έναν διαχειριστή για την έκδοση νέας κάρτας.',
        buttonText: 'Το κατάλαβα, ευχαριστώ!',
    },
    activateCardPage: {
        activateCard: 'Ενεργοποίηση κάρτας',
        pleaseEnterLastFour: 'Παρακαλούμε εισαγάγετε τα τελευταία τέσσερα ψηφία της κάρτας σας.',
        activatePhysicalCard: 'Ενεργοποίηση φυσικής κάρτας',
        error: {
            thatDidNotMatch: 'Αυτό δεν ταίριαζε με τα τελευταία 4 ψηφία της κάρτας σας. Παρακαλούμε δοκιμάστε ξανά.',
        },
    },
    getPhysicalCard: {
        header: 'Αποκτήστε φυσική κάρτα',
        nameMessage: 'Εισαγάγετε το όνομα και το επώνυμό σας, καθώς έτσι θα εμφανίζονται στην κάρτα σας.',
        legalName: 'Νομικό όνομα',
        legalFirstName: 'Επίσημο μικρό όνομα',
        legalLastName: 'Επώνυμο (όπως αναγράφεται στα επίσημα έγγραφα)',
        phoneMessage: 'Εισαγάγετε τον αριθμό τηλεφώνου σας.',
        phoneNumber: 'Αριθμός τηλεφώνου',
        address: 'Διεύθυνση',
        addressMessage: 'Εισαγάγετε τη διεύθυνση αποστολής σας.',
        streetAddress: 'Οδός και αριθμός',
        city: 'Πόλη',
        state: 'Πολιτεία',
        zipPostcode: 'Τ.Κ./Ταχυδρομικός κώδικας',
        country: 'Χώρα',
        confirmMessage: 'Παρακαλούμε επιβεβαιώστε τα στοιχεία σας παρακάτω.',
        estimatedDeliveryMessage: 'Η φυσική σας κάρτα θα φτάσει σε 2–3 εργάσιμες ημέρες.',
        next: 'Επόμενο',
        getPhysicalCard: 'Αποκτήστε φυσική κάρτα',
        shipCard: 'Αποστολή κάρτας',
    },
    transferAmountPage: {
        transfer: (amount: string) => `Μεταφορά${amount ? ` ${amount}` : ''}`,
        instant: 'Άμεσος (χρεωστική κάρτα)',
        instantSummary: (rate: string, minAmount: string) => `προμήθεια ${rate}% (ελάχιστο ${minAmount})`,
        ach: '1-3 εργάσιμες ημέρες (τραπεζικός λογαριασμός)',
        achSummary: 'Χωρίς χρέωση',
        whichAccount: 'Ποιος λογαριασμός;',
        fee: 'Χρέωση',
        transferSuccess: 'Η μεταφορά ολοκληρώθηκε με επιτυχία!',
        transferDetailBankAccount: 'Τα χρήματά σας θα φτάσουν μέσα στις επόμενες 1–3 εργάσιμες ημέρες.',
        transferDetailDebitCard: 'Τα χρήματά σας θα πρέπει να φτάσουν άμεσα.',
        failedTransfer: 'Το υπόλοιπό σας δεν έχει τακτοποιηθεί πλήρως. Παρακαλούμε μεταφέρετέ το σε τραπεζικό λογαριασμό.',
        notHereSubTitle: 'Παρακαλούμε μεταφέρετε το υπόλοιπό σας από τη σελίδα πορτοφολιού',
        goToWallet: 'Μετάβαση στο πορτοφόλι',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Επιλέξτε λογαριασμό',
    },
    paymentMethodList: {
        addPaymentMethod: 'Προσθήκη μεθόδου πληρωμής',
        addNewDebitCard: 'Προσθήκη νέας χρεωστικής κάρτας',
        addNewBankAccount: 'Προσθέστε νέο τραπεζικό λογαριασμό',
        accountLastFour: 'Λήγει σε',
        cardLastFour: 'Κάρτα που λήγει σε',
        addFirstPaymentMethod: 'Προσθέστε έναν τρόπο πληρωμής για να στέλνετε και να λαμβάνετε πληρωμές απευθείας στην εφαρμογή.',
        defaultPaymentMethod: 'Προεπιλογή',
        bankAccountLastFour: (lastFour: string) => `Τραπεζικός λογαριασμός • ${lastFour}`,
    },
    agentsPage: {
        title: 'Πράκτορες',
        subtitle: `<muted-text>Οι agents διαχειρίζονται τις ροές εργασιών σας για εσάς, ώστε να κερδίζετε πίσω ώρες από την ημέρα σας. <a href="${CONST.CUSTOM_AGENTS_HELP_URL}">Μάθετε περισσότερα</a>.</muted-text>`,
        newAgent: 'Νέος εκπρόσωπος',
        emptyAgents: {
            title: 'Δεν έχουν δημιουργηθεί εκπρόσωποι',
            subtitle: `<muted-text><centered-text>Σταματήστε να κάνετε πράγματα χειροκίνητα. Δώστε οδηγίες σε έναν agent και εξοικονομήστε πολύ χρόνο. <a href="${CONST.CUSTOM_AGENTS_HELP_URL}">Μάθετε περισσότερα</a>.</centered-text></muted-text>`,
        },
        error: {
            genericAdd: 'Παρουσιάστηκε πρόβλημα κατά την προσθήκη αυτού του εκπρόσωπου',
            genericUpdate: 'Προέκυψε πρόβλημα κατά την ενημέρωση αυτού του εκπροσώπου',
            updateName: 'Παρουσιάστηκε πρόβλημα κατά την ενημέρωση του ονόματος αυτού του αντιπροσώπου',
            updatePrompt: 'Παρουσιάστηκε πρόβλημα κατά την ενημέρωση των οδηγιών αυτού του αντιπροσώπου',
            updateAvatar: 'Παρουσιάστηκε πρόβλημα κατά την ενημέρωση του avatar αυτού του αντιπροσώπου',
        },
    },
    addAgentPage: {
        title: 'Νέος εκπρόσωπος',
        agentName: 'Όνομα αντιπροσώπου',
        instructions: 'Γράψτε προσαρμοσμένες οδηγίες',
        createAgent: 'Δημιουργία εκπροσώπου',
        editAvatar: 'Επεξεργασία avatar',
        defaultAgentName: (displayName: string) => `Εκπρόσωπος του/της ${displayName}`,
        defaultPrompt:
            'Απορρίπτετε δαπάνες που αφορούν τζόγο, ταινίες ή άλλες προφανώς μη επαγγελματικές αιτίες.\n\nΥπενθυμίζετε στον χρήστη να περιλαμβάνει πάντα μια εικόνα απόδειξης όπου το φιλοδώρημα φαίνεται ξεκάθαρα.\n\nΕγκρίνετε την αναφορά εάν είναι πολύ παρόμοια με προηγούμενες αναφορές από τον ίδιο χρήστη.\n\nΑπορρίπτετε αναφορές με πάνω από $500 σε δαπάνες ταξιδιού.',
        copilotNote: 'Αυτός ο πράκτορας θα προστεθεί ως πλήρης βοηθός του λογαριασμού σας, ώστε να μπορεί να ενεργεί εκ μέρους σας.',
    },
    editAgentPage: {
        title: 'Επεξεργασία αντιπροσώπου',
        agentName: 'Όνομα αντιπροσώπου',
        instructions: 'Γράψτε προσαρμοσμένες οδηγίες',
        chatWithAgent: 'Συνομιλήστε με εκπρόσωπο',
        copilotIntoAccount: 'Οδηγός εντός λογαριασμού',
        deleteAgent: 'Διαγραφή υπαλλήλου',
        deleteAgentTitle: 'Διαγραφή υπαλλήλου;',
        deleteAgentMessage: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον αντιπρόσωπο; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.',
    },
    editAgentAvatarPage: {
        title: 'Επεξεργασία avatar',
    },
    editAgentNamePage: {
        title: 'Όνομα αντιπροσώπου',
    },
    editAgentPromptPage: {
        title: 'Γράψτε προσαρμοσμένες οδηγίες',
        error: {
            emptyPrompt: 'Παρακαλοῦμε εισαγάγετε οδηγίες για τον αντιπρόσωπό σας.',
        },
    },
    expenseRulesPage: {
        title: 'Κανόνες εξόδων',
        subtitle: 'Αυτοί οι κανόνες θα ισχύουν για τις δαπάνες σας.',
        findRule: 'Εύρεση κανόνα',
        emptyRules: {
            title: 'Δεν υπάρχουν ακόμη κανόνες',
            subtitle: 'Προσθέστε έναν κανόνα για την αυτοματοποίηση της αναφοράς εξόδων.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Ενημέρωση δαπάνης ${value ? 'χρεώσιμο' : 'μη χρεώσιμη'}`,
            categoryUpdate: (value: string) => `Ενημέρωση κατηγορίας σε «${value}»`,
            commentUpdate: (value: string) => `Ενημέρωση περιγραφής σε «${value}»`,
            merchantUpdate: (value: string) => `Ενημέρωση εμπόρου σε «${value}»`,
            reimbursableUpdate: (value: boolean) => `Ενημέρωση δαπάνης ${value ? 'επιστρέψιμο' : 'μη αποζημιώσιμα'}`,
            tagUpdate: (value: string) => `Ενημέρωση ετικέτας σε «${value}»`,
            taxUpdate: (value: string) => `Ενημέρωση συντελεστή φόρου σε «${value}»`,
            billable: (value: boolean) => `έξοδο ${value ? 'χρεώσιμο' : 'μη χρεώσιμη'}`,
            category: (value: string) => `κατηγορία σε «${value}»`,
            comment: (value: string) => `περιγραφή σε «${value}»`,
            merchant: (value: string) => `επιχείρηση σε «${value}»`,
            reimbursable: (value: boolean) => `έξοδο ${value ? 'επιστρέψιμο' : 'μη αποζημιώσιμα'}`,
            tag: (value: string) => `προσθέστε ετικέτα σε «${value}»`,
            tax: (value: string) => `συντελεστή φόρου σε «${value}»`,
            report: (value: string) => `προσθέστε σε αναφορά με όνομα «${value}»`,
        },
        newRule: 'Νέος κανόνας',
        addRule: {
            title: 'Προσθήκη κανόνα',
            expenseContains: 'Αν η δαπάνη περιέχει:',
            applyUpdates: 'Έπειτα εφαρμόστε αυτές τις ενημερώσεις:',
            merchantHint: 'Πληκτρολογήστε . για να δημιουργήσετε έναν κανόνα που ισχύει για όλους τους εμπόρους',
            addToReport: 'Προσθήκη σε αναφορά με όνομα',
            createReport: 'Δημιουργήστε αναφορά αν χρειάζεται',
            applyToExistingExpenses: 'Εφαρμογή σε υπάρχουσες αντιστοιχισμένες δαπάνες',
            confirmError: 'Εισαγάγετε τον έμπορο και εφαρμόστε τουλάχιστον μία ενημέρωση',
            confirmErrorMerchant: 'Παρακαλούμε εισαγάγετε τον έμπορο',
            confirmErrorUpdate: 'Παρακαλούμε εφαρμόστε τουλάχιστον μία ενημέρωση',
            saveRule: 'Αποθήκευση κανόνα',
        },
        editRule: {
            title: 'Επεξεργασία κανόνα',
        },
        deleteRule: {
            deleteSingle: 'Διαγραφή κανόνα',
            deleteMultiple: 'Διαγραφή κανόνων',
            deleteSinglePrompt: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον κανόνα;',
            deleteMultiplePrompt: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτούς τους κανόνες;',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'Προτιμήσεις εφαρμογής',
        },
        testSection: {
            title: 'Προτιμήσεις δοκιμών',
            subtitle: 'Ρυθμίσεις για βοήθεια στον εντοπισμό σφαλμάτων και τη δοκιμή της εφαρμογής σε staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Λαμβάνετε σχετικές ενημερώσεις λειτουργιών και νέα της Expensify',
        muteAllSounds: 'Σίγαση όλων των ήχων από το Expensify',
    },
    priorityModePage: {
        priorityMode: 'Λειτουργία προτεραιότητας',
        explainerText:
            'Επιλέξτε αν θέλετε να #focus μόνο σε μη αναγνωσμένες και καρφιτσωμένες συνομιλίες ή να εμφανίζονται όλες, με τις πιο πρόσφατες και καρφιτσωμένες συνομιλίες στην κορυφή.',
        priorityModes: {
            default: {
                label: 'Πιο πρόσφατα',
                description: 'Εμφάνιση όλων των συνομιλιών ταξινομημένων κατά πιο πρόσφατες',
            },
            gsd: {
                label: '#focus',
                description: 'Εμφάνιση μόνο μη αναγνωσμένων με αλφαβητική ταξινόμηση',
            },
        },
    },
    focusModeUpdateModal: {
        title: 'Καλώς ήρθατε στη λειτουργία #focus!',
        prompt: (priorityModePageUrl: string) =>
            `Μείνετε οργανωμένοι βλέποντας μόνο μη αναγνωσμένες συνομιλίες ή συνομιλίες που χρειάζονται την προσοχή σας. Μη σας ανησυχεί, μπορείτε να το αλλάξετε οποιαδήποτε στιγμή από τις <a href="${priorityModePageUrl}">ρυθμίσεις</a>.`,
    },
    inboxTabs: {
        all: 'Όλα',
        todo: 'Εκκρεμότητες',
        unread: 'Μη αναγνωσμένα',
    },
    reportDetailsPage: {
        goToRoom: 'Μετάβαση στο δωμάτιο',
        inWorkspace: (policyName: string) => `στο ${policyName}`,
        generatingPDF: 'Δημιουργία PDF',
        waitForPDF: 'Παρακαλούμε περιμένετε όσο δημιουργούμε το PDF.',
        errorPDF: 'Παρουσιάστηκε σφάλμα κατά την προσπάθεια δημιουργίας του PDF σας',
        successPDF: 'Το PDF σας δημιουργήθηκε! Αν δεν έγινε αυτόματη λήψη, χρησιμοποιήστε το παρακάτω κουμπί.',
    },
    reportDescriptionPage: {
        roomDescription: 'Περιγραφή δωματίου',
        roomDescriptionOptional: 'Περιγραφή δωματίου (προαιρετικό)',
        explainerText: 'Ορίστε προσαρμοσμένη περιγραφή για το δωμάτιο.',
    },
    groupChat: {
        lastMemberTitle: 'Προσοχή!',
        lastMemberWarning: 'Αφού είστε το τελευταίο άτομο εδώ, αν αποχωρήσετε αυτή η συνομιλία θα γίνει μη προσβάσιμη για όλα τα μέλη. Είστε βέβαιος ότι θέλετε να αποχωρήσετε;',
        defaultReportName: (displayName: string) => `ο ομαδικός συνομιλητής του/της ${displayName}`,
    },
    languagePage: {
        language: 'Γλώσσα',
        aiGenerated: 'Οι μεταφράσεις για αυτήν τη γλώσσα δημιουργούνται αυτόματα και ενδέχεται να περιέχουν σφάλματα.',
    },
    themePage: {
        theme: 'Θέμα',
        themes: {
            dark: {
                label: 'Σκουρόχρωμο',
            },
            light: {
                label: 'Ανοιχτόχρωμο',
            },
            system: {
                label: 'Χρήση ρυθμίσεων συσκευής',
            },
        },
        highContrastMode: 'Λειτουργία υψηλής αντίθεσης',
        enableHighContrast: 'Ενεργοποίηση υψηλής αντίθεσης',
        disableHighContrast: 'Απενεργοποίηση υψηλής αντίθεσης',
        chooseThemeBelowOrSync: 'Επιλέξτε ένα θέμα παρακάτω ή συγχρονίστε με τις ρυθμίσεις της συσκευής σας.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Κάνοντας σύνδεση, συμφωνείτε με τους <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Όρους Παροχής Υπηρεσιών</a> και την <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Προστασία Προσωπικών Δεδομένων</a>.</muted-text-xs>`,
        license: `Η μεταφορά χρημάτων παρέχεται από την ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) σύμφωνα με τις <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">άδειές της</a>.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Δεν λάβατε μαγικό κωδικό;',
        avoidScamsMessage: '<strong>Αποφύγετε απάτες. Μην κοινοποιείτε τον κωδικό σας σε κανέναν.</strong> Η ομάδα μας δεν θα σας καλέσει, στείλει μήνυμα ή email για αυτόν τον κωδικό.',
        enterAuthenticatorCode: 'Παρακαλούμε εισαγάγετε τον κωδικό ελέγχου ταυτότητας',
        enterRecoveryCode: 'Παρακαλώ εισαγάγετε τον κωδικό ανάκτησής σας',
        requiredWhen2FAEnabled: 'Απαιτείται όταν είναι ενεργοποιημένος ο 2FA',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Ζητήστε νέο κωδικό σε <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Ζητήστε νέο κωδικό',
        timeRemainingAnnouncement: ({timeRemaining}: {timeRemaining: number}) => `Χρόνος που απομένει: ${timeRemaining} ${timeRemaining === 1 ? 'δευτερόλεπτο' : 'δευτερόλεπτα'}`,
        timeExpiredAnnouncement: 'Ο χρόνος έχει λήξει',
        error: {
            pleaseFillMagicCode: 'Παρακαλούμε εισαγάγετε τον μαγικό κωδικό σας',
            incorrectMagicCode: 'Λανθασμένος ή μη έγκυρος μαγικός κωδικός. Δοκιμάστε ξανά ή ζητήστε έναν νέο κωδικό.',
            pleaseFillTwoFactorAuth: 'Εισαγάγετε τον κωδικό ελέγχου ταυτότητας δύο παραγόντων σας',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Παρακαλούμε συμπληρώστε όλα τα πεδία',
        pleaseFillPassword: 'Παρακαλούμε εισαγάγετε τον κωδικό πρόσβασής σας',
        pleaseFillTwoFactorAuth: 'Παρακαλούμε εισαγάγετε τον κωδικό δύο παραγόντων σας',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Εισαγάγετε τον κωδικό δύο παραγόντων σας για να συνεχίσετε',
        forgot: 'Το ξεχάσατε;',
        requiredWhen2FAEnabled: 'Απαιτείται όταν είναι ενεργοποιημένος ο 2FA',
        error: {
            incorrectPassword: 'Λανθασμένος κωδικός πρόσβασης. Παρακαλούμε δοκιμάστε ξανά.',
            incorrectLoginOrPassword: 'Λανθασμένο όνομα χρήστη ή κωδικός πρόσβασης. Παρακαλούμε δοκιμάστε ξανά.',
            incorrect2fa: 'Λανθασμένος κωδικός δύο παραγόντων. Παρακαλούμε δοκιμάστε ξανά.',
            twoFactorAuthenticationEnabled: 'Έχετε ενεργοποιήσει το 2FA σε αυτόν τον λογαριασμό. Παρακαλούμε συνδεθείτε χρησιμοποιώντας το email ή τον αριθμό τηλεφώνου σας.',
            invalidLoginOrPassword: 'Μη έγκυρο όνομα χρήστη ή κωδικός πρόσβασης. Δοκιμάστε ξανά ή επαναφέρετε τον κωδικό πρόσβασής σας.',
            unableToResetPassword:
                'Δεν μπορέσαμε να αλλάξουμε τον κωδικό πρόσβασής σας. Αυτό πιθανόν οφείλεται σε ληγμένο σύνδεσμο επαναφοράς κωδικού σε παλιό email επαναφοράς. Σας στείλαμε ένα νέο σύνδεσμο ώστε να δοκιμάσετε ξανά. Ελέγξτε τα Εισερχόμενά σας και τον φάκελο Ανεπιθύμητης αλληλογραφίας· θα πρέπει να φτάσει σε λίγα μόνο λεπτά.',
            noAccess: 'Δεν έχετε πρόσβαση σε αυτήν την εφαρμογή. Παρακαλούμε προσθέστε το όνομα χρήστη σας στο GitHub για να αποκτήσετε πρόσβαση.',
            accountLocked: 'Ο λογαριασμός σας έχει κλειδωθεί μετά από πάρα πολλές ανεπιτυχείς προσπάθειες. Προσπαθήστε ξανά μετά από 1 ώρα.',
            fallback: 'Κάτι πήγε στραβά. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Τηλέφωνο ή email',
        error: {
            invalidFormatEmailLogin: 'Το email που καταχωρίσατε δεν είναι έγκυρο. Παρακαλούμε διορθώστε τη μορφή και δοκιμάστε ξανά.',
            agentSignInBlocked:
                'Οι λογαριασμοί agent δεν μπορούν να συνδεθούν απευθείας. Για να χρησιμοποιήσετε έναν agent, συνδεθείτε με τον δικό σας λογαριασμό και αποκτήστε πρόσβαση σε αυτόν μέσω Copilot.',
        },
        cannotGetAccountDetails: 'Δεν ήταν δυνατή η ανάκτηση των στοιχείων του λογαριασμού. Παρακαλούμε δοκιμάστε να συνδεθείτε ξανά.',
        loginForm: 'Φόρμα σύνδεσης',
        notYou: (user: string) => `Δεν είστε ο/η ${user};`,
    },
    onboarding: {
        welcome: 'Καλώς ήρθατε!',
        welcomeSignOffTitleManageTeam: 'Μόλις ολοκληρώσετε τις παραπάνω εργασίες, μπορούμε να εξερευνήσουμε περισσότερες λειτουργίες, όπως ροές έγκρισης και κανόνες!',
        welcomeSignOffTitle: 'Χαίρομαι πολύ που σας γνωρίζω!',
        getStarted: 'Ξεκινήστε',
        whatsYourName: 'Ποιο είναι το όνομά σας;',
        peopleYouMayKnow: 'Δείτε αν η ομάδα σας είναι στο Expensify',
        workspaceYouMayJoin: (domain: string, email: string) =>
            `Εισαγάγετε τον κωδικό που στάλθηκε στο ${email} για να ελέγξετε αν κάποιος από το ${domain} έχει χώρο εργασίας στον οποίο μπορείτε να συμμετάσχετε.`,
        joinAWorkspace: 'Συμμετοχή σε χώρο εργασίας',
        listOfWorkspaces: 'Ακολουθεί η λίστα με τους χώρους εργασίας στους οποίους μπορείτε να συμμετάσχετε.',
        skipForNow: 'Παράλειψη προς το παρόν',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `${employeeCount} μέλος${employeeCount > 1 ? 'ς' : ''} • ${policyOwner}`,
        whereYouWork: 'Πού εργάζεστε;',
        errorSelection: 'Επιλέξτε μια επιλογή για να συνεχίσετε',
        purpose: {
            title: 'Τι θέλετε να κάνετε σήμερα;',
            errorContinue: 'Πατήστε «συνέχεια» για να ολοκληρώσετε τη ρύθμιση',
            errorBackButton: 'Ολοκληρώστε τις ερωτήσεις ρύθμισης για να αρχίσετε να χρησιμοποιείτε την εφαρμογή',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Υποβολή εξόδων στον εργοδότη μου',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Διαχείριση των εξόδων της ομάδας μου',
            [CONST.ONBOARDING_CHOICES.TRACK_BUSINESS]: 'Παρακολουθήστε τα έξοδά μου για την επιχείρησή μου',
            [CONST.ONBOARDING_CHOICES.TRACK_PERSONAL]: 'Οργάνωση των προσωπικών μου δαπανών',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Κάτι άλλο',
        },
        personalTrackGoal: {
            title: 'Τι θέλετε να παρακολουθείτε;',
            [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.INVESTMENT_TRACKING]: 'Κόστη για επενδυτικό ακίνητο',
            [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.HOUSEHOLD_TRACKING]: 'Οικιακά έξοδα',
            [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SIDEPROJECT_TRACKING]: 'Έξοδα παράπλευρου έργου',
            [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE]: 'Κάτι άλλο',
            somethingElsePlaceholder: 'Τι παρακολουθείτε;',
        },
        employees: {
            title: 'Πόσους υπαλλήλους έχετε;',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL]: '1–4 εργαζόμενοι',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM]: '5-10 εργαζόμενοι',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1–10 εργαζόμενοι',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11–50 εργαζόμενοι',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 εργαζόμενοι',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 εργαζόμενοι',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Περισσότεροι από 1.000 εργαζόμενοι',
        },
        accounting: {
            title: 'Χρησιμοποιείτε κάποιο λογιστικό λογισμικό;',
            none: 'Κανένα',
        },
        interestedFeatures: {
            title: 'Σε ποιες δυνατότητες ενδιαφέρεστε;',
            featuresAlreadyEnabled: 'Αυτά είναι τα πιο δημοφιλή χαρακτηριστικά μας:',
            featureYouMayBeInterestedIn: 'Ενεργοποιήστε πρόσθετες λειτουργίες:',
        },
        error: {
            requiredFirstName: 'Παρακαλούμε εισαγάγετε το μικρό σας όνομα για να συνεχίσετε',
        },
        workEmail: {
            title: 'Ποιο είναι το επαγγελματικό σας email;',
            subtitle: 'Το Expensify λειτουργεί καλύτερα όταν συνδέετε το επαγγελματικό σας email.',
            explanationModal: {
                descriptionOne: 'Προωθήστε στο receipts@expensify.com για σάρωση',
                descriptionTwo: 'Γίνετε μέλος των συναδέλφων σας που ήδη χρησιμοποιούν το Expensify',
                descriptionThree: 'Απολαύστε μια πιο προσαρμοσμένη εμπειρία',
            },
            addWorkEmail: 'Προσθήκη επαγγελματικού email',
        },
        workEmailValidation: {
            title: 'Επαληθεύστε το επαγγελματικό σας email',
            magicCodeSent: (workEmail: string | undefined) => `Παρακαλούμε εισαγάγετε τον μαγικό κωδικό που στάλθηκε στο ${workEmail}. Θα πρέπει να φτάσει σε ένα με δύο λεπτά.`,
        },
        workEmailValidationError: {
            publicEmail: 'Παρακαλούμε εισαγάγετε μια έγκυρη επαγγελματική διεύθυνση email από ιδιωτικό domain, π.χ. mitch@company.com',
            sameAsSignupEmail: 'Παρακαλούμε εισαγάγετε ένα διαφορετικό email από αυτό με το οποίο κάνατε εγγραφή',
            offline: 'Δεν μπορέσαμε να προσθέσουμε την επαγγελματική σας διεύθυνση email, καθώς φαίνεται ότι είστε εκτός σύνδεσης',
        },
        workEmail2FAError: 'Αυτό το όνομα χρήστη αντιστοιχεί σε υπάρχον λογαριασμό με ενεργοποιημένο τον έλεγχο ταυτότητας δύο παραγόντων (2FA).',
        singleSignOnError: 'Αυτό το όνομα χρήστη αντιστοιχεί σε υπάρχοντα λογαριασμό με ενεργοποιημένο SSO/SAML.',
        mergeBlockScreen: {
            title: 'Δεν ήταν δυνατή η προσθήκη της εργασιακής διεύθυνσης email',
            subtitle: (workEmail: string | undefined) => `Δεν ήταν δυνατή η προσθήκη του ${workEmail}. Δοκιμάστε ξανά αργότερα στις ρυθμίσεις ή συνομιλήστε με το Concierge για καθοδήγηση.`,
            workAccountClosedSubtitle:
                'Ο επαγγελματικός λογαριασμός που σχετίζεται με αυτό το email είναι κλειστός. Παρακαλούμε επικοινωνήστε με τον διαχειριστή της εταιρείας σας για να τον επανενεργοποιήσει ή εγγραφείτε με διαφορετικό email.',
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Κάντε ένα [test drive](${testDriveURL})`,
                description: ({testDriveURL}) =>
                    `[Κάντε μια σύντομη περιήγηση στο προϊόν](${testDriveURL}) για να δείτε γιατί το Expensify είναι ο ταχύτερος τρόπος για να διαχειρίζεστε τα έξοδά σας.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Κάντε ένα [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `Κάντε μας μια [δοκιμαστική διαδρομή](${testDriveURL}) και εξασφαλίστε για την ομάδα σας *3 μήνες Expensify δωρεάν!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Προσθέστε εγκρίσεις εξόδων',
                description: ({workspaceMoreFeaturesLink}) =>
                    Str.dedent(`
                        *Προσθέστε εγκρίσεις δαπανών* για να ελέγχετε τις δαπάνες της ομάδας σας και να τις κρατάτε υπό έλεγχο.

                        Ορίστε πώς:

                        1. Μεταβείτε στις *Χώροι εργασίας*.
                        2. Επιλέξτε τον χώρο εργασίας σας.
                        3. Κάντε κλικ στο *Περισσότερες δυνατότητες*.
                        4. Ενεργοποιήστε τις *Ροές εργασίας*.
                        5. Μεταβείτε στις *Ροές εργασίας* στον επεξεργαστή χώρου εργασίας.
                        6. Ενεργοποιήστε τις *Εγκρίσεις*.
                        7. Θα οριστείτε ως ο εγκρίνων δαπανών. Μπορείτε να το αλλάξετε σε οποιονδήποτε διαχειριστή αφού προσκαλέσετε την ομάδα σας.

                        [Μετάβαση στις περισσότερες δυνατότητες](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Δημιουργήστε](${workspaceConfirmationLink}) ένα χώρο εργασίας`,
                description: 'Δημιουργήστε έναν χώρο εργασίας και ρυθμίστε τις παραμέτρους με τη βοήθεια του υπεύθυνου εξυπηρέτησης του λογαριασμού σας!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Δημιουργήστε ένα [χώρο εργασίας](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    Str.dedent(`
                        *Δημιουργήστε έναν χώρο εργασίας* για να παρακολουθείτε έξοδα, να σαρώνετε αποδείξεις, να συνομιλείτε και πολλά άλλα.

                        1. Κάντε κλικ στο *Χώροι εργασίας* > *Νέος χώρος εργασίας*.

                        *Ο νέος σας χώρος εργασίας είναι έτοιμος!* [Δείτε τον](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Ρυθμίστε τις [κατηγορίες](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    Str.dedent(`
                        *Ρυθμίστε κατηγορίες* ώστε η ομάδα σας να μπορεί να καταχωρίζει δαπάνες για εύκολη αναφορά.

                        1. Κάντε κλικ στις *χώρους εργασίας*.
                        2. Επιλέξτε τον χώρο εργασίας σας.
                        3. Κάντε κλικ στις *κατηγορίες*.
                        4. Απενεργοποιήστε τυχόν κατηγορίες που δεν χρειάζεστε.
                        5. Προσθέστε τις δικές σας κατηγορίες επάνω δεξιά.

                        [Μετάβαση στις ρυθμίσεις κατηγοριών χώρου εργασίας](${workspaceCategoriesLink}).`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Δημιουργία δαπάνης',
                description: Str.dedent(`
                    *Δημιουργήστε μια δαπάνη* εισάγοντας ένα ποσό ή σκανάροντας μια απόδειξη.


                    1. Κάντε κλικ στο κουμπί *+*.
                    2. Επιλέξτε *Δημιουργία δαπάνης*.
                    3. Εισαγάγετε ένα ποσό ή σαρώστε μια απόδειξη.
                    4. Προσθέστε το email ή τον αριθμό τηλεφώνου του/της προϊσταμένου σας.
                    5. Κάντε κλικ στο *Δημιουργία*.

                    Και τελειώσατε!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Δημιουργία δαπάνης',
                description: Str.dedent(`
                    *Δημιουργήστε μια δαπάνη* εισάγοντας ένα ποσό ή σαρώνοντας μια απόδειξη.


                    1. Κάντε κλικ στο κουμπί *+*.
                    2. Επιλέξτε *Δημιουργία δαπάνης*.
                    3. Εισαγάγετε ένα ποσό ή σαρώστε μια απόδειξη.
                    4. Επιβεβαιώστε τα στοιχεία.
                    5. Κάντε κλικ στο *Δημιουργία*.

                    Και είστε έτοιμοι!
                `),
            },
            trackExpenseTask: {
                title: 'Παρακολουθήστε μια δαπάνη',
                description: Str.dedent(`
                    *Καταγράψτε μια δαπάνη* σε οποιοδήποτε νόμισμα, είτε έχετε απόδειξη είτε όχι.

                    1. Κάντε κλικ στο κουμπί *+*.
                    2. Επιλέξτε *Δημιουργία δαπάνης*.
                    3. Εισαγάγετε ένα ποσό ή σαρώστε μια απόδειξη.
                    4. Επιλέξτε τον *προσωπικό* σας χώρο.
                    5. Κάντε κλικ στο *Δημιουργία*.

                    Και τελειώσατε! Ναι, είναι τόσο απλό.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Σύνδεση${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'προς'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'σας' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    Str.dedent(`
                        Συνδέστε το ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'σας' : 'σε'} ${integrationName} για αυτόματη κατηγοριοποίηση και συγχρονισμό εξόδων που κάνουν το κλείσιμο μήνα παιχνιδάκι.

                        1. Κάντε κλικ στο *χώρο εργασίας*.
                        2. Επιλέξτε τον χώρο εργασίας σας.
                        3. Κάντε κλικ στο *λογιστική*.
                        4. Βρείτε το ${integrationName}.
                        5. Κάντε κλικ στο *σύνδεση*.

                        [Μετάβαση στη λογιστική](${workspaceAccountingLink}).`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Συνδέστε [τις εταιρικές σας κάρτες](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    Str.dedent(`
                        Συνδέστε τις κάρτες που έχετε ήδη για αυτόματη εισαγωγή συναλλαγών, αντιστοίχιση αποδείξεων και συμφωνία κινήσεων.

                        1. Κάντε κλικ στο *χώρο εργασίας*.
                        2. Επιλέξτε τον χώρο εργασίας σας.
                        3. Κάντε κλικ στις *εταιρικές κάρτες*.
                        4. Ακολουθήστε τις οδηγίες για να συνδέσετε τις κάρτες σας.

                        [Μετάβαση στις εταιρικές κάρτες](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Προσκαλέστε [την ομάδα σας](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    Str.dedent(`
                        *Προσκαλέστε την ομάδα σας* στο Expensify ώστε να μπορεί να αρχίσει να καταγράφει έξοδα από σήμερα.

                        1. Κάντε κλικ στο *χώρο εργασίας*.
                        2. Επιλέξτε τον χώρο εργασίας σας.
                        3. Κάντε κλικ στο *Μέλη* > *Πρόσκληση μέλους*.
                        4. Εισαγάγετε email ή αριθμούς τηλεφώνου.
                        5. Προσθέστε ένα προσαρμοσμένο μήνυμα πρόσκλησης, αν θέλετε!

                        [Μετάβασή μου στα μέλη χώρου εργασίας](${workspaceMembersLink}).`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Πραγματοποιήστε ρύθμιση για [κατηγορίες](${workspaceCategoriesLink}) και [ετικέτες](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    Str.dedent(`
                        *Ρυθμίστε κατηγορίες και ετικέτες* ώστε η ομάδα σας να μπορεί να κωδικοποιεί τις δαπάνες για εύκολη αναφορά.

                        Εισαγάγετέ τες αυτόματα [συνδέοντας το λογιστικό σας πρόγραμμα](${workspaceAccountingLink}) ή ρυθμίστε τες χειροκίνητα από τις [ρυθμίσεις του χώρου εργασίας σας](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Ρυθμίστε τις [ετικέτες](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    Str.dedent(`
                        Χρησιμοποιήστε ετικέτες για να προσθέσετε επιπλέον λεπτομέρειες δαπανών, όπως έργα, πελάτες, τοποθεσίες και τμήματα. Αν χρειάζεστε πολλαπλά επίπεδα ετικετών, μπορείτε να αναβαθμίσετε στο πρόγραμμα Control.

                        1. Κάντε κλικ στο *Workspaces*.
                        2. Επιλέξτε τον χώρο εργασίας σας.
                        3. Κάντε κλικ στο *More features*.
                        4. Ενεργοποιήστε τις *Tags*.
                        5. Μεταβείτε στις *Tags* στον επεξεργαστή χώρου εργασίας.
                        6. Κάντε κλικ στο *+ Add tag* για να δημιουργήσετε τη δική σας.

                        [Μετάβαση σε περισσότερες δυνατότητες](${workspaceMoreFeaturesLink}).`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Προσκαλέστε τον/την [λογιστή σας](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    Str.dedent(`
                        *Προσκαλέστε τον λογιστή σας* να συνεργαστεί στον χώρο εργασίας σας και να διαχειρίζεται τα επαγγελματικά σας έξοδα.

                        1. Κάντε κλικ στο *χώρο εργασίας*.
                        2. Επιλέξτε τον χώρο εργασίας σας.
                        3. Κάντε κλικ στα *μέλη*.
                        4. Κάντε κλικ στο *πρόσκληση μέλους*.
                        5. Εισαγάγετε τη διεύθυνση email του λογιστή σας.

                        [Προσκαλέστε τον λογιστή σας τώρα](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Ξεκινήστε συνομιλία',
                description: Str.dedent(`
                    *Ξεκινήστε μια συζήτηση* με οποιονδήποτε, χρησιμοποιώντας το email ή τον αριθμό τηλεφώνου του.

                    1. Κάντε κλικ στο κουμπί *+*.
                    2. Επιλέξτε *Έναρξη συζήτησης*.
                    3. Εισαγάγετε ένα email ή έναν αριθμό τηλεφώνου.

                    Αν δεν χρησιμοποιούν ήδη το Expensify, θα σταλθεί αυτόματα πρόσκληση.

                    Κάθε συζήτηση θα μετατρέπεται επίσης σε email ή μήνυμα κειμένου στο οποίο μπορούν να απαντήσουν απευθείας.
                `),
            },
            splitExpenseTask: {
                title: 'Διαχωρισμός εξόδου',
                description: Str.dedent(`
                    *Μοιραστείτε έξοδα* με ένα ή περισσότερα άτομα.

                    1. Πατήστε το κουμπί *+*.
                    2. Επιλέξτε *Έναρξη συνομιλίας*.
                    3. Εισαγάγετε email ή αριθμούς τηλεφώνου.
                    4. Πατήστε το γκρι κουμπί *+* στη συνομιλία > *Μοίρασμα εξόδου*.
                    5. Δημιουργήστε το έξοδο επιλέγοντας *Χειροκίνητα*, *Σάρωση* ή *Απόσταση*.

                    Μπορείτε να προσθέσετε περισσότερες λεπτομέρειες αν θέλετε ή απλώς να το στείλετε. Ας σας επιστρέψουν τα χρήματά σας!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Ελέγξτε τις [ρυθμίσεις του χώρου εργασίας σας](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    Str.dedent(`
                        Δείτε πώς μπορείτε να ελέγξετε και να ενημερώσετε τις ρυθμίσεις του χώρου εργασίας σας:
                        1. Κάντε κλικ στο «Χώροι εργασίας».
                        2. Επιλέξτε τον χώρο εργασίας σας.
                        3. Ελέγξτε και ενημερώστε τις ρυθμίσεις σας.
                        [Μετάβαση στον χώρο εργασίας σας.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Δημιουργήστε την πρώτη σας αναφορά',
                description: Str.dedent(`
                    Δείτε πώς μπορείτε να δημιουργήσετε μια αναφορά:

                    1. Κάντε κλικ στο κουμπί *+*.
                    2. Επιλέξτε *Δημιουργία αναφοράς*.
                    3. Κάντε κλικ στο *Προσθήκη εξόδου*.
                    4. Προσθέστε την πρώτη σας δαπάνη.

                    Και είστε έτοιμοι!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Κάντε ένα [test drive](${testDriveURL})` : 'Κάντε μια δοκιμαστική χρήση'),
            embeddedDemoIframeTitle: 'Δοκιμαστική χρήση',
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Το να αποζημιωθείτε είναι τόσο εύκολο όσο το να στείλετε ένα μήνυμα. Ας δούμε τα βασικά.',
            onboardingPersonalSpendMessage: 'Δείτε πώς να παρακολουθείτε τις δαπάνες σας με λίγα μόνο κλικ.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? Str.dedent(`
                        # Η δωρεάν δοκιμή σας ξεκίνησε! Ας σας βοηθήσουμε με τη ρύθμιση.
                        👋 Γεια σας, είμαι ο υπεύθυνος λογαριασμού σας στην Expensify. Έχω ήδη δημιουργήσει έναν χώρο εργασίας για να σας βοηθήσω να διαχειρίζεστε τις αποδείξεις και τα έξοδα της ομάδας σας. Για να αξιοποιήσετε στο έπακρο τη δωρεάν δοκιμή 30 ημερών, απλώς ακολουθήστε τα υπόλοιπα βήματα ρύθμισης παρακάτω!
                    `)
                    : Str.dedent(`
                        # Η δωρεάν δοκιμή σας ξεκίνησε! Ας κάνουμε τη ρύθμιση.
                        👋 Γεια σας, είμαι ο υπεύθυνος λογαριασμού σας στο Expensify. Τώρα που δημιουργήσατε έναν χώρο εργασίας, αξιοποιήστε στο έπακρο τη δωρεάν δοκιμή 30 ημερών ακολουθώντας τα παρακάτω βήματα!
                    `),
            onboardingTrackWorkspaceMessage: 'Για να αξιοποιήσετε στο έπακρο τη δωρεάν δοκιμή των 30 ημερών, ακολουθήστε τα παρακάτω υπόλοιπα βήματα:',
            onboardingChatSplitMessage: 'Το να μοιράζεστε λογαριασμούς με φίλους είναι τόσο εύκολο όσο το να στέλνετε ένα μήνυμα. Δείτε πώς.',
            onboardingAdminMessage: 'Μάθετε πώς να διαχειρίζεστε τον χώρο εργασίας της ομάδας σας ως διαχειριστής και να υποβάλλετε τις δικές σας δαπάνες.',
            onboardingTestDriveReceiverMessage: '*Έχετε 3 μήνες δωρεάν! Ξεκινήστε παρακάτω.*',
        },
        workspace: {
            title: 'Μείνετε οργανωμένοι με έναν χώρο εργασίας',
            subtitle: 'Ξεκλειδώστε ισχυρά εργαλεία για να απλοποιήσετε τη διαχείριση εξόδων σας, όλα σε ένα μέρος. Με έναν χώρο εργασίας, μπορείτε να:',
            explanationModal: {
                descriptionOne: 'Παρακολουθήστε και οργανώστε αποδείξεις',
                descriptionTwo: 'Κατηγοριοποιήστε και επισημάνετε τα έξοδα',
                descriptionThree: 'Δημιουργήστε και μοιραστείτε αναφορές',
            },
            price: (price?: string) => `Δοκιμάστε το δωρεάν για 30 ημέρες και μετά αναβαθμίστε με μόνο <strong>${price ?? '$5'}/χρήστη/μήνα</strong>.`,
            createWorkspace: 'Δημιουργία χώρου εργασίας',
        },
        confirmWorkspace: {
            title: 'Επιβεβαίωση χώρου εργασίας',
            subtitle:
                'Δημιουργήστε έναν χώρο εργασίας για να καταγράφετε αποδείξεις, να αποζημιώνετε έξοδα, να διαχειρίζεστε ταξίδια, να δημιουργείτε αναφορές και άλλα — όλα με την ταχύτητα της συνομιλίας.',
        },
        inviteMembers: {
            title: 'Προσκαλέστε μέλη',
            subtitle: 'Προσθέστε την ομάδα σας ή προσκαλέστε τον λογιστή σας. Όσο περισσότεροι, τόσο το καλύτερο!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Να μην εμφανιστεί ξανά',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'Το όνομα δεν μπορεί να περιέχει ειδικούς χαρακτήρες',
            containsReservedWord: 'Το όνομα δεν μπορεί να περιέχει τις λέξεις Expensify ή Concierge',
            hasInvalidCharacter: 'Το όνομα δεν μπορεί να περιέχει κόμμα ή ερωτηματικό',
            requiredFirstName: 'Το μικρό όνομα δεν μπορεί να είναι κενό',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Ποιο είναι το νόμιμο όνομά σας;',
        enterDateOfBirth: 'Ποια είναι η ημερομηνία γέννησής σας;',
        enterAddress: 'Ποια είναι η διεύθυνσή σας;',
        enterPhoneNumber: 'Ποιος είναι ο αριθμός του τηλεφώνου σας;',
        personalDetails: 'Προσωπικά στοιχεία',
        privateDataMessage: 'Αυτές οι πληροφορίες χρησιμοποιούνται για ταξίδια και πληρωμές. Δεν εμφανίζονται ποτέ στο δημόσιο προφίλ σας.',
        basicDetails: 'Βασικές λεπτομέρειες',
        legalName: 'Νομικό όνομα',
        legalFirstName: 'Επίσημο μικρό όνομα',
        legalLastName: 'Επώνυμο (όπως αναγράφεται στα επίσημα έγγραφα)',
        address: 'Διεύθυνση',
        error: {
            dateShouldBeBefore: (dateString: string) => `Η ημερομηνία πρέπει να είναι πριν από ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `Η ημερομηνία πρέπει να είναι μετά από ${dateString}`,
            hasInvalidCharacter: 'Το όνομα μπορεί να περιλαμβάνει μόνο λατινικούς χαρακτήρες',
            cannotIncludeCommaOrSemicolon: 'Το όνομα δεν μπορεί να περιέχει κόμμα ή ερωτηματικό',
            incorrectZipFormat: (zipFormat?: string) => `Μη έγκυρη μορφή ταχυδρομικού κώδικα${zipFormat ? `Αποδεκτή μορφή: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Βεβαιωθείτε ότι ο αριθμός τηλεφώνου είναι έγκυρος (π.χ. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Ο σύνδεσμος στάλθηκε ξανά',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `Έστειλα έναν μαγικό σύνδεσμο σύνδεσης στο ${login}. Παρακαλούμε ελέγξτε το ${loginType} σας για να συνδεθείτε.`,
        resendLink: 'Επαναποστολή συνδέσμου',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) =>
            `Για να επαληθεύσετε το ${secondaryLogin}, στείλτε ξανά τον μαγικό κωδικό από τις ρυθμίσεις λογαριασμού του ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `Αν δεν έχετε πλέον πρόσβαση στο ${primaryLogin}, αποσυνδέστε τους λογαριασμούς σας.`,
        unlink: 'Αποσύνδεση',
        linkSent: 'Ο σύνδεσμος στάλθηκε!',
        successfullyUnlinkedLogin: 'Δευτερεύουσα σύνδεση αποσυνδέθηκε με επιτυχία!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) =>
            `Ο πάροχος email μας έχει προσωρινά αναστείλει την αποστολή email προς τη διεύθυνση ${login} λόγω προβλημάτων παράδοσης. Για να ξεμπλοκάρετε τη σύνδεσή σας, ακολουθήστε αυτά τα βήματα:`,
        confirmThat: (login: string) =>
            `<strong>Βεβαιωθείτε ότι το ${login} είναι γραμμένο σωστά και ότι είναι μια πραγματική, ενεργή διεύθυνση email.</strong> Τα ψευδώνυμα email, όπως «expenses@domain.com», πρέπει να έχουν πρόσβαση στο δικό τους γραμματοκιβώτιο email για να είναι έγκυρο όνομα χρήστη στην Expensify.`,
        ensureYourEmailClient: `<strong>Βεβαιωθείτε ότι ο πελάτης ηλεκτρονικού ταχυδρομείου σας επιτρέπει μηνύματα από το expensify.com.</strong> Μπορείτε να βρείτε οδηγίες για το πώς να ολοκληρώσετε αυτό το βήμα <a href="${CONST.SET_NOTIFICATION_LINK}">εδώ</a>, αλλά μπορεί να χρειαστείτε βοήθεια από το τμήμα IT σας για να ρυθμίσετε τις ρυθμίσεις του email σας.`,
        onceTheAbove: `Μόλις ολοκληρώσετε τα παραπάνω βήματα, επικοινωνήστε με το <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> για να ξεμπλοκαριστεί η είσοδός σας.`,
    },
    openAppFailureModal: {
        title: 'Κάτι πήγε στραβά...',
        subtitle: `Δεν ήταν δυνατή η φόρτωση όλων των δεδομένων σας. Έχουμε ειδοποιηθεί και εξετάζουμε το πρόβλημα. Αν αυτό συνεχιστεί, επικοινωνήστε με`,
        refreshAndTryAgain: 'Ανανεώστε και δοκιμάστε ξανά',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) =>
            `Δεν ήταν δυνατή η αποστολή SMS μηνυμάτων στο ${login}, οπότε το έχουμε αναστείλει προσωρινά. Δοκιμάστε να επαληθεύσετε τον αριθμό σας:`,
        validationSuccess: 'Ο αριθμός σας έχει επαληθευτεί! Κάντε κλικ παρακάτω για να στείλετε νέο μαγικό κωδικό σύνδεσης.',
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
                return 'Παρακαλούμε περιμένετε λίγο πριν προσπαθήσετε ξανά.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'ημέρα' : 'ημέρες'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'ώρα' : 'ώρες'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'λεπτό' : 'λεπτά'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Περιμένετε λίγο! Πρέπει να περιμένετε ${timeText} πριν προσπαθήσετε ξανά να επαληθεύσετε τον αριθμό σας.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Συμμετοχή',
        marketingSMSConsent: 'Συμφωνώ να λαμβάνω προωθητικά μηνύματα από την Expensify',
    },
    detailsPage: {
        localTime: 'Τοπική ώρα',
    },
    newChatPage: {
        startGroup: 'Έναρξη ομάδας',
        addToGroup: 'Προσθήκη στην ομάδα',
        addUserToGroup: (username: string) => `Προσθέστε τον/την ${username} στην ομάδα`,
    },
    yearPickerPage: {
        year: 'Έτος',
        selectYear: 'Παρακαλώ επιλέξτε έτος',
    },
    monthPickerPage: {
        month: 'Μήνας',
        selectMonth: 'Παρακαλώ επιλέξτε έναν μήνα',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Η συνομιλία που αναζητάτε δεν μπορεί να βρεθεί.',
        getMeOutOfHere: 'Βγάλτε με από εδώ',
        iouReportNotFound: 'Δεν είναι δυνατή η εύρεση των στοιχείων πληρωμής που αναζητάτε.',
        notHere: 'Χμμ... δεν είναι εδώ',
        pageNotFound: 'Ουπς, αυτή η σελίδα δεν μπορεί να βρεθεί',
        noAccess:
            'Αυτή η συνομιλία ή η δαπάνη μπορεί να έχει διαγραφεί ή δεν έχετε δικαίωμα πρόσβασης σε αυτήν.\n\nΓια οποιαδήποτε ερώτηση, παρακαλούμε επικοινωνήστε στο concierge@expensify.com',
        goBackHome: 'Επιστρέψτε στην αρχική σελίδα',
        commentYouLookingForCannotBeFound: 'Το σχόλιο που αναζητάτε δεν μπορεί να βρεθεί.',
        goToChatInstead: 'Μεταβείτε στη συνομιλία αντ’ αυτού.',
        contactConcierge: 'Για οποιαδήποτε ερώτηση, παρακαλούμε επικοινωνήστε στο concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ωχ... ${isBreakLine ? '\n' : ''}Κάτι πήγε στραβά`,
        subtitle: 'Δεν ήταν δυνατή η ολοκλήρωση του αιτήματός σας. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        wrongTypeSubtitle: 'Αυτή η αναζήτηση δεν είναι έγκυρη. Δοκιμάστε να προσαρμόσετε τα κριτήρια αναζήτησής σας.',
    },
    statusPage: {
        status: 'Κατάσταση',
        statusExplanation: 'Ορίστε την κατάστασή σας με ένα emoji και ένα προαιρετικό μήνυμα.',
        today: 'Σήμερα',
        clearStatus: 'Εκκαθάριση κατάστασης',
        save: 'Αποθήκευση',
        message: 'Μήνυμα',
        timePeriods: {
            never: 'Ποτέ',
            thirtyMinutes: '30 λεπτά',
            oneHour: '1 ώρα',
            afterToday: 'Σήμερα',
            afterWeek: 'Μία εβδομάδα',
            custom: 'Προσαρμοσμένο',
        },
        untilTomorrow: 'Μέχρι αύριο',
        untilTime: (time: string) => `Έως τις ${time}`,
        date: 'Ημερομηνία',
        time: 'Ώρα',
        clearAfter: 'Εκκαθάριση μετά από',
        whenClearStatus: 'Πότε θέλετε να διαγράψουμε την κατάστασή σας;',
        setVacationDelegate: `Ορίστε έναν αναπληρωτή αδειών για να εγκρίνει αναφορές εκ μέρους σας όσο θα είστε εκτός γραφείου.`,
        cannotSetVacationDelegate: `Δεν μπορείτε να ορίσετε εκπρόσωπο αδείας, επειδή είστε ήδη εκπρόσωπος για τα ακόλουθα μέλη:`,
        addVacationDelegate: 'Προσθήκη αναπληρωτή διακοπών',
        vacationDelegateError: 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση του αναπληρωτή σας για την άδεια.',
        asVacationDelegate: (nameOrEmail: string) => `ως εκπρόσωπος αδειών του/της ${nameOrEmail}`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `στον/στη ${submittedToName} ως αναπληρωτής/τρια αδειούχου για τον/τη ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `Ορίζετε τον/την ${nameOrEmail} ως αναπληρωτή/τριά σας κατά τις διακοπές. Δεν συμμετέχει ακόμη σε όλους τους χώρους εργασίας σας. Αν επιλέξετε να συνεχίσετε, θα σταλεί email σε όλους τους διαχειριστές των χώρων εργασίας σας για να τον/την προσθέσουν.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Βήμα ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Στοιχεία τράπεζας',
        confirmBankInfo: 'Επιβεβαίωση στοιχείων τράπεζας',
        manuallyAdd: 'Προσθέστε χειροκίνητα τον τραπεζικό σας λογαριασμό',
        letsDoubleCheck: 'Ας ελέγξουμε άλλη μία φορά ότι όλα φαίνονται σωστά.',
        accountEnding: 'Λογαριασμός που λήγει σε',
        thisBankAccount: 'Αυτός ο τραπεζικός λογαριασμός θα χρησιμοποιείται για επιχειρηματικές πληρωμές στον χώρο εργασίας σας',
        accountNumber: 'Αριθμός λογαριασμού',
        routingNumber: 'Αριθμός δρομολόγησης',
        chooseAnAccountBelow: 'Επιλέξτε έναν λογαριασμό παρακάτω',
        addBankAccount: 'Προσθήκη τραπεζικού λογαριασμού',
        chooseAnAccount: 'Επιλέξτε λογαριασμό',
        connectOnlineWithPlaid: 'Συνδεθείτε στον τραπεζικό σας λογαριασμό',
        connectManually: 'Σύνδεση με μη αυτόματο τρόπο',
        desktopConnection:
            'Σημείωση: Για να συνδεθείτε με τις Chase, Wells Fargo, Capital One ή Bank of America, κάντε κλικ εδώ για να ολοκληρώσετε αυτήν τη διαδικασία σε ένα πρόγραμμα περιήγησης.',
        yourDataIsSecure: 'Τα δεδομένα σας είναι ασφαλή',
        toGetStarted:
            'Προσθέστε έναν τραπεζικό λογαριασμό για να αποζημιώνετε έξοδα, να εκδίδετε Κάρτες Expensify, να εισπράττετε πληρωμές τιμολογίων και να εξοφλείτε λογαριασμούς, όλα από ένα σημείο.',
        plaidBodyCopy: 'Προσφέρετε στους υπαλλήλους σας έναν ευκολότερο τρόπο να πληρώνουν – και να αποζημιώνονται – για εταιρικά έξοδα.',
        checkHelpLine: 'Ο αριθμός δρομολόγησης και ο αριθμός λογαριασμού σας βρίσκονται σε μια επιταγή του λογαριασμού.',
        bankAccountPurposeTitle: 'Τι θέλετε να κάνετε με τον τραπεζικό σας λογαριασμό;',
        getReimbursed: 'Λάβετε αποζημίωση',
        getReimbursedDescription: 'Από τον εργοδότη ή άλλους',
        makePayments: 'Πραγματοποιήστε πληρωμές',
        makePaymentsDescription: 'Πληρώστε έξοδα ή εκδώστε Κάρτες Expensify',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Για να συνδέσετε έναν τραπεζικό λογαριασμό, παρακαλούμε <a href="${contactMethodRoute}">προσθέστε ένα email ως κύρια είσοδό σας</a> και δοκιμάστε ξανά. Μπορείτε να προσθέσετε τον αριθμό τηλεφώνου σας ως δευτερεύουσα είσοδο.`,
        hasBeenThrottledError: 'Παρουσιάστηκε σφάλμα κατά την προσθήκη του τραπεζικού σας λογαριασμού. Παρακαλούμε περιμένετε μερικά λεπτά και δοκιμάστε ξανά.',
        hasCurrencyError: (workspaceRoute: string) =>
            `Ουπς! Φαίνεται ότι το νόμισμα του χώρου εργασίας σας είναι ορισμένο σε διαφορετικό νόμισμα από το USD. Για να συνεχίσετε, μεταβείτε στις <a href="${workspaceRoute}">ρυθμίσεις του χώρου εργασίας σας</a>, ορίστε το σε USD και δοκιμάστε ξανά.`,
        bbaAdded: 'Προστέθηκε ο επαγγελματικός τραπεζικός λογαριασμός!',
        bbaAddedDescription: 'Είναι έτοιμη για χρήση σε πληρωμές.',
        lockedBankAccount: 'Κλειδωμένος τραπεζικός λογαριασμός',
        unlockBankAccount: 'Ξεκλειδώστε τον τραπεζικό λογαριασμό',
        youCantPayThis: `Δεν μπορείτε να πληρώσετε αυτήν την αναφορά, επειδή έχετε έναν <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">κλειδωμένο τραπεζικό λογαριασμό</a>. Πατήστε παρακάτω και η Concierge θα σας βοηθήσει με τα επόμενα βήματα για να τον ξεκλειδώσετε.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `<h1>Επαγγελματικός τραπεζικός λογαριασμός Expensify ${maskedAccountNumber}</h1><p>Σας ευχαριστούμε που υποβάλατε αίτημα για ξεκλείδωμα του τραπεζικού σας λογαριασμού. Τα αιτήματα ανάληψης μπορεί να απορριφθούν λόγω ανεπαρκών διαθέσιμων χρημάτων ή αν ο τραπεζικός λογαριασμός δεν έχει ενεργοποιηθεί για άμεση χρέωση. Θα εξετάσουμε την περίπτωσή σας και θα επικοινωνήσουμε μαζί σας αν χρειαστούμε οτιδήποτε επιπλέον για την επίλυση αυτού του ζητήματος.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) => `Επιχειρηματικός τραπεζικός λογαριασμός Expensify ${maskedAccountNumber}
Σας ευχαριστούμε που υποβάλατε αίτημα για ξεκλείδωμα του τραπεζικού σας λογαριασμού. Τα αιτήματα ανάληψης ενδέχεται να απορριφθούν λόγω ανεπαρκών διαθέσιμων κεφαλαίων ή αν ο τραπεζικός λογαριασμός δεν έχει ενεργοποιηθεί για άμεση χρέωση. Θα εξετάσουμε την περίπτωσή σας και θα επικοινωνήσουμε μαζί σας αν χρειαστούμε οτιδήποτε επιπλέον για την επίλυση αυτού του ζητήματος.`,
        error: {
            youNeedToSelectAnOption: 'Παρακαλώ επιλέξτε μία επιλογή για να συνεχίσετε',
            noBankAccountAvailable: 'Λυπούμαστε, δεν υπάρχει διαθέσιμος τραπεζικός λογαριασμός',
            noBankAccountSelected: 'Παρακαλώ επιλέξτε έναν λογαριασμό',
            taxID: 'Παρακαλούμε εισαγάγετε έναν έγκυρο αριθμό φορολογικού μητρώου',
            website: 'Παρακαλούμε εισαγάγετε μια έγκυρη ιστοσελίδα',
            zipCode: `Παρακαλούμε εισαγάγετε έναν έγκυρο ταχυδρομικό κώδικα χρησιμοποιώντας τη μορφή: ${COMMON_CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Παρακαλούμε εισαγάγετε έναν έγκυρο αριθμό τηλεφώνου',
            email: 'Παρακαλούμε εισαγάγετε μια έγκυρη διεύθυνση email',
            companyName: 'Παρακαλούμε εισαγάγετε μια έγκυρη επωνυμία επιχείρησης',
            addressCity: 'Παρακαλούμε εισαγάγετε μια έγκυρη πόλη',
            addressStreet: 'Παρακαλούμε εισαγάγετε έγκυρη ταχυδρομική διεύθυνση',
            physicalAddressRequired: 'Απαιτείται φυσική διεύθυνση. Τα γραμματοκιβώτια και οι ταχυδρομικές θυρίδες δεν γίνονται δεκτά.',
            addressState: 'Παρακαλούμε επιλέξτε έγκυρη πολιτεία',
            incorporationDateFuture: 'Η ημερομηνία σύστασης δεν μπορεί να είναι στο μέλλον',
            incorporationState: 'Παρακαλούμε επιλέξτε έγκυρη πολιτεία',
            industryCode: 'Παρακαλούμε εισαγάγετε έναν έγκυρο κωδικό ταξινόμησης κλάδου με έξι ψηφία',
            restrictedBusiness: 'Παρακαλούμε επιβεβαιώστε ότι η επιχείρηση δεν βρίσκεται στη λίστα με τις περιορισμένες επιχειρήσεις',
            routingNumber: 'Παρακαλούμε εισαγάγετε έναν έγκυρο αριθμό δρομολόγησης',
            accountNumber: 'Παρακαλούμε εισαγάγετε έναν έγκυρο αριθμό λογαριασμού',
            routingAndAccountNumberCannotBeSame: 'Οι αριθμοί δρομολόγησης και λογαριασμού δεν μπορούν να είναι ίδιοι',
            companyType: 'Παρακαλώ επιλέξτε έναν έγκυρο τύπο εταιρείας',
            tooManyAttempts: 'Λόγω μεγάλου αριθμού προσπαθειών σύνδεσης, αυτή η επιλογή έχει απενεργοποιηθεί για 24 ώρες. Δοκιμάστε ξανά αργότερα ή εισαγάγετε τα στοιχεία χειροκίνητα.',
            address: 'Παρακαλούμε εισαγάγετε έγκυρη διεύθυνση',
            dob: 'Παρακαλούμε επιλέξτε έγκυρη ημερομηνία γέννησης',
            age: 'Πρέπει να είστε άνω των 18 ετών',
            ssnLast4: 'Παρακαλούμε εισαγάγετε τα έγκυρα τελευταία 4 ψηφία του SSN σας',
            firstName: 'Παρακαλώ εισαγάγετε ένα έγκυρο όνομα μικρού ονόματος',
            lastName: 'Παρακαλούμε εισαγάγετε ένα έγκυρο επώνυμο',
            noDefaultDepositAccountOrDebitCardAvailable: 'Παρακαλούμε προσθέστε έναν προεπιλεγμένο λογαριασμό κατάθεσης ή χρεωστική κάρτα',
            validationAmounts: 'Τα ποσά επαλήθευσης που εισαγάγατε είναι εσφαλμένα. Παρακαλούμε ελέγξτε ξανά το αντίγραφο κίνησης του λογαριασμού σας και προσπαθήστε ξανά.',
            fullName: 'Παρακαλούμε εισαγάγετε ένα έγκυρο πλήρες όνομα',
            ownershipPercentage: 'Παρακαλώ εισαγάγετε έναν έγκυρο αριθμό ποσοστού',
            deletePaymentBankAccount:
                'Αυτός ο τραπεζικός λογαριασμός δεν μπορεί να διαγραφεί επειδή χρησιμοποιείται για πληρωμές με την Κάρτα Expensify. Αν εξακολουθείτε να θέλετε να διαγράψετε αυτόν τον λογαριασμό, παρακαλούμε επικοινωνήστε με το Concierge.',
            sameDepositAndWithdrawalAccount: 'Οι λογαριασμοί κατάθεσης και ανάληψης είναι οι ίδιοι.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Πού βρίσκεται ο τραπεζικός σας λογαριασμός;',
        accountDetailsStepHeader: 'Ποια είναι τα στοιχεία του λογαριασμού σας;',
        accountTypeStepHeader: 'Τι τύπος λογαριασμού είναι αυτός;',
        bankInformationStepHeader: 'Ποια είναι τα στοιχεία του τραπεζικού σας λογαριασμού;',
        accountHolderInformationStepHeader: 'Ποια είναι τα στοιχεία του κατόχου του λογαριασμού;',
        howDoWeProtectYourData: 'Πώς προστατεύουμε τα δεδομένα σας;',
        currencyHeader: 'Ποιο είναι το νόμισμα του τραπεζικού σας λογαριασμού;',
        confirmationStepHeader: 'Ελέγξτε τα στοιχεία σας.',
        confirmationStepSubHeader: 'Ελέγξτε προσεκτικά τις παρακάτω λεπτομέρειες και επιλέξτε το πλαίσιο όρων για επιβεβαίωση.',
        toGetStarted: 'Προσθέστε έναν προσωπικό τραπεζικό λογαριασμό για να λαμβάνετε αποζημιώσεις, να πληρώνετε τιμολόγια ή να ενεργοποιήσετε το Expensify Wallet.',
        updatePersonalInfo: 'Ενημερώστε τον τραπεζικό λογαριασμό',
        updatePersonalInfoFailure: 'Δεν είναι δυνατή η ενημέρωση των στοιχείων του τραπεζικού λογαριασμού. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        updateSuccessTitle: 'Ο τραπεζικός λογαριασμός ενημερώθηκε!',
        updateSuccessHeader: 'Ο τραπεζικός λογαριασμός ενημερώθηκε',
        updateSuccessMessage: 'Συγχαρητήρια, ο τραπεζικός σας λογαριασμός έχει ρυθμιστεί και είναι έτοιμος να λαμβάνει αποζημιώσεις.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Εισαγάγετε τον κωδικό Expensify',
        alreadyAdded: 'Αυτός ο λογαριασμός έχει ήδη προστεθεί.',
        chooseAccountLabel: 'Λογαριασμός',
        successTitle: 'Προσωπικός τραπεζικός λογαριασμός προστέθηκε!',
        successMessage: 'Συγχαρητήρια, ο τραπεζικός σας λογαριασμός έχει ρυθμιστεί και είναι έτοιμος να λαμβάνει αποζημιώσεις.',
    },
    attachmentView: {
        unknownFilename: 'Άγνωστο όνομα αρχείου',
        passwordRequired: 'Παρακαλούμε εισαγάγετε έναν κωδικό πρόσβασης',
        passwordIncorrect: 'Λανθασμένος κωδικός πρόσβασης. Παρακαλούμε δοκιμάστε ξανά.',
        failedToLoadPDF: 'Αποτυχία φόρτωσης αρχείου PDF',
        pdfPasswordForm: {
            title: 'PDF προστατευμένο με κωδικό πρόσβασης',
            infoText: 'Αυτό το PDF προστατεύεται με κωδικό πρόσβασης.',
            beforeLinkText: 'Παρακαλώ',
            linkText: 'εισάγετε τον κωδικό πρόσβασης',
            afterLinkText: 'για να το δείτε.',
            formLabel: 'Προβολή PDF',
        },
        attachmentNotFound: 'Το συνημμένο δεν βρέθηκε',
        retry: 'Προσπαθήστε ξανά',
    },
    messages: {
        errorMessageInvalidPhone: `Παρακαλούμε εισαγάγετε έναν έγκυρο αριθμό τηλεφώνου χωρίς παρενθέσεις ή παύλες. Αν βρίσκεστε εκτός ΗΠΑ, συμπεριλάβετε τον κωδικό της χώρας σας (π.χ. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Μη έγκυρο email',
        userIsAlreadyMember: (login: string, name: string) => `Ο/Η ${login} είναι ήδη μέλος του ${name}`,
        userIsAlreadyAnAdmin: (login: string, name: string) => `Ο/Η ${login} είναι ήδη διαχειριστής/ρια του ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Συνεχίζοντας με το αίτημα ενεργοποίησης του Πορτοφολιού Expensify, επιβεβαιώνετε ότι έχετε διαβάσει, κατανοήσει και αποδεχτεί',
        facialScan: 'Πολιτική και άδεια σάρωσης προσώπου της Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Πολιτική και Έγκριση Σάρωσης Προσώπου της Onfido</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Προστασία Προσωπικών Δεδομένων</a> και <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Όροι Παροχής Υπηρεσιών</a>.</muted-text-micro>`,
        tryAgain: 'Προσπαθήστε ξανά',
        verifyIdentity: 'Επαληθεύστε την ταυτότητα',
        letsVerifyIdentity: 'Ας επιβεβαιώσουμε την ταυτότητά σας',
        butFirst: `Αλλά πρώτα, τα βαρετά. Διαβάστε τα νομικά στο επόμενο βήμα και κάντε κλικ στο «Αποδοχή» όταν είστε έτοιμοι.`,
        genericError: 'Παρουσιάστηκε σφάλμα κατά την επεξεργασία αυτού του βήματος. Παρακαλούμε δοκιμάστε ξανά.',
        cameraPermissionsNotGranted: 'Ενεργοποιήστε την πρόσβαση στην κάμερα',
        cameraRequestMessage:
            'Χρειαζόμαστε πρόσβαση στην κάμερά σας για να ολοκληρώσουμε την επαλήθευση του τραπεζικού λογαριασμού. Παρακαλούμε ενεργοποιήστε την από Ρυθμίσεις > New Expensify.',
        microphonePermissionsNotGranted: 'Ενεργοποίηση πρόσβασης στο μικρόφωνο',
        microphoneRequestMessage:
            'Χρειαζόμαστε πρόσβαση στο μικρόφωνό σας για να ολοκληρώσουμε την επαλήθευση του τραπεζικού λογαριασμού. Παρακαλούμε ενεργοποιήστε την από Ρυθμίσεις > New Expensify.',
        originalDocumentNeeded: 'Παρακαλούμε ανεβάστε μια πρωτότυπη εικόνα της ταυτότητάς σας και όχι στιγμιότυπο οθόνης ή σαρωμένη εικόνα.',
        documentNeedsBetterQuality:
            'Η ταυτότητά σας φαίνεται να είναι κατεστραμμένη ή να λείπουν ορισμένα χαρακτηριστικά ασφαλείας. Παρακαλούμε ανεβάστε μια πρωτότυπη εικόνα άθικτης ταυτότητας που να είναι ολόκληρη ορατή.',
        imageNeedsBetterQuality: 'Υπάρχει ένα πρόβλημα με την ποιότητα της εικόνας της ταυτότητάς σας. Παρακαλούμε ανεβάστε μια νέα εικόνα όπου ολόκληρη η ταυτότητά σας να φαίνεται καθαρά.',
        selfieIssue: 'Υπάρχει πρόβλημα με τη selfie/βίντεό σας. Παρακαλούμε ανεβάστε μία νέα, ζωντανή selfie/βίντεο.',
        selfieNotMatching: 'Το selfie/βίντεο δεν ταιριάζει με την ταυτότητά σας. Παρακαλούμε ανεβάστε ένα νέο selfie/βίντεο όπου το πρόσωπό σας να φαίνεται καθαρά.',
        selfieNotLive: 'Το selfie/βίντεό σας δεν φαίνεται να είναι ζωντανή φωτογραφία/βίντεο. Παρακαλούμε ανεβάστε ένα ζωντανό selfie/βίντεο.',
    },
    additionalDetailsStep: {
        headerTitle: 'Πρόσθετες λεπτομέρειες',
        helpText: 'Πρέπει να επιβεβαιώσουμε τις παρακάτω πληροφορίες προτού μπορείτε να στέλνετε και να λαμβάνετε χρήματα από το πορτοφόλι σας.',
        helpTextIdologyQuestions: 'Πρέπει να σας κάνουμε μερικές ακόμη ερωτήσεις για να ολοκληρώσουμε την επιβεβαίωση της ταυτότητάς σας.',
        helpLink: 'Μάθετε περισσότερα για το γιατί το χρειαζόμαστε.',
        legalFirstNameLabel: 'Επίσημο μικρό όνομα',
        legalMiddleNameLabel: 'Νόμιμο μεσαίο όνομα',
        legalLastNameLabel: 'Επώνυμο (όπως αναγράφεται στα επίσημα έγγραφα)',
        selectAnswer: 'Παρακαλώ επιλέξτε μια απάντηση για να συνεχίσετε',
        ssnFull9Error: 'Παρακαλούμε εισαγάγετε έναν έγκυρο εννιαψήφιο αριθμό κοινωνικής ασφάλισης',
        needSSNFull9: 'Αντιμετωπίζουμε πρόβλημα με την επαλήθευση του SSN σας. Παρακαλούμε εισαγάγετε και τα εννέα ψηφία του SSN σας.',
        weCouldNotVerify: 'Δεν μπορέσαμε να επαληθεύσουμε',
        pleaseFixIt: 'Παρακαλούμε διορθώστε αυτές τις πληροφορίες πριν συνεχίσετε',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Δεν ήταν δυνατή η επιβεβαίωση της ταυτότητάς σας. Δοκιμάστε ξανά αργότερα ή επικοινωνήστε με το <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> αν έχετε οποιαδήποτε ερώτηση.`,
    },
    termsStep: {
        headerTitle: 'Όροι και χρεώσεις',
        headerTitleRefactor: 'Χρεώσεις και όροι',
        haveReadAndAgreePlain: 'Έχω διαβάσει και συμφωνώ να λαμβάνω ηλεκτρονικές γνωστοποιήσεις.',
        haveReadAndAgree: `Δηλώνω ότι έχω διαβάσει και συμφωνώ να λαμβάνω <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">ηλεκτρονικές γνωστοποιήσεις</a>.`,
        agreeToThePlain: 'Συμφωνώ με την πολιτική απορρήτου και τη σύμβαση πορτοφολιού.',
        agreeToThe: (walletAgreementUrl: string) =>
            `Συμφωνώ με την <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Πολιτική απορρήτου</a> και τη <a href="${walletAgreementUrl}">σύμβαση Πορτοφολιού</a>.`,
        enablePayments: 'Ενεργοποιήστε τις πληρωμές',
        monthlyFee: 'Μηνιαία χρέωση',
        inactivity: 'Αδράνεια',
        noOverdraftOrCredit: 'Χωρίς δυνατότητα υπερανάληψης/πίστωσης.',
        electronicFundsWithdrawal: 'Ηλεκτρονική ανάληψη χρημάτων από λογαριασμό',
        standard: 'Τυπικό',
        reviewTheFees: 'Ρίξτε μια ματιά σε ορισμένες χρεώσεις.',
        checkTheBoxes: 'Παρακαλώ επιλέξτε τα παρακάτω πεδία.',
        agreeToTerms: 'Αποδεχθείτε τους όρους και θα είστε έτοιμοι!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `Το πορτοφόλι Expensify εκδίδεται από την ${walletProgram}.`,
            perPurchase: 'Ανά αγορά',
            atmWithdrawal: 'Ανάληψη από ΑΤΜ',
            cashReload: 'Επαναφόρτωση με μετρητά',
            inNetwork: 'εντός δικτύου',
            outOfNetwork: 'εκτός δικτύου',
            atmBalanceInquiry: 'Έλεγχος υπολοίπου σε ΑΤΜ (εντός ή εκτός δικτύου)',
            customerService: 'Εξυπηρέτηση πελατών (αυτόματη ή με ζωντανό εκπρόσωπο)',
            inactivityAfterTwelveMonths: 'Αδράνεια (μετά από 12 μήνες χωρίς συναλλαγές)',
            weChargeOneFee: 'Χρεώνουμε 1 άλλο είδος χρέωσης. Είναι:',
            fdicInsurance: 'Τα χρήματά σας είναι επιλέξιμα για ασφαλιστική κάλυψη FDIC.',
            generalInfo: `Για γενικές πληροφορίες σχετικά με προπληρωμένους λογαριασμούς, επισκεφθείτε τη σελίδα <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Για λεπτομέρειες και όρους για όλες τις χρεώσεις και υπηρεσίες, επισκεφθείτε τη σελίδα <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> ή καλέστε στο +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Ηλεκτρονική ανάληψη κεφαλαίων (άμεση)',
            electronicFundsInstantFeeMin: (amount: string) => `(ελάχ. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Λίστα με όλες τις χρεώσεις του Expensify Wallet',
            typeOfFeeHeader: 'Όλες οι χρεώσεις',
            feeAmountHeader: 'Ποσό',
            moreDetailsHeader: 'Λεπτομέρειες',
            openingAccountTitle: 'Άνοιγμα λογαριασμού',
            openingAccountDetails: 'Δεν υπάρχει χρέωση για το άνοιγμα λογαριασμού.',
            monthlyFeeDetails: 'Δεν υπάρχει μηνιαία χρέωση.',
            customerServiceTitle: 'Εξυπηρέτηση πελατών',
            customerServiceDetails: 'Δεν υπάρχουν χρεώσεις εξυπηρέτησης πελατών.',
            inactivityDetails: 'Δεν υπάρχει χρέωση αδράνειας.',
            sendingFundsTitle: 'Αποστολή χρημάτων σε άλλο κάτοχο λογαριασμού',
            sendingFundsDetails:
                'Δεν υπάρχει χρέωση για την αποστολή χρημάτων σε άλλο κάτοχο λογαριασμού χρησιμοποιώντας το υπόλοιπό σας, τον τραπεζικό σας λογαριασμό ή τη χρεωστική σας κάρτα.',
            electronicFundsStandardDetails:
                'Δεν υπάρχει χρέωση για τη μεταφορά χρημάτων από το πορτοφόλι σας Expensify στον τραπεζικό σας λογαριασμό χρησιμοποιώντας την τυπική επιλογή. Αυτή η μεταφορά συνήθως ολοκληρώνεται μέσα σε 1–3 εργάσιμες ημέρες.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Υπάρχει χρέωση για τη μεταφορά χρημάτων από το πορτοφόλι σας στο Expensify στην συνδεδεμένη χρεωστική σας κάρτα, όταν χρησιμοποιείτε την επιλογή άμεσης μεταφοράς. Αυτή η μεταφορά ολοκληρώνεται συνήθως μέσα σε λίγα λεπτά.' +
                `Η χρέωση είναι ${percentage}% του ποσού της μεταφοράς (με ελάχιστη χρέωση ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `Τα χρήματά σας είναι επιλέξιμα για ασφάλιση FDIC. Τα χρήματά σας θα τηρούνται ή θα μεταφέρονται στην/στο ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, ένα ίδρυμα που καλύπτεται από την FDIC.` +
                `Μόλις φτάσουν εκεί, τα χρήματά σας είναι ασφαλισμένα έως ${amount} από την FDIC σε περίπτωση που αποτύχει η ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, εφόσον πληρούνται οι συγκεκριμένες προϋποθέσεις ασφάλισης καταθέσεων και η κάρτα σας είναι καταχωρισμένη. Δείτε το ${CONST.TERMS.FDIC_PREPAID} για λεπτομέρειες.`,
            contactExpensifyPayments: `Επικοινωνήστε με ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} καλώντας στο +1 833-400-0904, μέσω email στο ${CONST.EMAIL.CONCIERGE} ή συνδεθείτε στο ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Για γενικές πληροφορίες σχετικά με προπληρωμένους λογαριασμούς, επισκεφθείτε το ${CONST.TERMS.CFPB_PREPAID}. Αν έχετε παράπονο σχετικά με προπληρωμένο λογαριασμό, καλέστε το Consumer Financial Protection Bureau στο 1-855-411-2372 ή επισκεφθείτε το ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Προβολή εκτυπώσιμης έκδοσης',
            automated: 'Αυτοματοποιημένο',
            liveAgent: 'Ζωντανός εκπρόσωπος',
            instant: 'Άμεσο',
            electronicFundsInstantFeeMin: (amount: string) => `Ελάχιστο ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Ενεργοποιήστε τις πληρωμές',
        activatedTitle: 'Το πορτοφόλι ενεργοποιήθηκε!',
        activatedMessage: 'Συγχαρητήρια, το πορτοφόλι σας έχει ρυθμιστεί και είναι έτοιμο για πληρωμές.',
        checkBackLaterTitle: 'Μόνο ένα λεπτό...',
        checkBackLaterMessage: 'Εξακολουθούμε να εξετάζουμε τις πληροφορίες σας. Παρακαλούμε ελέγξτε ξανά αργότερα.',
        continueToPayment: 'Συνεχίστε στην πληρωμή',
        continueToTransfer: 'Συνεχίστε τη μεταφορά',
    },
    companyStep: {
        headerTitle: 'Πληροφορίες εταιρείας',
        subtitle: 'Σχεδόν τελειώσατε! Για λόγους ασφαλείας, πρέπει να επιβεβαιώσουμε ορισμένες πληροφορίες:',
        legalBusinessName: 'Επίσημη επωνυμία επιχείρησης',
        companyWebsite: 'Ιστοσελίδα εταιρείας',
        taxIDNumber: 'Αριθμός φορολογικού μητρώου',
        taxIDNumberPlaceholder: '9 ψηφία',
        companyType: 'Τύπος εταιρείας',
        incorporationDate: 'Ημερομηνία σύστασης',
        incorporationState: 'Πολιτεία σύστασης',
        industryClassificationCode: 'Κωδικός ταξινόμησης κλάδου',
        confirmCompanyIsNot: 'Επιβεβαιώνω ότι αυτή η εταιρεία δεν βρίσκεται στη',
        listOfRestrictedBusinesses: 'λίστα επιχειρήσεων με περιορισμούς',
        incorporationDatePlaceholder: 'Ημερομηνία έναρξης (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'ΕΠΕ',
            CORPORATION: 'Εταιρεία',
            PARTNERSHIP: 'Συνεργασία',
            COOPERATIVE: 'Συνεταιρισμός',
            SOLE_PROPRIETORSHIP: 'Ατομική επιχείρηση',
            OTHER: 'Άλλο',
        },
        industryClassification: 'Σε ποιον κλάδο ταξινομείται η επιχείρηση;',
        industryClassificationCodePlaceholder: 'Αναζήτηση κωδικού ταξινόμησης κλάδου',
    },
    requestorStep: {
        headerTitle: 'Προσωπικές πληροφορίες',
        learnMore: 'Μάθετε περισσότερα',
        isMyDataSafe: 'Είναι ασφαλή τα δεδομένα μου;',
    },
    personalInfoStep: {
        personalInfo: 'Προσωπικές πληροφορίες',
        enterYourLegalFirstAndLast: 'Ποιο είναι το νόμιμο όνομά σας;',
        legalFirstName: 'Επίσημο μικρό όνομα',
        legalLastName: 'Επώνυμο (όπως αναγράφεται στα επίσημα έγγραφα)',
        legalName: 'Νομικό όνομα',
        legalNameSubtitle: 'Παρακαλούμε εισαγάγετε το πλήρες νόμιμο όνομά σας όπως ακριβώς εμφανίζεται στην ταυτότητά σας.',
        enterYourDateOfBirth: 'Ποια είναι η ημερομηνία γέννησής σας;',
        enterTheLast4: 'Ποια είναι τα τέσσερα τελευταία ψηφία του Αριθμού Κοινωνικής Ασφάλισής σας;',
        dontWorry: 'Μην ανησυχείτε, δεν κάνουμε κανέναν προσωπικό έλεγχο πιστοληπτικής ικανότητας!',
        last4SSN: 'Τελευταία 4 ψηφία του SSN',
        enterYourAddress: 'Ποια είναι η διεύθυνσή σας;',
        address: 'Διεύθυνση',
        addressSubtitle: 'Απαιτείται φυσική διεύθυνση. Τα γραμματοκιβώτια και οι ταχυδρομικές θυρίδες δεν γίνονται δεκτά.',
        letsDoubleCheck: 'Ας ελέγξουμε άλλη μία φορά ότι όλα φαίνονται σωστά.',
        byAddingThisBankAccount: 'Προσθέτοντας αυτόν τον τραπεζικό λογαριασμό, επιβεβαιώνετε ότι έχετε διαβάσει, κατανοήσει και αποδεχθεί',
        whatsYourLegalName: 'Ποιο είναι το νόμιμο ονοματεπώνυμό σας;',
        whatsYourDOB: 'Ποια είναι η ημερομηνία γέννησής σας;',
        whatsYourAddress: 'Ποια είναι η διεύθυνσή σας;',
        whatsYourSSN: 'Ποια είναι τα τέσσερα τελευταία ψηφία του Αριθμού Κοινωνικής Ασφάλισής σας;',
        noPersonalChecks: 'Μην ανησυχείτε, δεν γίνονται εδώ έλεγχοι προσωπικής πιστοληπτικής ικανότητας!',
        whatsYourPhoneNumber: 'Ποιος είναι ο αριθμός του τηλεφώνου σας;',
        weNeedThisToVerify: 'Χρειαζόμαστε αυτό για να επαληθεύσουμε το πορτοφόλι σας.',
    },
    businessInfoStep: {
        businessInfo: 'Πληροφορίες εταιρείας',
        enterTheNameOfYourBusiness: 'Ποιο είναι το όνομα της εταιρείας σας;',
        businessName: 'Επίσημη επωνυμία εταιρείας',
        enterYourCompanyTaxIdNumber: 'Ποιος είναι ο αριθμός φορολογικού μητρώου (ΑΦΜ) της εταιρείας σας;',
        taxIDNumber: 'Αριθμός φορολογικού μητρώου',
        taxIDNumberPlaceholder: '9 ψηφία',
        enterYourCompanyWebsite: 'Ποια είναι η ιστοσελίδα της εταιρείας σας;',
        companyWebsite: 'Ιστοσελίδα εταιρείας',
        enterYourCompanyPhoneNumber: 'Ποιος είναι ο αριθμός τηλεφώνου της εταιρείας σας;',
        enterYourCompanyAddress: 'Ποια είναι η διεύθυνση της εταιρείας σας;',
        selectYourCompanyType: 'Τι τύπος εταιρείας είναι;',
        companyType: 'Τύπος εταιρείας',
        incorporationType: {
            LLC: 'ΕΠΕ',
            CORPORATION: 'Εταιρεία',
            PARTNERSHIP: 'Συνεργασία',
            COOPERATIVE: 'Συνεταιρισμός',
            SOLE_PROPRIETORSHIP: 'Ατομική επιχείρηση',
            OTHER: 'Άλλο',
        },
        selectYourCompanyIncorporationDate: 'Ποια είναι η ημερομηνία σύστασης της εταιρείας σας;',
        incorporationDate: 'Ημερομηνία σύστασης',
        incorporationDatePlaceholder: 'Ημερομηνία έναρξης (yyyy-mm-dd)',
        incorporationState: 'Πολιτεία σύστασης',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Σε ποια πολιτεία συστάθηκε η εταιρεία σας;',
        letsDoubleCheck: 'Ας ελέγξουμε άλλη μία φορά ότι όλα φαίνονται σωστά.',
        companyAddress: 'Διεύθυνση εταιρείας',
        listOfRestrictedBusinesses: 'λίστα επιχειρήσεων με περιορισμούς',
        confirmCompanyIsNot: 'Επιβεβαιώνω ότι αυτή η εταιρεία δεν βρίσκεται στη',
        businessInfoTitle: 'Επαγγελματικές πληροφορίες',
        legalBusinessName: 'Επίσημη επωνυμία επιχείρησης',
        whatsTheBusinessName: 'Ποια είναι η επωνυμία της επιχείρησης;',
        whatsTheBusinessAddress: 'Ποια είναι η επαγγελματική διεύθυνση;',
        whatsTheBusinessContactInformation: 'Ποια είναι τα στοιχεία επικοινωνίας της επιχείρησης;',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Ποιος είναι ο αριθμός μητρώου της εταιρείας (CRN);';
                default:
                    return 'Ποιος είναι ο αριθμός εμπορικού μητρώου;';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Ποιος είναι ο Αριθμός Φορολογικού Μητρώου Εργοδότη (EIN);';
                case CONST.COUNTRY.CA:
                    return 'Ποιος είναι ο επιχειρηματικός αριθμός (BN);';
                case CONST.COUNTRY.GB:
                    return 'Ποιος είναι ο Αριθμός Φορολογικής Εγγραφής για τον ΦΠΑ (VAT Registration Number, VRN);';
                case CONST.COUNTRY.AU:
                    return 'Τι είναι ο Αυστραλιανός Αριθμός Επιχείρησης (ABN);';
                default:
                    return 'Ποιος είναι ο αριθμός ΦΠΑ ΕΕ;';
            }
        },
        whatsThisNumber: 'Τι είναι αυτός ο αριθμός;',
        whereWasTheBusinessIncorporated: 'Πού έχει ιδρυθεί η επιχείρηση;',
        whatTypeOfBusinessIsIt: 'Τι τύπος επιχείρησης είναι;',
        whatsTheBusinessAnnualPayment: 'Ποιος είναι ο ετήσιος όγκος πληρωμών της επιχείρησης;',
        whatsYourExpectedAverageReimbursements: 'Ποιο είναι το αναμενόμενο μέσο ποσό αποζημίωσής σας;',
        registrationNumber: 'Αριθμός εγγραφής',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'ΑΦΜ εταιρείας';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'ΑΦΜ ΦΠΑ';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'ΦΠΑ ΕΕ';
            }
        },
        businessAddress: 'Επαγγελματική διεύθυνση',
        businessType: 'Τύπος επιχείρησης',
        incorporation: 'Σύσταση εταιρείας',
        incorporationCountry: 'Χώρα σύστασης',
        incorporationTypeName: 'Τύπος σύστασης εταιρείας',
        businessCategory: 'Επιχειρηματική κατηγορία',
        annualPaymentVolume: 'Ετήσιος όγκος πληρωμών',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Ετήσιος όγκος πληρωμών σε ${currencyCode}`,
        averageReimbursementAmount: 'Μέσο ποσό αποζημίωσης',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Μέσο ποσό αποζημίωσης σε ${currencyCode}`,
        selectIncorporationType: 'Επιλέξτε τύπο νομικής μορφής',
        selectBusinessCategory: 'Επιλέξτε επαγγελματική κατηγορία',
        selectAnnualPaymentVolume: 'Επιλέξτε ετήσιο όγκο πληρωμών',
        selectIncorporationCountry: 'Επιλέξτε χώρα σύστασης',
        selectIncorporationState: 'Επιλέξτε πολιτεία σύστασης',
        selectAverageReimbursement: 'Επιλέξτε μέσο ποσό αποζημίωσης',
        selectBusinessType: 'Επιλέξτε τύπο επιχείρησης',
        findIncorporationType: 'Βρείτε τον τύπο νομικής μορφής εταιρείας',
        findBusinessCategory: 'Βρείτε επιχειρηματική κατηγορία',
        findAnnualPaymentVolume: 'Βρείτε τον ετήσιο όγκο πληρωμών',
        findIncorporationState: 'Βρείτε την πολιτεία σύστασης',
        findAverageReimbursement: 'Εύρεση μέσου ποσού αποζημίωσης',
        findBusinessType: 'Βρείτε τον τύπο επιχείρησης',
        error: {
            registrationNumber: 'Παρακαλώ εισαγάγετε έναν έγκυρο αριθμό εγγραφής',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Παρακαλούμε εισαγάγετε έναν έγκυρο Αριθμό Αναγνώρισης Εργοδότη (EIN)';
                    case CONST.COUNTRY.CA:
                        return 'Παρακαλούμε εισαγάγετε έναν έγκυρο αριθμό επιχείρησης (BN)';
                    case CONST.COUNTRY.GB:
                        return 'Παρακαλούμε εισαγάγετε έναν έγκυρο αριθμό εγγραφής ΦΠΑ (VRN)';
                    case CONST.COUNTRY.AU:
                        return 'Παρακαλούμε δώστε έναν έγκυρο Australian Business Number (ABN)';
                    default:
                        return 'Παρακαλούμε εισαγάγετε ένα έγκυρο ευρωπαϊκό ΑΦΜ (VAT)';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Κατέχετε το 25% ή περισσότερο της ${companyName};`,
        doAnyIndividualOwn25percent: (companyName: string) => `Κατέχει κάποιο άτομο το 25% ή περισσότερο της ${companyName};`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Υπάρχουν άλλα άτομα που κατέχουν ποσοστό 25% ή περισσότερο της ${companyName};`,
        regulationRequiresUsToVerifyTheIdentity: 'Οι κανονισμοί απαιτούν να επαληθεύουμε την ταυτότητα κάθε ατόμου που κατέχει πάνω από 25% της επιχείρησης.',
        companyOwner: 'Ιδιοκτήτης επιχείρησης',
        enterLegalFirstAndLastName: 'Ποιο είναι το επίσημο νομικό όνομα του ιδιοκτήτη;',
        legalNameSubtitle: 'Παρακαλούμε εισαγάγετε το πλήρες νόμιμο όνομα του/της ιδιοκτήτη/ιδιοκτήτριας όπως εμφανίζεται στην ταυτότητά του/της.',
        legalFirstName: 'Επίσημο μικρό όνομα',
        legalLastName: 'Επώνυμο (όπως αναγράφεται στα επίσημα έγγραφα)',
        enterTheDateOfBirthOfTheOwner: 'Ποια είναι η ημερομηνία γέννησης του κατόχου;',
        enterTheLast4: 'Ποια είναι τα τελευταία 4 ψηφία του αριθμού κοινωνικής ασφάλισης του κατόχου;',
        last4SSN: 'Τελευταία 4 ψηφία του SSN',
        dontWorry: 'Μην ανησυχείτε, δεν κάνουμε κανέναν προσωπικό έλεγχο πιστοληπτικής ικανότητας!',
        enterTheOwnersAddress: 'Ποια είναι η διεύθυνση του ιδιοκτήτη;',
        letsDoubleCheck: 'Ας ελέγξουμε διπλά ότι όλα φαίνονται σωστά.',
        legalName: 'Νομικό όνομα',
        address: 'Διεύθυνση',
        byAddingThisBankAccount: 'Προσθέτοντας αυτόν τον τραπεζικό λογαριασμό, επιβεβαιώνετε ότι έχετε διαβάσει, κατανοήσει και αποδεχθεί',
        owners: 'Ιδιοκτήτες',
    },
    ownershipInfoStep: {
        ownerInfo: 'Πληροφορίες ιδιοκτήτη',
        businessOwner: 'Ιδιοκτήτης επιχείρησης',
        signerInfo: 'Στοιχεία υπογράφοντος',
        doYouOwn: (companyName: string) => `Κατέχετε το 25% ή περισσότερο της ${companyName};`,
        doesAnyoneOwn: (companyName: string) => `Κατέχει κάποιο άτομο το 25% ή περισσότερο της ${companyName};`,
        regulationsRequire: 'Οι κανονισμοί απαιτούν να επαληθεύουμε την ταυτότητα κάθε ατόμου που κατέχει ποσοστό άνω του 25% της επιχείρησης.',
        legalFirstName: 'Επίσημο μικρό όνομα',
        legalLastName: 'Επώνυμο (όπως αναγράφεται στα επίσημα έγγραφα)',
        whatsTheOwnersName: 'Ποιο είναι το επίσημο νομικό όνομα του ιδιοκτήτη;',
        whatsYourName: 'Ποιο είναι το νόμιμο όνομά σας;',
        whatPercentage: 'Τι ποσοστό της επιχείρησης ανήκει στον ιδιοκτήτη;',
        whatsYoursPercentage: 'Τι ποσοστό της επιχείρησης κατέχετε;',
        ownership: 'Κυριότητα',
        whatsTheOwnersDOB: 'Ποια είναι η ημερομηνία γέννησης του κατόχου;',
        whatsYourDOB: 'Ποια είναι η ημερομηνία γέννησής σας;',
        whatsTheOwnersAddress: 'Ποια είναι η διεύθυνση του ιδιοκτήτη;',
        whatsYourAddress: 'Ποια είναι η διεύθυνσή σας;',
        whatAreTheLast: 'Ποια είναι τα τελευταία 4 ψηφία του αριθμού κοινωνικής ασφάλισης του κατόχου;',
        whatsYourLast: 'Ποια είναι τα τελευταία 4 ψηφία του αριθμού κοινωνικής σας ασφάλισης;',
        whatsYourNationality: 'Ποια είναι η χώρα ιθαγένειάς σας;',
        whatsTheOwnersNationality: 'Ποια είναι η χώρα ιθαγένειας του ιδιοκτήτη;',
        countryOfCitizenship: 'Χώρα ιθαγένειας',
        dontWorry: 'Μην ανησυχείτε, δεν κάνουμε κανέναν προσωπικό έλεγχο πιστοληπτικής ικανότητας!',
        last4: 'Τελευταία 4 ψηφία του SSN',
        whyDoWeAsk: 'Γιατί ζητάμε αυτό;',
        letsDoubleCheck: 'Ας ελέγξουμε διπλά ότι όλα φαίνονται σωστά.',
        legalName: 'Νομικό όνομα',
        ownershipPercentage: 'Ποσοστό ιδιοκτησίας',
        areThereOther: (companyName: string) => `Υπάρχουν άλλα άτομα που κατέχουν ποσοστό 25% ή περισσότερο της ${companyName};`,
        owners: 'Ιδιοκτήτες',
        addCertified: 'Προσθέστε ένα πιστοποιημένο οργανόγραμμα που να εμφανίζει τους πραγματικούς δικαιούχους',
        regulationRequiresChart:
            'Οι κανονιστικές απαιτήσεις μας υποχρεώνουν να συλλέξουμε ένα πιστοποιημένο αντίγραφο του διαγράμματος ιδιοκτησίας, το οποίο να δείχνει κάθε φυσικό ή νομικό πρόσωπο που κατέχει ποσοστό 25% ή περισσότερο της επιχείρησης.',
        uploadEntity: 'Μεταφορτώστε το οργανόγραμμα ιδιοκτησίας της οντότητας',
        noteEntity:
            'Σημείωση: Το οργανόγραμμα ιδιοκτησίας της οντότητας πρέπει να φέρει την υπογραφή του λογιστή σας, του νομικού σας συμβούλου ή να είναι επικυρωμένο με συμβολαιογραφική πράξη.',
        certified: 'Πιστοποιημένο οργανόγραμμα ιδιοκτησίας οντότητας',
        selectCountry: 'Επιλέξτε χώρα',
        findCountry: 'Εύρεση χώρας',
        address: 'Διεύθυνση',
        chooseFile: 'Επιλέξτε αρχείο',
        uploadDocuments: 'Μεταφορτώστε πρόσθετα δικαιολογητικά',
        pleaseUpload:
            'Παρακαλούμε ανεβάστε παρακάτω πρόσθετα δικαιολογητικά, ώστε να μας βοηθήσετε να επαληθεύσουμε την ταυτότητά σας ως άμεσου ή έμμεσου κατόχου του 25% ή περισσότερο της επιχειρηματικής οντότητας.',
        acceptedFiles: 'Αποδεκτές μορφές αρχείων: PDF, PNG, JPEG. Το συνολικό μέγεθος αρχείου για κάθε ενότητα δεν μπορεί να υπερβαίνει τα 5 MB.',
        proofOfBeneficialOwner: 'Απόδειξη πραγματικού δικαιούχου',
        proofOfBeneficialOwnerDescription:
            'Παρακαλούμε προσκομίστε υπογεγραμμένη βεβαίωση και οργανόγραμμα από ορκωτό λογιστή, συμβολαιογράφο ή δικηγόρο που να επιβεβαιώνουν την κατοχή του 25% ή περισσότερο της επιχείρησης. Πρέπει να φέρουν ημερομηνία εντός των τελευταίων τριών μηνών και να περιλαμβάνουν τον αριθμό άδειας του υπογράφοντος.',
        copyOfID: 'Αντίγραφο ταυτότητας πραγματικού δικαιούχου',
        copyOfIDDescription: 'Παραδείγματα: διαβατήριο, άδεια οδήγησης κ.λπ.',
        proofOfAddress: 'Απόδειξη διεύθυνσης για τον πραγματικό δικαιούχο',
        proofOfAddressDescription: 'Παραδείγματα: λογαριασμός κοινής ωφέλειας, μισθωτήριο συμβόλαιο κ.λπ.',
        codiceFiscale: 'ΑΦΜ/Tax ID',
        codiceFiscaleDescription:
            'Παρακαλούμε ανεβάστε ένα βίντεο από επίσκεψη στις εγκαταστάσεις ή μια ηχογραφημένη κλήση με τον υπογράφοντα υπάλληλο. Ο υπάλληλος πρέπει να δώσει: πλήρες ονοματεπώνυμο, ημερομηνία γέννησης, επωνυμία εταιρείας, αριθμό καταχώρισης, αριθμό φορολογικού κωδικού, έδρα, αντικείμενο δραστηριότητας και σκοπό του λογαριασμού.',
    },
    completeVerificationStep: {
        completeVerification: 'Ολοκληρώστε την επαλήθευση',
        confirmAgreements: 'Παρακαλούμε επιβεβαιώστε τις παρακάτω συμφωνίες.',
        certifyTrueAndAccurate: 'Πιστοποιώ ότι οι παρεχόμενες πληροφορίες είναι αληθείς και ακριβείς',
        certifyTrueAndAccurateError: 'Παρακαλούμε πιστοποιήστε ότι οι πληροφορίες είναι αληθείς και ακριβείς',
        isAuthorizedToUseBankAccount: 'Είμαι εξουσιοδοτημένος/η να χρησιμοποιώ αυτόν τον επαγγελματικό τραπεζικό λογαριασμό για επαγγελματικές δαπάνες',
        isAuthorizedToUseBankAccountError: 'Πρέπει να είστε υπεύθυνος αξιωματούχος με εξουσιοδότηση να διαχειρίζεστε τον επαγγελματικό τραπεζικό λογαριασμό',
        termsAndConditions: 'όροι και προϋποθέσεις',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Επαληθεύστε τον τραπεζικό σας λογαριασμό',
        validateButtonText: 'Επικυρώστε',
        validationInputLabel: 'Συναλλαγή',
        maxAttemptsReached: 'Η επαλήθευση για αυτόν τον τραπεζικό λογαριασμό έχει απενεργοποιηθεί λόγω υπερβολικά πολλών εσφαλμένων προσπαθειών.',
        description: `Εντός 1–2 εργάσιμων ημερών, θα στείλουμε τρεις (3) μικρές συναλλαγές στον τραπεζικό σας λογαριασμό από ένα όνομα όπως «Expensify, Inc. Validation».`,
        descriptionCTA: 'Παρακαλούμε εισαγάγετε το ποσό κάθε συναλλαγής στα παρακάτω πεδία. Παράδειγμα: 1.51.',
        letsChatText: 'Σχεδόν τελειώσαμε! Χρειαζόμαστε τη βοήθειά σας για να επιβεβαιώσουμε μερικές τελευταίες πληροφορίες μέσω συνομιλίας. Είστε έτοιμοι;',
        enable2FATitle: 'Προλάβετε την απάτη, ενεργοποιήστε τον έλεγχο ταυτότητας δύο παραγόντων (2FA)',
        enable2FAText: 'Λαμβάνουμε σοβαρά υπόψη την ασφάλειά σας. Παρακαλούμε ρυθμίστε τώρα το 2FA για να προσθέσετε ένα επιπλέον επίπεδο προστασίας στον λογαριασμό σας.',
        secureYourAccount: 'Ασφαλίστε τον λογαριασμό σας',
    },
    countryStep: {
        confirmBusinessBank: 'Επιβεβαιώστε το νόμισμα και τη χώρα του επαγγελματικού τραπεζικού λογαριασμού',
        confirmCurrency: 'Επιβεβαιώστε το νόμισμα και τη χώρα',
        yourBusiness: 'Το νόμισμα του επαγγελματικού σας τραπεζικού λογαριασμού πρέπει να ταιριάζει με το νόμισμα του χώρου εργασίας σας.',
        youCanChange: 'Μπορείτε να αλλάξετε το νόμισμα του χώρου εργασίας σας στις',
        findCountry: 'Εύρεση χώρας',
        selectCountry: 'Επιλέξτε χώρα',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `Αυτός ο τραπεζικός λογαριασμός πρέπει να συνδεθεί με έναν χώρο εργασίας. Μεταβείτε στις <a href="${workspaceRoute}">Χώροι εργασίας</a>, επιλέξτε τον χώρο εργασίας σας και στη συνέχεια πλοηγηθείτε σε ροές εργασίας > πληρωμές > προσθήκη τραπεζικού λογαριασμού.`,
        },
    },
    bankInfoStep: {
        whatAreYour: 'Ποια είναι τα στοιχεία του τραπεζικού λογαριασμού της επιχείρησής σας;',
        letsDoubleCheck: 'Ας ελέγξουμε ξανά ότι όλα φαίνονται εντάξει.',
        thisBankAccount: 'Αυτός ο τραπεζικός λογαριασμός θα χρησιμοποιείται για επιχειρηματικές πληρωμές στον χώρο εργασίας σας',
        accountNumber: 'Αριθμός λογαριασμού',
        accountHolderNameDescription: 'Πλήρες όνομα εξουσιοδοτημένου υπογράφοντος',
    },
    signerInfoStep: {
        signerInfo: 'Στοιχεία υπογράφοντος',
        areYouDirector: (companyName: string) => `Είστε διευθυντής στην ${companyName};`,
        regulationRequiresUs: 'Ο κανονισμός μας υποχρεώνει να επιβεβαιώσουμε αν ο υπογράφων έχει την εξουσιοδότηση να προβεί σε αυτήν την ενέργεια εκ μέρους της επιχείρησης.',
        whatsYourName: 'Ποιο είναι το νόμιμο όνομά σας',
        fullName: 'Πλήρες νόμιμο όνομα',
        whatsYourJobTitle: 'Ποιος είναι ο επαγγελματικός σας τίτλος;',
        jobTitle: 'Τίτλος εργασίας',
        whatsYourDOB: 'Ποια είναι η ημερομηνία γέννησής σας;',
        uploadID: 'Ανεβάστε την ταυτότητα και αποδεικτικό διεύθυνσης',
        personalAddress: 'Απόδειξη προσωπικής διεύθυνσης (π.χ. λογαριασμός κοινής ωφέλειας)',
        letsDoubleCheck: 'Ας ελέγξουμε διπλά ότι όλα φαίνονται σωστά.',
        legalName: 'Νομικό όνομα',
        proofOf: 'Απόδειξη προσωπικής διεύθυνσης',
        enterOneEmail: (companyName: string) => `Εισαγάγετε το email ενός διευθυντή στην ${companyName}`,
        regulationRequiresOneMoreDirector: 'Η νομοθεσία απαιτεί τουλάχιστον έναν ακόμη διευθυντή ως υπογράφοντα.',
        hangTight: 'Μισό λεπτό...',
        enterTwoEmails: (companyName: string) => `Εισαγάγετε τα email δύο διευθυντών στην ${companyName}`,
        sendReminder: 'Αποστολή υπενθύμισης',
        chooseFile: 'Επιλέξτε αρχείο',
        weAreWaiting: 'Περιμένουμε άλλα άτομα να επιβεβαιώσουν την ταυτότητά τους ως διευθυντές της επιχείρησης.',
        id: 'Αντίγραφο ταυτότητας',
        proofOfDirectors: 'Απόδειξη διευθυντή(-ών)',
        proofOfDirectorsDescription: 'Παραδείγματα: εταιρικό προφίλ Oncorp ή καταχώριση επιχείρησης.',
        codiceFiscale: 'Κωδικός Φορολογικού Μητρώου',
        codiceFiscaleDescription: 'Codice Fiscale για υπογράφοντες, εξουσιοδοτημένους χρήστες και πραγματικούς δικαιούχους.',
        PDSandFSG: 'Έγγραφα γνωστοποίησης PDS + FSG',
        PDSandFSGDescription: Str.dedent(`
            Η συνεργασία μας με την Corpay χρησιμοποιεί σύνδεση API ώστε να αξιοποιήσει το εκτεταμένο δίκτυο διεθνών τραπεζικών συνεργατών της για να υποστηρίξει τις Παγκόσμιες Αποζημιώσεις στην Expensify. Σύμφωνα με την αυστραλιανή νομοθεσία, σας παρέχουμε τον Οδηγό Χρηματοοικονομικών Υπηρεσιών (Financial Services Guide, FSG) και τη Δήλωση Αποκάλυψης Προϊόντος (Product Disclosure Statement, PDS) της Corpay.

            Παρακαλούμε διαβάστε προσεκτικά τα έγγραφα FSG και PDS, καθώς περιέχουν πλήρεις λεπτομέρειες και σημαντικές πληροφορίες για τα προϊόντα και τις υπηρεσίες που προσφέρει η Corpay. Διατηρήστε αυτά τα έγγραφα για μελλοντική αναφορά.
        `),
        pleaseUpload: 'Παρακαλούμε ανεβάστε επιπλέον έγγραφα παρακάτω, ώστε να μας βοηθήσετε να επαληθεύσουμε την ταυτότητά σας ως διευθυντή της επιχείρησης.',
        enterSignerInfo: 'Εισαγάγετε τα στοιχεία υπογράφοντα',
        thisStep: 'Αυτό το βήμα έχει ολοκληρωθεί',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `συνδέει έναν επαγγελματικό τραπεζικό λογαριασμό σε ${currency} που λήγει σε ${bankAccountLastFour} με το Expensify για να πληρώνει εργαζομένους σε ${currency}. Το επόμενο βήμα απαιτεί στοιχεία υπογράφοντος από έναν διευθυντή.`,
        error: {
            emailsMustBeDifferent: 'Τα email πρέπει να είναι διαφορετικά',
        },
    },
    agreementsStep: {
        agreements: 'Συμφωνίες',
        pleaseConfirm: 'Παρακαλούμε επιβεβαιώστε τις παρακάτω συμφωνίες',
        regulationRequiresUs: 'Οι κανονισμοί απαιτούν να επαληθεύουμε την ταυτότητα κάθε ατόμου που κατέχει πάνω από 25% της επιχείρησης.',
        iAmAuthorized: 'Είμαι εξουσιοδοτημένο άτομο να χρησιμοποιώ τον επιχειρηματικό τραπεζικό λογαριασμό για επαγγελματικές δαπάνες.',
        iCertify: 'Βεβαιώνω ότι οι παρεχόμενες πληροφορίες είναι αληθείς και ακριβείς.',
        iAcceptTheTermsAndConditions: `Αποδέχομαι τους <a href="https://www.corpay.com/cross-border/terms">όρους και τις προϋποθέσεις</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Αποδέχομαι τους όρους και τις προϋποθέσεις.',
        accept: 'Αποδοχή και προσθήκη τραπεζικού λογαριασμού',
        iConsentToThePrivacyNotice: 'Συναινώ στην <a href="https://payments.corpay.com/compliance">ειδοποίηση απορρήτου</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Συναινώ στην ειδοποίηση απορρήτου.',
        error: {
            authorized: 'Πρέπει να είστε υπεύθυνος αξιωματούχος με εξουσιοδότηση να διαχειρίζεστε τον επαγγελματικό τραπεζικό λογαριασμό',
            certify: 'Παρακαλούμε πιστοποιήστε ότι οι πληροφορίες είναι αληθείς και ακριβείς',
            consent: 'Παρακαλούμε αποδεχθείτε την ειδοποίηση απορρήτου',
        },
    },
    docusignStep: {
        subheader: 'Φόρμα Docusign',
        pleaseComplete:
            'Συμπληρώστε τη φόρμα εξουσιοδότησης ACH μέσω του παρακάτω συνδέσμου DocuSign και στη συνέχεια ανεβάστε εδώ το υπογεγραμμένο αντίγραφο, ώστε να μπορέσουμε να αποσύρουμε χρήματα απευθείας από τον τραπεζικό σας λογαριασμό.',
        pleaseCompleteTheBusinessAccount: 'Συμπληρώστε τη φόρμα αίτησης εταιρικού λογαριασμού για ρύθμιση άμεσης χρέωσης',
        pleaseCompleteTheDirect:
            'Ολοκληρώστε τη ρύθμιση άμεσης χρέωσης χρησιμοποιώντας τον σύνδεσμο Docusign παρακάτω και, στη συνέχεια, ανεβάστε εδώ το υπογεγραμμένο αντίγραφο, ώστε να μπορούμε να κάνουμε απευθείας ανάληψη χρημάτων από τον τραπεζικό σας λογαριασμό.',
        takeMeTo: 'Μεταφορά στο DocuSign',
        uploadAdditional: 'Μεταφορτώστε πρόσθετα δικαιολογητικά',
        pleaseUpload: 'Παρακαλούμε ανεβάστε τη φόρμα DEFT και τη σελίδα υπογραφής Docusign',
        pleaseUploadTheDirect: 'Παρακαλούμε ανεβάστε τις ρυθμίσεις άμεσης χρέωσης και τη σελίδα υπογραφής Docusign',
    },
    finishStep: {
        letsFinish: 'Ας ολοκληρώσουμε στη συνομιλία!',
        thanksFor:
            'Σας ευχαριστούμε για αυτές τις λεπτομέρειες. Ένας ειδικός σύμβουλος υποστήριξης θα εξετάσει τώρα τις πληροφορίες σας. Θα επικοινωνήσουμε ξανά μαζί σας αν χρειαστούμε κάτι ακόμη, αλλά στο μεταξύ, μη διστάσετε να επικοινωνήσετε μαζί μας για οποιαδήποτε απορία.',
        iHaveA: 'Έχω μια ερώτηση',
        enable2FA: 'Ενεργοποιήστε τον έλεγχο ταυτότητας δύο παραγόντων (2FA) για να αποτρέψετε την απάτη',
        weTake: 'Λαμβάνουμε σοβαρά υπόψη την ασφάλειά σας. Παρακαλούμε ρυθμίστε τώρα το 2FA για να προσθέσετε ένα επιπλέον επίπεδο προστασίας στον λογαριασμό σας.',
        secure: 'Ασφαλίστε τον λογαριασμό σας',
    },
    documentsStep: {
        beforeYouGo: 'Πριν αποχωρήσετε, χρειαζόμαστε ορισμένα έγγραφα για να επαληθεύσουμε κάποια στοιχεία',
        subheader: 'Επαλήθευση',
        verificationFailed: 'Η επαλήθευση απέτυχε, επομένως θα χρειαστούμε μερικά επιπλέον έγγραφα για να επαληθεύσουμε εσάς και την επιχείρησή σας.',
        taxIDVerification: 'Επαλήθευση ΑΦΜ',
        taxIDVerificationDescription: Str.dedent(`
            Παρακαλούμε ανεβάστε ένα από τα παρακάτω αρχεία:
            • Επιστολή ανάθεσης TIN/EIN από την IRS
            • Επιβεβαίωση αίτησης TIN/EIN από την IRS (συνήθως αναφέρει «Συγχαρητήρια! Ο EIN έχει εκδοθεί με επιτυχία»)
            • Επιστολή φορολογικής απαλλαγής από την IRS που αναφέρει την επωνυμία της εταιρείας σας και τον EIN σας
        `),
        nameChangeDocument: 'Έγγραφο αλλαγής ονόματος',
        nameChangeDocumentDescription:
            'Εάν η επωνυμία της εταιρείας σας έχει αλλάξει από τότε που καταχωρίσατε το TIN/EIN, χρειαζόμαστε αυτό το έγγραφο για να επαληθεύσουμε τον αριθμό φορολογικού μητρώου που δηλώσατε',
        companyAddressVerification: 'Επαλήθευση εταιρικής διεύθυνσης',
        companyAddressVerificationDescription: Str.dedent(`
            Παρακαλούμε ανεβάστε ένα από τα ακόλουθα αρχεία:
            • Πρόσφατος λογαριασμός κοινής ωφέλειας που να εμφανίζει το όνομα και τη διεύθυνση της εταιρείας
            • Αντίγραφο κίνησης λογαριασμού (Bank Statement) που να εμφανίζει το όνομα και τη διεύθυνση της εταιρείας
            • Τρέχουσα σύμβαση μίσθωσης/ενοικίασης, συμπεριλαμβανομένης της σελίδας υπογραφών, που να εμφανίζει το όνομα και την τρέχουσα διεύθυνση της εταιρείας σας
            • Βεβαίωση ασφαλιστηρίου που να εμφανίζει το όνομα και τη διεύθυνση της εταιρείας
            • Έγγραφο απόδοσης ΑΦΜ (TIN assignment) που να εμφανίζει το όνομα και τη διεύθυνση της εταιρείας
            • Τελευταία φορολογική δήλωση της επιχείρησης που να εμφανίζει το όνομα και τη διεύθυνση της εταιρείας
        `),
        userAddressVerification: 'Επαλήθευση διεύθυνσης',
        userAddressVerificationDescription: Str.dedent(`
            Ανεβάστε ένα από τα ακόλουθα αρχεία:
            • Κάρτα εγγραφής ψηφοφόρου
            • Άδεια οδήγησης
            • Αντίγραφο κίνησης τραπεζικού λογαριασμού
            • Λογαριασμός κοινής ωφέλειας
        `),
        userDOBVerification: 'Επαλήθευση ημερομηνίας γέννησης',
        userDOBVerificationDescription: 'Παρακαλούμε ανεβάστε μια ταυτότητα που έχει εκδοθεί στις ΗΠΑ',
        finishViaChat: 'Ολοκλήρωση μέσω συνομιλίας',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Μισό λεπτό',
        explanationLine: 'Εξετάζουμε τις πληροφορίες σας. Θα μπορέσετε να συνεχίσετε με τα επόμενα βήματα σε λίγο.',
    },
    session: {
        offlineMessageRetry: 'Φαίνεται ότι είστε εκτός σύνδεσης. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.',
    },
    travel: {
        header: 'Κάντε κράτηση ταξιδιού',
        title: 'Ταξιδέψτε έξυπνα',
        subtitle: 'Χρησιμοποιήστε το Expensify Travel για να βρείτε τις καλύτερες ταξιδιωτικές προσφορές και να διαχειρίζεστε όλα τα επαγγελματικά έξοδά σας σε ένα μέρος.',
        features: {
            saveMoney: 'Εξοικονομήστε χρήματα στις κρατήσεις σας',
            alerts: 'Λάβετε ειδοποιήσεις σε πραγματικό χρόνο αν αλλάξουν τα ταξιδιωτικά σας σχέδια',
        },
        bookTravel: 'Κάντε κράτηση ταξιδιού',
        bookDemo: 'Κλείστε επίδειξη',
        bookADemo: 'Κλείστε ένα demo',
        toLearnMore: 'για να μάθετε περισσότερα.',
        termsAndConditions: {
            header: 'Πριν συνεχίσουμε...',
            title: 'Όροι και προϋποθέσεις',
            label: 'Αποδέχομαι τους όρους και τις προϋποθέσεις',
            subtitle: `Παρακαλούμε αποδεχθείτε τους <a href="${CONST.TRAVEL_TERMS_URL}">όρους και προϋποθέσεις</a> του Expensify Travel.`,
            error: 'Πρέπει να αποδεχθείτε τους όρους και τις προϋποθέσεις του Expensify Travel για να συνεχίσετε',
            defaultWorkspaceError:
                'Πρέπει να ορίσετε ένα προεπιλεγμένο χώρο εργασίας για να ενεργοποιήσετε το Expensify Travel. Μεταβείτε στις Ρυθμίσεις > Χώροι εργασίας > κάντε κλικ στις τρεις κάθετες τελείες δίπλα σε έναν χώρο εργασίας > Ορισμός ως προεπιλεγμένου χώρου εργασίας και δοκιμάστε ξανά.',
        },
        flight: 'Πτήση',
        flightDetails: {
            passenger: 'Επιβάτης',
            layover: (layover: string) => `<muted-text-label>Έχετε <strong>ενδιάμεση στάση ${layover}</strong> πριν από αυτήν την πτήση</muted-text-label>`,
            takeOff: 'Απογείωση',
            landing: 'Σελίδα υποδοχής',
            seat: 'Θέση',
            class: 'Θέση καμπίνας',
            recordLocator: 'Κωδικός κράτησης',
            cabinClasses: {
                unknown: 'Άγνωστο',
                economy: 'Οικονομία',
                premiumEconomy: 'Premium Economy',
                business: 'Επιχείρηση',
                first: 'Πρώτο',
            },
        },
        hotel: 'Ξενοδοχείο',
        hotelDetails: {
            guest: 'Επισκέπτης',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            roomType: 'Τύπος δωματίου',
            cancellation: 'Πολιτική ακύρωσης',
            cancellationUntil: 'Δωρεάν ακύρωση έως',
            confirmation: 'Αριθμός επιβεβαίωσης',
            cancellationPolicies: {
                unknown: 'Άγνωστο',
                nonRefundable: 'Μη επιστρέψιμο',
                freeCancellationUntil: 'Δωρεάν ακύρωση έως',
                partiallyRefundable: 'Μερικώς επιστρέψιμο',
            },
        },
        car: 'Αυτοκίνητο',
        carDetails: {
            rentalCar: 'Ενοικίαση αυτοκινήτου',
            pickUp: 'Παραλαβή',
            dropOff: 'Παράδοση',
            driver: 'Οδηγός',
            carType: 'Τύπος αυτοκινήτου',
            cancellation: 'Πολιτική ακύρωσης',
            cancellationUntil: 'Δωρεάν ακύρωση έως',
            freeCancellation: 'Δωρεάν ακύρωση',
            confirmation: 'Αριθμός επιβεβαίωσης',
        },
        train: 'Τρένο',
        trainDetails: {
            passenger: 'Επιβάτης',
            departs: 'Αναχώρηση',
            arrives: 'Φθάνει',
            coachNumber: 'Αριθμός βαγονιού',
            seat: 'Θέση',
            fareDetails: 'Λεπτομέρειες ναύλου',
            confirmation: 'Αριθμός επιβεβαίωσης',
        },
        viewTrip: 'Προβολή ταξιδιού',
        modifyTrip: 'Τροποποίηση ταξιδιού',
        tripSupport: 'Υποστήριξη ταξιδιού',
        tripDetails: 'Λεπτομέρειες ταξιδιού',
        viewTripDetails: 'Προβολή λεπτομερειών ταξιδιού',
        trip: 'Ταξίδι',
        trips: 'Ταξίδια',
        tripSummary: 'Σύνοψη ταξιδιού',
        departs: 'Αναχώρηση',
        errorMessage: 'Κάτι πήγε στραβά. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        phoneError: (phoneErrorMethodsRoute: string) =>
            `<rbr>Παρακαλούμε <a href="${phoneErrorMethodsRoute}">προσθέστε ένα επαγγελματικό email ως κύρια σύνδεση</a> για να κάνετε κράτηση ταξιδιού.</rbr>`,
        domainSelector: {
            title: 'Τομέας',
            subtitle: 'Επιλέξτε ένα domain για τη ρύθμιση του Expensify Travel.',
            recommended: 'Προτεινόμενο',
        },
        taxID: {
            title: 'ΑΦΜ',
            subtitle: 'Εισαγάγετε τον φορολογικό αριθμό της νομικής σας οντότητας ώστε να ρυθμίσουμε τη χρέωση ταξιδιών στο τοπικό σας νόμισμα.',
            inputLabel: 'ΑΦΜ νομικής οντότητας',
            error: {
                required: 'Παρακαλούμε εισαγάγετε το φορολογικό αριθμό της νομικής σας οντότητας.',
            },
        },
        domainPermissionInfo: {
            title: 'Τομέας',
            restriction: (domain: string) =>
                `Δεν έχετε δικαίωμα να ενεργοποιήσετε το Expensify Travel για τον τομέα <strong>${domain}</strong>. Θα χρειαστεί να ζητήσετε από κάποιον από αυτόν τον τομέα να ενεργοποιήσει το ταξίδι.`,
            accountantInvitation: `Αν είστε λογιστής, σκεφτείτε να συμμετάσχετε στο <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">πρόγραμμα λογιστών ExpensifyApproved!</a> για να ενεργοποιήσετε τα ταξίδια για αυτόν τον τομέα.`,
        },
        publicDomainError: {
            title: 'Ξεκινήστε με το Expensify Travel',
            message: `Θα πρέπει να χρησιμοποιείτε το επαγγελματικό σας email (π.χ. name@company.com) με το Expensify Travel, όχι το προσωπικό σας email (π.χ. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Η υπηρεσία Expensify Travel έχει απενεργοποιηθεί',
            message: `Ο διαχειριστής σας έχει απενεργοποιήσει το Expensify Travel. Παρακαλούμε ακολουθήστε την πολιτική κρατήσεων της εταιρείας σας για τις ταξιδιωτικές σας ρυθμίσεις.`,
        },
        verifyCompany: {
            title: 'Εξετάζουμε το αίτημά σας...',
            message: `Πραγματοποιούμε μερικούς ελέγχους από την πλευρά μας για να επιβεβαιώσουμε ότι ο λογαριασμός σας είναι έτοιμος για το Expensify Travel. Θα επικοινωνήσουμε μαζί σας σύντομα!`,
            confirmText: 'Εντάξει',
            conciergeMessage: ({domain}: {domain: string}) =>
                `Η ενεργοποίηση ταξιδιού απέτυχε για τον τομέα: ${domain}. Παρακαλούμε ελέγξτε και ενεργοποιήστε το ταξίδι για αυτόν τον τομέα.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Η πτήση σας ${airlineCode} (${origin} → ${destination}) στις ${startDate} έχει κρατηθεί. Κωδικός επιβεβαίωσης: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Το εισιτήριό σας για την πτήση ${airlineCode} (${origin} → ${destination}) στις ${startDate} έχει ακυρωθεί.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Το εισιτήριό σας για την πτήση ${airlineCode} (${origin} → ${destination}) στις ${startDate} έχει επιστραφεί ή αλλαχθεί.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Η πτήση σας ${airlineCode} (${origin} → ${destination}) στις ${startDate}} έχει ακυρωθεί από την αεροπορική εταιρεία.`,
            flightScheduleChangePending: (airlineCode: string) => `Η αεροπορική εταιρεία έχει προτείνει αλλαγή δρομολογίου για την πτήση ${airlineCode}· αναμένουμε επιβεβαίωση.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Η αλλαγή δρομολογίου επιβεβαιώθηκε: η πτήση ${airlineCode} αναχωρεί τώρα στις ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Η πτήση σας ${airlineCode} (${origin} → ${destination}) στις ${startDate} έχει ενημερωθεί.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Η κατηγορία θέσης σας έχει ενημερωθεί σε ${cabinClass} στην πτήση ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Η θέση σας στην πτήση ${airlineCode} έχει επιβεβαιωθεί.`,
            flightSeatChanged: (airlineCode: string) => `Η θέση σας στην πτήση ${airlineCode} έχει αλλάξει.`,
            flightSeatCancelled: (airlineCode: string) => `Η θέση σας στην πτήση ${airlineCode} καταργήθηκε.`,
            paymentDeclined: 'Η πληρωμή για την κράτησή σας για αεροπορικά εισιτήρια απέτυχε. Παρακαλούμε δοκιμάστε ξανά.',
            bookingCancelledByTraveler: (type: string, id = '') => `Ακυρώσατε την κράτηση ${type} με αριθμό ${id}.`,
            bookingCancelledByVendor: (type: string, id = '') => `Ο προμηθευτής ακύρωσε την κράτηση ${type} ${id}.`,
            bookingRebooked: (type: string, id = '') => `Η κράτησή σας για ${type} έγινε ξανά. Νέος αριθμός επιβεβαίωσης: ${id}.`,
            bookingUpdated: (type: string) => `Η κράτηση ${type} ενημερώθηκε. Ελέγξτε τις νέες λεπτομέρειες στο δρομολόγιο.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `Το εισιτήριο τρένου σας από ${origin} → ${destination} για τις ${startDate} έχει επιστραφεί. Θα διεκπεραιωθεί μια πίστωση.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `Το σιδηροδρομικό σας εισιτήριο για ${origin} → ${destination} στις ${startDate} έχει αλλάξει.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `Το εισιτήριό σας τρένου για ${origin} → ${destination} στις ${startDate} έχει ενημερωθεί.`,
            defaultUpdate: (type: string) => `Η κράτηση ${type} σας ενημερώθηκε.`,
        },
        flightTo: 'Πτήση προς',
        trainTo: 'Τρένο προς',
        carRental: 'ενοικίαση αυτοκινήτου',
        nightIn: 'διανυκτέρευση σε',
        nightsIn: 'διανυκτερεύσεις σε',
    },
    proactiveAppReview: {
        title: 'Σας αρέσει το νέο Expensify;',
        description: 'Ενημερώστε μας ώστε να μπορέσουμε να κάνουμε την εμπειρία καταχώρισης εξόδων σας ακόμη καλύτερη.',
        positiveButton: 'Ναι!',
        negativeButton: 'Όχι ιδιαίτερα',
    },
    workspace: {
        common: {
            card: 'Κάρτες',
            expensifyCard: 'Κάρτα Expensify',
            companyCards: 'Εταιρικές κάρτες',
            personalCards: 'Προσωπικές κάρτες',
            workflows: 'Ροές εργασιών',
            workspace: 'Χώρος εργασίας',
            findWorkspace: 'Εύρεση χώρου εργασίας',
            findDomain: 'Εύρεση τομέα',
            findRoom: 'Βρείτε δωμάτιο',
            edit: 'Επεξεργασία χώρου εργασίας',
            enabled: 'Ενεργοποιημένο',
            disabled: 'Απενεργοποιημένο',
            everyone: 'Όλοι',
            delete: 'Διαγραφή χώρου εργασίας',
            settings: 'Ρυθμίσεις',
            categories: 'Κατηγορίες',
            tags: 'Ετικέτες',
            customField1: 'Προσαρμοσμένο πεδίο 1',
            customField2: 'Προσαρμοσμένο πεδίο 2',
            customFieldHint: 'Προσθέστε προσαρμοσμένη κωδικοποίηση που θα εφαρμόζεται σε όλες τις δαπάνες από αυτό το μέλος.',
            reports: 'Αναφορές',
            reportFields: 'Πεδία αναφοράς',
            reportTitle: 'Τίτλος αναφοράς',
            reportField: 'Πεδίο αναφοράς',
            taxes: 'Φόροι',
            bills: 'Λογαριασμοί',
            invoices: 'Τιμολόγια',
            perDiem: 'Ημερήσια αποζημίωση',
            travel: 'Ταξίδι',
            members: 'Μέλη',
            rooms: 'Δωμάτια',
            accounting: 'Λογιστική',
            hr: 'HR',
            receiptPartners: 'Συνεργάτες αποδείξεων',
            rules: 'Κανόνες',
            displayedAs: 'Εμφανίζεται ως',
            plan: 'Πλάνο',
            profile: 'Επισκόπηση',
            bankAccount: 'Τραπεζικός λογαριασμός',
            testTransactions: 'Δοκιμαστικές συναλλαγές',
            issueAndManageCards: 'Έκδοση και διαχείριση καρτών',
            reconcileCards: 'Συμφωνία καρτών',
            selectAll: 'Επιλογή όλων',
            selected: () => ({
                one: '1 επιλεγμένο',
                other: (count: number) => `Έχουν επιλεγεί ${count}`,
            }),
            settlementFrequency: 'Συχνότητα εκκαθάρισης',
            setAsDefault: 'Ορισμός ως προεπιλεγμένου χώρου εργασίας',
            defaultNote: `Οι αποδείξεις που αποστέλλονται στο ${CONST.EMAIL.RECEIPTS} θα εμφανίζονται σε αυτόν τον χώρο εργασίας.`,
            deleteConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον χώρο εργασίας;',
            deleteWithCardsConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον χώρο εργασίας; Θα αφαιρεθούν όλες οι ροές καρτών και οι ανατεθειμένες κάρτες.',
            deleteOpenExpensifyCardsError: 'Η εταιρεία σας έχει ακόμη Κάρτες Expensify. Παρακαλούμε <concierge-link>επικοινωνήστε με το Concierge</concierge-link> για να τις αφαιρέσετε.',
            outstandingBalanceWarning:
                'Έχετε ένα ανεξόφλητο υπόλοιπο που πρέπει να τακτοποιηθεί πριν διαγράψετε τον τελευταίο χώρο εργασίας σας. Παρακαλούμε μεταβείτε στις ρυθμίσεις συνδρομής σας για να τακτοποιήσετε την πληρωμή.',
            settleBalance: 'Μετάβαση στη συνδρομή',
            unavailable: 'Μη διαθέσιμος χώρος εργασίας',
            memberNotFound: 'Το μέλος δεν βρέθηκε. Για να προσκαλέσετε ένα νέο μέλος στον χώρο εργασίας, χρησιμοποιήστε το κουμπί πρόσκλησης παραπάνω.',
            notAuthorized: `Δεν έχετε πρόσβαση σε αυτή τη σελίδα. Αν προσπαθείτε να συμμετάσχετε σε αυτόν τον χώρο εργασίας, απλώς ζητήστε από τον κάτοχο του χώρου εργασίας να σας προσθέσει ως μέλος. Κάτι άλλο; Επικοινωνήστε με το ${CONST.EMAIL.CONCIERGE}.`,
            readOnlyActionTitle: 'Όχι και τόσο γρήγορα...',
            readOnlyActionPrompt: 'Ο ρόλος σας σε αυτόν τον χώρο εργασίας μπορεί να δει αυτές τις ρυθμίσεις, αλλά δεν μπορεί να τις επεξεργαστεί.',
            goToWorkspace: 'Μετάβαση στον χώρο εργασίας',
            duplicateWorkspace: 'Διπλότυπος χώρος εργασίας',
            duplicateWorkspacePrefix: 'Διπλότυπο',
            goToWorkspaces: 'Μετάβαση στους χώρους εργασίας',
            clearFilter: 'Εκκαθάριση φίλτρου',
            workspaceName: 'Όνομα χώρου εργασίας',
            workspaceOwner: 'Ιδιοκτήτης',
            keepMeAsAdmin: 'Να παραμείνω διαχειριστής',
            workspaceType: 'Τύπος χώρου εργασίας',
            workspaceAvatar: 'Avatar χώρου εργασίας',
            clientID: 'Αναγνωριστικό πελάτη',
            clientIDInputHint: 'Εισαγάγετε το μοναδικό αναγνωριστικό του πελάτη',
            mustBeOnlineToViewMembers: 'Πρέπει να είστε συνδεδεμένοι στο διαδίκτυο για να δείτε τα μέλη αυτού του χώρου εργασίας.',
            moreFeatures: 'Περισσότερες δυνατότητες',
            requested: 'Ζητήθηκε',
            distanceRates: 'Τιμές χιλιομετρικής αποζημίωσης',
            defaultDescription: 'Ένα μέρος για όλες τις αποδείξεις και τα έξοδά σας.',
            descriptionHint: 'Κοινοποιήστε πληροφορίες σχετικά με αυτόν τον χώρο εργασίας σε όλα τα μέλη.',
            welcomeNote: 'Παρακαλούμε χρησιμοποιήστε το Expensify για να υποβάλετε τις αποδείξεις σας για αποζημίωση, ευχαριστούμε!',
            subscription: 'Συνδρομή',
            markAsEntered: 'Σήμανση ως καταχωρισμένο χειροκίνητα',
            markAsExported: 'Επισήμανση ως εξαχθέν',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Εξαγωγή σε ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Ας ελέγξουμε άλλη μία φορά ότι όλα φαίνονται σωστά.',
            lineItemLevel: 'Σε επίπεδο επιμέρους στοιχείου',
            reportLevel: 'Επίπεδο αναφοράς',
            topLevel: 'Ανώτερο επίπεδο',
            appliedOnExport: 'Δεν εισάγεται στο Expensify, εφαρμόζεται κατά την εξαγωγή',
            shareNote: {
                header: 'Κοινοποιήστε τον χώρο εργασίας σας σε άλλα μέλη',
                content: (adminsRoomLink: string) =>
                    `Μοιραστείτε αυτόν τον κωδικό QR ή αντιγράψτε τον παρακάτω σύνδεσμο για να διευκολύνετε τα μέλη να ζητούν πρόσβαση στον χώρο εργασίας σας. Όλα τα αιτήματα για να συμμετάσχουν στον χώρο εργασίας θα εμφανίζονται στο δωμάτιο <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> για την εξέτασή σας.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Συνδέστε με το ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Δημιουργία νέας σύνδεσης',
            reuseExistingConnection: 'Επαναχρησιμοποιήστε την υπάρχουσα σύνδεση',
            existingConnections: 'Υπάρχουσες συνδέσεις',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Αφού έχετε συνδεθεί στο ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} στο παρελθόν, μπορείτε να επιλέξετε να χρησιμοποιήσετε ξανά μια υπάρχουσα σύνδεση ή να δημιουργήσετε μια νέα.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `${connectionName} - Τελευταίος συγχρονισμός ${formattedDate}`,
            authenticationError: (connectionName: string) => `Δεν είναι δυνατή η σύνδεση με το ${connectionName} λόγω σφάλματος ταυτοποίησης.`,
            learnMore: 'Μάθετε περισσότερα',
            memberAlternateText: 'Υποβάλετε και εγκρίνετε αναφορές.',
            adminAlternateText: 'Διαχειριστείτε αναφορές και ρυθμίσεις χώρου εργασίας.',
            auditorAlternateText: 'Προβολή και σχολιασμός αναφορών.',
            cardAdminAlternateText: 'Διαχειριστείτε τις κάρτες χώρου εργασίας.',
            peopleAdminAlternateText: 'Διαχειριστείτε μέλη και ροές έγκρισης.',
            paymentsAdminAlternateText: 'Διαχειριστείτε τις πληρωμές ροής εργασιών.',
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: 'Άμεσο',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: 'Κανένα',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: 'Έμμεσο',
            },
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.OWNER:
                        return 'Ιδιοκτήτης';
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Διαχειριστής χώρου εργασίας';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Ελεγκτής';
                    case CONST.POLICY.ROLE.EDITOR:
                        return 'Επεξεργαστής';
                    case CONST.POLICY.ROLE.CARD_ADMIN:
                        return 'Διαχείριση κάρτας';
                    case CONST.POLICY.ROLE.PEOPLE_ADMIN:
                        return 'Διαχείριση προσωπικού';
                    case CONST.POLICY.ROLE.PAYMENTS_ADMIN:
                        return 'Διαχειριστής πληρωμών';
                    case CONST.POLICY.ROLE.USER:
                        return 'Μέλος';
                    default:
                        return 'Μέλος';
                }
            },
            frequency: {
                manual: 'Μη αυτόματα',
                instant: 'Άμεσο',
                immediate: 'Καθημερινά',
                trip: 'Ανά ταξίδι',
                weekly: 'Εβδομαδιαία',
                semimonthly: 'Δύο φορές τον μήνα',
                monthly: 'Μηνιαίως',
            },
            budgetFrequency: {
                monthly: 'μηνιαία',
                yearly: 'ετησίως',
            },
            budgetFrequencyUnit: {
                monthly: 'μήνας',
                yearly: 'έτος',
            },
            budgetTypeForNotificationMessage: {
                tag: 'ετικέτα',
                category: 'κατηγορία',
            },
            planType: 'Τύπος προγράμματος',
            youCantDowngradeInvoicing:
                'Δεν μπορείτε να υποβαθμίσετε το πλάνο σας σε μια συνδρομή με τιμολόγηση. Για να συζητήσετε ή να κάνετε αλλαγές στη συνδρομή σας, επικοινωνήστε με τον υπεύθυνο λογαριασμού σας ή με το Concierge για βοήθεια.',
            defaultCategory: 'Προεπιλεγμένη κατηγορία',
            viewTransactions: 'Προβολή συναλλαγών',
            policyExpenseChatName: (displayName: string) => `έξοδα του/της ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Οι συναλλαγές της Κάρτας Expensify θα εξαχθούν αυτόματα σε έναν «Λογαριασμό υποχρέωσης Κάρτας Expensify» που δημιουργείται με <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">την ενσωμάτωσή μας</a>.</muted-text-label>`,
            travelInvoicing: 'Εξαγωγή ενοποιημένων εξόδων ταξιδιωτικής τιμολόγησης ως',
            travelInvoicingVendor: 'Προμηθευτής ταξιδιών',
            travelInvoicingPayableAccount: 'Λογαριασμός πληρωτέων ταξιδιών',
        },
        createdForClient: {
            title: 'Δημιουργήσατε έναν χώρο εργασίας για τον πελάτη σας!',
            description: 'Καλά νέα 🎉. Επικοινωνήστε μαζί μας αν χρειαστούν βοήθεια με τη ρύθμιση.',
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `Συνδεθήκατε με την ${organizationName}` : 'Αυτοματοποιήστε τα έξοδα ταξιδιών και παράδοσης γευμάτων σε ολόκληρο τον οργανισμό σας.',
                sendInvites: 'Αποστολή προσκλήσεων',
                sendInvitesDescription: 'Αυτά τα μέλη του χώρου εργασίας δεν διαθέτουν ακόμα λογαριασμό Uber for Business. Αποεπιλέξτε όσα μέλη δεν θέλετε να προσκαλέσετε αυτή τη στιγμή.',
                confirmInvite: 'Επιβεβαίωση πρόσκλησης',
                manageInvites: 'Διαχείριση προσκλήσεων',
                confirm: 'Επιβεβαιώστε',
                allSet: 'Έτοιμοι',
                readyToRoll: 'Είστε έτοιμοι να ξεκινήσετε',
                takeBusinessRideMessage: 'Κάντε μια επαγγελματική διαδρομή με Uber και οι αποδείξεις σας θα εισαχθούν στο Expensify. Φύγαμε!',
                all: 'Όλα',
                linked: 'Συνδεδεμένο',
                outstanding: 'Σε εκκρεμότητα',
                status: {
                    resend: 'Επαναποστολή',
                    invite: 'Πρόσκληση',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Συνδεδεμένο',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Σε εκκρεμότητα',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Έχει ανασταλεί',
                },
                centralBillingAccount: 'Κεντρικός λογαριασμός χρέωσης',
                centralBillingDescription: 'Επιλέξτε πού θα εισαχθούν όλες οι αποδείξεις Uber.',
                invitationFailure: 'Αποτυχία πρόσκλησης μέλους στο Uber for Business',
                autoInvite: 'Προσκαλέστε νέα μέλη χώρου εργασίας στο Uber for Business',
                autoRemove: 'Απενεργοποίηση των καταργημένων μελών χώρου εργασίας από το Uber for Business',
                emptyContent: {
                    title: 'Δεν υπάρχουν εκκρεμείς προσκλήσεις',
                    subtitle: 'Ζήτω! Ψάξαμε παντού και δεν βρήκαμε καμία εκκρεμή πρόσκληση.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Ορίστε ημερήσια επιδόματα για να ελέγχετε τις καθημερινές δαπάνες των εργαζομένων. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Μάθετε περισσότερα</a>.</muted-text>`,
            amount: 'Ποσό',
            deleteRates: () => ({
                one: 'Διαγραφή τιμής',
                other: 'Διαγραφή τιμών',
            }),
            deletePerDiemRate: 'Διαγραφή ημερήσιου επιδόματος',
            findPerDiemRate: 'Εύρεση ημερήσιου επιδόματος',
            areYouSureDelete: () => ({
                one: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την τιμή;',
                other: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτές τις χρεώσεις;',
            }),
            emptyList: {
                title: 'Ημερήσια αποζημίωση',
                subtitle: 'Ορίστε ημερήσια επίδομα για να ελέγχετε τις καθημερινές δαπάνες των υπαλλήλων. Εισαγάγετε τα ποσά από ένα υπολογιστικό φύλλο για να ξεκινήσετε.',
            },
            importPerDiemRates: 'Εισαγωγή ημερήσιων αποζημιώσεων',
            editPerDiemRate: 'Επεξεργαστείτε το ημερήσιο επίδομα',
            editPerDiemRates: 'Επεξεργασία ημερήσιων αποζημιώσεων',
            editDestinationSubtitle: (destination: string) => `Η ενημέρωση αυτού του προορισμού θα τον αλλάξει για όλες τις υποκατηγορίες ημερήσιου επιδόματος ${destination}.`,
            editCurrencySubtitle: (destination: string) => `Η ενημέρωση αυτού του νομίσματος θα το αλλάξει για όλες τις υποτιμές ημερήσιας αποζημίωσης ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Ορίστε πώς θα εξαχθούν οι εκτός τσέπης δαπάνες στο QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Σημειώστε τις επιταγές ως «εκτύπωση αργότερα»',
            exportDescription: 'Ρυθμίστε τον τρόπο με τον οποίο τα δεδομένα του Expensify εξάγονται στο QuickBooks Desktop.',
            date: 'Ημερομηνία εξαγωγής',
            exportInvoices: 'Εξαγωγή τιμολογίων σε',
            exportExpensifyCard: 'Εξαγωγή συναλλαγών Κάρτας Expensify ως',
            account: 'Λογαριασμός',
            accountDescription: 'Επιλέξτε πού θα καταχωρίζονται οι λογιστικές εγγραφές.',
            accountsPayable: 'Πληρωτέοι λογαριασμοί',
            accountsPayableDescription: 'Επιλέξτε πού θα δημιουργούνται οι λογαριασμοί προμηθευτών.',
            bankAccount: 'Τραπεζικός λογαριασμός',
            notConfigured: 'Μη ρυθμισμένο',
            bankAccountDescription: 'Επιλέξτε από πού θα αποστέλλονται οι επιταγές.',
            creditCardAccount: 'Λογαριασμός πιστωτικής κάρτας',
            exportDate: {
                label: 'Ημερομηνία εξαγωγής',
                description: 'Χρησιμοποιήστε αυτήν την ημερομηνία κατά την εξαγωγή αναφορών στο QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Ημερομηνία τελευταίας δαπάνης',
                        description: 'Ημερομηνία της πιο πρόσφατης δαπάνης στην αναφορά.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Ημερομηνία εξαγωγής',
                        description: 'Ημερομηνία εξαγωγής της αναφοράς στο QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Ημερομηνία υποβολής',
                        description: 'Ημερομηνία υποβολής της αναφοράς για έγκριση.',
                    },
                },
            },
            exportCheckDescription: 'Θα δημιουργήσουμε μια αναλυτική επιταγή για κάθε αναφορά Expensify και θα τη στείλουμε από τον παρακάτω τραπεζικό λογαριασμό.',
            exportJournalEntryDescription: 'Θα δημιουργούμε μια αναλυτική λογιστική εγγραφή για κάθε αναφορά Expensify και θα την καταχωρούμε στον παρακάτω λογαριασμό.',
            exportVendorBillDescription:
                'Θα δημιουργήσουμε ένα αναλυτικό τιμολόγιο προμηθευτή για κάθε αναφορά Expensify και θα το προσθέσουμε στον παρακάτω λογαριασμό. Αν η περίοδος αυτή είναι κλειστή, θα καταχωρίσουμε την κίνηση την 1η της επόμενης ανοικτής περιόδου.',
            outOfPocketTaxEnabledDescription:
                'Το QuickBooks Desktop δεν υποστηρίζει φόρους στις εξαγωγές εγγραφών ημερολογίου. Επειδή έχετε ενεργοποιήσει τους φόρους στον χώρο εργασίας σας, αυτή η επιλογή εξαγωγής δεν είναι διαθέσιμη.',
            outOfPocketTaxEnabledError: 'Οι λογιστικές εγγραφές δεν είναι διαθέσιμες όταν οι φόροι είναι ενεργοποιημένοι. Παρακαλούμε επιλέξτε μια διαφορετική επιλογή εξαγωγής.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Πιστωτική κάρτα',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Τιμολόγιο προμηθευτή',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Λογιστική εγγραφή',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Επιταγή',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Θα δημιουργήσουμε μια αναλυτική επιταγή για κάθε αναφορά Expensify και θα τη στείλουμε από τον παρακάτω τραπεζικό λογαριασμό.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Θα αντιστοιχίσουμε αυτόματα το όνομα εμπόρου στη συναλλαγή της πιστωτικής κάρτας με τυχόν αντίστοιχους προμηθευτές στο QuickBooks. Αν δεν υπάρχουν προμηθευτές, θα δημιουργήσουμε έναν προμηθευτή «Credit Card Misc.» για τη συσχέτιση.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Θα δημιουργούμε μια αναλυτική προμηθευτική χρέωση για κάθε αναφορά Expensify με την ημερομηνία της τελευταίας δαπάνης και θα τη προσθέτουμε στον παρακάτω λογαριασμό. Αν αυτή η περίοδος είναι κλειστή, θα καταχωρούμε την κίνηση στην 1η της επόμενης ανοιχτής περιόδου.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Επιλέξτε πού θα εξαχθούν οι συναλλαγές πιστωτικής κάρτας.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Επιλέξτε έναν προμηθευτή για να εφαρμοστεί σε όλες τις συναλλαγές πιστωτικής κάρτας.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Επιλέξτε από πού θα αποστέλλονται οι επιταγές.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Οι λογαριασμοί προμηθευτών δεν είναι διαθέσιμοι όταν οι τοποθεσίες είναι ενεργοποιημένες. Παρακαλούμε επιλέξτε μια διαφορετική επιλογή εξαγωγής.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Οι επιταγές δεν είναι διαθέσιμες όταν οι τοποθεσίες είναι ενεργοποιημένες. Παρακαλούμε επιλέξτε μια διαφορετική επιλογή εξαγωγής.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Οι λογιστικές εγγραφές δεν είναι διαθέσιμες όταν οι φόροι είναι ενεργοποιημένοι. Παρακαλούμε επιλέξτε μια διαφορετική επιλογή εξαγωγής.',
            },
            noAccountsFound: 'Δεν βρέθηκαν λογαριασμοί',
            noAccountsFoundDescription: 'Προσθέστε τον λογαριασμό στο QuickBooks Desktop και συγχρονίστε ξανά τη σύνδεση',
            qbdSetup: 'Ρύθμιση QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Δεν είναι δυνατή η σύνδεση από αυτήν τη συσκευή',
                body1: 'Θα χρειαστεί να ρυθμίσετε αυτήν τη σύνδεση από τον υπολογιστή που φιλοξενεί το αρχείο εταιρείας QuickBooks Desktop.',
                body2: 'Μόλις συνδεθείτε, θα μπορείτε να συγχρονίζετε και να κάνετε εξαγωγή από οπουδήποτε.',
            },
            setupPage: {
                title: 'Ανοίξτε αυτόν τον σύνδεσμο για να συνδεθείτε',
                body: 'Για να ολοκληρώσετε τη ρύθμιση, ανοίξτε τον παρακάτω σύνδεσμο στον υπολογιστή όπου εκτελείται το QuickBooks Desktop.',
                setupErrorTitle: 'Κάτι πήγε στραβά',
                setupErrorBody: (conciergeLink: string) =>
                    `<muted-text><centered-text>Η σύνδεση με το QuickBooks Desktop δεν λειτουργεί αυτήν τη στιγμή. Δοκιμάστε ξανά αργότερα ή <a href="${conciergeLink}">επικοινωνήστε με το Concierge</a> αν το πρόβλημα συνεχιστεί.</centered-text></muted-text>`,
            },
            importDescription: 'Επιλέξτε ποιες ρυθμίσεις κωδικοποίησης θα εισαχθούν από το QuickBooks Desktop στο Expensify.',
            classes: 'Κλάσεις',
            items: 'Στοιχεία',
            customers: 'Πελάτες/έργα',
            exportCompanyCardsDescription: 'Ορίστε πώς θα εξαχθούν οι αγορές εταιρικών καρτών στο QuickBooks Desktop.',
            defaultVendorDescription: 'Ορίστε έναν προεπιλεγμένο προμηθευτή που θα εφαρμόζεται σε όλες τις συναλλαγές πιστωτικής κάρτας κατά την εξαγωγή.',
            accountsDescription: 'Το καθολικό λογαριασμών σας στο QuickBooks Desktop θα εισαχθεί στο Expensify ως κατηγορίες.',
            accountsSwitchTitle: 'Επιλέξτε να εισάγετε νέους λογαριασμούς ως ενεργοποιημένες ή απενεργοποιημένες κατηγορίες.',
            accountsSwitchDescription: 'Οι ενεργοποιημένες κατηγορίες θα είναι διαθέσιμες για επιλογή από τα μέλη κατά τη δημιουργία των εξόδων τους.',
            classesDescription: 'Επιλέξτε πώς θα χειριστείτε τις κλάσεις QuickBooks Desktop στο Expensify.',
            tagsDisplayedAsDescription: 'Επίπεδο γραμμής αντικειμένου',
            reportFieldsDisplayedAsDescription: 'Επίπεδο αναφοράς',
            customersDescription: 'Επιλέξτε πώς θέλετε να διαχειριστείτε πελάτες/έργα του QuickBooks Desktop στο Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Το Expensify θα συγχρονίζεται αυτόματα με το QuickBooks Desktop κάθε μέρα.',
                createEntities: 'Αυτόματη δημιουργία οντοτήτων',
                createEntitiesDescription: 'Η Expensify θα δημιουργεί αυτόματα προμηθευτές στο QuickBooks Desktop, αν δεν υπάρχουν ήδη.',
            },
            itemsDescription: 'Επιλέξτε πώς θέλετε να χειρίζεστε τα στοιχεία QuickBooks Desktop στο Expensify.',
            accountingMethods: {
                label: 'Πότε να γίνει εξαγωγή',
                description: 'Επιλέξτε πότε θα εξαχθούν οι δαπάνες:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Δεδουλευμένη βάση',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Μετρητά',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Οι δαπάνες από την τσέπη σας θα εξαχθούν όταν λάβουν την τελική έγκριση',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Οι εκτός τσέπης δαπάνες θα εξαχθούν όταν εξοφληθούν',
                },
            },
        },
        qbo: {
            connectedTo: 'Συνδεδεμένο με',
            importDescription: 'Επιλέξτε ποιες ρυθμίσεις κωδικοποίησης θα εισαχθούν από το QuickBooks Online στο Expensify.',
            classes: 'Κλάσεις',
            locations: 'Τοποθεσίες',
            customers: 'Πελάτες/έργα',
            accountsDescription: 'Το διάγραμμα λογαριασμών του QuickBooks Online θα εισαχθεί στο Expensify ως κατηγορίες.',
            accountsSwitchTitle: 'Επιλέξτε να εισάγετε νέους λογαριασμούς ως ενεργοποιημένες ή απενεργοποιημένες κατηγορίες.',
            accountsSwitchDescription: 'Οι ενεργοποιημένες κατηγορίες θα είναι διαθέσιμες για επιλογή από τα μέλη κατά τη δημιουργία των εξόδων τους.',
            classesDescription: 'Επιλέξτε πώς θέλετε να χειριστείτε τις κατηγορίες QuickBooks Online στο Expensify.',
            customersDescription: 'Επιλέξτε πώς θέλετε να διαχειριστείτε τους πελάτες/έργα του QuickBooks Online στο Expensify.',
            locationsDescription: 'Επιλέξτε πώς θα χειριστείτε τις τοποθεσίες QuickBooks Online στο Expensify.',
            taxesDescription: 'Επιλέξτε πώς θέλετε να διαχειρίζεστε τους φόρους του QuickBooks Online στο Expensify.',
            locationsLineItemsRestrictionDescription:
                'Το QuickBooks Online δεν υποστηρίζει τοποθεσίες σε επίπεδο γραμμής για επιταγές ή τιμολόγια προμηθευτών. Αν θέλετε να έχετε τοποθεσίες σε επίπεδο γραμμής, βεβαιωθείτε ότι χρησιμοποιείτε ημερολογιακές εγγραφές και έξοδα με πιστωτικές/χρεωστικές κάρτες.',
            taxesJournalEntrySwitchNote:
                'Το QuickBooks Online δεν υποστηρίζει φόρους σε λογιστικές εγγραφές. Παρακαλούμε αλλάξτε την επιλογή εξαγωγής σας σε τιμολόγιο προμηθευτή ή επιταγή.',
            exportDescription: 'Ρυθμίστε πώς τα δεδομένα του Expensify εξάγονται στο QuickBooks Online.',
            date: 'Ημερομηνία εξαγωγής',
            exportInvoices: 'Εξαγωγή τιμολογίων σε',
            exportExpensifyCard: 'Εξαγωγή συναλλαγών Κάρτας Expensify ως',
            exportDate: {
                label: 'Ημερομηνία εξαγωγής',
                description: 'Χρησιμοποιήστε αυτήν την ημερομηνία κατά την εξαγωγή αναφορών στο QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Ημερομηνία τελευταίας δαπάνης',
                        description: 'Ημερομηνία της πιο πρόσφατης δαπάνης στην αναφορά.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Ημερομηνία εξαγωγής',
                        description: 'Ημερομηνία κατά την οποία η αναφορά εξαχθήκε στο QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Ημερομηνία υποβολής',
                        description: 'Ημερομηνία υποβολής της αναφοράς για έγκριση.',
                    },
                },
            },
            receivable: 'Εισπρακτέοι λογαριασμοί',
            archive: 'Αρχείο απαιτήσεων πελατών',
            exportInvoicesDescription: 'Χρησιμοποιήστε αυτόν τον λογαριασμό κατά την εξαγωγή τιμολογίων στο QuickBooks Online.',
            exportCompanyCardsDescription: 'Ορίστε πώς οι αγορές εταιρικών καρτών θα εξαχθούν στο QuickBooks Online.',
            vendor: 'Προμηθευτής',
            defaultVendorDescription: 'Ορίστε έναν προεπιλεγμένο προμηθευτή που θα εφαρμόζεται σε όλες τις συναλλαγές πιστωτικής κάρτας κατά την εξαγωγή.',
            exportOutOfPocketExpensesDescription: 'Ορίστε πώς θα εξαχθούν οι εκτός τσέπης δαπάνες στο QuickBooks Online.',
            exportCheckDescription: 'Θα δημιουργήσουμε μια αναλυτική επιταγή για κάθε αναφορά Expensify και θα τη στείλουμε από τον παρακάτω τραπεζικό λογαριασμό.',
            exportJournalEntryDescription: 'Θα δημιουργούμε μια αναλυτική λογιστική εγγραφή για κάθε αναφορά Expensify και θα την καταχωρούμε στον παρακάτω λογαριασμό.',
            exportVendorBillDescription:
                'Θα δημιουργήσουμε ένα αναλυτικό τιμολόγιο προμηθευτή για κάθε αναφορά Expensify και θα το προσθέσουμε στον παρακάτω λογαριασμό. Αν η περίοδος αυτή είναι κλειστή, θα καταχωρίσουμε την κίνηση την 1η της επόμενης ανοικτής περιόδου.',
            account: 'Λογαριασμός',
            accountDescription: 'Επιλέξτε πού θα καταχωρίζονται οι λογιστικές εγγραφές.',
            accountsPayable: 'Πληρωτέοι λογαριασμοί',
            accountsPayableDescription: 'Επιλέξτε πού θα δημιουργούνται οι λογαριασμοί προμηθευτών.',
            bankAccount: 'Τραπεζικός λογαριασμός',
            notConfigured: 'Μη ρυθμισμένο',
            bankAccountDescription: 'Επιλέξτε από πού θα αποστέλλονται οι επιταγές.',
            creditCardAccount: 'Λογαριασμός πιστωτικής κάρτας',
            travelInvoicingDescription: 'Τα έξοδα ταξιδιού θα εξαχθούν ως χρεώσεις πιστωτικής κάρτας στον λογαριασμό QuickBooks Online που καθορίζεται παρακάτω.',
            companyCardsLocationEnabledDescription:
                'Το QuickBooks Online δεν υποστηρίζει τοποθεσίες στις εξαγωγές λογαριασμών προμηθευτών όταν οι τοποθεσίες έχουν εισαχθεί ως ετικέτες. Επειδή στον χώρο εργασίας σας οι τοποθεσίες έχουν εισαχθεί ως ετικέτες, αυτή η επιλογή εξαγωγής δεν είναι διαθέσιμη.',
            outOfPocketTaxEnabledDescription:
                'Το QuickBooks Online δεν υποστηρίζει φόρους στις εξαγωγές εγγραφών ημερολογίου. Επειδή έχετε ενεργοποιήσει τους φόρους στον χώρο εργασίας σας, αυτή η επιλογή εξαγωγής δεν είναι διαθέσιμη.',
            outOfPocketTaxEnabledError: 'Οι λογιστικές εγγραφές δεν είναι διαθέσιμες όταν οι φόροι είναι ενεργοποιημένοι. Παρακαλούμε επιλέξτε μια διαφορετική επιλογή εξαγωγής.',
            advancedConfig: {
                autoSyncDescription: 'Το Expensify θα συγχρονίζεται αυτόματα με το QuickBooks Online κάθε μέρα.',
                inviteEmployees: 'Προσκαλέστε υπαλλήλους',
                inviteEmployeesDescription: 'Εισαγάγετε τα αρχεία εργαζομένων από το QuickBooks Online και προσκαλέστε εργαζομένους σε αυτόν τον χώρο εργασίας.',
                createEntities: 'Αυτόματη δημιουργία οντοτήτων',
                createEntitiesDescription:
                    'Η Expensify θα δημιουργεί αυτόματα προμηθευτές στο QuickBooks Online, αν δεν υπάρχουν ήδη, και θα δημιουργεί αυτόματα πελάτες κατά την εξαγωγή τιμολογίων.',
                reimbursedReportsDescription:
                    'Κάθε φορά που μια αναφορά πληρώνεται μέσω Expensify ACH, η αντίστοιχη πληρωμή λογαριασμού θα δημιουργείται στον παρακάτω λογαριασμό QuickBooks Online.',
                qboBillPaymentAccount: 'λογαριασμός πληρωμής λογαριασμών QuickBooks',
                qboInvoiceCollectionAccount: 'λογαριασμός είσπραξης τιμολογίων QuickBooks',
                accountSelectDescription: 'Επιλέξτε από πού θα πληρώνετε τους λογαριασμούς και θα δημιουργήσουμε την πληρωμή στο QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Επιλέξτε πού θα λαμβάνετε τις πληρωμές τιμολογίων και θα δημιουργήσουμε την πληρωμή στο QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Χρεωστική κάρτα',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Πιστωτική κάρτα',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Τιμολόγιο προμηθευτή',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Λογιστική εγγραφή',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Επιταγή',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Θα αντιστοιχίσουμε αυτόματα το όνομα εμπόρου στη συναλλαγή χρεωστικής κάρτας με τυχόν αντίστοιχους προμηθευτές στο QuickBooks. Αν δεν υπάρχουν προμηθευτές, θα δημιουργήσουμε έναν προμηθευτή «Debit Card Misc.» για τη συσχέτιση.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Θα αντιστοιχίσουμε αυτόματα το όνομα εμπόρου στη συναλλαγή της πιστωτικής κάρτας με τυχόν αντίστοιχους προμηθευτές στο QuickBooks. Αν δεν υπάρχουν προμηθευτές, θα δημιουργήσουμε έναν προμηθευτή «Credit Card Misc.» για τη συσχέτιση.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Θα δημιουργούμε μια αναλυτική προμηθευτική χρέωση για κάθε αναφορά Expensify με την ημερομηνία της τελευταίας δαπάνης και θα τη προσθέτουμε στον παρακάτω λογαριασμό. Αν αυτή η περίοδος είναι κλειστή, θα καταχωρούμε την κίνηση στην 1η της επόμενης ανοιχτής περιόδου.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Επιλέξτε πού θα εξαχθούν οι συναλλαγές χρεωστικής κάρτας.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Επιλέξτε πού θα εξαχθούν οι συναλλαγές πιστωτικής κάρτας.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Επιλέξτε έναν προμηθευτή για να εφαρμοστεί σε όλες τις συναλλαγές πιστωτικής κάρτας.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Οι λογαριασμοί προμηθευτών δεν είναι διαθέσιμοι όταν οι τοποθεσίες είναι ενεργοποιημένες. Παρακαλούμε επιλέξτε μια διαφορετική επιλογή εξαγωγής.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Οι επιταγές δεν είναι διαθέσιμες όταν οι τοποθεσίες είναι ενεργοποιημένες. Παρακαλούμε επιλέξτε μια διαφορετική επιλογή εξαγωγής.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Οι λογιστικές εγγραφές δεν είναι διαθέσιμες όταν οι φόροι είναι ενεργοποιημένοι. Παρακαλούμε επιλέξτε μια διαφορετική επιλογή εξαγωγής.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Επιλέξτε έναν έγκυρο λογαριασμό για την εξαγωγή λογαριασμού προμηθευτή',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Επιλέξτε έναν έγκυρο λογαριασμό για εξαγωγή λογιστικής εγγραφής',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Επιλέξτε έναν έγκυρο λογαριασμό για την εξαγωγή επιταγής',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    'Για να χρησιμοποιήσετε την εξαγωγή λογαριασμών προμηθευτών, ρυθμίστε έναν λογαριασμό πληρωτέων λογαριασμών στο QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]:
                    'Για να χρησιμοποιήσετε την εξαγωγή λογιστικής εγγραφής, ρυθμίστε έναν λογαριασμό ημερολογίου στο QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Για να χρησιμοποιήσετε την εξαγωγή επιταγών, ρυθμίστε έναν τραπεζικό λογαριασμό στο QuickBooks Online',
            },
            noAccountsFound: 'Δεν βρέθηκαν λογαριασμοί',
            noAccountsFoundDescription: 'Προσθέστε τον λογαριασμό στο QuickBooks Online και συγχρονίστε ξανά τη σύνδεση.',
            accountingMethods: {
                label: 'Πότε να γίνει εξαγωγή',
                description: 'Επιλέξτε πότε θα εξαχθούν οι δαπάνες:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Δεδουλευμένη βάση',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Μετρητά',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Οι δαπάνες από την τσέπη σας θα εξαχθούν όταν λάβουν την τελική έγκριση',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Οι εκτός τσέπης δαπάνες θα εξαχθούν όταν εξοφληθούν',
                },
            },
        },
        workspaceList: {
            joinNow: 'Γίνετε μέλος τώρα',
            askToJoin: 'Αίτημα για συμμετοχή',
        },
        xero: {
            organization: 'Οργανισμός Xero',
            organizationDescription: 'Επιλέξτε τον οργανισμό Xero από τον οποίο θέλετε να εισαγάγετε δεδομένα.',
            importDescription: 'Επιλέξτε ποιες ρυθμίσεις κωδικοποίησης θα εισαχθούν από το Xero στο Expensify.',
            accountsDescription: 'Το καθολικό λογαριασμών σας στο Xero θα εισαχθεί στο Expensify ως κατηγορίες.',
            accountsSwitchTitle: 'Επιλέξτε να εισάγετε νέους λογαριασμούς ως ενεργοποιημένες ή απενεργοποιημένες κατηγορίες.',
            accountsSwitchDescription: 'Οι ενεργοποιημένες κατηγορίες θα είναι διαθέσιμες για επιλογή από τα μέλη κατά τη δημιουργία των εξόδων τους.',
            trackingCategories: 'Κατηγορίες παρακολούθησης',
            trackingCategoriesDescription: 'Επιλέξτε πώς θέλετε να χειριστείτε τις κατηγορίες παρακολούθησης Xero στο Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Αντιστοίχιση του Xero ${categoryName} σε`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Επιλέξτε πού θα αντιστοιχιστεί το ${categoryName} κατά την εξαγωγή στο Xero.`,
            customers: 'Επανέκδοση χρεώσεων σε πελάτες',
            customersDescription:
                'Επιλέξτε αν θα ξαναχρεώσετε τους πελάτες στο Expensify. Οι επαφές πελατών σας στο Xero μπορούν να επισημανθούν στις δαπάνες και θα εξαχθούν στο Xero ως τιμολόγιο πώλησης.',
            taxesDescription: 'Επιλέξτε πώς θέλετε να διαχειριστείτε τους φόρους Xero στο Expensify.',
            notImported: 'Δεν έγινε εισαγωγή',
            notConfigured: 'Μη ρυθμισμένο',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Προεπιλογή επαφής Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Ετικέτες',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Πεδία αναφοράς',
            },
            exportDescription: 'Ρυθμίστε τον τρόπο με τον οποίο τα δεδομένα του Expensify εξάγονται στο Xero.',
            purchaseBill: 'Τιμολόγιο αγοράς',
            exportDeepDiveCompanyCard:
                'Οι εξαγόμενες δαπάνες θα καταχωριστούν ως τραπεζικές συναλλαγές στον παρακάτω τραπεζικό λογαριασμό Xero και οι ημερομηνίες συναλλαγών θα ταιριάζουν με τις ημερομηνίες στο τραπεζικό σας αντίγραφο.',
            bankTransactions: 'Τραπεζικές συναλλαγές',
            travelInvoicingDescription: 'Τα έξοδα ταξιδιού θα εξαχθούν ως τραπεζικές συναλλαγές στον λογαριασμό Xero που καθορίζεται παρακάτω.',
            xeroBankAccount: 'τραπεζικός λογαριασμός Xero',
            bankAccount: 'Τραπεζικός λογαριασμός',
            xeroBankAccountDescription: 'Επιλέξτε πού θα καταχωρούνται οι δαπάνες ως τραπεζικές συναλλαγές.',
            exportExpensesDescription: 'Οι αναφορές θα εξαχθούν ως τιμολόγιο αγοράς με την ημερομηνία και την κατάσταση που επιλέγονται παρακάτω.',
            purchaseBillDate: 'Ημερομηνία τιμολογίου αγοράς',
            exportInvoices: 'Εξαγωγή τιμολογίων ως',
            salesInvoice: 'Τιμολόγιο πώλησης',
            exportInvoicesDescription: 'Τα τιμολόγια πώλησης εμφανίζουν πάντα την ημερομηνία κατά την οποία στάλθηκε το τιμολόγιο.',
            advancedConfig: {
                autoSyncDescription: 'Το Expensify θα συγχρονίζεται αυτόματα με το Xero κάθε μέρα.',
                purchaseBillStatusTitle: 'Κατάσταση λογαριασμού αγοράς',
                reimbursedReportsDescription: 'Κάθε φορά που μια αναφορά πληρώνεται μέσω Expensify ACH, η αντίστοιχη πληρωμή λογαριασμού θα δημιουργείται στον παρακάτω λογαριασμό Xero.',
                xeroBillPaymentAccount: 'λογαριασμός πληρωμής λογαριασμών Xero',
                xeroInvoiceCollectionAccount: 'Λογαριασμός εισπράξεων τιμολογίων Xero',
                xeroBillPaymentAccountDescription: 'Επιλέξτε από πού θα πληρώνονται οι λογαριασμοί και θα δημιουργήσουμε την πληρωμή στο Xero.',
                invoiceAccountSelectorDescription: 'Επιλέξτε πού θέλετε να λαμβάνετε τις πληρωμές τιμολογίων και θα δημιουργήσουμε την πληρωμή στο Xero.',
            },
            exportDate: {
                label: 'Ημερομηνία τιμολογίου αγοράς',
                description: 'Χρησιμοποιήστε αυτήν την ημερομηνία κατά την εξαγωγή αναφορών στο Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Ημερομηνία τελευταίας δαπάνης',
                        description: 'Ημερομηνία της πιο πρόσφατης δαπάνης στην αναφορά.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Ημερομηνία εξαγωγής',
                        description: 'Ημερομηνία εξαγωγής της αναφοράς στο Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Ημερομηνία υποβολής',
                        description: 'Ημερομηνία υποβολής της αναφοράς για έγκριση.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Κατάσταση λογαριασμού αγοράς',
                description: 'Χρησιμοποιήστε αυτή την κατάσταση κατά την εξαγωγή τιμολογίων αγοράς στο Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Πρόχειρο',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Εκκρεμεί έγκριση',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Σε αναμονή πληρωμής',
                },
            },
            noAccountsFound: 'Δεν βρέθηκαν λογαριασμοί',
            noAccountsFoundDescription: 'Παρακαλούμε προσθέστε τον λογαριασμό στο Xero και συγχρονίστε ξανά τη σύνδεση',
            accountingMethods: {
                label: 'Πότε να γίνει εξαγωγή',
                description: 'Επιλέξτε πότε θα εξαχθούν οι δαπάνες:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Δεδουλευμένη βάση',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Μετρητά',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Οι δαπάνες από την τσέπη σας θα εξαχθούν όταν λάβουν την τελική έγκριση',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Οι εκτός τσέπης δαπάνες θα εξαχθούν όταν εξοφληθούν',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Προτιμώμενος εξαγωγέας',
            taxSolution: 'Λύση φορολογίας',
            notConfigured: 'Μη ρυθμισμένο',
            exportDate: {
                label: 'Ημερομηνία εξαγωγής',
                description: 'Χρησιμοποιήστε αυτήν την ημερομηνία κατά την εξαγωγή αναφορών στο Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Ημερομηνία τελευταίας δαπάνης',
                        description: 'Ημερομηνία της πιο πρόσφατης δαπάνης στην αναφορά.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Ημερομηνία εξαγωγής',
                        description: 'Ημερομηνία εξαγωγής της αναφοράς στο Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Ημερομηνία υποβολής',
                        description: 'Ημερομηνία υποβολής της αναφοράς για έγκριση.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Ορίστε τον τρόπο με τον οποίο οι εκτός τσέπης δαπάνες θα εξαχθούν στο Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Αναφορές εξόδων',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Τιμολόγια προμηθευτών',
                },
            },
            nonReimbursableExpenses: {
                description: 'Ορίστε πώς θα εξαχθούν οι αγορές εταιρικής κάρτας στο Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Πιστωτικές κάρτες',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Τιμολόγια προμηθευτών',
                },
            },
            travelInvoicingDescription: 'Τα έξοδα ταξιδιού θα εξαχθούν ως χρεώσεις πιστωτικής κάρτας στον λογαριασμό Sage Intacct που καθορίζεται παρακάτω.',
            creditCardAccount: 'Λογαριασμός πιστωτικής κάρτας',
            defaultVendor: 'Προεπιλεγμένος προμηθευτής',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Ορίστε έναν προεπιλεγμένο προμηθευτή που θα εφαρμόζεται στις ${isReimbursable ? '' : 'μη-'}αποζημιούμενες δαπάνες που δεν έχουν αντίστοιχο προμηθευτή στο Sage Intacct.`,
            exportDescription: 'Διαμορφώστε τον τρόπο με τον οποίο τα δεδομένα του Expensify εξάγονται στο Sage Intacct.',
            exportPreferredExporterNote:
                'Ο προτιμώμενος εξαγωγέας μπορεί να είναι οποιοσδήποτε διαχειριστής χώρου εργασίας, αλλά πρέπει επίσης να είναι διαχειριστής τομέα αν ορίσετε διαφορετικούς λογαριασμούς εξαγωγής για μεμονωμένες εταιρικές κάρτες στις ρυθμίσεις τομέα.',
            exportPreferredExporterSubNote: 'Αφού οριστεί, ο προτιμώμενος εξαγωγέας θα βλέπει τις αναφορές προς εξαγωγή στον λογαριασμό του.',
            noAccountsFound: 'Δεν βρέθηκαν λογαριασμοί',
            noAccountsFoundDescription: `Παρακαλούμε προσθέστε τον λογαριασμό στο Sage Intacct και συγχρονίστε ξανά τη σύνδεση`,
            autoSync: 'Αυτόματος συγχρονισμός',
            autoSyncDescription: 'Το Expensify θα συγχρονίζεται αυτόματα με το Sage Intacct κάθε μέρα.',
            inviteEmployees: 'Προσκαλέστε υπαλλήλους',
            inviteEmployeesDescription:
                'Εισαγάγετε εγγραφές εργαζομένων από το Sage Intacct και προσκαλέστε εργαζομένους σε αυτόν τον χώρο εργασίας. Η ροή έγκρισης θα οριστεί από προεπιλογή σε έγκριση από τον προϊστάμενο και μπορεί να διαμορφωθεί περαιτέρω στη σελίδα «Μέλη».',
            syncReimbursedReports: 'Συγχρονισμός αποζημιωμένων αναφορών',
            syncReimbursedReportsDescription:
                'Κάθε φορά που μια αναφορά πληρώνεται μέσω Expensify ACH, η αντίστοιχη πληρωμή λογαριασμού θα δημιουργείται στον παρακάτω λογαριασμό Sage Intacct.',
            paymentAccount: 'λογαριασμός πληρωμών Sage Intacct',
            accountingMethods: {
                label: 'Πότε να γίνει εξαγωγή',
                description: 'Επιλέξτε πότε θα εξαχθούν οι δαπάνες:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Δεδουλευμένη βάση',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Μετρητά',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Οι δαπάνες από την τσέπη σας θα εξαχθούν όταν λάβουν την τελική έγκριση',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Οι εκτός τσέπης δαπάνες θα εξαχθούν όταν εξοφληθούν',
                },
            },
        },
        certinia: {
            title: 'Certinia',
            titleFFA: 'Certinia (FFA)',
            titlePSA: 'Certinia (PSA)',
            company: 'Εταιρεία',
            autoSyncDescription: 'Το Expensify θα συγχρονίζεται αυτόματα με το Certinia κάθε μέρα.',
            syncReimbursedReportsDescription:
                'Όταν αυτή η επιλογή είναι ενεργοποιημένη, κάθε φορά που εξοφλείται ένα Payable Invoice στο FFA, η σχετική αναφορά Expensify θα σημειώνεται αυτόματα ως αποζημιωμένη.',
            taxNonBillable: 'Εξαγωγή φόρου ως μη χρεώσιμου',
            taxNonBillableDescription:
                'Κατά την εξαγωγή χρεώσιμων εξόδων κωδικοποιημένων με φορολογικούς συντελεστές από το Expensify, το φορολογικό μέρος θα επισημαίνεται ως μη χρεώσιμο κατά την εξαγωγή στο Certinia PSA.',
            foreignCurrencyAmount: 'Εξαγωγή ποσού σε ξένο νόμισμα',
            foreignCurrencyAmountDescription:
                'Αν εξάγετε τις αποζημιώσιμες δαπάνες ως αναφορές δαπανών, τότε θα εξαγάγουμε το αρχικό ξένο ποσό κάθε συναλλαγής στο Certinia – εφόσον υπάρχει.',
            exportDescription: 'Ρυθμίστε τον τρόπο με τον οποίο τα δεδομένα της Expensify εξαχθούν στο Certinia.',
            payableInvoices: 'Πληρωτέα τιμολόγια',
            exportStatus: {
                label: 'Κατάσταση πληρωτέου τιμολογίου',
                values: {
                    [CONST.CERTINIA_EXPORT_STATUS.COMPLETE]: 'Ολοκληρώθηκε',
                    [CONST.CERTINIA_EXPORT_STATUS.IN_PROGRESS]: 'Σε εξέλιξη',
                    [CONST.CERTINIA_EXPORT_STATUS.APPROVED]: 'Εγκρίθηκε',
                    [CONST.CERTINIA_EXPORT_STATUS.SUBMITTED]: 'Υποβλήθηκε',
                },
            },
            reportExportStatus: {
                label: 'Κατάσταση αναφοράς εξόδων',
                values: {
                    [CONST.CERTINIA_REPORT_EXPORT_STATUS.APPROVED]: 'Εγκρίθηκε',
                    [CONST.CERTINIA_REPORT_EXPORT_STATUS.SUBMITTED]: 'Υποβλήθηκε',
                },
            },
            exportDate: {
                label: 'Ημερομηνία πληρωτέου τιμολογίου',
                values: {
                    [CONST.CERTINIA_EXPORT_DATE.LAST_EXPENSE]: 'Ημερομηνία τελευταίας δαπάνης',
                    [CONST.CERTINIA_EXPORT_DATE.REPORT_SUBMITTED]: 'Ημερομηνία υποβολής αναφοράς',
                    [CONST.CERTINIA_EXPORT_DATE.REPORT_EXPORTED]: 'Ημερομηνία εξαγωγής',
                },
            },
            exportReimbursable: {
                label: 'Εξαγωγή αποζημιώσιμων εξόδων ως',
                helperText: 'Οι δαπάνες που έχουν σημειωθεί ως αποζημιώσιμες θα εξαχθούν ως τιμολόγια πληρωτέα στο όνομα του εργαζομένου.',
            },
            exportNonReimbursable: {
                label: 'Εξαγωγή μη αποζημιώσιμων εξόδων ως',
            },
            expenseReports: 'Αναφορές εξόδων',
            exportReimbursableExpenseReports: {
                helperText: 'Οι δαπάνες που έχουν σημειωθεί ως αποζημιώσιμες θα εξαχθούν ως αναφορές εξόδων εκδοθείσες στο όνομα του/της υπαλλήλου.',
            },
            exportNonReimbursableExpenseReports: {
                helperText: 'Οι δαπάνες που έχουν επισημανθεί ως μη αποζημιώσιμες θα εξαχθούν ως αναφορές εξόδων στο όνομα του/της υπαλλήλου.',
            },
            noVendorsFound: 'Δεν βρέθηκαν προμηθευτές',
            noVendorsFoundDescription: 'Παρακαλούμε συγχρονίστε ξανά τη σύνδεση αφού προστεθούν οι προμηθευτές στο Certinia.',
            noCompaniesFound: 'Δεν βρέθηκαν εταιρείες',
            noCompaniesFoundDescription: 'Παρακαλούμε συγχρονίστε ξανά τη σύνδεση αφού προστεθούν οι εταιρείες στο Certinia.',
            prerequisites: {
                title: 'Πριν συνδεθείτε',
                installBundle: 'Εγκαταστήστε το πακέτο Expensify',
                installBundlePSAHeader: 'Για συνδέσεις PSA/SRP:',
                installBundleDescription: 'Εγκαταστήστε το πακέτο Expensify στο Salesforce κάνοντας κλικ σε αυτόν τον σύνδεσμο:',
                installBundlePSALink: ({version}: {version: string}) => `Εγκατάσταση πακέτου Expensify PSA/SRP (έκδοση ${version})`,
                installBundleFFAHeader: 'Για συνδέσεις FFA:',
                installBundleFFALink: ({version}: {version: string}) => `Εγκατάσταση δέσμης FFA Expensify (έκδοση ${version})`,
                installBundleConfirm: 'Έχω εγκαταστήσει το πακέτο',
                setupContacts: 'Ρύθμιση χρήστη και επαφών',
                setupContactsBullet1:
                    'Δημιουργήστε τόσο έναν χρήστη όσο και μια επαφή για εσάς στο Certinia, αν δεν υπάρχουν ήδη, φροντίζοντας το email να ταιριάζει με το κύριο email σας στο Expensify.',
                setupContactsBullet2:
                    'Δημιουργήστε επαφές για κάθε εργαζόμενο που θα υποβάλλει αναφορές εξόδων και για κάθε εγκρίνων αναφορών. Βεβαιωθείτε ότι η διεύθυνση email κάθε επαφής αντιστοιχεί στη διεύθυνση email του λογαριασμού Expensify του εργαζομένου.',
                setupContactsBullet3: 'Ορίστε ρυθμίσεις δικαιωμάτων για τον χρήστη σας για κάθε επαφή/πόρο.',
                setupContactsConfirm: 'Έχω ρυθμίσει τον χρήστη και τις επαφές',
                oauth: 'Συνδεθείτε μέσω Salesforce',
                oauthDescription: 'Για να ολοκληρώσετε τη ρύθμιση, θα πρέπει να συνδεθείτε μέσω Salesforce και Certinia.\n\nΧρησιμοποιήστε το παρακάτω κουμπί για να συνεχίσετε.',
                connectButton: 'Σύνδεση με το Certinia',
                connectSandboxButton: 'Σύνδεση με το Certinia Sandbox',
            },
            import: {
                chartOfAccounts: 'Λογιστικό σχέδιο',
                chartOfAccountsDescription: 'Το λογιστικό σχέδιο εισάγεται στο Expensify ως κατηγορίες.',
                dimensionMapping: ({n}: {n: number}) => `Διάσταση ${n}`,
                dimensions: {
                    dimension1: 'Διάσταση 1',
                    dimension2: 'Διάσταση 2',
                    dimension3: 'Διάσταση 3',
                    dimension4: 'Διάσταση 4',
                },
                doNotMap: 'Μην αντιστοιχίσετε',
                doNotMapSubtitle: 'Χρησιμοποιήστε προεπιλεγμένο πόρο υπαλλήλου',
                mappingTypes: {
                    [CONST.CERTINIA_MAPPING_VALUE.DEFAULT]: 'Μην αντιστοιχίσετε',
                    [CONST.CERTINIA_MAPPING_VALUE.TAG]: 'Εισήχθησαν ως ετικέτες',
                    [CONST.CERTINIA_MAPPING_VALUE.REPORT_FIELD]: 'Έγινε εισαγωγή ως πεδία αναφοράς',
                },
                expenseTypeGlaMappings: 'Αντιστοιχίσεις GLA τύπων δαπανών',
                expenseTypeGlaMappingsDescription: 'Οι αντιστοιχίσεις GLA τύπου εξόδων FinancialForce εισάγονται στο Expensify ως κατηγορίες.',
                tagsMappedTo: 'Οι ετικέτες πρέπει να αντιστοιχίζονται σε',
                milestones: 'Ορόσημα',
                milestonesDescription: 'Όταν είναι ενεργοποιημένο, τα ορόσημα που συνδέονται με έργα PSA συγχρονίζονται στο Expensify.',
                parentTagMappingTypes: {
                    [CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_PROJECTS_AND_ASSIGNMENTS]: 'Έργα και αναθέσεις',
                    [CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_PROJECTS]: 'Έργα',
                    [CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_ASSIGNMENTS]: 'Αναθέσεις',
                },
            },
        },
        netsuite: {
            subsidiary: 'Θυγατρική',
            subsidiarySelectDescription: 'Επιλέξτε τη θυγατρική στο NetSuite από την οποία θέλετε να εισαγάγετε δεδομένα.',
            exportDescription: 'Ρυθμίστε τον τρόπο με τον οποίο τα δεδομένα του Expensify εξάγονται στο NetSuite.',
            exportInvoices: 'Εξαγωγή τιμολογίων σε',
            journalEntriesTaxPostingAccount: 'Λογαριασμός καταχώρισης φόρου εγγραφών ημερολογίου',
            journalEntriesProvTaxPostingAccount: 'Λογαριασμός καταχώρισης επαρχιακού φόρου για λογιστικές εγγραφές',
            foreignCurrencyAmount: 'Εξαγωγή ποσού σε ξένο νόμισμα',
            exportToNextOpenPeriod: 'Εξαγωγή στην επόμενη ανοικτή περίοδο',
            nonReimbursableJournalPostingAccount: 'Λογαριασμός καταχώρισης μη αποζημιώσιμων εγγραφών',
            reimbursableJournalPostingAccount: 'Λογαριασμός καταχώρισης ημερολογίου επιστρέψιμων εξόδων',
            journalPostingPreference: {
                label: 'Προτίμηση καταχώρισης λογιστικών εγγραφών',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Μία καταχώριση για κάθε δαπάνη',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Μία, αναλυτική καταχώριση για κάθε αναφορά',
                },
            },
            invoiceItem: {
                label: 'Στοιχείο τιμολογίου',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Δημιουργήστε ένα για μένα',
                        description: 'Θα δημιουργήσουμε ένα «στοιχείο γραμμής τιμολογίου Expensify» για εσάς κατά την εξαγωγή (αν δεν υπάρχει ήδη).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Επιλέξτε υπάρχον',
                        description: 'Θα συνδέσουμε τα τιμολόγια από το Expensify με το στοιχείο που επιλέχθηκε παρακάτω.',
                    },
                },
            },
            exportDate: {
                label: 'Ημερομηνία εξαγωγής',
                description: 'Χρησιμοποιήστε αυτήν την ημερομηνία κατά την εξαγωγή αναφορών στο NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Ημερομηνία τελευταίας δαπάνης',
                        description: 'Ημερομηνία της πιο πρόσφατης δαπάνης στην αναφορά.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Ημερομηνία εξαγωγής',
                        description: 'Ημερομηνία που η αναφορά εξαχθηκε στο NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Ημερομηνία υποβολής',
                        description: 'Ημερομηνία υποβολής της αναφοράς για έγκριση.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Αναφορές εξόδων',
                        reimbursableDescription: 'Τα έξοδα από ίδιους πόρους θα εξαχθούν ως αναφορές εξόδων στο NetSuite.',
                        nonReimbursableDescription: 'Οι δαπάνες εταιρικής κάρτας θα εξαχθούν ως αναφορές εξόδων στο NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Τιμολόγια προμηθευτών',
                        reimbursableDescription: Str.dedent(`
                            Οι δαπάνες από την τσέπη θα εξαχθούν ως τιμολόγια πληρωτέα προς τον προμηθευτή NetSuite που καθορίζεται παρακάτω.

                            Εάν θέλετε να ορίσετε συγκεκριμένο προμηθευτή για κάθε κάρτα, μεταβείτε στις *Ρυθμίσεις > Τομείς > Εταιρικές κάρτες*.
                        `),
                        nonReimbursableDescription: Str.dedent(`
                            Οι δαπάνες εταιρικών καρτών θα εξαχθούν ως λογαριασμοί πληρωτέοι στον προμηθευτή NetSuite που καθορίζεται παρακάτω.

                            Αν θέλετε να ορίσετε συγκεκριμένο προμηθευτή για κάθε κάρτα, μεταβείτε στις *Ρυθμίσεις > Τομείς > Εταιρικές Κάρτες*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Λογιστικές εγγραφές',
                        reimbursableDescription: Str.dedent(`
                            Τα έξοδα από την τσέπη θα εξαχθούν ως λογιστικές εγγραφές στον λογαριασμό NetSuite που ορίζεται παρακάτω.

                            Αν θέλετε να ορίσετε συγκεκριμένο προμηθευτή για κάθε κάρτα, μεταβείτε στις *Ρυθμίσεις > Τομείς > Εταιρικές κάρτες*.
                        `),
                        nonReimbursableDescription: Str.dedent(`
                            Οι δαπάνες εταιρικής κάρτας θα εξαχθούν ως λογιστικές εγγραφές στον λογαριασμό NetSuite που καθορίζεται παρακάτω.

                            Αν θέλετε να ορίσετε συγκεκριμένο προμηθευτή για κάθε κάρτα, μεταβείτε στις *Ρυθμίσεις > Τομείς > Εταιρικές κάρτες*.
                        `),
                        travelDescription: 'Τα έξοδα ταξιδιού θα εξαχθούν ως λογιστικές εγγραφές στον λογαριασμό NetSuite που καθορίζεται παρακάτω.',
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Αν αλλάξετε τη ρύθμιση εξαγωγής εταιρικής κάρτας σε αναφορές δαπανών, οι προμηθευτές NetSuite και οι λογαριασμοί καταχώρισης για μεμονωμένες κάρτες θα απενεργοποιηθούν.\n\nΜην ανησυχείτε, θα αποθηκεύσουμε τις προηγούμενες επιλογές σας σε περίπτωση που θελήσετε να επαναφέρετε τη ρύθμιση αργότερα.',
            },
            advancedConfig: {
                autoSyncDescription: 'Το Expensify θα συγχρονίζει αυτόματα με το NetSuite κάθε μέρα.',
                reimbursedReportsDescription: 'Κάθε φορά που μια αναφορά πληρώνεται μέσω Expensify ACH, η αντίστοιχη πληρωμή λογαριασμού θα δημιουργείται στον παρακάτω λογαριασμό NetSuite.',
                reimbursementsAccount: 'Λογαριασμός αποζημιώσεων',
                reimbursementsAccountDescription: 'Επιλέξτε τον τραπεζικό λογαριασμό που θα χρησιμοποιείτε για αποζημιώσεις και θα δημιουργήσουμε την αντίστοιχη πληρωμή στο NetSuite.',
                collectionsAccount: 'Λογαριασμός εισπράξεων',
                collectionsAccountDescription: 'Μόλις ένα τιμολόγιο επισημανθεί ως πληρωμένο στο Expensify και εξαχθεί στο NetSuite, θα εμφανιστεί στον παρακάτω λογαριασμό.',
                approvalAccount: 'Λογαριασμός έγκρισης πληρωτέων λογαριασμών',
                approvalAccountDescription:
                    'Επιλέξτε τον λογαριασμό στον οποίο θα εγκρίνονται οι συναλλαγές στο NetSuite. Αν συγχρονίζετε αποζημιωμένες αναφορές, αυτός είναι επίσης ο λογαριασμός στον οποίο θα δημιουργούνται οι πληρωμές λογαριασμών.',
                defaultApprovalAccount: 'Προεπιλογή NetSuite',
                inviteEmployees: 'Προσκαλέστε υπαλλήλους και ορίστε εγκρίσεις',
                inviteEmployeesDescription:
                    'Εισαγάγετε εγγραφές εργαζομένων από το NetSuite και προσκαλέστε εργαζόμενους σε αυτόν τον χώρο εργασίας. Η ροή έγκρισης θα οριστεί από προεπιλογή σε έγκριση από τον διευθυντή και μπορεί να ρυθμιστεί περαιτέρω στη σελίδα *Μέλη*.',
                autoCreateEntities: 'Αυτόματη δημιουργία υπαλλήλων/προμηθευτών',
                enableCategories: 'Ενεργοποίηση νέων εισαγόμενων κατηγοριών',
                customFormID: 'Προσαρμοσμένο αναγνωριστικό φόρμας',
                customFormIDDescription:
                    'Από προεπιλογή, το Expensify θα δημιουργεί εγγραφές χρησιμοποιώντας την προτιμώμενη φόρμα συναλλαγής που έχει οριστεί στο NetSuite. Εναλλακτικά, μπορείτε να ορίσετε μια συγκεκριμένη φόρμα συναλλαγής για χρήση.',
                customFormIDReimbursable: 'Έξοδο από την τσέπη σας',
                customFormIDNonReimbursable: 'Έξοδο εταιρικής κάρτας',
                exportReportsTo: {
                    label: 'Επίπεδο έγκρισης αναφοράς εξόδων',
                    description:
                        'Αφού μια αναφορά εξόδων εγκριθεί στο Expensify και εξαχθεί στο NetSuite, μπορείτε να ορίσετε ένα επιπλέον επίπεδο έγκρισης στο NetSuite πριν από την καταχώριση.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Προεπιλεγμένη προτίμηση NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Μόνο με έγκριση προϊσταμένου',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Μόνο εγκεκριμένη από το λογιστήριο',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Εγκρίθηκε από επόπτη και λογιστήριο',
                    },
                },
                accountingMethods: {
                    label: 'Πότε να γίνει εξαγωγή',
                    description: 'Επιλέξτε πότε θα εξαχθούν οι δαπάνες:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Δεδουλευμένη βάση',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Μετρητά',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Οι δαπάνες από την τσέπη σας θα εξαχθούν όταν λάβουν την τελική έγκριση',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Οι εκτός τσέπης δαπάνες θα εξαχθούν όταν εξοφληθούν',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Επίπεδο έγκρισης λογαριασμού προμηθευτή',
                    description:
                        'Αφού ένα τιμολόγιο προμηθευτή εγκριθεί στο Expensify και εξαχθεί στο NetSuite, μπορείτε να ορίσετε ένα επιπλέον επίπεδο έγκρισης στο NetSuite πριν από την καταχώριση.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Προεπιλεγμένη προτίμηση NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Σε εκκρεμότητα για έγκριση',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Εγκεκριμένο για καταχώριση',
                    },
                },
                exportJournalsTo: {
                    label: 'Επίπεδο έγκρισης λογιστικής εγγραφής',
                    description:
                        'Αφού μια εγγραφή ημερολογίου εγκριθεί στο Expensify και εξαχθεί στο NetSuite, μπορείτε να ορίσετε ένα επιπλέον επίπεδο έγκρισης στο NetSuite πριν από την καταχώριση.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Προεπιλεγμένη προτίμηση NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Σε εκκρεμότητα για έγκριση',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Εγκεκριμένο για καταχώριση',
                    },
                },
                error: {
                    customFormID: 'Παρακαλούμε εισαγάγετε ένα έγκυρο αριθμητικό προσαρμοσμένο αναγνωριστικό φόρμας',
                },
            },
            noAccountsFound: 'Δεν βρέθηκαν λογαριασμοί',
            noAccountsFoundDescription: 'Παρακαλούμε προσθέστε τον λογαριασμό στο NetSuite και συγχρονίστε ξανά τη σύνδεση',
            noVendorsFound: 'Δεν βρέθηκαν προμηθευτές',
            noVendorsFoundDescription: 'Παρακαλούμε προσθέστε προμηθευτές στο NetSuite και συγχρονίστε ξανά τη σύνδεση',
            noItemsFound: 'Δεν βρέθηκαν στοιχεία τιμολογίου',
            noItemsFoundDescription: 'Παρακαλούμε προσθέστε στοιχεία τιμολογίου στο NetSuite και συγχρονίστε ξανά τη σύνδεση',
            noSubsidiariesFound: 'Δεν βρέθηκαν θυγατρικές',
            noSubsidiariesFoundDescription: 'Παρακαλούμε προσθέστε μια θυγατρική στο NetSuite και συγχρονίστε ξανά τη σύνδεση',
            tokenInput: {
                title: 'Ρύθμιση NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Εγκαταστήστε το πακέτο Expensify',
                        description: 'Στο NetSuite, μεταβείτε στο *Customization > SuiteBundler > Search & Install Bundles* > αναζητήστε το "Expensify" > εγκαταστήστε το bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Ενεργοποίηση ελέγχου ταυτότητας με διακριτικό token',
                        description: 'Στο NetSuite, μεταβείτε στο *Setup > Company > Enable Features > SuiteCloud* > ενεργοποιήστε το *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Ενεργοποίηση υπηρεσιών ιστού SOAP',
                        description: 'Στο NetSuite, μεταβείτε στο *Setup > Company > Enable Features > SuiteCloud* > ενεργοποιήστε το *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Δημιουργήστε ένα διακριτικό πρόσβασης',
                        description:
                            'Στο NetSuite, μεταβείτε στο *Setup > Users/Roles > Access Tokens* > δημιουργήστε ένα access token για την εφαρμογή «Expensify» και είτε για τον ρόλο «Expensify Integration» είτε «Administrator».\n\n*Σημαντικό:* Βεβαιωθείτε ότι αποθηκεύετε το *Token ID* και το *Token Secret* από αυτό το βήμα. Θα τα χρειαστείτε στο επόμενο βήμα.',
                    },
                    enterCredentials: {
                        title: 'Εισαγάγετε τα στοιχεία σύνδεσής σας στο NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID λογαριασμού NetSuite',
                            netSuiteTokenID: 'Αναγνωριστικό διακριτικού',
                            netSuiteTokenSecret: 'Μυστικό διακριτικού',
                        },
                        netSuiteAccountIDDescription: 'Στο NetSuite, μεταβείτε στο *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Κατηγορίες εξόδων',
                expenseCategoriesDescription: 'Οι κατηγορίες δαπανών NetSuite θα εισαχθούν στο Expensify ως κατηγορίες.',
                crossSubsidiaryCustomers: 'Πελάτες/έργα μεταξύ θυγατρικών',
                importFields: {
                    departments: {
                        title: 'Τμήματα',
                        subtitle: 'Επιλέξτε πώς θέλετε να χειριστείτε τα *τμήματα* του NetSuite στο Expensify.',
                    },
                    classes: {
                        title: 'Κλάσεις',
                        subtitle: 'Επιλέξτε πώς θέλετε να χειριστείτε τις *κατηγορίες* στο Expensify.',
                    },
                    locations: {
                        title: 'Τοποθεσίες',
                        subtitle: 'Επιλέξτε πώς θα χειρίζεστε τις *τοποθεσίες* στο Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Πελάτες/έργα',
                    subtitle: 'Επιλέξτε πώς θα γίνει η διαχείριση των *πελατών* και των *έργων* του NetSuite στο Expensify.',
                    importCustomers: 'Εισαγωγή πελατών',
                    importJobs: 'Εισαγωγή έργων',
                    customers: 'πελάτες',
                    jobs: 'έργα',
                    label: (importFields: string[], importType: string) => `${importFields.join('και')}, ${importType}`,
                },
                importTaxDescription: 'Εισαγωγή φορολογικών ομάδων από το NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Επιλέξτε μία από τις παρακάτω επιλογές:',
                    label: (importedTypes: string[]) => `Εισήχθη ως ${importedTypes.join('και')}`,
                    requiredFieldError: (fieldName: string) => `Παρακαλώ εισαγάγετε το ${fieldName}`,
                    customSegments: {
                        title: 'Προσαρμοσμένα τμήματα/εγγραφές',
                        addText: 'Προσθήκη προσαρμοσμένου τμήματος/εγγραφής',
                        recordTitle: 'Προσαρμοσμένο τμήμα/εγγραφή',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Προβολή αναλυτικών οδηγιών',
                        helpText: 'κατά τη ρύθμιση προσαρμοσμένων τμημάτων/εγγραφών.',
                        emptyTitle: 'Προσθέστε προσαρμοσμένο τμήμα ή προσαρμοσμένη εγγραφή',
                        fields: {
                            segmentName: 'Όνομα',
                            internalID: 'Εσωτερικό αναγνωριστικό',
                            scriptID: 'ID σεναρίου',
                            customRecordScriptID: 'ID στήλης συναλλαγής',
                            mapping: 'Εμφανίζεται ως',
                        },
                        removeTitle: 'Κατάργηση προσαρμοσμένου τμήματος/εγγραφής',
                        removePrompt: 'Είστε βέβαιοι ότι θέλετε να αφαιρέσετε αυτό το προσαρμοσμένο τμήμα/εγγραφή;',
                        addForm: {
                            customSegmentName: 'όνομα προσαρμοσμένου τμήματος',
                            customRecordName: 'προσαρμοσμένο όνομα εγγραφής',
                            segmentTitle: 'Προσαρμοσμένο τμήμα',
                            customSegmentAddTitle: 'Προσθήκη προσαρμοσμένου τμήματος',
                            customRecordAddTitle: 'Προσθήκη προσαρμοσμένης εγγραφής',
                            recordTitle: 'Προσαρμοσμένη εγγραφή',
                            segmentRecordType: 'Θέλετε να προσθέσετε προσαρμοσμένο τμήμα ή προσαρμοσμένη εγγραφή;',
                            customSegmentNameTitle: 'Ποια είναι η ονομασία του προσαρμοσμένου τμήματος;',
                            customRecordNameTitle: 'Ποιο είναι το όνομα της προσαρμοσμένης εγγραφής;',
                            customSegmentNameFooter: `Μπορείτε να βρείτε προσαρμοσμένα ονόματα τμημάτων στο NetSuite στη σελίδα *Customizations > Links, Records & Fields > Custom Segments*.

_Για πιο αναλυτικές οδηγίες, [επισκεφθείτε τον ιστότοπο βοήθειας](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Μπορείτε να βρείτε προσαρμοσμένα ονόματα εγγραφών στο NetSuite εισάγοντας το «Transaction Column Field» στην καθολική αναζήτηση.

_Για πιο αναλυτικές οδηγίες, [επισκεφθείτε τον ιστότοπο βοήθειάς μας](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Ποιο είναι το εσωτερικό αναγνωριστικό;',
                            customSegmentInternalIDFooter: `Πρώτα, βεβαιωθείτε ότι έχετε ενεργοποιήσει τα εσωτερικά ID στο NetSuite από *Home > Set Preferences > Show Internal ID.*

Μπορείτε να βρείτε τα εσωτερικά ID προσαρμοσμένων τμημάτων στο NetSuite από:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Κάντε κλικ σε ένα προσαρμοσμένο τμήμα.
3. Κάντε κλικ στον υπερσύνδεσμο δίπλα στο *Custom Record Type*.
4. Βρείτε το εσωτερικό ID στον πίνακα στο κάτω μέρος.

_Για πιο αναλυτικές οδηγίες, [επισκεφθείτε την ιστοσελίδα βοήθειάς μας](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Μπορείτε να βρείτε τα εσωτερικά ID προσαρμοσμένων εγγραφών στο NetSuite ακολουθώντας αυτά τα βήματα:

1. Πληκτρολογήστε «Transaction Line Fields» στην καθολική αναζήτηση.
2. Κάντε κλικ σε μια προσαρμοσμένη εγγραφή.
3. Βρείτε το εσωτερικό ID στην αριστερή πλευρά.

_Για πιο αναλυτικές οδηγίες, [επισκεφθείτε το κέντρο βοήθειάς μας](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Ποιο είναι το ID του σεναρίου;',
                            customSegmentScriptIDFooter: `Μπορείτε να βρείτε τα script ID προσαρμοσμένων τμημάτων στο NetSuite στο: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Κάντε κλικ σε ένα προσαρμοσμένο τμήμα.
3. Κάντε κλικ στην καρτέλα *Application and Sourcing* κοντά στο κάτω μέρος και, στη συνέχεια:
    a. Αν θέλετε να εμφανίσετε το προσαρμοσμένο τμήμα ως *ετικέτα* (σε επίπεδο γραμμής) στο Expensify, κάντε κλικ στην υποκαρτέλα *Transaction Columns* και χρησιμοποιήστε το *Field ID*.
    b. Αν θέλετε να εμφανίσετε το προσαρμοσμένο τμήμα ως *πεδίο αναφοράς* (σε επίπεδο αναφοράς) στο Expensify, κάντε κλικ στην υποκαρτέλα *Transactions* και χρησιμοποιήστε το *Field ID*.

_Για πιο αναλυτικές οδηγίες, [επισκεφθείτε τη σελίδα βοήθειάς μας](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Ποιο είναι το αναγνωριστικό της στήλης συναλλαγής;',
                            customRecordScriptIDFooter: `Μπορείτε να βρείτε τα script ID προσαρμοσμένων εγγραφών στο NetSuite στις εξής ενότητες:

1. Εισαγάγετε «Transaction Line Fields» στην καθολική αναζήτηση.
2. Κάντε κλικ σε μία προσαρμοσμένη εγγραφή.
3. Βρείτε το script ID στην αριστερή πλευρά.

_Για πιο αναλυτικές οδηγίες, [επισκεφθείτε την ιστοσελίδα βοήθειάς μας](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Πώς θα πρέπει να εμφανίζεται αυτό το προσαρμοσμένο τμήμα στο Expensify;',
                            customRecordMappingTitle: 'Πώς θα πρέπει να εμφανίζεται αυτή η προσαρμοσμένη εγγραφή στο Expensify;',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `Ένα προσαρμοσμένο τμήμα/εγγραφή με αυτό το ${fieldName?.toLowerCase()} υπάρχει ήδη`,
                        },
                    },
                    customLists: {
                        title: 'Προσαρμοσμένες λίστες',
                        addText: 'Προσθήκη προσαρμοσμένης λίστας',
                        recordTitle: 'Προσαρμοσμένη λίστα',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Προβολή αναλυτικών οδηγιών',
                        helpText: 'για τη ρύθμιση προσαρμοσμένων λιστών.',
                        emptyTitle: 'Προσθήκη προσαρμοσμένης λίστας',
                        fields: {
                            listName: 'Όνομα',
                            internalID: 'Εσωτερικό αναγνωριστικό',
                            transactionFieldID: 'Αναγνωριστικό πεδίου συναλλαγής',
                            mapping: 'Εμφανίζεται ως',
                        },
                        removeTitle: 'Κατάργηση προσαρμοσμένης λίστας',
                        removePrompt: 'Είστε βέβαιοι ότι θέλετε να αφαιρέσετε αυτήν τη προσαρμοσμένη λίστα;',
                        addForm: {
                            listNameTitle: 'Επιλέξτε προσαρμοσμένη λίστα',
                            transactionFieldIDTitle: 'Ποιο είναι το ID πεδίου συναλλαγής;',
                            transactionFieldIDFooter: `Μπορείτε να βρείτε τα IDs πεδίων συναλλαγών στο NetSuite ακολουθώντας αυτά τα βήματα:

1. Πληκτρολογήστε «Transaction Line Fields» στην καθολική αναζήτηση.
2. Κάντε κλικ σε μια προσαρμοσμένη λίστα.
3. Βρείτε το ID του πεδίου συναλλαγής στην αριστερή πλευρά.

_Για πιο αναλυτικές οδηγίες, [επισκεφθείτε τον ιστότοπο βοήθειάς μας](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Πώς θα πρέπει να εμφανίζεται αυτή η προσαρμοσμένη λίστα στο Expensify;',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Υπάρχει ήδη προσαρμοσμένη λίστα με αυτό το αναγνωριστικό πεδίου συναλλαγής`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Προεπιλογή εργαζομένου NetSuite',
                        description: 'Δεν εισάγεται στο Expensify, εφαρμόζεται κατά την εξαγωγή',
                        footerContent: (importField: string) =>
                            `Αν χρησιμοποιείτε το ${importField} στο NetSuite, θα εφαρμόσουμε την προεπιλογή που έχει οριστεί στην εγγραφή εργαζομένου κατά την εξαγωγή σε αναφορά εξόδων ή λογιστική εγγραφή.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Ετικέτες',
                        description: 'Σε επίπεδο επιμέρους στοιχείου',
                        footerContent: (importField: string) => `Το ${startCase(importField)} θα είναι επιλέξιμο για κάθε μεμονωμένη δαπάνη στην αναφορά ενός υπαλλήλου.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Πεδία αναφοράς',
                        description: 'Επίπεδο αναφοράς',
                        footerContent: (importField: string) => `Η επιλογή ${startCase(importField)} θα εφαρμοστεί σε όλες τις δαπάνες στην αναφορά ενός υπαλλήλου.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Ρύθμιση Sage Intacct',
            prerequisitesTitle: 'Πριν συνδεθείτε...',
            downloadExpensifyPackage: 'Κάντε λήψη του πακέτου Expensify για Sage Intacct',
            followSteps: 'Ακολουθήστε τα βήματα στις οδηγίες μας «Οδηγός: σύνδεση με Sage Intacct»',
            enterCredentials: 'Εισαγάγετε τα διαπιστευτήριά σας για το Sage Intacct',
            entity: 'Οντότητα',
            employeeDefault: 'Προεπιλογή εργαζομένου Sage Intacct',
            employeeDefaultDescription: 'Το προεπιλεγμένο τμήμα του/της υπαλλήλου θα εφαρμόζεται στις δαπάνες του/της στο Sage Intacct, εφόσον υπάρχει.',
            displayedAsTagDescription: 'Το τμήμα θα είναι επιλέξιμο για κάθε μεμονωμένη δαπάνη στην αναφορά κάθε υπαλλήλου.',
            displayedAsReportFieldDescription: 'Η επιλογή τμήματος θα εφαρμοστεί σε όλα τα έξοδα στην αναφορά ενός υπαλλήλου.',
            toggleImportTitle: (mappingTitle: string) => `Επιλέξτε πώς θέλετε να χειριστείτε το Sage Intacct <strong>${mappingTitle}</strong> στο Expensify.`,
            expenseTypes: 'Τύποι εξόδων',
            expenseTypesDescription: 'Οι τύποι εξόδων Sage Intacct θα εισαχθούν στο Expensify ως κατηγορίες.',
            accountTypesDescription: 'Το διάγραμμα λογαριασμών Sage Intacct θα εισαχθεί στο Expensify ως κατηγορίες.',
            importTaxDescription: 'Εισαγωγή συντελεστή φόρου αγορών από το Sage Intacct.',
            userDefinedDimensions: 'Ορισμένες από τον χρήστη διαστάσεις',
            addUserDefinedDimension: 'Προσθήκη διάστασης οριζόμενης από τον χρήστη',
            integrationName: 'Όνομα ενσωμάτωσης',
            dimensionExists: 'Υπάρχει ήδη διάσταση με αυτό το όνομα.',
            removeDimension: 'Κατάργηση προσαρμοσμένης διάστασης χρήστη',
            removeDimensionPrompt: 'Είστε βέβαιοι ότι θέλετε να καταργήσετε αυτήν τη διάσταση που ορίζεται από τον χρήστη;',
            userDefinedDimension: 'Διάσταση ορισμένη από τον χρήστη',
            addAUserDefinedDimension: 'Προσθέστε μια διάσταση οριζόμενη από τον χρήστη',
            detailedInstructionsLink: 'Προβολή αναλυτικών οδηγιών',
            detailedInstructionsRestOfSentence: 'κατά την προσθήκη διαστάσεων ορισμένων από τον χρήστη.',
            userDimensionsAdded: () => ({
                one: 'Προστέθηκε 1 UDD',
                other: (count: number) => `Προστέθηκαν ${count} UDDs`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'τμήματα';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'τάξεις';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'τοποθεσίες';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'πελάτες';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'έργα (εργασίες)';
                    default:
                        return 'αντιστοιχίσεις';
                }
            },
        },
        rillet: {
            rilletSetup: 'Ρύθμιση Rillet',
            enterCredentials: 'Εισαγάγετε το κλειδί API του Rillet',
            howToFindAPIKey:
                '<strong>Εύρεση του κλειδιού API σας.</strong><ol><li>Συνδεθείτε στο Rillet</li><li>Μεταβείτε στο Λογαριασμός -> Ρυθμίσεις</li><li>Αντιγράψτε το παρακάτω κλειδί API</li></ol>',
            subsidiary: 'Θυγατρική',
            subsidiarySelectDescription: 'Επιλέξτε τη θυγατρική στο Rillet από την οποία θέλετε να εισαγάγετε δεδομένα.',
            noSubsidiariesFound: 'Δεν βρέθηκαν θυγατρικές',
            noSubsidiariesFoundDescription: 'Παρακαλούμε προσθέστε μια θυγατρική στο Rillet και συγχρονίστε ξανά τη σύνδεση',
            accountTypesDescription: 'Οι λογαριασμοί σας στο Rillet θα εισαχθούν ως κατηγορίες.',
            enableNewAccountsTitle: 'Ενεργοποίηση νέων εισαγόμενων λογαριασμών',
            enableNewAccountsDescription: 'Οι νέοι λογαριασμοί Rillet θα είναι διαθέσιμοι ως κατηγορίες.',
            dimensionsImport: 'Όλες οι διαστάσεις Rillet εισάγονται ως ετικέτες',
            importDescription: 'Επιλέξτε ποιες ρυθμίσεις κωδικοποίησης θέλετε να εισαγάγετε από το Rillet.',
        },
        type: {
            free: 'Δωρεάν',
            control: 'Έλεγχος',
            collect: 'Είσπραξη',
            submit: 'Υποβολή',
        },
        companyCards: {
            addCards: 'Προσθήκη καρτών',
            selectCards: 'Επιλέξτε κάρτες',
            fromOtherWorkspaces: 'Από άλλους χώρους εργασίας',
            addWorkEmail: 'Προσθέστε το επαγγελματικό σας email',
            addWorkEmailDescription: 'Παρακαλούμε προσθέστε το επαγγελματικό σας email για να χρησιμοποιήσετε τα υπάρχοντα feeds από άλλους χώρους εργασίας.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Αδυναμία φόρτωσης ροών καρτών',
                workspaceFeedsCouldNotBeLoadedMessage: 'Προέκυψε σφάλμα κατά τη φόρτωση των ροών καρτών του χώρου εργασίας. Δοκιμάστε ξανά ή επικοινωνήστε με τον διαχειριστή σας.',
                feedCouldNotBeLoadedTitle: 'Δεν ήταν δυνατή η φόρτωση αυτής της ροής',
                feedCouldNotBeLoadedMessage: 'Παρουσιάστηκε σφάλμα κατά τη φόρτωση αυτής της ροής. Δοκιμάστε ξανά ή επικοινωνήστε με τον διαχειριστή σας.',
                tryAgain: 'Προσπαθήστε ξανά',
            },
            addNewCard: {
                other: 'Άλλο',
                fileImport: 'Εισαγωγή συναλλαγών από αρχείο',
                fileImportDescription: 'Μια χειροκίνητη επιλογή αν η τράπεζά σας δεν μπορεί να στείλει ροή δεδομένων.',
                createFileFeedHelpText: `<muted-text>Ακολουθήστε αυτόν τον <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">οδηγό βοήθειας</a> για να εισαχθούν οι δαπάνες των εταιρικών καρτών σας!</muted-text>`,
                companyCardLayoutName: 'Όνομα διάταξης εταιρικής κάρτας',
                cardLayoutNameRequired: 'Απαιτείται όνομα διάταξης εταιρικής κάρτας',
                useAdvancedFields: 'Χρησιμοποιήστε προηγμένα πεδία (δεν συνιστάται)',
                cardProviders: {
                    gl1025: 'Εταιρικές κάρτες American Express',
                    cdf: 'Επαγγελματικές κάρτες Mastercard',
                    vcf: 'Επαγγελματικές κάρτες Visa',
                    stripe: 'Κάρτες Stripe',
                },
                yourCardProvider: `Ποιος είναι ο πάροχος της κάρτας σας;`,
                whoIsYourBankAccount: 'Ποια είναι η τράπεζά σας;',
                whereIsYourBankLocated: 'Πού βρίσκεται η τράπεζά σας;',
                howDoYouWantToConnect: 'Πώς θέλετε να συνδεθείτε με την τράπεζά σας;',
                learnMoreAboutOptions: `<muted-text>Μάθετε περισσότερα για αυτές τις <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">επιλογές</a>.</muted-text>`,
                commercialFeedDetails:
                    'Απαιτεί ρύθμιση με την τράπεζά σας. Αυτό χρησιμοποιείται συνήθως από μεγαλύτερες εταιρείες και είναι συχνά η καλύτερη επιλογή, εφόσον πληροίτε τις προϋποθέσεις.',
                commercialFeedPlaidDetails: `Απαιτεί ρύθμιση με την τράπεζά σας, αλλά θα σας καθοδηγήσουμε. Αυτό συνήθως περιορίζεται σε μεγαλύτερες εταιρείες.`,
                directFeedDetails: 'Η πιο απλή προσέγγιση. Συνδεθείτε αμέσως χρησιμοποιώντας τα κύρια διαπιστευτήριά σας. Αυτή η μέθοδος είναι η πιο συνηθισμένη.',
                enableFeed: {
                    title: (provider: string) => `Ενεργοποιήστε τη ροή ${provider} σας`,
                    heading:
                        'Διαθέτουμε άμεση διασύνδεση με τον εκδότη της κάρτας σας και μπορούμε να εισάγουμε τα δεδομένα των συναλλαγών σας στο Expensify γρήγορα και με ακρίβεια.\n\nΓια να ξεκινήσετε, απλώς:',
                    visa: 'Διαθέτουμε παγκόσμιες διασυνδέσεις με τη Visa, αν και η επιλεξιμότητα διαφέρει ανά τράπεζα και πρόγραμμα κάρτας.\n\nΓια να ξεκινήσετε, απλώς:',
                    mastercard: 'Διαθέτουμε παγκόσμιες ενσωματώσεις με τη Mastercard, αν και η επιλεξιμότητα διαφέρει ανά τράπεζα και πρόγραμμα κάρτας.\n\nΓια να ξεκινήσετε, απλώς:',
                    vcf: `1. Επισκεφθείτε [αυτό το άρθρο βοήθειας](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) για αναλυτικές οδηγίες σχετικά με τη ρύθμιση των Visa Commercial Cards σας.

2. [Επικοινωνήστε με την τράπεζά σας](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) για να επιβεβαιώσετε ότι υποστηρίζει εμπορική ροή για το πρόγραμμά σας και ζητήστε τους να την ενεργοποιήσουν.

3. *Μόλις ενεργοποιηθεί η ροή και έχετε τα στοιχεία της, συνεχίστε στην επόμενη οθόνη.*`,
                    gl1025: `1. Επισκεφθείτε [αυτό το άρθρο βοήθειας](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) για να δείτε αν η American Express μπορεί να ενεργοποιήσει μια εμπορική ροή για το πρόγραμμά σας.

2. Μόλις ενεργοποιηθεί η ροή, η Amex θα σας στείλει μια επιστολή παραγωγικού περιβάλλοντος.

3. *Μόλις έχετε τις πληροφορίες της ροής, συνεχίστε στην επόμενη οθόνη.*`,
                    cdf: `1. Επισκεφτείτε [αυτό το άρθρο βοήθειας](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) για αναλυτικές οδηγίες σχετικά με τη ρύθμιση των Mastercard Commercial Cards σας.

2. [Επικοινωνήστε με την τράπεζά σας](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) για να επιβεβαιώσετε ότι υποστηρίζει εμπορική ροή για το πρόγραμμά σας και ζητήστε να την ενεργοποιήσει.

3. *Μόλις ενεργοποιηθεί η ροή και έχετε τις σχετικές λεπτομέρειες, συνεχίστε στην επόμενη οθόνη.*`,
                    stripe: `1. Επισκεφτείτε τον πίνακα ελέγχου του Stripe και μεταβείτε στις [Ρυθμίσεις](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Στην ενότητα «Ενσωματώσεις προϊόντων», κάντε κλικ στην επιλογή «Ενεργοποίηση» δίπλα στο Expensify.

3. Μόλις ενεργοποιηθεί η ροή, κάντε κλικ στην «Υποβολή» παρακάτω και θα αναλάβουμε να την προσθέσουμε.`,
                },
                whatBankIssuesCard: 'Ποια τράπεζα εκδίδει αυτές τις κάρτες;',
                enterNameOfBank: 'Εισαγάγετε το όνομα της τράπεζας',
                feedDetails: {
                    vcf: {
                        title: 'Ποια είναι τα στοιχεία ροής Visa;',
                        processorLabel: 'ID επεξεργαστή',
                        bankLabel: 'Ταυτότητα χρηματοπιστωτικού ιδρύματος (τράπεζας)',
                        companyLabel: 'ID εταιρείας',
                        helpLabel: 'Πού μπορώ να βρω αυτά τα αναγνωριστικά;',
                    },
                    gl1025: {
                        title: `Ποιο είναι το όνομα του αρχείου παράδοσης Amex;`,
                        fileNameLabel: 'Όνομα αρχείου παράδοσης',
                        helpLabel: 'Πού μπορώ να βρω το όνομα του αρχείου παράδοσης;',
                    },
                    cdf: {
                        title: `Ποιο είναι το αναγνωριστικό διανομής της Mastercard;`,
                        distributionLabel: 'ID διανομής',
                        helpLabel: 'Πού μπορώ να βρω το αναγνωριστικό διανομής;',
                    },
                },
                amexCorporate: 'Επιλέξτε αυτό αν στην μπροστινή πλευρά των καρτών σας αναγράφεται «Corporate»',
                amexBusiness: 'Επιλέξτε αυτό αν στην μπροστινή πλευρά των καρτών σας αναγράφεται «Business»',
                amexPersonal: 'Επιλέξτε αυτό αν οι κάρτες σας είναι προσωπικές',
                error: {
                    pleaseSelectProvider: 'Παρακαλούμε επιλέξτε έναν πάροχο κάρτας πριν συνεχίσετε',
                    pleaseSelectBankAccount: 'Παρακαλώ επιλέξτε έναν τραπεζικό λογαριασμό πριν συνεχίσετε',
                    pleaseSelectBank: 'Παρακαλώ επιλέξτε μια τράπεζα πριν συνεχίσετε',
                    pleaseSelectCountry: 'Παρακαλούμε επιλέξτε χώρα πριν συνεχίσετε',
                    pleaseSelectFeedType: 'Παρακαλούμε επιλέξτε έναν τύπο ροής πριν συνεχίσετε',
                },
                exitModal: {
                    title: 'Κάτι δεν λειτουργεί;',
                    prompt: 'Παρατηρήσαμε ότι δεν ολοκληρώσατε την προσθήκη των καρτών σας. Αν αντιμετωπίσατε κάποιο πρόβλημα, ενημερώστε μας ώστε να βοηθήσουμε να επανέλθουν όλα στην κανονική ροή.',
                    confirmText: 'Αναφορά προβλήματος',
                    cancelText: 'Παράλειψη',
                },
                duplicateFeedModal: {
                    title: 'Η ροή κάρτας είναι ήδη συνδεδεμένη',
                    prompt: 'Δεν μπορείτε να προσθέσετε την ίδια ροή κάρτας στο ίδιο χώρο εργασίας δύο φορές.',
                },
                csvColumns: {
                    cardNumber: 'Αριθμός κάρτας',
                    postedDate: 'Ημερομηνία',
                    merchant: 'Έμπορος',
                    amount: 'Ποσό',
                    currency: 'Νόμισμα',
                    ignore: 'Αγνοήστε',
                    originalTransactionDate: 'Αρχική ημερομηνία συναλλαγής',
                    originalAmount: 'Αρχικό ποσό',
                    originalCurrency: 'Αρχικό νόμισμα',
                    comment: 'Σχόλιο',
                    category: 'Κατηγορία',
                    tag: 'Ετικέτα',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `Παρακαλούμε αντιστοιχίστε μια στήλη σε καθεμία από τις ιδιότητες: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) =>
                        `Ουπς! Έχετε αντιστοιχίσει ένα μόνο πεδίο («${duplicateColumn}») σε πολλές στήλες. Παρακαλούμε ελέγξτε και δοκιμάστε ξανά.`,
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Τελευταία ημέρα του μήνα',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Τελευταία εργάσιμη ημέρα του μήνα',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Προσαρμοσμένη ημέρα μήνα',
            },
            assign: 'Ανάθεση',
            assignCard: 'Ανάθεση κάρτας',
            findCard: 'Εντοπίστε κάρτα',
            cardNumber: 'Αριθμός κάρτας',
            commercialFeed: 'Εμπορική ροή',
            feedName: (feedName: string) => `κάρτες ${feedName}`,
            deletedFeed: 'Διαγραμμένη ροή',
            deletedCard: 'Διαγραμμένη κάρτα',
            directFeed: 'Άμεση ροή',
            whoNeedsCardAssigned: 'Ποιος χρειάζεται να του ανατεθεί κάρτα;',
            chooseTheCardholder: 'Επιλέξτε τον κατόχο κάρτας',
            chooseCard: 'Επιλέξτε μια κάρτα',
            chooseCardFor: (assignee: string) =>
                `Επιλέξτε μια κάρτα για τον/την <strong>${assignee}</strong>. Δεν μπορείτε να βρείτε την κάρτα που αναζητάτε; <concierge-link>Ενημερώστε μας.</concierge-link>`,
            noActiveCards: 'Δεν υπάρχουν ενεργές κάρτες σε αυτή τη ροή',
            somethingMightBeBroken:
                '<muted-text><centered-text>Ή κάτι μπορεί να μην λειτουργεί σωστά. Σε κάθε περίπτωση, αν έχετε οποιεσδήποτε ερωτήσεις, απλώς <concierge-link>επικοινωνήστε με το Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Επιλέξτε ημερομηνία έναρξης συναλλαγής',
            startDateDescription: 'Επιλέξτε την ημερομηνία έναρξης εισαγωγής. Θα συγχρονίσουμε όλες τις συναλλαγές από αυτήν την ημερομηνία και μετά.',
            editStartDateDescription:
                'Επιλέξτε μια νέα ημερομηνία έναρξης συναλλαγών. Θα συγχρονίσουμε όλες τις συναλλαγές από αυτήν την ημερομηνία και μετά, εξαιρώντας όσες έχουμε ήδη εισαγάγει.',
            fromTheBeginning: 'Από την αρχή',
            customStartDate: 'Προσαρμοσμένη ημερομηνία έναρξης',
            customCloseDate: 'Προσαρμοσμένη ημερομηνία λήξης',
            letsDoubleCheck: 'Ας ελέγξουμε άλλη μία φορά ότι όλα φαίνονται σωστά.',
            confirmationDescription: 'Θα ξεκινήσουμε αμέσως την εισαγωγή συναλλαγών.',
            card: 'Κάρτα',
            cardName: 'Όνομα κάρτας',
            brokenConnectionError: '<rbr>Η σύνδεση της κάρτας έχει διακοπεί. Παρακαλούμε <a href="#">συνδεθείτε στην τράπεζά σας</a> ώστε να μπορέσουμε να επαναφέρουμε τη σύνδεση.</rbr>',
            assignedCard: (assignee: string, link: string) => `ανατέθηκε/ανέθεσα στον/στην ${assignee} ένα/μία ${link}! Οι εισαγόμενες συναλλαγές θα εμφανίζονται σε αυτήν τη συνομιλία.`,
            companyCard: 'εταιρική κάρτα',
            chooseCardFeed: 'Επιλέξτε τροφοδοσία κάρτας',
            ukRegulation:
                'Η Expensify Limited είναι αντιπρόσωπος της Plaid Financial Ltd., ενός εξουσιοδοτημένου ιδρύματος πληρωμών που εποπτεύεται από την Financial Conduct Authority σύμφωνα με τους Κανονισμούς Υπηρεσιών Πληρωμών 2017 (Αριθμός Μητρώου Επιχείρησης: 804718). Η Plaid σάς παρέχει ρυθμιζόμενες υπηρεσίες πληροφόρησης λογαριασμού μέσω της Expensify Limited ως αντιπροσώπου της.',
            assignCardFailedError: 'Η ανάθεση κάρτας απέτυχε.',
            unassignCardFailedError: 'Η κατάργηση ανάθεσης της κάρτας απέτυχε.',
            cardAlreadyAssignedError: 'Αυτή η κάρτα έχει ήδη αντιστοιχιστεί σε χρήστη σε άλλο χώρο εργασίας.',
            importTransactions: {
                title: 'Εισαγωγή συναλλαγών από αρχείο',
                description: 'Παρακαλούμε προσαρμόστε τις ρυθμίσεις για το αρχείο σας που θα εφαρμοστούν κατά την εισαγωγή.',
                cardDisplayName: 'Εμφανιζόμενο όνομα κάρτας',
                currency: 'Νόμισμα',
                transactionsAreReimbursable: 'Οι συναλλαγές είναι αποζημιώσιμες',
                flipAmountSign: 'Αντιστροφή πρόσημου ποσού',
                importButton: 'Εισαγωγή συναλλαγών',
            },
            assignNewCards: {
                title: 'Ανάθεση νέων καρτών',
                description: 'Λάβετε τις πιο πρόσφατες κάρτες προς ανάθεση από την τράπεζά σας',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Έκδοση και διαχείριση των Καρτών Expensify',
            getStartedIssuing: 'Ξεκινήστε εκδίδοντας την πρώτη σας εικονική ή φυσική κάρτα.',
            verificationInProgress: 'Η επαλήθευση βρίσκεται σε εξέλιξη...',
            verifyingTheDetails: 'Επαληθεύουμε ορισμένες λεπτομέρειες. Ο/Η Concierge θα σας ενημερώσει όταν οι Κάρτες Expensify είναι έτοιμες για έκδοση.',
            disclaimer:
                'Η εμπορική κάρτα Expensify Visa® εκδίδεται από την The Bancorp Bank, N.A., μέλος FDIC, κατ’ εξουσιοδότηση άδειας από τη Visa U.S.A. Inc. και ενδέχεται να μην γίνεται αποδεκτή από όλους τους εμπόρους που δέχονται κάρτες Visa. Η Apple® και το λογότυπο Apple® είναι εμπορικά σήματα της Apple Inc., καταχωρημένα στις Η.Π.Α. και σε άλλες χώρες. Το App Store είναι σήμα υπηρεσίας της Apple Inc. Το Google Play και το λογότυπο Google Play είναι εμπορικά σήματα της Google LLC.',
            euUkDisclaimer:
                'Οι κάρτες που παρέχονται σε κατοίκους του ΕΟΧ εκδίδονται από την Transact Payments Malta Limited και οι κάρτες που παρέχονται σε κατοίκους του Ηνωμένου Βασιλείου εκδίδονται από την Transact Payments Limited, δυνάμει άδειας της Visa Europe Limited. Η Transact Payments Malta Limited είναι δεόντως εξουσιοδοτημένη και ρυθμιζόμενη από τη Malta Financial Services Authority ως Χρηματοπιστωτικό Ίδρυμα σύμφωνα με τον Financial Institution Act 1994. Αριθμός εγγραφής C 91879. Η Transact Payments Limited είναι εξουσιοδοτημένη και ρυθμιζόμενη από την Gibraltar Financial Service Commission.',
            issueCard: 'Έκδοση κάρτας',
            exportAsCSV: 'Εξαγωγή ως CSV',
            csvColumnType: 'Τύπος',
            csvColumnLimitType: 'Τύπος ορίου',
            csvColumnLimit: 'Όριο',
            findCard: 'Εντοπίστε κάρτα',
            newCard: 'Νέα κάρτα',
            name: 'Όνομα',
            lastFour: 'Τελευταία 4',
            limit: 'Όριο',
            currentBalance: 'Τρέχον υπόλοιπο',
            currentBalanceDescription:
                'Το τρέχον υπόλοιπο είναι το άθροισμα όλων των καταχωρημένων συναλλαγών της Κάρτας Expensify που έχουν πραγματοποιηθεί από την ημερομηνία της τελευταίας εκκαθάρισης.',
            balanceWillBeSettledOn: (settlementDate: string) => `Το υπόλοιπο θα διακανονιστεί στις ${settlementDate}`,
            settleBalance: 'Εξόφληση υπολοίπου',
            cardLimit: 'Όριο κάρτας',
            remainingLimit: 'Υπόλοιπο ορίου',
            requestLimitIncrease: 'Αίτημα αύξησης ορίου',
            remainingLimitDescription:
                'Λαμβάνουμε υπόψη έναν αριθμό παραγόντων όταν υπολογίζουμε το υπόλοιπο ορίου σας: τη διάρκεια που είστε πελάτης, τις επιχειρηματικές πληροφορίες που δώσατε κατά την εγγραφή και τα διαθέσιμα μετρητά στον επαγγελματικό σας τραπεζικό λογαριασμό. Το υπόλοιπο ορίου σας μπορεί να μεταβάλλεται σε καθημερινή βάση.',
            earnedCashback: 'Επιστροφή μετρητών',
            earnedCashbackDescription: 'Το υπόλοιπο επιστροφής μετρητών βασίζεται στις εκκαθαρισμένες μηνιαίες δαπάνες με Κάρτα Expensify σε όλο τον χώρο εργασίας σας.',
            issueNewCard: 'Έκδοση νέας κάρτας',
            finishSetup: 'Ολοκληρώστε τη ρύθμιση',
            chooseBankAccount: 'Επιλέξτε τραπεζικό λογαριασμό',
            chooseExistingBank: 'Επιλέξτε έναν υπάρχοντα επαγγελματικό τραπεζικό λογαριασμό για να πληρώσετε το υπόλοιπο της Κάρτας Expensify ή προσθέστε έναν νέο τραπεζικό λογαριασμό',
            accountEndingIn: 'Λογαριασμός που λήγει σε',
            addNewBankAccount: 'Προσθήκη νέου τραπεζικού λογαριασμού',
            settlementAccount: 'Λογαριασμός διακανονισμού',
            settlementAccountDescription: 'Επιλέξτε έναν λογαριασμό για να πληρώσετε το υπόλοιπο της Κάρτας Expensify.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `Βεβαιωθείτε ότι αυτός ο λογαριασμός ταιριάζει με τον <a href="${reconciliationAccountSettingsLink}">λογαριασμό συμφωνίας</a> σας (${accountNumber}) ώστε η συνεχής συμφωνία να λειτουργεί σωστά.`,
            settlementFrequency: 'Συχνότητα εκκαθάρισης',
            settlementFrequencyDescription: 'Επιλέξτε πόσο συχνά θα εξοφλείτε το υπόλοιπο της Κάρτας Expensify.',
            settlementFrequencyInfo:
                'Αν θέλετε να μεταβείτε σε μηνιαίο διακανονισμό, θα πρέπει να συνδέσετε τον τραπεζικό σας λογαριασμό μέσω Plaid και να έχετε θετικό ιστορικό υπολοίπου 90 ημερών.',
            applyCashbackToBill: 'Εφαρμογή επιστροφής μετρητών στον λογαριασμό μου στο Expensify',
            applyCashbackToBillDescription: 'Η επιστροφή μετρητών από την Κάρτα Expensify θα χρησιμοποιηθεί για την πληρωμή του λογαριασμού σας στην Expensify.',
            frequency: {
                daily: 'Καθημερινά',
                monthly: 'Μηνιαίως',
            },
            cardDetails: 'Στοιχεία κάρτας',
            virtual: 'Εικονική',
            physical: 'Φυσική',
            deactivate: 'Απενεργοποίηση κάρτας',
            changeCardLimit: 'Αλλαγή ορίου κάρτας',
            changeLimit: 'Αλλαγή ορίου',
            smartLimitWarning: (limit: number | string) =>
                `Αν αλλάξετε το όριο αυτής της κάρτας σε ${limit}, νέες συναλλαγές θα απορρίπτονται μέχρι να εγκρίνετε περισσότερες δαπάνες στην κάρτα.`,
            monthlyLimitWarning: (limit: number | string) => `Αν αλλάξετε το όριο αυτής της κάρτας σε ${limit}, οι νέες συναλλαγές θα απορρίπτονται μέχρι τον επόμενο μήνα.`,
            fixedLimitWarning: (limit: number | string) => `Αν αλλάξετε το όριο αυτής της κάρτας σε ${limit}, οι νέες συναλλαγές θα απορρίπτονται.`,
            changeCardLimitType: 'Αλλαγή τύπου ορίου κάρτας',
            changeLimitType: 'Αλλαγή τύπου ορίου',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Αν αλλάξετε τον τύπο ορίου αυτής της κάρτας σε έξυπνο όριο, οι νέες συναλλαγές θα απορρίπτονται επειδή το μη εγκεκριμένο όριο ${limit} έχει ήδη φτάσει.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Αν αλλάξετε τον τύπο ορίου αυτής της κάρτας σε μηνιαίο, οι νέες συναλλαγές θα απορρίπτονται επειδή το μηνιαίο όριο των ${limit} έχει ήδη εξαντληθεί.`,
            addShippingDetails: 'Προσθέστε στοιχεία αποστολής',
            addPersonalDetails: 'Προσθέστε προσωπικά στοιχεία',
            issuedCard: (assignee: string) => `εκδώσατε στην/στον ${assignee} μία Κάρτα Expensify! Η κάρτα θα φτάσει σε 2-3 εργάσιμες ημέρες.`,
            issuedCardNoShippingDetails: (assignee: string) => `εκδόθηκε στον/στην ${assignee} μία Κάρτα Expensify! Η κάρτα θα αποσταλεί μόλις επιβεβαιωθούν τα στοιχεία αποστολής.`,
            issuedCardVirtual: (assignee: string, link: string) => `εξέδωσε στον/στην ${assignee} μια εικονική Κάρτα Expensify! Το/Η ${link} μπορεί να χρησιμοποιηθεί αμέσως.`,
            addedShippingDetails: (assignee: string) => `${assignee} πρόσθεσε στοιχεία αποστολής. Η Κάρτα Expensify θα φτάσει σε 2-3 εργάσιμες ημέρες.`,
            replacedCard: (assignee: string) => `Ο/Η ${assignee} αντικατέστησε την Κάρτα Expensify. Η νέα κάρτα θα φτάσει σε 2–3 εργάσιμες ημέρες.`,
            replacedVirtualCard: (assignee: string, link: string) => `Ο/Η ${assignee} αντικατέστησε την εικονική Κάρτα Expensify του/της! Το ${link} μπορεί να χρησιμοποιηθεί άμεσα.`,
            card: 'κάρτα',
            replacementCard: 'κάρτα αντικατάστασης',
            verifyingHeader: 'Γίνεται επαλήθευση',
            bankAccountVerifiedHeader: 'Ο τραπεζικός λογαριασμός επαληθεύτηκε',
            verifyingBankAccount: 'Γίνεται επαλήθευση του τραπεζικού λογαριασμού...',
            verifyingBankAccountDescription: 'Παρακαλούμε περιμένετε όσο επιβεβαιώνουμε ότι αυτός ο λογαριασμός μπορεί να χρησιμοποιηθεί για την έκδοση Καρτών Expensify.',
            bankAccountVerified: 'Ο τραπεζικός λογαριασμός επαληθεύτηκε!',
            bankAccountVerifiedDescription: 'Μπορείτε πλέον να εκδίδετε Κάρτες Expensify στα μέλη του χώρου εργασίας σας.',
            oneMoreStep: 'Άλλο ένα βήμα...',
            oneMoreStepDescription:
                'Φαίνεται ότι χρειάζεται να επαληθεύσουμε χειροκίνητα τον τραπεζικό σας λογαριασμό. Παρακαλούμε πηγαίνετε στο Concierge, όπου σας περιμένουν οι οδηγίες σας.',
            gotIt: 'Εντάξει',
            goToConcierge: 'Μεταβείτε στο Concierge',
        },
        categories: {
            deleteCategories: 'Διαγραφή κατηγοριών',
            deleteCategoriesPrompt: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτές τις κατηγορίες;',
            deleteCategory: 'Διαγραφή κατηγορίας',
            deleteCategoryPrompt: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτήν την κατηγορία;',
            disableCategories: 'Απενεργοποιήστε τις κατηγορίες',
            disableCategory: 'Απενεργοποίηση κατηγορίας',
            enableCategories: 'Ενεργοποίηση κατηγοριών',
            enableCategory: 'Ενεργοποίηση κατηγορίας',
            defaultSpendCategories: 'Προεπιλεγμένες κατηγορίες δαπανών',
            spendCategoriesDescription: 'Προσαρμόστε τον τρόπο με τον οποίο κατηγοριοποιείται η δαπάνη εμπόρου για συναλλαγές πιστωτικής κάρτας και σαρωμένες αποδείξεις.',
            deleteFailureMessage: 'Παρουσιάστηκε σφάλμα κατά τη διαγραφή της κατηγορίας, δοκιμάστε ξανά',
            categoryName: 'Όνομα κατηγορίας',
            requiresCategory: 'Τα μέλη πρέπει να κατηγοριοποιούν όλες τις δαπάνες',
            needCategoryForExportToIntegration: (connectionName: string) => `Όλες οι δαπάνες πρέπει να κατηγοριοποιηθούν για να γίνει η εξαγωγή στο ${connectionName}.`,
            subtitle: 'Αποκτήστε μια καλύτερη εικόνα για το πού ξοδεύονται τα χρήματα. Χρησιμοποιήστε τις προεπιλεγμένες κατηγορίες μας ή προσθέστε τις δικές σας.',
            emptyCategories: {
                title: 'Δεν υπάρχουν ακόμη κατηγορίες',
                subtitle: 'Προσθέστε μια κατηγορία για να οργανώσετε τις δαπάνες σας.',
                subtitleWithAccounting: (accountingPageURL: string, canManage = true) =>
                    `<muted-text><centered-text>Οι κατηγορίες σας εισάγονται αυτήν τη στιγμή από μια λογιστική σύνδεση.${canManage ? `Μεταβείτε στη σελίδα <a href="${accountingPageURL}">λογιστικής</a> για να κάνετε τυχόν αλλαγές.` : ''}</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση της κατηγορίας, δοκιμάστε ξανά',
            createFailureMessage: 'Παρουσιάστηκε σφάλμα κατά τη δημιουργία της κατηγορίας, παρακαλούμε δοκιμάστε ξανά',
            addCategory: 'Προσθήκη κατηγορίας',
            editCategory: 'Επεξεργασία κατηγορίας',
            editCategories: 'Επεξεργαστείτε κατηγορίες',
            findCategory: 'Εύρεση κατηγορίας',
            categoryRequiredError: 'Απαιτείται όνομα κατηγορίας',
            existingCategoryError: 'Υπάρχει ήδη κατηγορία με αυτό το όνομα',
            invalidCategoryName: 'Μη έγκυρο όνομα κατηγορίας',
            importedFromAccountingSoftware: 'Οι παρακάτω κατηγορίες έχουν εισαχθεί από τον/την',
            payrollCode: 'Κωδικός μισθοδοσίας',
            updatePayrollCodeFailureMessage: 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση του κωδικού μισθοδοσίας, δοκιμάστε ξανά',
            glCode: 'Κωδικός Γ/Λ',
            updateGLCodeFailureMessage: 'Προέκυψε σφάλμα κατά την ενημέρωση του κωδικού GL, δοκιμάστε ξανά',
            importCategories: 'Εισαγωγή κατηγοριών',
            cannotDeleteOrDisableAllCategories: {
                title: 'Δεν μπορείτε να διαγράψετε ή να απενεργοποιήσετε όλες τις κατηγορίες',
                description: `Πρέπει να παραμείνει ενεργοποιημένη τουλάχιστον μία κατηγορία, επειδή ο χώρος εργασίας σας απαιτεί κατηγορίες.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Χρησιμοποιήστε τους παρακάτω διακόπτες για να ενεργοποιήσετε περισσότερες δυνατότητες καθώς αναπτύσσεστε. Κάθε δυνατότητα θα εμφανίζεται στο μενού πλοήγησης για περαιτέρω προσαρμογή.',
            spendSection: {
                title: 'Δαπάνη',
                subtitle: 'Ενεργοποιήστε λειτουργίες που σας βοηθούν να αναπτύξετε την ομάδα σας.',
            },
            manageSection: {
                title: 'Διαχείριση',
                subtitle: 'Προσθέστε ελέγχους που βοηθούν να διατηρείτε τις δαπάνες εντός προϋπολογισμού.',
            },
            earnSection: {
                title: 'Κερδίστε',
                subtitle: 'Βελτιστοποιήστε τα έσοδά σας και πληρωθείτε πιο γρήγορα.',
            },
            organizeSection: {
                title: 'Οργανώστε',
                subtitle: 'Ομαδοποιήστε και αναλύστε τις δαπάνες, καταγράψτε κάθε φόρο που πληρώθηκε.',
            },
            integrateSection: {
                title: 'Ενσωμάτωση',
                subtitle: 'Συνδέστε το Expensify με δημοφιλή χρηματοοικονομικά προϊόντα.',
            },
            distanceRates: {
                title: 'Τιμές χιλιομετρικής αποζημίωσης',
                subtitle: 'Προσθέστε, ενημερώστε και εφαρμόστε τιμές.',
            },
            perDiem: {
                title: 'Ημερήσια αποζημίωση',
                subtitle: 'Ορίστε ημερήσια επιδόματα για να ελέγχετε τις καθημερινές δαπάνες των υπαλλήλων.',
            },
            travel: {
                title: 'Ταξίδι',
                subtitle: 'Κάντε κράτηση, διαχειριστείτε και συμφωνήστε όλα τα επαγγελματικά σας ταξίδια.',
                disableTravelTitle: 'Απενεργοποιήστε πρώτα τη συγκεντρωτική χρέωση ταξιδιών',
                disableTravelPrompt: 'Η ενοποιημένη χρέωση ταξιδιών είναι ενεργοποιημένη για αυτόν τον χώρο εργασίας. Απενεργοποιήστε την πριν μπορέσετε να απενεργοποιήσετε το Ταξίδι.',
                disableTravelButton: 'Μεταβείτε στις ρυθμίσεις ταξιδιών',
                getStarted: {
                    title: 'Ξεκινήστε με το Expensify Travel',
                    subtitle: 'Χρειαζόμαστε μόνο λίγες ακόμη πληροφορίες για την επιχείρησή σας και μετά θα είστε έτοιμοι για απογείωση.',
                    ctaText: 'Πάμε',
                },
                reviewingRequest: {
                    title: 'Ετοιμάστε τις βαλίτσες σας, λάβαμε το αίτημά σας...',
                    subtitle: 'Προς το παρόν εξετάζουμε το αίτημά σας για ενεργοποίηση του Expensify Travel. Μην ανησυχείτε, θα σας ενημερώσουμε όταν είναι έτοιμο.',
                    ctaText: 'Το αίτημα στάλθηκε',
                },
                bookOrManageYourTrip: {
                    title: 'Κράτηση ταξιδιού',
                    subtitle: 'Συγχαρητήρια! Είστε έτοιμοι να κάνετε και να διαχειρίζεστε κρατήσεις ταξιδιών σε αυτόν τον χώρο εργασίας.',
                    ctaText: 'Διαχείριση ταξιδιών',
                },
                settings: {
                    autoAddTripName: {
                        title: 'Προσθέστε ονόματα ταξιδιών στις δαπάνες',
                        subtitle: 'Προσθέτετε αυτόματα τα ονόματα ταξιδιών στις περιγραφές εξόδων για ταξίδια που κλείνονται στο Expensify.',
                    },
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Κράτηση ταξιδιού',
                        subtitle: 'Συγχαρητήρια! Είστε έτοιμοι να κάνετε και να διαχειρίζεστε κρατήσεις ταξιδιών σε αυτόν τον χώρο εργασίας.',
                        manageTravelLabel: 'Διαχείριση ταξιδιών',
                    },
                    travelInvoicingSection: {
                        title: 'Ενοποιημένη τιμολόγηση ταξιδιών',
                        subtitle: 'Συγκεντρώστε όλες τις ταξιδιωτικές δαπάνες σε έναν μηνιαίο λογαριασμό αντί να πληρώνετε τη στιγμή της αγοράς.',
                        learnHow: 'Μάθετε πώς.',
                        subsections: {
                            currentTravelSpendLabel: 'Τρέχουσες δαπάνες ταξιδιού',
                            currentTravelSpendPaymentQueued: (amount: string) => `Η πληρωμή ποσού ${amount} είναι σε αναμονή και θα διεκπεραιωθεί σύντομα.`,
                            currentTravelSpendCta: 'Πληρωμή υπολοίπου',
                            currentTravelLimitLabel: 'Τρέχον ταξιδιωτικό όριο',
                            settlementAccountLabel: 'Λογαριασμός διακανονισμού',
                            settlementFrequencyLabel: 'Συχνότητα εκκαθάρισης',
                            settlementFrequencyDescription:
                                'Πόσο συχνά το Expensify θα χρεώνει τον επαγγελματικό σας τραπεζικό λογαριασμό για την εξόφληση πρόσφατων συναλλαγών Expensify Travel.',
                            monthlySpendLimitLabel: 'Μηνιαίο όριο δαπανών ανά μέλος',
                            monthlySpendLimitDescription: 'Το μέγιστο ποσό που μπορεί να ξοδεύει κάθε μέλος για ταξίδια ανά μήνα.',
                            reduceLimitTitle: 'Μείωση ορίου δαπανών ταξιδιού;',
                            reduceLimitWarning:
                                'Αν μειώσετε το όριο, τα μέλη που έχουν ήδη ξοδέψει περισσότερο από αυτό το ποσό δεν θα μπορούν να κάνουν νέες κρατήσεις ταξιδιών μέχρι τον επόμενο μήνα.',
                            provisioningError:
                                'Δεν μπορέσαμε να ενεργοποιήσουμε ορισμένα μέλη του χώρου εργασίας σας για ενοποιημένη τιμολόγηση ταξιδιών. Δοκιμάστε ξανά αργότερα ή επικοινωνήστε με το Concierge για βοήθεια.',
                        },
                    },
                    disableModal: {
                        title: 'Απενεργοποίηση της ενοποιημένης χρέωσης ταξιδιών;',
                        body: 'Επερχόμενες κρατήσεις ξενοδοχείων και ενοικιάσεων αυτοκινήτων ίσως χρειαστεί να επανακρατηθούν με διαφορετικό τρόπο πληρωμής για να αποφύγετε την ακύρωση.',
                        confirm: 'Απενεργοποιήστε',
                    },
                    outstandingBalanceModal: {
                        title: 'Αδυναμία απενεργοποίησης της ενοποιημένης χρέωσης ταξιδιών',
                        body: 'Έχετε ακόμη ένα ανεξόφλητο υπόλοιπο ταξιδιού. Παρακαλούμε εξοφλήστε πρώτα το υπόλοιπό σας.',
                        confirm: 'Εντάξει',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `Να εξοφληθεί το υπόλοιπο των ${amount};`,
                        body: 'Η πληρωμή θα μπει σε σειρά αναμονής και θα επεξεργαστεί σύντομα. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί μόλις ξεκινήσει.',
                    },
                    exportToPDF: 'Εξαγωγή σε PDF',
                    exportToCSV: 'Εξαγωγή σε CSV',
                    selectDateRangeError: 'Παρακαλώ επιλέξτε ένα εύρος ημερομηνιών για εξαγωγή',
                    invalidDateRangeError: 'Η ημερομηνία έναρξης πρέπει να είναι πριν από την ημερομηνία λήξης',
                    enabled: 'Η ενοποιημένη τιμολόγηση ταξιδιών ενεργοποιήθηκε!',
                    enabledDescription: 'Όλες οι δαπάνες ταξιδιού σε αυτόν τον χώρο εργασίας θα συγκεντρώνονται πλέον σε έναν μηνιαίο λογαριασμό.',
                },
                personalDetailsDescription:
                    'Για να μπορέσουμε να κάνουμε την κράτηση του ταξιδιού, παρακαλούμε εισαγάγετε το επίσημο όνομά σας όπως εμφανίζεται στην κρατική ταυτότητα ή άλλο κρατικό έγγραφο ταυτοποίησης.',
            },
            expensifyCard: {
                title: 'Κάρτα Expensify',
                subtitle: 'Αποκτήστε γνώσεις και έλεγχο στις δαπάνες.',
                disableCardTitle: 'Απενεργοποίηση Κάρτας Expensify',
                disableCardPrompt: 'Δεν μπορείτε να απενεργοποιήσετε την Κάρτα Expensify επειδή βρίσκεται ήδη σε χρήση. Επικοινωνήστε με το Concierge για τα επόμενα βήματα.',
                disableCardButton: 'Συνομιλήστε με το Concierge',
                feed: {
                    title: 'Αποκτήστε την Κάρτα Expensify',
                    subTitle: 'Εξορθολογήστε τα επαγγελματικά σας έξοδα και εξοικονομήστε έως και 50% στον λογαριασμό σας Expensify, καθώς επίσης:',
                    features: {
                        cashBack: 'Επιστροφή μετρητών σε κάθε αγορά στις ΗΠΑ',
                        unlimited: 'Απεριόριστες εικονικές κάρτες',
                        spend: 'Έλεγχοι δαπανών και προσαρμοσμένα όρια',
                    },
                    ctaTitle: 'Έκδοση νέας κάρτας',
                },
            },
            companyCards: {
                title: 'Εταιρικές κάρτες',
                subtitle: 'Συνδέστε τις κάρτες που ήδη έχετε.',
                feed: {
                    title: 'Χρησιμοποιήστε τις δικές σας κάρτες (BYOC)',
                    subtitle: 'Συνδέστε τις κάρτες που ήδη έχετε για αυτόματη εισαγωγή συναλλαγών, αντιστοίχιση αποδείξεων και συμφωνία λογαριασμών.',
                    features: {
                        support: 'Συνδέστε κάρτες από περισσότερες από 10.000 τράπεζες',
                        assignCards: 'Συνδέστε τις υπάρχουσες κάρτες της ομάδας σας',
                        automaticImport: 'Θα εισάγουμε τις συναλλαγές αυτόματα',
                    },
                },
                bankConnectionError: 'Πρόβλημα σύνδεσης με την τράπεζα',
                connectWithPlaid: 'συνδεθείτε μέσω Plaid',
                connectWithExpensifyCard: 'δοκιμάστε την Κάρτα Expensify.',
                bankConnectionDescription: `Παρακαλούμε δοκιμάστε να προσθέσετε ξανά τις κάρτες σας. Διαφορετικά, μπορείτε να`,
                disableCardTitle: 'Απενεργοποίηση εταιρικών καρτών',
                disableCardPrompt: 'Δεν μπορείτε να απενεργοποιήσετε τις εταιρικές κάρτες, επειδή αυτή η λειτουργία είναι σε χρήση. Επικοινωνήστε με το Concierge για τα επόμενα βήματα.',
                disableCardButton: 'Συνομιλήστε με το Concierge',
                cardDetails: 'Στοιχεία κάρτας',
                cardNumber: 'Αριθμός κάρτας',
                cardholder: 'Κάτοχος κάρτας',
                cardName: 'Όνομα κάρτας',
                allCards: 'Όλες οι κάρτες',
                assignedCards: 'Έχει ανατεθεί',
                unassignedCards: 'Μη εκχωρημένο',
                integrationExport: (integration: string, type?: string) => (integration && type ? `εξαγωγή ${integration} ${type.toLowerCase()}` : `εξαγωγή ${integration}`),
                integrationExportTitleXero: (integration: string) => `Επιλέξτε τον λογαριασμό ${integration} όπου θα εξαχθούν οι συναλλαγές.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `Επιλέξτε τον λογαριασμό ${integration} στον οποίο θα εξαχθούν οι συναλλαγές. Επιλέξτε μια διαφορετική <a href="${exportPageLink}">επιλογή εξαγωγής</a> για να αλλάξετε τους διαθέσιμους λογαριασμούς.`,
                lastUpdated: 'Τελευταία ενημέρωση',
                transactionStartDate: 'Ημερομηνία έναρξης συναλλαγής',
                updateCard: 'Ενημέρωση κάρτας',
                unassignCard: 'Αποδέσμευση κάρτας',
                unassign: 'Απο取消 ανάθεση',
                unassignCardDescription: 'Η αποδέσμευση αυτής της κάρτας θα διαγράψει όλες τις μη υποβληθείσες συναλλαγές.',
                assignCard: 'Ανάθεση κάρτας',
                removeCard: 'Αφαίρεση κάρτας',
                remove: 'Κατάργηση',
                removeCardDescription: 'Η κατάργηση αυτής της κάρτας θα διαγράψει όλες τις μη υποβληθείσες συναλλαγές.',
                cardFeedName: 'Όνομα ροής κάρτας',
                cardFeedNameDescription: 'Δώστε στη ροή κάρτας ένα μοναδικό όνομα ώστε να μπορείτε να τη ξεχωρίζετε από τις άλλες.',
                cardFeedTransaction: 'Διαγράψτε συναλλαγές',
                cardFeedTransactionDescription: 'Επιλέξτε αν οι κάτοχοι καρτών μπορούν να διαγράφουν συναλλαγές κάρτας. Οι νέες συναλλαγές θα ακολουθούν αυτούς τους κανόνες.',
                cardFeedRestrictDeletingTransaction: 'Περιορισμός διαγραφής συναλλαγών',
                cardFeedAllowDeletingTransaction: 'Να επιτρέπεται η διαγραφή συναλλαγών',
                removeCardFeed: 'Αφαίρεση ροής κάρτας',
                removeCardFeedTitle: (feedName: string) => `Κατάργηση ροής ${feedName}`,
                removeCardFeedDescription: 'Είστε βέβαιοι ότι θέλετε να καταργήσετε αυτήν την τροφοδοσία καρτών; Αυτό θα αποδεσμεύσει όλες τις κάρτες.',
                error: {
                    feedNameRequired: 'Απαιτείται όνομα ροής κάρτας',
                    statementCloseDateRequired: 'Επιλέξτε μια ημερομηνία κλεισίματος της κατάστασης.',
                },
                corporate: 'Περιορισμός διαγραφής συναλλαγών',
                personal: 'Να επιτρέπεται η διαγραφή συναλλαγών',
                setFeedNameDescription: 'Δώστε στη ροή κάρτας ένα μοναδικό όνομα ώστε να τη διακρίνετε από τις άλλες',
                setTransactionLiabilityDescription:
                    'Όταν είναι ενεργοποιημένο, οι κάτοχοι καρτών μπορούν να διαγράφουν συναλλαγές κάρτας. Οι νέες συναλλαγές θα ακολουθούν αυτόν τον κανόνα.',
                emptyAddedFeedTitle: 'Δεν υπάρχουν κάρτες σε αυτήν τη ροή',
                emptyAddedFeedDescription: 'Βεβαιωθείτε ότι υπάρχουν κάρτες στη ροή καρτών της τράπεζάς σας.',
                pendingFeedTitle: `Εξετάζουμε το αίτημά σας...`,
                pendingFeedDescription: `Αυτήν τη στιγμή εξετάζουμε τα στοιχεία της ροής σας. Μόλις ολοκληρωθεί, θα επικοινωνήσουμε μαζί σας μέσω`,
                pendingBankTitle: 'Ελέγξτε το παράθυρο του προγράμματος περιήγησής σας',
                pendingBankDescription: (bankName: string) => `Συνδεθείτε παρακαλώ στην ${bankName} μέσω του παραθύρου του προγράμματος περιήγησης που μόλις άνοιξε. Αν δεν άνοιξε κάποιο,`,
                pendingBankLink: 'παρακαλούμε κάντε κλικ εδώ',
                giveItNameInstruction: 'Δώστε στην κάρτα ένα όνομα που να την ξεχωρίζει από τις άλλες.',
                updating: 'Γίνεται ενημέρωση...',
                neverUpdated: 'Ποτέ',
                noAccountsFound: 'Δεν βρέθηκαν λογαριασμοί',
                defaultCard: 'Προεπιλεγμένη κάρτα',
                downgradeTitle: `Αδυναμία υποβάθμισης χώρου εργασίας`,
                downgradeSubTitle: `Δεν είναι δυνατή η υποβάθμιση αυτού του χώρου εργασίας επειδή είναι συνδεδεμένες πολλαπλές ροές καρτών (εξαιρούνται οι Κάρτες Expensify). Παρακαλούμε <a href="#">διατηρήστε μόνο μία ροή καρτών</a> για να συνεχίσετε.`,
                noAccountsFoundDescription: (connection: string) => `Παρακαλούμε προσθέστε τον λογαριασμό στο ${connection} και συγχρονίστε ξανά τη σύνδεση`,
                expensifyCardBannerTitle: 'Αποκτήστε την Κάρτα Expensify',
                expensifyCardBannerSubtitle:
                    'Απολαύστε επιστροφή μετρητών σε κάθε αγορά στις ΗΠΑ, έκπτωση έως και 50% στον λογαριασμό σας στην Expensify, απεριόριστες εικονικές κάρτες και πολλά ακόμα.',
                expensifyCardBannerLearnMoreButton: 'Μάθετε περισσότερα',
                statementCloseDateTitle: 'Ημερομηνία λήξης κατάστασης λογαριασμού',
                statementCloseDateDescription: 'Ενημερώστε μας πότε κλείνει το αντίγραφο κίνησης της κάρτας σας και θα δημιουργήσουμε ένα αντίστοιχο αντίγραφο κίνησης στο Expensify.',
            },
            workflows: {
                title: 'Ροές εργασιών',
                subtitle: 'Ρυθμίστε τον τρόπο με τον οποίο εγκρίνονται και πληρώνονται οι δαπάνες.',
                disableApprovalPrompt:
                    'Οι Κάρτες Expensify από αυτόν τον χώρο εργασίας βασίζονται προς το παρόν σε εγκρίσεις για τον καθορισμό των έξυπνων ορίων τους. Παρακαλούμε τροποποιήστε τους τύπους ορίων όλων των Καρτών Expensify με έξυπνα όρια πριν απενεργοποιήσετε τις εγκρίσεις.',
            },
            invoices: {
                title: 'Τιμολόγια',
                subtitle: 'Αποστολή και λήψη τιμολογίων.',
            },
            categories: {
                title: 'Κατηγορίες',
                subtitle: 'Παρακολουθήστε και οργανώστε τις δαπάνες σας.',
            },
            tags: {
                title: 'Ετικέτες',
                subtitle: 'Κατατάξτε τα κόστη και παρακολουθήστε τα χρεώσιμα έξοδα.',
            },
            taxes: {
                title: 'Φόροι',
                subtitle: 'Τεκμηριώστε και διεκδικήστε τους επιλέξιμους φόρους σας.',
            },
            reportFields: {
                title: 'Πεδία αναφοράς',
                subtitle: 'Ρυθμίστε προσαρμοσμένα πεδία για δαπάνες.',
            },
            connections: {
                title: 'Λογιστική',
                subtitle: 'Συγχρονίστε το λογιστικό σας σχέδιο και άλλα.',
            },
            receiptPartners: {
                title: 'Συνεργάτες αποδείξεων',
                subtitle: 'Αυτόματη εισαγωγή αποδείξεων.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Όχι και τόσο γρήγορα...',
                featureEnabledText: 'Για να ενεργοποιήσετε ή να απενεργοποιήσετε αυτή τη λειτουργία, θα χρειαστεί να αλλάξετε τις ρυθμίσεις εισαγωγής λογιστικής.',
                disconnectText: 'Για να απενεργοποιήσετε τη λογιστική, θα χρειαστεί να αποσυνδέσετε τη λογιστική σύνδεση από τον χώρο εργασίας σας.',
                manageSettings: 'Διαχείριση ρυθμίσεων',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Αποσύνδεση του Uber',
                disconnectText: 'Για να απενεργοποιήσετε αυτή τη λειτουργία, αποσυνδέστε πρώτα την ενσωμάτωση Uber for Business.',
                description: 'Είστε βέβαιοι ότι θέλετε να αποσυνδέσετε αυτήν την ενοποίηση;',
                confirmText: 'Εντάξει',
            },
            hrWarningModal: {
                disconnectText: ({integration}: {integration: string}) => `Για να απενεργοποιήσετε το HR, αποσυνδέστε πρώτα το ${integration} από αυτόν τον χώρο εργασίας.`,
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Όχι και τόσο γρήγορα...',
                featureEnabledText:
                    'Οι Κάρτες Expensify σε αυτόν τον χώρο εργασίας βασίζονται σε ροές έγκρισης για να ορίσουν τα Έξυπνα Όριά τους.\n\nΠαρακαλούμε αλλάξτε τους τύπους ορίου σε όλες τις κάρτες με Έξυπνα Όρια πριν απενεργοποιήσετε τις ροές εργασίας.',
                confirmText: 'Μετάβαση στις Κάρτες Expensify',
            },
            rules: {
                title: 'Κανόνες',
                subtitle: 'Απαιτήστε αποδείξεις, επισημάνετε υψηλές δαπάνες και πολλά άλλα.',
            },
            timeTracking: {
                title: 'Ώρα',
                subtitle: 'Ορίστε χρέωση ανά ώρα για χρονοπαρακολούθηση.',
                defaultHourlyRate: 'Προεπιλεγμένη ωριαία χρέωση',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Παραδείγματα:',
            customReportNamesSubtitle: `<muted-text>Προσαρμόστε τους τίτλους αναφορών χρησιμοποιώντας τους <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">εκτενείς τύπους</a> μας.</muted-text>`,
            customNameTitle: 'Προεπιλεγμένος τίτλος αναφοράς',
            customNameDescription: `Επιλέξτε ένα προσαρμοσμένο όνομα για τις αναφορές εξόδων χρησιμοποιώντας τους <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">εκτενείς τύπους</a> μας.`,
            customNameInputLabel: 'Όνομα',
            customNameEmailPhoneExample: 'Email ή τηλέφωνο μέλους: {report:submit:from}',
            customNameStartDateExample: 'Ημερομηνία έναρξης αναφοράς: {report:startdate}',
            customNameWorkspaceNameExample: 'Όνομα χώρου εργασίας: {report:workspacename}',
            customNameReportIDExample: 'Αναφορά ID: {report:id}',
            customNameTotalExample: 'Σύνολο: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Αποτρέψτε τα μέλη από το να αλλάζουν προσαρμοσμένους τίτλους αναφορών',
        },
        reportFields: {
            addField: 'Προσθήκη πεδίου',
            delete: 'Διαγραφή πεδίου',
            deleteFields: 'Διαγραφή πεδίων',
            findReportField: 'Εύρεση πεδίου αναφοράς',
            deleteConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το πεδίο αναφοράς;',
            deleteFieldsConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτά τα πεδία αναφοράς;',
            emptyReportFields: {
                title: 'Δεν υπάρχουν ακόμη πεδία αναφοράς',
                subtitle: 'Προσθέστε ένα προσαρμοσμένο πεδίο (κείμενο, ημερομηνία ή αναπτυσσόμενη λίστα) που εμφανίζεται στις αναφορές.',
            },
            subtitle: 'Τα πεδία αναφοράς εφαρμόζονται σε όλες τις δαπάνες και μπορεί να είναι χρήσιμα όταν θέλετε να ζητήσετε επιπλέον πληροφορίες.',
            disableReportFields: 'Απενεργοποίηση πεδίων αναφοράς',
            disableReportFieldsConfirmation: 'Είστε βέβαιοι; Τα πεδία κειμένου και ημερομηνίας θα διαγραφούν και οι λίστες θα απενεργοποιηθούν.',
            importedFromAccountingSoftware: 'Τα παρακάτω πεδία αναφοράς εισάγονται από την/τον',
            textType: 'Κείμενο',
            dateType: 'Ημερομηνία',
            dropdownType: 'Λίστα',
            formulaType: 'Τύπος',
            textAlternateText: 'Προσθέστε ένα πεδίο για ελεύθερη εισαγωγή κειμένου.',
            dateAlternateText: 'Προσθέστε ένα ημερολόγιο για επιλογή ημερομηνίας.',
            dropdownAlternateText: 'Προσθέστε μια λίστα επιλογών για να διαλέξετε.',
            formulaAlternateText: 'Προσθέστε ένα πεδίο τύπου.',
            nameInputSubtitle: 'Επιλέξτε ένα όνομα για το πεδίο αναφοράς.',
            typeInputSubtitle: 'Επιλέξτε ποιον τύπο πεδίου αναφοράς θέλετε να χρησιμοποιήσετε.',
            initialValueInputSubtitle: 'Εισαγάγετε μια αρχική τιμή για εμφάνιση στο πεδίο αναφοράς.',
            listValuesInputSubtitle: 'Αυτές οι τιμές θα εμφανίζονται στη λίστα επιλογών του πεδίου της αναφοράς σας. Τα ενεργοποιημένα στοιχεία μπορούν να επιλεγούν από τα μέλη.',
            listInputSubtitle: 'Αυτές οι τιμές θα εμφανίζονται στη λίστα πεδίων της αναφοράς σας. Τα ενεργοποιημένα στοιχεία μπορούν να επιλεγούν από τα μέλη.',
            deleteValue: 'Διαγραφή τιμής',
            deleteValues: 'Διαγραφή τιμών',
            disableValue: 'Απενεργοποίηση τιμής',
            disableValues: 'Απενεργοποίηση τιμών',
            enableValue: 'Ενεργοποίηση τιμής',
            enableValues: 'Ενεργοποίηση τιμών',
            emptyReportFieldsValues: {
                title: 'Δεν υπάρχουν ακόμη τιμές λίστας',
                subtitle: 'Προσθέστε προσαρμοσμένες τιμές για να εμφανίζονται στις αναφορές.',
            },
            deleteValuePrompt: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτήν την τιμή λίστας;',
            deleteValuesPrompt: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτές τις τιμές λίστας;',
            listValueRequiredError: 'Παρακαλούμε εισαγάγετε ένα όνομα τιμής λίστας',
            existingListValueError: 'Υπάρχει ήδη μια τιμή λίστας με αυτό το όνομα',
            editValue: 'Επεξεργασία τιμής',
            listValues: 'Τιμές λίστας',
            addValue: 'Προσθέστε αξία',
            existingReportFieldNameError: 'Υπάρχει ήδη πεδίο αναφοράς με αυτό το όνομα',
            reportFieldNameRequiredError: 'Παρακαλούμε εισαγάγετε ένα όνομα πεδίου αναφοράς',
            reportFieldTypeRequiredError: 'Παρακαλώ επιλέξτε έναν τύπο πεδίου αναφοράς',
            circularReferenceError: 'Αυτό το πεδίο δεν μπορεί να αναφέρεται στον εαυτό του. Παρακαλούμε ενημερώστε το.',
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `Το πεδίο τύπου ${value} δεν αναγνωρίζεται`,
            reportFieldInitialValueRequiredError: 'Παρακαλούμε επιλέξτε μια αρχική τιμή για το πεδίο αναφοράς',
            genericFailureMessage: 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση του πεδίου αναφοράς. Παρακαλούμε δοκιμάστε ξανά.',
        },
        tags: {
            tagName: 'Όνομα ετικέτας',
            requiresTag: 'Τα μέλη πρέπει να επισημαίνουν όλες τις δαπάνες',
            trackBillable: 'Παρακολούθηση χρεώσιμων εξόδων',
            customTagName: 'Προσαρμοσμένο όνομα ετικέτας',
            enableTag: 'Ενεργοποίηση ετικέτας',
            enableTags: 'Ενεργοποίηση ετικετών',
            requireTag: 'Απαιτείται ετικέτα',
            requireTags: 'Απαιτούμενες ετικέτες',
            notRequireTags: 'Να μην απαιτείται',
            disableTag: 'Απενεργοποίηση ετικέτας',
            disableTags: 'Απενεργοποίηση ετικετών',
            addTag: 'Προσθήκη ετικέτας',
            editTag: 'Επεξεργασία ετικέτας',
            editTags: 'Επεξεργασία ετικετών',
            findTag: 'Εύρεση ετικέτας',
            subtitle: 'Οι ετικέτες προσθέτουν πιο λεπτομερείς τρόπους ταξινόμησης των εξόδων.',
            subtitleWithDependentTags: (importSpreadsheetLink: string, canReimport = true) =>
                `<muted-text>Οι ετικέτες προσθέτουν πιο λεπτομερείς τρόπους ταξινόμησης των δαπανών. Χρησιμοποιείτε <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">εξαρτημένες ετικέτες</a>.${canReimport ? `Μπορείτε να <a href="${importSpreadsheetLink}">εισαγάγετε ξανά ένα υπολογιστικό φύλλο</a> για να ενημερώσετε τις ετικέτες σας.` : ''}</muted-text>`,
            emptyTags: {
                title: 'Καμία ετικέτα ακόμη',
                subtitle: 'Προσθέστε μια ετικέτα για την παρακολούθηση έργων, τοποθεσιών, τμημάτων και άλλων.',
                subtitleHTML: `<muted-text><centered-text>Προσθέστε ετικέτες για να παρακολουθείτε έργα, τοποθεσίες, τμήματα και άλλα. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Μάθετε περισσότερα</a> σχετικά με τη διαμόρφωση αρχείων ετικετών για εισαγωγή.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string, canManage = true) =>
                    `<muted-text><centered-text>Οι ετικέτες σας εισάγονται αυτήν τη στιγμή από μια λογιστική σύνδεση.${canManage ? `Μεταβείτε στη σελίδα <a href="${accountingPageURL}">λογιστικής</a> για να κάνετε τυχόν αλλαγές.` : ''}</centered-text></muted-text>`,
            },
            deleteTag: 'Διαγραφή ετικέτας',
            deleteTags: 'Διαγραφή ετικετών',
            deleteTagConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτήν την ετικέτα;',
            deleteTagsConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτές τις ετικέτες;',
            deleteFailureMessage: 'Προέκυψε σφάλμα κατά τη διαγραφή της ετικέτας, δοκιμάστε ξανά',
            tagRequiredError: 'Απαιτείται όνομα ετικέτας',
            existingTagError: 'Υπάρχει ήδη μια ετικέτα με αυτό το όνομα',
            invalidTagNameError: 'Το όνομα της ετικέτας δεν μπορεί να είναι 0. Παρακαλούμε επιλέξτε διαφορετική τιμή.',
            genericFailureMessage: 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση της ετικέτας, δοκιμάστε ξανά',
            importedFromAccountingSoftware: 'Οι ετικέτες διαχειρίζονται στο/στην',
            employeesSeeTagsAs: 'Οι υπάλληλοι βλέπουν τις ετικέτες ως',
            glCode: 'Κωδικός Γ/Λ',
            updateGLCodeFailureMessage: 'Προέκυψε σφάλμα κατά την ενημέρωση του κωδικού GL, δοκιμάστε ξανά',
            tagRules: 'Κανόνες ετικετών',
            approverDescription: 'Έγκριση',
            importTags: 'Εισαγωγή ετικετών',
            importTagsSupportingText: 'Κωδικοποιήστε τα έξοδά σας με έναν τύπο ετικέτας ή με πολλούς.',
            configureMultiLevelTags: 'Ρυθμίστε τη λίστα με τις ετικέτες σας για πολυεπίπεδη επισήμανση.',
            importMultiLevelTagsSupportingText: `Δείτε εδώ μια προεπισκόπηση των ετικετών σας. Αν όλα φαίνονται σωστά, κάντε κλικ παρακάτω για να τις εισαγάγετε.`,
            importMultiLevelTags: {
                firstRowTitle: 'Η πρώτη σειρά είναι ο τίτλος για κάθε λίστα ετικετών',
                independentTags: 'Αυτές είναι ανεξάρτητες ετικέτες',
                glAdjacentColumn: 'Υπάρχει ένας κωδικός GL στη διπλανή στήλη',
            },
            tagLevel: {
                singleLevel: 'Μονό επίπεδο ετικετών',
                multiLevel: 'Ετικέτες πολλαπλών επιπέδων',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Εναλλαγή επιπέδων ετικέτας',
                prompt1: 'Η αλλαγή επιπέδων ετικέτας θα διαγράψει όλες τις τρέχουσες ετικέτες.',
                prompt2: 'Σας προτείνουμε πρώτα να',
                prompt3: 'κάντε λήψη αντιγράφου ασφαλείας',
                prompt4: 'εξάγοντας τις ετικέτες σας.',
                prompt5: 'Μάθετε περισσότερα',
                prompt6: 'σχετικά με τα επίπεδα ετικετών.',
            },
            overrideMultiTagWarning: {
                title: 'Εισαγωγή ετικετών',
                prompt1: 'Είστε σίγουροι;',
                prompt2: 'Οι υπάρχουσες ετικέτες θα αντικατασταθούν, αλλά μπορείτε να',
                prompt3: 'κάντε λήψη αντιγράφου ασφαλείας',
                prompt4: 'πρώτα.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Βρήκαμε *${columnCounts} στήλες* στο υπολογιστικό σας φύλλο. Επιλέξτε *Όνομα* δίπλα στη στήλη που περιέχει τα ονόματα των ετικετών. Μπορείτε επίσης να επιλέξετε *Ενεργοποιημένο* δίπλα στη στήλη που ορίζει την κατάσταση των ετικετών.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Δεν είναι δυνατή η διαγραφή ή απενεργοποίηση όλων των ετικετών',
                description: `Πρέπει να παραμείνει ενεργοποιημένη τουλάχιστον μία ετικέτα, επειδή ο χώρος εργασίας σας απαιτεί ετικέτες.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Δεν είναι δυνατή η ρύθμιση όλων των ετικετών ως προαιρετικών',
                description: `Τουλάχιστον μία ετικέτα πρέπει να παραμείνει υποχρεωτική, επειδή οι ρυθμίσεις του χώρου εργασίας σας απαιτούν ετικέτες.`,
            },
            cannotMakeTagListRequired: {
                title: 'Δεν είναι δυνατή η ρύθμιση της λίστας ετικετών ως υποχρεωτικής',
                description: 'Μπορείτε να ορίσετε μια λίστα ετικετών ως υποχρεωτική μόνο αν η πολιτική σας έχει ρυθμισμένα πολλαπλά επίπεδα ετικετών.',
            },
            tagCount: () => ({
                one: '1 ετικέτα',
                other: (count: number) => `${count} ετικέτες`,
            }),
        },
        taxes: {
            subtitle: 'Προσθέστε ονόματα φόρων, συντελεστές και ορίστε προεπιλογές.',
            addRate: 'Προσθέστε τιμή',
            workspaceDefault: 'Προεπιλεγμένο νόμισμα χώρου εργασίας',
            foreignDefault: 'Προεπιλεγμένο ξένο νόμισμα',
            customTaxName: 'Προσαρμοσμένο όνομα φόρου',
            value: 'Τιμή',
            taxReclaimableOn: 'Ποσό φόρου που μπορεί να ανακτηθεί σε',
            taxRate: 'Φορολογικός συντελεστής',
            taxRates: 'Φορολογικοί συντελεστές',
            findTaxRate: 'Βρείτε συντελεστή φόρου',
            error: {
                taxRateAlreadyExists: 'Αυτό το όνομα φόρου χρησιμοποιείται ήδη',
                taxCodeAlreadyExists: 'Αυτός ο κωδικός φόρου χρησιμοποιείται ήδη',
                valuePercentageRange: 'Παρακαλούμε εισαγάγετε ένα έγκυρο ποσοστό μεταξύ 0 και 100',
                customNameRequired: 'Απαιτείται προσαρμοσμένο όνομα φόρου',
                deleteFailureMessage: 'Προέκυψε σφάλμα κατά τη διαγραφή του φορολογικού συντελεστή. Δοκιμάστε ξανά ή ζητήστε βοήθεια από το Concierge.',
                updateFailureMessage: 'Προέκυψε σφάλμα κατά την ενημέρωση του φορολογικού συντελεστή. Δοκιμάστε ξανά ή ζητήστε βοήθεια από το Concierge.',
                createFailureMessage: 'Προέκυψε σφάλμα κατά τη δημιουργία του φορολογικού συντελεστή. Προσπαθήστε ξανά ή ζητήστε βοήθεια από το Concierge.',
                updateTaxClaimableFailureMessage: 'Το ανακτήσιμο μέρος πρέπει να είναι μικρότερο από το ποσό του τιμολογίου ανά απόσταση',
            },
            deleteTaxConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον φόρο;',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `Είστε βέβαιοι ότι θέλετε να διαγράψετε ${taxAmount} φόρους;`,
            actions: {
                delete: 'Διαγραφή τιμής',
                deleteMultiple: 'Διαγραφή τιμών',
                enable: 'Ενεργοποίηση επιτοκίου',
                disable: 'Απενεργοποίηση ποσοστού',
                enableTaxRates: () => ({
                    one: 'Ενεργοποίηση επιτοκίου',
                    other: 'Ενεργοποίηση τιμών',
                }),
                disableTaxRates: () => ({
                    one: 'Απενεργοποίηση ποσοστού',
                    other: 'Απενεργοποίηση τιμών',
                }),
            },
            importedFromAccountingSoftware: 'Οι παρακάτω φόροι έχουν εισαχθεί από τον/την δικό/δική σας',
            taxCode: 'Κωδικός φόρου',
            updateTaxCodeFailureMessage: 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση του φορολογικού κωδικού, παρακαλούμε δοκιμάστε ξανά',
        },
        duplicateWorkspace: {
            title: 'Ονομάστε τον νέο χώρο εργασίας σας',
            selectFeatures: 'Επιλέξτε δυνατότητες για αντιγραφή',
            whichFeatures: 'Ποια χαρακτηριστικά θέλετε να αντιγράψετε στον νέο σας χώρο εργασίας;',
            confirmDuplicate: 'Θέλετε να συνεχίσετε;',
            categories: 'κατηγορίες και οι κανόνες αυτόματης κατηγοριοποίησής σας',
            reimbursementAccount: 'λογαριασμός αποζημίωσης',
            welcomeNote: 'Παρακαλώ αρχίστε να χρησιμοποιείτε τον νέο χώρο εργασίας μου',
            delayedSubmission: 'καθυστερημένη υποβολή',
            merchantRules: 'Κανόνες εμπόρων',
            merchantRulesCount: () => ({
                one: '1 κανόνας εμπόρου',
                other: (count: number) => `${count} κανόνες εμπόρου`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Πρόκειται να δημιουργήσετε και να κοινοποιήσετε το ${newWorkspaceName ?? ''} με ${totalMembers ?? 0} μέλη από τον αρχικό χώρο εργασίας.`,
            error: 'Παρουσιάστηκε σφάλμα κατά την αντιγραφή του νέου χώρου εργασίας σας. Παρακαλούμε δοκιμάστε ξανά.',
        },
        emptyDomain: {
            title: 'Ενισχύστε την ασφάλειά σας με τομείς',
            subtitle: 'Απαιτήστε από τα μέλη του domain σας να συνδέονται μέσω single sign-on, περιορίστε τη δημιουργία χώρων εργασίας και πολλά άλλα.',
        },
        copyPolicySettings: {
            title: 'Αντιγραφή ρυθμίσεων',
            error: 'Παρουσιάστηκε σφάλμα κατά την αντιγραφή των ρυθμίσεων του χώρου εργασίας. Δοκιμάστε ξανά.',
            selectWorkspaces: {
                title: 'Επιλέξτε χώρους εργασίας',
                description: 'Επιλέξτε τους χώρους εργασίας στους οποίους θέλετε να αντιγράψετε ρυθμίσεις και μετά επιλέξτε τις ρυθμίσεις που θέλετε να αντιγράψετε.',
                searchPlaceholder: 'Αναζήτηση χώρων εργασίας',
            },
            selectSettings: {
                title: 'Επιλέξτε ρυθμίσεις',
                description: 'Επιλέξτε τις ρυθμίσεις που θέλετε να αντικαταστήσετε στους υπάρχοντες χώρους εργασίας σας.',
                accountingMismatch: ({part}: {part: string}) =>
                    `Μπορείτε να αντιγράψετε το ${part} μόνο αν όλοι οι χώροι εργασίας χρησιμοποιούν το ίδιο λογιστικό σύστημα και την ίδια σύνδεση εταιρείας.`,
                travelAddressMismatch: 'Μπορείτε να αντιγράψετε ταξίδια μόνο αν κάθε επιλεγμένος χώρος εργασίας έχει εταιρική διεύθυνση.',
            },
            confirmSettings: {
                title: 'Ας βεβαιωθούμε ότι όλα φαίνονται σωστά.',
                description: ({workspaceName}: {workspaceName: string}) =>
                    `Θα αντιγράψουμε τις ακόλουθες ρυθμίσεις από το <strong>${workspaceName}</strong> στους χώρους εργασίας που έχετε ορίσει.`,
            },
            confirmWorkflows: {
                continue: 'Συνέχεια χωρίς μέλη',
                description: 'Η αντιγραφή ροών εργασίας χωρίς μέλη δεν θα αντιγράψει τις ροές εργασίας έγκρισης. Οι ρυθμίσεις υποβολής και πληρωμής θα αντιγραφούν κανονικά.',
            },
            upgrade: {
                title: 'Ορισμένες δυνατότητες απαιτούν πρόγραμμα Control',
                description: ({workspaceName, features}: {workspaceName: string; features: string}) => `Το ${workspaceName} χρησιμοποιεί ${features}, που απαιτούν πρόγραμμα Control.

Για να φέρετε αυτές τις λειτουργίες και στους άλλους χώρους εργασίας σας, αναβαθμίστε τους για να συνεχίσετε.

Το πρόγραμμα Control ξεκινά από $9 ανά ενεργό μέλος τον μήνα.`,
            },
            progress: {
                copyInProgressTitle: 'Αντιγραφή σε εξέλιξη...',
                copyInProgressDescription: 'Μπορείτε είτε να περιμένετε να ολοκληρωθεί η διαδικασία είτε να σας ενημερώσει το Concierge όταν τελειώσει.',
                letMeKnowPrompt: 'Ενημερώστε με όταν ολοκληρωθεί',
                conciergeNotificationTitle: 'Ο Concierge θα σας ενημερώσει',
                conciergeNotificationDescription: 'Όταν ολοκληρωθεί η διαδικασία, η Concierge θα σας στείλει ένα μήνυμα.',
                copyCompleted: 'Οι ρυθμίσεις του χώρου εργασίας σας αντιγράφηκαν.',
            },
        },
        emptyWorkspace: {
            title: 'Δεν υπάρχουν ακόμα χώροι εργασίας',
            subtitle: 'Δημιουργήστε έναν χώρο εργασίας για να διαχειρίζεστε τα έξοδά σας, τις αποζημιώσεις και τις εταιρικές κάρτες σας.',
            createAWorkspaceCTA: 'Ξεκινήστε',
            features: {
                trackAndCollect: 'Παρακολουθήστε και συλλέξτε αποδείξεις',
                reimbursements: 'Αποζημιώστε εργαζόμενους',
                companyCards: 'Διαχείριση εταιρικών καρτών',
            },
            notFound: 'Δεν βρέθηκε χώρος εργασίας',
            description:
                'Τα δωμάτια είναι ένα εξαιρετικό μέρος για να συζητάτε και να συνεργάζεστε με πολλά άτομα. Για να ξεκινήσετε τη συνεργασία, δημιουργήστε ή συμμετάσχετε σε έναν χώρο εργασίας',
        },
        new: {
            newWorkspace: 'Νέος χώρος εργασίας',
            getTheExpensifyCardAndMore: 'Αποκτήστε την Κάρτα Expensify και άλλα',
            confirmWorkspace: 'Επιβεβαιώστε το workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Ο χώρος εργασίας της ομάδας μου${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `Χώρος εργασίας του/της ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Παρουσιάστηκε σφάλμα κατά την αφαίρεση μέλους από τον χώρο εργασίας, δοκιμάστε ξανά',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Είστε βέβαιοι ότι θέλετε να αφαιρέσετε τον/την ${memberName};`,
                other: 'Είστε βέβαιοι ότι θέλετε να αφαιρέσετε αυτά τα μέλη;',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `Ο/Η ${memberName} είναι εγκρίνων/-ουσα σε αυτόν τον χώρο εργασίας. Αν σταματήσετε να μοιράζεστε αυτόν τον χώρο εργασίας μαζί του/της, θα τον/την αντικαταστήσουμε στη ροή έγκρισης με τον/την κάτοχο του χώρου εργασίας, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Κατάργηση μέλους',
                other: 'Κατάργηση μελών',
            }),
            findMember: 'Εύρεση μέλους',
            removeWorkspaceMemberButtonTitle: 'Κατάργηση από τον χώρο εργασίας',
            removeGroupMemberButtonTitle: 'Κατάργηση από την ομάδα',
            removeRoomMemberButtonTitle: 'Κατάργηση από τη συνομιλία',
            removeMemberPrompt: (memberName: string) => `Είστε βέβαιοι ότι θέλετε να αφαιρέσετε τον/την ${memberName};`,
            removeMemberTitle: 'Κατάργηση μέλους',
            transferOwner: 'Μεταφορά ιδιοκτήτη',
            makeMember: () => ({
                one: 'Κάντε μέλος',
                other: 'Κάντε μέλη',
            }),
            makeAdmin: () => ({
                one: 'Ορισμός ως διαχειριστή χώρου εργασίας',
                other: 'Ορίστε διαχειριστές χώρου εργασίας',
            }),
            makeGroupAdmin: () => ({
                one: 'Ορισμός ως διαχειριστή',
                other: 'Ορισμός ως διαχειριστές',
            }),
            makeAuditor: () => ({
                one: 'Ορισμός ως ελεγκτής',
                other: 'Δημιουργία ελεγκτών',
            }),
            makeCardAdmin: () => ({
                one: 'Ορισμός διαχειριστή κάρτας',
                other: 'Ορίστε διαχειριστές κάρτας',
            }),
            makePeopleAdmin: () => ({
                one: 'Ορισμός χρηστών ως διαχειριστές',
                other: 'Κάντε άτομα διαχειριστές',
            }),
            makePaymentsAdmin: () => ({
                one: 'Κάντε διαχειριστή πληρωμών',
                other: 'Κάντε τους διαχειριστές πληρωμών',
            }),
            selectAll: 'Επιλογή όλων',
            error: {
                genericAdd: 'Παρουσιάστηκε πρόβλημα κατά την προσθήκη αυτού του μέλους χώρου εργασίας',
                cannotRemove: 'Δεν μπορείτε να αφαιρέσετε τον εαυτό σας ή τον ιδιοκτήτη του χώρου εργασίας',
                genericRemove: 'Προέκυψε πρόβλημα κατά την αφαίρεση αυτού του μέλους του χώρου εργασίας',
            },
            addedWithPrimary: 'Ορισμένα μέλη προστέθηκαν με τους κύριους λογαριασμούς σύνδεσής τους.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `Προστέθηκε από το δευτερεύον στοιχείο σύνδεσης ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `Σύνολο μελών χώρου εργασίας: ${count}`,
            configureHRSync: (providerName: string) => `Ρυθμίστε τον συγχρονισμό του ${providerName}.`,
            syncWithHR: (providerName: string) => `Συγχρονισμός με ${providerName}`,
            allMembers: 'Όλα τα μέλη',
            admins: 'Διαχειριστές χώρου εργασίας',
            cardAdmins: 'Διαχειριστές κάρτας',
            peopleAdmins: 'Διαχειριστές προσωπικού',
            paymentsAdmins: 'Διαχειριστές πληρωμών',
            approvers: 'Εγκρίνοντες',
            auditors: 'Ελεγκτές',
            editors: 'Συντάκτες',
            members: 'Μέλη',
            emptyRoleFilter: {
                title: 'Κανένα μέλος δεν ταιριάζει με αυτό το φίλτρο',
                subtitle: 'Προσκαλέστε ένα μέλος ή αλλάξτε το φίλτρο παραπάνω.',
            },
            importMembers: 'Εισαγωγή μελών',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `Αν αφαιρέσετε τον/την ${approver} από αυτόν τον χώρο εργασίας, θα τον/την αντικαταστήσουμε στη ροή έγκρισης με τον/την ${workspaceOwner}, τον/την ιδιοκτήτη/ιδιοκτήτρια του χώρου εργασίας.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `Ο/Η ${memberName} έχει σε εκκρεμότητα αναφορές εξόδων προς έγκριση. Παρακαλούμε ζητήστε τους να τις εγκρίνουν ή αναλάβετε τον έλεγχο των αναφορών τους προτού τους αφαιρέσετε από τον χώρο εργασίας.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Δεν μπορείτε να αφαιρέσετε τον/την ${memberName} από αυτόν τον χώρο εργασίας. Ορίστε έναν νέο υπεύθυνο αποζημιώσεων στις Ροές εργασιών > Πραγματοποιήστε ή παρακολουθήστε πληρωμές και μετά δοκιμάστε ξανά.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Αν αφαιρέσετε τον/την ${memberName} από αυτόν τον χώρο εργασίας, θα τον/την αντικαταστήσουμε ως προτιμώμενο εξαγωγέα με τον/την ${workspaceOwner}, τον/την κάτοχο του χώρου εργασίας.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Αν αφαιρέσετε τον/την ${memberName} από αυτόν τον χώρο εργασίας, θα τον/την αντικαταστήσουμε ως τεχνική επαφή με τον/την ${workspaceOwner}, τον/την κάτοχο του χώρου εργασίας.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `Ο/Η ${memberName} έχει μία εκκρεμή αναφορά προς επεξεργασία που απαιτεί ενέργεια. Παρακαλούμε ζητήστε του/της να ολοκληρώσει την απαιτούμενη ενέργεια προτού τον/την αφαιρέσετε από τον χώρο εργασίας.`,
        },
        card: {
            getStartedIssuing: 'Ξεκινήστε εκδίδοντας την πρώτη σας εικονική ή φυσική κάρτα.',
            issueCard: 'Έκδοση κάρτας',
            chooseRule: 'Επιλέξτε έναν κανόνα',
            searchRules: 'Βρείτε κανόνα δαπανών',
            issueNewCard: {
                whoNeedsCard: 'Ποιος χρειάζεται κάρτα;',
                inviteNewMember: 'Προσκαλέστε νέο μέλος',
                findMember: 'Εύρεση μέλους',
                chooseCardType: 'Επιλέξτε έναν τύπο κάρτας',
                physicalCard: 'Φυσική κάρτα',
                physicalCardDescription: 'Ιδανικό για όσους ξοδεύουν συχνά',
                virtualCard: 'Εικονική κάρτα',
                virtualCardDescription: 'Άμεσο και ευέλικτο',
                chooseLimitType: 'Επιλέξτε τύπο ορίου',
                smartLimit: 'Έξυπνο όριο',
                smartLimitDescription: 'Ξοδέψτε έως ένα συγκεκριμένο ποσό πριν απαιτείται έγκριση',
                monthly: 'Μηνιαίως',
                monthlyDescription: 'Το όριο ανανεώνεται μηνιαία',
                fixedAmount: 'Σταθερό ποσό',
                fixedAmountDescription: 'Ξοδέψτε μέχρι να φτάσετε το όριο',
                setLimit: 'Ορίστε ένα όριο',
                cardLimitError: 'Παρακαλούμε εισαγάγετε ένα ποσό μικρότερο από $21,474,836',
                giveItName: 'Δώστε του ένα όνομα',
                giveItNameInstruction: 'Κάντε το αρκετά μοναδικό ώστε να το ξεχωρίζετε από άλλες κάρτες. Ακόμη καλύτερα αν περιγράφει μια συγκεκριμένη χρήση!',
                cardName: 'Όνομα κάρτας',
                letsDoubleCheck: 'Ας ελέγξουμε διπλά ότι όλα φαίνονται σωστά.',
                willBeReadyToUse: 'Αυτή η κάρτα θα είναι έτοιμη για χρήση αμέσως.',
                willBeReadyToShip: 'Αυτή η κάρτα θα είναι έτοιμη για αποστολή άμεσα.',
                cardholder: 'Κάτοχος κάρτας',
                cardType: 'Τύπος κάρτας',
                limit: 'Όριο',
                limitType: 'Τύπος ορίου',
                disabledApprovalForSmartLimitError: 'Παρακαλούμε ενεργοποιήστε τις εγκρίσεις στο <strong>Ροές εργασιών > Προσθήκη εγκρίσεων</strong> πριν ρυθμίσετε έξυπνα όρια',
                singleUse: 'Μίας χρήσης',
                singleUseDescription: 'Λήγει μετά από μία συναλλαγή',
                validFrom: 'Έγκυρη από',
                startDate: 'Ημερομηνία έναρξης',
                endDate: 'Ημερομηνία λήξης',
                noExpirationHint: 'Μια κάρτα χωρίς ημερομηνία λήξης δεν θα λήξει',
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `Ισχύει από ${startDate} έως ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `${startDate} έως ${endDate}`,
                combineWithExpiration: 'Συνδυάστε με επιλογές λήξης για επιπλέον έλεγχο δαπανών',
                enterValidDate: 'Εισαγάγετε έγκυρη ημερομηνία',
                expirationDate: 'Ημερομηνία λήξης',
                limitAmount: 'Ποσό ορίου',
                setCardRules: 'Ορισμός κανόνων κάρτας',
                addSpendRule: 'Προσθήκη κανόνα δαπανών',
                addExpirationDate: 'Προσθήκη ημερομηνίας λήξης',
                addExpirationDateDescription: 'Αν δεν έχει οριστεί συγκεκριμένη ημερομηνία, η κάρτα θα λήξει με βάση την υπάρχουσα ημερομηνία λήξης της κάρτας',
                amount: 'Ποσό',
                copyExisting: 'Αντιγραφή υπάρχοντος',
                createNew: 'Δημιουργία νέου',
                spendRulesEmptyStateTitle: 'Δεν υπάρχουν κανόνες προς επιλογή',
                spendRulesEmptyStateSubtitle: 'Δεν υπάρχουν ακόμη κανόνες. Μπορείτε να δημιουργήσετε έναν από την προηγούμενη οθόνη.',
            },
            deactivateCardModal: {
                deactivate: 'Απενεργοποίηση',
                deactivateCard: 'Απενεργοποίηση κάρτας',
                deactivateConfirmation: 'Απενεργοποιώντας αυτήν την κάρτα, όλες οι μελλοντικές συναλλαγές θα απορρίπτονται και η ενέργεια δεν μπορεί να αναιρεθεί.',
            },
        },
        accounting: {
            settings: 'ρυθμίσεις',
            title: 'Συνδέσεις',
            subtitle: 'Συνδέστε το λογιστικό σας λογισμικό για αυτόματο συγχρονισμό.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            rillet: 'Rillet',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Συνομιλήστε με τον υπεύθυνο λογαριασμού σας.',
            talkYourAccountManager: 'Συνομιλήστε με τον υπεύθυνο λογαριασμού σας.',
            talkToConcierge: 'Συνομιλήστε με το Concierge.',
            needAnotherAccounting: 'Χρειάζεστε άλλο λογιστικό λογισμικό;',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return 'Sage Intacct';
                    case CONST.POLICY.CONNECTIONS.NAME.RILLET:
                        return 'Rillet';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `Προέκυψε σφάλμα με μια σύνδεση που έχει ρυθμιστεί στο Expensify Classic. [Μεταβείτε στο Expensify Classic για να διορθώσετε αυτό το ζήτημα.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Μεταβείτε στο Expensify Classic για να διαχειριστείτε τις ρυθμίσεις σας.',
            setup: 'Σύνδεση',
            lastSync: (relativeDate: string) => `Τελευταίος συγχρονισμός ${relativeDate}`,
            notSync: 'Δεν έχει γίνει συγχρονισμός',
            import: 'Εισαγωγή',
            export: 'Εξαγωγή',
            advanced: 'Για προχωρημένους',
            other: 'Άλλο',
            syncNow: 'Συγχρονισμός τώρα',
            disconnect: 'Αποσύνδεση',
            reinstall: 'Επανεγκατάσταση συνδέτη',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'ενσωμάτωση';
                return `Αποσύνδεση ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Συνδέστε ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'ενσωμάτωση λογιστικής'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Δεν είναι δυνατή η σύνδεση με το QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Αδυναμία σύνδεσης στο Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Δεν είναι δυνατή η σύνδεση με το NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Δεν είναι δυνατή η σύνδεση με το QuickBooks Desktop';
                    default: {
                        return 'Δεν είναι δυνατή η σύνδεση με την ενοποίηση';
                    }
                }
            },
            accounts: 'Λογιστικό σχέδιο',
            taxes: 'Φόροι',
            imported: 'Εισαγόμενα',
            notImported: 'Δεν έγινε εισαγωγή',
            importAsCategory: 'Εισήχθησαν ως κατηγορίες',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Εισαγόμενα',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Εισήχθησαν ως ετικέτες',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Εισαγόμενα',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Δεν έγινε εισαγωγή',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Δεν έγινε εισαγωγή',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Έγινε εισαγωγή ως πεδία αναφοράς',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Προεπιλογή εργαζομένου NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'αυτή η ενοποίηση';
                return `Είστε βέβαιοι ότι θέλετε να αποσυνδέσετε το ${integrationName};`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Είστε βέβαιοι ότι θέλετε να συνδέσετε το ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'αυτή την ενοποίηση λογιστικής'}; Αυτό θα αφαιρέσει τυχόν υπάρχουσες λογιστικές συνδέσεις.`,
            reconnect: 'Επανασύνδεση',
            enterCredentials: 'Εισαγάγετε τα διαπιστευτήριά σας',
            updateCredentials: 'Ενημέρωση διαπιστευτηρίων',
            claimOffer: {
                badgeText: 'Προσφορά διαθέσιμη!',
                xero: {
                    headline: 'Αποκτήστε το Xero δωρεάν για 6 μήνες!',
                    description:
                        '<muted-text><centered-text>Καινούργιος/α στο Xero; Οι πελάτες της Expensify έχουν 6 μήνες δωρεάν. Διεκδικήστε την προσφορά σας παρακάτω.</centered-text></muted-text>',
                    connectButton: 'Σύνδεση με Xero',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Κερδίστε 5% έκπτωση στις διαδρομές Uber',
                    description: `<muted-text><centered-text>Ενεργοποιήστε το Uber for Business μέσω του Expensify και εξοικονομήστε 5% σε όλες τις επαγγελματικές διαδρομές έως τον Ιούνιο. <a href="${CONST.UBER_TERMS_LINK}">Ισχύουν όροι.</a></centered-text></muted-text>`,
                    connectButton: 'Συνδέστε το Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Γίνεται εισαγωγή πελατών';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Εισαγωγή υπαλλήλων';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Εισαγωγή λογαριασμών';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Εισαγωγή κλάσεων';
                        case 'quickbooksOnlineImportLocations':
                            return 'Γίνεται εισαγωγή τοποθεσιών';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Γίνεται επεξεργασία των εισαγόμενων δεδομένων';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Συγχρονισμός αποζημιωμένων αναφορών και πληρωμών λογαριασμών';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Εισαγωγή κωδικών φόρου';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Γίνεται έλεγχος σύνδεσης με το QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Εισαγωγή δεδομένων από το QuickBooks Online';
                        case 'startingImportXero':
                            return 'Εισαγωγή δεδομένων Xero';
                        case 'startingImportQBO':
                            return 'Εισαγωγή δεδομένων από το QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Εισαγωγή δεδομένων από το QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Εισαγωγή τίτλου';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Εισαγωγή πιστοποιητικού έγκρισης';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Γίνεται εισαγωγή διαστάσεων';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Γίνεται εισαγωγή πολιτικής αποθήκευσης';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Συνεχίζεται ο συγχρονισμός δεδομένων με το QuickBooks... Βεβαιωθείτε ότι το Web Connector εκτελείται';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Συγχρονισμός δεδομένων QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Φόρτωση δεδομένων';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Ενημέρωση κατηγοριών';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Ενημέρωση πελατών/έργων';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Ενημέρωση λίστας ατόμων';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Ενημέρωση πεδίων αναφοράς';
                        case 'jobDone':
                            return 'Αναμονή για τη φόρτωση των εισαγόμενων δεδομένων';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Γίνεται συγχρονισμός του λογιστικού σχεδίου';
                        case 'xeroSyncImportCategories':
                            return 'Γίνεται συγχρονισμός κατηγοριών';
                        case 'xeroSyncImportCustomers':
                            return 'Γίνεται συγχρονισμός πελατών';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Σήμανση αναφορών Expensify ως αποζημιωμένων';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Σήμανση των Xero λογαριασμών και τιμολογίων ως εξοφλημένων';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Γίνεται συγχρονισμός κατηγοριών παρακολούθησης';
                        case 'xeroSyncImportBankAccounts':
                            return 'Συγχρονισμός τραπεζικών λογαριασμών';
                        case 'xeroSyncImportTaxRates':
                            return 'Γίνεται συγχρονισμός φορολογικών συντελεστών';
                        case 'xeroCheckConnection':
                            return 'Έλεγχος σύνδεσης με το Xero';
                        case 'xeroSyncTitle':
                            return 'Συγχρονισμός δεδομένων Xero';
                        case 'netSuiteSyncConnection':
                            return 'Γίνεται αρχικοποίηση σύνδεσης με το NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Γίνεται εισαγωγή πελατών';
                        case 'netSuiteSyncInitData':
                            return 'Γίνεται λήψη δεδομένων από το NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Εισαγωγή φόρων';
                        case 'netSuiteSyncImportItems':
                            return 'Εισαγωγή στοιχείων';
                        case 'netSuiteSyncData':
                            return 'Εισαγωγή δεδομένων στο Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Συγχρονισμός λογαριασμών';
                        case 'netSuiteSyncCurrencies':
                            return 'Γίνεται συγχρονισμός νομισμάτων';
                        case 'netSuiteSyncCategories':
                            return 'Γίνεται συγχρονισμός κατηγοριών';
                        case 'netSuiteSyncReportFields':
                            return 'Εισαγωγή δεδομένων ως πεδία αναφοράς Expensify';
                        case 'netSuiteSyncTags':
                            return 'Εισαγωγή δεδομένων ως ετικέτες Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Ενημέρωση στοιχείων σύνδεσης';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Σήμανση αναφορών Expensify ως αποζημιωμένων';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Σήμανση λογαριασμών και τιμολογίων NetSuite ως εξοφλημένων';
                        case 'netSuiteImportVendorsTitle':
                            return 'Εισαγωγή προμηθευτών';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Εισαγωγή προσαρμοσμένων λιστών';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Εισαγωγή προσαρμοσμένων λιστών';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Εισαγωγή θυγατρικών';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Εισαγωγή προμηθευτών';
                        case 'intacctCheckConnection':
                            return 'Έλεγχος σύνδεσης με το Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Εισαγωγή διαστάσεων Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Εισαγωγή δεδομένων Sage Intacct';
                        case 'financialForceSyncTitle':
                            return 'Συγχρονισμός δεδομένων Certinia';
                        case 'financialForceSyncStep':
                            return 'Γίνεται συγχρονισμός της σύνδεσης Certinia';
                        case 'financialForceSyncCategories':
                            return 'Γίνεται εισαγωγή κατηγοριών';
                        case 'financialForceSyncTags':
                            return 'Γίνεται εισαγωγή ετικετών';
                        case 'financialForceSyncVendors':
                            return 'Εισαγωγή προμηθευτών';
                        case 'financialForceSyncContacts':
                            return 'Γίνεται εισαγωγή επαφών';
                        case 'financialForceSyncCompanies':
                            return 'Εισαγωγή εταιρειών';
                        case 'financialForceSyncUsers':
                            return 'Εισαγωγή χρηστών';
                        case 'financialForceSyncDimensions':
                            return 'Γίνεται εισαγωγή διαστάσεων';
                        case 'financialForceMarkAsReimbursed':
                            return 'Σήμανση αναφορών ως αποζημιωμένων';
                        case 'rilletSyncTitle':
                            return 'Συγχρονισμός δεδομένων Rillet';
                        case 'rilletSyncConnection':
                            return 'Γίνεται αρχικοποίηση σύνδεσης με το Rillet';
                        case 'rilletSyncImportData':
                            return 'Φόρτωση δεδομένων';
                        default: {
                            return `Λείπει μετάφραση για το στάδιο: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Προτιμώμενος εξαγωγέας',
            exportPreferredExporterNote:
                'Ο προτιμώμενος εξαγωγέας μπορεί να είναι οποιοσδήποτε διαχειριστής χώρου εργασίας, αλλά πρέπει επίσης να είναι διαχειριστής τομέα αν ορίσετε διαφορετικούς λογαριασμούς εξαγωγής για μεμονωμένες εταιρικές κάρτες στις ρυθμίσεις τομέα.',
            exportPreferredExporterSubNote: 'Αφού οριστεί, ο προτιμώμενος εξαγωγέας θα βλέπει τις αναφορές προς εξαγωγή στον λογαριασμό του.',
            exportAs: 'Εξαγωγή ως',
            exportOutOfPocket: 'Εξαγωγή προσωπικών δαπανών ως',
            exportCompanyCard: 'Εξαγωγή εταιρικών δαπανών κάρτας ως',
            exportDate: 'Ημερομηνία εξαγωγής',
            defaultVendor: 'Προεπιλεγμένος προμηθευτής',
            defaultAccount: 'Προεπιλεγμένος λογαριασμός',
            autoSync: 'Αυτόματος συγχρονισμός',
            autoSyncDescription: 'Συγχρονίστε αυτόματα το NetSuite και το Expensify, κάθε μέρα. Εξαγάγετε την οριστικοποιημένη αναφορά σε πραγματικό χρόνο',
            reimbursedReports: 'Συγχρονισμός αποζημιωμένων αναφορών',
            cardReconciliation: 'Συμφωνία κάρτας',
            reconciliationAccount: 'Λογαριασμός συμφιλίωσης',
            continuousReconciliation: 'Συνεχής συμφωνία',
            syncTravelInvoicingSettlements: 'Συγχρονισμός διακανονισμών ενοποιημένης χρέωσης ταξιδιών',
            saveHoursOnReconciliation:
                'Εξοικονομήστε ώρες σε κάθε λογιστική περίοδο στην συμφωνία λογαριασμών, αφήνοντας το Expensify να συμφωνίζει συνεχώς για εσάς τις καταστάσεις και τους διακανονισμούς της Κάρτας Expensify.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Για να ενεργοποιήσετε την αυτόματη συμφωνία, ενεργοποιήστε την <a href="${accountingAdvancedSettingsLink}">αυτόματη συγχρονισμό</a> για το ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Επιλέξτε τον τραπεζικό λογαριασμό με τον οποίο θα συμφωνούνται οι πληρωμές της Κάρτας Expensify.',
                chooseTravelInvoicingBankAccount: 'Επιλέξτε τον τραπεζικό λογαριασμό με τον οποίο θα συμφωνούνται οι πληρωμές της ενοποιημένης χρέωσης ταξιδιού σας.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `Βεβαιωθείτε ότι αυτός ο λογαριασμός ταιριάζει με τον <a href="${settlementAccountUrl}">λογαριασμό εκκαθάρισης της Κάρτας Expensify</a> (που λήγει σε ${lastFourPAN}), ώστε η συνεχής συμφωνία να λειτουργεί σωστά.`,
                travelInvoicingSettlementAccountReconciliation: (lastFourPAN: string) =>
                    `Βεβαιωθείτε ότι αυτός ο λογαριασμός ταιριάζει με τον λογαριασμό διακανονισμού για τη συγκεντρωτική χρέωση ταξιδιών (καταλήγει σε ${lastFourPAN}) ώστε η συνεχής συμφωνία να λειτουργεί σωστά.`,
            },
        },
        hr: {
            title: 'HR',
            connections: 'Συνδέσεις',
            connectionsSubtitle:
                'Συνδεθείτε με το σύστημα HR σας για να συγχρονίζετε τα στοιχεία των εργαζομένων, να αντιστοιχίζετε αυτόματα τις αποζημιώσεις στα σωστά άτομα και να διατηρείτε τα έξοδα της ομάδας σας ακριβή χωρίς χειροκίνητη εργασία.',
            subtitle: 'Συνδέστε εργαλεία HR και διατηρήστε τις εγκρίσεις εργαζομένων συγχρονισμένες.',
            connect: 'Σύνδεση',
            syncNow: 'Συγχρονισμός τώρα',
            disconnect: 'Αποσύνδεση',
            disconnectTitle: (providerName: string) => `Αποσύνδεση ${providerName}`,
            disconnectPrompt: (providerName: string) => `Είστε βέβαιοι ότι θέλετε να αποσυνδέσετε το ${providerName};`,
            alreadyConnectedTitle: 'Δεν είναι δυνατή η σύνδεση σε πολλές πλατφόρμες HR',
            alreadyConnectedPrompt: 'Πρέπει να αποσυνδέσετε την τρέχουσα πλατφόρμα HR προτού συνδέσετε μια άλλη.',
            lastSync: (relativeDate: string) => `Τελευταίος συγχρονισμός ${relativeDate}`,
            notSync: 'Δεν έχει γίνει συγχρονισμός',
            syncError: (providerName: string) => `Δεν είναι δυνατή η σύνδεση με το ${providerName}`,
            authenticationError: (providerName: string) => `Δεν είναι δυνατή η σύνδεση με το ${providerName} λόγω ληγμένης σύνδεσης.`,
            reconnect: 'Επανασύνδεση',
            reconnectLink: 'Επανασυνδεθείτε.',
            connectionDescription: (providerName: string) => `Συνδέστε το ${providerName} για να διατηρείτε τις εγκρίσεις εργαζομένων συγχρονισμένες με τον χώρο εργασίας σας.`,
            approvalMode: 'Λειτουργία έγκρισης',
            providerApprovalMode: (providerName: string) => `λειτουργία έγκρισης ${providerName}`,
            finalApprover: 'Τελικός εγκρίνων',
            providerFinalApprover: (providerName: string) => `τελικός εγκριτής ${providerName}`,
            notSet: 'Δεν έχει οριστεί',
            syncing: 'Γίνεται συγχρονισμός υπαλλήλων',
            syncingModalTitle: 'Η σύνδεσή σας συγχρονίζεται',
            syncingModalDescription: 'Η πρώτη σύνδεση μπορεί να πάρει λίγο χρόνο. Θα ενημερωθείτε για τυχόν σφάλματα.',
            approvalModeDescription: (providerName: string) => `Τα μέλη και οι υπεύθυνοι έχουν ρυθμιστεί ώστε να συγχρονίζονται με το ${providerName}.`,
            approvalModeWarningTitle: 'Αλλαγή λειτουργίας έγκρισης;',
            approvalModeWarningPrompt: (providerName: string, helpSiteURL: string) =>
                `Είστε βέβαιοι ότι θέλετε να αλλάξετε τη λειτουργία έγκρισης για αυτόν τον χώρο εργασίας; Μάθετε περισσότερα σχετικά με τις διαφορετικές λειτουργίες ροής εργασιών με ενεργοποιημένο το ${providerName} στον <a href="${helpSiteURL}">ιστότοπο βοήθειας</a> μας.`,
            approvalModeWarningConfirm: 'Αλλαγή λειτουργίας έγκρισης',
            approvalModes: {
                basic: {label: 'Βασική έγκριση', description: 'Όλοι οι χρήστες υποβάλλουν σε ένα μόνο άτομο για επεξεργασία και έγκριση.'},
                manager: {
                    label: 'Έγκριση προϊσταμένου',
                    description: (providerName: string) => `Οι υπάλληλοι υποβάλλουν αναφορές στον άμεσο προϊστάμενό τους που έχει ρυθμιστεί στο ${providerName}.`,
                },
                custom: {label: 'Προσαρμοσμένη έγκριση', description: 'Θα ρυθμίσω χειροκίνητα ροές έγκρισης στο Expensify.'},
            },
            syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                switch (stage) {
                    case 'gustoSyncTitle':
                        return 'Συγχρονισμός εργαζομένων Gusto';
                    case 'gustoSyncLoadData':
                        return 'Φόρτωση δεδομένων από το Gusto';
                    case 'gustoSyncProvisioning':
                        return 'Παροχή υπαλλήλων στην πολιτική';
                    case 'zenefitsSyncTitle':
                        return 'Συγχρονισμός υπαλλήλων TriNet';
                    case 'zenefitsSyncLoadData':
                        return 'Φόρτωση δεδομένων από το TriNet';
                    case 'zenefitsSyncProvisioning':
                        return 'Παροχή υπαλλήλων στην πολιτική';
                    case 'jobDone':
                        return 'Αναμονή για τη φόρτωση των εισαγόμενων δεδομένων';
                    default: {
                        return `Λείπει μετάφραση για το στάδιο: ${stage}`;
                    }
                }
            },
            syncResults: {
                title: (provider: string) => `Η συγχρονισμός με το ${provider} ολοκληρώθηκε`,
                successTitle: (provider: string) => `Ο συγχρονισμός της σύνδεσής σας με το ${provider} ολοκληρώθηκε με επιτυχία!`,
                added: 'Προστέθηκε',
                removed: 'Αφαιρέθηκε',
                skipped: 'Παραλείφθηκε',
                employeeCount: () => ({
                    one: '1 υπάλληλος',
                    other: (count: number) => `${count} υπάλληλοι`,
                }),
            },
            gusto: {
                title: 'Gusto',
            },
            zenefits: {
                title: 'TriNet',
            },
            mergeHR: {
                completeSetup: 'Ολοκληρώστε τη ρύθμιση',
                setupIncomplete: (setupLink: string | undefined) =>
                    `<muted-text-label>Συνδέθηκε. ${setupLink ? `<a href="${setupLink}">Ολοκλήρωση ρύθμισης</a>` : 'Ολοκληρώστε τη ρύθμιση'} για εισαγωγή υπαλλήλων.</muted-text-label>`,
                groups: {
                    title: 'Ομάδες',
                    description: 'Επιλέξτε τις ομάδες υπαλλήλων που θέλετε να συγχρονίσετε με αυτόν τον χώρο εργασίας',
                },
            },
        },
        export: {
            notReadyHeading: 'Μη έτοιμο για εξαγωγή',
            notReadyDescription:
                'Οι πρόχειρες ή σε εκκρεμότητα αναφορές εξόδων δεν μπορούν να εξαχθούν στο λογιστικό σύστημα. Παρακαλούμε εγκρίνετε ή εξοφλήστε αυτές τις δαπάνες πριν τις εξαγάγετε.',
        },
        invoices: {
            sendInvoice: 'Αποστολή τιμολογίου',
            sendFrom: 'Αποστολή από',
            invoicingDetails: 'Στοιχεία τιμολόγησης',
            invoicingDetailsDescription: 'Αυτές οι πληροφορίες θα εμφανίζονται στα τιμολόγιά σας.',
            companyName: 'Όνομα εταιρείας',
            companyWebsite: 'Ιστοσελίδα εταιρείας',
            paymentMethods: {
                personal: 'Προσωπικό',
                business: 'Επιχείρηση',
                chooseInvoiceMethod: 'Επιλέξτε έναν τρόπο πληρωμής παρακάτω:',
                payingAsIndividual: 'Πληρωμή ως ιδιώτης',
                payingAsBusiness: 'Πληρωμή ως επιχείρηση',
            },
            invoiceBalance: 'Υπόλοιπο τιμολογίου',
            invoiceBalanceSubtitle:
                'Αυτό είναι το τρέχον υπόλοιπό σας από την είσπραξη πληρωμών τιμολογίων. Θα μεταφερθεί αυτόματα στον τραπεζικό σας λογαριασμό, εφόσον έχετε προσθέσει έναν.',
            bankAccountsSubtitle: 'Προσθέστε έναν τραπεζικό λογαριασμό για να κάνετε και να λαμβάνετε πληρωμές τιμολογίων.',
        },
        invite: {
            member: 'Πρόσκληση μέλους',
            members: 'Προσκαλέστε μέλη',
            invitePeople: 'Προσκαλέστε νέα μέλη',
            genericFailureMessage: 'Προέκυψε σφάλμα κατά την πρόσκληση του μέλους στον χώρο εργασίας. Παρακαλούμε δοκιμάστε ξανά.',
            pleaseEnterValidLogin: `Βεβαιωθείτε ότι το email ή ο αριθμός τηλεφώνου είναι έγκυρος (π.χ. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'χρήστης',
            users: 'χρήστες',
            invited: 'προσκαλέστηκε',
            removed: 'καταργήθηκε',
            to: 'σε',
            from: 'από',
        },
        inviteMessage: {
            confirmDetails: 'Επιβεβαιώστε τα στοιχεία',
            inviteMessagePrompt: 'Κάντε την πρόσκλησή σας ακόμα πιο ξεχωριστή προσθέτοντας ένα μήνυμα παρακάτω!',
            personalMessagePrompt: 'Μήνυμα',
            genericFailureMessage: 'Προέκυψε σφάλμα κατά την πρόσκληση του μέλους στον χώρο εργασίας. Παρακαλούμε δοκιμάστε ξανά.',
            inviteNoMembersError: 'Παρακαλούμε επιλέξτε τουλάχιστον ένα μέλος για πρόσκληση',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `Ο/Η ${user} ζήτησε να συμμετάσχει στο ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ουπς! Όχι τόσο γρήγορα...',
            workspaceNeeds: 'Ένας χώρος εργασίας χρειάζεται τουλάχιστον έναν ενεργοποιημένο συντελεστή απόστασης.',
            commuterExclusions: {
                title: 'Εξαίρεση μετακινήσεων από και προς την εργασία',
                summaryDisabled: 'Χωρίς εξαίρεση μετακίνησης',
                summaryFixedDistance: ({distance, unit}: {distance: number; unit: string}) => `Εξαίρεση ${distance} ${unit} ανά αίτημα`,
                optionDisabledTitle: 'Να μην εξαιρούνται οι μετακινήσεις από και προς την εργασία',
                optionDisabledHelp: 'Δεν εφαρμόζεται καμία εξαίρεση μετακίνησης.',
                optionFixedDistanceTitle: 'Εξαίρεση σταθερής απόστασης ανά αίτημα',
                optionFixedDistanceHelp: 'Αφαιρέστε την ίδια απόσταση μετακίνησης από κάθε αίτημα. Ιδανικό για μέλη που υποβάλλουν ένα αίτημα ανά εργάσιμη ημέρα.',
                distanceLabel: 'Απόσταση',
                errors: {
                    distanceMustBePositive: 'Η απόσταση πρέπει να είναι ένας θετικός ακέραιος αριθμός.',
                },
            },
            distance: 'Απόσταση',
            centrallyManage: 'Διαχειριστείτε κεντρικά τις χρεώσεις, παρακολουθήστε σε μίλια ή χιλιόμετρα και ορίστε μια προεπιλεγμένη κατηγορία.',
            emptyRates: {
                title: 'Δεν υπάρχουν ακόμη χρεώσεις απόστασης',
                subtitle: 'Προσθέστε ένα συντελεστή για αποζημίωση χιλιομέτρων με προσαρμοσμένα ποσά.',
            },
            rate: 'Βαθμός',
            addRate: 'Προσθέστε τιμή',
            findRate: 'Εύρεση τιμής',
            trackTax: 'Παρακολούθηση φόρου',
            deleteRates: () => ({
                one: 'Διαγραφή τιμής',
                other: 'Διαγραφή τιμών',
            }),
            enableRates: () => ({
                one: 'Ενεργοποίηση επιτοκίου',
                other: 'Ενεργοποίηση τιμών',
            }),
            disableRates: () => ({
                one: 'Απενεργοποίηση ποσοστού',
                other: 'Απενεργοποίηση τιμών',
            }),
            enableRate: 'Ενεργοποίηση επιτοκίου',
            status: 'Κατάσταση',
            statusActive: 'Ενεργό',
            statusFuture: 'Μέλλον',
            statusExpired: 'Έληξε',
            statusInactive: 'Ανενεργό',
            unit: 'Μονάδα',
            taxFeatureNotEnabledMessage:
                '<muted-text>Πρέπει να είναι ενεργοποιημένοι οι φόροι στο χώρο εργασίας για να χρησιμοποιήσετε αυτή τη λειτουργία. Μεταβείτε στο <a href="#">Περισσότερες δυνατότητες</a> για να κάνετε αυτήν την αλλαγή.</muted-text>',
            deleteDistanceRate: 'Διαγραφή χρέωσης απόστασης',
            areYouSureDelete: () => ({
                one: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την τιμή;',
                other: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτές τις χρεώσεις;',
            }),
            amountPerUnit: (unit: string) => `Ποσό ανά ${unit}`,
            startDate: 'Ημερομηνία έναρξης',
            endDate: 'Ημερομηνία λήξης',
            errors: {
                rateNameRequired: 'Απαιτείται όνομα τιμής',
                existingRateName: 'Υπάρχει ήδη ένα τιμολόγιο απόστασης με αυτό το όνομα',
                nameRequired: 'Το όνομα είναι υποχρεωτικό',
                amountRequired: 'Το ποσό είναι υποχρεωτικό',
                startDateMustBeBeforeEndDate: 'Η ημερομηνία έναρξης πρέπει να είναι πριν από την ημερομηνία λήξης',
            },
        },
        editor: {
            descriptionInputLabel: 'Περιγραφή',
            nameInputLabel: 'Όνομα',
            typeInputLabel: 'Τύπος',
            initialValueInputLabel: 'Αρχική τιμή',
            nameInputHelpText: 'Αυτό είναι το όνομα που θα βλέπετε στον χώρο εργασίας σας.',
            nameIsRequiredError: 'Θα χρειαστεί να δώσετε ένα όνομα στον χώρο εργασίας σας',
            currencyInputLabel: 'Προεπιλεγμένο νόμισμα',
            currencyInputHelpText: 'Όλες οι δαπάνες σε αυτόν τον χώρο εργασίας θα μετατρέπονται σε αυτό το νόμισμα.',
            currencyInputDisabledText: (currency: string) =>
                `Το προεπιλεγμένο νόμισμα δεν μπορεί να αλλάξει επειδή αυτός ο χώρος εργασίας είναι συνδεδεμένος με τραπεζικό λογαριασμό σε ${currency}.`,
            save: 'Αποθήκευση',
            genericFailureMessage: 'Προέκυψε σφάλμα κατά την ενημέρωση του χώρου εργασίας. Παρακαλούμε δοκιμάστε ξανά.',
            avatarUploadFailureMessage: 'Παρουσιάστηκε σφάλμα κατά τη μεταφόρτωση του avatar. Παρακαλούμε δοκιμάστε ξανά.',
            addressContext:
                'Απαιτείται μια διεύθυνση χώρου εργασίας για να ενεργοποιήσετε το Expensify Travel. Παρακαλούμε εισαγάγετε μια διεύθυνση που να σχετίζεται με την επιχείρησή σας.',
            policy: 'Πολιτική εξόδων',
        },
        bankAccount: {
            continueWithSetup: 'Συνεχίστε τη ρύθμιση',
            youAreAlmostDone:
                'Έχετε σχεδόν ολοκληρώσει τη ρύθμιση του τραπεζικού σας λογαριασμού, που θα σας επιτρέψει να εκδίδετε εταιρικές κάρτες, να αποζημιώνετε έξοδα, να εισπράττετε τιμολόγια και να πληρώνετε λογαριασμούς.',
            streamlinePayments: 'Εξορθολογήστε τις πληρωμές',
            connectBankAccountNote: 'Σημείωση: προσωπικοί τραπεζικοί λογαριασμοί δεν μπορούν να χρησιμοποιηθούν για πληρωμές σε χώρους εργασίας.',
            oneMoreThing: 'Και κάτι ακόμη!',
            allSet: 'Είστε έτοιμοι!',
            accountDescriptionWithCards:
                'Αυτός ο τραπεζικός λογαριασμός θα χρησιμοποιείται για την έκδοση εταιρικών καρτών, την αποζημίωση εξόδων, την είσπραξη τιμολογίων και την πληρωμή λογαριασμών.',
            letsFinishInChat: 'Ας ολοκληρώσουμε στη συνομιλία!',
            finishInChat: 'Ολοκληρώστε στη συνομιλία',
            almostDone: 'Σχεδόν τελειώσατε!',
            disconnectBankAccount: 'Αποσύνδεση τραπεζικού λογαριασμού',
            startOver: 'Ξεκινήστε από την αρχή',
            updateDetails: 'Ενημέρωση στοιχείων',
            yesDisconnectMyBankAccount: 'Ναι, αποσυνδέστε τον τραπεζικό μου λογαριασμό',
            yesStartOver: 'Ναι, ξεκινήστε από την αρχή',
            disconnectYourBankAccount: (bankName: string) =>
                `Αποσυνδέστε τον τραπεζικό σας λογαριασμό <strong>${bankName}</strong>. Οποιεσδήποτε εκκρεμείς συναλλαγές για αυτόν τον λογαριασμό θα ολοκληρωθούν κανονικά.`,
            clearProgress: 'Η επανεκκίνηση θα διαγράψει την πρόοδο που έχετε κάνει μέχρι τώρα.',
            areYouSure: 'Είστε σίγουροι;',
            workspaceCurrency: 'Νόμισμα χώρου εργασίας',
            updateCurrencyPrompt:
                'Φαίνεται ότι ο χώρος εργασίας σας είναι αυτήν τη στιγμή ρυθμισμένος σε διαφορετικό νόμισμα από το USD. Παρακαλούμε κάντε κλικ στο παρακάτω κουμπί για να ενημερώσετε τώρα το νόμισμά σας σε USD.',
            updateToUSD: 'Ενημέρωση σε USD',
            updateWorkspaceCurrency: 'Ενημέρωση νομίσματος χώρου εργασίας',
            workspaceCurrencyNotSupported: 'Το νόμισμα του χώρου εργασίας δεν υποστηρίζεται',
            yourWorkspace: `Ο χώρος εργασίας σας έχει οριστεί σε μη υποστηριζόμενο νόμισμα. Δείτε τη <a href="${CONST.ENABLE_GLOBAL_REIMBURSEMENT_HELP_URL}">λίστα με τα υποστηριζόμενα νομίσματα</a>.`,
            chooseAnExisting: 'Επιλέξτε έναν υπάρχοντα τραπεζικό λογαριασμό για να πληρώσετε έξοδα ή προσθέστε έναν νέο.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Μεταφορά ιδιοκτήτη',
            addPaymentCardTitle: 'Εισαγάγετε την κάρτα πληρωμής σας για να μεταφέρετε την κυριότητα',
            addPaymentCardButtonText: 'Αποδοχή όρων και προσθήκη κάρτας πληρωμής',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Διαβάστε και αποδεχτείτε τους <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">όρους</a> και την <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">πολιτική απορρήτου</a> για να προσθέσετε την κάρτα σας.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'σύμφωνο με το πρότυπο PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Κρυπτογράφηση επιπέδου τράπεζας',
            addPaymentCardRedundant: 'Πλεονάζουσα υποδομή',
            addPaymentCardLearnMore: `<muted-text>Μάθετε περισσότερα για την <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">ασφάλειά μας</a>.</muted-text>`,
            amountOwedTitle: 'Εκκρεμής οφειλή',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Αυτός ο λογαριασμός έχει ανεξόφλητο υπόλοιπο από προηγούμενο μήνα.\n\nΘέλετε να εξοφλήσετε το υπόλοιπο και να αναλάβετε τη χρέωση αυτού του χώρου εργασίας;',
            ownerOwesAmountTitle: 'Εκκρεμής οφειλή',
            ownerOwesAmountButtonText: 'Μεταφορά υπολοίπου',
            ownerOwesAmountText: (email: string, amount: string) => `Ο λογαριασμός που είναι κάτοχος αυτού του χώρου εργασίας (${email}) έχει ανεξόφλητο υπόλοιπο από προηγούμενο μήνα.

Θέλετε να μεταφέρετε αυτό το ποσό (${amount}) για να αναλάβετε τη χρέωση για αυτόν τον χώρο εργασίας; Η κάρτα πληρωμής σας θα χρεωθεί άμεσα.`,
            subscriptionTitle: 'Αναλάβετε την ετήσια συνδρομή',
            subscriptionButtonText: 'Μεταφορά συνδρομής',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Αναλαμβάνοντας αυτόν τον χώρο εργασίας, η ετήσια συνδρομή του θα συγχωνευτεί με την τρέχουσα συνδρομή σας. Αυτό θα αυξήσει το μέγεθος της συνδρομής σας κατά ${usersCount} μέλη, με αποτέλεσμα το νέο μέγεθος της συνδρομής σας να είναι ${finalCount}. Θέλετε να συνεχίσετε;`,
            duplicateSubscriptionTitle: 'Ειδοποίηση διπλής συνδρομής',
            duplicateSubscriptionButtonText: 'Συνέχεια',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Φαίνεται πως προσπαθείτε να αναλάβετε τη χρέωση για τους χώρους εργασίας του/της ${email}, αλλά για να το κάνετε αυτό, πρέπει πρώτα να είστε διαχειριστής/διαχειρίστρια σε όλους τους χώρους εργασίας τους.

Κάντε κλικ στο «Συνέχεια» αν θέλετε μόνο να αναλάβετε τη χρέωση για τον χώρο εργασίας ${workspaceName}.

Αν θέλετε να αναλάβετε τη χρέωση για ολόκληρη τη συνδρομή τους, ζητήστε τους πρώτα να σας προσθέσουν ως διαχειριστή/διαχειρίστρια σε όλους τους χώρους εργασίας τους, πριν αναλάβετε τη χρέωση.`,
            hasFailedSettlementsTitle: 'Δεν είναι δυνατή η μεταφορά κυριότητας',
            hasFailedSettlementsButtonText: 'Εντάξει',
            hasFailedSettlementsText: (email: string) =>
                `Δεν μπορείτε να αναλάβετε τη χρέωση, επειδή ο/η ${email} έχει μία ληξιπρόθεσμη εκκρεμότητα εκκαθάρισης στην Κάρτα Expensify. Παρακαλούμε ζητήστε του/της να επικοινωνήσει με το concierge@expensify.com για να επιλύσει το ζήτημα. Στη συνέχεια, θα μπορείτε να αναλάβετε τη χρέωση για αυτόν τον χώρο εργασίας.`,
            failedToClearBalanceTitle: 'Αποτυχία εκκαθάρισης υπολοίπου',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Δεν ήταν δυνατό να εκκαθαριστεί το υπόλοιπο. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
            successTitle: 'Τέλεια! Όλα έτοιμα.',
            successDescription: 'Είστε πλέον ο ιδιοκτήτης αυτού του χώρου εργασίας.',
            errorTitle: 'Ουπς! Όχι τόσο γρήγορα...',
            errorDescription: `<muted-text><centered-text>Παρουσιάστηκε πρόβλημα κατά τη μεταφορά της ιδιοκτησίας αυτού του χώρου εργασίας. Δοκιμάστε ξανά ή <concierge-link>επικοινωνήστε με το Concierge</concierge-link> για βοήθεια.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Προσοχή!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Οι παρακάτω αναφορές έχουν ήδη εξαχθεί στο ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}. Είστε βέβαιοι ότι θέλετε να τις εξαγάγετε ξανά;

${reportName}`,
            confirmText: 'Ναι, εξαγωγή ξανά',
            cancelText: 'Άκυρο',
        },
        upgrade: {
            reportFields: {
                title: 'Πεδία αναφοράς',
                description: `Τα πεδία αναφοράς σάς επιτρέπουν να ορίζετε λεπτομέρειες σε επίπεδο κεφαλίδας, διαφορετικές από τις ετικέτες που αφορούν έξοδα σε μεμονωμένες γραμμές. Αυτές οι λεπτομέρειες μπορούν να περιλαμβάνουν συγκεκριμένα ονόματα έργων, πληροφορίες επαγγελματικών ταξιδιών, τοποθεσίες και άλλα.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Τα πεδία αναφοράς είναι διαθέσιμα μόνο στο πλάνο Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Απολαύστε αυτόματο συγχρονισμό και μειώστε τις χειροκίνητες καταχωρίσεις με την ενοποίηση Expensify + NetSuite. Αποκτήστε σε βάθος, σε πραγματικό χρόνο οικονομικές πληροφορίες με υποστήριξη ενσωματωμένων και προσαρμοσμένων τμημάτων, συμπεριλαμβανομένης της αντιστοίχισης έργων και πελατών.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η ενσωμάτωσή μας με το NetSuite είναι διαθέσιμη μόνο στο πλάνο Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Απολαύστε τον αυτοματοποιημένο συγχρονισμό και μειώστε τις χειροκίνητες καταχωρήσεις με την ενοποίηση Expensify + Sage Intacct. Αποκτήστε σε βάθος, σε πραγματικό χρόνο, οικονομικές πληροφορίες με καθοριζόμενες από τον χρήστη διαστάσεις, καθώς και κωδικοποίηση εξόδων ανά τμήμα, κατηγορία, τοποθεσία, πελάτη και έργο (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η ενσωμάτωσή μας με το Sage Intacct είναι διαθέσιμη μόνο στο πλάνο Control, από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Απολαύστε τον αυτοματοποιημένο συγχρονισμό και μειώστε τις χειροκίνητες καταχωρήσεις με την ενοποίηση Expensify + QuickBooks Desktop. Πετύχετε μέγιστη αποδοτικότητα με μια αμφίδρομη, σε πραγματικό χρόνο σύνδεση και κωδικοποίηση εξόδων κατά κλάση, είδος, πελάτη και έργο.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η ενσωμάτωσή μας με το QuickBooks Desktop είναι διαθέσιμη μόνο στο πρόγραμμα Control, που ξεκινά από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                title: 'Certinia',
                description: `Απολαύστε αυτόματο συγχρονισμό και μειώστε τις χειροκίνητες καταχωρίσεις με την ενσωμάτωση Expensify + Certinia. Ευθυγραμμίστε τις διαστάσεις κωδικοποίησης εξόδων και τον συγχρονισμό φόρων με τη ρύθμιση Certinia σας για πιο ξεκάθαρη οικονομική εικόνα.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η ενσωμάτωσή μας με το Certinia είναι διαθέσιμη μόνο στο πρόγραμμα Control, με τιμή που ξεκινά από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.RILLET]: {
                title: 'Rillet',
                description: `Απολαύστε τον αυτόματο συγχρονισμό και μειώστε τις χειροκίνητες εγγραφές με την ενσωμάτωση Expensify + Rillet. Ευθυγραμμίστε τις διαστάσεις κωδικοποίησης εξόδων και τον συγχρονισμό φόρων με τη ρύθμιση Rillet για πιο ξεκάθαρη οικονομική εικόνα.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η ενοποίησή μας με το Rillet είναι διαθέσιμη μόνο στο πρόγραμμα Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Προηγμένες εγκρίσεις',
                description: `Αν θέλετε να προσθέσετε περισσότερα επίπεδα έγκρισης στη διαδικασία – ή απλώς να βεβαιωθείτε ότι οι μεγαλύτερες δαπάνες ελέγχονται από ένα ακόμη άτομο – σας καλύπτουμε. Οι προηγμένες εγκρίσεις σάς βοηθούν να θέσετε τους κατάλληλους ελέγχους σε κάθε επίπεδο, ώστε να κρατάτε τις δαπάνες της ομάδας σας υπό έλεγχο.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι προηγμένες εγκρίσεις είναι διαθέσιμες μόνο στο πρόγραμμα Control, το οποίο ξεκινά από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            approvalSubmit: {
                title: 'Εγκρίσεις',
                description: 'Ρυθμίστε κεντρικά σε ποιον υποβάλλουν όλοι οι συμμετέχοντες, ενεργοποιώντας τις εγκρίσεις.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι εγκρίσεις είναι διαθέσιμες στα προγράμματα Collect και Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            approvalSubmitReport: {
                title: 'Έγκριση αναφορών',
                description:
                    'Ελέγξτε, εγκρίνετε και διατηρήστε τις δαπάνες σε τάξη, όλα σε ένα μέρος. Οι ροές έγκρισης σάς βοηθούν να ελέγχετε το κόστος, να εφαρμόζετε τις εταιρικές πολιτικές και να αποζημιώνετε τους υπαλλήλους σας πιο γρήγορα.',
                onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
                    `<muted-text>Οι ροές εργασιών έγκρισης είναι διαθέσιμες μόνο στο πρόγραμμα Collect, ξεκινώντας από <strong>${formattedPrice}</strong> ανά ενεργό μέλος τον μήνα.</muted-text>`,
            },
            categories: {
                title: 'Κατηγορίες',
                description: 'Οι κατηγορίες σάς επιτρέπουν να παρακολουθείτε και να οργανώνετε τις δαπάνες. Χρησιμοποιήστε τις προεπιλεγμένες κατηγορίες μας ή προσθέστε τις δικές σας.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι κατηγορίες είναι διαθέσιμες στο πλάνο Collect, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            glCodes: {
                title: 'κωδικοί Γενικής Λογιστικής',
                description: `Προσθέστε κωδικούς Γενικής Λογιστικής στις κατηγορίες και τις ετικέτες σας για εύκολη εξαγωγή των εξόδων στα λογιστικά και μισθοδοτικά σας συστήματα.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι κωδικοί GL είναι διαθέσιμοι μόνο στο πλάνο Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Κωδικοί Γενικής Λογιστικής & Μισθοδοσίας',
                description: `Προσθέστε κωδικούς λογιστικής και μισθοδοσίας στις κατηγορίες σας για εύκολη εξαγωγή εξόδων στα λογιστικά και μισθοδοτικά σας συστήματα.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι κωδικοί γενικής λογιστικής και μισθοδοσίας είναι διαθέσιμοι μόνο στο πλάνο Control, με αρχική τιμή <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Κωδικοί φόρου',
                description: `Προσθέστε φορολογικούς κωδικούς στους φόρους σας για εύκολη εξαγωγή εξόδων στα λογιστικά και μισθολογικά σας συστήματα.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι φορολογικοί κωδικοί είναι διαθέσιμοι μόνο στο πρόγραμμα Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            companyCards: {
                title: 'Απεριόριστες εταιρικές κάρτες',
                description: `Χρειάζεστε περισσότερες τροφοδοτήσεις καρτών; Ξεκλειδώστε απεριόριστες εταιρικές κάρτες για να συγχρονίζετε συναλλαγές από όλους τους μεγάλους εκδότες καρτών.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Αυτό είναι διαθέσιμο μόνο στο πρόγραμμα Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            companyCardSubmit: {
                title: 'Εταιρικές κάρτες',
                description: `Φέρτε τη δική σας εταιρική κάρτα στο Expensify για να έχετε αυτόματη εισαγωγή, αυτόματη κατηγοριοποίηση, υποστήριξη προσαρμόσιμων κανόνων και ενοποιημένη συμφωνία συναλλαγών.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η εισαγωγή εταιρικής κάρτας είναι διαθέσιμη στα προγράμματα Collect και Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            rules: {
                title: 'Κανόνες',
                description: `Οι κανόνες εκτελούνται στο παρασκήνιο και κρατούν τις δαπάνες σας υπό έλεγχο, ώστε να μη χρειάζεται να ανησυχείτε για τα μικροπράγματα.

Απαιτήστε στοιχεία δαπανών όπως αποδείξεις και περιγραφές, ορίστε όρια και προεπιλογές και αυτοματοποιήστε εγκρίσεις και πληρωμές – όλα σε ένα σημείο.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι κανόνες είναι διαθέσιμοι μόνο στο πρόγραμμα Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            perDiem: {
                title: 'Ημερήσια αποζημίωση',
                description:
                    'Το ημερήσιο επίδομα είναι ένας εξαιρετικός τρόπος να διατηρείτε τα καθημερινά σας έξοδα συμμορφωμένα και προβλέψιμα κάθε φορά που οι εργαζόμενοι σας ταξιδεύουν. Επωφεληθείτε από λειτουργίες όπως προσαρμοσμένα ποσά, προεπιλεγμένες κατηγορίες και πιο λεπτομερή στοιχεία, όπως προορισμούς και υποποσά.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι ημερήσιες αποζημιώσεις είναι διαθέσιμες μόνο στο πλάνο Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            hr: {
                title: 'Ενσωματώσεις HR',
                description:
                    'Συνδέστε τον πάροχο ανθρώπινου δυναμικού σας για αυτόματο συγχρονισμό των εργαζομένων και διαχείριση ροών έγκρισης. Διατηρήστε τον κατάλογο της ομάδας σας και τη δομή αναφοράς ενημερωμένα χωρίς χειροκίνητη εργασία.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι ενσωματώσεις HR είναι διαθέσιμες μόνο στο πρόγραμμα Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            travel: {
                title: 'Ταξίδι',
                description:
                    'Το Expensify Travel είναι μια νέα πλατφόρμα εταιρικής κράτησης και διαχείρισης ταξιδιών που επιτρέπει στα μέλη να κλείνουν καταλύματα, πτήσεις, μεταφορές και άλλα.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η Ταξίδι είναι διαθέσιμο στο πλάνο Collect, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            travelSubmit: {
                title: 'Expensify Travel',
                description:
                    'Κλείστε φθηνότερες πτήσεις, ξενοδοχεία, αυτοκίνητα και τρένα παγκοσμίως, απευθείας μέσα από το Expensify, με αναφορές duty of care και ενσωματωμένη διαχείριση εξόδων.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Το Expensify Travel είναι διαθέσιμο στα προγράμματα Collect και Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            reports: {
                title: 'Αναφορές',
                description: 'Οι αναφορές σάς επιτρέπουν να ομαδοποιείτε δαπάνες για ευκολότερη παρακολούθηση και οργάνωση.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι αναφορές είναι διαθέσιμες στο πλάνο Collect, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Ετικέτες πολλαπλών επιπέδων',
                description:
                    'Οι ετικέτες πολλαπλών επιπέδων σάς βοηθούν να παρακολουθείτε τα έξοδά σας με μεγαλύτερη ακρίβεια. Αναθέστε πολλές ετικέτες σε κάθε γραμμή, όπως τμήμα, πελάτη ή κέντρο κόστους, για να καταγράφετε το πλήρες πλαίσιο κάθε εξόδου. Αυτό επιτρέπει πιο αναλυτικές αναφορές, ροές έγκρισης και εξαγωγές λογιστικών δεδομένων.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι ετικέτες πολλαπλών επιπέδων είναι διαθέσιμες μόνο στο πρόγραμμα Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Τιμές χιλιομετρικής αποζημίωσης',
                description: 'Δημιουργήστε και διαχειριστείτε τα δικά σας ποσοστά, καταγράψτε σε μίλια ή χιλιόμετρα και ορίστε προεπιλεγμένες κατηγορίες για έξοδα απόστασης.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι χρεώσεις απόστασης είναι διαθέσιμες στο πρόγραμμα Collect, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            controlPolicyRoles: {
                title: 'Ρόλοι πολιτικής ελέγχου',
                description: 'Παραχωρήστε στα μέλη συγκεκριμένη πρόσβαση αναθέτοντάς τους ρόλους όπως ελεγκτής ή διαχειριστής καρτών.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Εξειδικευμένοι ρόλοι χώρου εργασίας είναι διαθέσιμοι μόνο στο πλάνο Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Πολλαπλά επίπεδα έγκρισης',
                description:
                    'Τα πολλαπλά επίπεδα έγκρισης είναι ένα εργαλείο ροής εργασιών για εταιρείες που απαιτούν περισσότερα από ένα άτομα να εγκρίνουν μια αναφορά πριν μπορέσει να αποζημιωθεί.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Πολλαπλά επίπεδα έγκρισης είναι διαθέσιμα μόνο στο πλάνο Control, από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            roles: {
                title: 'Ρόλοι',
                description: 'Αναθέστε διαφορετικούς ρόλους σε διαφορετικά μέλη για να αυξήσετε ή να μειώσετε την ορατότητα και τον έλεγχο, ανάλογα με τις ανάγκες.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι ρόλοι είναι διαθέσιμοι στα προγράμματα Collect και Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            payments: {
                title: 'Πληρωμές',
                description: 'Αποζημιώστε απευθείας τους υπαλλήλους από τον επαγγελματικό σας τραπεζικό λογαριασμό.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Οι πληρωμές είναι διαθέσιμες στα προγράμματα Collect και Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            accounting: {
                title: 'Λογιστική',
                description:
                    'Συγχρονίστε κατηγορίες, ετικέτες, φορολογικούς συντελεστές και πολλά άλλα από το λογιστικό σας σύστημα στο Expensify, καθώς και εξαγάγετε αναφορές εξόδων και συναλλαγές καρτών – χωρίς πληκτρολόγηση (ή τυπογραφικά λάθη)!',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η λογιστική είναι διαθέσιμη στα πλάνα Collect και Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            expensifyCard: {
                title: 'Κάρτα Expensify',
                description:
                    'Εκδώστε εταιρικές κάρτες (συμπεριλαμβανομένων εικονικών καρτών) απευθείας από τον δικό σας τραπεζικό λογαριασμό, για άμεσο έλεγχο δαπανών με μια αδιάσπαστη σύνδεση και επιστροφή μετρητών έως 2%!',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η Κάρτα Expensify είναι διαθέσιμη στα προγράμματα Collect και Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
                upgradeButton: 'Αναβαθμίστε και ενεργοποιήστε',
            },
            invoicing: {
                title: 'Τιμολόγηση',
                description:
                    'Δημιουργήστε, στείλτε και παρακολουθήστε επαγγελματικά τιμολόγια, όλα μέσα από το Expensify. Πληρωθείτε πιο γρήγορα με ενσωματωμένες πληρωμές και άμεση ορατότητα σε πραγματικό χρόνο.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Η τιμολόγηση είναι διαθέσιμη στα προγράμματα Collect και Control, ξεκινώντας από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'ανά ενεργό μέλος ανά μήνα.',
                perMember: 'ανά μέλος ανά μήνα.',
            },
            note: (subscriptionLink: string) => `<muted-text><a href="${subscriptionLink}">Μάθετε περισσότερα</a> σχετικά με τα προγράμματα και τις τιμές μας.</muted-text>`,
            upgradeToUnlock: 'Ξεκλειδώστε αυτή τη δυνατότητα',
            unlockFeatures: 'Ξεκλειδώστε αυτά τα χαρακτηριστικά!',
            completed: {
                headline: `Αναβαθμίσατε τον χώρο εργασίας σας!`,
                successMessage: (policyName: string, planName: string, subscriptionLink: string) =>
                    `<centered-text>Έχετε αναβαθμίσει με επιτυχία την πολιτική ${policyName} στο πρόγραμμα ${planName}! <a href="${subscriptionLink}">Δείτε τη συνδρομή σας</a> για περισσότερες λεπτομέρειες.</centered-text>`,
                categorizeMessage: `Αναβαθμίσατε με επιτυχία στο πρόγραμμα Collect. Τώρα μπορείτε να κατηγοριοποιείτε τις δαπάνες σας!`,
                travelMessage: `Έχετε αναβαθμίσει επιτυχώς στο πλάνο Collect. Τώρα μπορείτε να αρχίσετε να κλείνετε και να διαχειρίζεστε ταξίδια!`,
                distanceRateMessage: `Έχετε αναβαθμιστεί με επιτυχία στο πρόγραμμα Collect. Τώρα μπορείτε να αλλάξετε την τιμή ανά απόσταση!`,
                gotIt: 'Εντάξει, ευχαριστώ',
                createdWorkspace: `Δημιουργήσατε έναν χώρο εργασίας!`,
            },
            commonFeatures: {
                title: 'Αναβαθμίστε στο πρόγραμμα Control',
                collect: {
                    title: 'Αναβαθμίστε στο πλάνο Collect',
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `<muted-text>Το πλάνο Collect ξεκινά από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`} <a href="${learnMoreMethodsRoute}">Μάθετε περισσότερα</a> σχετικά με τα πλάνα και τις τιμές μας.</muted-text>`,
                    note: 'Ξεκλειδώστε βασικές δυνατότητες για τη λειτουργία της επιχείρησής σας, όπως:',
                },
                note: 'Ξεκλειδώστε τις πιο ισχυρές λειτουργίες μας, όπως:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `<muted-text>Το πρόγραμμα Control ξεκινά από <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `ανά μέλος ανά μήνα.` : `ανά ενεργό μέλος ανά μήνα.`} <a href="${learnMoreMethodsRoute}">Μάθετε περισσότερα</a> σχετικά με τα προγράμματα και τις τιμές μας.</muted-text>`,
                    benefit1: 'Σύνθετες λογιστικές συνδέσεις (NetSuite, Sage Intacct και άλλα)',
                    benefit2: 'Έξυπνοι κανόνες εξόδων',
                    benefit3: 'Ροές έγκρισης πολλαπλών επιπέδων',
                    benefit4: 'Ενισχυμένα στοιχεία ελέγχου ασφαλείας',
                    toUpgrade: 'Για αναβάθμιση, κάντε κλικ',
                    selectWorkspace: 'επιλέξτε έναν χώρο εργασίας και αλλάξτε τον τύπο πλάνου σε',
                },
                upgradeWorkspaceWarning: `Δεν είναι δυνατή η αναβάθμιση του χώρου εργασίας`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt:
                    'Η εταιρεία σας έχει περιορίσει τη δημιουργία χώρων εργασίας. Παρακαλούμε επικοινωνήστε με έναν διαχειριστή για βοήθεια.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Υποβιβασμός σε Collect',
                note: 'Θα χάσετε την πρόσβαση στις παρακάτω λειτουργίες',
                noteAndMore: 'και άλλα:',
                benefits: {
                    important: 'ΣΗΜΑΝΤΙΚΟ:',
                    confirm: 'Θα χρειαστεί να αλλάξετε τον «Τύπο πλάνου» κάθε χώρου εργασίας σε «Collect» για να εξασφαλίσετε την τιμή Collect.',
                    benefit1Label: 'Ενσωματώσεις ERP',
                    benefit1: 'NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2Label: 'Ενσωματώσεις HR',
                    benefit2: 'Workday, Certinia',
                    benefit3Label: 'Ασφάλεια',
                    benefit3: 'SSO/SAML',
                    benefit4Label: 'Για προχωρημένους',
                    benefit4: 'Έξυπνοι κανόνες εξόδων, ημερήσιες αποζημιώσεις, εγκρίσεις πολλαπλών επιπέδων, προσαρμοσμένες αναφορές και προϋπολογισμός',
                    headsUp: 'Προσοχή!',
                    multiWorkspaceNote:
                        'Θα χρειαστεί να υποβαθμίσετε όλα τα spaces εργασίας σας πριν από την πρώτη μηνιαία πληρωμή σας, ώστε να ξεκινήσετε μια συνδρομή με το πρόγραμμα Collect. Κάντε κλικ',
                    selectStep: '> επιλέξτε κάθε χώρο εργασίας > αλλάξτε τον τύπο πλάνου σε',
                },
            },
            completed: {
                headline: 'Ο χώρος εργασίας σας έχει υποβαθμιστεί',
                description: 'Έχετε άλλους χώρους εργασίας στο πρόγραμμα Control. Για να χρεώνεστε με τον τιμοκατάλογο Collect, πρέπει να υποβαθμίσετε όλους τους χώρους εργασίας.',
                gotIt: 'Εντάξει, ευχαριστώ',
            },
        },
        payAndDowngrade: {
            title: 'Πληρωμή & υποβιβασμός',
            headline: 'Η τελική σας πληρωμή',
            description1: (formattedAmount: string) => `Ο τελικός λογαριασμός σας για αυτήν τη συνδρομή θα είναι <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Δείτε την ανάλυσή σας παρακάτω για τις ${date}:`,
            subscription:
                'Προσοχή! Αυτή η ενέργεια θα τερματίσει τη συνδρομή σας στο Expensify, θα διαγράψει αυτόν τον χώρο εργασίας και θα αφαιρέσει όλα τα μέλη του χώρου εργασίας. Αν θέλετε να διατηρήσετε αυτόν τον χώρο εργασίας και μόνο να αφαιρέσετε τον εαυτό σας, ζητήστε πρώτα από έναν άλλο διαχειριστή να αναλάβει τη χρέωση.',
            genericFailureMessage: 'Παρουσιάστηκε σφάλμα κατά την πληρωμή του λογαριασμού σας. Παρακαλούμε δοκιμάστε ξανά.',
        },
        restrictedAction: {
            restricted: 'Περιορισμένο',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Οι ενέργειες στον χώρο εργασίας ${workspaceName} είναι προς το παρόν περιορισμένες`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `Ο/Η ιδιοκτήτης/-τρια του χώρου εργασίας, ${workspaceOwnerName}, θα πρέπει να προσθέσει ή να ενημερώσει την κάρτα πληρωμής στον λογαριασμό για να ενεργοποιηθεί η νέα δραστηριότητα του χώρου εργασίας.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Πρέπει να προσθέσετε ή να ενημερώσετε την αποθηκευμένη κάρτα πληρωμής για να ξεκλειδώσετε τη νέα δραστηριότητα του χώρου εργασίας.',
            addPaymentCardToUnlock: 'Προσθέστε μια κάρτα πληρωμής για να ξεκλειδώσετε!',
            addPaymentCardToContinueUsingWorkspace: 'Προσθέστε μια κάρτα πληρωμής για να συνεχίσετε να χρησιμοποιείτε αυτόν τον χώρο εργασίας',
            pleaseReachOutToYourWorkspaceAdmin: 'Παρακαλούμε επικοινωνήστε με τον διαχειριστή του χώρου εργασίας σας για οποιαδήποτε ερώτηση.',
            chatWithYourAdmin: 'Συνομιλήστε με τον διαχειριστή σας',
            chatInAdmins: 'Συνομιλήστε στο #admins',
            addPaymentCard: 'Προσθήκη κάρτας πληρωμής',
            goToSubscription: 'Μετάβαση στη συνδρομή',
        },
        rules: {
            tabs: {
                general: 'Γενικά',
                cardRestrictions: 'Περιορισμοί κάρτας',
                expenseDefaults: 'Προεπιλογές εξόδων',
                requireFields: 'Απαίτηση πεδίων',
                flagForReview: 'Σημείωση για έλεγχο',
            },
            bulkActions: {
                deleteMultiple: () => ({
                    one: 'Διαγραφή κανόνα',
                    other: 'Διαγραφή κανόνων',
                }),
                deleteMultipleConfirmation: () => ({
                    one: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον κανόνα;',
                    other: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτούς τους κανόνες;',
                }),
            },
            generalTab: {
                title: 'Βασικοί κανόνες',
                subtitle: 'Γενικοί κανόνες για τον έλεγχο των δαπανών',
                expensesOlderThan: 'Επισημάνετε τις δαπάνες παλαιότερες από',
                expensesAboveAmount: 'Σημείωση εξόδων πάνω από ποσό',
                flagReceiptLineItems: 'Επισήμανση γραμμών στοιχείων απόδειξης',
                receiptRequirements: 'Απαιτείται απόδειξη',
                receiptRequirementsSummary: ({regularAmount, itemizedAmount}: {regularAmount?: string; itemizedAmount?: string}) => {
                    if (regularAmount && itemizedAmount) {
                        return `Κανονική πάνω από ${regularAmount}, αναλυτική πάνω από ${itemizedAmount}`;
                    }
                    if (regularAmount) {
                        return `Κανονική πάνω από ${regularAmount}, δεν απαιτείται ανάλυση αποδείξεων`;
                    }
                    if (itemizedAmount) {
                        return `Να μην απαιτείται τακτική, αναλυτική καταγραφή πάνω από ${itemizedAmount}`;
                    }
                    return 'Να μην απαιτούνται αποδείξεις';
                },
                requireFieldsForAllExpenses: 'Να απαιτούνται πεδία για όλες τις δαπάνες',
                cashExpenses: 'Έξοδα με μετρητά',
                cashExpensesReimbursableByDefault: 'Με δυνατότητα αποζημίωσης από προεπιλογή',
                cashExpensesNonReimbursableByDefault: 'Μη αποζημιώσιμες από προεπιλογή',
                cashExpensesAlwaysReimbursable: 'Πάντα αποζημιώσιμο',
                cashExpensesAlwaysNonReimbursable: 'Πάντα μη αποζημιώσιμες',
                billableExpenses: 'Χρεώσιμες δαπάνες',
                billableExpensesBillable: 'Χρεώσιμα μετρητά και πιστωτική κάρτα',
                billableExpensesNonBillable: 'Μη χρεώσιμα μετρητά και πιστωτική κάρτα',
            },
            requireReceipts: {
                title: 'Απαιτείται απόδειξη',
                description: 'Να απαιτούνται αποδείξεις όταν η δαπάνη υπερβαίνει αυτό το ποσό, εκτός αν παρακάμπτεται από κανόνα κατηγορίας.',
                requireReceipt: 'Απαίτηση απόδειξης',
                requireItemizedReceipt: 'Απαιτείται αναλυτική απόδειξη',
                requireAboveAmount: 'Να απαιτείται το παραπάνω ποσό',
                emptyAmountError: 'Εισαγάγετε ένα έγκυρο ποσό πριν αποθηκεύσετε',
                saveRule: 'Αποθήκευση κανόνα',
            },
            requireFields: {
                title: 'Να απαιτούνται πεδία για όλες τις δαπάνες',
                category: 'Κατηγορία',
                tag: 'Ετικέτα',
                save: 'Αποθήκευση κανόνα',
            },
            individualExpenseRules: {
                title: 'Έξοδα',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Ορίστε ελέγχους δαπανών και προεπιλογές για μεμονωμένες δαπάνες. Μπορείτε επίσης να δημιουργήσετε κανόνες για τις <a href="${categoriesPageLink}">κατηγορίες</a> και τις <a href="${tagsPageLink}">ετικέτες</a>.</muted-text>`,
                receiptRequiredAmount: 'Απαιτούμενο ποσό απόδειξης',
                receiptRequiredAmountDescription: 'Να απαιτούνται αποδείξεις όταν η δαπάνη υπερβαίνει αυτό το ποσό, εκτός αν παρακάμπτεται από κανόνα κατηγορίας.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Το ποσό δεν μπορεί να είναι μεγαλύτερο από το απαιτούμενο ποσό της αναλυτικής απόδειξης (${amount})`,
                itemizedReceiptRequiredAmount: 'Απαιτούμενο ποσό αναλυτικής απόδειξης',
                itemizedReceiptRequiredAmountDescription: 'Να απαιτούνται αναλυτικές αποδείξεις όταν η δαπάνη υπερβαίνει αυτό το ποσό, εκτός αν παρακάμπτεται από κανόνα κατηγορίας.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Το ποσό δεν μπορεί να είναι μικρότερο από το ποσό που απαιτείται για κανονικές αποδείξεις (${amount})`,
                maxExpenseAmount: 'Μέγιστο ποσό δαπάνης',
                maxExpenseAmountDescription: 'Σημαίνετε δαπάνες που υπερβαίνουν αυτό το ποσό, εκτός αν παρακαμφθούν από κανόνα κατηγορίας.',
                maxAge: 'Μέγιστη ηλικία',
                maxExpenseAge: 'Μέγιστη παλαιότητα δαπάνης',
                maxExpenseAgeDescription: 'Επισημάνετε δαπάνες παλαιότερες από έναν συγκεκριμένο αριθμό ημερών.',
                maxExpenseAgeDays: () => ({
                    one: '1 ημέρα',
                    other: (count: number) => `${count} ημέρες`,
                }),
                cashExpenseDefault: 'Προεπιλογή δαπάνης μετρητών',
                cashExpenseDefaultDescription:
                    'Επιλέξτε πώς θα δημιουργούνται τα έξοδα με μετρητά. Ένα έξοδο θεωρείται έξοδο με μετρητά εάν δεν είναι εισαγόμενη συναλλαγή εταιρικής κάρτας. Σε αυτά περιλαμβάνονται τα έξοδα που δημιουργούνται χειροκίνητα, οι αποδείξεις, τα έξοδα ημερήσιας αποζημίωσης, απόστασης και χρόνου.',
                reimbursableDefault: 'Επανεντάξιμο',
                reimbursableDefaultDescription: 'Οι δαπάνες συνήθως αποζημιώνονται στους υπαλλήλους',
                nonReimbursableDefault: 'Μη επιστρέψιμο',
                nonReimbursableDefaultDescription: 'Τα έξοδα αποζημιώνονται περιστασιακά στους εργαζόμενους',
                alwaysReimbursable: 'Πάντα αποζημιώσιμο',
                alwaysReimbursableDescription: 'Τα έξοδα αποζημιώνονται πάντα στους υπαλλήλους',
                alwaysNonReimbursable: 'Πάντα μη αποζημιώσιμες',
                alwaysNonReimbursableDescription: 'Τα έξοδα δεν αποζημιώνονται ποτέ στους υπαλλήλους',
                billableDefault: 'Προεπιλογή χρεώσιμων',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Επιλέξτε αν οι δαπάνες με μετρητά και με πιστωτική κάρτα θα είναι χρεώσιμες από προεπιλογή. Οι χρεώσιμες δαπάνες ενεργοποιούνται ή απενεργοποιούνται στις <a href="${tagsPageLink}">ετικέτες</a>.</muted-text>`,
                billable: 'Χρεώσιμη',
                billableDescription: 'Οι δαπάνες συνήθως τιμολογούνται ξανά στους πελάτες',
                nonBillable: 'Μη χρεώσιμο',
                nonBillableDescription: 'Οι δαπάνες μερικές φορές επαναχρεώνονται σε πελάτες',
                eReceipts: 'ηλεκτρονικές αποδείξεις',
                eReceiptsHint: `Τα ηλεκτρονικά αποδεικτικά δημιουργούνται αυτόματα [για τις περισσότερες πιστωτικές συναλλαγές σε USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Παρακολούθηση συμμετεχόντων',
                attendeeTrackingHint: 'Παρακολουθήστε το κόστος ανά άτομο για κάθε δαπάνη.',
                prohibitedDefaultDescription: 'Σημειώστε τις αποδείξεις με αυτές τις γραμμές χρέωσης για χειροκίνητο έλεγχο.',
                prohibitedExpenses: 'Απαγορευμένες δαπάνες',
                alcohol: 'Αλκοόλ',
                hotelIncidentals: 'Πρόσθετα έξοδα ξενοδοχείου',
                gambling: 'Τζόγος',
                tobacco: 'Καπνός',
                adultEntertainment: 'Ψυχαγωγία ενηλίκων',
                giftCard: 'Αγορές δωροκαρτών',
                handwrittenReceipt: 'Χειρόγραφες αποδείξεις',
                requireCompanyCard: 'Να απαιτούνται εταιρικές κάρτες για όλες τις αγορές',
                requireCompanyCardDescription: 'Επισημάνετε όλες τις δαπάνες με μετρητά, συμπεριλαμβανομένων των εξόδων χιλιομετρικής αποζημίωσης και ημερήσιας αποζημίωσης.',
                requireCompanyCardDisabledTooltip: 'Ενεργοποιήστε τις εταιρικές κάρτες (στην ενότητα Περισσότερες δυνατότητες) για να το ξεκλειδώσετε.',
            },
            expenseReportRules: {
                title: 'Για προχωρημένους',
                subtitle: 'Αυτοματοποιήστε τη συμμόρφωση, τις εγκρίσεις και την πληρωμή των αναφορών εξόδων.',
                preventSelfApprovalsTitle: 'Αποτροπή αυτο-εγκρίσεων',
                preventSelfApprovalsSubtitle: 'Αποτρέψτε τα μέλη του χώρου εργασίας από το να εγκρίνουν τις δικές τους αναφορές εξόδων.',
                autoApproveCompliantReportsTitle: 'Αυτόματη έγκριση συμβατών αναφορών',
                autoApproveCompliantReportsSubtitle: 'Ρυθμίστε ποιες αναφορές εξόδων είναι κατάλληλες για αυτόματη έγκριση.',
                autoApproveReportsUnderTitle: 'Αυτόματη έγκριση αναφορών με όλες τις δαπάνες κάτω από',
                autoApproveReportsUnderDescription: 'Πλήρως συμμορφωμένες αναφορές εξόδων, στις οποίες όλες οι δαπάνες είναι κάτω από αυτό το ποσό, θα εγκρίνονται αυτόματα.',
                randomReportAuditTitle: 'Τυχαίος έλεγχος αναφοράς',
                randomReportAuditDescription: 'Να απαιτείται ορισμένες αναφορές να εγκρίνονται χειροκίνητα, ακόμη και αν είναι κατάλληλες για αυτόματη έγκριση.',
                autoPayApprovedReportsTitle: 'Αυτοπληρωμή εγκεκριμένων αναφορών',
                autoPayApprovedReportsSubtitle: 'Ρυθμίστε ποιες αναφορές εξόδων είναι κατάλληλες για αυτόματη πληρωμή.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Παρακαλούμε εισαγάγετε ένα ποσό μικρότερο από ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle:
                    'Μεταβείτε στις πρόσθετες λειτουργίες και ενεργοποιήστε τις ροές εργασιών, έπειτα προσθέστε πληρωμές για να ξεκλειδώσετε αυτή τη λειτουργία.',
                autoPayReportsUnderTitle: 'Αυτόματη πληρωμή αναφορών κάτω από',
                autoPayReportsUnderDescription: 'Πλήρως συμβατικές αναφορές εξόδων κάτω από αυτό το ποσό θα εξοφλούνται αυτόματα.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Προσθέστε ${featureName} για να ξεκλειδώσετε αυτήν τη δυνατότητα.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Μεταβείτε στις [περισσότερες δυνατότητες](${moreFeaturesLink}) και ενεργοποιήστε το ${featureName} για να ξεκλειδώσετε αυτήν τη λειτουργία.`,
            },
            agentsPromoBanner: {
                title: 'Δεν βλέπετε τον κανόνα που χρειάζεστε; Προσθέστε έναν εκπρόσωπο',
                subtitle: 'Προσθέστε σύνθετους κανόνες και μειώστε τις χειροκίνητες εγκρίσεις με προσαρμοσμένους agents.',
                cta: 'Δοκιμάστε το',
            },
            merchantRules: {
                title: 'Έμπορος',
                subtitle: 'Ορίστε κανόνες εμπόρων ώστε οι δαπάνες να καταχωρίζονται σωστά και να απαιτούν λιγότερο καθαρισμό.',
                addRule: 'Προσθήκη κανόνα εμπόρου',
                findRule: 'Εύρεση κανόνα εμπόρου',
                addRuleTitle: 'Προσθήκη κανόνα',
                editRuleTitle: 'Επεξεργασία κανόνα',
                expensesWith: 'Για δαπάνες με:',
                expensesExactlyMatching: 'Για συναλλαγές που ταιριάζουν ακριβώς με:',
                applyUpdates: 'Εφαρμόστε αυτές τις ενημερώσεις:',
                saveRule: 'Αποθήκευση κανόνα',
                previewMatches: 'Προεπισκόπηση αντιστοιχιών',
                confirmError: 'Εισαγάγετε τον έμπορο και εφαρμόστε τουλάχιστον μία ενημέρωση',
                confirmErrorMerchant: 'Παρακαλούμε εισαγάγετε τον έμπορο',
                confirmErrorUpdate: 'Παρακαλούμε εφαρμόστε τουλάχιστον μία ενημέρωση',
                previewMatchesEmptyStateTitle: 'Τίποτα προς εμφάνιση',
                previewMatchesEmptyStateSubtitle: 'Καμία μη υποβληθείσα δαπάνη δεν ταιριάζει με αυτόν τον κανόνα.',
                deleteRule: 'Διαγραφή κανόνα',
                deleteRuleConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον κανόνα;',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Εάν ο έμπορος ${isExactMatch ? 'ταιριάζει ακριβώς' : 'περιέχει'} «${merchantName}»`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Μετονομάστε τον έμπορο σε «${merchantName}»`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Ενημερώστε το ${fieldName} σε «${fieldValue}»`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Επισήμανση ως "${reimbursable ? 'επιστρέψιμο' : 'μη αποζημιώσιμα'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Σήμανση ως «${billable ? 'χρεώσιμο' : 'μη χρεώσιμη'}»`,
                matchType: 'Τύπος αντιστοίχισης',
                matchTypeContains: 'Περιέχει',
                matchTypeExact: 'Ακριβής αντιστοιχία',
                duplicateRuleTitle: 'Υπάρχει ήδη παρόμοιος κανόνας εμπόρου',
                duplicateRulePrompt: (merchantName: string) => `Ο υπάρχων κανόνας σας για το «${merchantName}» θα έχει προτεραιότητα έναντι αυτού. Να γίνει αποθήκευση έτσι κι αλλιώς;`,
                saveAnyway: 'Αποθήκευση ούτως ή άλλως',
                applyToExistingUnsubmittedExpenses: 'Εφαρμογή σε υφιστάμενες μη υποβληθείσες δαπάνες',
                expenseDefaultsTitle: 'Προεπιλογές εξόδων',
                expenseDefaultsSubtitle: 'Ενημέρωση πεδίων χωρίς να χρειάζεται ο υποβάλλων να κάνει τίποτα',
                ifAnyExpenseMatches: 'Αν κάποια δαπάνη αντιστοιχεί σε:',
                thenApplyFollowingDefaults: 'Στη συνέχεια, εφαρμόστε τις ακόλουθες προεπιλογές:',
            },
            newRule: {
                title: 'Νέος κανόνας',
                subtitle: 'Τι θέλετε να κάνετε;',
                restrictCardSpend: 'Περιορισμός δαπανών κάρτας',
                restrictCardSpendDescription: 'Μπλοκάρετε ή περιορίστε τις δαπάνες στο σημείο πώλησης',
                flagForReview: 'Σημείωση για έλεγχο',
                flagForReviewDescription: 'Ειδοποίηση εγκριτών όταν οι δαπάνες υπερβαίνουν τα όρια κατηγορίας',
                requireFields: 'Απαίτηση πεδίων',
                requireFieldsDescription: 'Βεβαιωθείτε ότι έχετε συμπληρώσει τα βασικά πεδία πριν υποβάλετε τις δαπάνες',
                applyExpenseDefaults: 'Εφαρμογή προεπιλογών δαπανών',
                applyExpenseDefaultsDescription: 'Ενημέρωση πεδίων χωρίς να χρειάζεται ο υποβάλλων να κάνει τίποτα',
            },
            expenseDefaultsTable: {
                tableColumnType: 'Τύπος',
                tableColumnCondition: 'Προϋπόθεση',
                tableColumnRule: 'Κανόνας',
                findRule: 'Εύρεση κανόνα',
                rename: 'Μετονομασία',
                update: 'Ενημέρωση',
                merchantIs: (merchant: string) => `Ο έμπορος είναι «${merchant}»`,
                merchantTypeIs: (merchantType: string) => `Ο τύπος εμπόρου είναι «${merchantType}»`,
            },
            merchantTypeRule: {
                merchantType: 'Τύπος εμπόρου',
                saveRule: 'Αποθήκευση κανόνα',
                confirmErrorCategory: 'Παρακαλώ επιλέξτε κατηγορία.',
            },
            requireFieldsTable: {
                tableColumnType: 'Τύπος',
                tableColumnCondition: 'Προϋπόθεση',
                tableColumnRule: 'Κανόνας',
                findRule: 'Εύρεση κανόνα',
                typeLabel: 'Απαίτηση πεδίων',
                conditionCategoryIs: (category: string) => `Η κατηγορία είναι «${category}»`,
                requireDescription: 'Απαίτηση περιγραφής',
                requireAttendees: 'Απαιτήστε συμμετέχοντες',
                requireItemizedReceipt: 'Απαιτείται αναλυτική απόδειξη',
                requireItemizedReceiptOver: (amount: string) => `Απαιτείται αναλυτική απόδειξη για ποσά άνω των ${amount}`,
                alwaysRequireReceipt: 'Να απαιτείται πάντα απόδειξη',
                requireReceiptOver: (amount: string) => `Απαιτείται απόδειξη για ποσά άνω των ${amount}`,
            },
            requireFieldsEmptyState: {
                title: 'Εντοπίστε έγκαιρα τα ελλιπή στοιχεία',
                subtitle: 'Βεβαιωθείτε ότι τα βασικά πεδία έχουν συμπληρωθεί πριν υποβληθούν οι δαπάνες.',
                cta: 'Δημιουργία κανόνα υποχρεωτικού πεδίου',
            },
            requireFieldsRule: {
                title: 'Απαίτηση πεδίων',
                subtitle: 'Να απαιτούνται αποδείξεις, κατηγορίες κ.λπ. κατά την υποβολή.',
                thenWarnMember: 'Στη συνέχεια προειδοποιήστε το μέλος αν λείπουν πεδία:',
                itemizedReceipt: 'Αναλυτική απόδειξη',
                saveRule: 'Αποθήκευση κανόνα',
                confirmErrorCategory: 'Παρακαλώ επιλέξτε κατηγορία.',
                confirmErrorField: 'Παρακαλούμε επιλέξτε τουλάχιστον ένα πεδίο ως υποχρεωτικό.',
            },
            flagForReviewTable: {
                tableColumnType: 'Τύπος',
                tableColumnCondition: 'Προϋπόθεση',
                tableColumnRule: 'Κανόνας',
                findRule: 'Εύρεση κανόνα',
                typeLabel: 'Σημαία',
                conditionCategoryAndAmount: (category: string, amount: string) => `Η κατηγορία είναι «${category}» και το ποσό πάνω από ${amount}`,
                conditionCategoryAndDailyAmount: (category: string, amount: string) => `Η κατηγορία είναι «${category}» και το ημερήσιο σύνολο κατηγορίας είναι πάνω από ${amount}`,
                flagForReview: 'Σημείωση για έλεγχο',
            },
            flagForReviewEmptyState: {
                title: 'Προβολή εξόδων που χρειάζονται πιο προσεκτικό έλεγχο',
                subtitle: 'Ειδοποιήστε τους εγκρίνoντες όταν συγκεκριμένες δαπάνες αξίζουν μια επιπλέον εξέταση.',
                cta: 'Δημιουργία κανόνα σήμανσης',
            },
            flagForReviewRule: {
                title: 'Σημείωση για έλεγχο',
                subtitle: 'Ειδοποιήστε τους εγκρίνωντες όταν πληρούνται οι ακόλουθες προϋποθέσεις.',
                saveRule: 'Αποθήκευση κανόνα',
                confirmErrorCategory: 'Παρακαλώ επιλέξτε κατηγορία.',
                confirmErrorAmount: 'Παρακαλώ εισαγάγετε ένα ποσό.',
                thenFlagForReview: 'Στη συνέχεια επισημάνετε για έλεγχο όταν:',
            },
            categoryRules: {
                title: 'Κανόνες κατηγορίας',
                approver: 'Έγκριση',
                requireDescription: 'Απαίτηση περιγραφής',
                requireFields: 'Απαίτηση πεδίων',
                requiredFieldsTitle: 'Υποχρεωτικά πεδία',
                requiredFieldsDescription: (categoryName: string) => `Αυτό θα ισχύει για όλες τις δαπάνες που κατηγοριοποιούνται ως <strong>${categoryName}</strong>.`,
                requireAttendees: 'Απαιτήστε συμμετέχοντες',
                descriptionHint: 'Υπόδειξη περιγραφής',
                descriptionHintDescription: (categoryName: string) =>
                    `Υπενθυμίστε στους υπαλλήλους να παρέχουν επιπλέον πληροφορίες για τις δαπάνες «${categoryName}». Αυτή η υπόδειξη εμφανίζεται στο πεδίο περιγραφής στις δαπάνες.`,
                descriptionHintLabel: 'Υπόδειξη',
                descriptionHintSubtitle: 'Επαγγελματική συμβουλή: όσο πιο σύντομο, τόσο το καλύτερο!',
                maxAmount: 'Μέγιστο ποσό',
                flagAmountsOver: 'Επισήμανση ποσών άνω των',
                flagAmountsOverDescription: (categoryName: string) => `Ισχύει για την κατηγορία «${categoryName}».`,
                flagAmountsOverSubtitle: 'Αυτό παρακάμπτει το μέγιστο ποσό για όλες τις δαπάνες.',
                expenseLimitTypes: {
                    expense: 'Ατομική δαπάνη',
                    expenseSubtitle: 'Σημαδέψτε τα ποσά εξόδων ανά κατηγορία. Αυτός ο κανόνας παρακάμπτει τον γενικό κανόνα χώρου εργασίας για το μέγιστο ποσό εξόδου.',
                    daily: 'Σύνολο κατηγορίας',
                    dailySubtitle: 'Σήμανση συνολικής ημερήσιας δαπάνης ανά κατηγορία για κάθε αναφορά εξόδων.',
                },
                requireReceiptsOver: 'Απαίτηση αποδείξεων για ποσά άνω των',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} προεπιλογή`,
                    never: 'Ποτέ να μην απαιτούνται αποδείξεις',
                    always: 'Να απαιτούνται πάντα αποδείξεις',
                },
                requireItemizedReceiptsOver: 'Απαιτήστε αναλυτικές αποδείξεις για ποσά άνω των',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} προεπιλογή`,
                    never: 'Να μην απαιτούνται ποτέ αναλυτικές αποδείξεις',
                    always: 'Να απαιτούνται πάντα αναλυτικές αποδείξεις',
                },
                defaultTaxRate: 'Προεπιλεγμένος φορολογικός συντελεστής',
                enableWorkflows: (moreFeaturesLink: string) =>
                    `Μεταβείτε στις [Περισσότερες λειτουργίες](${moreFeaturesLink}) και ενεργοποιήστε τις ροές εργασιών, έπειτα προσθέστε εγκρίσεις για να ενεργοποιήσετε αυτή τη λειτουργία.`,
            },
            customRules: {
                title: 'Πολιτική εξόδων',
                cardSubtitle: 'Εδώ βρίσκεται η πολιτική εξόδων της ομάδας σας, ώστε όλοι να έχουν ξεκάθαρα τι καλύπτεται.',
                policyDocument: 'Έγγραφο πολιτικής',
                policyText: 'Κείμενο πολιτικής',
            },
            spendRules: {
                title: 'Δαπάνη',
                subtitle: 'Εγκρίνετε ή απορρίπτετε συναλλαγές με την Κάρτα Expensify σε πραγματικό χρόνο.',
                defaultRuleDescription: 'Όλες οι κάρτες',
                block: 'Αποκλεισμός',
                defaultRuleTitle: 'Κατηγορίες: Υπηρεσίες ενηλίκων, ΑΤΜ, τζόγος, μεταφορές χρημάτων',
                defaultRuleSummary: 'Κατηγορίες που περιλαμβάνουν υπηρεσίες ενηλίκων, ΑΤΜ, τζόγο και...',
                findRule: 'Εύρεση κανόνα',
                defaultSection: 'Προεπιλογή',
                customRulesSection: 'Προσαρμοσμένοι κανόνες',
                tableColumnType: 'Τύπος',
                tableColumnCard: 'Κάρτα',
                tableColumnRule: 'Κανόνας',
                cardRulesUpsell: {
                    title: 'Αποκτήστε την Κάρτα Expensify και ελέγξτε τις δαπάνες σας',
                    subtitle:
                        'Με την Κάρτα Expensify μπορείτε να ορίσετε κανόνες για μέγιστη δαπάνη, να αποκλείετε ή να επιτρέπετε συγκεκριμένους εμπόρους ή τύπους αγορών. Λαμβάνετε επίσης επιστροφή μετρητών 2%.',
                    cta: 'Αποκτήστε την κάρτα',
                },
                builtInProtectionModal: {
                    title: 'Οι κάρτες Expensify προσφέρουν ενσωματωμένη προστασία – πάντα',
                    description: `Η Expensify απορρίπτει πάντα αυτές τις χρεώσεις:

  • Υπηρεσίες ενηλίκων
  • ΑΤΜ
  • Τυχερά παιχνίδια
  • Μεταφορές χρημάτων

Προσθέστε περισσότερους κανόνες δαπανών για να προστατεύσετε τις ταμειακές ροές της εταιρείας.`,
                },
                addSpendRule: 'Προσθήκη κανόνα δαπανών',
                editRuleTitle: 'Επεξεργασία κανόνα',
                restrictCardSpendTitle: 'Περιορισμός δαπανών κάρτας',
                restrictCardSpendSubtitle: 'Μπλοκάρετε ή περιορίστε τις δαπάνες στο σημείο πώλησης.',
                ifAnyCardMatches: 'Αν ταιριάζει οποιαδήποτε κάρτα:',
                thenDoThisAtPointOfSale: 'Στη συνέχεια, κάντε αυτό στο σημείο πώλησης:',
                permittedCurrencies: 'Επιτρεπόμενα νομίσματα',
                setRestrictions: 'Ορίστε περιορισμούς',
                merchantRestrictions: 'Περιορισμοί εμπόρου',
                blockedMerchant: 'Αποκλεισμένος έμπορος',
                blockedMerchantTypes: 'Αποκλεισμένοι τύποι εμπόρων',
                maxAmountAbove: ({amount}: {amount: string}) => `πάνω από ${amount}`,
                cardPageTitle: 'Κάρτα',
                cardsSectionTitle: 'Κάρτες',
                chooseCards: 'Επιλέξτε κάρτες',
                saveRule: 'Αποθήκευση κανόνα',
                deleteRule: 'Διαγραφή κανόνα',
                deleteRuleConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον κανόνα;',
                allow: 'Να επιτρέπεται',
                spendRuleSectionTitle: 'Κανόνες δαπανών',
                restrictMerchants: 'Περιορισμός εμπόρων',
                addMerchant: 'Προσθήκη εμπόρου',
                merchantContains: 'Ο έμπορος περιέχει',
                merchantExactlyMatches: 'Ο έμπορος ταιριάζει ακριβώς',
                noBlockedMerchants: 'Κανένας αποκλεισμένος έμπορος',
                addMerchantToBlockSpend: 'Προσθέστε έναν έμπορο για να αποκλείσετε δαπάνες',
                noAllowedMerchants: 'Δεν υπάρχουν επιτρεπόμενοι έμποροι',
                addMerchantToAllowSpend: 'Προσθέστε έναν έμπορο για να επιτρέψετε δαπάνες',
                matchType: 'Τύπος αντιστοίχισης',
                matchTypeContains: 'Περιέχει',
                matchTypeExact: 'Ταιριάζει ακριβώς',
                merchantTypes: 'Τύποι εμπόρων',
                maxAmount: 'Μέγιστο ποσό',
                allowedMerchants: 'Επιτρεπόμενοι έμποροι',
                allowedMerchantTypes: 'Επιτρεπόμενοι τύποι εμπόρων',
                blockedMerchants: 'Αποκλεισμένοι έμποροι',
                maxAmountHelp: 'Κάθε χρέωση πάνω από αυτό το ποσό θα απορρίπτεται, ανεξάρτητα από τους περιορισμούς εμπόρου και κατηγορίας δαπάνης.',
                maxAmountCurrencyMismatchTitle: 'Ασυμφωνία νομίσματος',
                maxAmountCurrencyMismatchPrompt: 'Για να ορίσετε μέγιστο ποσό, επιλέξτε κάρτες που εκκαθαρίζονται στο ίδιο νόμισμα.',
                currenciesCurrencyMismatchTitle: 'Ασυμφωνία νομίσματος',
                currenciesCurrencyMismatchPrompt: 'Για να ορίσετε προτιμώμενα νομίσματα, επιλέξτε κάρτες που διακανονίζονται στο ίδιο νόμισμα.',
                reviewSelectedCards: 'Επισκόπηση επιλεγμένων καρτών',
                allCurrencies: 'Όλα τα νομίσματα',
                permittedCurrenciesSubtitle: 'Επιλέξτε αν θα επιτρέπονται όλα ή συγκεκριμένα νομίσματα',
                settlementCurrencyPermittedSubtitle: 'Το νόμισμα διακανονισμού της κάρτας επιτρέπεται πάντα',
                restrictMerchantsOffSubtitle: 'Οι χρεώσεις εγκρίνονται για επιτρεπόμενα νομίσματα που δεν υπερβαίνουν ένα μέγιστο ποσό',
                restrictMerchantsAllowSubtitle: 'Οι χρεώσεις εγκρίνονται για επιτρεπόμενα νομίσματα που δεν υπερβαίνουν ένα μέγιστο ποσό και ο έμπορος ή ο τύπος εμπόρου ταιριάζει.',
                restrictMerchantsBlockSubtitle: 'Οι χρεώσεις εγκρίνονται για επιτρεπόμενα νομίσματα που δεν υπερβαίνουν ένα μέγιστο ποσό ή όταν ο έμπορος ή ο τύπος εμπόρου ταιριάζει.',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => (count > 0 ? `${summary}, +${count} ακόμη` : summary),
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
                    `${action === CONST.SPEND_RULES.ACTION.BLOCK ? 'Αποκλεισμένο' : 'Επιτρέπεται'} ${shownCount > 1 ? 'έμποροι' : 'έμπορος'}: ${merchants}${hiddenCount > 0 ? `, +${hiddenCount} ακόμα` : ''}`,
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
                    `${action === CONST.SPEND_RULES.ACTION.BLOCK ? 'Αποκλεισμένο' : 'Επιτρέπεται'} ${shownCount > 1 ? 'κατηγορίες' : 'κατηγορία'}: ${categories}${hiddenCount > 0 ? `, +${hiddenCount} ακόμα` : ''}`,
                summaryCurrencies: ({currencies, hiddenCount, shownCount}: {currencies: string; hiddenCount: number; shownCount: number}) =>
                    `Επιτρέπονται ${shownCount > 1 ? 'νομίσματα' : 'νόμισμα'}: ${currencies}${hiddenCount > 0 ? `, +${hiddenCount} ακόμα` : ''}`,
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: 'Εφαρμόστε τουλάχιστον έναν κανόνα δαπανών σε μία κάρτα',
                confirmErrorCardRequired: 'Το πεδίο κάρτα είναι υποχρεωτικό',
                confirmErrorApplyAtLeastOneSpendRule: 'Εφαρμόστε τουλάχιστον έναν κανόνα δαπανών',
                categories: 'Κατηγορίες',
                merchants: 'Έμποροι',
                currencies: 'Νομίσματα',
                noAvailableCards: 'Όλες οι κάρτες έχουν ήδη κανόνα',
                noAvailableCardsSubtitle: 'Επεξεργαστείτε έναν υπάρχοντα κανόνα κάρτας για να κάνετε αλλαγές',
                noCardsIssuedTitle: 'Δεν έχουν εκδοθεί κάρτες Expensify',
                noCardsIssuedSubtitle: 'Εκδώστε Κάρτες Expensify για να δημιουργήσετε κανόνες δαπανών',
                max: 'Μέγιστο',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: 'Αεροπορικές εταιρείες',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: 'Αλκοόλ και μπαρ',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: 'Amazon και βιβλιοπωλεία',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: 'Αυτοκίνητο',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: 'Ενοικιάσεις αυτοκινήτων',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: 'Εστίαση',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: 'Καύσιμα και βενζίνη',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: 'Δημόσιος τομέας και μη κερδοσκοπικοί οργανισμοί',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: 'Είδη παντοπωλείου',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: 'Γυμναστήρια και φυσική κατάσταση',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: 'Υγεία',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: 'Ξενοδοχεία',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: 'Ίντερνετ και τηλέφωνο',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: 'Είδη γραφείου',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: 'Στάθμευση και διόδια',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: 'Επαγγελματικές υπηρεσίες',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: 'Λιανική',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: 'Αποστολή και παράδοση',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: 'Λογισμικό',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: 'Δημόσιες συγκοινωνίες και υπηρεσίες κοινής μετακίνησης',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: 'Ταξιδιωτικά πρακτορεία',
                },
            },
            agentRules: {
                title: 'Κανόνες αντιπροσώπου',
                subtitle: 'Ορίστε κανόνες για τον τρόπο με τον οποίο οι πράκτορες τεχνητής νοημοσύνης χειρίζονται τις δαπάνες σε αυτόν τον χώρο εργασίας.',
                enforcedBy: 'Οι κανόνες αντιπροσώπου επιβάλλονται από',
                ruleBotName: 'RuleBot',
                addRule: 'Προσθήκη κανόνα αντιπροσώπου',
                findRule: 'Εύρεση κανόνα αντιπροσώπου',
                addRuleTitle: 'Προσθήκη κανόνα',
                editRuleTitle: 'Επεξεργασία κανόνα',
                deleteRule: 'Διαγραφή κανόνα',
                deleteRuleConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτόν τον κανόνα;',
                describeRuleTitle: 'Περιγράψτε τον κανόνα που πρέπει να ακολουθεί ο πράκτοράς σας τεχνητής νοημοσύνης',
                disclaimer: 'Οι πράκτορες τεχνητής νοημοσύνης μπορεί να κάνουν λάθη.',
                agentCreatedTitle: 'Το RuleBot προστέθηκε στον χώρο εργασίας σας!',
                agentCreatedDescription: (agentsRoute: string) =>
                    `<muted-text>Για να επιβάλλουμε τους κανόνες του αντιπροσώπου σας, δημιουργήσαμε έναν αντιπρόσωπο για εσάς και τον προσθέσαμε ως διαχειριστή στον χώρο εργασίας σας.<br><br>Επεξεργαστείτε τα στοιχεία του αντιπροσώπου σας στο <a href="${agentsRoute}">λογαριασμός &gt; αντιπρόσωποι</a>.</muted-text>`,
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Είσπραξη',
                    description: 'Για ομάδες που θέλουν να αυτοματοποιήσουν τις διαδικασίες τους.',
                },
                corporate: {
                    label: 'Έλεγχος',
                    description: 'Για οργανισμούς με προχωρημένες απαιτήσεις.',
                },
                submit2026: {
                    label: 'Υποβολή',
                    description: 'Για εργαζόμενους που θέλουν να υποβάλλουν έξοδα στον εργοδότη τους.',
                },
            },
            description: 'Επιλέξτε ένα πλάνο που σας ταιριάζει.',
            subscriptionLink: 'Μάθετε περισσότερα',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Έχετε δεσμευτεί για 1 ενεργό μέλος στο πλάνο Control έως ότου λήξει η ετήσια συνδρομή σας στις ${annualSubscriptionEndDate}. Μπορείτε να μεταβείτε σε συνδρομή με χρέωση ανά χρήση και να υποβιβάσετε το πλάνο σας σε Collect από τις ${annualSubscriptionEndDate} και μετά, απενεργοποιώντας την αυτόματη ανανέωση στο`,
                other: `Έχετε δεσμευτεί για ${count} ενεργά μέλη στο πλάνο Control μέχρι τη λήξη της ετήσιας συνδρομής σας στις ${annualSubscriptionEndDate}. Μπορείτε να αλλάξετε σε συνδρομή με χρέωση ανά χρήση και να υποβιβάσετε το πλάνο σας σε Collect από τις ${annualSubscriptionEndDate} και μετά, απενεργοποιώντας την αυτόματη ανανέωση στο`,
            }),
            subscriptions: 'Συνδρομές',
        },
    },
    getAssistancePage: {
        title: 'Λάβετε βοήθεια',
        subtitle: 'Είμαστε εδώ για να ανοίξουμε τον δρόμο σας προς τη μεγαλοσύνη!',
        description: 'Επιλέξτε ανάμεσα στις παρακάτω επιλογές υποστήριξης:',
        chatWithConcierge: 'Συνομιλήστε με το Concierge',
        scheduleSetupCall: 'Προγραμματίστε μια κλήση ρύθμισης',
        scheduleACall: 'Προγραμματίστε κλήση',
        questionMarkButtonTooltip: 'Λάβετε βοήθεια από την ομάδα μας',
        exploreHelpDocs: 'Δείτε τις οδηγίες βοήθειας',
        registerForWebinar: 'Εγγραφείτε στο διαδικτυακό σεμινάριο',
        onboardingHelp: 'Βοήθεια εκκίνησης',
    },
    emojiPicker: {
        emojiNotSelected: 'Δεν έχει επιλεγεί emoji',
        skinTonePickerLabel: 'Αλλαγή προεπιλεγμένου χρώματος δέρματος',
        headers: {
            frequentlyUsed: 'Συχνά χρησιμοποιούμενα',
            smileysAndEmotion: 'Χαμόγελα & συναίσθημα',
            peopleAndBody: 'Άνθρωποι & Σώμα',
            animalsAndNature: 'Ζώα & Φύση',
            foodAndDrink: 'Φαγητό & Ποτά',
            travelAndPlaces: 'Ταξίδια & Τοποθεσίες',
            activities: 'Δραστηριότητες',
            objects: 'Αντικείμενα',
            symbols: 'Σύμβολα',
            flags: 'Σημαίες',
        },
    },
    newRoomPage: {
        newRoom: 'Νέο δωμάτιο',
        groupName: 'Όνομα ομάδας',
        roomName: 'Όνομα δωματίου',
        visibility: 'Ορατότητα',
        restrictedDescription: 'Τα άτομα στον χώρο εργασίας σας μπορούν να βρουν αυτό το δωμάτιο',
        privateDescription: 'Τα άτομα που προσκλήθηκαν σε αυτό το δωμάτιο μπορούν να το βρουν',
        publicDescription: 'Οποιοσδήποτε μπορεί να βρει αυτό το δωμάτιο',
        public_announceDescription: 'Οποιοσδήποτε μπορεί να βρει αυτό το δωμάτιο',
        createRoom: 'Δημιουργία δωματίου',
        roomAlreadyExistsError: 'Υπάρχει ήδη ένα δωμάτιο με αυτό το όνομα',
        roomNameReservedError: (reservedName: string) => `Το ${reservedName} είναι προεπιλεγμένο δωμάτιο σε όλους τους χώρους εργασίας. Παρακαλούμε επιλέξτε άλλο όνομα.`,
        roomNameInvalidError: 'Τα ονόματα δωματίων μπορούν να περιλαμβάνουν μόνο πεζά γράμματα, αριθμούς και παύλες',
        pleaseEnterRoomName: 'Εισαγάγετε ένα όνομα δωματίου',
        pleaseSelectWorkspace: 'Παρακαλώ επιλέξτε έναν χώρο εργασίας',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}μετονομάστηκε σε «${newName}» (προηγουμένως «${oldName}»)` : `${actor}μετονόμασε αυτό το δωμάτιο σε «${newName}» (προηγουμένως «${oldName}»)`;
        },
        roomRenamedTo: (newName: string) => `Το δωμάτιο μετονομάστηκε σε ${newName}`,
        social: 'κοινωνικό',
        selectAWorkspace: 'Επιλέξτε ένα χώρο εργασίας',
        growlMessageOnRenameError: 'Δεν ήταν δυνατή η μετονομασία του δωματίου χώρου εργασίας. Παρακαλούμε ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.',
        visibilityOptions: {
            restricted: 'Χώρος εργασίας',
            private: 'Ιδιωτικό',
            public: 'Δημόσιο',
            public_announce: 'Δημόσια ανακοίνωση',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Υποβολή και κλείσιμο',
        submitAndApprove: 'Υποβολή και έγκριση',
        advanced: 'ΠΡΟΧΩΡΗΜΕΝΟ',
        dynamicExternal: 'ΔΥΝΑΜΙΚΟ_ΕΞΩΤΕΡΙΚΟ',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `ορίστε τον προεπιλεγμένο επαγγελματικό τραπεζικό λογαριασμό σε «${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}»`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `αφαίρεσε τον προεπιλεγμένο επαγγελματικό τραπεζικό λογαριασμό «${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}»`,
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
            `άλλαξε τον προεπιλεγμένο επαγγελματικό τραπεζικό λογαριασμό σε «${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}» (προηγουμένως «${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}»)`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `άλλαξε τη διεύθυνση της εταιρείας σε «${newAddress}» (προηγουμένως «${previousAddress}»)` : `ορίστε τη διεύθυνση της εταιρείας σε «${newAddress}»`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `προστέθηκε ο/η ${approverName} (${approverEmail}) ως εγκρίνων για το/τη ${field} «${name}»`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `καταργήθηκε ο/η ${approverName} (${approverEmail}) ως εγκρίνων/ουσα για το πεδίο ${field} «${name}»`,
        updateApprovalRule: (field: string, name: string, newApproverEmail: string, newApproverName: string | undefined, oldApproverEmail: string, oldApproverName: string | undefined) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `άλλαξε το άτομο που εγκρίνει για το πεδίο ${field} «${name}» σε ${formatApprover(newApproverName, newApproverEmail)} (προηγουμένως ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `πρόσθεσε την κατηγορία «${categoryName}»`,
        deleteCategory: (categoryName: string) => `αφαίρεσε την κατηγορία «${categoryName}»`,
        updateCategory: (categoryName: string, oldValue: boolean) => `${oldValue ? 'απενεργοποιημένο' : 'ενεργοποιημένο'} η κατηγορία «${categoryName}»`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `προστέθηκε ο κωδικός μισθοδοσίας «${newValue}» στην κατηγορία «${categoryName}»`;
            }
            if (!newValue && oldValue) {
                return `αφαίρεσε τον κωδικό μισθοδοσίας «${oldValue}» από την κατηγορία «${categoryName}»`;
            }
            return `άλλαξε τον κωδικό μισθοδοσίας της κατηγορίας «${categoryName}» σε «${newValue}» (προηγουμένως «${oldValue}»)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `πρόσθεσε τον κωδικό GL «${newValue}» στην κατηγορία «${categoryName}»`;
            }
            if (!newValue && oldValue) {
                return `αφαίρεσε τον κωδικό GL «${oldValue}» από την κατηγορία «${categoryName}»`;
            }
            return `άλλαξε τον κωδικό GL της κατηγορίας «${categoryName}» σε «${newValue}» (προηγουμένως «${oldValue}»)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `άλλαξε την περιγραφή της κατηγορίας «${categoryName}» σε ${!oldValue ? 'απαιτείται' : 'δεν απαιτείται'} (προηγουμένως ${!oldValue ? 'δεν απαιτείται' : 'απαιτείται'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `προστέθηκε μέγιστο ποσό ${newAmount} στην κατηγορία «${categoryName}»`;
            }
            if (oldAmount && !newAmount) {
                return `αφαίρεσε το μέγιστο ποσό ${oldAmount} από την κατηγορία «${categoryName}»`;
            }
            return `άλλαξε το μέγιστο ποσό της κατηγορίας «${categoryName}» σε ${newAmount} (προηγουμένως ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `πρόσθεσε έναν τύπο ορίου ${newValue} στην κατηγορία «${categoryName}»`;
            }
            return `άλλαξε τον τύπο ορίου της κατηγορίας «${categoryName}» σε ${newValue} (προηγουμένως ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `ενημέρωσε την κατηγορία «${categoryName}» αλλάζοντας το Receipts σε ${newValue}`;
            }
            return `άλλαξε την κατηγορία «${categoryName}» σε ${newValue} (προηγουμένως ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: (categoryName: string, oldValue: string | undefined, newValue: string) => {
            if (!oldValue) {
                return `ενημέρωσε την κατηγορία «${categoryName}» αλλάζοντας τις αναλυτικές αποδείξεις σε ${newValue}`;
            }
            return `άλλαξε τις αναλυτικές αποδείξεις της κατηγορίας «${categoryName}» σε ${newValue} (προηγουμένως ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `μετονόμασε την κατηγορία «${oldName}» σε «${newName}»`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `αφαίρεσε την υπόδειξη περιγραφής «${oldValue}» από την κατηγορία «${categoryName}»`;
            }
            return !oldValue
                ? `προστέθηκε η υπόδειξη περιγραφής «${newValue}» στην κατηγορία «${categoryName}»`
                : `άλλαξε την υπόδειξη περιγραφής της κατηγορίας «${categoryName}» σε «${newValue}» (προηγουμένως «${oldValue}»)`;
        },
        updateCategories: (count: number) => `ενημερώθηκαν ${count} κατηγορίες`,
        updateTagListName: (oldName: string, newName: string) => `άλλαξε το όνομα της λίστας ετικετών σε «${newName}» (προηγουμένως «${oldName}»)`,
        updateTagList: (tagListName: string) => `ενημερώθηκαν οι ετικέτες στη λίστα «${tagListName}»`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `άλλαξε τη λίστα ετικετών "${tagListsName}" σε ${isRequired ? 'απαιτείται' : 'δεν απαιτείται'}`,
        importTags: 'εισήχθησαν ετικέτες από υπολογιστικό φύλλο',
        deletedAllTags: 'διαγράφηκαν όλες οι ετικέτες',
        addTag: (tagListName: string, tagName?: string) => `προστέθηκε η ετικέτα «${tagName}» στη λίστα «${tagListName}»`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `ενημέρωσε τη λίστα ετικετών «${tagListName}» αλλάζοντας την ετικέτα «${oldName}» σε «${newName}»`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) =>
            `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} την ετικέτα «${tagName}» στη λίστα «${tagListName}»`,
        deleteTag: (tagListName: string, tagName?: string) => `αφαίρεσε την ετικέτα «${tagName}» από τη λίστα «${tagListName}»`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `αφαιρέθηκαν "${count}" ετικέτες από τη λίστα "${tagListName}"`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `ενημέρωσε την ετικέτα «${tagName}» στη λίστα «${tagListName}» αλλάζοντας το ${updatedField} σε «${newValue}» (προηγουμένως «${oldValue}»)`;
            }
            return `ενημέρωσε την ετικέτα «${tagName}» στη λίστα «${tagListName}» προσθέτοντας ${updatedField} με τιμή «${newValue}»`;
        },
        updateCustomUnit: (customUnitName: string, newValue: string, oldValue: string, updatedField: string) =>
            `άλλαξε το πεδίο ${updatedField} της προσαρμοσμένης μονάδας ${customUnitName} σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `${newValue ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} παρακολούθηση φόρου σε χρεώσεις απόστασης`,
        updateCustomUnitDefaultCategory: (customUnitName: string, newValue?: string, oldValue?: string) =>
            `άλλαξε την προεπιλεγμένη κατηγορία ${customUnitName} σε «${newValue}» ${oldValue ? `(προηγουμένως «${oldValue}»)` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `έγινε εισαγωγή τιμών για την προσαρμοσμένη μονάδα «${customUnitName}»`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `προστέθηκε τιμή ${customUnitName} «${rateName}»`,
        addCustomUnitRateWithAmount: (rateName: string, rateValue: string) => `προστέθηκε τιμή «${rateName}» αξίας ${rateValue}`,
        addCustomUnitRateWithAmountAndStartDate: (rateName: string, rateValue: string, startDate: string) =>
            `προστέθηκε το τιμολόγιο «${rateName}» αξίας ${rateValue}, σε ισχύ από ${startDate}`,
        addCustomUnitRateWithAmountAndEndDate: (rateName: string, rateValue: string, endDate: string) => `προστέθηκε συντελεστής «${rateName}» αξίας ${rateValue}, σε ισχύ έως ${endDate}`,
        addCustomUnitRateWithAmountAndDates: (rateName: string, rateValue: string, startDate: string, endDate: string) =>
            `προστέθηκε συντελεστής «${rateName}» αξίας ${rateValue}, σε ισχύ από ${startDate} έως ${endDate}`,
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `αφαίρεσε τον συντελεστή «${customUnitName}» «${rateName}»`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `άλλαξε την τιμή της μονάδας «${customUnitName}», της υποτιμής «${customUnitRateName}» του υποποσού «${customUnitSubRateName}», ${updatedField}, σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `αφαιρέθηκε ο συντελεστής «${customUnitName}», ο συντελεστής «${customUnitRateName}» και ο υπο-συντελεστής «${removedSubRateName}»`,
        addedReportField: (fieldType: string, fieldName?: string, defaultValue?: string) =>
            `προστέθηκε πεδίο αναφοράς ${fieldType} «${fieldName}»${defaultValue ? `με προεπιλεγμένη τιμή «${defaultValue}»` : ''}`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `άλλαξε την τιμή του ${customUnitName} ${updatedField} «${customUnitRateName}» σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `άλλαξε τον φορολογικό συντελεστή στο χιλιομετρικό κόστος «${customUnitRateName}» σε «${newValue} (${newTaxPercentage})» (προηγουμένως «${oldValue} (${oldTaxPercentage})»)`;
            }
            return `πρόσθεσε τον φορολογικό συντελεστή «${newValue} (${newTaxPercentage})» στον συντελεστή απόστασης «${customUnitRateName}»`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `άλλαξε το ανακτήσιμο φόρου τμήμα στο τιμολόγιο απόστασης «${customUnitRateName}» σε «${newValue}» (προηγουμένως «${oldValue}»)`;
            }
            return `προστέθηκε φορολογικά επιστρεπτέο μέρος «${newValue}» στο χιλιομετρικό κόστος «${customUnitRateName}»`;
        },
        updatedCustomUnitRateName: (customUnitName: string, oldValue: string, newValue: string) => `μετονόμασε την τιμή ${customUnitName} από «${oldValue}» σε «${newValue}»`,
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `${newValue ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} τον συντελεστή ${customUnitName} «${customUnitRateName}»`;
        },
        updatedCustomUnitRateDateRange: (rateName: string, newDateRange: string, oldDateRange: string) =>
            `ενημερώθηκε ο συντελεστής απόστασης «${rateName}» ώστε να ισχύει από ${newDateRange} (πριν: ${oldDateRange})`,
        customUnitRateDateRangeStartToEnd: (startDate: string, endDate: string) => `${startDate} - ${endDate}`,
        customUnitRateDateRangeFrom: (date: string) => `από ${date}`,
        customUnitRateDateRangeUntilEnd: (date: string) => `έως ${date}`,
        customUnitRateDateRangeAllDates: () => `για όλες τις ημερομηνίες`,
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `ορίστε την προεπιλεγμένη τιμή του πεδίου αναφοράς «${fieldName}» σε «${defaultValue}»`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `πρόσθεσε την επιλογή «${optionName}» στο πεδίο αναφοράς «${fieldName}»`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `αφαίρεσε την επιλογή «${optionName}» από το πεδίο αναφοράς «${fieldName}»`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `${optionEnabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} την επιλογή «${optionName}» για το πεδίο αναφοράς «${fieldName}»`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} όλες οι επιλογές για το πεδίο αναφοράς «${fieldName}»`;
            }
            return `${allEnabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} την επιλογή «${optionName}» για το πεδίο αναφοράς «${fieldName}», κάνοντας όλες τις επιλογές ${allEnabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `αφαιρέθηκε το πεδίο αναφοράς ${fieldType} «${fieldName}»`,
        addedCardFeed: (feedName: string) => `προστέθηκε ροή κάρτας «${feedName}»`,
        removedCardFeed: (feedName: string) => `αφαιρέθηκε η ροή κάρτας «${feedName}»`,
        renamedCardFeed: (newName: string, oldName: string) => `μετονομάστηκε η ροή κάρτας σε «${newName}» (προηγουμένως «${oldName}»)`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `ανατέθηκε στον/στην ${email} η ${feedName ? `"${feedName}" ` : ''}εταιρική κάρτα που λήγει σε ${cardLastFour}`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `μη αντιστοιχισμένη κάρτα εταιρείας ${email} ${feedName ? `"${feedName}" ` : ''} που λήγει σε ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} κατόχοι κάρτας να διαγράψουν συναλλαγές κάρτας για την τροφοδοσία κάρτας «${feedName}»`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `άλλαξε την ημέρα λήξης της περιόδου εκκαθάρισης της ροής κάρτας «${feedName}»${newValue ? `σε "${newValue}"` : ''}${previousValue ? `(προηγουμένως "${previousValue}")` : ''}`,
        expensifyCardRule: {
            actionVerb: {
                block: 'μπλοκαρισμένο',
                allow: 'επιτρέπεται',
            },
            amountOperator: {
                over: 'πάνω από',
                under: 'κάτω από',
            },
            amountFilter: ({operator, amount}: {operator: string; amount: string}) => `ποσά ${operator} ${amount}`,
            allowedCurrencyFilters: ({currencies}: {currencies: string}) => `νομίσματα ${currencies}`,
            blockedCurrencyFilters: ({currencies}: {currencies: string}) => `νομίσματα εκτός των ${currencies}`,
            theCard: 'η κάρτα',
            multipleCards: ({count}: {count: number}) => ({
                one: '1 κάρτα',
                other: `${count} κάρτες`,
            }),
            addRule: ({verb, filters, cards}: {verb: string; filters: string; cards: string}) => {
                let text = verb;
                if (filters !== '') {
                    text += ` ${filters}`;
                }
                text += `στις ${cards}`;
                return text;
            },
            removeRule: ({cards}: {cards: string}) => `αφαιρέθηκε κανόνας δαπανών από ${cards}`,
            restrictionVerb: {
                block: 'αποκλεισμός',
                allow: 'να επιτρέπεται μόνο',
            },
            update: {
                modeChange: ({fromAction, toAction, cards}: {fromAction: string; toAction: string; cards: string}) =>
                    `αλλάξατε τον κανόνα δαπανών από ${fromAction} σε ${toAction} στις ${cards}`,
                appliedToAdditionalCards: ({count}: {count: number}) => ({
                    one: 'εφαρμόστηκε κανόνας δαπανών σε 1 επιπλέον κάρτα',
                    other: `εφαρμόστηκε κανόνας δαπανών σε ${count} επιπλέον κάρτες`,
                }),
                phraseVerb: {
                    added: 'προστέθηκε',
                    removed: 'καταργήθηκε',
                    changed: 'αλλάχθηκε',
                    set: 'ορισμός',
                    applied: 'εφαρμόστηκε',
                },
                bodyMerchant: ({adjective, value}: {adjective: string; value: string}) => (adjective !== '' ? `${adjective} έμπορος «${value}»` : `έμπορος '${value}'`),
                bodyMerchantValueOnly: ({value}: {value: string}) => `'${value}'`,
                bodyMerchantChange: ({adjective, oldValue, newValue}: {adjective: string; oldValue: string; newValue: string}) =>
                    adjective !== '' ? `${adjective} έμπορο από «${oldValue}» σε «${newValue}»` : `εμπόρου από «${oldValue}» σε «${newValue}»`,
                bodySpendCategory: ({adjective, value}: {adjective: string; value: string}) =>
                    adjective !== '' ? `κατηγορία δαπανών ${adjective} «${value}»` : `κατηγορία δαπάνης «${value}»`,
                bodySpendCategoryValueOnly: ({value}: {value: string}) => `'${value}'`,
                bodySpendCategoryChange: ({adjective, oldValue, newValue}: {adjective: string; oldValue: string; newValue: string}) =>
                    adjective !== '' ? `κατηγορία δαπανών ${adjective} από '${oldValue}' σε '${newValue}'` : `κατηγορία δαπάνης από «${oldValue}» σε «${newValue}»`,
                bodyCurrency: ({adjective, value}: {adjective: string; value: string}) => (adjective !== '' ? `${adjective} νόμισμα «${value}»` : `νόμισμα «${value}»`),
                bodyCurrencyValueOnly: ({value}: {value: string}) => `'${value}'`,
                bodyCurrencyChange: ({adjective, oldValue, newValue}: {adjective: string; oldValue: string; newValue: string}) =>
                    adjective !== '' ? `${adjective} συνάλλαγμα από '${oldValue}' σε '${newValue}'` : `νόμισμα από «${oldValue}» σε «${newValue}»`,
                bodyCurrencyRestriction: 'ο περιορισμός νομίσματος',
                bodyMaxAmount: 'μέγιστο ποσό',
                bodyMaxAmountSet: ({value}: {value: string}) => `μέγιστο ποσό έως ${value}`,
                bodyMaxAmountChange: ({oldValue, newValue}: {oldValue: string; newValue: string}) => `μέγιστο ποσό από ${oldValue} σε ${newValue}`,
                bodyAppliedToAdditionalCards: ({count}: {count: number}) => ({
                    one: 'κανόνας δαπανών σε 1 επιπλέον κάρτα',
                    other: `κανόνα δαπανών σε ${count} επιπλέον κάρτες`,
                }),
                bodyRemovedFromCards: ({cards}: {cards: string}) => `κανόνας δαπανών από ${cards}`,
                composeOnCards: ({content, cards}: {content: string; cards: string}) => `${content} σε ${cards}`,
                composeFromCards: ({content, cards}: {content: string; cards: string}) => `${content} από ${cards}`,
            },
        },
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `ενημερώθηκε το «αποτροπή αυτοέγκρισης» σε «${newValue === 'true' ? 'Ενεργοποιημένο' : 'Απενεργοποιημένο'}» (προηγουμένως «${oldValue === 'true' ? 'Ενεργοποιημένο' : 'Απενεργοποιημένο'}»)`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `ορίστε την ημερομηνία υποβολής της μηνιαίας αναφοράς σε «${newValue}»`;
            }
            return `ενημέρωσε την ημερομηνία υποβολής της μηνιαίας αναφοράς σε «${newValue}» (προηγουμένως «${oldValue}»)`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `ενημέρωσε το «Επανεπιβάρυνση δαπανών σε πελάτες» σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `ενημερώθηκε η «Προεπιλογή δαπανών με μετρητά» σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        updateDefaultTitleEnforced: (value: boolean) => `ενεργοποίησε την «επιβολή προεπιλεγμένων τίτλων αναφοράς» ${value ? 'ενεργό' : 'κλειστό'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `άλλαξε τον τύπο ονόματος προσαρμοσμένης αναφοράς σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `ενημέρωσε το όνομα αυτού του χώρου εργασίας σε «${newName}» (προηγουμένως «${oldName}»)`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
            !oldDescription
                ? `ορίστε την περιγραφή αυτού του χώρου εργασίας σε «${newDescription}»`
                : `ενημέρωσε την περιγραφή αυτού του χώρου εργασίας σε «${newDescription}» (προηγουμένως «${oldDescription}»)`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('και');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `σας αφαίρεσε από τη ροή έγκρισης και τη συνομιλία εξόδων του/της ${joinedNames}. Οι αναφορές που είχαν υποβληθεί προηγουμένως θα παραμείνουν διαθέσιμες για έγκριση στα εισερχόμενά σας.`,
                other: `σας αφαίρεσε από τις ροές έγκρισης και τις συνομιλίες εξόδων του/της ${joinedNames}. Οι αναφορές που υποβλήθηκαν παλαιότερα θα παραμείνουν διαθέσιμες για έγκριση στα εισερχόμενά σας.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `ενημέρωσε τον ρόλο σας στην πολιτική ${policyName} από ${oldRole} σε χρήστη. Έχετε αφαιρεθεί από όλες τις συνομιλίες εξόδων υποβολέων, εκτός από τις δικές σας.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `ενημέρωσε το προεπιλεγμένο νόμισμα σε ${newCurrency} (προηγουμένως ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `ενημέρωσε τη συχνότητα αυτόματης αναφοράς σε «${newFrequency}» (προηγουμένως «${oldFrequency}»)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `ενημέρωσε τη λειτουργία έγκρισης σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        upgradedWorkspace: 'αναβάθμισε αυτόν τον χώρο εργασίας στο πρόγραμμα Control',
        forcedCorporateUpgrade: `Αυτός ο χώρος εργασίας έχει αναβαθμιστεί στο πλάνο Control. Κάντε κλικ <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">εδώ</a> για περισσότερες πληροφορίες.`,
        downgradedWorkspace: 'υποβίβασε αυτόν τον χώρο εργασίας στο πρόγραμμα Collect',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `άλλαξε το ποσοστό των αναφορών που δρομολογούνται τυχαία για χειροκίνητη έγκριση σε ${Math.round(newAuditRate * 100)}% (προηγουμένως ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: (oldLimit: string, newLimit: string) => `άλλαξε το όριο χειροκίνητης έγκρισης για όλες τις δαπάνες σε ${newLimit} (προηγουμένως ${oldLimit})`,
        addBudget: (frequency: string, entityName: string, entityType: string, shared?: string, individual?: string, notificationThreshold?: number) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `με όριο ειδοποίησης «${notificationThreshold}%»` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `προστέθηκε ${frequency} ατομικός προϋπολογισμός «${individual}» και ${frequency} κοινός προϋπολογισμός «${shared}»${thresholdSuffix} στο ${entityType} «${entityName}»`;
            }
            if (typeof individual !== 'undefined') {
                return `προστέθηκε ${frequency} ατομικός προϋπολογισμός «${individual}»${thresholdSuffix} στο ${entityType} «${entityName}»`;
            }
            return `προστέθηκε ${frequency} κοινόχρηστος προϋπολογισμός «${shared}»${thresholdSuffix} στο ${entityType} «${entityName}»`;
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
                changesList.push(`άλλαξε τη συχνότητα προϋπολογισμού σε «${newFrequency}» (προηγουμένως «${oldFrequency}»)`);
            }
            if (sharedChanged) {
                changesList.push(`άλλαξε το συνολικό προϋπολογισμό χώρου εργασίας σε «${newShared}» (προηγουμένως «${oldShared}»)`);
            }
            if (individualChanged) {
                changesList.push(`άλλαξε τον ατομικό προϋπολογισμό σε «${newIndividual}» (προηγουμένως «${oldIndividual}»)`);
            }
            if (thresholdChanged) {
                changesList.push(`άλλαξε το όριο ειδοποίησης σε «${newNotificationThreshold}%» (προηγουμένως «${oldNotificationThreshold}%»)`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `ενημερώθηκε ο προϋπολογισμός για το ${entityType} «${entityName}»`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `άλλαξε τη συχνότητα προϋπολογισμού για το ${entityType} «${entityName}» σε «${newFrequency}» (προηγουμένως «${oldFrequency}»)`;
                }
                if (sharedChanged) {
                    return `άλλαξε τον συνολικό προϋπολογισμό χώρου εργασίας για το ${entityType} «${entityName}» σε «${newShared}» (προηγουμένως «${oldShared}»)`;
                }
                if (individualChanged) {
                    return `άλλαξε τον ατομικό προϋπολογισμό για το ${entityType} «${entityName}» σε «${newIndividual}» (προηγουμένως «${oldIndividual}»)`;
                }
                return `άλλαξε το όριο ειδοποίησης για το ${entityType} «${entityName}» σε «${newNotificationThreshold}%» (προηγουμένως «${oldNotificationThreshold}%»)`;
            }
            return `ενημερώθηκε ο προϋπολογισμός για το/την ${entityType} «${entityName}»: ${changesList.join('; ')}`;
        },
        deleteBudget: (entityType: string, entityName: string, frequency?: string, individual?: string, shared?: string, notificationThreshold?: number) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `με όριο ειδοποίησης «${notificationThreshold}%»` : '';
            if (shared && individual) {
                return `καταργήθηκε το κοινόχρηστο όριο ${frequency} «${shared}» και το ατομικό όριο «${individual}»${thresholdSuffix} από το ${entityType} «${entityName}»`;
            }
            if (shared) {
                return `αφαιρέθηκε ${frequency} κοινός προϋπολογισμός «${shared}»${thresholdSuffix} από το ${entityType} «${entityName}»`;
            }
            if (individual) {
                return `αφαιρέθηκε το ατομικό όριο προϋπολογισμού ${frequency} του/της «${individual}»${thresholdSuffix} από το ${entityType} «${entityName}»`;
            }
            return `αφαίρεσε τον προϋπολογισμό από το ${entityType} «${entityName}»`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} παρακολούθηση χρόνου`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `άλλαξε την ωριαία αμοιβή σε «${newRate}» (προηγουμένως «${oldRate}»)`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `προστέθηκε το "${prohibitedExpense}" στις απαγορευμένες δαπάνες`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `αφαιρέσατε το «${prohibitedExpense}» από τις απαγορευμένες δαπάνες`,
        commuterExclusions: {
            changedToFixedDistance: 'άλλαξε τον αποκλεισμό μετακινήσεων από/προς εργασία σε σταθερή απόσταση ανά απαίτηση',
            setFixedDistance: ({distance, unit}: {distance: number; unit: string}) => {
                const isSingular = distance === 1;
                let unitLabel: string;
                if (unit === 'mi') {
                    unitLabel = isSingular ? 'μίλι' : 'μίλια';
                } else {
                    unitLabel = isSingular ? 'χιλιόμετρο' : 'χιλιόμετρα';
                }
                return `ορίστε σταθερό αποκλεισμό απόστασης σε ${distance} ${unitLabel} ανά αίτημα`;
            },
            changedFixedDistance: ({newDistance, oldDistance, unit}: {newDistance: number; oldDistance: number; unit: string}) =>
                `άλλαξε τον αποκλεισμό σταθερής απόστασης σε ${newDistance} ${unit} ανά απαίτηση (προηγουμένως ${oldDistance} ${unit})`,
            disabled: 'απενεργοποιήθηκε ο αποκλεισμός μετακινήσεων από/προς εργασία για χιλιομετρικές αποζημιώσεις',
        },
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `άλλαξε τη μέθοδο αποζημίωσης σε «${newReimbursementChoice}» (προηγουμένως «${oldReimbursementChoice}»)`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} προέγκριση αιτημάτων συμμετοχής σε χώρο εργασίας`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) =>
            `άλλαξε τον προεπιλεγμένο τύπο ονόματος προσαρμοσμένης αναφοράς σε «${newDefaultTitle}» (προηγουμένως «${oldDefaultTitle}»)`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `ανέλαβε την κυριότητα του ${policyName} από τον/την ${oldOwnerName} (${oldOwnerEmail})`,
        updatedAutoHarvesting: (enabled: boolean) => `προγραμματισμένη υποβολή ${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'}`,
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
            `Προσοχή! Αυτός ο χώρος εργασίας έχει έναν προϋπολογισμό ${budgetFrequency} ύψους «${budgetAmount}» για τον/την/το ${budgetTypeForNotificationMessage} «${budgetName}». Ο/Η ${userEmail} βρίσκεται αυτήν τη στιγμή στα ${approvedReimbursedClosedSpend}, που είναι πάνω από το ${thresholdPercentage}% του προϋπολογισμού. Υπάρχουν επίσης ${awaitingApprovalSpend} που εκκρεμούν για έγκριση και ${unsubmittedSpend} που δεν έχουν υποβληθεί ακόμη, για συνολικό ποσό ${totalSpend}.${summaryLink ? `<a href="${summaryLink}">Εδώ είναι μια αναφορά</a> με όλες αυτές τις δαπάνες για τα αρχεία σας!` : ''}`,
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
            `Προσοχή! Αυτός ο χώρος εργασίας έχει προϋπολογισμό ${budgetFrequency} ύψους «${budgetAmount}» για ${budgetTypeForNotificationMessage} «${budgetName}». Αυτήν τη στιγμή βρίσκεστε στα ${approvedReimbursedClosedSpend}, που υπερβαίνουν το ${thresholdPercentage}% του προϋπολογισμού. Υπάρχουν επίσης ${awaitingApprovalSpend} που εκκρεμούν για έγκριση και ${unsubmittedSpend} που δεν έχουν ακόμη υποβληθεί, με συνολικό ποσό ${totalSpend}. ${summaryLink ? `<a href="${summaryLink}">Εδώ είναι μια αναφορά</a> με όλες αυτές τις δαπάνες για τα αρχεία σας!` : ''}`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} κατηγορίες`;
                case 'tags':
                    return `ετικέτες ${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'}`;
                case 'workflows':
                    return `ροές εργασίας ${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'}`;
                case 'distance rates':
                    return `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} χρεώσεις απόστασης`;
                case 'accounting':
                    return `λογιστική ${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'}`;
                case 'Expensify Cards':
                    return `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} Κάρτες Expensify`;
                case 'travel invoicing':
                    return `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} ενοποιημένη χρέωση ταξιδιών`;
                case 'company cards':
                    return `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} εταιρικές κάρτες`;
                case 'invoicing':
                    return `τιμολόγηση ${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'}`;
                case 'per diem':
                    return `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} ημερήσια αποζημίωση`;
                case 'receipt partners':
                    return `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} συνεργάτες αποδείξεων`;
                case 'rules':
                    return `κανόνες ${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'}`;
                case 'tax tracking':
                    return `παρακολούθηση φόρου ${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'}`;
                default:
                    return `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `παρακολούθηση συμμετεχόντων ${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'}`,
        updatedRequireCompanyCards: ({enabled}: {enabled: boolean}) => `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} η απαίτηση για αγορές με εταιρική κάρτα`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} εγκεκριμένες αναφορές αυτόματης πληρωμής`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `ορίστε το όριο για αυτόματη πληρωμή των εγκεκριμένων αναφορών σε «${newLimit}»`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `άλλαξε το όριο αυτόματης πληρωμής εγκεκριμένων αναφορών σε «${newLimit}» (προηγουμένως «${oldLimit}»)`,
        removedAutoPayApprovedReportsLimit: 'αφαίρεσε το όριο για τις αυτόματα εξοφλημένες εγκεκριμένες αναφορές',
        updatedCategoryTaxRate: ({categoryName, oldTax, newTax}: {categoryName: string; oldTax: string; newTax: string}) =>
            `άλλαξε τον προεπιλεγμένο φορολογικό συντελεστή της κατηγορίας «${categoryName}» σε «${newTax}» (προηγουμένως «${oldTax}»)`,
        updatedMccGroupCategory: ({mccGroupName, oldCategory, newCategory}: {mccGroupName: string; oldCategory: string; newCategory: string}) =>
            `άλλαξε την προεπιλεγμένη κατηγορία δαπανών για το «${mccGroupName}» σε «${newCategory}» (προηγουμένως «${oldCategory}»)`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `αλλάχθηκε ο προεπιλεγμένος εγκρίνων σε ${newApprover} (προηγουμένως ${previousApprover})` : `άλλαξε τον προεπιλεγμένο εγκρίνοντα σε ${newApprover}`,
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
            let text = `άλλαξε τη ροή έγκρισης για ${members} ώστε να υποβάλλουν αναφορές σε ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(προηγουμένως προεπιλεγμένος εγκρίνων ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(προηγουμένως προεπιλεγμένος εγκριτής)';
            } else if (previousApprover) {
                text += `(προηγουμένως ${previousApprover})`;
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
                ? `άλλαξε τη ροή έγκρισης για ${members} ώστε να υποβάλλουν αναφορές στον προεπιλεγμένο εγκρίνωντα ${approver}`
                : `άλλαξε τη ροή έγκρισης για ${members} ώστε να υποβάλλουν αναφορές στον προεπιλεγμένο εγκρίνων`;
            if (wasDefaultApprover && previousApprover) {
                text += `(προηγουμένως προεπιλεγμένος εγκρίνων ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(προηγουμένως προεπιλεγμένος εγκριτής)';
            } else if (previousApprover) {
                text += `(προηγουμένως ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `άλλαξε τη ροή έγκρισης για τον/την ${approver} ώστε οι εγκεκριμένες αναφορές να προωθούνται στον/στην ${forwardsTo} (προηγουμένως προωθούνταν στον/στην ${previousForwardsTo})`
                : `άλλαξε τη ροή έγκρισης για τον/την ${approver} ώστε να προωθεί τις εγκεκριμένες αναφορές στον/στην ${forwardsTo} (προηγουμένως τις οριστικά εγκεκριμένες αναφορές)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `άλλαξε τη ροή έγκρισης για τον/την ${approver} ώστε να σταματήσει η προώθηση εγκεκριμένων αναφορών (προηγουμένως προωθούνταν στον/στην ${previousForwardsTo})`
                : `άλλαξε τη ροή έγκρισης για τον/την ${approver} ώστε να σταματήσει την προώθηση εγκεκριμένων αναφορών`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `άλλαξε την επωνυμία της εταιρείας του τιμολογίου σε «${newValue}» (προηγουμένως «${oldValue}»)` : `ορίστε το όνομα εταιρείας του τιμολογίου σε «${newValue}»`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `άλλαξε τον εταιρικό ιστότοπο του τιμολογίου σε «${newValue}» (προηγουμένως «${oldValue}»)` : `ορίστε την εταιρική ιστοσελίδα του τιμολογίου σε «${newValue}»`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser
                ? `άλλαξε τον εξουσιοδοτημένο πληρωτή σε «${newReimburser}» (προηγουμένως «${previousReimburser}»)`
                : `άλλαξε το εξουσιοδοτημένο πρόσωπο πληρωμής σε «${newReimburser}»`,
        updateReimbursementEnabled: (enabled: boolean) => `${enabled ? 'ενεργοποιημένο' : 'απενεργοποιημένο'} επιστροφές χρημάτων`,
        updateCustomTaxName: (oldName: string, newName: string) => `άλλαξε το προσαρμοσμένο όνομα φόρου σε «${newName}» (προηγουμένως «${oldName}»)`,
        updateCurrencyDefaultTax: (oldName: string, newName: string) =>
            `άλλαξε τον προεπιλεγμένο φορολογικό συντελεστή νομίσματος του χώρου εργασίας σε «${newName}» (προηγουμένως «${oldName}»)`,
        updateForeignCurrencyDefaultTax: (oldName: string, newName: string) => `άλλαξε τον προεπιλεγμένο φορολογικό συντελεστή ξένου νομίσματος σε «${newName}» (προηγουμένως «${oldName}»)`,
        addTax: (taxName: string) => `πρόσθεσε τον φόρο «${taxName}»`,
        deleteTax: (taxName: string) => `αφαίρεσε τον φόρο «${taxName}»`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `μετονόμασε τον φόρο «${oldValue}» σε «${newValue}»`;
                }
                case 'code': {
                    return `άλλαξε τον φορολογικό κωδικό για το «${taxName}» από «${oldValue}» σε «${newValue}»`;
                }
                case 'rate': {
                    return `άλλαξε τον φορολογικό συντελεστή για «${taxName}» από «${oldValue}» σε «${newValue}»`;
                }
                case 'enabled': {
                    return `${oldValue ? 'απενεργοποιημένο' : 'ενεργοποιημένο'} ο φόρος «${taxName}»`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: (newValue: string) => `ορίστε το απαιτούμενο ποσό απόδειξης σε «${newValue}»`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `άλλαξε το απαιτούμενο ποσό απόδειξης σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        removedReceiptRequiredAmount: (oldValue: string) => `καταργήθηκε το απαιτούμενο ποσό απόδειξης (προηγουμένως «${oldValue}»)`,
        setItemizedReceiptRequiredAmount: (newValue: string) => `ορίστηκε το απαιτούμενο ποσό αναλυτικής απόδειξης σε «${newValue}»`,
        changedItemizedReceiptRequiredAmount: (oldValue: string, newValue: string) => `άλλαξε το απαιτούμενο ποσό για αναλυτική απόδειξη σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        removedItemizedReceiptRequiredAmount: (oldValue: string) => `αφαιρέθηκε το απαιτούμενο ποσό αναλυτικής απόδειξης (προηγουμένως «${oldValue}»)`,
        setMaxExpenseAmount: (newValue: string) => `ορισμός μέγιστου ποσού δαπάνης σε «${newValue}»`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `άλλαξε το μέγιστο ποσό δαπάνης σε «${newValue}» (προηγουμένως «${oldValue}»)`,
        removedMaxExpenseAmount: (oldValue: string) => `καταργήθηκε το μέγιστο ποσό δαπάνης (προηγουμένως «${oldValue}»)`,
        setMaxExpenseAge: (newValue: string) => `ορίστε μέγιστη ηλικία εξόδων σε «${newValue}» ημέρες`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `άλλαξε το μέγιστο όριο παλαιότητας εξόδων σε «${newValue}» ημέρες (προηγουμένως «${oldValue}»)`,
        removedMaxExpenseAge: (oldValue: string) => `αφαιρέστηκε το μέγιστο όριο παλαιότητας δαπάνης (προηγουμένως «${oldValue}» ημέρες)`,
        policyCopy: {
            overview: (sourcePolicyName: string, sourcePolicyURL: string) => `αντιγράφηκε η επισκόπηση από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            employees: (sourcePolicyName: string, sourcePolicyURL: string) => `αντιγράφηκαν μέλη από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            reportFields: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `αντιγράφηκε 1 πεδίο αναφοράς από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
                other: (count: number) => `αντιγράφηκαν ${count} πεδία αναφοράς από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            }),
            accounting: (sourcePolicyName: string, sourcePolicyURL: string) => `αντιγράφηκαν οι ρυθμίσεις λογιστικής από το <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            receiptPartners: (sourcePolicyName: string, sourcePolicyURL: string) =>
                `αντιγράφηκαν οι ρυθμίσεις παραστατικών συνεργάτη από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            hr: (sourcePolicyName: string, sourcePolicyURL: string) => `αντιγράφηκαν οι ρυθμίσεις HR από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            categories: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `αντιγράφηκε 1 κατηγορία από το <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
                other: (count: number) => `αντιγράφηκαν ${count} κατηγορίες από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            }),
            tags: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `αντιγράφηκε 1 ετικέτα από το <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
                other: (count: number) => `αντιγράφηκαν ${count} ετικέτες από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            }),
            taxes: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `αντιγράφηκε 1 φορολογικός συντελεστής από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
                other: (count: number) => `αντιγράφηκαν ${count} φορολογικοί συντελεστές από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            }),
            timeTracking: (sourcePolicyName: string, sourcePolicyURL: string) => `αντιγράφηκαν οι ρυθμίσεις καταγραφής χρόνου από το <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            workflows: (sourcePolicyName: string, sourcePolicyURL: string) => `αντιγράφηκαν ροές εργασιών από το <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            rules: (sourcePolicyName: string, sourcePolicyURL: string) => `αντιγράφηκαν κανόνες από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            codingRules: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `αντιγράφηκε 1 κανόνας εμπόρου από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
                other: (count: number) => `αντιγράφηκαν ${count} κανόνες εμπόρου από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            }),
            distanceRates: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `αντιγράφηκε 1 χρέωση απόστασης από το <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
                other: (count: number) => `αντιγράφηκαν ${count} χρεώσεις απόστασης από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            }),
            perDiem: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `αντιγράφηκε 1 ημερήσιο επίδομα από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
                other: (count: number) => `αντιγράφηκαν ${count} ημερήσια επιδόματα από την πολιτική <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            }),
            invoices: (sourcePolicyName: string, sourcePolicyURL: string) => `αντιγράφηκαν οι ρυθμίσεις τιμολογίου από το <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
            travel: (sourcePolicyName: string, sourcePolicyURL: string) => `αντιγράφηκαν οι ρυθμίσεις ταξιδιού από το <a href="${sourcePolicyURL}">${sourcePolicyName}</a>`,
        },
    },
    roomMembersPage: {
        memberNotFound: 'Το μέλος δεν βρέθηκε.',
        useInviteButton: 'Για να προσκαλέσετε ένα νέο μέλος στη συνομιλία, χρησιμοποιήστε το κουμπί πρόσκλησης παραπάνω.',
        notAuthorized: `Δεν έχετε πρόσβαση σε αυτήν τη σελίδα. Αν προσπαθείτε να μπείτε σε αυτό το δωμάτιο, απλώς ζητήστε από ένα μέλος του δωματίου να σας προσθέσει. Κάτι άλλο; Επικοινωνήστε με ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Φαίνεται ότι αυτή η συνομιλία έχει αρχειοθετηθεί. Για ερωτήσεις, επικοινωνήστε με ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Είστε βέβαιοι ότι θέλετε να αφαιρέσετε τον/την ${memberName} από το δωμάτιο;`,
            other: 'Είστε βέβαιοι ότι θέλετε να αφαιρέσετε τα επιλεγμένα μέλη από το δωμάτιο;',
        }),
        error: {
            genericAdd: 'Παρουσιάστηκε πρόβλημα κατά την προσθήκη αυτού του μέλους δωματίου',
        },
    },
    newTaskPage: {
        assignTask: 'Ανάθεση εργασίας',
        assignMe: 'Ανάθεση σε εμένα',
        confirmTask: 'Επιβεβαίωση εργασίας',
        confirmError: 'Παρακαλώ εισαγάγετε έναν τίτλο και επιλέξτε έναν προορισμό κοινοποίησης',
        descriptionOptional: 'Περιγραφή (προαιρετικό)',
        pleaseEnterTaskName: 'Παρακαλώ εισαγάγετε έναν τίτλο',
        pleaseEnterTaskDestination: 'Παρακαλώ επιλέξτε πού θέλετε να κοινοποιήσετε αυτήν την εργασία',
    },
    task: {
        task: 'Εργασία',
        title: 'Τίτλος',
        description: 'Περιγραφή',
        assignee: 'Ανάδοχος',
        completed: 'Ολοκληρώθηκε',
        action: 'Ολοκληρώθηκε',
        messages: {
            created: (title: string) => `εργασία για ${title}`,
            completed: 'σημειώθηκε ως ολοκληρωμένο',
            canceled: 'διαγραμμένη εργασία',
            reopened: 'επισημάνθηκε ως μη ολοκληρωμένο',
            error: 'Δεν έχετε δικαίωμα να εκτελέσετε την αιτούμενη ενέργεια',
        },
        markAsComplete: 'Σήμανση ως ολοκληρωμένο',
        markAsIncomplete: 'Σήμανση ως μη ολοκληρωμένο',
        assigneeError: 'Προέκυψε σφάλμα κατά την ανάθεση αυτής της εργασίας. Δοκιμάστε άλλο άτομο για ανάθεση.',
        genericCreateTaskFailureMessage: 'Παρουσιάστηκε σφάλμα κατά τη δημιουργία αυτής της εργασίας. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        deleteTask: 'Διαγραφή εργασίας',
        deleteConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτήν την εργασία;',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `αντίγραφο κίνησης ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Συντομεύσεις πληκτρολογίου',
        subtitle: 'Εξοικονομήστε χρόνο με αυτές τις εύχρηστες συντομεύσεις πληκτρολογίου:',
        shortcuts: {
            openShortcutDialog: 'Ανοίγει το παράθυρο συντομεύσεων πληκτρολογίου',
            markAllMessagesAsRead: 'Σήμανση όλων των μηνυμάτων ως αναγνωσμένων',
            escape: 'Παράκαμψη διαλόγων',
            search: 'Άνοιγμα παραθύρου αναζήτησης',
            newChat: 'Νέα οθόνη συνομιλίας',
            copy: 'Αντιγραφή σχολίου',
            openDebug: 'Άνοιγμα διαλόγου προτιμήσεων δοκιμών',
            expenseReportSearch: 'Αναζήτηση αναφορών εξόδων',
            goToWorkspace: 'Μετάβαση στον χώρο εργασίας της τρέχουσας αναφοράς',
        },
    },
    guides: {
        screenShare: 'Κοινή χρήση οθόνης',
        screenShareRequest: 'Η Expensify σάς προσκαλεί σε κοινή χρήση οθόνης',
    },
    search: {
        tabs: {
            expenseReports: 'Αναφορές εξόδων',
            reports: 'Αναφορές',
            expenses: 'Έξοδα',
            submit: 'Πρόχειρα',
            approve: 'Χρειάζεται έγκριση',
            pay: 'Έτοιμο για πληρωμή',
            accounting: 'Λογιστική',
            export: 'Αναμονή για εξαγωγή',
            unapprovedCash: 'Δεδουλευμένα μετρητών',
            unapprovedCard: 'Δεδουλευμένα κάρτας',
            statements: 'Καταστάσεις κάρτας',
            reconciliation: 'Συμφωνία τραπεζικών λογαριασμών',
            insights: 'Στατιστικά',
            topSpenders: 'Κορυφαίοι δαπανώντες',
            topCategories: 'Κορυφαίες κατηγορίες',
            topMerchants: 'Κορυφαίοι έμποροι',
        },
        resultsAreLimited: 'Τα αποτελέσματα αναζήτησης είναι περιορισμένα.',
        viewResults: 'Προβολή αποτελεσμάτων',
        applyFilters: 'Εφαρμογή φίλτρων',
        appliedFilters: 'Εφαρμοσμένα φίλτρα',
        resetFilters: 'Επαναφορά φίλτρων',
        searchResults: {
            emptyResults: {
                title: 'Τίποτα προς εμφάνιση',
                subtitle: `Δοκιμάστε να προσαρμόσετε τα κριτήρια αναζήτησής σας ή να δημιουργήσετε κάτι με το κουμπί +.`,
            },
            emptyExpenseResults: {
                title: 'Καμία δαπάνη ακόμη',
                subtitle: 'Δημιουργήστε μία δαπάνη ή κάντε ένα δοκιμαστικό χρήσης του Expensify για να μάθετε περισσότερα.',
                subtitleWithOnlyCreateButton: 'Χρησιμοποιήστε το πράσινο κουμπί παρακάτω για να δημιουργήσετε μία δαπάνη.',
            },
            emptyReportResults: {
                title: 'Δεν υπάρχουν ακόμη αναφορές',
                subtitle: 'Δημιουργήστε μια αναφορά ή κάντε μια δοκιμαστική χρήση του Expensify για να μάθετε περισσότερα.',
                subtitleWithOnlyCreateButton: 'Χρησιμοποιήστε το πράσινο κουμπί παρακάτω για να δημιουργήσετε μια αναφορά.',
            },
            emptyInvoiceResults: {
                title: 'Δεν υπάρχουν ακόμη τιμολόγια',
                subtitle: 'Στείλτε ένα τιμολόγιο ή δοκιμάστε το Expensify για να μάθετε περισσότερα.',
                subtitleWithOnlyCreateButton: 'Χρησιμοποιήστε το πράσινο κουμπί παρακάτω για να στείλετε ένα τιμολόγιο.',
                subtitleCannotSend: 'Χρειάζεστε έναν χώρο εργασίας με ενεργοποιημένα τα τιμολόγια για να στέλνετε τιμολόγια.',
                subtitleCannotSendWithTestDrive: 'Χρειάζεστε έναν χώρο εργασίας με ενεργοποιημένα τα τιμολόγια για να στέλνετε τιμολόγια. Δοκιμάστε το Expensify για να μάθετε περισσότερα.',
            },
            emptyTripResults: {
                title: 'Δεν υπάρχουν ακόμη ταξίδια',
                subtitle: 'Ξεκινήστε κλείνοντας το πρώτο σας ταξίδι παρακάτω.',
                buttonText: 'Κάντε κράτηση ταξιδιού',
            },
            emptySubmitResults: {
                title: 'Δεν υπάρχουν έξοδα για υποβολή',
                subtitle: 'Είστε εντάξει. Κάντε έναν γύρο νίκης!',
                buttonText: 'Δημιουργία αναφοράς',
            },
            emptyApproveResults: {
                title: 'Δεν υπάρχουν δαπάνες για έγκριση',
                subtitle: 'Μηδενικές δαπάνες. Μέγιστη χαλάρωση. Μπράβο!',
            },
            emptyPayResults: {
                title: 'Δεν υπάρχουν έξοδα προς πληρωμή',
                subtitle: 'Συγχαρητήρια! Περάσατε τη γραμμή τερματισμού.',
            },
            emptyExportResults: {
                title: 'Δεν υπάρχουν έξοδα για εξαγωγή',
                subtitle: 'Ώρα να χαλαρώσετε, μπράβο σας.',
            },
            emptyStatementsResults: {
                title: 'Δεν υπάρχουν έξοδα για εμφάνιση',
                subtitle: 'Χωρίς αποτελέσματα. Δοκιμάστε να προσαρμόσετε τα φίλτρα σας.',
            },
            emptyUnapprovedResults: {
                title: 'Δεν υπάρχουν δαπάνες για έγκριση',
                subtitle: 'Μηδενικές δαπάνες. Μέγιστη χαλάρωση. Μπράβο!',
            },
        },
        columns: 'Στήλες',
        editColumns: 'Επεξεργασία στηλών',
        resetColumns: 'Επαναφορά στηλών',
        groupColumns: 'Ομαδοποίηση στηλών',
        expenseColumns: 'Στήλες εξόδων',
        saveView: 'Αποθήκευση προβολής',
        deleteSavedSearch: 'Διαγραφή αποθηκευμένης αναζήτησης',
        deleteSavedSearchConfirm: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτήν την αναζήτηση;',
        searchName: 'Αναζήτηση ονόματος',
        savedSearchesMenuItemTitle: 'Αποθηκεύτηκε',
        urlCopied: 'Το URL αντιγράφηκε',
        spendOverTime: 'Δαπάνες με την πάροδο του χρόνου',
        groupedExpenses: 'ομαδοποιημένες δαπάνες',
        bulkActions: {
            editMultiple: 'Επεξεργασία πολλών',
            editMultipleTitle: 'Επεξεργασία πολλών εξόδων',
            editMultipleDescription: 'Οι αλλαγές θα εφαρμοστούν σε όλες τις επιλεγμένες δαπάνες και θα αντικαταστήσουν τυχόν προηγουμένως ορισμένες τιμές.',
            approve: 'Έγκριση',
            pay: 'Πληρωμή',
            delete: 'Διαγραφή',
            hold: 'Σε αναμονή',
            unhold: 'Αφαίρεση κράτησης',
            reject: 'Απόρριψη',
            duplicateExpense: ({count}: {count: number}) => `Διπλότυπο ${count === 1 ? 'δαπάνη' : 'έξοδα'}`,
            duplicateReport: ({count}: {count: number}) => `Διπλότυπο ${count === 1 ? 'αναφορά' : 'αναφορές'}`,
            undelete: 'Αναίρεση διαγραφής',
            noOptionsAvailable: 'Δεν υπάρχουν διαθέσιμες επιλογές για την επιλεγμένη ομάδα δαπανών.',
        },
        filtersHeader: 'Φίλτρα',
        filters: {
            date: {
                before: (date?: string) => `Πριν από ${date ?? ''}`,
                after: (date?: string) => `Μετά από ${date ?? ''}`,
                on: (date?: string) => `Στις ${date ?? ''}`,
                customDate: 'Προσαρμοσμένη ημερομηνία',
                customRange: 'Προσαρμοσμένο εύρος',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Ποτέ',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Τον προηγούμενο μήνα',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Αυτόν τον μήνα',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Έως σήμερα μέσα στο έτος',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: 'Τελευταίοι 12 μήνες',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Τελευταία κατάσταση',
                },
            },
            status: 'Κατάσταση',
            keyword: 'Λέξη-κλειδί',
            keywords: 'Λέξεις-κλειδιά',
            limit: 'Όριο',
            limitDescription: 'Ορίστε ένα όριο για τα αποτελέσματα της αναζήτησής σας.',
            currency: 'Νόμισμα',
            completed: 'Ολοκληρώθηκε',
            amount: {
                lessThan: (amount?: string) => `Λιγότερο από ${amount ?? ''}`,
                greaterThan: (amount?: string) => `Μεγαλύτερο από ${amount ?? ''}`,
                between: (greaterThan?: string, lessThan?: string) => {
                    if (greaterThan && lessThan) {
                        return `Μεταξύ ${greaterThan} και ${lessThan}`;
                    }
                    return 'Μεταξύ';
                },
                equalTo: (amount?: string) => `Ίσο με ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                travelInvoicing: 'Ενοποιημένη τιμολόγηση ταξιδιών',
                individualCards: 'Μεμονωμένες κάρτες',
                closedCards: 'Κλειστές κάρτες',
                cardFeeds: 'Ροές καρτών',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Όλα τα ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Όλες οι εισαγόμενες κάρτες CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            bankAccount: {
                banks: 'Τραπεζικοί λογαριασμοί',
                closedBankAccounts: 'Κλειστοί τραπεζικοί λογαριασμοί',
            },
            reportField: (name: string, value: string) => `${name} είναι ${value}`,
            current: 'Τρέχον',
            past: 'Παρελθόν',
            submitted: 'Υποβλήθηκε',
            approved: 'Εγκρίθηκε',
            firstApprover: 'Πρώτος εγκρίνων',
            firstApproved: 'Πρώτη έγκριση',
            paid: 'Πληρωμένο',
            exported: 'Έγινε εξαγωγή',
            posted: 'Καταχωρισμένο',
            withdrawn: 'Ανακλήθηκε',
            billable: 'Χρεώσιμη',
            reimbursable: 'Επανεντάξιμο',
            purchaseCurrency: 'Νόμισμα αγοράς',
            sortOrder: {
                [CONST.SEARCH.SORT_ORDER.ASC]: 'Αύξουσα',
                [CONST.SEARCH.SORT_ORDER.DESC]: 'Φθίνουσα',
            },
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Από',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Κάρτα',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Αναγνωριστικό ανάληψης',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Κατηγορία',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Έμπορος',
                [CONST.SEARCH.GROUP_BY.TAG]: 'Ετικέτα',
                [CONST.SEARCH.GROUP_BY.MONTH]: 'Μήνας',
                [CONST.SEARCH.GROUP_BY.WEEK]: 'Εβδομάδα',
                [CONST.SEARCH.GROUP_BY.YEAR]: 'Έτος',
                [CONST.SEARCH.GROUP_BY.QUARTER]: 'Τρίμηνο',
            },
            feed: 'Ροή',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Κάρτα Expensify',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Επιστροφή χρημάτων',
                [CONST.SEARCH.WITHDRAWAL_TYPE.CENTRAL_TRAVEL_INVOICING]: 'Ενοποιημένη τιμολόγηση ταξιδιών',
            },
            is: 'Είναι',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Υποβολή',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Έγκριση',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Πληρωμή',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Εξαγωγή',
            },
        },
        display: {
            label: 'Εμφάνιση',
            sortBy: 'Ταξινόμηση κατά',
            sortOrder: 'Σειρά ταξινόμησης',
            groupBy: 'Ομαδοποίηση κατά',
            limitResults: 'Περιορισμός αποτελεσμάτων',
        },
        has: 'Έχει',
        view: {
            label: 'Προβολή',
            table: 'Πίνακας',
            bar: 'Μπαρ',
            line: 'Γραμμή',
            pie: 'Γραφική παράσταση πίτας',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: 'Από',
            [CONST.SEARCH.GROUP_BY.CARD]: 'Κάρτες',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Εξαγωγές',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Κατηγορίες',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Έμποροι',
            [CONST.SEARCH.GROUP_BY.TAG]: 'Ετικέτες',
            [CONST.SEARCH.GROUP_BY.MONTH]: 'Μήνες',
            [CONST.SEARCH.GROUP_BY.WEEK]: 'Εβδομάδες',
            [CONST.SEARCH.GROUP_BY.YEAR]: 'Έτη',
            [CONST.SEARCH.GROUP_BY.QUARTER]: 'Τρίμηνα',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Καμία δαπάνη ακόμη',
            accessPlaceHolder: 'Ανοίξτε για λεπτομέρειες',
        },
        noCategory: 'Χωρίς κατηγορία',
        noMerchant: 'Χωρίς έμπορο',
        noTag: 'Χωρίς ετικέτα',
        expenseType: 'Τύπος εξόδου',
        receiptType: 'Τύπος απόδειξης',
        receiptTypeValues: {
            ereceipt: 'ηλεκτρονική απόδειξη',
            itemized: 'Αναλυτικό',
            hotel: 'Ξενοδοχείο',
        },
        withdrawalType: 'Τύπος ανάληψης',
        recentSearches: 'Πρόσφατες αναζητήσεις',
        recentChats: 'Πρόσφατες συνομιλίες',
        serverResults: 'Αποτελέσματα αναζήτησης',
        searchIn: 'Αναζήτηση σε',
        askConcierge: (message: string) => `Ρωτήστε το Concierge «${message}»`,
        searchPlaceholder: 'Αναζητήστε κάτι...',
        suggestions: 'Προτάσεις',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `Διαθέσιμες προτάσεις${query ? `για ${query}` : ''}. ${count} αποτέλεσμα.`,
            other: (resultCount: number) => `Διαθέσιμες προτάσεις${query ? `για ${query}` : ''}. ${resultCount} αποτελέσματα.`,
        }),
        exportSearchResults: {
            title: 'Δημιουργία εξαγωγής',
            description: 'Ουάου, αυτά είναι πολλά στοιχεία! Θα τα συγκεντρώσουμε και ο Concierge θα σας στείλει σύντομα ένα αρχείο.',
        },
        exportedTo: 'Εξήχθη σε',
        exportAll: {
            selectAllMatchingItems: 'Επιλέξτε όλα τα στοιχεία που ταιριάζουν',
            allMatchingItemsSelected: 'Έχουν επιλεγεί όλα τα στοιχεία που ταιριάζουν',
            selectAllOnThisPage: 'Επιλέξτε όλα σε αυτή τη σελίδα',
        },
        errors: {
            pleaseSelectDatesForBothFromAndTo: 'Παρακαλούμε επιλέξτε ημερομηνίες και για το Από και για το Έως',
        },
    },
    genericErrorPage: {
        title: 'Ωχ, κάτι πήγε στραβά!',
        body: {
            helpTextMobile: 'Παρακαλούμε κλείστε και ξανανοίξτε την εφαρμογή ή μεταβείτε σε',
            helpTextWeb: 'ιστός.',
            helpTextConcierge: 'Αν το πρόβλημα επιμένει, επικοινωνήστε με',
        },
        refresh: 'Ανανέωση',
    },
    fileDownload: {
        success: {
            title: 'Έγινε λήψη!',
            message: 'Το συνημμένο λήφθηκε με επιτυχία!',
            qrMessage:
                'Ελέγξτε τις φωτογραφίες ή τον φάκελο λήψεων για ένα αντίγραφο του κωδικού QR σας. Συμβουλή: προσθέστε τον σε μια παρουσίαση ώστε το κοινό σας να τον σαρώσει και να συνδεθεί απευθείας μαζί σας.',
        },
        generalError: {
            title: 'Σφάλμα συνημμένου',
            message: 'Δεν είναι δυνατή η λήψη του συνημμένου',
        },
        permissionError: {
            title: 'Πρόσβαση στην αποθήκευση',
            message: 'Το Expensify δεν μπορεί να αποθηκεύσει συνημμένα χωρίς πρόσβαση στην αποθήκευση. Πατήστε «ρυθμίσεις» για να ενημερώσετε τα δικαιώματα.',
        },
    },
    settlement: {
        status: {
            pending: 'Σε εκκρεμότητα',
            cleared: 'Εκκαθαρισμένο',
            failed: 'Απέτυχε',
            never: 'Ποτέ',
        },
        failedError: ({link}: {link: string}) => `Θα προσπαθήσουμε ξανά για αυτόν τον διακανονισμό όταν <a href="${link}">ξεκλειδώσετε τον λογαριασμό σας</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Αναγνωριστικό ανάληψης: ${withdrawalID}`,
    },
    paidStatus: {
        markedAsPaid: 'Επισημάνθηκε ως πληρωμένο',
        withdrawing: 'Ανάληψη',
        confirmed: 'Επιβεβαιώθηκε',
    },
    reportLayout: {
        reportLayout: 'Διάταξη αναφοράς',
        groupByLabel: 'Ομαδοποίηση κατά:',
        selectGroupByOption: 'Επιλέξτε πώς θα ομαδοποιηθούν οι δαπάνες αναφοράς',
        uncategorized: 'Χωρίς κατηγορία',
        noTag: 'Χωρίς ετικέτα',
        selectGroup: ({groupName}: {groupName: string}) => `Επιλέξτε όλες τις δαπάνες στο ${groupName}`,
        groupBy: {
            category: 'Κατηγορία',
            tag: 'Ετικέτα',
        },
    },
    report: {
        newReport: {
            createExpense: 'Δημιουργία δαπάνης',
            createReport: 'Δημιουργία αναφοράς',
            chooseWorkspace: 'Επιλέξτε έναν χώρο εργασίας για αυτήν την αναφορά.',
            emptyReportConfirmationTitle: 'Έχετε ήδη μια κενή αναφορά',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Είστε βέβαιοι ότι θέλετε να δημιουργήσετε άλλη μία αναφορά στο ${workspaceName}; Μπορείτε να αποκτήσετε πρόσβαση στις κενές αναφορές σας στο`,
            emptyReportConfirmationDontShowAgain: 'Να μην εμφανιστεί ξανά',
            genericWorkspaceName: 'αυτός ο χώρος εργασίας',
        },
        genericCreateReportFailureMessage: 'Παρουσιάστηκε απρόσμενο σφάλμα κατά τη δημιουργία αυτής της συνομιλίας. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        genericAddCommentFailureMessage: 'Μη αναμενόμενο σφάλμα κατά τη δημοσίευση του σχολίου. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        genericUpdateReportFieldFailureMessage: 'Προέκυψε απρόσμενο σφάλμα κατά την ενημέρωση του πεδίου. Προσπαθήστε ξανά αργότερα.',
        genericUpdateReportNameEditFailureMessage: 'Παρουσιάστηκε απρόσμενο σφάλμα κατά τη μετονομασία της αναφοράς. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        noActivityYet: 'Καμία δραστηριότητα ακόμα',
        connectionSettings: 'Ρυθμίσεις σύνδεσης',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `άλλαξε το ${fieldName} σε «${newValue}» (προηγουμένως «${oldValue}»)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `ορίστε το ${fieldName} σε «${newValue}»`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `άλλαξε τον χώρο εργασίας${fromPolicyName ? `(προηγουμένως ${fromPolicyName})` : ''}`;
                    }
                    return `άλλαξε τον χώρο εργασίας σε ${toPolicyName}${fromPolicyName ? `(προηγουμένως ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `άλλαξε τον τύπο από ${oldType} σε ${newType}`,
                exportedToCSV: `εξήχθη σε CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `εξήχθη σε ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `εξάχθηκε σε ${label} μέσω`,
                    automaticActionTwo: 'ρυθμίσεις λογιστικής',
                    manual: (label: string) => `σήμανε αυτήν την αναφορά ως χειροκίνητα εξαχθείσα στο ${label}.`,
                    automaticActionThree: 'και δημιουργήθηκε επιτυχώς μια εγγραφή για',
                    reimburseableLink: 'έξοδα από ίδια κεφάλαια',
                    nonReimbursableLink: 'έξοδα εταιρικής κάρτας',
                    travelCardLink: 'έξοδα κάρτας ταξιδιού',
                    pending: (label: string) => `ξεκίνησε την εξαγωγή αυτής της αναφοράς στο ${label}...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `αποτυχία εξαγωγής αυτής της αναφοράς σε ${label} ("${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `πρόσθεσε μια απόδειξη`,
                managerDetachReceipt: `αφαίρεσε μια απόδειξη`,
                markedReimbursed: (amount: string, currency: string) => `πληρώθηκε ${currency}${amount} κάπου αλλού`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `πληρώθηκε ${currency}${amount} μέσω ενσωμάτωσης`,
                outdatedBankAccount: `δεν ήταν δυνατή η επεξεργασία της πληρωμής λόγω προβλήματος με τον τραπεζικό λογαριασμό του πληρωτή`,
                reimbursementACHBounceDefault: `δεν ήταν δυνατή η επεξεργασία της πληρωμής λόγω λανθασμένου αριθμού δρομολόγησης/λογαριασμού ή κλειστού λογαριασμού`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `δεν ήταν δυνατή η επεξεργασία της πληρωμής: ${returnReason}`,
                reimbursementACHCancelled: `ακύρωσε την πληρωμή`,
                reimbursementAccountChanged: `δεν ήταν δυνατή η επεξεργασία της πληρωμής, καθώς ο πληρωτής άλλαξε τραπεζικούς λογαριασμούς`,
                reimbursementDelayed: `επεξεργάστηκε την πληρωμή, αλλά θα καθυστερήσει κατά 1–2 ακόμη εργάσιμες ημέρες`,
                selectedForRandomAudit: `επιλέχθηκε τυχαία για έλεγχο`,
                selectedForRandomAuditMarkdown: `[επιλέχθηκε τυχαία](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) για έλεγχο`,
                share: ({to}: ShareParams) => `προσκάλεσε μέλος ${to}`,
                unshare: ({to}: UnshareParams) => `αφαιρέθηκε μέλος ${to}`,
                stripePaid: (amount: string, currency: string) => `πληρώθηκαν ${currency}${amount}`,
                takeControl: `πήρε τον έλεγχο`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `Ανοίξτε την εφαρμογή Expensify στο κινητό για να ελέγξετε τη συναλλαγή ${amountAndMerchantText ? `${amountAndMerchantText} ` : ''} σας`;
                },
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `παρουσιάστηκε πρόβλημα με το συγχρονισμό με ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Διορθώστε το ζήτημα στις <a href="${workspaceAccountingLink}">ρυθμίσεις του χώρου εργασίας</a>.`,
                integrationSyncFailedRecurrence: ({count}: {count: number}) => `(Επαναλήφθηκε ${count} φορές.)`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Η σύνδεση ${feedName} δεν λειτουργεί. Για να επαναφέρετε τις εισαγωγές καρτών, <a href='${workspaceCompanyCardRoute}'>συνδεθείτε στην τράπεζά σας</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `η σύνδεση Plaid με τον επαγγελματικό σας τραπεζικό λογαριασμό έχει διακοπεί. Παρακαλούμε <a href='${walletRoute}'>συνδέστε ξανά τον τραπεζικό σας λογαριασμό ${maskedAccountNumber}</a> ώστε να μπορείτε να συνεχίσετε να χρησιμοποιείτε τις Κάρτες Expensify.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) => {
                    const translatedRole = String(translations.workspace.common.roleName(role)).toLowerCase();
                    const article = role === CONST.POLICY.ROLE.AUDITOR ? 'ένα' : 'α';
                    return didJoinPolicy ? `${email} συμμετείχε μέσω του συνδέσμου πρόσκλησης του χώρου εργασίας` : `προστέθηκε ο/η ${email} ως ${article} ${translatedRole}`;
                },
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `ενημέρωσε τον ρόλο του/της ${email} σε ${newRole} (προηγουμένως ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `αφαιρέθηκε το προσαρμοσμένο πεδίο 1 του/της ${email} (προηγουμένως «${previousValue}»)`;
                    }
                    return !previousValue
                        ? `προστέθηκε το «${newValue}» στο προσαρμοσμένο πεδίο 1 του ${email}`
                        : `αλλάχθηκε το προσαρμοσμένο πεδίο 1 του/της ${email} σε «${newValue}» (προηγουμένως «${previousValue}»)`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `αφαιρέθηκε το προσαρμοσμένο πεδίο 2 του/της ${email} (προηγουμένως «${previousValue}»)`;
                    }
                    return !previousValue
                        ? `προστέθηκε το «${newValue}» στο πεδίο προσαρμογής 2 του/της ${email}`
                        : `άλλαξε το προσαρμοσμένο πεδίο 2 του ${email} σε «${newValue}» (προηγουμένως «${previousValue}»)`;
                },
                leftWorkspace: (nameOrEmail: string) => `${nameOrEmail} έφυγε από τον χώρο εργασίας`,
                removeMember: (email: string, role: string) => `αφαιρέθηκε ο/η ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `αφαιρέθηκε η σύνδεση με ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `συνδέθηκε με το ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'έφυγε από τη συνομιλία',
                leftTheChatWithName: (nameOrEmail: string) => `${nameOrEmail ? `${nameOrEmail}: ` : ''} έφυγε από τη συνομιλία`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `ο επαγγελματικός τραπεζικός λογαριασμός ${maskedBankAccountNumber} έχει κλειδωθεί αυτόματα λόγω προβλήματος είτε με τις αποζημιώσεις είτε με τον διακανονισμό της Κάρτας Expensify. Παρακαλούμε διορθώστε το πρόβλημα στις <a href="${linkURL}">ρυθμίσεις χώρου εργασίας</a>.`,
            },
            error: {
                invalidCredentials: 'Μη έγκυρα διαπιστευτήρια, παρακαλούμε ελέγξτε τη ρύθμιση της σύνδεσής σας.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `${summary} για ${dayCount} ${dayCount === 1 ? 'ημέρα' : 'ημέρες'} έως ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `${summary} από ${timePeriod} στις ${date}`,
        startTimer: 'Έναρξη χρονομέτρου',
        stopTimer: (duration: string) => `Διακοπή χρονομέτρου (${duration})`,
        scheduleOOO: 'Προγραμματισμός άδειας',
        scheduleOOOTitle: 'Προγραμματισμός εκτός γραφείου',
        date: 'Ημερομηνία έναρξης',
        endDate: 'Ημερομηνία λήξης',
        time: 'Ώρα (χρησιμοποιήστε 24ωρη μορφή)',
        durationAmount: 'Διάρκεια',
        durationUnit: 'Μονάδα',
        reason: 'Αιτία',
        workingPercentage: 'Ποσοστό εργασίας',
        dateRequired: 'Η ημερομηνία έναρξης είναι υποχρεωτική.',
        endDateBeforeStart: 'Η ημερομηνία λήξης δεν μπορεί να είναι πριν από την ημερομηνία έναρξης.',
        invalidTimeFormat: 'Παρακαλούμε εισαγάγετε μια έγκυρη ώρα 24ώρου (π.χ. 14:30).',
        enterANumber: 'Παρακαλώ εισαγάγετε έναν αριθμό.',
        hour: 'ώρες',
        day: 'ημέρες',
        week: 'εβδομάδες',
        month: 'μήνες',
    },
    footer: {
        features: 'Λειτουργίες',
        expenseManagement: 'Διαχείριση εξόδων',
        spendManagement: 'Διαχείριση δαπανών',
        expenseReports: 'Αναφορές εξόδων',
        companyCreditCard: 'Εταιρική πιστωτική κάρτα',
        receiptScanningApp: 'Εφαρμογή σάρωσης αποδείξεων',
        billPay: 'Πληρωμή λογαριασμών',
        invoicing: 'Τιμολόγηση',
        CPACard: 'Κάρτα CPA',
        payroll: 'Μισθοδοσία',
        travel: 'Ταξίδι',
        resources: 'Πόροι',
        expensifyApproved: 'Εγκρίθηκε από την Expensify!',
        pressKit: 'Υλικό Τύπου',
        support: 'Υποστήριξη',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Όροι χρήσης',
        privacy: 'Απόρρητο',
        learnMore: 'Μάθετε περισσότερα',
        aboutExpensify: 'Σχετικά με το Expensify',
        blog: 'Ιστολόγιο',
        jobs: 'Εργασίες',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Σχέσεις με επενδυτές',
        getStarted: 'Ξεκινήστε',
        createAccount: 'Δημιουργία νέου λογαριασμού',
        logIn: 'Σύνδεση',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Μεταβείτε πίσω στη λίστα συνομιλιών',
        chatWelcomeMessage: 'Μήνυμα καλωσορίσματος συνομιλίας',
        navigatesToChat: 'Πλοηγείται σε μια συνομιλία',
        newMessageLineIndicator: 'Δείκτης νέας γραμμής μηνύματος',
        chatMessage: 'Μήνυμα συνομιλίας',
        lastChatMessagePreview: 'Προεπισκόπηση τελευταίου μηνύματος συνομιλίας',
        workspaceName: 'Όνομα χώρου εργασίας',
        chatUserDisplayNames: 'Εμφανιζόμενα ονόματα μελών συνομιλίας',
        scrollToNewestMessages: 'Κύλιση στα νεότερα μηνύματα',
        scrollToActionBadgeTarget: 'Κάντε κύλιση στην ενέργεια που απαιτεί προσοχή',
        preStyledText: 'Προ-μορφοποιημένο κείμενο',
        viewAttachment: 'Προβολή συνημμένου',
        contextMenuAvailable: 'Το μενού περιβάλλοντος είναι διαθέσιμο. Πατήστε Shift+F10 για να το ανοίξετε.',
        contextMenuAvailableMacOS: 'Διαθέσιμο μενού περιβάλλοντος. Πατήστε VO-Shift-M για να το ανοίξετε.',
        contextMenuAvailableNative: 'Μενού περιβάλλοντος διαθέσιμο. Διπλό πάτημα και παρατεταμένο κράτημα για άνοιγμα.',
        selectAllFeatures: 'Επιλέξτε όλες τις λειτουργίες',
        selectAllTransactions: 'Επιλέξτε όλες τις συναλλαγές',
        selectAllItems: 'Επιλέξτε όλα τα στοιχεία',
        openActionsMenu: 'Άνοιγμα μενού ενεργειών',
        selectAllCategories: 'Επιλέξτε όλες τις κατηγορίες',
        selectAllDistanceRates: 'Επιλέξτε όλα τα χιλιομετρικά κόστη',
        selectAllTags: 'Επιλέξτε όλες τις ετικέτες',
        selectAllTaxes: 'Επιλέξτε όλους τους φόρους',
        selectAllPerDiemRates: 'Επιλέξτε όλα τα ημερήσια επιδόματα',
        selectAllMembers: 'Επιλέξτε όλα τα μέλη',
        selectAllValues: 'Επιλέξτε όλες τις τιμές',
        selectAllRules: 'Επιλέξτε όλους τους κανόνες',
    },
    parentReportAction: {
        deletedReport: 'Διαγραμμένη αναφορά',
        deletedMessage: 'Διαγραμμένο μήνυμα',
        deletedExpense: 'Διαγραμμένη δαπάνη',
        reversedTransaction: 'Αντιστροφή συναλλαγής',
        deletedTask: 'Διαγραμμένη εργασία',
        hiddenMessage: 'Κρυφό μήνυμα',
    },
    threads: {
        thread: 'Νήμα',
        replies: 'Απαντήσεις',
        reply: 'Απάντηση',
        from: 'Από',
        in: 'σε',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Από ${reportName}${workspaceName ? `στο ${workspaceName}` : ''}`,
    },
    qrCodes: {
        qrCode: 'κωδικός QR',
        copy: 'Αντιγραφή URL',
        copied: 'Αντιγράφηκε!',
    },
    moderation: {
        flagDescription: 'Όλα τα επισημασμένα μηνύματα θα αποστέλλονται σε συντονιστή για έλεγχο.',
        chooseAReason: 'Επιλέξτε έναν λόγο για αναφορά παρακάτω:',
        spam: 'Ανεπιθύμητο μήνυμα',
        spamDescription: 'Απρόσκλητη άσχετη προώθηση',
        inconsiderate: 'Απρόσεκτος',
        inconsiderateDescription: 'Υβριστική ή προσβλητική διατύπωση, με αμφίβολες προθέσεις',
        intimidation: 'Εκφοβισμός',
        intimidationDescription: 'Επιθετική προώθηση μιας ατζέντας παρά τις βάσιμες αντιρρήσεις',
        bullying: 'Εκφοβισμός',
        bullyingDescription: 'Στοχοποίηση ατόμου με σκοπό την υπακοή',
        harassment: 'Παρενόχληση',
        harassmentDescription: 'Ρατσιστική, μισογυνική ή άλλη γενικότερα διακριτική συμπεριφορά',
        assault: 'Επίθεση',
        assaultDescription: 'Στοχευμένη συναισθηματική επίθεση με πρόθεση πρόκλησης βλάβης',
        flaggedContent: 'Αυτό το μήνυμα έχει επισημανθεί ως παραβίαση των κανόνων της κοινότητάς μας και το περιεχόμενο έχει αποκρυφτεί.',
        hideMessage: 'Απόκρυψη μηνύματος',
        revealMessage: 'Εμφάνιση μηνύματος',
        levelOneResult: 'Στέλνει ανώνυμη προειδοποίηση και το μήνυμα αναφέρεται για έλεγχο.',
        levelTwoResult: 'Το μήνυμα αποκρύφθηκε από το κανάλι, στάλθηκε ανώνυμη προειδοποίηση και το μήνυμα αναφέρθηκε για έλεγχο.',
        levelThreeResult: 'Το μήνυμα αφαιρέθηκε από το κανάλι, στάλθηκε ανώνυμη προειδοποίηση και το μήνυμα αναφέρθηκε για έλεγχο.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Πρόσκληση για υποβολή εξόδων',
        inviteToChat: 'Πρόσκληση μόνο σε συνομιλία',
        nothing: 'Μην κάνετε τίποτα',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Αποδοχή',
        decline: 'Απόρριψη',
    },
    actionableMentionTrackExpense: {
        submit: 'Υποβάλετέ το σε κάποιον',
        categorize: 'Κατηγοριοποιήστε το',
        share: 'Κοινοποιήστε το στον λογιστή μου',
        nothing: 'Τίποτα προς το παρόν',
    },
    teachersUnitePage: {
        teachersUnite: 'Ενότητα Εκπαιδευτικών',
        joinExpensifyOrg:
            'Συμμετάσχετε στο Expensify.org για να εξαλείψουμε την αδικία σε όλο τον κόσμο. Η τρέχουσα καμπάνια «Teachers Unite» στηρίζει εκπαιδευτικούς παντού, μοιράζοντας το κόστος για βασικά σχολικά είδη.',
        iKnowATeacher: 'Ξέρω έναν δάσκαλο',
        iAmATeacher: 'Είμαι δάσκαλος',
        personalKarma: {
            title: 'Ενεργοποίηση προσωπικού κάρμα',
            description: 'Δωρίστε 1 $ στο Expensify.org για κάθε 500 $ που ξοδεύετε κάθε μήνα',
            stopDonationsPrompt: 'Είστε βέβαιοι ότι θέλετε να σταματήσετε να δωρίζετε στο Expensify.org;',
        },
        getInTouch: 'Εξαιρετικά! Παρακαλούμε κοινοποιήστε τα στοιχεία τους ώστε να μπορέσουμε να επικοινωνήσουμε μαζί τους.',
        introSchoolPrincipal: 'Εισαγωγή στον διευθυντή του σχολείου σας',
        schoolPrincipalVerifyExpense:
            'Το Expensify.org μοιράζεται το κόστος των βασικών σχολικών ειδών ώστε οι μαθητές από νοικοκυριά χαμηλού εισοδήματος να μπορούν να έχουν καλύτερη μαθησιακή εμπειρία. Ο/Η διευθυντής/ρια του σχολείου σας θα κληθεί να επαληθεύσει τα έξοδά σας.',
        principalFirstName: 'Όνομα κύριου υπευθύνου',
        principalLastName: 'Επώνυμο υπεύθυνου',
        principalWorkEmail: 'Κύρια υπηρεσιακή διεύθυνση email',
        updateYourEmail: 'Ενημερώστε τη διεύθυνση email σας',
        updateEmail: 'Ενημέρωση διεύθυνσης email',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Πριν προχωρήσετε, βεβαιωθείτε ότι έχετε ορίσει το σχολικό σας email ως την προεπιλεγμένη μέθοδο επικοινωνίας. Μπορείτε να το κάνετε από Ρυθμίσεις > Προφίλ > <a href="${contactMethodsRoute}">Μέθοδοι επικοινωνίας</a>.`,
        error: {
            enterPhoneEmail: 'Εισαγάγετε ένα έγκυρο email ή αριθμό τηλεφώνου',
            enterEmail: 'Εισαγάγετε ένα email',
            enterValidEmail: 'Εισαγάγετε ένα έγκυρο email',
            tryDifferentEmail: 'Παρακαλούμε δοκιμάστε διαφορετική διεύθυνση email',
        },
    },
    cardTransactions: {
        notActivated: 'Μη ενεργοποιημένο',
        outOfPocket: 'Επανεντάξιμο',
        companySpend: 'Μη επιστρέψιμο',
        personalCard: 'Προσωπική κάρτα',
        companyCard: 'Εταιρική κάρτα',
        expensifyCard: 'Κάρτα Expensify',
        travelInvoicing: 'Ενοποιημένη τιμολόγηση ταξιδιών',
        travelCard: 'Travel Card',
    },
    distance: {
        addStop: 'Προσθήκη στάσης',
        address: 'Διεύθυνση',
        waypointDescription: {
            start: 'Έναρξη',
            stop: 'Διακοπή',
        },
        mapPending: {
            title: 'Εκκρεμεί αντιστοίχιση',
            subtitle: 'Ο χάρτης θα δημιουργηθεί όταν συνδεθείτε ξανά στο διαδίκτυο',
            onlineSubtitle: 'Μία στιγμή όσο ρυθμίζουμε τον χάρτη',
            errorTitle: 'Σφάλμα χάρτη',
            errorSubtitle: 'Παρουσιάστηκε σφάλμα κατά τη φόρτωση του χάρτη. Παρακαλούμε δοκιμάστε ξανά.',
        },
        error: {
            selectSuggestedAddress: 'Παρακαλείστε να επιλέξετε μια προτεινόμενη διεύθυνση ή να χρησιμοποιήσετε την τρέχουσα τοποθεσία',
        },
        odometer: {
            startReading: 'Ξεκινήστε την ανάγνωση',
            endReading: 'Τέλος ανάγνωσης',
            saveForLater: 'Αποθήκευση για αργότερα',
            totalDistance: 'Συνολική απόσταση',
            startTitle: 'Φωτογραφία αρχής χιλιομετρητή',
            endTitle: 'Φωτογραφία τέλους χιλιομετρητή',
            deleteOdometerPhoto: 'Διαγραφή φωτογραφίας χιλιομετρητή',
            deleteOdometerPhotoConfirmation: 'Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή τη φωτογραφία οδομέτρου;',
            startMessageWeb: 'Προσθέστε μια φωτογραφία του χιλιομετρητή σας από την <strong>αρχή</strong> του ταξιδιού σας. Σύρετε εδώ ένα αρχείο ή επιλέξτε ένα για μεταφόρτωση.',
            endMessageWeb: 'Προσθέστε μια φωτογραφία του χιλιομετρητή σας από το <strong>τέλος</strong> του ταξιδιού σας. Σύρετε ένα αρχείο εδώ ή επιλέξτε ένα για μεταφόρτωση.',
            cameraAccessRequired: 'Απαιτείται πρόσβαση στην κάμερα για τη λήψη φωτογραφιών.',
            snapPhotoStart: '<muted-text-label>Βγάλτε μια φωτογραφία το χιλιομετρητή σας στην <strong>αρχή</strong> του ταξιδιού σας.</muted-text-label>',
            snapPhotoEnd: '<muted-text-label>Βγάλτε μια φωτογραφία του χιλιομετρητή σας στο <strong>τέλος</strong> του ταξιδιού σας.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: 'Αποτυχία εκκίνησης εντοπισμού τοποθεσίας.',
            failedToGetPermissions: 'Αποτυχία λήψης των απαιτούμενων δικαιωμάτων τοποθεσίας.',
        },
        trackingDistance: 'Γίνεται παρακολούθηση απόστασης...',
        stopped: 'Διακόπηκε',
        start: 'Έναρξη',
        stop: 'Διακοπή',
        save: 'Αποθήκευση',
        resume: 'Βιογραφικό',
        discard: 'Απόρριψη',
        discardDistanceTrackingModal: {
            title: 'Απόρριψη παρακολούθησης απόστασης',
            prompt: 'Είστε βέβαιοι; Αυτό θα απορρίψει την τρέχουσα πορεία σας και δεν μπορεί να αναιρεθεί.',
            confirm: 'Απόρριψη παρακολούθησης απόστασης',
        },
        zeroDistanceTripModal: {
            title: 'Αδυναμία δημιουργίας δαπάνης',
            prompt: 'Δεν μπορείτε να δημιουργήσετε έξοδο με το ίδιο σημείο έναρξης και λήξης.',
        },
        locationRequiredModal: {
            title: 'Απαιτείται πρόσβαση τοποθεσίας',
            prompt: 'Παρακαλούμε επιτρέψτε την πρόσβαση στην τοποθεσία στις ρυθμίσεις της συσκευής σας για να ξεκινήσει η παρακολούθηση απόστασης μέσω GPS.',
            allow: 'Να επιτρέπεται',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Απαιτείται πρόσβαση τοποθεσίας στο παρασκήνιο',
            prompt: 'Παρακαλούμε επιτρέψτε την πρόσβαση τοποθεσίας στο παρασκήνιο στις ρυθμίσεις της συσκευής σας (επιλογή «Να επιτρέπεται πάντα») για να ξεκινήσει η καταγραφή απόστασης μέσω GPS.',
        },
        preciseLocationRequiredModal: {
            title: 'Απαιτείται ακριβής τοποθεσία',
            prompt: 'Ενεργοποιήστε την «ακριβή τοποθεσία» στις ρυθμίσεις της συσκευής σας για να ξεκινήσει η παρακολούθηση απόστασης μέσω GPS.',
        },
        desktop: {
            title: 'Παρακολουθήστε την απόσταση στο τηλέφωνό σας',
            subtitle: 'Καταγράψτε μίλια ή χιλιόμετρα αυτόματα με GPS και μετατρέψτε τα ταξίδια σε δαπάνες αμέσως.',
            button: 'Κάντε λήψη της εφαρμογής',
        },
        notification: {
            title: 'Παρακολούθηση GPS σε εξέλιξη',
            body: 'Μεταβείτε στην εφαρμογή για να ολοκληρώσετε',
        },
        continueGpsTripModal: {
            title: 'Να συνεχιστεί η καταγραφή διαδρομής GPS;',
            prompt: 'Φαίνεται ότι η εφαρμογή έκλεισε κατά τη διάρκεια της τελευταίας σας διαδρομής GPS. Θα θέλατε να συνεχίσετε την καταγραφή από εκείνη τη διαδρομή;',
            confirm: 'Συνεχίστε το ταξίδι',
            cancel: 'Προβολή ταξιδιού',
        },
        signOutWarningTripInProgress: {
            title: 'Παρακολούθηση GPS σε εξέλιξη',
            prompt: 'Είστε βέβαιοι ότι θέλετε να απορρίψετε το ταξίδι και να αποσυνδεθείτε;',
            confirm: 'Απόρριψη και αποσύνδεση',
        },
        switchToODWarningTripInProgress: {
            title: 'Παρακολούθηση GPS σε εξέλιξη',
            prompt: 'Είστε βέβαιοι ότι θέλετε να διακόψετε την παρακολούθηση GPS και να μεταβείτε στο Expensify Classic;',
            confirm: 'Διακοπή και εναλλαγή',
        },
        switchAccountWarningTripInProgress: {
            title: 'Παρακολούθηση GPS σε εξέλιξη',
            prompt: 'Είστε βέβαιοι ότι θέλετε να σταματήσετε την παρακολούθηση GPS και να αλλάξετε λογαριασμό;',
            confirm: 'Διακοπή και εναλλαγή',
        },
        locationServicesRequiredModal: {
            title: 'Απαιτείται πρόσβαση τοποθεσίας',
            confirm: 'Ανοίξτε τις ρυθμίσεις',
            prompt: 'Παρακαλούμε επιτρέψτε την πρόσβαση στην τοποθεσία στις ρυθμίσεις της συσκευής σας για να ξεκινήσει η παρακολούθηση απόστασης μέσω GPS.',
        },
        gpsFloatingPillText: 'Παρακολούθηση GPS σε εξέλιξη...',
        liveActivity: {
            subtitle: 'Παρακολούθηση απόστασης',
            lockScreenBadgeText: 'Απόσταση',
            lockScreenTrackingText: 'Παρακολούθηση...',
            button: 'Προβολή προόδου',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Δήλωση απώλειας ή φθοράς κάρτας',
        nextButtonLabel: 'Επόμενο',
        reasonTitle: 'Γιατί χρειάζεστε νέα κάρτα;',
        cardDamaged: 'Η κάρτα μου έχει υποστεί ζημιά',
        cardLostOrStolen: 'Η κάρτα μου χάθηκε ή κλάπηκε',
        confirmAddressTitle: 'Παρακαλούμε επιβεβαιώστε τη ταχυδρομική διεύθυνση για τη νέα σας κάρτα.',
        cardDamagedInfo: 'Η νέα σας κάρτα θα φτάσει σε 2–3 εργάσιμες ημέρες. Η τρέχουσα κάρτα σας θα συνεχίσει να λειτουργεί μέχρι να ενεργοποιήσετε τη νέα σας.',
        cardLostOrStolenInfo: 'Η τρέχουσα κάρτα σας θα απενεργοποιηθεί οριστικά μόλις καταχωριστεί η παραγγελία σας. Οι περισσότερες κάρτες παραδίδονται μέσα σε λίγες εργάσιμες ημέρες.',
        address: 'Διεύθυνση',
        deactivateCardButton: 'Απενεργοποίηση κάρτας',
        shipNewCardButton: 'Αποστολή νέας κάρτας',
        addressError: 'Η διεύθυνση είναι υποχρεωτική',
        reasonError: 'Απαιτείται αιτιολογία',
        successTitle: 'Η νέα σας κάρτα είναι καθ’ οδόν!',
        successDescription: 'Θα χρειαστεί να την ενεργοποιήσετε μόλις φτάσει σε λίγες εργάσιμες ημέρες. Στο μεταξύ, μπορείτε να χρησιμοποιήσετε μια εικονική κάρτα.',
    },
    eReceipt: {
        guaranteed: 'Εγγυημένη ηλεκτρονική απόδειξη',
        transactionDate: 'Ημερομηνία συναλλαγής',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Ξεκινήστε μια συνομιλία, <success><strong>προτείνετε έναν φίλο</strong></success>.',
            header: 'Ξεκινήστε συνομιλία, προτείνετε έναν φίλο',
            closeAccessibilityLabel: 'Κλείσιμο, έναρξη συνομιλίας, προτείνετε έναν φίλο, πανό',
            body: 'Θέλετε και οι φίλοι σας να χρησιμοποιούν το Expensify; Απλώς ξεκινήστε μια συνομιλία μαζί τους και εμείς θα φροντίσουμε τα υπόλοιπα.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Υποβάλετε μία δαπάνη, <success><strong>προτείνετε την ομάδα σας</strong></success>.',
            header: 'Υποβάλετε μία δαπάνη, παραπέμψτε την ομάδα σας',
            closeAccessibilityLabel: 'Κλείσιμο, υποβολή μιας δαπάνης, προτείνετε την ομάδα σας, πανό',
            body: 'Θέλετε να χρησιμοποιεί και η ομάδα σας το Expensify; Απλώς υποβάλετε μια δαπάνη σε αυτούς και εμείς θα φροντίσουμε τα υπόλοιπα.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Συστήστε έναν φίλο',
            body: 'Θέλετε να χρησιμοποιούν και οι φίλοι σας το Expensify; Απλώς συνομιλήστε, πληρώστε ή μοιράστε μια δαπάνη μαζί τους και θα αναλάβουμε εμείς τα υπόλοιπα. Ή απλώς κοινοποιήστε τον σύνδεσμο πρόσκλησής σας!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Συστήστε έναν φίλο',
            header: 'Συστήστε έναν φίλο',
            body: 'Θέλετε να χρησιμοποιούν και οι φίλοι σας το Expensify; Απλώς συνομιλήστε, πληρώστε ή μοιράστε μια δαπάνη μαζί τους και θα αναλάβουμε εμείς τα υπόλοιπα. Ή απλώς κοινοποιήστε τον σύνδεσμο πρόσκλησής σας!',
        },
        copyReferralLink: 'Αντιγραφή συνδέσμου πρόσκλησης',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Συνομιλήστε με τον account executive σας στο <a href="${href}">${adminReportName}</a> για βοήθεια`,
        default: `Στείλτε μήνυμα στο <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> για βοήθεια με τη ρύθμιση`,
    },
    violations: {
        allTagLevelsRequired: 'Απαιτούνται όλες οι ετικέτες',
        autoReportedRejectedExpense: 'Αυτή η δαπάνη απορρίφθηκε.',
        billableExpense: 'Χρεώσιμο, δεν ισχύει πλέον',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `Απαιτείται απόδειξη${formattedLimit ? `πάνω από ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Η κατηγορία δεν είναι πλέον έγκυρη',
        conversionSurcharge: (surcharge: number) => `Εφαρμόστηκε προσαύξηση μετατροπής ${surcharge}%`,
        customUnitOutOfPolicy: 'Η τιμή δεν είναι έγκυρη για αυτόν τον χώρο εργασίας',
        customUnitRateOutOfDateRange: ({startDate, endDate}: {startDate: string; endDate: string}) => `Η χρέωση ισχύει μόνο από ${startDate} έως ${endDate}`,
        customUnitRateOutOfDateRangeStartOnly: ({startDate}: {startDate: string}) => `Η τιμή ισχύει μόνο από ${startDate}`,
        customUnitRateOutOfDateRangeEndOnly: ({endDate}: {endDate: string}) => `Η τιμή ισχύει μόνο έως ${endDate}`,
        duplicatedTransaction: 'Πιθανό διπλότυπο',
        fieldRequired: 'Τα πεδία αναφοράς είναι υποχρεωτικά',
        futureDate: 'Η μελλοντική ημερομηνία δεν επιτρέπεται',
        inactiveVendor: 'Ο προμηθευτής δεν είναι πλέον έγκυρος',
        invoiceMarkup: (invoiceMarkup: number) => `Με επιπλέον χρέωση ${invoiceMarkup}%`,
        maxAge: (maxAge: number) => `Η ημερομηνία είναι παλαιότερη από ${maxAge} ημέρες`,
        missingCategory: 'Λείπει κατηγορία',
        missingComment: 'Απαιτείται περιγραφή για την επιλεγμένη κατηγορία',
        missingAttendees: 'Απαιτούνται πολλοί συμμετέχοντες για αυτήν την κατηγορία',
        missingTag: (tagName?: string) => `Λείπει το ${tagName ?? 'ετικέτα'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Το ποσό διαφέρει από την υπολογισμένη απόσταση';
                case 'card':
                    return 'Ποσό μεγαλύτερο από τη συναλλαγή κάρτας';
                default:
                    if (displayPercentVariance) {
                        return `Ποσό κατά ${displayPercentVariance}% μεγαλύτερο από την σαρωμένη απόδειξη`;
                    }
                    return 'Ποσό μεγαλύτερο από την σαρωμένη απόδειξη';
            }
        },
        modifiedDate: 'Η ημερομηνία διαφέρει από την σαρωμένη απόδειξη',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `Η απόσταση υπερβαίνει τη διαδρομή που υπολογίστηκε (${formattedRouteDistance})` : 'Η απόσταση υπερβαίνει τη διαδρομή που έχει υπολογιστεί',
        nonExpensiworksExpense: 'Έξοδο μη συνδεδεμένο με το Expensiworks',
        overAutoApprovalLimit: (formattedLimit: string) => `Η δαπάνη υπερβαίνει το όριο αυτόματης έγκρισης των ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `Ποσό πάνω από το όριο κατηγορίας ${formattedLimit}/άτομο`,
        overLimit: (formattedLimit: string) => `Ποσό πάνω από το όριο ${formattedLimit}/άτομο`,
        overTripLimit: (formattedLimit: string) => `Ποσό πάνω από το όριο ${formattedLimit}/διαδρομή`,
        overLimitAttendee: (formattedLimit: string) => `Ποσό πάνω από το όριο ${formattedLimit}/άτομο`,
        perDayLimit: (formattedLimit: string) => `Ποσό πάνω από το ημερήσιο όριο κατηγορίας ${formattedLimit}/άτομο`,
        receiptNotSmartScanned: 'Τα στοιχεία απόδειξης και δαπάνης προστέθηκαν χειροκίνητα.',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `Απαιτείται απόδειξη πάνω από το όριο κατηγορίας ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Απαιτείται απόδειξη για ποσά άνω των ${formattedLimit}`;
            }
            if (category) {
                return `Απαιτείται απόδειξη πάνω από το όριο κατηγορίας`;
            }
            return 'Απαιτείται απόδειξη';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `Απαιτείται αναλυτική απόδειξη${formattedLimit ? `πάνω από ${formattedLimit}` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = 'Απαγορευμένη δαπάνη:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `αλκοόλ`;
                    case 'gambling':
                        return `τζόγος`;
                    case 'tobacco':
                        return `καπνός`;
                    case 'adultEntertainment':
                        return `ψυχαγωγία ενηλίκων`;
                    case 'hotelIncidentals':
                        return `έξοδα ξενοδοχείου`;
                    case 'giftCard':
                        return `αγορές δωροκαρτών`;
                    case 'handwrittenReceipt':
                        return `χειρόγραφες αποδείξεις`;
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
        reviewRequired: 'Απαιτείται έλεγχος',
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
                return 'Δεν είναι δυνατή η αυτόματη αντιστοίχιση της απόδειξης λόγω σπασμένης σύνδεσης με την τράπεζα.';
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return 'Δεν είναι δυνατή η αυτόματη αντιστοίχιση της απόδειξης λόγω σπασμένης σύνδεσης με την τράπεζα.';
                }
                return isMarkAsCash
                    ? `Δεν είναι δυνατή η αυτόματη αντιστοίχιση της απόδειξης λόγω χαλασμένης σύνδεσης κάρτας. Σημειώστε την ως μετρητά για να την αγνοήσετε ή <a href="${connectionLink}">διορθώστε την κάρτα</a> για να αντιστοιχίσετε την απόδειξη.`
                    : `Δεν είναι δυνατή η αυτόματη αντιστοίχιση της απόδειξης λόγω χαλασμένης σύνδεσης της κάρτας. <a href="${connectionLink}">Διορθώστε την κάρτα</a> για να αντιστοιχίσετε την απόδειξη.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Η σύνδεση με την τράπεζα διακόπηκε. <a href="${companyCardPageURL}">Επανασυνδέστε για να αντιστοιχίσετε την απόδειξη</a>`
                    : 'Η σύνδεση με την τράπεζα διακόπηκε. Ζητήστε από ένα διαχειριστή να την επανασυνδέσει για να γίνει αντιστοίχιση της απόδειξης.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Ζητήστε από τον/την ${member} να το σημειώσει ως μετρητά ή περιμένετε 7 ημέρες και δοκιμάστε ξανά` : 'Αναμονή για συγχώνευση με συναλλαγή κάρτας.';
            }
            return '';
        },
        brokenConnection530Error: 'Η απόδειξη εκκρεμεί λόγω αποσυνδεδεμένου τραπεζικού λογαριασμού',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Η απόδειξη εκκρεμεί λόγω κατεστραμμένης σύνδεσης τράπεζας. Παρακαλώ επιλύστε το στις <a href="${workspaceCompanyCardRoute}">εταιρικές κάρτες</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Η απόδειξη εκκρεμεί λόγω προβλήματος στη σύνδεση με την τράπεζα. Παρακαλείστε να ζητήσετε από έναν διαχειριστή χώρου εργασίας να το επιλύσει.',
        markAsCashToIgnore: 'Σημειώστε ως μετρητά για να την αγνοήσετε και να ζητήσετε πληρωμή.',
        smartscanFailed: ({canEdit = true, missingFields = []}: {canEdit?: boolean; missingFields?: string[]}) => {
            if (missingFields.length > 0) {
                const fieldNames: Record<string, string> = {merchant: 'έμπορος', date: 'ημερομηνία', amount: 'ποσό'};
                const translated = missingFields.map((f) => fieldNames[f] ?? f);
                let fieldList = '';
                if (translated.length === 1) {
                    fieldList = translated.at(0) ?? '';
                } else if (translated.length === 2) {
                    fieldList = translated.join('και');
                } else {
                    fieldList = `${translated.slice(0, translated.length - 1).join(', ')}, and ${translated.at(-1)}`;
                }
                return `Η σάρωση της απόδειξης απέτυχε — λείπει το ${fieldList}.${canEdit ? 'Εισαγάγετε τα στοιχεία μη αυτόματα.' : ''}`;
            }
            return `Η σάρωση της απόδειξης απέτυχε.${canEdit ? 'Εισαγάγετε τα στοιχεία μη αυτόματα.' : ''}`;
        },
        receiptGeneratedWithAI: 'Πιθανή απόδειξη που δημιουργήθηκε από ΤΝ',
        someTagLevelsRequired: (tagName?: string) => `Λείπει ${tagName ?? 'Ετικέτα'}`,
        tagOutOfPolicy: (tagName?: string) => `${tagName ?? 'Ετικέτα'} δεν ισχύει πλέον`,
        taxAmountChanged: 'Το ποσό φόρου τροποποιήθηκε',
        taxOutOfPolicy: (taxName?: string) => `${taxName ?? 'Φόρος'} δεν είναι πλέον έγκυρο`,
        taxRateChanged: 'Ο φορολογικός συντελεστής τροποποιήθηκε',
        taxRequired: 'Λείπει ο φορολογικός συντελεστής',
        none: 'Κανένα',
        taxCodeToKeep: 'Επιλέξτε ποιον φορολογικό κωδικό θέλετε να διατηρήσετε',
        tagToKeep: 'Επιλέξτε ποια ετικέτα θέλετε να διατηρήσετε',
        isTransactionReimbursable: 'Επιλέξτε αν η συναλλαγή είναι αποζημιώσιμη',
        merchantToKeep: 'Επιλέξτε ποιον έμπορο θέλετε να διατηρήσετε',
        descriptionToKeep: 'Επιλέξτε ποια περιγραφή θέλετε να διατηρήσετε',
        categoryToKeep: 'Επιλέξτε ποια κατηγορία θέλετε να κρατήσετε',
        isTransactionBillable: 'Επιλέξτε αν η συναλλαγή είναι χρεώσιμη',
        keepThisOne: 'Κρατήστε αυτόν',
        confirmDetails: `Επιβεβαιώστε τα στοιχεία που κρατάτε`,
        confirmDuplicatesInfo: `Τα διπλότυπα που δεν θα κρατήσετε θα παραμείνουν διαθέσιμα ώστε το άτομο που τα υπέβαλε να τα διαγράψει.`,
        hold: 'Αυτή η δαπάνη τέθηκε σε αναμονή',
        resolvedDuplicates: 'έλυσε το διπλότυπο',
        companyCardRequired: 'Απαιτούνται αγορές με εταιρική κάρτα',
        noRoute: 'Παρακαλούμε επιλέξτε μια έγκυρη διεύθυνση',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `Απαιτείται το πεδίο ${fieldName}`,
        reportContainsExpensesWithViolations: 'Η αναφορά περιέχει δαπάνες με παραβιάσεις.',
    },
    violationDismissal: {
        rter: {
            manual: 'σήμανε αυτήν την απόδειξη ως μετρητά',
        },
        duplicatedTransaction: {
            manual: 'έλυσε το διπλότυπο',
        },
    },
    videoPlayer: {
        play: 'Αναπαραγωγή',
        pause: 'Παύση',
        fullscreen: 'Πλήρης οθόνη',
        playbackSpeed: 'Ταχύτητα αναπαραγωγής',
        expand: 'Ανάπτυξη',
        mute: 'Σίγαση',
        unmute: 'Επανενεργοποίηση ήχου',
        normal: 'Κανονικό',
    },
    exitSurvey: {
        header: 'Πριν φύγετε',
        reasonPage: {
            title: 'Παρακαλούμε πείτε μας γιατί αποχωρείτε',
            subtitle: 'Πριν αποχωρήσετε, παρακαλούμε πείτε μας γιατί θα θέλατε να αλλάξετε στο Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Χρειάζομαι μια λειτουργία που είναι διαθέσιμη μόνο στο Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Δεν καταλαβαίνω πώς να χρησιμοποιώ το νέο Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Καταλαβαίνω πώς να χρησιμοποιώ το νέο Expensify, αλλά προτιμώ το Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ποια λειτουργία χρειάζεστε που δεν είναι διαθέσιμη στο νέο Expensify;',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Τι προσπαθείτε να κάνετε;',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Γιατί προτιμάτε το Expensify Classic;',
        },
        responsePlaceholder: 'Η απάντησή σας',
        thankYou: 'Ευχαριστούμε για τα σχόλιά σας!',
        thankYouSubtitle: 'Οι απαντήσεις σας θα μας βοηθήσουν να δημιουργήσουμε ένα καλύτερο προϊόν για να γίνονται οι δουλειές. Σας ευχαριστούμε πάρα πολύ!',
        goToExpensifyClassic: 'Μετάβαση στο Expensify Classic',
        offlineTitle: 'Μάλλον έχετε κολλήσει εδώ…',
        offline:
            'Φαίνεται ότι είστε εκτός σύνδεσης. Δυστυχώς, το Expensify Classic δεν λειτουργεί χωρίς σύνδεση, αλλά το New Expensify λειτουργεί. Αν προτιμάτε να χρησιμοποιείτε το Expensify Classic, δοκιμάστε ξανά όταν θα έχετε σύνδεση στο διαδίκτυο.',
        quickTip: 'Μικρή συμβουλή…',
        quickTipSubTitle: 'Μπορείτε να μεταβείτε απευθείας στο Expensify Classic επισκεπτόμενοι το expensify.com. Προσθέστε το στους σελιδοδείκτες για εύκολη πρόσβαση!',
        bookACall: 'Κλείστε ένα ραντεβού κλήσης',
        bookACallTitle: 'Θα θέλατε να μιλήσετε με έναν υπεύθυνο προϊόντος;',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Άμεση συνομιλία πάνω σε δαπάνες και αναφορές',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Δυνατότητα να κάνετε τα πάντα από το κινητό',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Ταξίδια και έξοδα με την ταχύτητα της συνομιλίας',
        },
        bookACallTextTop: 'Αν μεταβείτε στο Expensify Classic, θα χάσετε τα εξής:',
        bookACallTextBottom:
            'Θα χαρούμε πολύ να μιλήσουμε μαζί σας τηλεφωνικά για να καταλάβουμε τον λόγο. Μπορείτε να κλείσετε μια κλήση με έναν από τους ανώτερους υπεύθυνους προϊόντος μας για να συζητήσετε τις ανάγκες σας.',
        takeMeToExpensifyClassic: 'Μετάβαση στο Expensify Classic',
        goBackJustOnce: 'Επιστροφή μόνο μία φορά',
    },
    systemMessage: {
        mergedWithCashTransaction: 'έγινε αντιστοίχιση μιας απόδειξης με αυτή τη συναλλαγή',
    },
    subscription: {
        authenticatePaymentCard: 'Πιστοποιήστε την κάρτα πληρωμής',
        mobileReducedFunctionalityMessage: 'Δεν μπορείτε να κάνετε αλλαγές στη συνδρομή σας στην εφαρμογή για κινητά.',
        badge: {
            freeTrial: (numOfDays: number) => `Δωρεάν δοκιμή: απομένουν ${numOfDays} ${numOfDays === 1 ? 'ημέρα' : 'ημέρες'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Οι πληροφορίες πληρωμής σας είναι παρωχημένες',
                subtitle: (date: string) => `Ενημερώστε την κάρτα πληρωμής σας έως ${date} για να συνεχίσετε να χρησιμοποιείτε όλες τις αγαπημένες σας λειτουργίες.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Η πληρωμή σας δεν ήταν δυνατό να γίνει επεξεργασία',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Η χρέωσή σας στις ${date} ύψους ${purchaseAmountOwed} δεν μπόρεσε να διεκπεραιωθεί. Παρακαλούμε προσθέστε μια κάρτα πληρωμής για να εξοφλήσετε το οφειλόμενο ποσό.`
                        : 'Παρακαλούμε προσθέστε μια κάρτα πληρωμής για να εξοφλήσετε το οφειλόμενο ποσό.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Οι πληροφορίες πληρωμής σας είναι παρωχημένες',
                subtitle: (date: string) => `Η πληρωμή σας έχει λήξει. Παρακαλούμε εξοφλήστε το τιμολόγιό σας έως ${date} για να αποφύγετε διακοπή της υπηρεσίας.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Οι πληροφορίες πληρωμής σας είναι παρωχημένες',
                subtitle: 'Η πληρωμή σας είναι εκπρόθεσμη. Παρακαλούμε εξοφλήστε το τιμολόγιό σας.',
            },
            billingDisputePending: {
                title: 'Δεν ήταν δυνατή η χρέωση της κάρτας σας',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Αμφισβητήσατε τη χρέωση των ${amountOwed} στην κάρτα που λήγει σε ${cardEnding}. Ο λογαριασμός σας θα κλειδωθεί μέχρι να επιλυθεί η αμφισβήτηση με την τράπεζά σας.`,
            },
            cardAuthenticationRequired: {
                title: 'Η κάρτα πληρωμής σας δεν έχει επαληθευτεί πλήρως.',
                subtitle: (cardEnding: string) => `Ολοκληρώστε τη διαδικασία ταυτοποίησης για να ενεργοποιήσετε την κάρτα πληρωμών σας που λήγει σε ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Δεν ήταν δυνατή η χρέωση της κάρτας σας',
                subtitle: (amountOwed: number) =>
                    `Η κάρτα πληρωμής σας απορρίφθηκε λόγω ανεπαρκούς υπολοίπου. Δοκιμάστε ξανά ή προσθέστε μια νέα κάρτα πληρωμής για να εξοφλήσετε το εκκρεμές υπόλοιπο των ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Δεν ήταν δυνατή η χρέωση της κάρτας σας',
                subtitle: (amountOwed: number) => `Η κάρτα πληρωμής σας έληξε. Προσθέστε μια νέα κάρτα πληρωμής για να εξοφλήσετε το εκκρεμές υπόλοιπο των ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Η κάρτα σας λήγει σύντομα',
                subtitle:
                    'Η κάρτα πληρωμής σας θα λήξει στο τέλος αυτού του μήνα. Κάντε κλικ στο μενού με τις τρεις τελείες παρακάτω για να την ενημερώσετε και να συνεχίσετε να χρησιμοποιείτε όλες τις αγαπημένες σας λειτουργίες.',
            },
            retryBillingSuccess: {
                title: 'Επιτυχία!',
                subtitle: 'Η κάρτα σας χρεώθηκε με επιτυχία.',
            },
            retryBillingError: {
                title: 'Δεν ήταν δυνατή η χρέωση της κάρτας σας',
                subtitle:
                    'Πριν δοκιμάσετε ξανά, καλέστε απευθείας την τράπεζά σας για να εγκρίνει τις χρεώσεις της Expensify και να αφαιρέσει τυχόν δεσμεύσεις. Διαφορετικά, δοκιμάστε να προσθέσετε μια άλλη κάρτα πληρωμής.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Αμφισβητήσατε τη χρέωση των ${amountOwed} στην κάρτα που λήγει σε ${cardEnding}. Ο λογαριασμός σας θα κλειδωθεί μέχρι να επιλυθεί η αμφισβήτηση με την τράπεζά σας.`,
            preTrial: {
                title: 'Ξεκινήστε δωρεάν δοκιμή',
                subtitle: 'Ως επόμενο βήμα, <a href="#">ολοκληρώστε τη λίστα ελέγχου ρύθμισης</a> ώστε η ομάδα σας να μπορεί να αρχίσει να καταχωρίζει έξοδα.',
            },
            trialStarted: {
                title: (numOfDays: number) => `Δοκιμή: απομένουν ${numOfDays} ${numOfDays === 1 ? 'ημέρα' : 'ημέρες'} ημέρες!`,
                subtitle: 'Προσθέστε μια κάρτα πληρωμής για να συνεχίσετε να χρησιμοποιείτε όλες τις αγαπημένες σας δυνατότητες.',
            },
            trialEnded: {
                title: 'Η δωρεάν δοκιμή σας έληξε',
                subtitle: 'Προσθέστε μια κάρτα πληρωμής για να συνεχίσετε να χρησιμοποιείτε όλες τις αγαπημένες σας δυνατότητες.',
            },
            earlyDiscount: {
                claimOffer: 'Αποκτήστε την προσφορά',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType}% έκπτωση για τον πρώτο σας χρόνο!</strong> Απλώς προσθέστε μια κάρτα πληρωμής και ξεκινήστε μια ετήσια συνδρομή.`,
                onboardingChatTitle: (discountType: number) => `Προσφορά περιορισμένου χρόνου: ${discountType}% έκπτωση για τον πρώτο σας χρόνο!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Διεκδικήστε μέσα σε ${days > 0 ? `${days}η :` : ''}${hours}ώ : ${minutes}λ : ${seconds}δ`,
            },
        },
        cardSection: {
            title: 'Πληρωμή',
            subtitle: 'Προσθέστε μια κάρτα για να πληρώσετε τη συνδρομή σας στο Expensify.',
            addCardButton: 'Προσθήκη κάρτας πληρωμής',
            cardInfo: (name: string, expiration: string, currency: string) => `Όνομα: ${name}, Λήξη: ${expiration}, Νόμισμα: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Η επόμενη ημερομηνία πληρωμής σας είναι ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Κάρτα που λήγει σε ${cardNumber}`,
            changeCard: 'Αλλαγή κάρτας πληρωμής',
            changeCurrency: 'Αλλαγή νομίσματος πληρωμής',
            cardNotFound: 'Δεν έχει προστεθεί κάρτα πληρωμής',
            retryPaymentButton: 'Επανάληψη πληρωμής',
            authenticatePayment: 'Πιστοποίηση πληρωμής',
            requestRefund: 'Αίτημα επιστροφής χρημάτων',
            requestRefundModal: {
                full: 'Η επιστροφή χρημάτων είναι εύκολη, απλώς υποβαθμίστε τον λογαριασμό σας πριν από την επόμενη ημερομηνία χρέωσης και θα λάβετε επιστροφή χρημάτων. <br /> <br /> Προσοχή: Η υποβάθμιση του λογαριασμού σας σημαίνει ότι ο(οι) χώρος(οι) εργασίας σας θα διαγραφεί(ουν). Αυτή η ενέργεια δεν μπορεί να αναιρεθεί, αλλά μπορείτε πάντα να δημιουργήσετε έναν νέο χώρο εργασίας αν αλλάξετε γνώμη.',
                confirm: 'Διαγράψτε χώρους εργασίας και υποβαθμίστε',
            },
            viewPaymentHistory: 'Προβολή ιστορικού πληρωμών',
        },
        yourPlan: {
            title: 'Το πρόγραμμά σας',
            exploreAllPlans: 'Εξερευνήστε όλα τα πλάνα',
            customPricing: 'Προσαρμοσμένη τιμολόγηση',
            asLowAs: (price: string) => `από μόλις ${price} ανά ενεργό μέλος/μήνα`,
            pricePerMemberMonth: (price: string) => `${price} ανά μέλος/μήνα`,
            pricePerMemberPerMonth: (price: string) => `${price} ανά μέλος τον μήνα`,
            perMemberMonth: 'ανά μέλος/μήνα',
            collect: {
                title: 'Είσπραξη',
                description: 'Το πρόγραμμα για μικρές επιχειρήσεις που σας προσφέρει έξοδα, ταξίδια και συνομιλία.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Από ${lower}/ενεργό μέλος με την Κάρτα Expensify, ${upper}/ενεργό μέλος χωρίς την Κάρτα Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Από ${lower}/ενεργό μέλος με την Κάρτα Expensify, ${upper}/ενεργό μέλος χωρίς την Κάρτα Expensify.`,
                benefit1: 'Σάρωση αποδείξεων',
                benefit2: 'Επιστροφές χρημάτων',
                benefit3: 'Διαχείριση εταιρικής κάρτας',
                benefit4: 'Εγκρίσεις εξόδων και ταξιδιών',
                benefit5: 'Κράτηση ταξιδιών και κανόνες',
                benefit6: 'Ενσωματώσεις QuickBooks/Xero',
                benefit7: 'Συνομιλήστε για δαπάνες, αναφορές και δωμάτια',
                benefit8: 'Υποστήριξη από AI και ανθρώπους',
            },
            control: {
                title: 'Έλεγχος',
                description: 'Έξοδα, ταξίδια και συνομιλία για μεγαλύτερες επιχειρήσεις.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Από ${lower}/ενεργό μέλος με την Κάρτα Expensify, ${upper}/ενεργό μέλος χωρίς την Κάρτα Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Από ${lower}/ενεργό μέλος με την Κάρτα Expensify, ${upper}/ενεργό μέλος χωρίς την Κάρτα Expensify.`,
                benefit1: 'Όλα όσα περιλαμβάνονται στο πρόγραμμα Collect',
                benefit2: 'Ροές έγκρισης πολλαπλών επιπέδων',
                benefit3: 'Προσαρμοσμένοι κανόνες εξόδων',
                benefit4: 'Ενσωματώσεις ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Ενσωματώσεις HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Προσαρμοσμένες αναλύσεις και αναφορές',
                benefit8: 'Προϋπολογισμός',
            },
            thisIsYourCurrentPlan: 'Αυτό είναι το τρέχον πρόγραμμά σας',
            downgrade: 'Υποβιβασμός σε Collect',
            upgrade: 'Αναβάθμιση σε Control',
            addMembers: 'Προσθήκη μελών',
            saveWithExpensifyTitle: 'Εξοικονομήστε με την Κάρτα Expensify',
            saveWithExpensifyDescription:
                'Χρησιμοποιήστε την αριθμομηχανή εξοικονόμησης για να δείτε πώς η επιστροφή μετρητών από την Κάρτα Expensify μπορεί να μειώσει τον λογαριασμό σας στο Expensify.',
            saveWithExpensifyButton: 'Μάθετε περισσότερα',
        },
        compareModal: {
            comparePlans: 'Σύγκριση προγραμμάτων',
            subtitle: `<muted-text>Ξεκλειδώστε τις δυνατότητες που χρειάζεστε με το πρόγραμμα που σας ταιριάζει. <a href="${CONST.PRICING}">Δείτε τη σελίδα τιμών μας</a> για μια πλήρη ανάλυση χαρακτηριστικών για κάθε πρόγραμμα.</muted-text>`,
        },
        details: {
            title: 'Λεπτομέρειες συνδρομής',
            annual: 'Ετήσια συνδρομή',
            creditBalance: 'Πιστωτικό υπόλοιπο',
            taxExempt: 'Αίτημα για φοροαπαλλαγή',
            taxExemptEnabled: 'Απαλλαγή από φόρο',
            taxExemptStatus: 'Καθεστώς απαλλαγής από φόρο',
            payPerUse: 'Χρέωση ανά χρήση',
            subscriptionSize: 'Μέγεθος συνδρομής',
            headsUp:
                'Προσοχή: Αν δεν ορίσετε τώρα το μέγεθος της συνδρομής σας, θα το ορίσουμε αυτόματα βάσει του αριθμού ενεργών μελών σας τον πρώτο μήνα. Στη συνέχεια θα δεσμευτείτε να πληρώνετε τουλάχιστον για αυτόν τον αριθμό μελών για τους επόμενους 12 μήνες. Μπορείτε να αυξήσετε το μέγεθος της συνδρομής σας οποιαδήποτε στιγμή, αλλά δεν μπορείτε να το μειώσετε μέχρι να λήξει η συνδρομή σας.',
            zeroCommitment: 'Μηδενική δέσμευση με τη μειωμένη ετήσια τιμή συνδρομής',
        },
        subscriptionSize: {
            title: 'Μέγεθος συνδρομής',
            yourSize: 'Το μέγεθος της συνδρομής σας είναι ο αριθμός των διαθέσιμων θέσεων που μπορούν να καλυφθούν από οποιοδήποτε ενεργό μέλος σε έναν συγκεκριμένο μήνα.',
            eachMonth:
                'Κάθε μήνα, η συνδρομή σας καλύπτει έως και τον αριθμό ενεργών μελών που ορίστηκε παραπάνω. Κάθε φορά που αυξάνετε το μέγεθος της συνδρομής σας, θα ξεκινάτε μια νέα 12μηνη συνδρομή σε αυτό το νέο μέγεθος.',
            note: 'Σημείωση: Ενεργό μέλος θεωρείται κάθε άτομο που έχει δημιουργήσει, επεξεργαστεί, υποβάλει, εγκρίνει, αποζημιώσει ή εξαγάγει δεδομένα εξόδων που συνδέονται με τον χώρο εργασίας της εταιρείας σας.',
            confirmDetails: 'Επιβεβαιώστε τα νέα στοιχεία της ετήσιας συνδρομής σας:',
            subscriptionSize: 'Μέγεθος συνδρομής',
            activeMembers: (size: number) => `${size} ενεργά μέλη/μήνα`,
            subscriptionRenews: 'Η συνδρομή ανανεώνεται',
            youCantDowngrade: 'Δεν μπορείτε να υποβιβάσετε το πρόγραμμα κατά τη διάρκεια της ετήσιας συνδρομής σας.',
            youAlreadyCommitted: (size: number, date: string) =>
                `Έχετε ήδη δεσμευτεί για ένα ετήσιο πρόγραμμα συνδρομής με ${size} ενεργά μέλη τον μήνα έως ${date}. Μπορείτε να μεταβείτε σε συνδρομή με χρέωση ανά χρήση στις ${date} απενεργοποιώντας την αυτόματη ανανέωση.`,
            error: {
                size: 'Παρακαλούμε εισαγάγετε έγκυρο μέγεθος συνδρομής',
                sameSize: 'Παρακαλούμε εισαγάγετε έναν αριθμό διαφορετικό από το τρέχον μέγεθος της συνδρομής σας',
            },
        },
        paymentCard: {
            addPaymentCard: 'Προσθήκη κάρτας πληρωμής',
            enterPaymentCardDetails: 'Εισαγάγετε τα στοιχεία της κάρτας πληρωμής σας',
            security: 'Το Expensify συμμορφώνεται με το πρότυπο PCI-DSS, χρησιμοποιεί κρυπτογράφηση επιπέδου τράπεζας και αξιοποιεί πλεονάζουσα υποδομή για την προστασία των δεδομένων σας.',
            learnMoreAboutSecurity: 'Μάθετε περισσότερα σχετικά με την ασφάλειά μας.',
        },
        expensifyCode: {
            title: 'Κωδικός Expensify',
            discountCode: 'Κωδικός έκπτωσης',
            enterCode: 'Εισαγάγετε έναν κωδικό Expensify για να εφαρμοστεί στη συνδρομή σας.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `Θα λάβετε έκπτωση ${promoDiscount}% στις επόμενες χρεώσεις ${validBillingCycles ? `${validBillingCycles} ` : ''}σας.`,
            apply: 'Εφαρμογή',
            error: {
                invalid: 'Αυτός ο κωδικός δεν είναι έγκυρος',
            },
        },
        subscriptionSettings: {
            title: 'Ρυθμίσεις συνδρομής',
            editSubscription: 'Επεξεργασία συνδρομής',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `Τύπος συνδρομής: ${subscriptionType}, Μέγεθος συνδρομής: ${subscriptionSize}${expensifyCode ? `, κωδικός Expensify: ${expensifyCode}` : ''}, Αυτόματη ανανέωση: ${autoRenew}, Αυτόματη ετήσια αύξηση θέσεων: ${autoIncrease}`,
            none: 'κανένα',
            on: 'ενεργό',
            off: 'κλειστό',
            annual: 'Ετήσιο',
            autoRenew: 'Αυτόματη ανανέωση',
            autoIncrease: 'Αυτόματη αύξηση ετήσιων θέσεων',
            saveUpTo: (amountWithCurrency: string) => `Εξοικονομήστε έως και ${amountWithCurrency}/μήνα ανά ενεργό μέλος`,
            automaticallyIncrease:
                'Αυξήστε αυτόματα τις ετήσιες θέσεις σας για να καλύψετε ενεργά μέλη που υπερβαίνουν το μέγεθος της συνδρομής σας. Σημείωση: Αυτό θα παρατείνει την ημερομηνία λήξης της ετήσιας συνδρομής σας.',
            disableAutoRenew: 'Απενεργοποίηση αυτόματης ανανέωσης',
            helpUsImprove: 'Βοηθήστε μας να βελτιώσουμε το Expensify',
            whatsMainReason: 'Ποιος είναι ο κύριος λόγος που απενεργοποιείτε την αυτόματη ανανέωση;',
            renewsOn: (date: string) => `Ανανεώνεται στις ${date}.`,
            pricingConfiguration: 'Η τιμή εξαρτάται από τη ρύθμιση. Για τη χαμηλότερη τιμή, επιλέξτε ετήσια συνδρομή και αποκτήστε την Κάρτα Expensify.',
            learnMore: (hasAdminsRoom: boolean) =>
                `<muted-text>Μάθετε περισσότερα στη <a href="${CONST.PRICING}">σελίδα τιμών</a> μας ή συνομιλήστε με την ομάδα μας στο ${hasAdminsRoom ? `<a href="adminsRoom">δωμάτιο #admins.</a>` : 'δωμάτιο #admins'} σας</muted-text>`,
            estimatedPrice: 'Εκτιμώμενη τιμή',
            changesBasedOn: 'Αυτό αλλάζει με βάση τη χρήση της Κάρτας Expensify και τις παρακάτω επιλογές συνδρομής.',
            collectBillingDescription: 'Τα Collect χώρους εργασίας χρεώνονται μηνιαία ανά μέλος, χωρίς ετήσια δέσμευση.',
            pricing: 'Τιμές',
        },
        cancelSubscription: {
            title: 'Ακύρωση συνδρομής',
            subtitle: 'Ποιος είναι ο κύριος λόγος που ακυρώνετε τη συνδρομή σας;',
            subscriptionCanceled: {
                title: 'Η συνδρομή ακυρώθηκε',
                subtitle: 'Η ετήσια συνδρομή σας έχει ακυρωθεί.',
                info: 'Αν θέλετε να συνεχίσετε να χρησιμοποιείτε τον/τους χώρο(ους) εργασίας σας με χρέωση ανά χρήση, είστε έτοιμοι.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `Αν θέλετε να αποτρέψετε μελλοντική δραστηριότητα και χρεώσεις, πρέπει να <a href="${workspacesListRoute}">διαγράψετε τον/τους χώρο(ους) εργασίας σας</a>. Σημειώστε ότι, όταν διαγράψετε τον/τους χώρο(ους) εργασίας σας, θα χρεωθείτε για οποιαδήποτε εκκρεμή δραστηριότητα πραγματοποιήθηκε κατά τη διάρκεια του τρέχοντος ημερολογιακού μήνα.`,
            },
            requestSubmitted: {
                title: 'Το αίτημα υποβλήθηκε',
                subtitle:
                    'Σας ευχαριστούμε που μας ενημερώσατε ότι ενδιαφέρεστε να ακυρώσετε τη συνδρομή σας. Εξετάζουμε το αίτημά σας και θα επικοινωνήσουμε σύντομα μαζί σας μέσω της συνομιλίας σας με τον/την <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Με την υποβολή αιτήματος ακύρωσης, αναγνωρίζω και αποδέχομαι ότι η Expensify δεν έχει καμία υποχρέωση να ικανοποιήσει το αίτημα αυτό βάσει των <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Όρων Παροχής Υπηρεσιών</a> της Expensify ή άλλης ισχύουσας συμφωνίας παροχής υπηρεσιών μεταξύ εμού και της Expensify και ότι η Expensify διατηρεί την αποκλειστική διακριτική ευχέρεια ως προς την αποδοχή οποιουδήποτε τέτοιου αιτήματος.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Η λειτουργικότητα χρειάζεται βελτίωση',
        tooExpensive: 'Πολύ ακριβό',
        inadequateSupport: 'Ανεπαρκής υποστήριξη πελατών',
        businessClosing: 'Κλείσιμο, συρρίκνωση ή εξαγορά εταιρείας',
        additionalInfoTitle: 'Σε ποιο λογισμικό μεταβαίνετε και γιατί;',
        additionalInfoInputLabel: 'Η απάντησή σας',
    },
    roomChangeLog: {
        updateRoomDescription: 'ορίστε την περιγραφή δωματίου σε:',
        clearRoomDescription: 'διαγράφηκε η περιγραφή του δωματίου',
        changedRoomAvatar: 'άλλαξε το avatar του δωματίου',
        removedRoomAvatar: 'αφαίρεσε το avatar δωματίου',
    },
    delegate: {
        switchAccount: 'Αλλαγή λογαριασμών:',
        switch: 'Εναλλαγή',
        copilot: 'Συνεπιβάτης',
        copilotDelegatedAccess: 'Copilot: Αντιπροσωπευτική πρόσβαση',
        copilotDelegatedAccessDescription: 'Να επιτρέπεται στα άλλα μέλη να έχουν πρόσβαση στον λογαριασμό σας.',
        learnMoreAboutDelegatedAccess: 'Μάθετε περισσότερα σχετικά με την εξουσιοδοτημένη πρόσβαση',
        addCopilot: 'Προσθήκη συγκυβερνήτη',
        membersCanAccessYourAccount: 'Αυτά τα μέλη μπορούν να έχουν πρόσβαση στον λογαριασμό σας:',
        youCanAccessTheseAccounts: 'Μπορείτε να έχετε πρόσβαση σε αυτούς τους λογαριασμούς:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Πλήρες';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Περιορισμένο';
                default:
                    return '';
            }
        },
        genericError: 'Ουπς, κάτι πήγε στραβά. Παρακαλούμε δοκιμάστε ξανά.',
        onBehalfOfMessage: (delegator: string) => `εκ μέρους του/της ${delegator}`,
        accessLevel: 'Επίπεδο πρόσβασης',
        confirmCopilot: 'Επιβεβαιώστε τον συγκυβερνήτη σας παρακάτω.',
        accessLevelDescription:
            'Επιλέξτε ένα επίπεδο πρόσβασης παρακάτω. Τόσο η πλήρης όσο και η περιορισμένη πρόσβαση επιτρέπουν στους copilots να βλέπουν όλες τις συνομιλίες και τις δαπάνες.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Επιτρέψτε σε ένα άλλο μέλος να πραγματοποιεί όλες τις ενέργειες στον λογαριασμό σας, για λογαριασμό σας. Περιλαμβάνονται η συνομιλία, οι υποβολές, οι εγκρίσεις, οι πληρωμές, οι ενημερώσεις ρυθμίσεων και άλλα.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Να επιτρέπεται σε άλλο μέλος να πραγματοποιεί τις περισσότερες ενέργειες στον λογαριασμό σας, εκ μέρους σας. Εξαιρούνται οι εγκρίσεις, οι πληρωμές, οι απορρίψεις και οι δεσμεύσεις.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Κατάργηση copilot',
        removeCopilotConfirmation: 'Είστε βέβαιοι ότι θέλετε να αφαιρέσετε αυτόν τον βοηθό;',
        removeCopilotAccess: 'Κατάργηση πρόσβασης ως συγκυβερνήτης',
        removeCopilotAccessTitle: 'Κατάργηση πρόσβασης στο copilot;',
        removeCopilotAccessConfirmation: ({delegatorName}: RemoveCopilotAccessConfirmationParams) =>
            `Είστε βέβαιοι ότι θέλετε να αφαιρέσετε την πρόσβαση ως συγκυβερνήτης στον λογαριασμό Expensify του/της ${delegatorName}; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.`,
        removeCopilotAccessConfirm: 'Αφαίρεση πρόσβασης',
        changeAccessLevel: 'Αλλαγή επιπέδου πρόσβασης',
        makeSureItIsYou: 'Ας βεβαιωθούμε ότι είστε εσείς',
        enterMagicCode: (contactMethod: string) =>
            `Παρακαλούμε εισαγάγετε τον μαγικό κωδικό που στάλθηκε στο ${contactMethod} για να προσθέσετε έναν συγκυβερνήτη. Θα πρέπει να φτάσει μέσα σε ένα-δυο λεπτά.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Παρακαλούμε εισαγάγετε τον μαγικό κωδικό που στάλθηκε στο ${contactMethod} για να ενημερώσετε τον συνεργάτη σας.`,
        notAllowed: 'Όχι και τόσο γρήγορα...',
        noAccessMessage: Str.dedent(`
            Ως συνοδηγός, δεν έχετε πρόσβαση σε αυτήν τη σελίδα. Συγγνώμη!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Ως <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">συνοδοιπόρος</a> για τον/την ${accountOwnerEmail}, δεν έχετε δικαίωμα να εκτελέσετε αυτήν την ενέργεια. Συγγνώμη!`,
        copilotAccess: 'Πρόσβαση στο Copilot',
    },
    debug: {
        debug: 'Εντοπισμός σφαλμάτων',
        details: 'Λεπτομέρειες',
        JSON: 'JSON',
        reportActions: 'Ενέργειες',
        reportActionPreview: 'Προεπισκόπηση',
        nothingToPreview: 'Τίποτα για προεπισκόπηση',
        editJson: 'Επεξεργασία JSON:',
        preview: 'Προεπισκόπηση:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Λείπει το ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Μη έγκυρη ιδιότητα: ${propertyName} - Αναμενόταν: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Μη έγκυρη τιμή - Αναμενόταν: ${expectedValues}`,
        missingValue: 'Λείπει τιμή',
        createReportAction: 'Ενέργεια δημιουργίας αναφοράς',
        reportAction: 'Ενέργεια αναφοράς',
        report: 'Αναφορά',
        transaction: 'Συναλλαγή',
        violations: 'Παραβάσεις',
        transactionViolation: 'Παραβίαση συναλλαγής',
        hint: 'Οι αλλαγές δεδομένων δεν θα σταλούν στο backend',
        textFields: 'Πεδία κειμένου',
        numberFields: 'Πεδία αριθμών',
        booleanFields: 'Πεδία boolean',
        constantFields: 'Σταθερά πεδία',
        dateTimeFields: 'Πεδία ημερομηνίας και ώρας',
        date: 'Ημερομηνία',
        time: 'Ώρα',
        none: 'Κανένα',
        visibleInLHN: 'Ορατό στο LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'αληθές',
        false: 'ψευδές',
        viewReport: 'Προβολή αναφοράς',
        viewTransaction: 'Προβολή συναλλαγής',
        createTransactionViolation: 'Δημιουργία παράβασης συναλλαγής',
        reasonVisibleInLHN: {
            hasDraftComment: 'Έχει πρόχειρο σχόλιο',
            hasGBR: 'Έχει GBR',
            hasRBR: 'Διαθέτει RBR',
            pinnedByUser: 'Καρφιτσωμένο από μέλος',
            hasIOUViolations: 'Παραβιάζει IOU',
            hasAddWorkspaceRoomErrors: 'Υπάρχουν σφάλματα στην προσθήκη δωματίου χώρου εργασίας',
            isUnread: 'Είναι μη αναγνωσμένο (λειτουργία εστίασης)',
            isArchived: 'Είναι αρχειοθετημένο (πιο πρόσφατη λειτουργία)',
            isSelfDM: 'Είναι προσωπικό DM',
            isFocused: 'Έχει προσωρινά εστιαστεί',
        },
        reasonGBR: {
            hasJoinRequest: 'Έχει αίτημα συμμετοχής (δωμάτιο διαχειριστή)',
            isUnreadWithMention: 'Είναι μη αναγνωσμένο με αναφορά',
            isWaitingForAssigneeToCompleteAction: 'Αναμονή για την ολοκλήρωση ενέργειας από τον υπεύθυνο',
            hasChildReportAwaitingAction: 'Υπάρχει θυγατρική αναφορά σε αναμονή ενέργειας',
            hasMissingInvoiceBankAccount: 'Έχει ελλιπή τραπεζικό λογαριασμό τιμολογίου',
            hasUnresolvedCardFraudAlert: 'Έχει μη επιλυμένη ειδοποίηση απάτης με κάρτα',
            hasDEWApproveFailed: 'Η έγκριση DEW απέτυχε',
        },
        reasonRBR: {
            hasErrors: 'Περιέχει σφάλματα στα δεδομένα της αναφοράς ή στις ενέργειες αναφοράς',
            hasViolations: 'Έχει παραβάσεις',
            hasTransactionThreadViolations: 'Έχει παραβιάσεις νήματος συναλλαγών',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Υπάρχει μια αναφορά που εκκρεμεί για ενέργεια',
            theresAReportWithErrors: 'Υπάρχει μια αναφορά με σφάλματα',
            theresAWorkspaceWithCustomUnitsErrors: 'Υπάρχει ένας χώρος εργασίας με σφάλματα προσαρμοσμένων μονάδων',
            theresAProblemWithAWorkspaceMember: 'Υπάρχει πρόβλημα με ένα μέλος του χώρου εργασίας',
            theresAProblemWithAWorkspaceQBOExport: 'Παρουσιάστηκε πρόβλημα με μια ρύθμιση εξαγωγής σύνδεσης χώρου εργασίας.',
            theresAProblemWithAContactMethod: 'Υπάρχει πρόβλημα με μια μέθοδο επικοινωνίας',
            aContactMethodRequiresVerification: 'Απαιτείται επαλήθευση μιας μεθόδου επικοινωνίας',
            theresAProblemWithAPaymentMethod: 'Υπάρχει πρόβλημα με μία μέθοδο πληρωμής',
            theresAProblemWithAWorkspace: 'Υπάρχει ένα πρόβλημα με έναν χώρο εργασίας',
            theresAProblemWithYourReimbursementAccount: 'Υπάρχει πρόβλημα με τον λογαριασμό αποζημίωσής σας',
            theresABillingProblemWithYourSubscription: 'Υπάρχει πρόβλημα χρέωσης με τη συνδρομή σας',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Η συνδρομή σας ανανεώθηκε με επιτυχία',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Παρουσιάστηκε πρόβλημα κατά τη διάρκεια του συγχρονισμού σύνδεσης του χώρου εργασίας',
            theresAProblemWithYourWallet: 'Υπάρχει πρόβλημα με το πορτοφόλι σας',
            theresAProblemWithYourWalletTerms: 'Υπάρχει πρόβλημα με τους όρους του πορτοφολιού σας',
            aBankAccountIsLocked: 'Ένας τραπεζικός λογαριασμός είναι κλειδωμένος',
            completeHrSetup: 'Ολοκληρώστε τη ρύθμιση HR',
            theresAProblemWithAnHRConnection: 'Υπάρχει πρόβλημα με μια σύνδεση HR',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Κάντε μια δοκιμαστική χρήση',
    },
    migratedUserWelcomeModal: {
        title: 'Καλώς ήρθατε στο νέο Expensify!',
        subtitle: 'Έχει όλα όσα αγαπάτε από την κλασική μας εμπειρία, μαζί με μια σειρά από αναβαθμίσεις που κάνουν τη ζωή σας ακόμη πιο εύκολη:',
        confirmText: 'Πάμε!',
        helpText: 'Δοκιμάστε την επίδειξη 2 λεπτών',
        features: {
            search: 'Πιο ισχυρή αναζήτηση σε κινητό, web και υπολογιστή',
            concierge: 'Ενσωματωμένη τεχνητή νοημοσύνη Concierge για να σας βοηθά να αυτοματοποιείτε τα έξοδά σας',
            chat: 'Συζητήστε σε κάθε δαπάνη για να επιλύετε απορίες γρήγορα',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>Ξεκινήστε <strong>εδώ!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Μετονομάστε τις αποθηκευμένες αναζητήσεις σας</strong> εδώ!</tooltip>',
        accountSwitcher: '<tooltip>Μπορείτε πλέον να συν-πιλοτάρετε σε άλλον λογαριασμό!</tooltip>',
        outstandingFilter: '<tooltip>Φιλτράρετε για δαπάνες\nπου <strong>χρειάζονται έγκριση</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Στείλτε αυτήν την απόδειξη για να\n<strong>ολοκληρώσετε τη δοκιμαστική χρήση!</strong></tooltip>',
        gpsTooltip: '<tooltip>Η παρακολούθηση GPS βρίσκεται σε εξέλιξη! Όταν τελειώσετε, διακόψτε την παρακολούθηση παρακάτω.</tooltip>',
        hasFilterNegation: '<tooltip>Αναζητήστε δαπάνες χωρίς αποδείξεις χρησιμοποιώντας το <strong>-has:receipt</strong>.</tooltip>',
        mileageRateAutoUpdated: '<tooltip>Ενημερώσαμε την τιμή με βάση την ημερομηνία του ταξιδιού σας.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Απόρριψη αλλαγών;',
        body: 'Είστε βέβαιοι ότι θέλετε να απορρίψετε τις αλλαγές που κάνατε;',
        confirmText: 'Απόρριψη αλλαγών',
    },
    scheduledCall: {
        book: {
            title: 'Προγραμματίστε κλήση',
            description: 'Βρείτε μια ώρα που σας εξυπηρετεί.',
            slots: ({date}: {date: string}) => `<muted-text>Διαθέσιμες ώρες για <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Επιβεβαίωση κλήσης',
            description: 'Βεβαιωθείτε ότι τα παρακάτω στοιχεία σάς φαίνονται σωστά. Μόλις επιβεβαιώσετε την κλήση, θα στείλουμε μια πρόσκληση με περισσότερες πληροφορίες.',
            setupSpecialist: 'Ο υπεύθυνος λογαριασμού σας',
            meetingLength: 'Διάρκεια συνάντησης',
            dateTime: 'Ημερομηνία και ώρα',
            minutes: '30 λεπτά',
        },
        callScheduled: 'Κλήση προγραμματισμένη',
    },
    autoSubmitModal: {
        title: 'Όλα εντάξει και υποβλήθηκαν!',
        description: 'Όλες οι προειδοποιήσεις και οι παραβάσεις έχουν εκκαθαριστεί, επομένως:',
        submittedExpensesTitle: 'Αυτές οι δαπάνες έχουν υποβληθεί',
        submittedExpensesDescription: 'Αυτές οι δαπάνες έχουν σταλεί στο άτομο που τις εγκρίνει, αλλά μπορούν ακόμη να επεξεργαστούν μέχρι να εγκριθούν.',
        pendingExpensesTitle: 'Οι εκκρεμείς δαπάνες έχουν μετακινηθεί',
        pendingExpensesDescription: 'Τυχόν εκκρεπείς δαπάνες κάρτας έχουν μεταφερθεί σε ξεχωριστή αναφορά μέχρι να καταχωριστούν.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Κάντε μια δοκιμή διάρκειας 2 λεπτών',
        },
        banner: {
            currentlyTestDrivingExpensify: 'Αυτή τη στιγμή δοκιμάζετε το Expensify',
            readyForTheRealThing: 'Έτοιμοι για το πραγματικό;',
            getStarted: 'Ξεκινήστε',
        },
        employeeInviteMessage: (name: string) => `# Ο/Η ${name} σάς προσκάλεσε να δοκιμάσετε το Expensify
Γεια σας! Μόλις εξασφάλισα για εμάς *3 μήνες δωρεάν* για να δοκιμάσουμε το Expensify, τον πιο γρήγορο τρόπο διαχείρισης εξόδων.

Ορίστε μία *δοκιμαστική απόδειξη* για να σας δείξω πώς λειτουργεί:`,
    },
    export: {
        basicExport: 'Βασική εξαγωγή',
        currentView: 'Τρέχουσα προβολή',
        reportLevelExport: 'Όλα τα δεδομένα - σε επίπεδο αναφοράς',
        expenseLevelExport: 'Όλα τα δεδομένα - επίπεδο δαπάνης',
        exportInProgress: 'Εξαγωγή σε εξέλιξη',
        conciergeWillSend: 'Ο Concierge θα σας στείλει το αρχείο σύντομα.',
    },
    exportDownload: {
        preparingTitle: 'Προετοιμασία λήψης...',
        preparingBody: 'Μπορείτε είτε να περιμένετε να ολοκληρωθεί η λήψη είτε η Concierge να σας τη στείλει μέσω συνομιλίας.',
        sendFromConcierge: 'Στείλτε μου το αρχείο όταν είναι έτοιμο',
        conciergeTitle: 'Βεβαίως!',
        conciergeBody: 'Το Concierge θα σάς στείλει ένα μήνυμα όταν το αρχείο είναι έτοιμο.',
        goToConcierge: 'Μεταβείτε στο Concierge',
        dismiss: 'Απόρριψη',
        readyTitle: 'Το αρχείο σας είναι έτοιμο!',
        readyBody: 'Αν δεν έγινε αυτόματη λήψη, χρησιμοποιήστε το παρακάτω κουμπί.',
        downloadFile: 'Λήψη αρχείου',
        failedTitle: 'Η εξαγωγή απέτυχε',
        csvFailedBody: 'Η εξαγωγή σας δεν μπόρεσε να ολοκληρωθεί. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
        pdfFailedBody: 'Δεν ήταν δυνατή η δημιουργία του αρχείου σας. Προσπαθήστε ξανά ή επικοινωνήστε με το Concierge για βοήθεια.',
        readyPartialBody: ({count, total}: {count: number; total: number}) =>
            `${count} από ${total} αναφορές εξήχθησαν. Αν δεν έγινε αυτόματη λήψη, χρησιμοποιήστε το παρακάτω κουμπί. Δείτε ποιες αναφορές απέτυχαν στο <concierge-link>Concierge</concierge-link>.`,
        close: 'Κλείσιμο',
    },
    domain: {
        notVerified: 'Μη επαληθευμένο',
        retry: 'Προσπαθήστε ξανά',
        verifyDomain: {
            title: 'Επαλήθευση τομέα',
            beforeProceeding: ({domainName}: {domainName: string}) => `Πριν συνεχίσετε, επιβεβαιώστε ότι σας ανήκει το <strong>${domainName}</strong> ενημερώνοντας τις ρυθμίσεις DNS του.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Αποκτήστε πρόσβαση στον πάροχό σας DNS και ανοίξτε τις ρυθμίσεις DNS για το <strong>${domainName}</strong>.`,
            addTXTRecord: 'Προσθέστε την ακόλουθη εγγραφή TXT:',
            saveChanges: 'Αποθηκεύστε τις αλλαγές και επιστρέψτε εδώ για να επαληθεύσετε τον τομέα σας.',
            youMayNeedToConsult: `Ίσως χρειαστεί να συμβουλευτείτε το τμήμα πληροφορικής του οργανισμού σας για να ολοκληρώσετε την επαλήθευση. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Μάθετε περισσότερα</a>.`,
            warning: 'Μετά την επαλήθευση, όλα τα μέλη του Expensify στο domain σας θα λάβουν ένα email ότι ο λογαριασμός τους θα διαχειρίζεται υπό το domain σας.',
            codeFetchError: 'Δεν ήταν δυνατή η λήψη του κωδικού επαλήθευσης',
            genericError: 'Δεν μπορέσαμε να επαληθεύσουμε τον τομέα σας. Δοκιμάστε ξανά και επικοινωνήστε με το Concierge αν το πρόβλημα συνεχιστεί.',
        },
        domainVerified: {
            title: 'Ο τομέας επαληθεύτηκε',
            header: 'Ουάου! Ο τομέας σας έχει επαληθευτεί',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Το domain <strong>${domainName}</strong> επαληθεύτηκε με επιτυχία και μπορείτε τώρα να ρυθμίσετε το SAML και άλλες λειτουργίες ασφαλείας.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML μονοσήμαντη σύνδεση (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text>Το <a href="${CONST.SAML_HELP_URL}">SAML SSO</a> είναι μια λειτουργία ασφαλείας που σάς δίνει περισσότερο έλεγχο στον τρόπο με τον οποίο τα μέλη με email <strong>${domainName}</strong> συνδέονται στο Expensify. Για να το ενεργοποιήσετε, θα χρειαστεί να επιβεβαιώσετε ότι είστε εξουσιοδοτημένος διαχειριστής της εταιρείας.</muted-text>`,
            fasterAndEasierLogin: 'Ταχύτερη και ευκολότερη σύνδεση',
            moreSecurityAndControl: 'Περισσότερη ασφάλεια και έλεγχος',
            onePasswordForAnything: 'Ένας κωδικός πρόσβασης για όλα',
        },
        goToDomain: 'Μετάβαση στον τομέα',
        samlLogin: {
            title: 'Σύνδεση SAML',
            subtitle: `<muted-text>Ρυθμίστε τη σύνδεση μελών με <a href="${CONST.SAML_HELP_URL}">ενιαία σύνδεση SAML (SSO)</a>.</muted-text>`,
            enableSamlLogin: 'Ενεργοποίηση σύνδεσης SAML',
            allowMembers: 'Να επιτρέπεται στα μέλη να συνδέονται με SAML.',
            requireSamlLogin: 'Απαίτηση σύνδεσης μέσω SAML',
            anyMemberWillBeRequired: 'Κάθε μέλος που έχει συνδεθεί με διαφορετική μέθοδο θα πρέπει να επαληθεύσει ξανά την ταυτότητά του χρησιμοποιώντας SAML.',
            enableError: 'Δεν ήταν δυνατή η ενημέρωση της ρύθμισης ενεργοποίησης SAML',
            requireError: 'Δεν ήταν δυνατή η ενημέρωση της ρύθμισης απαίτησης SAML',
            disableSamlRequired: 'Απενεργοποίηση απαίτησης SAML',
            oktaWarningPrompt: 'Είστε βέβαιοι; Αυτή η ενέργεια θα απενεργοποιήσει επίσης το Okta SCIM.',
            requireWithEmptyMetadataError: 'Προσθέστε παρακάτω τα μεταδεδομένα του παρόχου ταυτότητας για να ενεργοποιήσετε',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `<muted-text>Απενεργοποιήστε την επιλογή <a href="${twoFactorAuthSettingsUrl}">επιβολής ελέγχου ταυτότητας δύο παραγόντων</a> για να ενεργοποιήσετε τη σύνδεση SAML.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: 'Λεπτομέρειες ρύθμισης SAML',
            subtitle: 'Χρησιμοποιήστε αυτές τις λεπτομέρειες για να ρυθμίσετε το SAML.',
            identityProviderMetadata: 'Μεταδεδομένα παρόχου ταυτότητας',
            entityID: 'Αναγνωριστικό οντότητας',
            nameIDFormat: 'Μορφή ταυτότητας ονόματος',
            loginUrl: 'URL σύνδεσης',
            acsUrl: 'URL ACS (Υπηρεσία Καταναλωτή Δηλώσεων)',
            logoutUrl: 'URL αποσύνδεσης',
            sloUrl: 'URL SLO (Single Logout)',
            serviceProviderMetaData: 'Μεταδεδομένα Παρόχου Υπηρεσιών',
            oktaScimToken: 'Διακριτικό Okta SCIM',
            revealToken: 'Εμφάνιση διακριτικού',
            fetchError: 'Δεν ήταν δυνατή η λήψη των λεπτομερειών ρυθμίσεων SAML',
            setMetadataGenericError: 'Δεν ήταν δυνατός ο ορισμός των μεταδεδομένων SAML',
        },
        accessRestricted: {
            title: 'Περιορισμένη πρόσβαση',
            subtitle: (domainName: string) =>
                `Παρακαλούμε επιβεβαιώστε ότι είστε εξουσιοδοτημένος διαχειριστής της εταιρείας για το <strong>${domainName}</strong> εάν χρειάζεστε έλεγχο στα εξής:`,
            companyCardManagement: 'Διαχείριση εταιρικής κάρτας',
            accountCreationAndDeletion: 'Δημιουργία και διαγραφή λογαριασμού',
            workspaceCreation: 'Δημιουργία χώρου εργασίας',
            samlSSO: 'SAML SSO',
        },
        addDomain: {
            title: 'Προσθήκη τομέα',
            subtitle: 'Εισαγάγετε το όνομα του ιδιωτικού domain που θέλετε να αποκτήσετε πρόσβαση (π.χ. expensify.com).',
            domainName: 'Όνομα τομέα',
            newDomain: 'Νέος τομέας',
        },
        domainAdded: {
            title: 'Το domain προστέθηκε',
            description: 'Στη συνέχεια, θα πρέπει να επαληθεύσετε την κυριότητα του domain και να προσαρμόσετε τις ρυθμίσεις ασφαλείας σας.',
            configure: 'Ρύθμιση',
        },
        enhancedSecurity: {
            title: 'Ενισχυμένη ασφάλεια',
            subtitle: 'Απαιτήστε από τα μέλη του domain σας να συνδέονται μέσω single sign-on, περιορίστε τη δημιουργία χώρων εργασίας και πολλά άλλα.',
            enable: 'Ενεργοποίηση',
        },
        domainAdmins: 'Διαχειριστές τομέα',
        admins: {
            title: 'Διαχειριστές',
            findAdmin: 'Εύρεση διαχειριστή',
            primaryContact: 'Κύρια επαφή',
            addPrimaryContact: 'Προσθήκη κύριου επαφής',
            setPrimaryContactError: 'Δεν είναι δυνατός ο ορισμός κύριου επαφής. Δοκιμάστε ξανά αργότερα.',
            consolidatedDomainBilling: 'Ενοποιημένη χρέωση τομέα',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Όταν είναι ενεργοποιημένο, το κύριο άτομο επικοινωνίας θα πληρώνει για όλους τους χώρους εργασίας που ανήκουν σε μέλη του <strong>${domainName}</strong> και θα λαμβάνει όλες τις αποδείξεις χρέωσης.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Η ενοποιημένη χρέωση τομέα δεν ήταν δυνατό να αλλάξει. Δοκιμάστε ξανά αργότερα.',
            addAdmin: 'Προσθήκη διαχειριστή',
            addAdminError: 'Δεν είναι δυνατή η προσθήκη αυτού του μέλους ως διαχειριστή. Παρακαλούμε δοκιμάστε ξανά.',
            revokeAdminAccess: 'Ανακαλέστε πρόσβαση διαχειριστή',
            cantRevokeAdminAccess: 'Δεν είναι δυνατή η ανάκληση της πρόσβασης διαχειριστή από το τεχνικό σημείο επαφής',
            error: {
                removeAdmin: 'Δεν είναι δυνατή η αφαίρεση αυτού του χρήστη ως διαχειριστή. Παρακαλούμε δοκιμάστε ξανά.',
                removeDomain: 'Δεν είναι δυνατή η κατάργηση αυτού του domain. Παρακαλούμε δοκιμάστε ξανά.',
                removeDomainNameInvalid: 'Παρακαλούμε εισαγάγετε το όνομα του domain σας για να το επαναφέρετε.',
            },
            resetDomain: 'Επαναφορά τομέα',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Πληκτρολογήστε <strong>${domainName}</strong> για να επιβεβαιώσετε την επαναφορά του domain.`,
            enterDomainName: 'Εισαγάγετε εδώ το όνομα του domain σας',
            resetDomainInfo: `Αυτή η ενέργεια είναι <strong>οριστική</strong> και θα διαγραφούν τα εξής δεδομένα: <br/> <bullet-list><bullet-item>Συνδέσεις εταιρικών καρτών και όλες οι μη υποβληθείσες δαπάνες από αυτές τις κάρτες</bullet-item><bullet-item>Ρυθμίσεις SAML και ομάδων</bullet-item><bullet-item>Δεδομένα ταξιδιών και πρόσβαση στο Expensify Travel</bullet-item></bullet-list> Όλοι οι λογαριασμοί, χώροι εργασίας, αναφορές, δαπάνες και άλλα δεδομένα θα παραμείνουν. <br/><br/>Σημείωση: Μπορείτε να αφαιρέσετε αυτόν τον τομέα από τη λίστα τομέων σας, αφαιρώντας το σχετικό email από τις <a href="#">μεθόδους επικοινωνίας</a> σας.`,
        },
        domainMembers: 'Μέλη τομέα',
        members: {
            title: 'Μέλη',
            findMember: 'Εύρεση μέλους',
            addMember: 'Προσθήκη μέλους',
            emptyMembers: {
                title: 'Δεν υπάρχουν μέλη σε αυτή την ομάδα',
                subtitle: 'Προσθέστε ένα μέλος ή δοκιμάστε να αλλάξετε το φίλτρο παραπάνω.',
            },
            allMembers: 'Όλα τα μέλη',
            email: 'Διεύθυνση email',
            closeAccountPrompt: 'Είστε βέβαιοι; Αυτή η ενέργεια είναι οριστική.',
            forceCloseAccount: () => ({
                one: 'Εξαναγκαστικό κλείσιμο λογαριασμού',
                other: 'Εξαναγκαστικό κλείσιμο λογαριασμών',
            }),
            safeCloseAccount: () => ({
                one: 'Κλείστε με ασφάλεια τον λογαριασμό',
                other: 'Κλείστε λογαριασμούς με ασφάλεια',
            }),
            closeAccountInfo: () => ({
                one: 'Σας προτείνουμε να κλείσετε τον λογαριασμό με ασφάλεια για να παραλείψετε το κλείσιμό του σε περίπτωση που υπάρχουν: <bullet-list><bullet-item>Εκκρεμείς εγκρίσεις</bullet-item><bullet-item>Ενεργές αποζημιώσεις</bullet-item><bullet-item>Καμία εναλλακτική μέθοδος σύνδεσης</bullet-item></bullet-list>Διαφορετικά, μπορείτε να αγνοήσετε τις παραπάνω προφυλάξεις ασφαλείας και να εξαναγκάσετε το κλείσιμο του επιλεγμένου λογαριασμού.',
                other: 'Σας προτείνουμε να κλείσετε με ασφάλεια τους λογαριασμούς για να παραλείψετε το κλείσιμό τους σε περίπτωση που υπάρχουν: <bullet-list><bullet-item>εκκρεμείς εγκρίσεις</bullet-item><bullet-item>ενεργές αποζημιώσεις</bullet-item><bullet-item>καμία εναλλακτική μέθοδος σύνδεσης</bullet-item></bullet-list>Διαφορετικά, μπορείτε να αγνοήσετε τις παραπάνω προφυλάξεις ασφαλείας και να εξαναγκάσετε το κλείσιμο των επιλεγμένων λογαριασμών.',
            }),
            closeAccount: () => ({
                one: 'Κλείσιμο λογαριασμού',
                other: 'Κλείσιμο λογαριασμών',
            }),
            moveToGroup: 'Μετακίνηση στην ομάδα',
            domainGroup: 'Ομάδα τομέα',
            chooseWhereToMove: ({count}: {count: number}) => `Επιλέξτε πού θα μετακινήσετε ${count} ${count === 1 ? 'μέλος' : 'μέλη'}.`,
            chooseWhereToMoveName: ({name}: {name: string}) => `Επιλέξτε πού θέλετε να μετακινήσετε το ${name}.`,
            error: {
                addMember: 'Δεν είναι δυνατή η προσθήκη αυτού του μέλους. Παρακαλούμε δοκιμάστε ξανά.',
                removeMember: 'Δεν είναι δυνατή η κατάργηση αυτού του χρήστη. Παρακαλούμε δοκιμάστε ξανά.',
                moveMember: 'Αδυναμία μετακίνησης αυτού του μέλους. Παρακαλούμε δοκιμάστε ξανά.',
                vacationDelegate: 'Δεν είναι δυνατό να οριστεί αυτός ο χρήστης ως αναπληρωτής αδείας. Παρακαλούμε δοκιμάστε ξανά.',
                moveMemberNotPolicyAdmin:
                    'Δεν είναι δυνατή η μετακίνηση του μέλους στην ομάδα τομέα. Πρέπει να είστε διαχειριστής πολιτικής για την Προτιμώμενη Πολιτική που έχει οριστεί στην ομάδα τομέα στην οποία προσπαθείτε να μετακινήσετε αυτόν τον χρήστη.',
            },
            cannotSetVacationDelegateForMember: (email: string) =>
                `Δεν μπορείτε να ορίσετε έναν αναπληρωτή αδειών για τον/την ${email} επειδή είναι ήδη αναπληρωτής/τρια για τα παρακάτω μέλη:`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `Είστε βέβαιοι; Αυτό θα κλειδώσει τον λογαριασμό του/της <strong>${email}</strong>. <br /><br /> Στη συνέχεια, η ομάδα μας θα εξετάσει τον λογαριασμό και θα αφαιρέσει κάθε μη εξουσιοδοτημένη πρόσβαση. Για να ανακτήσουν την πρόσβαση, θα χρειαστεί να συνεργαστούν με το Concierge.`,
            reportSuspiciousActivityConfirmationPrompt:
                'Θα εξετάσουμε τον λογαριασμό για να επιβεβαιώσουμε ότι είναι ασφαλές να ξεκλειδωθεί και θα επικοινωνήσουμε μέσω Concierge για τυχόν ερωτήσεις.',
            membersFeatureList: {
                subtitle: ({domainName}: {domainName: string}) =>
                    `<muted-text>Επαληθεύστε τον τομέα σας για μεγαλύτερο έλεγχο των μελών του <strong>${domainName}</strong> στο Expensify.</muted-text>`,
                controlPolicyCreation: 'Περιορισμός δημιουργίας χώρων εργασίας',
                enableSamlSso: 'Ενεργοποίηση SAML SSO',
                enforce2FA: 'Επιβολή 2FA',
            },
        },
        common: {
            settings: 'Ρυθμίσεις',
            forceTwoFactorAuth: 'Εξαναγκασμός ελέγχου ταυτότητας δύο παραγόντων',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `<muted-text>Παρακαλούμε απενεργοποιήστε το <a href="${samlPageUrl}">SAML</a> για να επιβάλετε τον έλεγχο ταυτότητας δύο παραγόντων.</muted-text>`,
            forceTwoFactorAuthDescription: `<muted-text>Να απαιτείται έλεγχος ταυτότητας δύο παραγόντων για όλα τα μέλη αυτού του domain. Τα μέλη του domain θα κληθούν να ρυθμίσουν τον έλεγχο ταυτότητας δύο παραγόντων στον λογαριασμό τους όταν συνδέονται.</muted-text>`,
            forceTwoFactorAuthError: 'Η επιβολή ελέγχου ταυτότητας δύο παραγόντων δεν μπόρεσε να αλλάξει. Δοκιμάστε ξανά αργότερα.',
            resetTwoFactorAuth: 'Επαναφορά ελέγχου ταυτότητας δύο παραγόντων',
            error: 'Δεν ήταν δυνατή η αποθήκευση αυτής της αλλαγής. Παρακαλούμε δοκιμάστε ξανά.',
        },
        groups: {
            title: 'Ομάδες',
            memberCount: () => {
                return {
                    one: '1 μέλος',
                    other: (count: number) => `${count} μέλη`,
                };
            },
            defaultGroup: 'Προεπιλεγμένη ομάδα για νέα μέλη',
            defaultGroupPrompt: (currentName: string, newName: string) =>
                `Είστε βέβαιοι ότι θέλετε να ορίσετε το ${newName} ως προεπιλεγμένη ομάδα; Τα νέα μέλη θα προσκαλούνται σε αυτήν την ομάδα αντί για την προηγούμενη προεπιλεγμένη ομάδα (${currentName}).`,
            makeDefault: 'Ορισμός ως προεπιλογή',
            neverMind: 'Δεν πειράζει',
            createGroupError: 'Δεν είναι δυνατή η δημιουργία αυτής της ομάδας. Παρακαλούμε προσπαθήστε ξανά.',
            permissions: 'Δικαιώματα ομάδας',
            createNewGroupButton: 'Νέα ομάδα',
            createGroupSubmitButton: 'Δημιουργία ομάδας',
            expensifyCardPreferredWorkspace: 'Προτιμώμενος χώρος εργασίας για την Κάρτα Expensify',
            expensifyCardPreferredWorkspaceDescription:
                'Όλες οι συναλλαγές με Κάρτα Expensify θα δημιουργούνται στο προτιμώμενο χώρο εργασίας Κάρτας Expensify αντί για τον προτιμώμενο χώρο εργασίας. Η ενεργοποίηση αυτής της δυνατότητας θα παρακάμψει τη ρύθμιση προτιμώμενου χώρου εργασίας μόνο για τις συναλλαγές με Κάρτα Expensify.',
            strictlyEnforceWorkspaceRules: 'Επιβάλετε αυστηρά τους κανόνες του χώρου εργασίας',
            strictlyEnforceWorkspaceRulesDescription: 'Πρέπει να πληρούνται όλοι οι κανόνες του χώρου εργασίας πριν από την υποβολή μιας αναφοράς. Δεν επιτρέπονται χειροκίνητες εξαιρέσεις.',
            restrictExpenseWorkspaceCreation: 'Περιορισμός δημιουργίας/διαγραφής χώρου εργασίας εξόδων',
            restrictExpenseWorkspaceCreationDescription:
                'Αποτρέψτε τα μέλη από το να μπορούν να δημιουργούν χώρο εργασίας εξόδων ή να αφαιρούν τον εαυτό τους από έναν χώρο εργασίας εξόδων. Αυτό είναι χρήσιμο για να αποτρέψετε τα άτομα από το να χρησιμοποιούν το Expensify για την υποβολή αναφορών προς χρήση εκτός του domain σας, όταν συνδυάζεται με αυστηρή επιβολή χρήσης χώρων εργασίας.',
            deleteGroup: 'Διαγραφή ομάδας',
            deleteGroupDangerConfirmationModal: 'Διαγραφή ομάδας',
            deleteGroupDangerConfirmationModalDescription: (defaultGroupName: string) =>
                `Είστε βέβαιοι; Αυτό θα επανααναθέσει όλα τα μέλη στην προεπιλεγμένη ομάδα (${defaultGroupName}) και δεν μπορεί να αναιρεθεί.`,
            deleteGroupError: 'Δεν είναι δυνατή η διαγραφή αυτής της ομάδας. Παρακαλούμε δοκιμάστε ξανά.',
            preferredWorkspace: 'Προτιμώμενος χώρος εργασίας',
            preferredWorkspaceDescription: (enabled: boolean) => `Όλες οι νέες αναφορές και δαπάνες θα δημιουργούνται στον χώρο εργασίας ${enabled ? 'επιλεγμένη προτιμώμενη' : 'αυτό'}.`,
            preferredWorkspaceSelectDescription: 'Όλες οι νέες δαπάνες και αναφορές θα δημιουργούνται σε αυτόν τον χώρο εργασίας.',
            noWorkspacesMessage: 'Δεν υπάρχουν χώροι εργασίας σε αυτόν τον τομέα. Απαιτείται ένας χώρος εργασίας για να ενεργοποιήσετε αυτόν τον περιορισμό.',
            restrictDefaultLoginSelection: 'Περιορισμός προεπιλεγμένης επιλογής σύνδεσης',
            restrictDefaultLoginSelectionDescription:
                'Αποτρέψτε τα μέλη από το να αλλάζουν το email σύνδεσής τους σε διεύθυνση εκτός του εταιρικού τους domain, ώστε να αποφύγετε περιορισμούς πολιτικών.',
            expensifyCardPreferredWorkspaceDisabledMessage:
                'Για να ενεργοποιήσετε αυτήν τη ρύθμιση, ενεργοποιήστε πρώτα ένα προτιμώμενο χώρο εργασίας και ρυθμίστε τις Κάρτες Expensify στον τομέα σας.',
            findGroup: 'Εύρεση ομάδας',
        },
    },
};
export default translations;
