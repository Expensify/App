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
import type {OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
import dedent from '@libs/StringUtils/dedent';
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
    AirlineParams,
    AlreadySignedInParams,
    ApprovalWorkflowErrorParams,
    ApprovedAmountParams,
    AssignedCardParams,
    AssigneeParams,
    AuthenticationErrorParams,
    AutoPayApprovedReportsLimitErrorParams,
    BadgeFreeTrialParams,
    BankAccountLastFourParams,
    BeginningOfArchivedRoomParams,
    BeginningOfChatHistoryAdminRoomParams,
    BeginningOfChatHistoryAnnounceRoomParams,
    BeginningOfChatHistoryDomainRoomParams,
    BeginningOfChatHistoryInvoiceRoomParams,
    BeginningOfChatHistoryPolicyExpenseChatParams,
    BeginningOfChatHistoryUserRoomParams,
    BillableDefaultDescriptionParams,
    BillingBannerCardAuthenticationRequiredParams,
    BillingBannerCardExpiredParams,
    BillingBannerCardOnDisputeParams,
    BillingBannerDisputePendingParams,
    BillingBannerInsufficientFundsParams,
    BillingBannerOwnerAmountOwedOverdueParams,
    BillingBannerSubtitleWithDateParams,
    BusinessBankAccountParams,
    BusinessRegistrationNumberParams,
    BusinessTaxIDParams,
    CanceledRequestParams,
    CardEndingParams,
    CardInfoParams,
    CardNextPaymentParams,
    CategoryNameParams,
    ChangedApproverMessageParams,
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
    ContactMethodParams,
    ContactMethodsRouteParams,
    CreateExpensesParams,
    CurrencyCodeParams,
    CurrencyInputDisabledTextParams,
    CustomersOrJobsLabelParams,
    DateParams,
    DateShouldBeAfterParams,
    DateShouldBeBeforeParams,
    DefaultAmountParams,
    DefaultVendorDescriptionParams,
    DelegateRoleParams,
    DelegatorParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    DeleteTransactionParams,
    DemotedFromWorkspaceParams,
    DependentMultiLevelTagsSubtitleParams,
    DidSplitAmountMessageParams,
    DisconnectYourBankAccountParams,
    DomainPermissionInfoRestrictionParams,
    DuplicateTransactionParams,
    EarlyDiscountSubtitleParams,
    EarlyDiscountTitleParams,
    EditActionParams,
    EditDestinationSubtitleParams,
    ElectronicFundsParams,
    EmployeeInviteMessageParams,
    EmptyCategoriesSubtitleWithAccountingParams,
    EmptyTagsSubtitleWithAccountingParams,
    EnableContinuousReconciliationParams,
    EnterMagicCodeParams,
    ErrorODIntegrationParams,
    ExportAgainModalDescriptionParams,
    ExportedToIntegrationParams,
    ExportIntegrationSelectedParams,
    FeatureNameParams,
    FileLimitParams,
    FileTypeParams,
    FiltersAmountBetweenParams,
    FlightLayoverParams,
    FlightParams,
    FocusModeUpdateParams,
    FormattedMaxLengthParams,
    GoBackMessageParams,
    ImportedTagsMessageParams,
    ImportedTypesParams,
    ImportFieldParams,
    ImportMembersSuccessfulDescriptionParams,
    ImportPerDiemRatesSuccessfulDescriptionParams,
    ImportTagsSuccessfulDescriptionParams,
    IncorrectZipFormatParams,
    IndividualExpenseRulesSubtitleParams,
    InstantSummaryParams,
    IntacctMappingTitleParams,
    IntegrationExportParams,
    IntegrationSyncFailedParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IssueVirtualCardParams,
    LastSyncAccountingParams,
    LastSyncDateParams,
    LearnMoreRouteParams,
    LeftWorkspaceParams,
    LocalTimeParams,
    LoggedInAsParams,
    LogSizeParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    MergeAccountIntoParams,
    MergeFailureDescriptionGenericParams,
    MergeFailureUncreatedAccountDescriptionParams,
    MergeSuccessDescriptionParams,
    MissingPropertyParams,
    MovedActionParams,
    MovedFromPersonalSpaceParams,
    MovedFromReportParams,
    MovedTransactionParams,
    NeedCategoryForExportToIntegrationParams,
    NewWorkspaceNameParams,
    NextStepParams,
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
    PayAndDowngradeDescriptionParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    PaySomeoneParams,
    PhoneErrorRouteParams,
    PolicyAddedReportFieldOptionParams,
    PolicyDisabledReportFieldAllOptionsParams,
    PolicyDisabledReportFieldOptionParams,
    PolicyExpenseChatNameParams,
    QBDSetupErrorBodyParams,
    RailTicketParams,
    ReceiptPartnersUberSubtitleParams,
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
    ReportFieldParams,
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
    RulesEnableWorkflowsParams,
    SecondaryLoginParams,
    SetTheDistanceMerchantParams,
    SetTheRequestParams,
    SettledAfterAddedBankAccountParams,
    SettleExpensifyCardParams,
    SettlementAccountInfoParams,
    SettlementAccountReconciliationParams,
    SettlementDateParams,
    ShareParams,
    SignerInfoMessageParams,
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
    SubmittedToVacationDelegateParams,
    SubmittedWithMemoParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsRenewsOnParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSettingsSummaryParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
    TagSelectionParams,
    TaskCreatedActionParams,
    TaxAmountParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    ToggleImportTitleParams,
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
    UpdatedPolicyReimbursementEnabledParams,
    UpdatedPolicyReportFieldDefaultValueParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagParams,
    UpdatedPolicyTaxParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdatePolicyCustomUnitParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    UpdateRoleParams,
    UpgradeSuccessMessageParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    VacationDelegateParams,
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
    WalletAgreementParams,
    WalletProgramParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    WeSentYouMagicSignInLinkParams,
    WorkEmailMergingBlockedParams,
    WorkEmailResendCodeParams,
    WorkflowSettingsParam,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceMembersCountParams,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    WorkspaceRouteParams,
    WorkspaceShareNoteParams,
    WorkspacesListRouteParams,
    WorkspaceUpgradeNoteParams,
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
const translations: TranslationDeepObject<typeof en> = {
    common: {
        count: 'Zählen',
        cancel: 'Abbrechen',
        dismiss: 'Verwerfen',
        proceed: 'Fortfahren',
        yes: 'Ja',
        no: 'Nein',
        ok: 'OK',
        notNow: 'Nicht jetzt',
        noThanks: 'Nein danke',
        learnMore: 'Mehr erfahren',
        buttonConfirm: 'Verstanden',
        name: 'Name',
        attachment: 'Anhang',
        attachments: 'Anhänge',
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
        next: 'Nächste',
        previous: 'Vorherige',
        goBack: 'Zurückgehen',
        create: 'Erstellen',
        add: 'Hinzufügen',
        resend: 'Erneut senden',
        save: 'Speichern',
        select: 'Auswählen',
        deselect: 'Abwählen',
        selectMultiple: 'Mehrere auswählen',
        saveChanges: 'Änderungen speichern',
        submit: 'Einreichen',
        submitted: 'Eingereicht',
        rotate: 'Drehen',
        zoom: 'Zoom',
        password: 'Passwort',
        magicCode: 'Verifizierungscode',
        twoFactorCode: 'Zwei-Faktor-Code',
        workspaces: 'Arbeitsbereiche',
        inbox: 'Posteingang',
        success: 'Erfolgreich',
        group: 'Gruppe',
        profile: 'Profil',
        referral: 'Empfehlung',
        payments: 'Zahlungen',
        approvals: 'Genehmigungen',
        wallet: 'Brieftasche',
        preferences: 'Einstellungen',
        view: 'Ansicht',
        review: (reviewParams?: ReviewParams) => `Überprüfen${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
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
        hidden: 'Versteckt',
        visible: 'Sichtbar',
        delete: 'Löschen',
        archived: 'archiviert',
        contacts: 'Kontakte',
        recents: 'Zuletzt verwendet',
        close: 'Schließen',
        comment: 'Kommentar',
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
        ssnLast4: 'Letzte 4 Ziffern der SSN',
        ssnFull9: 'Vollständige 9 Ziffern der SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Adresszeile ${lineNumber}`,
        personalAddress: 'Persönliche Adresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Keine Postfächer oder Postweiterleitungsadressen, bitte.',
        city: 'Stadt',
        state: 'Zustand',
        streetAddress: 'Straßenadresse',
        stateOrProvince: 'Bundesland / Provinz',
        country: 'Land',
        zip: 'Postleitzahl',
        zipPostCode: 'Postleitzahl',
        whatThis: 'Was ist das?',
        iAcceptThe: 'Ich akzeptiere die',
        acceptTermsAndPrivacy: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-Nutzungsbedingungen</a> und <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzrichtlinie</a>`,
        acceptTermsAndConditions: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">Allgemeine Geschäftsbedingungen</a>`,
        acceptTermsOfService: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-Nutzungsbedingungen</a>`,
        remove: 'Entfernen',
        admin: 'Admin',
        owner: 'Eigentümer',
        dateFormat: 'YYYY-MM-DD',
        send: 'Senden',
        na: 'N/A',
        noResultsFound: 'Keine Ergebnisse gefunden',
        noResultsFoundMatching: (searchString: string) => `Keine Ergebnisse gefunden, die mit "${searchString}" übereinstimmen.`,
        recentDestinations: 'Letzte Ziele',
        timePrefix: 'Es ist',
        conjunctionFor: 'für',
        todayAt: 'Heute um',
        tomorrowAt: 'Morgen um',
        yesterdayAt: 'Gestern um',
        conjunctionAt: 'bei',
        conjunctionTo: 'zu',
        genericErrorMessage: 'Ups... etwas ist schiefgelaufen und Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
        percentage: 'Prozentsatz',
        error: {
            invalidAmount: 'Ungültiger Betrag',
            acceptTerms: 'Sie müssen die Nutzungsbedingungen akzeptieren, um fortzufahren.',
            phoneNumber: `Bitte geben Sie eine vollständige Telefonnummer ein\n(z. B. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dieses Feld ist erforderlich',
            requestModified: 'Diese Anfrage wird von einem anderen Mitglied bearbeitet.',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Zeichenlimit überschritten (${length}/${limit})`,
            dateInvalid: 'Bitte wählen Sie ein gültiges Datum aus',
            invalidDateShouldBeFuture: 'Bitte wählen Sie heute oder ein zukünftiges Datum.',
            invalidTimeShouldBeFuture: 'Bitte wählen Sie eine Zeit, die mindestens eine Minute voraus ist.',
            invalidCharacter: 'Ungültiges Zeichen',
            enterMerchant: 'Geben Sie einen Händlernamen ein',
            enterAmount: 'Betrag eingeben',
            missingMerchantName: 'Fehlender Händlername',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Fehlendes Datum',
            enterDate: 'Geben Sie ein Datum ein',
            invalidTimeRange: 'Bitte geben Sie eine Uhrzeit im 12-Stunden-Format ein (z. B. 14:30 Uhr)',
            pleaseCompleteForm: 'Bitte füllen Sie das obige Formular aus, um fortzufahren.',
            pleaseSelectOne: 'Bitte wählen Sie eine der oben genannten Optionen aus.',
            invalidRateError: 'Bitte geben Sie einen gültigen Tarif ein',
            lowRateError: 'Der Satz muss größer als 0 sein.',
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            login: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        comma: 'Komma',
        semicolon: 'Semikolon',
        please: 'Bitte',
        contactUs: 'kontaktieren Sie uns',
        pleaseEnterEmailOrPhoneNumber: 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer ein.',
        fixTheErrors: 'Beheben Sie die Fehler.',
        inTheFormBeforeContinuing: 'im Formular, bevor Sie fortfahren',
        confirm: 'Bestätigen',
        reset: 'Zurücksetzen',
        done: 'Fertiggestellt',
        more: 'Mehr',
        debitCard: 'Debitkarte',
        bankAccount: 'Bankkonto',
        personalBankAccount: 'Persönliches Bankkonto',
        businessBankAccount: 'Geschäftsbankkonto',
        join: 'Beitreten',
        leave: 'Verlassen',
        decline: 'Ablehnen',
        reject: 'Ablehnen',
        transferBalance: 'Guthaben übertragen',
        enterManually: 'Manuell eingeben',
        message: 'Nachricht',
        leaveThread: 'Thread verlassen',
        you: 'Du',
        me: 'mich',
        youAfterPreposition: 'du',
        your: 'Ihr',
        conciergeHelp: 'Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
        youAppearToBeOffline: 'Sie scheinen offline zu sein.',
        thisFeatureRequiresInternet: 'Diese Funktion erfordert eine aktive Internetverbindung.',
        attachmentWillBeAvailableOnceBackOnline: 'Anhang wird verfügbar, sobald die Verbindung wiederhergestellt ist.',
        errorOccurredWhileTryingToPlayVideo: 'Beim Abspielen dieses Videos ist ein Fehler aufgetreten.',
        areYouSure: 'Bist du sicher?',
        verify: 'Überprüfen',
        yesContinue: 'Ja, weiter',
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
        letsStart: `Lass uns anfangen.`,
        showMore: 'Mehr anzeigen',
        merchant: 'Händler',
        category: 'Kategorie',
        report: 'Bericht',
        billable: 'Abrechenbar',
        nonBillable: 'Nicht abrechenbar',
        tag: 'Etikett',
        receipt: 'Beleg',
        verified: 'Verifiziert',
        replace: 'Ersetzen',
        distance: 'Entfernung',
        mile: 'Meile',
        miles: 'Meilen',
        kilometer: 'Kilometer',
        kilometers: 'Kilometer',
        recent: 'Kürzlich',
        all: 'Alle',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Wählen Sie eine Währung aus',
        selectSymbolOrCurrency: 'Wählen Sie ein Symbol oder eine Währung aus',
        card: 'Karte',
        whyDoWeAskForThis: 'Warum fragen wir danach?',
        required: 'Erforderlich',
        showing: 'Anzeigen',
        of: 'von',
        default: 'Standardmäßig',
        update: 'Aktualisieren',
        member: 'Mitglied',
        auditor: 'Prüfer',
        role: 'Rolle',
        currency: 'Währung',
        groupCurrency: 'Konzernwährung',
        rate: 'Bewerten',
        emptyLHN: {
            title: 'Woohoo! Alles erledigt.',
            subtitleText1: 'Finden Sie einen Chat mit dem',
            subtitleText2: 'Schaltfläche oben oder erstellen Sie etwas mit dem',
            subtitleText3: 'Schaltfläche unten.',
        },
        businessName: 'Firmenname',
        clear: 'Klar',
        type: 'Typ',
        action: 'Aktion',
        expenses: 'Ausgaben',
        totalSpend: 'Gesamtausgaben',
        tax: 'Steuer',
        shared: 'Geteilt',
        drafts: 'Entwürfe',
        draft: 'Entwurf',
        finished: 'Fertiggestellt',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Arbeitsbereich herabstufen',
        companyID: 'Unternehmens-ID',
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
        withdrawalID: 'Auszahlungs-ID',
        bankAccounts: 'Bankkonten',
        chooseFile: 'Datei auswählen',
        chooseFiles: 'Dateien auswählen',
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        ignore: 'Ignorieren',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        import: 'Importieren',
        offlinePrompt: 'Sie können diese Aktion momentan nicht ausführen.',
        outstanding: 'Ausstehend',
        chats: 'Chats',
        tasks: 'Aufgaben',
        unread: 'Ungelesen',
        sent: 'Gesendet',
        links: 'Links',
        day: 'Tag',
        days: 'Tage',
        rename: 'Umbenennen',
        address: 'Adresse',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Überspringen',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Brauchen Sie etwas Bestimmtes? Chatten Sie mit Ihrem Kundenbetreuer, ${accountManagerDisplayName}.`,
        chatNow: 'Jetzt chatten',
        workEmail: 'Geschäftliche E-Mail-Adresse',
        destination: 'Zielort',
        subrate: 'Subrate',
        perDiem: 'Tagegeld',
        validate: 'Validieren',
        downloadAsPDF: 'Als PDF herunterladen',
        downloadAsCSV: 'Als CSV herunterladen',
        help: 'Hilfe',
        expenseReport: 'Spesenabrechnung',
        expenseReports: 'Spesenabrechnungen',
        leaveWorkspace: 'Arbeitsbereich verlassen',
        leaveWorkspaceConfirmation: 'Wenn du diesen Arbeitsbereich verlässt, kannst du keine Ausgaben mehr dafür einreichen.',
        leaveWorkspaceConfirmationAuditor: 'Wenn du diesen Arbeitsbereich verlässt, kannst du die Berichte und Einstellungen dieses Arbeitsbereichs nicht mehr einsehen.',
        leaveWorkspaceConfirmationAdmin: 'Wenn du diesen Arbeitsbereich verlässt, kannst du dessen Einstellungen nicht mehr verwalten.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Arbeitsbereich verlässt, wirst du im Genehmigungs-Workflow durch ${workspaceOwner}, den/die Inhaber:in des Arbeitsbereichs, ersetzt.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Arbeitsbereich verlässt, wirst du als bevorzugter Exporteur durch ${workspaceOwner}, den Inhaber des Arbeitsbereichs, ersetzt.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Arbeitsbereich verlässt, wirst du als technischer Ansprechpartner durch ${workspaceOwner}, den Arbeitsbereichsinhaber, ersetzt.`,
        leaveWorkspaceReimburser:
            'Du kannst diesen Arbeitsbereich als erstattende Person nicht verlassen. Bitte lege unter Arbeitsbereiche > Zahlungen tätigen oder nachverfolgen eine neue erstattende Person fest und versuche es dann erneut.',
        rateOutOfPolicy: 'Satz außerhalb der Richtlinien',
        reimbursable: 'Erstattungsfähig',
        editYourProfile: 'Bearbeiten Sie Ihr Profil',
        comments: 'Kommentare',
        sharedIn: 'Geteilt in',
        unreported: 'Nicht gemeldet',
        explore: 'Erkunden',
        todo: 'Aufgabe',
        invoice: 'Rechnung',
        expense: 'Ausgabe',
        chat: 'Chat',
        task: 'Aufgabe',
        trip: 'Reise',
        apply: 'Anwenden',
        status: 'Status',
        on: 'An',
        before: 'Vorher',
        after: 'Nach',
        reschedule: 'Verschieben',
        general: 'Allgemein',
        workspacesTabTitle: 'Arbeitsbereiche',
        headsUp: 'Achtung!',
        submitTo: 'Einreichen an',
        forwardTo: 'Weiterleiten an',
        merge: 'Zusammenführen',
        none: 'Keine',
        unstableInternetConnection: 'Instabile Internetverbindung. Bitte überprüfe dein Netzwerk und versuche es erneut.',
        enableGlobalReimbursements: 'Globale Rückerstattungen aktivieren',
        purchaseAmount: 'Kaufbetrag',
        frequency: 'Frequenz',
        link: 'Link',
        pinned: 'Angeheftet',
        read: 'Gelesen',
        copyToClipboard: 'In die Zwischenablage kopieren',
        thisIsTakingLongerThanExpected: 'Das dauert länger als erwartet...',
        domains: 'Domänen',
        reportName: 'Berichtsname',
        showLess: 'Weniger anzeigen',
        actionRequired: 'Erforderliche Aktion',
    },
    supportalNoAccess: {
        title: 'Nicht so schnell',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Sie sind nicht berechtigt, diese Aktion auszuführen, wenn der Support eingeloggt ist (Befehl: ${command ?? ''}). Wenn Sie der Meinung sind, dass Success diese Aktion ausführen können sollte, starten Sie bitte eine Unterhaltung in Slack.`,
    },
    lockedAccount: {
        title: 'Gesperrtes Konto',
        description: 'Sie dürfen diese Aktion nicht ausführen, da dieses Konto gesperrt wurde. Bitte wenden Sie sich an concierge@expensify.com für weitere Schritte.',
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
        importContactsText: 'Importieren Sie Kontakte von Ihrem Telefon, damit Ihre Lieblingspersonen immer nur einen Fingertipp entfernt sind.',
        importContactsExplanation: 'damit deine Lieblingspersonen immer nur einen Fingertipp entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Geben Sie uns grünes Licht, um Ihre Kontakte zu importieren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Nimm an der Diskussion teil.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Kamerazugriff',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kann ohne Zugriff auf Ihre Kamera keine Fotos aufnehmen. Tippen Sie auf Einstellungen, um die Berechtigungen zu aktualisieren.',
        attachmentError: 'Anlagenfehler',
        errorWhileSelectingAttachment: 'Beim Auswählen eines Anhangs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        errorWhileSelectingCorruptedAttachment: 'Beim Auswählen eines beschädigten Anhangs ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einer anderen Datei.',
        takePhoto: 'Foto machen',
        chooseFromGallery: 'Aus Galerie auswählen',
        chooseDocument: 'Datei auswählen',
        attachmentTooLarge: 'Anhang ist zu groß',
        sizeExceeded: 'Die Anhangsgröße überschreitet das Limit von 24 MB.',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Die Anhangsgröße überschreitet das Limit von ${maxUploadSizeInMB} MB.`,
        attachmentTooSmall: 'Anhang ist zu klein',
        sizeNotMet: 'Anhangsgröße muss größer als 240 Bytes sein',
        wrongFileType: 'Ungültiger Dateityp',
        notAllowedExtension: 'Dieser Dateityp ist nicht erlaubt. Bitte versuchen Sie es mit einem anderen Dateityp.',
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuchen Sie es mit einer anderen Datei.',
        protectedPDFNotSupported: 'Passwortgeschütztes PDF wird nicht unterstützt',
        attachmentImageResized: 'Dieses Bild wurde zur Vorschaugröße angepasst. Herunterladen für volle Auflösung.',
        attachmentImageTooLarge: 'Dieses Bild ist zu groß, um es vor dem Hochladen in der Vorschau anzuzeigen.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Sie können jeweils nur bis zu ${fileLimit} Dateien hochladen.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien überschreiten ${maxUploadSizeInMB} MB. Bitte versuchen Sie es erneut.`,
        someFilesCantBeUploaded: 'Einige Dateien können nicht hochgeladen werden',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien müssen unter ${maxUploadSizeInMB} MB sein. Größere Dateien werden nicht hochgeladen.`,
        maxFileLimitExceeded: 'Sie können bis zu 30 Belege gleichzeitig hochladen. Weitere werden nicht hochgeladen.',
        unsupportedFileType: ({fileType}: FileTypeParams) => `${fileType} Dateien werden nicht unterstützt. Nur unterstützte Dateitypen werden hochgeladen.`,
        learnMoreAboutSupportedFiles: 'Erfahren Sie mehr über unterstützte Formate.',
        passwordProtected: 'Passwortgeschützte PDFs werden nicht unterstützt. Nur unterstützte Dateien werden hochgeladen.',
    },
    dropzone: {
        addAttachments: 'Anhänge hinzufügen',
        addReceipt: 'Beleg hinzufügen',
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
        description: 'Ziehen, zoomen und drehen Sie Ihr Bild, wie Sie möchten.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Keine Erweiterung für den MIME-Typ gefunden',
        problemGettingImageYouPasted: 'Es gab ein Problem beim Abrufen des Bildes, das Sie eingefügt haben.',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Die maximale Kommentarlänge beträgt ${formattedMaxLength} Zeichen.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Die maximale Länge des Aufgabentitels beträgt ${formattedMaxLength} Zeichen.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App aktualisieren',
        updatePrompt: 'Eine neue Version dieser App ist verfügbar. Aktualisieren Sie jetzt oder starten Sie die App später neu, um die neuesten Änderungen herunterzuladen.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wird gestartet',
        expired: 'Ihre Sitzung ist abgelaufen.',
        signIn: 'Bitte melden Sie sich erneut an.',
        redirectedToDesktopApp: 'Wir haben Sie zur Desktop-App weitergeleitet.',
        youCanAlso: 'Sie können auch',
        openLinkInBrowser: 'öffnen Sie diesen Link in Ihrem Browser',
        loggedInAs: ({email}: LoggedInAsParams) => `Sie sind als ${email} angemeldet. Klicken Sie im Hinweis auf "Link öffnen", um sich mit diesem Konto in der Desktop-App anzumelden.`,
        doNotSeePrompt: 'Kannst du die Eingabeaufforderung nicht sehen?',
        tryAgain: 'Versuchen Sie es erneut.',
        or: ', oder',
        continueInWeb: 'weiter zur Web-App',
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abrakadabra,
            du bist angemeldet!
        `),
        successfulSignInDescription: 'Gehe zurück zu deinem ursprünglichen Tab, um fortzufahren.',
        title: 'Hier ist dein magischer Code',
        description: dedent(`
            Bitte geben Sie den Code auf dem Gerät ein,
            auf dem er ursprünglich angefordert wurde
        `),
        doNotShare: dedent(`
            Teilen Sie Ihren Code mit niemandem.
            Expensify wird Sie niemals danach fragen!
        `),
        or: ', oder',
        signInHere: 'einfach hier anmelden',
        expiredCodeTitle: 'Magischer Code abgelaufen',
        expiredCodeDescription: 'Gehen Sie zurück zum ursprünglichen Gerät und fordern Sie einen neuen Code an.',
        successfulNewCodeRequest: 'Code angefordert. Bitte überprüfen Sie Ihr Gerät.',
        tfaRequiredTitle: dedent(`
            Zwei-Faktor-Authentifizierung
            erforderlich
        `),
        tfaRequiredDescription: dedent(`
            Bitte geben Sie den Zwei-Faktor-Authentifizierungscode ein
            dort, wo Sie sich anmelden möchten.
        `),
        requestOneHere: 'hier eine anfordern.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Bezahlt von',
        whatsItFor: 'Wofür ist das?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Name, E-Mail oder Telefonnummer',
        findMember: 'Mitglied finden',
        searchForSomeone: 'Suche nach jemandem',
    },
    customApprovalWorkflow: {
        title: 'Benutzerdefinierter Genehmigungsworkflow',
        description: 'Ihr Unternehmen hat einen benutzerdefinierten Genehmigungsworkflow für diesen Arbeitsbereich. Bitte führen Sie diese Aktion in Expensify Classic aus',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Reichen Sie eine Ausgabe ein, verweisen Sie auf Ihre Team.',
            subtitleText: 'Möchten Sie, dass Ihr Chef auch Expensify nutzt? Reichen Sie einfach eine Ausgabe bei ihnen ein und wir kümmern uns um den Rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Einen Anruf buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Unten beginnen.',
        anotherLoginPageIsOpen: 'Eine weitere Anmeldeseite ist geöffnet.',
        anotherLoginPageIsOpenExplanation: 'Sie haben die Anmeldeseite in einem separaten Tab geöffnet. Bitte melden Sie sich von diesem Tab aus an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht. Und jetzt, da Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Ihre Zahlungen erreichen Sie so schnell, wie Sie Ihren Standpunkt vermitteln können.',
        enterPassword: 'Bitte geben Sie Ihr Passwort ein',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, es ist immer schön, ein neues Gesicht hier zu sehen!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${login} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
    },
    login: {
        hero: {
            header: 'Reisen und Ausgaben, in der Geschwindigkeit des Chats',
            body: 'Willkommen bei der nächsten Generation von Expensify, wo Ihre Reisen und Ausgaben mit Hilfe von kontextuellem, Echtzeit-Chat schneller werden.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Sie sind bereits als ${email} angemeldet.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Möchten Sie sich nicht mit ${provider} anmelden?`,
        continueWithMyCurrentSession: 'Mit meiner aktuellen Sitzung fortfahren',
        redirectToDesktopMessage: 'Wir leiten Sie zur Desktop-App weiter, sobald Sie sich angemeldet haben.',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Weiter mit Single Sign-On anmelden:',
        orContinueWithMagicCode: 'Sie können sich auch mit einem magischen Code anmelden.',
        useSingleSignOn: 'Einmalanmeldung verwenden',
        useMagicCode: 'Verwende magischen Code',
        launching: 'Starten...',
        oneMoment: 'Einen Moment bitte, während wir Sie zum Single-Sign-On-Portal Ihres Unternehmens weiterleiten.',
    },
    reportActionCompose: {
        dropToUpload: 'Zum Hochladen hierher ziehen',
        sendAttachment: 'Anhang senden',
        addAttachment: 'Anhang hinzufügen',
        writeSomething: 'Schreiben Sie etwas...',
        blockedFromConcierge: 'Kommunikation ist gesperrt',
        fileUploadFailed: 'Hochladen fehlgeschlagen. Datei wird nicht unterstützt.',
        localTime: ({user, time}: LocalTimeParams) => `Es ist ${time} für ${user}`,
        edited: '(bearbeitet)',
        emoji: 'Emoji',
        collapse: 'Einklappen',
        expand: 'Erweitern',
    },
    reportActionContextMenu: {
        copyMessage: 'Nachricht kopieren',
        copied: 'Kopiert!',
        copyLink: 'Link kopieren',
        copyURLToClipboard: 'URL in die Zwischenablage kopieren',
        copyEmailToClipboard: 'E-Mail in die Zwischenablage kopieren',
        markAsUnread: 'Als ungelesen markieren',
        markAsRead: 'Als gelesen markieren',
        editAction: ({action}: EditActionParams) => `Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'kommentar';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'ausgabe';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'bericht';
            }
            return `Löschen ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'kommentar';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'ausgabe';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'bericht';
            }
            return `Möchten Sie dieses ${type} wirklich löschen?`;
        },
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
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `Du hast die Party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> verpasst, hier gibt es nichts zu sehen.`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `Dieser Chat ist für alle Expensify-Mitglieder auf der <strong>${domainRoom}</strong>-Domain. Nutzen Sie ihn, um mit Kollegen zu chatten, Tipps auszutauschen und Fragen zu stellen.`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `Dieser Chat ist mit dem <strong>${workspaceName}</strong>-Administrator. Nutzen Sie ihn, um über die Einrichtung von Arbeitsbereichen und mehr zu sprechen.`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `Dieser Chat ist für alle im <strong>${workspaceName}</strong>. Benutze ihn für die wichtigsten Ankündigungen.`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `Dieser Chatraum ist für alles, was mit <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> zu tun hat.`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `Dieser Chat ist für Rechnungen zwischen <strong>${invoicePayer}</strong> und <strong>${invoiceReceiver}</strong>. Verwenden Sie die Schaltfläche +, um eine Rechnung zu senden.`,
        beginningOfChatHistory: 'Dieser Chat ist mit',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `Hier wird <strong>${submitterDisplayName}</strong> die Ausgaben an <strong>${workspaceName}</strong> übermitteln. Verwenden Sie einfach die Schaltfläche +.`,
        beginningOfChatHistorySelfDM: 'Dies ist Ihr persönlicher Bereich. Nutzen Sie ihn für Notizen, Aufgaben, Entwürfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Lassen Sie uns mit der Einrichtung beginnen.',
        chatWithAccountManager: 'Hier mit Ihrem Kundenbetreuer chatten',
        sayHello: 'Hallo!',
        yourSpace: 'Ihr Bereich',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Willkommen in ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => ` Verwenden Sie die + Taste, um ${additionalText} einen Ausgabenposten hinzuzufügen.`,
        askConcierge: 'Stellen Sie Fragen und erhalten Sie rund um die Uhr Unterstützung in Echtzeit.',
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
    adminOnlyCanPost: 'Nur Administratoren können Nachrichten in diesem Raum senden.',
    reportAction: {
        asCopilot: 'als Co-Pilot für',
    },
    mentionSuggestions: {
        hereAlternateText: 'Benachrichtige alle in diesem Gespräch',
    },
    newMessages: 'Neue Nachrichten',
    latestMessages: 'Neueste Nachrichten',
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
            `Dieser Chat ist nicht mehr aktiv, weil ${oldDisplayName} ihr Konto mit ${displayName} zusammengeführt hat.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Dieser Chat ist nicht mehr aktiv, weil <strong>Sie</strong> kein Mitglied des ${policyName} Arbeitsbereichs mehr sind.`
                : `Dieser Chat ist nicht mehr aktiv, weil ${displayName} kein Mitglied des Arbeitsbereichs ${policyName} mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${policyName} kein aktiver Arbeitsbereich mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${policyName} kein aktiver Arbeitsbereich mehr ist.`,
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
        fabScanReceiptExplained: 'Kassenbon scannen (Floating Action)',
        chatPinned: 'Chat angeheftet',
        draftedMessage: 'Entwurfene Nachricht',
        listOfChatMessages: 'Liste der Chatnachrichten',
        listOfChats: 'Liste der Chats',
        saveTheWorld: 'Rette die Welt',
        tooltip: 'Hier starten!',
        redirectToExpensifyClassicModal: {
            title: 'Demnächst verfügbar',
            description: 'Wir optimieren noch ein paar Details von New Expensify, um Ihre spezifische Einrichtung zu berücksichtigen. In der Zwischenzeit gehen Sie zu Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domains',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Zimmer',
        distance: 'Entfernung',
        manual: 'Handbuch',
        scan: 'Scannen',
        map: 'Karte',
    },
    spreadsheet: {
        upload: 'Eine Tabelle hochladen',
        import: 'Tabellenkalkulation importieren',
        dragAndDrop: '<muted-link>Ziehen Sie Ihre Tabelle hierher oder wählen Sie unten eine Datei aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Ziehen Sie Ihre Tabelle hierher oder wählen Sie unten eine Datei aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahren Sie mehr</a> über unterstützte Dateiformate.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Wählen Sie eine Tabellenkalkulationsdatei zum Importieren aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Wählen Sie eine Tabellenkalkulationsdatei zum Importieren aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahren Sie mehr</a> über unterstützte Dateiformate.</muted-link>`,
        fileContainsHeader: 'Datei enthält Spaltenüberschriften',
        column: ({name}: SpreadSheetColumnParams) => `Spalte ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Ups! Ein erforderliches Feld ("${fieldName}") wurde nicht zugeordnet. Bitte überprüfen und erneut versuchen.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Ups! Sie haben ein einzelnes Feld ("${fieldName}") mehreren Spalten zugeordnet. Bitte überprüfen Sie dies und versuchen Sie es erneut.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Hoppla! Das Feld („${fieldName}“) enthält einen oder mehrere leere Werte. Bitte überprüfen und erneut versuchen.`,
        importSuccessfulTitle: 'Import erfolgreich',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `${categories} Kategorien wurden hinzugefügt.` : '1 Kategorie wurde hinzugefügt.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Keine Mitglieder wurden hinzugefügt oder aktualisiert.';
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
            rates > 1 ? `${rates} Tagespauschalen wurden hinzugefügt.` : '1 Tagespauschale wurde hinzugefügt.',
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription:
            'Bitte stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind, und versuchen Sie es erneut. Wenn das Problem weiterhin besteht, wenden Sie sich bitte an Concierge.',
        importDescription: 'Wählen Sie aus, welche Felder Sie aus Ihrer Tabelle zuordnen möchten, indem Sie auf das Dropdown-Menü neben jeder importierten Spalte unten klicken.',
        sizeNotMet: 'Die Dateigröße muss größer als 0 Byte sein',
        invalidFileMessage:
            'Die Datei, die Sie hochgeladen haben, ist entweder leer oder enthält ungültige Daten. Bitte stellen Sie sicher, dass die Datei korrekt formatiert ist und die notwendigen Informationen enthält, bevor Sie sie erneut hochladen.',
        importSpreadsheetLibraryError: 'Fehler beim Laden des Tabellenkalkulations-Moduls. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
        importSpreadsheet: 'Tabellenkalkulation importieren',
        downloadCSV: 'CSV herunterladen',
        importMemberConfirmation: () => ({
            one: `Bitte bestätige die folgenden Angaben für ein neues Workspace-Mitglied, das mit diesem Upload hinzugefügt wird. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladungshinweise.`,
            other: (count: number) =>
                `Bitte bestätige die folgenden Angaben für die ${count} neuen Workspace-Mitglieder, die mit diesem Upload hinzugefügt werden. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladungshinweise.`,
        }),
    },
    receipt: {
        upload: 'Beleg hochladen',
        uploadMultiple: 'Belege hochladen',
        desktopSubtitleSingle: `oder hierher ziehen und ablegen`,
        desktopSubtitleMultiple: `oder hierher ziehen und ablegen`,
        alternativeMethodsTitle: 'Andere Möglichkeiten, Belege hinzuzufügen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">App herunterladen</a>, um mit Ihrem Telefon zu scannen</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Leiten Sie Belege an <a href="mailto:${email}">${email}</a> weiter</label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Fügen Sie Ihre Nummer hinzu</a>, um Belege an ${phoneNumber} zu senden</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Senden Sie Belege per SMS an ${phoneNumber} (nur US-Nummern)</label-text>`,
        takePhoto: 'Ein Foto machen',
        cameraAccess: 'Der Kamerazugriff ist erforderlich, um Fotos von Belegen zu machen.',
        deniedCameraAccess: `Kamerazugriff wurde noch nicht gewährt, bitte folgen Sie <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">diese Anweisungen</a>.`,
        cameraErrorTitle: 'Kamerafehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        locationAccessTitle: 'Standortzugriff erlauben',
        locationAccessMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall genau zu halten, wohin Sie auch gehen.',
        locationErrorTitle: 'Standortzugriff erlauben',
        locationErrorMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall genau zu halten, wohin Sie auch gehen.',
        allowLocationFromSetting: `Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall genau zu halten. Bitte erlauben Sie den Standortzugriff in den Berechtigungseinstellungen Ihres Geräts.`,
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        flash: 'Blitz',
        multiScan: 'Mehrfach-Scan',
        shutter: 'Verschluss',
        gallery: 'Galerie',
        deleteReceipt: 'Beleg löschen',
        deleteConfirmation: 'Möchten Sie diesen Beleg wirklich löschen?',
        addReceipt: 'Beleg hinzufügen',
        scanFailed: 'Der Beleg konnte nicht gescannt werden, da Händler, Datum oder Betrag fehlen.',
    },
    quickAction: {
        scanReceipt: 'Beleg scannen',
        recordDistance: 'Entfernung verfolgen',
        requestMoney: 'Ausgabe erstellen',
        perDiem: 'Tagespauschale erstellen',
        splitBill: 'Ausgabe aufteilen',
        splitScan: 'Beleg aufteilen',
        splitDistance: 'Distanz aufteilen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zahlen Sie ${name ?? 'jemand'}`,
        assignTask: 'Aufgabe zuweisen',
        header: 'Schnelle Aktion',
        noLongerHaveReportAccess: 'Sie haben keinen Zugriff mehr auf Ihr vorheriges Schnellaktionsziel. Wählen Sie unten ein neues aus.',
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
        split: 'Teilen',
        splitExpense: 'Ausgabe aufteilen',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} von ${merchant}`,
        addSplit: 'Split hinzufügen',
        makeSplitsEven: 'Aufteilungen angleichen',
        editSplits: 'Splits bearbeiten',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist ${amount} höher als die ursprüngliche Ausgabe.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist ${amount} weniger als die ursprüngliche Ausgabe.`,
        splitExpenseZeroAmount: 'Bitte geben Sie einen gültigen Betrag ein, bevor Sie fortfahren.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Bearbeiten Sie ${amount} für ${merchant}`,
        splitExpenseOneMoreSplit: 'Keine Aufteilungen hinzugefügt. Fügen Sie mindestens eine hinzu, um zu speichern.',
        removeSplit: 'Aufteilung entfernen',
        splitExpenseCannotBeEditedModalTitle: 'Diese Ausgabe kann nicht bearbeitet werden',
        splitExpenseCannotBeEditedModalDescription: 'Genehmigte oder bezahlte Ausgaben können nicht bearbeitet werden',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zahlen Sie ${name ?? 'jemand'}`,
        expense: 'Ausgabe',
        categorize: 'Kategorisieren',
        share: 'Teilen',
        participants: 'Teilnehmer',
        createExpense: 'Ausgabe erstellen',
        trackDistance: 'Entfernung verfolgen',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Erstelle ${expensesNumber} Ausgaben`,
        removeExpense: 'Ausgabe entfernen',
        removeThisExpense: 'Diese Ausgabe entfernen',
        removeExpenseConfirmation: 'Sind Sie sicher, dass Sie diesen Beleg entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        addExpense: 'Ausgabe hinzufügen',
        chooseRecipient: 'Empfänger auswählen',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Erstelle ${amount} Ausgabe`,
        confirmDetails: 'Details bestätigen',
        pay: 'Bezahlen',
        cancelPayment: 'Zahlung stornieren',
        cancelPaymentConfirmation: 'Möchten Sie diese Zahlung wirklich stornieren?',
        viewDetails: 'Details anzeigen',
        pending: 'Ausstehend',
        canceled: 'Abgebrochen',
        posted: 'Gepostet',
        deleteReceipt: 'Beleg löschen',
        findExpense: 'Ausgabe finden',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `hat eine Ausgabe gelöscht (${amount} für ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `verschob eine Ausgabe${reportName ? `von ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `verschob diese Ausgabe${reportName ? `to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `diese Ausgabe in Ihren <a href="${reportUrl}">persönlichen Bereich</a> verschoben`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `hat diesen Bericht in den <a href="${newParentReportUrl}">${toPolicyName}</a> Workspace verschoben`;
            }
            return `hat diesen <a href="${movedReportUrl}">Bericht</a> in den <a href="${newParentReportUrl}">${toPolicyName}</a> Workspace verschoben`;
        },
        pendingMatchWithCreditCard: 'Beleg steht aus, um mit Kartentransaktion abgeglichen zu werden',
        pendingMatch: 'Ausstehende Übereinstimmung',
        pendingMatchWithCreditCardDescription: 'Beleg wartet auf Abgleich mit Kartentransaktion. Als Barzahlung markieren, um abzubrechen.',
        markAsCash: 'Als Barzahlung markieren',
        routePending: 'Route wird bearbeitet...',
        receiptScanning: () => ({
            one: 'Beleg scannen...',
            other: 'Belege werden gescannt...',
        }),
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Machen Sie Fotos von all Ihren Belegen auf einmal, dann bestätigen Sie die Details selbst oder lassen Sie SmartScan dies übernehmen.',
        receiptScanInProgress: 'Belegscan läuft',
        receiptScanInProgressDescription: 'Belegscan läuft. Später erneut prüfen oder die Details jetzt eingeben.',
        removeFromReport: 'Ausgabe aus Bericht entfernen',
        moveToPersonalSpace: 'Ausgaben in persönlichen Bereich verschieben',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Mögliche doppelte Ausgaben erkannt. Überprüfen Sie die Duplikate, um die Einreichung zu ermöglichen.'
                : 'Potenzielle doppelte Ausgaben erkannt. Überprüfen Sie die Duplikate, um die Genehmigung zu ermöglichen.',
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
        receiptStatusText: 'Nur Sie können diese Quittung sehen, während sie gescannt wird. Schauen Sie später noch einmal vorbei oder geben Sie die Details jetzt ein.',
        receiptScanningFailed: 'Beleg-Scan fehlgeschlagen. Bitte geben Sie die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Es kann ein paar Tage dauern, bis sie verbucht wird.',
        companyInfo: 'Unternehmensinformationen',
        companyInfoDescription: 'Wir benötigen noch ein paar weitere Details, bevor Sie Ihre erste Rechnung senden können.',
        yourCompanyName: 'Ihr Firmenname',
        yourCompanyWebsite: 'Ihre Firmenwebsite',
        yourCompanyWebsiteNote: 'Wenn Sie keine Website haben, können Sie stattdessen das LinkedIn-Profil oder das Social-Media-Profil Ihres Unternehmens angeben.',
        invalidDomainError: 'Sie haben eine ungültige Domain eingegeben. Um fortzufahren, geben Sie bitte eine gültige Domain ein.',
        publicDomainError: 'Sie haben eine öffentliche Domain betreten. Um fortzufahren, geben Sie bitte eine private Domain ein.',
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
            one: 'Möchten Sie diesen Ausgabenposten wirklich löschen?',
            other: 'Möchten Sie diese Ausgaben wirklich löschen?',
        }),
        deleteReport: 'Bericht löschen',
        deleteReportConfirmation: 'Möchten Sie diesen Bericht wirklich löschen?',
        settledExpensify: 'Bezahlt',
        done: 'Fertiggestellt',
        settledElsewhere: 'Anderswo bezahlt',
        individual: 'Individuum',
        business: 'Geschäft',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Bezahle ${formattedAmount} mit Expensify` : `Mit Expensify bezahlen`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Bezahle ${formattedAmount} als Privatperson` : `Mit Privatkonto bezahlen`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Bezahle ${formattedAmount} mit Wallet` : `Mit Wallet bezahlen`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zahlen Sie ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Bezahle ${formattedAmount} als Unternehmen` : `Mit Geschäftskonto bezahlen`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als bezahlt markieren` : `Als bezahlt markieren`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount} mit Privatkonto ${last4Digits} bezahlt` : `Mit Privatkonto bezahlt`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount} mit Geschäftskonto ${last4Digits} bezahlt` : `Mit Geschäftskonto bezahlt`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `${formattedAmount} über ${policyName} bezahlen` : `Über ${policyName} bezahlen`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount} mit Bankkonto ${last4Digits} bezahlt.` : `mit Bankkonto ${last4Digits} bezahlt.`),
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `heeft ${amount} betaald met bankrekening ${last4Digits}. via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimte regels</a>`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Privatkonto • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Geschäftskonto • ${lastFour}`,
        nextStep: 'Nächste Schritte',
        finished: 'Fertiggestellt',
        flip: 'Umkehren',
        sendInvoice: ({amount}: RequestAmountParams) => `Sende ${amount} Rechnung`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `für ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `eingereicht${memo ? `, sagte ${memo}` : ''}`,
        automaticallySubmitted: `über <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">verzögerte Einreichungen</a> eingereicht`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `tracking ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `teilen ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Ihr Anteil ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} schuldet ${amount}${comment ? `für ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} schuldet:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}hat ${amount} bezahlt`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} hat bezahlt:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} hat ${amount} ausgegeben`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} hat ausgegeben:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} genehmigt:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} hat ${amount} genehmigt`,
        payerSettled: ({amount}: PayerSettledParams) => `bezahlt ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `bezahlt ${amount}. Fügen Sie ein Bankkonto hinzu, um Ihre Zahlung zu erhalten.`,
        automaticallyApproved: `genehmigt über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `genehmigt ${amount}`,
        approvedMessage: `genehmigt`,
        unapproved: `nicht genehmigt`,
        automaticallyForwarded: `genehmigt über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a>`,
        forwarded: `genehmigt`,
        rejectedThisReport: 'diesen Bericht abgelehnt',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `hat die Zahlung gestartet, wartet aber darauf, dass ${submitterDisplayName} ein Bankkonto hinzufügt.`,
        adminCanceledRequest: 'hat die Zahlung storniert',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `hat die Zahlung von ${amount} storniert, weil ${submitterDisplayName} ihre Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} hat ein Bankkonto hinzugefügt. Die Zahlung von ${amount} wurde geleistet.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}als bezahlt markiert`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}mit Wallet bezahlt`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} mit Expensify über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a> bezahlt`,
        noReimbursableExpenses: 'Dieser Bericht hat einen ungültigen Betrag.',
        pendingConversionMessage: 'Der Gesamtbetrag wird aktualisiert, wenn Sie wieder online sind.',
        changedTheExpense: 'die Ausgabe geändert',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `der ${valueName} zu ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `setzen Sie das ${translatedChangedField} auf ${newMerchant}, was den Betrag auf ${newAmountToDisplay} festlegt`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `der ${valueName} (früher ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `der ${valueName} zu ${newValueToDisplay} (zuvor ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `änderte das ${translatedChangedField} zu ${newMerchant} (zuvor ${oldMerchant}), wodurch der Betrag auf ${newAmountToDisplay} aktualisiert wurde (zuvor ${oldAmountToDisplay})`,
        basedOnAI: 'basierend auf früheren Aktivitäten',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `gemäß den <a href="${rulesLink}">Regeln des Arbeitsbereichs</a>` : 'gemäß der Arbeitsbereichsregel'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `für ${comment}` : 'Ausgabe'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rechnungsbericht Nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} gesendet${comment ? `für ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `verschobene Ausgabe von persönlichem Bereich zu ${workspaceName ?? `chatten mit ${reportName}`}`,
        movedToPersonalSpace: 'Ausgabe in den persönlichen Bereich verschoben',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => `Wählen Sie ${policyTagListName ?? 'ein Tag'}, um Ihre Ausgaben besser zu organisieren.`,
        categorySelection: 'Wählen Sie eine Kategorie, um Ihre Ausgaben besser zu organisieren.',
        error: {
            invalidCategoryLength: 'Der Kategoriename überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie eine andere Kategorie.',
            invalidTagLength: 'Der Tag-Name überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie einen anderen Tag.',
            invalidAmount: 'Bitte geben Sie einen gültigen Betrag ein, bevor Sie fortfahren.',
            invalidDistance: 'Bitte geben Sie eine gültige Entfernung ein, bevor Sie fortfahren',
            invalidIntegerAmount: 'Bitte geben Sie einen ganzen Dollarbetrag ein, bevor Sie fortfahren.',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Der maximale Steuerbetrag beträgt ${amount}`,
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen.',
            invalidSplitParticipants: 'Bitte geben Sie einen Betrag größer als null für mindestens zwei Teilnehmer ein.',
            invalidSplitYourself: 'Bitte geben Sie einen Betrag ungleich null für Ihre Aufteilung ein.',
            noParticipantSelected: 'Bitte wählen Sie einen Teilnehmer aus',
            other: 'Unerwarteter Fehler. Bitte versuchen Sie es später noch einmal.',
            genericCreateFailureMessage: 'Unerwarteter Fehler beim Einreichen dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuchen Sie es später erneut.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler beim Halten dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Entfernen dieser Ausgabe von der Warteschleife. Bitte versuchen Sie es später erneut.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim Löschen dieser Quittung. Bitte versuchen Sie es später erneut.',
            receiptFailureMessage:
                '<rbr>Beim Hochladen Ihrer Quittung ist ein Fehler aufgetreten. Bitte <a href="download">den Beleg speichern</a> und <a href="retry">es erneut versuchen</a> später.</rbr>',
            receiptFailureMessageShort: 'Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim Löschen dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericSmartscanFailureMessage: 'Transaktion fehlt Felder',
            duplicateWaypointsErrorMessage: 'Bitte entfernen Sie doppelte Wegpunkte',
            atLeastTwoDifferentWaypoints: 'Bitte geben Sie mindestens zwei verschiedene Adressen ein.',
            splitExpenseMultipleParticipantsErrorMessage:
                'Eine Ausgabe kann nicht zwischen einem Arbeitsbereich und anderen Mitgliedern aufgeteilt werden. Bitte aktualisieren Sie Ihre Auswahl.',
            invalidMerchant: 'Bitte geben Sie einen gültigen Händler ein',
            atLeastOneAttendee: 'Mindestens ein Teilnehmer muss ausgewählt werden.',
            invalidQuantity: 'Bitte geben Sie eine gültige Menge ein',
            quantityGreaterThanZero: 'Die Menge muss größer als null sein',
            invalidSubrateLength: 'Es muss mindestens einen Untertarif geben.',
            invalidRate: 'Der Tarif ist für diesen Arbeitsbereich nicht gültig. Bitte wählen Sie einen verfügbaren Tarif aus dem Arbeitsbereich aus.',
        },
        dismissReceiptError: 'Fehler ignorieren',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn Sie diesen Fehler ignorieren, wird Ihre hochgeladene Quittung vollständig entfernt. Sind Sie sicher?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `hat begonnen, die Abrechnung vorzunehmen. Die Zahlung wird zurückgehalten, bis ${submitterDisplayName} ihre Wallet aktiviert.`,
        enableWallet: 'Wallet aktivieren',
        hold: 'Halten',
        unhold: 'Halten entfernen',
        holdExpense: () => ({
            one: 'Ausgabe zurückhalten',
            other: 'Ausgaben zurückhalten',
        }),
        unholdExpense: 'Ausgabe freigeben',
        heldExpense: 'diese Ausgabe zurückgehalten',
        unheldExpense: 'diese Ausgabe freigegeben',
        moveUnreportedExpense: 'Nicht gemeldete Ausgabe verschieben',
        addUnreportedExpense: 'Nicht gemeldete Ausgabe hinzufügen',
        selectUnreportedExpense: 'Wählen Sie mindestens eine Ausgabe aus, die dem Bericht hinzugefügt werden soll.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Es sieht so aus, als hätten Sie keine nicht gemeldeten Ausgaben. Versuchen Sie, unten eine zu erstellen.',
        addUnreportedExpenseConfirm: 'Zum Bericht hinzufügen',
        newReport: 'Neuer Bericht',
        explainHold: () => ({
            one: 'Erklären Sie, warum Sie diese Ausgabe zurückhalten.',
            other: 'Erklären Sie, warum Sie diese Ausgaben zurückhalten.',
        }),
        retracted: 'zurückgezogen',
        retract: 'Zurückziehen',
        reopened: 'wieder geöffnet',
        reopenReport: 'Bericht wieder öffnen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dieser Bericht wurde bereits nach ${connectionName} exportiert. Änderungen daran können zu Datenabweichungen führen. Sind Sie sicher, dass Sie diesen Bericht erneut öffnen möchten?`,
        reason: 'Grund',
        holdReasonRequired: 'Ein Grund ist erforderlich, wenn gehalten wird.',
        expenseWasPutOnHold: 'Ausgabe wurde zurückgestellt',
        expenseOnHold: 'Diese Ausgabe wurde zurückgestellt. Bitte überprüfen Sie die Kommentare für die nächsten Schritte.',
        expensesOnHold: 'Alle Ausgaben wurden zurückgestellt. Bitte überprüfen Sie die Kommentare für die nächsten Schritte.',
        expenseDuplicate: 'Diese Ausgabe hat ähnliche Details wie eine andere. Bitte überprüfen Sie die Duplikate, um fortzufahren.',
        someDuplicatesArePaid: 'Einige dieser Duplikate wurden bereits genehmigt oder bezahlt.',
        reviewDuplicates: 'Duplikate überprüfen',
        keepAll: 'Alles behalten',
        confirmApprove: 'Betrag der Genehmigung bestätigen',
        confirmApprovalAmount: 'Genehmigen Sie nur konforme Ausgaben oder genehmigen Sie den gesamten Bericht.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchten Sie trotzdem genehmigen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchten Sie trotzdem genehmigen?',
        }),
        confirmPay: 'Zahlungsbetrag bestätigen',
        confirmPayAmount: 'Bezahlen Sie, was nicht zurückgehalten wird, oder bezahlen Sie den gesamten Bericht.',
        confirmPayAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchten Sie trotzdem bezahlen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchten Sie trotzdem bezahlen?',
        }),
        payOnly: 'Nur bezahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Sollten Sie diese Ausgabe zurückhalten?',
        whatIsHoldExplain: 'Zurückhalten bedeutet, dass Sie eine Ausgabe sozusagen „pausieren”, bis Sie bereit sind, sie einzureichen.',
        holdIsLeftBehind: 'Zurückgehaltene Ausgaben bleiben auch dann zurück, wenn Sie einen gesamten Bericht einreichen.',
        unholdWhenReady: 'Heben Sie die Zurückhaltung von Ausgaben auf, wenn Sie bereit sind, sie einzureichen.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: 'Überprüfen Sie diese Punkte, die sich beim Verschieben von Berichten in einen neuen Arbeitsbereich ändern können.',
            reCategorize: '<strong>Kategorisieren Sie alle Ausgaben neu</strong>, um den Arbeitsbereichsregeln zu entsprechen.',
            workflows: 'Dieser Bericht kann nun einem anderen <strong>Genehmigungsworkflow</strong> unterliegen.',
        },
        changeWorkspace: 'Arbeitsbereich ändern',
        set: 'set',
        changed: 'geändert',
        removed: 'entfernt',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'Wählen Sie einen Erstattungssatz pro Meile oder Kilometer für den Arbeitsbereich aus',
        unapprove: 'Nicht genehmigen',
        unapproveReport: 'Bericht nicht genehmigen',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dieser Bericht wurde bereits nach ${accountingIntegration} exportiert. Eine Änderung kann zu Datenabweichungen führen. Sind Sie sicher, dass Sie diesen Bericht nicht genehmigen möchten?`,
        reimbursable: 'erstattungsfähig',
        nonReimbursable: 'nicht erstattungsfähig',
        bookingPending: 'Diese Buchung ist ausstehend',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, weil sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, weil das Reisedatum verstrichen ist. Fügen Sie bei Bedarf eine Ausgabe für den Endbetrag hinzu.',
        attendees: 'Teilnehmer',
        whoIsYourAccountant: 'Wer ist Ihr Buchhalter?',
        paymentComplete: 'Zahlung abgeschlossen',
        time: 'Zeit',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        deleteSubrate: 'Subrate löschen',
        deleteSubrateConfirmation: 'Möchten Sie diesen Untertarif wirklich löschen?',
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
            one: `Reise: 1 ganzer Tag`,
            other: (count: number) => `Reise: ${count} volle Tage`,
        }),
        dates: 'Daten',
        rates: 'Preise',
        submitsTo: ({name}: SubmitsToParams) => `Übermittelt an ${name}`,
        moveExpenses: () => ({one: 'Ausgabe verschieben', other: 'Ausgaben verschieben'}),
        reject: {
            educationalTitle: 'Solltest du halten oder ablehnen?',
            educationalText: 'Wenn du noch nicht bereit bist, eine Ausgabe zu genehmigen oder zu bezahlen, kannst du sie halten oder ablehnen.',
            holdExpenseTitle: 'Halte eine Ausgabe zurück, um vor der Genehmigung oder Zahlung weitere Details anzufordern.',
            approveExpenseTitle: 'Genehmige eine Ausgabe, um sie vor der Zahlung weitere Details anzufordern.',
            heldExpenseLeftBehindTitle: 'Zurückgehaltene Ausgaben bleiben zurück, wenn du einen gesamten Bericht genehmigst.',
            rejectExpenseTitle: 'Lehne eine Ausgabe ab, die du nicht genehmigen oder bezahlen möchtest.',
            reasonPageTitle: 'Ausgabe ablehnen',
            reasonPageDescription: 'Erklären Sie, warum Sie diese Ausgabe ablehnen.',
            rejectReason: 'Ablehnungsgrund',
            markAsResolved: 'Als gelöst markieren',
            rejectedStatus: 'Diese Ausgabe wurde abgelehnt. Wir warten darauf, dass Sie die Probleme beheben und als gelöst markieren, um die Einreichung zu ermöglichen.',
            reportActions: {
                rejectedExpense: 'lehnte diese Ausgabe ab',
                markedAsResolved: 'markierte den Ablehnungsgrund als gelöst',
            },
        },
        changeApprover: {
            title: 'Genehmiger ändern',
            subtitle: 'Wählen Sie eine Option, um den Genehmiger für diesen Bericht zu ändern.',
            description: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Sie können den Genehmiger auch dauerhaft für alle Berichte in Ihren <a href="${workflowSettingLink}">Workflow-Einstellungen</a> ändern.`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `änderte den Genehmiger zu <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Genehmiger hinzufügen',
                addApproverSubtitle: 'Fügen Sie dem bestehenden Workflow einen zusätzlichen Genehmiger hinzu.',
                bypassApprovers: 'Genehmiger umgehen',
                bypassApproversSubtitle: 'Weisen Sie sich selbst als endgültigen Genehmiger zu und überspringen Sie alle verbleibenden Genehmiger.',
            },
            addApprover: {
                subtitle: 'Wählen Sie einen zusätzlichen Genehmiger für diesen Bericht, bevor wir ihn durch den Rest des Genehmigungs-Workflows leiten.',
            },
        },
        chooseWorkspace: 'Wählen Sie einen Arbeitsbereich aus',
    },
    transactionMerge: {
        listPage: {
            header: 'Ausgaben zusammenführen',
            noEligibleExpenseFound: 'Keine geeigneten Ausgaben gefunden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Du hast keine Ausgaben, die mit dieser zusammengeführt werden können. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Erfahre mehr</a> über geeignete Ausgaben.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wähle eine <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">geeignete Ausgabe</a> zum Zusammenführen <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Beleg auswählen',
            pageTitle: 'Wähle den Beleg, den du behalten möchtest:',
        },
        detailsPage: {
            header: 'Details auswählen',
            pageTitle: 'Wähle die Details, die du behalten möchtest:',
            noDifferences: 'Keine Unterschiede zwischen den Transaktionen gefunden',
            pleaseSelectError: ({field}: {field: string}) => `Bitte wähle ein(e) ${field}`,
            pleaseSelectAttendees: 'Bitte wähle teilnehmer',
            selectAllDetailsError: 'Wähle alle Details, bevor du fortfährst.',
        },
        confirmationPage: {
            header: 'Details bestätigen',
            pageTitle: 'Bestätige die Details, die du behalten möchtest. Die nicht behaltenen Details werden gelöscht.',
            confirmButton: 'Ausgaben zusammenführen',
        },
    },
    share: {
        shareToExpensify: 'Teilen mit Expensify',
        messageInputLabel: 'Nachricht',
    },
    notificationPreferencesPage: {
        header: 'Benachrichtigungseinstellungen',
        label: 'Benachrichtige mich über neue Nachrichten',
        notificationPreferences: {
            always: 'Sofort',
            daily: 'Täglich',
            mute: 'Stumm schalten',
            hidden: 'Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Die Nummer wurde nicht validiert. Klicken Sie auf die Schaltfläche, um den Validierungslink per SMS erneut zu senden.',
        emailHasNotBeenValidated: 'Die E-Mail wurde nicht verifiziert. Klicken Sie auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto hochladen',
        removePhoto: 'Foto entfernen',
        editImage: 'Foto bearbeiten',
        viewPhoto: 'Foto ansehen',
        imageUploadFailed: 'Bild-Upload fehlgeschlagen',
        deleteWorkspaceError: 'Entschuldigung, es gab ein unerwartetes Problem beim Löschen Ihres Arbeitsbereich-Avatars.',
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
        selectYourPronouns: 'Wählen Sie Ihre Pronomen aus',
        selfSelectYourPronoun: 'Wählen Sie Ihr Pronomen selbst aus',
        emailAddress: 'E-Mail-Adresse',
        setMyTimezoneAutomatically: 'Zeitzone automatisch einstellen',
        timezone: 'Zeitzone',
        invalidFileMessage: 'Ungültige Datei. Bitte versuchen Sie es mit einem anderen Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronisieren',
        profileAvatar: 'Profil-Avatar',
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
        subtitle: 'Aktivieren Sie die Zwei-Faktor-Authentifizierung, um Ihr Konto zu schützen.',
        goToSecurity: 'Zurück zur Sicherheitsseite',
    },
    shareCodePage: {title: 'Ihr Code', subtitle: 'Laden Sie Mitglieder zu Expensify ein, indem Sie Ihren persönlichen QR-Code oder Empfehlungslink teilen.'},
    pronounsPage: {
        pronouns: 'Pronomen',
        isShownOnProfile: 'Ihre Pronomen werden in Ihrem Profil angezeigt.',
        placeholderText: 'Suchen, um Optionen zu sehen',
    },
    contacts: {
        contactMethods: 'Kontaktmethoden',
        featureRequiresValidate: 'Diese Funktion erfordert, dass Sie Ihr Konto verifizieren.',
        validateAccount: 'Bestätigen Sie Ihr Konto',
        helpText: ({email}: {email: string}) =>
            `Fügen Sie weitere Möglichkeiten hinzu, sich anzumelden und Belege an Expensify zu senden.<br/><br/>Fügen Sie eine E-Mail-Adresse hinzu, um Belege an <a href="mailto:${email}">${email}</a> weiterzuleiten, oder fügen Sie eine Telefonnummer hinzu, um Belege per SMS an 47777 zu senden (nur US-Nummern).`,
        pleaseVerify: 'Bitte überprüfen Sie diese Kontaktmethode.',
        getInTouch: 'Wir verwenden diese Methode, um Sie zu kontaktieren.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod:
            'Dies ist Ihre aktuelle Standardkontaktmethode. Bevor Sie sie löschen können, müssen Sie eine andere Kontaktmethode auswählen und auf „Als Standard festlegen“ klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'Möchten Sie diese Kontaktmethode wirklich entfernen? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedNewContact: 'Fehler beim Hinzufügen dieser Kontaktmethode.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Fehler beim Senden eines neuen magischen Codes. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
            validateSecondaryLogin: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            deleteContactMethod: 'Löschen der Kontaktmethode fehlgeschlagen. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            setDefaultContactMethod: 'Fehler beim Festlegen einer neuen Standardkontaktmethode. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            addContactMethod: 'Fehler beim Hinzufügen dieser Kontaktmethode. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            enteredMethodIsAlreadySubmitted: 'Diese Kontaktmethode existiert bereits.',
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
        heHimHisTheyThemTheirs: 'Er / Ihn / Sein / Sie / Ihnen / Ihr',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / Sie / Ihnen / Ihre',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ansehen / Anzeigen / Anzeigen',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Nenne mich bei meinem Namen',
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
        pleaseInstallExpensifyClassic: 'Bitte installieren Sie die neueste Version von Expensify.',
        toGetLatestChanges: 'Für Mobilgeräte oder Desktop, laden Sie die neueste Version herunter und installieren Sie sie. Für das Web, aktualisieren Sie Ihren Browser.',
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
            description:
                '<muted-text>Verwenden Sie die folgenden Tools, um Probleme mit Expensify zu beheben. Wenn Sie auf Probleme stoßen, <concierge-link>melden Sie bitte einen Fehler</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle nicht gesendeten Entwurfsnachrichten gehen verloren, aber der Rest Ihrer Daten ist sicher.',
            resetAndRefresh: 'Zurücksetzen und aktualisieren',
            clientSideLogging: 'Client-seitiges Logging',
            noLogsToShare: 'Keine Protokolle zum Teilen',
            useProfiling: 'Profiling verwenden',
            profileTrace: 'Profilverlauf',
            results: 'Ergebnisse',
            releaseOptions: 'Veröffentlichungsoptionen',
            testingPreferences: 'Präferenzen testen',
            useStagingServer: 'Staging-Server verwenden',
            forceOffline: 'Offline erzwingen',
            simulatePoorConnection: 'Schlechte Internetverbindung simulieren',
            simulateFailingNetworkRequests: 'Netzwerkanfragen simulieren, die fehlschlagen',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Geräteanmeldedaten',
            invalidate: 'Ungültig machen',
            destroy: 'Zerstören',
            maskExportOnyxStateData: 'Maskieren Sie sensible Mitgliederdaten beim Exportieren des Onyx-Zustands',
            exportOnyxState: 'Exportieren Sie den Onyx-Zustand',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Testabsturz',
            resetToOriginalState: 'Auf den ursprünglichen Zustand zurücksetzen',
            usingImportedState: 'Sie verwenden importierten Status. Drücken Sie hier, um ihn zu löschen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ungültige Datei',
            invalidFileDescription: 'Die Datei, die Sie importieren möchten, ist ungültig. Bitte versuchen Sie es erneut.',
            invalidateWithDelay: 'Mit Verzögerung ungültig machen',
            recordTroubleshootData: 'Daten zur Fehlerbehebung aufzeichnen',
            softKillTheApp: 'Soft-Kill der App',
            kill: 'Töten',
        },
        debugConsole: {
            saveLog: 'Protokoll speichern',
            shareLog: 'Protokoll teilen',
            enterCommand: 'Befehl eingeben',
            execute: 'Ausführen',
            noLogsAvailable: 'Keine Protokolle verfügbar',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `Protokollgröße überschreitet das Limit von ${size} MB. Bitte verwenden Sie "Protokoll speichern", um die Protokolldatei stattdessen herunterzuladen.`,
            logs: 'Protokolle',
            viewConsole: 'Konsole anzeigen',
        },
        security: 'Sicherheit',
        signOut: 'Abmelden',
        restoreStashed: 'Wiederherstellen des zwischengespeicherten Logins',
        signOutConfirmationText: 'Sie verlieren alle Offline-Änderungen, wenn Sie sich abmelden.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lesen Sie die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzbestimmungen</a>.</muted-text-micro>`,
        help: 'Hilfe',
        whatIsNew: 'Was ist neu',
        accountSettings: 'Kontoeinstellungen',
        account: 'Konto',
        general: 'Allgemein',
    },
    closeAccountPage: {
        closeAccount: 'Konto schließen',
        reasonForLeavingPrompt: 'Wir würden es bedauern, Sie gehen zu sehen! Würden Sie uns freundlicherweise mitteilen, warum, damit wir uns verbessern können?',
        enterMessageHere: 'Nachricht hier eingeben',
        closeAccountWarning: 'Das Schließen Ihres Kontos kann nicht rückgängig gemacht werden.',
        closeAccountPermanentlyDeleteData: 'Möchten Sie Ihr Konto wirklich löschen? Dadurch werden alle ausstehenden Ausgaben dauerhaft gelöscht.',
        enterDefaultContactToConfirm: 'Bitte geben Sie Ihre Standardkontaktmethode ein, um zu bestätigen, dass Sie Ihr Konto schließen möchten. Ihre Standardkontaktmethode ist:',
        enterDefaultContact: 'Geben Sie Ihre Standardkontaktmethode ein',
        defaultContact: 'Standardkontaktmethode:',
        enterYourDefaultContactMethod: 'Bitte geben Sie Ihre Standardkontaktmethode ein, um Ihr Konto zu schließen.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Konten zusammenführen',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Geben Sie das Konto ein, das Sie in <strong>${login}</strong> zusammenführen möchten`,
            notReversibleConsent: 'Ich verstehe, dass dies nicht umkehrbar ist.',
        },
        accountValidate: {
            confirmMerge: 'Möchten Sie die Konten wirklich zusammenführen?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Die Zusammenlegung Ihrer Konten ist unumkehrbar und führt zum Verlust aller nicht eingereichten Ausgaben für <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Um fortzufahren, geben Sie bitte den magischen Code ein, der an <strong>${login}</strong> gesendet wurde.`,
            errors: {
                incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengeführt!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Sie haben erfolgreich alle Daten von <strong>${from}</strong> in <strong>${to}</strong> zusammengeführt. In Zukunft können Sie beide Logins für dieses Konto verwenden.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran.',
            limitedSupport: 'Wir unterstützen das Zusammenführen von Konten in New Expensify noch nicht. Bitte führen Sie diese Aktion stattdessen in Expensify Classic aus.',
            reachOutForHelp: '<muted-text><centered-text>Wenn Sie Fragen haben, wenden Sie sich <concierge-link>bitte an den Concierge</concierge-link>!</centered-text></muted-text>',
            goToExpensifyClassic: 'Gehe zu Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht zusammenführen, da es von <strong>${email.split('@').at(1) ?? ''}</strong>kontrolliert wird. Bitte <concierge-link>wenden Sie sich an Concierge</concierge-link>, um Hilfe zu erhalten.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht mit anderen Konten zusammenführen, da Ihr Domain-Administrator es als Ihr primäres Login festgelegt hat. Bitte fügen Sie stattdessen andere Konten zu diesem Konto hinzu.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Sie können Konten nicht zusammenführen, weil <strong>${email}</strong> die Zwei-Faktor-Authentifizierung (2FA) aktiviert hat. Bitte deaktivieren Sie 2FA für <strong>${email}</strong> und versuchen Sie es erneut.</centered-text></muted-text>`,
            learnMore: 'Erfahren Sie mehr über das Zusammenführen von Konten.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht zusammenführen, weil es gesperrt ist. Bitte <concierge-link>wenden Sie sich an Concierge</concierge-link>, um Hilfe zu erhalten.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Sie können Konten nicht zusammenführen, weil <strong>${email}</strong> kein Expensify-Konto hat. Bitte <a href="${contactMethodLink}">fügen Sie es stattdessen als Kontaktmethode hinzu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht mit anderen Konten zusammenführen. Bitte fügen Sie stattdessen andere Konten hinzu.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können keine Konten in <strong>${email}</strong> zusammenführen, da dieses Konto eine fakturierte Abrechnungsbeziehung besitzt.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Versuchen Sie es später noch einmal.',
            description: 'Es gab zu viele Versuche, Konten zusammenzuführen. Bitte versuchen Sie es später erneut.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Sie können nicht in andere Konten zusammenführen, da es nicht verifiziert ist. Bitte verifizieren Sie das Konto und versuchen Sie es erneut.',
        },
        mergeFailureSelfMerge: {
            description: 'Sie können ein Konto nicht mit sich selbst zusammenführen.',
        },
        mergeFailureGenericHeading: 'Konten können nicht zusammengeführt werden',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Verdächtige Aktivität melden',
        lockAccount: 'Konto sperren',
        unlockAccount: 'Konto entsperren',
        compromisedDescription: 'Etwas stimmt nicht mit deinem Konto? Eine Meldung sperrt dein Konto sofort, stoppt neue Expensify Card-Transaktionen und verhindert Änderungen.',
        domainAdminsDescription: 'Für Domain-Admins: Dies pausiert auch alle Aktivitäten und Admin-Aktionen der Expensify Card in deiner Domain.',
        areYouSure: 'Bist du sicher, dass du dein Expensify-Konto sperren willst?',
        onceLocked: 'Sobald gesperrt, wird Ihr Konto eingeschränkt, bis eine Entsperranfrage und eine Sicherheitsüberprüfung erfolgt sind.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: `Wir konnten Ihr Konto nicht sperren. Bitte chatten Sie mit Concierge, um dieses Problem zu lösen.`,
        chatWithConcierge: 'Chatten Sie mit Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Ihr Konto ist gesperrt',
        chatToConciergeToUnlock: 'Chatten Sie mit Concierge, um Sicherheitsbedenken zu klären und Ihr Konto freizuschalten.',
        chatWithConcierge: 'Chatten Sie mit Concierge',
    },
    passwordPage: {
        changePassword: 'Passwort ändern',
        changingYourPasswordPrompt: 'Wenn Sie Ihr Passwort ändern, wird Ihr Passwort sowohl für Ihr Expensify.com- als auch für Ihr New Expensify-Konto aktualisiert.',
        currentPassword: 'Aktuelles Passwort',
        newPassword: 'Neues Passwort',
        newPasswordPrompt: 'Ihr neues Passwort muss sich von Ihrem alten Passwort unterscheiden und mindestens 8 Zeichen, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
    },
    twoFactorAuth: {
        headerTitle: 'Zwei-Faktor-Authentifizierung',
        twoFactorAuthEnabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        whatIsTwoFactorAuth:
            'Die Zwei-Faktor-Authentifizierung (2FA) hilft, Ihr Konto sicher zu halten. Beim Einloggen müssen Sie einen Code eingeben, der von Ihrer bevorzugten Authentifizierungs-App generiert wird.',
        disableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung deaktivieren',
        explainProcessToRemove: 'Um die Zwei-Faktor-Authentifizierung (2FA) zu deaktivieren, geben Sie bitte einen gültigen Code aus Ihrer Authentifizierungs-App ein.',
        disabled: 'Die Zwei-Faktor-Authentifizierung ist jetzt deaktiviert.',
        noAuthenticatorApp: 'Sie benötigen keine Authentifizierungs-App mehr, um sich bei Expensify anzumelden.',
        stepCodes: 'Wiederherstellungscodes',
        keepCodesSafe: 'Bewahren Sie diese Wiederherstellungscodes sicher auf!',
        codesLoseAccess: dedent(`
            Wenn du den Zugriff auf deine Authentifizierungs-App verlierst und diese Codes nicht hast, verlierst du den Zugriff auf dein Konto.

            Hinweis: Das Einrichten der Zwei-Faktor-Authentifizierung meldet dich von allen anderen aktiven Sitzungen ab.
        `),
        errorStepCodes: 'Bitte kopieren oder laden Sie die Codes herunter, bevor Sie fortfahren.',
        stepVerify: 'Überprüfen',
        scanCode: 'Scannen Sie den QR-Code mit Ihrem',
        authenticatorApp: 'Authentifikator-App',
        addKey: 'Oder fügen Sie diesen geheimen Schlüssel zu Ihrer Authentifizierungs-App hinzu:',
        enterCode: 'Geben Sie dann den sechsstelligen Code ein, der von Ihrer Authentifizierungs-App generiert wurde.',
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
        twoFactorAuthIsRequiredXero:
            'Ihre Xero-Buchhaltungsverbindung erfordert die Verwendung der Zwei-Faktor-Authentifizierung. Um Expensify weiterhin nutzen zu können, aktivieren Sie sie bitte.',
        twoFactorAuthCannotDisable: '2FA kann nicht deaktiviert werden.',
        twoFactorAuthRequired: 'Die Zwei-Faktor-Authentifizierung (2FA) ist für Ihre Xero-Verbindung erforderlich und kann nicht deaktiviert werden.',
        explainProcessToRemoveWithRecovery: 'Um die Zwei-Faktor-Authentifizierung (2FA) zu deaktivieren, geben Sie bitte einen gültigen Wiederherstellungscode ein.',
        twoFactorAuthIsRequiredCompany: 'Ihr Unternehmen verlangt die Verwendung der Zwei-Faktor-Authentifizierung. Um Expensify weiterhin nutzen zu können, aktivieren Sie sie bitte.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
            incorrectRecoveryCode: 'Falscher Wiederherstellungscode. Bitte versuche es erneut.',
        },
        useRecoveryCode: 'Wiederherstellungscode verwenden',
        recoveryCode: 'Wiederherstellungscode',
        use2fa: 'Verwenden Sie den Zwei-Faktor-Authentifizierungscode',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuchen Sie es erneut.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Passwort aktualisiert!',
        allSet: 'Alles erledigt. Bewahren Sie Ihr neues Passwort sicher auf.',
    },
    privateNotes: {
        title: 'Private Notizen',
        personalNoteMessage: 'Notizen zu diesem Chat hier festhalten. Sie sind die einzige Person, die diese Notizen hinzufügen, bearbeiten oder einsehen kann.',
        sharedNoteMessage: 'Notizen zu diesem Chat hier festhalten. Expensify-Mitarbeiter und andere Mitglieder der team.expensify.com-Domain können diese Notizen einsehen.',
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
        changeBillingCurrency: 'Rechnungswährung ändern',
        changePaymentCurrency: 'Zahlungswährung ändern',
        paymentCurrency: 'Zahlungswährung',
        paymentCurrencyDescription: 'Wählen Sie eine standardisierte Währung, in die alle persönlichen Ausgaben umgerechnet werden sollen.',
        note: `Hinweis: Wenn Sie Ihre Zahlungswährung ändern, kann sich dies auf Ihre Kosten für Expensify auswirken. Auf unserer <a href="${CONST.PRICING}">Preisseite</a> finden Sie alle Details.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Fügen Sie eine Debitkarte hinzu',
        nameOnCard: 'Name auf der Karte',
        debitCardNumber: 'Debitkartennummer',
        expiration: 'Ablaufdatum',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Debitkarte wurde erfolgreich hinzugefügt',
        expensifyPassword: 'Expensify-Passwort',
        error: {
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte geben Sie eine gültige Postleitzahl ein',
            debitCardNumber: 'Bitte geben Sie eine gültige Debitkartennummer ein.',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte geben Sie einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine gültige Rechnungsadresse ein, die kein Postfach ist.',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein.',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Zahlungskarte hinzufügen',
        nameOnCard: 'Name auf der Karte',
        paymentCardNumber: 'Kartennummer',
        expiration: 'Ablaufdatum',
        expirationDate: 'MM/YY',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Zahlungskarte wurde erfolgreich hinzugefügt',
        expensifyPassword: 'Expensify-Passwort',
        error: {
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte geben Sie eine gültige Postleitzahl ein',
            paymentCardNumber: 'Bitte geben Sie eine gültige Kartennummer ein.',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte geben Sie einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine gültige Rechnungsadresse ein, die kein Postfach ist.',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein.',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Zahlungsmethoden',
        setDefaultConfirmation: 'Standardzahlungsmethode festlegen',
        setDefaultSuccess: 'Standardzahlungsmethode festgelegt!',
        deleteAccount: 'Konto löschen',
        deleteConfirmation: 'Möchten Sie dieses Konto wirklich löschen?',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als Standardzahlungsmethode ist ein Fehler aufgetreten.',
            invalidBankAccount: 'Dieses Bankkonto ist vorübergehend gesperrt.',
            notOwnerOfFund: 'Ein Fehler ist aufgetreten, als diese Karte als Ihre Standardzahlungsmethode festgelegt wurde.',
            setDefaultFailure: 'Etwas ist schiefgelaufen. Bitte chatten Sie mit Concierge für weitere Unterstützung.',
        },
        addBankAccountFailure: 'Beim Hinzufügen Ihres Bankkontos ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Schneller zurückgezahlt werden',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Erhalten Sie Geld in Ihrer lokalen Währung',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Senden und Empfangen von Geld mit Freunden. Nur US-Bankkonten.',
        enableWallet: 'Wallet aktivieren',
        addBankAccountToSendAndReceive: 'Fügen Sie ein Bankkonto hinzu, um Zahlungen zu tätigen oder zu empfangen.',
        addDebitOrCreditCard: 'Debit- oder Kreditkarte hinzufügen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Dies sind Karten, die von einem Workspace-Admin zugewiesen wurden, um die Ausgaben des Unternehmens zu verwalten.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Wir überprüfen Ihre Informationen. Bitte schauen Sie in ein paar Minuten wieder vorbei!',
        walletActivationFailed: 'Leider kann Ihr Wallet derzeit nicht aktiviert werden. Bitte chatten Sie mit Concierge für weitere Unterstützung.',
        addYourBankAccount: 'Fügen Sie Ihr Bankkonto hinzu',
        addBankAccountBody: 'Lassen Sie uns Ihr Bankkonto mit Expensify verbinden, damit es einfacher denn je ist, Zahlungen direkt in der App zu senden und zu empfangen.',
        chooseYourBankAccount: 'Wählen Sie Ihr Bankkonto aus',
        chooseAccountBody: 'Stellen Sie sicher, dass Sie das richtige auswählen.',
        confirmYourBankAccount: 'Bestätigen Sie Ihr Bankkonto',
        personalBankAccounts: 'Persönliche Bankkonten',
        businessBankAccounts: 'Geschäftsbankkonten',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Intelligentes Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können bis zu ${formattedLimit} mit dieser Karte ausgeben, und das Limit wird zurückgesetzt, sobald Ihre eingereichten Ausgaben genehmigt werden.`,
        },
        fixedLimit: {
            name: 'Festgelegtes Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Sie können bis zu ${formattedLimit} mit dieser Karte ausgeben, danach wird sie deaktiviert.`,
        },
        monthlyLimit: {
            name: 'Monatliches Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können bis zu ${formattedLimit} pro Monat mit dieser Karte ausgeben. Das Limit wird am 1. Tag jedes Kalendermonats zurückgesetzt.`,
        },
        virtualCardNumber: 'Virtuelle Kartennummer',
        travelCardCvv: 'Travel-Karten-CVV',
        physicalCardNumber: 'Physische Kartennummer',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Physische Karte erhalten',
        reportFraud: 'Virtuelle Kartenbetrug melden',
        reportTravelFraud: 'Reisebetrug mit der Karte melden',
        reviewTransaction: 'Transaktion überprüfen',
        suspiciousBannerTitle: 'Verdächtige Transaktion',
        suspiciousBannerDescription: 'Wir haben verdächtige Transaktionen auf Ihrer Karte festgestellt. Tippen Sie unten, um sie zu überprüfen.',
        cardLocked: 'Ihre Karte ist vorübergehend gesperrt, während unser Team das Konto Ihres Unternehmens überprüft.',
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
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Zum ${platform} Wallet hinzugefügt`,
        cardDetailsLoadingFailure: 'Beim Laden der Kartendetails ist ein Fehler aufgetreten. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
        validateCardTitle: 'Lassen Sie uns sicherstellen, dass Sie es sind',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde, um Ihre Kartendetails anzuzeigen. Er sollte in ein bis zwei Minuten ankommen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Bitte <a href="${missingDetailsLink}">fügen Sie Ihre persönlichen Daten hinzu</a> und versuchen Sie es dann erneut.`,
        unexpectedError: 'Beim Abrufen Ihrer Expensify-Kartendaten ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, das tue ich.',
            reportFraudButtonText: 'Nein, das war ich nicht.',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `die verdächtige Aktivität geklärt und die Karte x${cardLastFour} reaktiviert. Alles bereit, um weiter Ausgaben zu erfassen!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `hat die Karte mit den Endziffern ${cardLastFour} deaktiviert`,
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
            }) => `verdächtige Aktivitäten auf der Karte mit der Endung ${cardLastFour} festgestellt. Erkennen Sie diese Abbuchung?

${amount} für ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Ausgaben',
        workflowDescription: 'Konfigurieren Sie einen Workflow ab dem Moment, in dem Ausgaben anfallen, einschließlich Genehmigung und Zahlung.',
        submissionFrequency: 'Einreichungshäufigkeit',
        submissionFrequencyDescription: 'Wählen Sie eine Häufigkeit für die Übermittlung von Ausgaben.',
        submissionFrequencyDateOfMonth: 'Datum des Monats',
        addApprovalsTitle: 'Genehmigungen hinzufügen',
        addApprovalButton: 'Genehmigungsworkflow hinzufügen',
        addApprovalTip: 'Dieser Standard-Workflow gilt für alle Mitglieder, es sei denn, es existiert ein spezifischerer Workflow.',
        disableApprovalPromptDescription: 'Durch das Deaktivieren von Genehmigungen werden alle vorhandenen Genehmigungsworkflows gelöscht.',
        approver: 'Genehmiger',
        addApprovalsDescription: 'Zusätzliche Genehmigung erforderlich, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen vornehmen oder verfolgen',
        makeOrTrackPaymentsDescription: 'Fügen Sie einen autorisierten Zahler für Zahlungen in Expensify hinzu oder verfolgen Sie Zahlungen, die anderswo getätigt wurden.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Für diesen Workspace ist ein benutzerdefinierter Genehmigungsworkflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wenden Sie sich bitte an Ihren <account-manager-link>Account Manager</account-manager-link> oder <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Für diesen Workspace ist ein benutzerdefinierter Genehmigungsworkflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wenden Sie sich bitte an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wählen Sie, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
        },
        frequencyDescription: 'Wählen Sie, wie oft Ausgaben automatisch eingereicht werden sollen, oder stellen Sie es auf manuell um.',
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
                '8': 'Achtel',
                '9': 'Neunte',
                '10': 'Zehntens',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied gehört bereits zu einem anderen Genehmigungs-Workflow. Alle Aktualisierungen hier werden sich auch dort widerspiegeln.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> genehmigt bereits Berichte an <strong>${name2}</strong>. Bitte wählen Sie einen anderen Genehmiger, um einen zirkulären Arbeitsablauf zu vermeiden.`,
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Arbeitsbereichsmitglieder gehören bereits zu einem bestehenden Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmigenden gehören zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Die Einreichungshäufigkeit konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Frequenz konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
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
        deletePrompt: 'Möchten Sie diesen Genehmigungs-Workflow wirklich löschen? Alle Mitglieder werden anschließend dem Standard-Workflow folgen.',
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
        admins: 'Admins',
        payer: 'Zahler',
        paymentAccount: 'Zahlungskonto',
    },
    reportFraudPage: {
        title: 'Virtuelle Kartenbetrug melden',
        description:
            'Wenn Ihre virtuellen Kartendaten gestohlen oder kompromittiert wurden, werden wir Ihre bestehende Karte dauerhaft deaktivieren und Ihnen eine neue virtuelle Karte und Nummer zur Verfügung stellen.',
        deactivateCard: 'Karte deaktivieren',
        reportVirtualCardFraud: 'Virtuelle Kartenbetrug melden',
    },
    reportFraudConfirmationPage: {
        title: 'Kartenbetrug gemeldet',
        description:
            'Wir haben Ihre bestehende Karte dauerhaft deaktiviert. Wenn Sie zurückgehen, um Ihre Kartendetails anzusehen, wird Ihnen eine neue virtuelle Karte zur Verfügung stehen.',
        buttonText: 'Verstanden, danke!',
    },
    activateCardPage: {
        activateCard: 'Karte aktivieren',
        pleaseEnterLastFour: 'Bitte geben Sie die letzten vier Ziffern Ihrer Karte ein.',
        activatePhysicalCard: 'Physische Karte aktivieren',
        error: {
            thatDidNotMatch: 'Das stimmte nicht mit den letzten 4 Ziffern auf Ihrer Karte überein. Bitte versuchen Sie es erneut.',
            throttled:
                'Sie haben die letzten 4 Ziffern Ihrer Expensify Card zu oft falsch eingegeben. Wenn Sie sicher sind, dass die Zahlen korrekt sind, wenden Sie sich bitte an Concierge, um das Problem zu lösen. Andernfalls versuchen Sie es später erneut.',
        },
    },
    getPhysicalCard: {
        header: 'Physische Karte erhalten',
        nameMessage: 'Geben Sie Ihren Vor- und Nachnamen ein, da dieser auf Ihrer Karte angezeigt wird.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        phoneMessage: 'Geben Sie Ihre Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Geben Sie Ihre Lieferadresse ein.',
        streetAddress: 'Straßenadresse',
        city: 'Stadt',
        state: 'Zustand',
        zipPostcode: 'Postleitzahl',
        country: 'Land',
        confirmMessage: 'Bitte bestätigen Sie Ihre unten stehenden Angaben.',
        estimatedDeliveryMessage: 'Ihre physische Karte wird in 2-3 Werktagen ankommen.',
        next: 'Nächste',
        getPhysicalCard: 'Physische Karte erhalten',
        shipCard: 'Karte versenden',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Sofort (Debitkarte)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% Gebühr (${minAmount} Minimum)`,
        ach: '1-3 Werktage (Bankkonto)',
        achSummary: 'Keine Gebühr',
        whichAccount: 'Welches Konto?',
        fee: 'Gebühr',
        transferSuccess: 'Überweisung erfolgreich!',
        transferDetailBankAccount: 'Ihr Geld sollte in den nächsten 1-3 Werktagen ankommen.',
        transferDetailDebitCard: 'Ihr Geld sollte sofort ankommen.',
        failedTransfer: 'Ihr Kontostand ist nicht vollständig ausgeglichen. Bitte überweisen Sie auf ein Bankkonto.',
        notHereSubTitle: 'Bitte überweisen Sie Ihr Guthaben von der Wallet-Seite.',
        goToWallet: 'Gehe zu Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Konto auswählen',
    },
    paymentMethodList: {
        addPaymentMethod: 'Zahlungsmethode hinzufügen',
        addNewDebitCard: 'Neue Debitkarte hinzufügen',
        addNewBankAccount: 'Neues Bankkonto hinzufügen',
        accountLastFour: 'Endet mit',
        cardLastFour: 'Karte endet mit',
        addFirstPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        defaultPaymentMethod: 'Standardmäßig',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Bankkonto • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'App-Einstellungen',
        },
        testSection: {
            title: 'Präferenzen testen',
            subtitle: 'Einstellungen zur Unterstützung beim Debuggen und Testen der App auf der Staging-Umgebung.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Erhalten Sie relevante Funktionsupdates und Expensify-Neuigkeiten',
        muteAllSounds: 'Alle Töne von Expensify stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Prioritätsmodus',
        explainerText: 'Wählen Sie, ob Sie sich nur auf ungelesene und angeheftete Chats konzentrieren möchten oder alles mit den neuesten und angehefteten Chats oben anzeigen möchten.',
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
        generatingPDF: 'PDF wird generiert...',
        waitForPDF: 'Bitte warten Sie, während wir das PDF erstellen.',
        errorPDF: 'Beim Versuch, Ihr PDF zu erstellen, ist ein Fehler aufgetreten.',
    },
    reportDescriptionPage: {
        roomDescription: 'Zimmerbeschreibung',
        roomDescriptionOptional: 'Raumbeschreibung (optional)',
        explainerText: 'Legen Sie eine benutzerdefinierte Beschreibung für den Raum fest.',
    },
    groupChat: {
        lastMemberTitle: 'Achtung!',
        lastMemberWarning: 'Da du die letzte Person hier bist, wird der Chat für alle Mitglieder unzugänglich, wenn du ihn verlässt. Bist du sicher, dass du gehen möchtest?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Gruppenchat von ${displayName}`,
    },
    languagePage: {
        language: 'Sprache',
        aiGenerated: 'Die Übersetzungen für diese Sprache werden automatisch erstellt und können Fehler enthalten.',
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
                label: 'Geräteeinstellungen verwenden',
            },
        },
        chooseThemeBelowOrSync: 'Wählen Sie ein Thema unten aus oder synchronisieren Sie es mit den Einstellungen Ihres Geräts.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Mit dem Einloggen erklären Sie sich mit den <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und dem <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutz</a> einverstanden.</muted-text-xs>`,
        license: `<muted-text-xs>Die Geldüberweisung wird von ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) im Rahmen ihrer <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">Lizenzen</a> durchgeführt.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen magischen Code erhalten?',
        enterAuthenticatorCode: 'Bitte geben Sie Ihren Authentifizierungscode ein',
        enterRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn die Zwei-Faktor-Authentifizierung aktiviert ist.',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Fordere einen neuen Code an in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Einen neuen Code anfordern',
        error: {
            pleaseFillMagicCode: 'Bitte geben Sie Ihren magischen Code ein',
            incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Bitte füllen Sie alle Felder aus',
        pleaseFillPassword: 'Bitte geben Sie Ihr Passwort ein',
        pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Code ein',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein, um fortzufahren',
        forgot: 'Vergessen?',
        requiredWhen2FAEnabled: 'Erforderlich, wenn die Zwei-Faktor-Authentifizierung aktiviert ist.',
        error: {
            incorrectPassword: 'Falsches Passwort. Bitte versuchen Sie es erneut.',
            incorrectLoginOrPassword: 'Falscher Benutzername oder falsches Passwort. Bitte versuchen Sie es erneut.',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuchen Sie es erneut.',
            twoFactorAuthenticationEnabled:
                'Sie haben die Zwei-Faktor-Authentifizierung (2FA) für dieses Konto aktiviert. Bitte melden Sie sich mit Ihrer E-Mail-Adresse oder Telefonnummer an.',
            invalidLoginOrPassword: 'Ungültige Anmeldung oder ungültiges Passwort. Bitte versuchen Sie es erneut oder setzen Sie Ihr Passwort zurück.',
            unableToResetPassword:
                'Wir konnten Ihr Passwort nicht ändern. Dies liegt wahrscheinlich an einem abgelaufenen Link zur Passwortzurücksetzung in einer alten E-Mail zur Passwortzurücksetzung. Wir haben Ihnen einen neuen Link per E-Mail geschickt, damit Sie es erneut versuchen können. Überprüfen Sie Ihren Posteingang und Ihren Spam-Ordner; es sollte in wenigen Minuten ankommen.',
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
        cannotGetAccountDetails: 'Konnte Kontodetails nicht abrufen. Bitte versuchen Sie, sich erneut anzumelden.',
        loginForm: 'Anmeldeformular',
        notYou: ({user}: NotYouParams) => `Nicht ${user}?`,
    },
    onboarding: {
        welcome: 'Willkommen!',
        welcomeSignOffTitleManageTeam: 'Sobald Sie die oben genannten Aufgaben abgeschlossen haben, können wir weitere Funktionen wie Genehmigungs-Workflows und Regeln erkunden!',
        welcomeSignOffTitle: 'Es ist großartig, Sie kennenzulernen!',
        explanationModal: {
            title: 'Willkommen bei Expensify',
            description:
                'Eine App, um Ihre geschäftlichen und persönlichen Ausgaben mit der Geschwindigkeit des Chats zu verwalten. Probieren Sie es aus und lassen Sie uns wissen, was Sie denken. Es kommt noch viel mehr!',
            secondaryDescription: 'Um zu Expensify Classic zurückzukehren, tippen Sie einfach auf Ihr Profilbild > Gehe zu Expensify Classic.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie heißt du?',
        peopleYouMayKnow: 'Personen, die Sie kennen könnten, sind bereits hier! Bestätigen Sie Ihre E-Mail, um sich ihnen anzuschließen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Jemand von ${domain} hat bereits einen Arbeitsbereich erstellt. Bitte geben Sie den magischen Code ein, der an ${email} gesendet wurde.`,
        joinAWorkspace: 'Einem Arbeitsbereich beitreten',
        listOfWorkspaces: 'Hier ist die Liste der Arbeitsbereiche, denen Sie beitreten können. Keine Sorge, Sie können ihnen auch später beitreten, wenn Sie möchten.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} Mitglied${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Wo arbeitest du?',
        errorSelection: 'Wählen Sie eine Option, um fortzufahren',
        purpose: {
            title: 'Was möchten Sie heute tun?',
            errorContinue: 'Bitte drücken Sie auf Weiter, um die Einrichtung abzuschließen.',
            errorBackButton: 'Bitte beenden Sie die Einrichtung, um die App zu verwenden.',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Von meinem Arbeitgeber zurückbezahlt werden',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Verwalte die Ausgaben meines Teams',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Verfolgen und budgetieren Sie Ausgaben',
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
        interestedFeatures: {
            title: 'Für welche Funktionen interessieren Sie sich?',
            featuresAlreadyEnabled: 'Hier sind unsere beliebtesten Funktionen:',
            featureYouMayBeInterestedIn: 'Aktivieren Sie zusätzliche Funktionen:',
        },
        error: {
            requiredFirstName: 'Bitte geben Sie Ihren Vornamen ein, um fortzufahren.',
        },
        workEmail: {
            title: 'Wie lautet Ihre Arbeits-E-Mail?',
            subtitle: 'Expensify funktioniert am besten, wenn Sie Ihre Arbeits-E-Mail verbinden.',
            explanationModal: {
                descriptionOne: 'Weiterleiten an receipts@expensify.com zum Scannen',
                descriptionTwo: 'Treten Sie Ihren Kollegen bei, die bereits Expensify nutzen.',
                descriptionThree: 'Genießen Sie ein individuell angepasstes Erlebnis',
            },
            addWorkEmail: 'Arbeits-E-Mail hinzufügen',
        },
        workEmailValidation: {
            title: 'Bestätigen Sie Ihre Arbeits-E-Mail-Adresse',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) =>
                `Bitte geben Sie den magischen Code ein, der an ${workEmail} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Bitte geben Sie eine gültige Arbeits-E-Mail von einer privaten Domain ein, z.B. mitch@company.com',
            offline: 'Wir konnten Ihre Arbeits-E-Mail nicht hinzufügen, da Sie offline zu sein scheinen.',
        },
        mergeBlockScreen: {
            title: 'Konnte die Arbeits-E-Mail nicht hinzufügen',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Wir konnten ${workEmail} nicht hinzufügen. Bitte versuchen Sie es später in den Einstellungen erneut oder chatten Sie mit Concierge für Unterstützung.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Mache eine [Probefahrt](${testDriveURL})`,
                description: ({testDriveURL}) => `[Mache eine kurze Produkttour](${testDriveURL}), um zu sehen, warum Expensify der schnellste Weg ist, Ausgaben zu verwalten.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Mache eine [Probefahrt](${testDriveURL})`,
                description: ({testDriveURL}) => `Probiere uns in einer [Probefahrt](${testDriveURL}) aus und sichere deinem Team *3 Monate Expensify gratis!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Ausgabengenehmigungen hinzufügen',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Genehmigungen für Ausgaben hinzufügen*, um die Ausgaben deines Teams zu überprüfen und unter Kontrolle zu halten.

                        So geht’s:

                        1. Gehe zu *Arbeitsbereiche*.
                        2. Wähle deinen Arbeitsbereich aus.
                        3. Klicke auf *Weitere Funktionen*.
                        4. Aktiviere *Workflows*.
                        5. Wechsle im Arbeitsbereichs-Editor zu *Workflows*.
                        6. Aktiviere *Genehmigungen hinzufügen*.
                        7. Du wirst als Genehmigende/r für Ausgaben festgelegt. Du kannst dies auf einen beliebigen Admin ändern, sobald du dein Team einlädst.

                        [Zu den weiteren Funktionen](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Erstelle](${workspaceConfirmationLink}) einen Workspace`,
                description: 'Erstelle einen Workspace und konfiguriere die Einstellungen mit Hilfe deines Einrichtungsspezialisten!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Erstelle einen [Workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Erstellen Sie einen Workspace*, um Ausgaben zu verfolgen, Belege zu scannen, zu chatten und mehr.

                        1. Klicken Sie auf *Workspaces* > *Neuer Workspace*.

                        *Ihr neuer Workspace ist einsatzbereit!* [Schauen Sie ihn sich an](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Richte [Kategorien](${workspaceCategoriesLink}) ein`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Kategorien einrichten*, damit dein Team Ausgaben für eine einfache Berichterstattung kategorisieren kann.

                        1. Klicke auf *Arbeitsbereiche*.
                        3. Wähle deinen Arbeitsbereich aus.
                        4. Klicke auf *Kategorien*.
                        5. Deaktiviere alle Kategorien, die du nicht benötigst.
                        6. Füge oben rechts eigene Kategorien hinzu.

                        [Zu den Kategorieeinstellungen des Arbeitsbereichs](${workspaceCategoriesLink}).

                        ![Kategorien einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Reiche eine Ausgabe ein',
                description: dedent(`
                    *Eine Ausgabe einreichen*, indem du einen Betrag eingibst oder einen Beleg scannst.

                    1. Klicke auf den +-Button.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Füge die E-Mail-Adresse oder Telefonnummer deines Chefs hinzu.
                    5. Klicke auf *Erstellen*.

                    Und schon bist du fertig!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Reiche eine Ausgabe ein',
                description: dedent(`
                    *Eine Ausgabe einreichen*, indem Sie einen Betrag eingeben oder einen Beleg scannen.

                    1. Klicken Sie auf die Schaltfläche +.
                    2. Wählen Sie *Ausgabe erstellen*.
                    3. Geben Sie einen Betrag ein oder scannen Sie einen Beleg.
                    4. Bestätigen Sie die Details.
                    5. Klicken Sie auf *Erstellen*.

                    Und das war's!
                `),
            },
            trackExpenseTask: {
                title: 'Verfolge eine Ausgabe',
                description: dedent(`
                    *Erfasse eine Ausgabe* in beliebiger Währung, egal ob du einen Beleg hast oder nicht.

                    1. Klicke auf den +-Button.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Wähle deinen *persönlichen* Bereich.
                    5. Klicke auf *Erstellen*.

                    Und schon bist du fertig! Ja, so einfach ist das.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbinde${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' mit'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'deiner' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbinde ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'Ihr' : 'bis'} ${integrationName} für die automatische Kategorisierung und Synchronisierung von Ausgaben, damit der Monatsabschluss zum Kinderspiel wird.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Accounting*.
                        4. Suche nach ${integrationName}.
                        5. Klicke auf *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[Zur Buchhaltung](${workspaceAccountingLink}).

![Mit ${integrationName} verbinden](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[Zur Buchhaltung](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Verbinde [deine Firmenkarte](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Verbinden Sie Ihre Firmenkarte, um Ausgaben automatisch zu importieren und zu kontieren.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Corporate cards*.
                        4. Folgen Sie den Anweisungen, um Ihre Karte zu verknüpfen.

                        [Zum Verbinden meiner Firmenkarten](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Lade [dein Team](${workspaceMembersLink}) ein`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Lade dein Team ein* in Expensify, damit es noch heute mit der Ausgabenerfassung beginnen kann.

                        1. Klicke auf *Arbeitsbereiche*.
                        3. Wähle deinen Arbeitsbereich aus.
                        4. Klicke auf *Mitglieder* > *Mitglied einladen*.
                        5. Gib E-Mail-Adressen oder Telefonnummern ein.
                        6. Füge bei Bedarf eine eigene Einladungsnachricht hinzu!

                        [Zu den Mitgliedern des Arbeitsbereichs](${workspaceMembersLink}).

                        ![Lade dein Team ein](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Richte [Kategorien](${workspaceCategoriesLink}) und [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Richten Sie Kategorien und Tags ein*, damit Ihr Team Ausgaben für eine einfache Berichterstattung kodieren kann.

                        Importieren Sie sie automatisch, indem Sie [Ihre Buchhaltungssoftware verbinden](${workspaceAccountingLink}), oder richten Sie sie manuell in Ihren [Arbeitsbereichseinstellungen](${workspaceCategoriesLink}) ein.`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Richte [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Verwenden Sie Tags, um zusätzliche Ausgabendetails wie Projekte, Kunden, Standorte und Abteilungen hinzuzufügen. Wenn Sie mehrere Tag-Ebenen benötigen, können Sie auf den Control-Plan upgraden.

                        1. Klicken Sie auf *Workspaces*.
                        3. Wählen Sie Ihren Arbeitsbereich aus.
                        4. Klicken Sie auf *More features*.
                        5. Aktivieren Sie *Tags*.
                        6. Wechseln Sie im Arbeitsbereichs-Editor zu *Tags*.
                        7. Klicken Sie auf *+ Tag hinzufügen*, um eigene zu erstellen.

                        [Zu weiteren Funktionen](${workspaceMoreFeaturesLink}).

                        ![Tags einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Lade deinen [Buchhalter](${workspaceMembersLink}) ein`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Laden Sie Ihre:n Buchhalter:in ein*, in Ihrem Arbeitsbereich zusammenzuarbeiten und Ihre Geschäftsausgaben zu verwalten.

                        1. Klicken Sie auf *Arbeitsbereiche*.
                        2. Wählen Sie Ihren Arbeitsbereich aus.
                        3. Klicken Sie auf *Mitglieder*.
                        4. Klicken Sie auf *Mitglied einladen*.
                        5. Geben Sie die E-Mail-Adresse Ihres Buchhalters/Ihrer Buchhalterin ein.

                        [Laden Sie Ihre:n Buchhalter:in jetzt ein](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Starte einen Chat',
                description: dedent(`
                    *Chat starten* mit jedem per E‑Mail-Adresse oder Telefonnummer.

                    1. Klicke auf die Schaltfläche +.
                    2. Wähle *Chat starten*.
                    3. Gib eine E‑Mail-Adresse oder Telefonnummer ein.

                    Wenn sie Expensify noch nicht verwenden, werden sie automatisch eingeladen.

                    Jeder Chat wird außerdem in eine E‑Mail oder SMS umgewandelt, auf die sie direkt antworten können.
                `),
            },
            splitExpenseTask: {
                title: 'Teile eine Ausgabe',
                description: dedent(`
                    *Ausgaben aufteilen* mit einer oder mehreren Personen.

                    1. Klicke auf die +-Schaltfläche.
                    2. Wähle *Chat starten*.
                    3. Gib E-Mails oder Telefonnummern ein.
                    4. Klicke im Chat auf den grauen *+*-Button > *Ausgabe aufteilen*.
                    5. Erstelle die Ausgabe, indem du *Manuell*, *Scan* oder *Entfernung* auswählst.

                    Füge bei Bedarf gern weitere Details hinzu oder sende sie einfach ab. Wir sorgen dafür, dass du dein Geld zurückbekommst!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Überprüfe deine [Workspace-Einstellungen](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        So überprüfen und aktualisieren Sie die Einstellungen Ihres Arbeitsbereichs:
                        1. Klicken Sie auf Arbeitsbereiche.
                        2. Wählen Sie Ihren Arbeitsbereich aus.
                        3. Überprüfen und aktualisieren Sie Ihre Einstellungen.
                        [Zu Ihrem Arbeitsbereich.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Erstelle deinen ersten Bericht',
                description: dedent(`
                    So erstellen Sie einen Bericht:

                    1. Klicken Sie auf die Schaltfläche +.
                    2. Wählen Sie *Bericht erstellen*.
                    3. Klicken Sie auf *Ausgabe hinzufügen*.
                    4. Fügen Sie Ihre erste Ausgabe hinzu.

                    Und das war's!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Mache eine [Probefahrt](${testDriveURL})` : 'Mache eine Probefahrt'),
            embeddedDemoIframeTitle: 'Probefahrt',
            employeeFakeReceipt: {
                description: 'Mein Probefahrt-Beleg!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Erstattungen zu erhalten ist so einfach wie eine Nachricht zu senden. Lass uns die Grundlagen durchgehen.',
            onboardingPersonalSpendMessage: 'So verfolgst du deine Ausgaben mit nur wenigen Klicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Deine kostenlose Testphase hat begonnen! Lass uns dich einrichten.
                        👋 Hey, ich bin dein Expensify-Setup-Spezialist. Ich habe bereits einen Arbeitsbereich erstellt, um die Belege und Ausgaben deines Teams zu verwalten. Um das Beste aus deiner 30-tägigen kostenlosen Testphase herauszuholen, befolge einfach die restlichen Einrichtungsschritte unten!
                    `)
                    : dedent(`
                        # Deine kostenlose Testphase hat begonnen! Lass uns dich einrichten.
                        👋 Hey, ich bin dein Expensify-Einrichtungsspezialist. Da du jetzt einen Arbeitsbereich erstellt hast, nutze deine 30-tägige kostenlose Testphase bestmöglich, indem du die folgenden Schritte befolgst!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Legen wir mit der Einrichtung los\n👋 Hey! Ich bin dein Expensify-Einrichtungsspezialist. Ich habe bereits einen Workspace erstellt, um deine Belege und Ausgaben zu verwalten. Um das Beste aus deiner 30-tägigen kostenlosen Testversion herauszuholen, folge einfach den verbleibenden Einrichtungsschritten unten!',
            onboardingChatSplitMessage: 'Rechnungen mit Freunden zu teilen ist so einfach wie eine Nachricht zu senden. So funktioniert’s.',
            onboardingAdminMessage: 'Lerne, wie du den Workspace deines Teams als Admin verwaltest und eigene Ausgaben einreichst.',
            onboardingLookingAroundMessage:
                'Expensify ist vor allem für Ausgaben-, Reise- und Firmenkartenmanagement bekannt – aber wir können noch viel mehr. Sag mir, was dich interessiert, und ich helfe dir beim Einstieg.',
            onboardingTestDriveReceiverMessage: '*Du hast 3 Monate gratis! Jetzt loslegen.*',
        },
        workspace: {
            title: 'Bleiben Sie mit einem Arbeitsbereich organisiert.',
            subtitle: 'Entdecken Sie leistungsstarke Tools, um Ihr Ausgabenmanagement zu vereinfachen, alles an einem Ort. Mit einem Arbeitsbereich können Sie:',
            explanationModal: {
                descriptionOne: 'Belege nachverfolgen und organisieren',
                descriptionTwo: 'Kategorisieren und taggen Sie Ausgaben',
                descriptionThree: 'Berichte erstellen und teilen',
            },
            price: 'Testen Sie es 30 Tage lang kostenlos, dann upgraden Sie für nur <strong>$5/Benutzer/Monat</strong>.',
            createWorkspace: 'Arbeitsbereich erstellen',
        },
        confirmWorkspace: {
            title: 'Arbeitsbereich bestätigen',
            subtitle:
                'Erstellen Sie einen Arbeitsbereich, um Belege zu verfolgen, Ausgaben zu erstatten, Reisen zu verwalten, Berichte zu erstellen und mehr – alles in der Geschwindigkeit des Chats.',
        },
        inviteMembers: {
            title: 'Mitglieder einladen',
            subtitle: 'Verwalten und teilen Sie Ihre Ausgaben mit einem Buchhalter oder gründen Sie eine Reisegruppe mit Freunden.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nicht mehr anzeigen',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Name darf die Wörter Expensify oder Concierge nicht enthalten',
            hasInvalidCharacter: 'Der Name darf kein Komma oder Semikolon enthalten.',
            requiredFirstName: 'Vorname darf nicht leer sein',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        enterDateOfBirth: 'Was ist Ihr Geburtsdatum?',
        enterAddress: 'Wie lautet Ihre Adresse?',
        enterPhoneNumber: 'Wie lautet Ihre Telefonnummer?',
        personalDetails: 'Persönliche Daten',
        privateDataMessage: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in Ihrem öffentlichen Profil angezeigt.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Das Datum sollte vor dem ${dateString} liegen.`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Das Datum sollte nach ${dateString} liegen.`,
            hasInvalidCharacter: 'Der Name darf nur lateinische Zeichen enthalten.',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Ungültiges Postleitzahlenformat${zipFormat ? `Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Bitte stellen Sie sicher, dass die Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link wurde erneut gesendet',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Ich habe einen magischen Anmeldelink an ${login} gesendet. Bitte überprüfe dein ${loginType}, um dich anzumelden.`,
        resendLink: 'Link erneut senden',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Um ${secondaryLogin} zu validieren, senden Sie bitte den magischen Code aus den Kontoeinstellungen von ${primaryLogin} erneut.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Wenn Sie keinen Zugriff mehr auf ${primaryLogin} haben, trennen Sie bitte Ihre Konten.`,
        unlink: 'Trennen',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Sekundäres Login erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Unser E-Mail-Anbieter hat E-Mails an ${login} vorübergehend aufgrund von Zustellungsproblemen gesperrt. Um Ihr Login zu entsperren, befolgen Sie bitte diese Schritte:`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>Bestätigen Sie, dass ${login} korrekt geschrieben ist und es sich um eine echte, zustellbare E-Mail-Adresse handelt.</strong> E-Mail-Aliasse wie "expenses@domain.com" müssen Zugriff auf ihren eigenen E-Mail-Posteingang haben, damit sie ein gültiger Expensify-Login sind.`,
        ensureYourEmailClient: `<strong>Stellen Sie sicher, dass Ihr E-Mail-Client E-Mails von expensify.com zulässt.</strong> Eine Anleitung für diesen Schritt finden Sie <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a>. Möglicherweise muss Ihnen Ihre IT-Abteilung bei der Konfiguration Ihrer E-Mail-Einstellungen helfen.`,
        onceTheAbove: `Sobald die oben genannten Schritte abgeschlossen sind, wenden Sie sich bitte an <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, um Ihre Anmeldung zu entsperren.`,
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Wir konnten SMS-Nachrichten nicht an ${login} zustellen, daher haben wir es vorübergehend gesperrt. Bitte versuchen Sie, Ihre Nummer zu validieren:`,
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
            return `Bitte warten Sie! Sie müssen ${timeText} warten, bevor Sie erneut versuchen, Ihre Nummer zu validieren.`;
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
        title: 'Willkommen im #Fokus-Modus!',
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `Bleiben Sie auf dem Laufenden, indem Sie nur ungelesene Chats oder Chats sehen, die Ihre Aufmerksamkeit erfordern. Keine Sorge, Sie können dies jederzeit in <a href="${priorityModePageUrl}">Einstellungen</a> ändern.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Der gesuchte Chat kann nicht gefunden werden.',
        getMeOutOfHere: 'Hol mich hier raus',
        iouReportNotFound: 'Die gesuchten Zahlungsdetails können nicht gefunden werden.',
        notHere: 'Hmm... es ist nicht hier.',
        pageNotFound: 'Ups, diese Seite kann nicht gefunden werden.',
        noAccess: 'Dieser Chat oder diese Ausgabe wurde möglicherweise gelöscht oder Sie haben keinen Zugriff darauf.\n\nBei Fragen wenden Sie sich bitte an concierge@expensify.com',
        goBackHome: 'Zurück zur Startseite',
        commentYouLookingForCannotBeFound: 'Der gesuchte Kommentar konnte nicht gefunden werden. Geh zurück zum Chat',
        contactConcierge: 'Bei Fragen wenden Sie sich bitte an concierge@expensify.com',
        goToChatInstead: 'Geh stattdessen zum Chat.',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oops... ${isBreakLine ? '\n' : ''}Etwas ist schiefgelaufen`,
        subtitle: 'Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
        wrongTypeSubtitle: 'Diese Suche ist ungültig. Versuchen Sie, Ihre Suchkriterien anzupassen.',
    },
    setPasswordPage: {
        enterPassword: 'Passwort eingeben',
        setPassword: 'Passwort festlegen',
        newPasswordPrompt: 'Ihr Passwort muss mindestens 8 Zeichen, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
        passwordFormTitle: 'Willkommen zurück bei der New Expensify! Bitte legen Sie Ihr Passwort fest.',
        passwordNotSet: 'Wir konnten Ihr neues Passwort nicht festlegen. Wir haben Ihnen einen neuen Passwort-Link gesendet, um es erneut zu versuchen.',
        setPasswordLinkInvalid: 'Dieser Link zum Festlegen des Passworts ist ungültig oder abgelaufen. Ein neuer wartet in Ihrem E-Mail-Posteingang auf Sie!',
        validateAccount: 'Konto verifizieren',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Fügen Sie ein Emoji hinzu, um Ihren Kollegen und Freunden auf einfache Weise mitzuteilen, was los ist. Sie können optional auch eine Nachricht hinzufügen!',
        today: 'Heute',
        clearStatus: 'Status löschen',
        save: 'Speichern',
        message: 'Nachricht',
        timePeriods: {
            never: 'Never',
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
        vacationDelegate: 'Urlaubsvertretung',
        setVacationDelegate: `Legen Sie eine Urlaubsvertretung fest, die Berichte in Ihrer Abwesenheit genehmigt.`,
        vacationDelegateError: 'Beim Aktualisieren Ihrer Urlaubsvertretung ist ein Fehler aufgetreten.',
        asVacationDelegate: ({nameOrEmail: managerName}: VacationDelegateParams) => `als Urlaubsvertretung von ${managerName}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `an ${submittedToName} als Urlaubsvertretung von ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Sie weisen ${nameOrEmail} als Ihre Urlaubsvertretung zu. Diese Person ist noch nicht in all Ihren Workspaces. Wenn Sie fortfahren, wird eine E-Mail an alle Ihre Workspace-Administratoren gesendet, um sie hinzuzufügen.`,
        clearAfter: 'Nach dem Löschen',
        whenClearStatus: 'Wann sollten wir Ihren Status löschen?',
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
        chooseAnAccountBelow: 'Wählen Sie ein Konto unten aus',
        addBankAccount: 'Bankkonto hinzufügen',
        chooseAnAccount: 'Konto auswählen',
        connectOnlineWithPlaid: 'Melden Sie sich bei Ihrer Bank an',
        connectManually: 'Manuell verbinden',
        desktopConnection:
            'Hinweis: Um eine Verbindung mit Chase, Wells Fargo, Capital One oder Bank of America herzustellen, klicken Sie bitte hier, um diesen Vorgang in einem Browser abzuschließen.',
        yourDataIsSecure: 'Ihre Daten sind sicher',
        toGetStarted: 'Fügen Sie ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify-Karten auszustellen, Rechnungszahlungen zu sammeln und Rechnungen von einem Ort aus zu bezahlen.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitern eine einfachere Möglichkeit, Unternehmensausgaben zu bezahlen - und zurückerstattet zu werden.',
        checkHelpLine: 'Ihre Bankleitzahl und Kontonummer finden Sie auf einem Scheck für das Konto.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Um ein Bankkonto zu verbinden, bitte <a href="${contactMethodRoute}">Fügen Sie eine E-Mail als Ihren primären Login hinzu</a> und versuchen Sie es erneut. Sie können Ihre Telefonnummer als sekundären Login hinzufügen.`,
        hasBeenThrottledError: 'Beim Hinzufügen Ihres Bankkontos ist ein Fehler aufgetreten. Bitte warten Sie ein paar Minuten und versuchen Sie es erneut.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Es scheint, dass die Währung Ihres Arbeitsbereichs auf eine andere Währung als USD eingestellt ist. Um fortzufahren, gehen Sie bitte zu <a href="${workspaceRoute}">Ihre Arbeitsbereichseinstellungen</a> um es auf USD zu setzen und es erneut zu versuchen.`,
        bbaAdded: 'Geschäftsbankkonto hinzugefügt!',
        bbaAddedDescription: 'Es ist bereit für Zahlungen verwendet zu werden.',
        error: {
            youNeedToSelectAnOption: 'Bitte wählen Sie eine Option, um fortzufahren.',
            noBankAccountAvailable: 'Entschuldigung, es ist kein Bankkonto verfügbar.',
            noBankAccountSelected: 'Bitte wählen Sie ein Konto aus',
            taxID: 'Bitte geben Sie eine gültige Steueridentifikationsnummer ein.',
            website: 'Bitte geben Sie eine gültige Website ein.',
            zipCode: `Bitte geben Sie eine gültige Postleitzahl im Format ein: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Bitte geben Sie eine gültige Telefonnummer ein.',
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            companyName: 'Bitte geben Sie einen gültigen Firmennamen ein',
            addressCity: 'Bitte geben Sie eine gültige Stadt ein',
            addressStreet: 'Bitte geben Sie eine gültige Straßenadresse ein',
            addressState: 'Bitte wählen Sie einen gültigen Bundesstaat aus',
            incorporationDateFuture: 'Das Gründungsdatum kann nicht in der Zukunft liegen.',
            incorporationState: 'Bitte wählen Sie einen gültigen Bundesstaat aus',
            industryCode: 'Bitte geben Sie einen gültigen Branchenklassifizierungscode mit sechs Ziffern ein.',
            restrictedBusiness: 'Bitte bestätigen Sie, dass das Unternehmen nicht auf der Liste der eingeschränkten Unternehmen steht.',
            routingNumber: 'Bitte geben Sie eine gültige Bankleitzahl ein',
            accountNumber: 'Bitte geben Sie eine gültige Kontonummer ein',
            routingAndAccountNumberCannotBeSame: 'Routing- und Kontonummern dürfen nicht übereinstimmen.',
            companyType: 'Bitte wählen Sie einen gültigen Unternehmenstyp aus',
            tooManyAttempts:
                'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option für 24 Stunden deaktiviert. Bitte versuchen Sie es später erneut oder geben Sie die Details stattdessen manuell ein.',
            address: 'Bitte geben Sie eine gültige Adresse ein',
            dob: 'Bitte wählen Sie ein gültiges Geburtsdatum aus',
            age: 'Muss über 18 Jahre alt sein',
            ssnLast4: 'Bitte geben Sie die letzten 4 Ziffern der SSN ein.',
            firstName: 'Bitte geben Sie einen gültigen Vornamen ein',
            lastName: 'Bitte geben Sie einen gültigen Nachnamen ein',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte fügen Sie ein Standard-Einzahlungskonto oder eine Debitkarte hinzu.',
            validationAmounts: 'Die eingegebenen Validierungsbeträge sind falsch. Bitte überprüfen Sie Ihren Kontoauszug und versuchen Sie es erneut.',
            fullName: 'Bitte geben Sie einen gültigen vollständigen Namen ein',
            ownershipPercentage: 'Bitte geben Sie eine gültige Prozentzahl ein.',
            deletePaymentBankAccount:
                'Dieses Bankkonto kann nicht gelöscht werden, da es für Expensify-Karten-Zahlungen verwendet wird. Wenn Sie dieses Konto trotzdem löschen möchten, wenden Sie sich bitte an den Concierge.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich Ihr Bankkonto?',
        accountDetailsStepHeader: 'Was sind Ihre Kontodaten?',
        accountTypeStepHeader: 'Welche Art von Konto ist das?',
        bankInformationStepHeader: 'Was sind Ihre Bankdaten?',
        accountHolderInformationStepHeader: 'Was sind die Kontoinhaberdaten?',
        howDoWeProtectYourData: 'Wie schützen wir Ihre Daten?',
        currencyHeader: 'Was ist die Währung Ihres Bankkontos?',
        confirmationStepHeader: 'Überprüfen Sie Ihre Informationen.',
        confirmationStepSubHeader: 'Überprüfen Sie die unten stehenden Details und aktivieren Sie das Kontrollkästchen für die Bedingungen, um zu bestätigen.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify-Passwort eingeben',
        alreadyAdded: 'Dieses Konto wurde bereits hinzugefügt.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Persönliches Bankkonto hinzugefügt!',
        successMessage: 'Glückwunsch, Ihr Bankkonto ist eingerichtet und bereit, Rückerstattungen zu empfangen.',
    },
    attachmentView: {
        unknownFilename: 'Unbekannter Dateiname',
        passwordRequired: 'Bitte geben Sie ein Passwort ein',
        passwordIncorrect: 'Falsches Passwort. Bitte versuchen Sie es erneut.',
        failedToLoadPDF: 'Fehler beim Laden der PDF-Datei',
        pdfPasswordForm: {
            title: 'Passwortgeschütztes PDF',
            infoText: 'Diese PDF ist passwortgeschützt.',
            beforeLinkText: 'Bitte',
            linkText: 'Passwort eingeben',
            afterLinkText: 'um es anzusehen.',
            formLabel: 'PDF anzeigen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
        retry: 'Wiederholen',
    },
    messages: {
        errorMessageInvalidPhone: `Bitte geben Sie eine gültige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn Sie sich außerhalb der USA befinden, geben Sie bitte Ihre Ländervorwahl an (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ungültige E-Mail-Adresse',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Mitglied von ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Indem Sie mit der Anfrage zur Aktivierung Ihres Expensify Wallets fortfahren, bestätigen Sie, dass Sie gelesen haben, verstehen und akzeptieren',
        facialScan: 'Onfidos Richtlinie und Freigabe zur Gesichtserkennung',
        tryAgain: 'Versuchen Sie es erneut.',
        verifyIdentity: 'Identität verifizieren',
        letsVerifyIdentity: 'Lassen Sie uns Ihre Identität überprüfen',
        butFirst: `Aber zuerst das langweilige Zeug. Lies dir im nächsten Schritt das Kleingedruckte durch und klicke auf "Akzeptieren", wenn du bereit bist.`,
        genericError: 'Ein Fehler ist bei der Verarbeitung dieses Schritts aufgetreten. Bitte versuchen Sie es erneut.',
        cameraPermissionsNotGranted: 'Kamerazugriff aktivieren',
        cameraRequestMessage: 'Wir benötigen Zugriff auf Ihre Kamera, um die Bankkontoverifizierung abzuschließen. Bitte aktivieren Sie dies über Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage: 'Wir benötigen Zugriff auf Ihr Mikrofon, um die Bankkontoverifizierung abzuschließen. Bitte aktivieren Sie dies über Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte laden Sie ein Originalbild Ihres Ausweises hoch, anstatt einen Screenshot oder ein gescanntes Bild.',
        documentNeedsBetterQuality:
            'Ihr Ausweis scheint beschädigt zu sein oder es fehlen Sicherheitsmerkmale. Bitte laden Sie ein Originalbild eines unbeschädigten Ausweises hoch, der vollständig sichtbar ist.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualität Ihres Ausweises. Bitte laden Sie ein neues Bild hoch, auf dem Ihr gesamter Ausweis klar zu sehen ist.',
        selfieIssue: 'Es gibt ein Problem mit Ihrem Selfie/Video. Bitte laden Sie ein Live-Selfie/Video hoch.',
        selfieNotMatching: 'Ihr Selfie/Video stimmt nicht mit Ihrem Ausweis überein. Bitte laden Sie ein neues Selfie/Video hoch, auf dem Ihr Gesicht klar zu erkennen ist.',
        selfieNotLive: 'Ihr Selfie/Video scheint kein Live-Foto/Video zu sein. Bitte laden Sie ein Live-Selfie/Video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Zusätzliche Details',
        helpText: 'Wir müssen die folgenden Informationen bestätigen, bevor Sie Geld von Ihrem Wallet senden und empfangen können.',
        helpTextIdologyQuestions: 'Wir müssen Ihnen nur noch ein paar weitere Fragen stellen, um Ihre Identität abschließend zu überprüfen.',
        helpLink: 'Erfahren Sie mehr darüber, warum wir das brauchen.',
        legalFirstNameLabel: 'Gesetzlicher Vorname',
        legalMiddleNameLabel: 'Zweiter Vorname (rechtlich)',
        legalLastNameLabel: 'Rechtlicher Nachname',
        selectAnswer: 'Bitte wählen Sie eine Antwort, um fortzufahren.',
        ssnFull9Error: 'Bitte geben Sie eine gültige neunstellige SSN ein.',
        needSSNFull9: 'Wir haben Schwierigkeiten, Ihre SSN zu verifizieren. Bitte geben Sie die vollständigen neun Ziffern Ihrer SSN ein.',
        weCouldNotVerify: 'Wir konnten nicht verifizieren',
        pleaseFixIt: 'Bitte korrigieren Sie diese Informationen, bevor Sie fortfahren.',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Wir konnten Ihre Identität nicht verifizieren. Bitte versuchen Sie es später erneut oder wenden Sie sich an <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, wenn Sie Fragen haben.`,
    },
    termsStep: {
        headerTitle: 'Bedingungen und Gebühren',
        headerTitleRefactor: 'Gebühren und Bedingungen',
        haveReadAndAgreePlain: 'Ich habe die elektronischen Informationen gelesen und bin damit einverstanden, sie zu erhalten.',
        haveReadAndAgree: `Ich habe die <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronischen Informationen</a> gelesen und bin damit einverstanden, sie zu erhalten.`,
        agreeToThePlain: 'Ich stimme der Vereinbarung über den Datenschutz und die Brieftasche zu.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ich stimme der Vereinbarung über den <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutz</a> und die <a href="${walletAgreementUrl}">Brieftasche</a> zu.`,
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Gebühr',
        inactivity: 'Inaktivität',
        noOverdraftOrCredit: 'Keine Überziehungs-/Kreditfunktion.',
        electronicFundsWithdrawal: 'Elektronische Mittelabhebung',
        standard: 'Standard',
        reviewTheFees: 'Schauen Sie sich einige Gebühren an.',
        checkTheBoxes: 'Bitte die untenstehenden Kästchen ankreuzen.',
        agreeToTerms: 'Stimmen Sie den Bedingungen zu und Sie können loslegen!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Das Expensify Wallet wird von ${walletProgram} ausgestellt.`,
            perPurchase: 'Pro Kauf',
            atmWithdrawal: 'Geldautomat-Abhebung',
            cashReload: 'Bargeldaufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'außerhalb des Netzwerks',
            atmBalanceInquiry: 'Geldautomaten-Saldoabfrage (im Netzwerk oder außerhalb des Netzwerks)',
            customerService: 'Kundendienst (automatisierter oder Live-Agent)',
            inactivityAfterTwelveMonths: 'Inaktivität (nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir erheben eine andere Art von Gebühr. Sie ist:',
            fdicInsurance: 'Ihre Gelder sind für die FDIC-Versicherung berechtigt.',
            generalInfo: `Allgemeine Informationen über Prepaid-Konten finden Sie unter <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Einzelheiten und Bedingungen für alle Gebühren und Dienstleistungen finden Sie unter <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> oder unter der Telefonnummer +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische Mittelabhebung (sofort)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Eine Liste aller Expensify Wallet-Gebühren',
            typeOfFeeHeader: 'Alle Gebühren',
            feeAmountHeader: 'Betrag',
            moreDetailsHeader: 'Einzelheiten',
            openingAccountTitle: 'Ein Konto eröffnen',
            openingAccountDetails: 'Es gibt keine Gebühr, um ein Konto zu eröffnen.',
            monthlyFeeDetails: 'Es gibt keine monatliche Gebühr.',
            customerServiceTitle: 'Kundendienst',
            customerServiceDetails: 'Es gibt keine Kundendienstgebühren.',
            inactivityDetails: 'Es gibt keine Inaktivitätsgebühr.',
            sendingFundsTitle: 'Senden von Geldern an einen anderen Kontoinhaber',
            sendingFundsDetails: 'Es gibt keine Gebühr, um Geld an einen anderen Kontoinhaber zu senden, wenn Sie Ihr Guthaben, Ihr Bankkonto oder Ihre Debitkarte verwenden.',
            electronicFundsStandardDetails:
                'Die Überweisung von Ihrem Expensify Wallet auf Ihr Bankkonto ist mit der Standardoption gebührenfrei. Diese Überweisung wird normalerweise innerhalb von 1-3 Werktagen abgeschlossen.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Für die Überweisung von Geldbeträgen von Ihrer Expensify-Geldbörse auf Ihre verknüpfte Debitkarte mit der Sofortüberweisungsoption fällt eine Gebühr an.' +
                ` Diese Überweisung wird in der Regel innerhalb weniger Minuten abgeschlossen. Die Gebühr beträgt ${percentage}% des Überweisungsbetrags (mit einer Mindestgebühr von ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Ihre Gelder können von der FDIC versichert werden. Ihre Gelder werden bei der ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, einem FDIC-versicherten Institut, verwahrt oder dorthin überwiesen.` +
                ` Dort sind Ihre Gelder bis zu ${amount} durch die FDIC versichert, falls die ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} scheitert, wenn bestimmte Anforderungen an die Einlagensicherung erfüllt sind und Ihre Karte registriert ist. Siehe ${CONST.TERMS.FDIC_PREPAID} für weitere Informationen.`,
            contactExpensifyPayments: `Kontaktieren Sie ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} unter der Telefonnummer +1 833-400-0904, per E-Mail an ${CONST.EMAIL.CONCIERGE} oder melden Sie sich unter ${CONST.NEW_EXPENSIFY_URL} an.`,
            generalInformation: `Allgemeine Informationen über Prepaid-Konten finden Sie unter ${CONST.TERMS.CFPB_PREPAID}. Wenn Sie eine Beschwerde über ein Prepaid-Konto haben, rufen Sie das Consumer Financial Protection Bureau unter 1-855-411-2372 an oder besuchen Sie ${CONST.TERMS.CFPB_COMPLAINT}.`,
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
        activatedMessage: 'Glückwunsch, Ihr Wallet ist eingerichtet und bereit für Zahlungen.',
        checkBackLaterTitle: 'Nur eine Minute...',
        checkBackLaterMessage: 'Wir überprüfen Ihre Informationen noch. Bitte schauen Sie später noch einmal vorbei.',
        continueToPayment: 'Weiter zur Zahlung',
        continueToTransfer: 'Weiter übertragen',
    },
    companyStep: {
        headerTitle: 'Unternehmensinformationen',
        subtitle: 'Fast fertig! Aus Sicherheitsgründen müssen wir einige Informationen bestätigen:',
        legalBusinessName: 'Rechtlicher Firmenname',
        companyWebsite: 'Unternehmenswebsite',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        companyType: 'Unternehmenstyp',
        incorporationDate: 'Gründungsdatum',
        incorporationState: 'Gründungsstaat',
        industryClassificationCode: 'Industrieklassifikationscode',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperativ',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Andere',
        },
        industryClassification: 'Unter welcher Branche ist das Unternehmen klassifiziert?',
        industryClassificationCodePlaceholder: 'Suche nach dem Branchenschlüssel',
    },
    requestorStep: {
        headerTitle: 'Persönliche Informationen',
        learnMore: 'Erfahren Sie mehr',
        isMyDataSafe: 'Sind meine Daten sicher?',
    },
    personalInfoStep: {
        personalInfo: 'Persönliche Informationen',
        enterYourLegalFirstAndLast: 'Wie lautet Ihr gesetzlicher Name?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        legalName: 'Rechtlicher Name',
        enterYourDateOfBirth: 'Was ist Ihr Geburtsdatum?',
        enterTheLast4: 'Was sind die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4SSN: 'Letzte 4 der SSN',
        enterYourAddress: 'Wie lautet Ihre Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Durch das Hinzufügen dieses Bankkontos bestätigen Sie, dass Sie gelesen haben, verstehen und akzeptieren',
        whatsYourLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        whatsYourAddress: 'Wie lautet Ihre Adresse?',
        whatsYourSSN: 'Was sind die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier gibt es keine persönlichen Bonitätsprüfungen!',
        whatsYourPhoneNumber: 'Wie lautet Ihre Telefonnummer?',
        weNeedThisToVerify: 'Wir benötigen dies, um Ihr Wallet zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Unternehmensinformationen',
        enterTheNameOfYourBusiness: 'Wie heißt Ihr Unternehmen?',
        businessName: 'Rechtlicher Firmenname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steuernummer Ihres Unternehmens?',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Unternehmenswebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Was für ein Unternehmen ist das?',
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
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationState: 'Gründungsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem Bundesstaat wurde Ihr Unternehmen gegründet?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        businessInfoTitle: 'Geschäftsinformationen',
        legalBusinessName: 'Rechtlicher Firmenname',
        whatsTheBusinessName: 'Wie lautet der Firmenname?',
        whatsTheBusinessAddress: 'Wie lautet die Geschäftsadresse?',
        whatsTheBusinessContactInformation: 'Wie lauten die Geschäftskontaktdaten?',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Wie lautet die Handelsregisternummer (CRN)?';
                default:
                    return 'Wie lautet die Handelsregisternummer?';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Was ist die Arbeitgeber-Identifikationsnummer (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Was ist die Unternehmensnummer (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Was ist die Umsatzsteuer-Identifikationsnummer (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Was ist die australische Unternehmensnummer (ABN)?';
                default:
                    return 'Was ist die EU-Umsatzsteuer-Identifikationsnummer?';
            }
        },
        whatsThisNumber: 'Was ist diese Nummer?',
        whereWasTheBusinessIncorporated: 'Wo wurde das Unternehmen gegründet?',
        whatTypeOfBusinessIsIt: 'Welche Art von Geschäft ist es?',
        whatsTheBusinessAnnualPayment: 'Wie hoch ist das jährliche Zahlungsvolumen des Unternehmens?',
        whatsYourExpectedAverageReimbursements: 'Wie hoch ist Ihr erwarteter durchschnittlicher Erstattungsbetrag?',
        registrationNumber: 'Registrierungsnummer',
        taxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'VRN';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'EU-USt';
            }
        },
        businessAddress: 'Geschäftsadresse',
        businessType: 'Geschäftsart',
        incorporation: 'Inkorporation',
        incorporationCountry: 'Gründungsland',
        incorporationTypeName: 'Gründungsart',
        businessCategory: 'Geschäftskategorie',
        annualPaymentVolume: 'Jährliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Jährliches Zahlungsvolumen in ${currencyCode}`,
        averageReimbursementAmount: 'Durchschnittlicher Erstattungsbetrag',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Durchschnittlicher Erstattungsbetrag in ${currencyCode}`,
        selectIncorporationType: 'Wählen Sie die Art der Gründung aus',
        selectBusinessCategory: 'Geschäftskategorie auswählen',
        selectAnnualPaymentVolume: 'Jährliches Zahlungsvolumen auswählen',
        selectIncorporationCountry: 'Wählen Sie das Gründungsland aus',
        selectIncorporationState: 'Inkorporationsstaat auswählen',
        selectAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag auswählen',
        selectBusinessType: 'Geschäftstyp auswählen',
        findIncorporationType: 'Art der Unternehmensgründung finden',
        findBusinessCategory: 'Geschäftskategorie finden',
        findAnnualPaymentVolume: 'Jährliches Zahlungsvolumen finden',
        findIncorporationState: 'Gründungsstaat finden',
        findAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag finden',
        findBusinessType: 'Geschäftstyp finden',
        error: {
            registrationNumber: 'Bitte geben Sie eine gültige Registrierungsnummer an.',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Bitte geben Sie eine gültige Arbeitgeber-Identifikationsnummer (EIN) an';
                    case CONST.COUNTRY.CA:
                        return 'Bitte geben Sie eine gültige Unternehmensnummer (BN) an';
                    case CONST.COUNTRY.GB:
                        return 'Bitte geben Sie eine gültige Umsatzsteuer-Identifikationsnummer (VRN) an';
                    case CONST.COUNTRY.AU:
                        return 'Bitte geben Sie eine gültige australische Unternehmensnummer (ABN) an';
                    default:
                        return 'Bitte geben Sie eine gültige EU-Umsatzsteuer-Identifikationsnummer an';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `Besitzt eine Einzelperson 25 % oder mehr von ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `Gibt es weitere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        regulationRequiresUsToVerifyTheIdentity: 'Die Vorschriften verlangen von uns, die Identität jeder Person zu überprüfen, die mehr als 25% des Unternehmens besitzt.',
        companyOwner: 'Geschäftsinhaber',
        enterLegalFirstAndLastName: 'Wie lautet der gesetzliche Name des Eigentümers?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Was ist das Geburtsdatum des Eigentümers?',
        enterTheLast4: 'Was sind die letzten 4 Ziffern der Sozialversicherungsnummer des Eigentümers?',
        last4SSN: 'Letzte 4 der SSN',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Durch das Hinzufügen dieses Bankkontos bestätigen Sie, dass Sie gelesen haben, verstehen und akzeptieren',
        owners: 'Eigentümer',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigentümerinformationen',
        businessOwner: 'Geschäftsinhaber',
        signerInfo: 'Unterzeichnerinformationen',
        doYouOwn: ({companyName}: CompanyNameParams) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Besitzt eine Einzelperson 25 % oder mehr von ${companyName}?`,
        regulationsRequire: 'Vorschriften erfordern, dass wir die Identität jeder Person überprüfen, die mehr als 25% des Unternehmens besitzt.',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der gesetzliche Name des Eigentümers?',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name?',
        whatPercentage: 'Welcher Prozentsatz des Unternehmens gehört dem Eigentümer?',
        whatsYoursPercentage: 'Wie viel Prozent des Unternehmens besitzen Sie?',
        ownership: 'Eigentum',
        whatsTheOwnersDOB: 'Was ist das Geburtsdatum des Eigentümers?',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        whatsYourAddress: 'Wie lautet Ihre Adresse?',
        whatAreTheLast: 'Was sind die letzten 4 Ziffern der Sozialversicherungsnummer des Eigentümers?',
        whatsYourLast: 'Was sind die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        whatsYourNationality: 'Was ist Ihr Staatsangehörigkeitsland?',
        whatsTheOwnersNationality: 'Was ist das Staatsangehörigkeitsland des Eigentümers?',
        countryOfCitizenship: 'Staatsangehörigkeitsland',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4: 'Letzte 4 der SSN',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: ({companyName}: CompanyNameParams) => `Gibt es andere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        owners: 'Eigentümer',
        addCertified: 'Fügen Sie ein zertifiziertes Organigramm hinzu, das die wirtschaftlichen Eigentümer zeigt.',
        regulationRequiresChart:
            'Die Vorschriften erfordern, dass wir eine beglaubigte Kopie des Eigentumsdiagramms sammeln, das jede Person oder Einheit zeigt, die 25 % oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Organigramm der Unternehmenseigentümer hochladen',
        noteEntity: 'Hinweis: Das Eigentumsdiagramm der Entität muss von Ihrem Buchhalter, Rechtsberater oder notariell beglaubigt unterschrieben werden.',
        certified: 'Zertifiziertes Eigentumsdiagramm der Einheit',
        selectCountry: 'Land auswählen',
        findCountry: 'Land finden',
        address: 'Adresse',
        chooseFile: 'Datei auswählen',
        uploadDocuments: 'Zusätzliche Dokumentation hochladen',
        pleaseUpload:
            'Bitte laden Sie zusätzliche Dokumente hoch, um uns zu helfen, Ihre Identität als direkter oder indirekter Eigentümer von 25% oder mehr der Geschäftseinheit zu verifizieren.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die Gesamtdateigröße für jeden Abschnitt darf 5 MB nicht überschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription:
            'Bitte legen Sie eine unterzeichnete Bestätigung und ein Organigramm von einem Wirtschaftsprüfer, Notar oder Anwalt vor, die die Eigentümerschaft von 25 % oder mehr des Unternehmens bestätigen. Diese muss innerhalb der letzten drei Monate datiert sein und die Lizenznummer des Unterzeichners enthalten.',
        copyOfID: 'Kopie des Ausweises für den wirtschaftlich Berechtigten',
        copyOfIDDescription: 'Beispiele: Reisepass, Führerschein, etc.',
        proofOfAddress: 'Adressnachweis für den wirtschaftlich Berechtigten',
        proofOfAddressDescription: 'Beispiele: Nebenkostenabrechnung, Mietvertrag, etc.',
        codiceFiscale: 'Codice fiscale/Steuer-ID',
        codiceFiscaleDescription:
            'Bitte laden Sie ein Video eines Vor-Ort-Besuchs oder eines aufgezeichneten Anrufs mit dem unterzeichnenden Beamten hoch. Der Beamte muss folgende Angaben machen: vollständiger Name, Geburtsdatum, Firmenname, Registrierungsnummer, Steuercodenummer, registrierte Adresse, Art des Geschäfts und Zweck des Kontos.',
    },
    completeVerificationStep: {
        completeVerification: 'Überprüfung abschließen',
        confirmAgreements: 'Bitte bestätigen Sie die untenstehenden Vereinbarungen.',
        certifyTrueAndAccurate: 'Ich bestätige, dass die angegebenen Informationen wahr und korrekt sind.',
        certifyTrueAndAccurateError: 'Bitte bestätigen Sie, dass die Informationen wahr und korrekt sind.',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Geschäftskonto für Geschäftsausgaben zu verwenden.',
        isAuthorizedToUseBankAccountError: 'Sie müssen ein Kontrollbeamter mit der Berechtigung sein, das Geschäftskonto zu führen.',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Bestätigen Sie Ihr Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Validierung für dieses Bankkonto wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1-2 Werktagen werden wir drei (3) kleine Transaktionen an Ihr Bankkonto senden, von einem Namen wie "Expensify, Inc. Validation".`,
        descriptionCTA: 'Bitte geben Sie jeden Transaktionsbetrag in die untenstehenden Felder ein. Beispiel: 1,51.',
        letsChatText: 'Fast geschafft! Wir benötigen Ihre Hilfe, um ein paar letzte Informationen im Chat zu überprüfen. Bereit?',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die Zwei-Faktor-Authentifizierung (2FA) ein, um Ihrem Konto eine zusätzliche Schutzschicht hinzuzufügen.',
        secureYourAccount: 'Sichern Sie Ihr Konto',
    },
    countryStep: {
        confirmBusinessBank: 'Bestätigen Sie die Währung und das Land des Geschäftskontos',
        confirmCurrency: 'Währung und Land bestätigen',
        yourBusiness: 'Die Währung Ihres Geschäftskontos muss mit der Währung Ihres Arbeitsbereichs übereinstimmen.',
        youCanChange: 'Sie können die Währung Ihres Arbeitsbereichs in Ihrem ändern.',
        findCountry: 'Land finden',
        selectCountry: 'Land auswählen',
    },
    bankInfoStep: {
        whatAreYour: 'Was sind Ihre Geschäftskontodaten?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles in Ordnung ist.',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in Ihrem Arbeitsbereich verwendet.',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollständiger Name des autorisierten Unterzeichners',
    },
    signerInfoStep: {
        signerInfo: 'Unterzeichnerinformationen',
        areYouDirector: ({companyName}: CompanyNameParams) => `Sind Sie Direktor bei ${companyName}?`,
        regulationRequiresUs: 'Die Vorschrift erfordert, dass wir überprüfen, ob der Unterzeichner die Befugnis hat, diese Handlung im Namen des Unternehmens durchzuführen.',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name?',
        fullName: 'Vollständiger rechtlicher Name',
        whatsYourJobTitle: 'Wie lautet Ihre Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        uploadID: 'Laden Sie einen Ausweis und einen Adressnachweis hoch',
        personalAddress: 'Nachweis der persönlichen Adresse (z.B. Stromrechnung)',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        proofOf: 'Nachweis der persönlichen Adresse',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Geben Sie die E-Mail-Adresse des Direktors bei ${companyName} ein.`,
        regulationRequiresOneMoreDirector: 'Die Vorschrift erfordert mindestens einen weiteren Direktor als Unterzeichner.',
        hangTight: 'Bitte warten...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Geben Sie die E-Mails von zwei Direktoren bei ${companyName} ein.`,
        sendReminder: 'Erinnere senden',
        chooseFile: 'Datei auswählen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identität als Direktoren des Unternehmens verifizieren.',
        id: 'Kopie des Ausweises',
        proofOfDirectors: 'Nachweis des/der Direktors/Direktoren',
        proofOfDirectorsDescription: 'Beispiele: Unternehmensprofil von Oncorp oder Geschäftsregistrierung.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale für Unterzeichner, autorisierte Benutzer und wirtschaftlich Berechtigte.',
        PDSandFSG: 'PDS + FSG Offenlegungsunterlagen',
        PDSandFSGDescription: dedent(`
            Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um von deren umfangreichem Netzwerk internationaler Bankpartner zu profitieren und Global Reimbursements in Expensify zu ermöglichen. Gemäß australischen Vorschriften stellen wir Ihnen Corpays Financial Services Guide (FSG) und Product Disclosure Statement (PDS) zur Verfügung.

            Bitte lesen Sie die FSG- und PDS-Dokumente sorgfältig, da sie vollständige Details und wichtige Informationen zu den von Corpay angebotenen Produkten und Dienstleistungen enthalten. Bewahren Sie diese Dokumente für spätere Referenz auf.
        `),
        pleaseUpload: 'Bitte laden Sie zusätzliche Unterlagen hoch, um uns bei der Überprüfung Ihrer Identität als Direktor des Unternehmens zu unterstützen.',
        enterSignerInfo: 'Unterschriftsberechtigte Person eingeben',
        thisStep: 'Dieser Schritt wurde abgeschlossen',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindet ein Geschäftskonto in ${currency} mit der Endung ${bankAccountLastFour} mit Expensify, um Mitarbeitende in ${currency} zu bezahlen. Der nächste Schritt erfordert Informationen eines unterschriftsberechtigten Direktors.`,
        error: {
            emailsMustBeDifferent: 'E-Mail-Adressen müssen unterschiedlich sein',
        },
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte bestätigen Sie die untenstehenden Vereinbarungen',
        regulationRequiresUs: 'Die Vorschriften verlangen von uns, die Identität jeder Person zu überprüfen, die mehr als 25% des Unternehmens besitzt.',
        iAmAuthorized: 'Ich bin berechtigt, das Geschäftskonto für Geschäftsausgaben zu verwenden.',
        iCertify: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind.',
        iAcceptTheTermsAndConditions: `Ich akzeptiere die <a href="https://cross-border.corpay.com/tc/">Allgemeinen Geschäftsbedingungen</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen.',
        accept: 'Akzeptieren und Bankkonto hinzufügen',
        iConsentToThePrivacyNotice: 'Ich stimme der <a href="https://payments.corpay.com/compliance">Datenschutzerklärung</a> zu.',
        iConsentToThePrivacyNoticeAccessibility: 'Ich stimme der Datenschutzerklärung zu.',
        error: {
            authorized: 'Sie müssen ein Kontrollbeamter mit der Berechtigung sein, das Geschäftskonto zu führen.',
            certify: 'Bitte bestätigen Sie, dass die Informationen wahr und korrekt sind.',
            consent: 'Bitte stimmen Sie der Datenschutzerklärung zu.',
        },
    },
    docusignStep: {
        subheader: 'Docusign-Formular',
        pleaseComplete:
            'Bitte füllen Sie das ACH-Autorisierungsformular über den untenstehenden Docusign-Link aus und laden Sie anschließend die unterschriebene Kopie hier hoch, damit wir direkt von Ihrem Bankkonto abbuchen können.',
        pleaseCompleteTheBusinessAccount: 'Bitte füllen Sie den Antrag für ein Geschäftskonto und die Vereinbarung zum Lastschrifteinzug aus.',
        pleaseCompleteTheDirect:
            'Bitte füllen Sie die Vereinbarung zum Lastschrifteinzug über den untenstehenden Docusign-Link aus und laden Sie anschließend die unterschriebene Kopie hier hoch, damit wir direkt von Ihrem Bankkonto abbuchen können.',
        takeMeTo: 'Zu Docusign',
        uploadAdditional: 'Zusätzliche Dokumente hochladen',
        pleaseUpload: 'Bitte laden Sie das DEFT-Formular und die unterschriebene Docusign-Seite hoch.',
        pleaseUploadTheDirect: 'Bitte laden Sie die Lastschriftvereinbarung und die Docusign-Unterschriftsseite hoch.',
    },
    finishStep: {
        letsFinish: 'Lass uns im Chat fertig werden!',
        thanksFor:
            'Vielen Dank für diese Details. Ein dedizierter Support-Mitarbeiter wird nun Ihre Informationen überprüfen. Wir werden uns bei Ihnen melden, falls wir noch etwas von Ihnen benötigen. In der Zwischenzeit können Sie sich gerne mit Fragen an uns wenden.',
        iHaveA: 'Ich habe eine Frage.',
        enable2FA: 'Aktivieren Sie die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern.',
        weTake: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die Zwei-Faktor-Authentifizierung (2FA) ein, um Ihrem Konto eine zusätzliche Schutzschicht hinzuzufügen.',
        secure: 'Sichern Sie Ihr Konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Einen Moment',
        explanationLine: 'Wir überprüfen Ihre Informationen. Sie können in Kürze mit den nächsten Schritten fortfahren.',
    },
    session: {
        offlineMessageRetry: 'Es sieht so aus, als ob Sie offline sind. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    },
    travel: {
        header: 'Reise buchen',
        title: 'Reise clever',
        subtitle: 'Verwenden Sie Expensify Travel, um die besten Reiseangebote zu erhalten und alle Ihre Geschäftsausgaben an einem Ort zu verwalten.',
        features: {
            saveMoney: 'Sparen Sie Geld bei Ihren Buchungen',
            alerts: 'Erhalten Sie Echtzeit-Updates und -Benachrichtigungen',
        },
        bookTravel: 'Reise buchen',
        bookDemo: 'Demo buchen',
        bookADemo: 'Eine Demo buchen',
        toLearnMore: 'um mehr zu erfahren.',
        termsAndConditions: {
            header: 'Bevor wir fortfahren...',
            title: 'Allgemeine Geschäftsbedingungen',
            label: 'Ich stimme den Bedingungen und Konditionen zu',
            subtitle: `Bitte stimmen Sie den <a href="${CONST.TRAVEL_TERMS_URL}">Allgemeinen Geschäftsbedingungen</a> von Expensify Travel zu.`,
            error: 'Sie müssen den Expensify Travel Geschäftsbedingungen zustimmen, um fortzufahren.',
            defaultWorkspaceError:
                'Sie müssen einen Standard-Arbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehen Sie zu Einstellungen > Arbeitsbereiche > klicken Sie auf die drei vertikalen Punkte neben einem Arbeitsbereich > Als Standard-Arbeitsbereich festlegen und versuchen Sie es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Sie haben einen <strong>${layover} Zwischenstopp</strong> vor diesem Flug</muted-text-label>`,
            takeOff: 'Abheben',
            landing: 'Landung',
            seat: 'Sitzplatz',
            class: 'Kabinenklasse',
            recordLocator: 'Buchungscode',
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
            rentalCar: 'Autovermietung',
            pickUp: 'Abholung',
            dropOff: 'Abgabe',
            driver: 'Treiber',
            carType: 'Autotyp',
            cancellation: 'Stornierungsbedingungen',
            cancellationUntil: 'Kostenlose Stornierung bis',
            freeCancellation: 'Kostenlose Stornierung',
            confirmation: 'Bestätigungsnummer',
        },
        train: 'Schiene',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Abfahrten',
            arrives: 'Ankommt',
            coachNumber: 'Trainernummer',
            seat: 'Sitzplatz',
            fareDetails: 'Fahrpreisdetails',
            confirmation: 'Bestätigungsnummer',
        },
        viewTrip: 'Reise anzeigen',
        modifyTrip: 'Reise ändern',
        tripSupport: 'Reiseunterstützung',
        tripDetails: 'Reisedetails',
        viewTripDetails: 'Reisedetails anzeigen',
        trip: 'Reise',
        trips: 'Reisen',
        tripSummary: 'Reisezusammenfassung',
        departs: 'Abfahrten',
        errorMessage: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Bitte <a href="${phoneErrorMethodsRoute}">fügen Sie eine Arbeits-E-Mail als primäres Login hinzu</a>, um Reisen zu buchen.</rbr>`,
        domainSelector: {
            title: 'Domain',
            subtitle: 'Wählen Sie eine Domain für die Einrichtung von Expensify Travel.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `Sie haben nicht die Berechtigung, Expensify Travel für die Domain <strong>${domain}</strong>zu aktivieren. Sie müssen jemanden von dieser Domain bitten, stattdessen Reisen zu aktivieren.`,
            accountantInvitation: `Wenn Sie Buchhalter sind, sollten Sie sich für das <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved!-Buchhalterprogramm</a> anmelden, um Reisen für diesen Bereich zu ermöglichen.`,
        },
        publicDomainError: {
            title: 'Erste Schritte mit Expensify Travel',
            message: `Sie müssen Ihre Arbeits-E-Mail (z. B. name@company.com) mit Expensify Travel verwenden, nicht Ihre persönliche E-Mail (z. B. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: `Ihr Administrator hat Expensify Travel deaktiviert. Bitte befolgen Sie die Buchungsrichtlinien Ihres Unternehmens für Reisebuchungen.`,
        },
        verifyCompany: {
            title: 'Beginnen Sie noch heute mit dem Reisen!',
            message: `Bitte kontaktieren Sie Ihren Account Manager oder salesteam@expensify.com, um eine Demo von Travel zu erhalten und es für Ihr Unternehmen zu aktivieren.`,
            confirmText: 'Verstanden',
            conciergeMessage: ({domain}: {domain: string}) => `Reiseaktivierung für die Domain: ${domain} fehlgeschlagen. Bitte überprüfen und aktivieren Sie Reisen für diese Domain.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde gebucht. Bestätigungscode: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde storniert.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde erstattet oder umgetauscht.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde von der Fluggesellschaft storniert.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `Die Fluggesellschaft hat eine Flugplanänderung für den Flug ${airlineCode} vorgeschlagen; wir warten auf die Bestätigung.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Flugplanänderung bestätigt: Flug ${airlineCode} startet jetzt um ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde aktualisiert.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Ihre Kabinenklasse wurde auf ${cabinClass} auf dem Flug ${airlineCode} aktualisiert.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde bestätigt.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde geändert.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzzuweisung auf dem Flug ${airlineCode} wurde entfernt.`,
            paymentDeclined: 'Die Zahlung für Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Sie haben Ihre ${type}-Reservierung ${id} storniert.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Der Anbieter hat Ihre ${type}-Reservierung ${id} storniert.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Ihre ${type} Reservierung wurde neu gebucht. Neue Bestätigungsnummer: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Ihre ${type}-Buchung wurde aktualisiert. Überprüfen Sie die neuen Details im Reiseplan.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde erstattet. Eine Gutschrift wird bearbeitet.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde umgetauscht.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Ihr Zugticket für ${origin} → ${destination} am ${startDate} wurde aktualisiert.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Ihre ${type} Reservierung wurde aktualisiert.`,
        },
        flightTo: 'Flug nach',
        trainTo: 'Zug nach',
        carRental: ' Mietwagen',
        nightIn: 'Nacht in',
        nightsIn: 'Nächte in',
    },
    workspace: {
        common: {
            card: 'Karten',
            expensifyCard: 'Expensify Card',
            companyCards: 'Unternehmenskarten',
            workflows: 'Arbeitsabläufe',
            workspace: 'Arbeitsbereich',
            findWorkspace: 'Arbeitsbereich finden',
            edit: 'Arbeitsbereich bearbeiten',
            enabled: 'Aktiviert',
            disabled: 'Deaktiviert',
            everyone: 'Jeder',
            delete: 'Arbeitsbereich löschen',
            settings: 'Einstellungen',
            reimburse: 'Erstattungen',
            categories: 'Kategorien',
            tags: 'Schlagwörter',
            customField1: 'Benutzerdefiniertes Feld 1',
            customField2: 'Benutzerdefiniertes Feld 2',
            customFieldHint: 'Fügen Sie benutzerdefinierten Code hinzu, der für alle Ausgaben dieses Mitglieds gilt.',
            reports: 'Berichte',
            reportFields: 'Berichtsfelder',
            reportTitle: 'Berichtstitel',
            reportField: 'Berichtsfeld',
            taxes: 'Steuern',
            bills: 'Rechnungen',
            invoices: 'Rechnungen',
            perDiem: 'Per diem',
            travel: 'Reisen',
            members: 'Mitglieder',
            accounting: 'Buchhaltung',
            receiptPartners: 'Beleg-Partner',
            rules: 'Regeln',
            displayedAs: 'Angezeigt als',
            plan: 'Plan',
            profile: 'Übersicht',
            bankAccount: 'Bankkonto',
            testTransactions: 'Transaktionen testen',
            issueAndManageCards: 'Karten ausstellen und verwalten',
            reconcileCards: 'Karten abstimmen',
            selectAll: 'Alle auswählen',
            selected: () => ({
                one: '1 ausgewählt',
                other: (count: number) => `${count} ausgewählt`,
            }),
            settlementFrequency: 'Abrechnungshäufigkeit',
            setAsDefault: 'Als Standard-Arbeitsbereich festlegen',
            defaultNote: `Belege, die an ${CONST.EMAIL.RECEIPTS} gesendet werden, erscheinen in diesem Arbeitsbereich.`,
            deleteConfirmation: 'Möchten Sie diesen Arbeitsbereich wirklich löschen?',
            deleteWithCardsConfirmation: 'Möchten Sie diesen Arbeitsbereich wirklich löschen? Dadurch werden alle Karten-Feeds und zugewiesenen Karten entfernt.',
            unavailable: 'Nicht verfügbarer Arbeitsbereich',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied zum Arbeitsbereich einzuladen, verwenden Sie bitte die Einladungsschaltfläche oben.',
            notAuthorized: `Sie haben keinen Zugriff auf diese Seite. Wenn Sie versuchen, diesem Arbeitsbereich beizutreten, bitten Sie einfach den Besitzer des Arbeitsbereichs, Sie als Mitglied hinzuzufügen. Etwas anderes? Kontaktieren Sie ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Zum Arbeitsbereich gehen',
            duplicateWorkspace: 'Arbeitsbereich duplizieren',
            duplicateWorkspacePrefix: 'Duplizieren',
            goToWorkspaces: 'Zu Arbeitsbereichen gehen',
            clearFilter: 'Filter löschen',
            workspaceName: 'Arbeitsbereichsname',
            workspaceOwner: 'Eigentümer',
            workspaceType: 'Arbeitsbereichstyp',
            workspaceAvatar: 'Arbeitsbereichs-Avatar',
            mustBeOnlineToViewMembers: 'Sie müssen online sein, um die Mitglieder dieses Arbeitsbereichs anzuzeigen.',
            moreFeatures: 'Mehr Funktionen',
            requested: 'Angefordert',
            distanceRates: 'Entfernungsraten',
            defaultDescription: 'Ein Ort für alle Ihre Belege und Ausgaben.',
            descriptionHint: 'Teilen Sie Informationen über diesen Arbeitsbereich mit allen Mitgliedern.',
            welcomeNote: 'Bitte verwenden Sie Expensify, um Ihre Belege zur Erstattung einzureichen, danke!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell eingegeben markieren',
            markAsExported: 'Als exportiert markieren',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportieren nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
            lineItemLevel: 'Positionsebene',
            reportLevel: 'Berichtsebene',
            topLevel: 'Top-Level',
            appliedOnExport: 'Nicht in Expensify importiert, bei Export angewendet',
            shareNote: {
                header: 'Teilen Sie Ihren Arbeitsbereich mit anderen Mitgliedern',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Teilen Sie diesen QR-Code oder kopieren Sie den unten stehenden Link, um es Mitgliedern leicht zu machen, Zugang zu Ihrem Arbeitsbereich zu beantragen. Alle Anträge auf Zugang zum Arbeitsbereich werden im Raum <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> zu Ihrer Überprüfung angezeigt.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verbinden`,
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Vorhandene Verbindung wiederverwenden',
            existingConnections: 'Bestehende Verbindungen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Da Sie zuvor eine Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} hergestellt haben, können Sie eine bestehende Verbindung wiederverwenden oder eine neue erstellen.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Zuletzt synchronisiert am ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Kann nicht mit ${connectionName} verbunden werden aufgrund eines Authentifizierungsfehlers.`,
            learnMore: 'Mehr erfahren',
            memberAlternateText: 'Mitglieder können Berichte einreichen und genehmigen.',
            adminAlternateText: 'Administratoren haben vollen Bearbeitungszugriff auf alle Berichte und Arbeitsbereichseinstellungen.',
            auditorAlternateText: 'Prüfer können Berichte einsehen und kommentieren.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
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
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-Transaktionen werden automatisch in ein mit <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">unserer Integration</a> erstelltes „Expensify Card Liability Account“ exportiert.</muted-text-label>`,
        },
        receiptPartners: {
            connect: 'Jetzt verbinden',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbunden mit ${organizationName}` : 'Automatisieren Sie Reise- und Essenslieferungskosten in Ihrer Organisation.',
                sendInvites: 'Mitglieder einladen',
                sendInvitesDescription: 'Diese Workspace-Mitglieder haben noch kein Uber for Business-Konto. Deaktivieren Sie alle Mitglieder, die Sie derzeit nicht einladen möchten.',
                confirmInvite: 'Einladung bestätigen',
                manageInvites: 'Einladungen verwalten',
                confirm: 'Bestätigen',
                allSet: 'Alles erledigt',
                readyToRoll: 'Sie sind startklar',
                takeBusinessRideMessage: "Machen Sie eine Geschäftsfahrt und Ihre Uber-Belege werden in Expensify importiert. Los geht's!",
                all: 'Alle',
                linked: 'Verknüpft',
                outstanding: 'Ausstehend',
                status: {
                    resend: 'Erneut senden',
                    invite: 'Einladen',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Verknüpft',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Ausstehend',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Gesperrt',
                },
                centralBillingAccount: 'Zentrales Abrechnungskonto',
                centralBillingDescription: 'Wählen Sie, wohin alle Uber-Belege importiert werden sollen.',
                invitationFailure: 'Der Teilnehmer konnte nicht zu Uber for Business eingeladen werden.',
                autoInvite: 'Neue Workspace-Mitglieder zu Uber for Business einladen',
                autoRemove: 'Entfernte Workspace-Mitglieder von Uber for Business deaktivieren',
                bannerTitle: 'Expensify + Uber ren pekin angang',
                bannerDescription: 'Kopwe riri ngeni Uber ren Business pwe epwe otot ren monien sai me mongo non unusen om mwicheich.',
                emptyContent: {
                    title: 'Keine ausstehenden Einladungen',
                    subtitle: 'Hurra! Wir haben hoch und niedrig gesucht und keine ausstehenden Einladungen gefunden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Setzen Sie Tagespauschalen, um die täglichen Ausgaben der Mitarbeiter zu kontrollieren. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Mehr erfahren</a>.</muted-text>`,
            amount: 'Betrag',
            deleteRates: () => ({
                one: 'Löschrate',
                other: 'Raten löschen',
            }),
            deletePerDiemRate: 'Tagespauschale löschen',
            findPerDiemRate: 'Tagespauschale finden',
            areYouSureDelete: () => ({
                one: 'Möchten Sie diesen Satz wirklich löschen?',
                other: 'Möchten Sie diese Tarife wirklich löschen?',
            }),
            emptyList: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Tagessätze fest, um die täglichen Ausgaben der Mitarbeiter zu kontrollieren. Importieren Sie die Sätze aus einer Tabelle, um loszulegen.',
            },
            importPerDiemRates: 'Tagespauschalen importieren',
            editPerDiemRate: 'Tagespauschale bearbeiten',
            editPerDiemRates: 'Tagespauschalen bearbeiten',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Das Aktualisieren dieses Ziels wird es für alle ${destination} Tagespauschalen ändern.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Das Aktualisieren dieser Währung wird sie für alle ${destination} Tagegeld-Subraten ändern.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Desktop exportiert werden.',
            exportOutOfPocketExpensesCheckToggle: 'Markiere Schecks als „später drucken“',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Desktop exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            account: 'Konto',
            accountDescription: 'Wählen Sie, wo Sie Journaleinträge veröffentlichen möchten.',
            accountsPayable: 'Verbindlichkeiten',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wählen Sie aus, von wo aus Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten zu QuickBooks Desktop.',
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
            exportCheckDescription: 'Wir werden für jeden Expensify-Bericht eine detaillierte Rechnung erstellen und sie von dem unten stehenden Bankkonto senden.',
            exportJournalEntryDescription: 'Wir werden für jeden Expensify-Bericht einen detaillierten Journaleintrag erstellen und ihn auf das untenstehende Konto buchen.',
            exportVendorBillDescription:
                'Wir erstellen eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht und fügen sie dem unten stehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop unterstützt keine Steuern bei Journalbuchungsexporten. Da Sie Steuern in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journalbuchung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Prüfen',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Wir werden für jeden Expensify-Bericht eine detaillierte Rechnung erstellen und sie von dem unten stehenden Bankkonto senden.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Wir ordnen den Händlernamen der Kreditkartentransaktion automatisch den entsprechenden Lieferanten in QuickBooks zu. Wenn keine Lieferanten vorhanden sind, erstellen wir einen Lieferanten 'Kreditkarte Verschiedenes' zur Zuordnung.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir werden eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht mit dem Datum der letzten Ausgabe erstellen und sie dem untenstehenden Konto hinzufügen. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    'Wählen Sie, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wählen Sie einen Anbieter, um ihn auf alle Kreditkartentransaktionen anzuwenden.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wählen Sie aus, von wo aus Schecks gesendet werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Desktop hinzu und synchronisieren Sie die Verbindung erneut.',
            qbdSetup: 'QuickBooks Desktop-Einrichtung',
            requiredSetupDevice: {
                title: 'Kann von diesem Gerät aus keine Verbindung herstellen.',
                body1: 'Sie müssen diese Verbindung von dem Computer aus einrichten, auf dem Ihre QuickBooks Desktop-Unternehmensdatei gehostet wird.',
                body2: 'Sobald Sie verbunden sind, können Sie von überall aus synchronisieren und exportieren.',
            },
            setupPage: {
                title: 'Öffnen Sie diesen Link, um eine Verbindung herzustellen.',
                body: 'Um die Einrichtung abzuschließen, öffnen Sie den folgenden Link auf dem Computer, auf dem QuickBooks Desktop ausgeführt wird.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Bitte versuchen Sie es später noch einmal oder <a href="${conciergeLink}">wenden Sie sich an Concierge</a>, wenn das Problem weiterhin besteht.</centered-text></muted-text>`,
            },
            importDescription: 'Wählen Sie aus, welche Kodierungskonfigurationen aus QuickBooks Desktop in Expensify importiert werden sollen.',
            classes: 'Klassen',
            items: 'Artikel',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Unternehmenskartenkäufe nach QuickBooks Desktop exportiert werden.',
            defaultVendorDescription: 'Legen Sie einen Standardanbieter fest, der bei Export auf alle Kreditkartentransaktionen angewendet wird.',
            accountsDescription: 'Ihr QuickBooks Desktop-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Klassen in Expensify behandelt werden sollen.',
            tagsDisplayedAsDescription: 'Positionsebene',
            reportFieldsDisplayedAsDescription: 'Berichtsebene',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Kunden/Projekte in Expensify behandelt werden sollen.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit QuickBooks Desktop synchronisieren.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription: 'Expensify wird automatisch Lieferanten in QuickBooks Desktop erstellen, wenn sie noch nicht existieren.',
            },
            itemsDescription: 'Wählen Sie, wie QuickBooks Desktop-Elemente in Expensify behandelt werden sollen.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen werden exportiert, wenn sie endgültig genehmigt sind.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, wenn sie bezahlt sind.',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'Wählen Sie aus, welche Codierungskonfigurationen aus QuickBooks Online in Expensify importiert werden sollen.',
            classes: 'Klassen',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr QuickBooks Online-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie, wie QuickBooks Online-Klassen in Expensify behandelt werden sollen.',
            customersDescription: 'Wählen Sie, wie QuickBooks Online-Kunden/Projekte in Expensify behandelt werden sollen.',
            locationsDescription: 'Wählen Sie aus, wie QuickBooks Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'Wählen Sie, wie QuickBooks Online-Steuern in Expensify behandelt werden sollen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online unterstützt keine Standorte auf Zeilenebene für Schecks oder Lieferantenrechnungen. Wenn Sie Standorte auf Zeilenebene haben möchten, stellen Sie sicher, dass Sie Journalbuchungen und Kredit-/Debitkartenausgaben verwenden.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online unterstützt keine Steuern bei Journaleinträgen. Bitte ändern Sie Ihre Exportoption auf Lieferantenrechnung oder Scheck.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Online exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
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
            exportInvoicesDescription: 'Verwenden Sie dieses Konto beim Exportieren von Rechnungen zu QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Unternehmenskartenkäufe nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Legen Sie einen Standardanbieter fest, der bei Export auf alle Kreditkartentransaktionen angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir werden für jeden Expensify-Bericht eine detaillierte Rechnung erstellen und sie von dem unten stehenden Bankkonto senden.',
            exportJournalEntryDescription: 'Wir werden für jeden Expensify-Bericht einen detaillierten Journaleintrag erstellen und ihn auf das untenstehende Konto buchen.',
            exportVendorBillDescription:
                'Wir erstellen eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht und fügen sie dem unten stehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'Wählen Sie, wo Sie Journaleinträge veröffentlichen möchten.',
            accountsPayable: 'Verbindlichkeiten',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wählen Sie aus, von wo aus Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online unterstützt keine Standorte bei Exporten von Lieferantenrechnungen. Da Sie Standorte in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online unterstützt keine Steuern bei Exporten von Journalbuchungen. Da Sie Steuern in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit QuickBooks Online synchronisieren.',
                inviteEmployees: 'Mitarbeiter einladen',
                inviteEmployeesDescription: 'Importieren Sie QuickBooks Online-Mitarbeiterdatensätze und laden Sie Mitarbeiter in diesen Arbeitsbereich ein.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription:
                    'Expensify erstellt automatisch Lieferanten in QuickBooks Online, wenn sie noch nicht existieren, und erstellt automatisch Kunden beim Exportieren von Rechnungen.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden QuickBooks Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks-Rechnungszahlungskonto',
                qboInvoiceCollectionAccount: 'QuickBooks Rechnungsinkasso-Konto',
                accountSelectDescription: 'Wählen Sie aus, von wo aus Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wo Sie Rechnungszahlungen erhalten möchten, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitkarte',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journalbuchung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Prüfen',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "Wir ordnen den Händlernamen der Debitkartentransaktion automatisch den entsprechenden Anbietern in QuickBooks zu. Wenn keine Anbieter existieren, erstellen wir einen Anbieter 'Debit Card Misc.' zur Zuordnung.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Wir ordnen den Händlernamen der Kreditkartentransaktion automatisch den entsprechenden Lieferanten in QuickBooks zu. Wenn keine Lieferanten vorhanden sind, erstellen wir einen Lieferanten 'Kreditkarte Verschiedenes' zur Zuordnung.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir werden eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht mit dem Datum der letzten Ausgabe erstellen und sie dem untenstehenden Konto hinzufügen. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wählen Sie, wohin die Debitkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wählen Sie, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wählen Sie einen Anbieter, um ihn auf alle Kreditkartentransaktionen anzuwenden.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wählen Sie ein gültiges Konto für den Export der Lieferantenrechnung aus',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wählen Sie ein gültiges Konto für den Export des Journaleintrags aus',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wählen Sie ein gültiges Konto für den Scheckexport aus',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Um die Lieferantenrechnungs-Exportfunktion zu nutzen, richten Sie ein Kreditorenkonto in QuickBooks Online ein.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Um den Export von Journaleinträgen zu verwenden, richten Sie ein Journal-Konto in QuickBooks Online ein.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Um den Scheckexport zu verwenden, richten Sie ein Bankkonto in QuickBooks Online ein.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Online hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen werden exportiert, wenn sie endgültig genehmigt sind.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, wenn sie bezahlt sind.',
                },
            },
        },
        workspaceList: {
            joinNow: 'Jetzt beitreten',
            askToJoin: 'Beitreten anfragen',
        },
        xero: {
            organization: 'Xero-Organisation',
            organizationDescription: 'Wählen Sie die Xero-Organisation aus, aus der Sie Daten importieren möchten.',
            importDescription: 'Wählen Sie aus, welche Kodierungskonfigurationen von Xero nach Expensify importiert werden sollen.',
            accountsDescription: 'Ihr Xero-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            trackingCategories: 'Verfolgungskategorien',
            trackingCategoriesDescription: 'Wählen Sie, wie Xero-Tracking-Kategorien in Expensify behandelt werden sollen.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Xero ${categoryName} zuordnen zu`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Wählen Sie, wo ${categoryName} beim Export nach Xero zugeordnet werden soll.`,
            customers: 'Kunden erneut in Rechnung stellen',
            customersDescription:
                'Wählen Sie, ob Sie Kunden in Expensify erneut in Rechnung stellen möchten. Ihre Xero-Kundenkontakte können Ausgaben zugeordnet werden und werden als Verkaufsrechnung nach Xero exportiert.',
            taxesDescription: 'Wählen Sie, wie Xero-Steuern in Expensify behandelt werden sollen.',
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
                'Exportierte Ausgaben werden als Banktransaktionen auf das unten stehende Xero-Bankkonto gebucht, und die Transaktionsdaten werden mit den Daten auf Ihrem Kontoauszug übereinstimmen.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero-Bankkonto',
            xeroBankAccountDescription: 'Wählen Sie, wo Ausgaben als Banktransaktionen gebucht werden sollen.',
            exportExpensesDescription: 'Berichte werden als Einkaufsrechnung mit dem unten ausgewählten Datum und Status exportiert.',
            purchaseBillDate: 'Rechnungsdatum des Kaufs',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Verkaufsrechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung gesendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Xero synchronisieren.',
                purchaseBillStatusTitle: 'Kaufrechnungsstatus',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden Xero-Konto erstellt.',
                xeroBillPaymentAccount: 'Xero-Rechnungszahlungskonto',
                xeroInvoiceCollectionAccount: 'Xero-Rechnungsinkassokonto',
                xeroBillPaymentAccountDescription: 'Wählen Sie aus, von wo aus Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wo Sie Rechnungszahlungen erhalten möchten, und wir erstellen die Zahlung in Xero.',
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
                label: 'Kaufrechnungsstatus',
                description: 'Verwenden Sie diesen Status beim Exportieren von Einkaufsrechnungen nach Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Entwurf',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Warten auf Genehmigung',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Zahlung ausstehend',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in Xero hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen werden exportiert, wenn sie endgültig genehmigt sind.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, wenn sie bezahlt sind.',
                },
            },
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
                description: 'Legen Sie fest, wie Auslagen in Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Spesenabrechnungen',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            nonReimbursableExpenses: {
                description: 'Legen Sie fest, wie Unternehmenskartenkäufe nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Kreditkarten',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            creditCardAccount: 'Kreditkartenkonto',
            defaultVendor: 'Standardanbieter',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Legen Sie einen Standardanbieter fest, der auf ${isReimbursable ? '' : 'non-'} erstattungsfähige Ausgaben angewendet wird, die keinen passenden Anbieter in Sage Intacct haben.`,
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Sage Intacct exportiert werden.',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch ein Domain-Admin sein, wenn Sie in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zur Exportierung in seinem Konto.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: `Bitte fügen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut.`,
            autoSync: 'Auto-Synchronisierung',
            autoSyncDescription: 'Expensify wird automatisch jeden Tag mit Sage Intacct synchronisieren.',
            inviteEmployees: 'Mitarbeiter einladen',
            inviteEmployeesDescription:
                'Importieren Sie Sage Intacct-Mitarbeiterdatensätze und laden Sie Mitarbeiter in diesen Arbeitsbereich ein. Ihr Genehmigungsworkflow wird standardmäßig auf Managergenehmigung gesetzt und kann auf der Mitgliederseite weiter konfiguriert werden.',
            syncReimbursedReports: 'Synchronisiere erstattete Berichte',
            syncReimbursedReportsDescription:
                'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden Sage Intacct-Konto erstellt.',
            paymentAccount: 'Sage Intacct Zahlungskonto',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen werden exportiert, wenn sie endgültig genehmigt sind.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, wenn sie bezahlt sind.',
                },
            },
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'Wählen Sie die Tochtergesellschaft in NetSuite aus, aus der Sie Daten importieren möchten.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto für Buchungseinträge',
            journalEntriesProvTaxPostingAccount: 'Journalbuchungen Provinzsteuerbuchungskonto',
            foreignCurrencyAmount: 'Fremdwährungsbetrag exportieren',
            exportToNextOpenPeriod: 'In die nächste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Nicht erstattungsfähiges Journalbuchungskonto',
            reimbursableJournalPostingAccount: 'Erstattungsfähiges Journalbuchungskonto',
            journalPostingPreference: {
                label: 'Buchungseinstellungen für Journalbuchungen',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Einzelner, aufgeschlüsselter Eintrag für jeden Bericht',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Einzelner Eintrag für jede Ausgabe',
                },
            },
            invoiceItem: {
                label: 'Rechnungsposition',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Erstelle eins für mich.',
                        description: 'Wir erstellen für Sie einen "Expensify-Rechnungsposition" beim Export (falls noch keiner existiert).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Vorhandenes auswählen',
                        description: 'Wir werden Rechnungen von Expensify mit dem unten ausgewählten Element verknüpfen.',
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
                        reimbursableDescription: dedent(`
                            Auslagen werden als Journalbuchungen in das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Spesen von Firmenkarten werden als Journalbuchungen in das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Lieferantenrechnungen',
                        reimbursableDescription: dedent(`
                            Auslagen werden als Journalbuchungen in das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Spesen von Firmenkarten werden als Journalbuchungen in das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Journalbuchungen',
                        reimbursableDescription: dedent(`
                            Auslagen werden als Journalbuchungen in das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Spesen von Firmenkarten werden als Journalbuchungen in das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Wenn Sie die Exporteinstellung für Firmenkarten auf Spesenabrechnungen umstellen, werden NetSuite-Lieferanten und Buchungskonten für einzelne Karten deaktiviert.\n\nKeine Sorge, wir speichern Ihre vorherigen Auswahlen trotzdem, falls Sie später wieder wechseln möchten.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit NetSuite synchronisiert.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Erstattungskonto',
                reimbursementsAccountDescription: 'Wählen Sie das Bankkonto aus, das Sie für Rückerstattungen verwenden möchten, und wir erstellen die zugehörige Zahlung in NetSuite.',
                collectionsAccount: 'Sammlungskonto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und nach NetSuite exportiert wird, erscheint sie auf dem unten stehenden Konto.',
                approvalAccount: 'A/P Genehmigungskonto',
                approvalAccountDescription:
                    'Wählen Sie das Konto, gegen das Transaktionen in NetSuite genehmigt werden. Wenn Sie erstattete Berichte synchronisieren, ist dies auch das Konto, gegen das Zahlungsanweisungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite-Standardwert',
                inviteEmployees: 'Mitarbeiter einladen und Genehmigungen festlegen',
                inviteEmployeesDescription:
                    'Importieren Sie NetSuite-Mitarbeiterdatensätze und laden Sie Mitarbeiter in diesen Arbeitsbereich ein. Ihr Genehmigungsworkflow wird standardmäßig auf die Genehmigung durch den Manager eingestellt und kann auf der Seite *Mitglieder* weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeiter/Lieferanten automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription:
                    'Standardmäßig erstellt Expensify Einträge mit dem bevorzugten Transaktionsformular, das in NetSuite festgelegt ist. Alternativ können Sie ein bestimmtes Transaktionsformular festlegen, das verwendet werden soll.',
                customFormIDReimbursable: 'Auslage',
                customFormIDNonReimbursable: 'Unternehmenskarte Ausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsebene für Spesenabrechnungen',
                    description:
                        'Sobald ein Spesenbericht in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite eine zusätzliche Genehmigungsebene festlegen, bevor er gebucht wird.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite-Standardpräferenz',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Nur vom Vorgesetzten genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Nur Buchhaltung genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Vorgesetzter und Buchhaltung genehmigt',
                    },
                },
                accountingMethods: {
                    label: 'Wann exportieren',
                    description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen werden exportiert, wenn sie endgültig genehmigt sind.',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, wenn sie bezahlt sind.',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsstufe für Lieferantenrechnungen',
                    description:
                        'Sobald eine Lieferantenrechnung in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite eine zusätzliche Genehmigungsebene vor dem Buchen festlegen.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite-Standardpräferenz',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zur Veröffentlichung freigegeben',
                    },
                },
                exportJournalsTo: {
                    label: 'Genehmigungsebene für Journaleinträge',
                    description:
                        'Sobald ein Journaleintrag in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite eine zusätzliche Genehmigungsebene festlegen, bevor er gebucht wird.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite-Standardpräferenz',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zur Veröffentlichung freigegeben',
                    },
                },
                error: {
                    customFormID: 'Bitte geben Sie eine gültige numerische benutzerdefinierte Formular-ID ein.',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noVendorsFound: 'Keine Anbieter gefunden',
            noVendorsFoundDescription: 'Bitte fügen Sie Lieferanten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noItemsFound: 'Keine Rechnungspositionen gefunden',
            noItemsFoundDescription: 'Bitte fügen Sie Rechnungspositionen in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noSubsidiariesFound: 'Keine Tochtergesellschaften gefunden',
            noSubsidiariesFoundDescription: 'Bitte fügen Sie eine Tochtergesellschaft in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            tokenInput: {
                title: 'NetSuite-Einrichtung',
                formSteps: {
                    installBundle: {
                        title: 'Installieren Sie das Expensify-Paket',
                        description: 'In NetSuite, gehe zu *Customization > SuiteBundler > Search & Install Bundles* > suche nach "Expensify" > installiere das Bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Tokenbasierte Authentifizierung aktivieren',
                        description: 'In NetSuite, gehe zu *Setup > Company > Enable Features > SuiteCloud* > aktiviere *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-Webdienste aktivieren',
                        description: 'In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Erstellen Sie ein Zugriffstoken',
                        description:
                            'In NetSuite, gehen Sie zu *Setup > Users/Roles > Access Tokens* > erstellen Sie ein Zugriffstoken für die "Expensify"-App und entweder die Rolle "Expensify Integration" oder "Administrator".\n\n*Wichtig:* Stellen Sie sicher, dass Sie die *Token-ID* und das *Token Secret* aus diesem Schritt speichern. Sie benötigen es für den nächsten Schritt.',
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
                crossSubsidiaryCustomers: 'Kunden/Projekte über Tochtergesellschaften hinweg',
                importFields: {
                    departments: {
                        title: 'Abteilungen',
                        subtitle: 'Wählen Sie, wie die NetSuite-*Abteilungen* in Expensify behandelt werden sollen.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Wählen Sie, wie *Klassen* in Expensify behandelt werden sollen.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'Wählen Sie, wie *Standorte* in Expensify behandelt werden sollen.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'Wählen Sie aus, wie NetSuite-*Kunden* und *Projekte* in Expensify behandelt werden sollen.',
                    importCustomers: 'Kunden importieren',
                    importJobs: 'Projekte importieren',
                    customers: 'Kunden',
                    jobs: 'Projekte',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('und')}, ${importType}`,
                },
                importTaxDescription: 'Steuergruppen aus NetSuite importieren.',
                importCustomFields: {
                    chooseOptionBelow: 'Wählen Sie eine der folgenden Optionen:',
                    label: ({importedTypes}: ImportedTypesParams) => `Imported as ${importedTypes.join('und')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Bitte geben Sie das ${fieldName} ein.`,
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Datensätze',
                        addText: 'Benutzerdefiniertes Segment/Datensatz hinzufügen',
                        recordTitle: 'Benutzerdefinierte Segment/Aufzeichnung',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration von benutzerdefinierten Segmenten/Datensätzen.',
                        emptyTitle: 'Fügen Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzu',
                        fields: {
                            segmentName: 'Name',
                            internalID: 'Interne ID',
                            scriptID: 'Script-ID',
                            customRecordScriptID: 'Transaktionsspalten-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefiniertes Segment/Datensatz entfernen',
                        removePrompt: 'Möchten Sie diesen benutzerdefinierten Abschnitt/Datensatz wirklich entfernen?',
                        addForm: {
                            customSegmentName: 'benutzerdefinierter Segmentname',
                            customRecordName: 'benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefiniertes Segment',
                            customSegmentAddTitle: 'Benutzerdefiniertes Segment hinzufügen',
                            customRecordAddTitle: 'Benutzerdefinierten Datensatz hinzufügen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'Möchten Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzufügen?',
                            customSegmentNameTitle: 'Wie lautet der Name des benutzerdefinierten Segments?',
                            customRecordNameTitle: 'Wie lautet der benutzerdefinierte Datensatzname?',
                            customSegmentNameFooter: `Sie finden benutzerdefinierte Segmentnamen in NetSuite unter *Customizations > Links, Records & Fields > Custom Segments* Seite.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Sie können benutzerdefinierte Datensatznamen in NetSuite finden, indem Sie "Transaction Column Field" in die globale Suche eingeben.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Wie lautet die interne ID?',
                            customSegmentInternalIDFooter: `Zuerst stellen Sie sicher, dass Sie interne IDs in NetSuite unter *Home > Set Preferences > Show Internal ID* aktiviert haben.\n\nSie können die internen IDs von benutzerdefinierten Segmenten in NetSuite unter folgendem Pfad finden:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Klicken Sie auf ein benutzerdefiniertes Segment.\n3. Klicken Sie auf den Hyperlink neben *Custom Record Type*.\n4. Finden Sie die interne ID in der Tabelle am unteren Rand.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Sie können benutzerdefinierte Datensatz-IDs in NetSuite finden, indem Sie die folgenden Schritte ausführen:\n\n1. Geben Sie "Transaction Line Fields" in die globale Suche ein.\n2. Klicken Sie auf einen benutzerdefinierten Datensatz.\n3. Finden Sie die interne ID auf der linken Seite.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Was ist die Skript-ID?',
                            customSegmentScriptIDFooter: `Sie können benutzerdefinierte Segment-Skript-IDs in NetSuite unter folgendem Pfad finden:\n\n1. *Anpassung > Listen, Datensätze und Felder > Benutzerdefinierte Segmente*.\n2. Klicken Sie auf ein benutzerdefiniertes Segment.\n3. Klicken Sie auf die Registerkarte *Anwendung und Beschaffung* unten, dann:\n    a. Wenn Sie das benutzerdefinierte Segment als *Tag* (auf der Positionsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transaktionsspalten* und verwenden Sie die *Feld-ID*.\n    b. Wenn Sie das benutzerdefinierte Segment als *Berichtsfeld* (auf der Berichtebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transaktionen* und verwenden Sie die *Feld-ID*.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Was ist die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: `Sie können benutzerdefinierte Skript-IDs in NetSuite unter folgendem finden:\n\n1. Geben Sie "Transaction Line Fields" in die globale Suche ein.\n2. Klicken Sie auf einen benutzerdefinierten Datensatz.\n3. Finden Sie die Skript-ID auf der linken Seite.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Wie sollte dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Datensatz in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Ein benutzerdefiniertes Segment/Datensatz mit dieser ${fieldName?.toLowerCase()} existiert bereits.`,
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
                        removePrompt: 'Möchten Sie diese benutzerdefinierte Liste wirklich entfernen?',
                        addForm: {
                            listNameTitle: 'Wählen Sie eine benutzerdefinierte Liste aus',
                            transactionFieldIDTitle: 'Was ist die Transaktionsfeld-ID?',
                            transactionFieldIDFooter: `Sie können Transaktionsfeld-IDs in NetSuite finden, indem Sie folgende Schritte ausführen:\n\n1. Geben Sie "Transaction Line Fields" in die globale Suche ein.\n2. Klicken Sie auf eine benutzerdefinierte Liste.\n3. Finden Sie die Transaktionsfeld-ID auf der linken Seite.\n\n_Für detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Wie sollte diese benutzerdefinierte Liste in Expensify angezeigt werden?',
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
                            `Wenn Sie ${importField} in NetSuite verwenden, wenden wir den Standardwert an, der beim Export auf dem Mitarbeiterdatensatz im Spesenbericht oder Journalbuchung festgelegt ist.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Positionsebene',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} wird für jede einzelne Ausgabe in einem Mitarbeiterbericht auswählbar sein.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Berichtsfelder',
                        description: 'Berichtsebene',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} Auswahl wird auf alle Ausgaben im Bericht eines Mitarbeiters angewendet.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct Einrichtung',
            prerequisitesTitle: 'Bevor Sie sich verbinden...',
            downloadExpensifyPackage: 'Laden Sie das Expensify-Paket für Sage Intacct herunter',
            followSteps: 'Befolgen Sie die Schritte in unserer Anleitung: Verbinden mit Sage Intacct.',
            enterCredentials: 'Geben Sie Ihre Sage Intacct-Anmeldedaten ein',
            entity: 'Entity',
            employeeDefault: 'Sage Intacct Mitarbeiterstandard',
            employeeDefaultDescription: 'Die Standardabteilung des Mitarbeiters wird auf seine Ausgaben in Sage Intacct angewendet, falls eine vorhanden ist.',
            displayedAsTagDescription: 'Die Abteilung wird für jede einzelne Ausgabe in einem Bericht eines Mitarbeiters auswählbar sein.',
            displayedAsReportFieldDescription: 'Die Abteilungsauswahl gilt für alle Ausgaben im Bericht eines Mitarbeiters.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wählen Sie, wie Sage Intacct behandelt werden soll <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: 'Ausgabenarten',
            expenseTypesDescription: 'Ihre Sage Intacct-Ausgabenarten werden in Expensify als Kategorien importiert.',
            accountTypesDescription: 'Ihr Sage Intacct-Kontenplan wird in Expensify als Kategorien importiert.',
            importTaxDescription: 'Kaufsteuersatz aus Sage Intacct importieren.',
            userDefinedDimensions: 'Benutzerdefinierte Dimensionen',
            addUserDefinedDimension: 'Benutzerdefinierte Dimension hinzufügen',
            integrationName: 'Integrationsname',
            dimensionExists: 'Eine Dimension mit diesem Namen existiert bereits.',
            removeDimension: 'Benutzerdefinierte Dimension entfernen',
            removeDimensionPrompt: 'Möchten Sie diese benutzerdefinierte Dimension wirklich entfernen?',
            userDefinedDimension: 'Benutzerdefinierte Dimension',
            addAUserDefinedDimension: 'Benutzerdefinierte Dimension hinzufügen',
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
                        return 'mappings';
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
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: `Wer ist Ihr Kartenanbieter?`,
                whoIsYourBankAccount: 'Wer ist Ihre Bank?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie möchten Sie sich mit Ihrer Bank verbinden?',
                learnMoreAboutOptions: `<muted-text>Erfahren Sie mehr über diese <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">Optionen</a>.</muted-text>`,
                commercialFeedDetails:
                    'Erfordert die Einrichtung mit Ihrer Bank. Dies wird typischerweise von größeren Unternehmen verwendet und ist oft die beste Option, wenn Sie qualifiziert sind.',
                commercialFeedPlaidDetails: `Erfordert die Einrichtung mit Ihrer Bank, aber wir werden Sie anleiten. Dies ist normalerweise auf größere Unternehmen beschränkt.`,
                directFeedDetails: 'Der einfachste Ansatz. Verbinden Sie sich sofort mit Ihren Master-Anmeldedaten. Diese Methode ist am häufigsten.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Aktivieren Sie Ihren ${provider}-Feed`,
                    heading:
                        'Wir haben eine direkte Integration mit Ihrem Kartenaussteller und können Ihre Transaktionsdaten schnell und genau in Expensify importieren.\n\nUm loszulegen, einfach:',
                    visa: 'Wir haben globale Integrationen mit Visa, obwohl die Berechtigung je nach Bank und Kartenprogramm variiert.\n\nUm loszulegen, einfach:',
                    mastercard: 'Wir haben globale Integrationen mit Mastercard, obwohl die Berechtigung je nach Bank und Kartenprogramm variiert.\n\nUm loszulegen, einfach:',
                    vcf: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) für detaillierte Anweisungen zur Einrichtung Ihrer Visa Commercial Cards.\n\n2. [Kontaktieren Sie Ihre Bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), um zu überprüfen, ob sie einen kommerziellen Feed für Ihr Programm unterstützt, und bitten Sie sie, diesen zu aktivieren.\n\n3. *Sobald der Feed aktiviert ist und Sie dessen Details haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    gl1025: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), um herauszufinden, ob American Express einen kommerziellen Feed für Ihr Programm aktivieren kann.\n\n2. Sobald der Feed aktiviert ist, wird Amex Ihnen ein Produktionsschreiben senden.\n\n3. *Sobald Sie die Feed-Informationen haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    cdf: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) für detaillierte Anweisungen zur Einrichtung Ihrer Mastercard Commercial Cards.\n\n2. [Kontaktieren Sie Ihre Bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), um zu überprüfen, ob sie einen kommerziellen Feed für Ihr Programm unterstützt, und bitten Sie sie, diesen zu aktivieren.\n\n3. *Sobald der Feed aktiviert ist und Sie die Details haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    stripe: `1. Besuchen Sie das Stripe-Dashboard und gehen Sie zu [Einstellungen](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Klicken Sie unter Produktintegrationen auf Aktivieren neben Expensify.\n\n3. Sobald der Feed aktiviert ist, klicken Sie unten auf Senden und wir werden daran arbeiten, ihn hinzuzufügen.`,
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Geben Sie den Namen der Bank ein',
                feedDetails: {
                    vcf: {
                        title: 'Was sind die Visa-Feed-Details?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'Finanzinstitutions-ID (Bank)',
                        companyLabel: 'Unternehmens-ID',
                        helpLabel: 'Wo finde ich diese IDs?',
                    },
                    gl1025: {
                        title: `Wie lautet der Amex-Lieferdateiname?`,
                        fileNameLabel: 'Dateiname der Lieferung',
                        helpLabel: 'Wo finde ich den Lieferdateinamen?',
                    },
                    cdf: {
                        title: `Wie lautet die Mastercard-Verteilungs-ID?`,
                        distributionLabel: 'Verteilungs-ID',
                        helpLabel: 'Wo finde ich die Distributions-ID?',
                    },
                },
                amexCorporate: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Corporate“ steht.',
                amexBusiness: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten "Business" steht.',
                amexPersonal: 'Wählen Sie dies aus, wenn Ihre Karten privat sind.',
                error: {
                    pleaseSelectProvider: 'Bitte wählen Sie einen Kartenanbieter, bevor Sie fortfahren.',
                    pleaseSelectBankAccount: 'Bitte wählen Sie ein Bankkonto aus, bevor Sie fortfahren.',
                    pleaseSelectBank: 'Bitte wählen Sie eine Bank aus, bevor Sie fortfahren.',
                    pleaseSelectCountry: 'Bitte wählen Sie ein Land aus, bevor Sie fortfahren.',
                    pleaseSelectFeedType: 'Bitte wählen Sie einen Feed-Typ aus, bevor Sie fortfahren.',
                },
                exitModal: {
                    title: 'Funktioniert etwas nicht?',
                    prompt: 'Wir haben bemerkt, dass Sie das Hinzufügen Ihrer Karten nicht abgeschlossen haben. Wenn Sie ein Problem gefunden haben, lassen Sie es uns wissen, damit wir helfen können, alles wieder in Ordnung zu bringen.',
                    confirmText: 'Problem melden',
                    cancelText: 'Überspringen',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Letzter Tag des Monats',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Letzter Geschäftstag des Monats',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Individueller Tag des Monats',
            },
            assignCard: 'Karte zuweisen',
            findCard: 'Karte finden',
            cardNumber: 'Kartennummer',
            commercialFeed: 'Kommerzieller Feed',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName}-Karten`,
            directFeed: 'Direkt-Feed',
            whoNeedsCardAssigned: 'Wer benötigt eine zugewiesene Karte?',
            chooseCard: 'Wählen Sie eine Karte',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `Wählen Sie eine Karte für <strong>${assignee}</strong>. Können Sie die gesuchte Karte nicht finden? <concierge-link>Teilen Sie es uns mit.</concierge-link>`,
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Oder es ist etwas kaputt. Wie auch immer, wenn Sie Fragen haben, wenden Sie <concierge-link>sich an Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wählen Sie ein Startdatum für die Transaktion',
            startDateDescription: 'Wir werden alle Transaktionen ab diesem Datum importieren. Wenn kein Datum angegeben ist, gehen wir so weit zurück, wie es Ihre Bank erlaubt.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            customCloseDate: 'Benutzerdefiniertes Abschlussdatum',
            letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir werden sofort mit dem Import von Transaktionen beginnen.',
            cardholder: 'Karteninhaber',
            card: 'Karte',
            cardName: 'Kartenname',
            brokenConnectionError:
                '<rbr>Die Verbindung zum Karten-Feed ist unterbrochen. Bitte <a href="#">Melden Sie sich bei Ihrer Bank an</a> damit wir die Verbindung erneut herstellen können.</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `hat ${assignee} einen ${link} zugewiesen! Importierte Transaktionen werden in diesem Chat angezeigt.`,
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Karten-Feed auswählen',
            ukRegulation:
                'Expensify Limited ist ein Agent von Plaid Financial Ltd., einem autorisierten Zahlungsinstitut, das von der Financial Conduct Authority gemäß den Payment Services Regulations 2017 reguliert wird (Firmennummer: 804718). Plaid bietet Ihnen regulierte Kontoinformationsdienste über Expensify Limited als seinen Agenten an.',
        },
        expensifyCard: {
            issueAndManageCards: 'Ausstellen und Verwalten Ihrer Expensify-Karten',
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
            verificationInProgress: 'Verifizierung läuft...',
            verifyingTheDetails: 'Wir überprüfen ein paar Details. Concierge wird Sie informieren, wenn Expensify-Karten zur Ausgabe bereit sind.',
            disclaimer:
                'The Expensify Visa® Commercial Card wird von der The Bancorp Bank, N.A., Mitglied FDIC, gemäß einer Lizenz von Visa U.S.A. Inc. ausgestellt und kann nicht bei allen Händlern verwendet werden, die Visa-Karten akzeptieren. Apple® und das Apple-Logo® sind Marken von Apple Inc., registriert in den USA und anderen Ländern. App Store ist eine Dienstleistungsmarke von Apple Inc. Google Play und das Google Play-Logo sind Marken von Google LLC.',
            euUkDisclaimer:
                'Karten für Einwohner des EWR werden von Transact Payments Malta Limited ausgestellt. Karten für Einwohner des Vereinigten Königreichs werden von Transact Payments Limited gemäß einer Lizenz von Visa Europe Limited ausgestellt. Transact Payments Malta Limited ist von der maltesischen Finanzaufsichtsbehörde als Finanzinstitut gemäß dem Financial Institution Act 1994 ordnungsgemäß zugelassen und reguliert. Registrierungsnummer: C 91879. Transact Payments Limited ist von der Gibraltar Financial Service Commission zugelassen und reguliert.',
            issueCard: 'Karte ausstellen',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4',
            limit: 'Limit',
            currentBalance: 'Aktueller Kontostand',
            currentBalanceDescription: 'Der aktuelle Saldo ist die Summe aller gebuchten Expensify Card-Transaktionen, die seit dem letzten Abrechnungsdatum stattgefunden haben.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Der Saldo wird am ${settlementDate} beglichen.`,
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Anforderung zur Erhöhung des Limits',
            remainingLimitDescription:
                'Wir berücksichtigen eine Reihe von Faktoren bei der Berechnung Ihres verbleibenden Limits: Ihre Zugehörigkeitsdauer als Kunde, die geschäftsbezogenen Informationen, die Sie bei der Anmeldung angegeben haben, und das verfügbare Guthaben auf Ihrem Geschäftskonto. Ihr verbleibendes Limit kann täglich schwanken.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Der Cashback-Saldo basiert auf den abgerechneten monatlichen Ausgaben der Expensify-Karte in Ihrem Arbeitsbereich.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Einrichtung abschließen',
            chooseBankAccount: 'Bankkonto auswählen',
            chooseExistingBank: 'Wählen Sie ein bestehendes Geschäftskonto, um Ihr Expensify Card-Guthaben zu begleichen, oder fügen Sie ein neues Bankkonto hinzu.',
            accountEndingIn: 'Konto endet mit',
            addNewBankAccount: 'Ein neues Bankkonto hinzufügen',
            settlementAccount: 'Abrechnungskonto',
            settlementAccountDescription: 'Wählen Sie ein Konto aus, um Ihr Expensify Card-Guthaben zu begleichen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Vergewissern Sie sich, dass dieses Konto mit Ihrem <a href="${reconciliationAccountSettingsLink}">Abstimmungskonto</a> (${accountNumber}) übereinstimmt, damit der kontinuierliche Abgleich korrekt funktioniert.`,
            settlementFrequency: 'Abrechnungshäufigkeit',
            settlementFrequencyDescription: 'Wählen Sie, wie oft Sie Ihr Expensify Card-Guthaben bezahlen möchten.',
            settlementFrequencyInfo: 'Wenn Sie zur monatlichen Abrechnung wechseln möchten, müssen Sie Ihr Bankkonto über Plaid verbinden und eine positive 90-Tage-Saldenhistorie haben.',
            frequency: {
                daily: 'Täglich',
                monthly: 'Monatlich',
            },
            cardDetails: 'Kartendetails',
            cardPending: ({name}: {name: string}) => `Die Karte ist derzeit ausstehend und wird ausgestellt, sobald ${name}s Konto verifiziert wurde.`,
            virtual: 'Virtuell',
            physical: 'Physisch',
            deactivate: 'Karte deaktivieren',
            changeCardLimit: 'Kartenlimit ändern',
            changeLimit: 'Limit ändern',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie das Limit dieser Karte auf ${limit} ändern, werden neue Transaktionen abgelehnt, bis Sie weitere Ausgaben auf der Karte genehmigen.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Wenn Sie das Limit dieser Karte auf ${limit} ändern, werden neue Transaktionen bis zum nächsten Monat abgelehnt.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Wenn Sie das Limit dieser Karte auf ${limit} ändern, werden neue Transaktionen abgelehnt.`,
            changeCardLimitType: 'Kartengrenztyp ändern',
            changeLimitType: 'Limit-Typ ändern',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie den Limittyp dieser Karte auf Smart Limit ändern, werden neue Transaktionen abgelehnt, da das ${limit} ungenehmigte Limit bereits erreicht wurde.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie den Limittyp dieser Karte auf monatlich ändern, werden neue Transaktionen abgelehnt, da das monatliche Limit von ${limit} bereits erreicht wurde.`,
            addShippingDetails: 'Versanddetails hinzufügen',
            issuedCard: ({assignee}: AssigneeParams) => `hat ${assignee} eine Expensify-Karte ausgestellt! Die Karte wird in 2-3 Werktagen ankommen.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `Für ${assignee} wurde eine Expensify Card ausgestellt! Die Karte wird versendet, sobald die Versanddetails bestätigt wurden.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `hat ${assignee} eine virtuelle ${link} ausgestellt! Die Karte kann sofort verwendet werden.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} hat Versanddetails hinzugefügt. Die Expensify Card trifft in 2–3 Werktagen ein.`,
            verifyingHeader: 'Überprüfen',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird überprüft...',
            verifyingBankAccountDescription: 'Bitte warten Sie, während wir bestätigen, dass dieses Konto verwendet werden kann, um Expensify-Karten auszustellen.',
            bankAccountVerified: 'Bankkonto verifiziert!',
            bankAccountVerifiedDescription: 'Sie können jetzt Expensify-Karten an die Mitglieder Ihres Arbeitsbereichs ausgeben.',
            oneMoreStep: 'Noch ein Schritt...',
            oneMoreStepDescription: 'Es sieht so aus, als müssten wir Ihr Bankkonto manuell verifizieren. Bitte gehen Sie zu Concierge, wo Ihre Anweisungen auf Sie warten.',
            gotIt: 'Verstanden',
            goToConcierge: 'Zu Concierge gehen',
        },
        categories: {
            deleteCategories: 'Kategorien löschen',
            deleteCategoriesPrompt: 'Möchten Sie diese Kategorien wirklich löschen?',
            deleteCategory: 'Kategorie löschen',
            deleteCategoryPrompt: 'Möchten Sie diese Kategorie wirklich löschen?',
            disableCategories: 'Kategorien deaktivieren',
            disableCategory: 'Kategorie deaktivieren',
            enableCategories: 'Kategorien aktivieren',
            enableCategory: 'Kategorie aktivieren',
            defaultSpendCategories: 'Standardausgabenkategorien',
            spendCategoriesDescription: 'Passen Sie an, wie Händlerausgaben für Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim Löschen der Kategorie ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder müssen alle Ausgaben kategorisieren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle Ausgaben müssen kategorisiert werden, um nach ${connectionName} exportiert zu werden.`,
            subtitle: 'Verschaffen Sie sich einen besseren Überblick darüber, wo Geld ausgegeben wird. Verwenden Sie unsere Standardkategorien oder fügen Sie Ihre eigenen hinzu.',
            emptyCategories: {
                title: 'Sie haben noch keine Kategorien erstellt.',
                subtitle: 'Fügen Sie eine Kategorie hinzu, um Ihre Ausgaben zu organisieren.',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Ihre Kategorien werden derzeit aus einer Buchhaltungsverbindung importiert. Gehen Sie zur <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
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
            importedFromAccountingSoftware: 'Die untenstehenden Kategorien werden aus Ihrem',
            payrollCode: 'Lohnabrechnungscode',
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Gehaltsabrechnungscodes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            glCode: 'GL-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des GL-Codes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Kann nicht alle Kategorien löschen oder deaktivieren',
                description: `Mindestens eine Kategorie muss aktiviert bleiben, da Ihr Arbeitsbereich Kategorien erfordert.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Verwenden Sie die unten stehenden Schalter, um weitere Funktionen zu aktivieren, während Sie wachsen. Jede Funktion wird im Navigationsmenü zur weiteren Anpassung angezeigt.',
            spendSection: {
                title: 'Ausgaben',
                subtitle: 'Aktivieren Sie Funktionen, die Ihnen helfen, Ihr Team zu skalieren.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'Fügen Sie Kontrollen hinzu, die helfen, die Ausgaben im Rahmen des Budgets zu halten.',
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
                subtitle: 'Raten hinzufügen, aktualisieren und durchsetzen.',
            },
            perDiem: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Tagessätze fest, um die täglichen Ausgaben der Mitarbeiter zu kontrollieren.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Erhalten Sie Einblicke und Kontrolle über Ausgaben.',
                disableCardTitle: 'Expensify Card deaktivieren',
                disableCardPrompt: 'Sie können die Expensify-Karte nicht deaktivieren, da sie bereits verwendet wird. Wenden Sie sich an Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Chatten Sie mit Concierge',
                feed: {
                    title: 'Erhalte die Expensify-Karte',
                    subTitle: 'Optimieren Sie Ihre Geschäftsausgaben und sparen Sie bis zu 50 % auf Ihrer Expensify-Rechnung, plus:',
                    features: {
                        cashBack: 'Cashback auf jeden Einkauf in den USA',
                        unlimited: 'Unbegrenzte virtuelle Karten',
                        spend: 'Ausgabenkontrollen und benutzerdefinierte Limits',
                    },
                    ctaTitle: 'Neue Karte ausstellen',
                },
            },
            companyCards: {
                title: 'Unternehmenskarten',
                subtitle: 'Ausgaben von bestehenden Firmenkarten importieren.',
                feed: {
                    title: 'Unternehmens-Karten importieren',
                    features: {
                        support: 'Unterstützung für alle großen Kartenanbieter',
                        assignCards: 'Karten dem gesamten Team zuweisen',
                        automaticImport: 'Automatischer Transaktionsimport',
                    },
                },
                bankConnectionError: 'Problem mit der Bankverbindung',
                connectWithPlaid: 'Verbindung über Plaid herstellen',
                connectWithExpensifyCard: 'Expensify-Karte testen',
                bankConnectionDescription: 'Bitte versuchen Sie, Ihre Karten erneut hinzuzufügen. Andernfalls können Sie',
                disableCardTitle: 'Unternehmens-Karten deaktivieren',
                disableCardPrompt: 'Sie können Firmenkarten nicht deaktivieren, da diese Funktion in Gebrauch ist. Wenden Sie sich an den Concierge für die nächsten Schritte.',
                disableCardButton: 'Chatten Sie mit Concierge',
                cardDetails: 'Kartendetails',
                cardNumber: 'Kartennummer',
                cardholder: 'Karteninhaber',
                cardName: 'Kartenname',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} Export` : `${integration}-Export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Wählen Sie das ${integration}-Konto aus, in das die Transaktionen exportiert werden sollen.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Wählen Sie das ${integration}-Konto aus, in das die Transaktionen exportiert werden sollen. Wählen Sie eine andere <a href="${exportPageLink}">Exportoption</a>, um die verfügbaren Konten zu ändern.`,
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Transaktionsstartdatum',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte zuweisen aufheben',
                unassign: 'Zuweisung aufheben',
                unassignCardDescription: 'Das Entfernen dieser Karte wird alle Transaktionen auf Entwurfsberichten vom Konto des Karteninhabers entfernen.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Karten-Feed-Name',
                cardFeedNameDescription: 'Geben Sie dem Karten-Feed einen eindeutigen Namen, damit Sie ihn von den anderen unterscheiden können.',
                cardFeedTransaction: 'Transaktionen löschen',
                cardFeedTransactionDescription: 'Wählen Sie, ob Karteninhaber Kartentransaktionen löschen können. Neue Transaktionen werden diesen Regeln folgen.',
                cardFeedRestrictDeletingTransaction: 'Löschen von Transaktionen einschränken',
                cardFeedAllowDeletingTransaction: 'Löschen von Transaktionen erlauben',
                removeCardFeed: 'Karten-Feed entfernen',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `${feedName}-Feed entfernen`,
                removeCardFeedDescription: 'Möchten Sie diesen Karten-Feed wirklich entfernen? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Der Name des Karten-Feeds ist erforderlich',
                    statementCloseDateRequired: 'Bitte wählen Sie ein Abschlussdatum für den Kontoauszug aus.',
                },
                corporate: 'Löschen von Transaktionen einschränken',
                personal: 'Löschen von Transaktionen erlauben',
                setFeedNameDescription: 'Geben Sie dem Karten-Feed einen eindeutigen Namen, damit Sie ihn von den anderen unterscheiden können.',
                setTransactionLiabilityDescription: 'Wenn aktiviert, können Karteninhaber Kartentransaktionen löschen. Neue Transaktionen werden dieser Regel folgen.',
                emptyAddedFeedTitle: 'Unternehmenskarten zuweisen',
                emptyAddedFeedDescription: 'Beginnen Sie, indem Sie einem Mitglied Ihre erste Karte zuweisen.',
                pendingFeedTitle: `Wir überprüfen Ihre Anfrage...`,
                pendingFeedDescription: `Wir überprüfen derzeit Ihre Feed-Details. Sobald das abgeschlossen ist, werden wir uns per`,
                pendingBankTitle: 'Überprüfen Sie Ihr Browserfenster',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Bitte verbinden Sie sich mit ${bankName} über das Browserfenster, das sich gerade geöffnet hat. Falls sich keines geöffnet hat,`,
                pendingBankLink: 'Bitte hier klicken',
                giveItNameInstruction: 'Geben Sie der Karte einen Namen, der sie von anderen abhebt.',
                updating: 'Aktualisierung...',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: `Arbeitsbereich kann nicht herabgestuft werden`,
                downgradeSubTitle: `Dieser Arbeitsbereich kann nicht herabgestuft werden, da mehrere Karten-Feeds verbunden sind (außer Expensify-Karten). Bitte <a href="#">nur einen Karten-Feed behalten</a> fortzufahren.`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Bitte fügen Sie das Konto in ${connection} hinzu und synchronisieren Sie die Verbindung erneut.`,
                expensifyCardBannerTitle: 'Erhalte die Expensify-Karte',
                expensifyCardBannerSubtitle:
                    'Genießen Sie Cashback bei jedem Einkauf in den USA, bis zu 50 % Rabatt auf Ihre Expensify-Rechnung, unbegrenzte virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Erfahren Sie mehr',
                statementCloseDateTitle: 'Datum des Rechnungsabschlusses',
                statementCloseDateDescription: 'Teilen Sie uns mit, wann Ihre Kartenabrechnung geschlossen wird, und wir erstellen eine passende Abrechnung in Expensify.',
            },
            workflows: {
                title: 'Werkstrome',
                subtitle: 'Konfigurieren Sie, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt:
                    'Expensify-Karten aus diesem Arbeitsbereich hängen derzeit von der Genehmigung ab, um ihre Smart Limits festzulegen. Bitte ändern Sie die Limitarten aller Expensify-Karten mit Smart Limits, bevor Sie Genehmigungen deaktivieren.',
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
                title: 'Schlagwörter',
                subtitle: 'Klassifizieren Sie Kosten und verfolgen Sie abrechenbare Ausgaben.',
            },
            taxes: {
                title: 'Steuern',
                subtitle: 'Dokumentieren und fordern Sie berechtigte Steuern zurück.',
            },
            reportFields: {
                title: 'Berichtsfelder',
                subtitle: 'Benutzerdefinierte Felder für Ausgaben einrichten.',
            },
            connections: {
                title: 'Buchhaltung',
                subtitle: 'Synchronisieren Sie Ihren Kontenplan und mehr.',
            },
            receiptPartners: {
                title: 'Beleg-Partner',
                subtitle: 'Automatischer Import von Belegen.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nicht so schnell...',
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, müssen Sie Ihre Buchhaltungsimporteinstellungen ändern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, müssen Sie Ihre Buchhaltungsverbindung von Ihrem Arbeitsbereich trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber trennen',
                disconnectText: 'Um diese Funktion zu deaktivieren, trennen Sie bitte zuerst die Uber for Business Integration.',
                description: 'Möchten Sie diese Integration wirklich trennen?',
                confirmText: 'Verstanden',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell...',
                featureEnabledText:
                    'Expensify-Karten in diesem Arbeitsbereich basieren auf Genehmigungs-Workflows, um ihre Smart Limits festzulegen.\n\nBitte ändern Sie die Limittypen von Karten mit Smart Limits, bevor Sie Workflows deaktivieren.',
                confirmText: 'Gehe zu Expensify-Karten',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Belege anfordern, hohe Ausgaben kennzeichnen und mehr.',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Beispiele:',
            customReportNamesSubtitle: `<muted-text>Passen Sie Berichtstitel mithilfe unserer <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln an</a>.</muted-text>`,
            customNameTitle: 'Standardberichtstitel',
            customNameDescription: `Wählen Sie mithilfe unserer <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a> einen benutzerdefinierten Namen für Spesenabrechnungen.`,
            customNameInputLabel: 'Name',
            customNameEmailPhoneExample: 'E-Mail oder Telefon des Mitglieds: {report:submit:from}',
            customNameStartDateExample: 'Berichtsstartdatum: {report:startdate}',
            customNameWorkspaceNameExample: 'Workspace-Name: {report:workspacename}',
            customNameReportIDExample: 'Report-ID: {report:id}',
            customNameTotalExample: 'Gesamt: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Verhindern Sie, dass Mitglieder benutzerdefinierte Berichtsnamen ändern',
        },
        reportFields: {
            addField: 'Feld hinzufügen',
            delete: 'Feld löschen',
            deleteFields: 'Felder löschen',
            findReportField: 'Berichtsfeld finden',
            deleteConfirmation: 'Möchten Sie dieses Berichtsfeld wirklich löschen?',
            deleteFieldsConfirmation: 'Möchten Sie diese Berichts-Felder wirklich löschen?',
            emptyReportFields: {
                title: 'Sie haben noch keine Berichts-Felder erstellt.',
                subtitle: 'Fügen Sie ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten angezeigt wird.',
            },
            subtitle: 'Berichtsfelder gelten für alle Ausgaben und können hilfreich sein, wenn Sie nach zusätzlichen Informationen fragen möchten.',
            disableReportFields: 'Berichtsfelder deaktivieren',
            disableReportFieldsConfirmation: 'Bist du sicher? Text- und Datumsfelder werden gelöscht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die unten aufgeführten Berichtsfelder werden aus Ihrem importiert.',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            formulaType: 'Formel',
            textAlternateText: 'Fügen Sie ein Feld für die freie Texteingabe hinzu.',
            dateAlternateText: 'Fügen Sie einen Kalender zur Datumauswahl hinzu.',
            dropdownAlternateText: 'Fügen Sie eine Liste von Optionen zur Auswahl hinzu.',
            formulaAlternateText: 'Fügen Sie ein Formularfeld hinzu.',
            nameInputSubtitle: 'Wählen Sie einen Namen für das Berichtsfeld.',
            typeInputSubtitle: 'Wählen Sie aus, welche Art von Berichtsfeld verwendet werden soll.',
            initialValueInputSubtitle: 'Geben Sie einen Startwert ein, der im Berichtsfeld angezeigt werden soll.',
            listValuesInputSubtitle: 'Diese Werte werden im Dropdown-Menü Ihres Berichtsfelds angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            listInputSubtitle: 'Diese Werte werden in Ihrer Berichts-Feldliste angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            deleteValue: 'Wert löschen',
            deleteValues: 'Werte löschen',
            disableValue: 'Wert deaktivieren',
            disableValues: 'Werte deaktivieren',
            enableValue: 'Wert aktivieren',
            enableValues: 'Werte aktivieren',
            emptyReportFieldsValues: {
                title: 'Sie haben keine Listenwerte erstellt.',
                subtitle: 'Benutzerdefinierte Werte hinzufügen, die in Berichten erscheinen sollen.',
            },
            deleteValuePrompt: 'Möchten Sie diesen Listenwert wirklich löschen?',
            deleteValuesPrompt: 'Möchten Sie diese Listenwerte wirklich löschen?',
            listValueRequiredError: 'Bitte geben Sie einen Listennamen ein',
            existingListValueError: 'Ein Listenwert mit diesem Namen existiert bereits.',
            editValue: 'Wert bearbeiten',
            listValues: 'Werte auflisten',
            addValue: 'Wert hinzufügen',
            existingReportFieldNameError: 'Ein Berichtsfeld mit diesem Namen existiert bereits.',
            reportFieldNameRequiredError: 'Bitte geben Sie einen Berichtsfeldnamen ein',
            reportFieldTypeRequiredError: 'Bitte wählen Sie einen Berichtsfeldtyp aus',
            circularReferenceError: 'Dieses Feld kann nicht auf sich selbst verweisen. Bitte aktualisieren Sie es.',
            reportFieldInitialValueRequiredError: 'Bitte wählen Sie einen Anfangswert für das Berichtsfeld aus',
            genericFailureMessage: 'Beim Aktualisieren des Berichtsfeldes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        tags: {
            tagName: 'Tag-Name',
            requiresTag: 'Mitglieder müssen alle Ausgaben kennzeichnen',
            trackBillable: 'Verfolgen Sie abrechenbare Ausgaben',
            customTagName: 'Benutzerdefinierter Tag-Name',
            enableTag: 'Tag aktivieren',
            enableTags: 'Tags aktivieren',
            requireTag: 'Require tag',
            requireTags: 'Tags erforderlich',
            notRequireTags: 'Nicht erforderlich',
            disableTag: 'Tag deaktivieren',
            disableTags: 'Tags deaktivieren',
            addTag: 'Tag hinzufügen',
            editTag: 'Tag bearbeiten',
            editTags: 'Tags bearbeiten',
            findTag: 'Tag finden',
            subtitle: 'Tags bieten detailliertere Möglichkeiten, Kosten zu klassifizieren.',
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>Sie verwenden <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">abhängige Tags</a>. Sie können <a href="${importSpreadsheetLink}">eine Kalkulationstabelle neu importieren</a>, um Ihre Tags zu aktualisieren.</muted-text>`,
            emptyTags: {
                title: 'Sie haben noch keine Tags erstellt.',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Fügen Sie ein Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitleHTML: `<muted-text><centered-text>Importieren Sie eine Kalkulationstabelle, um Tags für die Verfolgung von Projekten, Standorten, Abteilungen und mehr hinzuzufügen. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Erfahren Sie mehr</a> über die Formatierung von Tag-Dateien.</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Your tags are currently importing from an accounting connection. Gehen Sie zur <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag löschen',
            deleteTags: 'Tags löschen',
            deleteTagConfirmation: 'Möchten Sie dieses Tag wirklich löschen?',
            deleteTagsConfirmation: 'Möchten Sie diese Tags wirklich löschen?',
            deleteFailureMessage: 'Beim Löschen des Tags ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            tagRequiredError: 'Tag-Name ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits',
            invalidTagNameError: 'Der Tag-Name darf nicht 0 sein. Bitte wählen Sie einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            importedFromAccountingSoftware: 'Die unten stehenden Tags werden aus Ihrem',
            glCode: 'GL-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des GL-Codes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmiger',
            importTags: 'Tags importieren',
            importTagsSupportingText: 'Kodieren Sie Ihre Ausgaben mit einer Art von Tag oder vielen.',
            configureMultiLevelTags: 'Konfigurieren Sie Ihre Liste von Tags für die mehrstufige Kategorisierung.',
            importMultiLevelTagsSupportingText: `Hier ist eine Vorschau Ihrer Tags. Wenn alles gut aussieht, klicken Sie unten, um sie zu importieren.`,
            importMultiLevelTags: {
                firstRowTitle: 'Die erste Zeile ist der Titel für jede Tag-Liste.',
                independentTags: 'Dies sind unabhängige Tags',
                glAdjacentColumn: 'Es gibt einen GL-Code in der angrenzenden Spalte.',
            },
            tagLevel: {
                singleLevel: 'Einzelne Ebene von Tags',
                multiLevel: 'Mehrstufige Tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-Ebenen wechseln',
                prompt1: 'Das Ändern der Tag-Ebenen löscht alle aktuellen Tags.',
                prompt2: 'Wir empfehlen Ihnen zuerst',
                prompt3: 'ein Backup herunterladen',
                prompt4: 'indem Sie Ihre Tags exportieren.',
                prompt5: 'Erfahren Sie mehr',
                prompt6: 'about tag levels.',
            },
            overrideMultiTagWarning: {
                title: 'Tags importieren',
                prompt1: 'Bist du sicher?',
                prompt2: ' Die vorhandenen Tags werden überschrieben, aber Sie können',
                prompt3: ' ein Backup herunterladen',
                prompt4: ' zuerst.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Wir haben *${columnCounts} Spalten* in Ihrer Tabelle gefunden. Wählen Sie *Name* neben der Spalte, die die Tag-Namen enthält. Sie können auch *Aktiviert* neben der Spalte auswählen, die den Tag-Status festlegt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Kann nicht alle Tags löschen oder deaktivieren',
                description: `Mindestens ein Tag muss aktiviert bleiben, da Ihr Arbeitsbereich Tags benötigt.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kann nicht alle Tags optional machen',
                description: `Mindestens ein Tag muss erforderlich bleiben, da Ihre Arbeitsbereichseinstellungen Tags erfordern.`,
            },
            cannotMakeTagListRequired: {
                title: 'Tag-Liste kann nicht als erforderlich festgelegt werden',
                description: 'Sie können eine Tag-Liste nur dann als erforderlich festlegen, wenn in Ihrer Richtlinie mehrere Tag-Ebenen konfiguriert sind.',
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Steuernamen, -sätze hinzufügen und Standardwerte festlegen.',
            addRate: 'Rate hinzufügen',
            workspaceDefault: 'Standardwährung des Arbeitsbereichs',
            foreignDefault: 'Fremdwährungsstandard',
            customTaxName: 'Benutzerdefinierter Steuername',
            value: 'Wert',
            taxReclaimableOn: 'Steuer erstattungsfähig auf',
            taxRate: 'Steuersatz',
            findTaxRate: 'Steuersatz finden',
            error: {
                taxRateAlreadyExists: 'Dieser Steuername wird bereits verwendet',
                taxCodeAlreadyExists: 'Dieser Steuercode wird bereits verwendet',
                valuePercentageRange: 'Bitte geben Sie einen gültigen Prozentsatz zwischen 0 und 100 ein.',
                customNameRequired: 'Benutzerdefinierter Steuername ist erforderlich',
                deleteFailureMessage: 'Beim Löschen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder bitten Sie Concierge um Hilfe.',
                updateFailureMessage: 'Beim Aktualisieren des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder bitten Sie Concierge um Hilfe.',
                createFailureMessage: 'Beim Erstellen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder bitten Sie Concierge um Hilfe.',
                updateTaxClaimableFailureMessage: 'Der erstattungsfähige Teil muss geringer sein als der Distanzsatzbetrag.',
            },
            deleteTaxConfirmation: 'Möchten Sie diese Steuer wirklich löschen?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Möchten Sie wirklich ${taxAmount} Steuern löschen?`,
            actions: {
                delete: 'Löschrate',
                deleteMultiple: 'Raten löschen',
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
            importedFromAccountingSoftware: 'Die unten aufgeführten Steuern werden von Ihrem importiert',
            taxCode: 'Steuercode',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
        },
        duplicateWorkspace: {
            title: 'Benennen Sie Ihren neuen Arbeitsbereich',
            selectFeatures: 'Auswählen der zu kopierenden Features',
            whichFeatures: 'Welche Funktionen möchten Sie in Ihren neuen Arbeitsbereich kopieren?',
            confirmDuplicate: '\n\nMöchten Sie fortfahren?',
            categories: 'Kategorien und Ihre Auto-Kategorisierungsregeln',
            reimbursementAccount: 'Erstattungskonto',
            delayedSubmission: 'verspätete Einreichung',
            welcomeNote: 'Bitte beginnen Sie mit der Nutzung meines neuen Arbeitsbereichs',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Sie sind dabei, ${newWorkspaceName ?? ''} zu erstellen und mit ${totalMembers ?? 0} Mitgliedern aus dem ursprünglichen Arbeitsbereich zu teilen.`,
            error: 'Beim Duplizieren Ihres neuen Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        emptyWorkspace: {
            title: 'Sie haben keine Arbeitsbereiche',
            subtitle: 'Verfolgen Sie Belege, erstatten Sie Ausgaben, verwalten Sie Reisen, senden Sie Rechnungen und mehr.',
            createAWorkspaceCTA: 'Loslegen',
            features: {
                trackAndCollect: 'Belege verfolgen und sammeln',
                reimbursements: 'Mitarbeiter erstatten',
                companyCards: 'Firmenkarten verwalten',
            },
            notFound: 'Kein Arbeitsbereich gefunden',
            description:
                'Räume sind ein großartiger Ort, um mit mehreren Personen zu diskutieren und zu arbeiten. Um mit der Zusammenarbeit zu beginnen, erstellen Sie einen Arbeitsbereich oder treten Sie einem bei.',
        },
        new: {
            newWorkspace: 'Neuer Arbeitsbereich',
            getTheExpensifyCardAndMore: 'Holen Sie sich die Expensify-Karte und mehr',
            confirmWorkspace: 'Arbeitsbereich bestätigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mein Gruppenarbeitsbereich${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Möchten Sie ${memberName} wirklich entfernen?`,
                other: 'Möchten Sie diese Mitglieder wirklich entfernen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} ist ein Genehmiger in diesem Arbeitsbereich. Wenn Sie diesen Arbeitsbereich mit ihnen nicht mehr teilen, ersetzen wir sie im Genehmigungsprozess durch den Arbeitsbereichsinhaber, ${ownerName}.`,
            removeMembersTitle: () => ({
                one: 'Mitglied entfernen',
                other: 'Mitglieder entfernen',
            }),
            findMember: 'Mitglied finden',
            removeWorkspaceMemberButtonTitle: 'Aus dem Arbeitsbereich entfernen',
            removeGroupMemberButtonTitle: 'Aus Gruppe entfernen',
            removeRoomMemberButtonTitle: 'Aus dem Chat entfernen',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Möchten Sie ${memberName} wirklich entfernen?`,
            removeMemberTitle: 'Mitglied entfernen',
            transferOwner: 'Besitzer übertragen',
            makeMember: 'Mitglied machen',
            makeAdmin: 'Admin machen',
            makeAuditor: 'Prüfer erstellen',
            selectAll: 'Alle auswählen',
            error: {
                genericAdd: 'Es gab ein Problem beim Hinzufügen dieses Arbeitsbereichsmitglieds.',
                cannotRemove: 'Sie können sich selbst oder den Workspace-Inhaber nicht entfernen.',
                genericRemove: 'Es gab ein Problem beim Entfernen dieses Arbeitsbereichsmitglieds.',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren primären Anmeldungen hinzugefügt.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Hinzugefügt durch sekundären Login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Gesamtanzahl der Arbeitsbereichsmitglieder: ${count}`,
            importMembers: 'Mitglieder importieren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Wenn du ${approver} aus diesem Arbeitsbereich entfernst, ersetzen wir diese Person im Genehmigungsworkflow durch ${workspaceOwner}, den/die Eigentümer(in) des Arbeitsbereichs.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} hat ausstehende Spesenberichte zur Genehmigung. Bitte bitten Sie die Person, diese zu genehmigen, oder übernehmen Sie die Kontrolle über die Berichte dieser Person, bevor Sie die Person aus dem Arbeitsbereich entfernen.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Sie können ${memberName} nicht aus diesem Arbeitsbereich entfernen. Bitte legen Sie unter Workflows > Zahlungen ausführen oder nachverfolgen eine neue erstattende Person fest und versuchen Sie es dann erneut.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Arbeitsbereich entfernst, wird ${workspaceOwner}, der/die Inhaber/in des Arbeitsbereichs, als bevorzugte/r Exporteur/in festgelegt.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Arbeitsbereich entfernst, ersetzen wir sie/ihn als technischen Kontakt durch ${workspaceOwner}, den Arbeitsbereichsinhaber.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} hat einen Bericht in Bearbeitung, zu dem eine Aktion erforderlich ist. Bitte fordern Sie sie auf, die erforderliche Aktion abzuschließen, bevor Sie sie aus dem Workspace entfernen.`,
        },
        card: {
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
            issueCard: 'Karte ausstellen',
            issueNewCard: {
                whoNeedsCard: 'Wer braucht eine Karte?',
                inviteNewMember: 'Neues Mitglied einladen',
                findMember: 'Mitglied finden',
                chooseCardType: 'Wählen Sie einen Kartentyp aus',
                physicalCard: 'Physische Karte',
                physicalCardDescription: 'Ideal für den häufigen Ausgeber',
                virtualCard: 'Virtuelle Karte',
                virtualCardDescription: 'Sofort und flexibel',
                chooseLimitType: 'Wählen Sie einen Grenztyp',
                smartLimit: 'Smart Limit',
                smartLimitDescription: 'Bis zu einem bestimmten Betrag ausgeben, bevor eine Genehmigung erforderlich ist.',
                monthly: 'Monatlich',
                monthlyDescription: 'Bis zu einem bestimmten Betrag pro Monat ausgeben',
                fixedAmount: 'Fester Betrag',
                fixedAmountDescription: 'Einmalig bis zu einem bestimmten Betrag ausgeben',
                setLimit: 'Ein Limit festlegen',
                cardLimitError: 'Bitte geben Sie einen Betrag unter $21,474,836 ein.',
                giveItName: 'Gib ihm einen Namen',
                giveItNameInstruction: 'Gestalten Sie es einzigartig genug, um es von anderen Karten zu unterscheiden. Spezifische Anwendungsfälle sind sogar noch besser!',
                cardName: 'Kartenname',
                letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
                willBeReady: 'Diese Karte wird sofort einsatzbereit sein.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Typ begrenzen',
                name: 'Name',
                disabledApprovalForSmartLimitError:
                    'Bitte aktivieren Sie Genehmigungen unter <strong>Workflows > Genehmigungen hinzufügen</strong>, bevor Sie intelligente Limits einrichten',
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
            needAnotherAccounting: 'Benötigen Sie eine weitere Buchhaltungssoftware?',
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
            errorODIntegration: ({oldDotPolicyConnectionsURL}: ErrorODIntegrationParams) =>
                `Es gibt einen Fehler mit einer Verbindung, die in Expensify Classic eingerichtet wurde. [Gehen Sie zu Expensify Classic, um dieses Problem zu beheben.](${oldDotPolicyConnectionsURL})`,
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
                return `${integrationName} trennen`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'Buchhaltungsintegration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Kann keine Verbindung zu QuickBooks Online herstellen';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Kann keine Verbindung zu Xero herstellen';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Kann keine Verbindung zu NetSuite herstellen';
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
                return `Möchten Sie ${integrationName} wirklich trennen?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Möchten Sie wirklich ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'diese Buchhaltungsintegration'} verbinden? Dadurch werden alle bestehenden Buchhaltungsverbindungen entfernt.`,
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
                            return 'Titel importieren';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Zertifikat zur Genehmigung importieren';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensionen importieren';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Speicherungsrichtlinie importieren';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Daten werden weiterhin mit QuickBooks synchronisiert... Bitte stellen Sie sicher, dass der Web Connector läuft.';
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
                            return 'Aktualisierung der Personenliste';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aktualisieren von Berichtsfeldern';
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
                            return 'Synchronisieren von Tracking-Kategorien';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronisieren von Bankkonten';
                        case 'xeroSyncImportTaxRates':
                            return 'Steuersätze synchronisieren';
                        case 'xeroCheckConnection':
                            return 'Xero-Verbindung wird überprüft';
                        case 'xeroSyncTitle':
                            return 'Synchronisiere Xero-Daten';
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
                            return 'Währungen synchronisieren';
                        case 'netSuiteSyncCategories':
                            return 'Kategorien synchronisieren';
                        case 'netSuiteSyncReportFields':
                            return 'Importieren von Daten als Expensify-Berichtsfelder';
                        case 'netSuiteSyncTags':
                            return 'Daten als Expensify-Tags importieren';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Verbindungseinstellungen werden aktualisiert';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite-Rechnungen und -Rechnungen als bezahlt markieren';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importieren von Lieferanten';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importieren benutzerdefinierter Listen';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importieren benutzerdefinierter Listen';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importieren von Tochtergesellschaften';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importieren von Lieferanten';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct-Verbindung wird überprüft';
                        case 'intacctImportDimensions':
                            return 'Importieren von Sage Intacct-Dimensionen';
                        case 'intacctImportTitle':
                            return 'Importieren von Sage Intacct-Daten';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Übersetzung fehlt für Stufe: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugter Exporteur',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch ein Domain-Admin sein, wenn Sie in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zur Exportierung in seinem Konto.',
            exportAs: 'Exportieren als',
            exportOutOfPocket: 'Auslagen als exportieren',
            exportCompanyCard: 'Unternehmensausgaben exportieren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardanbieter',
            autoSync: 'Auto-Synchronisierung',
            autoSyncDescription: 'Synchronisieren Sie NetSuite und Expensify automatisch, jeden Tag. Exportieren Sie den finalisierten Bericht in Echtzeit.',
            reimbursedReports: 'Synchronisiere erstattete Berichte',
            cardReconciliation: 'Kartenabstimmung',
            reconciliationAccount: 'Abstimmungskonto',
            continuousReconciliation: 'Kontinuierliche Abstimmung',
            saveHoursOnReconciliation:
                'Sparen Sie Stunden bei der Abstimmung in jedem Buchhaltungszeitraum, indem Expensify kontinuierlich Expensify Card-Abrechnungen und -Abwicklungen in Ihrem Namen abstimmt.',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>Um den kontinuierlichen Abgleich zu aktivieren, aktivieren Sie bitte die <a href="${accountingAdvancedSettingsLink}">automatische Synchronisierung</a> für ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wählen Sie das Bankkonto, gegen das Ihre Expensify Card-Zahlungen abgeglichen werden sollen.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Stellen Sie sicher, dass dieses Konto mit Ihrem übereinstimmt <a href="${settlementAccountUrl}">Expensify Card-Kartenabrechnungskonto</a> (endend mit ${lastFourPAN}), damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.`,
            },
        },
        export: {
            notReadyHeading: 'Nicht bereit zum Exportieren',
            notReadyDescription:
                'Entwürfe oder ausstehende Spesenabrechnungen können nicht in das Buchhaltungssystem exportiert werden. Bitte genehmigen oder begleichen Sie diese Ausgaben, bevor Sie sie exportieren.',
        },
        invoices: {
            sendInvoice: 'Rechnung senden',
            sendFrom: 'Senden von',
            invoicingDetails: 'Rechnungsdetails',
            invoicingDetailsDescription: 'Diese Informationen werden auf Ihren Rechnungen erscheinen.',
            companyName: 'Firmenname',
            companyWebsite: 'Unternehmenswebsite',
            paymentMethods: {
                personal: 'Persönlich',
                business: 'Geschäft',
                chooseInvoiceMethod: 'Wählen Sie unten eine Zahlungsmethode aus:',
                payingAsIndividual: 'Als Einzelperson bezahlen',
                payingAsBusiness: 'Als Unternehmen bezahlen',
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
            to: 'zu',
            from: 'von',
        },
        inviteMessage: {
            confirmDetails: 'Details bestätigen',
            inviteMessagePrompt: 'Machen Sie Ihre Einladung besonders, indem Sie unten eine Nachricht hinzufügen!',
            personalMessagePrompt: 'Nachricht',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            inviteNoMembersError: 'Bitte wählen Sie mindestens ein Mitglied zum Einladen aus.',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} hat beantragt, ${workspaceName} beizutreten.`,
        },
        distanceRates: {
            oopsNotSoFast: 'Hoppla! Nicht so schnell...',
            workspaceNeeds: 'Ein Arbeitsbereich benötigt mindestens einen aktivierten Distanzsatz.',
            distance: 'Entfernung',
            centrallyManage: 'Verwalten Sie zentral die Tarife, verfolgen Sie in Meilen oder Kilometern und legen Sie eine Standardkategorie fest.',
            rate: 'Bewerten',
            addRate: 'Rate hinzufügen',
            findRate: 'Rate finden',
            trackTax: 'Steuern verfolgen',
            deleteRates: () => ({
                one: 'Löschrate',
                other: 'Raten löschen',
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
            taxFeatureNotEnabledMessage:
                '<muted-text>Steuern müssen im Arbeitsbereich aktiviert sein, um diese Funktion zu nutzen. Gehen Sie zu <a href="#">Mehr Funktionen</a> um diese Änderung vorzunehmen.</muted-text>',
            deleteDistanceRate: 'Entfernen Sie den Distanzsatz',
            areYouSureDelete: () => ({
                one: 'Möchten Sie diesen Satz wirklich löschen?',
                other: 'Möchten Sie diese Tarife wirklich löschen?',
            }),
            errors: {
                rateNameRequired: 'Ratenname ist erforderlich',
                existingRateName: 'Ein Entfernungsrate mit diesem Namen existiert bereits.',
            },
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
                `Die Standardwährung kann nicht geändert werden, da dieser Arbeitsbereich mit einem ${currency} Bankkonto verknüpft ist.`,
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addressContext: 'Eine Workspace-Adresse ist erforderlich, um Expensify Travel zu aktivieren. Bitte geben Sie eine Adresse ein, die mit Ihrem Unternehmen verbunden ist.',
            policy: 'Ausgabenrichtlinie',
        },
        bankAccount: {
            continueWithSetup: 'Setup fortsetzen',
            youAreAlmostDone:
                'Sie sind fast fertig mit der Einrichtung Ihres Bankkontos, das es Ihnen ermöglicht, Firmenkarten auszustellen, Ausgaben zu erstatten, Rechnungen zu sammeln und Rechnungen zu bezahlen.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Persönliche Bankkonten können nicht für Zahlungen in Arbeitsbereichen verwendet werden.',
            oneMoreThing: 'Noch eine Sache!',
            allSet: 'Du bist startklar!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszustellen, Ausgaben zu erstatten, Rechnungen einzuziehen und Rechnungen zu bezahlen.',
            letsFinishInChat: 'Lass uns im Chat fertig werden!',
            finishInChat: 'Im Chat beenden',
            almostDone: 'Fast fertig!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Von vorne anfangen',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, trennen Sie mein Bankkonto.',
            yesStartOver: 'Ja, von vorne beginnen.',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) =>
                `Trennen Sie Ihr <strong>${bankName}</strong> Bankkonto. Alle ausstehenden Transaktionen für dieses Konto werden trotzdem abgeschlossen.`,
            clearProgress: 'Ein Neuanfang wird den bisherigen Fortschritt löschen.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Arbeitsbereichswährung',
            updateCurrencyPrompt:
                'Es sieht so aus, als ob Ihr Arbeitsbereich derzeit auf eine andere Währung als USD eingestellt ist. Bitte klicken Sie auf die Schaltfläche unten, um Ihre Währung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'In USD aktualisieren',
            updateWorkspaceCurrency: 'Arbeitsbereichswährung aktualisieren',
            workspaceCurrencyNotSupported: 'Arbeitsbereichswährung wird nicht unterstützt',
            yourWorkspace: `Ihr Arbeitsbereich ist auf eine nicht unterstützte Währung eingestellt. Sehen Sie sich die <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">Liste der unterstützten Währungen an</a>.`,
            chooseAnExisting: 'Wählen Sie ein vorhandenes Bankkonto zur Zahlung von Ausgaben oder fügen Sie ein neues hinzu.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Besitzer übertragen',
            addPaymentCardTitle: 'Geben Sie Ihre Zahlungskarte ein, um die Eigentümerschaft zu übertragen.',
            addPaymentCardButtonText: 'Bedingungen akzeptieren & Zahlungskarte hinzufügen',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lesen und akzeptieren Sie die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Bedingungen</a> und <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzbestimmungen</a>, um Ihre Karte hinzuzufügen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-konform',
            addPaymentCardBankLevelEncrypt: 'Verschlüsselung auf Bankniveau',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: `<muted-text>Erfahren Sie mehr über unsere <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">Sicherheit</a>.</muted-text>`,
            amountOwedTitle: 'Ausstehender Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText:
                'Dieses Konto hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchten Sie den Saldo ausgleichen und die Abrechnung für diesen Arbeitsbereich übernehmen?',
            ownerOwesAmountTitle: 'Ausstehender Saldo',
            ownerOwesAmountButtonText: 'Guthaben übertragen',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Das Konto, dem dieser Arbeitsbereich gehört (${email}), hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchten Sie diesen Betrag (${amount}) überweisen, um die Abrechnung für diesen Arbeitsbereich zu übernehmen? Ihre Zahlungskarte wird sofort belastet.`,
            subscriptionTitle: 'Übernahme des Jahresabonnements',
            subscriptionButtonText: 'Abonnement übertragen',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Die Übernahme dieses Arbeitsbereichs wird sein Jahresabonnement mit Ihrem aktuellen Abonnement zusammenführen. Dadurch erhöht sich die Größe Ihres Abonnements um ${usersCount} Mitglieder, sodass Ihre neue Abonnementgröße ${finalCount} beträgt. Möchten Sie fortfahren?`,
            duplicateSubscriptionTitle: 'Benachrichtigung über doppelte Abonnements',
            duplicateSubscriptionButtonText: 'Fortfahren',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Es sieht so aus, als ob Sie versuchen, die Abrechnung für die Arbeitsbereiche von ${email} zu übernehmen. Dazu müssen Sie jedoch zuerst Administrator in all ihren Arbeitsbereichen sein.\n\nKlicken Sie auf "Weiter", wenn Sie nur die Abrechnung für den Arbeitsbereich ${workspaceName} übernehmen möchten.\n\nWenn Sie die Abrechnung für ihr gesamtes Abonnement übernehmen möchten, lassen Sie sich bitte zuerst als Administrator zu all ihren Arbeitsbereichen hinzufügen, bevor Sie die Abrechnung übernehmen.`,
            hasFailedSettlementsTitle: 'Eigentum kann nicht übertragen werden',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Sie können die Abrechnung nicht übernehmen, weil ${email} eine überfällige Expensify Card-Abrechnung hat. Bitte bitten Sie sie, sich an concierge@expensify.com zu wenden, um das Problem zu lösen. Dann können Sie die Abrechnung für diesen Arbeitsbereich übernehmen.`,
            failedToClearBalanceTitle: 'Fehler beim Ausgleichen des Saldos',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuchen Sie es später erneut.',
            successTitle: 'Woohoo! Alles bereit.',
            successDescription: 'Sie sind jetzt der Besitzer dieses Arbeitsbereichs.',
            errorTitle: 'Hoppla! Nicht so schnell...',
            errorDescription: `<muted-text><centered-text>TBei der Übertragung des Eigentums an diesem Arbeitsbereich ist ein Problem aufgetreten. Versuchen Sie es erneut, oder <concierge-link>wenden Sie sich an Concierge</concierge-link>.</centered-text></muted-text>`,
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
                description: `Berichtsfelder ermöglichen es Ihnen, Details auf Kopfzeilenebene anzugeben, im Gegensatz zu Tags, die sich auf Ausgaben einzelner Positionen beziehen. Diese Details können spezifische Projektnamen, Informationen zu Geschäftsreisen, Standorte und mehr umfassen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Berichtsfelder sind nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Genießen Sie die automatische Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + NetSuite-Integration. Erhalten Sie tiefgehende, Echtzeit-Finanzanalysen mit nativer und benutzerdefinierter Segmentunterstützung, einschließlich Projekt- und Kundenabbildung.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere NetSuite-Integration ist nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Genießen Sie die automatische Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + Sage Intacct-Integration. Erhalten Sie tiefgehende, Echtzeit-Finanzanalysen mit benutzerdefinierten Dimensionen sowie Spesenkodierung nach Abteilung, Klasse, Standort, Kunde und Projekt (Job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere Sage Intacct-Integration ist nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Genießen Sie die automatische Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + QuickBooks Desktop-Integration. Erreichen Sie ultimative Effizienz mit einer Echtzeit-Zwei-Wege-Verbindung und der Ausgabenkodierung nach Klasse, Artikel, Kunde und Projekt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere QuickBooks Desktop-Integration ist nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Erweiterte Genehmigungen',
                description: `Wenn Sie weitere Genehmigungsebenen hinzufügen möchten – oder einfach nur sicherstellen möchten, dass die größten Ausgaben noch einmal überprüft werden – sind Sie bei uns genau richtig. Erweiterte Genehmigungen helfen Ihnen, die richtigen Kontrollen auf jeder Ebene einzurichten, damit Sie die Ausgaben Ihres Teams im Griff behalten.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Erweiterte Genehmigungen sind nur im Control-Plan verfügbar, der bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            categories: {
                title: 'Kategorien',
                description: 'Kategorien ermöglichen es dir, Ausgaben zu verfolgen und zu organisieren. Verwende unsere Standardkategorien oder füge deine eigenen hinzu.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorien sind im Collect-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            glCodes: {
                title: 'GL-Codes',
                description: `Fügen Sie Ihren Kategorien und Tags GL-Codes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL-Codes sind nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'GL- und Payroll-Codes',
                description: `Fügen Sie GL- und Payroll-Codes zu Ihren Kategorien hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL- und Payroll-Codes sind nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Steuercodes',
                description: `Fügen Sie Ihren Steuern Steuercodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Steuercodes sind nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            companyCards: {
                title: 'Unbegrenzte Firmenkarten',
                description: `Müssen Sie weitere Karten-Feeds hinzufügen? Schalten Sie unbegrenzte Firmenkarten frei, um Transaktionen von allen großen Kartenausstellern zu synchronisieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dies ist nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            rules: {
                title: 'Regeln',
                description: `Regeln laufen im Hintergrund und halten Ihre Ausgaben unter Kontrolle, damit Sie sich nicht um Kleinigkeiten kümmern müssen.\n\nFordern Sie Ausgabendetails wie Belege und Beschreibungen an, legen Sie Limits und Standards fest und automatisieren Sie Genehmigungen und Zahlungen – alles an einem Ort.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regeln sind nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            perDiem: {
                title: 'Tagegeld',
                description:
                    'Per Diem ist eine großartige Möglichkeit, um Ihre täglichen Kosten konform und vorhersehbar zu halten, wann immer Ihre Mitarbeiter reisen. Genießen Sie Funktionen wie benutzerdefinierte Raten, Standardkategorien und detailliertere Informationen wie Ziele und Unterraten.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tagespauschalen sind nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            travel: {
                title: 'Reisen',
                description:
                    'Expensify Travel ist eine neue Plattform für die Buchung und Verwaltung von Geschäftsreisen, die es Mitgliedern ermöglicht, Unterkünfte, Flüge, Transportmittel und mehr zu buchen.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reisen ist im Collect-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            reports: {
                title: 'Berichte',
                description: 'Berichte ermöglichen es Ihnen, Ausgaben für eine einfachere Verfolgung und Organisation zu gruppieren.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Berichte sind im Collect-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Mehrstufige Tags',
                description:
                    'Mehrstufige Tags helfen Ihnen, Ausgaben präziser zu verfolgen. Weisen Sie jedem Posten mehrere Tags zu – wie Abteilung, Kunde oder Kostenstelle – um den vollständigen Kontext jeder Ausgabe zu erfassen. Dies ermöglicht detailliertere Berichte, Genehmigungs-Workflows und Buchhaltungsexporte.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrstufige Tags sind nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Entfernungsraten',
                description: 'Erstellen und verwalten Sie Ihre eigenen Tarife, verfolgen Sie in Meilen oder Kilometern und legen Sie Standardkategorien für Entfernungsausgaben fest.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Entfernungsraten sind im Collect-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            auditor: {
                title: 'Prüfer',
                description: 'Prüfer erhalten schreibgeschützten Zugriff auf alle Berichte für volle Transparenz und Überwachung der Compliance.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Prüfer sind nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Mehrere Genehmigungsstufen',
                description:
                    'Mehrere Genehmigungsstufen ist ein Workflow-Tool für Unternehmen, die mehr als eine Person benötigen, um einen Bericht zu genehmigen, bevor er erstattet werden kann.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrere Genehmigungsstufen sind nur im Control-Plan verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'pro aktivem Mitglied pro Monat.',
                perMember: 'pro Mitglied pro Monat.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Aktualisieren Sie, um auf diese Funktion zuzugreifen, oder <a href="${subscriptionLink}">erfahren Sie mehr</a> über unsere Pläne und Preise.</muted-text>`,
            upgradeToUnlock: 'Diese Funktion freischalten',
            completed: {
                headline: `Sie haben Ihren Arbeitsbereich aktualisiert!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Sie haben ${policyName} erfolgreich auf den Control-Tarif upgegradet! <a href="${subscriptionLink}">Sehen Sie sich Ihr Abonnement</a> für weitere Details an.</centered-text>`,
                categorizeMessage: `Sie haben erfolgreich auf den Collect-Plan aufgerüstet. Jetzt können Sie Ihre Ausgaben kategorisieren!`,
                travelMessage: `Sie haben erfolgreich auf den Collect-Plan umgestellt. Jetzt können Sie mit der Buchung und Verwaltung von Reisen beginnen!`,
                distanceRateMessage: `Sie haben erfolgreich auf den Collect-Plan umgestellt. Jetzt können Sie den Distanzsatz ändern!`,
                gotIt: 'Verstanden, danke',
                createdWorkspace: 'Sie haben einen Arbeitsbereich erstellt!',
            },
            commonFeatures: {
                title: 'Zum Control-Plan upgraden',
                note: 'Entsperren Sie unsere leistungsstärksten Funktionen, einschließlich:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Der Control-Plan beginnt bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied pro Monat.`} <a href="${learnMoreMethodsRoute}">Erfahren Sie mehr</a> über unsere Pläne und Preise.</muted-text>`,
                    benefit1: 'Erweiterte Buchhaltungsverbindungen (NetSuite, Sage Intacct und mehr)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsabläufe mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    toUpgrade: 'Zum Upgrade klicken',
                    selectWorkspace: 'Wählen Sie einen Arbeitsbereich aus und ändern Sie den Plantyp in',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Zum Collect-Plan herabstufen',
                note: 'Wenn Sie ein Downgrade durchführen, verlieren Sie den Zugriff auf diese Funktionen und mehr:',
                benefits: {
                    note: 'Für einen vollständigen Vergleich unserer Pläne, schauen Sie sich unsere',
                    pricingPage: 'Preisseite',
                    confirm: 'Möchten Sie wirklich herabstufen und Ihre Konfigurationen entfernen?',
                    warning: 'Dies kann nicht rückgängig gemacht werden.',
                    benefit1: 'Buchhaltungsverbindungen (außer QuickBooks Online und Xero)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsabläufe mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote:
                        'Sie müssen alle Ihre Arbeitsbereiche herabstufen, bevor Ihre erste monatliche Zahlung erfolgt, um ein Abonnement zum Collect-Tarif zu beginnen. Klicken Sie',
                    selectStep: '> Wählen Sie jeden Arbeitsbereich aus > Ändern Sie den Plantyp in',
                },
            },
            completed: {
                headline: 'Ihr Arbeitsbereich wurde herabgestuft',
                description: 'Sie haben andere Arbeitsbereiche im Control-Plan. Um zum Collect-Tarif abgerechnet zu werden, müssen Sie alle Arbeitsbereiche herabstufen.',
                gotIt: 'Verstanden, danke',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & Herabstufen',
            headline: 'Ihre letzte Zahlung',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Ihre endgültige Rechnung für dieses Abonnement beträgt <strong>${formattedAmount}</strong>`,
            description2: ({date}: DateParams) => `Siehe Ihre Aufschlüsselung unten für ${date}:`,
            subscription:
                'Achtung! Diese Aktion beendet Ihr Expensify-Abonnement, löscht diesen Arbeitsbereich und entfernt alle Mitglieder des Arbeitsbereichs. Wenn Sie diesen Arbeitsbereich behalten und nur sich selbst entfernen möchten, lassen Sie zuerst einen anderen Administrator die Abrechnung übernehmen.',
            genericFailureMessage: 'Beim Bezahlen Ihrer Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Aktionen im ${workspaceName}-Arbeitsbereich sind derzeit eingeschränkt.`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Arbeitsbereichsinhaber, ${workspaceOwnerName}, muss die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Aktivitäten im Arbeitsbereich freizuschalten.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Sie müssen die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Workspace-Aktivitäten freizuschalten.',
            addPaymentCardToUnlock: 'Fügen Sie eine Zahlungskarte hinzu, um freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'Fügen Sie eine Zahlungskarte hinzu, um diesen Arbeitsbereich weiterhin zu nutzen.',
            pleaseReachOutToYourWorkspaceAdmin: 'Bitte wenden Sie sich bei Fragen an Ihren Workspace-Administrator.',
            chatWithYourAdmin: 'Mit Ihrem Administrator chatten',
            chatInAdmins: 'Im #admins chatten',
            addPaymentCard: 'Zahlungskarte hinzufügen',
            goToSubscription: 'Zum Abonnement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Ausgaben',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>Legen Sie Ausgabenkontrollen und Standardwerte für einzelne Ausgaben fest. Sie können auch Regeln für <a href="${categoriesPageLink}">kategorien</a> und <a href="${tagsPageLink}">tags</a> erstellen.</muted-text>`,
                receiptRequiredAmount: 'Beleg erforderlicher Betrag',
                receiptRequiredAmountDescription: 'Belege anfordern, wenn die Ausgaben diesen Betrag überschreiten, es sei denn, eine Kategorievorschrift hebt dies auf.',
                maxExpenseAmount: 'Maximaler Ausgabenbetrag',
                maxExpenseAmountDescription: 'Kennzeichnen Sie Ausgaben, die diesen Betrag überschreiten, es sei denn, sie werden durch eine Kategorievorschrift außer Kraft gesetzt.',
                maxAge: 'Maximales Alter',
                maxExpenseAge: 'Maximales Ausgabenalter',
                maxExpenseAgeDescription: 'Kennzeichnen Sie Ausgaben, die älter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: () => ({
                    one: '1 Tag',
                    other: (count: number) => `${count} Tage`,
                }),
                cashExpenseDefault: 'Bargeldausgabe standard',
                cashExpenseDefaultDescription:
                    'Wählen Sie, wie Bargeldausgaben erstellt werden sollen. Eine Ausgabe gilt als Bargeldausgabe, wenn sie keine importierte Firmenkartentransaktion ist. Dazu gehören manuell erstellte Ausgaben, Belege, Pauschalen, Kilometer- und Zeitaufwand.',
                reimbursableDefault: 'Erstattungsfähig',
                reimbursableDefaultDescription: 'Ausgaben werden meistens an Mitarbeiter zurückgezahlt',
                nonReimbursableDefault: 'Nicht erstattungsfähig',
                nonReimbursableDefaultDescription: 'Ausgaben werden gelegentlich an Mitarbeiter zurückgezahlt',
                alwaysReimbursable: 'Immer erstattungsfähig',
                alwaysReimbursableDescription: 'Ausgaben werden immer an Mitarbeiter zurückgezahlt',
                alwaysNonReimbursable: 'Nie erstattungsfähig',
                alwaysNonReimbursableDescription: 'Ausgaben werden nie an Mitarbeiter zurückgezahlt',
                billableDefault: 'Abrechnungsstandard',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>Wählen Sie aus, ob Bar- und Kreditkartenausgaben standardmäßig abrechnungsfähig sein sollen. Abrechnungsfähige Ausgaben werden in <a href="${tagsPageLink}">Tags</a> aktiviert oder deaktiviert.</muted-text>`,
                billable: 'Abrechenbar',
                billableDescription: 'Spesen werden meist an Kunden weiterberechnet.',
                nonBillable: 'Nicht abrechenbar',
                nonBillableDescription: 'Spesen werden gelegentlich an Kunden weiterberechnet.',
                eReceipts: 'eQuittungen',
                eReceiptsHint: `eQuittungen werden automatisch erstellt [für die meisten USD-Kredit-Transaktionen](${CONST.DEEP_DIVE_ERECEIPTS}).`,
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
                title: 'Spesenabrechnungen',
                subtitle: 'Automatisieren Sie die Einhaltung von Spesenabrechnungen, Genehmigungen und Zahlungen.',
                preventSelfApprovalsTitle: 'Selbstgenehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindern Sie, dass Arbeitsbereichsmitglieder ihre eigenen Spesenabrechnungen genehmigen.',
                autoApproveCompliantReportsTitle: 'Konforme Berichte automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen für die automatische Genehmigung infrage kommen.',
                autoApproveReportsUnderTitle: 'Berichte unter automatisch genehmigen',
                autoApproveReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch genehmigt.',
                randomReportAuditTitle: 'Zufällige Berichtprüfung',
                randomReportAuditDescription: 'Einige Berichte müssen manuell genehmigt werden, auch wenn sie für die automatische Genehmigung in Frage kommen.',
                autoPayApprovedReportsTitle: 'Automatisch genehmigte Berichte bezahlen',
                autoPayApprovedReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen für die automatische Zahlung berechtigt sind.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) =>
                    `Bitte geben Sie einen Betrag ein, der kleiner als ${currency ?? ''}20.000 ist.`,
                autoPayApprovedReportsLockedSubtitle: 'Gehen Sie zu Weitere Funktionen und aktivieren Sie Workflows, dann fügen Sie Zahlungen hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Berichte unter Auto-Zahlung',
                autoPayReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch bezahlt.',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Gehen Sie zu [Mehr Funktionen](${moreFeaturesLink}) und aktivieren Sie Workflows. Fügen Sie dann ${featureName} hinzu, um diese Funktion freizuschalten.`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Gehen Sie zu [Mehr Funktionen](${moreFeaturesLink}) und aktivieren Sie ${featureName}, um diese Funktion freizuschalten.`,
            },
            categoryRules: {
                title: 'Kategorienregeln',
                approver: 'Genehmiger',
                requireDescription: 'Beschreibung erforderlich',
                descriptionHint: 'Beschreibungshinweis',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Erinnern Sie die Mitarbeiter daran, zusätzliche Informationen für Ausgaben der Kategorie „${categoryName}“ bereitzustellen. Dieser Hinweis erscheint im Beschreibungsfeld der Ausgaben.`,
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je kürzer, desto besser!',
                maxAmount: 'Maximalbetrag',
                flagAmountsOver: 'Beträge über markieren',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Gilt für die Kategorie „${categoryName}“.`,
                flagAmountsOverSubtitle: 'Dies überschreibt den Höchstbetrag für alle Ausgaben.',
                expenseLimitTypes: {
                    expense: 'Einzelausgabe',
                    expenseSubtitle: 'Beträge von Ausgaben nach Kategorie kennzeichnen. Diese Regel überschreibt die allgemeine Arbeitsbereichsregel für den maximalen Ausgabenbetrag.',
                    daily: 'Kategorietotal',
                    dailySubtitle: 'Gesamtausgaben pro Kategorie pro Spesenbericht kennzeichnen.',
                },
                requireReceiptsOver: 'Belege über erforderlich',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Belege niemals verlangen',
                    always: 'Immer Belege anfordern',
                },
                defaultTaxRate: 'Standardsteuersatz',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Gehen Sie zu [Mehr Funktionen](${moreFeaturesLink}) und aktivieren Sie Workflows, dann fügen Sie Genehmigungen hinzu, um diese Funktion freizuschalten.`,
            },
            customRules: {
                title: 'Benutzerdefinierte Regeln',
                cardSubtitle: 'Hier befindet sich die Ausgabenrichtlinie deines Teams, damit alle genau wissen, was abgedeckt ist.',
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
            description: 'Wählen Sie einen Plan, der zu Ihnen passt. Für eine detaillierte Liste der Funktionen und Preise, schauen Sie sich unsere',
            subscriptionLink: 'Planarten und Preishilfe-Seite',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Sie haben sich verpflichtet, bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} 1 aktives Mitglied im Control-Plan zu haben. Sie können zu einem nutzungsbasierten Abonnement wechseln und ab dem ${annualSubscriptionEndDate} auf den Collect-Plan herabstufen, indem Sie die automatische Verlängerung deaktivieren.`,
                other: `Sie haben sich zu ${count} aktiven Mitgliedern im Control-Plan verpflichtet, bis Ihr Jahresabonnement am ${annualSubscriptionEndDate} endet. Sie können zu einem nutzungsbasierten Abonnement wechseln und ab dem ${annualSubscriptionEndDate} auf den Collect-Plan herabstufen, indem Sie die automatische Verlängerung deaktivieren in`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um Ihren Weg zur Größe freizumachen!',
        description: 'Wählen Sie aus den untenstehenden Support-Optionen:',
        chatWithConcierge: 'Chatten Sie mit Concierge',
        scheduleSetupCall: 'Einen Einrichtungstermin vereinbaren',
        scheduleACall: 'Anruf planen',
        questionMarkButtonTooltip: 'Holen Sie sich Unterstützung von unserem Team',
        exploreHelpDocs: 'Hilfe-Dokumente durchsuchen',
        registerForWebinar: 'Für das Webinar registrieren',
        onboardingHelp: 'Hilfe bei der Einführung',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Standard-Hautton ändern',
        headers: {
            frequentlyUsed: 'Häufig verwendet',
            smileysAndEmotion: 'Smileys & Emotion',
            peopleAndBody: 'Menschen & Körper',
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
        restrictedDescription: 'Personen in Ihrem Arbeitsbereich können diesen Raum finden.',
        privateDescription: 'Personen, die zu diesem Raum eingeladen wurden, können ihn finden.',
        publicDescription: 'Jeder kann diesen Raum finden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Jeder kann diesen Raum finden',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits.',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} ist ein Standardraum in allen Arbeitsbereichen. Bitte wählen Sie einen anderen Namen.`,
        roomNameInvalidError: 'Raumnamen dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.',
        pleaseEnterRoomName: 'Bitte geben Sie einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte wählen Sie einen Arbeitsbereich aus',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}umbenannt in "${newName}" (zuvor "${oldName}")` : `${actor} hat diesen Raum in "${newName}" umbenannt (vorher "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Raum umbenannt in ${newName}`,
        social: 'sozial',
        selectAWorkspace: 'Wählen Sie einen Arbeitsbereich aus',
        growlMessageOnRenameError: 'Der Arbeitsbereichsraum kann nicht umbenannt werden. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
        visibilityOptions: {
            restricted: 'Arbeitsbereich', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privat',
            public: 'Öffentlich',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Öffentliche Ankündigung',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Einreichen und Schließen',
        submitAndApprove: 'Einreichen und Genehmigen',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `hat ${approverName} (${approverEmail}) als Genehmiger für das ${field} "${name}" hinzugefügt`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `hat ${approverName} (${approverEmail}) als Genehmiger für das ${field} "${name}" entfernt`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `hat den Genehmiger für das ${field} "${name}" auf ${formatApprover(newApproverName, newApproverEmail)} geändert (zuvor ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie "${categoryName}" hinzugefügt`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `Kategorie "${categoryName}" entfernt`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'deaktiviert' : 'aktiviert'} die Kategorie "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `hat den Gehaltscode "${newValue}" zur Kategorie "${categoryName}" hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Gehaltsabrechnungscode "${oldValue}" aus der Kategorie "${categoryName}" entfernt`;
            }
            return `hat den Gehaltsabrechnungscode der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `hat den GL-Code "${newValue}" zur Kategorie "${categoryName}" hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den GL-Code "${oldValue}" aus der Kategorie "${categoryName}" entfernt`;
            }
            return `hat den GL-Code der Kategorie „${categoryName}“ in „${newValue}“ geändert (vorher „${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `änderte die Beschreibung der Kategorie "${categoryName}" zu ${!oldValue ? 'erforderlich' : 'nicht erforderlich'} (zuvor ${!oldValue ? 'nicht erforderlich' : 'erforderlich'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `hat einen maximalen Betrag von ${newAmount} zur Kategorie "${categoryName}" hinzugefügt`;
            }
            if (oldAmount && !newAmount) {
                return `hat den maximalen Betrag von ${oldAmount} aus der Kategorie "${categoryName}" entfernt`;
            }
            return `hat den maximalen Betrag der Kategorie "${categoryName}" auf ${newAmount} geändert (zuvor ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `hat einen Grenzwerttyp von ${newValue} zur Kategorie "${categoryName}" hinzugefügt`;
            }
            return `hat den Limit-Typ der Kategorie "${categoryName}" auf ${newValue} geändert (vorher ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie "${categoryName}" aktualisiert, indem Belege in ${newValue} geändert wurden`;
            }
            return `hat die Kategorie "${categoryName}" auf ${newValue} geändert (vorher ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `die Kategorie "${oldName}" in "${newName}" umbenannt`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `hat den Beschreibungshinweis "${oldValue}" aus der Kategorie "${categoryName}" entfernt`;
            }
            return !oldValue
                ? `hat den Beschreibungshinweis "${newValue}" zur Kategorie "${categoryName}" hinzugefügt`
                : `hat den Hinweis zur Kategoriebeschreibung "${categoryName}" in „${newValue}“ geändert (vorher „${oldValue}“)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `den Taglisten-Namen in "${newName}" geändert (vorher "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag "${tagName}" zur Liste "${tagListName}" hinzugefügt`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `hat die Tag-Liste "${tagListName}" aktualisiert, indem der Tag "${oldName}" in "${newName}" geändert wurde`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'aktiviert' : 'deaktiviert'} das Tag "${tagName}" in der Liste "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat den Tag "${tagName}" aus der Liste "${tagListName}" entfernt`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `entfernte "${count}" Tags aus der Liste "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `hat das Tag "${tagName}" in der Liste "${tagListName}" aktualisiert, indem das ${updatedField} auf "${newValue}" geändert wurde (vorher "${oldValue}")`;
            }
            return `hat das Tag "${tagName}" in der Liste "${tagListName}" aktualisiert, indem ein ${updatedField} von "${newValue}" hinzugefügt wurde`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `änderte die ${customUnitName} ${updatedField} zu "${newValue}" (zuvor "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung bei Entfernungsraten`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `hat einen neuen "${customUnitName}"-Satz "${rateName}" hinzugefügt`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `hat den Satz des ${customUnitName} ${updatedField} "${customUnitRateName}" auf "${newValue}" geändert (zuvor "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `hat den Steuersatz für den Distanzsatz "${customUnitRateName}" auf "${newValue} (${newTaxPercentage})" geändert (zuvor "${oldValue} (${oldTaxPercentage})")`;
            }
            return `hat den Steuersatz "${newValue} (${newTaxPercentage})" zum Distanzsatz "${customUnitRateName}" hinzugefügt`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `hat den erstattungsfähigen Steueranteil am Distanzsatz "${customUnitRateName}" auf "${newValue}" geändert (zuvor "${oldValue}")`;
            }
            return `hat einen steuerlich absetzbaren Anteil von "${newValue}" zum Distanzsatz "${customUnitRateName}" hinzugefügt`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `entfernte den "${customUnitName}"-Satz "${rateName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `hinzugefügtes ${fieldType} Berichts-Feld "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `den Standardwert des Berichtsfeldes "${fieldName}" auf "${defaultValue}" setzen`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `die Option "${optionName}" zum Berichtsfeld "${fieldName}" hinzugefügt`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option "${optionName}" aus dem Berichtsfeld "${fieldName}" entfernt`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'aktiviert' : 'deaktiviert'} die Option "${optionName}" für das Berichtsfeld "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'aktiviert' : 'deaktiviert'} alle Optionen für das Berichtsfeld "${fieldName}"`;
            }
            return `${allEnabled ? 'aktiviert' : 'deaktiviert'} die Option "${optionName}" für das Berichtsfeld "${fieldName}", wodurch alle Optionen ${allEnabled ? 'aktiviert' : 'deaktiviert'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `entferntes ${fieldType}-Berichtsfeld "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `aktualisiert "Prevent self-approval" auf "${newValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}" (zuvor "${oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat den maximal erforderlichen Belegbetrag auf ${newValue} geändert (vorher ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat den maximalen Ausgabenbetrag für Verstöße auf ${newValue} geändert (zuvor ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aktualisiert "Maximales Ausgabenalter (Tage)" auf "${newValue}" (zuvor "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `Legen Sie das Einreichungsdatum des Monatsberichts auf "${newValue}" fest.`;
            }
            return `das Einreichungsdatum des monatlichen Berichts auf "${newValue}" aktualisiert (zuvor "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `aktualisiert "Kosten an Kunden weiterberechnen" auf "${newValue}" (vorher "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `aktualisiert "Bargeldausgabe Standard" auf "${newValue}" (vorher "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `"Standardberichtstitel erzwingen" ${value ? 'on' : 'aus'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `hat den Namen dieses Arbeitsbereichs in "${newName}" geändert (vorher "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `Setzen Sie die Beschreibung dieses Arbeitsbereichs auf "${newDescription}".`
                : `hat die Beschreibung dieses Arbeitsbereichs auf "${newDescription}" aktualisiert (zuvor "${oldDescription}")`,
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
                one: `hat Sie aus dem Genehmigungsworkflow und dem Ausgaben-Chat von ${joinedNames} entfernt. Bereits eingereichte Berichte bleiben zur Genehmigung in Ihrem Posteingang verfügbar.`,
                other: `hat dich aus den Genehmigungs-Workflows und Ausgaben-Chats von ${joinedNames} entfernt. Bereits eingereichte Berichte bleiben zur Genehmigung in deinem Posteingang verfügbar.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `hat Ihre Rolle in ${policyName} von ${oldRole} zu Benutzer aktualisiert. Sie wurden aus allen Einreicher-Ausgabenchats entfernt, außer Ihrem eigenen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `die Standardwährung auf ${newCurrency} aktualisiert (zuvor ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `hat die automatische Berichterstattungshäufigkeit auf "${newFrequency}" aktualisiert (zuvor "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `hat den Genehmigungsmodus auf "${newValue}" aktualisiert (zuvor "${oldValue}")`,
        upgradedWorkspace: 'dieses Arbeitsbereich auf den Control-Plan hochgestuft',
        forcedCorporateUpgrade: `Dieser Arbeitsbereich wurde auf den Control-Tarif hochgestuft. Klicken Sie <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> für weitere Informationen.`,
        downgradedWorkspace: 'hat dieses Arbeitsbereich auf den Collect-Plan herabgestuft',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `änderte die Rate der Berichte, die zufällig zur manuellen Genehmigung weitergeleitet werden, auf ${Math.round(newAuditRate * 100)}% (zuvor ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `hat das manuelle Genehmigungslimit für alle Ausgaben auf ${newLimit} geändert (vorher ${oldLimit})`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'aktiviert' : 'Deaktiviert'} Erstattungen für diesen Arbeitsbereich`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `hat die Steuer "${taxName}" hinzugefügt`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `hat die Steuer "${taxName}" entfernt`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `hat die Steuer "${oldValue}" in "${newValue}" umbenannt`;
                }
                case 'code': {
                    return `hat den Steuercode für "${taxName}" von "${oldValue}" auf "${newValue}" geändert`;
                }
                case 'rate': {
                    return `hat den Steuersatz für "${taxName}" von "${oldValue}" auf "${newValue}" geändert`;
                }
                case 'enabled': {
                    return `${oldValue ? `hat die Steuer "${taxName}" deaktiviert` : `hat die Steuer "${taxName}" aktiviert`}`;
                }
                default: {
                    return '';
                }
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'deaktiviert'} Teilnehmerverfolgung`,
    },
    roomMembersPage: {
        memberNotFound: 'Mitglied nicht gefunden.',
        useInviteButton: 'Um ein neues Mitglied zum Chat einzuladen, verwenden Sie bitte die Einladungs-Schaltfläche oben.',
        notAuthorized: `Sie haben keinen Zugriff auf diese Seite. Wenn Sie versuchen, diesem Raum beizutreten, bitten Sie einfach ein Mitglied des Raums, Sie hinzuzufügen. Etwas anderes? Wenden Sie sich an ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Es sieht so aus, als wäre dieser Raum archiviert worden. Bei Fragen wenden Sie sich bitte an ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Möchten Sie ${memberName} wirklich aus dem Raum entfernen?`,
            other: 'Möchten Sie die ausgewählten Mitglieder wirklich aus dem Raum entfernen?',
        }),
        error: {
            genericAdd: 'Es gab ein Problem beim Hinzufügen dieses Raummitglieds.',
        },
    },
    newTaskPage: {
        assignTask: 'Aufgabe zuweisen',
        assignMe: 'Mir zuweisen',
        confirmTask: 'Aufgabe bestätigen',
        confirmError: 'Bitte geben Sie einen Titel ein und wählen Sie ein Freigabeziel aus.',
        descriptionOptional: 'Beschreibung (optional)',
        pleaseEnterTaskName: 'Bitte geben Sie einen Titel ein',
        pleaseEnterTaskDestination: 'Bitte wählen Sie aus, wo Sie diese Aufgabe teilen möchten.',
    },
    task: {
        task: 'Aufgabe',
        title: 'Titel',
        description: 'Beschreibung',
        assignee: 'Zugewiesene Person',
        completed: 'Abgeschlossen',
        action: 'Vervollständigen',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `Aufgabe für ${title}`,
            completed: 'als abgeschlossen markiert',
            canceled: 'gelöschte Aufgabe',
            reopened: 'als unvollständig markiert',
            error: 'Sie haben keine Berechtigung, die angeforderte Aktion auszuführen.',
        },
        markAsComplete: 'Als abgeschlossen markieren',
        markAsIncomplete: 'Als unvollständig markieren',
        assigneeError: 'Beim Zuweisen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einem anderen Beauftragten.',
        genericCreateTaskFailureMessage: 'Beim Erstellen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
        deleteTask: 'Aufgabe löschen',
        deleteConfirmation: 'Möchten Sie diese Aufgabe wirklich löschen?',
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
            newChat: 'Neuer Chatbildschirm',
            copy: 'Kommentar kopieren',
            openDebug: 'Öffnen Sie das Dialogfeld für Testeinstellungen',
        },
    },
    guides: {
        screenShare: 'Bildschirmfreigabe',
        screenShareRequest: 'Expensify lädt Sie zu einer Bildschirmfreigabe ein',
    },
    search: {
        resultsAreLimited: 'Suchergebnisse sind begrenzt.',
        viewResults: 'Ergebnisse anzeigen',
        resetFilters: 'Filter zurücksetzen',
        searchResults: {
            emptyResults: {
                title: 'Nichts zu zeigen',
                subtitle: `Versuchen Sie, Ihre Suchkriterien anzupassen oder etwas mit dem + Button zu erstellen.`,
            },
            emptyExpenseResults: {
                title: 'Sie haben noch keine Ausgaben erstellt.',
                subtitle: 'Erstellen Sie eine Ausgabe oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die grüne Schaltfläche unten, um eine Ausgabe zu erstellen.',
            },
            emptyReportResults: {
                title: 'Sie haben noch keine Berichte erstellt.',
                subtitle: 'Erstellen Sie einen Bericht oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die grüne Schaltfläche unten, um einen Bericht zu erstellen.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Sie haben noch keine
                    Rechnungen erstellt
                `),
                subtitle: 'Senden Sie eine Rechnung oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die grüne Schaltfläche unten, um eine Rechnung zu senden.',
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
                subtitle: 'Herzlichen Glückwunsch! Du hast die Ziellinie überquert.',
            },
            emptyExportResults: {
                title: 'Keine Ausgaben zum Exportieren',
                subtitle: 'Zeit, es ruhig angehen zu lassen, gute Arbeit.',
            },
            emptyStatementsResults: {
                title: 'Keine Ausgaben zu sehen',
                subtitle: 'Keine Ergebnisse. Bitte versuchen Sie, Ihre Filter anzupassen.',
            },
            emptyUnapprovedResults: {
                title: 'Keine Ausgaben zur Genehmigung',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
        },
        statements: 'Erklärungen',
        unapprovedCash: 'Nicht genehmigtes Bargeld',
        unapprovedCard: 'Nicht genehmigte Karte',
        reconciliation: 'Abgleich',
        saveSearch: 'Suche speichern',
        deleteSavedSearch: 'Gespeicherte Suche löschen',
        deleteSavedSearchConfirm: 'Möchten Sie diese Suche wirklich löschen?',
        searchName: 'Name suchen',
        savedSearchesMenuItemTitle: 'Gespeichert',
        groupedExpenses: 'gruppierte Ausgaben',
        bulkActions: {
            approve: 'Genehmigen',
            pay: 'Bezahlen',
            delete: 'Löschen',
            hold: 'Halten',
            unhold: 'Halten entfernen',
            reject: 'Ablehnen',
            noOptionsAvailable: 'Keine Optionen verfügbar für die ausgewählte Gruppe von Ausgaben.',
        },
        filtersHeader: 'Filter',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Vor ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `After ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Niemals',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Letzter Monat',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Dieser Monat',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Letzte Erklärung',
                },
            },
            status: 'Status',
            keyword: 'Schlüsselwort',
            keywords: 'Schlüsselwörter',
            currency: 'Währung',
            completed: 'Abgeschlossen',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Weniger als ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Größer als ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Zwischen ${greaterThan} und ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Gleich ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Individuelle Karten',
                closedCards: 'Geschlossene Karten',
                cardFeeds: 'Karten-Feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Alle ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Aktuell',
            past: 'Vergangenheit',
            submitted: 'Eingereicht',
            approved: 'Genehmigt',
            paid: 'Bezahlt',
            exported: 'Exportiert',
            posted: 'Gepostet',
            withdrawn: 'Storniert',
            billable: 'Abrechenbar',
            reimbursable: 'Erstattungsfähig',
            purchaseCurrency: 'Kaufwährung',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Von',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Karte',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Auszahlungs-ID',
            },
            feed: 'Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Erstattung',
            },
            is: 'Ist',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Einreichen',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Genehmigen',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Bezahlen',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Exportieren',
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} ist ${value}`,
        },
        has: 'Hat',
        groupBy: 'Gruppe nach',
        moneyRequestReport: {
            emptyStateTitle: 'Dieser Bericht enthält keine Ausgaben.',
        },
        noCategory: 'Keine Kategorie',
        noTag: 'Kein Tag',
        expenseType: 'Ausgabentyp',
        withdrawalType: 'Auszahlungsart',
        recentSearches: 'Letzte Suchanfragen',
        recentChats: 'Letzte Chats',
        searchIn: 'Suche in',
        searchPlaceholder: 'Nach etwas suchen',
        suggestions: 'Vorschläge',
        exportSearchResults: {
            title: 'Export erstellen',
            description: 'Wow, das sind viele Artikel! Wir werden sie zusammenpacken, und Concierge wird Ihnen in Kürze eine Datei senden.',
        },
        exportAll: {
            selectAllMatchingItems: 'Alle passenden Elemente auswählen',
            allMatchingItemsSelected: 'Alle übereinstimmenden Elemente ausgewählt',
        },
    },
    genericErrorPage: {
        title: 'Oh-oh, etwas ist schiefgelaufen!',
        body: {
            helpTextMobile: 'Bitte schließen und öffnen Sie die App erneut oder wechseln Sie zu',
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
                'Überprüfen Sie Ihren Fotos- oder Downloads-Ordner auf eine Kopie Ihres QR-Codes. Tipp: Fügen Sie ihn einer Präsentation hinzu, damit Ihr Publikum ihn scannen und direkt mit Ihnen in Verbindung treten kann.',
        },
        generalError: {
            title: 'Anlagenfehler',
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
        update: 'Neues Expensify aktualisieren',
        checkForUpdates: 'Nach Updates suchen',
        toggleDevTools: 'Entwicklerwerkzeuge umschalten',
        viewShortcuts: 'Tastenkombinationen anzeigen',
        services: 'Dienstleistungen',
        hide: 'Neues Expensify ausblenden',
        hideOthers: 'Andere ausblenden',
        showAll: 'Alle anzeigen',
        quit: 'Beende New Expensify',
        fileMenu: 'Datei',
        closeWindow: 'Fenster schließen',
        editMenu: 'Bearbeiten',
        undo: 'Rückgängig machen',
        redo: 'Wiederholen',
        cut: 'Schneiden',
        copy: 'Kopieren',
        paste: 'Einfügen',
        pasteAndMatchStyle: 'Einfügen und Stil anpassen',
        pasteAsPlainText: 'Als unformatierter Text einfügen',
        delete: 'Löschen',
        selectAll: 'Alle auswählen',
        speechSubmenu: 'Rede',
        startSpeaking: 'Sprechen Sie los',
        stopSpeaking: 'Hör auf zu sprechen',
        viewMenu: 'Ansicht',
        reload: 'Neu laden',
        forceReload: 'Erneut Laden Erzwingen',
        resetZoom: 'Tatsächliche Größe',
        zoomIn: 'Vergrößern',
        zoomOut: 'Verkleinern',
        togglefullscreen: 'Vollbild umschalten',
        historyMenu: 'Verlauf',
        back: 'Zurück',
        forward: 'Weiterleiten',
        windowMenu: 'Fenster',
        minimize: 'Minimieren',
        zoom: 'Zoom',
        front: 'Alle nach vorne bringen',
        helpMenu: 'Hilfe',
        learnMore: 'Erfahren Sie mehr',
        documentation: 'Dokumentation',
        communityDiscussions: 'Community-Diskussionen',
        searchIssues: 'Probleme durchsuchen',
    },
    historyMenu: {
        forward: 'Weiterleiten',
        back: 'Zurück',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Update verfügbar',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `Die neue Version wird in Kürze verfügbar sein.${!isSilentUpdating ? 'Wir benachrichtigen Sie, wenn wir bereit sind, das Update durchzuführen.' : ''}`,
            soundsGood: 'Klingt gut',
        },
        notAvailable: {
            title: 'Aktualisierung nicht verfügbar',
            message: 'Es ist derzeit kein Update verfügbar. Bitte später erneut prüfen!',
            okay: 'Okay',
        },
        error: {
            title: 'Aktualisierungsprüfung fehlgeschlagen',
            message: 'Wir konnten nicht nach einem Update suchen. Bitte versuchen Sie es in Kürze erneut.',
        },
    },
    reportLayout: {
        reportLayout: 'Berichtslayout',
        groupByLabel: 'Gruppieren nach:',
        selectGroupByOption: 'Wählen Sie aus, wie die Berichtsausgaben gruppiert werden sollen',
        uncategorized: 'Nicht kategorisiert',
        noTag: 'Kein Tag',
        selectGroup: ({groupName}: {groupName: string}) => `Alle Ausgaben in ${groupName} auswählen`,
        groupBy: {
            category: 'Kategorie',
            tag: 'Tag',
        },
    },
    report: {
        newReport: {
            createReport: 'Bericht erstellen',
            chooseWorkspace: 'Wählen Sie einen Arbeitsbereich für diesen Bericht aus.',
            emptyReportConfirmationTitle: 'Du hast bereits einen leeren Bericht',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Möchtest du wirklich einen weiteren Bericht in ${workspaceName} erstellen? Du kannst auf deine leeren Berichte zugreifen unter`,
            emptyReportConfirmationPromptLink: 'Berichte',
            genericWorkspaceName: 'diesem Arbeitsbereich',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler beim Erstellen dieses Chats. Bitte versuchen Sie es später erneut.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Posten des Kommentars. Bitte versuchen Sie es später noch einmal.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuchen Sie es später erneut.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuchen Sie es später erneut.',
        noActivityYet: 'Noch keine Aktivität',
        connectionSettings: 'Verbindungseinstellungen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `hat ${fieldName} in "${newValue}" geändert (zuvor "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `hat ${fieldName} auf "${newValue}" gesetzt`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `Arbeitsbereich geändert${fromPolicyName ? ` (zuvor ${fromPolicyName})` : ''}`;
                    }
                    return `Arbeitsbereich geändert zu ${toPolicyName}${fromPolicyName ? ` (zuvor ${fromPolicyName})` : ''}`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `Typ von ${oldType} zu ${newType} geändert`,
                exportedToCSV: `in CSV exportiert`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        // The label will always be in English, so we need to translate it
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `exportiert nach ${translatedLabel}`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `exportiert nach ${label} über`,
                    automaticActionTwo: 'Buchhaltungseinstellungen',
                    manual: ({label}: ExportedToIntegrationParams) => `hat diesen Bericht als manuell exportiert nach ${label} markiert.`,
                    automaticActionThree: 'und erfolgreich einen Datensatz erstellt für',
                    reimburseableLink: 'Auslagen',
                    nonReimbursableLink: 'Unternehmensausgaben mit Firmenkarte',
                    pending: ({label}: ExportedToIntegrationParams) => `hat begonnen, diesen Bericht nach ${label} zu exportieren...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `Fehler beim Exportieren dieses Berichts nach ${label} ("${errorMessage}${linkText ? ` <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `hat eine Quittung hinzugefügt`,
                managerDetachReceipt: `einen Beleg entfernt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `${currency}${amount} anderswo bezahlt`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `bezahlte ${currency}${amount} über Integration`,
                outdatedBankAccount: `konnte die Zahlung aufgrund eines Problems mit dem Bankkonto des Zahlers nicht verarbeiten`,
                reimbursementACHBounce: `konnte die Zahlung aufgrund eines Bankkontoproblems nicht verarbeiten`,
                reimbursementACHCancelled: `die Zahlung storniert`,
                reimbursementAccountChanged: `Konnte die Zahlung nicht verarbeiten, da der Zahler die Bankkonten gewechselt hat.`,
                reimbursementDelayed: `hat die Zahlung bearbeitet, aber sie verzögert sich um 1-2 weitere Werktage`,
                selectedForRandomAudit: `zufällig zur Überprüfung ausgewählt`,
                selectedForRandomAuditMarkdown: `[zufällig ausgewählt](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) zur Überprüfung`,
                share: ({to}: ShareParams) => `eingeladenes Mitglied ${to}`,
                unshare: ({to}: UnshareParams) => `Mitglied ${to} entfernt`,
                stripePaid: ({amount, currency}: StripePaidParams) => `bezahlt ${currency}${amount}`,
                takeControl: `übernahm die Kontrolle`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `Beim Synchronisieren mit ${label} ist ein Problem aufgetreten${errorMessage ? ` ("${errorMessage}")` : ''}. Bitte behebe das Problem in den <a href="${workspaceAccountingLink}">Arbeitsbereichseinstellungen</a>.`,
                addEmployee: ({email, role}: AddEmployeeParams) => `hinzugefügt ${email} als ${role === 'member' ? 'a' : 'an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `hat die Rolle von ${email} auf ${newRole} aktualisiert (zuvor ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `hat das benutzerdefinierte Feld 1 von ${email} entfernt (zuvor "${previousValue}")`;
                    }
                    return !previousValue
                        ? `"${newValue}" zu benutzerdefiniertem Feld 1 von ${email} hinzugefügt`
                        : `hat das benutzerdefinierte Feld 1 von ${email} in "${newValue}" geändert (vorher "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `entfernte benutzerdefiniertes Feld 2 von ${email} (vorher "${previousValue}")`;
                    }
                    return !previousValue
                        ? `"${newValue}" zu benutzerdefiniertem Feld 2 von ${email} hinzugefügt`
                        : `änderte das benutzerdefinierte Feld 2 von ${email} zu "${newValue}" (vorher "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} hat den Arbeitsbereich verlassen`,
                removeMember: ({email, role}: AddEmployeeParams) => `entfernt ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} entfernt`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbunden mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'hat den Chat verlassen',
            },
            error: {
                invalidCredentials: 'Ungültige Anmeldedaten, bitte überprüfen Sie die Konfiguration Ihrer Verbindung.',
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
        spendManagement: 'Ausgabenmanagement',
        expenseReports: 'Spesenabrechnungen',
        companyCreditCard: 'Unternehmens-Kreditkarte',
        receiptScanningApp: 'Beleg-Scan-App',
        billPay: 'Bill Pay',
        invoicing: 'Rechnungsstellung',
        CPACard: 'CPA-Karte',
        payroll: 'Gehaltsabrechnung',
        travel: 'Reisen',
        resources: 'Ressourcen',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Pressemappe',
        support: 'Unterstützung',
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
        logIn: 'Einloggen',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Zurück zur Chatliste navigieren',
        chatWelcomeMessage: 'Begrüßungsnachricht im Chat',
        navigatesToChat: 'Navigiert zu einem Chat',
        newMessageLineIndicator: 'Neue Nachrichtenzeilenanzeige',
        chatMessage: 'Chat-Nachricht',
        lastChatMessagePreview: 'Letzte Chatnachricht-Vorschau',
        workspaceName: 'Arbeitsbereichsname',
        chatUserDisplayNames: 'Chat-Mitglied Anzeigenamen',
        scrollToNewestMessages: 'Zu den neuesten Nachrichten scrollen',
        preStyledText: 'Vorangestylter Text',
        viewAttachment: 'Anhang anzeigen',
    },
    parentReportAction: {
        deletedReport: 'Gelöschter Bericht',
        deletedMessage: 'Gelöschte Nachricht',
        deletedExpense: 'Gelöschte Ausgabe',
        reversedTransaction: 'Stornierte Transaktion',
        deletedTask: 'Gelöschte Aufgabe',
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
        flagDescription: 'Alle markierten Nachrichten werden zur Überprüfung an einen Moderator gesendet.',
        chooseAReason: 'Wählen Sie einen Grund für die Markierung unten aus:',
        spam: 'Spam',
        spamDescription: 'Unaufgeforderte themenfremde Werbung',
        inconsiderate: 'Rücksichtslos',
        inconsiderateDescription: 'Beleidigende oder respektlose Formulierungen mit fragwürdigen Absichten',
        intimidation: 'Einschüchterung',
        intimidationDescription: 'Aggressiv eine Agenda verfolgen trotz berechtigter Einwände',
        bullying: 'Mobbing',
        bullyingDescription: 'Zielen auf eine Person, um Gehorsam zu erlangen',
        harassment: 'Belästigung',
        harassmentDescription: 'Rassistisches, frauenfeindliches oder anderweitig diskriminierendes Verhalten',
        assault: 'Angriff',
        assaultDescription: 'Speziell gezielter emotionaler Angriff mit der Absicht, Schaden zuzufügen.',
        flaggedContent: 'Diese Nachricht wurde als Verstoß gegen unsere Gemeinschaftsregeln markiert und der Inhalt wurde verborgen.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet anonyme Warnung und Nachricht wird zur Überprüfung gemeldet.',
        levelTwoResult: 'Nachricht im Kanal verborgen, plus anonyme Warnung und Nachricht wird zur Überprüfung gemeldet.',
        levelThreeResult: 'Nachricht aus dem Kanal entfernt, anonyme Warnung gesendet und Nachricht zur Überprüfung gemeldet.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Zum Einreichen von Ausgaben einladen',
        inviteToChat: 'Nur zum Chatten einladen',
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
        nothing: 'Nichts für jetzt',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrer vereinigen sich',
        joinExpensifyOrg:
            'Schließen Sie sich Expensify.org an, um Ungerechtigkeit auf der ganzen Welt zu beseitigen. Die aktuelle Kampagne "Teachers Unite" unterstützt Lehrer überall, indem sie die Kosten für wichtige Schulmaterialien aufteilt.',
        iKnowATeacher: 'Ich kenne einen Lehrer.',
        iAmATeacher: 'Ich bin Lehrer.',
        getInTouch: 'Ausgezeichnet! Bitte teilen Sie uns deren Informationen mit, damit wir Kontakt aufnehmen können.',
        introSchoolPrincipal: 'Einführung zu Ihrem Schulleiter',
        schoolPrincipalVerifyExpense:
            'Expensify.org teilt die Kosten für wichtige Schulmaterialien, damit Schüler aus einkommensschwachen Haushalten eine bessere Lernerfahrung haben können. Ihr Schulleiter wird gebeten, Ihre Ausgaben zu überprüfen.',
        principalFirstName: 'Vorname des Hauptansprechpartners',
        principalLastName: 'Nachname des Schulleiters',
        principalWorkEmail: 'Hauptarbeits-E-Mail-Adresse',
        updateYourEmail: 'Aktualisieren Sie Ihre E-Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Bevor Sie fortfahren, stellen Sie bitte sicher, dass Sie Ihre Schul-E-Mail als Ihre Standardkontaktmethode festlegen. Sie können dies unter Einstellungen > Profil > <a href="${contactMethodsRoute}">Kontaktmethoden</a>.`,
        error: {
            enterPhoneEmail: 'Geben Sie eine gültige E-Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'Geben Sie eine E-Mail-Adresse ein',
            enterValidEmail: 'Geben Sie eine gültige E-Mail-Adresse ein',
            tryDifferentEmail: 'Bitte versuchen Sie eine andere E-Mail-Adresse',
        },
    },
    cardTransactions: {
        notActivated: 'Nicht aktiviert',
        outOfPocket: 'Ausgaben aus eigener Tasche',
        companySpend: 'Unternehmensausgaben',
    },
    distance: {
        addStop: 'Stopp hinzufügen',
        deleteWaypoint: 'Wegpunkt löschen',
        deleteWaypointConfirmation: 'Möchten Sie diesen Wegpunkt wirklich löschen?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Starten',
            stop: 'Stopp',
        },
        mapPending: {
            title: 'Ausstehende Karte',
            subtitle: 'Die Karte wird generiert, wenn Sie wieder online sind.',
            onlineSubtitle: 'Einen Moment, während wir die Karte einrichten.',
            errorTitle: 'Kartenfehler',
            errorSubtitle: 'Beim Laden der Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        error: {
            selectSuggestedAddress: 'Bitte wählen Sie eine vorgeschlagene Adresse aus oder verwenden Sie den aktuellen Standort.',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Zeugnis verloren oder beschädigt',
        nextButtonLabel: 'Nächste',
        reasonTitle: 'Warum benötigen Sie eine neue Karte?',
        cardDamaged: 'Meine Karte wurde beschädigt',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte bestätigen Sie die Postadresse für Ihre neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte wird in 2-3 Werktagen ankommen. Ihre aktuelle Karte wird weiterhin funktionieren, bis Sie Ihre neue aktivieren.',
        cardLostOrStolenInfo: 'Ihre aktuelle Karte wird dauerhaft deaktiviert, sobald Ihre Bestellung aufgegeben wird. Die meisten Karten kommen in wenigen Werktagen an.',
        address: 'Adresse',
        deactivateCardButton: 'Karte deaktivieren',
        shipNewCardButton: 'Neue Karte versenden',
        addressError: 'Adresse ist erforderlich',
        reasonError: 'Grund ist erforderlich',
        successTitle: 'Ihre neue Karte ist auf dem Weg!',
        successDescription: 'Sie müssen sie aktivieren, sobald sie in wenigen Werktagen ankommt. In der Zwischenzeit können Sie eine virtuelle Karte verwenden.',
    },
    eReceipt: {
        guaranteed: 'Garantierter eReceipt',
        transactionDate: 'Transaktionsdatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Beginnen Sie einen Chat, <success><strong>empfehlen Sie einen Freund</strong></success>.',
            header: 'Starte einen Chat, empfehle einen Freund weiter',
            body: 'Möchten Sie, dass Ihre Freunde auch Expensify nutzen? Starten Sie einfach einen Chat mit ihnen und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Reichen Sie eine Ausgabe ein, <success><strong>empfehlen Sie Ihr Team</strong></success>.',
            header: 'Reichen Sie eine Ausgabe ein, verweisen Sie auf Ihr Team.',
            body: 'Möchten Sie, dass Ihr Team auch Expensify nutzt? Reichen Sie einfach eine Ausgabe bei ihnen ein und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Einen Freund empfehlen',
            body: 'Möchten Sie, dass Ihre Freunde auch Expensify nutzen? Chatten, bezahlen oder teilen Sie einfach eine Ausgabe mit ihnen und wir kümmern uns um den Rest. Oder teilen Sie einfach Ihren Einladungslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Einen Freund empfehlen',
            header: 'Einen Freund empfehlen',
            body: 'Möchten Sie, dass Ihre Freunde auch Expensify nutzen? Chatten, bezahlen oder teilen Sie einfach eine Ausgabe mit ihnen und wir kümmern uns um den Rest. Oder teilen Sie einfach Ihren Einladungslink!',
        },
        copyReferralLink: 'Einladungslink kopieren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatte mit deinem Setup-Spezialisten in <a href="${href}">${adminReportName}</a> für Hilfe`,
        default: `Nachricht <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> für Hilfe bei der Einrichtung`,
    },
    violations: {
        allTagLevelsRequired: 'Alle Tags erforderlich',
        autoReportedRejectedExpense: 'Diese Ausgabe wurde abgelehnt.',
        billableExpense: 'Abrechnungsfähig nicht mehr gültig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Beleg erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategorie nicht mehr gültig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Angewandte ${surcharge}% Umrechnungsgebühr`,
        customUnitOutOfPolicy: 'Rate für diesen Arbeitsbereich nicht gültig',
        duplicatedTransaction: 'Duplikat',
        fieldRequired: 'Berichtsfelder sind erforderlich',
        futureDate: 'Zukünftiges Datum nicht erlaubt',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Mit ${invoiceMarkup}% aufgeschlagen`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum älter als ${maxAge} Tage`,
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung für die ausgewählte Kategorie erforderlich',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Missing ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Betrag weicht von berechneter Entfernung ab';
                case 'card':
                    return 'Betrag größer als Kartentransaktion';
                default:
                    if (displayPercentVariance) {
                        return `Betrag ${displayPercentVariance}% höher als der gescannte Beleg`;
                    }
                    return 'Betrag größer als gescanntes Beleg';
            }
        },
        modifiedDate: 'Datum weicht vom gescannten Beleg ab',
        nonExpensiworksExpense: 'Nicht-Expensiworks-Ausgabe',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Ausgabe überschreitet die automatische Genehmigungsgrenze von ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Betrag über dem ${formattedLimit}/Personen-Kategorielimit`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über ${formattedLimit}/Fahrtgrenze`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Betrag über dem täglichen ${formattedLimit}/Personen-Kategorielimit`,
        receiptNotSmartScanned: 'Beleg und Ausgabendetails manuell hinzugefügt.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Beleg erforderlich bei Beträgen über dem Kategorielimit von ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Beleg erforderlich über ${formattedLimit}`;
            }
            if (category) {
                return `Beleg erforderlich über dem Kategorienlimit`;
            }
            return 'Beleg erforderlich';
        },
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Verbotene Ausgaben:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `Alkohol`;
                    case 'gambling':
                        return `Glücksspiel`;
                    case 'tobacco':
                        return `Tabak`;
                    case 'adultEntertainment':
                        return `Erwachsenenunterhaltung`;
                    case 'hotelIncidentals':
                        return `Hotelnebenkosten`;
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
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'Überprüfung erforderlich',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Kassenbon kann aufgrund einer unterbrochenen Bankverbindung nicht automatisch zugeordnet werden.';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Bankverbindung unterbrochen. <a href="${companyCardPageURL}">Jetzt wieder verbinden, um den Beleg zuzuordnen</a>`
                    : 'Bankverbindung unterbrochen. Bitte einen Admin bitten, sie wieder zu verbinden, um den Beleg zuzuordnen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin
                    ? `Bitte ${member}, es als Bargeld zu markieren oder 7 Tage zu warten und es erneut zu versuchen.`
                    : 'Warten auf die Zusammenführung mit der Kartentransaktion.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte beheben Sie dies unter <a href="${workspaceCompanyCardRoute}">Firmenkarten</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte bitten Sie einen Workspace-Administrator, das Problem zu lösen.',
        markAsCashToIgnore: 'Als Barzahlung markieren, um zu ignorieren und Zahlung anzufordern.',
        smartscanFailed: ({canEdit = true}) => `Beleg-Scan fehlgeschlagen.${canEdit ? 'Details manuell eingeben.' : ''}`,
        receiptGeneratedWithAI: 'Potentieller KI-generierter Beleg',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Missing ${tagName ?? 'Etikett'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Etikett'} nicht mehr gültig`,
        taxAmountChanged: 'Der Steuerbetrag wurde geändert.',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Steuer'} nicht mehr gültig`,
        taxRateChanged: 'Steuersatz wurde geändert',
        taxRequired: 'Fehlender Steuersatz',
        none: 'Keine',
        taxCodeToKeep: 'Wählen Sie, welchen Steuercode Sie behalten möchten',
        tagToKeep: 'Wählen Sie aus, welches Tag beibehalten werden soll',
        isTransactionReimbursable: 'Wählen Sie, ob die Transaktion erstattungsfähig ist',
        merchantToKeep: 'Wählen Sie, welchen Händler Sie behalten möchten',
        descriptionToKeep: 'Wählen Sie aus, welche Beschreibung beibehalten werden soll.',
        categoryToKeep: 'Wählen Sie, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'Wählen Sie, ob die Transaktion abrechenbar ist',
        keepThisOne: 'Keep this one',
        confirmDetails: `Bestätigen Sie die Details, die Sie behalten.`,
        confirmDuplicatesInfo: `Die Duplikate, die Sie nicht behalten, werden für den Einreicher zum Löschen bereitgehalten.`,
        hold: 'Diese Ausgabe wurde zurückgestellt.',
        resolvedDuplicates: 'den doppelten Eintrag gelöst',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} ist erforderlich`,
    },
    violationDismissal: {
        rter: {
            manual: 'diesen Beleg als Barzahlung markiert',
        },
        duplicatedTransaction: {
            manual: 'den doppelten Eintrag gelöst',
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
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Bevor Sie gehen',
        reasonPage: {
            title: 'Bitte teilen Sie uns mit, warum Sie uns verlassen.',
            subtitle: 'Bevor Sie gehen, teilen Sie uns bitte mit, warum Sie zu Expensify Classic wechseln möchten.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ich benötige eine Funktion, die nur in Expensify Classic verfügbar ist.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ich verstehe nicht, wie man New Expensify benutzt.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ich verstehe, wie man New Expensify benutzt, aber ich bevorzuge Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welche Funktion benötigen Sie, die in New Expensify nicht verfügbar ist?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Was versuchst du zu tun?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Warum bevorzugen Sie Expensify Classic?',
        },
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Danke für das Feedback!',
        thankYouSubtitle: 'Ihre Antworten helfen uns, ein besseres Produkt zu entwickeln, um Dinge zu erledigen. Vielen Dank!',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        offlineTitle: 'Sie scheinen hier festzustecken...',
        offline:
            'Sie scheinen offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber New Expensify schon. Wenn Sie Expensify Classic verwenden möchten, versuchen Sie es erneut, wenn Sie eine Internetverbindung haben.',
        quickTip: 'Kurzer Tipp...',
        quickTipSubTitle: 'Sie können direkt zu Expensify Classic gehen, indem Sie expensify.com besuchen. Setzen Sie ein Lesezeichen, um eine einfache Abkürzung zu haben!',
        bookACall: 'Einen Anruf buchen',
        bookACallTitle: 'Möchten Sie mit einem Produktmanager sprechen?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direktes Chatten über Ausgaben und Berichte',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Fähigkeit, alles auf dem Handy zu erledigen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reisen und Ausgaben mit der Geschwindigkeit des Chats',
        },
        bookACallTextTop: 'Wenn Sie zu Expensify Classic wechseln, verpassen Sie:',
        bookACallTextBottom:
            'Wir würden uns freuen, mit Ihnen einen Anruf zu vereinbaren, um zu verstehen, warum. Sie können einen Anruf mit einem unserer leitenden Produktmanager buchen, um Ihre Bedürfnisse zu besprechen.',
        takeMeToExpensifyClassic: 'Bring mich zu Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Beim Laden weiterer Nachrichten ist ein Fehler aufgetreten.',
        tryAgain: 'Versuchen Sie es erneut.',
    },
    systemMessage: {
        mergedWithCashTransaction: 'einen Beleg mit dieser Transaktion abgeglichen',
    },
    subscription: {
        authenticatePaymentCard: 'Zahlungskarte authentifizieren',
        mobileReducedFunctionalityMessage: 'Sie können Änderungen an Ihrem Abonnement nicht in der mobilen App vornehmen.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Kostenlose Testversion: ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} übrig`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Ihre Zahlungsinformationen sind veraltet.',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Aktualisieren Sie Ihre Zahlungskarte bis zum ${date}, um weiterhin alle Ihre Lieblingsfunktionen nutzen zu können.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Ihre Zahlung konnte nicht verarbeitet werden.',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Ihre Belastung vom ${date} über ${purchaseAmountOwed} konnte nicht verarbeitet werden. Bitte fügen Sie eine Zahlungskarte hinzu, um den fälligen Betrag zu begleichen.`
                        : 'Bitte fügen Sie eine Zahlungskarte hinzu, um den geschuldeten Betrag zu begleichen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Ihre Zahlungsinformationen sind veraltet.',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung bis zum ${date}, um eine Unterbrechung des Dienstes zu vermeiden.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Ihre Zahlungsinformationen sind veraltet.',
                subtitle: 'Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung.',
            },
            billingDisputePending: {
                title: 'Ihre Karte konnte nicht belastet werden.',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Sie haben die Belastung von ${amountOwed} auf der Karte mit der Endung ${cardEnding} angefochten. Ihr Konto wird gesperrt, bis der Streit mit Ihrer Bank geklärt ist.`,
            },
            cardAuthenticationRequired: {
                title: 'Ihre Zahlungskarte wurde nicht vollständig authentifiziert.',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Bitte schließen Sie den Authentifizierungsprozess ab, um Ihre Zahlungskarte mit der Endung ${cardEnding} zu aktivieren.`,
            },
            insufficientFunds: {
                title: 'Ihre Karte konnte nicht belastet werden.',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Ihre Zahlungskarte wurde aufgrund unzureichender Mittel abgelehnt. Bitte versuchen Sie es erneut oder fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpired: {
                title: 'Ihre Karte konnte nicht belastet werden.',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Ihre Zahlungskarte ist abgelaufen. Bitte fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
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
                title: 'Ihre Karte konnte nicht belastet werden.',
                subtitle:
                    'Bevor Sie es erneut versuchen, rufen Sie bitte direkt Ihre Bank an, um Expensify-Gebühren zu autorisieren und eventuelle Sperren zu entfernen. Andernfalls versuchen Sie, eine andere Zahlungskarte hinzuzufügen.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Sie haben die Belastung von ${amountOwed} auf der Karte mit der Endung ${cardEnding} angefochten. Ihr Konto wird gesperrt, bis der Streit mit Ihrer Bank geklärt ist.`,
            preTrial: {
                title: 'Kostenlose Testversion starten',
                subtitleStart: 'Als nächster Schritt,',
                subtitleLink: 'Vervollständigen Sie Ihre Einrichtungsliste',
                subtitleEnd: 'damit Ihr Team mit der Spesenabrechnung beginnen kann.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Testversion: ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} übrig!`,
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um alle Ihre Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            trialEnded: {
                title: 'Ihre kostenlose Testversion ist abgelaufen',
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um alle Ihre Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            earlyDiscount: {
                claimOffer: 'Angebot einlösen',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType}% Rabatt auf Ihr erstes Jahr!</strong> Fügen Sie einfach eine Zahlungsmethode hinzu und beginnen Sie mit einem Jahresabonnement.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Zeitlich begrenztes Angebot: ${discountType}% Rabatt auf Ihr erstes Jahr!`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Einlösen in ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Zahlung',
            subtitle: 'Fügen Sie eine Karte hinzu, um Ihr Expensify-Abonnement zu bezahlen.',
            addCardButton: 'Zahlungskarte hinzufügen',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Ihr nächstes Zahlungsdatum ist ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Karte endet mit ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Name: ${name}, Ablaufdatum: ${expiration}, Währung: ${currency}`,
            changeCard: 'Zahlungskarte ändern',
            changeCurrency: 'Zahlungswährung ändern',
            cardNotFound: 'Keine Zahlungskarte hinzugefügt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'Rückerstattung anfordern',
            requestRefundModal: {
                full: 'Eine Rückerstattung zu erhalten ist einfach: Downgraden Sie einfach Ihr Konto vor Ihrem nächsten Abrechnungsdatum und Sie erhalten eine Rückerstattung. <br /> <br /> Achtung: Wenn Sie Ihr Konto herabstufen, werden Ihre Arbeitsbereiche gelöscht. Diese Aktion kann nicht rückgängig gemacht werden, aber Sie können jederzeit einen neuen Arbeitsbereich erstellen, wenn Sie Ihre Meinung ändern.',
                confirm: 'Arbeitsbereich(e) löschen und herabstufen',
            },
            viewPaymentHistory: 'Zahlungsverlauf anzeigen',
        },
        yourPlan: {
            title: 'Ihr Plan',
            exploreAllPlans: 'Alle Pläne erkunden',
            customPricing: 'Individuelle Preisgestaltung',
            asLowAs: ({price}: YourPlanPriceValueParams) => `ab ${price} pro aktivem Mitglied/Monat`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied/Monat`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied pro Monat`,
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Sammeln',
                description: 'Der Kleinunternehmensplan, der Ihnen Ausgaben, Reisen und Chat bietet.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify-Karte, ${upper}/aktivem Mitglied ohne die Expensify-Karte.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify-Karte, ${upper}/aktivem Mitglied ohne die Expensify-Karte.`,
                benefit1: 'Beleg-Scannen',
                benefit2: 'Erstattungen',
                benefit3: 'Verwaltung von Firmenkreditkarten',
                benefit4: 'Spesen- und Reisegenehmigungen',
                benefit5: 'Reisebuchung und -regeln',
                benefit6: 'QuickBooks/Xero-Integrationen',
                benefit7: 'Chat über Ausgaben, Berichte und Räume',
                benefit8: 'KI- und menschlicher Support',
            },
            control: {
                title: 'Steuerung',
                description: 'Spesen, Reisen und Chat für größere Unternehmen.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify-Karte, ${upper}/aktivem Mitglied ohne die Expensify-Karte.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify-Karte, ${upper}/aktivem Mitglied ohne die Expensify-Karte.`,
                benefit1: 'Alles im Collect-Plan',
                benefit2: 'Genehmigungsabläufe mit mehreren Ebenen',
                benefit3: 'Benutzerdefinierte Ausgabenregeln',
                benefit4: 'ERP-Integrationen (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR-Integrationen (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Benutzerdefinierte Einblicke und Berichterstattung',
                benefit8: 'Budgetierung',
            },
            thisIsYourCurrentPlan: 'Dies ist Ihr aktueller Plan',
            downgrade: 'Herabstufen zu Collect',
            upgrade: 'Upgrade zu Control',
            addMembers: 'Mitglieder hinzufügen',
            saveWithExpensifyTitle: 'Sparen Sie mit der Expensify-Karte',
            saveWithExpensifyDescription: 'Verwenden Sie unseren Sparrechner, um zu sehen, wie das Cashback der Expensify Card Ihre Expensify-Rechnung reduzieren kann.',
            saveWithExpensifyButton: 'Erfahren Sie mehr',
        },
        compareModal: {
            comparePlans: 'Pläne vergleichen',
            subtitle: `<muted-text>Schalten Sie die Funktionen frei, die Sie benötigen, und wählen Sie den für Sie passenden Tarif. <a href="${CONST.PRICING}">Sehen Sie sich unsere Preisseite</a> oder eine vollständige Aufschlüsselung der Funktionen jedes unserer Tarife an.</muted-text>`,
        },
        details: {
            title: 'Abonnementdetails',
            annual: 'Jahresabonnement',
            taxExempt: 'Steuerbefreiungsstatus beantragen',
            taxExemptEnabled: 'Steuerbefreit',
            taxExemptStatus: 'Steuerbefreiungsstatus',
            payPerUse: 'Nutzungsgesteuert',
            subscriptionSize: 'Abonnementgröße',
            headsUp:
                'Achtung: Wenn Sie jetzt nicht die Größe Ihres Abonnements festlegen, setzen wir sie automatisch auf die Anzahl der aktiven Mitglieder Ihres ersten Monats. Sie verpflichten sich dann, für mindestens diese Anzahl von Mitgliedern für die nächsten 12 Monate zu zahlen. Sie können die Größe Ihres Abonnements jederzeit erhöhen, aber nicht verringern, bis Ihr Abonnement abgelaufen ist.',
            zeroCommitment: 'Keine Verpflichtung zum ermäßigten Jahresabonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgröße',
            yourSize: 'Ihre Abonnementgröße ist die Anzahl der offenen Plätze, die in einem bestimmten Monat von jedem aktiven Mitglied besetzt werden können.',
            eachMonth:
                'Jeden Monat deckt Ihr Abonnement bis zu der oben festgelegten Anzahl aktiver Mitglieder ab. Jedes Mal, wenn Sie die Größe Ihres Abonnements erhöhen, beginnen Sie ein neues 12-monatiges Abonnement in dieser neuen Größe.',
            note: 'Hinweis: Ein aktives Mitglied ist jeder, der Ausgabendaten erstellt, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat, die mit dem Arbeitsbereich Ihres Unternehmens verbunden sind.',
            confirmDetails: 'Bestätigen Sie Ihre neuen jährlichen Abonnementdetails:',
            subscriptionSize: 'Abonnementgröße',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktive Mitglieder/Monat`,
            subscriptionRenews: 'Abonnement wird erneuert',
            youCantDowngrade: 'Sie können während Ihres Jahresabonnements nicht herabstufen.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Sie haben sich bereits für ein Jahresabonnement mit einer Größe von ${size} aktiven Mitgliedern pro Monat bis zum ${date} verpflichtet. Sie können am ${date} zu einem nutzungsbasierten Abonnement wechseln, indem Sie die automatische Verlängerung deaktivieren.`,
            error: {
                size: 'Bitte geben Sie eine gültige Abonnementgröße ein.',
                sameSize: 'Bitte geben Sie eine Zahl ein, die sich von Ihrer aktuellen Abonnementgröße unterscheidet.',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzufügen',
            enterPaymentCardDetails: 'Geben Sie Ihre Zahlungsinformationen ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet Verschlüsselung auf Bankniveau und nutzt redundante Infrastruktur, um Ihre Daten zu schützen.',
            learnMoreAboutSecurity: 'Erfahren Sie mehr über unsere Sicherheit.',
        },
        subscriptionSettings: {
            title: 'Abonnementseinstellungen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstyp: ${subscriptionType}, Abonnementgröße: ${subscriptionSize}, Automatische Verlängerung: ${autoRenew}, Automatische jährliche Sitzplatzerhöhung: ${autoIncrease}`,
            none: 'none',
            on: 'on',
            off: 'aus',
            annual: 'Jährlich',
            autoRenew: 'Automatische Verlängerung',
            autoIncrease: 'Automatische jährliche Sitzplatzerhöhung',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Sparen Sie bis zu ${amountWithCurrency}/Monat pro aktivem Mitglied`,
            automaticallyIncrease:
                'Erhöhen Sie automatisch Ihre jährlichen Plätze, um aktive Mitglieder aufzunehmen, die Ihre Abonnementgröße überschreiten. Hinweis: Dies wird das Enddatum Ihres Jahresabonnements verlängern.',
            disableAutoRenew: 'Automatische Verlängerung deaktivieren',
            helpUsImprove: 'Helfen Sie uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund, warum Sie die automatische Verlängerung deaktivieren?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wird am ${date} erneuert.`,
            pricingConfiguration: 'Die Preisgestaltung hängt von der Konfiguration ab. Für den niedrigsten Preis wählen Sie ein Jahresabonnement und erhalten Sie die Expensify Card.',
            learnMore: {
                part1: 'Erfahren Sie mehr auf unserer',
                pricingPage: 'Preisseite',
                part2: 'oder chatten Sie mit unserem Team in Ihrer',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Geschätzter Preis',
            changesBasedOn: 'Dies ändert sich basierend auf Ihrer Expensify Card-Nutzung und den untenstehenden Abonnementoptionen.',
        },
        requestEarlyCancellation: {
            title: 'Frühzeitige Kündigung beantragen',
            subtitle: 'Was ist der Hauptgrund für Ihre vorzeitige Kündigungsanfrage?',
            subscriptionCanceled: {
                title: 'Abonnement storniert',
                subtitle: 'Ihr Jahresabonnement wurde storniert.',
                info: 'Wenn Sie Ihre Arbeitsbereiche weiterhin auf Pay-per-Use-Basis nutzen möchten, sind Sie startklar.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Wenn Sie zukünftige Aktivitäten und Gebühren verhindern möchten, müssen Sie <a href="${workspacesListRoute}">löschen Sie Ihren Arbeitsbereich/Ihre Arbeitsbereiche</a> Beachten Sie, dass Ihnen beim Löschen Ihrer Arbeitsbereiche alle ausstehenden Aktivitäten, die im aktuellen Kalendermonat angefallen sind, in Rechnung gestellt werden.`,
            },
            requestSubmitted: {
                title: 'Anfrage eingereicht',
                subtitle:
                    'Vielen Dank, dass Sie uns mitgeteilt haben, dass Sie Ihr Abonnement kündigen möchten. Wir prüfen Ihre Anfrage und werden uns in Kürze über Ihren Chat mit <concierge-link>Concierge</concierge-link> bei Ihnen melden.',
            },
            acknowledgement: `Indem ich die vorzeitige Kündigung beantrage, erkenne ich an und stimme zu, dass Expensify keine Verpflichtung hat, einem solchen Antrag im Rahmen von Expensify stattzugeben.<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Nutzungsbedingungen</a>oder andere anwendbare Dienstleistungsvereinbarungen zwischen mir und Expensify und dass Expensify das alleinige Ermessen hinsichtlich der Gewährung eines solchen Antrags behält.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funktionalität muss verbessert werden',
        tooExpensive: 'Zu teuer',
        inadequateSupport: 'Unzureichender Kundensupport',
        businessClosing: 'Unternehmen schließt, verkleinert sich oder wurde übernommen',
        additionalInfoTitle: 'Zu welcher Software wechseln Sie und warum?',
        additionalInfoInputLabel: 'Ihre Antwort',
    },
    roomChangeLog: {
        updateRoomDescription: 'setze die Raumbeschreibung auf:',
        clearRoomDescription: 'Raumbeschreibung gelöscht',
        changedRoomAvatar: 'Hat das Raum-Avatar geändert',
        removedRoomAvatar: 'Hat das Raum-Avatar entfernt',
    },
    delegate: {
        switchAccount: 'Konten wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Erlauben Sie anderen Mitgliedern, auf Ihr Konto zuzugreifen.',
        addCopilot: 'Copilot hinzufügen',
        membersCanAccessYourAccount: 'Diese Mitglieder können auf Ihr Konto zugreifen:',
        youCanAccessTheseAccounts: 'Sie können auf diese Konten über den Kontowechsler zugreifen:',
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
        genericError: 'Ups, etwas ist schiefgelaufen. Bitte versuche es erneut.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `im Auftrag von ${delegator}`,
        accessLevel: 'Zugriffsebene',
        confirmCopilot: 'Bestätigen Sie Ihren Copilot unten.',
        accessLevelDescription:
            'Wählen Sie unten eine Zugriffsebene aus. Sowohl Vollzugriff als auch eingeschränkter Zugriff ermöglichen es Co-Piloten, alle Gespräche und Ausgaben einzusehen.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Erlauben Sie einem anderen Mitglied, alle Aktionen in Ihrem Konto in Ihrem Namen durchzuführen. Dazu gehören Chats, Einreichungen, Genehmigungen, Zahlungen, Einstellungen und mehr.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Erlauben Sie einem anderen Mitglied, die meisten Aktionen in Ihrem Konto in Ihrem Namen durchzuführen. Ausgenommen sind Genehmigungen, Zahlungen, Ablehnungen und Sperren.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'Möchten Sie diesen Copilot wirklich entfernen?',
        changeAccessLevel: 'Zugriffsebene ändern',
        makeSureItIsYou: 'Lassen Sie uns sicherstellen, dass Sie es sind',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde, um einen Co-Piloten hinzuzufügen. Er sollte in ein bis zwei Minuten ankommen.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Bitte geben Sie den magischen Code ein, der an ${contactMethod} gesendet wurde, um Ihren Copilot zu aktualisieren.`,
        notAllowed: 'Nicht so schnell...',
        noAccessMessage: dedent(`
            Als Copilot hast du keinen Zugriff auf
            diese Seite. Sorry!
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">Copilot</a> für ${accountOwnerEmail} haben Sie nicht die Erlaubnis, diese Aktion durchzuführen. Entschuldigung!`,
        copilotAccess: 'Copilot-Zugriff',
    },
    debug: {
        debug: 'Debuggen',
        details: 'Einzelheiten',
        JSON: 'JSON',
        reportActions: 'Aktionen',
        reportActionPreview: 'Vorschau',
        nothingToPreview: 'Nichts zur Vorschau',
        editJson: 'Editiere JSON:',
        preview: 'Vorschau:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Fehlendes ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ungültige Eigenschaft: ${propertyName} - Erwartet: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ungültiger Wert - Erwartet: ${expectedValues}`,
        missingValue: 'Fehlender Wert',
        createReportAction: 'Berichtaktion erstellen',
        reportAction: 'Aktion melden',
        report: 'Bericht',
        transaction: 'Transaktion',
        violations: 'Verstöße',
        transactionViolation: 'Transaktionsverstoß',
        hint: 'Datenänderungen werden nicht an das Backend gesendet.',
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
        true: 'wahr',
        false: 'falsch',
        viewReport: 'Bericht anzeigen',
        viewTransaction: 'Transaktion anzeigen',
        createTransactionViolation: 'Transaktionsverstoß erstellen',
        reasonVisibleInLHN: {
            hasDraftComment: 'Hat Entwurfskommentar',
            hasGBR: 'Has GBR',
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
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass der Zuständige die Aktion abschließt.',
            hasChildReportAwaitingAction: 'Hat einen untergeordneten Bericht, der auf eine Aktion wartet',
            hasMissingInvoiceBankAccount: 'Fehlendes Rechnungsbankkonto',
            hasUnresolvedCardFraudAlert: 'Hat eine ungelöste Karten-Fraud-Warnung',
        },
        reasonRBR: {
            hasErrors: 'Hat Fehler in den Berichtsdaten oder Berichtsaktionen',
            hasViolations: 'Hat Verstöße',
            hasTransactionThreadViolations: 'Hat Transaktions-Thread-Verstöße',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Es gibt einen Bericht, der auf eine Aktion wartet.',
            theresAReportWithErrors: 'Es gibt einen Bericht mit Fehlern',
            theresAWorkspaceWithCustomUnitsErrors: 'Es gibt einen Arbeitsbereich mit Fehlern bei benutzerdefinierten Einheiten.',
            theresAProblemWithAWorkspaceMember: 'Es gibt ein Problem mit einem Arbeitsbereichsmitglied.',
            theresAProblemWithAWorkspaceQBOExport: 'Es gab ein Problem mit einer Exporteinstellung der Arbeitsbereichsverbindung.',
            theresAProblemWithAContactMethod: 'Es gibt ein Problem mit einer Kontaktmethode',
            aContactMethodRequiresVerification: 'Eine Kontaktmethode erfordert eine Verifizierung',
            theresAProblemWithAPaymentMethod: 'Es gibt ein Problem mit einer Zahlungsmethode',
            theresAProblemWithAWorkspace: 'Es gibt ein Problem mit einem Arbeitsbereich.',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit Ihrem Erstattungskonto',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit Ihrem Abonnement.',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Ihr Abonnement wurde erfolgreich erneuert.',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Während der Synchronisierung der Workspace-Verbindung ist ein Problem aufgetreten.',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit Ihrem Wallet.',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit den Bedingungen Ihrer Brieftasche.',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Machen Sie eine Probefahrt',
    },
    migratedUserWelcomeModal: {
        title: 'Willkommen bei New Expensify!',
        subtitle: 'Es enthält alles, was du an unserem klassischen Erlebnis liebst, mit einer ganzen Reihe von Verbesserungen, die dein Leben noch einfacher machen:',
        confirmText: "Los geht's!",
        features: {
            chat: 'Chatte zu jeder Ausgabe, um Fragen schnell zu klären',
            search: 'Leistungsstärkere Suche auf Mobilgeräten, im Web und auf dem Desktop',
            concierge: 'Integrierte Concierge-KI zur Automatisierung Ihrer Ausgaben',
        },
        helpText: '2-Minuten-Demo ausprobieren',
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Loslegen <strong>hier!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Benennen Sie Ihre gespeicherten Suchen um</strong> hier!</tooltip>',
        accountSwitcher: '<tooltip>Zugriff auf Ihre <strong>Copilot-Konten</strong> hier</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Möchten Sie sehen, wie Scan funktioniert?</strong> Probieren Sie einen Testbeleg aus!</tooltip>',
            manager: '<tooltip>Wählen Sie unsere <strong>Testmanager</strong>, um es auszuprobieren!</tooltip>',
            confirmation: '<tooltip>Jetzt, <strong>Reichen Sie Ihre Ausgaben ein</strong> und sieh zu, wie die Magie geschieht!</tooltip>',
            tryItOut: 'Probieren Sie es aus',
        },
        outstandingFilter: '<tooltip>Filter für Ausgaben, die <strong>Genehmigung erforderlich</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Diesen Beleg senden an <strong>Beenden Sie die Probefahrt!</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Änderungen verwerfen?',
        body: 'Möchten Sie die vorgenommenen Änderungen wirklich verwerfen?',
        confirmText: 'Änderungen verwerfen',
    },
    scheduledCall: {
        book: {
            title: 'Anruf planen',
            description: 'Finden Sie eine Zeit, die für Sie passt.',
            slots: ({date}: {date: string}) => `<muted-text>Verfügbare Zeiten für <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Anruf bestätigen',
            description:
                'Stellen Sie sicher, dass die unten stehenden Details für Sie in Ordnung sind. Sobald Sie den Anruf bestätigen, senden wir eine Einladung mit weiteren Informationen.',
            setupSpecialist: 'Ihr Einrichtungsspezialist',
            meetingLength: 'Besprechungslänge',
            dateTime: 'Datum & Uhrzeit',
            minutes: '30 Minuten',
        },
        callScheduled: 'Anruf geplant',
    },
    autoSubmitModal: {
        title: 'Alles klar und eingereicht!',
        description: 'Alle Warnungen und Verstöße wurden beseitigt, daher:',
        submittedExpensesTitle: 'Diese Ausgaben wurden eingereicht',
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihren Genehmiger gesendet, können aber noch bearbeitet werden, bis sie genehmigt sind.',
        pendingExpensesTitle: 'Ausstehende Ausgaben wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie gebucht werden.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Machen Sie eine 2-minütige Probefahrt',
        },
        modal: {
            title: 'Probieren Sie uns aus',
            description: 'Machen Sie eine kurze Tour durch das Produkt, um schnell auf den neuesten Stand zu kommen.',
            confirmText: 'Testversion starten',
            helpText: 'Überspringen',
            employee: {
                description:
                    '<muted-text>Holen Sie sich für Ihr Team <strong>3 kostenlose Monate Expensify!</strong> Geben Sie einfach die E-Mail-Adresse Ihres Chefs unten ein und senden Sie ihm eine Testausgabe.</muted-text>',
                email: 'Geben Sie die E-Mail-Adresse Ihres Chefs ein',
                error: 'Dieses Mitglied besitzt einen Arbeitsbereich, bitte geben Sie ein neues Mitglied zum Testen ein.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Sie testen derzeit Expensify',
            readyForTheRealThing: 'Bereit für das echte Ding?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} hat dich eingeladen, Expensify auszuprobieren\nHey! Ich habe uns gerade *3 Monate kostenlos* gesichert, um Expensify auszuprobieren, den schnellsten Weg, um Ausgaben zu verwalten.\n\nHier ist ein *Testbeleg*, um dir zu zeigen, wie es funktioniert:`,
    },
    export: {
        basicExport: 'Basis Export',
        reportLevelExport: 'Alle Daten - Berichtsebene',
        expenseLevelExport: 'Alle Daten - Ausgabenebene',
        exportInProgress: 'Export läuft',
        conciergeWillSend: 'Concierge sendet dir die Datei in Kürze.',
    },
    avatarPage: {
        title: 'Profilbild bearbeiten',
        upload: 'Hochladen',
        uploadPhoto: 'Foto hochladen',
        selectAvatar: 'Avatar auswählen',
        choosePresetAvatar: 'Oder wählen Sie einen eigenen Avatar',
    },
    openAppFailureModal: {
        title: 'Etwas ist schiefgelaufen...',
        subtitle: `Wir konnten nicht alle Ihre Daten laden. Wir wurden benachrichtigt und untersuchen das Problem. Wenn das weiterhin besteht, wenden Sie sich bitte an`,
        refreshAndTryAgain: 'Aktualisieren und erneut versuchen',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Ausgaben hinzufügst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> Ausgaben hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, der Ausgaben hinzufügt.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Keine weiteren Maßnahmen erforderlich!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Es wird darauf gewartet, dass <strong>Sie</strong> ein Bankkonto hinzufügen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> ein Bankkonto hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten, bis ein Admin ein Bankkonto hinzufügt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `am ${eta}` : ` ${eta}`;
                }
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten, bis <strong>Ihre</strong> Ausgaben automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf die automatische Einreichung der Ausgaben von <strong>${actor}</strong>${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass die Ausgaben eines Administrators automatisch eingereicht werden${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>Sie</strong> die Problem(e) beheben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um das/die Problem(e) zu beheben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, um das/die Problem(e) zu beheben.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Es wird darauf gewartet, dass <strong>du</strong> Ausgaben genehmigst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf die Genehmigung der Ausgaben durch <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin die Ausgaben genehmigt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Es wird darauf gewartet, dass <strong>Sie</strong> diesen Bericht exportieren.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> diesen Bericht exportiert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Administrator diesen Bericht exportiert.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>Sie</strong> Ausgaben begleichen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> die Ausgaben bezahlt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten, bis ein Administrator die Ausgaben bezahlt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> die Einrichtung eines Geschäftskontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> die Einrichtung eines Firmenbankkontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin die Einrichtung eines Firmenbankkontos abschließt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `bis ${eta}` : ` ${eta}`;
                }
                return `Warten auf Abschluss der Zahlung${formattedETA}.`;
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'in Kürze',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'später heute',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'am Sonntag',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'am 1. und 16. jedes Monats',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'am letzten Werktag des Monats',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'am letzten Tag des Monats',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'am Ende Ihrer Reise',
        },
    },
    domain: {
        notVerified: 'Nicht verifiziert',
        retry: 'Erneut versuchen',
        verifyDomain: {
            title: 'Domain verifizieren',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Bevor Sie fortfahren, bestätigen Sie, dass Sie <strong>${domainName}</strong> besitzen, indem Sie die DNS-Einstellungen der Domain aktualisieren.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Greifen Sie auf Ihren DNS-Anbieter zu und öffnen Sie die DNS-Einstellungen für <strong>${domainName}</strong>.`,
            addTXTRecord: 'Fügen Sie den folgenden TXT-Eintrag hinzu:',
            saveChanges: 'Speichern Sie die Änderungen und kehren Sie hierher zurück, um Ihre Domain zu verifizieren.',
            youMayNeedToConsult: `Möglicherweise müssen Sie sich an die IT-Abteilung Ihrer Organisation wenden, um die Verifizierung abzuschließen. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Weitere Informationen</a>.`,
            warning: 'Nach der Verifizierung erhalten alle Expensify-Mitglieder in Ihrer Domain eine E-Mail, dass ihr Konto unter Ihrer Domain verwaltet wird.',
            codeFetchError: 'Verifizierungscode konnte nicht abgerufen werden',
            genericError: 'Wir konnten Ihre Domain nicht verifizieren. Bitte versuchen Sie es erneut und wenden Sie sich an Concierge, wenn das Problem weiterhin besteht.',
        },
        domainVerified: {
            title: 'Domain verifiziert',
            header: 'Wooo! Ihre Domain wurde verifiziert',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Die Domain <strong>${domainName}</strong> wurde erfolgreich verifiziert und Sie können jetzt SAML und andere Sicherheitsfunktionen einrichten.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML-Einmalanmeldung (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> ist eine Sicherheitsfunktion, die Ihnen mehr Kontrolle darüber gibt, wie sich Mitglieder mit E-Mail-Adressen unter <strong>${domainName}</strong> bei Expensify anmelden. Um sie zu aktivieren, müssen Sie sich als autorisierte/r Unternehmensadministrator/in verifizieren.</muted-text>`,
            fasterAndEasierLogin: 'Schnelleres und einfacheres Anmelden',
            moreSecurityAndControl: 'Mehr Sicherheit und Kontrolle',
            onePasswordForAnything: 'Ein Passwort für alles',
        },
        goToDomain: 'Zur Domain wechseln',
        samlLogin: {
            title: 'SAML-Anmeldung',
            subtitle: `<muted-text>Konfigurieren Sie die Mitgliederanmeldung mit <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'SAML-Anmeldung aktivieren',
            allowMembers: 'Mitgliedern die Anmeldung mit SAML erlauben.',
            requireSamlLogin: 'SAML-Anmeldung erforderlich',
            anyMemberWillBeRequired: 'Jedes Mitglied, das sich mit einer anderen Methode angemeldet hat, muss sich mithilfe von SAML erneut authentifizieren.',
            enableError: 'Konnte die SAML-Aktivierungseinstellung nicht aktualisieren',
            requireError: 'Die SAML-Anforderungseinstellung konnte nicht aktualisiert werden.',
        },
        samlConfigurationDetails: {
            title: 'SAML-Konfigurationsdetails',
            subtitle: 'Verwenden Sie diese Angaben, um SAML einzurichten.',
            identityProviderMetaData: 'Metadaten des Identitätsanbieters',
            entityID: 'Entitäts-ID',
            nameIDFormat: 'Name-ID-Format',
            loginUrl: 'Anmelde-URL',
            acsUrl: 'ACS-URL (Assertion Consumer Service)',
            logoutUrl: 'Abmelde-URL',
            sloUrl: 'SLO (Single Logout)-URL',
            serviceProviderMetaData: 'Metadaten des Dienstanbieters',
            oktaScimToken: 'Okta SCIM-Token',
            revealToken: 'Token anzeigen',
            fetchError: 'SAML-Konfigurationsdetails konnten nicht abgerufen werden',
            setMetadataGenericError: 'SAML-Metadaten konnten nicht gesetzt werden',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
