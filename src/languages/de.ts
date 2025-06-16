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
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type en from './en';
import type {
    AccountOwnerParams,
    ActionsAreCurrentlyRestricted,
    AddedOrDeletedPolicyReportFieldParams,
    AddedPolicyApprovalRuleParams,
    AddEmployeeParams,
    AddOrDeletePolicyCustomUnitRateParams,
    AddressLineParams,
    AdminCanceledRequestParams,
    AirlineParams,
    AlreadySignedInParams,
    ApprovalWorkflowErrorParams,
    ApprovedAmountParams,
    AssignCardParams,
    AssignedCardParams,
    AssigneeParams,
    AuthenticationErrorParams,
    AutoPayApprovedReportsLimitErrorParams,
    BadgeFreeTrialParams,
    BeginningOfChatHistoryAdminRoomPartOneParams,
    BeginningOfChatHistoryAnnounceRoomPartOneParams,
    BeginningOfChatHistoryDomainRoomPartOneParams,
    BillingBannerCardAuthenticationRequiredParams,
    BillingBannerCardExpiredParams,
    BillingBannerCardOnDisputeParams,
    BillingBannerDisputePendingParams,
    BillingBannerInsufficientFundsParams,
    BillingBannerOwnerAmountOwedOverdueParams,
    BillingBannerSubtitleWithDateParams,
    CanceledRequestParams,
    CardEndingParams,
    CardInfoParams,
    CardNextPaymentParams,
    CategoryNameParams,
    ChangeFieldParams,
    ChangeOwnerDuplicateSubscriptionParams,
    ChangeOwnerHasFailedSettlementsParams,
    ChangeOwnerSubscriptionParams,
    ChangeReportPolicyParams,
    ChangeTypeParams,
    CharacterLengthLimitParams,
    CharacterLimitParams,
    ChatWithAccountManagerParams,
    CompanyCardBankName,
    CompanyCardFeedNameParams,
    CompanyNameParams,
    ConfirmThatParams,
    ConnectionNameParams,
    ConnectionParams,
    CurrencyCodeParams,
    CurrencyInputDisabledTextParams,
    CustomersOrJobsLabelParams,
    CustomUnitRateParams,
    DateParams,
    DateShouldBeAfterParams,
    DateShouldBeBeforeParams,
    DefaultAmountParams,
    DefaultVendorDescriptionParams,
    DelegateRoleParams,
    DelegateSubmitParams,
    DelegatorParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    DeleteTransactionParams,
    DemotedFromWorkspaceParams,
    DidSplitAmountMessageParams,
    DuplicateTransactionParams,
    EarlyDiscountSubtitleParams,
    EarlyDiscountTitleParams,
    EditActionParams,
    EditDestinationSubtitleParams,
    ElectronicFundsParams,
    EmployeeInviteMessageParams,
    EnterMagicCodeParams,
    ExportAgainModalDescriptionParams,
    ExportedToIntegrationParams,
    ExportIntegrationSelectedParams,
    FeatureNameParams,
    FileLimitParams,
    FiltersAmountBetweenParams,
    FlightLayoverParams,
    FlightParams,
    FormattedMaxLengthParams,
    GoBackMessageParams,
    GoToRoomParams,
    ImportedTagsMessageParams,
    ImportedTypesParams,
    ImportFieldParams,
    ImportMembersSuccessfulDescriptionParams,
    ImportPerDiemRatesSuccessfulDescriptionParams,
    ImportTagsSuccessfulDescriptionParams,
    IncorrectZipFormatParams,
    InstantSummaryParams,
    IntacctMappingTitleParams,
    IntegrationExportParams,
    IntegrationSyncFailedParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IssueVirtualCardParams,
    LastSyncAccountingParams,
    LastSyncDateParams,
    LeftWorkspaceParams,
    LocalTimeParams,
    LoggedInAsParams,
    LogSizeParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    MissingPropertyParams,
    MovedFromPersonalSpaceParams,
    MovedFromReportParams,
    MovedTransactionParams,
    NeedCategoryForExportToIntegrationParams,
    NewWorkspaceNameParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OptionalParam,
    OurEmailProviderParams,
    OwnerOwesAmountParams,
    PaidElsewhereParams,
    PaidWithExpensifyParams,
    ParentNavigationSummaryParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    PaySomeoneParams,
    PolicyAddedReportFieldOptionParams,
    PolicyDisabledReportFieldAllOptionsParams,
    PolicyDisabledReportFieldOptionParams,
    PolicyExpenseChatNameParams,
    RailTicketParams,
    ReconciliationWorksParams,
    RemovedFromApprovalWorkflowParams,
    RemovedTheRequestParams,
    RemoveMemberPromptParams,
    RemoveMembersWarningPrompt,
    RenamedRoomActionParams,
    RenamedWorkspaceNameActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ReportPolicyNameParams,
    RequestAmountParams,
    RequestCountParams,
    RequestedAmountMessageParams,
    RequiredFieldParams,
    ResolutionConstraintsParams,
    ReviewParams,
    RoleNamesParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    SecondaryLoginParams,
    SetTheDistanceMerchantParams,
    SetTheRequestParams,
    SettledAfterAddedBankAccountParams,
    SettleExpensifyCardParams,
    SettlementDateParams,
    ShareParams,
    SignUpNewFaceCodeParams,
    SizeExceededParams,
    SplitAmountParams,
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
    SpreadCategoriesParams,
    SpreadFieldNameParams,
    SpreadSheetColumnParams,
    StatementTitleParams,
    StepCounterParams,
    StripePaidParams,
    SubmitsToParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsRenewsOnParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSettingsSummaryParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
    TaskCreatedActionParams,
    TaxAmountParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    TotalAmountGreaterOrLessThanOriginalParams,
    ToValidateLoginParams,
    TransferParams,
    TravelTypeParams,
    TrialStartedTitleParams,
    UnapproveWithIntegrationWarningParams,
    UnshareParams,
    UntilTimeParams,
    UpdatedCustomFieldParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyAuditRateParams,
    UpdatedPolicyCategoryDescriptionHintTypeParams,
    UpdatedPolicyCategoryExpenseLimitTypeParams,
    UpdatedPolicyCategoryGLCodeParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    UpdatedPolicyCategoryMaxExpenseAmountParams,
    UpdatedPolicyCategoryNameParams,
    UpdatedPolicyCategoryParams,
    UpdatedPolicyCurrencyParams,
    UpdatedPolicyCustomUnitRateParams,
    UpdatedPolicyCustomUnitTaxClaimablePercentageParams,
    UpdatedPolicyCustomUnitTaxRateExternalIDParams,
    UpdatedPolicyDescriptionParams,
    UpdatedPolicyFieldWithNewAndOldValueParams,
    UpdatedPolicyFieldWithValueParam,
    UpdatedPolicyFrequencyParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyPreventSelfApprovalParams,
    UpdatedPolicyReportFieldDefaultValueParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdatePolicyCustomUnitParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    UpdateRoleParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    ViolationsAutoReportedRejectedExpenseParams,
    ViolationsCashExpenseWithNoReceiptParams,
    ViolationsConversionSurchargeParams,
    ViolationsCustomRulesParams,
    ViolationsInvoiceMarkupParams,
    ViolationsMaxAgeParams,
    ViolationsMissingTagParams,
    ViolationsModifiedAmountParams,
    ViolationsOverCategoryLimitParams,
    ViolationsOverLimitParams,
    ViolationsPerDayLimitParams,
    ViolationsProhibitedExpenseParams,
    ViolationsReceiptRequiredParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsTaxOutOfPolicyParams,
    WaitingOnBankAccountParams,
    WalletProgramParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    WeSentYouMagicSignInLinkParams,
    WorkEmailMergingBlockedParams,
    WorkEmailResendCodeParams,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    WorkspaceYouMayJoin,
    YourPlanPriceParams,
    YourPlanPriceValueParams,
    ZipCodeExampleFormatParams,
} from './params';
import type {TranslationDeepObject} from './types';

type StateValue = {
    stateISO: string;
    stateName: string;
};
type States = Record<keyof typeof COMMON_CONST.STATES, StateValue>;
type AllCountries = Record<Country, string>;
/* eslint-disable max-len */
const translations = {
    common: {
        count: 'Z\u00E4hlen',
        cancel: 'Abbrechen',
        dismiss: 'Verwerfen',
        yes: 'Ja',
        no: 'Nein',
        ok: 'OK',
        notNow: 'Nicht jetzt',
        learnMore: 'Erfahren Sie mehr.',
        buttonConfirm: 'Verstanden',
        name: 'Name',
        attachment: 'Anhang',
        attachments: 'Anh\u00E4nge',
        center: 'Zentrum',
        from: 'Von',
        to: 'Zu',
        in: 'In',
        optional: 'Optional',
        new: 'Neu',
        search: 'Suche',
        reports: 'Berichte',
        find: 'Finden',
        searchWithThreeDots: 'Suchen...',
        next: 'N\u00E4chste',
        previous: 'Vorherige',
        goBack: 'Zur\u00FCckgehen',
        create: 'Erstellen',
        add: 'Hinzuf\u00FCgen',
        resend: 'Erneut senden',
        save: 'Speichern',
        select: 'Ausw\u00E4hlen',
        deselect: 'Abw\u00E4hlen',
        selectMultiple: 'Mehrere ausw\u00E4hlen',
        saveChanges: '\u00C4nderungen speichern',
        submit: 'Absenden',
        rotate: 'Drehen',
        zoom: 'Zoom',
        password: 'Passwort',
        magicCode: 'Magic code',
        twoFactorCode: 'Zwei-Faktor-Code',
        workspaces: 'Arbeitsbereiche',
        inbox: 'Posteingang',
        group: 'Gruppe',
        profile: 'Profil',
        referral: 'Empfehlung',
        payments: 'Zahlungen',
        approvals: 'Genehmigungen',
        wallet: 'Brieftasche',
        preferences: 'Einstellungen',
        view: 'Ansicht',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Nicht',
        signIn: 'Anmelden',
        signInWithGoogle: 'Mit Google anmelden',
        signInWithApple: 'Mit Apple anmelden',
        signInWith: 'Anmelden mit',
        continue: 'Fortfahren',
        firstName: 'Vorname',
        lastName: 'Nachname',
        scanning: 'Scannen',
        addCardTermsOfService: 'Expensify-Nutzungsbedingungen',
        perPerson: 'pro Person',
        phone: 'Telefon',
        phoneNumber: 'Telefonnummer',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E-Mail',
        and: 'und',
        or: 'oder',
        details: 'Einzelheiten',
        privacy: 'Datenschutz',
        privacyPolicy: 'Datenschutzrichtlinie',
        hidden: 'Hidden',
        visible: 'Sichtbar',
        delete: 'L\u00F6schen',
        archived: 'archiviert',
        contacts: 'Kontakte',
        recents: 'K\u00FCrzlich',
        close: 'Schlie\u00DFen',
        download: 'Herunterladen',
        downloading: 'Herunterladen',
        uploading: 'Hochladen',
        pin: 'Pin',
        unPin: 'L\u00F6sen',
        back: 'Zur\u00FCck',
        saveAndContinue: 'Speichern & fortfahren',
        settings: 'Einstellungen',
        termsOfService: 'Nutzungsbedingungen',
        members: 'Mitglieder',
        invite: 'Einladen',
        here: 'hier',
        date: 'Datum',
        dob: 'Geburtsdatum',
        currentYear: 'Aktuelles Jahr',
        currentMonth: 'Aktueller Monat',
        ssnLast4: 'Letzte 4 Ziffern der SSN',
        ssnFull9: 'Vollst\u00E4ndige 9 Ziffern der SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Adresszeile ${lineNumber}`,
        personalAddress: 'Pers\u00F6nliche Adresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Bitte keine Postfach- oder Mail-Drop-Adressen.',
        city: 'Stadt',
        state: 'Zustand',
        streetAddress: 'Stra\u00DFenadresse',
        stateOrProvince: 'Bundesland / Provinz',
        country: 'Land',
        zip: 'Postleitzahl',
        zipPostCode: 'Postleitzahl',
        whatThis: 'Was ist das?',
        iAcceptThe: 'Ich akzeptiere die',
        remove: 'Entfernen',
        admin: 'Admin',
        owner: 'Eigent\u00FCmer',
        dateFormat: 'YYYY-MM-DD',
        send: 'Senden',
        na: 'N/A',
        noResultsFound: 'Keine Ergebnisse gefunden',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `Keine Ergebnisse gefunden, die mit "${searchString}" \u00FCbereinstimmen.`,
        recentDestinations: 'K\u00FCrzliche Ziele',
        timePrefix: 'Es ist',
        conjunctionFor: 'f\u00FCr',
        todayAt: 'Heute um',
        tomorrowAt: 'Morgen um',
        yesterdayAt: 'Gestern um',
        conjunctionAt: 'bei',
        conjunctionTo: 'zu',
        genericErrorMessage: 'Ups... etwas ist schiefgelaufen und Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es sp\u00E4ter erneut.',
        percentage: 'Prozentsatz',
        error: {
            invalidAmount: 'Ung\u00FCltiger Betrag',
            acceptTerms: 'Sie m\u00FCssen die Nutzungsbedingungen akzeptieren, um fortzufahren.',
            phoneNumber: `Bitte geben Sie eine g\u00FCltige Telefonnummer mit L\u00E4ndervorwahl ein (z. B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dieses Feld ist erforderlich',
            requestModified: 'Diese Anfrage wird von einem anderen Mitglied bearbeitet.',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Zeichenlimit \u00FCberschritten (${length}/${limit})`,
            dateInvalid: 'Bitte w\u00E4hlen Sie ein g\u00FCltiges Datum aus',
            invalidDateShouldBeFuture: 'Bitte w\u00E4hlen Sie heute oder ein zuk\u00FCnftiges Datum.',
            invalidTimeShouldBeFuture: 'Bitte w\u00E4hlen Sie eine Zeit, die mindestens eine Minute in der Zukunft liegt.',
            invalidCharacter: 'Ung\u00FCltiges Zeichen',
            enterMerchant: 'Geben Sie einen H\u00E4ndlernamen ein',
            enterAmount: 'Geben Sie einen Betrag ein',
            missingMerchantName: 'Fehlender H\u00E4ndlername',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Fehlendes Datum',
            enterDate: 'Geben Sie ein Datum ein',
            invalidTimeRange: 'Bitte geben Sie eine Uhrzeit im 12-Stunden-Format ein (z. B. 14:30 Uhr)',
            pleaseCompleteForm: 'Bitte f\u00FCllen Sie das obige Formular aus, um fortzufahren.',
            pleaseSelectOne: 'Bitte w\u00E4hlen Sie oben eine Option aus',
            invalidRateError: 'Bitte geben Sie einen g\u00FCltigen Satz ein.',
            lowRateError: 'Der Satz muss gr\u00F6\u00DFer als 0 sein.',
            email: 'Bitte geben Sie eine g\u00FCltige E-Mail-Adresse ein',
            login: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        comma: 'Komma',
        semicolon: 'semicolon',
        please: 'Bitte',
        contactUs: 'kontaktieren Sie uns',
        pleaseEnterEmailOrPhoneNumber: 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer ein.',
        fixTheErrors: 'die Fehler beheben',
        inTheFormBeforeContinuing: 'im Formular, bevor Sie fortfahren',
        confirm: 'Best\u00E4tigen',
        reset: 'Zur\u00FCcksetzen',
        done: 'Fertig',
        more: 'Mehr',
        debitCard: 'Debitkarte',
        bankAccount: 'Bankkonto',
        personalBankAccount: 'Pers\u00F6nliches Bankkonto',
        businessBankAccount: 'Gesch\u00E4ftsbankkonto',
        join: 'Beitreten',
        leave: 'Verlassen',
        decline: 'Ablehnen',
        transferBalance: 'Guthaben \u00FCbertragen',
        cantFindAddress: 'K\u00F6nnen Sie Ihre Adresse nicht finden?',
        enterManually: 'Manuell eingeben',
        message: 'Nachricht',
        leaveThread: 'Thread verlassen',
        you: 'Du',
        youAfterPreposition: 'du/Sie (depending on context)',
        your: 'Ihr',
        conciergeHelp: 'Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
        youAppearToBeOffline: 'Sie scheinen offline zu sein.',
        thisFeatureRequiresInternet: 'Diese Funktion erfordert eine aktive Internetverbindung.',
        attachmentWillBeAvailableOnceBackOnline: 'Der Anhang wird verf\u00FCgbar, sobald die Verbindung wiederhergestellt ist.',
        errorOccurredWhileTryingToPlayVideo: 'Beim Versuch, dieses Video abzuspielen, ist ein Fehler aufgetreten.',
        areYouSure: 'Bist du sicher?',
        verify: '\u00DCberpr\u00FCfen',
        yesContinue: 'Ja, fortfahren.',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: 'Beschreibung',
        title: 'Titel',
        assignee: 'Zugewiesene Person',
        createdBy: 'Erstellt von',
        with: 'mit',
        shareCode: 'Code teilen',
        share: 'Teilen',
        per: 'pro',
        mi: 'Meile',
        km: 'Kilometer',
        copied: 'Kopiert!',
        someone: 'Jemand',
        total: 'Gesamtbetrag',
        edit: 'Bearbeiten',
        letsDoThis: `Los geht's!`,
        letsStart: `Lass uns anfangen`,
        showMore: 'Mehr anzeigen',
        merchant: 'H\u00E4ndler',
        category: 'Kategorie',
        report: 'Bericht',
        billable: 'Abrechenbar',
        nonBillable: 'Nicht abrechenbar',
        tag: 'Tag',
        receipt: 'Beleg',
        verified: 'Verifiziert',
        replace: 'Ersetzen',
        distance: 'Entfernung',
        mile: 'Meile',
        miles: 'Meilen',
        kilometer: 'Kilometer',
        kilometers: 'Kilometer',
        recent: 'Neueste',
        all: 'Alle',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'W\u00E4hlen Sie eine W\u00E4hrung aus',
        card: 'Karte',
        whyDoWeAskForThis: 'Warum fragen wir danach?',
        required: 'Erforderlich',
        showing: 'Anzeigen',
        of: 'of',
        default: 'Standardm\u00E4\u00DFig',
        update: 'Aktualisieren',
        member: 'Mitglied',
        auditor: 'Pr\u00FCfer',
        role: 'Rolle',
        currency: 'W\u00E4hrung',
        rate: 'Bewerten',
        emptyLHN: {
            title: 'Woohoo! Alles erledigt.',
            subtitleText1: 'Finden Sie einen Chat mit dem',
            subtitleText2: 'Schaltfl\u00E4che oben oder erstellen Sie etwas mit dem',
            subtitleText3: 'Schaltfl\u00E4che unten.',
        },
        businessName: 'Firmenname',
        clear: 'L\u00F6schen',
        type: 'Typ',
        action: 'Aktion',
        expenses: 'Ausgaben',
        tax: 'Steuer',
        shared: 'Geteilt',
        drafts: 'Entw\u00FCrfe',
        finished: 'Fertiggestellt',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Arbeitsbereich herabstufen',
        companyID: 'Company ID',
        userID: 'Benutzer-ID',
        disable: 'Deaktivieren',
        export: 'Exportieren',
        initialValue: 'Anfangswert',
        currentDate: 'Aktuelles Datum',
        value: 'Wert',
        downloadFailedTitle: 'Download fehlgeschlagen',
        downloadFailedDescription: 'Ihr Download konnte nicht abgeschlossen werden. Bitte versuchen Sie es sp\u00E4ter noch einmal.',
        filterLogs: 'Protokolle filtern',
        network: 'Netzwerk',
        reportID: 'Berichts-ID',
        longID: 'Long ID',
        bankAccounts: 'Bankkonten',
        chooseFile: 'Datei ausw\u00E4hlen',
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        ignore: 'Ignore',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        import: 'Importieren',
        offlinePrompt: 'Sie k\u00F6nnen diese Aktion momentan nicht ausf\u00FChren.',
        outstanding: 'Hervorragend',
        chats: 'Chats',
        tasks: 'Aufgaben',
        unread: 'Ungelesen',
        sent: 'Gesendet',
        links: 'Links',
        days: 'Tage',
        rename: 'Umbenennen',
        address: 'Adresse',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Skip',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Brauchen Sie etwas Bestimmtes? Chatten Sie mit Ihrem Kundenbetreuer, ${accountManagerDisplayName}.`,
        chatNow: 'Jetzt chatten',
        workEmail: 'Arbeits-E-Mail',
        destination: 'Zielort',
        subrate: 'Subrate',
        perDiem: 'Per diem',
        validate: 'Validieren',
        downloadAsPDF: 'Als PDF herunterladen',
        downloadAsCSV: 'Als CSV herunterladen',
        help: 'Hilfe',
        expenseReports: 'Spesenabrechnungen',
        rateOutOfPolicy: 'Bewerten Sie au\u00DFerhalb der Richtlinie',
        reimbursable: 'Erstattungsf\u00E4hig',
        editYourProfile: 'Bearbeiten Sie Ihr Profil',
        comments: 'Kommentare',
        sharedIn: 'Geteilt in',
        unreported: 'Nicht gemeldet',
        explore: 'Erkunden',
        todo: 'To-do',
        invoice: 'Rechnung',
        expense: 'Ausgabe',
        chat: 'Plaudern',
        task: 'Aufgabe',
        trip: 'Reise',
        apply: 'Anwenden',
        status: 'Status',
        on: 'An',
        before: 'Vorher',
        after: 'Nach',
        reschedule: 'Verschieben',
        general: 'Allgemein',
        never: 'Niemals',
        workspacesTabTitle: 'Arbeitsbereiche',
        getTheApp: 'Hol dir die App',
        scanReceiptsOnTheGo: 'Scannen Sie Belege mit Ihrem Telefon',
    },
    supportalNoAccess: {
        title: 'Nicht so schnell',
        description: 'Sie sind nicht berechtigt, diese Aktion auszuf\u00FChren, wenn der Support eingeloggt ist.',
    },
    lockedAccount: {
        title: 'Gesperrtes Konto',
        description: 'Sie d\u00FCrfen diese Aktion nicht ausf\u00FChren, da dieses Konto gesperrt wurde. Bitte wenden Sie sich an concierge@expensify.com f\u00FCr weitere Schritte.',
    },
    location: {
        useCurrent: 'Aktuellen Standort verwenden',
        notFound: 'Wir konnten Ihren Standort nicht finden. Bitte versuchen Sie es erneut oder geben Sie eine Adresse manuell ein.',
        permissionDenied: 'Es sieht so aus, als h\u00E4tten Sie den Zugriff auf Ihren Standort verweigert.',
        please: 'Bitte',
        allowPermission: 'Standortzugriff in den Einstellungen erlauben',
        tryAgain: 'und versuche es erneut.',
    },
    contact: {
        importContacts: 'Kontakte importieren',
        importContactsTitle: 'Importieren Sie Ihre Kontakte',
        importContactsText: 'Importiere Kontakte von deinem Telefon, damit deine Lieblingspersonen immer nur einen Fingertipp entfernt sind.',
        importContactsExplanation: 'damit deine Lieblingsmenschen immer nur einen Fingertipp entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Gib uns gr\u00FCnes Licht, um deine Kontakte zu importieren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Nimm an der Diskussion teil.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Kamerazugriff',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kann ohne Zugriff auf Ihre Kamera keine Fotos aufnehmen. Tippen Sie auf Einstellungen, um die Berechtigungen zu aktualisieren.',
        attachmentError: 'Anlagenfehler',
        errorWhileSelectingAttachment: 'Beim Ausw\u00E4hlen eines Anhangs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        errorWhileSelectingCorruptedAttachment:
            'Ein Fehler ist aufgetreten, w\u00E4hrend ein besch\u00E4digter Anhang ausgew\u00E4hlt wurde. Bitte versuchen Sie es mit einer anderen Datei.',
        takePhoto: 'Foto machen',
        chooseFromGallery: 'Aus Galerie ausw\u00E4hlen',
        chooseDocument: 'Datei ausw\u00E4hlen',
        attachmentTooLarge: 'Anhang ist zu gro\u00DF',
        sizeExceeded: 'Die Anhangsgr\u00F6\u00DFe \u00FCberschreitet das Limit von 24 MB.',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Die Anhangsgr\u00F6\u00DFe \u00FCberschreitet das Limit von ${maxUploadSizeInMB} MB.`,
        attachmentTooSmall: 'Anhang ist zu klein',
        sizeNotMet: 'Die Anhangsgr\u00F6\u00DFe muss gr\u00F6\u00DFer als 240 Byte sein.',
        wrongFileType: 'Ung\u00FCltiger Dateityp',
        notAllowedExtension: 'Dieser Dateityp ist nicht erlaubt. Bitte versuchen Sie es mit einem anderen Dateityp.',
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuchen Sie es mit einer anderen Datei.',
        protectedPDFNotSupported: 'Passwortgesch\u00FCtztes PDF wird nicht unterst\u00FCtzt',
        attachmentImageResized: 'Dieses Bild wurde zur Vorschaugr\u00F6\u00DFe angepasst. Herunterladen f\u00FCr volle Aufl\u00F6sung.',
        attachmentImageTooLarge: 'Dieses Bild ist zu gro\u00DF, um es vor dem Hochladen anzuzeigen.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Sie k\u00F6nnen nur bis zu ${fileLimit} Dateien gleichzeitig hochladen.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien \u00FCberschreiten ${maxUploadSizeInMB} MB. Bitte versuchen Sie es erneut.`,
    },
    dropzone: {
        addAttachments: 'Anh\u00E4nge hinzuf\u00FCgen',
        scanReceipts: 'Belege scannen',
        replaceReceipt: 'Beleg ersetzen',
    },
    filePicker: {
        fileError: 'Dateifehler',
        errorWhileSelectingFile: 'Beim Ausw\u00E4hlen einer Datei ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    },
    connectionComplete: {
        title: 'Verbindung abgeschlossen',
        supportingText: 'Sie k\u00F6nnen dieses Fenster schlie\u00DFen und zur Expensify-App zur\u00FCckkehren.',
    },
    avatarCropModal: {
        title: 'Foto bearbeiten',
        description: 'Ziehen, zoomen und drehen Sie Ihr Bild, wie Sie m\u00F6chten.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Keine Erweiterung f\u00FCr den MIME-Typ gefunden',
        problemGettingImageYouPasted: 'Es gab ein Problem beim Abrufen des Bildes, das Sie eingef\u00FCgt haben.',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Die maximale Kommentar-L\u00E4nge betr\u00E4gt ${formattedMaxLength} Zeichen.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Die maximale L\u00E4nge des Aufgabentitels betr\u00E4gt ${formattedMaxLength} Zeichen.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App aktualisieren',
        updatePrompt: 'Eine neue Version dieser App ist verf\u00FCgbar.  \nJetzt aktualisieren oder die App sp\u00E4ter neu starten, um die neuesten \u00C4nderungen herunterzuladen.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wird gestartet',
        expired: 'Ihre Sitzung ist abgelaufen.',
        signIn: 'Bitte melden Sie sich erneut an.',
        redirectedToDesktopApp: 'Wir haben Sie zur Desktop-App weitergeleitet.',
        youCanAlso: 'Sie k\u00F6nnen auch',
        openLinkInBrowser: '\u00D6ffnen Sie diesen Link in Ihrem Browser.',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `Sie sind als ${email} angemeldet. Klicken Sie im Dialogfeld auf "Link \u00F6ffnen", um sich mit diesem Konto in der Desktop-App anzumelden.`,
        doNotSeePrompt: 'Kannst du die Eingabeaufforderung nicht sehen?',
        tryAgain: 'Versuche es erneut',
        or: ', oder',
        continueInWeb: 'weiter zur Web-App',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abrakadabra,\ndu bist angemeldet!',
        successfulSignInDescription: 'Gehen Sie zur\u00FCck zu Ihrem urspr\u00FCnglichen Tab, um fortzufahren.',
        title: 'Hier ist dein magischer Code',
        description: 'Bitte geben Sie den Code von dem Ger\u00E4t ein, auf dem er urspr\u00FCnglich angefordert wurde.',
        doNotShare: 'Teile deinen Code mit niemandem.\nExpensify wird dich niemals danach fragen!',
        or: ', oder',
        signInHere: 'Einfach hier anmelden',
        expiredCodeTitle: 'Magischer Code abgelaufen',
        expiredCodeDescription: 'Gehe zur\u00FCck zum urspr\u00FCnglichen Ger\u00E4t und fordere einen neuen Code an.',
        successfulNewCodeRequest: 'Code angefordert. Bitte \u00FCberpr\u00FCfen Sie Ihr Ger\u00E4t.',
        tfaRequiredTitle: 'Zwei-Faktor-Authentifizierung erforderlich',
        tfaRequiredDescription: 'Bitte geben Sie den Zwei-Faktor-Authentifizierungscode ein, wo Sie sich anmelden m\u00F6chten.',
        requestOneHere: 'Hier eine anfordern.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Bezahlt von',
        whatsItFor: 'Wof\u00FCr ist das?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Name, E-Mail oder Telefonnummer',
        findMember: 'Ein Mitglied finden',
        searchForSomeone: 'Jemanden suchen',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Reichen Sie eine Ausgabe ein, verweisen Sie auf Ihren Chef.',
            subtitleText: 'M\u00F6chten Sie, dass Ihr Chef Expensify auch nutzt? Reichen Sie einfach eine Ausgabe bei ihnen ein und wir k\u00FCmmern uns um den Rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Einen Anruf buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Beginnen Sie unten.',
        anotherLoginPageIsOpen: 'Eine weitere Anmeldeseite ist ge\u00F6ffnet.',
        anotherLoginPageIsOpenExplanation: 'Sie haben die Anmeldeseite in einem separaten Tab ge\u00F6ffnet. Bitte melden Sie sich von diesem Tab aus an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht. Und jetzt, da Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Ihre Zahlungen erreichen Sie so schnell, wie Sie Ihren Standpunkt vermitteln k\u00F6nnen.',
        enterPassword: 'Bitte geben Sie Ihr Passwort ein',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, es ist immer sch\u00F6n, ein neues Gesicht hier zu sehen!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${login} gesendet wurde. Er sollte innerhalb einer Minute oder zwei ankommen.`,
    },
    login: {
        hero: {
            header: 'Reisen und Ausgaben, in der Geschwindigkeit des Chats',
            body: 'Willkommen bei der n\u00E4chsten Generation von Expensify, wo Ihre Reisen und Ausgaben mit Hilfe von kontextuellem, Echtzeit-Chat schneller ablaufen.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Sie sind bereits als ${email} angemeldet.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `M\u00F6chten Sie sich nicht mit ${provider} anmelden?`,
        continueWithMyCurrentSession: 'Mit meiner aktuellen Sitzung fortfahren',
        redirectToDesktopMessage: 'Wir leiten Sie zur Desktop-App weiter, sobald Sie sich angemeldet haben.',
        signInAgreementMessage: 'Mit dem Einloggen stimmen Sie den',
        termsOfService: 'Nutzungsbedingungen',
        privacy: 'Datenschutz',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Weiter mit Single Sign-On anmelden:',
        orContinueWithMagicCode: 'Sie k\u00F6nnen sich auch mit einem magischen Code anmelden.',
        useSingleSignOn: 'Einmalanmeldung verwenden',
        useMagicCode: 'Verwende magischen Code',
        launching: 'Starten...',
        oneMoment: 'Einen Moment, w\u00E4hrend wir Sie zum Single-Sign-On-Portal Ihres Unternehmens weiterleiten.',
    },
    reportActionCompose: {
        dropToUpload: 'Zum Hochladen hierher ziehen',
        sendAttachment: 'Anhang senden',
        addAttachment: 'Anhang hinzuf\u00FCgen',
        writeSomething: 'Schreibe etwas...',
        blockedFromConcierge: 'Kommunikation ist gesperrt',
        fileUploadFailed: 'Hochladen fehlgeschlagen. Datei wird nicht unterst\u00FCtzt.',
        localTime: ({user, time}: LocalTimeParams) => `Es ist ${time} f\u00FCr ${user}`,
        edited: '(\u00FCberarbeitet)',
        emoji: 'Emoji',
        collapse: 'Einklappen',
        expand: 'Erweitern',
    },
    reportActionContextMenu: {
        copyToClipboard: 'In die Zwischenablage kopieren',
        copied: 'Kopiert!',
        copyLink: 'Link kopieren',
        copyURLToClipboard: 'URL in die Zwischenablage kopieren',
        copyEmailToClipboard: 'E-Mail in die Zwischenablage kopieren',
        markAsUnread: 'Als ungelesen markieren',
        markAsRead: 'Als gelesen markieren',
        editAction: ({action}: EditActionParams) => `Bearbeiten ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar'}`,
        deleteAction: ({action}: DeleteActionParams) => `L\u00F6schen ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `M\u00F6chten Sie dieses ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar'} wirklich l\u00F6schen?`,
        onlyVisible: 'Nur sichtbar f\u00FCr',
        replyInThread: 'Im Thread antworten',
        joinThread: 'Thread beitreten',
        leaveThread: 'Thread verlassen',
        copyOnyxData: 'Onyx-Daten kopieren',
        flagAsOffensive: 'Als anst\u00F6\u00DFig markieren',
        menu: 'Men\u00FC',
    },
    emojiReactions: {
        addReactionTooltip: 'Reaktion hinzuf\u00FCgen',
        reactedWith: 'reagierte mit',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Du hast die Party in verpasst.',
        beginningOfArchivedRoomPartTwo: ', hier gibt es nichts zu sehen.',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `Dieser Chat ist mit allen Expensify-Mitgliedern in der ${domainRoom}-Domain.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Verwenden Sie es, um mit Kollegen zu chatten, Tipps zu teilen und Fragen zu stellen.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Dieser Chat ist mit',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: 'Verwenden Sie es, um \u00FCber die Einrichtung des Arbeitsbereichs und mehr zu chatten.',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Dieser Chat ist mit allen in ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `Verwenden Sie es f\u00FCr die wichtigsten Ank\u00FCndigungen.`,
        beginningOfChatHistoryUserRoomPartOne: 'Dieser Chatraum ist f\u00FCr alles.',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Dieser Chat ist f\u00FCr Rechnungen zwischen`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Verwenden Sie die + Schaltfl\u00E4che, um eine Rechnung zu senden.`,
        beginningOfChatHistory: 'Dieser Chat ist mit',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'Dies ist, wo',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'wird Ausgaben einreichen bei',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Verwenden Sie einfach die + Taste.',
        beginningOfChatHistorySelfDM: 'Dies ist Ihr pers\u00F6nlicher Bereich. Nutzen Sie ihn f\u00FCr Notizen, Aufgaben, Entw\u00FCrfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Lassen Sie uns mit der Einrichtung beginnen.',
        chatWithAccountManager: 'Hier mit Ihrem Account Manager chatten',
        sayHello: 'Sag Hallo!',
        yourSpace: 'Ihr Bereich',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Willkommen in ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Verwenden Sie die + Taste, um ${additionalText} einen Ausgabenposten hinzuzuf\u00FCgen.`,
        askConcierge: 'Stellen Sie Fragen und erhalten Sie rund um die Uhr Unterst\u00FCtzung in Echtzeit.',
        conciergeSupport: '24/7 Support',
        create: 'erstellen',
        iouTypes: {
            pay: 'bezahlen',
            split: 'aufteilen',
            submit: 'einreichen',
            track: 'verfolgen',
            invoice: 'Rechnung',
        },
    },
    adminOnlyCanPost: 'Nur Administratoren k\u00F6nnen Nachrichten in diesem Raum senden.',
    reportAction: {
        asCopilot: 'als Co-Pilot f\u00FCr',
    },
    mentionSuggestions: {
        hereAlternateText: 'Benachrichtige alle in diesem Gespr\u00E4ch',
    },
    newMessages: 'Neue Nachrichten',
    youHaveBeenBanned: 'Hinweis: Du wurdest von der Teilnahme an diesem Kanal ausgeschlossen.',
    reportTypingIndicator: {
        isTyping: 'tippt...',
        areTyping: 'tippen...',
        multipleMembers: 'Mehrere Mitglieder',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Dieser Chatraum wurde archiviert.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Dieser Chat ist nicht mehr aktiv, weil ${displayName} ihr Konto geschlossen hat.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${oldDisplayName} ihr Konto mit ${displayName} zusammengef\u00FChrt hat.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Dieser Chat ist nicht mehr aktiv, weil <strong>Sie</strong> kein Mitglied des ${policyName}-Arbeitsbereichs mehr sind.`
                : `Dieser Chat ist nicht mehr aktiv, da ${displayName} kein Mitglied des Arbeitsbereichs ${policyName} mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, da ${policyName} kein aktiver Arbeitsbereich mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, da ${policyName} kein aktiver Arbeitsbereich mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Diese Buchung ist archiviert.',
    },
    writeCapabilityPage: {
        label: 'Wer kann posten?',
        writeCapability: {
            all: 'Alle Mitglieder',
            admins: 'Nur Administratoren',
        },
    },
    sidebarScreen: {
        buttonFind: 'Etwas finden...',
        buttonMySettings: 'Meine Einstellungen',
        fabNewChat: 'Chat starten',
        fabNewChatExplained: 'Chat starten (Floating action)',
        chatPinned: 'Chat angeheftet',
        draftedMessage: 'Entwurf der Nachricht',
        listOfChatMessages: 'Liste der Chatnachrichten',
        listOfChats: 'Liste der Chats',
        saveTheWorld: 'Rette die Welt',
        tooltip: 'Hier starten!',
        redirectToExpensifyClassicModal: {
            title: 'Demn\u00E4chst verf\u00FCgbar',
            description:
                'Wir optimieren noch ein paar Details von New Expensify, um Ihre spezielle Einrichtung zu ber\u00FCcksichtigen. In der Zwischenzeit, besuchen Sie Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domains',
    },
    tabSelector: {
        chat: 'Plaudern',
        room: 'Zimmer',
        distance: 'Entfernung',
        manual: 'Handbuch',
        scan: 'Scannen',
    },
    spreadsheet: {
        upload: 'Eine Tabelle hochladen',
        dragAndDrop: 'Ziehen Sie Ihre Tabelle hierher, oder w\u00E4hlen Sie unten eine Datei aus. Unterst\u00FCtzte Formate: .csv, .txt, .xls und .xlsx.',
        chooseSpreadsheet: 'W\u00E4hlen Sie eine Tabellenkalkulationsdatei zum Importieren aus. Unterst\u00FCtzte Formate: .csv, .txt, .xls und .xlsx.',
        fileContainsHeader: 'Datei enth\u00E4lt Spalten\u00FCberschriften',
        column: ({name}: SpreadSheetColumnParams) => `Spalte ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Hoppla! Ein erforderliches Feld ("${fieldName}") wurde nicht zugeordnet. Bitte \u00FCberpr\u00FCfen und erneut versuchen.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Hoppla! Sie haben ein einzelnes Feld ("${fieldName}") mehreren Spalten zugeordnet. Bitte \u00FCberpr\u00FCfen Sie dies und versuchen Sie es erneut.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) =>
            `Hoppla! Das Feld (\u201E${fieldName}\u201C) enth\u00E4lt einen oder mehrere leere Werte. Bitte \u00FCberpr\u00FCfen und erneut versuchen.`,
        importSuccessfulTitle: 'Import erfolgreich',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) =>
            categories > 1 ? `${categories} Kategorien wurden hinzugef\u00FCgt.` : '1 Kategorie wurde hinzugef\u00FCgt.',
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Es wurden keine Mitglieder hinzugef\u00FCgt oder aktualisiert.';
            }
            if (added && updated) {
                return `${added} Mitglied${added > 1 ? 's' : ''} hinzugef\u00FCgt, ${updated} Mitglied${updated > 1 ? 's' : ''} aktualisiert.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} Mitglieder wurden aktualisiert.` : '1 Mitglied wurde aktualisiert.';
            }
            return added > 1 ? `${added} Mitglieder wurden hinzugef\u00FCgt.` : '1 Mitglied wurde hinzugef\u00FCgt.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} Tags wurden hinzugef\u00FCgt.` : '1 Tag wurde hinzugef\u00FCgt.'),
        importMultiLevelTagsSuccessfulDescription: 'Mehrstufige Tags wurden hinzugef\u00FCgt.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `${rates} Tagespauschalen wurden hinzugef\u00FCgt.` : 'Ein Tagessatz wurde hinzugef\u00FCgt.',
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription:
            'Bitte stellen Sie sicher, dass alle Felder korrekt ausgef\u00FCllt sind, und versuchen Sie es erneut. Wenn das Problem weiterhin besteht, wenden Sie sich bitte an Concierge.',
        importDescription:
            'W\u00E4hlen Sie aus, welche Felder aus Ihrer Tabelle zugeordnet werden sollen, indem Sie auf das Dropdown-Men\u00FC neben jeder importierten Spalte unten klicken.',
        sizeNotMet: 'Die Dateigr\u00F6\u00DFe muss gr\u00F6\u00DFer als 0 Byte sein.',
        invalidFileMessage:
            'Die Datei, die Sie hochgeladen haben, ist entweder leer oder enth\u00E4lt ung\u00FCltige Daten. Bitte stellen Sie sicher, dass die Datei korrekt formatiert ist und die erforderlichen Informationen enth\u00E4lt, bevor Sie sie erneut hochladen.',
        importSpreadsheet: 'Tabellenkalkulation importieren',
        downloadCSV: 'CSV herunterladen',
    },
    receipt: {
        upload: 'Beleg hochladen',
        dragReceiptBeforeEmail: 'Ziehen Sie eine Quittung auf diese Seite oder leiten Sie eine Quittung weiter an',
        dragReceiptAfterEmail: 'oder w\u00E4hlen Sie unten eine Datei zum Hochladen aus.',
        chooseReceipt: 'W\u00E4hlen Sie eine Quittung zum Hochladen aus oder leiten Sie eine Quittung weiter an',
        takePhoto: 'Ein Foto machen',
        cameraAccess: 'Kamerazugriff ist erforderlich, um Bilder von Belegen zu machen.',
        deniedCameraAccess: 'Kamerazugriff wurde noch nicht gew\u00E4hrt, bitte folgen Sie',
        deniedCameraAccessInstructions: 'diese Anweisungen',
        cameraErrorTitle: 'Kamerafehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        locationAccessTitle: 'Standortzugriff erlauben',
        locationAccessMessage: 'Standortzugriff hilft uns, Ihre Zeitzone und W\u00E4hrung \u00FCberall genau zu halten, wohin Sie auch gehen.',
        locationErrorTitle: 'Standortzugriff erlauben',
        locationErrorMessage: 'Standortzugriff hilft uns, Ihre Zeitzone und W\u00E4hrung \u00FCberall genau zu halten, wohin Sie auch gehen.',
        allowLocationFromSetting: `Standortzugriff hilft uns, Ihre Zeitzone und W\u00E4hrung \u00FCberall genau zu halten, wohin Sie auch gehen. Bitte erlauben Sie den Standortzugriff in den Berechtigungseinstellungen Ihres Ger\u00E4ts.`,
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        flash: 'Blitz',
        multiScan: 'multi-scan',
        shutter: 'Verschluss',
        gallery: 'Galerie',
        deleteReceipt: 'Beleg l\u00F6schen',
        deleteConfirmation: 'M\u00F6chten Sie diesen Beleg wirklich l\u00F6schen?',
        addReceipt: 'Beleg hinzuf\u00FCgen',
    },
    quickAction: {
        scanReceipt: 'Beleg scannen',
        recordDistance: 'Entfernung verfolgen',
        requestMoney: 'Ausgabe erstellen',
        perDiem: 'Tagespauschale erstellen',
        splitBill: 'Ausgabe aufteilen',
        splitScan: 'Beleg aufteilen',
        splitDistance: 'Entfernung aufteilen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pay ${name ?? 'jemand'}`,
        assignTask: 'Aufgabe zuweisen',
        header: 'Schnelle Aktion',
        noLongerHaveReportAccess: 'Sie haben keinen Zugriff mehr auf Ihr vorheriges Ziel f\u00FCr Schnellaktionen. W\u00E4hlen Sie unten ein neues aus.',
        updateDestination: 'Ziel aktualisieren',
        createReport: 'Bericht erstellen',
    },
    iou: {
        amount: 'Betrag',
        taxAmount: 'Steuerbetrag',
        taxRate: 'Steuersatz',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Genehmigen ${formattedAmount}` : 'Genehmigen'),
        approved: 'Genehmigt',
        cash: 'Barzahlung',
        card: 'Karte',
        original: 'Original',
        split: 'Teilen',
        splitExpense: 'Ausgabe aufteilen',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} von ${merchant}`,
        addSplit: 'Teilung hinzuf\u00FCgen',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist ${amount} h\u00F6her als die urspr\u00FCngliche Ausgabe.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist ${amount} weniger als die urspr\u00FCngliche Ausgabe.`,
        splitExpenseZeroAmount: 'Bitte geben Sie einen g\u00FCltigen Betrag ein, bevor Sie fortfahren.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Bearbeiten Sie ${amount} f\u00FCr ${merchant}`,
        removeSplit: 'Entfernen Sie die Aufteilung',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pay ${name ?? 'jemand'}`,
        expense: 'Ausgabe',
        categorize: 'Kategorisieren',
        share: 'Teilen',
        participants: 'Teilnehmer',
        createExpense: 'Ausgabe erstellen',
        addExpense: 'Ausgabe hinzuf\u00FCgen',
        chooseRecipient: 'Empf\u00E4nger ausw\u00E4hlen',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Erstelle ${amount} Ausgabe`,
        confirmDetails: 'Details best\u00E4tigen',
        pay: 'Bezahlen',
        cancelPayment: 'Zahlung stornieren',
        cancelPaymentConfirmation: 'M\u00F6chten Sie diese Zahlung wirklich stornieren?',
        viewDetails: 'Details anzeigen',
        pending: 'Ausstehend',
        canceled: 'Abgebrochen',
        posted: 'Gepostet',
        deleteReceipt: 'Beleg l\u00F6schen',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `hat eine Ausgabe in diesem Bericht gel\u00F6scht, ${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `verschob eine Ausgabe${reportName ? `von ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `verschob diese Ausgabe${reportName ? `zu <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'diese Ausgabe in Ihren pers\u00F6nlichen Bereich verschoben',
        pendingMatchWithCreditCard: 'Beleg steht aus, um mit Kartentransaktion abgeglichen zu werden.',
        pendingMatch: 'Ausstehende \u00DCbereinstimmung',
        pendingMatchWithCreditCardDescription: 'Beleg steht aus, um mit Kartentransaktion abgeglichen zu werden. Als Barzahlung markieren, um abzubrechen.',
        markAsCash: 'Als bar markieren',
        routePending: 'Route ausstehend...',
        receiptScanning: () => ({
            one: 'Beleg scannen...',
            other: 'Belege werden gescannt...',
        }),
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Machen Sie Fotos von all Ihren Belegen auf einmal, dann best\u00E4tigen Sie die Details selbst oder lassen Sie SmartScan das \u00FCbernehmen.',
        receiptScanInProgress: 'Belegscan l\u00E4uft',
        receiptScanInProgressDescription: 'Belegscan l\u00E4uft. Sp\u00E4ter erneut pr\u00FCfen oder die Details jetzt eingeben.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Potenzielle doppelte Ausgaben erkannt. \u00DCberpr\u00FCfen Sie die Duplikate, um die Einreichung zu erm\u00F6glichen.'
                : 'Potenzielle doppelte Ausgaben identifiziert. \u00DCberpr\u00FCfen Sie die Duplikate, um die Genehmigung zu erm\u00F6glichen.',
        receiptIssuesFound: () => ({
            one: 'Problem gefunden',
            other: 'Gefundene Probleme',
        }),
        fieldPending: 'Ausstehend...',
        defaultRate: 'Standardrate',
        receiptMissingDetails: 'Beleg fehlt Details',
        missingAmount: 'Fehlender Betrag',
        missingMerchant: 'Fehlender H\u00E4ndler',
        receiptStatusTitle: 'Scannen\u2026',
        receiptStatusText: 'Nur Sie k\u00F6nnen diese Quittung sehen, w\u00E4hrend sie gescannt wird. Schauen Sie sp\u00E4ter noch einmal vorbei oder geben Sie die Details jetzt ein.',
        receiptScanningFailed: 'Beleg-Scan fehlgeschlagen. Bitte geben Sie die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Es kann einige Tage dauern, bis sie gebucht wird.',
        companyInfo: 'Unternehmensinformationen',
        companyInfoDescription: 'Wir ben\u00F6tigen noch einige weitere Details, bevor Sie Ihre erste Rechnung senden k\u00F6nnen.',
        yourCompanyName: 'Ihr Firmenname',
        yourCompanyWebsite: 'Ihre Unternehmenswebsite',
        yourCompanyWebsiteNote: 'Wenn Sie keine Website haben, k\u00F6nnen Sie stattdessen das LinkedIn-Profil Ihres Unternehmens oder ein Social-Media-Profil angeben.',
        invalidDomainError: 'Sie haben eine ung\u00FCltige Domain eingegeben. Um fortzufahren, geben Sie bitte eine g\u00FCltige Domain ein.',
        publicDomainError: 'Sie haben eine \u00F6ffentliche Domain betreten. Um fortzufahren, geben Sie bitte eine private Domain ein.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} scannen`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} ausstehend`);
            }
            return {
                one: statusText.length > 0 ? `1 Ausgabe (${statusText.join(', ')})` : `1 Ausgabe`,
                other: (count: number) => (statusText.length > 0 ? `${count} Ausgaben (${statusText.join(', ')})` : `${count} Ausgaben`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 Ausgabe',
                other: (count: number) => `${count} Ausgaben`,
            };
        },
        deleteExpense: () => ({
            one: 'Ausgabe l\u00F6schen',
            other: 'Ausgaben l\u00F6schen',
        }),
        deleteConfirmation: () => ({
            one: 'M\u00F6chten Sie diesen Ausgabenposten wirklich l\u00F6schen?',
            other: 'M\u00F6chten Sie diese Ausgaben wirklich l\u00F6schen?',
        }),
        deleteReport: 'Bericht l\u00F6schen',
        deleteReportConfirmation: 'M\u00F6chten Sie diesen Bericht wirklich l\u00F6schen?',
        settledExpensify: 'Bezahlt',
        done: 'Fertig',
        settledElsewhere: 'Anderswo bezahlt',
        individual: 'Individuum',
        business: 'Business',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Bezahle ${formattedAmount} mit Expensify` : `Mit Expensify bezahlen`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zahlen Sie ${formattedAmount} als Einzelperson` : `Als Einzelperson bezahlen`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zahlen Sie ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zahlen Sie ${formattedAmount} als Unternehmen` : `Als Unternehmen bezahlen`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zahle ${formattedAmount} woanders` : `Anderswo bezahlen`),
        nextStep: 'N\u00E4chste Schritte',
        finished: 'Fertiggestellt',
        sendInvoice: ({amount}: RequestAmountParams) => `Sende ${amount} Rechnung`,
        submitAmount: ({amount}: RequestAmountParams) => `${amount} einreichen`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `f\u00FCr ${comment}` : ''}`,
        submitted: `eingereicht`,
        automaticallySubmitted: `eingereicht \u00FCber <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">Verz\u00F6gerungseinreichungen</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `Verfolgung ${formattedAmount}${comment ? `f\u00FCr ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} aufteilen`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? `f\u00FCr ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Ihr Anteil ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} schuldet ${amount}${comment ? `f\u00FCr ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} schuldet:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}hat ${amount} bezahlt`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} hat bezahlt:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} hat ${amount} ausgegeben`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} hat ausgegeben:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} genehmigt:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} hat ${amount} genehmigt`,
        payerSettled: ({amount}: PayerSettledParams) => `bezahlt ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `${amount} bezahlt. F\u00FCgen Sie ein Bankkonto hinzu, um Ihre Zahlung zu erhalten.`,
        automaticallyApproved: `genehmigt \u00FCber <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `genehmigt ${amount}`,
        approvedMessage: `genehmigt`,
        unapproved: `nicht genehmigt`,
        automaticallyForwarded: `genehmigt \u00FCber <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a>`,
        forwarded: `genehmigt`,
        rejectedThisReport: 'diesen Bericht abgelehnt',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `hat begonnen, die Abrechnung vorzunehmen. Die Zahlung wird zur\u00FCckgehalten, bis ${submitterDisplayName} ein Bankkonto hinzuf\u00FCgt.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} hat die Zahlung storniert`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `hat die Zahlung von ${amount} storniert, weil ${submitterDisplayName} ihre Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat.`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} hat ein Bankkonto hinzugef\u00FCgt. Die Zahlung von ${amount} wurde durchgef\u00FChrt.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}woanders bezahlt`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''} mit Expensify bezahlt`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} hat mit Expensify \u00FCber <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a> bezahlt.`,
        noReimbursableExpenses: 'Dieser Bericht hat einen ung\u00FCltigen Betrag.',
        pendingConversionMessage: 'Der Gesamtbetrag wird aktualisiert, wenn Sie wieder online sind.',
        changedTheExpense: 'hat die Ausgabe ge\u00E4ndert',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `der ${valueName} zu ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `setze das ${translatedChangedField} auf ${newMerchant}, wodurch der Betrag auf ${newAmountToDisplay} gesetzt wird`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `der ${valueName} (zuvor ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `der ${valueName} zu ${newValueToDisplay} (zuvor ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `\u00E4nderte das ${translatedChangedField} zu ${newMerchant} (zuvor ${oldMerchant}), wodurch der Betrag auf ${newAmountToDisplay} aktualisiert wurde (zuvor ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `f\u00FCr ${comment}` : 'Ausgabe'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rechnungsbericht Nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} gesendet${comment ? `f\u00FCr ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `hat Ausgabe von pers\u00F6nlichem Bereich zu ${workspaceName ?? `mit ${reportName} chatten`} verschoben`,
        movedToPersonalSpace: 'Ausgabe in den pers\u00F6nlichen Bereich verschoben',
        tagSelection: 'W\u00E4hlen Sie ein Tag aus, um Ihre Ausgaben besser zu organisieren.',
        categorySelection: 'W\u00E4hlen Sie eine Kategorie, um Ihre Ausgaben besser zu organisieren.',
        error: {
            invalidCategoryLength: 'Der Kategoriename \u00FCberschreitet 255 Zeichen. Bitte k\u00FCrzen Sie ihn oder w\u00E4hlen Sie eine andere Kategorie.',
            invalidTagLength: 'Der Tagname \u00FCberschreitet 255 Zeichen. Bitte k\u00FCrzen Sie ihn oder w\u00E4hlen Sie einen anderen Tag.',
            invalidAmount: 'Bitte geben Sie einen g\u00FCltigen Betrag ein, bevor Sie fortfahren.',
            invalidIntegerAmount: 'Bitte geben Sie einen ganzen Dollarbetrag ein, bevor Sie fortfahren.',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Der maximale Steuerbetrag ist ${amount}`,
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen.',
            invalidSplitParticipants: 'Bitte geben Sie einen Betrag gr\u00F6\u00DFer als null f\u00FCr mindestens zwei Teilnehmer ein.',
            invalidSplitYourself: 'Bitte geben Sie einen Betrag ungleich null f\u00FCr Ihre Aufteilung ein.',
            noParticipantSelected: 'Bitte w\u00E4hlen Sie einen Teilnehmer aus',
            other: 'Unerwarteter Fehler. Bitte versuchen Sie es sp\u00E4ter noch einmal.',
            genericCreateFailureMessage: 'Unerwarteter Fehler beim Einreichen dieser Ausgabe. Bitte versuchen Sie es sp\u00E4ter erneut.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuchen Sie es sp\u00E4ter erneut.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler beim Halten dieser Ausgabe. Bitte versuchen Sie es sp\u00E4ter erneut.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Entfernen dieser Ausgabe von der Warteschleife. Bitte versuchen Sie es sp\u00E4ter erneut.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim L\u00F6schen dieser Quittung. Bitte versuchen Sie es sp\u00E4ter erneut.',
            receiptFailureMessage: 'Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten. Bitte',
            receiptFailureMessageShort: 'Beim Hochladen Ihrer Quittung ist ein Fehler aufgetreten.',
            tryAgainMessage: 'nochmals versuchen',
            saveFileMessage: 'Speichern Sie die Quittung',
            uploadLaterMessage: 'sp\u00E4ter hochladen.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim L\u00F6schen dieser Ausgabe. Bitte versuchen Sie es sp\u00E4ter erneut.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieser Ausgabe. Bitte versuchen Sie es sp\u00E4ter erneut.',
            genericSmartscanFailureMessage: 'Transaktion hat fehlende Felder',
            duplicateWaypointsErrorMessage: 'Bitte entfernen Sie doppelte Wegpunkte.',
            atLeastTwoDifferentWaypoints: 'Bitte geben Sie mindestens zwei verschiedene Adressen ein.',
            splitExpenseMultipleParticipantsErrorMessage:
                'Eine Ausgabe kann nicht zwischen einem Arbeitsbereich und anderen Mitgliedern aufgeteilt werden. Bitte aktualisieren Sie Ihre Auswahl.',
            invalidMerchant: 'Bitte geben Sie einen g\u00FCltigen H\u00E4ndler ein.',
            atLeastOneAttendee: 'Mindestens ein Teilnehmer muss ausgew\u00E4hlt werden',
            invalidQuantity: 'Bitte geben Sie eine g\u00FCltige Menge ein',
            quantityGreaterThanZero: 'Die Menge muss gr\u00F6\u00DFer als null sein.',
            invalidSubrateLength: 'Es muss mindestens eine Unterrate geben.',
            invalidRate: 'Der Satz kann nicht \u00FCbersetzt werden.',
        },
        dismissReceiptError: 'Fehler verwerfen',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn Sie diesen Fehler ignorieren, wird Ihre hochgeladene Quittung vollst\u00E4ndig entfernt. Sind Sie sicher?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `hat begonnen, die Abrechnung durchzuf\u00FChren. Die Zahlung wird zur\u00FCckgehalten, bis ${submitterDisplayName} ihre Wallet aktiviert.`,
        enableWallet: 'Wallet aktivieren',
        hold: 'Halten',
        unhold: 'Sperre aufheben',
        holdExpense: 'Ausgabe zur\u00FCckhalten',
        unholdExpense: 'Ausgabe freigeben',
        heldExpense: 'diese Ausgabe zur\u00FCckgehalten',
        unheldExpense: 'diese Ausgabe freigegeben',
        moveUnreportedExpense: 'Nicht gemeldete Ausgabe verschieben',
        addUnreportedExpense: 'Nicht gemeldete Ausgabe hinzuf\u00FCgen',
        createNewExpense: 'Neue Ausgabe erstellen',
        selectUnreportedExpense: 'W\u00E4hlen Sie mindestens eine Ausgabe aus, um sie dem Bericht hinzuzuf\u00FCgen.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Es sieht so aus, als h\u00E4tten Sie keine nicht gemeldeten Ausgaben. Versuchen Sie, unten eine zu erstellen.',
        addUnreportedExpenseConfirm: 'Zum Bericht hinzuf\u00FCgen',
        explainHold: 'Erkl\u00E4ren Sie, warum Sie diese Ausgabe zur\u00FCckhalten.',
        undoSubmit: 'Senden r\u00FCckg\u00E4ngig machen',
        retracted: 'zur\u00FCckgezogen',
        undoClose: 'Schlie\u00DFen r\u00FCckg\u00E4ngig machen',
        reopened: 'wieder ge\u00F6ffnet',
        reopenReport: 'Bericht erneut \u00F6ffnen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dieser Bericht wurde bereits nach ${connectionName} exportiert. \u00C4nderungen k\u00F6nnten zu Datenabweichungen f\u00FChren. Sind Sie sicher, dass Sie diesen Bericht erneut \u00F6ffnen m\u00F6chten?`,
        reason: 'Grund',
        holdReasonRequired: 'Ein Grund ist erforderlich, wenn gehalten wird.',
        expenseWasPutOnHold: 'Ausgabe wurde zur\u00FCckgestellt',
        expenseOnHold: 'Diese Ausgabe wurde zur\u00FCckgestellt. Bitte \u00FCberpr\u00FCfen Sie die Kommentare f\u00FCr die n\u00E4chsten Schritte.',
        expensesOnHold: 'Alle Ausgaben wurden zur\u00FCckgestellt. Bitte \u00FCberpr\u00FCfen Sie die Kommentare f\u00FCr die n\u00E4chsten Schritte.',
        expenseDuplicate: 'Diese Ausgabe hat \u00E4hnliche Details wie eine andere. Bitte \u00FCberpr\u00FCfen Sie die Duplikate, um fortzufahren.',
        someDuplicatesArePaid: 'Einige dieser Duplikate wurden bereits genehmigt oder bezahlt.',
        reviewDuplicates: 'Duplikate \u00FCberpr\u00FCfen',
        keepAll: 'Alle behalten',
        confirmApprove: 'Betrag der Genehmigung best\u00E4tigen',
        confirmApprovalAmount: 'Genehmigen Sie nur konforme Ausgaben oder genehmigen Sie den gesamten Bericht.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zur\u00FCckgestellt. M\u00F6chten Sie trotzdem genehmigen?',
            other: 'Diese Ausgaben sind zur\u00FCckgestellt. M\u00F6chten Sie trotzdem genehmigen?',
        }),
        confirmPay: 'Zahlungsbetrag best\u00E4tigen',
        confirmPayAmount: 'Zahlen Sie, was nicht zur\u00FCckgehalten wird, oder zahlen Sie den gesamten Bericht.',
        confirmPayAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zur\u00FCckgestellt. M\u00F6chten Sie trotzdem bezahlen?',
            other: 'Diese Ausgaben sind zur\u00FCckgestellt. M\u00F6chten Sie trotzdem bezahlen?',
        }),
        payOnly: 'Nur bezahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Diese Anfrage ist an',
        holdEducationalText: 'halten',
        whatIsHoldExplain: 'Das Halten ist wie das Dr\u00FCcken der "Pause"-Taste bei einer Ausgabe, um vor der Genehmigung oder Zahlung nach weiteren Details zu fragen.',
        holdIsLeftBehind: 'Zur\u00FCckgehaltene Ausgaben werden nach Genehmigung oder Zahlung in einen anderen Bericht verschoben.',
        unholdWhenReady: 'Genehmiger k\u00F6nnen Ausgaben freigeben, wenn sie zur Genehmigung oder Zahlung bereit sind.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: '\u00DCberpr\u00FCfen Sie diese Elemente, die sich beim Verschieben von Berichten in einen neuen Arbeitsbereich \u00E4ndern k\u00F6nnen.',
            reCategorize: '<strong>Kategorisieren Sie alle Ausgaben neu</strong>, um den Arbeitsbereichsregeln zu entsprechen.',
            workflows: 'Dieser Bericht kann nun einem anderen <strong>Genehmigungsworkflow</strong> unterliegen.',
        },
        changeWorkspace: 'Arbeitsbereich \u00E4ndern',
        set: 'set',
        changed: 'ge\u00E4ndert',
        removed: 'removed',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'W\u00E4hlen Sie einen Erstattungssatz pro Meile oder Kilometer f\u00FCr den Arbeitsbereich aus',
        unapprove: 'Nicht genehmigen',
        unapproveReport: 'Bericht nicht genehmigen',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dieser Bericht wurde bereits nach ${accountingIntegration} exportiert. Eine \u00C4nderung kann zu Datenabweichungen f\u00FChren. Sind Sie sicher, dass Sie diesen Bericht nicht genehmigen m\u00F6chten?`,
        reimbursable: 'erstattungsf\u00E4hig',
        nonReimbursable: 'nicht erstattungsf\u00E4hig',
        bookingPending: 'Diese Buchung ist ausstehend.',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, weil sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, da das Reisedatum verstrichen ist. F\u00FCgen Sie bei Bedarf eine Ausgabe f\u00FCr den Endbetrag hinzu.',
        attendees: 'Teilnehmer',
        whoIsYourAccountant: 'Wer ist Ihr Buchhalter?',
        paymentComplete: 'Zahlung abgeschlossen',
        time: 'Zeit',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        deleteSubrate: 'Subrate l\u00F6schen',
        deleteSubrateConfirmation: 'M\u00F6chten Sie diesen Untertarif wirklich l\u00F6schen?',
        quantity: 'Menge',
        subrateSelection: 'W\u00E4hlen Sie einen Teilbetrag aus und geben Sie eine Menge ein.',
        qty: 'Menge',
        firstDayText: () => ({
            one: `Erster Tag: 1 Stunde`,
            other: (count: number) => `Erster Tag: ${count.toFixed(2)} Stunden`,
        }),
        lastDayText: () => ({
            one: `Letzter Tag: 1 Stunde`,
            other: (count: number) => `Letzter Tag: ${count.toFixed(2)} Stunden`,
        }),
        tripLengthText: () => ({
            one: `Reise: 1 voller Tag`,
            other: (count: number) => `Reise: ${count} volle Tage`,
        }),
        dates: 'Daten',
        rates: 'Preise',
        submitsTo: ({name}: SubmitsToParams) => `Sendet an ${name}`,
        moveExpenses: () => ({one: 'Ausgabe verschieben', other: 'Ausgaben verschieben'}),
    },
    share: {
        shareToExpensify: 'Teilen mit Expensify',
        messageInputLabel: 'Nachricht',
    },
    notificationPreferencesPage: {
        header: 'Benachrichtigungseinstellungen',
        label: 'Benachrichtige mich \u00FCber neue Nachrichten',
        notificationPreferences: {
            always: 'Sofort',
            daily: 'T\u00E4glich',
            mute: 'Stumm schalten',
            hidden: 'Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Die Nummer wurde nicht validiert. Klicken Sie auf die Schaltfl\u00E4che, um den Best\u00E4tigungslink per SMS erneut zu senden.',
        emailHasNotBeenValidated: 'Die E-Mail wurde nicht validiert. Klicken Sie auf die Schaltfl\u00E4che, um den Validierungslink per SMS erneut zu senden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto hochladen',
        removePhoto: 'Foto entfernen',
        editImage: 'Foto bearbeiten',
        viewPhoto: 'Foto ansehen',
        imageUploadFailed: 'Bild-Upload fehlgeschlagen',
        deleteWorkspaceError: 'Entschuldigung, es gab ein unerwartetes Problem beim L\u00F6schen Ihres Arbeitsbereich-Avatars.',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Das ausgew\u00E4hlte Bild \u00FCberschreitet die maximale Upload-Gr\u00F6\u00DFe von ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Bitte laden Sie ein Bild hoch, das gr\u00F6\u00DFer als ${minHeightInPx}x${minWidthInPx} Pixel und kleiner als ${maxHeightInPx}x${maxWidthInPx} Pixel ist.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Das Profilbild muss eine der folgenden Typen sein: ${allowedExtensions.join(', ')}.`,
    },
    modal: {
        backdropLabel: 'Modal-Hintergrund',
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Bevorzugte Pronomen',
        selectYourPronouns: 'W\u00E4hlen Sie Ihre Pronomen aus',
        selfSelectYourPronoun: 'W\u00E4hlen Sie Ihr Pronomen selbst aus',
        emailAddress: 'E-Mail-Adresse',
        setMyTimezoneAutomatically: 'Meine Zeitzone automatisch einstellen',
        timezone: 'Zeitzone',
        invalidFileMessage: 'Ung\u00FCltige Datei. Bitte versuchen Sie ein anderes Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronisieren',
        profileAvatar: 'Profil-Avatar',
        publicSection: {
            title: '\u00D6ffentlich',
            subtitle: 'Diese Details werden in Ihrem \u00F6ffentlichen Profil angezeigt. Jeder kann sie sehen.',
        },
        privateSection: {
            title: 'Privat',
            subtitle: 'Diese Details werden f\u00FCr Reisen und Zahlungen verwendet. Sie werden niemals in Ihrem \u00F6ffentlichen Profil angezeigt.',
        },
    },
    securityPage: {
        title: 'Sicherheitsoptionen',
        subtitle: 'Aktivieren Sie die Zwei-Faktor-Authentifizierung, um Ihr Konto sicher zu halten.',
        goToSecurity: 'Zur\u00FCck zur Sicherheitsseite',
    },
    shareCodePage: {
        title: 'Ihr Code',
        subtitle: 'Laden Sie Mitglieder zu Expensify ein, indem Sie Ihren pers\u00F6nlichen QR-Code oder Empfehlungslink teilen.',
    },
    pronounsPage: {
        pronouns: 'Pronomen',
        isShownOnProfile: 'Deine Pronomen werden in deinem Profil angezeigt.',
        placeholderText: 'Suchen, um Optionen zu sehen',
    },
    contacts: {
        contactMethod: 'Kontaktmethode',
        contactMethods: 'Kontaktmethoden',
        featureRequiresValidate: 'Diese Funktion erfordert, dass Sie Ihr Konto verifizieren.',
        validateAccount: 'Best\u00E4tigen Sie Ihr Konto',
        helpTextBeforeEmail: 'F\u00FCgen Sie weitere M\u00F6glichkeiten hinzu, damit Menschen Sie finden k\u00F6nnen, und leiten Sie Belege weiter an',
        helpTextAfterEmail: 'von mehreren E-Mail-Adressen.',
        pleaseVerify: 'Bitte \u00FCberpr\u00FCfen Sie diese Kontaktmethode',
        getInTouch: 'Wann immer wir mit Ihnen in Kontakt treten m\u00FCssen, werden wir diese Kontaktmethode verwenden.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde. Er sollte innerhalb einer oder zwei Minuten ankommen.`,
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod:
            'Dies ist Ihre aktuelle Standardkontaktmethode. Bevor Sie sie l\u00F6schen k\u00F6nnen, m\u00FCssen Sie eine andere Kontaktmethode ausw\u00E4hlen und auf \u201EAls Standard festlegen\u201C klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'M\u00F6chten Sie diese Kontaktmethode wirklich entfernen? Diese Aktion kann nicht r\u00FCckg\u00E4ngig gemacht werden.',
        failedNewContact: 'Fehler beim Hinzuf\u00FCgen dieser Kontaktmethode.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Fehler beim Senden eines neuen magischen Codes. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
            validateSecondaryLogin: 'Falscher oder ung\u00FCltiger magischer Code. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Code an.',
            deleteContactMethod: 'L\u00F6schen der Kontaktmethode fehlgeschlagen. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            setDefaultContactMethod: 'Fehler beim Festlegen einer neuen Standardkontaktmethode. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            addContactMethod: 'Fehler beim Hinzuf\u00FCgen dieser Kontaktmethode. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            enteredMethodIsAlreadySubmitted: 'Diese Kontaktmethode existiert bereits',
            passwordRequired: 'Passwort erforderlich.',
            contactMethodRequired: 'Kontaktmethode ist erforderlich',
            invalidContactMethod: 'Ung\u00FCltige Kontaktmethode',
        },
        newContactMethod: 'Neue Kontaktmethode',
        goBackContactMethods: 'Zur\u00FCck zu den Kontaktmethoden',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Er / Ihn / Sein',
        heHimHisTheyThemTheirs: 'Er / Ihn / Sein / Sie / Ihnen / Ihr',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / Sie / Ihnen / Ihre',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Nenn mich bei meinem Namen',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Anzeigename',
        isShownOnProfile: 'Ihr Anzeigename wird in Ihrem Profil angezeigt.',
    },
    timezonePage: {
        timezone: 'Zeitzone',
        isShownOnProfile: 'Ihre Zeitzone wird in Ihrem Profil angezeigt.',
        getLocationAutomatically: 'Bestimmen Sie automatisch Ihren Standort',
    },
    updateRequiredView: {
        updateRequired: 'Aktualisierung erforderlich',
        pleaseInstall: 'Bitte aktualisieren Sie auf die neueste Version von New Expensify.',
        pleaseInstallExpensifyClassic: 'Bitte installiere die neueste Version von Expensify.',
        toGetLatestChanges: 'F\u00FCr Mobilger\u00E4te oder Desktop, laden Sie die neueste Version herunter und installieren Sie sie. F\u00FCr das Web, aktualisieren Sie Ihren Browser.',
        newAppNotAvailable: 'Die neue Expensify-App ist nicht mehr verf\u00FCgbar.',
    },
    initialSettingsPage: {
        about: '\u00DCber',
        aboutPage: {
            description:
                'Die neue Expensify-App wird von einer Gemeinschaft von Open-Source-Entwicklern aus der ganzen Welt entwickelt. Helfen Sie uns, die Zukunft von Expensify zu gestalten.',
            appDownloadLinks: 'App-Download-Links',
            viewKeyboardShortcuts: 'Tastenkombinationen anzeigen',
            viewTheCode: 'Code anzeigen',
            viewOpenJobs: 'Offene Stellen anzeigen',
            reportABug: 'Einen Fehler melden',
            troubleshoot: 'Fehlerbehebung',
        },
        appDownloadLinks: {
            android: {
                label: 'Android',
            },
            ios: {
                label: 'iOS',
            },
            desktop: {
                label: 'macOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: 'Cache leeren und neu starten',
            viewConsole: 'Debug-Konsole anzeigen',
            debugConsole: 'Debug-Konsole',
            description: 'Verwenden Sie die untenstehenden Tools, um das Expensify-Erlebnis zu beheben. Wenn Sie auf Probleme sto\u00DFen, bitte',
            submitBug: 'einen Fehler melden',
            confirmResetDescription: 'Alle nicht gesendeten Entwurfsnachrichten gehen verloren, aber der Rest Ihrer Daten ist sicher.',
            resetAndRefresh: 'Zur\u00FCcksetzen und aktualisieren',
            clientSideLogging: 'Client-seitiges Logging',
            noLogsToShare: 'Keine Protokolle zum Teilen',
            useProfiling: 'Profiling verwenden',
            profileTrace: 'Profilverlauf',
            releaseOptions: 'Freigabeoptionen',
            testingPreferences: 'Pr\u00E4ferenzen testen',
            useStagingServer: 'Staging-Server verwenden',
            forceOffline: 'Offline erzwingen',
            simulatePoorConnection: 'Schlechte Internetverbindung simulieren',
            simulateFailingNetworkRequests: 'Netzwerkanfragen simulieren, die fehlschlagen',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Ger\u00E4teanmeldedaten',
            invalidate: 'Ung\u00FCltig machen',
            destroy: 'Zerst\u00F6ren',
            maskExportOnyxStateData: 'Maskieren Sie sensible Mitgliedsdaten beim Exportieren des Onyx-Zustands',
            exportOnyxState: 'Onyx-Status exportieren',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Testabsturz',
            resetToOriginalState: 'Auf den urspr\u00FCnglichen Zustand zur\u00FCcksetzen',
            usingImportedState: 'Sie verwenden importierten Status. Dr\u00FCcken Sie hier, um ihn zu l\u00F6schen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ung\u00FCltige Datei',
            invalidFileDescription: 'Die Datei, die Sie importieren m\u00F6chten, ist ung\u00FCltig. Bitte versuchen Sie es erneut.',
            invalidateWithDelay: 'Mit Verz\u00F6gerung ung\u00FCltig machen',
        },
        debugConsole: {
            saveLog: 'Protokoll speichern',
            shareLog: 'Protokoll teilen',
            enterCommand: 'Befehl eingeben',
            execute: 'Ausf\u00FChren',
            noLogsAvailable: 'Keine Protokolle verf\u00FCgbar',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `Die Protokollgr\u00F6\u00DFe \u00FCberschreitet das Limit von ${size} MB. Bitte verwenden Sie "Protokoll speichern", um die Protokolldatei stattdessen herunterzuladen.`,
            logs: 'Protokolle',
            viewConsole: 'Konsole anzeigen',
        },
        security: 'Sicherheit',
        signOut: 'Abmelden',
        restoreStashed: 'Stelle gespeicherten Login wieder her',
        signOutConfirmationText: 'Sie verlieren alle Offline-\u00C4nderungen, wenn Sie sich abmelden.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Lesen Sie die',
            phrase2: 'Nutzungsbedingungen',
            phrase3: 'und',
            phrase4: 'Datenschutz',
        },
        help: 'Hilfe',
        accountSettings: 'Kontoeinstellungen',
        account: 'Konto',
        general: 'Allgemein',
    },
    closeAccountPage: {
        closeAccount: 'Konto schlie\u00DFen',
        reasonForLeavingPrompt: 'Wir w\u00FCrden es bedauern, Sie gehen zu sehen! W\u00FCrden Sie uns freundlicherweise mitteilen, warum, damit wir uns verbessern k\u00F6nnen?',
        enterMessageHere: 'Nachricht hier eingeben',
        closeAccountWarning: 'Das Schlie\u00DFen Ihres Kontos kann nicht r\u00FCckg\u00E4ngig gemacht werden.',
        closeAccountPermanentlyDeleteData: 'M\u00F6chten Sie Ihr Konto wirklich l\u00F6schen? Dadurch werden alle ausstehenden Ausgaben dauerhaft gel\u00F6scht.',
        enterDefaultContactToConfirm:
            'Bitte geben Sie Ihre Standardkontaktmethode ein, um zu best\u00E4tigen, dass Sie Ihr Konto schlie\u00DFen m\u00F6chten. Ihre Standardkontaktmethode ist:',
        enterDefaultContact: 'Geben Sie Ihre Standardkontaktmethode ein',
        defaultContact: 'Standardkontaktmethode:',
        enterYourDefaultContactMethod: 'Bitte geben Sie Ihre Standardkontaktmethode ein, um Ihr Konto zu schlie\u00DFen.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Konten zusammenf\u00FChren',
        accountDetails: {
            accountToMergeInto: 'Geben Sie das Konto ein, in das Sie zusammenf\u00FChren m\u00F6chten',
            notReversibleConsent: 'Ich verstehe, dass dies nicht umkehrbar ist.',
        },
        accountValidate: {
            confirmMerge: 'M\u00F6chten Sie die Konten wirklich zusammenf\u00FChren?',
            lossOfUnsubmittedData: `Das Zusammenf\u00FChren Ihrer Konten ist unwiderruflich und f\u00FChrt zum Verlust aller nicht eingereichten Ausgaben f\u00FCr`,
            enterMagicCode: `Um fortzufahren, bitte den magischen Code eingeben, der an  gesendet wurde.`,
            errors: {
                incorrectMagicCode: 'Falscher oder ung\u00FCltiger magischer Code. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es sp\u00E4ter noch einmal.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengef\u00FChrt!',
            successfullyMergedAllData: {
                beforeFirstEmail: `Sie haben erfolgreich alle Daten von zusammengef\u00FChrt.`,
                beforeSecondEmail: `in`,
                afterSecondEmail: `. Zuk\u00FCnftig k\u00F6nnen Sie entweder Login f\u00FCr dieses Konto verwenden.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran.',
            limitedSupport:
                'Wir unterst\u00FCtzen das Zusammenf\u00FChren von Konten in New Expensify noch nicht. Bitte f\u00FChren Sie diese Aktion stattdessen in Expensify Classic durch.',
            reachOutForHelp: {
                beforeLink: 'F\u00FChlen Sie sich frei, zu',
                linkText: 'Wenden Sie sich an Concierge',
                afterLink: 'wenn Sie Fragen haben!',
            },
            goToExpensifyClassic: 'Gehe zu Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Sie k\u00F6nnen nicht zusammenf\u00FChren',
            beforeDomain: 'weil es von  kontrolliert wird',
            afterDomain: 'Bitte',
            linkText: 'Wenden Sie sich an Concierge',
            afterLink: 'f\u00FCr Unterst\u00FCtzung.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Sie k\u00F6nnen nicht zusammenf\u00FChren',
            afterEmail: 'in andere Konten, da Ihr Domain-Administrator es als Ihren prim\u00E4ren Login festgelegt hat. Bitte f\u00FCgen Sie stattdessen andere Konten in dieses zusammen.',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Sie k\u00F6nnen die Konten nicht zusammenf\u00FChren, weil',
                beforeSecondEmail: 'hat die Zwei-Faktor-Authentifizierung (2FA) aktiviert. Bitte deaktivieren Sie 2FA f\u00FCr',
                afterSecondEmail: 'und versuche es erneut.',
            },
            learnMore: 'Erfahren Sie mehr \u00FCber das Zusammenf\u00FChren von Konten.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Sie k\u00F6nnen nicht zusammenf\u00FChren',
            afterEmail: 'weil es gesperrt ist. Bitte',
            linkText: 'wenden Sie sich an Concierge',
            afterLink: `f\u00FCr Unterst\u00FCtzung.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Sie k\u00F6nnen die Konten nicht zusammenf\u00FChren, weil',
                afterEmail: 'hat kein Expensify-Konto.',
            },
            addContactMethod: {
                beforeLink: 'Bitte',
                linkText: 'als Kontaktmethode hinzuf\u00FCgen',
                afterLink: 'stattdessen.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Sie k\u00F6nnen nicht zusammenf\u00FChren',
            afterEmail: 'in andere Konten. Bitte stattdessen andere Konten damit zusammenf\u00FChren.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Sie k\u00F6nnen nicht zusammenf\u00FChren',
            afterEmail: 'in andere Konten, da es der Rechnungsinhaber eines fakturierten Kontos ist. Bitte stattdessen andere Konten in dieses zusammenf\u00FChren.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Versuchen Sie es sp\u00E4ter noch einmal.',
            description: 'Es gab zu viele Versuche, Konten zusammenzuf\u00FChren. Bitte versuchen Sie es sp\u00E4ter erneut.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Sie k\u00F6nnen nicht in andere Konten zusammenf\u00FChren, da es nicht validiert ist. Bitte validieren Sie das Konto und versuchen Sie es erneut.',
        },
        mergeFailureSelfMerge: {
            description: 'Sie k\u00F6nnen ein Konto nicht mit sich selbst zusammenf\u00FChren.',
        },
        mergeFailureGenericHeading: 'Konten k\u00F6nnen nicht zusammengef\u00FChrt werden',
    },
    lockAccountPage: {
        lockAccount: 'Konto sperren',
        unlockAccount: 'Konto entsperren',
        compromisedDescription:
            'Wenn Sie vermuten, dass Ihr Expensify-Konto kompromittiert wurde, k\u00F6nnen Sie es sperren, um neue Expensify Card-Transaktionen zu verhindern und unerw\u00FCnschte Konten\u00E4nderungen zu blockieren.',
        domainAdminsDescriptionPartOne: 'F\u00FCr Domain-Administratoren,',
        domainAdminsDescriptionPartTwo: 'Diese Aktion stoppt alle Expensify Card-Aktivit\u00E4ten und Administratoraktionen.',
        domainAdminsDescriptionPartThree: '\u00FCber Ihre Domain(s).',
        warning: `Sobald Ihr Konto gesperrt ist, wird unser Team den Vorfall untersuchen und unbefugten Zugriff entfernen. Um den Zugang wiederzuerlangen, m\u00FCssen Sie mit Concierge zusammenarbeiten, um Ihr Konto zu sichern.`,
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: `Wir konnten Ihr Konto nicht sperren. Bitte chatten Sie mit Concierge, um dieses Problem zu l\u00F6sen.`,
        chatWithConcierge: 'Chatten Sie mit Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Ihr Konto ist gesperrt.',
        chatToConciergeToUnlock: 'Chatten Sie mit Concierge, um Sicherheitsbedenken zu kl\u00E4ren und Ihr Konto freizuschalten.',
        chatWithConcierge: 'Chatten Sie mit Concierge',
    },
    passwordPage: {
        changePassword: 'Passwort \u00E4ndern',
        changingYourPasswordPrompt: 'Das \u00C4ndern Ihres Passworts wird Ihr Passwort sowohl f\u00FCr Ihr Expensify.com- als auch f\u00FCr Ihr New Expensify-Konto aktualisieren.',
        currentPassword: 'Aktuelles Passwort',
        newPassword: 'Neues Passwort',
        newPasswordPrompt: 'Ihr neues Passwort muss sich von Ihrem alten Passwort unterscheiden und mindestens 8 Zeichen, 1 Gro\u00DFbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
    },
    twoFactorAuth: {
        headerTitle: 'Zwei-Faktor-Authentifizierung',
        twoFactorAuthEnabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        whatIsTwoFactorAuth:
            'Die Zwei-Faktor-Authentifizierung (2FA) hilft, Ihr Konto sicher zu halten. Beim Einloggen m\u00FCssen Sie einen Code eingeben, der von Ihrer bevorzugten Authentifizierungs-App generiert wird.',
        disableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung deaktivieren',
        explainProcessToRemove: 'Um die Zwei-Faktor-Authentifizierung (2FA) zu deaktivieren, geben Sie bitte einen g\u00FCltigen Code aus Ihrer Authentifizierungs-App ein.',
        disabled: 'Die Zwei-Faktor-Authentifizierung ist jetzt deaktiviert.',
        noAuthenticatorApp: 'Sie ben\u00F6tigen keine Authentifizierungs-App mehr, um sich bei Expensify anzumelden.',
        stepCodes: 'Wiederherstellungscodes',
        keepCodesSafe: 'Bewahren Sie diese Wiederherstellungscodes sicher auf!',
        codesLoseAccess:
            'Wenn Sie den Zugriff auf Ihre Authentifizierungs-App verlieren und diese Codes nicht haben, verlieren Sie den Zugriff auf Ihr Konto.\n\nHinweis: Das Einrichten der Zwei-Faktor-Authentifizierung wird Sie von allen anderen aktiven Sitzungen abmelden.',
        errorStepCodes: 'Bitte kopieren oder laden Sie die Codes herunter, bevor Sie fortfahren.',
        stepVerify: '\u00DCberpr\u00FCfen',
        scanCode: 'Scannen Sie den QR-Code mit Ihrem',
        authenticatorApp: 'Authentifikator-App',
        addKey: 'Oder f\u00FCgen Sie diesen geheimen Schl\u00FCssel zu Ihrer Authentifizierungs-App hinzu:',
        enterCode: 'Geben Sie dann den sechsstelligen Code ein, der von Ihrer Authentifizierungs-App generiert wurde.',
        stepSuccess: 'Fertiggestellt',
        enabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        congrats: 'Gl\u00FCckwunsch! Jetzt hast du diese zus\u00E4tzliche Sicherheit.',
        copy: 'Kopieren',
        disable: 'Deaktivieren',
        enableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung aktivieren',
        pleaseEnableTwoFactorAuth: 'Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredDescription: 'Aus Sicherheitsgr\u00FCnden erfordert Xero eine Zwei-Faktor-Authentifizierung, um die Integration zu verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Zwei-Faktor-Authentifizierung erforderlich',
        twoFactorAuthIsRequiredForAdminsTitle: 'Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredForAdminsDescription:
            'Ihre Xero-Buchhaltungsverbindung erfordert die Verwendung der Zwei-Faktor-Authentifizierung. Um Expensify weiterhin zu nutzen, aktivieren Sie diese bitte.',
        twoFactorAuthCannotDisable: '2FA kann nicht deaktiviert werden.',
        twoFactorAuthRequired: 'Zwei-Faktor-Authentifizierung (2FA) ist f\u00FCr Ihre Xero-Verbindung erforderlich und kann nicht deaktiviert werden.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
            incorrectRecoveryCode: 'Falscher Wiederherstellungscode. Bitte versuchen Sie es erneut.',
        },
        useRecoveryCode: 'Verwenden Sie den Wiederherstellungscode',
        recoveryCode: 'Wiederherstellungscode',
        use2fa: 'Verwenden Sie den Zwei-Faktor-Authentifizierungscode',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Passwort aktualisiert!',
        allSet: 'Alles erledigt. Bewahren Sie Ihr neues Passwort sicher auf.',
    },
    privateNotes: {
        title: 'Private Notizen',
        personalNoteMessage: 'Notizen zu diesem Chat hier festhalten. Du bist die einzige Person, die diese Notizen hinzuf\u00FCgen, bearbeiten oder einsehen kann.',
        sharedNoteMessage: 'Notizen zu diesem Chat hier festhalten. Expensify-Mitarbeiter und andere Mitglieder der team.expensify.com-Domain k\u00F6nnen diese Notizen einsehen.',
        composerLabel: 'Notizen',
        myNote: 'Meine Notiz',
        error: {
            genericFailureMessage: 'Private Notizen konnten nicht gespeichert werden',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Bitte geben Sie einen g\u00FCltigen Sicherheitscode ein',
        },
        securityCode: 'Sicherheitscode',
        changeBillingCurrency: 'Abrechnungsw\u00E4hrung \u00E4ndern',
        changePaymentCurrency: 'Zahlungsw\u00E4hrung \u00E4ndern',
        paymentCurrency: 'Zahlungsw\u00E4hrung',
        paymentCurrencyDescription: 'W\u00E4hlen Sie eine standardisierte W\u00E4hrung aus, in die alle pers\u00F6nlichen Ausgaben umgerechnet werden sollen.',
        note: 'Hinweis: Das \u00C4ndern Ihrer Zahlungw\u00E4hrung kann beeinflussen, wie viel Sie f\u00FCr Expensify zahlen. Beziehen Sie sich auf unsere',
        noteLink: 'Preisseite',
        noteDetails: 'f\u00FCr vollst\u00E4ndige Details.',
    },
    addDebitCardPage: {
        addADebitCard: 'F\u00FCgen Sie eine Debitkarte hinzu',
        nameOnCard: 'Name auf der Karte',
        debitCardNumber: 'Debitkartennummer',
        expiration: 'Ablaufdatum',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Debitkarte wurde erfolgreich hinzugef\u00FCgt',
        expensifyPassword: 'Expensify-Passwort',
        error: {
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte geben Sie eine g\u00FCltige Postleitzahl ein.',
            debitCardNumber: 'Bitte geben Sie eine g\u00FCltige Debitkartennummer ein',
            expirationDate: 'Bitte w\u00E4hlen Sie ein g\u00FCltiges Ablaufdatum aus.',
            securityCode: 'Bitte geben Sie einen g\u00FCltigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine g\u00FCltige Rechnungsadresse ein, die kein Postfach ist.',
            addressState: 'Bitte w\u00E4hlen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzuf\u00FCgen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein.',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Zahlungskarte hinzuf\u00FCgen',
        nameOnCard: 'Name auf der Karte',
        paymentCardNumber: 'Kartennummer',
        expiration: 'Ablaufdatum',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Zahlungskarte wurde erfolgreich hinzugef\u00FCgt',
        expensifyPassword: 'Expensify-Passwort',
        error: {
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte geben Sie eine g\u00FCltige Postleitzahl ein.',
            paymentCardNumber: 'Bitte geben Sie eine g\u00FCltige Kartennummer ein.',
            expirationDate: 'Bitte w\u00E4hlen Sie ein g\u00FCltiges Ablaufdatum aus.',
            securityCode: 'Bitte geben Sie einen g\u00FCltigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine g\u00FCltige Rechnungsadresse ein, die kein Postfach ist.',
            addressState: 'Bitte w\u00E4hlen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzuf\u00FCgen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein.',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Zahlungsmethoden',
        setDefaultConfirmation: 'Standardzahlungsmethode festlegen',
        setDefaultSuccess: 'Standardzahlungsmethode festgelegt!',
        deleteAccount: 'Konto l\u00F6schen',
        deleteConfirmation: 'M\u00F6chten Sie dieses Konto wirklich l\u00F6schen?',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als Ihre Standardzahlungsmethode ist ein Fehler aufgetreten.',
            invalidBankAccount: 'Dieses Bankkonto ist vor\u00FCbergehend gesperrt.',
            notOwnerOfFund: 'Beim Festlegen dieser Karte als Ihre Standardzahlungsmethode ist ein Fehler aufgetreten.',
            setDefaultFailure: 'Etwas ist schiefgelaufen. Bitte chatten Sie mit Concierge f\u00FCr weitere Unterst\u00FCtzung.',
        },
        addBankAccountFailure: 'Ein unerwarteter Fehler ist aufgetreten, w\u00E4hrend versucht wurde, Ihr Bankkonto hinzuzuf\u00FCgen. Bitte versuchen Sie es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'F\u00FCgen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Schneller zur\u00FCckbezahlt werden',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Empfangen Sie Geld in Ihrer lokalen W\u00E4hrung',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Senden und empfangen Sie Geld mit Freunden. Nur US-Bankkonten.',
        enableWallet: 'Wallet aktivieren',
        addBankAccountToSendAndReceive: 'Lassen Sie sich f\u00FCr Ausgaben, die Sie an einen Arbeitsbereich einreichen, zur\u00FCckzahlen.',
        addBankAccount: 'Bankkonto hinzuf\u00FCgen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Dies sind Karten, die von einem Workspace-Administrator zugewiesen wurden, um die Unternehmensausgaben zu verwalten.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Wir \u00FCberpr\u00FCfen Ihre Informationen. Bitte schauen Sie in ein paar Minuten wieder vorbei!',
        walletActivationFailed: 'Leider kann Ihr Wallet derzeit nicht aktiviert werden. Bitte chatten Sie mit Concierge f\u00FCr weitere Unterst\u00FCtzung.',
        addYourBankAccount: 'F\u00FCgen Sie Ihr Bankkonto hinzu',
        addBankAccountBody: 'Lassen Sie uns Ihr Bankkonto mit Expensify verbinden, damit es einfacher denn je ist, Zahlungen direkt in der App zu senden und zu empfangen.',
        chooseYourBankAccount: 'W\u00E4hlen Sie Ihr Bankkonto aus',
        chooseAccountBody: 'Stellen Sie sicher, dass Sie die richtige ausw\u00E4hlen.',
        confirmYourBankAccount: 'Best\u00E4tigen Sie Ihr Bankkonto',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Intelligente Grenze',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie k\u00F6nnen bis zu ${formattedLimit} mit dieser Karte ausgeben, und das Limit wird zur\u00FCckgesetzt, sobald Ihre eingereichten Ausgaben genehmigt werden.`,
        },
        fixedLimit: {
            name: 'Fester Grenzwert',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Sie k\u00F6nnen bis zu ${formattedLimit} mit dieser Karte ausgeben, danach wird sie deaktiviert.`,
        },
        monthlyLimit: {
            name: 'Monatliches Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie k\u00F6nnen bis zu ${formattedLimit} pro Monat mit dieser Karte ausgeben. Das Limit wird am 1. Tag jedes Kalendermonats zur\u00FCckgesetzt.`,
        },
        virtualCardNumber: 'Virtuelle Kartennummer',
        travelCardCvv: 'Kreditkarten-CVV',
        physicalCardNumber: 'Physische Kartennummer',
        getPhysicalCard: 'Physische Karte erhalten',
        reportFraud: 'Virtuelle Kartenbetrug melden',
        reportTravelFraud: 'Reise-Kartenbetrug melden',
        reviewTransaction: 'Transaktion \u00FCberpr\u00FCfen',
        suspiciousBannerTitle: 'Verd\u00E4chtige Transaktion',
        suspiciousBannerDescription: 'Wir haben verd\u00E4chtige Transaktionen auf Ihrer Karte festgestellt. Tippen Sie unten, um sie zu \u00FCberpr\u00FCfen.',
        cardLocked: 'Ihre Karte ist vor\u00FCbergehend gesperrt, w\u00E4hrend unser Team das Konto Ihres Unternehmens \u00FCberpr\u00FCft.',
        cardDetails: {
            cardNumber: 'Virtuelle Kartennummer',
            expiration: 'Ablauf',
            cvv: 'CVV',
            address: 'Adresse',
            revealDetails: 'Details anzeigen',
            revealCvv: 'CVV anzeigen',
            copyCardNumber: 'Kartennummer kopieren',
            updateAddress: 'Adresse aktualisieren',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Zu ${platform} Wallet hinzugef\u00FCgt`,
        cardDetailsLoadingFailure: 'Beim Laden der Kartendetails ist ein Fehler aufgetreten. Bitte \u00FCberpr\u00FCfe deine Internetverbindung und versuche es erneut.',
        validateCardTitle: 'Lassen Sie uns sicherstellen, dass Sie es sind.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde, um Ihre Kartendetails anzuzeigen. Er sollte in ein bis zwei Minuten ankommen.`,
    },
    workflowsPage: {
        workflowTitle: 'Ausgaben',
        workflowDescription: 'Konfigurieren Sie einen Workflow ab dem Moment, in dem Ausgaben anfallen, einschlie\u00DFlich Genehmigung und Zahlung.',
        delaySubmissionTitle: '\u00DCbermittlungen verz\u00F6gern',
        delaySubmissionDescription:
            'W\u00E4hlen Sie einen benutzerdefinierten Zeitplan f\u00FCr die Einreichung von Ausgaben oder lassen Sie dies f\u00FCr Echtzeitaktualisierungen der Ausgaben aus.',
        submissionFrequency: 'Einreichungsh\u00E4ufigkeit',
        submissionFrequencyDateOfMonth: 'Datum des Monats',
        addApprovalsTitle: 'Genehmigungen hinzuf\u00FCgen',
        addApprovalButton: 'Genehmigungsworkflow hinzuf\u00FCgen',
        addApprovalTip: 'Dieser Standard-Workflow gilt f\u00FCr alle Mitglieder, es sei denn, es existiert ein spezifischerer Workflow.',
        approver: 'Genehmiger',
        connectBankAccount: 'Bankkonto verbinden',
        addApprovalsDescription: 'Zus\u00E4tzliche Genehmigung erforderlich, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen vornehmen oder verfolgen',
        makeOrTrackPaymentsDescription: 'F\u00FCgen Sie einen autorisierten Zahler f\u00FCr Zahlungen in Expensify hinzu oder verfolgen Sie Zahlungen, die anderswo get\u00E4tigt wurden.',
        editor: {
            submissionFrequency: 'W\u00E4hlen Sie, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
        },
        frequencyDescription: 'W\u00E4hlen Sie, wie oft Ausgaben automatisch eingereicht werden sollen, oder stellen Sie es auf manuell um.',
        frequencies: {
            instant: 'Sofort',
            weekly: 'W\u00F6chentlich',
            monthly: 'Monatlich',
            twiceAMonth: 'Zweimal im Monat',
            byTrip: 'Nach Reise',
            manually: 'Manuell',
            daily: 'T\u00E4glich',
            lastDayOfMonth: 'Letzter Tag des Monats',
            lastBusinessDayOfMonth: 'Letzter Gesch\u00E4ftstag des Monats',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Erste',
                '2': 'Zweite',
                '3': 'Dritte',
                '4': 'Vierter',
                '5': 'F\u00FCnfte',
                '6': 'Sechste',
                '7': 'Siebte',
                '8': 'Achtel',
                '9': 'Neunte',
                '10': 'Zehntens',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied geh\u00F6rt bereits zu einem anderen Genehmigungs-Workflow. Alle Aktualisierungen hier werden sich auch dort widerspiegeln.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> genehmigt bereits Berichte an <strong>${name2}</strong>. Bitte w\u00E4hlen Sie einen anderen Genehmiger, um einen zirkul\u00E4ren Workflow zu vermeiden.`,
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Arbeitsbereichsmitglieder geh\u00F6ren bereits zu einem bestehenden Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmigenden geh\u00F6ren zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'Die versp\u00E4tete Einreichung konnte nicht ge\u00E4ndert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        autoReportingFrequencyErrorMessage: 'Die Einreichungsh\u00E4ufigkeit konnte nicht ge\u00E4ndert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Frequenz konnte nicht ge\u00E4ndert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Best\u00E4tigen',
        header: 'F\u00FCgen Sie weitere Genehmiger hinzu und best\u00E4tigen Sie.',
        additionalApprover: 'Zus\u00E4tzlicher Genehmiger',
        submitButton: 'Workflow hinzuf\u00FCgen',
    },
    workflowsEditApprovalsPage: {
        title: 'Genehmigungsworkflow bearbeiten',
        deleteTitle: 'Genehmigungs-Workflow l\u00F6schen',
        deletePrompt: 'M\u00F6chten Sie diesen Genehmigungs-Workflow wirklich l\u00F6schen? Alle Mitglieder werden anschlie\u00DFend dem Standard-Workflow folgen.',
    },
    workflowsExpensesFromPage: {
        title: 'Ausgaben von',
        header: 'Wenn die folgenden Mitglieder Ausgaben einreichen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Der Genehmiger konnte nicht ge\u00E4ndert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        header: 'An dieses Mitglied zur Genehmigung senden:',
    },
    workflowsPayerPage: {
        title: 'Autorisierter Zahler',
        genericErrorMessage: 'Der autorisierte Zahler konnte nicht ge\u00E4ndert werden. Bitte versuchen Sie es erneut.',
        admins: 'Admins',
        payer: 'Zahler',
        paymentAccount: 'Zahlungskonto',
    },
    reportFraudPage: {
        title: 'Virtuelle Kartenbetrug melden',
        description:
            'Wenn Ihre virtuellen Kartendaten gestohlen oder kompromittiert wurden, werden wir Ihre bestehende Karte dauerhaft deaktivieren und Ihnen eine neue virtuelle Karte und Nummer zur Verf\u00FCgung stellen.',
        deactivateCard: 'Karte deaktivieren',
        reportVirtualCardFraud: 'Virtuelle Kartenbetrug melden',
    },
    reportFraudConfirmationPage: {
        title: 'Kartenbetrug gemeldet',
        description: 'Wir haben Ihre bestehende Karte dauerhaft deaktiviert. Wenn Sie Ihre Kartendetails erneut aufrufen, wird Ihnen eine neue virtuelle Karte zur Verf\u00FCgung stehen.',
        buttonText: 'Verstanden, danke!',
    },
    activateCardPage: {
        activateCard: 'Karte aktivieren',
        pleaseEnterLastFour: 'Bitte geben Sie die letzten vier Ziffern Ihrer Karte ein.',
        activatePhysicalCard: 'Physische Karte aktivieren',
        error: {
            thatDidNotMatch: 'Das stimmt nicht mit den letzten 4 Ziffern auf Ihrer Karte \u00FCberein. Bitte versuchen Sie es erneut.',
            throttled:
                'Sie haben die letzten 4 Ziffern Ihrer Expensify Card zu oft falsch eingegeben. Wenn Sie sicher sind, dass die Zahlen korrekt sind, wenden Sie sich bitte an Concierge, um das Problem zu l\u00F6sen. Andernfalls versuchen Sie es sp\u00E4ter erneut.',
        },
    },
    getPhysicalCard: {
        header: 'Physische Karte erhalten',
        nameMessage: 'Geben Sie Ihren Vor- und Nachnamen ein, da dieser auf Ihrer Karte angezeigt wird.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Gesetzlicher Nachname',
        phoneMessage: 'Geben Sie Ihre Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Geben Sie Ihre Versandadresse ein.',
        streetAddress: 'Stra\u00DFenadresse',
        city: 'Stadt',
        state: 'Zustand',
        zipPostcode: 'Postleitzahl',
        country: 'Land',
        confirmMessage: 'Bitte best\u00E4tigen Sie Ihre unten stehenden Angaben.',
        estimatedDeliveryMessage: 'Ihre physische Karte wird in 2-3 Werktagen ankommen.',
        next: 'N\u00E4chste',
        getPhysicalCard: 'Physische Karte erhalten',
        shipCard: 'Karte versenden',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Sofort (Debitkarte)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% Geb\u00FChr (${minAmount} Minimum)`,
        ach: '1-3 Werktage (Bankkonto)',
        achSummary: 'Keine Geb\u00FChr',
        whichAccount: 'Welches Konto?',
        fee: 'Geb\u00FChr',
        transferSuccess: '\u00DCberweisung erfolgreich!',
        transferDetailBankAccount: 'Ihr Geld sollte in den n\u00E4chsten 1-3 Werktagen ankommen.',
        transferDetailDebitCard: 'Ihr Geld sollte sofort ankommen.',
        failedTransfer: 'Ihr Guthaben ist nicht vollst\u00E4ndig ausgeglichen. Bitte \u00FCberweisen Sie auf ein Bankkonto.',
        notHereSubTitle: 'Bitte \u00FCberweisen Sie Ihr Guthaben von der Wallet-Seite.',
        goToWallet: 'Zur Brieftasche gehen',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Konto ausw\u00E4hlen',
    },
    paymentMethodList: {
        addPaymentMethod: 'Zahlungsmethode hinzuf\u00FCgen',
        addNewDebitCard: 'Neue Debitkarte hinzuf\u00FCgen',
        addNewBankAccount: 'Neues Bankkonto hinzuf\u00FCgen',
        accountLastFour: 'Endet mit',
        cardLastFour: 'Karte endet mit',
        addFirstPaymentMethod: 'F\u00FCgen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        defaultPaymentMethod: 'Standardm\u00E4\u00DFig',
    },
    preferencesPage: {
        appSection: {
            title: 'App-Einstellungen',
        },
        testSection: {
            title: 'Pr\u00E4ferenzen testen',
            subtitle: 'Einstellungen zum Debuggen und Testen der App auf der Staging-Umgebung.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Erhalten Sie relevante Funktionsupdates und Expensify-Nachrichten',
        muteAllSounds: 'Alle T\u00F6ne von Expensify stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Priorit\u00E4tsmodus',
        explainerText:
            'W\u00E4hlen Sie, ob Sie sich nur auf ungelesene und angeheftete Chats konzentrieren m\u00F6chten oder ob Sie alles anzeigen m\u00F6chten, wobei die neuesten und angehefteten Chats oben stehen.',
        priorityModes: {
            default: {
                label: 'Neueste',
                description: 'Alle Chats nach dem neuesten sortieren anzeigen',
            },
            gsd: {
                label: '#fokus',
                description: 'Nur ungelesene alphabetisch sortiert anzeigen',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF wird generiert',
        waitForPDF: 'Bitte warten Sie, w\u00E4hrend wir das PDF erstellen.',
        errorPDF: 'Beim Versuch, Ihr PDF zu erstellen, ist ein Fehler aufgetreten.',
        generatedPDF: 'Ihr Bericht als PDF wurde erstellt!',
    },
    reportDescriptionPage: {
        roomDescription: 'Zimmerbeschreibung',
        roomDescriptionOptional: 'Zimmerbeschreibung (optional)',
        explainerText: 'Legen Sie eine benutzerdefinierte Beschreibung f\u00FCr den Raum fest.',
    },
    groupChat: {
        lastMemberTitle: 'Achtung!',
        lastMemberWarning:
            'Da Sie die letzte Person hier sind, wird das Verlassen diesen Chat f\u00FCr alle Mitglieder unzug\u00E4nglich machen. Sind Sie sicher, dass Sie verlassen m\u00F6chten?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Gruppenchat von ${displayName}`,
    },
    languagePage: {
        language: 'Sprache',
        languages: {
            en: {
                label: 'Englisch',
            },
            es: {
                label: 'Spanisch',
            },
        },
    },
    themePage: {
        theme: 'Thema',
        themes: {
            dark: {
                label: 'Dunkel',
            },
            light: {
                label: 'Licht',
            },
            system: {
                label: 'Ger\u00E4teeinstellungen verwenden',
            },
        },
        chooseThemeBelowOrSync: 'W\u00E4hlen Sie ein Thema unten aus oder synchronisieren Sie es mit den Einstellungen Ihres Ger\u00E4ts.',
    },
    termsOfUse: {
        phrase1: 'Mit dem Einloggen stimmen Sie den',
        phrase2: 'Nutzungsbedingungen',
        phrase3: 'und',
        phrase4: 'Datenschutz',
        phrase5: `Geld\u00FCbermittlung wird bereitgestellt von ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) gem\u00E4\u00DF seiner`,
        phrase6: 'Lizenzen',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen magischen Code erhalten?',
        enterAuthenticatorCode: 'Bitte geben Sie Ihren Authentifizierungscode ein',
        enterRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        requestNewCode: 'Fordern Sie einen neuen Code an in',
        requestNewCodeAfterErrorOccurred: 'Einen neuen Code anfordern',
        error: {
            pleaseFillMagicCode: 'Bitte geben Sie Ihren magischen Code ein',
            incorrectMagicCode: 'Falscher oder ung\u00FCltiger magischer Code. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Bitte f\u00FCllen Sie alle Felder aus.',
        pleaseFillPassword: 'Bitte geben Sie Ihr Passwort ein',
        pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Code ein',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein, um fortzufahren',
        forgot: 'Vergessen?',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        error: {
            incorrectPassword: 'Falsches Passwort. Bitte versuchen Sie es erneut.',
            incorrectLoginOrPassword: 'Falscher Benutzername oder falsches Passwort. Bitte versuchen Sie es erneut.',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
            twoFactorAuthenticationEnabled:
                'Sie haben die Zwei-Faktor-Authentifizierung (2FA) f\u00FCr dieses Konto aktiviert. Bitte melden Sie sich mit Ihrer E-Mail-Adresse oder Telefonnummer an.',
            invalidLoginOrPassword: 'Ung\u00FCltiger Login oder Passwort. Bitte versuchen Sie es erneut oder setzen Sie Ihr Passwort zur\u00FCck.',
            unableToResetPassword:
                'Wir konnten Ihr Passwort nicht \u00E4ndern. Dies liegt wahrscheinlich an einem abgelaufenen Passwort-Zur\u00FCcksetzungslink in einer alten E-Mail zum Zur\u00FCcksetzen des Passworts. Wir haben Ihnen einen neuen Link per E-Mail geschickt, damit Sie es erneut versuchen k\u00F6nnen. \u00DCberpr\u00FCfen Sie Ihren Posteingang und Ihren Spam-Ordner; es sollte in wenigen Minuten ankommen.',
            noAccess: 'Sie haben keinen Zugriff auf diese Anwendung. Bitte f\u00FCgen Sie Ihren GitHub-Benutzernamen f\u00FCr den Zugriff hinzu.',
            accountLocked: 'Ihr Konto wurde nach zu vielen erfolglosen Versuchen gesperrt. Bitte versuchen Sie es in 1 Stunde erneut.',
            fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es sp\u00E4ter noch einmal.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon oder E-Mail',
        error: {
            invalidFormatEmailLogin: 'Die eingegebene E-Mail ist ung\u00FCltig. Bitte korrigieren Sie das Format und versuchen Sie es erneut.',
        },
        cannotGetAccountDetails: 'Konnte Kontodetails nicht abrufen. Bitte versuchen Sie, sich erneut anzumelden.',
        loginForm: 'Anmeldeformular',
        notYou: ({user}: NotYouParams) => `Nicht ${user}?`,
    },
    onboarding: {
        welcome: 'Willkommen!',
        welcomeSignOffTitleManageTeam: 'Sobald Sie die oben genannten Aufgaben abgeschlossen haben, k\u00F6nnen wir weitere Funktionen wie Genehmigungs-Workflows und Regeln erkunden!',
        welcomeSignOffTitle: 'Es ist gro\u00DFartig, Sie kennenzulernen!',
        explanationModal: {
            title: 'Willkommen bei Expensify',
            description:
                'Eine App, um Ihre gesch\u00E4ftlichen und pers\u00F6nlichen Ausgaben mit der Geschwindigkeit des Chats zu verwalten. Probieren Sie es aus und lassen Sie uns wissen, was Sie denken. Es kommt noch viel mehr!',
            secondaryDescription: 'Um zu Expensify Classic zur\u00FCckzukehren, tippen Sie einfach auf Ihr Profilbild > Gehe zu Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Willkommen bei Expensify',
            description:
                'Eine App, um alle Ihre gesch\u00E4ftlichen und pers\u00F6nlichen Ausgaben in einem Chat zu verwalten. Entwickelt f\u00FCr Ihr Unternehmen, Ihr Team und Ihre Freunde.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie hei\u00DFt du?',
        peopleYouMayKnow: 'Personen, die Sie kennen k\u00F6nnten, sind bereits hier! Best\u00E4tigen Sie Ihre E-Mail, um sich ihnen anzuschlie\u00DFen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Jemand von ${domain} hat bereits einen Arbeitsbereich erstellt. Bitte geben Sie den magischen Code ein, der an ${email} gesendet wurde.`,
        joinAWorkspace: 'Einem Arbeitsbereich beitreten',
        listOfWorkspaces:
            'Hier ist die Liste der Arbeitsbereiche, denen Sie beitreten k\u00F6nnen. Keine Sorge, Sie k\u00F6nnen ihnen jederzeit sp\u00E4ter beitreten, wenn Sie m\u00F6chten.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} Mitglied${employeeCount > 1 ? 's' : ''} \u2022 ${policyOwner}`,
        whereYouWork: 'Wo arbeitest du?',
        errorSelection: 'W\u00E4hlen Sie eine Option, um fortzufahren',
        purpose: {
            title: 'Was m\u00F6chten Sie heute tun?',
            errorContinue: 'Bitte dr\u00FCcken Sie auf Weiter, um die Einrichtung abzuschlie\u00DFen.',
            errorBackButton: 'Bitte beantworten Sie die Einrichtungsfragen, um die App zu verwenden.',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Von meinem Arbeitgeber zur\u00FCckbezahlt werden',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Verwalte die Ausgaben meines Teams',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Ausgaben verfolgen und budgetieren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatten und Ausgaben mit Freunden teilen',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Etwas anderes',
        },
        employees: {
            title: 'Wie viele Mitarbeiter haben Sie?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 Mitarbeiter',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 Mitarbeiter',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 Mitarbeiter',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 Mitarbeiter',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Mehr als 1.000 Mitarbeiter',
        },
        accounting: {
            title: 'Verwenden Sie eine Buchhaltungssoftware?',
            none: 'Keine',
        },
        error: {
            requiredFirstName: 'Bitte geben Sie Ihren Vornamen ein, um fortzufahren.',
        },
        workEmail: {
            title: 'Wie lautet Ihre Arbeits-E-Mail?',
            subtitle: 'Expensify funktioniert am besten, wenn Sie Ihre Arbeits-E-Mail verbinden.',
            explanationModal: {
                descriptionOne: 'Weiterleiten an receipts@expensify.com zum Scannen',
                descriptionTwo: 'Treten Sie Ihren Kollegen bei, die bereits Expensify verwenden.',
                descriptionThree: 'Genie\u00DFen Sie ein individuell angepasstes Erlebnis',
            },
            addWorkEmail: 'Arbeits-E-Mail hinzuf\u00FCgen',
        },
        workEmailValidation: {
            title: 'Best\u00E4tigen Sie Ihre Arbeits-E-Mail-Adresse',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) =>
                `Bitte geben Sie den magischen Code ein, der an ${workEmail} gesendet wurde. Er sollte in ein oder zwei Minuten ankommen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Bitte geben Sie eine g\u00FCltige Arbeits-E-Mail von einer privaten Domain ein, z.B. mitch@company.com',
            offline: 'Wir konnten Ihre Arbeits-E-Mail nicht hinzuf\u00FCgen, da Sie offline zu sein scheinen.',
        },
        mergeBlockScreen: {
            title: 'Konnte Arbeits-E-Mail nicht hinzuf\u00FCgen',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Wir konnten ${workEmail} nicht hinzuf\u00FCgen. Bitte versuchen Sie es sp\u00E4ter in den Einstellungen erneut oder chatten Sie mit Concierge f\u00FCr Unterst\u00FCtzung.`,
        },
        workspace: {
            title: 'Bleiben Sie mit einem Arbeitsbereich organisiert.',
            subtitle: 'Entfesseln Sie leistungsstarke Tools, um Ihr Ausgabenmanagement zu vereinfachen, alles an einem Ort. Mit einem Arbeitsbereich k\u00F6nnen Sie:',
            explanationModal: {
                descriptionOne: 'Belege verfolgen und organisieren',
                descriptionTwo: 'Kategorisieren und taggen Sie Ausgaben',
                descriptionThree: 'Berichte erstellen und teilen',
            },
            price: 'Teste es 30 Tage kostenlos, dann upgrade f\u00FCr nur <strong>5 $/Monat</strong>.',
            createWorkspace: 'Arbeitsbereich erstellen',
        },
        confirmWorkspace: {
            title: 'Arbeitsbereich best\u00E4tigen',
            subtitle:
                'Erstellen Sie einen Arbeitsbereich, um Belege zu verfolgen, Ausgaben zu erstatten, Reisen zu verwalten, Berichte zu erstellen und mehr \u2013 alles in der Geschwindigkeit des Chats.',
        },
        inviteMembers: {
            title: 'Mitglieder einladen',
            subtitle: 'Verwalten und teilen Sie Ihre Ausgaben mit einem Buchhalter oder starten Sie eine Reisegruppe mit Freunden.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nicht mehr anzeigen',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Der Name darf die W\u00F6rter Expensify oder Concierge nicht enthalten.',
            hasInvalidCharacter: 'Der Name darf kein Komma oder Semikolon enthalten.',
            requiredFirstName: 'Vorname darf nicht leer sein',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        enterDateOfBirth: 'Was ist Ihr Geburtsdatum?',
        enterAddress: 'Wie lautet Ihre Adresse?',
        enterPhoneNumber: 'Wie lautet Ihre Telefonnummer?',
        personalDetails: 'Pers\u00F6nliche Angaben',
        privateDataMessage: 'Diese Details werden f\u00FCr Reisen und Zahlungen verwendet. Sie werden niemals in Ihrem \u00F6ffentlichen Profil angezeigt.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Gesetzlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Datum sollte vor dem ${dateString} liegen`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Das Datum sollte nach ${dateString} liegen.`,
            hasInvalidCharacter: 'Name darf nur lateinische Zeichen enthalten',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Ung\u00FCltiges Postleitzahlenformat${zipFormat ? `Akzeptables Format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Bitte stellen Sie sicher, dass die Telefonnummer g\u00FCltig ist (z.B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link wurde erneut gesendet',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Ich habe einen magischen Anmeldelink an ${login} gesendet. Bitte \u00FCberpr\u00FCfe dein ${loginType}, um dich anzumelden.`,
        resendLink: 'Link erneut senden',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Um ${secondaryLogin} zu validieren, senden Sie bitte den magischen Code aus den Kontoeinstellungen von ${primaryLogin} erneut.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Wenn Sie keinen Zugriff mehr auf ${primaryLogin} haben, bitte verkn\u00FCpfen Sie Ihre Konten.`,
        unlink: 'Trennen',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Sekund\u00E4res Login erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Unser E-Mail-Anbieter hat E-Mails an ${login} vor\u00FCbergehend aufgrund von Zustellungsproblemen gesperrt. Um Ihren Login zu entsperren, befolgen Sie bitte diese Schritte:`,
        confirmThat: ({login}: ConfirmThatParams) => `Best\u00E4tigen Sie, dass ${login} korrekt geschrieben ist und es sich um eine echte, zustellbare E-Mail-Adresse handelt.`,
        emailAliases: 'E-Mail-Aliase wie "expenses@domain.com" m\u00FCssen Zugriff auf ihren eigenen E-Mail-Posteingang haben, damit sie ein g\u00FCltiger Expensify-Login sind.',
        ensureYourEmailClient: 'Stellen Sie sicher, dass Ihr E-Mail-Client E-Mails von expensify.com zul\u00E4sst.',
        youCanFindDirections: 'Sie finden Anweisungen, wie Sie diesen Schritt abschlie\u00DFen k\u00F6nnen.',
        helpConfigure: 'aber m\u00F6glicherweise ben\u00F6tigen Sie die Hilfe Ihrer IT-Abteilung, um Ihre E-Mail-Einstellungen zu konfigurieren.',
        onceTheAbove: 'Sobald die oben genannten Schritte abgeschlossen sind, wenden Sie sich bitte an',
        toUnblock: 'um Ihren Login zu entsperren.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Wir konnten SMS-Nachrichten nicht an ${login} zustellen, daher haben wir es vor\u00FCbergehend gesperrt. Bitte versuchen Sie, Ihre Nummer zu validieren:`,
        validationSuccess: 'Ihre Nummer wurde best\u00E4tigt! Klicken Sie unten, um einen neuen magischen Anmeldecode zu senden.',
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
                return 'Bitte warten Sie einen Moment, bevor Sie es erneut versuchen.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'Tag' : 'Tage'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'Stunde' : 'Stunden'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'Minute' : 'Minuten'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Bitte warten! Sie m\u00FCssen ${timeText} warten, bevor Sie erneut versuchen, Ihre Nummer zu validieren.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Beitreten',
    },
    detailsPage: {
        localTime: 'Ortszeit',
    },
    newChatPage: {
        startGroup: 'Gruppe starten',
        addToGroup: 'Zur Gruppe hinzuf\u00FCgen',
    },
    yearPickerPage: {
        year: 'Jahr',
        selectYear: 'Bitte w\u00E4hlen Sie ein Jahr aus',
    },
    focusModeUpdateModal: {
        title: 'Willkommen im #focus-Modus!',
        prompt: 'Behalten Sie den \u00DCberblick, indem Sie nur ungelesene Chats oder Chats sehen, die Ihre Aufmerksamkeit erfordern. Keine Sorge, Sie k\u00F6nnen dies jederzeit \u00E4ndern in',
        settings: 'Einstellungen',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Der gesuchte Chat kann nicht gefunden werden.',
        getMeOutOfHere: 'Hol mich hier raus',
        iouReportNotFound: 'Die Zahlungsdetails, die Sie suchen, k\u00F6nnen nicht gefunden werden.',
        notHere: 'Hmm... es ist nicht hier.',
        pageNotFound: 'Hoppla, diese Seite kann nicht gefunden werden.',
        noAccess:
            'Dieser Chat oder diese Ausgabe wurde m\u00F6glicherweise gel\u00F6scht oder Sie haben keinen Zugriff darauf.\n\nBei Fragen wenden Sie sich bitte an concierge@expensify.com',
        goBackHome: 'Zur\u00FCck zur Startseite',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oops... ${isBreakLine ? '\n' : ''}Etwas ist schiefgelaufen`,
        subtitle: 'Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es sp\u00E4ter erneut.',
    },
    setPasswordPage: {
        enterPassword: 'Geben Sie ein Passwort ein',
        setPassword: 'Passwort festlegen',
        newPasswordPrompt: 'Ihr Passwort muss mindestens 8 Zeichen, 1 Gro\u00DFbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
        passwordFormTitle: 'Willkommen zur\u00FCck bei der New Expensify! Bitte legen Sie Ihr Passwort fest.',
        passwordNotSet: 'Wir konnten Ihr neues Passwort nicht festlegen. Wir haben Ihnen einen neuen Passwort-Link gesendet, um es erneut zu versuchen.',
        setPasswordLinkInvalid: 'Dieser Link zum Festlegen des Passworts ist ung\u00FCltig oder abgelaufen. Ein neuer wartet in Ihrem E-Mail-Posteingang auf Sie!',
        validateAccount: 'Konto verifizieren',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'F\u00FCge ein Emoji hinzu, um deinen Kollegen und Freunden auf einfache Weise mitzuteilen, was los ist. Du kannst optional auch eine Nachricht hinzuf\u00FCgen!',
        today: 'Heute',
        clearStatus: 'Status l\u00F6schen',
        save: 'Speichern',
        message: 'Nachricht',
        timePeriods: {
            never: 'Niemals',
            thirtyMinutes: '30 Minuten',
            oneHour: '1 Stunde',
            afterToday: 'Heute',
            afterWeek: 'Eine Woche',
            custom: 'Custom',
        },
        untilTomorrow: 'Bis morgen',
        untilTime: ({time}: UntilTimeParams) => `Bis ${time}`,
        date: 'Datum',
        time: 'Zeit',
        clearAfter: 'Nach dem L\u00F6schen',
        whenClearStatus: 'Wann sollten wir Ihren Status l\u00F6schen?',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Schritt ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Bankdaten',
        confirmBankInfo: 'Bankinformationen best\u00E4tigen',
        manuallyAdd: 'F\u00FCgen Sie Ihr Bankkonto manuell hinzu',
        letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles richtig aussieht.',
        accountEnding: 'Konto endet mit',
        thisBankAccount: 'Dieses Bankkonto wird f\u00FCr Gesch\u00E4ftszahlungen in Ihrem Arbeitsbereich verwendet.',
        accountNumber: 'Kontonummer',
        routingNumber: 'Bankleitzahl',
        chooseAnAccountBelow: 'W\u00E4hlen Sie ein Konto unten aus',
        addBankAccount: 'Bankkonto hinzuf\u00FCgen',
        chooseAnAccount: 'W\u00E4hlen Sie ein Konto aus',
        connectOnlineWithPlaid: 'Melden Sie sich bei Ihrer Bank an',
        connectManually: 'Manuell verbinden',
        desktopConnection:
            'Hinweis: Um eine Verbindung mit Chase, Wells Fargo, Capital One oder der Bank of America herzustellen, klicken Sie bitte hier, um diesen Vorgang in einem Browser abzuschlie\u00DFen.',
        yourDataIsSecure: 'Ihre Daten sind sicher',
        toGetStarted:
            'F\u00FCgen Sie ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify-Karten auszustellen, Rechnungszahlungen zu sammeln und Rechnungen von einem Ort aus zu bezahlen.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitern eine einfachere M\u00F6glichkeit, Unternehmensausgaben zu bezahlen - und erstattet zu bekommen.',
        checkHelpLine: 'Ihre Bankleitzahl und Kontonummer finden Sie auf einem Scheck f\u00FCr das Konto.',
        hasPhoneLoginError: {
            phrase1: 'Um ein Bankkonto zu verbinden, bitte',
            link: 'F\u00FCgen Sie eine E-Mail als Ihren prim\u00E4ren Login hinzu',
            phrase2: 'und versuchen Sie es erneut. Sie k\u00F6nnen Ihre Telefonnummer als sekund\u00E4ren Login hinzuf\u00FCgen.',
        },
        hasBeenThrottledError: 'Beim Hinzuf\u00FCgen Ihres Bankkontos ist ein Fehler aufgetreten. Bitte warten Sie ein paar Minuten und versuchen Sie es erneut.',
        hasCurrencyError: {
            phrase1: 'Hoppla! Es scheint, dass die W\u00E4hrung Ihres Arbeitsbereichs auf eine andere W\u00E4hrung als USD eingestellt ist. Um fortzufahren, gehen Sie bitte zu',
            link: 'Ihre Arbeitsbereichseinstellungen',
            phrase2: 'um es auf USD zu setzen und es erneut zu versuchen.',
        },
        error: {
            youNeedToSelectAnOption: 'Bitte w\u00E4hlen Sie eine Option, um fortzufahren.',
            noBankAccountAvailable: 'Entschuldigung, es ist kein Bankkonto verf\u00FCgbar.',
            noBankAccountSelected: 'Bitte w\u00E4hlen Sie ein Konto aus',
            taxID: 'Bitte geben Sie eine g\u00FCltige Steuernummer ein.',
            website: 'Bitte geben Sie eine g\u00FCltige Website ein.',
            zipCode: `Bitte geben Sie eine g\u00FCltige Postleitzahl im Format ein: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Bitte geben Sie eine g\u00FCltige Telefonnummer ein.',
            email: 'Bitte geben Sie eine g\u00FCltige E-Mail-Adresse ein',
            companyName: 'Bitte geben Sie einen g\u00FCltigen Firmennamen ein',
            addressCity: 'Bitte geben Sie eine g\u00FCltige Stadt ein',
            addressStreet: 'Bitte geben Sie eine g\u00FCltige Stra\u00DFenadresse ein',
            addressState: 'Bitte w\u00E4hlen Sie einen g\u00FCltigen Bundesstaat aus.',
            incorporationDateFuture: 'Das Gr\u00FCndungsdatum darf nicht in der Zukunft liegen.',
            incorporationState: 'Bitte w\u00E4hlen Sie einen g\u00FCltigen Bundesstaat aus.',
            industryCode: 'Bitte geben Sie einen g\u00FCltigen Branchenklassifizierungscode mit sechs Ziffern ein.',
            restrictedBusiness: 'Bitte best\u00E4tigen Sie, dass das Unternehmen nicht auf der Liste der eingeschr\u00E4nkten Unternehmen steht.',
            routingNumber: 'Bitte geben Sie eine g\u00FCltige Bankleitzahl ein.',
            accountNumber: 'Bitte geben Sie eine g\u00FCltige Kontonummer ein.',
            routingAndAccountNumberCannotBeSame: 'Routing- und Kontonummern d\u00FCrfen nicht \u00FCbereinstimmen',
            companyType: 'Bitte w\u00E4hlen Sie einen g\u00FCltigen Unternehmenstyp aus.',
            tooManyAttempts:
                'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option f\u00FCr 24 Stunden deaktiviert. Bitte versuchen Sie es sp\u00E4ter erneut oder geben Sie die Details stattdessen manuell ein.',
            address: 'Bitte geben Sie eine g\u00FCltige Adresse ein.',
            dob: 'Bitte w\u00E4hlen Sie ein g\u00FCltiges Geburtsdatum aus.',
            age: 'Muss \u00FCber 18 Jahre alt sein',
            ssnLast4: 'Bitte geben Sie die g\u00FCltigen letzten 4 Ziffern der SSN ein.',
            firstName: 'Bitte geben Sie einen g\u00FCltigen Vornamen ein.',
            lastName: 'Bitte geben Sie einen g\u00FCltigen Nachnamen ein.',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte f\u00FCgen Sie ein Standard-Einzahlungskonto oder eine Debitkarte hinzu.',
            validationAmounts: 'Die eingegebenen Validierungsbetr\u00E4ge sind falsch. Bitte \u00FCberpr\u00FCfen Sie Ihren Kontoauszug und versuchen Sie es erneut.',
            fullName: 'Bitte geben Sie einen g\u00FCltigen vollst\u00E4ndigen Namen ein',
            ownershipPercentage: 'Bitte geben Sie eine g\u00FCltige Prozentzahl ein.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich Ihr Bankkonto?',
        accountDetailsStepHeader: 'Was sind Ihre Kontodaten?',
        accountTypeStepHeader: 'Welche Art von Konto ist das?',
        bankInformationStepHeader: 'Was sind Ihre Bankdaten?',
        accountHolderInformationStepHeader: 'Was sind die Kontoinhaberdetails?',
        howDoWeProtectYourData: 'Wie sch\u00FCtzen wir Ihre Daten?',
        currencyHeader: 'Was ist die W\u00E4hrung Ihres Bankkontos?',
        confirmationStepHeader: '\u00DCberpr\u00FCfen Sie Ihre Informationen.',
        confirmationStepSubHeader: '\u00DCberpr\u00FCfen Sie die unten stehenden Details und aktivieren Sie das Kontrollk\u00E4stchen f\u00FCr die Bedingungen, um zu best\u00E4tigen.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify-Passwort eingeben',
        alreadyAdded: 'Dieses Konto wurde bereits hinzugef\u00FCgt.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Pers\u00F6nliches Bankkonto hinzugef\u00FCgt!',
        successMessage: 'Gl\u00FCckwunsch, Ihr Bankkonto ist eingerichtet und bereit, R\u00FCckerstattungen zu empfangen.',
    },
    attachmentView: {
        unknownFilename: 'Unknown filename',
        passwordRequired: 'Bitte geben Sie ein Passwort ein',
        passwordIncorrect: 'Falsches Passwort. Bitte versuchen Sie es erneut.',
        failedToLoadPDF: 'Fehler beim Laden der PDF-Datei',
        pdfPasswordForm: {
            title: 'Passwortgesch\u00FCtztes PDF',
            infoText: 'Diese PDF ist passwortgesch\u00FCtzt.',
            beforeLinkText: 'Bitte',
            linkText: 'Geben Sie das Passwort ein',
            afterLinkText: 'um es anzusehen.',
            formLabel: 'PDF anzeigen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
    },
    messages: {
        errorMessageInvalidPhone: `Bitte geben Sie eine g\u00FCltige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn Sie sich au\u00DFerhalb der USA befinden, geben Sie bitte Ihre L\u00E4ndervorwahl an (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ung\u00FCltige E-Mail-Adresse',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Mitglied von ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Indem Sie mit der Anfrage zur Aktivierung Ihres Expensify Wallet fortfahren, best\u00E4tigen Sie, dass Sie gelesen, verstanden und akzeptiert haben',
        facialScan: "Onfido's Richtlinien und Freigabe f\u00FCr Gesichtserkennung",
        tryAgain: 'Versuche es erneut',
        verifyIdentity: 'Identit\u00E4t verifizieren',
        letsVerifyIdentity: 'Lassen Sie uns Ihre Identit\u00E4t \u00FCberpr\u00FCfen',
        butFirst: `Aber zuerst das langweilige Zeug. Lies dir im n\u00E4chsten Schritt das Juristendeutsch durch und klicke auf \u201EAkzeptieren\u201C, wenn du bereit bist.`,
        genericError: 'Ein Fehler ist bei der Verarbeitung dieses Schritts aufgetreten. Bitte versuchen Sie es erneut.',
        cameraPermissionsNotGranted: 'Kamerazugriff aktivieren',
        cameraRequestMessage:
            'Wir ben\u00F6tigen Zugriff auf Ihre Kamera, um die Bankkontoverifizierung abzuschlie\u00DFen. Bitte aktivieren Sie dies \u00FCber Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage:
            'Wir ben\u00F6tigen Zugriff auf Ihr Mikrofon, um die Bankkontoverifizierung abzuschlie\u00DFen. Bitte aktivieren Sie dies \u00FCber Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte laden Sie ein Originalbild Ihres Ausweises hoch, anstatt einen Screenshot oder ein gescanntes Bild.',
        documentNeedsBetterQuality:
            'Ihr Ausweis scheint besch\u00E4digt zu sein oder es fehlen Sicherheitsmerkmale. Bitte laden Sie ein Originalbild eines unbesch\u00E4digten Ausweises hoch, der vollst\u00E4ndig sichtbar ist.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualit\u00E4t Ihres Ausweises. Bitte laden Sie ein neues Bild hoch, auf dem Ihr gesamter Ausweis deutlich zu sehen ist.',
        selfieIssue: 'Es gibt ein Problem mit Ihrem Selfie/Video. Bitte laden Sie ein Live-Selfie/Video hoch.',
        selfieNotMatching: 'Ihr Selfie/Video stimmt nicht mit Ihrem Ausweis \u00FCberein. Bitte laden Sie ein neues Selfie/Video hoch, auf dem Ihr Gesicht klar zu sehen ist.',
        selfieNotLive: 'Ihr Selfie/Video scheint kein Live-Foto/Video zu sein. Bitte laden Sie ein Live-Selfie/Video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Zus\u00E4tzliche Details',
        helpText: 'Wir m\u00FCssen die folgenden Informationen best\u00E4tigen, bevor Sie Geld von Ihrem Wallet senden und empfangen k\u00F6nnen.',
        helpTextIdologyQuestions: 'Wir m\u00FCssen Ihnen noch ein paar weitere Fragen stellen, um Ihre Identit\u00E4t abschlie\u00DFend zu verifizieren.',
        helpLink: 'Erfahren Sie mehr dar\u00FCber, warum wir dies ben\u00F6tigen.',
        legalFirstNameLabel: 'Gesetzlicher Vorname',
        legalMiddleNameLabel: 'Zweiter Vorname (rechtlich)',
        legalLastNameLabel: 'Gesetzlicher Nachname',
        selectAnswer: 'Bitte w\u00E4hlen Sie eine Antwort, um fortzufahren.',
        ssnFull9Error: 'Bitte geben Sie eine g\u00FCltige neunstellige SSN ein.',
        needSSNFull9: 'Wir haben Probleme, Ihre SSN zu verifizieren. Bitte geben Sie die vollst\u00E4ndigen neun Ziffern Ihrer SSN ein.',
        weCouldNotVerify: 'Wir konnten nicht verifizieren',
        pleaseFixIt: 'Bitte korrigieren Sie diese Informationen, bevor Sie fortfahren.',
        failedKYCTextBefore: 'Wir konnten Ihre Identit\u00E4t nicht verifizieren. Bitte versuchen Sie es sp\u00E4ter erneut oder wenden Sie sich an',
        failedKYCTextAfter: 'wenn Sie Fragen haben.',
    },
    termsStep: {
        headerTitle: 'Bedingungen und Geb\u00FChren',
        headerTitleRefactor: 'Geb\u00FChren und Bedingungen',
        haveReadAndAgree: 'Ich habe gelesen und stimme zu, zu erhalten',
        electronicDisclosures: 'elektronische Offenlegungen',
        agreeToThe: 'Ich stimme dem zu',
        walletAgreement: 'Wallet-Vereinbarung',
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Geb\u00FChr',
        inactivity: 'Inaktivit\u00E4t',
        noOverdraftOrCredit: 'Keine \u00DCberziehungs-/Kreditfunktion.',
        electronicFundsWithdrawal: 'Elektronische Mittelabhebung',
        standard: 'Standard',
        reviewTheFees: 'Schauen Sie sich einige Geb\u00FChren an.',
        checkTheBoxes: 'Bitte markieren Sie die untenstehenden K\u00E4stchen.',
        agreeToTerms: 'Stimmen Sie den Bedingungen zu und Sie sind startklar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Das Expensify Wallet wird von ${walletProgram} ausgegeben.`,
            perPurchase: 'Pro Kauf',
            atmWithdrawal: 'Geldautomat-Abhebung',
            cashReload: 'Bargeldaufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'au\u00DFerhalb des Netzwerks',
            atmBalanceInquiry: 'Geldautomaten-Saldoabfrage',
            inOrOutOfNetwork: '(in-network oder out-of-network)',
            customerService: 'Kundendienst',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir berechnen eine andere Art von Geb\u00FChr. Diese ist:',
            fdicInsurance: 'Ihre Gelder sind f\u00FCr eine FDIC-Versicherung berechtigt.',
            generalInfo: 'F\u00FCr allgemeine Informationen \u00FCber Prepaid-Konten besuchen Sie',
            conditionsDetails: 'F\u00FCr Details und Bedingungen zu allen Geb\u00FChren und Dienstleistungen besuchen Sie',
            conditionsPhone: 'oder rufen Sie +1 833-400-0904 an.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Eine Liste aller Expensify Wallet-Geb\u00FChren',
            typeOfFeeHeader: 'Alle Geb\u00FChren',
            feeAmountHeader: 'Betrag',
            moreDetailsHeader: 'Einzelheiten',
            openingAccountTitle: 'Ein Konto er\u00F6ffnen',
            openingAccountDetails: 'Es gibt keine Geb\u00FChr f\u00FCr die Er\u00F6ffnung eines Kontos.',
            monthlyFeeDetails: 'Es gibt keine monatliche Geb\u00FChr.',
            customerServiceTitle: 'Kundendienst',
            customerServiceDetails: 'Es gibt keine Kundendienstgeb\u00FChren.',
            inactivityDetails: 'Es gibt keine Inaktivit\u00E4tsgeb\u00FChr.',
            sendingFundsTitle: 'Senden von Geldern an einen anderen Kontoinhaber',
            sendingFundsDetails: 'Es gibt keine Geb\u00FChr, um Geld an einen anderen Kontoinhaber zu senden, wenn Sie Ihr Guthaben, Ihr Bankkonto oder Ihre Debitkarte verwenden.',
            electronicFundsStandardDetails:
                "There's no fee to transfer funds from your Expensify Wallet " +
                'to your bank account using the standard option. This transfer usually completes within 1-3 business' +
                ' days.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                "There's a fee to transfer funds from your Expensify Wallet to " +
                'your linked debit card using the instant transfer option. This transfer usually completes within ' +
                `several minutes. The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                'Your funds are eligible for FDIC insurance. Your funds will be held at or ' +
                `transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution. Once there, your funds are insured up ` +
                `to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements ` +
                `are met and your card is registered. See`,
            fdicInsuranceBancorp2: 'f\u00FCr Details.',
            contactExpensifyPayments: `Kontaktieren Sie ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} telefonisch unter +1 833-400-0904 oder per E-Mail an`,
            contactExpensifyPayments2: 'oder anmelden bei',
            generalInformation: 'F\u00FCr allgemeine Informationen \u00FCber Prepaid-Konten besuchen Sie',
            generalInformation2: 'Wenn Sie eine Beschwerde \u00FCber ein Prepaid-Konto haben, rufen Sie das Consumer Financial Protection Bureau unter 1-855-411-2372 an oder besuchen Sie',
            printerFriendlyView: 'Druckerfreundliche Version anzeigen',
            automated: 'Automatisiert',
            liveAgent: 'Live-Agent',
            instant: 'Sofort',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Zahlungen aktivieren',
        activatedTitle: 'Wallet aktiviert!',
        activatedMessage: 'Herzlichen Gl\u00FCckwunsch, Ihr Wallet ist eingerichtet und bereit, Zahlungen zu t\u00E4tigen.',
        checkBackLaterTitle: 'Nur eine Minute...',
        checkBackLaterMessage: 'Wir \u00FCberpr\u00FCfen Ihre Informationen noch. Bitte versuchen Sie es sp\u00E4ter erneut.',
        continueToPayment: 'Weiter zur Zahlung',
        continueToTransfer: 'Weiter \u00FCbertragen',
    },
    companyStep: {
        headerTitle: 'Unternehmensinformationen',
        subtitle: 'Fast fertig! Aus Sicherheitsgr\u00FCnden m\u00FCssen wir einige Informationen best\u00E4tigen:',
        legalBusinessName: 'Rechtlicher Unternehmensname',
        companyWebsite: 'Unternehmenswebsite',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        companyType: 'Unternehmensart',
        incorporationDate: 'Gr\u00FCndungsdatum',
        incorporationState: 'Gr\u00FCndungsstaat',
        industryClassificationCode: 'Industrieklassifikationscode',
        confirmCompanyIsNot: 'Ich best\u00E4tige, dass dieses Unternehmen nicht auf der Liste steht.',
        listOfRestrictedBusinesses: 'Liste der eingeschr\u00E4nkten Unternehmen',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-tt)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperative',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Andere',
        },
        industryClassification: 'Unter welcher Branche ist das Unternehmen klassifiziert?',
        industryClassificationCodePlaceholder: 'Suche nach dem Branchenschl\u00FCssel',
    },
    requestorStep: {
        headerTitle: 'Pers\u00F6nliche Informationen',
        learnMore: 'Erfahren Sie mehr',
        isMyDataSafe: 'Sind meine Daten sicher?',
    },
    personalInfoStep: {
        personalInfo: 'Pers\u00F6nliche Informationen',
        enterYourLegalFirstAndLast: 'Wie lautet Ihr gesetzlicher Name?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Gesetzlicher Nachname',
        legalName: 'Rechtlicher Name',
        enterYourDateOfBirth: 'Was ist Ihr Geburtsdatum?',
        enterTheLast4: 'Was sind die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir f\u00FChren keine pers\u00F6nlichen Bonit\u00E4tspr\u00FCfungen durch!',
        last4SSN: 'Letzte 4 der SSN',
        enterYourAddress: 'Wie lautet Ihre Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Durch das Hinzuf\u00FCgen dieses Bankkontos best\u00E4tigen Sie, dass Sie gelesen, verstanden und akzeptiert haben',
        whatsYourLegalName: 'Wie lautet Ihr rechtlicher Name?',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        whatsYourAddress: 'Wie lautet Ihre Adresse?',
        whatsYourSSN: 'Was sind die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier gibt es keine pers\u00F6nlichen Bonit\u00E4tspr\u00FCfungen!',
        whatsYourPhoneNumber: 'Wie lautet Ihre Telefonnummer?',
        weNeedThisToVerify: 'Wir ben\u00F6tigen dies, um Ihre Brieftasche zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Unternehmensinformationen',
        enterTheNameOfYourBusiness: 'Wie hei\u00DFt Ihre Firma?',
        businessName: 'Rechtlicher Firmenname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steuernummer Ihres Unternehmens?',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Unternehmenswebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Was f\u00FCr eine Art von Unternehmen ist es?',
        companyType: 'Unternehmensart',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperative',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Andere',
        },
        selectYourCompanyIncorporationDate: 'Was ist das Gr\u00FCndungsdatum Ihres Unternehmens?',
        incorporationDate: 'Gr\u00FCndungsdatum',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-tt)',
        incorporationState: 'Gr\u00FCndungsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem Bundesstaat wurde Ihr Unternehmen gegr\u00FCndet?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste der eingeschr\u00E4nkten Unternehmen',
        confirmCompanyIsNot: 'Ich best\u00E4tige, dass dieses Unternehmen nicht auf der Liste steht.',
        businessInfoTitle: 'Gesch\u00E4ftsinformationen',
        legalBusinessName: 'Rechtlicher Unternehmensname',
        whatsTheBusinessName: 'Wie lautet der Firmenname?',
        whatsTheBusinessAddress: 'Wie lautet die Gesch\u00E4ftsadresse?',
        whatsTheBusinessContactInformation: 'Was sind die Gesch\u00E4ftskontaktdaten?',
        whatsTheBusinessRegistrationNumber: 'Wie lautet die Handelsregisternummer?',
        whatsTheBusinessTaxIDEIN: 'Wie lautet die Gesch\u00E4ftssteuer-ID/EIN/USt-IdNr./GST-Registrierungsnummer?',
        whatsThisNumber: 'Was ist diese Nummer?',
        whereWasTheBusinessIncorporated: 'Wo wurde das Unternehmen gegr\u00FCndet?',
        whatTypeOfBusinessIsIt: 'Welche Art von Gesch\u00E4ft ist es?',
        whatsTheBusinessAnnualPayment: 'Wie hoch ist das j\u00E4hrliche Zahlungsvolumen des Unternehmens?',
        whatsYourExpectedAverageReimbursements: 'Wie hoch ist Ihr erwarteter durchschnittlicher Erstattungsbetrag?',
        registrationNumber: 'Registrierungsnummer',
        taxIDEIN: 'Steuer-ID/EIN-Nummer',
        businessAddress: 'Gesch\u00E4ftsadresse',
        businessType: 'Gesch\u00E4ftsart',
        incorporation: 'Incorporation',
        incorporationCountry: 'Gr\u00FCndungsland',
        incorporationTypeName: 'Gr\u00FCndungsart',
        businessCategory: 'Gesch\u00E4ftskategorie',
        annualPaymentVolume: 'J\u00E4hrliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `J\u00E4hrliches Zahlungsvolumen in ${currencyCode}`,
        averageReimbursementAmount: 'Durchschnittlicher Erstattungsbetrag',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Durchschnittlicher Erstattungsbetrag in ${currencyCode}`,
        selectIncorporationType: 'W\u00E4hlen Sie den Gr\u00FCndungstyp aus',
        selectBusinessCategory: 'Gesch\u00E4ftskategorie ausw\u00E4hlen',
        selectAnnualPaymentVolume: 'W\u00E4hlen Sie das j\u00E4hrliche Zahlungsvolumen aus',
        selectIncorporationCountry: 'Inkorporationsland ausw\u00E4hlen',
        selectIncorporationState: 'W\u00E4hlen Sie den Gr\u00FCndungsstaat aus',
        selectAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag ausw\u00E4hlen',
        findIncorporationType: 'Finden Sie den Gr\u00FCndungstyp',
        findBusinessCategory: 'Gesch\u00E4ftskategorie finden',
        findAnnualPaymentVolume: 'J\u00E4hrliches Zahlungsvolumen finden',
        findIncorporationState: 'Gr\u00FCndungsstaat finden',
        findAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag finden',
        error: {
            registrationNumber: 'Bitte geben Sie eine g\u00FCltige Registrierungsnummer an.',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Besitzen Sie 25 % oder mehr von',
        doAnyIndividualOwn25percent: 'Besitzen Einzelpersonen 25 % oder mehr von',
        areThereMoreIndividualsWhoOwn25percent: 'Gibt es mehr Personen, die 25 % oder mehr von besitzen?',
        regulationRequiresUsToVerifyTheIdentity: 'Vorschriften erfordern, dass wir die Identit\u00E4t jeder Person \u00FCberpr\u00FCfen, die mehr als 25% des Unternehmens besitzt.',
        companyOwner: 'Gesch\u00E4ftsinhaber',
        enterLegalFirstAndLastName: 'Wie lautet der gesetzliche Name des Eigent\u00FCmers?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Gesetzlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Was ist das Geburtsdatum des Eigent\u00FCmers?',
        enterTheLast4: 'Was sind die letzten 4 Ziffern der Sozialversicherungsnummer des Eigent\u00FCmers?',
        last4SSN: 'Letzte 4 der SSN',
        dontWorry: 'Keine Sorge, wir f\u00FChren keine pers\u00F6nlichen Bonit\u00E4tspr\u00FCfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des Eigent\u00FCmers?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Durch das Hinzuf\u00FCgen dieses Bankkontos best\u00E4tigen Sie, dass Sie gelesen, verstanden und akzeptiert haben',
        owners: 'Eigent\u00FCmer',
    },
    ownershipInfoStep: {
        ownerInfo: 'Besitzerinfo',
        businessOwner: 'Gesch\u00E4ftsinhaber',
        signerInfo: 'Unterzeichnerinformationen',
        doYouOwn: ({companyName}: CompanyNameParams) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Besitzt eine Einzelperson 25 % oder mehr von ${companyName}?`,
        regulationsRequire: 'Vorschriften erfordern, dass wir die Identit\u00E4t jeder Person \u00FCberpr\u00FCfen, die mehr als 25% des Unternehmens besitzt.',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Gesetzlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der gesetzliche Name des Eigent\u00FCmers?',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name?',
        whatPercentage: 'Welcher Prozentsatz des Unternehmens geh\u00F6rt dem Eigent\u00FCmer?',
        whatsYoursPercentage: 'Welchen Prozentsatz des Unternehmens besitzen Sie?',
        ownership: 'Eigentum',
        whatsTheOwnersDOB: 'Was ist das Geburtsdatum des Eigent\u00FCmers?',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des Eigent\u00FCmers?',
        whatsYourAddress: 'Wie lautet Ihre Adresse?',
        whatAreTheLast: 'Was sind die letzten 4 Ziffern der Sozialversicherungsnummer des Eigent\u00FCmers?',
        whatsYourLast: 'Was sind die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir f\u00FChren keine pers\u00F6nlichen Bonit\u00E4tspr\u00FCfungen durch!',
        last4: 'Letzte 4 der SSN',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: ({companyName}: CompanyNameParams) => `Gibt es andere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        owners: 'Eigent\u00FCmer',
        addCertified: 'F\u00FCgen Sie ein zertifiziertes Organigramm hinzu, das die wirtschaftlichen Eigent\u00FCmer zeigt.',
        regulationRequiresChart:
            'Die Vorschriften erfordern, dass wir eine beglaubigte Kopie des Eigentumsdiagramms sammeln, das jede Person oder Einheit zeigt, die 25% oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Diagramm zur Eigent\u00FCmerstruktur hochladen',
        noteEntity: 'Hinweis: Das Eigentumsdiagramm der Entit\u00E4t muss von Ihrem Buchhalter, Rechtsberater oder notariell beglaubigt unterschrieben werden.',
        certified: 'Zertifiziertes Eigentumsdiagramm der Einheit',
        selectCountry: 'Land ausw\u00E4hlen',
        findCountry: 'Land finden',
        address: 'Adresse',
        chooseFile: 'Datei ausw\u00E4hlen',
        uploadDocuments: 'Zus\u00E4tzliche Dokumentation hochladen',
        pleaseUpload:
            'Bitte laden Sie zus\u00E4tzliche Unterlagen hoch, um uns bei der \u00DCberpr\u00FCfung Ihrer Identit\u00E4t als direkter oder indirekter Eigent\u00FCmer von 25 % oder mehr der Gesch\u00E4ftseinheit zu unterst\u00FCtzen.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die Gesamtdateigr\u00F6\u00DFe f\u00FCr jeden Abschnitt darf 5 MB nicht \u00FCberschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription:
            'Bitte stellen Sie eine unterzeichnete Best\u00E4tigung und ein Organigramm von einem Wirtschaftspr\u00FCfer, Notar oder Anwalt zur Verf\u00FCgung, die den Besitz von 25 % oder mehr des Unternehmens best\u00E4tigen. Diese m\u00FCssen innerhalb der letzten drei Monate datiert sein und die Lizenznummer des Unterzeichners enthalten.',
        copyOfID: 'Kopie des Ausweises f\u00FCr wirtschaftlich Berechtigten',
        copyOfIDDescription: 'Beispiele: Reisepass, F\u00FChrerschein, usw.',
        proofOfAddress: 'Adressnachweis f\u00FCr wirtschaftlich Berechtigten',
        proofOfAddressDescription: 'Beispiele: Nebenkostenabrechnung, Mietvertrag, etc.',
        codiceFiscale: 'Codice fiscale/Steuer-ID',
        codiceFiscaleDescription:
            'Bitte laden Sie ein Video eines Vor-Ort-Besuchs oder eines aufgezeichneten Gespr\u00E4chs mit dem unterzeichnenden Bevollm\u00E4chtigten hoch. Der Bevollm\u00E4chtigte muss folgende Informationen bereitstellen: vollst\u00E4ndiger Name, Geburtsdatum, Firmenname, Handelsregisternummer, Steuernummer, eingetragene Adresse, Art des Gesch\u00E4fts und Zweck des Kontos.',
    },
    validationStep: {
        headerTitle: 'Bankkonto validieren',
        buttonText: 'Einrichtung abschlie\u00DFen',
        maxAttemptsReached: 'Die Validierung f\u00FCr dieses Bankkonto wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1-2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie "Expensify, Inc. Validation".`,
        descriptionCTA: 'Bitte geben Sie jeden Transaktionsbetrag in die untenstehenden Felder ein. Beispiel: 1.51.',
        reviewingInfo: 'Danke! Wir \u00FCberpr\u00FCfen Ihre Informationen und werden uns in K\u00FCrze bei Ihnen melden. Bitte \u00FCberpr\u00FCfen Sie Ihren Chat mit Concierge.',
        forNextStep: 'f\u00FCr die n\u00E4chsten Schritte zur Fertigstellung der Einrichtung Ihres Bankkontos.',
        letsChatCTA: 'Ja, lass uns chatten.',
        letsChatText: 'Fast geschafft! Wir ben\u00F6tigen Ihre Hilfe, um ein paar letzte Informationen im Chat zu \u00FCberpr\u00FCfen. Bereit?',
        letsChatTitle: 'Lass uns chatten!',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText:
            'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die Zwei-Faktor-Authentifizierung (2FA) ein, um Ihrem Konto eine zus\u00E4tzliche Schutzschicht hinzuzuf\u00FCgen.',
        secureYourAccount: 'Sichern Sie Ihr Konto',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Zus\u00E4tzliche Informationen',
        checkAllThatApply: 'W\u00E4hlen Sie alle zutreffenden Optionen aus, andernfalls leer lassen.',
        iOwnMoreThan25Percent: 'Ich besitze mehr als 25% von',
        someoneOwnsMoreThan25Percent: 'Jemand anderes besitzt mehr als 25 % von',
        additionalOwner: 'Zus\u00E4tzlicher wirtschaftlicher Eigent\u00FCmer',
        removeOwner: 'Diesen wirtschaftlich Berechtigten entfernen',
        addAnotherIndividual: 'F\u00FCgen Sie eine weitere Person hinzu, die mehr als 25 % von besitzt.',
        agreement: 'Vereinbarung:',
        termsAndConditions: 'Allgemeine Gesch\u00E4ftsbedingungen',
        certifyTrueAndAccurate: 'Ich best\u00E4tige, dass die bereitgestellten Informationen wahr und korrekt sind.',
        error: {
            certify: 'Muss best\u00E4tigen, dass die Informationen wahr und korrekt sind.',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Verifizierung abschlie\u00DFen',
        confirmAgreements: 'Bitte best\u00E4tigen Sie die untenstehenden Vereinbarungen.',
        certifyTrueAndAccurate: 'Ich best\u00E4tige, dass die bereitgestellten Informationen wahr und korrekt sind.',
        certifyTrueAndAccurateError: 'Bitte best\u00E4tigen Sie, dass die Informationen wahr und korrekt sind.',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Gesch\u00E4ftskonto f\u00FCr Gesch\u00E4ftsausgaben zu verwenden.',
        isAuthorizedToUseBankAccountError: 'Sie m\u00FCssen ein Kontrollbeauftragter mit Berechtigung zur F\u00FChrung des Gesch\u00E4ftskontos sein.',
        termsAndConditions: 'Allgemeine Gesch\u00E4ftsbedingungen',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Bankkonto verbinden',
        finishButtonText: 'Einrichtung abschlie\u00DFen',
        validateYourBankAccount: 'Best\u00E4tigen Sie Ihr Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Validierung f\u00FCr dieses Bankkonto wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1-2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie "Expensify, Inc. Validation".`,
        descriptionCTA: 'Bitte geben Sie jeden Transaktionsbetrag in die untenstehenden Felder ein. Beispiel: 1.51.',
        reviewingInfo: 'Danke! Wir \u00FCberpr\u00FCfen Ihre Informationen und werden uns in K\u00FCrze bei Ihnen melden. Bitte \u00FCberpr\u00FCfen Sie Ihren Chat mit Concierge.',
        forNextSteps: 'f\u00FCr die n\u00E4chsten Schritte zur Fertigstellung der Einrichtung Ihres Bankkontos.',
        letsChatCTA: 'Ja, lass uns chatten.',
        letsChatText: 'Fast geschafft! Wir ben\u00F6tigen Ihre Hilfe, um ein paar letzte Informationen im Chat zu \u00FCberpr\u00FCfen. Bereit?',
        letsChatTitle: 'Lass uns chatten!',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText:
            'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die Zwei-Faktor-Authentifizierung (2FA) ein, um Ihrem Konto eine zus\u00E4tzliche Schutzschicht hinzuzuf\u00FCgen.',
        secureYourAccount: 'Sichern Sie Ihr Konto',
    },
    countryStep: {
        confirmBusinessBank: 'Best\u00E4tigen Sie die W\u00E4hrung und das Land des Gesch\u00E4ftskontos',
        confirmCurrency: 'W\u00E4hrung und Land best\u00E4tigen',
        yourBusiness: 'Die W\u00E4hrung Ihres Gesch\u00E4ftskontos muss mit der W\u00E4hrung Ihres Arbeitsbereichs \u00FCbereinstimmen.',
        youCanChange: 'Sie k\u00F6nnen die W\u00E4hrung Ihres Arbeitsbereichs in Ihrem \u00E4ndern.',
        findCountry: 'Land finden',
        selectCountry: 'Land ausw\u00E4hlen',
    },
    bankInfoStep: {
        whatAreYour: 'Was sind Ihre Gesch\u00E4ftskontodaten?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles in Ordnung ist.',
        thisBankAccount: 'Dieses Bankkonto wird f\u00FCr Gesch\u00E4ftszahlungen in Ihrem Arbeitsbereich verwendet.',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollst\u00E4ndiger Name des autorisierten Unterzeichners',
    },
    signerInfoStep: {
        signerInfo: 'Unterzeichnerinformationen',
        areYouDirector: ({companyName}: CompanyNameParams) => `Sind Sie ein Direktor oder leitender Angestellter bei ${companyName}?`,
        regulationRequiresUs: 'Vorschriften erfordern, dass wir \u00FCberpr\u00FCfen, ob der Unterzeichner die Befugnis hat, diese Handlung im Namen des Unternehmens vorzunehmen.',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name?',
        fullName: 'Vollst\u00E4ndiger rechtlicher Name',
        whatsYourJobTitle: 'Was ist Ihre Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        uploadID: 'Laden Sie einen Ausweis und einen Adressnachweis hoch',
        personalAddress: 'Nachweis der pers\u00F6nlichen Adresse (z.B. Stromrechnung)',
        letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        proofOf: 'Nachweis der pers\u00F6nlichen Adresse',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Geben Sie die E-Mail-Adresse des Direktors oder leitenden Angestellten bei ${companyName} ein.`,
        regulationRequiresOneMoreDirector: 'Die Vorschrift erfordert mindestens einen weiteren Direktor oder leitenden Angestellten als Unterzeichner.',
        hangTight: 'Einen Moment bitte...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Geben Sie die E-Mails von zwei Direktoren oder leitenden Angestellten bei ${companyName} ein.`,
        sendReminder: 'Erinnerung senden',
        chooseFile: 'Datei ausw\u00E4hlen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identit\u00E4t als Direktoren oder leitende Angestellte des Unternehmens verifizieren.',
        id: 'Kopie des Ausweises',
        proofOfDirectors: 'Nachweis der Direktor(en)',
        proofOfDirectorsDescription: 'Beispiele: Oncorp Unternehmensprofil oder Unternehmensregistrierung.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale f\u00FCr Unterzeichner, autorisierte Benutzer und wirtschaftlich Berechtigte.',
        PDSandFSG: 'PDS + FSG Offenlegungsunterlagen',
        PDSandFSGDescription:
            'Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um das umfangreiche Netzwerk internationaler Bankpartner zu nutzen und globale R\u00FCckerstattungen in Expensify zu erm\u00F6glichen. Gem\u00E4\u00DF der australischen Vorschriften stellen wir Ihnen den Financial Services Guide (FSG) und die Product Disclosure Statement (PDS) von Corpay zur Verf\u00FCgung.\n\nBitte lesen Sie die FSG- und PDS-Dokumente sorgf\u00E4ltig durch, da sie vollst\u00E4ndige Details und wichtige Informationen zu den von Corpay angebotenen Produkten und Dienstleistungen enthalten. Bewahren Sie diese Dokumente f\u00FCr zuk\u00FCnftige Referenz auf.',
        pleaseUpload:
            'Bitte laden Sie zus\u00E4tzliche Dokumente unten hoch, um uns bei der \u00DCberpr\u00FCfung Ihrer Identit\u00E4t als Direktor oder leitender Angestellter des Unternehmens zu helfen.',
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte best\u00E4tigen Sie die untenstehenden Vereinbarungen.',
        regulationRequiresUs: 'Vorschriften erfordern, dass wir die Identit\u00E4t jeder Person \u00FCberpr\u00FCfen, die mehr als 25% des Unternehmens besitzt.',
        iAmAuthorized: 'Ich bin berechtigt, das Gesch\u00E4ftskonto f\u00FCr Gesch\u00E4ftsausgaben zu verwenden.',
        iCertify: 'Ich best\u00E4tige, dass die angegebenen Informationen wahr und korrekt sind.',
        termsAndConditions: 'Allgemeine Gesch\u00E4ftsbedingungen',
        accept: 'Akzeptieren und Bankkonto hinzuf\u00FCgen',
        iConsentToThe: 'Ich stimme dem zu',
        privacyNotice: 'Datenschutzhinweis',
        error: {
            authorized: 'Sie m\u00FCssen ein Kontrollbeauftragter mit Berechtigung zur F\u00FChrung des Gesch\u00E4ftskontos sein.',
            certify: 'Bitte best\u00E4tigen Sie, dass die Informationen wahr und korrekt sind.',
            consent: 'Bitte stimmen Sie der Datenschutzerkl\u00E4rung zu.',
        },
    },
    finishStep: {
        connect: 'Bankkonto verbinden',
        letsFinish: 'Lass uns im Chat fertig werden!',
        thanksFor:
            'Danke f\u00FCr diese Details. Ein dedizierter Support-Mitarbeiter wird nun Ihre Informationen \u00FCberpr\u00FCfen. Wir melden uns bei Ihnen, falls wir noch etwas von Ihnen ben\u00F6tigen. In der Zwischenzeit k\u00F6nnen Sie sich gerne mit Fragen an uns wenden.',
        iHaveA: 'Ich habe eine Frage',
        enable2FA: 'Aktivieren Sie die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern.',
        weTake: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die Zwei-Faktor-Authentifizierung (2FA) ein, um Ihrem Konto eine zus\u00E4tzliche Schutzschicht hinzuzuf\u00FCgen.',
        secure: 'Sichern Sie Ihr Konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Einen Moment',
        explanationLine: 'Wir \u00FCberpr\u00FCfen Ihre Informationen. Sie k\u00F6nnen in K\u00FCrze mit den n\u00E4chsten Schritten fortfahren.',
    },
    session: {
        offlineMessageRetry: 'Es sieht so aus, als ob Sie offline sind. Bitte \u00FCberpr\u00FCfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    },
    travel: {
        header: 'Reise buchen',
        title: 'Reise clever',
        subtitle: 'Verwenden Sie Expensify Travel, um die besten Reiseangebote zu erhalten und alle Ihre Gesch\u00E4ftsausgaben an einem Ort zu verwalten.',
        features: {
            saveMoney: 'Sparen Sie Geld bei Ihren Buchungen',
            alerts: 'Erhalten Sie Echtzeit-Updates und -Benachrichtigungen',
        },
        bookTravel: 'Reise buchen',
        bookDemo: 'Demo buchen',
        bookADemo: 'Demo buchen',
        toLearnMore: 'um mehr zu erfahren.',
        termsAndConditions: {
            header: 'Bevor wir fortfahren...',
            title: 'Gesch\u00E4ftsbedingungen',
            subtitle: 'Bitte stimmen Sie den Expensify Travel zu.',
            termsAndConditions: 'Allgemeine Gesch\u00E4ftsbedingungen',
            travelTermsAndConditions: 'Allgemeine Gesch\u00E4ftsbedingungen',
            agree: 'Ich stimme den',
            error: 'Sie m\u00FCssen den Expensify Travel Gesch\u00E4ftsbedingungen zustimmen, um fortzufahren.',
            defaultWorkspaceError:
                'Sie m\u00FCssen einen Standard-Arbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehen Sie zu Einstellungen > Arbeitsbereiche > klicken Sie auf die drei vertikalen Punkte neben einem Arbeitsbereich > Als Standard-Arbeitsbereich festlegen und versuchen Sie es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Sie haben einen <strong>${layover} Zwischenstopp</strong> vor diesem Flug</muted-text-label>`,
            takeOff: 'Abflug',
            landing: 'Landung',
            seat: 'Sitzplatz',
            class: 'Kabinenklasse',
            recordLocator: 'Buchungscode',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Wirtschaft',
                premiumEconomy: 'Premium Economy',
                business: 'Business',
                first: 'Erste',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gast',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            roomType: 'Zimmertyp',
            cancellation: 'Stornierungsrichtlinie',
            cancellationUntil: 'Kostenlose Stornierung bis',
            confirmation: 'Best\u00E4tigungsnummer',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Nicht erstattungsf\u00E4hig',
                freeCancellationUntil: 'Kostenlose Stornierung bis',
                partiallyRefundable: 'Teilweise erstattungsf\u00E4hig',
            },
        },
        car: 'Auto',
        carDetails: {
            rentalCar: 'Mietwagen',
            pickUp: 'Abholung',
            dropOff: 'Abgabe',
            driver: 'Fahrer',
            carType: 'Autotyp',
            cancellation: 'Stornierungsrichtlinie',
            cancellationUntil: 'Kostenlose Stornierung bis',
            freeCancellation: 'Kostenlose Stornierung',
            confirmation: 'Best\u00E4tigungsnummer',
        },
        train: 'Schiene',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Abfahrten',
            arrives: 'Ankommt',
            coachNumber: 'Wagennummer',
            seat: 'Sitzplatz',
            fareDetails: 'Fahrpreisdetails',
            confirmation: 'Best\u00E4tigungsnummer',
        },
        viewTrip: 'Reise anzeigen',
        modifyTrip: 'Reise \u00E4ndern',
        tripSupport: 'Reiseunterst\u00FCtzung',
        tripDetails: 'Reisedetails',
        viewTripDetails: 'Reisedetails anzeigen',
        trip: 'Reise',
        trips: 'Reisen',
        tripSummary: 'Reisezusammenfassung',
        departs: 'Abfahrten',
        errorMessage: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es sp\u00E4ter noch einmal.',
        phoneError: {
            phrase1: 'Bitte',
            link: 'F\u00FCgen Sie eine Arbeits-E-Mail als Ihren prim\u00E4ren Login hinzu',
            phrase2: 'um Reisen zu buchen.',
        },
        domainSelector: {
            title: 'Domain',
            subtitle: 'W\u00E4hlen Sie eine Domain f\u00FCr die Einrichtung von Expensify Travel aus.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restrictionPrefix: `Sie haben keine Berechtigung, Expensify Travel f\u00FCr die Domain zu aktivieren.`,
            restrictionSuffix: `Du musst stattdessen jemanden aus dieser Dom\u00E4ne bitten, Reisen zu aktivieren.`,
            accountantInvitationPrefix: `Wenn Sie Buchhalter sind, sollten Sie dem ... beitreten.`,
            accountantInvitationLink: `ExpensifyApproved! Buchhalterprogramm`,
            accountantInvitationSuffix: `um Reisen f\u00FCr diese Domain zu erm\u00F6glichen.`,
        },
        publicDomainError: {
            title: 'Erste Schritte mit Expensify Travel',
            message: `Sie m\u00FCssen Ihre Arbeits-E-Mail (z. B. name@company.com) mit Expensify Travel verwenden, nicht Ihre pers\u00F6nliche E-Mail (z. B. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: `Ihr Administrator hat Expensify Travel deaktiviert. Bitte befolgen Sie die Buchungsrichtlinien Ihres Unternehmens f\u00FCr Reisebuchungen.`,
        },
        verifyCompany: {
            title: 'Beginnen Sie noch heute mit dem Reisen!',
            message: `Bitte kontaktieren Sie Ihren Account Manager oder salesteam@expensify.com, um eine Demo von Travel zu erhalten und es f\u00FCr Ihr Unternehmen freizuschalten.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Ihr Flug ${airlineCode} (${origin} \u2192 ${destination}) am ${startDate} wurde gebucht. Best\u00E4tigungscode: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Ticket f\u00FCr den Flug ${airlineCode} (${origin} \u2192 ${destination}) am ${startDate} wurde storniert.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Ticket f\u00FCr den Flug ${airlineCode} (${origin} \u2192 ${destination}) am ${startDate} wurde erstattet oder umgetauscht.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Flug ${airlineCode} (${origin} \u2192 ${destination}) am ${startDate} wurde von der Fluggesellschaft storniert.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `Die Fluggesellschaft hat eine Flugplan\u00E4nderung f\u00FCr den Flug ${airlineCode} vorgeschlagen; wir warten auf die Best\u00E4tigung.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `\u00C4nderung des Flugplans best\u00E4tigt: Flug ${airlineCode} startet jetzt am ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Ihr Flug ${airlineCode} (${origin} \u2192 ${destination}) am ${startDate} wurde aktualisiert.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Ihre Kabinenklasse wurde auf ${cabinClass} auf dem Flug ${airlineCode} aktualisiert.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzreservierung auf Flug ${airlineCode} wurde best\u00E4tigt.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde ge\u00E4ndert.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzzuweisung auf dem Flug ${airlineCode} wurde entfernt.`,
            paymentDeclined: 'Die Zahlung f\u00FCr Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Sie haben Ihre ${type}-Reservierung ${id} storniert.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Der Anbieter hat Ihre ${type}-Reservierung ${id} storniert.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Ihre ${type} Reservierung wurde neu gebucht. Neue Best\u00E4tigungsnummer: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Ihre ${type}-Buchung wurde aktualisiert. \u00DCberpr\u00FCfen Sie die neuen Details im Reiseplan.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Ihr Bahnticket f\u00FCr ${origin} \u2192 ${destination} am ${startDate} wurde erstattet. Eine Gutschrift wird bearbeitet.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Ihr Bahnticket f\u00FCr ${origin} \u2192 ${destination} am ${startDate} wurde umgetauscht.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Ihr Zugticket f\u00FCr ${origin} \u2192 ${destination} am ${startDate} wurde aktualisiert.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Ihre ${type} Reservierung wurde aktualisiert.`,
        },
    },
    workspace: {
        common: {
            card: 'Karten',
            expensifyCard: 'Expensify Card',
            companyCards: 'Unternehmenskarten',
            workflows: 'Workflows',
            workspace: 'Arbeitsbereich',
            findWorkspace: 'Arbeitsbereich finden',
            edit: 'Arbeitsbereich bearbeiten',
            enabled: 'Aktiviert',
            disabled: 'Deaktiviert',
            everyone: 'Jeder',
            delete: 'Arbeitsbereich l\u00F6schen',
            settings: 'Einstellungen',
            reimburse: 'Erstattungen',
            categories: 'Kategorien',
            tags: 'Tags',
            customField1: 'Benutzerdefiniertes Feld 1',
            customField2: 'Benutzerdefiniertes Feld 2',
            customFieldHint: 'F\u00FCgen Sie benutzerdefinierten Code hinzu, der f\u00FCr alle Ausgaben dieses Mitglieds gilt.',
            reportFields: 'Berichtsfelder',
            reportTitle: 'Berichtstitel',
            reportField: 'Berichtsfeld',
            taxes: 'Steuern',
            bills: 'Rechnungen',
            invoices: 'Rechnungen',
            travel: 'Reise',
            members: 'Mitglieder',
            accounting: 'Buchhaltung',
            rules: 'Regeln',
            displayedAs: 'Angezeigt als',
            plan: 'Plan',
            profile: '\u00DCbersicht',
            bankAccount: 'Bankkonto',
            connectBankAccount: 'Bankkonto verbinden',
            testTransactions: 'Testtransaktionen',
            issueAndManageCards: 'Karten ausstellen und verwalten',
            reconcileCards: 'Karten abstimmen',
            selected: () => ({
                one: '1 ausgew\u00E4hlt',
                other: (count: number) => `${count} ausgew\u00E4hlt`,
            }),
            settlementFrequency: 'Abrechnungsfrequenz',
            setAsDefault: 'Als Standardarbeitsbereich festlegen',
            defaultNote: `Belege, die an ${CONST.EMAIL.RECEIPTS} gesendet werden, erscheinen in diesem Arbeitsbereich.`,
            deleteConfirmation: 'M\u00F6chten Sie diesen Arbeitsbereich wirklich l\u00F6schen?',
            deleteWithCardsConfirmation: 'M\u00F6chten Sie diesen Arbeitsbereich wirklich l\u00F6schen? Dadurch werden alle Karten-Feeds und zugewiesenen Karten entfernt.',
            unavailable: 'Nicht verf\u00FCgbarer Arbeitsbereich',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied zum Arbeitsbereich einzuladen, verwenden Sie bitte die Einladungsschaltfl\u00E4che oben.',
            notAuthorized: `Sie haben keinen Zugriff auf diese Seite. Wenn Sie versuchen, diesem Arbeitsbereich beizutreten, bitten Sie einfach den Eigent\u00FCmer des Arbeitsbereichs, Sie als Mitglied hinzuzuf\u00FCgen. Etwas anderes? Wenden Sie sich an ${CONST.EMAIL.CONCIERGE}.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Gehe in den Raum ${roomName}`,
            goToWorkspace: 'Zum Arbeitsbereich gehen',
            goToWorkspaces: 'Gehe zu Arbeitsbereichen',
            clearFilter: 'Filter l\u00F6schen',
            workspaceName: 'Arbeitsbereichsname',
            workspaceOwner: 'Eigent\u00FCmer',
            workspaceType: 'Arbeitsbereichstyp',
            workspaceAvatar: 'Arbeitsbereichs-Avatar',
            mustBeOnlineToViewMembers: 'Sie m\u00FCssen online sein, um die Mitglieder dieses Arbeitsbereichs anzuzeigen.',
            moreFeatures: 'Mehr Funktionen',
            requested: 'Angefordert',
            distanceRates: 'Entfernungsraten',
            defaultDescription: 'Ein Ort f\u00FCr alle Ihre Belege und Ausgaben.',
            descriptionHint: 'Teile Informationen \u00FCber diesen Arbeitsbereich mit allen Mitgliedern.',
            welcomeNote: 'Bitte verwenden Sie Expensify, um Ihre Belege zur Erstattung einzureichen, danke!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell eingegeben markieren',
            markAsExported: 'Als manuell exportiert markieren',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `In ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} exportieren`,
            letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles richtig aussieht.',
            lineItemLevel: 'Positionsebene',
            reportLevel: 'Berichtsebene',
            topLevel: 'Oberste Ebene',
            appliedOnExport: 'Nicht in Expensify importiert, bei Export angewendet',
            shareNote: {
                header: 'Teilen Sie Ihren Arbeitsbereich mit anderen Mitgliedern.',
                content: {
                    firstPart:
                        'Teilen Sie diesen QR-Code oder kopieren Sie den unten stehenden Link, um es Mitgliedern zu erleichtern, den Zugang zu Ihrem Arbeitsbereich anzufordern. Alle Anfragen zum Beitritt zum Arbeitsbereich werden im',
                    secondPart: 'Raum f\u00FCr Ihre \u00DCberpr\u00FCfung.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verbinden`,
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Vorhandene Verbindung wiederverwenden',
            existingConnections: 'Bestehende Verbindungen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Da Sie zuvor eine Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} hergestellt haben, k\u00F6nnen Sie eine bestehende Verbindung wiederverwenden oder eine neue erstellen.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Zuletzt synchronisiert am ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Kann nicht mit ${connectionName} aufgrund eines Authentifizierungsfehlers verbinden.`,
            learnMore: 'Erfahren Sie mehr.',
            memberAlternateText: 'Mitglieder k\u00F6nnen Berichte einreichen und genehmigen.',
            adminAlternateText: 'Administratoren haben vollen Bearbeitungszugriff auf alle Berichte und Arbeitsbereichseinstellungen.',
            auditorAlternateText: 'Pr\u00FCfer k\u00F6nnen Berichte einsehen und kommentieren.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Pr\u00FCfer';
                    case CONST.POLICY.ROLE.USER:
                        return 'Mitglied';
                    default:
                        return 'Mitglied';
                }
            },
            frequency: {
                manual: 'Manuell',
                instant: 'Sofort',
                immediate: 'T\u00E4glich',
                trip: 'Nach Reise',
                weekly: 'W\u00F6chentlich',
                semimonthly: 'Zweimal im Monat',
                monthly: 'Monatlich',
            },
            planType: 'Plantyp',
            submitExpense: 'Reichen Sie Ihre Ausgaben unten ein:',
            defaultCategory: 'Standardkategorie',
            viewTransactions: 'Transaktionen anzeigen',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Ausgaben von ${displayName}`,
        },
        perDiem: {
            subtitle: 'Legen Sie Tagess\u00E4tze fest, um die t\u00E4glichen Ausgaben der Mitarbeiter zu kontrollieren.',
            amount: 'Betrag',
            deleteRates: () => ({
                one: 'L\u00F6schrate',
                other: 'Raten l\u00F6schen',
            }),
            deletePerDiemRate: 'Tagessatz l\u00F6schen',
            findPerDiemRate: 'Tagespauschale finden',
            areYouSureDelete: () => ({
                one: 'M\u00F6chten Sie diesen Satz wirklich l\u00F6schen?',
                other: 'M\u00F6chten Sie diese Tarife wirklich l\u00F6schen?',
            }),
            emptyList: {
                title: 'Per diem',
                subtitle: 'Tagespauschalen festlegen, um die t\u00E4glichen Ausgaben der Mitarbeiter zu kontrollieren. Raten aus einer Tabelle importieren, um loszulegen.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Ein Satz mit dem Wert ${rate} existiert bereits.`,
            },
            importPerDiemRates: 'Tagespauschalen importieren',
            editPerDiemRate: 'Tagessatz bearbeiten',
            editPerDiemRates: 'Tagespauschalen bearbeiten',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Das Aktualisieren dieses Ziels wird es f\u00FCr alle ${destination} Tagegeld-Teilraten \u00E4ndern.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `Das Aktualisieren dieser W\u00E4hrung wird sie f\u00FCr alle ${destination} Tagessatz-Unterraten \u00E4ndern.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Desktop exportiert werden.',
            exportOutOfPocketExpensesCheckToggle: 'Markiere Schecks als \u201Esp\u00E4ter drucken\u201C',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten in QuickBooks Desktop exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            account: 'Konto',
            accountDescription: 'W\u00E4hlen Sie, wo Sie Buchungss\u00E4tze posten m\u00F6chten.',
            accountsPayable: 'Verbindlichkeiten',
            accountsPayableDescription: 'W\u00E4hlen Sie, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'W\u00E4hlen Sie aus, von wo Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach QuickBooks Desktop exportiert wurde.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportCheckDescription: 'Wir werden f\u00FCr jeden Expensify-Bericht einen detaillierten Scheck erstellen und ihn von dem unten stehenden Bankkonto senden.',
            exportJournalEntryDescription: 'Wir werden f\u00FCr jeden Expensify-Bericht einen detaillierten Journaleintrag erstellen und ihn auf das untenstehende Konto buchen.',
            exportVendorBillDescription:
                'Wir werden f\u00FCr jeden Expensify-Bericht eine detaillierte Lieferantenrechnung erstellen und sie dem unten stehenden Konto hinzuf\u00FCgen. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des n\u00E4chsten offenen Zeitraums.',
            deepDiveExpensifyCard: 'Expensify Card-Transaktionen werden automatisch in ein "Expensify Card Liability Account" exportiert, das erstellt wurde mit',
            deepDiveExpensifyCardIntegration: 'unsere Integration.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop unterst\u00FCtzt keine Steuern bei Journalbuchungsexporten. Da Sie Steuern in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verf\u00FCgbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verf\u00FCgbar, wenn Steuern aktiviert sind. Bitte w\u00E4hlen Sie eine andere Exportoption.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaleintrag',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Pr\u00FCfen',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Beschreibung`]:
                    'Wir werden f\u00FCr jeden Expensify-Bericht einen detaillierten Scheck erstellen und ihn von dem unten stehenden Bankkonto senden.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Beschreibung`]:
                    "Wir werden den H\u00E4ndlernamen der Kreditkartentransaktion automatisch mit den entsprechenden Lieferanten in QuickBooks abgleichen. Wenn keine Lieferanten vorhanden sind, erstellen wir einen 'Credit Card Misc.'-Lieferanten zur Zuordnung.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Beschreibung`]:
                    'Wir erstellen eine detaillierte Lieferantenrechnung f\u00FCr jeden Expensify-Bericht mit dem Datum der letzten Ausgabe und f\u00FCgen sie dem unten stehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des n\u00E4chsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Kontobeschreibung`]:
                    'W\u00E4hlen Sie aus, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'W\u00E4hlen Sie einen Anbieter aus, um ihn auf alle Kreditkartentransaktionen anzuwenden.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}KontoBeschreibung`]: 'W\u00E4hlen Sie aus, von wo Schecks gesendet werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Fehler`]:
                    'Lieferantenrechnungen sind nicht verf\u00FCgbar, wenn Standorte aktiviert sind. Bitte w\u00E4hlen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Fehler`]:
                    'Schecks sind nicht verf\u00FCgbar, wenn Standorte aktiviert sind. Bitte w\u00E4hlen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Fehler`]:
                    'Journalbuchungen sind nicht verf\u00FCgbar, wenn Steuern aktiviert sind. Bitte w\u00E4hlen Sie eine andere Exportoption.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'F\u00FCgen Sie das Konto in QuickBooks Desktop hinzu und synchronisieren Sie die Verbindung erneut.',
            qbdSetup: 'QuickBooks Desktop-Einrichtung',
            requiredSetupDevice: {
                title: 'Kann von diesem Ger\u00E4t aus keine Verbindung herstellen',
                body1: 'Sie m\u00FCssen diese Verbindung von dem Computer aus einrichten, der Ihre QuickBooks Desktop-Unternehmensdatei hostet.',
                body2: 'Sobald Sie verbunden sind, k\u00F6nnen Sie von \u00FCberall aus synchronisieren und exportieren.',
            },
            setupPage: {
                title: '\u00D6ffnen Sie diesen Link, um eine Verbindung herzustellen.',
                body: 'Um die Einrichtung abzuschlie\u00DFen, \u00F6ffnen Sie den folgenden Link auf dem Computer, auf dem QuickBooks Desktop l\u00E4uft.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody1: 'Die QuickBooks Desktop-Verbindung funktioniert im Moment nicht. Bitte versuchen Sie es sp\u00E4ter erneut oder',
                setupErrorBody2: 'wenn das Problem weiterhin besteht.',
                setupErrorBodyContactConcierge: 'Wenden Sie sich an Concierge',
            },
            importDescription: 'W\u00E4hlen Sie aus, welche Kodierungskonfigurationen von QuickBooks Desktop in Expensify importiert werden sollen.',
            classes: 'Klassen',
            items: 'Artikel',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Unternehmenskartenk\u00E4ufe zu QuickBooks Desktop exportiert werden.',
            defaultVendorDescription: 'Legen Sie einen Standardlieferanten fest, der bei Export auf alle Kreditkartentransaktionen angewendet wird.',
            accountsDescription: 'Ihr QuickBooks Desktop-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'W\u00E4hlen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'W\u00E4hlen Sie, wie QuickBooks Desktop-Klassen in Expensify behandelt werden sollen.',
            tagsDisplayedAsDescription: 'Positionsebene',
            reportFieldsDisplayedAsDescription: 'Berichtsebene',
            customersDescription: 'W\u00E4hlen Sie aus, wie Sie QuickBooks Desktop-Kunden/-Projekte in Expensify verwalten m\u00F6chten.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit QuickBooks Desktop synchronisieren.',
                createEntities: 'Entit\u00E4ten automatisch erstellen',
                createEntitiesDescription: 'Expensify erstellt automatisch Lieferanten in QuickBooks Desktop, wenn sie noch nicht existieren.',
            },
            itemsDescription: 'W\u00E4hlen Sie, wie QuickBooks Desktop-Elemente in Expensify behandelt werden sollen.',
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'W\u00E4hlen Sie aus, welche Kodierungskonfigurationen aus QuickBooks Online in Expensify importiert werden sollen.',
            classes: 'Klassen',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr QuickBooks Online-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'W\u00E4hlen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'W\u00E4hlen Sie, wie QuickBooks Online-Klassen in Expensify behandelt werden sollen.',
            customersDescription: 'W\u00E4hlen Sie aus, wie QuickBooks Online-Kunden/Projekte in Expensify behandelt werden sollen.',
            locationsDescription: 'W\u00E4hlen Sie, wie QuickBooks Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'W\u00E4hlen Sie, wie Sie die Steuern von QuickBooks Online in Expensify handhaben m\u00F6chten.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online unterst\u00FCtzt keine Standorte auf Zeilenebene f\u00FCr Schecks oder Lieferantenrechnungen. Wenn Sie Standorte auf Zeilenebene haben m\u00F6chten, stellen Sie sicher, dass Sie Journalbuchungen und Kredit-/Debitkartenausgaben verwenden.',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online unterst\u00FCtzt keine Steuern bei Journalbuchungen. Bitte \u00E4ndern Sie Ihre Exportoption auf Lieferantenrechnung oder Scheck.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Online exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            deepDiveExpensifyCard: 'Expensify Card-Transaktionen werden automatisch in ein "Expensify Card Liability Account" exportiert, das erstellt wurde mit',
            deepDiveExpensifyCardIntegration: 'unsere Integration.',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach QuickBooks Online exportiert wurde.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            receivable: 'Forderungen aus Lieferungen und Leistungen', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Debitorenbuchhaltungsarchiv', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Verwenden Sie dieses Konto beim Exportieren von Rechnungen nach QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Unternehmenskartenk\u00E4ufe nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Legen Sie einen Standardlieferanten fest, der bei Export auf alle Kreditkartentransaktionen angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir werden f\u00FCr jeden Expensify-Bericht einen detaillierten Scheck erstellen und ihn von dem unten stehenden Bankkonto senden.',
            exportJournalEntryDescription: 'Wir werden f\u00FCr jeden Expensify-Bericht einen detaillierten Journaleintrag erstellen und ihn auf das untenstehende Konto buchen.',
            exportVendorBillDescription:
                'Wir werden f\u00FCr jeden Expensify-Bericht eine detaillierte Lieferantenrechnung erstellen und sie dem unten stehenden Konto hinzuf\u00FCgen. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des n\u00E4chsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'W\u00E4hlen Sie, wo Sie Buchungss\u00E4tze posten m\u00F6chten.',
            accountsPayable: 'Verbindlichkeiten',
            accountsPayableDescription: 'W\u00E4hlen Sie, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'W\u00E4hlen Sie aus, von wo Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online unterst\u00FCtzt keine Standorte bei Exporten von Lieferantenrechnungen. Da Sie Standorte in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verf\u00FCgbar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online unterst\u00FCtzt keine Steuern bei Journalbuchungsexporten. Da Sie Steuern in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verf\u00FCgbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verf\u00FCgbar, wenn Steuern aktiviert sind. Bitte w\u00E4hlen Sie eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit QuickBooks Online synchronisiert.',
                inviteEmployees: 'Mitarbeiter einladen',
                inviteEmployeesDescription: 'QuickBooks Online-Mitarbeiterdaten importieren und Mitarbeiter in diesen Arbeitsbereich einladen.',
                createEntities: 'Entit\u00E4ten automatisch erstellen',
                createEntitiesDescription:
                    'Expensify wird automatisch Lieferanten in QuickBooks Online erstellen, wenn sie noch nicht existieren, und Kunden automatisch erstellen, wenn Rechnungen exportiert werden.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht \u00FCber Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden QuickBooks Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks-Rechnungszahlungskonto',
                qboInvoiceCollectionAccount: 'QuickBooks Rechnungsinkasso-Konto',
                accountSelectDescription: 'W\u00E4hlen Sie aus, von wo aus Sie Rechnungen bezahlen m\u00F6chten, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'W\u00E4hlen Sie aus, wohin die Rechnungszahlungen empfangen werden sollen, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitkarte',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaleintrag',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Pr\u00FCfen',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Beschreibung`]:
                    "Wir werden den H\u00E4ndlernamen der Debitkartentransaktion automatisch mit den entsprechenden Lieferanten in QuickBooks abgleichen. Wenn keine Lieferanten existieren, erstellen wir einen Lieferanten 'Debit Card Misc.' zur Zuordnung.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Beschreibung`]:
                    "Wir werden den H\u00E4ndlernamen der Kreditkartentransaktion automatisch mit den entsprechenden Lieferanten in QuickBooks abgleichen. Wenn keine Lieferanten vorhanden sind, erstellen wir einen 'Credit Card Misc.'-Lieferanten zur Zuordnung.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Beschreibung`]:
                    'Wir erstellen eine detaillierte Lieferantenrechnung f\u00FCr jeden Expensify-Bericht mit dem Datum der letzten Ausgabe und f\u00FCgen sie dem unten stehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des n\u00E4chsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Kontobeschreibung`]: 'W\u00E4hlen Sie, wohin die Debitkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Kontobeschreibung`]:
                    'W\u00E4hlen Sie aus, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Kontobeschreibung`]: 'W\u00E4hlen Sie einen Anbieter aus, um ihn auf alle Kreditkartentransaktionen anzuwenden.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Fehler`]:
                    'Lieferantenrechnungen sind nicht verf\u00FCgbar, wenn Standorte aktiviert sind. Bitte w\u00E4hlen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Fehler`]:
                    'Schecks sind nicht verf\u00FCgbar, wenn Standorte aktiviert sind. Bitte w\u00E4hlen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Fehler`]:
                    'Journalbuchungen sind nicht verf\u00FCgbar, wenn Steuern aktiviert sind. Bitte w\u00E4hlen Sie eine andere Exportoption.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'W\u00E4hlen Sie ein g\u00FCltiges Konto f\u00FCr den Export der Lieferantenrechnung aus',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'W\u00E4hlen Sie ein g\u00FCltiges Konto f\u00FCr den Export des Journaleintrags aus.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'W\u00E4hlen Sie ein g\u00FCltiges Konto f\u00FCr den Scheckexport aus',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Um den Export von Lieferantenrechnungen zu verwenden, richten Sie ein Kreditorenkonto in QuickBooks Online ein.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Um den Export von Journalbuchungen zu verwenden, richten Sie ein Journal-Konto in QuickBooks Online ein.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Um den Scheckexport zu verwenden, richten Sie ein Bankkonto in QuickBooks Online ein.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'F\u00FCgen Sie das Konto in QuickBooks Online hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'W\u00E4hlen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen werden exportiert, wenn sie endg\u00FCltig genehmigt sind.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, wenn sie bezahlt sind.',
                },
            },
        },
        workspaceList: {
            joinNow: 'Jetzt beitreten',
            askToJoin: 'Anfrage zum Beitritt stellen',
        },
        xero: {
            organization: 'Xero-Organisation',
            organizationDescription: 'W\u00E4hlen Sie die Xero-Organisation aus, aus der Sie Daten importieren m\u00F6chten.',
            importDescription: 'W\u00E4hlen Sie aus, welche Kodierungskonfigurationen von Xero in Expensify importiert werden sollen.',
            accountsDescription: 'Ihr Xero-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'W\u00E4hlen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            trackingCategories: 'Verfolgungskategorien',
            trackingCategoriesDescription: 'W\u00E4hlen Sie, wie Xero-Tracking-Kategorien in Expensify gehandhabt werden sollen.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Xero ${categoryName} zuordnen zu`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `W\u00E4hlen Sie, wo ${categoryName} beim Exportieren nach Xero zugeordnet werden soll.`,
            customers: 'Kunden erneut abrechnen',
            customersDescription:
                'W\u00E4hlen Sie, ob Kunden in Expensify erneut belastet werden sollen. Ihre Xero-Kundenkontakte k\u00F6nnen mit Ausgaben verkn\u00FCpft werden und werden als Verkaufsrechnung nach Xero exportiert.',
            taxesDescription: 'W\u00E4hlen Sie, wie Sie Xero-Steuern in Expensify handhaben m\u00F6chten.',
            notImported: 'Nicht importiert',
            notConfigured: 'Nicht konfiguriert',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero-Kontaktstandard',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Berichtsfelder',
            },
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Xero exportiert werden.',
            purchaseBill: 'Kaufrechnung',
            exportDeepDiveCompanyCard:
                'Exportierte Ausgaben werden als Banktransaktionen auf das unten stehende Xero-Bankkonto gebucht, und die Transaktionsdaten werden mit den Daten auf Ihrem Kontoauszug \u00FCbereinstimmen.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero-Bankkonto',
            xeroBankAccountDescription: 'W\u00E4hlen Sie, wo Ausgaben als Banktransaktionen gebucht werden sollen.',
            exportExpensesDescription: 'Berichte werden als Einkaufsrechnung mit dem unten ausgew\u00E4hlten Datum und Status exportiert.',
            purchaseBillDate: 'Rechnungsdatum des Kaufs',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Verkaufsrechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung gesendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Xero synchronisieren.',
                purchaseBillStatusTitle: 'Status der Rechnungsk\u00E4ufe',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht \u00FCber Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden Xero-Konto erstellt.',
                xeroBillPaymentAccount: 'Xero-Rechnungszahlungskonto',
                xeroInvoiceCollectionAccount: 'Xero-Rechnungsinkassokonto',
                xeroBillPaymentAccountDescription: 'W\u00E4hlen Sie aus, von wo aus Sie Rechnungen bezahlen m\u00F6chten, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'W\u00E4hlen Sie aus, wohin die Rechnungszahlungen empfangen werden sollen, und wir erstellen die Zahlung in Xero.',
            },
            exportDate: {
                label: 'Rechnungsdatum des Kaufs',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach Xero exportiert wurde.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status der Rechnungsk\u00E4ufe',
                description: 'Verwenden Sie diesen Status beim Exportieren von Einkaufsrechnungen nach Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Entwurf',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Warten auf Genehmigung',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Zahlung ausstehend',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte f\u00FCgen Sie das Konto in Xero hinzu und synchronisieren Sie die Verbindung erneut.',
        },
        sageIntacct: {
            preferredExporter: 'Bevorzugter Exporteur',
            taxSolution: 'Steuerl\u00F6sung',
            notConfigured: 'Nicht konfiguriert',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach Sage Intacct exportiert wurde.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Legen Sie fest, wie Auslagen zu Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Spesenabrechnungen',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            nonReimbursableExpenses: {
                description: 'Legen Sie fest, wie Unternehmenskartenk\u00E4ufe nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Kreditkarten',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            creditCardAccount: 'Kreditkartenkonto',
            defaultVendor: 'Standardlieferant',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Legen Sie einen Standardanbieter fest, der auf ${isReimbursable ? '' : 'non-'} erstattungsf\u00E4hige Ausgaben angewendet wird, die keinen passenden Anbieter in Sage Intacct haben.`,
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Sage Intacct exportiert werden.',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch ein Domain-Admin sein, wenn Sie in den Domain-Einstellungen unterschiedliche Exportkonten f\u00FCr einzelne Firmenkarten festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zum Export in seinem Konto.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: `Bitte f\u00FCgen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut.`,
            autoSync: 'Auto-Synchronisierung',
            autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Sage Intacct synchronisieren.',
            inviteEmployees: 'Mitarbeiter einladen',
            inviteEmployeesDescription:
                'Importieren Sie Sage Intacct-Mitarbeiterdaten und laden Sie Mitarbeiter in diesen Arbeitsbereich ein. Ihr Genehmigungsworkflow wird standardm\u00E4\u00DFig auf Managergenehmigung eingestellt und kann auf der Mitgliederseite weiter konfiguriert werden.',
            syncReimbursedReports: 'Erstattete Berichte synchronisieren',
            syncReimbursedReportsDescription:
                'Jedes Mal, wenn ein Bericht \u00FCber Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden Sage Intacct-Konto erstellt.',
            paymentAccount: 'Sage Intacct Zahlungskonto',
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'W\u00E4hlen Sie die Tochtergesellschaft in NetSuite aus, von der Sie Daten importieren m\u00F6chten.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto f\u00FCr Journaleintr\u00E4ge',
            journalEntriesProvTaxPostingAccount: 'Journalbuchungen Provinzsteuerbuchungskonto',
            foreignCurrencyAmount: 'Fremdw\u00E4hrungsbetrag exportieren',
            exportToNextOpenPeriod: 'In die n\u00E4chste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Nicht erstattungsf\u00E4higes Buchungskonto',
            reimbursableJournalPostingAccount: 'Erstattungsf\u00E4higes Journalbuchungskonto',
            journalPostingPreference: {
                label: 'Buchungspr\u00E4ferenz f\u00FCr Journaleintr\u00E4ge',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Einzelner, aufgeschl\u00FCsselter Eintrag f\u00FCr jeden Bericht',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Einzelner Eintrag f\u00FCr jede Ausgabe',
                },
            },
            invoiceItem: {
                label: 'Rechnungsposition',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Erstelle eins f\u00FCr mich',
                        description: 'Wir erstellen f\u00FCr Sie einen "Expensify-Rechnungsposition" beim Export (falls noch keiner existiert).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Vorhandenes ausw\u00E4hlen',
                        description: 'Wir werden Rechnungen von Expensify mit dem unten ausgew\u00E4hlten Element verkn\u00FCpfen.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach NetSuite exportiert wurde.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Spesenabrechnungen',
                        reimbursableDescription: 'Auslagen werden als Spesenabrechnungen zu NetSuite exportiert.',
                        nonReimbursableDescription: 'Unternehmensausgaben werden als Spesenabrechnungen nach NetSuite exportiert.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Lieferantenrechnungen',
                        reimbursableDescription:
                            'Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription:
                            'Company card expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Journalbuchungen',
                        reimbursableDescription:
                            'Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription:
                            'Company card expenses will export as journal entries to the NetSuite account specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                },
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit NetSuite synchronisieren.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht \u00FCber Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Erstattungskonto',
                reimbursementsAccountDescription:
                    'W\u00E4hlen Sie das Bankkonto aus, das Sie f\u00FCr R\u00FCckerstattungen verwenden m\u00F6chten, und wir erstellen die zugeh\u00F6rige Zahlung in NetSuite.',
                collectionsAccount: 'Inkassokonto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und nach NetSuite exportiert wird, erscheint sie im folgenden Konto.',
                approvalAccount: 'A/P Genehmigungskonto',
                approvalAccountDescription:
                    'W\u00E4hlen Sie das Konto aus, gegen das Transaktionen in NetSuite genehmigt werden. Wenn Sie erstattete Berichte synchronisieren, ist dies auch das Konto, gegen das Rechnungszahlungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite-Standardwert',
                inviteEmployees: 'Mitarbeiter einladen und Genehmigungen festlegen',
                inviteEmployeesDescription:
                    'Importieren Sie NetSuite-Mitarbeiterdaten und laden Sie Mitarbeiter in diesen Arbeitsbereich ein. Ihr Genehmigungs-Workflow wird standardm\u00E4\u00DFig auf die Genehmigung durch den Manager eingestellt und kann auf der Seite *Mitglieder* weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeiter/Lieferanten automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription:
                    'Standardm\u00E4\u00DFig erstellt Expensify Eintr\u00E4ge mit dem bevorzugten Transaktionsformular, das in NetSuite festgelegt ist. Alternativ k\u00F6nnen Sie ein spezifisches Transaktionsformular festlegen, das verwendet werden soll.',
                customFormIDReimbursable: 'Auslage',
                customFormIDNonReimbursable: 'Unternehmenskarte Ausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsebene f\u00FCr Spesenabrechnungen',
                    description:
                        'Sobald ein Spesenbericht in Expensify genehmigt und nach NetSuite exportiert wurde, k\u00F6nnen Sie in NetSuite eine zus\u00E4tzliche Genehmigungsstufe vor dem Buchen festlegen.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite-Standardpr\u00E4ferenz',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Nur vom Vorgesetzten genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Nur Buchhaltung genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Vorgesetzter und Buchhaltung genehmigt',
                    },
                },
                accountingMethods: {
                    label: 'Wann exportieren',
                    description: 'W\u00E4hlen Sie, wann die Ausgaben exportiert werden sollen:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen werden exportiert, wenn sie endg\u00FCltig genehmigt sind.',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, wenn sie bezahlt sind.',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsebene f\u00FCr Lieferantenrechnungen',
                    description:
                        'Sobald eine Lieferantenrechnung in Expensify genehmigt und nach NetSuite exportiert wurde, k\u00F6nnen Sie in NetSuite eine zus\u00E4tzliche Genehmigungsebene vor dem Buchen festlegen.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite-Standardpr\u00E4ferenz',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zur Ver\u00F6ffentlichung genehmigt',
                    },
                },
                exportJournalsTo: {
                    label: 'Genehmigungsebene f\u00FCr Journaleintr\u00E4ge',
                    description:
                        'Sobald ein Journaleintrag in Expensify genehmigt und nach NetSuite exportiert wurde, k\u00F6nnen Sie in NetSuite eine zus\u00E4tzliche Genehmigungsebene festlegen, bevor er gebucht wird.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite-Standardpr\u00E4ferenz',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zur Ver\u00F6ffentlichung genehmigt',
                    },
                },
                error: {
                    customFormID: 'Bitte geben Sie eine g\u00FCltige numerische benutzerdefinierte Formular-ID ein.',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte f\u00FCgen Sie das Konto in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noVendorsFound: 'Keine Anbieter gefunden',
            noVendorsFoundDescription: 'Bitte f\u00FCgen Sie Lieferanten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noItemsFound: 'Keine Rechnungspositionen gefunden',
            noItemsFoundDescription: 'Bitte f\u00FCgen Sie Rechnungsposten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noSubsidiariesFound: 'Keine Tochtergesellschaften gefunden',
            noSubsidiariesFoundDescription: 'Bitte f\u00FCgen Sie eine Tochtergesellschaft in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            tokenInput: {
                title: 'NetSuite-Einrichtung',
                formSteps: {
                    installBundle: {
                        title: 'Installieren Sie das Expensify-Paket',
                        description: 'In NetSuite, gehe zu *Customization > SuiteBundler > Search & Install Bundles* > suche nach "Expensify" > installiere das Bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Token-basierte Authentifizierung aktivieren',
                        description: 'In NetSuite, gehe zu *Setup > Company > Enable Features > SuiteCloud* > aktiviere *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-Webdienste aktivieren',
                        description: 'In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Erstelle ein Zugriffstoken',
                        description:
                            'In NetSuite, gehen Sie zu *Setup > Users/Roles > Access Tokens* > erstellen Sie ein Zugriffstoken f\u00FCr die "Expensify"-App und entweder die Rolle "Expensify Integration" oder "Administrator".\n\n*Wichtig:* Stellen Sie sicher, dass Sie die *Token ID* und das *Token Secret* aus diesem Schritt speichern. Sie werden es f\u00FCr den n\u00E4chsten Schritt ben\u00F6tigen.',
                    },
                    enterCredentials: {
                        title: 'Geben Sie Ihre NetSuite-Anmeldedaten ein',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'In NetSuite, gehen Sie zu *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Ausgabenkategorien',
                expenseCategoriesDescription: 'Ihre NetSuite-Ausgabenkategorien werden in Expensify als Kategorien importiert.',
                crossSubsidiaryCustomers: 'Kunden/Projekte \u00FCber Tochtergesellschaften hinweg',
                importFields: {
                    departments: {
                        title: 'Abteilungen',
                        subtitle: 'W\u00E4hlen Sie, wie die NetSuite-*Abteilungen* in Expensify behandelt werden sollen.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'W\u00E4hlen Sie, wie Sie *Klassen* in Expensify verwalten m\u00F6chten.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'W\u00E4hlen Sie aus, wie *Standorte* in Expensify behandelt werden sollen.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'W\u00E4hlen Sie, wie NetSuite-*Kunden* und *Projekte* in Expensify behandelt werden sollen.',
                    importCustomers: 'Kunden importieren',
                    importJobs: 'Projekte importieren',
                    customers: 'Kunden',
                    jobs: 'Projekte',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('und')}, ${importType}`,
                },
                importTaxDescription: 'Steuergruppen aus NetSuite importieren.',
                importCustomFields: {
                    chooseOptionBelow: 'W\u00E4hlen Sie eine der folgenden Optionen:',
                    label: ({importedTypes}: ImportedTypesParams) => `Als ${importedTypes.join('und')} importiert`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Bitte geben Sie das ${fieldName} ein.`,
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Datens\u00E4tze',
                        addText: 'Benutzerdefiniertes Segment/Datensatz hinzuf\u00FCgen',
                        recordTitle: 'Benutzerdefiniertes Segment/Datensatz',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration benutzerdefinierter Segmente/Datens\u00E4tze.',
                        emptyTitle: 'F\u00FCgen Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzu',
                        fields: {
                            segmentName: 'Name',
                            internalID: 'Interne ID',
                            scriptID: 'Script-ID',
                            customRecordScriptID: 'Transaktionsspalten-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefiniertes Segment/Datensatz entfernen',
                        removePrompt: 'M\u00F6chten Sie dieses benutzerdefinierte Segment/Datensatz wirklich entfernen?',
                        addForm: {
                            customSegmentName: 'benutzerdefinierter Segmentname',
                            customRecordName: 'benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefiniertes Segment',
                            customSegmentAddTitle: 'Benutzerdefiniertes Segment hinzuf\u00FCgen',
                            customRecordAddTitle: 'Benutzerdefinierten Datensatz hinzuf\u00FCgen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'M\u00F6chten Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzuf\u00FCgen?',
                            customSegmentNameTitle: 'Wie lautet der benutzerdefinierte Segmentname?',
                            customRecordNameTitle: 'Wie lautet der benutzerdefinierte Datensatzname?',
                            customSegmentNameFooter: `Sie finden benutzerdefinierte Segmentnamen in NetSuite unter *Customizations > Links, Records & Fields > Custom Segments* Seite.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Sie k\u00F6nnen benutzerdefinierte Datensatznamen in NetSuite finden, indem Sie "Transaction Column Field" in die globale Suche eingeben.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Was ist die interne ID?',
                            customSegmentInternalIDFooter: `Zuerst stellen Sie sicher, dass Sie interne IDs in NetSuite aktiviert haben unter *Home > Set Preferences > Show Internal ID.*\n\nSie k\u00F6nnen die internen IDs von benutzerdefinierten Segmenten in NetSuite finden unter:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Klicken Sie auf ein benutzerdefiniertes Segment.\n3. Klicken Sie auf den Hyperlink neben *Custom Record Type*.\n4. Finden Sie die interne ID in der Tabelle unten.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Sie k\u00F6nnen benutzerdefinierte Datensatz-IDs in NetSuite finden, indem Sie die folgenden Schritte ausf\u00FChren:\n\n1. Geben Sie "Transaction Line Fields" in die globale Suche ein.\n2. Klicken Sie auf einen benutzerdefinierten Datensatz.\n3. Finden Sie die interne ID auf der linken Seite.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Was ist die Skript-ID?',
                            customSegmentScriptIDFooter: `Sie k\u00F6nnen benutzerdefinierte Segment-Skript-IDs in NetSuite unter folgendem Pfad finden:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Klicken Sie auf ein benutzerdefiniertes Segment.\n3. Klicken Sie auf die Registerkarte *Application and Sourcing* unten, dann:\n    a. Wenn Sie das benutzerdefinierte Segment als *Tag* (auf der Positionsebene) in Expensify anzeigen m\u00F6chten, klicken Sie auf die Unterregisterkarte *Transaction Columns* und verwenden Sie die *Field ID*.\n    b. Wenn Sie das benutzerdefinierte Segment als *Berichtsfeld* (auf der Berichtsebene) in Expensify anzeigen m\u00F6chten, klicken Sie auf die Unterregisterkarte *Transactions* und verwenden Sie die *Field ID*.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Was ist die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: `Sie k\u00F6nnen benutzerdefinierte Skript-IDs in NetSuite unter folgendem finden:\n\n1. Geben Sie "Transaction Line Fields" in die globale Suche ein.\n2. Klicken Sie auf einen benutzerdefinierten Datensatz.\n3. Finden Sie die Skript-ID auf der linken Seite.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Wie sollte dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Datensatz in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Ein benutzerdefiniertes Segment/Datensatz mit dieser ${fieldName?.toLowerCase()} existiert bereits.`,
                        },
                    },
                    customLists: {
                        title: 'Benutzerdefinierte Listen',
                        addText: 'Benutzerdefinierte Liste hinzuf\u00FCgen',
                        recordTitle: 'Benutzerdefinierte Liste',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'beim Konfigurieren benutzerdefinierter Listen.',
                        emptyTitle: 'F\u00FCgen Sie eine benutzerdefinierte Liste hinzu',
                        fields: {
                            listName: 'Name',
                            internalID: 'Interne ID',
                            transactionFieldID: 'Transaktionsfeld-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefinierte Liste entfernen',
                        removePrompt: 'M\u00F6chten Sie diese benutzerdefinierte Liste wirklich entfernen?',
                        addForm: {
                            listNameTitle: 'W\u00E4hlen Sie eine benutzerdefinierte Liste aus',
                            transactionFieldIDTitle: 'Wie lautet die Transaktionsfeld-ID?',
                            transactionFieldIDFooter: `Sie k\u00F6nnen Transaktionsfeld-IDs in NetSuite finden, indem Sie diese Schritte befolgen:\n\n1. Geben Sie "Transaction Line Fields" in die globale Suche ein.\n2. Klicken Sie auf eine benutzerdefinierte Liste.\n3. Finden Sie die Transaktionsfeld-ID auf der linken Seite.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Wie soll diese benutzerdefinierte Liste in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Eine benutzerdefinierte Liste mit dieser Transaktionsfeld-ID existiert bereits.`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite-Mitarbeiterstandard',
                        description: 'Nicht in Expensify importiert, bei Export angewendet',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Wenn Sie ${importField} in NetSuite verwenden, wenden wir den Standardwert an, der im Mitarbeiterdatensatz festgelegt ist, wenn er in den Spesenbericht oder die Journalbuchung exportiert wird.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Positionsebene',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `${startCase(importField)} wird f\u00FCr jede einzelne Ausgabe in einem Bericht eines Mitarbeiters ausw\u00E4hlbar sein.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Berichtsfelder',
                        description: 'Berichtsebene',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} Auswahl wird auf alle Ausgaben in einem Bericht eines Mitarbeiters angewendet.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-Einrichtung',
            prerequisitesTitle: 'Bevor Sie sich verbinden...',
            downloadExpensifyPackage: 'Laden Sie das Expensify-Paket f\u00FCr Sage Intacct herunter',
            followSteps: 'Befolgen Sie die Schritte in unserer Anleitung: Verbindung zu Sage Intacct herstellen.',
            enterCredentials: 'Geben Sie Ihre Sage Intacct-Anmeldedaten ein',
            entity: 'Entity',
            employeeDefault: 'Sage Intacct Mitarbeiterstandard',
            employeeDefaultDescription: 'Die Standardabteilung des Mitarbeiters wird auf seine Ausgaben in Sage Intacct angewendet, falls eine vorhanden ist.',
            displayedAsTagDescription: 'Die Abteilung wird f\u00FCr jede einzelne Ausgabe in einem Mitarbeiterbericht ausw\u00E4hlbar sein.',
            displayedAsReportFieldDescription: 'Die Abteilungsauswahl wird auf alle Ausgaben im Bericht eines Mitarbeiters angewendet.',
            toggleImportTitleFirstPart: 'W\u00E4hlen Sie, wie Sage Intacct gehandhabt werden soll',
            toggleImportTitleSecondPart: 'in Expensify.',
            expenseTypes: 'Ausgabenarten',
            expenseTypesDescription: 'Ihre Sage Intacct-Ausgabenarten werden in Expensify als Kategorien importiert.',
            accountTypesDescription: 'Ihr Sage Intacct-Kontenplan wird in Expensify als Kategorien importiert.',
            importTaxDescription: 'Kaufsteuersatz aus Sage Intacct importieren.',
            userDefinedDimensions: 'Benutzerdefinierte Dimensionen',
            addUserDefinedDimension: 'Benutzerdefinierte Dimension hinzuf\u00FCgen',
            integrationName: 'Integrationsname',
            dimensionExists: 'Eine Dimension mit diesem Namen existiert bereits.',
            removeDimension: 'Benutzerdefinierte Dimension entfernen',
            removeDimensionPrompt: 'M\u00F6chten Sie diese benutzerdefinierte Dimension wirklich entfernen?',
            userDefinedDimension: 'Benutzerdefinierte Dimension',
            addAUserDefinedDimension: 'Benutzerdefinierte Dimension hinzuf\u00FCgen',
            detailedInstructionsLink: 'Detaillierte Anweisungen anzeigen',
            detailedInstructionsRestOfSentence: 'beim Hinzuf\u00FCgen benutzerdefinierter Dimensionen.',
            userDimensionsAdded: () => ({
                one: '1 UDD hinzugef\u00FCgt',
                other: (count: number) => `${count} UDDs hinzugef\u00FCgt`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'Abteilungen';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'Klassen';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'Standorte';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'Kunden';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'Projekte (Jobs)';
                    default:
                        return 'mappings';
                }
            },
        },
        type: {
            free: 'Kostenlos',
            control: 'Kontrolle',
            collect: 'Sammeln',
        },
        companyCards: {
            addCards: 'Karten hinzuf\u00FCgen',
            selectCards: 'Karten ausw\u00E4hlen',
            addNewCard: {
                other: 'Andere',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: `Wer ist Ihr Kartenanbieter?`,
                whoIsYourBankAccount: 'Wer ist Ihre Bank?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie m\u00F6chten Sie sich mit Ihrer Bank verbinden?',
                learnMoreAboutOptions: {
                    text: 'Erfahren Sie mehr dar\u00FCber',
                    linkText: 'Optionen.',
                },
                commercialFeedDetails:
                    'Erfordert Einrichtung mit Ihrer Bank. Dies wird typischerweise von gr\u00F6\u00DFeren Unternehmen verwendet und ist oft die beste Option, wenn Sie qualifiziert sind.',
                commercialFeedPlaidDetails: `Erfordert die Einrichtung mit Ihrer Bank, aber wir werden Sie anleiten. Dies ist normalerweise auf gr\u00F6\u00DFere Unternehmen beschr\u00E4nkt.`,
                directFeedDetails: 'Der einfachste Ansatz. Verbinden Sie sich sofort mit Ihren Master-Anmeldedaten. Diese Methode ist am h\u00E4ufigsten.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Aktivieren Sie Ihren ${provider}-Feed`,
                    heading:
                        'Wir haben eine direkte Integration mit Ihrem Kartenaussteller und k\u00F6nnen Ihre Transaktionsdaten schnell und genau in Expensify importieren.\n\nUm zu beginnen, einfach:',
                    visa: 'Wir haben globale Integrationen mit Visa, obwohl die Berechtigung je nach Bank und Kartenprogramm variiert.\n\nUm loszulegen, einfach:',
                    mastercard: 'Wir haben globale Integrationen mit Mastercard, obwohl die Berechtigung je nach Bank und Kartenprogramm variiert.\n\nUm loszulegen, einfach:',
                    vcf: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) f\u00FCr detaillierte Anweisungen zur Einrichtung Ihrer Visa Commercial Cards.\n\n2. [Kontaktieren Sie Ihre Bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), um zu \u00FCberpr\u00FCfen, ob sie einen kommerziellen Feed f\u00FCr Ihr Programm unterst\u00FCtzt, und bitten Sie sie, diesen zu aktivieren.\n\n3. *Sobald der Feed aktiviert ist und Sie die Details haben, fahren Sie mit dem n\u00E4chsten Bildschirm fort.*`,
                    gl1025: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), um herauszufinden, ob American Express einen kommerziellen Feed f\u00FCr Ihr Programm aktivieren kann.\n\n2. Sobald der Feed aktiviert ist, wird Amex Ihnen ein Produktionsschreiben zusenden.\n\n3. *Sobald Sie die Feed-Informationen haben, fahren Sie mit dem n\u00E4chsten Bildschirm fort.*`,
                    cdf: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) f\u00FCr detaillierte Anweisungen zur Einrichtung Ihrer Mastercard Commercial Cards.\n\n2. [Kontaktieren Sie Ihre Bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), um zu \u00FCberpr\u00FCfen, ob sie einen kommerziellen Feed f\u00FCr Ihr Programm unterst\u00FCtzt, und bitten Sie sie, diesen zu aktivieren.\n\n3. *Sobald der Feed aktiviert ist und Sie die Details haben, fahren Sie mit dem n\u00E4chsten Bildschirm fort.*`,
                    stripe: `1. Besuchen Sie das Dashboard von Stripe und gehen Sie zu [Einstellungen](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Klicken Sie unter Produktintegrationen auf Aktivieren neben Expensify.\n\n3. Sobald der Feed aktiviert ist, klicken Sie unten auf Absenden und wir werden daran arbeiten, ihn hinzuzuf\u00FCgen.`,
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Geben Sie den Namen der Bank ein',
                feedDetails: {
                    vcf: {
                        title: 'Was sind die Visa-Feed-Details?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'Finanzinstitutions-ID (Bank)',
                        companyLabel: 'Company ID',
                        helpLabel: 'Wo finde ich diese IDs?',
                    },
                    gl1025: {
                        title: `Wie lautet der Amex-Lieferdateiname?`,
                        fileNameLabel: 'Dateiname der Lieferung',
                        helpLabel: 'Wo finde ich den Namen der Lieferdatei?',
                    },
                    cdf: {
                        title: `Wie lautet die Mastercard-Verteilungs-ID?`,
                        distributionLabel: 'Distribution ID',
                        helpLabel: 'Wo finde ich die Vertriebs-ID?',
                    },
                },
                amexCorporate: 'W\u00E4hlen Sie dies aus, wenn auf der Vorderseite Ihrer Karten "Corporate" steht.',
                amexBusiness: 'W\u00E4hlen Sie dies aus, wenn auf der Vorderseite Ihrer Karten \u201EBusiness\u201C steht.',
                amexPersonal: 'W\u00E4hlen Sie dies aus, wenn Ihre Karten privat sind.',
                error: {
                    pleaseSelectProvider: 'Bitte w\u00E4hlen Sie einen Kartenanbieter, bevor Sie fortfahren.',
                    pleaseSelectBankAccount: 'Bitte w\u00E4hlen Sie ein Bankkonto, bevor Sie fortfahren.',
                    pleaseSelectBank: 'Bitte w\u00E4hlen Sie eine Bank aus, bevor Sie fortfahren.',
                    pleaseSelectCountry: 'Bitte w\u00E4hlen Sie ein Land aus, bevor Sie fortfahren.',
                    pleaseSelectFeedType: 'Bitte w\u00E4hlen Sie einen Feed-Typ aus, bevor Sie fortfahren.',
                },
            },
            assignCard: 'Karte zuweisen',
            findCard: 'Karte finden',
            cardNumber: 'Kartennummer',
            commercialFeed: 'Kommerzielle Futter',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName}-Karten`,
            directFeed: 'Direkt-Feed',
            whoNeedsCardAssigned: 'Wer braucht eine Karte zugewiesen?',
            chooseCard: 'W\u00E4hlen Sie eine Karte aus',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `W\u00E4hle eine Karte f\u00FCr ${assignee} aus dem ${feed} Karten-Feed.`,
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken: 'Oder etwas k\u00F6nnte kaputt sein. So oder so, wenn Sie Fragen haben, einfach',
            contactConcierge: 'Kontaktieren Sie Concierge',
            chooseTransactionStartDate: 'W\u00E4hlen Sie ein Startdatum f\u00FCr die Transaktion',
            startDateDescription: 'Wir werden alle Transaktionen ab diesem Datum importieren. Wenn kein Datum angegeben ist, gehen wir so weit zur\u00FCck, wie es Ihre Bank erlaubt.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir werden sofort mit dem Import der Transaktionen beginnen.',
            cardholder: 'Karteninhaber',
            card: 'Karte',
            cardName: 'Kartenname',
            brokenConnectionErrorFirstPart: `Die Verbindung zum Karten-Feed ist unterbrochen. Bitte`,
            brokenConnectionErrorLink: 'Melden Sie sich bei Ihrer Bank an',
            brokenConnectionErrorSecondPart: 'damit wir die Verbindung erneut herstellen k\u00F6nnen.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `hat ${assignee} ein ${link} zugewiesen! Importierte Transaktionen werden in diesem Chat angezeigt.`,
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Karten-Feed ausw\u00E4hlen',
            ukRegulation:
                'Expensify Limited ist ein Vertreter von Plaid Financial Ltd., einem autorisierten Zahlungsinstitut, das von der Financial Conduct Authority gem\u00E4\u00DF den Payment Services Regulations 2017 reguliert wird (Firmennummer: 804718). Plaid bietet Ihnen \u00FCber Expensify Limited als seinen Vertreter regulierte Kontoinformationsdienste an.',
        },
        expensifyCard: {
            issueAndManageCards: 'Geben Sie Ihre Expensify-Karten aus und verwalten Sie sie.',
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
            verificationInProgress: 'Verifizierung l\u00E4uft...',
            verifyingTheDetails: 'Wir \u00FCberpr\u00FCfen ein paar Details. Concierge wird Sie informieren, wenn Expensify-Karten zur Ausgabe bereit sind.',
            disclaimer:
                'Die Expensify Visa\u00AE Commercial Card wird von der The Bancorp Bank, N.A., Mitglied FDIC, gem\u00E4\u00DF einer Lizenz von Visa U.S.A. Inc. ausgestellt und kann nicht bei allen H\u00E4ndlern verwendet werden, die Visa-Karten akzeptieren. Apple\u00AE und das Apple-Logo\u00AE sind Marken von Apple Inc., eingetragen in den USA und anderen L\u00E4ndern. App Store ist eine Dienstleistungsmarke von Apple Inc. Google Play und das Google Play-Logo sind Marken von Google LLC.',
            issueCard: 'Karte ausstellen',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4',
            limit: 'Limit',
            currentBalance: 'Aktueller Kontostand',
            currentBalanceDescription: 'Der aktuelle Kontostand ist die Summe aller gebuchten Expensify Card-Transaktionen, die seit dem letzten Abrechnungsdatum stattgefunden haben.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Der Saldo wird am ${settlementDate} beglichen.`,
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Anforderung zur Erh\u00F6hung des Limits',
            remainingLimitDescription:
                'Wir ber\u00FCcksichtigen eine Reihe von Faktoren bei der Berechnung Ihres verbleibenden Limits: Ihre Dauer als Kunde, die gesch\u00E4ftsbezogenen Informationen, die Sie bei der Anmeldung angegeben haben, und das verf\u00FCgbare Guthaben auf Ihrem Gesch\u00E4ftskonto. Ihr verbleibendes Limit kann t\u00E4glich schwanken.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Der Cash-Back-Saldo basiert auf den abgewickelten monatlichen Ausgaben der Expensify Card in Ihrem Arbeitsbereich.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Einrichtung abschlie\u00DFen',
            chooseBankAccount: 'Bankkonto ausw\u00E4hlen',
            chooseExistingBank: 'W\u00E4hlen Sie ein bestehendes Gesch\u00E4ftskonto aus, um Ihr Expensify Card-Guthaben zu begleichen, oder f\u00FCgen Sie ein neues Bankkonto hinzu.',
            accountEndingIn: 'Konto endet mit',
            addNewBankAccount: 'Ein neues Bankkonto hinzuf\u00FCgen',
            settlementAccount: 'Abrechnungskonto',
            settlementAccountDescription: 'W\u00E4hlen Sie ein Konto aus, um Ihr Expensify Card-Guthaben zu begleichen.',
            settlementAccountInfoPt1: 'Stellen Sie sicher, dass dieses Konto mit Ihrem \u00FCbereinstimmt',
            settlementAccountInfoPt2: 'damit die kontinuierliche Abstimmung ordnungsgem\u00E4\u00DF funktioniert.',
            reconciliationAccount: 'Abstimmungskonto',
            settlementFrequency: 'Abrechnungsfrequenz',
            settlementFrequencyDescription: 'W\u00E4hlen Sie, wie oft Sie Ihr Expensify Card-Guthaben bezahlen m\u00F6chten.',
            settlementFrequencyInfo:
                'Wenn Sie zur monatlichen Abrechnung wechseln m\u00F6chten, m\u00FCssen Sie Ihr Bankkonto \u00FCber Plaid verbinden und eine positive 90-Tage-Saldo-Historie haben.',
            frequency: {
                daily: 'T\u00E4glich',
                monthly: 'Monatlich',
            },
            cardDetails: 'Kartendetails',
            virtual: 'Virtuell',
            physical: 'Physisch',
            deactivate: 'Karte deaktivieren',
            changeCardLimit: 'Kartenlimit \u00E4ndern',
            changeLimit: 'Limit \u00E4ndern',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie das Limit dieser Karte auf ${limit} \u00E4ndern, werden neue Transaktionen abgelehnt, bis Sie weitere Ausgaben auf der Karte genehmigen.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie das Limit dieser Karte auf ${limit} \u00E4ndern, werden neue Transaktionen bis zum n\u00E4chsten Monat abgelehnt.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Wenn Sie das Limit dieser Karte auf ${limit} \u00E4ndern, werden neue Transaktionen abgelehnt.`,
            changeCardLimitType: 'Kartengrenztyp \u00E4ndern',
            changeLimitType: 'Limitentyp \u00E4ndern',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie den Limittyp dieser Karte auf Smart Limit \u00E4ndern, werden neue Transaktionen abgelehnt, da das nicht genehmigte Limit von ${limit} bereits erreicht wurde.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie den Limittyp dieser Karte auf Monatlich \u00E4ndern, werden neue Transaktionen abgelehnt, da das monatliche Limit von ${limit} bereits erreicht wurde.`,
            addShippingDetails: 'Versanddetails hinzuf\u00FCgen',
            issuedCard: ({assignee}: AssigneeParams) => `hat ${assignee} eine Expensify-Karte ausgestellt! Die Karte wird in 2-3 Werktagen ankommen.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `hat ${assignee} eine Expensify-Karte ausgestellt! Die Karte wird versendet, sobald die Versanddetails hinzugef\u00FCgt wurden.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `hat ${assignee} eine virtuelle ${link} ausgestellt! Die Karte kann sofort verwendet werden.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} hat Versanddetails hinzugef\u00FCgt. Die Expensify-Karte wird in 2-3 Werktagen ankommen.`,
            verifyingHeader: '\u00DCberpr\u00FCfung',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird \u00FCberpr\u00FCft...',
            verifyingBankAccountDescription: 'Bitte warten Sie, w\u00E4hrend wir best\u00E4tigen, dass dieses Konto zur Ausstellung von Expensify-Karten verwendet werden kann.',
            bankAccountVerified: 'Bankkonto verifiziert!',
            bankAccountVerifiedDescription: 'Sie k\u00F6nnen jetzt Expensify-Karten an die Mitglieder Ihres Arbeitsbereichs ausgeben.',
            oneMoreStep: 'Noch ein Schritt...',
            oneMoreStepDescription: 'Es sieht so aus, als m\u00FCssten wir Ihr Bankkonto manuell verifizieren. Bitte gehen Sie zu Concierge, wo Ihre Anweisungen auf Sie warten.',
            gotIt: 'Verstanden',
            goToConcierge: 'Gehe zu Concierge',
        },
        categories: {
            deleteCategories: 'Kategorien l\u00F6schen',
            deleteCategoriesPrompt: 'M\u00F6chten Sie diese Kategorien wirklich l\u00F6schen?',
            deleteCategory: 'Kategorie l\u00F6schen',
            deleteCategoryPrompt: 'M\u00F6chten Sie diese Kategorie wirklich l\u00F6schen?',
            disableCategories: 'Kategorien deaktivieren',
            disableCategory: 'Kategorie deaktivieren',
            enableCategories: 'Kategorien aktivieren',
            enableCategory: 'Kategorie aktivieren',
            defaultSpendCategories: 'Standardausgabenkategorien',
            spendCategoriesDescription: 'Passen Sie an, wie H\u00E4ndlerausgaben f\u00FCr Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim L\u00F6schen der Kategorie ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder m\u00FCssen alle Ausgaben kategorisieren.',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle Ausgaben m\u00FCssen kategorisiert werden, um nach ${connectionName} zu exportieren.`,
            subtitle:
                'Verschaffen Sie sich einen besseren \u00DCberblick dar\u00FCber, wo Geld ausgegeben wird. Verwenden Sie unsere Standardkategorien oder f\u00FCgen Sie Ihre eigenen hinzu.',
            emptyCategories: {
                title: 'Sie haben noch keine Kategorien erstellt.',
                subtitle: 'F\u00FCgen Sie eine Kategorie hinzu, um Ihre Ausgaben zu organisieren.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Ihre Kategorien werden derzeit aus einer Buchhaltungsverbindung importiert. Gehen Sie zu',
                subtitle2: 'Buchhaltung',
                subtitle3: 'um \u00C4nderungen vorzunehmen.',
            },
            updateFailureMessage: 'Beim Aktualisieren der Kategorie ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            createFailureMessage: 'Beim Erstellen der Kategorie ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            addCategory: 'Kategorie hinzuf\u00FCgen',
            editCategory: 'Kategorie bearbeiten',
            editCategories: 'Kategorien bearbeiten',
            findCategory: 'Kategorie finden',
            categoryRequiredError: 'Kategoriename ist erforderlich',
            existingCategoryError: 'Eine Kategorie mit diesem Namen existiert bereits',
            invalidCategoryName: 'Ung\u00FCltiger Kategoriename',
            importedFromAccountingSoftware: 'Die untenstehenden Kategorien werden aus Ihrem',
            payrollCode: 'Lohnabrechnungscode',
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Gehaltsabrechnungscodes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            glCode: 'GL-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des GL-Codes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Kann nicht alle Kategorien l\u00F6schen oder deaktivieren',
                description: `Mindestens eine Kategorie muss aktiviert bleiben, da Ihr Arbeitsbereich Kategorien erfordert.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Verwenden Sie die untenstehenden Schalter, um weitere Funktionen zu aktivieren, w\u00E4hrend Sie wachsen. Jede Funktion wird im Navigationsmen\u00FC zur weiteren Anpassung angezeigt.',
            spendSection: {
                title: 'Ausgaben',
                subtitle: 'Aktivieren Sie Funktionen, die Ihnen helfen, Ihr Team zu vergr\u00F6\u00DFern.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'F\u00FCgen Sie Kontrollen hinzu, die helfen, Ausgaben im Rahmen des Budgets zu halten.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Optimieren Sie Ihren Umsatz und werden Sie schneller bezahlt.',
            },
            organizeSection: {
                title: 'Organisieren',
                subtitle: 'Gruppieren und analysieren Sie Ausgaben, erfassen Sie jede gezahlte Steuer.',
            },
            integrateSection: {
                title: 'Integrieren',
                subtitle: 'Verbinden Sie Expensify mit beliebten Finanzprodukten.',
            },
            distanceRates: {
                title: 'Entfernungsraten',
                subtitle: 'Raten hinzuf\u00FCgen, aktualisieren und durchsetzen.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Legen Sie Tagess\u00E4tze fest, um die t\u00E4glichen Ausgaben der Mitarbeiter zu kontrollieren.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Erhalten Sie Einblicke und Kontrolle \u00FCber Ausgaben.',
                disableCardTitle: 'Expensify Card deaktivieren',
                disableCardPrompt: 'Sie k\u00F6nnen die Expensify-Karte nicht deaktivieren, da sie bereits verwendet wird. Wenden Sie sich an Concierge f\u00FCr die n\u00E4chsten Schritte.',
                disableCardButton: 'Chatten Sie mit Concierge',
                feed: {
                    title: 'Holen Sie sich die Expensify Card',
                    subTitle: 'Optimieren Sie Ihre Gesch\u00E4ftsausgaben und sparen Sie bis zu 50 % auf Ihre Expensify-Rechnung, plus:',
                    features: {
                        cashBack: 'Cashback bei jedem Einkauf in den USA',
                        unlimited: 'Unbegrenzte virtuelle Karten',
                        spend: 'Ausgabenkontrollen und benutzerdefinierte Limits',
                    },
                    ctaTitle: 'Neue Karte ausstellen',
                },
            },
            companyCards: {
                title: 'Unternehmenskarten',
                subtitle: 'Ausgaben von vorhandenen Firmenkarten importieren.',
                feed: {
                    title: 'Firmenkarten importieren',
                    features: {
                        support: 'Unterst\u00FCtzung f\u00FCr alle gro\u00DFen Kartenanbieter',
                        assignCards: 'Karten dem gesamten Team zuweisen',
                        automaticImport: 'Automatischer Transaktionsimport',
                    },
                },
                disableCardTitle: 'Unternehmens-Karten deaktivieren',
                disableCardPrompt:
                    'Sie k\u00F6nnen Firmenkarten nicht deaktivieren, da diese Funktion in Gebrauch ist. Wenden Sie sich an den Concierge f\u00FCr die n\u00E4chsten Schritte.',
                disableCardButton: 'Chatten Sie mit Concierge',
                cardDetails: 'Kartendetails',
                cardNumber: 'Kartennummer',
                cardholder: 'Karteninhaber',
                cardName: 'Kartenname',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} Export` : `${integration}-Export`),
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) =>
                    `W\u00E4hlen Sie das ${integration}-Konto aus, in das die Transaktionen exportiert werden sollen.`,
                integrationExportTitlePart: 'W\u00E4hlen Sie eine andere Option aus',
                integrationExportTitleLinkPart: 'Exportoption',
                integrationExportTitleSecondPart: 'um die verf\u00FCgbaren Konten zu \u00E4ndern.',
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Transaktionsstartdatum',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte zuweisen aufheben',
                unassign: 'Zuweisen aufheben',
                unassignCardDescription: 'Das Entfernen dieser Karte wird alle Transaktionen in Entwurfsberichten vom Konto des Karteninhabers entfernen.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Karten-Feed-Name',
                cardFeedNameDescription: 'Geben Sie dem Karten-Feed einen eindeutigen Namen, damit Sie ihn von den anderen unterscheiden k\u00F6nnen.',
                cardFeedTransaction: 'Transaktionen l\u00F6schen',
                cardFeedTransactionDescription: 'W\u00E4hlen Sie, ob Karteninhaber Kartentransaktionen l\u00F6schen k\u00F6nnen. Neue Transaktionen werden diesen Regeln folgen.',
                cardFeedRestrictDeletingTransaction: 'L\u00F6schen von Transaktionen einschr\u00E4nken',
                cardFeedAllowDeletingTransaction: 'L\u00F6schen von Transaktionen erlauben',
                removeCardFeed: 'Karten-Feed entfernen',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `${feedName}-Feed entfernen`,
                removeCardFeedDescription: 'M\u00F6chten Sie diesen Karten-Feed wirklich entfernen? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Der Name des Karten-Feeds ist erforderlich.',
                },
                corporate: 'L\u00F6schen von Transaktionen einschr\u00E4nken',
                personal: 'L\u00F6schen von Transaktionen erlauben',
                setFeedNameDescription: 'Geben Sie dem Karten-Feed einen eindeutigen Namen, damit Sie ihn von den anderen unterscheiden k\u00F6nnen.',
                setTransactionLiabilityDescription: 'Wenn aktiviert, k\u00F6nnen Karteninhaber Kartentransaktionen l\u00F6schen. Neue Transaktionen werden dieser Regel folgen.',
                emptyAddedFeedTitle: 'Unternehmenskarte zuweisen',
                emptyAddedFeedDescription: 'Beginnen Sie, indem Sie Ihr erstes Karte einem Mitglied zuweisen.',
                pendingFeedTitle: `Wir \u00FCberpr\u00FCfen Ihre Anfrage...`,
                pendingFeedDescription: `Wir \u00FCberpr\u00FCfen derzeit Ihre Feed-Details. Sobald das abgeschlossen ist, werden wir uns \u00FCber`,
                pendingBankTitle: '\u00DCberpr\u00FCfen Sie Ihr Browserfenster',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Bitte verbinden Sie sich mit ${bankName} \u00FCber das Browserfenster, das sich gerade ge\u00F6ffnet hat. Falls sich keines ge\u00F6ffnet hat,`,
                pendingBankLink: 'Bitte hier klicken.',
                giveItNameInstruction: 'Geben Sie der Karte einen Namen, der sie von anderen abhebt.',
                updating: 'Aktualisierung...',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: `Arbeitsbereich kann nicht herabgestuft werden`,
                downgradeSubTitleFirstPart: `Dieser Arbeitsbereich kann nicht herabgestuft werden, da mehrere Karten-Feeds verbunden sind (ausgenommen Expensify-Karten). Bitte`,
                downgradeSubTitleMiddlePart: `nur einen Karten-Feed behalten`,
                downgradeSubTitleLastPart: 'um fortzufahren.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Bitte f\u00FCgen Sie das Konto in ${connection} hinzu und synchronisieren Sie die Verbindung erneut.`,
                expensifyCardBannerTitle: 'Holen Sie sich die Expensify Card',
                expensifyCardBannerSubtitle:
                    'Genie\u00DFen Sie Cashback bei jedem Kauf in den USA, bis zu 50 % Rabatt auf Ihre Expensify-Rechnung, unbegrenzte virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Erfahren Sie mehr',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Konfigurieren Sie, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt:
                    'Expensify-Karten in diesem Arbeitsbereich verlassen sich derzeit auf die Genehmigung, um ihre Smart Limits festzulegen. Bitte \u00E4ndern Sie die Limittypen aller Expensify-Karten mit Smart Limits, bevor Sie die Genehmigungen deaktivieren.',
            },
            invoices: {
                title: 'Rechnungen',
                subtitle: 'Rechnungen senden und empfangen.',
            },
            categories: {
                title: 'Kategorien',
                subtitle: 'Verfolgen und organisieren Sie Ausgaben.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Klassifizieren Sie Kosten und verfolgen Sie abrechenbare Ausgaben.',
            },
            taxes: {
                title: 'Steuern',
                subtitle: 'Dokumentieren und fordern Sie erstattungsf\u00E4hige Steuern zur\u00FCck.',
            },
            reportFields: {
                title: 'Berichtsfelder',
                subtitle: 'Benutzerdefinierte Felder f\u00FCr Ausgaben einrichten.',
            },
            connections: {
                title: 'Buchhaltung',
                subtitle: 'Synchronisieren Sie Ihren Kontenplan und mehr.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nicht so schnell...',
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, m\u00FCssen Sie Ihre Buchhaltungsimporteinstellungen \u00E4ndern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, m\u00FCssen Sie Ihre Buchhaltungsverbindung von Ihrem Arbeitsbereich trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell...',
                featureEnabledText:
                    'Expensify-Karten in diesem Arbeitsbereich basieren auf Genehmigungs-Workflows, um ihre Smart Limits zu definieren.\n\nBitte \u00E4ndern Sie die Limittypen aller Karten mit Smart Limits, bevor Sie Workflows deaktivieren.',
                confirmText: 'Gehe zu Expensify-Karten',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Belege anfordern, hohe Ausgaben kennzeichnen und mehr.',
            },
        },
        reportFields: {
            addField: 'Feld hinzuf\u00FCgen',
            delete: 'Feld l\u00F6schen',
            deleteFields: 'Felder l\u00F6schen',
            findReportField: 'Berichtsfeld finden',
            deleteConfirmation: 'M\u00F6chten Sie dieses Berichtsfeld wirklich l\u00F6schen?',
            deleteFieldsConfirmation: 'M\u00F6chten Sie diese Berichtsfelder wirklich l\u00F6schen?',
            emptyReportFields: {
                title: 'Sie haben noch keine Berichts-Felder erstellt.',
                subtitle: 'F\u00FCgen Sie ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten angezeigt wird.',
            },
            subtitle: 'Berichtsfelder gelten f\u00FCr alle Ausgaben und k\u00F6nnen hilfreich sein, wenn Sie nach zus\u00E4tzlichen Informationen fragen m\u00F6chten.',
            disableReportFields: 'Berichtsfelder deaktivieren',
            disableReportFieldsConfirmation: 'Bist du sicher? Text- und Datumsfelder werden gel\u00F6scht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die unten stehenden Berichtsfelder werden aus Ihrem',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            textAlternateText: 'F\u00FCgen Sie ein Feld f\u00FCr die Eingabe von Freitext hinzu.',
            dateAlternateText: 'F\u00FCgen Sie einen Kalender zur Datumsauswahl hinzu.',
            dropdownAlternateText: 'F\u00FCgen Sie eine Liste von Optionen hinzu, aus denen Sie w\u00E4hlen k\u00F6nnen.',
            nameInputSubtitle: 'W\u00E4hlen Sie einen Namen f\u00FCr das Berichtsfeld.',
            typeInputSubtitle: 'W\u00E4hlen Sie aus, welchen Typ von Berichts-Feld Sie verwenden m\u00F6chten.',
            initialValueInputSubtitle: 'Geben Sie einen Startwert ein, der im Berichtsfeld angezeigt werden soll.',
            listValuesInputSubtitle:
                'Diese Werte werden in Ihrem Dropdown-Men\u00FC f\u00FCr das Berichtsfeld angezeigt. Aktivierte Werte k\u00F6nnen von Mitgliedern ausgew\u00E4hlt werden.',
            listInputSubtitle: 'Diese Werte werden in Ihrer Berichtsfeldliste angezeigt. Aktivierte Werte k\u00F6nnen von Mitgliedern ausgew\u00E4hlt werden.',
            deleteValue: 'Wert l\u00F6schen',
            deleteValues: 'Werte l\u00F6schen',
            disableValue: 'Wert deaktivieren',
            disableValues: 'Werte deaktivieren',
            enableValue: 'Wert aktivieren',
            enableValues: 'Werte aktivieren',
            emptyReportFieldsValues: {
                title: 'Sie haben noch keine Listenwerte erstellt.',
                subtitle: 'F\u00FCgen Sie benutzerdefinierte Werte hinzu, die in Berichten angezeigt werden sollen.',
            },
            deleteValuePrompt: 'M\u00F6chten Sie diesen Listeneintrag wirklich l\u00F6schen?',
            deleteValuesPrompt: 'M\u00F6chten Sie diese Listeneintr\u00E4ge wirklich l\u00F6schen?',
            listValueRequiredError: 'Bitte geben Sie einen Namen f\u00FCr den Listeneintrag ein',
            existingListValueError: 'Ein Listenwert mit diesem Namen existiert bereits.',
            editValue: 'Wert bearbeiten',
            listValues: 'Werte auflisten',
            addValue: 'Wert hinzuf\u00FCgen',
            existingReportFieldNameError: 'Ein Berichtsfeld mit diesem Namen existiert bereits.',
            reportFieldNameRequiredError: 'Bitte geben Sie einen Berichts-Feldnamen ein',
            reportFieldTypeRequiredError: 'Bitte w\u00E4hlen Sie einen Berichtsfeldtyp aus',
            reportFieldInitialValueRequiredError: 'Bitte w\u00E4hlen Sie einen Anfangswert f\u00FCr das Berichtsfeld aus',
            genericFailureMessage: 'Beim Aktualisieren des Berichtsfeldes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        tags: {
            tagName: 'Tag-Name',
            requiresTag: 'Mitglieder m\u00FCssen alle Ausgaben kennzeichnen',
            trackBillable: 'Abrechenbare Ausgaben verfolgen',
            customTagName: 'Benutzerdefinierter Tag-Name',
            enableTag: 'Tag aktivieren',
            enableTags: 'Tags aktivieren',
            requireTag: 'Erforderlich',
            requireTags: 'Erforderlich',
            notRequireTags: 'Nicht erforderlich',
            disableTag: 'Tag deaktivieren',
            disableTags: 'Tags deaktivieren',
            addTag: 'Tag hinzuf\u00FCgen',
            editTag: 'Tag bearbeiten',
            editTags: 'Tags bearbeiten',
            findTag: 'Tag finden',
            subtitle: 'Tags bieten detailliertere M\u00F6glichkeiten, Kosten zu klassifizieren.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: ' Sie verwenden ',
                phrase2: 'abhängige Tags',
                phrase3: '. Sie können ',
                phrase4: 'eine Tabelle erneut importieren',
                phrase5: ', um Ihre Tags zu aktualisieren.',
            },

            emptyTags: {
                title: 'Sie haben noch keine Tags erstellt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'F\u00FCgen Sie ein Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitle1: 'Importieren Sie eine Tabelle, um Tags f\u00FCr die Verfolgung von Projekten, Standorten, Abteilungen und mehr hinzuzuf\u00FCgen.',
                subtitle2: 'Mehr erfahren',
                subtitle3: '\u00FCber das Formatieren von Tag-Dateien.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'Ihre Tags werden derzeit aus einer Buchhaltungsverbindung importiert. Gehen Sie zu',
                subtitle2: 'Buchhaltung',
                subtitle3: 'um \u00C4nderungen vorzunehmen.',
            },
            deleteTag: 'Tag l\u00F6schen',
            deleteTags: 'Tags l\u00F6schen',
            deleteTagConfirmation: 'M\u00F6chten Sie dieses Tag wirklich l\u00F6schen?',
            deleteTagsConfirmation: 'M\u00F6chten Sie diese Tags wirklich l\u00F6schen?',
            deleteFailureMessage: 'Beim L\u00F6schen des Tags ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            tagRequiredError: 'Tag-Name ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits.',
            invalidTagNameError: 'Der Tag-Name darf nicht 0 sein. Bitte w\u00E4hlen Sie einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            importedFromAccountingSoftware: 'Die untenstehenden Tags werden aus Ihrem',
            glCode: 'GL-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des GL-Codes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmiger',
            importTags: 'Tags importieren',
            importTagsSupportingText: 'Kodieren Sie Ihre Ausgaben mit einer Art von Tag oder vielen.',
            configureMultiLevelTags: 'Konfigurieren Sie Ihre Liste von Tags f\u00FCr die mehrstufige Kennzeichnung.',
            importMultiLevelTagsSupportingText: `Hier ist eine Vorschau Ihrer Tags. Wenn alles gut aussieht, klicken Sie unten, um sie zu importieren.`,
            importMultiLevelTags: {
                firstRowTitle: 'Die erste Zeile ist der Titel f\u00FCr jede Tag-Liste.',
                independentTags: 'Dies sind unabh\u00E4ngige Tags',
                glAdjacentColumn: 'Es gibt einen GL-Code in der angrenzenden Spalte.',
            },
            tagLevel: {
                singleLevel: 'Einzelne Ebene von Tags',
                multiLevel: 'Mehrstufige Tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-Ebenen wechseln',
                prompt1: 'Das \u00C4ndern der Tag-Ebenen l\u00F6scht alle aktuellen Tags.',
                prompt2: 'Wir empfehlen Ihnen zuerst',
                prompt3: 'ein Backup herunterladen',
                prompt4: 'indem Sie Ihre Tags exportieren.',
                prompt5: 'Mehr erfahren',
                prompt6: 'about tag levels.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Wir haben *${columnCounts} Spalten* in Ihrer Tabelle gefunden. W\u00E4hlen Sie *Name* neben der Spalte aus, die die Tag-Namen enth\u00E4lt. Sie k\u00F6nnen auch *Aktiviert* neben der Spalte ausw\u00E4hlen, die den Tag-Status festlegt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Kann nicht alle Tags l\u00F6schen oder deaktivieren',
                description: `Mindestens ein Tag muss aktiviert bleiben, da Ihr Arbeitsbereich Tags ben\u00F6tigt.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kann nicht alle Tags optional machen',
                description: `Mindestens ein Tag muss erforderlich bleiben, da Ihre Arbeitsbereichseinstellungen Tags erfordern.`,
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Steuernamen, -s\u00E4tze hinzuf\u00FCgen und Standardwerte festlegen.',
            addRate: 'Rate hinzuf\u00FCgen',
            workspaceDefault: 'Standardw\u00E4hrung des Arbeitsbereichs',
            foreignDefault: 'Fremdw\u00E4hrungsstandard',
            customTaxName: 'Benutzerdefinierter Steuername',
            value: 'Wert',
            taxReclaimableOn: 'Steuer r\u00FCckforderbar auf',
            taxRate: 'Steuersatz',
            findTaxRate: 'Steuersatz finden',
            error: {
                taxRateAlreadyExists: 'Dieser Steuername wird bereits verwendet',
                taxCodeAlreadyExists: 'Dieser Steuercode wird bereits verwendet.',
                valuePercentageRange: 'Bitte geben Sie einen g\u00FCltigen Prozentsatz zwischen 0 und 100 ein.',
                customNameRequired: 'Benutzerdefinierter Steuername ist erforderlich',
                deleteFailureMessage: 'Ein Fehler ist aufgetreten beim L\u00F6schen des Steuersatzes. Bitte versuchen Sie es erneut oder bitten Sie Concierge um Hilfe.',
                updateFailureMessage: 'Beim Aktualisieren des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder bitten Sie Concierge um Hilfe.',
                createFailureMessage: 'Beim Erstellen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder bitten Sie Concierge um Hilfe.',
                updateTaxClaimableFailureMessage: 'Der erstattungsf\u00E4hige Teil muss geringer sein als der Distanzsatzbetrag.',
            },
            deleteTaxConfirmation: 'M\u00F6chten Sie diese Steuer wirklich l\u00F6schen?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `M\u00F6chten Sie wirklich ${taxAmount} Steuern l\u00F6schen?`,
            actions: {
                delete: 'L\u00F6schrate',
                deleteMultiple: 'Raten l\u00F6schen',
                enable: 'Rate aktivieren',
                disable: 'Rate deaktivieren',
                enableTaxRates: () => ({
                    one: 'Rate aktivieren',
                    other: 'Raten aktivieren',
                }),
                disableTaxRates: () => ({
                    one: 'Rate deaktivieren',
                    other: 'Raten deaktivieren',
                }),
            },
            importedFromAccountingSoftware: 'Die unten aufgef\u00FChrten Steuern werden aus Ihrem',
            taxCode: 'Steuercode',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        emptyWorkspace: {
            title: 'Erstellen Sie einen Arbeitsbereich',
            subtitle:
                'Erstellen Sie einen Arbeitsbereich, um Belege zu verfolgen, Ausgaben zu erstatten, Reisen zu verwalten, Rechnungen zu versenden und mehr \u2013 alles in der Geschwindigkeit des Chats.',
            createAWorkspaceCTA: 'Loslegen',
            features: {
                trackAndCollect: 'Belege verfolgen und sammeln',
                reimbursements: 'Mitarbeiter erstatten',
                companyCards: 'Firmenkarten verwalten',
            },
            notFound: 'Kein Arbeitsbereich gefunden',
            description:
                'R\u00E4ume sind ein gro\u00DFartiger Ort, um mit mehreren Personen zu diskutieren und zu arbeiten. Um mit der Zusammenarbeit zu beginnen, erstellen Sie einen Arbeitsbereich oder treten Sie einem bei.',
        },
        new: {
            newWorkspace: 'Neuer Arbeitsbereich',
            getTheExpensifyCardAndMore: 'Holen Sie sich die Expensify-Karte und mehr',
            confirmWorkspace: 'Arbeitsbereich best\u00E4tigen',
            myGroupWorkspace: 'Mein Gruppenarbeitsbereich',
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName}'s Arbeitsbereich${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Workspace ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `M\u00F6chten Sie ${memberName} wirklich entfernen?`,
                other: 'M\u00F6chten Sie diese Mitglieder wirklich entfernen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} ist ein Genehmiger in diesem Arbeitsbereich. Wenn Sie diesen Arbeitsbereich nicht mehr mit ihnen teilen, ersetzen wir sie im Genehmigungsworkflow durch den Arbeitsbereichsinhaber, ${ownerName}.`,
            removeMembersTitle: () => ({
                one: 'Mitglied entfernen',
                other: 'Mitglieder entfernen',
            }),
            findMember: 'Mitglied finden',
            removeWorkspaceMemberButtonTitle: 'Aus dem Arbeitsbereich entfernen',
            removeGroupMemberButtonTitle: 'Aus der Gruppe entfernen',
            removeRoomMemberButtonTitle: 'Aus dem Chat entfernen',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `M\u00F6chten Sie ${memberName} wirklich entfernen?`,
            removeMemberTitle: 'Mitglied entfernen',
            transferOwner: 'Besitzer \u00FCbertragen',
            makeMember: 'Mitglied erstellen',
            makeAdmin: 'Zum Admin machen',
            makeAuditor: 'Pr\u00FCfer erstellen',
            selectAll: 'Alle ausw\u00E4hlen',
            error: {
                genericAdd: 'Es gab ein Problem beim Hinzuf\u00FCgen dieses Arbeitsbereichsmitglieds.',
                cannotRemove: 'Sie k\u00F6nnen sich selbst oder den Workspace-Inhaber nicht entfernen.',
                genericRemove: 'Es gab ein Problem beim Entfernen dieses Arbeitsbereichsmitglieds.',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren prim\u00E4ren Logins hinzugef\u00FCgt.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Hinzugef\u00FCgt durch sekund\u00E4res Login ${secondaryLogin}.`,
            membersListTitle: 'Verzeichnis aller Arbeitsbereichsmitglieder.',
            importMembers: 'Mitglieder importieren',
        },
        card: {
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
            issueCard: 'Karte ausstellen',
            issueNewCard: {
                whoNeedsCard: 'Wer braucht eine Karte?',
                findMember: 'Mitglied finden',
                chooseCardType: 'W\u00E4hlen Sie einen Kartentyp aus',
                physicalCard: 'Physische Karte',
                physicalCardDescription: 'Ideal f\u00FCr den h\u00E4ufigen Ausgeber',
                virtualCard: 'Virtuelle Karte',
                virtualCardDescription: 'Sofort und flexibel',
                chooseLimitType: 'W\u00E4hlen Sie einen Limittyp aus',
                smartLimit: 'Smart Limit',
                smartLimitDescription: 'Bis zu einem bestimmten Betrag ausgeben, bevor eine Genehmigung erforderlich ist.',
                monthly: 'Monatlich',
                monthlyDescription: 'Bis zu einem bestimmten Betrag pro Monat ausgeben',
                fixedAmount: 'Fester Betrag',
                fixedAmountDescription: 'Einmalig bis zu einem bestimmten Betrag ausgeben',
                setLimit: 'Ein Limit festlegen',
                cardLimitError: 'Bitte geben Sie einen Betrag von weniger als $21,474,836 ein.',
                giveItName: 'Gib ihm einen Namen',
                giveItNameInstruction: 'Gestalten Sie es einzigartig genug, um es von anderen Karten zu unterscheiden. Spezifische Anwendungsf\u00E4lle sind sogar noch besser!',
                cardName: 'Kartenname',
                letsDoubleCheck: 'Lassen Sie uns noch einmal \u00FCberpr\u00FCfen, ob alles richtig aussieht.',
                willBeReady: 'Diese Karte wird sofort einsatzbereit sein.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Limittyp',
                name: 'Name',
            },
            deactivateCardModal: {
                deactivate: 'Deaktivieren',
                deactivateCard: 'Karte deaktivieren',
                deactivateConfirmation: 'Das Deaktivieren dieser Karte wird alle zuk\u00FCnftigen Transaktionen ablehnen und kann nicht r\u00FCckg\u00E4ngig gemacht werden.',
            },
        },
        accounting: {
            settings: 'Einstellungen',
            title: 'Verbindungen',
            subtitle:
                'Verbinden Sie sich mit Ihrem Buchhaltungssystem, um Transaktionen mit Ihrem Kontenplan zu kodieren, Zahlungen automatisch abzugleichen und Ihre Finanzen synchron zu halten.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatten Sie mit Ihrem Einrichtungsspezialisten.',
            talkYourAccountManager: 'Chatten Sie mit Ihrem Kundenbetreuer.',
            talkToConcierge: 'Chatten Sie mit Concierge.',
            needAnotherAccounting: 'Ben\u00F6tigen Sie eine weitere Buchhaltungssoftware?',
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
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: 'Es gibt einen Fehler mit einer Verbindung, die in Expensify Classic eingerichtet wurde.',
            goToODToFix: 'Gehe zu Expensify Classic, um dieses Problem zu beheben.',
            goToODToSettings: 'Gehe zu Expensify Classic, um deine Einstellungen zu verwalten.',
            setup: 'Verbinden',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Zuletzt synchronisiert ${relativeDate}`,
            notSync: 'Nicht synchronisiert',
            import: 'Importieren',
            export: 'Exportieren',
            advanced: 'Fortgeschritten',
            other: 'Andere',
            syncNow: 'Jetzt synchronisieren',
            disconnect: 'Trennen',
            reinstall: 'Connector neu installieren',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'Integration';
                return `Trennen Sie ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Verbinden ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'Buchhaltungsintegration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Kann keine Verbindung zu QuickBooks Online herstellen';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Kann keine Verbindung zu Xero herstellen';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Keine Verbindung zu NetSuite m\u00F6glich';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Kann keine Verbindung zu QuickBooks Desktop herstellen';
                    default: {
                        return 'Kann keine Verbindung zur Integration herstellen';
                    }
                }
            },
            accounts: 'Kontenplan',
            taxes: 'Steuern',
            imported: 'Importiert',
            notImported: 'Nicht importiert',
            importAsCategory: 'Als Kategorien importiert',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Als Tags importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Nicht importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Nicht importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Als Berichtsfelder importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite-Mitarbeiterstandard',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'diese Integration';
                return `M\u00F6chten Sie ${integrationName} wirklich trennen?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `M\u00F6chten Sie wirklich ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'diese Buchhaltungsintegration'} verbinden? Dadurch werden alle bestehenden Buchhaltungsverbindungen entfernt.`,
            enterCredentials: 'Geben Sie Ihre Anmeldedaten ein',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Kunden importieren';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Mitarbeiter importieren';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Konten importieren';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Klassen importieren';
                        case 'quickbooksOnlineImportLocations':
                            return 'Standorte importieren';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Verarbeitung importierter Daten';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisieren von erstatteten Berichten und Rechnungszahlungen';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importieren von Steuercodes';
                        case 'quickbooksOnlineCheckConnection':
                            return 'QuickBooks Online-Verbindung wird \u00FCberpr\u00FCft';
                        case 'quickbooksOnlineImportMain':
                            return 'Importieren von QuickBooks Online-Daten';
                        case 'startingImportXero':
                            return 'Xero-Daten importieren';
                        case 'startingImportQBO':
                            return 'Importieren von QuickBooks Online-Daten';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importieren von QuickBooks Desktop-Daten';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel importieren';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Zertifikat zur Genehmigung importieren';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensionen importieren';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importieren der Speicherungsrichtlinie';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Daten werden weiterhin mit QuickBooks synchronisiert... Bitte stellen Sie sicher, dass der Web Connector l\u00E4uft.';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronisiere QuickBooks Online-Daten';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Daten werden geladen';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Kategorien aktualisieren';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Kunden/Projekte aktualisieren';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Personenliste aktualisieren';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aktualisieren der Berichts-Felder';
                        case 'jobDone':
                            return 'Warten auf das Laden der importierten Daten';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Kontenplan synchronisieren';
                        case 'xeroSyncImportCategories':
                            return 'Kategorien synchronisieren';
                        case 'xeroSyncImportCustomers':
                            return 'Kunden synchronisieren';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero-Rechnungen und -Rechnungen als bezahlt markieren';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronisiere Tracking-Kategorien';
                        case 'xeroSyncImportBankAccounts':
                            return 'Bankkonten synchronisieren';
                        case 'xeroSyncImportTaxRates':
                            return 'Steuers\u00E4tze werden synchronisiert';
                        case 'xeroCheckConnection':
                            return 'Xero-Verbindung wird \u00FCberpr\u00FCft';
                        case 'xeroSyncTitle':
                            return 'Xero-Daten werden synchronisiert';
                        case 'netSuiteSyncConnection':
                            return 'Initialisiere Verbindung zu NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Kunden importieren';
                        case 'netSuiteSyncInitData':
                            return 'Daten von NetSuite abrufen';
                        case 'netSuiteSyncImportTaxes':
                            return 'Steuern importieren';
                        case 'netSuiteSyncImportItems':
                            return 'Elemente importieren';
                        case 'netSuiteSyncData':
                            return 'Daten in Expensify importieren';
                        case 'netSuiteSyncAccounts':
                            return 'Konten synchronisieren';
                        case 'netSuiteSyncCurrencies':
                            return 'W\u00E4hrungen synchronisieren';
                        case 'netSuiteSyncCategories':
                            return 'Kategorien synchronisieren';
                        case 'netSuiteSyncReportFields':
                            return 'Daten als Expensify-Berichtsfelder importieren';
                        case 'netSuiteSyncTags':
                            return 'Daten als Expensify-Tags importieren';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Verbindungsinformationen werden aktualisiert';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite-Rechnungen und -Fakturen als bezahlt markieren';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importiere Lieferanten';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importieren benutzerdefinierter Listen';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importieren benutzerdefinierter Listen';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importieren von Tochtergesellschaften';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importiere Lieferanten';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct-Verbindung wird \u00FCberpr\u00FCft';
                        case 'intacctImportDimensions':
                            return 'Importieren von Sage Intacct-Dimensionen';
                        case 'intacctImportTitle':
                            return 'Importieren von Sage Intacct-Daten';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `\u00DCbersetzung fehlt f\u00FCr Stufe: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugter Exporteur',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch ein Domain-Admin sein, wenn Sie in den Domain-Einstellungen unterschiedliche Exportkonten f\u00FCr einzelne Firmenkarten festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zum Export in seinem Konto.',
            exportAs: 'Exportieren als',
            exportOutOfPocket: 'Auslagen exportieren als',
            exportCompanyCard: 'Unternehmensausgaben exportieren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardlieferant',
            autoSync: 'Auto-Synchronisierung',
            autoSyncDescription: 'Synchronisieren Sie NetSuite und Expensify automatisch, jeden Tag. Exportieren Sie den finalisierten Bericht in Echtzeit.',
            reimbursedReports: 'Erstattete Berichte synchronisieren',
            cardReconciliation: 'Kartenabstimmung',
            reconciliationAccount: 'Abstimmungskonto',
            continuousReconciliation: 'Kontinuierliche Abstimmung',
            saveHoursOnReconciliation:
                'Sparen Sie Stunden bei der Abstimmung in jeder Buchhaltungsperiode, indem Expensify kontinuierlich Expensify Card-Abrechnungen und -Abwicklungen in Ihrem Namen abstimmt.',
            enableContinuousReconciliation: 'Um die kontinuierliche Abstimmung zu aktivieren, bitte aktivieren Sie',
            chooseReconciliationAccount: {
                chooseBankAccount: 'W\u00E4hlen Sie das Bankkonto aus, gegen das Ihre Expensify Card-Zahlungen abgeglichen werden.',
                accountMatches: 'Stellen Sie sicher, dass dieses Konto mit Ihrem \u00FCbereinstimmt',
                settlementAccount: 'Expensify Card Abrechnungskonto',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(endend mit ${lastFourPAN}), damit die kontinuierliche Abstimmung ordnungsgem\u00E4\u00DF funktioniert.`,
            },
        },
        export: {
            notReadyHeading: 'Nicht bereit zum Exportieren',
            notReadyDescription:
                'Entw\u00FCrfe oder ausstehende Spesenabrechnungen k\u00F6nnen nicht in das Buchhaltungssystem exportiert werden. Bitte genehmigen oder bezahlen Sie diese Ausgaben, bevor Sie sie exportieren.',
        },
        invoices: {
            sendInvoice: 'Rechnung senden',
            sendFrom: 'Senden von',
            invoicingDetails: 'Rechnungsdetails',
            invoicingDetailsDescription: 'Diese Informationen werden auf Ihren Rechnungen erscheinen.',
            companyName: 'Firmenname',
            companyWebsite: 'Unternehmenswebsite',
            paymentMethods: {
                personal: 'Pers\u00F6nlich',
                business: 'Business',
                chooseInvoiceMethod: 'W\u00E4hlen Sie eine Zahlungsmethode unten aus:',
                addBankAccount: 'Bankkonto hinzuf\u00FCgen',
                payingAsIndividual: 'Als Einzelperson bezahlen',
                payingAsBusiness: 'Als Unternehmen bezahlen',
            },
            invoiceBalance: 'Rechnungsbetrag',
            invoiceBalanceSubtitle:
                'Dies ist Ihr aktueller Kontostand aus dem Einzug von Rechnungszahlungen. Er wird automatisch auf Ihr Bankkonto \u00FCberwiesen, wenn Sie eines hinzugef\u00FCgt haben.',
            bankAccountsSubtitle: 'F\u00FCgen Sie ein Bankkonto hinzu, um Rechnungszahlungen zu senden und zu empfangen.',
        },
        invite: {
            member: 'Mitglied einladen',
            members: 'Mitglieder einladen',
            invitePeople: 'Neue Mitglieder einladen',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            pleaseEnterValidLogin: `Bitte stellen Sie sicher, dass die E-Mail-Adresse oder Telefonnummer g\u00FCltig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'Benutzer',
            users: 'Benutzer',
            invited: 'eingeladen',
            removed: 'removed',
            to: 'zu',
            from: 'von',
        },
        inviteMessage: {
            confirmDetails: 'Details best\u00E4tigen',
            inviteMessagePrompt: 'Machen Sie Ihre Einladung besonders, indem Sie unten eine Nachricht hinzuf\u00FCgen!',
            personalMessagePrompt: 'Nachricht',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            inviteNoMembersError: 'Bitte w\u00E4hlen Sie mindestens ein Mitglied zum Einladen aus.',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} hat beantragt, ${workspaceName} beizutreten`,
        },
        distanceRates: {
            oopsNotSoFast: 'Hoppla! Nicht so schnell...',
            workspaceNeeds: 'Ein Arbeitsbereich ben\u00F6tigt mindestens einen aktivierten Distanzsatz.',
            distance: 'Entfernung',
            centrallyManage: 'Verwalten Sie zentral die Tarife, verfolgen Sie in Meilen oder Kilometern und legen Sie eine Standardkategorie fest.',
            rate: 'Bewerten',
            addRate: 'Rate hinzuf\u00FCgen',
            findRate: 'Kurs finden',
            trackTax: 'Steuern verfolgen',
            deleteRates: () => ({
                one: 'L\u00F6schrate',
                other: 'Raten l\u00F6schen',
            }),
            enableRates: () => ({
                one: 'Rate aktivieren',
                other: 'Raten aktivieren',
            }),
            disableRates: () => ({
                one: 'Rate deaktivieren',
                other: 'Raten deaktivieren',
            }),
            enableRate: 'Rate aktivieren',
            status: 'Status',
            unit: 'Einheit',
            taxFeatureNotEnabledMessage: 'Steuern m\u00FCssen im Arbeitsbereich aktiviert sein, um diese Funktion zu nutzen. Gehe zu',
            changePromptMessage: 'um diese \u00C4nderung vorzunehmen.',
            deleteDistanceRate: 'Entfernungssatz l\u00F6schen',
            areYouSureDelete: () => ({
                one: 'M\u00F6chten Sie diesen Satz wirklich l\u00F6schen?',
                other: 'M\u00F6chten Sie diese Tarife wirklich l\u00F6schen?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Beschreibung',
            nameInputLabel: 'Name',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Anfangswert',
            nameInputHelpText: 'Dies ist der Name, den Sie in Ihrem Arbeitsbereich sehen werden.',
            nameIsRequiredError: 'Sie m\u00FCssen Ihrem Arbeitsbereich einen Namen geben',
            currencyInputLabel: 'Standardw\u00E4hrung',
            currencyInputHelpText: 'Alle Ausgaben in diesem Arbeitsbereich werden in diese W\u00E4hrung umgerechnet.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `Die Standardw\u00E4hrung kann nicht ge\u00E4ndert werden, da dieser Arbeitsbereich mit einem ${currency} Bankkonto verkn\u00FCpft ist.`,
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            addressContext: 'Eine Workspace-Adresse ist erforderlich, um Expensify Travel zu aktivieren. Bitte geben Sie eine Adresse ein, die mit Ihrem Unternehmen verbunden ist.',
        },
        bankAccount: {
            continueWithSetup: 'Setup fortsetzen',
            youAreAlmostDone:
                'Sie sind fast fertig mit der Einrichtung Ihres Bankkontos, das es Ihnen erm\u00F6glicht, Firmenkarten auszustellen, Ausgaben zu erstatten, Rechnungen zu sammeln und Rechnungen zu bezahlen.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Pers\u00F6nliche Bankkonten k\u00F6nnen nicht f\u00FCr Zahlungen in Arbeitsbereichen verwendet werden.',
            oneMoreThing: 'Noch eine Sache!',
            allSet: 'Alles erledigt!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszustellen, Ausgaben zu erstatten, Rechnungen einzuziehen und Rechnungen zu bezahlen.',
            letsFinishInChat: 'Lass uns im Chat fertig werden!',
            finishInChat: 'Im Chat beenden',
            almostDone: 'Fast fertig!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Von vorne anfangen',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, trenne mein Bankkonto.',
            yesStartOver: 'Ja, von vorne anfangen.',
            disconnectYour: 'Trennen Sie Ihr',
            bankAccountAnyTransactions: 'Bankkonto. Alle ausstehenden Transaktionen f\u00FCr dieses Konto werden trotzdem abgeschlossen.',
            clearProgress: 'Wenn Sie neu anfangen, wird der bisherige Fortschritt gel\u00F6scht.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Arbeitsbereichsw\u00E4hrung',
            updateCurrencyPrompt:
                'Es sieht so aus, als ob Ihr Arbeitsbereich derzeit auf eine andere W\u00E4hrung als USD eingestellt ist. Bitte klicken Sie auf die Schaltfl\u00E4che unten, um Ihre W\u00E4hrung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'Auf USD aktualisieren',
            updateWorkspaceCurrency: 'Arbeitsbereichsw\u00E4hrung aktualisieren',
            workspaceCurrencyNotSupported: 'Arbeitsbereichsw\u00E4hrung wird nicht unterst\u00FCtzt',
            yourWorkspace: 'Ihr Arbeitsbereich ist auf eine nicht unterst\u00FCtzte W\u00E4hrung eingestellt. Sehen Sie sich die',
            listOfSupportedCurrencies: 'Liste der unterst\u00FCtzten W\u00E4hrungen',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Besitzer \u00FCbertragen',
            addPaymentCardTitle: 'Geben Sie Ihre Zahlungskarte ein, um die Eigent\u00FCmerschaft zu \u00FCbertragen.',
            addPaymentCardButtonText: 'Bedingungen akzeptieren & Zahlungskarte hinzuf\u00FCgen',
            addPaymentCardReadAndAcceptTextPart1: 'Lesen und akzeptieren',
            addPaymentCardReadAndAcceptTextPart2: 'Richtlinie zum Hinzuf\u00FCgen Ihrer Karte',
            addPaymentCardTerms: 'Bedingungen',
            addPaymentCardPrivacy: 'Datenschutz',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'PCI-DSS konform',
            addPaymentCardBankLevelEncrypt: 'Verschl\u00FCsselung auf Bankniveau',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: 'Erfahren Sie mehr \u00FCber unsere',
            addPaymentCardSecurity: 'Sicherheit',
            amountOwedTitle: 'Ausstehender Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText:
                'Dieses Konto hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nM\u00F6chten Sie den Saldo ausgleichen und die Abrechnung f\u00FCr diesen Arbeitsbereich \u00FCbernehmen?',
            ownerOwesAmountTitle: 'Ausstehender Saldo',
            ownerOwesAmountButtonText: 'Guthaben \u00FCbertragen',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Das Konto, dem dieser Arbeitsbereich geh\u00F6rt (${email}), hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nM\u00F6chten Sie diesen Betrag (${amount}) \u00FCberweisen, um die Abrechnung f\u00FCr diesen Arbeitsbereich zu \u00FCbernehmen? Ihre Zahlungskarte wird sofort belastet.`,
            subscriptionTitle: '\u00DCbernahme des Jahresabonnements',
            subscriptionButtonText: 'Abonnement \u00FCbertragen',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Die \u00DCbernahme dieses Arbeitsbereichs wird dessen Jahresabonnement mit Ihrem aktuellen Abonnement zusammenf\u00FChren. Dadurch erh\u00F6ht sich die Gr\u00F6\u00DFe Ihres Abonnements um ${usersCount} Mitglieder, sodass Ihre neue Abonnementgr\u00F6\u00DFe ${finalCount} betr\u00E4gt. M\u00F6chten Sie fortfahren?`,
            duplicateSubscriptionTitle: 'Benachrichtigung \u00FCber doppelte Abonnements',
            duplicateSubscriptionButtonText: 'Fortfahren',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Es sieht so aus, als ob Sie versuchen, die Abrechnung f\u00FCr die Arbeitsbereiche von ${email} zu \u00FCbernehmen. Dazu m\u00FCssen Sie jedoch zuerst Administrator in all ihren Arbeitsbereichen sein.\n\nKlicken Sie auf "Weiter", wenn Sie nur die Abrechnung f\u00FCr den Arbeitsbereich ${workspaceName} \u00FCbernehmen m\u00F6chten.\n\nWenn Sie die Abrechnung f\u00FCr ihr gesamtes Abonnement \u00FCbernehmen m\u00F6chten, lassen Sie sich bitte zuerst als Administrator zu all ihren Arbeitsbereichen hinzuf\u00FCgen, bevor Sie die Abrechnung \u00FCbernehmen.`,
            hasFailedSettlementsTitle: 'Eigentum kann nicht \u00FCbertragen werden',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Sie k\u00F6nnen die Abrechnung nicht \u00FCbernehmen, da ${email} eine \u00FCberf\u00E4llige Expensify Card-Abrechnung hat. Bitte bitten Sie sie, sich an concierge@expensify.com zu wenden, um das Problem zu l\u00F6sen. Dann k\u00F6nnen Sie die Abrechnung f\u00FCr diesen Arbeitsbereich \u00FCbernehmen.`,
            failedToClearBalanceTitle: 'Fehler beim Ausgleichen des Saldos',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuchen Sie es sp\u00E4ter erneut.',
            successTitle: 'Woohoo! Alles bereit.',
            successDescription: 'Sie sind jetzt der Besitzer dieses Arbeitsbereichs.',
            errorTitle: 'Hoppla! Nicht so schnell...',
            errorDescriptionPartOne: 'Es gab ein Problem beim \u00DCbertragen der Eigent\u00FCmerschaft dieses Arbeitsbereichs. Versuchen Sie es erneut, oder',
            errorDescriptionPartTwo: 'Wenden Sie sich an Concierge',
            errorDescriptionPartThree: 'f\u00FCr Hilfe.',
        },
        exportAgainModal: {
            title: 'Vorsicht!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `Die folgenden Berichte wurden bereits nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} exportiert:\n\n${reportName}\n\nM\u00F6chten Sie sie wirklich erneut exportieren?`,
            confirmText: 'Ja, erneut exportieren',
            cancelText: 'Abbrechen',
        },
        upgrade: {
            reportFields: {
                title: 'Berichtsfelder',
                description: `Berichtsfelder erm\u00F6glichen es Ihnen, Details auf Kopfzeilenebene anzugeben, im Gegensatz zu Tags, die sich auf Ausgaben einzelner Positionen beziehen. Diese Details k\u00F6nnen spezifische Projektnamen, Informationen zu Gesch\u00E4ftsreisen, Standorte und mehr umfassen.`,
                onlyAvailableOnPlan: 'Berichtsfelder sind nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Genie\u00DFen Sie die automatische Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + NetSuite-Integration. Gewinnen Sie tiefgehende, Echtzeit-Finanzanalysen mit nativer und benutzerdefinierter Segmentunterst\u00FCtzung, einschlie\u00DFlich Projekt- und Kundenmapping.`,
                onlyAvailableOnPlan: 'Unsere NetSuite-Integration ist nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Genie\u00DFen Sie die automatische Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + Sage Intacct-Integration. Erhalten Sie tiefgehende, Echtzeit-Finanzanalysen mit benutzerdefinierten Dimensionen sowie Spesenkodierung nach Abteilung, Klasse, Standort, Kunde und Projekt (Job).`,
                onlyAvailableOnPlan: 'Unsere Sage Intacct-Integration ist nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Genie\u00DFen Sie die automatische Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + QuickBooks Desktop-Integration. Erreichen Sie ultimative Effizienz mit einer Echtzeit-Zwei-Wege-Verbindung und Spesenkodierung nach Klasse, Artikel, Kunde und Projekt.`,
                onlyAvailableOnPlan: 'Unsere QuickBooks Desktop-Integration ist nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Advanced Approvals',
                description: `Wenn Sie weitere Genehmigungsebenen hinzuf\u00FCgen m\u00F6chten \u2013 oder einfach sicherstellen m\u00F6chten, dass die gr\u00F6\u00DFten Ausgaben von einem weiteren Paar Augen \u00FCberpr\u00FCft werden \u2013 sind Sie bei uns genau richtig. Erweiterte Genehmigungen helfen Ihnen, die richtigen Kontrollen auf jeder Ebene einzurichten, damit Sie die Ausgaben Ihres Teams im Griff behalten.`,
                onlyAvailableOnPlan: 'Erweiterte Genehmigungen sind nur im Control-Plan verf\u00FCgbar, der bei',
            },
            categories: {
                title: 'Kategorien',
                description: `Kategorien helfen Ihnen, Ausgaben besser zu organisieren, um den \u00DCberblick dar\u00FCber zu behalten, wo Sie Ihr Geld ausgeben. Verwenden Sie unsere vorgeschlagene Kategorienliste oder erstellen Sie Ihre eigenen.`,
                onlyAvailableOnPlan: 'Kategorien sind im Collect-Plan verf\u00FCgbar, beginnend bei',
            },
            glCodes: {
                title: 'GL-Codes',
                description: `F\u00FCgen Sie GL-Codes zu Ihren Kategorien und Tags hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: 'GL-Codes sind nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            glAndPayrollCodes: {
                title: 'GL- & Payroll-Codes',
                description: `F\u00FCgen Sie GL- und Payroll-Codes zu Ihren Kategorien hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: 'GL- und Payroll-Codes sind nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            taxCodes: {
                title: 'Steuercodes',
                description: `F\u00FCgen Sie Ihren Steuern Steuercodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: 'Steuercodes sind nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            companyCards: {
                title: 'Unbegrenzte Firmenkarten',
                description: `M\u00FCssen Sie weitere Karten-Feeds hinzuf\u00FCgen? Schalten Sie unbegrenzte Firmenkarten frei, um Transaktionen von allen gro\u00DFen Kartenausstellern zu synchronisieren.`,
                onlyAvailableOnPlan: 'Dies ist nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            rules: {
                title: 'Regeln',
                description: `Regeln laufen im Hintergrund und halten Ihre Ausgaben unter Kontrolle, damit Sie sich nicht um Kleinigkeiten k\u00FCmmern m\u00FCssen.\n\nFordern Sie Ausgabendetails wie Belege und Beschreibungen an, setzen Sie Limits und Standards, und automatisieren Sie Genehmigungen und Zahlungen \u2013 alles an einem Ort.`,
                onlyAvailableOnPlan: 'Regeln sind nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            perDiem: {
                title: 'Per diem',
                description:
                    'Per Diem ist eine gro\u00DFartige M\u00F6glichkeit, um Ihre t\u00E4glichen Kosten konform und vorhersehbar zu halten, wenn Ihre Mitarbeiter reisen. Genie\u00DFen Sie Funktionen wie benutzerdefinierte Raten, Standardkategorien und detailliertere Informationen wie Ziele und Unterraten.',
                onlyAvailableOnPlan: 'Per Diem sind nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            travel: {
                title: 'Reise',
                description:
                    'Expensify Travel ist eine neue Plattform f\u00FCr die Buchung und Verwaltung von Gesch\u00E4ftsreisen, die es Mitgliedern erm\u00F6glicht, Unterk\u00FCnfte, Fl\u00FCge, Transportmittel und mehr zu buchen.',
                onlyAvailableOnPlan: 'Reisen ist im Collect-Plan verf\u00FCgbar, beginnend bei',
            },
            multiLevelTags: {
                title: 'Mehrstufige Tags',
                description:
                    'Mit mehrstufigen Tags k\u00F6nnen Sie Ausgaben pr\u00E4ziser nachverfolgen. Weisen Sie jedem Posten mehrere Tags zu \u2013 wie Abteilung, Kunde oder Kostenstelle \u2013, um den vollst\u00E4ndigen Kontext jeder Ausgabe zu erfassen. Dies erm\u00F6glicht detailliertere Berichte, Genehmigungs-Workflows und Buchhaltungsexporte.',
                onlyAvailableOnPlan: 'Mehrstufige Tags sind nur im Control-Plan verf\u00FCgbar, beginnend bei',
            },
            pricing: {
                perActiveMember: 'pro aktivem Mitglied pro Monat.',
                perMember: 'pro Mitglied pro Monat.',
            },
            note: {
                upgradeWorkspace: 'Aktualisieren Sie Ihren Arbeitsbereich, um auf diese Funktion zuzugreifen, oder',
                learnMore: 'mehr erfahren',
                aboutOurPlans: '\u00FCber unsere Pl\u00E4ne und Preise.',
            },
            upgradeToUnlock: 'Diese Funktion freischalten',
            completed: {
                headline: `Sie haben Ihr Arbeitsbereich-Upgrade abgeschlossen!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Sie haben ${policyName} erfolgreich auf den Control-Plan hochgestuft!`,
                categorizeMessage: `Sie haben erfolgreich auf einen Workspace im Collect-Plan umgestellt. Jetzt k\u00F6nnen Sie Ihre Ausgaben kategorisieren!`,
                travelMessage: `Sie haben erfolgreich auf einen Workspace im Collect-Plan upgegradet. Jetzt k\u00F6nnen Sie mit der Buchung und Verwaltung von Reisen beginnen!`,
                viewSubscription: 'Abonnement anzeigen',
                moreDetails: 'f\u00FCr weitere Details.',
                gotIt: 'Verstanden, danke.',
            },
            commonFeatures: {
                title: 'Upgrade auf den Control-Plan',
                note: 'Entsperren Sie unsere leistungsst\u00E4rksten Funktionen, einschlie\u00DFlich:',
                benefits: {
                    startsAt: 'Der Control-Plan beginnt bei',
                    perMember: 'pro aktivem Mitglied pro Monat.',
                    learnMore: 'Erfahren Sie mehr',
                    pricing: '\u00FCber unsere Pl\u00E4ne und Preise.',
                    benefit1: 'Erweiterte Buchhaltungsverbindungen (NetSuite, Sage Intacct und mehr)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsworkflows auf mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    toUpgrade: 'Zum Upgrade klicken',
                    selectWorkspace: 'w\u00E4hlen Sie einen Arbeitsbereich aus und \u00E4ndern Sie den Plantyp in',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Auf den Collect-Plan herabstufen',
                note: 'Wenn Sie ein Downgrade durchf\u00FChren, verlieren Sie den Zugriff auf diese Funktionen und mehr:',
                benefits: {
                    note: 'F\u00FCr einen vollst\u00E4ndigen Vergleich unserer Pl\u00E4ne, schauen Sie sich unsere',
                    pricingPage: 'Preisseite',
                    confirm: 'M\u00F6chten Sie wirklich herabstufen und Ihre Konfigurationen entfernen?',
                    warning: 'Dies kann nicht r\u00FCckg\u00E4ngig gemacht werden.',
                    benefit1: 'Buchhaltungsverbindungen (au\u00DFer QuickBooks Online und Xero)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsworkflows auf mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote:
                        'Sie m\u00FCssen alle Ihre Arbeitsbereiche herabstufen, bevor Ihre erste monatliche Zahlung erfolgt, um ein Abonnement zum Collect-Tarif zu beginnen. Klicken Sie',
                    selectStep: '> W\u00E4hlen Sie jeden Arbeitsbereich aus > \u00E4ndern Sie den Plantyp zu',
                },
            },
            completed: {
                headline: 'Ihr Arbeitsbereich wurde herabgestuft',
                description: 'Sie haben andere Arbeitsbereiche im Control-Plan. Um zum Collect-Tarif abgerechnet zu werden, m\u00FCssen Sie alle Arbeitsbereiche herabstufen.',
                gotIt: 'Verstanden, danke.',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & herabstufen',
            headline: 'Ihre endg\u00FCltige Zahlung',
            description1: 'Ihre endg\u00FCltige Rechnung f\u00FCr dieses Abonnement wird sein',
            description2: ({date}: DateParams) => `Sehen Sie Ihre Aufschl\u00FCsselung unten f\u00FCr ${date}:`,
            subscription:
                'Achtung! Diese Aktion wird Ihr Expensify-Abonnement beenden, diesen Arbeitsbereich l\u00F6schen und alle Mitglieder des Arbeitsbereichs entfernen. Wenn Sie diesen Arbeitsbereich behalten und nur sich selbst entfernen m\u00F6chten, lassen Sie zuerst einen anderen Administrator die Abrechnung \u00FCbernehmen.',
            genericFailureMessage: 'Beim Bezahlen Ihrer Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Aktionen im ${workspaceName}-Arbeitsbereich sind derzeit eingeschr\u00E4nkt.`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Workspace-Inhaber, ${workspaceOwnerName}, muss die hinterlegte Zahlungskarte hinzuf\u00FCgen oder aktualisieren, um neue Workspace-Aktivit\u00E4ten freizuschalten.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Sie m\u00FCssen die hinterlegte Zahlungskarte hinzuf\u00FCgen oder aktualisieren, um neue Arbeitsbereichsaktivit\u00E4ten freizuschalten.',
            addPaymentCardToUnlock: 'F\u00FCgen Sie eine Zahlungskarte hinzu, um freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'F\u00FCgen Sie eine Zahlungskarte hinzu, um diesen Arbeitsbereich weiterhin zu nutzen.',
            pleaseReachOutToYourWorkspaceAdmin: 'Bitte wenden Sie sich bei Fragen an Ihren Workspace-Administrator.',
            chatWithYourAdmin: 'Chatte mit deinem Admin',
            chatInAdmins: 'Chat im #admins',
            addPaymentCard: 'Zahlungskarte hinzuf\u00FCgen',
        },
        rules: {
            individualExpenseRules: {
                title: 'Ausgaben',
                subtitle: 'Legen Sie Ausgabenkontrollen und Standardwerte f\u00FCr einzelne Ausgaben fest. Sie k\u00F6nnen auch Regeln f\u00FCr',
                receiptRequiredAmount: 'Beleg erforderlicher Betrag',
                receiptRequiredAmountDescription: 'Belege anfordern, wenn die Ausgaben diesen Betrag \u00FCberschreiten, es sei denn, eine Kategorievorschrift hebt dies auf.',
                maxExpenseAmount: 'Maximaler Ausgabenbetrag',
                maxExpenseAmountDescription: 'Kennzeichnen Sie Ausgaben, die diesen Betrag \u00FCberschreiten, es sei denn, sie werden durch eine Kategorieregel au\u00DFer Kraft gesetzt.',
                maxAge: 'Maximalalter',
                maxExpenseAge: 'Maximales Ausgabenalter',
                maxExpenseAgeDescription: 'Kennzeichnen Sie Ausgaben, die \u00E4lter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: () => ({
                    one: '1 Tag',
                    other: (count: number) => `${count} Tage`,
                }),
                billableDefault: 'Abrechnungsstandard',
                billableDefaultDescription:
                    'W\u00E4hlen Sie, ob Bar- und Kreditkartenausgaben standardm\u00E4\u00DFig abrechenbar sein sollen. Abrechenbare Ausgaben werden aktiviert oder deaktiviert in',
                billable: 'Abrechenbar',
                billableDescription: 'Ausgaben werden am h\u00E4ufigsten an Kunden weiterberechnet.',
                nonBillable: 'Nicht abrechenbar',
                nonBillableDescription: 'Spesen werden gelegentlich an Kunden weiterberechnet.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'eReceipts werden automatisch erstellt',
                eReceiptsHintLink: 'f\u00FCr die meisten USD-Kredittransaktionen',
                attendeeTracking: 'Teilnehmerverfolgung',
                attendeeTrackingHint: 'Verfolgen Sie die Kosten pro Person f\u00FCr jede Ausgabe.',
                prohibitedDefaultDescription:
                    'Markiere alle Belege, auf denen Alkohol, Gl\u00FCcksspiel oder andere eingeschr\u00E4nkte Artikel erscheinen. Ausgaben mit Belegen, auf denen diese Posten erscheinen, erfordern eine manuelle \u00DCberpr\u00FCfung.',
                prohibitedExpenses: 'Verbotene Ausgaben',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Hotelnebenkosten',
                gambling: 'Gl\u00FCcksspiel',
                tobacco: 'Tabak',
                adultEntertainment: 'Erwachsenenunterhaltung',
            },
            expenseReportRules: {
                examples: 'Beispiele:',
                title: 'Spesenabrechnungen',
                subtitle: 'Automatisieren Sie die Einhaltung von Spesenabrechnungen, Genehmigungen und Zahlungen.',
                customReportNamesSubtitle: 'Passen Sie Berichtstitel mit unserem an',
                customNameTitle: 'Standardberichtstitel',
                customNameDescription: 'W\u00E4hlen Sie einen benutzerdefinierten Namen f\u00FCr Spesenabrechnungen mit unserem',
                customNameDescriptionLink: 'umfassende Formeln',
                customNameInputLabel: 'Name',
                customNameEmailPhoneExample: 'E-Mail oder Telefon des Mitglieds: {report:submit:from}',
                customNameStartDateExample: 'Berichtsstartdatum: {report:startdate}',
                customNameWorkspaceNameExample: 'Arbeitsbereichsname: {report:workspacename}',
                customNameReportIDExample: 'Report-ID: {report:id}',
                customNameTotalExample: 'Gesamt: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Verhindern, dass Mitglieder benutzerdefinierte Berichtsnamen \u00E4ndern',
                preventSelfApprovalsTitle: 'Selbstgenehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindern Sie, dass Arbeitsbereichsmitglieder ihre eigenen Spesenabrechnungen genehmigen.',
                autoApproveCompliantReportsTitle: 'Berichte, die den Anforderungen entsprechen, automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen f\u00FCr die automatische Genehmigung infrage kommen.',
                autoApproveReportsUnderTitle: 'Berichte automatisch genehmigen unter',
                autoApproveReportsUnderDescription: 'Vollst\u00E4ndig konforme Spesenabrechnungen unter diesem Betrag werden automatisch genehmigt.',
                randomReportAuditTitle: 'Zuf\u00E4llige Berichtpr\u00FCfung',
                randomReportAuditDescription: 'Einige Berichte m\u00FCssen manuell genehmigt werden, auch wenn sie f\u00FCr die automatische Genehmigung in Frage kommen.',
                autoPayApprovedReportsTitle: 'Genehmigte Berichte automatisch bezahlen',
                autoPayApprovedReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen f\u00FCr die automatische Bezahlung berechtigt sind.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Bitte geben Sie einen Betrag von weniger als ${currency ?? ''}20.000 ein.`,
                autoPayApprovedReportsLockedSubtitle: 'Gehe zu weiteren Funktionen und aktiviere Workflows, dann f\u00FCge Zahlungen hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Automatisch bezahlte Berichte unter',
                autoPayReportsUnderDescription: 'Vollst\u00E4ndig konforme Spesenabrechnungen unter diesem Betrag werden automatisch bezahlt.',
                unlockFeatureGoToSubtitle: 'Gehe zu',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) =>
                    `und Workflows aktivieren, dann ${featureName} hinzuf\u00FCgen, um diese Funktion freizuschalten.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `und aktivieren Sie ${featureName}, um diese Funktion freizuschalten.`,
            },
            categoryRules: {
                title: 'Kategorierichtlinien',
                approver: 'Genehmiger',
                requireDescription: 'Beschreibung erforderlich',
                descriptionHint: 'Beschreibungshinweis',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Erinnern Sie die Mitarbeiter daran, zus\u00E4tzliche Informationen f\u00FCr Ausgaben der Kategorie \u201E${categoryName}\u201C bereitzustellen. Dieser Hinweis erscheint im Beschreibungsfeld der Ausgaben.`,
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je k\u00FCrzer, desto besser!',
                maxAmount: 'Maximalbetrag',
                flagAmountsOver: 'Betr\u00E4ge \u00FCber kennzeichnen',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Gilt f\u00FCr die Kategorie \u201E${categoryName}\u201C.`,
                flagAmountsOverSubtitle: 'Dies \u00FCberschreibt den H\u00F6chstbetrag f\u00FCr alle Ausgaben.',
                expenseLimitTypes: {
                    expense: 'Einzelausgabe',
                    expenseSubtitle:
                        'Kennzeichnen Sie Ausgabenbetr\u00E4ge nach Kategorie. Diese Regel \u00FCberschreibt die allgemeine Arbeitsbereichsregel f\u00FCr den maximalen Ausgabenbetrag.',
                    daily: 'Kategorietotal',
                    dailySubtitle: 'Gesamtausgaben pro Kategorie f\u00FCr jeden Spesenbericht kennzeichnen.',
                },
                requireReceiptsOver: 'Belege \u00FCber erforderlich',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standardwert`,
                    never: 'Belege niemals verlangen',
                    always: 'Belege immer erforderlich',
                },
                defaultTaxRate: 'Standardsteuersatz',
                goTo: 'Gehe zu',
                andEnableWorkflows: 'und Workflows aktivieren, dann Genehmigungen hinzuf\u00FCgen, um diese Funktion freizuschalten.',
            },
            customRules: {
                title: 'Benutzerdefinierte Regeln',
                subtitle: 'Beschreibung',
                description: 'Benutzerdefinierte Regeln f\u00FCr Spesenabrechnungen eingeben',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Sammeln',
                    description: 'F\u00FCr Teams, die ihre Prozesse automatisieren m\u00F6chten.',
                },
                corporate: {
                    label: 'Kontrolle',
                    description: 'F\u00FCr Organisationen mit erweiterten Anforderungen.',
                },
            },
            description: 'W\u00E4hlen Sie einen Plan, der zu Ihnen passt. F\u00FCr eine detaillierte Liste der Funktionen und Preise, schauen Sie sich unsere',
            subscriptionLink: 'Tarifarten und Preishilfe-Seite',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu 1 aktivem Mitglied im Control-Plan verpflichtet. Sie k\u00F6nnen ab dem ${annualSubscriptionEndDate} zu einem nutzungsabh\u00E4ngigen Abonnement wechseln und zum Collect-Plan herabstufen, indem Sie die automatische Verl\u00E4ngerung deaktivieren.`,
                other: `Sie haben sich zu ${count} aktiven Mitgliedern im Control-Plan verpflichtet, bis Ihr Jahresabonnement am ${annualSubscriptionEndDate} endet. Sie k\u00F6nnen zu einem nutzungsabh\u00E4ngigen Abonnement wechseln und ab dem ${annualSubscriptionEndDate} zum Collect-Plan herabstufen, indem Sie die automatische Verl\u00E4ngerung deaktivieren.`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um Ihren Weg zur Gro\u00DFartigkeit freizumachen!',
        description: 'W\u00E4hlen Sie aus den untenstehenden Support-Optionen:',
        chatWithConcierge: 'Chatten Sie mit Concierge',
        scheduleSetupCall: 'Einen Einrichtungstermin vereinbaren',
        scheduleACall: 'Anruf planen',
        questionMarkButtonTooltip: 'Holen Sie sich Unterst\u00FCtzung von unserem Team',
        exploreHelpDocs: 'Hilfe-Dokumente durchsuchen',
        registerForWebinar: 'F\u00FCr Webinar registrieren',
        onboardingHelp: 'Hilfe bei der Einf\u00FChrung',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Standard-Hautton \u00E4ndern',
        headers: {
            frequentlyUsed: 'H\u00E4ufig verwendet',
            smileysAndEmotion: 'Smileys & Emotion',
            peopleAndBody: 'Menschen & K\u00F6rper',
            animalsAndNature: 'Tiere & Natur',
            foodAndDrink: 'Essen & Getr\u00E4nke',
            travelAndPlaces: 'Reisen & Orte',
            activities: 'Aktivit\u00E4ten',
            objects: 'Objekte',
            symbols: 'Symbole',
            flags: 'Flaggen',
        },
    },
    newRoomPage: {
        newRoom: 'Neuer Raum',
        groupName: 'Gruppenname',
        roomName: 'Raumname',
        visibility: 'Sichtbarkeit',
        restrictedDescription: 'Personen in Ihrem Arbeitsbereich k\u00F6nnen diesen Raum finden.',
        privateDescription: 'Personen, die zu diesem Raum eingeladen wurden, k\u00F6nnen ihn finden.',
        publicDescription: 'Jeder kann diesen Raum finden.',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Jeder kann diesen Raum finden.',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} ist ein Standardraum in allen Arbeitsbereichen. Bitte w\u00E4hle einen anderen Namen.`,
        roomNameInvalidError: 'Raumnamen d\u00FCrfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.',
        pleaseEnterRoomName: 'Bitte geben Sie einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte w\u00E4hlen Sie einen Arbeitsbereich aus',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}umbenannt in "${newName}" (zuvor "${oldName}")` : `${actor} hat diesen Raum in "${newName}" umbenannt (vorher "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Raum umbenannt in ${newName}`,
        social: 'sozial',
        selectAWorkspace: 'W\u00E4hlen Sie einen Arbeitsbereich aus',
        growlMessageOnRenameError: 'Der Arbeitsbereichsraum kann nicht umbenannt werden. Bitte \u00FCberpr\u00FCfen Sie Ihre Verbindung und versuchen Sie es erneut.',
        visibilityOptions: {
            restricted: 'Arbeitsbereich', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privat',
            public: '\u00D6ffentlich',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: '\u00D6ffentliche Ank\u00FCndigung',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Einreichen und Schlie\u00DFen',
        submitAndApprove: 'Einreichen und Genehmigen',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `hinzugef\u00FCgt ${approverName} (${approverEmail}) als Genehmiger f\u00FCr das ${field} "${name}"`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `hat ${approverName} (${approverEmail}) als Genehmiger f\u00FCr das ${field} "${name}" entfernt`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `hat den Genehmiger f\u00FCr das ${field} "${name}" auf ${formatApprover(newApproverName, newApproverEmail)} ge\u00E4ndert (zuvor ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie "${categoryName}" hinzugef\u00FCgt`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie "${categoryName}" entfernt`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'deaktiviert' : 'aktiviert'} die Kategorie "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `hat den Gehaltsabrechnungscode "${newValue}" zur Kategorie "${categoryName}" hinzugef\u00FCgt`;
            }
            if (!newValue && oldValue) {
                return `hat den Gehaltsabrechnungscode "${oldValue}" aus der Kategorie "${categoryName}" entfernt`;
            }
            return `hat den Lohncode der Kategorie \u201E${categoryName}\u201C in \u201E${newValue}\u201C ge\u00E4ndert (vorher \u201E${oldValue}\u201C)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `hat den GL-Code "${newValue}" zur Kategorie "${categoryName}" hinzugef\u00FCgt`;
            }
            if (!newValue && oldValue) {
                return `hat den GL-Code "${oldValue}" aus der Kategorie "${categoryName}" entfernt`;
            }
            return `hat den GL-Code der Kategorie \u201E${categoryName}\u201C in \u201E${newValue}\u201C ge\u00E4ndert (vorher \u201E${oldValue}\u201C)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `hat die Beschreibung der Kategorie "${categoryName}" in ${!oldValue ? 'erforderlich' : 'nicht erforderlich'} ge\u00E4ndert (vorher ${!oldValue ? 'nicht erforderlich' : 'erforderlich'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `hat einen maximalen Betrag von ${newAmount} zur Kategorie "${categoryName}" hinzugef\u00FCgt`;
            }
            if (oldAmount && !newAmount) {
                return `hat den maximalen Betrag von ${oldAmount} aus der Kategorie "${categoryName}" entfernt`;
            }
            return `hat den maximalen Betrag der Kategorie "${categoryName}" auf ${newAmount} ge\u00E4ndert (vorher ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `hat einen Grenzwerttyp von ${newValue} zur Kategorie "${categoryName}" hinzugef\u00FCgt`;
            }
            return `hat den Grenzwerttyp der Kategorie "${categoryName}" auf ${newValue} ge\u00E4ndert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie "${categoryName}" aktualisiert, indem Belege in ${newValue} ge\u00E4ndert wurden`;
            }
            return `hat die Kategorie "${categoryName}" in ${newValue} ge\u00E4ndert (vorher ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat die Kategorie "${oldName}" in "${newName}" umbenannt`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `hat den Beschreibungshinweis "${oldValue}" aus der Kategorie "${categoryName}" entfernt`;
            }
            return !oldValue
                ? `hat den Beschreibungshinweis "${newValue}" zur Kategorie "${categoryName}" hinzugef\u00FCgt`
                : `\u00E4nderte den Hinweis zur Kategoriebeschreibung "${categoryName}" in \u201E${newValue}\u201C (zuvor \u201E${oldValue}\u201C)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `den Namen der Tag-Liste in "${newName}" ge\u00E4ndert (zuvor "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag "${tagName}" zur Liste "${tagListName}" hinzugef\u00FCgt`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `hat die Tag-Liste "${tagListName}" aktualisiert, indem das Tag "${oldName}" in "${newName}" ge\u00E4ndert wurde.`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'aktiviert' : 'deaktiviert'} das Tag "${tagName}" in der Liste "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag "${tagName}" aus der Liste "${tagListName}" entfernt`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `"${count}" Tags aus der Liste "${tagListName}" entfernt`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `hat das Tag "${tagName}" in der Liste "${tagListName}" aktualisiert, indem das ${updatedField} auf "${newValue}" ge\u00E4ndert wurde (zuvor "${oldValue}")`;
            }
            return `hat das Tag "${tagName}" in der Liste "${tagListName}" aktualisiert, indem ein ${updatedField} von "${newValue}" hinzugef\u00FCgt wurde.`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `\u00E4nderte die ${customUnitName} ${updatedField} zu "${newValue}" (zuvor "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung bei Entfernungsraten`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `hat einen neuen "${customUnitName}"-Satz "${rateName}" hinzugef\u00FCgt`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `hat den Satz des ${customUnitName} ${updatedField} "${customUnitRateName}" auf "${newValue}" ge\u00E4ndert (zuvor "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `hat den Steuersatz f\u00FCr den Entfernungsrate "${customUnitRateName}" auf "${newValue} (${newTaxPercentage})" ge\u00E4ndert (zuvor "${oldValue} (${oldTaxPercentage})")`;
            }
            return `hat den Steuersatz "${newValue} (${newTaxPercentage})" zum Distanzsatz "${customUnitRateName}" hinzugef\u00FCgt`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `hat den steuerlich absetzbaren Anteil am Distanzsatz "${customUnitRateName}" auf "${newValue}" ge\u00E4ndert (vorher "${oldValue}")`;
            }
            return `hat einen steuerlich absetzbaren Anteil von "${newValue}" zum Distanzsatz "${customUnitRateName}" hinzugef\u00FCgt`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `"${customUnitName}" Rate "${rateName}" entfernt`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `hinzugef\u00FCgtes ${fieldType}-Berichtsfeld "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `den Standardwert des Berichtsfelds "${fieldName}" auf "${defaultValue}" setzen`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option "${optionName}" zum Berichtsfeld "${fieldName}" hinzugef\u00FCgt`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option "${optionName}" aus dem Berichtsfeld "${fieldName}" entfernt`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'aktiviert' : 'deaktiviert'} die Option "${optionName}" f\u00FCr das Berichtsfeld "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'aktiviert' : 'deaktiviert'} alle Optionen f\u00FCr das Berichtsfeld "${fieldName}"`;
            }
            return `${allEnabled ? 'aktiviert' : 'deaktiviert'} die Option "${optionName}" f\u00FCr das Berichtsfeld "${fieldName}", wodurch alle Optionen ${allEnabled ? 'aktiviert' : 'deaktiviert'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `entferntes ${fieldType} Berichts-Feld "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `aktualisiert "Prevent self-approval" auf "${newValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}" (zuvor "${oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat den maximal erforderlichen Belegbetrag auf ${newValue} ge\u00E4ndert (zuvor ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat den maximalen Spesenbetrag f\u00FCr Verst\u00F6\u00DFe auf ${newValue} ge\u00E4ndert (vorher ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aktualisiert "Maximales Ausgabenalter (Tage)" auf "${newValue}" (zuvor "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `Legen Sie das Datum f\u00FCr die Einreichung des Monatsberichts auf "${newValue}" fest.`;
            }
            return `das Einreichungsdatum des monatlichen Berichts auf "${newValue}" (zuvor "${oldValue}") aktualisiert`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aktualisiert "Ausgaben an Kunden weiterberechnen" auf "${newValue}" (zuvor "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `"Standardberichtstitel erzwingen" ${value ? 'auf' : 'aus'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `hat den Namen dieses Arbeitsbereichs in "${newName}" ge\u00E4ndert (vorher "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `Setzen Sie die Beschreibung dieses Arbeitsbereichs auf "${newDescription}"`
                : `hat die Beschreibung dieses Arbeitsbereichs auf "${newDescription}" aktualisiert (vorher "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('und');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `hat Sie aus dem Genehmigungs-Workflow und dem Ausgaben-Chat von ${joinedNames} entfernt. Bereits eingereichte Berichte bleiben zur Genehmigung in Ihrem Posteingang verf\u00FCgbar.`,
                other: `hat Sie aus den Genehmigungs-Workflows und Ausgaben-Chats von ${joinedNames} entfernt. Bereits eingereichte Berichte bleiben zur Genehmigung in Ihrem Posteingang verf\u00FCgbar.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `hat Ihre Rolle in ${policyName} von ${oldRole} zu Benutzer aktualisiert. Sie wurden aus allen Einreicher-Spesen-Chats entfernt, au\u00DFer Ihrem eigenen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `die Standardw\u00E4hrung auf ${newCurrency} aktualisiert (vorher ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `die automatische Berichterstellungsfrequenz auf "${newFrequency}" aktualisiert (zuvor "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `hat den Genehmigungsmodus auf "${newValue}" aktualisiert (vorher "${oldValue}")`,
        upgradedWorkspace: 'diesen Workspace auf den Control-Plan hochgestuft',
        downgradedWorkspace: 'hat diesen Workspace auf den Collect-Plan herabgestuft',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `\u00E4nderte die Rate der Berichte, die zuf\u00E4llig zur manuellen Genehmigung weitergeleitet wurden, auf ${Math.round(newAuditRate * 100)}% (zuvor ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `hat das manuelle Genehmigungslimit f\u00FCr alle Ausgaben auf ${newLimit} ge\u00E4ndert (vorher ${oldLimit})`,
    },
    roomMembersPage: {
        memberNotFound: 'Mitglied nicht gefunden.',
        useInviteButton: 'Um ein neues Mitglied zum Chat einzuladen, verwenden Sie bitte die Einladungs-Schaltfl\u00E4che oben.',
        notAuthorized: `Sie haben keinen Zugriff auf diese Seite. Wenn Sie versuchen, diesem Raum beizutreten, bitten Sie einfach ein Mitglied des Raums, Sie hinzuzuf\u00FCgen. Etwas anderes? Wenden Sie sich an ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `M\u00F6chten Sie ${memberName} wirklich aus dem Raum entfernen?`,
            other: 'M\u00F6chten Sie die ausgew\u00E4hlten Mitglieder wirklich aus dem Raum entfernen?',
        }),
        error: {
            genericAdd: 'Es gab ein Problem beim Hinzuf\u00FCgen dieses Raummitglieds.',
        },
    },
    newTaskPage: {
        assignTask: 'Aufgabe zuweisen',
        assignMe: 'Mir zuweisen',
        confirmTask: 'Aufgabe best\u00E4tigen',
        confirmError: 'Bitte geben Sie einen Titel ein und w\u00E4hlen Sie ein Ziel zum Teilen aus.',
        descriptionOptional: 'Beschreibung (optional)',
        pleaseEnterTaskName: 'Bitte geben Sie einen Titel ein',
        pleaseEnterTaskDestination: 'Bitte w\u00E4hlen Sie aus, wo Sie diese Aufgabe teilen m\u00F6chten.',
    },
    task: {
        task: 'Aufgabe',
        title: 'Titel',
        description: 'Beschreibung',
        assignee: 'Zugewiesene Person',
        completed: 'Abgeschlossen',
        action: 'Abgeschlossen',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `Aufgabe f\u00FCr ${title}`,
            completed: 'als abgeschlossen markiert',
            canceled: 'gel\u00F6schte Aufgabe',
            reopened: 'als unvollst\u00E4ndig markiert',
            error: 'Sie haben keine Berechtigung, die angeforderte Aktion auszuf\u00FChren.',
        },
        markAsComplete: 'Als abgeschlossen markieren',
        markAsIncomplete: 'Als unvollst\u00E4ndig markieren',
        assigneeError: 'Beim Zuweisen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einem anderen Zust\u00E4ndigen.',
        genericCreateTaskFailureMessage: 'Beim Erstellen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es sp\u00E4ter erneut.',
        deleteTask: 'Aufgabe l\u00F6schen',
        deleteConfirmation: 'M\u00F6chten Sie diese Aufgabe wirklich l\u00F6schen?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} Abrechnung`,
    },
    keyboardShortcutsPage: {
        title: 'Tastenkombinationen',
        subtitle: 'Sparen Sie Zeit mit diesen praktischen Tastenkombinationen:',
        shortcuts: {
            openShortcutDialog: '\u00D6ffnet den Dialog f\u00FCr Tastenkombinationen',
            markAllMessagesAsRead: 'Alle Nachrichten als gelesen markieren',
            escape: 'Dialoge verlassen',
            search: 'Suchdialog \u00F6ffnen',
            newChat: 'Neuer Chatbildschirm',
            copy: 'Kommentar kopieren',
            openDebug: '\u00D6ffnen Sie das Dialogfeld f\u00FCr Testeinstellungen',
        },
    },
    guides: {
        screenShare: 'Bildschirmfreigabe',
        screenShareRequest: 'Expensify l\u00E4dt Sie zu einer Bildschirmfreigabe ein',
    },
    search: {
        resultsAreLimited: 'Suchergebnisse sind begrenzt.',
        viewResults: 'Ergebnisse anzeigen',
        resetFilters: 'Filter zur\u00FCcksetzen',
        searchResults: {
            emptyResults: {
                title: 'Nichts zu zeigen',
                subtitle: 'Versuchen Sie, Ihre Suchkriterien anzupassen oder etwas mit dem gr\u00FCnen + Button zu erstellen.',
            },
            emptyExpenseResults: {
                title: 'Sie haben noch keine Ausgaben erstellt.',
                subtitle: 'Erstellen Sie eine Ausgabe oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die gr\u00FCne Schaltfl\u00E4che unten, um eine Ausgabe zu erstellen.',
            },
            emptyReportResults: {
                title: 'Sie haben noch keine Berichte erstellt.',
                subtitle: 'Erstellen Sie einen Bericht oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die gr\u00FCne Schaltfl\u00E4che unten, um einen Bericht zu erstellen.',
            },
            emptyInvoiceResults: {
                title: 'Sie haben noch keine Rechnungen erstellt.',
                subtitle: 'Senden Sie eine Rechnung oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die gr\u00FCne Schaltfl\u00E4che unten, um eine Rechnung zu senden.',
            },
            emptyTripResults: {
                title: 'Keine Reisen anzuzeigen',
                subtitle: 'Beginnen Sie, indem Sie unten Ihre erste Reise buchen.',
                buttonText: 'Eine Reise buchen',
            },
            emptySubmitResults: {
                title: 'Keine Ausgaben zum Einreichen',
                subtitle: 'Alles klar. Mach eine Ehrenrunde!',
                buttonText: 'Bericht erstellen',
            },
            emptyApproveResults: {
                title: 'Keine Ausgaben zur Genehmigung',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
            emptyPayResults: {
                title: 'Keine Ausgaben zu bezahlen',
                subtitle: 'Herzlichen Gl\u00FCckwunsch! Du hast die Ziellinie \u00FCberquert.',
            },
            emptyExportResults: {
                title: 'Keine Ausgaben zum Exportieren',
                subtitle: 'Zeit, es ruhig anzugehen, gute Arbeit.',
            },
        },
        saveSearch: 'Suche speichern',
        deleteSavedSearch: 'Gespeicherte Suche l\u00F6schen',
        deleteSavedSearchConfirm: 'M\u00F6chten Sie diese Suche wirklich l\u00F6schen?',
        searchName: 'Name suchen',
        savedSearchesMenuItemTitle: 'Gespeichert',
        groupedExpenses: 'gruppierte Ausgaben',
        bulkActions: {
            approve: 'Genehmigen',
            pay: 'Bezahlen',
            delete: 'L\u00F6schen',
            hold: 'Halten',
            unhold: 'Sperre aufheben',
            noOptionsAvailable: 'Keine Optionen verf\u00FCgbar f\u00FCr die ausgew\u00E4hlte Gruppe von Ausgaben.',
        },
        filtersHeader: 'Filter',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Vor ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Nach ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
            },
            status: 'Status',
            keyword: 'Keyword',
            hasKeywords: 'Hat Schl\u00FCsselw\u00F6rter',
            currency: 'W\u00E4hrung',
            link: 'Link',
            pinned: 'Angeheftet',
            unread: 'Ungelesen',
            completed: 'Abgeschlossen',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Weniger als ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Gr\u00F6\u00DFer als ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Zwischen ${greaterThan} und ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Einzelne Karten',
                closedCards: 'Geschlossene Karten',
                cardFeeds: 'Karten-Feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Alle ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Alle importierten CSV-Karten${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Aktuell',
            past: 'Vergangenheit',
            submitted: 'Eingereichtes Datum',
            approved: 'Genehmigtes Datum',
            paid: 'Zahlungsdatum',
            exported: 'Exportiertes Datum',
            posted: 'Buchungsdatum',
            billable: 'Abrechenbar',
            reimbursable: 'Erstattungsf\u00E4hig',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Dieser Bericht enth\u00E4lt keine Ausgaben.',
            emptyStateSubtitle: 'Sie k\u00F6nnen Ausgaben zu diesem Bericht hinzuf\u00FCgen, indem Sie die Schaltfl\u00E4che oben verwenden.',
        },
        noCategory: 'Keine Kategorie',
        noTag: 'Kein Tag',
        expenseType: 'Ausgabentyp',
        recentSearches: 'Letzte Suchanfragen',
        recentChats: 'Letzte Chats',
        searchIn: 'Suchen in',
        searchPlaceholder: 'Nach etwas suchen',
        suggestions: 'Vorschl\u00E4ge',
        exportSearchResults: {
            title: 'Export erstellen',
            description: 'Wow, das sind viele Artikel! Wir werden sie b\u00FCndeln, und Concierge wird Ihnen in K\u00FCrze eine Datei senden.',
        },
        exportAll: {
            selectAllMatchingItems: 'W\u00E4hlen Sie alle passenden Elemente aus',
            allMatchingItemsSelected: 'Alle \u00FCbereinstimmenden Elemente ausgew\u00E4hlt',
        },
    },
    genericErrorPage: {
        title: 'Oh-oh, etwas ist schiefgelaufen!',
        body: {
            helpTextMobile: 'Bitte schlie\u00DFen und \u00F6ffnen Sie die App erneut, oder wechseln Sie zu',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Wenn das Problem weiterhin besteht, wenden Sie sich an',
        },
        refresh: 'Aktualisieren',
    },
    fileDownload: {
        success: {
            title: 'Heruntergeladen!',
            message: 'Anhang erfolgreich heruntergeladen!',
            qrMessage:
                '\u00DCberpr\u00FCfen Sie Ihren Fotos- oder Downloads-Ordner auf eine Kopie Ihres QR-Codes. Tipp: F\u00FCgen Sie ihn einer Pr\u00E4sentation hinzu, damit Ihr Publikum ihn scannen und direkt mit Ihnen in Verbindung treten kann.',
        },
        generalError: {
            title: 'Anlagenfehler',
            message: 'Anhang kann nicht heruntergeladen werden',
        },
        permissionError: {
            title: 'Speicherzugriff',
            message: 'Expensify kann Anh\u00E4nge ohne Speicherzugriff nicht speichern. Tippen Sie auf Einstellungen, um Berechtigungen zu aktualisieren.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Neues Expensify',
        about: '\u00DCber New Expensify',
        update: 'Neues Expensify aktualisieren',
        checkForUpdates: 'Nach Updates suchen',
        toggleDevTools: 'Entwicklerwerkzeuge umschalten',
        viewShortcuts: 'Tastenkombinationen anzeigen',
        services: 'Dienstleistungen',
        hide: 'Neues Expensify ausblenden',
        hideOthers: 'Andere ausblenden',
        showAll: 'Alle anzeigen',
        quit: 'New Expensify beenden',
        fileMenu: 'Datei',
        closeWindow: 'Fenster schlie\u00DFen',
        editMenu: 'Bearbeiten',
        undo: 'R\u00FCckg\u00E4ngig machen',
        redo: 'Erneut machen',
        cut: 'Schneiden',
        copy: 'Kopieren',
        paste: 'Einf\u00FCgen',
        pasteAndMatchStyle: 'Einf\u00FCgen und Stil anpassen',
        pasteAsPlainText: 'Als unformatierter Text einf\u00FCgen',
        delete: 'L\u00F6schen',
        selectAll: 'Alle ausw\u00E4hlen',
        speechSubmenu: 'Rede',
        startSpeaking: 'Sprechen Sie jetzt',
        stopSpeaking: 'H\u00F6r auf zu sprechen',
        viewMenu: 'Ansicht',
        reload: 'Neu laden',
        forceReload: 'Erneut laden erzwingen',
        resetZoom: 'Tats\u00E4chliche Gr\u00F6\u00DFe',
        zoomIn: 'Hineinzoomen',
        zoomOut: 'Verkleinern',
        togglefullscreen: 'Vollbild umschalten',
        historyMenu: 'Verlauf',
        back: 'Zur\u00FCck',
        forward: 'Weiterleiten',
        windowMenu: 'Fenster',
        minimize: 'Minimieren',
        zoom: 'Zoom',
        front: 'Alle nach vorne bringen',
        helpMenu: 'Hilfe',
        learnMore: 'Erfahren Sie mehr',
        documentation: 'Dokumentation',
        communityDiscussions: 'Community-Diskussionen',
        searchIssues: 'Probleme suchen',
    },
    historyMenu: {
        forward: 'Weiterleiten',
        back: 'Zur\u00FCck',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Update verf\u00FCgbar',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `Die neue Version wird in K\u00FCrze verf\u00FCgbar sein.${!isSilentUpdating ? 'Wir benachrichtigen Sie, wenn wir bereit sind, das Update durchzuf\u00FChren.' : ''}`,
            soundsGood: 'Klingt gut',
        },
        notAvailable: {
            title: 'Aktualisierung nicht verf\u00FCgbar',
            message: 'Es ist derzeit kein Update verf\u00FCgbar. Bitte versuchen Sie es sp\u00E4ter erneut!',
            okay: 'Okay',
        },
        error: {
            title: 'Aktualisierungspr\u00FCfung fehlgeschlagen',
            message: 'Wir konnten nicht nach einem Update suchen. Bitte versuchen Sie es sp\u00E4ter noch einmal.',
        },
    },
    report: {
        newReport: {
            createReport: 'Bericht erstellen',
            chooseWorkspace: 'W\u00E4hlen Sie einen Arbeitsbereich f\u00FCr diesen Bericht aus.',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler beim Erstellen dieses Chats. Bitte versuchen Sie es sp\u00E4ter erneut.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Ver\u00F6ffentlichen des Kommentars. Bitte versuchen Sie es sp\u00E4ter erneut.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuchen Sie es sp\u00E4ter erneut.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuchen Sie es sp\u00E4ter erneut.',
        noActivityYet: 'Noch keine Aktivit\u00E4t',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `\u00E4nderte ${fieldName} von ${oldValue} zu ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `\u00E4nderte ${fieldName} zu ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `\u00E4nderte den Arbeitsbereich zu ${toPolicyName}${fromPolicyName ? `(vorher ${fromPolicyName})` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `von ${oldType} zu ${newType} ge\u00E4ndert`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `diesen Bericht an ${delegateUser} gesendet, da ${originalManager} im Urlaub ist`,
                exportedToCSV: `in CSV exportiert`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `exportiert nach ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `exportiert nach ${label} \u00FCber`,
                    automaticActionTwo: 'Buchhaltungseinstellungen',
                    manual: ({label}: ExportedToIntegrationParams) => `hat diesen Bericht als manuell exportiert nach ${label} markiert.`,
                    automaticActionThree: 'und erfolgreich einen Datensatz f\u00FCr erstellt',
                    reimburseableLink: 'Auslagen',
                    nonReimbursableLink: 'Unternehmenskarte-Ausgaben',
                    pending: ({label}: ExportedToIntegrationParams) => `begann mit dem Export dieses Berichts nach ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `Fehler beim Exportieren dieses Berichts nach ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `hat eine Quittung hinzugef\u00FCgt`,
                managerDetachReceipt: `Eine Quittung entfernt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `anderweitig ${currency}${amount} bezahlt`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} \u00FCber Integration bezahlt`,
                outdatedBankAccount: `Die Zahlung konnte aufgrund eines Problems mit dem Bankkonto des Zahlers nicht verarbeitet werden.`,
                reimbursementACHBounce: `konnte die Zahlung nicht verarbeiten, da der Zahler nicht \u00FCber ausreichende Mittel verf\u00FCgt`,
                reimbursementACHCancelled: `hat die Zahlung storniert`,
                reimbursementAccountChanged: `Die Zahlung konnte nicht verarbeitet werden, da der Zahler die Bankkonten gewechselt hat.`,
                reimbursementDelayed: `Die Zahlung wurde bearbeitet, aber sie verz\u00F6gert sich um 1-2 weitere Werktage.`,
                selectedForRandomAudit: `zuf\u00E4llig zur \u00DCberpr\u00FCfung ausgew\u00E4hlt`,
                selectedForRandomAuditMarkdown: `[zuf\u00E4llig ausgew\u00E4hlt](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) zur \u00DCberpr\u00FCfung`,
                share: ({to}: ShareParams) => `eingeladenes Mitglied ${to}`,
                unshare: ({to}: UnshareParams) => `Mitglied ${to} entfernt`,
                stripePaid: ({amount, currency}: StripePaidParams) => `bezahlt ${currency}${amount}`,
                takeControl: `die Kontrolle \u00FCbernommen`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `Fehler beim Synchronisieren mit ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `hinzugef\u00FCgt ${email} als ${role === 'member' ? 'a' : 'ein/eine'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `hat die Rolle von ${email} zu ${newRole} aktualisiert (zuvor ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `entfernte benutzerdefiniertes Feld 1 von ${email} (zuvor "${previousValue}")`;
                    }
                    return !previousValue
                        ? `"${newValue}" zu benutzerdefiniertem Feld 1 von ${email} hinzugef\u00FCgt`
                        : `hat benutzerdefiniertes Feld 1 von ${email} in "${newValue}" ge\u00E4ndert (vorher "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `hat benutzerdefiniertes Feld 2 von ${email} entfernt (zuvor "${previousValue}")`;
                    }
                    return !previousValue
                        ? `"${newValue}" zu benutzerdefiniertem Feld 2 von ${email} hinzugef\u00FCgt`
                        : `\u00E4nderte das benutzerdefinierte Feld 2 von ${email} zu "${newValue}" (zuvor "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} hat den Workspace verlassen`,
                removeMember: ({email, role}: AddEmployeeParams) => `entfernt ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} entfernt`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbunden mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'hat den Chat verlassen',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} f\u00FCr ${dayCount} ${dayCount === 1 ? 'Tag' : 'Tage'} bis ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} von ${timePeriod} am ${date}`,
    },
    footer: {
        features: 'Funktionen',
        expenseManagement: 'Ausgabenverwaltung',
        spendManagement: 'Ausgabenmanagement',
        expenseReports: 'Spesenabrechnungen',
        companyCreditCard: 'Unternehmens-Kreditkarte',
        receiptScanningApp: 'Beleg-Scanner-App',
        billPay: 'Rechnungszahlung',
        invoicing: 'Rechnungsstellung',
        CPACard: 'CPA-Karte',
        payroll: 'Lohnabrechnung',
        travel: 'Reise',
        resources: 'Ressourcen',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Pressemappe',
        support: 'Unterst\u00FCtzung',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Nutzungsbedingungen',
        privacy: 'Datenschutz',
        learnMore: 'Erfahren Sie mehr',
        aboutExpensify: '\u00DCber Expensify',
        blog: 'Blog',
        jobs: 'Jobs',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Investor Relations',
        getStarted: 'Loslegen',
        createAccount: 'Neues Konto erstellen',
        logIn: 'Einloggen',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Zur\u00FCck zur Chatliste navigieren',
        chatWelcomeMessage: 'Chat-Begr\u00FC\u00DFungsnachricht',
        navigatesToChat: 'Wechselt zu einem Chat',
        newMessageLineIndicator: 'Neue Nachrichtenzeilenanzeige',
        chatMessage: 'Chatnachricht',
        lastChatMessagePreview: 'Letzte Chatnachricht-Vorschau',
        workspaceName: 'Arbeitsbereichsname',
        chatUserDisplayNames: 'Chat-Mitglied Anzeigenamen',
        scrollToNewestMessages: 'Zu den neuesten Nachrichten scrollen',
        preStyledText: 'Pre-styled Text',
        viewAttachment: 'Anhang anzeigen',
    },
    parentReportAction: {
        deletedReport: 'Gel\u00F6schter Bericht',
        deletedMessage: 'Gel\u00F6schte Nachricht',
        deletedExpense: 'Gel\u00F6schte Ausgabe',
        reversedTransaction: 'Stornierte Transaktion',
        deletedTask: 'Gel\u00F6schte Aufgabe',
        hiddenMessage: 'Versteckte Nachricht',
    },
    threads: {
        thread: 'Thread',
        replies: 'Antworten',
        reply: 'Antworten',
        from: 'Von',
        in: 'in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Von ${reportName}${workspaceName ? `in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'URL kopieren',
        copied: 'Kopiert!',
    },
    moderation: {
        flagDescription: 'Alle markierten Nachrichten werden zur \u00DCberpr\u00FCfung an einen Moderator gesendet.',
        chooseAReason: 'W\u00E4hlen Sie unten einen Grund zum Markieren aus:',
        spam: 'Spam',
        spamDescription: 'Unaufgeforderte themenfremde Werbung',
        inconsiderate: 'R\u00FCcksichtslos',
        inconsiderateDescription: 'Beleidigende oder respektlose Formulierungen mit fragw\u00FCrdigen Absichten',
        intimidation: 'Einsch\u00FCchterung',
        intimidationDescription: 'Aggressiv eine Agenda verfolgen trotz berechtigter Einw\u00E4nde',
        bullying: 'Mobbing',
        bullyingDescription: 'Eine Einzelperson ins Visier nehmen, um Gehorsam zu erlangen.',
        harassment: 'Bel\u00E4stigung',
        harassmentDescription: 'Rassistisches, misogynistisches oder anderweitig diskriminierendes Verhalten',
        assault: 'Angriff',
        assaultDescription: 'Gezielter emotionaler Angriff mit der Absicht, Schaden zuzuf\u00FCgen',
        flaggedContent: 'Diese Nachricht wurde als Versto\u00DF gegen unsere Gemeinschaftsregeln markiert und der Inhalt wurde ausgeblendet.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet anonyme Warnung und Nachricht wird zur \u00DCberpr\u00FCfung gemeldet.',
        levelTwoResult: 'Nachricht im Kanal verborgen, plus anonyme Warnung und Nachricht wird zur \u00DCberpr\u00FCfung gemeldet.',
        levelThreeResult: 'Nachricht aus dem Kanal entfernt, anonyme Warnung gesendet und Nachricht zur \u00DCberpr\u00FCfung gemeldet.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Lade sie ein',
        nothing: 'Nichts tun',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Akzeptieren',
        decline: 'Ablehnen',
    },
    actionableMentionTrackExpense: {
        submit: 'An jemanden senden',
        categorize: 'Kategorisieren Sie es',
        share: 'Teilen Sie es mit meinem Buchhalter',
        nothing: 'Nichts f\u00FCr jetzt',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrer vereint sich',
        joinExpensifyOrg:
            'Schlie\u00DFen Sie sich Expensify.org an, um Ungerechtigkeit auf der ganzen Welt zu beseitigen. Die aktuelle Kampagne "Teachers Unite" unterst\u00FCtzt Lehrer \u00FCberall, indem sie die Kosten f\u00FCr wichtige Schulmaterialien aufteilt.',
        iKnowATeacher: 'Ich kenne einen Lehrer.',
        iAmATeacher: 'Ich bin Lehrer.',
        getInTouch: 'Ausgezeichnet! Bitte teilen Sie uns deren Informationen mit, damit wir mit ihnen in Kontakt treten k\u00F6nnen.',
        introSchoolPrincipal: 'Einf\u00FChrung zu Ihrem Schulleiter',
        schoolPrincipalVerifyExpense:
            'Expensify.org teilt die Kosten f\u00FCr wichtige Schulmaterialien, damit Sch\u00FCler aus einkommensschwachen Haushalten eine bessere Lernerfahrung haben k\u00F6nnen. Ihr Schulleiter wird gebeten, Ihre Ausgaben zu \u00FCberpr\u00FCfen.',
        principalFirstName: 'Vorname des Hauptansprechpartners',
        principalLastName: 'Nachname des Schulleiters',
        principalWorkEmail: 'Hauptarbeits-E-Mail',
        updateYourEmail: 'Aktualisieren Sie Ihre E-Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        contactMethods: 'Kontaktmethoden.',
        schoolMailAsDefault:
            'Bevor Sie fortfahren, stellen Sie bitte sicher, dass Sie Ihre Schul-E-Mail als Ihre Standardkontaktmethode festlegen. Sie k\u00F6nnen dies unter Einstellungen > Profil > tun.',
        error: {
            enterPhoneEmail: 'Geben Sie eine g\u00FCltige E-Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'Geben Sie eine E-Mail-Adresse ein',
            enterValidEmail: 'Geben Sie eine g\u00FCltige E-Mail-Adresse ein',
            tryDifferentEmail: 'Bitte versuchen Sie eine andere E-Mail-Adresse.',
        },
    },
    cardTransactions: {
        notActivated: 'Nicht aktiviert',
        outOfPocket: 'Ausgaben aus eigener Tasche',
        companySpend: 'Unternehmensausgaben',
    },
    distance: {
        addStop: 'Stopp hinzuf\u00FCgen',
        deleteWaypoint: 'Wegpunkt l\u00F6schen',
        deleteWaypointConfirmation: 'M\u00F6chten Sie diesen Wegpunkt wirklich l\u00F6schen?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Starten',
            stop: 'Stopp',
        },
        mapPending: {
            title: 'Ausstehende Zuordnung',
            subtitle: 'Die Karte wird erstellt, wenn Sie wieder online sind.',
            onlineSubtitle: 'Einen Moment, w\u00E4hrend wir die Karte einrichten.',
            errorTitle: 'Kartenfehler',
            errorSubtitle: 'Beim Laden der Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        error: {
            selectSuggestedAddress: 'Bitte w\u00E4hlen Sie eine vorgeschlagene Adresse aus oder verwenden Sie den aktuellen Standort.',
        },
    },
    reportCardLostOrDamaged: {
        report: 'Verlust / Besch\u00E4digung der physischen Karte melden',
        screenTitle: 'Zeugnis verloren oder besch\u00E4digt',
        nextButtonLabel: 'N\u00E4chste',
        reasonTitle: 'Warum ben\u00F6tigen Sie eine neue Karte?',
        cardDamaged: 'Meine Karte wurde besch\u00E4digt.',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte best\u00E4tigen Sie die Postadresse f\u00FCr Ihre neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte wird in 2-3 Werktagen ankommen. Ihre aktuelle Karte wird weiterhin funktionieren, bis Sie Ihre neue Karte aktivieren.',
        cardLostOrStolenInfo: 'Ihre aktuelle Karte wird dauerhaft deaktiviert, sobald Ihre Bestellung aufgegeben wird. Die meisten Karten kommen in wenigen Werktagen an.',
        address: 'Adresse',
        deactivateCardButton: 'Karte deaktivieren',
        shipNewCardButton: 'Neue Karte versenden',
        addressError: 'Adresse ist erforderlich',
        reasonError: 'Grund ist erforderlich',
    },
    eReceipt: {
        guaranteed: 'Garantierte eQuittung',
        transactionDate: 'Transaktionsdatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Einen Chat starten,',
            buttonText2: 'Empfehlen Sie einen Freund.',
            header: 'Starte einen Chat, empfehle einen Freund',
            body: 'M\u00F6chten Sie, dass Ihre Freunde auch Expensify nutzen? Starten Sie einfach einen Chat mit ihnen und wir k\u00FCmmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Reiche eine Ausgabe ein,',
            buttonText2: 'Empfehlen Sie Ihren Chef.',
            header: 'Reichen Sie eine Ausgabe ein, verweisen Sie auf Ihren Chef.',
            body: 'M\u00F6chten Sie, dass Ihr Chef Expensify auch nutzt? Reichen Sie einfach eine Ausgabe bei ihnen ein und wir k\u00FCmmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Empfehlen Sie einen Freund',
            body: 'M\u00F6chten Sie, dass Ihre Freunde auch Expensify nutzen? Chatten Sie einfach, zahlen Sie oder teilen Sie eine Ausgabe mit ihnen und wir k\u00FCmmern uns um den Rest. Oder teilen Sie einfach Ihren Einladungslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Empfehlen Sie einen Freund',
            header: 'Empfehlen Sie einen Freund',
            body: 'M\u00F6chten Sie, dass Ihre Freunde auch Expensify nutzen? Chatten Sie einfach, zahlen Sie oder teilen Sie eine Ausgabe mit ihnen und wir k\u00FCmmern uns um den Rest. Oder teilen Sie einfach Ihren Einladungslink!',
        },
        copyReferralLink: 'Einladungslink kopieren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Chatten Sie mit Ihrem Setup-Spezialisten in',
            phrase2: 'f\u00FCr Hilfe',
        },
        default: {
            phrase1: 'Nachricht',
            phrase2: 'f\u00FCr Hilfe bei der Einrichtung',
        },
    },
    violations: {
        allTagLevelsRequired: 'Alle Tags erforderlich',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) =>
            `${rejectedBy} hat diese Ausgabe mit dem Kommentar "${rejectReason}" abgelehnt.`,
        billableExpense: 'Abrechnungsf\u00E4hig nicht mehr g\u00FCltig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Beleg erforderlich${formattedLimit ? `\u00FCber ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategorie nicht mehr g\u00FCltig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Angewandte ${surcharge}% Umrechnungsgeb\u00FChr`,
        customUnitOutOfPolicy: 'Rate f\u00FCr diesen Arbeitsbereich nicht g\u00FCltig',
        duplicatedTransaction: 'Duplikat',
        fieldRequired: 'Berichtsfelder sind erforderlich',
        futureDate: 'Zuk\u00FCnftiges Datum nicht erlaubt',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Aufgeschlagen um ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum \u00E4lter als ${maxAge} Tage`,
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung erforderlich f\u00FCr die ausgew\u00E4hlte Kategorie',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Fehlende ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Betrag weicht von der berechneten Entfernung ab';
                case 'card':
                    return 'Betrag gr\u00F6\u00DFer als Kartentransaktion';
                default:
                    if (displayPercentVariance) {
                        return `Betrag ${displayPercentVariance}% h\u00F6her als der gescannte Beleg`;
                    }
                    return 'Betrag gr\u00F6\u00DFer als gescannter Beleg';
            }
        },
        modifiedDate: 'Datum weicht vom gescannten Beleg ab',
        nonExpensiworksExpense: 'Nicht-Expensiworks-Ausgabe',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Ausgabe \u00FCberschreitet das automatische Genehmigungslimit von ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Betrag \u00FCber dem ${formattedLimit}/Personen-Kategorielimit`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag \u00FCber dem Limit von ${formattedLimit}/Person`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag \u00FCber dem Limit von ${formattedLimit}/Person`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Betrag \u00FCber dem t\u00E4glichen ${formattedLimit}/Personen-Kategorielimit`,
        receiptNotSmartScanned:
            'Ausgabendetails und Beleg manuell hinzugef\u00FCgt. Bitte \u00FCberpr\u00FCfen Sie die Details. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Erfahren Sie mehr</a> \u00FCber die automatische Pr\u00FCfung f\u00FCr alle Belege.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Beleg erforderlich';
            if (formattedLimit ?? category) {
                message += '\u00FCber';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += 'Kategorielimit';
                }
            }
            return message;
        },
        prohibitedExpense: ({prohibitedExpenseType}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Unzul\u00E4ssige Ausgabe:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return `${preMessage} Alkohol`;
                case 'gambling':
                    return `${preMessage} Gl\u00FCcksspiel`;
                case 'tobacco':
                    return `${preMessage} Tabak`;
                case 'adultEntertainment':
                    return `${preMessage} Erwachsenenunterhaltung`;
                case 'hotelIncidentals':
                    return `${preMessage} Hotelnebenkosten`;
                default:
                    return `${preMessage}${prohibitedExpenseType}`;
            }
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: '\u00DCberpr\u00FCfung erforderlich',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `Kassenbon kann aufgrund einer unterbrochenen Bankverbindung nicht automatisch zugeordnet werden, die ${email} beheben muss.`
                    : 'Kassenbon kann aufgrund einer unterbrochenen Bankverbindung, die Sie beheben m\u00FCssen, nicht automatisch zugeordnet werden.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin
                    ? `Bitte ${member} markieren, ob es sich um Bargeld handelt, oder 7 Tage warten und es erneut versuchen.`
                    : 'Warten auf Zusammenf\u00FChrung mit Kartentransaktion.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung',
        adminBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte beheben in',
        memberBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte bitten Sie einen Workspace-Administrator, das Problem zu l\u00F6sen.',
        markAsCashToIgnore: 'Als Bargeld markieren, um zu ignorieren und Zahlung anzufordern.',
        smartscanFailed: ({canEdit = true}) => `Beleg-Scan fehlgeschlagen.${canEdit ? 'Details manuell eingeben.' : ''}`,
        receiptGeneratedWithAI: 'Potentieller KI-generierter Beleg',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Missing ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nicht mehr g\u00FCltig`,
        taxAmountChanged: 'Steuerbetrag wurde ge\u00E4ndert',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Steuer'} nicht mehr g\u00FCltig`,
        taxRateChanged: 'Der Steuersatz wurde ge\u00E4ndert',
        taxRequired: 'Fehlender Steuersatz',
        none: 'Keine',
        taxCodeToKeep: 'W\u00E4hlen Sie, welchen Steuercode Sie behalten m\u00F6chten.',
        tagToKeep: 'W\u00E4hlen Sie aus, welches Tag beibehalten werden soll',
        isTransactionReimbursable: 'W\u00E4hlen Sie, ob die Transaktion erstattungsf\u00E4hig ist.',
        merchantToKeep: 'W\u00E4hlen Sie, welchen H\u00E4ndler Sie behalten m\u00F6chten',
        descriptionToKeep: 'W\u00E4hlen Sie aus, welche Beschreibung beibehalten werden soll',
        categoryToKeep: 'W\u00E4hlen Sie, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'W\u00E4hlen Sie, ob die Transaktion abrechenbar ist',
        keepThisOne: 'Behalte diesen.',
        confirmDetails: `Best\u00E4tigen Sie die Details, die Sie behalten.`,
        confirmDuplicatesInfo: `Die doppelten Anfragen, die Sie nicht behalten, werden f\u00FCr das Mitglied zur L\u00F6schung bereitgehalten.`,
        hold: 'Diese Ausgabe wurde zur\u00FCckgestellt.',
        resolvedDuplicates: 'Duplikat gel\u00F6st',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} ist erforderlich`,
    },
    violationDismissal: {
        rter: {
            manual: 'diesen Beleg als Barzahlung markiert',
        },
        duplicatedTransaction: {
            manual: 'Duplikat gel\u00F6st',
        },
    },
    videoPlayer: {
        play: 'Spielen',
        pause: 'Pause',
        fullscreen: 'Vollbildschirm',
        playbackSpeed: 'Wiedergabegeschwindigkeit',
        expand: 'Erweitern',
        mute: 'Stumm schalten',
        unmute: 'Stummschaltung aufheben',
        normal: 'Normalerweise',
    },
    exitSurvey: {
        header: 'Bevor Sie gehen',
        reasonPage: {
            title: 'Bitte teilen Sie uns mit, warum Sie uns verlassen.',
            subtitle: 'Bevor Sie gehen, bitte teilen Sie uns mit, warum Sie zu Expensify Classic wechseln m\u00F6chten.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ich ben\u00F6tige eine Funktion, die nur in Expensify Classic verf\u00FCgbar ist.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ich verstehe nicht, wie man New Expensify benutzt.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ich verstehe, wie man New Expensify benutzt, aber ich bevorzuge Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welche Funktion ben\u00F6tigen Sie, die in New Expensify nicht verf\u00FCgbar ist?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Was versuchst du zu tun?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Warum bevorzugen Sie Expensify Classic?',
        },
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Danke f\u00FCr das Feedback!',
        thankYouSubtitle: 'Ihre Antworten helfen uns, ein besseres Produkt zu entwickeln, um Dinge zu erledigen. Vielen Dank!',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        offlineTitle: 'Es sieht so aus, als ob Sie hier feststecken...',
        offline:
            'Sie scheinen offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber das neue Expensify schon. Wenn Sie Expensify Classic verwenden m\u00F6chten, versuchen Sie es erneut, wenn Sie eine Internetverbindung haben.',
        quickTip: 'Kurzer Tipp...',
        quickTipSubTitle: 'Sie k\u00F6nnen direkt zu Expensify Classic gehen, indem Sie expensify.com besuchen. Setzen Sie ein Lesezeichen f\u00FCr eine einfache Verkn\u00FCpfung!',
        bookACall: 'Einen Anruf buchen',
        noThanks: 'Nein danke',
        bookACallTitle: 'M\u00F6chten Sie mit einem Produktmanager sprechen?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direkt \u00FCber Ausgaben und Berichte chatten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'F\u00E4higkeit, alles auf dem Mobilger\u00E4t zu erledigen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reisen und Ausgaben mit der Geschwindigkeit des Chats',
        },
        bookACallTextTop: 'Wenn Sie zu Expensify Classic wechseln, verpassen Sie:',
        bookACallTextBottom:
            'Wir w\u00FCrden uns freuen, mit Ihnen ein Gespr\u00E4ch zu f\u00FChren, um zu verstehen, warum. Sie k\u00F6nnen einen Termin mit einem unserer leitenden Produktmanager buchen, um Ihre Bed\u00FCrfnisse zu besprechen.',
        takeMeToExpensifyClassic: 'Bring mich zu Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Beim Laden weiterer Nachrichten ist ein Fehler aufgetreten.',
        tryAgain: 'Versuche es erneut',
    },
    systemMessage: {
        mergedWithCashTransaction: 'einen Beleg mit dieser Transaktion abgeglichen',
    },
    subscription: {
        authenticatePaymentCard: 'Zahlungskarte authentifizieren',
        mobileReducedFunctionalityMessage: 'Sie k\u00F6nnen \u00C4nderungen an Ihrem Abonnement nicht in der mobilen App vornehmen.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Kostenlose Testversion: ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} \u00FCbrig`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Ihre Zahlungsinformationen sind veraltet.',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Aktualisieren Sie Ihre Zahlungskarte bis zum ${date}, um alle Ihre Lieblingsfunktionen weiterhin nutzen zu k\u00F6nnen.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Ihre Zahlung konnte nicht verarbeitet werden.',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Ihre ${date} Belastung von ${purchaseAmountOwed} konnte nicht verarbeitet werden. Bitte f\u00FCgen Sie eine Zahlungskarte hinzu, um den geschuldeten Betrag zu begleichen.`
                        : 'Bitte f\u00FCgen Sie eine Zahlungskarte hinzu, um den geschuldeten Betrag zu begleichen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Ihre Zahlungsinformationen sind veraltet.',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Ihre Zahlung ist \u00FCberf\u00E4llig. Bitte begleichen Sie Ihre Rechnung bis zum ${date}, um eine Unterbrechung des Dienstes zu vermeiden.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Ihre Zahlungsinformationen sind veraltet.',
                subtitle: 'Ihre Zahlung ist \u00FCberf\u00E4llig. Bitte begleichen Sie Ihre Rechnung.',
            },
            billingDisputePending: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Sie haben die Belastung von ${amountOwed} auf der Karte mit der Endung ${cardEnding} angefochten. Ihr Konto wird gesperrt, bis der Streit mit Ihrer Bank beigelegt ist.`,
            },
            cardAuthenticationRequired: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Ihre Zahlungskarte wurde nicht vollst\u00E4ndig authentifiziert. Bitte schlie\u00DFen Sie den Authentifizierungsprozess ab, um Ihre Zahlungskarte mit der Endung ${cardEnding} zu aktivieren.`,
            },
            insufficientFunds: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Ihre Zahlungskarte wurde aufgrund unzureichender Mittel abgelehnt. Bitte versuchen Sie es erneut oder f\u00FCgen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpired: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Ihre Zahlungskarte ist abgelaufen. Bitte f\u00FCgen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpireSoon: {
                title: 'Ihre Karte l\u00E4uft bald ab',
                subtitle:
                    'Ihre Zahlungskarte l\u00E4uft am Ende dieses Monats ab. Klicken Sie auf das Drei-Punkte-Men\u00FC unten, um sie zu aktualisieren und weiterhin alle Ihre Lieblingsfunktionen zu nutzen.',
            },
            retryBillingSuccess: {
                title: 'Erfolg!',
                subtitle: 'Ihre Karte wurde erfolgreich belastet.',
            },
            retryBillingError: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle:
                    'Bevor Sie es erneut versuchen, rufen Sie bitte direkt Ihre Bank an, um Expensify-Geb\u00FChren zu autorisieren und eventuelle Sperren zu entfernen. Andernfalls versuchen Sie, eine andere Zahlungskarte hinzuzuf\u00FCgen.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Sie haben die Belastung von ${amountOwed} auf der Karte mit der Endung ${cardEnding} angefochten. Ihr Konto wird gesperrt, bis der Streit mit Ihrer Bank beigelegt ist.`,
            preTrial: {
                title: 'Kostenlose Testversion starten',
                subtitleStart: 'Als n\u00E4chster Schritt,',
                subtitleLink: 'Vervollst\u00E4ndigen Sie Ihre Einrichtungs-Checkliste',
                subtitleEnd: 'damit Ihr Team mit der Abrechnung beginnen kann.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Testversion: ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} \u00FCbrig!`,
                subtitle: 'F\u00FCgen Sie eine Zahlungskarte hinzu, um weiterhin alle Ihre Lieblingsfunktionen nutzen zu k\u00F6nnen.',
            },
            trialEnded: {
                title: 'Ihre kostenlose Testversion ist abgelaufen',
                subtitle: 'F\u00FCgen Sie eine Zahlungskarte hinzu, um weiterhin alle Ihre Lieblingsfunktionen nutzen zu k\u00F6nnen.',
            },
            earlyDiscount: {
                claimOffer: 'Angebot einl\u00F6sen',
                noThanks: 'Nein danke',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% Rabatt auf Ihr erstes Jahr!`,
                    phrase2: `F\u00FCgen Sie einfach eine Zahlungskarte hinzu und beginnen Sie mit einem Jahresabonnement.`,
                },
                onboardingChatTitle: {
                    phrase1: 'Zeitlich begrenztes Angebot:',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% Rabatt auf Ihr erstes Jahr!`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Anspruch innerhalb von ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Zahlung',
            subtitle: 'F\u00FCgen Sie eine Karte hinzu, um Ihr Expensify-Abonnement zu bezahlen.',
            addCardButton: 'Zahlungskarte hinzuf\u00FCgen',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Ihr n\u00E4chstes Zahlungsdatum ist ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Karte endet mit ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Name: ${name}, Ablaufdatum: ${expiration}, W\u00E4hrung: ${currency}`,
            changeCard: 'Zahlungskarte \u00E4ndern',
            changeCurrency: 'Zahlungsw\u00E4hrung \u00E4ndern',
            cardNotFound: 'Keine Zahlungskarte hinzugef\u00FCgt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'R\u00FCckerstattung anfordern',
            requestRefundModal: {
                phrase1:
                    'Eine R\u00FCckerstattung zu erhalten ist einfach: Downgrade einfach dein Konto vor deinem n\u00E4chsten Abrechnungsdatum und du erh\u00E4ltst eine R\u00FCckerstattung.',
                phrase2:
                    'Achtung: Wenn Sie Ihr Konto herabstufen, werden Ihre Arbeitsbereiche gel\u00F6scht. Diese Aktion kann nicht r\u00FCckg\u00E4ngig gemacht werden, aber Sie k\u00F6nnen jederzeit einen neuen Arbeitsbereich erstellen, wenn Sie Ihre Meinung \u00E4ndern.',
                confirm: 'Arbeitsbereich(e) l\u00F6schen und herabstufen',
            },
            viewPaymentHistory: 'Zahlungsverlauf anzeigen',
        },
        yourPlan: {
            title: 'Ihr Plan',
            exploreAllPlans: 'Alle Pl\u00E4ne erkunden',
            customPricing: 'Individuelle Preisgestaltung',
            asLowAs: ({price}: YourPlanPriceValueParams) => `ab ${price} pro aktivem Mitglied/Monat`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied/Monat`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied pro Monat`,
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Sammeln',
                description: 'Der Kleinunternehmensplan, der Ihnen Ausgaben, Reisen und Chat bietet.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                benefit1: 'Belegscannen',
                benefit2: 'Erstattungen',
                benefit3: 'Verwaltung von Firmenkreditkarten',
                benefit4: 'Spesen- und Reisegenehmigungen',
                benefit5: 'Reisebuchung und -regeln',
                benefit6: 'QuickBooks/Xero-Integrationen',
                benefit7: 'Chat \u00FCber Ausgaben, Berichte und R\u00E4ume',
                benefit8: 'KI- und menschlicher Support',
            },
            control: {
                title: 'Kontrolle',
                description: 'Spesen, Reisen und Chat f\u00FCr gr\u00F6\u00DFere Unternehmen.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                benefit1: 'Alles im Collect-Plan',
                benefit2: 'Genehmigungsworkflows auf mehreren Ebenen',
                benefit3: 'Benutzerdefinierte Ausgabenregeln',
                benefit4: 'ERP-Integrationen (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR-Integrationen (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Benutzerdefinierte Einblicke und Berichterstattung',
                benefit8: 'Budgetierung',
            },
            thisIsYourCurrentPlan: 'Dies ist Ihr aktueller Plan',
            downgrade: 'Herabstufen zu Collect',
            upgrade: 'Upgrade auf Control',
            addMembers: 'Mitglieder hinzuf\u00FCgen',
            saveWithExpensifyTitle: 'Sparen Sie mit der Expensify-Karte',
            saveWithExpensifyDescription: 'Verwenden Sie unseren Sparrechner, um zu sehen, wie das Cashback von der Expensify Card Ihre Expensify-Rechnung reduzieren kann.',
            saveWithExpensifyButton: 'Erfahren Sie mehr',
        },
        compareModal: {
            comparePlans: 'Pl\u00E4ne vergleichen',
            unlockTheFeatures: 'Schalten Sie die Funktionen frei, die Sie ben\u00F6tigen, mit dem f\u00FCr Sie passenden Plan.',
            viewOurPricing: 'Sehen Sie sich unsere Preisseite an',
            forACompleteFeatureBreakdown: 'f\u00FCr eine vollst\u00E4ndige Funktions\u00FCbersicht unserer Pl\u00E4ne.',
        },
        details: {
            title: 'Abonnementdetails',
            annual: 'Jahresabonnement',
            taxExempt: 'Steuerbefreiungsstatus beantragen',
            taxExemptEnabled: 'Steuerbefreit',
            taxExemptStatus: 'Steuerbefreiungsstatus',
            payPerUse: 'Nutzung-basierte Abrechnung',
            subscriptionSize: 'Abonnementgr\u00F6\u00DFe',
            headsUp:
                'Achtung: Wenn Sie jetzt nicht die Gr\u00F6\u00DFe Ihres Abonnements festlegen, setzen wir sie automatisch auf die Anzahl der aktiven Mitglieder Ihres ersten Monats. Sie verpflichten sich dann, f\u00FCr mindestens diese Anzahl von Mitgliedern f\u00FCr die n\u00E4chsten 12 Monate zu zahlen. Sie k\u00F6nnen die Gr\u00F6\u00DFe Ihres Abonnements jederzeit erh\u00F6hen, aber nicht verringern, bis Ihr Abonnement abgelaufen ist.',
            zeroCommitment: 'Keine Verpflichtung zum erm\u00E4\u00DFigten j\u00E4hrlichen Abonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgr\u00F6\u00DFe',
            yourSize: 'Ihre Abonnementgr\u00F6\u00DFe ist die Anzahl der offenen Pl\u00E4tze, die von jedem aktiven Mitglied in einem bestimmten Monat besetzt werden k\u00F6nnen.',
            eachMonth:
                'Jeden Monat deckt Ihr Abonnement bis zu der oben festgelegten Anzahl aktiver Mitglieder ab. Jedes Mal, wenn Sie die Gr\u00F6\u00DFe Ihres Abonnements erh\u00F6hen, beginnen Sie ein neues 12-monatiges Abonnement in dieser neuen Gr\u00F6\u00DFe.',
            note: 'Hinweis: Ein aktives Mitglied ist jeder, der Ausgabendaten erstellt, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat, die mit dem Arbeitsbereich Ihres Unternehmens verbunden sind.',
            confirmDetails: 'Best\u00E4tigen Sie Ihre neuen j\u00E4hrlichen Abonnementdetails:',
            subscriptionSize: 'Abonnementgr\u00F6\u00DFe',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktive Mitglieder/Monat`,
            subscriptionRenews: 'Abonnement wird erneuert',
            youCantDowngrade: 'Sie k\u00F6nnen w\u00E4hrend Ihres Jahresabonnements nicht herabstufen.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Sie haben sich bereits f\u00FCr eine j\u00E4hrliche Abonnementgr\u00F6\u00DFe von ${size} aktiven Mitgliedern pro Monat bis zum ${date} verpflichtet. Sie k\u00F6nnen am ${date} zu einem nutzungsbasierten Abonnement wechseln, indem Sie die automatische Verl\u00E4ngerung deaktivieren.`,
            error: {
                size: 'Bitte geben Sie eine g\u00FCltige Abonnementgr\u00F6\u00DFe ein.',
                sameSize: 'Bitte geben Sie eine Zahl ein, die sich von Ihrer aktuellen Abonnementgr\u00F6\u00DFe unterscheidet.',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzuf\u00FCgen',
            enterPaymentCardDetails: 'Geben Sie Ihre Zahlungsinformationen ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet Verschl\u00FCsselung auf Bankniveau und nutzt redundante Infrastruktur, um Ihre Daten zu sch\u00FCtzen.',
            learnMoreAboutSecurity: 'Erfahren Sie mehr \u00FCber unsere Sicherheit.',
        },
        subscriptionSettings: {
            title: 'Abonnementseinstellungen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstyp: ${subscriptionType}, Abonnementgr\u00F6\u00DFe: ${subscriptionSize}, Automatische Verl\u00E4ngerung: ${autoRenew}, Automatische j\u00E4hrliche Sitzplatzerh\u00F6hung: ${autoIncrease}`,
            none: 'keine',
            on: 'auf',
            off: 'aus',
            annual: 'J\u00E4hrlich',
            autoRenew: 'Automatische Verl\u00E4ngerung',
            autoIncrease: 'Automatische j\u00E4hrliche Sitzplatzerh\u00F6hung',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Sparen Sie bis zu ${amountWithCurrency}/Monat pro aktivem Mitglied`,
            automaticallyIncrease:
                'Erh\u00F6hen Sie automatisch Ihre j\u00E4hrlichen Pl\u00E4tze, um aktive Mitglieder zu ber\u00FCcksichtigen, die Ihre Abonnementgr\u00F6\u00DFe \u00FCberschreiten. Hinweis: Dadurch wird das Enddatum Ihres Jahresabonnements verl\u00E4ngert.',
            disableAutoRenew: 'Automatische Verl\u00E4ngerung deaktivieren',
            helpUsImprove: 'Helfen Sie uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund, warum Sie die automatische Verl\u00E4ngerung deaktivieren?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Erneuert sich am ${date}.`,
            pricingConfiguration:
                'Die Preisgestaltung h\u00E4ngt von der Konfiguration ab. F\u00FCr den niedrigsten Preis w\u00E4hlen Sie ein Jahresabonnement und erhalten die Expensify Card.',
            learnMore: {
                part1: 'Erfahren Sie mehr auf unserer',
                pricingPage: 'Preisseite',
                part2: 'oder chatten Sie mit unserem Team in Ihrem',
                adminsRoom: '#admins Raum.',
            },
            estimatedPrice: 'Gesch\u00E4tzter Preis',
            changesBasedOn: 'Dies \u00E4ndert sich basierend auf Ihrer Expensify Card-Nutzung und den untenstehenden Abonnementoptionen.',
        },
        requestEarlyCancellation: {
            title: 'Fr\u00FChzeitige K\u00FCndigung beantragen',
            subtitle: 'Was ist der Hauptgrund f\u00FCr Ihre vorzeitige K\u00FCndigungsanfrage?',
            subscriptionCanceled: {
                title: 'Abonnement storniert',
                subtitle: 'Ihr Jahresabonnement wurde storniert.',
                info: 'Wenn Sie Ihre Arbeitsbereiche weiterhin auf Pay-per-Use-Basis nutzen m\u00F6chten, ist alles bereit.',
                preventFutureActivity: {
                    part1: 'Wenn Sie zuk\u00FCnftige Aktivit\u00E4ten und Geb\u00FChren verhindern m\u00F6chten, m\u00FCssen Sie',
                    link: 'l\u00F6schen Sie Ihren Arbeitsbereich/Ihre Arbeitsbereiche',
                    part2: '. Beachten Sie, dass Ihnen beim L\u00F6schen Ihrer Arbeitsbereiche alle ausstehenden Aktivit\u00E4ten, die im aktuellen Kalendermonat angefallen sind, in Rechnung gestellt werden.',
                },
            },
            requestSubmitted: {
                title: 'Anfrage eingereicht',
                subtitle: {
                    part1: 'Vielen Dank, dass Sie uns mitgeteilt haben, dass Sie an der K\u00FCndigung Ihres Abonnements interessiert sind. Wir pr\u00FCfen Ihre Anfrage und werden uns bald \u00FCber Ihren Chat mit Ihnen in Verbindung setzen.',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: {
                part1: 'Indem ich die vorzeitige K\u00FCndigung beantrage, erkenne ich an und stimme zu, dass Expensify keine Verpflichtung hat, einem solchen Antrag im Rahmen der Expensify nachzukommen.',
                link: 'Nutzungsbedingungen',
                part2: 'oder eine andere anwendbare Dienstleistungsvereinbarung zwischen mir und Expensify und dass Expensify das alleinige Ermessen in Bezug auf die Gew\u00E4hrung eines solchen Antrags beh\u00E4lt.',
            },
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funktionalit\u00E4t muss verbessert werden',
        tooExpensive: 'Zu teuer',
        inadequateSupport: 'Unzureichender Kundensupport',
        businessClosing: 'Unternehmen schlie\u00DFt, verkleinert sich oder wurde \u00FCbernommen',
        additionalInfoTitle: 'Zu welcher Software wechseln Sie und warum?',
        additionalInfoInputLabel: 'Ihre Antwort',
    },
    roomChangeLog: {
        updateRoomDescription: 'setze die Raumbeschreibung auf:',
        clearRoomDescription: 'Raumbeschreibung gel\u00F6scht',
    },
    delegate: {
        switchAccount: 'Konten wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Erlaube anderen Mitgliedern, auf dein Konto zuzugreifen.',
        addCopilot: 'Copilot hinzuf\u00FCgen',
        membersCanAccessYourAccount: 'Diese Mitglieder k\u00F6nnen auf Ihr Konto zugreifen:',
        youCanAccessTheseAccounts: 'Sie k\u00F6nnen auf diese Konten \u00FCber den Kontowechsler zugreifen:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Vollst\u00E4ndig';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Begrenzt';
                default:
                    return '';
            }
        },
        genericError: 'Hoppla, etwas ist schiefgelaufen. Bitte versuche es erneut.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `im Namen von ${delegator}`,
        accessLevel: 'Zugriffsebene',
        confirmCopilot: 'Best\u00E4tigen Sie Ihren Copilot unten.',
        accessLevelDescription:
            'W\u00E4hlen Sie unten eine Zugriffsebene aus. Sowohl Vollzugriff als auch eingeschr\u00E4nkter Zugriff erm\u00F6glichen es Copiloten, alle Gespr\u00E4che und Ausgaben einzusehen.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Erlauben Sie einem anderen Mitglied, alle Aktionen in Ihrem Konto in Ihrem Namen durchzuf\u00FChren. Dazu geh\u00F6ren Chat, Einreichungen, Genehmigungen, Zahlungen, Aktualisierungen der Einstellungen und mehr.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Erlauben Sie einem anderen Mitglied, die meisten Aktionen in Ihrem Konto in Ihrem Namen auszuf\u00FChren. Ausgenommen sind Genehmigungen, Zahlungen, Ablehnungen und Sperrungen.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'M\u00F6chten Sie diesen Copilot wirklich entfernen?',
        changeAccessLevel: 'Zugriffsebene \u00E4ndern',
        makeSureItIsYou: 'Lassen Sie uns sicherstellen, dass Sie es sind.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde, um einen Copiloten hinzuzuf\u00FCgen. Er sollte innerhalb einer oder zwei Minuten ankommen.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde, um Ihren Copilot zu aktualisieren.`,
        notAllowed: 'Nicht so schnell...',
        noAccessMessage: 'Als Copilot hast du keinen Zugriff auf diese Seite. Entschuldigung!',
        notAllowedMessageStart: `Als ein`,
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `F\u00FCr ${accountOwnerEmail} haben Sie keine Berechtigung, diese Aktion auszuf\u00FChren. Entschuldigung!`,
        copilotAccess: 'Copilot-Zugang',
    },
    debug: {
        debug: 'Debuggen',
        details: 'Einzelheiten',
        JSON: 'JSON',
        reportActions: 'Aktionen',
        reportActionPreview: 'Vorschau',
        nothingToPreview: 'Nichts zur Vorschau',
        editJson: 'JSON bearbeiten:',
        preview: 'Vorschau:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Fehlendes ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ung\u00FCltige Eigenschaft: ${propertyName} - Erwartet: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ung\u00FCltiger Wert - Erwartet: ${expectedValues}`,
        missingValue: 'Fehlender Wert',
        createReportAction: 'Berichtaktion erstellen',
        reportAction: 'Aktion melden',
        report: 'Bericht',
        transaction: 'Transaktion',
        violations: 'Verst\u00F6\u00DFe',
        transactionViolation: 'Transaktionsversto\u00DF',
        hint: 'Daten\u00E4nderungen werden nicht an das Backend gesendet.',
        textFields: 'Textfelder',
        numberFields: 'Zahlenfelder',
        booleanFields: 'Boolesche Felder',
        constantFields: 'Konstante Felder',
        dateTimeFields: 'DateTime-Felder',
        date: 'Datum',
        time: 'Zeit',
        none: 'Keine',
        visibleInLHN: 'Sichtbar in LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Bericht anzeigen',
        viewTransaction: 'Transaktion anzeigen',
        createTransactionViolation: 'Transaktionsversto\u00DF erstellen',
        reasonVisibleInLHN: {
            hasDraftComment: 'Hat Entwurfskommentar',
            hasGBR: 'Has GBR',
            hasRBR: 'Hat RBR',
            pinnedByUser: 'Von Mitglied angeheftet',
            hasIOUViolations: 'Hat IOU-Verst\u00F6\u00DFe',
            hasAddWorkspaceRoomErrors: 'Hat Fehler beim Hinzuf\u00FCgen des Arbeitsbereichsraums',
            isUnread: 'Ist ungelesen (Fokusmodus)',
            isArchived: 'Ist archiviert (neuester Modus)',
            isSelfDM: 'Ist Selbst-DM',
            isFocused: 'Ist vor\u00FCbergehend fokussiert',
        },
        reasonGBR: {
            hasJoinRequest: 'Hat Beitrittsanfrage (Admin-Raum)',
            isUnreadWithMention: 'Ist ungelesen mit Erw\u00E4hnung',
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass der Zust\u00E4ndige die Aktion abschlie\u00DFt',
            hasChildReportAwaitingAction: 'Hat einen untergeordneten Bericht, der auf eine Aktion wartet',
            hasMissingInvoiceBankAccount: 'Fehlendes Rechnungsbankkonto',
        },
        reasonRBR: {
            hasErrors: 'Hat Fehler in Berichts- oder Berichtaktionsdaten',
            hasViolations: 'Hat Verst\u00F6\u00DFe',
            hasTransactionThreadViolations: 'Hat Transaktions-Thread-Verst\u00F6\u00DFe',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Es gibt einen Bericht, der auf eine Aktion wartet.',
            theresAReportWithErrors: 'Es gibt einen Bericht mit Fehlern.',
            theresAWorkspaceWithCustomUnitsErrors: 'Es gibt einen Arbeitsbereich mit Fehlern bei benutzerdefinierten Einheiten.',
            theresAProblemWithAWorkspaceMember: 'Es gibt ein Problem mit einem Arbeitsbereichsmitglied.',
            theresAProblemWithAWorkspaceQBOExport: 'Es gab ein Problem mit einer Exporteinstellung der Workspace-Verbindung.',
            theresAProblemWithAContactMethod: 'Es gibt ein Problem mit einer Kontaktmethode',
            aContactMethodRequiresVerification: 'Eine Kontaktmethode erfordert eine Verifizierung',
            theresAProblemWithAPaymentMethod: 'Es gibt ein Problem mit einer Zahlungsmethode.',
            theresAProblemWithAWorkspace: 'Es gibt ein Problem mit einem Arbeitsbereich.',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit Ihrem Erstattungskonto.',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit Ihrem Abonnement.',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Ihr Abonnement wurde erfolgreich verl\u00E4ngert.',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'W\u00E4hrend der Synchronisierung einer Arbeitsbereichsverbindung ist ein Problem aufgetreten.',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit Ihrem Wallet.',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit den Bedingungen Ihrer Brieftasche.',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Machen Sie eine Probefahrt',
    },
    migratedUserWelcomeModal: {
        title: 'Reisen und Ausgaben, in der Geschwindigkeit des Chats',
        subtitle: 'New Expensify hat die gleiche gro\u00DFartige Automatisierung, aber jetzt mit erstaunlicher Zusammenarbeit:',
        confirmText: "Los geht's!",
        features: {
            chat: '<strong>Direkt bei jeder Ausgabe</strong>, jedem Bericht oder Arbeitsbereich chatten',
            scanReceipt: '<strong>Belege scannen</strong> und R\u00FCckerstattung erhalten',
            crossPlatform: 'Erledigen Sie <strong>alles</strong> von Ihrem Telefon oder Browser aus',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Loslegen',
            part2: 'hier!',
        },
        saveSearchTooltip: {
            part1: 'Benennen Sie Ihre gespeicherten Suchen um',
            part2: 'hier!',
        },
        bottomNavInboxTooltip: {
            part1: '\u00DCberpr\u00FCfen Sie, was',
            part2: 'ben\u00F6tigt Ihre Aufmerksamkeit',
            part3: 'und',
            part4: '\u00FCber Ausgaben chatten.',
        },
        workspaceChatTooltip: {
            part1: 'Chatten mit',
            part2: 'Genehmiger',
        },
        globalCreateTooltip: {
            part1: 'Ausgaben erstellen',
            part2: ', chatten beginnen,',
            part3: 'und mehr.',
            part4: 'Probier es aus!',
        },
        GBRRBRChat: {
            part1: 'Du wirst \uD83D\uDFE2 auf sehen',
            part2: 'zu ergreifende Ma\u00DFnahmen',
            part3: ',\nund \uD83D\uDD34 am',
            part4: 'Elemente zur \u00DCberpr\u00FCfung.',
        },
        accountSwitcher: {
            part1: 'Zugriff auf Ihre',
            part2: 'Copilot-Konten',
            part3: 'hier',
        },
        expenseReportsFilter: {
            part1: 'Willkommen! Finden Sie alle Ihre',
            part2: 'Berichte des Unternehmens',
            part3: 'hier.',
        },
        scanTestTooltip: {
            part1: 'M\u00F6chten Sie sehen, wie Scan funktioniert?',
            part2: 'Probieren Sie einen Testbeleg aus!',
            part3: 'W\u00E4hlen Sie unsere',
            part4: 'Testmanager',
            part5: 'um es auszuprobieren!',
            part6: 'Jetzt,',
            part7: 'Reichen Sie Ihre Ausgaben ein',
            part8: 'und sieh zu, wie die Magie geschieht!',
            tryItOut: 'Probier es aus',
            noThanks: 'Nein danke',
        },
        outstandingFilter: {
            part1: 'Filter f\u00FCr Ausgaben, die',
            part2: 'muss genehmigt werden',
        },
        scanTestDriveTooltip: {
            part1: 'Diesen Beleg senden an',
            part2: 'Beende die Probefahrt!',
        },
    },
    discardChangesConfirmation: {
        title: '\u00C4nderungen verwerfen?',
        body: 'M\u00F6chten Sie die vorgenommenen \u00C4nderungen wirklich verwerfen?',
        confirmText: '\u00C4nderungen verwerfen',
    },
    scheduledCall: {
        book: {
            title: 'Anruf planen',
            description: 'Finden Sie eine Zeit, die f\u00FCr Sie passt.',
            slots: 'Verf\u00FCgbare Zeiten f\u00FCr',
        },
        confirmation: {
            title: 'Anruf best\u00E4tigen',
            description:
                'Stellen Sie sicher, dass die unten stehenden Details f\u00FCr Sie in Ordnung sind. Sobald Sie den Anruf best\u00E4tigen, senden wir eine Einladung mit weiteren Informationen.',
            setupSpecialist: 'Ihr Einrichtungsspezialist',
            meetingLength: 'Besprechungsl\u00E4nge',
            dateTime: 'Datum & Uhrzeit',
            minutes: '30 Minuten',
        },
        callScheduled: 'Anruf geplant',
    },
    autoSubmitModal: {
        title: 'Alles klar und eingereicht!',
        description: 'Alle Warnungen und Verst\u00F6\u00DFe wurden beseitigt, daher:',
        submittedExpensesTitle: 'Diese Ausgaben wurden eingereicht',
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihren Genehmiger gesendet, k\u00F6nnen jedoch noch bearbeitet werden, bis sie genehmigt sind.',
        pendingExpensesTitle: 'Ausstehende Ausgaben wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie gebucht werden.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Machen Sie eine 2-min\u00FCtige Probefahrt',
        },
        modal: {
            title: 'Probieren Sie uns aus',
            description: 'Machen Sie eine schnelle Produkttour, um sich schnell einzuarbeiten. Keine Zwischenstopps erforderlich!',
            confirmText: 'Testfahrt starten',
            helpText: 'Skip',
            employee: {
                description:
                    '<muted-text>Holen Sie sich f\u00FCr Ihr Team <strong>3 kostenlose Monate Expensify!</strong> Geben Sie einfach die E-Mail-Adresse Ihres Chefs unten ein und senden Sie ihm eine Testausgabe.</muted-text>',
                email: 'Geben Sie die E-Mail-Adresse Ihres Chefs ein',
                error: 'Dieses Mitglied besitzt einen Arbeitsbereich, bitte geben Sie ein neues Mitglied zum Testen ein.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Sie testen derzeit Expensify',
            readyForTheRealThing: 'Bereit f\u00FCr das echte Ding?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} hat dich eingeladen, Expensify auszuprobieren\nHey! Ich habe uns gerade *3 Monate kostenlos* gesichert, um Expensify auszuprobieren, den schnellsten Weg, um Ausgaben zu verwalten.\n\nHier ist ein *Testbeleg*, um dir zu zeigen, wie es funktioniert:`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
