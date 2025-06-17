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
    CreateExpensesParams,
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
        count: 'Anzahl',
        cancel: 'Abbrechen',
        dismiss: 'Schließen',
        yes: 'Ja',
        no: 'Nein',
        ok: 'OK',
        notNow: 'Nicht jetzt',
        learnMore: 'Mehr erfahren.',
        buttonConfirm: 'Verstanden',
        name: 'Name',
        attachment: 'Anhang',
        attachments: 'Anhänge',
        center: 'Zentrieren',
        from: 'Von',
        to: 'An',
        in: 'In',
        optional: 'Optional',
        new: 'Neu',
        search: 'Suchen',
        reports: 'Berichte',
        find: 'Finden',
        searchWithThreeDots: 'Suchen...',
        next: 'Weiter',
        previous: 'Zurück',
        goBack: 'Zurückgehen',
        create: 'Erstellen',
        add: 'Hinzufügen',
        resend: 'Erneut senden',
        save: 'Speichern',
        select: 'Auswählen',
        deselect: 'Abwählen',
        selectMultiple: 'Mehrere auswählen',
        saveChanges: 'Änderungen speichern',
        submit: 'Absenden',
        rotate: 'Drehen',
        zoom: 'Zoom',
        password: 'Passwort',
        magicCode: 'Magischer Code',
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
        view: 'Ansehen',
        review: (reviewParams?: ReviewParams) => `Bewertung${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Nicht',
        signIn: 'Anmelden',
        signInWithGoogle: 'Mit Google anmelden',
        signInWithApple: 'Mit Apple anmelden',
        signInWith: 'Anmelden mit',
        continue: 'Fortsetzen',
        firstName: 'Vorname',
        lastName: 'Nachname',
        scanning: 'Scannen',
        addCardTermsOfService: 'Expensify Nutzungsbedingungen',
        perPerson: 'pro Person',
        phone: 'Telefon',
        phoneNumber: 'Telefonnummer',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E-Mail',
        and: 'und',
        or: 'oder',
        details: 'Details',
        privacy: 'Datenschutz',
        privacyPolicy: 'Datenschutzrichtlinie',
        hidden: 'Versteckt',
        visible: 'Sichtbar',
        delete: 'Löschen',
        archived: 'archived',
        contacts: 'Kontakte',
        recents: 'Zuletzt verwendet',
        close: 'Schließen',
        download: 'Herunterladen',
        downloading: 'Herunterladen',
        uploading: 'Hochladen',
        pin: 'Anheften',
        unPin: 'Lösen',
        back: 'Zurück',
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
        ssnLast4: 'Letzte 4 Ziffern der Sozialversicherungsnummer',
        ssnFull9: 'Volle 9-stellige SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Adresszeile ${lineNumber}`,
        personalAddress: 'Persönliche Adresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Bitte keine Postfächer oder Briefkastenadressen.',
        city: 'Stadt',
        state: 'Bundesland',
        streetAddress: 'Straßenadresse',
        stateOrProvince: 'Bundesland / Provinz',
        country: 'Land',
        zip: 'Postleitzahl',
        zipPostCode: 'Postleitzahl',
        whatThis: 'Was ist das?',
        iAcceptThe: 'Ich akzeptiere die',
        remove: 'Entfernen',
        admin: 'Administrator',
        owner: 'Eigentümer',
        dateFormat: 'YYYY-MM-TT',
        send: 'Senden',
        na: 'N/A',
        noResultsFound: 'Keine Ergebnisse gefunden',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `Keine Ergebnisse gefunden für "${searchString}"`,
        recentDestinations: 'Kürzliche Ziele',
        timePrefix: 'Es ist',
        conjunctionFor: 'für',
        todayAt: 'Heute um',
        tomorrowAt: 'Morgen um',
        yesterdayAt: 'Gestern um',
        conjunctionAt: 'bei',
        conjunctionTo: 'an',
        genericErrorMessage: 'Ups... etwas ist schiefgelaufen und Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
        percentage: 'Prozentsatz',
        error: {
            invalidAmount: 'Ungültiger Betrag',
            acceptTerms: 'Sie müssen die Nutzungsbedingungen akzeptieren, um fortzufahren.',
            phoneNumber: `Bitte geben Sie eine gültige Telefonnummer mit Ländervorwahl ein (z. B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dieses Feld ist erforderlich',
            requestModified: 'Diese Anfrage wird von einem anderen Mitglied bearbeitet.',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Zeichenlimit überschritten (${length}/${limit})`,
            dateInvalid: 'Bitte wählen Sie ein gültiges Datum aus',
            invalidDateShouldBeFuture: 'Bitte wählen Sie heute oder ein zukünftiges Datum aus',
            invalidTimeShouldBeFuture: 'Bitte wählen Sie eine Zeit, die mindestens eine Minute in der Zukunft liegt.',
            invalidCharacter: 'Ungültiges Zeichen',
            enterMerchant: 'Geben Sie einen Händlernamen ein',
            enterAmount: 'Geben Sie einen Betrag ein',
            missingMerchantName: 'Fehlender Händlername',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Fehlendes Datum',
            enterDate: 'Geben Sie ein Datum ein',
            invalidTimeRange: 'Bitte geben Sie eine Uhrzeit im 12-Stunden-Format ein (z. B. 2:30 PM)',
            pleaseCompleteForm: 'Bitte füllen Sie das obige Formular aus, um fortzufahren',
            pleaseSelectOne: 'Bitte wählen Sie eine Option oben aus',
            invalidRateError: 'Bitte geben Sie einen gültigen Satz ein',
            lowRateError: 'Der Satz muss größer als 0 sein',
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
            login: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        comma: 'Komma',
        semicolon: 'Semikolon',
        please: 'Bitte',
        contactUs: 'kontaktieren Sie uns',
        pleaseEnterEmailOrPhoneNumber: 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer ein',
        fixTheErrors: 'Fehler beheben',
        inTheFormBeforeContinuing: 'im Formular, bevor Sie fortfahren',
        confirm: 'Bestätigen',
        reset: 'Zurücksetzen',
        done: 'Fertig',
        more: 'Mehr',
        debitCard: 'Debitkarte',
        bankAccount: 'Bankkonto',
        personalBankAccount: 'Privatkonto',
        businessBankAccount: 'Geschäftskonto',
        join: 'Beitreten',
        leave: 'Verlassen',
        decline: 'Ablehnen',
        transferBalance: 'Saldo übertragen',
        cantFindAddress: 'Kannst du deine Adresse nicht finden?',
        enterManually: 'Manuell eingeben',
        message: 'Nachricht',
        leaveThread: 'Thread verlassen',
        you: 'Du',
        youAfterPreposition: 'du',
        your: 'dein',
        conciergeHelp: 'Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
        youAppearToBeOffline: 'Es scheint, dass Sie offline sind.',
        thisFeatureRequiresInternet: 'Diese Funktion erfordert eine aktive Internetverbindung.',
        attachmentWillBeAvailableOnceBackOnline: 'Der Anhang wird verfügbar, sobald Sie wieder online sind.',
        errorOccurredWhileTryingToPlayVideo: 'Beim Versuch, dieses Video abzuspielen, ist ein Fehler aufgetreten.',
        areYouSure: 'Bist du sicher?',
        verify: 'Überprüfen',
        yesContinue: 'Ja, weiter machen',
        websiteExample: 'z.B. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `z.B. ${zipSampleFormat}` : ''),
        description: 'Beschreibung',
        title: 'Titel',
        assignee: 'Zuständiger',
        createdBy: 'Erstellt von',
        with: 'mit',
        shareCode: 'Code teilen',
        share: 'Teilen',
        per: 'pro',
        mi: 'Meile',
        km: 'Kilometer',
        copied: 'Kopiert!',
        someone: 'Jemand',
        total: 'Gesamt',
        edit: 'Bearbeiten',
        letsDoThis: `Lass uns das machen!`,
        letsStart: `Lass uns anfangen`,
        showMore: 'Mehr anzeigen',
        merchant: 'Händler',
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
        pm: 'Nachm.',
        tbd: 'TBD',
        selectCurrency: 'Wähle eine Währung aus',
        card: 'Karte',
        whyDoWeAskForThis: 'Warum fragen wir danach?',
        required: 'Erforderlich',
        showing: 'Anzeigen',
        of: 'von',
        default: 'Standard',
        update: 'Aktualisieren',
        member: 'Mitglied',
        auditor: 'Prüfer',
        role: 'Rolle',
        currency: 'Währung',
        rate: 'Bewerten',
        emptyLHN: {
            title: 'Woohoo! Alles aufgeholt.',
            subtitleText1: 'Finde einen Chat mit dem Begriff',
            subtitleText2: 'Schaltfläche oben oder erstellen Sie etwas mit dem',
            subtitleText3: 'Schaltfläche unten.',
        },
        businessName: 'Geschäftsname',
        clear: 'Löschen',
        type: 'Typ',
        action: 'Aktion',
        expenses: 'Ausgaben',
        tax: 'Steuer',
        shared: 'Geteilt',
        drafts: 'Entwürfe',
        finished: 'Fertiggestellt',
        upgrade: 'Aktualisieren',
        downgradeWorkspace: 'Arbeitsbereich herabstufen',
        companyID: 'Firmen-ID',
        userID: 'Benutzer-ID',
        disable: 'Deaktivieren',
        export: 'Exportieren',
        initialValue: 'Anfangswert',
        currentDate: 'Aktuelles Datum',
        value: 'Wert',
        downloadFailedTitle: 'Download fehlgeschlagen',
        downloadFailedDescription: 'Ihr Download konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
        filterLogs: 'Protokolle filtern',
        network: 'Netzwerk',
        reportID: 'Berichts-ID',
        longID: 'Lange ID',
        bankAccounts: 'Bankkonten',
        chooseFile: 'Datei auswählen',
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        ignore: 'Ignore',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        import: 'Importieren',
        offlinePrompt: 'Sie können diese Aktion gerade nicht ausführen.',
        outstanding: 'Ausstehend',
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
        skip: 'Überspringen',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Benötigen Sie etwas Bestimmtes? Chatten Sie mit Ihrem Account Manager, ${accountManagerDisplayName}.`,
        chatNow: 'Jetzt chatten',
        workEmail: 'Arbeits-E-Mail',
        destination: 'Zielort',
        subrate: 'Subrate',
        perDiem: 'Tagespauschale',
        validate: 'Validieren',
        downloadAsPDF: 'Als PDF herunterladen',
        downloadAsCSV: 'Als CSV herunterladen',
        help: 'Hilfe',
        expenseReports: 'Spesenabrechnungen',
        rateOutOfPolicy: 'Bewertung außerhalb der Richtlinie',
        reimbursable: 'Erstattungsfähig',
        editYourProfile: 'Profil bearbeiten',
        comments: 'Kommentare',
        sharedIn: 'Geteilt in',
        unreported: 'Nicht gemeldet',
        explore: 'Entdecken',
        todo: 'Zu erledigen',
        invoice: 'Rechnung',
        expense: 'Ausgabe',
        chat: 'Chat',
        task: 'Aufgabe',
        trip: 'Reise',
        apply: 'Anwenden',
        status: 'Status',
        on: 'An',
        before: 'Vor',
        after: 'Nach',
        reschedule: 'Neu planen',
        general: 'Allgemein',
        never: 'Nie',
        workspacesTabTitle: 'Arbeitsbereiche',
        getTheApp: 'App herunterladen',
        scanReceiptsOnTheGo: 'Scannen Sie Belege mit Ihrem Telefon',
    },
    supportalNoAccess: {
        title: 'Nicht so schnell',
        description: 'Sie sind nicht berechtigt, diese Aktion auszuführen, wenn der Support angemeldet ist.',
    },
    lockedAccount: {
        title: 'Gesperrtes Konto',
        description: 'Sie dürfen diese Aktion nicht ausführen, da dieses Konto gesperrt wurde. Bitte wenden Sie sich an concierge@expensify.com für die nächsten Schritte.',
    },
    location: {
        useCurrent: 'Aktuellen Standort verwenden',
        notFound: 'Wir konnten Ihren Standort nicht finden. Bitte versuchen Sie es erneut oder geben Sie eine Adresse manuell ein.',
        permissionDenied: 'Es sieht so aus, als hätten Sie den Zugriff auf Ihren Standort verweigert.',
        please: 'Bitte',
        allowPermission: 'Standortzugriff in den Einstellungen erlauben',
        tryAgain: 'und versuche es erneut.',
    },
    contact: {
        importContacts: 'Kontakte importieren',
        importContactsTitle: 'Importieren Sie Ihre Kontakte',
        importContactsText: 'Importieren Sie Kontakte von Ihrem Telefon, damit Ihre Lieblingspersonen immer mit einem Fingertipp erreichbar sind.',
        importContactsExplanation: 'damit deine Lieblingspersonen immer nur einen Fingertipp entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Gib uns das grüne Licht, um deine Kontakte zu importieren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Nehmen Sie an der Diskussion teil.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Kamerazugriff',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kann keine Fotos machen, ohne Zugriff auf Ihre Kamera. Tippen Sie auf Einstellungen, um die Berechtigungen zu aktualisieren.',
        attachmentError: 'Anhangfehler',
        errorWhileSelectingAttachment: 'Beim Auswählen eines Anhangs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        errorWhileSelectingCorruptedAttachment: 'Beim Auswählen eines beschädigten Anhangs ist ein Fehler aufgetreten. Bitte versuchen Sie eine andere Datei.',
        takePhoto: 'Foto machen',
        chooseFromGallery: 'Aus Galerie auswählen',
        chooseDocument: 'Datei auswählen',
        attachmentTooLarge: 'Anhang ist zu groß',
        sizeExceeded: 'Die Dateigröße des Anhangs überschreitet das Limit von 24 MB.',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Die Dateigröße des Anhangs überschreitet das Limit von ${maxUploadSizeInMB} MB.`,
        attachmentTooSmall: 'Der Anhang ist zu klein',
        sizeNotMet: 'Die Dateigröße des Anhangs muss größer als 240 Bytes sein',
        wrongFileType: 'Ungültiger Dateityp',
        notAllowedExtension: 'Dieser Dateityp ist nicht erlaubt. Bitte versuchen Sie es mit einem anderen Dateityp.',
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuchen Sie eine andere Datei.',
        protectedPDFNotSupported: 'Passwortgeschützte PDF wird nicht unterstützt',
        attachmentImageResized: 'Dieses Bild wurde zur Vorschau verkleinert. Für die volle Auflösung herunterladen.',
        attachmentImageTooLarge: 'Dieses Bild ist zu groß, um eine Vorschau vor dem Hochladen anzuzeigen.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Sie können nur bis zu ${fileLimit} Dateien gleichzeitig hochladen.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien überschreiten ${maxUploadSizeInMB} MB. Bitte versuchen Sie es erneut.`,
    },
    dropzone: {
        addAttachments: 'Anhänge hinzufügen',
        scanReceipts: 'Belege scannen',
        replaceReceipt: 'Beleg ersetzen',
    },
    filePicker: {
        fileError: 'Dateifehler',
        errorWhileSelectingFile: 'Beim Auswählen einer Datei ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    },
    connectionComplete: {
        title: 'Verbindung abgeschlossen',
        supportingText: 'Sie können dieses Fenster schließen und zur Expensify-App zurückkehren.',
    },
    avatarCropModal: {
        title: 'Foto bearbeiten',
        description: 'Ziehen, zoomen und drehen Sie Ihr Bild ganz nach Belieben.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Keine Erweiterung für den MIME-Typ gefunden',
        problemGettingImageYouPasted: 'Beim Abrufen des eingefügten Bildes ist ein Problem aufgetreten',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Die maximale Kommentarlänge beträgt ${formattedMaxLength} Zeichen.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Die maximale Länge des Aufgabentitels beträgt ${formattedMaxLength} Zeichen.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App aktualisieren',
        updatePrompt: 'Eine neue Version dieser App ist verfügbar.\nJetzt aktualisieren oder die App später neu starten, um die neuesten Änderungen herunterzuladen.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wird gestartet',
        expired: 'Ihre Sitzung ist abgelaufen.',
        signIn: 'Bitte melden Sie sich erneut an.',
        redirectedToDesktopApp: 'Wir haben Sie zur Desktop-App weitergeleitet.',
        youCanAlso: 'Sie können auch',
        openLinkInBrowser: 'öffnen Sie diesen Link in Ihrem Browser',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `Sie sind angemeldet als ${email}. Klicken Sie im Hinweisfenster auf „Link öffnen“, um sich mit diesem Konto in der Desktop-App anzumelden.`,
        doNotSeePrompt: 'Kannst du die Eingabeaufforderung nicht sehen?',
        tryAgain: 'Versuchen Sie es erneut',
        or: ', oder',
        continueInWeb: 'weiter zur Web-App',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra,\ndu bist angemeldet!',
        successfulSignInDescription: 'Wechsle zurück zu deinem ursprünglichen Tab, um fortzufahren.',
        title: 'Hier ist dein magischer Code',
        description: 'Bitte geben Sie den Code von dem Gerät ein, auf dem er ursprünglich angefordert wurde.',
        doNotShare: 'Teilen Sie Ihren Code mit niemandem.\nExpensify wird Sie niemals danach fragen!',
        or: ', oder',
        signInHere: 'einfach hier anmelden',
        expiredCodeTitle: 'Der magische Code ist abgelaufen',
        expiredCodeDescription: 'Gehen Sie zurück zum ursprünglichen Gerät und fordern Sie einen neuen Code an.',
        successfulNewCodeRequest: 'Code angefordert. Bitte überprüfen Sie Ihr Gerät.',
        tfaRequiredTitle: 'Zwei-Faktor-Authentifizierung erforderlich',
        tfaRequiredDescription: 'Bitte geben Sie den Zwei-Faktor-Authentifizierungscode ein, den Sie beim Anmelden verwenden.',
        requestOneHere: 'Fordern Sie hier eine an.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Bezahlt von',
        whatsItFor: 'Wofür ist das?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Name, E-Mail oder Telefonnummer',
        findMember: 'Mitglied finden',
        searchForSomeone: 'Nach jemandem suchen',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Reichen Sie eine Ausgabe ein, empfehlen Sie Ihren Chef weiter',
            subtitleText: 'Möchten Sie, dass Ihr Chef auch Expensify verwendet? Reichen Sie ihm einfach eine Spesenabrechnung ein, und wir kümmern uns um den Rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Einen Anruf buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Beginnen Sie unten.',
        anotherLoginPageIsOpen: 'Eine weitere Anmeldeseite ist geöffnet.',
        anotherLoginPageIsOpenExplanation: 'Sie haben die Anmeldeseite in einem separaten Tab geöffnet. Bitte melden Sie sich in diesem Tab an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht. Und jetzt, wo Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Ihre Zahlungen erreichen Sie so schnell, wie Sie Ihren Standpunkt vermitteln können.',
        enterPassword: 'Bitte geben Sie Ihr Passwort ein',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, es ist immer schön, hier ein neues Gesicht zu sehen!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `Bitte geben Sie den an ${login} gesendeten magischen Code ein. Er sollte innerhalb von ein oder zwei Minuten ankommen.`,
    },
    login: {
        hero: {
            header: 'Reisen und Spesen, mit der Geschwindigkeit des Chats',
            body: 'Willkommen bei der nächsten Generation von Expensify, wo Ihre Reisen und Ausgaben dank kontextbezogenem, Echtzeit-Chat schneller ablaufen.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Sie sind bereits angemeldet als ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Möchten Sie sich nicht mit ${provider} anmelden?`,
        continueWithMyCurrentSession: 'Mit meiner aktuellen Sitzung fortfahren',
        redirectToDesktopMessage: 'Wir leiten Sie zur Desktop-App weiter, sobald Sie sich angemeldet haben.',
        signInAgreementMessage: 'Durch das Einloggen stimmen Sie den zu',
        termsOfService: 'Nutzungsbedingungen',
        privacy: 'Datenschutz',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Weiter mit Single Sign-On anmelden:',
        orContinueWithMagicCode: 'Sie können sich auch mit einem magischen Code anmelden',
        useSingleSignOn: 'Single Sign-On verwenden',
        useMagicCode: 'Magischen Code verwenden',
        launching: 'Starte...',
        oneMoment: 'Einen Moment bitte, während wir Sie zum Single-Sign-On-Portal Ihres Unternehmens weiterleiten.',
    },
    reportActionCompose: {
        dropToUpload: 'Zum Hochladen ablegen',
        sendAttachment: 'Anhang senden',
        addAttachment: 'Anhang hinzufügen',
        writeSomething: 'Schreibe etwas...',
        blockedFromConcierge: 'Kommunikation ist gesperrt',
        fileUploadFailed: 'Upload fehlgeschlagen. Datei wird nicht unterstützt.',
        localTime: ({user, time}: LocalTimeParams) => `Es ist ${time} für ${user}`,
        edited: '(edited)',
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
        deleteAction: ({action}: DeleteActionParams) => `Lösche ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `Sind Sie sicher, dass Sie dieses ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar'} löschen möchten?`,
        onlyVisible: 'Nur sichtbar für',
        replyInThread: 'Im Thread antworten',
        joinThread: 'Thread beitreten',
        leaveThread: 'Thread verlassen',
        copyOnyxData: 'Onyx-Daten kopieren',
        flagAsOffensive: 'Als anstößig markieren',
        menu: 'Menü',
    },
    emojiReactions: {
        addReactionTooltip: 'Reaktion hinzufügen',
        reactedWith: 'reagierte mit',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Du hast die Party in  verpasst',
        beginningOfArchivedRoomPartTwo: ', hier gibt es nichts zu sehen.',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) => `Dieser Chat ist mit allen Expensify-Mitgliedern der Domain ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Verwenden Sie es, um mit Kollegen zu chatten, Tipps zu teilen und Fragen zu stellen.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Dieser Chat ist mit',
        beginningOfChatHistoryAdminRoomPartOneLast: 'Administrator.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: 'Verwenden Sie es, um über die Einrichtung des Arbeitsbereichs und mehr zu chatten.',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Dieser Chat ist mit allen in ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `Verwenden Sie es für die wichtigsten Ankündigungen.`,
        beginningOfChatHistoryUserRoomPartOne: 'Dieser Chatraum ist für alles.',
        beginningOfChatHistoryUserRoomPartTwo: 'verwandt.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Dieser Chat ist für Rechnungen zwischen`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `Verwenden Sie die + Taste, um eine Rechnung zu senden.`,
        beginningOfChatHistory: 'Dieser Chat ist mit',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'Dies ist, wo',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'wird Ausgaben einreichen an',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Verwenden Sie einfach die + Taste.',
        beginningOfChatHistorySelfDM: 'Dies ist dein persönlicher Bereich. Nutze ihn für Notizen, Aufgaben, Entwürfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Lassen Sie uns Sie einrichten.',
        chatWithAccountManager: 'Chatten Sie hier mit Ihrem Account Manager',
        sayHello: 'Sag Hallo!',
        yourSpace: 'Ihr Bereich',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Willkommen in ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Verwenden Sie die + Taste, um eine Ausgabe zu ${additionalText}.`,
        askConcierge: 'Stellen Sie Fragen und erhalten Sie 24/7 Echtzeit-Support.',
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
    adminOnlyCanPost: 'Nur Administratoren können in diesem Raum Nachrichten senden.',
    reportAction: {
        asCopilot: 'als Copilot für',
    },
    mentionSuggestions: {
        hereAlternateText: 'Alle in diesem Gespräch benachrichtigen',
    },
    newMessages: 'Neue Nachrichten',
    youHaveBeenBanned: 'Hinweis: Du wurdest vom Chatten in diesem Kanal ausgeschlossen.',
    reportTypingIndicator: {
        isTyping: 'tippt...',
        areTyping: 'schreibt...',
        multipleMembers: 'Mehrere Mitglieder',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Dieser Chatraum wurde archiviert.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Dieser Chat ist nicht mehr aktiv, da ${displayName} sein Konto geschlossen hat.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Dieser Chat ist nicht mehr aktiv, da ${oldDisplayName} sein Konto mit ${displayName} zusammengeführt hat.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Dieser Chat ist nicht mehr aktiv, da <strong>Sie</strong> kein Mitglied des ${policyName}-Arbeitsbereichs mehr sind.`
                : `Dieser Chat ist nicht mehr aktiv, da ${displayName} kein Mitglied des Arbeitsbereichs ${policyName} mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, da ${policyName} kein aktiver Arbeitsbereich mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, da ${policyName} kein aktiver Arbeitsbereich mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Diese Buchung ist archiviert.',
    },
    writeCapabilityPage: {
        label: 'Wer kann posten',
        writeCapability: {
            all: 'Alle Mitglieder',
            admins: 'Nur für Administratoren',
        },
    },
    sidebarScreen: {
        buttonFind: 'Finde etwas...',
        buttonMySettings: 'Meine Einstellungen',
        fabNewChat: 'Chat starten',
        fabNewChatExplained: 'Chat starten (Schwebende Aktion)',
        chatPinned: 'Chat angeheftet',
        draftedMessage: 'Entwurf der Nachricht',
        listOfChatMessages: 'Liste der Chatnachrichten',
        listOfChats: 'Liste der Chats',
        saveTheWorld: 'Rette die Welt',
        tooltip: 'Hier starten!',
        redirectToExpensifyClassicModal: {
            title: 'Demnächst verfügbar',
            description:
                'Wir verfeinern noch einige Details der neuen Expensify-Version, um Ihre spezifische Einrichtung zu berücksichtigen. In der Zwischenzeit wechseln Sie bitte zu Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domains',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Raum',
        distance: 'Entfernung',
        manual: 'Handbuch',
        scan: 'Scannen',
    },
    spreadsheet: {
        upload: 'Eine Tabelle hochladen',
        dragAndDrop: 'Ziehen Sie Ihre Tabelle hierher oder wählen Sie unten eine Datei aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.',
        chooseSpreadsheet: 'Wählen Sie eine Tabellenkalkulationsdatei zum Importieren aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.',
        fileContainsHeader: 'Datei enthält Spaltenüberschriften',
        column: ({name}: SpreadSheetColumnParams) => `Spalte ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) =>
            `Hoppla! Ein erforderliches Feld ("${fieldName}") wurde nicht zugeordnet. Bitte überprüfen Sie es und versuchen Sie es erneut.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Ups! Sie haben ein einzelnes Feld ("${fieldName}") mehreren Spalten zugeordnet. Bitte überprüfen Sie dies und versuchen Sie es erneut.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) =>
            `Ups! Das Feld ("${fieldName}") enthält einen oder mehrere leere Werte. Bitte überprüfen Sie es und versuchen Sie es erneut.`,
        importSuccessfulTitle: 'Import erfolgreich',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `${categories} Kategorien wurden hinzugefügt.` : '1 Kategorie wurde hinzugefügt.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Es wurden keine Mitglieder hinzugefügt oder aktualisiert.';
            }
            if (added && updated) {
                return `${added} Mitglied${added > 1 ? 's' : ''} hinzugefügt, ${updated} Mitglied${updated > 1 ? 's' : ''} aktualisiert.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} Mitglieder wurden aktualisiert.` : '1 Mitglied wurde aktualisiert.';
            }
            return added > 1 ? `${added} Mitglieder wurden hinzugefügt.` : '1 Mitglied wurde hinzugefügt.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} Tags wurden hinzugefügt.` : '1 Tag wurde hinzugefügt.'),
        importMultiLevelTagsSuccessfulDescription: 'Mehrstufige Tags wurden hinzugefügt.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `${rates} Pauschalraten wurden hinzugefügt.` : '1 Pauschalvergütung wurde hinzugefügt.',
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription:
            'Bitte stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind, und versuchen Sie es erneut. Wenn das Problem weiterhin besteht, wenden Sie sich bitte an Concierge.',
        importDescription: 'Wählen Sie die Felder aus Ihrer Tabelle aus, die Sie zuordnen möchten, indem Sie auf das Dropdown-Menü neben jeder importierten Spalte unten klicken.',
        sizeNotMet: 'Die Dateigröße muss größer als 0 Bytes sein',
        invalidFileMessage:
            'Die von Ihnen hochgeladene Datei ist entweder leer oder enthält ungültige Daten. Bitte stellen Sie sicher, dass die Datei korrekt formatiert ist und die notwendigen Informationen enthält, bevor Sie sie erneut hochladen.',
        importSpreadsheet: 'Tabelle importieren',
        downloadCSV: 'CSV herunterladen',
    },
    receipt: {
        upload: 'Beleg hochladen',
        dragReceiptBeforeEmail: 'Ziehen Sie eine Quittung auf diese Seite, leiten Sie eine Quittung weiter an',
        dragReceiptAfterEmail: 'oder wählen Sie unten eine Datei zum Hochladen aus.',
        chooseReceipt: 'Wählen Sie einen Beleg zum Hochladen aus oder leiten Sie einen Beleg weiter an',
        takePhoto: 'Ein Foto machen',
        cameraAccess: 'Der Kamerazugriff ist erforderlich, um Fotos von Belegen zu machen.',
        deniedCameraAccess: 'Der Kamerazugriff wurde noch nicht gewährt, bitte folgen Sie',
        deniedCameraAccessInstructions: 'diese Anweisungen',
        cameraErrorTitle: 'Kamera-Fehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        locationAccessTitle: 'Standortzugriff erlauben',
        locationAccessMessage: 'Der Zugriff auf den Standort hilft uns, Ihre Zeitzone und Währung überall dort genau zu halten, wo Sie sich aufhalten.',
        locationErrorTitle: 'Standortzugriff erlauben',
        locationErrorMessage: 'Der Zugriff auf den Standort hilft uns, Ihre Zeitzone und Währung überall dort genau zu halten, wo Sie sich aufhalten.',
        allowLocationFromSetting: `Der Zugriff auf den Standort hilft uns, Ihre Zeitzone und Währung überall genau zu halten. Bitte erlauben Sie den Standortzugriff in den Berechtigungseinstellungen Ihres Geräts.`,
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        flash: 'Blitz',
        multiScan: 'Mehrfach-Scan',
        shutter: 'Verschluss',
        gallery: 'Galerie',
        deleteReceipt: 'Beleg löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie diesen Beleg löschen möchten?',
        addReceipt: 'Beleg hinzufügen',
    },
    quickAction: {
        scanReceipt: 'Beleg scannen',
        recordDistance: 'Entfernung verfolgen',
        requestMoney: 'Ausgabe erstellen',
        perDiem: 'Tagespauschale erstellen',
        splitBill: 'Ausgabe aufteilen',
        splitScan: 'Beleg aufteilen',
        splitDistance: 'Abstand teilen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zahlen ${name ?? 'jemand'}`,
        assignTask: 'Aufgabe zuweisen',
        header: 'Schnellaktion',
        noLongerHaveReportAccess: 'Sie haben keinen Zugriff mehr auf Ihr vorheriges Ziel für Schnellaktionen. Wählen Sie unten ein neues aus.',
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
        } = {}) => (formattedAmount ? `Genehmigen Sie ${formattedAmount}` : 'Genehmigen'),
        approved: 'Genehmigt',
        cash: 'Bargeld',
        card: 'Karte',
        original: 'Original',
        split: 'Aufteilen',
        splitExpense: 'Ausgabe aufteilen',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} von ${merchant}`,
        addSplit: 'Aufteilung hinzufügen',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} höher als die ursprünglichen Ausgaben.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist ${amount} weniger als die ursprünglichen Ausgaben.`,
        splitExpenseZeroAmount: 'Bitte geben Sie einen gültigen Betrag ein, bevor Sie fortfahren.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Bearbeite ${amount} für ${merchant}`,
        removeSplit: 'Aufteilung entfernen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zahlen ${name ?? 'jemand'}`,
        expense: 'Ausgabe',
        categorize: 'Kategorisieren',
        share: 'Teilen',
        participants: 'Teilnehmer',
        createExpense: 'Ausgabe erstellen',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Erstelle ${expensesNumber} Ausgaben`,
        addExpense: 'Ausgabe hinzufügen',
        chooseRecipient: 'Empfänger auswählen',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Erstelle ${amount} Ausgabe`,
        confirmDetails: 'Details bestätigen',
        pay: 'Bezahlen',
        cancelPayment: 'Zahlung stornieren',
        cancelPaymentConfirmation: 'Sind Sie sicher, dass Sie diese Zahlung stornieren möchten?',
        viewDetails: 'Details anzeigen',
        pending: 'Ausstehend',
        canceled: 'Abgebrochen',
        posted: 'Veröffentlicht',
        deleteReceipt: 'Beleg löschen',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `hat eine Ausgabe in diesem Bericht gelöscht, ${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `hat eine Ausgabe verschoben${reportName ? `von ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `diese Ausgabe verschoben${reportName ? `an <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'diese Ausgabe in deinen persönlichen Bereich verschoben',
        pendingMatchWithCreditCard: 'Beleg wartet auf Übereinstimmung mit Kartentransaktion',
        pendingMatch: 'Ausstehende Übereinstimmung',
        pendingMatchWithCreditCardDescription: 'Beleg wartet auf Übereinstimmung mit Kartentransaktion. Als Barzahlung markieren, um abzubrechen.',
        markAsCash: 'Als Barzahlung markieren',
        routePending: 'Route ausstehend...',
        receiptScanning: () => ({
            one: 'Belegscannen...',
            other: 'Belege werden gescannt...',
        }),
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Machen Sie Fotos von all Ihren Belegen auf einmal und bestätigen Sie dann die Details selbst oder lassen Sie SmartScan die Arbeit übernehmen.',
        receiptScanInProgress: 'Belegscan läuft',
        receiptScanInProgressDescription: 'Belegscan läuft. Kommen Sie später zurück oder geben Sie die Details jetzt ein.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Mögliche doppelte Ausgaben erkannt. Überprüfen Sie die Duplikate, um die Einreichung zu ermöglichen.'
                : 'Mögliche doppelte Ausgaben erkannt. Überprüfen Sie die Duplikate, um die Genehmigung zu ermöglichen.',
        receiptIssuesFound: () => ({
            one: 'Problem gefunden',
            other: 'Gefundene Probleme',
        }),
        fieldPending: 'Ausstehend...',
        defaultRate: 'Standardrate',
        receiptMissingDetails: 'Beleg fehlt Details',
        missingAmount: 'Fehlender Betrag',
        missingMerchant: 'Fehlender Händler',
        receiptStatusTitle: 'Scannen…',
        receiptStatusText: 'Nur Sie können diesen Beleg sehen, während er gescannt wird. Schauen Sie später noch einmal vorbei oder geben Sie jetzt die Details ein.',
        receiptScanningFailed: 'Das Scannen des Belegs ist fehlgeschlagen. Bitte geben Sie die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Die Buchung kann einige Tage dauern.',
        companyInfo: 'Firmeninformationen',
        companyInfoDescription: 'Wir benötigen noch einige weitere Informationen, bevor Sie Ihre erste Rechnung senden können.',
        yourCompanyName: 'Ihr Firmenname',
        yourCompanyWebsite: 'Die Website Ihres Unternehmens',
        yourCompanyWebsiteNote: 'Wenn Sie keine Website haben, können Sie stattdessen das LinkedIn- oder Social-Media-Profil Ihres Unternehmens angeben.',
        invalidDomainError: 'Sie haben eine ungültige Domain eingegeben. Bitte geben Sie eine gültige Domain ein, um fortzufahren.',
        publicDomainError: 'Sie haben eine öffentliche Domain eingegeben. Um fortzufahren, geben Sie bitte eine private Domain ein.',
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
            one: 'Ausgabe löschen',
            other: 'Ausgaben löschen',
        }),
        deleteConfirmation: () => ({
            one: 'Sind Sie sicher, dass Sie diese Ausgabe löschen möchten?',
            other: 'Sind Sie sicher, dass Sie diese Ausgaben löschen möchten?',
        }),
        deleteReport: 'Bericht löschen',
        deleteReportConfirmation: 'Sind Sie sicher, dass Sie diesen Bericht löschen möchten?',
        settledExpensify: 'Bezahlt',
        done: 'Fertig',
        settledElsewhere: 'Anderswo bezahlt',
        individual: 'Einzelperson',
        business: 'Geschäft',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Bezahlen Sie ${formattedAmount} mit Expensify` : `Mit Expensify bezahlen`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zahlen Sie ${formattedAmount} als Einzelperson` : `Als Einzelperson bezahlen`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zahle ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zahlen Sie ${formattedAmount} als Unternehmen` : `Als Unternehmen bezahlen`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zahle ${formattedAmount} anderswo` : `Anderswo bezahlen`),
        nextStep: 'Nächste Schritte',
        finished: 'Fertiggestellt',
        sendInvoice: ({amount}: RequestAmountParams) => `Rechnung über ${amount} senden`,
        submitAmount: ({amount}: RequestAmountParams) => `Einreichen ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `für ${comment}` : ''}`,
        submitted: `eingereicht`,
        automaticallySubmitted: `eingereicht über <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">Verzögerte Einreichungen</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `Verfolgung ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `aufteilen ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Dein Anteil ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} schuldet ${amount}${comment ? `für ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} schuldet:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}hat ${amount} bezahlt`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} hat bezahlt:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} hat ${amount} ausgegeben`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} hat ausgegeben:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} genehmigt:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} hat ${amount} genehmigt`,
        payerSettled: ({amount}: PayerSettledParams) => `bezahlt ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `${amount} bezahlt. Fügen Sie ein Bankkonto hinzu, um Ihre Zahlung zu erhalten.`,
        automaticallyApproved: `genehmigt über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `genehmigt ${amount}`,
        approvedMessage: `genehmigt`,
        unapproved: `nicht genehmigt`,
        automaticallyForwarded: `genehmigt über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a>`,
        forwarded: `genehmigt`,
        rejectedThisReport: 'diesen Bericht abgelehnt',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `Die Abrechnung wurde begonnen. Die Zahlung wird zurückgehalten, bis ${submitterDisplayName} ein Bankkonto hinzufügt.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} hat die Zahlung storniert`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `hat die Zahlung über ${amount} storniert, weil ${submitterDisplayName} ihre Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} hat ein Bankkonto hinzugefügt. Die Zahlung über ${amount} wurde vorgenommen.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}anderswo bezahlt`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}mit Expensify bezahlt`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} mit Expensify über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a> bezahlt`,
        noReimbursableExpenses: 'Dieser Bericht enthält einen ungültigen Betrag',
        pendingConversionMessage: 'Die Gesamtsumme wird aktualisiert, wenn Sie wieder online sind.',
        changedTheExpense: 'die Ausgabe geändert',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `der ${valueName} zu ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `setze das ${translatedChangedField} auf ${newMerchant}, wodurch der Betrag auf ${newAmountToDisplay} gesetzt wird`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `der ${valueName} (früher ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `den ${valueName} auf ${newValueToDisplay} (zuvor ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `hat das ${translatedChangedField} auf ${newMerchant} geändert (zuvor ${oldMerchant}), wodurch der Betrag auf ${newAmountToDisplay} aktualisiert wurde (zuvor ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `für ${comment}` : 'Ausgabe'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rechnungsbericht Nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} gesendet${comment ? `für ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `Ausgabe von persönlichem Bereich zu ${workspaceName ?? `Chat mit ${reportName}`} verschoben`,
        movedToPersonalSpace: 'Ausgabe in den persönlichen Bereich verschoben',
        tagSelection: 'Wählen Sie ein Tag aus, um Ihre Ausgaben besser zu organisieren.',
        categorySelection: 'Wählen Sie eine Kategorie, um Ihre Ausgaben besser zu organisieren.',
        error: {
            invalidCategoryLength: 'Der Kategoriename überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie eine andere Kategorie.',
            invalidTagLength: 'Der Tag-Name überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie einen anderen Tag.',
            invalidAmount: 'Bitte geben Sie einen gültigen Betrag ein, bevor Sie fortfahren.',
            invalidIntegerAmount: 'Bitte geben Sie einen Betrag in ganzen Dollar ein, bevor Sie fortfahren.',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Der maximale Steuerbetrag beträgt ${amount}`,
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen',
            invalidSplitParticipants: 'Bitte geben Sie für mindestens zwei Teilnehmer einen Betrag größer als Null ein.',
            invalidSplitYourself: 'Bitte geben Sie einen Betrag ungleich Null für Ihre Aufteilung ein.',
            noParticipantSelected: 'Bitte wählen Sie einen Teilnehmer aus',
            other: 'Unerwarteter Fehler. Bitte versuchen Sie es später erneut.',
            genericCreateFailureMessage: 'Unerwarteter Fehler beim Einreichen dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuchen Sie es später erneut.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler bei der Verarbeitung dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Entfernen dieser Ausgabe aus dem Wartestatus. Bitte versuchen Sie es später erneut.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim Löschen dieses Belegs. Bitte versuchen Sie es später erneut.',
            receiptFailureMessage: 'Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten. Bitte',
            receiptFailureMessageShort: 'Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten.',
            tryAgainMessage: 'versuchen Sie es erneut',
            saveFileMessage: 'Beleg speichern',
            uploadLaterMessage: 'später hochzuladen.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim Löschen dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericSmartscanFailureMessage: 'Transaktion hat fehlende Felder',
            duplicateWaypointsErrorMessage: 'Bitte entfernen Sie doppelte Wegpunkte',
            atLeastTwoDifferentWaypoints: 'Bitte geben Sie mindestens zwei verschiedene Adressen ein',
            splitExpenseMultipleParticipantsErrorMessage:
                'Eine Ausgabe kann nicht zwischen einem Arbeitsbereich und anderen Mitgliedern aufgeteilt werden. Bitte aktualisieren Sie Ihre Auswahl.',
            invalidMerchant: 'Bitte geben Sie einen gültigen Händler ein',
            atLeastOneAttendee: 'Mindestens ein Teilnehmer muss ausgewählt werden',
            invalidQuantity: 'Bitte geben Sie eine gültige Menge ein',
            quantityGreaterThanZero: 'Die Menge muss größer als null sein',
            invalidSubrateLength: 'Es muss mindestens eine Unterrate vorhanden sein.',
            invalidRate:
                'Der Satz "Rate not valid for this workspace. Please select an available rate from the workspace." wird auf Deutsch übersetzt als:\n\n"Der Satz ist für diesen Arbeitsbereich nicht gültig. Bitte wählen Sie einen verfügbaren Satz aus dem Arbeitsbereich aus."',
        },
        dismissReceiptError: 'Fehler verwerfen',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn Sie diesen Fehler verwerfen, wird Ihre hochgeladene Quittung vollständig entfernt. Sind Sie sicher?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `Die Abrechnung wurde begonnen. Die Zahlung wird zurückgehalten, bis ${submitterDisplayName} seine Brieftasche aktiviert.`,
        enableWallet: 'Brieftasche aktivieren',
        hold: 'Warten',
        unhold: 'Hold aufheben',
        holdExpense: 'Ausgabe zurückhalten',
        unholdExpense: 'Ausstehende Ausgabe freigeben',
        heldExpense: 'hat diese Ausgabe gehalten',
        unheldExpense: 'diese Ausgabe zurückgenommen',
        moveUnreportedExpense: 'Unberichtete Ausgabe verschieben',
        addUnreportedExpense: 'Unberichtete Ausgabe hinzufügen',
        createNewExpense: 'Neue Ausgabe erstellen',
        selectUnreportedExpense: 'Wählen Sie mindestens eine Ausgabe aus, die dem Bericht hinzugefügt werden soll.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Es sieht so aus, als hätten Sie keine nicht gemeldeten Ausgaben. Versuchen Sie, unten eine zu erstellen.',
        addUnreportedExpenseConfirm: 'Zum Bericht hinzufügen',
        explainHold: 'Erklären Sie, warum Sie diese Ausgabe zurückhalten.',
        undoSubmit: 'Übermittlung rückgängig machen',
        retracted: 'retracted',
        undoClose: 'Schließen rückgängig machen',
        reopened: 'wieder geöffnet',
        reopenReport: 'Bericht erneut öffnen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dieser Bericht wurde bereits nach ${connectionName} exportiert. Änderungen könnten zu Datenabweichungen führen. Sind Sie sicher, dass Sie diesen Bericht erneut öffnen möchten?`,
        reason: 'Grund',
        holdReasonRequired: 'Ein Grund ist erforderlich, wenn gehalten wird.',
        expenseWasPutOnHold: 'Die Ausgabe wurde zurückgestellt',
        expenseOnHold: 'Diese Ausgabe wurde zurückgestellt. Bitte überprüfen Sie die Kommentare für die nächsten Schritte.',
        expensesOnHold: 'Alle Ausgaben wurden zurückgestellt. Bitte überprüfen Sie die Kommentare für die nächsten Schritte.',
        expenseDuplicate: 'Diese Ausgabe hat ähnliche Details wie eine andere. Bitte überprüfen Sie die Duplikate, um fortzufahren.',
        someDuplicatesArePaid: 'Einige dieser Duplikate wurden bereits genehmigt oder bezahlt.',
        reviewDuplicates: 'Duplikate überprüfen',
        keepAll: 'Behalte alles',
        confirmApprove: 'Bestätigen Sie den Genehmigungsbetrag',
        confirmApprovalAmount: 'Genehmigen Sie nur konforme Ausgaben oder genehmigen Sie den gesamten Bericht.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchten Sie sie trotzdem genehmigen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchten Sie trotzdem genehmigen?',
        }),
        confirmPay: 'Zahlungsbetrag bestätigen',
        confirmPayAmount: 'Zahlen Sie, was nicht zurückgehalten wird, oder zahlen Sie den gesamten Bericht.',
        confirmPayAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchten Sie trotzdem bezahlen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchten Sie trotzdem bezahlen?',
        }),
        payOnly: 'Nur bezahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Diese Anfrage ist aktiv',
        holdEducationalText: 'halten',
        whatIsHoldExplain: 'Hold ist wie das Drücken der „Pause“-Taste bei einer Ausgabe, um vor der Genehmigung oder Zahlung weitere Details anzufordern.',
        holdIsLeftBehind: 'Genehmigte oder bezahlte Ausgaben werden in einen anderen Bericht verschoben.',
        unholdWhenReady: 'Genehmiger können Ausgaben freigeben, wenn sie zur Genehmigung oder Zahlung bereit sind.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: 'Überprüfen Sie diese Punkte doppelt, da sie sich beim Verschieben von Berichten in einen neuen Arbeitsbereich häufig ändern.',
            reCategorize: '<strong>Kategorisieren Sie alle Ausgaben neu</strong>, um den Workspace-Regeln zu entsprechen.',
            workflows: 'Dieser Bericht kann nun einem anderen <strong>Genehmigungsworkflow</strong> unterliegen.',
        },
        changeWorkspace: 'Arbeitsbereich wechseln',
        set: 'einstellen',
        changed: 'geändert',
        removed: 'entfernt',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'Wählen Sie einen Erstattungssatz pro Meile oder Kilometer für den Arbeitsbereich aus',
        unapprove: 'Ablehnen',
        unapproveReport: 'Bericht ablehnen',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dieser Bericht wurde bereits nach ${accountingIntegration} exportiert. Eine Änderung kann zu Datenabweichungen führen. Sind Sie sicher, dass Sie die Genehmigung dieses Berichts aufheben möchten?`,
        reimbursable: 'erstattungsfähig',
        nonReimbursable: 'nicht erstattungsfähig',
        bookingPending: 'Diese Buchung ist ausstehend',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, da sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, da das Reisedatum vergangen ist. Fügen Sie bei Bedarf eine Ausgabe für den Endbetrag hinzu.',
        attendees: 'Teilnehmer',
        whoIsYourAccountant: 'Wer ist Ihr Buchhalter?',
        paymentComplete: 'Zahlung abgeschlossen',
        time: 'Zeit',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        deleteSubrate: 'Unterbewertung löschen',
        deleteSubrateConfirmation: 'Sind Sie sicher, dass Sie diesen Untertarif löschen möchten?',
        quantity: 'Menge',
        subrateSelection: 'Wählen Sie einen Untertarif und geben Sie eine Menge ein.',
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
        rates: 'Tarife',
        submitsTo: ({name}: SubmitsToParams) => `Reicht bei ${name} ein`,
        moveExpenses: () => ({one: 'Ausgabe verschieben', other: 'Ausgaben verschieben'}),
    },
    share: {
        shareToExpensify: 'In Expensify teilen',
        messageInputLabel: 'Nachricht',
    },
    notificationPreferencesPage: {
        header: 'Benachrichtigungseinstellungen',
        label: 'Benachrichtige mich über neue Nachrichten',
        notificationPreferences: {
            always: 'Sofort',
            daily: 'Täglich',
            mute: 'Stumm',
            hidden: 'Versteckt',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Die Nummer wurde nicht bestätigt. Klicken Sie auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
        emailHasNotBeenValidated: 'Die E-Mail wurde nicht bestätigt. Klicken Sie auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto hochladen',
        removePhoto: 'Foto entfernen',
        editImage: 'Foto bearbeiten',
        viewPhoto: 'Foto ansehen',
        imageUploadFailed: 'Bild-Upload fehlgeschlagen',
        deleteWorkspaceError: 'Entschuldigung, beim Löschen Ihres Workspace-Avatars ist ein unerwartetes Problem aufgetreten.',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Das ausgewählte Bild überschreitet die maximale Upload-Größe von ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Bitte laden Sie ein Bild hoch, das größer als ${minHeightInPx}x${minWidthInPx} Pixel und kleiner als ${maxHeightInPx}x${maxWidthInPx} Pixel ist.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Das Profilbild muss einer der folgenden Typen sein: ${allowedExtensions.join(', ')}.`,
    },
    modal: {
        backdropLabel: 'Modal-Hintergrund',
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Bevorzugte Pronomen',
        selectYourPronouns: 'Wähle deine Pronomen aus',
        selfSelectYourPronoun: 'Wähle dein Pronomen selbst aus',
        emailAddress: 'E-Mail-Adresse',
        setMyTimezoneAutomatically: 'Meine Zeitzone automatisch einstellen',
        timezone: 'Zeitzone',
        invalidFileMessage: 'Ungültige Datei. Bitte versuchen Sie es mit einem anderen Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronisiere',
        profileAvatar: 'Profilbild',
        publicSection: {
            title: 'Öffentlich',
            subtitle: 'Diese Details werden in Ihrem öffentlichen Profil angezeigt. Jeder kann sie sehen.',
        },
        privateSection: {
            title: 'Privat',
            subtitle: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in Ihrem öffentlichen Profil angezeigt.',
        },
    },
    securityPage: {
        title: 'Sicherheitsoptionen',
        subtitle: 'Aktivieren Sie die Zwei-Faktor-Authentifizierung, um Ihr Konto sicher zu halten.',
        goToSecurity: 'Zurück zur Sicherheitsseite',
    },
    shareCodePage: {
        title: 'Ihr Code',
        subtitle: 'Laden Sie Mitglieder zu Expensify ein, indem Sie Ihren persönlichen QR-Code oder Empfehlungslink teilen.',
    },
    pronounsPage: {
        pronouns: 'Pronomen',
        isShownOnProfile: 'Deine Pronomen werden in deinem Profil angezeigt.',
        placeholderText: 'Suche nach Optionen',
    },
    contacts: {
        contactMethod: 'Kontaktmethode',
        contactMethods: 'Kontaktmethoden',
        featureRequiresValidate: 'Diese Funktion erfordert, dass Sie Ihr Konto verifizieren.',
        validateAccount: 'Validieren Sie Ihr Konto',
        helpTextBeforeEmail: 'Fügen Sie weitere Möglichkeiten hinzu, wie man Sie finden kann, und leiten Sie Belege weiter an',
        helpTextAfterEmail: 'von mehreren E-Mail-Adressen.',
        pleaseVerify: 'Bitte verifizieren Sie diese Kontaktmethode',
        getInTouch: 'Wann immer wir Sie kontaktieren müssen, verwenden wir diese Kontaktmethode.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde. Er sollte innerhalb von ein oder zwei Minuten ankommen.`,
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod:
            'Dies ist Ihre aktuelle Standardkontaktmethode. Bevor Sie sie löschen können, müssen Sie eine andere Kontaktmethode auswählen und auf „Als Standard festlegen“ klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'Sind Sie sicher, dass Sie diese Kontaktmethode entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedNewContact: 'Das Hinzufügen dieser Kontaktmethode ist fehlgeschlagen.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Das Senden eines neuen magischen Codes ist fehlgeschlagen. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
            validateSecondaryLogin: 'Falscher oder ungültiger Magic-Code. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Code an.',
            deleteContactMethod: 'Das Löschen der Kontaktmethode ist fehlgeschlagen. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            setDefaultContactMethod: 'Das Festlegen einer neuen Standardkontaktmethode ist fehlgeschlagen. Bitte wenden Sie sich an Concierge für Unterstützung.',
            addContactMethod: 'Das Hinzufügen dieser Kontaktmethode ist fehlgeschlagen. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            enteredMethodIsAlreadySubmitted: 'Diese Kontaktmethode existiert bereits',
            passwordRequired: 'Passwort erforderlich.',
            contactMethodRequired: 'Kontaktmethode ist erforderlich',
            invalidContactMethod: 'Ungültige Kontaktmethode',
        },
        newContactMethod: 'Neue Kontaktmethode',
        goBackContactMethods: 'Zurück zu den Kontaktmethoden',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Er / Ihn / Sein',
        heHimHisTheyThemTheirs: 'Er / Ihn / Sein / Sie / Ihnen / Ihr(e)s',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / Sie / Ihnen / Ihre',
        merMers: 'Meer / Meere',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Pro / Pers',
        theyThemTheirs: 'Sie / Ihnen / Ihre',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Nenne mich beim Namen',
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
        pleaseInstall: 'Bitte aktualisieren Sie auf die neueste Version von New Expensify',
        pleaseInstallExpensifyClassic: 'Bitte installieren Sie die neueste Version von Expensify',
        toGetLatestChanges: 'Für Mobilgeräte oder Desktop laden Sie die neueste Version herunter und installieren Sie sie. Für das Web aktualisieren Sie Ihren Browser.',
        newAppNotAvailable: 'Die neue Expensify-App ist nicht mehr verfügbar.',
    },
    initialSettingsPage: {
        about: 'Über',
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
            description: 'Verwenden Sie die untenstehenden Tools, um die Expensify-Erfahrung zu beheben. Wenn Sie auf Probleme stoßen, bitte',
            submitBug: 'einen Fehler melden',
            confirmResetDescription: 'Alle nicht gesendeten Entwurfsnachrichten gehen verloren, aber der Rest Ihrer Daten ist sicher.',
            resetAndRefresh: 'Zurücksetzen und aktualisieren',
            clientSideLogging: 'Client-seitiges Logging',
            noLogsToShare: 'Keine Protokolle zum Teilen',
            useProfiling: 'Profiling verwenden',
            profileTrace: 'Profilverfolgung',
            releaseOptions: 'Veröffentlichungsoptionen',
            testingPreferences: 'Testen der Einstellungen',
            useStagingServer: 'Staging-Server verwenden',
            forceOffline: 'Offline erzwingen',
            simulatePoorConnection: 'Schlechte Internetverbindung simulieren',
            simulateFailingNetworkRequests: 'Netzwerkanfragen mit Fehler simulieren',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Geräteanmeldeinformationen',
            invalidate: 'Ungültig machen',
            destroy: 'Zerstören',
            maskExportOnyxStateData: 'Fragile Mitgliederdaten beim Exportieren des Onyx-Status maskieren',
            exportOnyxState: 'Onyx-Status exportieren',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Test crash',
            resetToOriginalState: 'Auf den ursprünglichen Zustand zurücksetzen',
            usingImportedState: 'Sie verwenden importierten Status. Drücken Sie hier, um ihn zu löschen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ungültige Datei',
            invalidFileDescription: 'Die Datei, die Sie importieren möchten, ist ungültig. Bitte versuchen Sie es erneut.',
            invalidateWithDelay: 'Mit Verzögerung ungültig machen',
        },
        debugConsole: {
            saveLog: 'Protokoll speichern',
            shareLog: 'Protokoll teilen',
            enterCommand: 'Befehl eingeben',
            execute: 'Ausführen',
            noLogsAvailable: 'Keine Protokolle verfügbar',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `Die Protokollgröße überschreitet das Limit von ${size} MB. Bitte verwenden Sie stattdessen "Protokoll speichern", um die Protokolldatei herunterzuladen.`,
            logs: 'Protokolle',
            viewConsole: 'Konsole anzeigen',
        },
        security: 'Sicherheit',
        signOut: 'Abmelden',
        restoreStashed: 'Gespeicherten Login wiederherstellen',
        signOutConfirmationText: 'Sie verlieren alle Offline-Änderungen, wenn Sie sich abmelden.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Read the',
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
        closeAccount: 'Konto schließen',
        reasonForLeavingPrompt: 'Wir würden es sehr bedauern, Sie zu verlieren! Würden Sie uns bitte mitteilen, warum, damit wir uns verbessern können?',
        enterMessageHere: 'Geben Sie hier Ihre Nachricht ein',
        closeAccountWarning: 'Das Schließen Ihres Kontos kann nicht rückgängig gemacht werden.',
        closeAccountPermanentlyDeleteData: 'Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Dadurch werden alle ausstehenden Ausgaben dauerhaft gelöscht.',
        enterDefaultContactToConfirm: 'Bitte geben Sie Ihre bevorzugte Kontaktmethode ein, um zu bestätigen, dass Sie Ihr Konto schließen möchten. Ihre bevorzugte Kontaktmethode ist:',
        enterDefaultContact: 'Geben Sie Ihre bevorzugte Kontaktmethode ein',
        defaultContact: 'Standardkontaktmethode:',
        enterYourDefaultContactMethod: 'Bitte geben Sie Ihre bevorzugte Kontaktmethode ein, um Ihr Konto zu schließen.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Konten zusammenführen',
        accountDetails: {
            accountToMergeInto: 'Geben Sie das Konto ein, in das Sie zusammenführen möchten',
            notReversibleConsent: 'Ich verstehe, dass dies nicht umkehrbar ist',
        },
        accountValidate: {
            confirmMerge: 'Sind Sie sicher, dass Sie die Konten zusammenführen möchten?',
            lossOfUnsubmittedData: `Das Zusammenführen Ihrer Konten ist unwiderruflich und führt zum Verlust aller nicht eingereichten Ausgaben für`,
            enterMagicCode: `Um fortzufahren, geben Sie bitte den gesendeten magischen Code ein an`,
            errors: {
                incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengeführt!',
            successfullyMergedAllData: {
                beforeFirstEmail: `Sie haben alle Daten erfolgreich zusammengeführt von`,
                beforeSecondEmail: `in`,
                afterSecondEmail: `Ab sofort können Sie für dieses Konto entweder die eine oder die andere Anmeldung verwenden.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran',
            limitedSupport: 'Wir unterstützen das Zusammenführen von Konten in New Expensify noch nicht. Bitte führen Sie diese Aktion stattdessen in Expensify Classic durch.',
            reachOutForHelp: {
                beforeLink: 'Fühlen Sie sich frei zu',
                linkText: 'wenden Sie sich an Concierge',
                afterLink: 'wenn Sie Fragen haben!',
            },
            goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Sie können nicht zusammenführen',
            beforeDomain: 'weil es kontrolliert wird von',
            afterDomain: '. Bitte',
            linkText: 'wenden Sie sich an Concierge',
            afterLink: 'für Unterstützung.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Sie können nicht zusammenführen',
            afterEmail: 'in andere Konten, da Ihr Domain-Administrator es als Ihren primären Login festgelegt hat. Bitte führen Sie stattdessen andere Konten darin zusammen.',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Sie können Konten nicht zusammenführen, weil',
                beforeSecondEmail: 'hat die Zwei-Faktor-Authentifizierung (2FA) aktiviert. Bitte deaktivieren Sie 2FA für',
                afterSecondEmail: 'und versuche es erneut.',
            },
            learnMore: 'Erfahren Sie mehr über das Zusammenführen von Konten.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Sie können nicht zusammenführen',
            afterEmail: 'weil es gesperrt ist. Bitte',
            linkText: 'wenden Sie sich an Concierge',
            afterLink: `für Unterstützung.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Sie können Konten nicht zusammenführen, weil',
                afterEmail: 'hat kein Expensify-Konto.',
            },
            addContactMethod: {
                beforeLink: 'Bitte',
                linkText: 'füge es als Kontaktmethode hinzu',
                afterLink: 'stattdessen.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Sie können nicht zusammenführen',
            afterEmail: 'in andere Konten. Bitte führen Sie stattdessen andere Konten in dieses zusammen.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Sie können nicht zusammenführen',
            afterEmail: 'in andere Konten, da es der Rechnungseigentümer eines fakturierten Kontos ist. Bitte fügen Sie stattdessen andere Konten in dieses zusammen.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Versuchen Sie es später noch einmal',
            description: 'Es gab zu viele Versuche, Konten zusammenzuführen. Bitte versuchen Sie es später erneut.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Sie können nicht mit anderen Konten zusammenführen, da es nicht validiert ist. Bitte validieren Sie das Konto und versuchen Sie es erneut.',
        },
        mergeFailureSelfMerge: {
            description: 'Sie können ein Konto nicht mit sich selbst zusammenführen.',
        },
        mergeFailureGenericHeading: 'Konten können nicht zusammengeführt werden',
    },
    lockAccountPage: {
        lockAccount: 'Konto sperren',
        unlockAccount: 'Konto entsperren',
        compromisedDescription:
            'Wenn Sie vermuten, dass Ihr Expensify-Konto kompromittiert wurde, können Sie es sperren, um neue Expensify Card-Transaktionen zu verhindern und unerwünschte Kontenänderungen zu blockieren.',
        domainAdminsDescriptionPartOne: 'Für Domain-Administratoren,',
        domainAdminsDescriptionPartTwo: 'Diese Aktion stoppt alle Aktivitäten und Administratoraktionen der Expensify Card.',
        domainAdminsDescriptionPartThree: 'über Ihre(n) Domain(s).',
        warning: `Sobald Ihr Konto gesperrt ist, wird unser Team den Vorfall untersuchen und unbefugten Zugriff entfernen. Um den Zugriff wiederzuerlangen, müssen Sie mit Concierge zusammenarbeiten, um Ihr Konto zu sichern.`,
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: `Wir konnten Ihr Konto nicht sperren. Bitte chatten Sie mit Concierge, um dieses Problem zu lösen.`,
        chatWithConcierge: 'Chat mit Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Ihr Konto ist gesperrt',
        chatToConciergeToUnlock: 'Chatten Sie mit Concierge, um Sicherheitsbedenken zu klären und Ihr Konto freizuschalten.',
        chatWithConcierge: 'Chat mit Concierge',
    },
    passwordPage: {
        changePassword: 'Passwort ändern',
        changingYourPasswordPrompt: 'Das Ändern Ihres Passworts aktualisiert Ihr Passwort sowohl für Ihr Expensify.com- als auch für Ihr New Expensify-Konto.',
        currentPassword: 'Aktuelles Passwort',
        newPassword: 'Neues Passwort',
        newPasswordPrompt: 'Ihr neues Passwort muss sich von Ihrem alten Passwort unterscheiden und mindestens 8 Zeichen, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
    },
    twoFactorAuth: {
        headerTitle: 'Zwei-Faktor-Authentifizierung',
        twoFactorAuthEnabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        whatIsTwoFactorAuth:
            'Die Zwei-Faktor-Authentifizierung (2FA) hilft, Ihr Konto sicher zu halten. Beim Anmelden müssen Sie einen Code eingeben, der von Ihrer bevorzugten Authenticator-App generiert wird.',
        disableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung deaktivieren',
        explainProcessToRemove: 'Um die Zwei-Faktor-Authentifizierung (2FA) zu deaktivieren, geben Sie bitte einen gültigen Code aus Ihrer Authentifizierungs-App ein.',
        disabled: 'Die Zwei-Faktor-Authentifizierung ist jetzt deaktiviert',
        noAuthenticatorApp: 'Sie benötigen keine Authenticator-App mehr, um sich bei Expensify anzumelden.',
        stepCodes: 'Wiederherstellungscodes',
        keepCodesSafe: 'Bewahren Sie diese Wiederherstellungscodes sicher auf!',
        codesLoseAccess:
            'Wenn Sie den Zugriff auf Ihre Authentifikator-App verlieren und diese Codes nicht haben, verlieren Sie den Zugriff auf Ihr Konto.\n\nHinweis: Das Einrichten der Zwei-Faktor-Authentifizierung meldet Sie von allen anderen aktiven Sitzungen ab.',
        errorStepCodes: 'Bitte kopieren oder laden Sie die Codes herunter, bevor Sie fortfahren.',
        stepVerify: 'Überprüfen',
        scanCode: 'Scannen Sie den QR-Code mit Ihrem',
        authenticatorApp: 'Authentifikator-App',
        addKey: 'Oder fügen Sie diesen geheimen Schlüssel zu Ihrer Authenticator-App hinzu:',
        enterCode: 'Geben Sie dann den sechsstelligen Code ein, der von Ihrer Authenticator-App generiert wurde.',
        stepSuccess: 'Fertiggestellt',
        enabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        congrats: 'Glückwunsch! Jetzt hast du diese zusätzliche Sicherheit.',
        copy: 'Kopieren',
        disable: 'Deaktivieren',
        enableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung aktivieren',
        pleaseEnableTwoFactorAuth: 'Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredDescription: 'Aus Sicherheitsgründen erfordert Xero eine Zwei-Faktor-Authentifizierung, um die Integration zu verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Zwei-Faktor-Authentifizierung erforderlich',
        twoFactorAuthIsRequiredForAdminsTitle: 'Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung',
        twoFactorAuthIsRequiredForAdminsDescription:
            'Ihre Xero-Buchhaltungsverbindung erfordert die Verwendung der Zwei-Faktor-Authentifizierung. Um Expensify weiterhin zu nutzen, aktivieren Sie diese bitte.',
        twoFactorAuthCannotDisable: '2FA kann nicht deaktiviert werden',
        twoFactorAuthRequired: 'Für Ihre Xero-Verbindung ist die Zwei-Faktor-Authentifizierung (2FA) erforderlich und kann nicht deaktiviert werden.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
            incorrectRecoveryCode: 'Falscher Wiederherstellungscode. Bitte versuchen Sie es erneut.',
        },
        useRecoveryCode: 'Wiederherstellungscode verwenden',
        recoveryCode: 'Wiederherstellungscode',
        use2fa: 'Verwenden Sie den Zwei-Faktor-Authentifizierungscode',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
            incorrect2fa: 'Falscher Code für die Zwei-Faktor-Authentifizierung. Bitte versuchen Sie es erneut.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Passwort aktualisiert!',
        allSet: 'Du bist startklar. Bewahre dein neues Passwort sicher auf.',
    },
    privateNotes: {
        title: 'Private Notizen',
        personalNoteMessage: 'Behalte hier Notizen zu diesem Chat. Du bist die einzige Person, die diese Notizen hinzufügen, bearbeiten oder ansehen kann.',
        sharedNoteMessage: 'Behalte hier Notizen zu diesem Chat. Expensify-Mitarbeiter und andere Mitglieder der team.expensify.com-Domain können diese Notizen einsehen.',
        composerLabel: 'Notizen',
        myNote: 'Meine Notiz',
        error: {
            genericFailureMessage: 'Private Notizen konnten nicht gespeichert werden',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Bitte geben Sie einen gültigen Sicherheitscode ein',
        },
        securityCode: 'Sicherheitscode',
        changeBillingCurrency: 'Abrechnungswährung ändern',
        changePaymentCurrency: 'Zahlungswährung ändern',
        paymentCurrency: 'Zahlungswährung',
        paymentCurrencyDescription: 'Wählen Sie eine standardisierte Währung, in die alle persönlichen Ausgaben umgerechnet werden sollen',
        note: 'Hinweis: Die Änderung Ihrer Zahlungwährung kann beeinflussen, wie viel Sie für Expensify bezahlen. Siehe unsere',
        noteLink: 'Preisseite',
        noteDetails: 'für vollständige Details.',
    },
    addDebitCardPage: {
        addADebitCard: 'Debitkarte hinzufügen',
        nameOnCard: 'Name auf der Karte',
        debitCardNumber: 'Debitkartennummer',
        expiration: 'Ablaufdatum',
        expirationDate: 'MMJJ',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Debitkarte wurde erfolgreich hinzugefügt',
        expensifyPassword: 'Expensify Passwort',
        error: {
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte geben Sie eine gültige Postleitzahl ein',
            debitCardNumber: 'Bitte geben Sie eine gültige Debitkartennummer ein',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte geben Sie einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine gültige Rechnungsadresse ein, die keine Postfachadresse ist.',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Zahlungskarte hinzufügen',
        nameOnCard: 'Name auf der Karte',
        paymentCardNumber: 'Kartennummer',
        expiration: 'Ablaufdatum',
        expirationDate: 'MMJJ',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Zahlungskarte wurde erfolgreich hinzugefügt',
        expensifyPassword: 'Expensify Passwort',
        error: {
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte geben Sie eine gültige Postleitzahl ein',
            paymentCardNumber: 'Bitte geben Sie eine gültige Kartennummer ein',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte geben Sie einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine gültige Rechnungsadresse ein, die keine Postfachadresse ist.',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein',
        },
    },
    walletPage: {
        balance: 'Kontostand',
        paymentMethodsTitle: 'Zahlungsmethoden',
        setDefaultConfirmation: 'Standard-Zahlungsmethode festlegen',
        setDefaultSuccess: 'Standardzahlungsmethode festgelegt!',
        deleteAccount: 'Konto löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie dieses Konto löschen möchten?',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als Ihre Standardzahlungsmethode ist ein Fehler aufgetreten',
            invalidBankAccount: 'Dieses Bankkonto ist vorübergehend gesperrt.',
            notOwnerOfFund: 'Beim Festlegen dieser Karte als Ihre Standardzahlungsmethode ist ein Fehler aufgetreten',
            setDefaultFailure: 'Etwas ist schiefgelaufen. Bitte chatten Sie mit Concierge für weitere Unterstützung.',
        },
        addBankAccountFailure: 'Beim Versuch, Ihr Bankkonto hinzuzufügen, ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Schneller dein Geld zurückbekommen',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Geld in Ihrer lokalen Währung erhalten',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Senden und Empfangen von Geld mit Freunden. Nur US-Bankkonten.',
        enableWallet: 'Brieftasche aktivieren',
        addBankAccountToSendAndReceive: 'Lass dir Ausgaben, die du in einem Workspace einreichst, zurückerstatten.',
        addBankAccount: 'Bankkonto hinzufügen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Dies sind Karten, die von einem Workspace-Administrator zugewiesen wurden, um die Unternehmensausgaben zu verwalten.',
        expensifyCard: 'Expensify-Karte',
        walletActivationPending: 'Wir überprüfen Ihre Informationen. Bitte schauen Sie in ein paar Minuten noch einmal vorbei!',
        walletActivationFailed: 'Leider kann Ihre Wallet derzeit nicht aktiviert werden. Bitte kontaktieren Sie Concierge für weitere Unterstützung.',
        addYourBankAccount: 'Fügen Sie Ihr Bankkonto hinzu',
        addBankAccountBody: 'Lassen Sie uns Ihr Bankkonto mit Expensify verbinden, damit es einfacher denn je ist, Zahlungen direkt in der App zu senden und zu empfangen.',
        chooseYourBankAccount: 'Wählen Sie Ihr Bankkonto aus',
        chooseAccountBody: 'Stellen Sie sicher, dass Sie die richtige auswählen.',
        confirmYourBankAccount: 'Bestätigen Sie Ihr Bankkonto',
    },
    cardPage: {
        expensifyCard: 'Expensify-Karte',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Intelligentes Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können mit dieser Karte bis zu ${formattedLimit} ausgeben, und das Limit wird zurückgesetzt, sobald Ihre eingereichten Ausgaben genehmigt werden.`,
        },
        fixedLimit: {
            name: 'Fester Grenzwert',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Sie können bis zu ${formattedLimit} mit dieser Karte ausgeben, danach wird sie deaktiviert.`,
        },
        monthlyLimit: {
            name: 'Monatliches Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können mit dieser Karte bis zu ${formattedLimit} pro Monat ausgeben. Das Limit wird am 1. Tag jedes Kalendermonats zurückgesetzt.`,
        },
        virtualCardNumber: 'Virtuelle Kartennummer',
        travelCardCvv: 'Reisekarten-CVV',
        physicalCardNumber: 'Physische Kartennummer',
        getPhysicalCard: 'Physische Karte erhalten',
        reportFraud: 'Virtuellen Kartenbetrug melden',
        reportTravelFraud: 'Reise-Kartenbetrug melden',
        reviewTransaction: 'Transaktion überprüfen',
        suspiciousBannerTitle: 'Verdächtige Transaktion',
        suspiciousBannerDescription: 'Wir haben verdächtige Transaktionen auf Ihrer Karte festgestellt. Tippen Sie unten, um sie zu überprüfen.',
        cardLocked: 'Ihre Karte ist vorübergehend gesperrt, während unser Team das Konto Ihres Unternehmens überprüft.',
        cardDetails: {
            cardNumber: 'Virtuelle Kartennummer',
            expiration: 'Ablaufdatum',
            cvv: 'CVV',
            address: 'Adresse',
            revealDetails: 'Details anzeigen',
            revealCvv: 'CVV anzeigen',
            copyCardNumber: 'Kartennummer kopieren',
            updateAddress: 'Adresse aktualisieren',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Zu ${platform} Wallet hinzugefügt`,
        cardDetailsLoadingFailure: 'Beim Laden der Kartendetails ist ein Fehler aufgetreten. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
        validateCardTitle: 'Lassen Sie uns sicherstellen, dass Sie es sind',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde, um Ihre Kartendetails anzuzeigen. Er sollte innerhalb von ein oder zwei Minuten eintreffen.`,
    },
    workflowsPage: {
        workflowTitle: 'Ausgeben',
        workflowDescription: 'Konfigurieren Sie einen Workflow vom Zeitpunkt der Ausgabe bis hin zur Genehmigung und Zahlung.',
        delaySubmissionTitle: 'Einreichungen verzögern',
        delaySubmissionDescription:
            'Wählen Sie einen benutzerdefinierten Zeitplan für die Einreichung von Ausgaben oder lassen Sie diese Option deaktiviert für Echtzeit-Updates zu den Ausgaben.',
        submissionFrequency: 'Einreichungshäufigkeit',
        submissionFrequencyDateOfMonth: 'Datum des Monats',
        addApprovalsTitle: 'Genehmigungen hinzufügen',
        addApprovalButton: 'Genehmigungsworkflow hinzufügen',
        addApprovalTip: 'Dieser Standard-Workflow gilt für alle Mitglieder, es sei denn, es existiert ein spezifischerer Workflow.',
        approver: 'Genehmiger',
        connectBankAccount: 'Bankkonto verbinden',
        addApprovalsDescription: 'Erfordert eine zusätzliche Genehmigung, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen tätigen oder verfolgen',
        makeOrTrackPaymentsDescription:
            'Fügen Sie einen autorisierten Zahler für Zahlungen hinzu, die in Expensify getätigt werden, oder verfolgen Sie Zahlungen, die anderswo vorgenommen wurden.',
        editor: {
            submissionFrequency: 'Wählen Sie, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
        },
        frequencyDescription: 'Wählen Sie, wie oft die Ausgaben automatisch eingereicht werden sollen, oder stellen Sie es auf manuell.',
        frequencies: {
            instant: 'Sofort',
            weekly: 'Wöchentlich',
            monthly: 'Monatlich',
            twiceAMonth: 'Zweimal im Monat',
            byTrip: 'Nach Reise',
            manually: 'Manuell',
            daily: 'Täglich',
            lastDayOfMonth: 'Letzter Tag des Monats',
            lastBusinessDayOfMonth: 'Letzter Geschäftstag des Monats',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Erste',
                '2': 'Zweite',
                '3': 'Dritte',
                '4': 'Vierte',
                '5': 'Fünfte',
                '6': 'Sechste',
                '7': 'Siebte',
                '8': 'Achter',
                '9': 'Neunte',
                '10': 'Zehnte',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied gehört bereits zu einem anderen Genehmigungsworkflow. Alle Änderungen hier werden dort ebenfalls übernommen.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> genehmigt Berichte bereits für <strong>${name2}</strong>. Bitte wählen Sie einen anderen Genehmiger, um einen zirkulären Arbeitsablauf zu vermeiden.`,
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Mitglieder des Arbeitsbereichs gehören bereits zu einem bestehenden Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmiger gehören zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'Die verspätete Einreichung konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        autoReportingFrequencyErrorMessage: 'Die Einreichungshäufigkeit konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Frequenz konnte nicht geändert werden. Bitte versuchen Sie es erneut oder wenden Sie sich an den Support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bestätigen',
        header: 'Fügen Sie weitere Genehmiger hinzu und bestätigen Sie.',
        additionalApprover: 'Zusätzlicher Genehmiger',
        submitButton: 'Workflow hinzufügen',
    },
    workflowsEditApprovalsPage: {
        title: 'Genehmigungsworkflow bearbeiten',
        deleteTitle: 'Genehmigungsworkflow löschen',
        deletePrompt: 'Sind Sie sicher, dass Sie diesen Genehmigungsworkflow löschen möchten? Alle Mitglieder folgen anschließend dem Standardworkflow.',
    },
    workflowsExpensesFromPage: {
        title: 'Ausgaben von',
        header: 'Wenn die folgenden Mitglieder Ausgaben einreichen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Der Genehmiger konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        header: 'An dieses Mitglied zur Genehmigung senden:',
    },
    workflowsPayerPage: {
        title: 'Autorisierter Zahler',
        genericErrorMessage: 'Der autorisierte Zahler konnte nicht geändert werden. Bitte versuchen Sie es erneut.',
        admins: 'Administratoren',
        payer: 'Zahler',
        paymentAccount: 'Zahlungskonto',
    },
    reportFraudPage: {
        title: 'Virtuellen Kartenbetrug melden',
        description:
            'Wenn Ihre virtuellen Kartendaten gestohlen oder kompromittiert wurden, deaktivieren wir Ihre bestehende Karte dauerhaft und stellen Ihnen eine neue virtuelle Karte mit neuer Nummer zur Verfügung.',
        deactivateCard: 'Karte deaktivieren',
        reportVirtualCardFraud: 'Virtuellen Kartenbetrug melden',
    },
    reportFraudConfirmationPage: {
        title: 'Kartenbetrug gemeldet',
        description: 'Wir haben Ihre bestehende Karte dauerhaft deaktiviert. Wenn Sie zurückkehren, um Ihre Kartendetails anzusehen, steht Ihnen eine neue virtuelle Karte zur Verfügung.',
        buttonText: 'Verstanden, danke!',
    },
    activateCardPage: {
        activateCard: 'Karte aktivieren',
        pleaseEnterLastFour: 'Bitte geben Sie die letzten vier Ziffern Ihrer Karte ein.',
        activatePhysicalCard: 'Physische Karte aktivieren',
        error: {
            thatDidNotMatch: 'Die letzten 4 Ziffern Ihrer Karte stimmen nicht überein. Bitte versuchen Sie es erneut.',
            throttled:
                'Sie haben die letzten 4 Ziffern Ihrer Expensify-Karte zu oft falsch eingegeben. Wenn Sie sicher sind, dass die Zahlen korrekt sind, wenden Sie sich bitte an Concierge, um das Problem zu lösen. Andernfalls versuchen Sie es später erneut.',
        },
    },
    getPhysicalCard: {
        header: 'Physische Karte erhalten',
        nameMessage: 'Geben Sie Ihren Vor- und Nachnamen ein, da dieser auf Ihrer Karte angezeigt wird.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        phoneMessage: 'Geben Sie Ihre Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Geben Sie Ihre Versandadresse ein.',
        streetAddress: 'Straßenadresse',
        city: 'Stadt',
        state: 'Bundesland',
        zipPostcode: 'PLZ/Postleitzahl',
        country: 'Land',
        confirmMessage: 'Bitte bestätigen Sie unten Ihre Angaben.',
        estimatedDeliveryMessage: 'Ihre physische Karte wird in 2-3 Werktagen ankommen.',
        next: 'Weiter',
        getPhysicalCard: 'Physische Karte erhalten',
        shipCard: 'Karte versenden',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Überweisung${amount ? ` ${amount}` : ''}`,
        instant: 'Sofort (Debitkarte)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% Gebühr (${minAmount} Mindestbetrag)`,
        ach: '1-3 Werktage (Bankkonto)',
        achSummary: 'Keine Gebühr',
        whichAccount: 'Welches Konto?',
        fee: 'Gebühr',
        transferSuccess: 'Überweisung erfolgreich!',
        transferDetailBankAccount: 'Ihr Geld sollte in den nächsten 1-3 Werktagen eintreffen.',
        transferDetailDebitCard: 'Ihr Geld sollte sofort ankommen.',
        failedTransfer: 'Ihr Guthaben ist nicht vollständig ausgeglichen. Bitte überweisen Sie auf ein Bankkonto.',
        notHereSubTitle: 'Bitte überweisen Sie Ihr Guthaben von der Wallet-Seite.',
        goToWallet: 'Zur Brieftasche gehen',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Konto auswählen',
    },
    paymentMethodList: {
        addPaymentMethod: 'Zahlungsmethode hinzufügen',
        addNewDebitCard: 'Neue Debitkarte hinzufügen',
        addNewBankAccount: 'Neues Bankkonto hinzufügen',
        accountLastFour: 'Endet in',
        cardLastFour: 'Karte endet auf',
        addFirstPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        defaultPaymentMethod: 'Standard',
    },
    preferencesPage: {
        appSection: {
            title: 'App-Einstellungen',
        },
        testSection: {
            title: 'Testeinstellungen',
            subtitle: 'Einstellungen zur Fehlerbehebung und zum Testen der App in der Staging-Umgebung.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Erhalten Sie relevante Funktionsupdates und Neuigkeiten von Expensify',
        muteAllSounds: 'Alle Sounds von Expensify stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Prioritätsmodus',
        explainerText:
            'Wählen Sie, ob Sie sich nur auf ungelesene und angeheftete Chats konzentrieren möchten oder alles anzeigen wollen, wobei die neuesten und angehefteten Chats oben stehen.',
        priorityModes: {
            default: {
                label: 'Am neuesten',
                description: 'Alle Chats nach dem neuesten Datum sortiert anzeigen',
            },
            gsd: {
                label: '#focus',
                description: 'Nur ungelesene alphabetisch sortiert anzeigen',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF wird erstellt',
        waitForPDF: 'Bitte warten Sie, während wir das PDF erstellen.',
        errorPDF: 'Beim Versuch, Ihre PDF zu erstellen, ist ein Fehler aufgetreten',
        generatedPDF: 'Ihr Bericht-PDF wurde erstellt!',
    },
    reportDescriptionPage: {
        roomDescription: 'Raumbeschreibung',
        roomDescriptionOptional: 'Raumbeschreibung (optional)',
        explainerText: 'Legen Sie eine benutzerdefinierte Beschreibung für den Raum fest.',
    },
    groupChat: {
        lastMemberTitle: 'Achtung!',
        lastMemberWarning: 'Da du die letzte Person hier bist, wird das Verlassen diesen Chat für alle Mitglieder unzugänglich machen. Bist du sicher, dass du gehen möchtest?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Gruppenchat von ${displayName}`,
    },
    languagePage: {
        language: 'Sprache',
        aiGenerated: 'Die Übersetzungen für diese Sprache werden automatisch generiert und können Fehler enthalten.',
    },
    themePage: {
        theme: 'Thema',
        themes: {
            dark: {
                label: 'Dunkel',
            },
            light: {
                label: 'Hell',
            },
            system: {
                label: 'Geräteeinstellungen verwenden',
            },
        },
        chooseThemeBelowOrSync: 'Wählen Sie unten ein Thema aus oder synchronisieren Sie mit Ihren Geräteeinstellungen.',
    },
    termsOfUse: {
        phrase1: 'Durch das Einloggen stimmen Sie den zu',
        phrase2: 'Nutzungsbedingungen',
        phrase3: 'und',
        phrase4: 'Datenschutz',
        phrase5: `Die Geldübertragung wird von ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) gemäß seiner bereitgestellt`,
        phrase6: 'Lizenzen',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen magischen Code erhalten?',
        enterAuthenticatorCode: 'Bitte geben Sie Ihren Authentifikator-Code ein',
        enterRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        requestNewCode: 'Fordern Sie einen neuen Code an in',
        requestNewCodeAfterErrorOccurred: 'Fordern Sie einen neuen Code an',
        error: {
            pleaseFillMagicCode: 'Bitte geben Sie Ihren magischen Code ein',
            incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Bitte füllen Sie alle Felder aus',
        pleaseFillPassword: 'Bitte geben Sie Ihr Passwort ein',
        pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Code ein',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein, um fortzufahren',
        forgot: 'Vergessen?',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        error: {
            incorrectPassword: 'Falsches Passwort. Bitte versuchen Sie es erneut.',
            incorrectLoginOrPassword: 'Falscher Benutzername oder Passwort. Bitte versuchen Sie es erneut.',
            incorrect2fa: 'Falscher Code für die Zwei-Faktor-Authentifizierung. Bitte versuchen Sie es erneut.',
            twoFactorAuthenticationEnabled: 'Du hast 2FA für dieses Konto aktiviert. Bitte melde dich mit deiner E-Mail-Adresse oder Telefonnummer an.',
            invalidLoginOrPassword: 'Ungültiger Login oder Passwort. Bitte versuchen Sie es erneut oder setzen Sie Ihr Passwort zurück.',
            unableToResetPassword:
                'Wir konnten Ihr Passwort nicht ändern. Dies liegt wahrscheinlich an einem abgelaufenen Link zum Zurücksetzen des Passworts in einer alten E-Mail zum Zurücksetzen des Passworts. Wir haben Ihnen einen neuen Link per E-Mail geschickt, damit Sie es erneut versuchen können. Überprüfen Sie Ihren Posteingang und Ihren Spam-Ordner; die E-Mail sollte in wenigen Minuten ankommen.',
            noAccess: 'Sie haben keinen Zugriff auf diese Anwendung. Bitte fügen Sie Ihren GitHub-Benutzernamen für den Zugriff hinzu.',
            accountLocked: 'Ihr Konto wurde nach zu vielen erfolglosen Versuchen gesperrt. Bitte versuchen Sie es in 1 Stunde erneut.',
            fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon oder E-Mail',
        error: {
            invalidFormatEmailLogin: 'Die eingegebene E-Mail ist ungültig. Bitte korrigieren Sie das Format und versuchen Sie es erneut.',
        },
        cannotGetAccountDetails: 'Kontodetails konnten nicht abgerufen werden. Bitte versuchen Sie, sich erneut anzumelden.',
        loginForm: 'Anmeldeformular',
        notYou: ({user}: NotYouParams) => `Nicht ${user}?`,
    },
    onboarding: {
        welcome: 'Willkommen!',
        welcomeSignOffTitleManageTeam: 'Sobald Sie die oben genannten Aufgaben abgeschlossen haben, können wir weitere Funktionen wie Genehmigungs-Workflows und Regeln erkunden!',
        welcomeSignOffTitle: 'Es ist schön, Sie kennenzulernen!',
        explanationModal: {
            title: 'Willkommen bei Expensify',
            description:
                'Eine App, um Ihre geschäftlichen und privaten Ausgaben mit der Geschwindigkeit eines Chats zu verwalten. Probieren Sie es aus und lassen Sie uns wissen, was Sie denken. Es kommt noch viel mehr!',
            secondaryDescription: 'Um zurück zu Expensify Classic zu wechseln, tippen Sie einfach auf Ihr Profilbild > Gehe zu Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Willkommen bei Expensify',
            description: 'Eine App, um alle Ihre geschäftlichen und privaten Ausgaben in einem Chat zu verwalten. Entwickelt für Ihr Unternehmen, Ihr Team und Ihre Freunde.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie heißt du?',
        peopleYouMayKnow: 'Personen, die Sie möglicherweise kennen, sind bereits hier! Bestätigen Sie Ihre E-Mail, um sich ihnen anzuschließen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Jemand von ${domain} hat bereits einen Arbeitsbereich erstellt. Bitte geben Sie den an ${email} gesendeten magischen Code ein.`,
        joinAWorkspace: 'Einem Arbeitsbereich beitreten',
        listOfWorkspaces: 'Hier ist die Liste der Arbeitsbereiche, denen du beitreten kannst. Keine Sorge, du kannst ihnen später jederzeit beitreten, wenn du möchtest.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} Mitglied${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Wo arbeiten Sie?',
        errorSelection: 'Wählen Sie eine Option, um fortzufahren',
        purpose: {
            title: 'Was möchten Sie heute tun?',
            errorContinue: 'Bitte drücken Sie auf Weiter, um die Einrichtung zu starten',
            errorBackButton: 'Bitte beantworten Sie die Einrichtungsfragen, um die App zu starten.',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Von meinem Arbeitgeber zurückgezahlt bekommen',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Verwalte die Ausgaben meines Teams',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Ausgaben verfolgen und budgetieren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatten und Ausgaben mit Freunden aufteilen',
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
            requiredFirstName: 'Bitte geben Sie Ihren Vornamen ein, um fortzufahren',
        },
        workEmail: {
            title: 'Wie lautet Ihre geschäftliche E-Mail-Adresse?',
            subtitle: 'Expensify funktioniert am besten, wenn Sie Ihre Arbeits-E-Mail verbinden.',
            explanationModal: {
                descriptionOne: 'Weiterleiten an receipts@expensify.com zum Scannen',
                descriptionTwo: 'Schließen Sie sich Ihren Kollegen an, die Expensify bereits nutzen',
                descriptionThree: 'Genießen Sie ein individuell angepasstes Erlebnis',
            },
            addWorkEmail: 'Arbeits-E-Mail hinzufügen',
        },
        workEmailValidation: {
            title: 'Bestätigen Sie Ihre Arbeits-E-Mail-Adresse',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) =>
                `Bitte geben Sie den magischen Code ein, der an ${workEmail} gesendet wurde. Er sollte in ein oder zwei Minuten ankommen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Bitte geben Sie eine gültige Arbeits-E-Mail von einer privaten Domain ein, z. B. mitch@company.com',
            offline: 'Wir konnten Ihre Arbeits-E-Mail nicht hinzufügen, da Sie offline zu sein scheinen.',
        },
        mergeBlockScreen: {
            title: 'Arbeits-E-Mail konnte nicht hinzugefügt werden',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Wir konnten ${workEmail} nicht hinzufügen. Bitte versuchen Sie es später erneut in den Einstellungen oder chatten Sie mit Concierge für Unterstützung.`,
        },
        workspace: {
            title: 'Bleiben Sie organisiert mit einem Arbeitsbereich',
            subtitle: 'Schalten Sie leistungsstarke Werkzeuge frei, um Ihr Ausgabenmanagement zu vereinfachen – alles an einem Ort. Mit einem Workspace können Sie:',
            explanationModal: {
                descriptionOne: 'Belege verfolgen und organisieren',
                descriptionTwo: 'Kategorisieren und taggen von Ausgaben',
                descriptionThree: 'Berichte erstellen und teilen',
            },
            price: 'Teste es 30 Tage lang kostenlos, und upgrade dann für nur <strong>5 $/Monat</strong>.',
            createWorkspace: 'Arbeitsbereich erstellen',
        },
        confirmWorkspace: {
            title: 'Arbeitsbereich bestätigen',
            subtitle:
                'Erstellen Sie einen Arbeitsbereich, um Belege zu verfolgen, Ausgaben zu erstatten, Reisen zu verwalten, Berichte zu erstellen und mehr – alles mit der Geschwindigkeit eines Chats.',
        },
        inviteMembers: {
            title: 'Mitglieder einladen',
            subtitle: 'Verwalten und teilen Sie Ihre Ausgaben mit einem Buchhalter oder starten Sie eine Reisegruppe mit Freunden.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Zeig mir das nicht nochmal an',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Der Name darf die Wörter Expensify oder Concierge nicht enthalten.',
            hasInvalidCharacter: 'Der Name darf kein Komma oder Semikolon enthalten',
            requiredFirstName: 'Der Vorname darf nicht leer sein',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wie lautet Ihr vollständiger Name?',
        enterDateOfBirth: 'Wie ist Ihr Geburtsdatum?',
        enterAddress: 'Wie lautet Ihre Adresse?',
        enterPhoneNumber: 'Wie lautet Ihre Telefonnummer?',
        personalDetails: 'Persönliche Daten',
        privateDataMessage: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in Ihrem öffentlichen Profil angezeigt.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Das Datum sollte vor dem ${dateString} liegen`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Datum sollte nach dem ${dateString} liegen`,
            hasInvalidCharacter: 'Der Name darf nur lateinische Zeichen enthalten',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Falsches Postleitzahlenformat${zipFormat ? `Akzeptables Format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Bitte stellen Sie sicher, dass die Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link wurde erneut gesendet',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Ich habe einen magischen Anmeldelink an ${login} gesendet. Bitte überprüfen Sie Ihre ${loginType}, um sich anzumelden.`,
        resendLink: 'Link erneut senden',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Um ${secondaryLogin} zu bestätigen, senden Sie bitte den magischen Code erneut aus den Kontoeinstellungen von ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Wenn Sie keinen Zugriff mehr auf ${primaryLogin} haben, bitte trennen Sie Ihre Konten.`,
        unlink: 'Verknüpfung aufheben',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Sekundäre Anmeldung erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Unser E-Mail-Anbieter hat E-Mails an ${login} vorübergehend aufgrund von Zustellproblemen gesperrt. Um Ihre Anmeldung zu entsperren, folgen Sie bitte diesen Schritten:`,
        confirmThat: ({login}: ConfirmThatParams) => `Bestätigen Sie, dass ${login} korrekt geschrieben ist und eine echte, zustellbare E-Mail-Adresse ist.`,
        emailAliases: 'E-Mail-Alias-Adressen wie "expenses@domain.com" müssen Zugriff auf ihren eigenen E-Mail-Posteingang haben, damit sie ein gültiger Expensify-Login sind.',
        ensureYourEmailClient: 'Stellen Sie sicher, dass Ihr E-Mail-Client E-Mails von expensify.com zulässt.',
        youCanFindDirections: 'Anweisungen, wie Sie diesen Schritt abschließen können, finden Sie hier.',
        helpConfigure: 'aber Sie benötigen möglicherweise die Unterstützung Ihrer IT-Abteilung, um Ihre E-Mail-Einstellungen zu konfigurieren.',
        onceTheAbove: 'Sobald die oben genannten Schritte abgeschlossen sind, wenden Sie sich bitte an',
        toUnblock: 'um Ihre Anmeldung zu entsperren.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Wir konnten SMS-Nachrichten an ${login} nicht zustellen, daher haben wir es vorübergehend gesperrt. Bitte versuchen Sie, Ihre Nummer zu verifizieren:`,
        validationSuccess: 'Ihre Nummer wurde bestätigt! Klicken Sie unten, um einen neuen magischen Anmeldecode zu senden.',
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
            return `Halte durch! Du musst ${timeText} warten, bevor du deine Nummer erneut validieren kannst.`;
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
        addToGroup: 'Zur Gruppe hinzufügen',
    },
    yearPickerPage: {
        year: 'Jahr',
        selectYear: 'Bitte wählen Sie ein Jahr aus',
    },
    focusModeUpdateModal: {
        title: 'Willkommen im #focus-Modus!',
        prompt: 'Behalten Sie den Überblick, indem Sie nur ungelesene Chats oder Chats sehen, die Ihre Aufmerksamkeit erfordern. Keine Sorge, Sie können dies jederzeit in  ändern.',
        settings: 'Einstellungen',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Der gesuchte Chat konnte nicht gefunden werden.',
        getMeOutOfHere: 'Bring mich hier raus',
        iouReportNotFound: 'Die Zahlungsdetails, die Sie suchen, können nicht gefunden werden.',
        notHere: 'Hmm... es ist nicht hier',
        pageNotFound: 'Ups, diese Seite kann nicht gefunden werden',
        noAccess: 'Dieser Chat oder diese Ausgabe wurde möglicherweise gelöscht oder Sie haben keinen Zugriff darauf.\n\nBei Fragen wenden Sie sich bitte an concierge@expensify.com',
        goBackHome: 'Zurück zur Startseite',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups... ${isBreakLine ? '\n' : ''}Etwas ist schiefgelaufen`,
        subtitle: 'Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
    },
    setPasswordPage: {
        enterPassword: 'Passwort eingeben',
        setPassword: 'Passwort festlegen',
        newPasswordPrompt: 'Ihr Passwort muss mindestens 8 Zeichen, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
        passwordFormTitle: 'Willkommen zurück bei der neuen Expensify! Bitte legen Sie Ihr Passwort fest.',
        passwordNotSet: 'Wir konnten Ihr neues Passwort nicht festlegen. Wir haben Ihnen einen Link zum Zurücksetzen des Passworts gesendet, mit dem Sie es erneut versuchen können.',
        setPasswordLinkInvalid: 'Dieser Link zum Festlegen des Passworts ist ungültig oder abgelaufen. Ein neuer wartet in deinem E-Mail-Posteingang auf dich!',
        validateAccount: 'Konto verifizieren',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Fügen Sie ein Emoji hinzu, damit Ihre Kollegen und Freunde auf einfache Weise wissen, was los ist. Sie können optional auch eine Nachricht hinzufügen!',
        today: 'Heute',
        clearStatus: 'Status löschen',
        save: 'Speichern',
        message: 'Nachricht',
        timePeriods: {
            never: 'Nie',
            thirtyMinutes: '30 Minuten',
            oneHour: '1 Stunde',
            afterToday: 'Heute',
            afterWeek: 'Eine Woche',
            custom: 'Benutzerdefiniert',
        },
        untilTomorrow: 'Bis morgen',
        untilTime: ({time}: UntilTimeParams) => `Bis ${time}`,
        date: 'Datum',
        time: 'Zeit',
        clearAfter: 'Nach dem Löschen',
        whenClearStatus: 'Wann sollen wir deinen Status löschen?',
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
        bankInfo: 'Bankinformationen',
        confirmBankInfo: 'Bankinformationen bestätigen',
        manuallyAdd: 'Fügen Sie Ihr Bankkonto manuell hinzu',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        accountEnding: 'Konto endet mit',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in Ihrem Arbeitsbereich verwendet.',
        accountNumber: 'Kontonummer',
        routingNumber: 'Routing-Nummer',
        chooseAnAccountBelow: 'Wählen Sie unten ein Konto aus',
        addBankAccount: 'Bankkonto hinzufügen',
        chooseAnAccount: 'Konto auswählen',
        connectOnlineWithPlaid: 'Melden Sie sich bei Ihrer Bank an',
        connectManually: 'Manuell verbinden',
        desktopConnection:
            'Hinweis: Um eine Verbindung mit Chase, Wells Fargo, Capital One oder Bank of America herzustellen, klicken Sie bitte hier, um diesen Vorgang in einem Browser abzuschließen.',
        yourDataIsSecure: 'Ihre Daten sind sicher',
        toGetStarted: 'Fügen Sie ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify-Karten auszustellen, Rechnungseingänge zu sammeln und Rechnungen an einem Ort zu bezahlen.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitern eine einfachere Möglichkeit, Unternehmensausgaben zu bezahlen - und erstattet zu bekommen.',
        checkHelpLine: 'Ihre Routing-Nummer und Kontonummer finden Sie auf einem Scheck für das Konto.',
        hasPhoneLoginError: {
            phrase1: 'Um ein Bankkonto zu verbinden, bitte',
            link: 'Fügen Sie eine E-Mail als Ihren primären Login hinzu',
            phrase2: 'und versuchen Sie es erneut. Sie können Ihre Telefonnummer als sekundären Login hinzufügen.',
        },
        hasBeenThrottledError: 'Beim Hinzufügen Ihres Bankkontos ist ein Fehler aufgetreten. Bitte warten Sie einige Minuten und versuchen Sie es erneut.',
        hasCurrencyError: {
            phrase1: 'Ups! Es scheint, dass die Währungsangabe Ihres Arbeitsbereichs auf eine andere Währung als USD eingestellt ist. Um fortzufahren, gehen Sie bitte zu',
            link: 'Ihre Arbeitsbereichseinstellungen',
            phrase2: 'auf USD einstellen und es erneut versuchen.',
        },
        error: {
            youNeedToSelectAnOption: 'Bitte wählen Sie eine Option, um fortzufahren',
            noBankAccountAvailable: 'Entschuldigung, es ist kein Bankkonto verfügbar',
            noBankAccountSelected: 'Bitte wählen Sie ein Konto aus',
            taxID: 'Bitte geben Sie eine gültige Steuernummer ein',
            website: 'Bitte geben Sie eine gültige Website ein',
            zipCode: `Bitte geben Sie eine gültige Postleitzahl im Format ein: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Bitte geben Sie eine gültige Telefonnummer ein',
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
            companyName: 'Bitte geben Sie einen gültigen Firmennamen ein',
            addressCity: 'Bitte geben Sie eine gültige Stadt ein',
            addressStreet: 'Bitte geben Sie eine gültige Straßenadresse ein',
            addressState: 'Bitte wählen Sie einen gültigen Bundesstaat aus',
            incorporationDateFuture: 'Das Gründungsdatum darf nicht in der Zukunft liegen',
            incorporationState: 'Bitte wählen Sie einen gültigen Bundesstaat aus',
            industryCode: 'Bitte geben Sie einen gültigen Branchenklassifizierungscode mit sechs Ziffern ein',
            restrictedBusiness: 'Bitte bestätigen Sie, dass das Unternehmen nicht auf der Liste der eingeschränkten Unternehmen steht.',
            routingNumber: 'Bitte geben Sie eine gültige Bankleitzahl ein',
            accountNumber: 'Bitte geben Sie eine gültige Kontonummer ein',
            routingAndAccountNumberCannotBeSame: 'Routing- und Kontonummern dürfen nicht übereinstimmen',
            companyType: 'Bitte wählen Sie einen gültigen Firmentyp aus',
            tooManyAttempts:
                'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option für 24 Stunden deaktiviert. Bitte versuchen Sie es später erneut oder geben Sie die Daten stattdessen manuell ein.',
            address: 'Bitte geben Sie eine gültige Adresse ein',
            dob: 'Bitte wählen Sie ein gültiges Geburtsdatum aus',
            age: 'Muss über 18 Jahre alt sein',
            ssnLast4: 'Bitte geben Sie die gültigen letzten 4 Ziffern der SSN ein',
            firstName: 'Bitte geben Sie einen gültigen Vornamen ein',
            lastName: 'Bitte geben Sie einen gültigen Nachnamen ein',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte fügen Sie ein Standard-Einzahlungskonto oder eine Debitkarte hinzu',
            validationAmounts: 'Die von Ihnen eingegebenen Validierungsbeträge sind falsch. Bitte überprüfen Sie Ihren Kontoauszug und versuchen Sie es erneut.',
            fullName: 'Bitte geben Sie einen gültigen vollständigen Namen ein',
            ownershipPercentage: 'Bitte geben Sie eine gültige Prozentzahl ein',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich Ihr Bankkonto?',
        accountDetailsStepHeader: 'Wie lauten Ihre Kontodaten?',
        accountTypeStepHeader: 'Was für eine Art von Konto ist das?',
        bankInformationStepHeader: 'Wie lauten Ihre Bankdaten?',
        accountHolderInformationStepHeader: 'Was sind die Kontoinhaberdaten?',
        howDoWeProtectYourData: 'Wie schützen wir Ihre Daten?',
        currencyHeader: 'Was ist die Währung Ihres Bankkontos?',
        confirmationStepHeader: 'Überprüfen Sie Ihre Angaben.',
        confirmationStepSubHeader: 'Überprüfen Sie die untenstehenden Details noch einmal und aktivieren Sie das Kontrollkästchen für die Bedingungen zur Bestätigung.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify-Passwort eingeben',
        alreadyAdded: 'Dieses Konto wurde bereits hinzugefügt.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Persönliches Bankkonto hinzugefügt!',
        successMessage: 'Glückwunsch, Ihr Bankkonto ist eingerichtet und bereit, Erstattungen zu erhalten.',
    },
    attachmentView: {
        unknownFilename: 'Unbekannter Dateiname',
        passwordRequired: 'Bitte geben Sie ein Passwort ein',
        passwordIncorrect: 'Falsches Passwort. Bitte versuchen Sie es erneut.',
        failedToLoadPDF: 'PDF-Datei konnte nicht geladen werden',
        pdfPasswordForm: {
            title: 'Passwortgeschütztes PDF',
            infoText: 'Dieses PDF ist passwortgeschützt.',
            beforeLinkText: 'Bitte',
            linkText: 'Passwort eingeben',
            afterLinkText: 'um es anzusehen.',
            formLabel: 'PDF anzeigen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
    },
    messages: {
        errorMessageInvalidPhone: `Bitte geben Sie eine gültige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn Sie sich außerhalb der USA befinden, geben Sie bitte Ihre Landesvorwahl an (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ungültige E-Mail-Adresse',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Mitglied von ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Indem Sie mit der Anforderung zur Aktivierung Ihrer Expensify Wallet fortfahren, bestätigen Sie, dass Sie die Bedingungen gelesen, verstanden und akzeptiert haben',
        facialScan: 'Onfidos Richtlinie und Freigabe für Gesichtserkennungsscans',
        tryAgain: 'Versuchen Sie es erneut',
        verifyIdentity: 'Identität überprüfen',
        letsVerifyIdentity: 'Lassen Sie uns Ihre Identität überprüfen',
        butFirst: `Aber zuerst das Langweilige. Lies dir im nächsten Schritt die rechtlichen Hinweise durch und klicke auf „Akzeptieren“, wenn du bereit bist.`,
        genericError: 'Bei der Verarbeitung dieses Schritts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        cameraPermissionsNotGranted: 'Kamera-Zugriff aktivieren',
        cameraRequestMessage: 'Wir benötigen Zugriff auf Ihre Kamera, um die Verifizierung des Bankkontos abzuschließen. Bitte aktivieren Sie dies über Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage: 'Wir benötigen Zugriff auf Ihr Mikrofon, um die Überprüfung des Bankkontos abzuschließen. Bitte aktivieren Sie dies unter Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte laden Sie ein Originalbild Ihres Ausweises hoch und keine Bildschirmaufnahme oder gescannte Kopie.',
        documentNeedsBetterQuality:
            'Ihr Ausweis scheint beschädigt zu sein oder es fehlen Sicherheitsmerkmale. Bitte laden Sie ein Originalbild eines unbeschädigten Ausweises hoch, der vollständig sichtbar ist.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualität Ihres Ausweises. Bitte laden Sie ein neues Bild hoch, auf dem Ihr gesamter Ausweis deutlich zu sehen ist.',
        selfieIssue: 'Es gibt ein Problem mit deinem Selfie/Video. Bitte lade ein Live-Selfie/Video hoch.',
        selfieNotMatching: 'Ihr Selfie/Video stimmt nicht mit Ihrem Ausweis überein. Bitte laden Sie ein neues Selfie/Video hoch, auf dem Ihr Gesicht deutlich zu sehen ist.',
        selfieNotLive: 'Dein Selfie/Video scheint kein Live-Foto/Video zu sein. Bitte lade ein Live-Selfie/Video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Zusätzliche Details',
        helpText: 'Wir müssen die folgenden Informationen bestätigen, bevor Sie Geld von Ihrem Wallet senden und empfangen können.',
        helpTextIdologyQuestions: 'Wir müssen Ihnen nur noch ein paar Fragen stellen, um Ihre Identität abschließend zu bestätigen.',
        helpLink: 'Erfahren Sie mehr darüber, warum wir dies benötigen.',
        legalFirstNameLabel: 'Rechtlicher Vorname',
        legalMiddleNameLabel: 'Rechtlicher zweiter Vorname',
        legalLastNameLabel: 'Rechtlicher Nachname',
        selectAnswer: 'Bitte wählen Sie eine Antwort, um fortzufahren',
        ssnFull9Error: 'Bitte geben Sie eine gültige neunstellige SSN ein',
        needSSNFull9: 'Wir haben Schwierigkeiten, Ihre SSN zu verifizieren. Bitte geben Sie die vollständigen neun Ziffern Ihrer SSN ein.',
        weCouldNotVerify: 'Wir konnten nicht verifizieren',
        pleaseFixIt: 'Bitte korrigieren Sie diese Informationen, bevor Sie fortfahren.',
        failedKYCTextBefore: 'Wir konnten Ihre Identität nicht verifizieren. Bitte versuchen Sie es später erneut oder wenden Sie sich an',
        failedKYCTextAfter: 'wenn Sie Fragen haben.',
    },
    termsStep: {
        headerTitle: 'Bedingungen und Gebühren',
        headerTitleRefactor: 'Gebühren und Bedingungen',
        haveReadAndAgree: 'Ich habe die Bedingungen gelesen und stimme dem Erhalt zu',
        electronicDisclosures: 'elektronische Offenlegungen',
        agreeToThe: 'Ich stimme zu mit dem',
        walletAgreement: 'Wallet-Vereinbarung',
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Gebühr',
        inactivity: 'Inaktivität',
        noOverdraftOrCredit: 'Keine Überziehungs-/Kreditfunktion.',
        electronicFundsWithdrawal: 'Elektronischer Lastschrifteinzug',
        standard: 'Standard',
        reviewTheFees: 'Schauen Sie sich einige Gebühren an.',
        checkTheBoxes: 'Bitte kreuzen Sie die untenstehenden Kästchen an.',
        agreeToTerms: 'Stimmen Sie den Bedingungen zu und Sie sind startklar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Die Expensify Wallet wird von ${walletProgram} ausgegeben.`,
            perPurchase: 'Pro Kauf',
            atmWithdrawal: 'Geldautomat Abhebung',
            cashReload: 'Bargeldaufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'außerhalb des Netzwerks',
            atmBalanceInquiry: 'Geldautomaten-Saldoabfrage',
            inOrOutOfNetwork: '(im Netzwerk oder außerhalb des Netzwerks)',
            customerService: 'Kundendienst',
            automatedOrLive: '(automatisiert oder Live-Agent)',
            afterTwelveMonths: '(nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir erheben noch eine weitere Art von Gebühr. Diese ist:',
            fdicInsurance: 'Ihre Gelder sind für die FDIC-Versicherung berechtigt.',
            generalInfo: 'Für allgemeine Informationen zu Prepaid-Konten besuchen Sie',
            conditionsDetails: 'Für Details und Bedingungen zu allen Gebühren und Dienstleistungen besuchen Sie',
            conditionsPhone: 'oder rufen Sie +1 833-400-0904 an.',
            instant: '(sofort)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Eine Liste aller Expensify Wallet-Gebühren',
            typeOfFeeHeader: 'Alle Gebühren',
            feeAmountHeader: 'Betrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Ein Konto eröffnen',
            openingAccountDetails: 'Es fallen keine Gebühren für die Kontoeröffnung an.',
            monthlyFeeDetails: 'Es gibt keine monatliche Gebühr.',
            customerServiceTitle: 'Kundendienst',
            customerServiceDetails: 'Es fallen keine Kundendienstgebühren an.',
            inactivityDetails: 'Es gibt keine Inaktivitätsgebühr.',
            sendingFundsTitle: 'Geld an einen anderen Kontoinhaber senden',
            sendingFundsDetails: 'Es fallen keine Gebühren an, wenn Sie Geld an einen anderen Kontoinhaber über Ihr Guthaben, Ihr Bankkonto oder Ihre Debitkarte senden.',
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
            fdicInsuranceBancorp2: 'für Details.',
            contactExpensifyPayments: `Kontaktieren Sie ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} telefonisch unter +1 833-400-0904 oder per E-Mail an`,
            contactExpensifyPayments2: 'oder anmelden bei',
            generalInformation: 'Für allgemeine Informationen zu Prepaid-Konten besuchen Sie',
            generalInformation2: 'Wenn Sie eine Beschwerde über ein Prepaid-Konto haben, rufen Sie das Consumer Financial Protection Bureau unter 1-855-411-2372 an oder besuchen Sie',
            printerFriendlyView: 'Druckerfreundliche Version anzeigen',
            automated: 'Automatisiert',
            liveAgent: 'Live-Agent',
            instant: 'Sofort',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Zahlungen aktivieren',
        activatedTitle: 'Brieftasche aktiviert!',
        activatedMessage: 'Glückwunsch, Ihre Wallet ist eingerichtet und bereit für Zahlungen.',
        checkBackLaterTitle: 'Einen Moment bitte...',
        checkBackLaterMessage: 'Wir überprüfen Ihre Informationen noch. Bitte versuchen Sie es später erneut.',
        continueToPayment: 'Weiter zur Zahlung',
        continueToTransfer: 'Weiter übertragen',
    },
    companyStep: {
        headerTitle: 'Firmeninformationen',
        subtitle: 'Fast fertig! Aus Sicherheitsgründen müssen wir einige Informationen bestätigen:',
        legalBusinessName: 'Rechtlicher Firmenname',
        companyWebsite: 'Firmenwebsite',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        companyType: 'Unternehmenstyp',
        incorporationDate: 'Gründungsdatum',
        incorporationState: 'Gründungsstaat',
        industryClassificationCode: 'Branchenklassifikationscode',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der Liste steht',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-tt)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperativ',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Andere',
        },
        industryClassification: 'Unter welcher Branche ist das Unternehmen klassifiziert?',
        industryClassificationCodePlaceholder: 'Nach Brancheneinstufungscode suchen',
    },
    requestorStep: {
        headerTitle: 'Persönliche Informationen',
        learnMore: 'Mehr erfahren',
        isMyDataSafe: 'Sind meine Daten sicher?',
    },
    personalInfoStep: {
        personalInfo: 'Persönliche Informationen',
        enterYourLegalFirstAndLast: 'Wie lautet Ihr vollständiger Name?',
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        legalName: 'Rechtlicher Name',
        enterYourDateOfBirth: 'Wie ist Ihr Geburtsdatum?',
        enterTheLast4: 'Was sind die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4SSN: 'Letzte 4 Ziffern der Sozialversicherungsnummer',
        enterYourAddress: 'Wie lautet Ihre Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Indem Sie dieses Bankkonto hinzufügen, bestätigen Sie, dass Sie die Bedingungen gelesen, verstanden und akzeptiert haben',
        whatsYourLegalName: 'Wie ist Ihr gesetzlicher Name?',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        whatsYourAddress: 'Wie lautet Ihre Adresse?',
        whatsYourSSN: 'Was sind die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier gibt es keine persönlichen Bonitätsprüfungen!',
        whatsYourPhoneNumber: 'Wie lautet Ihre Telefonnummer?',
        weNeedThisToVerify: 'Wir benötigen dies, um Ihre Wallet zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Firmeninformationen',
        enterTheNameOfYourBusiness: 'Wie heißt Ihr Unternehmen?',
        businessName: 'Rechtlicher Firmenname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steuernummer Ihres Unternehmens?',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Firmenwebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Was für eine Art von Unternehmen ist es?',
        companyType: 'Unternehmenstyp',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperativ',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Andere',
        },
        selectYourCompanyIncorporationDate: 'Was ist das Gründungsdatum Ihres Unternehmens?',
        incorporationDate: 'Gründungsdatum',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-tt)',
        incorporationState: 'Gründungsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem Bundesstaat wurde Ihr Unternehmen gegründet?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der Liste steht',
        businessInfoTitle: 'Geschäftsinformationen',
        legalBusinessName: 'Rechtlicher Firmenname',
        whatsTheBusinessName: 'Wie lautet der Firmenname?',
        whatsTheBusinessAddress: 'Wie lautet die Geschäftsadresse?',
        whatsTheBusinessContactInformation: 'Wie lauten die Geschäftskontaktdaten?',
        whatsTheBusinessRegistrationNumber: 'Wie lautet die Handelsregisternummer?',
        whatsTheBusinessTaxIDEIN: 'Wie lautet die Geschäftssteuer-ID/EIN/USt-IdNr./MwSt.-Registrierungsnummer?',
        whatsThisNumber: 'Was ist das für eine Zahl?',
        whereWasTheBusinessIncorporated: 'Wo wurde das Unternehmen gegründet?',
        whatTypeOfBusinessIsIt: 'Welche Art von Unternehmen ist es?',
        whatsTheBusinessAnnualPayment: 'Wie hoch ist das jährliche Zahlungsvolumen des Unternehmens?',
        whatsYourExpectedAverageReimbursements: 'Wie hoch ist Ihr erwarteter durchschnittlicher Erstattungsbetrag?',
        registrationNumber: 'Registrierungsnummer',
        taxIDEIN: 'Steuer-ID/EIN-Nummer',
        businessAddress: 'Geschäftsadresse',
        businessType: 'Geschäftstyp',
        incorporation: 'Gründung',
        incorporationCountry: 'Gründungsland',
        incorporationTypeName: 'Art der Unternehmensgründung',
        businessCategory: 'Geschäftskategorie',
        annualPaymentVolume: 'Jährliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Jährliches Zahlungsvolumen in ${currencyCode}`,
        averageReimbursementAmount: 'Durchschnittlicher Erstattungsbetrag',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Durchschnittlicher Erstattungsbetrag in ${currencyCode}`,
        selectIncorporationType: 'Inkorporationstyp auswählen',
        selectBusinessCategory: 'Geschäftskategorie auswählen',
        selectAnnualPaymentVolume: 'Jährliches Zahlungsvolumen auswählen',
        selectIncorporationCountry: 'Wählen Sie das Gründungsland aus',
        selectIncorporationState: 'Bundesstaat der Gründung auswählen',
        selectAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag auswählen',
        findIncorporationType: 'Inkorporationstyp finden',
        findBusinessCategory: 'Geschäftskategorie finden',
        findAnnualPaymentVolume: 'Jährliches Zahlungsvolumen finden',
        findIncorporationState: 'Bundesstaat der Gründung finden',
        findAverageReimbursement: 'Durchschnittlicher Erstattungsbetrag finden',
        error: {
            registrationNumber: 'Bitte geben Sie eine gültige Registrierungsnummer ein',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Besitzen Sie 25 % oder mehr von',
        doAnyIndividualOwn25percent: 'Besitzt eine oder mehrere Personen 25 % oder mehr von',
        areThereMoreIndividualsWhoOwn25percent: 'Gibt es mehr Personen, die 25 % oder mehr besitzen von',
        regulationRequiresUsToVerifyTheIdentity: 'Die Vorschrift verlangt von uns, die Identität jeder Person zu überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        companyOwner: 'Geschäftsinhaber',
        enterLegalFirstAndLastName: 'Wie lautet der rechtliche Name des Eigentümers?',
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Wie ist das Geburtsdatum des Eigentümers?',
        enterTheLast4: 'Was sind die letzten 4 Ziffern der Sozialversicherungsnummer des Eigentümers?',
        last4SSN: 'Letzte 4 Ziffern der Sozialversicherungsnummer',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Indem Sie dieses Bankkonto hinzufügen, bestätigen Sie, dass Sie die Bedingungen gelesen, verstanden und akzeptiert haben',
        owners: 'Eigentümer',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigentümerinformationen',
        businessOwner: 'Geschäftsinhaber',
        signerInfo: 'Signer-Informationen',
        doYouOwn: ({companyName}: CompanyNameParams) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Besitzt eine Einzelperson 25 % oder mehr von ${companyName}?`,
        regulationsRequire: 'Vorschriften verlangen von uns, die Identität jeder Person zu überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der rechtliche Name des Eigentümers?',
        whatsYourName: 'Wie lautet Ihr vollständiger Name?',
        whatPercentage: 'Welcher Prozentsatz des Unternehmens gehört dem Eigentümer?',
        whatsYoursPercentage: 'Welchen Prozentsatz des Unternehmens besitzen Sie?',
        ownership: 'Eigentum',
        whatsTheOwnersDOB: 'Wie ist das Geburtsdatum des Eigentümers?',
        whatsYourDOB: 'Wie ist Ihr Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        whatsYourAddress: 'Wie lautet Ihre Adresse?',
        whatAreTheLast: 'Was sind die letzten 4 Ziffern der Sozialversicherungsnummer des Eigentümers?',
        whatsYourLast: 'Was sind die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4: 'Letzte 4 Ziffern der Sozialversicherungsnummer',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: ({companyName}: CompanyNameParams) => `Gibt es andere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        owners: 'Eigentümer',
        addCertified: 'Fügen Sie ein zertifiziertes Organigramm hinzu, das die wirtschaftlich Berechtigten zeigt',
        regulationRequiresChart:
            'Die Vorschrift verlangt von uns, eine beglaubigte Kopie des Eigentümerdiagramms zu sammeln, das jede Einzelperson oder Einheit zeigt, die 25 % oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Eigentümerstrukturdiagramm hochladen',
        noteEntity: 'Hinweis: Das Eigentumsdiagramm der Einheit muss von Ihrem Buchhalter, Rechtsberater unterschrieben oder notariell beglaubigt sein.',
        certified: 'Zertifizierte Eigentümerstruktur der Einheit',
        selectCountry: 'Land auswählen',
        findCountry: 'Land finden',
        address: 'Adresse',
        chooseFile: 'Datei auswählen',
        uploadDocuments: 'Zusätzliche Dokumentation hochladen',
        pleaseUpload:
            'Bitte laden Sie unten zusätzliche Dokumente hoch, um uns bei der Verifizierung Ihrer Identität als direkter oder indirekter Eigentümer von 25 % oder mehr des Unternehmens zu unterstützen.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die Gesamtdateigröße für jeden Abschnitt darf 5 MB nicht überschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription:
            'Bitte stellen Sie eine unterschriebene Bescheinigung und ein Organigramm von einem Wirtschaftsprüfer, Notar oder Anwalt bereit, die den Besitz von 25 % oder mehr des Unternehmens bestätigen. Diese müssen innerhalb der letzten drei Monate datiert sein und die Lizenznummer des Unterzeichners enthalten.',
        copyOfID: 'Kopie des Ausweises des wirtschaftlich Berechtigten',
        copyOfIDDescription: 'Beispiele: Reisepass, Führerschein, etc.',
        proofOfAddress: 'Adressnachweis für wirtschaftlich Berechtigten',
        proofOfAddressDescription: 'Beispiele: Versorgungsrechnung, Mietvertrag usw.',
        codiceFiscale: 'Codice fiscale/Steuer-ID',
        codiceFiscaleDescription:
            'Bitte laden Sie ein Video eines Vor-Ort-Besuchs oder eines aufgezeichneten Gesprächs mit dem zeichnungsberechtigten Mitarbeiter hoch. Der Mitarbeiter muss folgende Angaben machen: vollständiger Name, Geburtsdatum, Firmenname, Registrierungsnummer, Steuernummer, eingetragene Adresse, Art des Geschäfts und Zweck des Kontos.',
    },
    validationStep: {
        headerTitle: 'Bankkonto validieren',
        buttonText: 'Setup abschließen',
        maxAttemptsReached: 'Die Validierung für dieses Bankkonto wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1-2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie „Expensify, Inc. Validation“.`,
        descriptionCTA: 'Bitte geben Sie den Betrag jeder Transaktion in die untenstehenden Felder ein. Beispiel: 1,51.',
        reviewingInfo: 'Danke! Wir überprüfen Ihre Informationen und werden uns in Kürze bei Ihnen melden. Bitte überprüfen Sie Ihren Chat mit Concierge.',
        forNextStep: 'für die nächsten Schritte, um die Einrichtung Ihres Bankkontos abzuschließen.',
        letsChatCTA: 'Ja, lass uns chatten',
        letsChatText: 'Fast geschafft! Wir benötigen noch deine Hilfe, um ein paar letzte Informationen im Chat zu überprüfen. Bereit?',
        letsChatTitle: 'Lass uns chatten!',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die 2FA ein, um Ihrem Konto eine zusätzliche Schutzschicht hinzuzufügen.',
        secureYourAccount: 'Sichern Sie Ihr Konto',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Zusätzliche Informationen',
        checkAllThatApply: 'Kreuzen Sie alle zutreffenden Optionen an, andernfalls lassen Sie das Feld leer.',
        iOwnMoreThan25Percent: 'Ich besitze mehr als 25 % von',
        someoneOwnsMoreThan25Percent: 'Jemand anderes besitzt mehr als 25 % von',
        additionalOwner: 'Zusätzlicher wirtschaftlich Berechtigter',
        removeOwner: 'Diesen wirtschaftlich Berechtigten entfernen',
        addAnotherIndividual: 'Fügen Sie eine weitere Person hinzu, die mehr als 25 % besitzt von',
        agreement: 'Vereinbarung:',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
        certifyTrueAndAccurate: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind.',
        error: {
            certify: 'Muss bestätigen, dass die Informationen wahr und korrekt sind',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Verifizierung abschließen',
        confirmAgreements: 'Bitte bestätigen Sie die untenstehenden Vereinbarungen.',
        certifyTrueAndAccurate: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind.',
        certifyTrueAndAccurateError: 'Bitte bestätigen Sie, dass die Informationen wahr und korrekt sind.',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Geschäftskonto für geschäftliche Ausgaben zu verwenden.',
        isAuthorizedToUseBankAccountError: 'Sie müssen ein verantwortlicher Sachbearbeiter mit der Berechtigung zur Führung des Geschäftskontos sein.',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Bankkonto verbinden',
        finishButtonText: 'Setup abschließen',
        validateYourBankAccount: 'Validieren Sie Ihr Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Validierung für dieses Bankkonto wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1-2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie „Expensify, Inc. Validation“.`,
        descriptionCTA: 'Bitte geben Sie den Betrag jeder Transaktion in die untenstehenden Felder ein. Beispiel: 1,51.',
        reviewingInfo: 'Danke! Wir überprüfen Ihre Informationen und werden uns in Kürze bei Ihnen melden. Bitte überprüfen Sie Ihren Chat mit Concierge.',
        forNextSteps: 'für die nächsten Schritte, um die Einrichtung Ihres Bankkontos abzuschließen.',
        letsChatCTA: 'Ja, lass uns chatten',
        letsChatText: 'Fast geschafft! Wir benötigen noch deine Hilfe, um ein paar letzte Informationen im Chat zu überprüfen. Bereit?',
        letsChatTitle: 'Lass uns chatten!',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die 2FA ein, um Ihrem Konto eine zusätzliche Schutzschicht hinzuzufügen.',
        secureYourAccount: 'Sichern Sie Ihr Konto',
    },
    countryStep: {
        confirmBusinessBank: 'Bestätigen Sie die Währung und das Land des Geschäftskontos',
        confirmCurrency: 'Währung und Land bestätigen',
        yourBusiness: 'Die Währung Ihres Geschäftskontos muss mit der Währung Ihres Arbeitsbereichs übereinstimmen.',
        youCanChange: 'Sie können die Währungsanzeige Ihres Arbeitsbereichs in Ihren Einstellungen ändern.',
        findCountry: 'Land finden',
        selectCountry: 'Land auswählen',
    },
    bankInfoStep: {
        whatAreYour: 'Wie lauten Ihre Geschäftskontodaten?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles in Ordnung aussieht.',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in Ihrem Arbeitsbereich verwendet.',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollständiger Name des autorisierten Unterzeichners',
    },
    signerInfoStep: {
        signerInfo: 'Signer-Informationen',
        areYouDirector: ({companyName}: CompanyNameParams) => `Sind Sie Direktor oder leitender Angestellter bei ${companyName}?`,
        regulationRequiresUs: 'Die Vorschriften verlangen von uns, zu überprüfen, ob der Unterzeichner die Befugnis hat, diese Handlung im Namen des Unternehmens vorzunehmen.',
        whatsYourName: 'Wie ist Ihr rechtlicher Name?',
        fullName: 'Rechtlicher vollständiger Name',
        whatsYourJobTitle: 'Wie lautet Ihre Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Wie ist Ihr Geburtsdatum?',
        uploadID: 'Laden Sie den Ausweis und den Adressnachweis hoch',
        personalAddress: 'Nachweis der persönlichen Adresse (z. B. Versorgungsrechnung)',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        proofOf: 'Nachweis der persönlichen Adresse',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Geben Sie die E-Mail-Adresse des Direktors oder leitenden Angestellten bei ${companyName} ein`,
        regulationRequiresOneMoreDirector: 'Die Vorschrift verlangt mindestens einen weiteren Direktor oder leitenden Angestellten als Unterzeichner.',
        hangTight: 'Bitte einen Moment Geduld...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Geben Sie die E-Mail-Adressen von zwei Direktoren oder leitenden Angestellten bei ${companyName} ein`,
        sendReminder: 'Erinnerung senden',
        chooseFile: 'Datei auswählen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identität als Direktoren oder leitende Angestellte des Unternehmens verifizieren.',
        id: 'Kopie des Ausweises',
        proofOfDirectors: 'Nachweis des/der Geschäftsführer(s)',
        proofOfDirectorsDescription: 'Beispiele: Oncorp Unternehmensprofil oder Geschäftsanmeldung.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale für Unterzeichner, autorisierte Benutzer und wirtschaftliche Eigentümer.',
        PDSandFSG: 'PDS + FSG Offenlegungsunterlagen',
        PDSandFSGDescription:
            'Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um das umfangreiche Netzwerk internationaler Bankpartner von Corpay zu nutzen und so die Global Reimbursements in Expensify zu ermöglichen. Gemäß den australischen Vorschriften stellen wir Ihnen den Financial Services Guide (FSG) und die Product Disclosure Statement (PDS) von Corpay zur Verfügung.\n\nBitte lesen Sie die FSG- und PDS-Dokumente sorgfältig durch, da sie vollständige Details und wichtige Informationen zu den von Corpay angebotenen Produkten und Dienstleistungen enthalten. Bewahren Sie diese Dokumente für zukünftige Referenz auf.',
        pleaseUpload:
            'Bitte laden Sie unten zusätzliche Dokumente hoch, um uns bei der Verifizierung Ihrer Identität als Geschäftsführer oder leitender Angestellter des Unternehmens zu unterstützen.',
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte bestätigen Sie die untenstehenden Vereinbarungen.',
        regulationRequiresUs: 'Die Vorschrift verlangt von uns, die Identität jeder Person zu überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        iAmAuthorized: 'Ich bin berechtigt, das Geschäftskonto für Geschäftsausgaben zu verwenden.',
        iCertify: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind.',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
        accept: 'Akzeptieren und Bankkonto hinzufügen',
        iConsentToThe: 'Ich stimme zu, dass',
        privacyNotice: 'Datenschutzhinweis',
        error: {
            authorized: 'Sie müssen ein verantwortlicher Sachbearbeiter mit der Berechtigung zur Führung des Geschäftskontos sein.',
            certify: 'Bitte bestätigen Sie, dass die Informationen wahr und korrekt sind.',
            consent: 'Bitte stimmen Sie der Datenschutzerklärung zu',
        },
    },
    finishStep: {
        connect: 'Bankkonto verbinden',
        letsFinish: 'Lass uns im Chat fertig werden!',
        thanksFor:
            'Danke für diese Informationen. Ein spezieller Support-Mitarbeiter wird Ihre Angaben nun überprüfen. Wir melden uns bei Ihnen, falls wir noch etwas benötigen. In der Zwischenzeit können Sie sich gerne mit Fragen an uns wenden.',
        iHaveA: 'Ich habe eine Frage',
        enable2FA: 'Aktivieren Sie die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern',
        weTake: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die 2FA ein, um Ihrem Konto eine zusätzliche Schutzschicht hinzuzufügen.',
        secure: 'Sichern Sie Ihr Konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Einen Moment bitte',
        explanationLine: 'Wir überprüfen Ihre Informationen. Sie können in Kürze mit den nächsten Schritten fortfahren.',
    },
    session: {
        offlineMessageRetry: 'Es sieht so aus, als ob Sie offline sind. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    },
    travel: {
        header: 'Reise buchen',
        title: 'Reisen Sie klug',
        subtitle: 'Nutzen Sie Expensify Travel, um die besten Reiseangebote zu erhalten und alle Ihre Geschäftsausgaben an einem Ort zu verwalten.',
        features: {
            saveMoney: 'Sparen Sie Geld bei Ihren Buchungen',
            alerts: 'Erhalten Sie Echtzeit-Updates und Benachrichtigungen',
        },
        bookTravel: 'Reise buchen',
        bookDemo: 'Demo buchen',
        bookADemo: 'Demo buchen',
        toLearnMore: 'um mehr zu erfahren.',
        termsAndConditions: {
            header: 'Bevor wir fortfahren...',
            title: 'Allgemeine Geschäftsbedingungen',
            subtitle: 'Bitte stimmen Sie den Expensify Travel zu',
            termsAndConditions: 'Allgemeine Geschäftsbedingungen',
            travelTermsAndConditions: 'Allgemeine Geschäftsbedingungen',
            agree: 'Ich stimme zu mit den',
            error: 'Sie müssen den Expensify Travel Geschäftsbedingungen zustimmen, um fortzufahren',
            defaultWorkspaceError:
                'Sie müssen einen Standardarbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehen Sie zu Einstellungen > Arbeitsbereiche > klicken Sie auf die drei senkrechten Punkte neben einem Arbeitsbereich > Als Standardarbeitsbereich festlegen und versuchen Sie es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Sie haben einen <strong>${layover} Zwischenstopp</strong> vor diesem Flug</muted-text-label>`,
            takeOff: 'Start',
            landing: 'Startseite',
            seat: 'Sitz',
            class: 'Kabinenklasse',
            recordLocator: 'Aufzeichnungsnummer',
            cabinClasses: {
                unknown: 'Unbekannt',
                economy: 'Wirtschaft',
                premiumEconomy: 'Premium Economy',
                business: 'Geschäft',
                first: 'Erste',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gast',
            checkIn: 'Einchecken',
            checkOut: 'Auschecken',
            roomType: 'Zimmertyp',
            cancellation: 'Stornierungsbedingungen',
            cancellationUntil: 'Kostenlose Stornierung bis',
            confirmation: 'Bestätigungsnummer',
            cancellationPolicies: {
                unknown: 'Unbekannt',
                nonRefundable: 'Nicht erstattungsfähig',
                freeCancellationUntil: 'Kostenlose Stornierung bis',
                partiallyRefundable: 'Teilweise erstattungsfähig',
            },
        },
        car: 'Auto',
        carDetails: {
            rentalCar: 'Mietwagen',
            pickUp: 'Abholung',
            dropOff: 'Abgabe',
            driver: 'Fahrer',
            carType: 'Fahrzeugtyp',
            cancellation: 'Stornierungsbedingungen',
            cancellationUntil: 'Kostenlose Stornierung bis',
            freeCancellation: 'Kostenlose Stornierung',
            confirmation: 'Bestätigungsnummer',
        },
        train: 'Bahn',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Abflüge',
            arrives: 'Kommt an',
            coachNumber: 'Trainer-Nummer',
            seat: 'Sitz',
            fareDetails: 'Reisedetails',
            confirmation: 'Bestätigungsnummer',
        },
        viewTrip: 'Reise anzeigen',
        modifyTrip: 'Reise bearbeiten',
        tripSupport: 'Reiseunterstützung',
        tripDetails: 'Reisedetails',
        viewTripDetails: 'Reisedetails anzeigen',
        trip: 'Reise',
        trips: 'Reisen',
        tripSummary: 'Reisezusammenfassung',
        departs: 'Abflüge',
        errorMessage: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
        phoneError: {
            phrase1: 'Bitte',
            link: 'Fügen Sie eine Arbeits-E-Mail als Ihren primären Login hinzu',
            phrase2: 'um Reisen zu buchen.',
        },
        domainSelector: {
            title: 'Domain',
            subtitle: 'Wählen Sie eine Domain für die Expensify Travel Einrichtung.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restrictionPrefix: `Sie haben keine Berechtigung, Expensify Travel für die Domain zu aktivieren.`,
            restrictionSuffix: `Sie müssen stattdessen jemanden aus dieser Domain bitten, Reisen zu aktivieren.`,
            accountantInvitationPrefix: `Wenn Sie Buchhalter sind, ziehen Sie in Betracht, dem/der beizutreten`,
            accountantInvitationLink: `ExpensifyApproved! Buchhalterprogramm`,
            accountantInvitationSuffix: `um Reisen für diese Domain zu aktivieren.`,
        },
        publicDomainError: {
            title: 'Erste Schritte mit Expensify Travel',
            message: `Du musst deine geschäftliche E-Mail-Adresse (z. B. name@company.com) für Expensify Travel verwenden, nicht deine private E-Mail-Adresse (z. B. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: `Ihr Administrator hat Expensify Travel deaktiviert. Bitte befolgen Sie die Buchungsrichtlinien Ihres Unternehmens für Reisebuchungen.`,
        },
        verifyCompany: {
            title: 'Beginnen Sie noch heute mit dem Reisen!',
            message: `Bitte kontaktieren Sie Ihren Account Manager oder salesteam@expensify.com, um eine Demo für Reisen zu erhalten und diese für Ihr Unternehmen freizuschalten.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde gebucht. Bestätigungscode: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde annulliert.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde erstattet oder umgebucht.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde von der Fluggesellschaft storniert.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `Die Fluggesellschaft hat eine Änderung des Flugplans für Flug ${airlineCode} vorgeschlagen; wir warten auf die Bestätigung.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Terminänderung bestätigt: Flug ${airlineCode} startet jetzt um ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde aktualisiert.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Ihre Kabinenklasse wurde auf ${cabinClass} im Flug ${airlineCode} aktualisiert.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Ihr Sitzplatz auf dem Flug ${airlineCode} wurde bestätigt.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzreservierung auf dem Flug ${airlineCode} wurde geändert.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzreservierung auf dem Flug ${airlineCode} wurde entfernt.`,
            paymentDeclined: 'Die Zahlung für Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Sie haben Ihre ${type}-Reservierung ${id} storniert.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Der Anbieter hat Ihre ${type}-Reservierung ${id} storniert.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde neu gebucht. Neue Bestätigungsnummer: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Ihre ${type}-Buchung wurde aktualisiert. Überprüfen Sie die neuen Details im Reiseplan.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Ihr Zugticket für ${origin} → ${destination} am ${startDate} wurde erstattet. Eine Gutschrift wird bearbeitet.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Ihr Zugticket für ${origin} → ${destination} am ${startDate} wurde umgetauscht.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Ihr Zugticket für ${origin} → ${destination} am ${startDate} wurde aktualisiert.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde aktualisiert.`,
        },
    },
    workspace: {
        common: {
            card: 'Karten',
            expensifyCard: 'Expensify-Karte',
            companyCards: 'Firmenkarten',
            workflows: 'Arbeitsabläufe',
            workspace: 'Arbeitsbereich',
            findWorkspace: 'Arbeitsbereich finden',
            edit: 'Arbeitsbereich bearbeiten',
            enabled: 'Aktiviert',
            disabled: 'Deaktiviert',
            everyone: 'Alle',
            delete: 'Arbeitsbereich löschen',
            settings: 'Einstellungen',
            reimburse: 'Erstattungen',
            categories: 'Kategorien',
            tags: 'Tags',
            customField1: 'Benutzerdefiniertes Feld 1',
            customField2: 'Benutzerdefiniertes Feld 2',
            customFieldHint: 'Fügen Sie benutzerdefinierten Code hinzu, der auf alle Ausgaben dieses Mitglieds angewendet wird.',
            reportFields: 'Berichtsfelder',
            reportTitle: 'Berichtstitel',
            reportField: 'Berichtsfeld',
            taxes: 'Steuern',
            bills: 'Rechnungen',
            invoices: 'Rechnungen',
            travel: 'Reisen',
            members: 'Mitglieder',
            accounting: 'Buchhaltung',
            rules: 'Regeln',
            displayedAs: 'Angezeigt als',
            plan: 'Plan',
            profile: 'Übersicht',
            bankAccount: 'Bankkonto',
            connectBankAccount: 'Bankkonto verbinden',
            testTransactions: 'Testtransaktionen',
            issueAndManageCards: 'Karten ausgeben und verwalten',
            reconcileCards: 'Karten abgleichen',
            selected: () => ({
                one: '1 ausgewählt',
                other: (count: number) => `${count} ausgewählt`,
            }),
            settlementFrequency: 'Abrechnungsfrequenz',
            setAsDefault: 'Als Standardarbeitsbereich festlegen',
            defaultNote: `Belege, die an ${CONST.EMAIL.RECEIPTS} gesendet werden, erscheinen in diesem Arbeitsbereich.`,
            deleteConfirmation: 'Sind Sie sicher, dass Sie diesen Arbeitsbereich löschen möchten?',
            deleteWithCardsConfirmation: 'Sind Sie sicher, dass Sie diesen Arbeitsbereich löschen möchten? Dadurch werden alle Karten-Feeds und zugewiesenen Karten entfernt.',
            unavailable: 'Arbeitsbereich nicht verfügbar',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied zum Arbeitsbereich einzuladen, verwenden Sie bitte die Einladungs-Schaltfläche oben.',
            notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Arbeitsbereich beizutreten, bitte den Arbeitsbereichsinhaber, dich als Mitglied hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Gehe zum Raum ${roomName}`,
            goToWorkspace: 'Zum Arbeitsbereich gehen',
            goToWorkspaces: 'Zu Arbeitsbereichen gehen',
            clearFilter: 'Filter löschen',
            workspaceName: 'Arbeitsbereichsname',
            workspaceOwner: 'Eigentümer',
            workspaceType: 'Arbeitsbereichstyp',
            workspaceAvatar: 'Arbeitsbereich-Avatar',
            mustBeOnlineToViewMembers: 'Sie müssen online sein, um die Mitglieder dieses Arbeitsbereichs anzeigen zu können.',
            moreFeatures: 'Weitere Funktionen',
            requested: 'Angefragt',
            distanceRates: 'Entfernungstarife',
            defaultDescription: 'Ein Ort für alle Ihre Belege und Ausgaben.',
            descriptionHint: 'Teilen Sie Informationen über diesen Arbeitsbereich mit allen Mitgliedern.',
            welcomeNote: 'Bitte verwenden Sie Expensify, um Ihre Belege zur Erstattung einzureichen, danke!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell eingegeben markieren',
            markAsExported: 'Als manuell exportiert markieren',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportieren nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
            lineItemLevel: 'Positionsebene',
            reportLevel: 'Berichtsebene',
            topLevel: 'Oberste Ebene',
            appliedOnExport: 'Nicht in Expensify importiert, beim Export angewendet',
            shareNote: {
                header: 'Teilen Sie Ihren Arbeitsbereich mit anderen Mitgliedern',
                content: {
                    firstPart:
                        'Teilen Sie diesen QR-Code oder kopieren Sie den untenstehenden Link, um es den Mitgliedern zu erleichtern, den Zugriff auf Ihren Arbeitsbereich anzufordern. Alle Anfragen zum Beitritt zum Arbeitsbereich werden in der angezeigt',
                    secondPart: 'Platz für Ihre Überprüfung.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verbinden`,
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Bestehende Verbindung wiederverwenden',
            existingConnections: 'Bestehende Verbindungen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Da Sie zuvor eine Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} hergestellt haben, können Sie wählen, ob Sie eine bestehende Verbindung wiederverwenden oder eine neue erstellen möchten.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Zuletzt synchronisiert am ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Kann keine Verbindung zu ${connectionName} herstellen aufgrund eines Authentifizierungsfehlers`,
            learnMore: 'Mehr erfahren.',
            memberAlternateText: 'Mitglieder können Berichte einreichen und genehmigen.',
            adminAlternateText: 'Admins haben vollen Bearbeitungszugriff auf alle Berichte und Workspace-Einstellungen.',
            auditorAlternateText: 'Prüfer können Berichte einsehen und kommentieren.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Administrator';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Prüfer';
                    case CONST.POLICY.ROLE.USER:
                        return 'Mitglied';
                    default:
                        return 'Mitglied';
                }
            },
            frequency: {
                manual: 'Manuell',
                instant: 'Sofort',
                immediate: 'Täglich',
                trip: 'Nach Reise',
                weekly: 'Wöchentlich',
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
            subtitle: 'Legen Sie Pauschalbeträge fest, um die täglichen Ausgaben der Mitarbeiter zu kontrollieren.',
            amount: 'Betrag',
            deleteRates: () => ({
                one: 'Löschrate',
                other: 'Tarife löschen',
            }),
            deletePerDiemRate: 'Tagessatz löschen',
            findPerDiemRate: 'Tagespauschale finden',
            areYouSureDelete: () => ({
                one: 'Sind Sie sicher, dass Sie diesen Tarif löschen möchten?',
                other: 'Sind Sie sicher, dass Sie diese Tarife löschen möchten?',
            }),
            emptyList: {
                title: 'Tagespauschale',
                subtitle: 'Legen Sie Pauschalbeträge fest, um die täglichen Ausgaben der Mitarbeiter zu kontrollieren. Importieren Sie die Sätze aus einer Tabelle, um zu beginnen.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Ein Tarif mit dem Wert ${rate} existiert bereits`,
            },
            importPerDiemRates: 'Pauschalbeträge importieren',
            editPerDiemRate: 'Tagessatz bearbeiten',
            editPerDiemRates: 'Tagessatz bearbeiten',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Die Aktualisierung dieses Ziels wird alle ${destination} Pauschalunterbringungszuschläge ändern.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Die Aktualisierung dieser Währung ändert sie für alle ${destination} Pauschalbeträge.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen an QuickBooks Desktop exportiert werden.',
            exportOutOfPocketExpensesCheckToggle: 'Markierungen als „später drucken“',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten in QuickBooks Desktop exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Buchungsbelege erfasst werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wählen Sie aus, wohin Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten zu QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der neuesten Ausgabe im Bericht.',
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
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Scheck und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
            deepDiveExpensifyCard: 'Expensify Card-Transaktionen werden automatisch auf ein mit Bill.com erstelltes "Expensify Card Liability Account" exportiert.',
            deepDiveExpensifyCardIntegration: 'unsere Integration.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop unterstützt keine Steuern bei Exporten von Buchungsbelegen. Da in deinem Arbeitsbereich Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungssatz',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Überprüfen',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Beschreibung`]:
                    'Wir erstellen für jeden Expensify-Bericht einen detaillierten Scheck und senden ihn von dem untenstehenden Bankkonto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Beschreibung`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit entsprechenden Anbietern in QuickBooks ab. Falls keine Anbieter vorhanden sind, erstellen wir einen Anbieter namens „Credit Card Misc.“, um die Zuordnung vorzunehmen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Beschreibung`]:
                    'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Kontobeschreibung`]:
                    'Wählen Sie aus, wohin Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Kontobeschreibung`]:
                    'Wählen Sie einen Anbieter aus, der auf alle Kreditkartentransaktionen angewendet werden soll.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Kontobeschreibung`]: 'Wählen Sie aus, wohin Schecks gesendet werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Fehler`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Fehler`]:
                    'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Fehler`]:
                    'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Desktop hinzu und synchronisieren Sie die Verbindung erneut.',
            qbdSetup: 'QuickBooks Desktop Einrichtung',
            requiredSetupDevice: {
                title: 'Verbindung von diesem Gerät kann nicht hergestellt werden',
                body1: 'Sie müssen diese Verbindung von dem Computer aus einrichten, auf dem Ihre QuickBooks Desktop-Unternehmensdatei gespeichert ist.',
                body2: 'Sobald Sie verbunden sind, können Sie von überall aus synchronisieren und exportieren.',
            },
            setupPage: {
                title: 'Öffnen Sie diesen Link, um eine Verbindung herzustellen',
                body: 'Um die Einrichtung abzuschließen, öffnen Sie den folgenden Link auf dem Computer, auf dem QuickBooks Desktop ausgeführt wird.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody1: 'Die QuickBooks Desktop-Verbindung funktioniert im Moment nicht. Bitte versuchen Sie es später erneut oder',
                setupErrorBody2: 'wenn das Problem weiterhin besteht.',
                setupErrorBodyContactConcierge: 'wenden Sie sich an Concierge',
            },
            importDescription: 'Wählen Sie aus, welche Codierungskonfigurationen von QuickBooks Desktop zu Expensify importiert werden sollen.',
            classes: 'Klassen',
            items: 'Artikel',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Unternehmenskartenzahlungen nach QuickBooks Desktop exportiert werden.',
            defaultVendorDescription: 'Legen Sie einen Standardanbieter fest, der auf alle Kreditkartentransaktionen beim Export angewendet wird.',
            accountsDescription: 'Ihr QuickBooks Desktop-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl zur Verfügung, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Klassen in Expensify behandelt werden sollen.',
            tagsDisplayedAsDescription: 'Positionsebene',
            reportFieldsDisplayedAsDescription: 'Berichtsebene',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Kunden/Projekte in Expensify verwaltet werden sollen.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit QuickBooks Desktop synchronisieren.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription: 'Expensify erstellt automatisch Lieferanten in QuickBooks Desktop, falls diese noch nicht vorhanden sind.',
            },
            itemsDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Elemente in Expensify behandelt werden sollen.',
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'Wählen Sie aus, welche Codierungskonfigurationen von QuickBooks Online zu Expensify importiert werden sollen.',
            classes: 'Klassen',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr QuickBooks Online Kontenplan wird als Kategorien in Expensify importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl zur Verfügung, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie, wie QuickBooks Online-Klassen in Expensify behandelt werden sollen.',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Online-Kunden/Projekte in Expensify verwaltet werden sollen.',
            locationsDescription: 'Wählen Sie, wie QuickBooks Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'Wählen Sie aus, wie QuickBooks Online-Steuern in Expensify behandelt werden sollen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online unterstützt keine Standorte auf Zeilenebene für Schecks oder Lieferantenrechnungen. Wenn Sie Standorte auf Zeilenebene verwenden möchten, stellen Sie sicher, dass Sie Buchungsbelege und Kredit-/Debitkartenausgaben verwenden.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online unterstützt keine Steuern auf Buchungsbelegen. Bitte ändern Sie Ihre Exportoption auf Lieferantenrechnung oder Scheck.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten zu QuickBooks Online exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            deepDiveExpensifyCard: 'Expensify Card-Transaktionen werden automatisch auf ein mit Bill.com erstelltes "Expensify Card Liability Account" exportiert.',
            deepDiveExpensifyCardIntegration: 'unsere Integration.',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten zu QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der neuesten Ausgabe im Bericht.',
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
            archive: 'Debitorenarchiv', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Verwenden Sie dieses Konto beim Exportieren von Rechnungen zu QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Unternehmenskartenzahlungen nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Legen Sie einen Standardanbieter fest, der auf alle Kreditkartentransaktionen beim Export angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Scheck und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Buchungsbelege erfasst werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wählen Sie aus, wohin Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online unterstützt keine Standorte bei Exporten von Lieferantenrechnungen. Da Sie Standorte in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online unterstützt keine Steuern bei Exporten von Buchungsbelegen. Da in Ihrem Arbeitsbereich Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit QuickBooks Online synchronisieren.',
                inviteEmployees: 'Mitarbeiter einladen',
                inviteEmployeesDescription: 'Importieren Sie QuickBooks Online-Mitarbeiterdatensätze und laden Sie Mitarbeiter zu diesem Arbeitsbereich ein.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription:
                    'Expensify erstellt automatisch Lieferanten in QuickBooks Online, falls diese noch nicht existieren, und erstellt beim Exportieren von Rechnungen automatisch Kunden.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht mit Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden QuickBooks Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks Rechnungskonto für Zahlungen',
                qboInvoiceCollectionAccount: 'QuickBooks Forderungskonto für Rechnungen',
                accountSelectDescription: 'Wählen Sie aus, von wo aus die Rechnungen bezahlt werden sollen, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wo Sie Rechnungszahlungen erhalten möchten, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitkarte',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungssatz',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Überprüfen',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Beschreibung`]:
                    'Wir gleichen den Händlernamen der Debitkartentransaktion automatisch mit den entsprechenden Anbietern in QuickBooks ab. Falls keine Anbieter vorhanden sind, erstellen wir einen Anbieter namens „Debit Card Misc.“, um die Zuordnung vorzunehmen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Beschreibung`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit entsprechenden Anbietern in QuickBooks ab. Falls keine Anbieter vorhanden sind, erstellen wir einen Anbieter namens „Credit Card Misc.“, um die Zuordnung vorzunehmen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Beschreibung`]:
                    'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Kontobeschreibung`]: 'Wählen Sie aus, wohin die Debitkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Kontobeschreibung`]: 'Wählen Sie aus, wohin Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Kontobeschreibung`]:
                    'Wählen Sie einen Anbieter aus, der auf alle Kreditkartentransaktionen angewendet werden soll.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Fehler`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Fehler`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Fehler`]:
                    'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wählen Sie ein gültiges Konto für den Export der Lieferantenrechnung aus',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wählen Sie ein gültiges Konto für den Export des Journaleintrags aus',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wählen Sie ein gültiges Konto für den Scheckexport aus',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Um den Export von Lieferantenrechnungen zu verwenden, richten Sie ein Kreditorenkonto in QuickBooks Online ein.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Um den Export von Buchungsbelegen zu verwenden, richten Sie ein Journal-Konto in QuickBooks Online ein.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Um den Scheckexport zu verwenden, richten Sie ein Bankkonto in QuickBooks Online ein.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Online hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Abgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen werden beim endgültigen Genehmigen exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden beim Bezahlen exportiert',
                },
            },
        },
        workspaceList: {
            joinNow: 'Jetzt beitreten',
            askToJoin: 'Um Beitritt bitten',
        },
        xero: {
            organization: 'Xero-Organisation',
            organizationDescription: 'Wählen Sie die Xero-Organisation aus, aus der Sie Daten importieren möchten.',
            importDescription: 'Wählen Sie aus, welche Codierungskonfigurationen von Xero zu Expensify importiert werden sollen.',
            accountsDescription: 'Ihr Xero-Kontenplan wird als Kategorien in Expensify importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl zur Verfügung, wenn sie ihre Ausgaben erstellen.',
            trackingCategories: 'Verfolgungskategorien',
            trackingCategoriesDescription: 'Wählen Sie aus, wie Xero-Tracking-Kategorien in Expensify behandelt werden sollen.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Ordne Xero ${categoryName} zu`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Wählen Sie aus, wo ${categoryName} beim Export nach Xero zugeordnet werden soll.`,
            customers: 'Kunden erneut in Rechnung stellen',
            customersDescription:
                'Wählen Sie aus, ob Kunden in Expensify erneut in Rechnung gestellt werden sollen. Ihre Xero-Kundenkontakte können Ausgaben zugeordnet werden und werden als Verkaufsrechnung an Xero exportiert.',
            taxesDescription: 'Wählen Sie aus, wie Xero-Steuern in Expensify behandelt werden sollen.',
            notImported: 'Nicht importiert',
            notConfigured: 'Nicht konfiguriert',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero Kontakt Standardwert',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Berichtsfelder',
            },
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Xero exportiert werden.',
            purchaseBill: 'Kaufrechnung',
            exportDeepDiveCompanyCard:
                'Exportierte Ausgaben werden als Banktransaktionen auf das untenstehende Xero-Bankkonto gebucht, und die Transaktionsdaten entsprechen den Daten auf Ihrem Kontoauszug.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero Bankkonto',
            xeroBankAccountDescription: 'Wählen Sie aus, wo Ausgaben als Banktransaktionen gebucht werden sollen.',
            exportExpensesDescription: 'Berichte werden als Einkaufsrechnung mit dem unten ausgewählten Datum und Status exportiert.',
            purchaseBillDate: 'Kaufrechnungsdatum',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Verkaufsrechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung gesendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Xero synchronisieren.',
                purchaseBillStatusTitle: 'Status der Rechnung für den Einkauf',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht mit Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden Xero-Konto erstellt.',
                xeroBillPaymentAccount: 'Xero Rechnungskonto für Zahlungen',
                xeroInvoiceCollectionAccount: 'Xero Rechnungseinzugs-Konto',
                xeroBillPaymentAccountDescription: 'Wählen Sie aus, von wo aus die Rechnungen bezahlt werden sollen, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wo Sie Rechnungszahlungen erhalten möchten, und wir erstellen die Zahlung in Xero.',
            },
            exportDate: {
                label: 'Kaufrechnungsdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der neuesten Ausgabe im Bericht.',
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
                label: 'Status der Rechnung für den Einkauf',
                description: 'Verwenden Sie diesen Status beim Exportieren von Einkaufsrechnungen nach Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Entwurf',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Wartet auf Genehmigung',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Warten auf Zahlung',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in Xero hinzu und synchronisieren Sie die Verbindung erneut.',
        },
        sageIntacct: {
            preferredExporter: 'Bevorzugter Exporteur',
            taxSolution: 'Steuerlösung',
            notConfigured: 'Nicht konfiguriert',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der neuesten Ausgabe im Bericht.',
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
                description: 'Legen Sie fest, wie Auslagen an Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Spesenabrechnungen',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            nonReimbursableExpenses: {
                description: 'Legen Sie fest, wie Unternehmenskarteneinkäufe nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Kreditkarten',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            creditCardAccount: 'Kreditkartenkonto',
            defaultVendor: 'Standardanbieter',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Legen Sie einen Standardanbieter fest, der für ${isReimbursable ? '' : 'non-'} erstattungsfähige Ausgaben gilt, die keinen passenden Anbieter in Sage Intacct haben.`,
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten an Sage Intacct exportiert werden.',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Administrator sein, muss jedoch auch ein Domain-Administrator sein, wenn Sie unterschiedliche Exportkonten für einzelne Firmenkarten in den Domain-Einstellungen festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zum Export in seinem Konto.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: `Bitte fügen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut.`,
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Sage Intacct synchronisieren.',
            inviteEmployees: 'Mitarbeiter einladen',
            inviteEmployeesDescription:
                'Importieren Sie Sage Intacct Mitarbeiterdatensätze und laden Sie Mitarbeiter zu diesem Arbeitsbereich ein. Ihr Genehmigungsworkflow wird standardmäßig auf Manager-Genehmigung eingestellt und kann auf der Mitgliederseite weiter konfiguriert werden.',
            syncReimbursedReports: 'Erstattete Berichte synchronisieren',
            syncReimbursedReportsDescription:
                'Jedes Mal, wenn ein Bericht mit Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden Sage Intacct-Konto erstellt.',
            paymentAccount: 'Sage Intacct Zahlungskonto',
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'Wählen Sie die Tochtergesellschaft in NetSuite aus, aus der Sie Daten importieren möchten.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto für Journalbuchungen',
            journalEntriesProvTaxPostingAccount: 'Journalbuchungen Konto für die Verbuchung der Provinzsteuer',
            foreignCurrencyAmount: 'Fremdwährungsbetrag exportieren',
            exportToNextOpenPeriod: 'In die nächste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Nicht erstattungsfähiges Buchungskonto für Journaleinträge',
            reimbursableJournalPostingAccount: 'Erstattungsfähiges Buchungskonto',
            journalPostingPreference: {
                label: 'Bevorzugte Buchungseinstellung für Journalbuchungen',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Einzelner, aufgeschlüsselter Eintrag für jeden Bericht',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Einzelner Eintrag für jede Ausgabe',
                },
            },
            invoiceItem: {
                label: 'Rechnungsposition',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Erstelle einen für mich',
                        description: 'Wir erstellen für Sie einen „Expensify-Rechnungspositionseintrag“ beim Export (falls noch keiner vorhanden ist).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Vorhandenes auswählen',
                        description: 'Wir verknüpfen Rechnungen aus Expensify mit dem unten ausgewählten Artikel.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der neuesten Ausgabe im Bericht.',
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
                        reimbursableDescription: 'Auslagen werden als Spesenabrechnungen an NetSuite exportiert.',
                        nonReimbursableDescription: 'Ausgaben mit Firmenkarten werden als Spesenabrechnungen nach NetSuite exportiert.',
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
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit NetSuite synchronisieren.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht mit Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Erstattungskonto',
                reimbursementsAccountDescription: 'Wählen Sie das Bankkonto aus, das Sie für Rückerstattungen verwenden möchten, und wir erstellen die zugehörige Zahlung in NetSuite.',
                collectionsAccount: 'Inkassokonto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und an NetSuite exportiert wurde, erscheint sie auf dem untenstehenden Konto.',
                approvalAccount: 'A/P Genehmigungskonto',
                approvalAccountDescription:
                    'Wählen Sie das Konto aus, gegen das Transaktionen in NetSuite genehmigt werden. Wenn Sie erstattete Berichte synchronisieren, ist dies auch das Konto, gegen das Rechnungszahlungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite Standard',
                inviteEmployees: 'Mitarbeiter einladen und Genehmigungen festlegen',
                inviteEmployeesDescription:
                    'Importieren Sie NetSuite-Mitarbeiterdatensätze und laden Sie Mitarbeiter zu diesem Arbeitsbereich ein. Ihr Genehmigungsworkflow wird standardmäßig auf Manager-Genehmigung eingestellt und kann auf der *Mitglieder*-Seite weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeiter/Lieferanten automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription:
                    'Standardmäßig erstellt Expensify Einträge unter Verwendung des bevorzugten Transaktionsformulars, das in NetSuite festgelegt ist. Alternativ können Sie ein bestimmtes Transaktionsformular festlegen, das verwendet werden soll.',
                customFormIDReimbursable: 'Auslagen',
                customFormIDNonReimbursable: 'Firmenkarten-Ausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsstufe für Spesenabrechnung',
                    description:
                        'Sobald ein Spesenbericht in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite eine zusätzliche Genehmigungsebene vor der Buchung festlegen.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite Standardvoreinstellung',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Nur vom Vorgesetzten genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Nur von der Buchhaltung genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Vorgesetzter und Buchhaltung genehmigt',
                    },
                },
                accountingMethods: {
                    label: 'Wann exportieren',
                    description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Abgrenzung',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen werden beim endgültigen Genehmigen exportiert',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden beim Bezahlen exportiert',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsstufe für Lieferantenrechnung',
                    description:
                        'Sobald eine Lieferantenrechnung in Expensify genehmigt und an NetSuite exportiert wurde, können Sie in NetSuite eine zusätzliche Genehmigungsebene vor der Buchung festlegen.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite Standardvoreinstellung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zur Veröffentlichung genehmigt',
                    },
                },
                exportJournalsTo: {
                    label: 'Genehmigungsstufe für Buchungssätze',
                    description:
                        'Sobald ein Journaleintrag in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite eine zusätzliche Genehmigungsebene vor der Buchung festlegen.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite Standardvoreinstellung',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zur Veröffentlichung genehmigt',
                    },
                },
                error: {
                    customFormID: 'Bitte geben Sie eine gültige numerische benutzerdefinierte Formular-ID ein',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noVendorsFound: 'Keine Anbieter gefunden',
            noVendorsFoundDescription: 'Bitte fügen Sie Lieferanten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noItemsFound: 'Keine Rechnungsposten gefunden',
            noItemsFoundDescription: 'Bitte fügen Sie Rechnungsposten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noSubsidiariesFound: 'Keine Tochtergesellschaften gefunden',
            noSubsidiariesFoundDescription: 'Bitte fügen Sie eine Tochtergesellschaft in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            tokenInput: {
                title: 'NetSuite Einrichtung',
                formSteps: {
                    installBundle: {
                        title: 'Installieren Sie das Expensify-Bundle',
                        description: 'In NetSuite gehen Sie zu *Customization > SuiteBundler > Search & Install Bundles* > suchen Sie nach "Expensify" > installieren Sie das Bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Token-basierte Authentifizierung aktivieren',
                        description: 'Gehen Sie in NetSuite zu *Setup > Company > Enable Features > SuiteCloud* und aktivieren Sie *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-Webdienste aktivieren',
                        description: 'In NetSuite gehen Sie zu *Setup > Company > Enable Features > SuiteCloud* > aktivieren Sie *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Erstellen Sie ein Zugriffstoken',
                        description:
                            'Gehen Sie in NetSuite zu *Setup > Users/Roles > Access Tokens* und erstellen Sie ein Zugriffstoken für die App "Expensify" und entweder die Rolle "Expensify Integration" oder "Administrator".\n\n*Wichtig:* Stellen Sie sicher, dass Sie die *Token ID* und das *Token Secret* aus diesem Schritt speichern. Sie werden diese für den nächsten Schritt benötigen.',
                    },
                    enterCredentials: {
                        title: 'Geben Sie Ihre NetSuite-Anmeldedaten ein',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite-Konto-ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Token-Geheimnis',
                        },
                        netSuiteAccountIDDescription: 'In NetSuite gehen Sie zu *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Ausgabenkategorien',
                expenseCategoriesDescription: 'Ihre NetSuite-Ausgabenkategorien werden als Kategorien in Expensify importiert.',
                crossSubsidiaryCustomers: 'Kunden/Projekte über Tochtergesellschaften hinweg',
                importFields: {
                    departments: {
                        title: 'Abteilungen',
                        subtitle: 'Wählen Sie aus, wie die NetSuite *Abteilungen* in Expensify behandelt werden sollen.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Wählen Sie aus, wie *Klassen* in Expensify behandelt werden sollen.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'Wählen Sie aus, wie *Standorte* in Expensify behandelt werden sollen.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'Wählen Sie aus, wie NetSuite *Kunden* und *Projekte* in Expensify behandelt werden sollen.',
                    importCustomers: 'Kunden importieren',
                    importJobs: 'Projekte importieren',
                    customers: 'Kunden',
                    jobs: 'Projekte',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('und')}, ${importType}`,
                },
                importTaxDescription: 'Importieren Sie Steuerguppen aus NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Wählen Sie eine Option unten:',
                    label: ({importedTypes}: ImportedTypesParams) => `Importiert als ${importedTypes.join('und')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Bitte geben Sie ${fieldName} ein`,
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Datensätze',
                        addText: 'Benutzerdefiniertes Segment/Datensatz hinzufügen',
                        recordTitle: 'Benutzerdefiniertes Segment/Datensatz',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'bei der Konfiguration benutzerdefinierter Segmente/Datensätze.',
                        emptyTitle: 'Fügen Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzu',
                        fields: {
                            segmentName: 'Name',
                            internalID: 'Interne ID',
                            scriptID: 'Skript-ID',
                            customRecordScriptID: 'Transaktionsspalten-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefiniertes Segment/Datensatz entfernen',
                        removePrompt: 'Sind Sie sicher, dass Sie dieses benutzerdefinierte Segment/Datensatz entfernen möchten?',
                        addForm: {
                            customSegmentName: 'benutzerdefinierter Segmentname',
                            customRecordName: 'benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefiniertes Segment',
                            customSegmentAddTitle: 'Benutzerdefiniertes Segment hinzufügen',
                            customRecordAddTitle: 'Benutzerdefinierter Datensatz hinzufügen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'Möchten Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzufügen?',
                            customSegmentNameTitle: 'Wie lautet der Name des benutzerdefinierten Segments?',
                            customRecordNameTitle: 'Wie lautet der benutzerdefinierte Datensatzname?',
                            customSegmentNameFooter: `Benutzerdefinierte Segmentnamen finden Sie in NetSuite unter *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Für detailliertere Anweisungen besuchen Sie bitte [unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Benutzerdefinierte Datensatznamen in NetSuite finden Sie, indem Sie im globalen Suchfeld „Transaction Column Field“ eingeben.\n\n_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Was ist die interne ID?',
                            customSegmentInternalIDFooter: `Stellen Sie zunächst sicher, dass Sie interne IDs in NetSuite unter *Home > Set Preferences > Show Internal ID* aktiviert haben.\n\nSie finden die internen IDs der benutzerdefinierten Segmente in NetSuite unter:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Klicken Sie auf ein benutzerdefiniertes Segment.\n3. Klicken Sie auf den Hyperlink neben *Custom Record Type*.\n4. Finden Sie die interne ID in der Tabelle unten.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Sie können die internen IDs benutzerdefinierter Datensätze in NetSuite wie folgt finden:\n\n1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.\n2. Klicken Sie auf einen benutzerdefinierten Datensatz.\n3. Finden Sie die interne ID auf der linken Seite.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wie lautet die Skript-ID?',
                            customSegmentScriptIDFooter: `Sie finden die Script-IDs für benutzerdefinierte Segmente in NetSuite unter:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Klicken Sie auf ein benutzerdefiniertes Segment.\n3. Klicken Sie unten auf die Registerkarte *Application and Sourcing* und dann:\n    a. Wenn Sie das benutzerdefinierte Segment als *Tag* (auf Positionsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transaction Columns* und verwenden Sie die *Field ID*.\n    b. Wenn Sie das benutzerdefinierte Segment als *Berichtsfeld* (auf Berichtsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transactions* und verwenden Sie die *Field ID*.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Was ist die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: `Sie können benutzerdefinierte Skript-IDs für Datensätze in NetSuite unter folgendem finden:\n\n1. Geben Sie "Transaction Line Fields" in die globale Suche ein.\n2. Klicken Sie auf einen benutzerdefinierten Datensatz.\n3. Finden Sie die Skript-ID auf der linken Seite.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Wie soll dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Datensatz in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Ein benutzerdefiniertes Segment/Datensatz mit diesem ${fieldName?.toLowerCase()} existiert bereits`,
                        },
                    },
                    customLists: {
                        title: 'Benutzerdefinierte Listen',
                        addText: 'Benutzerdefinierte Liste hinzufügen',
                        recordTitle: 'Benutzerdefinierte Liste',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration benutzerdefinierter Listen.',
                        emptyTitle: 'Eine benutzerdefinierte Liste hinzufügen',
                        fields: {
                            listName: 'Name',
                            internalID: 'Interne ID',
                            transactionFieldID: 'Transaktionsfeld-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefinierte Liste entfernen',
                        removePrompt: 'Sind Sie sicher, dass Sie diese benutzerdefinierte Liste entfernen möchten?',
                        addForm: {
                            listNameTitle: 'Wähle eine benutzerdefinierte Liste',
                            transactionFieldIDTitle: 'Was ist die Transaktionsfeld-ID?',
                            transactionFieldIDFooter: `Sie können die Transaktionsfeld-IDs in NetSuite finden, indem Sie folgende Schritte ausführen:\n\n1. Geben Sie "Transaction Line Fields" in die globale Suche ein.\n2. Klicken Sie auf eine benutzerdefinierte Liste.\n3. Finden Sie die Transaktionsfeld-ID auf der linken Seite.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Wie sollte diese benutzerdefinierte Liste in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Eine benutzerdefinierte Liste mit dieser Transaktionsfeld-ID existiert bereits`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite Mitarbeiter Standard',
                        description: 'Nicht in Expensify importiert, beim Export angewendet',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Wenn Sie ${importField} in NetSuite verwenden, wenden wir beim Export in den Spesenbericht oder die Buchung den auf dem Mitarbeiterdatensatz festgelegten Standardsatz an.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Positionsebene',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} wird für jede einzelne Ausgabe im Bericht eines Mitarbeiters auswählbar sein.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Berichtsfelder',
                        description: 'Berichtsebene',
                        footerContent: ({importField}: ImportFieldParams) => `Die Auswahl ${startCase(importField)} gilt für alle Ausgaben im Bericht eines Mitarbeiters.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct Einrichtung',
            prerequisitesTitle: 'Bevor Sie verbinden...',
            downloadExpensifyPackage: 'Laden Sie das Expensify-Paket für Sage Intacct herunter',
            followSteps: 'Folgen Sie den Schritten in unserer Anleitung: Verbindung zu Sage Intacct herstellen',
            enterCredentials: 'Geben Sie Ihre Sage Intacct Anmeldedaten ein',
            entity: 'Entität',
            employeeDefault: 'Standardmäßig für Sage Intacct-Mitarbeiter',
            employeeDefaultDescription: 'Die Standardabteilung des Mitarbeiters wird auf seine Ausgaben in Sage Intacct angewendet, sofern eine vorhanden ist.',
            displayedAsTagDescription: 'Die Abteilung wird für jede einzelne Ausgabe im Bericht eines Mitarbeiters auswählbar sein.',
            displayedAsReportFieldDescription: 'Die Abteilungsauswahl gilt für alle Ausgaben im Bericht eines Mitarbeiters.',
            toggleImportTitleFirstPart: 'Wählen Sie, wie Sage Intacct behandelt werden soll',
            toggleImportTitleSecondPart: 'in Expensify.',
            expenseTypes: 'Ausgabentypen',
            expenseTypesDescription: 'Ihre Sage Intacct Ausgabentypen werden als Kategorien in Expensify importiert.',
            accountTypesDescription: 'Ihr Sage Intacct Kontenplan wird als Kategorien in Expensify importiert.',
            importTaxDescription: 'Importieren Sie den Einkaufsteuersatz aus Sage Intacct.',
            userDefinedDimensions: 'Benutzerdefinierte Dimensionen',
            addUserDefinedDimension: 'Benutzerdefinierte Dimension hinzufügen',
            integrationName: 'Integrationsname',
            dimensionExists: 'Eine Dimension mit diesem Namen existiert bereits.',
            removeDimension: 'Benutzerdefinierte Dimension entfernen',
            removeDimensionPrompt: 'Sind Sie sicher, dass Sie diese benutzerdefinierte Dimension entfernen möchten?',
            userDefinedDimension: 'Benutzerdefinierte Dimension',
            addAUserDefinedDimension: 'Eine benutzerdefinierte Dimension hinzufügen',
            detailedInstructionsLink: 'Detaillierte Anweisungen anzeigen',
            detailedInstructionsRestOfSentence: 'beim Hinzufügen benutzerdefinierter Dimensionen.',
            userDimensionsAdded: () => ({
                one: '1 UDD hinzugefügt',
                other: (count: number) => `${count} UDDs hinzugefügt`,
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
                        return 'Zuordnungen';
                }
            },
        },
        type: {
            free: 'Kostenlos',
            control: 'Steuerung',
            collect: 'Sammeln',
        },
        companyCards: {
            addCards: 'Karten hinzufügen',
            selectCards: 'Karten auswählen',
            addNewCard: {
                other: 'Andere',
                cardProviders: {
                    gl1025: 'American Express Firmenkreditkarten',
                    cdf: 'Mastercard Geschäftskarten',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: `Wer ist Ihr Kartenanbieter?`,
                whoIsYourBankAccount: 'Wer ist Ihre Bank?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie möchten Sie sich mit Ihrer Bank verbinden?',
                learnMoreAboutOptions: {
                    text: 'Erfahren Sie mehr darüber',
                    linkText: 'Optionen.',
                },
                commercialFeedDetails:
                    'Erfordert die Einrichtung bei Ihrer Bank. Dies wird typischerweise von größeren Unternehmen verwendet und ist oft die beste Option, wenn Sie die Voraussetzungen erfüllen.',
                commercialFeedPlaidDetails: `Erfordert die Einrichtung bei Ihrer Bank, aber wir führen Sie durch den Prozess. Dies ist in der Regel auf größere Unternehmen beschränkt.`,
                directFeedDetails: 'Der einfachste Ansatz. Verbinden Sie sich sofort mit Ihren Hauptanmeldedaten. Diese Methode ist am gebräuchlichsten.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Aktivieren Sie Ihren ${provider}-Feed`,
                    heading:
                        'Wir haben eine direkte Integration mit Ihrem Kartenanbieter und können Ihre Transaktionsdaten schnell und genau in Expensify importieren.\n\nUm zu beginnen, einfach:',
                    visa: 'Wir haben globale Integrationen mit Visa, wobei die Berechtigung je nach Bank und Kartenprogramm variiert.\n\nUm zu beginnen, einfach:',
                    mastercard: 'Wir haben globale Integrationen mit Mastercard, wobei die Berechtigung je nach Bank und Kartenprogramm variiert.\n\nUm zu beginnen, einfach:',
                    vcf: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) für detaillierte Anweisungen zur Einrichtung Ihrer Visa Commercial Cards.\n\n2. [Kontaktieren Sie Ihre Bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), um zu überprüfen, ob sie einen kommerziellen Feed für Ihr Programm unterstützt, und bitten Sie sie, diesen zu aktivieren.\n\n3. *Sobald der Feed aktiviert ist und Sie die Details haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    gl1025: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), um herauszufinden, ob American Express für Ihr Programm einen kommerziellen Feed aktivieren kann.\n\n2. Sobald der Feed aktiviert ist, sendet Amex Ihnen ein Produktionsschreiben.\n\n3. *Sobald Sie die Feed-Informationen haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    cdf: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) für detaillierte Anweisungen zur Einrichtung Ihrer Mastercard Commercial Cards.\n\n2. [Kontaktieren Sie Ihre Bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), um zu überprüfen, ob sie einen kommerziellen Feed für Ihr Programm unterstützt, und bitten Sie sie, diesen zu aktivieren.\n\n3. *Sobald der Feed aktiviert ist und Sie die Details haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    stripe: `1. Besuchen Sie das Stripe-Dashboard und gehen Sie zu [Einstellungen](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Klicken Sie unter Produktintegrationen neben Expensify auf Aktivieren.\n\n3. Sobald der Feed aktiviert ist, klicken Sie unten auf Absenden und wir kümmern uns um die Integration.`,
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Name der Bank eingeben',
                feedDetails: {
                    vcf: {
                        title: 'Was sind die Visa-Feed-Details?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'ID der Finanzinstitution (Bank)',
                        companyLabel: 'Firmen-ID',
                        helpLabel: 'Wo finde ich diese IDs?',
                    },
                    gl1025: {
                        title: `Wie lautet der Dateiname der Amex-Lieferung?`,
                        fileNameLabel: 'Dateiname der Lieferung',
                        helpLabel: 'Wo finde ich den Dateinamen der Lieferung?',
                    },
                    cdf: {
                        title: `Was ist die Mastercard-Vertriebs-ID?`,
                        distributionLabel: 'Vertriebs-ID',
                        helpLabel: 'Wo finde ich die Verteilungs-ID?',
                    },
                },
                amexCorporate: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Corporate“ steht.',
                amexBusiness: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Business“ steht',
                amexPersonal: 'Wählen Sie dies, wenn Ihre Karten persönlich sind',
                error: {
                    pleaseSelectProvider: 'Bitte wählen Sie einen Kartenanbieter, bevor Sie fortfahren.',
                    pleaseSelectBankAccount: 'Bitte wählen Sie ein Bankkonto aus, bevor Sie fortfahren.',
                    pleaseSelectBank: 'Bitte wählen Sie eine Bank aus, bevor Sie fortfahren.',
                    pleaseSelectCountry: 'Bitte wählen Sie ein Land aus, bevor Sie fortfahren.',
                    pleaseSelectFeedType: 'Bitte wählen Sie einen Feed-Typ aus, bevor Sie fortfahren.',
                },
            },
            assignCard: 'Karte zuweisen',
            findCard: 'Karte finden',
            cardNumber: 'Kartennummer',
            commercialFeed: 'Kommerzieller Feed',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName} Karten`,
            directFeed: 'Direktfeed',
            whoNeedsCardAssigned: 'Wer benötigt eine zugewiesene Karte?',
            chooseCard: 'Wähle eine Karte aus',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Wähle eine Karte für ${assignee} aus dem ${feed} Karten-Feed aus.`,
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken: 'Oder etwas könnte kaputt sein. In jedem Fall, wenn Sie Fragen haben, einfach',
            contactConcierge: 'Kontaktieren Sie Concierge',
            chooseTransactionStartDate: 'Wählen Sie ein Transaktionsstartdatum aus',
            startDateDescription: 'Wir importieren alle Transaktionen ab diesem Datum. Wenn kein Datum angegeben ist, gehen wir so weit zurück, wie Ihre Bank es zulässt.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir beginnen sofort mit dem Importieren der Transaktionen.',
            cardholder: 'Karteninhaber',
            card: 'Karte',
            cardName: 'Kartennamen',
            brokenConnectionErrorFirstPart: `Die Karten-Feed-Verbindung ist unterbrochen. Bitte`,
            brokenConnectionErrorLink: 'Melden Sie sich bei Ihrer Bank an',
            brokenConnectionErrorSecondPart: 'damit wir die Verbindung wiederherstellen können.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `${assignee} wurde eine ${link} zugewiesen! Importierte Transaktionen werden in diesem Chat angezeigt.`,
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Karten-Feed auswählen',
            ukRegulation:
                'Expensify, Inc. ist ein Vertreter von Plaid Financial Ltd., einer zugelassenen Zahlungsinstitut, die von der Financial Conduct Authority gemäß den Payment Services Regulations 2017 (Firm Reference Number: 804718) reguliert wird. Plaid stellt Ihnen regulierte Kontoinformationsdienste über Expensify Limited als seinen Vertreter zur Verfügung.',
        },
        expensifyCard: {
            issueAndManageCards: 'Ausgabe und Verwaltung Ihrer Expensify-Karten',
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
            verificationInProgress: 'Verifizierung läuft...',
            verifyingTheDetails: 'Wir überprüfen einige Details. Concierge wird Sie benachrichtigen, wenn die Expensify-Karten zur Ausgabe bereit sind.',
            disclaimer:
                'Die Expensify Visa® Commercial Card wird von The Bancorp Bank, N.A., Mitglied der FDIC, gemäß einer Lizenz von Visa U.S.A. Inc. ausgegeben und kann nicht bei allen Händlern verwendet werden, die Visa-Karten akzeptieren. Apple® und das Apple-Logo® sind Marken von Apple Inc., registriert in den USA und anderen Ländern. App Store ist eine Dienstleistungsmarke von Apple Inc. Google Play und das Google Play-Logo sind Marken von Google LLC.',
            issueCard: 'Karte ausstellen',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4',
            limit: 'Limit',
            currentBalance: 'Aktueller Kontostand',
            currentBalanceDescription: 'Der aktuelle Kontostand ist die Summe aller gebuchten Expensify Card-Transaktionen, die seit dem letzten Abrechnungsdatum erfolgt sind.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Der Saldo wird am ${settlementDate} ausgeglichen.`,
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Anfrage zur Erhöhung des Limits',
            remainingLimitDescription:
                'Bei der Berechnung Ihres verbleibenden Limits berücksichtigen wir mehrere Faktoren: Ihre Kundendauer, die geschäftsbezogenen Informationen, die Sie bei der Anmeldung angegeben haben, und das verfügbare Guthaben auf Ihrem Geschäftskonto. Ihr verbleibendes Limit kann sich täglich ändern.',
            earnedCashback: 'Bargeld zurück',
            earnedCashbackDescription: 'Der Cashback-Saldo basiert auf den abgerechneten monatlichen Ausgaben mit der Expensify Card in Ihrem Arbeitsbereich.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Setup abschließen',
            chooseBankAccount: 'Bankkonto auswählen',
            chooseExistingBank: 'Wählen Sie ein bestehendes Geschäftskonto, um Ihren Expensify Card-Saldo zu bezahlen, oder fügen Sie ein neues Bankkonto hinzu.',
            accountEndingIn: 'Konto endet mit',
            addNewBankAccount: 'Ein neues Bankkonto hinzufügen',
            settlementAccount: 'Abrechnungskonto',
            settlementAccountDescription: 'Wählen Sie ein Konto, um Ihren Expensify Card-Saldo zu bezahlen.',
            settlementAccountInfoPt1: 'Stellen Sie sicher, dass dieses Konto übereinstimmt mit Ihrem',
            settlementAccountInfoPt2: 'damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.',
            reconciliationAccount: 'Abstimmungskonto',
            settlementFrequency: 'Abrechnungsfrequenz',
            settlementFrequencyDescription: 'Wählen Sie, wie oft Sie den Saldo Ihrer Expensify Card bezahlen möchten.',
            settlementFrequencyInfo:
                'Wenn Sie auf monatliche Abrechnung umstellen möchten, müssen Sie Ihr Bankkonto über Plaid verbinden und eine positive 90-Tage-Saldo-Historie vorweisen.',
            frequency: {
                daily: 'Täglich',
                monthly: 'Monatlich',
            },
            cardDetails: 'Kartendetails',
            virtual: 'Virtuell',
            physical: 'Physisch',
            deactivate: 'Karte deaktivieren',
            changeCardLimit: 'Kartenlimit ändern',
            changeLimit: 'Limit ändern',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie das Limit dieser Karte auf ${limit} ändern, werden neue Transaktionen abgelehnt, bis Sie weitere Ausgaben auf der Karte genehmigen.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Wenn Sie das Limit dieser Karte auf ${limit} ändern, werden neue Transaktionen bis zum nächsten Monat abgelehnt.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Wenn Sie das Limit dieser Karte auf ${limit} ändern, werden neue Transaktionen abgelehnt.`,
            changeCardLimitType: 'Kartengrenzentyp ändern',
            changeLimitType: 'Limittyp ändern',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie den Limittyp dieser Karte auf Smart Limit ändern, werden neue Transaktionen abgelehnt, da das ${limit} nicht genehmigte Limit bereits erreicht wurde.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie den Limittyp dieser Karte auf Monatlich ändern, werden neue Transaktionen abgelehnt, da das monatliche Limit von ${limit} bereits erreicht wurde.`,
            addShippingDetails: 'Versanddetails hinzufügen',
            issuedCard: ({assignee}: AssigneeParams) => `hat ${assignee} eine Expensify Card ausgestellt! Die Karte wird in 2-3 Werktagen ankommen.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `hat ${assignee} eine Expensify-Karte ausgestellt! Die Karte wird versendet, sobald die Versanddetails hinzugefügt wurden.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `hat ${assignee} eine virtuelle ${link} ausgestellt! Die Karte kann sofort verwendet werden.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} hat Versanddetails hinzugefügt. Die Expensify Card wird in 2-3 Werktagen ankommen.`,
            verifyingHeader: 'Überprüfung läuft',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird überprüft...',
            verifyingBankAccountDescription: 'Bitte warten Sie, während wir bestätigen, dass dieses Konto zur Ausstellung von Expensify-Karten verwendet werden kann.',
            bankAccountVerified: 'Bankkonto verifiziert!',
            bankAccountVerifiedDescription: 'Sie können jetzt Expensify-Karten an die Mitglieder Ihres Arbeitsbereichs ausgeben.',
            oneMoreStep: 'Noch ein Schritt...',
            oneMoreStepDescription: 'Es sieht so aus, als müssten wir Ihr Bankkonto manuell verifizieren. Bitte gehen Sie zu Concierge, wo Ihre Anweisungen auf Sie warten.',
            gotIt: 'Verstanden',
            goToConcierge: 'Zu Concierge gehen',
        },
        categories: {
            deleteCategories: 'Kategorien löschen',
            deleteCategoriesPrompt: 'Sind Sie sicher, dass Sie diese Kategorien löschen möchten?',
            deleteCategory: 'Kategorie löschen',
            deleteCategoryPrompt: 'Sind Sie sicher, dass Sie diese Kategorie löschen möchten?',
            disableCategories: 'Kategorien deaktivieren',
            disableCategory: 'Kategorie deaktivieren',
            enableCategories: 'Kategorien aktivieren',
            enableCategory: 'Kategorie aktivieren',
            defaultSpendCategories: 'Standardausgabenkategorien',
            spendCategoriesDescription: 'Passen Sie an, wie Ausgaben bei Händlern für Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim Löschen der Kategorie ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder müssen alle Ausgaben kategorisieren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle Ausgaben müssen kategorisiert werden, um sie nach ${connectionName} zu exportieren.`,
            subtitle: 'Behalten Sie besser im Blick, wo Geld ausgegeben wird. Verwenden Sie unsere Standardkategorien oder fügen Sie eigene hinzu.',
            emptyCategories: {
                title: 'Du hast noch keine Kategorien erstellt',
                subtitle: 'Fügen Sie eine Kategorie hinzu, um Ihre Ausgaben zu organisieren.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Deine Kategorien werden derzeit aus einer Buchhaltungsverbindung importiert. Gehe zu',
                subtitle2: 'Buchhaltung',
                subtitle3: 'um Änderungen vorzunehmen.',
            },
            updateFailureMessage: 'Beim Aktualisieren der Kategorie ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            createFailureMessage: 'Beim Erstellen der Kategorie ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            addCategory: 'Kategorie hinzufügen',
            editCategory: 'Kategorie bearbeiten',
            editCategories: 'Kategorien bearbeiten',
            findCategory: 'Kategorie finden',
            categoryRequiredError: 'Kategoriename ist erforderlich',
            existingCategoryError: 'Eine Kategorie mit diesem Namen existiert bereits',
            invalidCategoryName: 'Ungültiger Kategoriename',
            importedFromAccountingSoftware: 'Die untenstehenden Kategorien werden von Ihrem importiert',
            payrollCode: 'Lohncode',
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Gehaltscodes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            glCode: 'GL-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des GL-Codes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Kann nicht alle Kategorien löschen oder deaktivieren',
                description: `Mindestens eine Kategorie muss aktiviert bleiben, da Ihr Arbeitsbereich Kategorien benötigt.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Verwenden Sie die untenstehenden Umschalter, um mit Ihrem Wachstum weitere Funktionen zu aktivieren. Jede Funktion wird im Navigationsmenü für weitere Anpassungen angezeigt.',
            spendSection: {
                title: 'Ausgeben',
                subtitle: 'Aktivieren Sie Funktionen, die Ihnen helfen, Ihr Team zu skalieren.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'Fügen Sie Steuerungen hinzu, die helfen, die Ausgaben im Budget zu halten.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Optimieren Sie Ihre Einnahmen und erhalten Sie schneller Zahlungen.',
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
                title: 'Entfernungstarife',
                subtitle: 'Fügen Sie Tarife hinzu, aktualisieren Sie sie und setzen Sie sie durch.',
            },
            perDiem: {
                title: 'Tagespauschale',
                subtitle: 'Legen Sie Pauschalbeträge fest, um die täglichen Ausgaben der Mitarbeiter zu kontrollieren.',
            },
            expensifyCard: {
                title: 'Expensify-Karte',
                subtitle: 'Gewinnen Sie Einblicke und Kontrolle über Ausgaben.',
                disableCardTitle: 'Expensify Card deaktivieren',
                disableCardPrompt: 'Sie können die Expensify Card nicht deaktivieren, da sie bereits verwendet wird. Wenden Sie sich für die nächsten Schritte an Concierge.',
                disableCardButton: 'Chat mit Concierge',
                feed: {
                    title: 'Holen Sie sich die Expensify Card',
                    subTitle: 'Optimieren Sie Ihre Geschäftsausgaben und sparen Sie bis zu 50 % bei Ihrer Expensify-Rechnung, außerdem:',
                    features: {
                        cashBack: 'Cashback bei jedem Einkauf in den USA',
                        unlimited: 'Unbegrenzte virtuelle Karten',
                        spend: 'Ausgabenkontrollen und benutzerdefinierte Limits',
                    },
                    ctaTitle: 'Neue Karte ausstellen',
                },
            },
            companyCards: {
                title: 'Firmenkarten',
                subtitle: 'Ausgaben von bestehenden Firmenkarten importieren.',
                feed: {
                    title: 'Firmenkarten importieren',
                    features: {
                        support: 'Unterstützung für alle großen Kartenanbieter',
                        assignCards: 'Karten dem gesamten Team zuweisen',
                        automaticImport: 'Automatischer Transaktionsimport',
                    },
                },
                disableCardTitle: 'Firmenkarten deaktivieren',
                disableCardPrompt: 'Sie können Firmenkarten nicht deaktivieren, da diese Funktion verwendet wird. Wenden Sie sich für die nächsten Schritte an den Concierge.',
                disableCardButton: 'Chat mit Concierge',
                cardDetails: 'Kartendetails',
                cardNumber: 'Kartennummer',
                cardholder: 'Karteninhaber',
                cardName: 'Kartennamen',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} Export` : `${integration} Export`),
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `Wählen Sie das ${integration}-Konto aus, in das Transaktionen exportiert werden sollen.`,
                integrationExportTitlePart: 'Wähle eine andere aus',
                integrationExportTitleLinkPart: 'Exportoption',
                integrationExportTitleSecondPart: 'um die verfügbaren Konten zu ändern.',
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Transaktionsstartdatum',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte entziehen',
                unassign: 'Zuweisung aufheben',
                unassignCardDescription: 'Das Entfernen der Zuweisung dieser Karte entfernt alle Transaktionen auf Entwurfsberichten vom Konto des Karteninhabers.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Name des Karten-Feeds',
                cardFeedNameDescription: 'Geben Sie dem Karten-Feed einen eindeutigen Namen, damit Sie ihn von den anderen unterscheiden können.',
                cardFeedTransaction: 'Transaktionen löschen',
                cardFeedTransactionDescription: 'Wählen Sie aus, ob Karteninhaber Kartentransaktionen löschen können. Neue Transaktionen unterliegen diesen Regeln.',
                cardFeedRestrictDeletingTransaction: 'Löschen von Transaktionen einschränken',
                cardFeedAllowDeletingTransaction: 'Das Löschen von Transaktionen erlauben',
                removeCardFeed: 'Karten-Feed entfernen',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `${feedName}-Feed entfernen`,
                removeCardFeedDescription: 'Sind Sie sicher, dass Sie diesen Karten-Feed entfernen möchten? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Der Name des Karten-Feeds ist erforderlich',
                },
                corporate: 'Löschen von Transaktionen einschränken',
                personal: 'Das Löschen von Transaktionen erlauben',
                setFeedNameDescription: 'Geben Sie dem Karten-Feed einen eindeutigen Namen, damit Sie ihn von den anderen unterscheiden können.',
                setTransactionLiabilityDescription: 'Wenn aktiviert, können Karteninhaber Kartentransaktionen löschen. Neue Transaktionen unterliegen dieser Regel.',
                emptyAddedFeedTitle: 'Firmenkarten zuweisen',
                emptyAddedFeedDescription: 'Beginnen Sie, indem Sie Ihre erste Karte einem Mitglied zuweisen.',
                pendingFeedTitle: `Wir überprüfen Ihre Anfrage...`,
                pendingFeedDescription: `Wir überprüfen derzeit Ihre Feed-Details. Sobald dies abgeschlossen ist, werden wir Sie über kontaktieren`,
                pendingBankTitle: 'Überprüfen Sie Ihr Browserfenster',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Bitte verbinden Sie sich über das gerade geöffnete Browserfenster mit ${bankName}. Falls kein Fenster geöffnet wurde,`,
                pendingBankLink: 'bitte hier klicken.',
                giveItNameInstruction: 'Geben Sie der Karte einen Namen, der sie von anderen unterscheidet.',
                updating: 'Aktualisiere...',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: `Arbeitsbereich kann nicht herabgestuft werden`,
                downgradeSubTitleFirstPart: `Dieser Arbeitsbereich kann nicht herabgestuft werden, da mehrere Karten-Feeds verbunden sind (außer Expensify Cards). Bitte`,
                downgradeSubTitleMiddlePart: `Behalte nur einen Karten-Feed`,
                downgradeSubTitleLastPart: 'fortfahren.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Bitte fügen Sie das Konto in ${connection} hinzu und synchronisieren Sie die Verbindung erneut.`,
                expensifyCardBannerTitle: 'Holen Sie sich die Expensify Card',
                expensifyCardBannerSubtitle:
                    'Genießen Sie Cashback bei jedem Einkauf in den USA, bis zu 50 % Rabatt auf Ihre Expensify-Rechnung, unbegrenzte virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Mehr erfahren',
            },
            workflows: {
                title: 'Arbeitsabläufe',
                subtitle: 'Konfigurieren Sie, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt:
                    'Expensify-Karten aus diesem Arbeitsbereich basieren derzeit auf Genehmigungen, um ihre Smart Limits festzulegen. Bitte ändern Sie die Limittypen aller Expensify-Karten mit Smart Limits, bevor Sie die Genehmigungen deaktivieren.',
            },
            invoices: {
                title: 'Rechnungen',
                subtitle: 'Rechnungen senden und empfangen.',
            },
            categories: {
                title: 'Kategorien',
                subtitle: 'Ausgaben verfolgen und organisieren.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Kosten klassifizieren und abrechenbare Ausgaben verfolgen.',
            },
            taxes: {
                title: 'Steuern',
                subtitle: 'Dokumentieren und erstattungsfähige Steuern zurückfordern.',
            },
            reportFields: {
                title: 'Berichtsfelder',
                subtitle: 'Richten Sie benutzerdefinierte Felder für Ausgaben ein.',
            },
            connections: {
                title: 'Buchhaltung',
                subtitle: 'Synchronisieren Sie Ihr Kontenplan und mehr.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nicht so schnell...',
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, müssen Sie Ihre Einstellungen für den Buchhaltungsexport ändern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, müssen Sie die Buchhaltungsverbindung von Ihrem Arbeitsbereich trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell...',
                featureEnabledText:
                    'Expensify-Karten in diesem Arbeitsbereich basieren auf Genehmigungsabläufen, um ihre Smart Limits zu definieren.\n\nBitte ändern Sie die Limitarten aller Karten mit Smart Limits, bevor Sie die Abläufe deaktivieren.',
                confirmText: 'Zu Expensify Cards gehen',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Quittungen anfordern, hohe Ausgaben markieren und mehr.',
            },
        },
        reportFields: {
            addField: 'Feld hinzufügen',
            delete: 'Feld löschen',
            deleteFields: 'Felder löschen',
            findReportField: 'Berichtsfeld finden',
            deleteConfirmation: 'Sind Sie sicher, dass Sie dieses Berichts-Feld löschen möchten?',
            deleteFieldsConfirmation: 'Sind Sie sicher, dass Sie diese Berichts-Felder löschen möchten?',
            emptyReportFields: {
                title: 'Sie haben noch keine Berichtsbereiche erstellt',
                subtitle: 'Fügen Sie ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten angezeigt wird.',
            },
            subtitle: 'Berichtsfelder gelten für alle Ausgaben und können hilfreich sein, wenn Sie nach zusätzlichen Informationen fragen möchten.',
            disableReportFields: 'Berichtsfelder deaktivieren',
            disableReportFieldsConfirmation: 'Sind Sie sicher? Text- und Datumsfelder werden gelöscht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die untenstehenden Berichtsfelder werden aus Ihrem importiert',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            textAlternateText: 'Fügen Sie ein Feld für Freitexteingaben hinzu.',
            dateAlternateText: 'Fügen Sie einen Kalender zur Datumsauswahl hinzu.',
            dropdownAlternateText: 'Fügen Sie eine Liste von Auswahlmöglichkeiten hinzu.',
            nameInputSubtitle: 'Wählen Sie einen Namen für das Berichts-Feld.',
            typeInputSubtitle: 'Wählen Sie aus, welchen Typ von Berichts-Feld Sie verwenden möchten.',
            initialValueInputSubtitle: 'Geben Sie einen Startwert ein, der im Berichtsbereich angezeigt werden soll.',
            listValuesInputSubtitle: 'Diese Werte werden im Dropdown-Menü Ihres Berichtsfilters angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            listInputSubtitle: 'Diese Werte werden in Ihrer Berichts-Feldliste angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            deleteValue: 'Wert löschen',
            deleteValues: 'Werte löschen',
            disableValue: 'Wert deaktivieren',
            disableValues: 'Werte deaktivieren',
            enableValue: 'Wert aktivieren',
            enableValues: 'Werte aktivieren',
            emptyReportFieldsValues: {
                title: 'Sie haben keine Listeneinträge erstellt',
                subtitle: 'Fügen Sie benutzerdefinierte Werte hinzu, die in Berichten angezeigt werden sollen.',
            },
            deleteValuePrompt: 'Sind Sie sicher, dass Sie diesen Listenwert löschen möchten?',
            deleteValuesPrompt: 'Sind Sie sicher, dass Sie diese Listenwerte löschen möchten?',
            listValueRequiredError: 'Bitte geben Sie einen Listenelementnamen ein',
            existingListValueError: 'Ein Listeneintrag mit diesem Namen existiert bereits',
            editValue: 'Wert bearbeiten',
            listValues: 'Listenwerte',
            addValue: 'Wert hinzufügen',
            existingReportFieldNameError: 'Ein Berichts-Feld mit diesem Namen existiert bereits',
            reportFieldNameRequiredError: 'Bitte geben Sie einen Berichtsfeldnamen ein',
            reportFieldTypeRequiredError: 'Bitte wählen Sie einen Berichtsfeldtyp aus',
            reportFieldInitialValueRequiredError: 'Bitte wählen Sie einen Anfangswert für das Berichts-Feld aus',
            genericFailureMessage: 'Beim Aktualisieren des Berichts wurde ein Fehler festgestellt. Bitte versuchen Sie es erneut.',
        },
        tags: {
            tagName: 'Tag-Name',
            requiresTag: 'Mitglieder müssen alle Ausgaben kennzeichnen',
            trackBillable: 'Verfolgen Sie abrechenbare Ausgaben',
            customTagName: 'Benutzerdefinierter Tag-Name',
            enableTag: 'Tag aktivieren',
            enableTags: 'Tags aktivieren',
            requireTag: 'Erforderliches Tag',
            requireTags: 'Tags erforderlich',
            notRequireTags: 'Nicht erforderlich machen',
            disableTag: 'Tag deaktivieren',
            disableTags: 'Tags deaktivieren',
            addTag: 'Tag hinzufügen',
            editTag: 'Tag bearbeiten',
            editTags: 'Tags bearbeiten',
            findTag: 'Tag finden',
            subtitle: 'Tags fügen detailliertere Möglichkeiten hinzu, Kosten zu klassifizieren.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: 'Sie verwenden',
                phrase2: 'abhängige Tags',
                phrase3: '. You can',
                phrase4: 'Tabellenkalkulation erneut importieren',
                phrase5: 'um Ihre Tags zu aktualisieren.',
            },
            emptyTags: {
                title: 'Du hast noch keine Tags erstellt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Fügen Sie ein Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitle1: 'Importieren Sie eine Tabelle, um Tags für die Verfolgung von Projekten, Standorten, Abteilungen und mehr hinzuzufügen.',
                subtitle2: 'Mehr erfahren',
                subtitle3: 'über das Formatieren von Tag-Dateien.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'Deine Tags werden derzeit von einer Buchhaltungsverbindung importiert. Gehe zu',
                subtitle2: 'Buchhaltung',
                subtitle3: 'um Änderungen vorzunehmen.',
            },
            deleteTag: 'Tag löschen',
            deleteTags: 'Tags löschen',
            deleteTagConfirmation: 'Sind Sie sicher, dass Sie dieses Tag löschen möchten?',
            deleteTagsConfirmation: 'Sind Sie sicher, dass Sie diese Tags löschen möchten?',
            deleteFailureMessage: 'Beim Löschen des Tags ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            tagRequiredError: 'Tag-Name ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits',
            invalidTagNameError: 'Der Tag-Name darf nicht 0 sein. Bitte wählen Sie einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            importedFromAccountingSoftware: 'Die untenstehenden Tags werden aus Ihrem importiert',
            glCode: 'GL-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des GL-Codes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmiger',
            importTags: 'Importiere Tags',
            importTagsSupportingText: 'Kennzeichnen Sie Ihre Ausgaben mit einer oder mehreren Arten von Tags.',
            configureMultiLevelTags: 'Konfigurieren Sie Ihre Liste von Tags für die mehrstufige Tagging.',
            importMultiLevelTagsSupportingText: `Hier ist eine Vorschau Ihrer Tags. Wenn alles gut aussieht, klicken Sie unten, um sie zu importieren.`,
            importMultiLevelTags: {
                firstRowTitle: 'Die erste Zeile ist der Titel für jede Schlagwortliste',
                independentTags: 'Dies sind unabhängige Tags',
                glAdjacentColumn: 'In der benachbarten Spalte befindet sich ein GL-Code',
            },
            tagLevel: {
                singleLevel: 'Einzelne Ebene von Tags',
                multiLevel: 'Mehrstufige Tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-Ebenen wechseln',
                prompt1: 'Das Wechseln der Tag-Ebenen löscht alle aktuellen Tags.',
                prompt2: 'Wir empfehlen Ihnen zunächst',
                prompt3: 'Backup herunterladen',
                prompt4: 'indem Sie Ihre Tags exportieren.',
                prompt5: 'Mehr erfahren',
                prompt6: 'über Tag-Ebenen.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Wir haben *${columnCounts} Spalten* in Ihrer Tabelle gefunden. Wählen Sie *Name* neben der Spalte aus, die die Tag-Namen enthält. Sie können auch *Enabled* neben der Spalte auswählen, die den Tag-Status festlegt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Kann nicht alle Tags löschen oder deaktivieren',
                description: `Mindestens ein Tag muss aktiviert bleiben, da Ihr Arbeitsbereich Tags benötigt.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kann nicht alle Tags optional machen',
                description: `Mindestens ein Tag muss erforderlich bleiben, da Ihre Workspace-Einstellungen Tags erfordern.`,
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Fügen Sie Steuernamen, Sätze hinzu und legen Sie Standardwerte fest.',
            addRate: 'Tarif hinzufügen',
            workspaceDefault: 'Standardwährung des Arbeitsbereichs',
            foreignDefault: 'Standardwährung für Fremdwährungen',
            customTaxName: 'Benutzerdefinierter Steuername',
            value: 'Wert',
            taxReclaimableOn: 'Steuererstattung auf',
            taxRate: 'Steuersatz',
            findTaxRate: 'Steuersatz finden',
            error: {
                taxRateAlreadyExists: 'Dieser Steuername wird bereits verwendet',
                taxCodeAlreadyExists: 'Dieser Steuercode wird bereits verwendet',
                valuePercentageRange: 'Bitte geben Sie einen gültigen Prozentsatz zwischen 0 und 100 ein.',
                customNameRequired: 'Benutzerdefinierter Steuername ist erforderlich',
                deleteFailureMessage: 'Beim Löschen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder wenden Sie sich an Concierge für Hilfe.',
                updateFailureMessage: 'Beim Aktualisieren des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder wenden Sie sich an Concierge für Hilfe.',
                createFailureMessage: 'Beim Erstellen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder wenden Sie sich an Concierge für Hilfe.',
                updateTaxClaimableFailureMessage: 'Der erstattungsfähige Anteil muss geringer sein als der Kilometerpauschalbetrag.',
            },
            deleteTaxConfirmation: 'Sind Sie sicher, dass Sie diese Steuer löschen möchten?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Sind Sie sicher, dass Sie ${taxAmount} Steuern löschen möchten?`,
            actions: {
                delete: 'Löschrate',
                deleteMultiple: 'Tarife löschen',
                enable: 'Bewertung aktivieren',
                disable: 'Bewertung deaktivieren',
                enableTaxRates: () => ({
                    one: 'Bewertung aktivieren',
                    other: 'Tarife aktivieren',
                }),
                disableTaxRates: () => ({
                    one: 'Bewertung deaktivieren',
                    other: 'Tarife deaktivieren',
                }),
            },
            importedFromAccountingSoftware: 'Die untenstehenden Steuern werden von Ihrem importiert',
            taxCode: 'Steuercode',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
        },
        emptyWorkspace: {
            title: 'Arbeitsbereich erstellen',
            subtitle:
                'Erstellen Sie einen Arbeitsbereich, um Belege zu verfolgen, Ausgaben zu erstatten, Reisen zu verwalten, Rechnungen zu senden und mehr – alles mit der Geschwindigkeit eines Chats.',
            createAWorkspaceCTA: 'Loslegen',
            features: {
                trackAndCollect: 'Belege verfolgen und sammeln',
                reimbursements: 'Mitarbeiter erstatten',
                companyCards: 'Firmenkarten verwalten',
            },
            notFound: 'Kein Arbeitsbereich gefunden',
            description:
                'Räume sind ein großartiger Ort, um mit mehreren Personen zu diskutieren und zusammenzuarbeiten. Um mit der Zusammenarbeit zu beginnen, erstellen Sie einen Arbeitsbereich oder treten Sie einem bei.',
        },
        new: {
            newWorkspace: 'Neuer Arbeitsbereich',
            getTheExpensifyCardAndMore: 'Holen Sie sich die Expensify Card und mehr',
            confirmWorkspace: 'Arbeitsbereich bestätigen',
            myGroupWorkspace: 'Mein Gruppenarbeitsbereich',
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Arbeitsbereich von ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Sind Sie sicher, dass Sie ${memberName} entfernen möchten?`,
                other: 'Sind Sie sicher, dass Sie diese Mitglieder entfernen möchten?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} ist ein Genehmiger in diesem Arbeitsbereich. Wenn Sie diesen Arbeitsbereich nicht mehr mit ihnen teilen, ersetzen wir sie im Genehmigungsprozess durch den Arbeitsbereichsinhaber, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Mitglied entfernen',
                other: 'Mitglieder entfernen',
            }),
            findMember: 'Mitglied finden',
            removeWorkspaceMemberButtonTitle: 'Aus dem Arbeitsbereich entfernen',
            removeGroupMemberButtonTitle: 'Aus Gruppe entfernen',
            removeRoomMemberButtonTitle: 'Aus dem Chat entfernen',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Sind Sie sicher, dass Sie ${memberName} entfernen möchten?`,
            removeMemberTitle: 'Mitglied entfernen',
            transferOwner: 'Eigentümer übertragen',
            makeMember: 'Mitglied machen',
            makeAdmin: 'Zum Administrator machen',
            makeAuditor: 'Auditor erstellen',
            selectAll: 'Alle auswählen',
            error: {
                genericAdd: 'Beim Hinzufügen dieses Arbeitsbereichsmitglieds ist ein Problem aufgetreten',
                cannotRemove: 'Du kannst dich selbst oder den Workspace-Inhaber nicht entfernen.',
                genericRemove: 'Beim Entfernen dieses Arbeitsbereichsmitglieds ist ein Problem aufgetreten',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren primären Anmeldungen hinzugefügt.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Hinzugefügt durch sekundären Login ${secondaryLogin}.`,
            membersListTitle: 'Verzeichnis aller Arbeitsbereichsmitglieder.',
            importMembers: 'Mitglieder importieren',
        },
        card: {
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
            issueCard: 'Karte ausstellen',
            issueNewCard: {
                whoNeedsCard: 'Wer braucht eine Karte?',
                findMember: 'Mitglied finden',
                chooseCardType: 'Wählen Sie einen Kartentyp aus',
                physicalCard: 'Physische Karte',
                physicalCardDescription: 'Ideal für den Vielspender',
                virtualCard: 'Virtuelle Karte',
                virtualCardDescription: 'Sofortig und flexibel',
                chooseLimitType: 'Wählen Sie einen Limittyp',
                smartLimit: 'Intelligentes Limit',
                smartLimitDescription: 'Geben Sie bis zu einem bestimmten Betrag aus, bevor eine Genehmigung erforderlich ist',
                monthly: 'Monatlich',
                monthlyDescription: 'Geben Sie bis zu einem bestimmten Betrag pro Monat aus',
                fixedAmount: 'Fester Betrag',
                fixedAmountDescription: 'Einmalig bis zu einem bestimmten Betrag ausgeben',
                setLimit: 'Setze ein Limit',
                cardLimitError: 'Bitte geben Sie einen Betrag unter $21,474,836 ein',
                giveItName: 'Gib ihm einen Namen',
                giveItNameInstruction: 'Machen Sie es einzigartig, damit es sich von anderen Karten unterscheidet. Spezifische Anwendungsfälle sind dabei besonders hilfreich!',
                cardName: 'Kartennamen',
                letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
                willBeReady: 'Diese Karte ist sofort einsatzbereit.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Begrenzungstyp',
                name: 'Name',
            },
            deactivateCardModal: {
                deactivate: 'Deaktivieren',
                deactivateCard: 'Karte deaktivieren',
                deactivateConfirmation: 'Das Deaktivieren dieser Karte wird alle zukünftigen Transaktionen ablehnen und kann nicht rückgängig gemacht werden.',
            },
        },
        accounting: {
            settings: 'Einstellungen',
            title: 'Verbindungen',
            subtitle:
                'Verbinden Sie sich mit Ihrem Buchhaltungssystem, um Transaktionen mit Ihrem Kontenplan zu codieren, Zahlungen automatisch abzugleichen und Ihre Finanzen synchron zu halten.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatten Sie mit Ihrem Einrichtungsspezialisten.',
            talkYourAccountManager: 'Chatten Sie mit Ihrem Account Manager.',
            talkToConcierge: 'Chatten Sie mit Concierge.',
            needAnotherAccounting: 'Benötigen Sie eine andere Buchhaltungssoftware?',
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
            goToODToFix: 'Gehen Sie zu Expensify Classic, um dieses Problem zu beheben.',
            goToODToSettings: 'Gehen Sie zu Expensify Classic, um Ihre Einstellungen zu verwalten.',
            setup: 'Verbinden',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Zuletzt synchronisiert ${relativeDate}`,
            notSync: 'Nicht synchronisiert',
            import: 'Importieren',
            export: 'Exportieren',
            advanced: 'Erweitert',
            other: 'Andere',
            syncNow: 'Jetzt synchronisieren',
            disconnect: 'Trennen',
            reinstall: 'Connector neu installieren',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'Integration';
                return `${integrationName} trennen`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Verbinden ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'Buchhaltungsintegration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Verbindung zu QuickBooks Online kann nicht hergestellt werden';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Kann keine Verbindung zu Xero herstellen';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Verbindung zu NetSuite kann nicht hergestellt werden';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Verbindung zu QuickBooks Desktop kann nicht hergestellt werden';
                    default: {
                        return 'Kann keine Verbindung zur Integration herstellen';
                    }
                }
            },
            accounts: 'Kontenplan',
            taxes: 'Steuern',
            imported: 'Importiert',
            notImported: 'Nicht importiert',
            importAsCategory: 'Importiert als Kategorien',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importiert als Tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Nicht importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Nicht importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Als Berichts-Felder importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite Mitarbeiter Standard',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'diese Integration';
                return `Sind Sie sicher, dass Sie ${integrationName} trennen möchten?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Sind Sie sicher, dass Sie ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'diese Buchhaltungsintegration'} verbinden möchten? Dadurch werden alle bestehenden Buchhaltungsverbindungen entfernt.`,
            enterCredentials: 'Geben Sie Ihre Zugangsdaten ein',
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
                            return 'Importieren von Klassen';
                        case 'quickbooksOnlineImportLocations':
                            return 'Standorte importieren';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Verarbeite importierte Daten';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisiere erstattete Berichte und Rechnungszahlungen';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importieren von Steuercodes';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Überprüfung der QuickBooks Online-Verbindung';
                        case 'quickbooksOnlineImportMain':
                            return 'Importieren von QuickBooks Online-Daten';
                        case 'startingImportXero':
                            return 'Importieren von Xero-Daten';
                        case 'startingImportQBO':
                            return 'Importieren von QuickBooks Online-Daten';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importieren von QuickBooks Desktop-Daten';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importieren Titel';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importiere Genehmigungszertifikat';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensionen importieren';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importiere Speicher-Richtlinie';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Daten werden weiterhin mit QuickBooks synchronisiert... Bitte stellen Sie sicher, dass der Web Connector läuft';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronisiere QuickBooks Online-Daten';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Daten werden geladen';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Kategorien werden aktualisiert';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Aktualisiere Kunden/Projekte';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Aktualisiere Personenliste';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Berichtsfelder werden aktualisiert';
                        case 'jobDone':
                            return 'Warten auf das Laden der importierten Daten';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Kontenplan wird synchronisiert';
                        case 'xeroSyncImportCategories':
                            return 'Kategorien werden synchronisiert';
                        case 'xeroSyncImportCustomers':
                            return 'Kunden werden synchronisiert';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Markieren von Xero-Rechnungen und -Fakturen als bezahlt';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronisiere Tracking-Kategorien';
                        case 'xeroSyncImportBankAccounts':
                            return 'Bankkonten werden synchronisiert';
                        case 'xeroSyncImportTaxRates':
                            return 'Steuersätze werden synchronisiert';
                        case 'xeroCheckConnection':
                            return 'Überprüfung der Xero-Verbindung';
                        case 'xeroSyncTitle':
                            return 'Xero-Daten werden synchronisiert';
                        case 'netSuiteSyncConnection':
                            return 'Initialisiere Verbindung zu NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Kunden importieren';
                        case 'netSuiteSyncInitData':
                            return 'Daten werden von NetSuite abgerufen';
                        case 'netSuiteSyncImportTaxes':
                            return 'Steuern importieren';
                        case 'netSuiteSyncImportItems':
                            return 'Importieren von Elementen';
                        case 'netSuiteSyncData':
                            return 'Daten in Expensify importieren';
                        case 'netSuiteSyncAccounts':
                            return 'Konten werden synchronisiert';
                        case 'netSuiteSyncCurrencies':
                            return 'Währungen werden synchronisiert';
                        case 'netSuiteSyncCategories':
                            return 'Kategorien werden synchronisiert';
                        case 'netSuiteSyncReportFields':
                            return 'Importieren von Daten als Expensify-Berichtsfelder';
                        case 'netSuiteSyncTags':
                            return 'Importieren von Daten als Expensify-Tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Verbindungsinformationen werden aktualisiert';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Markieren von NetSuite-Rechnungen und -Fakturen als bezahlt';
                        case 'netSuiteImportVendorsTitle':
                            return 'Lieferanten importieren';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importieren benutzerdefinierter Listen';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importieren benutzerdefinierter Listen';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importieren von Tochtergesellschaften';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Lieferanten importieren';
                        case 'intacctCheckConnection':
                            return 'Überprüfung der Sage Intacct-Verbindung';
                        case 'intacctImportDimensions':
                            return 'Importieren von Sage Intacct-Dimensionen';
                        case 'intacctImportTitle':
                            return 'Importieren von Sage Intacct-Daten';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Übersetzung fehlt für Phase: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugter Exporteur',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Administrator sein, muss jedoch auch ein Domain-Administrator sein, wenn Sie unterschiedliche Exportkonten für einzelne Firmenkarten in den Domain-Einstellungen festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zum Export in seinem Konto.',
            exportAs: 'Exportieren als',
            exportOutOfPocket: 'Auslagen exportieren als',
            exportCompanyCard: 'Firmenkartenausgaben exportieren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardanbieter',
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Synchronisieren Sie NetSuite und Expensify automatisch, jeden Tag. Exportieren Sie den finalisierten Bericht in Echtzeit.',
            reimbursedReports: 'Erstattete Berichte synchronisieren',
            cardReconciliation: 'Kartenabstimmung',
            reconciliationAccount: 'Abstimmungskonto',
            continuousReconciliation: 'Kontinuierliche Abstimmung',
            saveHoursOnReconciliation:
                'Sparen Sie Stunden bei der Abstimmung in jeder Abrechnungsperiode, indem Expensify kontinuierlich die Abrechnungen und Abwicklungen der Expensify Card in Ihrem Auftrag abstimmt.',
            enableContinuousReconciliation: 'Um die kontinuierliche Abstimmung zu aktivieren, bitte aktivieren Sie',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wählen Sie das Bankkonto aus, mit dem Ihre Zahlungen der Expensify Card abgeglichen werden sollen.',
                accountMatches: 'Stellen Sie sicher, dass dieses Konto mit Ihrem übereinstimmt',
                settlementAccount: 'Abrechnungskonto der Expensify Card',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(endet mit ${lastFourPAN}), damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.`,
            },
        },
        export: {
            notReadyHeading: 'Nicht bereit zum Exportieren',
            notReadyDescription:
                'Entwürfe oder ausstehende Spesenabrechnungen können nicht in das Buchhaltungssystem exportiert werden. Bitte genehmigen oder bezahlen Sie diese Ausgaben, bevor Sie sie exportieren.',
        },
        invoices: {
            sendInvoice: 'Rechnung senden',
            sendFrom: 'Gesendet von',
            invoicingDetails: 'Rechnungsdetails',
            invoicingDetailsDescription: 'Diese Informationen werden auf Ihren Rechnungen angezeigt.',
            companyName: 'Firmenname',
            companyWebsite: 'Firmenwebsite',
            paymentMethods: {
                personal: 'Persönlich',
                business: 'Geschäft',
                chooseInvoiceMethod: 'Wählen Sie unten eine Zahlungsmethode aus:',
                addBankAccount: 'Bankkonto hinzufügen',
                payingAsIndividual: 'Als Privatperson bezahlen',
                payingAsBusiness: 'Bezahlen als Unternehmen',
            },
            invoiceBalance: 'Rechnungsbetrag',
            invoiceBalanceSubtitle:
                'Dies ist Ihr aktueller Kontostand aus dem Einzug von Rechnungszahlungen. Er wird automatisch auf Ihr Bankkonto überwiesen, wenn Sie eines hinzugefügt haben.',
            bankAccountsSubtitle: 'Fügen Sie ein Bankkonto hinzu, um Rechnungszahlungen zu senden und zu empfangen.',
        },
        invite: {
            member: 'Mitglied einladen',
            members: 'Mitglieder einladen',
            invitePeople: 'Neue Mitglieder einladen',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            pleaseEnterValidLogin: `Bitte stellen Sie sicher, dass die E-Mail-Adresse oder Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'Benutzer',
            users: 'Benutzer',
            invited: 'eingeladen',
            removed: 'entfernt',
            to: 'an',
            from: 'von',
        },
        inviteMessage: {
            confirmDetails: 'Details bestätigen',
            inviteMessagePrompt: 'Machen Sie Ihre Einladung besonders, indem Sie unten eine Nachricht hinzufügen!',
            personalMessagePrompt: 'Nachricht',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            inviteNoMembersError: 'Bitte wählen Sie mindestens ein Mitglied zur Einladung aus',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} hat angefragt, ${workspaceName} beizutreten`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nicht so schnell...',
            workspaceNeeds: 'Ein Arbeitsbereich benötigt mindestens einen aktivierten Entfernungs-Tarif.',
            distance: 'Entfernung',
            centrallyManage: 'Verwalten Sie zentral die Tarife, verfolgen Sie in Meilen oder Kilometern und legen Sie eine Standardkategorie fest.',
            rate: 'Bewerten',
            addRate: 'Tarif hinzufügen',
            findRate: 'Tarif finden',
            trackTax: 'Steuer verfolgen',
            deleteRates: () => ({
                one: 'Löschrate',
                other: 'Tarife löschen',
            }),
            enableRates: () => ({
                one: 'Bewertung aktivieren',
                other: 'Tarife aktivieren',
            }),
            disableRates: () => ({
                one: 'Bewertung deaktivieren',
                other: 'Tarife deaktivieren',
            }),
            enableRate: 'Bewertung aktivieren',
            status: 'Status',
            unit: 'Einheit',
            taxFeatureNotEnabledMessage: 'Steuern müssen im Arbeitsbereich aktiviert sein, um diese Funktion zu nutzen. Gehen Sie zu',
            changePromptMessage: 'um diese Änderung vorzunehmen.',
            deleteDistanceRate: 'Entfernen der Entfernungsrate',
            areYouSureDelete: () => ({
                one: 'Sind Sie sicher, dass Sie diesen Tarif löschen möchten?',
                other: 'Sind Sie sicher, dass Sie diese Tarife löschen möchten?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Beschreibung',
            nameInputLabel: 'Name',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Anfangswert',
            nameInputHelpText: 'Dies ist der Name, den Sie in Ihrem Arbeitsbereich sehen werden.',
            nameIsRequiredError: 'Sie müssen Ihrem Arbeitsbereich einen Namen geben',
            currencyInputLabel: 'Standardwährung',
            currencyInputHelpText: 'Alle Ausgaben in diesem Arbeitsbereich werden in diese Währung umgerechnet.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `Die Standardwährung kann nicht geändert werden, da dieser Arbeitsbereich mit einem ${currency}-Bankkonto verknüpft ist.`,
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            addressContext: 'Eine Workspace-Adresse ist erforderlich, um Expensify Travel zu aktivieren. Bitte geben Sie eine Adresse ein, die mit Ihrem Unternehmen verbunden ist.',
        },
        bankAccount: {
            continueWithSetup: 'Setup fortsetzen',
            youAreAlmostDone:
                'Sie sind fast fertig mit der Einrichtung Ihres Bankkontos, mit dem Sie Firmenkarten ausgeben, Ausgaben erstatten, Rechnungen einziehen und Rechnungen bezahlen können.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Persönliche Bankkonten können für Zahlungen in Arbeitsbereichen nicht verwendet werden.',
            oneMoreThing: 'Noch eine Sache!',
            allSet: 'Du bist startklar!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszustellen, Ausgaben zu erstatten, Rechnungen einzuziehen und Rechnungen zu bezahlen.',
            letsFinishInChat: 'Lass uns im Chat fertig werden!',
            finishInChat: 'Im Chat beenden',
            almostDone: 'Fast fertig!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Von vorne anfangen',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, trennen Sie mein Bankkonto',
            yesStartOver: 'Ja, noch einmal anfangen',
            disconnectYour: 'Trennen Sie Ihre',
            bankAccountAnyTransactions: 'Bankkonto. Alle ausstehenden Transaktionen für dieses Konto werden weiterhin abgeschlossen.',
            clearProgress: 'Ein Neustart löscht den bisherigen Fortschritt.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Arbeitsbereichswährung',
            updateCurrencyPrompt:
                'Es sieht so aus, als wäre Ihr Arbeitsbereich derzeit auf eine andere Währung als USD eingestellt. Bitte klicken Sie auf die Schaltfläche unten, um Ihre Währung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'Aktualisieren auf USD',
            updateWorkspaceCurrency: 'Arbeitsbereichswährung aktualisieren',
            workspaceCurrencyNotSupported: 'Arbeitsbereichswährung wird nicht unterstützt',
            yourWorkspace: 'Ihr Arbeitsbereich ist auf eine nicht unterstützte Währung eingestellt. Anzeigen Sie die',
            listOfSupportedCurrencies: 'Liste der unterstützten Währungen',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Eigentümer übertragen',
            addPaymentCardTitle: 'Geben Sie Ihre Zahlungskarte ein, um das Eigentum zu übertragen',
            addPaymentCardButtonText: 'AGB akzeptieren & Zahlungskarte hinzufügen',
            addPaymentCardReadAndAcceptTextPart1: 'Lesen und akzeptieren',
            addPaymentCardReadAndAcceptTextPart2: 'Richtlinie zum Hinzufügen Ihrer Karte',
            addPaymentCardTerms: 'Bedingungen',
            addPaymentCardPrivacy: 'Datenschutz',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'PCI-DSS konform',
            addPaymentCardBankLevelEncrypt: 'Bankenverschlüsselung',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: 'Erfahren Sie mehr über unser',
            addPaymentCardSecurity: 'Sicherheit',
            amountOwedTitle: 'Ausstehender Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText:
                'Dieses Konto hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchten Sie den Saldo ausgleichen und die Abrechnung dieses Arbeitsbereichs übernehmen?',
            ownerOwesAmountTitle: 'Ausstehender Saldo',
            ownerOwesAmountButtonText: 'Saldo übertragen',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Das Konto, dem dieser Arbeitsbereich (${email}) gehört, hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchten Sie diesen Betrag (${amount}) übertragen, um die Abrechnung für diesen Arbeitsbereich zu übernehmen? Ihre Zahlungskarte wird sofort belastet.`,
            subscriptionTitle: 'Jahresabonnement übernehmen',
            subscriptionButtonText: 'Abonnement übertragen',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Die Übernahme dieses Arbeitsbereichs wird das Jahresabonnement mit Ihrem aktuellen Abonnement zusammenführen. Dadurch erhöht sich die Größe Ihres Abonnements um ${usersCount} Mitglieder, wodurch Ihre neue Abonnementgröße ${finalCount} beträgt. Möchten Sie fortfahren?`,
            duplicateSubscriptionTitle: 'Doppeltes Abonnement Warnung',
            duplicateSubscriptionButtonText: 'Fortsetzen',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Es sieht so aus, als ob Sie versuchen, die Abrechnung für die Arbeitsbereiche von ${email} zu übernehmen. Dafür müssen Sie jedoch zuerst Administrator für alle ihre Arbeitsbereiche sein.\n\nKlicken Sie auf „Weiter“, wenn Sie nur die Abrechnung für den Arbeitsbereich ${workspaceName} übernehmen möchten.\n\nWenn Sie die Abrechnung für das gesamte Abonnement übernehmen möchten, lassen Sie sich bitte zuerst von ihnen als Administrator zu allen ihren Arbeitsbereichen hinzufügen, bevor Sie die Abrechnung übernehmen.`,
            hasFailedSettlementsTitle: 'Eigentumsübertragung nicht möglich',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Sie können die Abrechnung nicht übernehmen, da ${email} eine überfällige Expensify Card-Abrechnung hat. Bitte bitten Sie diese Person, sich an concierge@expensify.com zu wenden, um das Problem zu lösen. Danach können Sie die Abrechnung für diesen Arbeitsbereich übernehmen.`,
            failedToClearBalanceTitle: 'Saldo konnte nicht gelöscht werden',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuchen Sie es später erneut.',
            successTitle: 'Juhu! Alles bereit.',
            successDescription: 'Sie sind jetzt der Eigentümer dieses Arbeitsbereichs.',
            errorTitle: 'Ups! Nicht so schnell...',
            errorDescriptionPartOne: 'Beim Übertragen der Eigentümerschaft dieses Arbeitsbereichs ist ein Problem aufgetreten. Versuchen Sie es erneut, oder',
            errorDescriptionPartTwo: 'wenden Sie sich an Concierge',
            errorDescriptionPartThree: 'für Hilfe.',
        },
        exportAgainModal: {
            title: 'Vorsicht!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `Die folgenden Berichte wurden bereits nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} exportiert:\n\n${reportName}\n\nSind Sie sicher, dass Sie sie erneut exportieren möchten?`,
            confirmText: 'Ja, erneut exportieren',
            cancelText: 'Abbrechen',
        },
        upgrade: {
            reportFields: {
                title: 'Berichtsfelder',
                description: `Berichtsfelder ermöglichen es Ihnen, Details auf Kopfzeilenebene anzugeben, die sich von Tags unterscheiden, die sich auf Ausgaben einzelner Positionen beziehen. Diese Details können spezifische Projektnamen, Geschäftsreiseinformationen, Standorte und mehr umfassen.`,
                onlyAvailableOnPlan: 'Berichtsfelder sind nur im Control-Plan verfügbar, beginnend ab',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Genießen Sie automatisches Synchronisieren und reduzieren Sie manuelle Eingaben mit der Expensify + NetSuite-Integration. Erhalten Sie tiefgehende, Echtzeit-Finanzinformationen mit nativer und benutzerdefinierter Segmentunterstützung, einschließlich Projekt- und Kundenabbildung.`,
                onlyAvailableOnPlan: 'Unsere NetSuite-Integration ist nur im Control-Plan verfügbar, beginnend bei',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Genießen Sie automatisches Synchronisieren und reduzieren Sie manuelle Eingaben mit der Expensify + Sage Intacct Integration. Erhalten Sie detaillierte, Echtzeit-Finanzinformationen mit benutzerdefinierten Dimensionen sowie Ausgabencodierung nach Abteilung, Klasse, Standort, Kunde und Projekt (Job).`,
                onlyAvailableOnPlan: 'Unsere Sage Intacct-Integration ist nur im Control-Plan verfügbar, beginnend bei',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Genießen Sie automatisches Synchronisieren und reduzieren Sie manuelle Eingaben mit der Integration von Expensify + QuickBooks Desktop. Erreichen Sie höchste Effizienz durch eine Echtzeit-Zwei-Wege-Verbindung und die Zuordnung von Ausgaben nach Klasse, Artikel, Kunde und Projekt.`,
                onlyAvailableOnPlan: 'Unsere QuickBooks Desktop-Integration ist nur im Control-Plan verfügbar, beginnend bei',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Erweiterte Genehmigungen',
                description: `Wenn Sie weitere Genehmigungsebenen hinzufügen möchten – oder einfach sicherstellen wollen, dass die größten Ausgaben noch einmal überprüft werden – sind wir für Sie da. Erweiterte Genehmigungen helfen Ihnen, auf jeder Ebene die richtigen Kontrollen einzurichten, damit Sie die Ausgaben Ihres Teams unter Kontrolle halten.`,
                onlyAvailableOnPlan: 'Erweiterte Genehmigungen sind nur im Control-Plan verfügbar, der bei  beginnt.',
            },
            categories: {
                title: 'Kategorien',
                description: `Kategorien helfen Ihnen, Ihre Ausgaben besser zu organisieren, um den Überblick darüber zu behalten, wofür Sie Ihr Geld ausgeben. Verwenden Sie unsere vorgeschlagene Kategorienliste oder erstellen Sie Ihre eigenen.`,
                onlyAvailableOnPlan: 'Kategorien sind im Collect-Plan verfügbar, beginnend ab',
            },
            glCodes: {
                title: 'GL-Codes',
                description: `Fügen Sie Ihren Kategorien und Tags GL-Codes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: 'GL-Codes sind nur im Control-Plan verfügbar, beginnend bei',
            },
            glAndPayrollCodes: {
                title: 'GL- und Gehaltsabrechnungscodes',
                description: `Fügen Sie Ihren Kategorien GL- und Gehaltsabrechnungscodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltsabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: 'GL- und Payroll-Codes sind nur im Control-Plan verfügbar, beginnend bei',
            },
            taxCodes: {
                title: 'Steuercodes',
                description: `Fügen Sie Ihren Steuern Steuercodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: 'Steuercodes sind nur im Control-Plan verfügbar, beginnend bei',
            },
            companyCards: {
                title: 'Unbegrenzte Firmenkarten',
                description: `Möchten Sie weitere Kartenfeeds hinzufügen? Schalten Sie unbegrenzt viele Firmenkarten frei, um Transaktionen von allen großen Kartenanbietern zu synchronisieren.`,
                onlyAvailableOnPlan: 'Dies ist nur im Control-Plan verfügbar, beginnend bei',
            },
            rules: {
                title: 'Regeln',
                description: `Regeln laufen im Hintergrund und halten Ihre Ausgaben unter Kontrolle, damit Sie sich nicht um Kleinigkeiten kümmern müssen.\n\nFordern Sie Ausgabendetails wie Belege und Beschreibungen an, legen Sie Limits und Standardwerte fest und automatisieren Sie Genehmigungen und Zahlungen – alles an einem Ort.`,
                onlyAvailableOnPlan: 'Regeln sind nur im Control-Plan verfügbar, beginnend ab',
            },
            perDiem: {
                title: 'Tagespauschale',
                description:
                    'Per Diem ist eine großartige Möglichkeit, Ihre täglichen Kosten konform und vorhersehbar zu halten, wann immer Ihre Mitarbeiter reisen. Nutzen Sie Funktionen wie benutzerdefinierte Sätze, Standardkategorien und detailliertere Angaben wie Reiseziele und Untertarife.',
                onlyAvailableOnPlan: 'Per Diem sind nur im Control-Plan verfügbar, beginnend bei',
            },
            travel: {
                title: 'Reisen',
                description:
                    'Expensify Travel ist eine neue Plattform für die Buchung und Verwaltung von Geschäftsreisen, die es Mitgliedern ermöglicht, Unterkünfte, Flüge, Transportmittel und mehr zu buchen.',
                onlyAvailableOnPlan: 'Reisen ist im Collect-Plan verfügbar, beginnend bei',
            },
            multiLevelTags: {
                title: 'Mehrstufige Tags',
                description:
                    'Mehrstufige Tags helfen Ihnen, Ausgaben präziser zu verfolgen. Weisen Sie jedem Posten mehrere Tags zu – wie Abteilung, Kunde oder Kostenstelle – um den vollständigen Kontext jeder Ausgabe zu erfassen. Dies ermöglicht detailliertere Berichte, Genehmigungsabläufe und Buchhaltungsexporte.',
                onlyAvailableOnPlan: 'Mehrstufige Tags sind nur im Control-Plan verfügbar, beginnend ab',
            },
            pricing: {
                perActiveMember: 'pro aktivem Mitglied pro Monat.',
                perMember: 'pro Mitglied pro Monat.',
            },
            note: {
                upgradeWorkspace: 'Aktualisieren Sie Ihren Arbeitsbereich, um auf diese Funktion zuzugreifen, oder',
                learnMore: 'mehr erfahren',
                aboutOurPlans: 'über unsere Pläne und Preise.',
            },
            upgradeToUnlock: 'Diese Funktion freischalten',
            completed: {
                headline: `Du hast deinen Arbeitsbereich aktualisiert!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Sie haben ${policyName} erfolgreich auf den Control-Plan aktualisiert!`,
                categorizeMessage: `Du hast erfolgreich auf einen Arbeitsbereich mit dem Collect-Plan umgestellt. Jetzt kannst du deine Ausgaben kategorisieren!`,
                travelMessage: `Sie haben erfolgreich auf einen Arbeitsbereich mit dem Collect-Plan aktualisiert. Jetzt können Sie mit der Buchung und Verwaltung von Reisen beginnen!`,
                viewSubscription: 'Abonnement anzeigen',
                moreDetails: 'für weitere Details.',
                gotIt: 'Verstanden, danke',
            },
            commonFeatures: {
                title: 'Upgrade auf den Control-Plan',
                note: 'Schalten Sie unsere leistungsstärksten Funktionen frei, einschließlich:',
                benefits: {
                    startsAt: 'Der Kontrollplan beginnt bei',
                    perMember: 'pro aktivem Mitglied pro Monat.',
                    learnMore: 'Mehr erfahren',
                    pricing: 'über unsere Pläne und Preise.',
                    benefit1: 'Erweiterte Buchhaltungsverbindungen (NetSuite, Sage Intacct und mehr)',
                    benefit2: 'Intelligente Spesenregeln',
                    benefit3: 'Mehrstufige Genehmigungs-Workflows',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    toUpgrade: 'Zum Upgrade klicken',
                    selectWorkspace: 'Wähle einen Arbeitsbereich aus und ändere den Tariftyp zu',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Downgrade zum Collect-Plan',
                note: 'Wenn Sie ein Downgrade durchführen, verlieren Sie den Zugriff auf diese Funktionen und mehr:',
                benefits: {
                    note: 'Für einen vollständigen Vergleich unserer Pläne, sehen Sie sich unsere an',
                    pricingPage: 'Preisseite',
                    confirm: 'Sind Sie sicher, dass Sie ein Downgrade durchführen und Ihre Konfigurationen entfernen möchten?',
                    warning: 'Dies kann nicht rückgängig gemacht werden.',
                    benefit1: 'Buchhaltungsverbindungen (außer QuickBooks Online und Xero)',
                    benefit2: 'Intelligente Spesenregeln',
                    benefit3: 'Mehrstufige Genehmigungs-Workflows',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote: 'Sie müssen alle Ihre Arbeitsbereiche vor Ihrer ersten monatlichen Zahlung herabstufen, um ein Abonnement zum Collect-Tarif zu beginnen. Klicken Sie',
                    selectStep: '> Wählen Sie jeden Arbeitsbereich aus > ändern Sie den Plantyp zu',
                },
            },
            completed: {
                headline: 'Ihr Arbeitsbereich wurde herabgestuft',
                description: 'Sie haben weitere Arbeitsbereiche im Control-Plan. Um zum Collect-Tarif abgerechnet zu werden, müssen Sie alle Arbeitsbereiche herabstufen.',
                gotIt: 'Verstanden, danke',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & herabstufen',
            headline: 'Ihre endgültige Zahlung',
            description1: 'Ihre Abschlussrechnung für dieses Abonnement wird sein',
            description2: ({date}: DateParams) => `Siehe unten Ihre Aufschlüsselung für ${date}:`,
            subscription:
                'Achtung! Diese Aktion beendet Ihr Expensify-Abonnement, löscht diesen Arbeitsbereich und entfernt alle Mitglieder des Arbeitsbereichs. Wenn Sie diesen Arbeitsbereich behalten und nur sich selbst entfernen möchten, lassen Sie zuerst einen anderen Administrator die Abrechnung übernehmen.',
            genericFailureMessage: 'Beim Bezahlen Ihrer Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        restrictedAction: {
            restricted: 'Eingeschränkt',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Aktionen im Arbeitsbereich ${workspaceName} sind derzeit eingeschränkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Der Workspace-Inhaber, ${workspaceOwnerName}, muss die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Workspace-Aktivitäten freizuschalten.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Sie müssen die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Aktivitäten im Arbeitsbereich freizuschalten.',
            addPaymentCardToUnlock: 'Fügen Sie eine Zahlungskarte hinzu, um freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'Fügen Sie eine Zahlungskarte hinzu, um diesen Arbeitsbereich weiterhin zu nutzen',
            pleaseReachOutToYourWorkspaceAdmin: 'Bitte wenden Sie sich bei Fragen an Ihren Workspace-Administrator.',
            chatWithYourAdmin: 'Chatten Sie mit Ihrem Administrator',
            chatInAdmins: 'Chat in #admins',
            addPaymentCard: 'Zahlungskarte hinzufügen',
        },
        rules: {
            individualExpenseRules: {
                title: 'Ausgaben',
                subtitle: 'Legen Sie Ausgabenkontrollen und Standardwerte für einzelne Ausgaben fest. Sie können auch Regeln für erstellen',
                receiptRequiredAmount: 'Erforderlicher Belegbetrag',
                receiptRequiredAmountDescription: 'Belege erforderlich, wenn die Ausgaben diesen Betrag überschreiten, es sei denn, eine Kategorierregel hebt dies auf.',
                maxExpenseAmount: 'Maximaler Ausgabenbetrag',
                maxExpenseAmountDescription: 'Markiere Ausgaben, die diesen Betrag überschreiten, es sei denn, sie werden durch eine Kategorierregel überschrieben.',
                maxAge: 'Maximales Alter',
                maxExpenseAge: 'Maximales Ausgabenalter',
                maxExpenseAgeDescription: 'Kennzeichnen Sie Ausgaben, die älter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: () => ({
                    one: '1 Tag',
                    other: (count: number) => `${count} Tage`,
                }),
                billableDefault: 'Standard abrechenbar',
                billableDefaultDescription:
                    'Wählen Sie aus, ob Bar- und Kreditkartenausgaben standardmäßig abrechenbar sein sollen. Abrechenbare Ausgaben sind aktiviert oder deaktiviert in',
                billable: 'Abrechenbar',
                billableDescription: 'Ausgaben werden am häufigsten den Kunden erneut in Rechnung gestellt',
                nonBillable: 'Nicht abrechenbar',
                nonBillableDescription: 'Ausgaben werden gelegentlich den Kunden erneut in Rechnung gestellt',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'eReceipts werden automatisch erstellt',
                eReceiptsHintLink: 'für die meisten USD-Kredittransaktionen',
                attendeeTracking: 'Teilnehmerverfolgung',
                attendeeTrackingHint: 'Verfolgen Sie die Kosten pro Person für jede Ausgabe.',
                prohibitedDefaultDescription:
                    'Markieren Sie alle Belege, auf denen Alkohol, Glücksspiel oder andere eingeschränkte Artikel erscheinen. Ausgaben mit Belegen, auf denen diese Positionen erscheinen, erfordern eine manuelle Überprüfung.',
                prohibitedExpenses: 'Verbotene Ausgaben',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Hotelnebenkosten',
                gambling: 'Glücksspiel',
                tobacco: 'Tabak',
                adultEntertainment: 'Erwachsenenunterhaltung',
            },
            expenseReportRules: {
                examples: 'Beispiele:',
                title: 'Spesenabrechnungen',
                subtitle: 'Automatisieren Sie die Einhaltung von Spesenberichten, Genehmigungen und Zahlungen.',
                customReportNamesSubtitle: 'Passen Sie Berichtstitel mit unserem',
                customNameTitle: 'Standardberichtstitel',
                customNameDescription: 'Wählen Sie einen benutzerdefinierten Namen für Spesenberichte mit unserem',
                customNameDescriptionLink: 'umfangreiche Formeln',
                customNameInputLabel: 'Name',
                customNameEmailPhoneExample: 'E-Mail oder Telefon des Mitglieds: {report:submit:from}',
                customNameStartDateExample: 'Berichtsstartdatum: {report:startdate}',
                customNameWorkspaceNameExample: 'Arbeitsbereichsname: {report:workspacename}',
                customNameReportIDExample: 'Berichts-ID: {report:id}',
                customNameTotalExample: 'Gesamt: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Verhindern, dass Mitglieder benutzerdefinierte Berichtsbezeichnungen ändern',
                preventSelfApprovalsTitle: 'Selbstgenehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindern, dass Arbeitsbereichsmitglieder ihre eigenen Spesenabrechnungen genehmigen.',
                autoApproveCompliantReportsTitle: 'Konforme Berichte automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen für die automatische Genehmigung berechtigt sind.',
                autoApproveReportsUnderTitle: 'Berichte automatisch genehmigen unter',
                autoApproveReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch genehmigt.',
                randomReportAuditTitle: 'Zufällige Berichtsprüfung',
                randomReportAuditDescription: 'Erfordern, dass einige Berichte manuell genehmigt werden, auch wenn sie für die automatische Genehmigung berechtigt sind.',
                autoPayApprovedReportsTitle: 'Automatische Zahlung genehmigter Berichte',
                autoPayApprovedReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen für die automatische Zahlung berechtigt sind.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Bitte geben Sie einen Betrag unter ${currency ?? ''}20.000 ein`,
                autoPayApprovedReportsLockedSubtitle: 'Gehen Sie zu „Weitere Funktionen“ und aktivieren Sie Workflows, dann fügen Sie Zahlungen hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Automatische Zahlungen für Berichte unter',
                autoPayReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch bezahlt.',
                unlockFeatureGoToSubtitle: 'Gehe zu',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) => `und Workflows aktivieren, dann ${featureName} hinzufügen, um diese Funktion freizuschalten.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `und aktiviere ${featureName}, um diese Funktion freizuschalten.`,
            },
            categoryRules: {
                title: 'Kategorienregeln',
                approver: 'Genehmiger',
                requireDescription: 'Beschreibung erforderlich',
                descriptionHint: 'Beschreibungshinweis',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Erinnern Sie die Mitarbeiter daran, zusätzliche Informationen für Ausgaben der Kategorie „${categoryName}“ anzugeben. Dieser Hinweis erscheint im Beschreibungsfeld bei Ausgaben.`,
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je kürzer, desto besser!',
                maxAmount: 'Maximalbetrag',
                flagAmountsOver: 'Beträge über markieren',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Gilt für die Kategorie „${categoryName}“.`,
                flagAmountsOverSubtitle: 'Dies überschreibt den Höchstbetrag für alle Ausgaben.',
                expenseLimitTypes: {
                    expense: 'Einzelne Ausgabe',
                    expenseSubtitle: 'Kennzeichnen Sie Ausgabenbeträge nach Kategorie. Diese Regel überschreibt die allgemeine Arbeitsbereichsregel für den maximalen Ausgabenbetrag.',
                    daily: 'Gesamtsumme der Kategorie',
                    dailySubtitle: 'Gesamtausgaben pro Kategorie und Spesenbericht kennzeichnen.',
                },
                requireReceiptsOver: 'Quittungen erforderlich über',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Nie Quittungen verlangen',
                    always: 'Quittungen immer erforderlich machen',
                },
                defaultTaxRate: 'Standardsteuersatz',
                goTo: 'Gehe zu',
                andEnableWorkflows: 'und Workflows aktivieren, dann Genehmigungen hinzufügen, um diese Funktion freizuschalten.',
            },
            customRules: {
                title: 'Benutzerdefinierte Regeln',
                subtitle: 'Beschreibung',
                description: 'Benutzerdefinierte Regeln für Spesenabrechnungen eingeben',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Sammeln',
                    description: 'Für Teams, die ihre Prozesse automatisieren möchten.',
                },
                corporate: {
                    label: 'Steuerung',
                    description: 'Für Organisationen mit erweiterten Anforderungen.',
                },
            },
            description: 'Wählen Sie einen Plan, der zu Ihnen passt. Für eine detaillierte Liste der Funktionen und Preise besuchen Sie unsere',
            subscriptionLink: 'Seite zur Hilfe bei Tarifarten und Preisen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Sie haben sich verpflichtet, bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} 1 aktives Mitglied im Control-Plan zu haben. Ab dem ${annualSubscriptionEndDate} können Sie auf ein Pay-per-Use-Abonnement wechseln und auf den Collect-Plan herabstufen, indem Sie die automatische Verlängerung deaktivieren in`,
                other: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu ${count} aktiven Mitgliedern im Control-Plan verpflichtet. Ab dem ${annualSubscriptionEndDate} können Sie auf ein Pay-per-Use-Abonnement wechseln und auf den Collect-Plan herabstufen, indem Sie die automatische Verlängerung deaktivieren in`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um deinen Weg zur Großartigkeit zu ebnen!',
        description: 'Wählen Sie eine der folgenden Support-Optionen:',
        chatWithConcierge: 'Chat mit Concierge',
        scheduleSetupCall: 'Einen Einrichtungstermin vereinbaren',
        scheduleACall: 'Anruf planen',
        questionMarkButtonTooltip: 'Holen Sie sich Unterstützung von unserem Team',
        exploreHelpDocs: 'Hilfe-Dokumente durchsuchen',
        registerForWebinar: 'Für das Webinar registrieren',
        onboardingHelp: 'Hilfe bei der Einführung',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Standard-Hautfarbe ändern',
        headers: {
            frequentlyUsed: 'Häufig verwendet',
            smileysAndEmotion: 'Smileys & Emotion',
            peopleAndBody: 'Personen & Körper',
            animalsAndNature: 'Tiere & Natur',
            foodAndDrink: 'Essen & Getränke',
            travelAndPlaces: 'Reisen & Orte',
            activities: 'Aktivitäten',
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
        restrictedDescription: 'Personen in Ihrem Arbeitsbereich können diesen Raum finden',
        privateDescription: 'Personen, die zu diesem Raum eingeladen sind, können ihn finden',
        publicDescription: 'Jeder kann diesen Raum finden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Jeder kann diesen Raum finden',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} ist ein Standardraum in allen Arbeitsbereichen. Bitte wählen Sie einen anderen Namen.`,
        roomNameInvalidError: 'Raumnamen dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
        pleaseEnterRoomName: 'Bitte geben Sie einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte wählen Sie einen Arbeitsbereich aus',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor} hat in "${newName}" umbenannt (zuvor "${oldName}")` : `${actor} hat diesen Raum umbenannt in "${newName}" (zuvor "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Raum umbenannt in ${newName}`,
        social: 'sozial',
        selectAWorkspace: 'Arbeitsbereich auswählen',
        growlMessageOnRenameError: 'Arbeitsbereichsraum kann nicht umbenannt werden. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
        visibilityOptions: {
            restricted: 'Arbeitsbereich', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privat',
            public: 'Öffentlich',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Öffentliche Bekanntmachung',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Einreichen und Schließen',
        submitAndApprove: 'Einreichen und Genehmigen',
        advanced: 'FORTGESCHRITTEN',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `${approverName} (${approverEmail}) wurde als Genehmiger für das ${field} „${name}“ hinzugefügt`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `${approverName} (${approverEmail}) wurde als Genehmiger für das ${field} „${name}“ entfernt`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `hat den Genehmiger für das ${field} "${name}" auf ${formatApprover(newApproverName, newApproverEmail)} geändert (zuvor ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `die Kategorie "${categoryName}" hinzugefügt`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `die Kategorie "${categoryName}" wurde entfernt`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'deaktiviert' : 'aktiviert'} die Kategorie "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `den Gehaltsabrechnungscode „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Gehaltsabrechnungscode "${oldValue}" aus der Kategorie "${categoryName}" entfernt`;
            }
            return `hat den Gehaltsabrechnungscode der Kategorie „${categoryName}“ auf „${newValue}“ geändert (vorher „${oldValue}“)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `den GL-Code "${newValue}" zur Kategorie "${categoryName}" hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `den GL-Code "${oldValue}" aus der Kategorie "${categoryName}" entfernt`;
            }
            return `hat den GL-Code der Kategorie „${categoryName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `hat die Beschreibung der Kategorie "${categoryName}" zu ${!oldValue ? 'erforderlich' : 'nicht erforderlich'} geändert (zuvor ${!oldValue ? 'nicht erforderlich' : 'erforderlich'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `eine maximale Summe von ${newAmount} zur Kategorie "${categoryName}" hinzugefügt`;
            }
            if (oldAmount && !newAmount) {
                return `hat den maximalen Betrag von ${oldAmount} aus der Kategorie "${categoryName}" entfernt`;
            }
            return `hat den maximalen Betrag der Kategorie "${categoryName}" auf ${newAmount} geändert (vorher ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `einen Grenzwerttyp von ${newValue} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            return `hat den Grenzwerttyp der Kategorie "${categoryName}" auf ${newValue} geändert (vorher ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie "${categoryName}" aktualisiert, indem Belege zu ${newValue} geändert wurden`;
            }
            return `hat die Kategorie "${categoryName}" auf ${newValue} geändert (vorher ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat die Kategorie "${oldName}" in "${newName}" umbenannt`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `Die Beschreibungshilfe "${oldValue}" aus der Kategorie "${categoryName}" entfernt.`;
            }
            return !oldValue
                ? `die Beschreibungshilfe "${newValue}" zur Kategorie "${categoryName}" hinzugefügt`
                : `hat den Hinweis zur Kategoriebeschreibung "${categoryName}" in „${newValue}“ (vorher „${oldValue}“) geändert`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat den Tag-Listen-Namen in "${newName}" geändert (vorher "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `das Tag "${tagName}" zur Liste "${tagListName}" hinzugefügt`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `hat die Tag-Liste "${tagListName}" aktualisiert, indem der Tag "${oldName}" in "${newName}" geändert wurde`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'aktiviert' : 'deaktiviert'} das Tag "${tagName}" in der Liste "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `das Tag "${tagName}" aus der Liste "${tagListName}" entfernt`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `"${count}" Tags aus der Liste "${tagListName}" entfernt`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `hat das Tag "${tagName}" in der Liste "${tagListName}" aktualisiert, indem das ${updatedField} auf "${newValue}" geändert wurde (vorher "${oldValue}")`;
            }
            return `hat den Tag "${tagName}" in der Liste "${tagListName}" aktualisiert, indem ein ${updatedField} mit dem Wert "${newValue}" hinzugefügt wurde`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `hat das ${customUnitName} ${updatedField} zu "${newValue}" geändert (vorher "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung bei Entfernungsraten`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `eine neue "${customUnitName}"-Rate "${rateName}" hinzugefügt`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `hat den Satz des ${customUnitName} ${updatedField} "${customUnitRateName}" auf "${newValue}" geändert (vorher "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `hat den Steuersatz für den Entfernungszuschlag "${customUnitRateName}" auf "${newValue} (${newTaxPercentage})" geändert (vorher "${oldValue} (${oldTaxPercentage})")`;
            }
            return `den Steuersatz "${newValue} (${newTaxPercentage})" zum Entfernungszuschlag "${customUnitRateName}" hinzugefügt`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `hat den erstattungsfähigen Steueranteil beim Entfernungssatz "${customUnitRateName}" auf "${newValue}" geändert (zuvor "${oldValue}")`;
            }
            return `einen erstattungsfähigen Steueranteil von "${newValue}" zum Entfernungszuschlag "${customUnitRateName}" hinzugefügt`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `hat den "${customUnitName}"-Satz "${rateName}" entfernt`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType} Berichts-Feld "${fieldName}" hinzugefügt`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `setze den Standardwert des Berichts-Feldes "${fieldName}" auf "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `die Option "${optionName}" zum Berichts-Feld "${fieldName}" hinzugefügt`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `die Option "${optionName}" aus dem Berichtsbereich "${fieldName}" entfernt`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'aktiviert' : 'deaktiviert'} die Option "${optionName}" für das Berichts-Feld "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'aktiviert' : 'deaktiviert'} alle Optionen für das Berichts-Feld "${fieldName}"`;
            }
            return `${allEnabled ? 'aktiviert' : 'deaktiviert'} die Option "${optionName}" für das Berichts-Feld "${fieldName}", wodurch alle Optionen ${allEnabled ? 'aktiviert' : 'deaktiviert'} werden`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType} Berichts-Feld "${fieldName}" entfernt`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `aktualisiert "Prevent self-approval" zu "${newValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}" (vorher "${oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `den maximal erforderlichen Belegbetrag für Ausgaben auf ${newValue} geändert (vorher ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat den maximalen Ausgabenbetrag für Verstöße auf ${newValue} geändert (vorher ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `"Maximales Ausgabenalter (Tage)" auf "${newValue}" aktualisiert (vorher "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `Lege das Datum für die monatliche Berichtseinreichung auf "${newValue}" fest`;
            }
            return `das Datum für die monatliche Berichterstattung auf "${newValue}" aktualisiert (vorher "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `aktualisiert "Re-bill expenses to clients" zu "${newValue}" (vorher "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `"Standardberichtstitel erzwingen" ${value ? 'an' : 'aus'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `den Namen dieses Arbeitsbereichs in "${newName}" geändert (zuvor "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `Setze die Beschreibung dieses Arbeitsbereichs auf "${newDescription}"`
                : `hat die Beschreibung dieses Arbeitsbereichs zu "${newDescription}" aktualisiert (vorher "${oldDescription}")`,
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
                one: `hat dich aus dem Genehmigungsworkflow und dem Ausgabenchat von ${joinedNames} entfernt. Bereits eingereichte Berichte bleiben zur Genehmigung in deinem Posteingang verfügbar.`,
                other: `hat dich aus den Genehmigungs-Workflows und Ausgaben-Chats von ${joinedNames} entfernt. Bereits eingereichte Berichte bleiben zur Genehmigung in deinem Posteingang verfügbar.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `Ihre Rolle in ${policyName} wurde von ${oldRole} auf Benutzer aktualisiert. Sie wurden aus allen Ausgaben-Chats für Einreicher entfernt, außer aus Ihrem eigenen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `Standardwährung auf ${newCurrency} aktualisiert (vorher ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `die automatische Berichterstattungsfrequenz auf "${newFrequency}" aktualisiert (zuvor "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `den Genehmigungsmodus auf "${newValue}" aktualisiert (zuvor "${oldValue}")`,
        upgradedWorkspace: 'hat diesen Arbeitsbereich auf den Control-Plan aktualisiert',
        downgradedWorkspace: 'hat diesen Arbeitsbereich auf den Collect-Plan herabgestuft',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `Die Rate der Berichte, die zufällig zur manuellen Genehmigung weitergeleitet werden, wurde auf ${Math.round(newAuditRate * 100)}% geändert (vorher ${Math.round(oldAuditRate * 100)}%).`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `hat das manuelle Genehmigungslimit für alle Ausgaben auf ${newLimit} geändert (zuvor ${oldLimit})`,
    },
    roomMembersPage: {
        memberNotFound: 'Mitglied nicht gefunden.',
        useInviteButton: 'Um ein neues Mitglied zum Chat einzuladen, verwenden Sie bitte die Einladungs-Schaltfläche oben.',
        notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Raum beizutreten, bitte einfach ein Mitglied des Raums, dich hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Sind Sie sicher, dass Sie ${memberName} aus dem Raum entfernen möchten?`,
            other: 'Sind Sie sicher, dass Sie die ausgewählten Mitglieder aus dem Raum entfernen möchten?',
        }),
        error: {
            genericAdd: 'Beim Hinzufügen dieses Raummitglieds ist ein Problem aufgetreten',
        },
    },
    newTaskPage: {
        assignTask: 'Aufgabe zuweisen',
        assignMe: 'Weise es mir zu',
        confirmTask: 'Aufgabe bestätigen',
        confirmError: 'Bitte geben Sie einen Titel ein und wählen Sie ein Freigabeziel aus',
        descriptionOptional: 'Beschreibung (optional)',
        pleaseEnterTaskName: 'Bitte geben Sie einen Titel ein',
        pleaseEnterTaskDestination: 'Bitte wählen Sie aus, wo Sie diese Aufgabe teilen möchten',
    },
    task: {
        task: 'Aufgabe',
        title: 'Titel',
        description: 'Beschreibung',
        assignee: 'Zuständiger',
        completed: 'Abgeschlossen',
        action: 'Abgeschlossen',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `Aufgabe für ${title}`,
            completed: 'als erledigt markiert',
            canceled: 'gelöschte Aufgabe',
            reopened: 'als unvollständig markiert',
            error: 'Sie haben keine Berechtigung, die angeforderte Aktion auszuführen.',
        },
        markAsComplete: 'Als erledigt markieren',
        markAsIncomplete: 'Als unvollständig markieren',
        assigneeError: 'Bei der Zuweisung dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einem anderen Zuständigen.',
        genericCreateTaskFailureMessage: 'Bei der Erstellung dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
        deleteTask: 'Aufgabe löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} Abrechnung`,
    },
    keyboardShortcutsPage: {
        title: 'Tastenkombinationen',
        subtitle: 'Sparen Sie Zeit mit diesen praktischen Tastenkombinationen:',
        shortcuts: {
            openShortcutDialog: 'Öffnet den Dialog für Tastenkombinationen',
            markAllMessagesAsRead: 'Alle Nachrichten als gelesen markieren',
            escape: 'Dialoge verlassen',
            search: 'Suchdialog öffnen',
            newChat: 'Neuer Chat-Bildschirm',
            copy: 'Kommentar kopieren',
            openDebug: 'Dialogfeld für Testpräferenzen öffnen',
        },
    },
    guides: {
        screenShare: 'Bildschirmfreigabe',
        screenShareRequest: 'Expensify lädt Sie zu einer Bildschirmfreigabe ein',
    },
    search: {
        resultsAreLimited: 'Die Suchergebnisse sind begrenzt.',
        viewResults: 'Ergebnisse anzeigen',
        resetFilters: 'Filter zurücksetzen',
        searchResults: {
            emptyResults: {
                title: 'Nichts zu zeigen',
                subtitle: 'Versuchen Sie, Ihre Suchkriterien anzupassen oder etwas mit der grünen + Taste zu erstellen.',
            },
            emptyExpenseResults: {
                title: 'Du hast noch keine Ausgaben erstellt',
                subtitle: 'Erstellen Sie eine Ausgabe oder machen Sie eine Testfahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die grüne Schaltfläche unten, um eine Ausgabe zu erstellen.',
            },
            emptyReportResults: {
                title: 'Sie haben noch keine Berichte erstellt',
                subtitle: 'Erstellen Sie einen Bericht oder machen Sie eine Testfahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die grüne Schaltfläche unten, um einen Bericht zu erstellen.',
            },
            emptyInvoiceResults: {
                title: 'Du hast noch keine \nRechnungen erstellt',
                subtitle: 'Senden Sie eine Rechnung oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die grüne Schaltfläche unten, um eine Rechnung zu senden.',
            },
            emptyTripResults: {
                title: 'Keine Reisen zum Anzeigen',
                subtitle: 'Beginnen Sie, indem Sie unten Ihre erste Reise buchen.',
                buttonText: 'Reise buchen',
            },
            emptySubmitResults: {
                title: 'Keine Ausgaben zum Einreichen',
                subtitle: 'Du bist startklar. Mach eine Ehrenrunde!',
                buttonText: 'Bericht erstellen',
            },
            emptyApproveResults: {
                title: 'Keine Ausgaben zur Genehmigung',
                subtitle: 'Keine Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
            emptyPayResults: {
                title: 'Keine Ausgaben zu bezahlen',
                subtitle: 'Glückwunsch! Du hast die Ziellinie überquert.',
            },
            emptyExportResults: {
                title: 'Keine Ausgaben zum Exportieren',
                subtitle: 'Zeit, es ruhig angehen zu lassen, gute Arbeit.',
            },
        },
        saveSearch: 'Suche speichern',
        deleteSavedSearch: 'Gespeicherte Suche löschen',
        deleteSavedSearchConfirm: 'Sind Sie sicher, dass Sie diese Suche löschen möchten?',
        searchName: 'Name suchen',
        savedSearchesMenuItemTitle: 'Gespeichert',
        groupedExpenses: 'gruppierte Ausgaben',
        bulkActions: {
            approve: 'Genehmigen',
            pay: 'Bezahlen',
            delete: 'Löschen',
            hold: 'Warten',
            unhold: 'Hold aufheben',
            noOptionsAvailable: 'Für die ausgewählte Ausgabengruppe sind keine Optionen verfügbar.',
        },
        filtersHeader: 'Filter',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Vor ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Nach ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `Am ${date ?? ''}`,
            },
            status: 'Status',
            keyword: 'Schlüsselwort',
            hasKeywords: 'Hat Schlüsselwörter',
            currency: 'Währung',
            link: 'Link',
            pinned: 'Angeheftet',
            unread: 'Ungelesen',
            completed: 'Abgeschlossen',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Weniger als ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Größer als ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Zwischen ${greaterThan} und ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Einzelkarten',
                closedCards: 'Geschlossene Karten',
                cardFeeds: 'Karten-Feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Alle ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Alle CSV importierten Karten${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Aktuell',
            past: 'Vergangenheit',
            submitted: 'Eingereichtes Datum',
            approved: 'Genehmigtes Datum',
            paid: 'Bezahltes Datum',
            exported: 'Exportiertes Datum',
            posted: 'Veröffentlichungsdatum',
            billable: 'Abrechenbar',
            reimbursable: 'Erstattungsfähig',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Dieser Bericht enthält keine Ausgaben.',
            emptyStateSubtitle: 'Sie können diesem Bericht Ausgaben hinzufügen, indem Sie die Schaltfläche oben verwenden.',
        },
        noCategory: 'Keine Kategorie',
        noTag: 'Kein Tag',
        expenseType: 'Ausgabentyp',
        recentSearches: 'Letzte Suchanfragen',
        recentChats: 'Neueste Chats',
        searchIn: 'Suchen in',
        searchPlaceholder: 'Suche nach etwas',
        suggestions: 'Vorschläge',
        exportSearchResults: {
            title: 'Export erstellen',
            description: 'Wow, das sind viele Artikel! Wir werden sie bündeln, und Concierge wird Ihnen in Kürze eine Datei zusenden.',
        },
        exportAll: {
            selectAllMatchingItems: 'Alle passenden Elemente auswählen',
            allMatchingItemsSelected: 'Alle passenden Elemente ausgewählt',
        },
    },
    genericErrorPage: {
        title: 'Hoppla, etwas ist schiefgelaufen!',
        body: {
            helpTextMobile: 'Bitte schließen Sie die App und öffnen Sie sie erneut, oder wechseln Sie zu',
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
                'Überprüfen Sie Ihren Fotos- oder Download-Ordner auf eine Kopie Ihres QR-Codes. Pro-Tipp: Fügen Sie ihn einer Präsentation hinzu, damit Ihr Publikum ihn scannen und direkt mit Ihnen verbinden kann.',
        },
        generalError: {
            title: 'Anhangfehler',
            message: 'Anhang kann nicht heruntergeladen werden',
        },
        permissionError: {
            title: 'Speicherzugriff',
            message: 'Expensify kann Anhänge ohne Speicherzugriff nicht speichern. Tippen Sie auf Einstellungen, um die Berechtigungen zu aktualisieren.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Neues Expensify',
        about: 'Über New Expensify',
        update: 'Aktualisiere New Expensify',
        checkForUpdates: 'Auf Updates prüfen',
        toggleDevTools: 'Entwicklertools umschalten',
        viewShortcuts: 'Tastenkombinationen anzeigen',
        services: 'Dienstleistungen',
        hide: 'Neue Expensify ausblenden',
        hideOthers: 'Andere ausblenden',
        showAll: 'Alle anzeigen',
        quit: 'Neue Expensify beenden',
        fileMenu: 'Datei',
        closeWindow: 'Fenster schließen',
        editMenu: 'Bearbeiten',
        undo: 'Rückgängig machen',
        redo: 'Erneut versuchen',
        cut: 'Ausschneiden',
        copy: 'Kopieren',
        paste: 'Einfügen',
        pasteAndMatchStyle: 'Einfügen und Stil anpassen',
        pasteAsPlainText: 'Als Nur-Text einfügen',
        delete: 'Löschen',
        selectAll: 'Alles auswählen',
        speechSubmenu: 'Sprache',
        startSpeaking: 'Sprechen Sie los',
        stopSpeaking: 'Aufhören zu sprechen',
        viewMenu: 'Ansehen',
        reload: 'Neu laden',
        forceReload: 'Erzwinge das Neuladen',
        resetZoom: 'Tatsächliche Größe',
        zoomIn: 'Hereinzoomen',
        zoomOut: 'Herauszoomen',
        togglefullscreen: 'Vollbild umschalten',
        historyMenu: 'Verlauf',
        back: 'Zurück',
        forward: 'Weiterleiten',
        windowMenu: 'Fenster',
        minimize: 'Minimieren',
        zoom: 'Zoom',
        front: 'Alle nach vorne bringen',
        helpMenu: 'Hilfe',
        learnMore: 'Mehr erfahren',
        documentation: 'Dokumentation',
        communityDiscussions: 'Community-Diskussionen',
        searchIssues: 'Probleme suchen',
    },
    historyMenu: {
        forward: 'Weiterleiten',
        back: 'Zurück',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Aktualisierung verfügbar',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `Die neue Version wird in Kürze verfügbar sein.${!isSilentUpdating ? 'Wir benachrichtigen Sie, wenn wir bereit sind, das Update durchzuführen.' : ''}`,
            soundsGood: 'Klingt gut',
        },
        notAvailable: {
            title: 'Update nicht verfügbar',
            message: 'Zurzeit ist kein Update verfügbar. Bitte versuchen Sie es später erneut!',
            okay: 'Okay',
        },
        error: {
            title: 'Aktualisierungsprüfung fehlgeschlagen',
            message: 'Wir konnten nicht nach einem Update suchen. Bitte versuchen Sie es in Kürze erneut.',
        },
    },
    report: {
        newReport: {
            createReport: 'Bericht erstellen',
            chooseWorkspace: 'Wählen Sie einen Arbeitsbereich für diesen Bericht aus.',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler bei der Erstellung dieses Chats. Bitte versuchen Sie es später erneut.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Veröffentlichen des Kommentars. Bitte versuchen Sie es später erneut.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuchen Sie es später erneut.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuchen Sie es später erneut.',
        noActivityYet: 'Noch keine Aktivität',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `hat ${fieldName} von ${oldValue} auf ${newValue} geändert`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `${fieldName} geändert in ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `Arbeitsbereich zu ${toPolicyName}${fromPolicyName ? `(zuvor ${fromPolicyName})` : ''} geändert`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `Typ von ${oldType} zu ${newType} geändert`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `diesen Bericht an ${delegateUser} gesendet, da ${originalManager} im Urlaub ist`,
                exportedToCSV: `exportiert als CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `exportiert nach ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `exportiert nach ${label} über`,
                    automaticActionTwo: 'Buchhaltungseinstellungen',
                    manual: ({label}: ExportedToIntegrationParams) => `hat diesen Bericht als manuell exportiert nach ${label} markiert.`,
                    automaticActionThree: 'und erfolgreich einen Datensatz erstellt für',
                    reimburseableLink: 'Auslagen',
                    nonReimbursableLink: 'Firmenkartenausgaben',
                    pending: ({label}: ExportedToIntegrationParams) => `Exportiere diesen Bericht nach ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `Fehler beim Exportieren dieses Berichts nach ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `Beleg hinzugefügt`,
                managerDetachReceipt: `Beleg entfernt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `anderswo ${currency}${amount} bezahlt`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `bezahlt ${currency}${amount} über Integration`,
                outdatedBankAccount: `Die Zahlung konnte aufgrund eines Problems mit dem Bankkonto des Zahlers nicht verarbeitet werden.`,
                reimbursementACHBounce: `Die Zahlung konnte nicht verarbeitet werden, da der Zahler nicht über ausreichende Mittel verfügt.`,
                reimbursementACHCancelled: `Zahlung storniert`,
                reimbursementAccountChanged: `Die Zahlung konnte nicht verarbeitet werden, da der Zahler das Bankkonto gewechselt hat.`,
                reimbursementDelayed: `Die Zahlung wurde bearbeitet, verzögert sich jedoch um 1-2 weitere Werktage.`,
                selectedForRandomAudit: `zufällig für die Überprüfung ausgewählt`,
                selectedForRandomAuditMarkdown: `[zufällig ausgewählt](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) zur Überprüfung`,
                share: ({to}: ShareParams) => `eingeladenes Mitglied ${to}`,
                unshare: ({to}: UnshareParams) => `Mitglied ${to} entfernt`,
                stripePaid: ({amount, currency}: StripePaidParams) => `bezahlt ${currency}${amount}`,
                takeControl: `übernommen`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `Synchronisierung mit ${label}${errorMessage ? ` ("${errorMessage}")` : ''} fehlgeschlagen`,
                addEmployee: ({email, role}: AddEmployeeParams) => `${email} als ${role === 'member' ? 'a' : 'an'} ${role} hinzugefügt`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `die Rolle von ${email} wurde auf ${newRole} geändert (zuvor ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 1 von ${email} entfernt (vorher "${previousValue}")`;
                    }
                    return !previousValue
                        ? `"${newValue}" zum benutzerdefinierten Feld 1 von ${email} hinzugefügt`
                        : `hat das benutzerdefinierte Feld 1 von ${email} zu "${newValue}" geändert (vorher "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 2 von ${email} entfernt (vorher "${previousValue}")`;
                    }
                    return !previousValue
                        ? `"${newValue}" zu benutzerdefiniertem Feld 2 von ${email} hinzugefügt`
                        : `hat das benutzerdefinierte Feld 2 von ${email} zu "${newValue}" geändert (vorher "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} hat den Arbeitsbereich verlassen`,
                removeMember: ({email, role}: AddEmployeeParams) => `entfernt ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} entfernt`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbunden mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'hat den Chat verlassen',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} für ${dayCount} ${dayCount === 1 ? 'Tag' : 'Tage'} bis ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} von ${timePeriod} am ${date}`,
    },
    footer: {
        features: 'Funktionen',
        expenseManagement: 'Ausgabenverwaltung',
        spendManagement: 'Ausgabenverwaltung',
        expenseReports: 'Spesenabrechnungen',
        companyCreditCard: 'Firmenkreditkarte',
        receiptScanningApp: 'Beleg-Scan-App',
        billPay: 'Rechnungszahlung',
        invoicing: 'Rechnungsstellung',
        CPACard: 'CPA-Karte',
        payroll: 'Gehaltsabrechnung',
        travel: 'Reisen',
        resources: 'Ressourcen',
        expensifyApproved: 'ExpensifyGenehmigt!',
        pressKit: 'Pressemappe',
        support: 'Support',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Nutzungsbedingungen',
        privacy: 'Datenschutz',
        learnMore: 'Mehr erfahren',
        aboutExpensify: 'Über Expensify',
        blog: 'Blog',
        jobs: 'Jobs',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Investor Relations',
        getStarted: 'Loslegen',
        createAccount: 'Ein neues Konto erstellen',
        logIn: 'Anmelden',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Zurück zur Chatliste navigieren',
        chatWelcomeMessage: 'Willkommensnachricht im Chat',
        navigatesToChat: 'Navigiert zu einem Chat',
        newMessageLineIndicator: 'Indikator für neue Nachrichtenzeile',
        chatMessage: 'Chat-Nachricht',
        lastChatMessagePreview: 'Vorschau der letzten Chat-Nachricht',
        workspaceName: 'Arbeitsbereichsname',
        chatUserDisplayNames: 'Anzeigenamen der Chat-Mitglieder',
        scrollToNewestMessages: 'Zum neuesten Nachrichten scrollen',
        preStyledText: 'Vorgestylter Text',
        viewAttachment: 'Anhang anzeigen',
    },
    parentReportAction: {
        deletedReport: 'Gelöschter Bericht',
        deletedMessage: 'Gelöschte Nachricht',
        deletedExpense: 'Gelöschte Ausgabe',
        reversedTransaction: 'Rückgängig gemachte Transaktion',
        deletedTask: 'Gelöschte Aufgabe',
        hiddenMessage: 'Versteckte Nachricht',
    },
    threads: {
        thread: 'Thread',
        replies: 'Antworten',
        reply: 'Antwort',
        from: 'Von',
        in: 'in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Von ${reportName}${workspaceName ? `in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'URL kopieren',
        copied: 'Kopiert!',
    },
    moderation: {
        flagDescription: 'Alle markierten Nachrichten werden zur Überprüfung an einen Moderator gesendet.',
        chooseAReason: 'Wählen Sie unten einen Grund für die Markierung aus:',
        spam: 'Spam',
        spamDescription: 'Unaufgeforderte themenfremde Werbung',
        inconsiderate: 'Rücksichtslos',
        inconsiderateDescription: 'Beleidigende oder respektlose Formulierungen mit fragwürdigen Absichten',
        intimidation: 'Einschüchterung',
        intimidationDescription: 'Eine Agenda aggressiv verfolgen trotz berechtigter Einwände',
        bullying: 'Mobbing',
        bullyingDescription: 'Das gezielte Ansprechen einer Person, um Gehorsam zu erlangen',
        harassment: 'Belästigung',
        harassmentDescription: 'Rassistisches, frauenfeindliches oder anderes allgemein diskriminierendes Verhalten',
        assault: 'Angriff',
        assaultDescription: 'Gezielt ausgerichteter emotionaler Angriff mit der Absicht zu schaden',
        flaggedContent: 'Diese Nachricht wurde als Verstoß gegen unsere Gemeinschaftsregeln markiert und der Inhalt wurde ausgeblendet.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet eine anonyme Warnung und die Nachricht wird zur Überprüfung gemeldet.',
        levelTwoResult: 'Nachricht aus dem Kanal ausgeblendet, plus anonyme Warnung und Nachricht wird zur Überprüfung gemeldet.',
        levelThreeResult: 'Nachricht aus dem Kanal entfernt, zusätzlich anonyme Warnung und Nachricht zur Überprüfung gemeldet.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Lade sie ein',
        nothing: 'Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Akzeptieren',
        decline: 'Ablehnen',
    },
    actionableMentionTrackExpense: {
        submit: 'Reiche es bei jemandem ein',
        categorize: 'Kategorisieren Sie es',
        share: 'Teile es mit meinem Buchhalter',
        nothing: 'Noch nichts im Moment',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrer vereinen sich',
        joinExpensifyOrg:
            'Schließen Sie sich Expensify.org an, um Ungerechtigkeiten auf der ganzen Welt zu beseitigen. Die aktuelle Kampagne „Teachers Unite“ unterstützt Lehrkräfte überall, indem sie die Kosten für wichtige Schulmaterialien teilt.',
        iKnowATeacher: 'Ich kenne einen Lehrer',
        iAmATeacher: 'Ich bin Lehrer.',
        getInTouch: 'Ausgezeichnet! Bitte teilen Sie ihre Informationen mit, damit wir Kontakt mit ihnen aufnehmen können.',
        introSchoolPrincipal: 'Einführung bei Ihrem Schulleiter',
        schoolPrincipalVerifyExpense:
            'Expensify.org teilt die Kosten für wichtige Schulmaterialien, damit Schüler aus einkommensschwachen Familien eine bessere Lernerfahrung haben können. Ihr Schulleiter wird gebeten, Ihre Ausgaben zu überprüfen.',
        principalFirstName: 'Vorname des Hauptansprechpartners',
        principalLastName: 'Nachname des Hauptansprechpartners',
        principalWorkEmail: 'Hauptarbeits-E-Mail',
        updateYourEmail: 'Aktualisieren Sie Ihre E-Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        contactMethods: 'Kontaktmethoden.',
        schoolMailAsDefault:
            'Bevor Sie fortfahren, stellen Sie bitte sicher, dass Sie Ihre Schul-E-Mail als Ihre Standardkontaktmethode festlegen. Dies können Sie unter Einstellungen > Profil > tun.',
        error: {
            enterPhoneEmail: 'Geben Sie eine gültige E-Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'Geben Sie eine E-Mail-Adresse ein',
            enterValidEmail: 'Geben Sie eine gültige E-Mail-Adresse ein',
            tryDifferentEmail: 'Bitte versuchen Sie eine andere E-Mail-Adresse.',
        },
    },
    cardTransactions: {
        notActivated: 'Nicht aktiviert',
        outOfPocket: 'Auslagen',
        companySpend: 'Unternehmensausgaben',
    },
    distance: {
        addStop: 'Stopp hinzufügen',
        deleteWaypoint: 'Wegpunkt löschen',
        deleteWaypointConfirmation: 'Sind Sie sicher, dass Sie diesen Wegpunkt löschen möchten?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Start',
            stop: 'Stopp',
        },
        mapPending: {
            title: 'Ausstehende Zuordnung',
            subtitle: 'Die Karte wird erstellt, wenn Sie wieder online sind.',
            onlineSubtitle: 'Einen Moment, während wir die Karte einrichten',
            errorTitle: 'Kartierungsfehler',
            errorSubtitle: 'Beim Laden der Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        error: {
            selectSuggestedAddress: 'Bitte wählen Sie eine vorgeschlagene Adresse aus oder verwenden Sie den aktuellen Standort.',
        },
    },
    reportCardLostOrDamaged: {
        report: 'Physische Karte als verloren / beschädigt melden',
        screenTitle: 'Berichtsheft verloren oder beschädigt',
        nextButtonLabel: 'Weiter',
        reasonTitle: 'Warum benötigen Sie eine neue Karte?',
        cardDamaged: 'Meine Karte wurde beschädigt',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte bestätigen Sie die Postanschrift für Ihre neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte wird in 2-3 Werktagen eintreffen. Ihre aktuelle Karte funktioniert weiterhin, bis Sie Ihre neue aktivieren.',
        cardLostOrStolenInfo: 'Ihre aktuelle Karte wird dauerhaft deaktiviert, sobald Ihre Bestellung aufgegeben wurde. Die meisten Karten kommen innerhalb weniger Werktage an.',
        address: 'Adresse',
        deactivateCardButton: 'Karte deaktivieren',
        shipNewCardButton: 'Neue Karte versenden',
        addressError: 'Adresse ist erforderlich',
        reasonError: 'Grund ist erforderlich',
    },
    eReceipt: {
        guaranteed: 'Garantierter eReceipt',
        transactionDate: 'Transaktionsdatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Starte einen Chat,',
            buttonText2: 'einen Freund empfehlen.',
            header: 'Starte einen Chat, empfehle einen Freund',
            body: 'Möchten Sie, dass Ihre Freunde auch Expensify nutzen? Starten Sie einfach einen Chat mit ihnen und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Reichen Sie eine Ausgabe ein,',
            buttonText2: 'empfehlen Sie Ihren Chef.',
            header: 'Reichen Sie eine Ausgabe ein, empfehlen Sie Ihren Chef weiter',
            body: 'Möchten Sie, dass Ihr Chef auch Expensify verwendet? Reichen Sie ihm einfach eine Spesenabrechnung ein, und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Einen Freund empfehlen',
            body: 'Möchten Sie, dass Ihre Freunde auch Expensify nutzen? Chatten Sie einfach, bezahlen Sie oder teilen Sie eine Ausgabe mit ihnen, und wir kümmern uns um den Rest. Oder teilen Sie einfach Ihren Einladungslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Einen Freund empfehlen',
            header: 'Einen Freund empfehlen',
            body: 'Möchten Sie, dass Ihre Freunde auch Expensify nutzen? Chatten Sie einfach, bezahlen Sie oder teilen Sie eine Ausgabe mit ihnen, und wir kümmern uns um den Rest. Oder teilen Sie einfach Ihren Einladungslink!',
        },
        copyReferralLink: 'Einladungslink kopieren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Chatten Sie mit Ihrem Einrichtungsspezialisten in',
            phrase2: 'zur Hilfe',
        },
        default: {
            phrase1: 'Nachricht',
            phrase2: 'für Hilfe bei der Einrichtung',
        },
    },
    violations: {
        allTagLevelsRequired: 'Alle erforderlichen Tags',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) =>
            `${rejectedBy} hat diese Ausgabe mit dem Kommentar „${rejectReason}“ abgelehnt`,
        billableExpense: 'Abrechenbar nicht mehr gültig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Beleg erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategorie nicht mehr gültig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Angewandte ${surcharge}% Umrechnungsgebühr`,
        customUnitOutOfPolicy: 'Der Tarif ist für diesen Arbeitsbereich nicht gültig',
        duplicatedTransaction: 'Duplikat',
        fieldRequired: 'Berichtsfelder sind erforderlich',
        futureDate: 'Zukünftiges Datum nicht erlaubt',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Mit ${invoiceMarkup}% aufgeschlagen`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum älter als ${maxAge} Tage`,
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung für die ausgewählte Kategorie erforderlich',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Fehlend ${tagName ?? 'Tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Betrag weicht von der berechneten Entfernung ab';
                case 'card':
                    return 'Betrag größer als Kartentransaktion';
                default:
                    if (displayPercentVariance) {
                        return `Betrag um ${displayPercentVariance}% höher als der gescannte Beleg`;
                    }
                    return 'Betrag größer als der gescannte Beleg';
            }
        },
        modifiedDate: 'Datum weicht vom gescannten Beleg ab',
        nonExpensiworksExpense: 'Nicht-Expensiworks-Ausgabe',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Die Ausgabe überschreitet das automatische Genehmigungslimit von ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Betrag über dem ${formattedLimit}/Personen-Kategorienlimit`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit} pro Person`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit} pro Person`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Betrag über dem täglichen ${formattedLimit}/Person Kategorienlimit`,
        receiptNotSmartScanned:
            'Ausgabendetails und Beleg wurden manuell hinzugefügt. Bitte überprüfen Sie die Details. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Erfahren Sie mehr</a> über die automatische Prüfung aller Belege.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Quittung erforderlich';
            if (formattedLimit ?? category) {
                message += 'vorbei';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += 'Kategorienlimit';
                }
            }
            return message;
        },
        prohibitedExpense: ({prohibitedExpenseType}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Verbotene Ausgabe:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return `${preMessage} Alkohol`;
                case 'gambling':
                    return `${preMessage} Glücksspiel`;
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
        reviewRequired: 'Überprüfung erforderlich',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `Quittung kann aufgrund einer unterbrochenen Bankverbindung, die ${email} beheben muss, nicht automatisch zugeordnet werden.`
                    : 'Beleg kann aufgrund einer unterbrochenen Bankverbindung, die Sie beheben müssen, nicht automatisch zugeordnet werden.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Bitte ${member}, es als Bargeld zu markieren, oder warte 7 Tage und versuche es erneut.` : 'Warte auf Zusammenführung mit Kartentransaktion.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend aufgrund unterbrochener Bankverbindung',
        adminBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte beheben Sie das Problem in',
        memberBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte bitten Sie einen Workspace-Administrator, das Problem zu beheben.',
        markAsCashToIgnore: 'Als Barzahlung markieren, um zu ignorieren und Zahlung anzufordern.',
        smartscanFailed: ({canEdit = true}) => `Belegscan fehlgeschlagen.${canEdit ? 'Details manuell eingeben.' : ''}`,
        receiptGeneratedWithAI: 'Möglicher KI-generierter Beleg',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Fehlend ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nicht mehr gültig`,
        taxAmountChanged: 'Der Steuerbetrag wurde geändert',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Steuer'} nicht mehr gültig`,
        taxRateChanged: 'Der Steuersatz wurde geändert',
        taxRequired: 'Fehlender Steuersatz',
        none: 'Keine',
        taxCodeToKeep: 'Wählen Sie den Steuerkode, den Sie behalten möchten',
        tagToKeep: 'Wählen Sie, welches Tag beibehalten werden soll',
        isTransactionReimbursable: 'Wählen Sie, ob die Transaktion erstattungsfähig ist',
        merchantToKeep: 'Wählen Sie aus, welchen Händler Sie behalten möchten',
        descriptionToKeep: 'Wählen Sie, welche Beschreibung beibehalten werden soll',
        categoryToKeep: 'Wählen Sie aus, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'Wählen Sie, ob die Transaktion abrechenbar ist',
        keepThisOne: 'Keep this one',
        confirmDetails: `Bestätigen Sie die Details, die Sie behalten möchten`,
        confirmDuplicatesInfo: `Die doppelten Anfragen, die Sie nicht behalten, werden vom Mitglied zum Löschen aufbewahrt.`,
        hold: 'Diese Ausgabe wurde zurückgestellt',
        resolvedDuplicates: 'das Duplikat wurde behoben',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} ist erforderlich`,
    },
    violationDismissal: {
        rter: {
            manual: 'diesen Beleg als Barzahlung markiert',
        },
        duplicatedTransaction: {
            manual: 'das Duplikat wurde behoben',
        },
    },
    videoPlayer: {
        play: 'Abspielen',
        pause: 'Pause',
        fullscreen: 'Vollbild',
        playbackSpeed: 'Wiedergabegeschwindigkeit',
        expand: 'Erweitern',
        mute: 'Stumm',
        unmute: 'Ton einschalten',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Bevor Sie gehen',
        reasonPage: {
            title: 'Bitte teilen Sie uns mit, warum Sie gehen.',
            subtitle: 'Bevor Sie gehen, sagen Sie uns bitte, warum Sie zu Expensify Classic wechseln möchten.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ich benötige eine Funktion, die nur in Expensify Classic verfügbar ist.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ich verstehe nicht, wie man New Expensify benutzt.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ich verstehe, wie man New Expensify benutzt, aber ich bevorzuge Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welche Funktion benötigen Sie, die in New Expensify nicht verfügbar ist?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Was versuchen Sie zu tun?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Warum bevorzugen Sie Expensify Classic?',
        },
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Danke für das Feedback!',
        thankYouSubtitle: 'Ihre Rückmeldungen helfen uns, ein besseres Produkt zu entwickeln, um Dinge zu erledigen. Vielen Dank!',
        goToExpensifyClassic: 'Wechseln zu Expensify Classic',
        offlineTitle: 'Sieht so aus, als wärst du hier festgefahren...',
        offline:
            'Sie scheinen offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber New Expensify schon. Wenn Sie Expensify Classic verwenden möchten, versuchen Sie es erneut, wenn Sie eine Internetverbindung haben.',
        quickTip: 'Kurzer Tipp...',
        quickTipSubTitle: 'Sie können direkt zu Expensify Classic gehen, indem Sie expensify.com besuchen. Legen Sie es als Lesezeichen für eine einfache Verknüpfung an!',
        bookACall: 'Einen Anruf buchen',
        noThanks: 'Nein danke',
        bookACallTitle: 'Möchten Sie mit einem Produktmanager sprechen?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direkt über Ausgaben und Berichte chatten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Fähigkeit, alles mobil zu erledigen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reisen und Spesen mit der Geschwindigkeit des Chats',
        },
        bookACallTextTop: 'Wenn Sie zu Expensify Classic wechseln, verpassen Sie:',
        bookACallTextBottom:
            'Wir würden uns freuen, mit Ihnen zu telefonieren, um zu verstehen, warum. Sie können einen Termin für ein Gespräch mit einem unserer leitenden Produktmanager buchen, um Ihre Bedürfnisse zu besprechen.',
        takeMeToExpensifyClassic: 'Bring mich zu Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Beim Laden weiterer Nachrichten ist ein Fehler aufgetreten',
        tryAgain: 'Versuchen Sie es erneut',
    },
    systemMessage: {
        mergedWithCashTransaction: 'eine Quittung mit dieser Transaktion abgeglichen',
    },
    subscription: {
        authenticatePaymentCard: 'Zahlungskarte authentifizieren',
        mobileReducedFunctionalityMessage: 'Sie können Ihr Abonnement in der mobilen App nicht ändern.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Kostenlose Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} übrig`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Aktualisieren Sie Ihre Zahlungskarte bis zum ${date}, um alle Ihre Lieblingsfunktionen weiterhin nutzen zu können.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Ihre Zahlung konnte nicht verarbeitet werden',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Ihre Belastung vom ${date} über ${purchaseAmountOwed} konnte nicht verarbeitet werden. Bitte fügen Sie eine Zahlungskarte hinzu, um den offenen Betrag zu begleichen.`
                        : 'Bitte fügen Sie eine Zahlungskarte hinzu, um den geschuldeten Betrag zu begleichen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung bis zum ${date}, um eine Unterbrechung des Dienstes zu vermeiden.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: 'Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung.',
            },
            billingDisputePending: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Sie haben die Belastung von ${amountOwed} auf der Karte mit der Endung ${cardEnding} bestritten. Ihr Konto wird gesperrt, bis der Streitfall mit Ihrer Bank geklärt ist.`,
            },
            cardAuthenticationRequired: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Ihre Zahlungskarte wurde nicht vollständig authentifiziert. Bitte schließen Sie den Authentifizierungsprozess ab, um Ihre Zahlungskarte mit der Endung ${cardEnding} zu aktivieren.`,
            },
            insufficientFunds: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Ihre Zahlungskarte wurde aufgrund unzureichender Mittel abgelehnt. Bitte versuchen Sie es erneut oder fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Betrag von ${amountOwed} zu begleichen.`,
            },
            cardExpired: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Ihre Zahlungskarte ist abgelaufen. Bitte fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Betrag von ${amountOwed} zu begleichen.`,
            },
            cardExpireSoon: {
                title: 'Ihre Karte läuft bald ab',
                subtitle:
                    'Ihre Zahlungskarte läuft am Ende dieses Monats ab. Klicken Sie auf das Drei-Punkte-Menü unten, um sie zu aktualisieren und weiterhin alle Ihre Lieblingsfunktionen zu nutzen.',
            },
            retryBillingSuccess: {
                title: 'Erfolg!',
                subtitle: 'Ihre Karte wurde erfolgreich belastet.',
            },
            retryBillingError: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle:
                    'Bevor Sie es erneut versuchen, rufen Sie bitte direkt Ihre Bank an, um Expensify-Zahlungen zu autorisieren und etwaige Sperren aufzuheben. Andernfalls versuchen Sie, eine andere Zahlungskarte hinzuzufügen.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Sie haben die Belastung von ${amountOwed} auf der Karte mit der Endung ${cardEnding} bestritten. Ihr Konto wird gesperrt, bis der Streitfall mit Ihrer Bank geklärt ist.`,
            preTrial: {
                title: 'Starte eine kostenlose Testphase',
                subtitleStart: 'Als nächster Schritt,',
                subtitleLink: 'Vervollständigen Sie Ihre Setup-Checkliste',
                subtitleEnd: 'damit Ihr Team mit der Spesenabrechnung beginnen kann.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} übrig!`,
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um alle Ihre Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            trialEnded: {
                title: 'Ihre kostenlose Testphase ist abgelaufen',
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um alle Ihre Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            earlyDiscount: {
                claimOffer: 'Angebot beanspruchen',
                noThanks: 'Nein danke',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% Rabatt auf Ihr erstes Jahr!`,
                    phrase2: `Fügen Sie einfach eine Zahlungskarte hinzu und starten Sie ein Jahresabonnement.`,
                },
                onboardingChatTitle: {
                    phrase1: 'Zeitlich begrenztes Angebot:',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% Rabatt auf Ihr erstes Jahr!`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Anspruch innerhalb von ${days > 0 ? `${days}T :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Zahlung',
            subtitle: 'Fügen Sie eine Karte hinzu, um Ihr Expensify-Abonnement zu bezahlen.',
            addCardButton: 'Zahlungskarte hinzufügen',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Ihr nächstes Zahlungsdatum ist ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Karte endet auf ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Name: ${name}, Ablaufdatum: ${expiration}, Währung: ${currency}`,
            changeCard: 'Zahlungskarte ändern',
            changeCurrency: 'Zahlungswährung ändern',
            cardNotFound: 'Keine Zahlungskarte hinzugefügt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'Rückerstattung anfordern',
            requestRefundModal: {
                phrase1: 'Eine Rückerstattung zu erhalten ist einfach, downgrade einfach dein Konto vor deinem nächsten Abrechnungsdatum und du erhältst eine Rückerstattung.',
                phrase2:
                    'Achtung: Wenn Sie Ihr Konto herabstufen, werden Ihre Arbeitsbereiche gelöscht. Diese Aktion kann nicht rückgängig gemacht werden, aber Sie können jederzeit einen neuen Arbeitsbereich erstellen, falls Sie Ihre Meinung ändern.',
                confirm: 'Arbeitsbereich(e) löschen und herabstufen',
            },
            viewPaymentHistory: 'Zahlungsverlauf anzeigen',
        },
        yourPlan: {
            title: 'Ihr Plan',
            exploreAllPlans: 'Alle Pläne erkunden',
            customPricing: 'Benutzerdefinierte Preisgestaltung',
            asLowAs: ({price}: YourPlanPriceValueParams) => `so niedrig wie ${price} pro aktivem Mitglied/Monat`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied/Monat`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied pro Monat`,
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Sammeln',
                description: 'Der Kleinunternehmensplan, der Ihnen Ausgaben, Reisen und Chat bietet.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                benefit1: 'Belegscan',
                benefit2: 'Erstattungen',
                benefit3: 'Verwaltung von Firmenkarten',
                benefit4: 'Genehmigungen für Ausgaben und Reisen',
                benefit5: 'Reisebuchung und Regeln',
                benefit6: 'QuickBooks/Xero-Integrationen',
                benefit7: 'Chat über Ausgaben, Berichte und Räume',
                benefit8: 'KI- und menschlicher Support',
            },
            control: {
                title: 'Steuerung',
                description: 'Ausgaben, Reisen und Chat für größere Unternehmen.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                benefit1: 'Alles im Collect-Plan',
                benefit2: 'Mehrstufige Genehmigungs-Workflows',
                benefit3: 'Benutzerdefinierte Ausgabenregeln',
                benefit4: 'ERP-Integrationen (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR-Integrationen (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Benutzerdefinierte Einblicke und Berichterstattung',
                benefit8: 'Budgetierung',
            },
            thisIsYourCurrentPlan: 'Dies ist Ihr aktueller Plan',
            downgrade: 'Downgrade zu Collect',
            upgrade: 'Upgrade auf Control',
            addMembers: 'Mitglieder hinzufügen',
            saveWithExpensifyTitle: 'Mit der Expensify Card sparen',
            saveWithExpensifyDescription: 'Verwenden Sie unseren Sparrechner, um zu sehen, wie Cashback von der Expensify Card Ihre Expensify-Rechnung reduzieren kann.',
            saveWithExpensifyButton: 'Mehr erfahren',
        },
        compareModal: {
            comparePlans: 'Pläne vergleichen',
            unlockTheFeatures: 'Schalten Sie die Funktionen frei, die Sie benötigen, mit dem Plan, der am besten zu Ihnen passt.',
            viewOurPricing: 'Unsere Preisseite ansehen',
            forACompleteFeatureBreakdown: 'für eine vollständige Aufschlüsselung der Funktionen jedes unserer Pläne.',
        },
        details: {
            title: 'Abonnementdetails',
            annual: 'Jahresabonnement',
            taxExempt: 'Antrag auf Steuerbefreiung stellen',
            taxExemptEnabled: 'Steuerbefreit',
            taxExemptStatus: 'Steuerbefreiungsstatus',
            payPerUse: 'Bezahlung nach Nutzung',
            subscriptionSize: 'Abonnementgröße',
            headsUp:
                'Achtung: Wenn Sie die Größe Ihres Abonnements jetzt nicht festlegen, wird sie automatisch auf die Anzahl der aktiven Mitglieder im ersten Monat gesetzt. Sie verpflichten sich dann, für mindestens diese Anzahl von Mitgliedern in den nächsten 12 Monaten zu zahlen. Sie können die Größe Ihres Abonnements jederzeit erhöhen, aber nicht verringern, bis Ihr Abonnement endet.',
            zeroCommitment: 'Keine Verpflichtung zum ermäßigten Jahresabonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgröße',
            yourSize: 'Die Größe Ihres Abonnements entspricht der Anzahl der offenen Plätze, die in einem bestimmten Monat von jedem aktiven Mitglied besetzt werden können.',
            eachMonth:
                'Jeden Monat deckt Ihr Abonnement bis zur oben festgelegten Anzahl aktiver Mitglieder ab. Jedes Mal, wenn Sie die Größe Ihres Abonnements erhöhen, starten Sie ein neues 12-monatiges Abonnement in dieser neuen Größe.',
            note: 'Hinweis: Ein aktives Mitglied ist jede Person, die Ausgabendaten erstellt, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat, die mit Ihrem Unternehmensarbeitsbereich verbunden sind.',
            confirmDetails: 'Bestätigen Sie Ihre neuen jährlichen Abonnementdetails:',
            subscriptionSize: 'Abonnementgröße',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktive Mitglieder/Monat`,
            subscriptionRenews: 'Abonnement erneuert sich',
            youCantDowngrade: 'Während Ihres Jahresabonnements können Sie kein Downgrade durchführen.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Sie haben sich bereits auf ein Jahresabonnement mit ${size} aktiven Mitgliedern pro Monat bis zum ${date} verpflichtet. Sie können am ${date} zu einem Pay-per-Use-Abonnement wechseln, indem Sie die automatische Verlängerung deaktivieren.`,
            error: {
                size: 'Bitte geben Sie eine gültige Abonnementgröße ein',
                sameSize: 'Bitte geben Sie eine Zahl ein, die sich von Ihrer aktuellen Abonnementgröße unterscheidet.',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzufügen',
            enterPaymentCardDetails: 'Geben Sie Ihre Zahlungs kartendaten ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet bankübliche Verschlüsselung und nutzt redundante Infrastruktur, um Ihre Daten zu schützen.',
            learnMoreAboutSecurity: 'Erfahren Sie mehr über unsere Sicherheit.',
        },
        subscriptionSettings: {
            title: 'Abonnement-Einstellungen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementtyp: ${subscriptionType}, Abonnementgröße: ${subscriptionSize}, Automatische Verlängerung: ${autoRenew}, Automatische Erhöhung der Jahresplätze: ${autoIncrease}`,
            none: 'none',
            on: 'an',
            off: 'aus',
            annual: 'Jährlich',
            autoRenew: 'Automatische Verlängerung',
            autoIncrease: 'Automatische Erhöhung der jährlichen Plätze',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Sparen Sie bis zu ${amountWithCurrency}/Monat pro aktivem Mitglied`,
            automaticallyIncrease:
                'Erhöhen Sie automatisch Ihre jährlichen Plätze, um aktive Mitglieder zu berücksichtigen, die Ihre Abonnementgröße überschreiten. Hinweis: Dies verlängert das Enddatum Ihres Jahresabonnements.',
            disableAutoRenew: 'Automatische Verlängerung deaktivieren',
            helpUsImprove: 'Hilf uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund dafür, dass Sie die automatische Verlängerung deaktivieren?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Erneuert sich am ${date}.`,
            pricingConfiguration: 'Die Preisgestaltung hängt von der Konfiguration ab. Für den niedrigsten Preis wählen Sie ein Jahresabonnement und erhalten die Expensify Card.',
            learnMore: {
                part1: 'Erfahren Sie mehr auf unserer',
                pricingPage: 'Preisseite',
                part2: 'oder chatten Sie mit unserem Team in Ihrem',
                adminsRoom: '#admins Raum.',
            },
            estimatedPrice: 'Geschätzter Preis',
            changesBasedOn: 'Dies ändert sich basierend auf Ihrer Expensify Card-Nutzung und den untenstehenden Abonnementoptionen.',
        },
        requestEarlyCancellation: {
            title: 'Frühzeitige Stornierung anfragen',
            subtitle: 'Was ist der Hauptgrund für Ihre Bitte um vorzeitige Kündigung?',
            subscriptionCanceled: {
                title: 'Abonnement gekündigt',
                subtitle: 'Ihr Jahresabonnement wurde gekündigt.',
                info: 'Wenn Sie Ihre Arbeitsbereiche weiterhin auf Pay-per-Use-Basis nutzen möchten, sind Sie startklar.',
                preventFutureActivity: {
                    part1: 'Wenn Sie zukünftige Aktivitäten und Gebühren verhindern möchten, müssen Sie',
                    link: 'lösche deinen Arbeitsbereich/deine Arbeitsbereiche',
                    part2: 'Bitte beachten Sie, dass Ihnen bei der Löschung Ihres/Ihrer Arbeitsbereichs/Arbeitsbereiche alle ausstehenden Aktivitäten, die im laufenden Kalendermonat angefallen sind, in Rechnung gestellt werden.',
                },
            },
            requestSubmitted: {
                title: 'Anfrage gesendet',
                subtitle: {
                    part1: 'Danke, dass Sie uns mitgeteilt haben, dass Sie Ihr Abonnement kündigen möchten. Wir prüfen Ihre Anfrage und werden uns bald über Ihren Chat mit Ihnen in Verbindung setzen.',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: {
                part1: 'Durch die Anforderung einer vorzeitigen Stornierung erkenne ich an und stimme zu, dass Expensify keine Verpflichtung hat, eine solche Anfrage gemäß den Expensify-Bedingungen zu gewähren.',
                link: 'Nutzungsbedingungen',
                part2: 'oder eine andere anwendbare Dienstleistungsvereinbarung zwischen mir und Expensify und dass Expensify das alleinige Ermessen bei der Gewährung eines solchen Antrags behält.',
            },
        },
    },
    feedbackSurvey: {
        tooLimited: 'Die Funktionalität muss verbessert werden',
        tooExpensive: 'Zu teuer',
        inadequateSupport: 'Unzureichender Kundensupport',
        businessClosing: 'Unternehmensschließung, Personalabbau oder Übernahme',
        additionalInfoTitle: 'Auf welche Software wechseln Sie und warum?',
        additionalInfoInputLabel: 'Ihre Antwort',
    },
    roomChangeLog: {
        updateRoomDescription: 'set the room description to:',
        clearRoomDescription: 'Raumbeschreibung gelöscht',
    },
    delegate: {
        switchAccount: 'Konto wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Erlaube anderen Mitgliedern den Zugriff auf dein Konto.',
        addCopilot: 'Copilot hinzufügen',
        membersCanAccessYourAccount: 'Diese Mitglieder können auf Ihr Konto zugreifen:',
        youCanAccessTheseAccounts: 'Sie können auf diese Konten über den Kontowechsel zugreifen:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Voll';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Begrenzt';
                default:
                    return '';
            }
        },
        genericError: 'Ups, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `im Namen von ${delegator}`,
        accessLevel: 'Zugriffslevel',
        confirmCopilot: 'Bestätigen Sie Ihren Copiloten unten.',
        accessLevelDescription:
            'Wählen Sie unten eine Zugriffsebene aus. Sowohl Vollzugriff als auch Eingeschränkter Zugriff ermöglichen es Copiloten, alle Unterhaltungen und Ausgaben einzusehen.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Ermöglichen Sie einem anderen Mitglied, alle Aktionen in Ihrem Konto in Ihrem Namen durchzuführen. Dazu gehören Chat, Einreichungen, Genehmigungen, Zahlungen, Einstellungen und mehr.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Ermöglichen Sie einem anderen Mitglied, die meisten Aktionen in Ihrem Konto in Ihrem Namen durchzuführen. Ausgenommen sind Genehmigungen, Zahlungen, Ablehnungen und Sperren.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'Sind Sie sicher, dass Sie diesen Copilot entfernen möchten?',
        changeAccessLevel: 'Zugriffslevel ändern',
        makeSureItIsYou: 'Lassen Sie uns sicherstellen, dass Sie es sind',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde, um einen Copiloten hinzuzufügen. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Bitte geben Sie den an ${contactMethod} gesendeten magischen Code ein, um Ihren Copilot zu aktualisieren.`,
        notAllowed: 'Nicht so schnell...',
        noAccessMessage: 'Als Co-Pilot hast du keinen Zugriff auf \ndiese Seite. Entschuldigung!',
        notAllowedMessageStart: `Als ein`,
        notAllowedMessageHyperLinked: 'Copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `Für ${accountOwnerEmail} hast du keine Berechtigung, diese Aktion auszuführen. Entschuldigung!`,
        copilotAccess: 'Copilot-Zugang',
    },
    debug: {
        debug: 'Debug',
        details: 'Details',
        JSON: 'JSON',
        reportActions: 'Aktionen',
        reportActionPreview: 'Vorschau',
        nothingToPreview: 'Nichts zum Anzeigen',
        editJson: 'JSON bearbeiten:',
        preview: 'Vorschau:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Fehlendes ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ungültige Eigenschaft: ${propertyName} - Erwartet: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ungültiger Wert - Erwartet: ${expectedValues}`,
        missingValue: 'Fehlender Wert',
        createReportAction: 'Bericht erstellen Aktion',
        reportAction: 'Berichtsaktion',
        report: 'Bericht',
        transaction: 'Transaktion',
        violations: 'Verstöße',
        transactionViolation: 'Transaktionsverstoß',
        hint: 'Datenänderungen werden nicht an das Backend gesendet',
        textFields: 'Textfelder',
        numberFields: 'Zahlenfelder',
        booleanFields: 'Boolesche Felder',
        constantFields: 'Konstante Felder',
        dateTimeFields: 'Datum/Uhrzeit-Felder',
        date: 'Datum',
        time: 'Zeit',
        none: 'Keine',
        visibleInLHN: 'Sichtbar im LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'falsch',
        viewReport: 'Bericht anzeigen',
        viewTransaction: 'Transaktion anzeigen',
        createTransactionViolation: 'Transaktionsverstoß erstellen',
        reasonVisibleInLHN: {
            hasDraftComment: 'Hat Entwurfskommentar',
            hasGBR: 'Hat GBR',
            hasRBR: 'Hat RBR',
            pinnedByUser: 'Von Mitglied angeheftet',
            hasIOUViolations: 'Hat IOU-Verstöße',
            hasAddWorkspaceRoomErrors: 'Hat Fehler beim Hinzufügen des Arbeitsbereichsraums',
            isUnread: 'Ist ungelesen (Fokusmodus)',
            isArchived: 'Ist archiviert (neuester Modus)',
            isSelfDM: 'Ist Selbst-DM',
            isFocused: 'Ist vorübergehend fokussiert',
        },
        reasonGBR: {
            hasJoinRequest: 'Hat Beitrittsanfrage (Admin-Raum)',
            isUnreadWithMention: 'Ist ungelesen mit Erwähnung',
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass der Zuständige die Aktion abschließt',
            hasChildReportAwaitingAction: 'Hat untergeordneten Bericht, der auf Aktion wartet',
            hasMissingInvoiceBankAccount: 'Fehlendes Bankkonto für die Rechnung vorhanden',
        },
        reasonRBR: {
            hasErrors: 'Hat Fehler im Bericht oder in den Berichtaktionen-Daten',
            hasViolations: 'Hat Verstöße',
            hasTransactionThreadViolations: 'Hat Verstöße gegen den Transaktions-Thread',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Es gibt einen Bericht, der auf eine Aktion wartet',
            theresAReportWithErrors: 'Es gibt einen Bericht mit Fehlern',
            theresAWorkspaceWithCustomUnitsErrors: 'Es gibt einen Arbeitsbereich mit Fehlern bei benutzerdefinierten Einheiten.',
            theresAProblemWithAWorkspaceMember: 'Es gibt ein Problem mit einem Arbeitsbereichsmitglied',
            theresAProblemWithAWorkspaceQBOExport: 'Es gab ein Problem mit einer Exporteinstellung für die Workspace-Verbindung.',
            theresAProblemWithAContactMethod: 'Es gibt ein Problem mit einer Kontaktmethode',
            aContactMethodRequiresVerification: 'Eine Kontaktmethode erfordert eine Verifizierung',
            theresAProblemWithAPaymentMethod: 'Es gibt ein Problem mit einer Zahlungsmethode',
            theresAProblemWithAWorkspace: 'Es gibt ein Problem mit einem Arbeitsbereich',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit Ihrem Erstattungskonto',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit Ihrem Abonnement.',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Ihr Abonnement wurde erfolgreich verlängert',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Während der Synchronisierung der Workspace-Verbindung ist ein Problem aufgetreten',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit Ihrer Brieftasche',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit den Bedingungen Ihrer Wallet.',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Machen Sie eine Probefahrt',
    },
    migratedUserWelcomeModal: {
        title: 'Reisen und Spesen, mit der Geschwindigkeit des Chats',
        subtitle: 'Das neue Expensify bietet die gleiche großartige Automatisierung, jetzt aber mit erstaunlicher Zusammenarbeit:',
        confirmText: "Los geht's!",
        features: {
            chat: '<strong>Direkt in jeder Ausgabe</strong>, jedem Bericht oder Arbeitsbereich chatten',
            scanReceipt: '<strong>Belege scannen</strong> und erstattet bekommen',
            crossPlatform: 'Machen Sie <strong>alles</strong> von Ihrem Telefon oder Browser aus',
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
            part1: 'Benennen Sie Ihre gespeicherten Suchanfragen um',
            part2: 'hier!',
        },
        bottomNavInboxTooltip: {
            part1: 'Prüfen, was',
            part2: 'benötigt Ihre Aufmerksamkeit',
            part3: 'und',
            part4: 'Chat über Ausgaben.',
        },
        workspaceChatTooltip: {
            part1: 'Chatten mit',
            part2: 'Genehmigende',
        },
        globalCreateTooltip: {
            part1: 'Ausgaben erstellen',
            part2: ', beginne zu chatten,',
            part3: 'und mehr.',
            part4: 'Probier es aus!',
        },
        GBRRBRChat: {
            part1: 'Du wirst 🟢 auf sehen',
            part2: 'Maßnahmen ergreifen',
            part3: ',\nund 🔴 an',
            part4: 'Elemente zur Überprüfung.',
        },
        accountSwitcher: {
            part1: 'Greifen Sie auf Ihre',
            part2: 'Copilot-Konten',
            part3: 'hier',
        },
        expenseReportsFilter: {
            part1: 'Willkommen! Finden Sie alle Ihre',
            part2: 'Berichte des Unternehmens',
            part3: 'hier.',
        },
        scanTestTooltip: {
            part1: 'Möchten Sie sehen, wie Scan funktioniert?',
            part2: 'Probieren Sie einen Testbeleg aus!',
            part3: 'Wählen Sie unseren',
            part4: 'Testmanager',
            part5: 'um es auszuprobieren!',
            part6: 'Jetzt,',
            part7: 'Reichen Sie Ihre Ausgabe ein',
            part8: 'und sieh zu, wie die Magie geschieht!',
            tryItOut: 'Probier es aus',
            noThanks: 'Nein danke',
        },
        outstandingFilter: {
            part1: 'Filter für Ausgaben, die',
            part2: 'Benötigt Genehmigung',
        },
        scanTestDriveTooltip: {
            part1: 'Diese Quittung senden an',
            part2: 'beende die Probefahrt!',
        },
    },
    discardChangesConfirmation: {
        title: 'Änderungen verwerfen?',
        body: 'Sind Sie sicher, dass Sie die vorgenommenen Änderungen verwerfen möchten?',
        confirmText: 'Änderungen verwerfen',
    },
    scheduledCall: {
        book: {
            title: 'Anruf planen',
            description: 'Finden Sie eine Zeit, die für Sie passt.',
            slots: 'Verfügbare Zeiten für',
        },
        confirmation: {
            title: 'Anruf bestätigen',
            description:
                'Bitte überprüfen Sie, ob die untenstehenden Details für Sie in Ordnung sind. Sobald Sie den Anruf bestätigen, senden wir eine Einladung mit weiteren Informationen.',
            setupSpecialist: 'Ihr Einrichtungsspezialist',
            meetingLength: 'Dauer des Treffens',
            dateTime: 'Datum & Uhrzeit',
            minutes: '30 Minuten',
        },
        callScheduled: 'Anruf geplant',
    },
    autoSubmitModal: {
        title: 'Alles klar und eingereicht!',
        description: 'Alle Warnungen und Verstöße wurden daher gelöscht:',
        submittedExpensesTitle: 'Diese Ausgaben wurden eingereicht',
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihren Genehmiger gesendet, können jedoch weiterhin bearbeitet werden, bis sie genehmigt sind.',
        pendingExpensesTitle: 'Ausstehende Ausgaben wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie gebucht werden.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Machen Sie eine 2-minütige Probefahrt',
        },
        modal: {
            title: 'Probieren Sie uns aus',
            description: 'Machen Sie eine kurze Produktführung, um schnell auf den neuesten Stand zu kommen. Keine Zwischenstopps erforderlich!',
            confirmText: 'Testfahrt starten',
            helpText: 'Überspringen',
            employee: {
                description:
                    '<muted-text>Erhalten Sie für Ihr Team <strong>3 kostenlose Monate Expensify!</strong> Geben Sie einfach die E-Mail-Adresse Ihres Chefs unten ein und senden Sie ihm eine Testausgabe.</muted-text>',
                email: 'Geben Sie die E-Mail-Adresse Ihres Chefs ein',
                error: 'Dieses Mitglied besitzt einen Arbeitsbereich, bitte geben Sie ein neues Mitglied zum Testen ein.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Sie testen derzeit Expensify.',
            readyForTheRealThing: 'Bereit für das Richtige?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} hat dich eingeladen, Expensify auszuprobieren\nHey! Ich habe uns gerade *3 Monate kostenlos* gesichert, um Expensify, den schnellsten Weg für Spesenabrechnungen, zu testen.\n\nHier ist ein *Testbeleg*, um dir zu zeigen, wie es funktioniert:`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
